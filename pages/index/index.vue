<template>
	<view class="container">
		<!--顶部导航栏-->
		<nav-bar></nav-bar>

		<!-- 内容区域 -->
		<view class="page-content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- Banner区域 -->
			<view class="banner-section">
				<view class="banner-bg"></view>
				<!-- 城市选择器 -->
				<view class="city-selector-container">
					<view class="city-count-badge">
						<text class="city-count-text">全国已开{{totalCityCount}}城</text>
					</view>
					<view class="city-selector" @click="handleCitySelect">
						<text class="city-name">{{currentCity}}</text>
						<text class="arrow">▼</text>
					</view>
				</view>
				<view class="banner">
					<swiper
						class="banner-swiper"
						:indicator-dots="true"
						:autoplay="true"
						:interval="3000"
						:duration="500"
						indicator-color="rgba(255, 255, 255, 0.5)"
						indicator-active-color="#ffffff"
						circular
					>
						<swiper-item v-for="(banner, index) in bannerList" :key="index">
							<image :src="banner.image" mode="aspectFill" class="banner-image"></image>
						</swiper-item>
					</swiper>
				</view>
			</view>

			<!-- 加载中提示 -->
			<view v-if="loading" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 服务网格 -->
			<view v-else class="grid">
				<view
					v-for="(item, index) in taskTypes"
					:key="index"
					class="grid-item"
					:class="[item.type ? classMap[item.type] || 'yellow' : 'yellow']"
					:data-upcoming="item.type !== '1' && item.type !== '2'"
					@click="navigateTo(item.url, item.task_type_id)"
				>
					<view class="grid-content">
						<view class="text-wrap">
							<view class="title">{{item.task_name}}</view>
							<view class="subtitle" :class="{ 'gray-subtitle': item.type !== '1' }">{{item.detail}}</view>
						</view>
						<image class="grid-icon" :src="item.icon" mode="aspectFit"></image>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部导航栏 -->
		<tab-bar></tab-bar>

		<!-- 悬浮小图 -->
		<floating-image></floating-image>

		<!-- 认证提示弹窗 -->
		<auth-modal
			:show="showAuthModal"
			title="登录提示"
			content="请先登录后再操作"
			cancel-text="取消"
			confirm-text="去登录"
			@cancel="handleAuthCancel"
			@confirm="handleAuthConfirm"
		/>

		<!-- 海报弹窗 -->
		<poster-modal
			:show="showPosterModal"
			:posters="posterList"
			@close="handlePosterClose"
			@posterClick="handlePosterClick"
		/>

		<!-- 悬浮聊天图标 -->
		<FloatingChatIconUser />
	</view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import TabBar from '@/components/tab-bar/tab-bar.vue'
import AuthModal from '@/components/AuthModal/index.vue'
import PosterModal from '@/components/PosterModal/index.vue'
import FloatingImage from '@/components/FloatingImage/index.vue'
import FloatingChatIconUser from '@/components/FloatingChatIconUser/index.vue'
import userMixin from '@/mixins/userMixin.js'

