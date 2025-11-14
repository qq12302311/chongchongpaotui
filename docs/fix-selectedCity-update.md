# 修复地址选择后 selectedCity 未更新的问题

## 问题描述

**问题现象：**
- 本地存储的 `selectedCity` 值是 "成都市 · 双流区"
- 在地址搜索结果页选择地址后（例如都江堰市的地址）
- 地址数据中 `district` 是 "都江堰市"
- 但是选择后 `selectedCity` 的值没有更新，仍然是 "成都市 · 双流区"

**根本原因：**
在 `pages/index/publish/map/search-results.vue` 中，当用户选择地址后：
1. 只更新了 `formData.city` 和 `formData.district`
2. 没有同步更新 `selectedCity` 的本地存储值
3. 导致导航栏标题和其他地方显示的城市信息不正确

## 修复方案

在两个地方添加了 `selectedCity` 的同步更新逻辑：

### 1. 高德地图逆地理编码处理（第836-852行）

```javascript
// ========== 【修复】同步更新 selectedCity 的值 ==========
// 根据实际选择的地址更新 selectedCity
const finalCityValue = publishPage.$vm.formData.city;
const finalDistrictValue = publishPage.$vm.formData.district;

if (finalCityValue && finalDistrictValue) {
    const newSelectedCity = `${finalCityValue} · ${finalDistrictValue}`;
    console.log('更新 selectedCity:', selectedCity, '→', newSelectedCity);
    
    // 更新本地存储
    uni.setStorageSync('selectedCity', newSelectedCity);
    
    // 更新发布页面的 selectedCity
    publishPage.$vm.selectedCity = newSelectedCity;
    
    console.log('✅ 已同步更新 selectedCity 和本地存储');
}
```

### 2. 腾讯地图逆地理编码处理（第1016-1033行）

```javascript
// ========== 【修复】同步更新 selectedCity 的值 ==========
// 根据实际选择的地址更新 selectedCity
const finalCityValue = publishPage.$vm.formData.city;
const finalDistrictValue = publishPage.$vm.formData.district;

if (finalCityValue && finalDistrictValue) {
    const selectedCity = uni.getStorageSync('selectedCity') || '';
    const newSelectedCity = `${finalCityValue} · ${finalDistrictValue}`;
    console.log('腾讯地图 - 更新 selectedCity:', selectedCity, '→', newSelectedCity);
    
    // 更新本地存储
    uni.setStorageSync('selectedCity', newSelectedCity);
    
    // 更新发布页面的 selectedCity
    publishPage.$vm.selectedCity = newSelectedCity;
    
    console.log('✅ 已同步更新 selectedCity 和本地存储（腾讯地图）');
}
```

## 修复效果

修复后的行为：

1. **选择前：**
   - `selectedCity` = "成都市 · 双流区"
   - 导航栏显示：成都市 · 双流区

2. **选择都江堰市的地址后：**
   - 地址组件解析出：`city` = "成都市", `district` = "都江堰市"
   - 自动更新 `selectedCity` = "成都市 · 都江堰市"
   - 同时更新本地存储和发布页面的 `selectedCity` 变量
   - 导航栏立即更新显示：成都市 · 都江堰市

3. **数据一致性：**
   - `formData.city` ✅ 已更新
   - `formData.district` ✅ 已更新
   - `selectedCity`（本地存储）✅ 已更新
   - `publishPage.$vm.selectedCity` ✅ 已更新

## 测试步骤

### 步骤 1：准备测试环境

1. 清除小程序缓存（可选）
2. 重新启动小程序
3. 在首页选择 "成都市 · 双流区"

### 步骤 2：选择不同区县的地址

1. 进入发布订单页面
2. 点击地址搜索
3. 搜索 "都江堰" 相关的地址
4. 选择一个都江堰市的地址

### 步骤 3：验证修复效果

**查看控制台日志：**
```
更新 selectedCity: 成都市 · 双流区 → 成都市 · 都江堰市
✅ 已同步更新 selectedCity 和本地存储
```

