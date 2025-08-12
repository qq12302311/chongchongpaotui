<template>
	<view class="coupon-page">
		<!-- 顶部导航栏 -->
		<nav-bar title="优惠券" title-align="center" :fixed="true" :placeholder="true" :border="false" :bgColor="'#2492F2'"
			:titleColor="'#FFFFFF'" :backColor="'#FFFFFF'"></nav-bar>

		<!-- 状态切换栏 -->
		<view class="tab-bar" :style="{ top: navBarHeight + 'px' }">
			<view class="tab-item" :class="{ active: currentTab === 'unused' }" @click="switchTab('unused')">
				待使用
			</view>
			<view class="tab-item" :class="{ active: currentTab === 'used' }" @click="switchTab('used')">
				已使用
			</view>
			<view class="tab-item" :class="{ active: currentTab === 'expired' }" @click="switchTab('expired')">
				已过期
			</view>
		</view>

		<!-- 优惠券列表 -->
		<view class="coupon-list" :style="{ paddingTop: tabBarHeight + 'px' }">
			<block v-if="currentTab === 'unused'">
				<view class="coupon-item" v-for="(coupon, index) in unusedCoupons" :key="index" @click="selectCoupon(coupon)">
					<view class="coupon-left">
						<text class="amount">{{coupon.amount}}元</text>
					</view>
					<view class="coupon-right">
						<view class="coupon-name">{{coupon.name}}<text class="coupon-type">({{coupon.type}})</text></view>
						<view class="coupon-date">有效期：{{coupon.startDate}} — {{coupon.endDate}}</view>
					</view>
				</view>
				<view v-if="unusedCoupons.length === 0" class="empty-tip">
					暂无可用优惠券
				</view>
			</block>
			
			<block v-if="currentTab === 'used'">
				<view class="coupon-item" v-for="(coupon, index) in usedCoupons" :key="index">
					<view class="coupon-left">
						<text class="amount">{{coupon.amount}}元</text>
					</view>
					<view class="coupon-right">
						<view class="coupon-name">{{coupon.name}}<text class="coupon-type">({{coupon.type}})</text></view>
						<view class="coupon-date">有效期：{{coupon.startDate}} — {{coupon.endDate}}</view>
					</view>
				</view>
				<view v-if="usedCoupons.length === 0" class="empty-tip">
					暂无已使用优惠券
				</view>
			</block>
			
			<block v-if="currentTab === 'expired'">
				<view class="coupon-item" v-for="(coupon, index) in expiredCoupons" :key="index">
					<view class="coupon-left">
						<text class="amount">{{coupon.amount}}元</text>
					</view>
					<view class="coupon-right">
						<view class="coupon-name">{{coupon.name}}<text class="coupon-type">({{coupon.type}})</text></view>
						<view class="coupon-date">有效期：{{coupon.startDate}} — {{coupon.endDate}}</view>
					</view>
				</view>
				<view v-if="expiredCoupons.length === 0" class="empty-tip">
					暂无已过期优惠券
				</view>
			</block>
		</view>

		<!-- 认证提示弹窗 -->
		<auth-modal :show="showAuthModal" title="提示" :content="'预估金额小于' + minOrderAmount.toFixed(2) + '元，无法使用该优惠券！'" cancel-text="取消" @cancel="handleAuthCancel" @confirm="handleAuthConfirm"/>
	</view>
</template>