export default {
	components: {
		NavBar,
		TabBar,
		AuthModal,
		PosterModal,
		FloatingImage,
		FloatingChatIconUser
	},
	mixins: [userMixin],
	data() {
		return {
			bgColor: '#fff',
			navBarHeight: 0,
			taskTypes: [],
			cityList: [],
			currentCity: '请选择下单城市',
			loading: true, // 加载状态
			classMap: {
				'1': 'yellow',    // 补宝
				'2': 'light-blue', // 离线&异常
				'3': 'blue',      // 装机
				'4': 'pink',      // 撤机
				'5': 'green',     // 回收坏宝
				'6': 'gray',      // 送装配件
				'7': 'orange'     // 购券充值
			},
			showAuthModal: false,
			providerInfo: null,
			totalCityCount: 0, // 全国已开通城市数量
			showPosterModal: false, // 海报弹窗显示状态
			posterList: [ // 海报列表
				{
				  id: 1,
				  image: 'https://ccpt.qiniu.0871.cn/banner123.png',
				  title: '海报1',
				  url: ''
				},
				{
				  id: 2,
				  image: 'https://ccpt.qiniu.0871.cn/banner20.png',
				  title: '海报2',
				  url: ''
				}
				// {
				// 	id: 2,
				// 	image: 'https://ccpt.qiniu.0871.cn/p13.png',
				// 	title: '海报2',
				// 	url: ''
				// },
				// {
				// 	id: 3,
				// 	image: 'https://ccpt.qiniu.0871.cn/p1.png',
				// 	title: '海报3',
				// 	url: ''
				// }
				// ,
				// {
				// 	id: 4,
				// 	image: 'https://ccpt.qiniu.0871.cn/p2.png',
				// 	title: '海报4',
				// 	url: ''
				// },
				// {
				// 	id: 5,
				// 	image: 'https://ccpt.qiniu.0871.cn/p3.png',
				// 	title: '海报5',
				// 	url: ''
				// }
			],
			bannerList: [ // banner轮播图列表
				{
					id: 1,
					image: 'https://ccpt.qiniu.0871.cn/home/banner13.png',
					title: 'Banner 1',
					url: ''
				},
				{
					id: 2,
					image: 'https://ccpt.qiniu.0871.cn/home/banner2.png',
					title: 'Banner 2',
					url: ''
				}
			]
		}
	},
	created() {
		// 获取导航栏高度
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
		const systemInfo = uni.getSystemInfoSync();
		this.navBarHeight = menuButtonInfo.bottom + 8;
	},
	onShow() {
		// 调用任务类型接口
		this.getTaskTypes();
		// 调用城市列表接口
		this.getCityList();
		// 不再强制检查城市选择，允许用户直接进入

		// 获取本地存储的城市信息
		const selectedCity = uni.getStorageSync('selectedCity')
		if (selectedCity) {
			this.currentCity = selectedCity
		} else {
			// 如果没有选择城市，显示默认文本
			this.currentCity = '请选择下单城市'
		}

		// 获取本地存储的区域ID
		const selectedDistrictId = uni.getStorageSync('selectedDistrictId')
		if (selectedDistrictId) {
			this.getProviderInfo(selectedDistrictId)
		}

		// 检查是否需要显示海报弹窗
		this.checkPosterModal();
	},
	methods: {
		// 注释掉强制城市选择检查
		// checkCitySelected() {
		// 	const selectedCity = uni.getStorageSync('selectedCity');
		// 	if (!selectedCity) {
		// 		uni.navigateTo({
		// 			url: '/pages/index/city/index',
		// 			fail: (err) => {
		// 				console.error('页面跳转失败:', err);
		// 				uni.showToast({
		// 					title: '页面跳转失败',
		// 					icon: 'none'
		// 				});
		// 			}
		// 		});
		// 	} else {
		// 		this.currentCity = selectedCity;
		// 	}
		// },
		// 获取任务类型列表
		async getTaskTypes() {
			try {
				this.loading = true; // 开始加载，显示加载中状态
				const res = await this.$request('task/type', {}, 'POST');
				console.log('任务类型数据:', res);
				if (res && res.data) {
					// 确保每个任务项都有type属性和url属性
					this.taskTypes = res.data.map(item => {
						// 设置type属性
						if (!item.type) {
							// 如果没有type属性，根据task_name或其他属性设置默认type
							if (item.task_name.includes('补宝')) {
								item.type = '1';
							} else if (item.task_name.includes('离线') || item.task_name.includes('异常')) {
								item.type = '2';
							} else if (item.task_name.includes('装机')) {
								item.type = '3';
							} else if (item.task_name.includes('撤机')) {
								item.type = '4';
							} else if (item.task_name.includes('回收')) {
								item.type = '5';
							} else if (item.task_name.includes('配件')) {
								item.type = '6';
							} else if (item.task_name.includes('上门')) {
								item.type = '7';
							} else {
								item.type = '1'; // 默认使用黄色
							}
						}

						// 设置url属性
						if (!item.url) {
							// 根据type设置默认url
							switch(item.type) {
								case '1':
									item.url = '/pages/index/publish/index';
									break;
								case '2':
									item.url = '/pages/index/offline/index';
									break;
								case '3':
									item.url = '/pages/install/index';
									break;
								case '4':
									item.url = '/pages/remove/index';
									break;
								case '5':
									item.url = '/pages/recycle/index';
									break;
								case '6':
									item.url = '/pages/parts/index';
									break;
								case '7':
									item.url = '/pages/recharge/index';
									break;
								default:
									item.url = '/pages/index/publish/index';
							}
						}

						// 设置副标题
						// if (item.type !== '1') {
						// 	item.detail = '即将上线...';
						// }

						return item;
					});
				} else {
					uni.showToast({
						title: res.data.msg || '获取任务类型失败',
						icon: 'none'
					});
				}
			} catch (err) {
				console.error('获取任务类型失败:', err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				});
			} finally {
				// 检查城市列表是否也已加载完成
				if (this.cityList.length > 0) {
					this.loading = false; // 所有数据加载完成，隐藏加载中状态
				}
			}
		},
		// 获取城市列表
		async getCityList() {
			try {
				this.loading = true; // 开始加载，显示加载中状态
				const res = await this.$request('service/zone', {}, 'POST');
				console.log('城市列表数据:', res);
				if (res.code === 200 && res.data) {
					this.cityList = res.data;
					uni.setStorageSync('cityList', this.cityList);

					// 计算已开通区县的总数
					let count = 0;
					this.cityList.forEach(province => {
						province.children.forEach(city => {
							if (city.children && city.children.length > 0) {
								count += city.children.length; // 累加每个城市下的区县数量
							}
						});
					});
					this.totalCityCount = count;
					uni.setStorageSync('totalCityCount', count);
				} else {
					uni.showToast({
						title: res.msg || '获取城市列表失败',
						icon: 'none'
					});
				}
			} catch (err) {
				console.error('获取城市列表失败:', err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				});
			} finally {
				// 检查任务类型是否也已加载完成
				if (this.taskTypes.length > 0) {
					this.loading = false; // 所有数据加载完成，隐藏加载中状态
				}
			}
		},
		// 处理城市选择
		handleCitySelect() {
			uni.navigateTo({
				url: '/pages/index/city/index',
				fail: (err) => {
					console.error('页面跳转失败:', err);
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					});
				}
			});
		},
		// 页面跳转
		navigateTo(url, taskTypeId) {
			// 检查任务类型
			const taskType = this.taskTypes.find(item => item.task_type_id === taskTypeId);
			// 允许补宝（type='1'）和离线&异常（type='2'）跳转，其他类型暂时不开放
			if (taskType && taskType.type !== '1' && taskType.type !== '2') {
				uni.showToast({
					title: '即将上线，感谢您的支持',
					icon: 'none',
					duration: 2000
				});
				return;
			}

			// 不再检查登录状态，直接跳转
			if (!url) {
				uni.showToast({
					title: '页面路径不存在',
					icon: 'none'
				});
				return;
			}
			uni.navigateTo({
				url: `${url}?taskTypeId=${taskTypeId}`,
				fail: (err) => {
					console.error('页面跳转失败:', err);
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					});
				}
			});
		},
		handleAuthCancel() {
			this.showAuthModal = false;
		},
		handleAuthConfirm() {
			this.showAuthModal = false;
			// 跳转到登录页面
			uni.navigateTo({
				url: '/pages/login/index'
			});
		},
		checkLoginAndShowModal() {
			const userInfo = uni.getStorageSync('userInfo');
			if (!userInfo || !userInfo.openid) {
				this.showAuthModal = true;
				return false;
			}
			return true;
		},
		// 获取服务商信息
		async getProviderInfo(districtId) {
			try {
				console.log('🏪 首页-获取服务商信息，区域ID:', districtId);
				const res = await this.$request('task/provider/info', { district_id: districtId }, 'POST');
				console.log('首页-服务商信息:', res);
				if (res.code === 200) {
					// 处理服务商信息
					this.providerInfo = res.data;
					uni.setStorageSync('providerInfo', this.providerInfo)
					console.log('✅ 首页-服务商信息获取成功并保存到本地存储');
				} else {
					console.error('首页-获取服务商信息失败:', res.msg);
				}
			} catch (err) {
				console.error('首页-获取服务商信息失败:', err);
			}
		},

		// 检查是否需要显示海报弹窗
		checkPosterModal() {
			const today = new Date().toDateString();
			const lastShownDate = uni.getStorageSync('posterModalLastShown');

			// 如果今天还没有显示过海报弹窗，则显示
			if (lastShownDate !== today) {
				// 延迟1秒显示，确保页面加载完成
				setTimeout(() => {
					this.showPosterModal = true;
					// 记录今天已显示过海报弹窗
					uni.setStorageSync('posterModalLastShown', today);
				}, 1000);
			}
		},

		// 处理海报弹窗关闭
		handlePosterClose() {
			this.showPosterModal = false;
		},

		// 处理海报点击
		handlePosterClick(poster) {
			console.log('点击海报:', poster);
			// 可以在这里处理海报点击事件，比如跳转到指定页面
			if (poster.url) {
				uni.navigateTo({
					url: poster.url
				});
			}
			this.showPosterModal = false;
		},


	}
}
</script>

