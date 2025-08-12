<template>
	<view class="chat-list-page">
		<!-- 自定义导航栏 -->
		<nav-bar title="对话列表" title-align="center"></nav-bar>

		<!-- 内容区域 -->
		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 搜索框 -->
			<view class="search-section">
				<view class="search-box">
					<image src="https://ccpt.qiniu.0871.cn/search.svg" class="search-icon"></image>
					<input 
						type="text" 
						v-model="searchKeyword" 
						placeholder="搜索聊天记录..." 
						class="search-input"
						@input="onSearch" />
				</view>
			</view>

			<!-- 聊天列表 -->
			<view class="chat-list">
				<view 
					v-for="(chat, index) in filteredChatList" 
					:key="chat.room_id" 
					class="chat-item"
					@click="enterChat(chat)">
					
					<!-- 头像 -->
					<view class="avatar">
						<image :src="chat.avatar || defaultAvatar" class="avatar-img"></image>
						<view v-if="chat.unread_count > 0" class="unread-badge">
							<text class="unread-text">{{ chat.unread_count > 99 ? '99+' : chat.unread_count }}</text>
						</view>
					</view>

					<!-- 聊天信息 -->
					<view class="chat-info">
						<view class="chat-header">
							<text class="chat-title">{{ chat.title || `聊天室 ${chat.room_id}` }}</text>
							<text class="chat-time">{{ formatTime(chat.last_message_time) }}</text>
						</view>
						<view class="chat-preview">
							<text class="last-message">{{ chat.last_message || '暂无消息' }}</text>
						</view>
					</view>

					<!-- 右侧箭头 -->
					<view class="arrow">
						<text class="arrow-icon">></text>
					</view>
				</view>

				<!-- 空状态 -->
				<view v-if="filteredChatList.length === 0" class="empty-state">
					<image src="https://ccpt.qiniu.0871.cn/empty-chat.svg" class="empty-icon"></image>
					<text class="empty-text">{{ searchKeyword ? '没有找到相关聊天记录' : '暂无聊天记录' }}</text>
				</view>
			</view>
		</view>

		<!-- 底部导航 -->
		<tab-bar></tab-bar>
	</view>
</template>

