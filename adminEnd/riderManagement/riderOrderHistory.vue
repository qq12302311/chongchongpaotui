<template>
  <view class="rider-order-history-page">
    <!-- 顶部导航栏 -->
    <nav-bar :title="pageTitle" title-align="center"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 骑手信息卡片 -->
    <view class="rider-info-card">
      <view class="rider-avatar">
        <image src="https://ccpt.qiniu.cc111.cn/rider/verify/touxiang.png" mode="aspectFill"></image>
      </view>
      <view class="rider-details">
        <view class="rider-name">{{ riderInfo.real_name || riderInfo.contact_person || '骑手' }}</view>
        <view class="rider-phone">{{ riderInfo.phone_number }}</view>
      </view>
      <view class="rider-stats">
        <view class="stat-item">
          <text class="stat-value">{{ totalOrders }}</text>
          <text class="stat-label">总订单</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">¥{{ totalCommission }}</text>
          <text class="stat-label">总收入</text>
        </view>
      </view>
    </view>

    <!-- 搜索区域 -->
    <view class="search-area">
      <view class="search-box">
        <view class="search-icon-container">
          <image src="https://ccpt.qiniu.cc111.cn/rider/sousuo.png" mode="aspectFit" class="search-icon"></image>
        </view>
        <input 
          type="text" 
          v-model="searchKeyword"
          placeholder="输入订单号搜索" 
          class="search-input"
          @confirm="searchOrders"
        />
        <view class="search-btn" @click="searchOrders">搜索</view>
      </view>
    </view>

    <!-- 订单状态选项卡 -->
    <view class="order-tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab-item"
        :class="{ active: activeTab === index }"
        @click="switchTab(index)"
      >
        <view class="tab-content">
          <text>{{ tab.name }}</text>
          <view class="badge" v-if="tab.count > 0">{{ tab.count }}</view>
        </view>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view
      class="order-list"
      scroll-y
      @scrolltolower="onScrollToLower"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="refreshOrders"
      :refresher-threshold="100"
      lower-threshold="50"
    >
      <!-- 加载中提示 -->
      <view v-if="loading && page === 1" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 订单列表 -->
      <view v-else>
        <view 
          class="order-item" 
          v-for="(order, index) in orderList" 
          :key="index"
          @click="goToOrderDetail(order.id)"
        >
          <view class="status-tag" :class="order.status">
            <text v-if="order.status === 'waiting'">等待接单</text>
            <text v-else-if="order.status === 'assigned'">已接单</text>
            <text v-else-if="order.status === 'finished'">待确认</text>
            <text v-else-if="order.status === 'completed'">已完成</text>
            <text v-else-if="order.status === 'canceled'">已取消</text>
          </view>

          <view class="order-header">
            <view class="order-info">
              <text class="order-number">订单编号：{{ order.orderNumber }}</text>
              <view class="copy-btn" @click.stop="copyOrderNumber(order.orderNumber)">复制</view>
            </view>
            <view class="order-time-row">
              <text class="order-time">发单时间：{{ order.task_date }}</text>
            </view>
          </view>

          <view class="order-content">
            <view class="order-icon" :class="[order.serviceType, getBrandClass(order.brand), !order.doorImage ? 'no-image' : '']">
              <image v-if="order.doorImage" :src="order.doorImage" mode="aspectFill" class="door-image" />
              <view v-else class="icon-content">
                <text class="brand-text">{{ getBrandText(order.brand) }}</text>
                <text class="service-text">{{ order.serviceTypeText }}</text>
              </view>
            </view>

            <view class="order-details">
              <view class="store-name-row">
                <text class="store-name">{{ formatStoreName(order.storeName) }}</text>
                <text class="price">{{ order.price }}</text>
              </view>
              <view class="service-time">服务时间：<text class="highlight">{{ order.serviceTime }}</text></view>
              <view class="service-item">服务项目：<text class="highlight">{{ order.serviceItem }}</text></view>
            </view>

            <view class="arrow-right">
              <view class="arrow"></view>
            </view>
          </view>

          <view class="order-footer">
            <view class="distance-info">
              <image src="https://ccpt.qiniu.cc111.cn/rider/map2.png" mode="aspectFit" class="location-icon"></image>
              <text class="distance-text">{{ order.address }}</text>
            </view>
          </view>
        </view>

        <!-- 无数据提示 -->
        <view v-if="!loading && orderList.length === 0" class="empty-tip">
          <image src="https://ccpt.qiniu.cc111.cn/rider/empty.png" mode="aspectFit" class="empty-image"></image>
          <text class="empty-text">暂无订单记录</text>
        </view>

        <!-- 加载更多提示 -->
        <view v-if="loading && page > 1" class="loading-more">
          <text>加载中...</text>
        </view>

        <!-- 没有更多数据提示 -->
        <view v-if="!loading && !hasMore && orderList.length > 0" class="no-more">
          <text>没有更多数据了</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import md5 from 'md5'

