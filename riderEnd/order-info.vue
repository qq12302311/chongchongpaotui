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
									<text class="copy-icon">📋</text>
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
					<text class="value ">{{ formatSnMacCodes }}</text>
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
						<view class="shop-name">{{ orderInfo.task_detail.store_name || '未知门店' }}</view>
						<view class="shop-address">{{ orderInfo.shop_address }}</view>
						<view class="shop-address">详细地址：{{ orderInfo.address }}</view>
						<view class="shop-images"
							v-if="orderInfo.task_detail && orderInfo.task_detail.pic_url && orderInfo.task_detail.pic_url.length > 0">
							<image v-for="(url, index) in orderInfo.task_detail.pic_url" :key="index" :src="url"
								mode="aspectFill" @click="previewImage(index)" class="shop-image"></image>
						</view>
						<view class="shop-remark">
							备注：{{ orderInfo.task_detail && orderInfo.task_detail.description || '无' }}</view>
						<!-- 新版导航按钮，绝对定位到右上角 -->
						<button class="nav-btn-mini" @click="openShopLocation" type="default">
							<image src="https://ccpt.qiniu.0871.cn/rider/dingwei4.svg" class="nav-icon" mode="aspectFit" />
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

		<!-- 完成反馈卡片 -->
		<view class="feedback-card" v-if="orderInfo.status === 'finished' || orderInfo.status === 'completed'">
			<view class="card-title">
				<text>完成反馈</text>
				<!-- 再次修改按钮，只在订单状态为待用户确认时显示 -->
				<button
					v-if="orderInfo.status === 'finished'"
					class="modify-btn"
					@click="modifyFeedback">
					再次修改
				</button>
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
				<text>用户确认</text>
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
		<view class="bottom-bar">
			<view class="home-btn" @click="goToHome">
				<image src="https://ccpt.qiniu.0871.cn/rider/home.png" mode="aspectFit"></image>
				<text>接单大厅</text>
			</view>
			<!-- <view class="chat-btn" @click="goToChat">
				<image src="https://ccpt.qiniu.0871.cn/rider/chat.png" mode="aspectFit"></image>
				<text>聊天</text>
			</view> -->
			<template v-if="orderInfo.status === 'assigned'">
				<button class="cancel-btn" @click="showCancelConfirm">放弃</button>
				<button class="confirm-btn" @click="showFeedbackPopup">提交完成订单反馈</button>
			</template>
			<button class="confirm-btn" v-else-if="orderInfo.status === 'finished'" disabled>24小时客户未确认  系统自动确认</button>
			<button class="confirm-btn" v-else-if="orderInfo.status === 'completed'" disabled>已确认完成</button>
			<button class="confirm-btn" v-else disabled>等待接单</button>
		</view>

		<!-- 完成反馈弹窗 -->
		<view class="feedback-popup" v-if="showPopup">
			<view class="popup-mask" @click="closeFeedbackPopup"></view>
			<view class="popup-content">
				<view class="popup-header">
					<text class="title">提交完成订单反馈</text>
					<text class="close" @click="closeFeedbackPopup">×</text>
				</view>
				<view class="popup-body">
					<view class="upload-section">
						<text class="section-title">上传完成照片<text class="required">*</text></text>
						<view class="image-grid">
							<!-- 到店打卡 -->
							<view class="image-upload-item">
								<text class="upload-label">到店打卡<text class="required">*</text></text>
								<view class="upload-container" @click="chooseImage('checkin')" v-if="!feedbackImages.checkin">
									<text class="plus">+</text>
									<text class="upload-text">上传照片</text>
								</view>
								<view class="image-preview" v-else>
									<image :src="feedbackImages.checkin" mode="aspectFill" class="preview-image"></image>
									<text class="delete-btn" @click="deleteImage('checkin')">×</text>
								</view>
							</view>

							<!-- 维护前 -->
							<view class="image-upload-item">
								<text class="upload-label">维护前<text class="required">*</text></text>
								<view class="upload-container" @click="chooseImage('before')" v-if="!feedbackImages.before">
									<text class="plus">+</text>
									<text class="upload-text">上传照片</text>
								</view>
								<view class="image-preview" v-else>
									<image :src="feedbackImages.before" mode="aspectFill" class="preview-image"></image>
									<text class="delete-btn" @click="deleteImage('before')">×</text>
								</view>
							</view>

							<!-- 维护后 -->
							<view class="image-upload-item">
								<text class="upload-label">维护后<text class="required">*</text></text>
								<view class="upload-container" @click="chooseImage('after')" v-if="!feedbackImages.after">
									<text class="plus">+</text>
									<text class="upload-text">上传照片</text>
								</view>
								<view class="image-preview" v-else>
									<image :src="feedbackImages.after" mode="aspectFill" class="preview-image"></image>
									<text class="delete-btn" @click="deleteImage('after')">×</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 其他反馈图片单独一行 -->
					<view class="other-images-section">
						<text class="section-title">其他反馈图片（选填，最多4张）</text>
						<view class="other-images-grid">
							<view
								v-for="(image, index) in otherImages"
								:key="index"
								class="other-image-item">
								<view class="image-preview">
									<image :src="image" mode="aspectFill" class="preview-image"></image>
									<text class="delete-btn" @click="deleteOtherImage(index)">×</text>
								</view>
							</view>
							<view
								v-if="otherImages.length < 4"
								class="other-image-item">
								<view class="upload-container" @click="chooseOtherImage">
									<text class="plus">+</text>
									<text class="upload-text">上传照片</text>
								</view>
							</view>
						</view>
					</view>
					<view class="remark-section">
						<text class="section-title">完成反馈<text class="required">*</text></text>
						<textarea class="remark-input" v-model="feedbackRemark" placeholder="请输入完成反馈" maxlength="200"></textarea>
						<text class="word-count">{{ feedbackRemark.length }}/200</text>
					</view>
					<view class="other-feedback-section">
						<text class="section-title">其他反馈（选填）</text>
						<textarea class="other-feedback-input" v-model="otherFeedback" placeholder="充充骑手您辛苦了！根据现场情况，您还有哪些反馈和建议。帮助客户提高收益、避免资损。亦有助于后续增加下单跑腿哦！" maxlength="200"></textarea>
						<text class="word-count">{{ otherFeedback.length }}/200</text>
					</view>
				</view>
				<view class="popup-footer">
					<button class="submit-btn" @click="submitFeedback">提交</button>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="loading">
			<div class="loading-spinner"></div>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 放弃任务确认弹窗 -->
		<auth-modal
			:show="showCancelModal"
			title="确认放弃提示！"
			content="放弃后任务将退回接单大厅！"
			confirmText="确认放弃"
			cancelText="不放弃了"
			@confirm="handleCancelConfirm"
			@cancel="handleCancelCancel"
		></auth-modal>
	</view>
