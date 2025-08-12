<template>
  <view class="launcher-container">
    <!-- 背景图案 -->
    <view class="bg-pattern top-left"></view>
    <view class="bg-pattern bottom-right"></view>

    <!-- 标题区域 -->
    <view class="header">
      <view class="logo-container">
        <image class="logo" src="https://ccpt.qiniu.0871.cn/rider/login2.png" mode="aspectFit"></image>
      </view>
      <text class="title">充充跑腿</text>
      <text class="subtitle">为充电宝运维跑腿</text>
    </view>

    <!-- 按钮区域 -->
    <view class="button-container">
      <view class="button-wrapper">
        <button class="nav-button user-button" @click="navigateTo('user')">
          <view class="button-content">
            <view class="icon-container">
              <view class="user-icon"></view>
            </view>
            <view class="button-text">
              <text class="button-title">用户端</text>
              <text class="button-desc">发布订单 呼叫跑腿服务</text>
            </view>
            <view class="arrow-container">
              <view class="arrow-right"></view>
            </view>
          </view>
        </button>
      </view>

      <view class="button-wrapper">
        <button class="nav-button rider-button" @click="goToRider">
          <view class="button-content">
            <view class="icon-container">
              <image class="rider-img-icon" src="https://ccpt.qiniu.0871.cn/dianche2.png" mode="aspectFit" style="width:80rpx;height:80rpx;" />
            </view>
            <view class="button-text">
              <text class="button-title">骑手端</text>
              <text class="button-desc">接收订单 提供运维跑腿</text>
            </view>
            <view class="arrow-container">
              <view class="arrow-right"></view>
            </view>
          </view>
        </button>
      </view>
    </view>

    <!-- 底部版权信息 -->
    <view class="footer">
      <text class="copyright">© 2025 充充跑腿 版权所有</text>
      <view class="version-info">
        <text class="version">版本 {{ appVersion }}</text>
        <text v-if="hasUpdate" class="update-tip">发现新版本</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      appVersion: '',
      onlineVersion: '',
      hasUpdate: false
    }
  },
  onShow() {
    // 获取应用版本信息
    this.getAppVersion()
    // 检查线上版本更新
    this.checkOnlineVersion()
  },
  methods: {
    // 获取应用版本信息
    getAppVersion() {
      try {
        // 获取系统信息，包含应用版本
        const systemInfo = uni.getSystemInfoSync()

        // 尝试从系统信息中获取版本号
        if (systemInfo.appVersion) {
          this.appVersion = systemInfo.appVersion
        } else if (systemInfo.version) {
          this.appVersion = systemInfo.version
        } else {
          // 如果系统信息中没有版本号，使用manifest.json中的版本号
          this.appVersion = '1.0.0'
        }

        console.log('应用版本:', this.appVersion)
      } catch (error) {
        console.error('获取版本信息失败:', error)
        // 设置默认版本号
        this.appVersion = '1.0.0'
      }
    },

    // 检查线上版本更新
    checkOnlineVersion() {
      // #ifdef MP-WEIXIN
      try {
        const updateManager = uni.getUpdateManager()

        // 检查是否有新版本
        updateManager.onCheckForUpdate((res) => {
          console.log('检查更新结果:', res)
          if (res.hasUpdate) {
            this.hasUpdate = true
            console.log('发现新版本')

            // 监听新版本下载成功事件
            updateManager.onUpdateReady(() => {
              console.log('新版本下载完成')
              uni.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    // 应用新版本并重启
                    updateManager.applyUpdate()
                  }
                }
              })
            })

            // 监听新版本下载失败事件
            updateManager.onUpdateFailed(() => {
              console.log('新版本下载失败')
              uni.showToast({
                title: '更新失败，请稍后重试',
                icon: 'none'
              })
            })
          } else {
            console.log('当前已是最新版本')
          }
        })
      } catch (error) {
        console.error('检查更新失败:', error)
      }
      // #endif

      // #ifndef MP-WEIXIN
      console.log('当前平台不支持自动更新检查')
      // #endif
    },

    navigateTo(type) {
      let url = '';
      if (type === 'user') {
        url = '/pages/index/index';
      } else if (type === 'rider') {
        url = '/riderEnd/index';
      }

      if (url) {
        // 使用reLaunch方法，确保能够正确跳转
        uni.reLaunch({
          url: url,
          success: () => {
            console.log('跳转成功到', url);
          },
          fail: (err) => {
            console.error('reLaunch失败', err);
            // 如果reLaunch失败，尝试使用navigateTo
            uni.navigateTo({
              url: url,
              fail: (navErr) => {
                console.error('navigateTo也失败了', navErr);
                uni.showToast({
                  title: '页面跳转失败',
                  icon: 'none'
                });
              }
            });
          }
        });
      }
    },
    // 跳转到骑手端
    goToRider() {
      // 检查骑手是否已登录
      const riderUserInfo = uni.getStorageSync('riderUserInfo')
      if (riderUserInfo) {
        // 已登录，直接跳转到接单大厅
        uni.redirectTo({
          url: '/riderEnd/index'
        })
      } else {
        // 未登录，跳转到登录页
        uni.navigateTo({
          url: '/riderEnd/login'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.launcher-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 120rpx 40rpx 80rpx;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  width: 600rpx;
  height: 600rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(36, 146, 242, 0.1) 0%, rgba(36, 146, 242, 0.05) 50%, rgba(36, 146, 242, 0) 70%);

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: repeating-linear-gradient(
      45deg,
      rgba(36, 146, 242, 0.03),
      rgba(36, 146, 242, 0.03) 10px,
      rgba(36, 146, 242, 0.06) 10px,
      rgba(36, 146, 242, 0.06) 20px
    );
  }

  &.top-left {
    top: -300rpx;
    left: -300rpx;
  }

  &.bottom-right {
    bottom: -300rpx;
    right: -300rpx;
  }
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60rpx;
  margin-bottom: 80rpx;
  z-index: 1;

  .logo-container {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    // background-color: #fff;
    box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);
    padding: 20rpx;
  }

  .logo {
    width: 160rpx;
    height: 160rpx;
  }

  .title {
    font-size: 60rpx;
    font-weight: bold;
    color: #2492F2;
    margin-bottom: 20rpx;
    text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  }

  .subtitle {
    font-size: 32rpx;
    color: #666;
  }
}

