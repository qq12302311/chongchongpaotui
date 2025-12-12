<template>
	<view>
		<u-tabbar :value="value" activeColor="#CD4244">
			<u-tabbar-item :isNewIcon="isNewIcon_if(index)" v-for="(item,index) in list" :key="index" :text="item.text"
				@click="click(index)" :name="item.name">
				<u-image class="u-page__item__slot-icon" slot="active-icon" :src="item.activeIcon" width="40rpx"
					height="40rpx"></u-image>
				<u-image class="u-page__item__slot-icon" slot="inactive-icon" :src="item.inactiveIcon" width="40rpx"
					height="40rpx"></u-image>
				<!-- <view class="cds-sds">
					<u-icon name="https://agan.qiniu.0871.cn/edition/recharge/chongduoshao.svg" size="16"></u-icon>
				</view> -->
			</u-tabbar-item>
		</u-tabbar>
			<!-- <u-tabbar-item @click="scanCode" :isButton="false">
				<view class="custom-button">
					<u-button size="mini">按钮</u-button>
				</view>
			</u-tabbar-item> -->

		<u-modal :showConfirmButton="false" :show="modelshow">
			<view class="dis_flex">
				<view>{{content}}</view>
				<view>（{{count}}）</view>
				<view>秒后，自动前往首页</view>
			</view>
		</u-modal>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				modelshow: false,
				list: [{
						text: '首页',
						activeIcon: 'https://agan.qiniu.0871.cn/edition/footer/active-home.svg',
						inactiveIcon: 'https://agan.qiniu.0871.cn/edition/footer/home.svg',
						name: 0,
					},
					// {
					// 	text: '会员充值',
					// 	activeIcon: 'https://agan.qiniu.0871.cn/edition/footer/active-huiyuanchongzhi.svg',
					// 	inactiveIcon: 'https://agan.qiniu.0871.cn/edition/footer/huiyuanchongzhi.svg',
					// 	name: 1,
					// },
					{
						text: '订单',
						activeIcon: 'https://agan.qiniu.0871.cn/edition/footer/active-order.svg',
						inactiveIcon: 'https://agan.qiniu.0871.cn/edition/footer/order.svg',
						name: 1,
					},
					{
						text: '我的',
						activeIcon: 'https://agan.qiniu.0871.cn/edition/footer/active-wode-3.svg',
						inactiveIcon: 'https://agan.qiniu.0871.cn/edition/footer/wode-3.svg',
						name: 2,
					},
				],
				count: 3, // 初始倒计时秒数
				timer: null, // 计时器,
				content: '',
				pool_table_id: '',
				footer_shop_id: '',
			}
		},
		props: {
			value: {
				type: Number,
				default: 0
			},
		},
		methods: {
			// 判断是否加新图标
			isNewIcon_if(index) {
				// if (index == 1) {
				// 	return true;
				// } else {
				return false;
				// }
			},
			startCountdown() {
				// 设置倒计时
				this.timer = setInterval(() => {
					// console.log(this.count)
					if (this.count > 0) {
						this.count -= 1;
					} else {
						clearInterval(this.timer); // 清除计时器
						uni.$u.route({
							url: 'pages/newHome/index',
							type: 'switchTab',
						})
						this.modelshow = false
						this.count = 3
						this.timer = null
					}
				}, 1000);
			},
			// 查询订单API
			async query_order_api() {
				const chat = this
				if(!this.or_userinfo) {
					this.query_order()
					return;
				}
				var data = {
					pool_table_id: this.pool_table_id,
					user_id: this.or_userinfo.user_id
				}
				await this.asyncPublic('order/scan', data)
					.then(res => {
						// console.log(res)
						// 存在进行中的订单，跳转订单详情
						if (res.data.code == 200) {
							uni.$u.route({
								url: '/pages/order/subpackage/order_details',
								type: 'redirectTo',
								params: {
									order_id: res.data.data.order_id
								}
							})
							// 用户和球桌都无订单
						} else if (res.data.code == 201) {
							uni.$u.route({
								url: 'pages/store/subpackage/open_table',
								params: {
									pool_table_id: chat.pool_table_id
								}
							})
						} else {
							// 特殊情况的跳转至首页（球桌被占用=210，球桌维护=220）
							this.content = res.data.message
							this.modelshow = true
							this.startCountdown()
							// uni.showModal({
							// 	title: '提示',
							// 	content: res.data.message+'，'+this.count+'秒后'+'，自动前往首页',
							// })
						}
					})
					.catch(err => {
						uni.$u.route({
							url: 'pages/newHome/index',
							type: 'switchTab',
						})
					})
			},
			// 查询订单
			async query_order() {
				this.or_set_data({shop_id:this.footer_shop_id});
				await this.or_get_userinfo()
					.then(res => {
						this.query_order_api()
					})
					.catch(err => {
						uni.showToast({
							title: '未查询到用户信息！',
							icon: 'none'
						})
						uni.$u.route({
							url: 'pages/store/subpackage/open_table',
							params: {
								pool_table_id: pool_table_id
							}
						})
					})
			},
			//扫一扫
			scanCode() {
				const chat = this
				// 允许从相机和相册扫码
				uni.scanCode({
					// scanType: ['QR_CODE'], //条形码
					success: function(res) {
						// console.log('条码类型：' + res.scanType);
						// console.log('条码内容：' + res.result);
						// console.log('扫码', res);
						// 微信小程序
						if (res.errMsg == "scanCode:ok") {
							// 扫描到的信息
							const url = res.result
							const params = chat.or_getQueryParams(url)

							// 存在球桌ID，查询球桌ID
							if (params.pool_table_id) {
								chat.footer_shop_id = params.shop_id // 设置全局门店ID，用于注册用户时，记录门店ID，方便管理
								chat.pool_table_id = params.pool_table_id
								chat.query_order()
							} else {
								// 跳转首页
								// if (params.shop_id) {
								uni.$u.route({
									url: 'pages/newHome/index',
									type: 'switchTab',
								})
								// }
							}
						} else {
							console.log("未识别到二维码，请重新尝试！")
						}
					}
				});
			},
			click(index) {
				// this.value = index
				if (index == 0) {
					var urls = '/pages/newHome/index'
				}
				// if (index == 1) {
				// 	var urls = '/pages/home/recharge'
				// }
				if (index == 1) {
					var urls = '/pages/order/index'
				}
				if (index == 2) {
					var urls = '/pages/my/index'
				}

				uni.switchTab({
					url: urls
				})
			},
		}
	}
</script>

<style>

	.u-tabbar-item {
		position: relative;
	}

	.cds-sds {
		position: absolute;
		top: 0px;
	}

	.custom-button {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
</style>