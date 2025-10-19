<template>
	<view class="history-records">
		<!-- 使用头部组件 -->
		<nav-bar title="历史门店记录" title-align="center"></nav-bar>

		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 搜索框 -->
			<view class="search-box">
				<view class="search-input">
					<input type="text" v-model="searchKeyword" placeholder="输入门店名称搜索" @confirm="searchRecords" confirm-type="search" />
					<view class="search-btn" @click="searchRecords">搜索</view>
				</view>
			</view>

			<!-- 历史记录列表 -->
			<view class="records-list">
				<view v-if="filteredRecords.length === 0" class="empty-state">
					<text class="empty-text">暂无历史门店记录</text>
				</view>
				<view v-else class="record-items">
					<view v-for="(record, index) in filteredRecords" :key="index" class="record-item" @click="selectRecord(record)">
						<view class="record-header">
							<text class="store-name">{{ record.store_name || '未命名门店' }}</text>
							<text class="record-time">{{ formatTime(record.created_at) }}</text>
						</view>
						<view class="record-content">
							<view class="address-info">
								<view class="area-info" v-if="record.province_name || record.city_name || record.district_name">
									<text class="area-text">{{ record.province_name }} {{ record.city_name }} {{ record.district_name }}</text>
								</view>
								<text class="address-text">{{ record.address }}</text>
								<text class="coordinate-text" v-if="record.detailAddress">{{ record.detailAddress }}</text>
								<view class="contact-info" v-if="record.name || record.phone_number">
									<text class="contact-text">联系人：{{ record.name || '未填写' }}</text>
									<text class="phone-text">电话：{{ record.phone_number || '未填写' }}</text>
								</view>
								<view class="sn-mac-info" v-if="record.sn_mac_code && record.sn_mac_code.length > 0">
									<text class="sn-mac-text">SN/MAC: {{ record.sn_mac_code.length }}个</text>
								</view>
								<view class="poi-remark" v-if="record.shop_poi">
									<text class="poi-label">POI备注：</text>
									<text class="poi-text">{{ record.shop_poi }}</text>
								</view>
							</view>
							<view class="door-images" v-if="record.door_images && record.door_images.length > 0">
								<image v-for="(img, imgIndex) in record.door_images.slice(0, 3)" :key="imgIndex" :src="img" mode="aspectFill" class="door-image"></image>
								<view class="more-images" v-if="record.door_images.length > 3">+{{ record.door_images.length - 3 }}</view>
							</view>
						</view>
						<view class="record-footer">
							<view class="action-buttons">
								<view class="delete-btn" @click.stop="deleteRecord(record)">删除</view>
								<view class="import-btn" @click.stop="showImportConfirm(record)">导入</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 导入确认弹窗 -->
			<view class="import-confirm-modal" v-if="showImportModal" @click="closeImportModal">
				<view class="modal-content" @click.stop>
					<view class="modal-header">
						<text class="modal-title">确认门店信息</text>
						<text class="modal-subtitle">请仔细核对以下信息，确保准确无误</text>
					</view>

					<view class="modal-body">
						<view class="info-section">
							<view class="section-title">
								<text class="title-icon">🏪</text>
								<text class="title-text">门店基本信息</text>
							</view>
							<view class="info-item">
								<text class="info-label">门店名称：</text>
								<text class="info-value">{{ selectedRecord.store_name || '未命名门店' }}</text>
							</view>
							<view class="info-item">
								<text class="info-label">门店地址：</text>
								<text class="info-value">{{ getFullAddress(selectedRecord) }}</text>
							</view>
							<view class="info-item" v-if="selectedRecord.name || selectedRecord.phone_number">
								<text class="info-label">联系信息：</text>
								<text class="info-value">{{ selectedRecord.name || '未填写' }} / {{ selectedRecord.phone_number || '未填写' }}</text>
							</view>
						</view>

						<view class="info-section" v-if="selectedRecord.sn_mac_code && selectedRecord.sn_mac_code.length > 0">
							<view class="section-title">
								<text class="title-icon">📱</text>
								<text class="title-text">SN/MAC码信息</text>
							</view>
							<view class="sn-mac-list">
								<view v-for="(code, index) in selectedRecord.sn_mac_code" :key="index" class="sn-mac-item">
									<text class="sn-mac-code">{{ code.value || code }}</text>
								</view>
								<view class="sn-mac-count">
									<text class="count-text">共 {{ selectedRecord.sn_mac_code.length }} 个设备</text>
								</view>
							</view>
						</view>

						<view class="info-section" v-if="selectedRecord.shop_poi">
							<view class="section-title">
								<text class="title-icon">📍</text>
								<text class="title-text">POI信息</text>
							</view>
							<view class="info-item">
								<text class="info-label">POI备注：</text>
								<text class="info-value">{{ selectedRecord.shop_poi }}</text>
							</view>
						</view>

						<view class="warning-notice">
							<text class="warning-icon">⚠️</text>
							<text class="warning-text">请确认以上信息准确无误，避免因信息变更导致骑手空跑</text>
						</view>
					</view>

					<view class="modal-footer">
						<view class="cancel-btn" @click="closeImportModal">取消</view>
						<view class="confirm-btn" @click="confirmImport">确认导入</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 悬浮聊天图标 -->
		<FloatingChatIconUser />
	</view>
