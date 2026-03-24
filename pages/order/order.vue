<template>
	<view class="container">
		<nav-bar title="订单列表" title-align="center"></nav-bar>
		<!-- 内容区域，移除顶部的自定义nav-bar -->
		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 搜索区域 -->
			<view class="search-section">
				<view class="search-bar">
					<view class="search-condition" @click="toggleSearchConditions">
						<text>选择搜索条件</text>
						<text class="arrow" :class="{ 'arrow-up': showSearchConditions }">▼</text>
					</view>
				</view>

				<!-- 搜索条件下拉区域 -->
				<view v-if="showSearchConditions" class="search-conditions-dropdown">
					<view class="condition-group">
						<view class="condition-title">订单类型</view>
						<view class="condition-options">
							<view class="condition-option active">全部</view>
							<view class="condition-option">补宝</view>
							<view class="condition-option">接线</view>
							<view class="condition-option">其他</view>
						</view>
					</view>
					<view class="condition-group">
						<view class="condition-title">订单状态</view>
						<view class="condition-options">
							<view class="condition-option active">全部</view>
							<view class="condition-option">进行中</view>
							<view class="condition-option">已完成</view>
							<view class="condition-option">已取消</view>
						</view>
					</view>
					<view class="condition-buttons">
						<view class="reset-btn">重置</view>
						<view class="confirm-btn">确定</view>
					</view>
				</view>

				<view class="search-input-wrapper">
					<view class="search-input">
						<text class="iconfont search-icon">��</text>
						<input
						type="text"
						v-model="searchKeyword"
						placeholder="输入关键字搜索订单"
						placeholder-style="color: #AAAAAA;"
						@confirm="handleSearch" />
					<view class="search-btn" @click="handleSearch">
						<text>搜索</text>
					</view>
					</view>
				</view>
			</view>

			<!-- 标签栏 -->
			<view class="tabs">
				<view v-for="(tab, index) in tabs" :key="index" class="tab-item"
					:class="{ active: currentTab === index }" @click="switchTab(index)">
					<text>{{ tab }}</text>
				</view>
				<view class="tab-line" :style="{ left: tabLineLeft, transform: tabLineTransform }"></view>
			</view>

			<!-- 订单列表内容 -->
			<view class="order-content">
				<!-- 首次加载中提示 -->
				<view v-if="loading && orderList.length === 0" class="loading-container">
					<view class="loading-spinner"></view>
					<text class="loading-text">加载中...</text>
				</view>
				<!-- 空状态 -->
				<view v-else-if="!loading && orderList.length === 0" class="empty-state">
					<image class="empty-image" src="https://ccpt.qiniu.cc111.cn/order/notorder.png" mode="aspectFit"></image>
					<text class="empty-text">暂无相关订单</text>
				</view>
				<!-- 订单列表 -->
				<view v-else class="order-list">
					<view v-for="(order, index) in orderList" :key="index"
						class="order-item"
						:class="{ 'order-item-gray': order.status === 'canceled' || ((order.status === 'finished' || order.status === 'completed') && order.payment_status === 'refunded') }"
						@click="goToOrderDetail(order)">
					<view class="order-header">
						<text class="order-type">{{getBrandText(order.brand)}} {{getDetailText(order.task_detail)}} x{{getItemNumber(order.task_detail)}}</text>
						<!-- 已完成订单显示评价信息 -->
						<view v-if="order.status === 'completed'" class="review-status" @click.stop="handleReviewClick(order)">
							<view class="stars">
								<text v-for="star in 5" :key="star" class="star" :class="{ 'star-filled': star <= getReviewRating(order) }">★</text>
							</view>
							<text class="review-text" :class="order.review ? 'reviewed' : 'not-reviewed'">
								{{ order.review ? '已评价' : '未评价' }}
							</text>
						</view>
						<!-- 其他状态显示原有状态文本 -->
						<text v-else class="order-status" :class="[(order.status === 'finished' || order.status === 'completed') && order.payment_status === 'refunded' ? 'refunded' : order.status]">{{getStatusText(order)}}</text>
					</view>
						<view class="order-info">
							<view class="info-item">
								<text class="label">门店名称：</text>
								<text class="value">{{getStoreName(order.task_detail)}}</text>
							</view>
							<view class="info-item">
								<text class="label">门店地址：</text>
								<text class="value">{{order.province_name}}{{order.city_name}}{{order.district_name}}{{order.shop_address}}{{order.address}}</text>
							</view>
							<view class="info-item">
								<text class="label">服务项目：</text>
								<text class="value">{{formatServiceItems(order.task_detail)}}</text>
							</view>
							<view class="info-item" v-if="formatExtraServices(order.task_detail)">
								<text class="label">附加服务：</text>
								<text class="value">{{formatExtraServices(order.task_detail)}}</text>
							</view>
							<view class="info-item" v-if="order.reward && order.reward.length > 0">
								<text class="label">打赏金额：</text>
								<text class="value reward">¥{{getTotalRewardAmount(order.reward)}}</text>
							</view>
							<view class="info-item">
								<text class="label">下单时间：</text>
								<text class="value">{{order.task_date}}</text>
							</view>
							<view class="info-item price-item">
								<text class="label">订单金额：</text>
								<view class="price-wrapper" @click.stop="togglePrice(order.task_id, $event)">
									<text class="value price" v-if="showPriceMap[order.task_id]">¥{{order.order_amount}}</text>
									<image v-else class="arrow-icon" src="https://ccpt.qiniu.cc111.cn/home/my/byj.svg" mode="aspectFit"></image>
								</view>
								<!-- 再来一单按钮 - 绝对定位 -->
								<view class="reorder-btn-float" @click.stop="handleReorderFromOrder(order)">
									<image class="reorder-emoji" src="https://ccpt.qiniu.cc111.cn/zlyd.svg" mode="aspectFit"></image>
									<text class="reorder-text">再来一单</text>
								</view>
							</view>
					</view>
				</view>
					<!-- 底部加载更多指示器 -->
					<view class="load-more-container">
						<view v-if="loading && orderList.length > 0" class="loading-more">
							<view class="loading-spinner-small"></view>
							<text class="loading-more-text">加载中...</text>
						</view>
						<view v-else-if="!hasMore && orderList.length > 0" class="no-more">
							<text class="no-more-text">没有更多订单了</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部导航栏 -->
		<tab-bar></tab-bar>

		<!-- 悬浮小图 -->
		<floating-image></floating-image>

		<!-- 悬浮聊天图标 -->
		<!-- <FloatingChatIconUser /> -->

		<!-- 底部占位，确保内容不被底部导航栏遮挡 -->
		<view class="bottom-placeholder"></view>
	</view>
