export default {
	data() {
		return {
			userInfo: null,
			openid: ''
		}
	},
	async onLoad() {
		// await this.getUserInfo()
	},
	methods: {
		// 检查登录状态并显示弹窗
		checkLoginAndShowModal() {
			const userInfo = uni.getStorageSync('userInfo')
			if (!userInfo) {
				uni.showModal({
					title: '提示',
					content: '您还未登录，是否去登录？',
					confirmText: '去登录',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({
								url: '/pages/login/index'
							})
						}
					}
				})
				return false
			}
			return true
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
		
		// 用户注册方法
		async registerUser(openid) {
			try {
				// 调用用户注册接口
				const res = await this.$request('user/create', { 
					openid: openid,
					userPhone: uni.getStorageSync('userPhone')
				}, 'POST')
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
		}
	}
}