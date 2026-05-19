<template>
  <view class="tab-bar-container">
    <view class="tab-bar">
      <view class="tab-item" :class="{ active: activeTab === 'hall' }" @click="switchTab('hall')">
        <image :src="activeTab === 'hall' ? 'https://ccpt.qiniu.cc111.cn/home-active.svg' : 'https://ccpt.qiniu.cc111.cn/home2.svg'" mode="aspectFit" class="tab-icon"></image>
        <text class="tab-text">工单中心</text>
      </view>
      <!-- <view class="tab-item" :class="{ active: activeTab === 'order' }" @click="switchTab('order')">
        <image :src="activeTab === 'order' ? 'https://ccpt.qiniu.cc111.cn/order-active.svg' : 'https://ccpt.qiniu.cc111.cn/order.svg'" mode="aspectFit" class="tab-icon"></image>
        <text class="tab-text">订单</text>
      </view> -->
      <view class="tab-item" :class="{ active: activeTab === 'sj' }" @click="switchTab('sj')">
        <image :src="activeTab === 'sj' ? 'https://ccpt.qiniu.cc111.cn/duihua2-active.svg' : 'https://ccpt.qiniu.cc111.cn/duihua2.svg'" mode="aspectFit" class="tab-icon"></image>
        <text class="tab-text">商机</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'chat' }" @click="switchTab('chat')">
        <image :src="activeTab === 'chat' ? 'https://ccpt.qiniu.cc111.cn/duihua2-active.svg' : 'https://ccpt.qiniu.cc111.cn/duihua2.svg'" mode="aspectFit" class="tab-icon"></image>
        <text class="tab-text">对话</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'my' }" @click="switchTab('my')">
        <image :src="activeTab === 'my' ? 'https://ccpt.qiniu.cc111.cn/my-active.svg' : 'https://ccpt.qiniu.cc111.cn/my.svg'" mode="aspectFit" class="tab-icon"></image>
        <text class="tab-text">我的</text>
      </view>
    </view>
    <!-- 添加安全区域 -->
    <view class="safe-area"></view>
  </view>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    activeTab: {
      type: String,
      default: 'hall'
    }
  },
  methods: {
    switchTab(tab) {
      if (tab === this.activeTab) return;

      let url = '';
      switch (tab) {
        case 'hall':
          url = '/riderEnd/index';
          break;
        case 'order':
          url = '/riderEnd/order';
          break;
        case 'sj':
          url = '/riderEnd/sj';
          break;
        case 'chat':
          url = '/riderEnd/chat-list';
          break;
        case 'my':
          url = '/riderEnd/my';
          break;
      }

      if (url) {
        uni.redirectTo({ url });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-bar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.tab-bar {
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1rpx solid #eee;
  padding: 0 40rpx;
  box-sizing: border-box;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;

    .tab-icon {
      width: 44rpx;
      height: 44rpx;
      margin-bottom: 6rpx;
    }

    .tab-text {
      font-size: 24rpx;
      color: #999;
    }

    &.active {
      .tab-text {
        color: #2492F2;
      }
    }
  }
}

.safe-area {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
  background-color: #fff;
  width: 100%;
}
</style>