</template>

<script>
import FloatingChatIconUser from '@/components/FloatingChatIconUser/index.vue'

export default {
	components: {
		FloatingChatIconUser
	},
	data() {
		return {
			navBarHeight: 0,
			records: [],
			filteredRecords: [],
			searchKeyword: '',
			showImportModal: false,
			selectedRecord: {}
		}
	},
	onLoad() {
		// 计算导航栏高度
		const systemInfo = uni.getSystemInfoSync()
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
		this.navBarHeight = menuButtonInfo.bottom + 12

		this.loadHistoryRecords()
	},
	methods: {
		// 【新增方法】根据城市和区县名称查找并更新 district_id
		async updateDistrictIdByAddress(cityName, districtName, publishPage) {
			try {
				console.log('🔍 开始查找 district_id，城市:', cityName, '区县:', districtName);
				
				// 获取城市列表数据
				let cityListData = uni.getStorageSync('cityList');
				if (!cityListData) {
					console.log('📥 城市列表数据为空，正在获取...');
					const res = await this.$request('service/zone', {}, 'POST');
					if (res.code === 200 && res.data) {
						cityListData = res.data;
						uni.setStorageSync('cityList', cityListData);
						console.log('✅ 城市列表数据获取成功');
					} else {
						console.error('❌ 获取城市列表数据失败:', res.msg);
						return;
					}
				}

				// 如果是字符串，尝试解析
				if (typeof cityListData === 'string') {
					try {
						cityListData = JSON.parse(cityListData);
					} catch (e) {
						console.error('解析城市列表数据失败:', e);
						return;
					}
				}

				// 遍历城市列表查找匹配的 district_id
				let foundDistrictId = null;
				
				for (const province of cityListData) {
					if (province.children && Array.isArray(province.children)) {
						for (const city of province.children) {
							// 匹配城市名
							if (city.name === cityName) {
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
					uni.setStorageSync('selectedDistrictId', foundDistrictId);
					console.log('✅ 已更新本地存储 selectedDistrictId:', foundDistrictId);

					// 同步更新发布页面的 selectedDistrictId
					if (publishPage && publishPage.$vm && publishPage.$vm.selectedDistrictId !== undefined) {
						publishPage.$vm.selectedDistrictId = foundDistrictId;
						console.log('✅ 已同步更新发布页面的 selectedDistrictId');
					}

					// 触发重新获取服务商信息
					if (publishPage && publishPage.$vm && typeof publishPage.$vm.getProviderInfo === 'function') {
						console.log('🔄 触发重新获取服务商信息');
						await publishPage.$vm.getProviderInfo();
						console.log('✅ 服务商信息已更新');
					}
				} else {
					console.warn('⚠️ 未找到匹配的 district_id，城市:', cityName, '区县:', districtName);
				}
			} catch (error) {
				console.error('❌ 更新 district_id 失败:', error);
			}
		},
		
		goBack() {
			uni.navigateBack()
		},
		loadHistoryRecords() {
			// 从本地存储获取历史记录
			const records = uni.getStorageSync('storeHistoryRecords') || []
			this.records = records.sort((a, b) => b.createTime - a.createTime)
			this.filteredRecords = [...this.records]
		},

		// 删除记录
		async deleteRecord(record) {
			console.log(record)
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这条历史记录吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const userInfo = uni.getStorageSync('userInfo');
							// 调用删除接口
							const deleteRes = await this.$request('user/addresses/delete', {
								user_id: userInfo.user_id,
								id: record.id
							}, 'POST');

							if (deleteRes.status === 'success') {
								// 从本地存储获取历史记录
								let records = uni.getStorageSync('storeHistoryRecords') || []
								
								// 找到要删除的记录索引
								const index = records.findIndex(item => 
									item.store_name === record.store_name && 
									item.created_at === record.created_at
								)
								
								if (index !== -1) {
									// 删除记录
									records.splice(index, 1)
									
									// 更新本地存储
									uni.setStorageSync('storeHistoryRecords', records)
									
									// 更新当前页面的记录列表
									this.records = records
									this.filteredRecords = this.searchKeyword ? 
										this.filterRecords(this.records, this.searchKeyword) : 
										[...this.records]
									
									uni.showToast({
										title: '删除成功',
										icon: 'success'
									})
								}
							} else {
								uni.showToast({
									title: deleteRes.msg || '删除失败',
									icon: 'none'
								})
							}
						} catch (error) {
							console.error('删除记录失败:', error);
							uni.showToast({
								title: '删除失败',
								icon: 'none'
							})
						}
					}
				}
			})
		},

		// 搜索记录
		searchRecords() {
			if (!this.searchKeyword) {
				this.filteredRecords = [...this.records]
				return
			}
			this.filteredRecords = this.filterRecords(this.records, this.searchKeyword)
		},

		// 过滤记录
		filterRecords(records, keyword) {
			keyword = keyword.toLowerCase()
			return records.filter(record => {
				const storeName = (record.storeName || '').toLowerCase()
				const address = (record.address || '').toLowerCase()
				return storeName.includes(keyword) || address.includes(keyword)
			})
		},

		// 清除搜索
		clearSearch() {
			this.searchKeyword = ''
			this.filteredRecords = [...this.records]
		},

		// 选择记录
		selectRecord(record) {
			// 将选中的记录传递给发布订单页面
			this.showImportConfirm(record)
		},

		// 显示导入确认弹窗
		showImportConfirm(record) {
			this.selectedRecord = record
			this.showImportModal = true
		},

		// 关闭导入确认弹窗
		closeImportModal() {
			this.showImportModal = false
			this.selectedRecord = {}
		},

		// 确认导入
		async confirmImport() {
			await this.importRecord(this.selectedRecord)
			this.closeImportModal()
		},

		// 获取完整地址
		getFullAddress(record) {
			const parts = []
			if (record.province_name) parts.push(record.province_name)
			if (record.city_name) parts.push(record.city_name)
			if (record.district_name) parts.push(record.district_name)
			if (record.shop_address) parts.push(record.shop_address)
			if (record.address) parts.push(record.address)
			return parts.join(' ')
		},

		// 导入记录
		async importRecord(record) {
			// 发送事件到上一页，导入记录数据
			const pages = getCurrentPages()
			const prevPage = pages[pages.length - 2]

			if (prevPage) {
				// 【调试】记录导入前的数据状态
				console.log('=== 历史记录导入调试 ===');
				console.log('导入前的formData:', JSON.parse(JSON.stringify(prevPage.$vm.formData)));
				console.log('要导入的record:', record);

				// 【彻底修复】创建全新的formData，只保留必要的用户输入字段
				const formData = {
					// 保留用户在当前页面可能设置的基本字段
					user_id: prevPage.$vm.formData.user_id || 0,

					// 从历史记录导入的门店信息
					address: record.address,
					detailAddress: record.shop_address || '',
					longitude: parseFloat(record.longitude) || 0,
					latitude: parseFloat(record.latitude) || 0,
					province: record.province_name || '',
					city: record.city_name || '',
					district: record.district_name || '',
					storeName: record.store_name,
					doorImages: record.door_images || [],
					snMacList: record.sn_mac_code || [{
						id: Date.now(),
						value: ''
					}],
					locationDesc: record.location_description || '',
					phone: record.phone_number,
					contact: record.name,
					poiRemark: record.shop_poi || '', // 修复：正确映射门店POI字段
					device_outside: record.device_outside !== undefined ? record.device_outside : '', // 修复：正确处理设备外摆字段

					// 【重要】所有其他字段都设置为初始值，确保干净状态
					distance: 0,
					estimatedPrice: 0,
					quantity: '', // 补宝数量必须重新填写
					badItemQuantity: 0,
					cableQuantity: 0,
					powerQuantity: 0,
					wiringQuantity: 0,
					warehouseQuantity: 0,
					timeType: 'before_deadline',
					appointmentTime: '',
					timeInterval: '',
					timeRemark: '',
					coupon: '',
					couponId: '',
					couponAmount: 0,
					taskDetails: '',
					goodsRequirement: '',
					timeFrame: '5小时内',
					timeSlot: '15日 12点-14点',
					additional_notes: '',
					recommended_service_time_start: '',
					recommended_service_time_end: '',
				}

				console.log('合并后的formData:', JSON.parse(JSON.stringify(formData)));

				// 【优化】确保SN/MAC码数据格式正确
				if (record.sn_mac_code && Array.isArray(record.sn_mac_code) && record.sn_mac_code.length > 0) {
					// 确保数据格式为 [{id: xxx, value: 'xxx'}, ...]
					formData.snMacList = record.sn_mac_code.map((item, index) => {
						if (typeof item === 'string') {
							return {
								id: Date.now() + index,
								value: item
							}
						} else if (item && typeof item === 'object' && item.value) {
							return {
								id: item.id || Date.now() + index,
								value: item.value
							}
						}
						return {
							id: Date.now() + index,
							value: ''
						}
					});
				}

			prevPage.$vm.formData = formData

			// 【关键修复】更新 selectedCity 和 selectedDistrictId
			if (record.city_name && record.district_name) {
				const selectedCity = `${record.city_name} · ${record.district_name}`;
				uni.setStorageSync('selectedCity', selectedCity);
				console.log('✅ 已更新 selectedCity:', selectedCity);
				
				// 同步更新发布页面的 selectedCity
				if (prevPage.$vm.selectedCity !== undefined) {
					prevPage.$vm.selectedCity = selectedCity;
				}
				
				// 【关键】根据城市和区县查找对应的 district_id
				await this.updateDistrictIdByAddress(record.city_name, record.district_name, prevPage);
			}

			// 【关键修复】重置价格详情，确保价格计算从干净状态开始
			if (prevPage.$vm.priceDetails) {
				prevPage.$vm.priceDetails = {
					baseServiceFee: 0,
					extraDeviceFee: 0,
					distanceFee: 0,
					extraDistanceFee: 0,
					timeLimitFee: 0,
					wireFee: 0,
					extraWireFee: 0,
					powerFee: 0,
					couponAmount: 0,
					total: 0
				};
			}

				// 【核心修复】重置附加服务选择状态
				if (prevPage.$vm.selectedAdditionalServices) {
					prevPage.$vm.selectedAdditionalServices = [];
					console.log('重置附加服务选择状态为空数组');
				}

				// 【修复价格计算问题】如果上一页是发布页面，需要重新计算价格
				console.log('上一页页面信息:', {
					route: prevPage.route,
					path: prevPage.$page && prevPage.$page.path,
					fullPath: prevPage.$page && prevPage.$page.fullPath
				});

				const isPublishPage = prevPage.route === 'pages/index/publish/index' ||
									 (prevPage.$page && prevPage.$page.path === '/pages/index/publish/index');

				if (isPublishPage && typeof prevPage.$vm.calculatePrice === 'function') {
					// 【修复】添加强制更新，确保数据状态一致
					prevPage.$vm.$forceUpdate();

					// 使用 $nextTick 确保数据更新后再计算价格
					prevPage.$vm.$nextTick(() => {
						console.log('=== 历史门店导入后价格重新计算 ===');
						console.log('计算前的formData:', JSON.parse(JSON.stringify(prevPage.$vm.formData)));
						console.log('计算前的priceDetails:', JSON.parse(JSON.stringify(prevPage.$vm.priceDetails)));

						prevPage.$vm.calculatePrice()

						console.log('计算后的priceDetails:', JSON.parse(JSON.stringify(prevPage.$vm.priceDetails)));
						console.log('=== 价格重新计算完成 ===');
					})
				}

				uni.showToast({
					title: '导入成功',
					icon: 'success'
				})

				// 返回上一页
				setTimeout(() => {
					uni.navigateBack()
				}, 1000)
			}
		},

		// 格式化时间
		formatTime(timestamp) {
			if (!timestamp) return ''

			const date = new Date(timestamp)
			const year = date.getFullYear()
			const month = (date.getMonth() + 1).toString().padStart(2, '0')
			const day = date.getDate().toString().padStart(2, '0')
			const hour = date.getHours().toString().padStart(2, '0')
			const minute = date.getMinutes().toString().padStart(2, '0')

			return `${year}-${month}-${day} ${hour}:${minute}`
		},
	}
}
</script>

