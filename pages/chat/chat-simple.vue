<template>
	<view class="chat-page">
		<!-- 自定义导航栏 -->
		<nav-bar :title="title+' 订单协办群'" title-align="center"></nav-bar>

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
					<!-- 系统消息 -->
					<template v-if="msg.type === 'system'">
						<view class="message-content">
							<text>{{ msg.message }}</text>
						</view>
						<view class="message-time">{{ formatTime(msg.timestamp) }}</view>
					</template>

					<!-- 普通消息 -->
					<template v-else>
						<view class="message-wrapper">
							<view class="avatar">
								<image :src="msg.avatar || getDefaultAvatar(msg.type)" class="avatar-img" mode="aspectFill"></image>
							</view>
							<view class="message-info">
								<!-- <view class="sender-name">{{ msg.sender }}</view> -->
								<view class="message-content">
									<text>{{ msg.message }}</text>
								</view>
							</view>
						</view>
						<view class="message-time">{{ formatTime(msg.timestamp) }}</view>
					</template>
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

			<!-- 快捷回复区域 -->
			<view class="quick-reply-area">
				<view class="quick-reply-header">
					<image src="https://ccpt.qiniu.cc111.cn/publish/bi.png" class="header-icon"></image>
					<text class="header-text">快捷回复</text>
				</view>
				<view class="quick-reply-list">
					<view 
						v-for="(item, index) in quickReplies" 
						:key="index" 
						class="quick-reply-item" 
						@click="selectQuickReply(item)">
						<text>{{ item }}</text>
					</view>
				</view>
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
				heartbeatTimer: null,
				heartbeatInterval: 30000, // 30秒心跳间隔,
				websocketurl: '',
				user_type: '',
				user_id: '',
				title: '订单协办',
				// 敏感词列表
				sensitiveWords: [
					'微', '微信', '薇薇', '薇信', '手机', '电话', '电话号', '手机号', 'v', 'vx',
					'加', '加我', '转钱'
				],
				// 手机号码正则表达式
				phoneRegex: /1[3-9]\d{9}/g,
				// 快捷回复列表
				quickReplies: [
					'您好！请问我的订单什么时候去完成？',
					'定位不太准，poi对的可以搜索导航前往！',
					'订单有特别要求，请小哥注意查看备注哦！',
					'请在订单说明的作业时段上门，以免空跑'
				]
			}
		},
		onLoad(options) {
			// 计算导航栏高度
			const systemInfo = uni.getSystemInfoSync()
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			this.navBarHeight = menuButtonInfo.bottom + 12

			// 获取参数
			this.roomId = options.roomId || '1040'
			this.title = options.title ? decodeURIComponent(options.title) : '订单协办'
			
			// 获取用户信息
			const userInfo = uni.getStorageSync('userInfo')
			this.user = {
				id: userInfo.user_id,
				name: userInfo.name || userInfo.phone || '用户',
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
		onHide() {
			// 页面隐藏时停止心跳，但不关闭连接
			this.stopHeartbeat()
		},
		onShow() {
			// 页面显示时恢复心跳
			// if (this.connectionStatus === 'connected') {
			// 	this.startHeartbeat()
			// }
		},
		methods: {
			// 选择快捷回复
			selectQuickReply(message) {
				this.messageInput = message;
				// 可以选择自动发送或只填充到输入框
				// 如果需要自动发送，取消下面这行的注释
				// this.sendMessage();
			},

			// 敏感词过滤方法
			filterSensitiveWords(message) {
				// 检查手机号码
				const phoneMatches = message.match(this.phoneRegex)
				if (phoneMatches && phoneMatches.length > 0) {
					// 发现手机号码，撤回消息
					uni.showToast({
						title: '检测到手机号码，消息已撤回',
						icon: 'none',
						duration: 2000
					})
					return null // 返回null表示消息被撤回
				}

				// 检查普通敏感词
				for (let word of this.sensitiveWords) {
					// 不区分大小写的检查
					const regex = new RegExp(word, 'gi')
					if (regex.test(message)) {
						// 发现敏感词，撤回消息
						uni.showToast({
							title: '检测到敏感词汇，消息已撤回',
							icon: 'none',
							duration: 2000
						})
						return null // 返回null表示消息被撤回
					}
				}

				return message // 没有敏感词，返回原消息
			},

			// 连接WebSocket
			connectWebSocket() {
				this.connectionStatus = 'connecting'

				const url = this.websocketurl + `?room_id=${encodeURIComponent(this.roomId)}` + `&user_type=` + encodeURIComponent(this.user_type) + `&user_id=` + encodeURIComponent(this.user_id);
				console.log('连接WebSocket:', url)

				this.socketTask = uni.connectSocket({
					url: url,
					protocols: [],
					success: (res) => {
						console.log('WebSocket连接请求成功:', res)
					},
					fail: (err) => {
						console.error('WebSocket连接请求失败:', err)
						this.connectionStatus = 'error'
						this.addMessage('系统', '连接失败，请检查网络', 'system')
					}
				})

				this.socketTask.onOpen((res) => {
					console.log('WebSocket连接已打开', res)
					this.connectionStatus = 'connected'
					this.reconnectCount = 0
					this.addMessage('系统', `欢迎大家进入订单协办临时群（三方）！为保障各方权益，不得私留联系方式！业务沟通仅限本群进行，三方参与！感谢大家理解与配合！`, 'system')

					// 启动心跳
					// this.startHeartbeat()
				})

				this.socketTask.onMessage((res) => {
					console.log('收到消息:', res.data)
					try {
						const data = JSON.parse(res.data)

						// 过滤心跳消息
						if (data.type === 'heartbeat') {
							return
						}

						// 过滤自己发送的消息
						if (data.user_id !== this.user.id) {
							// 创建消息对象，处理时间戳
							const timestamp = data.timestamp ?
								(data.timestamp < 10000000000 ? data.timestamp : Math.floor(data.timestamp / 1000)) :
								Math.floor(Date.now() / 1000)

							this.messages.push({
								sender: data.name || '用户',
								message: data.message,
								type: 'other',
								avatar: data.avatar || null,
								timestamp: timestamp
							})

							this.$nextTick(() => {
								this.scrollToBottom()
							})
						}
					} catch (e) {
						console.error('解析消息失败:', e)
						// 如果不是JSON格式，可能是服务器的其他消息
						if (res.data !== 'pong') { // 过滤pong响应
							this.addMessage('系统', res.data, 'system')
						}
					}
				})

				this.socketTask.onClose((res) => {
					console.log('WebSocket连接关闭', res)
					this.connectionStatus = 'disconnected'

					// 检查关闭原因，避免正常关闭时显示错误信息
					if (res.code !== 1000) { // 1000是正常关闭代码
						this.addMessage('系统', `连接已断开 (${res.code}: ${res.reason || '未知原因'})`, 'system')

						// 自动重连
						if (this.reconnectCount < this.maxReconnect) {
							setTimeout(() => {
								this.reconnect()
							}, 3000)
						} else {
							this.addMessage('系统', '重连次数已达上限，请手动重连', 'system')
						}
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
				// 停止心跳
				this.stopHeartbeat()

				if (this.socketTask) {
					this.socketTask.close()
					this.socketTask = null
				}
			},

			// 启动心跳
			// startHeartbeat() {
			// 	this.stopHeartbeat() // 先停止之前的心跳

			// 	this.heartbeatTimer = setInterval(() => {
			// 		if (this.connectionStatus === 'connected' && this.socketTask) {
			// 			try {
			// 				this.socketTask.send({
			// 					data: JSON.stringify({
			// 						type: 'heartbeat',
			// 						timestamp: Math.floor(Date.now() / 1000)
			// 					}),
			// 					fail: (err) => {
			// 						console.error('心跳发送失败:', err)
			// 						this.connectionStatus = 'disconnected'
			// 					}
			// 				})
			// 			} catch (error) {
			// 				console.error('心跳异常:', error)
			// 				this.connectionStatus = 'disconnected'
			// 			}
			// 		}
			// 	}, this.heartbeatInterval)
			// },

			// 停止心跳
			stopHeartbeat() {
				if (this.heartbeatTimer) {
					clearInterval(this.heartbeatTimer)
					this.heartbeatTimer = null
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

				// 应用敏感词检测
				const checkedMessage = this.filterSensitiveWords(message)
				if (checkedMessage === null) {
					// 消息被撤回（包含敏感词或手机号码）
					this.messageInput = '' // 清空输入框
					return
				}

				// 检查连接状态
				if (this.connectionStatus !== 'connected') {
					uni.showToast({
						title: '连接已断开，正在重连...',
						icon: 'none'
					})
					// 尝试重连
					this.reconnect()
					return
				}

				// 检查socketTask是否存在
				if (!this.socketTask) {
					uni.showToast({
						title: '连接异常，正在重连...',
						icon: 'none'
					})
					this.reconnect()
					return
				}

				const payload = {
					name: this.user.name,
					user_id: this.user.id,
					user_type: this.user_type,
					room_id: this.roomId,
					message: checkedMessage, // 使用检查通过的消息
					timestamp: Math.floor(Date.now() / 1000)
				}

				console.log('准备发送消息:', payload)

				// 先显示自己的消息
				const userInfo = uni.getStorageSync('userInfo')
				const selfAvatar = userInfo.avatar || null
				this.addMessage('我', checkedMessage, 'self', selfAvatar)
				this.messageInput = '' // 立即清空输入框

				// 发送到服务器
				try {
					this.socketTask.send({
						data: JSON.stringify(payload),
						success: (res) => {
							console.log('消息发送成功:', res)
						},
						fail: (err) => {
							console.error('消息发送失败:', err)
							uni.showToast({
								title: '发送失败，请重试',
								icon: 'none'
							})
							// 发送失败时，可以考虑重新连接
							if (err.errMsg && err.errMsg.includes('not connected')) {
								this.connectionStatus = 'disconnected'
								this.reconnect()
							}
						}
					})
				} catch (error) {
					console.error('发送消息异常:', error)
					uni.showToast({
						title: '发送异常',
						icon: 'none'
					})
				}
			},

			// 添加消息
			addMessage(sender, message, type, avatar = null) {
				this.messages.push({
					sender,
					message,
					type,
					avatar,
					timestamp: Math.floor(Date.now() / 1000)
				})

				this.$nextTick(() => {
					this.scrollToBottom()
				})
			},

			// 获取默认头像
			getDefaultAvatar(type) {
				if (type === 'self') {
					return 'https://ccpt.qiniu.cc111.cn/duihua/qishou.png'
				} else {
					return 'https://ccpt.qiniu.cc111.cn/112lbtx.png'
				}
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
				// 如果时间戳是秒级，转换为毫秒级
				const milliseconds = timestamp < 10000000000 ? timestamp * 1000 : timestamp
				const date = new Date(milliseconds)
				return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
			},

			// 获取聊天记录
			async getChat() {
				const res = await uni.request({
					url: `https://ccpt.cc111.cn/api/chat`,
					method: 'POST',
					data: {
						room_id: this.roomId,
						user_id: this.user.id,
						messageable_type : "user",
						timestamp: Math.floor(Date.now() / 1000),
						sign: 'chongchong'
					},
					header: {
						'Content-Type': 'application/json'
					}
				})

				console.log(res)

				if (res.data.websocket_url) {
					this.user_type = res.data.user.type
					this.user_id = res.data.user.id
					this.websocketurl = res.data.websocket_url

					// 渲染历史聊天记录
					if (res.data.history && Array.isArray(res.data.history)) {
						this.messages = [] // 清空现有消息
						res.data.history.forEach(item => {
							// 判断消息类型：如果messageable_id等于当前用户id，则为自己发送的消息
							const messageType = item.messageable_id == this.user.id ? 'self' : 'other'
							const senderName = messageType === 'self' ? '我' : (item.name || '用户')

							// 根据messageable_type设置头像
							let avatar = item.avatar
							if (!avatar) {
								if (item.messageable_type === 'App\\Models\\ServiceMember') {
									avatar = 'https://ccpt.qiniu.cc111.cn/duihua/qishou.png'
								} else if (item.messageable_type === 'App\\Models\\User') {
									avatar = 'https://ccpt.qiniu.cc111.cn/112lbtx.png'
								} else {
									avatar = null
								}
							}

							// 转换时间格式
							const timestamp = item.created_at ?
								Math.floor(new Date(item.created_at).getTime() / 1000) :
								Math.floor(Date.now() / 1000)

							this.messages.push({
								sender: senderName,
								message: item.message,
								type: messageType,
								avatar: avatar,
								timestamp: timestamp
							})
						})
					}

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
		padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		width: 100%;
		box-sizing: border-box;
		overflow-x: hidden;
	}

	.status-bar {
		margin-top:5px;
		padding: 16rpx 20rpx;
		border-radius: 8rpx;
		margin-bottom: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
		overflow: hidden;

		text {
			flex: 1;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			margin-right: 16rpx;
		}

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
			flex-shrink: 0;
			white-space: nowrap;
		}
	}

	.chat-box {
		flex: 1;
		background-color: white;
		border-radius: 12rpx;
		padding: 20rpx;
		width: 100%;
		box-sizing: border-box;
		overflow-x: hidden;
		min-height: 200rpx;
	}

	.message {
		margin-bottom: 20rpx;
		width: 100%;
		box-sizing: border-box;

		.message-wrapper {
			display: flex;
			align-items: flex-start;
			gap: 16rpx;
		}

		.avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 8rpx;
			overflow: hidden;
			flex-shrink: 0;

			.avatar-img {
				width: 100%;
				height: 100%;
				background-color: #f0f0f0;
			}
		}

		.message-info {
			flex: 1;
			max-width: calc(100% - 96rpx);
		}

		.sender-name {
			font-size: 24rpx;
			color: #666;
			margin-bottom: 8rpx;
			font-weight: 500;
		}

		&.self {
			display: flex;
			flex-direction: column;
			align-items: flex-end;

			.message-wrapper {
				flex-direction: row-reverse;
			}

			.sender-name {
				text-align: right;
			}

			.message-content {
				background-color: #007bff;
				color: white;
				padding: 12rpx 16rpx;
				border-radius: 18rpx;
				max-width: 100%;
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

			.sender-name {
				text-align: left;
			}

			.message-content {
				background-color: #e9ecef;
				color: #333;
				padding: 12rpx 16rpx;
				border-radius: 18rpx;
				max-width: 100%;
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

	// 快捷回复区域
	.quick-reply-area {
		background-color: white;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-top: 16rpx;
		width: 100%;
		box-sizing: border-box;

		.quick-reply-header {
			display: flex;
			align-items: center;
			margin-bottom: 16rpx;

			.header-icon {
				width: 32rpx;
				height: 32rpx;
				margin-right: 8rpx;
			}

			.header-text {
				font-size: 28rpx;
				color: #2492F2;
				font-weight: 500;
			}
		}

		.quick-reply-list {
			display: flex;
			flex-direction: column;
			gap: 12rpx;

			.quick-reply-item {
				background-color: #F0F9FF;
				border: 1rpx solid #E6F4FF;
				border-radius: 8rpx;
				padding: 16rpx 20rpx;
				transition: all 0.3s ease;

				text {
					font-size: 26rpx;
					color: #333333;
					line-height: 1.5;
				}

				&:active {
					background-color: #E6F4FF;
					transform: scale(0.98);
				}
			}
		}
	}

	.input-area {
		display: flex;
		gap: 16rpx;
		margin-top: 20rpx;
		align-items: center;

		.message-input {
			flex: 1;
			height: 70rpx;
			padding: 0 20rpx;
			border: 1rpx solid #ddd;
			border-radius: 35rpx;
			background-color: white;
			font-size: 28rpx;
		}

		.send-btn {
			height: 70rpx;
			line-height: 70rpx;
			padding: 0 32rpx;
			background-color: #007bff;
			color: white;
			border: none;
			border-radius: 35rpx;
			font-size: 28rpx;

			&:disabled {
				background-color: #ccc;
			}
		}
	}
</style>
