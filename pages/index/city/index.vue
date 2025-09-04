<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<nav-bar title="选择下单城市" title-align="center"></nav-bar>

		<!-- 内容区域 -->
		<view class="page-content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 搜索框 -->
			<view class="search-box">
				<view class="search-input-wrap">
					<text class="search-icon">🔍</text>
					<input
						type="text"
						v-model="searchKeyword"
						placeholder="搜索城市"
						placeholder-class="placeholder-style"
						class="search-input"
						@input="filterCities"
					/>
					<text v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</text>
				</view>
			</view>

			<!-- 加载中状态 -->
			<view v-if="loading" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 城市列表 -->
			<scroll-view
				v-else
				scroll-y
				class="city-list"
				:enhanced="true"
				:show-scrollbar="false"
			>
				<!-- 搜索结果 -->
				<view v-if="searchKeyword && filteredResults.length > 0" class="search-results">
					<view class="section-title">
						<text class="title-text">搜索结果</text>
						<text class="result-count">共{{filteredResults.length}}个结果</text>
					</view>
					<view class="district-list">
						<view
							v-for="(result, index) in filteredResults"
							:key="index"
							class="district-item"
							:class="{ active: isCurrentCity(result) }"
							@click="handleSearchResultSelect(result)"
						>
							<view class="district-info">
								<text class="district-name">{{result.displayName}}</text>
								<text class="rider-count">（{{getResultRiderCount(result)}}位骑手）</text>
							</view>
							<text v-if="isCurrentCity(result)" class="check-icon">✓</text>
						</view>
					</view>
				</view>

				<!-- 无搜索结果 -->
				<view v-else-if="searchKeyword && filteredResults.length === 0" class="no-result">
					<image src="/static/images/no-result.png" mode="aspectFit" class="no-result-image"></image>
					<text class="no-result-text">未找到相关城市</text>
				</view>

				<!-- 城市列表 -->
				<view v-else>
					<view
						v-for="(province, provinceIndex) in cityList"
						:key="provinceIndex"
						class="province-section"
					>
						<!-- 省份标题 -->
						<view class="province-title" @click="toggleProvince(province.name)">
							<view class="title-left">
								<text class="title-text">{{province.name}}</text>
								<text class="subtitle-text">（已开{{getProvinceDistrictCount(province)}}城）</text>
								<text class="rider-count">{{getProvinceRiderCount(province)}}位骑手</text>
							</view>
							<view class="toggle-icon" :class="{ 'expanded': isProvinceExpanded(province.name) }">
								<text>{{ isProvinceExpanded(province.name) ? '▲' : '▼' }}</text>
							</view>
						</view>
						<!-- 城市列表 -->
						<view
							v-if="isProvinceExpanded(province.name)"
							v-for="(city, cityIndex) in province.children"
							:key="cityIndex"
							class="city-section"
						>
							<!-- 城市标题 -->
							<view class="city-title" @click="toggleCity(province.name, city.name)">
								<view class="title-left">
									<text class="title-text">{{city.name}}</text>
									<text class="rider-count">{{getCityRiderCount(city)}}位骑手</text>
								</view>
								<view class="toggle-icon" :class="{ 'expanded': isCityExpanded(province.name, city.name) }">
									<text>{{ isCityExpanded(province.name, city.name) ? '▲' : '▼' }}</text>
								</view>
							</view>
							<!-- 区县列表 -->
							<view class="district-list" v-if="isCityExpanded(province.name, city.name)">
								<view
									v-for="(district, districtIndex) in city.children"
									:key="districtIndex"
									class="district-item"
									:class="{ active: currentCity === district.name }"
									@click="handleCitySelect(city.name, district)"
								>
									<view class="district-info">
										<text class="district-name">{{district.name}}</text>
										<text class="rider-count">（{{getRiderCount(district)}}位骑手）</text>
									</view>
									<text v-if="currentCity === district.name" class="check-icon">✓</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 底部提示 -->
			<view class="bottom-tip">
				<view class="tip-content">
					<text class="tip-text">没有想选的城市？前往申请</text>
				</view>
			</view>
		</view>

		<!-- 悬浮聊天图标 -->
		<FloatingChatIconUser />
	</view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import FloatingChatIconUser from '@/components/FloatingChatIconUser/index.vue'

