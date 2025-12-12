# CLAUDE.md

Always communicate in Chinese

Record my daily development habits in the CLAUDE.md file

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

不要动我改的代码

## Project Overview

This is 充充跑腿 (ChongChong Errands), a comprehensive delivery and errand service application built with UniApp framework. The project supports multiple platforms including WeChat Mini Program, H5 web app, and mobile apps.

## Technology Stack

- **Framework**: UniApp (Vue 2)
- **UI Library**: uView Plus 3.4.12
- **Additional Libraries**: 
  - @dcloudio/uni-ui (UniApp official components)
  - crypto-js (encryption)
  - md5 (hashing)
- **Backend**: uniCloud (Aliyun)
- **Maps**: Amap (高德地图) integration

## Architecture Structure

### Multi-End Application Structure

The project consists of three main ends:

1. **User End** (`pages/`): Customer-facing application
   - Home, order management, chat, profile
   - Order publishing and tracking
   - Payment and review system

2. **Rider End** (`riderEnd/` subpackage): Delivery personnel interface
   - Order acceptance and management  
   - Commission tracking and withdrawal
   - Account management and verification

3. **Admin End** (`adminEnd/` subpackage): Management dashboard
   - User and rider management
   - Order analytics and data analysis
   - Service provider and zone management
   - Withdrawal approval system

### Key Directories

- `pages/`: Main user application pages
- `riderEnd/`: Rider-specific pages (subpackage)
- `adminEnd/`: Admin dashboard pages (subpackage)  
- `components/`: Reusable UI components
- `uniCloud-aliyun/`: Backend cloud functions and database schemas
- `utils/`: Utility functions and map SDK integrations
- `mixins/`: Shared Vue mixins
- `static/`: Static assets and images
- `uni_modules/`: UniApp plugin modules

## Development Workflow

### Development Environment

