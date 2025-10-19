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
						placeholder="输入关键字搜索城市"
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
				:scroll-into-view="scrollIntoView"
				:scroll-with-animation="true"
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
								<text class="rider-count" v-if="result.type === 'city'">（{{getResultRiderCount(result)}}位骑手）</text>
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
					<!-- 关注城市 -->
					<view class="favorite-section" v-if="favoriteCities.length > 0">
						<view class="section-header">
							<text class="section-title-text">关注城市</text>
						</view>
						<scroll-view scroll-x class="favorite-cities-scroll" :show-scrollbar="false">
							<view class="favorite-cities-list">
								<view v-for="(city, index) in favoriteCities" :key="index" class="favorite-city-item">
									<view class="city-tag favorite" @click="toggleFavoriteCity(city.name)">
										<text class="star-icon">★</text>
										<text class="city-name">{{city.name}}</text>
										<view class="expand-icon" :class="{ 'expanded': isFavoriteCityExpanded(city.name) }">
											<text>{{ isFavoriteCityExpanded(city.name) ? '▲' : '▼' }}</text>
										</view>
									</view>
								</view>
								<view class="favorite-city-item">
									<view class="city-tag add-btn" @click="showAddFavorite">
										<text class="add-icon">+</text>
									</view>
								</view>
							</view>
						</scroll-view>
						<!-- 展开的区县列表 -->
						<view v-for="(city, index) in favoriteCities" :key="'districts-' + index">
							<view class="districts-wrapper expanded-districts" v-if="isFavoriteCityExpanded(city.name) && getFavoriteCityData(city.name)">
								<view class="expanded-city-name">
									<text>{{city.name}}的区县：</text>
								</view>
								<view class="districts-list">
									<view
										v-for="(district, districtIndex) in getFavoriteCityDistricts(city.name)"
										:key="districtIndex"
										class="district-tag"
										:class="{ active: isDistrictActive(city.name, district.name) }"
										@click="handleCitySelect(city.name, district)"
									>
										<text class="district-name-text">{{district.name}}</text>
									</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 半日达城市 -->
					<view class="express-section">
						<view class="section-header">
							<text class="section-title-text">半日达城市</text>
						</view>
						<view class="city-tags">
							<view
								v-for="(city, index) in expressCities"
								:key="index"
								class="city-tag"
								:class="{ favorite: city.isFavorite }"
								@click="handleExpressCitySelect(city)"
							>
								<text v-if="city.isFavorite" class="star-icon">★</text>
								<text class="city-name">{{city.name}}</text>
							</view>
						</view>
					</view>

					<!-- 城市列表 -->
					<view class="list-section">
						<view class="section-header">
							<text class="section-title-text">城市列表</text>
						</view>
						<view
							v-for="(province, provinceIndex) in cityList"
							:key="provinceIndex"
							:id="shouldShowLetter(provinceIndex) ? `letter-${province.pinyin}` : ''"
							class="province-item"
						>
							<!-- 省份标题 -->
							<view class="province-header" @click="toggleProvince(province.name)">
								<view class="province-left">
									<text class="province-letter" v-if="shouldShowLetter(provinceIndex)">{{getProvinceLetter(provinceIndex)}}</text>
									<text class="province-letter-placeholder" v-else></text>
									<text class="province-name">{{province.name}}</text>
									<view class="province-badge">
										<text class="badge-text">已开{{getProvinceDistrictCount(province)}}城</text>
									</view>
									<view class="province-rider-badge">
										<text class="rider-badge-text">{{getProvinceRiderCount(province)}}位骑手</text>
									</view>
								</view>
								<view class="toggle-arrow" :class="{ 'expanded': isProvinceExpanded(province.name) }">
									<text>{{ isProvinceExpanded(province.name) ? '▲' : '▼' }}</text>
								</view>
							</view>
							<!-- 城市列表 -->
							<view
								v-if="isProvinceExpanded(province.name)"
								class="cities-wrapper"
							>
								<view
									v-for="(city, cityIndex) in province.children"
									:key="cityIndex"
									class="city-row"
								>
									<!-- 城市标题 -->
									<view class="city-header" @click="toggleCity(province.name, city.name)">
										<view class="city-left">
											<text v-if="isCityFavorite(city.name)" class="star-icon small">★</text>
											<text class="city-name-text">{{city.name}}</text>
											<view class="city-rider-badge">
												<text class="city-rider-text">{{getCityRiderCount(city)}}位骑手</text>
											</view>
										</view>
										<view class="city-toggle" :class="{ 'expanded': isCityExpanded(province.name, city.name) }">
											<text>{{ isCityExpanded(province.name, city.name) ? '▲' : '▼' }}</text>
										</view>
									</view>
									<!-- 区县列表 -->
									<view class="districts-wrapper" v-if="isCityExpanded(province.name, city.name)">
										<view
											v-for="(district, districtIndex) in city.children"
											:key="districtIndex"
											class="district-tag"
											:class="{ active: isDistrictActive(city.name, district.name) }"
											@click="handleCitySelect(city.name, district)"
										>
											<text class="district-name-text">{{district.name}}</text>
										</view>
									</view>
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

			<!-- 右侧字母导航 -->
			<view
				v-if="!searchKeyword && letterList.length > 0"
				class="letter-nav"
				@touchstart="onLetterTouchStart"
				@touchmove="onLetterTouchMove"
				@touchend="onLetterTouchEnd"
			>
				<view
					v-for="(letter, index) in letterList"
					:key="index"
					class="letter-item"
					:data-letter="letter"
					:data-index="index"
				>
					<text class="letter-text">{{letter}}</text>
				</view>
			</view>

			<!-- 字母提示浮层 -->
			<view v-if="showLetterTip" class="letter-tip">
				<text class="tip-letter">{{currentLetter}}</text>
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
			expandedCities: {},
			// 关注城市
			favoriteCities: [
				{ name: '眉山市', isFavorite: true },
				{ name: '成都市', isFavorite: true },
				{ name: '重庆市', isFavorite: true }
			],
			// 关注城市展开状态
			expandedFavoriteCities: {},
			// 半日达城市
			expressCities: [
				{ name: '成都市', isFavorite: true },
				{ name: '重庆市', isFavorite: true },
				{ name: '乐山市', isFavorite: false },
				{ name: '眉山市', isFavorite: true },
				{ name: '绵阳市', isFavorite: false },
				{ name: '海口市', isFavorite: false },
				{ name: '长沙市', isFavorite: false },
				{ name: '武汉市', isFavorite: false },
				{ name: '广州市', isFavorite: false },
				{ name: '佛山市', isFavorite: false },
				{ name: '乌鲁木齐市', isFavorite: false }
			],
			// 省份字母映射
			provinceLetters: ['A', 'B', 'C', 'F', 'G'],
			// 字母导航相关
			letterList: [], // 字母列表
			showLetterTip: false, // 是否显示字母提示
			currentLetter: '', // 当前选中的字母
			letterNavTop: 0, // 字母导航的顶部位置
			scrollIntoView: '', // scroll-view 滚动到的元素ID
			lastScrollLetter: '', // 上次滚动的字母
			scrollTimer: null // 滚动节流定时器
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
					// 按省份名称拼音首字母排序
					this.cityList = this.sortProvincesByPinyin(res.data);
					// 生成字母导航列表
					this.generateLetterList();
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
									displayName: `${city.name} · ${district.name}`,
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

		// 获取地级市总入驻人数（使用city自身的service_member_count）
		getCityRiderCount(city) {
			const count = city.service_member_count || 0;
			return count * 1;
		},

		// 获取省份总入驻人数（使用province自身的service_member_count）
		getProvinceRiderCount(province) {
			const count = province.service_member_count || 0;
			return count * 1;
		},

		// 处理搜索结果选择
		handleSearchResultSelect(result) {
			if (result.type === 'city') {
				// 选择地级市 - 需要展开让用户选择区县
				// 清空搜索关键词，显示完整列表
				this.searchKeyword = '';
				this.filteredResults = [];

				// 展开省份
				this.$set(this.expandedProvinces, result.province, true);
				// 展开城市
				if (!this.expandedCities[result.province]) {
					this.$set(this.expandedCities, result.province, {});
				}
				this.$set(this.expandedCities[result.province], result.city, true);

				// 提示用户选择区县
				uni.showToast({
					title: '请选择具体区县',
					icon: 'none'
				});
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

				uni.navigateBack();
			}
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
		},

		// 获取省份字母
		getProvinceLetter(index) {
			// 从排序后的省份数据中获取拼音首字母
			if (this.cityList[index] && this.cityList[index].pinyin) {
				return this.cityList[index].pinyin;
			}
			return String.fromCharCode(65 + index); // A-Z
		},

		// 判断是否应该显示字母（只在该字母的第一个省份显示）
		shouldShowLetter(index) {
			if (index === 0) {
				return true; // 第一个省份总是显示字母
			}
			// 如果当前省份的字母与上一个省份的字母不同，则显示
			const currentLetter = this.getProvinceLetter(index);
			const prevLetter = this.getProvinceLetter(index - 1);
			return currentLetter !== prevLetter;
		},

		// 判断城市是否被关注
		isCityFavorite(cityName) {
			return this.favoriteCities.some(city => city.name === cityName) ||
				   this.expressCities.some(city => city.name === cityName && city.isFavorite);
		},

		// 判断区县是否激活
		isDistrictActive(cityName, districtName) {
			return this.currentCity === `${cityName} · ${districtName}`;
		},

		// 切换关注城市展开状态
		toggleFavoriteCity(cityName) {
			this.$set(this.expandedFavoriteCities, cityName, !this.expandedFavoriteCities[cityName]);
		},

		// 判断关注城市是否展开
		isFavoriteCityExpanded(cityName) {
			return !!this.expandedFavoriteCities[cityName];
		},

		// 获取关注城市的数据
		getFavoriteCityData(cityName) {
			const cityData = this.findCityInList(cityName);
			return cityData && cityData.type === 'city' ? cityData.cityData : null;
		},

		// 获取关注城市的区县列表
		getFavoriteCityDistricts(cityName) {
			const cityData = this.getFavoriteCityData(cityName);
			return cityData && cityData.children ? cityData.children : [];
		},

		// 获取关注城市的骑手数量
		getFavoriteCityRiderCount(cityName) {
			const cityData = this.getFavoriteCityData(cityName);
			return cityData ? this.getCityRiderCount(cityData) : 0;
		},

		// 处理关注城市选择
		handleFavoriteCitySelect(city) {
			// 这个方法现在不再使用，由toggleFavoriteCity替代
			this.toggleFavoriteCity(city.name);
		},

		// 处理半日达城市选择
		handleExpressCitySelect(city) {
			// 使用与关注城市相同的逻辑
			this.handleFavoriteCitySelect(city);
		},

		// 显示添加关注城市
		showAddFavorite() {
			uni.showToast({
				title: '添加关注城市',
				icon: 'none'
			});
		},

		// 在cityList中查找城市数据
		findCityInList(cityName) {
			// 遍历所有省份
			for (const province of this.cityList) {
				if (province.children && Array.isArray(province.children)) {
					// 遍历省份下的所有城市
					for (const city of province.children) {
						// 检查城市名称是否匹配
						if (city.name === cityName) {
							return {
								type: 'city',
								provinceName: province.name,
								cityName: city.name,
								cityData: city
							};
						}

						// 检查区县
						if (city.children && Array.isArray(city.children)) {
							for (const district of city.children) {
								if (district.name === cityName) {
									return {
										type: 'district',
										provinceName: province.name,
										cityName: city.name,
										district: district
									};
								}
							}
						}
					}
				}
			}
			return null;
		},

		// 按拼音首字母排序省份
		sortProvincesByPinyin(provinces) {
			// 省份拼音首字母映射表
			const pinyinMap = {
				'安徽省': 'A',
				'北京市': 'B',
				'重庆市': 'C',
				'福建省': 'F',
				'甘肃省': 'G',
				'广东省': 'G',
				'广西壮族自治区': 'G',
				'贵州省': 'G',
				'海南省': 'H',
				'河北省': 'H',
				'河南省': 'H',
				'黑龙江省': 'H',
				'湖北省': 'H',
				'湖南省': 'H',
				'吉林省': 'J',
				'江苏省': 'J',
				'江西省': 'J',
				'辽宁省': 'L',
				'内蒙古自治区': 'N',
				'宁夏回族自治区': 'N',
				'青海省': 'Q',
				'山东省': 'S',
				'山西省': 'S',
				'陕西省': 'S',
				'上海市': 'S',
				'四川省': 'S',
				'天津市': 'T',
				'西藏自治区': 'X',
				'新疆维吾尔自治区': 'X',
				'云南省': 'Y',
				'浙江省': 'Z'
			};

			// 为每个省份添加拼音首字母
			const provincesWithPinyin = provinces.map(province => ({
				...province,
				pinyin: pinyinMap[province.name] || province.name.charAt(0).toUpperCase()
			}));

			// 按拼音首字母排序
			return provincesWithPinyin.sort((a, b) => {
				return a.pinyin.localeCompare(b.pinyin);
			});
		},

		// 生成字母导航列表
		generateLetterList() {
			const letters = new Set();
			this.cityList.forEach(province => {
				if (province.pinyin) {
					letters.add(province.pinyin);
				}
			});
			this.letterList = Array.from(letters).sort();
		},

		// 字母导航触摸开始
		onLetterTouchStart(e) {
			this.showLetterTip = true;
			this.handleLetterTouch(e);
		},

		// 字母导航触摸移动
		onLetterTouchMove(e) {
			// 阻止默认行为,防止页面滚动
			if (e.preventDefault) {
				e.preventDefault();
			}
			this.handleLetterTouch(e);
		},

		// 字母导航触摸结束
		onLetterTouchEnd(e) {
			// 清空上次滚动记录
			this.lastScrollLetter = '';
			// 清除定时器
			if (this.scrollTimer) {
				clearTimeout(this.scrollTimer);
				this.scrollTimer = null;
			}
			// 延迟隐藏提示
			setTimeout(() => {
				this.showLetterTip = false;
			}, 300);
		},

		// 处理字母触摸
		handleLetterTouch(e) {
			const touch = e.touches[0];
			const query = uni.createSelectorQuery().in(this);

			query.select('.letter-nav').boundingClientRect(rect => {
				if (!rect) return;

				// 计算触摸点相对于字母导航的位置
				const offsetY = touch.clientY - rect.top;
				const itemHeight = rect.height / this.letterList.length;
				const index = Math.floor(offsetY / itemHeight);

				if (index >= 0 && index < this.letterList.length) {
					const letter = this.letterList[index];

					// 只有当字母改变时才执行滚动和震动
					if (letter !== this.lastScrollLetter) {
						this.currentLetter = letter;
						this.lastScrollLetter = letter;
						this.scrollToLetter(letter);

						// 震动反馈
						uni.vibrateShort({
							type: 'light'
						});
					}
				}
			}).exec();
		},

		// 滚动到指定字母的省份
		scrollToLetter(letter) {
			// 清除之前的定时器
			if (this.scrollTimer) {
				clearTimeout(this.scrollTimer);
			}

			// 使用 scroll-into-view 属性进行滚动
			const targetId = `letter-${letter}`;
			this.scrollIntoView = targetId;

			// 延迟重置 scrollIntoView，避免频繁触发
			this.scrollTimer = setTimeout(() => {
				this.scrollIntoView = '';
				this.scrollTimer = null;
			}, 100);
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background-color: #F5F5F5;
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
	width: 100%;
	box-sizing: border-box;
}

