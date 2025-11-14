<template>
	<view>
		<!-- 价格明细弹窗 -->
		<uni-popup ref="priceDetailPopup" type="bottom" :safe-area="true">
			<view class="price-detail-modal">
				<!-- 标题栏 -->
				<view class="modal-header">
					<text class="header-title">价格明细</text>
					<view class="close-btn" @click="closeModal">
						<text class="close-icon">✕</text>
					</view>
				</view>

				<!-- 内容区域 -->
				<scroll-view scroll-y class="modal-content" v-if="priceDetail">
					<!-- 订单基本信息 -->
					<view class="info-section">
						<view class="info-row">
							<text class="info-label">订单编号：</text>
							<text class="info-value">{{ priceDetail.task_id }}</text>
						</view>
						<view class="info-row" v-if="priceDetail.base_info">
							<text class="info-label">设备数量：</text>
							<text class="info-value">{{ priceDetail.base_info.item_number }}台</text>
						</view>
						<view class="info-row" v-if="priceDetail.base_info">
							<text class="info-label">服务距离：</text>
							<text class="info-value">{{ priceDetail.base_info.distance.toFixed(2) }}公里</text>
						</view>
						<view class="info-row" v-if="priceDetail.calculation_note">
							<text class="info-label">计费说明：</text>
							<text class="info-value">{{ priceDetail.calculation_note }}</text>
						</view>
					</view>

					<!-- 价格明细列表 -->
					<view class="detail-section" v-if="formattedDetail">
						<view 
							class="detail-category" 
							v-for="(category, index) in formattedDetail.detail_items" 
							:key="index"
						>
							<view class="category-header">
								<text class="category-name">{{ category.category }}</text>
								<text class="category-amount">¥{{ category.subtotal.toFixed(2) }}</text>
							</view>
							<view class="category-desc" v-if="category.description">
								<text>{{ category.description }}</text>
							</view>
							<view class="detail-items">
								<view 
									class="detail-item" 
									v-for="(item, itemIndex) in category.items" 
									:key="itemIndex"
								>
									<view class="item-left">
										<text class="item-name">{{ item.name }}</text>
										<text class="item-desc" v-if="item.description">{{ item.description }}</text>
									</view>
									<text class="item-amount" :class="{ 'negative': item.amount < 0 }">
										{{ item.amount >= 0 ? '+' : '' }}¥{{ item.amount.toFixed(2) }}
									</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 价格汇总 -->
					<view class="summary-section" v-if="formattedDetail && formattedDetail.summary">
						<view class="summary-row">
							<text class="summary-label">服务金额</text>
							<text class="summary-value">¥{{ formattedDetail.summary.service_amount.toFixed(2) }}</text>
						</view>
						<view class="summary-row" v-if="formattedDetail.summary.discount_amount > 0">
							<text class="summary-label">优惠抵扣</text>
							<text class="summary-value discount">-¥{{ formattedDetail.summary.discount_amount.toFixed(2) }}</text>
						</view>
						<view class="summary-row">
							<text class="summary-label">订单金额</text>
							<text class="summary-value">¥{{ formattedDetail.summary.total_amount.toFixed(2) }}</text>
						</view>
						<view class="summary-row" v-if="formattedDetail.summary.rider_tip_amount > 0">
							<text class="summary-label">骑手打赏</text>
							<text class="summary-value">¥{{ formattedDetail.summary.rider_tip_amount.toFixed(2) }}</text>
						</view>
						<view class="summary-row total-row">
							<text class="summary-label">实付金额</text>
							<text class="summary-value total">¥{{ formattedDetail.summary.payment_amount.toFixed(2) }}</text>
						</view>
					</view>

					<!-- 高价提示 -->
					<view class="high-price-tip" v-if="formattedDetail && formattedDetail.summary.is_high_price">
						<text class="tip-icon">💡</text>
						<text class="tip-text">此订单为高价订单，已保存详细价格明细供您随时查看</text>
					</view>

					<!-- 底部说明 -->
					<view class="footer-note">
						<text>*以上明细为订单创建时的价格计算详情</text>
					</view>
				</scroll-view>

				<!-- 加载状态 -->
				<view class="loading-state" v-if="loading">
					<text>加载中...</text>
				</view>

				<!-- 空状态 -->
				<view class="empty-state" v-if="!loading && !priceDetail">
					<text>暂无价格明细</text>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
