<template>
	<view class="verify-page">
		<!-- 顶部导航栏 -->
		<nav-bar title="骑手认证" title-align="center"></nav-bar>

		<!-- 导航栏占位元素 -->
		<view class="nav-placeholder"></view>

		<!-- 未提交认证信息状态 -->
		<view class="form-container" v-if="verifyStatus === 'none'">
			<!-- 个人信息卡片 -->
			<view class="info-card">
				<view class="card-title">填写个人信息</view>
				<view class="divider"></view>
				<!-- 姓名输入 -->
				<view class="form-item">
					<view class="form-label">
						<text class="required">*</text>
						<text>您的姓名</text>
					</view>
					<input class="form-input" type="text" placeholder="请输入真实姓名" placeholder-class="placeholder"
						v-model="formData.name" />
				</view>

				<view class="divider"></view>

				<!-- 证件号码输入 -->
				<view class="form-item">
					<view class="form-label">
						<text class="required">*</text>
						<text>证件号码</text>
					</view>
					<input class="form-input" type="idcard" placeholder="请输入证件号码" placeholder-class="placeholder"
						v-model="formData.idCard" />
				</view>

				<view class="divider"></view>

				<!-- 手机号输入 -->
				<view class="form-item">
					<view class="form-label">
						<text class="required">*</text>
						<text>手机号</text>
					</view>
					<input class="form-input" type="number" placeholder="请输入手机号" placeholder-class="placeholder"
						v-model="formData.phone" />
				</view>

				<view class="divider"></view>

				<!-- 微信号输入 -->
				<view class="form-item">
					<view class="form-label">
						<text class="required">*</text>
						<text>微信号</text>
					</view>
					<input class="form-input" type="text" placeholder="请输入微信号" placeholder-class="placeholder"
						v-model="formData.wechat" />
				</view>
			</view>

			<!-- 身份证正面上传 -->
			<view class="upload-section">
				<view class="upload-content">
					<view class="upload-text">
						<view class="upload-title">身份证正面</view>
						<view class="upload-subtitle">上传您的身份证人像面</view>
					</view>
					<view class="upload-area" @click="chooseImage('idCardFront')">
						<image v-if="formData.idCardFront" :src="formData.idCardFront" mode="aspectFill"
							class="preview-image"></image>
						<image v-else src="https://ccpt.qiniu.0871.cn/rider/verify/zhengmian.png" mode="aspectFill"
							class="id-card-image"></image>
					</view>
				</view>
			</view>

			<!-- 身份证反面上传 -->
			<view class="upload-section">
				<view class="upload-content">
					<view class="upload-text">
						<view class="upload-title">身份证反面</view>
						<view class="upload-subtitle">上传您的身份证国徽面</view>
					</view>
					<view class="upload-area" @click="chooseImage('idCardBack')">
						<image v-if="formData.idCardBack" :src="formData.idCardBack" mode="aspectFill"
							class="preview-image"></image>
						<image v-else src="https://ccpt.qiniu.0871.cn/rider/verify/fanmian.png" mode="aspectFill"
							class="id-card-image"></image>
					</view>
				</view>
			</view>

			<!-- 隐私声明 -->
			<view class="privacy-statement">
				<text class="required">*</text>
				<text>我们已采取权威安全技术来确保您的信息不被泄露和未经授权的访问和使用。</text>
			</view>

			<!-- 协议勾选 -->
			<view class="agreement-check">
				<checkbox-group @change="handleAgreementChange">
					<label>
						<checkbox :value="formData.agreement" :checked="formData.agreement"></checkbox>
						<text class="agreement-text">阅读并同意</text>
						<text class="link" @click="openAgreement">《充充跑腿骑手合作协议》</text>
					</label>
				</checkbox-group>
			</view>

			<!-- 提交按钮 -->
			<button class="submit-btn" @click="submitVerification" :disabled="!isFormValid">立即认证</button>
		</view>

		<!-- 审核中状态 -->
		<view class="status-container" v-else-if="verifyStatus === 'pending'">
			<view class="status-icon-container2">
				<image src="https://ccpt.qiniu.0871.cn/rider/verify/chenggong.png" class="status-icon" mode="aspectFit"
					style="width: 100rpx; height: 100rpx;"></image>
			</view>
			<view class="status-title">认证提交成功！</view>
			<view class="status-desc">*充充跑腿官方正在审核中，请保持关注！</view>
		</view>

		<!-- 审核通过状态 -->
		<view class="status-container" v-else-if="verifyStatus === 'approved'">
			<view class="status-icon-container">
				<image src="https://ccpt.qiniu.0871.cn/rider/verify/renzhenggaizhang.png" class="status-icon"
					mode="aspectFit"></image>
			</view>
			<view class="status-title blue-text">恭喜您：认证成功！可以接单啦！</view>

			<view class="deposit-notice-wrapper">
				<view class="deposit-notice">
					<text class="notice-text">缴纳服务保证金</text>
				</view>
			</view>

			<view class="deposit-image-wrapper">
				<image src="https://ccpt.qiniu.0871.cn/rider/verify/baozhengjin2.png" class="deposit-image"
					mode="widthFix"></image>
				<view class="deposit-status">
					<text class="status-text">未缴纳</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import md5 from 'md5'
	import NavBar from '@/components/NavBar.vue'

	export default {
		components: {
			NavBar
		},
		data() {
			return {
				verifyStatus: 'none', // 认证状态：none-未提交，pending-审核中，approved-已通过
				formData: {
					name: '',
					idCard: '',
					phone: '',
					wechat: '',
					idCardFront: '',
					idCardBack: '',
					agreement: false
				}
			}
		},
		computed: {
			isFormValid() {
				return (
					this.formData.name.trim() !== '' &&
					this.formData.idCard.trim() !== '' &&
					this.formData.phone.trim() !== '' &&
					this.formData.wechat.trim() !== '' &&
					this.formData.idCardFront !== '' &&
					this.formData.idCardBack !== '' &&
					this.formData.agreement
				)
			}
		},
		onLoad() {
			// 获取用户信息
			const riderUserInfo = uni.getStorageSync('riderUserInfo')

			// 如果已登录，自动填充手机号
			if (riderUserInfo && riderUserInfo.phone) {
				this.formData.phone = riderUserInfo.phone
			}

			// 检查认证状态
			this.checkVerifyStatus()
		},
		onShow() {
			// 每次显示页面时检查认证状态
			this.checkVerifyStatus()
		},
		methods: {
			// 选择图片
			chooseImage(field) {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.formData[field] = res.tempFilePaths[0]
					}
				})
			},

			// 处理协议勾选
			handleAgreementChange(e) {
				this.formData.agreement = e.detail.value.length > 0
			},

			// 打开协议
			openAgreement() {
				uni.navigateTo({
					url: '/pages/agreement/rider'
				})
			},

			// 提交认证
			submitVerification() {
				if (!this.isFormValid) {
					uni.showToast({
						title: '请完成所有必填项',
						icon: 'none'
					})
					return
				}

				uni.showLoading({
					title: '提交中...',
					mask: true
				})

				// 上传身份证正面
				this.uploadFile(this.formData.idCardFront, 'idCardFront', (frontUrl) => {
					// 上传身份证反面
					this.uploadFile(this.formData.idCardBack, 'idCardBack', (backUrl) => {
						// 提交认证信息
						this.submitVerificationData(frontUrl, backUrl)
					})
				})
			},

			// 上传文件
			uploadFile(filePath, fileType, callback) {
				uni.uploadFile({
					url: 'https://tixian.0871.cn/upload/qiniuImageUpload', // 服务器上传接口地址
					filePath: filePath,
					name: 'image',
					formData: {
						'spaceName': 'ccpt_renzheng' // 其他要上传的参数
					},
					success: (uploadFileRes) => {
						const res = JSON.parse(uploadFileRes.data)
						callback(res.path)
					},
					fail: () => {
						uni.hideLoading()
						uni.showToast({
							title: '图片上传失败',
							icon: 'none'
						})
					}
				})
			},

			// 提交认证数据
			submitVerificationData(idCardFrontUrl, idCardBackUrl) {
				const riderUserInfo = uni.getStorageSync('riderUserInfo')

				if (!riderUserInfo || !riderUserInfo.id) {
					uni.hideLoading()
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}

				// 生成 sign
				const signStr = `service_member_id=${riderUserInfo.id}&phone_number=${riderUserInfo.phone}`;
				const sign = md5(signStr);

				this.$request('service/member/certification', {
					service_member_id: riderUserInfo.id,
					real_name: this.formData.name,
					phone_number: this.formData.phone,
					id_card_number: this.formData.idCard,
					wechat_id: this.formData.wechat,
					id_card_front_url: idCardFrontUrl,
					id_card_back_url: idCardBackUrl,
					sign: sign
				}, 'POST').then(res => {
					uni.hideLoading()

					if (res.success) {
						uni.showToast({
							title: '认证提交成功',
							icon: 'success'
						})

						// 更新本地存储的用户信息
						riderUserInfo.submit_certification = '待审核'; // 认证提交后为待审核
						uni.setStorageSync('riderUserInfo', riderUserInfo)

						// 更新页面状态
						this.verifyStatus = 'pending'
					} else {
						uni.showToast({
							title: res.msg || '认证提交失败',
							icon: 'none'
						})
					}
				}).catch(err => {
					uni.hideLoading()
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					})
					console.error('认证提交失败:', err)
				})
			},

			// 检查认证状态
			checkVerifyStatus() {
				const riderUserInfo = uni.getStorageSync('riderUserInfo')
				if (!riderUserInfo) {
					this.verifyStatus = 'none'
					return
				}
				// submit_certification状态严格对应
				switch (riderUserInfo.submit_certification) {
					case '未提交':
						this.verifyStatus = 'none';
						break; // 未提交
					case '待审核':
						this.verifyStatus = 'pending';
						break; // 待审核
					case '已通过':
						this.verifyStatus = 'approved';
						break; // 已通过
					case '已拒绝':
						this.verifyStatus = 'rejected';
						break; // 已拒绝
					default:
						this.verifyStatus = 'none';
				}
			},

			// 查询认证状态
			queryVerifyStatus(memberId) {
				this.$request('service/member/verify/status', {
					service_member_id: memberId
				}, 'POST').then(res => {
					if (res.code === 200) {
						const status = res.data.submit_certification
						// submit_certification状态严格对应
						switch (status) {
							case '未提交':
								this.verifyStatus = 'none';
								break;
							case '待审核':
								this.verifyStatus = 'pending';
								break;
							case '已通过':
								this.verifyStatus = 'approved';
								// 更新本地存储
								const riderUserInfo = uni.getStorageSync('riderUserInfo')
								riderUserInfo.submit_certification = 2
								uni.setStorageSync('riderUserInfo', riderUserInfo)
								break;
							case '已拒绝':
								this.verifyStatus = 'rejected';
								break;
							default:
								this.verifyStatus = 'none';
						}
					} else {
						this.verifyStatus = 'none'
					}
				}).catch(() => {
					this.verifyStatus = 'none'
				})
			},

			// 跳转到保证金页面
			goToDeposit() {
				uni.navigateTo({
					url: '/pages/deposit/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.verify-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 40rpx;
	}

	.nav-placeholder {
		height: 180rpx;
		width: 100%;
	}

	.form-container {
		padding: 30rpx;
	}

	.card-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		padding: 30rpx;
	}

	.info-card {
		background-color: #fff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
	}

	.form-item {
		padding: 24rpx 30rpx;
		display: flex;
		align-items: center;
	}

	.divider {
		height: 1rpx;
		background-color: #f5f5f5;
		margin: 0 30rpx;
	}

	.form-label {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #333;
		width: 180rpx;
		flex-shrink: 0;

		.required {
			color: #ff0000;
			margin-right: 5rpx;
		}
	}

	.form-input {
		flex: 1;
		height: 70rpx;
		font-size: 28rpx;
		color: #333;
	}

	.placeholder {
		color: #999;
		font-size: 28rpx;
	}

	.upload-section {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.upload-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.upload-text {
		flex: 1;
	}

	.upload-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.upload-subtitle {
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
	}

	.upload-area {
		width: 240rpx;
		height: 150rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12rpx;
		overflow: hidden;
		background-color: #f8f8f8;
	}

	.id-card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.preview-image {
		width: 100%;
		height: 100%;
		border-radius: 12rpx;
		object-fit: cover;
	}

	.privacy-statement {
		padding: 20rpx 30rpx;
		font-size: 24rpx;
		color: #666;
		line-height: 1.5;

		.required {
			color: #ff0000;
			margin-right: 5rpx;
		}
	}

	.agreement-check {
		padding: 20rpx 30rpx;
		font-size: 24rpx;
		color: #333;
		text-align: center;

		checkbox-group {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		label {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		checkbox {
			transform: scale(0.7);
			margin-right: 6rpx;
		}

		.agreement-text {
			font-size: 24rpx;
		}

		.link {
			color: #2492F2;
			font-size: 24rpx;
		}
	}

	.submit-btn {
		width: 90%;
		height: 90rpx;
		background-color: #2492F2;
		color: #fff;
		font-size: 32rpx;
		border-radius: 45rpx;
		margin-top: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&[disabled] {
			background-color: #cccccc;
			color: #ffffff;
		}
	}

	/* 状态页面样式 */
	.status-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 100rpx 10rpx;
	}

	.status-icon-container {
		width: 240rpx;
		height: 240rpx;
		margin-bottom: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.status-icon-container2 {
		width: 100rpx;
		height: 100rpx;
		margin-bottom: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.status-icon {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.status-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
		text-align: center;
	}

	.blue-text {
		color: #2492F2;
	}

	.status-desc {
		font-size: 28rpx;
		color: #666;
		text-align: center;
		line-height: 1.5;
	}

	/* 保证金相关样式 */
	.deposit-notice-wrapper {
		width: 100%;
		display: flex;
		justify-content: flex-start;
		margin: 40rpx 0;
	}

	.deposit-notice {
		text-align: left;
		padding-left: 10px;
		width: 100%;
	}

	.notice-text {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
		position: relative;
		padding-left: 20rpx;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 8rpx;
			height: 28rpx;
			background-color: #FF6B00;
			border-radius: 4rpx;
		}
	}

	.deposit-image-wrapper {
		width: 100%;
		padding: 0 10px;
		margin-bottom: 60rpx;
		box-sizing: border-box;
		position: relative;
	}

	.deposit-image {
		width: 100%;
		border-radius: 12rpx;
	}

	.deposit-status {
		position: absolute;
		bottom: 60rpx;
		right: 80rpx;
	}

	.status-text {
		font-size: 26rpx;
		color: #FF6B00;
		font-weight: bold;
	}

	.pay-btn {
		width: 90%;
		height: 90rpx;
		background-color: #2492F2;
		color: #fff;
		font-size: 32rpx;
		border-radius: 45rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>