export default {
	components: {
		NavBar,
		FloatingChatIconUser
	},
	data() {
		return {
			navBarHeight: 0,
			cityList: [],
			currentCity: '乐山',
			searchKeyword: '',
			filteredResults: [],
			loading: true,
			expandedProvinces: {},
			expandedCities: {}
		}
	},
	created() {
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
		const systemInfo = uni.getSystemInfoSync();
		this.navBarHeight = menuButtonInfo.bottom + 8;
	},
	onLoad() {
		const pages = getCurrentPages();
		const prevPage = pages[pages.length - 2];
		if (prevPage) {
			this.currentCity = prevPage.$vm.currentCity;
		}

		this.getCityList();
	},

	// 页面显示时不自动展开，保持默认折叠状态
	onShow() {
		// 所有城市默认不展开，用户需要手动点击展开
	},
	methods: {
		async getCityList() {
			this.loading = true;
			try {
				const res = await this.$request('service/zone', {}, 'POST');
				console.log('城市列表数据:', res);
				if (res.code === 200 && res.data) {
					this.cityList = res.data;
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
				this.loading = false;
			}
		},
		handleCitySelect(city, district) {
			console.log(city, district)
			const fullCityName = `${city} · ${district.name}`;

			const pages = getCurrentPages();
			const prevPage = pages[pages.length - 2];
			if (prevPage) {
				prevPage.$vm.currentCity = fullCityName;
			}

			uni.setStorageSync('selectedCity', fullCityName);
			uni.setStorageSync('selectedDistrictId', district.district_id);
			console.log('城市已保存到本地存储:', fullCityName);

			// 触发区域选择完成事件，通知发布任务页面重新获取服务商信息
			uni.$emit('areaSelected', {
				city: fullCityName,
				districtId: district.district_id
			});
			console.log('🎯 触发区域选择完成事件');

			uni.navigateBack();
		},
		filterCities() {
			if (!this.searchKeyword) {
				this.filteredResults = [];
				return;
			}

			let allResults = [];

			this.cityList.forEach(province => {
				province.children.forEach(city => {
					// 添加地级市作为选择项
					if (city.name.includes(this.searchKeyword) ||
						province.name.includes(this.searchKeyword)) {
						allResults.push({
							type: 'city',
							name: city.name,
							displayName: city.name,
							province: province.name,
							city: city.name,
							cityData: city
						});
					}

					// 添加区县作为选择项
					if (city.children) {
						city.children.forEach(district => {
							if (district.name.includes(this.searchKeyword) ||
								city.name.includes(this.searchKeyword) ||
								province.name.includes(this.searchKeyword)) {
								allResults.push({
									type: 'district',
									name: district.name,
									displayName: district.name,
									district_id: district.district_id,
									province: province.name,
									city: city.name,
									districtData: district
								});
							}
						});
					}
				});
			});

			this.filteredResults = allResults;
		},
		clearSearch() {
			this.searchKeyword = '';
			this.filteredResults = [];
		},
		toggleProvince(provinceName) {
			this.$set(this.expandedProvinces, provinceName, !this.expandedProvinces[provinceName]);
		},
		isProvinceExpanded(provinceName) {
			return !!this.expandedProvinces[provinceName];
		},
		toggleCity(provinceName, cityName) {
			if (!this.expandedCities[provinceName]) {
				this.$set(this.expandedCities, provinceName, {});
			}
			this.$set(this.expandedCities[provinceName], cityName, !this.expandedCities[provinceName][cityName]);
		},
		isCityExpanded(provinceName, cityName) {
			return !!(this.expandedCities[provinceName] && this.expandedCities[provinceName][cityName]);
		},

		// 计算省份下所有区县的数量
		getProvinceDistrictCount(province) {
			let totalCount = 0;
			if (province.children && Array.isArray(province.children)) {
				province.children.forEach(city => {
					if (city.children && Array.isArray(city.children)) {
						totalCount += city.children.length;
					}
				});
			}
			return totalCount;
		},

		// 获取区县骑手数量（乘以1）
		getRiderCount(district) {
			const count = district.service_member_count || 0;
			return count * 1;
		},

		// 获取地级市总入驻人数（所有区县人数总和）
		getCityRiderCount(city) {
			let totalCount = 0;
			if (city.children && Array.isArray(city.children)) {
				city.children.forEach(district => {
					const count = district.service_member_count || 0;
					totalCount += count * 1;
				});
			}
			return totalCount;
		},

		// 获取省份总入驻人数（所有地级市人数总和）
		getProvinceRiderCount(province) {
			let totalCount = 0;
			if (province.children && Array.isArray(province.children)) {
				province.children.forEach(city => {
					totalCount += this.getCityRiderCount(city);
				});
			}
			return totalCount;
		},

		// 处理搜索结果选择
		handleSearchResultSelect(result) {
			if (result.type === 'city') {
				// 选择地级市 - 使用地级市名称
				const fullCityName = result.city;

				const pages = getCurrentPages();
				const prevPage = pages[pages.length - 2];
				if (prevPage) {
					prevPage.$vm.currentCity = fullCityName;
				}

				uni.setStorageSync('selectedCity', fullCityName);
				// 地级市没有具体的district_id，可以设置为null或者使用城市的第一个区县
				uni.setStorageSync('selectedDistrictId', null);
				console.log('地级市已保存到本地存储:', fullCityName);

				// 触发区域选择完成事件
				uni.$emit('areaSelected', {
					city: fullCityName,
					districtId: null,
					type: 'city'
				});
				console.log('🎯 触发地级市选择完成事件');
			} else if (result.type === 'district') {
				// 选择区县 - 使用原有逻辑
				const fullCityName = `${result.city} · ${result.name}`;

				const pages = getCurrentPages();
				const prevPage = pages[pages.length - 2];
				if (prevPage) {
					prevPage.$vm.currentCity = fullCityName;
				}

				uni.setStorageSync('selectedCity', fullCityName);
				uni.setStorageSync('selectedDistrictId', result.district_id);
				console.log('区县已保存到本地存储:', fullCityName);

				// 触发区域选择完成事件
				uni.$emit('areaSelected', {
					city: fullCityName,
					districtId: result.district_id,
					type: 'district'
				});
				console.log('🎯 触发区县选择完成事件');
			}

			uni.navigateBack();
		},

		// 获取搜索结果的骑手数量
		getResultRiderCount(result) {
			if (result.type === 'city') {
				return this.getCityRiderCount(result.cityData);
			} else if (result.type === 'district') {
				return this.getRiderCount(result.districtData);
			}
			return 0;
		},

		// 判断是否为当前选中的城市
		isCurrentCity(result) {
			if (result.type === 'city') {
				return this.currentCity === result.city;
			} else if (result.type === 'district') {
				return this.currentCity === `${result.city} · ${result.name}`;
			}
			return false;
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background-color: #f8f8f8;
	width: 100%;
	overflow-x: hidden;
}

.page-content {
	position: relative;
	z-index: 1;
	height: calc(100vh - var(--status-bar-height));
	display: flex;
	flex-direction: column;
	width: 100%;
	box-sizing: border-box;
}

.search-box {
	padding: 20rpx 30rpx;
	background-color: #ffffff;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	width: 100%;
	box-sizing: border-box;
}

.search-input-wrap {
	display: flex;
	align-items: center;
	background-color: #f5f5f5;
	border-radius: 36rpx;
	padding: 0 20rpx;
	height: 72rpx;
	transition: all 0.3s;
	width: 100%;
	box-sizing: border-box;

	&:focus-within {
		background-color: #f0f0f0;
		box-shadow: 0 0 0 2rpx rgba(36, 146, 242, 0.2);
	}
}

.search-icon {
	font-size: 32rpx;
	margin-right: 10rpx;
	color: #999999;
}

.search-input {
	flex: 1;
	height: 72rpx;
	font-size: 28rpx;
}

.placeholder-style {
	color: #999999;
}

.clear-icon {
	font-size: 28rpx;
	color: #999999;
	padding: 0 10rpx;
}

.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 300rpx;
}

.loading-spinner {
	width: 60rpx;
	height: 60rpx;
	border: 6rpx solid #f3f3f3;
	border-top: 6rpx solid #2492F2;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 20rpx;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.loading-text {
	font-size: 28rpx;
	color: #999999;
}

.city-list {
	flex: 1;
	padding: 20rpx 30rpx;
	padding-bottom: 120rpx;
	overflow-y: auto;
	width: 100%;
	box-sizing: border-box;
}

.section-title {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
	padding: 0 10rpx;
	width: 100%;
	box-sizing: border-box;
}

.title-text {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

.subtitle-text {
	font-size: 24rpx;
	color: #999999;
	margin-left: 10rpx;
}

.result-count {
	font-size: 24rpx;
	color: #999999;
}

.province-section {
	margin-bottom: 30rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s;
	width: 100%;
	box-sizing: border-box;

	&:active {
		transform: scale(0.99);
	}
}

.province-title {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 20rpx;
	padding-left: 20rpx;
	border-left: 8rpx solid #2492F2;
	width: 100%;
	box-sizing: border-box;
	cursor: pointer;

	.title-left {
		display: flex;
		align-items: center;
		flex: 1;
		gap: 8rpx;
	}

	.rider-count {
		font-size: 22rpx;
		color: #2492F2;
		font-weight: 500;
	}

	.toggle-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #2492F2;
		padding: 8rpx 12rpx;
		border-radius: 20rpx;
		background-color: rgba(36, 146, 242, 0.05);
		transition: all 0.3s ease;
		min-width: 40rpx;
		height: 40rpx;

		&.expanded {
			background-color: rgba(36, 146, 242, 0.1);
		}
	}
}

.city-section {
	margin-bottom: 20rpx;
	background-color: #fafafa;
	border-radius: 12rpx;
	padding: 16rpx;
	width: 100%;
	box-sizing: border-box;
	border-left: 4rpx solid #e0e0e0;
	margin-left: 10rpx;
}

.city-title {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 30rpx;
	font-weight: 500;
	color: #333333;
	margin-bottom: 16rpx;
	padding-left: 20rpx;
	width: 100%;
	box-sizing: border-box;
	position: relative;
	cursor: pointer;

	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 6rpx;
		height: 24rpx;
		background-color: #2492F2;
		border-radius: 3rpx;
	}

	.title-left {
		display: flex;
		align-items: center;
		flex: 1;
		gap: 8rpx;
	}

	.rider-count {
		font-size: 22rpx;
		color: #2492F2;
		font-weight: 500;
	}

	.toggle-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #2492F2;
		padding: 8rpx 12rpx;
		border-radius: 20rpx;
		background-color: rgba(36, 146, 242, 0.05);
		transition: all 0.3s ease;
		min-width: 40rpx;
		height: 40rpx;

		&.expanded {
			background-color: rgba(36, 146, 242, 0.1);
		}
	}
}

