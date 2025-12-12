<template>
  <view class="order-analysis-container">
    <nav-bar title="订单数据分析" title-align="center" :showBackButton="true"></nav-bar>
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
          <view class="stats-title">今日订单</view>
          <view class="stats-value">{{ analysisData.total || 0 }}</view>
        </view>
        <view class="stats-card">
          <view class="stats-title">今日金额</view>
          <view class="stats-value amount">¥{{ analysisData.todayAmount || '0.00' }}</view>
        </view>
        <view class="stats-card">
          <view class="stats-title">补宝订单</view>
          <view class="stats-value processing">{{ analysisData.processing || 0 }}</view>
        </view>
        <view class="stats-card">
          <view class="stats-title">异常订单</view>
          <view class="stats-value canceled">{{ analysisData.canceled || 0 }}</view>
        </view>
      </view>

      <!-- 订单数量折线图 -->
      <view class="chart-section">
        <view class="chart-title">订单数量趋势</view>
        <view class="chart-container">
          <qiun-data-charts
            type="line"
			:opts="countOpts"
            :chartData="countChartData"
			 :ontouch="true"
            :canvas2d="true"
            canvasId="nohzgpwsTPGyLhgTHwDuSAwcNPsdkYGC"
          />
        </view>
        <!-- 显示点击的数据 -->
        <!-- <view v-if="countClickData.show" class="click-data-info">
          <text class="click-data-text">{{ countClickData.category }}: {{ countClickData.series }} = {{ countClickData.value }}</text>
        </view> -->




        <!-- categories数据展示 -->
        <!-- <view class="categories-section">
          <view class="categories-title">时间范围</view>
          <scroll-view class="categories-scroll" scroll-x="true">
            <view class="categories-list">
              <view
                class="category-item"
                v-for="(category, index) in countChartData.categories"
                :key="index"
                :class="{ active: index === selectedCountIndex }"
                @click="selectCountCategory(index)"
              >
                {{ category }}
              </view>
            </view>
          </scroll-view>
        </view> -->
      </view>

      <!-- 订单金额折线图 -->
      <view class="chart-section">
        <view class="chart-title">订单金额趋势</view>
        <view class="chart-container">
          <qiun-data-charts
            type="line"
			:opts="countOpts"
            :chartData="amountChartData"
			 :ontouch="true"
            :canvas2d="true"
            canvasId="amountChart"
          />
         <!-- <qiun-data-charts
            type="line"
            :opts="amountChartOpts"
            :chartData="amountChartData"
            :onTouch="true"
            :tapLegend="true"
            :tooltipShow="true"
            :tooltipFormat="amountTooltipFormat"
            :tooltipCustom="amountTooltipCustom"
            @getIndex="getAmountChartIndex"
            @getTouchStart="getAmountTouchStart"
            @getTouchMove="getAmountTouchMove"
            @getTouchEnd="getAmountTouchEnd"
            @tapLegend="getAmountLegendIndex"
            :canvas2d="true"
            canvasId="amountChart"
            background="none"
            :animation="true"
            :startInAnimation="true"
          /> -->
        </view>
        <!-- 显示点击的数据 -->
        <!-- <view v-if="amountClickData.show" class="click-data-info">
          <text class="click-data-text">{{ amountClickData.category }}: {{ amountClickData.series }} = ¥{{ amountClickData.value }}</text>
        </view> -->


        <!-- categories数据展示 -->
       <!-- <view class="categories-section">
          <view class="categories-title">时间范围</view>
          <scroll-view class="categories-scroll" scroll-x="true">
            <view class="categories-list">
              <view
                class="category-item"
                v-for="(category, index) in amountChartData.categories"
                :key="index"
                :class="{ active: index === selectedAmountIndex }"
                @click="selectAmountCategory(index)"
              >
                {{ category }}
              </view>
            </view>
          </scroll-view>
        </view> -->
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
		countOpts:{
        color: ["#1890FF","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
        padding: [15,10,0,15],
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
		  tooltip: {
		      show: true, // 必须开启
		      triggerOn: 'touch', // 可选：'click'（点击触发）或 'touch'（触摸触发）
		    }
        },
		},
      navBarHeight: 0,
      loading: false,
      analysisData: {},
      chartData: [],
      maxValue: 0,
      riderUserInfo: null,
      // 订单数量图表数据
      countChartData: {},
      // 订单金额图表数据
      amountChartData: {},
      // 订单数量图表配置
      countChartOpts: {
        color: ["#2492F2", "#FF6B35", "#FF4D4F"]
      },
      // 订单金额图表配置
      amountChartOpts: {
        color: ["#52C41A", "#FF6B35", "#FF4D4F"]
      },
      // 点击数据显示
      countClickData: {
        show: false,
        category: '',
        series: '',
        value: 0
      },
      amountClickData: {
        show: false,
        category: '',
        series: '',
        value: 0
      },
      // 选中的分类索引
      selectedCountIndex: -1,
      selectedAmountIndex: -1,
      // 控制图表显示
      showChart: false,
      // Tooltip配置
      countTooltipFormat: null,
      countTooltipCustom: null,
      amountTooltipFormat: null,
      amountTooltipCustom: null,

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


    // 延迟初始化数据和显示图表
    // setTimeout(() => {
    //   this.initDefaultData();
    //   this.$nextTick(() => {
    //     this.showChart = true;
    //   });
    // }, 100);

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

        // 构建请求参数
        const params = {
          type: 1,
          provider_id: this.riderUserInfo.provider_id || 1,
          service_member_id: this.riderUserInfo.id,
          timestamp: Math.floor(Date.now() / 1000),
          sign: "chongchong"
        };

        console.log('请求参数:', params);

        // 发送请求
        const res = await this.$request('data/tasks', params, 'POST');

        console.log('分析数据响应:', res);

        if (res.code === 200 && res.data) {
          this.processAnalysisData(res.data);
        } else {
          uni.showToast({
            title: res.msg || '获取数据失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取分析数据失败:', error);
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
      console.log('原始数据:', data);

      // 处理统计数据 - 使用countData中的总数系列数据
      if (data.countData && data.countData.series && data.countData.series.length > 0) {
        const totalSeries = data.countData.series.find(s => s.name === '总数');
        const bubaooSeries = data.countData.series.find(s => s.name === '补宝');
        const exceptionSeries = data.countData.series.find(s => s.name === '异常');

        // 计算总数（今日数据，取第一个值）
        const todayTotal = totalSeries && totalSeries.data && totalSeries.data.length > 0 ? totalSeries.data[0] : 0;
        const todayBubao = bubaooSeries && bubaooSeries.data && bubaooSeries.data.length > 0 ? bubaooSeries.data[0] : 0;
        const todayException = exceptionSeries && exceptionSeries.data && exceptionSeries.data.length > 0 ? exceptionSeries.data[0] : 0;

        // 获取今日金额数据
        let todayAmount = '0.00';
        if (data.amountData && data.amountData.series && data.amountData.series.length > 0) {
          const amountTotalSeries = data.amountData.series.find(s => s.name === '总额');
          if (amountTotalSeries && amountTotalSeries.data && amountTotalSeries.data.length > 0) {
            todayAmount = (amountTotalSeries.data[0] || 0).toFixed(2);
          }
        }

        this.analysisData = {
          total: todayTotal,
          todayAmount: todayAmount,
          completed: todayTotal - todayException, // 完成数 = 总数 - 异常数
          processing: todayBubao, // 进行中（补宝）
          canceled: todayException // 已取消（异常）
        };
      } else {
        this.analysisData = {
          total: 0,
          todayAmount: '0.00',
          completed: 0,
          processing: 0,
          canceled: 0
        };
      }

      // 处理图表数据
      this.generateCountChartData(data);
      this.generateAmountChartData(data);

      console.log('处理后的数据:', {
        analysisData: this.analysisData,
        chartData: this.chartData,
        maxValue: this.maxValue
      });
    },

    // 生成订单数量图表数据
    generateCountChartData(data) {
      console.log('生成订单数量图表数据，原始数据:', data);

      if (!data.countData || !data.countData.categories || !data.countData.series) {
        console.log('数据为空，使用默认数据');
        // 使用默认数据
        this.countChartData = {
          categories: ["06-25", "06-24", "06-23", "06-22", "06-21", "06-20", "06-19"],
          series: [
            {
              name: "总订单",
              data: [150, 132, 101, 134, 90, 230, 210]
            },
            {
              name: "补宝订单",
              data: [100, 98, 80, 90, 56, 120, 110]
            },
            {
              name: "异常订单",
              data: [25, 30, 32, 35, 27, 40, 38]
            }
          ]
        };
        return;
      }

      // 只取前15天的数据用于图表显示
      const categories = data.countData.categories.slice(0, 15);

      // 构建系列数据
      const series = [];

      // 总数系列
      const totalSeries = data.countData.series.find(s => s.name === '总数');
      if (totalSeries && totalSeries.data) {
        series.push({
          name: "总订单",
          data: totalSeries.data.slice(0, 15)
        });
      }

      // 补宝系列
      const bubaoSeries = data.countData.series.find(s => s.name === '补宝');
      if (bubaoSeries && bubaoSeries.data) {
        series.push({
          name: "补宝订单",
          data: bubaoSeries.data.slice(0, 15)
        });
      }

      // 异常系列
      const exceptionSeries = data.countData.series.find(s => s.name === '异常');
      if (exceptionSeries && exceptionSeries.data) {
        series.push({
          name: "异常订单",
          data: exceptionSeries.data.slice(0, 15)
        });
      }

      // 如果没有有效的系列数据，使用默认数据
      if (series.length === 0) {
        console.log('没有有效的系列数据，使用默认数据');
        this.countChartData = {
          categories: ["06-25", "06-24", "06-23", "06-22", "06-21", "06-20", "06-19"],
          series: [
            {
              name: "总订单",
              data: [150, 132, 101, 134, 90, 230, 210]
            },
            {
              name: "补宝订单",
              data: [100, 98, 80, 90, 56, 120, 110]
            },
            {
              name: "异常订单",
              data: [25, 30, 32, 35, 27, 40, 38]
            }
          ]
        };
      } else {
        this.countChartData = {
          categories: categories,
          series: series
        };
      }

      console.log('订单数量图表数据:', this.countChartData);
    },

    // 生成订单金额图表数据
    generateAmountChartData(data) {
      console.log('生成订单金额图表数据，原始数据:', data);

      if (!data.amountData || !data.amountData.categories || !data.amountData.series) {
        console.log('金额数据为空，使用默认数据');
        // 使用默认数据
        this.amountChartData = {
          categories: ["06-25", "06-24", "06-23", "06-22", "06-21", "06-20", "06-19"],
          series: [
            {
              name: "总金额",
              data: [1500.50, 1320.80, 1010.30, 1340.60, 900.20, 2300.90, 2100.40]
            },
            {
              name: "补宝金额",
              data: [1000.30, 980.60, 800.20, 900.40, 560.10, 1200.70, 1100.50]
            },
            {
              name: "异常金额",
              data: [250.20, 300.40, 320.60, 350.80, 270.30, 400.90, 380.70]
            }
          ]
        };
        return;
      }

      // 只取前15天的数据用于图表显示
      const categories = data.amountData.categories.slice(0, 15);

      // 构建系列数据
      const series = [];

      // 总额系列
      const totalSeries = data.amountData.series.find(s => s.name === '总额');
      if (totalSeries && totalSeries.data) {
        series.push({
          name: "总金额",
          data: totalSeries.data.slice(0, 15)
        });
      }

      // 补宝系列
      const bubaoSeries = data.amountData.series.find(s => s.name === '补宝');
      if (bubaoSeries && bubaoSeries.data) {
        series.push({
          name: "补宝金额",
          data: bubaoSeries.data.slice(0, 15)
        });
      }

      // 异常系列
      const exceptionSeries = data.amountData.series.find(s => s.name === '异常');
      if (exceptionSeries && exceptionSeries.data) {
        series.push({
          name: "异常金额",
          data: exceptionSeries.data.slice(0, 15)
        });
      }

      // 如果没有有效的系列数据，使用默认数据
      if (series.length === 0) {
        console.log('没有有效的金额系列数据，使用默认数据');
        this.amountChartData = {
          categories: ["06-25", "06-24", "06-23", "06-22", "06-21", "06-20", "06-19"],
          series: [
            {
              name: "总金额",
              data: [1500.50, 1320.80, 1010.30, 1340.60, 900.20, 2300.90, 2100.40]
            },
            {
              name: "补宝金额",
              data: [1000.30, 980.60, 800.20, 900.40, 560.10, 1200.70, 1100.50]
            },
            {
              name: "异常金额",
              data: [250.20, 300.40, 320.60, 350.80, 270.30, 400.90, 380.70]
            }
          ]
        };
      } else {
        this.amountChartData = {
          categories: categories,
          series: series
        };
      }

      console.log('订单金额图表数据:', this.amountChartData);
    },

    // 订单数量图表点击事件
    getCountChartIndex(e) {
      console.log('订单数量图表点击:', e);
    },

    // 订单金额图表点击事件
    getAmountChartIndex(e) {
      console.log('订单金额图表点击:', e);
    },

    // 订单数量图表触摸开始
    getCountTouchStart(e) {
      console.log('订单数量图表触摸开始:', e);
    },

    // 订单数量图表触摸移动
    getCountTouchMove(e) {
      console.log('订单数量图表触摸移动:', e);
      // 在移动时显示tooltip
      if (e.currentIndex !== undefined && this.countChartData.categories) {
        const category = this.countChartData.categories[e.currentIndex];
        const series = this.countChartData.series[e.currentSeries || 0];
        if (category && series) {
          this.countClickData.show = true;
          this.countClickData.category = category;
          this.countClickData.series = series.name;
          this.countClickData.value = series.data[e.currentIndex];
        }
      }
    },

    // 订单数量图表触摸结束
    getCountTouchEnd(e) {
      console.log('订单数量图表触摸结束:', e);
      // 延迟隐藏tooltip
      setTimeout(() => {
        this.countClickData.show = false;
      }, 2000);
    },

    // 订单金额图表触摸开始
    getAmountTouchStart(e) {
      console.log('订单金额图表触摸开始:', e);
    },

    // 订单金额图表触摸移动
    getAmountTouchMove(e) {
      console.log('订单金额图表触摸移动:', e);
      // 在移动时显示tooltip
      if (e.currentIndex !== undefined && this.amountChartData.categories) {
        const category = this.amountChartData.categories[e.currentIndex];
        const series = this.amountChartData.series[e.currentSeries || 0];
        if (category && series) {
          this.amountClickData.show = true;
          this.amountClickData.category = category;
          this.amountClickData.series = series.name;
          this.amountClickData.value = series.data[e.currentIndex];
        }
      }
    },

    // 订单金额图表触摸结束
    getAmountTouchEnd(e) {
      console.log('订单金额图表触摸结束:', e);
      // 延迟隐藏tooltip
      setTimeout(() => {
        this.amountClickData.show = false;
      }, 2000);
    },

    // 选择订单数量分类
    selectCountCategory(index) {
      this.selectedCountIndex = index;
      if (this.countChartData.categories[index]) {
        uni.showToast({
          title: `选中: ${this.countChartData.categories[index]}`,
          icon: 'none',
          duration: 1500
        });
      }
    },

    // 选择订单金额分类
    selectAmountCategory(index) {
      this.selectedAmountIndex = index;
      if (this.amountChartData.categories[index]) {
        uni.showToast({
          title: `选中: ${this.amountChartData.categories[index]}`,
          icon: 'none',
          duration: 1500
        });
      }
    },

    // 订单数量图表图例点击事件
    getCountLegendIndex(e) {
      console.log('订单数量图表图例点击:', e);
      // uCharts官方的图例点击会自动处理显示/隐藏逻辑
      // 这里只需要处理额外的业务逻辑即可
    },

    // 订单金额图表图例点击事件
    getAmountLegendIndex(e) {
      console.log('订单金额图表图例点击:', e);
      // uCharts官方的图例点击会自动处理显示/隐藏逻辑
      // 这里只需要处理额外的业务逻辑即可
    }


  }
}
</script>
<style lang="scss" scoped>
	.charts-box {
	    width: 100%;
	    height: 300px;
	  }
.order-analysis-container {
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

    &.completed {
      color: #52c41a;
    }

    &.processing {
      color: #1890ff;
    }

    &.canceled {
      color: #ff4d4f;
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
}

.chart-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;
  text-align: center;
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

// 点击数据显示
.click-data-info {
  padding: 10rpx 20rpx;
  background-color: rgba(36, 146, 242, 0.1);
  border-radius: 8rpx;
  margin: 10rpx 0;
  border-left: 4rpx solid #2492F2;
}

.click-data-text {
  font-size: 24rpx;
  color: #2492F2;
  font-weight: 500;
}

// categories展示区域
.categories-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.categories-title {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.categories-scroll {
  width: 100%;
  white-space: nowrap;
}

.categories-list {
  display: flex;
  gap: 10rpx;
  padding: 5rpx 0;
}

.category-item {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  background-color: #f8f9fa;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #666;
  border: 1rpx solid #e8e8e8;
  transition: all 0.3s ease;
  cursor: pointer;

  &:active {
    transform: scale(0.95);
  }

  &.active {
    background-color: #2492F2;
    color: #fff;
    border-color: #2492F2;
    font-weight: 500;
  }
}


</style>