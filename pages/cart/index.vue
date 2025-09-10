<template>
  <view class="cart-page">
    <!-- 自定义导航栏 -->
    <nav-bar title="购物车" title-align="center" :showBackButton="true"></nav-bar>

    <!-- 内容区域 -->
    <view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
      <!-- 购物车列表 -->
      <view class="cart-list" v-if="cartItems && cartItems.length > 0">
        <view class="cart-item" v-for="(item, index) in cartItems" :key="item.id || index">
          <!-- 品牌图标 -->
          <view class="brand-icon-container">
            <view class="brand-icon" :class="'brand-' + item.brand">
              <text class="brand-text">{{ getBrandDisplayName(item.brand) }}</text>
            </view>
          </view>

          <!-- 订单信息 -->
          <view class="item-info">
            <view class="item-title">
              <text class="brand-name">{{ getBrandName(item.brand) }}</text>
              <text class="service-name">补宝</text>
              <text class="quantity">x{{ item.item_number }}</text>
            </view>
            
            <view class="item-details">
              <view class="detail-row">
                <text class="detail-label">设备编号：</text>
                <text class="detail-value">{{ getDeviceCode(item.sn_mac_code) }}</text>
              </view>
              
              <view class="detail-row">
                <text class="detail-label">门店名称：</text>
                <text class="detail-value">{{ item.store_name }}</text>
              </view>
              
              <view class="detail-row">
                <text class="detail-label">作业时段：</text>
                <text class="detail-value">{{ getWorkTimeDisplay(item) }}</text>
              </view>
            </view>
          </view>

          <!-- 价格和删除 -->
          <view class="item-actions">
            <view class="item-price">
              <text class="price-symbol">¥</text>
              <text class="price-amount">{{ item.order_amount }}</text>
            </view>
            <view class="delete-btn" @click="deleteCartItem(item.id, index)">
              <image src="https://ccpt.qiniu.0871.cn/cart/delete.png" class="delete-icon" mode="aspectFit"></image>
            </view>
          </view>
        </view>
      </view>

      <!-- 空购物车状态 -->
      <view class="empty-cart" v-else>
        <image src="https://ccpt.qiniu.0871.cn/cart/empty.png" class="empty-icon" mode="aspectFit"></image>
        <text class="empty-text">购物车空空如也</text>
        <view class="go-shopping-btn" @click="goShopping">
          <text class="btn-text">去购物</text>
        </view>
      </view>
    </view>

    <!-- 底部合计区域 -->
    <view class="bottom-bar" v-if="cartItems && cartItems.length > 0">
      <view class="total-section">
        <text class="total-label">合计：</text>
        <text class="total-symbol">¥</text>
        <text class="total-amount">{{ totalAmount }}</text>
      </view>
      <view class="checkout-btn" @click="goCheckout">
        <text class="checkout-text">去结算</text>
      </view>
    </view>

    <!-- 悬浮聊天图标 -->
    <FloatingChatIconUser />
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import FloatingChatIconUser from '@/components/FloatingChatIconUser/index.vue'

