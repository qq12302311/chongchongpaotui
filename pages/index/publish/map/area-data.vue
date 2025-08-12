<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<nav-bar title="区县数据"></nav-bar>
		
		<!-- 内容区域 -->
		<view class="page-content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 操作按钮 -->
			<view class="action-buttons">
				<button class="btn" @click="handleGetData" :loading="loading">获取数据</button>
				<button class="btn" @click="handleLoadData">加载数据</button>
			</view>
			
			<!-- 导出数据按钮 -->
			<view class="export-button" @click="handleExportData">
				<text>导出区域数据</text>
			</view>
			
			<!-- 数据统计 -->
			<view class="data-stats" v-if="areaData">
				<view class="stat-item">
					<text class="label">省份数量：</text>
					<text class="value">{{provinceCount}}</text>
				</view>
				<view class="stat-item">
					<text class="label">城市数量：</text>
					<text class="value">{{cityCount}}</text>
				</view>
				<view class="stat-item">
					<text class="label">区县数量：</text>
					<text class="value">{{districtCount}}</text>
				</view>
			</view>
			
			<!-- 数据列表 -->
			<scroll-view class="data-list" scroll-y v-if="areaData">
				<view 
					v-for="(province, provinceName) in areaData" 
					:key="provinceName"
					class="province-section"
				>
					<view class="province-header">
						<text class="province-name">{{provinceName}}</text>
						<text class="province-center">中心点：{{province.center}}</text>
					</view>
					<view 
						v-for="(city, cityName) in province.cities" 
						:key="cityName"
						class="city-section"
					>
						<view class="city-header">
							<text class="city-name">{{cityName}}</text>
							<text class="city-center">中心点：{{city.center}}</text>
						</view>
						<view class="district-list">
							<view 
								v-for="(district, districtName) in city.districts" 
								:key="districtName"
								class="district-item"
							>
								<text class="district-name">{{districtName}}</text>
								<text class="district-center">中心点：{{district.center}}</text>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import { getAllAreaData, loadAreaData, exportAreaDataToFile } from '@/utils/areaData.js'

export default {
	components: {
		NavBar
	},
	data() {
		return {
			navBarHeight: 0,
			loading: false,
			areaData: null
		}
	},
	computed: {
		provinceCount() {
			return this.areaData ? Object.keys(this.areaData).length : 0;
		},
		cityCount() {
			if (!this.areaData) return 0;
			return Object.values(this.areaData).reduce((count, province) => {
				return count + Object.keys(province.cities).length;
			}, 0);
		},
		districtCount() {
			if (!this.areaData) return 0;
			return Object.values(this.areaData).reduce((count, province) => {
				return count + Object.values(province.cities).reduce((cityCount, city) => {
					return cityCount + Object.keys(city.districts).length;
				}, 0);
			}, 0);
		}
	},
	onLoad() {
		// 获取导航栏高度
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
		this.navBarHeight = menuButtonInfo.bottom + 8;
	},
	methods: {
		// 获取数据
		async handleGetData() {
			try {
				this.loading = true;
				this.areaData = await getAllAreaData();
				uni.showToast({
					title: '数据获取成功',
					icon: 'success'
				});
			} catch (error) {
				console.error('获取数据失败:', error);
				uni.showToast({
					title: '获取数据失败',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		},
		// 加载数据
		handleLoadData() {
			try {
				this.areaData = loadAreaData();
				if (this.areaData) {
					uni.showToast({
						title: '数据加载成功',
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: '未找到数据',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('加载数据失败:', error);
				uni.showToast({
					title: '加载数据失败',
					icon: 'none'
				});
			}
		},
		// 处理导出数据
		handleExportData() {
			uni.showLoading({
				title: '正在导出...',
				mask: true
			});
			
			try {
				exportAreaDataToFile();
				uni.hideLoading();
				uni.showToast({
					title: '导出成功',
					icon: 'success'
				});
			} catch (error) {
				uni.hideLoading();
				uni.showToast({
					title: '导出失败',
					icon: 'none'
				});
				console.error('导出数据失败:', error);
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
	display: flex;
	flex-direction: column;
}

.page-content {
	flex: 1;
	padding: 20rpx;
}

.action-buttons {
	display: flex;
	gap: 20rpx;
	margin-bottom: 20rpx;
	
	.btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		background-color: #2492F2;
		color: #ffffff;
		border-radius: 40rpx;
		font-size: 28rpx;
		
		&:active {
			opacity: 0.8;
		}
	}
}

.export-button {
	background-color: #2492F2;
	color: #ffffff;
	padding: 20rpx 40rpx;
	border-radius: 8rpx;
	text-align: center;
	margin: 20rpx;
	font-size: 28rpx;
	
	&:active {
		opacity: 0.8;
	}
}

.data-stats {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
	
	.stat-item {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
		
		&:last-child {
			margin-bottom: 0;
		}
		
		.label {
			font-size: 28rpx;
			color: #666666;
			margin-right: 10rpx;
		}
		
		.value {
			font-size: 28rpx;
			color: #333333;
			font-weight: bold;
		}
	}
}

.data-list {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 20rpx;
	height: calc(100vh - 400rpx);
	
	.province-section {
		margin-bottom: 30rpx;
		
		&:last-child {
			margin-bottom: 0;
		}
		
		.province-header {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;
			
			.province-name {
				font-size: 32rpx;
				color: #333333;
				font-weight: bold;
				margin-right: 20rpx;
			}
			
			.province-center {
				font-size: 24rpx;
				color: #999999;
			}
		}
		
		.city-section {
			margin-bottom: 20rpx;
			padding-left: 20rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.city-header {
				display: flex;
				align-items: center;
				margin-bottom: 10rpx;
				
				.city-name {
					font-size: 28rpx;
					color: #333333;
					margin-right: 20rpx;
				}
				
				.city-center {
					font-size: 24rpx;
					color: #999999;
				}
			}
			
			.district-list {
				padding-left: 20rpx;
				
				.district-item {
					display: flex;
					align-items: center;
					margin-bottom: 10rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					.district-name {
						font-size: 26rpx;
						color: #666666;
						margin-right: 20rpx;
					}
					
					.district-center {
						font-size: 24rpx;
						color: #999999;
					}
				}
			}
		}
	}
}
</style> 