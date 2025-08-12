<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<nav-bar :title="'搜索结果'" :back="true" title-align="center"></nav-bar>
		
		<!-- 内容区域 -->
		<view class="page-content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 搜索框 -->
			<view class="search-box">
				<view class="city-selector">
					<text>{{ currentCity }}</text>
					<text class="city-arrow iconfont icon-arrow-down"></text>
				</view>
				<view class="search-input-wrap">
					<text class="icon-search iconfont icon-search"></text>
					<input 
						class="search-input" 
						type="text" 
						v-model="searchKeyword" 
						placeholder="请输入地址" 
						@input="handleSearch"
					/>
					<text class="icon-close iconfont icon-close" v-if="searchKeyword" @click="clearSearch"></text>
				</view>
			</view>
			
			<!-- 地址列表 -->
			<scroll-view class="address-list" scroll-y>
				<view 
					class="address-item" 
					v-for="(item, index) in filteredAddressList" 
					:key="index"
					@click="handleSelectAddress(item)"
				>
					<view class="address-info">
						<view class="address-name">{{ item.name }}</view>
						<view class="address-detail">{{ item.address }}</view>
					</view>
					<view class="address-distance" v-if="item.distance">{{ item.distance }}km</view>
				</view>
				
				<!-- 无结果提示 -->
				<view class="no-result" v-if="filteredAddressList.length === 0">
					<text>未找到相关地址</text>
				</view>
			</scroll-view>
		</view>
		
		<!-- 城市选择弹窗 -->
		<view class="city-popup" v-if="showCityPopup">
			<view class="popup-mask" @click="hideCitySelector"></view>
			<view class="popup-content">
				<view class="popup-header">
					<view class="search-wrap">
						<text class="icon-search iconfont icon-search"></text>
						<input 
							class="search-input" 
							type="text" 
							v-model="citySearchKeyword"
							placeholder="搜索城市" 
							@input="filterCities"
						/>
						<text class="icon-close iconfont icon-close" v-if="citySearchKeyword" @click="clearCitySearch"></text>
					</view>
				</view>
				<scroll-view class="city-list" scroll-y>
					<view class="province-section" v-for="(cities, province) in filteredProvinces" :key="province">
						<view class="province-title">{{ province }}</view>
						<view class="city-grid">
							<view 
								class="city-item" 
								:class="{ active: currentCity === city }"
								v-for="(city, index) in cities" 
								:key="index" 
								@click="selectCity(city)"
							>
								{{ city }}
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import { provinceCityMap, cityCoordinates, updateMapByCity } from '@/utils/cityData.js'

