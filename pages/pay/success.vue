<template>
	<view class="pay-success">
		<!-- 使用通用导航栏组件 -->
		<nav-bar title="支付成功" title-align="center"></nav-bar>

		<!-- 支付成功提示 -->
		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<view class="success-tip">
				<image class="success-icon" src="https://ccpt.qiniu.cc111.cn/publish/pay_success.png" mode="aspectFit">
				</image>
				<text class="tip-text">支付成功</text>
			</view>

			<!-- 操作按钮 -->
			<view class="action-buttons">
				<button class="btn btn-home" @click="goHome">返回首页</button>
				<button class="btn btn-order" @click="viewOrder">查看订单</button>
			</view>

			<!-- 订单状态卡片 -->
			<view class="order-card">
				<view class="status-header">
					<view class="left">
						<text class="status-icon">待</text>
						<text class="status-text">待接单</text>
					</view>
					<view class="right" @click="shareOrder">
						<image src="https://ccpt.qiniu.cc111.cn/publish/fenxiang.png" mode="aspectFit"></image>
						<text>分享订单</text>
					</view>
				</view>

				<view class="status-desc">系统正在为您匹配充充骑手，请耐心等待~</view>

				<!-- 操作按钮组 -->
				<view class="action-group">
					<view class="action-item" @click="urgeOrder">
						<image src="https://ccpt.qiniu.cc111.cn/publish/cuidan.png" mode="aspectFit"></image>
						<text>催单</text>
					</view>
					<view class="action-item" @click="editOrder">
						<image src="https://ccpt.qiniu.cc111.cn/publish/gaidanxinxi.png" mode="aspectFit"></image>
						<text>改单信息</text>
					</view>
					<view class="action-item" @click="orderAgain">
						<image src="https://ccpt.qiniu.cc111.cn/publish/zailaiyidan.png" mode="aspectFit"></image>
						<text>再来一单</text>
					</view>
					<view class="action-item" @click="cancelOrder">
						<image src="https://ccpt.qiniu.cc111.cn/publish/quxiaodingdan.png" mode="aspectFit"></image>
						<text>取消订单</text>
					</view>
				</view>

				<!-- 地图区域 -->
				<view class="map-section">
					<map class="map" :latitude="orderInfo.latitude" :longitude="orderInfo.longitude" :markers="markers"
						scale="16"></map>
					<!-- <view class="eta-info">预计90分钟内接单</view> -->
				</view>

				<!-- 地址信息 -->
				<view class="address-info">
					<view class="location-icon">
						<image src="https://ccpt.qiniu.cc111.cn/publish/daohang.png" mode="aspectFit"></image>
					</view>
					<view class="address-detail">
						<view class="area">{{orderInfo.province_name}} {{orderInfo.city_name}} {{orderInfo.district_name}}</view>
						<view class="detail">{{orderInfo.shop_address}}</view>
						<!-- <view class="contact">{{orderInfo.name}} {{orderInfo.phone_number}}</view> -->
					</view>
					<view class="check-status" @click="checkOrderStatus">
						查看订单状态
						<image src="https://ccpt.qiniu.cc111.cn/publish/you.png" mode="aspectFit"></image>
					</view>
				</view>

				<!-- 订单信息 -->
				<view class="order-info">
					<view class="order-main">
						<image class="order-icon" src="https://ccpt.qiniu.cc111.cn/publish/banner6.png" mode="aspectFit">
						</image>
						<view class="order-content">
							<view class="order-title">充充跑腿【{{orderInfo.task_name || '离线&异常'}}】订单</view>
							<view class="order-number">订单编号：{{orderInfo.task_no || ''}}</view>
						</view>
						<image class="arrow-icon" src="https://ccpt.qiniu.cc111.cn/publish/you.png" mode="aspectFit">
						</image>
					</view>
					<!-- <view class="divider"></view>
					<view class="order-price">
						<text>合计：</text>
						<text class="price">¥{{orderInfo.order_amount || '0.00'}}</text>
					</view> -->
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import NavBar from '@/components/NavBar.vue'
	import md5 from 'md5'

	export default {
		components: {
			NavBar
		},
		data() {
			return {
				orderInfo: {},
				navBarHeight: 0,
				markers: [
					{
						id: 1,
						latitude: 20.044412,
						longitude: 110.198667,
						iconPath: 'https://ccpt.qiniu.cc111.cn/order/dingwei2.png',
						width: 32,
						height: 32,
						anchor: {x: 0.5, y: 1},
						callout: {
							content: '订单位置',
							color: '#000000',
							fontSize: 12,
							borderRadius: 4,
							bgColor: '#ffffff',
							padding: 6,
							display: 'ALWAYS'
						}
					}
				],
				orderId: '',
			}
		},
		onLoad(option) {
			// 计算导航栏高度
			const systemInfo = uni.getSystemInfoSync()
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			this.navBarHeight = menuButtonInfo.bottom + 12
			if(option.id)
			{
				console.log(option)
				this.orderId = option.id
				this.loadOrderInfo()
			}
		},
		methods: {
			// 加载订单信息
			async loadOrderInfo() {
				try {
					// 获取用户信息
					const userInfo = uni.getStorageSync('userInfo')
					const openid = uni.getStorageSync('openid')
					if (!userInfo || !userInfo.user_id || !openid) {
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						})
						return
					}

					// 计算sign
					const signStr = `user_id=${userInfo.user_id}&openid=${openid}`
					const sign = md5(signStr)

					// 构建请求参数
					const params = {
						task_id: this.orderId,
						user_id: userInfo.user_id,
						sign: sign
					}

					// 调用订单详情接口
					const res = await this.$request('task/info', params, 'POST')
					console.log('订单详情:', res)

					if (res.code === 200 && res.data) {
						this.orderInfo = res.data

						// 更新地图标记，使用订单的实际坐标
						if (this.orderInfo.latitude && this.orderInfo.longitude) {
							// 更新目的地标记
							this.markers[0].latitude = this.orderInfo.latitude
							this.markers[0].longitude = this.orderInfo.longitude

							// 更新标记的callout内容
							if (this.orderInfo.shop_address) {
								this.markers[0].callout.content = this.orderInfo.shop_address.substring(0, 15) + (this.orderInfo.shop_address.length > 15 ? '...' : '')
							}

							console.log('更新地图标记:', this.markers)
						}
					} else {
						uni.showToast({
							title: res.msg || '获取订单详情失败',
							icon: 'none'
						})
					}
				} catch (err) {
					console.error('获取订单详情失败:', err)
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
				}
			},
			goBack() {
				uni.navigateBack()
			},
			goHome() {
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
			viewOrder() {
				uni.navigateTo({
					url: `/pages/order/detail?id=${this.orderId}`
				})
			},
			shareOrder() {
				// 实现分享功能
			},
			urgeOrder() {
				uni.showToast({
					title: '已催单',
					icon: 'success'
				})
			},
			editOrder() {
				uni.navigateTo({
					url: '/pages/order/edit'
				})
			},
			orderAgain() {
				uni.navigateTo({
					url: '/pages/index/publish/index'
				})
			},
			cancelOrder() {
				uni.showModal({
					title: '提示',
					content: '确定要取消订单吗？',
					success: (res) => {
						if (res.confirm) {
							// 实现取消订单逻辑
						}
					}
				})
			},
			checkOrderStatus() {
				uni.navigateTo({
					url: `/pages/order/detail?id=${this.orderId}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.pay-success {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 40rpx;

		.content {
			width: 100%;
		}

		.success-tip {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			padding: 40rpx 0 0 0;
			background: #fff;
			gap: 20rpx;

			.success-icon {
				width: 36rpx;
				height: 36rpx;
			}

			.tip-text {
				font-size: 36rpx;
				color: #333;
				font-weight: 500;
			}
		}

		.action-buttons {
			display: flex;
			justify-content: center;
			gap: 30rpx;
			padding: 30rpx;
			background: #fff;

			.btn {
				width: 240rpx;
				height: 80rpx;
				line-height: 80rpx;
				border-radius: 40rpx;
				font-size: 28rpx;
				position: relative;
				overflow: hidden;
				-webkit-transform: translateZ(0);
				transform: translateZ(0);
				-webkit-backface-visibility: hidden;
				backface-visibility: hidden;
				transition: all 0.3s ease;

				&.btn-home {
					background: #fff;
					color: #333;
					border: 1rpx solid #ddd;
					box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

					&:active {
						background: #f5f5f5;
					}
				}

				&.btn-order {
					background: #fff;
					color: #333;
					border: 1rpx solid #ddd;
					box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

					&:active {
						background: #f5f5f5;
					}
				}
			}
		}

		.order-card {
			margin: 20rpx;
			background: #fff;
			border-radius: 16rpx;
			padding: 30rpx;

			.status-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;

				.left {
					display: flex;
					align-items: center;
					gap: 10rpx;

					.status-icon {
						width: 40rpx;
						height: 40rpx;
						line-height: 40rpx;
						text-align: center;
						background: #1989fa;
						color: #fff;
						border-radius: 50%;
						font-size: 24rpx;
					}

					.status-text {
						font-size: 36rpx;
						font-weight: 600;
						color: #333;
					}
				}

				.right {
					display: flex;
					flex-direction: column;
					align-items: center;
					color: #666;
					font-size: 20rpx;

					image {
						width: 32rpx;
						height: 32rpx;
						margin-bottom: 6rpx;
						image-rendering: -webkit-optimize-contrast;
						image-rendering: crisp-edges;
					}
				}
			}

			.status-desc {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 10rpx;
			}

			.action-group {
				display: flex;
				justify-content: space-between;
				padding: 30rpx 10rpx;
				border-bottom: 2rpx solid #f5f5f5;

				.action-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					font-size: 20rpx;
					color: #333;

					image {
						width: 34rpx;
						height: 34rpx;
						margin-bottom: 10rpx;
						image-rendering: -webkit-optimize-contrast;
						image-rendering: crisp-edges;
					}
				}
			}

			.map-section {
				position: relative;
				height: 400rpx;
				margin: 20rpx 0;

				.map {
					width: 100%;
					height: 100%;
					border-radius: 12rpx;
				}

				.eta-info {
					position: absolute;
					left: 50%;
					transform: translateX(-50%);
					bottom: 20rpx;
					background: #1989fa;
					color: #fff;
					padding: 10rpx 30rpx;
					border-radius: 30rpx;
					font-size: 26rpx;
				}
			}

			.address-info {
				display: flex;
				padding: 30rpx 0;
				border-bottom: 2rpx solid #f5f5f5;
				align-items: center;

				.location-icon {
					margin-right: 20rpx;
					display: flex;
					align-items: center;

					image {
						width: 28rpx;
						height: 28rpx;
						image-rendering: -webkit-optimize-contrast;
						image-rendering: crisp-edges;
						-webkit-backface-visibility: hidden;
						backface-visibility: hidden;
						transform: translateZ(0);
					}
				}

				.address-detail {
					flex: 1;
					display: flex;
					flex-direction: column;
					justify-content: center;

					.area {
						font-size: 28rpx;
						color: #333;
						margin-bottom: 10rpx;
					}

					.detail {
						font-size: 22rpx;
						color: #333;
						font-weight: 500;
						margin-bottom: 10rpx;
					}

					.contact {
						font-size: 26rpx;
						color: #666;
					}
				}

				.check-status {
					color: #666;
					font-size: 26rpx;
					display: flex;
					align-items: center;
					height: 100%;

					image {
						width: 24rpx;
						height: 24rpx;
						margin-left: 6rpx;
						image-rendering: -webkit-optimize-contrast;
						image-rendering: crisp-edges;
					}
				}
			}

			.order-info {
				display: flex;
				flex-direction: column;
				padding-top: 30rpx;

				.order-main {
					display: flex;
					align-items: center;
					margin-bottom: 20rpx;

					.order-icon {
						width: 120rpx;
						height: 120rpx;
						margin-right: 20rpx;
						flex-shrink: 0;
					}

					.order-content {
						flex: 1;
						display: flex;
						flex-direction: column;

						.order-title {
							font-size: 28rpx;
							color: #333;
							margin-bottom: 6rpx;
						}

						.order-number {
							font-size: 24rpx;
							color: #999;
						}
					}

					.arrow-icon {
						width: 24rpx;
						height: 24rpx;
						margin-left: 20rpx;
						flex-shrink: 0;
						image-rendering: -webkit-optimize-contrast;
						image-rendering: crisp-edges;
					}
				}

				.divider {
					height: 2rpx;
					background: #f5f5f5;
					margin: 20rpx 0;
				}

				.order-price {
					font-size: 28rpx;
					color: #333;
					display: flex;
					justify-content: flex-end;
					padding-right: 20rpx;

					.price {
						color: #ff4d4f;
						font-weight: 500;
					}
				}
			}
		}
	}
</style>