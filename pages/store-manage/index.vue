<template>
	<view class="store-manage">
		<!-- 使用头部组件 -->
		<nav-bar title="门店管理" title-align="center"></nav-bar>

		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 搜索框 -->
			<view class="search-box">
				<view class="search-input">
					<input type="text" v-model="searchKeyword" placeholder="请输入门店名称搜索" @confirm="searchStores" confirm-type="search" />
					<view class="search-btn" @click="searchStores">搜索</view>
				</view>
			</view>

			<!-- 门店列表 -->
			<view class="store-list">
				<view v-if="filteredStores.length === 0" class="empty-state">
					<text class="empty-text">暂无门店信息</text>
				</view>
				<view v-else class="store-items">
					<view v-for="(store, index) in filteredStores" :key="index" class="store-item">
						<view class="store-header">
							<text class="store-name">{{ store.store_name || '未命名门店' }}</text>
							<text class="store-time">{{ formatTime(store.created_at) }}</text>
						</view>
						<view class="divider"></view>
						<view class="store-content">
							<!-- 门店图片 -->
							<view class="store-image-wrapper" v-if="store.door_images && Array.isArray(store.door_images) && store.door_images.length > 0 && store.door_images[0]">
								<image :src="store.door_images[0]" mode="aspectFill" class="store-image" @error="handleImageError"></image>
							</view>

							<view class="store-info">
								<!-- 地址信息 -->
								<view class="address-info">
									<text class="area-text">{{ store.province_name }} {{ store.city_name }} {{ store.district_name }}</text>
									<text class="address-text">{{ store.address }}</text>
								</view>

								<!-- 联系信息 -->
								<view class="contact-info" v-if="store.name || store.phone_number">
									<text class="contact-text">联系人：{{ store.name || '未填写' }} {{ store.phone_number || '' }}</text>
								</view>

								<!-- SN/MAC信息 -->
								<view class="sn-mac-info" v-if="store.sn_mac_code && store.sn_mac_code.length > 0">
									<text class="sn-mac-text">SN/MAC: {{ store.sn_mac_code.length }}个</text>
								</view>
							</view>
						</view>

						<!-- 操作按钮 -->
						<view class="store-footer">
							<view class="action-btn" @click="handleEdit(store)">操作</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 悬浮聊天图标 -->
		<FloatingChatIconUser />
	</view>
</template>

<script>
import FloatingChatIconUser from '@/components/FloatingChatIconUser/index.vue'

export default {
	components: {
		FloatingChatIconUser
	},
	data() {
		return {
			navBarHeight: 0,
			stores: [],
			filteredStores: [],
			searchKeyword: ''
		}
	},
	onLoad() {
		// 计算导航栏高度
		const systemInfo = uni.getSystemInfoSync()
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
		this.navBarHeight = menuButtonInfo.bottom + 12

		this.loadStores()

		// 监听刷新事件
		uni.$on('refreshStoreList', () => {
			this.loadStores()
		})
	},
	onUnload() {
		// 页面卸载时移除事件监听
		uni.$off('refreshStoreList')
	},
	methods: {
		// 加载门店列表
		async loadStores() {
			try {
				const userInfo = uni.getStorageSync('userInfo')
				if (!userInfo || !userInfo.user_id) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}

				uni.showLoading({ title: '加载中...', mask: true })

				const res = await this.$request('user/addresses/get', {
					user_id: userInfo.user_id
				}, 'POST')

				uni.hideLoading()

				if (res && res.status === 'success') {
					const list = Array.isArray(res.data) ? res.data : []
					this.filteredStores = list
				} else {
					uni.showToast({
						title: res.msg || '加载失败',
						icon: 'none'
					})
				}
			} catch (error) {
				uni.hideLoading()
				console.error('加载门店列表失败:', error)
				uni.showToast({
					title: '网络错误，请重试',
					icon: 'none'
				})
			}
		},

		// 搜索门店
		async searchStores() {
			const keyword = (this.searchKeyword || '').trim()
			if (!keyword) {
				this.filteredStores = [...this.stores]
				return
			}

			try {
				const userInfo = uni.getStorageSync('userInfo')
				if (!userInfo || !userInfo.user_id) {
					// 无用户ID时回退到本地模糊匹配
					this.filteredStores = this.filterStores(this.stores, keyword)
					return
				}

				uni.showLoading({ title: '搜索中...', mask: true })
				const res = await this.$request('user/addresses/get', {
					user_id: userInfo.user_id,
					store_name: keyword
				}, 'POST')

				uni.hideLoading()

				if (res && res.status === 'success') {
					const list = Array.isArray(res.data) ? res.data : []
					this.filteredStores = list
				} else {
					// 失败时退回到本地模糊匹配
					this.filteredStores = this.filterStores(this.stores, keyword)
				}
			} catch (e) {
				uni.hideLoading()
				console.error('搜索门店失败:', e)
				this.filteredStores = this.filterStores(this.stores, keyword)
			}
		},

		// 本地过滤门店
		filterStores(stores, keyword) {
			keyword = keyword.toLowerCase()
			return stores.filter(store => {
				const storeName = (store.store_name || '').toLowerCase()
				const address = (store.address || '').toLowerCase()
				return storeName.includes(keyword) || address.includes(keyword)
			})
		},

		// 处理操作按钮点击
		handleEdit(store) {
			// 跳转到门店信息详情页面
			uni.navigateTo({
				url: `/pages/store-manage/detail?id=${store.id}`
			})
		},

		// 格式化时间
		formatTime(timestamp) {
			if (!timestamp) return ''

			const date = new Date(timestamp)
			const year = date.getFullYear()
			const month = (date.getMonth() + 1).toString().padStart(2, '0')
			const day = date.getDate().toString().padStart(2, '0')
			const hour = date.getHours().toString().padStart(2, '0')
			const minute = date.getMinutes().toString().padStart(2, '0')

			return `${year}-${month}-${day} ${hour}:${minute}`
		},

		// 图片加载错误处理
		handleImageError(e) {
			console.error('图片加载失败:', e)
		}
	}
}
</script>

