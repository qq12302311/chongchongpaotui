<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<nav-bar title="选择城市" title-align="center"></nav-bar>

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
				@scrolltolower="loadMoreProvinces"
			>
				<!-- 全部按钮，始终显示在顶部，单独一个卡片 -->
				<view class="all-district-card">
					<view class="all-district-title">
						<text class="title-text">全部</text>
					</view>
					<view class="district-list">
						<view class="district-item" :class="{ active: currentCity === '全部' }" @click="handleAllSelect">
							<text class="district-name">全部区域</text>
							<text v-if="currentCity === '全部'" class="check-icon">✓</text>
						</view>
					</view>
				</view>

				<!-- 搜索结果 -->
				<view v-if="searchKeyword && filteredDistricts.length > 0" class="search-results">
					<view class="section-title">
						<text class="title-text">搜索结果</text>
						<text class="result-count">共{{filteredDistricts.length}}个结果</text>
					</view>
					<view class="district-list">
						<view
							v-for="(district, index) in filteredDistricts"
							:key="index"
							class="district-item"
							:class="{ active: currentCity === district.name }"
							@click="handleCitySelect(district.name, district)"
						>
							<view class="district-content">
							<text class="district-name">{{district.name}}</text>
							<text v-if="currentCity === district.name" class="check-icon">✓</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 无搜索结果 -->
				<view v-else-if="searchKeyword && filteredDistricts.length === 0" class="no-result">
					<image src="/static/images/no-result.png" mode="aspectFit" class="no-result-image"></image>
					<text class="no-result-text">未找到相关城市</text>
				</view>

				<!-- 城市列表 -->
				<view v-else>
					<view
						v-for="(province, provinceIndex) in displayedProvinces"
						:key="provinceIndex"
						class="province-section"
					>
						<!-- 省份标题 -->
						<view class="province-title" @click="toggleProvince(provinceIndex)">
							<view class="province-info">
								<text class="title-text">{{province.name}}</text>
								<text class="city-count">{{province.children.length}}个城市</text>
							</view>
							<view class="expand-icon" :class="{ expanded: expandedProvinces[provinceIndex] === true }">
								<text>▼</text>
							</view>
						</view>
						<!-- 城市列表 -->
						<view v-if="expandedProvinces[provinceIndex] === true" class="cities-container">
							<view
								v-for="(city, cityIndex) in province.children"
								:key="cityIndex"
								class="city-section"
							>
								<!-- 城市标题 -->
								<view class="city-title" @click="toggleCity(provinceIndex, cityIndex)">
									<view class="city-info">
										<text class="title-text">{{city.name}}</text>
										<text class="district-count">{{city.children ? city.children.length : 0}}个区县</text>
									</view>
									<view class="expand-icon" :class="{ expanded: expandedCities[provinceIndex + '-' + cityIndex] === true }">
										<text>▼</text>
									</view>
								</view>
								<!-- 区县列表 -->
								<view v-if="expandedCities[provinceIndex + '-' + cityIndex] === true" class="district-list">
									<view
										v-for="(district, districtIndex) in city.children"
										:key="districtIndex"
										class="district-item"
										:class="{ active: currentCity === district.name }"
										@click.stop="() => handleCitySelect(city.name, district)"
									>
										<text class="district-name">{{district.name}}</text>
										<text v-if="currentCity === district.name" class="check-icon">✓</text>
									</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 加载更多提示 -->
					<view v-if="hasMoreProvinces" class="load-more">
						<text class="load-more-text">上拉加载更多</text>
					</view>
				</view>
			</scroll-view>

			<!-- 底部提示 -->
			<view class="bottom-tip">
				<text class="tip-text">没有想选的城市？前往申请</text>
			</view>
		</view>
	</view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

