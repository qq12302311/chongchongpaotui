<template>
	<view class="login-page">
		<!-- 自定义导航栏 -->
		<nav-bar title="登录" title-align="center"></nav-bar>

		<!-- 内容区域 -->
		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 登录区域 -->
			<view class="login-container">
				<!-- Logo -->
				<image class="logo" src="https://ccpt.qiniu.cc111.cn/publish/banner6.png" mode="aspectFit"></image>

				<!-- 标题 -->
				<view class="title">欢迎使用充充跑腿</view>

				<!-- 登录按钮 -->
				<button class="login-btn" open-type="getPhoneNumber" @getphonenumber="handleGetPhoneNumber">
					<image class="wechat-icon" src="https://ccpt.qiniu.cc111.cn/login/login.png" mode="aspectFit"></image>
					<text>手机号快捷登录</text>
				</button>

				<!-- 推荐人信息显示 -->
				<view class="referrer-info" v-if="referrerId">
					<text class="referrer-text">通过推荐人 {{ formattedReferrerId }} 邀请</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import NavBar from '@/components/NavBar.vue'
	import md5 from 'md5'
	import userMixin from '@/mixins/userMixin.js'

	export default {
		components: {
			NavBar
		},
		mixins: [userMixin],
		data() {
			return {
				navBarHeight: 0,
				referrerId: null,
				userInfo: null,
				openid: null,
			}
		},
		computed: {
			// 格式化推荐人ID显示
			formattedReferrerId() {
				if (!this.referrerId) return '';

				// 生成随机数字：2或5
				const randomSuffix = Math.random() < 0.5 ? '2' : '5';

				// 返回格式：ccqs + 推荐人ID + 随机数字
				return `ccqs${this.referrerId}${randomSuffix}`;
			}
		},
		onLoad(options) {
			// 计算导航栏高度
			const systemInfo = uni.getSystemInfoSync()
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			this.navBarHeight = menuButtonInfo.bottom + 12

			// 处理分享链接中的推荐人ID参数
			if (options.referrerId) {
				this.referrerId = options.referrerId;
				console.log('接收到推荐人ID:', this.referrerId);

				// 显示推荐信息提示（已移至页面显示）
			}
		},
		methods: {
			// 用户注册方法
			async registerUser(openid) {
				try {
					// 构建请求参数
					const params = {
						openid: openid,
						userPhone: uni.getStorageSync('userPhone'),
					}

					// 如果有推荐人ID，添加到登录参数中
					if (this.referrerId) {
						params.referrer_id = this.referrerId;
						console.log('添加推荐人ID到登录参数:', this.referrerId);
					}
					// 调用用户注册接口
					const res = await this.$request('user/create', params, 'POST')
					// 先打印出接口返回的数据结构
					console.log('用户注册接口返回数据', res)
					
					// 根据实际接口返回的数据结构判断
					// 这里需要根据实际返回的数据结构进行调整
					if (res && res.data) {
						console.log('用户注册成功', res.data)
						// 将res.data存储到本地
						uni.setStorageSync('userInfo', res.data)
						console.log('用户信息已存储到本地', res.data)
						return true
					} else {
						console.error('用户注册失败', res)
						return false
					}
				} catch (err) {
					console.error('用户注册过程出错', err)
					return false
				}
			},
			// 封装微信登录为Promise
			wxLogin() {
				return new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: (res) => resolve(res),
						fail: (err) => reject(err)
					})
				})
			},
			async getUserInfo() {
				// 先从本地存储获取用户信息
				const userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					this.userInfo = userInfo
					return userInfo
				}
			
				try {
					// 如果本地没有，则调用微信登录获取
					const loginRes = await this.wxLogin()
					if (loginRes && loginRes.code) {
						// 使用this.$request调用request函数
						const res = await this.$request('client/wechat/GetUserInfo/get_openid', {
							code: loginRes.code
						}, 'POST')
						if (res && res.data.openid.openid) {
							// 获取openid并存储到本地
							const openid = res.data.openid.openid
							uni.setStorageSync('openid', openid)
							this.openid = openid
							// 确保用户已注册
							await this.registerUser(openid)
							// 重新获取用户信息
							const userInfo = uni.getStorageSync('userInfo')
							if (userInfo) {
								this.userInfo = userInfo
								return userInfo
							}
						} else {
							console.error('获取openid失败', res)
							return null
						}
					} else {
						console.error('微信登录失败', loginRes)
						return null
					}
				} catch (err) {
					console.error('获取用户信息过程出错', err)
					return null
				}
			},
			// 处理获取手机号
			async handleGetPhoneNumber(e) {
				// 判断用户是否拒绝授权
				if (e.detail.errMsg !== 'getPhoneNumber:ok') {
					uni.showToast({
						title: '您已拒绝授权手机号',
						icon: 'none'
					})
					return
				}

				try {
					// 显示加载提示
					uni.showLoading({
						title: '登录中...',
						mask: true
					})

					// 构建请求参数
					const params = {
						code: e.detail.code
					}

					// 如果有推荐人ID，添加到登录参数中
					if (this.referrerId) {
						params.referrer_id = this.referrerId;
						console.log('添加推荐人ID到登录参数:', this.referrerId);
					}

					// 调用登录接口
					const res = await this.$request('client/wechat/GetUserInfo/get_phone', params, 'POST')
					console.log('登录结果:', res)

					if (res.code === 200 && res.data.phone) {
						// 保存用户手机号
						if (res.data.phone && res.data.phone.phone_info) {
							const phoneNumber = res.data.phone.phone_info.phoneNumber
							uni.setStorageSync('userPhone', phoneNumber)

							// 更新加载提示
							uni.showLoading({
								title: '获取用户信息...',
								mask: true
							})

							// 获取用户信息
							const userInfo = await this.getUserInfo()
							if (userInfo) {
								// 隐藏加载提示
								uni.hideLoading()

								// 检查是否有保存的返回路径
								const returnPath = uni.getStorageSync('loginReturnPath');
								if (returnPath) {
									// 清除保存的返回路径
									uni.removeStorageSync('loginReturnPath');
									// 重定向到保存的路径
									uni.redirectTo({
										url: returnPath,
										fail: (err) => {
											console.error('重定向失败:', err);
											// 如果重定向失败，尝试返回上一页或首页
											const pages = getCurrentPages();
											if (pages.length > 1) {
												uni.navigateBack();
											} else {
												uni.switchTab({
													url: '/pages/index/index'
												});
											}
										}
									});
								} else {
									// 如果没有保存的返回路径，返回上一页或首页
									const pages = getCurrentPages();
									if (pages.length > 1) {
										uni.navigateBack();
									} else {
										uni.switchTab({
											url: '/pages/index/index'
										});
									}
								}
							} else {
								// 隐藏加载提示
								uni.hideLoading()
								uni.showToast({
									title: '获取用户信息失败',
									icon: 'none'
								})
							}
						}
					} else {
						// 隐藏加载提示
						uni.hideLoading()
						const errMsg = res.msg || '登录失败'
						if (errMsg.includes('验证') || errMsg.includes('verify')) {
							uni.showModal({
								title: '获取手机号失败',
								content: '您的微信绑定手机号需要先完成验证。\n请前往微信「设置」→「账号与安全」→「手机号」完成验证后重试。',
								showCancel: false,
								confirmText: '我知道了'
							})
						} else {
							uni.showModal({
								title: '登录失败',
								content: errMsg,
								showCancel: false,
								confirmText: '确定'
							})
						}
					}
				} catch (err) {
					// 隐藏加载提示
					uni.hideLoading()
					console.error('登录失败:', err)
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.login-page {
		min-height: 100vh;
		background-color: #fff;

		.content {
			padding: 0;
		}

		.login-container {
			padding: 60rpx 40rpx;
			display: flex;
			flex-direction: column;
			align-items: center;

			.logo {
				width: 200rpx;
				height: 200rpx;
				margin-bottom: 40rpx;
				border-radius: 32rpx;
			}

			.title {
				font-size: 36rpx;
				color: #333;
				font-weight: 500;
				margin-bottom: 80rpx;
			}

			.login-btn {
				width: 100%;
				height: 88rpx;
				background: #2492F2;
				border-radius: 44rpx;
				color: #FFFFFF;
				font-size: 32rpx;
				font-weight: 500;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-top: 40rpx;
				transition: all 0.3s;

				&:active {
					transform: scale(0.98);
					opacity: 0.9;
				}

				.wechat-icon {
					width: 44rpx;
					height: 44rpx;
					margin-right: 12rpx;
				}

				text {
					color: #fff;
					font-size: 32rpx;
				}

				&::after {
					border: none;
				}
			}

			// 推荐人信息样式
			.referrer-info {
				margin-top: 30rpx;
				text-align: center;

				.referrer-text {
					font-size: 24rpx;
					color: #999;
					line-height: 1.5;
				}
			}
		}
	}
</style>