<template>
  <view class="order-detail">
    <!-- 顶部导航栏 -->
    <nav-bar title="接单详情" title-align="center"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 订单信息卡片 -->
    <view class="order-card" :class="{ 'completed-order': isCompleted, 'assigned-order': isAssigned }">
      <!-- 完结订单盖章图片 -->
      <image
        v-if="isCompleted"
        class="completed-stamp-image"
        src="https://ccpt.qiniu.cc111.cn/rider/yiwanjie.svg"
        mode="aspectFit">
      </image>

      <!-- 进行中订单盖章图片 -->
      <image
        v-if="isAssigned"
        class="assigned-stamp-image"
        src="https://ccpt.qiniu.cc111.cn/rider/assigned.svg"
        mode="aspectFit">
      </image>

      <!-- 订单图标和地址 -->
      <view class="order-header">
        <view class="order-icon">
          <text>{{ getServiceIconText(orderInfo.serviceType) }}</text>
        </view>
        <view class="order-address-align">
          <view class="order-number-align">
            <text>订单编号：{{ orderInfo.orderNumber }}</text>
          </view>
          <view class="order-time-align">
            <text>下单时间：{{ orderInfo.orderTime }}</text>
          </view>
        </view>
      </view>

      <!-- 订单详情列表 -->
      <view class="order-info-list">
        <view class="info-item">
          <text class="label">品牌数量：</text>
          <view class="value">
            <text>{{ displayBrand }}*</text>
            <text class="quantity-highlight">{{ orderInfo.itemNumber || 1 }}个</text>
          </view>
        </view>
        <view class="info-item">
          <text class="label">门店地址：</text>
          <text class="value">{{ formatAddress(orderInfo.address, isRecentTask) }}</text>
        </view>
        <!-- 设备是否外摆 -->
        <view class="info-item" v-if="orderInfo.deviceOutside !== undefined">
          <text class="label">设备是否外摆：</text>
          <text class="value highlight">{{ orderInfo.deviceOutside ? '是' : '否' }}</text>
        </view>
        <view class="info-item">
          <text class="label">服务时效：</text>
          <text class="value highlight">{{ displayServiceTime }}</text>
        </view>
        <!-- 隐藏服务备注 -->
        <!-- <view class="info-item">
          <text class="label">服务备注：</text>
          <text class="value highlight">{{ orderInfo.serviceNote }}</text>
        </view> -->
      </view>

      <!-- 订单金额 -->
      <view class="order-total">
        <text>合计：</text>
        <text class="price">{{ getDisplayAmount(orderInfo.totalAmount) }}</text>
      </view>
    </view>

    <!-- 更多订单信息提示 -->
    <view class="more-info-tip" v-if="!isAccepted && !isCompleted && !isAssigned">
      <image src="https://ccpt.qiniu.cc111.cn/rider/notice.png" mode="aspectFit" class="notice-icon"></image>
      <text>更多订单详情在确认接单后展示</text>
    </view>

    <!-- 完结订单提示 -->
    <view class="completed-info-tip" v-if="isCompleted">
      <image src="https://ccpt.qiniu.cc111.cn/rider/notice.png" mode="aspectFit" class="notice-icon"></image>
      <text>此订单已完结，仅供查看</text>
    </view>

    <!-- 进行中订单提示 -->
    <view class="assigned-info-tip" v-if="isAssigned">
      <image src="https://ccpt.qiniu.cc111.cn/rider/notice.png" mode="aspectFit" class="notice-icon"></image>
      <text>此订单正在进行中</text>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view class="home-btn" @click="goToHome">
        <image src="https://ccpt.qiniu.cc111.cn/rider/home.png" mode="aspectFit"></image>
        <text>接单大厅</text>
      </view>
      <button v-if="!isCompleted && !isAssigned" class="confirm-btn" @click="showConfirmModal = true">
        <text>确认接单</text>
      </button>
      <view v-else-if="isAssigned" class="assigned-btn">
        <text>进行中</text>
      </view>
      <view v-else class="completed-btn">
        <text>订单已完结</text>
      </view>
    </view>

    <!-- 统一风格弹窗 -->
    <auth-modal
      :show="showConfirmModal"
      title="提示"
      content="您确定要接此单吗？"
      cancel-text="取消"
      confirm-text="确认"
      @cancel="showConfirmModal = false"
      @confirm="handleConfirmOrder"
    />

    <!-- 认证提示弹窗 -->
    <auth-modal
      :show="showAuthModal"
      title="认证提示"
      content="您还未完成骑手认证，无法接单。是否前往认证页面？"
      cancel-text="取消"
      confirm-text="去认证"
      @cancel="showAuthModal = false"
      @confirm="goToAuth"
    />

    <!-- 协议勾选 -->
    <view class="agreement-check">
      <checkbox-group>
        <label>
          <checkbox value="1" checked></checkbox>
          <text>同意并阅读</text>
          <text class="link">《充充跑腿独立骑手接单说明》</text>
        </label>
      </checkbox-group>
    </view>

    <!-- 加载状态 -->
    <view class="loading-container" v-if="loading">
      <div class="loading-spinner"></div>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import AuthModal from '@/components/AuthModal/index.vue'
