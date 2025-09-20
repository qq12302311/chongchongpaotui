<template>
  <view 
    class="floating-image"
    :style="{ right: position.x + 'px', bottom: position.y + 'px' }"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- <image :src="imageSrc" mode="aspectFit"></image> -->
    <!-- <image src="https://ccpt.qiniu.0871.cn/gwc-1.png" mode="aspectFit"></image> -->
		<!-- <image @click="goToCart" class="img-3" src="https://ccpt.qiniu.0871.cn/gwc-gwc2.svg" mode="aspectFit"></image>
		<image @click="goToChat" class="img-4" src="https://ccpt.qiniu.0871.cn/duihua2-active.svg" mode="aspectFit"></image> -->
		<image @click="handleClick" class="img-2" src="https://ccpt.qiniu.0871.cn/tjyj-gwc.svg" mode="aspectFit"></image>
  </view>
</template>

<script>
export default {
  name: 'FloatingImage',
  props: {
    // 图片地址
    imageSrc: {
      type: String,
      default: 'https://ccpt.qiniu.0871.cn/tuijian.png'
    },
    // 点击跳转的页面路径
    targetUrl: {
      type: String,
      default: '/pages/my/my'
    },
    // 是否自动打开分享推荐弹窗
    autoOpenShare: {
      type: Boolean,
      default: true
    },
    // 自定义点击事件
    customClick: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      // 悬浮组件位置
      position: {
        x: 10, // right距离
        y: 105 // bottom距离
      },
      // 拖拽状态
      dragging: false,
      // 屏幕尺寸
      screenSize: {
        width: 0,
        height: 0
      }
    }
  },
  mounted() {
    // 获取屏幕尺寸
    const systemInfo = uni.getSystemInfoSync();
    this.screenSize.width = systemInfo.screenWidth;
    this.screenSize.height = systemInfo.screenHeight;
    
    // 从本地存储恢复位置
    const savedPosition = uni.getStorageSync('floating_image_position');
    if (savedPosition) {
      this.position = savedPosition;
    } else {
      // 设置默认位置（考虑安全区域）
      this.position.y = 105 + (systemInfo.safeAreaInsets ? systemInfo.safeAreaInsets.bottom : 0);
    }
  },
  methods: {
    // 触摸开始
    onTouchStart(e) {
      this.dragging = true;
      // 防止触发点击事件
      e.preventDefault();
    },
    
    // 触摸移动
    onTouchMove(e) {
      if (!this.dragging) return;
      
      const touch = e.touches[0];
      // 修正坐标计算：right位置应该是屏幕宽度减去touch.clientX
      // bottom位置应该是屏幕高度减去touch.clientY
      const newX = this.screenSize.width - touch.clientX - 50; // 50px为组件宽度的一半，保持中心对齐
      const newY = this.screenSize.height - touch.clientY - 72; // 72px为组件高度的一半
      
      // 边界限制
      const componentWidth = 50; // 100rpx ≈ 50px
      const componentHeight = 145; // 290rpx ≈ 145px
      const safeAreaBottom = 100; // 底部安全区域
      
      // 限制在屏幕范围内，确保组件完全可见
      const limitedX = Math.max(10, Math.min(newX, this.screenSize.width - componentWidth - 10));
      const limitedY = Math.max(10, Math.min(newY, this.screenSize.height - componentHeight - safeAreaBottom));
      
      this.position.x = limitedX;
      this.position.y = limitedY;
      
      // 防止页面滚动
      e.preventDefault();
    },
    
    // 触摸结束
    onTouchEnd(e) {
      if (!this.dragging) return;
      
      this.dragging = false;
      
      // 保存位置到本地存储
      uni.setStorageSync('floating_image_position', this.position);
    },
    
	  goToCart(){
		  if (this.dragging) return; // 拖拽时不触发点击事件
		  
		  uni.navigateTo({
			url: '/pages/cart/index',
			fail: (err) => {
			  console.error('跳转到购物车:', err);
			  uni.showToast({
				title: '跳转失败',
				icon: 'none'
			  });
			}
		  });
	  },
    goToChat() {
      if (this.dragging) return; // 拖拽时不触发点击事件
      
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
    },
    handleClick() {
      if (this.dragging) return; // 拖拽时不触发点击事件
      
      // console.log('点击悬浮小图');

      // 发射点击事件
      this.$emit('click');

      // 如果有自定义点击事件，优先执行自定义事件
      if (this.customClick && typeof this.customClick === 'function') {
        console.log('执行自定义点击事件');
        try {
          this.customClick();
        } catch (error) {
          console.error('执行自定义点击事件失败:', error);
        }
        return;
      }

      // 默认行为：跳转到指定页面
      if (this.targetUrl === '/pages/my/my' && this.autoOpenShare) {
        // 跳转到我的页面并自动打开分享推荐弹窗
        uni.switchTab({
          url: this.targetUrl,
          success: () => {
            // 延迟一下确保页面加载完成，然后触发分享推荐弹窗
            setTimeout(() => {
              // 通过事件总线通知我的页面打开分享推荐弹窗
              uni.$emit('openShareModal');
            }, 300);
          },
          fail: (err) => {
            console.error('跳转到我的页面失败:', err);
            uni.showToast({
              title: '跳转失败',
              icon: 'none'
            });
          }
        });
      } else {
        // 普通页面跳转
        if (this.targetUrl.startsWith('/pages/')) {
          // 判断是否为tabBar页面
          const tabBarPages = ['/pages/index/index', '/pages/order/index', '/pages/my/my'];
          if (tabBarPages.includes(this.targetUrl)) {
            uni.switchTab({
              url: this.targetUrl,
              fail: (err) => {
                console.error('跳转失败:', err);
                uni.showToast({
                  title: '跳转失败',
                  icon: 'none'
                });
              }
            });
          } else {
            uni.navigateTo({
              url: this.targetUrl,
              fail: (err) => {
                console.error('跳转失败:', err);
                uni.showToast({
                  title: '跳转失败',
                  icon: 'none'
                });
              }
            });
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 悬浮小图样式
.floating-image {
	// background-image: url('https://ccpt.qiniu.0871.cn/gwc-1.png');
	background-size: cover;
  position: fixed;
  // 移除固定的 right 和 bottom，改为动态设置
  width: 130rpx;
  height: 150rpx;
  z-index: 999;
  transition: none; // 移除过渡动画，提高拖拽响应性
  
  // 增强拖拽相关样式
  touch-action: none; // 禁用浏览器默认触摸行为
  user-select: none; // 防止选择文本
  cursor: move; // 显示移动光标
  
  // 拖拽时的视觉反馈
  &:active {
    transform: scale(1.05);
    opacity: 0.9;
  }

  .img-2 {
    width: 140rpx;
    height: 170rpx;
    pointer-events: auto; // 确保图片可点击
    &:active {
      transform: scale(0.95);
    }
  }

  .img-3 {
    width: 100rpx;
    height: 80rpx;
    margin-top: 4px;
    pointer-events: auto; // 确保图片可点击
    &:active {
      transform: scale(0.95);
    }
  }

  .img-4 {
    width: 100rpx;
    height: 80rpx;
    pointer-events: auto; // 确保图片可点击
    &:active {
      transform: scale(0.95);
    }
  }
}
</style>
