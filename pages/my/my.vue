<template>
	<view class="container">
		<nav-bar title="个人中心" title-align="center"></nav-bar>
		
		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<view class="dis_flex name-cla" @click="goToLogin">
				<view class="name-1 mar-rig-10">{{isLogin ? userInfo.username : '点击登录'}}</view>
				<view class="name-1">{{isLogin ? userInfo.phone_number : '登录后查看更多信息'}}</view>
			</view>
			<!-- User Section with Blue Background -->
			<view class="user-section">
				<view>
					<view class="dabeijing pos-rel">
						<view class="jiesuo">未解锁</view>
						<view class="dis_flex hg-vip">
							<image class="hg-img mar-rig-5" mode="aspectFill" src="https://ccpt.qiniu.0871.cn/home/my/hg.svg"></image>
							<image class="vip-img" mode="aspectFill" src="https://ccpt.qiniu.0871.cn/home/my/VIP1.svg"></image>
						</view>
						<view class="hx-cla"></view>
						<view class="jingy-cla">还需990经验值解锁普通会员，获取经验值 ></view>
						<view class="dis_flex jus-con" style="margin-bottom: 10px;">
							<view>
								<view class="zunx-cla">尊享权益</view>
								<view class="dengj-cla">了解更多等级权益 ></view>
							</view>
							<view class="dis_flex">
								<view>
									<image class="tq-1" mode="aspectFill" src="https://ccpt.qiniu.0871.cn/home/my/ldkq.svg"></image>
								</view>
								<view>
									<image class="tq-1" mode="aspectFill" src="https://ccpt.qiniu.0871.cn/home/my/czzk.svg"></image>
								</view>
								<view>
									<image class="tq-1" mode="aspectFill" src="https://ccpt.qiniu.0871.cn/home/my/zskf.svg"></image>
								</view>
							</view>
						</view>
						<view class="im-pos-1">
							<image class="toux11" mode="aspectFill" src="https://ccpt.qiniu.0871.cn/home/my/toux11.png"></image>
						</view>
					</view>
				</view>
				<!-- Blue Background -->
				<!-- <view class="blue-bg"></view> -->

				<!-- 头像区域 - 独立定位 -->
				<!-- <view class="avatar-container">
					<image class="avatar" src="https://ccpt.qiniu.0871.cn/112lbtx.png" mode="aspectFill" @click="goToLogin"></image>
				</view> -->

				<!-- 用户信息卡片 -->
				<!-- <view class="white-card" @click="goToLogin">
					<view class="user-card">
						<view class="user-info">
							<view class="user-details">
								<text class="nickname">{{isLogin ? userInfo.username : '点击登录'}}</text>
								<text class="phone">{{isLogin ? userInfo.phone_number : '登录后查看更多信息'}}</text>
							</view>
						</view>
						<view class="arrow">
							<text class="iconfont">></text>
						</view>
					</view>

					<view class="divider-line"></view>

					<view class="balance-coupon">
						<view class="balance item">
							<view class="icon-wrap">
								<image class="icon-image" src="https://ccpt.qiniu.0871.cn/my/wodeyue.png"
									mode="aspectFit"></image>
							</view>
							<view class="text-wrap">
								<text class="title">我的余额</text>
								<text class="desc">您的余额为¥{{ formattedBalance }}</text>
							</view>
						</view>
						<view class="coupon item">
							<view class="icon-wrap">
								<image class="icon-image" src="https://ccpt.qiniu.0871.cn/my/youhuiquan.png"
									mode="aspectFit"></image>
							</view>
							<view class="text-wrap">
								<text class="title">优惠券</text>
								<text class="desc">优惠券数量为0</text>
							</view>
						</view>
					</view>
				</view> -->

			</view>
			
			<view class="czyh-cla">
				<!-- <image class="czyh-cla" src="https://ccpt.qiniu.0871.cn/home/my/czyh.png" mode="aspectFit"></image> -->
			</view>

			<!-- Common Functions -->
			<view class="common-functions">
				<view class="padding-10 dis_flex jus-con">
					<view class="dis_flex">
						<view>
							<image class="cygn-cla" src="https://ccpt.qiniu.0871.cn/home/my/qb-11.png" mode="aspectFit"></image>
						</view>
						<view>
							<view class="biti-12">我的钱包</view>
							<view class="biti-13">可用余额 ¥{{ formattedBalance }}</view>
						</view>
					</view>
					<view class="dis_flex">
						<view>
							<image class="cygn-cla" src="https://ccpt.qiniu.0871.cn/home/my/zd-11.png" mode="aspectFit"></image>
						</view>
						<view>
							<view class="biti-12">优惠券</view>
							<view class="biti-13">优惠券数量0</view>
						</view>
					</view>
				</view>
				<!-- 分隔线 -->
				<view class="divider"></view>
				<text class="section-title">常用功能</text>
				<view class="function-grid">
					<view class="function-item" @click="navigateTo('/riderEnd/register')">
						<view class="icon-bg bg-blue">
							<image src="https://ccpt.qiniu.0871.cn/my/fuwuzhandian.png" mode="aspectFit"></image>
						</view>
						<text class="func-name">注册骑手接单</text>
					</view>

					<view class="function-item" @click="navigateTo('/pages/store-manage/index')">
						<view class="icon-bg bg-blue">
							<image src="https://ccpt.qiniu.0871.cn/home/my/mdgl.png" mode="aspectFit"></image>
						</view>
						<text class="func-name">门店管理</text>
					</view>

					<view class="function-item" @click="navigateTo('/pages/service-standard/index')">
						<view class="icon-bg bg-blue">
							<image src="https://ccpt.qiniu.0871.cn/my/fuwuzhinan.png" mode="aspectFit"></image>
						</view>
						<text class="func-name">服务标准</text>
					</view>

					<view class="function-item" @click="previewQRCode">
						<view class="icon-bg bg-blue">
							<image src="https://ccpt.qiniu.0871.cn/my/zaixiankefu.png" mode="aspectFit"></image>
						</view>
						<text class="func-name">在线客服</text>
					</view>

					<view class="function-item" @click="navigateTo('/pages/user-guide/index')">
						<view class="icon-bg bg-blue">
							<image src="https://ccpt.qiniu.0871.cn/my/yonghuzhinan.png" mode="aspectFit"></image>
						</view>
						<text class="func-name">用户指南</text>
					</view>

					<view class="function-item" @click="openShareModal">
						<view class="icon-bg bg-blue">
							<image src="https://ccpt.qiniu.0871.cn/home/my/fxtj.png" mode="aspectFit"></image>
						</view>
						<text class="func-name">分享推荐</text>
					</view>
				</view>
			</view>

			<!-- 角色切换区域 -->
			<view class="role-switch-section">
				<view class="switch-role-btn" @click="switchToRider">
					<text>切换成接单骑手角色></text>
				</view>
			</view>
		</view>

		<tab-bar></tab-bar>

		<!-- 悬浮小图 -->
		<floating-image
			@click="handleFloatingClick"
		></floating-image>

		<!-- 分享弹窗 -->
		<view class="share-modal" v-if="showShareModal" @click="closeShareModal">
			<view class="share-content" @click.stop>
				<view class="share-title">分享推荐</view>
				<view class="share-options">
					<view class="share-btn wechat-btn">
						<button class="share-button" open-type="share">
							<image class="share-icon" src="https://ccpt.qiniu.0871.cn/yonghu.png" mode="aspectFit"></image>
							<text>分享给好友</text>
						</button>
					</view>
					<view class="share-btn referral-btn" @click="goToReferralList">
						<image class="share-icon" src="https://ccpt.qiniu.0871.cn/rider/banner4.png" mode="aspectFit"></image>
						<text>推荐人员列表</text>
					</view>
				</view>
				<view class="reward-description">
					<text>！您可获得被推荐骑手订单额2.5%奖金，连续一年</text>
				</view>
				<view class="share-cancel" @click="closeShareModal">取消</view>
			</view>
		</view>

		<!-- 客服弹窗 -->
		<view class="service-modal" v-if="showServiceModal" @click="closeServiceModal">
			<view class="service-content" @click.stop>
				<view class="service-title">请添加运营微信，说明您可服务城市。方便后续推单！</view>
				<view class="service-qrcode">
					<image src="https://ccpt.qiniu.0871.cn/my/kefuwechat.png" mode="aspectFit" @click="previewQRCodeImage"></image>
				</view>
				<view class="service-desc">扫描二维码添加客服微信</view>
				<view class="service-cancel" @click="closeServiceModal">关闭</view>
			</view>
		</view>

		<!-- 悬浮聊天图标 -->
		<!-- <FloatingChatIconUser /> -->
	</view>
