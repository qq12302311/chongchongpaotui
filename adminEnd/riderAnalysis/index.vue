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
          <view class="stats-title">接单骑手</view>
          <view class="stats-value active-riders">{{ analysisData.active_member || 0 }}</view>
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

      <!-- 骑手数量排名 -->
      <view class="ranking-section">
        <view class="ranking-header">
          <view class="ranking-title">骑手数量排名</view>
          <!-- 排名类型选择器 -->
          <view class="ranking-type-filter">
            <view 
              class="filter-item"
              :class="{ active: rankingType === 'admin' }"
              @click="changeRankingType('admin')"
            >行政区域排名</view>
            <view 
              class="filter-item"
              :class="{ active: rankingType === 'zone' }"
              @click="changeRankingType('zone')"
            >独立区域骑手数量</view>
          </view>
        </view>
        
        <!-- 行政区域排名 -->
        <view v-if="rankingType === 'admin'">
          <view class="ranking-sub-header">
            <view class="ranking-sub-title">行政区域排名</view>
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
        </view>
        
        <!-- 独立区域骑手数量 -->
        <view v-if="rankingType === 'zone'">
          <view class="ranking-sub-header">
            <view class="ranking-sub-title">独立区域骑手数量</view>
            <view v-if="selectedZoneName" class="selected-zone-display">
              <text class="selected-zone-text">已选择：{{ selectedZoneName }}</text>
            </view>
          </view>
          
          <!-- 区域选择器直接展示在页面上 -->
          <view class="zone-picker-inline">
            <view class="zone-picker-header">
              <text class="zone-picker-title">选择城市/区县</text>
            </view>
            <view class="zone-picker-content-inline">
              <view v-if="zoneDataLoading" class="zone-loading">
                <view class="loading-spinner"></view>
                <text class="loading-text">加载中...</text>
              </view>
              <view v-else-if="zoneTreeData && zoneTreeData.length > 0" class="zone-tree-list">
                <!-- 省份级别 -->
                <view 
                  v-for="(province, pIndex) in zoneTreeData" 
                  :key="`province-${province.id || pIndex}`"
                  class="zone-tree-item"
                >
                  <!-- 省份名称（可点击展开） -->
                  <view 
                    class="zone-province-item"
                    @click="toggleProvince(province.id || pIndex)"
                  >
                    <text class="zone-expand-icon">{{ expandedProvinces[province.id || pIndex] ? '▼' : '▶' }}</text>
                    <text class="zone-province-name">{{ province.name || '未知省份' }}</text>
                    <text class="zone-province-count">{{ (province.cities && province.cities.length) || 0 }}个城市</text>
                  </view>
                  
                  <!-- 城市列表（展开时显示） -->
                  <view 
                    v-if="expandedProvinces[province.id || pIndex]" 
                    class="zone-city-list"
                  >
                    <view 
                      v-for="(city, cIndex) in (province.cities || [])" 
                      :key="`city-${city.id || cIndex}`"
                      class="zone-city-item"
                    >
                      <!-- 城市名称（可选择） -->
                      <view 
                        class="zone-city-name-item"
                        @click="selectZone(city)"
                      >
                        <text class="zone-city-name">{{ city.name || '未知城市' }}</text>
                        <text class="zone-type-tag city-tag">城市</text>
                      </view>
                      
                      <!-- 区县列表 -->
                      <view class="zone-district-list">
                        <view 
                          v-for="(district, dIndex) in (city.districts || [])" 
                          :key="`district-${district.id || dIndex}`"
                          class="zone-district-item"
                          @click="selectZone(district)"
                        >
                          <text class="zone-district-name">{{ district.name || '未知区县' }}</text>
                          <text class="zone-type-tag district-tag">区县</text>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
              <view v-else class="zone-empty">
                <text>暂无数据</text>
              </view>
            </view>
          </view>
        </view>
        <view class="ranking-container">
          <!-- 行政区域排名数据 -->
          <view v-if="rankingType === 'admin'">
            <view v-if="regionRankingLoading" class="ranking-loading">
              <view class="loading-spinner"></view>
              <text class="loading-text">加载中...</text>
            </view>
            <view v-else-if="regionRankingData && regionRankingData.length > 0" class="ranking-list">
              <view class="ranking-table">
                <view class="table-header">
                  <view class="header-cell rank">排名</view>
                  <view class="header-cell region-name">地区</view>
                  <view class="header-cell rider-count">骑手数</view>
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
                    <view class="table-cell rider-count">{{ item.rider_count || 0 }}</view>
                    <view class="table-cell percentage">{{ formatPercentage(item.percentage) }}%</view>
                  </view>
                </view>
              </view>
            </view>
            <view v-else class="ranking-empty">
              <text>暂无排名数据</text>
            </view>
          </view>
          
          <!-- 独立区域骑手数量数据 -->
          <view v-if="rankingType === 'zone'">
            <view v-if="!selectedZoneId" class="ranking-empty">
              <text>请先选择城市/区县</text>
            </view>
            <view v-else-if="zoneRankingLoading" class="ranking-loading">
              <view class="loading-spinner"></view>
              <text class="loading-text">加载中...</text>
            </view>
            <view v-else-if="zoneRankingData && zoneRankingData.length > 0" class="ranking-list">
              <view class="ranking-table">
                <view class="table-header">
                  <view class="header-cell rank">排名</view>
                  <view class="header-cell region-name">区域</view>
                  <view class="header-cell rider-count">骑手数</view>
                  <view class="header-cell percentage">占比(%)</view>
                </view>
                <view class="table-body">
                  <view 
                    v-for="(item, index) in zoneRankingData" 
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
                    <view class="table-cell rider-count">{{ item.rider_count || 0 }}</view>
                    <view class="table-cell percentage">{{ formatPercentage(item.percentage) }}%</view>
                  </view>
                </view>
              </view>
            </view>
            <view v-else class="ranking-empty">
              <text>暂无数据</text>
            </view>
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
      // 骑手数量排名相关
      rankingType: 'admin', // 排名类型：admin-行政区域排名，zone-独立区域骑手数量
      // 行政区骑手数量排名相关
      regionRankingData: null,
      regionRankingLoading: false,
      regionType: 'city', // 默认城市类型
      currentParentRegionId: 5, // 当前父级地区ID，默认为5
      // 独立区域相关
      zoneData: [], // 服务商区域数据
      zoneDataLoading: false, // 区域数据加载状态
      zoneTreeData: [], // 树形结构区域数据
      expandedProvinces: {}, // 展开的省份状态
      selectedZoneId: null, // 选中的区域ID
      selectedZoneName: '', // 选中的区域名称
      selectedZoneType: '', // 选中的区域类型
      zoneRankingData: null, // 独立区域骑手数量数据
      zoneRankingLoading: false, // 独立区域数据加载状态
      // 缓存相关
      zoneCacheKey: 'rider_analysis_zone_cache',
      zoneCacheExpiry: 'rider_analysis_zone_cache_expiry',
      cacheValidDuration: 30 * 60 * 1000 // 缓存30分钟
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
    
    // 根据排名类型加载对应数据
    if (this.rankingType === 'admin') {
      // 加载行政区骑手排名数据
      this.loadRegionRiderRankingData();
    } else if (this.rankingType === 'zone') {
      // 加载服务商区域数据
      this.loadZoneData();
    }
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
        active_member: data.total && data.total.active_member !== undefined ? Number(data.total.active_member) : 0, // 使用接口返回的接单骑手数
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
    },

    // 加载行政区骑手排名数据
    async loadRegionRiderRankingData() {
      // 只有在行政区域排名模式下才加载数据
      if (this.rankingType !== 'admin') return;
      
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
          // parent_region_id: this.currentParentRegionId,
          timestamp: Math.floor(Date.now() / 1000),
          sign: "chongchong"
        };

        console.log('行政区骑手排名请求参数:', params);

        // 发送请求
        const res = await this.$request('data/region/member', params, 'POST');

        console.log('🔍 行政区骑手排名数据响应:', res);

        if (res.status === 'success' && res.data) {
          // 处理数据，接口返回的是图表格式数据
          this.processRegionRankingData(res.data);
        } else {
          console.log('❌ 行政区骑手排名数据加载失败:', res.msg);
          this.regionRankingData = [];
          if (res.msg) {
            uni.showToast({
              title: res.msg,
              icon: 'none'
            });
          }
        }
      } catch (error) {
        console.error('获取行政区骑手排名数据失败:', error);
        this.regionRankingData = [];
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.regionRankingLoading = false;
      }
    },

    // 处理行政区骑手排名数据
    processRegionRankingData(data) {
      console.log('🔄 处理行政区骑手排名数据:', data);

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

      // 获取地区名称和骑手数量
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
        rider_count: Number(seriesData[index]) || 0
      }));

      // 按骑手数量排序（从高到低）
      regionArray.sort((a, b) => b.rider_count - a.rider_count);

      // 计算总骑手数用于占比计算
      const totalRiders = regionArray.reduce((sum, item) => sum + item.rider_count, 0);

      // 添加占比字段，并限制显示前50条
      this.regionRankingData = regionArray.slice(0, 50).map(item => ({
        ...item,
        percentage: totalRiders > 0 ? (item.rider_count / totalRiders * 100).toFixed(1) : 0
      }));

      console.log('✅ 处理后的行政区骑手排名数据:', this.regionRankingData);
      console.log('📊 数据条数:', this.regionRankingData.length);
      console.log('📋 前三名数据:', this.regionRankingData.slice(0, 3));
      console.log('📊 总骑手数:', totalRiders);

      // 验证数据映射关系
      console.log('🔍 验证数据映射关系:');
      this.regionRankingData.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.region_name}: ${item.rider_count}人 (${item.percentage}%)`);
      });
    },

    // 切换排名类型
    changeRankingType(type) {
      if (this.rankingType === type) return;
      
      this.rankingType = type;
      console.log('🔄 切换排名类型:', type);
      
      // 清空数据
      this.regionRankingData = null;
      this.zoneRankingData = null;
      
      if (type === 'admin') {
        // 切换到行政区域排名
        this.loadRegionRiderRankingData();
      } else if (type === 'zone') {
        // 切换到独立区域，先加载区域数据
        this.loadZoneData();
      }
    },

    // 切换地区类型
    changeRegionType(type) {
      if (this.regionType === type) return;

      this.regionType = type;
      console.log('🔄 切换地区类型:', type);

      // 重新加载数据
      this.loadRegionRiderRankingData();
    },

    // 加载服务商区域数据
    async loadZoneData() {
      if (this.zoneDataLoading) return;
      
      // 先检查缓存
      const cachedData = this.getCachedZoneData();
      if (cachedData) {
        this.zoneTreeData = cachedData;
        console.log('✅ 使用缓存的服务商区域数据:', this.zoneTreeData.length, '个省份');
        return;
      }
      
      this.zoneDataLoading = true;
      
      try {
        // 获取用户信息
        if (!this.riderUserInfo || !this.riderUserInfo.id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        const params = {
          service_member_id: this.riderUserInfo.id,
          service_provider_id: 1,
          sign: "chongchong"
        };
        
        console.log('服务商区域请求参数:', params);
        
        const res = await this.$request('service/group/zones', params, 'POST');
        
        console.log('🔍 服务商区域数据响应:', res);
        
        if (res.status === 'success' && res.data && res.data.service_zones) {
          // 处理区域数据，生成树形结构
          const zones = res.data.service_zones;
          const treeData = this.processZoneTreeData(zones);
          this.zoneTreeData = treeData;
          
          // 缓存数据
          this.setCachedZoneData(treeData);
          
          console.log('✅ 服务商区域数据加载成功:', this.zoneTreeData.length, '个省份');
        } else {
          this.zoneTreeData = [];
          console.log('❌ 服务商区域数据加载失败:', res.msg || '数据格式错误');
        }
      } catch (error) {
        console.error('获取服务商区域数据失败:', error);
        this.zoneTreeData = [];
        uni.showToast({
          title: '获取区域数据失败',
          icon: 'none'
        });
      } finally {
        this.zoneDataLoading = false;
      }
    },

    // 获取缓存的区域数据
    getCachedZoneData() {
      try {
        const expiry = uni.getStorageSync(this.zoneCacheExpiry);
        const now = Date.now();
        
        if (!expiry || now > expiry) {
          console.log('🗑️ 区域数据缓存已过期');
          // 清除过期缓存
          uni.removeStorageSync(this.zoneCacheKey);
          uni.removeStorageSync(this.zoneCacheExpiry);
          return null;
        }
        
        const cachedData = uni.getStorageSync(this.zoneCacheKey);
        if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
          console.log('📦 使用缓存的区域数据');
          return cachedData;
        }
      } catch (error) {
        console.error('读取区域数据缓存失败:', error);
      }
      return null;
    },

    // 设置缓存的区域数据
    setCachedZoneData(data) {
      try {
        const expiry = Date.now() + this.cacheValidDuration;
        uni.setStorageSync(this.zoneCacheKey, data);
        uni.setStorageSync(this.zoneCacheExpiry, expiry);
        console.log('💾 区域数据已缓存，有效期至:', new Date(expiry).toLocaleString());
      } catch (error) {
        console.error('设置区域数据缓存失败:', error);
      }
    },

    // 处理区域数据为树形结构
    processZoneTreeData(zones) {
      console.log('🔄 处理区域数据为树形结构:', zones.length, '条原始数据');
      
      if (!Array.isArray(zones) || zones.length === 0) {
        console.warn('区域数据为空或格式错误');
        return [];
      }
      
      // 按省份分组数据
      const provinceMap = new Map();
      
      zones.forEach((zone, index) => {
        // 验证必要的字段
        if (!zone || typeof zone !== 'object') {
          console.warn(`第${index}条区域数据格式错误:`, zone);
          return;
        }
        
        if (!zone.province_id || !zone.city_id || !zone.district_id) {
          console.warn(`第${index}条区域数据缺少必要ID:`, zone);
          return;
        }
        
        const provinceKey = zone.province_id;
        
        if (!provinceMap.has(provinceKey)) {
          provinceMap.set(provinceKey, {
            id: zone.province_id,
            name: zone.province_name || '未知省份',
            type: 'province',
            cities: new Map()
          });
        }
        
        const province = provinceMap.get(provinceKey);
        const cityKey = zone.city_id;
        
        if (!province.cities.has(cityKey)) {
          province.cities.set(cityKey, {
            id: zone.city_id,
            name: zone.city_name || '未知城市',
            type: 'city',
            full_name: `${zone.province_name || '未知省份'} ${zone.city_name || '未知城市'}`,
            province_id: zone.province_id,
            districts: []
          });
        }
        
        const city = province.cities.get(cityKey);
        city.districts.push({
          id: zone.district_id,
          name: zone.district_name || '未知区县',
          type: 'district',
          full_name: `${zone.province_name || '未知省份'} ${zone.city_name || '未知城市'} ${zone.district_name || '未知区县'}`,
          province_id: zone.province_id,
          city_id: zone.city_id
        });
      });
      
      // 转换为数组格式并排序
      const treeData = Array.from(provinceMap.values()).map(province => {
        const cities = Array.from(province.cities.values()).map(city => ({
          ...city,
          districts: city.districts.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh-CN'))
        })).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh-CN'));
        
        return {
          ...province,
          cities: cities
        };
      }).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh-CN'));
      
      console.log('✅ 处理后的树形区域数据:', {
        provinces: treeData.length,
        totalCities: treeData.reduce((sum, p) => sum + (p.cities ? p.cities.length : 0), 0),
        totalDistricts: treeData.reduce((sum, p) => sum + (p.cities ? p.cities.reduce((citySum, c) => citySum + (c.districts ? c.districts.length : 0), 0) : 0), 0)
      });
      
      // 验证处理后的数据
      treeData.forEach((province, pIndex) => {
        if (!province.id) {
          console.warn(`省份${pIndex}缺少ID:`, province);
        }
        if (province.cities) {
          province.cities.forEach((city, cIndex) => {
            if (!city.id) {
              console.warn(`城市${cIndex}缺少ID:`, city);
            }
            if (city.districts) {
              city.districts.forEach((district, dIndex) => {
                if (!district.id) {
                  console.warn(`区县${dIndex}缺少ID:`, district);
                }
              });
            }
          });
        }
      });
      
      return treeData;
    },

    // 切换省份展开状态
    toggleProvince(provinceId) {
      if (provinceId === undefined || provinceId === null) {
        console.warn('省份ID为空，无法切换展开状态');
        return;
      }
      this.$set(this.expandedProvinces, provinceId, !this.expandedProvinces[provinceId]);
    },

    // 选择区域（城市或区县）
    selectZone(zone) {
      if (!zone || !zone.id) {
        console.warn('选择的区域数据无效:', zone);
        uni.showToast({
          title: '区域数据无效',
          icon: 'none'
        });
        return;
      }

      this.selectedZoneId = zone.id;
      this.selectedZoneName = zone.full_name || zone.name || '未知区域';
      this.selectedZoneType = zone.type;
      // 不再隐藏选择器，保持展示状态
      
      console.log('🌍 选择区域:', zone);
      
      // 根据区域类型调用不同的接口
      if (zone.type === 'city') {
        this.loadZoneRiderData(zone.id, 'city');
      } else if (zone.type === 'district') {
        this.loadZoneRiderData(zone.id, 'district');
      } else {
        console.warn('未知的区域类型:', zone.type);
      }
    },

    // 获取区域类型文本
    getZoneTypeText(type) {
      const typeMap = {
        'city': '城市',
        'district': '区县',
        'province': '省份'
      };
      return typeMap[type] || '未知';
    },

    // 加载独立区域骑手数量数据
    async loadZoneRiderData(zoneId, zoneType = 'city') {
      if (this.zoneRankingLoading) return;
      
      this.zoneRankingLoading = true;
      
      try {
        const params = {
          service_member_id: this.riderUserInfo.id,
          type: zoneType, // 传入实际的区域类型
          parent_region_id: zoneId,
          timestamp: Math.floor(Date.now() / 1000),
          sign: "chongchong"
        };
        
        console.log('独立区域骑手数量请求参数:', params);
        
        const res = await this.$request('data/region/member', params, 'POST');
        
        console.log('🔍 独立区域骑手数量数据响应:', res);
        
        if (res.status === 'success' && res.data) {
          this.processZoneRankingData(res.data);
        } else {
          this.zoneRankingData = [];
          console.log('❌ 独立区域骑手数量数据加载失败:', res.msg);
          if (res.msg) {
            uni.showToast({
              title: res.msg,
              icon: 'none'
            });
          }
        }
      } catch (error) {
        console.error('获取独立区域骑手数量数据失败:', error);
        this.zoneRankingData = [];
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.zoneRankingLoading = false;
      }
    },

    // 处理独立区域骑手数量数据
    processZoneRankingData(data) {
      console.log('🔄 处理独立区域骑手数量数据:', data);
      
      // 检查数据格式：可能是嵌套的 {data: {categories, series}} 或直接的 {categories, series}
      let chartData = data;
      if (data.data && data.data.categories && data.data.series) {
        console.log('📋 发现嵌套数据格式，提取内层数据');
        chartData = data.data;
      }
      
      if (!chartData.categories || !chartData.series || !Array.isArray(chartData.categories) || !Array.isArray(chartData.series)) {
        console.log('❌ 数据格式错误，缺少categories或series');
        this.zoneRankingData = [];
        return;
      }
      
      // 获取地区名称和骑手数量
      const categories = chartData.categories;
      const seriesData = chartData.series[0]?.data || [];
      
      console.log('📋 categories:', categories);
      console.log('📋 seriesData:', seriesData);
      
      // 组合数据并排序
      const regionArray = categories.map((regionName, index) => ({
        region_name: regionName,
        rider_count: Number(seriesData[index]) || 0
      }));
      
      // 按骑手数量排序（从高到低）
      regionArray.sort((a, b) => b.rider_count - a.rider_count);
      
      // 计算总骑手数用于占比计算
      const totalRiders = regionArray.reduce((sum, item) => sum + item.rider_count, 0);
      
      // 添加占比字段，并限制显示前50条
      this.zoneRankingData = regionArray.slice(0, 50).map(item => ({
        ...item,
        percentage: totalRiders > 0 ? (item.rider_count / totalRiders * 100).toFixed(1) : 0
      }));
      
      console.log('✅ 处理后的独立区域骑手数量数据:', this.zoneRankingData);
    },

    // 格式化百分比显示
    formatPercentage(percentage) {
      if (!percentage && percentage !== 0) {
        return '0.0';
      }
      return Number(percentage).toFixed(1);
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

// 排名类型过滤器
.ranking-type-filter {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 20rpx;
  padding: 4rpx;
  border: 1rpx solid #e8e8e8;

  .filter-item {
    padding: 8rpx 16rpx;
    font-size: 24rpx;
    color: #666;
    border-radius: 16rpx;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 80rpx;
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
}

// 子级标题和过滤器
.ranking-sub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.ranking-sub-title {
  font-size: 24rpx;
  font-weight: 500;
  color: #666;
}

.region-filter {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 20rpx;
  padding: 4rpx;
  border: 1rpx solid #e8e8e8;
}

// 已选区域显示
.selected-zone-display {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.selected-zone-text {
  font-size: 24rpx;
  color: #6c5ce7;
  background-color: #f0f0ff;
  padding: 8rpx 12rpx;
  border-radius: 12rpx;
  border: 1rpx solid #e0e0ff;
}

.filter-item {
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
    background-color: #6c5ce7;
    color: #fff;
    font-weight: 500;
  }
}

// 区域选择器
.zone-selector {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.zone-select-btn {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  background-color: #f8f9fa;
  border: 1rpx solid #e8e8e8;
  border-radius: 16rpx;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
    background-color: #e8e8e8;
  }
}

.zone-select-text {
  font-size: 24rpx;
  color: #666;
  margin-right: 8rpx;
}

.zone-select-arrow {
  font-size: 20rpx;
  color: #999;
  transition: transform 0.3s ease;

  &.expanded {
    transform: rotate(180deg);
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
  
  &.rider-count {
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
  
  &.rider-count {
    flex: 0 0 120rpx;
    font-weight: 500;
    color: #6c5ce7;
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

// 内联区域选择器
.zone-picker-inline {
  background-color: #fff;
  border-radius: 12rpx;
  margin-top: 20rpx;
  border: 1rpx solid #e8e8e8;
  overflow: hidden;
}

.zone-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  background-color: #f8f9fa;
  border-bottom: 1rpx solid #f0f0f0;
}

.zone-picker-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.zone-picker-close {
  font-size: 24rpx;
  color: #6c5ce7;
  cursor: pointer;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  transition: all 0.3s ease;

  &:active {
    background-color: #f0f0ff;
    transform: scale(0.95);
  }
}

.zone-picker-content-inline {
  max-height: 500rpx;
  overflow-y: auto;
}

.zone-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300rpx;
  color: #999;
}

// 树形结构样式
.zone-tree-list {
  padding: 0;
}

.zone-tree-item {
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

// 省份级别
.zone-province-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:active {
    background-color: #e8e8e8;
  }
}

.zone-expand-icon {
  font-size: 20rpx;
  color: #666;
  margin-right: 12rpx;
  width: 20rpx;
  text-align: center;
  transition: transform 0.3s ease;
}

.zone-province-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  flex: 1;
}

.zone-province-count {
  font-size: 22rpx;
  color: #666;
  background-color: #e8e8e8;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
}

// 城市级别
.zone-city-list {
  background-color: #fff;
}

.zone-city-item {
  border-left: 4rpx solid #6c5ce7;
  margin-left: 30rpx;
}

.zone-city-name-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx 16rpx 20rpx;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-bottom: 1rpx solid #f8f9fa;

  &:active {
    background-color: #f0f0f0;
  }
}

.zone-city-name {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

// 区县级别
.zone-district-list {
  padding-left: 20rpx;
  background-color: #fafbfc;
}

.zone-district-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 30rpx 16rpx 20rpx;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: #e8e8e8;
  }
}

.zone-district-name {
  font-size: 24rpx;
  color: #666;
}

// 类型标签
.zone-type-tag {
  font-size: 20rpx;
  padding: 2rpx 6rpx;
  border-radius: 6rpx;
  
  &.city-tag {
    color: #6c5ce7;
    background-color: #f0f0ff;
    border: 1rpx solid #e0e0ff;
  }
  
  &.district-tag {
    color: #52c41a;
    background-color: #f0fff0;
    border: 1rpx solid #e0ffe0;
  }
}

.zone-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300rpx;
  color: #999;
  font-size: 24rpx;
}
</style>