import md5 from 'md5'

export default {
  components: {
    NavBar,
    AuthModal
  },
  data() {
    return {
      orderInfo: {
        address: '',
        orderNumber: '',
        orderTime: '',
        brand: '',
        mainService: '',
        deviceOutside: undefined, // 设备是否外摆
        serviceTime: '',
        serviceNote: '',
        totalAmount: '',
        itemNumber: 1, // 添加数量字段
        timeLimit: 0, // 添加时效小时数
        deadline: '', // 添加截止时间
        serviceType: '' // 添加服务类型字段
      },
      brandMap: {
        'meituan': '美团',
        'guaishou': '怪兽',
        'jiedian': '街电',
        'xiaodian': '小电'
      },
      taskId: '',
      riderUserInfo: null,
      loading: true,
      isAccepted: false,
      isCompleted: false, // 是否为完结订单
      isAssigned: false, // 是否为进行中订单
      isRecentTask: false, // 是否来自recent_tasks
      detailInfo: {
        shopName: '',
        detailAddress: '',
        priceDetails: [],
        snCode: '',
        macCode: '',
        shopImage: ''
      },
      showConfirmModal: false,
      showAuthModal: false,
    }
  },
  computed: {
    // 转换品牌显示
    displayBrand() {
      return this.brandMap[this.orderInfo.brand.toLowerCase()] || this.orderInfo.brand
    },

    // 品牌数量显示
    displayBrandAndQuantity() {
      const brand = this.displayBrand;
      const quantity = this.orderInfo.itemNumber || 1;
      return `${brand}*${quantity}个`;
    },

    // 服务时效显示
    displayServiceTime() {
      if (!this.orderInfo.timeLimit || !this.orderInfo.deadline) {
        return this.orderInfo.serviceTime || '未知时间';
      }

      try {
        // 格式化截止时间
        const deadline = new Date(this.orderInfo.deadline.replace(/-/g, '/'));
        const deadlineStr = `${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')} ${String(deadline.getHours()).padStart(2, '0')}:${String(deadline.getMinutes()).padStart(2, '0')}`;

        return `${this.orderInfo.timeLimit}小时 ${deadlineStr}前完成`;
      } catch (err) {
        console.error('格式化服务时效出错:', err);
        return this.orderInfo.serviceTime || '未知时间';
      }
    }
  },
  onLoad(options) {
    // 确保taskId是字符串类型
    this.taskId = options && options.id ? String(options.id) : '';

    // 获取是否为完结订单的标识
    this.isCompleted = options && options.isCompleted === 'true';

    // 获取是否为进行中订单的标识
    this.isAssigned = options && options.isAssigned === 'true';

    // 获取是否来自recent_tasks的标识
    this.isRecentTask = options && options.isRecentTask === 'true';

    if (!this.taskId) {
      console.error('订单详情页加载失败: 缺少订单ID');
      uni.showToast({
        title: '订单信息不完整',
        icon: 'none'
      });

      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
      return;
    }

    // 获取骑手信息
    this.riderUserInfo = uni.getStorageSync('riderUserInfo');

    if (!this.riderUserInfo) {
      console.error('订单详情页加载失败: 未获取到骑手信息');
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      });

      // 延迟跳转到登录页
      setTimeout(() => {
        uni.redirectTo({
          url: '/riderEnd/login'
        });
      }, 1500);
      return;
    }

    // 获取订单详情
    this.getTaskInfo();
  },
  methods: {
    // 获取订单详情
    async getTaskInfo() {
      if (!this.taskId || !this.riderUserInfo) {
        uni.showToast({
          title: '参数错误',
          icon: 'none'
        })
        return
      }

      this.loading = true
      try {
        // 计算sign参数
        const signStr = `service_member_id=${this.riderUserInfo.id}&phone_number=${this.riderUserInfo.phone}`
        const sign = md5(signStr)

        const res = await this.$request('task/info', {
          task_id: this.taskId,
          service_member_id: this.riderUserInfo.id,
          sign: sign,
        }, 'POST')

        if (res.code === 200 && res.data) {
          const taskInfo = res.data

          // 安全地获取任务详情
          const taskDetail = taskInfo.task_detail || {};

          // 安全地构建主服务内容
          let mainService = '';
          let serviceType = '';
          try {
            const detail = taskDetail.detail || '';
            const itemNumber = taskDetail.item_number || 1;

            // 设置服务类型
            serviceType = detail;

            // 构建主服务显示文本
            switch (detail) {
              case 'bubao':
                mainService = `补宝x${itemNumber}`;
                break;
              case 'offline_abnormal':
                mainService = `离线异常x${itemNumber}`;
                break;
              case 'income_abnormal':
                mainService = `收入异常x${itemNumber}`;
                break;
              case 'other_abnormal':
                mainService = `其他异常x${itemNumber}`;
                break;
              default:
                mainService = `${detail}x${itemNumber}`;
            }
          } catch (err) {
            console.error('构建主服务内容出错:', err);
            mainService = '未知服务';
            serviceType = 'unknown';
          }

          // 处理地址显示逻辑，与订单列表保持一致
          const displayAddress = (() => {
            const fullAddress = [
              taskInfo.province_name,
              taskInfo.city_name,
              taskInfo.district_name,
              taskInfo.shop_address
            ].filter(Boolean).join('');

            if (this.isRecentTask && fullAddress.length > 8) {
              return fullAddress.slice(0, -8) + '...';
            }

            return fullAddress;
          })();

          this.orderInfo = {
            address: displayAddress,
            orderNumber: taskInfo.task_no || '',
            orderTime: taskInfo.task_date || '',
            brand: taskInfo.brand || '',
            mainService: mainService,
            deviceOutside: taskDetail.device_outside, // 设备是否外摆
            serviceTime: this.formatServiceTime(taskInfo.task_date, taskInfo.deadline),
            serviceNote: taskDetail.description || '',
            totalAmount: taskInfo.order_amount || '0.00',
            itemNumber: taskDetail.item_number || 1, // 设置数量
            timeLimit: taskInfo.time_limit || 0, // 设置时效小时数
            deadline: taskInfo.deadline || '', // 设置截止时间
            serviceType: serviceType // 设置服务类型
          }
        } else {
          uni.showToast({
            title: res.message || '获取订单详情失败',
            icon: 'none'
          })
        }
      } catch (err) {
        console.error('获取订单详情失败:', err)
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    // 格式化服务时间
    formatServiceTime(startTime, endTime) {
      if (!startTime || !endTime) return '未知时间';

      try {
        // 处理日期字符串，确保兼容性
        const formatDateStr = (dateStr) => {
          if (!dateStr) return null;
          // 将 yyyy-MM-dd HH:mm:ss 转换为 yyyy/MM/dd HH:mm:ss 以提高兼容性
          return dateStr.replace(/-/g, '/');
        };

        // 格式化日期对象为字符串
        const formatDate = (date) => {
          if (!date || isNaN(date.getTime())) return '未知时间';

          try {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
          } catch (err) {
            console.error('格式化日期出错:', err);
            return '未知时间';
          }
        };

        // 格式化开始时间
        const startDateStr = formatDateStr(startTime);
        const startDate = startDateStr ? new Date(startDateStr) : null;
        const formattedStart = formatDate(startDate);

        // 格式化结束时间
        const endDateStr = formatDateStr(endTime);
        const endDate = endDateStr ? new Date(endDateStr) : null;
        const formattedEnd = formatDate(endDate);

        if (formattedStart === '未知时间' || formattedEnd === '未知时间') {
          return '未知时间';
        }

        return `${formattedStart} 至 ${formattedEnd}`;
      } catch (err) {
        console.error('格式化服务时间出错:', err, '开始时间:', startTime, '结束时间:', endTime);
        return '未知时间';
      }
    },
    goToHome() {
      uni.switchTab({
        url: '/riderEnd/index'
      })
    },
    goToAuth() {
      this.showAuthModal = false;
      // 跳转到认证页面
      uni.navigateTo({
        url: '/riderEnd/verify'
      });
    },
    handleConfirmOrder() {
      this.showConfirmModal = false;
      this.acceptOrder();
    },
    async acceptOrder() {
      try {
        const signStr = `service_member_id=${this.riderUserInfo.id}&phone_number=${this.riderUserInfo.phone}`
        const sign = md5(signStr)

        const res = await this.$request('task/accept', {
          task_id: this.taskId,
          service_provider_id: this.riderUserInfo.provider_id,
          service_member_id: this.riderUserInfo.id,
          sign: sign
        }, 'POST')

        if (res.code === 200) {
          this.isAccepted = true
          this.getDetailInfo()
          uni.showToast({
            title: '接单成功',
            icon: 'success'
          })
          // 跳转到订单详情页
          setTimeout(() => {
            uni.redirectTo({
              url: `/riderEnd/order-info?id=${this.taskId}`
            });
          }, 1500);
        } else if (res.code === 500) {
          // 显示认证提示弹窗
          this.showAuthModal = true;
        } else {
          uni.showToast({
            title: res.message || '接单失败',
            icon: 'none'
          })
        }
      } catch (err) {
        console.error('接单失败:', err)
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      }
    },
    async getDetailInfo() {
      if (!this.taskId || !this.riderUserInfo || !this.riderUserInfo.id || !this.riderUserInfo.phone) {
        console.error('获取详细信息失败: 缺少必要参数', {
          taskId: this.taskId,
          riderUserInfo: this.riderUserInfo ? '存在' : '不存在'
        });
        return;
      }

      try {
        const signStr = `service_member_id=${this.riderUserInfo.id}&phone_number=${this.riderUserInfo.phone}`;
        const sign = md5(signStr);

        const res = await this.$request('task/detail', {
          task_id: String(this.taskId), // 确保task_id是字符串类型
          service_member_id: this.riderUserInfo.id,
          sign: sign
        }, 'POST');

        if (res.code === 200 && res.data) {
          const detail = res.data || {};

          // 安全地处理价格详情
          let priceDetails = [];
          try {
            priceDetails = Array.isArray(detail.price_details) ? detail.price_details : [];
          } catch (err) {
            console.error('处理价格详情出错:', err);
          }

          this.detailInfo = {
            shopName: detail.shop_name || '',
            detailAddress: detail.detail_address || '',
            priceDetails: priceDetails,
            snCode: detail.sn_code || '',
            macCode: detail.mac_code || '',
            shopImage: detail.shop_image || ''
          };
        } else {
          console.warn('获取详细信息接口返回非成功状态:', res.code, res.message);
        }
      } catch (err) {
        console.error('获取详细信息失败:', err);
        // 不显示错误提示，避免影响用户体验
      }
    },
    getDisplayAmount(amount) {
      if (!this.riderUserInfo || !this.riderUserInfo.rate) return `¥${amount}`;
      let num = 0;
      if (typeof amount === 'string') {
        num = parseFloat(amount.replace('¥', ''));
      } else {
        num = Number(amount);
      }
      const rate = Number(this.riderUserInfo.rate);
      const realAmount = num * rate;
      return `¥${realAmount.toFixed(2)}`;
    },
    // 格式化地址显示
    formatAddress(address, isRecentTask) {
      if (!address) return '';

      // 根据订单类型隐藏不同数量的字符
      const charsToHide = isRecentTask ? 4 : 6;

      if (address.length > charsToHide) {
        return address.slice(0, -charsToHide) + '...';
      } else {
        // 如果地址长度小于或等于要隐藏的字符数，则显示全部地址
        return address;
      }
    },
    // 获取服务图标文字（只显示第一个字符）
    getServiceIconText(serviceType) {
      switch (serviceType) {
        case 'bubao':
          return '补';
        case 'offline_abnormal':
          return '离';
        case 'income_abnormal':
          return '收';
        case 'other_abnormal':
          return '其';
        default:
          // 对于未知类型，如果有mainService，取第一个字符
          if (this.orderInfo.mainService) {
            return this.orderInfo.mainService.charAt(0);
          }
          return '异';
      }
    },
    // 计算两点之间的距离
    calculateDistance(lat1, lon1, lat2, lon2) {
      // 实现距离计算逻辑
    }
  }
}
</script>

<style lang="scss" scoped>
.order-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  position: relative;
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
  background-color: #2492F2;
}