export default {
	components: {
		NavBar
	},
	data() {
		return {
			navBarHeight: 0,
			searchKeyword: '', // 搜索关键词
			addressList: [], // 地址列表
			addressType: 'start', // 地址类型：start-起点，end-终点
			currentLocation: { // 当前位置
				latitude: 0,
				longitude: 0
			},
			currentCity: '成都市',
			showCityPopup: false,
			citySearchKeyword: '', // 城市搜索关键词
			filteredProvinces: provinceCityMap
		}
	},
	computed: {
		// 过滤掉"当前位置"的地址列表
		filteredAddressList() {
			return this.addressList.filter(item => item.name !== '当前位置');
		}
	},
	onLoad(options) {
		// 获取导航栏高度
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
		this.navBarHeight = menuButtonInfo.bottom + 8;
		
		// 获取地址类型
		this.addressType = options.type || 'home';
		
		this.currentLocation.latitude = options.latitude
		this.currentLocation.longitude = options.longitude
		
		// 从本地存储获取搜索关键词
		const searchKeyword = uni.getStorageSync('searchKeyword');
		if (searchKeyword) {
			this.searchKeyword = searchKeyword;
		}
		
		// 从本地存储获取地址列表
		const addressList = uni.getStorageSync('addressList');
		if (addressList) {
			this.addressList = JSON.parse(addressList);
		}
		
		// 获取当前位置
		// this.getLocation();
		
		// 从本地存储获取地址列表和当前城市
		const storedAddressList = uni.getStorageSync('addressList');
		if (storedAddressList) {
			this.addressList = JSON.parse(storedAddressList);
		}
		
		const storedCity = uni.getStorageSync('currentCity');
		if (storedCity) {
			this.currentCity = storedCity;
		}
	},
	methods: {
		// 获取当前位置
		// getLocation() {
		// 	// 周扬改
		// 	const currentLocation = uni.getStorageSync('providerInfo');
		// 	this.currentLocation.latitude = currentLocation.info.latitude;
		// 	this.currentLocation.longitude = currentLocation.info.longitude;
		// },
		// 处理搜索
		handleSearch() {
			if (!this.searchKeyword) {
				return
			}
			
			// 显示加载提示
			uni.showLoading({
				title: '搜索中...',
				mask: true
			})
			
			// 清空地址列表，避免重复添加
			this.addressList = []
			
			// 添加当前位置到列表
			this.addressList = [{
				name: '当前位置',
				address: '当前位置',
				latitude: this.currentLocation.latitude,
				longitude: this.currentLocation.longitude,
				distance: '0.0'
			}]
			
			// 处理当前城市，提取城市名和区县名
			let cityName = this.currentCity;
			let districtName = '';
			
			// 检查是否包含区县信息（如"海口市 · 龙华区"）
			if (this.currentCity.includes(' · ')) {
				const parts = this.currentCity.split(' · ');
				cityName = parts[0];
				districtName = parts[1];
				console.log('搜索范围 - 城市名:', cityName);
				console.log('搜索范围 - 区县名:', districtName);
			}
			
			// 处理城市名称，去除后缀
			cityName = cityName.replace('市', '').replace('特别行政区', '').replace('自治州', '').replace('地区', '').replace('盟', '');
			if (districtName) {
				districtName = districtName.replace('区', '').replace('县', '').replace('市', '');
			}
			
			console.log('处理后的城市名:', cityName);
			console.log('处理后的区县名:', districtName);
			
			// 首先获取行政区域编码
			// uni.request({
			// 	url: 'https://restapi.amap.com/v3/config/district',
			// 	data: {
			// 		key: 'c34dee46481f77816b9980f7efd95a24',
			// 		keywords: districtName || cityName,
			// 		subdistrict: 0,
			// 		extensions: 'all'
			// 	},
			// 	success: (districtRes) => {
			// 		if (districtRes.data.status === '1' && districtRes.data.districts && districtRes.data.districts.length > 0) {
			// 			const district = districtRes.data.districts[0];
			// 			const adcode = district.adcode;
			// 			console.log('获取到的行政区域编码:', adcode);
						
						// 使用城市名称进行POI搜索
						const searchParams = {
							key: 'c34dee46481f77816b9980f7efd95a24',
							keywords: this.searchKeyword,
							offset: 20,
							page: 1,
							extensions: 'all',
							output: 'json',
							citylimit: true,
							city: cityName // 使用城市名称而不是编码
						};
						
						console.log('搜索参数:', searchParams);
						
						uni.request({
							url: `https://restapi.amap.com/v3/place/text`,
							data: searchParams,
							success: (res) => {
								// 隐藏加载提示
								uni.hideLoading()
								
								if ((res.data.status === '1' || res.data.status === 'OK') && res.data.pois && res.data.pois.length > 0) {
								console.log('地址搜索返回数据:', res.data)
									let searchResults = res.data.pois
										.map(item => {
											// console.log('123',item)
											// 计算与当前位置的距离
											let distance = ''
											if (this.currentLocation.latitude && this.currentLocation.longitude) {
												const lat1 = this.currentLocation.latitude
												const lon1 = this.currentLocation.longitude
												const lat2 = parseFloat(item.location.split(',')[1])
												const lon2 = parseFloat(item.location.split(',')[0])
												
												const R = 6371000
												const dLat = this.deg2rad(lat2 - lat1)
												const dLon = this.deg2rad(lon2 - lon1)
												const a = 
													Math.sin(dLat/2) * Math.sin(dLat/2) +
													Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
													Math.sin(dLon/2) * Math.sin(dLon/2)
												const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
												const distanceInMeters = R * c
												
												distance = (distanceInMeters / 1000).toFixed(1)
											}
											
											return {
												name: item.name,
												address: (item.address && (typeof item.address === 'string' ? item.address.trim() !== '' : Array.isArray(item.address) && item.address.length > 0)) ? item.address : item.name,
												latitude: parseFloat(item.location.split(',')[1]),
												longitude: parseFloat(item.location.split(',')[0]),
												distance: distance,
												adcode: item.adcode
											}
										});
									// 合并搜索结果到地址列表
									this.addressList = [...this.addressList, ...searchResults]
									
									// 如果没有结果，显示提示
									if (this.addressList.length <= 1) {
										uni.showToast({
											title: '当前区域未找到相关地址',
											icon: 'none'
										})
									}
								} else {
									console.log('地址搜索无结果或状态异常:', res.data)
									uni.showToast({
										title: '未找到相关地址',
										icon: 'none'
									})
								}
							},
							fail: (err) => {
								uni.hideLoading()
								console.error('地址搜索请求失败:', err)
								uni.showToast({
									title: '搜索请求失败',
									icon: 'none'
								})
							}
						})
				// 	} else {
				// 		uni.hideLoading()
				// 		console.error('获取行政区域编码失败:', districtRes.data)
				// 		console.log('尝试直接使用城市名称进行搜索')
						
				// 		// 直接使用城市名称进行POI搜索
				// 		const searchParams = {
				// 			key: 'c34dee46481f77816b9980f7efd95a24',
				// 			keywords: this.searchKeyword,
				// 			offset: 20,
				// 			page: 1,
				// 			extensions: 'all',
				// 			output: 'json',
				// 			citylimit: true,
				// 			city: cityName // 使用城市名称
				// 		};
						
				// 		console.log('搜索参数:', searchParams);
						
				// 		uni.request({
				// 			url: `https://restapi.amap.com/v3/place/text`,
				// 			data: searchParams,
				// 			success: (res) => {
				// 				// 隐藏加载提示
				// 				uni.hideLoading()
								
				// 				console.log('地址搜索返回数据:', res.data)
				// 				if ((res.data.status === '1' || res.data.status === 'OK') && res.data.pois && res.data.pois.length > 0) {
				// 					let searchResults = res.data.pois.map(item => {
				// 						// 计算与当前位置的距离
				// 						let distance = ''
				// 						if (this.currentLocation.latitude && this.currentLocation.longitude) {
				// 							const lat1 = this.currentLocation.latitude
				// 							const lon1 = this.currentLocation.longitude
				// 							const lat2 = parseFloat(item.location.split(',')[1])
				// 							const lon2 = parseFloat(item.location.split(',')[0])
											
				// 							const R = 6371000
				// 							const dLat = this.deg2rad(lat2 - lat1)
				// 							const dLon = this.deg2rad(lon2 - lon1)
				// 							const a = 
				// 								Math.sin(dLat/2) * Math.sin(dLat/2) +
				// 								Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
				// 								Math.sin(dLon/2) * Math.sin(dLon/2)
				// 							const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
				// 							const distanceInMeters = R * c
											
				// 							distance = (distanceInMeters / 1000).toFixed(1)
				// 						}
										
				// 						return {
				// 							name: item.name,
				// 							address: item.address || item.pname + item.cityname + item.adname,
				// 							latitude: parseFloat(item.location.split(',')[1]),
				// 							longitude: parseFloat(item.location.split(',')[0]),
				// 							distance: distance,
				// 							adcode: item.adcode
				// 						}
				// 					});
									
				// 					// 合并搜索结果到地址列表
				// 					this.addressList = [...this.addressList, ...searchResults]
									
				// 					// 如果没有结果，显示提示
				// 					if (this.addressList.length <= 1) {
				// 						uni.showToast({
				// 							title: '当前区域未找到相关地址',
				// 							icon: 'none'
				// 						})
				// 					}
				// 				} else {
				// 					console.log('地址搜索无结果或状态异常:', res.data)
				// 					uni.showToast({
				// 						title: '未找到相关地址',
				// 						icon: 'none'
				// 					})
				// 				}
				// 			},
				// 			fail: (err) => {
				// 				uni.hideLoading()
				// 				console.error('地址搜索请求失败:', err)
				// 				uni.showToast({
				// 					title: '搜索请求失败',
				// 					icon: 'none'
				// 				})
				// 			}
				// 		})
				// 	}
				// },
				// fail: (err) => {
				// 	uni.hideLoading()
				// 	console.error('获取行政区域编码请求失败:', err)
				// 	uni.showToast({
				// 		title: '获取区域信息失败',
				// 		icon: 'none'
				// 	})
				// }
			// })
		},
		// 清除搜索
		clearSearch() {
			this.searchKeyword = ''
			this.addressList = []
		},
		// 处理选择地址
		handleSelectAddress(item) {
			// 获取地址的详细信息
			uni.request({
				url: 'https://restapi.amap.com/v3/geocode/regeo',
				data: {
					key: 'c34dee46481f77816b9980f7efd95a24',
					location: `${item.longitude},${item.latitude}`,
					extensions: 'all',
					output: 'json'
				},
				success: (res) => {
					console.log('逆地理编码返回数据:', res.data);
					if ((res.data.status === '1' || res.data.status === 'OK') && res.data.regeocode) {
						const addressComponent = res.data.regeocode.addressComponent;
						console.log('地址组件:', addressComponent);
						
						// 详细输出地址组件的各个属性
						console.log('省份:', addressComponent.province);
						console.log('城市:', addressComponent.city);
						console.log('区县:', addressComponent.district);
						
						// 保存选择的地址到本地存储
						// uni.setStorageSync('selectedAddress', item.address);
						
						// 获取所有页面
						const pages = getCurrentPages();
						// 获取发布订单页实例 (倒数第三个页面)
						const publishPage = pages[pages.length - 3];
						
						if (publishPage) {
							if (this.addressType === 'start') {
								publishPage.$vm.formData.address = item.address;
								publishPage.$vm.formData.latitude = item.latitude;
								publishPage.$vm.formData.longitude = item.longitude;
								publishPage.$vm.formData.distance = item.distance; // 距离km
								publishPage.$vm.formData.province = addressComponent.province;
								// 针对重庆市这种特殊区域
								if(Array.isArray(addressComponent.city)&&addressComponent.city.length==0) {
									publishPage.$vm.formData.city = addressComponent.province;
								} else {
									publishPage.$vm.formData.city = addressComponent.city;
								}
								if(Array.isArray(addressComponent.district)&&addressComponent.district.length==0) {
									publishPage.$vm.formData.district = addressComponent.township;
								} else {
									publishPage.$vm.formData.district = addressComponent.district;
								}
							} else if (this.addressType === 'end') {
								publishPage.$vm.endAddress = item.address;
								publishPage.$vm.endLocation = {
									latitude: item.latitude,
									longitude: item.longitude
								};
							} else if (this.addressType === 'address') {
								// 确保省市区信息存在
								const province = addressComponent.province || '';
								const city = addressComponent.city || '';
								const district = addressComponent.district || '';
								
								console.log('省市区信息:', { province, city, district });
								
								// 更新 formData
								const updatedFormData = {
									...publishPage.$vm.formData,
									address: item.address,
									latitude: item.latitude,
									longitude: item.longitude,
									province: province,
									city: city,
									district: district
								};
								
								// 打印更新后的 formData
								console.log('更新后的 formData:', updatedFormData);
								
								// 输出到 AppData
								const appData = {
									formData: updatedFormData,
									addressComponent: addressComponent,
									selectedAddress: item.address,
									location: {
										latitude: item.latitude,
										longitude: item.longitude
									}
								};
								console.log('AppData:', appData);
								
								// 使用 uni.setStorageSync 存储到本地，方便在开发者工具中查看
								uni.setStorageSync('debug_formData', appData);
								
								// 更新父组件的 formData
								publishPage.$vm.formData = updatedFormData;
								
								// 触发父组件的更新
								publishPage.$vm.$forceUpdate();
							}
							
							// 直接返回发布订单页
							uni.navigateBack({
								delta: 2
							});
						}
					} else {
						console.log('逆地理编码无结果或状态异常:', res.data);
						uni.showToast({
							title: '获取地址信息失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					console.error('逆地理编码请求失败:', err);
					uni.showToast({
						title: '获取地址信息失败',
						icon: 'none'
					});
				}
			});
		},
		// 显示城市选择弹窗
		showCitySelector() {
			this.showCityPopup = true
			this.filteredProvinces = provinceCityMap
		},
		// 隐藏城市选择弹窗
		hideCitySelector() {
			this.showCityPopup = false
			this.citySearchKeyword = ''
		},
		// 过滤城市列表
		filterCities() {
			if (!this.citySearchKeyword) {
				this.filteredProvinces = provinceCityMap
				return
			}
			
			const keyword = this.citySearchKeyword.toLowerCase()
			const filtered = {}
			
			Object.entries(provinceCityMap).forEach(([province, cities]) => {
				const matchedCities = cities.filter(city => 
					city.toLowerCase().includes(keyword)
				)
				if (matchedCities.length > 0) {
					filtered[province] = matchedCities
				}
			})
			
			this.filteredProvinces = filtered
		},
		// 处理选择城市
		selectCity(city) {
			this.currentCity = city
			uni.setStorageSync('currentCity', city)
			
			// 获取上一页实例
			const pages = getCurrentPages()
			const prevPage = pages[pages.length - 2]
			
			// 更新上一页的城市信息
			if (prevPage) {
				prevPage.$vm.currentCity = city
				// 如果上一页有地图，更新地图中心点
				if (prevPage.$vm.mapCtx && cityCoordinates[city]) {
					const { latitude, longitude } = cityCoordinates[city]
					prevPage.$vm.mapCtx.moveToLocation({
						latitude,
						longitude,
						success: () => {
							console.log('地图已更新到新城市位置')
						}
					})
				}
			}
			
			this.hideCitySelector()
			this.handleSearch()
		},
		// 清除城市搜索关键词
		clearCitySearch() {
			this.citySearchKeyword = ''
			this.filterCities()
		},
		// 角度转弧度
		deg2rad(deg) {
			return deg * (Math.PI/180)
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	position: relative;
	width: 100%;
	height: 100vh;
	background-color: #f5f5f5;
}

.page-content {
	width: 100%;
	height: calc(100% - var(--status-bar-height));
	display: flex;
	flex-direction: column;
}

.search-box {
	padding: 20rpx;
	background-color: #ffffff;
	z-index: 10;
	display: flex;
	align-items: center;
	
	.city-selector {
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		height: 72rpx;
		font-size: 28rpx;
		color: #333333;
		position: relative;
		
		.city-arrow {
			font-size: 20rpx;
			margin-left: 10rpx;
			color: #999999;
		}
	}
	
	.search-input-wrap {
		flex: 1;
		height: 72rpx;
		background-color: #f5f5f5;
		border-radius: 36rpx;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		
		.icon-search {
			font-size: 28rpx;
			color: #999999;
			margin-right: 10rpx;
		}
		
		.search-input {
			flex: 1;
			height: 100%;
			font-size: 28rpx;
		}
		
		.icon-close {
			font-size: 28rpx;
			color: #999999;
			padding: 0 10rpx;
		}
	}
}

.address-list {
	flex: 1;
	width: 100%;
	background-color: #fff;
	
	.address-item {
		padding: 15px;
		border-bottom: 1px solid #f5f5f5;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.address-info {
			flex: 1;
			
			.address-name {
				font-size: 16px;
				color: #333;
				margin-bottom: 5px;
			}
			
			.address-detail {
				font-size: 14px;
				color: #999;
			}
		}
		
		.address-distance {
			font-size: 14px;
			color: #999;
		}
	}
}

.no-result {
	padding: 30px 0;
	text-align: center;
	color: #999;
	font-size: 14px;
}

.city-popup {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 100;
	background-color: rgba(0, 0, 0, 0.5);
}

.popup-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
}

.popup-content {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #ffffff;
	border-radius: 20rpx 20rpx 0 0;
	overflow: hidden;
	animation: slideUp 0.3s ease-out;
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}

.popup-header {
	padding: 20rpx;
	border-bottom: 1rpx solid #f5f5f5;
	
	.search-wrap {
		position: relative;
		height: 72rpx;
		background-color: #f5f5f5;
		border-radius: 36rpx;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		
		.icon-search {
			font-size: 28rpx;
			color: #999999;
			margin-right: 10rpx;
		}
		
		.search-input {
			flex: 1;
			height: 100%;
			font-size: 28rpx;
		}
		
		.icon-close {
			font-size: 28rpx;
			color: #999999;
			padding: 0 10rpx;
		}
	}
}

.city-list {
	height: 60vh;
	overflow-y: auto;
	padding: 20rpx;
	
	.province-section {
		margin-bottom: 30rpx;
		
		&:last-child {
			margin-bottom: 0;
		}
		
		.province-title {
			padding: 20rpx 0;
			font-size: 32rpx;
			color: #333333;
			font-weight: bold;
		}
		
		.city-grid {
			display: flex;
			flex-wrap: wrap;
			margin: 0 -10rpx;
			
			.city-item {
				width: calc(25% - 20rpx);
				height: 80rpx;
				margin: 10rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 28rpx;
				color: #333333;
				background-color: #f5f5f5;
				border-radius: 8rpx;
				box-sizing: border-box;
				
				&.active {
					color: #ffffff;
					background-color: #2492F2;
					font-weight: bold;
				}
			}
		}
	}
}
</style> 