<style lang="scss" scoped>
.history-records {
	min-height: 100vh;
	background-color: #F5F5F5;
}

.content {
	padding: 30rpx;
}

.search-box {
	padding: 20rpx;
	background-color: #FFFFFF;
	margin-bottom: 20rpx;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

	.search-input {
		display: flex;
		align-items: center;
		background-color: #F5F5F5;
		border-radius: 36rpx;
		padding: 10rpx 20rpx;
		height: 72rpx;

		.search-icon {
			width: 32rpx;
			height: 32rpx;
			margin-right: 10rpx;
			flex-shrink: 0;
		}

		input {
			flex: 1;
			height: 100%;
			font-size: 28rpx;
			color: #333;
		}

		.clear-icon {
			width: 32rpx;
			height: 32rpx;
			margin-left: 10rpx;
			margin-right: 10rpx;
			flex-shrink: 0;
		}

		.search-btn {
			background-color: #2492F2;
			color: #FFFFFF;
			font-size: 26rpx;
			padding: 0 24rpx;
			height: 56rpx;
			line-height: 56rpx;
			border-radius: 28rpx;
			flex-shrink: 0;
		}
	}
}

.records-list {
	padding: 20rpx;

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;

		.empty-icon {
			width: 200rpx;
			height: 200rpx;
			margin-bottom: 20rpx;
		}

		.empty-text {
			font-size: 28rpx;
			color: #999;
		}
	}

	.record-items {
		.record-item {
			background-color: #FFFFFF;
			border-radius: 12rpx;
			padding: 30rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
			transition: transform 0.2s ease;

			&:active {
				transform: scale(0.98);
			}

			.record-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;

				.store-name {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
				}

				.record-time {
					font-size: 24rpx;
					color: #999;
				}
			}

			.record-content {
				.address-info {
					margin-bottom: 20rpx;

					.area-info {
						margin-bottom: 10rpx;

						.area-text {
							font-size: 24rpx;
							color: #999;
							display: block;
						}
					}

					.address-text {
						font-size: 28rpx;
						color: #666;
						margin-bottom: 10rpx;
						display: block;
					}

					.coordinate-text {
						font-size: 24rpx;
						color: #999;
						margin-bottom: 10rpx;
						display: block;
					}

					.contact-info {
						margin-top: 10rpx;
						display: flex;
						flex-direction: column;
						gap: 6rpx;

						.contact-text,
						.phone-text {
							font-size: 26rpx;
							color: #666;
						}
					}

					.sn-mac-info {
						.sn-mac-text {
							font-size: 24rpx;
							color: #2492F2;
							background-color: rgba(36, 146, 242, 0.1);
							padding: 4rpx 12rpx;
							border-radius: 20rpx;
							display: inline-block;
						}
					}

					.poi-remark {
						margin-top: 10rpx;
						display: flex;
						flex-direction: column;
						gap: 6rpx;

						.poi-label {
							font-size: 26rpx;
							color: #666;
						}

						.poi-text {
							font-size: 24rpx;
							color: #999;
						}
					}
				}

				.door-images {
					display: flex;
					flex-wrap: wrap;
					gap: 10rpx;
					margin-bottom: 20rpx;

					.door-image {
						width: 160rpx;
						height: 160rpx;
						border-radius: 8rpx;
					}

					.more-images {
						width: 160rpx;
						height: 160rpx;
						border-radius: 8rpx;
						background-color: rgba(0, 0, 0, 0.05);
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 28rpx;
						color: #666;
					}
				}
			}

			.record-footer {
				display: flex;
				justify-content: flex-end;

				.action-buttons {
					display: flex;
					gap: 20rpx;

					.delete-btn {
						background-color: #FFF1F0;
						color: #FF4D4F;
						font-size: 28rpx;
						padding: 10rpx 30rpx;
						border-radius: 30rpx;
					}

					.import-btn {
						background-color: #2492F2;
						color: #FFFFFF;
						font-size: 28rpx;
						padding: 10rpx 30rpx;
						border-radius: 30rpx;
					}
				}
			}
		}
	}
}

