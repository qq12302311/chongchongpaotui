<template>
  <view class="my-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="个人中心" title-align="center" :showBackButton="false"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 用户信息区域 -->
    <view class="user-info" @click="navigateToUserInfo">
      <view class="avatar-container">
        <image class="avatar" :src="isLoggedIn ? 'https://ccpt.qiniu.0871.cn/my/avatar.png' : 'https://ccpt.qiniu.0871.cn/my/avatar.png'" mode="aspectFill"></image>
        <!-- 认证状态徽章 -->
        <template v-if="isLoggedIn">
          <view v-if="userInfo.submit_certification === '已通过'" class="verify-badge passed no-bg">
            <image src="https://ccpt.qiniu.0871.cn/rider/verify/yirenzheng.png" class="cert-icon large" mode="aspectFit" />
          </view>
          <view v-else-if="userInfo.submit_certification === '待审核'" class="verify-badge pending">待审核</view>
          <view v-else-if="userInfo.submit_certification === '已拒绝'" class="verify-badge rejected">已拒绝</view>
          <view v-else class="verify-badge">未认证</view>
        </template>
      </view>
      <view class="user-details">
        <view class="user-name" v-if="isLoggedIn">{{ userInfo.name }}<span class="user-id">（充充骑手ID: {{ formattedRiderId }}）</span></view>
        <view class="user-name" v-else>点击登录</view>
        <!-- <view class="user-id" v-if="isLoggedIn">充充骑手ID: {{ userInfo.id }}</view> -->
        <view class="user-phone" v-if="isLoggedIn">{{ userInfo.phone }}</view>
        <view class="user-zone" v-if="isLoggedIn && hasServiceZones">已配置接单城市: {{ formattedServiceZones }}</view>
      </view>
      <view class="arrow-right">
        <image src="https://ccpt.qiniu.0871.cn/rider/xiangyou.png" mode="aspectFit"></image>
      </view>
    </view>

    <!-- 账户信息卡片 -->
    <view class="account-card">
      <view class="account-item-wrapper">
        <view class="account-item" @click="navigateToAccount">
          <view class="account-title">我的账户</view>
          <view class="account-value">{{userInfo.balance}}</view>
          <view class="account-detail">今日佣金: {{ userInfo.today_commission || 0 }}</view>
          <view class="account-detail">本月佣金: {{ userInfo.month_commission || 0 }}</view>
        </view>
        <view class="divider"></view>
        <view class="account-item">
          <view class="account-title">接单统计</view>
          <view class="account-value">0</view>
          <view class="account-detail">今日完单: {{ userInfo.today_completed_tasks_count || 0 }}</view>
          <view class="account-detail">本月完单: {{ userInfo.month_completed_tasks_count || 0 }}</view>
        </view>
      </view>
    </view>

    <!-- 功能菜单列表 -->
    <view class="menu-list">
      <!-- <view class="menu-item deposit-item" @click="navigateTo('/pages/deposit/index')">
        <image :src="userInfo.depositPaid ? 'https://ccpt.qiniu.0871.cn/rider/bzj-yj.png' : 'https://ccpt.qiniu.0871.cn/rider/bzj-wj.png'" mode="aspectFill" class="deposit-bg"></image>
        <view class="deposit-content">
          <text class="deposit-title">保证金账户</text>
          <text class="deposit-status" v-if="!userInfo.depositPaid">未缴纳</text>
          <text class="deposit-status paid" v-else>已缴纳</text>
        </view>
      </view> -->

      <view class="menu-item" @click="navigateTo('/riderEnd/manual')">
        <view class="menu-icon blue-light">
          <text class="emoji-icon">📖</text>
        </view>
        <view class="menu-content">
          <text>接单手册</text>
        </view>
        <view class="menu-right">
          <image src="https://ccpt.qiniu.0871.cn/rider/xiangyou.png" mode="aspectFit" class="arrow-icon"></image>
        </view>
      </view>

      <view class="menu-item" @click="navigateTo('/riderEnd/verify')">
        <view class="menu-icon orange">
          <image src="https://ccpt.qiniu.0871.cn/rider/renzheng.png" mode="aspectFit"></image>
        </view>
        <view class="menu-content">
          <text>骑手认证</text>
        </view>
        <view class="menu-right">
          <image src="https://ccpt.qiniu.0871.cn/rider/xiangyou.png" mode="aspectFit" class="arrow-icon"></image>
        </view>
      </view>

      <view class="menu-item" @click="navigateTo('/riderEnd/settings')">
        <view class="menu-icon blue-light">
          <image src="https://ccpt.qiniu.0871.cn/rider/shezhi.png" mode="aspectFit"></image>
        </view>
        <view class="menu-content">
          <text>骑手设置</text>
        </view>
        <view class="menu-right">
          <image src="https://ccpt.qiniu.0871.cn/rider/xiangyou.png" mode="aspectFit" class="arrow-icon"></image>
        </view>
      </view>

      <!-- 服务商合同签署按钮 -->
      <view v-if="userInfo.level>=5" class="menu-item" @click="navigateTo('/riderEnd/contract')">
        <view class="menu-icon orange">
          <text class="emoji-icon">📄</text>
        </view>
        <view class="menu-content switch-role">
          <!-- <text>服务商合同签署</text> -->
		<view class="role-row">
		  <text class="role-title">服务站签署</text>
		  <text class="subtitle" style="color: #FF6B00;">全国限推100城（市区/县）</text>
		</view>
        </view>
        <view class="menu-right">
          <image src="https://ccpt.qiniu.0871.cn/rider/xiangyou.png" mode="aspectFit" class="arrow-icon"></image>
        </view>
      </view>

      <!-- 切换角色按钮 -->
      <!-- <view class="menu-item" @click="switchToCustomer">
        <view class="menu-icon blue-light">
          <image src="https://ccpt.qiniu.0871.cn/my/avatar.png" mode="aspectFit"></image>
        </view>
        <view class="menu-content switch-role">
          <view class="role-row">
            <text class="role-title">您当前是接单骑手</text>
            <text class="subtitle" style="color: #2A99F3;">切换角色</text>
          </view>
        </view>
        <view class="menu-right">
          <image src="https://ccpt.qiniu.0871.cn/rider/xiangyou.png" mode="aspectFit" class="arrow-icon"></image>
        </view>
      </view> -->

      <!-- 分享推荐按钮 -->
      <view class="menu-item" @click="sharePromotion" v-if="isLoggedIn">
        <view class="menu-icon green">
          <image src="https://ccpt.qiniu.0871.cn/rider/banner4.png" mode="aspectFit"></image>
        </view>
        <view class="menu-content">
          <text>分享推荐</text>
        </view>
        <view class="menu-right">
          <view class="reward-info">
            <text class="reward-text">💰 推荐新骑手返点奖拿100天</text>
          </view>
          <image src="https://ccpt.qiniu.0871.cn/rider/xiangyou.png" mode="aspectFit" class="arrow-icon"></image>
        </view>
      </view>

      <!-- 运维端入口按钮 (仅管理员可见) -->
      <view class="menu-item" @click="goToAdmin" v-if="isLoggedIn && isAdmin">
        <view class="menu-icon purple">
          <image src="https://ccpt.qiniu.0871.cn/rider/shezhi.png" mode="aspectFit"></image>
        </view>
        <view class="menu-content">
          <text>运维管理</text>
        </view>
        <view class="menu-right">
          <image src="https://ccpt.qiniu.0871.cn/rider/xiangyou.png" mode="aspectFit" class="arrow-icon"></image>
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-btn" @click="handleLogout" v-if="isLoggedIn">
      <text>退出登录</text>
    </view>

    <!-- 切换至客户角色 -->
    <view class="switch-role-btn" @click="switchToCustomer" v-if="isLoggedIn">
      <text class="switch-role-text">切换至客户角色></text>
    </view>

    <!-- 分享弹窗 -->
    <view class="share-modal" v-if="showShareModal" @click="showShareModal = false">
      <view class="share-content" @click.stop>
        <view class="share-title">推荐分享管理</view>
        <view class="share-options">
          <view class="share-btn wechat-btn">
            <button class="share-button" open-type="share">
              <image class="share-icon" src="https://ccpt.qiniu.0871.cn/qishou.png" mode="aspectFit"></image>
              <text>分享给好友</text>
            </button>
          </view>
          <view class="share-btn referral-btn" @click="goToReferralList">
            <image class="share-icon" src="https://ccpt.qiniu.0871.cn/rider/banner4.png" mode="aspectFit"></image>
            <text>推荐人员列表</text>
          </view>
        </view>
        <view class="reward-description">
          <text>！您可获得被推荐骑手订单额2.5%奖金，连续100天</text>
        </view>
        <view class="share-cancel" @click="showShareModal = false">取消</view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <tab-bar activeTab="my"></tab-bar>

    <!-- 悬浮小图 -->
    <floating-image
      @click="handleFloatingClick"
      :custom-click="handleFloatingClick"
      target-url=""
      :auto-open-share="false"
    ></floating-image>

    <!-- 悬浮聊天图标 -->
    <floating-chat-icon></floating-chat-icon>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import TabBar from '@/components/rider/tab-bar/index.vue'
