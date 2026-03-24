<template>
	<uni-popup ref="tipModal" type="bottom" :mask-click="true" :z-index="100000" @maskClick="handleClose" @change="handlePopupChange">
		<view class="tip-modal">
			<view class="tip-close" @click="handleClose">×</view>
			<image src="https://ccpt.qiniu.cc111.cn/fb-toubutupian.png" class="tip-banner" mode="widthFix"></image>
			<view class="tip-panel">
				<view class="tip-options">
					<view class="tip-option" :class="{ active: selectedTipOption === 'heart' }" @click="selectTipOption('heart', 8)">
						<view class="option-icon-wrap">
							<image src="https://ccpt.qiniu.cc111.cn/fb-songaixin.png" class="option-icon" mode="aspectFit"></image>
						</view>
						<text class="option-title">送爱心</text>
						<view class="option-amount" :class="{ active: selectedTipOption === 'heart' }">
							<text class="amount-label">打赏</text>
							<text class="amount-value">8元</text>
						</view>
					</view>
					<view class="tip-option" :class="{ active: selectedTipOption === 'drink' }" @click="selectTipOption('drink', 12)">
						<view class="option-icon-wrap">
							<image src="https://ccpt.qiniu.cc111.cn/fb-zengyinliao.png" class="option-icon" mode="aspectFit"></image>
						</view>
						<text class="option-title">赠饮料</text>
						<view class="option-amount" :class="{ active: selectedTipOption === 'drink' }">
							<text class="amount-label">打赏</text>
							<text class="amount-value">12元</text>
						</view>
					</view>
					<view class="tip-option" :class="{ active: selectedTipOption === 'chicken' }" @click="selectTipOption('chicken', 20)">
						<view class="option-icon-wrap">
							<image src="https://ccpt.qiniu.cc111.cn/fb-jiajitui.png" class="option-icon" mode="aspectFit"></image>
						</view>
						<text class="option-title">加鸡腿</text>
						<view class="option-amount" :class="{ active: selectedTipOption === 'chicken' }">
							<text class="amount-label">打赏</text>
							<text class="amount-value">20元</text>
						</view>
					</view>
					<view class="tip-option" :class="{ active: selectedTipOption === 'redpack' }" @click="selectTipOption('redpack', 'more')">
						<view class="option-icon-wrap">
							<image src="https://ccpt.qiniu.cc111.cn/fb-dahongbao.png" class="option-icon" mode="aspectFit"></image>
						</view>
						<text class="option-title">豪横大红包</text>
						<view class="option-amount" :class="{ active: selectedTipOption === 'redpack' }">
							<text class="amount-label">打赏</text>
							<text class="amount-value">更多</text>
						</view>
					</view>
				</view>
			</view>
			<view class="tip-footer">
				<button class="confirm-tip-btn" @click="confirmTip">
					{{ selectedTipAmount === 'more' ? '打赏更多' : '确定打赏 ' + selectedTipAmount + '元' }}
				</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
export default {
	name: 'RewardModal',
	props: {
		show: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			selectedTipOption: 'drink',  // 默认选中赠饮料
			selectedTipAmount: 12         // 默认金额12元
		}
	},
	watch: {
		show(newVal) {
			if (newVal) {
				// 每次打开时重置为默认选中12元
				this.selectedTipOption = 'drink';
				this.selectedTipAmount = 12;
				this.$refs.tipModal.open();
			} else {
				this.$refs.tipModal.close();
			}
		}
	},
	methods: {
		// 选择打赏选项
		selectTipOption(option, amount) {
			this.selectedTipOption = option;
			this.selectedTipAmount = amount;
		},

		// 关闭弹窗
		handleClose() {
			this.$emit('close');
		},

		// 处理弹窗状态变化
		handlePopupChange(e) {
			// 当弹窗关闭时（e.show 为 false），触发 close 事件
			if (!e.show) {
				this.$emit('close');
			}
		},

		// 确认打赏
		confirmTip() {
			if (!this.selectedTipOption) {
				uni.showToast({
					title: '请选择打赏金额',
					icon: 'none'
				});
				return;
			}

			if (this.selectedTipAmount === 'more') {
				// 打赏更多 - 跳转到自定义金额输入页面或弹窗
				uni.showModal({
					title: '自定义打赏金额',
					editable: true,
					placeholderText: '请输入打赏金额',
					success: (res) => {
						if (res.confirm && res.content) {
							const amount = parseFloat(res.content);
							if (amount > 0) {
								this.$emit('confirm', amount);
								this.handleClose();
							} else {
								uni.showToast({
									title: '请输入有效金额',
									icon: 'none'
								});
							}
						}
					}
				});
			} else {
				this.$emit('confirm', this.selectedTipAmount);
				this.handleClose();
			}
		}
	}
}
</script>

