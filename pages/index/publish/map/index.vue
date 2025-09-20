<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<nav-bar title="选择地址" title-align="center"></nav-bar>

		<!-- 内容区域 -->
		<view class="page-content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 搜索框 -->
			<view class="search-box">
				<view class="city-selector" @click="showCitySelector">
					<text>{{currentCity}}</text>
					<text class="city-arrow">▼</text>
				</view>
				<input type="text" v-model="searchKeyword" placeholder="搜索地址" class="search-input"
					@confirm="handleSearch" />
			</view>

			<!-- 地图区域 -->
			<view class="map-container">
				<map id="map" class="map" :latitude="latitude" :longitude="longitude" :markers="markers" :scale="scale"
					@regionchange="handleRegionChange"></map>
				<view class="center-marker"></view>
			</view>

			<!-- 距离显示 -->
			<!-- <view class="distance-display" v-if="dragDistance > 0">
				<text>当前位置与目标位置距离: {{dragDistance}}km</text>
			</view> -->

			<!-- 选择位置按钮 -->
			<view class="select-button" @click="handleSelectCurrentLocation">
				<text>选择当前位置</text>
			</view>
		</view>

		<!-- 认证提示弹窗 -->
		<auth-modal :show="showAuthModal" title="提示" content="抱歉!当前城市尚未入驻骑手!去申请成为跑腿服务商/骑手，接单赚钱!" cancel-text="取消"
			confirm-text="去认证" @cancel="handleAuthCancel" @confirm="handleAuthConfirm" />

		<!-- 城市选择弹窗 -->
		<view class="city-popup" v-if="showCityPopup">
			<view class="city-popup-mask" @click="hideCitySelector"></view>
			<view class="city-popup-content">
				<view class="city-popup-header">
					<text>选择城市</text>
					<text class="close-btn" @click="hideCitySelector">×</text>
				</view>
				<view class="city-search">
					<view class="search-input-wrap">
						<text class="search-icon">🔍</text>
						<input type="text" v-model="citySearchKeyword" placeholder="搜索城市"
							placeholder-class="placeholder-style" class="city-search-input" @input="filterCities" />
						<text v-if="citySearchKeyword" class="clear-icon" @click="clearCitySearch">✕</text>
					</view>
				</view>
				<view class="city-popup-body">
					<!-- 搜索结果 -->
					<view v-if="citySearchKeyword && filteredDistricts.length > 0" class="search-results">
						<view class="section-title">
							<text class="title-text">搜索结果</text>
							<text class="result-count">共{{filteredDistricts.length}}个结果</text>
						</view>
						<view class="district-list">
							<view v-for="(district, index) in filteredDistricts" :key="index" class="district-item"
								:class="{ active: currentCity === district }" @click="selectCity(district)">
								<text class="district-name">{{district}}</text>
								<text v-if="currentCity === district" class="check-icon">✓</text>
							</view>
						</view>
					</view>

					<!-- 无搜索结果 -->
					<view v-else-if="citySearchKeyword && filteredDistricts.length === 0" class="no-result">
						<image src="/static/images/no-result.png" mode="aspectFit" class="no-result-image"></image>
						<text class="no-result-text">未找到相关城市</text>
					</view>

					<!-- 城市列表 -->
					<view v-else>
						<view v-for="(province, provinceIndex) in filteredProvinces" :key="provinceIndex"
							class="province-section">
							<!-- 省份标题 -->
							<view class="province-title" @click="toggleProvince(provinceIndex)">
								<text class="title-text">{{province.name}}</text>
								<text class="city-count">{{province.cities.length}}个城市</text>
								<text class="arrow-icon">{{province.isExpanded ? '▼' : '▶'}}</text>
							</view>
							<!-- 城市列表 -->
							<view v-if="province.isExpanded">
								<view v-for="(city, cityIndex) in province.cities" :key="cityIndex"
									class="city-section">
									<!-- 城市标题 -->
									<view class="city-title" @click="toggleCity(provinceIndex, cityIndex)">
										<text class="title-text">{{city.name}}</text>
										<text class="district-count">{{city.districts.length}}个区县</text>
										<text class="arrow-icon">{{city.isExpanded ? '▼' : '▶'}}</text>
									</view>
									<!-- 区县列表 -->
									<view v-if="city.isExpanded" class="district-list">
										<view v-for="(district, districtIndex) in city.districts" :key="districtIndex"
											class="district-item" :class="{ active: currentCity === (city.name + ' · ' + district) }"
											@click="selectCity(city.name + ' · ' + district)">
											<text class="district-name">{{district}}</text>
											<text v-if="currentCity === (city.name + ' · ' + district)" class="check-icon">✓</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
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
	import {
		cityList,
		updateMapByCity
	} from '@/utils/cityData.js'
	import {
		getAddressByLocation,
		loadAreaData
	} from '@/utils/areaData.js'
	import AuthModal from '@/components/AuthModal/index.vue'
	// 腾讯地图api
	var QQMapWX = require('@/utils/qqmap-wx-jssdk.js');
	var qqmapsdk;
	// 百度地图api
	var bmap = require('@/utils/bmap-wx.js'); 
	var wxMarkerData = []; 
	var BMap;

	export default {
		components: {
			NavBar,
			AuthModal,
			FloatingChatIconUser
		},
		data() {
			return {
				bdmarkers: [], 
				bdlatitude: '' , 
				bdlongitude: '' , 
				bdrgcData: {}, 
				showAuthModal: false,
				navBarHeight: 0,
				latitude: 39.908823,
				longitude: 116.397470,
				scale: 16,
				markers: [],
				searchKeyword: '',
				addressList: [],
				addressType: 'start',
				currentLocation: {
					latitude: 30.0488,
					longitude: 103.8485
				},
				dragDistance: 0,
				currentCity: '请选择城市',
				showCityPopup: false,
				citySearchKeyword: '',
				filteredProvinces: [],
				areaData: null,
				filteredDistricts: [],
				expandedProvinces: [],
				cityListData: [], // 新增，用于存储本地cityList
			}
		},
		onLoad(options) {
			// 实例化腾讯地图API核心类
			qqmapsdk = new QQMapWX({
				key: 'NQABZ-2CTWJ-IAJFD-DERJV-Y55LQ-IVB4J'
			});
			// 获取导航栏高度
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
			const systemInfo = uni.getSystemInfoSync();
			this.navBarHeight = menuButtonInfo.bottom + 8;

			// 获取地址类型
			if (options.type) {
				this.addressType = options.type;
			}

			// 验证初始经纬度是否有效，如果无效则使用默认值
			if (isNaN(this.latitude) || isNaN(this.longitude) || Math.abs(this.latitude) > 90 || Math.abs(this.longitude) > 180) {
				console.warn('初始经纬度无效，使用默认值');
				this.latitude = 20.031397;
				this.longitude = 110.330374;
			}

			// 加载区域数据
			this.loadAreaData();

			// 获取首页选择的城市
			this.getSelectedCity();

			// 不再获取当前位置
			// this.getCurrentLocation();

			// 加载本地cityList
			const cityList = uni.getStorageSync('cityList');
			this.cityListData = typeof cityList === 'string' ? JSON.parse(cityList) : cityList;
		},
		methods: {
			handleAuthCancel() {
				this.showAuthModal = false;
			},
			handleAuthConfirm() {
				this.showAuthModal = false;
			},
			// 加载区域数据
			loadAreaData() {
				try {
					this.areaData = loadAreaData();
					if (this.areaData) {
						console.log('区域数据加载成功');
					} else {
						console.error('区域数据加载失败');
					}
				} catch (error) {
					console.error('加载区域数据失败:', error);
				}
			},
			// 获取首页选择的城市
			getSelectedCity() {
				// 从本地存储获取首页选择的城市
				const selectedCity = uni.getStorageSync('selectedCity');
				if (selectedCity) {
					this.currentCity = selectedCity;
					console.log('从首页获取的城市:', this.currentCity);

					// 根据城市名称获取经纬度
					this.getCityLocation(selectedCity);
				} else {
					// 如果没有选择的城市，使用默认城市
					this.currentCity = '成都市';
					// 根据默认城市更新地图中心点
					this.updateMapByCity('成都市');
				}
			},
			// 获取当前位置
			// getCurrentLocation() {
			// 	// 先检查本地存储中是否有选择的城市
			// 	const selectedCity = uni.getStorageSync('currentCity');
			// 	if (selectedCity) {
			// 		console.log('使用首页选择的城市:', selectedCity);
			// 		// 直接使用完整的城市名称（包括区县信息）
			// 		this.currentCity = selectedCity;
			// 		// 根据选择的城市更新地图中心点
			// 		this.updateMapByCity(this.currentCity);
			// 		return;
			// 	}

			// 	// 如果没有选择的城市，再检查位置权限
			// 	uni.getSetting({
			// 		success: (res) => {
			// 			if (!res.authSetting['scope.userLocation']) {
			// 				// 如果没有权限，请求权限
			// 				uni.authorize({
			// 					scope: 'scope.userLocation',
			// 					success: () => {
			// 						// 权限获取成功，继续获取位置
			// 						this.getLocation();
			// 					},
			// 					fail: (err) => {
			// 						console.error('位置权限请求失败:', err);
			// 						uni.showModal({
			// 							title: '提示',
			// 							content: '需要您授权位置权限才能选择地址',
			// 							success: (res) => {
			// 								if (res.confirm) {
			// 									uni.openSetting();
			// 								}
			// 							}
			// 						});
			// 					}
			// 				});
			// 			} else {
			// 				// 已有权限，直接获取位置
			// 				this.getLocation();
			// 			}
			// 		},
			// 		fail: (err) => {
			// 			console.error('获取设置失败:', err);
			// 			uni.showToast({
			// 				title: '获取设置失败',
			// 				icon: 'none'
			// 			});
			// 		}
			// 	});
			// },
			// 获取位置信息
			// getLocation() {
			// 	console.log('开始获取位置信息...');
			// 	uni.getLocation({
			// 		type: 'gcj02', // 高德地图使用GCJ-02坐标系
			// 		success: (res) => {
			// 			console.log('获取位置成功:', res);
			// 			this.latitude = res.latitude;
			// 			this.longitude = res.longitude;
			// 			// 保存当前位置
			// 			this.currentLocation.latitude = res.latitude;
			// 			this.currentLocation.longitude = res.longitude;
			// 			this.updateMarkers();

			// 			// 获取当前位置的详细地址信息
			// 			this.getAddressInfo(res.longitude, res.latitude);

			// 			// 只有在没有选择城市的情况下，才根据当前位置获取城市信息
			// 			const selectedCity = uni.getStorageSync('currentCity');
			// 			if (!selectedCity) {
			// 				// 根据当前位置获取城市信息
			// 				this.getCurrentCity(res.longitude, res.latitude);
			// 			}
			// 		},
			// 		fail: (err) => {
			// 			console.error('获取位置失败:', err);
			// 			uni.showToast({
			// 				title: '获取位置失败',
			// 				icon: 'none'
			// 			});
			// 		}
			// 	});
			// },
			// 获取地址信息
			getAddressInfo(longitude, latitude, isDragLocation = false) {
				// 验证输入的经纬度是否有效
				if (!this.isValidLatLng(latitude, longitude)) {
					console.warn('getAddressInfo接收到无效的经纬度:', latitude, longitude);
					return;
				}

				uni.request({
					url: 'https://restapi.amap.com/v3/geocode/regeo',
					data: {
						key: 'c34dee46481f77816b9980f7efd95a24',
						location: `${longitude},${latitude}`,
						extensions: 'all',
						output: 'json'
					},
					success: (res) => {
						console.log('逆地理编码返回数据:', res.data);
						// 检查返回状态，高德地图API可能返回"OK"或"1"表示成功
						if ((res.data.status === '1' || res.data.status === 'OK') && res.data.regeocode) {
							const addressComponent = res.data.regeocode.addressComponent;
							const formattedAddress = res.data.regeocode.formatted_address;

							if (isDragLocation) {
								// 如果是拖拽位置，计算与当前位置的距离
								const lat1 = this.currentLocation.latitude;
								const lon1 = this.currentLocation.longitude;
								const lat2 = latitude;
								const lon2 = longitude;

								// 使用Haversine公式计算两点之间的距离（单位：米）
								const R = 6371000; // 地球半径（米）
								const dLat = this.deg2rad(lat2 - lat1);
								const dLon = this.deg2rad(lon2 - lon1);
								const a =
									Math.sin(dLat / 2) * Math.sin(dLat / 2) +
									Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
									Math.sin(dLon / 2) * Math.sin(dLon / 2);
								const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
								const distanceInMeters = R * c;

								// 转换为千米并保留一位小数
								const distance = (distanceInMeters / 1000).toFixed(1);

								// 查找是否已存在拖拽位置
								const dragLocationIndex = this.addressList.findIndex(item => item.name ===
									'拖拽位置');

								// 创建新的拖拽位置对象
								const dragLocation = {
									name: '拖拽位置',
									address: formattedAddress,
									latitude: latitude,
									longitude: longitude,
									distance: distance,
									addressComponent: addressComponent
								};

								if (dragLocationIndex !== -1) {
									// 如果已存在拖拽位置，替换它
									this.addressList[dragLocationIndex] = dragLocation;
								} else {
									// 如果不存在拖拽位置，添加到列表
									this.addressList.push(dragLocation);
								}
							} else {
								// 如果是当前位置，添加到地址列表的最前面
								this.addressList.unshift({
									name: '当前位置',
									address: formattedAddress,
									latitude: latitude,
									longitude: longitude,
									distance: '0.0'
								});
							}
						} else {
							console.log('逆地理编码无结果或状态异常:', res.data);
							// 即使逆地理编码失败，也添加位置
							if (isDragLocation) {
								// 计算与当前位置的距离
								const lat1 = this.currentLocation.latitude;
								const lon1 = this.currentLocation.longitude;
								const lat2 = latitude;
								const lon2 = longitude;

								// 使用Haversine公式计算两点之间的距离（单位：米）
								const R = 6371000; // 地球半径（米）
								const dLat = this.deg2rad(lat2 - lat1);
								const dLon = this.deg2rad(lon2 - lon1);
								const a =
									Math.sin(dLat / 2) * Math.sin(dLat / 2) +
									Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
									Math.sin(dLon / 2) * Math.sin(dLon / 2);
								const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
								const distanceInMeters = R * c;

								// 转换为千米并保留一位小数
								const distance = (distanceInMeters / 1000).toFixed(1);

								// 查找是否已存在拖拽位置
								const dragLocationIndex = this.addressList.findIndex(item => item.name ===
									'拖拽位置');

								// 创建新的拖拽位置对象
								const dragLocation = {
									name: '拖拽位置',
									address: `${longitude},${latitude}`,
									latitude: latitude,
									longitude: longitude,
									distance: distance
								};

								if (dragLocationIndex !== -1) {
									// 如果已存在拖拽位置，替换它
									this.addressList[dragLocationIndex] = dragLocation;
								} else {
									// 如果不存在拖拽位置，添加到列表
									this.addressList.push(dragLocation);
								}
							} else {
								// 将当前位置添加到地址列表的最前面
								this.addressList.unshift({
									name: '当前位置',
									address: `${longitude},${latitude}`,
									latitude: latitude,
									longitude: longitude,
									distance: '0.0'
								});
							}
						}
					},
					fail: (err) => {
						console.error('逆地理编码请求失败:', err);
						// 请求失败时也添加位置
						if (isDragLocation) {
							// 计算与当前位置的距离
							const lat1 = this.currentLocation.latitude;
							const lon1 = this.currentLocation.longitude;
							const lat2 = latitude;
							const lon2 = longitude;

							// 使用Haversine公式计算两点之间的距离（单位：米）
							const R = 6371000; // 地球半径（米）
							const dLat = this.deg2rad(lat2 - lat1);
							const dLon = this.deg2rad(lon2 - lon1);
							const a =
								Math.sin(dLat / 2) * Math.sin(dLat / 2) +
								Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
								Math.sin(dLon / 2) * Math.sin(dLon / 2);
							const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
							const distanceInMeters = R * c;

							// 转换为千米并保留一位小数
							const distance = (distanceInMeters / 1000).toFixed(1);

							// 查找是否已存在拖拽位置
							const dragLocationIndex = this.addressList.findIndex(item => item.name === '拖拽位置');

							// 创建新的拖拽位置对象
							const dragLocation = {
								name: '拖拽位置',
								address: `${longitude},${latitude}`,
								latitude: latitude,
								longitude: longitude,
								distance: distance
							};

							if (dragLocationIndex !== -1) {
								// 如果已存在拖拽位置，替换它
								this.addressList[dragLocationIndex] = dragLocation;
							} else {
								// 如果不存在拖拽位置，添加到列表
								this.addressList.push(dragLocation);
							}
						} else {
							// 将当前位置添加到地址列表的最前面
							this.addressList.unshift({
								name: '当前位置',
								address: `${longitude},${latitude}`,
								latitude: latitude,
								longitude: longitude,
								distance: '0.0'
							});
						}
					}
				});
			},
			// 更新地图标记
			updateMarkers() {
				// 验证 currentLocation 的经纬度
				const lat = parseFloat(this.currentLocation.latitude);
				const lng = parseFloat(this.currentLocation.longitude);

				if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
					this.markers = [{
						id: 1,
						latitude: lat,
						longitude: lng,
						width: 32,
						height: 32,
						// 使用默认标记，不指定iconPath
						// iconPath: '/static/images/location.png'
					}];
				} else {
					console.warn('currentLocation经纬度无效，不设置标记:', this.currentLocation);
					this.markers = [];
				}
			},
			// 处理地图区域变化
			handleRegionChange(e) {
				if (e.type === 'end' && e.causedBy === 'drag') {
					// 获取地图中心点位置
					const mapCtx = uni.createMapContext('map');
					mapCtx.getCenterLocation({
						success: (res) => {
							console.log('拖拽后的中心点位置:', res);

							// 验证获取的经纬度是否有效
							if (this.isValidLatLng(res.latitude, res.longitude)) {
								// 更新地图中心点位置，但不更新当前位置标记
								this.latitude = res.latitude;
								this.longitude = res.longitude;
							} else {
								console.warn('拖拽获取的经纬度无效:', res.latitude, res.longitude);
								return;
							}

							// 计算当前位置与拖拽位置的距离
							const lat1 = this.currentLocation.latitude;
							const lon1 = this.currentLocation.longitude;
							const lat2 = res.latitude;
							const lon2 = res.longitude;

							// 使用Haversine公式计算两点之间的距离（单位：米）
							const R = 6371000; // 地球半径（米）
							const dLat = this.deg2rad(lat2 - lat1);
							const dLon = this.deg2rad(lon2 - lon1);
							const a =
								Math.sin(dLat / 2) * Math.sin(dLat / 2) +
								Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
								Math.sin(dLon / 2) * Math.sin(dLon / 2);
							const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
							const distanceInMeters = R * c;

							// 转换为千米并保留一位小数
							this.dragDistance = (distanceInMeters / 1000).toFixed(1);

							// 不再搜索拖拽位置附近的地点
							// this.searchNearby(res.longitude, res.latitude);
						},
						fail: (err) => {
							console.error('获取地图中心点位置失败:', err);
						}
					});
				}
			},
			// 计算两点之间的距离（单位：千米）
			calculateDistance(lat1, lon1, lat2, lon2) {
				// 使用Haversine公式计算两点之间的距离
				const R = 6371; // 地球半径（千米）
				const dLat = this.deg2rad(lat2 - lat1);
				const dLon = this.deg2rad(lon2 - lon1);
				const a =
					Math.sin(dLat / 2) * Math.sin(dLat / 2) +
					Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
					Math.sin(dLon / 2) * Math.sin(dLon / 2);
				const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
				const distance = R * c;

				// 保留一位小数
				return distance.toFixed(1);
			},
			// 处理搜索
			handleSearch() {
				if (!this.searchKeyword) {
					return;
				}

				// 显示加载提示
				uni.showLoading({
					title: '搜索中...',
					mask: true
				});

				// 清空地址列表，避免重复添加
				this.addressList = [];

				// 添加当前位置到列表
				this.addressList = [{
					name: '当前位置',
					address: '当前位置',
					latitude: this.latitude,
					longitude: this.longitude,
					distance: '0.0'
				}];

				// 获取当前选择的城市，去除后缀
				let searchCity = this.currentCity;
				if (searchCity.includes(' · ')) {
					// 如果包含区县信息，只取城市部分
					searchCity = searchCity.split(' · ')[0];
				}
				// 去除城市后缀
				searchCity = searchCity.replace('市', '').replace('特别行政区', '').replace('自治州', '').replace('地区', '').replace(
					'盟', '');

				console.log('搜索城市:', searchCity);
				console.log('当前位置:', this.latitude, this.longitude);
				
				// qqmapsdk.search({
				// 	keyword: this.searchKeyword,  // 使用用户输入的搜索关键词，而不是固定的'酒店'
				// 	region: searchCity,           // 限制在指定城市内搜索
				// 	auto_extend: 0,              // 不自动扩展搜索范围，严格限制在指定城市内
				// 	page_size: 20,               // 每页返回20条结果，与原高德实现保持一致
				// 	page_index: 1,               // 第一页
				// 	address_format: 'short',     // 返回简短地址格式
				// 	success: (res) => {
				// 		// 隐藏加载提示
				// 		uni.hideLoading();

				// 		console.log('腾讯地图搜索返回数据:', res);

				// 		// 检查返回状态和数据
				// 		if (res.status === 0 && res.data && res.data.length > 0) {
				// 			const searchResults = res.data.map(item => {
				// 				// 腾讯地图返回的经纬度格式为 {lat: xx, lng: xx}
				// 				const lat2 = parseFloat(item.location.lat);
				// 				const lon2 = parseFloat(item.location.lng);

				// 				// 验证经纬度是否有效
				// 				if (!this.isValidLatLng(lat2, lon2)) {
				// 					console.warn('搜索结果中的经纬度无效:', lat2, lon2, item.title);
				// 					return null; // 跳过无效的结果
				// 				}

				// 				// 计算与当前位置的距离
				// 				let distance = '0.0';
				// 				if (this.latitude && this.longitude) {
				// 					distance = this.calculateDistance(
				// 						this.latitude,
				// 						this.longitude,
				// 						lat2,
				// 						lon2
				// 					);
				// 				}

				// 				// 处理地址信息，优先使用address，如果没有则使用title
				// 				let address_new = item.title;
				// 				if (item.address && item.address !== '') {
				// 					address_new = item.address;
				// 				}

				// 				return {
				// 					name: item.title,
				// 					address: address_new,
				// 					latitude: lat2,
				// 					longitude: lon2,
				// 					distance: distance
				// 				};
				// 			}).filter(item => item !== null); // 过滤掉无效的结果

				// 			// 合并搜索结果到地址列表
				// 			this.addressList = [...this.addressList, ...searchResults];

				// 			// 将地址列表和当前城市保存到本地存储
				// 			uni.setStorageSync('addressList', JSON.stringify(this.addressList));
				// 			uni.setStorageSync('currentCity', this.currentCity);
				// 			// 保存搜索关键词到本地存储
				// 			uni.setStorageSync('searchKeyword', this.searchKeyword);

				// 			// 跳转到搜索结果页面
				// 			uni.navigateTo({
				// 				url: '/pages/index/publish/map/search-results?type=' + this.addressType + '&latitude=' + this.latitude + '&longitude=' + this.longitude
				// 			});
				// 		} else {
				// 			console.log('腾讯地图搜索无结果或状态异常:', res);
				// 			uni.showToast({
				// 				title: '未找到相关地址',
				// 				icon: 'none'
				// 			});
				// 		}
				// 	},
				// 	fail: (res) => {
				// 		// 隐藏加载提示
				// 		uni.hideLoading();

				// 		console.error('腾讯地图搜索请求失败:', res);
				// 		uni.showToast({
				// 			title: '搜索请求失败',
				// 			icon: 'none'
				// 		});
				// 	},
				// 	complete: (res) => {
				// 		console.log('腾讯地图搜索请求完成:', res);
				// 	}
				// })

				uni.request({
					url: `https://restapi.amap.com/v3/place/text`,
					data: {
						key: 'c34dee46481f77816b9980f7efd95a24',
						keywords: this.searchKeyword,
						city: searchCity,
						offset: 20,
						page: 1,
						extensions: 'all',
						citylimit: true,
						output: 'json'
					},
					success: (res) => {
						// 隐藏加载提示
						uni.hideLoading();

						console.log('地址搜索返回数据2:', res.data);
						// 检查返回状态，高德地图API可能返回"OK"或"1"表示成功
						if ((res.data.status === '1' || res.data.status === 'OK') && res.data.pois && res.data
							.pois.length > 0) {
							const searchResults = res.data.pois.map(item => {
								// 解析经纬度
								const lat2 = parseFloat(item.location.split(',')[1]);
								const lon2 = parseFloat(item.location.split(',')[0]);

								// 验证经纬度是否有效
								if (!this.isValidLatLng(lat2, lon2)) {
									console.warn('搜索结果中的经纬度无效:', lat2, lon2, item.name);
									return null; // 跳过无效的结果
								}

								// 计算与当前位置的距离
								let distance = '0.0';
								if (this.latitude && this.longitude) {
									// console.log('计算距离:', {
									// 	from: {
									// 		lat: this.latitude,
									// 		lon: this.longitude
									// 	},
									// 	to: {
									// 		lat: lat2,
									// 		lon: lon2
									// 	}
									// });

									distance = this.calculateDistance(
										this.latitude,
										this.longitude,
										lat2,
										lon2
									);

									// console.log('计算结果距离:', distance, 'km');
								}

								// 周扬修改，不准动这里的代码
								let address_new = item.name
								if(item.address !== '' && !Array.isArray(item.address)) {
									address_new = item.address
								} else if (Array.isArray(item.address) && item.address.length > 0) {
									address_new = item.address
								}

								return {
									name: item.name,
									address: address_new,
									latitude: lat2,
									longitude: lon2,
									distance: distance
								};
							}).filter(item => item !== null); // 过滤掉无效的结果

							// 合并搜索结果到地址列表
							this.addressList = [...this.addressList, ...searchResults];

							// 将地址列表和当前城市保存到本地存储
							uni.setStorageSync('addressList', JSON.stringify(this.addressList));
							uni.setStorageSync('currentCity', this.currentCity);
							// 保存搜索关键词到本地存储
							uni.setStorageSync('searchKeyword', this.searchKeyword);

							// 跳转到搜索结果页面
							uni.navigateTo({
								url: '/pages/index/publish/map/search-results?type=' + this.addressType + '&latitude=' + this.latitude + '&longitude=' + this.longitude
							});
						} else {
							console.log(res,'当时的')
							if(res.data.info === 'USER_DAILY_QUERY_OVER_LIMIT'){
								console.log('高德地图配额已达上限，切换到腾讯地图搜索');
								// uni.showToast({
								// 	title: '切换模型搜索',
								// 	icon: 'none',
								// 	duration: 1500
								// });
								// 切换到腾讯地图搜索
								
								// 显示加载提示
								uni.showLoading({
									title: '努力搜索中...',
									mask: true
								});
								this.searchWithTencentMap(searchCity);
							} else {
								console.log('地址搜索无结果或状态异常:', res.data);
								uni.showToast({
									title: '未找到相关地址',
									icon: 'none'
								});
							}
						}
					},
					fail: (err) => {
						console.error('高德地图搜索请求失败，切换到腾讯地图:', err);
						// uni.showToast({
						// 	title: '切换到腾讯地图搜索',
						// 	icon: 'none',
						// 	duration: 1500
						// });
						// 显示加载提示
						uni.showLoading({
							title: '努力搜索中...',
							mask: true
						});
						// 高德地图请求失败时，切换到腾讯地图搜索
						this.searchWithTencentMap(searchCity);
					}
				});
			},
			// 百度地图搜索方法
			bmapsearch(searchCity) {
				console.log('使用百度地图搜索，城市:', searchCity);

				// 新建百度地图对象
				var BMap = new bmap.BMapWX({
					ak: '2pL9zc4Li32CfutUeN99cZE64s9HVnT5'
				});

				var that = this;

				var fail = function(data) {
					console.error('百度地图搜索请求失败:', data);
					// 隐藏加载提示
					uni.hideLoading();
					uni.showToast({
						title: '搜索请求失败',
						icon: 'none'
					});
				};

				var success = function(data) {
					console.log('百度地图搜索返回数据:', data);

					// 隐藏加载提示
					uni.hideLoading();

					if (data && data.result && data.result.length > 0) {
						const searchResults = [];

						// 处理百度地图suggestion返回的数据
						for (let i = 0; i < Math.min(data.result.length, 20); i++) {
							const item = data.result[i];

							// 百度地图suggestion返回的数据结构
							if (item.location) {
								const lat2 = parseFloat(item.location.lat);
								const lon2 = parseFloat(item.location.lng);

								// 验证经纬度是否有效
								if (that.isValidLatLng(lat2, lon2)) {
									// 计算与当前位置的距离
									let distance = '0.0';
									if (that.latitude && that.longitude) {
										distance = that.calculateDistance(
											that.latitude,
											that.longitude,
											lat2,
											lon2
										);
									}

									// 处理地址信息
									let address_new = item.name || item.district;
									if (item.district && item.district !== '') {
										address_new = item.district;
									}

									searchResults.push({
										name: item.name || '未知地点',
										address: address_new,
										latitude: lat2,
										longitude: lon2,
										distance: distance
									});
								}
							}
						}

						if (searchResults.length > 0) {
							// 合并搜索结果到地址列表
							that.addressList = [...that.addressList, ...searchResults];

							// 将地址列表和当前城市保存到本地存储
							uni.setStorageSync('addressList', JSON.stringify(that.addressList));
							uni.setStorageSync('currentCity', that.currentCity);
							// 保存搜索关键词到本地存储
							uni.setStorageSync('searchKeyword', that.searchKeyword);

							// 跳转到搜索结果页面
							uni.navigateTo({
								url: '/pages/index/publish/map/search-results?type=' + that.addressType + '&latitude=' + that.latitude + '&longitude=' + that.longitude
							});
						} else {
							console.log('百度地图搜索结果中没有有效的地理位置信息');
							uni.showToast({
								title: '未找到相关地址',
								icon: 'none'
							});
						}
					} else {
						console.log('百度地图搜索无结果或状态异常:', data);
						uni.showToast({
							title: '未找到相关地址',
							icon: 'none'
						});
					}
				};

				// 发起suggestion搜索请求（地址建议搜索）
				BMap.suggestion({
					query: this.searchKeyword,  // 搜索关键词
					region: searchCity,         // 搜索城市
					city_limit: true,          // 限制在城市内搜索
					fail: fail,
					success: success
				});
			},
			// 腾讯地图搜索方法
			searchWithTencentMap(searchCity) {
				console.log('切换到腾讯地图搜索，城市:', searchCity);

				qqmapsdk.search({
					keyword: this.searchKeyword,  // 使用用户输入的搜索关键词
					region: searchCity,           // 限制在指定城市内搜索
					auto_extend: 0,              // 不自动扩展搜索范围，严格限制在指定城市内
					page_size: 20,               // 每页返回20条结果，与原高德实现保持一致
					page_index: 1,               // 第一页
					address_format: 'long',      // 修改为详细地址格式，获取完整地址信息
					success: (res) => {
						// 隐藏加载提示
						uni.hideLoading();

						console.log('腾讯地图搜索返回数据:', res);

						// 检查返回状态和数据
						if (res.status === 0 && res.data && res.data.length > 0) {
							// 使用Promise.all来并行处理逆地理编码，获取完整地址信息
							const geocodePromises = res.data.map(item => {
								return new Promise((resolve) => {
									// 腾讯地图返回的经纬度格式为 {lat: xx, lng: xx}
									const lat2 = parseFloat(item.location.lat);
									const lon2 = parseFloat(item.location.lng);

									// 验证经纬度是否有效
									if (!this.isValidLatLng(lat2, lon2)) {
										console.warn('搜索结果中的经纬度无效:', lat2, lon2, item.title);
										resolve(null); // 跳过无效的结果
										return;
									}

									// 计算与当前位置的距离
									let distance = '0.0';
									if (this.latitude && this.longitude) {
										distance = this.calculateDistance(
											this.latitude,
											this.longitude,
											lat2,
											lon2
										);
									}

									// 使用腾讯地图逆地理编码获取详细地址信息
									qqmapsdk.reverseGeocoder({
										location: {
											latitude: lat2,
											longitude: lon2
										},
										success: (geoRes) => {
											console.log('腾讯地图逆地理编码返回:', geoRes);

											let address_new = item.title;
											if (geoRes.status === 0 && geoRes.result && geoRes.result.address) {
												// 优先使用逆地理编码返回的完整地址
												address_new = geoRes.result.address;
											} else if (item.address && item.address !== '') {
												// 其次使用搜索返回的地址
												address_new = item.address;
											}

											resolve({
												name: item.title,
												address: address_new,
												latitude: lat2,
												longitude: lon2,
												distance: distance
											});
										},
										fail: () => {
											// 逆地理编码失败时，使用原有逻辑
											let address_new = item.title;
											if (item.address && item.address !== '') {
												address_new = item.address;
											}

											resolve({
												name: item.title,
												address: address_new,
												latitude: lat2,
												longitude: lon2,
												distance: distance
											});
										}
									});
								});
							});

							// 等待所有逆地理编码完成
							Promise.all(geocodePromises).then(searchResults => {
								const validResults = searchResults.filter(item => item !== null);

								if (validResults.length > 0) {
									// 合并搜索结果到地址列表
									this.addressList = [...this.addressList, ...validResults];

									// 将地址列表和当前城市保存到本地存储
									uni.setStorageSync('addressList', JSON.stringify(this.addressList));
									uni.setStorageSync('currentCity', this.currentCity);
									// 保存搜索关键词到本地存储
									uni.setStorageSync('searchKeyword', this.searchKeyword);

									// 跳转到搜索结果页面
									uni.navigateTo({
										url: '/pages/index/publish/map/search-results?type=' + this.addressType + '&latitude=' + this.latitude + '&longitude=' + this.longitude
									});
								} else {
									console.log('腾讯地图搜索结果处理后无有效数据，切换到百度地图');
									// 显示加载提示
									uni.showLoading({
										title: '加倍努力搜索中...',
										mask: true
									});
									// 切换到百度地图搜索
									this.bmapsearch(searchCity);
								}
							});
						} else {
							console.log('腾讯地图搜索无结果或状态异常，切换到百度地图:', res);
							// uni.showToast({
							// 	title: '切换到百度地图搜索',
							// 	icon: 'none',
							// 	duration: 1500
							// });
							// 显示加载提示
							uni.showLoading({
								title: '加倍努力搜索中...',
								mask: true
							});
							// 切换到百度地图搜索
							this.bmapsearch(searchCity);
						}
					},
					fail: (res) => {
						console.error('腾讯地图搜索请求失败，切换到百度地图:', res);
						// uni.showToast({
						// 	title: '切换到百度地图搜索',
						// 	icon: 'none',
						// 	duration: 1500
						// });
						// 显示加载提示
						uni.showLoading({
							title: '加倍努力搜索中...',
							mask: true
						});
						// 腾讯地图请求失败时，切换到百度地图搜索
						this.bmapsearch(searchCity);
					},
					complete: (res) => {
						console.log('腾讯地图搜索请求完成:', res);
					}
				});
			},
			// 跳转到搜索结果页面
			navigateToSearchResults() {
				// 将地址列表数据存储到本地，以便在新页面使用
				uni.setStorageSync('addressList', JSON.stringify(this.addressList));

				// 跳转到搜索结果页面
				uni.navigateTo({
					url: '/pages/index/publish/map/search-results?type=' + this.addressType + '&latitude=' + this.latitude + '&longitude=' + this.longitude
				});
			},
			// 处理选择地址
			// handleSelectAddress(item) {
			// 	// 更新地图中心点
			// 	this.latitude = item.latitude;
			// 	this.longitude = item.longitude;
			// 	this.updateMarkers();

			// 	// 获取地址的详细信息
			// 	uni.request({
			// 		url: 'https://restapi.amap.com/v3/geocode/regeo',
			// 		data: {
			// 			key: 'c34dee46481f77816b9980f7efd95a24',
			// 			location: `${item.longitude},${item.latitude}`,
			// 			extensions: 'all', // 修改为 all，获取更详细的地址信息
			// 			output: 'json'
			// 		},
			// 		success: (res) => {
			// 			console.log('逆地理编码返回数据:', res.data);
			// 			if ((res.data.status === '1' || res.data.status === 'OK') && res.data.regeocode) {
			// 				const addressComponent = res.data.regeocode.addressComponent;
			// 				console.log('地址组件:', addressComponent);

			// 				// 详细输出地址组件的各个属性
			// 				console.log('省份:', addressComponent.province);
			// 				console.log('城市:', addressComponent.city);
			// 				console.log('区县:', addressComponent.district);

			// 				// 更新上一页的地址
			// 				const pages = getCurrentPages();
			// 				const prevPage = pages[pages.length - 2];
			// 				if (prevPage) {
			// 					if (this.addressType === 'start') {
			// 						prevPage.$vm.startAddress = item.address;
			// 						prevPage.$vm.startLocation = {
			// 							latitude: item.latitude,
			// 							longitude: item.longitude
			// 						};
			// 					} else if (this.addressType === 'end') {
			// 						prevPage.$vm.endAddress = item.address;
			// 						prevPage.$vm.endLocation = {
			// 							latitude: item.latitude,
			// 							longitude: item.longitude
			// 						};
			// 					} else if (this.addressType === 'address') {
			// 						// 确保省市区信息存在
			// 						const province = addressComponent.province || '';
			// 						const city = addressComponent.city || '';
			// 						const district = addressComponent.district || '';

			// 						console.log('省市区信息:', {
			// 							province,
			// 							city,
			// 							district
			// 						});

			// 						// 更新 formData
			// 						const updatedFormData = {
			// 							...prevPage.$vm.formData,
			// 							address: item.address,
			// 							latitude: item.latitude,
			// 							longitude: item.longitude,
			// 							province: province,
			// 							city: city,
			// 							district: district
			// 						};

			// 						// 打印更新后的 formData
			// 						console.log('更新后的 formData:', updatedFormData);

			// 						// 输出到 AppData
			// 						const appData = {
			// 							formData: updatedFormData,
			// 							addressComponent: addressComponent,
			// 							selectedAddress: item.address,
			// 							location: {
			// 								latitude: item.latitude,
			// 								longitude: item.longitude
			// 							}
			// 						};
			// 						console.log('AppData:', appData);

			// 						// 使用 uni.setStorageSync 存储到本地，方便在开发者工具中查看
			// 						uni.setStorageSync('debug_formData', appData);

			// 						// 更新父组件的 formData
			// 						prevPage.$vm.formData = updatedFormData;

			// 						// 触发父组件的更新
			// 						prevPage.$vm.$forceUpdate();
			// 					}
			// 				}

			// 				// 返回上一页
			// 				uni.navigateBack();
			// 			} else {
			// 				console.log('逆地理编码无结果或状态异常:', res.data);
			// 				uni.showToast({
			// 					title: '获取地址信息失败',
			// 					icon: 'none'
			// 				});
			// 			}
			// 		},
			// 		fail: (err) => {
			// 			console.error('逆地理编码请求失败:', err);
			// 			uni.showToast({
			// 				title: '获取地址信息失败',
			// 				icon: 'none'
			// 			});
			// 		}
			// 	});
			// },
			// 角度转弧度
			deg2rad(deg) {
				return deg * (Math.PI / 180);
			},
			// 处理选择当前位置
			handleSelectCurrentLocation() {
				// 获取地图中心点位置
				const mapCtx = uni.createMapContext('map');
				mapCtx.getCenterLocation({
					success: (res) => {
						console.log('选择的位置:', res);

						// 验证获取的经纬度是否有效
						if (!this.isValidLatLng(res.latitude, res.longitude)) {
							console.warn('选择位置的经纬度无效:', res.latitude, res.longitude);
							uni.showToast({
								title: '位置信息无效',
								icon: 'none'
							});
							return;
						}

						// 使用Promise包装getAddressInfo方法
						new Promise((resolve, reject) => {
							this.getAddressInfo(res.longitude, res.latitude, true);
							// 监听addressList的变化
							const unwatch = this.$watch('addressList', (newVal) => {
								if (newVal && newVal.length > 0) {
									unwatch(); // 停止监听
									resolve(newVal);
								}
							});
						}).then((addressList) => {
							// 查找拖拽位置或当前位置
							const selectedLocation = addressList.find(item =>
								item.name === '拖拽位置' || item.name === '当前位置'
							);

							if (selectedLocation) {
								console.log(selectedLocation);
								// 更新上一页的地址
								const pages = getCurrentPages();
								const publishPage = pages[pages.length - 2];
								if (publishPage) {
									if (this.addressType === 'start') {
										publishPage.$vm.formData.address = selectedLocation.address;
										publishPage.$vm.formData.latitude = selectedLocation.latitude;
										publishPage.$vm.formData.longitude = selectedLocation.longitude;
										publishPage.$vm.formData.distance = selectedLocation.distance; // 距离km
										publishPage.$vm.formData.province = selectedLocation.addressComponent.province;
										// 针对重庆市这种特殊区域
										if(Array.isArray(selectedLocation.addressComponent.city)&&selectedLocation.addressComponent.city.length==0) {
											publishPage.$vm.formData.city = selectedLocation.addressComponent.province;
										} else {
											publishPage.$vm.formData.city = selectedLocation.addressComponent.city;
										}
										if(Array.isArray(selectedLocation.addressComponent.district)&&selectedLocation.addressComponent.district.length==0) {
											publishPage.$vm.formData.district = selectedLocation.addressComponent.township;
										} else {
											publishPage.$vm.formData.district = selectedLocation.addressComponent.district;
										}
								
										// 修复 万宁市属于行政区，导致无法识别系统区域的问题
										if(publishPage.$vm.formData.province === '海南省' && publishPage.$vm.formData.city === '海南省') {
											publishPage.$vm.formData.city = selectedLocation.addressComponent.district;
											publishPage.$vm.formData.district = selectedLocation.addressComponent.township;
										}
									} else if (this.addressType === 'end') {
										publishPage.$vm.endAddress = selectedLocation.address;
										publishPage.$vm.endLocation = {
											latitude: selectedLocation.latitude,
											longitude: selectedLocation.longitude
										};
									} else if (this.addressType === 'address') {
										publishPage.$vm.formData.address = selectedLocation.address;
										publishPage.$vm.formData.latitude = selectedLocation.latitude;
										publishPage.$vm.formData.longitude = selectedLocation.longitude;
									}
								}

								// 返回上一页
								uni.navigateBack();
							} else {
								uni.showToast({
									title: '获取地址信息失败',
									icon: 'none'
								});
							}
						}).catch((err) => {
							console.error('获取地址信息失败:', err);
							uni.showToast({
								title: '获取地址信息失败',
								icon: 'none'
							});
						});
					},
					fail: (err) => {
						console.error('获取地图中心点位置失败:', err);
						uni.showToast({
							title: '获取位置失败',
							icon: 'none'
						});
					}
				});
			},
			// 显示城市选择器
			showCitySelector() {
				this.showCityPopup = true;
				this.citySearchKeyword = ''; // 清空搜索关键词
				this.filterCities(); // 初始化过滤后的省份列表
			},
			// 隐藏城市选择器
			hideCitySelector() {
				this.showCityPopup = false;
				this.citySearchKeyword = ''; // 清空搜索关键词
			},
			// 清除城市搜索
			clearCitySearch() {
				this.citySearchKeyword = '';
				this.filteredDistricts = [];
				this.filterCities();

				// 重置所有省份和城市的展开状态
				this.filteredProvinces.forEach(province => {
					province.isExpanded = false;
					if (province.cities) {
						province.cities.forEach(city => {
							city.isExpanded = false;
						});
					}
				});
			},
			// 切换省份展开状态
			toggleProvince(provinceIndex) {
				// 使用Vue.set确保响应式更新
				if (!this.filteredProvinces[provinceIndex].hasOwnProperty('isExpanded')) {
					this.$set(this.filteredProvinces[provinceIndex], 'isExpanded', false);
				}

				// 切换展开状态
				this.$set(this.filteredProvinces[provinceIndex], 'isExpanded', !this.filteredProvinces[provinceIndex]
					.isExpanded);

				// 如果展开省份，初始化其城市的展开状态
				if (this.filteredProvinces[provinceIndex].isExpanded) {
					this.filteredProvinces[provinceIndex].cities.forEach((city, cityIndex) => {
						if (!city.hasOwnProperty('isExpanded')) {
							this.$set(city, 'isExpanded', false);
						}
					});
				}
			},

			// 切换城市展开状态
			toggleCity(provinceIndex, cityIndex) {
				// 使用Vue.set确保响应式更新
				if (!this.filteredProvinces[provinceIndex].cities[cityIndex].hasOwnProperty('isExpanded')) {
					this.$set(this.filteredProvinces[provinceIndex].cities[cityIndex], 'isExpanded', false);
				}

				// 切换展开状态
				this.$set(
					this.filteredProvinces[provinceIndex].cities[cityIndex],
					'isExpanded',
					!this.filteredProvinces[provinceIndex].cities[cityIndex].isExpanded
				);
			},
			// 过滤城市列表（只用cityListData）
			filterCities() {
				if (!this.cityListData || this.cityListData.length === 0) {
					console.error('本地cityList未加载');
					return;
				}
				if (!this.citySearchKeyword) {
					// 显示全部省市区
					this.filteredProvinces = this.cityListData.map(province => ({
						name: province.name,
						isExpanded: false,
						cities: (province.children || []).map(city => ({
							name: city.name,
							isExpanded: false,
							districts: (city.children || []).map(district => district.name)
						}))
					}));
					this.filteredDistricts = [];
					return;
				}
				// 搜索区县
				let allDistrictsSet = new Set();
				this.cityListData.forEach(province => {
					(province.children || []).forEach(city => {
						(city.children || []).forEach(district => {
							if (district.name.includes(this.citySearchKeyword)) {
								allDistrictsSet.add(`${city.name} · ${district.name}`);
							}
						});
					});
				});
				this.filteredDistricts = Array.from(allDistrictsSet);
				// 搜索省市区
				this.filteredProvinces = this.cityListData.map(province => {
					const filteredCities = (province.children || []).map(city => {
						// 匹配城市名
						if (city.name.includes(this.citySearchKeyword)) {
							return {
								name: city.name,
								isExpanded: true,
								districts: (city.children || []).map(district => `${city.name} · ${district.name}`)
							};
						}
						// 匹配区县名
						const filteredDistricts = (city.children || []).filter(district => district.name.includes(this.citySearchKeyword)).map(district => `${city.name} · ${district.name}`);
						return {
							name: city.name,
							isExpanded: false,
							districts: filteredDistricts
						};
					}).filter(city => city.name.includes(this.citySearchKeyword) || city.districts.length > 0);
					if (province.name.includes(this.citySearchKeyword) || filteredCities.length > 0) {
						return {
							name: province.name,
							isExpanded: true,
							cities: filteredCities
						};
					}
					return null;
				}).filter(province => province !== null);
			},
			// 选择城市
			selectCity(city) {
				const cityList = uni.getStorageSync('cityList') || [];
				console.log('选择的城市:', city);
				console.log('已入驻城市列表:', cityList);
				let districtName = city;
				let cityName = '';
				let useDistrictLatLng = false;
				let districtLat = null, districtLng = null;
				// 检查是否包含城市信息
				if (city.includes(' · ')) {
					const parts = city.split(' · ');
					cityName = parts[0];
					districtName = parts[1];
					// 查找cityList区县经纬度
					for (const province of cityList) {
						for (const c of province.children || []) {
							if (c.name === cityName) {
								for (const d of c.children || []) {
									if (d.name === districtName) {
										if (d.latitude && d.longitude) {
											districtLat = d.latitude;
											districtLng = d.longitude;
											useDistrictLatLng = true;
											break;
										}
									}
								}
							}
							if (useDistrictLatLng) break;
						}
						if (useDistrictLatLng) break;
					}
				}
				// 处理可能包含城市信息的区县名称（如"海口市 · 龙华区"）
				let isCityAvailable = cityList.some(provinceItem => {
					// 检查省级
					if (provinceItem.name === city || provinceItem.name === districtName) {
						return true;
					}

					// 检查市级
					if (provinceItem.children && Array.isArray(provinceItem.children)) {
						return provinceItem.children.some(cityItem => {
							// 检查城市名称是否匹配
							if (cityItem.name === city || cityItem.name === cityName || cityItem.name ===
								districtName) {
								// 如果匹配到城市，还需要检查是否有区县信息
								if (cityName && districtName) {
									// 如果有区县信息，必须同时匹配城市和区县
									return cityItem.children && Array.isArray(cityItem.children) &&
										cityItem.children.some(districtItem => districtItem.name ===
											districtName);
								}
								return true;
							}

							// 检查区县级
							if (cityItem.children && Array.isArray(cityItem.children)) {
								return cityItem.children.some(districtItem => {
									// 如果用户选择了带城市名的区县（如"海口市 · 龙华区"），则必须同时匹配城市名和区县名
									if (cityName && districtName) {
										return cityItem.name === cityName && districtItem.name ===
											districtName;
									}
									// 如果用户只选择了区县名，则只匹配区县名
									return districtItem.name === city || districtItem.name ===
										districtName;
								});
							}
							return false;
						});
					}
					return false;
				});

				console.log('城市是否可用:', isCityAvailable);

				if (!isCityAvailable) {
					// 如果城市不在已入驻列表中，显示提示
					this.showAuthModal = true;
					return;
				}

				// 更新当前城市
				this.currentCity = city;
				this.hideCitySelector();
				uni.setStorageSync('currentCity', city);
				console.log('城市已保存到本地存储:', city);
				if (useDistrictLatLng) {
					// 验证从cityList获取的经纬度是否有效
					if (this.isValidLatLng(districtLat, districtLng)) {
						this.latitude = districtLat;
						this.longitude = districtLng;
						this.updateMarkers();
					} else {
						console.warn('从cityList获取的经纬度无效:', districtLat, districtLng);
						this.updateMapByCity(city);
					}
				} else {
					this.updateMapByCity(city);
				}
			},
			// 从区县名称中提取城市名称
			getCityFromDistrict(district) {
				// 如果区县名称包含"市"，则提取市名
				// 例如：从"深圳市龙华区"提取"深圳市"
				const cityMatch = district.match(/(.+市)/);
				if (cityMatch && cityMatch[1]) {
					return cityMatch[1];
				}

				// 如果区县名称不包含"市"，则尝试从区县名称中提取可能的城市名
				// 例如：从"龙华区"提取"深圳"（这需要额外的逻辑或数据支持）
				// 这里可以根据实际情况扩展

				return null;
			},
			// 根据城市更新地图中心点
			updateMapByCity(city) {
				if (!this.areaData) {
					console.error('区域数据未加载');
					return;
				}

				console.log('开始更新地图中心点，输入城市:', city);

				// 处理可能包含城市信息的区县名称（如"海口市 · 龙华区"）
				let districtName = city;
				let extractedCityName = '';

				// 检查是否包含城市信息
				if (city.includes(' · ')) {
					const parts = city.split(' · ');
					extractedCityName = parts[0];
					districtName = parts[1];
					console.log('提取的城市名:', extractedCityName);
					console.log('提取的区县名:', districtName);
				}

				// 遍历省份和城市查找匹配的城市
				for (const [province, data] of Object.entries(this.areaData)) {
					for (const [currentCityName, cityData] of Object.entries(data.cities)) {
						// 检查城市名称是否匹配
						if (currentCityName === city || currentCityName === extractedCityName || currentCityName ===
							districtName) {
							console.log('找到匹配的城市:', currentCityName);
							// 找到匹配的城市，使用其中心点坐标
							const [longitude, latitude] = cityData.center.split(',').map(Number);

							// 验证经纬度是否有效
							if (this.isValidLatLng(latitude, longitude)) {
								this.latitude = latitude;
								this.longitude = longitude;
								this.updateMarkers();
								return;
							} else {
								console.warn('城市中心点坐标无效:', latitude, longitude);
							}
						}

						// 检查区县级
						if (cityData.districts && Array.isArray(cityData.districts)) {
							// 如果用户选择了带城市名的区县（如"海口市 · 龙华区"）
							if (extractedCityName && districtName) {
								// 必须同时匹配城市名和区县名
								if (currentCityName === extractedCityName && cityData.districts.includes(districtName)) {
									console.log('找到匹配的城市和区县:', currentCityName, districtName);
									const [longitude, latitude] = cityData.center.split(',').map(Number);

									// 验证经纬度是否有效
									if (this.isValidLatLng(latitude, longitude)) {
										this.latitude = latitude;
										this.longitude = longitude;
										this.updateMarkers();
										return;
									} else {
										console.warn('城市区县中心点坐标无效:', latitude, longitude);
									}
								}
							} else {
								// 如果用户只选择了区县名，则只匹配区县名
								if (cityData.districts.includes(city) || cityData.districts.includes(districtName)) {
									console.log('找到匹配的区县:', city || districtName);
									const [longitude, latitude] = cityData.center.split(',').map(Number);

									// 验证经纬度是否有效
									if (this.isValidLatLng(latitude, longitude)) {
										this.latitude = latitude;
										this.longitude = longitude;
										this.updateMarkers();
										return;
									} else {
										console.warn('区县中心点坐标无效:', latitude, longitude);
									}
								}
							}
						}
					}
				}

				// 如果没找到匹配的城市，使用默认坐标（成都市）
				console.error('未找到城市:', city);
				this.latitude = 30.0488;
				this.longitude = 103.8485;
				this.updateMarkers();
			},
			// 根据经纬度获取当前城市
			getCurrentCity(longitude, latitude) {
				// 如果已经有选择的城市，不再获取
				const selectedCity = uni.getStorageSync('currentCity');
				if (selectedCity) {
					console.log('已有选择的城市，不再获取当前位置城市:', selectedCity);
					return;
				}

				console.log('开始获取城市信息，经纬度:', longitude, latitude);
				uni.request({
					url: 'https://restapi.amap.com/v3/geocode/regeo',
					data: {
						key: 'c34dee46481f77816b9980f7efd95a24',
						location: `${longitude},${latitude}`,
						extensions: 'base',
						output: 'json'
					},
					success: (res) => {
						console.log('逆地理编码返回数据:', res.data);
						if ((res.data.status === '1' || res.data.status === 'OK') && res.data.regeocode) {
							const addressComponent = res.data.regeocode.addressComponent;
							console.log('地址组件:', addressComponent);

							if (addressComponent) {
								// 处理直辖市和特殊行政区
								let cityName = '';

								// 详细输出地址组件的各个属性
								console.log('省份:', addressComponent.province);
								console.log('城市:', addressComponent.city);
								console.log('区县:', addressComponent.district);

								if (addressComponent.province &&
									(addressComponent.province.includes('市') ||
										addressComponent.province.includes('特别行政区'))) {
									// 直辖市或特别行政区
									cityName = addressComponent.province;
									console.log('使用省份作为城市名称:', cityName);
								} else if (addressComponent.city) {
									// 普通城市
									cityName = addressComponent.city;
									console.log('使用城市名称:', cityName);
								} else if (addressComponent.district) {
									// 如果没有城市信息，使用区县信息
									cityName = addressComponent.district;
									console.log('使用区县作为城市名称:', cityName);
								}

								// 确保城市名称不为空且是字符串类型
								if (cityName && typeof cityName === 'string') {
									// 更新当前城市，只保留城市名称，不包含区县
									this.currentCity = cityName;
									// 保存到本地存储
									uni.setStorageSync('currentCity', this.currentCity);
									console.log('当前城市已更新为:', this.currentCity);
								} else {
									console.error('无法获取有效的城市名称或城市名称不是字符串类型');
									console.log('cityName类型:', typeof cityName);
									console.log('cityName值:', cityName);

									// 尝试从formatted_address中提取城市名称
									if (res.data.regeocode.formatted_address) {
										const formattedAddress = res.data.regeocode.formatted_address;
										console.log('格式化地址:', formattedAddress);

										// 尝试从格式化地址中提取城市名称
										// 通常格式为: 省市区详细地址
										const addressParts = formattedAddress.split('省');
										if (addressParts.length > 1) {
											const cityPart = addressParts[1].split('市')[0];
											if (cityPart) {
												this.currentCity = cityPart + '市';
												uni.setStorageSync('currentCity', this.currentCity);
												console.log('从格式化地址提取的城市名称:', this.currentCity);
												return;
											}
										}
									}

									// 如果无法获取城市名称，使用默认城市
									this.currentCity = '成都市';
									uni.setStorageSync('currentCity', this.currentCity);
									console.log('使用默认城市:', this.currentCity);
								}
							} else {
								console.error('地址组件为空');
								// 如果地址组件为空，使用默认城市
								this.currentCity = '成都市';
								uni.setStorageSync('currentCity', this.currentCity);
								console.log('使用默认城市:', this.currentCity);
							}
						} else {
							console.error('逆地理编码返回数据异常:', res.data);
							// 如果返回数据异常，使用默认城市
							this.currentCity = '成都市';
							uni.setStorageSync('currentCity', this.currentCity);
							console.log('使用默认城市:', this.currentCity);
						}
					},
					fail: (err) => {
						console.error('获取城市信息失败:', err);
						// 如果请求失败，使用默认城市
						this.currentCity = '成都市';
						uni.setStorageSync('currentCity', this.currentCity);
						console.log('使用默认城市:', this.currentCity);
					}
				});
			},
			// 验证经纬度是否有效
			isValidLatLng(latitude, longitude) {
				// 处理 null、undefined、空字符串等情况
				if (latitude == null || longitude == null || latitude === '' || longitude === '') {
					return false;
				}

				// 转换为数字
				const lat = parseFloat(latitude);
				const lng = parseFloat(longitude);

				// 检查是否为有效数字且在有效范围内
				return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
			},

			// 根据城市名称获取经纬度
			async getCityLocation(cityName) {
				try {
					// 从本地存储获取 providerInfo
					const currentLocation = uni.getStorageSync('providerInfo');

					if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
						// 转换为数字
						const lat = parseFloat(currentLocation.latitude);
						const lng = parseFloat(currentLocation.longitude);
						this.latitude = lat;
						this.longitude = lng;
						this.currentLocation.latitude = lat;
						this.currentLocation.longitude = lng;

						// 对于明显有效的数字，直接使用（避免复杂验证导致的问题）
						// if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
						// 	// 如果有 providerInfo 中的位置信息且有效，使用它
						// 	this.latitude = lat;
						// 	this.longitude = lng;
						// 	this.currentLocation.latitude = lat;
						// 	this.currentLocation.longitude = lng;
						// 	console.log('使用providerInfo中的经纬度:', this.latitude, this.longitude);
						// } else {
						// 	console.warn('providerInfo中的经纬度无效:', currentLocation.latitude, currentLocation.longitude, '解析后:', lat, lng);
						// 	// 使用默认坐标
						// 	this.latitude = 20.031397;
						// 	this.longitude = 110.330374;
						// 	this.currentLocation.latitude = 20.031397;
						// 	this.currentLocation.longitude = 110.330374;
						// }
					} else {
						// 如果没有 providerInfo，使用高德地图 API 获取城市经纬度
						const res = await uni.request({
							url: 'https://restapi.amap.com/v3/geocode/geo',
							data: {
								key: 'c34dee46481f77816b9980f7efd95a24',
								address: cityName,
								output: 'json'
							}
						});

						if (res.data && res.data.status === '1' && res.data.geocodes && res.data.geocodes.length > 0) {
							const location = res.data.geocodes[0].location;
							const [longitude, latitude] = location.split(',').map(Number);

							// 验证从API获取的经纬度是否有效
							if (this.isValidLatLng(latitude, longitude)) {
								this.latitude = latitude;
								this.longitude = longitude;
								this.currentLocation.latitude = latitude;
								this.currentLocation.longitude = longitude;
							} else {
								console.warn('从API获取的经纬度无效:', latitude, longitude);
								// 使用默认坐标
								this.latitude = 20.031397;
								this.longitude = 110.330374;
								this.currentLocation.latitude = 20.031397;
								this.currentLocation.longitude = 110.330374;
							}
						} else {
							// 如果获取失败，使用海口市龙华区的默认坐标
							this.latitude = 20.031397;
							this.longitude = 110.330374;
							this.currentLocation.latitude = 20.031397;
							this.currentLocation.longitude = 110.330374;
						}
					}
					
					this.scale = 12; // 调整缩放级别以显示整个城市
					this.updateMarkers();
					
				} catch (err) {
					console.error('获取城市位置失败:', err);
					// 发生错误时使用海口市龙华区的默认坐标
					this.latitude = 20.031397;
					this.longitude = 110.330374;
					this.currentLocation.latitude = 20.031397;
					this.currentLocation.longitude = 110.330374;
					this.scale = 12;
					this.updateMarkers();
					
					uni.showToast({
						title: '获取位置信息失败',
						icon: 'none'
					});
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.page-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		flex: 1;
		height: 100%;
		overflow: hidden;
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

		.search-input {
			flex: 1;
			height: 72rpx;
			background-color: #f5f5f5;
			border-radius: 36rpx;
			padding: 0 30rpx;
			font-size: 28rpx;
		}
	}

	.map-container {
		position: relative;
		width: 100%;
		flex: 1;
		overflow: hidden;

		.map {
			width: 100%;
			height: 100%;
		}

		.map-loading {
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #f5f5f5;
			color: #999;
			font-size: 28rpx;
		}

		.center-marker {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			width: 40rpx;
			height: 40rpx;
			background-color: #2492F2;
			border-radius: 50%;
			border: 4rpx solid #ffffff;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
			z-index: 10;

			&::after {
				content: '';
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				width: 16rpx;
				height: 16rpx;
				background-color: #ffffff;
				border-radius: 50%;
			}
		}
	}

	.distance-display {
		position: absolute;
		top: 580rpx;
		left: 0;
		right: 0;
		background-color: rgba(0, 0, 0, 0.7);
		color: #ffffff;
		padding: 20rpx;
		text-align: center;
		font-size: 28rpx;
		z-index: 10;
	}

	/* 地址列表样式 */
	.address-list {
		position: absolute;
		bottom: 120rpx;
		left: 0;
		right: 0;
		background-color: #ffffff;
		max-height: 40vh;
		overflow-y: auto;
		z-index: 10;
		border-radius: 20rpx 20rpx 0 0;
		box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.1);

		.address-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 30rpx 20rpx;
			border-bottom: 1rpx solid #f5f5f5;

			&:last-child {
				border-bottom: none;
			}

			.address-info {
				flex: 1;
				margin-right: 20rpx;

				.name {
					font-size: 32rpx;
					color: #333333;
					margin-bottom: 8rpx;
					display: block;
				}

				.address {
					font-size: 24rpx;
					color: #999999;
					display: block;
				}
			}

			.distance {
				font-size: 24rpx;
				color: #999999;
			}
		}
	}

	.select-button {
		position: absolute;
		bottom: calc(40rpx + constant(safe-area-inset-bottom));
		bottom: calc(40rpx + env(safe-area-inset-bottom));
		left: 50%;
		transform: translateX(-50%);
		background-color: #2492F2;
		color: #ffffff;
		padding: 20rpx 60rpx;
		border-radius: 40rpx;
		font-size: 32rpx;
		box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.3);
		z-index: 10;
	}

	/* 城市选择弹窗样式 */
	.city-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 100;
	}

	.city-popup-mask {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
	}

	.city-popup-content {
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
		display: flex;
		flex-direction: column;
		height: 80vh;

		.city-popup-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx;
			border-bottom: 1rpx solid #f5f5f5;

			text {
				font-size: 32rpx;
				color: #333333;
				font-weight: bold;
			}

			.close-btn {
				font-size: 40rpx;
				color: #999999;
			}
		}

		.city-search {
			padding: 20rpx;
			background-color: #ffffff;
			border-bottom: 1rpx solid #f5f5f5;

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

			.city-search-input {
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
				padding: 0 20rpx;
				height: 72rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				width: 72rpx;
				box-sizing: border-box;
			}
		}

		.city-popup-body {
			flex: 1;
			padding: 20rpx;
			overflow-y: auto;

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

			.result-count,
			.city-count,
			.district-count {
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
				padding: 20rpx;
				width: 100%;
				box-sizing: border-box;
				border-left: 8rpx solid #2492F2;
				background-color: #f8f8f8;
				border-radius: 8rpx;
				transition: all 0.3s;

				&:active {
					background-color: #f0f0f0;
				}

				.arrow-icon {
					font-size: 24rpx;
					color: #999999;
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
				padding: 16rpx 20rpx;
				width: 100%;
				box-sizing: border-box;
				position: relative;
				background-color: #f8f8f8;
				border-radius: 8rpx;
				transition: all 0.3s;

				&:active {
					background-color: #f0f0f0;
				}

				.arrow-icon {
					font-size: 24rpx;
					color: #999999;
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

			.district-list {
				display: flex;
				flex-wrap: wrap;
				padding-left: 20rpx;
				width: 100%;
				box-sizing: border-box;
				margin-left: 10rpx;
				border-left: 2rpx dashed #e0e0e0;
			}

			.district-item {
				width: 30%;
				height: 80rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: #f8f8f8;
				border-radius: 8rpx;
				margin-right: 3%;
				margin-bottom: 20rpx;
				position: relative;
				transition: all 0.3s;
				box-sizing: border-box;

				&:active {
					transform: scale(0.95);
				}

				&.active {
					background-color: #E6F4FF;
					border: 1rpx solid #2492F2;
					box-shadow: 0 2rpx 8rpx rgba(36, 146, 242, 0.2);
				}

				.district-name {
					font-size: 28rpx;
					color: #333333;
				}

				.check-icon {
					position: absolute;
					right: 10rpx;
					top: 10rpx;
					color: #2492F2;
					font-size: 24rpx;
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
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}

		to {
			transform: translateY(0);
		}
	}
</style>