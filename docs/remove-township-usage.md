# 移除 Township 使用说明

## 修改内容

根据需求，已移除所有将 `township` 同步到 `district` 的逻辑，现在**只使用 `addressComponent.district`**。

## 修改位置

### 1. 高德地图逆地理编码（第803-817行）

**修改前：**
```javascript
// ❌ 会使用 township 覆盖 district
if (addressComponent.township && 
    addressComponent.township !== addressComponent.district) {
    districtValue = addressComponent.township;
}
```

**修改后：**
```javascript
// ✅ 只使用 district
districtValue = addressComponent.district || '';
```

### 2. 腾讯地图逆地理编码（第995-1013行）

**修改前：**
```javascript
// ❌ 会使用 township 覆盖 district
if (addressComponent.township && 
    addressComponent.township !== addressComponent.district) {
    districtValue = addressComponent.township;
}
```

**修改后：**
```javascript
// ✅ 只使用 district
districtValue = addressComponent.district || '';
```

### 3. 海南省万宁市特殊处理（两处）

**修改前：**
```javascript
// ❌ 使用 township
if(publishPage.$vm.formData.province === '海南省' && 
   publishPage.$vm.formData.city === '海南省') {
    publishPage.$vm.formData.city = addressComponent.district;
    publishPage.$vm.formData.district = addressComponent.township; // ← 使用了 township
}
```

**修改后：**
```javascript
// ✅ 不使用 township
if(publishPage.$vm.formData.province === '海南省' && 
   publishPage.$vm.formData.city === '海南省') {
    publishPage.$vm.formData.city = addressComponent.district;
    publishPage.$vm.formData.district = ''; // ← 保持为空
}
```

## 数据流程

现在的逻辑非常简单明确：

```
地址选择
    ↓
逆地理编码 API 返回
    ↓
addressComponent: {
    province: "四川省",
    city: "成都市",
    district: "都江堰市",  ← 只使用这个
    township: "幸福街道"   ← 完全忽略
}
    ↓
formData.district = "都江堰市"
selectedCity = "成都市 · 都江堰市"
```

## 测试验证

### 示例1：都江堰市地址

**地址组件返回：**
```javascript
{
    province: "四川省",
    city: "成都市",
    district: "都江堰市",
    township: "幸福街道"
}
```

**结果：**
- `formData.city` = "成都市"
- `formData.district` = "都江堰市" ✅（只使用 district）
- `selectedCity` = "成都市 · 都江堰市"

### 示例2：某街道地址

**地址组件返回：**
```javascript
{
    province: "广东省",
    city: "东莞市",
    district: "南城区",
    township: "鸿福路街道"
}
```

**结果：**
- `formData.city` = "东莞市"
- `formData.district` = "南城区" ✅（只使用 district，不使用 township）
- `selectedCity` = "东莞市 · 南城区"

## 优先级规则

1. **第一优先级：** `addressComponent.district`
2. **备用方案：** `selectedCity` 中的区县（仅当 district 为空时）
3. **完全忽略：** `addressComponent.township`

## 影响说明

- ✅ 区县信息更加标准化（只使用行政区划的区县级别）
- ✅ 避免街道/乡镇信息覆盖区县信息
- ✅ 数据更加清晰一致
- ⚠️ 海南省万宁市等特殊情况下，district 可能为空（已设置为空字符串）

## 修改文件

- `pages/index/publish/map/search-results.vue`

## 修改行数

- 第803-817行（高德地图）
- 第827-833行（海南省特殊处理）
- 第995-1013行（腾讯地图）
- 第1026-1032行（海南省特殊处理-腾讯地图）

---

**修改时间：** 2025-10-30  
**修改原因：** 用户要求只同步 district，不要同步 township  
**修改状态：** ✅ 已完成并验证






