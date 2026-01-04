<template>
	<view class="store-detail">
		<!-- 使用头部组件 -->
		<nav-bar title="门店信息" title-align="center"></nav-bar>

		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 门店图片 -->
			<view class="image-section"v>
				<scroll-view class="image-scroll" scroll-x="true" show-scrollbar="false">
					<view class="image-list">
						<view class="image-item" v-for="(img, index) in storeInfo.door_images" :key="index" @click="previewImage(index)">
							<image :src="img" mode="aspectFill" class="store-image"></image>
							<view class="delete-icon" @click.stop="deleteImage(index)">×</view>
						</view>
						<view class="upload-btn" @click="uploadImage" v-if="storeInfo.door_images.length < 3">
							<image src="https://ccpt.qiniu.0871.cn/publish/mentou.png" mode="aspectFit"
								class="upload-icon"></image>
							<text class="upload-text">选择图片</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 创建时间 -->
			<view class="time-section">
				<text class="time-text">{{ formatTime(storeInfo.created_at) }}</text>
			</view>

			<!-- 门店信息列表 -->
			<view class="info-list">
				<!-- 门店名称 -->
				<view class="info-item">
					<view class="info-label">
						<text class="label-icon">•</text>
						<text class="label-text">门店名称：</text>
					</view>
					<view class="info-value-row">
						<text class="info-value">{{ storeInfo.store_name || '东北铁锅炖大鹅' }}</text>
						<image src="https://ccpt.qiniu.0871.cn/home/my/edit.png" class="edit-icon" mode="aspectFit" @click="editField('storeName')"></image>
					</view>
				</view>

				<!-- 门店POI -->
				<view class="info-item">
					<view class="info-label">
						<text class="label-icon">•</text>
						<text class="label-text">门店 POI：</text>
					</view>
					<view class="info-value-row">
						<text class="info-value">{{ storeInfo.shop_poi || '19668549555' }}</text>
						<image src="https://ccpt.qiniu.0871.cn/home/my/edit.png" class="edit-icon" mode="aspectFit" @click="editField('shopPoi')"></image>
					</view>
				</view>

				<!-- 设备编码 -->
				<view class="info-item" v-for="(item, index) in storeInfo.sn_mac_code" :key="index">
					<view class="info-label" v-if="index == 0">
						<text class="label-icon">•</text>
						<text class="label-text">设备编码：</text>
					</view>
					<view class="info-value-row">
						<text class="info-value" v-if="index != 0" @click="storeInfo.sn_mac_code.splice(index, 1)" style="color: red;">移除</text>
						<!-- <text class="info-value">{{ item.value }}</text> -->
						<input v-model="item.value" class="info-value" placeholder="请输入设备编码" />
						<!-- <image src="https://ccpt.qiniu.0871.cn/home/my/edit.png" class="edit-icon" mode="aspectFit" @click="editField('snMac',index)"></image> -->
					</view>
				</view>
				<view class="info-item">
					<view class="info-label"> </view>
					<view class="info-value-row" @click="storeInfo.sn_mac_code.push({value:''})">
						<text class="info-value" style="color: #1890FF">添加设备编码</text>
					</view>
				</view>

				<!-- 设备位置 -->
				<view class="info-item">
					<view class="info-label">
						<text class="label-icon">•</text>
						<text class="label-text">设备位置：</text>
					</view>
					<view class="info-value-row">
						<text class="info-value">{{ getDeviceLocation() }}</text>
						<image src="https://ccpt.qiniu.0871.cn/home/my/edit.png" class="edit-icon" mode="aspectFit" @click="editField('deviceLocation')"></image>
					</view>
				</view>

				<!-- 门店地址 -->
				<view class="info-item">
					<view class="info-label">
						<text class="label-icon">•</text>
						<text class="label-text">门店地址：</text>
					</view>
					<view class="info-value-row">
						<text class="info-value">{{ getFullAddress() }}</text>
						<image src="https://ccpt.qiniu.0871.cn/home/my/edit.png" class="edit-icon" mode="aspectFit" @click="editField('address')"></image>
					</view>
				</view>

				<!-- 上门时间 -->
				<view class="info-item">
					<view class="info-label">
						<text class="label-icon">•</text>
						<text class="label-text">上门时间：</text>
					</view>
					<view class="info-value-row">
						<text class="info-value">{{ getServiceTime() }}</text>
						<image src="https://ccpt.qiniu.0871.cn/home/my/edit.png" class="edit-icon" mode="aspectFit" @click="editField('serviceTime')"></image>
					</view>
				</view>

				<!-- 门店备注 -->
				<view class="info-item">
					<view class="info-label">
						<text class="label-icon">•</text>
						<text class="label-text">门店备注：</text>
					</view>
					<view class="info-value-row">
						<text class="info-value">{{ storeInfo.location_description || '其中有断电！帮忙通电并反馈原因，那就太感谢了' }}</text>
						<image src="https://ccpt.qiniu.0871.cn/home/my/edit.png" class="edit-icon" mode="aspectFit" @click="editField('remark')"></image>
					</view>
				</view>
			</view>

			<!-- 底部按钮 -->
			<view class="footer-buttons">
				<view class="delete-btn" @click="deleteStore">删除信息</view>
				<view class="confirm-btn" @click="confirmModify">确认修改</view>
			</view>
		</view>

		<!-- 悬浮聊天图标 -->
		<FloatingChatIconUser />

		<!-- 编辑弹窗 -->
		<view v-if="showEditModal" class="edit-modal" @click="closeEditModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">{{ editModalTitle }}</text>
					<text class="modal-close" @click="closeEditModal">×</text>
				</view>
				<view class="modal-body">
					<textarea v-if="editFieldType === 'textarea'" v-model="editValue" class="edit-textarea" :placeholder="editPlaceholder" auto-height />
					<input v-else v-model="editValue" class="edit-input" :placeholder="editPlaceholder" />
				</view>
				<view class="modal-footer">
					<view class="modal-btn cancel-btn" @click="closeEditModal">取消</view>
					<view class="modal-btn confirm-btn" @click="saveEdit">确定</view>
				</view>
			</view>
		</view>
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
			storeInfo: {
				door_images: [],
				sn_mac_code: []
			},
			storeId: '',
			showEditModal: false,
			editModalTitle: '',
			editFieldName: '',
			editFieldType: 'input',
			editValue: '',
			editPlaceholder: '',
			hasModified: false
		}
	},
	onLoad(options) {
		// 计算导航栏高度
		const systemInfo = uni.getSystemInfoSync()
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
		this.navBarHeight = menuButtonInfo.bottom + 12

		// 获取传递的门店ID
		if (options.id) {
			this.storeId = options.id
			this.getStoreDetail()
		}
	},
	methods: {
		uploadImage() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed', 'original'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					if (res.tempFilePaths && res.tempFilePaths.length > 0) {
						// 逐个上传图片
						this.qiniuUploadFile(res.tempFilePaths[0]);
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
									this.storeInfo.door_images = [...this.storeInfo.door_images, res.path];
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
		deleteImage(index) {
			this.storeInfo.door_images.splice(index, 1)
		},
		// 获取门店详情
		async getStoreDetail() {
			try {
				const userInfo = uni.getStorageSync('userInfo')
				if (!userInfo || !userInfo.user_id) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}

				uni.showLoading({ title: '加载中...', mask: true })

				const res = await this.$request('user/addresses/get/one', {
					user_id: userInfo.user_id,
					id: this.storeId
				}, 'POST')

				uni.hideLoading()

				if (res.status === 'success' && res.data) {
					this.storeInfo = res.data
				} else {
					uni.showToast({
						title: res.msg || '获取门店信息失败',
						icon: 'none'
					})
				}
			} catch (error) {
				uni.hideLoading()
				console.error('获取门店详情失败:', error)
				uni.showToast({
					title: '网络错误，请重试',
					icon: 'none'
				})
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

		// 获取SN/MAC显示
		getSnMacDisplay() {
			if (!this.storeInfo.sn_mac_code || this.storeInfo.sn_mac_code.length === 0) {
				return 'B4B7646754456B6'
			}
			return this.storeInfo.sn_mac_code.map(item => {
				return typeof item === 'string' ? item : item.value
			}).join(', ')
		},

		// 获取设备位置
		getDeviceLocation() {
			if (this.storeInfo.device_outside === 1) {
				return '非外摆'
			} else if (this.storeInfo.device_outside === 0) {
				return '外摆'
			}
			return '非外摆'
		},

		// 获取完整地址
		getFullAddress() {
			const parts = []
			if (this.storeInfo.province_name) parts.push(this.storeInfo.province_name)
			if (this.storeInfo.city_name) parts.push(this.storeInfo.city_name)
			if (this.storeInfo.district_name) parts.push(this.storeInfo.district_name)
			if (this.storeInfo.address) parts.push(this.storeInfo.address)
			if (this.storeInfo.shop_address) parts.push(this.storeInfo.shop_address)

			return parts.length > 0 ? parts.join(' ') : '四川省成都市双流区关夫大道112号2栋商铺202号'
		},

		// 获取上门时间
		getServiceTime() {
			if (this.storeInfo.recommended_service_time_start && this.storeInfo.recommended_service_time_end) {
				return `${this.storeInfo.recommended_service_time_start}—${this.storeInfo.recommended_service_time_end}`
			}
			return '09:00—16:00'
		},

		// 编辑字段
		editField(field) {
			this.editFieldName = field

			const fieldConfig = {
				storeName: {
					title: '编辑门店名称',
					value: this.storeInfo.store_name || '',
					placeholder: '请输入门店名称',
					type: 'input'
				},
				shopPoi: {
					title: '编辑门店POI',
					value: this.storeInfo.shop_poi || '',
					placeholder: '请输入门店POI',
					type: 'input'
				},
				snMac: {
					title: '编辑设备编码',
					value: this.getSnMacDisplay(),
					placeholder: '请输入设备编码，多个用逗号分隔',
					type: 'input'
				},
				deviceLocation: {
					title: '编辑设备位置',
					value: this.storeInfo.device_outside === 1 ? '非外摆' : '外摆',
					placeholder: '请选择设备位置',
					type: 'input'
				},
				address: {
					title: '编辑门店地址',
					value: this.getFullAddress(),
					placeholder: '请输入门店地址',
					type: 'textarea'
				},
				serviceTime: {
					title: '编辑上门时间',
					value: this.getServiceTime(),
					placeholder: '请输入上门时间，格式：09:00—16:00',
					type: 'input'
				},
				remark: {
					title: '编辑门店备注',
					value: this.storeInfo.location_description || '',
					placeholder: '请输入门店备注',
					type: 'textarea'
				}
			}

			const config = fieldConfig[field]
			if (config) {
				this.editModalTitle = config.title
				this.editValue = config.value
				this.editPlaceholder = config.placeholder
				this.editFieldType = config.type
				this.showEditModal = true
			}
		},

		// 关闭编辑弹窗
		closeEditModal() {
			this.showEditModal = false
			this.editValue = ''
			this.editFieldName = ''
		},

		// 保存编辑
		saveEdit() {
			if (!this.editValue || !this.editValue.trim()) {
				uni.showToast({
					title: '请输入内容',
					icon: 'none'
				})
				return
			}

			// 更新对应字段的值
			switch (this.editFieldName) {
				case 'storeName':
					this.storeInfo.store_name = this.editValue.trim()
					break
				case 'shopPoi':
					this.storeInfo.shop_poi = this.editValue.trim()
					break
				case 'snMac':
					// 将逗号分隔的字符串转换为数组
					// const snMacArray = this.editValue.split(',').map(item => item.trim()).filter(item => item)
					// this.storeInfo.sn_mac_code = snMacArray.map(value => ({ value }))
					break
				case 'deviceLocation':
					// 根据输入的文本设置 device_outside 值
					if (this.editValue.includes('外摆')) {
						this.storeInfo.device_outside = 0
					} else {
						this.storeInfo.device_outside = 1
					}
					break
				case 'address':
					// 地址字段比较复杂，这里简单处理
					this.storeInfo.address = this.editValue.trim()
					break
				case 'serviceTime':
					// 解析时间范围
					const timeMatch = this.editValue.match(/(\d{2}:\d{2})[—\-~](\d{2}:\d{2})/)
					if (timeMatch) {
						this.storeInfo.recommended_service_time_start = timeMatch[1]
						this.storeInfo.recommended_service_time_end = timeMatch[2]
					}
					break
				case 'remark':
					this.storeInfo.location_description = this.editValue.trim()
					break
			}

			this.hasModified = true
			this.closeEditModal()

			uni.showToast({
				title: '修改成功，请点击确认修改保存',
				icon: 'none',
				duration: 2000
			})
		},

		// 预览图片
		previewImage(index) {
			if (this.storeInfo.door_images && this.storeInfo.door_images.length > 0) {
				uni.previewImage({
					urls: this.storeInfo.door_images,
					current: index
				})
			}
		},

		// 删除门店
		deleteStore() {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这个门店信息吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const userInfo = uni.getStorageSync('userInfo')

							uni.showLoading({ title: '删除中...', mask: true })

							const deleteRes = await this.$request('user/addresses/delete', {
								user_id: userInfo.user_id,
								id: this.storeInfo.id
							}, 'POST')

							uni.hideLoading()

							if (deleteRes.status === 'success') {
								// 从本地存储删除
								let records = uni.getStorageSync('storeHistoryRecords') || []
								const index = records.findIndex(item => item.id === this.storeInfo.id)
								if (index !== -1) {
									records.splice(index, 1)
									uni.setStorageSync('storeHistoryRecords', records)
								}

								uni.showToast({
									title: '删除成功',
									icon: 'success'
								})

								setTimeout(() => {
									uni.navigateBack()
								}, 1500)
							} else {
								uni.showToast({
									title: deleteRes.msg || '删除失败',
									icon: 'none'
								})
							}
						} catch (error) {
							uni.hideLoading()
							console.error('删除门店失败:', error)
							uni.showToast({
								title: '网络错误，请重试',
								icon: 'none'
							})
						}
					}
				}
			})
		},

		// 确认修改
		async confirmModify() {
			// if (!this.hasModified) {
			// 	uni.showToast({
			// 		title: '没有修改内容',
			// 		icon: 'none'
			// 	})
			// 	return
			// }

			try {
				const userInfo = uni.getStorageSync('userInfo')
				if (!userInfo || !userInfo.user_id) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}

				// 处理设备编码数据
				const processedSnMacList = (this.storeInfo.sn_mac_code || [])
					.filter(item => item.value && item.value.trim())
					.map(item => ({
						id: item.id,
						value: item.value.trim().toUpperCase()
					}))

				// 转换 device_outside 值
				let deviceOutsideValue = this.storeInfo.device_outside
				if (deviceOutsideValue === 1) {
					deviceOutsideValue = true
				} else if (deviceOutsideValue === 0) {
					deviceOutsideValue = false
				} else {
					deviceOutsideValue = null
				}

				const submitData = {
					id: this.storeId,
					user_id: userInfo.user_id,
					store_name: this.storeInfo.store_name || '',
					address: this.storeInfo.address || '',
					detail_address: this.storeInfo.shop_address || '',
					longitude: parseFloat(this.storeInfo.longitude) || 0,
					latitude: parseFloat(this.storeInfo.latitude) || 0,
					province: this.storeInfo.province_name || '',
					city: this.storeInfo.city_name || '',
					district: this.storeInfo.district_name || '',
					snMaclist: processedSnMacList,
					device_outside: deviceOutsideValue,
					poi_remark: this.storeInfo.poi_remark || '',
					doorImages: this.storeInfo.door_images || [],
					location_description: this.storeInfo.location_description || '',
					phone_number: this.storeInfo.phone_number || '',
					name: this.storeInfo.name || '',
					distance: parseFloat(this.storeInfo.distance) || 0,
					recommended_service_time_start: this.storeInfo.recommended_service_time_start || '',
					recommended_service_time_end: this.storeInfo.recommended_service_time_end || '',
					shop_poi: this.storeInfo.shop_poi || ''
				}

				console.log('提交更新数据:', submitData)

				uni.showLoading({ title: '保存中...', mask: true })

				const res = await this.$request('user/addresses/update', submitData, 'POST')

				uni.hideLoading()

				console.log('更新响应:', res)

				if (res.status === 'success') {
					this.hasModified = false

					uni.showToast({
						title: '保存成功',
						icon: 'success',
						duration: 2000
					})

					// 延迟返回上一页，并触发列表页刷新
					setTimeout(() => {
						// 通过事件通知列表页刷新数据
						uni.$emit('refreshStoreList')
						uni.navigateBack()
					}, 1500)
				} else {
					uni.showToast({
						title: res.msg || '保存失败，请重试',
						icon: 'none',
						duration: 3000
					})
					console.error('保存失败，服务器返回:', res)
				}
			} catch (error) {
				uni.hideLoading()
				console.error('保存门店信息失败:', error)

				let errorMessage = '网络错误，请检查网络连接后重试'
				if (error.message) {
					errorMessage = `请求失败：${error.message}`
				}

				uni.showToast({
					title: errorMessage,
					icon: 'none',
					duration: 3000
				})
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.store-detail {
	min-height: 100vh;
	background-color: #F5F5F5;
}

.content {
	padding-bottom: 120rpx;
}

.image-section {
	width: 100%;
	padding: 20rpx 0;
	background-color: #FFFFFF;
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

	.image-scroll {
		width: 100%;
		white-space: nowrap;

		.image-list {
			display: inline-flex;
			padding: 0 20rpx;
			gap: 20rpx;

			.image-item {
				position: relative;
				display: inline-block;
				width: 200rpx;
				height: 200rpx;
				border-radius: 12rpx;
				overflow: hidden;
				flex-shrink: 0;
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

				.store-image {
					width: 100%;
					height: 100%;
				}
			}
		}
	}
}

.time-section {
	padding: 20rpx 30rpx;
	background-color: #FFFFFF;

	.time-text {
		font-size: 24rpx;
		color: #999;
	}
}

.info-list {
	margin-top: 20rpx;
	background-color: #FFFFFF;
	padding: 0 30rpx;

	.info-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #F0F0F0;

		&:last-child {
			border-bottom: none;
		}

		.info-label {
			display: flex;
			align-items: center;
			flex-shrink: 0;

			.label-icon {
				font-size: 32rpx;
				color: #2492F2;
				margin-right: 8rpx;
				line-height: 1;
			}

			.label-text {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
			}
		}

		.info-value-row {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			flex: 1;
			margin-left: 20rpx;

			.info-value {
				flex: 1;
				font-size: 26rpx;
				color: #666;
				line-height: 1.6;
				word-break: break-all;
				text-align: right;
			}

			.edit-icon {
				width: 32rpx;
				height: 32rpx;
				margin-left: 20rpx;
				flex-shrink: 0;
			}
		}
	}
}

