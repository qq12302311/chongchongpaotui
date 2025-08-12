<template>
  <view class="admin-container">
    <!-- 顶部导航栏 -->
    <nav-bar :title="pageTitle" title-align="center" :showBackButton="false"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder" :style="{ height: navBarHeight + 'px' }"></view>

    <!-- 返回启动页按钮 -->
    <view class="back-to-start" @click="goToStartPage">
      <text>返回启动页</text>
    </view>

    <!-- 首页内容 -->
    <view v-if="pageVisible.home" class="page-content">
      <!-- 欢迎区域 -->
      <view class="welcome-section">
        <view class="welcome-content">
          <view class="welcome-text">
            <text class="welcome-title">充充跑腿运维管理系统</text>
            <text class="welcome-subtitle">管理用户端和骑手端的功能设置和数据统计</text>
          </view>
          <view class="welcome-decoration">
            <view class="decoration-circle"></view>
            <view class="decoration-circle"></view>
          </view>
        </view>
        <view class="welcome-stats">
          <view class="quick-stat">
            <text class="stat-value">0</text>
            <text class="stat-label">今日订单</text>
          </view>
          <view class="quick-stat">
            <text class="stat-value">0</text>
            <text class="stat-label">活跃用户</text>
          </view>
          <view class="quick-stat">
            <text class="stat-value">0</text>
            <text class="stat-label">总收入(元)</text>
          </view>
        </view>
      </view>

      <!-- 快捷功能卡片区域 -->
      <view class="card-section">
        <view class="section-header">
          <view class="section-title">快捷功能</view>
          <view class="section-subtitle">常用功能快速访问</view>
        </view>
        <view class="quick-grid">
          <view class="quick-card" @click="navigateTo('orderSearch')">
            <view class="quick-icon search-icon"></view>
            <text class="quick-text">订单查询</text>
          </view>
          <view class="quick-card" @click="navigateTo('userVerify')">
            <view class="quick-icon verify-icon"></view>
            <text class="quick-text">用户审核</text>
          </view>
          <view class="quick-card" @click="navigateTo('riderVerify')">
            <view class="quick-icon rider-verify-icon"></view>
            <text class="quick-text">骑手审核</text>
          </view>
          <view class="quick-card" @click="navigateTo('dataAnalysis')">
            <view class="quick-icon analysis-icon"></view>
            <text class="quick-text">数据分析</text>
          </view>
        </view>
      </view>

      <!-- 数据统计区域 -->
      <view class="stats-section">
        <view class="section-header">
          <view class="section-title">数据统计</view>
          <view class="section-subtitle">平台运营数据分析</view>
        </view>
        <view class="stats-cards">
          <view class="stats-card">
            <view class="stats-icon order-stats-icon"></view>
            <view class="stats-info">
              <view class="stats-label">本周订单</view>
              <view class="stats-value">0</view>
            </view>
            <view class="stats-trend up">
              <text class="trend-value">0%</text>
            </view>
          </view>
          <view class="stats-card">
            <view class="stats-icon user-stats-icon"></view>
            <view class="stats-info">
              <view class="stats-label">新增用户</view>
              <view class="stats-value">0</view>
            </view>
            <view class="stats-trend up">
              <text class="trend-value">0%</text>
            </view>
          </view>
          <view class="stats-card">
            <view class="stats-icon rider-stats-icon"></view>
            <view class="stats-info">
              <view class="stats-label">活跃骑手</view>
              <view class="stats-value">0</view>
            </view>
            <view class="stats-trend up">
              <text class="trend-value">0%</text>
            </view>
          </view>
          <view class="stats-card">
            <view class="stats-icon income-stats-icon"></view>
            <view class="stats-info">
              <view class="stats-label">本月收入</view>
              <view class="stats-value">¥0.00</view>
            </view>
            <view class="stats-trend up">
              <text class="trend-value">0%</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 页脚区域已移除 -->
    </view>

    <!-- 用户端管理内容 -->
    <view v-if="pageVisible.user" class="page-content">
      <view class="user-management">
        <view class="section-header">
          <view class="section-title">用户端管理</view>
          <view class="section-subtitle">管理用户端功能和设置</view>
        </view>

        <view class="card-grid">

          <view v-if="userLevel === 9" class="card" @click="navigateToTaskSettings">
            <view class="card-content">
              <view class="card-icon-wrapper user-color">
                <view class="card-icon setting-icon"></view>
              </view>
              <view class="card-info">
                <text class="card-title">发布任务设置</text>
                <text class="card-desc">设置任务发布的服务金额</text>
              </view>
            </view>
            <view class="card-arrow"></view>
          </view>

          <view class="card" @click="navigateTo('userManage')">
            <view class="card-content">
              <view class="card-icon-wrapper user-color">
                <view class="card-icon user-icon"></view>
              </view>
              <view class="card-info">
                <text class="card-title">用户管理</text>
                <text class="card-desc">管理用户信息和权限</text>
              </view>
            </view>
            <view class="card-arrow"></view>
          </view>

          <view class="card" @click="navigateTo('userAnalysis')">
            <view class="card-content">
              <view class="card-icon-wrapper user-color">
                <view class="card-icon analysis-icon"></view>
              </view>
              <view class="card-info">
                <text class="card-title">用户数据分析</text>
                <text class="card-desc">分析用户行为和数据</text>
              </view>
            </view>
            <view class="card-arrow"></view>
          </view>

          <!-- 返回启动页按钮 -->
          <view class="start-page-button" @click="goToStartPage">
            返回启动页
          </view>
        </view>
      </view>
    </view>

    <!-- 骑手端管理内容 -->
    <view v-if="pageVisible.rider" class="page-content">
      <rider-management></rider-management>
    </view>

    <!-- 订单管理内容 -->
    <view v-if="pageVisible.order" class="page-content">
      <view class="order-management">
        <!-- 订单管理说明文字 -->
        <view class="section-header">
          <text class="section-title">订单管理</text>
          <text class="section-desc">管理和查看所有订单信息</text>
        </view>

        <!-- 新增订单列表卡片 -->
        <view class="card-grid">
          <view class="card" @click="navigateToOrderList">
            <view class="card-content">
              <view class="card-icon-wrapper order-color">
                <view class="card-icon list-icon"></view>
              </view>
              <view class="card-info">
                <text class="card-title">订单列表</text>
                <text class="card-desc">查看全部订单明细</text>
              </view>
            </view>
            <view class="card-arrow"></view>
          </view>
          <!-- 订单数据分析卡片 -->
          <view class="card" @click="navigateToOrderAnalysis">
            <view class="card-content">
              <view class="card-icon-wrapper analysis-color">
                <view class="card-icon analysis-icon"></view>
              </view>
              <view class="card-info">
                <text class="card-title">订单数据分析</text>
                <text class="card-desc">订单趋势与统计分析</text>
              </view>
            </view>
            <view class="card-arrow"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航栏组件 -->
    <tab-bar :currentPage="currentPage" @change="switchPage"></tab-bar>

    <!-- 底部安全区域 - 这里不需要单独添加，已经在样式中处理 -->
  </view>
