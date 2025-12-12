# 价格明细存储功能使用文档

## 功能概述

该功能实现了订单支付成功后自动保存详细价格明细到云数据库，方便用户随时查看价格计算详情，特别是对于高价订单，可以清晰地了解每一项费用的来源。

## 功能特点

1. **自动保存**：支付成功后自动保存价格明细，无需手动操作
2. **详细记录**：记录所有费用项目，包括基础服务费、距离费、时效费、附加服务费等
3. **价格快照**：保存服务商的价格配置快照，便于后续核对
4. **高价标记**：自动标记高价订单（默认阈值100元），便于重点关注
5. **随时查询**：支持用户随时查询订单的价格明细

## 文件结构

```
project/
├── uniCloud-aliyun/
│   ├── database/
│   │   └── price_details.schema.json          # 价格明细数据库表结构
│   └── cloudfunctions/
│       ├── save-price-details/                 # 保存价格明细云函数
│       │   ├── index.js
│       │   └── package.json
│       └── get-price-details/                  # 查询价格明细云函数
│           ├── index.js
│           └── package.json
├── components/
│   └── PriceDetailModal/                       # 价格明细查看组件
│       └── index.vue
└── pages/
    └── index/
        └── publish/
            └── index.vue                       # 发布页面（已修改）
```

## 数据库表结构

### price_details 集合

主要字段说明：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| task_id | String | 订单ID |
| user_id | String | 用户ID |
| service_provider_id | String | 服务商ID |
| base_info | Object | 基础信息（设备数量、距离等） |
| base_service_fee_detail | Object | 基础服务费明细 |
| distance_fee_detail | Object | 距离费明细 |
| time_limit_fee_detail | Object | 时效费明细 |
| additional_services | Array | 附加服务明细数组 |
| discount_detail | Object | 优惠明细 |
| rider_tip | Number | 骑手打赏 |
| price_summary | Object | 价格汇总 |
| provider_price_config | Object | 服务商价格配置快照 |
| is_high_price | Boolean | 是否高价订单 |
| calculation_note | String | 计费说明 |

## 云函数使用

### 1. save-price-details（保存价格明细）

**调用示例：**

```javascript
const result = await uniCloud.callFunction({
  name: 'save-price-details',
  data: {
    task_id: 'order_12345',              // 订单ID
    user_id: 'user_67890',               // 用户ID
    service_provider_id: 'sp_001',       // 服务商ID
    task_type_id: 'tt_001',              // 任务类型ID
    base_info: {
      item_number: 10,                   // 设备数量
      distance: 5.5,                     // 距离
      time_type: 'before_deadline',      // 时间类型
      time_limit: 3                      // 时间限制（小时）
    },
    price_details: {
      baseServiceFee: 30,                // 基础服务费
      extraDeviceFee: 10,                // 额外设备费
      distanceFee: 15,                   // 基础距离费
      extraDistanceFee: 5,               // 额外距离费
      timeLimitFee: 10,                  // 时效费
      wireFee: 5,                        // 电源线基础费
      extraWireFee: 0,                   // 电源线额外费
      powerFee: 8,                       // 通电费
      couponAmount: 10,                  // 优惠券金额
      riderTip: 5,                       // 骑手打赏
      serviceAmount: 73,                 // 服务金额
      total: 68                          // 总金额（减去优惠券后）+ 打赏
    },
    provider_config: {
      bubao_base_device: 5,
      bubao_base_device_fee: '30.00',
      // ... 其他配置
    }
  }
});

// 返回结果
{
  code: 200,
  message: '价格明细保存成功',
  data: {
    detail_id: 'detail_123',
    is_high_price: false,
    payment_amount: 68
  }
}
```

### 2. get-price-details（查询价格明细）

**调用示例：**

```javascript
const result = await uniCloud.callFunction({
  name: 'get-price-details',
  data: {
    task_id: 'order_12345',              // 订单ID（必填）
    user_id: 'user_67890',               // 用户ID（用于权限验证）
    is_admin: false                      // 是否管理员
  }
});

// 返回结果
{
  code: 200,
  message: '查询成功',
  data: {
    raw_data: { /* 原始数据 */ },
    formatted_data: { /* 格式化数据 */ }
  }
}
```

## 组件使用

### PriceDetailModal 组件

在订单详情页使用价格明细查看组件：

**步骤1：在页面中引入组件**

```vue
<template>
  <view>
    <!-- 订单详情页内容 -->
    <view class="order-info">
      <!-- ... -->
      <button @click="showPriceDetail">查看价格明细</button>
    </view>
    
    <!-- 价格明细组件 -->
    <price-detail-modal ref="priceDetailModal" :task-id="orderId" />
  </view>
</template>

<script>
import PriceDetailModal from '@/components/PriceDetailModal/index.vue';

export default {
  components: {
    PriceDetailModal
  },
  data() {
    return {
      orderId: ''
    };
  },
  onLoad(options) {
    this.orderId = options.id || '';
  },
  methods: {
    // 显示价格明细
    showPriceDetail() {
      this.$refs.priceDetailModal.openModal();
    }
  }
};
</script>
```

**步骤2：样式自定义（可选）**

组件已包含完整样式，如需自定义，可以通过覆盖样式实现。

## 价格明细展示内容

价格明细弹窗会展示以下内容：

### 1. 订单基本信息
- 订单编号
- 设备数量
- 服务距离
- 计费说明

### 2. 基础服务费
- 基础设备费用
- 额外设备费用（如有）

### 3. 距离费
- 基础距离费用
- 超出距离费用（如有）

### 4. 时效费
- 时间限制费用（如有）

### 5. 附加服务费
- 电源线服务
- 通电服务
- 处理异常
- 坏宝回收
- 加电源线
（根据实际选择的服务显示）

### 6. 骑手打赏
- 打赏金额（如有）

### 7. 优惠抵扣
- 优惠券抵扣金额（如有）

### 8. 价格汇总
- 服务金额
- 优惠抵扣
- 订单金额
- 骑手打赏
- **实付金额**

## 高价订单标识

系统会自动标记高价订单：

- **默认阈值**：100元
- **标记位置**：价格明细弹窗底部
- **提示内容**："此订单为高价订单，已保存详细价格明细供您随时查看"

如需修改高价阈值，在 `save-price-details/index.js` 中修改：

```javascript
// 判断是否为高价订单（这里设置阈值为100元，可根据实际情况调整）
const highPriceThreshold = 100; // 修改此值
```

## 注意事项

1. **云函数部署**：
   - 需要先在 uniCloud 后台创建 `price_details` 数据库集合
   - 上传并部署 `save-price-details` 和 `get-price-details` 云函数

2. **权限控制**：
   - 普通用户只能查看自己的订单价格明细
   - 管理员可以查看所有订单的价格明细（设置 `is_admin: true`）

3. **数据保存时机**：
   - 价格明细在支付成功后自动保存
   - 即使保存失败也不影响订单主流程

4. **价格配置快照**：
   - 系统会保存订单创建时的服务商价格配置
   - 即使后续服务商调整价格，也能准确查看历史订单的计费依据

## 扩展建议

1. **导出功能**：可以添加价格明细导出为PDF或图片的功能
2. **分享功能**：可以添加将价格明细分享给他人的功能
3. **对比功能**：可以添加多个订单价格对比的功能
4. **统计分析**：可以基于价格明细数据进行用户消费分析

## 技术支持

如有问题，请联系技术支持团队。