</template>

<script>
	import NavBar from '@/components/NavBar.vue'
	import AuthModal from '@/components/AuthModal/index.vue'
	import md5 from 'md5'

	export default {
		components: {
			NavBar,
			AuthModal
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
				detailInfo: {
					shopName: '',
					detailAddress: '',
					priceDetails: [],
					snCode: '',
					macCode: '',
					shopImage: ''
				},
				showPopup: false,
				feedbackImages: {
					checkin: '', // 到店打卡
					before: '', // 维护前
					after: '' // 维护后
				},
				otherImages: [], // 其他反馈图片数组，最多4张
				feedbackRemark: '',
				otherFeedback: '',
				showCancelModal: false, // 控制放弃任务弹窗显示
				isModifyMode: false, // 标识是否为修改模式
				// 区域微信号映射
				regionWechatMap: {
					'京津冀 东三省 内蒙 海南': 'HKxgs2020',
					'云南贵州广西湖北西藏': 'weiazzy',
					'剩余区域': 'agan-24h'
				}
			}
		},
		computed: {
			// 转换品牌显示
			displayBrand() {
				const brand = this.orderInfo.brand || ''
				return this.brandMap[brand.toLowerCase()] || brand
			},

			// 格式化设备编码
			formatSnMacCodes() {
				const codes = (this.orderInfo.task_detail && this.orderInfo.task_detail.sn_mac_code) || []
				return codes.map(item => item.value).join('\n') || '无'
			},
			// 已将taskDuration从计算属性改为数据属性
		},
		onLoad(options) {
			// 确保taskId是字符串类型
			this.taskId = String(options.id || '');
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

			// 跳转到聊天页面
			goToChat() {
				// 使用订单ID作为聊天室ID
				const roomId = this.orderInfo.task_id || this.taskId || 'default'
				uni.navigateTo({
					url: `/riderEnd/chat-simple?roomId=${roomId}`
				})
			},

			// 显示放弃任务确认弹窗
			showCancelConfirm() {
				this.showCancelModal = true;
			},

			// 处理放弃任务确认
			handleCancelConfirm() {
				this.showCancelModal = false;
				this.cancelOrder();
			},

			// 处理放弃任务取消
			handleCancelCancel() {
				this.showCancelModal = false;
			},

			// 放弃任务
			async cancelOrder() {
				if (!this.taskId || !this.riderUserInfo) {
					uni.showToast({
						title: '参数错误',
						icon: 'none'
					});
					return;
				}

				// 显示加载提示
				uni.showLoading({
					title: '放弃中...',
					mask: true
				});

				try {
					// 构建请求参数
					const params = {
						task_id: parseInt(this.taskId),
						service_member_id: this.riderUserInfo.id,
						sign: 'chongchong'
					};

					console.log('放弃任务参数:', params);

					// 发送放弃任务请求
					const res = await this.$request('task/giveup', params, 'POST');

					console.log('放弃任务响应:', res);

					if (res.code === 200) {
						uni.showToast({
							title: '任务已放弃',
							icon: 'success'
						});
						// 延迟跳转到接单大厅
						setTimeout(() => {
							uni.redirectTo({
								url: '/riderEnd/index'
							});
						}, 1500);
					} else {
						uni.showToast({
							title: res.message || '放弃任务失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('放弃任务失败:', error);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			// 预览图片
			previewImage(current) {
				const urls = this.orderInfo.task_detail && this.orderInfo.task_detail.pic_url || []
				uni.previewImage({
					urls: urls,
					current: current
				})
			},
			showFeedbackPopup() {
				// 如果不是修改模式，清空所有数据
				if (!this.isModifyMode) {
					this.clearFeedbackData();
				}
				this.showPopup = true
			},

			// 清空反馈数据
			clearFeedbackData() {
				this.feedbackImages = {
					checkin: '',
					before: '',
					after: ''
				};
				this.otherImages = [];
				this.feedbackRemark = '';
				this.otherFeedback = '';
			},
			closeFeedbackPopup() {
				this.showPopup = false
				// 重置修改模式标识
				this.isModifyMode = false
			},
			async chooseImage(type) {
				try {
					const res = await uni.chooseImage({
						count: 1,
						sizeType: ['compressed'],
						sourceType: ['album', 'camera']
					})
					this.qiniuUploadFile(res.tempFilePaths, type)
				} catch (err) {
					console.error('选择图片失败:', err)
				}
			},
			// 开始上传七牛云
			qiniuUploadFile(tempFilePaths, type) {
				uni.showLoading({
					title: '上传中...',
					mask: true
				});

				uni.uploadFile({
					url: 'https://tixian.0871.cn/upload/qiniuImageUpload', // 服务器上传接口地址
					filePath: tempFilePaths[0],
					name: 'image', // 必须填写，后台用来接收文件
					formData: {
						'spaceName': 'agan_complain' // 其他要上传的参数
					},
					success: (uploadFileRes) => {
						const res = JSON.parse(uploadFileRes.data)
						this.feedbackImages[type] = res.path
						uni.hideLoading();
						uni.showToast({
							title: '上传成功',
							icon: 'success'
						});
					},
					fail: (uploadFileErr) => {
						console.error('图片上传失败', uploadFileErr);
						uni.hideLoading();
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						});
					}
				});
			},
			deleteImage(type) {
				this.feedbackImages[type] = ''
			},

			// 选择其他反馈图片
			async chooseOtherImage() {
				if (this.otherImages.length >= 4) {
					uni.showToast({
						title: '最多只能上传4张图片',
						icon: 'none'
					});
					return;
				}

				try {
					const res = await uni.chooseImage({
						count: 4 - this.otherImages.length, // 剩余可选择的数量
						sizeType: ['compressed'],
						sourceType: ['album', 'camera']
					})
					this.qiniuUploadOtherImages(res.tempFilePaths)
				} catch (err) {
					console.error('选择图片失败:', err)
				}
			},

			// 上传其他反馈图片到七牛云
			qiniuUploadOtherImages(tempFilePaths) {
				uni.showLoading({
					title: '上传中...',
					mask: true
				});

				let uploadCount = 0;
				const totalCount = tempFilePaths.length;

				tempFilePaths.forEach((filePath, index) => {
					uni.uploadFile({
						url: 'https://tixian.0871.cn/upload/qiniuImageUpload',
						filePath: filePath,
						name: 'image',
						formData: {
							'spaceName': 'agan_complain'
						},
						success: (uploadFileRes) => {
							const res = JSON.parse(uploadFileRes.data)
							this.otherImages.push(res.path)
							uploadCount++

							if (uploadCount === totalCount) {
								uni.hideLoading();
								uni.showToast({
									title: '上传成功',
									icon: 'success'
								});
							}
						},
						fail: (uploadFileErr) => {
							console.error('图片上传失败', uploadFileErr);
							uploadCount++

							if (uploadCount === totalCount) {
								uni.hideLoading();
							}

							uni.showToast({
								title: '部分图片上传失败',
								icon: 'none'
							});
						}
					});
				});
			},

			// 删除其他反馈图片
			deleteOtherImage(index) {
				this.otherImages.splice(index, 1)
			},
			async submitFeedback() {
				// 验证必填项
				if (!this.feedbackImages.checkin) {
					uni.showToast({
						title: '请上传到店打卡照片',
						icon: 'none'
					});
					return;
				}

				if (!this.feedbackImages.before) {
					uni.showToast({
						title: '请上传维护前照片',
						icon: 'none'
					});
					return;
				}

				if (!this.feedbackImages.after) {
					uni.showToast({
						title: '请上传维护后照片',
						icon: 'none'
					});
					return;
				}

				if (!this.feedbackRemark.trim()) {
					uni.showToast({
						title: '请输入完成反馈',
						icon: 'none'
					});
					return;
				}

				// 显示加载提示
				uni.showLoading({
					title: '提交中...',
					mask: true
				});

				try {
					// 计算sign参数
					const signStr = `service_member_id=${this.riderUserInfo.id}&phone_number=${this.riderUserInfo.phone}`;
					const sign = md5(signStr);

					// 构建图片数组，按指定顺序：第一张到店打卡、第二张维护前、第三张维护后、其他反馈图片
					const imageArray = [];
					// 第一张：到店打卡（必传）
					imageArray.push(this.feedbackImages.checkin);
					// 第二张：维护前（必传）
					imageArray.push(this.feedbackImages.before);
					// 第三张：维护后（必传）
					imageArray.push(this.feedbackImages.after);
					// 其他反馈图片（选填，可以有多张）
					if (this.otherImages && this.otherImages.length > 0) {
						imageArray.push(...this.otherImages);
					}

					// 构建提交数据
					const submitData = {
						task_id: parseInt(this.taskId),
						service_member_id: this.riderUserInfo.id,
						after_pic_url: imageArray,
						after_detail: this.feedbackRemark,
						additional_feedback: this.otherFeedback,
						sign: this.isModifyMode ? 'chongchong' : sign
					};

					let res;
					// 根据是否为修改模式调用不同的接口
					if (this.isModifyMode) {
						// 修改模式：调用更新接口
						res = await uni.request({
							url: 'https://ccpt.0871.cn/api/task/finish/update',
							method: 'POST',
							data: submitData,
							header: {
								'Content-Type': 'application/json'
							}
						});
						// 处理uni.request的响应格式
						res = res.data;
					} else {
						// 新建模式：调用原有接口
						res = await this.$request('task/finish', submitData, 'POST');
					}

					if (res.code === 200) {
						uni.showToast({
							title: this.isModifyMode ? '修改成功' : '提交成功',
							icon: 'success'
						});
						// 关闭弹窗
						this.closeFeedbackPopup();
						// 刷新订单信息
						this.getTaskInfo();
					} else {
						uni.showToast({
							title: res.message || (this.isModifyMode ? '修改失败' : '提交失败'),
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('提交反馈失败:', error);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			// 预览反馈图片
			previewFeedbackImage(current) {
				const urls = this.orderInfo.task_assignment.after_pic_url || []
				uni.previewImage({
					urls: urls,
					current: current
				})
			},
			// 获取反馈图片标签
			getFeedbackImageLabel(index) {
				const labels = ['到店打卡', '维护前', '维护后', '其他反馈'];
				return labels[index] || `图片${index + 1}`;
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
			callPhone(phoneNumber) {
				// 实现拨打电话的逻辑
				console.log('拨打电话:', phoneNumber);
				// 添加拨打电话逻辑
				if (phoneNumber) {
					uni.makePhoneCall({
						phoneNumber: phoneNumber,
						fail: (err) => {
							console.error('拨打电话失败:', err);
							uni.showToast({
								title: '拨打电话失败',
								icon: 'none'
							});
						}
					});
				} else {
					uni.showToast({
						title: '电话号码为空',
						icon: 'none'
					});
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

			// 显示分区运营信息 - 直接复制微信号
			showRegionWechat() {
				const region = this.getRegionByAddress();
				const wechat = this.regionWechatMap[region];

				uni.setClipboardData({
					data: wechat,
					success: () => {
						uni.showToast({
							title: '微信号已复制',
							icon: 'success'
						});
					},
					fail: () => {
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			},

			// 复制区域微信号
			copyRegionWechat() {
				const wechat = this.getCurrentRegionWechat();

				uni.setClipboardData({
					data: wechat,
					success: () => {
						uni.showToast({
							title: '微信号已复制',
							icon: 'success'
						});
					},
					fail: () => {
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			},

			// 再次修改完成反馈
			modifyFeedback() {
				// 设置为修改模式
				this.isModifyMode = true;

				// 预填充已提交的反馈数据
				this.prefillFeedbackData();

				// 打开反馈弹窗
				this.showFeedbackPopup();
			},

			// 预填充反馈数据
			prefillFeedbackData() {
				if (!this.orderInfo.task_assignment) return;

				const assignment = this.orderInfo.task_assignment;

				// 预填充文本内容
				this.feedbackRemark = assignment.after_detail || '';
				this.otherFeedback = assignment.additional_feedback || '';

				// 预填充图片
				if (assignment.after_pic_url && assignment.after_pic_url.length > 0) {
					const images = assignment.after_pic_url;

					// 根据图片数量和位置预填充
					// 第一张：到店打卡
					if (images[0]) {
						this.feedbackImages.checkin = images[0];
					}
					// 第二张：维护前
					if (images[1]) {
						this.feedbackImages.before = images[1];
					}
					// 第三张：维护后
					if (images[2]) {
						this.feedbackImages.after = images[2];
					}
					// 其他图片（第4张及以后）
					if (images.length > 3) {
						this.otherImages = images.slice(3);
					}
				}
			},
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

	.feedback-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;

		.popup-mask {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, 0.5);
		}

		.popup-content {
			position: absolute;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: #fff;
			border-radius: 24rpx 24rpx 0 0;
			padding-bottom: constant(safe-area-inset-bottom);
			padding-bottom: env(safe-area-inset-bottom);
			transform: translateY(0);
			transition: transform 0.3s ease-out;

			.popup-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 30rpx;
				border-bottom: 1rpx solid #eee;

				.title {
					font-size: 32rpx;
					font-weight: 500;
					color: #333;
				}

				.close {
					font-size: 40rpx;
					color: #999;
					padding: 0 20rpx;
				}
			}

			.popup-body {
				padding: 30rpx;
				max-height: 70vh;
				overflow-y: auto;

				.section-title {
					font-size: 28rpx;
					color: #333;
					margin-bottom: 20rpx;
					display: block;
				}

				.upload-section {
					margin-bottom: 40rpx;

					.image-grid {
						display: flex;
						justify-content: space-between;
						gap: 10rpx;

						.image-upload-item {
							flex: 1;
							display: flex;
							flex-direction: column;
							align-items: center;

							.upload-label {
								font-size: 22rpx;
								color: #333;
								margin-bottom: 8rpx;
								text-align: center;
								white-space: nowrap;
							}

							.upload-container {
								width: 100%;
								height: 120rpx;
								background-color: #f5f5f5;
								border-radius: 8rpx;
								display: flex;
								flex-direction: column;
								align-items: center;
								justify-content: center;
								border: 2rpx dashed #ddd;

								.plus {
									font-size: 32rpx;
									color: #999;
									margin-bottom: 4rpx;
								}

								.upload-text {
									font-size: 18rpx;
									color: #999;
								}
							}

							.image-preview {
								width: 100%;
								height: 120rpx;
								position: relative;

								.preview-image {
									width: 100%;
									height: 100%;
									border-radius: 8rpx;
								}

								.delete-btn {
									position: absolute;
									top: -8rpx;
									right: -8rpx;
									width: 28rpx;
									height: 28rpx;
									background-color: rgba(0, 0, 0, 0.6);
									color: #fff;
									border-radius: 50%;
									display: flex;
									align-items: center;
									justify-content: center;
									font-size: 20rpx;
								}
							}
						}
					}
				}

				.other-images-section {
					margin-bottom: 40rpx;

					.other-images-grid {
						display: flex;
						flex-wrap: nowrap;
						justify-content: flex-start;
						gap: 8rpx;

						.other-image-item {
							width: calc(25% - 6rpx);
							flex-shrink: 0;
							display: flex;
							flex-direction: column;
							align-items: center;

							.upload-container {
								width: 100%;
								height: 120rpx;
								background-color: #f5f5f5;
								border-radius: 8rpx;
								display: flex;
								flex-direction: column;
								align-items: center;
								justify-content: center;
								border: 2rpx dashed #ddd;

								.plus {
									font-size: 32rpx;
									color: #999;
									margin-bottom: 4rpx;
								}

								.upload-text {
									font-size: 18rpx;
									color: #999;
								}
							}

							.image-preview {
								width: 100%;
								height: 120rpx;
								position: relative;

								.preview-image {
									width: 100%;
									height: 100%;
									border-radius: 8rpx;
								}

								.delete-btn {
									position: absolute;
									top: -8rpx;
									right: -8rpx;
									width: 28rpx;
									height: 28rpx;
									background-color: rgba(0, 0, 0, 0.6);
									color: #fff;
									border-radius: 50%;
									display: flex;
									align-items: center;
									justify-content: center;
									font-size: 20rpx;
								}
							}
						}
					}
				}

				.remark-section {
					position: relative;

					.remark-input {
						width: 100%;
						height: 200rpx;
						background-color: #f5f5f5;
						border-radius: 8rpx;
						padding: 20rpx;
						font-size: 28rpx;
						box-sizing: border-box;
					}

					.word-count {
						position: absolute;
						right: 20rpx;
						bottom: 20rpx;
						font-size: 24rpx;
						color: #999;
					}
				}

				.other-feedback-section {
					margin-top: 30rpx;
					position: relative;

					.other-feedback-input {
						width: 100%;
						height: 200rpx;
						background-color: #F8F8F8;
						border-radius: 8rpx;
						padding: 20rpx;
						font-size: 28rpx;
						color: #333;
						box-sizing: border-box;
					}

					.word-count {
						position: absolute;
						right: 20rpx;
						bottom: 20rpx;
						font-size: 24rpx;
						color: #999;
					}
				}
			}

			.popup-footer {
				padding: 30rpx;
				border-top: 1rpx solid #eee;

				.submit-btn {
					width: 100%;
					height: 80rpx;
					background-color: #2492F2;
					border-radius: 40rpx;
					color: #fff;
					font-size: 32rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}
		}
	}

	.feedback-card, .confirm-card {
		background-color: #fff;
		margin: 20rpx;
		border-radius: 12rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

		.card-title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
			margin-bottom: 20rpx;
			border-left: 8rpx solid #2492F2;
			padding-left: 20rpx;

			.modify-btn {
				background-color: #2492F2;
				color: #fff;
				border: none;
				border-radius: 20rpx;
				padding: 8rpx 20rpx;
				font-size: 24rpx;
				font-weight: 400;
				margin: 0;
				min-width: auto;
				height: auto;
				line-height: 1;

				&:active {
					background-color: #1976D2;
				}
			}
		}

		.feedback-content, .confirm-content {
			.feedback-info, .confirm-info {
				.remark {
					font-size: 26rpx;
					color: #666;
					line-height: 1.6;
					margin-bottom: 12rpx;
				}

				.label {
					font-weight: 500;
				}

				.content {
					margin-left: 10rpx;
				}
			}

			.images-section {
				margin-top: 20rpx;
				margin-bottom: 20rpx;

				.section-title {
					font-size: 28rpx;
					color: #333;
					margin-bottom: 20rpx;
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
		}
	}

	.fee-detail {
		display: flex;
		flex-direction: column;
		gap: 12rpx;

		.fee-item {
			display: flex;
			justify-content: space-between;
			align-items: center;

			&.total {
				margin-top: 8rpx;
				padding-top: 8rpx;
				border-top: 1rpx solid #eee;

				.fee-label {
					font-weight: 500;
				}

				.fee-value {
					color: #FF6B00;
					font-weight: 500;
				}
			}

			.fee-label {
				font-size: 28rpx;
				color: #666;
			}

			.fee-value {
				font-size: 28rpx;
				color: #333;
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
</style>