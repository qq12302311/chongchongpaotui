<template>
  <view class="login-page">
    <!-- 顶部导航栏 -->
    <view class="custom-nav-bar">
      <nav-bar
        title=" "
        title-align="center"
        :showBackButton="true"
        @back="goToLauncher"
        :backgroundColor="'transparent'"
        :textColor="'#ffffff'"
      ></nav-bar>
    </view>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 顶部背景 -->
    <view class="top-bg">
      <image class="logo" src="https://ccpt.qiniu.0871.cn/rider/logo.png" mode="aspectFit"></image>
      <view class="welcome-text">欢迎使用充充跑腿骑手端</view>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <view class="form-title">登录账号</view>

      <view class="input-group">
        <view class="input-label">手机号码</view>
        <view class="input-container">
          <text class="prefix">+86</text>
          <input
            type="number"
            v-model="phone"
            placeholder="请输入手机号码"
            maxlength="11"
            class="input"
            @input="handlePhoneInput"
            @focus="handleFocus"
            @blur="handleBlur"
            :cursor-spacing="20"
            :adjust-position="true"
          />
          <view class="clear-btn" v-if="phone" @click="clearPhone">
            <text class="clear-icon">×</text>
          </view>
        </view>
      </view>

      <view class="input-group">
        <view class="input-label">登录密码</view>
        <view class="input-container">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="请输入登录密码"
            class="input"
            @input="handlePasswordInput"
            @focus="handleFocus"
            @blur="handleBlur"
            :cursor-spacing="20"
            :adjust-position="true"
          />
          <view class="password-toggle" @click="togglePasswordVisibility">
            <image
              :src="showPassword ? 'https://ccpt.qiniu.0871.cn/rider/eye-open.png' : 'https://ccpt.qiniu.0871.cn/rider/eye-close.png'"
              mode="aspectFit"
              class="eye-icon"
            ></image>
          </view>
        </view>
      </view>

      <view class="forgot-password" @click="forgotPassword">忘记密码？</view>

      <button
        class="login-btn"
        :class="{ 'login-btn-active': isFormValid }"
        :disabled="!isFormValid"
        @click="handleLogin"
      >
        登录
      </button>

      <!-- 注册账号链接 -->
      <view class="register-link" @click="goToRegister">还没有账号？立即注册</view>
    </view>

    <!-- 底部信息 -->
    <view class="bottom-info">
      <view class="agreement">
        <view class="agreement-checkbox" @click="toggleAgreement">
          <view class="checkbox" :class="{ 'checked': isAgreementChecked }">
            <text class="checkbox-icon" v-if="isAgreementChecked">✓</text>
          </view>
          <text class="agreement-text">
            我已阅读并同意
            <text class="link" @click.stop="openAgreement('user')">《用户协议》</text>
            和
            <text class="link" @click.stop="openAgreement('privacy')">《隐私政策》</text>
          </text>
        </view>
      </view>
      <view class="copyright">© 2023 充充跑腿 版权所有</view>
    </view>

    <!-- 协议确认弹窗 -->
    <view class="agreement-modal" v-if="showModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">服务协议确认</text>
        </view>
        <view class="modal-body">
          <text class="modal-text">
            为了保障您的合法权益，请您仔细阅读并同意《用户协议》和《隐私政策》后继续使用我们的服务。
          </text>
          <view class="agreement-links">
            <text class="agreement-link" @click="openAgreement('user')">查看《用户协议》</text>
            <text class="agreement-link" @click="openAgreement('privacy')">查看《隐私政策》</text>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeModal">取消</button>
          <button class="modal-btn confirm-btn" @click="confirmAgreement">同意并登录</button>
        </view>
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
      phone: '',
      password: '',
      showPassword: false,
      isAgreementChecked: false,
      showModal: false
    }
  },
  computed: {
    isFormValid() {
      return this.phone.length != '' && this.password.length != '';
    }
  },
  methods: {
    handlePhoneInput(e) {
      this.phone = e.detail.value;
    },
    handlePasswordInput(e) {
      this.password = e.detail.value;
    },
    handleFocus() {
      // 处理输入框获得焦点
    },
    handleBlur() {
      // 处理输入框失去焦点
    },
    clearPhone() {
      this.phone = '';
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    handleLogin() {
      if (!this.phone || !this.password) {
        uni.showToast({
          title: '请输入手机号和密码',
          icon: 'none'
        });
        return;
      }

      if (!this.isAgreementChecked) {
        this.showAgreementModal();
        return;
      }

      this.performLogin();
    },
    showAgreementModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    confirmAgreement() {
      this.isAgreementChecked = true;
      this.showModal = false;
      this.performLogin();
    },
    performLogin() {

      // 显示加载提示
      uni.showLoading({
        title: '登录中...'
      });

      // 调用登录接口
      this.$request('service/member/login', {
        phone_number: this.phone,
        password: this.password
      }, 'POST').then(res => {
        if (res.code === 200) {
          const memberData = res.data.service_member;

          // 登录成功，保存token和用户信息
          uni.setStorageSync('riderUserInfo', {
            name: memberData.contact_person,
            id: memberData.service_member_id,
            phone: memberData.phone_number,
            submit_certification: memberData.submit_certification,
            depositPaid: Number(memberData.actual_deposit) >= Number(memberData.required_deposit),
            balance: memberData.balance,
            level: memberData.level,
            rate: memberData.rate,
            watermark: memberData.watermark,
            provider_id: memberData.service_provider_id,
            latest_certification: memberData.latest_certification,
			month_commission: memberData.month_commission,
			month_completed_tasks_count: memberData.month_completed_tasks_count,
			today_commission: memberData.today_commission,
			today_completed_tasks_count: memberData.today_completed_tasks_count,
			zone: memberData.zone,
			withdraw_info: memberData.withdraw_info || null // 添加提现信息
          });

          // 提示登录成功
          uni.showToast({
            title: res.message || '登录成功',
            icon: 'success'
          });

          // 跳转到骑手端接单大厅
          uni.redirectTo({
            url: '/riderEnd/index'
          });
        } else {
          // 登录失败，显示错误信息
          uni.hideLoading();
          uni.showModal({
            title: '登录失败',
            content: res.message || '登录失败',
            showCancel: false
          });
        }
      }).catch(err => {
        // 处理请求错误
        uni.hideLoading();
        uni.showModal({
          title: '网络错误',
          content: '网络错误，请重试',
          showCancel: false
        });
        console.error('登录失败:', err);
      }).finally(() => {
        // 隐藏加载提示
        uni.hideLoading();
      });
    },
    forgotPassword() {
      uni.navigateTo({
        url: '/riderEnd/forgot-password'
      });
    },
    toggleAgreement() {
      this.isAgreementChecked = !this.isAgreementChecked;
    },
    openAgreement(type) {
      const url = type === 'user' ? '/riderEnd/user-agreement' : '/riderEnd/privacy-policy';
      uni.navigateTo({
        url: url
      });
    },
    goToRegister() {
      uni.navigateTo({
        url: '/riderEnd/register'
      });
    },
    goToLauncher() {
      uni.redirectTo({
        url: '/pages/launcher/index'
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.custom-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: linear-gradient(135deg, #2492F2, #1a7ad9);
}

.nav-placeholder {
  height: 90px; /* 根据实际导航栏高度调整 */
}

.top-bg {
  height: 400rpx; /* 增加高度 */
  background: linear-gradient(135deg, #2492F2, #1a7ad9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: -90px;
  padding-top: 60px;

  &::after {
    content: '';
    position: absolute;
    bottom: -40rpx;
    left: 0;
    right: 0;
    height: 80rpx;
    background-color: #fff;
    border-radius: 50% 50% 0 0;
  }

  .logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 20rpx;
  }

  .welcome-text {
    font-size: 32rpx;
    color: #fff;
    font-weight: 500;
  }
}

.login-form {
  flex: 1;
  padding: 60rpx 50rpx;
  position: relative;
  z-index: 1;

  .form-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 60rpx;
  }

  .input-group {
    margin-bottom: 40rpx;

    .input-label {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 20rpx;
    }

    .input-container {
      display: flex;
      align-items: center;
      height: 90rpx;
      border-bottom: 1rpx solid #e0e0e0;
      position: relative;
      padding: 0 10rpx;
      box-sizing: border-box;
      background-color: #fff;

      .prefix {
        font-size: 30rpx;
        color: #333;
        margin-right: 20rpx;
      }

      .input {
        flex: 1;
        height: 100%;
        font-size: 30rpx;
        color: #333;
        background-color: #fff;
        padding: 0;
        margin: 0;
        border: none;
        outline: none;
        -webkit-appearance: none;
        line-height: 90rpx;
      }

      .clear-btn, .password-toggle {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #fff;
      }

      .clear-icon {
        font-size: 40rpx;
        color: #999;
      }

      .eye-icon {
        width: 40rpx;
        height: 40rpx;
        opacity: 0.6;
      }
    }
  }

  .forgot-password {
    text-align: right;
    font-size: 26rpx;
    color: #2492F2;
    margin-bottom: 60rpx;
  }

  .login-btn {
    height: 90rpx;
    background-color: #e0e0e0;
    color: #fff;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 45rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;

    &-active {
      background-color: #2492F2;
      box-shadow: 0 10rpx 20rpx rgba(36, 146, 242, 0.2);
    }
  }

  .register-link {
    text-align: center;
    font-size: 28rpx;
    color: #2492F2;
    margin-top: 30rpx;
  }
}

.bottom-info {
  padding: 40rpx 50rpx;
  padding-bottom: calc(40rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  background-color: #fff;

  .agreement {
    margin-bottom: 20rpx;

    .agreement-checkbox {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      .checkbox {
        width: 36rpx;
        height: 36rpx;
        border: 2rpx solid #ddd;
        border-radius: 8rpx;
        margin-right: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        flex-shrink: 0;

        &.checked {
          background-color: #2492F2;
          border-color: #2492F2;
          box-shadow: 0 2rpx 8rpx rgba(36, 146, 242, 0.3);
        }

        .checkbox-icon {
          color: #fff;
          font-size: 24rpx;
          font-weight: bold;
          line-height: 1;
        }
      }

      .agreement-text {
        font-size: 26rpx;
        color: #666;
        line-height: 1.4;
        flex: 1;

        .link {
          color: #2492F2;
          text-decoration: underline;
        }
      }
    }
  }

  .copyright {
    font-size: 22rpx;
    color: #bbb;
    text-align: center;
  }
}

/* 协议确认弹窗样式 */
.agreement-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;

  .modal-content {
    background-color: #fff;
    border-radius: 20rpx;
    margin: 40rpx;
    max-width: 600rpx;
    width: 100%;
    overflow: hidden;

    .modal-header {
      padding: 40rpx 40rpx 20rpx;
      text-align: center;
      border-bottom: 1rpx solid #f0f0f0;

      .modal-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .modal-body {
      padding: 40rpx;

      .modal-text {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
        margin-bottom: 30rpx;
        display: block;
      }

      .agreement-links {
        display: flex;
        flex-direction: column;
        gap: 20rpx;

        .agreement-link {
          color: #2492F2;
          font-size: 26rpx;
          text-decoration: underline;
          text-align: center;
          padding: 10rpx;
        }
      }
    }

    .modal-footer {
      display: flex;
      border-top: 1rpx solid #f0f0f0;

      .modal-btn {
        flex: 1;
        height: 100rpx;
        border: none;
        font-size: 32rpx;
        background-color: transparent;

        &.cancel-btn {
          color: #999;
          border-right: 1rpx solid #f0f0f0;
        }

        &.confirm-btn {
          color: #2492F2;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
