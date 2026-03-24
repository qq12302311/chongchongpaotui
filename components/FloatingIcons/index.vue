<template>
  <view class="floating-icons">
    <!-- 购物车图标 -->
    <!-- <view class="floating-cart" @click="goToCart">
      <view class="cart-icon-container">
        <image src="https://ccpt.qiniu.cc111.cn/gwc-1.png" class="cart-icon" mode="aspectFit"></image>
        <view class="cart-badge" v-if="cartCount > 0">
          <text class="cart-count">{{ cartCount > 99 ? '99+' : cartCount }}</text>
        </view>
      </view>
    </view> -->

    <!-- 充电服务图标 -->
   <!-- <view class="floating-charge" @click="goToCharge">
      <view class="charge-icon-container">
        <image src="https://ccpt.qiniu.cc111.cn/gwc-2.png" class="charge-icon" mode="aspectFit"></image>
        <view class="charge-badge">
          <text class="charge-count">2</text>
        </view>
      </view>
      <view class="charge-bottom">
        <image src="https://ccpt.qiniu.cc111.cn/gwc-3.png" class="charge-person" mode="aspectFit"></image>
        <view class="charge-text">
          <text class="text-content">推荐有奖金</text>
        </view>
      </view>
    </view> -->
  </view>
</template>

<script>
export default {
  name: 'FloatingIcons',
  data() {
    return {
      cartCount: 0
    }
  },
  mounted() {
    this.getCartCount();
    
    // 监听页面显示事件
    uni.$on('cartUpdated', () => {
      this.getCartCount();
    });
  },
  beforeDestroy() {
    // 移除事件监听
    uni.$off('cartUpdated');
  },
  methods: {
    // 获取购物车数量
    async getCartCount() {
      try {
        const userInfo = uni.getStorageSync('userInfo');
        if (!userInfo || !userInfo.openid) {
          this.cartCount = 0;
          return;
        }

        const res = await this.$request('cart/list', {
          openid: userInfo.openid,
          user_id: userInfo.user_id,
          sign: 'chongchong'
        }, 'POST');

        if (res.code === 200 && res.data) {
          this.cartCount = res.data.length;
        } else {
          this.cartCount = 0;
        }
      } catch (error) {
        console.error('获取购物车数量失败:', error);
        this.cartCount = 0;
      }
    },

    // 跳转到购物车
    goToCart() {
      uni.navigateTo({
        url: '/pages/cart/index'
      });
    },

    // 跳转到充电服务
    goToCharge() {
      // 暂时显示提示
      uni.showToast({
        title: '充电服务即将上线',
        icon: 'none'
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.floating-icons {
  position: fixed;
  right: 20rpx;
  bottom: 250rpx;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 20rpx;
}

.floating-cart {
  position: relative;
}

.cart-icon-container {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  
  .cart-icon {
    width: 100%;
    height: 100%;
    border-radius: 50rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  }
  
  .cart-badge {
    position: absolute;
    top: -5rpx;
    right: -5rpx;
    min-width: 32rpx;
    height: 32rpx;
    background: linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8rpx;
    border: 3rpx solid #ffffff;
    box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.4);
    
    .cart-count {
      color: #ffffff;
      font-size: 20rpx;
      font-weight: 600;
      line-height: 1;
    }
  }
}

.floating-charge {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.charge-icon-container {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  
  .charge-icon {
    width: 100%;
    height: 100%;
    border-radius: 50rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  }
  
  .charge-badge {
    position: absolute;
    top: -5rpx;
    right: -5rpx;
    min-width: 32rpx;
    height: 32rpx;
    background: linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8rpx;
    border: 3rpx solid #ffffff;
    box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.4);
    
    .charge-count {
      color: #ffffff;
      font-size: 20rpx;
      font-weight: 600;
      line-height: 1;
    }
  }
}

.charge-bottom {
  margin-top: 10rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .charge-person {
    width: 80rpx;
    height: 80rpx;
    border-radius: 40rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }
  
  .charge-text {
    margin-top: 8rpx;
    background: linear-gradient(135deg, #2492F2 0%, #1890FF 100%);
    border-radius: 20rpx;
    padding: 6rpx 12rpx;
    
    .text-content {
      color: #ffffff;
      font-size: 20rpx;
      font-weight: 500;
      line-height: 1;
    }
  }
}

/* 点击效果 */
.floating-cart:active {
  transform: scale(0.95);
}

.floating-charge:active {
  transform: scale(0.95);
}
</style>