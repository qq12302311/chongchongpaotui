<template>
  <view class="withdraw-detail-container">
    <!-- 顶部导航栏 -->
    <nav-bar title="提现详情" title-align="center" :showBackButton="true"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder" :style="{ height: navBarHeight + 'px' }"></view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 提现详情内容 -->
    <view v-else-if="withdrawInfo" class="detail-content">
      <!-- 状态卡片 -->
      <view class="status-card">
        <view class="status-info">
          <view class="status-icon" :class="withdrawInfo.status"></view>
          <view class="status-text">
            <text class="status-title">{{ getStatusText(withdrawInfo.status) }}</text>
            <text class="status-desc">{{ getStatusDesc(withdrawInfo.status) }}</text>
          </view>
        </view>
        <view class="amount-info">
          <text class="amount-label">提现金额</text>
          <text class="amount-value">¥{{ parseFloat(withdrawInfo.amount || 0).toFixed(2) }}</text>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="info-card">
        <view class="card-title">基本信息</view>
        <view class="info-item">
          <text class="info-label">申请人</text>
          <text class="info-value">{{ withdrawInfo.real_name || (withdrawInfo.applicant && withdrawInfo.applicant.contact_person) || '未知' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">申请人ID</text>
          <text class="info-value">{{ withdrawInfo.applicant_id || '未知' }}</text>
        </view>
        <view class="info-item" v-if="withdrawInfo.phone">
          <text class="info-label">联系电话</text>
          <text class="info-value">{{ withdrawInfo.phone }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">申请类型</text>
          <text class="info-value">{{ getOwnerTypeText(withdrawInfo.owner_type) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">提现方式</text>
          <text class="info-value">{{ getPaymentMethodText(withdrawInfo.payment_method) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">申请时间</text>
          <text class="info-value">{{ formatDateTime(withdrawInfo.created_at) }}</text>
        </view>
        <view class="info-item" v-if="withdrawInfo.processed_at">
          <text class="info-label">处理时间</text>
          <text class="info-value">{{ formatDateTime(withdrawInfo.processed_at) }}</text>
        </view>
      </view>

      <!-- 账户信息 -->
      <view class="info-card" v-if="withdrawInfo.account_info">
        <view class="card-title">收款账户</view>
        <view class="info-item" v-if="withdrawInfo.payment_method === 'alipay'">
          <text class="info-label">支付宝账号</text>
          <text class="info-value">{{ withdrawInfo.account_info.alipay_account || '未设置' }}</text>
        </view>
        <view class="info-item" v-if="withdrawInfo.payment_method === 'alipay'">
          <text class="info-label">真实姓名</text>
          <text class="info-value">{{ withdrawInfo.account_info.alipay_name || '未设置' }}</text>
        </view>
        <view class="info-item" v-if="withdrawInfo.payment_method === 'bank'">
          <text class="info-label">银行名称</text>
          <text class="info-value">{{ withdrawInfo.account_info.bank_name || '未设置' }}</text>
        </view>
        <view class="info-item" v-if="withdrawInfo.payment_method === 'bank'">
          <text class="info-label">银行卡号</text>
          <text class="info-value">{{ withdrawInfo.account_info.bank_account || '未设置' }}</text>
        </view>
        <view class="info-item" v-if="withdrawInfo.payment_method === 'bank'">
          <text class="info-label">开户姓名</text>
          <text class="info-value">{{ withdrawInfo.account_info.bank_holder || '未设置' }}</text>
        </view>
      </view>

      <!-- 处理记录 -->
      <view class="info-card" v-if="withdrawInfo.remark || withdrawInfo.rejected_reason">
        <view class="card-title">处理记录</view>
        <view class="info-item" v-if="withdrawInfo.remark">
          <text class="info-label">处理备注</text>
          <text class="info-value">{{ withdrawInfo.remark }}</text>
        </view>
        <view class="info-item" v-if="withdrawInfo.rejected_reason">
          <text class="info-label">拒绝原因</text>
          <text class="info-value reject-reason">{{ withdrawInfo.rejected_reason }}</text>
        </view>
        <view class="info-item" v-if="withdrawInfo.transaction_no">
          <text class="info-label">交易单号</text>
          <text class="info-value">{{ withdrawInfo.transaction_no }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons" v-if="withdrawInfo.status === 'pending'">
        <view class="action-btn reject" @click="showRejectModal">拒绝</view>
        <view class="action-btn approve" @click="approveWithdraw">通过</view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <view class="empty-icon"></view>
      <text class="empty-text">提现记录不存在</text>
    </view>

    <!-- 拒绝弹窗 -->
    <view class="modal-mask" v-if="showReject" @click="closeRejectModal"></view>
    <view class="modal-container" v-if="showReject">
      <view class="modal-header">
        <text class="modal-title">拒绝提现</text>
        <view class="modal-close" @click="closeRejectModal">×</view>
      </view>
      <view class="modal-content">
        <view class="input-group">
          <text class="input-label">拒绝原因</text>
          <textarea
            v-model="rejectReason"
            placeholder="请输入拒绝原因"
            class="textarea-field"
          ></textarea>
        </view>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="closeRejectModal">取消</view>
        <view class="modal-btn confirm" :class="{disabled: processing}" @click="!processing && confirmReject()">
          <text v-if="processing">处理中...</text>
          <text v-else>确认拒绝</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import md5 from 'md5'

export default {
  data() {
    return {
      navBarHeight: 0,
      withdrawId: '',
      withdrawInfo: null,
      loading: false,
      showReject: false,
      rejectReason: '',
      processing: false,
      riderUserInfo: null
    }
  },
  onLoad(options) {
    this.withdrawId = options.id || '';
  },
  onShow() {
    // 计算导航栏高度
    const systemInfo = uni.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 0;
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48;
    this.navBarHeight = statusBarHeight + navBarHeight;

    // 获取用户信息
    this.riderUserInfo = uni.getStorageSync('riderUserInfo');

    // 加载提现详情
    if (this.withdrawId) {
      this.getWithdrawDetail();
    }
  },
  methods: {
    // 获取提现详情
    async getWithdrawDetail() {
      this.loading = true;
      
      try {
        if (!this.riderUserInfo || !this.riderUserInfo.id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const params = {
          withdraw_id: this.withdrawId,
          service_member_id: this.riderUserInfo.id,
          sign: "chongchong",
          timestamp: timestamp
        };

        const res = await this.$request('withdraw/detail', params, 'POST');

        if (res.code === 200) {
          this.withdrawInfo = res.data;
        } else {
          uni.showToast({
            title: res.msg || '获取提现详情失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('获取提现详情失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 通过提现
    async approveWithdraw() {
      uni.showModal({
        title: '确认操作',
        content: '确定要通过这笔提现申请吗？',
        success: async (res) => {
          if (res.confirm) {
            await this.processWithdraw('approve');
          }
        }
      });
    },

    // 显示拒绝弹窗
    showRejectModal() {
      this.showReject = true;
      this.rejectReason = '';
    },

    // 关闭拒绝弹窗
    closeRejectModal() {
      this.showReject = false;
      this.rejectReason = '';
    },

    // 确认拒绝
    async confirmReject() {
      if (!this.rejectReason.trim()) {
        uni.showToast({
          title: '请输入拒绝原因',
          icon: 'none'
        });
        return;
      }

      await this.processWithdraw('reject', this.rejectReason);
      this.closeRejectModal();
    },

    // 处理提现申请
    async processWithdraw(action, reason = '') {
      this.processing = true;
      
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const params = {
          withdraw_id: this.withdrawId,
          action: action, // 'approve' 或 'reject'
          service_member_id: this.riderUserInfo.id,
          sign: "chongchong",
          timestamp: timestamp
        };

        if (reason) {
          params.rejected_reason = reason;
        }

        const res = await this.$request('withdraw/process', params, 'POST');

        if (res.code === 200) {
          uni.showToast({
            title: action === 'approve' ? '提现申请已通过' : '提现申请已拒绝',
            icon: 'success'
          });
          
          // 重新加载详情
          this.getWithdrawDetail();
        } else {
          uni.showToast({
            title: res.msg || '操作失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('处理提现申请失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.processing = false;
      }
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'pending': '待审核',
        'processing': '处理中',
        'completed': '已完成',
        'approved': '已通过',
        'rejected': '已拒绝'
      };
      return statusMap[status] || '未知状态';
    },

    // 获取状态描述
    getStatusDesc(status) {
      const descMap = {
        'pending': '等待管理员审核',
        'processing': '正在处理中',
        'completed': '提现已完成',
        'approved': '提现申请已通过',
        'rejected': '提现申请被拒绝'
      };
      return descMap[status] || '';
    },

    // 获取支付方式文本
    getPaymentMethodText(method) {
      const methodMap = {
        'alipay': '支付宝',
        'bank': '银行卡',
        'wechat': '微信'
      };
      return methodMap[method] || '未知方式';
    },

    // 获取申请类型文本
    getOwnerTypeText(ownerType) {
      if (ownerType === 'App\\Models\\ServiceMember') {
        return '骑手';
      } else if (ownerType === 'App\\Models\\ServiceProvider') {
        return '服务商';
      }
      return '未知类型';
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '未设置';
      try {
        if (typeof dateTime === 'number') {
          return new Date(dateTime * 1000).toLocaleString('zh-CN');
        }
        // 将 "2026-03-20 12:30:55" 转为 "2026-03-20T12:30:55+08:00"
        // 避免 iOS/Safari 将无时区字符串误解析为 UTC 导致多8小时
        const normalized = typeof dateTime === 'string'
          ? dateTime.replace(' ', 'T') + '+08:00'
          : dateTime;
        const date = new Date(normalized);
        if (isNaN(date.getTime())) {
          return dateTime;
        }
        return date.toLocaleString('zh-CN');
      } catch (err) {
        console.error('格式化日期时间失败:', err);
        return dateTime;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.withdraw-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-placeholder {
  background-color: #fff;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  
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
    font-size: 26rpx;
    color: #999;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.detail-content {
  padding: 20rpx;
}

// 状态卡片
.status-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  .status-info {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .status-icon {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      
      &::before {
        content: '';
        width: 30rpx;
        height: 30rpx;
        border-radius: 50%;
      }
      
      &.pending {
        background-color: rgba(255, 193, 7, 0.1);
        &::before { background-color: #ffc107; }
      }

      &.processing {
        background-color: rgba(36, 146, 242, 0.1);
        &::before { background-color: #2492F2; }
      }

      &.completed {
        background-color: rgba(40, 167, 69, 0.1);
        &::before {
          content: '✓';
          background: none;
          color: #28a745;
          font-size: 30rpx;
          font-weight: bold;
        }
      }

      &.approved {
        background-color: rgba(40, 167, 69, 0.1);
        &::before {
          content: '✓';
          background: none;
          color: #28a745;
          font-size: 30rpx;
          font-weight: bold;
        }
      }

      &.rejected {
        background-color: rgba(220, 53, 69, 0.1);
        &::before {
          content: '✕';
          background: none;
          color: #dc3545;
          font-size: 30rpx;
          font-weight: bold;
        }
      }
    }
    
    .status-text {
      flex: 1;
      
      .status-title {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
        display: block;
        margin-bottom: 6rpx;
      }
      
      .status-desc {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .amount-info {
    text-align: center;
    padding: 20rpx 0;
    border-top: 1rpx solid #f0f0f0;
    
    .amount-label {
      font-size: 24rpx;
      color: #999;
      display: block;
      margin-bottom: 8rpx;
    }
    
    .amount-value {
      font-size: 48rpx;
      color: #2492F2;
      font-weight: bold;
    }
  }
}

// 信息卡片
.info-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .card-title {
    font-size: 32rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 24rpx;
    padding-bottom: 12rpx;
    border-bottom: 1rpx solid #f0f0f0;
  }

  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      font-size: 28rpx;
      color: #666;
      margin-right: 20rpx;
      min-width: 140rpx;
    }

    .info-value {
      font-size: 28rpx;
      color: #333;
      flex: 1;
      word-break: break-all;

      &.reject-reason {
        color: #dc3545;
      }
    }
  }
}

// 操作按钮
.action-buttons {
  display: flex;
  justify-content: space-between;
  padding: 30rpx 0;
  margin-top: 40rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  margin: 0 20rpx;
  transition: all 0.3s ease;

  &.reject {
    background-color: #fff;
    color: #dc3545;
    border: 1rpx solid #dc3545;

    &:active {
      background-color: #dc3545;
      color: #fff;
    }
  }

  &.approve {
    background-color: #2492F2;
    color: #fff;
    border: 1rpx solid #2492F2;

    &:active {
      background-color: #1976d2;
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-icon {
    width: 120rpx;
    height: 120rpx;
    background-color: #f0f0f0;
    border-radius: 50%;
    margin-bottom: 30rpx;
    position: relative;

    &::before {
      content: '💰';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 60rpx;
    }
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
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
}

.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  background-color: #fff;
  border-radius: 12rpx;
  z-index: 1000;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .modal-title {
      font-size: 32rpx;
      color: #333;
      font-weight: 500;
    }

    .modal-close {
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36rpx;
      color: #999;
    }
  }

  .modal-content {
    padding: 30rpx;

    .input-group {
      margin-bottom: 20rpx;

      .input-label {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 12rpx;
        display: block;
      }

      .textarea-field {
        width: 100%;
        min-height: 120rpx;
        padding: 20rpx;
        border: 1rpx solid #e0e0e0;
        border-radius: 8rpx;
        font-size: 28rpx;
        color: #333;
        background-color: #fff;
        box-sizing: border-box;
        resize: none;
      }
    }
  }

  .modal-footer {
    display: flex;
    border-top: 1rpx solid #f0f0f0;

    .modal-btn {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      font-size: 28rpx;

      &.cancel {
        color: #666;
        border-right: 1rpx solid #f0f0f0;
      }

      &.confirm {
        color: #2492F2;
        font-weight: 500;

        &.disabled {
          color: #ccc;
        }
      }
    }
  }
}
</style>
</style>