.search-input-wrap {
	display: flex;
	align-items: center;
	background-color: #F5F5F5;
	border-radius: 40rpx;
	padding: 0 24rpx;
	height: 70rpx;
	width: 100%;
	box-sizing: border-box;
}

.search-icon {
	font-size: 32rpx;
	margin-right: 12rpx;
	color: #999999;
}

.search-input {
	flex: 1;
	height: 70rpx;
	font-size: 28rpx;
	color: #333333;
}

.placeholder-style {
	color: #CCCCCC;
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
	padding: 0;
	padding-bottom: 120rpx;
	overflow-y: auto;
	width: 100%;
	box-sizing: border-box;
	background-color: #F5F5F5;
}

// 关注城市区域
.favorite-section {
	background-color: #ffffff;
	padding: 30rpx;
	margin-bottom: 20rpx;
}

// 关注城市横向滚动容器
.favorite-cities-scroll {
	width: 100%;
	white-space: nowrap;
}

// 关注城市列表
.favorite-cities-list {
	display: inline-flex;
	gap: 16rpx;
	padding-bottom: 8rpx;
}

.favorite-city-item {
	display: inline-block;
	flex-shrink: 0;
}

// 展开的区县列表
.expanded-districts {
	margin-top: 20rpx;
	padding: 16rpx;
	background-color: #F8F8F8;
	border-radius: 8rpx;

	.expanded-city-name {
		font-size: 26rpx;
		color: #666666;
		margin-bottom: 12rpx;
	}

	.districts-list {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}
}

