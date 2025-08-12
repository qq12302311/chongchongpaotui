<template>
	<view class="info-card">
		<view>
			<view class="form-label section-title">
				<text class="dot"></text>
				<text>服务时效</text>
			</view>
			
			<!-- 服务时效 -->
			<view class="form-item">
				<view class="time-table">
					<!-- 约定时间范围内完成 -->
					<view class="time-table-row">
						<view class="time-table-cell time-option" :class="{'time-option-active': timeType === 'appointment'}" @click="selectTimeType('appointment')">
							<view class="option-circle" :style="{'border-color': timeType === 'appointment' ? brandColor : '#CCCCCC'}">
								<view v-if="timeType === 'appointment'" class="inner-circle" :style="{'background-color': brandColor}"></view>
							</view>
							<view class="option-content">
								<text :style="{'color': timeType === 'appointment' ? brandColor : '#333333'}">约定时间范围内完成</text>
								<text class="time-note">注：骑手在约定时间内任意时间点完成</text>
							</view>
						</view>
						<view class="time-table-cell time-value" @click="showAppointmentTimePicker">
							<text>{{ appointmentTime || '请选择时间范围' }}</text>
							<image src="https://ccpt.qiniu.0871.cn/publish/right.png" class="time-icon"></image>
						</view>
					</view>
					
					<!-- 指定时间区间内完成 -->
					<view class="time-table-row">
						<view class="time-table-cell time-option" :class="{'time-option-active': timeType === 'interval'}" @click="selectTimeType('interval')">
							<view class="option-circle" :style="{'border-color': timeType === 'interval' ? brandColor : '#CCCCCC'}">
								<view v-if="timeType === 'interval'" class="inner-circle" :style="{'background-color': brandColor}"></view>
							</view>
							<view class="option-content">
								<text :style="{'color': timeType === 'interval' ? brandColor : '#333333'}">指定时间区间内完成</text>
								<text class="time-note">注：骑手必须在指定时间区间内完成</text>
							</view>
						</view>
						<view class="time-table-cell time-value" @click="showTimeIntervalPicker">
							<text>{{ timeInterval || '请选择指定时间' }}</text>
							<image src="https://ccpt.qiniu.0871.cn/publish/right.png" class="time-icon"></image>
						</view>
					</view>
				</view>
				
				<!-- 时间选择弹窗 -->
				<time-picker 
					:show.sync="showTimePicker" 
					:type="currentTimeType"
					:lastSelectedTime="currentTimeType === 'appointment' ? lastAppointmentTime : null"
					:lastRemark="currentTimeType === 'appointment' ? timeRemark : ''"
					@select="handleTimeSelect"
				/>
			</view>
			
			<!-- 优惠券选择 -->
			<view class="coupon-section">
				<view class="time-table-row">
					<view class="time-table-cell time-option">
						<text>优惠券</text>
					</view>
					<view class="time-table-cell time-value" @click="showCouponPicker">
						<text>{{ coupon || '请选择优惠券' }}</text>
						<image src="https://ccpt.qiniu.0871.cn/publish/right.png" class="time-icon"></image>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import TimePicker from '@/components/time-picker/index.vue'
	
	export default {
		components: {
			TimePicker
		},
		props: {
			brandColor: {
				type: String,
				default: '#2492F2'
			}
		},
		data() {
			return {
				timeType: 'appointment',
				appointmentTime: '',
				timeInterval: '',
				timeRemark: '',
				showTimePicker: false,
				currentTimeType: 'appointment',
				lastAppointmentTime: null,
				coupon: ''
			}
		},
		methods: {
			selectTimeType(type) {
				if (type === 'appointment') {
					this.showAppointmentTimePicker();
				} else {
					this.showTimeIntervalPicker();
				}
			},
			showAppointmentTimePicker() {
				this.currentTimeType = 'appointment';
				this.showTimePicker = true;
			},
			showTimeIntervalPicker() {
				this.currentTimeType = 'interval';
				this.showTimePicker = true;
			},
			handleTimeSelect(item) {
				this.timeType = this.currentTimeType;
				
				if (this.currentTimeType === 'appointment') {
					this.appointmentTime = item.label;
					this.timeRemark = item.remark;
					this.lastAppointmentTime = item;
					this.timeInterval = '';
				} else {
					this.timeInterval = item.label;
					this.timeRemark = item.remark;
					this.appointmentTime = '';
				}
				
				this.$emit('time-select', {
					type: this.timeType,
					time: this.currentTimeType === 'appointment' ? this.appointmentTime : this.timeInterval,
					remark: this.timeRemark
				});
			},
			showCouponPicker() {
				this.$emit('show-coupon');
			},
			showPriceAgreement() {
				uni.navigateTo({
					url: '/pages/index/price-agreement/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.info-card {
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
	}
	
	.form-label {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		
		.dot {
			width: 10rpx;
			height: 10rpx;
			border-radius: 50%;
			background-color: #f00;
			margin-right: 10rpx;
		}
		
		text {
			font-size: 28rpx;
			color: #333;
		}
		
		&.section-title {
			margin-bottom: 30rpx;
			
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
		}
	}

	.time-table {
		margin-bottom: 30rpx;
		
		.time-table-row {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			padding: 24rpx 0;
			
			&:first-child {
				border-bottom: none;
			}
			
			&:last-child {
				border-bottom: 1rpx solid #eee;
			}
			
			.time-table-cell {
				display: flex;
				align-items: flex-start;
				
				&.time-option {
					width: 45%;
					white-space: nowrap;
					flex-shrink: 0;
					
					.option-circle {
						width: 36rpx;
						height: 36rpx;
						border: 2rpx solid #CCCCCC;
						border-radius: 50%;
						margin-right: 20rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						flex-shrink: 0;
						margin-top: 4rpx;
						
						.inner-circle {
							width: 24rpx;
							height: 24rpx;
							border-radius: 50%;
						}
					}
					
					.option-content {
						display: flex;
						flex-direction: column;
						
						text {
							font-size: 28rpx;
							color: #333;
							white-space: nowrap;
						}
						
						.time-note {
							font-size: 20rpx;
							color: #999;
							margin-top: 4rpx;
							white-space: nowrap;
						}
					}
				}
				
				&.time-value {
					width: 55%;
					justify-content: flex-end;
					flex-shrink: 1;
					min-width: 0;
					padding-top: 4rpx;
					
					text {
						font-size: 24rpx;
						color: #666;
						margin-right: 6rpx;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
					
					.time-icon {
						width: 24rpx;
						height: 24rpx;
						flex-shrink: 0;
					}
				}
			}
		}
	}

	.coupon-section {
		margin-bottom: 0;
		
		.time-table-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 24rpx 0;
			border-bottom: 1rpx solid #eee;
			
			.time-table-cell {
				display: flex;
				align-items: center;
				
				&.time-option {
					width: 45%;
					
					text {
						font-size: 28rpx;
						color: #333;
					}
				}
				
				&.time-value {
					width: 55%;
					justify-content: flex-end;
					
					text {
						font-size: 28rpx;
						color: #333;
						margin-right: 10rpx;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
					
					.time-icon {
						width: 32rpx;
						height: 32rpx;
						flex-shrink: 0;
					}
				}
			}
		}
	}
</style> 