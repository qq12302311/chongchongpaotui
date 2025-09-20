<template>
  <view class="withdraw-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="提现" title-align="center" :showBackButton="true"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 提现账户信息 -->
    <view class="withdraw-account-card">
      <view class="account-info" @click="goToEditAccount">
        <view class="account-text">
          <text class="account-label">提现到：{{ withdrawAccountType }}</text>
          <text class="account-number">({{ maskedAccountNumber }})</text>
          <text v-if="userInfo.account_type === 'provider'" class="user-type-badge">服务商</text>
        </view>
        <view class="arrow-right">
          <image src="https://ccpt.qiniu.0871.cn/rider/xiangyou.png" mode="aspectFit"></image>
        </view>
      </view>
    </view>

    <!-- 提现金额 -->
    <view class="withdraw-amount-card">
      <view class="amount-label">提现金额</view>
      <view class="amount-input-container">
        <text class="currency-symbol">¥</text>
        <input
          class="amount-input"
          type="digit"
          v-model="withdrawAmount"
          placeholder="0.00"
          @input="handleAmountInput"
        />
      </view>
      <view class="available-amount">
        <text class="available-label">可提余额</text>
        <text class="available-value">¥ {{ availableBalance }}</text>
        <text class="withdraw-all" @click="withdrawAll">全部提现</text>
      </view>
    </view>

    <!-- 确认提现按钮 -->
    <view class="withdraw-btn-container">
      <button
        class="withdraw-btn"
        :class="{ 'withdraw-btn-active': canWithdraw }"
        :disabled="!canWithdraw"
        @click="confirmWithdraw"
      >
        确认提现
      </button>

      <!-- 提现说明 -->
      <view class="withdraw-notice">
        <view class="notice-title">提现说明</view>
        <view class="notice-item">• 独立骑手每月6号、16号、26号，"逢6"均可提现</view>
        <view class="notice-item">• 提现申请提交后，将在1-3个工作日内到账</view>
        <view class="notice-item">• 请确保提现账户信息准确无误</view>
        <view class="notice-item">• 提现手续费3%（当前暂行0%）</view>
        <view class="notice-item" v-if="!isWithdrawDay">• 当前不在提现日期内，下次可提现日期：{{ nextWithdrawDate }}</view>
        <!-- 临时测试按钮 -->
       <!-- <view class="test-button" @click="forceShowPopup" style="margin-top: 20rpx; padding: 10rpx; background-color: #ff6b6b; color: white; text-align: center; border-radius: 8rpx; font-size: 24rpx;">
          测试弹窗（点击强制显示）
        </view> -->
      </view>
    </view>

    <!-- 悬浮聊天图标 -->
    <FloatingChatIcon />
    
    <!-- 提现弹窗 -->
    <view v-if="showPopup" class="popup-overlay" @click="closePopup">
      <view class="popup-container" @click.stop="">
        <view class="popup-close" @click="closePopup">×</view>
        <image 
          class="popup-image" 
          src="https://ccpt.qiniu.0871.cn/tixian666.png" 
          mode="widthFix"
          :show-loading="true"
          @load="handleImageLoad"
          @error="handleImageError"
        ></image>
        <!-- 图片加载失败时显示的占位内容 -->
        <view v-if="imageLoadError" class="image-error-placeholder">
          <text class="error-text">图片加载失败</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import FloatingChatIcon from '@/components/FloatingChatIcon/index.vue'

