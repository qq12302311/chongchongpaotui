<template>
  <view class="order-list-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="订单列表" title-align="center" :showBackButton="false"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 搜索区域 -->
    <view class="search-area">
      <view class="filter-btn" @click="showFilterOptions">
        <text>选择搜索条件</text>
        <view class="arrow-down"></view>
      </view>
      <view class="search-box">
        <view class="search-icon-container">
          <image src="https://ccpt.qiniu.0871.cn/rider/sousuo.png" mode="aspectFit" class="search-icon"></image>
        </view>
        <input type="text" placeholder="输入关键字搜索订单" class="search-input" />
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
          <!-- <view class="badge" v-if="tab.count > 0">{{ tab.count }}</view> -->
        </view>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <!-- 加载中提示 -->
      <view v-if="loading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 订单列表 -->
      <view v-else>
        <view class="order-item" v-for="(order, index) in orderList" :key="index" @click="goToOrderDetail(order.id)">
          <view class="status-tag" :class="order.status">
            <text v-if="order.status === 'waiting'">等待接单</text>
            <text v-else-if="order.status === 'assigned'">已接单</text>
            <text v-else-if="order.status === 'finished'">待确认</text>
            <text v-else-if="order.status === 'completed'">已完成</text>
          </view>
          <view class="order-header">
            <view class="order-info">
              <text class="order-number">订单编号：{{ order.orderNumber }}</text>
              <view class="copy-btn" @click.stop="copyOrderNumber(order.orderNumber)">复制</view>
            </view>
            <view class="order-time-row">
              <!-- <text class="order-time">发单时间：{{ order.task_date }}</text> -->
              <text class="countdown" v-if="order.status === 'assigned' && order.countdown">剩计时：{{ order.countdown }}</text>
              <text class="countdown" v-else-if="order.status === 'finished' || order.status === 'completed'">任务用时：{{ order.taskDuration }}</text>
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
                <text class="price">{{ getDisplayAmount(order) }}</text>
              </view>
              <view class="service-time">服务时间：<text class="highlight" style="white-space: pre-line;">{{ order.serviceTime }}</text></view>
              <view class="service-item">服务项目：<text class="highlight">{{ order.serviceItem }}</text></view>
              <!-- <view class="contact-info">联系客户：<text class="highlight">{{ order.contactName }} {{ order.contactPhone }}</text></view> -->
            </view>

            <view class="arrow-right">
              <view class="arrow"></view>
            </view>
          </view>

          <view class="order-footer">
            <view class="distance-info">
              <image src="https://ccpt.qiniu.0871.cn/rider/map2.png" mode="aspectFit" class="location-icon"></image>
              <text class="distance-text">距离订单地址<text class="highlight">{{ order.distance }}km</text></text>
              <text class="location-detail" @click.stop="showLocationDetail(order)">点击导航</text>
            </view>
            <!-- <button class="contact-btn" @click.stop="contactMerchant(order.contactPhone)">联系下单客户</button> -->
          </view>
        </view>

        <!-- 无数据提示 -->
        <view v-if="!loading && orderList.length === 0" class="empty-tip">
          <image src="https://ccpt.qiniu.0871.cn/rider/empty.png" mode="aspectFit" class="empty-image"></image>
          <text class="empty-text">暂无订单</text>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <tab-bar activeTab="order"></tab-bar>

    <!-- 悬浮小图 -->
    <floating-image
      :target-url="'/riderEnd/my'"
      :auto-open-share="true"
      :custom-click="handleFloatingImageClick"
    ></floating-image>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import TabBar from '@/components/rider/tab-bar/index.vue'
import FloatingImage from '@/components/FloatingImage/index.vue'
import md5 from 'md5'

