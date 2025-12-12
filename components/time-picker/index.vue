<template>
	<view class="time-picker-popup" v-if="show">
		<view class="mask" @click="handleClose"></view>
		<view class="content-wrapper">
			<view class="content">
				<view class="header">
					<text class="title">选择时间</text>
					<text class="close" @click="handleClose">×</text>
				</view>

				<!-- 约定时间内完成 -->
				<view v-if="type === 'before_deadline'">
					<view class="time-options">
						<view class="time-option" v-for="(option, index) in appointmentOptions" :key="index" :class="{
								active: selectedTime && selectedTime.value === option.value,
								'last-selected': lastSelectedTime && lastSelectedTime.value === option.value && (!selectedTime || selectedTime.value !== option.value)
							}" @click="selectTime(option)">
							<text>{{ option.label }}</text>
							<view v-if="option.label === '48小时内'" class="recommend-tag">推荐</view>
							<view class="price-tag" v-if="option.price !== undefined">¥{{ option.price }}</view>
						</view>
					</view>
				</view>

				<!-- 指定时间区间完成 -->
				<view v-else>
					<!-- 日期选择 -->
					<view class="date-section">
						<text class="section-title">选择日期</text>
						<picker mode="date" :value="selectedDate" :start="startDate" :end="endDate"
							@change="handleDateChange">
							<view class="date-picker">
								<text>{{ selectedDate || '请选择日期' }}</text>
								<image src="https://ccpt.qiniu.0871.cn/publish/right.png" class="picker-icon"></image>
							</view>
						</picker>
					</view>

					<!-- 时间区间选择 -->
					<view class="time-section">
						<text class="section-title">选择时间区间</text>
						<view class="time-range-picker">
							<picker mode="selector" :value="startTimeIndex" :range="timeOptions"
								@change="handleStartTimeChange">
								<view class="time-picker">
									<text>{{ startTime || '开始时间' }}</text>
									<image src="https://ccpt.qiniu.0871.cn/publish/right.png" class="picker-icon">
									</image>
								</view>
							</picker>
							<text class="time-separator">至</text>
							<picker mode="selector" :value="endTimeIndex" :range="timeOptions"
								@change="handleEndTimeChange">
								<view class="time-picker">
									<text>{{ endTime || '结束时间' }}</text>
									<image src="https://ccpt.qiniu.0871.cn/publish/right.png" class="picker-icon">
									</image>
								</view>
							</picker>
						</view>
						<text class="time-note" v-if="showTimeNote">{{ timeNote }}</text>
					</view>
				</view>

				<!-- 温馨提示 -->
				<view class="time-tip">
					<text class="tip-text">温馨提示：48小时内为标准时效(推荐)，低于48小时为加急(费用增加)，超过48小时费用优惠！</text>
				</view>

				<!-- 备注部分 -->
				<!-- <view class="remark-section">
					<view class="remark-header">
						<text class="label">备注（选填）</text>
						<text class="count">{{ remark.length }}/100</text>
					</view>
					<textarea class="remark-input" v-model="remark" placeholder="请输入备注信息" :maxlength="100"
						:show-confirm-bar="false" />
				</view> -->

				<view class="footer">
					<button class="confirm-btn" :disabled="!canConfirm" @click="handleConfirm">确认</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'TimePicker',
		props: {
			show: {
				type: Boolean,
				default: false
			},
			type: {
				type: String,
				default: 'before_deadline'
			},
			lastSelectedTime: {
				type: Object,
				default: () => null
			},
			lastRemark: {
				type: String,
				default: ''
			},
			pricesStr: {
				type: String,
				default: '{}'
			}
		},
		data() {
			const now = new Date();
			const year = now.getFullYear();
			const month = String(now.getMonth() + 1).padStart(2, '0');
			const day = String(now.getDate()).padStart(2, '0');
			const hours = now.getHours();
			const minutes = String(now.getMinutes()).padStart(2, '0');

			return {
				appointmentOptions: [],
				timeOptions: [],
				selectedTime: null,
				selectedDate: '',
				startTime: '',
				endTime: '',
				remark: '',
				startDate: `${year}-${month}-${day}`,
				endDate: `${year + 1}-${month}-${day}`,
				minTime: `${hours}:${minutes}`,
				maxTime: '23:59',
				startTimeIndex: -1,
				endTimeIndex: -1,
				timeNote: '',
				showTimeNote: false
			}
		},
		created() {
			// 初始化时间选项
			this.initTimeOptions();
			// 初始化约定时间选项
			this.initAppointmentOptions();
		},
		computed: {
			canConfirm() {
				if (this.type === 'before_deadline') {
					return this.selectedTime !== null;
				} else {
					return this.selectedDate && this.startTime && this.endTime;
				}
			}
		},
		watch: {
			show(newVal) {
				if (newVal) {
					if (this.type === 'before_deadline' && this.lastSelectedTime) {
						this.selectedTime = this.lastSelectedTime;
						this.remark = this.lastRemark;
					}
					// 当弹窗显示时，更新价格信息
					this.updatePrices();
				} else {
					this.reset();
				}
			},
			pricesStr: {
				handler(newVal) {
					// 当价格信息变化时，重新初始化约定时间选项并更新价格
					this.initAppointmentOptions();
					this.updatePrices();
				}
			}
		},
		methods: {
			// 初始化约定时间选项，根据布尔值过滤
			initAppointmentOptions() {
				// 所有可能的时间选项配置
				const allTimeOptions = [
					{ label: '1小时内', value: 1, price: 0 },
					{ label: '2小时内', value: 2, price: 0 },
					{ label: '3小时内', value: 3, price: 0 },
					{ label: '4小时内', value: 4, price: 0 },
					{ label: '5小时内', value: 5, price: 0 },
					{ label: '6小时内', value: 6, price: 0 },
					{ label: '7小时内', value: 7, price: 0 },
					{ label: '8小时内', value: 8, price: 0 },
					{ label: '24小时内', value: 24, price: 0 },
					{ label: '48小时内', value: 48, price: 0 },
					{ label: '72小时内', value: 72, price: 0 }
				];

				// 解析价格字符串获取可用性配置
				let prices = {};
				try {
					prices = JSON.parse(this.pricesStr || '{}');
				} catch (e) {
					console.error('解析价格信息失败:', e);
					// 如果解析失败，默认显示标准选项
					this.appointmentOptions = [
						{ label: '24小时内', value: 24, price: 0 },
						{ label: '48小时内', value: 48, price: 0 },
						{ label: '72小时内', value: 72, price: 0 }
					];
					return;
				}

				// 根据 bubao_time_limit_x_available 布尔值过滤选项
				this.appointmentOptions = [];

				for (let i = 1; i <= 9; i++) {
					const availableKey = `bubao_time_limit_${i}_available`;
					const timeLimitKey = `bubao_time_limit_${i}`;

					// 检查该时效是否可用
					if (prices[availableKey] === true && prices[timeLimitKey]) {
						const hours = parseInt(prices[timeLimitKey]);
						const option = allTimeOptions.find(opt => opt.value === hours);
						if (option) {
							this.appointmentOptions.push({
								...option,
								price: parseFloat(prices[`bubao_time_limit_${i}_fee`]) || 0
							});
						}
					}
				}

				// 如果没有可用选项，显示默认选项
				if (this.appointmentOptions.length === 0) {
					this.appointmentOptions = [
						{ label: '24小时内', value: 24, price: 0 },
						{ label: '48小时内', value: 48, price: 0 },
						{ label: '72小时内', value: 72, price: 0 }
					];
				}

				console.log('已过滤的时效选项:', this.appointmentOptions);
			},
			initTimeOptions() {
				const now = new Date();
				const hours = now.getHours();

				this.timeOptions = [];

				// 判断当前时间是否在可下单时间段内
				if (hours >= 7 && hours < 23) {
					// 7点至22点之间，可以下2小时以后的区间时效订单
					const minHour = hours + 2; // 最小可选时间为当前时间+2小时

					for (let i = minHour; i <= 22; i += 2) {
						this.timeOptions.push(`${String(i).padStart(2, '0')}:00`);
					}

					this.timeNote = `当前时间${hours}:00，可预约${minHour}:00-22:00的时间区间（间隔2小时）`;
					this.showTimeNote = true;
				} else {
					// 23点至次日7点之间，不可下区间时效订单
					this.timeNote = '23:00-次日7:00不可下区间时效订单';
					this.showTimeNote = true;
				}
			},
			handleClose() {
				this.$emit('update:show', false);
				this.reset();
			},
			selectTime(item) {
				this.selectedTime = item;
				// 发送选择事件，但不关闭弹窗
				this.$emit('timeOptionSelected', {
					type: this.type,
					label: item.value,
					textShow: item.label,
					remark: this.remark
				});
			},
			handleDateChange(e) {
				const selectedDate = e.detail.value;
				this.selectedDate = selectedDate;

				const now = new Date();
				const selected = new Date(selectedDate);

				this.timeOptions = [];

				// 如果选择的日期是今天
				if (selected.toDateString() === now.toDateString()) {
					const hours = now.getHours();

					// 判断当前时间是否在可下单时间段内
					if (hours >= 7 && hours < 23) {
						// 7点至22点之间，可以下2小时以后的区间时效订单
						const minHour = hours + 2; // 最小可选时间为当前时间+2小时

						for (let i = minHour; i <= 22; i += 2) {
							this.timeOptions.push(`${String(i).padStart(2, '0')}:00`);
						}

						this.timeNote = `当前时间${hours}:00，可预约${minHour}:00-22:00的时间区间（间隔2小时）`;
						this.showTimeNote = true;
					} else {
						// 23点至次日7点之间，不可下区间时效订单
						this.timeNote = '23:00-次日7:00不可下区间时效订单';
						this.showTimeNote = true;
					}
				} else {
					// 其他日期，全天可预约
					for (let i = 7; i <= 22; i += 2) {
						this.timeOptions.push(`${String(i).padStart(2, '0')}:00`);
					}

					this.timeNote = '可预约7:00-22:00的时间区间（间隔2小时）';
					this.showTimeNote = true;
				}

				// 重置时间选择
				this.startTime = '';
				this.endTime = '';
				this.startTimeIndex = -1;
				this.endTimeIndex = -1;

				// 发送日期变更事件
				this.$emit('timeOptionSelected', {
					type: this.type,
					dateChanged: true,
					selectedDate: selectedDate
				});
			},
			handleStartTimeChange(e) {
				const index = Number(e.detail.value);
				this.startTimeIndex = index;
				this.startTime = this.timeOptions[index];

				// 如果结束时间早于开始时间，重置结束时间
				if (this.endTime && this.endTime <= this.startTime) {
					this.endTime = '';
					this.endTimeIndex = -1;
				}

				// 发送时间变更事件
				if (this.selectedDate && this.startTime) {
					this.$emit('timeOptionSelected', {
						type: this.type,
						timeChanged: true,
						startTime: this.startTime,
						endTime: this.endTime,
						selectedDate: this.selectedDate
					});
				}
			},
			handleEndTimeChange(e) {
				const index = Number(e.detail.value);
				const newEndTime = this.timeOptions[index];

				// 确保结束时间不早于开始时间
				if (!this.startTime || newEndTime > this.startTime) {
					this.endTime = newEndTime;
					this.endTimeIndex = index;

					// 发送时间变更事件
					if (this.selectedDate && this.startTime && this.endTime) {
						this.$emit('timeOptionSelected', {
							type: this.type,
							timeChanged: true,
							startTime: this.startTime,
							endTime: this.endTime,
							selectedDate: this.selectedDate
						});
					}
				}
			},
			handleConfirm() {
				if (this.type === 'time_range' && (!this.startTime || !this.endTime)) {
					uni.showToast({
						title: '请选择完整的时间区间',
						icon: 'none'
					});
					return;
				}

				// 构建返回数据
				const result = {
					type: this.type,
					label: '',
					textShow: '',
					remark: this.remark
				};

				if (this.type === 'before_deadline') {
					// 约定时间范围内完成
					if (this.selectedTime) {
						result.label = this.selectedTime.value;
						result.textShow = this.selectedTime.label;
					}
				} else {
					// 指定时间区间内完成
					const startDate = new Date(this.selectedDate);
					const endDate = new Date(this.selectedDate);

					// 设置开始时间
					const [startHours, startMinutes] = this.startTime.split(':');
					startDate.setHours(parseInt(startHours), parseInt(startMinutes));

					// 设置结束时间
					const [endHours, endMinutes] = this.endTime.split(':');
					endDate.setHours(parseInt(endHours), parseInt(endMinutes));

					// 格式化日期时间
					const formatDateTime = (date) => {
						const year = date.getFullYear();
						const month = String(date.getMonth() + 1).padStart(2, '0');
						const day = String(date.getDate()).padStart(2, '0');
						const hours = String(date.getHours()).padStart(2, '0');
						const minutes = String(date.getMinutes()).padStart(2, '0');
						const seconds = String(date.getSeconds()).padStart(2, '0');
						return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
					};

					result.label = `${formatDateTime(startDate)}-${formatDateTime(endDate)}`;
					result.textShow = `${this.selectedDate} ${this.startTime}-${this.endTime}`;
				}

				this.$emit('select', result);
				this.handleClose();
			},
			reset() {
				this.selectedTime = null;
				this.selectedDate = '';
				this.startTime = '';
				this.endTime = '';
				this.remark = '';
				this.startTimeIndex = -1;
				this.endTimeIndex = -1;
				this.initTimeOptions();
			},
			// 更新时间选项的价格
			updatePrices() {
				// 解析价格字符串
				let prices = {};
				try {
					prices = JSON.parse(this.pricesStr || '{}');
				} catch (e) {
					console.error('解析价格信息失败:', e);
					return;
				}

				if (!prices || Object.keys(prices).length === 0) return;

				// 更新所有时间选项的价格
				this.appointmentOptions.forEach(option => {
					const price = this.getPriceForHours(option.value, prices);
					if (price !== null) {
						option.price = price;
					}
				});
			},
			// 根据小时数获取对应的价格
			getPriceForHours(hours, prices) {
				if (!prices) return null;

				// 遍历时间限制配置，查找对应的价格
				for (let i = 1; i <= 10; i++) {
					const timeLimit = prices[`bubao_time_limit_${i}`];
					const timeLimitFee = prices[`bubao_time_limit_${i}_fee`];

					if (timeLimit && hours <= parseInt(timeLimit)) {
						return parseFloat(timeLimitFee) || 0;
					}
				}

				return null;
			},
			// 处理时间选择变化
			handleTimeChange(e) {
				const {
					type,
					value
				} = e.detail;
				if (type === 'start') {
					this.startTime = value;
					// 如果结束时间早于开始时间，则更新结束时间
					if (this.endTime && this.endTime < value) {
						this.endTime = value;
					}
				} else if (type === 'end') {
					this.endTime = value;
				}
			},
			// 确认选择
			confirmSelection() {
				if (this.type === 'time_range' && (!this.startTime || !this.endTime)) {
					uni.showToast({
						title: '请选择完整的时间区间',
						icon: 'none'
					});
					return;
				}

				// 构建返回数据
				const result = {
					type: this.type,
					label: '',
					textShow: '',
					remark: this.remark
				};

				if (this.type === 'before_deadline') {
					// 约定时间范围内完成
					const selectedOption = this.timeOptions.find(option => option.value === this.selectedTime);
					if (selectedOption) {
						result.label = selectedOption.value;
						result.textShow = selectedOption.label;
					}
				} else {
					// 指定时间区间内完成
					const startDate = new Date(this.selectedDate);
					const endDate = new Date(this.selectedDate);

					// 设置开始时间
					const [startHours, startMinutes] = this.startTime.split(':');
					startDate.setHours(parseInt(startHours), parseInt(startMinutes));

					// 设置结束时间
					const [endHours, endMinutes] = this.endTime.split(':');
					endDate.setHours(parseInt(endHours), parseInt(endMinutes));

					// 格式化日期时间
					const formatDateTime = (date) => {
						const year = date.getFullYear();
						const month = String(date.getMonth() + 1).padStart(2, '0');
						const day = String(date.getDate()).padStart(2, '0');
						const hours = String(date.getHours()).padStart(2, '0');
						const minutes = String(date.getMinutes()).padStart(2, '0');
						const seconds = String(date.getSeconds()).padStart(2, '0');
						return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
					};

					result.label = `${formatDateTime(startDate)}-${formatDateTime(endDate)}`;
					result.textShow = `${this.selectedDate} ${this.startTime}-${this.endTime}`;
				}

				this.$emit('select', result);
				this.close();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.time-picker-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		width: 100%;
		overflow: hidden;
		touch-action: none;

		.mask {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.6);
		}

		.content-wrapper {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			width: 90%;
			max-width: 650rpx;
			overflow: hidden;
			touch-action: none;

			.content {
				position: relative;
				background: #FFFFFF;
				border-radius: 24rpx;
				padding: 30rpx;
				max-height: 80vh;
				overflow-y: auto;
				overflow-x: hidden;
				width: 100%;
				box-sizing: border-box;
				transform: translateZ(0);
				-webkit-transform: translateZ(0);
				will-change: transform;
				touch-action: pan-y;

				.header {
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-bottom: 20rpx;
					position: sticky;
					top: 0;
					z-index: 1;
					background-color: #FFFFFF;

					.title {
						font-size: 30rpx;
						font-weight: 500;
						color: #333;
					}

					.close {
						font-size: 36rpx;
						color: #999;
						padding: 8rpx;
					}
				}

				.time-tip {
					margin-bottom: 15rpx;
					padding: 10rpx 15rpx;
					background-color: #FFF8F8;
					border-radius: 8rpx;

					.tip-text {
						font-size: 24rpx;
						color: #FF4D4F;
						line-height: 1.4;
					}
				}

				.time-options {
					display: flex;
					flex-wrap: wrap;
					gap: 20rpx;
					padding: 10rpx 0 20rpx;

					.time-option {
						width: calc((100% - 40rpx) / 3);
						height: 70rpx;
						background-color: #f8f8f8;
						border-radius: 8rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 26rpx;
						color: #333;
						transition: all 0.3s ease;
						position: relative;

						&:hover {
							background-color: #f0f0f0;
						}

						&.active {
							background-color: #E6F3FF;
							color: #2492F2;
						}

						&.last-selected {
							background-color: #F5F5F5;
							color: #666666;
						}

						text {
							font-size: 26rpx;
							color: #333;
						}

						.recommend-tag {
							position: absolute;
							top: -10rpx;
							right: -10rpx;
							background: #ffb400;
							color: #fff;
							font-size: 20rpx;
							padding: 2rpx 12rpx;
							border-radius: 16rpx;
							font-weight: bold;
							z-index: 2;
						}

						.price-tag {
							position: absolute;
							bottom: 2rpx;
							right: 2rpx;
							color: #FF6B00;
							font-size: 20rpx;
							font-weight: 500;
							padding: 2rpx 6rpx;
							z-index: 1;
						}
					}
				}

				.date-section {
					margin-bottom: 30rpx;

					.section-title {
						font-size: 28rpx;
						color: #333;
						margin-bottom: 20rpx;
					}

					.date-picker {
						height: 88rpx;
						background: #F8F8F8;
						border-radius: 8rpx;
						display: flex;
						align-items: center;
						justify-content: space-between;
						padding: 0 24rpx;

						text {
							font-size: 28rpx;
							color: #333;
						}

						.picker-icon {
							width: 32rpx;
							height: 32rpx;
						}
					}
				}

				.time-section {
					margin-bottom: 30rpx;

					.section-title {
						font-size: 28rpx;
						color: #333;
						margin-bottom: 20rpx;
					}

					.time-range-picker {
						display: flex;
						align-items: center;
						justify-content: space-between;

						.time-picker {
							flex: 1;
							height: 88rpx;
							background: #F8F8F8;
							border-radius: 8rpx;
							display: flex;
							align-items: center;
							justify-content: space-between;
							padding: 0 24rpx;

							text {
								font-size: 28rpx;
								color: #333;
							}

							.picker-icon {
								width: 32rpx;
								height: 32rpx;
							}
						}

						.time-separator {
							margin: 0 20rpx;
							font-size: 28rpx;
							color: #333;
						}
					}

					.time-note {
						font-size: 22rpx;
						color: #999;
						margin-top: 12rpx;
						display: block;
						line-height: 1.2;
						padding: 4rpx 0 12rpx;
					}
				}

				.remark-section {
					margin-bottom: 20rpx;
					width: 100%;
					box-sizing: border-box;

					.remark-header {
						display: flex;
						align-items: center;
						justify-content: space-between;
						margin-bottom: 12rpx;
						width: 100%;

						.label {
							font-size: 26rpx;
							color: #333;
						}

						.count {
							font-size: 22rpx;
							color: #999;
						}
					}

					.remark-input {
						width: 100%;
						height: 120rpx;
						background: #F8F8F8;
						border-radius: 8rpx;
						padding: 16rpx;
						font-size: 26rpx;
						color: #333;
						box-sizing: border-box;
					}
				}

				.footer {
					padding: 20rpx 0 0;

					.confirm-btn {
						width: 100%;
						height: 88rpx;
						background: #2492F2;
						border-radius: 44rpx;
						color: #FFFFFF;
						font-size: 32rpx;
						display: flex;
						align-items: center;
						justify-content: center;

						&:disabled {
							background: #CCCCCC;
						}
					}
				}
			}
		}
	}
</style>