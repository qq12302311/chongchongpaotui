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
          <view class="stats-title">完单</view>
          <view class="stats-value completed">{{ analysisData.completed || 0 }}</view>
        </view>
        <view class="stats-card">
          <view class="stats-title">收宝订单</view>
          <view class="stats-value shoubao">{{ analysisData.shoubao || 0 }}</view>
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

      <!-- 分段器 -->
      <view class="segmented-control">
        <view class="segmented-container">
          <view 
            class="segment-item"
            :class="{ active: currentTab === 'trend' }"
            @click="switchTab('trend')"
          >
            订单趋势
          </view>
          <view 
            class="segment-item"
            :class="{ active: currentTab === 'ranking' }"
            @click="switchTab('ranking')"
          >
            订单排行榜
          </view>
        </view>
      </view>

      <!-- 订单趋势内容 -->
      <view v-if="currentTab === 'trend'" class="trend-content">
        <!-- 订单数量折线图 -->
      <view class="chart-section">
        <view class="chart-header">
          <view class="chart-title">订单数量趋势</view>
          <view class="time-filter">
            <view
              class="filter-item"
              :class="{ active: countTimeType === 1 }"
              @click="changeCountTimeType(1)"
            >日</view>
            <view
              class="filter-item"
              :class="{ active: countTimeType === 2 }"
              @click="changeCountTimeType(2)"
            >周</view>
            <view
              class="filter-item"
              :class="{ active: countTimeType === 3 }"
              @click="changeCountTimeType(3)"
            >月</view>
          </view>
        </view>
        <view class="chart-container">
          <qiun-data-charts
            v-if="countChartData && countChartData.series && countChartData.series.length > 0"
            type="line"
			:opts="countOpts"
            :chartData="countChartData"
			:ontouch="true"
			:tapLegend="true"
			:tooltipShow="true"
            :canvas2d="true"
            canvasId="orderCountChart"
            @getIndex="getCountChartIndex"
            @getTouchStart="getCountTouchStart"
            @getTouchMove="getCountTouchMove"
            @getTouchEnd="getCountTouchEnd"
            @getLegendIndex="getCountLegendIndex"
          />
          <view v-else class="chart-loading">
            <text>图表加载中...</text>
          </view>
        </view>




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
        <view class="chart-header">
          <view class="chart-title">订单金额趋势</view>
          <view class="time-filter">
            <view
              class="filter-item"
              :class="{ active: amountTimeType === 1 }"
              @click="changeAmountTimeType(1)"
            >日</view>
            <view
              class="filter-item"
              :class="{ active: amountTimeType === 2 }"
              @click="changeAmountTimeType(2)"
            >周</view>
            <view
              class="filter-item"
              :class="{ active: amountTimeType === 3 }"
              @click="changeAmountTimeType(3)"
            >月</view>
          </view>
        </view>
        <view class="chart-container">
          <qiun-data-charts
            v-if="amountChartData && amountChartData.series && amountChartData.series.length > 0"
            type="line"
			:opts="countOpts"
            :chartData="amountChartData"
			:ontouch="true"
			:tapLegend="true"
			:tooltipShow="true"
            :canvas2d="true"
            canvasId="orderAmountChart"
            @getIndex="getAmountChartIndex"
            @getTouchStart="getAmountTouchStart"
            @getTouchMove="getAmountTouchMove"
            @getTouchEnd="getAmountTouchEnd"
            @getLegendIndex="getAmountLegendIndex"
          />
          <view v-else class="chart-loading">
            <text>图表加载中...</text>
          </view>
        </view>


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

      </view> <!-- 结束订单趋势内容 -->

      <!-- 订单排行榜内容 -->
      <view v-if="currentTab === 'ranking'" class="ranking-content">
        <!-- 行政区域任务数量排名 -->
      <view class="ranking-section">
        <view class="ranking-header">
          <view class="ranking-title">行政区域任务数量排名</view>
          <view class="region-filter">
            <view 
              class="filter-item" 
              :class="{ active: regionType === 'province' }"
              @click="changeRegionType('province')"
            >省份</view>
            <view 
              class="filter-item" 
              :class="{ active: regionType === 'city' }"
              @click="changeRegionType('city')"
            >城市</view>
            <view 
              class="filter-item" 
              :class="{ active: regionType === 'district' }"
              @click="changeRegionType('district')"
            >区县</view>
          </view>
        </view>
        <view class="ranking-container">
          <view v-if="regionRankingLoading" class="ranking-loading">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载中...</text>
          </view>
          <view v-else-if="regionRankingData && regionRankingData.length > 0" class="ranking-list">
            <view class="ranking-table">
              <view class="table-header">
                <view class="header-cell rank">排名</view>
                <view class="header-cell region-name">地区</view>
                <view class="header-cell task-count">任务数</view>
                <view class="header-cell percentage">占比(%)</view>
              </view>
              <view class="table-body">
                <view 
                  v-for="(item, index) in regionRankingData" 
                  :key="index" 
                  class="table-row"
                  :class="{ 'top-three': index < 3 }"
                >
                  <view class="table-cell rank">
                    <view class="rank-number" :class="index === 0 ? 'rank-first' : index === 1 ? 'rank-second' : index === 2 ? 'rank-third' : 'rank-normal'">
                      {{ index + 1 }}
                    </view>
                  </view>
                  <view class="table-cell region-name">{{ item.region_name || '--' }}</view>
                  <view class="table-cell task-count">{{ item.task_count || 0 }}</view>
                  <view class="table-cell percentage">{{ formatPercentage(item.percentage) }}%</view>
                </view>
              </view>
            </view>
          </view>
          <view v-else class="ranking-empty">
            <text>暂无排名数据</text>
          </view>
        </view>
      </view>

      </view> <!-- 结束订单排行榜内容 -->

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
        color: ["#1890FF","#91CB74","#FAC858","#EE6666","#FF7F50","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
        padding: [15,10,0,15],
        enableScroll: true,
        legend: {
		},
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
            type: "curve",
            width: 2,
            activeType: "hollow",
			linearType: "custom"
          },
        },
		},
		
		// countOpts: {
		// 	fontSize: 10,
		// 	color: ["#FC8452", "#448DFF", "#00D364", "#FFB608", "#6812FF", "#FF3D37", "#F912FF", "#73C0DE"],
		// 	padding: [15, 0, 0, 0],
		// 	enableScroll: true,
		// 	legend: {
		// 		position: "top",
		// 		float: 'left',
		// 		lineHeight: 20,
		// 	},
		// 	xAxis: {
		// 		disableGrid: true,
		// 		scrollShow: true,
		// 		itemCount: 8
		// 	},
		// 	yAxis: {
		// 		gridType: "dash",
		// 		dashLength: 2,
		// 		// data: [{
		// 		// 	min: 0
		// 		// }]
		// 	},
		// 	extra: {
		// 		line: {
		// 			type: "curve",
		// 			width: 2,
		// 			activeType: "hollow",
		// 			linearType: "custom"
		// 		}
		// 	}
		// },
      navBarHeight: 0,
      loading: false,
      analysisData: {},
      chartData: [],
      maxValue: 0,
      riderUserInfo: null,
      // 订单数量图表数据
      countChartData: null,
      // 订单金额图表数据
      amountChartData: null,
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
      // 时间类型选择
      countTimeType: 1, // 订单数量图表时间类型：1-日, 2-周, 3-月，默认选中日
      amountTimeType: 1, // 订单金额图表时间类型：1-日, 2-周, 3-月，默认选中日
      // 行政区域任务数量排名相关
      regionRankingData: null,
      regionRankingLoading: false,
      regionType: 'city', // 默认城市类型
      currentParentRegionId: 5, // 当前父级地区ID，默认为5
      // 分段器控制
      currentTab: 'trend' // 默认显示订单趋势

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

    // 延迟加载数据，确保DOM完全渲染
    this.$nextTick(() => {
      setTimeout(() => {
        this.loadAnalysisData();
        // 加载行政区域任务排名数据
        this.loadRegionTaskRankingData();
      }, 300);
    });
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
          provider_id: this.riderUserInfo.provider_id || 1,
          service_member_id: this.riderUserInfo.id,
          timestamp: Math.floor(Date.now() / 1000),
          sign: "chongchong"
        };

        console.log('请求参数:', params);

        // 发送请求
        const res = await this.$request('data/tasks', params, 'POST');

        console.log('分析数据响应:', res);

        if ((res.code === 200 || res.code === "200") && res.data) {
          this.processAnalysisData(res.data);
        } else {
          console.error('❌ 主数据加载失败:', res);
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
        // 调试：查看所有系列的名称和数据
        console.log('📋 统计数据所有系列:', data.countData.series);
        data.countData.series.forEach((s, index) => {
          console.log(`📊 统计系列${index}: name="${s.name}", 今日数据=${s.data && s.data.length > 0 ? s.data[0] : 'N/A'}`);
        });

        // 查找总数系列（支持多种可能的名称）
        let totalSeries = data.countData.series.find(s =>
          s.name === '总数' ||
          s.name === '总订单' ||
          s.name.includes('总') ||
          s.name.includes('全部') ||
          s.name.includes('所有')
        );

        // 查找补宝系列（支持多种可能的名称）
        let bubaooSeries = data.countData.series.find(s =>
          s.name === '补宝' ||
          s.name.includes('补宝') ||
          s.name.includes('进行中') ||
          s.name.includes('处理中')
        );

        // 查找异常系列（支持多种可能的名称）
        let exceptionSeries = data.countData.series.find(s =>
          s.name === '异常' ||
          s.name.includes('异常') ||
          s.name.includes('错误') ||
          s.name.includes('失败') ||
          s.name.includes('取消')
        );

        // 查找完单系列（支持多种可能的名称）
        let completedSeries = data.countData.series.find(s =>
          s.name === '完单' ||
          s.name === '已完成' ||
          s.name === '完成' ||
          s.name.includes('完单') ||
          s.name.includes('完成') ||
          s.name.includes('已完成') ||
          s.name.includes('成功')
        );

        // 查找退款系列（支持多种可能的名称）
        let refundSeries = data.countData.series.find(s =>
          s.name === '退款' ||
          s.name === '退单' ||
          s.name.includes('退款') ||
          s.name.includes('退单') ||
          s.name.includes('退回') ||
          s.name.includes('撤销')
        );

        // 如果找不到匹配的系列，尝试按顺序使用前几个系列
        if (!totalSeries && data.countData.series.length > 0) {
          totalSeries = data.countData.series[0];
          console.log('⚠️ 未找到总数系列，使用第一个系列:', totalSeries.name);
        }
        if (!bubaooSeries && data.countData.series.length > 1) {
          bubaooSeries = data.countData.series[1];
          console.log('⚠️ 未找到补宝系列，使用第二个系列:', bubaooSeries.name);
        }
        if (!exceptionSeries && data.countData.series.length > 2) {
          exceptionSeries = data.countData.series[2];
          console.log('⚠️ 未找到异常系列，使用第三个系列:', exceptionSeries.name);
        }
        if (!completedSeries && data.countData.series.length > 3) {
          completedSeries = data.countData.series[3];
          console.log('⚠️ 未找到完单系列，使用第四个系列:', completedSeries.name);
        }
        if (!refundSeries && data.countData.series.length > 4) {
          refundSeries = data.countData.series[4];
          console.log('⚠️ 未找到退款系列，使用第五个系列:', refundSeries.name);
        }

        // 计算总数（今日数据，取第一个值）
        const todayTotal = totalSeries && totalSeries.data && totalSeries.data.length > 0 ? totalSeries.data[0] : 0;
        const todayBubao = bubaooSeries && bubaooSeries.data && bubaooSeries.data.length > 0 ? bubaooSeries.data[0] : 0;
        const todayException = exceptionSeries && exceptionSeries.data && exceptionSeries.data.length > 0 ? exceptionSeries.data[0] : 0;
        const todayCompleted = completedSeries && completedSeries.data && completedSeries.data.length > 0 ? completedSeries.data[0] : 0;

        console.log('📈 今日统计数据:', {
          总订单: todayTotal,
          补宝订单: todayBubao,
          异常订单: todayException,
          完单数据: todayCompleted,
          计算异常: todayTotal - todayBubao,
          计算完单: todayTotal - todayException - todayBubao
        });

        // 获取今日金额数据
        let todayAmount = '0.00';
        if (data.amountData && data.amountData.series && data.amountData.series.length > 0) {
          // 查找总额系列（支持多种可能的名称）
          let amountTotalSeries = data.amountData.series.find(s =>
            s.name === '总额' ||
            s.name === '总金额' ||
            s.name.includes('总') ||
            s.name.includes('全部') ||
            s.name.includes('所有')
          );

          if (!amountTotalSeries && data.amountData.series.length > 0) {
            amountTotalSeries = data.amountData.series[0];
            console.log('⚠️ 未找到总额系列，使用第一个金额系列:', amountTotalSeries.name);
          }

          if (amountTotalSeries && amountTotalSeries.data && amountTotalSeries.data.length > 0) {
            todayAmount = (amountTotalSeries.data[0] || 0).toFixed(2);
          }
        }

        // 处理各项数据，优先使用API返回的原始数据
        let finalCompleted = todayCompleted;
        let finalException = todayException;

        // 如果有直接的完单数据，优先使用
        if (todayCompleted > 0) {
          finalCompleted = todayCompleted;
          console.log('✅ 使用直接的完单数据:', todayCompleted);
        }

        // 如果有直接的异常数据，优先使用
        if (todayException > 0) {
          finalException = todayException;
          console.log('✅ 使用直接的异常数据:', todayException);
        }

        // 如果没有直接的完单或异常数据，通过计算得出
        if (todayTotal > 0) {
          // 如果没有完单数据，通过计算得出：完单数 = 总数 - 补宝数 - 异常数
          if (finalCompleted === 0 && finalException > 0) {
            finalCompleted = Math.max(0, todayTotal - todayBubao - finalException);
            console.log('🔧 计算完单数据 (基于异常数):', {
              总订单: todayTotal,
              补宝订单: todayBubao,
              异常订单: finalException,
              计算完单: finalCompleted
            });
          }
          // 如果没有异常数据，通过计算得出：异常数 = 总数 - 补宝数 - 完单数
          else if (finalException === 0 && finalCompleted > 0) {
            finalException = Math.max(0, todayTotal - todayBubao - finalCompleted);
            console.log('🔧 计算异常数据 (基于完单数):', {
              总订单: todayTotal,
              补宝订单: todayBubao,
              完单数: finalCompleted,
              计算异常: finalException
            });
          }
          // 如果都没有，按原来的逻辑：异常数 = 总数 - 补宝数，完单数 = 0
          else if (finalCompleted === 0 && finalException === 0) {
            finalException = Math.max(0, todayTotal - todayBubao);
            finalCompleted = 0;
            console.log('🔧 使用原始计算逻辑:', {
              总订单: todayTotal,
              补宝订单: todayBubao,
              计算异常: finalException,
              完单数: finalCompleted
            });
          }
        }

        // 数据一致性检查
        const totalCheck = finalCompleted + todayBubao + finalException;
        console.log('📊 最终数据统计:', {
          总订单: todayTotal,
          完单数: finalCompleted,
          补宝订单: todayBubao,
          异常订单: finalException,
          计算总和: totalCheck,
          数据一致: Math.abs(totalCheck - todayTotal) <= 1
        });

        // 查找收宝系列（支持多种可能的名称）
        let shoubaoSeries = data.countData.series.find(s =>
          s.name === '收宝' ||
          s.name.includes('收宝') ||
          s.name.includes('待收') ||
          s.name.includes('收货')
        );

        const todayShoubao = shoubaoSeries && shoubaoSeries.data && shoubaoSeries.data.length > 0 ? shoubaoSeries.data[0] : 0;

        console.log('📈 收宝数据:', {
          收宝订单: todayShoubao
        });

        this.analysisData = {
          total: todayTotal,
          todayAmount: todayAmount,
          completed: finalCompleted, // 完单数
          shoubao: todayShoubao, // 收宝订单
          processing: todayBubao, // 进行中（补宝）
          canceled: finalException // 已取消（异常）
        };
      } else {
        this.analysisData = {
          total: 0,
          todayAmount: '0.00',
          completed: 0,
          shoubao: 0,
          processing: 0,
          canceled: 0
        };
      }

      // 处理图表数据
      this.generateCountChartData(data);
      this.generateAmountChartData(data);

      console.log('处理后的数据:', {
        analysisData: this.analysisData,
        countChartData: this.countChartData,
        amountChartData: this.amountChartData
      });

      // 强制刷新图表
      this.$nextTick(() => {
        this.forceChartUpdate();
      });
    },

    // 生成订单数量图表数据
    generateCountChartData(data) {
      console.log('🔄 生成订单数量图表数据，原始数据:', data);

      if (!data.countData || !data.countData.categories || !data.countData.series) {
        console.log('❌ 订单数量数据为空，使用默认数据');
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
              name: "收宝订单",
              data: [20, 18, 15, 20, 12, 35, 30]
            },
            {
              name: "异常订单",
              data: [25, 30, 32, 35, 27, 40, 38]
            },
            {
              name: "退款订单",
              data: [10, 15, 8, 12, 5, 20, 15]
            }
          ]
        };
        console.log('📊 使用默认订单数量图表数据:', this.countChartData);

        // 初始化图例显示状态
        this.$nextTick(() => {
          this.initializeLegendState();
        });
        return;
      }

      // 调试：查看所有系列的名称
      console.log('📋 订单数量所有系列数据:', data.countData.series);
      data.countData.series.forEach((s, index) => {
        console.log(`📊 订单数量系列${index}: name="${s.name}", data长度=${s.data ? s.data.length : 0}`);
      });

      // 只取前15天的数据用于图表显示
      const categories = data.countData.categories.slice(0, 15);

      // 构建系列数据
      const series = [];

      // 查找总数系列（支持多种可能的名称）
      let totalSeries = data.countData.series.find(s =>
        s.name === '总数' ||
        s.name === '总订单' ||
        s.name.includes('总') ||
        s.name.includes('全部') ||
        s.name.includes('所有')
      );

      if (totalSeries && totalSeries.data) {
        series.push({
          name: "总订单",
          data: totalSeries.data.slice(0, 15)
        });
        console.log('✅ 找到总订单系列:', totalSeries.name);
      }

      // 查找补宝系列（支持多种可能的名称）
      let bubaoSeries = data.countData.series.find(s =>
        s.name === '补宝' ||
        s.name.includes('补宝') ||
        s.name.includes('进行中') ||
        s.name.includes('处理中')
      );

      if (bubaoSeries && bubaoSeries.data) {
        series.push({
          name: "补宝订单",
          data: bubaoSeries.data.slice(0, 15)
        });
        console.log('✅ 找到补宝订单系列:', bubaoSeries.name);
      }

      // 查找收宝系列（支持多种可能的名称）
      let shoubaoSeries = data.countData.series.find(s =>
        s.name === '收宝' ||
        s.name.includes('收宝') ||
        s.name.includes('待收') ||
        s.name.includes('收货')
      );

      if (shoubaoSeries && shoubaoSeries.data) {
        series.push({
          name: "收宝订单",
          data: shoubaoSeries.data.slice(0, 15)
        });
        console.log('✅ 找到收宝订单系列:', shoubaoSeries.name);
      }

      // 查找完单系列（支持多种可能的名称）
      let completedSeries = data.countData.series.find(s =>
        s.name === '完单' ||
        s.name === '已完成' ||
        s.name === '完成' ||
        s.name.includes('完单') ||
        s.name.includes('完成') ||
        s.name.includes('已完成') ||
        s.name.includes('成功')
      );

      if (completedSeries && completedSeries.data) {
        series.push({
          name: "完单",
          data: completedSeries.data.slice(0, 15)
        });
        console.log('✅ 找到完单系列:', completedSeries.name);
      }

      // 查找异常系列（支持多种可能的名称）
      let exceptionSeries = data.countData.series.find(s =>
        s.name === '异常' ||
        s.name.includes('异常') ||
        s.name.includes('错误') ||
        s.name.includes('失败') ||
        s.name.includes('取消')
      );

      if (exceptionSeries && exceptionSeries.data) {
        series.push({
          name: "异常订单",
          data: exceptionSeries.data.slice(0, 15)
        });
        console.log('✅ 找到异常订单系列:', exceptionSeries.name);
      }

      // 查找退款系列（支持多种可能的名称）
      let refundSeries = data.countData.series.find(s =>
        s.name === '退款' ||
        s.name === '退单' ||
        s.name.includes('退款') ||
        s.name.includes('退单') ||
        s.name.includes('退回') ||
        s.name.includes('撤销')
      );

      if (refundSeries && refundSeries.data) {
        series.push({
          name: "退款订单",
          data: refundSeries.data.slice(0, 15)
        });
        console.log('✅ 找到退款订单系列:', refundSeries.name);
      }

      // 如果没有找到任何匹配的系列，尝试使用前几个系列
      if (series.length === 0 && data.countData.series.length > 0) {
        console.log('⚠️ 未找到匹配的系列名称，使用前几个系列');
        data.countData.series.slice(0, 5).forEach((s, index) => {
          if (s.data) {
            const names = ["总订单", "补宝订单", "完单", "异常订单", "退款订单"];
            series.push({
              name: names[index] || `系列${index + 1}`,
              data: s.data.slice(0, 15)
            });
            console.log(`📊 使用系列${index}: ${s.name} -> ${names[index] || `系列${index + 1}`}`);
          }
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
              name: "收宝订单",
              data: [20, 18, 15, 20, 12, 35, 30]
            },
            {
              name: "完单",
              data: [25, 34, 21, 44, 34, 110, 100]
            },
            {
              name: "异常订单",
              data: [25, 30, 32, 35, 27, 40, 38]
            },
            {
              name: "退款订单",
              data: [10, 15, 8, 12, 5, 20, 15]
            }
          ]
        };

        // 初始化图例显示状态
        this.$nextTick(() => {
          this.initializeLegendState();
        });
      } else {
        this.countChartData = {
          categories: categories,
          series: series
        };
      }

      console.log('订单数量图表数据:', this.countChartData);

      // 初始化图例显示状态：只显示总订单，隐藏补宝订单和异常订单
      this.$nextTick(() => {
        this.initializeLegendState();
      });
    },

    // 生成订单金额图表数据
    generateAmountChartData(data) {
      console.log('🔄 生成订单金额图表数据，原始数据:', data);

      if (!data.amountData || !data.amountData.categories || !data.amountData.series) {
        console.log('❌ 订单金额数据为空，使用默认数据');
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
            },
            {
              name: "退款金额",
              data: [120.10, 150.20, 80.10, 100.30, 50.10, 180.40, 130.20]
            }
          ]
        };
        console.log('📊 使用默认订单金额图表数据:', this.amountChartData);

        // 初始化图例显示状态
        this.$nextTick(() => {
          this.initializeAmountLegendState();
        });
        return;
      }

      // 调试：查看所有系列的名称
      console.log('📋 订单金额所有系列数据:', data.amountData.series);
      data.amountData.series.forEach((s, index) => {
        console.log(`📊 订单金额系列${index}: name="${s.name}", data长度=${s.data ? s.data.length : 0}`);
      });

      // 只取前15天的数据用于图表显示
      const categories = data.amountData.categories.slice(0, 15);

      // 构建系列数据
      const series = [];

      // 查找总额系列（支持多种可能的名称）
      let totalSeries = data.amountData.series.find(s =>
        s.name === '总额' ||
        s.name === '总金额' ||
        s.name.includes('总') ||
        s.name.includes('全部') ||
        s.name.includes('所有')
      );

      if (totalSeries && totalSeries.data) {
        series.push({
          name: "总金额",
          data: totalSeries.data.slice(0, 15)
        });
        console.log('✅ 找到总金额系列:', totalSeries.name);
      }

      // 查找补宝系列（支持多种可能的名称）
      let bubaoSeries = data.amountData.series.find(s =>
        s.name === '补宝' ||
        s.name.includes('补宝') ||
        s.name.includes('进行中') ||
        s.name.includes('处理中')
      );

      if (bubaoSeries && bubaoSeries.data) {
        series.push({
          name: "补宝金额",
          data: bubaoSeries.data.slice(0, 15)
        });
        console.log('✅ 找到补宝金额系列:', bubaoSeries.name);
      }

      // 查找异常系列（支持多种可能的名称）
      let exceptionSeries = data.amountData.series.find(s =>
        s.name === '异常' ||
        s.name.includes('异常') ||
        s.name.includes('错误') ||
        s.name.includes('失败') ||
        s.name.includes('取消')
      );

      if (exceptionSeries && exceptionSeries.data) {
        series.push({
          name: "异常金额",
          data: exceptionSeries.data.slice(0, 15)
        });
        console.log('✅ 找到异常金额系列:', exceptionSeries.name);
      }

      // 查找退款系列（支持多种可能的名称）
      let refundSeries = data.amountData.series.find(s =>
        s.name === '退款' ||
        s.name === '退款金额' ||
        s.name === '退单' ||
        s.name.includes('退款') ||
        s.name.includes('退单') ||
        s.name.includes('退回') ||
        s.name.includes('撤销')
      );

      if (refundSeries && refundSeries.data) {
        series.push({
          name: "退款金额",
          data: refundSeries.data.slice(0, 15)
        });
        console.log('✅ 找到退款金额系列:', refundSeries.name);
      }

      // 如果没有找到任何匹配的系列，尝试使用前几个系列
      if (series.length === 0 && data.amountData.series.length > 0) {
        console.log('⚠️ 未找到匹配的金额系列名称，使用前几个系列');
        data.amountData.series.slice(0, 3).forEach((s, index) => {
          if (s.data) {
            const names = ["总金额", "补宝金额", "异常金额"];
            series.push({
              name: names[index] || `金额系列${index + 1}`,
              data: s.data.slice(0, 15)
            });
            console.log(`📊 使用金额系列${index}: ${s.name} -> ${names[index] || `金额系列${index + 1}`}`);
          }
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
            },
            {
              name: "退款金额",
              data: [120.10, 150.20, 80.10, 100.30, 50.10, 180.40, 130.20]
            }
          ]
        };

        // 初始化图例显示状态
        this.$nextTick(() => {
          this.initializeAmountLegendState();
        });
      } else {
        this.amountChartData = {
          categories: categories,
          series: series
        };
      }

      console.log('订单金额图表数据:', this.amountChartData);

      // 初始化图例显示状态：只显示总金额，隐藏补宝金额和异常金额
      this.$nextTick(() => {
        this.initializeAmountLegendState();
      });
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
    onCountLegendTap(e) {
      console.log('订单数量图表图例点击:', e);
      if (e && e.currentIndex !== undefined) {
        const series = this.countChartData.series[e.currentIndex];
        if (series) {
          this.countClickData = {
            show: true,
            category: '图例',
            series: series.name,
            value: '已选中'
          };

          // 3秒后隐藏提示
          setTimeout(() => {
            this.countClickData.show = false;
          }, 3000);
        }
      }
    },

    // 订单金额图表图例点击事件
    onAmountLegendTap(e) {
      console.log('订单金额图表图例点击:', e);
      if (e && e.currentIndex !== undefined) {
        const series = this.amountChartData.series[e.currentIndex];
        if (series) {
          this.amountClickData = {
            show: true,
            category: '图例',
            series: series.name,
            value: '已选中'
          };

          // 3秒后隐藏提示
          setTimeout(() => {
            this.amountClickData.show = false;
          }, 3000);
        }
      }
    },

    // 订单数量图表图例点击事件
    getCountLegendIndex(e) {
      console.log('订单数量图表图例点击:', e);

      if (e && e.currentIndex !== undefined && this.countChartData.series) {
        const series = this.countChartData.series[e.currentIndex];
        if (series) {
          // 切换系列的显示状态
          series.show = series.show !== false ? false : true;

          // 更新图表数据以触发重新渲染
          this.countChartData = { ...this.countChartData };

          console.log(`${series.name} 系列已${series.show ? '显示' : '隐藏'}`);
        }
      }
    },

    // 订单金额图表图例点击事件
    getAmountLegendIndex(e) {
      console.log('订单金额图表图例点击:', e);

      if (e && e.currentIndex !== undefined && this.amountChartData.series) {
        const series = this.amountChartData.series[e.currentIndex];
        if (series) {
          // 切换系列的显示状态
          series.show = series.show !== false ? false : true;

          // 更新图表数据以触发重新渲染
          this.amountChartData = { ...this.amountChartData };

          console.log(`${series.name} 系列已${series.show ? '显示' : '隐藏'}`);
        }
      }
    },

    // 初始化图例显示状态
    initializeLegendState() {
      if (this.countChartData && this.countChartData.series) {
        this.countChartData.series.forEach((series, index) => {
          if (series.name === "收宝订单" || series.name === "补宝订单" || series.name === "异常订单") {
            // 模拟点击图例来隐藏收宝订单、补宝订单、异常订单，保持总订单、完单和退款订单显示
            this.getCountLegendIndex({ currentIndex: index });
          }
        });
      }
    },

    // 初始化金额图例显示状态
    initializeAmountLegendState() {
      if (this.amountChartData && this.amountChartData.series) {
        this.amountChartData.series.forEach((series, index) => {
          if (series.name === "补宝金额" || series.name === "异常金额") {
            // 模拟点击图例来隐藏补宝金额和异常金额，保持总金额和退款金额显示
            this.getAmountLegendIndex({ currentIndex: index });
          }
        });
      }
    },

    // 切换订单数量图表时间类型
    changeCountTimeType(type) {
      if (this.countTimeType === type) return;

      this.countTimeType = type;
      console.log('切换订单数量图表时间类型:', type === 1 ? '日' : type === 2 ? '周' : '月');

      // 只重新加载订单数量数据
      this.loadCountChartData(type);
    },

    // 切换订单金额图表时间类型
    changeAmountTimeType(type) {
      if (this.amountTimeType === type) return;

      this.amountTimeType = type;
      console.log('切换订单金额图表时间类型:', type === 1 ? '日' : type === 2 ? '周' : '月');

      // 只重新加载订单金额数据
      this.loadAmountChartData(type);
    },

    // 加载订单数量图表数据
    async loadCountChartData(timeType) {
      try {
        // 获取用户信息
        if (!this.riderUserInfo || !this.riderUserInfo.id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        // 构建请求参数 - 与主数据加载保持一致
        const params = {
          type: timeType,
          provider_id: this.riderUserInfo.provider_id || 1,
          service_member_id: this.riderUserInfo.id,
          timestamp: Math.floor(Date.now() / 1000),
          sign: "chongchong"
        };

        console.log('🔄 订单数量图表请求参数:', params);

        // 发送请求
        const res = await this.$request('data/tasks', params, 'POST');

        console.log('📊 订单数量图表响应:', res);

        if ((res.code === 200 || res.code === "200") && res.data) {
          // 检查total字段在哪个层级
          let dataToProcess = res.data;

          // 如果res.data中没有total，但res中有total，则合并数据
          if (!res.data.total && res.total) {
            console.log('🔧 订单数量-total字段在res根级别，合并到data中');
            dataToProcess = {
              ...res.data,
              total: res.total
            };
          }

          // 只更新订单数量图表数据
          this.generateCountChartData(dataToProcess);
          console.log('✅ 订单数量图表数据更新成功');
        } else {
          console.error('❌ 订单数量图表请求失败:', res);
          uni.showToast({
            title: res.msg || '获取订单数量数据失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取订单数量数据失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    },

    // 加载订单金额图表数据
    async loadAmountChartData(timeType) {
      try {
        // 获取用户信息
        if (!this.riderUserInfo || !this.riderUserInfo.id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        // 构建请求参数 - 与主数据加载保持一致
        const params = {
          type: timeType,
          provider_id: this.riderUserInfo.provider_id || 1,
          service_member_id: this.riderUserInfo.id,
          timestamp: Math.floor(Date.now() / 1000),
          sign: "chongchong"
        };

        console.log('🔄 订单金额图表请求参数:', params);

        // 发送请求
        const res = await this.$request('data/tasks', params, 'POST');

        console.log('📊 订单金额图表响应:', res);

        if ((res.code === 200 || res.code === "200") && res.data) {
          // 检查total字段在哪个层级
          let dataToProcess = res.data;

          // 如果res.data中没有total，但res中有total，则合并数据
          if (!res.data.total && res.total) {
            console.log('🔧 订单金额-total字段在res根级别，合并到data中');
            dataToProcess = {
              ...res.data,
              total: res.total
            };
          }

          // 只更新订单金额图表数据
          this.generateAmountChartData(dataToProcess);
          console.log('✅ 订单金额图表数据更新成功');
        } else {
          console.error('❌ 订单金额图表请求失败:', res);
          uni.showToast({
            title: res.msg || '获取订单金额数据失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取订单金额数据失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    },

    // 强制刷新图表
    forceChartUpdate() {
      console.log('强制刷新图表');
      console.log('countChartData:', this.countChartData);
      console.log('amountChartData:', this.amountChartData);

      // 延迟一下确保DOM更新完成
      setTimeout(() => {
        // 通过改变数据引用来强制更新图表
        if (this.countChartData && this.countChartData.series) {
          this.countChartData = { ...this.countChartData };
        }
        if (this.amountChartData && this.amountChartData.series) {
          this.amountChartData = { ...this.amountChartData };
        }
      }, 100);
    },

    // 加载行政区域任务排名数据
    async loadRegionTaskRankingData() {
      if (this.regionRankingLoading) return;

      this.regionRankingLoading = true;

      try {
        // 获取用户信息
        if (!this.riderUserInfo || !this.riderUserInfo.id) {
          console.log('用户信息不存在，无法加载排名数据');
          return;
        }

        // 构建请求参数
        const params = {
          service_member_id: this.riderUserInfo.id,
          type: this.regionType,
          timestamp: Math.floor(Date.now() / 1000),
          sign: "chongchong"
        };

        console.log('行政区域任务排名请求参数:', params);

        // 发送请求
        const res = await this.$request('data/region/task', params, 'POST');

        console.log('🔍 行政区域任务排名数据响应:', res);

        if (res.status === 'success' && res.data) {
          // 处理数据，接口返回的是图表格式数据
          this.processRegionTaskRankingData(res.data);
        } else {
          console.log('❌ 行政区域任务排名数据加载失败:', res.msg);
          this.regionRankingData = [];
          if (res.msg) {
            uni.showToast({
              title: res.msg,
              icon: 'none'
            });
          }
        }
      } catch (error) {
        console.error('获取行政区域任务排名数据失败:', error);
        this.regionRankingData = [];
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.regionRankingLoading = false;
      }
    },

    // 处理行政区域任务排名数据
    processRegionTaskRankingData(data) {
      console.log('🔄 处理行政区域任务排名数据:', data);

      // 检查数据格式：可能是嵌套的 {data: {categories, series}} 或直接的 {categories, series}
      let chartData = data;
      if (data.data && data.data.categories && data.data.series) {
        console.log('📋 发现嵌套数据格式，提取内层数据');
        chartData = data.data;
      }

      if (!chartData.categories || !chartData.series || !Array.isArray(chartData.categories) || !Array.isArray(chartData.series)) {
        console.log('❌ 数据格式错误，缺少categories或series');
        this.regionRankingData = [];
        return;
      }

      // 获取地区名称和任务数量
      const categories = chartData.categories;
      const seriesData = chartData.series[0]?.data || [];

      console.log('📋 categories:', categories);
      console.log('📋 seriesData:', seriesData);

      // 验证数据长度是否一致
      if (categories.length !== seriesData.length) {
        console.warn('⚠️ categories和series数据长度不一致');
        console.log('categories长度:', categories.length, 'series长度:', seriesData.length);
      }

      // 组合数据并排序
      const regionArray = categories.map((regionName, index) => ({
        region_name: regionName,
        task_count: Number(seriesData[index]) || 0
      }));

      // 按任务数量排序（从高到低）
      regionArray.sort((a, b) => b.task_count - a.task_count);

      // 计算总任务数用于占比计算
      const totalTasks = regionArray.reduce((sum, item) => sum + item.task_count, 0);

      // 添加占比字段，并限制显示前50条
      this.regionRankingData = regionArray.slice(0, 50).map(item => ({
        ...item,
        percentage: totalTasks > 0 ? (item.task_count / totalTasks * 100).toFixed(1) : 0
      }));

      console.log('✅ 处理后的行政区域任务排名数据:', this.regionRankingData);
      console.log('📊 数据条数:', this.regionRankingData.length);
      console.log('📋 前三名数据:', this.regionRankingData.slice(0, 3));
      console.log('📊 总任务数:', totalTasks);

      // 验证数据映射关系
      console.log('🔍 验证数据映射关系:');
      this.regionRankingData.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.region_name}: ${item.task_count}个任务 (${item.percentage}%)`);
      });
    },

    // 切换地区类型
    changeRegionType(type) {
      if (this.regionType === type) return;

      this.regionType = type;
      console.log('🔄 切换地区类型:', type);

      // 重新加载数据
      this.loadRegionTaskRankingData();
    },

    // 格式化百分比显示
    formatPercentage(percentage) {
      if (!percentage && percentage !== 0) {
        return '0.0';
      }
      return Number(percentage).toFixed(1);
    },

    // 切换分段器选项卡
    switchTab(tab) {
      this.currentTab = tab;
      console.log('切换到选项卡:', tab === 'trend' ? '订单趋势' : '订单排行榜');
    }


  }
}
</script>
<style lang="scss" scoped>
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
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;

  // 第一行：今日订单、今日金额、完单 (3个卡片)
  .stats-card:nth-child(1),
  .stats-card:nth-child(2),
  .stats-card:nth-child(3) {
    grid-column: span 1;
  }

  // 第二行：收宝订单、补宝订单、异常订单 (3个卡片)
  .stats-card:nth-child(4),
  .stats-card:nth-child(5),
  .stats-card:nth-child(6) {
    grid-column: span 1;
    grid-row: 2;
  }
}

.stats-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #f0f0f0;
  min-height: 120rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .stats-title {
    font-size: 22rpx;
    color: #666;
    margin-bottom: 8rpx;
    font-weight: 500;
    line-height: 1.2;
  }

  .stats-value {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    line-height: 1.2;

    &.amount {
      color: #ff6b35;
      font-size: 28rpx;
    }

    &.completed {
      color: #52c41a;
    }

    &.shoubao {
      color: #722ed1;
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
}

.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 24rpx;
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

// 排行榜区域
.ranking-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #f0f0f0;
  margin-bottom: 30rpx;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.ranking-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.region-filter {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 20rpx;
  padding: 4rpx;
  border: 1rpx solid #e8e8e8;
}

.region-filter .filter-item {
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  color: #666;
  border-radius: 16rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60rpx;
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

.ranking-container {
  width: 100%;
  min-height: 400rpx;
}

.ranking-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  color: #999;
}

.ranking-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  color: #999;
  font-size: 24rpx;
}

.ranking-table {
  width: 100%;
  border-radius: 8rpx;
  overflow: hidden;
  border: 1rpx solid #f0f0f0;
}

.table-header {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1rpx solid #e8e8e8;
}

.header-cell {
  padding: 24rpx 16rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #666;
  text-align: center;
  
  &.rank {
    flex: 0 0 120rpx;
  }
  
  &.region-name {
    flex: 1;
  }
  
  &.task-count {
    flex: 0 0 120rpx;
  }
  
  &.percentage {
    flex: 0 0 140rpx;
  }
}

.table-body {
  background-color: #fff;
}

.table-row {
  display: flex;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &.top-three {
    background-color: #fff7e6;
  }
}

.table-cell {
  padding: 24rpx 16rpx;
  font-size: 26rpx;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.rank {
    flex: 0 0 120rpx;
  }
  
  &.region-name {
    flex: 1;
    font-weight: 500;
  }
  
  &.task-count {
    flex: 0 0 120rpx;
    font-weight: 500;
    color: #2492F2;
  }
  
  &.percentage {
    flex: 0 0 140rpx;
    font-weight: 500;
    color: #52c41a;
  }
}

.rank-number {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  
  &.rank-first {
    background-color: #FFD700;
    color: #fff;
    box-shadow: 0 4rpx 12rpx rgba(255, 215, 0, 0.4);
  }
  
  &.rank-second {
    background-color: #C0C0C0;
    color: #fff;
    box-shadow: 0 4rpx 12rpx rgba(192, 192, 192, 0.4);
  }
  
  &.rank-third {
    background-color: #CD7F32;
    color: #fff;
    box-shadow: 0 4rpx 12rpx rgba(205, 127, 50, 0.4);
  }
  
  &.rank-normal {
    background-color: #f8f9fa;
    color: #666;
    border: 1rpx solid #e8e8e8;
  }
}

// 分段器样式
.segmented-control {
  padding: 0 20rpx;
  margin-bottom: 30rpx;
}

.segmented-container {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 24rpx;
  padding: 6rpx;
  border: 1rpx solid #e8e8e8;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.segment-item {
  flex: 1;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #666;
  text-align: center;
  border-radius: 18rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:active {
    transform: scale(0.98);
  }

  &.active {
    background-color: #2492F2;
    color: #fff;
    font-weight: 600;
    box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.3);
  }
}

// 内容区域样式
.trend-content,
.ranking-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


</style>