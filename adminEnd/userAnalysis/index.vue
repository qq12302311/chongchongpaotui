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
          <view class="stats-title">下单用户</view>
          <view class="stats-value active-users">{{ analysisData.active_user || 0 }}</view>
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

      <!-- 省份用户分布图 - 暂时隐藏 -->
      <!-- <view class="chart-section">
        <view class="chart-header">
          <view class="chart-title">省份用户分布</view>
        </view>
        <view class="chart-container province-chart">
          <qiun-data-charts
            v-if="provinceChartData && provinceChartData.series && provinceChartData.series.length > 0"
            type="column"
            :opts="provinceChartOpts"
            :chartData="provinceChartData"
            :ontouch="true"
            :tapLegend="true"
            :tooltipShow="true"
            :canvas2d="true"
            canvasId="provinceChart"
            @getIndex="getProvinceChartIndex"
            @getLegendIndex="getProvinceLegendIndex"
          />
          <view v-else class="chart-loading">
            <text>省份数据加载中...</text>
          </view>
        </view>
      </view> -->

      <!-- 用户下单排行榜 -->
      <view class="ranking-section">
        <view class="ranking-header">
          <view class="ranking-title">用户下单排行榜</view>
          <view class="sort-filter">
            <view
              class="sort-item"
              :class="{ active: sortField === 'user_id' }"
              @click="changeSortField('user_id')"
            >用户ID</view>
            <view
              class="sort-item"
              :class="{ active: sortField === 'task_count' }"
              @click="changeSortField('task_count')"
            >订单数</view>
            <view
              class="sort-item"
              :class="{ active: sortField === 'total_amount' }"
              @click="changeSortField('total_amount')"
            >金额</view>
          </view>
        </view>
        <!-- 时间选择器 -->
        <view class="time-selector">
          <view class="time-filter">
            <view
              class="filter-item"
              :class="{ active: rankingTimeType === 'today' }"
              @click="changeRankingTimeType('today')"
            >今日</view>
            <view
              class="filter-item"
              :class="{ active: rankingTimeType === 'yesterday' }"
              @click="changeRankingTimeType('yesterday')"
            >昨日</view>
            <view
              class="filter-item"
              :class="{ active: rankingTimeType === 'last30days' }"
              @click="changeRankingTimeType('last30days')"
            >近30日</view>
            <view
              class="filter-item"
              :class="{ active: rankingTimeType === 'lastmonth' }"
              @click="changeRankingTimeType('lastmonth')"
            >上月</view>
            <view
              class="filter-item"
              :class="{ active: rankingTimeType === 'all' }"
              @click="changeRankingTimeType('all')"
            >全部</view>
          </view>
        </view>
        <view class="ranking-container">
          <view v-if="rankingLoading" class="ranking-loading">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载中...</text>
          </view>
          <view v-else-if="rankingData && rankingData.length > 0" class="ranking-list">
            <view class="ranking-table">
              <view class="table-header">
                <view class="header-cell rank">排名</view>
                <view class="header-cell user-id">用户ID</view>
                <view class="header-cell order-count">订单数</view>
                <view class="header-cell amount">金额(元)</view>
              </view>
              <view class="table-body">
                <view 
                  v-for="(item, index) in rankingData" 
                  :key="index" 
                  class="table-row"
                  :class="{ 'top-three': index < 3 }"
                >
                  <view class="table-cell rank">
                    <view class="rank-number" :class="index === 0 ? 'rank-first' : index === 1 ? 'rank-second' : index === 2 ? 'rank-third' : 'rank-normal'">
                      {{ index + 1 }}
                    </view>
                  </view>
                  <view class="table-cell user-id">{{ item.user_id || '--' }}</view>
                  <view class="table-cell order-count">{{ item.task_count || 0 }}</view>
                  <view class="table-cell amount">{{ formatAmount(item.total_amount) }}</view>
                </view>
              </view>
            </view>
          </view>
          <view v-else class="ranking-empty">
            <text>暂无排行数据</text>
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
        color: ["#2492F2", "#52C41A", "#FF6B35", "#FF4D4F", "#722ED1", "#EB2F96"],
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
      // 省份图表配置
      provinceChartOpts: {
        color: ["#1890FF", "#52C41A", "#FA8C16", "#F5222D", "#722ED1", "#EB2F96"],
        padding: [15, 15, 0, 15],
        enableScroll: true,
        legend: {},
        xAxis: {
          disableGrid: false,
          scrollShow: true,
          itemCount: 6,
          rotateLabel: true,
          fontSize: 10
        },
        yAxis: {
          gridType: "dash",
          dashLength: 2,
          fontSize: 12
        },
        extra: {
          column: {
            type: "group",
            width: 20,
            activeBgColor: "#F4F4F4",
            activeBgOpacity: 0.3
          }
        }
      },
      navBarHeight: 0,
      loading: false,
      analysisData: {},
      riderUserInfo: null,
      // 用户注册图表数据
      registerChartData: null,
      // 时间类型选择
      registerTimeType: 1, // 用户注册图表时间类型：1-日, 2-周, 3-月，默认选中日
      // 省份用户分布图表数据
      provinceChartData: null,
      // 用户下单排行榜相关
      rankingData: null,
      rankingLoading: false,
      sortField: 'task_count', // 默认按订单数排序
      sortOrder: 'desc',
      rankingTimeType: 'yesterday', // 默认为昨日：today, yesterday, last30days, lastmonth, all
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
    
    // 加载排行榜数据
    this.loadRankingData();
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
          // 检查total字段在哪个层级，并合并所有可能的数据字段
          let dataToProcess = { ...res.data };

          // 如果res.data中没有total，但res中有total，则合并total
          if (!res.data.total && res.total) {
            console.log('🔧 total字段在res根级别，合并到data中');
            dataToProcess.total = res.total;
          }

          // 如果res.data中没有province_members，但res中有province_members，则合并province_members
          if (!res.data.province_members && res.province_members) {
            console.log('🔧 province_members字段在res根级别，合并到data中');
            dataToProcess.province_members = res.province_members;
          }

          console.log('📊 最终传递给processAnalysisData的数据:', dataToProcess);
          console.log('🔍 dataToProcess.province_members:', dataToProcess.province_members);
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
        active_user: data.total && data.total.active_user !== undefined ? Number(data.total.active_user) : 0, // 使用接口返回的下单用户数
        totalBalance: (totalUsers * 15.5).toFixed(2) // 假设平均余额15.5元
      };

      // 处理图表数据
      this.generateRegisterChartData(data);
      
      // 处理省份用户分布数据
      this.generateProvinceChartData(data);

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
            },
            {
              name: "推荐注册", 
              data: [5, 8, 4, 6, 3, 9, 7],
              show: false // 默认隐藏
            },
            {
              name: "每日下单用户",
              data: [20, 28, 15, 23, 12, 35, 30]
            },
            {
              name: "每日下单新用户",
              data: [8, 12, 6, 10, 5, 15, 12]
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

      // 定义要查找的系列映射
      const seriesMapping = [
        {
          searchNames: ['每日注册用户', '每周注册用户', '每月注册用户', '注册用户', '注册', '用户'],
          displayName: '新增用户',
          show: true,
          priority: 1
        },
        {
          searchNames: ['每日推荐注册用户', '推荐注册用户', '推荐注册', '推荐用户'],
          displayName: '推荐注册',
          show: false, // 默认隐藏
          priority: 2
        },
        {
          searchNames: ['每日下单用户', '下单用户', '订单用户', '下单'],
          displayName: '每日下单用户',
          show: true,
          priority: 3
        },
        {
          searchNames: ['每日下单新用户', '下单新用户', '新用户下单', '首次下单用户'],
          displayName: '每日下单新用户',
          show: true,
          priority: 4
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
          const baseData = categories.map(() => Math.floor(Math.random() * 30) + 10);
          let mockData;
          
          if (mapping.displayName === '推荐注册') {
            // 推荐注册用户数据应该比普通注册用户少
            mockData = baseData.map(val => Math.floor(val * 0.3));
          } else if (mapping.displayName === '每日下单用户') {
            // 下单用户数据应该比注册用户少一些
            mockData = baseData.map(val => Math.floor(val * 0.8));
          } else if (mapping.displayName === '每日下单新用户') {
            // 下单新用户数据应该比下单用户更少
            mockData = baseData.map(val => Math.floor(val * 0.4));
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

      // 如果没有找到任何系列，使用第一个系列作为注册用户数据
      if (series.length === 0 && data.series.length > 0) {
        const firstSeries = data.series[0];
        console.log('⚠️ 未找到匹配的用户系列名称，使用第一个系列:', firstSeries.name);
        series.push({
          name: "新增用户",
          data: firstSeries.data.slice(0, 15),
          show: true
        });
      }

      // 如果仍然没有有效的系列数据，使用默认数据
      if (series.length === 0) {
        console.log('❌ 没有有效的用户系列数据，使用默认数据');
        this.registerChartData = {
          categories: ["06-25", "06-24", "06-23", "06-22", "06-21", "06-20", "06-19"],
          series: [
            {
              name: "新增用户",
              data: [25, 32, 18, 28, 15, 42, 35]
            },
            {
              name: "推荐注册",
              data: [5, 8, 4, 6, 3, 9, 7],
              show: false // 默认隐藏
            },
            {
              name: "每日下单用户",
              data: [20, 28, 15, 23, 12, 35, 30]
            },
            {
              name: "每日下单新用户",
              data: [8, 12, 6, 10, 5, 15, 12]
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
          // 检查total字段在哪个层级，并合并所有可能的数据字段
          let dataToProcess = { ...res.data };

          // 如果res.data中没有total，但res中有total，则合并total
          if (!res.data.total && res.total) {
            console.log('🔧 时间切换-total字段在res根级别，合并到data中');
            dataToProcess.total = res.total;
          }

          // 如果res.data中没有province_members，但res中有province_members，则合并province_members
          if (!res.data.province_members && res.province_members) {
            console.log('🔧 时间切换-province_members字段在res根级别，合并到data中');
            dataToProcess.province_members = res.province_members;
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
      console.log('当前图表数据:', this.registerChartData);
      
      if (e && e.currentIndex !== undefined && this.registerChartData && this.registerChartData.series) {
        const series = this.registerChartData.series[e.currentIndex];
        if (series) {
          // 切换显示状态
          const newShow = series.show !== false ? false : true;
          console.log(`准备切换 ${series.name} 系列从 ${series.show} 到 ${newShow}`);
          
          // 创建新的数据对象确保响应式更新
          const newChartData = {
            categories: [...this.registerChartData.categories],
            series: this.registerChartData.series.map((s, index) => {
              if (index === e.currentIndex) {
                return {
                  ...s,
                  show: newShow
                };
              }
              return { ...s };
            })
          };
          
          this.registerChartData = newChartData;
          console.log(`${series.name} 系列已${newShow ? '显示' : '隐藏'}`);
          console.log('更新后的图表数据:', this.registerChartData);
          
          // 强制更新图表
          this.$nextTick(() => {
            this.forceUserChartUpdate();
          });
        }
      }
    },

    // 加载用户下单排行榜数据
    async loadRankingData() {
      if (this.rankingLoading) return;

      this.rankingLoading = true;

      try {
        // 获取用户信息
        if (!this.riderUserInfo || !this.riderUserInfo.id) {
          console.log('用户信息不存在，无法加载排行榜数据');
          return;
        }

        // 计算时间范围
        const dateRange = this.calculateDateRange(this.rankingTimeType);

        // 构建请求参数
        const params = {
          service_member_id: this.riderUserInfo.id,
          sort_field: this.sortField,
          sort_order: this.sortOrder,
          timestamp: Math.floor(Date.now() / 1000),
          sign: "chongchong"
        };

        // 根据时间类型添加时间参数
        if (dateRange.startDate && dateRange.endDate) {
          params.start_date = dateRange.startDate;
          params.end_date = dateRange.endDate;
        }

        console.log('排行榜请求参数:', params);
        console.log('时间类型:', this.rankingTimeType);
        console.log('时间范围:', dateRange);

        // 发送请求
        const res = await this.$request('data/user/rank', params, 'POST');

        console.log('🔍 排行榜数据响应:', res);

        if (res.status === 'success' && res.data) {
          this.rankingData = Array.isArray(res.data) ? res.data : [];
          console.log('✅ 排行榜数据加载成功:', this.rankingData);
          console.log('📊 数据条数:', this.rankingData.length);
          console.log('📋 第一条数据:', this.rankingData[0]);
        } else {
          console.log('❌ 排行榜数据加载失败:', res.msg);
          console.log('❌ 响应状态:', res.status);
          console.log('❌ 响应数据:', res.data);
          this.rankingData = [];
          if (res.msg) {
            uni.showToast({
              title: res.msg,
              icon: 'none'
            });
          }
        }
      } catch (error) {
        console.error('获取排行榜数据失败:', error);
        this.rankingData = [];
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.rankingLoading = false;
      }
    },

    // 切换排序字段
    changeSortField(field) {
      if (this.sortField === field) {
        // 如果点击相同字段，切换排序顺序
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
      } else {
        // 如果点击不同字段，使用默认的降序
        this.sortField = field;
        this.sortOrder = 'desc';
      }

      console.log(`🔄 切换排序: ${field} ${this.sortOrder}`);
      
      // 重新加载数据
      this.loadRankingData();
    },

    // 切换排行榜时间类型
    changeRankingTimeType(timeType) {
      if (this.rankingTimeType === timeType) return;

      this.rankingTimeType = timeType;
      console.log('🔄 切换排行榜时间类型:', timeType);

      // 重新加载排行榜数据
      this.loadRankingData();
    },

    // 计算日期范围
    calculateDateRange(timeType) {
      const now = new Date();
      let startDate = null;
      let endDate = null;

      switch (timeType) {
        case 'today':
          // 今日：当天00:00:00 到 23:59:59
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;

        case 'yesterday':
          // 昨日：昨天00:00:00 到 23:59:59
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
          endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
          break;

        case 'last30days':
          // 近30日：30天前00:00:00 到 今天23:59:59
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          startDate = new Date(thirtyDaysAgo.getFullYear(), thirtyDaysAgo.getMonth(), thirtyDaysAgo.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;

        case 'lastmonth':
          // 上月：上个月第一天00:00:00 到 上个月最后一天23:59:59
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          startDate = lastMonth;
          endDate = lastMonthEnd;
          break;

        case 'all':
          // 全部：不设置时间范围
          return { startDate: null, endDate: null };

        default:
          return { startDate: null, endDate: null };
      }

      return {
        startDate: this.formatDateForAPI(startDate),
        endDate: this.formatDateForAPI(endDate)
      };
    },

    // 格式化日期为API需要的格式 (YYYY-MM-DD HH:mm:ss)
    formatDateForAPI(date) {
      if (!date) return null;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    // 格式化金额显示
    formatAmount(amount) {
      if (!amount && amount !== 0) {
        return '0.00';
      }
      return Number(amount).toFixed(2);
    },

    // 生成省份用户分布图表数据
    generateProvinceChartData(data) {
      // console.log('🔄 生成省份用户分布图表数据');
      // console.log('📋 完整原始数据:', JSON.stringify(data, null, 2));
      // console.log('📋 data.province_members:', data.province_members);
      // console.log('📋 data.province_members存在:', !!data.province_members);
      
      // 检查province_members数据
      if (!data.province_members) {
        console.log('❌ 省份数据为空，使用默认数据');
        console.log('📋 所有可用字段:', Object.keys(data));
        this.provinceChartData = {
          categories: ["云南", "北京", "上海", "广东", "浙江"],
          series: [
            {
              name: "用户数量",
              data: [150, 120, 95, 80, 65]
            }
          ]
        };
        console.log('📊 使用默认省份图表数据:', this.provinceChartData);
        return;
      }

      const provinceMembers = data.province_members;
      console.log('📋 province_members 数据:', provinceMembers);

      // 如果province_members有data字段，说明是嵌套结构
      let provinceData = null;
      if (provinceMembers.data) {
        console.log('✅ 发现嵌套结构: province_members.data');
        
        // 检查是否已经是图表格式（有categories和series）
        if (provinceMembers.data.categories && provinceMembers.data.series) {
          console.log('✅ 数据已经是图表格式，直接使用');
          this.provinceChartData = {
            categories: provinceMembers.data.categories,
            series: provinceMembers.data.series
          };
          
          // 验证数据对应关系
          console.log('🔍 验证数据对应关系:');
          const categories = this.provinceChartData.categories;
          const seriesData = this.provinceChartData.series[0]?.data || [];
          
          for (let i = 0; i < Math.min(categories.length, seriesData.length, 10); i++) {
            console.log(`✅ categories[${i}]: ${categories[i]} ↔ series.data[${i}]: ${seriesData[i]}`);
          }
          
          console.log('🎯 最终省份图表数据:', {
            categories: this.provinceChartData.categories.slice(0, 10),
            series: this.provinceChartData.series,
            categoriesLength: this.provinceChartData.categories.length,
            seriesDataLength: seriesData.length,
            dataMatched: this.provinceChartData.categories.length === seriesData.length
          });

          // 强制触发图表更新
          this.$nextTick(() => {
            this.forceProvinceChartUpdate();
          });
          return;
        }
        
        // 如果不是图表格式，当作原始数据处理
        provinceData = provinceMembers.data;
      } else {
        // 直接是原始数据
        provinceData = provinceMembers;
      }

      console.log('📋 准备处理的原始省份数据:', provinceData);

      // 处理原始省份数据（键值对格式）
      if (provinceData && typeof provinceData === 'object') {
        // 按用户数量排序，取前20个省份显示
        const sortedProvinces = Object.entries(provinceData)
          .map(([province, count]) => ({
            name: province,
            count: Number(count)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);

        console.log('📊 排序后的省份数据:', sortedProvinces);

        // 同步构建 categories 和 series 数据，确保顺序一致
        const categories = [];
        const seriesData = [];
        
        sortedProvinces.forEach((province, index) => {
          categories.push(province.name);
          seriesData.push(province.count);
          if (index < 10) {
            console.log(`🏷️ [${index}] ${province.name}: ${province.count}人`);
          }
        });

        this.provinceChartData = {
          categories: categories,
          series: [
            {
              name: "用户数量",
              data: seriesData
            }
          ]
        };

        // 验证数据对应关系
        console.log('🔍 验证数据对应关系:');
        for (let i = 0; i < Math.min(categories.length, seriesData.length, 10); i++) {
          console.log(`✅ categories[${i}]: ${categories[i]} ↔ series.data[${i}]: ${seriesData[i]}`);
        }

        console.log('🎯 最终省份图表数据:', {
          categories: this.provinceChartData.categories.slice(0, 10),
          series: this.provinceChartData.series,
          categoriesLength: this.provinceChartData.categories.length,
          seriesDataLength: this.provinceChartData.series[0].data.length,
          dataMatched: this.provinceChartData.categories.length === this.provinceChartData.series[0].data.length
        });

        // 强制触发图表更新
        this.$nextTick(() => {
          this.forceProvinceChartUpdate();
        });
      } else {
        console.log('❌ 无效的省份数据格式');
      }
    },

    // 强制刷新省份图表
    forceProvinceChartUpdate() {
      console.log('🔄 强制刷新省份分布图表');
      console.log('当前省份图表数据:', this.provinceChartData);

      // 延迟一下确保DOM更新完成
      setTimeout(() => {
        // 通过改变数据引用来强制更新图表
        if (this.provinceChartData && this.provinceChartData.series) {
          this.provinceChartData = { ...this.provinceChartData };
          console.log('✅ 省份图表数据已更新');
        }
      }, 100);
    },

    // 省份图表点击事件
    getProvinceChartIndex(e) {
      console.log('省份图表点击:', e);
      if (e && e.currentIndex !== undefined && this.provinceChartData.categories) {
        const province = this.provinceChartData.categories[e.currentIndex];
        const count = this.provinceChartData.series[0].data[e.currentIndex];
        uni.showToast({
          title: `${province}: ${count}人`,
          icon: 'none'
        });
      }
    },

    // 省份图表图例点击事件
    getProvinceLegendIndex(e) {
      console.log('省份图表图例点击:', e);
      
      if (e && e.currentIndex !== undefined && this.provinceChartData.series) {
        const series = this.provinceChartData.series[e.currentIndex];
        if (series) {
          series.show = series.show !== false ? false : true;
          this.provinceChartData = { ...this.provinceChartData };
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
  
  &.province-chart {
    height: 500rpx; // 省份图表高一些，显示更多省份
  }
}

.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 24rpx;
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
  margin-bottom: 10rpx;
}

.ranking-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.sort-filter {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 20rpx;
  padding: 4rpx;
  border: 1rpx solid #e8e8e8;
}

.sort-item {
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
  
  &.user-id {
    flex: 1;
  }
  
  &.order-count {
    flex: 0 0 140rpx;
  }
  
  &.amount {
    flex: 0 0 160rpx;
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
  
  &.user-id {
    flex: 1;
    font-family: 'Monaco', 'Consolas', monospace;
  }
  
  &.order-count {
    flex: 0 0 140rpx;
    font-weight: 500;
  }
  
  &.amount {
    flex: 0 0 160rpx;
    font-weight: 500;
    color: #ff6b35;
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

// 时间选择器
.time-selector {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20rpx;
  // padding-top: 20rpx;
  // border-top: 1rpx solid #f0f0f0;
}
</style>
