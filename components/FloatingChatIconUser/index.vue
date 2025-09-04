<template>
  <view class="floating-chat-icon-user" @click="goToChat">
    <view class="icon-wrapper">
      <image 
        src="https://ccpt.qiniu.0871.cn/duihua2-active.svg" 
        mode="aspectFit" 
        class="chat-icon"
      ></image>
      <!-- 小红点提示 -->
      <view class="red-dot" v-if="hasNewMessage"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FloatingChatIconUser',
  data() {
    return {
      hasNewMessage: true // 控制小红点显示，可以通过props或API动态控制
    }
  },
  methods: {
    goToChat() {
      // 点击后隐藏小红点
      this.hasNewMessage = false;
      
      // 跳转到用户端聊天列表（tab页面）
      uni.switchTab({
        url: '/pages/chat/chat-list',
        fail: (err) => {
          console.error('跳转到聊天列表失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    }
  }
}
</script>

<style scoped>
.floating-chat-icon-user {
  position: fixed;
  right: 20rpx;
  top: 1066rpx;
  transform: translateY(-50%);
  z-index: 999;
  transition: all 0.3s ease;
}

.floating-chat-icon-user:active {
  transform: translateY(-50%) scale(0.95);
}

.icon-wrapper {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(36, 146, 242, 0.4);
  border: 3rpx solid #ffffff;
}

.icon-wrapper::before {
  content: '';
  position: absolute;
  inset: -6rpx;
  background: linear-gradient(45deg, rgba(255,255,255,0.3), transparent, rgba(255,255,255,0.3));
  border-radius: 50%;
  z-index: -1;
  animation: rotate 3s linear infinite;
}

.chat-icon {
  width: 90rpx;
  height: 90rpx;
}

.red-dot {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 20rpx;
  height: 20rpx;
  background: #ff4757;
  border-radius: 50%;
  border: 3rpx solid #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(255, 71, 87, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 悬停效果增强 */
.floating-chat-icon-user:hover .icon-wrapper {
  box-shadow: 0 12rpx 32rpx rgba(36, 146, 242, 0.6);
  transform: translateY(-2rpx);
}
</style>