// 半日达城市区域
.express-section {
	background-color: #ffffff;
	padding: 30rpx;
	margin-bottom: 20rpx;
}

// 城市列表区域
.list-section {
	background-color: #ffffff;
	padding: 30rpx;
	padding-bottom: 20rpx;
}

.section-header {
	margin-bottom: 24rpx;
}

.section-title-text {
	font-size: 32rpx;
	color: #333333;
	font-weight: 600;
}

// 城市标签容器
.city-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
}

.city-tag {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 16rpx 24rpx;
	background-color: #F5F5F5;
	border-radius: 8rpx;
	font-size: 28rpx;
	color: #333333;
	white-space: nowrap;
	gap: 8rpx;

	&.favorite {
		padding-right: 16rpx;
		
		.star-icon {
			color: #FF6B35;
			font-size: 28rpx;
		}

		.expand-icon {
			font-size: 20rpx;
			color: #999999;
			margin-left: 4rpx;
			transition: transform 0.3s;

			&.expanded {
				transform: rotate(180deg);
			}
		}
	}

	&.add-btn {
		background-color: #F5F5F5;
		border: 2rpx dashed #CCCCCC;
		min-width: 60rpx;
		height: 60rpx;
		padding: 0;

		.add-icon {
			font-size: 28rpx;
			color: #999999;
		}
	}

	.city-name {
		font-size: 28rpx;
		color: #333333;
	}
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

// 省份项
.province-item {
	margin-bottom: 24rpx;
	border-bottom: 1rpx solid #F0F0F0;
	padding-bottom: 16rpx;

	&:last-child {
		border-bottom: none;
	}
}

.province-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16rpx 0;
}

