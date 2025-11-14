# 价格明细功能快速开始指南

## 一、部署步骤（5分钟完成）

### 步骤 1：创建数据库集合

1. 登录 uniCloud 控制台
2. 选择你的云空间
3. 进入"云数据库" → "数据库"
4. 点击"新建集合"
5. 集合名称：`price_details`
6. 点击"确定"
7. 进入集合详情，点击"DB Schema" 标签
8. 将 `uniCloud-aliyun/database/price_details.schema.json` 的内容粘贴进去
9. 点击"保存"

### 步骤 2：上传云函数

#### 2.1 上传 save-price-details 云函数

1. 在 HBuilderX 中，右键点击 `uniCloud-aliyun/cloudfunctions/save-price-details`
2. 选择"上传部署"
3. 等待上传完成

#### 2.2 上传 get-price-details 云函数

1. 在 HBuilderX 中，右键点击 `uniCloud-aliyun/cloudfunctions/get-price-details`
2. 选择"上传部署"
3. 等待上传完成

### 步骤 3：验证部署

1. 在 uniCloud 控制台，进入"云函数"
2. 确认看到 `save-price-details` 和 `get-price-details` 两个云函数
3. 状态显示为"运行中"

## 二、测试功能

### 测试保存价格明细

1. 在小程序中完成一次订单下单和支付流程
2. 支付成功后，系统会自动保存价格明细
3. 查看控制台日志，应该看到：
   ```
   开始保存价格明细，订单ID: xxx
   价格明细保存成功
   ```

### 测试查看价格明细

**方法一：在订单详情页添加查看按钮（推荐）**

1. 打开 `pages/order/detail.vue`（订单详情页）

2. 在 `<script>` 部分引入组件：

```javascript
import PriceDetailModal from '@/components/PriceDetailModal/index.vue';

export default {
  components: {
    PriceDetailModal
  },
  // ... 其他代码
}
```

3. 在 `<template>` 部分添加组件和按钮：

```vue
<template>
  <view>
    <!-- 你的订单详情内容 -->
    
    <!-- 添加查看价格明细按钮 -->
    <button class="price-detail-btn" @click="showPriceDetail">
      查看价格明细
    </button>
    
    <!-- 价格明细组件 -->
    <price-detail-modal ref="priceDetailModal" :task-id="orderId" />
  </view>
</template>
```

4. 在 `methods` 中添加方法：

```javascript
methods: {
  showPriceDetail() {
    this.$refs.priceDetailModal.openModal();
  }
}
```

5. 保存文件，重新编译运行

**方法二：使用云函数测试**

在 uniCloud 控制台测试：

1. 进入"云函数" → 选择 `get-price-details`
2. 点击"云端运行测试"
3. 输入测试参数：

```json
{
  "task_id": "你的订单ID",
  "user_id": "你的用户ID",
  "is_admin": false
}
```

4. 点击"运行"查看结果

## 三、验证数据

### 查看数据库记录

1. 进入 uniCloud 控制台
2. 打开"云数据库" → 选择 `price_details` 集合
3. 点击"查看数据"
4. 应该能看到刚才保存的价格明细记录

### 数据示例

```json
{
  "_id": "xxx",
  "task_id": "order_12345",
  "user_id": "user_67890",
  "created_at": "2024-01-01T12:00:00.000Z",
  "base_info": {
    "item_number": 10,
    "distance": 5.5
  },
  "price_summary": {
    "service_amount": 73,
    "total_amount": 63,
    "payment_amount": 68
  },
  "is_high_price": false
}
```

## 四、常见问题排查

### 问题1：云函数调用失败

**错误信息**：`cloud function not found`

**解决方案**：
1. 确认云函数已正确上传
2. 检查云函数名称是否正确（`save-price-details`, `get-price-details`）
3. 尝试重新上传云函数

### 问题2：数据保存失败

**错误信息**：`collection not found` 或 `database error`

**解决方案**：
1. 确认已创建 `price_details` 集合
2. 检查 DB Schema 是否正确配置
3. 查看云函数日志获取详细错误信息

### 问题3：查询不到数据

**可能原因**：
1. 订单ID不正确
2. 用户ID不匹配（非管理员只能查看自己的订单）
3. 数据尚未保存成功

**解决方案**：
1. 检查传入的订单ID是否正确
2. 如果是测试，可以设置 `is_admin: true`
3. 先确认数据库中是否有对应记录

### 问题4：组件无法显示

**可能原因**：
1. 组件路径不正确
2. uni-popup 组件未安装

**解决方案**：
1. 检查组件引入路径：`@/components/PriceDetailModal/index.vue`
2. 确保已安装 `uni-popup` 组件（通过 uni_modules 安装）

## 五、价格明细显示效果

成功部署后，用户可以看到如下内容：

### 订单基本信息
```
订单编号：order_12345
设备数量：10台
服务距离：5.50公里
计费说明：订单共10台设备，距离5.50公里。限时3小时内完成。
```

### 费用明细
```
基础服务费                               ¥40.00
├─ 基础设备费用（5台设备基础费用）        +¥30.00
└─ 额外设备费用（5台额外设备 × ¥2.00/台） +¥10.00

距离费                                   ¥20.00
├─ 基础距离费用（3.00公里内）             +¥15.00
└─ 超出距离费用（超出2.50公里...）        +¥5.00

时效费                                   ¥10.00
└─ 时间限制费用（限时3小时内完成）        +¥10.00

附加服务费                               ¥8.00
└─ 通电服务 - 基础费用（5个基础额度）     +¥8.00

优惠抵扣                                 -¥10.00
└─ 优惠券（券号：coupon_123）            -¥10.00

────────────────────────────────────
服务金额                                 ¥68.00
优惠抵扣                                 -¥10.00
订单金额                                 ¥58.00
骑手打赏                                 ¥5.00
────────────────────────────────────
实付金额                                 ¥63.00
```

## 六、下一步

功能已经可以正常使用了！你可以：

1. 📊 **查看更详细的文档**：`docs/price-details-feature.md`
2. 🎨 **自定义样式**：修改 `components/PriceDetailModal/index.vue` 中的样式
3. 💡 **调整高价阈值**：在云函数中修改 `highPriceThreshold` 的值
4. 🔧 **添加更多功能**：如导出PDF、分享等

## 七、技术支持

如果遇到问题：

1. 查看控制台日志
2. 检查云函数日志（uniCloud 控制台）
3. 查看数据库记录是否正常
4. 参考完整文档：`docs/price-details-feature.md`

祝使用愉快！🎉