export default {
  components: {
    NavBar,
    FloatingChatIconUser
  },
  data() {
    return {
      navBarHeight: 0,
      cartItems: []
    }
  },
  computed: {
    // 计算总金额
    totalAmount() {
      if (!this.cartItems || this.cartItems.length === 0) return '0.00';
      const total = this.cartItems.reduce((sum, item) => {
        return sum + parseFloat(item.order_amount || 0);
      }, 0);
      return total.toFixed(2);
    }
  },
  onLoad() {
    // 计算导航栏高度
    const systemInfo = uni.getSystemInfoSync()
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
    this.navBarHeight = menuButtonInfo.bottom + 12

    // 加载购物车数据
    this.loadCartItems();
  },
  onShow() {
    // 每次显示页面时重新加载购物车数据
    this.loadCartItems();
  },
  methods: {
    // 加载购物车数据
    async loadCartItems() {
      try {
        // 获取用户信息
        const userInfo = uni.getStorageSync('userInfo');
        if (!userInfo || !userInfo.openid) {
          console.log('用户未登录，无法加载购物车');
          this.cartItems = [];
          return;
        }

        // 调用获取购物车接口
        const res = await this.$request('cart/list', {
          openid: userInfo.openid,
          user_id: userInfo.user_id,
          sign: 'chongchong'
        }, 'POST');

        if (res.code === 200 && res.data) {
          this.cartItems = res.data;
        } else {
          console.error('获取购物车数据失败:', res.message);
          this.cartItems = [];
        }
      } catch (error) {
        console.error('加载购物车数据失败:', error);
        this.cartItems = [];
      }
    },

    // 删除购物车项
    async deleteCartItem(cartId, index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要从购物车中删除此项吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 获取用户信息
              const userInfo = uni.getStorageSync('userInfo');
              if (!userInfo || !userInfo.openid) {
                uni.showToast({
                  title: '请先登录',
                  icon: 'none'
                });
                return;
              }

              uni.showLoading({
                title: '删除中...',
                mask: true
              });

              // 调用删除接口
              const deleteRes = await this.$request('cart/delete', {
                cart_id: cartId,
                openid: userInfo.openid,
                user_id: userInfo.user_id,
                sign: 'chongchong'
              }, 'POST');

              uni.hideLoading();

              if (deleteRes.code === 200) {
                // 删除成功，从本地数据中移除
                this.cartItems.splice(index, 1);
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                });

                // 触发购物车更新事件
                uni.$emit('cartUpdated');
              } else {
                uni.showToast({
                  title: deleteRes.message || '删除失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              uni.hideLoading();
              console.error('删除购物车项失败:', error);
              uni.showToast({
                title: '网络错误，请重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },

    // 获取品牌名称
    getBrandName(brand) {
      const brandMap = {
        'meituan': '美团',
        'guaishou': '怪兽',
        'jiedian': '街电',
        'xiaodian': '小电'
      };
      return brandMap[brand] || brand;
    },

    // 获取品牌显示名称（用于图标）
    getBrandDisplayName(brand) {
      const brandMap = {
        'meituan': '美团\n补宝',
        'guaishou': '怪兽\n补宝',
        'jiedian': '街电\n补宝',
        'xiaodian': '小电\n补宝'
      };
      return brandMap[brand] || `${brand}\n补宝`;
    },


    // 获取设备编码
    getDeviceCode(snMacList) {
      if (!snMacList || snMacList.length === 0) return '未填写';
      // 只显示第一个设备编号
      const firstCode = snMacList[0];
      if (typeof firstCode === 'string') {
        return firstCode;
      } else if (firstCode && firstCode.value) {
        return firstCode.value;
      }
      return '未填写';
    },

    // 获取工作时段显示
    getWorkTimeDisplay(item) {
      if (item.recommended_service_time_start && item.recommended_service_time_end) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        // 如果是24小时均可
        if (item.recommended_service_time_start === '00:00:00' && item.recommended_service_time_end === '00:00:00') {
          return `${year}-${month}-${day} 24小时均可`;
        }
        
        // 格式化时间（去掉秒）
        const startTime = item.recommended_service_time_start.substring(0, 5);
        const endTime = item.recommended_service_time_end.substring(0, 5);
        
        return `${year}-${month}-${day} ${startTime}-${endTime}`;
      }
      return '未设置';
    },

    // 去购物
    goShopping() {
      uni.switchTab({
        url: '/pages/index/index'
      });
    },

    // 去结算
    goCheckout() {
      if (!this.cartItems || this.cartItems.length === 0) {
        uni.showToast({
          title: '购物车为空',
          icon: 'none'
        });
        return;
      }

      // 跳转到结算页面（暂时显示提示）
      uni.showToast({
        title: '结算功能开发中...',
        icon: 'none'
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: "HarmonyOS Sans SC", sans-serif;
}

.content {
  padding: 0 20rpx 120rpx 20rpx;
  min-height: calc(100vh - 120rpx);
}

.cart-list {
  .cart-item {
    display: flex;
    align-items: flex-start;
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  }
}

.brand-icon-container {
  margin-right: 20rpx;
  flex-shrink: 0;
}

.brand-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.brand-meituan {
    background: linear-gradient(135deg, #FFD100 0%, #FFC107 100%);
  }
  
  &.brand-guaishou {
    background: linear-gradient(135deg, #16C2C2 0%, #00BCD4 100%);
  }
  
  &.brand-jiedian {
    background: linear-gradient(135deg, #61CA87 0%, #4CAF50 100%);
  }
  
  &.brand-xiaodian {
    background: linear-gradient(135deg, #0FB269 0%, #2E7D32 100%);
  }
}

.brand-text {
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  white-space: pre-line;
}

.item-info {
  flex: 1;
  margin-right: 20rpx;
}

.item-title {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  
  .brand-name {
    font-size: 32rpx;
    font-weight: 500;
    color: #333333;
    margin-right: 8rpx;
  }
  
  .service-name {
    font-size: 32rpx;
    font-weight: 500;
    color: #333333;
    margin-right: 8rpx;
  }
  
  .quantity {
    font-size: 28rpx;
    color: #FF4D4F;
    font-weight: 500;
  }
}

.item-details {
  .detail-row {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .detail-label {
    font-size: 26rpx;
    color: #666666;
    min-width: 140rpx;
  }
  
  .detail-value {
    font-size: 26rpx;
    color: #333333;
    flex: 1;
  }
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  height: 120rpx;
}

.item-price {
  display: flex;
  align-items: baseline;
  
  .price-symbol {
    font-size: 24rpx;
    color: #FF4D4F;
    font-weight: 500;
  }
  
  .price-amount {
    font-size: 32rpx;
    color: #FF4D4F;
    font-weight: 600;
  }
}

.delete-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.6;
}

/* 空购物车状态 */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  
  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 40rpx;
    opacity: 0.6;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999999;
    margin-bottom: 40rpx;
  }
  
  .go-shopping-btn {
    width: 200rpx;
    height: 70rpx;
    background: linear-gradient(135deg, #2492F2 0%, #1890FF 100%);
    border-radius: 35rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .btn-text {
      color: #ffffff;
      font-size: 28rpx;
      font-weight: 500;
    }
    
    &:active {
      opacity: 0.8;
    }
  }
}

/* 底部合计区域 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 120rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  padding-bottom: calc(0rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.total-section {
  display: flex;
  align-items: baseline;
  
  .total-label {
    font-size: 28rpx;
    color: #333333;
    margin-right: 8rpx;
  }
  
  .total-symbol {
    font-size: 24rpx;
    color: #FF4D4F;
    font-weight: 500;
  }
  
  .total-amount {
    font-size: 40rpx;
    color: #FF4D4F;
    font-weight: 600;
  }
}

.checkout-btn {
  width: 180rpx;
  height: 70rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF4500 100%);
  border-radius: 35rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .checkout-text {
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 500;
  }
  
  &:active {
    opacity: 0.8;
  }
}
</style>