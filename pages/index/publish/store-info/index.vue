<template>
	<view class="store-info-page">
		<!-- 顶部导航栏 -->
		<nav-bar :title="'服务门店信息'" title-align="center" :fixed="true" :placeholder="true" :border="false"
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
		<auth-modal :show="showAuthModal" title="提示" content="抱歉！当前城市尚未开通！!申请成为跑腿服务商/骑手，接单赚外快！" cancel-text="取消"
			confirm-text="去申请" @cancel="handleAuthCancel" @confirm="handleAuthConfirm" />

		<view class="info-card">

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
			</view>

			<!-- 补充地址详情 -->
			<view class="form-item">
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
			</view>

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

			<!-- 联系人 -->
			<view class="form-item">
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
			</view>

			<!-- 设备编码 -->
			<view class="form-item">
				<view class="input-row" style="margin-bottom: 20rpx;">
					<view class="label-container">
						<text class="dot"></text>
						<text>设备编码</text>
						<text class="time-note">编码非常重要 避免骑手错补</text>
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
				<view class="snmac-list">
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

				<!-- 设备是否外摆 -->
				<view class="form-item">
					<view class="input-row">
						<view class="label-container">
							<text class="dot"></text>
							<text>设备是否外摆</text>
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
				<view class="divider"></view>
			</view>

			<!-- 门店详情描述 -->
			<view class="form-item">
				<view class="form-label">
					<text>门店详情描述</text>
					<text class="optional-tag">（选填）</text>
				</view>
				<view class="textarea-container">
					<textarea v-model="formData.locationDesc" @input="updateField('locationDesc', $event.detail.value)"
						placeholder="为更高效及时完成运维服务，可补充说明商户情况/态度、设备特点、门店特征和地标。" maxlength="200" />
					<view class="char-count char-count-abs">{{ (formData.locationDesc || '').length }}/200</view>
				</view>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="bottom-button">
			<button class="save-btn" @click="saveStoreInfo">保存</button>
		</view>
	</view>
</template>