</template>

<script>
// 导入底部导航组件
import TabBar from '@/components/TabBar.vue'
import RiderManagement from '@/components/admin/RiderManagement.vue'
import md5 from 'md5'

export default {
  // 注册组件
  components: {
    TabBar,
    RiderManagement
  },
  data() {
    return {
      navBarHeight: 0,
      currentPage: 'user', // 当前页面：home, user, rider, order
      // 各页面的内容显示状态
      pageVisible: {
        home: false,
        user: true,
        rider: false,
        order: false
      },
      riderUserInfo: null,
      userLevel: 0,
    }
  },
  computed: {
    // 根据当前页面返回对应的标题
    pageTitle() {
      const titles = {
        'home': '充充跑腿运维端',
        'user': '用户端管理',
        'rider': '骑手端管理',
        'order': '订单管理'
      }
      return titles[this.currentPage] || '充充跑腿运维端'
    }
  },
  onShow() {
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

    // 获取用户等级
    if (this.riderUserInfo && this.riderUserInfo.level !== undefined) {
      this.userLevel = parseInt(this.riderUserInfo.level) || 0;
      console.log('用户等级:', this.userLevel);
    } else {
      console.log('未获取到用户等级信息');
    }
  },
  methods: {
    // 切换页面
    switchPage(page) {
      if (this.currentPage === page) return;

      // 更新当前页面
      this.currentPage = page;

      // 更新页面可见性
      for (const key in this.pageVisible) {
        this.pageVisible[key] = key === page;
      }




    },

    // 功能导航
    navigateTo(type) {
      const routes = {
        'userManage': '/adminEnd/userManage/index',
        'orderSearch': '/adminEnd/orderManage/index',
        'userVerify': '/adminEnd/userVerify/index',
        'riderVerify': '/adminEnd/riderVerify/index',
        'dataAnalysis': '/adminEnd/dataAnalysis/index',
        'userAnalysis': '/adminEnd/userAnalysis/index'
      };

      if (routes[type]) {
        uni.navigateTo({
          url: routes[type]
        });
      } else {
        uni.showToast({
          title: '功能开发中',
          icon: 'none'
        });
      }
    },

    // 返回方法已移除，因为不再需要返回按钮

    // 导航到发布任务设置页面
    navigateToTaskSettings() {
      uni.navigateTo({
        url: '/adminEnd/userSettings/taskSettings'
      });
    },



    // 导航到订单管理页面
    navigateToOrderManage() {
      uni.navigateTo({
        url: '/adminEnd/orderManage/index'
      });
    },

    // 跳转到启动页
    goToStartPage() {
      uni.navigateTo({
        url: '/pages/launcher/index'
      })
    },

    navigateToOrderList() {
      uni.navigateTo({ url: '/adminEnd/orderManage/orderList' })
    },
    navigateToOrderAnalysis() {
      uni.navigateTo({ url: '/adminEnd/orderManage/orderAnalysis' })
    },



  }
}
</script>