.province-left {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.province-letter {
	font-size: 28rpx;
	color: #999999;
	font-weight: 500;
	min-width: 40rpx;
}

.province-letter-placeholder {
	min-width: 40rpx;
}

.province-name {
	font-size: 30rpx;
	color: #333333;
	font-weight: 500;
}

.province-badge {
	background-color: #E6F4FF;
	padding: 4rpx 12rpx;
	border-radius: 4rpx;

	.badge-text {
		font-size: 22rpx;
		color: #2492F2;
	}
}

.province-rider-badge {
	background-color: #FFF4E6;
	padding: 4rpx 12rpx;
	border-radius: 4rpx;

	.rider-badge-text {
		font-size: 22rpx;
		color: #FF9800;
	}
}

.toggle-arrow {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	color: #999999;
	transition: transform 0.3s;

	&.expanded {
		transform: rotate(180deg);
	}
}

// 城市包装器
.cities-wrapper {
	padding-left: 56rpx;
}

.city-row {
	margin-bottom: 16rpx;
}

.city-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12rpx 0;
}

.city-left {
	display: flex;
	align-items: center;
	gap: 8rpx;

	.star-icon {
		color: #FF6B35;
		font-size: 24rpx;

		&.small {
			font-size: 20rpx;
		}
	}
}

