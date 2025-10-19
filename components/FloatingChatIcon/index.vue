<template>
  <view class="floating-chat-icon" @click="goToChat">
    <view class="icon-wrapper">
      <image 
        src="https://ccpt.qiniu.0871.cn/duihua2-active.svg" 
        mode="aspectFit" 
        class="chat-icon"
      ></image>
      <!-- 未读消息角标 -->
      <view class="badge" v-if="unreadCount > 0">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </view>
    </view>
  </view>
</template>

<script>
import md5 from 'md5';

export default {
  name: 'FloatingChatIcon',
  props: {
    // 跳转路径，默认为riderEnd/chat-list
    targetUrl: {
      type: String,
      default: '/riderEnd/chat-list'
    },
    // 是否为tab页面导航
    isTabPage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      unreadCount: 0, // 未读消息总数
      timer: null // 轮询定时器
    }
  },
  mounted() {
    // 组件挂载时获取未读消息数
    this.fetchUnreadCount();
    // 设置定时轮询，每30秒更新一次
    this.timer = setInterval(() => {
      this.fetchUnreadCount();
    }, 30000);
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    // 获取未读消息数量
    async fetchUnreadCount() {
      try {
        // 从本地存储获取骑手用户信息
        const riderUserInfo = uni.getStorageSync('riderUserInfo');

        // 如果没有登录信息，则不显示角标
        if (!riderUserInfo || !riderUserInfo.id || !riderUserInfo.phone) {
          this.unreadCount = 0;
          return;
        }

        // 生成签名
        const signStr = `service_member_id=${riderUserInfo.id}&phone_number=${riderUserInfo.phone}`;
        const sign = md5(signStr);

        // 请求参数
        const params = {
          service_member_id: riderUserInfo.id,
          sign: sign,
          member_id: riderUserInfo.id
        };

        // 发起请求
        const res = await uni.request({
          url: 'https://ccpt.0871.cn/api/service/member/info',
          method: 'POST',
          data: params,
          header: {
            'Content-Type': 'application/json'
          }
        });

        // 检查响应状态
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const chatUnreadCount = res.data.data.chat_unread_count || [];

          // 统计所有聊天室的未读消息总数
          const totalCount = chatUnreadCount.reduce((sum, item) => {
            return sum + (item.count || 0);
          }, 0);

          this.unreadCount = totalCount;
        } else {
          console.warn('获取未读消息数失败:', res);
        }
      } catch (error) {
        console.error('获取未读消息数异常:', error);
        // 请求失败时不改变当前显示状态
      }
    },

    goToChat() {
      // 根据isTabPage决定使用switchTab还是navigateTo
      const navigationMethod = this.isTabPage ? 'switchTab' : 'navigateTo';

      uni[navigationMethod]({
        url: this.targetUrl,
        success: () => {
          // 跳转成功后重新获取未读数（可能在聊天页面会清零）
          setTimeout(() => {
            this.fetchUnreadCount();
          }, 1000);
        },
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
.floating-chat-icon {
  position: fixed;
  right: 20rpx;
  top: 666rpx;
  transform: translateY(-50%);
  z-index: 999;
  transition: all 0.3s ease;
}

.floating-chat-icon:active {
  transform: translateY(-50%) scale(0.95);
}

.icon-wrapper {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  /* background: linear-gradient(135deg, #2492F2 0%, #1976D2 100%); */
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
  /* filter: brightness(0) invert(1); */
}

.badge {
  position: absolute;
  top: 0rpx;
  right: 0rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  background: #ff4757;
  border-radius: 16rpx;
  border: 3rpx solid #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(255, 71, 87, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: bold;
  color: #ffffff;
  line-height: 1;
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
.floating-chat-icon:hover .icon-wrapper {
  box-shadow: 0 12rpx 32rpx rgba(36, 146, 242, 0.6);
  transform: translateY(-2rpx);
}
</style>
