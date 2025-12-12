<template>
  <view class="account-manage-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="提现账户管理" title-align="center" :showBackButton="true"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 提现账户选择 -->
    <view class="account-selection-section">
      <view class="section-title">选择提现方式</view>

      <!-- Alipay卡片 -->
      <view class="account-card" :class="{ 'selected': selectedAccountType === 'alipay' }" @click="selectAccount('alipay')">
        <view class="account-header">
          <view class="account-type">
            <image src="https://ccpt.qiniu.0871.cn/rider/alipay.svg" mode="aspectFit" class="account-icon"></image>
            <text class="account-type-text">Alipay</text>
          </view>
          <view class="account-status">
            <text v-if="hasAlipayAccount" class="status-text added">已添加</text>
            <text v-else class="status-text not-added">未添加</text>
          </view>
        </view>

        <view v-if="hasAlipayAccount" class="account-details">
          <text class="account-number">{{ maskedAlipayAccount }}</text>
          <text class="account-name">{{ alipayAccountName }}</text>
        </view>
        <view v-else class="account-placeholder">
          <text class="placeholder-text">快速到账，支持实时提现</text>
        </view>

        <view class="account-actions">
          <view v-if="hasAlipayAccount" class="action-btn edit-btn" @click.stop="editAccount('alipay')">
            <text>编辑</text>
          </view>
          <view v-else class="action-btn add-btn" @click.stop="addAccount('alipay')">
            <text>添加</text>
          </view>
          <view v-if="hasAlipayAccount" class="selection-indicator" :class="{ 'selected': selectedAccountType === 'alipay' }">
            <text>{{ selectedAccountType === 'alipay' ? '✓' : '' }}</text>
          </view>
        </view>
      </view>

      <!-- 银行卡卡片 -->
      <view class="account-card" :class="{ 'selected': selectedAccountType === 'bank' }" @click="selectAccount('bank')">
        <view class="account-header">
          <view class="account-type">
            <image src="https://ccpt.qiniu.0871.cn/rider/bank.svg" mode="aspectFit" class="account-icon"></image>
            <text class="account-type-text">银行卡</text>
          </view>
          <view class="account-status">
            <text v-if="hasBankAccount" class="status-text added">已添加</text>
            <text v-else class="status-text not-added">未添加</text>
          </view>
        </view>

        <view v-if="hasBankAccount" class="account-details">
          <text class="account-number">{{ maskedBankAccount }}</text>
          <text class="account-name">{{ bankAccountName }}</text>
        </view>
        <view v-else class="account-placeholder">
          <text class="placeholder-text">安全可靠，支持所有银行</text>
        </view>

        <view class="account-actions">
          <view v-if="hasBankAccount" class="action-btn edit-btn" @click.stop="editAccount('bank')">
            <text>编辑</text>
          </view>
          <view v-else class="action-btn add-btn" @click.stop="addAccount('bank')">
            <text>添加</text>
          </view>
          <view v-if="hasBankAccount" class="selection-indicator" :class="{ 'selected': selectedAccountType === 'bank' }">
            <text>{{ selectedAccountType === 'bank' ? '✓' : '' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 提现说明 -->
    <view class="withdraw-info">
      <view class="info-title">提现说明</view>
      <view class="info-item">
        <text class="info-text">• Alipay提现：实时到账，单笔限额5万元</text>
      </view>
      <view class="info-item">
        <text class="info-text">• 银行卡提现：1-3个工作日到账，单笔限额10万元</text>
      </view>
      <view class="info-item">
        <text class="info-text">• 工作时间：周一至周五 9:00-18:00</text>
      </view>
      <view class="info-item">
        <text class="info-text">• 独立骑手每月6日、16日、26日可提现</text>
      </view>
      <view class="info-item">
        <text class="info-text">• 提现手续费：提现额3%+3元/笔</text>
      </view>
    </view>

    <!-- 确认选择按钮 -->
    <view class="confirm-btn-container" v-if="hasAnyAccount && selectedAccountType">
      <button class="confirm-btn" @click="confirmSelection">
        确认选择
      </button>
    </view>

    <!-- 悬浮聊天图标 -->
    <FloatingChatIcon />
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
      withdrawInfo: null,
      selectedAccountType: '', // 当前选择的账户类型
      riderUserInfo: null
    }
  },
  computed: {
    // 是否有Alipay账户
    hasAlipayAccount() {
      return this.withdrawInfo && this.withdrawInfo.alipay_id
    },

    // 是否有银行卡账户
    hasBankAccount() {
      return this.withdrawInfo && this.withdrawInfo.bank_card_number
    },

    // 是否有任意账户
    hasAnyAccount() {
      return this.hasAlipayAccount || this.hasBankAccount
    },

    // 脱敏后的Alipay账户
    maskedAlipayAccount() {
      if (!this.withdrawInfo || !this.withdrawInfo.alipay_id) return ''
      const account = this.withdrawInfo.alipay_id
      if (account.length <= 4) return account
      return account.slice(0, 3) + '****' + account.slice(-2)
    },

    // 脱敏后的银行卡账户
    maskedBankAccount() {
      if (!this.withdrawInfo || !this.withdrawInfo.bank_card_number) return ''
      const cardNumber = this.withdrawInfo.bank_card_number
      if (cardNumber.length <= 4) return cardNumber
      return '**** **** **** ' + cardNumber.slice(-4)
    },

    // Alipay账户姓名
    alipayAccountName() {
      if (!this.withdrawInfo) return ''
      return this.withdrawInfo.real_name || this.withdrawInfo.account_holder || ''
    },

    // 银行卡账户姓名
    bankAccountName() {
      if (!this.withdrawInfo) return ''
      return this.withdrawInfo.real_name || this.withdrawInfo.account_holder || ''
    }
  },
  onLoad() {
    this.loadWithdrawInfo()
  },
  methods: {
    // 加载提现账户信息
    loadWithdrawInfo() {
      const riderUserInfo = uni.getStorageSync('riderUserInfo') || {}
      this.riderUserInfo = riderUserInfo
      this.withdrawInfo = riderUserInfo.withdraw_info

      // 默认选择已有的账户类型
      if (this.hasAlipayAccount) {
        this.selectedAccountType = 'alipay'
      } else if (this.hasBankAccount) {
        this.selectedAccountType = 'bank'
      }
    },

    // 选择账户
    selectAccount(type) {
      // 只有已添加的账户才能选择
      if ((type === 'alipay' && this.hasAlipayAccount) || (type === 'bank' && this.hasBankAccount)) {
        this.selectedAccountType = type
      }
    },

    // 编辑账户
    editAccount(type) {
      // 跳转到编辑页面，并传递类型参数，页面会自动切换到对应选项卡
      uni.navigateTo({
        url: `/riderEnd/edit-account?type=${type}`
      })
    },

    // 添加新账户
    addAccount(type) {
      // 跳转到编辑页面，并传递类型参数，页面会自动切换到对应选项卡
      uni.navigateTo({
        url: `/riderEnd/edit-account?type=${type}`
      })
    },

    // 确认选择
    confirmSelection() {
      if (!this.selectedAccountType) {
        uni.showToast({
          title: '请选择提现账户',
          icon: 'none'
        })
        return
      }

      // 检查选择的账户是否存在
      if (this.selectedAccountType === 'alipay' && !this.hasAlipayAccount) {
        uni.showToast({
          title: '请先添加Alipay账户',
          icon: 'none'
        })
        return
      }

      if (this.selectedAccountType === 'bank' && !this.hasBankAccount) {
        uni.showToast({
          title: '请先添加银行卡账户',
          icon: 'none'
        })
        return
      }

      // 返回上一页并传递选择的账户类型
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]

      if (prevPage) {
        prevPage.$vm.selectedAccountType = this.selectedAccountType
        prevPage.$vm.loadUserInfo() // 刷新提现页面数据
      }

      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.account-manage-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin: 30rpx 20rpx 20rpx;
}