.footer-buttons {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	padding: 20rpx 30rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	background-color: #FFFFFF;
	box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
	gap: 20rpx;

	.delete-btn,
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

	.delete-btn {
		background-color: #FF6B6B;
		color: #FFFFFF;
	}

	.confirm-btn {
		background: linear-gradient(135deg, #2492F2, #1890FF);
		color: #FFFFFF;
	}
}

// 编辑弹窗样式
.edit-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;

	.modal-content {
		width: 600rpx;
		background-color: #FFFFFF;
		border-radius: 16rpx;
		overflow: hidden;

		.modal-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 30rpx;
			border-bottom: 1rpx solid #F0F0F0;

			.modal-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}

			.modal-close {
				font-size: 48rpx;
				color: #999;
				line-height: 1;
				padding: 0 10rpx;
			}
		}

		.modal-body {
			padding: 30rpx;

			.edit-input,
			.edit-textarea {
				width: 100%;
				padding: 20rpx;
				font-size: 28rpx;
				color: #333;
				background-color: #F5F5F5;
				border-radius: 8rpx;
				border: none;
				box-sizing: border-box;
			}

			.edit-textarea {
				min-height: 200rpx;
			}
		}

		.modal-footer {
			display: flex;
			border-top: 1rpx solid #F0F0F0;

			.modal-btn {
				flex: 1;
				height: 88rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 32rpx;
				font-weight: 500;

				&.cancel-btn {
					color: #666;
					border-right: 1rpx solid #F0F0F0;
				}

				&.confirm-btn {
					color: #2492F2;
				}
			}
		}
	}
}
</style>