.district-list {
	display: flex;
	flex-wrap: wrap;
	padding: 0 20rpx;

	.district-item {
		width: 100%;
		height: 90rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20rpx;
		border-bottom: 1rpx solid #f5f5f5;
		position: relative;
		box-sizing: border-box;

		&:last-child {
			border-bottom: none;
		}

		&.active {
			background-color: rgba(36, 146, 242, 0.05);

			.district-name {
				color: #2492F2;
			}
		}

		.district-info {
			flex: 1;
			display: flex;
			align-items: center;
			gap: 8rpx;
			padding-right: 20rpx;

			.district-name {
				font-size: 28rpx;
				color: #333;
				line-height: 1.2;
			}

			.rider-count {
				font-size: 22rpx;
				color: #2492F2;
				font-weight: 500;
			}
		}

		.check-icon {
			color: #2492F2;
			font-size: 32rpx;
			width: 40rpx;
			height: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
}

.no-result {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
	width: 100%;
	box-sizing: border-box;
}

.no-result-image {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 30rpx;
}

.no-result-text {
	font-size: 28rpx;
	color: #999999;
}

.bottom-tip {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 20rpx;
	padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	text-align: center;
	background-color: #ffffff;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
	z-index: 10;

	.tip-content {
		padding: 10rpx 0;
	}

	.tip-text {
		font-size: 28rpx;
		color: #2492F2;
		font-weight: 500;
	}
}
</style>