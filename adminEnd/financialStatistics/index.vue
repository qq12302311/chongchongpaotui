<template>
	<view class="financial-statistics-container">
		<!-- 顶部导航栏 -->
		<nav-bar title="财务统计" title-align="center" :showBackButton="true"></nav-bar>

		<!-- 导航栏占位元素 -->
		<view class="nav-placeholder" :style="{ height: navBarHeight + 'px' }"></view>

		<!-- 加载状态 -->
		<view v-if="loading" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>

		<scroll-view v-else scroll-y class="statistics-content">
			<!-- 月份筛选区域 -->
			<view class="month-filter-section">
				<view class="month-nav">
					<view class="month-arrow" @click="prevMonth">‹</view>
					<picker mode="date" fields="month" :value="monthPickerValue" :end="currentMonthValue" @change="handleMonthChange">
						<view class="month-display">
							<text v-if="viewAll" class="month-text all-time">全部时间</text>
							<text v-else class="month-text">{{ selectedYear }}年{{ selectedMonth }}月</text>
						</view>
					</picker>
					<view class="month-arrow" @click="nextMonth">›</view>
				</view>
				<view class="all-time-btn" :class="{ active: viewAll }" @click="toggleViewAll">全部</view>
			</view>

			<view class="range-summary">
				<text class="range-label">{{ viewAll ? '默认显示总数据' : '当前筛选：自然整月' }}</text>
				<text class="range-value">{{ currentRangeText }}</text>
			</view>

			<!-- KPI卡片 -->
			<view class="kpi-grid">
				<!-- GMV -->
				<view class="kpi-card blue">
					<view class="kpi-label">GMV</view>
					<view class="kpi-value">¥{{ stats.gmv }}</view>
					<view class="kpi-desc">总成交额</view>
				</view>

				<!-- 退单额 -->
				<view class="kpi-card red">
					<view class="kpi-label">退单额</view>
					<view class="kpi-value">¥{{ stats.refund }}</view>
					<view class="kpi-desc">已退款金额</view>
				</view>

				<!-- 利润额 -->
				<view class="kpi-card green">
					<view class="kpi-label">利润额</view>
					<view class="kpi-value">¥{{ stats.profit }}</view>
					<view class="kpi-desc">GMV−退款−骑手已提</view>
				</view>

				<!-- 骑手分账 -->
				<view class="kpi-card cyan">
					<view class="kpi-label">骑手分账</view>
					<view class="kpi-value">¥{{ stats.riderShare }}</view>
					<view class="kpi-desc">骑手账本净分账金额</view>
				</view>

				<!-- 骑手已提 -->
				<view class="kpi-card teal">
					<view class="kpi-label">骑手已提</view>
					<view class="kpi-value">¥{{ stats.riderWithdrawn }}</view>
					<view class="kpi-desc">已完成提现</view>
				</view>

				<!-- 骑手待提 -->
				<view class="kpi-card orange">
					<view class="kpi-label">骑手待提</view>
					<view class="kpi-value">¥{{ stats.riderPending }}</view>
					<view class="kpi-desc">待审核+打款中</view>
				</view>

				<!-- 骑手押金 -->
				<view class="kpi-card purple">
					<view class="kpi-label">骑手押金</view>
					<view class="kpi-value">¥{{ stats.riderDeposit }}</view>
					<view class="kpi-desc">当前押金总额</view>
				</view>
			</view>

			<!-- 刷新按钮 -->
			<view class="refresh-btn" @click="refreshData">
				<text class="refresh-icon">↻</text>
				<text>刷新数据</text>
			</view>

			<!-- 打款审核 -->
			<view class="audit-section">
				<view class="section-header">
					<text class="section-title">打款审核</text>
					<text class="section-sub">骑手账户时间轴</text>
				</view>

				<!-- 骑手搜索 -->
				<view class="rider-search-box">
					<input
						class="rider-search-input"
						v-model="searchPhone"
						placeholder="输入骑手手机号查询"
						type="number"
						@confirm="searchRider"
					/>
					<view class="rider-search-btn" @click="searchRider">
						<text>查询</text>
					</view>
				</view>

				<!-- 骑手信息展示 -->
				<view v-if="riderInfo" class="rider-info-card">
					<view class="rider-info-row">
						<text class="rider-name">{{ getRiderName(riderInfo) }}</text>
						<text class="rider-phone">{{ getRiderPhone(riderInfo) }}</text>
					</view>
					<view class="rider-balance-row">
						<view class="balance-item">
							<text class="balance-label">当前余额</text>
							<text class="balance-value">¥{{ formatAmount(riderInfo.balance) }}</text>
						</view>
						<view class="balance-item">
							<text class="balance-label">累计收入</text>
							<text class="balance-value">¥{{ formatAmount(riderInfo.total_commission || riderInfo.total_commission_amount) }}</text>
						</view>
						<view class="balance-item">
							<text class="balance-label">押金</text>
							<text class="balance-value">¥{{ formatAmount(riderInfo.actual_deposit || riderInfo.deposit) }}</text>
						</view>
					</view>
				</view>

				<!-- 时间轴加载 -->
				<view v-if="timelineLoading" class="timeline-loading">
					<view class="loading-spinner small"></view>
					<text>加载记录中...</text>
				</view>

				<!-- 时间轴无数据 -->
				<view v-else-if="riderInfo && timelineList.length === 0" class="timeline-empty">
					<text>暂无交易记录</text>
				</view>

				<!-- 时间轴列表 -->
				<view v-else-if="timelineList.length > 0" class="timeline">
					<view
						v-for="(item, index) in timelineList"
						:key="index"
						class="timeline-item"
					>
						<!-- 时间轴左侧线条和节点 -->
						<view class="timeline-left">
							<view class="timeline-dot" :class="item.type === 'withdraw' ? 'dot-red' : 'dot-green'"></view>
							<view v-if="index < timelineList.length - 1" class="timeline-line"></view>
						</view>

						<!-- 时间轴右侧内容 -->
						<view class="timeline-right">
							<view class="timeline-header">
								<text class="timeline-date">{{ formatTimelineDate(item.created_at) }}</text>
								<view class="timeline-badge" :class="item.type === 'withdraw' ? 'badge-out' : 'badge-in'">
									{{ item.type === 'withdraw' ? '提现' : '入账' }}
								</view>
							</view>

						<!-- 订单记录 -->
						<view v-if="item.type === 'order'" class="timeline-body order-body">
							<view class="order-info-row">
								<text class="order-city">{{ item.city || '未知城市' }}</text>
								<text class="order-no">订单 {{ item.order_no || '-' }}</text>
							</view>
							<view class="amount-row">
								<text class="amount-in">+¥{{ formatAmount(item.amount) }}</text>
							</view>
						</view>

							<!-- 提现记录 -->
							<view v-else class="timeline-body withdraw-body">
								<view class="order-info-row">
									<text class="withdraw-label">提现申请</text>
									<text v-if="item.status === 'completed'" class="status-tag completed">已到账</text>
									<text v-else-if="item.status === 'processing'" class="status-tag processing">打款中</text>
									<text v-else class="status-tag pending">待审核</text>
								</view>
								<view class="amount-row">
									<text class="amount-out">-¥{{ formatAmount(item.amount) }}</text>
								</view>
							</view>

							<!-- 账户余额 -->
							<view class="balance-after">
								<text class="balance-after-label">账户余额：</text>
								<text class="balance-after-value">¥{{ formatAmount(item.balance_after) }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 未搜索提示 -->
				<view v-else class="timeline-placeholder">
					<text class="placeholder-icon">🔍</text>
					<text class="placeholder-text">输入骑手手机号查看账户明细</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			navBarHeight: 0,
			loading: true,
			riderUserInfo: null,

			// 月份筛选
			viewAll: true,
			selectedYear: new Date().getFullYear(),
			selectedMonth: new Date().getMonth() + 1,
			showMonthPicker: false,

			// 6大KPI
			stats: {
				gmv: '0.00',
				refund: '0.00',
				profit: '0.00',
				riderShare: '0.00',
				riderWithdrawn: '0.00',
				riderPending: '0.00',
				riderDeposit: '0.00'
			},

			// 打款审核
			searchPhone: '',
			riderInfo: null,
			timelineList: [],
			timelineLoading: false
		};
	},

	computed: {
		monthPickerValue() {
			return `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}`;
		},

		currentMonthValue() {
			const now = new Date();
			return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
		},

		currentRangeText() {
			if (this.viewAll) {
				return '全部时间';
			}
			const range = this.getMonthRange();
			return range ? `${range.start_date} 至 ${range.end_date}` : '全部时间';
		}
	},

	onLoad() {
		this.initNavBarHeight();
		this.loadUserInfo();
		this.loadStats();
	},

	methods: {
		initNavBarHeight() {
			const systemInfo = uni.getSystemInfoSync();
			this.navBarHeight = (systemInfo.statusBarHeight || 0) + 44;
		},

		loadUserInfo() {
			this.riderUserInfo = uni.getStorageSync('riderUserInfo');
		},

		// ============ 月份筛选 ============

		prevMonth() {
			if (this.viewAll) {
				this.viewAll = false;
				return;
			}
			if (this.selectedMonth === 1) {
				this.selectedYear--;
				this.selectedMonth = 12;
			} else {
				this.selectedMonth--;
			}
			this.loadStats();
		},

		nextMonth() {
			if (this.viewAll) return;
			const now = new Date();
			const curYear = now.getFullYear();
			const curMonth = now.getMonth() + 1;
			if (this.selectedYear === curYear && this.selectedMonth === curMonth) return;

			if (this.selectedMonth === 12) {
				this.selectedYear++;
				this.selectedMonth = 1;
			} else {
				this.selectedMonth++;
			}
			this.loadStats();
		},

		toggleViewAll() {
			this.viewAll = !this.viewAll;
			if (!this.viewAll) {
				const now = new Date();
				this.selectedYear = now.getFullYear();
				this.selectedMonth = now.getMonth() + 1;
			}
			this.loadStats();
		},

		handleMonthChange(event) {
			const value = event && event.detail ? event.detail.value : '';
			if (!value) return;

			const [year, month] = value.split('-');
			this.selectedYear = Number(year);
			this.selectedMonth = Number(month);
			this.viewAll = false;
			this.loadStats();
		},

		getMonthRange() {
			if (this.viewAll) return null;
			const y = this.selectedYear;
			const m = String(this.selectedMonth).padStart(2, '0');
			const lastDay = new Date(y, this.selectedMonth, 0).getDate();
			return {
				start_date: `${y}-${m}-01`,
				end_date: `${y}-${m}-${lastDay}`
			};
		},

		// ============ 加载KPI统计 ============

		async loadStats() {
			this.loading = true;
			this.stats = {
				gmv: '0.00',
				refund: '0.00',
				profit: '0.00',
				riderShare: '0.00',
				riderWithdrawn: '0.00',
				riderPending: '0.00',
				riderDeposit: '0.00'
			};
			try {
				await this.loadSummaryData();
			} catch (e) {
				console.error('loadStats error:', e);
			} finally {
				this.loading = false;
			}
		},

		async loadSummaryData() {
			try {
				const params = {
					service_member_id: this.riderUserInfo && this.riderUserInfo.id,
					service_provider_id: this.getCurrentProviderId(),
					sign: 'chongchong'
				};
				const range = this.getMonthRange();
				if (range) {
					params.start_date = range.start_date;
					params.end_date = range.end_date;
				}

				const res = await this.$request('service/financial/summary', params, 'POST');
				if (!this.isRequestSuccess(res) || !res.data) {
					return;
				}

				this.stats.gmv = this.toFixedAmount(res.data.gmv);
				this.stats.refund = this.toFixedAmount(res.data.refund);
				this.stats.riderShare = this.toFixedAmount(res.data.rider_share);
				this.stats.riderWithdrawn = this.toFixedAmount(res.data.rider_withdrawn);
				this.stats.riderPending = this.toFixedAmount(res.data.rider_pending);
				this.stats.riderDeposit = this.toFixedAmount(res.data.rider_deposit);
				this.stats.profit = this.toFixedAmount(res.data.profit);
			} catch (e) {
				console.error('loadSummaryData error:', e);
			}
		},

		async refreshData() {
			uni.showLoading({ title: '刷新中...' });
			await this.loadStats();
			uni.hideLoading();
			uni.showToast({ title: '已刷新', icon: 'success' });
		},

		// 加载 GMV / 退款额（service/ledger 为主源）
		async loadFinancialData() {
			try {
				const timestamp = Math.floor(Date.now() / 1000);
				const providerId = this.getCurrentProviderId();
				const params = {
					service_member_id: this.riderUserInfo && this.riderUserInfo.id,
					owner_type: 'provider',
					owner_id: providerId,
					sign: 'chongchong',
					timestamp
				};
				const range = this.getMonthRange();
				if (range) {
					params.start_date = range.start_date;
					params.end_date = range.end_date;
				}

				const response = await uni.request({
					url: 'https://ccpt.cc111.cn/api/service/ledger',
					method: 'POST',
					data: params,
					header: { 'Content-Type': 'application/json' }
				});

				if (response.statusCode === 200 && response.data) {
					this.stats.gmv = this.toFixedAmount(response.data.total_income);
					this.updateProfit();
				}
			} catch (e) {
				console.error('loadFinancialData error:', e);
			}

			// 单独加载退单额
			await this.loadRefundData();
		},

		// 加载退单额（service/task/list/refunded 汇总）
		async loadRefundData() {
			try {
				const timestamp = Math.floor(Date.now() / 1000);
				const providerId = this.getCurrentProviderId();
				const params = {
					service_member_id: this.riderUserInfo && this.riderUserInfo.id,
					service_provider_id: providerId,
					sign: 'chongchong',
					timestamp,
					page: 1,
					per_page: 100
				};
				const range = this.getMonthRange();
				if (range) {
					params.start_date = range.start_date;
					params.end_date = range.end_date;
				}

				const { list, raw } = await this.fetchPagedList('service/task/list/refunded', params, {
					maxPages: 20
				});

				if (this.isRequestSuccess(raw)) {
					if (raw.total_refund_amount !== undefined) {
						this.stats.refund = this.toFixedAmount(raw.total_refund_amount);
					} else if (raw.total_amount !== undefined) {
						this.stats.refund = this.toFixedAmount(raw.total_amount);
					} else {
						const total = list.reduce((sum, order) => {
							return sum + parseFloat(order.refund_amount || order.actual_fee || order.payment_amount || order.amount || 0);
						}, 0);
						this.stats.refund = this.toFixedAmount(total);
					}
					this.updateProfit();
				}
			} catch (e) {
				console.error('loadRefundData error:', e);
			}
		},

		// 加载提现数据（已提 / 待提）
		async loadWithdrawalData() {
			try {
				const timestamp = Math.floor(Date.now() / 1000);
				const base = {
					service_member_id: this.riderUserInfo && this.riderUserInfo.id,
					sign: 'chongchong',
					timestamp,
					page: 1,
					per_page: 1
				};
				const range = this.getMonthRange();
				if (range) {
					base.start_date = range.start_date;
					base.end_date = range.end_date;
				}

				const [completedRes, pendingRes, processingRes] = await Promise.all([
					this.$request('withdraw/group/list', { ...base, status: 'completed' }, 'POST'),
					this.$request('withdraw/group/list', { ...base, status: 'pending' }, 'POST'),
					this.$request('withdraw/group/list', { ...base, status: 'processing' }, 'POST')
				]);

				const withdrawn = parseFloat(completedRes.total_actual_amount || 0);
				const pendingAmt = parseFloat(pendingRes.total_actual_amount || 0)
					+ parseFloat(processingRes.total_actual_amount || 0);

				this.stats.riderWithdrawn = this.toFixedAmount(withdrawn);
				this.stats.riderPending = this.toFixedAmount(pendingAmt);
				this.stats.riderShare = this.toFixedAmount(withdrawn + pendingAmt);
				this.updateProfit();
			} catch (e) {
				console.error('loadWithdrawalData error:', e);
			}
		},

		// 加载押金数据（遍历骑手列表汇总 deposit 字段）
		async loadDepositData() {
			try {
				const timestamp = Math.floor(Date.now() / 1000);
				let totalDeposit = 0;
				let page = 1;
				const perPage = 100;

				while (true) {
					const res = await this.$request('service/member/list', {
						service_member_id: this.riderUserInfo && this.riderUserInfo.id,
						sign: 'chongchong',
						timestamp,
						page,
						per_page: perPage
					}, 'POST');

					if (res.status !== 'success' || !res.data || !res.data.data) break;
					const riders = res.data.data;
					riders.forEach(r => {
						totalDeposit += parseFloat(r.actual_deposit || r.deposit || r.margin || 0);
					});
					if (riders.length < perPage) break;
					page++;
				}

				this.stats.riderDeposit = this.toFixedAmount(totalDeposit);
			} catch (e) {
				console.error('loadDepositData error:', e);
			}
		},

		// ============ 打款审核 - 骑手时间轴 ============

		async searchRider() {
			const phone = this.searchPhone.trim();
			if (!phone) {
				uni.showToast({ title: '请输入手机号', icon: 'none' });
				return;
			}

			this.riderInfo = null;
			this.timelineList = [];
			this.timelineLoading = true;

			try {
				// 查询骑手信息
				const timestamp = Math.floor(Date.now() / 1000);
				const baseParams = {
					service_member_id: this.riderUserInfo && this.riderUserInfo.id,
					sign: 'chongchong',
					timestamp
				};

				const riderRes = await this.$request('service/member/info', {
					...baseParams,
					phone
				}, 'POST');

				if (riderRes.status === 'success' && riderRes.data) {
					this.riderInfo = riderRes.data;
				} else {
					// 尝试从列表中搜索
					const listRes = await this.$request('service/member/list', {
						...baseParams,
						keyword: phone,
						page: 1,
						per_page: 10
					}, 'POST');
					if (listRes.status === 'success' && listRes.data && listRes.data.data && listRes.data.data.length > 0) {
						this.riderInfo = listRes.data.data[0];
					} else {
						uni.showToast({ title: '未找到该骑手', icon: 'none' });
						this.timelineLoading = false;
						return;
					}
				}

				// 加载时间轴
				await this.loadRiderTimeline(this.getRiderId(this.riderInfo));
			} catch (e) {
				console.error('searchRider error:', e);
				uni.showToast({ title: '查询失败', icon: 'none' });
			} finally {
				this.timelineLoading = false;
			}
		},

		async loadRiderTimeline(riderId) {
			try {
				const timestamp = Math.floor(Date.now() / 1000);
				const baseParams = {
					service_member_id: this.riderUserInfo && this.riderUserInfo.id,
					sign: 'chongchong',
					timestamp,
					member_id: riderId,
					page: 1,
					per_page: 100
				};

				const [ordersResult, withdrawsResult] = await Promise.all([
					this.fetchPagedList('task/member/list', baseParams, { maxPages: 10 }),
					this.fetchPagedList('withdraw/list', { ...baseParams, status: 'all' }, { maxPages: 10 })
				]);

				const events = [];
				const orders = ordersResult.list || [];
				const withdraws = withdrawsResult.list || [];

				orders.forEach(order => {
					if (order.status === 'completed' || order.status === 'finished') {
						events.push({
							type: 'order',
							created_at: order.completed_at || order.created_at || order.task_date,
							amount: order.commission || order.rider_commission || order.member_amount || order.amount || 0,
							order_no: order.task_no || order.order_no || order.id,
							city: this.getOrderCity(order),
							status: order.status,
							balance_after: 0
						});
					}
				});

				withdraws.forEach(w => {
					events.push({
						type: 'withdraw',
						created_at: w.completed_at || w.processed_at || w.created_at || w.apply_time,
						amount: w.actual_amount || w.amount || 0,
						status: w.status,
						balance_after: 0
					});
				});

				events.sort((a, b) => this.parseDate(a.created_at) - this.parseDate(b.created_at));

				this.applyTimelineBalances(events, parseFloat(this.riderInfo && this.riderInfo.balance || 0));

				this.timelineList = events;
			} catch (e) {
				console.error('loadRiderTimeline error:', e);
				// 尝试备用接口
				await this.loadTimelineFallback(riderId);
			}
		},

		async loadTimelineFallback(riderId) {
			try {
				const timestamp = Math.floor(Date.now() / 1000);
				const params = {
					service_member_id: this.riderUserInfo && this.riderUserInfo.id,
					sign: 'chongchong',
					timestamp,
					rider_id: riderId,
					page: 1,
					per_page: 100
				};

				const withdrawsRes = await this.$request('withdraw/list', {
					...params,
					member_id: riderId
				}, 'POST');

				let events = [];

				if (withdrawsRes.status === 'success' && withdrawsRes.data) {
					const withdraws = Array.isArray(withdrawsRes.data) ? withdrawsRes.data : (withdrawsRes.data.data || []);
					withdraws.forEach(w => {
						events.push({
							type: 'withdraw',
							created_at: w.completed_at || w.processed_at || w.created_at || w.apply_time,
							amount: w.actual_amount || w.amount || 0,
							status: w.status,
							balance_after: 0
						});
					});
				}

				events.sort((a, b) => this.parseDate(a.created_at) - this.parseDate(b.created_at));
				this.applyTimelineBalances(events, parseFloat(this.riderInfo && this.riderInfo.balance || 0));

				this.timelineList = events;
			} catch (e) {
				console.error('loadTimelineFallback error:', e);
			}
		},

		// ============ 工具方法 ============

		isRequestSuccess(res) {
			return !!res && (res.code === 200 || res.status === 'success');
		},

		extractList(res) {
			if (!res) return [];
			if (Array.isArray(res.data)) return res.data;
			if (res.data && Array.isArray(res.data.data)) return res.data.data;
			if (res.data && Array.isArray(res.data.list)) return res.data.list;
			return [];
		},

		async fetchPagedList(url, params = {}, options = {}) {
			const pageSize = options.pageSize || params.per_page || 100;
			const maxPages = options.maxPages || 20;
			let page = params.page || 1;
			let all = [];
			let raw = null;

			while (page <= maxPages) {
				const res = await this.$request(url, { ...params, page, per_page: pageSize }, 'POST');
				raw = res;
				if (!this.isRequestSuccess(res)) {
					break;
				}

				const list = this.extractList(res);
				all = all.concat(list);

				const currentPage = Number((res.data && res.data.current_page) || page);
				const lastPage = Number((res.data && res.data.last_page) || currentPage);
				const hasMoreByPagination = res.data && res.data.last_page ? currentPage < lastPage : false;
				const hasMoreByLength = !hasMoreByPagination && list.length === pageSize;

				if ((!hasMoreByPagination && !hasMoreByLength) || list.length === 0) {
					break;
				}

				page += 1;
			}

			return { list: all, raw };
		},

		toFixedAmount(val) {
			return parseFloat(val || 0).toFixed(2);
		},

		getCurrentProviderId() {
			if (!this.riderUserInfo) return 1;
			return this.riderUserInfo.service_provider_id || this.riderUserInfo.provider_id || 1;
		},

		updateProfit() {
			const gmv = parseFloat(this.stats.gmv || 0);
			const refund = parseFloat(this.stats.refund || 0);
			const riderShare = parseFloat(this.stats.riderShare || 0);
			this.stats.profit = this.toFixedAmount(gmv - refund - riderShare);
		},

		getRiderId(rider) {
			if (!rider) return '';
			return rider.service_member_id || rider.member_id || rider.id || '';
		},

		getRiderName(rider) {
			if (!rider) return '骑手';
			return rider.real_name || rider.contact_person || rider.nickname || rider.name || '骑手';
		},

		getRiderPhone(rider) {
			if (!rider) return '';
			return rider.phone || rider.phone_number || '';
		},

		getOrderCity(order) {
			return order.city_name || order.city || order.area || order.province_name || '';
		},

		parseDate(dateStr) {
			if (!dateStr) return 0;
			if (typeof dateStr === 'number') {
				return String(dateStr).length === 10 ? dateStr * 1000 : dateStr;
			}

			const normalized = String(dateStr).includes('T')
				? String(dateStr)
				: `${String(dateStr).replace(' ', 'T')}+08:00`;
			const time = new Date(normalized).getTime();
			return Number.isNaN(time) ? 0 : time;
		},

		applyTimelineBalances(events, currentBalance) {
			let runningBalance = parseFloat(currentBalance || 0);
			for (let i = events.length - 1; i >= 0; i--) {
				const item = events[i];
				item.balance_after = runningBalance;

				if (item.type === 'order') {
					runningBalance -= parseFloat(item.amount || 0);
				} else if (item.type === 'withdraw' && item.status === 'completed') {
					runningBalance += parseFloat(item.amount || 0);
				}
			}
		},

		formatAmount(val) {
			return this.toFixedAmount(val);
		},

		formatTimelineDate(dateStr) {
			if (!dateStr) return '';
			try {
				const parsed = this.parseDate(dateStr);
				if (!parsed) return dateStr;
				const d = new Date(parsed);
				const y = String(d.getFullYear()).slice(2);
				const mo = String(d.getMonth() + 1).padStart(2, '0');
				const day = String(d.getDate()).padStart(2, '0');
				const h = String(d.getHours()).padStart(2, '0');
				const mi = String(d.getMinutes()).padStart(2, '0');
				return `${y}.${mo}.${day} ${h}:${mi}`;
			} catch (e) {
				return dateStr;
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.financial-statistics-container {
	min-height: 100vh;
	background: #f5f6f8;
}

.nav-placeholder {
	flex-shrink: 0;
}

/* 加载 */
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;

	.loading-spinner {
		width: 64rpx;
		height: 64rpx;
		border: 4rpx solid #e4e7ed;
		border-top-color: #2492F2;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;

		&.small {
			width: 40rpx;
			height: 40rpx;
		}
	}

	.loading-text {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #909399;
	}
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

/* 主滚动区域 */
.statistics-content {
	height: calc(100vh - var(--nav-height, 88px));
	padding: 24rpx;
	box-sizing: border-box;
}

.range-summary {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: -4rpx 8rpx 20rpx;
	font-size: 24rpx;

	.range-label {
		color: #909399;
	}

	.range-value {
		color: #2492F2;
		font-weight: 500;
	}
}

/* ===== 月份筛选 ===== */
.month-filter-section {
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx 28rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	display: flex;
	align-items: center;
	justify-content: space-between;

	.month-nav {
		display: flex;
		align-items: center;
		gap: 16rpx;
		flex: 1;

		.month-arrow {
			width: 56rpx;
			height: 56rpx;
			border-radius: 50%;
			background: #f0f4ff;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 36rpx;
			color: #2492F2;
			font-weight: bold;
			line-height: 1;
		}

		.month-display {
			flex: 1;
			text-align: center;

			.month-text {
				font-size: 32rpx;
				font-weight: 600;
				color: #303133;

				&.all-time {
					color: #2492F2;
				}
			}
		}
	}

	.all-time-btn {
		padding: 10rpx 24rpx;
		border-radius: 24rpx;
		font-size: 26rpx;
		color: #606266;
		background: #f5f7fa;
		margin-left: 16rpx;
		flex-shrink: 0;

		&.active {
			background: linear-gradient(135deg, #2492F2, #1a7dd9);
			color: #fff;
		}
	}
}

/* ===== 6大KPI卡片 ===== */
.kpi-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
	margin-bottom: 24rpx;

	.kpi-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 28rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
		position: relative;
		overflow: hidden;

		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 6rpx;
		}

		&.blue::after { background: linear-gradient(90deg, #2492F2, #1a7dd9); }
		&.red::after { background: linear-gradient(90deg, #ff6b6b, #ee5a52); }
		&.green::after { background: linear-gradient(90deg, #51cf66, #37b24d); }
		&.cyan::after { background: linear-gradient(90deg, #16c2c2, #0b9b9b); }
		&.teal::after { background: linear-gradient(90deg, #20c997, #0ca678); }
		&.orange::after { background: linear-gradient(90deg, #ffa726, #fb8c00); }
		&.purple::after { background: linear-gradient(90deg, #9c27b0, #7b1fa2); }

		.kpi-label {
			font-size: 26rpx;
			color: #909399;
			margin-bottom: 12rpx;
		}

		.kpi-value {
			font-size: 38rpx;
			font-weight: 700;
			color: #303133;
			margin-bottom: 8rpx;
			word-break: break-all;
		}

		.kpi-desc {
			font-size: 22rpx;
			color: #c0c4cc;
		}
	}
}

/* 刷新按钮 */
.refresh-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	background: #fff;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	color: #2492F2;
	font-size: 28rpx;

	.refresh-icon {
		font-size: 32rpx;
	}
}

/* ===== 打款审核区域 ===== */
.audit-section {
	background: #fff;
	border-radius: 16rpx;
	padding: 28rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	margin-bottom: 40rpx;

	.section-header {
		display: flex;
		align-items: baseline;
		gap: 14rpx;
		margin-bottom: 24rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #303133;
		}

		.section-sub {
			font-size: 24rpx;
			color: #909399;
		}
	}

	.rider-search-box {
		display: flex;
		gap: 16rpx;
		margin-bottom: 24rpx;

		.rider-search-input {
			flex: 1;
			height: 72rpx;
			border: 2rpx solid #dcdfe6;
			border-radius: 10rpx;
			padding: 0 20rpx;
			font-size: 28rpx;
			color: #303133;
			background: #fafafa;
		}

		.rider-search-btn {
			width: 120rpx;
			height: 72rpx;
			background: linear-gradient(135deg, #2492F2, #1a7dd9);
			border-radius: 10rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			font-size: 28rpx;
			font-weight: 500;
			flex-shrink: 0;
		}
	}

	/* 骑手信息卡片 */
	.rider-info-card {
		background: #f0f6ff;
		border-radius: 12rpx;
		padding: 20rpx 24rpx;
		margin-bottom: 24rpx;
		border-left: 6rpx solid #2492F2;

		.rider-info-row {
			display: flex;
			align-items: center;
			gap: 16rpx;
			margin-bottom: 14rpx;

			.rider-name {
				font-size: 30rpx;
				font-weight: 600;
				color: #303133;
			}

			.rider-phone {
				font-size: 26rpx;
				color: #606266;
			}
		}

		.rider-balance-row {
			display: flex;
			gap: 0;

			.balance-item {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;

				.balance-label {
					font-size: 22rpx;
					color: #909399;
					margin-bottom: 4rpx;
				}

				.balance-value {
					font-size: 28rpx;
					font-weight: 600;
					color: #2492F2;
				}
			}
		}
	}

	/* 时间轴加载 */
	.timeline-loading {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 40rpx 0;
		justify-content: center;
		color: #909399;
		font-size: 26rpx;
	}

	.timeline-empty {
		text-align: center;
		padding: 60rpx 0;
		color: #c0c4cc;
		font-size: 28rpx;
	}

	.timeline-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
		padding: 60rpx 0;

		.placeholder-icon {
			font-size: 64rpx;
		}

		.placeholder-text {
			font-size: 28rpx;
			color: #c0c4cc;
		}
	}
}

/* ===== 时间轴 ===== */
.timeline {
	padding-top: 8rpx;

	.timeline-item {
		display: flex;
		gap: 20rpx;
		margin-bottom: 4rpx;

		/* 左侧 - 线条和节点 */
		.timeline-left {
			display: flex;
			flex-direction: column;
			align-items: center;
			flex-shrink: 0;
			width: 28rpx;
			padding-top: 6rpx;

			.timeline-dot {
				width: 20rpx;
				height: 20rpx;
				border-radius: 50%;
				flex-shrink: 0;
				z-index: 1;

				&.dot-green { background: #51cf66; }
				&.dot-red { background: #ff6b6b; }
			}

			.timeline-line {
				flex: 1;
				width: 2rpx;
				background: #e4e7ed;
				margin: 4rpx 0;
				min-height: 40rpx;
			}
		}

		/* 右侧内容 */
		.timeline-right {
			flex: 1;
			padding-bottom: 32rpx;

			.timeline-header {
				display: flex;
				align-items: center;
				gap: 14rpx;
				margin-bottom: 10rpx;

				.timeline-date {
					font-size: 24rpx;
					color: #909399;
				}

				.timeline-badge {
					padding: 4rpx 12rpx;
					border-radius: 10rpx;
					font-size: 22rpx;
					color: #fff;

					&.badge-in { background: #51cf66; }
					&.badge-out { background: #ff6b6b; }
				}
			}

			.timeline-body {
				background: #f9fafc;
				border-radius: 10rpx;
				padding: 16rpx 20rpx;
				margin-bottom: 10rpx;

				.order-info-row {
					display: flex;
					align-items: center;
					gap: 12rpx;
					margin-bottom: 8rpx;

					.order-city {
						font-size: 26rpx;
						color: #606266;
					}

					.order-no {
						font-size: 22rpx;
						color: #c0c4cc;
						flex: 1;
					}

					.withdraw-label {
						font-size: 26rpx;
						color: #606266;
					}

					.status-tag {
						font-size: 22rpx;
						padding: 2rpx 10rpx;
						border-radius: 8rpx;

						&.completed { color: #51cf66; background: #f0fff4; }
						&.processing { color: #ffa726; background: #fff8f0; }
						&.pending { color: #2492F2; background: #f0f6ff; }
					}
				}

				.amount-row {
					.amount-in {
						font-size: 32rpx;
						font-weight: 600;
						color: #51cf66;
					}

					.amount-out {
						font-size: 32rpx;
						font-weight: 600;
						color: #ff6b6b;
					}
				}
			}

			.balance-after {
				display: flex;
				align-items: center;

				.balance-after-label {
					font-size: 24rpx;
					color: #909399;
				}

				.balance-after-value {
					font-size: 24rpx;
					color: #303133;
					font-weight: 500;
				}
			}
		}
	}
}
</style>
