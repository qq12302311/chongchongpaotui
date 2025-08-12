<template>
	<view class="container">
		<nav-bar title="订单列表" title-align="center"></nav-bar>
		<!-- 内容区域，移除顶部的自定义nav-bar -->
		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 搜索区域 -->
			<view class="search-section">
				<view class="search-bar">
					<view class="search-condition" @click="toggleSearchConditions">
						<text>选择搜索条件</text>
						<text class="arrow" :class="{ 'arrow-up': showSearchConditions }">▼</text>
					</view>
				</view>

				<!-- 搜索条件下拉区域 -->
				<view v-if="showSearchConditions" class="search-conditions-dropdown">
					<view class="condition-group">
						<view class="condition-title">订单类型</view>
						<view class="condition-options">
							<view class="condition-option active">全部</view>
							<view class="condition-option">补宝</view>
							<view class="condition-option">接线</view>
							<view class="condition-option">其他</view>
						</view>
					</view>
					<view class="condition-group">
						<view class="condition-title">订单状态</view>
						<view class="condition-options">
							<view class="condition-option active">全部</view>
							<view class="condition-option">进行中</view>
							<view class="condition-option">已完成</view>
							<view class="condition-option">已取消</view>
						</view>
					</view>
					<view class="condition-buttons">
						<view class="reset-btn">重置</view>
						<view class="confirm-btn">确定</view>
					</view>
				</view>

				<view class="search-input-wrapper">
					<view class="search-input">
						<text class="iconfont search-icon">🔍</text>
						<input type="text" placeholder="输入关键字搜索订单" placeholder-style="color: #AAAAAA;" />
					</view>
				</view>
			</view>

			<!-- 标签栏 -->
			<view class="tabs">
				<view v-for="(tab, index) in tabs" :key="index" class="tab-item"
					:class="{ active: currentTab === index }" @click="switchTab(index)">
					<text>{{ tab }}</text>
				</view>
				<view class="tab-line" :style="{ left: tabLineLeft, transform: tabLineTransform }"></view>
			</view>

			<!-- 订单列表内容 -->
			<view class="order-content">
				<!-- 加载中提示 -->
				<view v-if="loading" class="loading-container">
					<view class="loading-spinner"></view>
					<text class="loading-text">加载中...</text>
				</view>
				<!-- 空状态 -->
				<view v-else-if="orderList.length === 0" class="empty-state">
					<image class="empty-image" src="https://ccpt.qiniu.0871.cn/order/notorder.png" mode="aspectFit"></image>
					<text class="empty-text">暂无相关订单</text>
				</view>
				<!-- 订单列表 -->
				<view v-else class="order-list">
					<view v-for="(order, index) in orderList" :key="index" class="order-item" @click="goToOrderDetail(order)">
						<view class="order-header">
							<text class="order-type">{{order.task_name}}</text>
							<text class="order-status" :class="order.status">{{getStatusText(order.status)}}</text>
						</view>
						<view class="order-info">
							<view class="info-item">
								<text class="label">订单编号：</text>
								<text class="value">{{order.task_no}}</text>
							</view>
							<view class="info-item">
								<text class="label">下单时间：</text>
								<text class="value">{{order.task_date}}</text>
							</view>
							<view class="info-item">
								<text class="label">门店地址：</text>
								<text class="value">{{order.province_name}}{{order.city_name}}{{order.district_name}}{{order.shop_address}}{{order.address}}</text>
							</view>
							<view class="info-item">
								<text class="label">订单金额：</text>
								<text class="value price">¥{{order.order_amount}}</text>
							</view>
							<view class="info-item" v-if="order.task_detail && order.task_detail.length > 0">
								<text class="label">任务详情：</text>
								<text class="value">{{order.task_detail[0].detail}}</text>
							</view>
							<view class="info-item" v-if="order.service_time_type === 'before_deadline'">
								<text class="label">截止时间：</text>
								<text class="value">{{order.deadline}}</text>
							</view>
							<view class="info-item" v-if="order.service_time_type === 'time_range'">
								<text class="label">服务时间：</text>
								<text class="value">{{order.range_start_date}} 至 {{order.range_end_date}}</text>
							</view>
						</view>
						<!-- <view class="order-footer">
							<button class="btn" v-if="order.status === 'assigned'" @click="handleComplete(order)">完成</button>
							<button class="btn" v-if="order.status === 'finished' || order.status === 'finished_timeout'" @click="handleConfirm(order)">确认</button>
						</view> -->
					</view>
				</view>
			</view>
		</view>

		<!-- 底部导航栏 -->
		<tab-bar></tab-bar>

		<!-- 悬浮小图 -->
		<floating-image></floating-image>

		<!-- 底部占位，确保内容不被底部导航栏遮挡 -->
		<view class="bottom-placeholder"></view>
	</view>