<script>
	import NavBar from '@/components/NavBar.vue'
	import TabBar from '@/components/tab-bar/tab-bar.vue'

	export default {
		components: {
			NavBar,
			TabBar
		},
		data() {
			return {
				navBarHeight: 88,
				searchKeyword: '',
				chatList: [],
				defaultAvatar: 'https://ccpt.qiniu.0871.cn/default-avatar.png'
			}
		},
		computed: {
			filteredChatList() {
				if (!this.searchKeyword) {
					return this.chatList
				}
				return this.chatList.filter(chat => {
					return chat.title.includes(this.searchKeyword) || 
						   chat.last_message.includes(this.searchKeyword)
				})
			}
		},
		onLoad() {
			// 计算导航栏高度
			const systemInfo = uni.getSystemInfoSync()
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			this.navBarHeight = menuButtonInfo.bottom + 12

			// 加载聊天列表
			this.loadChatList()
		},
		onShow() {
			// 每次显示页面时刷新聊天列表
			this.loadChatList()
		},
		methods: {
			// 加载聊天列表
			async loadChatList() {
				try {
					// 获取用户信息
					const userInfo = uni.getStorageSync('userInfo') || uni.getStorageSync('riderUserInfo')
					if (!userInfo) {
						console.log('用户未登录')
						return
					}

					const res = await uni.request({
						url: 'https://ccpt.0871.cn/api/chat/list',
						method: 'GET',
						data: {
							user_id: userInfo.id
						},
						header: {
							'Content-Type': 'application/json'
						}
					})

					if (res.statusCode === 200 && res.data.code === 200) {
						this.chatList = res.data.data || []
						console.log('聊天列表加载成功:', this.chatList.length, '个聊天室')
					} else {
						console.log('获取聊天列表失败:', res.data.message)
						// 使用模拟数据
						this.loadMockData()
					}
				} catch (error) {
					console.error('加载聊天列表出错:', error)
					// 使用模拟数据
					this.loadMockData()
				}
			},

			// 加载模拟数据
			loadMockData() {
				this.chatList = [
					{
						room_id: '1040',
						title: '订单 #1040 聊天室',
						last_message: '订单已完成，感谢您的服务！',
						last_message_time: Date.now() - 1000 * 60 * 30, // 30分钟前
						unread_count: 2,
						avatar: 'https://ccpt.qiniu.0871.cn/avatar1.png'
					},
					{
						room_id: '1039',
						title: '订单 #1039 聊天室',
						last_message: '骑手正在路上，请稍等',
						last_message_time: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
						unread_count: 0,
						avatar: 'https://ccpt.qiniu.0871.cn/avatar2.png'
					},
					{
						room_id: '1038',
						title: '订单 #1038 聊天室',
						last_message: '已到达门店，正在处理',
						last_message_time: Date.now() - 1000 * 60 * 60 * 24, // 1天前
						unread_count: 1,
						avatar: 'https://ccpt.qiniu.0871.cn/avatar3.png'
					}
				]
			},

			// 搜索
			onSearch() {
				// 搜索逻辑已在computed中处理
			},

			// 进入聊天室
			enterChat(chat) {
				uni.navigateTo({
					url: `/riderEnd/chat-simple?roomId=${chat.room_id}`
				})
			},

			// 格式化时间
			formatTime(timestamp) {
				if (!timestamp) return ''
				
				const now = Date.now()
				const diff = now - timestamp
				const date = new Date(timestamp)
				
				if (diff < 1000 * 60) {
					return '刚刚'
				} else if (diff < 1000 * 60 * 60) {
					return `${Math.floor(diff / (1000 * 60))}分钟前`
				} else if (diff < 1000 * 60 * 60 * 24) {
					return `${Math.floor(diff / (1000 * 60 * 60))}小时前`
				} else if (diff < 1000 * 60 * 60 * 24 * 7) {
					return `${Math.floor(diff / (1000 * 60 * 60 * 24))}天前`
				} else {
					return `${date.getMonth() + 1}/${date.getDate()}`
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.chat-list-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 120rpx; // 为底部导航留出空间
	}

	.content {
		padding: 0 20rpx;
	}

	.search-section {
		padding: 20rpx 0;
		
		.search-box {
			background-color: #fff;
			border-radius: 24rpx;
			padding: 16rpx 20rpx;
			display: flex;
			align-items: center;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
			
			.search-icon {
				width: 32rpx;
				height: 32rpx;
				margin-right: 16rpx;
			}
			
			.search-input {
				flex: 1;
				font-size: 28rpx;
				color: #333;
			}
		}
	}

	.chat-list {
		.chat-item {
			background-color: #fff;
			margin-bottom: 16rpx;
			border-radius: 12rpx;
			padding: 24rpx 20rpx;
			display: flex;
			align-items: center;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
			
			.avatar {
				position: relative;
				margin-right: 20rpx;
				
				.avatar-img {
					width: 88rpx;
					height: 88rpx;
					border-radius: 50%;
					background-color: #f0f0f0;
				}
				
				.unread-badge {
					position: absolute;
					top: -8rpx;
					right: -8rpx;
					background-color: #ff4d4f;
					border-radius: 20rpx;
					min-width: 32rpx;
					height: 32rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					
					.unread-text {
						color: #fff;
						font-size: 20rpx;
						padding: 0 8rpx;
					}
				}
			}
			
			.chat-info {
				flex: 1;
				
				.chat-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 8rpx;
					
					.chat-title {
						font-size: 32rpx;
						font-weight: 500;
						color: #333;
					}
					
					.chat-time {
						font-size: 24rpx;
						color: #999;
					}
				}
				
				.chat-preview {
					.last-message {
						font-size: 28rpx;
						color: #666;
						display: -webkit-box;
						-webkit-line-clamp: 1;
						-webkit-box-orient: vertical;
						overflow: hidden;
					}
				}
			}
			
			.arrow {
				margin-left: 16rpx;
				
				.arrow-icon {
					font-size: 28rpx;
					color: #ccc;
				}
			}
		}
	}

	.empty-state {
		text-align: center;
		padding: 120rpx 40rpx;
		
		.empty-icon {
			width: 160rpx;
			height: 160rpx;
			margin-bottom: 32rpx;
		}
		
		.empty-text {
			font-size: 28rpx;
			color: #999;
		}
	}
</style>
