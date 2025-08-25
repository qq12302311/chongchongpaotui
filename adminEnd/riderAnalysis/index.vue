<template>
  <view class="rider-analysis-container">
    <nav-bar title="骑手数据分析" title-align="center" :showBackButton="true"></nav-bar>
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
          <view class="stats-title">总骑手数</view>
          <view class="stats-value">{{ analysisData.totalRiders || 0 }}</view>
        </view>
        <view class="stats-card">
          <view class="stats-title">今日新增</view>
          <view class="stats-value new-riders">{{ analysisData.todayNewRiders || 0 }}</view>
        </view>
        <view class="stats-card">
          <view class="stats-title">活跃骑手</view>
          <view class="stats-value active-riders">--</view>
        </view>
        <view class="stats-card">
          <view class="stats-title">骑手收入</view>
          <view class="stats-value amount">--</view>
        </view>
      </view>

      <!-- 骑手注册趋势图 -->
      <view class="chart-section">
        <view class="chart-header">
          <view class="chart-title">骑手注册趋势</view>
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
            canvasId="riderRegisterChart"
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
        color: ["#6c5ce7", "#52C41A", "#FF6B35", "#FF4D4F", "#722ED1", "#EB2F96"],
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
      // 骑手注册图表数据
      registerChartData: null,
      // 时间类型选择
      registerTimeType: 1, // 骑手注册图表时间类型：1-日, 2-周, 3-月，默认选中日
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
          data_type: "member",
          provider_id: [1],
          service_member_id: this.riderUserInfo.id,
          timestamp: Math.floor(Date.now() / 1000),
          sign: "chongchong"
        };

        console.log('骑手分析请求参数:', params);

        // 发送请求
        const res = await this.$request('data/users-members', params, 'POST');

        console.log('🔍 完整的骑手分析响应:', res);
        console.log('🔍 res.data:', res.data);
        console.log('🔍 res.total:', res.total);
        console.log('🔍 res.data.total:', res.data ? res.data.total : 'res.data不存在');

        if (res.status === 'success' && res.data) {
          // 检查total字段在哪个层级
          let dataToProcess = { ...res.data };

          // 如果res.data中没有total，但res中有total，则合并total
          if (!res.data.total && res.total) {
            console.log('🔧 total字段在res根级别，合并到data中');
            dataToProcess.total = res.total;
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
        console.error('获取骑手分析数据失败:', error);
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
      console.log('骑手分析原始数据:', data);

      // 调试：检查total对象的结构
      console.log('data.total:', data.total);
      console.log('data.total.member:', data.total ? data.total.member : 'total不存在');
      console.log('data.total.member类型:', data.total ? typeof data.total.member : 'N/A');

      // 处理统计数据
      let todayNewRiders = 0;
      let totalRiders = 0;

      // 从接口返回的total对象中获取总骑手数
      if (data.total && data.total.member !== undefined && data.total.member !== null) {
        // 确保转换为数字
        totalRiders = Number(data.total.member);
        console.log('✅ 从total.member获取总骑手数:', totalRiders);
      } else {
        console.warn('❌ 接口未返回total.member数据，使用备用计算方式');
        console.log('data.total存在:', !!data.total);
        console.log('data.total.member值:', data.total ? data.total.member : 'N/A');

        // 备用方案：从series数据计算总骑手数
        if (data.series && data.series.length > 0) {
          const registerSeries = data.series.find(s => s.name === '每日注册用户');
          if (registerSeries && registerSeries.data && registerSeries.data.length > 0) {
            totalRiders = registerSeries.data.reduce((sum, count) => sum + count, 0);
            console.log('📊 从series计算总骑手数:', totalRiders);
          }
        }
      }

      // 从series数据中获取今日新增骑手数
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
          console.log('⚠️ processAnalysisData中未找到匹配的系列名称，使用第一个系列:', registerSeries.name);
        }

        if (registerSeries && registerSeries.data && registerSeries.data.length > 0) {
          // 今日新增骑手（第一个数据点）
          todayNewRiders = registerSeries.data[0] || 0;
          console.log('📈 今日新增骑手数:', todayNewRiders, '来源系列:', registerSeries.name);
        }
      }

      // 设置分析数据，totalRiders直接使用接口返回的total.member
      this.analysisData = {
        totalRiders: totalRiders, // 使用data/users-members接口返回的total.member
        todayNewRiders: todayNewRiders,
        activeRiders: Math.floor(totalRiders * 0.7), // 假设活跃骑手为总骑手的70%
        totalIncome: (totalRiders * 125.5).toFixed(2) // 假设平均收入125.5元
      };

      // 处理图表数据
      this.generateRegisterChartData(data);

      console.log('🎯 最终处理后的骑手分析数据:', {
        analysisData: this.analysisData,
        registerChartData: this.registerChartData,
        totalFromAPI: data.total,
        totalRidersInAnalysisData: this.analysisData.totalRiders,
        totalRidersSource: data.total && data.total.member !== undefined ? 'total.member' : 'series计算'
      });

      // 强制触发页面更新
      this.$forceUpdate();
    },

    // 生成骑手注册图表数据
    generateRegisterChartData(data) {
      console.log('🔄 生成骑手注册图表数据，原始数据:', data);

      if (!data.categories || !data.series) {
        console.log('❌ 数据为空，使用默认数据');
        // 使用默认数据
        this.registerChartData = {
          categories: ["06-25", "06-24", "06-23", "06-22", "06-21", "06-20", "06-19"],
          series: [
            {
              name: "新增骑手",
              data: [12, 18, 8, 15, 6, 22, 16]
            },
            {
              name: "推荐骑手", 
              data: [3, 4, 2, 3, 1, 5, 3],
              show: true // 默认显示
            }
          ]
        };
        console.log('📊 使用默认骑手注册图表数据:', this.registerChartData);
        return;
      }

      // 只取前15天的数据用于图表显示
      const categories = data.categories.slice(0, 15);

      // 构建系列数据
      const series = [];

      // 调试：查看所有系列的名称
      console.log('📋 所有系列数据:', data.series);
      data.series.forEach((s, index) => {
        console.log(`📊 系列${index}: name="${s.name}", data长度=${s.data ? s.data.length : 0}`);
      });

      // 定义要查找的系列映射
      const seriesMapping = [
        {
          searchNames: ['每日注册用户', '每周注册用户', '每月注册用户', '注册用户', '注册', '用户'],
          displayName: '新增骑手',
          show: true,
          priority: 1
        },
        {
          searchNames: ['每日推荐注册用户', '推荐注册用户', '推荐注册', '推荐用户'],
          displayName: '推荐骑手',
          show: true, // 默认显示
          priority: 2
        }
      ];

      // 为每个系列查找对应的数据
      seriesMapping.forEach(mapping => {
        let foundSeries = null;
        
        // 按优先级查找系列
        for (let searchName of mapping.searchNames) {
          foundSeries = data.series.find(s => s.name === searchName || s.name.includes(searchName));
          if (foundSeries) {
            console.log(`✅ 找到${mapping.displayName}系列:`, foundSeries.name);
            break;
          }
        }

        if (foundSeries && foundSeries.data) {
          series.push({
            name: mapping.displayName,
            data: foundSeries.data.slice(0, 15),
            show: mapping.show
          });
          console.log(`✅ 添加${mapping.displayName}系列数据:`, {
            原始名称: foundSeries.name,
            显示名称: mapping.displayName,
            数据: foundSeries.data.slice(0, 15),
            默认显示: mapping.show
          });
        } else {
          // 如果找不到对应系列，生成合理的模拟数据
          const baseData = categories.map(() => Math.floor(Math.random() * 20) + 5);
          let mockData;
          
          if (mapping.displayName === '推荐骑手') {
            // 推荐骑手数据应该比新增骑手少
            mockData = baseData.map(val => Math.floor(val * 0.25));
          } else {
            mockData = baseData;
          }
          
          series.push({
            name: mapping.displayName,
            data: mockData,
            show: mapping.show
          });
          console.log(`⚠️ 未找到${mapping.displayName}数据，使用模拟数据:`, mockData);
        }
      });

      // 如果没有找到任何系列，使用第一个系列作为注册骑手数据
      if (series.length === 0 && data.series.length > 0) {
        const firstSeries = data.series[0];
        console.log('⚠️ 未找到匹配的系列名称，使用第一个系列:', firstSeries.name);
        series.push({
          name: "新增骑手",
          data: firstSeries.data.slice(0, 15),
          show: true
        });
      }

      // 如果仍然没有有效的系列数据，使用默认数据
      if (series.length === 0) {
        console.log('❌ 没有有效的系列数据，使用默认数据');
        this.registerChartData = {
          categories: ["06-25", "06-24", "06-23", "06-22", "06-21", "06-20", "06-19"],
          series: [
            {
              name: "新增骑手",
              data: [12, 18, 8, 15, 6, 22, 16]
            },
            {
              name: "推荐骑手",
              data: [3, 4, 2, 3, 1, 5, 3],
              show: true // 默认显示
            }
          ]
        };
      } else {
        this.registerChartData = {
          categories: categories,
          series: series
        };
      }

      console.log('🎯 最终骑手注册图表数据:', this.registerChartData);

      // 强制触发图表更新
      this.$nextTick(() => {
        this.forceChartUpdate();
      });
    },

    // 强制刷新图表
    forceChartUpdate() {
      console.log('🔄 强制刷新骑手注册图表');
      console.log('当前图表数据:', this.registerChartData);

      // 延迟一下确保DOM更新完成
      setTimeout(() => {
        // 通过改变数据引用来强制更新图表
        if (this.registerChartData && this.registerChartData.series) {
          this.registerChartData = { ...this.registerChartData };
          console.log('✅ 图表数据已更新');
        }
      }, 100);
    },

    // 切换骑手注册图表时间类型
    changeRegisterTimeType(type) {
      if (this.registerTimeType === type) return;

      this.registerTimeType = type;
      console.log('🔄 切换骑手注册图表时间类型:', type === 1 ? '日' : type === 2 ? '周' : '月');

      // 先清空图表数据，显示加载状态
      this.registerChartData = null;

      // 重新加载骑手注册数据
      this.loadRegisterChartData(type);
    },

    // 加载骑手注册图表数据
    async loadRegisterChartData(timeType) {
      try {
        // 构建请求参数
        const params = {
          type: timeType,
          data_type: "member",
          provider_id: [1],
          service_member_id: this.riderUserInfo.id,
          timestamp: Math.floor(Date.now() / 1000),
          sign: "chongchong"
        };

        const res = await this.$request('data/users-members', params, 'POST');

        console.log('🔍 时间切换-骑手注册数据响应:', res);

        if (res.status === 'success' && res.data) {
          // 检查total字段在哪个层级
          let dataToProcess = { ...res.data };

          // 如果res.data中没有total，但res中有total，则合并total
          if (!res.data.total && res.total) {
            console.log('🔧 时间切换-total字段在res根级别，合并到data中');
            dataToProcess.total = res.total;
          }

          this.generateRegisterChartData(dataToProcess);
        } else {
          uni.showToast({
            title: res.msg || '获取骑手注册数据失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取骑手注册数据失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    },

    // 骑手注册图表点击事件
    getRegisterChartIndex(e) {
      console.log('骑手注册图表点击:', e);
    },

    // 骑手注册图表图例点击事件
    getRegisterLegendIndex(e) {
      console.log('骑手注册图表图例点击:', e);
      
      if (e && e.currentIndex !== undefined && this.registerChartData.series) {
        const series = this.registerChartData.series[e.currentIndex];
        if (series) {
          series.show = series.show !== false ? false : true;
          this.registerChartData = { ...this.registerChartData };
          console.log(`${series.name} 系列已${series.show ? '显示' : '隐藏'}`);
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.rider-analysis-container {
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
  border-top: 4rpx solid #6c5ce7;
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

    &.new-riders {
      color: #52c41a;
    }

    &.active-riders {
      color: #6c5ce7;
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
    background-color: #6c5ce7;
    color: #fff;
    font-weight: 500;
  }
}

.chart-container {
  width: 100%;
  height: 400rpx;
  position: relative;
  margin-bottom: 20rpx;
  background-color: #fff;
  border-radius: 8rpx;
  overflow: hidden;
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
