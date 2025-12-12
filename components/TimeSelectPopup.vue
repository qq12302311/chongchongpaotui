<template>
	<view class="time-select-popup" v-if="show">
		<view class="popup-mask" @click="handleClose"></view>
		<view class="popup-content">
			<view class="popup-header">
				<text class="title">选择时间</text>
				<text class="close" @click="handleClose">×</text>
			</view>
			
			<view class="time-type">
				<view 
					class="type-item" 
					:class="{ active: timeType === 'before_deadline' }"
					@click="selectTimeType('before_deadline')"
				>
					<text>约定时间</text>
				</view>
				<view 
					class="type-item" 
					:class="{ active: timeType === 'time_range' }"
					@click="selectTimeType('time_range')"
				>
					<text>指定区间</text>
				</view>
			</view>
			
			<view class="time-picker" v-if="timeType === 'before_deadline'">
				<picker mode="date" :value="selectedDate" @change="handleDateChange">
					<view class="picker-item">
						<text class="label">日期</text>
						<text class="value">{{selectedDate || '请选择日期'}}</text>
					</view>
				</picker>
				<picker mode="time" :value="selectedTime" @change="handleTimeChange">
					<view class="picker-item">
						<text class="label">时间</text>
						<text class="value">{{selectedTime || '请选择时间'}}</text>
					</view>
				</picker>
			</view>
			
			<view class="time-range" v-else>
				<picker mode="time" :value="selectedTimeRange[0]" @change="handleStartTimeChange">
					<view class="picker-item">
						<text class="label">开始时间</text>
						<text class="value">{{selectedTimeRange[0] || '请选择开始时间'}}</text>
					</view>
				</picker>
				<picker mode="time" :value="selectedTimeRange[1]" @change="handleEndTimeChange">
					<view class="picker-item">
						<text class="label">结束时间</text>
						<text class="value">{{selectedTimeRange[1] || '请选择结束时间'}}</text>
					</view>
				</picker>
			</view>
			
			<view class="popup-footer">
				<button class="confirm-btn" @click="handleConfirm">确定</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'TimeSelectPopup',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		selectedDate: {
			type: String,
			default: ''
		},
		selectedTime: {
			type: String,
			default: ''
		},
		selectedTimeRange: {
			type: Array,
			default: () => []
		},
		timeType: {
			type: String,
			default: 'before_deadline'
		}
	},
	methods: {
		handleClose() {
			this.$emit('update:show', false);
		},
		selectTimeType(type) {
			this.$emit('update:timeType', type);
		},
		handleDateChange(e) {
			this.$emit('update:selectedDate', e.detail.value);
		},
		handleTimeChange(e) {
			this.$emit('update:selectedTime', e.detail.value);
		},
		handleStartTimeChange(e) {
			const newRange = [...this.selectedTimeRange];
			newRange[0] = e.detail.value;
			this.$emit('update:selectedTimeRange', newRange);
		},
		handleEndTimeChange(e) {
			const newRange = [...this.selectedTimeRange];
			newRange[1] = e.detail.value;
			this.$emit('update:selectedTimeRange', newRange);
		},
		handleConfirm() {
			this.$emit('confirm', {
				timeType: this.timeType,
				date: this.selectedDate,
				time: this.selectedTime,
				timeRange: this.selectedTimeRange
			});
			this.handleClose();
		}
	}
}
</script>

<style lang="scss" scoped>
.time-select-popup {
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
		padding: 30rpx;
		
		.popup-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;
			
			.title {
				font-size: 32rpx;
				font-weight: 500;
				color: #333;
			}
			
			.close {
				font-size: 40rpx;
				color: #999;
				padding: 10rpx;
			}
		}
		
		.time-type {
			display: flex;
			margin-bottom: 30rpx;
			
			.type-item {
				flex: 1;
				height: 80rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: #f5f5f5;
				margin: 0 10rpx;
				border-radius: 8rpx;
				
				&.active {
					background-color: #2492F2;
					
					text {
						color: #fff;
					}
				}
				
				text {
					font-size: 28rpx;
					color: #666;
				}
			}
		}
		
		.time-picker, .time-range {
			.picker-item {
				display: flex;
				align-items: center;
				height: 88rpx;
				border-bottom: 1rpx solid #eee;
				margin-bottom: 20rpx;
				
				.label {
					width: 140rpx;
					font-size: 28rpx;
					color: #666;
				}
				
				.value {
					flex: 1;
					font-size: 28rpx;
					color: #333;
				}
			}
		}
		
		.popup-footer {
			margin-top: 40rpx;
			
			.confirm-btn {
				width: 100%;
				height: 88rpx;
				background-color: #2492F2;
				color: #fff;
				font-size: 32rpx;
				border-radius: 44rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
}
</style> 