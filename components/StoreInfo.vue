<template>
	<view class="info-card">
		<!-- 服务门店 -->
		<view class="form-item">
			<view class="form-label section-title">
				<view class="title-left">
					<text class="dot"></text>
					<text>服务门店</text>
				</view>
				<view class="history-section">
					<view class="history-btn" @click="showHistoryRecords">
						<text class="history-text">历史门店记录</text>
					</view>
					<text class="history-subtitle">一键导入服务过门店详情，更省时！</text>
				</view>
			</view>
		</view>

		<!-- 门店信息概览 -->
		<view class="store-overview" @click="navigateToStoreInfo">
			<view class="store-info-row">
				<text class="label">门店名称：</text>
				<text class="value">{{ formData.storeName || '点击填写门店信息' }}</text>
			</view>
			<view class="store-info-row">
				<text class="label">门店地址：</text>
				<view class="address-content">
					<text class="value">{{ formData.address || '未选择地址' }}</text>
					<text class="detail-value" v-if="formData.detailAddress">{{ formData.detailAddress }}</text>
				</view>
			</view>
			<view class="store-info-row contact-row">
				<view class="contact-item">
					<text class="label">联系电话：</text>
					<text class="value">{{ formData.phone || '未填写' }}</text>
				</view>
				<view class="contact-item right">
					<text class="label">联系人：</text>
					<text class="value">{{ formData.contact || '未填写' }}</text>
				</view>
			</view>
			<view class="store-info-row" v-if="hasValidMac">
				<text class="label">MAC码：</text>
				<text class="value">{{ formatSnMacList }}</text>
			</view>
			<view class="store-images" v-if="formData.doorImages && formData.doorImages.length > 0">
				<image v-for="(img, index) in formData.doorImages.slice(0, 3)" :key="index" :src="img"
					mode="aspectFill" />
				<text class="image-count"
					v-if="formData.doorImages.length > 3">+{{ formData.doorImages.length - 3 }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'StoreInfo',
		props: {
			formData: {
				type: Object,
				default: () => ({
					address: '',
					detailAddress: '',
					storeName: '',
					snMacList: [{
						value: ''
					}],
					phone: '',
					contact: ''
				})
			}
		},
		data() {
			return {
				userInfo: null
			}
		},
		created() {
			// 获取用户信息
			const userInfo = uni.getStorageSync('userInfo')
			if (userInfo) {
				this.userInfo = userInfo
				// 设置默认的联系电话和联系人
				this.$emit('update:formData', {
					...this.formData,
					phone: userInfo.phone_number || '',
					contact: userInfo.username || ''
				})
			}
			// 监听历史门店记录页面传递的数据
			uni.$on('storeHistorySelected', this.handleStoreHistorySelected)
		},
		beforeDestroy() {
			// 移除事件监听
			uni.$off('storeHistorySelected')
		},
		methods: {
			// 处理历史门店记录选择
			handleStoreHistorySelected(record) {
				console.log('接收到历史门店记录:', record);
				if (record) {
					const updatedData = {
						...this.formData
					};
					// 更新表单数据
					updatedData.address = record.address || '';
					updatedData.detailAddress = record.detailAddress || '';
					updatedData.longitude = record.longitude || '';
					updatedData.latitude = record.latitude || '';
					updatedData.province = record.province || '';
					updatedData.city = record.city || '';
					updatedData.district = record.district || '';
					updatedData.storeName = record.storeName || '';
					updatedData.doorImages = record.doorImages || [];
					updatedData.locationDesc = record.locationDesc || '';
					updatedData.device_outside = record.device_outside || false; // 设备是否外摆

					// 如果有SN/MAC码，也导入
					if (record.snMacList && record.snMacList.length > 0) {
						updatedData.snMacList = record.snMacList;
					}

					// 更新父组件的表单数据
					this.$emit('update:formData', updatedData);
				}
			},
			showHistoryRecords() {
				uni.navigateTo({
					url: '/pages/index/history-records/index'
				});
			},
			navigateToStoreInfo() {
				// 保存当前表单数据到本地存储
				uni.setStorageSync('storeInfo', this.formData);
				// 跳转到门店信息详情页
				uni.navigateTo({
					url: '/pages/index/publish/store-info/index'
				});
			}
		},
		computed: {
			hasValidMac() {
				return this.formData.snMacList &&
					this.formData.snMacList.some(item => item.value && item.value.trim());
			},
			formatSnMacList() {
				if (!this.hasValidMac) return '';
				const validMacs = this.formData.snMacList.filter(item => item.value && item.value.trim()).map(item => item
					.value);
				if (validMacs.length === 0) return '';
				if (validMacs.length === 1) return validMacs[0];
				return `${validMacs[0]} 等${validMacs.length}个`;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.info-card {
		background-color: #FFFFFF;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
	}

	.form-item {
		margin-bottom: 20rpx;

		&:first-child {
			margin-bottom: 30rpx;
		}
	}

	.form-label {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.dot {
			width: 12rpx;
			height: 12rpx;
			border-radius: 50%;
			background-color: #f00;
			margin-right: 12rpx;
		}

		text {
			font-size: 28rpx;
			color: #333;
		}

		&.section-title {
			margin-bottom: 30rpx;
			position: relative;
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;

			.title-left {
				display: flex;
				align-items: center;
			}

			text {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}

			.dot {
				width: 12rpx;
				height: 12rpx;
				background-color: #f00;
				margin-right: 12rpx;
			}

			.history-section {
				display: flex;
				flex-direction: column;
				align-items: flex-end;

				.history-btn {
					background-color: #F0F8FF;
					padding: 2rpx 16rpx;
					border-radius: 20rpx;
					/* 更圆的按钮 */
					border: 1px solid #E6F0FF;

					.history-text {
						font-size: 22rpx;
						color: #2492F2;
						font-weight: normal;
					}
				}

				.history-subtitle {
					font-size: 20rpx;
					color: #999999;
					margin-top: 6rpx;
					font-weight: normal;
				}
			}
		}
	}

	.store-overview {
		background-color: #F8F8F8;
		border-radius: 8rpx;
		padding: 20rpx;

		.store-info-row {
			display: flex;
			align-items: flex-start;
			margin-bottom: 12rpx;
			padding-bottom: 12rpx;
			border-bottom: 1rpx solid rgba(238, 238, 238, 0.6);

			&:last-child {
				margin-bottom: 0;
				padding-bottom: 0;
				border-bottom: none;
			}

			.label {
				width: 140rpx;
				font-size: 24rpx;
				color: #333;
				flex-shrink: 0;
			}

			.address-content {
				flex: 1;
				text-align: right;

				.value {
					font-size: 24rpx;
					color: #666;
				}

				.detail-value {
					font-size: 22rpx;
					color: #999;
					margin-left: 8rpx;
				}
			}

			.value {
				flex: 1;
				font-size: 24rpx;
				color: #666;
				text-align: right;
			}

			&.contact-row {
				display: flex;
				justify-content: space-between;

				.contact-item {
					display: flex;
					align-items: center;

					&:first-child {
						flex: 1;
					}

					&.right {
						flex: none;
						margin-left: 40rpx;
					}

					.label {
						width: auto;
						margin-right: 8rpx;
					}

					.value {
						text-align: left;
						color: #666;
					}
				}
			}
		}

		.store-images {
			display: flex;
			margin-top: 12rpx;
			position: relative;

			image {
				width: 100rpx;
				height: 100rpx;
				border-radius: 4rpx;
				margin-right: 12rpx;
				object-fit: cover;
			}

			.image-count {
				position: absolute;
				right: 0;
				bottom: 0;
				background: rgba(0, 0, 0, 0.5);
				color: #fff;
				font-size: 20rpx;
				padding: 2rpx 8rpx;
				border-radius: 4rpx;
			}
		}
	}
</style>