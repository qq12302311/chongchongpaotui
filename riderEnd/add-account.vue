<template>
  <view class="add-account-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="添加提现账户" title-align="center" :showBackButton="true"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 选项卡 -->
    <view class="tab-container">
      <view class="tab-item" :class="{ active: currentTab === 'alipay' }" @click="switchTab('alipay')">
        <text>绑定Alipay</text>
      </view>
      <view class="tab-item" :class="{ active: currentTab === 'bank' }" @click="switchTab('bank')">
        <text>绑定银行卡</text>
      </view>
    </view>

    <!-- 安全提示 -->
    <view class="security-tip">
      <view class="tip-icon">🔒</view>
      <text class="tip-text">已保障你的账号安全</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <!-- Alipay表单 -->
      <view v-if="currentTab === 'alipay'" class="form-content">
        <view class="form-item">
          <text class="form-label">Alipay</text>
          <input
            class="form-input"
            type="text"
            v-model="alipayForm.account"
            placeholder="请输入Alipay账号"
          />
        </view>
        <view class="form-item">
          <text class="form-label">真实姓名</text>
          <input
            class="form-input"
            type="text"
            v-model="alipayForm.realName"
            placeholder="请输入账号真实姓名"
          />
        </view>
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input
            class="form-input"
            type="text"
            v-model="alipayForm.phone"
            placeholder="请输入账号手机号"
          />
        </view>
      </view>

      <!-- 银行卡表单 -->
      <view v-else class="form-content">
        <view class="form-item required">
          <text class="form-label">姓名</text>
          <input
            class="form-input"
            type="text"
            v-model="bankForm.name"
            placeholder="请输入姓名"
          />
        </view>
        <view class="form-item required">
          <text class="form-label">开户行</text>
          <input
            class="form-input"
            type="text"
            v-model="bankForm.bankName"
            placeholder="请输入开户行"
          />
        </view>
        <view class="form-item required">
          <text class="form-label">开户省市</text>
          <input
            class="form-input"
            type="text"
            v-model="bankForm.province"
            placeholder="请输入开户省市"
          />
        </view>
        <view class="form-item required">
          <text class="form-label">开户支行</text>
          <input
            class="form-input"
            type="text"
            v-model="bankForm.branch"
            placeholder="请输入开户支行"
          />
        </view>
        <view class="form-item required">
          <text class="form-label">银行卡号</text>
          <input
            class="form-input"
            type="text"
            v-model="bankForm.cardNumber"
            placeholder="请输入银行卡号"
          />
        </view>
        <view class="form-item">
          <text class="form-label long-label">银行预留手机号</text>
          <input
            class="form-input"
            type="text"
            v-model="bankForm.phone"
            placeholder="请输入银行预留手机号"
          />
        </view>
      </view>

      <!-- 温馨提示 -->
      <view class="warm-tip">
        <text class="tip-content">*温馨提示:Alipay账号只用于用户使用钱包功能，平台已采取权威安全技术来确保您的信息安全。</text>
      </view>

      <!-- 立即添加按钮 -->
      <view class="submit-btn" @click="submitForm">
        <text>立即添加</text>
      </view>
    </view>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

