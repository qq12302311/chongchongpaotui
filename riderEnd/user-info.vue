<template>
	<view class="user-info-page">
		<!-- 顶部导航栏 -->
		<nav-bar title="骑手信息" title-align="center"></nav-bar>

		<!-- 导航栏占位元素 -->
		<view class="nav-placeholder"></view>

		<!-- 用户头像和姓名区域 -->
		<view class="user-header">
			<view class="user-info-row">
				<view class="avatar-container">
					<image class="avatar" src="https://ccpt.qiniu.0871.cn/rider/verify/touxiang.png" mode="aspectFill">
					</image>
					<!-- 认证徽章，仅已通过时显示 -->
					<view class="verify-badge" v-if="userInfo.submit_certification === '已通过'">
						<image src="https://ccpt.qiniu.0871.cn/rider/verify/yirenzheng.png" mode="aspectFit"></image>
					</view>
				</view>
				<view class="user-details">
					<view class="user-name">{{ userInfo.name }}</view>
					<view class="user-id">充充骑手ID: {{ userInfo.id }}</view>
				</view>
				<!-- 认证章，仅已通过时显示 -->
				<view class="verify-stamp" v-if="userInfo.submit_certification === '已通过'">
					<image src="https://ccpt.qiniu.0871.cn/rider/verify/renzheng.png" mode="aspectFit"></image>
				</view>
			</view>
		</view>

		<!-- 个人信息区域 -->
		<view class="info-section">
			<view class="section-title">个人信息</view>

			<view class="info-item">
				<view class="info-label">您的姓名</view>
				<view class="info-value">{{ userInfo.name }}</view>
			</view>

			<!-- 证件号码，仅已通过时显示 -->
			<view class="info-item" v-if="userInfo.submit_certification === '已通过'">
				<view class="info-label">证件号码</view>
				<view class="info-value">{{ maskIdCard(userInfo.latest_certification.id_card_number) }}</view>
			</view>

			<view class="info-item">
				<view class="info-label">手机号</view>
				<view class="info-value">{{ maskPhone(userInfo.phone) }}</view>
			</view>

			<!-- 微信号，仅已通过时显示 -->
			<view class="info-item" v-if="userInfo.submit_certification === '已通过'">
				<view class="info-label">微信号</view>
				<view class="info-value">{{ userInfo.latest_certification.wechat_id }}</view>
			</view>
		</view>

		<!-- 隐私声明 -->
		<view class="privacy-notice">
			*身份信息已认证，信息安全保障中！
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
				userInfo: {
					name: '张宇',
					id: 'zy3435',
					phone: '18888888888',
					idCard: '888888888888888888',
					wechat: '88888888',
					verified: true
				}
			}
		},
		onLoad() {
			// 获取用户信息
			this.getUserInfo()
		},
		methods: {
			// 获取用户信息
			getUserInfo() {
				const riderUserInfo = uni.getStorageSync('riderUserInfo')
				if (riderUserInfo) {
					// 如果本地存储中有用户信息，则使用本地存储的信息
					this.userInfo = {
						...this.userInfo,
						...riderUserInfo
					}
				} else {
					// 如果没有登录，返回上一页
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				}
			},

			// 掩码处理身份证号
			maskIdCard(idCard) {
				if (!idCard) return ''
				if (idCard.length >= 18) {
					return idCard.substring(0, 4) + '**********' + idCard.substring(14)
				} else {
					return idCard.substring(0, 4) + '*****' + idCard.substring(idCard.length - 4)
				}
			},

			// 掩码处理手机号
			maskPhone(phone) {
				if (!phone) return ''
				if (phone.length >= 11) {
					return phone.substring(0, 3) + '****' + phone.substring(7)
				} else {
					return phone
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.user-info-page {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.nav-placeholder {
		height: 180rpx;
		width: 100%;
	}

	.user-header {
		padding: 50rpx 30rpx 30rpx;
		background-color: #fff;
	}

	.user-info-row {
		display: flex;
		position: relative;
		align-items: center;
		min-height: 180rpx;
	}

	.avatar-container {
		position: relative;
		margin-right: 30rpx;

		.avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 60rpx;
		}
	}

	.verify-badge {
		position: absolute;
		bottom: -15rpx;
		left: 0rpx;

		image {
			width: 130rpx;
			height: 40rpx;
		}
	}

	.user-details {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-right: 230rpx;
	}

	.user-name {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}

	.user-id {
		font-size: 28rpx;
		color: #666;
	}

	.verify-stamp {
		position: absolute;
		top: 50%;
		right: 0;
		width: 230rpx;
		height: 230rpx;
		transform: translateY(-50%);

		image {
			width: 100%;
			height: 100%;
		}
	}

	.info-section {
		background-color: #fff;
		padding: 0 30rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		padding: 40rpx 0 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #f5f5f5;

		&:last-child {
			border-bottom: none;
		}

		.info-label {
			font-size: 28rpx;
			color: #333;
		}

		.info-value {
			font-size: 28rpx;
			color: #666;
			text-align: right;
		}
	}

	.privacy-notice {
		text-align: center;
		font-size: 24rpx;
		color: #999;
		margin-top: 30rpx;
		padding-bottom: 30rpx;
	}
</style>