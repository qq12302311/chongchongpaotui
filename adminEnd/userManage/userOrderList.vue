<template>
  <view class="user-order-list-container">
    <nav-bar title="用户订单" title-align="center" :showBackButton="true"></nav-bar>
    <view class="nav-placeholder" :style="{ height: navBarHeight + 'px' }"></view>
    <view class="order-status-tabs">
      <view v-for="tab in tabs" :key="tab.value" :class="['tab-item', {active: currentStatus === tab.value}]" @click="switchTab(tab.value)">
        <text class="tab-label">{{ tab.label }}</text>
      </view>
    </view>
    <scroll-view class="order-list" scroll-y @scrolltolower="loadMore" lower-threshold="50">
      <view v-if="loading && orderList.length === 0" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      <view v-else-if="orderList.length === 0" class="empty-state">
        <view class="empty-icon"></view>
        <text class="empty-text">暂无相关订单</text>
      </view>
      <view v-else class="order-list-content">
        <view class="order-item" v-for="(order, index) in orderList" :key="index">
          <view class="order-header">
            <view class="order-number">订单号：{{ order.task_no }}</view>
            <view class="order-status" :class="order.status">{{ getStatusText(order.status, order) }}</view>
          </view>
          <view class="order-info">
            <view class="info-row">
              <text class="info-label">服务类型：</text>
              <view class="info-value">
                <text v-if="order.brand" class="brand-text">{{ getBrandName(order.brand) }}</text>
                <text class="type-text">{{ order.task_name }}</text>
                <text v-if="order.task_detail && order.task_detail.item_number" class="quantity-text">x{{ order.task_detail.item_number }}</text>
              </view>
            </view>
            <view class="info-row" v-if="order.time_limit">
              <text class="info-label">服务时效：</text>
              <text class="info-value">{{ order.time_limit }}小时内 <text class="deadline-text" v-if="order.deadline">({{ formatDeadline(order.deadline) }}前完成)</text></text>
            </view>
            <view class="info-row">
              <text class="info-label">门店名称：</text>
              <text class="info-value">{{ order.task_detail && order.task_detail.store_name ? order.task_detail.store_name : '未指定门店' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">订单地址：</text>
              <text class="info-value">{{ order.province_name || '' }}{{ order.city_name || '' }}{{ order.district_name || '' }}{{ order.task_detail && order.task_detail.address ? order.task_detail.address : '' }}</text>
            </view>
            <view class="info-row order-time-row">
              <text class="info-label">下单时间：</text>
              <text class="info-value">{{ order.task_date }}</text>
              <text class="order-amount">¥{{ parseFloat(order.order_amount).toFixed(2) }}</text>
            </view>
          </view>
        </view>
      </view>
      <view v-if="orderList.length > 0 && hasMore && !loadingMore" class="load-more" @click="loadMore">
        <text>点击加载更多</text>
      </view>
      <view v-else-if="orderList.length > 0 && loadingMore" class="load-more loading">
        <view class="loading-spinner-small"></view>
        <text>正在加载更多...</text>
      </view>
      <view v-else-if="orderList.length > 0 && !hasMore" class="no-more">
        <text>没有更多数据了</text>
      </view>
    </scroll-view>
    <view style="height: env(safe-area-inset-bottom, 0px);"></view>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import md5 from 'md5'
export default {
  components: { NavBar },
  data() {
    return {
      navBarHeight: 0,
      userId: '',
	  openid: '',
      tabs: [
        { label: '全部', value: 'all' },
        { label: '新任务', value: 'waiting' },
        { label: '进行中', value: 'inProgress' },
        { label: '已取消', value: 'canceled' },
        { label: '已完成', value: 'completed' }
      ],
      currentStatus: 'all',
      orderList: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      loading: false,
      loadingMore: false,
	  riderUserInfo: null
    }
  },
  onLoad(options) {
    this.userId = options.user_id || ''
	this.openid = options.openid
    const systemInfo = uni.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 0;
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48;
    this.navBarHeight = statusBarHeight + navBarHeight;
    // 获取骑手信息
    this.riderUserInfo = uni.getStorageSync('riderUserInfo')
    this.fetchOrders(true)
  },
  methods: {
    switchTab(status) {
      if (this.currentStatus === status) return
      this.currentStatus = status
      this.page = 1
      this.orderList = []
      this.hasMore = true
      this.fetchOrders(true)
    },
    async fetchOrders(reset = false) {
      if (reset) {
        this.loading = true
        this.page = 1
        this.orderList = []
        this.hasMore = true
      } else {
        this.loadingMore = true
      }
      let statusParam = this.currentStatus
      if (statusParam === 'inProgress') statusParam = ['assigned', 'finished']
      if (statusParam === 'all') statusParam = ''
		const signStr = `user_id=${this.userId}&openid=${this.openid}`
		const sign = md5(signStr)
      const params = {
        page: this.page,
        pageSize: this.pageSize,
        sign: sign,
        user_id: this.userId
      }
      if (statusParam) params.status = statusParam
      try {
        const res = await this.$request('task/list', params, 'POST')
        if (res.code === 200 && res.data) {
          const newOrders = res.data || []
          if (reset) {
            this.orderList = newOrders
          } else {
            this.orderList = [...this.orderList, ...newOrders]
          }
          this.hasMore = newOrders.length >= this.pageSize
        } else {
          this.hasMore = false
        }
      } catch (e) {
        this.hasMore = false
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },
    loadMore() {
      if (!this.hasMore || this.loadingMore) return
      this.page++
      this.fetchOrders()
    },
    getStatusText(status, order = null) {
      if (status === 'assigned' && order && order.time_out === true) {
        return '进行中（超时订单）'
      }
      if (status === 'waiting' && order && order.deadline) {
        const deadline = new Date(order.deadline).getTime()
        const now = Date.now()
        if (!isNaN(deadline) && deadline < now) {
          return '待接单（已超时）'
        }
      }
      const statusMap = {
        'waiting': '新任务',
        'assigned': '进行中',
        'finished': '进行中',
        'completed': '已完成',
        'canceled': '已取消',
        'refunded': '已退款'
      }
      return statusMap[status] || status
    },
    getBrandName(brandCode) {
      const brandMap = {
        'meituan': '美团',
        'guaishou': '怪兽',
        'jiedian': '街电',
        'xiaodian': '小电'
      }
      return brandMap[brandCode] || brandCode
    },
    formatDeadline(deadline) {
      if (!deadline) return ''
      let deadlineDate
      try {
        deadlineDate = new Date(deadline)
        if (isNaN(deadlineDate.getTime())) return deadline
        const month = (deadlineDate.getMonth() + 1).toString().padStart(2, '0')
        const day = deadlineDate.getDate().toString().padStart(2, '0')
        const hours = deadlineDate.getHours().toString().padStart(2, '0')
        const minutes = deadlineDate.getMinutes().toString().padStart(2, '0')
        return `${month}-${day} ${hours}:${minutes}`
      } catch (err) {
        return deadline
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.user-order-list-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: "HarmonyOS Sans SC", "PingFang SC", sans-serif;
  color: #333;
  font-size: 28rpx;
  line-height: 1.5;
}
.nav-placeholder {
  width: 100%;
}
.order-status-tabs {
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 10;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0 18rpx 0;
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
  position: relative;
  cursor: pointer;
}
.tab-item.active {
  color: #2492F2;
  font-weight: 700;
  border-bottom: 4rpx solid #2492F2;
  background: #f8f9fa;
}
.tab-label {
  font-size: 22rpx;
}
.order-list {
  flex: 1;
  min-height: 400rpx;
  padding: 0 20rpx;
  background: transparent;
}
.order-list-content {
  margin-top: 10rpx;
}
.order-item {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.order-number {
  font-size: 22rpx;
  color: #333;
  font-weight: 500;
}
.order-status {
  font-size: 20rpx;
  padding: 4rpx 10rpx;
  border-radius: 4rpx;
  display: inline-block;
  background: #f5f5f5;
  color: #2492F2;
}
.order-info {
  margin-bottom: 10rpx;
}
.info-row {
  display: flex;
  margin-bottom: 10rpx;
  font-size: 22rpx;
}
.info-label {
  color: #999;
  width: 120rpx;
}
.info-value {
  color: #333;
  flex: 1;
}
.brand-text {
  color: #666;
  margin-right: 12rpx;
}
.type-text {
  color: #333;
}
.quantity-text {
  color: #2492F2;
  font-weight: 500;
  margin-left: 4rpx;
}
.deadline-text {
  color: #666;
  font-size: 20rpx;
  margin-left: 10rpx;
}
.order-time-row {
  position: relative;
}
.order-amount {
  position: absolute;
  right: 0;
  top: 0;
  color: #ff4d4f;
  font-weight: 500;
}
.loading-container {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #2492F2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.loading-text {
  margin-top: 20rpx;
  font-size: 22rpx;
  color: #999;
}
.empty-state {
  padding: 100rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.empty-icon {
  width: 120rpx;
  height: 120rpx;
  background-color: #f5f5f5;
  border-radius: 50%;
  margin-bottom: 30rpx;
}
.empty-text {
  font-size: 22rpx;
  color: #999;
}
.load-more, .no-more {
  text-align: center;
  padding: 24rpx;
  color: #2492F2;
  font-size: 22rpx;
}
.load-more.loading {
  color: #999;
}
.loading-spinner-small {
  width: 28rpx;
  height: 28rpx;
  border: 2rpx solid #f3f3f3;
  border-top: 2rpx solid #2492F2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8rpx;
}
</style> 