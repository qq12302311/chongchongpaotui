<template>
  <view class="rider-management">
    <view class="section-header">
      <view class="section-title">骑手端管理</view>
      <view class="section-subtitle">管理骑手端功能和设置</view>
    </view>

    <view class="card-grid">
      <!-- 骑手列表 -->
      <view class="card" @click="navigateTo('riderList')">
        <view class="card-content">
          <view class="card-icon-wrapper rider-color">
            <view class="card-icon rider-list-icon"></view>
          </view>
          <view class="card-info">
            <text class="card-title">骑手列表</text>
            <text class="card-desc">查看和管理平台骑手</text>
          </view>
        </view>
        <view class="card-arrow"></view>
      </view>

      <!-- 服务商列表 -->
      <view v-if="userLevel === 9" class="card" @click="navigateTo('serviceProvider')">
        <view class="card-content">
          <view class="card-icon-wrapper rider-color">
            <view class="card-icon provider-icon"></view>
          </view>
          <view class="card-info">
            <text class="card-title">服务商列表</text>
            <text class="card-desc">管理平台服务商信息</text>
          </view>
        </view>
        <view class="card-arrow"></view>
      </view>

      <!-- 服务区域列表 -->
     <view v-if="userLevel === 9" class="card" @click="navigateTo('serviceZone')">
        <view class="card-content">
          <view class="card-icon-wrapper rider-color">
            <view class="card-icon zone-icon"></view>
          </view>
          <view class="card-info">
            <text class="card-title">服务区域列表</text>
            <text class="card-desc">管理服务区域</text>
          </view>
        </view>
        <view class="card-arrow"></view>
      </view>

      <!-- 提现管理 -->
      <view v-if="userLevel === 9" class="card" @click="navigateTo('withdrawManage')">
        <view class="card-content">
          <view class="card-icon-wrapper rider-color">
            <view class="card-icon withdraw-icon"></view>
          </view>
          <view class="card-info">
            <text class="card-title">提现管理</text>
            <text class="card-desc">管理骑手提现记录</text>
          </view>
        </view>
        <view class="card-arrow"></view>
      </view>

      <!-- 骑手数据分析 -->
      <view class="card" @click="navigateTo('riderAnalysis')">
        <view class="card-content">
          <view class="card-icon-wrapper rider-color">
            <view class="card-icon analysis-icon"></view>
          </view>
          <view class="card-info">
            <text class="card-title">骑手数据分析</text>
            <text class="card-desc">分析骑手行为和数据</text>
          </view>
        </view>
        <view class="card-arrow"></view>
      </view>

    </view>
  </view>
</template>

