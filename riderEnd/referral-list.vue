<template>
  <view class="referral-list-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="您推荐的人员列表" title-align="center" :showBackButton="true"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 统计信息 -->
    <view class="stats-card">
      <view class="stats-item">
        <text class="stats-number">{{ totalCount }}</text>
        <text class="stats-label">累计推荐</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-number">¥{{ totalCommission }}</text>
        <text class="stats-label">累计佣金</text>
      </view>
    </view>

    <!-- 推荐人员列表 -->
    <view class="referral-content">
      <!-- 加载中提示 -->
      <view v-if="loading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="referralList.length === 0" class="empty-state">
        <view class="empty-icon">👥</view>
        <text class="empty-text">暂无推荐人员</text>
        <text class="empty-desc">快去分享推荐链接邀请好友加入吧！</text>
      </view>

      <!-- 推荐人员列表内容 -->
      <view v-else class="referral-list">
        <view class="referral-item" v-for="(member, index) in referralList" :key="index">
          <view class="member-avatar">
            <text class="avatar-text">{{ getAvatarText(member.real_name || member.contact_person) }}</text>
          </view>
          <view class="member-info">
            <view class="member-name">
              <text class="name-text">{{ member.real_name || member.contact_person || '未知用户' }}</text>
            </view>
            <view class="member-details">
              <text class="detail-item">手机号：{{ formatPhone(member.phone_number) }}</text>
              <text class="detail-item">注册时间：{{ formatDateTime(member.created_at) }}</text>
            </view>
          </view>
        </view>
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
      loading: false,
      referralList: [],
      totalCount: 0,
      totalCommission: '0.00',
      userInfo: {}
    }
  },
  onLoad() {
    this.loadUserInfo();
    this.getReferralList();
    this.getLedgerData();
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const riderUserInfo = uni.getStorageSync('riderUserInfo') || {};
      this.userInfo = riderUserInfo;
    },

    // 获取推荐人员列表
    async getReferralList() {
      if (this.loading) return;

      this.loading = true;

      try {
        if (!this.userInfo || !this.userInfo.id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        const params = {
          service_member_id: this.userInfo.id,
          sign: "chongchong"
        };

        const res = await this.$request('service/member/referral', params, 'POST');

        if (res.code === 200 || res.status === 'success') {
          const data = res.data || {};
          // 人员数据在 data.data 里
          this.referralList = data.data || [];
          this.totalCount = data.total || this.referralList.length;
        } else {
          uni.showToast({
            title: res.msg || res.message || '获取推荐人员失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('获取推荐人员失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
		  this.loading = false
	  }
    },

    // 获取账本数据
    async getLedgerData() {
      try {
        if (!this.userInfo || !this.userInfo.id) {
          return;
        }

        const timestamp = Date.now();
        const params = {
          service_member_id: this.userInfo.id,
          owner_type: "member",
          timestamp: timestamp,
          sign: "chongchong",
		  owner_id: 1
        };

        const response = await uni.request({
          url: 'https://ccpt.0871.cn/api/service/ledger',
          method: 'POST',
          data: params,
          header: {
            'Content-Type': 'application/json'
          }
        });

        if (response.statusCode === 200 && response.data && response.data.code === 200) {
          const resData = response.data;

          // 计算累计佣金总额，累加所有收入记录
          let commissionTotal = 0;
          if (resData.data.data && Array.isArray(resData.data.data)) {
            resData.data.data.forEach(record => {
              if (record.type === 'income' && record.amount) {
                commissionTotal += parseFloat(record.amount) || 0;
              }
            });
          }

          this.totalCommission = commissionTotal.toFixed(2);

          console.log('账本数据获取成功, 累计佣金:', this.totalCommission);
          console.log('账本原始数据:', resData);
        } else {
          console.error('账本数据获取失败:', response);
        }
      } catch (error) {
        console.error('账本数据请求错误:', error);
      }
    },

    // 获取头像文字
    getAvatarText(name) {
      if (!name) return '?';
      return name.charAt(name.length - 1);
    },



    // 格式化手机号/账号（隐私处理）
    formatPhone(phone) {
      if (!phone) return '未提供';

      const phoneStr = String(phone);
      const length = phoneStr.length;

      if (length <= 3) {
        // 长度太短，全部显示
        return phoneStr;
      } else if (length <= 6) {
        // 短号码：显示前1位，中间用*号，显示后1位
        return phoneStr.charAt(0) + '*'.repeat(length - 2) + phoneStr.charAt(length - 1);
      } else if (length === 11) {
        // 11位手机号：显示前3位，中间5个*，显示后3位
        return phoneStr.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2');
      } else {
        // 其他长度：显示前3位，中间用*号，显示后2位
        const stars = '*'.repeat(Math.max(1, length - 5));
        return phoneStr.substring(0, 3) + stars + phoneStr.substring(length - 2);
      }
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '未知';
      try {
        const date = new Date(dateTime);
        if (isNaN(date.getTime())) {
          return dateTime;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (err) {
        console.error('格式化日期时间失败:', err);
        return dateTime;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.referral-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
}

.stats-card {
  background-color: white;
  margin: 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  .stats-number {
    font-size: 48rpx;
    font-weight: bold;
    color: #2492F2;
    margin-bottom: 8rpx;
  }

  .stats-label {
    font-size: 24rpx;
    color: #999;
  }
}

.stats-divider {
  width: 2rpx;
  height: 60rpx;
  background-color: #e0e0e0;
  margin: 0 40rpx;
}

.referral-content {
  flex: 1;
  padding: 0 20rpx;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid #f3f3f3;
    border-top: 4rpx solid #2492F2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20rpx;
  }

  .loading-text {
    font-size: 28rpx;
    color: #999;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
  }

  .empty-text {
    font-size: 32rpx;
    color: #666;
    margin-bottom: 16rpx;
  }

  .empty-desc {
    font-size: 26rpx;
    color: #999;
    text-align: center;
    line-height: 1.5;
  }
}

.referral-list {
  .referral-item {
    background-color: white;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  }
}

.member-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #2492F2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;

  .avatar-text {
    font-size: 32rpx;
    color: white;
    font-weight: bold;
  }
}

.member-info {
  flex: 1;
  min-width: 0;

  .member-name {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;

    .name-text {
      font-size: 32rpx;
      color: #333;
      font-weight: 500;
    }
  }

  .member-details {
    display: flex;
    flex-direction: column;
    gap: 6rpx;

    .detail-item {
      font-size: 24rpx;
      color: #666;
    }
  }
}
</style>