export default {
  components: {
    NavBar
  },
  data() {
    return {
      currentTab: 'alipay',
      alipayForm: {
        account: '',
        realName: '',
        phone: ''
      },
      bankForm: {
        name: '',
        bankName: '',
        province: '',
        branch: '',
        cardNumber: '',
        phone: ''
      }
    }
  },
  onLoad(options) {
    // 从URL参数中获取账户类型
    if (options.type && (options.type === 'alipay' || options.type === 'bank')) {
      this.currentTab = options.type;
    }
  },
  methods: {
    switchTab(tab) {
      this.currentTab = tab;
    },

    async submitForm() {
      // 表单验证
      if (!this.validateForm()) {
        return;
      }

      // 准备接口参数
      const params = this.prepareApiParams();

      try {
        uni.showLoading({
          title: '提交中...'
        });

        const res = await this.$request('service/withdraw/create', params, 'POST');

        uni.hideLoading();

        if (res.status === 'success') {
          // 更新本地存储的用户信息
          this.updateUserWithdrawInfo(res.data);

          uni.showToast({
            title: '添加成功',
            icon: 'success'
          });

          // 返回上一页并刷新数据
          setTimeout(() => {
            // 通知上一页刷新数据
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2];
            if (prevPage && prevPage.$vm.loadWithdrawInfo) {
              prevPage.$vm.loadWithdrawInfo();
            }
            uni.navigateBack();
          }, 1500);
        } else {
          uni.showToast({
            title: res.msg || '添加失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('添加提现账户失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    },

    // 表单验证
    validateForm() {
      if (this.currentTab === 'alipay') {
        // Alipay表单验证
        const form = this.alipayForm;
        if (!form.account) {
          uni.showToast({
            title: '请输入Alipay账号',
            icon: 'none'
          });
          return false;
        }
        if (!form.realName) {
          uni.showToast({
            title: '请输入真实姓名',
            icon: 'none'
          });
          return false;
        }
        if (!form.phone) {
          uni.showToast({
            title: '请输入手机号',
            icon: 'none'
          });
          return false;
        }
      } else {
        // 银行卡表单验证
        const form = this.bankForm;
        if (!form.name) {
          uni.showToast({
            title: '请输入姓名',
            icon: 'none'
          });
          return false;
        }
        if (!form.bankName) {
          uni.showToast({
            title: '请输入开户行',
            icon: 'none'
          });
          return false;
        }
        if (!form.province) {
          uni.showToast({
            title: '请输入开户省市',
            icon: 'none'
          });
          return false;
        }
        if (!form.branch) {
          uni.showToast({
            title: '请输入开户支行',
            icon: 'none'
          });
          return false;
        }
        if (!form.cardNumber) {
          uni.showToast({
            title: '请输入银行卡号',
            icon: 'none'
          });
          return false;
        }
      }
      return true;
    },

    // 准备API参数
    prepareApiParams() {
      // 获取用户信息
      const riderUserInfo = uni.getStorageSync('riderUserInfo') || {};

      const baseParams = {
        service_member_id: riderUserInfo.id || '',
        owner_type: 'member',
        owner_id: riderUserInfo.id || '',
        sign: 'chongchong'
      };

      if (this.currentTab === 'alipay') {
        // Alipay参数
        return {
          ...baseParams,
          alipay_id: this.alipayForm.account,
          real_name: this.alipayForm.realName,
          phone_number: this.alipayForm.phone,
          account_holder: '',
          bank_name: '',
          bank_province: '',
          bank_city: '',
          bank_branch: '',
          bank_card_number: '',
          bank_reserved_phone: ''
        };
      } else {
        // 银行卡参数
        return {
          ...baseParams,
          alipay_id: '',
          real_name: '',
          phone_number: '',
          account_holder: this.bankForm.name,
          bank_name: this.bankForm.bankName,
          bank_province: this.bankForm.province,
          bank_city: this.bankForm.province, // 使用省市字段
          bank_branch: this.bankForm.branch,
          bank_card_number: this.bankForm.cardNumber,
          bank_reserved_phone: this.bankForm.phone
        };
      }
    },

    // 更新用户提现信息
    updateUserWithdrawInfo(withdrawData) {
      try {
        // 获取当前用户信息
        const riderUserInfo = uni.getStorageSync('riderUserInfo') || {};

        // 更新提现信息
        riderUserInfo.withdraw_info = withdrawData;

        // 保存回本地存储
        uni.setStorageSync('riderUserInfo', riderUserInfo);

        console.log('用户提现信息已更新:', withdrawData);
      } catch (error) {
        console.error('更新用户提现信息失败:', error);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.add-account-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
}

.tab-container {
  display: flex;
  background-color: white;
  margin: 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  padding: 24rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  background-color: #f8f8f8;

  &.active {
    background-color: #2492F2;
    color: white;
  }
}

.security-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  margin: 20rpx;
  background-color: rgba(36, 146, 242, 0.1);
  border-radius: 8rpx;
}

.tip-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #2492F2;
}

.form-container {
  background-color: white;
  margin: 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &.required .form-label::before {
    content: '*';
    color: #ff4757;
    margin-right: 4rpx;
  }
}

.form-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;

  &.long-label {
    width: 220rpx; /* 增加宽度以容纳较长的标签文字 */
    white-space: nowrap; /* 防止换行 */
  }
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;

  &::placeholder {
    color: #ccc;
  }
}

.warm-tip {
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
}

.tip-content {
  font-size: 22rpx;
  color: #999;
  line-height: 1.5;
}

.submit-btn {
  margin-top: 40rpx;
  background-color: #2492F2;
  color: white;
  text-align: center;
  padding: 28rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;

  &:active {
    opacity: 0.8;
  }
}
</style>
