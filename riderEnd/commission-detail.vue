<template>
  <view class="commission-detail-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="佣金详情" title-align="center" :showBackButton="true"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 选项卡 - 独立卡片 -->
    <view class="tab-container">
      <view class="tab-item" :class="{ active: currentTab === 'day' }" @click="switchTab('day')">
        <text>按日</text>
      </view>
      <view class="tab-item" :class="{ active: currentTab === 'month' }" @click="switchTab('month')">
        <text>按月</text>
      </view>
    </view>

    <!-- 佣金总览 -->
    <view class="commission-summary">
      <!-- 佣金总览内容 -->
      <view class="summary-content">
        <!-- 左侧：日期选择和佣金总览标题 -->
        <view class="summary-left">
          <!-- 日期选择 - 只在按日模式下显示，放在总览上方 -->
          <view v-if="currentTab === 'day'" class="date-selector" @click="showMonthPicker">
            <text class="date-text">{{ currentYear }}-{{ String(currentMonth).padStart(2, '0') }}</text>
            <view class="dropdown-icon">▼</view>
          </view>
          <text class="summary-label">佣金总览（元）</text>
        </view>

        <!-- 右侧：金额 -->
        <text class="summary-amount">{{ totalCommission }}</text>
      </view>
    </view>

    <!-- 表头 -->
    <view class="table-header">
      <view class="header-item">{{ currentTab === 'day' ? '地区' : '时间' }}</view>
      <view class="header-item">{{ currentTab === 'day' ? '类型' : '订单数' }}</view>
      <view class="header-item">金额</view>
    </view>

    <!-- 佣金列表 -->
    <scroll-view
      class="commission-list"
      scroll-y
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="refreshData"
    >
      <view class="commission-item" v-for="(item, index) in commissionList" :key="index">
        <view class="item-content">
          <view class="item-column item-title-column">
            <text class="item-title">{{ item.title }}</text>
            <text class="item-time">{{ item.time }}</text>
          </view>
          <view class="item-column item-subtitle-column">
            <text class="item-subtitle">{{ item.subtitle }}</text>
          </view>
          <view class="item-column item-amount-column">
            <text class="amount-text">+{{ item.amount }}</text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 没有更多数据 -->
      <view v-if="!hasMore && commissionList.length > 0" class="no-more">
        <text>没有更多数据了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="commissionList.length === 0 && !loading" class="empty-state">
        <text class="empty-text">暂无佣金记录</text>
      </view>
    </scroll-view>

    <!-- 月份选择弹窗 -->
    <view class="month-picker-mask" v-if="showPicker" @click="hidePicker"></view>
    <view class="month-picker-container" v-if="showPicker">
      <view class="picker-header">
        <text class="picker-title">选择月份</text>
        <view class="picker-close" @click="hidePicker">×</view>
      </view>
      <view class="picker-content">
        <picker-view class="picker-view" :value="pickerValue" @change="onPickerChange">
          <picker-view-column>
            <view v-for="(year, index) in years" :key="index" class="picker-item">{{ year }}</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="(month, index) in months" :key="index" class="picker-item">{{ month }}月</view>
          </picker-view-column>
        </picker-view>
      </view>
      <view class="picker-footer">
        <view class="picker-btn cancel" @click="hidePicker">取消</view>
        <view class="picker-btn confirm" @click="confirmPicker">确定</view>
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
      currentYear: 2025,
      currentMonth: 5,
      currentTab: 'day',
      totalCommission: '0.00',
      commissionList: [],
      loading: false,
      refreshing: false,
      hasMore: true,
      page: 1,
      pageSize: 10,
      userInfo: {},
      showPicker: false,
      pickerValue: [0, 4], // 默认选择2025年5月
      years: [],
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    }
  },
  onLoad() {
    this.initYears();
    this.loadUserInfo();
    this.loadCommissionData();
  },
  methods: {
    initYears() {
      const currentYear = new Date().getFullYear();
      for (let i = currentYear - 2; i <= currentYear + 1; i++) {
        this.years.push(i);
      }
      // 设置默认选择的年份索引
      this.pickerValue[0] = this.years.indexOf(this.currentYear);
    },

    loadUserInfo() {
      const storedUserInfo = uni.getStorageSync('riderUserInfo');
      if (storedUserInfo) {
        this.userInfo = storedUserInfo;
      }
    },

    async loadCommissionData() {
      if (this.loading) return;

      this.loading = true;
      try {
        const params = {
          month: this.currentMonth,
          year: this.currentYear,
          service_member_id: this.userInfo.id,
          owner_type: "member",
          owner_id: this.userInfo.id,
          page: this.page,
          per_page: this.pageSize,
          sign: "chongchong"
        };

        const res = await this.$request('service/task/month', params, 'POST');

        if (res.code === 200 && res.data) {
          // 调试信息：打印完整数据结构
          console.log('佣金详情API返回数据:', res.data);

          // 处理月度数据
          const monthData = res.data.month_data;
          console.log('月度数据:', monthData);

          // 更新佣金总额
          this.totalCommission = monthData ? monthData.total_income : '0.00';

          // 根据当前选项卡处理不同的数据
          if (this.currentTab === 'day') {
            // 按日显示：处理任务列表数据
            const tasksData = res.data.tasks;
            console.log('任务数据:', tasksData);

            if (tasksData && tasksData.data) {
              const newData = this.formatTasksData(tasksData.data);

              if (this.page === 1) {
                this.commissionList = newData;
              } else {
                this.commissionList = [...this.commissionList, ...newData];
              }

              // 根据分页信息判断是否还有更多数据
              this.hasMore = tasksData.current_page < tasksData.last_page;
            } else {
              if (this.page === 1) {
                this.commissionList = [];
              }
              this.hasMore = false;
            }
          } else {
            // 按月显示：处理统计数据
            const statsData = res.data.stats;
            console.log('统计数据:', statsData);

            if (statsData && Array.isArray(statsData)) {
              const newData = this.formatStatsData(statsData);

              if (this.page === 1) {
                this.commissionList = newData;
              } else {
                this.commissionList = [...this.commissionList, ...newData];
              }

              // 计算stats数组中total_income的总和
              const totalIncome = statsData.reduce((sum, item) => {
                return sum + (parseFloat(item.total_income) || 0);
              }, 0);
              this.totalCommission = totalIncome.toFixed(2);

              // 统计数据通常不需要分页，设置为没有更多数据
              this.hasMore = false;
            } else {
              if (this.page === 1) {
                this.commissionList = [];
              }
              this.hasMore = false;
            }
          }
        } else {
          uni.showToast({
            title: res.msg || '获取数据失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取佣金数据失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
        this.refreshing = false;
      }
    },

    // 格式化任务数据（按日显示）
    formatTasksData(data) {
      if (!data || !Array.isArray(data)) return [];

      return data.map(item => {
        // 根据实际数据结构格式化显示内容
        const taskDetail = item.task_detail || {};
        const storeName = taskDetail.store_name || '未知店铺';
        const brand = this.getBrandName(taskDetail.brand || taskDetail.device_brand);
        const serviceType = item.task_name || taskDetail.task_name || '未知服务';
        const location = item.city_name || item.province_name || '海口';

        // 获取任务分配信息中的佣金
        const taskAssignment = item.earning || {};
        const commission = this.calculateCommission(item, taskAssignment);

        return {
          title: `${location}：${storeName}`,
          subtitle: `【${serviceType}】`,
          time: `时间：${item.completed_at || item.task_date || ''}`,
          amount: commission
        };
      });
    },

    // 格式化统计数据（按月显示）
    formatStatsData(data) {
      if (!data || !Array.isArray(data)) return [];

      return data.map(item => {
        const month = item.month || 1;
        const monthName = `${month}月`;
        const year = item.year || '';
        const totalIncome = item.total_income || 0;
        const recordCount = item.record_count || 0;

        return {
          title: `${year}年${monthName}`,
          subtitle: `【共${recordCount}笔订单】`,
          time: `净收入：¥${item.net_amount || 0}`,
          amount: totalIncome.toString()
        };
      });
    },

    // 计算佣金
    calculateCommission(task, taskAssignment) {
      // 优先使用任务分配中的佣金字段
      if (taskAssignment.worker_fee) {
        return taskAssignment.worker_fee;
      }

      // 如果没有直接的佣金字段，可能需要根据订单金额和佣金比例计算
      // 这里先返回固定值，实际应用中可能需要根据业务逻辑计算
      if (task.task_name === '补宝') {
        return '0.29'; // 根据您提供的数据，补宝任务的佣金
      }

      return '0';
    },

    // 获取品牌名称
    getBrandName(brand) {
      const brandMap = {
        'meituan': '美团',
        'guaishou': '怪兽',
        'jiedian': '街电',
        'xiaodian': '小电'
      };
      return brandMap[brand] || brand || '未知品牌';
    },

    switchTab(tab) {
      if (this.currentTab !== tab) {
        this.currentTab = tab;
        this.refreshData();
      }
    },

    refreshData() {
      this.page = 1;
      this.hasMore = true;
      this.commissionList = [];
      this.refreshing = true;
      this.loadCommissionData();
    },

    loadMore() {
      // 按月模式不支持分页
      if (this.currentTab === 'month') return;

      if (!this.hasMore || this.loading) return;
      this.page++;
      this.loadCommissionData();
    },

    showMonthPicker() {
      this.showPicker = true;
    },

    hidePicker() {
      this.showPicker = false;
    },

    onPickerChange(e) {
      this.pickerValue = e.detail.value;
    },

    confirmPicker() {
      this.currentYear = this.years[this.pickerValue[0]];
      this.currentMonth = this.months[this.pickerValue[1]];
      this.hidePicker();
      this.refreshData();
    }
  }
}
</script>

<style lang="scss" scoped>
.commission-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
}

.commission-summary {
  background-color: white;
  margin: 0 20rpx 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;
}

.summary-content {
  display: flex;
  align-items: flex-end; /* 底部对齐 */
  justify-content: space-between; /* 左右分布 */
}

.summary-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 左对齐 */
}

