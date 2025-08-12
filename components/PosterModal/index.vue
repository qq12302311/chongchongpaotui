<template>
  <view class="poster-modal" v-if="show" @click="handleClose" @touchmove.stop.prevent>
    <view class="modal-content" @click.stop @touchmove.stop>
      <!-- 关闭按钮 -->
      <view class="close-btn" @click="handleClose">
        <text class="close-icon">×</text>
      </view>

      <!-- 3D轮播容器 -->
      <view class="carousel-container" :class="animationClass" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
        <view class="poster-wrapper">
          <!-- 上一张图片（左侧） -->
          <view class="poster-item prev" v-if="posters.length > 1">
            <image
              :src="posters[getPrevIndex()].image"
              mode="scaleToFill"
              class="poster-image"
              @click="prevSlide"
            />
          </view>

          <!-- 当前图片（中间） -->
          <view class="poster-item active">
            <image
              :src="posters[currentIndex].image"
              mode="scaleToFill"
              class="poster-image"
              @click="handlePosterClick(posters[currentIndex])"
              @error="onImageError"
              @load="onImageLoad"
            />
          </view>

          <!-- 下一张图片（右侧） -->
          <view class="poster-item next" v-if="posters.length > 1">
            <image
              :src="posters[getNextIndex()].image"
              mode="scaleToFill"
              class="poster-image"
              @click="nextSlide"
            />
          </view>
        </view>

        <!-- 指示器 -->
        <view class="indicators" v-if="posters.length > 1">
          <view
            v-for="(poster, index) in posters"
            :key="index"
            class="indicator"
            :class="{ 'active': index === currentIndex }"
            @click="goToSlide(index)"
          ></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PosterModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    posters: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentIndex: 0,
      autoplayTimer: null,
      touchStartX: 0,
      touchStartY: 0,
      touchStartTime: 0,
      isTransitioning: false,
      animationClass: ''
    }
  },
  mounted() {
    this.startAutoplay()
    this.disablePageScroll()
  },
  beforeDestroy() {
    this.stopAutoplay()
    this.enablePageScroll()
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.disablePageScroll()
      } else {
        this.enablePageScroll()
      }
    }
  },
  methods: {
    handleClose() {
      this.enablePageScroll()
      this.$emit('close')
    },

    prevSlide() {
      if (this.isTransitioning) return
      this.isTransitioning = true

      // 更新索引
      this.currentIndex = this.currentIndex === 0 ? this.posters.length - 1 : this.currentIndex - 1

      // 添加切换动画类
      this.animationClass = 'slide-from-left'

      // 动画结束后清理
      setTimeout(() => {
        this.animationClass = ''
        this.isTransitioning = false
      }, 500)
    },

    nextSlide() {
      if (this.isTransitioning) return
      this.isTransitioning = true

      // 更新索引
      this.currentIndex = this.currentIndex === this.posters.length - 1 ? 0 : this.currentIndex + 1

      // 添加切换动画类
      this.animationClass = 'slide-from-right'

      // 动画结束后清理
      setTimeout(() => {
        this.animationClass = ''
        this.isTransitioning = false
      }, 500)
    },

    goToSlide(index) {
      if (this.isTransitioning || index === this.currentIndex) return
      this.isTransitioning = true

      // 判断切换方向
      const direction = index > this.currentIndex ? 'slide-from-right' : 'slide-from-left'

      // 更新索引
      this.currentIndex = index

      // 添加切换动画类
      this.animationClass = direction

      // 动画结束后清理
      setTimeout(() => {
        this.animationClass = ''
        this.isTransitioning = false
      }, 500)
    },

    getPrevIndex() {
      return this.currentIndex === 0 ? this.posters.length - 1 : this.currentIndex - 1
    },

    getNextIndex() {
      return this.currentIndex === this.posters.length - 1 ? 0 : this.currentIndex + 1
    },



    // 触摸开始
    onTouchStart(e) {
      this.stopAutoplay()
      this.touchStartX = e.touches[0].clientX
      this.touchStartY = e.touches[0].clientY
      this.touchStartTime = Date.now()
    },

    // 触摸移动
    onTouchMove(e) {
      // 只阻止垂直滚动，允许水平滑动
      const touch = e.touches[0]
      const deltaX = Math.abs(touch.clientX - this.touchStartX)
      const deltaY = Math.abs(touch.clientY - this.touchStartY)

      // 如果是垂直滑动，阻止默认行为
      if (deltaY > deltaX) {
        e.preventDefault()
      }
    },

    // 触摸结束
    onTouchEnd(e) {
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const touchEndTime = Date.now()

      const deltaX = touchEndX - this.touchStartX
      const deltaY = touchEndY - this.touchStartY
      const deltaTime = touchEndTime - this.touchStartTime

      // 判断是否为有效滑动（水平滑动距离大于垂直滑动距离，且滑动距离足够）
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 500) {
        if (deltaX > 0) {
          // 右滑，显示上一张
          this.prevSlide()
        } else {
          // 左滑，显示下一张
          this.nextSlide()
        }
      }

      // 重新开始自动播放
      this.startAutoplay()
    },

    startAutoplay() {
      if (this.posters.length > 1) {
        this.autoplayTimer = setInterval(() => {
          this.nextSlide()
        }, 3000)
      }
    },

    stopAutoplay() {
      if (this.autoplayTimer) {
        clearInterval(this.autoplayTimer)
        this.autoplayTimer = null
      }
    },

    handlePosterClick(poster) {
      // 可以在这里处理海报点击事件
      this.$emit('posterClick', poster)
    },

    // 图片加载成功
    onImageLoad(e) {
      console.log('图片加载成功:', e)
    },

    // 图片加载失败
    onImageError(e) {
      console.error('图片加载失败:', e)
    },

    // 禁止页面滚动
    disablePageScroll() {
      // 小程序环境下禁止页面滚动
      try {
        // 获取当前页面实例
        const pages = getCurrentPages()
        if (pages.length > 0) {
          const currentPage = pages[pages.length - 1]

          // 保存原始的onPageScroll方法
          this.originalOnPageScroll = currentPage.onPageScroll

          // 禁用页面滚动
          currentPage.onPageScroll = function() {
            // 空函数，阻止滚动事件
          }

          // 设置页面不可滚动
          if (currentPage.$el) {
            currentPage.$el.style.overflow = 'hidden'
            currentPage.$el.style.position = 'fixed'
            currentPage.$el.style.width = '100%'
          }
        }
      } catch (error) {
        console.log('禁止滚动设置失败:', error)
      }
    },

    // 恢复页面滚动
    enablePageScroll() {
      try {
        const pages = getCurrentPages()
        if (pages.length > 0) {
          const currentPage = pages[pages.length - 1]

          // 恢复原始的onPageScroll方法
          if (this.originalOnPageScroll) {
            currentPage.onPageScroll = this.originalOnPageScroll
          }

          // 恢复页面样式
          if (currentPage.$el) {
            currentPage.$el.style.overflow = ''
            currentPage.$el.style.position = ''
            currentPage.$el.style.width = ''
          }
        }
      } catch (error) {
        console.log('恢复滚动设置失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.poster-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-in-out;
  overflow: hidden;
  touch-action: none;
}

.modal-content {
  position: relative;
  width: 95vw;
  height: 85vh;
  background-color: transparent;
  border-radius: 20rpx;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: -60rpx;
  right: 0;
  width: 60rpx;
  height: 60rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
  .close-icon {
    font-size: 40rpx;
    color: #333;
    font-weight: bold;
    line-height: 1;
  }
}

.carousel-container {
  width: 100%;
  height: 100%;
  position: relative;
  perspective: 1200rpx;
  perspective-origin: center center;
}

.poster-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
}

.poster-item {
  position: absolute;
  width: 80%;
  height: 90%;
  border-radius: 20rpx;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-origin: center center;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  cursor: pointer;
  will-change: transform, opacity;

  &.active {
    transform: translateX(0) scale(1) rotateY(0deg) translateZ(0);
    opacity: 1;
    z-index: 3;
    width: 100%;
    height: 100%;
  }

  &.prev {
    transform: translateX(-60%) scale(0.8) rotateY(25deg) translateZ(-100rpx);
    opacity: 0.6;
    z-index: 1;
    left: 0;
  }

  &.next {
    transform: translateX(60%) scale(0.8) rotateY(-25deg) translateZ(-100rpx);
    opacity: 0.6;
    z-index: 1;
    right: 0;
  }
}

// 简化的切换动画
.carousel-container {
  &.slide-from-right,
  &.slide-from-left {
    .poster-item {
      transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);

      &.active {
        transform: translateX(0) scale(1.05) rotateY(0deg) translateZ(20rpx);
        opacity: 1;
        z-index: 4;
        box-shadow: 0 25rpx 80rpx rgba(0, 0, 0, 0.4);
      }

      &.prev {
        transform: translateX(-65%) scale(0.75) rotateY(30deg) translateZ(-120rpx);
        opacity: 0.5;
        z-index: 1;
      }

      &.next {
        transform: translateX(65%) scale(0.75) rotateY(-30deg) translateZ(-120rpx);
        opacity: 0.5;
        z-index: 1;
      }
    }
  }
}

.poster-image {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 20rpx;
  object-fit: cover;
}

.indicators {
  position: absolute;
  bottom: 30rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16rpx;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  backdrop-filter: blur(10rpx);

  .indicator {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
    cursor: pointer;

    &.active {
      background-color: #2492F2;
      transform: scale(1.3);
      box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.4);
    }

    &:hover {
      background-color: rgba(255, 255, 255, 0.8);
      transform: scale(1.1);
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
