<template>
  <view class="user-guide-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="用户指南" title-align="center" :showBackButton="true"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 指南内容 -->
    <view class="guide-content">
      <!-- 指南图片 -->
      <view class="guide-image-container">
        <image
          src="https://ccpt.qiniu.0871.cn/my/yonghuzhinan1.png"
          mode="widthFix"
          class="guide-image"
          @click="previewImage"
          @load="onImageLoad"
          @error="onImageError"
        />
      </view>

      <!-- 加载状态 -->
      <view class="loading-container" v-if="imageLoading">
        <view class="loading-text">图片加载中...</view>
      </view>

      <!-- 错误状态 -->
      <view class="error-container" v-if="imageError">
        <view class="error-icon">⚠️</view>
        <view class="error-text">图片加载失败</view>
        <button class="retry-btn" @click="retryLoadImage">重新加载</button>
      </view>


    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      imageLoading: true,
      imageError: false,
      imageUrl: 'https://ccpt.qiniu.0871.cn/my/yonghuzhinan1.png'
    }
  },

  onLoad() {
    // 页面加载时的初始化
    console.log('用户指南页面加载');
  },

  methods: {
    // 预览图片
    previewImage() {
      if (this.imageError) {
        return;
      }

      uni.previewImage({
        urls: [this.imageUrl],
        current: this.imageUrl,
        longPressActions: {
          itemList: ['保存图片'],
          success: (data) => {
            if (data.tapIndex === 0) {
              this.saveImageToAlbum();
            }
          }
        }
      });
    },

    // 保存图片到相册
    saveImageToAlbum() {
      uni.showLoading({
        title: '保存中...'
      });

      uni.downloadFile({
        url: this.imageUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                uni.hideLoading();
                uni.showToast({
                  title: '保存成功',
                  icon: 'success'
                });
              },
              fail: (err) => {
                uni.hideLoading();
                if (err.errMsg.includes('auth')) {
                  uni.showModal({
                    title: '提示',
                    content: '需要授权访问相册才能保存图片',
                    confirmText: '去设置',
                    success: (res) => {
                      if (res.confirm) {
                        uni.openSetting();
                      }
                    }
                  });
                } else {
                  uni.showToast({
                    title: '保存失败',
                    icon: 'none'
                  });
                }
              }
            });
          } else {
            uni.hideLoading();
            uni.showToast({
              title: '下载失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          uni.hideLoading();
          uni.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      });
    },

    // 图片加载完成
    onImageLoad() {
      this.imageLoading = false;
      this.imageError = false;
      console.log('用户指南图片加载成功');
    },

    // 图片加载失败
    onImageError() {
      this.imageLoading = false;
      this.imageError = true;
      console.error('用户指南图片加载失败');
    },

    // 重新加载图片
    retryLoadImage() {
      this.imageLoading = true;
      this.imageError = false;
      
      // 强制重新加载图片
      this.$nextTick(() => {
        const image = this.$el.querySelector('.guide-image');
        if (image) {
          image.src = this.imageUrl + '?t=' + Date.now();
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.user-guide-page {
  min-height: 100vh;
  background-color: #f5f6fa;
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
}

// 指南内容
.guide-content {
  .guide-image-container {
    width: 100%;
    background-color: #fff;

    .guide-image {
      width: 100%;
      display: block;
      cursor: pointer;
      transition: transform 0.2s ease;

      &:active {
        transform: scale(0.98);
      }
    }
  }

  // 加载状态
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    background-color: #fff;
    margin: 20rpx;
    border-radius: 12rpx;

    .loading-text {
      font-size: 28rpx;
      color: #999;
    }
  }

  // 错误状态
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    background-color: #fff;
    margin: 20rpx;
    border-radius: 12rpx;

    .error-icon {
      font-size: 60rpx;
      margin-bottom: 20rpx;
    }

    .error-text {
      font-size: 28rpx;
      color: #999;
      margin-bottom: 30rpx;
    }

    .retry-btn {
      padding: 16rpx 32rpx;
      background-color: #2492F2;
      color: #fff;
      border-radius: 8rpx;
      font-size: 28rpx;
      border: none;

      &:active {
        opacity: 0.9;
      }
    }
  }


}

// 底部安全区域
.safe-area-bottom {
  height: env(safe-area-inset-bottom, 0px);
  background-color: #f5f6fa;
}
</style>
