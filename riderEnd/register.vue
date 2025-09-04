<template>
  <view class="register-page">
    <!-- 顶部导航栏 -->
    <view class="custom-nav-bar">
      <nav-bar
        title=" "
        title-align="center"
        :showBackButton="true"
        @back="goBack"
        :backgroundColor="'transparent'"
        :textColor="'#ffffff'"
      ></nav-bar>
    </view>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 顶部背景 -->
    <view class="top-bg">
      <!-- <image class="logo" src="https://ccpt.qiniu.0871.cn/rider/logo.png" mode="aspectFit"></image>
      <view class="welcome-text">欢迎注册充充跑腿骑手端</view> -->
    </view>

    <!-- 注册表单 -->
    <view class="register-form">
      <!-- 标题和推荐人信息 -->
      <view class="form-header">
        <view class="header-top">
          <view class="form-title">欢迎注册充充骑手账号！</view>
          <view class="referrer-info" v-if="referrerId">
            <text class="referrer-text">推荐人 {{ formattedReferrerId }}</text>
          </view>
        </view>
        <!-- 说明文字 -->
        <view class="notice-text">(限共享充电宝从业人员入驻)</view>
      </view>

      <!-- 服务商选择 -->
      <view class="input-group service-provider-input">
        <view class="input-label">选择服务商</view>
        <view class="input-container" @click="openServiceProviderPicker">
          <input
            type="text"
            :value="getSelectedProviderName"
            placeholder="请选择归属服务商"
            class="input"
            disabled
          />
          <text class="arrow-icon">▼</text>
        </view>
        <view class="error-tip" v-if="errors.serviceProviderId">{{ errors.serviceProviderId }}</view>
      </view>

      <!-- 服务区域选择 -->
      <view class="input-group service-area-input">
        <view class="input-label">选择可服务城市 <text class="sub-label">(限3个)</text></view>
        <view class="input-container" @click="openServiceAreaPicker">
          <input
            type="text"
            :value="getSelectedAreaNames"
            placeholder="请选择可接单服务的城市"
            class="input"
            disabled
          />
          <text class="arrow-icon">▼</text>
        </view>
        <view class="error-tip" v-if="errors.serviceAreas">{{ errors.serviceAreas }}</view>
      </view>

      <!-- 可服务品牌选择 -->
      <view class="input-group service-brands-input">
        <view class="input-label">选择可服务品牌 <text class="sub-label">(至少选择一项)</text></view>
        <view class="input-container" @click="openServiceBrandsPicker">
          <input
            type="text"
            :value="getSelectedBrandsNames"
            placeholder="请选择可服务品牌（自带该品牌工作账号）"
            class="input"
            disabled
          />
          <text class="arrow-icon">▼</text>
        </view>
        <view class="error-tip" v-if="errors.service_brands">{{ errors.service_brands }}</view>
      </view>

      <!-- 手机号码 -->
      <view class="input-group phone-input">
        <view class="input-label">手机号码</view>
        <view class="input-container">
          <text class="prefix">+86</text>
          <input
            ref="phoneInput"
            type="number"
            v-model="formData.phone"
            placeholder="请输入手机号码"
            maxlength="11"
            class="input"
            @input="handlePhoneInput"
            @focus="handleFocus"
            @blur="validatePhone"
            :cursor-spacing="20"
            :adjust-position="true"
          />
          <view class="clear-btn" v-if="formData.phone" @click="clearPhone">
            <text class="clear-icon">×</text>
          </view>
        </view>
        <view class="error-tip" v-if="errors.phone">{{ errors.phone }}</view>
      </view>

      <!-- 验证码 -->
     <view class="input-group verification-code-input">
        <view class="input-label">验证码</view>
        <view class="input-container verification-code">
          <input
            ref="verificationCodeInput"
            type="number"
            v-model="formData.verificationCode"
            placeholder="请输入验证码"
            maxlength="6"
            class="input"
            @focus="handleFocus"
            @blur="validateVerificationCode"
            :cursor-spacing="20"
            :adjust-position="true"
          />
          <view
            class="verification-btn"
            :class="{ disabled: !canSendCode || countdown > 0 || phoneRegistered }"
            @click="sendVerificationCode"
            v-if="!phoneRegistered"
          >
            {{ checkingPhone ? '检查中...' : (countdown > 0 ? `${countdown}s后重发` : '获取验证码') }}
          </view>
          <view
            class="verification-btn disabled"
            v-if="phoneRegistered"
          >
            号码已注册
          </view>
        </view>
        <view class="error-tip" v-if="errors.verificationCode">{{ errors.verificationCode }}</view>
      </view>

      <!-- 设置密码 -->
      <view class="input-group password-input">
        <view class="input-label">设置密码</view>
        <view class="input-container">
          <input
            ref="passwordInput"
            :type="showPassword ? 'text' : 'password'"
            v-model="formData.password"
            placeholder="请设置登录密码"
            class="input"
            @focus="handleFocus"
            @blur="validatePassword"
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
        <view class="error-tip" v-if="errors.password">{{ errors.password }}</view>
      </view>

      <!-- 确认密码 -->
      <view class="input-group confirm-password-input">
        <view class="input-label">确认密码</view>
        <view class="input-container">
          <input
            ref="confirmPasswordInput"
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="formData.confirmPassword"
            placeholder="请再次输入密码"
            class="input"
            @focus="handleFocus"
            @blur="validateConfirmPassword"
            :cursor-spacing="20"
            :adjust-position="true"
          />
          <view class="password-toggle" @click="toggleConfirmPasswordVisibility">
            <image
              :src="showConfirmPassword ? 'https://ccpt.qiniu.0871.cn/rider/eye-open.png' : 'https://ccpt.qiniu.0871.cn/rider/eye-close.png'"
              mode="aspectFit"
              class="eye-icon"
            ></image>
          </view>
        </view>
        <view class="error-tip" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</view>
      </view>

      <!-- 昵称 -->
      <view class="input-group name-input">
        <view class="input-label">昵称</view>
        <view class="input-container">
          <input
            ref="nameInput"
            type="text"
            v-model="formData.name"
            placeholder="请输入您的昵称"
            class="input"
            @focus="handleFocus"
            @blur="validateName"
            :cursor-spacing="20"
            :adjust-position="true"
          />
        </view>
        <view class="error-tip" v-if="errors.name">{{ errors.name }}</view>
      </view>

      <!-- 微信号 -->
      <view class="input-group weixin-input">
        <view class="input-label">微信号</view>
        <view class="input-container weixin-container">
          <input
            ref="weixinInput"
            type="text"
            v-model="formData.weixin"
            placeholder="请输入您的微信号"
            class="input"
            @focus="handleFocus"
            @blur="validateWeixin"
            :cursor-spacing="20"
            :adjust-position="true"
          />
          <view class="phone-fill-btn" @click="fillPhoneAsWeixin">
            <text class="phone-fill-text">手机号可搜索</text>
          </view>
        </view>
        <view class="error-tip" v-if="errors.weixin">{{ errors.weixin }}</view>
      </view>

      <!-- 注册按钮 -->
      <button
        class="register-btn register-btn-blue"
        @click="handleRegister"
      >
        注册
      </button>

      <!-- 已有账号 -->
      <view class="login-link" @click="goToLogin">已有账号？立即登录</view>
    </view>

    <!-- 服务商选择弹窗 -->
    <view class="service-provider-picker" v-if="showServiceProviderPicker">
      <view class="picker-mask" @click="showServiceProviderPicker = false"></view>
      <view class="picker-content">
        <view class="picker-header">
          <text class="picker-title">选择服务商</text>
          <text class="picker-close" @click="showServiceProviderPicker = false">×</text>
        </view>
        <scroll-view class="picker-list" scroll-y>
          <view
            class="picker-item"
            v-for="(provider, index) in serviceProviders"
            :key="provider.service_provider_id"
            :class="{ 'picker-item-disabled': index !== 0 }"
            @click="index === 0 ? selectServiceProvider(provider) : null"
          >
            <view class="provider-info">
              <text class="provider-name">{{ provider.company_name }}</text>
              <text class="provider-contact">联系人：{{ provider.contact_person }}</text>
              <text class="provider-phone">电话：{{ provider.phone_number }}</text>
              <text class="provider-address">{{ provider.province }}{{ provider.city }}{{ provider.district }}{{ provider.address }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 服务区域选择弹窗 -->
    <view class="service-area-picker" v-if="showServiceAreaPicker">
      <view class="picker-mask" @click="showServiceAreaPicker = false"></view>
      <view class="picker-content">
        <view class="picker-header">
          <text class="picker-title">选择服务城市 (可选3个城市))</text>
          <text class="picker-close" @click="showServiceAreaPicker = false">×</text>
        </view>

        <!-- 已选择区域 -->
        <view class="selected-areas" v-if="selectedAreas.length > 0">
          <view class="selected-area-title">已选择：</view>
          <view class="selected-area-list">
            <view
              class="selected-area-item"
              v-for="(area, index) in selectedAreas"
              :key="area.city_id"
            >
              {{ area.province_name }}{{ area.city_name }}
              <text class="remove-area" @click.stop="removeSelectedArea(index)">×</text>
            </view>
          </view>
        </view>

        <!-- 区域列表 -->
        <scroll-view
          class="picker-list"
          scroll-y
          :scroll-with-animation="true"
          :show-scrollbar="true"
          :enhanced="true"
          :bounces="true"
        >
          <view class="province-item" v-for="province in serviceAreas" :key="province.province_id">
            <view class="province-header" @click.stop="toggleProvince(province.province_id)">
              <text class="province-name">{{ province.name }}</text>
              <text class="expand-icon">{{ expandedProvinces.includes(province.province_id) ? '▼' : '▶' }}</text>
            </view>

            <view class="city-list" v-if="expandedProvinces.includes(province.province_id)">
              <view class="city-item" v-for="city in province.children" :key="city.city_id">
                <view
                  class="city-header"
                  :class="{ 'city-selected': isCitySelected(city.city_id) }"
                  @click.stop="toggleCitySelection(city, province.name)"
                >
                  <text class="city-name">{{ city.name }}</text>
                  <text class="check-icon" v-if="isCitySelected(city.city_id)">✓</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 确认按钮 -->
        <view class="confirm-btn" @click="confirmServiceAreas">确认选择</view>
      </view>
    </view>

    <!-- 可服务品牌选择弹窗 -->
    <view class="service-brands-picker" v-if="showServiceBrandsPicker">
      <view class="picker-mask" @click="showServiceBrandsPicker = false"></view>
      <view class="picker-content">
        <view class="picker-header">
          <text class="picker-title">选择可服务品牌 (至少选择一项)</text>
          <text class="picker-close" @click="showServiceBrandsPicker = false">×</text>
        </view>

        <!-- 已选择品牌 -->
        <view class="selected-brands" v-if="formData.service_brands.length > 0">
          <view class="selected-brand-title">已选择：</view>
          <view class="selected-brand-list">
            <view
              class="selected-brand-item"
              v-for="(brandValue, index) in formData.service_brands"
              :key="brandValue"
            >
              {{ getBrandLabel(brandValue) }}
              <text class="remove-brand" @click.stop="removeBrand(index)">×</text>
            </view>
          </view>
        </view>

        <!-- 品牌列表 -->
        <scroll-view class="picker-list" scroll-y>
          <view
            class="brand-item"
            v-for="brand in serviceBrands"
            :key="brand.value"
            :class="{ 'brand-selected': isBrandSelected(brand.value) }"
            @click="toggleBrandSelection(brand.value)"
          >
            <view class="brand-content">
              <text class="brand-name">{{ getBrandName(brand) }}</text>
              <text class="brand-description">{{ getBrandDescription(brand) }}</text>
            </view>
            <text class="check-icon" v-if="isBrandSelected(brand.value)">✓</text>
          </view>
        </scroll-view>

        <!-- 确认按钮 -->
        <view class="confirm-btn" @click="confirmServiceBrands">确认选择</view>
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="bottom-info">
      <view class="agreement">
        注册即表示您已同意
        <text class="link" @click="openAgreement('user')">《用户协议》</text>
        和
        <text class="link" @click="openAgreement('privacy')">《隐私政策》</text>
      </view>
      <view class="copyright">© 2023 充充跑腿 版权所有</view>
    </view>

    <!-- 注册成功二维码弹窗 -->
    <view class="qrcode-modal" v-if="showQRCodeModal">
      <view class="qrcode-mask" @click.stop></view>
      <view class="qrcode-content">
        <view class="qrcode-header">
          <text class="qrcode-title">注册成功</text>
        </view>
        <view class="qrcode-body">
          <view class="success-icon">✓</view>
          <text class="success-text">恭喜您注册成功！</text>
          <text class="qrcode-desc">请添加运营微信，说明您可服务城市。方便后续推单！</text>
          <view class="qrcode-image" @click="previewQRCode">
            <image src="https://ccpt.qiniu.0871.cn/my/kefuwechat.png" mode="aspectFit" />
          </view>
        </view>
        <view class="qrcode-footer">
          <button class="qrcode-confirm-btn" @click="confirmQRCode">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import md5 from 'md5'