export default {
	components: {
		NavBar
	},
	data() {
		return {
			navBarHeight: 0,
			cityList: [],
			displayedProvinces: [], // 当前显示的省份列表
			currentCity: '乐山',
			searchKeyword: '',
			filteredDistricts: [],
			loading: true, // 加载状态
			pageSize: 5, // 每页显示的省份数量
			currentPage: 0, // 当前页码
			hasMoreProvinces: true ,// 是否还有更多省份
			riderUserInfo: null,
			expandedProvinces: {}, // 记录哪些省份是展开的
			expandedCities: {}, // 记录哪些城市是展开的
		}
	},
	created() {
		// 获取导航栏高度
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
		const systemInfo = uni.getSystemInfoSync();
		this.navBarHeight = menuButtonInfo.bottom + 8;
	},
	onLoad() {
		// 获取当前选中的城市
		const pages = getCurrentPages();
		const prevPage = pages[pages.length - 2];
		if (prevPage) {
			this.currentCity = prevPage.$vm.currentCity;
		}

		// 获取城市列表
		this.getCityList();
	},
	methods: {
		// 获取城市列表
		async getCityList() {
			this.riderUserInfo = uni.getStorageSync('riderUserInfo')
			this.loading = true;
			try {
				const res = await this.$request('service/zone', {
					service_member_id: this.riderUserInfo.id
				}, 'POST');
				// console.log('城市列表数据:', res);
				if (res.code === 200 && res.data) {
					this.cityList = res.data;
					// 初始化显示第一页数据
					this.loadInitialProvinces();
				} else {
					uni.showToast({
						title: res.msg || '获取城市列表失败',
						icon: 'none'
					});
				}
			} catch (err) {
				// console.error('获取城市列表失败:', err);
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		},
		// 加载初始省份数据
		loadInitialProvinces() {
			this.displayedProvinces = this.cityList.slice(0, this.pageSize);
			this.currentPage = 1;
			this.hasMoreProvinces = this.cityList.length > this.pageSize;
			// 初始化展开状态，所有省份默认收起
			this.expandedProvinces = {};
			this.expandedCities = {};
		},
		// 加载更多省份
		loadMoreProvinces() {
			if (!this.hasMoreProvinces || this.searchKeyword) return;

			const start = this.currentPage * this.pageSize;
			const end = start + this.pageSize;
			const newProvinces = this.cityList.slice(start, end);

			if (newProvinces.length > 0) {
				this.displayedProvinces = [...this.displayedProvinces, ...newProvinces];
				this.currentPage++;
				this.hasMoreProvinces = end < this.cityList.length;
			} else {
				this.hasMoreProvinces = false;
			}
		},
		// 处理城市选择
		handleCitySelect(city, district) {
			// console.log(city, district)
			// 设置完整的城市名称（城市+区县），使用 · 作为分隔符
			const fullCityName = `${city} · ${district.name}`;
			const districtRes = district
			districtRes.fullCityName = fullCityName

			// 更新上一页的城市
			// const pages = getCurrentPages();
			// const prevPage = pages[pages.length - 2];
			// if (prevPage) {
			// 	prevPage.$vm.currentCity = fullCityName;
			// }

			// 保存到本地存储，添加rider前缀
			uni.setStorageSync('rider_selectedCity', districtRes);

			// 使用 redirectTo 跳转到接单大厅
			uni.redirectTo({
				url: '/riderEnd/index',
				success: () => {
					// uni.showToast({
					// 	title: '城市选择成功',
					// 	icon: 'success'
					// })
				},
				fail: (err) => {
					// console.error('跳转失败:', err)
					uni.showToast({
						title: '跳转失败',
						icon: 'none'
					})
				}
			})
		},
		// 过滤城市
		filterCities() {
			if (!this.searchKeyword) {
				this.filteredDistricts = [];
				return;
			}

			// 收集所有区县
			let allDistricts = [];
			this.cityList.forEach(province => {
				province.children.forEach(city => {
					if (city.children && city.children.length > 0) {
						allDistricts = allDistricts.concat(city.children);
					}
				});
			});

			// 过滤匹配的区县
			this.filteredDistricts = allDistricts.filter(district =>
				district.name.includes(this.searchKeyword)
			);
		},
		// 清除搜索
		clearSearch() {
			this.searchKeyword = '';
			this.filteredDistricts = [];
		},
		// 选择全部
		handleAllSelect() {
			const allObj = { name: '', fullCityName: '全部' };
			uni.setStorageSync('rider_selectedCity', allObj);
			// 跳转回大厅
			uni.redirectTo({ url: '/riderEnd/index' });
		},
		// 切换省份展开/收起状态
		toggleProvince(provinceIndex) {
			this.$set(this.expandedProvinces, provinceIndex, !this.expandedProvinces[provinceIndex]);
		},
		// 切换城市展开/收起状态
		toggleCity(provinceIndex, cityIndex) {
			const cityKey = provinceIndex + '-' + cityIndex;
			this.$set(this.expandedCities, cityKey, !this.expandedCities[cityKey]);
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

.result-count, .city-count, .district-count {
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
	padding: 10rpx 20rpx;
	border-left: 8rpx solid #2492F2;
	width: 100%;
	box-sizing: border-box;
	cursor: pointer;
	transition: all 0.3s ease;
	border-radius: 8rpx;

	&:hover {
		background-color: #f8f9fa;
	}

	&:active {
		background-color: #e9ecef;
		transform: scale(0.98);
	}
}

.province-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex: 1;
}

.expand-icon {
	margin-left: 20rpx;
	transition: transform 0.3s ease;
	color: #666;
	font-size: 24rpx;

	&.expanded {
		transform: rotate(180deg);
	}
}

.cities-container {
	margin-top: 10rpx;
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
	padding: 10rpx 20rpx;
	width: 100%;
	box-sizing: border-box;
	position: relative;
	cursor: pointer;
	transition: all 0.3s ease;
	border-radius: 8rpx;

	&:hover {
		background-color: #f8f9fa;
	}

	&:active {
		background-color: #e9ecef;
		transform: scale(0.98);
	}

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
}

.city-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex: 1;
}

.district-list {
	display: flex;
	flex-wrap: wrap;
	padding: 0 20rpx;
}

.district-item {
	width: 100%;
	height: 90rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 20rpx;
	border-bottom: 1rpx solid #f5f5f5;
	position: relative;

	&:last-child {
		border-bottom: none;
	}

	&.active {
		background-color: rgba(36, 146, 242, 0.05);

		.district-name {
			color: #2492F2;
		}
	}

	.district-name {
		font-size: 28rpx;
		color: #333;
		flex: 1;
	}

	.check-icon {
		color: #2492F2;
		font-size: 32rpx;
		margin-left: 20rpx;
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

.load-more {
	display: flex;
	justify-content: center;
	padding: 20rpx 0;
}

.load-more-text {
	font-size: 24rpx;
	color: #999999;
}

.bottom-tip {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 20rpx;
	padding-bottom: calc(20rpx + constant(safe-area-inset-bottom)); /* iOS < 11.2 */
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); /* iOS >= 11.2 */
	text-align: center;
	background-color: #ffffff;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

	.tip-text {
		font-size: 28rpx;
		color: #2492F2;
		font-weight: 500;
	}
}

.all-district-card {
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

.all-district-title {
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
}
</style>