<script>
	import AuthModal from '@/components/AuthModal/index.vue'

	export default {
		components: {
			AuthModal
		},
		data() {
			return {
				formData: {
					address: '',
					detailAddress: '',
					storeName: '',
					snMacList: [{
						id: Date.now(),
						value: ''
					}],
					device_outside: null, // 设备是否外摆，默认不选中
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
				},
				historyRecords: [],
				showAuthModal: false,
				snMacErrors: {} // 存储设备编码的错误信息，key为index，value为错误信息
			}
		},
		onLoad() {
			// 获取用户信息
			const userInfo = uni.getStorageSync('userInfo')
			if (userInfo) {
				// 设置默认的联系电话和联系人
				this.formData.phone = userInfo.phone_number || ''
				this.formData.contact = userInfo.username || ''
				this.formData.user_id = userInfo.user_id || 0
			}

			// 获取本地存储的门店信息
			const storeInfo = uni.getStorageSync('storeInfo')
			if (storeInfo) {
				// 确保 snMacList 是对象数组
				if (storeInfo.snMacList) {
					storeInfo.snMacList = storeInfo.snMacList.map(item => {
						if (typeof item === 'string') {
							return {
								id: Date.now(),
								value: item
							}
						}
						return item
					})
				}
				this.formData = {
					...this.formData,
					...storeInfo
				}
			}

			// 获取历史门店记录
			// this.historyRecords = uni.getStorageSync('storeHistoryRecords') || []
		},
		onShow() {
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
					console.log('服务区域列表:', parsedCityList);

					// 检查选择的地址是否在服务范围内
					const isServiceAvailable = parsedCityList.some(provinceItem => {
						// 检查省级
						if (provinceItem.name === this.formData.province) {
							// 检查市级
							if (provinceItem.children && Array.isArray(provinceItem.children)) {
								return provinceItem.children.some(cityItem => {
									// 检查城市名称是否匹配
									if (cityItem.name === this.formData.city) {
										// 检查区县级
										if (cityItem.children && Array.isArray(cityItem.children)) {
											return cityItem.children.some(districtItem =>
												districtItem.name === this.formData.district
											);
										}
									}
									return false;
								});
							}
						}
						return false;
					});

					console.log('最终判断结果:', isServiceAvailable);

					if (!isServiceAvailable) {
						this.showAuthModal = true;
					}
				} catch (error) {
					console.error('解析城市列表失败:', error);
				}
			}
		},
		methods: {
			async gethistoryRecords() {
				// 显示加载提示
				uni.showLoading({
					title: '加载中...',
					mask: true
				});
				const submitData = {
					user_id: this.formData.user_id
				}
				// 调用接口保存数据
				const res = await this.$request('user/addresses/get', submitData, 'POST');

				if (res.status === 'success') {
					this.historyRecords = res.data

					// 保存到本地存储
					uni.setStorageSync('storeHistoryRecords', this.historyRecords)
				}
				// 隐藏加载提示
				uni.hideLoading();
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
				uni.chooseImage({
					count: 5 - this.formData.doorImages.length,
					success: (res) => {
						// console.log(res)
						this.qiniuUploadFile(res.tempFilePaths)
						// this.formData.doorImages = [...this.formData.doorImages, ...res.tempFilePaths]
					}
				})
			},
			// 开始上传七牛云
			qiniuUploadFile(tempFilePaths) {
				uni.uploadFile({
					url: 'https://tixian.0871.cn/upload/qiniuImageUpload', // 服务器上传接口地址
					filePath: tempFilePaths[0],
					name: 'image', // 必须填写，后台用来接收文件
					formData: {
						'spaceName': 'agan_complain' // 其他要上传的参数
					},
					success: (uploadFileRes) => {
						// const res = JSON.stringify(uploadFileRes.data)
						const res = JSON.parse(uploadFileRes.data)
						console.log(res)
						// this.valiFormData.image_json.push(res.path)
						this.formData.doorImages = [...this.formData.doorImages, res.path]
					},
					fail: (uploadFileErr) => {
						console.error('图片上传失败', uploadFileErr);
					}
				});
			},
			updateField(field, value) {
				this.formData[field] = value
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
			async saveStoreInfo() {
				// 优先检查门店地址
				if (!this.formData.address || this.formData.address.trim() === '') {
					uni.showToast({
						title: '请选择门店地址',
						icon: 'none'
					});
					return;
				}

				// 检查其他必填项
				const requiredFields = [{
						field: 'storeName',
						name: '门店名称'
					},
					{
						field: 'phone',
						name: '联系电话'
					},
					{
						field: 'snMacList',
						name: '设备编码'
					}
				];

				// 检查是否有未填写的必填项
				const missingFields = requiredFields.filter(item => {
					if (item.field === 'snMacList') {
						// 检查所有设备编码是否都有值
						return this.formData.snMacList.some(snMac => !snMac.value || snMac.value.trim() ===
						'');
					}
					const value = this.formData[item.field];
					return !value || (typeof value === 'string' && value.trim() === '');
				});

				if (missingFields.length > 0) {
					uni.showToast({
						title: `请填写${missingFields[0].name}`,
						icon: 'none'
					});
					return;
				}

				// 检查设备编码格式和长度
				for (let i = 0; i < this.formData.snMacList.length; i++) {
					const snMac = this.formData.snMacList[i];
					if (snMac.value && snMac.value.trim()) {
						// 检查长度
						if (snMac.value.trim().length < 10) {
							uni.showToast({
								title: '设备编码不能少于10位',
								icon: 'none'
							});
							return;
						}
						// 检查格式
						const regex = /^[a-zA-Z0-9]+$/;
						if (!regex.test(snMac.value.trim())) {
							uni.showToast({
								title: '设备编码只能包含数字和字母',
								icon: 'none'
							});
							return;
						}
					}
				}

				// 检查手机号格式
				const phoneRegex = /^1[3-9]\d{9}$/;
				if (!phoneRegex.test(this.formData.phone)) {
					uni.showToast({
						title: '请输入正确的手机号码',
						icon: 'none'
					});
					return;
				}

				// 保存到历史记录

				// 转换 device_outside 值：1->true, 0->false, 其他值保持不变
				let deviceOutsideValue = this.formData.device_outside;
				if (deviceOutsideValue === 1) {
					deviceOutsideValue = true;
				} else if (deviceOutsideValue === 0) {
					deviceOutsideValue = false;
				}

				const submitData = {
					user_id: this.formData.user_id,
					store_name: this.formData.storeName,
					address: this.formData.address,
					detail_address: this.formData.detailAddress,
					longitude: this.formData.longitude,
					latitude: this.formData.latitude,
					province: this.formData.province,
					city: this.formData.city,
					district: this.formData.district,
					snMaclist: this.formData.snMacList,
					device_outside: deviceOutsideValue, // 设备是否外摆
					poi_remark: this.formData.poiRemark, // 添加门店POI备注
					doorImages: this.formData.doorImages,
					location_description: this.formData.locationDesc,
					phone_number: this.formData.phone,
					name: this.formData.contact,
					distance: this.formData.distance,
				};

				try {
					// 显示加载提示
					uni.showLoading({
						title: '保存中...',
						mask: true
					});

					// 调用接口保存数据
					const res = await this.$request('user/addresses/create', submitData, 'POST');

					// 隐藏加载提示
					uni.hideLoading();

					if (res.status === 'success') {
						// 获取所有页面
						const pages = getCurrentPages()
						// 获取发布订单页实例
						const publishPage = pages[pages.length - 2]

						// console.log(publishPage,'页面路径')

						if (publishPage) {
							// 更新发布订单页的 formData
							publishPage.$vm.formData = {
								...publishPage.$vm.formData,
								storeName: this.formData.storeName,
								address: this.formData.address,
								detailAddress: this.formData.detailAddress,
								phone: this.formData.phone,
								contact: this.formData.contact,
								snMacList: this.formData.snMacList,
								device_outside: deviceOutsideValue, // 设备是否外摆，使用转换后的值
								poiRemark: this.formData.poiRemark, // 添加门店POI备注
								doorImages: this.formData.doorImages,
								locationDesc: this.formData.locationDesc,
								latitude: this.formData.latitude,
								longitude: this.formData.longitude,
								province: this.formData.province,
								city: this.formData.city,
								district: this.formData.district,
								distance: this.formData.distance, // 测算距离km
							}

							// 触发发布订单页的更新
							// publishPage.$vm.$forceUpdate()
						}

						// 显示保存成功提示
						uni.showToast({
							title: '保存成功',
							icon: 'success',
							duration: 2000
						});

						// 延迟跳转，让用户看到成功提示
						setTimeout(() => {
							uni.navigateBack({
								delta: 1
							});
						}, 1500);
					} else {
						uni.showToast({
							title: res.msg || '保存失败',
							icon: 'none'
						});
					}
				} catch (error) {
					// 隐藏加载提示
					uni.hideLoading();

					console.error('保存门店信息失败:', error);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
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
		border-bottom: 1rpx solid #EEEEEE;
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
			top: 22px;
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
</style>