.city-name-text {
	font-size: 28rpx;
	color: #333333;
}

.city-rider-badge {
	background-color: #FFF4E6;
	padding: 2rpx 10rpx;
	border-radius: 4rpx;
	margin-left: 8rpx;

	.city-rider-text {
		font-size: 20rpx;
		color: #FF9800;
	}
}

.city-toggle {
	font-size: 24rpx;
	color: #999999;
	transition: transform 0.3s;

	&.expanded {
		transform: rotate(180deg);
	}
}

// 区县包装器
.districts-wrapper {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	padding: 12rpx 0;
}

.district-tag {
	padding: 12rpx 24rpx;
	background-color: #F5F5F5;
	border-radius: 8rpx;
	font-size: 26rpx;
	color: #333333;
	display: flex;
	align-items: center;
	justify-content: center;

	&.active {
		background-color: #E6F4FF;
		color: #2492F2;
	}
}

.district-name-text {
	font-size: 26rpx;
}

.rider-count-badge {
	font-size: 20rpx;
	color: #999999;
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
	padding: 24rpx;
	padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
	text-align: center;
	background-color: #F5F5F5;
	z-index: 10;

	.tip-content {
		padding: 8rpx 0;
	}

	.tip-text {
		font-size: 26rpx;
		color: #2492F2;
	}
}

// 右侧字母导航
.letter-nav {
	position: fixed;
	right: 0;
	top: 50%;
	transform: translateY(-50%);
	z-index: 100;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 10rpx 0;
	background-color: transparent;

	.letter-item {
		width: 40rpx;
		height: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.letter-text {
			font-size: 20rpx;
			color: #2492F2;
			font-weight: 500;
		}
	}
}

// 字母提示浮层
.letter-tip {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 160rpx;
	height: 160rpx;
	background-color: rgba(0, 0, 0, 0.7);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
	animation: tipFadeIn 0.2s ease-in-out;

	.tip-letter {
		font-size: 80rpx;
		color: #ffffff;
		font-weight: bold;
	}
}

@keyframes tipFadeIn {
	from {
		opacity: 0;
		transform: translate(-50%, -50%) scale(0.8);
	}
	to {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1);
	}
}
</style>