<style lang="scss" scoped>
/* 骑手打赏弹窗样式 */
.tip-modal {
	width: 100%;
	box-sizing: border-box;
	padding: 80rpx 32rpx calc(80rpx + env(safe-area-inset-bottom));
	border-radius: 40rpx 40rpx 0 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 36rpx;
	position: relative;
	overflow: visible;
}

.tip-modal::before {
	content: '';
	position: absolute;
	top: 260rpx;
	left: 0;
	right: 0;
	bottom: 0;
	border-radius: 40rpx 40rpx 0 0;
	background: linear-gradient(180deg, #0aa9ff 0%, #0b4dff 100%);
	z-index: -1;
	pointer-events: none;
}

.tip-close {
	position: absolute;
	top: 40rpx;
	right: 46rpx;
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.95);
	box-shadow: 0 12rpx 26rpx rgba(9, 78, 189, 0.18);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 34rpx;
	color: #5f7198;
	z-index: 4;
}

.tip-banner {
	width: calc(100% + 64rpx);
	margin: 0 -32rpx;
	display: block;
	border-radius: 0;
	box-shadow: none;
}

.tip-panel {
	width: 100%;
	background: #FFFFFF;
	border-radius: 36rpx;
	padding: 8rpx 18rpx 44rpx 18rpx;
	box-shadow: 0 30rpx 70rpx rgba(11, 82, 189, 0.22);
	margin-top: -24rpx;
}

.tip-options {
	display: flex;
	justify-content: space-between;
	gap: 20rpx;
}

.tip-option {
	flex: none;
	width: 130rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 28rpx 12rpx 32rpx;
	border-radius: 28rpx;
	background: #FFFFFF;
	box-shadow: 0 14rpx 28rpx rgba(22, 102, 212, 0.12);
	transition: all 0.25s ease;
}

.tip-option.active {
	transform: translateY(-6rpx);
	box-shadow: 0 28rpx 38rpx rgba(15, 110, 240, 0.24);
}

.option-icon-wrap {
	width: 116rpx;
	height: 116rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #66d0ff 0%, #2588ff 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 18rpx;
	box-shadow: 0 16rpx 28rpx rgba(13, 90, 210, 0.2);
}

.tip-option.active .option-icon-wrap {
	box-shadow: 0 20rpx 34rpx rgba(15, 110, 240, 0.28);
}

.option-icon {
	width: 86rpx;
	height: 86rpx;
}

.option-title {
	font-size: 26rpx;
	color: #1f3360;
	font-weight: 600;
	margin-bottom: 10rpx;
}

.tip-option.active .option-title {
	color: #0f49f6;
}

.option-amount {
	margin-top: 32rpx;
	width: 140rpx;
	min-height: 98rpx;
	padding: 16rpx 0 12rpx;
	border-radius: 28rpx;
	border: 2rpx solid #2a7fff;
	background: #FFFFFF;
	color: #276efc;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	line-height: 1.2;
	position: relative;
}

.option-amount .amount-label {
	color: #BFBFBF;
	font-size: 22rpx;
	margin-bottom: 8rpx;
}

.option-amount .amount-value {
	font-size: 30rpx;
	font-weight: 700;
}

.option-amount.active {
	background: linear-gradient(180deg, #52d4ff 0%, #0f66ff 100%);
	color: #FFFFFF;
	border: none;
	box-shadow: 0 18rpx 32rpx rgba(15, 110, 240, 0.28);
}

.option-amount.active::before {
	content: '';
	position: absolute;
	top: -22rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 0;
	height: 0;
	border-left: 18rpx solid transparent;
	border-right: 18rpx solid transparent;
	border-bottom: 22rpx solid #52d4ff;
}

.option-amount.active .amount-label,
.option-amount.active .amount-value {
	color: #FFFFFF;
}

.tip-footer {
	width: 100%;
	margin-top: 8rpx;
}

.confirm-tip-btn {
	width: 100%;
	height: 96rpx;
	background: linear-gradient(135deg, #ff8b2f 0%, #ff4b47 100%);
	color: #FFFFFF;
	font-size: 32rpx;
	font-weight: 700;
	border-radius: 48rpx;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 20rpx 32rpx rgba(255, 110, 64, 0.32);
	transition: all 0.25s ease;
}

.confirm-tip-btn:active {
	opacity: 0.9;
	transform: translateY(2rpx);
	box-shadow: 0 12rpx 26rpx rgba(255, 110, 64, 0.24);
}
</style>