<template>
	<view class="store-info-page">
		<!-- 顶部导航栏 -->
		<nav-bar :title="districtTitle" title-align="center" :fixed="true" :placeholder="true" :border="false"
			:bgColor="'#2492F2'" :titleColor="'#FFFFFF'" :backColor="'#FFFFFF'"></nav-bar>

		<!-- 导航栏占位元素 -->
		<view class="nav-placeholder"></view>

		<!-- 历史门店记录卡片 -->
		<view class="history-card">
			<button class="history-button" @click="goToHistoryRecords">
				历史门店记录
				<text class="button-count" v-if="historyRecords.length > 0">({{historyRecords.length}})</text>
			</button>
			<text class="button-tip">一键导入历史门店详情，更省时！</text>
		</view>

		<!-- 认证提示弹窗 -->
		<auth-modal :show="showAuthModal" title="提示" content="抱歉！当前城市尚未开通！!请联系微信：agan-24h" cancel-text="取消"
			confirm-text="去申请" @cancel="handleAuthCancel" @confirm="handleAuthConfirm" />

		<!-- 设备编码帮助弹窗 -->
		<view v-if="showDeviceCodeModal" class="help-modal" @click="closeDeviceCodeModal">
			<image
				src="https://ccpt.qiniu.0871.cn/home/chakanpoi.jpg"
				mode="widthFix"
				class="help-image"
				@click="closeDeviceCodeModal"
				@error="onImageError"
				@load="onImageLoad"
			></image>
		</view>

		<!-- 门店POI帮助弹窗 -->
		<view v-if="showPoiModal" class="help-modal" @click="closePoiModal">
			<image
				src="https://ccpt.qiniu.0871.cn/home/chakanpoi.jpg"
				mode="widthFix"
				class="help-image"
				@click="closePoiModal"
				@error="onImageError"
				@load="onImageLoad"
			></image>
		</view>

		<view class="info-card">

			<!-- 门店地址 -->
			<view class="form-item">
				<view class="input-row">
					<view class="label-container">
						<text class="dot"></text>
						<text>门店地址</text>
					</view>
					<view class="input-container horizontal">
						<view class="input-wrapper address-input-wrapper" @click="handleAddressSelect">
							<textarea v-model="formData.address" class="custom-input address-textarea" placeholder=" "
								disabled auto-height />
							<view class="placeholder-box" v-if="!formData.address">
								<text class="placeholder-text">选择地址定位</text>
								<image src="https://ccpt.qiniu.0871.cn/publish/address.png" class="location-icon">
								</image>
							</view>
						</view>
					</view>
				</view>

				<!-- 地图预览区域 -->
				<view class="map-preview-container" v-if="formData.latitude && formData.longitude" @click="navigateToLocation">
					<map
						:latitude="parseFloat(formData.latitude)"
						:longitude="parseFloat(formData.longitude)"
						:markers="mapMarkers"
						:show-location="false"
						:enable-scroll="false"
						:enable-zoom="false"
						:enable-rotate="false"
						style="width: 100%; height: 100%;"
					></map>
				<view class="map-overlay">
					<image src="https://ccpt.qiniu.0871.cn/publish/right.png" class="nav-icon"></image>
					<text class="nav-text">点击导航复核点位</text>
				</view>
				</view>
			</view>

			<!-- 门店名称 -->
			<view class="form-item">
				<view class="input-row">
					<view class="label-container">
						<text class="dot"></text>
						<text>门店名称</text>
					</view>
					<view class="input-container horizontal">
						<view class="input-wrapper">
							<input type="text" :value="formData.storeName"
								@input="updateField('storeName', $event.detail.value)" class="custom-input"
								placeholder=" " />
							<view class="placeholder-box" v-if="!formData.storeName">
								<image src="https://ccpt.qiniu.0871.cn/publish/bi.png" class="input-icon"></image>
								<text class="placeholder-text">点击填写门店名称</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 补充地址详情 - 已取消 -->
			<!-- <view class="form-item">
				<view class="input-row">
					<view class="label-container">
						<text>补充地址详情</text>
						<text class="optional-tag">（选填）</text>
					</view>
					<view class="input-container horizontal">
						<view class="input-wrapper">
							<input type="text" :value="formData.detailAddress"
								@input="updateField('detailAddress', $event.detail.value)" class="custom-input"
								placeholder=" " />
							<view class="placeholder-box" v-if="!formData.detailAddress">
								<text class="placeholder-text">单元、楼层、门牌号</text>
							</view>
						</view>
					</view>
				</view>
			</view> -->

			<!-- 联系电话 -->
			<view class="form-item">
				<view class="input-row">
					<view class="label-container">
						<text class="dot"></text>
						<text>联系电话</text>
					</view>
					<view class="input-container horizontal">
						<view class="input-wrapper">
							<input type="number" :value="formData.phone"
								@input="updateField('phone', $event.detail.value)" class="custom-input"
								placeholder=" " />
							<view class="placeholder-box" v-if="!formData.phone">
								<image src="https://ccpt.qiniu.0871.cn/publish/bi.png" class="input-icon"></image>
								<text class="placeholder-text">点击填写联系电话</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 联系人 - 已隐藏 -->
			<!-- <view class="form-item">
				<view class="input-row">
					<view class="label-container">
						<text>联系人</text>
						<text class="optional-tag">（选填）</text>
					</view>
					<view class="input-container horizontal">
						<view class="input-wrapper">
							<input type="text" :value="formData.contact"
								@input="updateField('contact', $event.detail.value)" class="custom-input"
								placeholder=" " />
							<view class="placeholder-box" v-if="!formData.contact">
								<text class="placeholder-text">点击填写联系人</text>
							</view>
						</view>
					</view>
				</view>
			</view> -->

			<!-- 设备编码 -->
			<view class="form-item">
				<view class="input-row" style="margin-bottom: 20rpx;">
					<view class="label-container">
						<text class="dot"></text>
						<text>设备编码</text>
						<text class="time-note">编码非常重要 避免骑手错补</text>
						<view class="help-section help-section-device" @click="showDeviceCodeHelp">
							<text class="help-text">如何看设备编码</text>
							<text class="help-icon">!</text>
						</view>
					</view>
					<view class="input-container horizontal">
						<view class="input-wrapper">
							<input type="text" :value="formData.snMacList[0].value"
								@input="updateSnMacValue(0, $event.detail.value)" class="custom-input"
								:id="'input-' + formData.snMacList[0].id" placeholder=" " />
							<view class="placeholder-box" v-if="!formData.snMacList[0].value && !snMacErrors[0]">
								<image src="https://ccpt.qiniu.0871.cn/publish/bi.png" class="input-icon"></image>
								<text class="placeholder-text">编码不低于8位数字和字母</text>
							</view>
							<!-- 第一个设备编码错误提示 -->
							<view v-if="snMacErrors[0]" class="error-tip-right">
								<text class="error-text">{{ snMacErrors[0] }}</text>
							</view>
						</view>
					</view>
			</view>
			<view class="snmac-list" v-if="isFirstSnMacValid">
				<view v-for="(snMac, index) in formData.snMacList.slice(1)" :key="snMac.id" class="snmac-item">
					<view class="input-row">
						<view class="snmac-actions">
							<text class="delete-btn" @click="removeSnMacInput(index + 1)">删除</text>
						</view>
						<view class="input-container horizontal">
							<view class="input-wrapper">
								<input type="text" :value="snMac.value"
									@input="updateSnMacValue(index + 1, $event.detail.value)" class="custom-input"
									:id="'input-' + snMac.id" placeholder=" " />
								<view class="placeholder-box" v-if="!snMac.value && !snMacErrors[index + 1]">
									<image src="https://ccpt.qiniu.0871.cn/publish/bi.png" class="input-icon">
									</image>
									<text class="placeholder-text">点击填写设备编码</text>
								</view>
								<!-- 其他设备编码错误提示 -->
								<view v-if="snMacErrors[index + 1]" class="error-tip-right">
									<text class="error-text">{{ snMacErrors[index + 1] }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="add-snmac" @click="addSnMacInput">
					<text class="add-icon">+</text>
					<text>添加设备编码</text>
				</view>
			</view>
				<!-- 门店POI备注上方添加分隔线 -->
				<view class="divider"></view>

				<!-- 设备摆放点位 -->
				<view class="form-item">
					<view class="input-row">
						<view class="label-container">
							<text class="dot"></text>
							<text>设备摆放点位</text>
						</view>
						<view class="radio-container">
							<view class="radio-group">
								<view class="radio-item" @click="updateField('device_outside', 1)">
									<view class="radio-circle" :class="{ 'radio-checked': formData.device_outside === 1 }">
										<view class="radio-inner" v-if="formData.device_outside === 1"></view>
									</view>
									<text class="radio-text">外摆</text>
								</view>
								<view class="radio-item" @click="updateField('device_outside', 0)">
									<view class="radio-circle" :class="{ 'radio-checked': formData.device_outside === 0 }">
										<view class="radio-inner" v-if="formData.device_outside === 0"></view>
									</view>
									<text class="radio-text">非外摆</text>
								</view>
								<view class="radio-item" @click="updateField('device_outside', 2)">
									<view class="radio-circle" :class="{ 'radio-checked': formData.device_outside === 2 }">
										<view class="radio-inner" v-if="formData.device_outside === 2"></view>
									</view>
									<text class="radio-text">不清楚</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 门店POI备注 -->
				<view class="form-item">
					<view class="input-row">
						<view class="label-container">
							<text>门店POI</text>
							<text class="optional-tag">（选填）</text>
							<view class="help-section help-section-poi" @click="showPoiHelp">
								<text class="help-text">如何看门店POI</text>
								<text class="help-icon">!</text>
							</view>
						</view>
						<view class="input-container horizontal">
							<view class="input-wrapper">
								<input type="text" :value="formData.poiRemark"
									@input="updateField('poiRemark', $event.detail.value)" class="custom-input"
									placeholder=" " />
								<view class="placeholder-box" v-if="!formData.poiRemark">
									<text class="placeholder-text">点击填写门店POI</text>
								</view>
							</view>
						</view>
					</view>
				</view>

			<!-- 分隔线 -->
			<view class="divider"></view>

		<!-- 建议骑手上门时间段 - 已取消 -->
		<!-- <view class="form-item" style="margin-bottom:30rpx">
			<view class="input-row">
				<view class="label-container">
					<text class="dot"></text>
					<text>建议骑手上门时间段</text>
					<text class="time-note">便于骑手高效完单！</text>
				</view>
				<view class="input-container horizontal">
					<view class="input-wrapper" @click="showTimeRangePicker">
						<view class="time-display-wrapper">
							<text class="time-display-text">{{ getTimeRangeDisplay() }}</text>
							<image src="https://ccpt.qiniu.0871.cn/publish/right.png" class="time-arrow"></image>
						</view>
					</view>
				</view>
			</view>
		</view> -->

		<!-- 分隔线 -->
		<!-- <view class="divider"></view> -->
		</view>

			<!-- 上传门头 -->
			<view class="form-item">
				<view class="upload-header">
					<view class="upload-title">
						<text class="title-text">上传门头</text>
						<text class="optional-tag">（选填）</text>
					</view>
					<view class="upload-tip">
						<image src="https://ccpt.qiniu.0871.cn/publish/Tips.png" mode="aspectFit" class="tip-icon">
						</image>
						<text class="tip-text">门店门头便于充充骑手快速准确找到门店完成订单！可从工作台、美团或第三方导航中获取</text>
					</view>
				</view>
				<view class="upload-container">
					<view class="upload-list">
						<!-- 已上传的图片列表 -->
						<view v-for="(item, index) in formData.doorImages" :key="index" class="upload-item">
							<image :src="item" mode="aspectFill" class="preview-image"></image>
							<view class="delete-icon" @click.stop="deleteImage(index)">×</view>
						</view>

						<!-- 上传按钮 -->
						<view class="upload-btn" @click="uploadImage" v-if="formData.doorImages.length < 5">
							<image src="https://ccpt.qiniu.0871.cn/publish/mentou.png" mode="aspectFit"
								class="upload-icon"></image>
							<text class="upload-text">选择图片</text>
						</view>
					</view>
				</view>
				<!-- <view class="divider"></view> -->
			</view>

			<!-- 门店详情描述 -->
			<!-- <view class="form-item">
				<view class="form-label">
					<text>门店详情描述</text>
					<text class="optional-tag">（选填）</text>
				</view>
				<view class="textarea-container">
					<textarea v-model="formData.locationDesc" @input="updateField('locationDesc', $event.detail.value)"
						placeholder="为更高效及时完成运维服务，可补充说明商户情况/态度、设备特点、门店特征和地标。" maxlength="200" />
					<view class="char-count char-count-abs">{{ (formData.locationDesc || '').length }}/200</view>
				</view>
			</view> -->
		</view>

		<!-- 底部按钮 -->
		<view class="bottom-button" v-if="!showTimeRangePopup">
			<button class="save-btn" @click="saveStoreInfo">保存</button>
		</view>

		<!-- 悬浮聊天图标 -->
		<FloatingChatIconUser />

		<!-- 时间段选择弹窗 -->
		<uni-popup ref="timeRangePopup" type="bottom" @change="onTimeRangePopupChange" :mask-click="true" :z-index="99999999">
			<view class="time-range-popup">
				<view class="popup-header">
					<text class="title">选择时间段</text>
					<text class="close" @tap="closeTimeRangePopup">×</text>
				</view>
				<view class="popup-content">
					<!-- 表头 -->
					<view class="picker-header">
						<text class="header-item">开始时</text>
						<text class="header-item">开始分</text>
						<text class="header-item">结束时</text>
						<text class="header-item">结束分</text>
					</view>
					<!-- picker-view -->
					<picker-view
						class="time-picker-view"
						:value="timeRangeIndex"
						@change="onTimeRangePickerChange"
						:indicator-style="indicatorStyle"
					>
						<picker-view-column>
							<view class="picker-item" v-for="(item, index) in timeRangePickerData[0]" :key="index">
								<text>{{ item }}</text>
							</view>
						</picker-view-column>
						<picker-view-column>
							<view class="picker-item" v-for="(item, index) in timeRangePickerData[1]" :key="index">
								<text>{{ item }}</text>
							</view>
						</picker-view-column>
						<picker-view-column>
							<view class="picker-item" v-for="(item, index) in timeRangePickerData[2]" :key="index">
								<text>{{ item }}</text>
							</view>
						</picker-view-column>
						<picker-view-column>
							<view class="picker-item" v-for="(item, index) in timeRangePickerData[3]" :key="index">
								<text>{{ item }}</text>
							</view>
						</picker-view-column>
					</picker-view>
					<view class="popup-footer">
						<button class="confirm-btn" @tap="confirmTimeRange">确定</button>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 门店地址弹窗已取消 -->
		<!-- <auth-modal
			:show="showAddressPopup"
			title="提示！"
			:content="'当前选择了' + selectedCity + '与下单地址不符，请核对是否有误'"
			cancel-text="取消"
			confirm-text="知道了"
			@confirm="showAddressPopup=false; "
			@cancel="showAddressPopup=false; formData.address = ''"
		/> -->
	</view>
</template>

<script>
	import AuthModal from '@/components/AuthModal/index.vue'
	import FloatingChatIconUser from '@/components/FloatingChatIconUser/index.vue'

	export default {
		components: {
			AuthModal,
			FloatingChatIconUser
		},
		watch: {
			'formData.address'(newValue) {
				if(newValue == '' || newValue == undefined){
					return
				}
				let selectedCity = uni.getStorageSync('selectedCity') || ''
				selectedCity = selectedCity.replace(/·/g, '').replace(/ /g, '')
				console.log('selectedCity', selectedCity)
				// 取消门店地址弹窗 - 注释掉原有的弹窗触发逻辑
				// if (!newValue.includes(selectedCity) && selectedCity != '') {
				// 	this.showAddressPopup = true
				// }
			}
		},
		data() {
			return {
				showAddressPopup: false,
				selectedCity: '',
				formData: {
					address: '',
					detailAddress: '',
					storeName: '',
					snMacList: [{
						id: Date.now(),
						value: ''
					}],
					device_outside: '', // 设备是否外摆，必填项，空字符串表示未选择
					poiRemark: '', // 添加门店POI备注字段
					phone: '',
					contact: '',
					doorImages: [],
					locationDesc: '',
					province: '',
					city: '',
					district: '',
					latitude: 0,
					longitude: 0,
					distance: 0,
					user_id: 0,
					recommended_service_time_start: '', // 建议骑手上门开始时间
					recommended_service_time_end: '', // 建议骑手上门结束时间
				},
				historyRecords: [],
				showAuthModal: false,
				snMacErrors: {}, // 存储设备编码的错误信息，key为index，value为错误信息
				showDeviceCodeModal: false, // 控制设备编码帮助弹窗显示
				showPoiModal: false, // 控制门店POI帮助弹窗显示
				// 时间段选择相关
				timeRangePickerData: [],
				timeRangeIndex: [1, 0, 9, 0], // 默认选择 01:00 - 09:00
				tempTimeRangeIndex: [1, 0, 9, 0],
				showTimeRangePopup: false,
				indicatorStyle: 'height: 50px;'
			}
		},
		onLoad() {
			// 初始化 selectedCity
			this.selectedCity = uni.getStorageSync('selectedCity') || '';
			
			// 初始化时间段选择器数据
			this.initTimeRangePickerData();
			
			// 安全获取用户信息
			const userInfo = uni.getStorageSync('userInfo')
			if (userInfo && typeof userInfo === 'object') {
				// 设置默认的联系电话和联系人
				this.formData.phone = userInfo.phone_number || ''
				this.formData.contact = userInfo.username || ''
				this.formData.user_id = userInfo.user_id || 0
			} else {
				console.warn('用户信息获取失败或格式错误');
				this.formData.user_id = 0;
			}

			// 安全获取本地存储的门店信息
			try {
				const storeInfo = uni.getStorageSync('storeInfo')
				if (storeInfo && typeof storeInfo === 'object') {
					// 确保 snMacList 是对象数组格式
					if (storeInfo.snMacList && Array.isArray(storeInfo.snMacList)) {
						storeInfo.snMacList = storeInfo.snMacList.map((item, index) => {
							if (typeof item === 'string') {
								return {
									id: Date.now() + index,
									value: item
								}
							} else if (item && typeof item === 'object' && item.value !== undefined) {
								return {
									id: item.id || Date.now() + index,
									value: String(item.value)
								}
							}
							return {
								id: Date.now() + index,
								value: ''
							}
						})
					} else {
						// 如果没有或格式不正确，使用默认值
						storeInfo.snMacList = this.formData.snMacList;
					}
					
				// 安全合并数据，确保数据类型正确
				this.formData = {
					...this.formData,
					address: String(storeInfo.address || ''),
					detailAddress: String(storeInfo.detailAddress || ''),
					storeName: String(storeInfo.storeName || ''),
					snMacList: storeInfo.snMacList,
					device_outside: (storeInfo.device_outside === 0 || storeInfo.device_outside === 1 || storeInfo.device_outside === 2) ? storeInfo.device_outside : '', // 只接受有效的数值选择
					poiRemark: String(storeInfo.shop_poi || storeInfo.poiRemark || ''), // 优先读取 shop_poi，兼容旧的 poiRemark
					phone: String(storeInfo.phone || this.formData.phone),
					contact: String(storeInfo.contact || this.formData.contact),
					doorImages: Array.isArray(storeInfo.doorImages) ? storeInfo.doorImages : [],
					locationDesc: String(storeInfo.locationDesc || ''),
					province: String(storeInfo.province || ''),
					city: String(storeInfo.city || ''),
					district: String(storeInfo.district || ''),
					latitude: parseFloat(storeInfo.latitude) || 0,
					longitude: parseFloat(storeInfo.longitude) || 0,
					distance: parseFloat(storeInfo.distance) || 0,
					user_id: storeInfo.user_id || this.formData.user_id,
					recommended_service_time_start: String(storeInfo.recommended_service_time_start || ''),
					recommended_service_time_end: String(storeInfo.recommended_service_time_end || ''),
				}
				}
			} catch (error) {
				console.error('获取本地门店信息失败:', error);
				// 使用默认值，不影响页面正常显示
			}

			// 获取历史门店记录（移到onShow中执行）
			// this.historyRecords = uni.getStorageSync('storeHistoryRecords') || []
		},
		onShow() {
			// 刷新 selectedCity 以更新标题显示
			this.selectedCity = uni.getStorageSync('selectedCity') || '';
			console.log('刷新 selectedCity:', this.selectedCity);
			
			// 获取历史门店记录
			this.gethistoryRecords()
			// 获取城市列表
			const cityList = uni.getStorageSync('cityList');
			// 只在有地址的情况下进行验证
			if (cityList && this.formData.address && this.formData.province && this.formData.city && this.formData
				.district) {
				let parsedCityList;
				try {
					// 尝试解析 JSON 字符串
					parsedCityList = typeof cityList === 'string' ? JSON.parse(cityList) : cityList;

					// 添加调试日志
					console.log('当前选择的地址:', {
						province: this.formData.province,
						city: this.formData.city,
						district: this.formData.district
					});
					console.log('用户选择的城市 selectedCity:', uni.getStorageSync('selectedCity'));
					console.log('服务区域列表:', parsedCityList);

					// 检查选择的地址是否在服务范围内
					let district_id;

					// 获取用户实际选择的城市信息，作为备用匹配数据
					const selectedCity = uni.getStorageSync('selectedCity') || '';
					let alternativeDistrict = '';
					if (selectedCity && selectedCity.includes(' · ')) {
						const parts = selectedCity.split(' · ');
						if (parts.length >= 2) {
							alternativeDistrict = parts[1]; // 如"大岭山镇"
						}
					}
					console.log('备用区县匹配数据:', alternativeDistrict);

					// 创建地址匹配函数，支持镇名匹配
					const isAddressMatch = (districtName, targetDistrict) => {
						// 精确匹配
						if (districtName === targetDistrict) {
							return true;
						}

						// 处理包含镇名的情况
						// 例如: targetDistrict = "大岭山镇", districtName = "东莞市" 或 "大岭山"
						if (targetDistrict.includes('镇') || targetDistrict.includes('街道') || targetDistrict.includes('乡')) {
							// 提取镇名（去掉"镇"、"街道"、"乡"等后缀）
							const townName = targetDistrict.replace(/[镇街道乡]/g, '');

							// 检查区县名是否包含镇名
							if (districtName.includes(townName)) {
								return true;
							}

							// 检查是否是同一个行政区域的不同表述
							// 比如"大岭山镇"属于"东莞市"
							if (districtName.includes('市') && targetDistrict.includes('镇')) {
								// 这种情况下需要根据实际的行政区划关系判断
								// 这里可以扩展更复杂的匹配逻辑
								return true;
							}
						}

						// 反向匹配：如果districtName包含镇名，targetDistrict是区县名
						if (districtName.includes('镇') || districtName.includes('街道') || districtName.includes('乡')) {
							const townNameFromDistrict = districtName.replace(/[镇街道乡]/g, '');
							if (targetDistrict.includes(townNameFromDistrict)) {
								return true;
							}
						}

						return false;
					};

					const isServiceAvailable = parsedCityList.some(provinceItem => {
						// 检查省级
						if (provinceItem.name === this.formData.province) {
							// 检查市级
							if (provinceItem.children && Array.isArray(provinceItem.children)) {
								return provinceItem.children.some(cityItem => {
									// 检查城市名称是否匹配
									if (cityItem.name === this.formData.city) {
										// 特殊处理：如果city与district同名，只匹配市级即可
										if (this.formData.city === this.formData.district) {
											console.log('城市与区县同名，直接匹配市级:', this.formData.city);
											uni.setStorageSync('selectedDistrictId_new', cityItem.city_id);
											return true;
										}

										// 检查区县级
										if (cityItem.children && Array.isArray(cityItem.children)) {
											// 先查找精确匹配或镇名匹配的项目
											let matchedDistrictItem = cityItem.children.find(districtItem =>
												isAddressMatch(districtItem.name, this.formData.district)
											);

											// 如果没有匹配到，尝试使用备用区县数据匹配
											if (!matchedDistrictItem && alternativeDistrict) {
												console.log('尝试使用备用区县数据匹配:', alternativeDistrict);
												matchedDistrictItem = cityItem.children.find(districtItem =>
													isAddressMatch(districtItem.name, alternativeDistrict)
												);
											}

											// 如果仍未匹配到，尝试从selectedCity中提取更多信息
											if (!matchedDistrictItem && selectedCity) {
												console.log('尝试使用selectedCity完整信息匹配');
												const cityPart = selectedCity.split(' · ')[0]; // 如"东莞市"
												const districtPart = selectedCity.split(' · ')[1]; // 如"大岭山镇"

												// 检查城市名称是否与selectedCity一致，如果不一致可能需要特殊处理
												if (cityPart && cityPart.includes(this.formData.city)) {
													matchedDistrictItem = cityItem.children.find(districtItem => {
														// 尝试多种匹配方式
														return isAddressMatch(districtItem.name, districtPart) ||
															   isAddressMatch(districtItem.name, districtPart?.replace(/[镇街道乡]/g, '')) ||
															   districtItem.name.includes(districtPart?.replace(/[镇街道乡]/g, ''));
													});

													if (matchedDistrictItem) {
														console.log('通过selectedCity扩展匹配成功:', districtPart, '→', matchedDistrictItem.name);
													}
												}
											}

											if (matchedDistrictItem) {
												console.log('匹配到的区县项:', matchedDistrictItem);
												uni.setStorageSync('selectedDistrictId_new', matchedDistrictItem.district_id);
												district_id = matchedDistrictItem.district_id;
												return true;
											}

											console.log('未找到匹配的区县项，当前检查的城市:', cityItem.name);
											console.log('可用的区县列表:', cityItem.children.map(d => d.name));
											return false;
										}
									}
									return false;
								});
							}
						}
						return false;
					});

					console.log('最终判断结果:', isServiceAvailable, district_id);

					// 添加详细的调试信息，帮助理解匹配失败的原因
					if (!isServiceAvailable) {
						console.log('=== 地址匹配失败调试信息 ===');
						console.log('用户选择的服务城市:', uni.getStorageSync('selectedCity'));
						console.log('地址解析的城市信息:', {
							province: this.formData.province,
							city: this.formData.city,
							district: this.formData.district,
							address: this.formData.address
						});
						console.log('alternativeDistrict:', alternativeDistrict);

						// 显示具体哪个层级匹配失败
						const matchingProvinceItem = parsedCityList.find(provinceItem =>
							provinceItem.name === this.formData.province
						);
						if (!matchingProvinceItem) {
							console.log('❌ 省级匹配失败:', this.formData.province);
							console.log('可用省份列表:', parsedCityList.map(p => p.name));
						} else {
							console.log('✅ 省级匹配成功:', matchingProvinceItem.name);

							const matchingCityItem = matchingProvinceItem.children?.find(cityItem =>
								cityItem.name === this.formData.city
							);
							if (!matchingCityItem) {
								console.log('❌ 地址所在城市未开通服务:', this.formData.city);
								console.log('当前省份已开通的城市列表:', matchingProvinceItem.children?.map(c => c.name));

								// 显示友好的提示信息
								uni.showToast({
									title: `${this.formData.city}暂未开通服务`,
									icon: 'none',
									duration: 3000
								});
							} else {
								console.log('✅ 市级匹配成功:', matchingCityItem.name);
								console.log('❌ 区县级匹配失败:', this.formData.district);
								console.log('可用区县列表:', matchingCityItem.children?.map(d => d.name));
							}
						}
						console.log('=== 调试信息结束 ===');

						// 只有在确实是服务区域问题时才显示弹窗
						this.showAuthModal = true;
					}
				} catch (error) {
					console.error('解析城市列表失败:', error);
				}
			}
		},
		computed: {
			// 顶部标题：显示所选城市和区县（与发布订单页保持一致）
			districtTitle() {
				// 使用 data 中的 selectedCity，确保响应式更新
				return this.selectedCity || '服务门店信息'; // 显示完整的"城市 · 区县"或默认标题
			},
			// 地图标记点
			mapMarkers() {
				if (!this.formData.latitude || !this.formData.longitude) {
					return [];
				}
		return [{
			id: 1,
			latitude: parseFloat(this.formData.latitude),
			longitude: parseFloat(this.formData.longitude),
			width: 1,
			height: 1,
			callout: {
				content: this.formData.storeName || '门店位置',
				color: '#333333',
				fontSize: 12,
				borderRadius: 4,
				bgColor: '#FFFFFF',
				padding: 8,
				display: 'ALWAYS'
			}
		}];
		},
		// 判断第一个设备编码是否有效
		isFirstSnMacValid() {
			if (!this.formData.snMacList || this.formData.snMacList.length === 0) {
				return false;
			}
			const firstValue = this.formData.snMacList[0].value;
			// 检查第一个设备编码是否有值、没有错误、且长度不少于8位、只包含数字和字母
			if (!firstValue || firstValue.trim() === '') {
				return false;
			}
			if (this.snMacErrors[0]) {
				return false;
			}
			if (firstValue.trim().length < 8) {
				return false;
			}
			const regex = /^[a-zA-Z0-9]+$/;
			if (!regex.test(firstValue.trim())) {
				return false;
			}
			return true;
		}
	},
		methods: {
			// 导航到门店位置
			navigateToLocation() {
				if (!this.formData.latitude || !this.formData.longitude) {
					uni.showToast({
						title: '门店位置信息缺失',
						icon: 'none'
					});
					return;
				}

				const latitude = parseFloat(this.formData.latitude);
				const longitude = parseFloat(this.formData.longitude);
				const name = this.formData.storeName || '目的地';
				const address = this.formData.address || '';

				uni.openLocation({
					latitude,
					longitude,
					name,
					address,
					scale: 18,
					success: () => {
						console.log('打开地图成功');
					},
					fail: (err) => {
						console.error('打开地图失败:', err);
						uni.showToast({
							title: '打开地图失败',
							icon: 'none'
						});
					}
				});
			},
			async gethistoryRecords() {
				try {
					// 检查用户ID是否有效
					if (!this.formData.user_id || this.formData.user_id <= 0) {
						console.warn('用户ID无效，无法获取历史记录');
						this.historyRecords = [];
						return;
					}

					// 显示加载提示
					uni.showLoading({
						title: '加载中...',
						mask: true
					});

					const submitData = {
						user_id: this.formData.user_id
					}

					// 调用接口获取数据
					const res = await this.$request('user/addresses/get', submitData, 'POST');

					if (res && res.status === 'success') {
						// 确保返回的数据是数组格式
						this.historyRecords = Array.isArray(res.data) ? res.data : [];

						// 保存到本地存储
						try {
							uni.setStorageSync('storeHistoryRecords', this.historyRecords);
						} catch (storageError) {
							console.warn('保存历史记录到本地失败:', storageError);
						}
					} else {
						console.warn('获取历史记录失败:', res?.msg || res?.message || '未知错误');
						this.historyRecords = [];
					}
				} catch (error) {
					console.error('获取历史记录接口调用失败:', error);
					this.historyRecords = [];
					
					// 尝试从本地获取历史记录作为降级方案
					try {
						const localRecords = uni.getStorageSync('storeHistoryRecords');
						if (Array.isArray(localRecords)) {
							this.historyRecords = localRecords;
							console.log('使用本地缓存的历史记录');
						}
					} catch (localError) {
						console.warn('获取本地历史记录失败:', localError);
					}
				} finally {
					// 隐藏加载提示
					uni.hideLoading();
				}
			},
			handleAddressSelect() {
				uni.navigateTo({
					url: '/pages/index/publish/map/index'
				})
			},
			removeSnMacInput(index) {
				this.formData.snMacList.splice(index, 1);
				// 清除对应的错误信息
				this.$delete(this.snMacErrors, index);
				// 重新整理错误信息的索引
				const newErrors = {};
				Object.keys(this.snMacErrors).forEach(key => {
					const keyIndex = parseInt(key);
					if (keyIndex > index) {
						newErrors[keyIndex - 1] = this.snMacErrors[key];
					} else if (keyIndex < index) {
						newErrors[keyIndex] = this.snMacErrors[key];
					}
				});
				this.snMacErrors = newErrors;
			},
			addSnMacInput() {
				const newId = Date.now();
				this.formData.snMacList.push({
					id: newId,
					value: ''
				});

				// 使用nextTick确保DOM更新后再聚焦
				this.$nextTick(() => {
					// 使用uni-app的createSelectorQuery获取最后一个输入框
					const query = uni.createSelectorQuery().in(this);
					query.selectAll('.custom-input').boundingClientRect(data => {
						if (data && data.length > 0) {
							// 获取最后一个输入框的节点
							const lastInput = data[data.length - 1];
							// 使用uni-app的focus方法聚焦
							uni.createSelectorQuery().in(this).select(`#input-${newId}`).node().exec(
							res => {
								if (res[0] && res[0].node) {
									res[0].node.focus();
								}
							});
						}
					}).exec();
				});
			},
			deleteImage(index) {
				this.formData.doorImages.splice(index, 1)
			},
			uploadImage() {
				const maxCount = 5 - this.formData.doorImages.length;
				if (maxCount <= 0) {
					uni.showToast({
						title: '最多只能上传5张图片',
						icon: 'none'
					});
					return;
				}

				uni.chooseImage({
					count: maxCount,
					sizeType: ['compressed', 'original'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						if (res.tempFilePaths && res.tempFilePaths.length > 0) {
							// 逐个上传图片
							this.uploadMultipleImages(res.tempFilePaths);
						}
					},
					fail: (error) => {
						console.error('选择图片失败:', error);
						uni.showToast({
							title: '选择图片失败',
							icon: 'none'
						});
					}
				});
			},
			
			// 批量上传图片
			async uploadMultipleImages(tempFilePaths) {
				const uploadPromises = tempFilePaths.map(filePath => this.qiniuUploadFile(filePath));
				
				try {
					uni.showLoading({
						title: '上传中...',
						mask: true
					});

					const results = await Promise.allSettled(uploadPromises);
					let successCount = 0;
					
					results.forEach((result, index) => {
						if (result.status === 'fulfilled') {
							successCount++;
						} else {
							console.error(`第${index + 1}张图片上传失败:`, result.reason);
						}
					});

					uni.hideLoading();

					if (successCount > 0) {
						uni.showToast({
							title: `成功上传${successCount}张图片`,
							icon: 'success'
						});
					} else {
						uni.showToast({
							title: '图片上传失败，请重试',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error('批量上传失败:', error);
					uni.showToast({
						title: '上传失败，请重试',
						icon: 'none'
					});
				}
			},

			// 单个图片上传到七牛云
			qiniuUploadFile(filePath) {
				return new Promise((resolve, reject) => {
					uni.uploadFile({
						url: 'https://tixian.0871.cn/upload/qiniuImageUpload',
						filePath: filePath,
						name: 'image',
						formData: {
							'spaceName': 'agan_complain'
						},
						timeout: 30000, // 设置30秒超时
						success: (uploadFileRes) => {
							try {
								if (uploadFileRes.statusCode === 200) {
									const res = JSON.parse(uploadFileRes.data);
									if (res && res.path) {
										// 添加到图片列表
										this.formData.doorImages = [...this.formData.doorImages, res.path];
										console.log('图片上传成功:', res.path);
										resolve(res.path);
									} else {
										console.error('服务器返回数据格式错误:', res);
										reject(new Error('服务器返回数据格式错误'));
									}
								} else {
									console.error('上传失败，状态码:', uploadFileRes.statusCode);
									reject(new Error(`上传失败，状态码: ${uploadFileRes.statusCode}`));
								}
							} catch (parseError) {
								console.error('解析上传结果失败:', parseError);
								reject(new Error('解析上传结果失败'));
							}
						},
						fail: (error) => {
							console.error('图片上传失败:', error);
							reject(new Error('网络错误或上传超时'));
						}
					});
				});
			},
			updateField(field, value) {
				this.formData[field] = value;
				
				// 特殊处理：当设置 device_outside 时，添加日志便于调试
				if (field === 'device_outside') {
					console.log('设置 device_outside 值:', value, '类型:', typeof value);
				}
			},
			updateSnMacValue(index, value) {
				if (this.formData.snMacList[index]) {
					this.formData.snMacList[index].value = value;

					// 清除之前的错误信息
					this.$set(this.snMacErrors, index, '');

					// 检查是否为空
					if (!value || value.trim() === '') {
						this.$set(this.snMacErrors, index, '设备编码不能为空');
						return;
					}

					// 检查长度是否不低于8位
					if (value.trim().length < 8) {
						this.$set(this.snMacErrors, index, '设备编码不能少于8位');
						return;
					}

					// 检查是否只包含数字和字母
					const regex = /^[a-zA-Z0-9]+$/;
					if (!regex.test(value.trim())) {
						this.$set(this.snMacErrors, index, '设备编码只能包含数字和字母');
						return;
					}

					// 验证通过，清除错误信息
					this.$set(this.snMacErrors, index, '');
				}
			},
			// 表单验证函数
			validateFormData() {
				// 检查地址
				if (!this.formData.address || this.formData.address.trim() === '') {
					return { isValid: false, message: '请选择门店地址' };
				}

				// 检查门店名称
				if (!this.formData.storeName || this.formData.storeName.trim() === '') {
					return { isValid: false, message: '请填写门店名称' };
				}

				// 检查联系电话
				if (!this.formData.phone || this.formData.phone.trim() === '') {
					return { isValid: false, message: '请填写联系电话' };
				}

				// 验证手机号格式
				const phoneRegex = /^1[3-9]\d{9}$/;
				if (!phoneRegex.test(this.formData.phone.trim())) {
					return { isValid: false, message: '请输入正确的手机号码格式' };
				}

				// 检查设备编码
				if (!this.formData.snMacList || this.formData.snMacList.length === 0) {
					return { isValid: false, message: '请添加至少一个设备编码' };
				}

				// 验证所有设备编码
				for (let i = 0; i < this.formData.snMacList.length; i++) {
					const snMac = this.formData.snMacList[i];
					if (!snMac.value || snMac.value.trim() === '') {
						return { isValid: false, message: `请填写第${i + 1}个设备编码` };
					}

					const trimmedValue = snMac.value.trim();
					// 检查长度
					if (trimmedValue.length < 8) {
						return { isValid: false, message: `第${i + 1}个设备编码不能少于8位` };
					}
					
					// 检查格式（只允许字母和数字）
					const regex = /^[a-zA-Z0-9]+$/;
					if (!regex.test(trimmedValue)) {
						return { isValid: false, message: `第${i + 1}个设备编码只能包含数字和字母` };
					}
				}

				// 严格验证设备摆放点位必填项 - 必须是有效的数值选择
				console.log('验证 device_outside 值:', this.formData.device_outside, '类型:', typeof this.formData.device_outside);

				if (this.formData.device_outside === '' ||
					this.formData.device_outside === null ||
					this.formData.device_outside === undefined ||
					(this.formData.device_outside !== 0 && this.formData.device_outside !== 1 && this.formData.device_outside !== 2)) {
					return { isValid: false, message: '请选择设备摆放点位（外摆/非外摆/不清楚）' };
				}

			// 验证建议骑手上门时间段（已取消必填）
			// if (!this.formData.recommended_service_time_start || !this.formData.recommended_service_time_end) {
			// 	return { isValid: false, message: '请选择建议骑手上门时间段' };
			// }

			return { isValid: true, message: '' };
			},
			
			// 更新发布页面数据
			updatePublishPageData(deviceOutsideValue) {
				try {
					// 获取所有页面
					const pages = getCurrentPages();
					// 获取发布订单页实例（上一个页面）
					const publishPage = pages[pages.length - 2];

					if (publishPage && publishPage.$vm) {
						// 【修复】同步更新发布页面的区域选择数据
						const selectedDistrictId = uni.getStorageSync('selectedDistrictId');
						const selectedCity = uni.getStorageSync('selectedCity');
						if (selectedDistrictId) {
							publishPage.$vm.selectedDistrictId = selectedDistrictId;
							console.log('✅ 已同步更新发布页面的 selectedDistrictId:', selectedDistrictId);
						}
						if (selectedCity) {
							publishPage.$vm.selectedCity = selectedCity;
							console.log('✅ 已同步更新发布页面的 selectedCity:', selectedCity);
						}
						
					// 更新发布订单页的 formData
					publishPage.$vm.formData = {
						...publishPage.$vm.formData,
						storeName: this.formData.storeName,
						address: this.formData.address,
						detailAddress: this.formData.detailAddress,
						phone: this.formData.phone,
						contact: this.formData.contact,
						snMacList: this.formData.snMacList,
						device_outside: deviceOutsideValue,
						shop_poi: this.formData.poiRemark, // 将poiRemark的值赋给shop_poi字段
						doorImages: this.formData.doorImages,
						locationDesc: this.formData.locationDesc,
						latitude: this.formData.latitude,
						longitude: this.formData.longitude,
						province: this.formData.province,
						city: this.formData.city,
						district: this.formData.district,
						recommended_service_time_start: this.formData.recommended_service_time_start,
						recommended_service_time_end: this.formData.recommended_service_time_end,
						// 注意：不设置distance，让价格计算函数根据坐标重新计算
						// distance: this.formData.distance,
					};

						// 强制更新发布页面并重新计算价格
						publishPage.$vm.$forceUpdate();

						// 【关键】重新获取服务商信息（使用更新后的 selectedDistrictId）
						if (typeof publishPage.$vm.getProviderInfo === 'function') {
							publishPage.$vm.$nextTick(async () => {
								await publishPage.$vm.getProviderInfo();
								console.log('门店信息保存后重新获取服务商信息并重新计算价格');
							});
						} else {
							// 如果没有 getProviderInfo 方法，则直接重新计算价格
							if (typeof publishPage.$vm.calculatePrice === 'function') {
								publishPage.$vm.$nextTick(() => {
									publishPage.$vm.calculatePrice();
									console.log('门店信息保存后重新计算价格');
								});
							}
						}

						console.log('已更新发布页面数据');
					} else {
						console.warn('未找到发布页面实例，无法更新数据');
					}
				} catch (error) {
					console.error('更新发布页面数据失败:', error);
					// 这里不阻断保存流程，只记录错误
				}
			},
			async saveStoreInfo() {
				try {
					// 验证表单数据
					const validationResult = this.validateFormData();
					if (!validationResult.isValid) {
						console.error('表单验证失败:', validationResult.message, '当前 device_outside 值:', this.formData.device_outside);
						uni.showToast({
							title: validationResult.message,
							icon: 'none',
							duration: 3000
						});
						return;
					}

					// 双重检查：确保 device_outside 一定有有效值
					if (this.formData.device_outside !== 0 && this.formData.device_outside !== 1 && this.formData.device_outside !== 2) {
						console.error('设备摆放点位验证失败，当前值:', this.formData.device_outside);
						uni.showToast({
							title: '请选择设备摆放点位选项',
							icon: 'none',
							duration: 3000
						});
						return;
					}

					// 检查地址坐标是否完整
					if (!this.formData.latitude || !this.formData.longitude) {
						uni.showToast({
							title: '请重新选择门店地址，确保位置准确',
							icon: 'none',
							duration: 3000
						});
						return;
					}

					// 检查地址信息是否完整
					if (!this.formData.province || !this.formData.city || !this.formData.district) {
						uni.showToast({
							title: '地址信息不完整，请重新选择门店地址',
							icon: 'none',
							duration: 3000
						});
						return;
					}

					// 转换 device_outside 值
					let deviceOutsideValue = this.formData.device_outside;
					if (deviceOutsideValue === 1) {
						deviceOutsideValue = true;
					} else if (deviceOutsideValue === 0) {
						deviceOutsideValue = false;
					} else if (deviceOutsideValue === 2) {
						deviceOutsideValue = null; // "不清楚"的情况
					} else {
						// 理论上不会到这里，因为验证已经确保必须选择
						deviceOutsideValue = null;
					}

					// 处理设备编码数据，确保格式正确
					const processedSnMacList = this.formData.snMacList
						.filter(item => item.value && item.value.trim()) // 过滤空值
						.map(item => ({
							id: item.id,
							value: item.value.trim().toUpperCase() // 统一转为大写
						}));

				const submitData = {
					user_id: this.formData.user_id || 0,
					store_name: this.formData.storeName.trim(),
					address: this.formData.address.trim(),
					detail_address: this.formData.detailAddress ? this.formData.detailAddress.trim() : '',
					longitude: parseFloat(this.formData.longitude) || 0,
					latitude: parseFloat(this.formData.latitude) || 0,
					province: this.formData.province.trim(),
					city: this.formData.city.trim(),
					district: this.formData.district.trim(),
					snMaclist: processedSnMacList,
					device_outside: deviceOutsideValue,
					poi_remark: this.formData.poiRemark ? this.formData.poiRemark.trim() : '',
					doorImages: this.formData.doorImages || [],
					location_description: this.formData.locationDesc ? this.formData.locationDesc.trim() : '',
					phone_number: this.formData.phone.trim(),
					name: this.formData.contact ? this.formData.contact.trim() : '',
					distance: parseFloat(this.formData.distance) || 0,
					recommended_service_time_start: this.formData.recommended_service_time_start || '',
					recommended_service_time_end: this.formData.recommended_service_time_end || '',
				};

					console.log('提交数据:', submitData);

					// 显示加载提示
					uni.showLoading({
						title: '保存中...',
						mask: true
					});

					// 调用接口保存数据
					const res = await this.$request('user/addresses/create', submitData, 'POST');

					// 隐藏加载提示
					uni.hideLoading();

					console.log('保存响应:', res);

				if (res.status === 'success') {
					// 【关键修复】将 selectedDistrictId_new 覆盖到 selectedDistrictId
					const selectedDistrictId_new = uni.getStorageSync('selectedDistrictId_new');
					if (selectedDistrictId_new) {
						uni.setStorageSync('selectedDistrictId', selectedDistrictId_new);
						console.log('✅ 已将 selectedDistrictId_new 覆盖到 selectedDistrictId:', selectedDistrictId_new);
						// 清除 selectedDistrictId_new
						uni.removeStorageSync('selectedDistrictId_new');
					}
					
					// 保存成功后更新页面数据
					this.updatePublishPageData(deviceOutsideValue);
					
					// 显示保存成功提示
					uni.showToast({
						title: '保存成功',
						icon: 'success',
						duration: 2000
					});

					// 延迟跳转
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						});
					}, 1500);
					} else {
						// 根据不同错误类型显示不同提示
						let errorMessage = '保存失败，请重试';
						if (res.msg) {
							errorMessage = res.msg;
						} else if (res.message) {
							errorMessage = res.message;
						} else if (res.error) {
							errorMessage = res.error;
						}
						
						uni.showToast({
							title: errorMessage,
							icon: 'none',
							duration: 3000
						});
						
						console.error('保存失败，服务器返回:', res);
					}
				} catch (error) {
					// 隐藏加载提示
					uni.hideLoading();

					console.error('保存门店信息失败:', error);
					
					let errorMessage = '网络错误，请检查网络连接后重试';
					
					// 根据错误类型提供更具体的错误信息
					if (error.message && error.message.includes('timeout')) {
						errorMessage = '请求超时，请稍后重试';
					} else if (error.message && error.message.includes('400')) {
						errorMessage = '提交数据格式错误，请检查填写内容';
					} else if (error.message && error.message.includes('500')) {
						errorMessage = '服务器错误，请稍后重试';
					} else if (error.message) {
						errorMessage = `请求失败：${error.message}`;
					}
					
					uni.showToast({
						title: errorMessage,
						icon: 'none',
						duration: 3000
					});
				}
			},
			// 格式化时间
			formatTime(timestamp) {
				const date = new Date(timestamp)
				const year = date.getFullYear()
				const month = (date.getMonth() + 1).toString().padStart(2, '0')
				const day = date.getDate().toString().padStart(2, '0')
				return `${year}-${month}-${day}`
			},
			goToHistoryRecords() {
				uni.navigateTo({
					url: '/pages/index/history-records/index'
				})
			},
			handleAuthCancel() {
				this.showAuthModal = false;
				// 清空地址信息
				this.formData.address = '';
				this.formData.latitude = '';
				this.formData.longitude = '';
				this.formData.province = '';
				this.formData.city = '';
				this.formData.district = '';
			},
			handleAuthConfirm() {
				this.showAuthModal = false;
				// 清空地址信息
				this.formData.address = '';
				this.formData.latitude = '';
				this.formData.longitude = '';
				this.formData.province = '';
				this.formData.city = '';
				this.formData.district = '';
			},
			// 显示设备编码帮助弹窗
			showDeviceCodeHelp() {
				this.showDeviceCodeModal = true;
			},
			// 关闭设备编码帮助弹窗
			closeDeviceCodeModal() {
				this.showDeviceCodeModal = false;
			},
			// 显示门店POI帮助弹窗
			showPoiHelp() {
				this.showPoiModal = true;
			},
			// 关闭门店POI帮助弹窗
			closePoiModal() {
				this.showPoiModal = false;
			},
			// 图片加载成功
			onImageLoad() {
				console.log('图片加载成功:', this.previewImageUrl);
			},
			// 图片加载失败
			onImageError(e) {
				console.error('图片加载失败:', this.previewImageUrl, e);
				uni.showToast({
					title: '图片加载失败',
					icon: 'none'
				});
			},

			// ========== 时间段选择相关方法 ==========
			// 初始化时间段选择器数据
			initTimeRangePickerData() {
				const hours = [];
				const minutes = [];

				// 添加"24小时均可"选项到小时数组的第一位
				hours.push('24小时均可');

				// 生成小时（00-23）
				for (let i = 0; i < 24; i++) {
					hours.push(i.toString().padStart(2, '0'));
				}

				// 生成分钟（00-59）
				for (let i = 0; i < 60; i++) {
					minutes.push(i.toString().padStart(2, '0'));
				}

				// [开始小时, 开始分钟, 结束小时, 结束分钟]
				this.timeRangePickerData = [hours, minutes, hours, minutes];
			},

			// 获取时间段显示文本
			getTimeRangeDisplay() {
				if (this.formData.recommended_service_time_start && this.formData.recommended_service_time_end) {
					// 如果开始和结束时间都是00:00，显示"24小时均可"
					if (this.formData.recommended_service_time_start === '00:00' && this.formData.recommended_service_time_end === '00:00') {
						return '24小时均可';
					}
					return `${this.formData.recommended_service_time_start} - ${this.formData.recommended_service_time_end}`;
				}
				return '请选择时间段';
			},

			// 显示时间段选择弹窗
			showTimeRangePicker() {
				this.tempTimeRangeIndex = [...this.timeRangeIndex];
				this.showTimeRangePopup = true;
				this.$refs.timeRangePopup.open();
			},

			// 关闭时间段选择弹窗
			closeTimeRangePopup() {
				this.$refs.timeRangePopup.close();
			},

			// 时间段弹窗状态变化
			onTimeRangePopupChange(e) {
				this.showTimeRangePopup = e.show;
			},

			// picker-view值变化
			onTimeRangePickerChange(e) {
				this.tempTimeRangeIndex = e.detail.value;
			},

			// 确认时间段选择
			confirmTimeRange() {
				this.timeRangeIndex = [...this.tempTimeRangeIndex];

				const startHour = this.timeRangePickerData[0][this.timeRangeIndex[0]];
				const startMinute = this.timeRangePickerData[1][this.timeRangeIndex[1]];
				const endHour = this.timeRangePickerData[2][this.timeRangeIndex[2]];
				const endMinute = this.timeRangePickerData[3][this.timeRangeIndex[3]];

				// 如果选择了"24小时均可"
				if (startHour === '24小时均可' || endHour === '24小时均可') {
					this.formData.recommended_service_time_start = '00:00';
					this.formData.recommended_service_time_end = '00:00';
				} else {
					this.formData.recommended_service_time_start = `${startHour}:${startMinute}`;
					this.formData.recommended_service_time_end = `${endHour}:${endMinute}`;
				}

				this.closeTimeRangePopup();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.store-info-page {
		min-height: 100vh;
		background-color: #F5F5F5;
		padding: 20rpx;
		padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
		/* iOS >= 11.2 */
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
		/* iOS >= 11.2 */
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	.nav-placeholder {
		height: 180rpx;
		width: 100%;
	}

	.info-card {
		background-color: #FFFFFF;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		flex: 1;
	}

	.form-item {
		margin-bottom: 20rpx;

		&:first-child {
			margin-bottom: 20rpx;
		}

		.input-container {
			&.address-container {
				padding-bottom: 16rpx;
				border-bottom: 1rpx solid #EEEEEE;
			}
		}
	}

	.form-label {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.dot {
			width: 12rpx;
			height: 12rpx;
			border-radius: 50%;
			background-color: #f00;
			margin-right: 12rpx;
		}

		text {
			font-size: 28rpx;
			color: #333;
		}

		.optional-tag {
			font-size: 24rpx;
			color: #999;
			margin-left: 10rpx;
		}

		.desc-tip {
			font-size: 20rpx;
			color: #bbb;
			margin-left: 16rpx;
			font-weight: 400;
			line-height: 1.2;
		}
	}

	.input-row {
		display: flex;
		align-items: center;
		padding-bottom: 16rpx;
		// border-bottom: 1rpx solid #EEEEEE;
	}

	.label-container {
		display: flex;
		align-items: center;
		width: 280rpx;
		position: relative;

		.optional-tag {
			font-size: 24rpx;
			color: #999;
		}

		.dot {
			width: 12rpx;
			height: 12rpx;
			border-radius: 50%;
			background-color: #f00;
			margin-right: 12rpx;
		}

		text {
			font-size: 28rpx;
			color: #333;
		}

		.time-note {
			position: absolute;
			top: 17px;
			left: 0px;
			font-size: 20rpx;
			color: #FF4D4F;
			margin-top: 4rpx;
			white-space: nowrap;
			line-height: 1.3;
			display: block;
			background-color: #FFF1F0;
			padding: 6rpx 10rpx;
			border-radius: 8rpx;
			margin-top: 8rpx;
		}

		&::after {
			content: '';
			position: absolute;
			right: 20rpx;
			top: 50%;
			transform: translateY(-50%);
			height: 24rpx;
			width: 1rpx;
			background-color: #EEEEEE;
		}
	}

	.input-container {
		flex: 1;
		padding-left: 20rpx;

		.input-wrapper {
			position: relative;
			width: 100%;

			.custom-input {
				width: 100%;
				height: 50rpx;
				font-size: 24rpx;
				color: #333;
				text-align: right;
				background: transparent;

				&.address-textarea {
					height: auto;
					min-height: 40rpx;
				}
			}

			.placeholder-box {
				position: absolute;
				top: 50%;
				right: 0;
				transform: translateY(-50%);
				display: flex;
				align-items: center;
				pointer-events: none;

				.input-icon {
					width: 24rpx;
					height: 24rpx;
					margin-right: 8rpx;
				}

				.placeholder-text {
					font-size: 24rpx;
					color: #999;
				}

				.location-icon {
					width: 28rpx;
					height: 28rpx;
					margin-left: 8rpx;
				}
			}
		}
	}

	.radio-container {
		flex: 1;
		padding-left: 20rpx;
		display: flex;
		justify-content: flex-end;

		.radio-group {
			display: flex;
			align-items: center;
			gap: 20rpx; // 减小间距以适应3个选项
			flex-wrap: wrap; // 允许换行，但通常不需要

			.radio-item {
				display: flex;
				align-items: center;
				cursor: pointer;
				flex-shrink: 0; // 防止压缩

				.radio-circle {
					width: 24rpx; // 减小圆圈大小
					height: 24rpx;
					border: 2rpx solid #D3D4D6;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-right: 8rpx; // 减小右边距
					transition: all 0.3s ease;

					&.radio-checked {
						border-color: #2492F2;
						background-color: #2492F2;
					}

					.radio-inner {
						width: 8rpx; // 减小内圆大小
						height: 8rpx;
						background-color: #FFFFFF;
						border-radius: 50%;
					}
				}

				.radio-text {
					font-size: 25rpx; // 减小字体大小
					color: #333;
					white-space: nowrap; // 防止文字换行
				}
			}
		}
	}

	.snmac-list {
		.snmac-item {
			margin-bottom: 16rpx;

			.input-row {
				display: flex;
				align-items: center;
				padding-bottom: 16rpx;
				border-bottom: 1rpx solid #EEEEEE;
			}

			.snmac-actions {
				margin-right: 20rpx;
				flex-shrink: 0;

				.delete-btn {
					color: #FF4D4F;
					font-size: 24rpx;
					padding: 4rpx 12rpx;
					background-color: #FFF1F0;
					border-radius: 4rpx;
				}
			}
		}

		.add-snmac {
			display: flex;
			align-items: center;
			padding: 20rpx 0;
			color: #2492F2;
			font-size: 28rpx;
			justify-content: flex-end;

			.add-icon {
				margin-right: 10rpx;
				font-size: 32rpx;
			}
		}
	}

	.upload-container {
		.upload-list {
			display: flex;
			flex-wrap: wrap;
			gap: 20rpx;

			.upload-item {
				width: 130rpx;
				height: 130rpx;
				position: relative;
				border-radius: 8rpx;
				overflow: hidden;

				.preview-image {
					width: 100%;
					height: 100%;
				}

				.delete-icon {
					position: absolute;
					top: 0;
					right: 0;
					width: 40rpx;
					height: 40rpx;
					background: rgba(0, 0, 0, 0.5);
					color: #fff;
					font-size: 30rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}

			.upload-btn {
				width: 130rpx;
				height: 130rpx;
				background-color: #f8f8f8;
				border: 1rpx solid #D3D4D6;
				border-radius: 8rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;

				.upload-icon {
					width: 36rpx;
					height: 36rpx;
					margin-bottom: 8rpx;
				}

				.upload-text {
					font-size: 20rpx;
					color: #666;
				}
			}
		}
	}

	.textarea-container {
		position: relative;

		textarea {
			width: 100%;
			height: 230rpx;
			background-color: #f8f8f8;
			border-radius: 8rpx;
			padding: 20rpx;
			font-size: 24rpx;
			box-sizing: border-box;
		}

		.char-count-abs {
			position: absolute;
			right: 20rpx;
			bottom: 16rpx;
			font-size: 20rpx;
			color: #bbb;
			background: transparent;
			pointer-events: none;
		}
	}

	.bottom-button {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx;
		padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
		/* iOS < 11.2 */
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		/* iOS >= 11.2 */
		background-color: #FFFFFF;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 999;

		.save-btn {
			width: 100%;
			height: 80rpx;
			background: linear-gradient(135deg, #2492F2 0%, #1B7CD9 100%);
			border-radius: 40rpx;
			color: #FFFFFF;
			font-size: 28rpx;
			font-weight: 500;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.3);
			transition: all 0.3s ease;

			&:active {
				transform: scale(0.98);
				box-shadow: 0 2rpx 6rpx rgba(36, 146, 242, 0.2);
			}
		}
	}

	.history-card {
		background-color: #FFFFFF;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		z-index: 10;

		.history-button {
			background: #F0F9FF;
			color: #2492F2;
			font-size: 28rpx;
			padding: 16rpx 40rpx;
			border-radius: 30rpx;
			border: none;
			line-height: 1.5;
			font-weight: normal;
			display: flex;
			align-items: center;

			&::after {
				border: none;
			}

			.button-count {
				font-size: 24rpx;
				margin-left: 4rpx;
			}
		}

		.button-tip {
			font-size: 24rpx;
			color: #999999;
			margin-top: 12rpx;
		}
	}

	.divider {
		width: 100%;
		height: 1rpx;
		background: #eee;
		margin: 24rpx 0 24rpx 0;
	}

	.upload-header {
		margin-bottom: 20rpx;

		.upload-title {
			display: flex;
			align-items: center;
			margin-bottom: 10rpx;

			.title-text {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
			}

			.optional-tag {
				font-size: 24rpx;
				color: #999;
			}
		}

		.upload-tip {
			display: flex;
			align-items: flex-start;
			background-color: #FFF1F0;
			padding: 6rpx 10rpx;
			border-radius: 8rpx;
			margin-top: 8rpx;

			.tip-icon {
				width: 28rpx;
				height: 28rpx;
				margin-right: 8rpx;
				flex-shrink: 0;
				margin-top: 2rpx;
			}

			.tip-text {
				font-size: 20rpx;
				color: #FF4D4F;
				line-height: 1.3;
				flex: 1;
			}
		}
	}

	.error-tip {
		margin-top: 8rpx;
		padding-left: 20rpx;

		.error-text {
			font-size: 20rpx;
			color: #FF4D4F;
			line-height: 1.3;
		}
	}

	.error-tip-right {
		position: absolute;
		top: 80%;
		right: 0;
		margin-top: 4rpx;
		pointer-events: none;

		.error-text {
			font-size: 20rpx;
			color: #FF4D4F;
			line-height: 1.3;
			text-align: right;
			white-space: nowrap;
		}
	}

	// 帮助说明样式
	.help-section {
		position: absolute;
		display: flex;
		align-items: center;
		cursor: pointer;
		z-index: 10;

		.help-text {
			font-size: 20rpx;
			color: #2492F2;
			margin-right: 4rpx;
		}

		.help-icon {
			width: 24rpx;
			height: 24rpx;
			border-radius: 50%;
			background-color: #2492F2;
			color: #FFFFFF;
			font-size: 16rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: bold;
		}
	}

	// 设备编码字段的帮助说明定位
	.help-section-device {
		top: 7rpx;
		right: -30rpx;
	}

	// 门店POI字段的帮助说明定位
	.help-section-poi {
		top: 7rpx;
		right: -75rpx;
	}

	// 帮助弹窗样式
	.help-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40rpx;

		.help-image {
			width: 600rpx;
			max-width: 90vw;
			border-radius: 8rpx;
		}
	}

	// 地图预览样式
	.map-preview-container {
		width: 100%;
		height: 300rpx;
		border-radius: 8rpx;
		overflow: hidden;
		margin-top: 20rpx;
		position: relative;
		background-color: #E5E5E5;

		.map-overlay {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);
			padding: 16rpx 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 10;

			.nav-icon {
				width: 24rpx;
				height: 24rpx;
				margin-right: 8rpx;
				filter: brightness(0) invert(1);
			}

			.nav-text {
				font-size: 24rpx;
				color: #FFFFFF;
				font-weight: 500;
			}
		}
	}

	// 时间段显示样式
	.time-display-wrapper {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		width: 100%;
		cursor: pointer;

		.time-display-text {
			font-size: 24rpx;
			color: #333333;
			margin-right: 8rpx;
		}

		.time-arrow {
			width: 24rpx;
			height: 24rpx;
		}
	}

	// 时间段选择弹窗样式
	.time-range-popup {
		background: #FFFFFF;
		border-radius: 20rpx 20rpx 0 0;
		padding: 0;
		max-height: 80vh;
		position: relative;
		z-index: 99999999;

		.popup-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 30rpx 40rpx 20rpx;
			border-bottom: 1rpx solid #F0F0F0;

			.title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333333;
			}

			.close {
				font-size: 48rpx;
				color: #999999;
				line-height: 1;
				padding: 10rpx;
			}
		}

		.popup-content {
			padding: 0 40rpx 40rpx;
			position: relative;
			z-index: 99999999;

			.picker-header {
				display: flex;
				align-items: center;
				justify-content: space-around;
				padding: 20rpx 0 10rpx;
				border-bottom: 1rpx solid #F0F0F0;

				.header-item {
					flex: 1;
					text-align: center;
					font-size: 28rpx;
					color: #666666;
					font-weight: 500;
				}
			}

			.time-picker-view {
				height: 400rpx;
				margin: 20rpx 0;

				.picker-item {
					display: flex;
					align-items: center;
					justify-content: center;
					height: 50px;

					text {
						font-size: 28rpx;
						color: #333333;
					}
				}
			}

			.popup-footer {
				padding-top: 20rpx;

				.confirm-btn {
					width: 100%;
					height: 88rpx;
					background: linear-gradient(135deg, #2492F2, #1890FF);
					color: #FFFFFF;
					font-size: 32rpx;
					font-weight: 600;
					border-radius: 12rpx;
					border: none;
					display: flex;
					align-items: center;
					justify-content: center;

					&:active {
						opacity: 0.8;
					}
				}
			}
		}
	}
</style>