import FloatingImage from '@/components/FloatingImage/index.vue'
import FloatingChatIcon from '@/components/FloatingChatIcon/index.vue'
import md5 from 'md5'

export default {
  components: {
    NavBar,
    TabBar,
    FloatingImage,
    FloatingChatIcon
  },
  data() {
    return {
      isLoggedIn: false,
      isAdmin: false, // 是否为管理员
      userInfo: {
        name: '',
        id: '',
        phone: '',
        verified: false,
        depositPaid: false,
        zone: null // 服务区域信息
      },
      accountInfo: {
        balance: 0.00,
        todayCommission: 0.00,
        monthCommission: 0.00,
        orderCount: 0,
        todayOrders: 0,
        monthOrders: 0
      },
      showShareModal: false // 分享弹窗显示状态
    }
  },
  computed: {
    // 格式化骑手ID显示
    formattedRiderId() {
      if (!this.userInfo.id) {
        return '';
      }

      // 生成随机数字：2或5
      const randomSuffix = Math.random() < 0.5 ? '2' : '5';

      // 返回格式：ccqs + 真实ID + 随机数字
      return `ccqs${this.userInfo.id}${randomSuffix}`;
    },

    // 判断是否有服务区域
    hasServiceZones() {
      return this.userInfo && this.userInfo.zone &&
        (Array.isArray(this.userInfo.zone) ? this.userInfo.zone.length > 0 : true);
    },
    // 格式化服务区域显示
    formattedServiceZones() {
      if (!this.userInfo || !this.userInfo.zone) return '';

      try {
        // 根据截图，zone是一个数组，数组中的每个元素就是区域名称
        if (Array.isArray(this.userInfo.zone)) {
          // 获取前3个区域
          const maxDisplay = 3;
          const displayZones = this.userInfo.zone.slice(0, maxDisplay);

          // 将区域名称拼接起来
          let zoneText = displayZones.join('、');

          // 如果还有更多区域，添加省略号
          if (this.userInfo.zone.length > maxDisplay) {
            zoneText += '...';
          }

          // 不再需要额外截断，因为我们已经限制了显示的区域数量
          // 并且在超过3个区域时添加了省略号

          return zoneText;
        }
        // 如果不是数组，尝试转换为字符串
        else {
          const zoneText = String(this.userInfo.zone);

          // 如果文本过长，截断并添加省略号
          if (zoneText.length > 15) {
            return zoneText.substring(0, 15) + '...';
          }

          return zoneText;
        }
      } catch (e) {
        console.error('格式化服务区域出错:', e);
        return '无!请联系运营经理';
      }
    }
  },
  onLoad() {
    // 监听打开分享推荐弹窗事件
    uni.$on('openRiderShareModal', this.handleOpenRiderShareModal);
  },

  onShow() {
    // 每次显示页面时检查登录状态并获取最新信息
    this.checkLoginStatus();
  },

  onUnload() {
    // 页面卸载时移除事件监听
    uni.$off('openRiderShareModal', this.handleOpenRiderShareModal);
  },
  // 小程序分享功能
  onShareAppMessage() {
    if (!this.userInfo.id) {
      return {
        title: '充充跑腿骑手端',
        path: '/riderEnd/register'
      };
    }

    return {
      title: '邀请您加入充充跑腿骑手',
      path: `/riderEnd/register?referrerId=${this.userInfo.id}`,
      imageUrl: 'https://ccpt.qiniu.0871.cn/qishou.png' // 分享给好友的图标
    };
  },
  // 分享到朋友圈
  onShareTimeline() {
    if (!this.userInfo.id) {
      return {
        title: '充充跑腿骑手端',
        query: ''
      };
    }

    return {
      title: '邀请您加入充充跑腿骑手',
      query: `referrerId=${this.userInfo.id}`,
      imageUrl: 'https://ccpt.qiniu.0871.cn/qishou.png' // 分享到朋友圈的图标
    };
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const storedUserInfo = uni.getStorageSync('riderUserInfo');

      if (storedUserInfo) {
        this.isLoggedIn = true;
        this.userInfo = storedUserInfo;

        // 判断是否为管理员（用户等级 level 为 9 或 10 的为管理员）
        // 这里假设用户信息中有 level 字段，如果没有可以根据实际情况调整
        if (storedUserInfo.level && (storedUserInfo.level == 9 || storedUserInfo.level == 5)) {
          this.isAdmin = true;
        } else {
          this.isAdmin = false;
        }

        // 如果已登录，查询最新的用户信息
        this.fetchUserInfo();
      } else {
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.userInfo = {
          name: '',
          id: '',
          phone: '',
          verified: false,
          depositPaid: false
        };
      }
    },

    // 查询用户信息接口
    async fetchUserInfo() {
      try {
        const riderUserInfo = uni.getStorageSync('riderUserInfo');
        if (!riderUserInfo || !riderUserInfo.id || !riderUserInfo.phone) {
          console.error('获取用户信息失败: 缺少必要参数');
          return;
        }

        // 构建签名
        const signStr = `service_member_id=${riderUserInfo.id}&phone_number=${riderUserInfo.phone}`;
        const sign = md5(signStr);

        // 构建请求参数
        const params = {
          service_member_id: riderUserInfo.id,
          sign: sign,
          member_id: riderUserInfo.id
        };

        console.log('查询用户信息参数:', params);

        // 调用接口
        const res = await this.$request('service/member/info', params, 'POST');

        console.log('用户信息接口响应:', res);

        if (res.status === 'success' && res.data) {
          // 更新本地存储的用户信息
          const updatedUserInfo = {
            ...riderUserInfo,
            balance: res.data.balance || 0,
            month_commission: res.data.month_commission || 0,
            month_completed_tasks_count: res.data.month_completed_tasks_count || 0,
            today_commission: res.data.today_commission || 0,
            today_completed_tasks_count: res.data.today_completed_tasks_count || 0,
            rate: res.data.rate || 1,
            zone: res.data.zone || null,
			latest_certification: res.data.latest_certification || null,
			submit_certification: res.data.submit_certification || '待审核'
          };

          // 保存到本地存储
          uni.setStorageSync('riderUserInfo', updatedUserInfo);

          // 更新页面显示的用户信息
          this.userInfo = updatedUserInfo;

          console.log('用户信息已更新:', updatedUserInfo);
        } else {
          console.warn('获取用户信息失败:', res.msg || res.message || '未知错误');
        }
      } catch (error) {
        console.error('查询用户信息失败:', error);
        // 不显示错误提示，避免影响用户体验
      }
    },

    // 跳转到用户信息页面或登录页面
    navigateToUserInfo() {
      if (this.isLoggedIn) {
        uni.navigateTo({
          url: '/riderEnd/user-info'
        });
      } else {
        uni.navigateTo({
          url: '/riderEnd/login'
        });
      }
    },

    navigateTo(url) {
      uni.navigateTo({
        url: url
      })
    },

    // 跳转到我的账户页面
    navigateToAccount() {
      if (!this.isLoggedIn) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      uni.navigateTo({
        url: '/riderEnd/account'
      });
    },

    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除登录信息
            uni.removeStorageSync('riderUserInfo');

            // 提示用户
            uni.showToast({
              title: '已退出登录',
              icon: 'none'
            });

            // 跳转到骑手端登录页
            setTimeout(() => {
              uni.reLaunch({
                url: '/riderEnd/login'
              });
            }, 1000);
          }
        }
      });
    },

    switchToCustomer() {
      uni.reLaunch({
        url: '/pages/launcher/index'
      })
    },

    // 分享推荐分享
    sharePromotion() {
      if (!this.userInfo.id) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      // 显示分享选项弹窗
      this.showShareModal = true;
    },

    // 处理打开骑手端分享推荐弹窗事件
    handleOpenRiderShareModal() {
      console.log('收到打开骑手端分享推荐弹窗事件');
      // 延迟一下确保页面完全加载
      setTimeout(() => {
        this.sharePromotion();
      }, 100);
    },

    // 复制推荐链接
    copyPromotionLink() {
      const promotionLink = `充充跑腿骑手注册，推荐人ID：${this.userInfo.id}`;
      uni.setClipboardData({
        data: promotionLink,
        success: () => {
          uni.showToast({
            title: '推荐链接已复制',
            icon: 'success'
          });
          this.showShareModal = false; // 关闭弹窗
        }
      });
    },

    // 跳转到推荐人员列表
    goToReferralList() {
      this.showShareModal = false; // 关闭弹窗
      uni.navigateTo({
        url: '/riderEnd/referral-list'
      });
    },

    // 跳转到运维端
    goToAdmin() {
      uni.navigateTo({
        url: '/adminEnd/index'
      })
    },

    // 处理悬浮小图点击事件
    handleFloatingClick() {
      console.log('点击悬浮小图2');
      if (this.isLoggedIn === false) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        uni.navigateTo({
          url: '/riderEnd/login'
        });
        return;
      }
      // 直接弹出推荐分享管理弹窗
      this.showShareModal = true;
    }
  }
}
</script>