</template>

<script>
	import NavBar from '@/components/NavBar.vue'
	import TabBar from '@/components/tab-bar/tab-bar.vue'
	import FloatingImage from '@/components/FloatingImage/index.vue'
	import md5 from 'md5'

	export default {
		components: {
			TabBar,
			NavBar,
			FloatingImage
		},
		data() {
			return {
				navBarHeight: 0,
				showSearchConditions: false,
				tabs: ['新任务', '进行中', '已取消', '已完成'],
				currentTab: 0,
				tabLineLeft: '10%',
				tabLineTransform: 'translateX(-15px)',
				orderList: [], // 订单列表
				loading: false, // 加载状态
				page: 1, // 当前页码
				pageSize: 10, // 每页数量
				hasMore: true // 是否还有更多数据
			}
		},
		onShow() {
			// 计算导航栏高度
			const systemInfo = uni.getSystemInfoSync()
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			this.navBarHeight = menuButtonInfo.bottom + 12

			this.loadOrderList() // 初始加载，不是加载更多
		},
		mounted() {
			// 初始化标签下划线位置
			this.updateTabLinePosition(this.currentTab)
		},
		methods: {
			toggleSearchConditions() {
				this.showSearchConditions = !this.showSearchConditions
			},
			switchTab(index) {
				this.currentTab = index
				this.updateTabLinePosition(index)
				this.page = 1
				this.hasMore = true
				this.orderList = []
				this.loadOrderList(false) // 切换标签时重新加载，不是加载更多
			},
			updateTabLinePosition(index) {
				// 计算每个标签的宽度百分比
				const tabWidth = 100 / this.tabs.length
				// 计算下划线应该在的位置 (标签中心)
				const left = (index * tabWidth) + (tabWidth / 2)
				this.tabLineLeft = `${left}%`
			},
			// 加载订单列表
			async loadOrderList(isLoadMore = false) {
				if (!isLoadMore && !this.hasMore) return

				this.loading = true // 开始加载，显示加载中状态
				try {
					const statusMap = {
						0: 'waiting', // 新订单
						1: ['assigned', 'finished'], // 进行中（传递数组）
						2: 'canceled', // 已取消
						3: 'completed' // 已完成
					}

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

					const params = {
						status: statusMap[this.currentTab],
						user_id: userInfo.user_id,
						sign: sign,
					}

					const res = await this.$request('task/list', params, 'POST')

					if (res.code === 200) {
						const list = res.data || []
						if (isLoadMore) {
							this.orderList = [...this.orderList, ...list]
						} else {
							this.orderList = list
						}
						this.hasMore = list.length === this.pageSize
						if (this.hasMore) {
							this.page++
						}
					} else {
						uni.showToast({
							title: res.msg || '加载失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('加载订单列表失败:', error)
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},
			// 处理接单
			async handleAccept(order) {
				try {
					const res = await this.$request({
						url: '/api/task/accept',
						method: 'POST',
						data: {
							orderId: order.id
						}
					})

					if (res.code === 0) {
						uni.showToast({
							title: '接单成功',
							icon: 'success'
						})
						this.loadOrderList(false)
					} else {
						uni.showToast({
							title: res.msg || '接单失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('接单失败:', error)
					uni.showToast({
						title: '接单失败，请重试',
						icon: 'none'
					})
				}
			},
			// 处理完成
			async handleComplete(order) {
				try {
					const res = await this.$request({
						url: '/api/task/complete',
						method: 'POST',
						data: {
							orderId: order.id
						}
					})

					if (res.code === 0) {
						uni.showToast({
							title: '操作成功',
							icon: 'success'
						})
						this.loadOrderList(false)
					} else {
						uni.showToast({
							title: res.msg || '操作失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('操作失败:', error)
					uni.showToast({
						title: '操作失败，请重试',
						icon: 'none'
					})
				}
			},
			// 处理确认
			async handleConfirm(order) {
				try {
					const res = await this.$request({
						url: '/api/task/confirm',
						method: 'POST',
						data: {
							orderId: order.id
						}
					})

					if (res.code === 0) {
						uni.showToast({
							title: '确认成功',
							icon: 'success'
						})
						this.loadOrderList(false)
					} else {
						uni.showToast({
							title: res.msg || '确认失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('确认失败:', error)
					uni.showToast({
						title: '确认失败，请重试',
						icon: 'none'
					})
				}
			},
			getStatusText(status) {
				const statusMap = {
					'waiting': '等待接单...',
					'assigned': '进行中',
					'finished_timeout': '超时完成',
					'finished': '待确认',
					'canceled': '已取消',
					'completed': '已完成'
				}
				return statusMap[status] || status
			},
			// 跳转到订单详情页
			goToOrderDetail(order) {
				uni.navigateTo({
					url: `/pages/order/detail?id=${order.task_id}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		font-family: "HarmonyOS Sans SC", sans-serif;
		padding-bottom: calc(100rpx + constant(safe-area-inset-bottom));
		/* iOS < 11.2 */
		padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
		/* iOS >= 11.2 */
		box-sizing: border-box;
	}

	.content {
		padding: 0;
		position: relative;
		background-color: #f5f5f5;
	}

	.search-section {
		background-color: #2492F2;
		padding: 0 20rpx 20rpx;
	}

	.title-bar {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 90rpx;

		.title {
			font-size: 34rpx;
			color: #ffffff;
			font-weight: 500;
		}
	}

	.search-bar {
		display: flex;
		justify-content: flex-start;
		padding: 15rpx 0 10rpx;
	}

	.search-condition {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #ffffff;
		background-color: rgba(255, 255, 255, 0.2);
		padding: 8rpx 20rpx;
		border-radius: 30rpx;

		.arrow {
			margin-left: 10rpx;
			font-size: 20rpx;
			transition: transform 0.3s;
		}

		.arrow-up {
			transform: rotate(180deg);
		}
	}

	.search-conditions-dropdown {
		background-color: #ffffff;
		border-radius: 10rpx;
		padding: 20rpx;
		margin-top: 10rpx;
		margin-bottom: 15rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

		.condition-group {
			margin-bottom: 20rpx;

			.condition-title {
				font-size: 28rpx;
				color: #333333;
				margin-bottom: 15rpx;
				font-weight: 500;
			}

			.condition-options {
				display: flex;
				flex-wrap: wrap;

				.condition-option {
					padding: 8rpx 20rpx;
					background-color: #f5f5f5;
					border-radius: 30rpx;
					margin-right: 15rpx;
					margin-bottom: 10rpx;
					font-size: 24rpx;
					color: #666666;

					&.active {
						background-color: #2492F2;
						color: #ffffff;
					}
				}
			}
		}

		.condition-buttons {
			display: flex;
			justify-content: space-between;
			margin-top: 20rpx;

			.reset-btn, .confirm-btn {
				width: 48%;
				height: 70rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				border-radius: 35rpx;
				font-size: 28rpx;
			}

			.reset-btn {
				background-color: #f5f5f5;
				color: #666666;
			}

			.confirm-btn {
				background-color: #2492F2;
				color: #ffffff;
			}
		}
	}

	.search-input-wrapper {
		margin-top: 10rpx;
	}

	.search-input {
		background-color: #ffffff;
		height: 70rpx;
		border-radius: 35rpx;
		display: flex;
		align-items: center;
		padding: 0 30rpx;

		.search-icon {
			color: #AAAAAA;
			font-size: 28rpx;
			margin-right: 10rpx;
		}

		input {
			flex: 1;
			height: 70rpx;
			font-size: 28rpx;
			color: #333333;
		}
	}

	.tabs {
		display: flex;
		background-color: #ffffff;
		height: 80rpx;
		position: relative;
		padding: 0;
		width: 100%;
		box-sizing: border-box;

		.tab-item {
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 24rpx;
			color: #666666;
			position: relative;
			height: 100%;
			padding: 0;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			&.active {
				color: #2492F2;
				font-weight: 500;
			}
		}

		.tab-line {
			position: absolute;
			bottom: 0;
			width: 60rpx;
			height: 4rpx;
			background-color: #2492F2;
			transform: translateX(-50%);
			transition: left 0.3s ease;
		}
	}

	.order-content {
		padding: 30rpx 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
	}

	.loading-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 40rpx 0;

		.loading-spinner {
			width: 40rpx;
			height: 40rpx;
			border: 3rpx solid #f3f3f3;
			border-top: 3rpx solid #2492F2;
			border-radius: 50%;
			animation: spin 1s linear infinite;
			margin-right: 10rpx;
		}

		.loading-text {
			font-size: 24rpx;
			color: #999;
		}
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;

		.empty-image {
			width: 180rpx;
			height: 180rpx;
			margin-bottom: 20rpx;
			opacity: 0.7;
		}

		.empty-text {
			font-size: 28rpx;
			color: #999999;
		}
	}

	.order-list {
		padding: 0 10rpx;
		min-height: 100vh;
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));

		.order-item {
			background-color: #ffffff;
			border-radius: 16rpx;
			padding: 20rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
			transition: all 0.3s ease;
			width: 680rpx;
			max-width: 95vw;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			align-items: stretch;

			&:active {
				transform: scale(0.98);
			}

			.order-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;
				padding-bottom: 20rpx;
				border-bottom: 1rpx solid #f0f0f0;

				.order-type {
					font-size: 28rpx;
					color: #333333;
					font-weight: 600;
					position: relative;
					padding-left: 20rpx;

					&::before {
						content: '';
						position: absolute;
						left: 0;
						top: 50%;
						transform: translateY(-50%);
						width: 6rpx;
						height: 24rpx;
						background-color: #2492F2;
						border-radius: 3rpx;
					}
				}

				.order-status {
					font-size: 24rpx;
					padding: 4rpx 16rpx;
					border-radius: 16rpx;

					&.waiting {
						color: #2492F2;
						background-color: rgba(36, 146, 242, 0.1);
					}

					&.assigned {
						color: #FFA500;
						background-color: rgba(255, 165, 0, 0.1);
					}

					&.finished_timeout {
						color: #FF0000;
						background-color: rgba(255, 0, 0, 0.1);
					}

					&.finished {
						color: #9B59B6;
						background-color: rgba(155, 89, 182, 0.1);
					}

					&.canceled {
						color: #999999;
						background-color: rgba(153, 153, 153, 0.1);
					}

					&.completed {
						color: #2ECC71;
						background-color: rgba(46, 204, 113, 0.1);
					}
				}
			}

			.order-info {
				.info-item {
					display: flex;
					margin-bottom: 12rpx;
					width: 100%;

					&:last-child {
						margin-bottom: 0;
					}

					.label {
						font-size: 26rpx;
						color: #999999;
						width: 140rpx;
						flex-shrink: 0;
						white-space: nowrap;
					}

					.value {
						font-size: 26rpx;
						color: #333333;
						flex: 1;
						line-height: 1.4;
						word-break: break-all;

						&.price {
							color: #FF6B6B;
							font-weight: 600;
							font-size: 28rpx;
						}
					}
				}
			}

			.order-footer {
				display: flex;
				justify-content: flex-end;
				margin-top: 24rpx;
				padding-top: 20rpx;
				border-top: 1rpx solid #f0f0f0;

				.btn {
					margin-left: 16rpx;
					font-size: 24rpx;
					padding: 8rpx 28rpx;
					border-radius: 24rpx;
					background-color: #2492F2;
					color: #ffffff;
					font-weight: 500;
					box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.3);
					transition: all 0.3s ease;

					&:active {
						transform: scale(0.95);
						box-shadow: 0 2rpx 6rpx rgba(36, 146, 242, 0.2);
					}
				}
			}
		}
	}

	.order-page {
		min-height: 100vh;
		background-color: #F5F5F5;
		padding-bottom: calc(100rpx + constant(safe-area-inset-bottom));
		/* iOS < 11.2 */
		padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
		/* iOS >= 11.2 */
		box-sizing: border-box;
	}

	.bottom-placeholder {
		height: calc(100rpx + constant(safe-area-inset-bottom));
		/* iOS < 11.2 */
		height: calc(100rpx + env(safe-area-inset-bottom));
		/* iOS >= 11.2 */
	}
</style>