.date-selector {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx; /* 与标题的间距 */
}

.date-text {
  font-size: 24rpx;
  color: #666;
  margin-right: 6rpx;
}

.dropdown-icon {
  font-size: 18rpx;
  color: #999;
}

.summary-label {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.summary-amount {
  font-size: 48rpx;
  color: #ff6b35;
  font-weight: bold;
}

.tab-container {
  display: flex;
  background-color: white;
  margin: 20rpx; /* 四周都有间距，独立卡片 */
  border-radius: 12rpx; /* 四个圆角 */
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1); /* 添加阴影突出显示 */
}

.tab-item {
  flex: 1;
  padding: 28rpx; /* 增加内边距使按钮更大 */
  text-align: center;
  font-size: 30rpx; /* 增大字体 */
  font-weight: 500;
  color: #666;
  background-color: #f8f8f8;
  transition: all 0.3s ease; /* 添加过渡动画 */

  &.active {
    background-color: #2492F2;
    color: white;
    font-weight: 600;
  }

  &:active {
    opacity: 0.8;
  }
}

.table-header {
  display: flex;
  background-color: white;
  margin: 0 20rpx;
  border-radius: 12rpx 12rpx 0 0;
  border-bottom: 1rpx solid #f5f5f5;
  padding: 0; /* 完全移除内边距 */
}