<style lang="scss" scoped>
.my-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: calc(100rpx + constant(safe-area-inset-bottom));
  /* iOS < 11.2 */
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
  /* iOS >= 11.2 */
  box-sizing: border-box;
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
}

.user-info {
  background-color: #fff;
  border-radius: 0;
  padding: 30rpx 30rpx;
  display: flex;
  align-items: center;
  position: relative;
  border-bottom: 1rpx solid #f5f5f5;

  .avatar-container {
    position: relative;
    margin-right: 30rpx;

    .avatar {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50rpx;
      background-color: #f0f0f0;
    }

    .verify-badge {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(153, 153, 153, 0.7);
      color: #fff;
      font-size: 20rpx;
      text-align: center;
      padding: 2rpx 0;
      border-bottom-left-radius: 50rpx;
      border-bottom-right-radius: 50rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      .cert-icon {
        width: 28rpx;
        height: 28rpx;
        margin-right: 6rpx;
      }
      &.passed {
        background-color: #2ed573;
        color: #fff;
      }
      &.pending {
        background-color: #f39c12;
        color: #fff;
      }
      &.rejected {
        background-color: #ff4757;
        color: #fff;
      }
      &.passed.no-bg {
        background: none;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        padding: 0;
        justify-content: flex-start;
        .cert-icon.large {
          width: 130rpx;
        height: 40rpx;
          margin: 0 auto;
        }
      }
    }
  }

  .user-details {
    flex: 1;

    .user-name {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 10rpx;
    }

    .user-id, .user-phone {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 6rpx;
    }

    .user-zone {
      font-size: 24rpx;
      color: #2492F2; /* 改为主题色 */
      margin-bottom: 6rpx;
      background-color: rgba(36, 146, 242, 0.1); /* 添加浅蓝色背景 */
      padding: 8rpx 12rpx; /* 添加内边距 */
      border-radius: 6rpx; /* 添加圆角 */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 480rpx; /* 增加宽度以显示完整的第三个城市 */
      display: inline-block; /* 确保背景色只包围文字 */
    }
  }

  .arrow-right {
    width: 40rpx;

    image {
      width: 32rpx;
      height: 32rpx;
    }
  }
}

