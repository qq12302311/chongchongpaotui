<template>
  <view class="order-detail">
    <!-- 顶部导航栏 -->
    <nav-bar title="订单详情" title-align="center"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder" :style="{ height: navBarHeight + 'px' }"></view>

    <!-- 加载中提示 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 订单详情内容 -->
    <view v-else-if="orderInfo" class="detail-content">
      <!-- 订单状态 -->
      <view class="status-card">
        <view class="status-left">
          <view class="status-icon" :class="orderInfo.status"></view>
          <view class="status-info">
            <text class="status-text">{{ getStatusText(orderInfo.status) }}</text>
            <text class="status-desc">{{ getStatusDesc(orderInfo.status) }}</text>
          </view>
        </view>
        <view class="timeline-btn" @click="showTimelineModal">
          <text class="timeline-icon">⏰</text>
          <text class="timeline-text">时间轴</text>
        </view>
      </view>

      <!-- 订单基本信息 -->
      <view class="info-card">
        <view class="card-title">订单信息</view>
        <view class="info-item">
          <text class="info-label">订单编号</text>
          <view class="info-value-wrap">
            <text class="info-value">{{ orderInfo.task_no }}</text>
            <view class="copy-btn" @click="copyText(orderInfo.task_no)">复制</view>
          </view>
        </view>
        <view class="info-item">
          <text class="info-label">服务类型</text>
          <view class="info-value">
            <text v-if="orderInfo.brand" class="brand-text">{{ getBrandName(orderInfo.brand) }}</text>
            {{ orderInfo.task_name }}
            <text v-if="orderInfo.task_detail && orderInfo.task_detail.item_number" class="quantity-text">x{{ orderInfo.task_detail.item_number }}</text>
          </view>
        </view>
        <view class="info-item" v-if="orderInfo.task_detail && orderInfo.task_detail.device_outside !== undefined">
          <text class="info-label">设备是否外摆</text>
          <view class="info-value">
            {{ orderInfo.task_detail.device_outside ? '是' : '否' }}
          </view>
        </view>
        <view class="info-item" v-if="orderInfo.task_detail && orderInfo.task_detail.bu_bao_number">
          <text class="info-label">补宝数量</text>
          <view class="info-value">
            <text class="quantity-text">{{ orderInfo.task_detail.bu_bao_number }}</text>个
          </view>
        </view>
        <view class="info-item">
          <text class="info-label">下单时间</text>
          <text class="info-value">{{ orderInfo.task_date }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.time_limit">
          <text class="info-label">服务时效</text>
          <text class="info-value">{{ orderInfo.time_limit }}小时</text>
        </view>
        <view class="info-item">
          <text class="info-label">服务时间</text>
          <text class="info-value">{{ formatServiceTime(orderInfo.start_date, orderInfo.deadline) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">支付金额</text>
          <text class="info-value price">¥{{ parseFloat(orderInfo.order_amount || 0).toFixed(2) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">原订单金额</text>
          <text class="info-value original-price">¥{{ calculateOriginalAmount() }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.task_detail && orderInfo.task_detail.additional_notes">
          <text class="info-label">订单备注</text>
          <text class="info-value">{{ orderInfo.task_detail.additional_notes }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.recommended_service_time_start && orderInfo.recommended_service_time_end">
          <text class="info-label">建议骑手上门时间</text>
          <text class="info-value">{{ formatRecommendedTime(orderInfo.recommended_service_time_start, orderInfo.recommended_service_time_end) }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.ticket">
          <text class="info-label">优惠券</text>
          <view class="info-value">
            <text>{{ orderInfo.ticket.name }} (¥{{ orderInfo.ticket.amount }})</text>
            <view class="ticket-details" v-if="showTicketDetails">
              <view class="ticket-detail-item">
                <text class="ticket-detail-label">使用条件：</text>
                <text class="ticket-detail-value">满 ¥{{ orderInfo.ticket.min_order_amount }} 可用</text>
              </view>
              <view class="ticket-detail-item">
                <text class="ticket-detail-label">有效期：</text>
                <text class="ticket-detail-value">{{ formatTicketDate(orderInfo.ticket.start_at) }} 至 {{ formatTicketDate(orderInfo.ticket.expire_at) }}</text>
              </view>
              <view class="ticket-detail-item">
                <text class="ticket-detail-label">使用时间：</text>
                <text class="ticket-detail-value">{{ formatTicketDate(orderInfo.ticket.used_at) }}</text>
              </view>
            </view>
            <view class="ticket-toggle" @click="toggleTicketDetails">
              {{ showTicketDetails ? '收起' : '查看详情' }}
            </view>
          </view>
        </view>
      </view>

      <!-- 用户信息 -->
      <view class="info-card">
        <view class="card-title">用户信息</view>
        <!-- 下单人信息 -->
        <view class="info-item order-user-info" v-if="orderInfo.user && (orderInfo.user.username || orderInfo.user.phone_number)">
          <text class="info-label">下单人</text>
          <view class="info-value order-user-value">
            <text>{{ orderInfo.user.username || '未提供' }}</text>
            <text v-if="orderInfo.user.phone_number" class="phone-number">{{ orderInfo.user.phone_number }}</text>
            <view class="action-buttons" v-if="orderInfo.user.phone_number">
              <view class="copy-btn" @click="copyText(orderInfo.user.phone_number)">复制</view>
              <view class="call-btn" @click="callPhone(orderInfo.user.phone_number)">拨打</view>
            </view>
          </view>
        </view>
        <view class="info-item">
          <text class="info-label">联系人</text>
          <text class="info-value">{{ orderInfo.name }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">联系电话</text>
          <view class="info-value-wrap">
            <text class="info-value">{{ orderInfo.phone_number }}</text>
            <view class="copy-btn" @click="copyText(orderInfo.phone_number)">复制</view>
            <view class="call-btn" @click="callPhone(orderInfo.phone_number)">拨打</view>
          </view>
        </view>
      </view>

      <!-- 服务地址 -->
      <view class="info-card">
        <view class="card-title">服务地址</view>
        <view class="info-item">
          <text class="info-label">店铺名称</text>
          <view class="info-value-wrap">
          <text class="info-value">{{ orderInfo.task_detail && orderInfo.task_detail.store_name ? orderInfo.task_detail.store_name : '未提供' }}</text>
            <view class="copy-btn" @click="copyText(orderInfo.task_detail && orderInfo.task_detail.store_name ? orderInfo.task_detail.store_name : '')">复制</view>
          </view>
        </view>
        <view class="info-item">
          <text class="info-label">详细地址</text>
          <view class="info-value-wrap">
            <text class="info-value">{{ formatAddress(orderInfo) }}</text>
            <view class="copy-btn" @click="copyText(formatAddress(orderInfo))">复制</view>
            <view class="nav-btn" @click="openNavigation(orderInfo)">导航</view>
          </view>
        </view>
        <view class="info-item" v-if="orderInfo.task_detail && orderInfo.task_detail.sn_mac_code && Array.isArray(orderInfo.task_detail.sn_mac_code) && orderInfo.task_detail.sn_mac_code.length > 0">
          <text class="info-label">SN/MAC码</text>
          <view class="info-value">
            <view v-for="(item, index) in orderInfo.task_detail.sn_mac_code" :key="item.id" class="sn-mac-item">
              {{ item.value }}
              <view class="copy-btn" @click="copyText(item.value)">复制</view>
            </view>
          </view>
        </view>
        <view class="info-item" v-if="orderInfo.task_detail && orderInfo.task_detail.description">
          <text class="info-label">位置描述</text>
          <text class="info-value">{{ orderInfo.task_detail.description }}</text>
        </view>
      </view>

      <!-- 门头照片 -->
      <view class="info-card" v-if="orderInfo.task_detail && orderInfo.task_detail.pic_url && orderInfo.task_detail.pic_url.length > 0">
        <view class="card-title">门头照片</view>
        <view class="image-list">
          <view
            class="image-item"
            v-for="(img, index) in orderInfo.task_detail.pic_url"
            :key="index"
            @click="previewImage(img, orderInfo.task_detail.pic_url)"
          >
            <image :src="img" mode="aspectFill"></image>
          </view>
        </view>
      </view>

      <!-- 骑手信息 -->
      <view class="info-card" v-if="orderInfo.status !== 'waiting' && orderInfo.status !== 'cancel'">
        <view class="card-title">骑手信息</view>
        <view class="info-item">
          <text class="info-label">骑手姓名</text>
          <text class="info-value">{{ orderInfo.service_member.contact_person }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.service_member.phone_number">
          <text class="info-label">联系电话</text>
          <view class="info-value-wrap">
            <text class="info-value">{{ orderInfo.service_member.phone_number }}</text>
            <view class="copy-btn" @click="copyText(orderInfo.service_member.phone_number)">复制</view>
            <view class="call-btn" @click="callPhone(orderInfo.service_member.phone_number)">拨打</view>
          </view>
        </view>
        <view class="info-item" v-if="orderInfo.service_member && orderInfo.service_member.rate">
          <text class="info-label">佣金比例</text>
          <text class="info-value">{{ orderInfo.service_member.rate * 100 }}%</text>
        </view>
        <view class="info-item" v-if="orderInfo.service_member && orderInfo.service_member.rate">
          <text class="info-label">骑手佣金</text>
          <text class="info-value price">¥{{ calculateRiderCommission() }}</text>
        </view>
        <!-- 订单相关时间 -->
        <view class="info-item" v-if="orderInfo.task_assignment && orderInfo.task_assignment.accepted_at">
          <text class="info-label">接单时间</text>
          <text class="info-value">{{ orderInfo.task_assignment.accepted_at }}</text>
        </view>
      </view>

      <!-- 完成反馈 -->
      <view class="info-card" v-if="orderInfo.task_assignment && (orderInfo.task_assignment.after_detail || orderInfo.task_assignment.after_pic_url)">
        <view class="card-title">完成反馈</view>
        <view class="info-item" v-if="orderInfo.task_assignment && orderInfo.task_assignment.finished_at">
          <text class="info-label">完成时间</text>
          <text class="info-value">{{ orderInfo.task_assignment.finished_at }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.task_assignment && orderInfo.task_assignment.after_detail">
          <text class="info-label">反馈内容</text>
          <text class="info-value">{{ orderInfo.task_assignment.after_detail }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.task_assignment && orderInfo.task_assignment.after_pic_url && orderInfo.task_assignment.after_pic_url.length > 0">
          <text class="info-label">反馈图片</text>
          <view class="info-value">
            <view class="image-list">
              <view
                class="image-item"
                v-for="(img, index) in orderInfo.task_assignment.after_pic_url"
                :key="index"
                @click="previewImage(img, orderInfo.task_assignment.after_pic_url)"
              >
                <image :src="img" mode="aspectFill"></image>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 用户确认 -->
      <view class="confirm-card" v-if="orderInfo.status === 'completed' && (orderInfo.completed_at || orderInfo.review)">
        <view class="card-title">用户确认</view>
        <view class="confirm-content">
          <view class="confirm-info">
            <view class="remark" v-if="orderInfo.completed_at">
              <text class="label">确认时间：</text>
              <text class="content">{{ formatDateTime(orderInfo.completed_at) }}</text>
            </view>
            <!-- 用户评价信息 -->
            <view class="review-section" v-if="orderInfo.review">
              <text class="section-title">用户评价：</text>
              <view class="review-content">
                <view class="review-rating" v-if="orderInfo.review.rating">
                  <text class="rating-label">评分：</text>
                  <view class="stars">
                    <text
                      v-for="star in 5"
                      :key="star"
                      class="star"
                      :class="{ active: star <= orderInfo.review.rating }">
                      ★
                    </text>
                  </view>
                  <text class="rating-text">{{ orderInfo.review.rating }}分</text>
                </view>
                <view class="review-tags" v-if="orderInfo.review.tags && orderInfo.review.tags.length > 0">
                  <text class="tags-label">评价标签：</text>
                  <view class="tags-list">
                    <text
                      v-for="(tag, index) in orderInfo.review.tags"
                      :key="index"
                      class="tag-item">
                      {{ tag }}
                    </text>
                  </view>
                </view>
                <view class="review-comment" v-if="orderInfo.review.comment">
                  <text class="comment-label">评价内容：</text>
                  <text class="comment-text">{{ orderInfo.review.comment }}</text>
                </view>
                <view class="review-time" v-if="orderInfo.review.created_at">
                  <text class="time-label">评价时间：</text>
                  <text class="time-text">{{ formatDateTime(orderInfo.review.created_at) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons" v-if="orderInfo.status !== 'canceled' && orderInfo.payment_status !== 'refunded'">
        <view class="action-btn refund" @click="showRefundModal">退款</view>
        <!-- 隐藏取消订单按钮 -->
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
            <text class="info-value">{{ orderInfo.task_no }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">门店名称：</text>
            <text class="info-value">{{ orderInfo.task_detail && orderInfo.task_detail.store_name ? orderInfo.task_detail.store_name : '未提供' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">支付金额：</text>
            <text class="info-value">¥{{ parseFloat(orderInfo.order_amount || 0).toFixed(2) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">原订单金额：</text>
            <text class="info-value original-price">¥{{ calculateOriginalAmount() }}</text>
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
        <view class="modal-btn confirm" @click="confirmRefund">确认退款</view>
      </view>
    </view>

    <!-- 取消订单弹窗 -->
    <view class="modal-mask" v-if="showCancel" @click="closeCancelModal"></view>
    <view class="modal-container" v-if="showCancel">
      <view class="modal-header">
        <text class="modal-title">取消订单</text>
        <view class="modal-close" @click="closeCancelModal">×</view>
      </view>
      <view class="modal-content">
        <view class="modal-info">
          <view class="info-row">
            <text class="info-label">订单号：</text>
            <text class="info-value">{{ orderInfo.task_no }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">门店名称：</text>
            <text class="info-value">{{ orderInfo.task_detail && orderInfo.task_detail.store_name ? orderInfo.task_detail.store_name : '未提供' }}</text>
          </view>
        </view>
        <view class="input-group">
          <text class="input-label">取消原因</text>
          <textarea
            v-model="cancelReason"
            placeholder="请输入取消原因"
            class="textarea-field"
          ></textarea>
        </view>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="closeCancelModal">取消</view>
        <view class="modal-btn confirm" @click="confirmCancel">确认取消</view>
      </view>
    </view>

    <!-- 时间轴弹窗 -->
    <view class="modal-mask" v-if="showTimeline" @click="closeTimelineModal"></view>
    <view class="modal-container timeline-modal" v-if="showTimeline">
      <view class="modal-header">
        <text class="modal-title">订单时间轴</text>
        <view class="modal-close" @click="closeTimelineModal">×</view>
      </view>
      <view class="modal-content">
        <view class="timeline-container">
          <view
            class="timeline-item"
            v-for="(event, index) in getSortedTimelineEvents()"
            :key="index"
          >
            <view class="timeline-dot" :class="event.dotClass">
              <text :class="event.iconClass" v-if="event.icon">{{ event.icon }}</text>
            </view>
            <view class="timeline-content">
              <text class="timeline-title">{{ event.title }}</text>
              <text class="timeline-time" :class="{ pending: !event.time }">
                {{ event.time ? formatDateTime(event.time) : event.pendingText || '待完成' }}
              </text>
              <text class="timeline-detail" v-if="event.detail">{{ event.detail }}</text>
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
      navBarHeight: 0,
      taskId: '',
      orderInfo: null,
      loading: true,
      showRefund: false,
      showCancel: false,
      showTicketDetails: false,
      showTimeline: false,
      refundAmount: '',
      refundReason: '',
      cancelReason: '',
      riderUserInfo: null
    }
  },
  computed: {
  },
  onLoad(options) {
    // 获取订单ID
    this.taskId = options.id;

    // 计算导航栏高度
    const systemInfo = uni.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 0;
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48;
    this.navBarHeight = statusBarHeight + navBarHeight;

    // 获取用户信息
    this.riderUserInfo = uni.getStorageSync('riderUserInfo');

    // 获取订单详情
    this.getOrderDetail();
  },
  methods: {
    // 获取订单详情
    async getOrderDetail() {
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
        const params = {
          task_id: this.taskId,
          service_member_id: this.riderUserInfo.id,
          sign: "chongchong"
        };

        // 发送请求
        const res = await this.$request('task/info', params, 'POST');

        if (res.code === 200 && res.data) {
          this.orderInfo = res.data;

          // 为时间轴赋值接单时间
          if (this.orderInfo.assigned_at) {
            this.orderInfo.accepted_at = this.orderInfo.assigned_at;
          }

          // 设置默认退款金额
          this.refundAmount = this.orderInfo.order_amount || '';

          // 如果订单已分配骑手，获取骑手详细信息
          if (this.orderInfo.task_assignment && this.orderInfo.task_assignment.service_member_id) {
            this.getRiderInfo(this.orderInfo.task_assignment.service_member_id);
          }
        } else {
          uni.showToast({
            title: res.msg || '获取订单详情失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('获取订单详情失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 获取骑手详细信息
    async getRiderInfo(serviceMemberId) {
      try {
        // 如果订单信息中已经包含骑手信息，直接使用
        if (this.orderInfo.service_member) {
          this.orderInfo.riderDetail = this.orderInfo.service_member;
          return;
        }

        // 否则通过API获取骑手信息
        const params = {
          service_member_id: serviceMemberId,
          member_id: serviceMemberId,
          sign: "chongchong"
        };

        const res = await this.$request('service/member/info', params, 'POST');

        if (res.code === 200 && res.data) {
          // 将骑手详细信息添加到订单信息中
          this.orderInfo.riderDetail = res.data;
        } else {
          console.error('获取骑手详情失败:', res.msg);
        }
      } catch (err) {
        console.error('获取骑手详情失败:', err);
      }
    },



    // 获取订单状态文本
    getStatusText(status) {
      const statusMap = {
        'waiting': '待接单',
        'assigned': '进行中',
        'completed': '完成待确认',
        'finished': '已完成',
        'canceled': '已取消',
        'cancel': '已取消',
        'refunded': '已退款'
      };
      return statusMap[status] || status;
    },

    // 获取品牌名称
    getBrandName(brand) {
      const brandMap = {
        'meituan': '美团',
        'guaishou': '怪兽',
        'jiedian': '街电',
        'xiaodian': '小电',
        'zhumang': '竹芒'
      };
      return brandMap[brand] || brand;
    },

    // 获取订单状态描述
    getStatusDesc(status) {
      const descMap = {
        'waiting': '订单已提交，等待骑手接单',
        'assigned': '骑手已接单，正在前往服务',
        'completed': '骑手已完成服务，等待确认',
        'finished': '服务已完成',
        'canceled': this.formatCancelTime(),
        'cancel': this.formatCancelTime(),
        'refunded': '订单已退款'
      };
      return descMap[status] || '';
    },

    // 格式化服务时间
    formatServiceTime(startDate, deadline) {
      if (!startDate || !deadline) return '未设置';
      return `${startDate} ~ ${deadline}`;
    },

    // 格式化地址
    formatAddress(order) {
      if (!order) return '未提供';

      return [
        order.province_name || '',
        order.city_name || '',
        order.district_name || '',
        order.shop_address || '',
        order.address || ''
      ].filter(Boolean).join('');
    },

    // 格式化服务区域
    formatServiceZones(zones) {
      if (!zones || !Array.isArray(zones) || zones.length === 0) return '未设置';

      // 如果是字符串数组，直接显示前5个，超过5个显示"等xx个区域"
      if (typeof zones[0] === 'string') {
        if (zones.length <= 5) {
          return zones.join('、');
        } else {
          return zones.slice(0, 5).join('、') + ` 等${zones.length}个区域`;
        }
      }

      // 如果是数字数组，只显示数量
      return `${zones.length}个服务区域`;
    },

    // 复制文本
    copyText(text) {
      uni.setClipboardData({
        data: text,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          });
        }
      });
    },

    // 拨打电话
    callPhone(phone) {
      uni.makePhoneCall({
        phoneNumber: phone,
        fail: () => {
          uni.showToast({
            title: '拨打电话失败',
            icon: 'none'
          });
        }
      });
    },

    // 打开导航
    openNavigation(orderInfo) {
      if (!orderInfo) {
        uni.showToast({
          title: '地址信息不完整',
          icon: 'none'
        });
        return;
      }

      // 获取经纬度信息
      const latitude = orderInfo.latitude;
      const longitude = orderInfo.longitude;
      const address = this.formatAddress(orderInfo);

      // 如果有经纬度，使用经纬度导航
      if (latitude && longitude) {
        uni.openLocation({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          name: orderInfo.task_detail && orderInfo.task_detail.store_name ? orderInfo.task_detail.store_name : '目的地',
          address: address,
          fail: (err) => {
            console.error('打开地图失败:', err);
            this.fallbackNavigation(address);
          }
        });
      } else {
        // 没有经纬度时，尝试其他导航方式
        this.fallbackNavigation(address);
      }
    },

    // 备用导航方式
    fallbackNavigation(address) {
      if (!address || address === '未提供') {
        uni.showToast({
          title: '地址信息不完整，无法导航',
          icon: 'none'
        });
        return;
      }

      // 显示选择导航应用的弹窗
      uni.showActionSheet({
        itemList: ['复制地址', '使用系统地图'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 复制地址
            this.copyText(address);
          } else if (res.tapIndex === 1) {
            // 尝试使用系统地图搜索
            const encodedAddress = encodeURIComponent(address);
            // 尝试打开系统地图应用
            uni.showToast({
              title: '请在地图应用中搜索该地址',
              icon: 'none',
              duration: 3000
            });
          }
        }
      });
    },

    // 预览图片
    previewImage(current, urls) {
      uni.previewImage({
        current: current,
        urls: urls
      });
    },

    // 切换优惠券详情显示
    toggleTicketDetails() {
      this.showTicketDetails = !this.showTicketDetails;
    },

    // 格式化优惠券日期
    formatTicketDate(dateStr) {
      if (!dateStr) return '未设置';
      // 去除前后空格
      dateStr = dateStr.trim();
      // 如果包含年月日时分秒，只显示年月日
      if (dateStr.length > 10) {
        return dateStr.substring(0, 10);
      }
      return dateStr;
    },

    // 计算原订单金额
    calculateOriginalAmount() {
      if (!this.orderInfo) return '0.00';

      const baseServiceFee = parseFloat(this.orderInfo.base_service_fee || 0);
      const additionalServiceFee = parseFloat(this.orderInfo.additional_service_fee || 0);

      return (baseServiceFee + additionalServiceFee).toFixed(2);
    },

    // 格式化建议骑手上门时间
    formatRecommendedTime(startTime, endTime) {
      if (!startTime || !endTime) return '';

      // 如果时间是 00:00 - 00:00，显示为全天
      if (startTime === '00:00' && endTime === '00:00') {
        return '全天';
      }

      return `${startTime} - ${endTime}`;
    },

    // 计算骑手佣金
    calculateRiderCommission() {
      if (!this.orderInfo || !this.orderInfo.service_member || !this.orderInfo.service_member.rate) {
        return '0.00';
      }

      const orderAmount = parseFloat(this.orderInfo.order_amount || 0);
      const rate = parseFloat(this.orderInfo.service_member.rate || 0);

      // 计算佣金 = 支付金额 * 骑手佣金比例
      const commission = orderAmount * rate;

      return commission.toFixed(2);
    },

    // 显示退款弹窗
    showRefundModal() {
      this.refundAmount = this.orderInfo.order_amount || '';
      this.refundReason = '';
      this.showRefund = true;
    },

    // 关闭退款弹窗
    closeRefundModal() {
      this.showRefund = false;
    },

    // 显示时间轴弹窗
    showTimelineModal() {
      this.showTimeline = true;
    },

    // 关闭时间轴弹窗
    closeTimelineModal() {
      this.showTimeline = false;
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

      try {
        const params = {
          task_id: this.taskId,
          service_member_id: this.riderUserInfo.id,
          refund_amount: this.refundAmount,
          sign: "chongchong"
        };

        const res = await this.$request('service/task/cancel', params, 'POST');

        if (res.code === 200) {
          uni.showToast({
            title: '退款成功',
            icon: 'success'
          });
          this.closeRefundModal();
          this.getOrderDetail();
        } else {
          uni.showToast({
            title: res.msg || '退款失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('退款失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    },

    // 显示取消订单弹窗
    showCancelModal() {
      this.cancelReason = '';
      this.showCancel = true;
    },

    // 关闭取消订单弹窗
    closeCancelModal() {
      this.showCancel = false;
    },

    // 确认取消订单
    async confirmCancel() {
      try {
        const params = {
          task_id: this.taskId,
          user_id: this.riderUserInfo.id,
          sign: "chongchong"
        };

        const res = await this.$request('service/task/cancel', params, 'POST');

        if (res.code === 200) {
          uni.showToast({
            title: '取消订单成功',
            icon: 'success'
          });
          this.closeCancelModal();
          this.getOrderDetail();
        } else {
          uni.showToast({
            title: res.msg || '取消订单失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('取消订单失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    },

    // 格式化取消时间
    formatCancelTime() {
      if (!this.orderInfo || !this.orderInfo.refunded_at) {
        return '订单已取消';
      }

      try {
        const cancelDate = new Date(this.orderInfo.refunded_at);
        const year = cancelDate.getFullYear();
        const month = String(cancelDate.getMonth() + 1).padStart(2, '0');
        const day = String(cancelDate.getDate()).padStart(2, '0');
        const hours = String(cancelDate.getHours()).padStart(2, '0');
        const minutes = String(cancelDate.getMinutes()).padStart(2, '0');
        const seconds = String(cancelDate.getSeconds()).padStart(2, '0');

        return `订单取消时间：${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } catch (e) {
        console.error('格式化取消时间出错:', e);
        return '订单已取消';
      }
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '未设置';
      try {
        let date;

        // 如果是时间戳，转换为日期
        if (typeof dateTime === 'number') {
          date = new Date(dateTime * 1000);
        } else {
          // 如果是日期字符串，转换为日期对象
          date = new Date(dateTime);
        }

        // 检查日期是否有效
        if (isNaN(date.getTime())) {
          return dateTime; // 如果无法解析，直接返回原字符串
        }

        // 手动格式化日期时间，确保在所有设备上显示一致
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } catch (err) {
        console.error('格式化日期时间失败:', err);
        return dateTime;
      }
    },

    // 获取时间轴数据
    getTimelineData() {
      if (!this.orderInfo) {
        return {
          assigned_at: null,
          finished_at: null,
          abandoned_at: null,
          canceled_at: null,
          refunded_at: null,
          started_at: null,
          timeout_notification: false
        };
      }

      // 如果有timeline对象，使用timeline数据
      if (this.orderInfo.timeline) {
        const timeline = this.orderInfo.timeline;
        const result = {
          assigned_at: null,
          finished_at: timeline.finished_at,
          abandoned_at: null,
          canceled_at: null,
          refunded_at: null,
          started_at: null,
          timeout_notification: timeline.timeout_notification || false
        };

        // 从assignments数组中获取分配信息
        if (timeline.assignments && timeline.assignments.length > 0) {
          const assignment = timeline.assignments[0]; // 取第一个分配记录
          result.assigned_at = assignment.assigned_at;
          result.abandoned_at = assignment.abandoned_at;
          result.finished_at = assignment.finished_at || result.finished_at;
        }

        return result;
      }

      // 兼容原有数据结构
      return {
        assigned_at: this.orderInfo.assigned_at || (this.orderInfo.task_assignment && this.orderInfo.task_assignment.assigned_at) || this.orderInfo.accepted_at,
        finished_at: (this.orderInfo.task_assignment && this.orderInfo.task_assignment.finished_at) || this.orderInfo.finished_at,
        abandoned_at: (this.orderInfo.task_assignment && this.orderInfo.task_assignment.abandoned_at) || null,
        canceled_at: this.orderInfo.canceled_at || null,
        refunded_at: this.orderInfo.refunded_at || null,
        started_at: (this.orderInfo.task_assignment && this.orderInfo.task_assignment.started_at) || null,
        timeout_notification: this.orderInfo.timeout_notification || false
      };
    },

    // 获取按时间排序的时间轴事件
    getSortedTimelineEvents() {
      if (!this.orderInfo) return [];

      const timelineData = this.getTimelineData();
      const events = [];

      // 1. 客户下单
      if (this.orderInfo.task_date) {
        let orderDetail = '订单已创建，等待骑手接单';

        // 添加客户信息
        // if (this.orderInfo.name && this.orderInfo.phone_number) {
        //   orderDetail = `客户${this.orderInfo.name} (${this.orderInfo.phone_number})下单`;
        // }

        // // 添加服务类型信息
        // if (this.orderInfo.task_name) {
        //   orderDetail += `\n服务类型：${this.orderInfo.task_name}`;
        // }

        // // 添加订单金额
        // if (this.orderInfo.order_amount) {
        //   orderDetail += `\n订单金额：¥${this.orderInfo.order_amount}`;
        // }

        // // 添加服务地址
        // if (this.orderInfo.task_detail && this.orderInfo.task_detail.store_name) {
        //   orderDetail += `\n门店：${this.orderInfo.task_detail.store_name}`;
        // }

        events.push({
          time: this.orderInfo.task_date,
          title: '客户下单',
          detail: orderDetail,
          dotClass: 'active',
          iconClass: 'timeline-check',
          icon: '✓'
        });
      }

      // 2. 骑手接单
      if (timelineData.assigned_at) {
        let riderDetail = '';

        // 优先使用 riderDetail 中的详细信息
        const riderInfo = this.orderInfo.riderDetail || this.orderInfo.service_member;

        if (riderInfo) {
          riderDetail = `骑手：${riderInfo.contact_person || riderInfo.real_name || '未知'}`;

          // 添加电话信息
          if (riderInfo.phone_number) {
            riderDetail += ` (${riderInfo.phone_number})`;
          }

          // 添加等级信息
          if (riderInfo.level) {
            riderDetail += ` [L${riderInfo.level}]`;
          }

          // 添加完成任务数量
          if (riderInfo.total_completed_tasks_count !== undefined) {
            riderDetail += ` 已完成${riderInfo.total_completed_tasks_count}单`;
          }
        }

        events.push({
          time: timelineData.assigned_at,
          title: '骑手接单',
          detail: riderDetail,
          dotClass: 'active',
          iconClass: 'timeline-check',
          icon: '✓'
        });
      } else if (this.orderInfo.status !== 'waiting') {
        events.push({
          time: null,
          title: '骑手接单',
          detail: '',
          dotClass: '',
          iconClass: '',
          icon: '',
          pendingText: '待接单'
        });
      }

      // 3. 任务开始
      if (timelineData.started_at) {
        const riderInfo = this.orderInfo.riderDetail || this.orderInfo.service_member;
        let startDetail = '骑手已开始执行任务';

        if (riderInfo && riderInfo.contact_person) {
          startDetail = `${riderInfo.contact_person}已开始执行任务`;
        }

        events.push({
          time: timelineData.started_at,
          title: '任务开始',
          detail: startDetail,
          dotClass: 'active',
          iconClass: 'timeline-check',
          icon: '✓'
        });
      }

      // 4. 骑手放弃订单
      if (timelineData.abandoned_at) {
        const riderInfo = this.orderInfo.riderDetail || this.orderInfo.service_member;
        let abandonDetail = '骑手已放弃此订单，订单重新进入待接单状态';

        if (riderInfo && riderInfo.contact_person) {
          abandonDetail = `${riderInfo.contact_person}已放弃此订单，订单重新进入待接单状态`;
        }

        events.push({
          time: timelineData.abandoned_at,
          title: '骑手放弃订单',
          detail: abandonDetail,
          dotClass: 'abandon-dot',
          iconClass: 'timeline-abandon',
          icon: '!'
        });
      }

      // 5. 任务完成反馈
      if (timelineData.finished_at) {
        const riderInfo = this.orderInfo.riderDetail || this.orderInfo.service_member;
        let finishDetail = '骑手已提交完成反馈，等待客户确认';

        // if (riderInfo && riderInfo.contact_person) {
        //   finishDetail = `${riderInfo.contact_person}已提交完成反馈，等待客户确认`;
        // }

        // // 如果有反馈内容，添加到详情中
        // if (this.orderInfo.task_assignment && this.orderInfo.task_assignment.after_detail) {
        //   finishDetail += `\n反馈内容：${this.orderInfo.task_assignment.after_detail}`;
        // }

        events.push({
          time: timelineData.finished_at,
          title: '任务完成反馈',
          detail: finishDetail,
          dotClass: 'active',
          iconClass: 'timeline-check',
          icon: '✓'
        });
      } else if (this.orderInfo.status === 'completed' || this.orderInfo.status === 'finished') {
        events.push({
          time: null,
          title: '任务完成反馈',
          detail: '',
          dotClass: '',
          iconClass: '',
          icon: '',
          pendingText: '待完成'
        });
      }

      // 6. 客户确认完成
      if (this.orderInfo.completed_at) {
        events.push({
          time: this.orderInfo.completed_at,
          title: '客户确认完成',
          detail: '客户已确认任务完成',
          dotClass: 'active',
          iconClass: 'timeline-check',
          icon: '✓'
        });
      } else if (this.orderInfo.status === 'finished') {
        events.push({
          time: null,
          title: '客户确认完成',
          detail: '',
          dotClass: '',
          iconClass: '',
          icon: '',
          pendingText: '待确认'
        });
      }

      // 7. 用户评价
      if (this.orderInfo.review && this.orderInfo.review.created_at) {
        let reviewDetail = '';
        if (this.orderInfo.review.rating) {
          reviewDetail = `评分：${this.orderInfo.review.rating}分`;
          if (this.orderInfo.review.comment) {
            reviewDetail += `，${this.orderInfo.review.comment}`;
          }
        }
        events.push({
          time: this.orderInfo.review.created_at,
          title: '用户评价',
          detail: reviewDetail,
          dotClass: 'active',
          iconClass: 'timeline-check',
          icon: '✓'
        });
      }

      // 8. 订单取消
      if ((this.orderInfo.status === 'canceled' || this.orderInfo.status === 'cancel') && timelineData.canceled_at) {
        events.push({
          time: timelineData.canceled_at,
          title: '订单取消',
          detail: '订单已被取消',
          dotClass: 'cancel-dot',
          iconClass: 'timeline-cancel',
          icon: '×'
        });
      }

      // 9. 退款处理
      if (this.orderInfo.payment_status === 'refunded' || timelineData.refunded_at) {
        const refundTime = timelineData.refunded_at || this.orderInfo.refunded_at || this.orderInfo.updated_at;

        let refundDetail = `退款金额：¥${this.orderInfo.order_amount || '0.00'}`;

        // 添加退款状态
        if (this.orderInfo.payment_status === 'refunded') {
          refundDetail += ' (已退款)';
        } else {
          refundDetail += ' (退款处理中)';
        }

        // 添加原订单金额对比
        const originalAmount = this.calculateOriginalAmount();
        if (originalAmount && originalAmount !== this.orderInfo.order_amount) {
          refundDetail += `\n原订单金额：¥${originalAmount}`;
        }

        // 添加退款方式信息
        if (this.orderInfo.transaction_id) {
          refundDetail += `\n交易号：${this.orderInfo.transaction_id}`;
        }

        events.push({
          time: refundTime,
          title: '退款处理',
          detail: refundDetail,
          dotClass: 'refund-dot',
          iconClass: 'timeline-refund',
          icon: '¥'
        });
      }

      // 10. 超时提醒
      if (timelineData.timeout_notification) {
        let timeoutDetail = '订单已超过预期完成时间';

        // 添加时效信息
        if (this.orderInfo.time_limit) {
          timeoutDetail += `\n原定时效：${this.orderInfo.time_limit}小时`;
        }

        // 添加截止时间
        if (this.orderInfo.deadline) {
          timeoutDetail += `\n截止时间：${this.orderInfo.deadline}`;
        }

        events.push({
          time: this.orderInfo.updated_at,
          title: '超时提醒',
          detail: timeoutDetail,
          dotClass: 'timeout-dot',
          iconClass: 'timeline-timeout',
          icon: '⚠'
        });
      }

      // 按时间排序，将没有时间的事件放到最后
      return events.sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return new Date(a.time) - new Date(b.time);
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.order-detail {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 40rpx;
}

.loading-container {
  padding: 100rpx 0;
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
  font-size: 28rpx;
  color: #999;
}

.detail-content {
  padding: 0 30rpx;
}

.status-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;

  .status-left {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .timeline-btn {
    padding: 8rpx 16rpx;
    background: linear-gradient(135deg, #2492F2 0%, #1976D2 100%);
    border-radius: 16rpx;
    cursor: pointer;
    display: flex;
    align-items: center;

    .timeline-icon {
      font-size: 20rpx;
      margin-right: 6rpx;
    }

    .timeline-text {
      font-size: 20rpx;
      color: #fff;
      font-weight: 500;
    }

    &:active {
      opacity: 0.8;
    }
  }
}

.status-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &.waiting {
    background-color: #e6f7ff;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      width: 40rpx;
      height: 40rpx;
      border: 4rpx solid #1890ff;
      border-radius: 8rpx;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &::after {
      content: '?';
      position: absolute;
      font-size: 32rpx;
      font-weight: bold;
      color: #1890ff;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  &.assigned {
    background-color: #fff7e6;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      width: 40rpx;
      height: 40rpx;
      border: 4rpx solid #fa8c16;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &::after {
      content: '';
      position: absolute;
      width: 16rpx;
      height: 16rpx;
      background-color: #fa8c16;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  &.completed {
    background-color: #e6f7ff;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      width: 40rpx;
      height: 40rpx;
      border: 4rpx solid #1890ff;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &::after {
      content: '';
      position: absolute;
      width: 20rpx;
      height: 10rpx;
      border-bottom: 4rpx solid #1890ff;
      border-left: 4rpx solid #1890ff;
      top: 50%;
      left: 50%;
      transform: translate(-40%, -30%) rotate(-45deg);
    }
  }

  &.finished {
    background-color: #f6ffed;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      width: 24rpx;
      height: 12rpx;
      border-bottom: 4rpx solid #52c41a;
      border-left: 4rpx solid #52c41a;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -60%) rotate(-45deg);
    }

    &::after {
      content: '';
      position: absolute;
      width: 40rpx;
      height: 40rpx;
      border: 4rpx solid #52c41a;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  &.cancel, &.canceled {
    background-color: #f5f5f5;
    position: relative;

    &::before, &::after {
      content: '';
      position: absolute;
      width: 40rpx;
      height: 4rpx;
      background-color: #999;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &::before {
      transform: translate(-50%, -50%) rotate(45deg);
    }

    &::after {
      transform: translate(-50%, -50%) rotate(-45deg);
    }
  }

  &.refunded {
    background-color: #fff1f0;
    position: relative;

    &::before {
      content: '¥';
      position: absolute;
      font-size: 40rpx;
      color: #ff4d4f;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-weight: bold;
    }
  }
}

.status-info {
  flex: 1;
}

.status-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.status-desc {
  font-size: 26rpx;
  color: #999;
}

.info-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
  }

  .tag {
    display: inline-block;
    background-color: #e0e0e0;
    color: #333;
    font-size: 22rpx;
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
  }
}

.card-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 20rpx;
  position: relative;
  padding-left: 20rpx;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6rpx;
    height: 30rpx;
    background-color: #2492F2;
    border-radius: 3rpx;
  }
}

.info-item {
  display: flex;
  margin-bottom: 20rpx;
  font-size: 28rpx;
  line-height: 1.5;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  color: #999;
  width: 160rpx;
  flex-shrink: 0;
}

.info-value {
  color: #333;
  flex: 1;

  &.price {
    color: #ff4d4f;
    font-weight: 500;
  }
}

.info-value-wrap {
  flex: 1;
  display: flex;
  align-items: center;
}

.copy-btn, .call-btn, .nav-btn {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  margin-left: 20rpx;
}

.copy-btn {
  background-color: #f5f5f5;
  color: #666;
}

.call-btn {
  background-color: #e6f7ff;
  color: #1890ff;
}

.nav-btn {
  background-color: #f6ffed;
  color: #52c41a;
}

// 下单人信息样式
.order-user-info {
  align-items: center; // 确保标题和内容垂直居中对齐

  .info-label {
    width: 100rpx; // 缩小下单人标题宽度
  }

  .order-user-value {
    display: flex;
    align-items: center;
    justify-content: center; // 水平居中
    gap: 16rpx;
    flex-wrap: nowrap; // 改为不换行，保持一行显示

    .phone-number {
      color: #666;
      font-size: 26rpx;
    }

    .action-buttons {
      display: flex;
      gap: 12rpx;
      flex-shrink: 0; // 防止按钮被压缩
    }
  }
}

.ticket-details {
  margin-top: 16rpx;
  padding: 16rpx;
  background-color: #f8f9fa;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.ticket-detail-item {
  display: flex;
  margin-bottom: 8rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.ticket-detail-label {
  color: #666;
  width: 140rpx;
}

.ticket-detail-value {
  flex: 1;
  color: #333;
}

.ticket-toggle {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #2492F2;
  text-align: right;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  margin: 10rpx 0;
}

.image-item {
  width: 160rpx;
  height: 160rpx;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 8rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

  image {
    width: 100%;
    height: 100%;
  }
}

.sn-mac-item {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .copy-btn {
    margin-left: 16rpx;
    font-size: 22rpx;
    padding: 2rpx 10rpx;
    background-color: #f5f5f5;
    color: #666;
    border-radius: 16rpx;
  }
}

.quantity-text {
  color: #2492F2;
  font-weight: 500;
  margin-left: 4rpx;
}

.brand-text {
  // color: #52c41a;
  font-weight: 500;
  margin-right: 8rpx;
  font-size: 26rpx;
}

.original-price {
  text-decoration: line-through;
  color: #999;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10rpx;
}

.image-item {
  width: 33.33%;
  padding: 10rpx;
  box-sizing: border-box;

  image {
    width: 100%;
    height: 200rpx;
    border-radius: 8rpx;
  }
}

// 用户确认样式
.confirm-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .confirm-content {
    .confirm-info {
      .remark {
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
        margin-bottom: 12rpx;

        .label {
          font-weight: 500;
        }

        .content {
          margin-left: 10rpx;
        }
      }
    }

    .review-section {
      margin-top: 20rpx;

      .section-title {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 20rpx;
      }

      .review-content {
        .review-rating {
          display: flex;
          align-items: center;
          margin-bottom: 12rpx;

          .rating-label {
            font-size: 26rpx;
            color: #666;
            margin-right: 8rpx;
          }

          .stars {
            display: flex;
            margin-right: 8rpx;

            .star {
              font-size: 24rpx;
              color: #ddd;
              margin-right: 2rpx;

              &.active {
                color: #FFD700;
              }
            }
          }

          .rating-text {
            font-size: 24rpx;
            color: #666;
          }
        }

        .review-tags {
          margin-bottom: 12rpx;

          .tags-label {
            font-size: 26rpx;
            color: #666;
            margin-bottom: 8rpx;
            display: block;
          }

          .tags-list {
            display: flex;
            flex-wrap: wrap;
            margin: -4rpx;

            .tag-item {
              font-size: 22rpx;
              color: #2492F2;
              background-color: rgba(36, 146, 242, 0.1);
              padding: 4rpx 12rpx;
              border-radius: 12rpx;
              margin: 4rpx;
              border: 1rpx solid rgba(36, 146, 242, 0.2);
            }
          }
        }

        .review-comment {
          margin-bottom: 12rpx;

          .comment-label {
            font-size: 26rpx;
            color: #666;
            font-weight: 500;
            margin-bottom: 8rpx;
            display: block;
          }

          .comment-text {
            font-size: 26rpx;
            color: #333;
            line-height: 1.6;
            background-color: #f8f9fa;
            padding: 12rpx;
            border-radius: 8rpx;
            display: block;
          }
        }

        .review-time {
          .time-label {
            font-size: 24rpx;
            color: #999;
            margin-right: 8rpx;
          }

          .time-text {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }
  }
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  padding: 30rpx 0;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  margin: 0 20rpx;

  &.refund {
    background-color: #fff7e6;
    color: #fa8c16;
    border: 1rpx solid #fa8c16;
  }

  &.cancel {
    background-color: #fff1f0;
    color: #ff4d4f;
    border: 1rpx solid #ff4d4f;
  }
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  z-index: 1000;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  line-height: 1;
}

.modal-content {
  padding: 30rpx;
}

.modal-info {
  margin-bottom: 30rpx;
}

.info-row {
  display: flex;
  margin-bottom: 10rpx;
  font-size: 28rpx;
}

.input-group {
  margin-bottom: 30rpx;
}

.input-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.input-field {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.textarea-field {
  width: 100%;
  height: 200rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #f5f5f5;
}

.modal-btn {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  font-size: 30rpx;

  &.cancel {
    color: #999;
    border-right: 1rpx solid #f5f5f5;
  }

  &.confirm {
    color: #2492F2;
    font-weight: 500;
  }
}

// 时间轴弹窗样式

.timeline-modal {
  .modal-content {
    max-height: 70vh;
    overflow-y: auto;
  }
}

.timeline-container {
  padding: 20rpx 0;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 40rpx;
  position: relative;

  &:last-child {
    margin-bottom: 0;

    &::after {
      display: none;
    }
  }

  &::after {
    content: '';
    position: absolute;
    left: 15rpx;
    top: 40rpx;
    width: 2rpx;
    height: 40rpx;
    background-color: #e8e8e8;
  }
}

.timeline-dot {
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background-color: #e8e8e8;
  margin-right: 20rpx;
  flex-shrink: 0;
  margin-top: 5rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &.active {
    background-color: #52C41A;
  }

  .timeline-check {
    font-size: 18rpx;
    color: #fff;
    font-weight: bold;
    line-height: 1;
  }
}

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.timeline-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.timeline-time {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;

  &.pending {
    color: #999;
    font-style: italic;
  }
}

.timeline-detail {
  font-size: 22rpx;
  color: #999;
  line-height: 1.5;
  margin-top: 6rpx;
  white-space: pre-line; // 支持换行符显示
  word-break: break-all; // 防止长文本溢出
}

// 不同类型事件的特殊样式
.cancel-dot {
  background-color: #ff4d4f !important;

  .timeline-cancel {
    font-size: 16rpx;
    color: #fff;
    font-weight: bold;
    line-height: 1;
  }
}

.refund-dot {
  background-color: #fa8c16 !important;

  .timeline-refund {
    font-size: 14rpx;
    color: #fff;
    font-weight: bold;
    line-height: 1;
  }
}

.abandon-dot {
  background-color: #d9534f !important;

  .timeline-abandon {
    font-size: 16rpx;
    color: #fff;
    font-weight: bold;
    line-height: 1;
  }
}

.timeout-dot {
  background-color: #f0ad4e !important;

  .timeline-timeout {
    font-size: 14rpx;
    color: #fff;
    font-weight: bold;
    line-height: 1;
  }
}

.update-dot {
  background-color: #5bc0de !important;

  .timeline-update {
    font-size: 14rpx;
    color: #fff;
    font-weight: bold;
    line-height: 1;
  }
}
</style>
