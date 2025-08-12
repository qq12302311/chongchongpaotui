<template>
	<view class="service-provider-page">
		<!-- 自定义导航栏 -->
		<nav-bar title="服务商列表" title-align="center"></nav-bar>

		<!-- 内容区域 -->
		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 添加服务商按钮 -->
			<view class="add-provider-btn" @click="showAddProviderModal">
				<view class="add-icon">+</view>
				<text>添加服务商</text>
			</view>

			<!-- 搜索区域 -->
			<view class="search-box">
				<view class="search-icon-wrapper">
					<view class="search-icon"></view>
				</view>
				<input type="text" v-model="searchKeyword" placeholder="搜索服务商名称或联系人" class="search-input"
					@confirm="searchProviders" />
				<view class="search-btn" @click="searchProviders">搜索</view>
			</view>

			<!-- 服务商列表 -->
			<view class="provider-list" :style="{ paddingBottom: safeAreaBottom + 'px' }">
				<!-- 加载中提示 -->
				<view v-if="loading && !refreshing" class="loading-container">
					<view class="loading-spinner"></view>
					<text class="loading-text">加载中...</text>
				</view>

				<!-- 空状态 -->
				<view v-else-if="providerList.length === 0" class="empty-state">
					<view class="empty-icon"></view>
					<text class="empty-text">暂无服务商信息</text>
					<text class="empty-subtext">点击上方按钮添加服务商</text>
				</view>

				<!-- 服务商列表内容 -->
				<view v-else class="provider-list-content">
					<view class="provider-item" v-for="(provider, index) in providerList" :key="index"
						@click="showProviderDetail(provider)">
						<view class="provider-header">
							<view class="provider-name">{{ provider.company_name }}</view>
							<view class="provider-status" :class="provider.status || 'active'">
								{{ getStatusText(provider.status) }}
							</view>
						</view>
						<view class="provider-info">
							<view class="info-row">
								<text class="info-label">联系人：</text>
								<text class="info-value">{{ provider.contact_person }}</text>
							</view>
							<view class="info-row">
								<text class="info-label">联系电话：</text>
								<text class="info-value">{{ provider.phone_number }}</text>
							</view>
							<view class="info-row">
								<text class="info-label">服务区域：</text>
								<text class="info-value">{{ provider.province }} {{ provider.city }}
									{{ provider.district }}</text>
							</view>
							<view class="info-row">
								<text class="info-label">详细地址：</text>
								<text class="info-value">{{ provider.address }}</text>
							</view>
							<view class="info-row" v-if="provider.balance !== undefined">
								<text class="info-label">账户余额：</text>
								<text class="info-value">{{ provider.balance }}</text>
							</view>
							<view class="info-row" v-if="provider.rate !== undefined">
								<text class="info-label">费率：</text>
								<text class="info-value">{{ provider.rate }}</text>
							</view>
							<view class="info-row" v-if="provider.current_month_score !== undefined">
								<text class="info-label">本月评分：</text>
								<text class="info-value">{{ provider.current_month_score }}</text>
							</view>
							<view class="info-row" v-if="provider.last_month_score !== undefined">
								<text class="info-label">上月评分：</text>
								<text class="info-value">{{ provider.last_month_score }}</text>
							</view>
							<view class="info-row" v-if="provider.created_at">
								<text class="info-label">创建时间：</text>
								<text class="info-value">{{ formatDate(provider.created_at) }}</text>
							</view>
						</view>
						<view class="provider-actions">
							<view class="action-btn edit" @click.stop="editProvider(provider)">编辑</view>
						</view>
					</view>
				</view>

				<!-- 加载更多提示 -->
				<view v-if="providerList.length > 0 && hasMore" class="load-more">
					<text>加载更多...</text>
				</view>
				<view v-else-if="providerList.length > 0 && !hasMore" class="no-more">
					<text>没有更多数据了</text>
				</view>

				<!-- 底部占位行 -->
				<view class="bottom-placeholder" :style="{ height: (100 + safeAreaBottom) + 'rpx' }"></view>
			</view>
		</view>

		<!-- 添加/编辑服务商弹窗 -->
		<view class="modal-mask" v-if="showModal" @click="closeModal"></view>
		<view class="modal-container" v-if="showModal">
			<view class="modal-header">
				<text class="modal-title">{{ isEditing ? '编辑服务商' : '添加服务商' }}</text>
				<view class="modal-close" @click="closeModal">×</view>
			</view>
			<view class="modal-content">
				<scroll-view scroll-y class="form-scroll">
					<view class="form-group">
						<view class="form-item">
							<text class="form-label required">服务商名称</text>
							<input type="text" v-model="formData.company_name" placeholder="请输入服务商名称"
								class="form-input" />
						</view>
						<view class="form-item">
							<text class="form-label required">联系人</text>
							<input type="text" v-model="formData.contact_person" placeholder="请输入联系人姓名"
								class="form-input" />
						</view>
						<view class="form-item">
							<text class="form-label required">联系电话</text>
							<input type="text" v-model="formData.phone_number" placeholder="请输入联系电话"
								class="form-input" />
						</view>
						<view class="form-item">
							<text class="form-label required">省份</text>
							<input type="text" v-model="formData.province" placeholder="请输入省份" class="form-input" />
						</view>
						<view class="form-item">
							<text class="form-label required">城市</text>
							<input type="text" v-model="formData.city" placeholder="请输入城市" class="form-input" />
						</view>
						<view class="form-item">
							<text class="form-label required">区县</text>
							<input type="text" v-model="formData.district" placeholder="请输入区县" class="form-input" />
						</view>
						<view class="form-item">
							<text class="form-label required">详细地址</text>
							<input type="text" v-model="formData.address" placeholder="请输入详细地址" class="form-input" />
						</view>
						<view class="form-item">
							<text class="form-label required">经度</text>
							<input type="text" v-model="formData.longitude" placeholder="请输入经度" class="form-input" />
						</view>
						<view class="form-item">
							<text class="form-label required">纬度</text>
							<input type="text" v-model="formData.latitude" placeholder="请输入纬度" class="form-input" />
						</view>
						<view class="form-item" v-if="isEditing">
							<text class="form-label">状态</text>
							<view class="status-selector">
								<view class="status-option" :class="{ active: formData.status === 'active' }"
									@click="formData.status = 'active'">正常</view>
								<view class="status-option" :class="{ active: formData.status === 'inactive' }"
									@click="formData.status = 'inactive'">已停用</view>
								<view class="status-option" :class="{ active: formData.status === 'pending' }"
									@click="formData.status = 'pending'">待审核</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
			<view class="modal-footer">
				<view class="modal-btn cancel" @click="closeModal">取消</view>
				<view class="modal-btn confirm" :class="{disabled: submitLoading}"
					@click="!submitLoading && submitForm()">
					<text v-if="submitLoading">处理中...</text>
					<text v-else>{{ isEditing ? '保存' : '添加' }}</text>
				</view>
			</view>
		</view>



		<!-- 删除确认弹窗 -->
		<view class="confirm-modal-mask" v-if="showDeleteConfirm" @click="cancelDelete"></view>
		<view class="confirm-modal" v-if="showDeleteConfirm">
			<view class="confirm-title">删除确认</view>
			<view class="confirm-content">确定要删除该服务商吗？此操作不可恢复。</view>
			<view class="confirm-buttons">
				<view class="confirm-btn cancel" @click="cancelDelete">取消</view>
				<view class="confirm-btn delete" @click="deleteProvider">删除</view>
			</view>
		</view>
	</view>
