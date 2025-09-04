<template>
  <view class="edit-account-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="编辑提现账户" title-align="center" :showBackButton="true"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 选项卡 -->
    <view class="tab-container">
      <view class="tab-item" :class="{ active: currentTab === 'alipay' }" @click="switchTab('alipay')">
        <text>绑定Alipay</text>
      </view>
      <view class="tab-item" :class="{ active: currentTab === 'bank' }" @click="switchTab('bank')">
        <text>绑定银行卡</text>
      </view>
    </view>

    <!-- 安全提示 -->
    <view class="security-tip">
      <view class="tip-icon">🔒</view>
      <text class="tip-text">已保障你的账号安全</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <!-- Alipay表单 -->
      <view v-if="currentTab === 'alipay'" class="form-content">
        <view class="form-item">
          <text class="form-label">Alipay</text>
          <input
            class="form-input"
            type="text"
            v-model="alipayForm.account"
            placeholder="请输入Alipay账号"
          />
        </view>
        <view class="form-item">
          <text class="form-label">真实姓名</text>
          <input
            class="form-input"
            type="text"
            v-model="alipayForm.realName"
            placeholder="请输入账号真实姓名"
          />
        </view>
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input
            class="form-input"
            type="text"
            v-model="alipayForm.phone"
            placeholder="请输入账号手机号"
          />
        </view>
      </view>

      <!-- 银行卡表单 -->
      <view v-else class="form-content">
        <view class="form-item required">
          <text class="form-label">姓名</text>
          <input
            class="form-input"
            type="text"
            v-model="bankForm.name"
            placeholder="请输入姓名"
          />
        </view>
        <view class="form-item required">
          <text class="form-label">开户行</text>
          <input
            class="form-input"
            type="text"
            v-model="bankForm.bankName"
            placeholder="请输入开户行"
          />
        </view>
        <view class="form-item required">
          <text class="form-label">开户省市</text>
          <input
            class="form-input"
            type="text"
            v-model="bankForm.province"
            placeholder="请输入开户省市"
          />
        </view>
        <view class="form-item required">
          <text class="form-label">开户支行</text>
          <input
            class="form-input"
            type="text"
            v-model="bankForm.branch"
            placeholder="请输入开户支行"
          />
        </view>
        <view class="form-item required">
          <text class="form-label">银行卡号</text>
          <input
            class="form-input"
            type="text"
            v-model="bankForm.cardNumber"
            placeholder="请输入银行卡号"
          />
        </view>
        <view class="form-item">
          <text class="form-label long-label">银行预留手机号</text>
          <input
            class="form-input"
            type="text"
            v-model="bankForm.phone"
            placeholder="请输入银行预留手机号"
          />
        </view>
      </view>

      <!-- 温馨提示 -->
      <view class="warm-tip">
        <text class="tip-content">*温馨提示:Alipay账号只用于用户使用钱包功能，平台已采取权威安全技术来确保您的信息安全。</text>
      </view>

      <!-- 更新按钮 -->
      <view class="submit-btn" @click="submitForm">
        <text>提交</text>
      </view>
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
      currentTab: 'alipay',
      urlType: null, // 保存URL参数中的type
      withdrawInfo: null,
      alipayForm: {
        account: '',
        realName: '',
        phone: ''
      },
      bankForm: {
        name: '',
        bankName: '',
        province: '',
        branch: '',
        cardNumber: '',
        phone: ''
      },
	  riderUserInfo: null,
    }
  },
  onLoad(options) {
    // 保存URL参数中的type，用于后续判断
    this.urlType = options.type || null;

    // 根据传递的type参数设置默认选项卡
    if (options.type) {
      this.currentTab = options.type;
    }
    this.loadWithdrawInfo();
  },
  methods: {
    // 加载提现账户信息
    loadWithdrawInfo() {
      const riderUserInfo = uni.getStorageSync('riderUserInfo') || {};
      this.withdrawInfo = riderUserInfo.withdraw_info;
      this.riderUserInfo = riderUserInfo;

      if (this.withdrawInfo) {
        this.fillFormData();
      }
    },

    // 填充表单数据
    fillFormData() {
      if (!this.withdrawInfo) return;

      // 填充Alipay表单数据
      if (this.withdrawInfo.alipay_id) {
        this.alipayForm = {
          account: this.withdrawInfo.alipay_id || '',
          realName: this.withdrawInfo.real_name || '',
          phone: this.withdrawInfo.phone_number || ''
        };
        // 只有在没有URL参数指定type时，才根据现有数据设置选项卡
        if (!this.urlType) {
          this.currentTab = 'alipay';
        }
      }

      // 填充银行卡表单数据
      if (this.withdrawInfo.bank_card_number) {
        this.bankForm = {
          name: this.withdrawInfo.account_holder || '',
          bankName: this.withdrawInfo.bank_name || '',
          province: this.withdrawInfo.bank_province || '',
          branch: this.withdrawInfo.bank_branch || '',
          cardNumber: this.withdrawInfo.bank_card_number || '',
          phone: this.withdrawInfo.bank_reserved_phone || ''
        };
        // 只有在没有URL参数指定type时，才根据现有数据设置选项卡
        if (!this.urlType) {
          this.currentTab = 'bank';
        }
      }
    },

    switchTab(tab) {
      this.currentTab = tab;
    },

    async submitForm() {
      // 表单验证
      if (!this.validateForm()) {
        return;
      }

      // 准备接口参数
      const params = this.prepareApiParams();

      try {
        uni.showLoading({
          title: '更新中...'
        });

        const res = await this.$request('service/withdraw/update', params, 'POST');

        uni.hideLoading();

        if (res.status === 'success') {
          // 更新本地存储的用户信息
          this.updateUserWithdrawInfo(res.data);

          uni.showToast({
            title: '更新成功',
            icon: 'success'
          });

          // 返回上一页并刷新数据
          setTimeout(() => {
            // 通知上一页刷新数据
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2];
            if (prevPage && prevPage.$vm.loadWithdrawInfo) {
              prevPage.$vm.loadWithdrawInfo();
            }
            uni.navigateBack();
          }, 1500);
        } else {
          uni.showToast({
            title: res.msg || '更新失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('更新提现账户失败:', error);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    },

    // 表单验证
    validateForm() {
      if (this.currentTab === 'alipay') {
        // Alipay表单验证
        const form = this.alipayForm;
        if (!form.account) {
          uni.showToast({
            title: '请输入Alipay账号',
            icon: 'none'
          });
          return false;
        }
        if (!form.realName) {
          uni.showToast({
            title: '请输入真实姓名',
            icon: 'none'
          });
          return false;
        }
        if (!form.phone) {
          uni.showToast({
            title: '请输入手机号',
            icon: 'none'
          });
          return false;
        }
      } else {
        // 银行卡表单验证
        const form = this.bankForm;
        if (!form.name) {
          uni.showToast({
            title: '请输入姓名',
            icon: 'none'
          });
          return false;
        }
        if (!form.bankName) {
          uni.showToast({
            title: '请输入开户行',
            icon: 'none'
          });
          return false;
        }
        if (!form.province) {
          uni.showToast({
            title: '请输入开户省市',
            icon: 'none'
          });
          return false;
        }
        if (!form.branch) {
          uni.showToast({
            title: '请输入开户支行',
            icon: 'none'
          });
          return false;
        }
        if (!form.cardNumber) {
          uni.showToast({
            title: '请输入银行卡号',
            icon: 'none'
          });
          return false;
        }
      }
      return true;
    },

    // 准备API参数
    prepareApiParams() {
      const baseParams = {
        id: this.withdrawInfo ? this.withdrawInfo.id : '',
		service_member_id: this.riderUserInfo.id,
        sign: 'chongchong'
      };

      // 获取现有的Alipay信息（如果不是当前编辑的选项卡，则保留原有数据）
      let alipayData = {
        alipay_id: '',
        real_name: '',
        phone_number: ''
      };

      if (this.currentTab === 'alipay') {
        // 当前编辑Alipay，使用表单数据
        alipayData = {
          alipay_id: this.alipayForm.account,
          real_name: this.alipayForm.realName,
          phone_number: this.alipayForm.phone
        };
      } else if (this.withdrawInfo && this.withdrawInfo.alipay_id) {
        // 当前编辑银行卡，但保留原有Alipay数据
        alipayData = {
          alipay_id: this.withdrawInfo.alipay_id,
          real_name: this.withdrawInfo.real_name,
          phone_number: this.withdrawInfo.phone_number
        };
      }

      // 获取现有的银行卡信息（如果不是当前编辑的选项卡，则保留原有数据）
      let bankData = {
        account_holder: '',
        bank_name: '',
        bank_province: '',
        bank_city: '',
        bank_branch: '',
        bank_card_number: '',
        bank_reserved_phone: ''
      };

      if (this.currentTab === 'bank') {
        // 当前编辑银行卡，使用表单数据
        bankData = {
          account_holder: this.bankForm.name,
          bank_name: this.bankForm.bankName,
          bank_province: this.bankForm.province,
          bank_city: this.bankForm.province,
          bank_branch: this.bankForm.branch,
          bank_card_number: this.bankForm.cardNumber,
          bank_reserved_phone: this.bankForm.phone
        };
      } else if (this.withdrawInfo && this.withdrawInfo.bank_card_number) {
        // 当前编辑Alipay，但保留原有银行卡数据
        bankData = {
          account_holder: this.withdrawInfo.account_holder,
          bank_name: this.withdrawInfo.bank_name,
          bank_province: this.withdrawInfo.bank_province,
          bank_city: this.withdrawInfo.bank_city,
          bank_branch: this.withdrawInfo.bank_branch,
          bank_card_number: this.withdrawInfo.bank_card_number,
          bank_reserved_phone: this.withdrawInfo.bank_reserved_phone
        };
      }

      // 合并所有参数
      return {
        ...baseParams,
        ...alipayData,
        ...bankData
      };
    },

    // 更新用户提现信息
    updateUserWithdrawInfo(withdrawData) {
      try {
        // 获取当前用户信息
        const riderUserInfo = uni.getStorageSync('riderUserInfo') || {};

        // 更新提现信息
        riderUserInfo.withdraw_info = withdrawData;

        // 保存回本地存储
        uni.setStorageSync('riderUserInfo', riderUserInfo);

        console.log('用户提现信息已更新:', withdrawData);
      } catch (error) {
        console.error('更新用户提现信息失败:', error);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/* 复用添加账户页面的样式 */
.edit-account-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
}

.tab-container {
  display: flex;
  background-color: white;
  margin: 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  padding: 24rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  background-color: #f8f8f8;

  &.active {
    background-color: #2492F2;
    color: white;
  }
}

.security-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  margin: 20rpx;
  background-color: rgba(36, 146, 242, 0.1);
  border-radius: 8rpx;
}

.tip-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #2492F2;
}

.form-container {
  background-color: white;
  margin: 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &.required .form-label::before {
    content: '*';
    color: #ff4757;
    margin-right: 4rpx;
  }
}

.form-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;

  &.long-label {
    width: 220rpx;
    white-space: nowrap;
  }
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;

  &::placeholder {
    color: #ccc;
  }
}

.warm-tip {
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
}

.tip-content {
  font-size: 22rpx;
  color: #999;
  line-height: 1.5;
}

.submit-btn {
  margin-top: 40rpx;
  background-color: #2492F2;
  color: white;
  text-align: center;
  padding: 28rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;

  &:active {
    opacity: 0.8;
  }
}
</style>