.order-card {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;
  position: relative;
  overflow: hidden;

  // 完结订单样式
  &.completed-order {
    opacity: 0.6;

    .order-header,
    .order-info-list,
    .order-total {
      position: relative;
      z-index: 1;
    }
  }

  // 进行中订单样式
  &.assigned-order {
    opacity: 0.7;

    .order-header,
    .order-info-list,
    .order-total {
      position: relative;
      z-index: 1;
    }
  }

  // 完结订单盖章图片样式
  .completed-stamp-image {
	  transform: rotate(60deg);
    position: absolute;
    top: 30rpx;
    right: 40rpx;
    width: 280rpx;
    height: 280rpx;
    z-index: 10;
    pointer-events: none;
    filter: brightness(0) saturate(100%) invert(27%) sepia(99%) saturate(1234%) hue-rotate(201deg) brightness(96%) contrast(95%);
  }

  // 进行中订单盖章图片样式
  .assigned-stamp-image {
    transform: rotate(60deg);
    position: absolute;
    top: 30rpx;
    right: 40rpx;
    width: 280rpx;
    height: 280rpx;
    z-index: 10;
    pointer-events: none;
    filter: brightness(0) saturate(100%) invert(27%) sepia(99%) saturate(1234%) hue-rotate(201deg) brightness(96%) contrast(95%);
  }

  .order-header {
    display: flex;
    align-items: stretch;
    margin-bottom: 30rpx;

    .order-icon {
      width: 100rpx;
      height: 110rpx;
      background-color: #2492F2;
      border-radius: 10rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
      flex-shrink: 0;

      text {
        font-size: 44rpx;
        color: #fff;
        font-weight: bold;
      }
    }

    .order-address-align {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
    }
    .order-number-align {
      align-self: flex-start;
      font-size: 26rpx;
      color: #666;
        font-weight: 500;
      margin-bottom: 18rpx;
      }
    .order-time-align {
        font-size: 24rpx;
      color: #666;
    }
  }

  .order-info-list {
    .info-item {
      display: flex;
      margin-bottom: 20rpx;
      font-size: 28rpx;
      line-height: 1.5;

      .label {
        color: #666;
        min-width: 140rpx;
      }

      .value {
        flex: 1;
        color: #333;

        &.highlight {
          color: #2492F2;
        }

        .quantity-highlight {
          color: #2492F2;
          font-weight: 500;
        }
      }


    }
  }

  .order-total {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 30rpx;
    font-size: 28rpx;

    .price {
      color: #FF6B00;
      font-size: 36rpx;
      font-weight: 500;
      margin-left: 10rpx;
    }
  }
}