</template>

<script>
	import NavBar from '@/components/NavBar.vue'

	export default {
		components: {
			NavBar
		},
		// 启用页面下拉刷新
		enablePullDownRefresh: true,
		// 设置下拉刷新的样式
		navigationBarBackgroundColor: '#2492F2',
		backgroundTextStyle: 'light',
		data() {
			return {
				riderUserInfo: '',
				navBarHeight: 0,
				safeAreaBottom: 0,
				searchKeyword: '',
				providerList: [],
				loading: false,
				refreshing: false,
				hasMore: true,
				page: 1,
				pageSize: 10,
				showModal: false,
				isEditing: false,
				currentProvider: null,
				formData: {
					company_name: '',
					contact_person: '',
					phone_number: '',
					address: '',
					longitude: '',
					latitude: '',
					province: '',
					city: '',
					district: '',
					status: 'active'
				},
				submitLoading: false,

				showDeleteConfirm: false,
				providerToDelete: null
			}
		},
		onLoad() {
			// 计算导航栏高度和底部安全区域
			const systemInfo = uni.getSystemInfoSync()
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			this.navBarHeight = menuButtonInfo.bottom + 12

			// 计算底部安全区域高度
			// if (systemInfo.safeArea) {
			//   const safeAreaBottom = systemInfo.screenHeight - systemInfo.safeArea.bottom
			//   this.safeAreaBottom = safeAreaBottom > 0 ? safeAreaBottom : 0
			// }
			this.riderUserInfo = uni.getStorageSync('riderUserInfo')

			// 加载数据
			this.loadProviders()
		},
		methods: {
			// 加载服务商列表
			async loadProviders() {
				try {
					this.loading = true

					// 发起请求获取服务商列表
					const res = await this.$request('service/group/list', {
						page: this.page,
						per_page: this.pageSize,
						sign: 'chongchong',
						service_member_id: this.riderUserInfo.id
					}, 'POST')

					// 处理响应数据
					if (res.status === 'success') {
						// API直接返回数组数据
						const providerData = res.data || []

						// 如果是第一页，直接替换列表数据
						if (this.page === 1) {
							this.providerList = providerData
						} else {
							// 否则追加到现有列表
							this.providerList = [...this.providerList, ...providerData]
						}

						// 判断是否还有更多数据
						// 如果返回的数据条数等于页面大小，则认为可能有更多数据
						this.hasMore = providerData.length >= this.pageSize
					} else {
						// 请求失败处理
						uni.showToast({
							title: res.msg || '加载失败，请重试',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('加载服务商列表失败:', error)
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none'
					})
				} finally {
					this.loading = false
					this.refreshing = false
				}
			},

			// 搜索服务商
			searchProviders() {
				this.page = 1
				this.loadProviders()
			},

			// 下拉刷新
			refreshProviders() {
				this.refreshing = true
				this.page = 1
				this.loadProviders()
			},

			// 监听页面下拉刷新
			onPullDownRefresh() {
				this.refreshProviders()
				// 完成后停止下拉刷新动画
				setTimeout(() => {
					uni.stopPullDownRefresh()
				}, 1000)
			},

			// 加载更多
			loadMoreProviders() {
				if (this.hasMore && !this.loading) {
					this.page++
					this.loadProviders()
				}
			},

			// 监听页面滚动到底部
			onReachBottom() {
				this.loadMoreProviders()
			},

			// 显示添加服务商弹窗
			showAddProviderModal() {
				this.isEditing = false
				this.formData = {
					company_name: '',
					contact_person: '',
					phone_number: '',
					address: '',
					longitude: '',
					latitude: '',
					province: '',
					city: '',
					district: '',
					status: 'active'
				}
				this.showModal = true
			},

			// 编辑服务商
			editProvider(provider) {
				this.isEditing = true
				this.currentProvider = provider

				// 适配API返回的数据结构
				this.formData = {
					company_name: provider.company_name,
					contact_person: provider.contact_person,
					phone_number: provider.phone_number,
					address: provider.address,
					longitude: provider.longitude,
					latitude: provider.latitude,
					province: provider.province,
					city: provider.city,
					district: provider.district,
					status: provider.status || 'active',
					// 保存服务商ID
					id: provider.service_provider_id || provider.id
				}

				this.showModal = true
			},

			// 关闭弹窗
			closeModal() {
				this.showModal = false
			},

			// 提交表单
			async submitForm() {
				// 表单验证
				if (!this.formData.company_name) {
					uni.showToast({
						title: '请输入服务商名称',
						icon: 'none'
					})
					return
				}
				if (!this.formData.contact_person) {
					uni.showToast({
						title: '请输入联系人',
						icon: 'none'
					})
					return
				}
				if (!this.formData.phone_number) {
					uni.showToast({
						title: '请输入联系电话',
						icon: 'none'
					})
					return
				}
				if (!this.formData.province) {
					uni.showToast({
						title: '请输入省份',
						icon: 'none'
					})
					return
				}
				if (!this.formData.city) {
					uni.showToast({
						title: '请输入城市',
						icon: 'none'
					})
					return
				}
				if (!this.formData.district) {
					uni.showToast({
						title: '请输入区县',
						icon: 'none'
					})
					return
				}
				if (!this.formData.address) {
					uni.showToast({
						title: '请输入详细地址',
						icon: 'none'
					})
					return
				}
				if (!this.formData.longitude) {
					uni.showToast({
						title: '请输入经度',
						icon: 'none'
					})
					return
				}
				if (!this.formData.latitude) {
					uni.showToast({
						title: '请输入纬度',
						icon: 'none'
					})
					return
				}

				try {
					this.submitLoading = true

					// 准备请求数据
					const requestData = {
						company_name: this.formData.company_name,
						contact_person: this.formData.contact_person,
						phone_number: this.formData.phone_number,
						address: this.formData.address,
						longitude: this.formData.longitude,
						latitude: this.formData.latitude,
						province: this.formData.province,
						city: this.formData.city,
						district: this.formData.district,
						sign: 'chongchong'
					}

					// 获取当前登录用户信息
					const userInfo = uni.getStorageSync('userInfo') || {}
					// 添加service_member_id参数
					if (userInfo.id) {
						requestData.service_member_id = userInfo.id
					}

					if (this.isEditing && this.currentProvider) {
						// 如果是编辑模式，添加ID和状态
						const providerId = this.formData.id || this.currentProvider.service_provider_id || this
							.currentProvider.id

						// 添加service_provider_id参数
						requestData.service_provider_id = providerId

						// 保留原有的id参数，以兼容可能的旧接口
						requestData.id = providerId

						// 添加状态参数
						requestData.status = this.formData.status
					}

					// 发送请求
					const url = this.isEditing ? 'service/group/update' : 'service/group/register'

					// 确保在编辑和添加时都传递service_member_id参数
					if (!requestData.service_member_id) {
						// 如果没有获取到用户ID，使用默认值或从其他地方获取
						requestData.service_member_id = uni.getStorageSync('riderUserInfo')?.id || '1'
					}

					// 确保在编辑时传递service_provider_id参数
					if (this.isEditing && !requestData.service_provider_id) {
						const providerId = this.formData.id || this.currentProvider?.service_provider_id || this
							.currentProvider?.id
						if (providerId) {
							requestData.service_provider_id = providerId
						}
					}

					const res = await this.$request(url, requestData, 'POST')

					// 处理响应
					if (res.code === 0) {
						// 请求成功
						uni.showToast({
							title: this.isEditing ? '更新成功' : '添加成功',
							icon: 'success'
						})

						// 刷新列表
						this.page = 1
						this.loadProviders()

						// 关闭弹窗
						this.showModal = false
					} else {
						// 请求失败
						uni.showToast({
							title: res.msg || (this.isEditing ? '更新失败' : '添加失败'),
							icon: 'none'
						})
					}

					// 模拟成功（开发阶段使用，实际部署时应移除）
					if (!res || res.code !== 0) {
						console.warn('使用模拟数据处理表单提交')
						if (this.isEditing) {
							// 更新现有服务商
							const idField = this.currentProvider.service_provider_id ? 'service_provider_id' : 'id'
							const idValue = this.currentProvider.service_provider_id || this.currentProvider.id
							const index = this.providerList.findIndex(p => (p[idField] || p.id) === idValue)

							if (index !== -1) {
								// 保留原始数据中的其他字段
								const updatedProvider = {
									...this.providerList[index],
									...this.formData
								}

								// 确保ID字段正确
								if (this.currentProvider.service_provider_id) {
									updatedProvider.service_provider_id = this.currentProvider.service_provider_id
								} else {
									updatedProvider.id = this.currentProvider.id
								}

								this.providerList[index] = updatedProvider
							}
						} else {
							// 添加新服务商
							this.providerList.unshift({
								...this.formData,
								service_provider_id: Date.now(),
								status: 'pending',
								created_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
								balance: '0.00',
								rate: '0.00',
								required_deposit: '0.00',
								actual_deposit: '0.00',
								longitude: this.formData.longitude
							})
						}

						uni.showToast({
							title: this.isEditing ? '更新成功' : '添加成功',
							icon: 'success'
						})

						this.showModal = false
					}
				} catch (error) {
					console.error('提交表单失败:', error)
					uni.showToast({
						title: '操作失败，请重试',
						icon: 'none'
					})
				} finally {
					this.submitLoading = false
				}
			},

			// 显示服务商详情
			showProviderDetail(provider) {
				// 可以在这里实现查看详情的逻辑
				console.log('查看服务商详情:', provider)
			},

			// 获取状态文本
			getStatusText(status) {
				const statusMap = {
					'active': '正常',
					'inactive': '已停用',
					'pending': '待审核'
				}
				return statusMap[status] || '正常'
			},

			// 格式化日期
			formatDate(dateString) {
				if (!dateString) return '';

				try {
					// 处理ISO格式的日期字符串
					const date = new Date(dateString);
					if (isNaN(date.getTime())) return dateString;

					// 格式化为 YYYY-MM-DD HH:MM
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					const hours = String(date.getHours()).padStart(2, '0');
					const minutes = String(date.getMinutes()).padStart(2, '0');

					return `${year}-${month}-${day} ${hours}:${minutes}`;
				} catch (error) {
					console.error('日期格式化错误:', error);
					return dateString;
				}
			},



			// 确认删除服务商
			confirmDeleteProvider(provider) {
				// 保存完整的服务商对象
				this.providerToDelete = provider
				this.showDeleteConfirm = true
			},

			// 取消删除
			cancelDelete() {
				this.showDeleteConfirm = false
				this.providerToDelete = null
			},

			// 删除服务商
			async deleteProvider() {
				if (!this.providerToDelete) return

				try {
					// 发送删除请求
					const res = await this.$request({
						url: 'service/group/delete',
						method: 'POST',
						data: {
							id: this.providerToDelete.service_provider_id || this.providerToDelete.id,
							sign: 'chongchong'
						}
					})

					// 处理响应
					if (res.code === 0) {
						// 删除成功
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						})

						// 刷新列表
						this.page = 1
						this.loadProviders()
					} else {
						// 删除失败
						uni.showToast({
							title: res.msg || '删除失败',
							icon: 'none'
						})
					}

					// 模拟成功（开发阶段使用，实际部署时应移除）
					if (!res || res.code !== 0) {
						console.warn('使用模拟数据处理删除')
						const idField = this.providerToDelete.service_provider_id ? 'service_provider_id' : 'id'
						const idValue = this.providerToDelete.service_provider_id || this.providerToDelete.id
						const index = this.providerList.findIndex(p => (p[idField] || p.id) === idValue)
						if (index !== -1) {
							this.providerList.splice(index, 1)
						}

						uni.showToast({
							title: '删除成功',
							icon: 'success'
						})
					}
				} catch (error) {
					console.error('删除服务商失败:', error)
					uni.showToast({
						title: '删除失败，请重试',
						icon: 'none'
					})
				} finally {
					this.showDeleteConfirm = false
					this.providerToDelete = null
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.service-provider-page {
		min-height: 100vh;
		background-color: #f5f5f5;
		width: 100%;
		box-sizing: border-box;
		overflow: visible;
		/* 改为visible，确保内容不会被截断 */
	}

	.content {
		width: 100%;
		box-sizing: border-box;
		overflow: visible;
		/* 确保内容不会被截断 */
		padding-bottom: 20rpx;
		/* 添加适当的底部内边距 */
	}

	// 添加服务商按钮
	.add-provider-btn {
		margin: 20rpx;
		height: 80rpx;
		background-color: #2492F2;
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 28rpx;
		box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.2);
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.98);
			opacity: 0.9;
		}

		.add-icon {
			font-size: 36rpx;
			margin-right: 10rpx;
			font-weight: bold;
		}
	}

	// 搜索框
	.search-box {
		display: flex;
		align-items: center;
		background-color: #fff;
		border-radius: 8rpx;
		padding: 0 16rpx;
		margin: 20rpx;
		border: 1rpx solid #eee;
		height: 70rpx;

		.search-icon-wrapper {
			width: 40rpx;
			height: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.search-icon {
			width: 30rpx;
			height: 30rpx;
			border: 2rpx solid #999;
			border-radius: 50%;
			position: relative;

			&::after {
				content: '';
				position: absolute;
				width: 10rpx;
				height: 2rpx;
				background-color: #999;
				bottom: -6rpx;
				right: -6rpx;
				transform: rotate(45deg);
			}
		}

		.search-input {
			flex: 1;
			height: 70rpx;
			font-size: 26rpx;
			padding: 0 16rpx;
		}

		.search-btn {
			padding: 0 16rpx;
			height: 70rpx;
			line-height: 70rpx;
			color: #2492F2;
			font-size: 26rpx;
			position: relative;

			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				width: 1rpx;
				height: 30rpx;
				background-color: #e0e0e0;
			}
		}
	}

	// 服务商列表
	.provider-list {
		margin: 0 20rpx;
		width: calc(100% - 40rpx);
		box-sizing: border-box;
	}

	// 服务商列表内容容器
	.provider-list-content {
		width: 100%;
		box-sizing: border-box;
	}

	// 加载中提示
	.loading-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 40rpx 0;

		.loading-spinner {
			width: 40rpx;
			height: 40rpx;
			border: 3rpx solid #f3f3f3;
			border-top: 3rpx solid #2492F2;
			border-radius: 50%;
			animation: spin 1s linear infinite;
			margin-right: 10rpx;
		}

		.loading-text {
			font-size: 24rpx;
			color: #999;
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	// 空状态
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;

		.empty-icon {
			width: 120rpx;
			height: 120rpx;
			background-color: #f5f5f5;
			border-radius: 50%;
			margin-bottom: 20rpx;
			position: relative;

			&::before,
			&::after {
				content: '';
				position: absolute;
				background-color: #ddd;
			}

			&::before {
				width: 60rpx;
				height: 4rpx;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
			}

			&::after {
				width: 4rpx;
				height: 60rpx;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				opacity: 0.5;
			}
		}

		.empty-text {
			font-size: 28rpx;
			color: #999;
			margin-bottom: 10rpx;
		}

		.empty-subtext {
			font-size: 24rpx;
			color: #bbb;
		}
	}

	// 服务商列表项
	.provider-item {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		width: 100%;
		box-sizing: border-box;
		overflow: hidden;

		.provider-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 16rpx;
			padding-bottom: 16rpx;
			border-bottom: 1rpx solid #f5f5f5;
			width: 100%;
			box-sizing: border-box;

			.provider-name {
				font-size: 30rpx;
				font-weight: 500;
				color: #333;
				flex: 1;
				margin-right: 10rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.provider-status {
				font-size: 22rpx;
				padding: 4rpx 12rpx;
				border-radius: 20rpx;
				flex-shrink: 0;

				&.active {
					color: #52c41a;
					background-color: #f6ffed;
					border: 1rpx solid #b7eb8f;
				}

				&.inactive {
					color: #faad14;
					background-color: #fffbe6;
					border: 1rpx solid #ffe58f;
				}

				&.pending {
					color: #1890ff;
					background-color: #e6f7ff;
					border: 1rpx solid #91d5ff;
				}
			}
		}

		.provider-info {
			margin-bottom: 16rpx;

			.info-row {
				display: flex;
				margin-bottom: 10rpx;
				font-size: 26rpx;
				line-height: 1.5;
				width: 100%;
				flex-wrap: wrap;

				.info-label {
					color: #666;
					min-width: 140rpx;
					flex-shrink: 0;
				}

				.info-value {
					color: #333;
					flex: 1;
					word-break: break-all;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}

		.provider-actions {
			display: flex;
			justify-content: flex-end;
			padding-top: 16rpx;
			border-top: 1rpx solid #f5f5f5;
			width: 100%;
			box-sizing: border-box;
			flex-wrap: wrap;

			.action-btn {
				padding: 8rpx 24rpx;
				font-size: 24rpx;
				border-radius: 30rpx;
				margin-left: 16rpx;

				&.edit {
					color: #2492F2;
					background-color: rgba(36, 146, 242, 0.1);
					border: 1rpx solid rgba(36, 146, 242, 0.2);
				}

				&.delete {
					color: #ff4d4f;
					background-color: rgba(255, 77, 79, 0.1);
					border: 1rpx solid rgba(255, 77, 79, 0.2);
				}
			}
		}
	}

	// 加载更多/没有更多
	.load-more,
	.no-more {
		text-align: center;
		padding: 20rpx 0;
		font-size: 24rpx;
		color: #999;
	}

	// 底部占位行
	.bottom-placeholder {
		width: 100%;
		min-height: 100rpx;
		/* 设置适当的最小高度，确保底部内容不被遮挡 */
	}

	// 弹窗样式
	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
	}

	.modal-container {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 90%;
		max-width: 600rpx;
		background-color: #fff;
		border-radius: 12rpx;
		z-index: 1000;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		max-height: 80vh;

		.modal-header {
			padding: 24rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1rpx solid #f0f0f0;

			.modal-title {
				font-size: 32rpx;
				font-weight: 500;
				color: #333;
			}

			.modal-close {
				font-size: 40rpx;
				color: #999;
				line-height: 1;
			}
		}

		.modal-content {
			padding: 24rpx;
			flex: 1;
			overflow: hidden;

			.form-scroll {
				max-height: 60vh;
			}

			.form-group {
				.form-item {
					margin-bottom: 24rpx;

					.form-label {
						display: block;
						font-size: 26rpx;
						color: #333;
						margin-bottom: 12rpx;

						&.required::before {
							content: '*';
							color: #ff4d4f;
							margin-right: 4rpx;
						}
					}

					.form-input {
						width: 100%;
						height: 80rpx;
						border: 1rpx solid #e0e0e0;
						border-radius: 8rpx;
						padding: 0 16rpx;
						font-size: 26rpx;
						box-sizing: border-box;
					}

					.status-selector {
						display: flex;
						margin-top: 10rpx;

						.status-option {
							flex: 1;
							height: 70rpx;
							line-height: 70rpx;
							text-align: center;
							font-size: 26rpx;
							border: 1rpx solid #e0e0e0;
							margin-right: 10rpx;
							border-radius: 8rpx;
							color: #666;

							&:last-child {
								margin-right: 0;
							}

							&.active {
								background-color: #2492F2;
								color: #fff;
								border-color: #2492F2;
							}
						}
					}


				}
			}
		}

		.modal-footer {
			padding: 24rpx;
			display: flex;
			justify-content: flex-end;
			border-top: 1rpx solid #f0f0f0;

			.modal-btn {
				padding: 12rpx 30rpx;
				font-size: 28rpx;
				border-radius: 8rpx;
				margin-left: 16rpx;

				&.cancel {
					color: #666;
					background-color: #f5f5f5;
					border: 1rpx solid #e0e0e0;
				}

				&.confirm {
					color: #fff;
					background-color: #2492F2;
					border: 1rpx solid #2492F2;

					&.disabled {
						opacity: 0.6;
					}
				}
			}
		}
	}



	// 删除确认弹窗
	.confirm-modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
	}

	.confirm-modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80%;
		background-color: #fff;
		border-radius: 12rpx;
		z-index: 1000;
		overflow: hidden;
		padding: 30rpx;

		.confirm-title {
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
			text-align: center;
			margin-bottom: 20rpx;
		}

		.confirm-content {
			font-size: 28rpx;
			color: #666;
			text-align: center;
			margin-bottom: 30rpx;
		}

		.confirm-buttons {
			display: flex;
			justify-content: space-between;

			.confirm-btn {
				flex: 1;
				height: 80rpx;
				line-height: 80rpx;
				text-align: center;
				font-size: 28rpx;
				border-radius: 8rpx;

				&.cancel {
					color: #666;
					background-color: #f5f5f5;
					margin-right: 16rpx;
				}

				&.delete {
					color: #fff;
					background-color: #ff4d4f;
				}
			}
		}
	}
</style>