</template>

<script>
	import NavBar from '@/components/NavBar.vue'
	import TabBar from '@/components/tab-bar/tab-bar.vue'
	import FloatingImage from '@/components/FloatingImage/index.vue'
	// import FloatingChatIconUser from '@/components/FloatingChatIconUser/index.vue'
	import md5 from 'md5'
	import floatingImageMixin from '@/mixins/floatingImageMixin.js'

	export default {
		components: {
			TabBar,
			NavBar,
			FloatingImage,
			// FloatingChatIconUser
		},
		mixins: [floatingImageMixin],
		data() {
			return {
				navBarHeight: 0,
				showSearchConditions: false,
				tabs: ['新任务', '进行中', '完成待确认', '已结束'],
				currentTab: 0,
				tabLineLeft: '10%',
				tabLineTransform: 'translateX(-15px)',
				orderList: [], // 订单列表
				loading: false, // 加载状态
				page: 1, // 当前页码
				pageSize: 5, // 每页数量
				hasMore: true, // 是否还有更多数据
				showPriceMap: {}, // 控制每个订单金额的显示/隐藏
				searchKeyword: '' // 搜索关键字
			}
		},
	onShow() {
		// 计算导航栏高度
		const systemInfo = uni.getSystemInfoSync()
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
		this.navBarHeight = menuButtonInfo.bottom + 12

		this.loadOrderList() // 初始加载，不是加载更多
	},
	onUnload() {
		// 页面卸载时清理可能残留的临时数据
		uni.removeStorageSync('reorderFormData')
	},
	// 上拉加载更多
	onReachBottom() {
		console.log('触发上拉加载更多')
		if (this.hasMore && !this.loading) {
			console.log('开始加载更多订单，当前页码:', this.page)
			this.loadOrderList(true) // 加载更多
		} else if (!this.hasMore) {
			console.log('没有更多数据了')
			uni.showToast({
				title: '没有更多订单了',
				icon: 'none',
				duration: 1500
			})
		}
	},
		mounted() {
			// 初始化标签下划线位置
			this.updateTabLinePosition(this.currentTab)
		},
	methods: {
		// 【新增方法】根据城市和区县名称查找并更新 district_id
		async updateDistrictIdByAddress(cityName, districtName) {
			try {
				console.log('�� [再来一单] 开始查找 district_id，城市:', cityName, '区县:', districtName);
				
				// 获取城市列表数据
				let cityListData = uni.getStorageSync('cityList');
				if (!cityListData) {
					console.log('�� 城市列表数据为空，正在获取...');
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
											console.log('✅ [再来一单] 找到匹配的区县，district_id:', foundDistrictId);
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
					console.log('✅ [再来一单] 已更新本地存储 selectedDistrictId:', foundDistrictId);
				} else {
					console.warn('⚠️ [再来一单] 未找到匹配的 district_id，城市:', cityName, '区县:', districtName);
				}
			} catch (error) {
				console.error('❌ [再来一单] 更新 district_id 失败:', error);
			}
		},
		
		toggleSearchConditions() {
			this.showSearchConditions = !this.showSearchConditions
		},
		// 处理搜索
		handleSearch() {
			// 重置页码和列表
			this.page = 1
			this.hasMore = true
			this.orderList = []
			// 重新加载订单列表
			this.loadOrderList(false)
		},
		// 切换金额显示/隐藏
		togglePrice(taskId, event) {
			event.stopPropagation()
			this.$set(this.showPriceMap, taskId, !this.showPriceMap[taskId])
		},
			switchTab(index) {
				this.currentTab = index
				this.updateTabLinePosition(index)
				this.page = 1
				this.hasMore = true
				this.orderList = []
				this.loadOrderList(false) // 切换标签时重新加载，不是加载更多
			},
			updateTabLinePosition(index) {
				// 计算每个标签的宽度百分比
				const tabWidth = 100 / this.tabs.length
				// 计算下划线应该在的位置 (标签中心)
				const left = (index * tabWidth) + (tabWidth / 2)
				this.tabLineLeft = `${left}%`
			},
		// 加载订单列表
		async loadOrderList(isLoadMore = false) {
			// 如果是加载更多但没有更多数据，直接返回
			if (isLoadMore && !this.hasMore) {
				console.log('没有更多数据，停止加载')
				return
			}
			
			// 如果正在加载中，避免重复请求
			if (this.loading) {
				console.log('正在加载中，跳过本次请求')
				return
			}

			this.loading = true // 开始加载，显示加载中状态
			console.log('开始加载订单列表，isLoadMore:', isLoadMore, '当前页码:', this.page)
			try {
				const statusMap = {
					0: 'waiting', // 新订单
					1: ['assigned'], // 进行中（需要查询多个状态）
					2: ['finished'], // 完成待确认
					3: ['completed', 'canceled'] // 已结束（合并已完成和已取消）
				}

				// 获取用户信息
				const userInfo = uni.getStorageSync('userInfo')
				const openid = uni.getStorageSync('openid')

				if (!userInfo || !userInfo.user_id || !openid) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}

				// 计算sign
				const signStr = `user_id=${userInfo.user_id}&openid=${openid}`
				const sign = md5(signStr)

				let list = []
				
				// 获取状态值（可能是字符串或数组）
				const statusValue = statusMap[this.currentTab]
				// 构建请求参数，status 直接传递（字符串或数组）
				const params = {
					status: statusValue,
					user_id: userInfo.user_id,
					sign: sign,
					per_page: 5,
					page: this.page
				}

				// 如果有搜索关键字，添加到参数中
				if (this.searchKeyword && this.searchKeyword.trim()) {
					params.search_term = this.searchKeyword.trim()
				}

				console.log('请求订单列表参数:', params)
				console.log('当前标签:', this.tabs[this.currentTab], 'status值:', statusValue)

				const res = await this.$request('task/list', params, 'POST')

				console.log('订单列表返回结果:', res)
				console.log('返回的订单数量:', res.data ? res.data.length : 0)
				
				if (res.code === 200) {
					list = res.data || []
				} else {
					console.error('加载订单失败:', res.msg || '未知错误')
					uni.showToast({
						title: res.msg || '加载失败',
						icon: 'none'
					})
					this.loading = false
					return
				}

				// 更新订单列表
				if (list.length > 0) {
					console.log('订单详情示例:', list[0])
				}
				
				console.log('当前标签:', this.tabs[this.currentTab], '订单列表:', list)
				if (isLoadMore) {
					// 加载更多时，追加到现有列表
					this.orderList = [...this.orderList, ...list]
					console.log('追加订单后总数:', this.orderList.length)
				} else {
					// 首次加载或刷新时，替换列表
					this.orderList = list
					console.log('刷新订单列表，总数:', this.orderList.length)
				}
				
				// 判断是否还有更多数据
				// 如果返回的数据量小于每页数量，说明没有更多数据了
				this.hasMore = list.length >= 5
				console.log('是否还有更多数据:', this.hasMore, '本次返回数量:', list.length)
				
				// 如果还有更多数据，页码+1，为下次加载做准备
				if (this.hasMore) {
					this.page++
					console.log('页码+1，下次将加载第', this.page, '页')
				}
			} catch (error) {
				console.error('加载订单列表失败:', error)
				uni.showToast({
					title: '加载失败，请重试',
					icon: 'none'
				})
			} finally {
				this.loading = false
			}
		},
			// 处理接单
			async handleAccept(order) {
				try {
					const res = await this.$request({
						url: '/api/task/accept',
						method: 'POST',
						data: {
							orderId: order.id
						}
					})

					if (res.code === 0) {
						uni.showToast({
							title: '接单成功',
							icon: 'success'
						})
						this.loadOrderList(false)
					} else {
						uni.showToast({
							title: res.msg || '接单失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('接单失败:', error)
					uni.showToast({
						title: '接单失败，请重试',
						icon: 'none'
					})
				}
			},
			// 处理完成
			async handleComplete(order) {
				try {
					const res = await this.$request({
						url: '/api/task/complete',
						method: 'POST',
						data: {
							orderId: order.id
						}
					})

					if (res.code === 0) {
						uni.showToast({
							title: '操作成功',
							icon: 'success'
						})
						this.loadOrderList(false)
					} else {
						uni.showToast({
							title: res.msg || '操作失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('操作失败:', error)
					uni.showToast({
						title: '操作失败，请重试',
						icon: 'none'
					})
				}
			},
			// 处理确认
			async handleConfirm(order) {
				try {
					const res = await this.$request({
						url: '/api/task/confirm',
						method: 'POST',
						data: {
							orderId: order.id
						}
					})

					if (res.code === 0) {
						uni.showToast({
							title: '确认成功',
							icon: 'success'
						})
						this.loadOrderList(false)
					} else {
						uni.showToast({
							title: res.msg || '确认失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('确认失败:', error)
					uni.showToast({
						title: '确认失败，请重试',
						icon: 'none'
					})
				}
			},
		getStatusText(order) {
			// 如果传入的是字符串（为了兼容性），直接返回旧逻辑
			if (typeof order === 'string') {
				const statusMap = {
					'waiting': '等待接单...',
					'assigned': '进行中',
					'finished_timeout': '超时完成',
					'finished': '待确认',
					'canceled': '已取消',
					'completed': '已完成'
				}
				return statusMap[order] || order
			}
			
		// 判断退款状态：status 是 finished 或 completed，且 payment_status 是 refunded
		if ((order.status === 'finished' || order.status === 'completed') && 
		    order.payment_status === 'refunded') {
			if (order.refund_status === 'full') {
				return '已退款-全额'
			} else if (order.refund_status === 'partial') {
				return '已退款-部分'
			} else {
				return '已退款'
			}
		}
			
			// 正常状态判断
			const statusMap = {
				'waiting': '等待接单...',
				'assigned': '进行中',
				'finished_timeout': '超时完成',
				'finished': '待确认',
				'canceled': '已取消',
				'completed': '已完成'
			}
			return statusMap[order.status] || order.status
		},
		// 获取品牌文本
			getBrandText(brand) {
				const brandMap = {
					'meituan': '美团',
					'guaishou': '怪兽',
					'xiaodian': '小电',
					'jiedian': '街电',
					'zhumang': '竹芒'
				}
				return brandMap[brand] || brand
			},
			// 获取服务详情文本
			getDetailText(taskDetail) {
				if (!taskDetail || !taskDetail.detail) return ''
				
				// 处理多选情况，取第一个服务类型
				const firstDetail = taskDetail.detail.includes(',') ? taskDetail.detail.split(',')[0].trim() : taskDetail.detail;
				
				const detailMap = {
					'bubao': '补宝',
					'goodRecycle': '好宝回收',
					'badRecycle': '坏宝回收',
					'offline_abnormal': '离线异常',
					'income_abnormal': '收入异常',
					'other_abnormal': '其他异常'
				}
				return detailMap[firstDetail] || firstDetail
			},
			// 格式化服务项目
			formatServiceItems(taskDetail) {
				if (!taskDetail) return ''

				const items = []

				// 主要服务项目 - 支持多选（逗号分隔）
				if (taskDetail.detail) {
					// 检查是否是多选（包含逗号）
					const details = taskDetail.detail.includes(',') ? taskDetail.detail.split(',') : [taskDetail.detail];
					
					// 处理多选情况
					if (details.length > 1) {
						// 多选时，分别显示好宝回收和坏宝回收的数量
						details.forEach(detail => {
							detail = detail.trim();
							let itemName;
							let itemNumber;
							
							switch (detail) {
								case 'bubao':
									itemName = '补宝';
									itemNumber = taskDetail.item_number || 1;
									break;
								case 'goodRecycle':
									itemName = '好宝回收';
									itemNumber = taskDetail.shoubao_normal_item_number || 0;
									break;
								case 'badRecycle':
									itemName = '坏宝回收';
									itemNumber = taskDetail.shoubao_broken_item_number || 0;
									break;
								case 'offline_abnormal':
									itemName = '离线异常';
									itemNumber = taskDetail.item_number || 1;
									break;
								case 'income_abnormal':
									itemName = '收入异常';
									itemNumber = taskDetail.item_number || 1;
									break;
								case 'other_abnormal':
									itemName = '其他异常';
									itemNumber = taskDetail.item_number || 1;
									break;
								default:
									itemName = detail;
									itemNumber = taskDetail.item_number || 1;
							}
							
							if (itemNumber > 0) {
								items.push(`${itemName}x${itemNumber}`);
							}
						});
					} else {
						// 单选时，保持原有逻辑
						let itemName;
						
						switch (taskDetail.detail) {
							case 'bubao':
								itemName = '补宝';
								break;
							case 'goodRecycle':
								itemName = '好宝回收';
								break;
							case 'badRecycle':
								itemName = '坏宝回收';
								break;
							case 'offline_abnormal':
								itemName = '离线异常';
								break;
							case 'income_abnormal':
								itemName = '收入异常';
								break;
							case 'other_abnormal':
								itemName = '其他异常';
								break;
							default:
								itemName = taskDetail.detail;
						}
						
						items.push(`${itemName}x${taskDetail.item_number || 1}`);
					}
				}

				return items.join('、')
			},
			// 格式化附加服务
			formatExtraServices(taskDetail) {
				if (!taskDetail) return ''

				const items = []

				// 附加服务项目
				for (let i = 1; i <= 6; i++) {
					const task = taskDetail[`extra_task_${i}`]
					const number = taskDetail[`extra_task_${i}_item_number`]
					if (task && number) {
						items.push(`${task}x${number}`)
					}
				}

				return items.join('、')
			},
			// 获取任务数量
			getItemNumber(taskDetail) {
				if (!taskDetail || !taskDetail.item_number) return 0
				return taskDetail.item_number
			},
			// 获取门店名称
			getStoreName(taskDetail) {
				if (!taskDetail || !taskDetail.store_name) return '-'
				return taskDetail.store_name
			},
			// 计算打赏总金额
			getTotalRewardAmount(rewards) {
				if (!rewards || !Array.isArray(rewards)) return '0.00'
				// 只计算支付成功的打赏
				const successfulRewards = rewards.filter(item => item.status === 'paid')
				const total = successfulRewards.reduce((sum, item) => {
					return sum + parseFloat(item.order_amount || 0)
				}, 0)
				return total.toFixed(2)
			},
		// 获取评价星级
		getReviewRating(order) {
			// 如果有评价数据，返回评价星级，否则返回0
			if (order.review && order.review.rating) {
				return parseInt(order.review.rating) || 0
			}
			return 0
		},
		// 处理评价点击
		handleReviewClick(order) {
			// 如果已经评价过，不做任何操作
			if (order.review) {
				return
			}
			// 未评价时，跳转到评价页面
			uni.navigateTo({
				url: `/pages/order/review?task_id=${order.task_id}`
			})
		},
		// 跳转到订单详情页
		goToOrderDetail(order) {
			uni.navigateTo({
				url: `/pages/order/detail?id=${order.task_id}`
			})
		},
		// 从订单再来一单
		async handleReorderFromOrder(order) {
			try {
				uni.showLoading({
					title: '正在导入...',
					mask: true
				})

				// 获取订单详情
				const userInfo = uni.getStorageSync('userInfo')
				const openid = uni.getStorageSync('openid')
				
				if (!userInfo || !userInfo.user_id || !openid) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}

				// 调用订单详情接口获取完整信息
				const signStr = `user_id=${userInfo.user_id}&openid=${openid}`
				const sign = md5(signStr)
				
				const params = {
					task_id: order.task_id,
					user_id: userInfo.user_id,
					sign: sign
				}

				const res = await this.$request('task/info', params, 'POST')

				if (res.code === 200 && res.data) {
					const orderDetail = res.data
					console.log('订单详情数据:', orderDetail)
					console.log('任务详情:', orderDetail.task_detail)
					
					// 【调试】打印经纬度信息
					console.log('===== 经纬度调试信息 =====')
					console.log('订单顶层经纬度:', {
						longitude: orderDetail.longitude,
						latitude: orderDetail.latitude,
						type: typeof orderDetail.longitude
					})
					if (orderDetail.task_detail) {
						console.log('task_detail 中的可能字段:', {
							has_longitude: 'longitude' in orderDetail.task_detail,
							has_latitude: 'latitude' in orderDetail.task_detail,
							has_shop_longitude: 'shop_longitude' in orderDetail.task_detail,
							has_shop_latitude: 'shop_latitude' in orderDetail.task_detail
						})
						// 打印 task_detail 的所有键
						console.log('task_detail 的所有字段:', Object.keys(orderDetail.task_detail))
					}
					console.log('========================')

					// 调用 task/provider/info 接口同步价格信息
					try {
						const districtId = orderDetail.district_id || uni.getStorageSync('selectedDistrictId')
						if (districtId) {
							const priceRes = await this.$request('task/provider/info', { district_id: districtId }, 'POST')
							if (priceRes.code === 200 && priceRes.data) {
								// 保存价格信息到本地存储
								uni.setStorageSync('providerInfo', priceRes.data)
								console.log('已同步价格信息:', priceRes.data)
							}
						}
					} catch (priceError) {
						console.error('同步价格信息失败:', priceError)
						// 不影响主流程,继续执行
					}
					
				// 获取门店的经纬度（优先从 task_detail 获取，如果不存在则从顶层获取）
				const shopLongitude = orderDetail.task_detail?.shop_longitude || 
									  orderDetail.task_detail?.longitude || 
									  orderDetail.longitude;
				const shopLatitude = orderDetail.task_detail?.shop_latitude || 
									 orderDetail.task_detail?.latitude || 
									 orderDetail.latitude;
				
				console.log('最终使用的门店经纬度:', {
					longitude: shopLongitude,
					latitude: shopLatitude,
					source: orderDetail.task_detail?.shop_longitude ? 'task_detail.shop_longitude' :
						   orderDetail.task_detail?.longitude ? 'task_detail.longitude' : 'orderDetail.longitude'
				})
					
				// 将订单信息转换为发布页面需要的格式
				const formData = {
					// 用户信息
					user_id: userInfo.user_id || 0,

					// 门店基本信息
					storeName: orderDetail.task_detail?.store_name || '',
					address: orderDetail.shop_address || '',  // shop_address 对应门店地址
					detailAddress: orderDetail.address || '',  // address 对应详细地址
					longitude: parseFloat(shopLongitude) || 0,
					latitude: parseFloat(shopLatitude) || 0,
					province: orderDetail.province_name || '',
					city: orderDetail.city_name || '',
					district: orderDetail.district_name || '',

					// 联系信息
					contact: orderDetail.task_detail?.contact_name || orderDetail.contact_name || '',
					phone: orderDetail.task_detail?.phone_number || orderDetail.phone_number || '',

				// 设备信息
				snMacList: orderDetail.task_detail?.sn_mac_code || [{
					id: Date.now(),
					value: ''
				}],
				shop_poi: orderDetail.task_detail?.shop_poi || '', // 门店POI字段
				device_outside: orderDetail.task_detail?.device_outside !== undefined ?
					orderDetail.task_detail.device_outside : '',

					// 门店图片
					doorImages: orderDetail.task_detail?.pic_url || [],

					// 订单备注和时间建议
					additional_notes: orderDetail.task_detail?.additional_notes || '',
					recommended_service_time_start: orderDetail.recommended_service_time_start || '',
					recommended_service_time_end: orderDetail.recommended_service_time_end || '',

				// 【关键】所有数量、价格、时间字段必须重置为初始值
				// 避免从订单详情中导入任何可能影响价格计算的字段
				distance: 0,
				estimatedPrice: 0.01,
				quantity: '',  // 补宝数量必须重新填写
				badItemQuantity: 0,
				cableQuantity: 0,
				powerQuantity: 0,
				wiringQuantity: 0,
				warehouseQuantity: 0,
				riderTip: 0,  // 打赏金额清零
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
				locationDesc: ''  // 位置描述清空
			}
					
					// 保存到本地存储（添加时间戳确保数据新鲜度）
					const reorderDataWithTimestamp = {
						...formData,
						_timestamp: Date.now(),  // 添加时间戳
						_source: 'order_reorder'  // 标记数据来源
					}
					
				console.log('准备保存的formData:', reorderDataWithTimestamp)
				console.log('地址信息:', {
					address: formData.address,
					detailAddress: formData.detailAddress,
					storeName: formData.storeName,
					province: formData.province,
					city: formData.city,
					district: formData.district
				})
				console.log('【重要】经纬度信息:', {
					longitude: formData.longitude,
					latitude: formData.latitude,
					longitudeType: typeof formData.longitude,
					latitudeType: typeof formData.latitude,
					isValidLongitude: formData.longitude !== 0 && !isNaN(formData.longitude),
					isValidLatitude: formData.latitude !== 0 && !isNaN(formData.latitude)
				})
				uni.setStorageSync('reorderFormData', reorderDataWithTimestamp)
				
				// 同时设置城市信息到本地存储，确保发布页面能正确识别区域
				const cityInfo = orderDetail.city_name && orderDetail.district_name 
					? `${orderDetail.city_name} · ${orderDetail.district_name}` 
					: orderDetail.city_name || '';
				if (cityInfo) {
					uni.setStorageSync('selectedCity', cityInfo)
					uni.setStorageSync('currentCity', cityInfo)
					console.log('设置城市信息:', cityInfo)
				}
				
				// 【关键修复】根据城市和区县名称查找并更新 district_id
				if (orderDetail.city_name && orderDetail.district_name) {
					await this.updateDistrictIdByAddress(orderDetail.city_name, orderDetail.district_name);
				}
				
				uni.hideLoading()
					
					// 跳转到发布页面
					uni.navigateTo({
						url: '/pages/index/publish/index?from=reorder',
						success: () => {
							uni.showToast({
								title: '订单信息已导入',
								icon: 'success'
							})
						}
					})
				} else {
					uni.hideLoading()
					uni.showToast({
						title: res.message || '获取订单详情失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('再来一单失败:', error)
				uni.hideLoading()
				uni.showToast({
					title: '操作失败，请重试',
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		font-family: "HarmonyOS Sans SC", sans-serif;
		padding-bottom: calc(100rpx + constant(safe-area-inset-bottom));
		/* iOS < 11.2 */
		padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
		/* iOS >= 11.2 */
		box-sizing: border-box;
		overflow-x: hidden;
		width: 100%;
	}

	.content {
		padding: 0;
		position: relative;
		background-color: #f5f5f5;
		overflow-x: hidden;
		width: 100%;
	}

	.search-section {
		background-color: #2492F2;
		padding: 0 20rpx 20rpx;
	}

	.title-bar {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 90rpx;

		.title {
			font-size: 34rpx;
			color: #ffffff;
			font-weight: 500;
		}
	}

	.search-bar {
		display: flex;
		justify-content: flex-start;
		padding: 15rpx 0 10rpx;
	}

	.search-condition {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #ffffff;
		background-color: rgba(255, 255, 255, 0.2);
		padding: 8rpx 20rpx;
		border-radius: 30rpx;

		.arrow {
			margin-left: 10rpx;
			font-size: 20rpx;
			transition: transform 0.3s;
		}

		.arrow-up {
			transform: rotate(180deg);
		}
	}

	.search-conditions-dropdown {
		background-color: #ffffff;
		border-radius: 10rpx;
		padding: 20rpx;
		margin-top: 10rpx;
		margin-bottom: 15rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

		.condition-group {
			margin-bottom: 20rpx;

			.condition-title {
				font-size: 28rpx;
				color: #333333;
				margin-bottom: 15rpx;
				font-weight: 500;
			}

			.condition-options {
				display: flex;
				flex-wrap: wrap;

				.condition-option {
					padding: 8rpx 20rpx;
					background-color: #f5f5f5;
					border-radius: 30rpx;
					margin-right: 15rpx;
					margin-bottom: 10rpx;
					font-size: 24rpx;
					color: #666666;

					&.active {
						background-color: #2492F2;
						color: #ffffff;
					}
				}
			}
		}

		.condition-buttons {
			display: flex;
			justify-content: space-between;
			margin-top: 20rpx;

			.reset-btn, .confirm-btn {
				width: 48%;
				height: 70rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				border-radius: 35rpx;
				font-size: 28rpx;
			}

			.reset-btn {
				background-color: #f5f5f5;
				color: #666666;
			}

			.confirm-btn {
				background-color: #2492F2;
				color: #ffffff;
			}
		}
	}

	.search-input-wrapper {
		margin-top: 10rpx;
	}

	.search-input {
		background-color: #ffffff;
		height: 70rpx;
		border-radius: 35rpx;
		display: flex;
		align-items: center;
		padding: 0 30rpx;

		.search-icon {
			color: #AAAAAA;
			font-size: 28rpx;
			margin-right: 10rpx;
		}

		input {
			flex: 1;
			height: 70rpx;
			font-size: 28rpx;
			color: #333333;
		}

		.search-btn {
			margin-left: 10rpx;
			padding: 8rpx 24rpx;
			background-color: #2492F2;
			color: #ffffff;
			border-radius: 30rpx;
			font-size: 26rpx;
			white-space: nowrap;
			transition: all 0.3s;

			&:active {
				opacity: 0.8;
				transform: scale(0.95);
			}
		}
	}

	.tabs {
		display: flex;
		background-color: #ffffff;
		height: 80rpx;
		position: relative;
		padding: 0;
		width: 100%;
		box-sizing: border-box;

		.tab-item {
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 24rpx;
			color: #666666;
			position: relative;
			height: 100%;
			padding: 0;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			&.active {
				color: #2492F2;
				font-weight: 500;
			}
		}

		.tab-line {
			position: absolute;
			bottom: 0;
			width: 60rpx;
			height: 4rpx;
			background-color: #2492F2;
			transform: translateX(-50%);
			transition: left 0.3s ease;
		}
	}

	.order-content {
		padding: 30rpx 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		// min-height: 60vh;
	}

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
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.load-more-container {
		width: 100%;
		padding: 30rpx 0;
		display: flex;
		justify-content: center;
		align-items: center;
		
		.loading-more {
			display: flex;
			align-items: center;
			justify-content: center;
			
			.loading-spinner-small {
				width: 30rpx;
				height: 30rpx;
				border: 2rpx solid #f3f3f3;
				border-top: 2rpx solid #2492F2;
				border-radius: 50%;
				animation: spin 1s linear infinite;
				margin-right: 10rpx;
			}
			
			.loading-more-text {
				font-size: 24rpx;
				color: #999999;
			}
		}
		
		.no-more {
			.no-more-text {
				font-size: 24rpx;
				color: #CCCCCC;
			}
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;

		.empty-image {
			width: 180rpx;
			height: 180rpx;
			margin-bottom: 20rpx;
			opacity: 0.7;
		}

		.empty-text {
			font-size: 28rpx;
			color: #999999;
		}
	}

	.order-list {
		padding: 0 10rpx;
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
		width: 100%;
		box-sizing: border-box;
		overflow-x: hidden;

		.order-item {
			background-color: #ffffff;
			border-radius: 16rpx;
			padding: 20rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
			transition: all 0.3s ease;
			width: 100%;
			max-width: 680rpx;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			align-items: stretch;
			overflow: hidden;

			&:active {
				transform: scale(0.98);
			}
			
			// 已取消和已退款订单的灰色样式
			&.order-item-gray {
				.order-header {
					.order-type {
						color: #999999 !important;
						
						&::before {
							background-color: #CCCCCC !important;
						}
					}
				}
				
				.order-info {
					.info-item {
						.label {
							color: #BBBBBB !important;
						}
						
						.value {
							color: #999999 !important;
							
							&.price {
								color: #999999 !important;
							}
							
							&.reward {
								color: #999999 !important;
							}
						}
					}
				}
			}

			.order-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;
				padding-bottom: 20rpx;
				border-bottom: 1rpx solid #f0f0f0;

				.order-type {
					font-size: 28rpx;
					color: #333333;
					font-weight: 600;
					position: relative;
					padding-left: 20rpx;

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

				.order-status {
					font-size: 24rpx;
					padding: 4rpx 16rpx;
					border-radius: 16rpx;

					&.waiting {
						color: #2492F2;
						background-color: rgba(36, 146, 242, 0.1);
					}

					&.assigned {
						color: #FFA500;
						background-color: rgba(255, 165, 0, 0.1);
					}

					&.finished_timeout {
						color: #FF0000;
						background-color: rgba(255, 0, 0, 0.1);
					}

					&.finished {
						color: #9B59B6;
						background-color: rgba(155, 89, 182, 0.1);
					}

					&.canceled {
						color: #999999;
						background-color: rgba(153, 153, 153, 0.1);
					}

					&.completed {
						color: #2ECC71;
						background-color: rgba(46, 204, 113, 0.1);
					}

					&.refunded {
						color: #999999;
						background-color: rgba(153, 153, 153, 0.1);
					}
				}

				.review-status {
					display: flex;
					flex-direction: column;
					align-items: flex-end;
					gap: 4rpx;

					.stars {
						display: flex;
						align-items: center;
						gap: 2rpx;

						.star {
							font-size: 24rpx;
							color: #E0E0E0;

							&.star-filled {
								color: #FFB800;
							}
						}
					}

					.review-text {
						font-size: 22rpx;
						padding: 2rpx 12rpx;
						border-radius: 12rpx;

						&.reviewed {
							color: #2ECC71;
							background-color: rgba(46, 204, 113, 0.1);
						}

						&.not-reviewed {
							color: #999999;
							background-color: rgba(153, 153, 153, 0.1);
						}
					}
				}
			}

			.order-info {
				.info-item {
					display: flex;
					margin-bottom: 12rpx;
					width: 100%;

					&:last-child {
						margin-bottom: 0;
					}

					.label {
						font-size: 26rpx;
						color: #999999;
						width: 140rpx;
						flex-shrink: 0;
						white-space: nowrap;
					}

					.value {
						font-size: 26rpx;
						color: #333333;
						flex: 1;
						line-height: 1.4;
						word-break: break-all;

						&.price {
							color: #FF6B6B;
							font-weight: 600;
							font-size: 28rpx;
						}

						&.reward {
							color: #FF6B00;
							font-weight: 600;
							font-size: 28rpx;
						}
					}
				}
				
				.price-item {
					position: relative;
					padding-right: 200rpx;
					
					.price-wrapper {
						display: flex;
						align-items: center;
						cursor: pointer;
						
						.arrow-icon {
							width: 32rpx;
							height: 32rpx;
						}
					}
					
					.reorder-btn-float {
						position: absolute;
						right: 95px;
						top: 50%;
						transform: translateY(-50%);
						display: flex;
						align-items: center;
						justify-content: center;
						padding: 10rpx 24rpx;
						background: linear-gradient(135deg, #2492F2 0%, #5CB3FF 100%);
						border-radius: 36rpx;
						box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.25);
						transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
						z-index: 10;
						
						&:active {
							transform: translateY(-50%) scale(0.95);
							box-shadow: 0 2rpx 8rpx rgba(36, 146, 242, 0.2);
						}
						
						.reorder-emoji {
							width: 24rpx;
							height: 24rpx;
							margin-right: 6rpx;
						}
						
						.reorder-text {
							font-size: 24rpx;
							color: #FFFFFF;
							font-weight: 600;
							letter-spacing: 0.5rpx;
							white-space: nowrap;
						}
					}
				}
			}
		}
	}

	.order-page {
		min-height: 100vh;
		background-color: #F5F5F5;
		padding-bottom: calc(100rpx + constant(safe-area-inset-bottom));
		/* iOS < 11.2 */
		padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
		/* iOS >= 11.2 */
		box-sizing: border-box;
	}

	.bottom-placeholder {
		height: calc(100rpx + constant(safe-area-inset-bottom));
		/* iOS < 11.2 */
		height: calc(100rpx + env(safe-area-inset-bottom));
		/* iOS >= 11.2 */
	}
</style>