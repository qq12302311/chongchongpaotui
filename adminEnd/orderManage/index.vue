<template>
  <view class="order-manage">
    <!-- 顶部导航栏 -->
    <nav-bar title="订单管理" title-align="center"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder" :style="{ height: navBarHeight + 'px' }"></view>

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
        <view 
          class="filter-item" 
          :class="{ active: currentStatus === status.value }"
          v-for="status in statusOptions" 
          :key="status.value"
          @click="switchStatus(status.value)"
        >
          {{ status.label }}
        </view>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view 
      class="order-list" 
      scroll-y 
      @scrolltolower="loadMoreOrders"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="refreshOrders"
    >
      <!-- 加载中提示 -->
      <view v-if="loading && !refreshing" class="loading-container">
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
            <view class="order-number">订单号：{{ order.task_no }}</view>
            <view class="order-status" :class="order.status">{{ getStatusText(order.status) }}</view>
          </view>
          <view class="order-info">
            <view class="info-row">
              <text class="info-label">服务类型：</text>
              <text class="info-value">{{ order.task_name }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">下单时间：</text>
              <text class="info-value">{{ order.task_date }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">用户信息：</text>
              <text class="info-value">{{ order.name }} {{ order.phone_number }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">订单金额：</text>
              <text class="info-value price">¥{{ parseFloat(order.order_amount).toFixed(2) }}</text>
            </view>
          </view>
          <view class="order-actions">
            <view class="action-btn refund" @click.stop="showRefundModal(order)">退款</view>
            <view class="action-btn cancel" @click.stop="showCancelModal(order)">取消订单</view>
          </view>
        </view>
      </view>
      
      <!-- 加载更多提示 -->
      <view v-if="orderList.length > 0 && hasMore" class="load-more">
        <text>加载更多...</text>
      </view>
      <view v-else-if="orderList.length > 0 && !hasMore" class="no-more">
        <text>没有更多数据了</text>
      </view>
    </scroll-view>

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
            <text class="info-value">{{ currentOrder.task_no }}</text>
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
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import md5 from 'js-md5'

export default {
  components: {
    NavBar
  },
  data() {
    return {
      navBarHeight: 0,
      searchKeyword: '',
      currentStatus: ['waiting', 'finished'],
      statusOptions: [
        { label: '全部', value: 'all' },
        { label: '待接单', value: 'waiting' },
        { label: '进行中', value: 'assigned' },
        { label: '已完成', value: 'finished' },
        { label: '已取消', value: 'cancel' }
      ],
      orderList: [],
      loading: false,
      refreshing: false,
      page: 1,
      pageSize: 10,
      hasMore: true,
      showRefund: false,
      showCancel: false,
      currentOrder: {},
      refundAmount: '',
      refundReason: '',
      cancelReason: '',
      riderUserInfo: null
    }
  },
  onLoad() {
    // 计算导航栏高度
    const systemInfo = uni.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 0;
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48;
    this.navBarHeight = statusBarHeight + navBarHeight;
    
    // 获取用户信息
    this.riderUserInfo = uni.getStorageSync('riderUserInfo');
    
    // 加载订单列表
    this.getOrderList();
  },
  methods: {
    // 切换订单状态
    switchStatus(status) {
      if (status === 'all') {
        this.currentStatus = ['waiting', 'assigned', 'finished', 'cancel'];
      } else {
        this.currentStatus = [status];
      }
      this.page = 1;
      this.orderList = [];
      this.hasMore = true;
      this.getOrderList();
    },
    
    // 搜索订单
    searchOrders() {
      this.page = 1;
      this.orderList = [];
      this.hasMore = true;
      this.getOrderList();
    },
    
    // 刷新订单列表
    refreshOrders() {
      this.refreshing = true;
      this.page = 1;
      this.orderList = [];
      this.hasMore = true;
      this.getOrderList().finally(() => {
        this.refreshing = false;
      });
    },
    
    // 加载更多订单
    loadMoreOrders() {
      if (this.hasMore && !this.loading) {
        this.page++;
        this.getOrderList();
      }
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
        const params = {
          service_member_id: this.riderUserInfo.id,
          status: this.currentStatus,
          sign: "chongchong",
          page: this.page,
          pageSize: this.pageSize,
          service_provider_id: '' 
        };
        
        // 添加搜索关键字
        if (this.searchKeyword) {
          params.keyword = this.searchKeyword;
        }
        
        // 发送请求
        const res = await this.$request('service/task/list', params, 'POST');
        
        if (res.code === 200 && res.data) {
          // 处理返回的数据
          const newOrders = res.data || [];
          
          // 追加新数据
          if (this.page === 1) {
            this.orderList = newOrders;
          } else {
            this.orderList = [...this.orderList, ...newOrders];
          }
          
          // 判断是否还有更多数据
          this.hasMore = newOrders.length === this.pageSize;
        } else {
          uni.showToast({
            title: res.msg || '获取订单列表失败',
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
    
    // 获取订单状态文本
    getStatusText(status) {
      const statusMap = {
        'waiting': '待接单',
        'assigned': '进行中',
        'finished': '已完成',
        'cancel': '已取消'
      };
      return statusMap[status] || status;
    },
    
    // 显示订单详情
    showOrderDetail(order) {
      uni.navigateTo({
        url: `/adminEnd/orderManage/detail?id=${order.task_id}`
      });
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
      
      try {
        const params = {
          task_id: this.currentOrder.task_id,
          service_member_id: this.riderUserInfo.id,
          refund_amount: this.refundAmount,
          refund_reason: this.refundReason,
          sign: "chongchong"
        };
        
        const res = await this.$request('service/task/refund', params, 'POST');
        
        if (res.code === 200) {
          uni.showToast({
            title: '退款成功',
            icon: 'success'
          });
          this.closeRefundModal();
          this.refreshOrders();
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
    showCancelModal(order) {
      this.currentOrder = order;
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
          task_id: this.currentOrder.task_id,
          service_member_id: this.riderUserInfo.id,
          cancel_reason: this.cancelReason,
          sign: "chongchong"
        };
        
        const res = await this.$request('service/task/cancel', params, 'POST');
        
        if (res.code === 200) {
          uni.showToast({
            title: '取消订单成功',
            icon: 'success'
          });
          this.closeCancelModal();
          this.refreshOrders();
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
    }
  }
}
</script>

<style lang="scss" scoped>
.order-manage {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.search-filter {
  padding: 20rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 20rpx;
  margin-bottom: 20rpx;
}

.search-icon-wrapper {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon {
  width: 30rpx;
  height: 30rpx;
  border: 2rpx solid #999;
  border-radius: 50%;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    width: 10rpx;
    height: 2rpx;
    background-color: #999;
    bottom: -6rpx;
    right: -6rpx;
    transform: rotate(45deg);
  }
}

.search-input {
  flex: 1;
  height: 70rpx;
  font-size: 28rpx;
  padding: 0 20rpx;
}

.search-btn {
  padding: 0 20rpx;
  height: 70rpx;
  line-height: 70rpx;
  color: #2492F2;
  font-size: 28rpx;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
}

.filter-item {
  padding: 10rpx 20rpx;
  font-size: 26rpx;
  color: #666;
  margin-right: 20rpx;
  margin-bottom: 10rpx;
  border-radius: 30rpx;
  background-color: #f5f5f5;
  
  &.active {
    background-color: #2492F2;
    color: #fff;
  }
}

.order-list {
  flex: 1;
  padding: 0 20rpx;
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
  font-size: 28rpx;
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
  width: 200rpx;
  height: 200rpx;
  background-color: #f5f5f5;
  border-radius: 50%;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
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
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.order-status {
  font-size: 26rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  
  &.waiting {
    background-color: #e6f7ff;
    color: #1890ff;
  }
  
  &.assigned {
    background-color: #fff7e6;
    color: #fa8c16;
  }
  
  &.finished {
    background-color: #f6ffed;
    color: #52c41a;
  }
  
  &.cancel {
    background-color: #f5f5f5;
    color: #999;
  }
}

.order-info {
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  margin-bottom: 10rpx;
  font-size: 26rpx;
}

.info-label {
  color: #999;
  width: 160rpx;
}

.info-value {
  color: #333;
  flex: 1;
  
  &.price {
    color: #ff4d4f;
    font-weight: 500;
  }
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.action-btn {
  padding: 10rpx 30rpx;
  font-size: 26rpx;
  border-radius: 30rpx;
  margin-left: 20rpx;
  
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

.load-more, .no-more {
  text-align: center;
  padding: 30rpx 0;
  font-size: 26rpx;
  color: #999;
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
</style>
