<template>
  <view class="manual-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="接单手册" title-align="center" :showBackButton="true"></nav-bar>

    <!-- 导航栏占位 -->
    <view class="nav-placeholder"></view>

    <!-- 手册图片容器 -->
    <scroll-view class="manual-scroll-container" scroll-y="true" enhanced="true" show-scrollbar="false">
      <view class="manual-container">
        <image
          class="manual-image"
          src="https://ccpt.qiniu.cc111.cn/rider/my/jiedanshouce.jpg"
          mode="widthFix"
          @click="previewManual"
          @load="onImageLoad"
        ></image>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

export default {
  components: {
    NavBar
  },
  data() {
    return {
      imageLoaded: false
    }
  },
  methods: {
    // 预览手册图片
    previewManual() {
      uni.previewImage({
        urls: ['https://ccpt.qiniu.cc111.cn/rider/my/jiedanshouce.jpg'],
        current: 'https://ccpt.qiniu.cc111.cn/rider/my/jiedanshouce.jpg'
      });
    },

    // 图片加载完成
    onImageLoad() {
      this.imageLoaded = true;
    }
  }
}
</script>

<style lang="scss" scoped>
.manual-page {
  width: 100vw;
  height: 100vh;
  background-color: #000;
  position: relative;
  display: flex;
  flex-direction: column;
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
  flex-shrink: 0;
}

.manual-scroll-container {
  flex: 1;
  width: 100%;
  height: 0;
  background-color: #000;
}

.manual-container {
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background-color: #000;
}

.manual-image {
  width: 100%;
  height: auto;
  display: block;
  cursor: pointer;
  max-width: 100%;
}
</style>