.account-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 0rpx 20rpx 0 20rpx;

  .account-item-wrapper {
    background-color: #2492F2;
    border-radius: 12rpx;
    display: flex;
    overflow: hidden;

    .account-item {
      flex: 1;
      padding: 30rpx;
      color: #fff;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .account-title {
        font-size: 28rpx;
        margin-bottom: 10rpx;
      }

      .account-value {
        font-size: 48rpx;
        font-weight: bold;
        margin-bottom: 20rpx;
      }

      .account-detail {
        font-size: 24rpx;
        opacity: 0.8;
        margin-bottom: 6rpx;
      }
    }

    .divider {
      width: 2rpx;
      background-color: rgba(255, 255, 255, 0.3);
      margin: 30rpx 0;
    }
  }
}

.menu-list {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;

  .menu-item {
    background-color: #fff;
    border-radius: 12rpx;
    margin-bottom: 2rpx;
    overflow: hidden;

    &.deposit-item {
      height: 160rpx;
      position: relative;
      background-color: transparent;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;

      .deposit-bg {
        width: 100%;
        height: 100%;
      }
    }

    &:not(.deposit-item) {
      &:first-of-type {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }

      display: flex;
      align-items: center;
      padding: 24rpx 20rpx;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .menu-icon {
        width: 60rpx;
        height: 60rpx;
        border-radius: 30rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;

        &.blue-light {
          background-color: rgba(36, 146, 242, 0.1);
        }

        &.orange {
          background-color: rgba(255, 153, 0, 0.1);
        }

        &.gray {
          background-color: rgba(153, 153, 153, 0.1);
        }

        &.purple {
          background-color: rgba(155, 89, 182, 0.1);
        }

        &.green {
          background-color: rgba(46, 213, 115, 0.1);
        }

        image {
          width: 30rpx;
          height: 30rpx;
        }

        .emoji-icon {
          font-size: 30rpx;
          line-height: 1;
        }
      }

      .menu-content {
        flex: 1;
        display: flex;
        flex-direction: column;

        text {
          font-size: 28rpx;
          color: #333;
        }

        .subtitle {
          font-size: 24rpx;
          color: #FF6B00;
          // margin-top: 4rpx;
        }
      }

      .menu-right {
        display: flex;
        align-items: center;

        .reward-info {
          display: flex;
          align-items: center;
		  margin-right: 10rpx;

          .money-icon {
            width: 24rpx;
            height: 24rpx;
            margin-right: 6rpx;
          }

          .reward-text {
            font-size: 22rpx;
            color: #FF6B00;
            font-weight: 500;
          }
        }

        .arrow-icon {
          width: 28rpx;
          height: 28rpx;
        }
      }
    }
  }
}

