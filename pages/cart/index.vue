<template>
  <view class="cart-page">
    <!-- 自定义导航栏 -->
		<nav-bar title="购物车" title-align="center"></nav-bar>

    <!-- 内容区域 -->
    <view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
      <!-- 购物车列表 -->
      <view class="cart-list" v-if="cartItems && cartItems.length > 0">
        <view class="cart-item" v-for="(item, index) in cartItems" :key="item.id || index">
          <!-- 品牌图标 -->
          <view class="brand-icon-container">
            <view class="brand-icon" :class="'brand-' + item.brand">
              <view class="brand-text">
                <text class="brand-name-text">{{ getBrandName(item.brand) }}</text>
                <text class="service-type-text">补宝</text>
              </view>
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
                <text class="detail-label">门店名称：</text>
                <text class="detail-value">{{ item.store_name }}</text>
              </view>
              
              <view class="detail-row">
                <text class="detail-label">设备编号：</text>
                <text class="detail-value">{{ getDeviceCode(item.sn_mac_code) }}</text>
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
            <view class="delete-btn" @click="deleteCartItem(index)">
              <image src="https://ccpt.qiniu.cc111.cn/delete-gwc.svg" class="delete-icon" mode="aspectFit"></image>
            </view>
          </view>
        </view>
      </view>

      <!-- 空购物车状态 -->
      <view class="empty-cart" v-else>
        <!-- <image src="https://ccpt.qiniu.cc111.cn/cart/empty.png" class="empty-icon" mode="aspectFit"></image> -->
        <text class="empty-text">购物车空空如也</text>
        <view class="go-shopping-btn" @click="goShopping">
          <text class="btn-text">去加入购物车</text>
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
    <!-- <FloatingChatIconUser /> -->

		<!-- 底部导航 -->
		<tab-bar></tab-bar>

		<!-- 悬浮小图 -->
		<floating-image></floating-image>
  </view>
</template>

<script>
	import FloatingImage from '@/components/FloatingImage/index.vue'
import NavBar from '@/components/NavBar.vue'
// import FloatingChatIconUser from '@/components/FloatingChatIconUser/index.vue'
	import TabBar from '@/components/tab-bar/tab-bar.vue'