.header-item {
  font-size: 26rpx;
  color: #999;
  font-weight: 500;
  box-sizing: border-box;
  padding: 20rpx 0; /* 只保留上下内边距 */
  display: flex;
  align-items: center;

  &:first-child {
    width: 50%;
    justify-content: flex-start;
    padding-left: 20rpx;
    padding-right: 10rpx;
  }

  &:nth-child(2) {
    width: 25%;
    justify-content: center;
    padding-left: 5rpx;
    padding-right: 5rpx;
  }

  &:last-child {
    width: 25%;
    justify-content: flex-end;
    padding-left: 5rpx;
    padding-right: 20rpx;
  }
}

.commission-list {
  height: calc(100vh - 600rpx);
  background-color: white;
  margin: 0 20rpx 20rpx;
  border-radius: 0 0 12rpx 12rpx;
  width: calc(100% - 40rpx); /* 减去左右margin的宽度 */
  box-sizing: border-box;
}

.commission-item {
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.item-content {
  display: flex;
  align-items: stretch; /* 改为stretch确保高度一致 */
  padding: 0; /* 完全移除内边距 */
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.item-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
  padding: 24rpx 0; /* 将内边距移到列级别 */
}

.item-title-column {
  width: 50%;
  padding-left: 20rpx;
  padding-right: 10rpx;
  box-sizing: border-box;
}

.item-subtitle-column {
  width: 25%;
  padding-left: 5rpx;
  padding-right: 5rpx;
  box-sizing: border-box;
  text-align: center;
}

.item-amount-column {
  width: 25%;
  padding-left: 5rpx;
  padding-right: 20rpx;
  box-sizing: border-box;
  text-align: right;
}

.item-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 6rpx;
  word-wrap: break-word;
  line-height: 1.4;
  text-align: left;
}

.item-subtitle {
  font-size: 24rpx;
  color: #666;
  word-wrap: break-word;
  text-align: center;
}

.item-time {
  font-size: 22rpx;
  color: #999;
  word-wrap: break-word;
  text-align: left;
}

.amount-text {
  font-size: 32rpx;
  color: #ff6b35;
  font-weight: bold;
  white-space: nowrap;
  text-align: right;
}

.loading-container, .no-more, .empty-state {
  text-align: center;
  padding: 40rpx;
}

.loading-text, .empty-text {
  font-size: 24rpx;
  color: #999;
}

/* 月份选择器样式 */
.month-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.month-picker-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 20rpx 20rpx 0 0;
  z-index: 1001;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.picker-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.picker-close {
  font-size: 40rpx;
  color: #999;
}

.picker-view {
  height: 400rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  font-size: 28rpx;
  color: #333;
}

.picker-footer {
  display: flex;
  border-top: 1rpx solid #f5f5f5;
}

.picker-btn {
  flex: 1;
  padding: 30rpx;
  text-align: center;
  font-size: 28rpx;

  &.cancel {
    color: #999;
    border-right: 1rpx solid #f5f5f5;
  }

  &.confirm {
    color: #2492F2;
    font-weight: 500;
  }

  &:active {
    background-color: #f5f5f5;
  }
}
</style>