<style lang="scss" scoped>
	// 全局字体设置
	view, text {
		font-family: "HarmonyOS Sans SC", sans-serif;
	}

	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.loading-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 40rpx 0;

		.loading-spinner {
			width: 40rpx;
			height: 40rpx;
			border: 3rpx solid #f3f3f3;
			border-top: 3rpx solid #2492F2;
			border-radius: 50%;
			animation: spin 1s linear infinite;
			margin-right: 10rpx;
		}

		.loading-text {
			font-size: 24rpx;
			color: #999;
		}
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.page-content {
		position: relative;
		z-index: 1;
	}

	.banner-section {
		position: relative;
		width: 100%;

		.banner-bg {
			position: absolute;
			left: 0;
			right: 0;
			top: -20rpx;
			height: 200rpx;
			background: linear-gradient(180deg,
				#2492F2 0%,
				#2492F2 20%,
				rgba(36,146,242,0.6) 70%,
				rgba(36,146,242,0) 100%
			);
			z-index: 1;
		}

		.city-selector-container {
			position: relative;
			z-index: 2;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}

		.city-selector {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 8rpx;

			.city-name {
				font-size: 32rpx;
				color: #ffffff;
				font-weight: 500;
				margin-right: 8rpx;
			}

			.arrow {
				font-size: 24rpx;
				color: #ffffff;
				transform: scale(0.8);
			}
		}

		.city-count-badge {
			background-color: rgba(255, 255, 255, 0.2);
			border-radius: 20rpx;
			padding: 4rpx 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: 10rpx;
			margin-bottom: 10rpx;

			.city-count-text {
				font-size: 20rpx;
				color: #ffffff;
				font-weight: 400;
				line-height: 28rpx;
			}
		}

		.banner {
			position: relative;
			padding: 20rpx 20rpx;
			z-index: 2;

			.banner-swiper {
				width: 100%;
				height: 280rpx;
				border-radius: 16rpx;
				overflow: hidden;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

				.banner-image {
					width: 100%;
					height: 100%;
					border-radius: 16rpx;
				}
			}

			// 保留原有的image样式作为备用
			image {
				width: 100%;
				height: 280rpx;
				border-radius: 16rpx;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
			}
		}
	}

	.grid {
		padding: 0 20rpx;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;

		.grid-item {
			border-radius: 16rpx;
			height: 134rpx;
			position: relative;
			overflow: hidden;
			border-width: 2rpx;
			border-style: solid;

			// 补宝占满整行
			&.yellow {
				grid-column: 1 / -1; // 从第一列跨到最后一列
				background: #DEF0FF;
				border-color: #F5F5F5;
				height: 170rpx; // 更小的卡片高度

				.grid-content {
					padding: 25rpx !important; // 更小的内边距

					.text-wrap {
						.title {
							color: #2296EA !important;
							font-size: 46rpx !important; // 更小的标题文字大小
							line-height: 54rpx !important;
							margin-bottom: 12rpx !important; // 更小的间距
							font-weight: 600 !important; // 稍微减轻加粗
						}

						.subtitle {
							color: #464646 !important;
							font-size: 28rpx !important; // 更小的副标题文字大小
							line-height: 36rpx !important;
							font-weight: 500 !important; // 保持加粗
						}
					}

					.grid-icon {
						filter: brightness(0) saturate(100%) invert(48%) sepia(85%) saturate(2849%) hue-rotate(190deg) brightness(97%) contrast(95%);
						width: 100rpx !important; // 更小的图标尺寸
						height: 100rpx !important;
					}
				}
			}

			&.blue {
				background: #DEF0FF;
				border-color: #F5F5F5;
				.title { color: #2296EA; }
				.subtitle { color: #464646; }
			}

			&.light-blue {
				grid-column: 1 / -1; // 从第一列跨到最后一列，占满整行
				background: #DEF0FF;
				border-color: #F5F5F5;
				height: 170rpx; // 和补宝一样的卡片高度

				.grid-content {
					padding: 25rpx !important; // 和补宝一样的内边距

					.text-wrap {
						.title {
							color: #2296EA !important; // 和补宝一样的标题颜色
							font-size: 46rpx !important; // 和补宝一样的标题文字大小
							line-height: 54rpx !important;
							margin-bottom: 12rpx !important; // 和补宝一样的间距
							font-weight: 600 !important; // 和补宝一样的字重
						}

						.subtitle {
							color: #464646 !important; // 和补宝一样的副标题颜色
							font-size: 28rpx !important; // 和补宝一样的副标题文字大小
							line-height: 36rpx !important;
							font-weight: 500 !important; // 和补宝一样的字重
						}
					}

					.grid-icon {
						filter: brightness(0) saturate(100%) invert(48%) sepia(85%) saturate(2849%) hue-rotate(190deg) brightness(97%) contrast(95%); // 和补宝一样的图标颜色
						width: 100rpx !important; // 和补宝一样的图标尺寸
						height: 100rpx !important;
					}
				}
			}

			&.pink {
				background: #DEF0FF;
				border-color: #F5F5F5;
				.title { color: #2296EA; }
				.subtitle { color: #464646; }
			}

			&.green {
				background: #DEF0FF;
				border-color: #F5F5F5;
				.title { color: #2296EA; }
				.subtitle { color: #464646; }
			}

			&.gray {
				background: #DEF0FF;
				border-color: #F5F5F5;
				.title { color: #2296EA; }
				.subtitle { color: #464646; }
			}

			&.orange {
				background: #DEF0FF;
				border-color: #F5F5F5;
				.title { color: #2296EA; }
				.subtitle { color: #464646; }
			}

			.grid-content {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20rpx;
				height: 100%;
				box-sizing: border-box;

				.text-wrap {
					.title {
						font-size: 34rpx;
						font-weight: 600;
						margin-bottom: 16rpx;
						line-height: 42rpx;
					}

					.subtitle {
						font-size: 22rpx;
						font-weight: 500;
						line-height: 28rpx;
					}
				}

				.grid-icon {
					width: 50rpx;
					height: 50rpx;
					&.active {
						filter: brightness(0) saturate(100%) invert(48%) sepia(85%) saturate(2849%) hue-rotate(190deg) brightness(97%) contrast(95%);
					}
					&.inactive {
						filter: brightness(0) saturate(100%) invert(70%) sepia(85%) saturate(2849%) hue-rotate(190deg) brightness(97%) contrast(95%);
					}
				}
			}

			&[data-upcoming="true"] {
				.title {
					color: #8BC9F6;
				}
				.subtitle {
					color: #464646;
				}
				.grid-icon {
					filter: brightness(0) saturate(100%) invert(70%) sepia(85%) saturate(2849%) hue-rotate(190deg) brightness(97%) contrast(95%);
					opacity: 0.5;
				}
			}
		}
	}

	.nav-section {
		display: flex;
		justify-content: space-between;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 8rpx;
		margin: 20rpx;

		.grid-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 20rpx 0;

			&.item-1 {
				.title {
					color: #2492F2;
				}
				.subtitle {
					color: #464646;
				}
			}

			&.item-2 {
				.title {
					color: #FF6B00;
				}
				.subtitle {
					color: #464646;
				}
			}

			&.item-3 {
				.title {
					color: #00B578;
				}
				.subtitle {
					color: #464646;
				}
			}

			&.item-4 {
				.title {
					color: #FF4D4F;
				}
				.subtitle {
					color: #464646;
				}
			}

			.icon {
				width: 80rpx;
				height: 80rpx;
				margin-bottom: 10rpx;
			}

			.title {
				font-size: 28rpx;
				font-weight: 500;
				margin-bottom: 4rpx;
			}

			.subtitle {
				font-size: 24rpx;
			}
		}
	}

	.subtitle.gray-subtitle {
		color: #464646 !important;
	}
</style>