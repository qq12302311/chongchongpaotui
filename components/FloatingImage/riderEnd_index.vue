<template>
  <view 
    class="floating-image"
    :style="{ right: position.x + 'px', bottom: position.y + 'px' }"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
		<!-- 第一个图标 - 绿约 -->
		<image @click="goToLvyue" class="img-1" src="https://ccpt.qiniu.cc111.cn/riderEnd/index/lvyue.svg" mode="aspectFit"></image>
		<!-- 第二个图标 - 接单配饿 -->
		<image @click="goToJiedanpeie" class="img-2" src="https://ccpt.qiniu.cc111.cn/riderEnd/index/jiedanpeie.svg" mode="aspectFit"></image>
		<!-- 第三个图标 - 骑手登记 -->
		<image @click="goToQishoudengji" class="img-3" src="https://ccpt.qiniu.cc111.cn/riderEnd/index/qishoudengji.svg" mode="aspectFit"></image>
  </view>
</template>

<script>
export default {
  name: 'FloatingImage',
  props: {
    // 图片地址
    imageSrc: {
      type: String,
      default: 'https://ccpt.qiniu.cc111.cn/tuijian.png'
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
		// 第一个图标点击事件 - 绿约
		goToLvyue() {
			if (this.dragging) return; // 拖拽时不触发点击事件
			
			// 发射点击事件
			this.$emit('lvyue-click');
			console.log('点击绿约图标');
		},
		
		// 第二个图标点击事件 - 接单配饿
		goToJiedanpeie() {
			if (this.dragging) return; // 拖拽时不触发点击事件
			
			// 发射点击事件
			this.$emit('jiedanpeie-click');
			console.log('点击接单配饿图标');
		},
		
		// 第三个图标点击事件 - 骑手登记
		goToQishoudengji() {
			if (this.dragging) return; // 拖拽时不触发点击事件
			
			// 发射点击事件
			this.$emit('qishoudengji-click');
			console.log('点击骑手登记图标');
		},
		
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
    }
  }
}
</script>

<style lang="scss" scoped>
// 悬浮小图样式
.floating-image {
	background-image: url(https://ccpt.qiniu.cc111.cn/riderEnd/index/beiban.svg);
	background-size: cover;
  position: fixed;
  width: 100rpx;
  height: 302rpx;
  z-index: 999;
  transition: none;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  cursor: move;
  
  // 拖拽时的视觉反馈
  &:active {
    transform: scale(1.05);
    opacity: 0.9;
  }

  // 第一个图标 - 绿约
  .img-1 {
    width: 84rpx;
    height: 84rpx;
    margin-top: 10rpx;
    margin-left: 8rpx;
    pointer-events: auto; // 确保图片可点击
    &:active {
      transform: scale(0.95);
    }
  }

  // 第二个图标 - 接单配饿
  .img-2 {
    width: 98rpx;
    height: 84rpx;
    /* margin-top: 10rpx ; */
    margin-left: 8rpx;
    pointer-events: auto;
    &:active {
      transform: scale(0.95);
    }
  }

  // 第三个图标 - 骑手登记
  .img-3 {
    width: 85rpx;
    height: 84rpx;
    /* margin-top: 10rpx ; */
    margin-left: 8rpx;
    pointer-events: auto;
    &:active {
      transform: scale(0.95);
    }
  }
}
</style>