<script>
	import AuthModal from '@/components/AuthModal/index.vue'
	export default {
		components: {
			AuthModal
		},
		data() {
			return {
				navBarHeight: 0,
				tabBarHeight: 176, // tab栏高度 = 导航栏高度 + 88rpx
				currentTab: 'unused',
				coupons: [], // 优惠券列表
				loading: false,
				userId: '', // 用户ID
				baseServiceFee: 0,
				minOrderAmount: 0,
				showAuthModal: false,
			}
		},
		computed: {
			unusedCoupons() {
				return this.coupons.filter(coupon => !coupon.expired);
			},
			usedCoupons() {
				return this.coupons.filter(coupon => coupon.status === 'used');
			},
			expiredCoupons() {
				return this.coupons.filter(coupon => coupon.expired);
			}
		},
		onLoad(priceDetails) {
			this.baseServiceFee = priceDetails.baseServiceFee
			// 获取系统信息和菜单按钮位置信息
			const systemInfo = uni.getSystemInfoSync()
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			// 计算导航栏高度
			this.navBarHeight = menuButtonInfo.bottom + 12
			// 计算整个顶部区域高度（导航栏+tab栏）
			this.tabBarHeight = this.navBarHeight + 64 // 44是tab栏的高度

			// 获取用户ID
			const userInfo = uni.getStorageSync('userInfo')
			if (userInfo) {
				this.userId = userInfo.user_id
				// 加载优惠券列表
				this.loadCoupons()
			} else {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
			}
		},
		methods: {
			handleAuthConfirm(){
				this.showAuthModal = false
			},
			handleAuthCancel(){
				this.showAuthModal = false
			},
			// 加载优惠券列表
			async loadCoupons() {
				if (this.loading) return
				this.loading = true

				try {
					const res = await this.$request('user/ticket/list', {
						user_id: this.userId,
						sign: 'chongchong'
					}, 'POST');

					if (res.status === 'success') {
						// 处理优惠券数据
						this.coupons = res.data.map(item => ({
							amount: item.amount || '0',
							name: item.name || '优惠券',
							type: item.task_type_id === 1 ? '补宝' : '通用',
							startDate: item.start_at ? item.start_at.trim() : '',
							endDate: item.expire_at ? item.expire_at.trim() : '',
							id: item.ticket_id,
							status: item.status || 'unused',
							expired: item.expired,
							minOrderAmount: item.min_order_amount || '0'
						}));
						console.log('处理后的优惠券数据:', this.coupons);
					} else {
						uni.showToast({
							title: res.msg || '获取优惠券失败',
							icon: 'none'
						})
					}
				} catch (err) {
					console.error('获取优惠券列表失败:', err)
					uni.showToast({
						title: '获取优惠券失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},
			// 格式化日期
			formatDate(timestamp) {
				if (!timestamp) return ''
				const date = new Date(timestamp * 1000)
				const year = date.getFullYear()
				const month = (date.getMonth() + 1).toString().padStart(2, '0')
				const day = date.getDate().toString().padStart(2, '0')
				return `${year}-${month}-${day}`
			},
			switchTab(tab) {
				this.currentTab = tab
				if (tab === 'unused') {
					this.loadCoupons()
				}
			},
			selectCoupon(coupon) {
				// 判断是否达到使用优惠券的条件
				console.log(this.baseServiceFee,coupon.minOrderAmount,"dddd")
				if (parseFloat(this.baseServiceFee) < parseFloat(coupon.minOrderAmount)) {
					this.minOrderAmount = parseFloat(coupon.minOrderAmount)
					this.showAuthModal = true
					return false;
				}
				
				// 构建优惠券显示文本
				const couponText = `${coupon.name}（${coupon.amount}元）`

				// 获取上一页
				const pages = getCurrentPages()
				const prevPage = pages[pages.length - 2]

				// 更新上一页的数据
				if (prevPage) {
					prevPage.$vm.formData.coupon = couponText
					prevPage.$vm.formData.couponId = coupon.id // 添加优惠券ID
					prevPage.$vm.formData.couponAmount = parseFloat(coupon.amount) || 0 // 添加优惠券金额
					// 重新计算价格
					prevPage.$vm.calculatePrice()
				}

				// 返回上一页
				uni.navigateBack({
					delta: 1
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.coupon-page {
		min-height: 100vh;
		background-color: #F5F5F5;
	}

	.tab-bar {
		display: flex;
		background-color: #FFFFFF;
		padding: 0 30rpx;
		border-bottom: 1rpx solid #EEEEEE;
		position: fixed;
		left: 0;
		right: 0;
		height: 88rpx;
		z-index: 100;

		.tab-item {
			flex: 1;
			height: 88rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			color: #666666;
			position: relative;

			&.active {
				color: #2492F2;
				font-weight: 500;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background-color: #2492F2;
					border-radius: 2rpx;
				}
			}
		}
	}

	.coupon-list {
		padding: 40rpx 30rpx;
	}

	.coupon-item {
		background: #FFFFFF;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
		display: flex;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

		.coupon-left {
			width: 200rpx;
			background: #2492F2;
			padding: 30rpx 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			position: relative;

			// 添加锯齿效果
			&::after {
				content: '';
				position: absolute;
				right: 0;
				top: 0;
				bottom: 0;
				width: 16rpx;
				background: radial-gradient(circle at 0 8rpx, transparent 0, transparent 8rpx, #F5F5F5 8rpx);
				background-size: 16rpx 16rpx;
			}

			.amount {
				color: #FFFFFF;
				font-size: 48rpx;
				font-weight: bold;

				&::before {
					content: '¥';
					font-size: 32rpx;
					margin-right: 4rpx;
				}
			}
		}

		.coupon-right {
			flex: 1;
			padding: 30rpx;
			background: #FFFFFF;
			position: relative;
			display: flex;
			flex-direction: column;
			justify-content: center;

			.coupon-name {
				font-size: 32rpx;
				color: #333333;
				font-weight: 500;
				margin-bottom: 16rpx;

				.coupon-type {
					font-size: 24rpx;
					color: #999999;
					font-weight: normal;
					margin-left: 8rpx;
				}
			}

			.coupon-date {
				font-size: 24rpx;
				color: #999999;
			}
		}
	}

	.empty-tip {
		text-align: center;
		color: #999999;
		font-size: 28rpx;
		padding: 40rpx;
	}
</style>