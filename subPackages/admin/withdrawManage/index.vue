<template>
	<view class="withdraw-manage-container">
		<!-- 顶部导航栏 -->
		<nav-bar title="提现管理" title-align="center" :showBackButton="true"></nav-bar>

		<!-- 导航栏占位元素 -->
		<view class="nav-placeholder" :style="{ height: navBarHeight + 'px' }"></view>

		<!-- 搜索和筛选区域 -->
		<view class="search-filter">
			<view class="search-box">
				<view class="search-icon-wrapper">
					<view class="search-icon"></view>
				</view>
				<input type="text" v-model="searchKeyword" placeholder="输入骑手姓名或手机号搜索" class="search-input"
					@confirm="searchWithdraws" />
				<view class="search-btn" @click="searchWithdraws">搜索</view>
			</view>

			<view class="filter-options">
				<view class="filter-section">
					<view class="filter-title">
						<view class="title-icon status-icon"></view>
						<text>提现状态</text>
					</view>
					<view class="filter-items">
						<view class="filter-item" :class="{ active: currentStatus === status.value }"
							v-for="status in statusOptions" :key="status.value" @click="switchStatus(status.value)">
							{{ status.label }}
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 提现记录列表 -->
		<scroll-view class="withdraw-list" scroll-y>
			<!-- 加载中提示 -->
			<view v-if="loading" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 空状态 -->
			<view v-else-if="withdrawList.length === 0" class="empty-state">
				<view class="empty-icon"></view>
				<text class="empty-text">暂无提现记录</text>
			</view>

			<!-- 提现记录列表内容 -->
			<view v-else class="withdraw-list-content">
				<view class="withdraw-item" v-for="(withdraw, index) in withdrawList" :key="index"
					@click="showWithdrawDetail(withdraw)">
					<view class="withdraw-header">
						<view class="withdraw-info">
							<text
								class="rider-name">{{ withdraw.real_name || (withdraw.applicant && withdraw.applicant.contact_person) || '未知骑手' }}</text>
							<text class="withdraw-time">{{ formatDateTime(withdraw.created_at) }}</text>
						</view>
						<view class="withdraw-status" :class="withdraw.status">
							{{ getStatusText(withdraw.status) }}
						</view>
					</view>

					<view class="withdraw-content">
						<view class="info-row">
							<text class="info-label">提现金额：</text>
							<text class="info-value amount">¥{{ parseFloat(withdraw.amount || 0).toFixed(2) }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">提现方式：</text>
							<text class="info-value">{{ getPaymentMethodText(withdraw.payment_method) }}</text>
						</view>

						<!-- 银行卡信息展示 -->
						<template v-if="withdraw.payment_method === 'bank' && withdraw.withdraw_info && (withdraw.status !== 'completed' || isExpanded(withdraw.id))">
							<view class="bank-info-section">
								<view class="bank-info-title">银行卡信息</view>
								<view class="info-row" v-if="withdraw.withdraw_info.account_holder">
									<text class="info-label">持卡人：</text>
									<text class="info-value">{{ withdraw.withdraw_info.account_holder }}</text>
								</view>
								<view class="info-row" v-if="withdraw.withdraw_info.bank_name">
									<text class="info-label">开户银行：</text>
									<text class="info-value">{{ withdraw.withdraw_info.bank_name }}</text>
									<view class="copy-btn" @click.stop="copyText(withdraw.withdraw_info.bank_name)">
										<view class="copy-icon"></view>
									</view>
								</view>
								<view class="info-row" v-if="withdraw.withdraw_info.bank_branch">
									<text class="info-label">开户支行：</text>
									<text class="info-value">{{ withdraw.withdraw_info.bank_branch }}</text>
									<view class="copy-btn" @click.stop="copyText(withdraw.withdraw_info.bank_branch)">
										<view class="copy-icon"></view>
									</view>
								</view>
								<view class="info-row" v-if="withdraw.withdraw_info.bank_card_number">
									<text class="info-label">银行卡号：</text>
									<text class="info-value bank-card">{{ withdraw.withdraw_info.bank_card_number }}</text>
									<view class="copy-btn" @click.stop="copyText(withdraw.withdraw_info.bank_card_number)">
										<view class="copy-icon"></view>
									</view>
								</view>
								<view class="info-row" v-if="withdraw.withdraw_info.bank_province && withdraw.withdraw_info.bank_city">
									<text class="info-label">开户地区：</text>
									<text class="info-value">{{ withdraw.withdraw_info.bank_province }} {{ withdraw.withdraw_info.bank_city }}</text>
									<view class="copy-btn" @click.stop="copyText(withdraw.withdraw_info.bank_province + ' ' + withdraw.withdraw_info.bank_city)">
										<view class="copy-icon"></view>
									</view>
								</view>
								<view class="info-row" v-if="withdraw.withdraw_info.bank_reserved_phone">
									<text class="info-label">预留手机：</text>
									<text class="info-value">{{ withdraw.withdraw_info.bank_reserved_phone }}</text>
								</view>
							</view>
						</template>

						<!-- 支付宝信息展示 -->
						<template v-if="withdraw.payment_method === 'alipay' && withdraw.withdraw_info && withdraw.withdraw_info.alipay_id && (withdraw.status !== 'completed' || isExpanded(withdraw.id))">
							<view class="payment-info-section">
								<view class="payment-info-title">支付宝信息</view>
								<view class="info-row">
									<text class="info-label">支付宝账号：</text>
									<text class="info-value">{{ withdraw.withdraw_info.alipay_id }}</text>
									<view class="copy-btn" @click.stop="copyText(withdraw.withdraw_info.alipay_id)">
										<view class="copy-icon"></view>
									</view>
								</view>
								<view class="info-row" v-if="withdraw.withdraw_info.real_name">
									<text class="info-label">真实姓名：</text>
									<text class="info-value">{{ withdraw.withdraw_info.real_name }}</text>
								</view>
							</view>
						</template>

						<view class="info-row" v-if="withdraw.phone">
							<text class="info-label">联系电话：</text>
							<text class="info-value">{{ withdraw.phone }}</text>
						</view>
						<view class="info-row" v-if="withdraw.owner_type">
							<text class="info-label">申请类型：</text>
							<text class="info-value">{{ getOwnerTypeText(withdraw.owner_type) }}</text>
						</view>

						<!-- 已完成状态的展开/收起按钮 -->
						<view v-if="withdraw.status === 'completed' && hasWithdrawInfo(withdraw)" class="expand-toggle" @click.stop="toggleExpand(withdraw.id)">
							<text class="expand-text">{{ isExpanded(withdraw.id) ? '收起详细信息' : '展开详细信息' }}</text>
							<view class="expand-icon" :class="{ 'expanded': isExpanded(withdraw.id) }">
								<view class="arrow-down"></view>
							</view>
						</view>
					</view>

					<!-- 操作按钮 -->
					<view class="action-buttons"
						v-if="withdraw.status === 'pending' || withdraw.status === 'processing'">
						<!-- 待审核状态的按钮 -->
						<template v-if="withdraw.status === 'pending'">
							<view class="action-btn reject" @click.stop="showRejectModal(withdraw)">拒绝</view>
							<view class="action-btn approve" @click.stop="approveWithdraw(withdraw)">同意</view>
						</template>

						<!-- 待打款状态的按钮 -->
						<template v-if="withdraw.status === 'processing'">
							<view class="action-btn complete" @click.stop="showCompleteModal(withdraw)">已打款</view>
						</template>
					</view>
				</view>
			</view>


		</scroll-view>

		<!-- 拒绝弹窗 -->
		<view class="modal-mask" v-if="showReject" @click="closeRejectModal"></view>
		<view class="modal-container" v-if="showReject">
			<view class="modal-header">
				<text class="modal-title">拒绝提现</text>
				<view class="modal-close" @click="closeRejectModal">×</view>
			</view>
			<view class="modal-content">
				<view class="input-group">
					<text class="input-label">拒绝原因</text>
					<textarea v-model="rejectReason" placeholder="请输入拒绝原因" class="textarea-field"></textarea>
				</view>
			</view>
			<view class="modal-footer">
				<view class="modal-btn cancel" @click="closeRejectModal">取消</view>
				<view class="modal-btn confirm" :class="{disabled: processing}" @click="!processing && confirmReject()">
					<text v-if="processing">处理中...</text>
					<text v-else>确认拒绝</text>
				</view>
			</view>
		</view>

		<!-- 已打款弹窗 -->
		<view class="modal-mask" v-if="showComplete" @click="closeCompleteModal"></view>
		<view class="modal-container" v-if="showComplete">
			<view class="modal-header">
				<text class="modal-title">确认已打款</text>
				<view class="modal-close" @click="closeCompleteModal">×</view>
			</view>
			<view class="modal-content">
				<view class="modal-info">
					<view class="info-row">
						<text class="info-label">申请人：</text>
						<text class="info-value">{{ currentWithdraw.real_name || '未知' }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">提现金额：</text>
						<text class="info-value">¥{{ parseFloat(currentWithdraw.amount || 0).toFixed(2) }}</text>
					</view>
				</view>
				<view class="input-group">
					<text class="input-label">转账记录号（选填）</text>
					<input v-model="transactionNo" placeholder="请输入转账记录号" class="input-field" />
				</view>
			</view>
			<view class="modal-footer">
				<view class="modal-btn cancel" @click="closeCompleteModal">取消</view>
				<view class="modal-btn confirm" :class="{disabled: processing}"
					@click="!processing && confirmComplete()">
					<text v-if="processing">处理中...</text>
					<text v-else>确认已打款</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import md5 from 'md5'

	export default {
		data() {
			return {
				navBarHeight: 0,
				searchKeyword: '',
				currentStatus: 'all',
				statusOptions: [{
						label: '全部',
						value: 'all'
					},
					{
						label: '待审核',
						value: 'pending'
					},
					{
						label: '待打款',
						value: 'processing'
					},
					{
						label: '已完成',
						value: 'completed'
					}
				],
				withdrawList: [],
				loading: false,
				page: 1,
				pageSize: 50, // 增加每页数量，一次性加载更多数据
				riderUserInfo: null,
				// 弹窗相关
				showReject: false,
				showComplete: false,
				currentWithdraw: {},
				rejectReason: '',
				transactionNo: '',
				processing: false,
				// 展开状态管理
				expandedItems: new Set() // 使用Set来存储展开的项目ID
			}
		},
		onShow() {
			// 计算导航栏高度
			const systemInfo = uni.getSystemInfoSync();
			const statusBarHeight = systemInfo.statusBarHeight || 0;
			const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48;
			this.navBarHeight = statusBarHeight + navBarHeight;

			// 获取用户信息
			this.riderUserInfo = uni.getStorageSync('riderUserInfo');

			// 加载提现记录列表
			this.getWithdrawList();
		},
		methods: {
			// 获取提现记录列表
			async getWithdrawList() {
				if (this.loading) return;

				this.loading = true;

				try {
					// 获取用户信息
					if (!this.riderUserInfo || !this.riderUserInfo.id) {
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						});
						return;
					}

					const timestamp = Math.floor(Date.now() / 1000);
					const params = {
						service_member_id: this.riderUserInfo.id,
						sign: "chongchong",
						timestamp: timestamp,
						page: this.page,
						per_page: this.pageSize
					};

					// 添加搜索条件
					if (this.searchKeyword) {
						params.keyword = this.searchKeyword;
					}

					// 添加状态筛选 - 支持 pending, processing, completed
					if (this.currentStatus !== 'all') {
						params.status = this.currentStatus;
					}

					const res = await this.$request('withdraw/group/list', params, 'POST');

					if (res.status === 'success') {
						const responseData = res.data || {};
						const newList = responseData.data || [];

						// 直接替换列表数据
						this.withdrawList = newList;
					} else {
						uni.showToast({
							title: res.msg || '获取提现记录失败',
							icon: 'none'
						});
					}
				} catch (err) {
					console.error('获取提现记录失败:', err);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			},

			// 搜索提现记录
			searchWithdraws() {
				this.page = 1;
				this.withdrawList = [];
				this.getWithdrawList();
			},

			// 切换状态筛选
			switchStatus(status) {
				if (this.currentStatus === status) return;

				this.currentStatus = status;
				this.page = 1;
				this.withdrawList = [];
				this.getWithdrawList();
			},





			// 显示提现详情
			showWithdrawDetail(withdraw) {
				// 跳转到提现详情页面
				// uni.navigateTo({
				// 	url: `/adminEnd/withdrawManage/detail?id=${withdraw.id}`
				// });
			},

			// 获取状态文本
			getStatusText(status) {
				const statusMap = {
					'pending': '待审核',
					'processing': '待打款',
					'completed': '已完成',
					'approved': '已通过',
					'rejected': '已拒绝'
				};
				return statusMap[status] || '未知状态';
			},

			// 获取支付方式文本
			getPaymentMethodText(method) {
				const methodMap = {
					'alipay': '支付宝',
					'bank': '银行卡',
					'wechat': '微信'
				};
				return methodMap[method] || '未知方式';
			},

			// 获取申请类型文本
			getOwnerTypeText(ownerType) {
				if (ownerType === 'App\\Models\\ServiceMember') {
					return '骑手';
				} else if (ownerType === 'App\\Models\\ServiceProvider') {
					return '服务商';
				}
				return '未知类型';
			},

			// 格式化日期时间
			formatDateTime(dateTime) {
				if (!dateTime) return '未设置';
				try {
					if (typeof dateTime === 'number') {
						return new Date(dateTime * 1000).toLocaleString('zh-CN');
					}
					const date = new Date(dateTime);
					if (isNaN(date.getTime())) {
						return dateTime;
					}
					return date.toLocaleString('zh-CN');
				} catch (err) {
					console.error('格式化日期时间失败:', err);
					return dateTime;
				}
			},

			// 复制文本到剪贴板
			copyText(text) {
				if (!text) {
					uni.showToast({
						title: '复制内容为空',
						icon: 'none'
					});
					return;
				}

				uni.setClipboardData({
					data: text.toString(),
					success: () => {
						uni.showToast({
							title: '复制成功',
							icon: 'success',
							duration: 1500
						});
					},
					fail: () => {
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			},

			// 切换展开状态
			toggleExpand(withdrawId) {
				if (this.expandedItems.has(withdrawId)) {
					this.expandedItems.delete(withdrawId);
				} else {
					this.expandedItems.add(withdrawId);
				}
				// 触发响应式更新
				this.$forceUpdate();
			},

			// 检查是否展开
			isExpanded(withdrawId) {
				return this.expandedItems.has(withdrawId);
			},

			// 检查是否有提现信息
			hasWithdrawInfo(withdraw) {
				if (!withdraw.withdraw_info) {
					return false;
				}

				// 检查银行卡信息
				if (withdraw.payment_method === 'bank') {
					return !!(withdraw.withdraw_info.account_holder ||
							withdraw.withdraw_info.bank_name ||
							withdraw.withdraw_info.bank_branch ||
							withdraw.withdraw_info.bank_card_number ||
							withdraw.withdraw_info.bank_province ||
							withdraw.withdraw_info.bank_city ||
							withdraw.withdraw_info.bank_reserved_phone);
				}

				// 检查支付宝信息
				if (withdraw.payment_method === 'alipay') {
					return !!(withdraw.withdraw_info.alipay_id ||
							withdraw.withdraw_info.real_name);
				}

				return false;
			},



			// 同意提现
			async approveWithdraw(withdraw) {
				uni.showModal({
					title: '确认操作',
					content: `确定要同意 ${withdraw.real_name || '该用户'} 的提现申请吗？`,
					success: async (res) => {
						if (res.confirm) {
							await this.processWithdraw(withdraw.id, 'approve');
						}
					}
				});
			},

			// 显示拒绝弹窗
			showRejectModal(withdraw) {
				this.currentWithdraw = withdraw;
				this.showReject = true;
				this.rejectReason = '';
			},

			// 关闭拒绝弹窗
			closeRejectModal() {
				this.showReject = false;
				this.currentWithdraw = {};
				this.rejectReason = '';
			},

			// 确认拒绝
			async confirmReject() {
				if (!this.rejectReason.trim()) {
					uni.showToast({
						title: '请输入拒绝原因',
						icon: 'none'
					});
					return;
				}

				await this.processWithdraw(this.currentWithdraw.id, 'reject', this.rejectReason);
				this.closeRejectModal();
			},

			// 显示已打款弹窗
			showCompleteModal(withdraw) {
				this.currentWithdraw = withdraw;
				this.showComplete = true;
				this.transactionNo = '';
			},

			// 关闭已打款弹窗
			closeCompleteModal() {
				this.showComplete = false;
				this.currentWithdraw = {};
				this.transactionNo = '';
			},

			// 确认已打款
			async confirmComplete() {
				await this.completeWithdraw(this.currentWithdraw.id, this.transactionNo);
				this.closeCompleteModal();
			},

			// 处理提现申请（审核）
			async processWithdraw(id, action, reason = '') {
				this.processing = true;

				try {
					const params = {
						id: id,
						service_member_id: this.riderUserInfo.id,
						action: action, // 'approve' 或 'reject'
						sign: "chongchong",
						timestamp: Math.floor(Date.now() / 1000)
					};

					if (reason) {
						params.reason = reason;
					}

					const res = await this.$request('withdraw/process', params, 'POST');

					if (res.status === 'success') {
						uni.showToast({
							title: action === 'approve' ? '审核通过' : '已拒绝',
							icon: 'success'
						});

						// 重新加载列表
						this.getWithdrawList();
					} else {
						uni.showToast({
							title: res.msg || '操作失败',
							icon: 'none'
						});
					}
				} catch (err) {
					console.error('处理提现申请失败:', err);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				} finally {
					this.processing = false;
				}
			},

			// 完成提现（已打款）
			async completeWithdraw(id, transactionNo = '') {
				this.processing = true;

				try {
					const params = {
						id: id,
						service_member_id: this.riderUserInfo.id,
						sign: "chongchong",
						timestamp: Math.floor(Date.now() / 1000)
					};

					if (transactionNo) {
						params.transaction_no = transactionNo;
					}

					const res = await this.$request('withdraw/complete', params, 'POST');

					if (res.status === 'success') {
						uni.showToast({
							title: '已标记为已打款',
							icon: 'success'
						});

						// 重新加载列表
						this.getWithdrawList();
					} else {
						uni.showToast({
							title: res.msg || '操作失败',
							icon: 'none'
						});
					}
				} catch (err) {
					console.error('完成提现失败:', err);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				} finally {
					this.processing = false;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.withdraw-manage-container {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.nav-placeholder {
		background-color: #fff;
	}

	// 搜索和筛选区域
	.search-filter {
		background-color: #fff;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.search-box {
		display: flex;
		align-items: center;
		background-color: #f8f9fa;
		border-radius: 25rpx;
		padding: 0 20rpx;
		margin-bottom: 20rpx;
	}

	.search-icon-wrapper {
		margin-right: 10rpx;
	}

	.search-icon {
		width: 30rpx;
		height: 30rpx;
		background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTExIDJDMTUuOTcwNiAyIDIwIDYuMDI5NDQgMjAgMTFDMjAgMTUuOTcwNiAxNS45NzA2IDIwIDExIDIwQzYuMDI5NDQgMjAgMiAxNS45NzA2IDIgMTFDMiA2LjAyOTQ0IDYuMDI5NDQgMiAxMSAyWiIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTIxIDIxTDE2LjY1IDE2LjY1IiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=');
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
	}

	.search-input {
		flex: 1;
		height: 70rpx;
		font-size: 28rpx;
		color: #333;
		background: transparent;
		border: none;
		outline: none;
	}

	.search-btn {
		background-color: #2492F2;
		color: #fff;
		padding: 12rpx 24rpx;
		border-radius: 20rpx;
		font-size: 26rpx;
		margin-left: 10rpx;
	}

	// 筛选选项
	.filter-options {
		.filter-section {
			.filter-title {
				display: flex;
				align-items: center;
				margin-bottom: 16rpx;

				.title-icon {
					width: 24rpx;
					height: 24rpx;
					margin-right: 8rpx;

					&.status-icon {
						background-color: #2492F2;
						border-radius: 50%;
					}
				}

				text {
					font-size: 28rpx;
					color: #333;
					font-weight: 500;
				}
			}

			.filter-items {
				display: flex;
				flex-wrap: wrap;
				gap: 16rpx;

				.filter-item {
					padding: 12rpx 24rpx;
					background-color: #f8f9fa;
					border-radius: 20rpx;
					font-size: 26rpx;
					color: #666;
					border: 1rpx solid transparent;
					transition: all 0.3s ease;

					&.active {
						background-color: rgba(36, 146, 242, 0.1);
						color: #2492F2;
						border-color: #2492F2;
					}
				}
			}
		}
	}

	// 提现记录列表
	.withdraw-list {
		flex: 1;
		padding: 0 20rpx 20rpx 20rpx;
		box-sizing: border-box;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 0;

		.loading-spinner {
			width: 60rpx;
			height: 60rpx;
			border: 4rpx solid #f3f3f3;
			border-top: 4rpx solid #2492F2;
			border-radius: 50%;
			animation: spin 1s linear infinite;
			margin-bottom: 20rpx;
		}

		.loading-text {
			font-size: 26rpx;
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

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 0;

		.empty-icon {
			width: 120rpx;
			height: 120rpx;
			background-color: #f0f0f0;
			border-radius: 50%;
			margin-bottom: 30rpx;
			position: relative;

			&::before {
				content: '💰';
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				font-size: 60rpx;
			}
		}

		.empty-text {
			font-size: 28rpx;
			color: #999;
		}
	}

	// 提现记录项
	.withdraw-item {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
		width: 100%;
		box-sizing: border-box;
		overflow: hidden;

		&:active {
			transform: scale(0.98);
			opacity: 0.9;
		}
	}

	.withdraw-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20rpx;
		width: 100%;

		.withdraw-info {
			flex: 1;
			min-width: 0; // 允许flex项目收缩
			margin-right: 20rpx;

			.rider-name {
				font-size: 32rpx;
				color: #333;
				font-weight: 500;
				display: block;
				margin-bottom: 8rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.withdraw-time {
				font-size: 24rpx;
				color: #999;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		.withdraw-status {
			padding: 8rpx 16rpx;
			border-radius: 16rpx;
			font-size: 24rpx;
			font-weight: 500;
			flex-shrink: 0; // 防止状态标签被压缩
			white-space: nowrap;

			&.pending {
				background-color: rgba(255, 193, 7, 0.1);
				color: #ffc107;
			}

			&.processing {
				background-color: rgba(36, 146, 242, 0.1);
				color: #2492F2;
			}

			&.completed {
				background-color: rgba(40, 167, 69, 0.1);
				color: #28a745;
			}

			&.approved {
				background-color: rgba(40, 167, 69, 0.1);
				color: #28a745;
			}

			&.rejected {
				background-color: rgba(220, 53, 69, 0.1);
				color: #dc3545;
			}
		}
	}

	.withdraw-content {
		width: 100%;

		// 展开/收起按钮
		.expand-toggle {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 16rpx 0;
			margin: 16rpx 0;
			background-color: #f8f9fa;
			border-radius: 8rpx;
			border: 1rpx solid #e9ecef;
			transition: all 0.3s ease;

			&:active {
				background-color: #e9ecef;
				transform: scale(0.98);
			}

			.expand-text {
				font-size: 24rpx;
				color: #2492F2;
				margin-right: 8rpx;
			}

			.expand-icon {
				width: 24rpx;
				height: 24rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: transform 0.3s ease;

				&.expanded {
					transform: rotate(180deg);
				}

				.arrow-down {
					width: 0;
					height: 0;
					border-left: 6rpx solid transparent;
					border-right: 6rpx solid transparent;
					border-top: 8rpx solid #2492F2;
				}
			}
		}

		.info-row {
			display: flex;
			align-items: center;
			margin-bottom: 12rpx;
			width: 100%;
			position: relative;

			&:last-child {
				margin-bottom: 0;
			}

			.info-label {
				font-size: 26rpx;
				color: #666;
				margin-right: 16rpx;
				min-width: 140rpx;
				flex-shrink: 0;
			}

			.info-value {
				font-size: 26rpx;
				color: #333;
				flex: 1;
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				margin-right: 8rpx;

				&.amount {
					font-size: 30rpx;
					font-weight: 500;
					color: #2492F2;
				}

				&.bank-card {
					font-family: 'Courier New', monospace;
					letter-spacing: 1rpx;
					color: #2492F2;
					font-weight: 500;
				}
			}

			.copy-btn {
				width: 40rpx;
				height: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: rgba(36, 146, 242, 0.1);
				border-radius: 8rpx;
				flex-shrink: 0;
				transition: all 0.3s ease;

				&:active {
					background-color: rgba(36, 146, 242, 0.2);
					transform: scale(0.95);
				}

				.copy-icon {
					width: 24rpx;
					height: 24rpx;
					background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDlIMTFDOS44OTU0MyA5IDkgOS44OTU0MyA5IDExVjIwQzkgMjEuMTA0NiA5Ljg5NTQzIDIyIDExIDIySDIwQzIxLjEwNDYgMjIgMjIgMjEuMTA0NiAyMiAyMFYxMUMyMiA5Ljg5NTQzIDIxLjEwNDYgOSAyMCA5WiIgc3Ryb2tlPSIjMjQ5MkYyIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNNSAxNUg0QzMuNDY5NTcgMTUgMi45NjA4NiAxNC43ODkzIDIuNTg1NzkgMTQuNDE0MkMyLjIxMDcxIDE0LjAzOTEgMiAxMy41MzA0IDIgMTNWNEMyIDMuNDY5NTcgMi4yMTA3MSAyLjk2MDg2IDIuNTg1NzkgMi41ODU3OUMyLjk2MDg2IDIuMjEwNzEgMy40Njk1NyAyIDQgMkgxM0MxMy41MzA0IDIgMTQuMDM5MSAyLjIxMDcxIDE0LjQxNDIgMi41ODU3OUMxNC43ODkzIDIuOTYwODYgMTUgMy40Njk1NyAxNSA0VjUiIHN0cm9rZT0iIzI0OTJGMiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+');
					background-size: contain;
					background-repeat: no-repeat;
					background-position: center;
				}
			}
		}

		// 银行卡信息区域
		.bank-info-section {
			background-color: #f8f9fa;
			border-radius: 8rpx;
			padding: 20rpx;
			margin: 16rpx 0;
			border-left: 4rpx solid #2492F2;

			.bank-info-title {
				font-size: 28rpx;
				color: #2492F2;
				font-weight: 500;
				margin-bottom: 16rpx;
				display: flex;
				align-items: center;

				&::before {
					content: '🏦';
					margin-right: 8rpx;
				}
			}

			.info-row {
				margin-bottom: 10rpx;
				display: flex;
				align-items: center;
				position: relative;

				.info-label {
					min-width: 120rpx;
					font-size: 24rpx;
					margin-right: 16rpx;
					flex-shrink: 0;
				}

				.info-value {
					font-size: 24rpx;
					flex: 1;
					margin-right: 8rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.copy-btn {
					width: 36rpx;
					height: 36rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: rgba(36, 146, 242, 0.15);
					border-radius: 6rpx;
					flex-shrink: 0;
					transition: all 0.3s ease;

					&:active {
						background-color: rgba(36, 146, 242, 0.25);
						transform: scale(0.95);
					}

					.copy-icon {
						width: 20rpx;
						height: 20rpx;
						background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDlIMTFDOS44OTU0MyA5IDkgOS44OTU0MyA5IDExVjIwQzkgMjEuMTA0NiA5Ljg5NTQzIDIyIDExIDIySDIwQzIxLjEwNDYgMjIgMjIgMjEuMTA0NiAyMiAyMFYxMUMyMiA5Ljg5NTQzIDIxLjEwNDYgOSAyMCA5WiIgc3Ryb2tlPSIjMjQ5MkYyIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNNSAxNUg0QzMuNDY5NTcgMTUgMi45NjA4NiAxNC43ODkzIDIuNTg1NzkgMTQuNDE0MkMyLjIxMDcxIDE0LjAzOTEgMiAxMy41MzA0IDIgMTNWNEMyIDMuNDY5NTcgMi4yMTA3MSAyLjk2MDg2IDIuNTg1NzkgMi41ODU3OUMyLjk2MDg2IDIuMjEwNzEgMy40Njk1NyAyIDQgMkgxM0MxMy41MzA0IDIgMTQuMDM5MSAyLjIxMDcxIDE0LjQxNDIgMi41ODU3OUMxNC43ODkzIDIuOTYwODYgMTUgMy40Njk1NyAxNSA0VjUiIHN0cm9rZT0iIzI0OTJGMiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+');
						background-size: contain;
						background-repeat: no-repeat;
						background-position: center;
					}
				}
			}
		}

		// 支付宝信息区域
		.payment-info-section {
			background-color: #f0f8ff;
			border-radius: 8rpx;
			padding: 20rpx;
			margin: 16rpx 0;
			border-left: 4rpx solid #1890ff;

			.payment-info-title {
				font-size: 28rpx;
				color: #1890ff;
				font-weight: 500;
				margin-bottom: 16rpx;
				display: flex;
				align-items: center;

				&::before {
					content: '💰';
					margin-right: 8rpx;
				}
			}

			.info-row {
				margin-bottom: 10rpx;
				display: flex;
				align-items: center;
				position: relative;

				.info-label {
					min-width: 120rpx;
					font-size: 24rpx;
					margin-right: 16rpx;
					flex-shrink: 0;
				}

				.info-value {
					font-size: 24rpx;
					flex: 1;
					margin-right: 8rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.copy-btn {
					width: 36rpx;
					height: 36rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: rgba(24, 144, 255, 0.15);
					border-radius: 6rpx;
					flex-shrink: 0;
					transition: all 0.3s ease;

					&:active {
						background-color: rgba(24, 144, 255, 0.25);
						transform: scale(0.95);
					}

					.copy-icon {
						width: 20rpx;
						height: 20rpx;
						background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDlIMTFDOS44OTU0MyA5IDkgOS44OTU0MyA5IDExVjIwQzkgMjEuMTA0NiA5Ljg5NTQzIDIyIDExIDIySDIwQzIxLjEwNDYgMjIgMjIgMjEuMTA0NiAyMiAyMFYxMUMyMiA5Ljg5NTQzIDIxLjEwNDYgOSAyMCA5WiIgc3Ryb2tlPSIjMTg5MGZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNNSAxNUg0QzMuNDY5NTcgMTUgMi45NjA4NiAxNC43ODkzIDIuNTg1NzkgMTQuNDE0MkMyLjIxMDcxIDE0LjAzOTEgMiAxMy41MzA0IDIgMTNWNEMyIDMuNDY5NTcgMi4yMTA3MSAyLjk2MDg2IDIuNTg1NzkgMi41ODU3OUMyLjk2MDg2IDIuMjEwNzEgMy40Njk1NyAyIDQgMkgxM0MxMy41MzA0IDIgMTQuMDM5MSAyLjIxMDcxIDE0LjQxNDIgMi41ODU3OUMxNC43ODkzIDIuOTYwODYgMTUgMy40Njk1NyAxNSA0VjUiIHN0cm9rZT0iIzE4OTBmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+');
						background-size: contain;
						background-repeat: no-repeat;
						background-position: center;
					}
				}
			}
		}
	}

	// 操作按钮
	.action-buttons {
		display: flex;
		justify-content: space-between;
		margin-top: 20rpx;
		gap: 20rpx;
	}

	.action-btn {
		flex: 1;
		height: 60rpx;
		line-height: 60rpx;
		text-align: center;
		border-radius: 30rpx;
		font-size: 24rpx;
		transition: all 0.3s ease;

		&.reject {
			background-color: #fff;
			color: #dc3545;
			border: 1rpx solid #dc3545;

			&:active {
				background-color: #dc3545;
				color: #fff;
			}
		}

		&.approve {
			background-color: #2492F2;
			color: #fff;
			border: 1rpx solid #2492F2;

			&:active {
				background-color: #1976d2;
			}
		}

		&.complete {
			background-color: #28a745;
			color: #fff;
			border: 1rpx solid #28a745;

			&:active {
				background-color: #218838;
			}
		}
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
		width: 600rpx;
		background-color: #fff;
		border-radius: 12rpx;
		z-index: 1000;

		.modal-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx;
			border-bottom: 1rpx solid #f0f0f0;

			.modal-title {
				font-size: 32rpx;
				color: #333;
				font-weight: 500;
			}

			.modal-close {
				width: 40rpx;
				height: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 36rpx;
				color: #999;
			}
		}

		.modal-content {
			padding: 30rpx;

			.modal-info {
				margin-bottom: 20rpx;

				.info-row {
					display: flex;
					align-items: center;
					margin-bottom: 12rpx;

					.info-label {
						font-size: 28rpx;
						color: #666;
						margin-right: 16rpx;
						min-width: 140rpx;
					}

					.info-value {
						font-size: 28rpx;
						color: #333;
						flex: 1;
					}
				}
			}

			.input-group {
				margin-bottom: 20rpx;

				.input-label {
					font-size: 28rpx;
					color: #333;
					margin-bottom: 12rpx;
					display: block;
				}

				.input-field {
					width: 100%;
					height: 70rpx;
					padding: 0 20rpx;
					border: 1rpx solid #e0e0e0;
					border-radius: 8rpx;
					font-size: 28rpx;
					color: #333;
					background-color: #fff;
					box-sizing: border-box;
				}

				.textarea-field {
					width: 100%;
					min-height: 120rpx;
					padding: 20rpx;
					border: 1rpx solid #e0e0e0;
					border-radius: 8rpx;
					font-size: 28rpx;
					color: #333;
					background-color: #fff;
					box-sizing: border-box;
					resize: none;
				}
			}
		}

		.modal-footer {
			display: flex;
			border-top: 1rpx solid #f0f0f0;

			.modal-btn {
				flex: 1;
				height: 80rpx;
				line-height: 80rpx;
				text-align: center;
				font-size: 28rpx;

				&.cancel {
					color: #666;
					border-right: 1rpx solid #f0f0f0;
				}

				&.confirm {
					color: #2492F2;
					font-weight: 500;

					&.disabled {
						color: #ccc;
					}
				}
			}
		}
	}
</style>