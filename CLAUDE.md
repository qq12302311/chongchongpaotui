# CLAUDE.md

Always communicate in Chinese

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- 把我的细节记录到记忆文件里