import NavBar from '@/components/NavBar.vue'

export default {
  components: {
    NavBar
  },
  data() {
    return {
      formData: {
        phone: '',
        verificationCode: '',
        password: '',
        confirmPassword: '',
        name: '',
        weixin: '',
        serviceProviderId: '',
        serviceAreas: [],
        service_brands: []
      },
      errors: {
        phone: '',
        verificationCode: '',
        password: '',
        confirmPassword: '',
        name: '',
        weixin: '',
        serviceProviderId: '',
        serviceAreas: '',
        service_brands: ''
      },
      showPassword: false,
      showConfirmPassword: false,
      serviceProviders: [],
      showServiceProviderPicker: false,
      serviceAreas: [],
      showServiceAreaPicker: false,
      expandedProvinces: [],
      expandedCities: [],
      selectedAreas: [],
      // 验证码相关
      countdown: 0,
      countdownTimer: null,
      generatedCode: '', // 存储生成的验证码
      // 手机号检查相关
      phoneRegistered: false, // 手机号是否已注册
      checkingPhone: false, // 是否正在检查手机号
      hasShownRegisteredDialog: false, // 是否已显示过注册提示弹窗
      checkPhoneTimer: null, // 防抖定时器
      isRegistering: false, // 是否正在注册过程中
      // 可服务品牌选择相关
      showServiceBrandsPicker: false,
      serviceBrands: [
        { label: '美团（自带美团大象APP工作账号）', value: 'meituan' },
        { label: '怪兽（自带怪兽赤兔APP工作账号）', value: 'guaishou' },
        { label: '竹芒（自带竹芒合伙人APP工作账号）', value: 'zhumang' },
        { label: '小电（自带小电电小二APP工作账号）', value: 'xiaodian' }
      ],
      // 推荐人ID
      referrerId: null,
      // 二维码弹窗控制
      showQRCodeModal: false
    }
  },
  computed: {
    isFormValid() {
      // 检查基本表单字段是否已填写
      const fieldsValid = (
        this.formData.phone &&
        this.formData.verificationCode &&  // 恢复验证码验证
        this.formData.password &&
        this.formData.confirmPassword &&
        this.formData.name &&
        this.formData.weixin &&  // 微信必填
        this.formData.serviceProviderId &&
        this.formData.serviceAreas.length > 0 &&  // 确保服务区域已选择
        this.formData.service_brands.length > 0  // 确保至少选择一个品牌
      );

      // 检查是否有错误信息
      const noErrors = (
        !this.errors.phone &&
        !this.errors.verificationCode &&  // 恢复验证码错误检查
        !this.errors.password &&
        !this.errors.confirmPassword &&
        !this.errors.name &&
        !this.errors.weixin &&
        !this.errors.serviceProviderId &&
        !this.errors.serviceAreas &&
        !this.errors.service_brands
      );

      return fieldsValid && noErrors;
    },
    canSendCode() {
      // 手机号码格式正确、没有错误、未注册且不在检查中时才能发送验证码
      const phoneRegex = /^1[3-9]\d{9}$/;
      return this.formData.phone &&
             phoneRegex.test(this.formData.phone) &&
             !this.errors.phone &&
             !this.phoneRegistered &&
             !this.checkingPhone;
    },
    getSelectedProviderName() {
      if (!this.formData.serviceProviderId) return '';
      const provider = this.serviceProviders.find(p => p.service_provider_id === this.formData.serviceProviderId);
      return provider ? provider.company_name : '';
    },
    getSelectedAreaNames() {
      if (this.selectedAreas.length === 0) return '';
      return this.selectedAreas.map(area => `${area.province_name}${area.city_name}`).join('、');
    },
    getSelectedBrandsNames() {
      if (this.formData.service_brands.length === 0) return '';
      return this.formData.service_brands.map(value => {
        const brand = this.serviceBrands.find(b => b.value === value);
        return brand ? brand.label : value;
      }).join('、');
    },
    // 格式化推荐人ID显示
    formattedReferrerId() {
      if (!this.referrerId) return '';

      // 生成随机数字：2或5
      const randomSuffix = Math.random() < 0.5 ? '2' : '5';

      // 返回格式：ccqs + 推荐人ID + 随机数字
      return `ccqs${this.referrerId}${randomSuffix}`;
    }
  },

  methods: {
    handlePhoneInput(e) {
      this.formData.phone = e.detail.value;
      // 重置注册状态和弹窗状态
      this.phoneRegistered = false;
      this.checkingPhone = false;
      this.hasShownRegisteredDialog = false;
      this.validatePhone();
    },
    clearPhone() {
      this.formData.phone = '';
      this.errors.phone = '';
      this.phoneRegistered = false;
      this.checkingPhone = false;
      this.hasShownRegisteredDialog = false;
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    handleFocus() {
      // 处理输入框获得焦点
    },
    validatePhone() {
      const phoneRegex = /^1[3-9]\d{9}$/;

      // 清除之前的定时器
      if (this.checkPhoneTimer) {
        clearTimeout(this.checkPhoneTimer);
        this.checkPhoneTimer = null;
      }

      if (!this.formData.phone) {
        this.errors.phone = '请输入手机号码';
        this.phoneRegistered = false;
      } else if (!phoneRegex.test(this.formData.phone)) {
        this.errors.phone = '请输入正确的手机号码';
        this.phoneRegistered = false;
      } else {
        this.errors.phone = '';
        // 手机号格式正确，使用防抖延迟检查是否已注册
        this.checkPhoneTimer = setTimeout(() => {
          this.checkPhoneRegistration();
        }, 500); // 500ms防抖延迟
      }
    },

    // 检查手机号是否已注册
    async checkPhoneRegistration() {
      if (!this.formData.phone || this.isRegistering) {
        this.phoneRegistered = false;
        return;
      }

      this.checkingPhone = true;

      try {
        const response = await this.$request('service/check/phonenumber', {
          phone_number: this.formData.phone
        }, 'POST');

        console.log('手机号检查结果:', response);

        // 根据实际接口返回格式判断
        // 手机号存在时：{ code: 500, message: "该手机号已存在", status: "error" }
        // 手机号不存在时：假设返回其他状态码或成功状态

        if (response.code === 500 && response.status === "error") {
          // 检查message是否包含"已存在"或相关关键词
          const message = response.message || '';
          if (message.includes('已存在') || message.includes('已注册')) {
            this.phoneRegistered = true;
            // 手机号已注册，显示提示（防止重复弹窗）
            if (!this.hasShownRegisteredDialog) {
              this.hasShownRegisteredDialog = true;
              this.showRegisteredPhoneDialog();
            }
          } else {
            // 虽然是500错误，但不是因为手机号已存在
            this.phoneRegistered = false;
          }
        } else if (response.code === 200) {
          // code为200表示手机号不存在，可以注册
          this.phoneRegistered = false;
        } else {
          // 其他状态码，假设可以注册（避免因接口问题阻止用户注册）
          this.phoneRegistered = false;
        }
      } catch (error) {
        console.error('检查手机号注册状态失败:', error);
        // 网络错误时假设未注册，不影响用户体验
        this.phoneRegistered = false;
      } finally {
        this.checkingPhone = false;
      }
    },

    // 显示手机号已注册的提示弹窗
    showRegisteredPhoneDialog() {
      uni.showModal({
        title: '提示',
        content: '该手机号已注册，请前往登录',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 用户点击去登录
            this.goToLogin();
          }
        }
      });
    },

    // 验证验证码（仅做基本格式验证，不调用接口）
    validateVerificationCode() {
      if (!this.formData.verificationCode) {
        this.errors.verificationCode = '请输入验证码';
        return;
      }

      if (this.formData.verificationCode.length !== 6) {
        this.errors.verificationCode = '验证码应为6位数字';
        return;
      }

      // 仅做格式验证，不调用云函数验证（避免验证码被标记为已使用）
      this.errors.verificationCode = '';
    },

    // 在注册时验证验证码
    async verifyCodeForRegister() {
      try {
        // 调用云函数验证验证码
        const result = await uniCloud.callFunction({
          name: 'verify-sms',
          data: {
            phone_number: this.formData.phone,
            verification_code: this.formData.verificationCode
          }
        });

        console.log('验证码验证结果:', result);

        if (result.result && result.result.code === 200) {
          return true;
        } else {
          const errorMsg = result.result?.message || '验证码错误';
          uni.showToast({
            title: errorMsg,
            icon: 'none'
          });
          return false;
        }
      } catch (error) {
        console.error('验证码验证失败:', error);
        // 如果云函数验证失败，回退到本地验证
        if (this.formData.verificationCode === this.generatedCode) {
          return true;
        } else {
          uni.showToast({
            title: '验证码验证失败',
            icon: 'none'
          });
          return false;
        }
      }
    },

    // 生成6位随机验证码
    generateVerificationCode() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    },

    // 发送验证码
    async sendVerificationCode() {
      if (!this.canSendCode || this.countdown > 0) {
        return;
      }

      try {
        // 显示加载提示
        uni.showLoading({
          title: '发送中...'
        });

        // 调用云函数发送短信（使用简化版，不依赖数据库）
        const result = await uniCloud.callFunction({
          name: 'send-sms',
          data: {
            phone_number: this.formData.phone
          }
        });

        console.log('云函数响应:', result);

        if (result.result.code === 200) {
          // 发送成功
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          });

          // 保存验证码（仅用于调试，生产环境应该通过云函数验证）
          this.generatedCode = result.result.data.verification_code;

          // 开始倒计时
          this.startCountdown();
        } else {
          // 发送失败
          uni.showModal({
            title: '发送失败',
            content: result.message || '验证码发送失败，请重试',
            showCancel: false,
            confirmText: '确定'
          });
          console.error('短信发送失败:', result);
        }
      } catch (error) {
        console.error('发送验证码失败:', error);
        uni.showModal({
          title: '网络错误',
          content: '网络连接失败，请检查网络后重试',
          showCancel: false,
          confirmText: '确定'
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 开始倒计时
    startCountdown() {
      this.countdown = 60;
      this.countdownTimer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
        }
      }, 1000);
    },

    // 跳转到登录页面
    goToLogin() {
      uni.navigateTo({
        url: '/riderEnd/login'
      });
    },

    validatePassword() {
      if (!this.formData.password) {
        this.errors.password = '请设置密码';
      } else if (this.formData.password.length < 6) {
        this.errors.password = '密码长度不能少于6位';
      } else {
        this.errors.password = '';
      }
      // 如果确认密码已填写，则同时验证确认密码
      if (this.formData.confirmPassword) {
        this.validateConfirmPassword();
      }
    },
    validateConfirmPassword() {
      if (!this.formData.confirmPassword) {
        this.errors.confirmPassword = '请确认密码';
      } else if (this.formData.confirmPassword !== this.formData.password) {
        this.errors.confirmPassword = '两次输入的密码不一致';
      } else {
        this.errors.confirmPassword = '';
      }
    },
    validateName() {
      if (!this.formData.name) {
        this.errors.name = '请输入您的昵称';
      } else if (this.formData.name.length < 2) {
        this.errors.name = '昵称长度不能少于2个字符';
      } else {
        this.errors.name = '';
      }
    },
    validateWeixin() {
      if (!this.formData.weixin) {
        this.errors.weixin = '请输入您的微信号';
      } else if (this.formData.weixin.length < 3) {
        this.errors.weixin = '微信号长度不能少于3个字符';
      } else {
        this.errors.weixin = '';
      }
    },
    fillPhoneAsWeixin() {
      if (!this.formData.phone) {
        uni.showToast({
          title: '请先输入手机号码',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      // 将手机号填入微信号输入框
      this.formData.weixin = this.formData.phone;

      // 重新验证微信号
      this.validateWeixin();

      // 显示成功提示
      uni.showToast({
        title: '已填入手机号',
        icon: 'success',
        duration: 1500
      });
    },

    validateForm() {
      this.validatePhone();
      this.validateVerificationCode();  // 仅做格式验证
      this.validatePassword();
      this.validateConfirmPassword();
      this.validateName();
      this.validateWeixin();
      this.validateServiceProvider();
      this.validateServiceAreas();
      this.validateServiceBrands();

      return this.isFormValid;
    },

    // 检查未填写的必填项
    checkMissingRequiredFields() {
      const missingFields = [];

      // 检查服务商
      if (!this.formData.serviceProviderId) {
        missingFields.push({
          field: 'serviceProviderId',
          message: '请选择服务商',
          selector: '.service-provider-input'
        });
      }

      // 检查服务区域
      if (this.formData.serviceAreas.length === 0) {
        missingFields.push({
          field: 'serviceAreas',
          message: '请选择可服务城市',
          selector: '.service-area-input'
        });
      }

      // 检查可服务品牌
      if (this.formData.service_brands.length === 0) {
        missingFields.push({
          field: 'service_brands',
          message: '请选择可服务品牌',
          selector: '.service-brands-input'
        });
      }

      // 检查手机号
      if (!this.formData.phone) {
        missingFields.push({
          field: 'phone',
          message: '请输入手机号码',
          selector: '.phone-input'
        });
      }

      // 检查验证码
      if (!this.formData.verificationCode) {
        missingFields.push({
          field: 'verificationCode',
          message: '请输入验证码',
          selector: '.verification-code-input'
        });
      }

      // 检查密码
      if (!this.formData.password) {
        missingFields.push({
          field: 'password',
          message: '请设置密码',
          selector: '.password-input'
        });
      }

      // 检查确认密码
      if (!this.formData.confirmPassword) {
        missingFields.push({
          field: 'confirmPassword',
          message: '请确认密码',
          selector: '.confirm-password-input'
        });
      }

      // 检查昵称
      if (!this.formData.name) {
        missingFields.push({
          field: 'name',
          message: '请输入您的昵称',
          selector: '.name-input'
        });
      }

      // 检查微信号
      if (!this.formData.weixin) {
        missingFields.push({
          field: 'weixin',
          message: '请输入您的微信号',
          selector: '.weixin-input'
        });
      }

      return missingFields;
    },

    // 跳转到指定字段并提示
    scrollToField(fieldInfo) {
      // 设置对应的错误信息
      this.errors[fieldInfo.field] = fieldInfo.message;

      // 显示提示
      uni.showToast({
        title: fieldInfo.message,
        icon: 'none',
        duration: 2000
      });

      // 滚动到对应位置并聚焦输入框
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this);
        query.select(fieldInfo.selector).boundingClientRect((rect) => {
          if (rect) {
            uni.pageScrollTo({
              scrollTop: rect.top - 100, // 留出一些顶部空间
              duration: 300,
              success: () => {
                // 滚动完成后聚焦输入框
                this.focusInputField(fieldInfo.field);
              }
            });
          }
        }).exec();
      });
    },

    // 聚焦指定的输入框
    focusInputField(fieldName) {
      // 根据字段名称确定要聚焦的输入框
      switch(fieldName) {
        case 'serviceProviderId':
          // 服务商选择是点击触发，延时打开选择器
          setTimeout(() => {
            this.openServiceProviderPicker();
          }, 500);
          return;
        case 'serviceAreas':
          // 服务区域选择是点击触发，延时打开选择器
          setTimeout(() => {
            this.openServiceAreaPicker();
          }, 500);
          return;
        case 'service_brands':
          // 可服务品牌选择是点击触发，延时打开选择器
          setTimeout(() => {
            this.openServiceBrandsPicker();
          }, 500);
          return;
        case 'phone':
          this.focusInput('phoneInput');
          break;
        case 'verificationCode':
          this.focusInput('verificationCodeInput');
          break;
        case 'password':
          this.focusInput('passwordInput');
          break;
        case 'confirmPassword':
          this.focusInput('confirmPasswordInput');
          break;
        case 'name':
          this.focusInput('nameInput');
          break;
        case 'weixin':
          this.focusInput('weixinInput');
          break;
        default:
          return;
      }
    },

    // 通用的输入框聚焦方法
    focusInput(refName) {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.$refs[refName]) {
            try {
              this.$refs[refName].focus();
            } catch (error) {
              console.log('聚焦失败:', error);
              // 如果直接聚焦失败，尝试使用 uni-app 的方法
              const query = uni.createSelectorQuery().in(this);
              query.select(`[ref="${refName}"]`).fields({
                node: true,
                size: true
              }, (res) => {
                if (res && res.node) {
                  res.node.focus();
                }
              }).exec();
            }
          }
        }, 400);
      });
    },
    async handleRegister() {
      // 检索未填写的必填项
      const missingFields = this.checkMissingRequiredFields();

      if (missingFields.length > 0) {
        // 跳转到第一个未填写的必填项
        this.scrollToField(missingFields[0]);
        return;
      }

      if (!this.validateForm()) return;

      // 先验证验证码
      const codeValid = await this.verifyCodeForRegister();
      if (!codeValid) {
        return;
      }

      // 设置注册状态，禁用手机号检查
      this.isRegistering = true;

      // 显示加载提示
      uni.showLoading({
        title: '注册中...'
      });

      // 提取区域ID列表
      const serviceZone = this.formData.serviceAreas.map(area => area.district_id);
	  
	  // const formdata = {
   //      phone_number: this.formData.phone,
   //      password: this.formData.password,
   //      contact_person: this.formData.name,
   //      weixin: this.formData.weixin,
   //      service_provider_id: this.formData.serviceProviderId,
   //      service_zone: serviceZone,
   //      service_brands: this.formData.service_brands
	  // }
	  // console.log(formdata,'注册参数')

      // 构建注册参数
      const registerParams = {
        phone_number: this.formData.phone,
        password: this.formData.password,
        contact_person: this.formData.name,
        weixin: this.formData.weixin,
        service_provider_id: this.formData.serviceProviderId,
        service_zone: serviceZone,
        service_brands: this.formData.service_brands
      };

      // 如果有推荐人ID，添加到注册参数中
      if (this.referrerId) {
        registerParams.referrer_id = this.referrerId;
        console.log('添加推荐人ID到注册参数:', this.referrerId);
      }

      // 调用注册接口
      this.$request('service/member/register', registerParams, 'POST').then(res => {
        console.log('注册接口响应:', res);

        // 检查多种可能的成功响应格式
        if (res.status === 'success' || res.code === 200 || (res.data && res.message === 'success')) {
          console.log('注册成功，显示二维码弹窗');

          // 注册成功，显示二维码弹窗
          this.showQRCodeModal = true;
        } else {
          // 注册失败，显示错误信息
          const errorMsg = res.message || res.msg || res.error || '注册失败，请检查信息后重试';
          uni.showModal({
            title: '注册失败',
            content: errorMsg,
            showCancel: false,
            confirmText: '确定'
          });
          console.log('注册失败，响应:', res);
        }
      }).catch(err => {
        // 处理请求错误
        console.error('注册请求失败:', err);
        uni.showModal({
          title: '网络错误',
          content: '网络连接失败，请检查网络后重试',
          showCancel: false,
          confirmText: '确定'
        });
      }).finally(() => {
        // 隐藏加载提示
        uni.hideLoading();
        // 重置注册状态
        this.isRegistering = false;
      });
    },
    goToLogin() {
      uni.navigateTo({
        url: '/riderEnd/login'
      });
    },
    openAgreement(type) {
      const url = type === 'user' ? '/pages/agreement/user' : '/pages/agreement/privacy';
      uni.navigateTo({
        url: url
      });
    },
    goBack() {
      uni.navigateBack();
    },
    getServiceProviderId() {
      this.$request('service/group/list', {sign:'chongchong'}, 'POST').then(res => {
        if (res.code === 200 && res.data && res.data.length > 0) {
          this.serviceProviders = res.data;
          // 默认选择第一个服务商
          if (this.serviceProviders.length > 0 && !this.formData.serviceProviderId) {
            this.formData.serviceProviderId = this.serviceProviders[0].service_provider_id;
            this.validateServiceProvider();
          }
        } else {
          uni.showModal({
            title: '获取失败',
            content: '获取服务商信息失败，请重试',
            showCancel: false,
            confirmText: '确定'
          });
        }
      }).catch(err => {
        console.error('获取服务商信息失败:', err);
        uni.showModal({
          title: '网络错误',
          content: '网络连接失败，请检查网络后重试',
          showCancel: false,
          confirmText: '确定'
        });
      });
    },
    openServiceProviderPicker() {
      this.showServiceProviderPicker = true;
    },
    selectServiceProvider(provider) {
      this.formData.serviceProviderId = provider.service_provider_id;
      this.showServiceProviderPicker = false;
      this.validateServiceProvider();
    },
    validateServiceProvider() {
      if (!this.formData.serviceProviderId) {
        this.errors.serviceProviderId = '请选择服务商';
      } else {
        this.errors.serviceProviderId = '';
      }
    },

    // 服务区域相关方法
    getServiceAreas() {
      this.$request('service/zone', {sign: 'chongchong'}, 'POST').then(res => {
        if (res.code === 200 && res.data && res.data.length > 0) {
          this.serviceAreas = res.data;
        } else {
          uni.showModal({
            title: '获取失败',
            content: '获取服务区域信息失败，请重试',
            showCancel: false,
            confirmText: '确定'
          });
        }
      }).catch(err => {
        console.error('获取服务区域信息失败:', err);
        uni.showModal({
          title: '网络错误',
          content: '网络连接失败，请检查网络后重试',
          showCancel: false,
          confirmText: '确定'
        });
      });
    },

    openServiceAreaPicker() {
      this.showServiceAreaPicker = true;
      // 如果还没有加载服务区域数据，则加载
      if (this.serviceAreas.length === 0) {
        this.getServiceAreas();
      }

      // 当用户主动打开服务区域选择器时，暂时清除错误提示，提升用户体验
      if (this.errors.serviceAreas) {
        this.errors.serviceAreas = '';
      }
    },

    toggleProvince(provinceId) {
      if (this.expandedProvinces.includes(provinceId)) {
        // 如果已经展开，则收起
        this.expandedProvinces = this.expandedProvinces.filter(id => id !== provinceId);
      } else {
        // 如果未展开，则展开
        this.expandedProvinces.push(provinceId);
      }
    },

    isCitySelected(cityId) {
      return this.selectedAreas.some(area => area.city_id === cityId);
    },

    toggleCitySelection(city, provinceName) {
      const index = this.selectedAreas.findIndex(area => area.city_id === city.city_id);

      if (index !== -1) {
        // 如果已经选中，则取消选中
        this.selectedAreas.splice(index, 1);

        // 更新表单数据
        this.updateFormServiceAreas();
      } else {
        // 如果未选中，则添加到已选中列表
        // 检查是否已经选择了3个区域
        if (this.selectedAreas.length >= 3) {
          uni.showToast({
            title: '最多只能选3个服务城市！',
            icon: 'none',
            duration: 2000
          });
          return;
        }

        // 添加省市名称信息，包含该城市下的所有区县
        const cityWithDistricts = {
          city_id: city.city_id,
          city_name: city.name,
          province_name: provinceName,
          districts: city.children || [] // 包含所有区县信息
        };

        this.selectedAreas.push(cityWithDistricts);

        // 更新表单数据
        this.updateFormServiceAreas();
      }
    },



    // 更新表单中的服务区域数据
    updateFormServiceAreas() {
      if (this.selectedAreas.length > 0) {
        // 将选中的城市展开为所有区县
        const allDistricts = [];
        this.selectedAreas.forEach(city => {
          if (city.districts && city.districts.length > 0) {
            // 如果城市有区县，添加所有区县
            city.districts.forEach(district => {
              allDistricts.push({
                district_id: district.district_id,
                latitude: district.latitude,
                longitude: district.longitude,
                province_name: city.province_name,
                city_name: city.city_name,
                name: district.name
              });
            });
          } else {
            // 如果城市没有区县，直接添加城市作为区域
            allDistricts.push({
              district_id: city.city_id, // 使用城市ID作为区域ID
              latitude: city.latitude || '',
              longitude: city.longitude || '',
              province_name: city.province_name,
              city_name: city.city_name,
              name: city.city_name
            });
          }
        });

        this.formData.serviceAreas = allDistricts;

        // 如果之前有错误，现在清除错误
        if (this.errors.serviceAreas) {
          this.errors.serviceAreas = '';
        }
      } else {
        this.formData.serviceAreas = [];
        // 只有在用户已经尝试提交表单或已经打开过服务区域选择器后才显示错误
        // 这样可以避免一开始就显示错误信息
      }
    },

    removeSelectedArea(index) {
      this.selectedAreas.splice(index, 1);
      // 更新表单数据
      this.updateFormServiceAreas();
    },

    confirmServiceAreas() {
      if (this.selectedAreas.length === 0) {
        // 用户点击确认但没有选择区域，显示错误提示
        this.errors.serviceAreas = '请选择可服务城市';
        this.showServiceAreaPicker = false;
        return;
      }

      // 使用公共方法更新表单数据
      this.updateFormServiceAreas();

      // 关闭弹窗
      this.showServiceAreaPicker = false;
    },

    validateServiceAreas() {
      if (this.formData.serviceAreas.length === 0) {
        this.errors.serviceAreas = '请选择可服务城市';
      } else {
        this.errors.serviceAreas = '';
      }
    },

    // 可服务品牌相关方法
    openServiceBrandsPicker() {
      this.showServiceBrandsPicker = true;
      // 当用户主动打开品牌选择器时，暂时清除错误提示，提升用户体验
      if (this.errors.service_brands) {
        this.errors.service_brands = '';
      }
    },

    isBrandSelected(brandValue) {
      return this.formData.service_brands.includes(brandValue);
    },

    toggleBrandSelection(brandValue) {
      const index = this.formData.service_brands.indexOf(brandValue);
      if (index !== -1) {
        // 如果已经选中，则取消选中
        this.formData.service_brands.splice(index, 1);
      } else {
        // 如果未选中，则添加到已选中列表
        this.formData.service_brands.push(brandValue);
      }

      // 更新错误状态
      this.validateServiceBrands();
    },

    getBrandLabel(brandValue) {
      const brand = this.serviceBrands.find(b => b.value === brandValue);
      return brand ? brand.label : brandValue;
    },

    // 获取品牌名称（括号前的部分）
    getBrandName(brand) {
      const label = brand.label;
      const index = label.indexOf('（');
      return index !== -1 ? label.substring(0, index) : label;
    },

    // 获取品牌描述（括号内的部分）
    getBrandDescription(brand) {
      const label = brand.label;
      const startIndex = label.indexOf('（');
      const endIndex = label.indexOf('）');
      if (startIndex !== -1 && endIndex !== -1) {
        return label.substring(startIndex, endIndex + 1);
      }
      return '';
    },

    removeBrand(index) {
      this.formData.service_brands.splice(index, 1);
      this.validateServiceBrands();
    },

    confirmServiceBrands() {
      if (this.formData.service_brands.length === 0) {
        // 用户点击确认但没有选择品牌，显示错误提示
        this.errors.service_brands = '请选择可服务品牌';
        this.showServiceBrandsPicker = false;
        return;
      }

      // 关闭弹窗
      this.showServiceBrandsPicker = false;
    },

    validateServiceBrands() {
      if (this.formData.service_brands.length === 0) {
        this.errors.service_brands = '请选择可服务品牌';
      } else {
        this.errors.service_brands = '';
      }
    },

    // 自动登录
    autoLogin() {
      // 显示加载提示
      uni.showLoading({
        title: '登录中...'
      });

      // 使用注册时的手机号和密码进行登录
      console.log('开始自动登录，手机号:', this.formData.phone);

      this.$request('service/member/login', {
        phone_number: this.formData.phone,
        password: this.formData.password
      }, 'POST').then(res => {
        console.log('自动登录响应:', res);
        if (res.code === 200 && res.data) {
          // 登录成功，保存用户信息
          const memberData = res.data.service_member;

          if (!memberData) {
            console.error('登录响应中缺少 service_member 数据:', res.data);
            uni.showModal({
              title: '登录异常',
              content: '登录数据异常，请手动登录',
              showCancel: false,
              confirmText: '确定',
              success: () => {
                uni.redirectTo({
                  url: '/riderEnd/login'
                });
              }
            });
            return;
          }

          const userInfo = {
            name: memberData.contact_person,
            id: memberData.service_member_id,
            phone: memberData.phone_number,
            verified: memberData.status === 1, // 假设status为1表示已认证
            depositPaid: Number(memberData.actual_deposit) >= Number(memberData.required_deposit),
            balance: memberData.balance,
            level: memberData.level,
            rate: memberData.rate,
            watermark: memberData.watermark,
            provider_id: memberData.service_provider_id
          };

          // 保存用户信息到本地存储
          uni.setStorageSync('riderUserInfo', userInfo);

          // 登录成功提示
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          });

          // 跳转到骑手端接单大厅
          setTimeout(() => {
            // 获取本地存储的 referrer_id
            const localReferrerId = uni.getStorageSync('current_referrer_id');
            let redirectUrl = '/riderEnd/index';
            
            // 如果有 referrer_id，则传递给接单大厅
            if (localReferrerId) {
              redirectUrl = `/riderEnd/index?referrer_id=${localReferrerId}`;
              console.log('注册成功后跳转到接单大厅，携带referrer_id:', localReferrerId);
            }
            
            uni.redirectTo({
              url: redirectUrl
            });
          }, 1000);
        } else {
          // 登录失败，跳转到登录页
          uni.showToast({
            title: '自动登录失败，请手动登录',
            icon: 'none',
            duration: 3000 // 显示3秒
          });

          setTimeout(() => {
            uni.redirectTo({
              url: '/riderEnd/login'
            });
          }, 1500);
        }
      }).catch(err => {
        // 处理请求错误，跳转到登录页
        console.error('自动登录失败:', err);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 3000 // 显示3秒
        });

        setTimeout(() => {
          uni.redirectTo({
            url: '/riderEnd/login'
          });
        }, 1500);
      }).finally(() => {
        // 隐藏加载提示
        uni.hideLoading();
      });
    },

    // 确认二维码弹窗
    confirmQRCode() {
      // 关闭二维码弹窗
      this.showQRCodeModal = false;

      // 开始自动登录
      this.autoLogin();
    },

    // 预览二维码
    previewQRCode() {
      uni.previewImage({
        urls: ['https://ccpt.qiniu.0871.cn/my/kefuwechat.png'],
        current: 'https://ccpt.qiniu.0871.cn/my/kefuwechat.png'
      });
    }
  },
  onLoad(options) {
    // 处理分享链接中的推荐人ID参数
    if (options.referrerId) {
      this.referrerId = options.referrerId;
      console.log('接收到推荐人ID:', this.referrerId);

      // 将 referrer_id 保存到本地存储，供后续使用
      uni.setStorageSync('current_referrer_id', this.referrerId);
      console.log('推荐人ID已保存到本地存储:', this.referrerId);

      // 显示推荐信息提示
      // uni.showToast({
      //   title: `通过推荐人ccqs${this.referrerId}${Math.random() < 0.5 ? '2' : '5'}进入注册`,
      //   icon: 'none',
      //   duration: 3000
      // });
    }

    // 也处理 referrer_id 参数（兼容不同的参数名）
    if (options.referrer_id) {
      this.referrerId = options.referrer_id;
      uni.setStorageSync('current_referrer_id', this.referrerId);
      console.log('接收到referrer_id参数并保存到本地:', this.referrerId);
    }

    this.getServiceProviderId();
    this.getServiceAreas();
  },
  onUnload() {
    // 清理倒计时定时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    // 清理手机号检查定时器
    if (this.checkPhoneTimer) {
      clearTimeout(this.checkPhoneTimer);
      this.checkPhoneTimer = null;
    }
  }
}
</script>

