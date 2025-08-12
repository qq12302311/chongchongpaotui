<template>
  <view class="user-analysis-container">
    <nav-bar title="用户数据分析" title-align="center" :showBackButton="true"></nav-bar>
    <view class="nav-placeholder" :style="{ height: navBarHeight + 'px' }"></view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 数据分析内容 -->
    <view v-else class="analysis-content">
      <!-- 今日统计卡片 -->
      <view class="stats-section">
        <view class="stats-card">
          <view class="stats-title">总用户数</view>
          <view class="stats-value">{{ analysisData.totalUsers || 0 }}</view>
        </view>
        <view class="stats-card">
          <view class="stats-title">今日新增</view>
          <view class="stats-value new-users">{{ analysisData.todayNewUsers || 0 }}</view>
        </view>
        <view class="stats-card">
          <view class="stats-title">活跃用户</view>
          <view class="stats-value active-users">--</view>
        </view>
        <view class="stats-card">
          <view class="stats-title">用户余额</view>
          <view class="stats-value amount">--</view>
        </view>
      </view>

      <!-- 用户注册趋势图 -->
      <view class="chart-section">
        <view class="chart-header">
          <view class="chart-title">用户注册趋势</view>
          <view class="time-filter">
            <view 
              class="filter-item" 
              :class="{ active: registerTimeType === 1 }"
              @click="changeRegisterTimeType(1)"
            >日</view>
            <view 
              class="filter-item" 
              :class="{ active: registerTimeType === 2 }"
              @click="changeRegisterTimeType(2)"
            >周</view>
            <view 
              class="filter-item" 
              :class="{ active: registerTimeType === 3 }"
              @click="changeRegisterTimeType(3)"
            >月</view>
          </view>
        </view>
        <view class="chart-container">
          <qiun-data-charts
            v-if="registerChartData && registerChartData.series && registerChartData.series.length > 0"
            type="line"
            :opts="chartOpts"
            :chartData="registerChartData"
            :ontouch="true"
            :tapLegend="true"
            :tooltipShow="true"
            :canvas2d="true"
            canvasId="registerChart"
            @getIndex="getRegisterChartIndex"
            @getLegendIndex="getRegisterLegendIndex"
          />
          <view v-else class="chart-loading">
            <text>图表加载中...</text>
          </view>
        </view>
      </view>


    </view>

    <view style="height: env(safe-area-inset-bottom, 0px);"></view>
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
      chartOpts: {
        color: ["#2492F2", "#52C41A", "#FF6B35", "#FF4D4F"],
        padding: [15, 10, 0, 15],
        enableScroll: true,
        legend: {},
        xAxis: {
          disableGrid: true,
          scrollShow: true,
          itemCount: 4
        },
        yAxis: {
          gridType: "dash",
          dashLength: 2
        },
        extra: {
          line: {
            type: "straight",
            width: 2,
            activeType: "hollow"
          },
        },
      },
      navBarHeight: 0,
      loading: false,
      analysisData: {},
      riderUserInfo: null,
      // 用户注册图表数据
      registerChartData: null,
      // 时间类型选择
      registerTimeType: 1, // 用户注册图表时间类型：1-日, 2-周, 3-月，默认选中日
    }
  },

  onShow() {
    // 计算导航栏高度
    const systemInfo = uni.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 0;
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48;
    this.navBarHeight = statusBarHeight + navBarHeight;

    // 获取用户信息
    this.riderUserInfo = uni.getStorageSync('riderUserInfo');

    // 加载数据
    this.loadAnalysisData();
  },

  methods: {
    // 加载分析数据
    async loadAnalysisData() {
      if (this.loading) return;

      this.loading = true;

      try {
        // 获取用户信息
        if (!this.riderUserInfo || !this.riderUserInfo.id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        // 构建请求参数 - 默认使用日数据
        const params = {
          type: 1,
          data_type: "user",
          provider_id: [1],
          service_member_id: this.riderUserInfo.id,
          timestamp: Math.floor(Date.now() / 1000),
          sign: "chongchong"
        };

        console.log('用户分析请求参数:', params);

        // 发送请求
        const res = await this.$request('data/users-members', params, 'POST');

        console.log('🔍 完整的用户分析响应:', res);
        console.log('🔍 res.data:', res.data);
        console.log('🔍 res.total:', res.total);
        console.log('🔍 res.data.total:', res.data ? res.data.total : 'res.data不存在');

        if (res.status === 'success' && res.data) {
          // 检查total字段在哪个层级
          let dataToProcess = res.data;

          // 如果res.data中没有total，但res中有total，则合并数据
          if (!res.data.total && res.total) {
            console.log('🔧 total字段在res根级别，合并到data中');
            dataToProcess = {
              ...res.data,
              total: res.total
            };
          }

          console.log('📊 最终传递给processAnalysisData的数据:', dataToProcess);
          this.processAnalysisData(dataToProcess);
        } else {
          uni.showToast({
            title: res.msg || '获取数据失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取用户分析数据失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 处理分析数据
    processAnalysisData(data) {
      console.log('用户分析原始数据:', data);

      // 处理统计数据
      let todayNewUsers = 0;
      let totalUsers = 0;

      // 调试：检查total对象的结构
      console.log('data.total:', data.total);
      console.log('data.total.user:', data.total ? data.total.user : 'total不存在');
      console.log('data.total.user类型:', data.total ? typeof data.total.user : 'N/A');

      // 从接口返回的total对象中获取总用户数
      if (data.total && data.total.user !== undefined && data.total.user !== null) {
        // 确保转换为数字
        totalUsers = Number(data.total.user);
        console.log('✅ 从total.user获取总用户数:', totalUsers);
      } else {
        console.warn('❌ 接口未返回total.user数据，使用备用计算方式');
        console.log('data.total存在:', !!data.total);
        console.log('data.total.user值:', data.total ? data.total.user : 'N/A');

        // 备用方案：从series数据计算总用户数
        if (data.series && data.series.length > 0) {
          // 查找注册用户系列（支持多种可能的名称）
          let registerSeries = data.series.find(s =>
            s.name === '每日注册用户' ||
            s.name === '每周注册用户' ||
            s.name === '每月注册用户' ||
            s.name.includes('注册用户') ||
            s.name.includes('注册') ||
            s.name.includes('用户')
          );

          // 如果还是找不到，就取第一个系列
          if (!registerSeries && data.series.length > 0) {
            registerSeries = data.series[0];
            console.log('⚠️ processAnalysisData中未找到匹配的用户系列名称，使用第一个系列:', registerSeries.name);
          }

          if (registerSeries && registerSeries.data && registerSeries.data.length > 0) {
            totalUsers = registerSeries.data.reduce((sum, count) => sum + count, 0);
            console.log('📊 从series计算总用户数:', totalUsers, '来源系列:', registerSeries.name);
          }
        }
      }

      // 从series数据中获取今日新增用户数
      if (data.series && data.series.length > 0) {
        // 查找注册用户系列（支持多种可能的名称）
        let registerSeries = data.series.find(s =>
          s.name === '每日注册用户' ||
          s.name === '每周注册用户' ||
          s.name === '每月注册用户' ||
          s.name.includes('注册用户') ||
          s.name.includes('注册') ||
          s.name.includes('用户')
        );

        // 如果还是找不到，就取第一个系列
        if (!registerSeries && data.series.length > 0) {
          registerSeries = data.series[0];
          console.log('⚠️ 获取今日新增用户时未找到匹配的系列名称，使用第一个系列:', registerSeries.name);
        }

        if (registerSeries && registerSeries.data && registerSeries.data.length > 0) {
          // 今日新增用户（第一个数据点）
          todayNewUsers = registerSeries.data[0] || 0;
          console.log('📈 今日新增用户数:', todayNewUsers, '来源系列:', registerSeries.name);
        }
      }

      // 设置分析数据，totalUsers直接使用接口返回的total.user
      this.analysisData = {
        totalUsers: totalUsers, // 使用data/users-members接口返回的total.user
        todayNewUsers: todayNewUsers,
        activeUsers: Math.floor(totalUsers * 0.6), // 假设活跃用户为总用户的60%
        totalBalance: (totalUsers * 15.5).toFixed(2) // 假设平均余额15.5元
      };

      // 处理图表数据
      this.generateRegisterChartData(data);

      console.log('🎯 最终处理后的用户分析数据:', {
        analysisData: this.analysisData,
        registerChartData: this.registerChartData,
        totalFromAPI: data.total,
        totalUsersInAnalysisData: this.analysisData.totalUsers,
        totalUsersSource: data.total && data.total.user !== undefined ? 'total.user' : 'series计算'
      });

      // 强制触发页面更新
      this.$forceUpdate();
    },

    // 生成用户注册图表数据
    generateRegisterChartData(data) {
      console.log('🔄 生成用户注册图表数据，原始数据:', data);

      if (!data.categories || !data.series) {
        console.log('❌ 数据为空，使用默认数据');
        // 使用默认数据
        this.registerChartData = {
          categories: ["06-25", "06-24", "06-23", "06-22", "06-21", "06-20", "06-19"],
          series: [
            {
              name: "新增用户",
              data: [25, 32, 18, 28, 15, 42, 35]
            }
          ]
        };
        console.log('📊 使用默认用户注册图表数据:', this.registerChartData);
        return;
      }

      // 只取前15天的数据用于图表显示
      const categories = data.categories.slice(0, 15);

      // 构建系列数据
      const series = [];

      // 调试：查看所有系列的名称
      console.log('📋 所有用户系列数据:', data.series);
      data.series.forEach((s, index) => {
        console.log(`📊 用户系列${index}: name="${s.name}", data长度=${s.data ? s.data.length : 0}`);
      });

      // 查找注册用户系列（可能的名称：每日注册用户、每周注册用户、每月注册用户）
      let registerSeries = data.series.find(s =>
        s.name === '每日注册用户' ||
        s.name === '每周注册用户' ||
        s.name === '每月注册用户' ||
        s.name.includes('注册用户') ||
        s.name.includes('注册') ||
        s.name.includes('用户')
      );

      // 如果还是找不到，就取第一个系列
      if (!registerSeries && data.series.length > 0) {
        registerSeries = data.series[0];
        console.log('⚠️ 未找到匹配的用户系列名称，使用第一个系列:', registerSeries.name);
      }

      if (registerSeries && registerSeries.data) {
        series.push({
          name: "新增用户",
          data: registerSeries.data.slice(0, 15)
        });
        console.log('✅ 找到用户注册系列数据:', {
          原始名称: registerSeries.name,
          数据: registerSeries.data.slice(0, 15)
        });
      }

      // 如果没有有效的系列数据，使用默认数据
      if (series.length === 0) {
        console.log('❌ 没有有效的用户系列数据，使用默认数据');
        this.registerChartData = {
          categories: ["06-25", "06-24", "06-23", "06-22", "06-21", "06-20", "06-19"],
          series: [
            {
              name: "新增用户",
              data: [25, 32, 18, 28, 15, 42, 35]
            }
          ]
        };
      } else {
        this.registerChartData = {
          categories: categories,
          series: series
        };
      }

      console.log('🎯 最终用户注册图表数据:', this.registerChartData);

      // 强制触发图表更新
      this.$nextTick(() => {
        this.forceUserChartUpdate();
      });
    },

    // 强制刷新用户图表
    forceUserChartUpdate() {
      console.log('🔄 强制刷新用户注册图表');
      console.log('当前用户图表数据:', this.registerChartData);

      // 延迟一下确保DOM更新完成
      setTimeout(() => {
        // 通过改变数据引用来强制更新图表
        if (this.registerChartData && this.registerChartData.series) {
          this.registerChartData = { ...this.registerChartData };
          console.log('✅ 用户图表数据已更新');
        }
      }, 100);
    },



    // 切换用户注册图表时间类型
    changeRegisterTimeType(type) {
      if (this.registerTimeType === type) return;

      this.registerTimeType = type;
      console.log('🔄 切换用户注册图表时间类型:', type === 1 ? '日' : type === 2 ? '周' : '月');

      // 先清空图表数据，显示加载状态
      this.registerChartData = null;

      // 重新加载用户注册数据
      this.loadRegisterChartData(type);
    },



    // 加载用户注册图表数据
    async loadRegisterChartData(timeType) {
      try {
        // 构建请求参数
        const params = {
          type: timeType,
          data_type: "user",
          provider_id: [1],
          service_member_id: this.riderUserInfo.id,
          timestamp: Math.floor(Date.now() / 1000),
          sign: "chongchong"
        };

        const res = await this.$request('data/users-members', params, 'POST');

        console.log('🔍 时间切换-用户注册数据响应:', res);

        if (res.status === 'success' && res.data) {
          // 检查total字段在哪个层级
          let dataToProcess = res.data;

          // 如果res.data中没有total，但res中有total，则合并数据
          if (!res.data.total && res.total) {
            console.log('🔧 时间切换-total字段在res根级别，合并到data中');
            dataToProcess = {
              ...res.data,
              total: res.total
            };
          }

          this.generateRegisterChartData(dataToProcess);
        } else {
          uni.showToast({
            title: res.msg || '获取用户注册数据失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取用户注册数据失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    },



    // 用户注册图表点击事件
    getRegisterChartIndex(e) {
      console.log('用户注册图表点击:', e);
    },



    // 用户注册图表图例点击事件
    getRegisterLegendIndex(e) {
      console.log('用户注册图表图例点击:', e);
      
      if (e && e.currentIndex !== undefined && this.registerChartData.series) {
        const series = this.registerChartData.series[e.currentIndex];
        if (series) {
          series.show = series.show !== false ? false : true;
          this.registerChartData = { ...this.registerChartData };
          console.log(`${series.name} 系列已${series.show ? '显示' : '隐藏'}`);
        }
      }
    },


  }
}
</script>

<style lang="scss" scoped>
.user-analysis-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: "HarmonyOS Sans SC", "PingFang SC", sans-serif;
  color: #333;
  font-size: 28rpx;
  line-height: 1.5;
}

.nav-placeholder {
  width: 100%;
}

// 加载状态
.loading-container {
  padding: 100rpx 30rpx;
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
  font-size: 24rpx;
  color: #999;
}

// 分析内容
.analysis-content {
  padding: 20rpx;
}

// 统计卡片
.stats-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.stats-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #f0f0f0;

  .stats-title {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 12rpx;
    font-weight: 500;
  }

  .stats-value {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;

    &.amount {
      color: #ff6b35;
      font-size: 32rpx;
    }

    &.new-users {
      color: #52c41a;
    }

    &.active-users {
      color: #2492F2;
    }
  }
}

// 图表区域
.chart-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #f0f0f0;
  margin-bottom: 30rpx;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.chart-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.time-filter {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 20rpx;
  padding: 4rpx;
  border: 1rpx solid #e8e8e8;
}

.filter-item {
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  color: #666;
  border-radius: 16rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 40rpx;
  text-align: center;

  &:active {
    transform: scale(0.95);
  }

  &.active {
    background-color: #2492F2;
    color: #fff;
    font-weight: 500;
  }
}

.chart-container {
  width: 100%;
  height: 400rpx;
  margin-bottom: 20rpx;
  background-color: #fff;
  border-radius: 8rpx;
  overflow: hidden;
  position: relative;
}

.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 24rpx;
}
</style>
