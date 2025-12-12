<template>
  <view class="quota-page">
    <nav-bar title="接单配额" title-align="center" :showBackButton="true"></nav-bar>
    <view class="nav-placeholder"></view>

    <!-- 准时履约奖接单配额 -->
    <view class="section-card">
      <view class="section-title-row">
        <view class="blue-line"></view>
        <text class="section-title">准时履约奖接单配额</text>
      </view>
      <view class="section-desc">再2单准时履约，可奖励接单配额1次</view>
      
      <view class="progress-container">
        <view class="progress-bar-bg">
          <view class="progress-bar-fill" :style="{ width: '60%' }"></view>
        </view>
        <view class="progress-segments">
          <view class="segment" v-for="i in 5" :key="i"></view>
        </view>
        <view class="bubble-tip" style="left: 60%">
          <text>配额+1次</text>
          <view class="bubble-arrow"></view>
        </view>
      </view>
    </view>

    <!-- 配额记录 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title-row">
          <view class="blue-line"></view>
          <text class="section-title">配额记录</text>
        </view>
        <view class="date-picker">
          <text>9月</text>
          <text class="triangle"></text>
        </view>
      </view>

      <view class="record-list">
        <view class="record-item" v-for="(item, index) in processedRecordList" :key="index">
          <view class="record-info">
            <view class="record-name">{{ item.name }}</view>
            <view class="record-date">{{ item.date }}</view>
          </view>
          <view class="record-value" :class="item.valueClass">
            <text>{{ item.displayValue }}</text>
            <text class="arrow-right">&gt;</text>
          </view>
        </view>
      </view>

      <view class="pagination">
        <text class="total-count">共4项</text>
        <view class="page-controls">
          <view class="page-btn disabled"><text class="page-arrow">‹</text></view>
          <view class="page-num active">1</view>
          <view class="page-btn"><text class="page-arrow">›</text></view>
        </view>
      </view>
    </view>

    <!-- 更多方法增配额 -->
    <view class="section-card">
      <view class="section-title-row">
        <view class="blue-line"></view>
        <text class="section-title">更多方法增配额</text>
      </view>

      <view class="method-list">
        <view class="method-item" v-for="(method, index) in methodList" :key="index">
          <view class="method-icon"></view>
          <view class="method-content">
            <view class="method-name">{{ method.name }}</view>
            <view class="method-desc">{{ method.desc }}</view>
          </view>
          <view class="action-btn">去完成</view>
        </view>
      </view>
      
      <view class="expand-more">
        <text class="arrow-down">︿</text>
        <text>点击查看更多</text>
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
      recordList: [
        { name: '接单—美团补宝X6', date: '2025-09-13', value: -1 },
        { name: '接单—美团补宝X6', date: '2025-09-13', value: -1 },
        { name: '下单—美团补宝X6', date: '2025-09-13', value: 1 },
        { name: '接单—美团补宝X6', date: '2025-09-13', value: -1 }
      ],
      methodList: [
        { name: '准时履约', desc: '每5单准时履约无投诉+1次接单配额' },
        { name: '自己下单', desc: '每下1单+2次接单配额' },
        { name: '推荐新用户', desc: '每推荐1名+3次接单配额' }
      ],
      riderUserInfo: null // 骑手信息
    }
  },
  computed: {
    processedRecordList() {
      return this.recordList.map(item => {
        return {
          ...item,
          valueClass: item.value > 0 ? 'positive' : (item.value < 0 ? 'negative' : ''),
          displayValue: item.value > 0 ? '+' + item.value : item.value
        }
      })
    }
  },
  onLoad() {
    // 页面加载时获取配额列表
    this.getQuotaList()
  },
  methods: {
    // 获取配额列表
    async getQuotaList() {
      try {
        // 从本地存储获取骑手信息
        const riderUserInfo = uni.getStorageSync('riderUserInfo')
        if (!riderUserInfo || !riderUserInfo.id) {
          console.error('获取骑手信息失败: 缺少必要参数')
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }

        this.riderUserInfo = riderUserInfo

        // 构建请求参数
        const params = {
          service_member_id: riderUserInfo.id,
          member_id: riderUserInfo.id,
          timestamp: Math.floor(Date.now() / 1000),
          sign: "chongchong"
        }

        console.log('配额列表查询参数:', params)

        // 显示加载提示
        uni.showLoading({
          title: '加载中...',
          mask: true
        })

        // 调用接口
        const res = await this.$request('service/quota/list', params, 'POST')

        // 隐藏加载提示
        uni.hideLoading()

        console.log('配额列表接口响应:', res)

        if (res.code === 200 && res.data) {
          // 处理返回的数据
          // 根据实际返回的数据结构进行处理
          // 这里假设返回的数据中包含配额记录列表
          if (res.data.list && Array.isArray(res.data.list)) {
            this.recordList = res.data.list
          }
        } else {
          console.warn('获取配额列表失败:', res.msg || res.message || '未知错误')
          uni.showToast({
            title: res.msg || res.message || '获取数据失败',
            icon: 'none'
          })
        }
      } catch (error) {
        // 隐藏加载提示
        uni.hideLoading()
        console.error('获取配额列表异常:', error)
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.quota-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.nav-placeholder {
  height: 180rpx; // 根据实际nav-bar高度调整
}

.section-card {
  background-color: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 12rpx;
}

.section-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  
  .blue-line {
    width: 6rpx;
    height: 32rpx;
    background-color: #2492F2;
    margin-right: 16rpx;
    border-radius: 4rpx;
  }
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
}

.section-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 30rpx;
  padding-left: 22rpx;
}

/* 进度条样式 */
.progress-container {
  position: relative;
  margin-top: 50rpx;
  margin-bottom: 30rpx;
  padding: 0 10rpx;
  
  .progress-bar-bg {
    height: 24rpx;
    background-color: #eee;
    border-radius: 12rpx;
    overflow: hidden;
    position: relative;
  }
  
  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
    border-radius: 12rpx;
  }
  
  .progress-segments {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 2rpx;
    box-sizing: border-box;
    pointer-events: none;
    
    .segment {
      width: 2rpx;
      height: 100%;
      background-color: #fff;
    }
  }
  
  .bubble-tip {
    position: absolute;
    top: -50rpx;
    transform: translateX(-50%);
    background-color: #2492F2;
    color: #fff;
    font-size: 20rpx;
    padding: 6rpx 12rpx;
    border-radius: 8rpx;
    white-space: nowrap;
    
    .bubble-arrow {
      position: absolute;
      bottom: -8rpx;
      left: 50%;
      transform: translateX(-50%);
      border-left: 8rpx solid transparent;
      border-right: 8rpx solid transparent;
      border-top: 8rpx solid #2492F2;
    }
  }
}

