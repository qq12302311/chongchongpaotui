<template>
	<view class="order-detail">
		<!-- 自定义导航栏 -->
		<nav-bar title="订单详情" title-align="center"></nav-bar>

		<!-- 内容区域 -->
		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 订单基本信息 -->
			<view class="order-header">

				<!-- 骑手已接单信息 -->
				<block v-if="(orderInfo.status === 'assigned' || orderInfo.status === 'finished' || orderInfo.status === 'completed') && orderInfo.task_assignment">
					<view class="rider-assigned-card">
						<view class="rider-header">
							<view class="rider-info">
								<image :src="getRiderAvatar()" class="rider-avatar" mode="aspectFill"></image>
								<view class="rider-content">
									<view class="rider-title">
										<text class="title-text">已接单 骑手：{{ getRiderDisplayName() }}</text>
									</view>
									<view class="accept-time" v-if="orderInfo.task_assignment && (orderInfo.task_assignment.assigned_at || orderInfo.task_assignment.created_at)">
										<text class="time-label">接单：</text>
										<text class="time-value">{{ formatDateTime(orderInfo.task_assignment.assigned_at || orderInfo.task_assignment.created_at) }}</text>
									</view>
									<view class="promotion-banner">
										<image src="https://ccpt.qiniu.0871.cn/order/qishou/huore2.png" class="promotion-image" mode="aspectFit"></image>
									</view>
								</view>
							</view>
							<view class="rider-status">
								<!-- 进行中状态的gif图 -->
								<view class="status-gif" v-if="orderInfo.status === 'assigned'">
									<image src="https://ccpt.qiniu.0871.cn/aa.gif" mode="aspectFit" class="gif-image"></image>
								</view>
								<!-- 已完成状态的图片 -->
								<view class="status-gif" v-if="orderInfo.status === 'completed'">
									<image src="https://ccpt.qiniu.0871.cn/order/wancheng.png" mode="aspectFit" class="gif-image"></image>
								</view>
								<view class="status-tag">{{getStatusText(orderInfo.status)}} <text class="arrow"></text></view>
							</view>
						</view>
					</view>
				</block>


				<view class="divider"></view>

				<view class="order-title">
					<image
					  class="order-icon"
					  :src="orderInfo.task_detail && orderInfo.task_detail.pic_url && orderInfo.task_detail.pic_url.length > 0
					    ? orderInfo.task_detail.pic_url[0]
					    : 'https://ccpt.qiniu.0871.cn/publish/banner3.png'"
					  mode="aspectFit">
					</image>
					<!-- <image class="order-icon" src="https://ccpt.qiniu.0871.cn/publish/banner.png" mode="aspectFit"> -->
					<view class="title-content">
						<view class="main-title">【{{orderInfo.task_name}}】 充充跑腿订单</view>
						<view class="meta-row">
							<text class="meta-number">订单编号：{{orderInfo.task_no}}</text>
							<view class="copy-order-btn" @tap="copyOrderNumber">
								<text class="copy-text">复制</text>
							</view>
						</view>
						<view class="meta-row">
							<text class="meta-time">发布时间：{{orderInfo.task_date}}</text>
						</view>
					</view>
				</view>

			</view>

			<!-- 订单详情卡片（含展开/收起） -->
			<view class="order-detail-card">
				<view class="detail-list-toggle">
					<view class="toggle-title">
						<image class="header-icon" src="https://ccpt.qiniu.0871.cn/order/order.png" mode="aspectFit"></image>
						<text class="header-title">订单详情</text>
					</view>
				</view>
				<view class="detail-list-wrapper">
					<view class="detail-list" :style="{ maxHeight: isFullyExpanded ? 'none' : '300rpx' }">
					<view class="detail-item">
						<view class="item-dot"></view>
						<view class="item-label">设备品牌：</view>
						<view class="item-value">{{getBrandText(orderInfo.brand)}}</view>
					</view>
					<view class="divider"></view>
					<view class="detail-item">
						<view class="item-dot"></view>
						<view class="item-label">主项服务：</view>
						<view class="item-value">
							{{getDetailText(orderInfo.task_detail ? orderInfo.task_detail.detail : '')}}
							x
							{{orderInfo.task_detail ? orderInfo.task_detail.item_number : 0}}
						</view>
					</view>
					<view class="detail-sub-item" v-if="orderInfo.task_detail && orderInfo.task_detail.sn_mac_code && orderInfo.task_detail.sn_mac_code.length > 0">
						<view v-for="(code, index) in orderInfo.task_detail.sn_mac_code" :key="index" class="sn-code-item">
							<text class="sn-code-text">设备SN号：{{code.value}}</text>
							<view class="copy-code-btn" @tap="copyDeviceCode(code.value)">
								<text class="copy-text">复制</text>
							</view>
						</view>
					</view>
					<view class="detail-sub-item" v-if="orderInfo.task_detail && orderInfo.task_detail.shop_poi">
						<text>门店POI：{{orderInfo.task_detail.shop_poi}}</text>
					</view>
					<view class="divider"></view>
					<view class="detail-item" v-if="orderInfo.task_detail && orderInfo.task_detail.device_outside !== undefined">
						<view class="item-dot"></view>
						<view class="item-label">设备是否外摆：</view>
						<view class="item-value">
							{{ orderInfo.task_detail.device_outside ? '是' : '否' }}
						</view>
					</view>
					<view class="divider" v-if="orderInfo.task_detail && orderInfo.task_detail.device_outside !== undefined"></view>
					<view class="detail-item">
						<view class="item-dot"></view>
						<view class="item-label">服务门店：</view>
						<view class="item-value store-name-container">
							<text class="store-name-text">{{orderInfo.task_detail ? orderInfo.task_detail.store_name : ''}}</text>
							<view class="copy-store-btn" @tap="copyStoreName">
								<text class="copy-text">复制</text>
							</view>
						</view>
					</view>
					<view class="detail-sub-item address-container">
						<text class="address-text">{{orderInfo.province_name}}{{orderInfo.city_name}}{{orderInfo.district_name}}{{orderInfo.shop_address}}{{orderInfo.address}}</text>
						<view class="copy-address-btn" @tap="copyAddress">
							<text class="copy-text">复制</text>
						</view>
					</view>
					<view class="detail-sub-item" v-if="orderInfo.task_detail && orderInfo.task_detail.description">
						<text>{{orderInfo.task_detail.description}}</text>
					</view>
					<view class="store-images" v-if="orderInfo.task_detail && orderInfo.task_detail.pic_url && orderInfo.task_detail.pic_url.length > 0">
						<image v-for="(img, index) in orderInfo.task_detail.pic_url" :key="index" :src="img" mode="aspectFill" @click="previewImage(index)"></image>
					</view>
					<view class="divider"></view>
					<view class="detail-item">
						<view class="item-dot"></view>
						<view class="item-label">服务时效：</view>
						<view class="item-value" v-if="orderInfo.service_time_type === 'before_deadline'">
							{{orderInfo.deadline}}前完成
						</view>
						<view class="item-value" v-else-if="orderInfo.service_time_type === 'time_range'">
							{{orderInfo.range_start_date}} 至 {{orderInfo.range_end_date}}
						</view>
					</view>
					<view class="divider"></view>

					<!-- 建议骑手上门时间段 -->
					<view class="detail-item" v-if="orderInfo.recommended_service_time_start && orderInfo.recommended_service_time_end">
						<view class="item-dot"></view>
						<view class="item-label">建议骑手上门时间段：</view>
						<view class="item-value">
							{{ getRecommendedTimeDisplay() }}
						</view>
					</view>
					<view class="divider" v-if="orderInfo.recommended_service_time_start && orderInfo.recommended_service_time_end"></view>

					<!-- 订单备注 -->
					<view class="detail-item" v-if="orderInfo.task_detail && orderInfo.task_detail.additional_notes">
						<view class="item-dot"></view>
						<view class="item-label">订单备注：</view>
						<view class="item-value order-notes">
							{{ orderInfo.task_detail.additional_notes }}
						</view>
					</view>
					<view class="divider" v-if="orderInfo.task_detail && orderInfo.task_detail.additional_notes"></view>
					
					<!-- 价格明细（可展开） -->
					<view class="detail-item price-detail-toggle" @click="togglePriceDetail">
						<view class="item-dot"></view>
						<view class="item-label">价格明细</view>
						<view class="price-toggle">
							<!-- <text class="price-summary">¥{{orderInfo.order_amount}}</text> -->
							<view class="toggle-icon" :class="{ 'expanded': showPriceDetail }">
								<uni-icons type="bottom" size="16" color="#2492F2"></uni-icons>
							</view>
						</view>
					</view>
					
					<!-- 价格明细展开内容 -->
					<view class="price-detail-content" v-if="showPriceDetail">
						<view class="price-items">
							<view class="price-item">
								<text class="label">基础服务费</text>
								<text class="value">¥{{orderInfo.base_service_fee}}</text>
							</view>
							<view class="price-item">
								<text class="label">附加服务费</text>
								<text class="value">¥{{orderInfo.additional_service_fee}}</text>
							</view>
							<view class="price-item total">
								<text class="label">合计</text>
								<text class="value">¥{{orderInfo.order_amount}}</text>
							</view>
						</view>
					</view>
					
					<view class="divider"></view>
					</view>
					<!-- 模糊效果层 -->
					<view class="blur-mask" v-if="!isFullyExpanded"></view>
				</view>

				<!-- 取消订单按钮只在展开状态时显示 -->
				<view v-if="isFullyExpanded && (orderInfo.status === 'waiting' || orderInfo.status === 'assigned')" class="cancel-button-above-expand">
					<button class="btn cancel-btn" @click="cancelOrder">取消订单</button>
				</view>

				<!-- 展开/收起按钮 -->
				<view class="expand-btn" @click="toggleFullExpand">
					<view class="expand-btn-content">
						<text class="expand-text">{{ isFullyExpanded ? '收起' : '展开' }}</text>
						<view class="expand-icon" :class="{ 'expanded': isFullyExpanded }">
							<uni-icons type="bottom" size="16" color="#2492F2"></uni-icons>
						</view>
					</view>
				</view>
			</view>

			<!-- 完成反馈卡片 -->
			<view class="feedback-card" v-if="orderInfo.task_assignment && (orderInfo.task_assignment.status === 'finished' || orderInfo.status === 'completed')">
				<view class="card-title">
					<text>骑手完成反馈</text>
				</view>
				<view class="feedback-content">
					<view class="feedback-info">
						<view class="remark" v-if="orderInfo.task_assignment.finished_at">
							<text class="label">完成时间：</text>
							<text class="content">{{ orderInfo.task_assignment.finished_at }}</text>
						</view>
						<view class="remark" v-if="orderInfo.task_assignment.after_detail">
							<text class="label">完成反馈：</text>
							<text class="content">{{ orderInfo.task_assignment.after_detail }}</text>
						</view>
						<view class="remark" v-if="orderInfo.task_assignment.additional_feedback">
							<text class="label">其他备注：</text>
							<text class="content">{{ orderInfo.task_assignment.additional_feedback }}</text>
						</view>
						<view class="images-section" v-if="orderInfo.task_assignment.after_pic_url && orderInfo.task_assignment.after_pic_url.length > 0">
							<text class="section-title">反馈图片：</text>
							<view class="images">
								<view
									v-for="(url, index) in orderInfo.task_assignment.after_pic_url"
									:key="index"
									class="feedback-image-item">
									<image
										:src="url"
										mode="aspectFill"
										@click="previewFeedbackImage(index)"
										class="feedback-image">
									</image>
									<text class="image-label">{{ getFeedbackImageLabel(index) }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 用户确认卡片 -->
			<view class="confirm-card" v-if="orderInfo.status === 'completed'">
				<view class="card-title">
					<text>我已确认</text>
				</view>
				<view class="confirm-content">
					<view class="confirm-info">
						<view class="remark" v-if="orderInfo.completed_at">
							<text class="label">确认时间：</text>
							<text class="content">{{ formatDateTime(orderInfo.completed_at) }}</text>
						</view>
						<!-- 用户评价信息 -->
						<view class="review-section" v-if="orderInfo.review">
							<text class="section-title">用户评价：</text>
							<view class="review-content">
								<view class="review-rating" v-if="orderInfo.review.rating">
									<text class="rating-label">评分：</text>
									<view class="stars">
										<text
											v-for="star in 5"
											:key="star"
											class="star"
											:class="{ active: star <= orderInfo.review.rating }">
											★
										</text>
									</view>
									<text class="rating-text">{{ orderInfo.review.rating }}分</text>
								</view>
								<view class="review-tags" v-if="orderInfo.review.tags && orderInfo.review.tags.length > 0">
									<text class="tags-label">评价标签：</text>
									<view class="tags-list">
										<text
											v-for="(tag, index) in orderInfo.review.tags"
											:key="index"
											class="tag-item">
											{{ tag }}
										</text>
									</view>
								</view>
								<view class="review-comment" v-if="orderInfo.review.comment">
									<text class="comment-label">评价内容：</text>
									<text class="comment-text">{{ orderInfo.review.comment }}</text>
								</view>
								<view class="review-time" v-if="orderInfo.review.created_at">
									<text class="time-label">评价时间：</text>
									<text class="time-text">{{ formatDateTime(orderInfo.review.created_at) }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 底部按钮 -->
			<view v-if="orderInfo.task_assignment && orderInfo.task_assignment.status === 'finished'" class="bottom-button">
				<button class="btn confirm-btn" v-if="orderInfo.status === 'finished'" @click="confirmOrder">确认完成</button>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</view>

		<!-- 取消订单确认弹窗 -->
		<view class="cancel-modal-mask" v-if="showCancelModal" @click="closeCancelModal"></view>
		<view class="cancel-modal-container" v-if="showCancelModal">
			<view class="cancel-modal-header">
				<text class="cancel-modal-title">{{ cancelModalData.title }}</text>
				<view class="cancel-modal-close" @click="closeCancelModal">×</view>
			</view>
			<view class="cancel-modal-content">
				<text class="cancel-modal-text">{{ cancelModalData.content }}</text>
				<view class="cancel-reason-group">
					<text class="cancel-reason-label">取消原因</text>
					<textarea
						v-model="cancelReason"
						placeholder="请输入取消原因"
						class="cancel-reason-input"
						maxlength="200"
					></textarea>
				</view>
			</view>
			<view class="cancel-modal-footer">
				<view class="cancel-modal-btn cancel" @click="handleCancelAction">{{ cancelModalData.leftButton }}</view>
				<view class="cancel-modal-btn confirm" @click="handleConfirmAction">{{ cancelModalData.rightButton }}</view>
			</view>
		</view>

		<!-- 确认完成订单弹窗 -->
		<AuthModal
			:show="showConfirmModal"
			:title="confirmModalData.title"
			:content="confirmModalData.content"
			:cancelText="confirmModalData.leftButton"
			:confirmText="confirmModalData.rightButton"
			:cancelSubText="confirmModalData.leftSubText"
			:confirmSubText="confirmModalData.rightSubText"
			@cancel="handleConfirmCancel"
			@confirm="handleConfirmConfirm"
		></AuthModal>

		<!-- 悬浮聊天图标 -->
		<FloatingChatIconUser />
	</view>
</template>

<script>
	import NavBar from '@/components/NavBar.vue'
	import AuthModal from '@/components/AuthModal/index.vue'
	import FloatingChatIconUser from '@/components/FloatingChatIconUser/index.vue'
	import md5 from 'md5'

	export default {
		components: {
			NavBar,
			AuthModal,
			FloatingChatIconUser
		},
		data() {
			return {
				navBarHeight: 0,
				orderId: '',
				orderInfo: {
					task_id: '',
					status: '',
					task_type_name: '',
					contact_name: '',
					contact_phone: '',
					order_amount: 0,
					brand: '',
					detail: '',
					item_number: 0,
					sn_mac_code: [],
					store_name: '',
					province_name: '',
					city_name: '',
					district_name: '',
					shop_address: '',
					address: '',
					pic_url: [],
					description: '',
					service_time_type: '',
					deadline: '',
					range_start_date: '',
					range_end_date: '',
					base_amount: 0,
					extra_amount: 0
				},
				isFullyExpanded: false,
				showPriceDetail: false,
				showCancelModal: false,
				cancelModalData: {
					title: '',
					content: '',
					leftButton: '',
					rightButton: '',
					leftSubText: '',
					rightSubText: '',
					type: '' // 'waiting' 或 'assigned'
				},
				showConfirmModal: false,
				confirmModalData: {
					title: '确认完成提示',
					content: '确认后订单进入已完成状态，佣金将结算给骑手，是否继续？',
					leftButton: '取消',
					rightButton: '确认',
					leftSubText: '',
					rightSubText: ''
				},
				cancelReason: '' // 取消原因
			}
		},
		computed: {
		},
		onLoad(options) {
			// 计算导航栏高度
			const systemInfo = uni.getSystemInfoSync()
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			this.navBarHeight = menuButtonInfo.bottom + 12

			// 获取订单ID
			if (options.id) {
				this.orderId = options.id
				this.loadOrderDetail()
			}
		},
		methods: {
			// 加载订单详情
			async loadOrderDetail() {
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
					} else {
						uni.showToast({
							title: res.message || '获取订单详情失败',
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
			// 获取状态文本
			getStatusText(status) {
				const statusMap = {
					'waiting': '等待接单...',
					'assigned': '充充小哥在路上...',
					'finished_timeout': '超时完成',
					'finished': '待确认',
					'cancel': '已取消',
					'completed': '已完成'
				}
				return statusMap[status] || status
			},
			// 获取品牌文本
			getBrandText(brand) {
				const brandMap = {
					'meituan': '美团',
					'guaishou': '怪兽',
					'xiaodian': '小电',
					'jiedian': '街电',
					'zhumang': '竹芒'
				}
				return brandMap[brand] || brand
			},
			// 获取服务项文本
			getDetailText(detail) {
				const detailMap = {
					'bubao': '补宝',
					'offline_abnormal': '离线异常',
					'income_abnormal': '收入异常',
					'other_abnormal': '其他异常'
				}
				return detailMap[detail] || detail
			},
			// 预览图片
			previewImage(index) {
				if (!this.orderInfo.task_detail || !this.orderInfo.task_detail.pic_url) {
					return
				}
				uni.previewImage({
					urls: this.orderInfo.task_detail.pic_url,
					current: index,
					indicator: 'number'
				})
			},
			previewFeedbackImage(index) {
				if (!this.orderInfo.task_assignment || !this.orderInfo.task_assignment.after_pic_url) {
					return;
				}
				uni.previewImage({
					urls: this.orderInfo.task_assignment.after_pic_url,
					current: index,
					indicator: 'number'
				});
			},
			// 获取反馈图片标签
			getFeedbackImageLabel(index) {
				const labels = ['到店打卡', '维护前', '维护后', '其他反馈'];
				return labels[index] || `图片${index + 1}`;
			},
			goHome() {
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
			// 取消订单
			cancelOrder() {
				// 根据订单状态显示不同的取消确认弹窗
				if (this.orderInfo.status === 'assigned') {
					// 情况②：骑手已接单
					this.showCancelConfirm('assigned');
				} else {
					// 情况①：下单未接单
					this.showCancelConfirm('waiting');
				}
			},

			// 显示取消确认弹窗
			showCancelConfirm(type) {
				if (type === 'waiting') {
					// 情况①：下单未接单
					this.cancelModalData = {
						title: '温馨提示！',
						content: '充充骑手将在订单时效内稍后接单，调度已跟进，建议再等等哦！',
						leftButton: '狠心取消',
						rightButton: '调度催派',
						leftSubText: '',
						rightSubText: '',
						type: 'waiting'
					};
				} else if (type === 'assigned') {
					// 情况②：骑手已接单
					this.cancelModalData = {
						title: '特别提醒！',
						content: '您的订单已被骑手接单，小哥正在处理的路上。取消可能扣取一定比例费用补贴给骑手，不合算哦！',
						leftButton: '仍要取消',
						rightButton: '我已知晓',
						leftSubText: '确认扣款！',
						rightSubText: '请调度跟进！',
						type: 'assigned'
					};
				}
				this.showCancelModal = true;
			},

			// 关闭取消确认弹窗
			closeCancelModal() {
				this.showCancelModal = false;
			},

			// 处理取消操作（左侧按钮）
			handleCancelAction() {
				if (this.cancelModalData.type === 'waiting') {
					// 狠心取消
					this.performCancelOrder();
				} else if (this.cancelModalData.type === 'assigned') {
					// 仍要取消
					this.performCancelOrder();
				}
				this.closeCancelModal();
			},

			// 处理确认操作（右侧按钮）
			handleConfirmAction() {
				if (this.cancelModalData.type === 'waiting') {
					// 调度催派
					this.dispatchUrge();
				} else if (this.cancelModalData.type === 'assigned') {
					// 我已知晓
					this.closeCancelModal();
				}
			},

			// 调度催派
			dispatchUrge() {
				uni.showToast({
					title: '已通知调度加急处理',
					icon: 'success'
				});
				this.closeCancelModal();
			},

			// 执行取消订单
			performCancelOrder() {
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

				// 构建请求参数
				const params = {
					task_id: this.orderId,
					user_id: userInfo.user_id,
					reason: this.cancelReason.trim(),
					sign: 'chongchong'
				}

				// 调用取消订单接口
				uni.showLoading({
					title: '取消中...'
				})

				this.$request('task/cancel', params, 'POST').then(res => {
					uni.hideLoading()
					if (res.status === 'success') {
						uni.showToast({
							title: '申请成功 请等待平台审核!',
							icon: 'success'
						})
						// 清空取消原因并关闭弹窗
						this.cancelReason = ''
						this.closeCancelModal()
						// 延迟跳转到订单列表页面
						setTimeout(() => {
							uni.switchTab({
								url: '/pages/order/order'
							})
						}, 1500)
					} else {
						uni.showToast({
							title: res.message || '取消失败',
							icon: 'none'
						})
					}
				}).catch(err => {
					uni.hideLoading()
					console.error('取消订单失败:', err)
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
				})
			},

			// 确认完成订单
			confirmOrder() {
				this.showConfirmModal = true;
			},

			// 处理确认完成取消
			handleConfirmCancel() {
				this.showConfirmModal = false;
			},

			// 处理确认完成确认
			handleConfirmConfirm() {
				this.showConfirmModal = false;
				this.doConfirmOrder();
			},

			// 执行确认完成订单
			doConfirmOrder() {
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

				// 调用确认完成接口
				uni.showLoading({
					title: '确认中...'
				})

				this.$request('task/complete', params, 'POST').then(res => {
					uni.hideLoading()
					if (res.code === 200) {
						// 跳转到星级评价页面
						uni.navigateTo({
							url: `/pages/order/review?task_id=${this.orderId}`
						})
					} else {
						uni.showToast({
							title: res.message || '确认失败',
							icon: 'none'
						})
					}
				}).catch(err => {
					uni.hideLoading()
					console.error('确认完成失败:', err)
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
				})
			},
			// 切换详情内容的展开/收起状态
			toggleFullExpand() {
				this.isFullyExpanded = !this.isFullyExpanded
			},
			
			// 切换价格明细的展开/收起状态
			togglePriceDetail() {
				this.showPriceDetail = !this.showPriceDetail
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

			// 获取骑手显示名称
			getRiderDisplayName() {
				// 随机骑手名称列表
				const riderNames = [
					'小充哥',
					'充小二',
					'爱充充',
					'充充冲',
					'爱跑腿',
					'充充补宝',
					'小充充',
					'充充小二',
					'充小帅',
					'充呀冲'
				];

				// 如果没有骑手信息，返回随机名称
				if (!this.orderInfo.service_member) {
					const randomIndex = Math.floor(Math.random() * riderNames.length);
					return riderNames[randomIndex];
				}

				// 基于任务ID生成固定的随机索引，确保同一个骑手总是显示相同的名称
				const taskId = this.orderInfo.task_id;

				// 使用简单的哈希算法生成固定的索引
				let hash = 0;
				for (let i = 0; i < taskId.toString().length; i++) {
					const char = taskId.toString().charCodeAt(i);
					hash = ((hash << 5) - hash) + char;
					hash = hash & hash; // 转换为32位整数
				}

				const index = Math.abs(hash) % riderNames.length;
				return riderNames[index];
			},

			// 获取骑手头像
			getRiderAvatar() {
				const baseUrl = 'https://ccpt.qiniu.0871.cn/order/qishou/';

				// 基于骑手ID生成固定的随机索引，确保同一个骑手总是显示相同的头像
				const taskId = this.orderInfo.task_id;

				// 使用简单的哈希算法生成固定的索引
				let hash = 0;
				for (let i = 0; i < taskId.toString().length; i++) {
					const char = taskId.toString().charCodeAt(i);
					hash = ((hash << 5) - hash) + char;
					hash = hash & hash; // 转换为32位整数
				}

				// 生成1-26之间的数字
				const avatarNum = (Math.abs(hash) % 26) + 1;
				return `${baseUrl}${avatarNum}.png`;
			},

			// 获取骑手显示ID
			getRiderDisplayId() {
				if (!this.orderInfo.service_member) {
					return '';
				}

				const serviceMember = this.orderInfo.service_member;
				const riderId = serviceMember.service_member_id;

				if (!riderId) {
					return '';
				}

				// 生成随机后缀（2或5）
				const randomSuffix = Math.random() < 0.5 ? '2' : '5';
				return `ccqs${riderId}${randomSuffix}`;
			},

			// 获取总完单显示数量
			getTotalOrdersDisplay() {
				// 先尝试从 task_assignment.service_member 获取数据
				let serviceMember = null;
				if (this.orderInfo.task_assignment && this.orderInfo.task_assignment.service_member) {
					serviceMember = this.orderInfo.task_assignment.service_member;
				} else if (this.orderInfo.service_member) {
					// 如果 task_assignment.service_member 不存在，则从 service_member 获取
					serviceMember = this.orderInfo.service_member;
				}

				if (!serviceMember) {
					return 0;
				}

				const totalCompleted = serviceMember.total_completed_tasks_count || 0;

				// 如果总完单为0，返回0（不显示）
				if (totalCompleted === 0) {
					return 0;
				}

				// 总完单 * 10
				let displayCount = totalCompleted * 10;

				// 总完单最高不超过100，超过100使用最接近的数
				if (displayCount > 100) {
					// 找到最接近100的数，这里使用100作为上限
					displayCount = 100;
				}

				return displayCount;
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

			// 复制订单编号
			copyOrderNumber() {
				const orderNo = this.orderInfo.task_no;
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
				if (!storeName) {
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
				const address = `${this.orderInfo.province_name}${this.orderInfo.city_name}${this.orderInfo.district_name}${this.orderInfo.shop_address}${this.orderInfo.address}`;
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
			}
		}
	}
</script>

<style lang="scss" scoped>
	.order-detail {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 40rpx;

		.content {
			padding: 0;
			margin: 20rpx;
		}

		.order-header {
			background-color: #fff;
			padding: 30rpx 30rpx 0rpx 30rpx;
			margin-bottom: 0;

			.divider {
				height: 2rpx;
				background-color: #f5f5f5;
				margin: 20rpx 0;
			}

			.order-info-row {
				display: flex;
				justify-content: space-between;
				align-items: center; /* 改为水平居中对齐 */
				margin-bottom: 20rpx;

				.left-info {
					flex: 1;
					display: flex;
					flex-direction: column;
					position: relative;

					.order-number {
						font-size: 28rpx;
						color: #666;
						margin-top: 10px;
						margin-bottom: 12rpx; /* 增加间距 */
					}

					.waiting-status {
						position: absolute;
						top: 0;
						right: 0;
						background-color: rgba(36, 146, 242, 0.1);
						color: #ff7600;
						font-size: 24rpx;
						padding: 4rpx 8rpx;
						border-radius: 4rpx;
					}

					.assigned-status {
						position: absolute;
						top: 50%;
						right: 0;
						transform: translateY(-50%);
						background-color: rgba(255, 165, 0, 0.1);
						color: #FFA500;
						font-size: 24rpx;
						padding: 4rpx 8rpx;
						border-radius: 4rpx;
					}

					.finished-status {
						position: absolute;
						top: 50%;
						right: 0;
						transform: translateY(-50%);
						background-color: rgba(155, 89, 182, 0.1);
						color: #9B59B6;
						font-size: 24rpx;
						padding: 4rpx 8rpx;
						border-radius: 4rpx;
					}

					.completed-status {
						position: absolute;
						top: 50%;
						right: 0;
						transform: translateY(-50%);
						background-color: rgba(46, 204, 113, 0.1);
						color: #2ECC71;
						font-size: 24rpx;
						padding: 4rpx 8rpx;
						border-radius: 4rpx;
					}

					.timeout-status {
						position: absolute;
						top: 50%;
						right: 0;
						transform: translateY(-50%);
						background-color: rgba(255, 0, 0, 0.1);
						color: #FF0000;
						font-size: 24rpx;
						padding: 4rpx 8rpx;
						border-radius: 4rpx;
					}

					.order-time {
						font-size: 24rpx;
						color: #999;
					}

					.waiting-tip {
						position: absolute;
						top: 30px;
						right: 0;
						width: 240rpx;
						background-color: #F1FAFC;
						color: #419eea;
						font-size: 20rpx;
						padding: 8rpx 12rpx;
						border-radius: 4rpx;
						text-indent: 2em;
					}
				}

				.right-status {
					display: flex;
					flex-direction: column;
					align-items: flex-end;

					.status-gif {
						margin-bottom: 8rpx;

						.gif-image {
							width: 220rpx;
							height: 96rpx;
						}
					}

					.status-tag {
						color: #ff6b00;
						display: flex;
						align-items: center;
						background-color: rgba(255, 107, 0, 0.1);
						padding: 4rpx 12rpx;
						border-radius: 4rpx;
						margin-bottom: 4rpx;
						margin-top: 4rpx; /* 与promotion-banner对齐 */
						font-size: 22rpx;

						.arrow {
							margin-left: 6rpx;
							font-size: 20rpx;
						}
					}

					.waiting-description {
						background-color: rgba(36, 146, 242, 0.05);
						border-radius: 4rpx;
						padding: 6rpx 8rpx;
						max-width: 220rpx; /* 增加宽度以容纳缩进 */

						.description-text {
							font-size: 18rpx;
							color: #2492F2;
							line-height: 1.3;
							text-align: left; /* 确保左对齐 */
							text-indent: 36rpx; /* 首行缩进2个字符 */
							padding-left: 0; /* 确保没有额外的左内边距 */
							margin-left: 0; /* 确保没有左外边距 */
							word-wrap: break-word;
							word-break: break-all;
							display: block; /* 确保是块级元素 */
						}
					}
				}
			}

			.order-title {
				display: flex;
				align-items: center;
				padding: 10rpx 0;

				.order-icon {
					width: 120rpx;
					height: 120rpx;
					margin-right: 20rpx;
					border-radius: 8rpx;
				}

				.title-content {
					flex: 1;

					.main-title {
						font-size: 32rpx;
						color: #333;
						font-weight: 500;
						margin-bottom: 10rpx;
					}

					.contact {
						font-size: 28rpx;
						color: #666;
						margin-bottom: 10rpx;
					}

											.meta-row {
							display: flex;
							align-items: center;
							gap: 20rpx;
							margin-top: 6rpx;

							.copy-order-btn {
								display: flex;
								align-items: center;
								justify-content: center;
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
									font-size: 20rpx;
									color: #ffffff;
									line-height: 1;
									pointer-events: none;
								}
							}
						}
						.meta-number {
							font-size: 24rpx;
							color: #666;
						}
						.meta-time {
							font-size: 24rpx;
							color: #999;
						}
					}
			}


		}

		// 骑手已接单卡片样式
		.rider-assigned-card {
			background: linear-gradient(135deg, #E6F7FF, #F0F9FF);
			border: 2rpx solid #91D5FF;
			border-radius: 16rpx;
			margin: 15rpx 0;
			padding: 25rpx;
			box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.1);

			.rider-header {
				display: flex;
				align-items: center;
				justify-content: space-between;

				.rider-status {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;

					.status-gif {
						margin-top: -12px;

						.gif-image {
							width: 220rpx;
							height: 100rpx;
						}
					}

					.status-tag {
						color: #ff6b00;
						display: flex;
						align-items: center;
						background-color: rgba(255, 107, 0, 0.1);
						padding: 6rpx 12rpx;
						border-radius: 4rpx;
						font-size: 21rpx;

						.arrow {
							margin-left: 6rpx;
							font-size: 20rpx;
						}
					}
				}

				.rider-info {
					flex: 1;
					display: flex;
					align-items: flex-start;

					.rider-avatar {
						width: 80rpx;
						height: 80rpx;
						border-radius: 10%;
						margin-right: 20rpx;
						flex-shrink: 0;
					}

					.rider-content {
						flex: 1;
					}

					.rider-title {
						margin-bottom: 12rpx;

						.title-text {
							font-size: 32rpx;
							font-weight: 500;
							color: #1890FF;
						}
					}

					.accept-time {
						display: flex;
						align-items: center;
						margin-bottom: 10rpx;
						white-space: nowrap;
						overflow: hidden;

						.time-label {
							font-size: 24rpx;
							color: #666666;
							margin-right: 6rpx;
							flex-shrink: 0;
						}

						.time-value {
							font-size: 23rpx;
							color: #333333;
							font-weight: 400;
							overflow: hidden;
							text-overflow: ellipsis;
						}
					}

					.promotion-banner {
						margin-left: -50px;
						margin-top: 4rpx;
						margin-bottom: 8rpx;
						display: flex;
						justify-content: flex-start;
						align-items: center;

						.promotion-image {
							width: 400rpx;
							height: 42rpx;
						}
					}


				}
			}
		}

		.divider-line {
			height: 0rpx;
			background-color: #f5f5f5;
			margin: 10rpx 0;
		}

		.order-detail-card {
			background: #fff;
			border-radius: 12rpx;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
			margin: 20rpx 0 0 0;
			padding: 0;
		}

		.detail-list-toggle {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 80rpx;
			padding: 0 30rpx;
			border-radius: 12rpx 12rpx 0 0;
			border-bottom: 2rpx solid #f5f5f5;
		}

		.toggle-title {
			display: flex;
			align-items: center;
		}

		.header-icon {
			width: 38rpx;
			height: 38rpx;
			margin-right: 10rpx;
		}

		.header-title {
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
		}



		.detail-list-wrapper {
			position: relative;
			background: #fff;
			border-radius: 0 0 12rpx 12rpx;
		}

		.detail-list {
			padding: 30rpx;
			background: #fff;
			border-radius: 0 0 12rpx 12rpx;
			overflow: hidden;
			transition: max-height 0.3s ease;
		}

		/* 模糊效果层 */
		.blur-mask {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 120rpx;
			background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1));
			pointer-events: none;
			z-index: 1;
		}

		/* 展开/收起按钮 */
		.expand-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20rpx 0;
			background: #fff;
			border-radius: 0 0 12rpx 12rpx;
			position: relative;
			z-index: 2;
		}

		.expand-btn-content {
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #f5f5f5;
			border-radius: 30rpx;
			padding: 10rpx 30rpx;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
			transition: all 0.3s ease;
		}

		.expand-btn-content:active {
			transform: scale(0.98);
			box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.1);
		}

		.expand-text {
			color: #2492F2;
			font-size: 28rpx;
			font-weight: 500;
			margin-right: 10rpx;
		}

		.expand-icon {
			transition: transform 0.3s ease;
			display: flex;
			align-items: center;
		}

		.expand-icon.expanded {
			transform: rotate(180deg);
		}

		/* 取消订单按钮显示在展开/收起按钮上方 */
		.cancel-button-above-expand {
			padding: 20rpx 30rpx 10rpx;
			background: #fff;
			border-top: 1rpx solid #f0f0f0;

			.btn {
				width: 100%;
				height: 80rpx;
				line-height: 80rpx;
				font-size: 32rpx;
				border-radius: 40rpx;
				border: none;

				&.cancel-btn {
					background: #ff4d4f;
					color: #fff;
				}
			}
		}

		.detail-item {
			display: flex;
			align-items: flex-start;
			margin-bottom: 20rpx;
			padding-bottom: 20rpx;
			border-bottom: 2rpx solid #f5f5f5;


			.item-dot {
				width: 12rpx;
				height: 12rpx;
				border-radius: 50%;
				background-color: #2492F2;
				margin-right: 16rpx;
				margin-top: 8rpx;
			}

			.item-label {
				font-size: 28rpx;
				color: #333;
				width: 270rpx;
				text-align: left;
				flex-shrink: 0;
			}

			.item-value {
				flex: 1;
				font-size: 28rpx;
				color: #333;
				text-align: right;

				&.order-notes {
					text-align: right;
					line-height: 1.5;
					word-wrap: break-word;
					word-break: break-all;
					white-space: pre-wrap;
				}

				// 门店名称容器样式
				&.store-name-container {
					display: flex;
					align-items: center;
					justify-content: flex-end;

					.store-name-text {
						margin-right: 8rpx;
					}

					.copy-store-btn {
						display: flex;
						align-items: center;
						justify-content: center;
						padding: 4rpx 8rpx;
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
		}

		.price-detail-toggle {
			cursor: pointer;
			transition: background-color 0.2s;
			
			&:hover {
				background-color: #f8f9fa;
			}
			
			.price-toggle {
				display: flex;
				align-items: center;
				width: 100%;
				
				.price-summary {
					font-size: 32rpx;
					color: #ff4d4f;
					font-weight: 500;
					margin-left: auto;
					margin-right: 12rpx;
				}
				
				.toggle-icon {
					transition: transform 0.3s ease;
					flex-shrink: 0;
					
					&.expanded {
						transform: rotate(180deg);
					}
				}
			}
		}
		
		.price-detail-content {
			margin-top: 16rpx;
			padding: 20rpx;
			background-color: #f8f9fa;
			border-radius: 8rpx;
			margin-left: 40rpx;
		}
		
		.price-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 10rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.label {
				font-size: 28rpx;
				color: #333;
				flex: 1;
			}

			.value {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
				text-align: right;
				min-width: 120rpx;
			}

			&.total {
				margin-top: 10rpx;
				border-top: 2rpx solid #e8e8e8;
				padding-top: 10rpx;
				font-weight: 600;
			}
		}

		.detail-sub-item {
			font-size: 28rpx;
			color: #666;
			padding-left: 28rpx;
			margin-bottom: 20rpx;
			padding-bottom: 20rpx;
			border-bottom: 2rpx solid #f5f5f5;

			.sn-code-item {
				display: flex;
				align-items: center;
				margin-bottom: 10rpx;

				&:last-child {
					margin-bottom: 0;
				}

				.sn-code-text {
					margin-right: 8rpx;
				}

				.copy-code-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 4rpx 8rpx;
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

			// 地址容器样式
			&.address-container {
				display: flex;
				align-items: center;

				.address-text {
					flex: 1;
					margin-right: 8rpx;
				}

				.copy-address-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 4rpx 8rpx;
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

		.store-images {
			display: flex;
			padding-left: 28rpx;
			margin-bottom: 20rpx;
			padding-bottom: 20rpx;
			border-bottom: 2rpx solid #f5f5f5;

			image {
				width: 160rpx;
				height: 120rpx;
				margin-right: 20rpx;
				border-radius: 8rpx;
			}
		}

		.store-desc {
			margin-top: 10rpx;
			padding-bottom: 20rpx;
			border-bottom: 2rpx solid #f5f5f5;
		}

		.feedback-card, .confirm-card {
			background-color: #fff;
			margin: 20rpx 0rpx;
			border-radius: 12rpx;
			padding: 30rpx;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

			.card-title {
				font-size: 32rpx;
				font-weight: 500;
				color: #333;
				margin-bottom: 20rpx;
				border-left: 8rpx solid #2492F2;
				padding-left: 20rpx;
			}

			.feedback-content, .confirm-content {
				.feedback-header {
					margin-bottom: 0;

					.rider-info {
						display: flex;
						align-items: center;

						.avatar {
							width: 60rpx;
							height: 60rpx;
							border-radius: 50%;
							margin-right: 16rpx;
						}

						.name {
							font-size: 28rpx;
							color: #333;
						}
					}
				}

				.feedback-info, .confirm-info {
					margin-top: 20rpx;
				}

				.images-section {
					margin-top: 20rpx;

					.section-title {
						font-size: 28rpx;
						color: #666;
						margin-bottom: 16rpx;
						display: block;
					}

					.images {
						display: flex;
						flex-wrap: wrap;
						margin: 0 -8rpx;

						.feedback-image-item {
							width: calc(50% - 16rpx);
							margin: 8rpx;
							display: flex;
							flex-direction: column;
							align-items: center;

							.feedback-image {
								width: 100%;
								height: 160rpx;
								border-radius: 8rpx;
								margin-bottom: 8rpx;
							}

							.image-label {
								font-size: 22rpx;
								color: #666;
								text-align: center;
							}
						}
					}
				}

				.remark {
					font-size: 28rpx;
					color: #333;
					margin-bottom: 20rpx;
					line-height: 1.6;

					.label {
						color: #666;
						margin-right: 10rpx;
					}

					.content {
						color: #333;
					}
				}
			}
		}

		.bottom-button {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 20rpx;
			background-color: #fff;
			box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
			padding-bottom: calc(20rpx + env(safe-area-inset-bottom));

			.btn {
				width: 90%;
				height: 80rpx;
				line-height: 80rpx;
				font-size: 32rpx;
				border-radius: 40rpx;
				border: none;

				&.confirm-btn {
					background: #2492F2;
					color: #fff;
				}

				&.cancel-btn {
					background: #ff4d4f;
					color: #fff;
				}
			}
		}

		.bottom-placeholder {
			height: 140rpx;
		}

		.more-button {
			display: flex;
			justify-content: center;
			margin-bottom: 30rpx;

			text {
				font-size: 28rpx;
				color: #999;
			}
		}

		// 评价相关样式
		.review-section {
			margin-top: 20rpx;
			padding-top: 20rpx;
			border-top: 1rpx solid #f0f0f0;

			.section-title {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
				margin-bottom: 16rpx;
			}

			.review-content {
				.review-rating {
					display: flex;
					align-items: center;
					margin-bottom: 12rpx;

					.rating-label {
						font-size: 26rpx;
						color: #666;
						margin-right: 8rpx;
					}

					.stars {
						display: flex;
						margin-right: 8rpx;

						.star {
							font-size: 24rpx;
							color: #ddd;
							margin-right: 2rpx;

							&.active {
								color: #FFD700;
							}
						}
					}

					.rating-text {
						font-size: 24rpx;
						color: #666;
					}
				}

				.review-tags {
					margin-bottom: 12rpx;

					.tags-label {
						font-size: 26rpx;
						color: #666;
						margin-bottom: 8rpx;
						display: block;
					}

					.tags-list {
						display: flex;
						flex-wrap: wrap;
						margin: -4rpx;

						.tag-item {
							font-size: 22rpx;
							color: #2492F2;
							background-color: rgba(36, 146, 242, 0.1);
							padding: 4rpx 12rpx;
							border-radius: 12rpx;
							margin: 4rpx;
							border: 1rpx solid rgba(36, 146, 242, 0.2);
						}
					}
				}

				.review-comment {
					margin-bottom: 12rpx;

					.comment-label {
						font-size: 26rpx;
						color: #666;
						font-weight: 500;
						margin-bottom: 8rpx;
						display: block;
					}

					.comment-text {
						font-size: 26rpx;
						color: #333;
						line-height: 1.6;
						background-color: #f8f9fa;
						padding: 12rpx;
						border-radius: 8rpx;
						display: block;
					}
				}

				.review-time {
					.time-label {
						font-size: 24rpx;
						color: #999;
						margin-right: 8rpx;
					}

					.time-text {
						font-size: 24rpx;
						color: #999;
					}
				}
			}
		}


	}

	// 取消订单弹窗样式
	.cancel-modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
	}

	.cancel-modal-container {
		position: fixed;
		top: 40%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 85%;
		max-width: 600rpx;
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		z-index: 1000;
		animation: modalSlideIn 0.3s ease;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);

		.cancel-modal-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx;
			border-bottom: 1rpx solid #f0f0f0;

			.cancel-modal-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
			}

			.cancel-modal-close {
				width: 40rpx;
				height: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 36rpx;
				color: #999;
				cursor: pointer;
			}
		}

		.cancel-modal-content {
			padding: 30rpx;

			.cancel-modal-text {
				font-size: 28rpx;
				color: #666;
				line-height: 1.6;
				margin-bottom: 30rpx;
			}

			.cancel-reason-group {
				.cancel-reason-label {
					display: block;
					font-size: 26rpx;
					color: #333;
					font-weight: 500;
					margin-bottom: 16rpx;
				}

				.cancel-reason-input {
					width: 100%;
					min-height: 120rpx;
					padding: 20rpx;
					border: 1rpx solid #e0e0e0;
					border-radius: 12rpx;
					font-size: 26rpx;
					color: #333;
					background-color: #fafafa;
					box-sizing: border-box;
					resize: none;

					&:focus {
						border-color: #2492F2;
						background-color: #fff;
					}
				}
			}
		}

		.cancel-modal-footer {
			display: flex;
			border-top: 1rpx solid #f0f0f0;

			.cancel-modal-btn {
				flex: 1;
				height: 88rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 28rpx;
				font-weight: 500;
				cursor: pointer;

				&.cancel {
					color: #666;
					background-color: #f8f8f8;

					&:active {
						background-color: #e8e8e8;
					}
				}

				&.confirm {
					color: #fff;
					background-color: #2492F2;

					&:active {
						background-color: #1976D2;
					}
				}
			}
		}
	}

	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: translate(-50%, -60%) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}
</style>