.more-info-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;

  .notice-icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 10rpx;
  }

  text {
    font-size: 24rpx;
    color: #999;
  }
}

.completed-info-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;

  .notice-icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 10rpx;
  }

  text {
    font-size: 24rpx;
    color: #666;
  }
}

.assigned-info-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;

  .notice-icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 10rpx;
  }

  text {
    font-size: 24rpx;
    color: #FFA500;
  }
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .home-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 30rpx;

    image {
      width: 44rpx;
      height: 44rpx;
      margin-bottom: 6rpx;
    }

    text {
      font-size: 22rpx;
      color: #666;
    }
  }

  .confirm-btn {
    flex: 1;
    height: 80rpx;
    background-color: #2492F2;
    border-radius: 40rpx;
    color: #fff;
    font-size: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
  }

  .completed-btn {
    flex: 1;
    height: 80rpx;
    background-color: #ccc;
    border-radius: 40rpx;
    color: #666;
    font-size: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
  }

  .assigned-btn {
    flex: 1;
    height: 80rpx;
    background-color: #FFA500;
    border-radius: 40rpx;
    color: #fff;
    font-size: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
  }
}

.agreement-check {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(100rpx + constant(safe-area-inset-bottom));
  bottom: calc(100rpx + env(safe-area-inset-bottom));
  padding: 20rpx 0;
  background-color: #fff;
  display: flex;
  justify-content: center;
  font-size: 24rpx;
  color: #666;

  checkbox {
    transform: scale(0.7);
    margin-right: 4rpx;
  }

  .link {
    color: #2492F2;
  }
}

// 添加加载状态样式
.loading-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid #f3f3f3;
    border-top: 4rpx solid #2492F2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20rpx;
  }

  .loading-text {
    font-size: 28rpx;
    color: #999;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.detail-info {
  margin: 20rpx;

  .info-section {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 20rpx;
      border-left: 8rpx solid #2492F2;
      padding-left: 20rpx;
    }

    .info-item {
      display: flex;
      margin-bottom: 16rpx;
      font-size: 28rpx;
      line-height: 1.5;

      .label {
        color: #666;
        min-width: 140rpx;
      }

      .value {
        flex: 1;
        color: #333;
      }
    }
  }

  .price-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
    font-size: 28rpx;

    .label {
      color: #666;
    }

    .value {
      color: #FF6B00;
      font-weight: 500;
    }
  }

  .shop-image {
    width: 100%;
    border-radius: 8rpx;
  }
}

.service-time {
  display: none;
}
</style>