/* 配额记录样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  
  .date-picker {
    font-size: 26rpx;
    color: #2492F2;
    background-color: #eef6fe;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    
    .triangle {
      display: inline-block;
      width: 0;
      height: 0;
      border-left: 8rpx solid transparent;
      border-right: 8rpx solid transparent;
      border-top: 8rpx solid #2492F2;
      margin-left: 8rpx;
    }
  }
}

.record-list {
  .record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .record-info {
      .record-name {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 6rpx;
      }
      
      .record-date {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .record-value {
      font-size: 32rpx;
      display: flex;
      align-items: center;
      
      &.positive {
        color: #ff6b00;
      }
      
      &.negative {
        color: #2492F2;
      }
      
      .arrow-right {
        color: #ccc;
        font-size: 24rpx;
        margin-left: 10rpx;
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20rpx;
  
  .total-count {
    font-size: 24rpx;
    color: #999;
    margin-right: 20rpx;
  }
  
  .page-controls {
    display: flex;
    align-items: center;
    
    .page-btn {
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fff;
      border: 1rpx solid #ddd;
      border-radius: 4rpx;
      color: #666;
      font-size: 20rpx;
      
      .page-arrow {
        font-size: 26rpx;
      }
      
      &.disabled {
        color: #ccc;
        background-color: #f9f9f9;
      }
    }
    
    .page-num {
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #2492F2;
      color: #fff;
      border-radius: 4rpx;
      margin: 0 10rpx;
      font-size: 24rpx;
    }
  }
}

/* 更多方法样式 */
.method-list {
  .method-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    
    .method-icon {
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      border: 2rpx solid #4facfe;
      margin-right: 20rpx;
    }
    
    .method-content {
      flex: 1;
      
      .method-name {
        font-size: 30rpx;
        color: #333;
        margin-bottom: 6rpx;
      }
      
      .method-desc {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .action-btn {
      border: 1rpx solid #2492F2;
      color: #2492F2;
      font-size: 24rpx;
      padding: 8rpx 24rpx;
      border-radius: 30rpx;
    }
  }
}

.expand-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 30rpx;
  color: #999;
  font-size: 24rpx;
  
  .arrow-down {
    margin-top: 4rpx;
    font-size: 20rpx;
  }
}
</style>

