# 订单详情页集成价格明细组件示例

## 完整代码示例

以下是在订单详情页集成价格明细查看功能的完整示例代码：

```vue
<template>
  <view class="order-detail-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="订单详情" />

    <!-- 订单信息卡片 -->
    <view class="order-card">
      <view class="order-header">
        <text class="order-number">订单编号：{{ orderInfo.task_id }}</text>
        <text class="order-status">{{ orderInfo.status_text }}</text>
      </view>

      <!-- 订单基本信息 -->
      <view class="order-info">
        <view class="info-row">
          <text class="label">服务类型：</text>
          <text class="value">{{ orderInfo.service_type }}</text>
        </view>
        <view class="info-row">
          <text class="label">设备数量：</text>
          <text class="value">{{ orderInfo.item_number }}台</text>
        </view>
        <view class="info-row">
          <text class="label">服务地址：</text>
          <text class="value">{{ orderInfo.address }}</text>
        </view>
      </view>

      <!-- 价格信息 -->
      <view class="price-section">
        <view class="price-row">
          <text class="label">订单金额</text>
          <text class="amount">¥{{ orderInfo.order_amount }}</text>
        </view>
        <!-- 查看价格明细按钮 -->
        <view class="price-detail-btn" @click="showPriceDetail">
          <text class="btn-text">查看价格明细</text>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 更多订单信息... -->

    <!-- 价格明细组件 -->
    <price-detail-modal 
      ref="priceDetailModal" 
      :task-id="orderId" 
    />
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import PriceDetailModal from '@/components/PriceDetailModal/index.vue';

export default {
  components: {
    NavBar,
    PriceDetailModal
  },

  data() {
    return {
      orderId: '',          // 订单ID
      orderInfo: {}         // 订单信息
    };
  },

  onLoad(options) {
    // 获取订单ID
    this.orderId = options.id || '';
    
    // 加载订单详情
    this.loadOrderDetail();
  },

  methods: {
    /**
     * 加载订单详情
     */
    async loadOrderDetail() {
      try {
        uni.showLoading({ title: '加载中...' });

        // 调用API获取订单详情
        const res = await this.$request('task/detail', {
          task_id: this.orderId
        }, 'GET');

        if (res.code === 200) {
          this.orderInfo = res.data;
        }

      } catch (error) {
        console.error('加载订单详情失败:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },

    /**
     * 显示价格明细
     */
    showPriceDetail() {
      // 调用组件的打开方法
      this.$refs.priceDetailModal.openModal();
    }
  }
};
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.order-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 24rpx;
}

.order-number {
  font-size: 28rpx;
  color: #333;
}

.order-status {
  font-size: 28rpx;
  color: #2492F2;
  font-weight: 500;
}

.order-info {
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  margin-bottom: 16rpx;
  font-size: 28rpx;
}

.info-row .label {
  color: #666;
  min-width: 160rpx;
}

.info-row .value {
  color: #333;
  flex: 1;
}

.price-section {
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.price-row .label {
  font-size: 28rpx;
  color: #666;
}

.price-row .amount {
  font-size: 36rpx;
  color: #ff4d4f;
  font-weight: 600;
}

/* 查看价格明细按钮样式 */
.price-detail-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  margin-top: 16rpx;
}

.price-detail-btn .btn-text {
  font-size: 28rpx;
  color: #2492F2;
}

.price-detail-btn .arrow {
  font-size: 40rpx;
  color: #2492F2;
  font-weight: 300;
}
</style>
```

## 关键点说明

### 1. 组件引入

```javascript
import PriceDetailModal from '@/components/PriceDetailModal/index.vue';

export default {
  components: {
    PriceDetailModal
  }
}
```

### 2. 模板中使用

```vue
<!-- 传入订单ID作为props -->
<price-detail-modal 
  ref="priceDetailModal" 
  :task-id="orderId" 
/>
```

### 3. 触发显示

```javascript
methods: {
  showPriceDetail() {
    // 通过ref调用组件的openModal方法
    this.$refs.priceDetailModal.openModal();
  }
}
```

## 不同场景的使用方式

### 场景1：在订单列表中快速查看

