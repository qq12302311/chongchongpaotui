<template>
  <view class="order-list-container">
    <nav-bar title="订单列表" title-align="center" :showBackButton="true"></nav-bar>
    <view class="nav-placeholder" :style="{ height: navBarHeight + 'px' }"></view>

    <!-- 固定的顶部区域 -->
    <view class="fixed-top">
      <!-- 搜索和筛选区域 -->
      <view class="search-filter">
      <view class="search-box">
        <view class="search-icon-wrapper">
          <view class="search-icon"></view>
        </view>
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="输入订单号或用户名搜索"
          class="search-input"
          @confirm="searchOrders"
        />
        <view class="search-btn" @click="searchOrders">搜索</view>
      </view>
      <view class="filter-options">
        <view class="filter-section">
          <view class="filter-title">
            <view class="title-icon status-icon"></view>
            <text>订单状态</text>
          </view>
          <view class="filter-items">
            <view
              class="filter-item"
              :class="{ active: currentStatus === status.value }"
              v-for="status in statusOptions"
              :key="status.value"
              @click="switchStatus(status.value)"
            >
              <text class="filter-label">{{ status.label }}</text>
              <view v-if="status.count > 0" class="filter-badge">{{ status.count }}</view>
            </view>
          </view>
        </view>

        <view class="filter-section">
          <view class="filter-title">
            <view class="title-icon zone-icon"></view>
            <text>服务区域</text>
          </view>
          <view class="filter-items">
            <view class="zone-selector" @click="showCascadeSelector">
              <text class="zone-text">{{ zoneOptions.length > 0 ? zoneOptions[0].label : '全部区域' }}</text>
              <view class="zone-arrow"></view>
            </view>
            <!-- 时间查询 -->
            <view class="time-filter">
              <view
                class="time-item"
                :class="{ active: currentTimeFilter === time.value }"
                v-for="time in timeFilterOptions"
                :key="time.value"
                @click="switchTimeFilter(time.value)"
              >
                {{ time.label }}
              </view>
            </view>
          </view>
        </view>

        <!-- 级联选择器 -->
        <view class="cascade-mask" v-if="showCascade" @click="hideCascadeSelector"></view>
        <view class="cascade-container" v-if="showCascade">
          <view class="cascade-header">
            <view class="cascade-title">选择区域</view>
            <view class="cascade-close" @click="hideCascadeSelector">×</view>
          </view>

          <view class="cascade-tabs">
            <view
              class="cascade-tab"
              :class="{ active: currentLevel === 'province' }"
              @click="currentLevel = 'province'"
            >
              {{ selectedProvince ? (provinceList.find(p => p.province_id === selectedProvince) ? provinceList.find(p => p.province_id === selectedProvince).name : '省份') : '省份' }}
            </view>
            <view
              class="cascade-tab"
              :class="{ active: currentLevel === 'city', disabled: !selectedProvince }"
              @click="selectedProvince && (currentLevel = 'city')"
            >
              {{ selectedCity ? (cityList.find(c => c.city_id === selectedCity) ? cityList.find(c => c.city_id === selectedCity).name : '城市') : '城市' }}
            </view>
            <view
              class="cascade-tab"
              :class="{ active: currentLevel === 'district', disabled: !selectedCity }"
              @click="selectedCity && (currentLevel = 'district')"
            >
              {{ selectedDistrict ? (districtList.find(d => d.district_id === selectedDistrict) ? districtList.find(d => d.district_id === selectedDistrict).name : '区县') : '区县' }}
            </view>
          </view>

          <view class="cascade-content">
            <!-- 省份列表 -->
            <scroll-view
              scroll-y
              class="cascade-list"
              v-if="currentLevel === 'province'"
            >
              <view
                class="cascade-item"
                :class="{ active: selectedProvince === province.province_id }"
                v-for="province in provinceList"
                :key="province.province_id"
                @click="selectProvince(province.province_id)"
              >
                {{ province.name }}
              </view>
            </scroll-view>

            <!-- 城市列表 -->
            <scroll-view
              scroll-y
              class="cascade-list"
              v-if="currentLevel === 'city'"
            >
              <view
                class="cascade-item"
                :class="{ active: selectedCity === city.city_id }"
                v-for="city in cityList"
                :key="city.city_id"
                @click="selectCity(city.city_id)"
              >
                {{ city.name }}
              </view>
            </scroll-view>

            <!-- 区县列表 -->
            <scroll-view
              scroll-y
              class="cascade-list"
              v-if="currentLevel === 'district'"
            >
              <view
                class="cascade-item"
                :class="{ active: selectedDistrict === district.district_id }"
                v-for="district in districtList"
                :key="district.district_id"
                @click="selectDistrict(district.district_id)"
              >
                {{ district.name }}
              </view>
            </scroll-view>
          </view>
        </view>
      </view>
    </view>
    </view>

    <!-- 固定顶部区域的占位元素 -->
    <view class="fixed-top-placeholder"></view>

    <!-- 订单列表 -->
    <view class="order-list">
      <!-- 加载中提示 -->
      <view v-if="loading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="orderList.length === 0" class="empty-state">
        <view class="empty-icon"></view>
        <text class="empty-text">暂无相关订单</text>
      </view>

      <!-- 订单列表内容 -->
      <view v-else class="order-list-content">
        <view
          class="order-item"
          v-for="(order, index) in orderList"
          :key="index"
          @click="showOrderDetail(order)"
        >
          <view class="order-header">
            <view class="order-number">
              订单号：{{ order.task_no }}
              <view class="copy-btn-small" @click.stop="copyText(order.task_no)">复制</view>
            </view>
            <view class="order-status" :class="order.payment_status === 'refunded' ? 'refunded' : (order.status === 'assigned' && order.time_out === true ? 'timeout' : order.status)">
              {{ order.payment_status === 'refunded' ? '已退款' : getStatusText(order.status, order) }}
            </view>
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
            <view class="info-row" v-if="order.task_detail && order.task_detail.extra_task && order.task_detail.extra_task.length > 0">
              <text class="info-label">附加服务：</text>
              <view class="info-value">
                <text v-for="(item, index) in formatExtraServices(order.task_detail.extra_task)" :key="index">
                  {{ item.name }}<text v-if="item.quantity" class="quantity-text">{{ item.quantity }}</text>{{ index < formatExtraServices(order.task_detail.extra_task).length - 1 ? '、' : '' }}
                </text>
              </view>
            </view>
            <view class="info-row" v-if="order.time_limit">
              <text class="info-label">服务时效：</text>
              <text class="info-value">{{ order.time_limit }}小时内 <text class="deadline-text" v-if="order.deadline">({{ formatDeadline(order.deadline) }}前完成)</text></text>
            </view>
            <view class="info-row">
              <text class="info-label">门店名称：</text>
              <text class="info-value">{{ order.task_detail.store_name || '未指定门店' }}</text>
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
            <view class="info-row user-info-row">
              <text class="info-label">用户信息：</text>
              <view class="info-value">
                <text>{{ order.name }} {{ order.phone_number }}</text>
                <view class="repeat-purchase-tag" v-if="order.user && order.user.repeat_purchase" :class="'tag-' + order.user.repeat_purchase">
                  {{ getRepeatPurchaseText(order.user.repeat_purchase) }}
                </view>
              </view>
              <!-- 按钮容器 -->
              <view class="action-buttons">
                <!-- 进行中的任务显示撤销任务按钮 -->
                <view class="cancel-order-btn" v-if="order.status === 'assigned'" @click.stop="showCancelModal(order)">撤销任务</view>
                <!-- 退款相关按钮 -->
                <view class="refund-btn audit-btn" v-if="currentStatus === 'refundPending'" @click.stop="showAuditModal(order)">审核</view>
                <view class="refund-btn" v-else-if="order.status !== 'canceled' && order.payment_status !== 'refunded'" @click.stop="showRefundModal(order)">申请退款</view>
              </view>
            </view>
            <!-- 骑手信息 -->
            <view class="info-divider" v-if="order.service_member"></view>
            <view class="info-row" v-if="order.service_member">
              <text class="info-label">骑手姓名：</text>
              <text class="info-value">{{ order.service_member.contact_person || '未分配' }}</text>
            </view>
            <view class="info-row" v-if="order.service_member && order.service_member.phone_number">
              <text class="info-label">联系电话：</text>
              <view class="info-value-wrap">
                <text class="info-value">{{ order.service_member.phone_number }}</text>
                <view class="call-btn" @click.stop="makePhoneCall(order.service_member.phone_number)">拨打</view>
                <view class="copy-btn" @click.stop="copyText(order.service_member.phone_number)">复制</view>
              </view>
            </view>
          </view>
          <!-- 退款按钮已移至用户信息右侧，这里不再需要 -->
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view v-if="orderList.length > 0 && hasMore && !loadingMore" class="load-more" @click="loadMoreData">
        <text>上拉加载更多 (点击也可加载)</text>
      </view>
      <view v-else-if="orderList.length > 0 && loadingMore" class="load-more loading">
        <view class="loading-spinner-small"></view>
        <text>正在加载更多...</text>
      </view>
      <view v-else-if="orderList.length > 0 && !hasMore" class="no-more">
        <text>没有更多数据了</text>
      </view>
    </view>
    <!-- 退款弹窗 -->
    <view class="modal-mask" v-if="showRefund" @click="closeRefundModal"></view>
    <view class="modal-container" v-if="showRefund">
      <view class="modal-header">
        <text class="modal-title">订单退款</text>
        <view class="modal-close" @click="closeRefundModal">×</view>
      </view>
      <view class="modal-content">
        <view class="modal-info">
          <view class="info-row">
            <text class="info-label">订单号：</text>
            <text class="info-value">{{ currentOrder.task_no }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">门店名称：</text>
            <text class="info-value">{{ currentOrder.store_name || '未指定门店' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">订单金额：</text>
            <text class="info-value">¥{{ parseFloat(currentOrder.order_amount || 0).toFixed(2) }}</text>
          </view>
        </view>
        <view class="input-group">
          <text class="input-label">退款金额</text>
          <input
            type="digit"
            v-model="refundAmount"
            placeholder="请输入退款金额"
            class="input-field"
          />
        </view>
        <view class="input-group">
          <text class="input-label">退款原因</text>
          <textarea
            v-model="refundReason"
            placeholder="请输入退款原因"
            class="textarea-field"
          ></textarea>
        </view>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="closeRefundModal">取消</view>
        <view class="modal-btn confirm" :class="{disabled: refundLoading}" @click="!refundLoading && confirmRefund()">
          <text v-if="refundLoading">处理中...</text>
          <text v-else>确认退款</text>
        </view>
      </view>
    </view>

    <!-- 审核退款弹窗 -->
    <view class="modal-mask" v-if="showAudit" @click="closeAuditModal"></view>
    <view class="modal-container" v-if="showAudit">
      <view class="modal-header">
        <text class="modal-title">退款审核</text>
        <view class="modal-close" @click="closeAuditModal">×</view>
      </view>
      <view class="modal-content">
        <view class="modal-info">
          <view class="info-row">
            <text class="info-label">订单号：</text>
            <text class="info-value">{{ currentOrder.task_no }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">门店名称：</text>
            <text class="info-value">{{ currentOrder.task_detail && currentOrder.task_detail.store_name || '未指定门店' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">订单金额：</text>
            <text class="info-value">¥{{ currentOrder.order_amount || currentOrder.total_amount }}</text>
          </view>
          <view class="info-row" v-if="currentOrder.refund_reason">
            <text class="info-label">申请原因：</text>
            <text class="info-value">{{ currentOrder.refund_reason }}</text>
          </view>
        </view>
        <!-- 驳回原因输入框 -->
        <view class="reject-reason-section" v-if="showRejectReason">
          <view class="input-group">
            <text class="input-label">驳回原因</text>
            <textarea
              v-model="rejectReason"
              placeholder="请输入驳回原因"
              class="textarea-field"
            ></textarea>
          </view>
        </view>
      </view>
      <view class="modal-footer">
        <view class="modal-btn reject" v-if="!showRejectReason" :class="{disabled: auditLoading}" @click="!auditLoading && showRejectInput()">
          <text v-if="rejectLoading">处理中...</text>
          <text v-else>驳回申请</text>
        </view>
        <view class="modal-btn reject" v-if="showRejectReason" :class="{disabled: rejectLoading}" @click="!rejectLoading && confirmReject()">
          <text v-if="rejectLoading">处理中...</text>
          <text v-else>确认驳回</text>
        </view>
        <view class="modal-btn confirm" :class="{disabled: auditLoading}" @click="!auditLoading && confirmAudit()">
          <text v-if="auditLoading">处理中...</text>
          <text v-else>确认退款</text>
        </view>
      </view>
    </view>

    <!-- 撤销任务弹窗 -->
    <view class="modal-mask" v-if="showCancel" @click="closeCancelModal"></view>
    <view class="modal-container" v-if="showCancel">
      <view class="modal-header">
        <text class="modal-title">撤销任务</text>
        <view class="modal-close" @click="closeCancelModal">×</view>
      </view>
      <view class="modal-content">
        <view class="modal-info">
          <view class="info-row">
            <text class="info-label">订单号：</text>
            <text class="info-value">{{ currentOrder.task_no }}</text>
          </view>
          <view class="confirm-text">
            <text>确认要撤销此任务吗？</text>
          </view>
        </view>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="closeCancelModal">取消</view>
        <view class="modal-btn confirm" @click="confirmCancel">确认撤销</view>
      </view>
    </view>

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
      searchKeyword: '',
      currentStatus: 'waiting',
      currentZone: '',
      statusOptions: [
        { label: '全部', value: 'all', count: 0 },
        { label: '待接单', value: 'waiting', count: 0 },
        { label: '进行中', value: 'inProgress', count: 0 },
        { label: '待确认', value: 'finished', count: 0 },
        { label: '超时', value: 'timeout', count: 0 },
        { label: '已完成', value: 'completed', count: 0 },
        { label: '已取消', value: 'canceled', count: 0 },
        { label: '退款待审核', value: 'refundPending', count: 0 },
        // { label: '已退款', value: 'refunded' }
      ],
      // 区域数据
      zoneOptions: [],
      // 级联选择相关数据
      cascadeData: [],
      selectedProvince: '',
      selectedCity: '',
      selectedDistrict: '',
      showCascade: false,
      currentLevel: 'province',
      provinceList: [],
      cityList: [],
      districtList: [],
      orderList: [],
      loading: false,
      page: 1,
      pageSize: 10,
      hasMore: true,
      showRefund: false,
      showCancel: false,
      showAudit: false,
      currentOrder: {},
      refundAmount: '',
      refundReason: '',
      cancelReason: '',
      riderUserInfo: null,
      refundLoading: false,
      auditLoading: false,
      // 加载更多相关变量
      loadingMore: false,
      // 驳回相关变量
      showRejectReason: false,
      rejectReason: '',
      rejectLoading: false,
      // 时间筛选相关
      currentTimeFilter: 'yesterday',
      timeFilterOptions: [
        { label: '全时段', value: 'all' },
        { label: '今日', value: 'today' },
        { label: '昨日', value: 'yesterday' },
        { label: '3日前', value: '3days' },
        { label: '7日前', value: '7days' }
      ]
    }
  },
  computed: {
  },


  onReachBottom() {
    // 页面滚动到底部时加载更多
    this.onScrollToLower();
  },
  
  onLoad() {
    // 计算导航栏高度
    const systemInfo = uni.getSystemInfoSync();
    // 状态栏高度
    const statusBarHeight = systemInfo.statusBarHeight || 0;
    // 导航栏高度（根据不同平台可能有所不同）
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48;
    // 设置导航栏占位高度
    this.navBarHeight = statusBarHeight + navBarHeight;

    // 获取用户信息
    this.riderUserInfo = uni.getStorageSync('riderUserInfo');

    // 获取区域列表
    this.getZoneList();

    // 加载订单列表
    this.page = 1;
    this.orderList = [];
    this.hasMore = true;
    this.getOrderList();
  },

  onShow() {
  },
  methods: {
    // 获取区域列表
    async getZoneList() {
      try {
        // 获取用户信息
        if (!this.riderUserInfo || !this.riderUserInfo.id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        // 构建请求参数
        const params = {
          // service_member_id: this.riderUserInfo.id,
          service_member_id: this.riderUserInfo.id,
			type: "manager",
          sign: "chongchong",
        };

        // 发送请求
        const res = await this.$request('service/zone', params, 'POST');

        if (res.code === 200 && res.data) {
          // 保存原始数据
          this.cascadeData = res.data || [];

          // 处理省份列表
          this.provinceList = [{ name: '全部', province_id: '' }];
          this.cascadeData.forEach(province => {
            this.provinceList.push({
              name: province.name,
              province_id: province.province_id
            });
          });

          // 初始化区域选项
          this.updateZoneDisplay();
        } else {
          console.error('获取区域列表失败:', res.message);
        }
      } catch (err) {
        console.error('获取区域列表失败:', err);
      }
    },

    // 更新区域显示
    updateZoneDisplay() {
      // 构建显示文本
      let displayText = '全部区域';

      if (this.selectedProvince) {
        const province = this.provinceList.find(p => p.province_id === this.selectedProvince);
        if (province) {
          displayText = province.name;

          if (this.selectedCity) {
            const city = this.cityList.find(c => c.city_id === this.selectedCity);
            if (city) {
              displayText = city.name;

              if (this.selectedDistrict) {
                const district = this.districtList.find(d => d.district_id === this.selectedDistrict);
                if (district) {
                  displayText = district.name;
                }
              } else {
                // 在区县中选择了"全部"，显示城市名 + "全部区县"
                displayText = city.name + ' 全部区县';
              }
            }
          } else {
            // 在地级市中选择了"全部"，显示省份名 + "全部城市"
            displayText = province.name + ' 全部城市';
          }
        }
      }

      // 更新区域选项显示
      this.zoneOptions = [{ label: displayText, value: '' }];

      console.log('🎯 区域显示更新:', {
        displayText,
        selectedProvince: this.selectedProvince,
        selectedCity: this.selectedCity,
        selectedDistrict: this.selectedDistrict
      });
    },

    // 显示级联选择器
    showCascadeSelector() {
      this.showCascade = true;
      this.currentLevel = 'province';
    },

    // 隐藏级联选择器
    hideCascadeSelector() {
      this.showCascade = false;
    },

    // 选择省份
    selectProvince(provinceId) {
      this.selectedProvince = provinceId;
      this.selectedCity = '';
      this.selectedDistrict = '';

      if (provinceId) {
        // 查找对应的省份数据
        const province = this.cascadeData.find(p => p.province_id === provinceId);
        if (province && province.children) {
          // 更新城市列表
          this.cityList = [{ name: '全部', city_id: '' }];
          province.children.forEach(city => {
            this.cityList.push({
              name: city.name,
              city_id: city.city_id
            });
          });

          // 切换到城市选择
          this.currentLevel = 'city';
        } else {
          // 没有子城市，直接应用选择
          this.updateZoneDisplay();
          this.hideCascadeSelector();
          this.reloadOrders();
        }
      } else {
        // 选择了"全部"，直接应用选择
        this.updateZoneDisplay();
        this.hideCascadeSelector();
        this.reloadOrders();
      }
    },

    // 选择城市
    selectCity(cityId) {
      this.selectedCity = cityId;
      this.selectedDistrict = '';

      if (cityId) {
        // 查找对应的省份数据
        const province = this.cascadeData.find(p => p.province_id === this.selectedProvince);
        if (province && province.children) {
          // 查找对应的城市数据
          const city = province.children.find(c => c.city_id === cityId);
          if (city && city.children) {
            // 更新区县列表
            this.districtList = [{ name: '全部', district_id: '' }];
            city.children.forEach(district => {
              this.districtList.push({
                name: district.name,
                district_id: district.district_id
              });
            });

            // 切换到区县选择
            this.currentLevel = 'district';
          } else {
            // 没有子区县，直接应用选择
            this.updateZoneDisplay();
            this.hideCascadeSelector();
            this.reloadOrders();
          }
        }
      } else {
        // 选择了地级市中的"全部"，直接应用选择
        console.log('🏙️ 地级市中点击全部，province_id:', this.selectedProvince);
        this.updateZoneDisplay();
        this.hideCascadeSelector();
        this.reloadOrders();
      }
    },

    // 选择区县
    selectDistrict(districtId) {
      this.selectedDistrict = districtId;

      if (!districtId) {
        // 选择了区县中的"全部"
        console.log('🏘️ 区县中点击全部，city_id:', this.selectedCity);
      }

      this.updateZoneDisplay();
      this.hideCascadeSelector();
      this.reloadOrders();
    },
    // 切换订单状态
    switchStatus(status) {
      this.currentStatus = status;
      this.page = 1;
      this.orderList = [];
      this.hasMore = true;
      this.getOrderList();
    },

    // 切换时间筛选
    switchTimeFilter(timeFilter) {
      this.currentTimeFilter = timeFilter;
      this.page = 1;
      this.orderList = [];
      this.hasMore = true;
      this.getOrderList();
    },

    // 计算时间范围
    getDateRange(timeFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (timeFilter) {
        case 'all':
          // 全时段：不传递时间参数
          return {};
        case 'today':
          // 今日：今天00:00:00 到 今天23:59:59
          return {
            start_date: this.formatDate(today),
            end_date: this.formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1))
          };
        case 'yesterday':
          // 昨日：昨天00:00:00 到 昨天23:59:59
          const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
          return {
            start_date: this.formatDate(yesterday),
            end_date: this.formatDate(new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1))
          };
        case '3days':
          // 3日前：前天00:00:00 到 6天前23:59:59
          const dayBeforeYesterday = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
          const sixDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
          return {
            start_date: this.formatDate(sixDaysAgo),
            end_date: this.formatDate(new Date(dayBeforeYesterday.getTime() + 24 * 60 * 60 * 1000 - 1))
          };
        case '7days':
          // 7日前：7天前00:00:00 到 更早时候（这里设为30天前）
          const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return {
            start_date: this.formatDate(thirtyDaysAgo),
            end_date: this.formatDate(new Date(sevenDaysAgo.getTime() + 24 * 60 * 60 * 1000 - 1))
          };
        default:
          return {};
      }
    },

    // 格式化日期为 YYYY-MM-DD HH:mm:ss
    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    // 切换区域
    switchZone(zone) {
      // 显示级联选择器
      this.showCascadeSelector();
    },

    // 搜索订单
    searchOrders() {
      this.page = 1;
      this.orderList = [];
      this.hasMore = true;
      this.getOrderList();
    },

    // 重新加载订单列表
    reloadOrders() {
      this.page = 1;
      this.orderList = [];
      this.hasMore = true;
      this.getOrderList();
    },
    // 获取订单列表
    async getOrderList() {
      if (this.loading) return;

      this.loading = true;
      try {
        // 获取用户信息
        if (!this.riderUserInfo || !this.riderUserInfo.id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          this.loading = false;
          return;
        }

        // 构建请求参数
        let params = {
          service_member_id: this.riderUserInfo.id,
          sign: '',
          page: this.page,
          per_page: this.pageSize
        };

        // 添加时间范围参数
        const dateRange = this.getDateRange(this.currentTimeFilter);
        if (dateRange.start_date && dateRange.end_date) {
          params.start_date = dateRange.start_date;
          params.end_date = dateRange.end_date;
          console.log('📅 时间筛选:', {
            filter: this.currentTimeFilter,
            start_date: dateRange.start_date,
            end_date: dateRange.end_date
          });
        }

        // 根据区域选择情况添加相应的参数
        if (this.selectedDistrict) {
          // 选择了具体区县
          params.district_id = this.selectedDistrict;
          console.log('📍 选择了具体区县，district_id:', this.selectedDistrict);
        } else if (this.selectedCity) {
          // 在区县里点击了"全部"，传city_id
          params.city_id = this.selectedCity;
          console.log('🏙️ 区县中点击全部，传city_id:', this.selectedCity);
        } else if (this.selectedProvince) {
          // 在地级市里点击了"全部"，传province_id
          params.province_id = this.selectedProvince;
          console.log('🏛️ 地级市中点击全部，传province_id:', this.selectedProvince);
        }
        // 如果都没选择，则不传任何区域参数（查询全部）

        console.log('📋 订单列表请求参数:', params);

        // 添加状态筛选
        if (this.currentStatus !== 'all') {
          if (this.currentStatus === 'inProgress') {
            // 进行中状态只包含已分配（assigned）
            params.status = ['assigned'];
          } else if (this.currentStatus === 'finished') {
            // 完成待确认状态只包含finished
            params.status = ['finished'];
          } else if (this.currentStatus === 'timeout') {
            // 超时订单状态：包含assigned和waiting状态
            params.status = ['assigned', 'waiting'];
            params.time_out = true;
          } else if (this.currentStatus === 'refundPending') {
            // 退款待审核状态：添加refund_request参数
            params.refund_request = 1;
          } else {
            params.status = [this.currentStatus];
          }
        } else {
          params.status = ['waiting', 'assigned', 'finished', 'completed', 'canceled'];
        }

        // 添加搜索关键字
        if (this.searchKeyword) {
          params.keyword = this.searchKeyword;
        }

        // 处理已退款状态
        let apiUrl = 'service/task/list';
        if (this.currentStatus === 'refunded') {
          apiUrl = 'service/task/list/refunded';
          params = {
            province_id: this.selectedProvince,
            city_id: this.selectedCity,
            district_id: this.selectedDistrict,
            page: this.page,
            per_page: this.pageSize,
            sign: 'chongchong'
          };
        } else {
          // 生成sign
          params.sign = 'chongchong';
        }

        // 发送请求
        const res = await this.$request(apiUrl, params, 'POST');

        if (res.code === 200 && res.data) {
          // 处理返回的数据
          let newOrders = res.data || [];

          // 如果是超时订单状态，只显示真正超时的订单
          if (this.currentStatus === 'timeout') {
            newOrders = newOrders.filter(order => {
              // 包含assigned状态且time_out为true的订单，或者waiting状态且已超过截止时间的订单
              if (order.status === 'assigned' && order.time_out === true) {
                return true;
              }
              if (order.status === 'waiting' && order.deadline) {
                const deadline = new Date(order.deadline).getTime();
                const now = Date.now();
                return !isNaN(deadline) && deadline < now;
              }
              return false;
            });
          }

          // 追加新数据
          if (this.page === 1) {
            this.orderList = newOrders;
          } else {
            this.orderList = [...this.orderList, ...newOrders];
          }

          // 判断是否还有更多数据
          this.hasMore = newOrders.length >= this.pageSize;

          // 更新状态徽标数（只在第一页时更新）
          if (this.page === 1 && res.count_data) {
            this.updateStatusCounts(res.count_data);
          }
        } else {
          uni.showToast({
            title: res.message || '获取订单列表失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('获取订单列表失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    // 更新状态徽标数
    updateStatusCounts(countData) {
      // 更新各个状态的徽标数
      this.statusOptions.forEach(status => {
        switch (status.value) {
          case 'all':
            status.count = countData.total_count || 0;
            break;
          case 'waiting':
            status.count = countData.waiting_count || 0;
            break;
          case 'inProgress':
            status.count = countData.assigned_count || 0;
            break;
          case 'finished':
            status.count = countData.finished_count || 0;
            break;
          case 'timeout':
            status.count = countData.time_out_count || 0;
            break;
          case 'completed':
            status.count = countData.completed_count || 0;
            break;
          case 'canceled':
            status.count = countData.canceled_count || 0;
            break;
          case 'refundPending':
            status.count = countData.refund_request_count || 0;
            break;
          default:
            status.count = 0;
        }
      });
    },

    // 滚动到底部加载更多
    async onScrollToLower() {
      console.log('触发滚动到底部事件');
      console.log('当前状态:', {
        loading: this.loading,
        hasMore: this.hasMore,
        loadingMore: this.loadingMore,
        page: this.page,
        orderListLength: this.orderList.length
      });

      // 如果正在加载、没有更多数据或者已经在加载更多，则不执行
      if (this.loading || !this.hasMore || this.loadingMore) {
        console.log('不满足加载条件，跳过加载');
        return;
      }

      await this.loadMoreData();
    },
    // 专门的加载更多数据方法
    async loadMoreData() {
      console.log('开始加载更多数据，当前页码:', this.page, '下一页:', this.page + 1);

      this.loadingMore = true;

      try {
        // 获取用户信息
        if (!this.riderUserInfo || !this.riderUserInfo.id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        // 增加页码
        const nextPage = this.page + 1;

        // 构建请求参数
        let params = {
          service_member_id: this.riderUserInfo.id,
          sign: '',
          page: nextPage,
          per_page: this.pageSize
        };

        // 添加时间范围参数
        const dateRange = this.getDateRange(this.currentTimeFilter);
        if (dateRange.start_date && dateRange.end_date) {
          params.start_date = dateRange.start_date;
          params.end_date = dateRange.end_date;
        }

        // 根据区域选择情况添加相应的参数
        if (this.selectedDistrict) {
          // 选择了具体区县
          params.district_id = this.selectedDistrict;
        } else if (this.selectedCity) {
          // 在区县里点击了"全部"，传city_id
          params.city_id = this.selectedCity;
        } else if (this.selectedProvince) {
          // 在地级市里点击了"全部"，传province_id
          params.province_id = this.selectedProvince;
        }
        // 如果都没选择，则不传任何区域参数（查询全部）

        // 添加状态筛选
        if (this.currentStatus !== 'all') {
          if (this.currentStatus === 'inProgress') {
            // 进行中状态只包含已分配（assigned）
            params.status = ['assigned'];
          } else if (this.currentStatus === 'finished') {
            // 完成待确认状态只包含finished
            params.status = ['finished'];
          } else if (this.currentStatus === 'timeout') {
            // 超时订单状态：包含assigned和waiting状态
            params.status = ['assigned', 'waiting'];
            params.time_out = true;
          } else if (this.currentStatus === 'refundPending') {
            // 退款待审核状态：添加refund_request参数
            params.refund_request = 1;
          } else {
            params.status = [this.currentStatus];
          }
        } else {
          params.status = ['waiting', 'assigned', 'finished', 'completed', 'canceled'];
        }

        // 添加搜索关键字
        if (this.searchKeyword) {
          params.keyword = this.searchKeyword;
        }

        // 处理已退款状态
        let apiUrl = 'service/task/list';
        if (this.currentStatus === 'refunded') {
          apiUrl = 'service/task/list/refunded';
          const phone_number = this.riderUserInfo.phone || '';
          params = {
            service_member_id: this.riderUserInfo.id,
            province_id: this.selectedProvince,
            city_id: this.selectedCity,
            district_id: this.selectedDistrict,
            page: nextPage,
            per_page: this.pageSize,
            sign: md5(`service_member_id=${this.riderUserInfo.id}&phone_number=${phone_number}`)
          };
        } else {
          params.sign = 'chongchong';
        }

        console.log('加载更多请求参数:', params);

        // 发送请求
        const res = await this.$request(apiUrl, params, 'POST');

        if (res.code === 200 && res.data) {
          let newOrders = res.data || [];

          console.log('获取到新订单数据:', newOrders.length, '条');

          // 如果是超时订单状态，只显示真正超时的订单
          if (this.currentStatus === 'timeout') {
            newOrders = newOrders.filter(order => {
              // 包含assigned状态且time_out为true的订单，或者waiting状态且已超过截止时间的订单
              if (order.status === 'assigned' && order.time_out === true) {
                return true;
              }
              if (order.status === 'waiting' && order.deadline) {
                const deadline = new Date(order.deadline).getTime();
                const now = Date.now();
                return !isNaN(deadline) && deadline < now;
              }
              return false;
            });
          }

          // 追加新数据到现有列表底部
          this.orderList = [...this.orderList, ...newOrders];

          // 更新页码
          this.page = nextPage;

          // 判断是否还有更多数据
          this.hasMore = newOrders.length >= this.pageSize;

          console.log('加载更多完成，总订单数量:', this.orderList.length, '是否还有更多:', this.hasMore);

          // 如果没有新数据，提示用户
          if (newOrders.length === 0) {
            uni.showToast({
              title: '没有更多数据了',
              icon: 'none'
            });
          }
        } else {
          uni.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('加载更多失败:', error);
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      } finally {
        this.loadingMore = false;
      }
    },
    // 显示订单详情
    showOrderDetail(order) {
      uni.navigateTo({
        url: `/adminEnd/orderManage/detail?id=${order.task_id}`
      });
      console.log(`导航到订单详情页: /adminEnd/orderManage/detail?id=${order.task_id}`);
    },

    // 显示退款弹窗
    showRefundModal(order) {
      this.currentOrder = order;
      this.refundAmount = order.order_amount || '';
      this.refundReason = '';
      this.showRefund = true;
    },

    // 关闭退款弹窗
    closeRefundModal() {
      this.showRefund = false;
    },

    // 确认退款
    async confirmRefund() {
      if (!this.refundAmount) {
        uni.showToast({
          title: '请输入退款金额',
          icon: 'none'
        });
        return;
      }
      if (this.refundLoading) return;
      this.refundLoading = true;
      try {
        const params = {
          task_id: this.currentOrder.task_id,
          service_member_id: this.riderUserInfo.id,
          refund_amount: this.refundAmount,
          sign: "chongchong"
        };
        const res = await this.$request('task/cancel', params, 'POST');
        if (res.status === 'success') {
          uni.showToast({
            title: '退款成功',
            icon: 'success'
          });
          this.closeRefundModal();
          this.reloadOrders();
        } else {
          uni.showToast({
            title: res.message || '退款失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('退款失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.refundLoading = false;
      }
    },

    // 显示审核弹窗
    showAuditModal(order) {
      this.currentOrder = order;
      this.showAudit = true;
    },

    // 关闭审核弹窗
    closeAuditModal() {
      this.showAudit = false;
      this.currentOrder = {};
      this.auditLoading = false;
      this.showRejectReason = false;
      this.rejectReason = '';
      this.rejectLoading = false;
    },

    // 确认审核退款
    async confirmAudit() {
      if (this.auditLoading) return;
      this.auditLoading = true;
      try {
        const params = {
          task_id: this.currentOrder.task_id,
          service_member_id: this.riderUserInfo.id,
          refund_amount: this.currentOrder.order_amount || this.currentOrder.total_amount,
          sign: "chongchong"
        };
        const res = await this.$request('task/cancel', params, 'POST');
        if (res.status === 'success') {
          uni.showToast({
            title: '审核通过，退款成功',
            icon: 'success'
          });
          this.closeAuditModal();
          this.reloadOrders();
        } else {
          uni.showToast({
            title: res.message || '审核失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('审核失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.auditLoading = false;
      }
    },

    // 显示驳回原因输入框
    showRejectInput() {
      this.showRejectReason = true;
    },

    // 确认驳回申请
    async confirmReject() {
      if (!this.rejectReason.trim()) {
        uni.showToast({
          title: '请输入驳回原因',
          icon: 'none'
        });
        return;
      }

      if (this.rejectLoading) return;
      this.rejectLoading = true;

      try {
        const params = {
          task_id: this.currentOrder.task_id,
          service_member_id: this.currentOrder.service_member ? this.currentOrder.service_member.service_member_id : 2,
          reason: this.rejectReason,
          sign: "chongchong"
        };

        const res = await this.$request('task/refund/reject', params, 'POST');

        if (res.code === '200' || res.status === 'success') {
          uni.showToast({
            title: '驳回成功',
            icon: 'success'
          });
          this.closeAuditModal();
          this.reloadOrders();
        } else {
          uni.showToast({
            title: res.message || '驳回失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('驳回失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.rejectLoading = false;
      }
    },

    // 显示撤销任务弹窗
    showCancelModal(order) {
      this.currentOrder = order;
      this.cancelReason = '';
      this.showCancel = true;
    },

    // 关闭撤销任务弹窗
    closeCancelModal() {
      this.showCancel = false;
    },

    // 确认撤销任务
    async confirmCancel() {
      try {
        // 检查订单是否有分配的骑手
        if (!this.currentOrder.service_member || !this.currentOrder.service_member.service_member_id) {
          uni.showToast({
            title: '该订单未分配骑手，无法撤销',
            icon: 'none'
          });
          return;
        }

        const params = {
          task_id: parseInt(this.currentOrder.task_id),
          service_member_id: this.currentOrder.service_member.service_member_id,
          sign: "chongchong"
        };

        console.log('撤销任务参数:', params);

        const res = await this.$request('task/giveup', params, 'POST');

        console.log('撤销任务响应:', res);

        if (res.code === 200) {
          uni.showToast({
            title: '撤销任务成功',
            icon: 'success'
          });
          this.closeCancelModal();
          this.reloadOrders();
        } else {
          uni.showToast({
            title: res.message || '撤销任务失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('撤销任务失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    },

    // 拨打电话
    makePhoneCall(phoneNumber) {
      if (!phoneNumber) return;

      uni.makePhoneCall({
        phoneNumber: phoneNumber,
        success: () => {
          console.log('拨打电话成功');
        },
        fail: (err) => {
          console.error('拨打电话失败:', err);
          uni.showToast({
            title: '拨打电话失败',
            icon: 'none'
          });
        }
      });
    },

    // 复制文本
    copyText(text) {
      if (!text) return;

      uni.setClipboardData({
        data: text,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          });
        },
        fail: (err) => {
          console.error('复制失败:', err);
          uni.showToast({
            title: '复制失败',
            icon: 'none'
          });
        }
      });
    },
    // 格式化附加服务
    formatExtraServices(extraTasks) {
      if (!extraTasks || !Array.isArray(extraTasks) || extraTasks.length === 0) {
        return [];
      }

      return extraTasks.map(task => {
        // 检查是否有数量信息
        const name = task.name || task.task_name || '';
        const quantity = task.item_number ? `x${task.item_number}` : '';

        return {
          name,
          quantity
        };
      });
    },

    // 格式化截止时间
    formatDeadline(deadline) {
      if (!deadline) return '';

      // 处理日期格式
      let deadlineDate;
      try {
        // 尝试解析日期字符串
        deadlineDate = new Date(deadline);

        // 检查是否是有效日期
        if (isNaN(deadlineDate.getTime())) {
          return deadline; // 如果解析失败，返回原始字符串
        }

        // 格式化为 MM-DD HH:MM
        const month = (deadlineDate.getMonth() + 1).toString().padStart(2, '0');
        const day = deadlineDate.getDate().toString().padStart(2, '0');
        const hours = deadlineDate.getHours().toString().padStart(2, '0');
        const minutes = deadlineDate.getMinutes().toString().padStart(2, '0');

        return `${month}-${day} ${hours}:${minutes}`;
      } catch (err) {
        console.error('日期格式化错误:', err);
        return deadline; // 出错时返回原始字符串
      }
    },

    // 获取品牌名称
    getBrandName(brandCode) {
      if (!brandCode) return '';

      const brandMap = {
        'meituan': '美团',
        'guaishou': '怪兽',
        'jiedian': '街电',
        'xiaodian': '小电'
      };

      return brandMap[brandCode] || brandCode;
    },

    // 获取订单状态文本
    getStatusText(status, order = null) {
      // 如果是assigned状态且time_out为true，显示为进行中（超时订单）
      if (status === 'assigned' && order && order.time_out === true) {
        return '进行中（超时）';
      }
      // 待接单状态下，截止时间已过，显示为待接单（已超时）
      if (status === 'waiting' && order && order.deadline) {
        const deadline = new Date(order.deadline).getTime();
        const now = Date.now();
        if (!isNaN(deadline) && deadline < now) {
          return '待接单（超时）';
        }
      }
      const statusMap = {
        'waiting': '待接单',
        'assigned': '进行中',
        'finished': '完成待确认',
        'completed': '已完成',
        'canceled': '已取消',
        'refunded': '已退款',
        'refundPending': '退款待审核'
      };
      return statusMap[status] || status;
    },

    // 获取复购标签文本
    getRepeatPurchaseText(repeatPurchase) {
      const textMap = {
        'new': '新',
		'daily': '日复',
		'weekly': '周复',
        'month': '月复',
        'season': '季复'
      };
      return textMap[repeatPurchase] || '';
    },




  }
}
</script>
<style lang="scss" scoped>
.order-list-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: "HarmonyOS Sans SC", "PingFang SC", sans-serif;
  color: #333;
  font-size: 28rpx;
  line-height: 1.5;
  width: 100%;
  overflow-x: hidden;

  // 全局文字样式
  text {
    font-family: "HarmonyOS Sans SC", "PingFang SC", sans-serif;
  }
}

.nav-placeholder {
  // 高度由JS动态设置
  width: 100%;
  text-align: center; // 确保标题居中
}

// 固定顶部区域
.fixed-top {
  position: fixed;
  top: 90px; /* 与导航栏占位元素高度一致 */
  left: 0;
  right: 0;
  z-index: 100;
  background-color: #f8f9fa;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

// 固定顶部区域的占位元素
.fixed-top-placeholder {
  height: 340rpx; /* 根据增加的内间距调整高度 */
  width: 100%;
  background: transparent;
}

// 搜索和筛选区域样式
.search-filter {
  background-color: #fff;
  padding: 25rpx;
  border-radius: 0 0 16rpx 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}
// 搜索框样式
.search-box {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  padding: 0 20rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #e8e8e8;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: #2492F2;
    background-color: #fff;
    box-shadow: 0 0 0 4rpx rgba(36, 146, 242, 0.1);
  }

  .search-icon-wrapper {
    margin-right: 12rpx;

    .search-icon {
      width: 32rpx;
      height: 32rpx;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        width: 20rpx;
        height: 20rpx;
        border: 2rpx solid #999;
        border-radius: 50%;
        top: 2rpx;
        left: 2rpx;
      }

      &::after {
        content: '';
        position: absolute;
        width: 10rpx;
        height: 2rpx;
        background-color: #999;
        transform: rotate(45deg);
        bottom: 6rpx;
        right: 6rpx;
      }
    }
  }

  .search-input {
    flex: 1;
    height: 60rpx;
    font-size: 26rpx;
    color: #333;
    background: transparent;
    border: none;
    outline: none;

    &::placeholder {
      color: #999;
      font-size: 24rpx;
    }
  }

  .search-btn {
    padding: 6rpx 12rpx;
    background: linear-gradient(135deg, #2492F2 0%, #1976D2 100%);
    color: #fff;
    border-radius: 6rpx;
    font-size: 22rpx;
    font-weight: 500;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.95);
      opacity: 0.9;
    }
  }
}

// 筛选选项样式
.filter-options {
  margin-top: 10rpx;
}

.filter-section {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.filter-title {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #333;

  .title-icon {
    width: 24rpx;
    height: 24rpx;
    margin-right: 8rpx;
    border-radius: 4rpx;
  }

  .status-icon {
    background: linear-gradient(135deg, #2492F2 0%, #1976D2 100%);
  }

  .zone-icon {
    background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%);
  }
}

.filter-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  align-items: center;
  justify-content: space-between;
}

.filter-item {
  position: relative;
  padding: 8rpx 45rpx;
  background-color: #f8f9fa;
  border: 1rpx solid #e8e8e8;
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #666;
  transition: all 0.3s ease;
  cursor: pointer;

  &.active {
    background: linear-gradient(135deg, #2492F2 0%, #1976D2 100%);
    color: #fff;
    border-color: #2492F2;
    box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  .filter-label {
    font-weight: 500;
  }

  .filter-badge {
    position: absolute;
    top: -8rpx;
    right: -8rpx;
    background: #ff4757;
    color: #fff;
    font-size: 18rpx;
    padding: 2rpx 8rpx;
    border-radius: 12rpx;
    min-width: 24rpx;
    height: 24rpx;
    line-height: 20rpx;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: badge-bounce 0.3s ease;
    box-shadow: 0 2rpx 8rpx rgba(255, 71, 87, 0.3);
    z-index: 10;
  }
}

@keyframes badge-bounce {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

// 区域选择器样式
.zone-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 20rpx;
  background-color: #f8f9fa;
  border: 1rpx solid #e8e8e8;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 100rpx;

  &:active {
    transform: scale(0.95);
    background-color: #e8e8e8;
  }

  .zone-text {
    font-weight: 500;
    color: #2492F2;
  }

  .zone-arrow {
    width: 0;
    height: 0;
    border-left: 6rpx solid transparent;
    border-right: 6rpx solid transparent;
    border-top: 8rpx solid #999;
    margin-left: 12rpx;
    transition: transform 0.3s ease;
  }
}

// 时间筛选样式
.time-filter {
  display: flex;
  gap: 8rpx;
  margin-left: auto;
}

.time-item {
  padding: 8rpx 16rpx;
  background-color: #f8f9fa;
  color: #666;
  border: 1rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 60rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  &.active {
    background-color: #ff4757;
    color: #fff;
    border-color: #ff4757;
    transform: scale(1.05);
    box-shadow: 0 4rpx 12rpx rgba(255, 71, 87, 0.4);
    font-weight: 600;
  }

  &:active {
    transform: scale(0.95);
  }

  &:hover:not(.active) {
    background-color: #fff;
    border-color: #ff4757;
    color: #ff4757;
  }
}

// 级联选择器样式
.cascade-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

.cascade-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 85vh;
  z-index: 1000;
  animation: slideUp 0.3s ease;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.cascade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .cascade-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  .cascade-close {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    color: #999;
    background-color: #f8f9fa;
    border-radius: 50%;
    cursor: pointer;

    &:active {
      background-color: #e8e8e8;
    }
  }
}

.cascade-tabs {
  display: flex;
  background-color: #f8f9fa;
  padding: 0 30rpx;
}

.cascade-tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &.active {
    color: #2492F2;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      background: linear-gradient(90deg, #2492F2, #1976D2);
      border-radius: 4rpx;
    }
  }

  &.disabled {
    color: #ccc;
    cursor: not-allowed;
  }
}

.cascade-content {
  height: 600rpx;
  overflow: hidden;
}

.cascade-list {
  height: 100%;
  padding: 0 30rpx;
}

.cascade-item {
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #333;
  border-bottom: 1rpx solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &.active {
    color: #2492F2;
    font-weight: 600;
    background-color: rgba(36, 146, 242, 0.05);
  }

  &:active {
    background-color: #f8f9fa;
  }
}

.order-list {
  min-height: 400rpx;
  padding: 20rpx 10rpx;
  background: transparent;
  width: 100%;
  box-sizing: border-box;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.order-list-content {
  margin-top: 70rpx;
}

.order-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin: 0 10rpx 20rpx 10rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
  width: calc(100% - 20rpx);
  box-sizing: border-box;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.order-number {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;

  .copy-btn-small {
    margin-left: 8rpx;
    padding: 2rpx 6rpx;
    background-color: #f0f0f0;
    color: #666;
    font-size: 18rpx;
    border-radius: 4rpx;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      background-color: #e0e0e0;
      transform: scale(0.95);
    }
  }
}

.order-status {
  font-size: 22rpx;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-weight: 500;
  white-space: nowrap;

  // 默认样式
  background: #f0f0f0;
  color: #666;

  // 不同状态的样式
  &.waiting {
    background: linear-gradient(135deg, #FFA726 0%, #FF9800 100%);
    color: #fff;
  }

  &.assigned {
    background: linear-gradient(135deg, #42A5F5 0%, #2196F3 100%);
    color: #fff;
  }

  &.timeout {
    background: linear-gradient(135deg, #EF5350 0%, #F44336 100%);
    color: #fff;
  }

  &.finished {
    background: linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%);
    color: #fff;
  }

  &.completed {
    background: linear-gradient(135deg, #26A69A 0%, #009688 100%);
    color: #fff;
  }

  &.canceled {
    background: linear-gradient(135deg, #BDBDBD 0%, #9E9E9E 100%);
    color: #fff;
  }

  &.refunded {
    background: linear-gradient(135deg, #AB47BC 0%, #9C27B0 100%);
    color: #fff;
  }

  &.refundPending {
    background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
    color: #fff;
  }
}
.order-info {
  margin-bottom: 10rpx;
}

.info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12rpx;
  font-size: 24rpx;
  line-height: 1.4;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  color: #999;
  width: 140rpx;
  flex-shrink: 0;
  font-weight: 500;
}

.info-value {
  color: #333;
  flex: 1;
  word-break: break-all;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: calc(100% - 140rpx);

  .brand-text {
    color: #666;
    margin-right: 12rpx;
    font-size: 22rpx;
  }

  .type-text {
    color: #333;
    font-weight: 500;
  }

  .quantity-text {
    color: #2492F2;
    font-weight: 600;
    margin-left: 4rpx;
  }

  .deadline-text {
    color: #666;
    font-size: 20rpx;
    margin-left: 10rpx;
  }
}

.order-time-row {
  position: relative;

  .order-amount {
    position: absolute;
    right: 0;
    top: 0;
    color: #ff4d4f;
    font-weight: 600;
    font-size: 26rpx;
  }
}

.user-info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  .info-value {
    flex: 1;
    margin-right: 10rpx;
    max-width: calc(100% - 120rpx);
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  .repeat-purchase-tag {
    padding: 2rpx 8rpx;
    border-radius: 8rpx;
    font-size: 18rpx;
    font-weight: 500;
    white-space: nowrap;

    &.tag-new {
      background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
      color: #fff;
    }

    &.tag-daily {
      background: linear-gradient(135deg, #FF4D4F 0%, #CF1322 100%);
      color: #fff;
    }

    &.tag-weekly {
      background: linear-gradient(135deg, #722ED1 0%, #531DAB 100%);
      color: #fff;
    }

    &.tag-month {
      background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
      color: #fff;
    }

    &.tag-season {
      background: linear-gradient(135deg, #FA8C16 0%, #D46B08 100%);
      color: #fff;
    }
  }

  .action-buttons {
    display: flex;
    gap: 6rpx;
    flex-shrink: 0;

    .cancel-order-btn,
    .refund-btn {
      padding: 8rpx 12rpx;
      font-size: 20rpx;
      border-radius: 8rpx;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
      white-space: nowrap;
      min-width: 60rpx;
      text-align: center;

      &:active {
        transform: scale(0.95);
      }
    }

    .cancel-order-btn {
      background: linear-gradient(135deg, #FFA726 0%, #FF9800 100%);
      color: #fff;

      &:active {
        opacity: 0.8;
      }
    }

    .refund-btn {
      background: linear-gradient(135deg, #EF5350 0%, #F44336 100%);
      color: #fff;

      &:active {
        opacity: 0.8;
      }

      &.audit-btn {
        background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
        color: #fff;

        &:active {
          opacity: 0.8;
        }
      }
    }
  }
}

.info-divider {
  height: 1rpx;
  background-color: #f0f0f0;
  margin: 20rpx 0;
}

.info-value-wrap {
  display: flex;
  align-items: center;
  gap: 6rpx;
  flex-wrap: nowrap;

  .info-value {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .call-btn,
  .copy-btn {
    padding: 6rpx 10rpx;
    background-color: #f0f0f0;
    color: #666;
    font-size: 20rpx;
    border-radius: 6rpx;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    min-width: 50rpx;
    text-align: center;

    &:active {
      background-color: #e0e0e0;
      transform: scale(0.95);
    }
  }

  .call-btn {
    background: linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%);
    color: #fff;
  }

  .copy-btn {
    background: linear-gradient(135deg, #42A5F5 0%, #2196F3 100%);
    color: #fff;
  }
}
// 加载状态样式
.loading-container {
  padding: 60rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 16rpx;
  margin: 20rpx;
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
  font-size: 24rpx;
  color: #999;
  font-weight: 500;
}

// 空状态样式
.empty-state {
  padding: 100rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 16rpx;
  margin: 20rpx;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border-radius: 50%;
  margin-bottom: 30rpx;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60rpx;
    height: 60rpx;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
  }
}

.empty-text {
  font-size: 26rpx;
  color: #999;
  font-weight: 500;
}

// 加载更多样式
.load-more, .no-more {
  text-align: center;
  padding: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more {
  color: #2492F2;

  &:active {
    opacity: 0.7;
    transform: scale(0.98);
  }

  &.loading {
    color: #999;
    cursor: not-allowed;

    &:active {
      transform: none;
      opacity: 1;
    }
  }
}

.no-more {
  color: #999;
  cursor: default;
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
  vertical-align: middle;
}
// 弹窗样式
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

.modal-container {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  z-index: 1000;
  animation: modalSlideIn 0.3s ease;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -60%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
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
  transition: all 0.3s ease;

  &:active {
    background-color: #e8e8e8;
    transform: scale(0.95);
  }
}

.modal-content {
  padding: 30rpx;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-info {
  margin-bottom: 30rpx;

  .info-row {
    display: flex;
    margin-bottom: 12rpx;
    font-size: 26rpx;

    .info-label {
      color: #999;
      width: 140rpx;
      font-weight: 500;
    }

    .info-value {
      color: #333;
      flex: 1;
      font-weight: 500;
    }
  }

  .confirm-text {
    text-align: center;
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    padding: 20rpx 0;
  }
}

.input-group {
  margin-bottom: 32rpx;

  .input-label {
    display: block;
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 16rpx;
  }

  .input-field,
  .textarea-field {
    width: 100%;
    padding: 16rpx 20rpx;
    border: 1rpx solid #e8e8e8;
    border-radius: 12rpx;
    font-size: 26rpx;
    color: #333;
    background-color: #f8f9fa;
    transition: all 0.3s ease;
    box-sizing: border-box;

    &:focus {
      border-color: #2492F2;
      background-color: #fff;
      box-shadow: 0 0 0 4rpx rgba(36, 146, 242, 0.1);
    }

    &::placeholder {
      color: #999;
    }
  }

  .textarea-field {
    min-height: 120rpx;
    resize: vertical;
  }
}

.reject-reason-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.modal-footer {
  display: flex;
  justify-content: center;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
  gap: 16rpx;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
}

.modal-btn {
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 100rpx;

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

  &.reject {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    color: #fff;
    border: 1rpx solid #ff6b6b;

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