.button-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  z-index: 1;
}

.button-wrapper {
  width: 100%;
  filter: drop-shadow(0 8rpx 16rpx rgba(0, 0, 0, 0.1));
}

.nav-button {
  width: 100%;
  height: 200rpx;
  border-radius: 20rpx;
  border: none;
  padding: 0;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);

  &:active {
    transform: translateY(4rpx);
    box-shadow: 0 6rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  &::after {
    border: none;
  }

  &::before {
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 0.15;
  }

  .button-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 40rpx;
    box-sizing: border-box;
  }
}

.user-button {
  background: linear-gradient(135deg, #2492F2 0%, #1a7fd9 100%);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.05) 10px,
      rgba(255, 255, 255, 0.1) 10px,
      rgba(255, 255, 255, 0.1) 20px
    );
  }
}

.rider-button {
  background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.05) 10px,
      rgba(255, 255, 255, 0.1) 10px,
      rgba(255, 255, 255, 0.1) 20px
    );
  }
}

.icon-container {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  flex-shrink: 0;
}

.rider-img-icon {
  width: 60rpx;
  height: 60rpx;
  display: block;
}

.user-icon, .rider-icon {
  width: 60rpx;
  height: 60rpx;
  position: relative;
}

.user-icon::before, .user-icon::after {
  content: '';
  position: absolute;
}

.user-icon::before {
  width: 30rpx;
  height: 30rpx;
  background-color: #fff;
  border-radius: 50%;
  top: 5rpx;
  left: 50%;
  transform: translateX(-50%);
}

.user-icon::after {
  width: 50rpx;
  height: 25rpx;
  background-color: #fff;
  border-radius: 40rpx 40rpx 0 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.rider-icon::before, .rider-icon::after {
  content: '';
  position: absolute;
}

.rider-icon::before {
  width: 50rpx;
  height: 25rpx;
  border: 3rpx solid #fff;
  border-radius: 3rpx;
  top: 10rpx;
  left: 50%;
  transform: translateX(-50%);
}

.rider-icon::after {
  width: 30rpx;
  height: 20rpx;
  border-left: 3rpx solid #fff;
  border-right: 3rpx solid #fff;
  border-bottom: 3rpx solid #fff;
  border-radius: 0 0 3rpx 3rpx;
  bottom: 10rpx;
  left: 50%;
  transform: translateX(-50%);
}

.button-text {
  flex: 1;
  display: flex;
  flex-direction: column;

  .button-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10rpx;
  }

  .button-desc {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.arrow-container {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .arrow-right {
    width: 16rpx;
    height: 16rpx;
    border-top: 3rpx solid rgba(255, 255, 255, 0.8);
    border-right: 3rpx solid rgba(255, 255, 255, 0.8);
    transform: rotate(45deg);
  }
}

.footer {
  margin-top: 80rpx;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;

  .copyright {
    font-size: 24rpx;
    color: #999;
  }

  .version-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;

    .version {
      font-size: 22rpx;
      color: #bbb;
    }

    .update-tip {
      font-size: 20rpx;
      color: #2492F2;
      background: rgba(36, 146, 242, 0.1);
      padding: 4rpx 12rpx;
      border-radius: 12rpx;
      border: 1rpx solid rgba(36, 146, 242, 0.3);
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>
