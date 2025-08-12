<template>
  <view class="tab-bar">
    <view
      class="tab-item"
      :class="{ active: currentPage === 'home' }"
      @click="switchTab('home')"
    >
      <view class="tab-icon home-icon" :class="{ 'active-icon': currentPage === 'home' }"></view>
      <text class="tab-text" :class="{ 'active-text': currentPage === 'home' }">首页</text>
    </view>
    <view
      class="tab-item"
      :class="{ active: currentPage === 'user' }"
      @click="switchTab('user')"
    >
      <view class="tab-icon user-tab-icon" :class="{ 'active-icon': currentPage === 'user' }"></view>
      <text class="tab-text" :class="{ 'active-text': currentPage === 'user' }">用户端</text>
    </view>
    <view
      class="tab-item"
      :class="{ active: currentPage === 'rider' }"
      @click="switchTab('rider')"
    >
      <view class="tab-icon rider-tab-icon" :class="{ 'active-icon': currentPage === 'rider' }"></view>
      <text class="tab-text" :class="{ 'active-text': currentPage === 'rider' }">骑手端</text>
    </view>
    <view
      class="tab-item"
      :class="{ active: currentPage === 'order' }"
      @click="switchTab('order')"
    >
      <view class="tab-icon order-tab-icon" :class="{ 'active-icon': currentPage === 'order' }"></view>
      <text class="tab-text" :class="{ 'active-text': currentPage === 'order' }">订单管理</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    // 当前选中的页面
    currentPage: {
      type: String,
      default: 'home'
    }
  },
  methods: {
    // 切换标签页
    switchTab(page) {
      // 如果点击的是当前页面，不做任何操作
      if (this.currentPage === page) return;

      // 触发事件，通知父组件切换页面
      this.$emit('change', page);
    }
  }
}
</script>

<style lang="scss" scoped>
// 底部导航栏样式
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110rpx;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
  border-top: 1rpx solid rgba(0, 0, 0, 0.03);
  padding-bottom: env(safe-area-inset-bottom);
  /* 添加安全区域的背景色 */
  &::after {
    content: '';
    position: absolute;
    bottom: calc(-1 * env(safe-area-inset-bottom));
    left: 0;
    right: 0;
    height: env(safe-area-inset-bottom);
    background-color: #fff;
    z-index: -1;
  }

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10rpx 0;
    position: relative;

    &.active {
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background: linear-gradient(90deg, #4481eb, #04befe);
        border-radius: 4rpx;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 60rpx;
        background-color: rgba(4, 190, 254, 0.05);
        border-radius: 50%;
        z-index: -1;
      }
    }
  }

  .tab-icon {
    width: 48rpx;
    height: 48rpx;
    margin-bottom: 8rpx;
    position: relative;
    opacity: 0.6;
    transition: all 0.3s ease;

    &.active-icon {
      opacity: 1;

      &::before, &::after {
        border-color: #4481eb !important;
        background-color: #4481eb !important;
      }
    }
  }

  .home-icon {
    &::before {
      content: '';
      position: absolute;
      width: 36rpx;
      height: 30rpx;
      border: 3rpx solid #666;
      border-top: none;
      border-radius: 0 0 6rpx 6rpx;
      bottom: 6rpx;
      left: 50%;
      transform: translateX(-50%);
    }

    &::after {
      content: '';
      position: absolute;
      width: 30rpx;
      height: 20rpx;
      background-color: transparent;
      border-left: 3rpx solid #666;
      border-right: 3rpx solid #666;
      border-top: 3rpx solid #666;
      border-radius: 6rpx 6rpx 0 0;
      top: 6rpx;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .user-tab-icon {
    &::before {
      content: '';
      position: absolute;
      width: 20rpx;
      height: 20rpx;
      background-color: #666;
      border-radius: 50%;
      top: 6rpx;
      left: 50%;
      transform: translateX(-50%);
    }

    &::after {
      content: '';
      position: absolute;
      width: 36rpx;
      height: 18rpx;
      background-color: #666;
      border-radius: 36rpx 36rpx 0 0;
      bottom: 6rpx;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .rider-tab-icon {
    &::before {
      content: '';
      position: absolute;
      width: 36rpx;
      height: 18rpx;
      border: 3rpx solid #666;
      border-radius: 3rpx;
      top: 8rpx;
      left: 50%;
      transform: translateX(-50%);
    }

    &::after {
      content: '';
      position: absolute;
      width: 20rpx;
      height: 14rpx;
      border-left: 3rpx solid #666;
      border-right: 3rpx solid #666;
      border-bottom: 3rpx solid #666;
      border-radius: 0 0 3rpx 3rpx;
      bottom: 8rpx;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .order-tab-icon {
    &::before {
      content: '';
      position: absolute;
      width: 32rpx;
      height: 40rpx;
      border: 3rpx solid #666;
      border-radius: 6rpx;
      top: 4rpx;
      left: 50%;
      transform: translateX(-50%);
    }

    &::after {
      content: '';
      position: absolute;
      width: 16rpx;
      height: 3rpx;
      background-color: #666;
      top: 16rpx;
      left: 50%;
      transform: translateX(-50%);
      box-shadow: 0 8rpx 0 #666, 0 16rpx 0 #666;
    }
  }

  .tab-text {
    font-size: 22rpx;
    color: #999;
    transition: all 0.3s ease;
    letter-spacing: 1rpx;

    &.active-text {
      color: #4481eb;
      font-weight: 500;
      font-size: 24rpx;
    }
  }
}
</style>