.logout-btn {
  margin: 40rpx 20rpx;
  height: 90rpx;
  background-color: #fff;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #333;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.role-switch-section {
  margin: 40rpx 20rpx;
  text-align: center;

  .role-text {
    display: block;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 20rpx;
  }
}

.switch-role-btn {
  margin: 30rpx 20rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .switch-role-text {
    font-size: 32rpx;
    color: #2492F2;
    font-weight: 500;
    text-shadow: 0 2rpx 8rpx rgba(36, 146, 242, 0.3);
    letter-spacing: 2rpx;
  }

  // 点击效果
  &:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}

.switch-role {
  .role-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .role-title {
      font-size: 28rpx;
      color: #333;
    }

    .subtitle {
      font-size: 24rpx;
    }
  }
}

/* 分享弹窗样式 */
.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;

  .share-content {
    background-color: #fff;
    border-top-left-radius: 24rpx;
    border-top-right-radius: 24rpx;
    width: 100%;
    padding: 40rpx 30rpx;
    padding-bottom: calc(40rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(40rpx + env(safe-area-inset-bottom));

    .share-title {
      text-align: center;
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 40rpx;
    }

    .share-options {
      display: flex;
      justify-content: center;
      gap: 40rpx;
      margin-bottom: 40rpx;

      .share-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20rpx 16rpx;
        border-radius: 16rpx;
        background-color: transparent;
        border: 1rpx solid transparent;
        font-size: 28rpx;
        color: #333;
        min-width: 120rpx;
        box-sizing: border-box;
        transition: all 0.3s ease;

        // 重置按钮默认样式
        &::after {
          border: none;
          background: none;
        }

        // 确保button和view样式一致
        &[class*="button"] {
          background: transparent;
          border: 1rpx solid transparent;
          outline: none;

          &:focus {
            outline: none;
          }
        }

        &:active {
          transform: scale(0.95);
        }

        &.wechat-btn {
          background-color: rgba(46, 213, 115, 0.1);
          border-color: rgba(46, 213, 115, 0.2);

          &:active {
            background-color: rgba(46, 213, 115, 0.2);
          }

          text {
            color: #2ed573;
          }
        }

        &.copy-btn {
          background-color: rgba(36, 146, 242, 0.1);
          border-color: rgba(36, 146, 242, 0.2);

          &:active {
            background-color: rgba(36, 146, 242, 0.2);
          }

          text {
            color: #2492F2;
          }
        }

        &.referral-btn {
          background-color: rgba(255, 193, 7, 0.1);
          border-color: rgba(255, 193, 7, 0.2);

          &:active {
            background-color: rgba(255, 193, 7, 0.2);
          }

          text {
            color: #e6a23c;
          }
        }

        .share-icon {
          width: 48rpx;
          height: 48rpx;
          margin-bottom: 12rpx;
          border-radius: 8rpx;
        }

        text {
          font-size: 24rpx;
          font-weight: 500;
          text-align: center;
          line-height: 1.2;
        }

        // 内部按钮样式
        .share-button {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          padding: 0;
          margin: 0;
          font-size: inherit;
          color: inherit;

          &::after {
            border: none;
            background: none;
          }

          &:focus {
            outline: none;
          }

          .share-icon {
            width: 48rpx;
            height: 48rpx;
            margin-bottom: 12rpx;
            border-radius: 8rpx;
          }

          text {
            font-size: 24rpx;
            font-weight: 500;
            text-align: center;
            line-height: 1.2;
          }
        }
      }
    }

    .reward-description {
      text-align: center;
      margin-bottom: 30rpx;
      padding: 0 20rpx;

      text {
        font-size: 26rpx;
        color: #e6a23c;
        line-height: 1.4;
        font-weight: 500;
      }
    }

    .share-cancel {
      text-align: center;
      padding: 24rpx;
      background-color: #f5f5f5;
      border-radius: 12rpx;
      color: #666;
      font-size: 28rpx;
    }
  }
}
</style>