<script>
export default {
  name: 'RiderManagement',
  data() {
    return {
      riderUserInfo: null,
      userLevel: 0
    }
  },
  mounted() {
    this.getUserInfo();
  },
  methods: {
    // 获取用户信息
    getUserInfo() {
      this.riderUserInfo = uni.getStorageSync('riderUserInfo');
      if (this.riderUserInfo && this.riderUserInfo.level !== undefined) {
        this.userLevel = parseInt(this.riderUserInfo.level) || 0;
        console.log('用户等级:', this.userLevel);
      } else {
        console.log('未获取到用户等级信息');
      }
    },

    // 导航到指定页面
    navigateTo(type) {
      if (type === 'riderList') {
        uni.navigateTo({
          url: '/adminEnd/riderList'
        });
      } else if (type === 'serviceProvider') {
        // 跳转到服务商列表页面
        uni.navigateTo({
          url: '/adminEnd/serviceProviderList'
        });
      } else if (type === 'serviceZone') {
        // 跳转到服务区域列表页面
        uni.navigateTo({
          url: '/adminEnd/serviceZoneList'
        });
      } else if (type === 'withdrawManage') {
        // 跳转到提现管理页面
        uni.navigateTo({
          url: '/adminEnd/withdrawManage/index'
        });
      } else if (type === 'riderAnalysis') {
        // 跳转到骑手数据分析页面
        uni.navigateTo({
          url: '/adminEnd/riderAnalysis/index'
        });
      } else {
        uni.showToast({
          title: '功能开发中',
          icon: 'none'
        });
      }
    },

    // 返回启动页
    goToStartPage() {
      uni.navigateTo({
        url: '/pages/launcher/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.rider-management {
  padding: 20rpx;
}

// 区域标题样式
.section-header {
  margin-bottom: 24rpx;
  padding: 0 30rpx;

  .section-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 6rpx;
    position: relative;
    display: inline-block;

    &::after {
      content: '';
      position: absolute;
      bottom: -6rpx;
      left: 0;
      width: 40rpx;
      height: 4rpx;
      background: linear-gradient(90deg, #6c5ce7, #8258ba);
      border-radius: 4rpx;
    }
  }

  .section-subtitle {
    font-size: 24rpx;
    color: #999;
  }
}

// 卡片网格
.card-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  .card-content {
    display: flex;
    align-items: center;
  }

  .card-icon-wrapper {
    width: 80rpx;
    height: 80rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;

    &.rider-color {
      background: linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(130, 88, 186, 0.2) 100%);
    }
  }

  .card-icon {
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .rider-list-icon {
    &::before, &::after {
      content: '';
      position: absolute;
    }

    &::before {
      width: 30rpx;
      height: 30rpx;
      border: 3rpx solid #6c5ce7;
      border-radius: 50%;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    &::after {
      width: 30rpx;
      height: 15rpx;
      border-left: 3rpx solid #6c5ce7;
      border-right: 3rpx solid #6c5ce7;
      border-bottom: 3rpx solid #6c5ce7;
      border-radius: 0 0 15rpx 15rpx;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .verify-icon {
    &::before {
      content: '';
      position: absolute;
      width: 30rpx;
      height: 20rpx;
      border-left: 3rpx solid #6c5ce7;
      border-bottom: 3rpx solid #6c5ce7;
      transform: rotate(-45deg);
      top: 10rpx;
      left: 5rpx;
    }
  }

  .commission-icon {
    &::before {
      content: '¥';
      position: absolute;
      font-size: 30rpx;
      font-weight: bold;
      color: #6c5ce7;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .provider-icon {
    &::before, &::after {
      content: '';
      position: absolute;
    }

    &::before {
      width: 30rpx;
      height: 20rpx;
      border: 3rpx solid #6c5ce7;
      border-radius: 4rpx;
      top: 5rpx;
      left: 50%;
      transform: translateX(-50%);
    }

    &::after {
      width: 20rpx;
      height: 15rpx;
      border-left: 3rpx solid #6c5ce7;
      border-right: 3rpx solid #6c5ce7;
      border-bottom: 3rpx solid #6c5ce7;
      border-radius: 0 0 4rpx 4rpx;
      bottom: 5rpx;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .card-info {
    display: flex;
    flex-direction: column;
  }

  .card-title {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 6rpx;
  }

  .card-desc {
    font-size: 24rpx;
    color: #999;
  }

  .card-arrow {
    width: 16rpx;
    height: 16rpx;
    border-top: 3rpx solid #ccc;
    border-right: 3rpx solid #ccc;
    transform: rotate(45deg);
  }
}

.start-page-button {
  margin-top: 40rpx;
  height: 90rpx;
  background-color: #fff;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #333;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

// 服务区域图标
.zone-icon {
  &::before, &::after {
    content: '';
    position: absolute;
  }

  &::before {
    width: 30rpx;
    height: 30rpx;
    border: 3rpx solid #6c5ce7;
    border-radius: 50%;
    top: 5rpx;
    left: 50%;
    transform: translateX(-50%);
  }

  &::after {
    width: 3rpx;
    height: 15rpx;
    background-color: #6c5ce7;
    bottom: 5rpx;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: -8rpx -8rpx 0 #6c5ce7, 8rpx -8rpx 0 #6c5ce7;
  }
}

// 提现管理图标
.withdraw-icon {
  &::before, &::after {
    content: '';
    position: absolute;
  }

  &::before {
    width: 30rpx;
    height: 20rpx;
    border: 3rpx solid #6c5ce7;
    border-radius: 4rpx;
    top: 10rpx;
    left: 50%;
    transform: translateX(-50%);
  }

  &::after {
    content: '¥';
    position: absolute;
    font-size: 20rpx;
    font-weight: bold;
    color: #6c5ce7;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

// 数据分析图标
.analysis-icon {
  &::before {
    content: '';
    position: absolute;
    width: 6rpx;
    height: 20rpx;
    background-color: #6c5ce7;
    bottom: 10rpx;
    left: 10rpx;
    border-radius: 3rpx 3rpx 0 0;
  }

  &::after {
    content: '';
    position: absolute;
    width: 6rpx;
    height: 30rpx;
    background-color: #6c5ce7;
    bottom: 10rpx;
    left: 20rpx;
    border-radius: 3rpx 3rpx 0 0;
    box-shadow: 10rpx 0 0 #6c5ce7;
  }
}


</style>
