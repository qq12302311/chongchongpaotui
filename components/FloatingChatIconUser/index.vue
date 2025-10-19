<template>
  <view 
    class="floating-chat-icon-user" 
    :style="{ right: position.right + 'rpx', top: position.top + 'rpx' }"
    @touchstart.stop="handleTouchStart"
    @touchmove.stop.prevent="handleTouchMove"
    @touchend.stop="handleTouchEnd"
    @click.stop="handleClick"
  >
    <view class="icon-wrapper">
      <image
        src="https://ccpt.qiniu.0871.cn/duihua2-active.svg"
        mode="aspectFit"
        class="chat-icon"
      ></image>
      <!-- 角标数量提示 -->
      <view class="badge" v-if="showBadge">{{ displayUnreadCount }}</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FloatingChatIconUser',
  data() {
    return {
      // 未读消息数量
      unreadCount: 0,
      // 图标位置
      position: {
        right: 20,
        top: 1066
      },
      // 拖拽相关
      startX: 0,
      startY: 0,
      startRight: 0,
      startTop: 0,
      isDragging: false,
      dragStartTime: 0
    }
  },
  computed: {
    // 显示的未读消息数量（超过99显示99+）
    displayUnreadCount() {
      return this.unreadCount > 99 ? '99+' : this.unreadCount;
    },
    // 是否显示角标
    showBadge() {
      return this.unreadCount > 0;
    }
  },
  mounted() {
    // 获取未读消息数量
    this.fetchUnreadCount();
    // 加载保存的位置
    this.loadPosition();
  },
  methods: {
    // 获取用户未读消息数量
    async fetchUnreadCount() {
      try {
        // 从本地存储获取用户信息
        const userInfo = uni.getStorageSync('userInfo');
        if (!userInfo || !userInfo.openid) {
          console.log('用户未登录，无法获取未读消息数量');
          this.unreadCount = 0;
          return;
        }

        // 调用接口获取未读消息数量
        const response = await uni.request({
          url: 'https://ccpt.0871.cn/api/user/create',
          method: 'POST',
          data: {
            openid: userInfo.openid,
            userPhone: userInfo.phone_number || userInfo.userPhone
          }
        });

        // 处理返回数据
        if (response.statusCode === 200 && response.data && response.data.data) {
          const chatUnreadCount = response.data.data.chat_unread_count;
          if (Array.isArray(chatUnreadCount)) {
            // 统计所有房间的未读消息总数
            const totalCount = chatUnreadCount.reduce((sum, item) => {
              return sum + (item.count || 0);
            }, 0);
            this.unreadCount = totalCount;
          } else {
            this.unreadCount = 0;
          }
        }
      } catch (error) {
        console.error('获取未读消息数量失败:', error);
        this.unreadCount = 0;
      }
    },
    goToChat() {
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
    },
    // 触摸开始
    handleTouchStart(e) {
      this.isDragging = false;
      this.dragStartTime = Date.now();
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
      this.startRight = this.position.right;
      this.startTop = this.position.top;
    },
    // 触摸移动
    handleTouchMove(e) {
      const moveX = e.touches[0].clientX - this.startX;
      const moveY = e.touches[0].clientY - this.startY;
      
      // 如果移动距离超过5px，认为是拖拽
      if (Math.abs(moveX) > 5 || Math.abs(moveY) > 5) {
        this.isDragging = true;
      }
      
      if (this.isDragging) {
        // 获取屏幕尺寸
        const systemInfo = uni.getSystemInfoSync();
        const screenWidth = systemInfo.windowWidth;
        const screenHeight = systemInfo.windowHeight;
        
        // px转rpx的比例（假设设计稿是750rpx）
        const pxToRpx = 750 / screenWidth;
        
        // 计算新位置（right 是从右边算的，所以移动方向相反）
        // 将px移动距离转换为rpx
        const moveXRpx = moveX * pxToRpx;
        const moveYRpx = moveY * pxToRpx;
        
        const newRight = this.startRight - moveXRpx;
        const newTop = this.startTop + moveYRpx;
        
        // 图标尺寸（100rpx）
        const iconSize = 100;
        
        // 限制范围，确保图标不会超出屏幕（转换为rpx）
        const screenWidthRpx = screenWidth * pxToRpx;
        const screenHeightRpx = screenHeight * pxToRpx;
        
        this.position.right = Math.max(0, Math.min(newRight, screenWidthRpx - iconSize));
        this.position.top = Math.max(0, Math.min(newTop, screenHeightRpx - iconSize));
      }
    },
    // 触摸结束
    handleTouchEnd(e) {
      // 如果是拖拽，保存位置
      if (this.isDragging) {
        // 保存位置到本地存储
        this.savePosition();
        // 延迟重置拖拽状态，避免触发点击事件
        setTimeout(() => {
          this.isDragging = false;
        }, 100);
      }
      // 点击事件由 handleClick 单独处理
    },
    // 处理点击事件
    handleClick(e) {
      // 只有在非拖拽状态下才执行跳转
      if (!this.isDragging) {
        this.goToChat();
      }
    },
    // 保存位置到本地存储
    savePosition() {
      try {
        uni.setStorageSync('floatingChatIconPosition', {
          right: this.position.right,
          top: this.position.top
        });
      } catch (error) {
        console.error('保存聊天图标位置失败:', error);
      }
    },
    // 从本地存储加载位置
    loadPosition() {
      try {
        const savedPosition = uni.getStorageSync('floatingChatIconPosition');
        if (savedPosition && savedPosition.right !== undefined && savedPosition.top !== undefined) {
          this.position.right = savedPosition.right;
          this.position.top = savedPosition.top;
        }
      } catch (error) {
        console.error('加载聊天图标位置失败:', error);
      }
    }
  }
}
</script>

<style scoped>
.floating-chat-icon-user {
  position: fixed;
  z-index: 999;
  cursor: move;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.floating-chat-icon-user:active {
  opacity: 0.9;
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

.badge {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  min-width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  padding: 0 8rpx;
  background-color: #ff4757;
  color: #ffffff;
  font-size: 20rpx;
  font-weight: bold;
  text-align: center;
  border-radius: 18rpx;
  border: 3rpx solid #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(255, 71, 87, 0.5);
  z-index: 10;
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

/* 移除悬停效果，移动端不需要 */
</style>