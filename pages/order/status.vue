<template>
  <view class="order-status">
    <!-- 顶部导航栏 -->
    <nav-bar title="订单状态" title-align="center"></nav-bar>

    <!-- 地图区域 -->
    <view class="map-section">
      <map
        class="map"
        :latitude="location.latitude"
        :longitude="location.longitude"
        :markers="markers"
        scale="16"
      ></map>
      <view class="map-tip">预计90分钟内接单</view>
      <view class="map-address">万达 <text class="address-detail">仟那 8栋</text></view>
      <view class="map-poi">阿杰24h自助台球</view>
    </view>

    <!-- 订单状态信息 -->
    <view class="status-card">
      <view class="status-icon">
        <text>待</text>
      </view>
      <view class="status-text">待接单</view>
      <view class="share-btn" @click="shareOrder">
        <image src="https://ccpt.qiniu.cc111.cn/publish/fenxiang.png" mode="aspectFit"></image>
        <text>分享订单</text>
      </view>

      <view class="status-desc">
        系统正在为您匹配跑腿员，请您耐心的等待~
      </view>

      <!-- 操作按钮组 -->
      <view class="action-group">
        <view class="action-item" @click="urgeOrder">
          <image src="https://ccpt.qiniu.cc111.cn/publish/cuidan.png" mode="aspectFit"></image>
          <text>催单</text>
        </view>
        <view class="action-item" @click="editOrder">
          <image src="https://ccpt.qiniu.cc111.cn/publish/gaidanxinxi.png" mode="aspectFit"></image>
          <text>改单信息</text>
        </view>
        <view class="action-item" @click="orderAgain">
          <image src="https://ccpt.qiniu.cc111.cn/publish/zailaiyidan.png" mode="aspectFit"></image>
          <text>再来一单</text>
        </view>
        <view class="action-item" @click="cancelOrder">
          <image src="https://ccpt.qiniu.cc111.cn/publish/quxiaodingdan.png" mode="aspectFit"></image>
          <text>取消订单</text>
        </view>
      </view>
    </view>

    <!-- 订单状态折叠面板 -->
    <view class="order-status-panel">
      <view class="panel-header" @click="toggleOrderStatus">
        <view class="status-icon-wrapper">
          <image class="status-icon" src="https://ccpt.qiniu.cc111.cn/publish/lujing.png" mode="aspectFit"></image>
          <text>订单状态</text>
        </view>
      </view>
    </view>

    <!-- 订单信息卡片 -->
    <view class="order-card">
      <view class="order-info">
        <view class="order-main">
          <image class="order-icon" src="https://ccpt.qiniu.cc111.cn/publish/banner.png" mode="aspectFit"></image>
          <view class="order-content">
            <view class="order-title">充充快跑【离线&异常】订单</view>
            <view class="order-number">订单编号：888888888888888</view>
          </view>
          <image class="arrow-icon" src="https://ccpt.qiniu.cc111.cn/publish/you.png" mode="aspectFit"></image>
        </view>

      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-button">
      <button class="btn" @click="goHome">返回首页</button>
    </view>

    <!-- 订单状态弹窗 -->
    <view class="order-status-popup" v-if="showOrderStatus">
      <view class="popup-mask" @click="toggleOrderStatus"></view>
      <view class="popup-content">
        <view class="popup-header">
          <text>订单状态</text>
          <view class="close-btn" @click="toggleOrderStatus">×</view>
        </view>
        <view class="status-timeline">
          <view class="timeline-item">
            <view class="timeline-dot"></view>
            <view class="timeline-content">
              <view class="timeline-title">已完成</view>
              <view class="timeline-time">等待中</view>
            </view>
          </view>
          <view class="timeline-item">
            <view class="timeline-dot"></view>
            <view class="timeline-content">
              <view class="timeline-title">已接单</view>
              <view class="timeline-time">等待中</view>
            </view>
          </view>
          <view class="timeline-item active">
            <view class="timeline-dot">✔</view>
            <view class="timeline-content">
              <view class="timeline-title">已下单</view>
              <view class="timeline-time">2023-06-15 14:30:25</view>
            </view>
          </view>
        </view>
      </view>
    </view>
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
      location: {
        latitude: 20.044412,
        longitude: 110.198667
      },
      markers: [{
        id: 1,
        latitude: 20.044412,
        longitude: 110.198667,
        iconPath: '/static/images/location.png',
        width: 32,
        height: 32
      }],
      showOrderStatus: false,
      orderId: ''
    }
  },
  onLoad(options) {
    if (options.id) {
      this.orderId = options.id
      // 这里可以根据订单ID加载订单详情
      console.log('加载订单ID:', this.orderId)
    }
  },
  methods: {
    shareOrder() {
      // 实现分享功能
    },
    urgeOrder() {
      uni.showToast({
        title: '已催单',
        icon: 'success'
      })
    },
    editOrder() {
      uni.navigateTo({
        url: '/pages/order/edit'
      })
    },
    orderAgain() {
      uni.navigateTo({
        url: '/pages/index/publish/index'
      })
    },
    cancelOrder() {
      uni.showModal({
        title: '提示',
        content: '确定要取消订单吗？',
        success: (res) => {
          if (res.confirm) {
            // 实现取消订单逻辑
          }
        }
      })
    },
    toggleOrderStatus() {
      this.showOrderStatus = !this.showOrderStatus
    },
    goHome() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.order-status {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;

  .map-section {
    position: relative;
    height: 770rpx;
    width: 100%;

    .map {
      width: 100%;
      height: 100%;
    }

    .map-tip {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 80rpx;
      background: #2979ff;
      color: #fff;
      padding: 8rpx 20rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
      z-index: 10;
    }

    .map-address {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 140rpx;
      color: #333;
      font-size: 28rpx;
      font-weight: bold;
      z-index: 10;
      background-color: rgba(255, 255, 255, 0.8);
      padding: 4rpx 16rpx;
      border-radius: 8rpx;

      .address-detail {
        color: #666;
        font-weight: normal;
      }
    }

    .map-poi {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 190rpx;
      color: #666;
      font-size: 24rpx;
      z-index: 10;
      background-color: rgba(255, 255, 255, 0.8);
      padding: 4rpx 16rpx;
      border-radius: 8rpx;
    }
  }

  .status-card {
    margin: 0;
    background: #fff;
    padding: 30rpx 20rpx 10rpx;
    position: relative;

    .status-icon {
      display: inline-block;
      width: 40rpx;
      height: 40rpx;
      line-height: 40rpx;
      text-align: center;
      background: #2979ff;
      color: #fff;
      border-radius: 50%;
      font-size: 24rpx;
      margin-right: 10rpx;
    }

    .status-text {
      display: inline-block;
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      vertical-align: middle;
    }

    .share-btn {
      position: absolute;
      right: 20rpx;
      top: 30rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #666;
      font-size: 22rpx;

      image {
        width: 32rpx;
        height: 32rpx;
        margin-bottom: 6rpx;
      }
    }

    .status-desc {
      font-size: 26rpx;
      color: #666;
      margin: 20rpx 0 30rpx;
    }

    .action-group {
      display: flex;
      justify-content: space-between;
      padding: 0 60rpx;
      margin-top: 50rpx;

      .action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 22rpx;
        color: #333;
        margin: 0 10rpx;

        image {
          width: 36rpx;
          height: 36rpx;
          margin-bottom: 8rpx;
        }
      }
    }
  }

  .order-status-panel {
    display: flex;
    justify-content: center;
    margin-top: 0;
    padding: 20rpx 0;
    background-color: #fff;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 22rpx;
      color: #999;

      .status-icon-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;

        .status-icon {
          width: 28rpx;
          height: 28rpx;
          margin-bottom: 6rpx;
        }
      }

      .arrow-icon {
        width: 24rpx;
        height: 24rpx;
        margin-left: 6rpx;
        transition: transform 0.3s;

        &.arrow-up {
          transform: rotate(180deg);
        }
      }
    }
  }

  .order-card {
    margin: 20rpx;
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;

    .order-info {
      display: flex;
      flex-direction: column;

      .order-main {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;

        .order-icon {
          width: 80rpx;
          height: 80rpx;
          margin-right: 20rpx;
          flex-shrink: 0;
          border-radius: 8rpx;
        }

        .order-content {
          flex: 1;

          .order-title {
            font-size: 28rpx;
            color: #333;
            margin-bottom: 6rpx;
          }

          .order-number {
            font-size: 24rpx;
            color: #999;
          }
        }

        .arrow-icon {
          width: 24rpx;
          height: 24rpx;
          margin-left: 20rpx;
          flex-shrink: 0;
        }
      }


    }
  }

  .bottom-button {
    display: flex;
    justify-content: center;
    margin: 40rpx 0;

    .btn {
      width: 240rpx;
      height: 80rpx;
      line-height: 80rpx;
      background: #fff;
      color: #333;
      font-size: 28rpx;
      border-radius: 40rpx;
      border: 2rpx solid #ddd;
    }
  }

  .order-status-popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;

    .popup-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
    }

    .popup-content {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      background: #fff;
      border-radius: 20rpx 20rpx 0 0;
      padding: 30rpx;
      transform: translateY(0);
      transition: transform 0.3s;

      .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 30rpx;
        border-bottom: 2rpx solid #f5f5f5;
        margin-bottom: 0;

        text {
          font-size: 32rpx;
          font-weight: 500;
          color: #333;
        }

        .close-btn {
          font-size: 40rpx;
          color: #999;
          line-height: 1;
        }
      }

      .status-timeline {
        padding: 30rpx 0;

        .timeline-item {
          position: relative;
          padding-left: 50rpx;
          margin-bottom: 40rpx;

          &:first-child {
            margin-bottom: 40rpx;
          }

          &:before {
            content: '';
            position: absolute;
            left: 10rpx;
            top: 50%;
            bottom: -40rpx;
            width: 2rpx;
            background: #ddd;
          }

          &:last-child:before {
            display: none;
          }

          &.active {
            .timeline-dot {
              background: #2979ff;
              border-color: rgba(41, 121, 255, 0.2);
              color: #fff;
              font-size: 16rpx;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24rpx;
              height: 24rpx;
            }

            .timeline-title {
              color: #2979ff;
            }
          }

          .timeline-dot {
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 20rpx;
            height: 20rpx;
            border-radius: 50%;
            background: #ddd;
            border: 6rpx solid rgba(0, 0, 0, 0.05);
          }

          .timeline-content {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .timeline-title {
              font-size: 28rpx;
              color: #333;
            }

            .timeline-time {
              font-size: 24rpx;
              color: #999;
            }
          }
        }
      }
    }
  }
}
</style>