<style lang="scss" scoped>
.admin-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: "HarmonyOS Sans SC", "PingFang SC", sans-serif;
  color: #333;
  font-size: 28rpx;
  line-height: 1.5;

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

// 欢迎区域样式
.welcome-section {
  background: linear-gradient(135deg, #4481eb 0%, #04befe 100%);
  padding: 40rpx;
  color: #fff;
  border-radius: 0 0 30rpx 30rpx;
  box-shadow: 0 10rpx 20rpx rgba(4, 190, 254, 0.1);
  margin-bottom: 30rpx;
  position: relative;
  overflow: hidden;

  .welcome-content {
    display: flex;
    justify-content: space-between;
    position: relative;
    z-index: 2;
    margin-bottom: 30rpx;
  }

  .welcome-text {
    flex: 1;
  }

  .welcome-title {
    font-size: 40rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
    display: block;
    letter-spacing: 1rpx;
  }

  .welcome-subtitle {
    font-size: 28rpx;
    opacity: 0.9;
    line-height: 1.4;
  }

  .welcome-decoration {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1;

    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);

      &:nth-child(1) {
        width: 160rpx;
        height: 160rpx;
        right: -40rpx;
        top: -60rpx;
      }

      &:nth-child(2) {
        width: 120rpx;
        height: 120rpx;
        right: 60rpx;
        top: 20rpx;
      }
    }
  }

  .welcome-stats {
    display: flex;
    justify-content: space-between;
    background-color: rgba(255, 255, 255, 0.15);
    border-radius: 16rpx;
    padding: 20rpx;
    backdrop-filter: blur(10rpx);
    -webkit-backdrop-filter: blur(10rpx);

    .quick-stat {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10rpx;

      &:not(:last-child) {
        border-right: 1rpx solid rgba(255, 255, 255, 0.2);
      }

      .stat-value {
        font-size: 36rpx;
        font-weight: bold;
        margin-bottom: 8rpx;
      }

      .stat-label {
        font-size: 24rpx;
        opacity: 0.8;
      }
    }
  }
}

// 区域标题样式
.section-header {
  margin-bottom: 24rpx;
  padding: 0 30rpx;

  .section-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 6rpx;
    position: relative;
    display: inline-block;

    &::after {
      content: '';
      position: absolute;
      bottom: -6rpx;
      left: 0;
      width: 40rpx;
      height: 4rpx;
      background: linear-gradient(90deg, #4481eb, #04befe);
      border-radius: 4rpx;
    }
  }

  .section-subtitle {
    font-size: 24rpx;
    color: #999;
  }
}

// 功能卡片区域样式
.card-section {
  padding: 20rpx 20rpx 30rpx;
}

// 快捷功能网格
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  padding: 10rpx;
}

