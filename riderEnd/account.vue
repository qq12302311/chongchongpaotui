<template>
  <view class="account-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="我的账户" title-align="center" :showBackButton="true"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 账户信息卡片 -->
    <view class="account-info-card">
      <view class="account-header">
        <view class="balance-section">
          <view class="balance-title">我的佣金（元）</view>
          <view class="balance-row">
            <view class="balance-amount">{{ riderUserInfo.balance || '0.00' }}</view>
            <view class="today-commission">
              <view class="arrow-left"></view>
              <text>今日佣金¥{{ userInfo.today_commission || '0.00' }}</text>
            </view>
          </view>
        </view>
        <view class="action-buttons">
         <view class="action-btn withdraw-btn" @click="showWithdrawModal">
            <text>提现</text>
          </view>
          <view class="action-btn detail-btn" @click="goToCommissionDetail">
            <text>佣金详情</text>
          </view>
        </view>
      </view>

      <view class="stats-section">
        <view class="stat-item">
          <view class="stat-title">可提现(元)</view>
          <view class="stat-value">{{ userInfo.withdrawable || '0' }}</view>
        </view>
        <view class="stat-item">
          <view class="stat-title">保证金(元)</view>
          <view class="stat-value">{{ userInfo.deposit || '0' }}</view>
        </view>
        <view class="stat-item">
          <view class="stat-title">银行卡(张)</view>
          <view class="stat-value">{{ userInfo.bank_cards || '1' }}</view>
        </view>
      </view>
    </view>

    <!-- 提现记录 -->
    <view class="transaction-section">
      <view class="section-header" @click="toggleTransactionList">
        <text class="section-title">提现记录 ({{ pagination.total }})</text>
        <view class="toggle-icon" :class="{ 'expanded': showTransactions }">
          <text>{{ showTransactions ? '收起' : '展开' }}</text>
        </view>
      </view>

      <view v-if="showTransactions" class="transaction-list">
        <view v-if="transactionList.length === 0" class="empty-state">
          <text>暂无提现记录</text>
        </view>
        <view v-else>
          <view class="transaction-item" v-for="(item, index) in transactionList" :key="index">
            <view class="transaction-icon withdraw">
              <image :src="item.icon" mode="aspectFit"></image>
            </view>
            <view class="transaction-content">
              <view class="transaction-title">{{ item.title }}</view>
              <view class="transaction-time">{{ item.time }}</view>
              <view class="transaction-id">提现单号：{{ item.transaction_no }}</view>
              <view v-if="item.real_name" class="transaction-name">姓名：{{ item.real_name }}</view>
            </view>
            <view class="transaction-amount withdraw">
              <text>{{ item.amount }}</text>
              <view class="transaction-status">{{ item.status }}</view>
              <view v-if="item.fee && item.fee !== '0.00'" class="transaction-fee">手续费：¥{{ item.fee }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 提现弹窗 -->
    <AuthModal
      :show="showWithdrawDialog"
      title="提示"
      content="请添加提现账户才能正常使用！"
      cancelText="取消"
      confirmText="去添加"
      @cancel="closeWithdrawModal"
      @confirm="goToAddAccount"
    />

    <!-- 悬浮聊天图标 -->
    <FloatingChatIcon />
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import AuthModal from '@/components/AuthModal/index.vue'
import FloatingChatIcon from '@/components/FloatingChatIcon/index.vue'
import md5 from 'md5'

export default {
  components: {
    NavBar,
    AuthModal,
    FloatingChatIcon
  },
  data() {
    return {
      userInfo: {},
      riderUserInfo: {},
      showTransactions: true, // 默认打开交易详情
      showWithdrawDialog: false, // 提现弹窗状态
      transactionList: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15
      },
      isProvider: false, // 是否为服务商
      memberData: null, // 骑手数据
      providerData: null // 服务商数据
    }
  },
  async onShow() {
    await this.loadUserInfo();
    this.loadWithdrawAccount();
    this.loadAccountData();
  },
  methods: {
    async loadUserInfo() {
      try {
        // 从缓存获取id和phone用于生成签名
        const cachedInfo = uni.getStorageSync('riderUserInfo') || {};
        const riderId = cachedInfo.id;
        const riderPhone = cachedInfo.phone;

        if (!riderId || !riderPhone) {
          console.error('缺少骑手id或phone，无法请求接口');
          return;
        }

        // 生成签名
        const signStr = `service_member_id=${riderId}&phone_number=${riderPhone}`;
        const sign = md5(signStr);

        // 发起请求
        const res = await uni.request({
          url: 'https://ccpt.cc111.cn/api/service/member/info',
          method: 'POST',
          data: {
            service_member_id: riderId,
            sign: sign,
            member_id: riderId
          },
          header: {
            'Content-Type': 'application/json'
          }
        });

        const resData = res[1] || res;
        // console.log('骑手信息接口完整返回:', JSON.stringify(resData.data));
        if (resData.statusCode === 200 && resData.data) {
          const responseData = resData.data.data || resData.data;
          // console.log('解析后的骑手数据:', JSON.stringify(responseData));
          // 保留缓存中的id和phone，合并接口返回的最新数据
          this.riderUserInfo = { id: riderId, phone: riderPhone, ...responseData };
          this.userInfo = { id: riderId, phone: riderPhone, ...responseData };
          // 同步更新本地缓存
          uni.setStorageSync('riderUserInfo', this.riderUserInfo);
          // console.log('最终riderUserInfo:', JSON.stringify(this.riderUserInfo));
        } else {
          console.error('获取骑手信息接口返回异常:', resData);
        }
      } catch (error) {
        console.error('请求骑手信息接口失败:', error);
      }
    },

    // 加载提现账户信息
    async loadWithdrawAccount() {
      try {
        // 确保有用户信息
        if (!this.riderUserInfo.id) {
          console.error('用户信息不完整');
          return;
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const params = {
          service_member_id: this.riderUserInfo.id,
          sign: 'chongchong',
          timestamp: timestamp
        };

        const res = await this.$request('withdraw/account', params, 'POST');

        if (res.status === 'success') {
          // 处理返回的数据数组
          if (res.data && Array.isArray(res.data)) {
            // 查找member类型的数据（骑手账户信息）
            this.memberData = res.data.find(item => item.type === 'member');

            // 查找provider类型的数据（服务商信息）
            this.providerData = res.data.find(item => item.type === 'provider');

            // 判断用户类型：如果有provider数据，则为服务商
            this.isProvider = !!this.providerData;

            // 根据用户类型更新用户信息
            if (this.isProvider && this.providerData) {
              // 服务商使用provider数据
              this.userInfo = {
                ...this.userInfo,
                account_name: this.providerData.name,
                account_id: this.providerData.id,
                account_type: 'provider'
              };
            } else if (this.memberData) {
              // 普通骑手使用member数据
              this.userInfo = {
                ...this.userInfo,
                account_name: this.memberData.name,
                account_id: this.memberData.id,
                account_type: 'member'
              };
            }

            // 保存账户信息到本地存储，供提现页面使用
            const accountInfo = {
              isProvider: this.isProvider,
              memberData: this.memberData,
              providerData: this.providerData,
              account_type: this.isProvider ? 'provider' : 'member',
              account_id: this.isProvider ? this.providerData?.id : this.memberData?.id,
              account_name: this.isProvider ? this.providerData?.name : this.memberData?.name
            };

            // 更新本地存储的用户信息，但保持原有的balance不变
            const updatedRiderUserInfo = {
              ...this.riderUserInfo,
              // 只更新账户相关信息，不覆盖balance
              account_name: this.userInfo.account_name,
              account_id: this.userInfo.account_id,
              account_type: this.userInfo.account_type,
              withdraw_account_info: accountInfo
            };

            uni.setStorageSync('riderUserInfo', updatedRiderUserInfo);
            this.riderUserInfo = updatedRiderUserInfo;

            console.log('用户类型:', this.isProvider ? '服务商' : '骑手');
            console.log('保存的账户信息:', accountInfo);
          }
        } else {
          console.error('获取提现账户信息失败:', res.msg || res.message);
        }
      } catch (error) {
        console.error('加载提现账户信息失败:', error);
      }
    },

    // 加载账户数据
    async loadAccountData() {
      try {
        // 确保有用户信息
        if (!this.riderUserInfo.id) {
          console.error('用户信息不完整');
          return;
        }

        uni.showLoading({
          title: '加载中...'
        });

        const timestamp = Math.floor(Date.now() / 1000);

        // 根据用户类型设置参数
        const ownerType = this.userInfo.account_type || 'member';
        const ownerId = this.userInfo.account_id || this.riderUserInfo.id;

        const params = {
          service_member_id: this.riderUserInfo.id,
          owner_type: ownerType,
          owner_id: ownerId,
          sign: 'chongchong',
          timestamp: timestamp
        };

        const res = await this.$request('withdraw/owner/list', params, 'POST');

        uni.hideLoading();

        if (res.status === 'success') {
          // 处理分页数据
          if (res.data.data && Array.isArray(res.data.data)) {
            // 将提现记录转换为交易列表格式
            this.transactionList = res.data.data.map(item => {
              return {
                id: item.id,
                type: 'withdraw',
                icon: item.payment_method === 'alipay'
                  ? 'https://ccpt.qiniu.cc111.cn/rider/alipay.svg'
                  : 'https://ccpt.qiniu.cc111.cn/rider/bank.svg',
                title: `提现-到${item.payment_method === 'alipay' ? '支付宝' : '银行卡'}`,
                time: this.formatDateTime(item.created_at),
                amount: `-${item.amount}`,
                status: this.getStatusText(item.status),
                real_name: item.real_name,
                phone: item.phone,
                transaction_no: item.transaction_no || item.id,
                actual_amount: item.actual_amount,
                fee: item.fee
              };
            });

            // 更新分页信息
            this.pagination = {
              current_page: res.data.current_page,
              last_page: res.data.last_page,
              total: res.data.total,
              per_page: res.data.per_page
            };
          }
        } else {
          console.error('获取提现记录失败:', res.msg || res.message);
        }
      } catch (error) {
        uni.hideLoading();
        console.error('加载账户数据失败:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    },

    toggleTransactionList() {
      this.showTransactions = !this.showTransactions;
    },

    // 显示提现弹窗或跳转编辑页面
    showWithdrawModal() {
      // 获取用户信息
      const riderUserInfo = uni.getStorageSync('riderUserInfo') || {};

      if (riderUserInfo.withdraw_info && riderUserInfo.withdraw_info.id) {
        // 已有提现账户，跳转到提现页面
        uni.navigateTo({
          url: '/riderEnd/withdraw'
        });
      } else {
        // 没有提现账户，显示弹窗
        this.showWithdrawDialog = true;
      }
    },

    // 关闭提现弹窗
    closeWithdrawModal() {
      this.showWithdrawDialog = false;
    },

    // 跳转到添加提现账户页面
    goToAddAccount() {
      this.showWithdrawDialog = false;
      uni.navigateTo({
        url: '/riderEnd/add-account'
      });
    },

    // 跳转到佣金详情页面
    goToCommissionDetail() {
      uni.navigateTo({
        url: '/riderEnd/commission-detail'
      });
    },

    // 格式化日期时间
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '';
      const date = new Date(dateTimeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'pending': '处理中',
        'processing': '处理中',
        'completed': '已完成',
        'success': '已完成',
        'failed': '失败',
        'rejected': '已拒绝',
        'cancelled': '已取消'
      };
      return statusMap[status] || status;
    }
  }
}
</script>

<style lang="scss" scoped>
.account-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
}

.account-info-card {
  background-image: url('https://ccpt.qiniu.cc111.cn/rider/my/account_back.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  color: white;
  position: relative;
  overflow: hidden;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30rpx;
}

.balance-section {
  flex: 1;
}

.balance-title {
  font-size: 28rpx;
  opacity: 0.9;
  margin-bottom: 10rpx;
}

.balance-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.balance-amount {
  font-size: 64rpx;
  font-weight: bold;
}

.today-commission {
  font-size: 24rpx;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6rpx 12rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.arrow-left {
  width: 0;
  height: 0;
  border-top: 8rpx solid transparent;
  border-bottom: 8rpx solid transparent;
  border-right: 12rpx solid rgba(255, 255, 255, 0.8);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.action-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 24rpx;
  padding: 12rpx 24rpx;
  text-align: center;
  font-size: 24rpx;
  min-width: 120rpx;
}

.stats-section {
  display: flex;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  padding: 20rpx;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-title {
  font-size: 24rpx;
  opacity: 0.8;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
}

.transaction-section {
  background-color: white;
  margin: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.toggle-icon {
  font-size: 24rpx;
  color: #2492F2;
  padding: 8rpx 16rpx;
  background-color: rgba(36, 146, 242, 0.1);
  border-radius: 20rpx;
}

.transaction-list {
  padding: 0 30rpx 30rpx;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.transaction-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;

  &.income {
    background-color: rgba(255, 193, 7, 0.1);
  }

  &.expense {
    background-color: rgba(0, 123, 255, 0.1);
  }

  &.withdraw {
    background-color: rgba(36, 146, 242, 0.1);
  }

  image {
    width: 50rpx;
    height: 50rpx;
  }
}

.transaction-content {
  flex: 1;
}

.transaction-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 6rpx;
}

.transaction-time {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 6rpx;
}

.transaction-id {
  font-size: 22rpx;
  color: #ccc;
  margin-bottom: 4rpx;
}

.transaction-name {
  font-size: 22rpx;
  color: #666;
}

.transaction-amount {
  text-align: right;

  text {
    font-size: 32rpx;
    font-weight: bold;
  }

  &.income text {
    color: #FFC107;
  }

  &.expense text {
    color: #007BFF;
  }

  &.withdraw text {
    color: #ff4d4f;
  }
}

.transaction-status {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.transaction-fee {
  font-size: 20rpx;
  color: #ff4d4f;
  margin-top: 2rpx;
}

.empty-state {
  padding: 60rpx 20rpx;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}


</style>