</template>

<script>
	import NavBar from '@/components/NavBar.vue'
	import TabBar from '@/components/tab-bar/tab-bar.vue'
	import FloatingImage from '@/components/FloatingImage/index.vue'
	// import FloatingChatIconUser from '@/components/FloatingChatIconUser/index.vue'
	import userMixin from '@/mixins/userMixin.js'
	import floatingImageMixin from '@/mixins/floatingImageMixin.js'

	export default {
		components: {
			NavBar,
			TabBar,
			FloatingImage,
			// FloatingChatIconUser
		},
		mixins: [userMixin, floatingImageMixin],
		data() {
			return {
				navBarHeight: 0,
				userInfo: null,
				isLogin: false,
				showShareModal: false,
				showServiceModal: false
			}
		},
		computed: {
			// 格式化余额显示
			formattedBalance() {
				if (!this.isLogin || !this.userInfo) {
					return '0.00';
				}
				const balance = this.userInfo.balance;
				if (balance === null || balance === undefined || isNaN(balance)) {
					return '0.00';
				}
				return Number(balance).toFixed(2);
			}
		},
		onLoad() {
			const systemInfo = uni.getSystemInfoSync()
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			this.navBarHeight = menuButtonInfo.bottom + 12
			// 获取用户信息
			this.getUserInfo()

			// 监听打开分享推荐弹窗事件
			uni.$on('openShareModal', this.handleOpenShareModal);
		},
		onShow() {
			// 每次显示页面时重新获取用户信息
			this.getUserInfo()
		},
		onUnload() {
			// 页面卸载时移除事件监听
			uni.$off('openShareModal', this.handleOpenShareModal);
		},
		methods: {
			navigateTo(url) {
				uni.navigateTo({
					url
				})
			},
			// 获取用户信息
			async getUserInfo() {
				const userInfo = uni.getStorageSync('userInfo')

				if (userInfo) {
					// 确保用户信息包含必要的字段
					this.userInfo = {
						balance: 0,
						...userInfo
					}
					this.isLogin = true
					console.log('用户信息:', this.userInfo)
				} else {
					this.userInfo = null
					this.isLogin = false
				}
			},
			// 跳转到登录页
			goToLogin() {
				uni.navigateTo({
					url: '/pages/login/index'
				})
			},
			switchToRider() {
				uni.reLaunch({
					url: '/pages/launcher/index'
				})
			},
			// 打开分享弹窗
			openShareModal() {
				if (!this.isLogin) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					this.goToLogin();
					return;
				}
				this.showShareModal = true;
			},
			// 关闭分享弹窗
			closeShareModal() {
				this.showShareModal = false;
			},
			// 跳转到推荐人员列表
			goToReferralList() {
				this.showShareModal = false; // 关闭弹窗
				if (!this.isLogin) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					this.goToLogin();
					return;
				}
				uni.navigateTo({
					url: '/pages/referral-list/index'
				});
			},

			// 处理打开分享推荐弹窗事件
			handleOpenShareModal() {
				console.log('收到打开分享推荐弹窗事件');
				// 延迟一下确保页面完全加载
				setTimeout(() => {
					this.openShareModal();
				}, 100);
			},

			// 处理悬浮小图点击事件
			handleFloatingClick: function() {
				console.log('点击悬浮小图');
				if (!this.isLogin) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					this.goToLogin();
					return;
				}
				this.showShareModal = true;
			},

			// 打开客服弹窗
			previewQRCode() {
				console.log('点击客服按钮，打开弹窗');
				this.showServiceModal = true;
				console.log('showServiceModal状态:', this.showServiceModal);
			},

			// 关闭客服弹窗
			closeServiceModal() {
				this.showServiceModal = false;
			},

			// 预览二维码图片
			previewQRCodeImage() {
				uni.previewImage({
					urls: ['https://ccpt.qiniu.0871.cn/my/kefuwechat.png'],
					current: 'https://ccpt.qiniu.0871.cn/my/kefuwechat.png'
				});
			}
		},
		// 分享给好友
		onShareAppMessage() {
			if (!this.userInfo || !this.userInfo.user_id) {
				return {
					title: '充充跑腿 - 便民服务平台',
					path: '/pages/login/index'
				};
			}

			return {
				title: '邀请您使用充充跑腿',
				path: `/pages/login/index?referrerId=${this.userInfo.user_id}`,
				imageUrl: 'https://ccpt.qiniu.0871.cn/yonghu.png'
			};
		},
		// 分享到朋友圈
		onShareTimeline() {
			if (!this.userInfo || !this.userInfo.user_id) {
				return {
					title: '充充跑腿 - 便民服务平台'
				};
			}

			return {
				title: '邀请您使用充充跑腿',
				query: `referrerId=${this.userInfo.user_id}`,
				imageUrl: 'https://ccpt.qiniu.0871.cn/yonghu.png'
			};
		}
	}