// 账户选择部分
.account-selection-section {
  margin-bottom: 40rpx;
}

.account-card {
  background-color: white;
  margin: 0 20rpx 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;

  &.selected {
    border-color: #2492F2;
    background-color: rgba(36, 146, 242, 0.05);
  }

  &:active {
    transform: scale(0.98);
  }
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.account-type {
  display: flex;
  align-items: center;
}

.account-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 12rpx;
}

.account-type-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.account-status {
  .status-text {
    font-size: 22rpx;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;

    &.added {
      background-color: rgba(82, 196, 26, 0.1);
      color: #52c41a;
    }

    &.not-added {
      background-color: rgba(255, 77, 79, 0.1);
      color: #ff4d4f;
    }
  }
}

.account-details {
  margin-bottom: 20rpx;
  padding-left: 52rpx;
}

.account-number {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.account-name {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.account-placeholder {
  margin-bottom: 20rpx;
  padding-left: 52rpx;
}

.placeholder-text {
  font-size: 24rpx;
  color: #999;
  font-style: italic;
}

.account-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  text-align: center;
  font-size: 24rpx;

  &.edit-btn {
    background-color: #f8f8f8;
    color: #666;
  }

  &.add-btn {
    background-color: #2492F2;
    color: white;
  }
}

.selection-indicator {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: white;
  transition: all 0.3s ease;

  &.selected {
    background-color: #2492F2;
    border-color: #2492F2;
  }
}

// 提现说明
.withdraw-info {
  background-color: white;
  margin: 0 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;
}

.info-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 20rpx;
}

.info-item {
  margin-bottom: 12rpx;
}

.info-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

// 确认按钮
.confirm-btn-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 20rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f5f5f5;
}

.confirm-btn {
  width: 100%;
  height: 90rpx;
  background-color: #2492F2;
  color: white;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  
  &:active {
    opacity: 0.8;
  }
}
</style>