<style lang="scss" scoped>
	.divider {
		width: 100%;
		height: 1rpx;
		background: #eee;
		margin: 8rpx 0 8rpx 0;
	}
.store-manage {
	min-height: 100vh;
	background-color: #F5F5F5;
}

.content {
	padding: 30rpx;
}

.search-box {
	padding: 20rpx;
	background-color: #FFFFFF;
	margin-bottom: 20rpx;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

	.search-input {
		display: flex;
		align-items: center;
		background-color: #F5F5F5;
		border-radius: 36rpx;
		padding: 10rpx 20rpx;
		height: 72rpx;

		input {
			flex: 1;
			height: 100%;
			font-size: 28rpx;
			color: #333;
		}

		.search-btn {
			background-color: #2492F2;
			color: #FFFFFF;
			font-size: 26rpx;
			padding: 0 24rpx;
			height: 56rpx;
			line-height: 56rpx;
			border-radius: 28rpx;
			flex-shrink: 0;
		}
	}
}

.store-list {
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;

		.empty-text {
			font-size: 28rpx;
			color: #999;
		}
	}

	.store-items {
		.store-item {
			background-color: #FFFFFF;
			border-radius: 12rpx;
			padding: 30rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

			.store-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;

				.store-name {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
				}

				.store-time {
					font-size: 24rpx;
					color: #999;
				}
			}

			.store-content {
				display: flex;
				margin-bottom: 20rpx;

				.store-image-wrapper {
					width: 160rpx;
					height: 160rpx;
					margin-right: 20rpx;
					flex-shrink: 0;

					.store-image {
						width: 100%;
						height: 100%;
						border-radius: 8rpx;
					}
				}

				.store-info {
					flex: 1;
					display: flex;
					flex-direction: column;
					justify-content: space-between;

					.address-info {
						.area-text {
							font-size: 24rpx;
							color: #999;
							display: block;
							margin-bottom: 8rpx;
						}

						.address-text {
							font-size: 28rpx;
							color: #666;
							display: block;
							margin-bottom: 10rpx;
						}
					}

					.contact-info {
						.contact-text {
							font-size: 26rpx;
							color: #666;
						}
					}

					.sn-mac-info {
						.sn-mac-text {
							font-size: 24rpx;
							color: #2492F2;
							background-color: rgba(36, 146, 242, 0.1);
							padding: 4rpx 12rpx;
							border-radius: 20rpx;
							display: inline-block;
						}
					}
				}
			}

			.store-footer {
				display: flex;
				justify-content: flex-end;

				.action-btn {
					background-color: #2492F2;
					color: #FFFFFF;
					font-size: 28rpx;
					padding: 10rpx 40rpx;
					border-radius: 30rpx;
				}
			}
		}
	}
}
</style>
