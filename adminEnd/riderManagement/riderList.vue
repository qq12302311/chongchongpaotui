<template>
  <view class="rider-list-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="骑手列表" title-align="center"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 搜索和筛选区域 -->
    <view class="search-filter">
      <view class="search-box">
        <view class="search-icon-wrapper">
          <view class="search-icon"></view>
        </view>
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="输入骑手姓名、手机号搜索"
          class="search-input"
          @confirm="searchRiders"
        />
        <view class="search-btn" @click="searchRiders">搜索</view>
      </view>
      <view class="filter-options">
        <view class="filter-section">
          <view class="filter-title">
            <view class="title-icon status-icon"></view>
            <text>骑手状态</text>
          </view>
          <view class="filter-items">
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
      </view>
    </view>

    <!-- 骑手列表 -->
    <scroll-view
      class="rider-list"
      scroll-y
      @scrolltolower="loadMoreRiders"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="refreshRiders"
    >
      <!-- 加载中提示 -->
      <view v-if="loading && !refreshing" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="riderList.length === 0" class="empty-state">
        <view class="empty-icon"></view>
        <text class="empty-text">暂无相关骑手</text>
      </view>

      <!-- 骑手列表内容 -->
      <view v-else class="rider-list-content">
        <view
          class="rider-item"
          v-for="(rider, index) in riderList"
          :key="index"
          @click="showRiderDetail(rider)"
        >
          <view class="rider-header">
            <view class="rider-avatar">
              <image :src="rider.avatar || 'https://ccpt.qiniu.cc111.cn/rider/verify/touxiang.png'" mode="aspectFill"></image>
            </view>
            <view class="rider-info">
              <view class="rider-name">{{ rider.name || '未设置姓名' }}</view>
              <view class="rider-id">ID: {{ rider.id }}</view>
              <view class="rider-phone">{{ rider.phone }}</view>
            </view>
            <view class="rider-status" :class="rider.status">
              {{ getStatusText(rider.status) }}
            </view>
          </view>
          <view class="rider-details">
            <view class="detail-item">
              <text class="detail-label">认证状态:</text>
              <text class="detail-value" :class="{
                'verify-none': rider.verified === 'none',
                'verify-pending': rider.verified === 'pending',
                'verify-approved': rider.verified === 'approved',
                'verify-rejected': rider.verified === 'rejected'
              }">{{ getVerifyText(rider.verified) }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">佣金比例:</text>
              <text class="detail-value">{{ rider.commission_rate || '0' }}%</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">账户余额:</text>
              <text class="detail-value">¥{{ rider.balance || '0.00' }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">服务区域:</text>
              <text class="detail-value">{{ rider.service_area || '未设置' }}</text>
            </view>
          </view>
          <view class="rider-actions">
            <view class="action-btn edit" @click.stop="showEditModal(rider)">编辑</view>
            <view class="action-btn verify" v-if="rider.verified === 'pending'" @click.stop="showVerifyModal(rider)">审核</view>
            <view class="action-btn" :class="rider.status === 'active' ? 'disable' : 'enable'" @click.stop="toggleRiderStatus(rider)">
              {{ rider.status === 'active' ? '禁用' : '启用' }}
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view v-if="riderList.length > 0 && hasMore" class="load-more">
        <text>加载更多...</text>
      </view>
      <view v-else-if="riderList.length > 0 && !hasMore" class="no-more">
        <text>没有更多数据了</text>
      </view>
    </scroll-view>

    <!-- 编辑骑手信息弹窗 -->
    <view class="modal-mask" v-if="showEdit" @click="closeEditModal"></view>
    <view class="modal-container" v-if="showEdit">
      <view class="modal-header">
        <text class="modal-title">编辑骑手信息</text>
        <view class="modal-close" @click="closeEditModal">×</view>
      </view>
      <view class="modal-content">
        <view class="input-group">
          <text class="input-label">姓名</text>
          <input type="text" v-model="editForm.name" placeholder="请输入姓名" class="input-field" />
        </view>
        <view class="input-group">
          <text class="input-label">手机号</text>
          <input type="text" v-model="editForm.phone" placeholder="请输入手机号" class="input-field" />
        </view>
        <view class="input-group">
          <text class="input-label">佣金比例(%)</text>
          <input type="digit" v-model="editForm.commission_rate" placeholder="请输入佣金比例" class="input-field" />
        </view>
        <view class="input-group">
          <text class="input-label">账户余额(¥)</text>
          <input type="digit" v-model="editForm.balance" placeholder="请输入账户余额" class="input-field" />
        </view>
        <view class="input-group">
          <text class="input-label">服务区域</text>
          <input type="text" v-model="editForm.service_area" placeholder="请输入服务区域" class="input-field" />
        </view>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="closeEditModal">取消</view>
        <view class="modal-btn confirm" @click="confirmEdit">确认</view>
      </view>
    </view>

    <!-- 审核认证弹窗 -->
    <view class="modal-mask" v-if="showVerify" @click="closeVerifyModal"></view>
    <view class="modal-container" v-if="showVerify">
      <view class="modal-header">
        <text class="modal-title">审核骑手认证</text>
        <view class="modal-close" @click="closeVerifyModal">×</view>
      </view>
      <view class="modal-content">
        <view class="verify-info">
          <view class="verify-item">
            <text class="verify-label">姓名:</text>
            <text class="verify-value">{{ currentRider.name }}</text>
          </view>
          <view class="verify-item">
            <text class="verify-label">身份证号:</text>
            <text class="verify-value">{{ currentRider.id_card || '未提供' }}</text>
          </view>
          <view class="verify-item">
            <text class="verify-label">手机号:</text>
            <text class="verify-value">{{ currentRider.phone }}</text>
          </view>
          <view class="verify-images">
            <view class="verify-image-item">
              <text class="image-label">身份证正面</text>
              <image :src="currentRider.id_card_front || 'https://ccpt.qiniu.cc111.cn/rider/verify/id-card-front.png'" mode="aspectFit" class="id-card-image"></image>
            </view>
            <view class="verify-image-item">
              <text class="image-label">身份证反面</text>
              <image :src="currentRider.id_card_back || 'https://ccpt.qiniu.cc111.cn/rider/verify/id-card-back.png'" mode="aspectFit" class="id-card-image"></image>
            </view>
          </view>
        </view>
      </view>
      <view class="modal-footer">
        <view class="modal-btn reject" @click="rejectVerify">拒绝</view>
        <view class="modal-btn approve" @click="approveVerify">通过</view>
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
      searchKeyword: '',
      currentStatus: 'all',
      statusOptions: [
        { label: '全部', value: 'all' },
        { label: '正常', value: 'active' },
        { label: '禁用', value: 'disabled' }
      ],
      riderList: [],
      loading: false,
      refreshing: false,
      page: 1,
      pageSize: 10,
      hasMore: true,
      showEdit: false,
      showVerify: false,
      currentRider: {},
      editForm: {
        id: '',
        name: '',
        phone: '',
        commission_rate: '',
        balance: '',
        service_area: ''
      },
      adminInfo: null
    }
  },
  onLoad() {
    // 获取管理员信息
    this.adminInfo = uni.getStorageSync('riderUserInfo');

    // 加载骑手列表
    this.getRiderList();
  },
  methods: {
    // 获取骑手列表
    async getRiderList() {
      if (this.loading) return;

      this.loading = true;
      try {
        // 检查管理员信息
        if (!this.adminInfo || !this.adminInfo.id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          this.loading = false;
          return;
        }

        // 构建请求参数
        const params = {
          service_member_id: this.adminInfo.id,
          sign: "chongchong",
          page: this.page,
          pageSize: this.pageSize
        };

        // 添加搜索关键字
        if (this.searchKeyword) {
          params.keyword = this.searchKeyword;
        }

        // 添加状态筛选
        if (this.currentStatus !== 'all') {
          params.status = this.currentStatus;
        }

        // 发送请求
        const res = await this.$request('service/member/list', params, 'POST');

        if (res.code === 200 && res.data) {
          // 处理返回的数据
          const newRiders = res.data || [];

          // 追加新数据
          if (this.page === 1) {
            this.riderList = newRiders;
          } else {
            this.riderList = [...this.riderList, ...newRiders];
          }

          // 判断是否还有更多数据
          this.hasMore = newRiders.length === this.pageSize;
        } else {
          uni.showToast({
            title: res.msg || '获取骑手列表失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('获取骑手列表失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 搜索骑手
    searchRiders() {
      this.page = 1;
      this.riderList = [];
      this.hasMore = true;
      this.getRiderList();
    },

    // 刷新骑手列表
    refreshRiders() {
      this.refreshing = true;
      this.page = 1;
      this.riderList = [];
      this.hasMore = true;
      this.getRiderList().finally(() => {
        this.refreshing = false;
      });
    },

    // 加载更多骑手
    loadMoreRiders() {
      if (this.hasMore && !this.loading) {
        this.page++;
        this.getRiderList();
      }
    },

    // 切换骑手状态筛选
    switchStatus(status) {
      this.currentStatus = status;
      this.page = 1;
      this.riderList = [];
      this.hasMore = true;
      this.getRiderList();
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'active': '正常',
        'disabled': '禁用'
      };
      return statusMap[status] || status;
    },

    // 获取认证状态文本
    getVerifyText(verified) {
      const verifyMap = {
        'none': '未认证',
        'pending': '审核中',
        'approved': '已认证',
        'rejected': '已拒绝'
      };
      return verifyMap[verified] || verified;
    },

    // 显示骑手详情
    showRiderDetail(rider) {
      // 可以在这里实现查看详情的逻辑
      console.log('查看骑手详情:', rider);
    },

    // 显示编辑弹窗
    showEditModal(rider) {
      this.currentRider = rider;
      this.editForm = {
        id: rider.id,
        name: rider.name || '',
        phone: rider.phone || '',
        commission_rate: rider.commission_rate || '',
        balance: rider.balance || '',
        service_area: rider.service_area || ''
      };
      this.showEdit = true;
    },

    // 关闭编辑弹窗
    closeEditModal() {
      this.showEdit = false;
    },

    // 确认编辑
    async confirmEdit() {
      try {
        // 构建请求参数
        const params = {
          service_member_id: this.adminInfo.id,
          rider_id: this.editForm.id,
          name: this.editForm.name,
          phone: this.editForm.phone,
          commission_rate: this.editForm.commission_rate,
          balance: this.editForm.balance,
          service_area: this.editForm.service_area,
          sign: "chongchong"
        };

        // 发送请求
        const res = await this.$request('service/member/update', params, 'POST');

        if (res.code === 200) {
          uni.showToast({
            title: '更新成功',
            icon: 'success'
          });
          this.closeEditModal();
          this.refreshRiders();
        } else {
          uni.showToast({
            title: res.msg || '更新失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('更新骑手信息失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    },

    // 显示审核弹窗
    showVerifyModal(rider) {
      this.currentRider = rider;
      this.showVerify = true;
    },

    // 关闭审核弹窗
    closeVerifyModal() {
      this.showVerify = false;
    },

    // 通过认证
    async approveVerify() {
      try {
        // 构建请求参数
        const params = {
          service_member_id: this.adminInfo.id,
          rider_id: this.currentRider.id,
          verify_status: 'approved',
          sign: "chongchong"
        };

        // 发送请求
        const res = await this.$request('service/member/verify/update', params, 'POST');

        if (res.code === 200) {
          uni.showToast({
            title: '审核通过',
            icon: 'success'
          });
          this.closeVerifyModal();
          this.refreshRiders();
        } else {
          uni.showToast({
            title: res.msg || '操作失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('审核操作失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    },

    // 拒绝认证
    async rejectVerify() {
      try {
        // 构建请求参数
        const params = {
          service_member_id: this.adminInfo.id,
          rider_id: this.currentRider.id,
          verify_status: 'rejected',
          sign: "chongchong"
        };

        // 发送请求
        const res = await this.$request('service/member/verify/update', params, 'POST');

        if (res.code === 200) {
          uni.showToast({
            title: '已拒绝认证',
            icon: 'success'
          });
          this.closeVerifyModal();
          this.refreshRiders();
        } else {
          uni.showToast({
            title: res.msg || '操作失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('审核操作失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    },

    // 切换骑手状态（启用/禁用）
    async toggleRiderStatus(rider) {
      try {
        // 构建请求参数
        const newStatus = rider.status === 'active' ? 'disabled' : 'active';
        const params = {
          service_member_id: this.adminInfo.id,
          rider_id: rider.id,
          status: newStatus,
          sign: "chongchong"
        };

        // 发送请求
        const res = await this.$request('service/member/status/update', params, 'POST');

        if (res.code === 200) {
          uni.showToast({
            title: newStatus === 'active' ? '已启用' : '已禁用',
            icon: 'success'
          });
          this.refreshRiders();
        } else {
          uni.showToast({
            title: res.msg || '操作失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('更新骑手状态失败:', err);
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
.rider-list-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: "HarmonyOS Sans SC", "PingFang SC", sans-serif;
  color: #333;
  font-size: 28rpx;
  line-height: 1.5;
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
}

// 搜索和筛选区域
.search-filter {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 16rpx;
  margin: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #f0f0f0;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 16rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #eee;
}

.search-icon-wrapper {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon {
  width: 24rpx;
  height: 24rpx;
  border: 2rpx solid #999;
  border-radius: 50%;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    width: 8rpx;
    height: 2rpx;
    background-color: #999;
    bottom: -5rpx;
    right: -5rpx;
    transform: rotate(45deg);
  }
}

.search-input {
  flex: 1;
  height: 60rpx;
  font-size: 24rpx;
  padding: 0 16rpx;
}

.search-btn {
  padding: 0 16rpx;
  height: 60rpx;
  line-height: 60rpx;
  color: #6c5ce7;
  font-size: 24rpx;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1rpx;
    height: 30rpx;
    background-color: #e0e0e0;
  }
}

.filter-options {
  display: flex;
  flex-direction: column;
}

.filter-section {
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.filter-title {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 12rpx;

  .title-icon {
    width: 24rpx;
    height: 24rpx;
    margin-right: 8rpx;
    position: relative;
  }

  .status-icon {
    &::before {
      content: '';
      position: absolute;
      width: 16rpx;
      height: 16rpx;
      border: 2rpx solid #6c5ce7;
      border-radius: 50%;
      top: 2rpx;
      left: 2rpx;
    }
  }
}

.filter-items {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.filter-item {
  padding: 8rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #666;
  transition: all 0.3s ease;

  &.active {
    background-color: #6c5ce7;
    color: #fff;
  }
}

// 骑手列表
.rider-list {
  height: calc(100vh - 300rpx);
  padding: 0 20rpx;
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
    border: 4rpx solid rgba(108, 92, 231, 0.2);
    border-top: 4rpx solid #6c5ce7;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16rpx;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;

  .empty-icon {
    width: 120rpx;
    height: 120rpx;
    background-color: rgba(108, 92, 231, 0.1);
    border-radius: 50%;
    margin-bottom: 20rpx;
    position: relative;

    &::before, &::after {
      content: '';
      position: absolute;
      background-color: rgba(108, 92, 231, 0.5);
    }

    &::before {
      width: 60rpx;
      height: 4rpx;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.rider-list-content {
  padding: 10rpx 0;
}

.rider-item {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.rider-header {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.rider-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  overflow: hidden;
  margin-right: 16rpx;

  image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.rider-info {
  flex: 1;
}

.rider-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 4rpx;
}

.rider-id, .rider-phone {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 2rpx;
}

.rider-status {
  padding: 4rpx 16rpx;
  border-radius: 30rpx;
  font-size: 22rpx;

  &.active {
    background-color: rgba(46, 213, 115, 0.1);
    color: #2ed573;
  }

  &.disabled {
    background-color: rgba(255, 71, 87, 0.1);
    color: #ff4757;
  }
}

.rider-details {
  padding: 16rpx 20rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-label {
  font-size: 24rpx;
  color: #666;
  margin-right: 8rpx;
}

.detail-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;

  &.verify-none {
    color: #999;
  }

  &.verify-pending {
    color: #f39c12;
  }

  &.verify-approved {
    color: #2ed573;
  }

  &.verify-rejected {
    color: #ff4757;
  }
}

.rider-actions {
  display: flex;
  padding: 16rpx 20rpx;
  border-top: 1rpx solid #f5f5f5;
  justify-content: flex-end;
}

.action-btn {
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  margin-left: 16rpx;

  &.edit {
    background-color: rgba(108, 92, 231, 0.1);
    color: #6c5ce7;
  }

  &.verify {
    background-color: rgba(243, 156, 18, 0.1);
    color: #f39c12;
  }

  &.disable {
    background-color: rgba(255, 71, 87, 0.1);
    color: #ff4757;
  }

  &.enable {
    background-color: rgba(46, 213, 115, 0.1);
    color: #2ed573;
  }
}

.load-more, .no-more {
  text-align: center;
  padding: 20rpx 0;
  font-size: 24rpx;
  color: #999;
}

// 弹窗样式
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
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
  z-index: 1001;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
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
  max-height: 60vh;
  overflow-y: auto;
}

.input-group {
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.input-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.input-field {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #f5f5f5;
}

.modal-btn {
  flex: 1;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;

  &.cancel {
    color: #666;
    background-color: #f5f5f5;
  }

  &.confirm {
    color: #fff;
    background-color: #6c5ce7;
  }

  &.reject {
    color: #fff;
    background-color: #ff4757;
  }

  &.approve {
    color: #fff;
    background-color: #2ed573;
  }
}

// 审核认证弹窗样式
.verify-info {
  display: flex;
  flex-direction: column;
}

.verify-item {
  display: flex;
  margin-bottom: 16rpx;
}

.verify-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #666;
}

.verify-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.verify-images {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
}

.verify-image-item {
  width: 48%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.id-card-image {
  width: 100%;
  height: 200rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  object-fit: contain;
}
</style>