// 导入确认弹窗样式
.import-confirm-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	padding: 40rpx;

	.modal-content {
		background-color: #FFFFFF;
		border-radius: 20rpx;
		width: 100%;
		max-width: 640rpx;
		max-height: 80vh;
		overflow-y: auto;
		animation: modalSlideIn 0.3s ease-out;

		.modal-header {
			padding: 40rpx 30rpx 20rpx;
			text-align: center;
			border-bottom: 1rpx solid #F0F0F0;

			.modal-title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333333;
				display: block;
				margin-bottom: 12rpx;
			}

			.modal-subtitle {
				font-size: 26rpx;
				color: #666666;
				display: block;
			}
		}

		.modal-body {
			padding: 30rpx;

			.info-section {
				margin-bottom: 30rpx;

				&:last-child {
					margin-bottom: 0;
				}

				.section-title {
					display: flex;
					align-items: center;
					margin-bottom: 20rpx;
					padding-bottom: 12rpx;
					border-bottom: 1rpx solid #F5F5F5;

					.title-icon {
						font-size: 32rpx;
						margin-right: 12rpx;
					}

					.title-text {
						font-size: 30rpx;
						font-weight: 600;
						color: #333333;
					}
				}

				.info-item {
					display: flex;
					margin-bottom: 16rpx;
					align-items: flex-start;

					.info-label {
						font-size: 28rpx;
						color: #666666;
						min-width: 160rpx;
						flex-shrink: 0;
					}

					.info-value {
						font-size: 28rpx;
						color: #333333;
						flex: 1;
						word-break: break-all;
					}
				}

				.sn-mac-list {
					.sn-mac-item {
						background-color: #F8F9FA;
						border: 1rpx solid #E9ECEF;
						border-radius: 8rpx;
						padding: 12rpx 16rpx;
						margin-bottom: 12rpx;

						.sn-mac-code {
							font-size: 26rpx;
							color: #333333;
							font-family: monospace;
						}
					}

					.sn-mac-count {
						text-align: center;
						margin-top: 16rpx;

						.count-text {
							font-size: 24rpx;
							color: #2492F2;
							background-color: rgba(36, 146, 242, 0.1);
							padding: 8rpx 16rpx;
							border-radius: 20rpx;
							display: inline-block;
						}
					}
				}
			}

			.warning-notice {
				background: linear-gradient(135deg, #FFF7E6, #FFF2CC);
				border: 1rpx solid #FFD666;
				border-radius: 12rpx;
				padding: 20rpx;
				display: flex;
				align-items: flex-start;
				margin-top: 30rpx;

				.warning-icon {
					font-size: 32rpx;
					margin-right: 12rpx;
					flex-shrink: 0;
				}

				.warning-text {
					font-size: 26rpx;
					color: #D46B08;
					line-height: 1.4;
					flex: 1;
				}
			}
		}

		.modal-footer {
			display: flex;
			padding: 20rpx 30rpx 40rpx;
			gap: 20rpx;

			.cancel-btn,
			.confirm-btn {
				flex: 1;
				height: 88rpx;
				border-radius: 44rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 32rpx;
				font-weight: 500;
			}

			.cancel-btn {
				background-color: #F5F5F5;
				color: #666666;
			}

			.confirm-btn {
				background: linear-gradient(135deg, #2492F2, #1890FF);
				color: #FFFFFF;
			}
		}
	}
}

@keyframes modalSlideIn {
	from {
		opacity: 0;
		transform: translateY(-50rpx) scale(0.9);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}
</style>
