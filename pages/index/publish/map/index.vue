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
				<view class="search-btn" @click="handleSearch">
					<text class="search-text">搜索</text>
				</view>
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
						<text class="search-icon">��</text>
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
					url: 'https://ccpt.cc111.cn/api/task/geocode',
					method: 'POST',
					data: {
						key: 'e3a5024683cf405c94c5f158b05729b6',
						location: `${longitude},${latitude}`,
						extensions: 'all',
						output: 'json'
					},
					success: (res) => {
						console.log('高德逆地理编码返回数据2:', res.data.data);
						// 检查返回状态，高德地图API可能返回"OK"或"1"表示成功
						if ((res.data.data.status === '1' || res.data.data.status === 'OK') && res.data.data.regeocode) {
							const addressComponent = res.data.data.regeocode.addressComponent;
							const formattedAddress = res.data.data.regeocode.formatted_address;
							
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
							console.log('高德地图逆地理编码无结果或状态异常:', res.data.data);
							// 检查是否是配额超限，如果是则尝试备用API
							if (res.data.data.infocode === '10044') {
								console.log('高德地图配额超限，尝试使用腾讯地图逆地理编码');
								this.getReverseGeocodingWithFallback(latitude, longitude, (addressComponent) => {
									if (addressComponent && isDragLocation) {
										// 成功获取到备用API的地址信息
										const dragLocation = {
											name: '拖拽位置',
											address: `${addressComponent.province}${addressComponent.city}${addressComponent.district}${addressComponent.street}`,
											latitude: latitude,
											longitude: longitude,
											distance: this.calculateDistance(latitude, longitude),
											addressComponent: addressComponent
										};

										const dragLocationIndex = this.addressList.findIndex(item => item.name === '拖拽位置');
										if (dragLocationIndex !== -1) {
											this.addressList[dragLocationIndex] = dragLocation;
										} else {
											this.addressList.push(dragLocation);
										}
									} else {
										// 备用API也失败了，添加基础位置信息
										this.addBasicLocationInfo(isDragLocation, latitude, longitude);
									}
								});
								return;
							}
							// 即使逆地理编码失败，也添加位置
							this.addBasicLocationInfo(isDragLocation, latitude, longitude);
						}
					},
					fail: (err) => {
						console.error('高德地图逆地理编码请求失败:', err);
						// 高德地图请求失败时，尝试腾讯地图
						console.log('高德地图请求失败，尝试使用腾讯地图逆地理编码');
						this.getReverseGeocodingWithFallback(latitude, longitude, (addressComponent) => {
							if (addressComponent && isDragLocation) {
								// 成功获取到备用API的地址信息
								const dragLocation = {
									name: '拖拽位置',
									address: `${addressComponent.province}${addressComponent.city}${addressComponent.district}${addressComponent.street}`,
									latitude: latitude,
									longitude: longitude,
									distance: this.calculateDistance(latitude, longitude),
									addressComponent: addressComponent
								};

								const dragLocationIndex = this.addressList.findIndex(item => item.name === '拖拽位置');
								if (dragLocationIndex !== -1) {
									this.addressList[dragLocationIndex] = dragLocation;
								} else {
									this.addressList.push(dragLocation);
								}
							} else {
								// 备用API也失败了，添加基础位置信息
								this.addBasicLocationInfo(isDragLocation, latitude, longitude);
							}
						});
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
			// 计算两点之间的距离（单位：千米）- 4参数版本
			calculateDistanceBetweenPoints(lat1, lon1, lat2, lon2) {
				// 调试输入参数
				console.log('calculateDistance调用参数:', {
					lat1: lat1,
					lon1: lon1,
					lat2: lat2,
					lon2: lon2
				});

				// 检查参数有效性
				if (!lat1 || !lon1 || !lat2 || !lon2 ||
					isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
					console.warn('calculateDistance参数无效:', { lat1, lon1, lat2, lon2 });
					return '0.0';
				}

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

				console.log('calculateDistance计算结果:', distance.toFixed(1) + 'km');

				// 保留一位小数
				return distance.toFixed(1);
			},
			// 处理搜索
			handleSearch() {
				if (!this.searchKeyword) {
					return;
				}

				console.log('�� ========== 开始搜索 ==========');
				console.log('�� 搜索关键词:', this.searchKeyword);
				console.log('�� 当前选择的城市:', this.currentCity);
				console.log('�� 地图中心位置 (latitude/longitude):', this.latitude, this.longitude);
				console.log('�� 当前位置 (currentLocation):', this.currentLocation.latitude, this.currentLocation.longitude);
				console.log('�� ================================');

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
					latitude: this.currentLocation.latitude,
					longitude: this.currentLocation.longitude,
					distance: '0.0'
				}];

				console.log('创建的当前位置项:', this.addressList[0]);

				// 获取当前选择的城市，提取城市名和区县名
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
			
				// 保存原始城市名和区县名（用于后续过滤）
				const originalCityName = cityName;
				const originalDistrictName = districtName;
				
				// �� 新增：从cityListData获取省份信息，避免城市重名
				let provinceName = '';
				if (this.cityListData && this.cityListData.length > 0) {
					for (const province of this.cityListData) {
						if (province.children && Array.isArray(province.children)) {
							for (const city of province.children) {
								if (city.name === cityName) {
									provinceName = province.name;
									console.log('✅ 找到对应省份:', provinceName);
									break;
								}
							}
						}
						if (provinceName) break;
					}
				}
			
				// 处理城市名称，去除后缀（用于API搜索）
				let searchCity = cityName.replace('市', '').replace('特别行政区', '').replace('自治州', '').replace('地区', '').replace('盟', '');
				// �� 如果找到省份，将省份+城市组合作为搜索条件，避免重名
				if (provinceName) {
					// 只去除"省"后缀，保留"自治区"等完整名称，避免像"新疆维吾尔自治区"被错误处理
					searchCity = provinceName.replace('省', '') + searchCity;
					console.log('�� 使用省份+城市组合:', searchCity);
				}
				if (districtName) {
					districtName = districtName.replace('区', '').replace('县', '').replace('市', '');
				}

				console.log('处理后的搜索城市:', searchCity);
				console.log('处理后的区县名:', districtName);
				console.log('地图中心位置:', this.latitude, this.longitude);
				console.log('用户当前位置:', this.currentLocation.latitude, this.currentLocation.longitude);

				// 检查当前位置是否有效
				if (!this.currentLocation.latitude || !this.currentLocation.longitude) {
					console.error('用户当前位置信息缺失，这将导致距离计算失败！');
					console.log('尝试使用地图中心位置作为当前位置');
					this.currentLocation.latitude = this.latitude;
					this.currentLocation.longitude = this.longitude;
					console.log('修正后的用户位置:', this.currentLocation.latitude, this.currentLocation.longitude);
				}
			
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

				// �� 修复：先获取行政区域编码，使用adcode进行精确搜索
				// �� 关键修复：如果有区县，使用"城市名 区县名"作为关键词，避免重名问题
				const districtKeywords = districtName ? `${cityName} ${districtName}` : cityName;
				console.log('�� 查询行政区域编码，关键词:', districtKeywords);
			
				uni.request({
					url: 'https://ccpt.cc111.cn/api/task/district',
					method: 'POST',
					data: {
						key: 'e3a5024683cf405c94c5f158b05729b6',
						keywords: districtKeywords,  // �� 使用"城市名 区县名"避免重名
						subdistrict: 1,  // �� 查询下一级，以便精确匹配区县
						extensions: 'base'
					},
					success: (districtRes) => {
						console.log('�� 行政区域查询返回:', districtRes.data.data);
						
						let adcode = '';
						let useAdcode = false;
						
						// 获取adcode
						if (districtRes.data.data.status === '1' && districtRes.data.data.districts && districtRes.data.data.districts.length > 0) {
							const mainDistrict = districtRes.data.data.districts[0];
							console.log('�� 查询到的主区域:', mainDistrict.name, 'level:', mainDistrict.level);
							
							// 如果有区县，尝试在下级中精确匹配
							if (districtName && mainDistrict.districts && mainDistrict.districts.length > 0) {
								console.log('�� 开始在下级区域中查找:', districtName);
								for (const subDistrict of mainDistrict.districts) {
									console.log('   - 检查:', subDistrict.name, 'adcode:', subDistrict.adcode);
									// 精确匹配区县名（去除"区"、"县"等后缀）
									const subName = subDistrict.name.replace(/区$|县$|市$/,'');
									const targetName = districtName.replace(/区$|县$|市$/,'');
									if (subName === targetName || subDistrict.name === districtName) {
										adcode = subDistrict.adcode;
										console.log('✅ 找到匹配的区县:', subDistrict.name, 'adcode:', adcode);
										break;
									}
								}
							}
							
							// 如果没找到区县adcode，使用城市级别的adcode
							if (!adcode) {
								adcode = mainDistrict.adcode;
								console.log('�� 未找到精确区县，使用上级区域 adcode:', adcode, mainDistrict.name);
							}
							
							useAdcode = true;
							console.log('✅ 最终使用的行政区域编码:', adcode, '将使用adcode进行精确搜索');
						} else {
							console.warn('⚠️ 未获取到行政区域编码，使用城市名称搜索');
						}
						
						// �� 优先使用adcode进行POI搜索，如果无结果再降级使用城市名称
						const searchCityParam = useAdcode ? adcode : originalCityName;
						console.log('�� POI搜索参数 - keywords:', this.searchKeyword, ', city:', searchCityParam, ', 使用adcode:', useAdcode, ', citylimit: true');
						
						uni.request({
							url: `https://ccpt.cc111.cn/api/task/place/search`,
							method: 'POST',
							data: {
								key: 'e3a5024683cf405c94c5f158b05729b6',
								keywords: this.searchKeyword,
								city: searchCityParam,  // 使用adcode或原始城市名
								offset: 20,
								page: 1,
								extensions: 'all',
								citylimit: true,  // 严格限制在城市内搜索
								output: 'json'
							},
							success: (res) => {
								// 隐藏加载提示
								uni.hideLoading();

								console.log('�� 高德地址搜索返回数据:', res.data.data);
								console.log('�� 返回POI数量:', res.data.data.pois ? res.data.data.pois.length : 0);
								
								// �� 如果使用adcode搜索无结果，自动降级使用城市名称重新搜索
								if (useAdcode && (!res.data.data.pois || res.data.data.pois.length === 0) && (res.data.data.status === '1' || res.data.data.status === 'OK')) {
									console.log('⚠️ adcode搜索无结果，降级使用城市级别重新搜索（去掉区县限制）');
									uni.showLoading({
										title: '搜索中...',
										mask: true
									});
									
									// �� 关键修复：降级时使用城市名（不包含区县），并设置 citylimit=true
									uni.request({
										url: `https://ccpt.cc111.cn/api/task/place/search`,
										method: 'POST',
										data: {
											key: 'e3a5024683cf405c94c5f158b05729b6',
											keywords: this.searchKeyword,
											city: originalCityName,  // 使用城市名（不含区县）
											offset: 20,
											page: 1,
											extensions: 'all',
											citylimit: true,  // 仍然限制在城市内，但允许其他区县的结果
											output: 'json'
										},
										success: (retryRes) => {
											uni.hideLoading();
											console.log('�� 降级搜索返回数据:', retryRes.data.data);
											console.log('�� 降级搜索返回POI数量:', retryRes.data.pois ? retryRes.data.data.pois.length : 0);
											// 降级搜索时进行过滤，优先显示原区县的结果
											this.handleSearchResults(retryRes.data.data, originalCityName, originalDistrictName, false);
										},
										fail: (retryErr) => {
											uni.hideLoading();
											console.error('❌ 降级搜索失败，切换到腾讯地图:', retryErr);
											uni.showLoading({
												title: '努力搜索中...',
												mask: true
											});
											this.searchWithTencentMap(originalCityName);
										}
									});
									return;
								}
								
								// 正常处理搜索结果
								// �� 如果使用adcode搜索，不需要二次过滤；否则需要过滤
								console.log('�� 使用', useAdcode ? 'adcode' : '城市名', '搜索，skipFilter:', useAdcode);
								this.handleSearchResults(res.data.data, originalCityName, originalDistrictName, useAdcode);
							},
							fail: (err) => {
								console.error('高德地图搜索请求失败，切换到腾讯地图:', err);
								// 显示加载提示
								uni.showLoading({
									title: '努力搜索中...',
									mask: true
								});
								// 高德地图请求失败时，切换到腾讯地图搜索
								this.searchWithTencentMap(originalCityName);
							}
						});
					},
					fail: (err) => {
						console.error('获取行政区域编码失败，使用原始城市名称搜索:', err);
						// 降级方案：直接使用原始城市名称搜索
						uni.request({
							url: `https://ccpt.cc111.cn/api/task/place/search`,
							method: 'POST',
							data: {
								key: 'e3a5024683cf405c94c5f158b05729b6',
								keywords: this.searchKeyword,
								city: originalCityName,  // 使用原始城市名而不是处理后的名称
								offset: 20,
								page: 1,
								extensions: 'all',
								citylimit: true,
								output: 'json'
							},
							success: (res) => {
								// 隐藏加载提示
								uni.hideLoading();

								console.log('高德测试地址搜索返回数据2:', res.data);
								if ((res.data.data.status === '1' || res.data.data.status === 'OK') && res.data.data.pois && res.data.data.pois.length > 0) {
									const searchResults = res.data.data.pois.map(item => {
										const lat2 = parseFloat(item.location.split(',')[1]);
										const lon2 = parseFloat(item.location.split(',')[0]);

										if (!this.isValidLatLng(lat2, lon2)) {
											console.warn('搜索结果中的经纬度无效:', lat2, lon2, item.name);
											return null;
										}

										let distance = '0.0';
										if (this.currentLocation.latitude && this.currentLocation.longitude) {
											distance = this.calculateDistanceBetweenPoints(
												this.currentLocation.latitude,
												this.currentLocation.longitude,
												lat2,
												lon2
											);
										}

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
									}).filter(item => item !== null);

									this.addressList = [...this.addressList, ...searchResults];
									uni.setStorageSync('addressList', JSON.stringify(this.addressList));
									uni.setStorageSync('currentCity', this.currentCity);
									uni.setStorageSync('searchKeyword', this.searchKeyword);

									uni.navigateTo({
										url: '/pages/index/publish/map/search-results?type=' + this.addressType + '&latitude=' + this.currentLocation.latitude + '&longitude=' + this.currentLocation.longitude
									});
								} else {
									if(res.data.info === 'USER_DAILY_QUERY_OVER_LIMIT'){
										console.log('高德地图配额已达上限，切换到腾讯地图搜索');
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
								uni.showLoading({
									title: '努力搜索中...',
									mask: true
								});
								this.searchWithTencentMap(searchCity);
							}
						});
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
									if (that.currentLocation.latitude && that.currentLocation.longitude) {
										console.log('百度地图搜索-计算距离:', {
											from: {
												lat: that.currentLocation.latitude,
												lon: that.currentLocation.longitude
											},
											to: {
												lat: lat2,
												lon: lon2
											}
										});
										distance = that.calculateDistanceBetweenPoints(
											that.currentLocation.latitude,
											that.currentLocation.longitude,
											lat2,
											lon2
										);
										console.log('百度地图搜索-计算结果距离:', distance, 'km');
									} else {
										console.warn('百度地图搜索-用户当前位置信息缺失，无法计算距离');
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
								url: '/pages/index/publish/map/search-results?type=' + that.addressType + '&latitude=' + that.currentLocation.latitude + '&longitude=' + that.currentLocation.longitude
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
							// 优化：不在搜索阶段进行逆地理编码，减少API消耗
							// 直接使用搜索返回的地址信息，在用户选择时再进行详细解析
							const searchResults = res.data.map(item => {
								// 腾讯地图返回的经纬度格式为 {lat: xx, lng: xx}
								const lat2 = parseFloat(item.location.lat);
								const lon2 = parseFloat(item.location.lng);

								// 验证经纬度是否有效
								if (!this.isValidLatLng(lat2, lon2)) {
									console.warn('搜索结果中的经纬度无效:', lat2, lon2, item.title);
									return null; // 跳过无效的结果
								}

								// 计算与当前位置的距离
								let distance = '0.0';
								if (this.currentLocation.latitude && this.currentLocation.longitude) {
									console.log('腾讯地图搜索-计算距离:', {
										from: {
											lat: this.currentLocation.latitude,
											lon: this.currentLocation.longitude
										},
										to: {
											lat: lat2,
											lon: lon2
										}
									});
									distance = this.calculateDistanceBetweenPoints(
										this.currentLocation.latitude,
										this.currentLocation.longitude,
										lat2,
										lon2
									);
									console.log('腾讯地图搜索-计算结果距离:', distance, 'km');
								} else {
									console.warn('腾讯地图搜索-用户当前位置信息缺失，无法计算距离');
								}

								// 处理地址信息，优先使用address，如果没有则使用title
								let address_new = item.title;
								if (item.address && item.address !== '') {
									address_new = item.address;
								}

								return {
									name: item.title,
									address: address_new,
									latitude: lat2,
									longitude: lon2,
									distance: distance,
									// 保存原始数据以便后续详细解析
									rawData: item
								};
							}).filter(item => item !== null); // 过滤掉无效的结果

							if (searchResults.length > 0) {
								// 合并搜索结果到地址列表
								this.addressList = [...this.addressList, ...searchResults];

								// 将地址列表和当前城市保存到本地存储
								uni.setStorageSync('addressList', JSON.stringify(this.addressList));
								uni.setStorageSync('currentCity', this.currentCity);
								// 保存搜索关键词到本地存储
								uni.setStorageSync('searchKeyword', this.searchKeyword);

								// 跳转到搜索结果页面
								uni.navigateTo({
									url: '/pages/index/publish/map/search-results?type=' + this.addressType + '&latitude=' + this.currentLocation.latitude + '&longitude=' + this.currentLocation.longitude
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
					url: '/pages/index/publish/map/search-results?type=' + this.addressType + '&latitude=' + this.currentLocation.latitude + '&longitude=' + this.currentLocation.longitude
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
			// 			key: '585057b4c154ec791373eb2e18032188',
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

								// 检查地址组件是否存在，如果不存在则尝试重新获取
								if (!selectedLocation.addressComponent) {
									console.log('地址组件缺失，尝试使用腾讯地图重新获取地址信息');
									this.getReverseGeocodingWithFallback(selectedLocation.latitude, selectedLocation.longitude, (addressComponent) => {
										if (addressComponent) {
											selectedLocation.addressComponent = addressComponent;
											this.updateFormDataWithLocation(selectedLocation);
										} else {
											uni.showToast({
												title: '所有地图API都无法获取地址信息，请稍后重试',
												icon: 'none',
												duration: 3000
											});
										}
									});
									return;
								}

								// 使用新的统一方法更新表单数据
								this.updateFormDataWithLocation(selectedLocation);
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
				console.log('��️ 选择的城市:', city);
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
					console.log('解析城市和区县:', { cityName, districtName });
					// 查找cityList区县经纬度
					for (const province of cityList) {
						for (const c of province.children || []) {
							if (c.name === cityName) {
								for (const d of c.children || []) {
									if (d.name === districtName) {
										if (d.latitude && d.longitude) {
											districtLat = parseFloat(d.latitude);
											districtLng = parseFloat(d.longitude);
											useDistrictLatLng = true;
											console.log('✅ 从cityList获取到区县经纬度:', { lat: districtLat, lng: districtLng });
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

				// 修复：同时更新 selectedCity 和 currentCity，确保与城市选择页面的行为一致
				uni.setStorageSync('selectedCity', city);
				uni.setStorageSync('currentCity', city);
				console.log('城市已保存到本地存储 (selectedCity & currentCity):', city);

				// 触发区域选择完成事件，通知发布任务页面重新获取服务商信息
				uni.$emit('areaSelected', {
					city: city,
					districtId: null
				});
				console.log('�� 触发区域选择完成事件');

				if (useDistrictLatLng) {
					// 验证从cityList获取的经纬度是否有效
					if (this.isValidLatLng(districtLat, districtLng)) {
						this.latitude = districtLat;
						this.longitude = districtLng;
						// �� 关键修复：同时更新 currentLocation，确保后续距离计算使用新的区县中心点
						this.currentLocation.latitude = districtLat;
						this.currentLocation.longitude = districtLng;
						console.log('✅ 已更新地图中心点和当前位置:', { lat: districtLat, lng: districtLng });
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
			async updateMapByCity(city) {
				console.log('��️ 开始更新地图中心点，输入城市:', city);

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

				// �� 优先从 cityListData 获取区县经纬度
				if (this.cityListData && this.cityListData.length > 0 && extractedCityName && districtName) {
					for (const province of this.cityListData) {
						for (const cityItem of (province.children || [])) {
							if (cityItem.name === extractedCityName) {
								for (const districtItem of (cityItem.children || [])) {
									if (districtItem.name === districtName) {
										if (districtItem.latitude && districtItem.longitude) {
											const lat = parseFloat(districtItem.latitude);
											const lng = parseFloat(districtItem.longitude);
											if (this.isValidLatLng(lat, lng)) {
												this.latitude = lat;
												this.longitude = lng;
												this.currentLocation.latitude = lat;
												this.currentLocation.longitude = lng;
												console.log('✅ 从cityListData获取到区县经纬度并更新地图:', { lat, lng });
												this.updateMarkers();
												return;
											}
										}
									}
								}
							}
						}
					}
					console.log('⚠️ 在cityListData中未找到匹配的区县经纬度，尝试使用高德地图API');
				}

				// �� 使用高德地图API获取准确位置
				try {
					console.log('�� 使用高德地图API获取城市:', city);
					const res = await uni.request({
						url: 'https://restapi.amap.com/v3/geocode/geo',
						data: {
							key: 'e3a5024683cf405c94c5f158b05729b6',
							address: city,
							output: 'json'
						}
					});

					if (res.data && res.data.status === '1' && res.data.geocodes && res.data.geocodes.length > 0) {
						const location = res.data.geocodes[0].location;
						const [longitude, latitude] = location.split(',').map(Number);

						if (this.isValidLatLng(latitude, longitude)) {
							this.latitude = latitude;
							this.longitude = longitude;
							this.currentLocation.latitude = latitude;
							this.currentLocation.longitude = longitude;
							console.log('✅ 从高德API获取到城市经纬度:', { latitude, longitude, address: res.data.geocodes[0].formatted_address });
							this.updateMarkers();
							return;
						}
					}
					console.log('⚠️ 高德API未返回有效结果，尝试使用areaData');
				} catch (err) {
					console.error('❌ 高德API请求失败:', err);
				}

				// 降级方案：使用 areaData
				if (!this.areaData) {
					console.error('❌ 区域数据未加载');
					return;
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
								// �� 修复：同时更新 currentLocation
								this.currentLocation.latitude = latitude;
								this.currentLocation.longitude = longitude;
								console.log('✅ [areaData] 已更新地图中心点和当前位置');
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
										// �� 修复：同时更新 currentLocation
										this.currentLocation.latitude = latitude;
										this.currentLocation.longitude = longitude;
										console.log('✅ [areaData-区县] 已更新地图中心点和当前位置');
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
										// �� 修复：同时更新 currentLocation
										this.currentLocation.latitude = latitude;
										this.currentLocation.longitude = longitude;
										console.log('✅ [areaData-仅区县] 已更新地图中心点和当前位置');
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
				// �� 修复：默认位置也要更新 currentLocation
				this.currentLocation.latitude = 30.0488;
				this.currentLocation.longitude = 103.8485;
				console.log('⚠️ 使用默认位置（成都市）');
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
					url: 'https://ccpt.cc111.cn/api/task/geocode',
					method: 'POST',
					data: {
						key: 'e3a5024683cf405c94c5f158b05729b6',
						location: `${longitude},${latitude}`,
						extensions: 'base',
						output: 'json'
					},
					success: (res) => {
						console.log('逆地理编码返回数据:', res.data.data);
						if ((res.data.data.status === '1' || res.data.data.status === 'OK') && res.data.data.regeocode) {
							const addressComponent = res.data.data.regeocode.addressComponent;
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
									if (res.data.data.regeocode.formatted_address) {
										const formattedAddress = res.data.data.regeocode.formatted_address;
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
							console.error('逆地理编码返回数据异常:', res.data.data);
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
					console.log('�� getCityLocation - 开始获取城市位置，城市名:', cityName);
					console.log('�� cityListData长度:', this.cityListData ? this.cityListData.length : 0);
					
					// �� 优先尝试从 cityListData 获取区县的精确经纬度
					if (this.cityListData && this.cityListData.length > 0 && cityName.includes(' · ')) {
						const parts = cityName.split(' · ');
						const extractedCityName = parts[0];
						const districtName = parts[1];
						console.log('�� 查找区县经纬度 - 城市:', extractedCityName, '区县:', districtName);
						
						for (const province of this.cityListData) {
							for (const cityItem of (province.children || [])) {
								if (cityItem.name === extractedCityName) {
									console.log('✅ 找到匹配的城市:', extractedCityName);
									for (const districtItem of (cityItem.children || [])) {
										if (districtItem.name === districtName) {
											console.log('✅ 找到匹配的区县:', districtName, '经纬度:', districtItem.latitude, districtItem.longitude);
											if (districtItem.latitude && districtItem.longitude) {
												const lat = parseFloat(districtItem.latitude);
												const lng = parseFloat(districtItem.longitude);
												if (this.isValidLatLng(lat, lng)) {
													this.latitude = lat;
													this.longitude = lng;
													this.currentLocation.latitude = lat;
													this.currentLocation.longitude = lng;
													this.scale = 14; // 区县级别使用更大的缩放
													this.updateMarkers();
													console.log('✅ 从cityListData成功设置区县经纬度:', { lat, lng });
													return;
												}
											}
										}
									}
								}
							}
						}
						console.log('⚠️ 在cityListData中未找到匹配的区县，尝试使用高德地图API');
					}
					
					// �� 修改：不再使用providerInfo，直接使用高德地图API获取准确位置
					console.log('�� 使用高德地图API获取城市:', cityName);
					const res = await uni.request({
						url: 'https://restapi.amap.com/v3/geocode/geo',
						data: {
							key: 'e3a5024683cf405c94c5f158b05729b6',
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
							this.scale = 12;
							this.updateMarkers();
							console.log('✅ 从高德API获取到经纬度:', { latitude, longitude, address: res.data.geocodes[0].formatted_address });
						} else {
							console.warn('⚠️ 从API获取的经纬度无效:', latitude, longitude);
							// 使用默认坐标
							this.latitude = 30.5925;
							this.longitude = 114.3055;
							this.currentLocation.latitude = 30.5925;
							this.currentLocation.longitude = 114.3055;
							this.scale = 12;
							this.updateMarkers();
						}
					} else {
						// 如果获取失败，使用武汉市的默认坐标
						console.log('⚠️ 高德API获取失败，使用默认坐标');
						this.latitude = 30.5925;
						this.longitude = 114.3055;
						this.currentLocation.latitude = 30.5925;
						this.currentLocation.longitude = 114.3055;
						this.scale = 12;
						this.updateMarkers();
					}
					
				} catch (err) {
					console.error('❌ 获取城市位置失败:', err);
					// 发生错误时使用武汉市的默认坐标
					this.latitude = 30.5925;
					this.longitude = 114.3055;
					this.currentLocation.latitude = 30.5925;
					this.currentLocation.longitude = 114.3055;
					this.scale = 12;
					this.updateMarkers();

					uni.showToast({
						title: '获取位置信息失败',
						icon: 'none'
					});
				}
			},

			// 备用逆地理编码方法：依次尝试腾讯地图、百度地图
			getReverseGeocodingWithFallback(latitude, longitude, callback) {
				console.log('开始备用逆地理编码，经纬度:', latitude, longitude);

				// 先尝试腾讯地图逆地理编码
				this.qqmapsdk.reverseGeocoder({
					location: {
						latitude: latitude,
						longitude: longitude
					},
					success: (res) => {
						console.log('腾讯地图逆地理编码成功:', res);
						if (res.status === 0 && res.result && res.result.address_component) {
							const addressComponent = res.result.address_component;
							callback({
								province: addressComponent.province,
								city: addressComponent.city,
								district: addressComponent.district,
								township: addressComponent.street,
								street: addressComponent.street
							});
							return;
						}

						// 腾讯地图失败，尝试百度地图
						console.log('腾讯地图逆地理编码无有效结果，尝试百度地图');
						this.getBaiduReverseGeocoding(latitude, longitude, callback);
					},
					fail: (error) => {
						console.error('腾讯地图逆地理编码失败:', error);
						// 腾讯地图失败，尝试百度地图
						this.getBaiduReverseGeocoding(latitude, longitude, callback);
					}
				});
			},

			// 百度地图逆地理编码
			getBaiduReverseGeocoding(latitude, longitude, callback) {
				console.log('开始百度地图逆地理编码');

				// 百度地图需要先将经纬度转换为百度坐标系
				const bmap = new this.BMap.BMapWX({
					ak: this.baidumapkey
				});

				bmap.regeocoding({
					location: latitude + ',' + longitude,
					success: (data) => {
						console.log('百度地图逆地理编码成功:', data);
						if (data.status === 0 && data.result && data.result.addressComponent) {
							const addressComponent = data.result.addressComponent;
							callback({
								province: addressComponent.province,
								city: addressComponent.city,
								district: addressComponent.district,
								township: addressComponent.town || addressComponent.district,
								street: addressComponent.street
							});
						} else {
							console.log('百度地图逆地理编码无有效结果');
							callback(null);
						}
					},
					fail: (error) => {
						console.error('百度地图逆地理编码失败:', error);
						callback(null);
					}
				});
			},

			// 计算两点间距离
			calculateDistance(latitude, longitude) {
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
				return (distanceInMeters / 1000).toFixed(1);
			},

			// 添加基础位置信息
			addBasicLocationInfo(isDragLocation, latitude, longitude) {
				if (isDragLocation) {
					const distance = this.calculateDistance(latitude, longitude);

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
					// 当前位置的处理
					this.addressList.unshift({
						name: '当前位置',
						address: `${longitude},${latitude}`,
						latitude: latitude,
						longitude: longitude,
						distance: '0.0'
					});
				}
			},

		// 【新增方法】根据城市和区县名称查找并更新 district_id
		async updateDistrictIdByAddress(cityName, districtName) {
			try {
				console.log('�� 开始查找 district_id，城市:', cityName, '区县:', districtName);
				
				// 如果没有城市列表数据，先获取
				if (!this.cityListData || this.cityListData.length === 0) {
					console.log('�� 城市列表数据为空，正在获取...');
					const res = await this.$request('service/zone', {}, 'POST');
					if (res.code === 200 && res.data) {
						this.cityListData = res.data;
						console.log('✅ 城市列表数据获取成功');
					} else {
						console.error('❌ 获取城市列表数据失败:', res.msg);
						return;
					}
				}

				// 遍历城市列表查找匹配的 district_id
				let foundDistrictId = null;
				let foundCityName = null;
				
				for (const province of this.cityListData) {
					if (province.children && Array.isArray(province.children)) {
						for (const city of province.children) {
							// 匹配城市名
							if (city.name === cityName) {
								foundCityName = city.name;
								
								// 在该城市下查找匹配的区县
								if (city.children && Array.isArray(city.children)) {
									for (const district of city.children) {
										if (district.name === districtName) {
											foundDistrictId = district.district_id;
											console.log('✅ 找到匹配的区县，district_id:', foundDistrictId);
											break;
										}
									}
								}
								
								if (foundDistrictId) break;
							}
						}
					}
					if (foundDistrictId) break;
				}

				if (foundDistrictId) {
					// 更新本地存储
					const fullCityName = `${cityName} · ${districtName}`;
					uni.setStorageSync('selectedCity', fullCityName);
					uni.setStorageSync('selectedDistrictId', foundDistrictId);
					console.log('✅ 已更新本地存储:', {
						selectedCity: fullCityName,
						selectedDistrictId: foundDistrictId
					});

					// 获取发布页面实例
					const pages = getCurrentPages();
					const publishPage = pages[pages.length - 2];
					if (publishPage && publishPage.$vm) {
						// 更新发布页面的区域数据
						publishPage.$vm.selectedCity = fullCityName;
						publishPage.$vm.selectedDistrictId = foundDistrictId;
						
						// 触发重新获取服务商信息
						console.log('�� 触发重新获取服务商信息');
						if (typeof publishPage.$vm.getProviderInfo === 'function') {
							await publishPage.$vm.getProviderInfo();
							console.log('✅ 服务商信息已更新');
						}
					}
				} else {
					console.warn('⚠️ 未找到匹配的 district_id，城市:', cityName, '区县:', districtName);
					uni.showToast({
						title: '所选地址不在服务范围内',
						icon: 'none',
						duration: 2000
					});
				}
			} catch (error) {
				console.error('❌ 更新 district_id 失败:', error);
			}
		},

		// 使用地址信息更新表单数据
		async updateFormDataWithLocation(selectedLocation) {
				const pages = getCurrentPages();
				const publishPage = pages[pages.length - 2];
				if (publishPage) {
					if (this.addressType === 'start') {
					publishPage.$vm.formData.address = selectedLocation.address;
					publishPage.$vm.formData.latitude = selectedLocation.latitude;
					publishPage.$vm.formData.longitude = selectedLocation.longitude;
					publishPage.$vm.formData.distance = selectedLocation.distance;

					console.log('地址组件信息:', selectedLocation.addressComponent);

					// 【修复】选择地图位置时，应该根据实际位置的地理编码结果来设置省市区
					// 而不是使用之前选择的 selectedCity
					let provinceValue = '';
					let cityValue = '';
					let districtValue = '';

					// 直接使用地址组件的信息
					if (selectedLocation.addressComponent) {
						provinceValue = selectedLocation.addressComponent.province || '';
						
						// 针对重庆市这种特殊区域
						if (Array.isArray(selectedLocation.addressComponent.city) && selectedLocation.addressComponent.city.length == 0) {
							cityValue = selectedLocation.addressComponent.province;
						} else {
							cityValue = selectedLocation.addressComponent.city || '';
						}
						
						if (Array.isArray(selectedLocation.addressComponent.district) && selectedLocation.addressComponent.district.length == 0) {
							districtValue = selectedLocation.addressComponent.township || '';
						} else {
							districtValue = selectedLocation.addressComponent.district || '';
						}
					}

					// 设置表单数据
					publishPage.$vm.formData.province = provinceValue;
					publishPage.$vm.formData.city = cityValue;
					publishPage.$vm.formData.district = districtValue;

					console.log('最终设置的省市区:', {
						province: provinceValue,
						city: cityValue,
						district: districtValue
					});

					// 修复 万宁市属于行政区，导致无法识别系统区域的问题
					if (publishPage.$vm.formData.province === '海南省' && publishPage.$vm.formData.city === '海南省') {
						publishPage.$vm.formData.city = selectedLocation.addressComponent.district;
						publishPage.$vm.formData.district = selectedLocation.addressComponent.township;
						// 更新变量以便后续使用
						cityValue = selectedLocation.addressComponent.district;
						districtValue = selectedLocation.addressComponent.township;
					}

					// 【关键修复】根据省市区查找对应的 district_id 并更新本地存储
					await this.updateDistrictIdByAddress(cityValue, districtValue);
					
					// 【修复】根据实际选择的地址更新 selectedCity
					if (cityValue && districtValue) {
						const newSelectedCity = `${cityValue} · ${districtValue}`;
						uni.setStorageSync('selectedCity', newSelectedCity);
						console.log('✅ 已更新 selectedCity 为实际选择的地址:', newSelectedCity);
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

					console.log('地址选择 - 地址组件信息:', selectedLocation.addressComponent);

					// 【修复】选择地图位置时，应该根据实际位置的地理编码结果来设置省市区
					// 而不是使用之前选择的 selectedCity
					let provinceValue = '';
					let cityValue = '';
					let districtValue = '';

					// 直接使用地址组件的信息
					if (selectedLocation.addressComponent) {
						provinceValue = selectedLocation.addressComponent.province || '';
						
						// 针对重庆市这种特殊区域
						if (Array.isArray(selectedLocation.addressComponent.city) && selectedLocation.addressComponent.city.length == 0) {
							cityValue = selectedLocation.addressComponent.province;
						} else {
							cityValue = selectedLocation.addressComponent.city || '';
						}
						
						if (Array.isArray(selectedLocation.addressComponent.district) && selectedLocation.addressComponent.district.length == 0) {
							districtValue = selectedLocation.addressComponent.township || '';
						} else {
							districtValue = selectedLocation.addressComponent.district || '';
						}
					}

					// 设置表单数据
					publishPage.$vm.formData.province = provinceValue;
					publishPage.$vm.formData.city = cityValue;
					publishPage.$vm.formData.district = districtValue;

					console.log('地址选择 - 最终设置的省市区:', {
						province: provinceValue,
						city: cityValue,
						district: districtValue
					});

					// 修复 万宁市属于行政区，导致无法识别系统区域的问题
					if (publishPage.$vm.formData.province === '海南省' && publishPage.$vm.formData.city === '海南省') {
						publishPage.$vm.formData.city = selectedLocation.addressComponent.district;
						publishPage.$vm.formData.district = selectedLocation.addressComponent.township;
						// 更新变量以便后续使用
						cityValue = selectedLocation.addressComponent.district;
						districtValue = selectedLocation.addressComponent.township;
					}

					// 【关键修复】根据省市区查找对应的 district_id 并更新本地存储
					await this.updateDistrictIdByAddress(cityValue, districtValue);
					
					// 【修复】根据实际选择的地址更新 selectedCity
					if (cityValue && districtValue) {
						const newSelectedCity = `${cityValue} · ${districtValue}`;
						uni.setStorageSync('selectedCity', newSelectedCity);
						console.log('✅ 已更新 selectedCity 为实际选择的地址:', newSelectedCity);
					}
			}

			// 返回上一页
			uni.navigateBack();
				}
			},

		// 【新增方法】统一处理搜索结果
		handleSearchResults(responseData, originalCityName, originalDistrictName, skipFilter = false) {
			console.log('�� 处理搜索结果 - 不进行POI过滤');
			
			// 检查返回状态
			if ((responseData.status === '1' || responseData.status === 'OK') && responseData.pois && responseData.pois.length > 0) {
				const searchResults = responseData.pois;
				console.log(`✅ 搜索到 ${searchResults.length} 个结果，不进行过滤`);
				
				// 处理搜索结果
				const processedResults = searchResults.map(item => {
					// 解析经纬度
					const lat2 = parseFloat(item.location.split(',')[1]);
					const lon2 = parseFloat(item.location.split(',')[0]);

					// 验证经纬度是否有效
					if (!this.isValidLatLng(lat2, lon2)) {
						console.warn('搜索结果中的经纬度无效:', lat2, lon2, item.name);
						return null;
					}

					// 计算与当前位置的距离
					let distance = '0.0';
					if (this.currentLocation.latitude && this.currentLocation.longitude) {
						console.log('�� 计算距离 - 当前位置:', {
							lat: this.currentLocation.latitude,
							lng: this.currentLocation.longitude
						}, '目标位置:', {
							lat: lat2,
							lng: lon2
						});
						distance = this.calculateDistanceBetweenPoints(
							this.currentLocation.latitude,
							this.currentLocation.longitude,
							lat2,
							lon2
						);
						console.log('�� 计算结果:', distance, 'km');
					} else {
						console.warn('⚠️ 当前位置信息缺失，无法计算距离');
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
				}).filter(item => item !== null);

				console.log(`✅ 最终搜索结果数量: ${processedResults.length}`);

				// 合并搜索结果到地址列表
				this.addressList = [...this.addressList, ...processedResults];

				// 调试：检查保存前的距离数据
				console.log('高德地图-保存前的地址列表:', this.addressList);
				this.addressList.forEach((item, index) => {
					console.log(`高德地图-地址${index}: ${item.name}, 距离: ${item.distance}`);
				});

				// 将地址列表和当前城市保存到本地存储
				uni.setStorageSync('addressList', JSON.stringify(this.addressList));
				uni.setStorageSync('currentCity', this.currentCity);
				// 保存搜索关键词到本地存储
				uni.setStorageSync('searchKeyword', this.searchKeyword);

				// 跳转到搜索结果页面
				uni.navigateTo({
					url: '/pages/index/publish/map/search-results?type=' + this.addressType + '&latitude=' + this.currentLocation.latitude + '&longitude=' + this.currentLocation.longitude
				});
			} else {
				console.log('搜索结果:', responseData);
				if(responseData.info === 'USER_DAILY_QUERY_OVER_LIMIT'){
					console.log('高德地图配额已达上限，切换到腾讯地图搜索');
					uni.showLoading({
						title: '努力搜索中...',
						mask: true
					});
					this.searchWithTencentMap(originalCityName);
				} else {
					console.log('地址搜索无结果或状态异常:', responseData);
					uni.showToast({
						title: '未找到相关地址',
						icon: 'none'
					});
				}
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
			margin-right: 20rpx;
		}

		.search-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0 24rpx;
			height: 72rpx;
			background-color: #2492f2;
			border-radius: 36rpx;
			cursor: pointer;
			transition: background-color 0.3s;

			.search-text {
				font-size: 28rpx;
				color: #ffffff;
				font-weight: 500;
			}

			&:hover {
				background-color: #1976d2;
			}

			&:active {
				background-color: #1565c0;
				transform: scale(0.95);
			}
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