<style lang="scss" scoped>
.register-page {
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
  background: linear-gradient(180deg, #4094F4, #4C98F1);
}

.top-bg {
  height: 300rpx;
  background: url('https://ccpt.qiniu.0871.cn/rider/crea_banner.png') no-repeat center center;
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  // margin-top: -90px;
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

.register-form {
  flex: 1;
  padding: 60rpx 50rpx;
  position: relative;
  z-index: 1;

  // 标题和推荐人信息水平布局
  .form-header {
    margin-bottom: 60rpx;

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
    }

    .form-title {
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
    }

    .referrer-info {
      .referrer-text {
        font-size: 24rpx;
        color: #999;
        white-space: nowrap;
      }
    }

    .notice-text {
      font-size: 24rpx;
      color: #ff4444;
      margin-top: 10rpx;
    }
  }

  .input-group {
    margin-bottom: 40rpx;

    .input-label {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 20rpx;

      .sub-label {
        font-size: 24rpx;
        color: #999;
      }
    }

    .input-container {
      height: 90rpx;
      background-color: #f5f7fa;
      border-radius: 45rpx;
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      position: relative;

      .prefix {
        color: #333;
        font-size: 28rpx;
        margin-right: 20rpx;
      }

      .input {
        flex: 1;
        height: 90rpx;
        font-size: 28rpx;
        color: #333;
      }

      .clear-btn {
        width: 40rpx;
        height: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        .clear-icon {
          font-size: 40rpx;
          color: #999;
          line-height: 1;
        }
      }

      .password-toggle {
        width: 40rpx;
        height: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        .eye-icon {
          width: 40rpx;
          height: 40rpx;
        }
      }
    }

    .verification-code {
      .verification-btn {
        font-size: 26rpx;
        color: #2492F2;
        padding: 0 20rpx;
        height: 60rpx;
        line-height: 60rpx;
        border-left: 1px solid #e0e0e0;
        white-space: nowrap;

        &.disabled {
          color: #999;
        }
      }
    }

    .weixin-container {
      .phone-fill-btn {
        font-size: 24rpx;
        color: #2492F2;
        padding: 0 20rpx;
        height: 60rpx;
        line-height: 60rpx;
        border-left: 1px solid #e0e0e0;
        white-space: nowrap;
        display: flex;
        align-items: center;
        justify-content: center;

        .phone-fill-text {
          font-size: 24rpx;
          color: #2492F2;
        }

        &:active {
          background-color: #f0f9ff;
        }
      }
    }

    .error-tip {
      font-size: 24rpx;
      color: #f56c6c;
      margin-top: 10rpx;
      padding-left: 30rpx;
    }
  }

  .register-btn {
    width: 100%;
    height: 90rpx;
    color: #fff;
    font-size: 32rpx;
    border-radius: 45rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 60rpx;
    border: none;

    &-blue {
      background: linear-gradient(135deg, #2492F2, #1a7ad9);
    }
  }

  .login-link {
    text-align: center;
    font-size: 28rpx;
    color: #2492F2;
    margin-top: 30rpx;
  }
}

.bottom-info {
  padding: 40rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  .agreement {
    font-size: 24rpx;
    color: #999;
    text-align: center;
    margin-bottom: 10rpx;

    .link {
      color: #2492F2;
    }
  }

  .copyright {
    font-size: 24rpx;
    color: #999;
    text-align: center;
  }
}

.service-provider-picker, .service-area-picker {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  touch-action: none; /* 防止触摸事件穿透到底层 */

  .picker-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .picker-content {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    border-radius: 20rpx 20rpx 0 0;
    padding: 30rpx;
    padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 确保内容不会溢出 */

    .picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30rpx;

      .picker-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .picker-close {
        font-size: 40rpx;
        color: #999;
        padding: 10rpx;
      }
    }

    .picker-list {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 20rpx;
      -webkit-overflow-scrolling: touch; /* 增强iOS滚动体验 */
      overscroll-behavior: contain; /* 防止滚动传递到父元素 */
      max-height: calc(60vh - 100rpx); /* 限制高度，确保有足够空间显示已选择区域和确认按钮 */

      .picker-item {
        padding: 20rpx 0;
        border-bottom: 1rpx solid #eee;

        .provider-info {
          .provider-name {
            font-size: 30rpx;
            color: #333;
            font-weight: 500;
            margin-bottom: 10rpx;
            display: block;
          }

          .provider-contact,
          .provider-phone,
          .provider-address {
            font-size: 26rpx;
            color: #666;
            display: block;
            margin-bottom: 6rpx;
          }
        }
      }
    }
  }
}

.service-area-picker {
  .selected-areas {
    background-color: #f5f7fa;
    padding: 20rpx;
    border-radius: 10rpx;
    margin-bottom: 20rpx;

    .selected-area-title {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 10rpx;
    }

    .selected-area-list {
      display: flex;
      flex-wrap: wrap;
      padding: 10rpx 0;
      width: 100%;

      .selected-area-item {
        background-color: #e6f7ff;
        color: #2492F2;
        font-size: 26rpx;
        padding: 10rpx 20rpx;
        border-radius: 30rpx;
        margin-right: 20rpx;
        margin-bottom: 16rpx;
        display: flex;
        align-items: center;

        .remove-area {
          margin-left: 10rpx;
          font-size: 28rpx;
          color: #2492F2;
        }
      }
    }
  }

  .province-item {
    margin-bottom: 20rpx;

    .province-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #eee;

      .province-name {
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
      }

      .expand-icon {
        font-size: 24rpx;
        color: #999;
      }
    }

    .city-list {
      padding-left: 30rpx;

      .city-item {
        margin-top: 10rpx;

        .city-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15rpx 0;
          border-bottom: 1rpx solid #f5f5f5;
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:active {
            background-color: #f8f9fa;
          }

          &.city-selected {
            background-color: #e3f2fd;

            .city-name {
              color: #2492F2;
              font-weight: 500;
            }
          }

          .city-name {
            font-size: 28rpx;
            color: #333;
          }

          .check-icon {
            font-size: 24rpx;
            color: #2492F2;
            font-weight: bold;
          }
        }


      }
    }
  }

  .confirm-btn {
    height: 90rpx;
    background: linear-gradient(135deg, #2492F2, #1a7ad9);
    color: #fff;
    font-size: 32rpx;
    border-radius: 45rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 30rpx;
    margin-bottom: 20rpx;
    position: relative;
    z-index: 10;
    flex-shrink: 0; /* 防止按钮被压缩 */
  }
}