```vue
<view 
  class="order-item" 
  v-for="order in orderList" 
  :key="order.task_id"
>
  <text>订单：{{ order.task_id }}</text>
  <button 
    size="mini" 
    @click="quickViewPrice(order.task_id)"
  >
    查看明细
  </button>
</view>

<!-- 组件 -->
<price-detail-modal ref="priceModal" :task-id="currentOrderId" />

<script>
export default {
  data() {
    return {
      orderList: [],
      currentOrderId: ''
    };
  },
  methods: {
    quickViewPrice(taskId) {
      this.currentOrderId = taskId;
      this.$nextTick(() => {
        this.$refs.priceModal.openModal();
      });
    }
  }
}
</script>
```

### 场景2：用户点击价格区域时显示

```vue
<view class="price-area" @click="showPriceDetail">
  <text class="price-label">总价</text>
  <text class="price-amount">¥{{ orderAmount }}</text>
  <text class="detail-hint">点击查看明细</text>
</view>

<price-detail-modal ref="priceDetailModal" :task-id="orderId" />
```

### 场景3：高价订单自动提示

```vue
<script>
export default {
  data() {
    return {
      orderInfo: null,
      showHighPriceTip: false
    };
  },
  onLoad(options) {
    this.orderId = options.id;
    this.loadOrderDetail();
  },
  methods: {
    async loadOrderDetail() {
      // 加载订单信息
      const res = await this.getOrderInfo();
      this.orderInfo = res.data;
      
      // 如果是高价订单，自动提示查看明细
      if (this.orderInfo.order_amount >= 100) {
        this.showHighPriceTip = true;
        
        // 3秒后自动隐藏提示
        setTimeout(() => {
          this.showHighPriceTip = false;
        }, 3000);
      }
    },
    
    showPriceDetail() {
      this.$refs.priceDetailModal.openModal();
    }
  }
}
</script>

<template>
  <!-- 高价订单提示 -->
  <view class="high-price-tip" v-if="showHighPriceTip">
    <text>💡 这是一笔高价订单，</text>
    <text class="link" @click="showPriceDetail">点击查看价格明细</text>
  </view>
</template>
```

## 样式自定义

如果需要自定义按钮样式，可以这样做：

```vue
<style scoped>
/* 自定义查看明细按钮 */
.custom-price-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 24rpx 40rpx;
  border-radius: 50rpx;
  text-align: center;
  font-size: 28rpx;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
}

.custom-price-btn:active {
  opacity: 0.8;
}
</style>
```

## 与其他组件组合使用

### 与订单操作按钮组合

```vue
<view class="order-actions">
  <button class="action-btn" @click="contactRider">联系骑手</button>
  <button class="action-btn" @click="showPriceDetail">价格明细</button>
  <button class="action-btn primary" @click="cancelOrder">取消订单</button>
</view>
```

### 在底部操作栏中

```vue
<view class="bottom-bar">
  <view class="price-info" @click="showPriceDetail">
    <text class="total-label">实付金额</text>
    <text class="total-amount">¥{{ orderAmount }}</text>
    <text class="detail-link">查看明细 ›</text>
  </view>
  <button class="pay-btn">立即支付</button>
</view>
```

## 注意事项

1. **订单ID传递**：确保正确传递 `task-id` 属性
2. **组件引用**：使用 `ref` 属性以便调用组件方法
3. **权限控制**：普通用户只能查看自己的订单明细
4. **加载提示**：组件内部已处理加载状态，无需额外处理
5. **错误处理**：组件内部已处理错误情况，会显示友好提示

## 调试技巧

### 检查组件是否正确加载

```javascript
mounted() {
  console.log('价格明细组件ref:', this.$refs.priceDetailModal);
  if (!this.$refs.priceDetailModal) {
    console.error('价格明细组件未正确加载！');
  }
}
```

### 检查订单ID是否正确

```javascript
showPriceDetail() {
  console.log('当前订单ID:', this.orderId);
  if (!this.orderId) {
    uni.showToast({
      title: '订单ID为空',
      icon: 'none'
    });
    return;
  }
  this.$refs.priceDetailModal.openModal();
}
```

## 完整的页面路径示例

假设你的订单详情页路径是：`pages/order/detail.vue`

在 `pages.json` 中确保已配置：

```json
{
  "pages": [
    {
      "path": "pages/order/detail",
      "style": {
        "navigationBarTitleText": "订单详情"
      }
    }
  ]
}
```

跳转到订单详情页并传递订单ID：

```javascript
uni.navigateTo({
  url: `/pages/order/detail?id=${orderId}`
});
```

---

以上就是在订单详情页集成价格明细组件的完整示例和各种使用场景。根据你的实际需求选择合适的集成方式即可。