</script>

<style lang="scss" scoped>
	.biti-12{
		font-size: 15px;
		font-weight: 400;
		letter-spacing: 0px;
		line-height: 15px;
		color: rgba(50, 50, 51, 1);
		text-align: left;
		vertical-align: top;
		margin-bottom: 6rpx;
	}
	.biti-13{
		font-size: 11px;
		font-weight: 400;
		letter-spacing: 0px;
		line-height: 15.09px;
		color: rgba(171, 167, 167, 1);
		text-align: left;
		vertical-align: top;
	}
	.cygn-cla{
		width: 27px;
		height: 27px;
		margin-right: 20rpx;
	}
	.czyh-cla{
		background-size: cover; /* 覆盖整个容器，保持图片比例 */
		background-position: center;
		  background-repeat: no-repeat;
		  height: 50px;
		  width: 100%;
		  margin-bottom: 20px;
		background-image: url("https://ccpt.qiniu.0871.cn/home/my/czyouhui.svg");
	}
	.im-pos-1{
		position: absolute;
		top: -15px;
		right: 15px;
	}
	.toux11{
		width: 210rpx;
		 height: 210rpx;
	}
	.dengj-cla{
		width: 80px;
		height: 10px;
		opacity: 1;
		/** 文本1 */
		font-size: 8.5px;
		font-weight: 400;
		letter-spacing: 0px;
		line-height: 9.41px;
		color: rgba(125, 192, 250, 1);
		text-align: left;
		vertical-align: top;
	}
	.zunx-cla{
		width: 80px;
		height: 21px;
		opacity: 1;
		/** 文本1 */
		font-size: 18px;
		font-weight: 500;
		letter-spacing: 0px;
		line-height: 20.27px;
		color: rgba(36, 146, 242, 1);
		text-align: left;
		vertical-align: top;
		margin-bottom: 14rpx;
	}
	.jingy-cla{
		margin-top: 16rpx;
		margin-bottom: 50rpx;
		width: 100%;
		max-width: 470rpx;
		height: auto;
		opacity: 1;
		/** 文本1 */
		font-size: 11px;
		font-weight: 400;
		letter-spacing: 0.5px;
		line-height: 13.03px;
		color: rgba(10, 132, 240, 1);
		text-align: left;
		vertical-align: top;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.hx-cla{
		margin-top: 60rpx;
		width: 450rpx;
		height: 0px;
		opacity: 1;
		transform: rotate(0.32deg);
		border: 3px solid rgba(191, 225, 255, 1);
	}
	.hg-vip{
		margin: 50rpx 0rpx 30rpx -13rpx;
	}
	.hg-img{
		width: 30px;
		height: 21px;
	}
	.tq-1{
		width: 43px;
		height: 48px;
		margin-left: 40rpx;
	}
	.vip-img{
		width: 90px;
		height: 21px;
	}
	.jiesuo{
		margin-left: -15px;
		margin-top: -15px;
		width: 72px;
		height: 23px;
		line-height: 23px;
		opacity: 1;
		border-radius: 10px 0px;
		background: rgba(201, 230, 255, 1);
		/** 文本1 */
		font-size: 12px;
		font-weight: 400;
		letter-spacing: 1px;
		color: rgba(10, 132, 240, 1);
		text-align: center;
	}
	.name-cla{
		margin: 14rpx 0rpx;
	}
	.name-1{
		font-size: 14px;
		font-weight: 400;
		letter-spacing: 0px;
		line-height: 20.27px;
		color: rgba(255, 255, 255, 1);
		text-align: left;
		vertical-align: top;
	}
	.dabeijing{
		margin-bottom: 30rpx;
		padding: 30rpx 30rpx 40rpx 30rpx;
		height: 175px;
		opacity: 1;
		border-radius: 8px;
		background: linear-gradient(119.22deg, rgba(255, 255, 255, 1) 0%, rgba(197, 227, 252, 1) 100%);
	}

	/* 会员信息卡片样式 */
	.member-card {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		margin: 0 20rpx;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

		.member-avatar {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			margin-right: 24rpx;
			flex-shrink: 0;
		}

		.member-info {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;

			.member-name {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 8rpx;
			}

			.member-phone {
				font-size: 24rpx;
				color: #999;
				margin-bottom: 12rpx;
			}

			.member-level {
				display: inline-flex;
				align-items: center;
				align-self: flex-start;

				.level-text {
					font-size: 22rpx;
					color: #FF9800;
					background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
					padding: 4rpx 16rpx;
					border-radius: 20rpx;
					font-weight: 500;
					color: #fff;
				}
			}
		}

		.member-assets {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			gap: 16rpx;

			.asset-item {
				display: flex;
				flex-direction: column;
				align-items: flex-end;

				.asset-label {
					font-size: 22rpx;
					color: #999;
					margin-bottom: 4rpx;
				}

				.asset-value {
					font-size: 28rpx;
					font-weight: 600;
					color: #333;
				}
			}
		}
	}
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		font-family: "HarmonyOS Sans SC", sans-serif;
		opacity: 1;
		background: linear-gradient(180deg, rgba(36, 146, 242, 1) 20%, rgba(255, 255, 255, 0) 100%);}

	.content {
		padding: 0rpx 20rpx;
		padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
		position: relative;
	}

	.user-section {
		position: relative;
		margin-bottom: 0;
	}

	.blue-bg {
		position: absolute;
		top: -20rpx;
		left: 0;
		right: 0;
		height: 150rpx;
		background-color: #2492F2;
		z-index: 0;
	}

	.avatar-container {
		position: absolute;
		top: 0rpx;
		left: 40rpx;
		z-index: 3;

		.avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 50%;
			border: 4rpx solid #fff;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
		}
	}

	.white-card {
		background-color: #fff;
		border-radius: 12rpx 12rpx 0 0;
		position: relative;
		margin: 0 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 1;
	}

	.user-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx;
		padding-left: 180rpx;
		min-height: 90rpx;
		padding-top: 15rpx;
		margin-top: -10rpx;

		.user-info {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-top: -10rpx;

			.user-details {
				display: flex;
				flex-direction: column;

				.nickname {
					font-size: 32rpx;
					font-weight: 500;
					color: #333;
					margin-bottom: 8rpx;
				}

				.phone {
					font-size: 24rpx;
					color: #999;
				}
			}
		}

		.arrow {
			color: #ccc;
			font-size: 30rpx;
		}
	}
	.divider {
		width: 100%;
		height: 1rpx;
		background: #eee;
		margin: 24rpx 0 24rpx 0;
	}

	.divider-line {
		height: 1rpx;
		background-color: #f0f0f0;
		margin: 0 24rpx;
	}

	.divider-vertical {
		width: 1rpx;
		background-color: #f0f0f0;
		height: 70rpx;
		margin: 0 10rpx;
	}

	.balance-coupon {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 30rpx;
		padding-bottom: 40rpx;

		.item {
			flex: 1;
			display: flex;
			align-items: center;

			&.balance {
				justify-content: flex-start;
				padding-right: 0;
			}

			&.coupon {
				justify-content: flex-end;
				padding-left: 0;
			}

			.icon-wrap {
				width: 50rpx;
				height: 50rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				margin-right: 16rpx;

				.icon-image {
					width: 36rpx;
					height: 36rpx;
				}
			}

			.text-wrap {
				display: flex;
				flex-direction: column;

				.title {
					font-size: 26rpx;
					color: #333;
					margin-bottom: 4rpx;
				}

				.desc {
					font-size: 22rpx;
					color: #999;
				}
			}
		}
	}

	.recharge-activity {
		position: relative;
		width: auto;
		margin: 0 17rpx;
		// margin-top: -20rpx;
		margin-bottom: -20rpx;
		background-color: transparent;
		padding: 0;
		z-index: 2;
		box-shadow: none;
		text-align: center;

		.czhd-image {
			width: 102%;
			height: auto;
			display: inline-block;
			border-radius: 0;
			position: relative;
			left: -1%;
		}
	}

	.common-functions {
		margin-top: -10rpx;
		padding: 30rpx 20rpx 20rpx 20rpx;
		background-color: #FFFFFF;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
		position: relative;
		z-index: 0;

		.section-title {
			font-size: 30rpx;
			font-weight: 500;
			margin-bottom: 30rpx;
			display: block;
		}

		.function-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 30rpx;

			.function-item {
				display: flex;
				flex-direction: column;
				align-items: center;

				.icon-bg {
					width: 90rpx;
					height: 90rpx;
					border-radius: 50%;
					display: flex;
					justify-content: center;
					align-items: center;
					margin-bottom: 12rpx;

					image {
						width: 46rpx;
						height: 46rpx;
					}

					&.bg-blue {
						// background-color: rgba(36, 146, 242, 0.1);
						background: rgba(215, 232, 250, 1);
					}
				}

				.func-name {
					font-size: 24rpx;
					color: #333;
					text-align: center;
				}
			}
		}
	}

	.role-switch-section {
		margin: 40rpx 20rpx;
		text-align: center;

		.role-text {
			display: block;
			font-size: 28rpx;
			color: #666;
			margin-bottom: 20rpx;
		}
	}

	.switch-role-btn {
		height: 100rpx;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		color: #2492F2;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
	}

	/* 分享弹窗样式 */
	.share-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		z-index: 9999;

		.share-content {
			background-color: #fff;
			border-top-left-radius: 24rpx;
			border-top-right-radius: 24rpx;
			width: 100%;
			padding: 40rpx 30rpx;
			padding-bottom: calc(40rpx + constant(safe-area-inset-bottom));
			padding-bottom: calc(40rpx + env(safe-area-inset-bottom));

			.share-title {
				text-align: center;
				font-size: 32rpx;
				font-weight: 500;
				color: #333;
				margin-bottom: 40rpx;
			}

			.share-options {
				display: flex;
				justify-content: center;
				gap: 60rpx;
				margin-bottom: 40rpx;

				.share-btn {
					display: flex;
					flex-direction: column;
					align-items: center;
					padding: 30rpx 40rpx;
					border-radius: 12rpx;
					background-color: transparent;
					border: 2rpx solid transparent;
					font-size: 28rpx;
					color: #333;
					min-width: 140rpx;
					position: relative;

					&.wechat-btn {
						background-color: rgba(46, 213, 115, 0.1);
						border-color: rgba(46, 213, 115, 0.2);

						&:active {
							background-color: rgba(46, 213, 115, 0.2);
						}

						.share-button {
							background: transparent;
							border: none;
							padding: 0;
							display: flex;
							flex-direction: column;
							align-items: center;
							font-size: inherit;
							color: inherit;

							&::after {
								border: none;
							}
						}
					}

					&.referral-btn {
						background-color: rgba(255, 193, 7, 0.1);
						border-color: rgba(255, 193, 7, 0.2);

						&:active {
							background-color: rgba(255, 193, 7, 0.2);
						}
					}

					.share-icon {
						width: 48rpx;
						height: 48rpx;
						margin-bottom: 16rpx;
					}

					text {
						font-size: 24rpx;
						color: #666;
					}
				}
			}

			.reward-description {
				text-align: center;
				margin-bottom: 30rpx;
				padding: 0 20rpx;

				text {
					font-size: 26rpx;
					color: #e6a23c;
					line-height: 1.4;
					font-weight: 500;
				}
			}

			.share-cancel {
				text-align: center;
				padding: 24rpx;
				background-color: #f5f5f5;
				border-radius: 12rpx;
				color: #666;
				font-size: 28rpx;
			}
		}
	}

	/* 客服弹窗样式 */
	.service-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;

		.service-content {
			background-color: white;
			border-radius: 20rpx;
			padding: 40rpx;
			margin: 40rpx;
			text-align: center;
			max-width: 500rpx;
			width: 80%;

			.service-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 30rpx;
			}

			.service-qrcode {
				margin: 30rpx 0;

				image {
					width: 400rpx;
					height: 400rpx;
					border-radius: 12rpx;
				}
			}

			.service-desc {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 30rpx;
				line-height: 1.4;
			}

			.service-cancel {
				text-align: center;
				padding: 24rpx;
				background-color: #f5f5f5;
				border-radius: 12rpx;
				color: #666;
				font-size: 28rpx;
			}
		}
	}
</style>