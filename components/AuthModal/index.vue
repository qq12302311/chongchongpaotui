<template>
	<view class="auth-modal" v-if="show">
		<view class="modal-mask"></view>
		<view class="modal-content">
			<view class="modal-title">{{ title }}</view>
			<view class="modal-body">
				<text>{{ content }}</text>
			</view>
			<view class="modal-footer">
				<view class="button-container">
					<button class="cancel-btn" @click="handleCancel">{{ cancelText }}</button>
					<text v-if="cancelSubText" class="sub-text cancel-sub">{{ cancelSubText }}</text>
				</view>
				<view class="divider"></view>
				<view class="button-container">
					<button class="confirm-btn" @click="handleConfirm">{{ confirmText }}</button>
					<text v-if="confirmSubText" class="sub-text confirm-sub">{{ confirmSubText }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'AuthModal',
		props: {
			show: {
				type: Boolean,
				default: false
			},
			title: {
				type: String,
				default: '提示'
			},
			content: {
				type: String,
				default: ''
			},
			cancelText: {
				type: String,
				default: '取消'
			},
			confirmText: {
				type: String,
				default: '确定'
			},
			cancelSubText: {
				type: String,
				default: ''
			},
			confirmSubText: {
				type: String,
				default: ''
			}
		},
		methods: {
			handleCancel() {
				this.$emit('cancel')
			},
			handleConfirm() {
				this.$emit('confirm')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.auth-modal {
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
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, 0.6);
		}
		
		.modal-content {
			position: relative;
			width: 580rpx;
			background: #FFFFFF;
			border-radius: 24rpx;
			padding: 0;
			box-sizing: border-box;
			overflow: hidden;
			box-shadow: 0 0 30rpx rgba(0, 0, 0, 0.1);
			
			.modal-title {
				font-size: 36rpx;
				color: #FFFFFF;
				text-align: center;
				font-weight: 500;
				background-color: #2A82E4;
				padding: 30rpx 0;
				position: relative;
				box-shadow: 0 4rpx 12rpx rgba(42, 130, 228, 0.2);
				
				&::after {
					content: '';
					position: absolute;
					left: 0;
					right: 0;
					bottom: -10rpx;
					height: 10rpx;
					background: linear-gradient(180deg, 
						rgba(42, 130, 228, 0.15) 0%,
						rgba(42, 130, 228, 0.1) 50%,
						rgba(42, 130, 228, 0) 100%
					);
					filter: blur(2rpx);
				}
			}
			
			.modal-body {
				text-align: center;
				margin: 50rpx 0;
				padding: 0 30rpx;
				
				text {
					font-size: 29rpx;
					color: #333333;
					line-height: 1.5;
					font-weight: 550;
				}
			}
			
			.modal-footer {
				display: flex;
				align-items: stretch;
				position: relative;
				padding: 0;
				border-top: 1rpx solid #EEEEEE;

				.divider {
					width: 1rpx;
					background-color: #EEEEEE;
					position: absolute;
					left: 50%;
					top: 0;
					bottom: 0;
					transform: translateX(-50%);
				}

				.button-container {
					flex: 1;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					padding: 20rpx 0;

					button {
						width: 100%;
						height: 60rpx;
						font-size: 32rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						background: #FFFFFF;
						margin: 0;
						padding: 0;
						border-radius: 0;

						&::after {
							border: none;
						}

						&.cancel-btn {
							color: #666666;
						}

						&.confirm-btn {
							color: #2492F2;
						}

						&:active {
							background-color: #F5F5F5;
						}
					}

					.sub-text {
						font-size: 22rpx;
						margin-top: 8rpx;
						text-align: center;

						&.cancel-sub {
							color: #ff4d4f;
						}

						&.confirm-sub {
							color: #2492F2;
						}
					}
				}
			}
		}
	}
</style> 