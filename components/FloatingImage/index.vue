<template>
  <view class="floating-image" @click="handleClick">
    <image :src="imageSrc" mode="aspectFit"></image>
  </view>
</template>

<script>
export default {
  name: 'FloatingImage',
  props: {
    // 图片地址
    imageSrc: {
      type: String,
      default: 'https://ccpt.qiniu.0871.cn/xuanfu1.png'
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
  methods: {
    handleClick() {
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
  position: fixed;
  right: 20rpx;
  bottom: calc(160rpx + env(safe-area-inset-bottom)); // 底部导航上面，位置上移
  width: 150rpx;
  height: 150rpx;
  z-index: 999;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
  }

  image {
    width: 150rpx;
    height: 150rpx;
  }
}
</style>