export default {
	name: 'PriceDetailModal',
	props: {
		taskId: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			loading: false,
			priceDetail: null,
			formattedDetail: null
		};
	},
	methods: {
		/**
		 * 打开价格明细弹窗
		 */
		async openModal() {
			this.$refs.priceDetailPopup.open();
			if (this.taskId) {
				await this.loadPriceDetail();
			}
		},

		/**
		 * 关闭价格明细弹窗
		 */
		closeModal() {
			this.$refs.priceDetailPopup.close();
		},

		/**
		 * 加载价格明细
		 */
		async loadPriceDetail() {
			if (!this.taskId) {
				uni.showToast({
					title: '订单ID不能为空',
					icon: 'none'
				});
				return;
			}

			this.loading = true;

			try {
				// 获取用户信息
				const userInfo = uni.getStorageSync('userInfo');
				
				// 调用云函数查询价格明细
				const result = await uniCloud.callFunction({
					name: 'get-price-details',
					data: {
						task_id: this.taskId,
						user_id: userInfo?.user_id || '',
						is_admin: false // 如果是管理员，可以设置为true
					}
				});

				console.log('价格明细查询结果:', result);

				if (result.result && result.result.code === 200) {
					this.priceDetail = result.result.data.raw_data;
					this.formattedDetail = result.result.data.formatted_data;
				} else {
					uni.showToast({
						title: result.result?.message || '查询失败',
						icon: 'none'
					});
				}

			} catch (error) {
				console.error('查询价格明细失败:', error);
				uni.showToast({
					title: '查询失败，请重试',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		}
	}
};
</script>

<style scoped>
.price-detail-modal {
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
}

/* 标题栏 */
.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
	position: relative;
}

.header-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
}

.close-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-icon {
	font-size: 40rpx;
	color: #999;
}

/* 内容区域 */
.modal-content {
	flex: 1;
	padding: 30rpx;
	overflow-y: auto;
}

/* 基本信息 */
.info-section {
	background-color: #f8f8f8;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
}

.info-row {
	display: flex;
	margin-bottom: 16rpx;
	font-size: 28rpx;
}

.info-row:last-child {
	margin-bottom: 0;
}

.info-label {
	color: #666;
	min-width: 160rpx;
}

.info-value {
	color: #333;
	flex: 1;
}

/* 明细分类 */
.detail-section {
	margin-bottom: 24rpx;
}

.detail-category {
	margin-bottom: 32rpx;
}

.category-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 2rpx solid #2492F2;
}

.category-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.category-amount {
	font-size: 32rpx;
	font-weight: 600;
	color: #2492F2;
}

.category-desc {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
	padding-left: 8rpx;
}

/* 明细项 */
.detail-items {
	margin-top: 16rpx;
}

.detail-item {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 16rpx 8rpx;
	border-bottom: 1rpx solid #f5f5f5;
}

.detail-item:last-child {
	border-bottom: none;
}

.item-left {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.item-name {
	font-size: 28rpx;
	color: #333;
	margin-bottom: 8rpx;
}

.item-desc {
	font-size: 24rpx;
	color: #999;
	line-height: 1.5;
}

.item-amount {
	font-size: 28rpx;
	color: #333;
	margin-left: 20rpx;
	white-space: nowrap;
}

.item-amount.negative {
	color: #ff4d4f;
}

/* 汇总区域 */
.summary-section {
	background-color: #f8f8f8;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
}

.summary-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
	font-size: 28rpx;
}

.summary-row:last-child {
	margin-bottom: 0;
}

.summary-label {
	color: #666;
}

.summary-value {
	color: #333;
	font-weight: 500;
}

.summary-value.discount {
	color: #ff4d4f;
}

.total-row {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 1rpx solid #e0e0e0;
}

.total-row .summary-label,
.total-row .summary-value {
	font-size: 32rpx;
	font-weight: 600;
}

.total-row .summary-value.total {
	color: #ff4d4f;
}

/* 高价提示 */
.high-price-tip {
	background-color: #fff7e6;
	border: 1rpx solid #ffd591;
	border-radius: 8rpx;
	padding: 20rpx;
	display: flex;
	align-items: center;
	margin-bottom: 24rpx;
}

.tip-icon {
	font-size: 32rpx;
	margin-right: 12rpx;
}

.tip-text {
	flex: 1;
	font-size: 26rpx;
	color: #d46b08;
	line-height: 1.5;
}

/* 底部说明 */
.footer-note {
	text-align: center;
	padding: 20rpx 0;
	font-size: 24rpx;
	color: #999;
}

/* 加载和空状态 */
.loading-state,
.empty-state {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 100rpx;
	font-size: 28rpx;
	color: #999;
}
</style>






