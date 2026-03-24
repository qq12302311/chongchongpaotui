<template>
	<view class="order-info">
		<!-- 顶部导航栏 -->
		<nav-bar title="订单详情" title-align="center"></nav-bar>

		<!-- 导航栏占位元素 -->
		<view class="nav-placeholder"></view>

		<!-- 订单信息卡片 -->
		<view class="order-card">
			<!-- 订单状态标签 -->
			<!-- <view class="status-tag" :class="orderInfo.status">
				<text v-if="orderInfo.status === 'waiting'">等待接单</text>
				<text v-else-if="orderInfo.status === 'assigned'">已接单</text>
				<text v-else-if="orderInfo.status === 'finished'">已提交完成订单反馈</text>
				<text v-else-if="orderInfo.status === 'completed'">已确认完成</text>
			</view> -->
			<!-- 订单图标和地址 -->
			<view class="order-header">
				<view class="order-address">
					<view class="order-price">
						<view class="order-time">
							<view class="countdown-box">
								<block v-if="orderInfo.status === 'finished' || orderInfo.status === 'completed'">
									<text class="countdown-label">任务用时：</text>
									<text class="countdown-value">{{ taskDuration }}</text>
								</block>
								<block v-else>
								<text class="countdown-label">倒计时：</text>
								<text class="countdown-value">{{ countdown }}</text>
								</block>
								<view class="countdown-line">
									<text class="countdown-value">（本单超时免责 请尽快完单）</text>
								</view>
							</view>
						</view>
						<view class="status-tag" :class="orderInfo.status">
							<text v-if="orderInfo.status === 'waiting'">等待接单</text>
							<text v-else-if="orderInfo.status === 'assigned'">已接单</text>
							<text v-else-if="orderInfo.status === 'finished'">已提交完成订单反馈</text>
							<text v-else-if="orderInfo.status === 'completed'">已确认完成</text>
						</view>
					</view>
					<view class="divider"></view>
					<view class="info-content">
						<view class="order-icon">
							<view class="icon-content">
								<text class="brand-text">{{ displayBrand }}</text>
								<text class="service-text">{{ orderInfo.task_detail && orderInfo.task_detail.task_name ? orderInfo.task_detail.task_name.substring(0, 2) : '充充' }}</text>
							</view>
						</view>
						<view class="info-right">
							<view class="order-number">
								<text>订单编号：{{ orderInfo.task_no }}</text>
								<view class="copy-order-btn" @tap="copyOrderNumber">
									<text class="copy-text">复制</text>
								</view>
							</view>
							<view class="order-title">
								<text>{{ displayBrand }}</text>
								<text class="title-separator"> </text>
								<text>{{ orderInfo.task_detail && orderInfo.task_detail.task_name ? orderInfo.task_detail.task_name : '充充跑腿' }}</text>
								<text class="quantity-text">x{{ orderInfo.task_detail && orderInfo.task_detail.item_number ? orderInfo.task_detail.item_number : 1 }}</text>
							</view>
							<view class="contact-info">
								<!-- <view class="status-tag" :class="orderInfo.status">
									<text v-if="orderInfo.status === 'waiting'">等待接单</text>
									<text v-else-if="orderInfo.status === 'assigned'">已接单</text>
									<text v-else-if="orderInfo.status === 'finished'">已提交完成订单反馈</text>
									<text v-else-if="orderInfo.status === 'completed'">已确认完成</text>
								</view> -->
								<!-- <view class="order-time">
									<view class="countdown-box">
										<block v-if="orderInfo.status === 'finished' || orderInfo.status === 'completed'">
											<text class="countdown-label">任务用时：</text>
											<text class="countdown-value">{{ taskDuration }}</text>
										</block>
										<block v-else>
										<view class="countdown-line">
											<text class="countdown-label">倒计时：</text>
											<text class="countdown-value">{{ countdown }}</text>
										</view>
										<view class="countdown-line">
											<text class="countdown-value">（本单超时免责 请尽快完单）</text>
										</view>
										</block>
									</view>
								</view> -->
								<!-- <text class="contact-name ">{{ orderInfo.name }}</text>
								<view class="region-operation-btn" @click="showRegionWechat">
									<text class="region-text">分区运营</text>
								</view>
								<view class="copy-btn" @click="copyRegionWechat">
									<text class="copy-icon">��</text>
								</view> -->
								<!-- <view class="order-total">
									<text class="price">{{ getDisplayAmount(orderInfo) }}</text>
								</view> -->
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 订单详情列表 -->
			<view class="order-info-list">
				<view class="divider"></view>
				<!-- <view class="info-item">
					<text class="label">附加服务：</text>
					<text class="value">
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_1">
							<text class="task-name">{{ orderInfo.task_detail.extra_task_1 }}</text>
							<text class="item-number">x{{ orderInfo.task_detail.extra_task_1_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_2 || orderInfo.task_detail.extra_task_3 || orderInfo.task_detail.extra_task_4 || orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="task-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_2">
							<text class="task-name">{{ orderInfo.task_detail.extra_task_2 }}</text>
							<text class="item-number">x{{ orderInfo.task_detail.extra_task_2_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_3 || orderInfo.task_detail.extra_task_4 || orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="task-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_3">
							<text class="task-name">{{ orderInfo.task_detail.extra_task_3 }}</text>
							<text class="item-number">x{{ orderInfo.task_detail.extra_task_3_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_4 || orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="task-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_4">
							<text class="task-name">{{ orderInfo.task_detail.extra_task_4 }}</text>
							<text class="item-number">x{{ orderInfo.task_detail.extra_task_4_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="task-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_5">
							<text class="task-name">{{ orderInfo.task_detail.extra_task_5 }}</text>
							<text class="item-number">x{{ orderInfo.task_detail.extra_task_5_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_6" class="task-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_6">
							<text class="task-name">{{ orderInfo.task_detail.extra_task_6 }}</text>
							<text class="item-number">x{{ orderInfo.task_detail.extra_task_6_item_number }}</text>
						</template>
						<text v-if="!orderInfo.task_detail || (!orderInfo.task_detail.extra_task_1 && !orderInfo.task_detail.extra_task_2 && !orderInfo.task_detail.extra_task_3 && !orderInfo.task_detail.extra_task_4 && !orderInfo.task_detail.extra_task_5 && !orderInfo.task_detail.extra_task_6)" class="task-name">无</text>
					</text>
				</view>
				<view class="divider"></view> -->
				<view class="sn-tip-bg sn-tip">
					<text>小哥：请务必核对柜机SN 或MAC码，避免补错！</text>
				</view>
				<view class="info-item">
					<text class="label">设备编码：</text>
					<view class="value device-codes">
						<view 
							v-for="(code, index) in deviceCodes" 
							:key="index" 
							class="code-item">
							<text class="code-text">{{ code }}</text>
							<view class="copy-code-btn" @tap="copyDeviceCode(code)">
								<text class="copy-text">复制</text>
							</view>
						</view>
						<text v-if="deviceCodes.length === 0" class="no-code">无</text>
					</view>
				</view>
				<view class="divider" v-if="orderInfo.task_detail && orderInfo.task_detail.device_outside !== undefined"></view>
				<view class="info-item" v-if="orderInfo.task_detail && orderInfo.task_detail.device_outside !== undefined">
					<text class="label">设备是否外摆：</text>
					<text class="value">{{ orderInfo.task_detail.device_outside ? '是' : '否' }}</text>
				</view>
				<view class="info-item" v-if="orderInfo.task_detail && orderInfo.task_detail.shop_poi">
					<text class="label">门店POI：</text>
					<text class="value">{{ orderInfo.task_detail.shop_poi }}</text>
				</view>
				<view class="divider"></view>
				<view class="info-item" style="margin-top:35px;">
					<text class="label">服务门店：</text>
					<view class="value shop-info" style="position:relative;">
						<view class="shop-name-container">
							<view class="shop-name">{{ orderInfo.task_detail.store_name || '未知门店' }}</view>
							<view class="copy-store-btn" @tap="copyStoreName">
								<text class="copy-text">复制</text>
							</view>
						</view>
						<view class="shop-address">{{ orderInfo.shop_address }}</view>
						<view class="shop-address-container">
							<view class="shop-address">详细地址：{{ orderInfo.address }}</view>
							<view class="copy-address-btn" @tap="copyAddress">
								<text class="copy-text">复制</text>
							</view>
						</view>
						<view class="shop-images"
							v-if="orderInfo.task_detail && orderInfo.task_detail.pic_url && orderInfo.task_detail.pic_url.length > 0">
							<image v-for="(url, index) in orderInfo.task_detail.pic_url" :key="index" :src="url"
								mode="aspectFill" @click="previewImage(index)" class="shop-image"></image>
						</view>
						<view class="shop-remark">
							备注：{{ orderInfo.task_detail && orderInfo.task_detail.description || '无' }}</view>
						<!-- 新版导航按钮，绝对定位到右上角 -->
						<button class="nav-btn-mini" @click="openShopLocation" type="default">
							<image src="https://ccpt.qiniu.cc111.cn/rider/dingwei4.svg" class="nav-icon" mode="aspectFit" />
							<text class="nav-text">点击导航</text>
						</button>
					</view>
					<!-- 门店地址提醒 -->
					<view class="time-note">出发前请务必通过高德/腾讯/百度等第三方导航或美团确认门店地址</view>
				</view>
				<view class="divider"></view>
				<view class="info-item">
					<text class="label">服务时效：</text>
					<text class="value">{{ formatNewServiceTime() }}</text>
				</view>
				<!-- 建议骑手上门时间段 -->
				<view class="divider" v-if="orderInfo.recommended_service_time_start && orderInfo.recommended_service_time_end"></view>
				<view class="info-item" v-if="orderInfo.recommended_service_time_start && orderInfo.recommended_service_time_end">
					<text class="label">建议骑手上门时间段：</text>
					<text class="value">{{ getRecommendedTimeDisplay() }}</text>
				</view>
				
				<view class="time-note2">请小哥自行通过三方导航或者团购平台门店电话确认时间</view>
				<!-- 订单备注 -->
				<view class="divider" v-if="orderInfo.task_detail && orderInfo.task_detail.additional_notes"></view>
				<view class="info-item" v-if="orderInfo.task_detail && orderInfo.task_detail.additional_notes">
					<text class="label">订单备注：</text>
					<text class="value order-notes">{{ orderInfo.task_detail.additional_notes }}</text>
				</view>
				<!-- <view class="divider"></view>
				<view class="info-item">
					<text class="label">费用明细：</text>
					<view class="value">
						<view class="fee-detail">
							<view class="fee-item">
								<text class="fee-label">基础服务费：</text>
								<text class="fee-value">{{ getDisplayAmount({ ...orderInfo, order_amount: orderInfo.base_service_fee }) }}</text>
							</view>
							<view class="fee-item">
								<text class="fee-label">附加服务费：</text>
								<text class="fee-value">{{ getDisplayAmount({ ...orderInfo, order_amount: orderInfo.additional_service_fee }) }}</text>
							</view>
							<view class="fee-item" v-if="orderInfo.ticket_amount && Number(orderInfo.ticket_amount) > 0">
								<text class="fee-label">优惠券减免：</text>
								<text class="fee-value" style="color:#52c41a;">-¥{{ getDisplayAmount({ ...orderInfo, order_amount: orderInfo.ticket_amount }) }}</text>
							</view>
							<view class="fee-item total">
								<text class="fee-label">总计：</text>
								<text class="fee-value">{{ getDisplayAmount(orderInfo) }}</text>
							</view>
						</view>
					</view>
				</view> -->
			</view>

		</view>

		<!-- 微信申请协同处理按钮 -->
		<view @click="goToChat" class="wachat">
			<text class="wechat-label">前往</text>
			<text class="apply-text">申请平台和客户协同处理</text>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="loading">
			<div class="loading-spinner"></div>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 底部按钮 -->
		<view class="bottom-bar">
			<view class="home-btn" @click="goToHome">
				<image src="https://ccpt.qiniu.cc111.cn/rider/home.png" mode="aspectFit"></image>
				<text>接单大厅</text>
			</view>
			<template v-if="!isTransferred">
				<!-- <button class="cancel-btn" @click="goBack">取消</button> -->
				<button class="transfer-btn" @click="shareOrder">订单转派</button>
				<button class="confirm-btn" @click="acceptOrder">立即接单</button>
			</template>
			<template v-else>
				<!-- <button class="cancel-btn" @click="goBack">取消</button> -->
				<button class="confirm-btn" @click="acceptOrder">立即接单</button>
			</template>
		</view>

		<!-- 悬浮聊天图标 -->
		<floating-chat-icon></floating-chat-icon>

		<!-- 补宝订单提醒弹窗 -->
		<view class="bubao-modal" v-if="showBubaoModal">
			<view class="modal-mask"></view>
			<view class="modal-content">
				<image class="bubao-image" src="https://ccpt.qiniu.cc111.cn/pztx11.png" mode="widthFix"></image>
				<view class="countdown-text">{{ bubaoCountdownDisplay }}</view>
			</view>
		</view>
	</view>
</template>

<script>
	import NavBar from '@/components/NavBar.vue'
	import FloatingChatIcon from '@/components/FloatingChatIcon/index.vue'
	import md5 from 'md5'

	export default {
		components: {
			NavBar,
			FloatingChatIcon
		},
		data() {
			return {
				orderInfo: {
					shop_address: '',
					task_no: '',
					task_date: '',
					brand: '',
					task_detail: {
						task_name: '',
						item_number: 0,
						description: '',
						sn_mac_code: []
					},
					start_date: '',
					deadline: '',
					order_amount: '0.00'
				},
				brandMap: {
					'meituan': '美团',
					'guaishou': '怪兽',
					'jiedian': '街电',
					'xiaodian': '小电'
				},
				taskId: '',
				riderUserInfo: null,
				loading: true,
				countdown: '计算中...',
				timer: null,
				taskDuration: '', // 将taskDuration从计算属性改为数据属性
				isTransferred: false, // 是否为转派订单
				transferredPrice: '', // 转派后的价格
				detailInfo: {
					shopName: '',
					detailAddress: '',
					priceDetails: [],
					snCode: '',
					macCode: '',
					shopImage: ''
				},
				// 区域微信号映射
				regionWechatMap: {
					'京津冀 东三省 内蒙 海南': 'HKxgs2020',
					'云南贵州广西湖北西藏': 'weiazzy',
					'剩余区域': 'agan-24h'
				},
				// 补宝订单提醒弹窗相关
				showBubaoModal: false,
				bubaoCountdown: 6,
				bubaoTimer: null
			}
		},
		computed: {
			// 转换品牌显示
			displayBrand() {
				const brand = this.orderInfo.brand || ''
				return this.brandMap[brand.toLowerCase()] || brand
			},

			// 格式化补宝倒计时显示
			bubaoCountdownDisplay() {
				return `${this.bubaoCountdown}秒后自动关闭`;
			},

			// 格式化设备编码
			formatSnMacCodes() {
				const codes = (this.orderInfo.task_detail && this.orderInfo.task_detail.sn_mac_code) || []
				return codes.map(item => item.value).join('\n') || '无'
			},

			// 获取设备编码数组
			deviceCodes() {
				const codes = (this.orderInfo.task_detail && this.orderInfo.task_detail.sn_mac_code) || []
				return codes.map(item => item.value).filter(value => value && value.trim())
			},
			// 已将taskDuration从计算属性改为数据属性
		},
		onLoad(options) {
			// 确保taskId是字符串类型
			this.taskId = String(options.id || '');
			
			// 检查是否是转派订单
			this.isTransferred = options.isTransferred === 'true';
			this.transferredPrice = options.transferredPrice ? decodeURIComponent(options.transferredPrice) : '';
			
			// 获取骑手信息
			this.riderUserInfo = uni.getStorageSync('riderUserInfo');
			// 获取订单详情
			this.getTaskInfo();
		},
		onUnload() {
			// 页面卸载时清除定时器
			if (this.timer) {
				clearInterval(this.timer)
			}
			// 清除补宝倒计时定时器
			if (this.bubaoTimer) {
				clearInterval(this.bubaoTimer)
			}
		},
		methods: {
			// 计算倒计时
			calculateCountdown() {
				if (!this.orderInfo.deadline) return '未知时间'

				try {
					// 根据订单时长决定提前时间：24小时单提前6小时，48小时以上提前12小时
					const deadlineDate = new Date(this.orderInfo.deadline.replace(/-/g, '/'))

					let advanceHours = 6; // 默认提前6小时
					if (this.orderInfo.start_date) {
						const startDate = new Date(this.orderInfo.start_date.replace(/-/g, '/'));
						const durationHours = (deadlineDate - startDate) / (1000 * 60 * 60); // 计算时长（小时）

					  if (durationHours >= 72) {
						advanceHours = 18; // 72小时以上提前18小时
					  } else if (durationHours >= 48) {
						advanceHours = 12; // 48小时以上提前12小时
					  } else if (durationHours >= 24) {
						advanceHours = 3;  // 24小时单提前6小时
					  }
					}

					deadlineDate.setHours(deadlineDate.getHours() - advanceHours)
					const deadline = deadlineDate.getTime()
					const now = new Date().getTime()
					const diff = deadline - now

					if (diff <= 0) {
						return '已超时'
					}

					const hours = Math.floor(diff / (1000 * 60 * 60))
					const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
					const seconds = Math.floor((diff % (1000 * 60)) / 1000)

					return `${hours}小时${minutes}分${seconds}秒`
				} catch (e) {
					console.error('计算倒计时出错:', e)
					return '计算错误'
				}
			},
			// 开始倒计时
			startCountdown() {
				// 先计算一次
				this.countdown = this.calculateCountdown()

				// 每秒更新一次
				this.timer = setInterval(() => {
					this.countdown = this.calculateCountdown()
				}, 1000)
			},
			// 获取订单详情
			async getTaskInfo() {
				if (!this.taskId || !this.riderUserInfo) {
					uni.showToast({
						title: '参数错误',
						icon: 'none'
					});
					return;
				}

				this.loading = true;
				try {
					// 计算sign参数
					const signStr = `service_member_id=${this.riderUserInfo.id}&phone_number=${this.riderUserInfo.phone}`;
					const sign = md5(signStr);

					const res = await this.$request('task/info', {
						task_id: String(this.taskId), // 确保task_id是字符串类型
						service_member_id: this.riderUserInfo.id,
						sign: sign,
					}, 'POST');

					if (res.code === 200 && res.data) {
						this.orderInfo = res.data
						// 更新任务用时
						if (this.orderInfo.status === 'finished' || this.orderInfo.status === 'completed') {
							this.taskDuration = this.calculateTaskDuration();
						} else {
						// 开始倒计时
						this.startCountdown()
						}
					} else {
						uni.showToast({
							title: res.message || '获取订单详情失败',
							icon: 'none'
						})
						console.error('获取订单详情失败22:', res)
					}
				} catch (err) {
					console.error('获取订单详情失败:', err)
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},
			// 格式化服务时间
			formatServiceTime(startTime, endTime) {
				if (!startTime || !endTime) return '未知时间';

				// 格式化开始时间
				const startDate = new Date(startTime);
				const formattedStart =
					`${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;

				// 根据订单时长决定提前时间：24小时单提前6小时，48小时以上提前12小时
				const endDate = new Date(endTime);
				const durationHours = (endDate - startDate) / (1000 * 60 * 60); // 计算时长（小时）

				let advanceHours = 6; // 默认提前6小时
				if (durationHours >= 48) {
					advanceHours = 12; // 48小时以上提前12小时
				} else if (durationHours >= 24) {
					advanceHours = 6;  // 24小时单提前6小时
				}

				endDate.setHours(endDate.getHours() - advanceHours);
				const formattedEnd =
					`${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

				return `${formattedStart} 至 ${formattedEnd}`;
			},

			// 新的服务时效格式化方法
			formatNewServiceTime() {
				if (!this.orderInfo) return '未知时间';

				const timeLimit = this.orderInfo.time_limit || '未知';
				const deadline = this.orderInfo.deadline;

				if (!deadline) return `${timeLimit}小时内完成`;

				// 根据订单时长决定提前时间：24小时单提前6小时，48小时以上提前12小时
				const deadlineDate = new Date(deadline.replace(/-/g, '/'));

				let advanceHours = 6; // 默认提前6小时
				if (this.orderInfo.start_date) {
					const startDate = new Date(this.orderInfo.start_date.replace(/-/g, '/'));
					const durationHours = (deadlineDate - startDate) / (1000 * 60 * 60); // 计算时长（小时）

					if (durationHours >= 48) {
						advanceHours = 12; // 48小时以上提前12小时
					} else if (durationHours >= 24) {
						advanceHours = 6;  // 24小时单提前6小时
					}
				}

				// 应用提前时间
				deadlineDate.setHours(deadlineDate.getHours() - advanceHours);

				// 格式化调整后的 deadline
				const formattedDeadline = `${deadlineDate.getFullYear()}-${String(deadlineDate.getMonth() + 1).padStart(2, '0')}-${String(deadlineDate.getDate()).padStart(2, '0')} ${String(deadlineDate.getHours()).padStart(2, '0')}:${String(deadlineDate.getMinutes()).padStart(2, '0')}`;

				return `${timeLimit}小时内 ${formattedDeadline} 前完成`;
			},

			// 获取建议上门时间显示
			getRecommendedTimeDisplay() {
				if (!this.orderInfo.recommended_service_time_start || !this.orderInfo.recommended_service_time_end) {
					return '';
				}

				const startTime = this.orderInfo.recommended_service_time_start;
				const endTime = this.orderInfo.recommended_service_time_end;

				// 如果开始和结束时间都是00:00，显示"全天"
				if (startTime === '00:00' && endTime === '00:00') {
					return '全天';
				}

				return `${startTime} - ${endTime}`;
			},
			goToHome() {
				uni.redirectTo({
					url: '/riderEnd/index'
				})
			},

			// 返回上一页
			goBack() {
				uni.navigateBack();
			},

			// 跳转到聊天页面
			goToChat() {
				// 使用订单ID作为聊天室ID
				const roomId = this.orderInfo.task_id || this.taskId || 'default'
				uni.navigateTo({
					url: `/riderEnd/chat-simple?roomId=${roomId}`
				})
			},

			// 预览图片
			previewImage(current) {
				const urls = this.orderInfo.task_detail && this.orderInfo.task_detail.pic_url || []
				uni.previewImage({
					urls: urls,
					current: current
				})
			},

			// 计算任务用时
			calculateTaskDuration() {
				if (!this.orderInfo.start_date || !this.orderInfo.task_assignment || !this.orderInfo.task_assignment.finished_at) {
					return '未知时间';
				}

				try {
					const startTime = new Date(this.orderInfo.start_date.replace(/-/g, '/'));
					const endTime = new Date(this.orderInfo.task_assignment.finished_at.replace(/-/g, '/'));
					const duration = endTime - startTime;

					const hours = Math.floor(duration / (1000 * 60 * 60));
					const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

					return `${hours}小时${minutes}分钟`;
				} catch (e) {
					console.error('计算任务用时出错:', e);
					return '未知时间';
				}
			},
			// 复用订单金额展示方法
			getDisplayAmount(order) {
				// 如果是转派订单，直接返回转派后的价格
				if (this.isTransferred && this.transferredPrice) {
					return this.transferredPrice;
				}
				
				if (!this.riderUserInfo || !this.riderUserInfo.rate) return order.order_amount || order.price;
				let amount = 0;
				if (typeof order.order_amount === 'string') {
					amount = parseFloat(order.order_amount.replace('¥', ''));
				} else if (order.order_amount !== undefined) {
					amount = Number(order.order_amount);
				} else if (typeof order.price === 'string') {
					amount = parseFloat(order.price.replace('¥', ''));
				} else {
					amount = Number(order.price);
				}
				const rate = Number(this.riderUserInfo.rate);
				const realAmount = amount * rate;
				return `¥${realAmount.toFixed(2)}`;
			},
			openShopLocation() {
				const detail = this.orderInfo.task_detail || {};
				const latitude = Number(this.orderInfo.latitude || detail.latitude);
				const longitude = Number(this.orderInfo.longitude || detail.longitude);
				const name = detail.store_name || '门店';
				const address = this.orderInfo.shop_address || this.orderInfo.address || '';
				if (!latitude || !longitude) {
					uni.showToast({ title: '无有效门店定位', icon: 'none' });
					return;
				}
				uni.openLocation({
					latitude,
					longitude,
					name,
					address
				});
			},
			// 格式化日期时间
			formatDateTime(dateTimeStr) {
				if (!dateTimeStr) return '未知时间';

				try {
					// 处理ISO格式的时间字符串
					const date = new Date(dateTimeStr);
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					const hours = String(date.getHours()).padStart(2, '0');
					const minutes = String(date.getMinutes()).padStart(2, '0');
					const seconds = String(date.getSeconds()).padStart(2, '0');

					return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
				} catch (e) {
					console.error('格式化时间出错:', e);
					return dateTimeStr;
				}
			},

			// 根据订单地址确定区域
			getRegionByAddress() {
				const address = this.orderInfo.province_name;

				// 京津冀 东三省 内蒙 海南
				if (address.includes('北京') || address.includes('天津') || address.includes('河北') ||
					address.includes('辽宁') || address.includes('吉林') || address.includes('黑龙江') ||
					address.includes('内蒙') || address.includes('海南')) {
					return '京津冀 东三省 内蒙 海南';
				}

				// 云南贵州广西湖北西藏
				if (address.includes('云南') || address.includes('贵州') || address.includes('广西') ||
					address.includes('湖北') || address.includes('西藏')) {
					return '云南贵州广西湖北西藏';
				}

				// 剩余区域
				return '剩余区域';
			},

			// 获取当前区域对应的微信号
			getCurrentRegionWechat() {
				const region = this.getRegionByAddress();
				return this.regionWechatMap[region];
			},

			// 复制订单编号
			copyOrderNumber() {
				console.log('点击了复制按钮');
				const orderNo = this.orderInfo.task_no;
				console.log('订单编号:', orderNo);
				
				if (!orderNo) {
					uni.showToast({
						title: '订单编号为空',
						icon: 'none'
					});
					return;
				}
				
				uni.setClipboardData({
					data: orderNo,
					success: () => {
						console.log('复制成功');
						uni.showToast({
							title: '复制成功',
							icon: 'success'
						});
					},
					fail: (error) => {
						console.error('复制失败:', error);
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			},

			// 复制设备编码
			copyDeviceCode(code) {
				console.log('复制设备编码:', code);
				if (!code) {
					uni.showToast({
						title: '编码为空',
						icon: 'none'
					});
					return;
				}
				
				uni.setClipboardData({
					data: code,
					success: () => {
						uni.showToast({
							title: '设备编码已复制',
							icon: 'success'
						});
					},
					fail: (error) => {
						console.error('复制失败:', error);
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			},

			// 复制门店名称
			copyStoreName() {
				const storeName = this.orderInfo.task_detail && this.orderInfo.task_detail.store_name;
				console.log('复制门店名称:', storeName);
				
				if (!storeName || storeName === '未知门店') {
					uni.showToast({
						title: '门店名称为空',
						icon: 'none'
					});
					return;
				}
				
				uni.setClipboardData({
					data: storeName,
					success: () => {
						uni.showToast({
							title: '门店名称已复制',
							icon: 'success'
						});
					},
					fail: (error) => {
						console.error('复制失败:', error);
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			},

			// 复制详细地址
			copyAddress() {
				const address = this.orderInfo.address;
				console.log('复制详细地址:', address);
				
				if (!address) {
					uni.showToast({
						title: '地址为空',
						icon: 'none'
					});
					return;
				}
				
				uni.setClipboardData({
					data: address,
					success: () => {
						uni.showToast({
							title: '地址已复制',
							icon: 'success'
						});
					},
					fail: (error) => {
						console.error('复制失败:', error);
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			},

			// 判断是否为补宝订单（怪兽、街电、小电）
			isBubaoOrder() {
				const brand = (this.orderInfo.brand || '').toLowerCase();
				return brand === 'guaishou' || brand === 'jiedian' || brand === 'xiaodian';
			},

			// 显示补宝订单提醒弹窗
			showBubaoReminder() {
				this.showBubaoModal = true;
				this.bubaoCountdown = 6;
				
				// 清除可能存在的旧定时器
				if (this.bubaoTimer) {
					clearInterval(this.bubaoTimer);
				}
				
				// 开始倒计时
				this.bubaoTimer = setInterval(() => {
					this.bubaoCountdown--;
					if (this.bubaoCountdown <= 0) {
						clearInterval(this.bubaoTimer);
						this.showBubaoModal = false;
					}
				}, 1000);
			},

			// 接单操作
			async acceptOrder() {
				try {
					// 生成签名
					const signStr = `service_member_id=${this.riderUserInfo.id}&phone_number=${this.riderUserInfo.phone}`;
					const sign = md5(signStr);

					// 调用接单API
					const params = {
						task_id: this.orderInfo.id || this.taskId,
						service_provider_id: this.riderUserInfo.provider_id,
						service_member_id: this.riderUserInfo.id,
						sign: sign
					};

					// 从本地存储获取 referrer_id 并添加到参数中
					const localReferrerId = uni.getStorageSync('current_referrer_id');
					if (localReferrerId) {
						params.task_referrer_id = localReferrerId;
						console.log('接单时添加 task_referrer_id 参数:', localReferrerId);
					}

					const res = await this.$request('task/accept', params, 'POST');

					if (res.code === 200) {
						// 保存订单ID，因为关闭弹窗会清空currentOrderInfo
						const orderId = this.orderInfo.id || this.taskId;

						// 接单成功后清除本地存储的 referrer_id
						if (localReferrerId) {
							uni.removeStorageSync('current_referrer_id');
							console.log('接单成功，已清除本地 referrer_id');
						}

						// 判断是否为补宝订单，如果是则显示提醒弹窗
						if (this.isBubaoOrder()) {
							this.showBubaoReminder();
							
							// 延迟7秒跳转（6秒弹窗 + 1秒缓冲）
							setTimeout(() => {
								uni.redirectTo({
									url: `/riderEnd/order-info?id=${orderId}`
								});
							}, 7000);
						} else {
							uni.showToast({
								title: '接单成功',
								icon: 'success'
							});

							// 自动跳转到订单信息页面
							setTimeout(() => {
								uni.redirectTo({
									url: `/riderEnd/order-info?id=${orderId}`
								});
							}, 1500); // 延迟1.5秒跳转，让用户看到成功提示
						}
					} else {
						uni.showToast({
							title: res.message || '接单失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('接单失败:', error);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					});
				}
			},

			// 分享订单
			async shareOrder() {
				// 调用微信分享接口
				try {
					const order = this.orderInfo;
					console.log('分享订单信息:', order);

					// 获取转单奖励
					const getTransferReward = (order) => {
						if (!order || !order.order_amount) return '3元';

						let amount = 0;
						if (typeof order.order_amount === 'string') {
							amount = parseFloat(order.order_amount.replace('¥', ''));
						} else {
							amount = Number(order.order_amount);
						}

						// 根据订单金额计算转单奖励
						if (amount <= 20) {
							return '3元';
						} else if (amount <= 50) {
							return '6元';
						} else {
							return '9元';
						}
					};

					// 计算转单后的订单金额
					const getTransferDisplayAmount = (order) => {
						if (!this.riderUserInfo || !this.riderUserInfo.rate) return order.order_amount;

						let amount = 0;
						if (typeof order.order_amount === 'string') {
							amount = parseFloat(order.order_amount.replace('¥', ''));
						} else {
							amount = Number(order.order_amount);
						}

						const rate = Number(this.riderUserInfo.rate);
						const getTransferRewardAmount = (order) => {
							if (!order || !order.order_amount) return 3;

							let amount = 0;
							if (typeof order.order_amount === 'string') {
								amount = parseFloat(order.order_amount.replace('¥', ''));
							} else {
								amount = Number(order.order_amount);
							}

							// 根据订单金额计算转单奖励
							if (amount <= 20) {
								return 3;
							} else if (amount <= 50) {
								return 6;
							} else {
								return 9;
							}
						};
						const rewardAmount = getTransferRewardAmount(order);
						const finalAmount = (amount * rate) - rewardAmount;

						return `¥${finalAmount.toFixed(2)}`;
					};

					const formatAddress = (order) => {
						const address = order.address;
						if (!address) return '';

						// 隐藏6个字符
						const charsToHide = 6;

						if (address.length > charsToHide) {
							return address.slice(0, -charsToHide) + '...';
						} else {
							return address;
						}
					};

					const shareData = {
						title: `${order.task_detail?.task_name || '充充跑腿'} | ${getTransferDisplayAmount(order)} | ${formatAddress(order)}`,
						desc: `【订单转派】距离: ${order.distance || 0}km | 转单奖励: ${getTransferReward(order)}`,
						path: `/riderEnd/index?task_referrer_id=${this.riderUserInfo.id}&shared_order_id=${order.id}`,
						imageUrl: 'https://ccpt.qiniu.cc111.cn/rider/banner4.png'
					};

					console.log('分享数据:', shareData);

					// 微信小程序分享
					if (typeof wx !== 'undefined' && wx.shareAppMessage) {
						wx.shareAppMessage(shareData);
					} else {
						uni.showToast({
							title: '请点击右上角分享',
							icon: 'none',
							duration: 2000
						});
					}

					uni.showToast({
						title: '订单转派成功',
						icon: 'success'
					});

				} catch (error) {
					console.error('分享订单失败:', error);
					uni.showToast({
						title: '分享失败，请重试',
						icon: 'none'
					});
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.order-price{
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.order-info {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
		position: relative;
	}

	.nav-placeholder {
		height: 180rpx;
		width: 100%;
		background-color: #2492F2;
	}

	.order-card {
		background-color: #fff;
		margin: 20rpx;
		border-radius: 12rpx;
		padding: 30rpx;
		position: relative;

		.status-tag {
			padding: 8rpx 16rpx;
			border-radius: 0rpx 12rpx 0rpx 12rpx;
			font-size: 24rpx;
			font-weight: 500;
			z-index: 10;

			&.waiting {
				background-color: rgba(255, 107, 0, 0.1);
				color: #FF6B00;
			}

			&.assigned {
				background-color: rgba(36, 146, 242, 0.1);
				color: #2492F2;
			}

			&.finished {
				background-color: rgba(0, 200, 0, 0.1);
				color: #00C800;
			}

			&.completed {
				background-color: rgba(0, 200, 0, 0.1);
				color: #00C800;
			}
		}

		.order-header {
			display: flex;
			align-items: flex-start;
			margin-bottom: 30rpx;

			.order-address {
				flex: 1;

				.order-number {
					font-size: 28rpx;
					color: #999;
					margin-bottom: 8rpx;
					font-weight: 600;
					display: flex;
					align-items: center;
					flex-wrap: wrap;
					
					.copy-order-btn {
						display: flex;
						align-items: center;
						justify-content: center;
						margin-left: 8rpx;
						padding: 4rpx 8rpx;
						background-color: #F9C561;
						border-radius: 4rpx;
						cursor: pointer;
						position: relative;
						z-index: 10;
						
						&:active {
							background-color: #F0B84A;
						}
						
						.copy-text {
							font-size: 22rpx;
							color: #ffffff;
							line-height: 1;
							pointer-events: none;
						}
					}
				}

				.order-time {
					font-size: 24rpx;
					color: #999;
					position: relative;
					min-height: 40rpx;
					z-index: 2;

					text {
						display: inline-block;
					}

					.countdown-box {
						padding: 6rpx 12rpx;
						background-color: rgba(255, 107, 0, 0.1);
						border-radius: 6rpx;
						// display: flex;
						// flex-direction: column;
						align-items: flex-end;
						white-space: nowrap;
						text-align:center;
						z-index: 2;

						.countdown-line {
							display: flex;
							align-items: center;
							margin-bottom: 2rpx;

							&:last-child {
								margin-bottom: 0;
							}
						}

						.countdown-label {
							font-size: 20rpx;
							color: #666;
							margin-right: 4rpx;
						}

						.countdown-value {
							font-size: 20rpx;
							color: #FF6B00;
							font-weight: 500;
						}
					}
				}

				.divider {
					height: 1rpx;
					background-color: #eee;
					margin: 16rpx 0;
				}

				.info-content {
					position: relative;
					display: flex;
					align-items: flex-start;
					margin-top: 20rpx;

					.order-icon {
						width: 100rpx;
						height: 97rpx;
						background-color: #2492F2;
						border-radius: 10rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 20rpx;
						flex-shrink: 0;
						margin-top: 0;

						.icon-content {
							display: flex;
							flex-direction: column;
							align-items: center;
							justify-content: center;
							text-align: center;

							.brand-text {
								font-size: 28rpx;
								color: #fff;
								font-weight: bold;
								margin-bottom: 4rpx;
								line-height: 1;
							}

							.service-text {
								font-size: 28rpx;
								color: #fff;
								font-weight: bold;
								line-height: 1;
							}
						}

						text {
							font-size: 44rpx;
							color: #fff;
							font-weight: bold;
						}
					}

					.info-right {
						flex: 1;
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						min-height: 97rpx;
					}

					.info-row {
						display: flex;
						align-items: center;
						justify-content: space-between;
						margin-bottom: 12rpx;
					}

					.order-title {
						font-size: 32rpx;
						color: #333;
						font-weight: 500;
						margin-bottom: 8rpx;
						display: flex;
						align-items: center;

						.title-separator {
							margin: 0 8rpx;
						}

						.quantity-text {
							color: #2492F2;
						}
					}

					.contact-info {
						    position: absolute;
						    width: 200rpx;
						    height: 200rpx;
						    right: 10rpx;
							top: -40rpx;
						display: flex;
						align-items: center;
						font-size: 28rpx;
						color: #666;

						.contact-name {
							margin-right: 20rpx;
							color: #2492F2;
						}

						.region-operation-btn {
							background-color: #2492F2;
							color: #fff;
							padding: 4rpx 12rpx;
							border-radius: 4rpx;
							font-size: 24rpx;
							margin-right: 8rpx;

							.region-text {
								font-size: 24rpx;
								color: #fff;
							}
						}

						.copy-btn {
							display: flex;
							align-items: center;
							justify-content: center;
							margin-left: 8rpx;
							margin-right: 10rpx;
							padding: 4rpx;

							.copy-icon {
								font-size: 24rpx;
								color: #2492F2;
								line-height: 1;
							}
						}

						.call-btn {
							display: flex;
							align-items: center;
							justify-content: center;
							margin-left: 10rpx;
							margin-right: 10rpx;
							padding: 4rpx;

							.phone-icon {
								font-size: 24rpx;
								line-height: 1;
							}
						}

						.order-total {
							position: absolute;
							right: 0px;
							top: 20px;
							// transform: translateY(-50%);
							font-size: 28rpx;

							.price {
								color: #FF6B00;
								font-size: 32rpx;
								font-weight: 500;
							}
						}
					}

					.address-text {
						font-size: 26rpx;
						color: #666;
						margin-bottom: 12rpx;
					}
				}
			}
		}

		.order-info-list {
			.divider {
				height: 1rpx;
				background-color: #eee;
				margin: 0;
			}

			.info-item {
			position: relative;
				display: flex;
				padding: 20rpx 0;
				font-size: 28rpx;
				line-height: 1.5;

				.label {
					color: #666;
					min-width: 140rpx;
				}

				.value {
					flex: 1;
					color: #333;
					white-space: pre-line;

					&.highlight {
						color: #2492F2;
					}

					&.remark {
						color: #818181;
					}

					&.order-notes {
						// text-align: right;
						line-height: 1.5;
						word-wrap: break-word;
						word-break: break-all;
						white-space: pre-wrap;
					}

					&.shop-info {
						.shop-name {
							font-size: 28rpx;
							color: #333;
							margin-bottom: 8rpx;
							padding-right: 160rpx; /* 为导航按钮预留空间 */
							word-wrap: break-word;
							word-break: break-all;
						}

						.shop-address {
							font-size: 26rpx;
							color: #666;
							margin-bottom: 16rpx;
							padding-right: 160rpx; /* 为导航按钮预留空间 */
							word-wrap: break-word;
							word-break: break-all;
						}

						.shop-images {
							display: flex;
							flex-wrap: wrap;
							margin: 0 -8rpx;
							margin-bottom: 16rpx;

							.shop-image {
								width: calc(33.33% - 16rpx);
								height: 100rpx;
								margin: 8rpx;
								border-radius: 6rpx;
							}
						}

						.shop-remark {
							font-size: 26rpx;
							color: #818181;
							padding-right: 160rpx; /* 为导航按钮预留空间 */
							word-wrap: break-word;
							word-break: break-all;
						}

						// 门店名称容器样式
						.shop-name-container {
							display: flex;
							align-items: center;
							margin-bottom: 8rpx;
							
							.shop-name {
								word-wrap: break-word;
								word-break: break-all;
								font-size: 28rpx;
								color: #333;
								padding-right: 8rpx;
							}
							
							.copy-store-btn {
								display: flex;
								align-items: center;
								justify-content: center;
								padding: 6rpx 12rpx;
								background-color: #F9C561;
								border-radius: 4rpx;
								cursor: pointer;
								position: relative;
								z-index: 10;
								flex-shrink: 0;
								
								&:active {
									background-color: #F0B84A;
								}
								
								.copy-text {
									font-size: 20rpx;
									color: #ffffff;
									line-height: 1;
									pointer-events: none;
								}
							}
						}

						// 详细地址容器样式
						.shop-address-container {
							display: flex;
							align-items: center;
							margin-bottom: 16rpx;
							
							.shop-address {
								font-size: 26rpx;
								color: #666;
								padding-right: 8rpx;
								word-wrap: break-word;
								word-break: break-all;
							}
							
							.copy-address-btn {
								display: flex;
								align-items: center;
								justify-content: center;
								padding: 6rpx 12rpx;
								background-color: #F9C561;
								border-radius: 4rpx;
								cursor: pointer;
								position: relative;
								z-index: 10;
								flex-shrink: 0;
								
								&:active {
									background-color: #F0B84A;
								}
								
								.copy-text {
									font-size: 20rpx;
									color: #ffffff;
									line-height: 1;
									pointer-events: none;
								}
							}
						}
					}

					// 设备编码样式
					&.device-codes {
						.code-item {
							display: flex;
							align-items: center;
							margin-bottom: 8rpx;
							
						&:last-child {
							margin-bottom: 0;
						}
						
						.code-text {
							word-break: break-all;
							margin-right: 8rpx;
						}
						
						.copy-code-btn {
							display: flex;
							align-items: center;
							justify-content: center;
							padding: 6rpx 12rpx;
							background-color: #F9C561;
							border-radius: 4rpx;
							cursor: pointer;
							position: relative;
							z-index: 10;
							flex-shrink: 0;
							
							&:active {
								background-color: #F0B84A;
							}
							
							.copy-text {
								font-size: 20rpx;
								color: #ffffff;
								line-height: 1;
								pointer-events: none;
							}
						}
					}
					
					.no-code {
						color: #999;
					}
				}

					.task-name {
						color: #333;
					}

					.item-number {
						color: #2492F2;
					}

					.task-separator {
						color: #333;
					}
				}
			}
		}

		.order-total {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			margin-top: 30rpx;
			font-size: 28rpx;

			.price {
				color: #FF6B00;
				font-size: 36rpx;
				font-weight: 500;
				margin-left: 10rpx;
			}
		}
	}

	.info-section {
		background-color: #fff;
		margin: 20rpx;
		border-radius: 12rpx;
		padding: 30rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
			margin-bottom: 20rpx;
			border-left: 8rpx solid #2492F2;
			padding-left: 20rpx;
		}

		.info-item {
			position: relative;
			display: flex;
			margin-bottom: 16rpx;
			font-size: 28rpx;
			line-height: 1.5;

			.label {
				color: #666;
				min-width: 140rpx;
			}

			.value {
				flex: 1;
				color: #333;
			}
		}

		.price-item {
			display: flex;
			justify-content: space-between;
			margin-bottom: 16rpx;
			font-size: 28rpx;

			.label {
				color: #666;
			}

			.value {
				color: #FF6B00;
				font-weight: 500;
			}
		}

		.shop-image {
			width: 100%;
			border-radius: 8rpx;
		}
	}

	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 100rpx;
		background-color: #fff;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

		.home-btn,
		.chat-btn {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-right: 30rpx;

			image {
				width: 44rpx;
				height: 44rpx;
				margin-bottom: 6rpx;
			}

			text {
				font-size: 22rpx;
				color: #666;
			}
		}

		.confirm-btn {
			flex: 1;
			height: 80rpx;
			background-color: #2492F2;
			border-radius: 40rpx;
			color: #fff;
			font-size: 32rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 0;
			padding: 0;

			&[disabled] {
				background-color: #CCCCCC;
				color: #FFFFFF;
			}
		}

		.cancel-btn {
			flex: none;
			width: auto;
			min-width: 120rpx;
			height: 80rpx;
			background-color: transparent;
			border-radius: 40rpx;
			color: #ff4757;
			font-size: 32rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 0 20rpx 0 0;
			padding: 0 30rpx;
			border: 2rpx solid #ff4757;

			&:active {
				background-color: rgba(255, 71, 87, 0.1);
				color: #ff3742;
				border-color: #ff3742;
			}
		}

		.transfer-btn {
			flex: none;
			width: auto;
			min-width: 120rpx;
			height: 80rpx;
			background-color: #ff9500;
			border-radius: 40rpx;
			color: #fff;
			font-size: 32rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 0 20rpx 0 0;
			padding: 0 30rpx;

			&:active {
				background-color: #e67300;
			}
		}
	}

	.loading-container {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.loading-spinner {
			width: 60rpx;
			height: 60rpx;
			border: 4rpx solid #f3f3f3;
			border-top: 4rpx solid #2492F2;
			border-radius: 50%;
			animation: spin 1s linear infinite;
			margin-bottom: 20rpx;
		}

		.loading-text {
			font-size: 28rpx;
			color: #999;
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	.order-images {
		margin-top: 30rpx;
		padding-top: 30rpx;
		border-top: 1rpx solid #eee;

		.images-title {
			font-size: 28rpx;
			color: #666;
			margin-bottom: 20rpx;
		}

		.image-list {
			display: flex;
			flex-wrap: wrap;
			margin: 0 -10rpx;

			.order-image {
				width: calc(33.33% - 20rpx);
				height: 200rpx;
				margin: 10rpx;
				border-radius: 8rpx;
			}
		}
	}

	.required {
		color: #FF4D4F;
		margin-left: 4rpx;
	}

	.sn-tip {
		padding: 10rpx 0 10rpx 140rpx;

		text {
			font-size: 20rpx;
			color: #FF4D4F;
		}
	}

	.sn-tip-bg {
		background: #FFF1F0;
		border-radius: 12rpx;
		padding: 0rpx 10rpx;
		margin: 10rpx 0 0rpx 0rpx;
		display: inline-block;
	}

	.nav-btn-mini {
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(36,146,242,0.08);
		color: #2492F2;
		border-radius: 24rpx;
		font-size: 22rpx;
		padding: 0 18rpx;
		height: 48rpx;
		border: 1px solid #b3d6fa;
		box-shadow: none;
		z-index: 10; /* 提高z-index确保不被遮挡 */
		line-height: 48rpx;
		min-width: 100rpx;
		transition: background 0.2s;
		outline: none;
		pointer-events: auto; /* 确保可点击 */
	}
	.nav-btn-mini:active {
		background: rgba(36,146,242,0.18);
	}
	.nav-icon {
		width: 28rpx;
		height: 28rpx;
		margin-right: 6rpx;
		display: block;
	}
	.nav-text {
		display: flex;
		align-items: center;
		justify-content: center;
		width: auto;
		flex: 1;
		text-align: center;
	}

	// 微信申请协同处理样式
	.wachat {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 50rpx 20rpx 20rpx 20rpx;

		.wechat-label {
			background-color: #19B61F;
			color: #ffffff;
			font-size: 26rpx;
			padding: 6rpx 12rpx;
			border-radius: 4rpx;
			margin-right: 8rpx;
			font-weight: 500;
		}

		.apply-text {
			color: #12A910;
			font-size: 26rpx;
			text-shadow: 0 1rpx 2rpx rgba(18, 169, 16, 0.2);
			font-weight: 400;
		}
	}

		.time-note {
			position: absolute;
			// width: 60px;
			top: -35px;
			left: -5px;
			font-size: 21rpx;
			color: #FF4D4F;
			margin-top: 8rpx;
			line-height: 1.3;
			letter-spacing: 2px;
			display: block;
			background-color: #FFF1F0;
			padding: 6rpx 10rpx;
			border-radius: 8rpx;
			word-wrap: break-word;
			word-break: break-all;
			white-space: normal;
		}
		.time-note2 {
			font-size: 21rpx;
			color: #FF4D4F;
			line-height: 1.3;
			letter-spacing: 2px;
			display: block;
			background-color: #FFF1F0;
			padding: 6rpx 10rpx;
			border-radius: 8rpx;
			word-wrap: break-word;
			word-break: break-all;
			white-space: normal;
		}

	// 补宝订单提醒弹窗样式
	.bubao-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;

		.modal-mask {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, 0.7);
		}

		.modal-content {
			position: relative;
			width: 80%;
			max-width: 600rpx;
			background-color: transparent;
			border-radius: 20rpx;
			padding: 40rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			animation: modalFadeIn 0.3s ease-in-out;

			.bubao-image {
				width: 100%;
				border-radius: 12rpx;
				margin-bottom: 30rpx;
			}

			.countdown-text {
				font-size: 32rpx;
				color: #FF6B00;
				font-weight: 600;
				text-align: center;
				animation: countdownPulse 1s ease-in-out infinite;
			}
		}
	}

	@keyframes modalFadeIn {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes countdownPulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.05);
		}
	}
</style>