export default {
  components: {
    NavBar,
    // FloatingChatIconUser,
	FloatingImage,
			TabBar,
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
    // 安全获取消息字符串，处理可能为数组的情况
    getSafeMessage(message, defaultMessage = '操作失败') {
      if (typeof message === 'string') {
        return message;
      }
      if (Array.isArray(message) && message.length > 0) {
        return message[0];
      }
      return defaultMessage;
    },
    
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
        const timestamp = Math.floor(Date.now() / 1000);
        const res = await this.$request('cart/list', {
          user_id: userInfo.user_id,
          sign: 'chongchong',
          timestamp: timestamp
        }, 'POST');

        if (res.code === 200 && res.data) {
          // 过滤掉可能的null、undefined或无效项目
          this.cartItems = (res.data || []).filter(item => item && typeof item === 'object');
          console.log('购物车数据:', this.cartItems);
          if (this.cartItems.length > 0) {
            console.log('第一个项目的字段:', Object.keys(this.cartItems[0]));
            console.log('第一个项目完整数据:', this.cartItems[0]);
          }
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
    async deleteCartItem(index) {
      console.log('deleteCartItem 被调用，index:', index);
      console.log('当前购物车数据:', this.cartItems);
      
      // 检查索引有效性
      if (typeof index !== 'number' || index < 0 || index >= this.cartItems.length) {
        console.error('index 参数无效:', index);
        uni.showToast({
          title: '删除失败：索引无效',
          icon: 'none'
        });
        return;
      }
      
      // 通过索引获取item
      const item = this.cartItems[index];
      console.log('通过索引获取的item:', item);
      
      // 检查item有效性
      if (!item) {
        console.error('通过索引获取的item为空:', index);
        uni.showToast({
          title: '删除失败：项目信息无效',
          icon: 'none'
        });
        return;
      }
      
      // 获取正确的ID字段，可能是id、cart_id或其他字段
      const cartId = item.id || item.cart_id || item._id || null;
      console.log('删除项目信息:', item);
      console.log('提取的cartId:', cartId);
      
      if (!cartId) {
        uni.showToast({
          title: '无法获取项目ID，删除失败',
          icon: 'none'
        });
        return;
      }
      uni.showModal({
        title: '确认删除',
        content: '确定从购物车移除？',
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
              const timestamp = Math.floor(Date.now() / 1000);
              const deleteRes = await this.$request('cart/delete', {
                id: cartId,
                cart_id: cartId,
                user_id: userInfo.user_id,
                sign: 'chongchong',
                timestamp: timestamp
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
                  title: this.getSafeMessage(deleteRes.message, '删除失败'),
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
        // 处理ISO 8601格式的时间数据，如：2025-09-10T10:00:00.000000Z
        const parseTime = (timeStr) => {
          const date = new Date(timeStr);
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${hours}:${minutes}`;
        };
        
        const startTime = parseTime(item.recommended_service_time_start);
        const endTime = parseTime(item.recommended_service_time_end);
        
        return `每天${startTime}-${endTime}`;
      }
      return '每天08:00-20:00';
    },

    // 去购物
    goShopping() {
      uni.switchTab({
        url: '/pages/index/index'
      });
    },

    // 去结算
    async goCheckout() {
      if (!this.cartItems || this.cartItems.length === 0) {
        uni.showToast({
          title: '购物车为空',
          icon: 'none'
        });
        return;
      }

      try {
        // 获取用户信息
        const userInfo = uni.getStorageSync('userInfo');
        if (!userInfo || !userInfo.user_id || !userInfo.openid) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        uni.showLoading({
          title: '结算中...',
          mask: true
        });

        // 调用结算接口
        const timestamp = Math.floor(Date.now() / 1000);
        const res = await this.$request('cart/checkout', {
          user_id: userInfo.user_id,
          openid: userInfo.openid,
          sign: 'chongchong',
          timestamp: timestamp
        }, 'POST');

        uni.hideLoading();

        if (res.code === 200 && res.data) {
          // 检查支付状态，如果需要支付则调用微信支付
          if (res.data.pay_status === 1001 && res.data.pay_info) {
            await this.handleWechatPay(res.data);
          } else {
            // 无需支付或已支付完成
            uni.showToast({
              title: this.getSafeMessage(res.message, '下单成功'),
              icon: 'success'
            });
            
            // 清空购物车并刷新页面
            this.cartItems = [];
            uni.$emit('cartUpdated');
          }
        } else {
          uni.showToast({
            title: this.getSafeMessage(res.message, '结算失败'),
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('结算失败:', error);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    },

    // 处理微信支付
    async handleWechatPay(orderData) {
      try {
        const payInfo = orderData.pay_info;
        
        uni.showLoading({
          title: '调起支付...',
          mask: true
        });

        // 调用微信支付
        const payResult = await new Promise((resolve, reject) => {
          uni.requestPayment({
            provider: 'wxpay',
            timeStamp: payInfo.timestamp,
            nonceStr: payInfo.nonceStr,
            package: payInfo.package,
            signType: payInfo.signType,
            paySign: payInfo.paySign,
            success: (res) => {
              console.log('微信支付成功:', res);
              resolve(res);
            },
            fail: (err) => {
              console.error('微信支付失败:', err);
              reject(err);
            }
          });
        });

        uni.hideLoading();

        // 支付成功
        uni.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 3000
        });

        // 清空购物车并刷新页面
        this.cartItems = [];
        uni.$emit('cartUpdated');

        // 3秒后跳转到订单页面
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/order/order'
          });
        }, 3000);

      } catch (error) {
        uni.hideLoading();
        console.error('支付处理失败:', error);
        
        // 判断是用户取消还是支付失败
        if (error.errMsg && error.errMsg.includes('cancel')) {
          uni.showToast({
            title: '支付已取消',
            icon: 'none'
          });
        } else {
          uni.showToast({
            title: '支付失败，请重试',
            icon: 'none'
          });
        }
      }
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
  width: 100rpx;
  height: 110rpx;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.brand-meituan {
    background-color: #FFC300;
  }
  
  &.brand-guaishou {
    background-color: #27BFC0;
  }
  
  &.brand-jiedian {
    background-color: #2492F2;
  }
  
  &.brand-xiaodian {
    background-color: #2492F2;
  }
}

.brand-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  .brand-name-text {
    color: #ffffff;
    font-size: 33rpx;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 4rpx;
    
    // 美团品牌文字颜色调整
    .brand-icon.brand-meituan & {
      color: #333;
    }
  }
  
  .service-type-text {
    color: #ffffff;
    font-size: 33rpx;
    font-weight: bold;
    line-height: 1.2;
    
    // 美团品牌文字颜色调整
    .brand-icon.brand-meituan & {
      color: #333;
    }
  }
}

.item-info {
  flex: 1;
  margin-right: 20rpx;
}

.item-title {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 12rpx;
  // border-bottom: 1rpx solid #e8e8e8;
  // box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  position: relative;
  
  .brand-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-right: 8rpx;
  }
  
  .service-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-right: 8rpx;
  }
  
  .quantity {
    font-size: 28rpx;
    color: #FF4D4F;
    font-weight: bold;
  }
  
  // 横线延伸到右侧价格区域
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: -140rpx; // 延伸到价格区域
    height: 1rpx;
    background-color: #e8e8e8;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
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
  bottom: 100rpx; /* 底部导航栏高度，避免被遮挡 */
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