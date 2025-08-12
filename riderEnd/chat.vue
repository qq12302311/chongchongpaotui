<template>
	<view class="chat-page">
		<!-- 自定义导航栏 -->
		<nav-bar :title="'聊天室 - Room ' + roomId" title-align="center"></nav-bar>

		<!-- 内容区域 -->
		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 聊天消息区域 -->
			<scroll-view 
				class="chat-box" 
				scroll-y 
				:scroll-top="scrollTop" 
				:scroll-with-animation="true"
				:style="{ height: chatBoxHeight + 'px' }">
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
			<view class="input-area" :style="{ bottom: safeAreaBottom + 'px' }">
				<input 
					type="text" 
					v-model="messageInput" 
					placeholder="输入消息..." 
					class="message-input"
					@confirm="sendMessage"
					confirm-type="send" />
				<button class="send-btn" @click="sendMessage">发送</button>
			</view>
		</view>

		<!-- 连接状态提示 -->
		<view v-if="connectionStatus !== 'connected'" class="connection-status">
			<text>{{ getConnectionStatusText() }}</text>
			<button v-if="connectionStatus === 'error' || connectionStatus === 'disconnected'"
				class="reconnect-btn" @click="manualReconnect">重连</button>
			<button v-if="connectionStatus === 'error'"
				class="reconnect-btn" @click="testConnection">测试连接</button>
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
				navBarHeight: 0,
				safeAreaBottom: 0,
				chatBoxHeight: 0,
				roomId: '',
				user: {
					id: '',
					name: '',
					room_id: ''
				},
				messages: [],
				messageInput: '',
				scrollTop: 0,
				socket: null,
				connectionStatus: 'disconnected', // disconnected, connecting, connected, error
				websocketUrl: '',
				reconnectAttempts: 0,
				maxReconnectAttempts: 5,
				reconnectTimer: null,
				useHttpFallback: false, // 是否使用HTTP轮询作为备用方案
				httpPollingTimer: null,
				lastMessageId: 0
			}
		},
		onLoad(options) {
			// 计算导航栏高度和底部安全区域
			const systemInfo = uni.getSystemInfoSync()
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			this.navBarHeight = menuButtonInfo.bottom + 12

			// 计算底部安全区域高度
			if (systemInfo.safeArea) {
				const safeAreaBottom = systemInfo.screenHeight - systemInfo.safeArea.bottom
				this.safeAreaBottom = safeAreaBottom > 0 ? safeAreaBottom : 0
			}

			// 计算聊天框高度
			this.chatBoxHeight = systemInfo.windowHeight - this.navBarHeight - 120 - this.safeAreaBottom

			// 获取参数
			this.roomId = options.roomId || ''
			
			// 获取用户信息
			const riderUserInfo = uni.getStorageSync('riderUserInfo')
			if (riderUserInfo) {
				this.user = {
					id: riderUserInfo.id,
					name: riderUserInfo.name || riderUserInfo.phone,
					room_id: this.roomId
				}
			}

			// 设置 WebSocket URL - 请根据实际服务器地址修改
			// 开发环境
			// this.websocketUrl = `ws://localhost:8080/chat?room_id=${encodeURIComponent(this.roomId)}`
			// 生产环境
			this.websocketUrl = `wss://ccpt.0871.cn/api/chat?room_id=${encodeURIComponent(this.roomId)}`

			// 连接 WebSocket
			this.connectWebSocket()
		},
		onUnload() {
			// 页面卸载时关闭 WebSocket 连接和HTTP轮询
			this.closeWebSocket()
			this.stopHttpPolling()
		},
		methods: {
			// 连接 WebSocket
			connectWebSocket() {
				if (this.socket) {
					uni.closeSocket()
				}

				this.connectionStatus = 'connecting'

				console.log('尝试连接WebSocket:', this.websocketUrl)

				// 小程序中使用 uni.connectSocket
				uni.connectSocket({
					url: this.websocketUrl,
					protocols: [], // 协议数组，可以为空
					success: (res) => {
						console.log('WebSocket 连接请求发送成功:', res)
					},
					fail: (err) => {
						console.error('WebSocket 连接请求失败:', err)
						this.connectionStatus = 'error'
						this.appendMessage("系统", `连接失败: ${err.errMsg || '未知错误'}`, 'other')
						this.handleReconnect()
					}
				})

				// 监听 WebSocket 连接打开
				uni.onSocketOpen((res) => {
					console.log('WebSocket 连接已打开:', res)
					this.connectionStatus = 'connected'
					this.reconnectAttempts = 0
					this.appendMessage("系统", `已连接聊天室：${this.roomId}`, 'other')
				})

				// 监听 WebSocket 接收消息
				uni.onSocketMessage((res) => {
					console.log('收到WebSocket消息:', res)
					try {
						const data = JSON.parse(res.data)
						if (data.user_id === this.user.id) {
							// 自己发送的消息不重复显示，因为发送时已经显示了
							return
						} else {
							this.appendMessage(data.name || '未知用户', data.message, 'other')
						}
					} catch (e) {
						console.error("消息解析失败:", res.data, e)
						// 如果不是JSON格式，直接显示原始消息
						this.appendMessage("系统", res.data, 'other')
					}
				})

				// 监听 WebSocket 连接关闭
				uni.onSocketClose((res) => {
					console.log('WebSocket 连接已关闭:', res)
					this.connectionStatus = 'disconnected'
					this.appendMessage("系统", "已断开连接", 'other')
					this.handleReconnect()
				})

				// 监听 WebSocket 错误
				uni.onSocketError((err) => {
					console.error('WebSocket 错误:', err)
					this.connectionStatus = 'error'
					this.appendMessage("系统", `连接出错: ${err.errMsg || '未知错误'}`, 'other')
					this.handleReconnect()
				})
			},

			// 关闭 WebSocket 连接
			closeWebSocket() {
				if (this.reconnectTimer) {
					clearTimeout(this.reconnectTimer)
					this.reconnectTimer = null
				}
				
				if (this.socket) {
					uni.closeSocket()
					this.socket = null
				}
			},

			// 处理重连
			handleReconnect() {
				if (this.useHttpFallback) return // 如果已经在使用HTTP轮询，不再重连WebSocket

				if (this.reconnectAttempts < this.maxReconnectAttempts) {
					this.reconnectAttempts++
					this.appendMessage("系统", `正在尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, 'other')

					this.reconnectTimer = setTimeout(() => {
						this.connectWebSocket()
					}, 3000 * this.reconnectAttempts) // 递增延迟
				} else {
					this.appendMessage("系统", "WebSocket连接失败，切换到HTTP模式", 'other')
					// WebSocket连接失败后，启动HTTP轮询作为备用方案
					this.startHttpPolling()
				}
			},

			// 发送消息
			sendMessage() {
				const message = this.messageInput.trim()
				if (!message) {
					uni.showToast({
						title: '请输入消息内容',
						icon: 'none'
					})
					return
				}

				if (this.connectionStatus !== 'connected') {
					uni.showToast({
						title: '连接已断开，请稍后重试',
						icon: 'none'
					})
					return
				}

				const payload = {
					name: this.user.name,
					user_id: this.user.id,
					room_id: this.user.room_id,
					message: message,
					timestamp: new Date().getTime()
				}

				console.log('发送消息:', payload)

				// 先在本地显示消息
				this.appendMessage("我", message, 'self')

				// 根据连接方式发送消息
				if (this.useHttpFallback) {
					// 使用HTTP方式发送
					this.sendMessageHttp(message)
				} else {
					// 使用WebSocket发送
					uni.sendSocketMessage({
						data: JSON.stringify(payload),
						success: (res) => {
							console.log('消息发送成功:', res)
						},
						fail: (err) => {
							console.error('发送消息失败:', err)
							uni.showToast({
								title: `发送失败: ${err.errMsg || '未知错误'}`,
								icon: 'none'
							})
							// 发送失败时，可以考虑移除刚添加的消息或标记为失败
							this.appendMessage("系统", "消息发送失败", 'other')
						}
					})
				}

				this.messageInput = ''
			},

			// 添加消息到聊天框
			appendMessage(sender, message, type) {
				this.messages.push({
					sender: sender,
					message: message,
					type: type,
					timestamp: new Date().getTime()
				})

				// 滚动到底部
				this.$nextTick(() => {
					this.scrollToBottom()
				})
			},

			// 滚动到底部
			scrollToBottom() {
				this.scrollTop = this.messages.length * 100 // 估算高度
			},

			// 获取连接状态文本
			getConnectionStatusText() {
				switch (this.connectionStatus) {
					case 'connecting':
						return '正在连接...'
					case 'disconnected':
						return '连接已断开'
					case 'error':
						return '连接错误'
					default:
						return ''
				}
			},

			// 格式化时间
			formatTime(timestamp) {
				const date = new Date(timestamp)
				const hours = String(date.getHours()).padStart(2, '0')
				const minutes = String(date.getMinutes()).padStart(2, '0')
				return `${hours}:${minutes}`
			},

			// 手动重连
			manualReconnect() {
				this.reconnectAttempts = 0
				this.useHttpFallback = false
				this.stopHttpPolling()
				this.connectWebSocket()
			},

			// 启动HTTP轮询作为备用方案
			startHttpPolling() {
				if (this.httpPollingTimer) return

				this.useHttpFallback = true
				this.connectionStatus = 'connected' // 标记为已连接状态
				this.appendMessage("系统", "使用HTTP轮询模式连接聊天室", 'other')

				// 每3秒轮询一次新消息
				this.httpPollingTimer = setInterval(() => {
					this.fetchMessages()
				}, 3000)
			},

			// 停止HTTP轮询
			stopHttpPolling() {
				if (this.httpPollingTimer) {
					clearInterval(this.httpPollingTimer)
					this.httpPollingTimer = null
				}
			},

			// 获取消息（HTTP方式）
			async fetchMessages() {
				try {
					const res = await this.$request('chat/messages', {
						room_id: this.roomId,
						last_message_id: this.lastMessageId,
						user_id: this.user.id
					}, 'GET')

					if (res.code === 200 && res.data && res.data.length > 0) {
						res.data.forEach(msg => {
							if (msg.user_id !== this.user.id) {
								this.appendMessage(msg.name || '未知用户', msg.message, 'other')
							}
							this.lastMessageId = Math.max(this.lastMessageId, msg.id || 0)
						})
					}
				} catch (error) {
					console.error('获取消息失败:', error)
				}
			},

			// 发送消息（HTTP方式）
			async sendMessageHttp(message) {
				try {
					const res = await this.$request('chat/send', {
						room_id: this.roomId,
						user_id: this.user.id,
						name: this.user.name,
						message: message
					}, 'POST')

					if (res.code === 200) {
						console.log('HTTP消息发送成功')
					} else {
						throw new Error(res.message || '发送失败')
					}
				} catch (error) {
					console.error('HTTP发送消息失败:', error)
					uni.showToast({
						title: '发送失败',
						icon: 'none'
					})
				}
			},

			// 测试连接
			testConnection() {
				this.appendMessage("系统", `正在测试连接到: ${this.websocketUrl}`, 'other')

				// 测试网络连接
				uni.request({
					url: 'https://ccpt.0871.cn/api/test',
					method: 'GET',
					timeout: 5000,
					success: (res) => {
						this.appendMessage("系统", "网络连接正常", 'other')
						this.appendMessage("系统", "建议检查WebSocket服务器状态或使用HTTP模式", 'other')
					},
					fail: (err) => {
						this.appendMessage("系统", `网络连接失败: ${err.errMsg}`, 'other')
						this.appendMessage("系统", "请检查网络连接", 'other')
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.chat-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.chat-box {
		flex: 1;
		padding: 20rpx;
		background-color: #fff;
		margin: 20rpx;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

		.message {
			margin: 10rpx 0;
			padding: 16rpx;
			border-radius: 8rpx;
			max-width: 80%;
			word-wrap: break-word;

			&.self {
				margin-left: auto;
				background-color: #2492F2;
				color: #fff;
				text-align: right;

				.sender {
					color: #e6f7ff;
				}

				.message-time {
					color: #e6f7ff;
				}
			}

			&.other {
				margin-right: auto;
				background-color: #f0f0f0;
				color: #333;

				.sender {
					color: #666;
				}

				.message-time {
					color: #999;
				}
			}

			.message-content {
				font-size: 28rpx;
				line-height: 1.4;
				margin-bottom: 8rpx;

				.sender {
					font-weight: 500;
					margin-right: 8rpx;
				}
			}

			.message-time {
				font-size: 20rpx;
				opacity: 0.8;
			}
		}
	}

	.input-area {
		position: fixed;
		left: 0;
		right: 0;
		background-color: #fff;
		padding: 20rpx;
		display: flex;
		align-items: center;
		border-top: 1rpx solid #eee;
		box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);

		.message-input {
			flex: 1;
			height: 80rpx;
			border: 1rpx solid #e0e0e0;
			border-radius: 40rpx;
			padding: 0 24rpx;
			font-size: 28rpx;
			margin-right: 20rpx;
		}

		.send-btn {
			width: 120rpx;
			height: 80rpx;
			background-color: #2492F2;
			color: #fff;
			border-radius: 40rpx;
			font-size: 28rpx;
			border: none;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.connection-status {
		position: fixed;
		top: 200rpx;
		left: 50%;
		transform: translateX(-50%);
		background-color: rgba(0, 0, 0, 0.7);
		color: #fff;
		padding: 16rpx 32rpx;
		border-radius: 40rpx;
		font-size: 24rpx;
		z-index: 1000;
		display: flex;
		align-items: center;
		gap: 16rpx;

		.reconnect-btn {
			background-color: #2492F2;
			color: #fff;
			border: none;
			padding: 8rpx 16rpx;
			border-radius: 20rpx;
			font-size: 20rpx;
		}
	}
</style>
