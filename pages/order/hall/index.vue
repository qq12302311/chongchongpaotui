<template>
  <view class="order-hall">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="title">充充跑腿骑手端</view>
      <view class="right-icons">
        <image src="https://ccpt.qiniu.0871.cn/publish/more.png" mode="aspectFit" class="icon"></image>
        <image src="https://ccpt.qiniu.0871.cn/publish/message.png" mode="aspectFit" class="icon"></image>
      </view>
    </view>
    
    <!-- 城市选择器 -->
    <view class="city-selector" @click="selectCity">
      <text class="city-name">{{ currentCity }}</text>
      <text class="arrow">▼</text>
    </view>
    
    <!-- 广告横幅 -->
    <view class="banner">
      <image src="https://ccpt.qiniu.0871.cn/publish/banner_rider.png" mode="aspectFill"></image>
    </view>
    
    <!-- 接单大厅标题和搜索 -->
    <view class="hall-header">
      <view class="hall-title">接单大厅</view>
      <view class="search-box">
        <image src="https://ccpt.qiniu.0871.cn/publish/search.png" mode="aspectFit" class="search-icon"></image>
        <input type="text" placeholder="请输入搜索关键字" class="search-input" />
      </view>
    </view>
    
    <!-- 筛选选项卡 -->
    <view class="filter-tabs">
      <view class="tab-item" :class="{ active: activeTab === 'comprehensive' }" @click="setActiveTab('comprehensive')">
        <text>综合排序</text>
        <view class="active-line" v-if="activeTab === 'comprehensive'"></view>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'recent' }" @click="setActiveTab('recent')">
        <text>最近</text>
        <view class="active-line" v-if="activeTab === 'recent'"></view>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'price' }" @click="setActiveTab('price')">
        <text>价格</text>
        <view class="active-line" v-if="activeTab === 'price'"></view>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'area' }" @click="setActiveTab('area')">
        <text>地区</text>
        <image src="https://ccpt.qiniu.0871.cn/publish/arrow_down.png" mode="aspectFit" class="arrow-icon"></image>
        <view class="active-line" v-if="activeTab === 'area'"></view>
      </view>
    </view>
    
    <!-- 订单列表 -->
    <scroll-view scroll-y class="order-list">
      <view class="order-item" v-for="(order, index) in orderList" :key="index">
        <view class="order-header">
          <view class="order-info">
            <text class="order-number">订单编号：{{ order.orderNumber }}</text>
            <text class="special-tag" v-if="order.isSpecial">急单</text>
          </view>
          <view class="order-price">¥{{ order.price.toFixed(2) }}</view>
        </view>
        
        <view class="order-time">发单时间：{{ order.orderTime }}</view>
        
        <view class="order-content">
          <view class="order-icon" :class="order.serviceType">
            <text>{{ order.serviceTypeText }}</text>
          </view>
          
          <view class="order-details">
            <view class="address">{{ order.address }}</view>
            <view class="service-time">服务时间：{{ order.serviceTime }}</view>
            <view class="service-item">服务项目：{{ order.serviceItem }}</view>
          </view>
          
          <view class="distance-info">
            <image src="https://ccpt.qiniu.0871.cn/publish/location.png" mode="aspectFit" class="location-icon"></image>
            <text>距离{{ order.distance }}km</text>
          </view>
        </view>
        
        <view class="order-footer">
          <button class="take-order-btn" @click="takeOrder(order.id)">去接单</button>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部导航栏 -->
    <view class="tab-bar">
      <view class="tab-item active">
        <image src="https://ccpt.qiniu.0871.cn/publish/home_active.png" mode="aspectFit" class="tab-icon"></image>
        <text class="tab-text">接单大厅</text>
      </view>
      <view class="tab-item" @click="navigateTo('/pages/order/order')">
        <image src="https://ccpt.qiniu.0871.cn/publish/order.png" mode="aspectFit" class="tab-icon"></image>
        <text class="tab-text">订单</text>
      </view>
      <view class="tab-item" @click="navigateTo('/pages/my/my')">
        <image src="https://ccpt.qiniu.0871.cn/publish/my.png" mode="aspectFit" class="tab-icon"></image>
        <text class="tab-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentCity: '海南',
      activeTab: 'comprehensive',
      orderList: [
        {
          id: 1,
          orderNumber: '8888888888888',
          isSpecial: true,
          price: 21.00,
          orderTime: '2025-4-12 13: 05',
          serviceType: 'repair',
          serviceTypeText: '修',
          address: '龙华区博雅巷3栋铺面88号',
          serviceTime: '2025-4-12 14: 00-18: 00',
          serviceItem: '补充设备x1台 小电源线x1根',
          distance: 2
        },
        {
          id: 2,
          orderNumber: '8888888888888',
          isSpecial: true,
          price: 21.00,
          orderTime: '2025-4-12 11: 15',
          serviceType: 'supplement',
          serviceTypeText: '补',
          address: '龙华区博雅巷3栋铺面88号',
          serviceTime: '2025-4-12 14: 00-18: 00',
          serviceItem: '补宝x5台',
          distance: 2
        },
        {
          id: 3,
          orderNumber: '8888888888888',
          isSpecial: true,
          price: 21.00,
          orderTime: '2025-4-12 11: 15',
          serviceType: 'supplement',
          serviceTypeText: '补',
          address: '龙华区博雅巷3栋铺面88号',
          serviceTime: '2025-4-12 14: 00-18: 00',
          serviceItem: '补宝x5台',
          distance: 2
        }
      ]
    }
  },
  methods: {
    selectCity() {
      uni.navigateTo({
        url: '/pages/index/city/index'
      })
    },
    setActiveTab(tab) {
      this.activeTab = tab
    },
    takeOrder(orderId) {
      uni.showModal({
        title: '确认接单',
        content: '您确定要接此单吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '接单成功',
              icon: 'success'
            })
          }
        }
      })
    },
    navigateTo(url) {
      uni.navigateTo({
        url: url
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.order-hall {
  min-height: 100vh;
  background-color: #f5f5f5;
  position: relative;
  padding-bottom: 100rpx;
}

.nav-bar {
  height: 88rpx;
  background-color: #2492F2;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  padding-top: 44rpx; /* 适配状态栏 */
  
  .title {
    font-size: 34rpx;
    font-weight: 500;
  }
  
  .right-icons {
    display: flex;
    align-items: center;
    
    .icon {
      width: 44rpx;
      height: 44rpx;
      margin-left: 30rpx;
    }
  }
}

.city-selector {
  height: 80rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1rpx solid #eee;
  
  .city-name {
    font-size: 28rpx;
    color: #333;
    margin-right: 10rpx;
  }
  
  .arrow {
    font-size: 24rpx;
    color: #999;
    transform: scale(0.8);
  }
}

.banner {
  width: 100%;
  height: 300rpx;
  
  image {
    width: 100%;
    height: 100%;
  }
}

.hall-header {
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .hall-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
  
  .search-box {
    flex: 1;
    height: 64rpx;
    background-color: #fff;
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    margin-left: 20rpx;
    
    .search-icon {
      width: 32rpx;
      height: 32rpx;
      margin-right: 10rpx;
    }
    
    .search-input {
      flex: 1;
      height: 100%;
      font-size: 26rpx;
      color: #333;
    }
  }
}

.filter-tabs {
  height: 80rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-bottom: 1rpx solid #eee;
  
  .tab-item {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 0 20rpx;
    
    text {
      font-size: 28rpx;
      color: #666;
    }
    
    .arrow-icon {
      width: 24rpx;
      height: 24rpx;
      margin-left: 6rpx;
    }
    
    .active-line {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      background-color: #2492F2;
    }
    
    &.active {
      text {
        color: #2492F2;
        font-weight: 500;
      }
    }
  }
}

.order-list {
  height: calc(100vh - 600rpx);
  
  .order-item {
    background-color: #fff;
    margin: 20rpx;
    border-radius: 12rpx;
    padding: 20rpx;
    
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10rpx;
      
      .order-info {
        display: flex;
        align-items: center;
        
        .order-number {
          font-size: 26rpx;
          color: #666;
        }
        
        .special-tag {
          font-size: 22rpx;
          color: #fff;
          background-color: #ff6b00;
          padding: 2rpx 10rpx;
          border-radius: 4rpx;
          margin-left: 10rpx;
        }
      }
      
      .order-price {
        font-size: 32rpx;
        color: #ff6b00;
        font-weight: 500;
      }
    }
    
    .order-time {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 20rpx;
    }
    
    .order-content {
      display: flex;
      align-items: flex-start;
      
      .order-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 10rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;
        flex-shrink: 0;
        
        text {
          font-size: 36rpx;
          color: #fff;
          font-weight: bold;
        }
        
        &.repair {
          background-color: #2492F2;
        }
        
        &.supplement {
          background-color: #2492F2;
        }
      }
      
      .order-details {
        flex: 1;
        
        .address {
          font-size: 30rpx;
          color: #333;
          font-weight: 500;
          margin-bottom: 10rpx;
        }
        
        .service-time, .service-item {
          font-size: 26rpx;
          color: #666;
          margin-bottom: 6rpx;
        }
      }
      
      .distance-info {
        display: flex;
        align-items: center;
        margin-left: 20rpx;
        flex-shrink: 0;
        
        .location-icon {
          width: 24rpx;
          height: 24rpx;
          margin-right: 6rpx;
        }
        
        text {
          font-size: 24rpx;
          color: #2492F2;
        }
      }
    }
    
    .order-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 20rpx;
      
      .take-order-btn {
        width: 160rpx;
        height: 60rpx;
        line-height: 60rpx;
        background-color: #ff6b00;
        color: #fff;
        font-size: 26rpx;
        border-radius: 30rpx;
        text-align: center;
        padding: 0;
      }
    }
  }
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1rpx solid #eee;
  
  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .tab-icon {
      width: 44rpx;
      height: 44rpx;
      margin-bottom: 6rpx;
    }
    
    .tab-text {
      font-size: 24rpx;
      color: #999;
    }
    
    &.active {
      .tab-text {
        color: #2492F2;
      }
    }
  }
}
</style>