This project is designed for **HBuilderX IDE** (DCloud's official UniApp development environment). The project structure and configuration are optimized for HBuilderX's build system.

### Running the Project

Since this project uses HBuilderX, typical development commands are executed through the IDE:

**Through HBuilderX GUI:**
- **Run > Run to Browser**: Start H5 development server
- **Run > Run to Mini Program**: Test in WeChat Mini Program simulator  
- **Run > Run to Phone**: Test on physical device via HBuilderX
- **Publish > Publish to Web**: Build H5 production version
- **Publish > Publish to Mini Program**: Build Mini Program for release

**Alternative CLI Commands** (if UniApp CLI is installed):
```bash
# Development
uni-app dev                    # Default development
uni-app dev --platform h5      # H5 development  
uni-app dev --platform mp-weixin # WeChat Mini Program development
uni-app dev --platform app-plus  # App development

# Production builds
uni-app build                  # Default build
uni-app build --platform h5    # H5 production build
uni-app build --platform mp-weixin # Mini Program build
uni-app build --platform app-plus  # App build
```

### Configuration Files

- **`manifest.json`**: Main UniApp configuration (app info, permissions, platform settings)
- **`pages.json`**: Page routing, navigation, and tab bar configuration  
- **`App.vue`**: Global app component and styles
- **`uni.scss`**: Global SCSS variables and uView Plus theme
- **`tsconfig.json`**: TypeScript configuration (if using TS)

## Backend Integration

### uniCloud Setup

The project uses uniCloud (Aliyun) for backend services:

- **Cloud Functions**: Located in `uniCloud-aliyun/cloudfunctions/`
  - `send-sms/`: SMS sending functionality
  - `verify-sms/`: SMS verification logic
- **Database Schemas**: Located in `uniCloud-aliyun/database/`
  - `verification_codes.schema.json`: SMS verification code schema

### Map Integration

The app integrates with multiple map services:
- **Amap (高德地图)**: Primary map service with API key configured
- **Baidu Maps**: Alternative map service (`utils/bmap-wx.js`)
- **QQ Maps**: Additional map support (`utils/qqmap-wx-jssdk.js`)

## Key Features & Components

### Component System

The project uses a hybrid component approach:
- **Global Components**: Auto-registered via easycom in `pages.json`
- **uView Plus Components**: UI framework components (prefix: `uview-plus-`)
- **Custom Components**: Project-specific components in `components/`
- **Common Components**: Shared components with `common-` prefix

### Multi-Platform Support

Configured for deployment across:
- **H5 Web App**: Browser-based version
- **WeChat Mini Program**: Native WeChat integration
- **Android/iOS Apps**: Native mobile applications  
- **Other Platforms**: Alipay, Baidu, ByteDance mini programs

### Authentication & Security

- SMS-based user verification system
- Encrypted data transmission (crypto-js, md5)
- Role-based access control (user/rider/admin)
- Location permissions for delivery tracking

## Development Guidelines

### Code Style
- Uses Vue 2 composition with UniApp extensions
- SCSS preprocessing with global variables in `uni.scss`
- Custom navigation bars (`navigationStyle: "custom"`) throughout
- HarmonyOS Sans SC font family for consistency

### State Management
- Primarily uses Vue component state and props
- Global user state managed through mixins (`mixins/userMixin.js`)
- Local storage for user preferences and session data

### Platform-Specific Code
Use UniApp conditional compilation when needed:
```javascript
// #ifdef H5
// H5-specific code
// #endif

// #ifdef MP-WEIXIN  
// WeChat Mini Program specific code
// #endif

// #ifdef APP-PLUS
// App specific code  
// #endif
```

## Build Outputs

Built files are generated in `unpackage/` directory:
- `unpackage/dist/build/h5/`: H5 web build
- `unpackage/dist/build/mp-weixin/`: WeChat Mini Program build
- `unpackage/dist/build/app-plus/`: Native app build
- `unpackage/release/apk/`: Android APK files

## Recent Changes

### 2025-09-20: 修复腾讯地图API地址搜索镇名缺失问题

**问题描述**:
腾讯地图API在搜索地址时，返回的地址信息只包含街道名称，缺少镇名信息。例如搜索"广东省东莞市大岭山镇喜颜街3号4楼"时，返回数据格式为：
```json
{
  "city": "东莞市",
  "district": "东莞市",
  "nation": "中国",
  "province": "广东省",
  "street": "喜颜路"
}
```

**解决方案**:
1. 将腾讯地图API的`address_format`参数从`'short'`修改为`'long'`，获取更详细的地址格式
2. 对每个搜索结果使用腾讯地图的逆地理编码API(`reverseGeocoder`)获取完整地址信息
3. 使用`Promise.all`并行处理多个逆地理编码请求，提高性能
4. 优先使用逆地理编码返回的完整地址，其次使用搜索API返回的地址

**修改文件**:
- `pages/index/publish/map/index.vue` (第969-1082行的`searchWithTencentMap`方法)

**技术实现**:
- 使用Promise.all并行处理逆地理编码请求
- 增加错误处理，逆地理编码失败时使用原有逻辑
- 保持与原有代码风格和错误处理机制的一致性

**优化更新**:
基于腾讯地图逆地理编码返回的详细数据结构，进一步优化地址信息提取：
1. 优先使用`formatted_addresses.standard_address`字段，包含最完整的地址信息
2. 其次从`address_reference.town`中提取镇名信息，构建完整地址
3. 地址拼接顺序：省 + 市 + 区 + 镇 + 街道 + 门牌号
4. 确保镇名信息不丢失，解决"大岭山镇"等镇级行政区划缺失问题

### 2025-09-20: 修复店铺信息页面地址区域匹配逻辑

**问题描述**:
当用户在店铺信息页面选择包含镇名的地址时（如"大岭山镇"），系统的区域匹配逻辑无法正确识别该地址是否在服务范围内，导致"最终判断结果: false undefined"。

**根本原因**:
原有的地址匹配逻辑只进行精确字符串比较，当腾讯地图返回的详细地址包含镇名信息时，无法与服务区域列表中的区县名匹配。

**解决方案**:
1. 创建增强的地址匹配函数`isAddressMatch`，支持多种匹配模式
2. 精确匹配：完全相同的地址名称
3. 镇名提取匹配：从包含"镇"、"街道"、"乡"的地址中提取核心名称进行匹配
4. 双向匹配：支持"大岭山镇" ↔ "大岭山"的互相匹配
5. 行政区划关系匹配：处理镇属于市的层级关系

**修改文件**:
- `pages/index/publish/store-info/index.vue` (第482-553行的地址匹配逻辑)

**技术实现**:
- 使用正则表达式提取镇名核心部分
- 实现双向地址匹配算法
- 改用`find`方法替代`some`方法，确保能获取到匹配的区县ID
- 增强错误日志和调试信息

**深度修复更新**:
发现根本问题在于地址数据来源的不一致性：
1. **数据来源分析**: `selectedCity`来自用户首页选择 = "东莞市 · 大岭山镇"，`formData.district`来自地图API返回 = "东莞市"
2. **地图页面修复**: 优化地址组件解析逻辑，优先使用用户选择的城市信息设置district值
3. **店铺页面增强**: 增加备用匹配机制，当主要district匹配失败时使用selectedCity的区县信息
4. **双重保障**: 确保两个页面的地址数据保持一致性，提供多层级匹配机制

修改文件：
- `pages/index/publish/map/index.vue` (第1317-1373行地址数据设置逻辑)
- `pages/index/publish/store-info/index.vue` (第486-567行备用匹配逻辑)

### 2025-09-20: 取消门店地址弹窗

**修改描述**:
取消店铺信息页面的门店地址验证弹窗，不再检查地址与选中城市的匹配性。

**修改内容**:
1. 注释掉地址监听器中的弹窗触发逻辑
2. 注释掉模板中的地址弹窗组件
3. 保留相关数据结构以便后续需要时快速恢复

**修改文件**:
- `pages/index/publish/store-info/index.vue` (第352-355行弹窗触发逻辑，第323-331行弹窗组件)

### 2025-09-20: 优化地图API消耗，实现智能缓存机制

**问题描述**:
原有实现使用Promise.all并行处理逆地理编码，每次搜索20个结果就调用20次API，快速消耗配额。

**优化方案**:
1. **搜索阶段优化**: 移除搜索结果的批量逆地理编码，直接使用搜索API返回的地址信息
2. **按需加载**: 只在用户实际选择地址时才调用逆地理编码API
3. **智能缓存**: 实现基于经纬度的本地缓存机制，缓存1小时避免重复请求
4. **API降级**: 优先使用腾讯地图API，失败时降级到高德地图API
5. **缓存过期**: 自动检测和清理过期缓存数据

**性能提升**:
- API调用从 **N次搜索 × 20次逆地理编码** 减少到 **仅用户选择时1次**
- 减少API消耗约 **95%**
- 添加本地缓存，相同位置重复访问无需API调用

**修改文件**:
- `pages/index/publish/map/index.vue` (第984-1048行搜索优化逻辑)
- `pages/index/publish/map/search-results.vue` (第537-730行按需加载和缓存机制)

### 2025-09-20: 修复语法错误和代码结构问题

**问题描述**:
Module build failed: 语法错误 "Unexpected token, expected ',' (765:7)"

**根本原因**:
在优化API消耗的过程中，代码缩进和结构出现问题，导致JavaScript语法错误。

**修复内容**:
1. 修复 `processSelectedAddress` 方法的缩进结构
2. 清理重复和错误的代码片段
3. 统一if-else分支的缩进格式
4. 移除孤立的console.log和方法调用

**修改文件**:
- `pages/index/publish/map/search-results.vue` (第687-792行代码结构修复)

### 2025-09-22: 隐藏任务设置页面特定服务时效选项

**问题描述**:
管理端任务设置页面需要隐藏1、2、5、7小时的服务时效选项，简化界面并避免用户选择这些不需要的时效。

**解决方案**:
1. 修改`updateTimeOptions`方法，添加时效过滤逻辑
2. 在时间选项生成时过滤掉指定的小时数（1、2、5、7）
3. 更新默认时间选项数组，移除对应的配置项

**修改内容**:
1. **动态过滤**: 在`updateTimeOptions`方法中添加`hiddenHours = [1, 2, 5, 7]`数组
2. **条件判断**: 修改时间选项生成逻辑，使用`!hiddenHours.includes(hours)`过滤
3. **默认数据**: 更新data中的timeOptions默认数组，移除1、2、5、7小时的配置项

**修改文件**:
- `adminEnd/userSettings/taskSettings.vue` (第970-1000行默认时间选项，第1474-1487行过滤逻辑)

**技术实现**:
- 保持原有数据结构和索引不变，确保后端兼容性
- 仅在前端UI层面隐藏指定选项
- 过滤逻辑同时应用于初始默认数据和动态加载数据

### 2025-09-30: 修复iOS真机uniCloud本地调试连接失败问题

**问题描述**:
iOS真机运行时，短信发送功能报错"无法连接uniCloud本地调试服务，请检查当前客户端是否与主机在同一局域网下"，导致验证码无法发送。

**根本原因**:
`.hbuilderx/launch.json` 配置文件中所有平台的 `launchtype` 都设置为 `"local"`，导致应用尝试连接HBuilderX的本地调试服务。iOS设备无法连接到电脑的localhost地址。

**解决方案**:
1. 修改 `.hbuilderx/launch.json` 配置文件，将所有平台的 `launchtype` 从 `"local"` 改为 `"remote"`
2. 在云函数调用中添加 `local: false` 参数作为双重保障
3. 删除临时创建的 `vue.config.js` 配置文件（已无需要）

**修改文件**:
- `.hbuilderx/launch.json` (第6、9、12、15行：将 launchtype 从 local 改为 remote)
- `riderEnd/register.vue` (第782、689行：云函数调用添加 local: false 参数)

**技术要点**:
- `launchtype: "local"` 表示连接本地云函数调试服务
- `launchtype: "remote"` 表示连接云端（阿里云）正式云函数服务
- iOS真机调试时必须使用 `remote` 模式，避免网络连接问题
- 该配置对所有平台生效：default、h5、mp-weixin、app-plus