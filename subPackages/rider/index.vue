<template>
  <view class="order-hall">
    <!-- 顶部导航栏 -->
	<nav-bar title="充充跑腿骑手端" title-align="left" :showBackButton="false"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 城市选择器 -->
    <view class="city-selector-container">
      <view class="city-selector" @click="selectCity">
        <text class="city-name">{{ currentCity }}</text>
        <text class="arrow">▼</text>
      </view>
      <view class="city-count-badge">
        <text class="city-count-text">全国已开{{totalCityCount}}城</text>
      </view>
    </view>

    <!-- 广告横幅 -->
    <view class="banner">
      <swiper
        class="banner-swiper"
        :indicator-dots="true"
        :autoplay="true"
        :interval="3000"
        :duration="500"
        indicator-color="rgba(255, 255, 255, 0.5)"
        indicator-active-color="#ffffff"
        circular
      >
        <swiper-item v-for="(banner, index) in bannerList" :key="index">
          <image :src="banner.image" mode="aspectFill" class="banner-image"></image>
        </swiper-item>
      </swiper>
    </view>

    <!-- 接单大厅标题和搜索 -->
    <view class="hall-header">
      <view class="hall-title">接单大厅</view>
      <view class="search-box">
        <image src="https://ccpt.qiniu.cc111.cn/rider/sousuo.png" mode="aspectFit" class="search-icon"></image>
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
        <image src="https://ccpt.qiniu.cc111.cn/rider/xiangxia.png" mode="aspectFit" class="arrow-icon"></image>
        <view class="active-line" v-if="activeTab === 'area'"></view>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <!-- 订单列表 -->
      <view>
        <view class="order-item" :class="{ 'completed-order': order.isCompleted && order.isRecentTask, 'assigned-order': order.isAssigned && order.isRecentTask }" v-for="(order, index) in orderList" :key="index" @click="goToOrderDetail(order)">
          <!-- 完结订单盖章图片 - 只对recent_tasks显示 -->
          <image
            v-if="order.isCompleted && order.isRecentTask"
            class="completed-stamp-image"
            src="https://ccpt.qiniu.cc111.cn/rider/yiwanjie.svg"
            mode="aspectFit">
          </image>

          <!-- 进行中订单盖章图片 - 只对recent_tasks显示 -->
          <image
            v-if="order.isAssigned && order.isRecentTask"
            class="assigned-stamp-image"
            src="https://ccpt.qiniu.cc111.cn/rider/assigned.svg"
            mode="aspectFit">
          </image>

          <view class="order-header">
            <view class="order-info">
              <text class="order-number">订单编号：{{ order.orderNumber }}</text>
              <view class="copy-btn" v-if="order.isSpecial" @click.stop="copyOrderNumber(order.orderNumber)">复制</view>
            </view>
            <view class="order-price">{{ getDisplayAmount(order) }}</view>
          </view>

          <view class="order-time">发单时间：{{ order.orderTime }}</view>

          <view class="order-content">
            <view class="order-icon" :class="order.serviceType">
              <text>{{ order.serviceTypeText }}</text>
            </view>

            <view class="order-details">
              <view class="address">{{ formatAddress(order) }}</view>
              <view class="service-time" :data-content="order.serviceTime">服务时效：</view>
              <view class="service-item" :data-content="order.serviceItem">服务项目：</view>
              <view class="service-item" v-if="order.extraServices" :data-content="order.extraServices">附加服务：</view>
            </view>

            <view class="distance-info">
              <image src="https://ccpt.qiniu.cc111.cn/rider/map2.png" mode="aspectFit" class="location-icon"></image>
              <text class="distance-text"><text class="highlight">{{ order.distance || 0 }}km</text></text>
            </view>
            <button v-if="!order.isCompleted && !order.isAssigned" class="take-order-btn" @click.stop="goToOrderDetail(order)">去接单</button>
            <view v-else-if="order.isAssigned" class="assigned-label">{{ order.isRecentTask ? '已被其他骑手接单' : '进行中' }}</view>
            <view v-else class="completed-label">已完结</view>
          </view>
        </view>

        <!-- 加载中提示 -->
        <view v-if="loading" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>

        <!-- 无更多数据提示 -->
        <view v-if="!loading && !hasMore && orderList.length > 0" class="no-more-tip">
          <text>已经到底了</text>
        </view>

        <!-- 无数据提示 -->
        <view v-if="!loading && orderList.length === 0" class="empty-tip">
          <image src="https://ccpt.qiniu.cc111.cn/rider/empty.png" mode="aspectFit" class="empty-image"></image>
          <text class="empty-text">本区域暂无待接新订单</text>
          <text class="empty-subtitle">请持续关注</text>

          <!-- 推广期提示 -->
          <view class="promotion-tip">
            <text class="promotion-text">当前为平台推广期</text>
          </view>

          <!-- 推荐骑手 -->
          <view class="recommend-item" @click="goToRiderRecommend">
            <text class="recommend-text">推荐骑手，得订单2.5%奖金 连续拿一年！</text>
            <text class="recommend-btn">去推荐</text>
          </view>

          <!-- 推荐用户 -->
          <view class="recommend-item" @click="goToUserRecommend">
            <text class="recommend-text">推荐用户，得订单1.5%奖金 连续拿一年！</text>
            <text class="recommend-btn">去推荐</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <tab-bar activeTab="hall"></tab-bar>

    <!-- 悬浮小图 -->
    <floating-image
      :target-url="'/riderEnd/my'"
      :auto-open-share="true"
      :custom-click="handleFloatingImageClick"
    ></floating-image>

    <!-- 海报弹窗 -->
    <poster-modal
      :show="showPosterModal"
      :posters="posterList"
      @close="handlePosterClose"
      @posterClick="handlePosterClick"
    />

    <!-- 订单详情弹窗 -->
    <view v-if="showOrderModal" class="order-modal-mask" @click="closeOrderModal">
      <view class="order-modal-container" @click.stop>
        <view class="order-modal-header">
          <text class="order-modal-title">订单详情</text>
          <view class="order-modal-close" @click="closeOrderModal">×</view>
        </view>

        <view class="order-modal-content">
          <!-- 订单基本信息 -->
          <view class="order-modal-info">
            <view class="info-row">
              <text class="info-label">订单编号：</text>
              <text class="info-value">{{ currentOrderInfo.orderNumber }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">发单时间：</text>
              <text class="info-value">{{ currentOrderInfo.orderTime }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">服务地址：</text>
              <text class="info-value">{{ formatAddress(currentOrderInfo) }}</text>
            </view>
            <view class="info-row">
              <view class="service-time-modal" :data-content="currentOrderInfo.serviceTime">服务时效：</view>
            </view>
            <view class="info-row">
              <view class="service-item-modal" :data-content="currentOrderInfo.serviceItem">服务项目：</view>
            </view>
            <view class="info-row" v-if="currentOrderInfo.extraServices">
              <view class="service-item-modal" :data-content="currentOrderInfo.extraServices">附加服务：</view>
            </view>
            <view class="info-row">
              <text class="info-label">距离：</text>
              <text class="info-value">{{ currentOrderInfo.distance || 0 }}km</text>
            </view>
            <view class="info-row">
              <text class="info-label">订单金额：</text>
              <text class="info-value amount">{{ getDisplayAmount(currentOrderInfo) }}</text>
            </view>
          </view>
        </view>

        <view class="order-modal-footer">
          <view class="modal-btn cancel" @click="closeOrderModal">取消</view>
          <view class="modal-btn confirm" :class="{disabled: isAcceptingOrder}" @click="acceptOrder">
            <text v-if="isAcceptingOrder">接单中...</text>
            <text v-else>立即接单</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import TabBar from '@/components/rider/tab-bar/index.vue'
import PosterModal from '@/components/PosterModal/index.vue'
import FloatingImage from '@/components/FloatingImage/index.vue'
import md5 from 'md5'
import floatingImageMixin from '@/mixins/floatingImageMixin.js'

export default {
  components: {
    NavBar,
    TabBar,
    PosterModal,
    FloatingImage
  },
  mixins: [floatingImageMixin],
  data() {
    return {
      currentCity: '海南',
      activeTab: 'comprehensive',
      orderList: [],
      riderUserInfo: null,
      userLocation: null,
      loading: true,
      page: 1,
      per_page: 10,
      hasMore: true,
      isRefreshing: false,
      totalCityCount: 0, // 全国已开通城市数量
      showPosterModal: false, // 海报弹窗显示状态
      posterList: [ // 海报列表
        {
          id: 1,
          image: 'https://ccpt.qiniu.cc111.cn/p16.png',
          title: '海报1',
          url: ''
        },
        {
          id: 2,
          image: 'https://ccpt.qiniu.cc111.cn/p14.png',
          title: '海报2',
          url: ''
        },
        {
          id: 3,
          image: 'https://ccpt.qiniu.cc111.cn/p1.png',
          title: '海报3',
          url: ''
        }
		// ,
  //       {
  //         id: 4,
  //         image: 'https://ccpt.qiniu.cc111.cn/p2.png',
  //         title: '海报4',
  //         url: ''
  //       },
  //       {
  //         id: 5,
  //         image: 'https://ccpt.qiniu.cc111.cn/p3.png',
  //         title: '海报5',
  //         url: ''
  //       }
      ],
      bannerList: [ // banner轮播图列表
        {
          id: 1,
          image: 'https://ccpt.qiniu.cc111.cn/rider/banner12.png',
          title: 'Banner 1',
          url: ''
        },
        {
          id: 2,
          image: 'https://ccpt.qiniu.cc111.cn/rider/banner4.png',
          title: 'Banner 2',
          url: ''
        }
      ],
      // 订单弹窗相关
      showOrderModal: false,
      currentOrderInfo: {},
      isAcceptingOrder: false
    }
  },
  onShow() {
    // 从本地存储获取当前城市
    const savedCity = uni.getStorageSync('rider_selectedCity')
    if (savedCity) {
      this.currentCity = savedCity.fullCityName
      // 获取骑手信息
      this.riderUserInfo = uni.getStorageSync('riderUserInfo')
      // 获取用户位置
      this.getUserLocation()
      // 获取待接单列表
      this.getWaitingTasks()

      // 获取已开通城市数量
      const totalCityCount = uni.getStorageSync('totalCityCount')
      if (totalCityCount) {
        this.totalCityCount = totalCityCount
      } else {
        // 如果没有缓存的城市数量，调用接口获取
        this.getCityCount()
      }
    } else {
      // 没有选择城市，默认全部区域
      this.currentCity = '全部'
      this.riderUserInfo = uni.getStorageSync('riderUserInfo')
      this.getUserLocation()
      this.getWaitingTasks()
      const totalCityCount = uni.getStorageSync('totalCityCount')
      if (totalCityCount) {
        this.totalCityCount = totalCityCount
      } else {
        this.getCityCount()
      }
    }

    // 检查是否需要显示海报弹窗
    this.checkPosterModal()
  },
  onPullDownRefresh() {
    this.refreshList()
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadMore()
    }
  },
  methods: {
    selectCity() {
      uni.navigateTo({
        url: '/riderEnd/city-select/index'
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
    copyOrderNumber(orderNumber) {
      uni.setClipboardData({
        data: orderNumber,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          });
        }
      });
    },
    // 格式化地址显示
    formatAddress(order) {
      const address = order.address;
      if (!address) return '';

      // 根据订单类型隐藏不同数量的字符
      const charsToHide = order.isRecentTask ? 4 : 6;

      if (address.length > charsToHide) {
        return address.slice(0, -charsToHide) + '...';
      } else {
        // 如果地址长度小于或等于要隐藏的字符数，则显示全部地址
        return address;
      }
    },
    // 获取用户位置
    getUserLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.userLocation = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          // 获取到位置后重新获取订单列表
          this.getWaitingTasks()
        },
        fail: (err) => {
          console.error('获取位置失败:', err)
          uni.showToast({
            title: '获取位置失败',
            icon: 'none'
          })
        }
      })
    },
    // 计算两点之间的距离
    calculateDistance(lat1, lon1, lat2, lon2) {
      if (!lat1 || !lon1 || !lat2 || !lon2) return 0

      const R = 6371 // 地球半径，单位公里
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c

      return parseFloat(distance.toFixed(1))
    },
    // 刷新列表
    refreshList() {
      this.page = 1
      this.hasMore = true
      this.isRefreshing = true
      this.getWaitingTasks()
    },

    // 加载更多
    loadMore() {
      if (!this.hasMore || this.loading) return
      this.page++
      this.getWaitingTasks()
    },

    // 修改获取待接单列表方法
    async getWaitingTasks() {
      if (!this.riderUserInfo || !this.userLocation) {
        this.loading = false
        this.isRefreshing = false
        uni.stopPullDownRefresh()
        return
      }

      this.loading = true
      try {
        const timestamp = Date.now()
        const signStr = `service_member_id=${this.riderUserInfo.id}&phone_number=${this.riderUserInfo.phone}`
        const sign = md5(signStr)

        // 获取当前选择的城市
        const savedCity = uni.getStorageSync('rider_selectedCity')

        const params = {
          service_member_id: this.riderUserInfo.id,
          phone_number: this.riderUserInfo.phone,
          sign: sign,
          page: this.page,
          per_page: this.per_page
        }

        // 只有选择城市后才传 district_name
        if (savedCity && savedCity.name) {
          params.district_name = savedCity.name
        } else {
          // 首次进入不传 district_name
          if (params.district_name) delete params.district_name;
        }

        const res = await this.$request('task/list/waiting', params, 'POST')

		console.log(res)

        if (res.code === 200) {
          // 处理主要数据（data数组）
          const mainOrders = (res.data || []).map(order => this.formatOrderData(order, false))

          // 处理最近任务数据（recent_tasks数组）- 根据状态判断，标记为recent_tasks来源
          const recentOrders = (res.recent_tasks || []).map(order => {
            const isAssigned = order.status === 'assigned'
            return this.formatOrderData(order, !isAssigned, isAssigned, true) // 第四个参数标记为recent_tasks
          })

          // 合并数据：先渲染data，再渲染recent_tasks
          const newOrders = [...mainOrders, ...recentOrders]

          // 根据页码更新列表
          if (this.page === 1) {
            this.orderList = newOrders
          } else {
            this.orderList = [...this.orderList, ...newOrders]
          }

          // 更新是否有更多数据（基于主要数据的长度）
          this.hasMore = mainOrders.length === this.per_page
        } else {
          if (this.page === 1) {
            this.orderList = []
          }
          this.hasMore = false
        }
      } catch (error) {
        console.error('获取待接单列表失败:', error)
        uni.showToast({
          title: '获取订单列表失败',
          icon: 'none'
        })
        if (this.page === 1) {
          this.orderList = []
        }
        this.hasMore = false
      } finally {
        this.loading = false
        this.isRefreshing = false
        uni.stopPullDownRefresh()
      }
    },
    // 格式化订单数据的通用方法
    formatOrderData(order, isCompleted = false, isAssigned = false, isRecentTask = false) {
      const taskDetail = order.task_detail || {};
      return {
        id: order.task_id,
        orderNumber: order.task_no,
        orderTime: order.task_date,
        price: parseFloat(order.order_amount || 0),
        serviceType: this.getServiceTypeClass(taskDetail.detail || order.task_name),
        serviceTypeText: this.getServiceTypeDisplayText(taskDetail.detail || order.task_name),
        storeName: taskDetail.store_name || '未知店铺',
        serviceTime: this.formatServiceTime(order.start_date, order.deadline, order.time_limit),
        serviceItem: this.formatServiceItems(taskDetail, order),
        extraServices: this.formatExtraServices(taskDetail), // 添加附加服务
        contactName: order.name,
        contactPhone: order.phone_number,
        distance: this.userLocation ?
          this.calculateDistance(
            this.userLocation.latitude,
            this.userLocation.longitude,
            order.latitude,
            order.longitude
          ) : 0,
        address: (() => {
          const fullAddress = [
            order.province_name,
            order.city_name,
            order.district_name,
            order.shop_address
          ].filter(Boolean).join('');

          if (isRecentTask && fullAddress.length > 8) {
            return fullAddress.slice(0, -8) + '...';
          }

          return fullAddress;
        })(),
        latitude: order.latitude,
        longitude: order.longitude,
        // 新增字段
        timeLimit: order.time_limit, // 服务时效（小时）
        deadline: order.deadline,    // 截止时间
        brand: taskDetail.brand || '', // 品牌信息
        task_detail: taskDetail, // 任务详情，用于获取附加服务
        isCompleted: isCompleted, // 是否为已完结订单
        isAssigned: isAssigned, // 是否为进行中订单（assigned状态）
        isRecentTask: isRecentTask // 是否来自recent_tasks数组
      }
    },
    // 获取服务类型文本
    getServiceTypeText(type) {
      const typeMap = {
        'repair': '修',
        'supplement': '补'
      }
      return typeMap[type] || type
    },

    // 获取服务类型CSS类名
    getServiceTypeClass(detail) {
      // 处理多选情况，取第一个服务类型
      const firstDetail = detail && detail.includes(',') ? detail.split(',')[0].trim() : detail;
      
      switch (firstDetail) {
        case 'bubao':
          return 'supplement';
        case 'goodRecycle':
          return 'recycle';
        case 'badRecycle':
          return 'recycle';
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
      // 处理多选情况，取第一个服务类型
      const firstDetail = detail && detail.includes(',') ? detail.split(',')[0].trim() : detail;
      
      switch (firstDetail) {
        case 'bubao':
          return '补宝';
        case 'goodRecycle':
          return '收宝';
        case 'badRecycle':
          return '收宝';
        case 'offline_abnormal':
          return '离线';
        case 'income_abnormal':
          return '收入';
        case 'other_abnormal':
          return '其他';
        default:
          // 如果是其他类型，取前两个字符
          return firstDetail ? firstDetail.substring(0, 2) : '';
      }
    },
    // 格式化服务时间
    formatServiceTime(startTime, endTime, timeLimit) {
      // 添加时间限制和截止时间信息
      let timeInfo = '';

      if (timeLimit) {
        timeInfo += `${timeLimit}小时内`
      }

      if (endTime) {
        const deadlineDate = new Date(endTime)
        const deadlineFormatted = `${String(deadlineDate.getMonth() + 1).padStart(2, '0')}-${String(deadlineDate.getDate()).padStart(2, '0')} ${String(deadlineDate.getHours()).padStart(2, '0')}:${String(deadlineDate.getMinutes()).padStart(2, '0')}`
        if (timeLimit) {
          timeInfo += ` ${deadlineFormatted}前完成`
        } else {
          timeInfo += `${deadlineFormatted}前完成`
        }
      }

      return timeInfo || '未设置时效'; // 如果都没有设置，显示未设置时效
    },
    // 格式化服务项目
    formatServiceItems(taskDetail,order) {
      if (!taskDetail) return '';

      const items = [];
      const brandMap = {
        'meituan': '美团',
        'guaishou': '怪兽',
        'jiedian': '街电',
        'xiaodian': '小电'
      };

      // 主要服务项目 - 支持多选（逗号分隔）
      if (taskDetail.detail) {
        // 检查是否是多选（包含逗号）
        const details = taskDetail.detail.includes(',') ? taskDetail.detail.split(',') : [taskDetail.detail];
        
        // 处理多选情况
        if (details.length > 1) {
          // 多选时，分别显示好宝回收和坏宝回收的数量
          details.forEach(detail => {
            detail = detail.trim();
            let itemName;
            let itemNumber;
            
            switch (detail) {
              case 'bubao':
                itemName = '补宝';
                itemNumber = taskDetail.item_number || 1;
                break;
              case 'goodRecycle':
                itemName = '好宝回收';
                itemNumber = taskDetail.shoubao_normal_item_number || 0;
                break;
              case 'badRecycle':
                itemName = '坏宝回收';
                itemNumber = taskDetail.shoubao_broken_item_number || 0;
                break;
              case 'offline_abnormal':
                itemName = '离线异常';
                itemNumber = taskDetail.item_number || 1;
                break;
              case 'income_abnormal':
                itemName = '收入异常';
                itemNumber = taskDetail.item_number || 1;
                break;
              case 'other_abnormal':
                itemName = '其他异常';
                itemNumber = taskDetail.item_number || 1;
                break;
              default:
                itemName = detail;
                itemNumber = taskDetail.item_number || 1;
            }
            
            // 添加品牌信息（如果存在）
            if (order.brand) {
              const brandName = brandMap[order.brand] || order.brand;
              itemName = `${brandName} ${itemName}`;
            }
            
            if (itemNumber > 0) {
              items.push(`${itemName}x${itemNumber}`);
            }
          });
        } else {
          // 单选时，保持原有逻辑
          let itemName;

          // 判断服务类型
          switch (taskDetail.detail) {
            case 'bubao':
              itemName = '补宝';
              break;
            case 'goodRecycle':
              itemName = '好宝回收';
              break;
            case 'badRecycle':
              itemName = '坏宝回收';
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

          // 添加品牌信息（如果存在）
          if (order.brand) {
              const brandName = brandMap[order.brand] || order.brand;
              itemName = `${brandName} ${itemName}`;
          }

          items.push(`${itemName}x${taskDetail.item_number || 1}`);
        }
      }

      // 设备是否外摆
      // if (taskDetail.device_outside !== undefined) {
      //   items.push(`设备外摆：${taskDetail.device_outside ? '是' : '否'}`);
      // }

      return items.join('、') || '未知服务项目';
    },

    // 格式化附加服务
    formatExtraServices(taskDetail) {
      if (!taskDetail) return ''

      const items = []

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

    goToOrderDetail(order) {
      // 如果是recent_tasks的订单，不跳转页面
      if (order.isRecentTask) {
        if (order.isAssigned && !order.isCompleted) {
          // 已接订单提示去订单列表查看
          uni.showToast({
            title: '请到订单列表查看订单详情',
            icon: 'none',
            duration: 2000
          });
        }
        return;
      }

      // 普通订单（非recent_tasks）显示弹窗
      if (!order.isCompleted && !order.isAssigned) {
        // 未接单的普通订单，显示接单弹窗
        this.showOrderDetailModal(order);
      } else if (order.isAssigned && !order.isCompleted) {
        // 已接订单提示去订单列表查看
        uni.showToast({
          title: '请到订单列表查看订单详情',
          icon: 'none',
          duration: 2000
        });
      }
    },

    // 显示订单详情弹窗
    showOrderDetailModal(order) {
      this.currentOrderInfo = order;
      this.showOrderModal = true;
    },

    // 关闭订单详情弹窗
    closeOrderModal() {
      this.showOrderModal = false;
      this.currentOrderInfo = {};
    },

    // 接单操作
    async acceptOrder() {
      if (this.isAcceptingOrder) return;

      this.isAcceptingOrder = true;

      try {
        // 生成签名
        const signStr = `service_member_id=${this.riderUserInfo.id}&phone_number=${this.riderUserInfo.phone}`;
        const sign = md5(signStr);

        // 调用接单API
        const params = {
          task_id: this.currentOrderInfo.id,
          service_provider_id: this.riderUserInfo.provider_id,
          service_member_id: this.riderUserInfo.id,
          sign: sign
        };

        const res = await this.$request('task/accept', params, 'POST');

        if (res.code === 200) {
          // 保存订单ID，因为关闭弹窗会清空currentOrderInfo
          const orderId = this.currentOrderInfo.id;

          uni.showToast({
            title: '接单成功',
            icon: 'success'
          });

          // 关闭弹窗
          this.closeOrderModal();

          // 自动跳转到订单信息页面
          setTimeout(() => {
            uni.navigateTo({
              url: `/riderEnd/order-info?id=${orderId}`
            });
          }, 1500); // 延迟1.5秒跳转，让用户看到成功提示
        } else {
          uni.showToast({
            title: res.msg || '接单失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('接单失败:', error);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      } finally {
        this.isAcceptingOrder = false;
      }
    },

    // 获取已开通城市数量
    async getCityCount() {
      try {
        const res = await this.$request('service/zone', {}, 'POST');
        if (res.code === 200 && res.data) {
          // 计算已开通区县的总数
          let count = 0;
          res.data.forEach(province => {
            province.children.forEach(city => {
              if (city.children && city.children.length > 0) {
                count += city.children.length; // 累加每个城市下的区县数量
              }
            });
          });
          this.totalCityCount = count;
          uni.setStorageSync('totalCityCount', count);
        }
      } catch (err) {
        console.error('获取城市列表失败:', err);
      }
    },
    getDisplayAmount(order) {
      if (!this.riderUserInfo || !this.riderUserInfo.rate) return order.price;
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

    // 检查是否需要显示海报弹窗
    checkPosterModal() {
      const today = new Date().toDateString();
      const lastShownDate = uni.getStorageSync('riderPosterModalLastShown');

      // 如果今天还没有显示过海报弹窗，则显示
      if (lastShownDate !== today) {
        // 延迟1秒显示，确保页面加载完成
        setTimeout(() => {
          this.showPosterModal = true;
          // 记录今天已显示过海报弹窗
          uni.setStorageSync('riderPosterModalLastShown', today);
        }, 1000);
      }
    },

    // 处理海报弹窗关闭
    handlePosterClose() {
      this.showPosterModal = false;
    },

    // 处理海报点击
    handlePosterClick(poster) {
      console.log('点击海报:', poster);
      // 可以在这里处理海报点击事件，比如跳转到指定页面
      if (poster.url) {
        uni.navigateTo({
          url: poster.url
        });
      }
      this.showPosterModal = false;
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
    },

    // 跳转到推荐骑手（骑手端推荐分享管理弹窗）
    goToRiderRecommend() {
      uni.navigateTo({
        url: '/riderEnd/my',
        success: () => {
          // 延迟一下确保页面加载完成，然后触发推荐分享管理弹窗
          setTimeout(() => {
            // 通过事件总线通知骑手端我的页面打开推荐分享管理弹窗
            uni.$emit('openRiderShareModal');
          }, 300);
        },
        fail: (err) => {
          console.error('跳转到骑手端我的页面失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },

    // 跳转到推荐用户（用户端分享推荐弹窗）
    goToUserRecommend() {
      uni.switchTab({
        url: '/pages/my/my',
        success: () => {
          // 延迟一下确保页面加载完成，然后触发分享推荐弹窗
          setTimeout(() => {
            // 通过事件总线通知用户端我的页面打开分享推荐弹窗
            uni.$emit('openShareModal');
          }, 300);
        },
        fail: (err) => {
          console.error('跳转到用户端我的页面失败:', err);
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
.order-hall {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: calc(100rpx + constant(safe-area-inset-bottom));
  /* iOS < 11.2 */
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
  /* iOS >= 11.2 */
  box-sizing: border-box;
  position: relative;
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
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

.city-selector-container {
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1rpx solid #eee;
  padding: 10rpx 0;
}

.city-selector {
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;

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

.city-count-badge {
  background-color: #f0f8ff;
  border-radius: 20rpx;
  padding: 4rpx 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;

  .city-count-text {
    font-size: 20rpx;
    color: #2492F2;
    font-weight: 400;
    line-height: 28rpx;
  }
}

.banner {
  width: 100%;
  height: 300rpx;
  padding: 0 20rpx;
  box-sizing: border-box;

  .banner-swiper {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
    overflow: hidden;

    .banner-image {
      width: 100%;
      height: 100%;
      border-radius: 12rpx;
    }
  }

  // 保留原有的image样式作为备用
  image {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
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
  background-color: #F5F5F5;
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
  padding: 10rpx;
  box-sizing: border-box;
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  /* iOS < 11.2 */
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  /* iOS >= 11.2 */
  width: 100%;
  box-sizing: border-box;

  .order-item {
    background-color: #fff;
    margin: 20rpx 10rpx;
    border-radius: 12rpx;
    padding: 20rpx;
    width: calc(100% - 20rpx);
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;

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

        .copy-btn {
          font-size: 22rpx;
          color: #fff;
          background-color: rgba(36, 146, 242, 0.6);
          padding: 4rpx 16rpx;
          border-radius: 4rpx;
          margin-left: 10rpx;
        }
      }

      .order-price {
        font-size: 32rpx;
        color: #F6552D;
        font-weight: 500;
      }
    }

    .order-time {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 20rpx;
      padding-bottom: 10rpx;
      border-bottom: 1rpx solid #eee;
    }

    .order-content {
      display: flex;
      align-items: flex-start;
      width: 100%;
      box-sizing: border-box;
      position: relative;
      padding-bottom: 20rpx;

      .order-icon {
        width: 100rpx;
        height: 110rpx;
        border-radius: 10rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;
        flex-shrink: 0;

        text {
          font-size: 44rpx;
          color: #fff;
          font-weight: bold;
        }

        &.repair {
          background-color: #2492F2;
        }

        &.supplement {
          background-color: #2492F2;
        }

        &.offline-abnormal {
          background-color: #2492F2;
        }

        &.income-abnormal {
          background-color: #2492F2;
        }

        &.other-abnormal {
          background-color: #2492F2;
        }
      }

      .order-details {
        flex: 1;
        min-width: 0;

        .address {
          font-size: 25rpx;
          color: #333;
          font-weight: 600;
          margin-bottom: 10rpx;
          word-break: break-all;
        }

        .service-time, .service-item {
          font-size: 22rpx;
          color: #666;
          margin-bottom: 6rpx;
          word-break: break-all;

          &::after {
            content: attr(data-content);
            color: #EB5E2A;
            margin-left: 10rpx;
          }
        }

        .service-item {
          &::after {
            color: #F04141;
          }
        }
      }

      .distance-info {
        display: flex;
        align-items: center;
        margin-left: 10rpx;
        flex-shrink: 0;
        background-color: #E6F1FA;
        padding: 4rpx 10rpx;
        border-radius: 6rpx;

        .location-icon {
          width: 24rpx;
          height: 24rpx;
        }

        text {
          font-size: 18rpx;
          color: #2492F2;
        }
      }

      .take-order-btn {
        position: absolute;
        right: 0;
        bottom: 5rpx;
        width: 120rpx;
        height: 50rpx;
        line-height: 50rpx;
        background-color: #ff6b00;
        color: #fff;
        font-size: 24rpx;
        border-radius: 25rpx;
        text-align: center;
        padding: 0;
      }

      .completed-label {
        position: absolute;
        right: 0;
        bottom: 5rpx;
        width: 120rpx;
        height: 50rpx;
        line-height: 50rpx;
        background-color: #ccc;
        color: #666;
        font-size: 24rpx;
        border-radius: 25rpx;
        text-align: center;
      }

      .assigned-label {
        position: absolute;
        right: 0;
        bottom: 5rpx;
        min-width: 120rpx;
        max-width: 200rpx;
        height: 50rpx;
        line-height: 50rpx;
        background-color: #ccc;
        color: #666;
        font-size: 22rpx;
        border-radius: 25rpx;
        text-align: center;
        padding: 0 10rpx;
        box-sizing: border-box;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .order-footer {
      display: none;
    }

    // 完结订单样式
    &.completed-order {
      opacity: 0.6;
      position: relative;
      overflow: hidden;

      .order-header,
      .order-time,
      .order-content {
        position: relative;
        z-index: 1;
      }
    }

    // 进行中订单样式
    &.assigned-order {
      opacity: 0.7;
      position: relative;
      overflow: hidden;

      .order-header,
      .order-time,
      .order-content {
        position: relative;
        z-index: 1;
      }
    }
  }

  // 完结订单盖章图片样式
  .completed-stamp-image {
	  transform: rotate(60deg);
    position: absolute;
    top: 30rpx;
    right: 80rpx;
    width: 150rpx;
    height: 150rpx;
    z-index: 10;
    pointer-events: none;
    filter: brightness(0) saturate(100%) invert(27%) sepia(99%) saturate(1234%) hue-rotate(201deg) brightness(96%) contrast(95%);
  }

  // 进行中订单盖章图片样式
  .assigned-stamp-image {
	  transform: rotate(60deg);
    position: absolute;
    top: 30rpx;
    right: 80rpx;
    width: 150rpx;
    height: 150rpx;
    z-index: 10;
    pointer-events: none;
    filter: brightness(0) saturate(100%) invert(27%) sepia(99%) saturate(1234%) hue-rotate(201deg) brightness(96%) contrast(95%);
  }
}

.loading-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;

  .loading-spinner {
    width: 40rpx;
    height: 40rpx;
    border: 3rpx solid #f3f3f3;
    border-top: 3rpx solid #2492F2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 10rpx;
  }

  .loading-text {
    font-size: 24rpx;
    color: #999;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-more-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;

  text {
    font-size: 24rpx;
    color: #999;
  }
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 40rpx;

  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 10rpx;
  }

  .empty-subtitle {
    font-size: 32rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 50rpx;
  }

  .promotion-tip {
    background-color: #2492F2;
    border-radius: 20rpx;
    padding: 12rpx 24rpx;
    margin-bottom: 30rpx;

    .promotion-text {
      font-size: 26rpx;
      color: #fff;
      font-weight: 500;
    }
  }

  .recommend-item {
    width: 100%;
    background-color: #fff;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    margin-bottom: 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

    .recommend-text {
      flex: 1;
      font-size: 26rpx;
      color: #333;
      line-height: 1.4;
    }

    .recommend-btn {
      font-size: 28rpx;
      color: #ff4d4f;
      font-weight: 600;
      margin-left: 20rpx;
      flex-shrink: 0;
    }

    &:active {
      background-color: #f5f5f5;
    }
  }
}

// 订单详情弹窗样式
.order-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.order-modal-container {
  width: 85%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.order-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);

  .order-modal-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  .order-modal-close {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    color: #999;
    background-color: #f8f9fa;
    border-radius: 50%;
    cursor: pointer;

    &:active {
      background-color: #e8e8e8;
      transform: scale(0.95);
    }
  }
}

.order-modal-content {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.order-modal-info {
  .info-row {
    display: flex;
    margin-bottom: 20rpx;
    font-size: 26rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      color: #666;
      width: 140rpx;
      font-weight: 500;
      flex-shrink: 0;
    }

    .info-value {
      color: #333;
      flex: 1;
      font-weight: 500;

      &.amount {
        color: #ff4d4f;
        font-weight: 600;
        font-size: 28rpx;
      }
    }

    .service-time-modal, .service-item-modal {
      font-size: 26rpx;
      color: #666;
      position: relative;

      &::after {
        content: attr(data-content);
        color: #EB5E2A;
        margin-left: 10rpx;
        font-weight: 500;
      }
    }

    .service-item-modal {
      &::after {
        color: #F04141;
      }
    }
  }
}

.order-modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
  gap: 16rpx;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
}

.modal-btn {
  padding: 16rpx 32rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 120rpx;

  &.cancel {
    background-color: #f8f9fa;
    color: #666;
    border: 1rpx solid #e8e8e8;

    &:active {
      background-color: #e8e8e8;
      transform: scale(0.95);
    }
  }

  &.confirm {
    background: linear-gradient(135deg, #2492F2 0%, #1976D2 100%);
    color: #fff;
    border: 1rpx solid #2492F2;

    &:active {
      opacity: 0.9;
      transform: scale(0.95);
    }

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;

      &:active {
        transform: none;
        opacity: 0.6;
      }
    }
  }
}
</style>
