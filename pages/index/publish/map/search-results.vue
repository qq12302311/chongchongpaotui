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
				<view class="search-btn" @click="handleSearch">
					<text class="search-text">搜索</text>
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
					<view class="address-distance">{{ item.distance === '--' ? '--' : (item.distance || '0.0') }}km</view>
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

		<!-- 悬浮聊天图标 -->
		<FloatingChatIconUser />
	</view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import FloatingChatIconUser from '@/components/FloatingChatIconUser/index.vue'
import { provinceCityMap, cityCoordinates, updateMapByCity } from '@/utils/cityData.js'
var QQMapWX = require('@/utils/qqmap-wx-jssdk.js');
var qqmapsdk;

export default {
	components: {
		NavBar,
		FloatingChatIconUser
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
			const filtered = this.addressList.filter(item => item.name !== '当前位置');
			console.log('过滤后的地址列表:', filtered);
			filtered.forEach((item, index) => {
				console.log(`过滤后地址${index}: ${item.name}, 距离: ${item.distance}`);
			});
			return filtered;
		}
	},
	onLoad(options) {
		// 实例化腾讯地图API核心类
		qqmapsdk = new QQMapWX({
			key: 'NQABZ-2CTWJ-IAJFD-DERJV-Y55LQ-IVB4J'
		});

		// 获取导航栏高度
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
		this.navBarHeight = menuButtonInfo.bottom + 8;

		// 获取地址类型
		this.addressType = options.type || 'home';

		// 获取传入的位置参数
		console.log('传入的位置参数:', options);
		if (options.latitude && options.longitude) {
			this.currentLocation.latitude = parseFloat(options.latitude);
			this.currentLocation.longitude = parseFloat(options.longitude);
			console.log('使用传入的位置:', this.currentLocation);
		} else {
			// 尝试从本地存储获取位置信息
			this.getLocationFromStorage();
		}

		// 从本地存储获取搜索关键词
		const searchKeyword = uni.getStorageSync('searchKeyword');
		if (searchKeyword) {
			this.searchKeyword = searchKeyword;
		}

		// 从本地存储获取地址列表
		const addressList = uni.getStorageSync('addressList');
		if (addressList) {
			this.addressList = JSON.parse(addressList);
			console.log('从本地存储加载的地址列表:', this.addressList);
			// 检查距离数据
			this.addressList.forEach((item, index) => {
				console.log(`地址${index}: ${item.name}, 距离: ${item.distance}`);
			});
		}

		// 注释掉重复的加载逻辑
		// const storedAddressList = uni.getStorageSync('addressList');
		// if (storedAddressList) {
		// 	this.addressList = JSON.parse(storedAddressList);
		// }

		const storedCity = uni.getStorageSync('currentCity');
		if (storedCity) {
			this.currentCity = storedCity;
		}

		// 确保当前位置信息完整，如果没有则重新设置
		console.log('最终的当前位置信息:', this.currentLocation);
		if (!this.currentLocation.latitude || !this.currentLocation.longitude) {
			console.warn('搜索结果页面 - 当前位置信息不完整，尝试重新获取');
			this.getLocationFromStorage();
			console.log('重新获取后的位置信息:', this.currentLocation);
		}
	},
	methods: {
		// 从本地存储获取位置信息
		getLocationFromStorage() {
			try {
				// 尝试从providerInfo获取位置
				const providerInfo = uni.getStorageSync('providerInfo');
				if (providerInfo && providerInfo.info && providerInfo.info.latitude && providerInfo.info.longitude) {
					this.currentLocation.latitude = parseFloat(providerInfo.info.latitude);
					this.currentLocation.longitude = parseFloat(providerInfo.info.longitude);
					console.log('从providerInfo获取位置:', this.currentLocation);
					return;
				}

				// 尝试从其他可能的位置信息存储获取
				const userLocation = uni.getStorageSync('userLocation');
				if (userLocation && userLocation.latitude && userLocation.longitude) {
					this.currentLocation.latitude = parseFloat(userLocation.latitude);
					this.currentLocation.longitude = parseFloat(userLocation.longitude);
					console.log('从userLocation获取位置:', this.currentLocation);
					return;
				}

				// 如果都没有获取到，使用默认位置并提示用户
				console.warn('无法获取当前位置信息，距离计算将不准确');
			} catch (error) {
				console.error('获取位置信息失败:', error);
			}
		},

		// 获取当前位置（备用方法）
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
			
			// 保存原始城市名和区县名（用于后续过滤）
			const originalCityName = cityName;
			const originalDistrictName = districtName;
			
			// �� 新增：从cityListData获取省份信息，避免城市重名
			const cityListData = uni.getStorageSync('cityList');
			let provinceName = '';
			if (cityListData && cityListData.length > 0) {
				for (const province of cityListData) {
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
				searchCity = provinceName.replace('省', '').replace('自治区', '').replace('特别行政区', '') + searchCity;
				console.log('�� 使用省份+城市组合:', searchCity);
			}
			if (districtName) {
				districtName = districtName.replace('区', '').replace('县', '').replace('市', '');
			}
			
			console.log('处理后的搜索城市:', searchCity);
			console.log('处理后的区县名:', districtName);
			console.log('用户当前位置:', this.currentLocation.latitude, this.currentLocation.longitude);

			// 检查当前位置是否有效
			if (!this.currentLocation.latitude || !this.currentLocation.longitude) {
				console.error('用户当前位置信息缺失，这将导致距离计算失败！');
				console.log('尝试从本地存储重新获取');
				this.getLocationFromStorage();
			}
			
			// �� 修复：先获取行政区域编码，使用adcode进行精确搜索
			// �� 关键修复：如果有区县，使用"城市名 区县名"作为关键词，避免重名问题
			const districtKeywords = originalDistrictName ? `${originalCityName} ${originalDistrictName}` : originalCityName;
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
						if (originalDistrictName && mainDistrict.districts && mainDistrict.districts.length > 0) {
							console.log('�� 开始在下级区域中查找:', originalDistrictName);
							for (const subDistrict of mainDistrict.districts) {
								console.log('   - 检查:', subDistrict.name, 'adcode:', subDistrict.adcode);
								// 精确匹配区县名（去除"区"、"县"等后缀）
								const subName = subDistrict.name.replace(/区$|县$|市$/,'');
								const targetName = originalDistrictName.replace(/区$|县$|市$/,'');
								if (subName === targetName || subDistrict.name === originalDistrictName) {
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
							uni.hideLoading()

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
										console.log('�� 降级搜索返回POI数量:', retryRes.data.data.pois ? retryRes.data.data.pois.length : 0);
										// 处理降级搜索结果
										this.handleSearchResults(retryRes, originalCityName, originalDistrictName, false);
									},
									fail: (retryErr) => {
										uni.hideLoading();
										console.error('❌ 降级搜索失败，切换到腾讯地图:', retryErr);
										uni.showLoading({
											title: '努力搜索中...',
											mask: true
										});
										this.searchWithTencentMap(searchCity);
									}
								});
								return;
							}
							
							// 正常处理搜索结果
							console.log('�� 使用', useAdcode ? 'adcode' : '城市名', '搜索，skipFilter:', useAdcode);
							this.handleSearchResults(res, originalCityName, originalDistrictName, useAdcode);
						},
						fail: (err) => {
							console.error('❌ 高德地图搜索请求失败，切换到腾讯地图:', err);
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
				fail: (err) => {
					console.error('获取行政区域编码失败，使用城市名称搜索:', err);
					// 降级方案：直接使用城市名称搜索
					this.fallbackCitySearch(originalCityName, searchCity);
				}
			})
		},
		// 【新增方法】统一处理搜索结果
		handleSearchResults(res, originalCityName, originalDistrictName, skipFilter = false) {
			console.log('�� 处理搜索结果 - skipFilter:', skipFilter);

			// 检查返回状态
			if ((res.data.data.status === '1' || res.data.data.status === 'OK') && res.data.data.pois && res.data.data.pois.length > 0) {
				console.log('�� 搜索返回POI数量:', res.data.data.pois.length);

				let searchResults = res.data.data.pois
					.filter(item => {
						// �� 如果使用adcode搜索且skipFilter为true，不进行二次过滤
						if (skipFilter) {
							return true;
						}
						
						// �� 二次过滤：确保结果在选定的城市内
						// 检查cityname字段是否匹配
						const itemCity = item.cityname || '';
						const itemProvince = item.pname || '';
						const itemDistrict = item.adname || '';
						
						console.log(`POI过滤检查 - ${item.name}:`, {
							城市: itemCity,
							省份: itemProvince,
							区县: itemDistrict,
							原始城市: originalCityName,
							原始区县: originalDistrictName
						});
						
						// 如果有区县信息，优先匹配区县
						if (originalDistrictName) {
							// 匹配区县名（支持模糊匹配，因为可能有"区"、"县"等后缀差异）
							const districtMatch = itemDistrict.includes(originalDistrictName) || 
							                       originalDistrictName.includes(itemDistrict);
							if (districtMatch) {
								console.log('✅ 区县匹配成功');
								return true;
							}
						}
						
						// 匹配城市名
						const cityMatch = itemCity.includes(originalCityName) || 
						                   originalCityName.includes(itemCity);
						
						if (cityMatch) {
							console.log('✅ 城市匹配成功');
							return true;
						}
						
						console.log('❌ 过滤掉不匹配的POI');
						return false;
					})
					.map(item => {
						// 计算与当前位置的距离
						let distance = '0.0'
						console.log('�� 计算距离 - 当前位置:', this.currentLocation);
						console.log('�� 计算距离 - 目标位置:', item.location);

						if (this.currentLocation.latitude && this.currentLocation.longitude) {
							const lat1 = parseFloat(this.currentLocation.latitude)
							const lon1 = parseFloat(this.currentLocation.longitude)
							const lat2 = parseFloat(item.location.split(',')[1])
							const lon2 = parseFloat(item.location.split(',')[0])

							// 验证坐标有效性
							if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
								console.warn('⚠️ 坐标数据无效:', { lat1, lon1, lat2, lon2 });
								distance = '--';
							} else {
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
								console.log('�� 计算出的距离:', distance, 'km');
							}
						} else {
							console.log('⚠️ 当前位置信息不完整，无法计算距离');
							distance = '--';
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
				
				console.log(`✅ 最终搜索结果数量: ${searchResults.length}`);
				
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
				console.log('地址搜索无结果或状态异常:', res.data.data);
				if (res.data.data.info === 'USER_DAILY_QUERY_OVER_LIMIT') {
					console.log('高德地图配额已达上限，切换到腾讯地图搜索');
					// 显示加载提示
					uni.showLoading({
						title: '努力搜索中...',
						mask: true
					});
					// 切换到腾讯地图搜索
					this.searchWithTencentMap(originalCityName);
				} else {
					uni.showToast({
						title: '未找到相关地址',
						icon: 'none'
					});
				}
			}
		},
		// 【新增方法】降级搜索
		fallbackCitySearch(originalCityName, searchCity) {
			const searchParams = {
				key: 'e3a5024683cf405c94c5f158b05729b6',
				keywords: this.searchKeyword,
				offset: 20,
				page: 1,
				extensions: 'all',
				output: 'json',
				citylimit: true,
				city: searchCity
			};

			console.log('降级搜索参数:', searchParams);

			uni.request({
				url: `https://ccpt.cc111.cn/api/task/place/search`,
				method: 'POST',
				data: searchParams,
				success: (res) => {
					// 隐藏加载提示
					uni.hideLoading()

					if ((res.data.data.status === '1' || res.data.data.status === 'OK') && res.data.data.pois && res.data.data.pois.length > 0) {
						console.log('降级搜索返回数据:', res.data.data);
						// 处理搜索结果（不进行过滤）
						this.handleSearchResults(res, originalCityName, '', false);
					} else {
						console.log('地址搜索无结果或状态异常:', res.data.data);
						if (res.data.data.info === 'USER_DAILY_QUERY_OVER_LIMIT') {
							console.log('高德地图配额已达上限，切换到腾讯地图搜索');
							// 显示加载提示
							uni.showLoading({
								title: '努力搜索中...',
								mask: true
							});
							// 切换到腾讯地图搜索
							this.searchWithTencentMap(searchCity);
						} else {
							uni.showToast({
								title: '未找到相关地址',
								icon: 'none'
							});
						}
					}
				},
				fail: (err) => {
					console.error('高德地图搜索请求失败，切换到腾讯地图:', err);
					// 显示加载提示
					uni.showLoading({
						title: '努力搜索中...',
						mask: true
					});
					// 高德地图请求失败时，切换到腾讯地图搜索
					this.searchWithTencentMap(searchCity);
				}
			})
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
						const searchResults = res.data.map(item => {
							// 腾讯地图返回的经纬度格式为 {lat: xx, lng: xx}
							const lat2 = parseFloat(item.location.lat);
							const lon2 = parseFloat(item.location.lng);

							// 计算与当前位置的距离
							let distance = '0.0';
							console.log('腾讯地图 - 计算距离 - 当前位置:', this.currentLocation);
							console.log('腾讯地图 - 计算距离 - 目标位置:', { lat: lat2, lng: lon2 });

							if (this.currentLocation.latitude && this.currentLocation.longitude) {
								const lat1 = parseFloat(this.currentLocation.latitude);
								const lon1 = parseFloat(this.currentLocation.longitude);

								// 验证坐标有效性
								if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
									console.warn('腾讯地图坐标数据无效:', { lat1, lon1, lat2, lon2 });
									distance = '--';
								} else {
									const R = 6371000;
									const dLat = this.deg2rad(lat2 - lat1);
									const dLon = this.deg2rad(lon2 - lon1);
									const a =
										Math.sin(dLat/2) * Math.sin(dLat/2) +
										Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
										Math.sin(dLon/2) * Math.sin(dLon/2);
									const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
									const distanceInMeters = R * c;

									distance = (distanceInMeters / 1000).toFixed(1);
									console.log('腾讯地图计算出的距离:', distance);
								}
							} else {
								console.log('腾讯地图 - 当前位置信息不完整，无法计算距离');
								distance = '--';
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
								distance: distance
							};
						});

						// 合并搜索结果到地址列表
						this.addressList = [...this.addressList, ...searchResults];

						// 如果没有结果，显示提示
						if (this.addressList.length <= 1) {
							uni.showToast({
								title: '当前区域未找到相关地址',
								icon: 'none'
							});
						}
					} else {
						console.log('腾讯地图搜索无结果或状态异常:', res);
						uni.showToast({
							title: '未找到相关地址',
							icon: 'none'
						});
					}
				},
				fail: (res) => {
					// 隐藏加载提示
					uni.hideLoading();

					console.error('腾讯地图搜索请求失败:', res);
					uni.showToast({
						title: '搜索请求失败',
						icon: 'none'
					});
				},
				complete: (res) => {
					console.log('腾讯地图搜索请求完成:', res);
				}
			});
		},
		// 清除搜索
		clearSearch() {
			this.searchKeyword = ''
			this.addressList = []
		},
		// 处理选择地址
		handleSelectAddress(item) {
			// 显示加载提示
			uni.showLoading({
				title: '获取详细地址...',
				mask: true
			});

			// 优化：优先使用腾讯地图逆地理编码获取详细地址，减少API消耗
			this.getDetailedAddress(item);
		},

		// 获取详细地址信息的优化方法
		getDetailedAddress(item) {
			// 生成缓存key
			const cacheKey = `address_${item.latitude}_${item.longitude}`;

			// 检查本地缓存
			const cachedAddress = uni.getStorageSync(cacheKey);
			if (cachedAddress) {
				console.log('使用缓存的地址信息:', cachedAddress);
				this.processSelectedAddress(item, cachedAddress);
				return;
			}

			// 优先使用腾讯地图逆地理编码
			qqmapsdk.reverseGeocoder({
				location: {
					latitude: item.latitude,
					longitude: item.longitude
				},
				success: (geoRes) => {
					console.log('腾讯地图逆地理编码返回:', geoRes);

					if (geoRes.status === 0 && geoRes.result) {
						// 构建详细地址信息
						const addressInfo = {
							formatted_address: geoRes.result.address,
							address_component: geoRes.result.address_component || {},
							address_reference: geoRes.result.address_reference || {},
							api_source: 'tencent'
						};

						// 优化地址信息
						if (geoRes.result.formatted_addresses && geoRes.result.formatted_addresses.standard_address) {
							addressInfo.formatted_address = geoRes.result.formatted_addresses.standard_address;
						}

						// 缓存地址信息（缓存1小时）
						const cacheData = {
							data: addressInfo,
							timestamp: Date.now(),
							expires: 3600000 // 1小时
						};
						uni.setStorageSync(cacheKey, cacheData);

						this.processSelectedAddress(item, cacheData);
					} else {
						// 腾讯地图失败，降级到高德地图
						console.log('腾讯地图逆地理编码失败，降级到高德地图');
						this.fallbackToAmapGeocode(item, cacheKey);
					}
				},
				fail: () => {
					// 降级到高德地图
					console.log('腾讯地图逆地理编码请求失败，降级到高德地图');
					this.fallbackToAmapGeocode(item, cacheKey);
				}
			});
		},

		// 降级到高德地图逆地理编码
		fallbackToAmapGeocode(item, cacheKey) {
			uni.request({
				url: 'https://ccpt.cc111.cn/api/task/geocode',
				method: 'POST',
				data: {
					key: 'e3a5024683cf405c94c5f158b05729b6',
					location: `${item.longitude},${item.latitude}`,
					extensions: 'all',
					output: 'json'
				},
				success: (res) => {
					console.log('高德地图逆地理编码返回数据:', res.data.data);
					if ((res.data.data.status === '1' || res.data.data.status === 'OK') && res.data.data.regeocode) {
						const addressComponent = res.data.data.regeocode.addressComponent;

						// 构建地址信息
						const addressInfo = {
							formatted_address: res.data.data.regeocode.formatted_address,
							address_component: addressComponent,
							api_source: 'amap'
						};

						// 缓存地址信息（缓存1小时）
						const cacheData = {
							data: addressInfo,
							timestamp: Date.now(),
							expires: 3600000 // 1小时
						};
						uni.setStorageSync(cacheKey, cacheData);

						this.processSelectedAddress(item, cacheData);
					} else {
						uni.hideLoading();
						uni.showToast({
							title: '获取地址信息失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					console.error('高德地图逆地理编码请求失败:', err);
					uni.hideLoading();
					uni.showToast({
						title: '获取地址信息失败',
						icon: 'none'
					});
				}
			});
		},

		// 统一处理选择的地址
		processSelectedAddress(item, cacheData) {
			// 检查缓存是否过期
			if (cacheData.timestamp && (Date.now() - cacheData.timestamp > cacheData.expires)) {
				console.log('缓存已过期，重新获取');
				uni.removeStorageSync(`address_${item.latitude}_${item.longitude}`);
				this.getDetailedAddress(item);
				return;
			}

			const addressInfo = cacheData.data;
			console.log('处理地址信息:', addressInfo);

			// 隐藏加载提示
			uni.hideLoading();

			// 获取所有页面
			const pages = getCurrentPages();
			// 获取发布订单页实例 (倒数第三个页面)
			const publishPage = pages[pages.length - 3];

			if (publishPage) {
				// 统一处理不同API来源的地址组件
				const addressComponent = addressInfo.address_component;
				console.log('地址组件:', addressComponent);

				// 详细输出地址组件的各个属性
				console.log('省份:', addressComponent.province);
				console.log('城市:', addressComponent.city);
				console.log('区县:', addressComponent.district);

				if (this.addressType === 'start') {
					publishPage.$vm.formData.address = item.address;
					publishPage.$vm.formData.latitude = item.latitude;
					publishPage.$vm.formData.longitude = item.longitude;
					publishPage.$vm.formData.distance = item.distance; // 距离km
					publishPage.$vm.formData.province = addressComponent.province;

					// 获取用户选择的城市信息（用于备用）
					const selectedCity = uni.getStorageSync('selectedCity') || '';
					console.log('用户之前选择的城市:', selectedCity);
					console.log('地址组件信息:', addressComponent);

					// 【修复】优先使用地址组件中的真实数据，而不是 selectedCity 中的旧数据
					let cityValue = '';
					let districtValue = '';
					
					// 1️⃣ 首先从地址组件中获取城市信息
					// 针对重庆市这种特殊区域（city 为空数组）
					if(Array.isArray(addressComponent.city) && addressComponent.city.length == 0) {
						cityValue = addressComponent.province;
					} else {
						cityValue = addressComponent.city || '';
					}
					
					// 如果地址组件中没有城市信息，才使用 selectedCity 中的城市信息作为备用
					if (!cityValue && selectedCity && selectedCity.includes(' · ')) {
						const parts = selectedCity.split(' · ');
						if (parts.length >= 1) {
							cityValue = parts[0]; // 使用 selectedCity 中的城市部分作为备用
							console.log('⚠️ 地址组件无城市信息，使用 selectedCity 中的城市:', cityValue);
						}
					}
					
					publishPage.$vm.formData.city = cityValue;

					// 2️⃣ 只使用地址组件中的 district（不使用 township）
					if(Array.isArray(addressComponent.district) && addressComponent.district.length == 0) {
						districtValue = ''; // district 为空数组时设为空字符串
					} else {
						districtValue = addressComponent.district || '';
					}
					
					// 只有当地址组件完全没有区县信息时，才考虑使用 selectedCity 中的区县作为备用
					if (!districtValue && selectedCity && selectedCity.includes(' · ')) {
						const parts = selectedCity.split(' · ');
						if (parts.length >= 2) {
							districtValue = parts[1]; // 使用 selectedCity 中的区县部分作为备用
							console.log('⚠️ 地址组件无区县信息，使用 selectedCity 中的区县:', districtValue);
						}
					}

					publishPage.$vm.formData.district = districtValue;
					
					console.log('✅ 使用地址组件的真实数据:', {
						city: cityValue,
						district: districtValue,
						来源: '地址组件逆地理编码'
					});

					// 修复 万宁市属于行政区，导致无法识别系统区域的问题
					// 当 city 为空时，district 作为地级市，township 作为区县
					if(publishPage.$vm.formData.province === '海南省' && publishPage.$vm.formData.city === '海南省') {
						publishPage.$vm.formData.city = addressComponent.district;      // district（万宁市）作为地级市
						publishPage.$vm.formData.district = addressComponent.township;  // township（万城镇）作为区县
						console.log('海南省特殊处理 - city为空，district作为地级市，township作为区县:', {
							city: publishPage.$vm.formData.city,        // 万宁市
							district: publishPage.$vm.formData.district // 万城镇
						});
					}
					
					console.log('最终设置的城市和区县:', {
						city: publishPage.$vm.formData.city,
						district: publishPage.$vm.formData.district
					});

					// ========== 【修复】同步更新 selectedCity 的值 ==========
					// 根据实际选择的地址更新 selectedCity
					const finalCityValue = publishPage.$vm.formData.city;
					const finalDistrictValue = publishPage.$vm.formData.district;
					
					if (finalCityValue && finalDistrictValue) {
						const newSelectedCity = `${finalCityValue} · ${finalDistrictValue}`;
						console.log('更新 selectedCity:', selectedCity, '→', newSelectedCity);
						
						// 更新本地存储
						uni.setStorageSync('selectedCity', newSelectedCity);
						
						// 更新发布页面的 selectedCity
						publishPage.$vm.selectedCity = newSelectedCity;
						
						console.log('✅ 已同步更新 selectedCity 和本地存储');
					}
				} 
				// else if (this.addressType === 'end') {
				// 	publishPage.$vm.endAddress = item.address;
				// 	publishPage.$vm.endLocation = {
				// 		latitude: item.latitude,
				// 		longitude: item.longitude
				// 	};
				// } else if (this.addressType === 'address') {
				// 	// 确保省市区信息存在
				// 	const province = addressComponent.province || '';
				// 	let city = addressComponent.city || '';
				// 	let district = addressComponent.district || '';

				// 	// 获取用户选择的城市信息，用于修正区县信息
				// 	const selectedCity = uni.getStorageSync('selectedCity') || '';
				// 	console.log('用户选择的城市:', selectedCity);
				// 	console.log('地址组件信息:', addressComponent);

				// 	// 针对重庆市这种特殊区域
				// 	if (Array.isArray(city) && city.length == 0) {
				// 		city = province;
				// 	}

				// 	// 修复地址组件解析逻辑，确保district与用户选择的城市一致
				// 	let districtValue = '';

				// 	// 优先使用用户在首页选择的城市信息
				// 	if (selectedCity && selectedCity.includes(' · ')) {
				// 		// 如果selectedCity包含区县信息，提取区县部分
				// 		const parts = selectedCity.split(' · ');
				// 		if (parts.length >= 2) {
				// 			districtValue = parts[1]; // 取区县/镇名部分，如"大岭山镇"
				// 			console.log('从selectedCity提取的区县名:', districtValue);
				// 		}
				// 	}

				// 	// 如果没有从selectedCity获取到有效信息，使用地址组件的信息
				// 	if (!districtValue) {
				// 		if (Array.isArray(district) && district.length == 0) {
				// 			districtValue = addressComponent.township || '';
				// 		} else {
				// 			districtValue = district;
				// 		}
				// 	}

				// 	// 特殊处理：如果地址组件中有镇名信息，优先使用镇名
				// 	if (addressComponent.township &&
				// 		addressComponent.township !== district) {
				// 		// 如果township不同于district，说明有更具体的行政区划信息
				// 		districtValue = addressComponent.township;
				// 		console.log('使用township作为区县名:', districtValue);
				// 	}

				// 	// 修复 万宁市属于行政区，导致无法识别系统区域的问题
				// 	if (province === '海南省' && city === '海南省') {
				// 		city = district;
				// 		districtValue = addressComponent.township || '';
				// 	}

				// 	console.log('省市区信息:', { province, city, district: districtValue });

				// 	// 更新 formData
				// 	const updatedFormData = {
				// 		...publishPage.$vm.formData,
				// 		address: item.address,
				// 		latitude: item.latitude,
				// 		longitude: item.longitude,
				// 		province: province,
				// 		city: city,
				// 		district: districtValue
				// 	};

				// 	// 打印更新后的 formData
				// 	console.log('更新后的 formData:', updatedFormData);

				// 	// 输出到 AppData
				// 	const appData = {
				// 		formData: updatedFormData,
				// 		addressComponent: addressComponent,
				// 		selectedAddress: item.address,
				// 		location: {
				// 			latitude: item.latitude,
				// 			longitude: item.longitude
				// 		}
				// 	};
				// 	console.log('AppData:', appData);

				// 	// 使用 uni.setStorageSync 存储到本地，方便在开发者工具中查看
				// 	uni.setStorageSync('debug_formData', appData);

				// 	// 更新父组件的 formData
				// 	publishPage.$vm.formData = updatedFormData;

				// 	// 触发父组件的更新
				// 	publishPage.$vm.$forceUpdate();
				// }

				// 直接返回发布订单页
				uni.navigateBack({
					delta: 2
				});
			}
		},
		// 腾讯地图逆地理编码方法
		reverseGeocodeWithTencent(item) {
			console.log('使用腾讯地图逆地理编码');

			qqmapsdk.reverseGeocoder({
				location: {
					latitude: item.latitude,
					longitude: item.longitude
				},
				success: (res) => {
					console.log('腾讯地图逆地理编码返回数据:', res);

					if (res.status === 0 && res.result) {
						const addressComponent = res.result.address_component;
						console.log('腾讯地图地址组件:', addressComponent);

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
								
								// 【修复】优先使用地址组件中的真实数据（腾讯地图）
								const selectedCity = uni.getStorageSync('selectedCity') || '';
								console.log('腾讯地图 - 用户之前选择的城市:', selectedCity);
								console.log('腾讯地图 - 地址组件信息:', addressComponent);
								
								let cityValue = '';
								let districtValue = '';
								
								// 1️⃣ 首先从地址组件中获取真实的城市和区县信息
								cityValue = addressComponent.city || '';
								districtValue = addressComponent.district || ''; // 只使用 district，不使用 township
								
								// 只有当地址组件完全没有数据时，才使用 selectedCity 作为备用
								if (!cityValue && selectedCity && selectedCity.includes(' · ')) {
									const parts = selectedCity.split(' · ');
									if (parts.length >= 1) {
										cityValue = parts[0];
										console.log('⚠️ 腾讯地图 - 地址组件无城市信息，使用备用:', cityValue);
									}
								}
								if (!districtValue && selectedCity && selectedCity.includes(' · ')) {
									const parts = selectedCity.split(' · ');
									if (parts.length >= 2) {
										districtValue = parts[1];
										console.log('⚠️ 腾讯地图 - 地址组件无区县信息，使用备用:', districtValue);
									}
								}
								
								publishPage.$vm.formData.city = cityValue;
								publishPage.$vm.formData.district = districtValue;
								
								console.log('✅ 腾讯地图 - 使用地址组件的真实数据:', {
									city: cityValue,
									district: districtValue,
									来源: '腾讯地图逆地理编码'
								});
								
								// 修复 万宁市属于行政区，导致无法识别系统区域的问题
								// 当 city 为空时，district 作为地级市，township 作为区县
								if(publishPage.$vm.formData.province === '海南省' && publishPage.$vm.formData.city === '海南省') {
									publishPage.$vm.formData.city = addressComponent.district;      // district（万宁市）作为地级市
									publishPage.$vm.formData.district = addressComponent.township;  // township（万城镇）作为区县
									console.log('腾讯地图 - 海南省特殊处理 - city为空，district作为地级市，township作为区县:', {
										city: publishPage.$vm.formData.city,        // 万宁市
										district: publishPage.$vm.formData.district // 万城镇
									});
								}

								// ========== 【修复】同步更新 selectedCity 的值 ==========
								// 根据实际选择的地址更新 selectedCity
								const finalCityValue = publishPage.$vm.formData.city;
								const finalDistrictValue = publishPage.$vm.formData.district;
								
								if (finalCityValue && finalDistrictValue) {
									const selectedCity = uni.getStorageSync('selectedCity') || '';
									const newSelectedCity = `${finalCityValue} · ${finalDistrictValue}`;
									console.log('腾讯地图 - 更新 selectedCity:', selectedCity, '→', newSelectedCity);
									
									// 更新本地存储
									uni.setStorageSync('selectedCity', newSelectedCity);
									
									// 更新发布页面的 selectedCity
									publishPage.$vm.selectedCity = newSelectedCity;
									
									console.log('✅ 已同步更新 selectedCity 和本地存储（腾讯地图）');
								}
							} 
							// else if (this.addressType === 'end') {
							// 	publishPage.$vm.endAddress = item.address;
							// 	publishPage.$vm.endLocation = {
							// 		latitude: item.latitude,
							// 		longitude: item.longitude
							// 	};
							// } else if (this.addressType === 'address') {
							// 	// 确保省市区信息存在
							// 	const province = addressComponent.province || '';
							// 	const city = addressComponent.city || '';
							// 	const district = addressComponent.district || '';

							// 	console.log('省市区信息:', { province, city, district });

							// 	// 更新 formData
							// 	const updatedFormData = {
							// 		...publishPage.$vm.formData,
							// 		address: item.address,
							// 		latitude: item.latitude,
							// 		longitude: item.longitude,
							// 		province: province,
							// 		city: city,
							// 		district: district
							// 	};

							// 	// 打印更新后的 formData
							// 	console.log('更新后的 formData:', updatedFormData);

							// 	// 输出到 AppData
							// 	const appData = {
							// 		formData: updatedFormData,
							// 		addressComponent: addressComponent,
							// 		selectedAddress: item.address,
							// 		location: {
							// 			latitude: item.latitude,
							// 			longitude: item.longitude
							// 		}
							// 	};
							// 	console.log('AppData:', appData);

							// 	// 使用 uni.setStorageSync 存储到本地，方便在开发者工具中查看
							// 	uni.setStorageSync('debug_formData', appData);

							// 	// 更新父组件的 formData
							// 	publishPage.$vm.formData = updatedFormData;

							// 	// 触发父组件的更新
							// 	publishPage.$vm.$forceUpdate();
							// }

							// 直接返回发布订单页
							uni.navigateBack({
								delta: 2
							});
						}
					} else {
						console.log('腾讯地图逆地理编码无结果或状态异常:', res);
						uni.showToast({
							title: '获取地址信息失败',
							icon: 'none'
						});
					}
				},
				fail: (res) => {
					console.error('腾讯地图逆地理编码请求失败:', res);
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
		margin-right: 20rpx;

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