.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx 10rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }

  .quick-icon {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    margin-bottom: 12rpx;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-icon {
    background: linear-gradient(135deg, rgba(68, 129, 235, 0.1) 0%, rgba(4, 190, 254, 0.2) 100%);

    &::before {
      content: '';
      position: absolute;
      width: 24rpx;
      height: 24rpx;
      border: 3rpx solid #4481eb;
      border-radius: 50%;
      top: 12rpx;
      left: 12rpx;
    }

    &::after {
      content: '';
      position: absolute;
      width: 12rpx;
      height: 3rpx;
      background-color: #4481eb;
      transform: rotate(45deg);
      bottom: 18rpx;
      right: 14rpx;
    }
  }

  .verify-icon {
    background: linear-gradient(135deg, rgba(0, 184, 148, 0.1) 0%, rgba(0, 206, 201, 0.2) 100%);

    &::before {
      content: '';
      position: absolute;
      width: 30rpx;
      height: 20rpx;
      border-left: 3rpx solid #00b894;
      border-bottom: 3rpx solid #00b894;
      transform: rotate(-45deg);
      top: 16rpx;
      left: 14rpx;
    }
  }

  .rider-verify-icon {
    background: linear-gradient(135deg, rgba(253, 121, 168, 0.1) 0%, rgba(255, 118, 117, 0.2) 100%);

    &::before {
      content: '';
      position: absolute;
      width: 24rpx;
      height: 12rpx;
      border-left: 3rpx solid #fd79a8;
      border-bottom: 3rpx solid #fd79a8;
      transform: rotate(-45deg);
      top: 20rpx;
      left: 16rpx;
    }

    &::after {
      content: '';
      position: absolute;
      width: 24rpx;
      height: 24rpx;
      border: 3rpx solid #fd79a8;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .analysis-icon {
    background: linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(130, 88, 186, 0.2) 100%);

    &::before {
      content: '';
      position: absolute;
      width: 6rpx;
      height: 20rpx;
      background-color: #6c5ce7;
      bottom: 12rpx;
      left: 14rpx;
    }

    &::after {
      content: '';
      position: absolute;
      width: 6rpx;
      height: 30rpx;
      background-color: #6c5ce7;
      bottom: 12rpx;
      left: 24rpx;
      box-shadow: 10rpx 0 0 #6c5ce7, 20rpx 0 0 #6c5ce7;
    }
  }

  .quick-text {
    font-size: 24rpx;
    color: #333;
    font-weight: 500;
  }
}