export default {
  components: {
    NavBar
  },
  data() {
    return {
      riderId: '',
      riderInfo: {},
      adminInfo: null,
      tabs: [
        { name: '全部', count: 0, status: 'all' },
        { name: '进行中', count: 0, status: 'assigned' },
        { name: '已完成', count: 0, status: 'completed' },
        { name: '已取消', count: 0, status: 'canceled' }
      ],
      currentStatus: 'all',
      activeTab: 0,
      orderList: [],
      loading: false,
      refreshing: false,
      page: 1,
      pageSize: 10,
      hasMore: true,
      searchKeyword: '',
      totalOrders: 0,
      totalCommission: '0.00'
    }
  },
  computed: {
    pageTitle() {
      return `${this.riderInfo.real_name || this.riderInfo.contact_person || '骑手'}的接单历史`
    }
  },
  onLoad(options) {
    console.log('页面参数 options:', options)
    
    // 获取管理员信息
    const adminInfo = uni.getStorageSync('riderUserInfo')
    if (!adminInfo || !adminInfo.id) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
      return
    }
    this.adminInfo = adminInfo

    // 获取骑手ID
    if (options.riderId) {
      this.riderId = options.riderId
      console.log('接收到骑手ID:', this.riderId)
    } else {
      console.error('未接收到骑手ID参数')
      uni.showToast({
        title: '缺少骑手ID参数',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
      return
    }

    // 解析骑手信息
    if (options.riderInfo) {
      try {
        this.riderInfo = JSON.parse(decodeURIComponent(options.riderInfo))
        console.log('解析骑手信息成功:', this.riderInfo)
      } catch (e) {
        console.error('解析骑手信息失败:', e)
        this.riderInfo = {}
      }
    }

    // 加载数据
    this.getOrderList()
    this.getRiderStats()
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      if (this.loading) return

      this.loading = true
      try {
        // 使用管理员身份查询指定骑手的订单
        const params = {
          per_page: this.pageSize,
          page: this.page,
          service_member_id: this.riderId,  // 要查询的骑手 ID
          sign: 'chongchong'                // 签名
        }

        // 如果不是全部状态，添加状态筛选
        if (this.currentStatus !== 'all') {
          params.status = this.currentStatus
        }

        // 如果有搜索关键词
        if (this.searchKeyword) {
          params.keyword = this.searchKeyword
        }

        const res = await this.$request('task/list', params, 'POST')

        if (res.code === 200 && res.data) {
          const newOrders = res.data.map(item => {
            // 构建完整地址
            let fullAddress = ''
            if (item.shop_address) {
              fullAddress = [
                item.province_name,
                item.city_name,
                item.district_name,
                item.shop_address
              ].filter(Boolean).join('')
            }

            return {
              id: item.task_id,
              orderNumber: item.task_no,
              task_date: item.task_date,
              price: `¥${parseFloat(item.order_amount).toFixed(2)}`,
              serviceType: this.getServiceTypeClass(item.task_detail?.detail || item.task_name),
              serviceTypeText: this.getServiceTypeDisplayText(item.task_detail?.detail || item.task_name),
              storeName: item.task_detail?.store_name || '未知店铺',
              serviceTime: this.formatServiceTime(item.task_date, item.deadline, item.time_limit),
              serviceItem: this.formatServiceItems(item.task_detail),
              latitude: item.latitude,
              longitude: item.longitude,
              status: item.status,
              address: fullAddress || '未知地址',
              doorImage: item.task_detail && item.task_detail.pic_url && item.task_detail.pic_url.length > 0 ? item.task_detail.pic_url[0] : '',
              brand: item.brand || ''
            }
          })

          // 追加或替换数据
          if (this.page === 1) {
            this.orderList = newOrders
          } else {
            this.orderList = [...this.orderList, ...newOrders]
          }

          // 判断是否还有更多数据
          this.hasMore = newOrders.length === this.pageSize
        } else {
          uni.showToast({
            title: res.msg || '获取订单列表失败',
            icon: 'none'
          })
        }
      } catch (err) {
        console.error('获取订单列表失败:', err)
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    // 获取骑手统计数据
    async getRiderStats() {
      try {
        const res = await this.$request('service/member/info', {
          service_member_id: this.riderId,  // 要查询的骑手 ID
          member_id: this.riderId,          // 要查询的骑手 ID
          sign: 'chongchong'                // 签名
        }, 'POST')

        if (res.status === 'success' && res.data) {
          this.totalOrders = res.data.total_completed_tasks_count || 0
          this.totalCommission = parseFloat(res.data.total_commission || 0).toFixed(2)
        }
      } catch (err) {
        console.error('获取骑手统计数据失败:', err)
      }
    },

    // 更新标签计数
    async updateTabCounts() {
      try {
        for (let i = 0; i < this.tabs.length; i++) {
          const tab = this.tabs[i]
          const params = {
            per_page: 1,
            page: 1,
            service_member_id: this.riderId,  // 要查询的骑手 ID
            sign: 'chongchong'                // 签名
          }
          
          if (tab.status !== 'all') {
            params.status = tab.status
          }

          const res = await this.$request('task/list', params, 'POST')
          if (res.code === 200) {
            this.tabs[i].count = res.total || 0
          }
        }
      } catch (err) {
        console.error('更新标签计数失败:', err)
      }
    },

    // 切换标签
    switchTab(index) {
      this.activeTab = index
      this.currentStatus = this.tabs[index].status
      this.page = 1
      this.orderList = []
      this.hasMore = true
      this.getOrderList()
    },

    // 搜索订单
    searchOrders() {
      this.page = 1
      this.orderList = []
      this.hasMore = true
      this.getOrderList()
    },

    // 下拉刷新
    refreshOrders() {
      this.refreshing = true
      this.page = 1
      this.orderList = []
      this.hasMore = true
      this.getOrderList()
      this.getRiderStats()
    },

    // 滚动到底部
    onScrollToLower() {
      if (this.hasMore && !this.loading) {
        this.page++
        this.getOrderList()
      }
    },

    // 格式化服务时间
    formatServiceTime(startTime, endTime, timeLimit) {
      if (!endTime) return ''

      try {
        const endDate = new Date(endTime.replace(/-/g, '/'))
        const month = String(endDate.getMonth() + 1).padStart(2, '0')
        const day = String(endDate.getDate()).padStart(2, '0')
        const hours = String(endDate.getHours()).padStart(2, '0')
        const minutes = String(endDate.getMinutes()).padStart(2, '0')
        const formattedEndTime = `${month}-${day} ${hours}:${minutes}`

        const timeLimitText = timeLimit ? `${timeLimit}h内` : '24h内'
        return `${timeLimitText} ${formattedEndTime}前完成`
      } catch (err) {
        console.error('Format service time error:', err)
        return ''
      }
    },

    // 格式化服务项目
    formatServiceItems(taskDetail) {
      if (!taskDetail) return ''

      const items = []

      if (taskDetail.detail) {
        let itemName
        switch (taskDetail.detail) {
          case 'bubao':
            itemName = '补宝'
            break
          case 'offline_abnormal':
            itemName = '离线异常'
            break
          case 'income_abnormal':
            itemName = '收入异常'
            break
          case 'other_abnormal':
            itemName = '其他异常'
            break
          default:
            itemName = taskDetail.detail
        }
        items.push(`${itemName}x${taskDetail.item_number || 1}`)
      }

      for (let i = 1; i <= 6; i++) {
        const task = taskDetail[`extra_task_${i}`]
        const number = taskDetail[`extra_task_${i}_item_number`]
        if (task && number) {
          items.push(`${task}x${number}`)
        }
      }

      return items.join('、')
    },

    // 获取服务类型CSS类名
    getServiceTypeClass(detail) {
      switch (detail) {
        case 'bubao':
          return 'supplement'
        case 'offline_abnormal':
          return 'offline-abnormal'
        case 'income_abnormal':
          return 'income-abnormal'
        case 'other_abnormal':
          return 'other-abnormal'
        default:
          return 'repair'
      }
    },

    // 获取服务类型显示文本
    getServiceTypeDisplayText(detail) {
      switch (detail) {
        case 'bubao':
          return '补宝'
        case 'offline_abnormal':
          return '离线'
        case 'income_abnormal':
          return '收入'
        case 'other_abnormal':
          return '其他'
        default:
          return detail ? detail.substring(0, 2) : ''
      }
    },

    // 获取品牌样式类名
    getBrandClass(brand) {
      if (!brand) return 'brand-default'
      return `brand-${brand}`
    },

    // 获取品牌显示文字
    getBrandText(brand) {
      const brandMap = {
        'meituan': '美团',
        'guaishou': '怪兽',
        'jiedian': '街电',
        'xiaodian': '小电',
        'zhumang': '竹芒'
      }
      return brandMap[brand] || '充充'
    },

    // 格式化店铺名称
    formatStoreName(name) {
      if (!name) return ''
      return name.replace(/\s+/g, '')
    },

    // 复制订单号
    copyOrderNumber(orderNumber) {
      uni.setClipboardData({
        data: orderNumber,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          })
        }
      })
    },

    // 跳转到订单详情
    goToOrderDetail(orderId) {
      uni.navigateTo({
        url: `/adminEnd/orderManage/detail?id=${orderId}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.rider-order-history-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4f8 0%, #ffffff 100%);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-placeholder {
  height: 200rpx;
  width: 100%;
}

/* 骑手信息卡片 */
.rider-info-card {
  margin: 20rpx 20rpx 10rpx 20rpx;
  padding: 30rpx;
  background: linear-gradient(135deg, #2492F2 0%, #1565C0 100%);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  display: flex;
  align-items: center;

  .rider-avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    overflow: hidden;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    background: #fff;

    image {
      width: 100%;
      height: 100%;
    }
  }

  .rider-details {
    flex: 1;
    margin-left: 20rpx;

    .rider-name {
      font-size: 32rpx;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 8rpx;
    }

    .rider-phone {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .rider-stats {
    display: flex;
    align-items: center;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 20rpx;

      .stat-value {
        font-size: 28rpx;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 4rpx;
      }

      .stat-label {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .stat-divider {
      width: 1rpx;
      height: 40rpx;
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

/* 搜索区域 */
.search-area {
  padding: 10rpx 20rpx;
  background-color: transparent;

  .search-box {
    height: 70rpx;
    background-color: #fff;
    border-radius: 35rpx;
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

    .search-icon-container {
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .search-icon {
      width: 30rpx;
      height: 30rpx;
      opacity: 0.5;
    }

    .search-input {
      flex: 1;
      height: 100%;
      font-size: 28rpx;
      color: #333;
      padding-left: 10rpx;
    }

    .search-input::placeholder {
      color: #999;
    }

    .search-btn {
      padding: 8rpx 20rpx;
      background: linear-gradient(135deg, #2492F2 0%, #1565C0 100%);
      color: #fff;
      font-size: 26rpx;
      border-radius: 20rpx;
    }
  }
}

/* 订单状态选项卡 */
.order-tabs {
  display: flex;
  background-color: #fff;
  margin: 10rpx 20rpx;
  border-radius: 16rpx;
  padding: 10rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60rpx;
    border-radius: 12rpx;
    position: relative;
    transition: all 0.3s ease;

    .tab-content {
      position: relative;
      display: inline-block;
    }

    text {
      font-size: 28rpx;
      color: #666;
      transition: all 0.3s ease;
    }

    .badge {
      position: absolute;
      top: -12rpx;
      right: -24rpx;
      min-width: 32rpx;
      height: 32rpx;
      background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);
      color: #fff;
      font-size: 20rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8rpx;
      box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.4);
    }

    &.active {
      background: linear-gradient(135deg, #2492F2 0%, #1565C0 100%);

      text {
        color: #ffffff;
        font-weight: 600;
      }
    }
  }
}

/* 订单列表 */
.order-list {
  height: calc(100vh - 580rpx);
  padding: 10rpx 10rpx 10rpx 20rpx;
  box-sizing: border-box;

  .order-item {
    margin-bottom: 20rpx;
    margin-right: 10rpx;
    border-radius: 16rpx;
    padding: 24rpx;
    background: #ffffff;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    position: relative;
    transition: all 0.3s ease;
    box-sizing: border-box;

    &:active {
      transform: scale(0.98);
    }

    .status-tag {
      position: absolute;
      top: 24rpx;
      right: 24rpx;
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      font-size: 22rpx;
      font-weight: 500;

      &.waiting {
        background: linear-gradient(135deg, #FFD93D 0%, #FFA938 100%);
        color: #fff;
      }

      &.assigned {
        background: linear-gradient(135deg, #6DD5FA 0%, #2980B9 100%);
        color: #fff;
      }

      &.finished {
        background: linear-gradient(135deg, #A8E063 0%, #56AB2F 100%);
        color: #fff;
      }

      &.completed {
        background: linear-gradient(135deg, #A8E063 0%, #56AB2F 100%);
        color: #fff;
      }

      &.canceled {
        background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
        color: #fff;
      }
    }

    .order-header {
      display: flex;
      flex-direction: column;
      padding-bottom: 15rpx;
      border-bottom: 1rpx solid #f0f0f0;
      margin-bottom: 15rpx;

      .order-info {
        display: flex;
        align-items: center;
        margin-bottom: 10rpx;

        .order-number {
          font-size: 26rpx;
          color: #666;
        }

        .copy-btn {
          font-size: 22rpx;
          color: #fff;
          background: linear-gradient(135deg, #2492F2 0%, #1565C0 100%);
          padding: 6rpx 16rpx;
          border-radius: 12rpx;
          margin-left: 10rpx;
        }
      }

      .order-time-row {
        .order-time {
          font-size: 24rpx;
          color: #999;
        }
      }
    }

    .order-content {
      display: flex;
      align-items: stretch;
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid #f0f0f0;
      position: relative;

      .order-icon {
        width: 100rpx;
        height: 110rpx;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;
        flex-shrink: 0;

        .icon-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .brand-text,
          .service-text {
            font-size: 36rpx;
            color: #fff;
            font-weight: bold;
            line-height: 1.2;
          }

          .brand-text {
            margin-bottom: 8rpx;
          }
        }

        &.no-image {
          background: linear-gradient(135deg, #2492F2 0%, #1565C0 100%);
        }

        &.brand-meituan {
          background: linear-gradient(135deg, #FFE55C 0%, #FFC837 100%) !important;

          .brand-text,
          .service-text {
            color: #333 !important;
          }
        }

        &.brand-guaishou {
          background: linear-gradient(135deg, #43E97B 0%, #38F9D7 100%) !important;
        }

        &.brand-jiedian {
          background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%) !important;
        }

        .door-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12rpx;
        }
      }

      .order-details {
        flex: 1;
        padding-right: 30rpx;

        .store-name-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10rpx;

          .store-name {
            font-size: 30rpx;
            color: #333;
            font-weight: 600;
            max-width: 60%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .price {
            font-size: 32rpx;
            font-weight: 600;
            background: linear-gradient(135deg, #2492F2 0%, #1565C0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        }

        .service-time,
        .service-item {
          font-size: 24rpx;
          color: #666;
          margin-bottom: 6rpx;
          line-height: 1.6;

          .highlight {
            color: #2492F2;
          }
        }
      }

      .arrow-right {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);

        .arrow {
          width: 16rpx;
          height: 16rpx;
          border-top: 2rpx solid #ccc;
          border-right: 2rpx solid #ccc;
          transform: rotate(45deg);
        }
      }
    }

    .order-footer {
      margin-top: 20rpx;

      .distance-info {
        display: flex;
        align-items: center;

        .location-icon {
          width: 32rpx;
          height: 32rpx;
          margin-right: 8rpx;
        }

        .distance-text {
          font-size: 24rpx;
          color: #667eea;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80rpx 0;

    .loading-spinner {
      width: 60rpx;
      height: 60rpx;
      border: 4rpx solid #f3f3f3;
      border-top: 4rpx solid #2492F2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20rpx;
    }

    .loading-text {
      font-size: 28rpx;
      color: #999;
    }
  }

  .empty-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;

    .empty-image {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 20rpx;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }

  .loading-more,
  .no-more {
    text-align: center;
    padding: 30rpx 0;
    font-size: 24rpx;
    color: #999;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

