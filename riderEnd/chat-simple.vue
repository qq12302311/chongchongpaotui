<template>
	<view class="chat-page">
		<!-- 自定义导航栏 -->
		<nav-bar :title="'聊天室 - Room ' + roomId" title-align="center"></nav-bar>

		<!-- 内容区域 -->
		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 连接状态 -->
			<view class="status-bar" :class="connectionStatus">
				<text>{{ getStatusText() }}</text>
				<button v-if="connectionStatus === 'error'" @click="reconnect" class="retry-btn">重试</button>
			</view>

			<!-- 聊天消息区域 -->
			<scroll-view 
				class="chat-box" 
				scroll-y 
				:scroll-top="scrollTop" 
				:scroll-with-animation="true">
				<view 
					v-for="(msg, index) in messages" 
					:key="index" 
					class="message" 
					:class="msg.type">
					<view class="message-content">
						<text class="sender">{{ msg.sender }}:</text> {{ msg.message }}
					</view>
					<view class="message-time">{{ formatTime(msg.timestamp) }}</view>
				</view>
			</scroll-view>

			<!-- 输入区域 -->
			<view class="input-area">
				<input 
					type="text" 
					v-model="messageInput" 
					placeholder="输入消息..." 
					class="message-input"
					@confirm="sendMessage"
					confirm-type="send" />
				<button class="send-btn" @click="sendMessage" :disabled="connectionStatus !== 'connected'">发送</button>
			</view>
		</view>
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
				navBarHeight: 88,
				roomId: '',
				user: {
					id: '',
					name: '',
					room_id: ''
				},
				messages: [],
				messageInput: '',
				scrollTop: 0,
				connectionStatus: 'disconnected', // disconnected, connecting, connected, error
				socketTask: null,
				reconnectCount: 0,
				maxReconnect: 3,
				websocketurl: '',
			}
		},
		onLoad(options) {
			// 计算导航栏高度
			const systemInfo = uni.getSystemInfoSync()
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			this.navBarHeight = menuButtonInfo.bottom + 12

			// 获取参数
			this.roomId = options.roomId || '1040'
			
			// 获取用户信息
			const riderUserInfo = uni.getStorageSync('riderUserInfo')
			this.user = {
				id: riderUserInfo.id || 'rider_' + Date.now(),
				name: riderUserInfo.name || riderUserInfo.phone || '骑手',
				room_id: this.roomId
			}

			// 先获取历史聊天记录
			this.getChat()

			// 连接WebSocket
			// this.connectWebSocket()
		},
		onUnload() {
			this.closeWebSocket()
		},
		methods: {
			// 连接WebSocket
			connectWebSocket() {
				this.connectionStatus = 'connecting'
				
				const url = this.websocketurl + `?room_id=${encodeURIComponent(this.roomId)}`
				console.log('连接WebSocket:', url)

				this.socketTask = uni.connectSocket({
					url: url,
					complete: () => {}
				})

				this.socketTask.onOpen((res) => {
					console.log('WebSocket连接已打开', res)
					this.connectionStatus = 'connected'
					this.reconnectCount = 0
					this.addMessage('系统', `已连接到聊天室 ${this.roomId}`, 'system')
				})

				this.socketTask.onMessage((res) => {
					console.log('收到消息:', res.data)
					try {
						const data = JSON.parse(res.data)
						if (data.user_id !== this.user.id) {
							this.addMessage(data.name || '用户', data.message, 'other')
						}
					} catch (e) {
						console.error('解析消息失败:', e)
						this.addMessage('系统', res.data, 'system')
					}
				})

				this.socketTask.onClose((res) => {
					console.log('WebSocket连接关闭', res)
					this.connectionStatus = 'disconnected'
					this.addMessage('系统', '连接已断开', 'system')
					
					// 自动重连
					if (this.reconnectCount < this.maxReconnect) {
						setTimeout(() => {
							this.reconnect()
						}, 3000)
					}
				})

				this.socketTask.onError((res) => {
					console.error('WebSocket连接错误', res)
					this.connectionStatus = 'error'
					this.addMessage('系统', '连接失败，请检查网络', 'system')
				})
			},

			// 关闭WebSocket
			closeWebSocket() {
				if (this.socketTask) {
					this.socketTask.close()
					this.socketTask = null
				}
			},

			// 重连
			reconnect() {
				this.reconnectCount++
				this.addMessage('系统', `正在重连... (${this.reconnectCount}/${this.maxReconnect})`, 'system')
				this.closeWebSocket()
				setTimeout(() => {
					this.connectWebSocket()
				}, 1000)
			},

			// 发送消息
			sendMessage() {
				const message = this.messageInput.trim()
				if (!message) return

				if (this.connectionStatus !== 'connected') {
					uni.showToast({
						title: '连接已断开',
						icon: 'none'
					})
					return
				}

				const payload = {
					name: this.user.name,
					user_id: this.user.id,
					room_id: this.roomId,
					message: message,
					timestamp: Date.now()
				}

				// 先显示自己的消息
				this.addMessage('我', message, 'self')

				// 发送到服务器
				this.socketTask.send({
					data: JSON.stringify(payload),
					success: () => {
						console.log('消息发送成功')
					},
					fail: (err) => {
						console.error('消息发送失败:', err)
						uni.showToast({
							title: '发送失败',
							icon: 'none'
						})
					}
				})

				this.messageInput = ''
			},

			// 添加消息
			addMessage(sender, message, type) {
				this.messages.push({
					sender,
					message,
					type,
					timestamp: Date.now()
				})
				
				this.$nextTick(() => {
					this.scrollToBottom()
				})
			},

			// 滚动到底部
			scrollToBottom() {
				this.scrollTop = this.messages.length * 100
			},

			// 获取状态文本
			getStatusText() {
				switch (this.connectionStatus) {
					case 'connecting': return '正在连接...'
					case 'connected': return '已连接'
					case 'disconnected': return '连接断开'
					case 'error': return '连接失败'
					default: return '未知状态'
				}
			},

			// 格式化时间
			formatTime(timestamp) {
				const date = new Date(timestamp)
				return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
			},

			// 获取聊天记录
			async getChat() {
				const res = await uni.request({
					url: `https://ccpt.0871.cn/api/chat`,
					method: 'POST',
					data: {
						room_id: this.roomId,
						user_id: this.user.id,
						messageable_type : "user",
						timestamp: Date.now(),
						sign: 'chongchong'
					},
					header: {
						'Content-Type': 'application/json'
					}
				})
				
				console.log(res)

				if (res.data.websocket_url) {
					this.websocketurl = res.data.websocket_url
					this.connectWebSocket()
					// 滚动到底部
					this.$nextTick(() => {
						this.scrollToBottom()
					})
				} else {
					console.log('获取聊天记录失败:', res.data.message || '未知错误')
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.chat-page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f5f5f5;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 20rpx;
		width: 100%;
		box-sizing: border-box;
		overflow-x: hidden;
	}

	.status-bar {
		padding: 16rpx 20rpx;
		border-radius: 8rpx;
		margin-bottom: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		&.connecting {
			background-color: #fff3cd;
			color: #856404;
		}
		
		&.connected {
			background-color: #d4edda;
			color: #155724;
		}
		
		&.disconnected, &.error {
			background-color: #f8d7da;
			color: #721c24;
		}
		
		.retry-btn {
			padding: 8rpx 16rpx;
			background-color: #007bff;
			color: white;
			border: none;
			border-radius: 4rpx;
			font-size: 24rpx;
		}
	}

	.chat-box {
		flex: 1;
		background-color: white;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		width: 100%;
		box-sizing: border-box;
		overflow-x: hidden;
	}

	.message {
		margin-bottom: 20rpx;
		width: 100%;
		box-sizing: border-box;

		&.self {
			display: flex;
			flex-direction: column;
			align-items: flex-end;

			.message-content {
				background-color: #007bff;
				color: white;
				padding: 12rpx 16rpx;
				border-radius: 18rpx;
				max-width: 70%;
				word-wrap: break-word;
				word-break: break-all;
				white-space: pre-wrap;
				box-sizing: border-box;
			}

			.message-time {
				text-align: right;
			}
		}

		&.other {
			display: flex;
			flex-direction: column;
			align-items: flex-start;

			.message-content {
				background-color: #e9ecef;
				color: #333;
				padding: 12rpx 16rpx;
				border-radius: 18rpx;
				max-width: 70%;
				word-wrap: break-word;
				word-break: break-all;
				white-space: pre-wrap;
				box-sizing: border-box;
			}

			.message-time {
				text-align: left;
			}
		}

		&.system {
			display: flex;
			flex-direction: column;
			align-items: center;

			.message-content {
				background-color: #f8f9fa;
				color: #6c757d;
				padding: 8rpx 12rpx;
				border-radius: 12rpx;
				font-size: 24rpx;
				max-width: 80%;
				word-wrap: break-word;
				word-break: break-all;
				white-space: pre-wrap;
				box-sizing: border-box;
				text-align: center;
			}
		}

		.message-time {
			font-size: 20rpx;
			color: #999;
			margin-top: 8rpx;
		}
	}

	.input-area {
		display: flex;
		gap: 16rpx;
		
		.message-input {
			flex: 1;
			padding: 16rpx 20rpx;
			border: 1rpx solid #ddd;
			border-radius: 24rpx;
			background-color: white;
		}
		
		.send-btn {
			padding: 16rpx 32rpx;
			background-color: #007bff;
			color: white;
			border: none;
			border-radius: 24rpx;
			
			&:disabled {
				background-color: #ccc;
			}
		}
	}
</style>