**查看导航栏：**
- 应该显示 "成都市 · 都江堰市"（而不是之前的 "成都市 · 双流区"）

**查看本地存储：**
```javascript
// 在控制台执行
uni.getStorageSync('selectedCity')
// 应该返回: "成都市 · 都江堰市"
```

**查看发布页面数据：**
```javascript
// 在控制台执行
getCurrentPages()[getCurrentPages().length - 1].$vm.selectedCity
// 应该返回: "成都市 · 都江堰市"

getCurrentPages()[getCurrentPages().length - 1].$vm.formData.city
// 应该返回: "成都市"

getCurrentPages()[getCurrentPages().length - 1].$vm.formData.district
// 应该返回: "都江堰市"
```

## 测试用例

### 用例1：跨区县选择地址

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 首页选择 "成都市 · 双流区" | selectedCity = "成都市 · 双流区" |
| 2 | 搜索并选择都江堰市的地址 | selectedCity 更新为 "成都市 · 都江堰市" |
| 3 | 查看导航栏 | 显示 "成都市 · 都江堰市" |

### 用例2：特殊行政区划（万宁市）

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 首页选择 "海南省 · 万宁市" | selectedCity = "海南省 · 万宁市" |
| 2 | 选择万宁市某街道的地址 | selectedCity 正确更新 |
| 3 | 验证 formData | city 和 district 正确处理特殊情况 |

### 用例3：直辖市（重庆）

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 首页选择 "重庆市 · 渝中区" | selectedCity = "重庆市 · 渝中区" |
| 2 | 选择其他区的地址（如江北区） | selectedCity 更新为 "重庆市 · 江北区" |
| 3 | 验证数据 | 所有相关数据同步更新 |

## 注意事项

1. **数据同步顺序：**
   - 先更新 `formData.city` 和 `formData.district`
   - 再根据最终值更新 `selectedCity`
   - 确保数据一致性

2. **特殊地区处理：**
   - 海南省万宁市等特殊行政区划有专门的处理逻辑
   - 在更新 `selectedCity` 之前已经完成了特殊处理

3. **兼容性：**
   - 同时支持高德地图和腾讯地图两种地图API
   - 两种API都有相同的 `selectedCity` 更新逻辑

4. **向后兼容：**
   - 如果 `finalCityValue` 或 `finalDistrictValue` 为空，不会更新 `selectedCity`
   - 保持原有行为，不会引入新的问题

## 相关文件

- `pages/index/publish/map/search-results.vue` - 主要修复文件
- `pages/index/publish/index.vue` - 发布页面（使用 selectedCity）

## 调试技巧

### 查看完整的地址选择流程日志

在控制台筛选以下关键词：
- "更新 selectedCity"
- "已同步更新 selectedCity"
- "最终设置的城市和区县"

### 实时监控 selectedCity 变化

```javascript
// 在控制台执行，监听 selectedCity 的变化
setInterval(() => {
  console.log('当前 selectedCity:', uni.getStorageSync('selectedCity'));
}, 3000);
```

### 比对修复前后的数据

**修复前：**
```
选择地址后：
- formData.district: "都江堰市" ✅
- selectedCity: "成都市 · 双流区" ❌ (未更新)
- 导航栏: "成都市 · 双流区" ❌ (显示错误)
```

**修复后：**
```
选择地址后：
- formData.district: "都江堰市" ✅
- selectedCity: "成都市 · 都江堰市" ✅ (已更新)
- 导航栏: "成都市 · 都江堰市" ✅ (显示正确)
```

## 总结

此次修复确保了用户在选择地址后，系统中所有与城市/区县相关的数据都能保持一致，包括：
- ✅ formData.city
- ✅ formData.district
- ✅ selectedCity（本地存储）
- ✅ publishPage.$vm.selectedCity
- ✅ 导航栏标题显示

这样可以避免因数据不一致导致的各种问题，提升用户体验。