export default {
  components: {
    NavBar,
    TabBar,
    FloatingImage
  },
  data() {
    return {
      tabs: [
        { name: '进行中', count: 1, status: 'assigned' },
        { name: '已取消', count: 1, status: 'canceled' },
        { name: '完成待确认', count: 1, status: 'finished' },
        { name: '已完成', count: 0, status: 'completed' }
      ],
      activeTab: 0,
      orderList: [],
      riderUserInfo: null,
      loading: false,
      page: 1,
      pageSize: 10,
      hasMore: true,
      timer: null, // 倒计时定时器
      currentLocation: null, // 添加当前位置存储
      currentStatus: 'assigned', // 添加当前状态
      isNavigating: false // 新增防抖标志
    }
  },
  onLoad() {
    // 处理 backgroundFetch 错误
    this.handleBackgroundFetchError()
  },
  onShow() {
    // 获取骑手信息
    this.riderUserInfo = uni.getStorageSync('riderUserInfo')
    // 刷新用户信息
    this.fetchUserInfo()
    // 获取当前位置
    this.getCurrentLocation()
    // 重置页码并获取订单列表
    this.page = 1
    this.orderList = []
    this.getOrderList()
    // 启动倒计时
    this.startCountdown()
  },
  onHide() {
    // 清除定时器
    this.clearCountdownTimer()
  },
  onUnload() {
    // 清除定时器
    this.clearCountdownTimer()
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.page = 1
    this.orderList = []
    this.getOrderList().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  // 上拉加载更多
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.page++
      this.getOrderList()
    }
  },
  methods: {
    // 查询用户信息接口
    async fetchUserInfo() {
      try {
        const riderUserInfo = uni.getStorageSync('riderUserInfo');
        if (!riderUserInfo || !riderUserInfo.id || !riderUserInfo.phone) {
          console.error('获取用户信息失败: 缺少必要参数');
          return;
        }

        // 构建签名
        const signStr = `service_member_id=${riderUserInfo.id}&phone_number=${riderUserInfo.phone}`;
        const sign = md5(signStr);

        // 构建请求参数
        const params = {
          service_member_id: riderUserInfo.id,
          sign: sign,
          member_id: riderUserInfo.id
        };

        console.log('查询用户信息参数:', params);

        // 调用接口
        const res = await this.$request('service/member/info', params, 'POST');

        console.log('用户信息接口响应:', res);

        if (res.status === 'success' && res.data) {
          // 更新本地存储的用户信息
          const updatedUserInfo = {
            ...riderUserInfo,
            balance: res.data.balance || 0,
            month_commission: res.data.month_commission || 0,
            month_completed_tasks_count: res.data.month_completed_tasks_count || 0,
            today_commission: res.data.today_commission || 0,
            today_completed_tasks_count: res.data.today_completed_tasks_count || 0,
            rate: res.data.rate || 1,
            zone: res.data.zone || null,
            latest_certification: res.data.latest_certification || null,
            submit_certification: res.data.submit_certification || '待审核'
          };

          // 保存到本地存储
          uni.setStorageSync('riderUserInfo', updatedUserInfo);

          // 更新当前页面的用户信息
          this.riderUserInfo = updatedUserInfo;

          console.log('用户信息已更新:', updatedUserInfo);
        } else {
          console.warn('获取用户信息失败:', res.msg || res.message || '未知错误');
        }
      } catch (error) {
        console.error('查询用户信息失败:', error);
        // 不显示错误提示，避免影响用户体验
      }
    },

    showFilterOptions() {
      uni.showToast({
        title: '筛选功能开发中',
        icon: 'none'
      })
    },

    // 获取品牌样式类名
    getBrandClass(brand) {
      if (!brand) return 'brand-default';
      return `brand-${brand}`;
    },

    // 获取品牌显示文字
    getBrandText(brand) {
      const brandMap = {
        'meituan': '美团',
        'guaishou': '怪兽',
        'jiedian': '街电',
        'xiaodian': '小电',
        'zhumang': '竹芒'
      };
      return brandMap[brand] || '充充';
    },
    switchTab(index) {
      this.activeTab = index
      this.currentStatus = this.tabs[index].status
      // 重置页码并获取订单列表
      this.page = 1
      this.orderList = []
      this.getOrderList()
    },
    loadOrdersByStatus(statusIndex) {
      // 模拟加载不同状态的订单数据
      if (statusIndex === 0) { // 进行中
        this.orderList = [
          {
            id: 1,
            orderNumber: '8888888888888',
            orderTime: '2025-4-12 13: 05',
            countdown: '2: 59: 49',
            price: '¥21.00',
            serviceType: 'repair',
            serviceTypeText: '离',
            storeName: '阿杆24h自助台球（坡博店）',
            serviceTime: '2025-4-12 14: 00-18: 00',
            serviceItem: '异常设备x1台 补电源线x1根',
            contactName: '李先生',
            contactPhone: '17607067601',
            distance: 1.8
          }
        ]
      } else {
        // 其他状态暂无数据
        this.orderList = []
      }
    },
    // 获取订单列表
    async getOrderList() {
      if (this.loading) return

      this.loading = true
      try {
        // 计算sign参数
        const signStr = `service_member_id=${this.riderUserInfo.id}&phone_number=${this.riderUserInfo.phone}`
        const sign = md5(signStr)

        const res = await this.$request('task/list', {
          page: this.page,
          pageSize: this.pageSize,
          sign: sign,
          status: this.currentStatus, // 使用当前状态
          service_member_id: this.riderUserInfo.id,
        }, 'POST')

        if (res.code === 200 && res.data) {
          const newOrders = res.data.map(item => {
            console.log('订单详情：', item); // 添加日志查看数据结构

            // 构建完整地址
            let fullAddress = '';
            if (item.shop_address) {
              fullAddress = [
                item.province_name,
                item.city_name,
                item.district_name,
                item.shop_address
              ].filter(Boolean).join('');
            }

            return {
              id: item.task_id,
              orderNumber: item.task_no,
              task_date: item.task_date,
              price: `¥${parseFloat(item.order_amount).toFixed(2)}`,
              serviceType: this.getServiceTypeClass(item.task_detail?.detail || item.task_name),
              serviceTypeText: this.getServiceTypeDisplayText(item.task_detail?.detail || item.task_name),
              storeName: item.task_detail.store_name,
              serviceTime: this.formatServiceTime(item.task_date, item.deadline, item.time_limit),
              serviceItem: this.formatServiceItems(item.task_detail),
              contactName: item.name,
              contactPhone: item.phone_number,
              distance: this.calculateDistance(item.latitude, item.longitude),
              countdown: this.calculateCountdown(item.deadline),
              taskDuration: this.calculateTaskDuration(item.start_date, item.task_assignment?.finished_at),
              deadline: item.deadline,
              timeLimit: item.time_limit, // 添加时效字段
              latitude: item.latitude,
              longitude: item.longitude,
              status: item.status,
              address: fullAddress || '未知地址',
              doorImage: item.task_detail && item.task_detail.pic_url && item.task_detail.pic_url.length > 0 ? item.task_detail.pic_url[0] : '',
              brand: item.brand || '' // 添加品牌信息
            }
          })

          // 追加新数据
          if (this.page === 1) {
            this.orderList = newOrders
          } else {
            this.orderList = [...this.orderList, ...newOrders]
          }

          // 判断是否还有更多数据
          this.hasMore = newOrders.length === this.pageSize

          // 重新启动倒计时
          this.startCountdown()
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
      }
    },
    // 解析日期字符串
    parseDate(dateStr) {
      if (!dateStr) return null
      // 将 yyyy-MM-dd HH:mm:ss 转换为 yyyy/MM/dd HH:mm:ss
      const compatibleStr = dateStr.replace(/-/g, '/')
      const date = new Date(compatibleStr)
      return isNaN(date.getTime()) ? null : date
    },
    // 格式化日期为字符串
    formatDateTime(date) {
      if (!date) return ''
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    // 格式化时间
    formatTime(date) {
      if (!date) return ''
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    // 格式化服务时间
    formatServiceTime(startTime, endTime, timeLimit) {
      if (!endTime) return ''

      try {
        const endDate = this.parseDate(endTime)
        if (!endDate) return ''

        // 格式化截止时间为 MM-dd HH:mm 格式
        const month = String(endDate.getMonth() + 1).padStart(2, '0')
        const day = String(endDate.getDate()).padStart(2, '0')
        const hours = String(endDate.getHours()).padStart(2, '0')
        const minutes = String(endDate.getMinutes()).padStart(2, '0')
        const formattedEndTime = `${month}-${day} ${hours}:${minutes}`

        // 如果有时效字段，显示时效，否则显示24h
        const timeLimitText = timeLimit ? `${timeLimit}h内` : '24h内'

        return `${timeLimitText} ${formattedEndTime}前完成`
      } catch (err) {
        console.error('Format service time error:', err)
        return ''
      }
    },
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
    showLocationDetail(order) {
      // console.log('点击导航按钮，订单信息：', order);

      if (!order.latitude || !order.longitude) {
        // console.error('订单缺少经纬度信息');
        uni.showToast({
          title: '订单地址信息不完整',
          icon: 'none'
        });
        return;
      }

      // 直接打开地图导航
      uni.openLocation({
        latitude: Number(order.latitude),
        longitude: Number(order.longitude),
        name: order.storeName || '目标位置',
        address: order.address || '未知地址',
        scale: 18,
        success: () => {
          // console.log('打开地图成功');
        },
        fail: (err) => {
          console.error('打开地图失败:', err);
          uni.showToast({
            title: '打开地图失败，请检查是否安装地图应用',
            icon: 'none'
          });
        }
      });
    },
    contactMerchant(phone) {
      uni.makePhoneCall({
        phoneNumber: phone,
        fail: () => {
          uni.showToast({
            title: '拨打电话失败',
            icon: 'none'
          })
        }
      })
    },
    goToOrderDetail(orderId) {
      if (this.isNavigating) return;
      this.isNavigating = true;
      setTimeout(() => { this.isNavigating = false }, 1200); // 1.2秒内不再响应
      let id = orderId;
      if (typeof orderId === 'object' && orderId !== null && 'id' in orderId) {
        id = orderId.id;
      }
      if (typeof id !== 'string') id = String(id);
      uni.navigateTo({
        url: `/riderEnd/order-info?id=${id}`
      })
    },
    // 格式化服务项目
    formatServiceItems(taskDetail) {
      if (!taskDetail) return ''

      const items = []

      // 主要服务项目
      if (taskDetail.detail) {
        let itemName;

        // 判断服务类型
        switch (taskDetail.detail) {
          case 'bubao':
            itemName = '补宝';
            break;
          case 'offline_abnormal':
            itemName = '离线异常';
            break;
          case 'income_abnormal':
            itemName = '收入异常';
            break;
          case 'other_abnormal':
            itemName = '其他异常';
            break;
          default:
            itemName = taskDetail.detail;
        }

        items.push(`${itemName}x${taskDetail.item_number || 1}`)
      }

      // 附加服务项目
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
          return 'supplement';
        case 'offline_abnormal':
          return 'offline-abnormal';
        case 'income_abnormal':
          return 'income-abnormal';
        case 'other_abnormal':
          return 'other-abnormal';
        default:
          return 'repair';
      }
    },

    // 获取服务类型显示文本（只显示前两个字符）
    getServiceTypeDisplayText(detail) {
      switch (detail) {
        case 'bubao':
          return '补宝';
        case 'offline_abnormal':
          return '离线';
        case 'income_abnormal':
          return '收入';
        case 'other_abnormal':
          return '其他';
        default:
          // 如果是其他类型，取前两个字符
          return detail ? detail.substring(0, 2) : '';
      }
    },

    // 计算倒计时
    calculateCountdown(deadline) {
      if (!deadline) return null

      const endDate = this.parseDate(deadline)
      if (!endDate) return null

      const endTime = endDate.getTime()
      const now = new Date().getTime()
      const diff = endTime - now

      if (diff <= 0) return null

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    },
    // 计算任务用时
    calculateTaskDuration(startTime, endTime) {
      if (!startTime || !endTime) return '未知时间';

      try {
        const startDate = this.parseDate(startTime);
        const endDate = this.parseDate(endTime);

        if (!startDate || !endDate) return '未知时间';

        const duration = endDate - startDate;
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}小时${minutes}分钟`;
      } catch (e) {
        console.error('计算任务用时出错:', e);
        return '未知时间';
      }
    },
    // 计算距离
    calculateDistance(latitude, longitude) {
      if (!latitude || !longitude) return 0

      // 如果没有当前位置信息，先获取位置
      if (!this.currentLocation) {
        this.getCurrentLocation()
        return 0
      }

      // 将经纬度转换为数字
      const lat1 = Number(this.currentLocation.latitude)
      const lon1 = Number(this.currentLocation.longitude)
      const lat2 = Number(latitude)
      const lon2 = Number(longitude)

      // 使用Haversine公式计算距离
      const R = 6371 // 地球半径，单位公里
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c

      // 保留一位小数
      return parseFloat(distance.toFixed(1))
    },
    // 启动倒计时
    startCountdown() {
      // 先清除可能存在的定时器
      this.clearCountdownTimer()

      // 创建新的定时器，每秒更新一次
      this.timer = setInterval(() => {
        this.orderList = this.orderList.map(order => ({
          ...order,
          countdown: this.calculateCountdown(order.deadline)
        }))
      }, 1000)
    },
    // 清除倒计时定时器
    clearCountdownTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    // 获取当前位置
    getCurrentLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.currentLocation = {
            latitude: res.latitude,
            longitude: res.longitude
          };
          // console.log('获取到当前位置:', this.currentLocation);
          // 获取到位置后重新计算距离
          this.updateOrderDistances();
        },
        fail: (err) => {
          console.error('获取位置失败:', err);
          uni.showToast({
            title: '获取位置失败',
            icon: 'none'
          });
        }
      });
    },
    // 更新订单距离
    updateOrderDistances() {
      this.orderList = this.orderList.map(order => ({
        ...order,
        distance: this.calculateDistance(order.latitude, order.longitude)
      }));
    },
    formatStoreName(name) {
      if (!name) return '';
      // 去除所有空格和换行
      return name.replace(/\s+/g, '');
    },
    // 计算实际金额（扣除佣金）
    getDisplayAmount(order) {
      if (!this.riderUserInfo || !this.riderUserInfo.rate) return order.price;
      // order.price 可能是 '¥21.00' 这样的字符串
      let amount = 0;
      if (typeof order.price === 'string') {
        amount = parseFloat(order.price.replace('¥', ''));
      } else {
        amount = Number(order.price);
      }
      const rate = Number(this.riderUserInfo.rate);
      const realAmount = amount * rate;
      return `¥${realAmount.toFixed(2)}`;
    },

    // 处理 backgroundFetch 错误
    handleBackgroundFetchError() {
      try {
        // 在安卓平台上，禁用 backgroundFetch 相关功能
        // #ifdef APP-PLUS
        if (uni.getSystemInfoSync().platform === 'android') {
          // 重写 uni.getBackgroundFetchData 方法，避免调用原生接口
          if (typeof uni.getBackgroundFetchData === 'function') {
            const originalGetBackgroundFetchData = uni.getBackgroundFetchData;
            uni.getBackgroundFetchData = function(options) {
              // 直接返回空数据，避免调用可能导致错误的原生接口
              if (options && typeof options.success === 'function') {
                options.success({ fetchedData: {} });
              }
              if (options && typeof options.complete === 'function') {
                options.complete({ fetchedData: {} });
              }
              return {};
            };
            console.log('已重写 getBackgroundFetchData 方法以避免安卓平台错误');
          }
        }
        // #endif
      } catch (error) {
        console.error('处理 backgroundFetch 错误时出现异常:', error);
      }
    },

    // 处理悬浮小图点击
    handleFloatingImageClick() {
      console.log('点击悬浮小图');
      // 跳转到骑手端我的页面并自动打开分享推荐弹窗
      uni.navigateTo({
        url: '/riderEnd/my',
        success: () => {
          // 延迟一下确保页面加载完成，然后触发分享推荐弹窗
          setTimeout(() => {
            // 通过事件总线通知我的页面打开分享推荐弹窗
            uni.$emit('openRiderShareModal');
          }, 300);
        },
        fail: (err) => {
          console.error('跳转到骑手我的页面失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.order-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: calc(100rpx + constant(safe-area-inset-bottom));
  /* iOS < 11.2 */
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
  /* iOS >= 11.2 */
  box-sizing: border-box;
}

.nav-placeholder {
  height: 200rpx;
  width: 100%;
}

.search-area {
  padding: 10rpx 20rpx;
  display: flex;
  align-items: center;
  background-color: #fff;

  .filter-btn {
    display: flex;
    align-items: center;
    height: 60rpx;
    padding: 0 20rpx;
    margin-right: 10rpx;

    text {
      font-size: 26rpx;
      color: #333;
    }

    .arrow-down {
      width: 0;
      height: 0;
      border-left: 8rpx solid transparent;
      border-right: 8rpx solid transparent;
      border-top: 8rpx solid #333;
      margin-left: 8rpx;
    }
  }

  .search-box {
    flex: 1;
    height: 60rpx;
    background-color: #f5f5f5;
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    padding-right: 20rpx;
    overflow: hidden;

    .search-icon-container {
      width: 60rpx;
      height: 60rpx;
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
      font-size: 26rpx;
      color: #333;
      padding-left: 0;
    }

    .search-input::placeholder {
      color: #999;
    }
  }
}

.order-tabs {
  display: flex;
  background-color: #fff;
  height: 80rpx;
  border-bottom: 1rpx solid #f5f5f5;

  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease;

    .tab-content {
      position: relative;
      display: inline-block;
    }

    text {
      font-size: 28rpx;
      color: #666;
      transition: color 0.3s ease, font-weight 0.3s ease;
    }

    .badge {
      position: absolute;
      top: -12rpx;
      right: -20rpx;
      min-width: 28rpx;
      height: 28rpx;
      background-color: #FF5B5B;
      color: #fff;
      font-size: 20rpx;
      border-radius: 14rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 6rpx;
      box-sizing: border-box;
      line-height: 1;
      transition: transform 0.3s ease;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 4rpx;
      background-color: #2492F2;
      transition: width 0.3s ease;
    }

    &.active {
      text {
        color: #2492F2;
        font-weight: 500;
      }

      .badge {
        transform: scale(1.1);
      }

      &::after {
        width: 40rpx;
      }
    }

    &:active {
      opacity: 0.8;
    }
  }
}

.order-list {
  padding: 10rpx;
  box-sizing: border-box;
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  /* iOS < 11.2 */
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  /* iOS >= 11.2 */
  width: 100%;
  box-sizing: border-box;

  .order-item {
    margin: 30rpx 20rpx;
    border-radius: 12rpx;
    padding: 20rpx;
    width: calc(100% - 40rpx);
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    background-color: #fff;
    cursor: pointer;
    position: relative;

    .status-tag {
      position: absolute;
      top: 20rpx;
      right: 20rpx;
      padding: 6rpx 16rpx;
      border-radius: 6rpx;
      font-size: 22rpx;
      font-weight: 500;
      z-index: 1;

      &.waiting {
        background-color: rgba(255, 107, 0, 0.1);
        color: #FF6B00;
      }

      &.assigned {
        background-color: rgba(36, 146, 242, 0.1);
        color: #2492F2;
      }

      &.finished {
        background-color: rgba(0, 200, 0, 0.1);
        color: #00C800;
      }

      &.completed {
        background-color: rgba(0, 200, 0, 0.1);
        color: #00C800;
      }
    }

    .order-header {
      display: flex;
      flex-direction: column;
      padding-bottom: 15rpx;
      border-bottom: 1rpx solid #f5f5f5;
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
          background-color: rgba(36, 146, 242, 0.6);
          padding: 4rpx 16rpx;
          border-radius: 4rpx;
          margin-left: 10rpx;
        }
      }

      .order-time-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .order-time {
          font-size: 24rpx;
          color: #999;
        }

        .countdown {
          font-size: 24rpx;
          color: #FF6B00;
          background-color: rgba(255, 107, 0, 0.1);
          padding: 4rpx 10rpx;
          border-radius: 4rpx;
        }
      }
    }

    .order-content {
      display: flex;
      align-items: stretch;
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid #f5f5f5;
      position: relative;

      .order-icon {
        width: 100rpx;
        height: 110rpx;
        border-radius: 10rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;
        flex-shrink: 0;
        background: #f5f5f5;

        .icon-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;

          .brand-text {
            font-size: 36rpx;
            color: #fff;
            font-weight: bold;
            margin-bottom: 16rpx;
            line-height: 1;
          }

          .service-text {
            font-size: 36rpx;
            color: #fff;
            font-weight: bold;
            line-height: 1;
          }
        }

        text {
          font-size: 44rpx;
          color: #fff;
          font-weight: bold;
        }

        &.no-image {
          background: #2492F2;
        }

        // 新增异常类型样式
        &.offline-abnormal.no-image {
          background: #2492F2;
        }

        &.income-abnormal.no-image {
          background: #2492F2;
        }

        &.other-abnormal.no-image {
          background: #2492F2;
        }

        &.supplement.no-image {
          background: #2492F2;
        }

        &.repair.no-image {
          background: #2492F2;
        }

        // 品牌颜色样式
        &.brand-meituan {
          background-color: #F9E34F !important;

          .brand-text, .service-text {
            color: #333 !important;
          }
        }

        &.brand-guaishou {
          background-color: #27BFC0 !important;
        }

        &.brand-jiedian {
          background-color: #2492F2 !important;
        }

        &.brand-xiaodian {
          background-color: #2492F2 !important;
        }

        &.brand-zhumang {
          background-color: #2492F2 !important;
        }

        &.brand-default {
          background-color: #2492F2 !important;
        }

        .door-image {
          width: 120rpx;
          height: 120rpx;
          object-fit: cover;
          border-radius: 16rpx;
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
            font-size: 32rpx;
            color: #333;
            font-weight: 600;
          }

          .price {
            font-size: 30rpx;
            color: #FF6B00;
            font-weight: 500;
          }
        }

        .service-time, .service-item, .contact-info {
          font-size: 24rpx;
          color: #666;
          margin-bottom: 6rpx;

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
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40rpx;
        height: 40rpx;

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
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20rpx;

      .distance-info {
        display: flex;
        align-items: center;
        flex: 1;

        .location-icon {
          width: 32rpx;
          height: 32rpx;
          margin-right: 6rpx;
        }

        .distance-text {
          font-size: 24rpx;
          color: #2492F2;

          .highlight {
            color: #2492F2;
          }
        }

        .location-detail {
          color: #2492F2;
          background-color: rgba(36, 146, 242, 0.1);
          font-size: 24rpx;
          margin-left: 10rpx;
          padding: 4rpx 10rpx;
          border-radius: 4rpx;
        }
      }

      .contact-btn {
        height: 50rpx;
        line-height: 50rpx;
        background-color: #fff;
        color: #666;
        font-size: 24rpx;
        border: 1rpx solid #ccc;
        border-radius: 25rpx;
        padding: 0 20rpx;
        margin-left: 20rpx;
      }
    }
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx 0;

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

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
    }

    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>