.arrow-icon {
  color: #999;
  font-size: 24rpx;
  margin-left: 10rpx;
}

.picker-item-disabled {
  opacity: 0.5;
  pointer-events: none;
  background: #f5f5f5;
}

.service-brands-picker {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  touch-action: none;

  .picker-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .picker-content {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    border-radius: 20rpx 20rpx 0 0;
    padding: 30rpx;
    padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30rpx;

      .picker-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .picker-close {
        font-size: 40rpx;
        color: #999;
        padding: 10rpx;
      }
    }

    .selected-brands {
      background-color: #f5f7fa;
      padding: 20rpx;
      border-radius: 10rpx;
      margin-bottom: 20rpx;

      .selected-brand-title {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 10rpx;
      }

      .selected-brand-list {
        display: flex;
        flex-wrap: wrap;
        padding: 10rpx 0;
        width: 100%;

        .selected-brand-item {
          background-color: #e6f7ff;
          color: #2492F2;
          font-size: 26rpx;
          padding: 10rpx 20rpx;
          border-radius: 30rpx;
          margin-right: 20rpx;
          margin-bottom: 16rpx;
          display: flex;
          align-items: center;

          .remove-brand {
            margin-left: 10rpx;
            font-size: 28rpx;
            color: #2492F2;
          }
        }
      }
    }

    .picker-list {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 20rpx;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      max-height: calc(60vh - 100rpx);

      .brand-item {
        padding: 20rpx 0;
        border-bottom: 1rpx solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &.brand-selected {
          background-color: #f0f9ff;
        }

        .brand-content {
          flex: 1;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 12rpx;
        }

        .brand-name {
          font-size: 30rpx;
          color: #333;
          font-weight: 500;
          line-height: 1.2;
        }

        .brand-description {
          font-size: 24rpx;
          color: #ff4444;
          line-height: 1.2;
        }

        .check-icon {
          color: #2492F2;
          font-size: 28rpx;
        }
      }
    }

    .confirm-btn {
      height: 90rpx;
      background: linear-gradient(135deg, #2492F2, #1a7ad9);
      color: #fff;
      font-size: 32rpx;
      border-radius: 45rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 30rpx;
      margin-bottom: 20rpx;
      position: relative;
      z-index: 10;
      flex-shrink: 0;
    }
  }
}