// 卡片网格
.card-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  .card-content {
    display: flex;
    align-items: center;
  }

  .card-icon-wrapper {
    width: 80rpx;
    height: 80rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;

    &.user-color {
      background: linear-gradient(135deg, rgba(68, 129, 235, 0.1) 0%, rgba(4, 190, 254, 0.2) 100%);
    }

    &.rider-color {
      background: linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(130, 88, 186, 0.2) 100%);
    }

    &.order-color {
      background: linear-gradient(135deg, rgba(36, 146, 242, 0.1) 0%, rgba(52, 152, 219, 0.2) 100%);
    }

    &.analysis-color {
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(78, 205, 196, 0.2) 100%);
    }

    &.setting-color {
      background: linear-gradient(135deg, rgba(253, 121, 168, 0.1) 0%, rgba(255, 118, 117, 0.2) 100%);
    }
  }

  .card-icon {
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &.back-icon {
      &::before {
        content: '';
        position: absolute;
        width: 20rpx;
        height: 20rpx;
        border-left: 3rpx solid #4481eb;
        border-bottom: 3rpx solid #4481eb;
        transform: rotate(45deg);
        top: 8rpx;
        left: 14rpx;
      }
    }

    &.order-icon {
      &::before {
        content: '';
        position: absolute;
        width: 30rpx;
        height: 24rpx;
        border: 3rpx solid #00b894;
        border-radius: 4rpx;
        top: 6rpx;
        left: 4rpx;
      }

      &::after {
        content: '';
        position: absolute;
        width: 20rpx;
        height: 3rpx;
        background-color: #00b894;
        top: 14rpx;
        left: 9rpx;
        box-shadow: 0 6rpx 0 #00b894, 0 12rpx 0 #00b894;
      }
    }

    &.stats-icon {
      &::before {
        content: '';
        position: absolute;
        width: 6rpx;
        height: 16rpx;
        background-color: #00b894;
        bottom: 6rpx;
        left: 8rpx;
      }

      &::after {
        content: '';
        position: absolute;
        width: 6rpx;
        height: 24rpx;
        background-color: #00b894;
        bottom: 6rpx;
        left: 18rpx;
        box-shadow: 10rpx 0 0 #00b894;
      }
    }

    &.refund-icon {
      &::before {
        content: '';
        position: absolute;
        width: 24rpx;
        height: 24rpx;
        border: 3rpx solid #00b894;
        border-radius: 50%;
        top: 6rpx;
        left: 6rpx;
      }

      &::after {
        content: '¥';
        position: absolute;
        font-size: 20rpx;
        color: #00b894;
        top: 6rpx;
        left: 14rpx;
      }
    }

    &.list-icon {
      // 订单列表图标 - 文档列表样式
      &::before {
        content: '';
        position: absolute;
        width: 32rpx;
        height: 40rpx;
        background-color: #2492F2;
        border-radius: 4rpx;
        top: 8rpx;
        left: 50%;
        transform: translateX(-50%);
        box-shadow:
          inset 0 8rpx 0 rgba(255, 255, 255, 0.3),
          inset 0 16rpx 0 rgba(255, 255, 255, 0.3),
          inset 0 24rpx 0 rgba(255, 255, 255, 0.3);
      }

      &::after {
        content: '';
        position: absolute;
        width: 8rpx;
        height: 8rpx;
        background-color: #2492F2;
        border-radius: 50%;
        top: 6rpx;
        right: 8rpx;
        box-shadow: 0 4rpx 0 #2492F2, 0 8rpx 0 #2492F2;
      }
    }

    &.analysis-icon {
      // 订单数据分析图标 - 图表样式
      &::before {
        content: '';
        position: absolute;
        width: 6rpx;
        height: 20rpx;
        background-color: #FF6B6B;
        bottom: 8rpx;
        left: 8rpx;
        border-radius: 3rpx 3rpx 0 0;
      }

      &::after {
        content: '';
        position: absolute;
        width: 6rpx;
        height: 30rpx;
        background-color: #4ECDC4;
        bottom: 8rpx;
        left: 18rpx;
        border-radius: 3rpx 3rpx 0 0;
        box-shadow:
          10rpx 0 0 #FFE66D,
          20rpx 0 0 #A8E6CF;
      }
    }
  }

  .user-icon {
    background-color: rgba(36, 146, 242, 0.1);

    &::before, &::after {
      content: '';
      position: absolute;
    }

    &::before {
      width: 24rpx;
      height: 24rpx;
      background-color: #2492F2;
      border-radius: 50%;
      top: 15rpx;
      left: 50%;
      transform: translateX(-50%);
    }

    &::after {
      width: 40rpx;
      height: 20rpx;
      background-color: #2492F2;
      border-radius: 40rpx 40rpx 0 0;
      bottom: 15rpx;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .rider-icon {
    background-color: rgba(52, 73, 94, 0.1);

    &::before, &::after {
      content: '';
      position: absolute;
    }

    &::before {
      width: 40rpx;
      height: 20rpx;
      border: 3rpx solid #34495e;
      border-radius: 3rpx;
      top: 20rpx;
      left: 50%;
      transform: translateX(-50%);
    }

    &::after {
      width: 24rpx;
      height: 16rpx;
      border-left: 3rpx solid #34495e;
      border-right: 3rpx solid #34495e;
      border-bottom: 3rpx solid #34495e;
      border-radius: 0 0 3rpx 3rpx;
      bottom: 20rpx;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .order-icon {
    background-color: rgba(46, 204, 113, 0.1);

    &::before, &::after {
      content: '';
      position: absolute;
    }

    &::before {
      width: 40rpx;
      height: 50rpx;
      border: 3rpx solid #2ecc71;
      border-radius: 6rpx;
      top: 15rpx;
      left: 50%;
      transform: translateX(-50%);
    }

    &::after {
      width: 20rpx;
      height: 3rpx;
      background-color: #2ecc71;
      top: 30rpx;
      left: 50%;
      transform: translateX(-50%);
      box-shadow: 0 10rpx 0 #2ecc71, 0 20rpx 0 #2ecc71;
    }
  }

  .setting-icon {
    background-color: rgba(155, 89, 182, 0.1);

    &::before {
      content: '';
      position: absolute;
      width: 40rpx;
      height: 40rpx;
      border: 3rpx solid #9b59b6;
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
      background-color: #9b59b6;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .card-info {
    display: flex;
    flex-direction: column;
  }

  .card-title {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 6rpx;
  }

  .card-desc {
    font-size: 24rpx;
    color: #999;
  }

  .card-arrow {
    width: 16rpx;
    height: 16rpx;
    border-top: 3rpx solid #ccc;
    border-right: 3rpx solid #ccc;
    transform: rotate(45deg);
  }
}

// 数据统计区域样式
.stats-section {
  padding: 20rpx 20rpx 30rpx;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.stats-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

  .stats-icon {
    width: 60rpx;
    height: 60rpx;
    border-radius: 12rpx;
    margin-right: 16rpx;
    position: relative;
  }

  .order-stats-icon {
    background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);

    &::before {
      content: '';
      position: absolute;
      width: 24rpx;
      height: 30rpx;
      border: 2rpx solid #fff;
      border-radius: 4rpx;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &::after {
      content: '';
      position: absolute;
      width: 12rpx;
      height: 2rpx;
      background-color: #fff;
      top: 40%;
      left: 50%;
      transform: translateX(-50%);
      box-shadow: 0 6rpx 0 #fff;
    }
  }

  .user-stats-icon {
    background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);

    &::before {
      content: '';
      position: absolute;
      width: 16rpx;
      height: 16rpx;
      background-color: #fff;
      border-radius: 50%;
      top: 30%;
      left: 50%;
      transform: translateX(-50%);
    }

    &::after {
      content: '';
      position: absolute;
      width: 28rpx;
      height: 14rpx;
      background-color: #fff;
      border-radius: 28rpx 28rpx 0 0;
      bottom: 30%;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .rider-stats-icon {
    background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);

    &::before {
      content: '';
      position: absolute;
      width: 28rpx;
      height: 14rpx;
      border: 2rpx solid #fff;
      border-radius: 2rpx;
      top: 30%;
      left: 50%;
      transform: translateX(-50%);
    }

    &::after {
      content: '';
      position: absolute;
      width: 16rpx;
      height: 12rpx;
      border-left: 2rpx solid #fff;
      border-right: 2rpx solid #fff;
      border-bottom: 2rpx solid #fff;
      border-radius: 0 0 2rpx 2rpx;
      bottom: 30%;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .income-stats-icon {
    background: linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%);

    &::before {
      content: '¥';
      position: absolute;
      font-size: 28rpx;
      font-weight: bold;
      color: #fff;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .stats-info {
    flex: 1;
  }

  .stats-label {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 6rpx;
  }

  .stats-value {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .stats-trend {
    display: flex;
    align-items: center;
    font-size: 22rpx;

    &.up {
      color: #2ecc71;

      &::before {
        content: '';
        display: inline-block;
        width: 0;
        height: 0;
        border-left: 6rpx solid transparent;
        border-right: 6rpx solid transparent;
        border-bottom: 8rpx solid #2ecc71;
        margin-right: 4rpx;
      }
    }

    &.down {
      color: #e74c3c;

      &::before {
        content: '';
        display: inline-block;
        width: 0;
        height: 0;
        border-left: 6rpx solid transparent;
        border-right: 6rpx solid transparent;
        border-top: 8rpx solid #e74c3c;
        margin-right: 4rpx;
      }
    }
  }
}

// 页面内容样式
.page-content {
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom)); // 为底部导航和安全区域留出空间
}

// 订单管理区块标题样式
.order-management .section-header {
  margin-bottom: 24rpx;
  padding: 0 30rpx;

  .section-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 6rpx;
    position: relative;
    display: block;
    width: 100%;

    &::after {
      content: '';
      position: absolute;
      bottom: -6rpx;
      left: 0;
      width: 40rpx;
      height: 4rpx;
      background-color: #2492F2;
      border-radius: 2rpx;
    }
  }

  .section-desc {
    font-size: 24rpx;
    color: #666;
    line-height: 1.4;
    display: block;
    width: 100%;
    margin-top: 12rpx;
  }
}

// 用户端管理样式
.user-management {
  padding: 20rpx;

  .card-grid {
    margin-top: 20rpx;
  }
}

// 订单管理样式
.order-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20rpx;

  .search-filter {
    background-color: #fff;
    border-radius: 8rpx;
    padding: 16rpx;
    margin-bottom: 16rpx;
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
    color: #2492F2;
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

      &.status-icon {
        &::before {
          content: '';
          position: absolute;
          width: 18rpx;
          height: 18rpx;
          border: 2rpx solid #2492F2;
          border-radius: 50%;
          top: 1rpx;
          left: 1rpx;
        }

        &::after {
          content: '';
          position: absolute;
          width: 8rpx;
          height: 4rpx;
          border-left: 2rpx solid #2492F2;
          border-bottom: 2rpx solid #2492F2;
          transform: rotate(-45deg);
          top: 8rpx;
          left: 6rpx;
        }
      }

      &.zone-icon {
        &::before {
          content: '';
          position: absolute;
          width: 16rpx;
          height: 16rpx;
          border: 2rpx solid #2492F2;
          border-radius: 50%;
          top: 2rpx;
          left: 2rpx;
        }

        &::after {
          content: '';
          position: absolute;
          width: 2rpx;
          height: 8rpx;
          background-color: #2492F2;
          top: 12rpx;
          left: 10rpx;
          box-shadow: -4rpx -4rpx 0 #2492F2, 4rpx -4rpx 0 #2492F2;
        }
      }
    }
  }

  .filter-items {
    display: flex;
    flex-wrap: wrap;
  }

  .zone-selector {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8rpx 16rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    border: 1rpx solid #eee;
  }

  .zone-text {
    font-size: 22rpx;
    color: #333;
  }

  .zone-arrow {
    width: 16rpx;
    height: 16rpx;
    border-right: 2rpx solid #999;
    border-bottom: 2rpx solid #999;
    transform: rotate(45deg);
    margin-left: 8rpx;
  }

  .cascade-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  .cascade-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    z-index: 1000;
    border-top-left-radius: 16rpx;
    border-top-right-radius: 16rpx;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
  }

  .cascade-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    border-bottom: 1rpx solid #eee;
  }

  .cascade-title {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }

  .cascade-close {
    font-size: 36rpx;
    color: #999;
    padding: 0 10rpx;
  }

  .cascade-tabs {
    display: flex;
    padding: 16rpx;
    border-bottom: 1rpx solid #eee;
  }

  .cascade-tab {
    flex: 1;
    text-align: center;
    font-size: 24rpx;
    color: #666;
    padding: 10rpx 0;
    position: relative;

    &.active {
      color: #2492F2;
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        bottom: -16rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background-color: #2492F2;
      }
    }

    &.disabled {
      color: #ccc;
    }
  }

  .cascade-content {
    flex: 1;
    overflow: hidden;
  }

  .cascade-list {
    height: 60vh;
    padding: 0 20rpx;
  }

  .cascade-item {
    padding: 20rpx 0;
    font-size: 24rpx;
    color: #333;
    border-bottom: 1rpx solid #f5f5f5;

    &.active {
      color: #2492F2;
    }
  }

  .filter-item {
    display: inline-flex;
    align-items: center;
    padding: 8rpx 16rpx;
    font-size: 22rpx;
    color: #666;
    margin-right: 12rpx;
    margin-bottom: 10rpx;
    border-radius: 20rpx;
    background-color: #f5f5f5;
    transition: all 0.2s ease;
    position: relative;

    &.active {
      background-color: #2492F2;
      color: #fff;
    }

    &:active {
      opacity: 0.8;
    }

    .filter-label {
      font-size: 22rpx;
      margin-right: 0; // 移除右边距，因为徽标现在悬浮在右上角
    }

    .filter-badge {
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      background-color: #ff4757;
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

    &.active .filter-badge {
      background-color: rgba(255, 255, 255, 0.9);
      color: #2492F2;
      box-shadow: 0 2rpx 8rpx rgba(36, 146, 242, 0.3);
    }

    &.item-province {
      background-color: #e6f7ff;
      color: #1890ff;
      border: 1rpx solid #91d5ff;
    }

    &.item-city {
      background-color: #f6ffed;
      color: #52c41a;
      border: 1rpx solid #b7eb8f;
    }

    &.item-district {
      background-color: #fff7e6;
      color: #fa8c16;
      border: 1rpx solid #ffd591;
    }

    &.item-province.active {
      background-color: #1890ff;
      color: #fff;
      border: 1rpx solid #1890ff;
    }

    &.item-city.active {
      background-color: #52c41a;
      color: #fff;
      border: 1rpx solid #52c41a;
    }

    &.item-district.active {
      background-color: #fa8c16;
      color: #fff;
      border: 1rpx solid #fa8c16;
    }
  }

  .order-list {
    flex: 1;
    height: calc(100vh - 400rpx); // 设置明确的高度，减去导航栏和筛选区域的高度
    padding-bottom: 120rpx;
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
    display: flex;
    align-items: center;

    .copy-btn-small {
      font-size: 22rpx;
      padding: 2rpx 10rpx;
      background-color: #f5f5f5;
      color: #666;
      border: 1rpx solid #ddd;
      border-radius: 16rpx;
      margin-left: 10rpx;
    }
  }

  .order-status {
    font-size: 22rpx;
    padding: 4rpx 10rpx;
    border-radius: 4rpx;
    display: inline-block;

    &.waiting {
      background-color: #e6f7ff;
      color: #1890ff;
    }

    &.assigned {
      background-color: #fff7e6;
      color: #fa8c16;
    }

    &.timeout {
      background-color: #fff1f0;
      color: #ff4d4f;
      border: 1rpx solid #ff4d4f;
    }

    &.completed {
      background-color: #e6f7ff;
      color: #1890ff;
      border: 1rpx solid #1890ff;
    }

    &.finished {
      background-color: #f6ffed;
      color: #52c41a;
    }

    &.canceled {
      background-color: #f5f5f5;
      color: #999;
    }

    &.refunded {
      background-color: #fff1f0;
      color: #ff4d4f;
      border: 1rpx solid #ff4d4f;
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

  .brand-text {
    color: #666;
    margin-right: 16rpx;
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
    font-size: 24rpx;
    margin-left: 10rpx;
  }

  .info-value-wrap {
    display: flex;
    align-items: center;
    flex: 1;

    .info-value {
      flex: 1;
    }

    .call-btn, .copy-btn {
      font-size: 22rpx;
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
      margin-left: 16rpx;
    }

    .call-btn {
      background-color: #e6f7ff;
      color: #2492F2;
      border: 1rpx solid #2492F2;
    }

    .copy-btn {
      background-color: #f5f5f5;
      color: #666;
      border: 1rpx solid #ddd;
    }
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

  .user-info-row {
    position: relative;
  }

  .action-buttons {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 10rpx;
    align-items: center;
  }

  .cancel-order-btn {
    font-size: 24rpx;
    padding: 6rpx 16rpx;
    background-color: #fff1f0;
    color: #ff4d4f;
    border: 1rpx solid #ff4d4f;
    border-radius: 20rpx;
    white-space: nowrap;
  }

  .refund-btn {
    font-size: 24rpx;
    padding: 6rpx 16rpx;
    background-color: #fff7e6;
    color: #fa8c16;
    border: 1rpx solid #fa8c16;
    border-radius: 20rpx;
    white-space: nowrap;
  }

  .info-divider {
    height: 1rpx;
    background-color: #eee;
    margin: 16rpx 0 12rpx;
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
    cursor: pointer;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }

    &.refund {
      background-color: #fff7e6;
      color: #fa8c16;
      border: 1rpx solid #fa8c16;
    }

    &.refunded {
      background-color: #fff1f0;
      color: #ff4d4f;
      border: 1rpx solid #ff4d4f;
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

  .confirm-text {
    margin-top: 30rpx;
    padding: 20rpx;
    background-color: #fff7e6;
    border-radius: 8rpx;
    border-left: 4rpx solid #fa8c16;

    text {
      font-size: 28rpx;
      color: #fa8c16;
      font-weight: 500;
    }
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
}

// 占位内容样式
.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;

  .placeholder-icon {
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #4481eb 0%, #04befe 100%);
    margin-bottom: 40rpx;
    position: relative;
    box-shadow: 0 10rpx 20rpx rgba(4, 190, 254, 0.2);

    &::before {
      content: '';
      position: absolute;
      width: 70rpx;
      height: 70rpx;
      border: 4rpx solid rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &::after {
      content: '';
      position: absolute;
      width: 30rpx;
      height: 30rpx;
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .placeholder-text {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    letter-spacing: 1rpx;
  }

  .placeholder-desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    max-width: 80%;
  }
}

// 底部导航栏样式已移至 TabBar 组件中

// 页脚样式已移除

// 底部安全区域
.safe-area-bottom {
  height: env(safe-area-inset-bottom);
  background-color: #fff;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
}

.back-to-start {
  display: none;
}

.start-page-button {
  margin-top: 40rpx;
  padding: 24rpx;
  text-align: center;
  background: linear-gradient(135deg, #4481eb 0%, #04befe 100%);
  color: #fff;
  font-size: 32rpx;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(4, 190, 254, 0.2);

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.modal-btn.confirm.disabled {
  background: #f5f5f5;
  color: #bbb;
  pointer-events: none;
}

// 加载更多相关样式
.load-more {
  text-align: center;
  padding: 30rpx;
  color: #2492F2;
  font-size: 28rpx;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    opacity: 0.7;
    transform: scale(0.98);
  }

  &.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2492F2;
    cursor: default;

    &:active {
      opacity: 1;
      transform: none;
    }
  }

  .loading-spinner-small {
    width: 30rpx;
    height: 30rpx;
    border: 3rpx solid rgba(36, 146, 242, 0.3);
    border-top: 3rpx solid #2492F2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 10rpx;
  }
}

.no-more {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 24rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 徽标动画
@keyframes badge-bounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
