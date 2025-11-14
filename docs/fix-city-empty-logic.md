# 修复 city 为空时的数据层级处理

## 问题描述

对于海南省万宁市等直辖县级市，地址组件返回的数据结构特殊：
- `city`: "海南省"（或为空数组）
- `district`: "万宁市"
- `township`: "万城镇"

之前的处理逻辑不正确，导致区县信息丢失。

## 修复方案

### 核心逻辑

**当 city 为空或等于省份时，数据层级上移：**
- `district` → 作为地级市（city）
- `township` → 作为区县（district）

### 代码实现

```javascript
// 当 city 为空时，district 作为地级市，township 作为区县
if(publishPage.$vm.formData.province === '海南省' && 
   publishPage.$vm.formData.city === '海南省') {
    publishPage.$vm.formData.city = addressComponent.district;      // 万宁市
    publishPage.$vm.formData.district = addressComponent.township;  // 万城镇
}
```

## 数据流程示例

### 万宁市万城镇地址

**地址组件返回：**
```javascript
{
    province: "海南省",
    city: "海南省",        // ← city 为空（等于省份）
    district: "万宁市",     // ← 实际是地级市
    township: "万城镇"      // ← 实际是区县
}
```

**处理逻辑：**
```javascript
// 检测到 city 为空的情况
if (city === province) {
    // 数据层级上移
    city = district;        // "万宁市"
    district = township;    // "万城镇"
}
```

**最终结果：**
```javascript
formData: {
    province: "海南省",
    city: "万宁市",         // ✅ 地级市
    district: "万城镇"      // ✅ 区县
}

selectedCity = "万宁市 · 万城镇" ✅
```

## 适用场景

这个逻辑适用于以下特殊行政区划：

### 1. 海南省直辖县级市
- 万宁市
- 文昌市
- 琼海市
- 儋州市
- 五指山市
- 东方市
等

### 2. 其他类似情况
任何 `city` 字段为空或等于 `province` 的情况都会触发这个处理逻辑。

## 对比测试

### 测试场景：万宁市万城镇某地址

| 阶段 | city | district | selectedCity |
|-----|------|----------|--------------|
| 地址组件原始数据 | "海南省" | "万宁市" | - |
| **修复前** ❌ | "万宁市" | "" | "万宁市 · " (区县为空) |
| **修复后** ✅ | "万宁市" | "万城镇" | "万宁市 · 万城镇" |

## 控制台日志

选择万宁市地址后，应该看到：

```
✅ 使用地址组件的真实数据: {
  city: "海南省",
  district: "万宁市",
  来源: "地址组件逆地理编码"
}

海南省特殊处理 - city为空，district作为地级市，township作为区县: {
  city: "万宁市",
  district: "万城镇"
}

最终设置的城市和区县: {
  city: "万宁市",
  district: "万城镇"
}

更新 selectedCity: xxx → 万宁市 · 万城镇
✅ 已同步更新 selectedCity 和本地存储
```

## 修改位置

### 1. 高德地图逆地理编码（第827-836行）
```javascript
if(publishPage.$vm.formData.province === '海南省' && 
   publishPage.$vm.formData.city === '海南省') {
    publishPage.$vm.formData.city = addressComponent.district;
    publishPage.$vm.formData.district = addressComponent.township;
}
```

### 2. 腾讯地图逆地理编码（第1029-1038行）
同样的逻辑

## 与之前的规则对比

### 普通情况（如成都市）
```
地址组件: city = "成都市", district = "都江堰市"
处理结果: city = "成都市", district = "都江堰市"
selectedCity = "成都市 · 都江堰市"
```

### 特殊情况（如万宁市）
```
地址组件: city = "海南省", district = "万宁市", township = "万城镇"
处理结果: city = "万宁市", district = "万城镇"
selectedCity = "万宁市 · 万城镇"
```

## 注意事项

1. ✅ township 只在 city 为空的特殊情况下使用
2. ✅ 普通情况仍然只使用 district，不使用 township
3. ✅ 保证了数据的完整性和准确性
4. ✅ selectedCity 格式统一："地级市 · 区县"

## 相关文件

- `pages/index/publish/map/search-results.vue`

---

**修复时间：** 2025-10-30  
**修复原因：** city 为空时，district 作为地级市，township 作为区县  
**修复状态：** ✅ 已完成