// 二维码弹窗样式
.qrcode-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;

  .qrcode-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .qrcode-content {
    position: relative;
    width: 600rpx;
    background-color: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    z-index: 10;

    .qrcode-header {
      padding: 40rpx 30rpx 20rpx;
      text-align: center;
      border-bottom: 1rpx solid #f0f0f0;

      .qrcode-title {
        font-size: 36rpx;
        font-weight: 600;
        color: #333;
      }
    }

    .qrcode-body {
      padding: 40rpx 30rpx;
      text-align: center;

      .success-icon {
        width: 80rpx;
        height: 80rpx;
        background-color: #52c41a;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40rpx;
        font-weight: bold;
        margin: 0 auto 20rpx;
      }

      .success-text {
        display: block;
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
        margin-bottom: 20rpx;
      }

      .qrcode-desc {
        display: block;
        font-size: 28rpx;
        color: #666;
        margin-bottom: 30rpx;
      }

      .qrcode-image {
        width: 400rpx;
        height: 400rpx;
        margin: 0 auto;
        border: 1rpx solid #f0f0f0;
        border-radius: 10rpx;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s ease;

        &:active {
          transform: scale(0.95);
        }

        image {
          width: 100%;
          height: 100%;
        }
      }
    }

    .qrcode-footer {
      padding: 20rpx 30rpx 40rpx;

      .qrcode-confirm-btn {
        width: 100%;
        height: 80rpx;
        background: linear-gradient(135deg, #2492F2, #1a7ad9);
        color: #fff;
        font-size: 32rpx;
        font-weight: 500;
        border-radius: 40rpx;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;

        &:active {
          opacity: 0.9;
          transform: scale(0.98);
        }
      }
    }
  }
}
</style>
