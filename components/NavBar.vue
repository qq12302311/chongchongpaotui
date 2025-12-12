<template>
  <view class="nav-bar" :style="{ height: navBarHeight + 'px', background: backgroundColor }">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    <view class="nav-content" :style="{ height: menuButtonInfo.height + 'px', marginTop: (menuButtonInfo.top - statusBarHeight) + 'px' }">
      <!-- 返回按钮区域 -->
      <view v-if="shouldShowBackButton" class="back-button" @click="goBack">
        <view class="back-icon" :style="{ borderColor: textColor }"></view>
      </view>

      <view class="location" :class="[titleAlign === 'center' ? 'center' : 'left']">
        <text :style="{ color: textColor }">{{ title || currentCity }}</text>
      </view>

      <!-- 占位元素，保持居中标题的居中效果 -->
      <view v-if="shouldShowBackButton && titleAlign === 'center'" class="placeholder-space"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    title: {
      type: String,
      default: ''
    },
    titleAlign: {
      type: String,
      default: 'left', // 可选值: 'left' 或 'center'
      validator: (value) => ['left', 'center'].includes(value)
    },
    showBackButton: {
      type: Boolean,
      default: null // 默认为null，表示使用内部逻辑
    },
    backgroundColor: {
      type: String,
      default: '#2492F2' // 默认背景色
    },
    textColor: {
      type: String,
      default: '#ffffff' // 默认文字颜色
    }
  },
  data() {
    return {
      currentCity: '充充跑腿',
      statusBarHeight: 0,
      menuButtonInfo: null,
      navBarHeight: 0,
      tabBarPages: ['/pages/index/index', '/pages/order/order', '/pages/cart/index', '/pages/my/my']
    }
  },
  computed: {
    shouldShowBackButton() {
      // 如果外部指定了showBackButton，则使用外部指定的值
      if (this.showBackButton !== null) {
        return this.showBackButton;
      }

      // 否则使用内部逻辑
      // 获取当前页面路径
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentPagePath = '/' + currentPage.route;

      // 判断是否为tabbar页面
      return !this.tabBarPages.includes(currentPagePath);
    }
  },
  created() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    this.menuButtonInfo = uni.getMenuButtonBoundingClientRect()
    this.navBarHeight = this.menuButtonInfo.bottom + 12
  },
  methods: {
    handleCitySelect() {
      uni.showToast({
        title: '选择城市',
        icon: 'none'
      })
    },
    goBack() {
      this.$emit('back');
      uni.navigateBack({
        delta: 1,
        fail: () => {
          // 如果返回失败，可能是没有上一页，不做额外处理
          // 已经通过emit触发了back事件，由父组件决定如何处理
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;

  .nav-content {
    display: flex;
    align-items: center;
    padding-left: 30rpx;
    padding-right: 30rpx;
    box-sizing: border-box;
    position: relative;

    .back-button {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;

      .back-icon {
        width: 20rpx;
        height: 20rpx;
        border-top: 3rpx solid #ffffff;
        border-left: 3rpx solid #ffffff;
        transform: rotate(-45deg);
      }
    }

    .placeholder-space {
      width: 60rpx; /* 返回按钮的宽度 */
    }

    .location {
      display: flex;
      align-items: center;
      font-size: 29rpx;
      font-weight: 500;
      color: #ffffff;
      font-family: "HarmonyOS Sans SC", sans-serif;
      z-index: 1;

      &.left {
        justify-content: flex-start;
        flex: 1;
      }

      &.center {
        justify-content: center;
        position: absolute;
        left: 0;
        right: 0;
        width: 100%;
      }

      text {
        font-family: "HarmonyOS Sans SC", sans-serif;
      }
    }
  }
}
</style>