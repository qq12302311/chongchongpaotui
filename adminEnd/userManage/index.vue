<template>
  <view style="min-height: 100vh; background-color: #f8f9fa; display: flex; flex-direction: column; position: relative; width: 100%; overflow: hidden;">
    <!-- 顶部导航栏 -->
    <nav-bar title="用户管理" title-align="center"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view :style="{ height: navBarHeight + 'px', width: '100%', backgroundColor: '#2492F2', flexShrink: 0 }"></view>

    <!-- 固定的顶部区域 -->
    <view :style="{ position: 'fixed', top: navBarHeight + 'px', left: 0, right: 0, zIndex: 100, backgroundColor: '#f8f9fa', width: '100%' }">
      <!-- 搜索和筛选区域 -->
      <view style="background: #fff; padding: 16rpx; margin: 16rpx; box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05); border: 1rpx solid #f0f0f0; border-radius: 12rpx; max-height: 300rpx; overflow-y: auto;">
        <view style="display: flex; align-items: center; background: #f8f9fa; border-radius: 8rpx; padding: 0 12rpx; margin-bottom: 12rpx; border: 1rpx solid #eee; height: 70rpx;">
          <view style="width: 32rpx; height: 32rpx; display: flex; align-items: center; justify-content: center; margin-right: 8rpx;">
            <view style="width: 24rpx; height: 24rpx; border: 2rpx solid #999; border-radius: 50%; position: relative;"></view>
          </view>
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="输入用户ID、手机号搜索"
            style="flex: 1; height: 60rpx; font-size: 26rpx; padding: 0 16rpx; background: transparent; border: none; outline: none;"
            @confirm="searchUsers"
          />
          <view style="padding: 0 16rpx; height: 60rpx; line-height: 60rpx; color: #2492F2; font-size: 26rpx; position: relative;" @click="searchUsers">搜索</view>
        </view>

        <!-- 统计信息 -->
        <view style="display: flex; gap: 15rpx; margin-top: 0;" v-if="!loading">
          <view style="flex: 1; background: linear-gradient(135deg, #2492F2 0%, #1976D2 100%); border-radius: 16rpx; padding: 24rpx 16rpx; text-align: center; box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.3);">
            <text style="font-size: 36rpx; font-weight: 700; color: #fff; line-height: 1; margin-bottom: 8rpx; display: block;">{{ totalUsers }}</text>
            <text style="font-size: 22rpx; color: rgba(255, 255, 255, 0.9); display: block;">总用户数</text>
          </view>
          <view style="flex: 1; background: linear-gradient(135deg, #2492F2 0%, #1976D2 100%); border-radius: 16rpx; padding: 24rpx 16rpx; text-align: center; box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.3);">
            <text style="font-size: 36rpx; font-weight: 700; color: #fff; line-height: 1; margin-bottom: 8rpx; display: block;">{{ userList.length }}</text>
            <text style="font-size: 22rpx; color: rgba(255, 255, 255, 0.9); display: block;">当前显示</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 列表内容区域的占位元素 -->
    <view style="height: 360rpx; width: 100%; flex-shrink: 0;"></view>

    <!-- 批量操作栏 -->
    <view class="batch-actions">
      <view class="batch-left">
        <checkbox-group @change="toggleSelectAll">
          <checkbox :checked="isAllSelected" color="#2492F2" />
        </checkbox-group>
        <text class="batch-text">全选 ({{ selectedIds.length }})</text>
      </view>
      <picker
        style="flex: 1;"
        mode="selector" 
        :range="pickerOptions" 
        range-key="label"
        @change="onPickerOptionsChange"
        class="estimate-picker">
        <view style="margin-left: 8px;">{{pickerSelect.label || '请选择短信模版'}}</view>
      </picker>
      <view class="batch-right" v-if="selectedIds.length > 0">
        <!-- <view class="batch-btn reject" @click="batchReject">批量拒绝</view> -->
        <view class="batch-btn approve" @click="batchApprove">发送短信</view>
      </view>
    </view>
    <view style="height: 56px;"></view>

    <!-- 用户列表 -->
    <scroll-view
      style="flex: 1; padding: 0 20rpx; width: 100%; box-sizing: border-box; background-color: transparent;"
      scroll-y
      @scrolltolower="onScrollToLower"
      :bounces="false"
      lower-threshold="50"
    >
      <!-- 加载中提示 - 仅在第一页加载时显示 -->
      <view v-if="loading && currentPage === 1" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100rpx 0;">
        <view style="width: 60rpx; height: 60rpx; border: 4rpx solid #f1f3f4; border-top: 4rpx solid #2492F2; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20rpx;"></view>
        <text style="font-size: 24rpx; color: #666;">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="userList.length === 0" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100rpx 0;">
        <view style="width: 120rpx; height: 120rpx; background-color: #f5f5f5; border-radius: 50%; margin-bottom: 20rpx; opacity: 0.6;"></view>
        <text style="font-size: 28rpx; color: #999;">暂无相关用户</text>
      </view>

      <!-- 用户列表内容 -->
      <view v-else>
        <view
          style="background: #fff; border-radius: 16rpx; margin-bottom: 20rpx; overflow: hidden; box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08); border: 1rpx solid #f0f0f0; transition: all 0.3s ease;"
          v-for="(user, index) in userList"
          :key="index"
          @click="selectUser(user)"
        >
          <view style="display: flex; align-items: center; padding: 24rpx;">
            <view style="display: flex; flex-direction: column; align-items: center; margin-right: 24rpx;">
              <view style="width: 80rpx; height: 80rpx; margin-bottom: 12rpx;">
                <image v-if="user.avatar" :src="user.avatar" mode="aspectFill" style="width: 100%; height: 100%; border-radius: 40rpx; border: 2rpx solid #f0f0f0;"></image>
                <view v-else style="width: 100%; height: 100%; border-radius: 40rpx; background: linear-gradient(135deg, #2492F2 0%, #1976D2 100%); display: flex; align-items: center; justify-content: center; border: 2rpx solid #f0f0f0;">
                  <text style="font-size: 28rpx; color: #fff; font-weight: 600;">{{ user.username ? user.username.charAt(0).toUpperCase() : 'U' }}</text>
                </view>
              </view>

              <!-- 用户状态 - 放在头像下面 -->
              <view>
                <view style="display: flex; align-items: center; padding: 6rpx 12rpx; border-radius: 12rpx; font-size: 20rpx; font-weight: 500; background-color: #e8f5e8; color: #28a745;">
                  <view style="width: 12rpx; height: 12rpx; border-radius: 50%; margin-right: 6rpx; background-color: #28a745;"></view>
                  <text>{{ getStatusText(user.status) }}</text>
                </view>
              </view>
            </view>

            <view style="flex: 1;">
              <view style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rpx;">
                <view>
                  <text style="font-size: 30rpx; font-weight: 600; color: #333;">{{ user.username || '未设置姓名' }}</text>
                </view>
                <view class="checkbox-wrapper" @click.stop="toggleSelect(user.phone_number)">
                  <checkbox-group>
                    <checkbox :checked="selectedIds.includes(user.phone_number)" color="#2492F2" style="transform: scale(0.8);" />
                  </checkbox-group>
                </view>
                <view style="display: flex; align-items: center;">
                  <text style="font-size: 22rpx; color: #666; margin-right: 6rpx;">余额:</text>
                  <text style="font-size: 24rpx; font-weight: 600; color: #2492F2;">¥{{ user.balance || '0.00' }}</text>
                </view>
              </view>
              <view style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rpx;">
                <view style="display: flex; align-items: center;">
                  <text style="font-size: 22rpx; color: #666; margin-right: 6rpx;">电话：</text>
                  <text style="font-size: 24rpx; color: #333; margin-right: 8rpx;">{{ user.phone_number }}</text>
                  <view style="padding: 4rpx; border-radius: 4rpx; background-color: #f8f9fa; display: flex; align-items: center; justify-content: center;" @click.stop="copyText(user.phone_number, '手机号')">
                    <image src="https://ccpt.qiniu.0871.cn/adminEnd/copy.svg" style="width: 26rpx; height: 26rpx;"></image>
                  </view>
                </view>
              </view>
              <view style="display: flex; align-items: center; justify-content: space-between;">
                <view style="display: flex; align-items: center;">
                  <text style="font-size: 22rpx; color: #666; margin-right: 6rpx;">订单总数:</text>
                  <text style="font-size: 24rpx; font-weight: 600; color: #28a745;">{{ user.total_order_count || 0 }}单</text>
                </view>
                <view style="display: flex; align-items: center;">
                  <text style="font-size: 22rpx; color: #666; margin-right: 6rpx;">订单总金额:</text>
                  <text style="font-size: 24rpx; font-weight: 600; color: #ff6b35;">¥{{ user.total_order_amount || '0.00' }}</text>
                </view>
              </view>
            </view>
          </view>
          <view style="padding: 20rpx 24rpx; border-top: 1rpx solid #f1f3f4; background-color: #fafbfc;">
            <view style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rpx;">
              <view style="display: flex; align-items: center;">
                <text style="font-size: 22rpx; color: #666; margin-right: 8rpx;">注册:</text>
                <text style="font-size: 22rpx; color: #333; font-weight: 500;">{{ formatDate(user.registered_date) }}</text>
              </view>
              <view style="display: flex; align-items: center;">
                <text style="font-size: 22rpx; color: #666; margin-right: 8rpx;">ID:</text>
                <text style="font-size: 22rpx; color: #333; font-weight: 500;">{{ user.user_id }}</text>
              </view>
            </view>
          </view>
          <view style="display: flex; padding: 20rpx 24rpx; gap: 12rpx; border-top: 1rpx solid #f1f3f4; background-color: #fff;">
            <view style="flex: 1; height: 60rpx; border-radius: 30rpx; display: flex; align-items: center; justify-content: center; font-size: 22rpx; font-weight: 500; border: 1rpx solid #e9ecef; background-color: #2492F2; color: #fff; border-color: #2492F2;" @click.stop="viewUserOrders(user)">查看订单</view>
            <view style="flex: 1; height: 60rpx; border-radius: 30rpx; display: flex; align-items: center; justify-content: center; font-size: 22rpx; font-weight: 500; border: 1rpx solid #e9ecef; background-color: #2492F2; color: #fff; border-color: #2492F2;" @click.stop="editUser(user)">编辑信息</view>
            <view style="flex: 1; height: 60rpx; border-radius: 30rpx; display: flex; align-items: center; justify-content: center; font-size: 22rpx; font-weight: 500; border: 1rpx solid #e9ecef; background-color: #ff6b6b; color: #fff; border-color: #ff6b6b;" @click.stop="showStatusManageToast">状态管理</view>
          </view>
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view v-if="userList.length > 0 && loading && currentPage > 1" style="display: flex; align-items: center; justify-content: center; padding: 24rpx; color: #666; font-size: 24rpx;">
        <view style="width: 28rpx; height: 28rpx; border: 2rpx solid #f1f3f4; border-top: 2rpx solid #2492F2; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 12rpx;"></view>
        <text>加载中...</text>
      </view>
      <view v-else-if="userList.length > 0 && hasMore" style="background: #fff; border-radius: 12rpx; padding: 24rpx; text-align: center; margin: 15rpx 20rpx; border: 1rpx dashed #dee2e6; color: #2492F2; font-size: 26rpx;" @click="loadMoreUsers">
        <text>点击加载更多</text>
      </view>
      <view v-else-if="userList.length > 0 && !hasMore" style="text-align: center; padding: 24rpx; color: #999; font-size: 22rpx;">
        <text>没有更多数据了</text>
      </view>
    </scroll-view>



    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
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
      // 批量操作
      selectedIds: [],
      pickerOptions: [
        { value: 'SMS_500695083', label: '充充庆佳节' },
        { value: 'SMS_500460079', label: '充充大事记' },
        { value: 'SMS_500450106', label: '充充跑腿服务' }
      ],
      pickerSelect: {
        value: ''
      },
      navBarHeight: 0,
      searchKeyword: '',
      userList: [],
      userInfo: null,
      loading: false,
      searched: false,
      currentPage: 1,
      perPage: 15,
      hasMore: true,
      loadingMore: false,
      totalUsers: 0
    }
  },
   computed: {
    isAllSelected() {
  		const pendingList = this.userList;
  		return pendingList.length > 0 && this.selectedIds.length === pendingList.length;
  	}
  },
  onShow() {
    // 页面显示时自动加载用户列表
    console.log('用户管理页面已加载')
    this.loadInitialData()
  },
  onLoad() {
    // 计算导航栏高度
    const systemInfo = uni.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 0;
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48;
    this.navBarHeight = statusBarHeight + navBarHeight;

    // 调试信息
    console.log('用户管理页面样式调试信息:', {
      statusBarHeight,
      navBarHeight: this.navBarHeight,
      platform: systemInfo.platform,
      screenWidth: systemInfo.screenWidth,
      screenHeight: systemInfo.screenHeight
    });

    // 强制应用样式
    this.$nextTick(() => {
      console.log('页面DOM已渲染，检查样式是否生效');
    });
  },
  methods: {
    onPickerOptionsChange(e) {
	  	const index = e.detail.value;
	  	this.pickerSelect = this.pickerOptions[index];
	  },
	  // 切换单个选择
	  toggleSelect(id) {
	  	const index = this.selectedIds.indexOf(id);
	  	if (index > -1) {
	  		this.selectedIds.splice(index, 1);
	  	} else {
	  		this.selectedIds.push(id);
	  	}
	  },
	  // 切换全选
	  toggleSelectAll() {
		if (this.isAllSelected) {
			this.selectedIds = [];
		} else {
			this.selectedIds = this.userList.map(w => w.phone_number);
		}
	  },
	  // 批量同意
	  batchApprove() {
		  console.log('批量同意', this.pickerSelect);
		  if(this.pickerSelect.value == ''){
			uni.showToast({
				title: '请选择短信模版',
				icon: 'none'
			});
			return
		  }
		  
	  	uni.showModal({
	  		title: '确认操作',
	  		content: `确定要批量发送 ${this.selectedIds.length} 条短信吗？`,
	  		success: async (res) => {
	  			if (res.confirm) {
					for(let i in this.selectedIds) {
						console.log({
								phone: this.selectedIds[i],
								type: this.pickerSelect.value,
							})
						const res = await uni.request({
							url: `https://ccpt.0871.cn/api/sms`,
							method: 'POST',
							data: {
								phone: this.selectedIds[i],
								type: this.pickerSelect.value,
							},
							header: {
								'Content-Type': 'application/json'
							}
						})
					}
					
	  				// await this.processBatchWithdraw(this.selectedIds, 'approve');
	  			}
	  		}
	  	});
	  },
    // 初始化加载数据
    loadInitialData() {
      // 重置搜索状态
      this.searchKeyword = ''
      this.searched = false
      this.currentPage = 1
      this.userList = []
      this.userInfo = null
      this.totalUsers = 0
      this.hasMore = true

      // 加载用户列表
      this.getUserList()
    },

    // 搜索用户
    searchUsers() {
      if (!this.searchKeyword.trim()) {
        this.clearSearch()
      } else {
        // 有搜索关键词，执行搜索
        this.currentPage = 1
        this.userList = []
        this.totalUsers = 0
        this.hasMore = true
        this.userInfo = null // 清除详情面板
        this.getUserList(true)
      }
    },

    // 清除搜索
    clearSearch() {
      this.searchKeyword = ''
      this.searched = false
      this.currentPage = 1
      this.userList = []
      this.totalUsers = 0
      this.hasMore = true
      this.userInfo = null
      this.getUserList()
    },

    // 关闭详情面板
    closeDetail() {
      this.userInfo = null
    },

    // 格式化手机号
    formatPhone(phone) {
      if (!phone) return '未绑定手机'
      if (phone.length === 11) {
        return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
      }
      return phone
    },

    // 格式化日期（简短版本）
    formatDate(dateTime) {
      if (!dateTime) return '未知'
      try {
        const date = new Date(dateTime)
        const now = new Date()
        const diff = now - date
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) return '今天'
        if (days === 1) return '昨天'
        if (days < 30) return `${days}天前`
        if (days < 365) return `${Math.floor(days / 30)}个月前`
        return `${Math.floor(days / 365)}年前`
      } catch (err) {
        return '未知'
      }
    },

    // 获取用户列表
    async getUserList(isSearch = false) {
      if (isSearch) {
        this.loading = true
        this.searched = true
      } else if (this.currentPage === 1) {
        this.loading = true
      } else {
        this.loadingMore = true
      }

      try {
        // 生成时间戳
        const timestamp = Math.floor(Date.now() / 1000)

        const params = {
          per_page: this.perPage,
          page: this.currentPage,
          service_member_id: 1,
          timestamp: timestamp,
          sign: 'chongchong'
        }

        // 如果有搜索关键词，添加搜索参数
        if (this.searchKeyword.trim()) {
          params.search_term = this.searchKeyword.trim()
        }

        const res = await this.$request('service/user/list', params, 'POST')

        if (res.code === 200 && res.data) {
          const newUsers = res.data.data || []

          if (this.currentPage === 1) {
            this.userList = newUsers
          } else {
            this.userList = [...this.userList, ...newUsers]
          }

          // 设置总用户数
          this.totalUsers = res.data.total || 0

          // 检查是否还有更多数据，根据API返回的分页信息
          this.hasMore = res.data.current_page < res.data.last_page

          // 如果是搜索且有结果，显示第一个用户的详情
          if (isSearch && this.userList.length > 0) {
            this.userInfo = this.userList[0]
          } else if (isSearch && this.userList.length === 0) {
            this.userInfo = null
          }
        } else {
          if (isSearch) {
            this.userInfo = null
            this.userList = []
            this.totalUsers = 0
          }
          uni.showToast({
            title: res.message || '获取用户列表失败',
            icon: 'none'
          })
        }
      } catch (err) {
        console.error('获取用户列表失败:', err)
        if (isSearch) {
          this.userInfo = null
          this.userList = []
          this.totalUsers = 0
        }
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },

    // 滚动到底部触发
    onScrollToLower() {
      if (this.hasMore && !this.loading) {
        // 自动加载更多
        this.loadMoreUsers();
      }
    },

    // 加载更多用户
    loadMoreUsers() {
      if (this.hasMore && !this.loading) {
        this.currentPage++
        this.getUserList()
      }
    },

    // 选择用户查看详情
    selectUser(user) {
      // 可以在这里实现查看详情的逻辑
      console.log('查看用户详情:', user);
    },

    // 复制文本
    copyText(text, type) {
      if (!text) return;

      uni.setClipboardData({
        data: text,
        success: () => {
          uni.showToast({
            title: `${type}已复制`,
            icon: 'success'
          });
        },
        fail: () => {
          uni.showToast({
            title: '复制失败',
            icon: 'none'
          });
        }
      });
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '未知'
      
      try {
        const date = new Date(dateTime)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      } catch (err) {
        return '格式错误'
      }
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'normal': '正常',
        'suspended': '暂停',
        'banned': '封禁'
      }
      return statusMap[status] || '正常'
    },

    // 查看用户订单
    viewUserOrders(user) {
      uni.navigateTo({
        url: `/adminEnd/userManage/userOrderList?user_id=${user.user_id}&openid=${user.openid}`
      });
    },

    // 编辑用户信息
    editUser(user) {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },

    // 状态管理提示
    showStatusManageToast() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/* 只保留必要的动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}



/* 安全区域 */
.safe-area-bottom {
  height: env(safe-area-inset-bottom, 0px);
  background-color: #f8f9fa;
}

// 批量操作栏
.batch-actions {
	box-sizing: border-box;
	position: fixed;
	top: 268px;
	left: 0;
	width: 100%;
	background-color: #fff;
	padding: 20rpx;
	margin-bottom: 20rpx;
	display: flex;
	align-items: center;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

	.batch-left {
		display: flex;
		align-items: center;
		gap: 10rpx;

		.batch-text {
			font-size: 28rpx;
			color: #333;
		}
	}

	.batch-right {
		display: flex;
		gap: 16rpx;

		.batch-btn {
			padding: 12rpx 24rpx;
			border-radius: 20rpx;
			font-size: 26rpx;

			&.reject {
				background-color: #fff;
				color: #dc3545;
				border: 1rpx solid #dc3545;
			}

			&.approve {
				background-color: #2492F2;
				color: #fff;
			}
		}
	}
}
</style>