export default {
  components: {
    NavBar,
    FloatingChatIcon
  },
  data() {
    return {
      withdrawAmount: '',
      availableBalance: '0.00',
      withdrawInfo: null,
      userInfo: {},
      selectedAccountType: null, // 用户选择的账户类型
      showPopup: false, // 控制弹窗显示
      imageLoadError: false // 控制图片加载错误状态
    }
  },
  computed: {
    // 提现账户类型
    withdrawAccountType() {
      if (!this.withdrawInfo) {
        return '未设置';
      }

      // 如果用户已选择特定账户类型，优先使用选择的类型
      if (this.selectedAccountType) {
        if (this.selectedAccountType === 'alipay' && this.withdrawInfo.alipay_id) {
          return 'Alipay';
        } else if (this.selectedAccountType === 'bank' && this.withdrawInfo.bank_card_number) {
          return '银行卡';
        }
      }

      // 默认逻辑：优先显示Alipay，其次银行卡
      if (this.withdrawInfo.alipay_id) {
        return 'Alipay';
      } else if (this.withdrawInfo.bank_card_number) {
        return '银行卡';
      }
      return '未设置';
    },

    // 脱敏后的账户号码
    maskedAccountNumber() {
      if (!this.withdrawInfo) {
        return '****';
      }

      // 如果用户已选择特定账户类型，优先显示选择的账户信息
      if (this.selectedAccountType) {
        if (this.selectedAccountType === 'alipay' && this.withdrawInfo.alipay_id) {
          const account = this.withdrawInfo.alipay_id;
          if (account.length <= 4) {
            return account;
          }
          return account.slice(0, 3) + '****' + account.slice(-2);
        } else if (this.selectedAccountType === 'bank' && this.withdrawInfo.bank_card_number) {
          const cardNumber = this.withdrawInfo.bank_card_number;
          if (cardNumber.length <= 4) {
            return cardNumber;
          }
          return cardNumber.slice(-4);
        }
      }

      // 默认逻辑：优先显示Alipay，其次银行卡
      if (this.withdrawInfo.alipay_id) {
        // Alipay账号脱敏
        const account = this.withdrawInfo.alipay_id;
        if (account.length <= 4) {
          return account;
        }
        return account.slice(0, 3) + '****' + account.slice(-2);
      } else if (this.withdrawInfo.bank_card_number) {
        // 银行卡号脱敏
        const cardNumber = this.withdrawInfo.bank_card_number;
        if (cardNumber.length <= 4) {
          return cardNumber;
        }
        return cardNumber.slice(-4);
      }

      return '****';
    },

    // 脱敏后的卡号（保持向后兼容）
    maskedCardNumber() {
      return this.maskedAccountNumber;
    },

    // 是否可以提现
    canWithdraw() {
      const amount = parseFloat(this.withdrawAmount);
      const available = parseFloat(this.availableBalance);
      return amount > 0 && amount <= available && this.withdrawInfo && this.isWithdrawDay;
    },

    // 是否为提现日期（5号、15号、25号）
    isWithdrawDay() {
      const today = new Date();
      const day = today.getDate();
      return day === 6 || day === 16 || day === 26;
    },

    // 下次提现日期
    nextWithdrawDate() {
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      let nextDay, nextMonth, nextYear;

      if (currentDay < 6) {
        nextDay = 6;
        nextMonth = currentMonth;
        nextYear = currentYear;
      } else if (currentDay < 16) {
        nextDay = 16;
        nextMonth = currentMonth;
        nextYear = currentYear;
      } else if (currentDay < 26) {
        nextDay = 26;
        nextMonth = currentMonth;
        nextYear = currentYear;
      } else {
        // 下个月的5号
        nextDay = 6;
        nextMonth = currentMonth + 1;
        nextYear = currentYear;

        // 处理跨年情况
        if (nextMonth > 11) {
          nextMonth = 0;
          nextYear = currentYear + 1;
        }
      }

      const nextDate = new Date(nextYear, nextMonth, nextDay);
      return `${nextDate.getFullYear()}年${nextDate.getMonth() + 1}月${nextDate.getDate()}日`;
    }
  },
  onLoad() {
    this.loadUserInfo();
    this.checkAndShowPopup();
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const riderUserInfo = uni.getStorageSync('riderUserInfo') || {};
      this.userInfo = riderUserInfo;
      this.withdrawInfo = riderUserInfo.withdraw_info;
      this.availableBalance = riderUserInfo.balance || '0.00';

      // 从保存的账户信息中获取用户类型和ID
      if (riderUserInfo.withdraw_account_info) {
        const accountInfo = riderUserInfo.withdraw_account_info;
        this.userInfo.account_type = accountInfo.account_type;
        this.userInfo.account_id = accountInfo.account_id;
        this.userInfo.account_name = accountInfo.account_name;

        console.log('从本地存储获取的账户信息:', accountInfo);
      }

      // 如果没有选择账户类型，设置默认值
      if (!this.selectedAccountType && this.withdrawInfo) {
        if (this.withdrawInfo.alipay_id) {
          this.selectedAccountType = 'alipay';
        } else if (this.withdrawInfo.bank_card_number) {
          this.selectedAccountType = 'bank';
        }
      }
    },

    // 检查并显示弹窗
    checkAndShowPopup() {
      const currentTime = Date.now();
      const firstPopupTime = uni.getStorageSync('withdrawPopupFirstShown') || 0;
      const lastPopupTime = uni.getStorageSync('withdrawPopupLastShown') || 0;
      const oneDayInMs = 24 * 60 * 60 * 1000; // 1天的毫秒数
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000; // 30天的毫秒数
      
      console.log('检查弹窗条件：', {
        currentTime,
        firstPopupTime,
        lastPopupTime,
        timeSinceFirst: currentTime - firstPopupTime,
        timeSinceLast: currentTime - lastPopupTime
      });
      
      // 如果是第一次访问，记录首次时间并显示弹窗
      if (!firstPopupTime) {
        console.log('首次显示弹窗');
        this.showPopup = true;
        uni.setStorageSync('withdrawPopupFirstShown', currentTime);
        uni.setStorageSync('withdrawPopupLastShown', currentTime);
        return;
      }
      
      // 如果距离首次显示已超过30天，则不再显示弹窗
      if (currentTime - firstPopupTime > thirtyDaysInMs) {
        console.log('已过30天，不再显示弹窗');
        return;
      }
      
      // 在30天内，如果距离上次显示超过1天，则显示弹窗
      if (currentTime - lastPopupTime > oneDayInMs) {
        console.log('距离上次显示超过1天，显示弹窗');
        this.showPopup = true;
        // 记录本次显示时间
        uni.setStorageSync('withdrawPopupLastShown', currentTime);
      } else {
        console.log('不显示弹窗，距离上次显示还没到1天');
      }
    },

    // 临时测试方法：强制显示弹窗（用于调试）
    // forceShowPopup() {
    //   console.log('强制显示弹窗');
    //   this.imageLoadError = false;
    //   this.showPopup = true;
    // },

    // 关闭弹窗
    closePopup() {
      this.showPopup = false;
      this.imageLoadError = false;
    },

    // 处理图片加载成功
    handleImageLoad() {
      console.log('弹窗图片加载成功');
      this.imageLoadError = false;
    },

    // 处理图片加载错误
    handleImageError() {
      console.log('弹窗图片加载失败');
      this.imageLoadError = true;
    },



    // 处理金额输入
    handleAmountInput(e) {
      let value = e.detail.value;
      // 只允许数字和小数点
      value = value.replace(/[^\d.]/g, '');
      // 只允许一个小数点
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      // 限制小数点后两位
      if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].slice(0, 2);
      }
      this.withdrawAmount = value;
    },

    // 全部提现
    withdrawAll() {
      this.withdrawAmount = this.availableBalance;
    },

    // 跳转到提现账户管理页面
    goToEditAccount() {
      uni.navigateTo({
        url: '/riderEnd/withdraw-account-manage'
      });
    },

    // 确认提现
    confirmWithdraw() {
      if (!this.canWithdraw) {
        if (!this.isWithdrawDay) {
          uni.showToast({
            title: `仅限每月6号、16号、26号提现，下次可提现：${this.nextWithdrawDate}`,
            icon: 'none',
            duration: 3000
          });
          return;
        }
        return;
      }

      uni.showModal({
        title: '确认提现',
        content: `确认提现 ¥${this.withdrawAmount} 到${this.withdrawAccountType}(${this.maskedAccountNumber})？`,
        success: (res) => {
          if (res.confirm) {
            this.submitWithdraw();
          }
        }
      });
    },

    // 提交提现申请
    async submitWithdraw() {
      try {
        uni.showLoading({
          title: '提交中...'
        });

        // 获取当前时间戳
        const timestamp = Math.floor(Date.now() / 1000);

        // 确定支付方式
        let paymentMethod = 'alipay'; // 默认Alipay
        if (this.selectedAccountType === 'bank') {
          paymentMethod = 'bank';
        } else if (this.selectedAccountType === 'alipay') {
          paymentMethod = 'alipay';
        }

        // 根据用户类型设置提现参数
        // 从用户信息中获取账户类型和ID
        const ownerType = this.userInfo.account_type || 'member';
        const ownerId = this.userInfo.account_id || this.userInfo.id;

        const params = {
          service_member_id: this.userInfo.id,
          owner_id: ownerId,
          owner_type: ownerType,
          amount: parseFloat(this.withdrawAmount),
          payment_method: paymentMethod,
          sign: 'chongchong',
          timestamp: timestamp
        };

        const res = await this.$request('withdraw/create', params, 'POST');

        uni.hideLoading();

        if (res.status === 'success') {
          uni.showToast({
            title: '提现申请已提交',
            icon: 'success'
          });

          // 返回上一页
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          uni.showToast({
            title: res.message || '提现申请失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('提现申请失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.withdraw-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
}

.withdraw-account-card {
  background-color: white;
  margin: 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;
}

.account-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.account-text {
  flex: 1;
}

.account-label {
  font-size: 28rpx;
  color: #333;
  margin-right: 10rpx;
}

.account-number {
  font-size: 28rpx;
  color: #666;
}

.user-type-badge {
  display: inline-block;
  background-color: #52c41a;
  color: white;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  margin-left: 12rpx;
}

.arrow-right {
  width: 40rpx;

  image {
    width: 32rpx;
    height: 32rpx;
  }
}

.withdraw-amount-card {
  background-color: white;
  margin: 0 20rpx 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;
}

.amount-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.amount-input-container {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  min-height: 120rpx;
  padding: 10rpx 0;
}

.currency-symbol {
  font-size: 80rpx;
  color: #333;
  font-weight: bold;
  margin-right: 10rpx;
  line-height: 1;
}

.amount-input {
  flex: 1;
  font-size: 80rpx;
  color: #333;
  font-weight: bold;
  border: none;
  outline: none;
  background: transparent;
  line-height: 1;
  height: 100rpx;
  padding: 0;
  margin: 0;
}

.available-amount {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.available-label {
  font-size: 24rpx;
  color: #999;
}

.available-value {
  font-size: 24rpx;
  color: #999;
  flex: 1;
  margin-left: 20rpx;
}

.withdraw-all {
  font-size: 24rpx;
  color: #2492F2;
  padding: 8rpx 16rpx;
  background-color: rgba(36, 146, 242, 0.1);
  border-radius: 20rpx;
}

.withdraw-btn-container {
  padding: 40rpx 20rpx;
  box-sizing: border-box;
}

.withdraw-btn {
  width: 100%;
  height: 90rpx;
  background-color: #e0e0e0;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-sizing: border-box;
  margin: 0;
  outline: none;
  box-shadow: none;

  &-active {
    background-color: #2492F2;
    box-shadow: 0 8rpx 16rpx rgba(36, 146, 242, 0.3);
    border: none;
    outline: none;
  }

  &:disabled {
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border: none;
  }

  &:active {
    outline: none;
    border: none;
  }
}

.withdraw-notice {
  margin-top: 30rpx;
  padding: 24rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  border-left: 6rpx solid #2492F2;

  .notice-title {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 16rpx;
  }

  .notice-item {
    font-size: 24rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 8rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

/* 弹窗样式 */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.popup-container {
  position: relative;
  background-color: white;
  border-radius: 16rpx;
  padding: 20rpx;
  margin: 40rpx;
  width: 464rpx; /* 424rpx + 20rpx*2 */
  height: 820rpx; /* 780rpx + 20rpx*2 */
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.popup-close {
  position: absolute;
  top: 10rpx;
  right: 15rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #999;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  z-index: 1000;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.popup-image {
  width: 470rpx;
  height: 300rpx;
  display: block;
  border-radius: 12rpx;
  background-color: #f5f5f5;
}

.image-error-placeholder {
  width: 470rpx;
  height: 300rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.error-text {
  font-size: 28rpx;
  color: #999;
}
</style>
