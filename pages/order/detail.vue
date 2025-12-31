<template>
	<view class="order-detail">
		<!-- 自定义导航栏 -->
		<nav-bar title="订单详情" title-align="center"></nav-bar>

		<!-- 内容区域 -->
		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 订单城市平均完单时效 -->
			<view class="city-efficiency-wrapper" v-if="orderInfo.estimated_completion_hours">
				<view class="city-efficiency-card">
					<view class="efficiency-content">
					<view class="city-area">
						<image src="https://ccpt.qiniu.0871.cn/tb11.png" class="location-icon" mode="aspectFit"></image>
						<text class="city-name">{{ orderInfo.city_name }} · {{ orderInfo.district_name }}</text>
					</view>
						<text class="efficiency-label">近100单平均完单时效：</text>
						<text class="efficiency-value">{{ orderInfo.estimated_completion_hours }}h</text>
					</view>
		</view>
	</view>
	<!-- 用户确认卡片 -->
		<view class="confirm-card" v-if="orderInfo.status === 'completed'">
			<view class="card-title">
				<text>我已确认</text>
			</view>
			<view class="confirm-content">
				<view class="confirm-info">
					<view class="remark" v-if="orderInfo.completed_at">
						<text class="label">确认时间：</text>
						<text class="content">{{ formatDateTime(orderInfo.completed_at) }}</text>
					</view>
					<!-- 用户评价信息 -->
					<view class="review-section" v-if="orderInfo.review">
						<text class="section-title">用户评价：</text>
						<view class="review-content">
							<view class="review-rating" v-if="orderInfo.review.rating">
								<text class="rating-label">评分：</text>
								<view class="stars">
									<text
										v-for="star in 5"
										:key="star"
										class="star"
										:class="{ active: star <= orderInfo.review.rating }">
										★
									</text>
								</view>
								<text class="rating-text">{{ orderInfo.review.rating }}分</text>
							</view>
							<view class="review-tags" v-if="orderInfo.review.tags && orderInfo.review.tags.length > 0">
								<text class="tags-label">评价标签：</text>
								<view class="tags-list">
									<text
										v-for="(tag, index) in orderInfo.review.tags"
										:key="index"
										class="tag-item">
										{{ tag }}
									</text>
								</view>
							</view>
							<view class="review-comment" v-if="orderInfo.review.comment">
								<text class="comment-label">评价内容：</text>
								<text class="comment-text">{{ orderInfo.review.comment }}</text>
							</view>
							<view class="review-time" v-if="orderInfo.review.created_at">
								<text class="time-label">评价时间：</text>
								<text class="time-text">{{ formatDateTime(orderInfo.review.created_at) }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	

	<!-- 骑手完成反馈卡片 - 只在状态为finished或completed时显示 -->
	<view class="feedback-card" v-if="(orderInfo.status === 'finished' || orderInfo.status === 'completed') && orderInfo.task_assignment">
		<view class="card-title" style="display: flex;">
			<text style="flex: 1;">骑手完成反馈</text>
			<text @click="handleReviewClick(orderInfo)" style="color: #fff; background: #E74C3C; padding: 0 3px; border-radius: 2px;">评价</text>
		</view>
		<view class="detail-list-wrapper">
			<view class="feedback-content">
				<view class="feedback-info">
					<view class="remark" v-if="orderInfo.task_assignment.finished_at">
						<text class="label">完成时间：</text>
						<text class="content">{{ orderInfo.task_assignment.finished_at }}</text>
					</view>
					<view class="remark" v-if="orderInfo.task_assignment.after_detail">
						<text class="label">完成反馈：</text>
						<text class="content">{{ orderInfo.task_assignment.after_detail }}</text>
					</view>
					<view class="remark" v-if="orderInfo.task_assignment.additional_feedback">
						<text class="label">其他备注：</text>
						<text class="content">{{ orderInfo.task_assignment.additional_feedback }}</text>
					</view>
					<view class="images-section" v-if="orderInfo.task_assignment.after_pic_url && orderInfo.task_assignment.after_pic_url.length > 0">
						<text class="section-title">反馈图片：</text>
						<view class="images">
							<view
								v-for="(url, index) in orderInfo.task_assignment.after_pic_url"
								:key="index"
								class="feedback-image-item">
								<image
									:src="url"
									mode="aspectFill"
									@click="previewFeedbackImage(index)"
									class="feedback-image">
								</image>
								<text class="image-label">{{ getFeedbackImageLabel(index) }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>

	<!-- 骑手状态步骤 -->
	<view class="rider-info-card-2">
				<view class="state-buzhou mar-bot-15 mar-top-30" @click="showTimeline=true">
					<!-- 步骤条容器 -->
					<view class="steps-container">
						<!-- 步骤1: 骑手已接单/待接单 -->
						<view class="step-item" :class="{ 'step-active': orderInfo.status !== 'waiting', 'step-working': orderInfo.status === 'waiting' }">
							<view v-if="newStatus == '骑手放弃订单'" class="step-icon-wrapper">
								<image v-if="orderInfo.status === 'waiting'" src="https://ccpt.qiniu.0871.cn/ytd.png" class="working-gif-2" mode="aspectFit"></image>
								<view class="step-dot" :class="{ 'step-dot-active': orderInfo.status !== 'waiting' }"></view>
								<view class="step-lab">抱歉：骑手{{orderInfo.task_assignment.service_member_id}}已退单</view>
							</view>
							<view v-else class="step-icon-wrapper">
								<image v-if="orderInfo.status === 'waiting'" src="https://ccpt.qiniu.0871.cn/djd-fz2.png" class="working-gif-2" mode="aspectFit"></image>
								<view class="step-dot" :class="{ 'step-dot-active': orderInfo.status !== 'waiting' }"></view>
							</view>
							<view class="step-content">
								<text class="step-title" :class="{
									'step-title-active': orderInfo.status !== 'waiting',
									'step-title-working': orderInfo.status === 'waiting'
								}">{{ orderInfo.status === 'waiting' ? '待接单' : '骑手已接单' }}</text>
								<text class="step-time" v-if="orderInfo.status !== 'waiting' && orderInfo.task_assignment && (orderInfo.task_assignment.assigned_at || orderInfo.task_assignment.created_at)">
									{{ formatShortDate(orderInfo.task_assignment.assigned_at || orderInfo.task_assignment.created_at) }}
								</text>
							</view>
							<view class="step-line" :class="{ 'step-line-active': orderInfo.status !== 'waiting' }"></view>
						</view>

						<!-- 步骤2: 作业中 -->
						<view class="step-item" :class="{ 'step-working': orderInfo.status === 'assigned' }">
							<view class="step-icon-wrapper">
								<!-- 气泡提示 -->
								<view v-if="orderInfo.status === 'assigned' && orderInfo.task_assignment.predict_complete_type" class="feedback-bubble">
									<image src="https://ccpt.qiniu.0871.cn/riderend/qipao.svg" class="bubble-bg" mode="aspectFit"></image>
									<text class="bubble-text" v-if="orderInfo.task_assignment.predict_complete_type == '不确定'">我已接单 将尽快完成！</text>
									<text class="bubble-text" v-else>我预计{{orderInfo.task_assignment.predict_complete_type}}完成！</text>
								</view>
								<image v-if="orderInfo.status === 'assigned'" src="https://ccpt.qiniu.0871.cn/1112.gif" class="working-gif" mode="aspectFit"></image>
								<view class="step-dot" :class="{
									'step-dot-half': orderInfo.status === 'assigned',
									'step-dot-active': orderInfo.status === 'finished' || orderInfo.status === 'completed'
								}"></view>
							</view>
							<view class="step-content">
								<text class="step-title" :class="{
									'step-title-working': orderInfo.status === 'assigned',
									'step-title-active': orderInfo.status === 'finished' || orderInfo.status === 'completed'
								}">作业中</text>
							</view>
							<view class="step-line" :class="{
								'step-line-half': orderInfo.status === 'assigned',
								'step-line-active': orderInfo.status === 'finished' || orderInfo.status === 'completed'
							}"></view>
						</view>

						<!-- 步骤3: 完单反馈 -->
						<view class="step-item" :class="{ 'step-working': orderInfo.status === 'finished' }">
							<view class="step-icon-wrapper">
								<!-- 气泡提示 -->
								<view v-if="orderInfo.status === 'finished'" class="feedback-bubble">
									<image src="https://ccpt.qiniu.0871.cn/riderend/qipao.svg" class="bubble-bg" mode="aspectFit"></image>
									<text class="bubble-text">已完单反馈请确认!</text>
								</view>
								<image v-if="orderInfo.status === 'finished'" src="https://ccpt.qiniu.0871.cn/riderend/wandan2.png" class="working-gif" mode="aspectFit"></image>
								<view class="step-dot" :class="{
									'step-dot-active': orderInfo.status === 'finished' || orderInfo.status === 'completed'
								}"></view>
							</view>
							<view class="step-content">
								<text class="step-title" :class="{
									'step-title-working': orderInfo.status === 'finished',
									'step-title-active': orderInfo.status === 'completed'
								}">完单反馈</text>
								<text class="step-time" v-if="orderInfo.status === 'finished' && orderInfo.task_assignment && orderInfo.task_assignment.finished_at">
									{{ formatShortDate(orderInfo.task_assignment.finished_at) }}
								</text>
							</view>
							<view class="step-line" :class="{
								'step-line-active': orderInfo.status === 'completed'
							}"></view>
						</view>

						<!-- 步骤4: 确认完单 -->
						<view class="step-item step-last" :class="{ 'step-working': orderInfo.status === 'completed' }">
							<view class="step-icon-wrapper">
								<image v-if="orderInfo.status === 'completed'" src="https://ccpt.qiniu.0871.cn/querenwandan.png" class="working-wandan" mode="aspectFit"></image>
								<view class="step-dot" :class="{ 'step-dot-active': orderInfo.status === 'completed' }"></view>
							</view>
							<view class="step-content">
								<text class="step-title" :class="{ 'step-title-active': orderInfo.status === 'completed' }">确认完单</text>
								<text class="step-time" v-if="orderInfo.status === 'completed' && orderInfo.completed_at">
									{{ formatShortDate(orderInfo.completed_at) }}
								</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 地图导航卡片 -->
				<view class="map-card" v-if="orderInfo.shop_address || orderInfo.address">
					<view class="map-container" @tap="openNavigation">
						<map 
							v-if="orderInfo.latitude && orderInfo.longitude"
							:latitude="orderInfo.latitude" 
							:longitude="orderInfo.longitude"
							:markers="mapMarkers"
							:show-location="false"
							:enable-zoom="false"
							:enable-scroll="false"
							:enable-rotate="false"
							:scale="15"
							class="map-view"
						>
						</map>
						<view v-else class="map-placeholder">
							<view class="map-icon-wrapper">
								<image src="https://ccpt.qiniu.0871.cn/tb11.png" class="map-icon" mode="aspectFit"></image>
							</view>
							<text class="map-text">点击打开地图导航</text>
							<view class="map-arrow">→</view>
						</view>
						<!-- 门店名称覆盖层 -->
						<view class="map-store-name-overlay">
							<view class="store-name-tag">
								<image src="https://ccpt.qiniu.0871.cn/tb11.png" class="tag-icon" mode="aspectFit"></image>
								<text class="tag-text">{{orderInfo.task_detail ? orderInfo.task_detail.store_name : '服务门店'}}</text>
							</view>
						</view>
						<!-- 导航按钮 -->
						<view class="map-nav-button">
							<text class="nav-text">导航</text>
						</view>
					</view>
				</view>
				
				<!-- 骑手信息卡片 -->
				<view class="rider-info-card" v-if="orderInfo.task_assignment && orderInfo.task_assignment.service_member_id && orderInfo.status !== 'waiting'">
					<image :src="getRiderAvatar()" class="rider-avatar-large" mode="aspectFill"></image>
					<view class="rider-details">
						<view class="rider-name-row">
							<view class="name-content">
								<text class="rider-label">骑手</text>
								<text class="rider-name">{{getRiderDisplayName()}}</text>
							</view>
							<text class="entry-time">入驻时间：{{formatEntryDate()}}</text>
						</view>
					<view class="rider-stats-row">
						<text class="stats-item">累积完单：{{getTotalOrdersDisplay()}}单</text>
						<view class="reward-btn" v-if="orderInfo.status === 'assigned'" @click="openRewardModal">
							<text class="reward-text">赏</text>
						</view>
					</view>
						<view class="rider-rating-row">
							<text class="rating-label">历史评价：</text>
							<view class="rating-stars">
								<text class="star" v-for="n in 5" :key="n">★</text>
							</view>
							<text class="rating-score">4.9</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 订单基本信息 -->
			<view class="order-header">

				<!-- 骑手已接单信息 -->
				<!-- <block v-if="(orderInfo.status === 'assigned' || orderInfo.status === 'finished' || orderInfo.status === 'completed') && orderInfo.task_assignment">
					<view class="rider-assigned-card">
						<view class="rider-header">
							<view class="rider-info">
								<image :src="getRiderAvatar()" class="rider-avatar" mode="aspectFill"></image>
								<view class="rider-content">
									<view class="rider-title">
										<text class="title-text">已接单 骑手：{{ getRiderDisplayName() }}</text>
									</view>
									<view class="accept-time" v-if="orderInfo.task_assignment && (orderInfo.task_assignment.assigned_at || orderInfo.task_assignment.created_at)">
										<text class="time-label">接单：</text>
										<text class="time-value">{{ formatDateTime(orderInfo.task_assignment.assigned_at || orderInfo.task_assignment.created_at) }}</text>
									</view>
									<view class="promotion-banner">
										<image src="https://ccpt.qiniu.0871.cn/order/qishou/huore2.png" class="promotion-image" mode="aspectFit"></image>
									</view>
								</view>
							</view>
							<view class="rider-status">
								<view class="status-gif" v-if="orderInfo.status === 'assigned'">
									<image src="https://ccpt.qiniu.0871.cn/aa.gif" mode="aspectFit" class="gif-image"></image>
								</view>
								<view class="status-gif" v-if="orderInfo.status === 'completed'">
									<image src="https://ccpt.qiniu.0871.cn/order/wancheng.png" mode="aspectFit" class="gif-image"></image>
								</view>
								<view class="status-tag" :class="[(orderInfo.status === 'finished' || orderInfo.status === 'completed') && orderInfo.payment_status === 'refunded' ? 'status-refunded' : '']">{{getStatusText(orderInfo)}} <text class="arrow"></text></view>
							</view>
						</view>
					</view>
				</block> -->

				<view class="order-title-new">
					<view class="order-basic-logo" :class="[getServiceTypeClass(orderInfo.task_detail ? orderInfo.task_detail.detail : ''), getBrandClass(orderInfo.brand)]">
						<view class="icon-content">
							<text class="brand-text">{{getBrandText(orderInfo.brand)}}</text>
							<text class="service-text">{{getSimplifiedDetailText(orderInfo.task_detail ? orderInfo.task_detail.detail : '')}}</text>
						</view>
					</view>
					<view class="title-info">
						<view class="title-row">
							<text class="task-name">{{getBrandText(orderInfo.brand)}} {{formatServiceItemsWithNumber(orderInfo.task_detail)}}</text>
						</view>
						<view class="title-divider"></view>
						<view class="info-row">
							<text class="info-label">门店 POI：</text>
							<text class="info-value">{{orderInfo.task_detail.shop_poi ? orderInfo.task_detail.shop_poi : '无'}}</text>
							<view class="copy-btn" @tap="copyShopPoi">
								<image src="https://ccpt.qiniu.0871.cn/adminEnd/copy.svg" mode="aspectFit" class="copy-icon"></image>
							</view>
						</view>
						<view class="info-row device-code-row" v-if="orderInfo.task_detail && orderInfo.task_detail.sn_mac_code && orderInfo.task_detail.sn_mac_code.length > 0">
							<text class="info-label">设备编码：</text>
							<view class="device-code-list">
								<view v-for="(code, index) in orderInfo.task_detail.sn_mac_code" :key="index" class="device-code-item">
									<text class="info-value">{{code.value}}</text>
									<view class="copy-btn" @tap="copyDeviceCode(code.value)">
										<image src="https://ccpt.qiniu.0871.cn/adminEnd/copy.svg" mode="aspectFit" class="copy-icon"></image>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 附加服务展示 -->
				<view class="extra-services" v-if="hasExtraServices">
					<view class="extra-services-label">附加服务：</view>
					<view class="extra-services-content">
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_1">
							<text class="service-name">{{ orderInfo.task_detail.extra_task_1 }}</text>
							<text class="service-count">x{{ orderInfo.task_detail.extra_task_1_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_2 || orderInfo.task_detail.extra_task_3 || orderInfo.task_detail.extra_task_4 || orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="service-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_2">
							<text class="service-name">{{ orderInfo.task_detail.extra_task_2 }}</text>
							<text class="service-count">x{{ orderInfo.task_detail.extra_task_2_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_3 || orderInfo.task_detail.extra_task_4 || orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="service-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_3">
							<text class="service-name">{{ orderInfo.task_detail.extra_task_3 }}</text>
							<text class="service-count">x{{ orderInfo.task_detail.extra_task_3_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_4 || orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="service-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_4">
							<text class="service-name">{{ orderInfo.task_detail.extra_task_4 }}</text>
							<text class="service-count">x{{ orderInfo.task_detail.extra_task_4_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="service-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_5">
							<text class="service-name">{{ orderInfo.task_detail.extra_task_5 }}</text>
							<text class="service-count">x{{ orderInfo.task_detail.extra_task_5_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_6" class="service-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_6">
							<text class="service-name">{{ orderInfo.task_detail.extra_task_6 }}</text>
							<text class="service-count">x{{ orderInfo.task_detail.extra_task_6_item_number }}</text>
						</template>
					</view>
				</view>

			</view>

		<!-- 订单详情卡片（含展开/收起） -->
		<view class="order-detail-card">
			<view class="detail-list-toggle">
				<view class="toggle-title">
					<view class="title-left">
						<image class="header-icon" src="https://ccpt.qiniu.0871.cn/order/order.png" mode="aspectFit"></image>
						<text class="header-title">订单详情</text>
					</view>
					<view class="order-no-right" v-if="orderInfo.task_no">
						<text class="order-no-text">订单编号：{{orderInfo.task_no}}</text>
						<view class="copy-order-no-btn" @tap="copyOrderNumber">
							<image src="https://ccpt.qiniu.0871.cn/adminEnd/copy.svg" mode="aspectFit" class="copy-icon-small"></image>
						</view>
					</view>
				</view>
			</view>
		<view class="detail-list-wrapper">
			<view class="detail-list" :style="{ maxHeight: isFullyExpanded ? 'none' : '300rpx' }">
			<!-- 发布时间 -->
				<view class="detail-item">
					<view class="item-dot"></view>
					<view class="item-label">发布时间：</view>
					<view class="item-value">{{formatShortDate(orderInfo.task_date)}}</view>
				</view>
				<view class="divider"></view>
					<!-- 门店POI -->
					<!-- <view class="detail-item" v-if="orderInfo.task_detail && orderInfo.task_detail.shop_poi">
						<view class="item-dot"></view>
						<view class="item-label">门店POI：</view>
						<view class="item-value">{{orderInfo.task_detail.shop_poi}}</view>
					</view> -->
					<view class="divider" v-if="orderInfo.task_detail && orderInfo.task_detail.shop_poi"></view>
				<view class="detail-item" v-if="orderInfo.task_detail && orderInfo.task_detail.device_outside !== undefined">
					<view class="item-dot"></view>
					<view class="item-label">设备位置：</view>
					<view class="item-value">
						{{ orderInfo.task_detail.device_outside ? '外摆' : '非外摆' }}
					</view>
					</view>
					<view class="divider" v-if="orderInfo.task_detail && orderInfo.task_detail.device_outside !== undefined"></view>
					<view class="detail-item">
						<view class="item-dot"></view>
						<view class="item-label">服务门店：</view>
						<view class="item-value store-name-container">
							<text class="store-name-text">{{orderInfo.task_detail ? orderInfo.task_detail.store_name : ''}}</text>
							<view class="copy-store-btn" @tap="copyStoreName">
								<image src="https://ccpt.qiniu.0871.cn/adminEnd/copy.svg" mode="aspectFit" class="copy-icon-small"></image>
							</view>
						</view>
					</view>
					<view class="detail-sub-item address-container">
						<text class="address-text">{{orderInfo.province_name}}{{orderInfo.city_name}}{{orderInfo.district_name}}{{orderInfo.shop_address}}{{orderInfo.address}}</text>
						<view class="copy-address-btn" @tap="copyAddress">
							<image src="https://ccpt.qiniu.0871.cn/adminEnd/copy.svg" mode="aspectFit" class="copy-icon-small"></image>
						</view>
					</view>
					<!-- <view class="detail-sub-item" v-if="orderInfo.task_detail && orderInfo.task_detail.description">
						<text>{{orderInfo.task_detail.description}}</text>
					</view> -->
					<view class="store-images" v-if="orderInfo.task_detail && orderInfo.task_detail.pic_url && orderInfo.task_detail.pic_url.length > 0">
						<image v-for="(img, index) in orderInfo.task_detail.pic_url" :key="index" :src="img" mode="aspectFill" @click="previewImage(index)"></image>
					</view>
					<view class="divider"></view>
					<view class="detail-item">
						<view class="item-dot"></view>
						<view class="item-label">服务时效：</view>
						<view class="item-value" v-if="orderInfo.service_time_type === 'before_deadline'">
							{{orderInfo.deadline}}前完成
						</view>
						<view class="item-value" v-else-if="orderInfo.service_time_type === 'time_range'">
							{{orderInfo.range_start_date}} 至 {{orderInfo.range_end_date}}
						</view>
					</view>
					<view class="divider"></view>

					<!-- 建议骑手上门时间段 -->
					<view class="detail-item" v-if="orderInfo.recommended_service_time_start && orderInfo.recommended_service_time_end">
						<view class="item-dot"></view>
						<view class="item-label">建议骑手上门时间段：</view>
						<view class="item-value">
							{{ getRecommendedTimeDisplay() }}
						</view>
					</view>
					<view class="divider" v-if="orderInfo.recommended_service_time_start && orderInfo.recommended_service_time_end"></view>

					<!-- 订单备注 -->
					<view class="detail-item" v-if="orderInfo.task_detail && orderInfo.task_detail.additional_notes">
						<view class="item-dot"></view>
						<view class="item-label">订单备注：</view>
						<view class="item-value order-notes">
							{{ orderInfo.task_detail.additional_notes }}
						</view>
					</view>
					<view class="divider" v-if="orderInfo.task_detail && orderInfo.task_detail.additional_notes"></view>
					
					<!-- 价格明细（可展开） -->
					<view class="detail-item price-detail-toggle" @click="togglePriceDetail">
						<view class="item-dot"></view>
						<view class="item-label">价格明细</view>
						<view class="price-toggle">
							<!-- <text class="price-summary">¥{{orderInfo.order_amount}}</text> -->
							<view class="toggle-icon" :class="{ 'expanded': showPriceDetail }">
								<uni-icons type="bottom" size="16" color="#2492F2"></uni-icons>
							</view>
						</view>
					</view>
					
					<!-- 价格明细展开内容 -->
					<view class="price-detail-content" v-if="showPriceDetail">
						<view class="price-items">
							<view class="price-item">
								<text class="label">基础服务费</text>
								<text class="value">¥{{orderInfo.base_service_fee}}</text>
							</view>
							<view class="price-item">
								<text class="label">附加服务费</text>
								<text class="value">¥{{orderInfo.additional_service_fee}}</text>
							</view>
							<!-- 打赏记录 -->
							<view class="price-item" v-if="orderInfo.reward && orderInfo.reward.length > 0">
								<text class="label">打赏金额</text>
								<text class="value" style="color: #FF6B00;">¥{{ getTotalRewardAmount() }}</text>
							</view>
							<!-- 退款信息 -->
							<view class="price-item refund" v-if="orderInfo.payment_status === 'refunded'">
								<text class="label">退款金额</text>
								<text class="value" style="color: #E74C3C;">-¥{{orderInfo.refund_amount || orderInfo.order_amount}}</text>
							</view>
							<view class="price-item total">
								<text class="label">合计</text>
								<text class="value">¥{{orderInfo.order_amount}}</text>
							</view>
						</view>
					<!-- 打赏详情 -->
					<view class="reward-detail" v-if="orderInfo.reward && orderInfo.reward.length > 0">
						<view class="reward-detail-title">
							<text class="reward-emoji">💰</text>
							<text>打赏记录</text>
						</view>
						<view class="reward-list">
							<view v-for="(item, index) in getSuccessfulRewards()" :key="index" class="reward-item">
								<text class="reward-amount">¥{{ item.order_amount }}</text>
								<text class="reward-time">{{ formatRewardTime(item.created_at || item.updated_at) }}</text>
							</view>
						</view>
					</view>
					<!-- 退款详情 -->
					<view class="refund-detail" v-if="orderInfo.payment_status === 'refunded'">
						<view class="refund-detail-title">
							<text class="refund-emoji">💸</text>
							<text>退款信息</text>
						</view>
						<view class="refund-info">
							<view class="refund-info-item">
								<text class="info-label">退款状态：</text>
								<text class="info-value refund-status">{{ orderInfo.refund_status === 'full' ? '全额退款' : orderInfo.refund_status === 'partial' ? '部分退款' : '已退款' }}</text>
							</view>
							<view class="refund-info-item">
								<text class="info-label">退款金额：</text>
								<text class="info-value refund-amount">¥{{ orderInfo.refund_amount || orderInfo.order_amount }}</text>
							</view>
							<view class="refund-info-item" v-if="orderInfo.refund_time">
								<text class="info-label">退款时间：</text>
								<text class="info-value">{{ orderInfo.refund_time }}</text>
							</view>
							<view class="refund-info-item" v-if="orderInfo.refund_reason">
								<text class="info-label">退款原因：</text>
								<text class="info-value">{{ orderInfo.refund_reason }}</text>
							</view>
						</view>
					</view>
				</view>
				
				<view class="divider"></view>
				</view>
					<!-- 模糊效果层 -->
					<view class="blur-mask" v-if="!isFullyExpanded"></view>
				</view>

				<!-- 操作按钮区域 - 已隐藏 -->
				<!-- <view v-if="isFullyExpanded && (orderInfo.status === 'waiting' || orderInfo.status === 'assigned')" class="action-buttons-above-expand">
					<button class="btn edit-btn" @click="editOrder">修改信息</button>
					<button class="btn cancel-btn" @click="cancelOrder">取消订单</button>
				</view> -->

				<!-- 展开/收起按钮 -->
				<view class="expand-btn" @click="toggleFullExpand">
					<view class="expand-btn-content">
						<text class="expand-text">{{ isFullyExpanded ? '收起' : '展开' }}</text>
						<view class="expand-icon" :class="{ 'expanded': isFullyExpanded }">
							<uni-icons type="bottom" size="16" color="#2492F2"></uni-icons>
						</view>
					</view>
				</view>
		</view>


			<!-- 底部按钮 - 已隐藏 -->
			<!-- <view v-if="orderInfo.task_assignment && orderInfo.task_assignment.status === 'finished'" class="bottom-button">
				<button class="btn confirm-btn" v-if="orderInfo.status === 'finished'" @click="confirmOrder">确认完成</button>
			</view> -->

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</view>

		<!-- 取消订单确认弹窗 -->
		<view class="cancel-modal-mask" v-if="showCancelModal" @click="closeCancelModal"></view>
		<view class="cancel-modal-container" v-if="showCancelModal">
			<!-- 弹窗头部带卡通人物 -->
			<view class="cancel-modal-top">
				<image class="modal-character" src="https://ccpt.qiniu.0871.cn/qxyy-qs.png" mode="widthFix"></image>
			</view>

			<!-- 弹窗内容 -->
			<view class="cancel-modal-content">
				<!-- 取消原因选择列表 -->
				<view class="cancel-reason-list">
					<text class="reason-list-title">取消原因：（必选）</text>
					<view class="reason-options">
						<radio-group @change="onReasonChange">
							<label class="reason-option-item" v-for="(reason, index) in cancelReasonOptions" :key="index">
								<radio
									:value="reason.value"
									:checked="selectedCancelReason === reason.value"
									color="#2492F2"
								/>
								<text class="reason-text">{{ reason.text }}</text>
							</label>
						</radio-group>
					</view>
				</view>
			</view>

			<!-- 弹窗底部按钮 -->
			<view class="cancel-modal-footer">
				<view class="cancel-modal-btn cancel" @click="handleCancelAction">狠心取消</view>
				<view class="cancel-modal-btn confirm" @click="handleConfirmAction">调度催派</view>
			</view>
		</view>

		<!-- 二次确认弹窗 -->
		<view class="confirm-cancel-mask" v-if="showConfirmCancelModal" @click="closeConfirmCancelModal"></view>
		<view class="confirm-cancel-container" v-if="showConfirmCancelModal">
			<!-- 弹窗头部带卡通人物 -->
			<view class="confirm-cancel-top">
				<image class="modal-character" src="https://ccpt.qiniu.0871.cn/tjcgtb.png" mode="widthFix"></image>
			</view>

			<!-- 弹窗内容 -->
			<view @click="copy_wechat()" class="confirm-cancel-content">
				<image class="content-image" src="https://ccpt.qiniu.0871.cn/tjcg-zj.png" mode="widthFix"></image>
			</view>

			<!-- 弹窗底部按钮 -->
			<view class="confirm-cancel-footer">
				<view class="confirm-cancel-btn withdraw" @click="closeConfirmCancelModal">撤回申请</view>
				<view class="confirm-cancel-btn confirm" @click="submitCancelOrder">确认</view>
			</view>
		</view>

		<!-- 确认完成订单弹窗 -->
		<AuthModal
			:show="showConfirmModal"
			:title="confirmModalData.title"
			:content="confirmModalData.content"
			:cancelText="confirmModalData.leftButton"
			:confirmText="confirmModalData.rightButton"
			:cancelSubText="confirmModalData.leftSubText"
			:confirmSubText="confirmModalData.rightSubText"
			@cancel="handleConfirmCancel"
			@confirm="handleConfirmConfirm"
		></AuthModal>

		<!-- 修改订单信息弹窗 -->
		<view class="edit-modal-mask" v-if="showEditModal" @click="closeEditModal"></view>
		<view class="edit-modal-container" v-if="showEditModal">
			<view class="edit-modal-header">
				<text class="edit-modal-title">修改订单信息</text>
				<view class="edit-modal-close" @click="closeEditModal">×</view>
			</view>
			<view class="edit-modal-content">
				<!-- 订单备注 -->
				<view class="edit-form-group">
					<text class="edit-form-label">订单备注</text>
					<textarea
						v-model="editForm.additional_notes"
						placeholder="请输入订单备注信息"
						class="edit-form-textarea"
						maxlength="200"
					></textarea>
				</view>

				<!-- SN码 -->
				<view class="edit-form-group">
					<text class="edit-form-label">SN码</text>
					<view class="sn-code-list">
						<view v-for="(item, index) in editForm.sn_mac_code" :key="index" class="sn-code-item">
							<input
								v-model="item.value"
								:placeholder="`请输入第${index + 1}个SN码`"
								class="edit-form-input"
								maxlength="50"
							/>
							<view class="remove-sn-btn" @click="removeSN(index)" v-if="editForm.sn_mac_code.length > 1">×</view>
						</view>
						<view class="add-sn-btn" @click="addSN">+ 添加SN码</view>
					</view>
				</view>

				<!-- 建议骑手上门时间段 -->
				<view class="edit-form-group">
					<text class="edit-form-label">建议骑手上门时间段</text>
					<view class="time-range-selector">
						<view class="time-item">
							<text class="time-label">开始时间</text>
							<picker mode="time" :value="editForm.recommended_service_time_start" @change="onStartTimeChange">
								<view class="time-picker">
									{{ editForm.recommended_service_time_start || '选择时间' }}
								</view>
							</picker>
						</view>
						<view class="time-item">
							<text class="time-label">结束时间</text>
							<picker mode="time" :value="editForm.recommended_service_time_end" @change="onEndTimeChange">
								<view class="time-picker">
									{{ editForm.recommended_service_time_end || '选择时间' }}
								</view>
							</picker>
						</view>
					</view>
				</view>

			<!-- 设备位置 -->
			<view class="edit-form-group">
				<text class="edit-form-label">设备位置</text>
				<view class="device-outside-selector">
					<view
						class="device-option"
						:class="{active: editForm.device_outside === true}"
						@click="editForm.device_outside = true"
					>
						<text>外摆</text>
					</view>
					<view
						class="device-option"
						:class="{active: editForm.device_outside === false}"
						@click="editForm.device_outside = false"
					>
						<text>非外摆</text>
					</view>
					</view>
				</view>

				<!-- 订单过期时间 -->
				<view class="edit-form-group">
					<text class="edit-form-label">订单过期时间</text>
					<view class="datetime-selector">
						<view class="datetime-item">
							<text class="datetime-label">日期</text>
							<picker mode="date" :value="editForm.deadlineDate" @change="onDeadlineDateChange">
								<view class="time-picker">
									{{ editForm.deadlineDate || '选择日期' }}
								</view>
							</picker>
						</view>
						<view class="datetime-item">
							<text class="datetime-label">时间</text>
							<picker mode="time" :value="editForm.deadlineTime" @change="onDeadlineTimeChange">
								<view class="time-picker">
									{{ editForm.deadlineTime || '选择时间' }}
								</view>
							</picker>
						</view>
					</view>
				</view>
		</view>
		<view class="edit-modal-footer">
			<view class="edit-modal-btn cancel" @click="closeEditModal">退出</view>
			<view class="edit-modal-btn confirm" @click="saveOrderChanges" :class="{disabled: isSaving}">
				{{ isSaving ? '保存中...' : '保存' }}
			</view>
		</view>
		</view>

		<!-- 底部悬浮操作按钮 -->
		<view class="bottom-float-action" v-if="!showRewardModal && !showCancelModal && !showEditModal && !showConfirmModal && !showConfirmCancelModal && orderInfo.status !== 'completed'">
			<view class="action-button" @click="handleOrderAction">
				<text class="action-text">操作订单</text>
			</view>
		</view>

		<!-- 悬浮聊天图标 -->
		<FloatingChatIconUser 
			:orderId="orderId" 
			:orderTitle="`${orderInfo.city_name || ''}${orderInfo.district_name || ''} ${orderId}`" />
		
		<!-- 打赏弹窗 -->
		<RewardModal 
			:show="showRewardModal" 
			@close="closeRewardModal"
			@confirm="handleRewardConfirm"
		/>
		
		<!--骑手预估时间弹窗-->
		<view class="predict-modal-mask" v-if="showPredictModal" @click="closePredictModal"></view>
		<view class="predict-modal-container" v-if="showPredictModal">
			<image src="https://ccpt.qiniu.0871.cn/riderend/toubu.png" mode="widthFix" class="predict-header-img"></image>
			<view class="popup-content-z">
				<view class="popup-bj">
					<view class="text-2 dis_flex jus-cen">您的订单预计<text class="highlight-time">{{orderInfo.task_assignment.predict_complete_type}}</text>完单！</view>
					<view class="popup-tips">
						<text class="tips-text">注：反馈供参考，可能有变！</text>
					</view>
				</view>
			</view>
			<view class="predict-modal-close" @click="closePredictModal">
				<text>我知道了</text>
			</view>
		</view>
	
		
		<!-- 时间轴弹窗 -->
		<view class="predict-modal-mask" v-if="showTimeline" @click="showTimeline=false"></view>
		<view class="predict-modal-container timeline-modal" v-if="showTimeline" style="background: none;">
			<uni-icons size="32" color="#fff" type="close" @click="showTimeline=false" style="position: absolute; right: 0px; top: 0px;"></uni-icons>
			<image src="https://ccpt.qiniu.0871.cn/jdjl1.png" mode="widthFix" style="vertical-align: top;"></image>
		  <view class="modal-content" style="padding-top: 0; margin-top: -1px;">
			<view class="timeline-container" style="padding: 8px;">
			  <view
				class="timeline-item"
				v-for="(event, index) in getSortedTimelineEvents()"
				:key="index"
			  >
				<view class="timeline-dot" :class="event.dotClass">
				  <text :class="event.iconClass" v-if="event.icon">{{ event.icon }}</text>
				</view>
				<view class="timeline-content">
				  <text class="timeline-title" :class="event.titleClass">{{ event.title }}</text>
				  <text class="timeline-time" v-if="!event.title.includes('订单返回大厅')" :class="{ pending: !event.time }">
					{{ event.time ? formatDateTime(event.time) : event.pendingText || '待完成' }}
				  </text>
				  <text class="timeline-detail" v-if="event.detail">{{ event.detail }}</text>
				</view>
			  </view>
			  
			</view>
		  </view>
		</view>
	
	
	</view>
</template>

<script>
	import NavBar from '@/components/NavBar.vue'
	import AuthModal from '@/components/AuthModal/index.vue'
	import FloatingChatIconUser from '@/components/FloatingChatIconUser/index.vue'
	import RewardModal from '@/components/RewardModal/index.vue'
	import md5 from 'md5'

	export default {
		components: {
			NavBar,
			AuthModal,
			FloatingChatIconUser,
			RewardModal
		},
		data() {
			return {
				newStatus: "",
				// 放弃订单信息
				showTimeline: false,
				// active: 1,
				// list1: [{
				// 	title: '事件一'
				// }, {
				// 	title: '事件二'
				// }, {
				// 	title: '事件三'
				// }, {
				// 	title: '事件四'
				// }],
				navBarHeight: 0,
				orderId: '',
			orderInfo: {
				task_id: '',
				status: '',
				task_type_name: '',
				contact_name: '',
				contact_phone: '',
				order_amount: 0,
				brand: '',
				detail: '',
				item_number: 0,
				sn_mac_code: [],
				store_name: '',
				province_name: '',
				city_name: '',
				district_name: '',
				shop_address: '',
				address: '',
				pic_url: [],
				description: '',
				service_time_type: '',
				deadline: '',
				range_start_date: '',
				range_end_date: '',
				base_amount: 0,
				extra_amount: 0,
				latitude: 0,
				longitude: 0
			},
				isFullyExpanded: false,
				isFeedbackExpanded: false,
				showPriceDetail: false,
				showCancelModal: false,
				mapMarkers: [], // 地图标记点
				cancelModalData: {
					title: '',
					content: '',
					leftButton: '',
					rightButton: '',
					leftSubText: '',
					rightSubText: '',
					type: '' // 'waiting' 或 'assigned'
				},
				showConfirmModal: false,
				confirmModalData: {
					title: '确认完成提示',
					content: '确认后订单进入已完成状态，佣金将结算给骑手，是否继续？',
					leftButton: '取消',
					rightButton: '确认',
					leftSubText: '',
					rightSubText: ''
				},
				cancelReason: '', // 取消原因
				selectedCancelReason: '', // 选中的取消原因
				showConfirmCancelModal: false, // 二次确认弹窗
				cancelReasonOptions: [
					{ value: '长时间无骑手接单', text: '长时间无骑手接单' },
					{ value: '已安排人员上门完成维护', text: '已安排人员上门完成维护' },
					{ value: '设备正常或有归还宝', text: '设备正常或有归还宝' },
					{ value: '信息错误，重新下单', text: '信息错误，重新下单' }
				],
				// 修改订单相关
				showEditModal: false,
				isSaving: false,
				editForm: {
					additional_notes: '',
					sn_mac_code: [{ value: '' }],
					recommended_service_time_start: '',
					recommended_service_time_end: '',
					device_outside: null,
					deadline: '',
					deadlineDate: '',
					deadlineTime: ''
				},
				// 打赏相关
				showRewardModal: false,
				// 预估时间弹窗
				showPredictModal: false
			}
		},
		computed: {
			// 判断是否有附加服务
			hasExtraServices() {
				if (!this.orderInfo || !this.orderInfo.task_detail) {
					return false;
				}
				const taskDetail = this.orderInfo.task_detail;
				return !!(taskDetail.extra_task_1 || taskDetail.extra_task_2 || 
					taskDetail.extra_task_3 || taskDetail.extra_task_4 || 
					taskDetail.extra_task_5 || taskDetail.extra_task_6);
			}
		},
		onLoad(options) {
			// 计算导航栏高度
			const systemInfo = uni.getSystemInfoSync()
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			this.navBarHeight = menuButtonInfo.bottom + 12

			// 获取订单ID
			if (options.id) {
				this.orderId = options.id
				this.loadOrderDetail()
			}
		},

	onShow() {
		// 页面显示时的处理
	},
		methods: {
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
			// 获取时间轴数据
			getTimelineData() {
			  if (!this.orderInfo) {
				return {
				  assigned_at: null,
				  finished_at: null,
				  abandoned_at: null,
				  canceled_at: null,
				  refunded_at: null,
				  started_at: null,
				  timeout_notification: false,
				  assignments: []
				};
			  }
		
			  // 如果有timelind对象，使用timelind数据
			  if (this.orderInfo.timelind) {
				const timelind = this.orderInfo.timelind;
				const result = {
				  assigned_at: null,
				  finished_at: timelind.finished_at,
				  abandoned_at: null,
				  canceled_at: null,
				  refunded_at: null,
				  started_at: null,
				  timeout_notification: timelind.timeout_notification || false,
				  assignments: timelind.assignments || []
				};
		
				// 从assignments数组中获取分配信息
				if (timelind.assignments && timelind.assignments.length > 0) {
				  const assignment = timelind.assignments[0]; // 取第一个分配记录
				  result.assigned_at = assignment.assigned_at;
				  result.abandoned_at = assignment.abandoned_at;
				  result.finished_at = assignment.finished_at || result.finished_at;
				}
		
				return result;
			  }
		
			  // 兼容原有数据结构
			  return {
				assigned_at: this.orderInfo.assigned_at || (this.orderInfo.task_assignment && this.orderInfo.task_assignment.assigned_at) || this.orderInfo.accepted_at,
				finished_at: (this.orderInfo.task_assignment && this.orderInfo.task_assignment.finished_at) || this.orderInfo.finished_at,
				abandoned_at: (this.orderInfo.task_assignment && this.orderInfo.task_assignment.abandoned_at) || null,
				canceled_at: this.orderInfo.canceled_at || null,
				refunded_at: this.orderInfo.refunded_at || null,
				started_at: (this.orderInfo.task_assignment && this.orderInfo.task_assignment.started_at) || null,
				timeout_notification: this.orderInfo.timeout_notification || false,
				assignments: []
			  };
			},
			// 获取按时间排序的时间轴事件
			getSortedTimelineEvents() {
			  if (!this.orderInfo) return [];
		
			  const timelineData = this.getTimelineData();
			  const events = [];
		
			  // 1. 客户下单
			  if (this.orderInfo.task_date) {
				let orderDetail = '订单已创建，等待骑手接单';
		
				// 添加客户信息
				// if (this.orderInfo.name && this.orderInfo.phone_number) {
				//   orderDetail = `客户${this.orderInfo.name} (${this.orderInfo.phone_number})下单`;
				// }
		
				// // 添加服务类型信息
				// if (this.orderInfo.task_name) {
				//   orderDetail += `\n服务类型：${this.orderInfo.task_name}`;
				// }
		
				// // 添加订单金额
				// if (this.orderInfo.order_amount) {
				//   orderDetail += `\n订单金额：¥${this.orderInfo.order_amount}`;
				// }
		
				// // 添加服务地址
				// if (this.orderInfo.task_detail && this.orderInfo.task_detail.store_name) {
				//   orderDetail += `\n门店：${this.orderInfo.task_detail.store_name}`;
				// }
		
				events.push({
				  time: this.orderInfo.task_date,
				  title: '客户下单',
				  detail: orderDetail,
				  dotClass: 'active',
				  iconClass: 'timeline-check',
				  icon: '✓'
				});
			  }
		
			  // 2. 遍历所有的assignments，显示接单和放弃记录
			  if (timelineData.assignments && timelineData.assignments.length > 0) {
				timelineData.assignments.forEach((assignment, index) => {
				  // 获取当前assignment对应的骑手信息
				  let riderInfo = null;
				  
				  
				  // 如果缓存中没有，从多个可能的位置查找骑手信息
				  if (!riderInfo && this.orderInfo.timelind && this.orderInfo.timelind.riders) {
					// 如果timelind中有riders数组
					riderInfo = this.orderInfo.timelind.riders.find(r => r.service_member_id === assignment.service_member_id);
				  } else if (!riderInfo && this.orderInfo.timelind && this.orderInfo.timelind.service_members) {
					// 如果timelind中有service_members数组
					riderInfo = this.orderInfo.timelind.service_members.find(r => r.service_member_id === assignment.service_member_id);
				  }
				  
				  // 如果没找到，检查assignment本身是否包含骑手信息
				  if (!riderInfo && assignment.service_member) {
					riderInfo = assignment.service_member;
				  }
				  
				  // 如果还是没找到，检查是否是当前骑手
				  if (!riderInfo) {
					const currentRider = this.orderInfo.riderDetail || this.orderInfo.service_member;
					if (currentRider && currentRider.service_member_id === assignment.service_member_id) {
					  riderInfo = currentRider;
					}
				  }
		
				  // 2.1 骑手接单
				  if (assignment.assigned_at) {
					let riderDetail = '';
		
					// 显示详细骑手信息
					riderDetail = `骑手：${riderInfo ? (riderInfo.contact_person || riderInfo.real_name || '未知') : '未知'}`;
					
					// 添加电话信息
					if (riderInfo && riderInfo.phone_number) {
					  riderDetail += ` (${riderInfo.phone_number})`;
					}
		
					// 添加等级信息
					if (riderInfo && riderInfo.level) {
					  riderDetail += ` [L${riderInfo.level}]`;
					}
		
					// 添加完成任务数量
					if (riderInfo && riderInfo.total_completed_tasks_count !== undefined) {
					  riderDetail += ` 已完成${riderInfo.total_completed_tasks_count}单`;
					}
		
					events.push({
					  time: assignment.assigned_at,
					  title: timelineData.assignments.length > 1 ? `骑手接单 ${index + 1}` : '骑手接单',
					  detail: riderDetail,
					  dotClass: 'active',
					  iconClass: 'timeline-check',
					  icon: '✓'
					});
				  }
		
				  // 2.2 骑手放弃订单
				  if (assignment.abandoned_at) {
					let abandonDetail = '';
		
					// 显示详细骑手信息
					abandonDetail = `骑手：${riderInfo ? (riderInfo.contact_person || riderInfo.real_name || '未知') : '未知'}`;
					
					// 添加电话信息
					if (riderInfo && riderInfo.phone_number) {
					  abandonDetail += ` (${riderInfo.phone_number})`;
					}
		
					// 添加等级信息
					if (riderInfo && riderInfo.level) {
					  abandonDetail += ` [L${riderInfo.level}]`;
					}
		
					// 添加完成任务数量
					if (riderInfo && riderInfo.total_completed_tasks_count !== undefined) {
					  abandonDetail += ` 已完成${riderInfo.total_completed_tasks_count}单`;
					}
		
					// 添加放弃原因
					if (assignment.abandon_reason) {
					  abandonDetail += `\n放弃原因：${assignment.abandon_reason}`;
					}
		
					events.push({
					  time: assignment.abandoned_at,
					  title: timelineData.assignments.length > 1 ? `骑手放弃订单 ${index + 1}` : '骑手放弃订单',
					  detail: abandonDetail,
					  dotClass: 'abandon-dot',
					  iconClass: 'timeline-abandon',
					  icon: '!'
					});
				  }
				});
			  }
		
			  // 3. 任务开始
			  if (timelineData.started_at) {
				const riderInfo = this.orderInfo.riderDetail || this.orderInfo.service_member;
				let startDetail = '骑手已开始执行任务';
		
				if (riderInfo && riderInfo.contact_person) {
				  startDetail = `${riderInfo.contact_person}已开始执行任务`;
				}
		
				events.push({
				  time: timelineData.started_at,
				  title: '任务开始',
				  detail: startDetail,
				  dotClass: 'active',
				  iconClass: 'timeline-check',
				  icon: '✓'
				});
			  }
		
			  // 5. 任务完成反馈
			  if (timelineData.finished_at) {
				const riderInfo = this.orderInfo.riderDetail || this.orderInfo.service_member;
				let finishDetail = '骑手已提交完成反馈，等待客户确认';
		
				// if (riderInfo && riderInfo.contact_person) {
				//   finishDetail = `${riderInfo.contact_person}已提交完成反馈，等待客户确认`;
				// }
		
				// // 如果有反馈内容，添加到详情中
				// if (this.orderInfo.task_assignment && this.orderInfo.task_assignment.after_detail) {
				//   finishDetail += `\n反馈内容：${this.orderInfo.task_assignment.after_detail}`;
				// }
		
				events.push({
				  time: timelineData.finished_at,
				  title: '任务完成反馈',
				  detail: finishDetail,
				  dotClass: 'active',
				  iconClass: 'timeline-check',
				  icon: '✓'
				});
			  } else if (this.orderInfo.status === 'completed' || this.orderInfo.status === 'finished') {
				events.push({
				  time: null,
				  title: '任务完成反馈',
				  detail: '',
				  dotClass: '',
				  iconClass: '',
				  icon: '',
				  pendingText: '待完成'
				});
			  }
		
			  // 6. 客户确认完成
			  if (this.orderInfo.completed_at) {
				events.push({
				  time: this.orderInfo.completed_at,
				  title: '客户确认完成',
				  detail: '客户已确认任务完成',
				  dotClass: 'active',
				  iconClass: 'timeline-check',
				  icon: '✓'
				});
			  } else if (this.orderInfo.status === 'finished') {
				events.push({
				  time: null,
				  title: '客户确认完成',
				  detail: '',
				  dotClass: '',
				  iconClass: '',
				  icon: '',
				  pendingText: '待确认'
				});
			  }
		
			  // 7. 用户评价
			  if (this.orderInfo.review && this.orderInfo.review.created_at) {
				let reviewDetail = '';
				if (this.orderInfo.review.rating) {
				  reviewDetail = `评分：${this.orderInfo.review.rating}分`;
				  if (this.orderInfo.review.comment) {
					reviewDetail += `，${this.orderInfo.review.comment}`;
				  }
				}
				events.push({
				  time: this.orderInfo.review.created_at,
				  title: '用户评价',
				  detail: reviewDetail,
				  dotClass: 'active',
				  iconClass: 'timeline-check',
				  icon: '✓'
				});
			  }
		
			  // 8. 订单取消
			  if ((this.orderInfo.status === 'canceled' || this.orderInfo.status === 'cancel') && timelineData.canceled_at) {
				events.push({
				  time: timelineData.canceled_at,
				  title: '订单取消',
				  detail: '订单已被取消',
				  dotClass: 'cancel-dot',
				  iconClass: 'timeline-cancel',
				  icon: '×'
				});
			  }
		
			  // 9. 退款处理
			  if (this.orderInfo.payment_status === 'refunded' || timelineData.refunded_at) {
				const refundTime = timelineData.refunded_at || this.orderInfo.refunded_at || this.orderInfo.updated_at;
		
				let refundDetail = `退款金额：¥${this.orderInfo.order_amount || '0.00'}`;
		
				// 添加退款状态
				if (this.orderInfo.payment_status === 'refunded') {
				  refundDetail += ' (已退款)';
				} else {
				  refundDetail += ' (退款处理中)';
				}
		
				// 添加原订单金额对比
				const originalAmount = this.calculateOriginalAmount();
				if (originalAmount && originalAmount !== this.orderInfo.order_amount) {
				  refundDetail += `\n原订单金额：¥${originalAmount}`;
				}
		
				// 添加退款方式信息
				if (this.orderInfo.transaction_id) {
				  refundDetail += `\n交易号：${this.orderInfo.transaction_id}`;
				}
		
				events.push({
				  time: refundTime,
				  title: '退款处理',
				  detail: refundDetail,
				  dotClass: 'refund-dot',
				  iconClass: 'timeline-refund',
				  icon: '¥'
				});
			  }
		
			  // 10. 超时提醒
			  if (timelineData.timeout_notification) {
				let timeoutDetail = '订单已超过预期完成时间';
		
				// 添加时效信息
				if (this.orderInfo.time_limit) {
				  timeoutDetail += `\n原定时效：${this.orderInfo.time_limit}小时`;
				}
		
				// 添加截止时间
				if (this.orderInfo.deadline) {
				  timeoutDetail += `\n截止时间：${this.orderInfo.deadline}`;
				}
		
				events.push({
				  time: this.orderInfo.updated_at,
				  title: '超时提醒',
				  detail: timeoutDetail,
				  dotClass: 'timeout-dot',
				  iconClass: 'timeline-timeout',
				  icon: '⚠'
				});
			  }
		
			  // 按时间排序，将没有时间的事件放到最后
			  let arr = events.sort((a, b) => {
				if (!a.time && !b.time) return 0;
				if (!a.time) return 1;
				if (!b.time) return -1;
				return new Date(a.time) - new Date(b.time);
			  });
			  
			  this.newStatus = arr[arr.length - 1].title
			  if(this.newStatus == '骑手放弃订单'){
				events.push({
				  title: '订单返回大厅，骑手重新接单',
				  dotClass: 'timeout-back',
				  iconClass: 'timeline-timeout',
				  titleClass: 'back-title',
				  icon: '✓'
				});
			  }
			  return arr
			},
		
			// 骑手预估弹窗
			predict_popup(){
				// 只有进行中的订单且预估时间是今天或明天的时间段时才展示
				if (this.orderInfo.status === 'assigned' &&
					this.orderInfo.task_assignment &&
					this.orderInfo.task_assignment.predict_complete_type) {

					const predictTime = this.orderInfo.task_assignment.predict_complete_type;

					// 判断是否包含"今天"或"明天"关键词
					const isTodayOrTomorrow = predictTime.includes('今天') ||
											  predictTime.includes('明天') ||
											  predictTime.includes('3小时');

					if (isTodayOrTomorrow) {
						this.showPredictModal = true;
					}
				}
			},
			// 关闭预估弹窗
			closePredictModal(){
				this.showPredictModal = false
			},
			// 加载订单详情
			async loadOrderDetail() {
				try {
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
					
					// 构建请求参数
					const params = {
						task_id: this.orderId,
						user_id: userInfo.user_id,
						sign: sign
					}

			// 调用订单详情接口
			const res = await this.$request('task/info', params, 'POST')
			console.log('订单详情:', res)

			if (res.code === 200 && res.data) {
				this.orderInfo = res.data

				// Check if order has pending refund request
				if (this.orderInfo.refund_request === 1) {
					// Delay slightly to ensure DOM is ready
					setTimeout(() => {
						this.showConfirmCancelModal = true;
					}, 300);
				}

				// 更新地图标记
				if (this.orderInfo.latitude && this.orderInfo.longitude) {
					this.mapMarkers = [{
						id: 1,
						latitude: this.orderInfo.latitude,
						longitude: this.orderInfo.longitude,
						iconPath: 'https://ccpt.qiniu.0871.cn/tb11.png',
						width: 30,
						height: 30,
						title: this.orderInfo.task_detail ? this.orderInfo.task_detail.store_name : '服务门店'
					}]
				}
				
				this.getSortedTimelineEvents();

				// 显示骑手预估完单时间弹窗
				this.predict_popup()
				} else {
					uni.showToast({
						title: res.message || '获取订单详情失败',
						icon: 'none'
					})
				}
				} catch (err) {
					console.error('获取订单详情失败:', err)
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
				}
			},
		// 获取状态文本
		getStatusText(order) {
			// 如果传入的是字符串（为了兼容性），直接返回旧逻辑
			if (typeof order === 'string') {
				const statusMap = {
					'waiting': '等待接单...',
					'assigned': '充充小哥在路上...',
					'finished_timeout': '超时完成',
					'finished': '待确认',
					'cancel': '已取消',
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
				'assigned': '充充小哥在路上...',
				'finished_timeout': '超时完成',
				'finished': '待确认',
				'cancel': '已取消',
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
			// 获取服务项文本（完整）
			getDetailText(detail) {
				if (!detail) return ''
				
				// 处理多选情况
				if (detail.includes(',')) {
					const details = detail.split(',').map(d => d.trim());
					const detailMap = {
						'bubao': '补宝',
						'goodRecycle': '好宝回收',
						'badRecycle': '坏宝回收',
						'offline_abnormal': '离线异常',
						'income_abnormal': '收入异常',
						'other_abnormal': '其他异常'
					}
					return details.map(d => detailMap[d] || d).join('、')
				}
				
				// 单选情况
				const detailMap = {
					'bubao': '补宝',
					'goodRecycle': '好宝回收',
					'badRecycle': '坏宝回收',
					'offline_abnormal': '离线异常',
					'income_abnormal': '收入异常',
					'other_abnormal': '其他异常'
				}
				return detailMap[detail] || detail
			},
			// 获取服务项文本（简化版 - 用于 .service-text）
			getSimplifiedDetailText(detail) {
				if (!detail) return ''
				
				// 处理多选情况，取第一个服务类型
				const firstDetail = detail.includes(',') ? detail.split(',')[0].trim() : detail;
				
				// 好宝回收、坏宝回收 → 显示"收宝"
				if (firstDetail === 'goodRecycle' || firstDetail === 'badRecycle') {
					return '收宝';
				}
				// 离线异常、收入异常、其他异常 → 显示"异常"
				if (firstDetail === 'offline_abnormal' || firstDetail === 'income_abnormal' || firstDetail === 'other_abnormal') {
					return '异常';
				}
				// 其他服务项保持原样
				const detailMap = {
					'bubao': '补宝'
				}
				return detailMap[firstDetail] || firstDetail
			},
			// 获取品牌class
			getBrandClass(brand) {
				const brandClassMap = {
					'meituan': 'brand-meituan',
					'guaishou': 'brand-guaishou',
					'jiedian': 'brand-jiedian',
					'xiaodian': 'brand-xiaodian',
					'zhumang': 'brand-zhumang'
				}
				return brandClassMap[brand] || 'brand-default'
			},
			// 获取服务类型class
			getServiceTypeClass(detail) {
				if (!detail) return 'supplement'
				
				// 处理多选情况，取第一个服务类型
				const firstDetail = detail.includes(',') ? detail.split(',')[0].trim() : detail;
				
				const serviceClassMap = {
					'bubao': 'supplement',
					'goodRecycle': 'recycle',
					'badRecycle': 'recycle',
					'offline_abnormal': 'offline-abnormal',
					'income_abnormal': 'income-abnormal',
					'other_abnormal': 'other-abnormal'
				}
				return serviceClassMap[firstDetail] || 'supplement'
			},
			// 格式化服务项目和数量
			formatServiceItemsWithNumber(taskDetail) {
				if (!taskDetail || !taskDetail.detail) return ''
				
				const items = []
				
				// 检查是否是多选（包含逗号）
				if (taskDetail.detail.includes(',')) {
					const details = taskDetail.detail.split(',').map(d => d.trim());
					
					// 多选时，分别显示好宝回收和坏宝回收的数量
					details.forEach(detail => {
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
					
					return items.join('、');
				} else {
					// 单选时
					const detailMap = {
						'bubao': '补宝',
						'goodRecycle': '好宝回收',
						'badRecycle': '坏宝回收',
						'offline_abnormal': '离线异常',
						'income_abnormal': '收入异常',
						'other_abnormal': '其他异常'
					}
					const itemName = detailMap[taskDetail.detail] || taskDetail.detail;
					const itemNumber = taskDetail.item_number || 0;
					return `${itemName}x${itemNumber}`;
				}
			},
			// 格式化日期时间（去掉秒）
			formatShortDate(dateTimeStr) {
				if (!dateTimeStr) return '';
				// 如果已经是短格式（没有秒），直接返回
				if (dateTimeStr.length === 16) return dateTimeStr;
				// 去掉最后的秒部分 ":00"
				return dateTimeStr.substring(0, 16);
			},
			// 格式化入驻日期
			formatEntryDate() {
				// 先尝试从 task_assignment.service_member 获取数据
				let serviceMember = null;
				if (this.orderInfo.task_assignment && this.orderInfo.task_assignment.service_member) {
					serviceMember = this.orderInfo.task_assignment.service_member;
				} else if (this.orderInfo.service_member) {
					// 如果 task_assignment.service_member 不存在，则从 service_member 获取
					serviceMember = this.orderInfo.service_member;
				}

				// 如果有 service_member 且有 created_at 字段
				if (serviceMember && serviceMember.created_at) {
					// 处理 created_at 时间格式，只返回日期部分
					const dateStr = serviceMember.created_at;
					// 如果是完整的日期时间格式，提取日期部分
					if (dateStr.includes(' ')) {
						return dateStr.split(' ')[0];
					}
					// 如果是ISO格式
					if (dateStr.includes('T')) {
						return dateStr.split('T')[0];
					}
					return dateStr;
				}

				// 如果没有数据，返回默认值
				return '未知';
			},
			// 预览图片
			previewImage(index) {
				if (!this.orderInfo.task_detail || !this.orderInfo.task_detail.pic_url) {
					return
				}
				uni.previewImage({
					urls: this.orderInfo.task_detail.pic_url,
					current: index,
					indicator: 'number'
				})
			},
			previewFeedbackImage(index) {
				if (!this.orderInfo.task_assignment || !this.orderInfo.task_assignment.after_pic_url) {
					return;
				}
				uni.previewImage({
					urls: this.orderInfo.task_assignment.after_pic_url,
					current: index,
					indicator: 'number'
				});
			},
			// 获取反馈图片标签
			getFeedbackImageLabel(index) {
				const labels = ['到店打卡', '维护前', '维护后', '仓宝状态确认', '其他反馈'];
				return labels[index] || `图片${index + 1}`;
			},
			goHome() {
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
			// 取消订单
			cancelOrder() {
				// 显示取消确认弹窗（新版设计）
				this.selectedCancelReason = ''; // 重置选中的取消原因
				// 稍微延迟显示弹窗，确保操作菜单已关闭
				setTimeout(() => {
					this.showCancelModal = true;
				}, 100);
			},

			// 处理单选框组变化
			onReasonChange(e) {
				this.selectedCancelReason = e.detail.value;
				this.cancelReason = e.detail.value; // 同步更新旧的cancelReason字段
			},

			// 显示取消确认弹窗
			showCancelConfirm(type) {
				if (type === 'waiting') {
					// 情况①：下单未接单
					this.cancelModalData = {
						title: '温馨提示！',
						content: '充充骑手将在订单时效内稍后接单，调度已跟进，建议再等等哦！',
						leftButton: '狠心取消',
						rightButton: '调度催派',
						leftSubText: '',
						rightSubText: '',
						type: 'waiting'
					};
				} else if (type === 'assigned') {
					// 情况②：骑手已接单
					this.cancelModalData = {
						title: '特别提醒！',
						content: '您的订单已被骑手接单，小哥正在处理的路上。取消可能扣取一定比例费用补贴给骑手，不合算哦！',
						leftButton: '仍要取消',
						rightButton: '我已知晓',
						leftSubText: '确认扣款！',
						rightSubText: '请调度跟进！',
						type: 'assigned'
					};
				}
				this.showCancelModal = true;
			},

			// 关闭取消确认弹窗
			closeCancelModal() {
				this.showCancelModal = false;
			},

			// 处理取消操作（左侧按钮 - 狠心取消）
			handleCancelAction() {
				// 检查是否选择了取消原因
				if (!this.selectedCancelReason) {
					uni.showToast({
						title: '请选择取消原因',
						icon: 'none'
					});
					return;
				}
				// 直接提交取消申请
				this.submitCancelApplication();
			},

			// 处理确认操作（右侧按钮 - 调度催派）
			handleConfirmAction() {
				// 调度催派
				uni.showToast({
					title: '已通知调度加急处理',
					icon: 'success'
				});
				this.closeCancelModal();
			},

			// 提交取消申请
			submitCancelApplication() {
				// 获取用户信息
				const userInfo = uni.getStorageSync('userInfo');
				const openid = uni.getStorageSync('openid');
				if (!userInfo || !userInfo.user_id || !openid) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					return;
				}

				// 构建请求参数
				const params = {
					task_id: this.orderId,
					user_id: userInfo.user_id,
					reason: this.selectedCancelReason.trim(),
					sign: 'chongchong'
				};

				// 调用取消订单接口
				uni.showLoading({
					title: '提交中...'
				});

				this.$request('task/cancel', params, 'POST').then(res => {
					uni.hideLoading();
					if (res.status === 'success') {
						// 重新加载订单详情以获取最新的 refund_request 状态
						this.loadOrderDetail().then(() => {
							// 关闭第一个弹窗，显示第二个弹窗
							this.showCancelModal = false;
							this.showConfirmCancelModal = true;
						});
					} else {
						uni.showToast({
							title: res.message || '提交失败',
							icon: 'none'
						});
					}
				}).catch(err => {
					uni.hideLoading();
					console.error('提交取消申请失败:', err);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				});
			},

			// 关闭二次确认弹窗
			closeConfirmCancelModal() {
				this.showConfirmCancelModal = false;
			},

			// 提交取消订单（最终确认）
			submitCancelOrder() {
				// 关闭第二个弹窗
				this.showConfirmCancelModal = false;
				// 清空取消原因
				this.cancelReason = '';
				this.selectedCancelReason = '';
				// 不跳转，留在当前页面
			},

			// 复制微信号
			copy_wechat() {
				const wechatId = 'agan-24h';
				uni.setClipboardData({
					data: wechatId,
					success: () => {
						uni.showToast({
							title: '微信号已复制',
							icon: 'success'
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


			// 确认完成订单
			confirmOrder() {
				this.showConfirmModal = true;
			},

			// 处理确认完成取消
			handleConfirmCancel() {
				this.showConfirmModal = false;
			},

			// 处理确认完成确认
			handleConfirmConfirm() {
				this.showConfirmModal = false;
				this.doConfirmOrder();
			},

			// 执行确认完成订单
			doConfirmOrder() {
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

				// 构建请求参数
				const params = {
					task_id: this.orderId,
					user_id: userInfo.user_id,
					sign: sign
				}

				// 调用确认完成接口
				uni.showLoading({
					title: '确认中...'
				})

				this.$request('task/complete', params, 'POST').then(res => {
					uni.hideLoading()
					if (res.code === 200) {
						// 跳转到星级评价页面
						uni.navigateTo({
							url: `/pages/order/review?task_id=${this.orderId}`
						})
					} else {
						uni.showToast({
							title: res.message || '确认失败',
							icon: 'none'
						})
					}
				}).catch(err => {
					uni.hideLoading()
					console.error('确认完成失败:', err)
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
				})
			},
			// 切换详情内容的展开/收起状态
			toggleFullExpand() {
				this.isFullyExpanded = !this.isFullyExpanded
			},
			
			// 切换完单反馈的展开/收起状态
			toggleFeedbackExpand() {
				this.isFeedbackExpanded = !this.isFeedbackExpanded
			},
			
			// 切换价格明细的展开/收起状态
			togglePriceDetail() {
				this.showPriceDetail = !this.showPriceDetail
			},
			// 格式化日期时间
			formatDateTime(dateTimeStr) {
				if (!dateTimeStr) return '未知时间';

				try {
					// 处理ISO格式的时间字符串
					const date = new Date(dateTimeStr);
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					const hours = String(date.getHours()).padStart(2, '0');
					const minutes = String(date.getMinutes()).padStart(2, '0');
					const seconds = String(date.getSeconds()).padStart(2, '0');

					return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
				} catch (e) {
					console.error('格式化时间出错:', e);
					return dateTimeStr;
				}
			},

			// 获取骑手显示名称
			getRiderDisplayName() {
				// 随机骑手名称列表
				const riderNames = [
					'小充哥',
					'充小二',
					'爱充充',
					'充充冲',
					'爱跑腿',
					'充充补宝',
					'小充充',
					'充充小二',
					'充小帅',
					'充呀冲'
				];

				// 如果没有骑手信息，返回随机名称
				if (!this.orderInfo.service_member_id) {
					const randomIndex = Math.floor(Math.random() * riderNames.length);
					return riderNames[randomIndex];
				}

				// 基于任务ID生成固定的随机索引，确保同一个骑手总是显示相同的名称
				const taskId = this.orderInfo.task_id;

				// 使用简单的哈希算法生成固定的索引
				let hash = 0;
				for (let i = 0; i < taskId.toString().length; i++) {
					const char = taskId.toString().charCodeAt(i);
					hash = ((hash << 5) - hash) + char;
					hash = hash & hash; // 转换为32位整数
				}

				const index = Math.abs(hash) % riderNames.length;
				return riderNames[index];
			},

			// 获取骑手头像
			getRiderAvatar() {
				const baseUrl = 'https://ccpt.qiniu.0871.cn/order/qishou/';

				// 基于骑手ID生成固定的随机索引，确保同一个骑手总是显示相同的头像
				const taskId = this.orderInfo.task_id;

				// 使用简单的哈希算法生成固定的索引
				let hash = 0;
				for (let i = 0; i < taskId.toString().length; i++) {
					const char = taskId.toString().charCodeAt(i);
					hash = ((hash << 5) - hash) + char;
					hash = hash & hash; // 转换为32位整数
				}

				// 生成1-26之间的数字
				const avatarNum = (Math.abs(hash) % 26) + 1;
				return `${baseUrl}${avatarNum}.png`;
			},

			// 获取骑手显示ID
			getRiderDisplayId() {
				if (!this.orderInfo.service_member) {
					return '';
				}

				const serviceMember = this.orderInfo.service_member;
				const riderId = serviceMember.service_member_id;

				if (!riderId) {
					return '';
				}

				// 生成随机后缀（2或5）
				const randomSuffix = Math.random() < 0.5 ? '2' : '5';
				return `ccqs${riderId}${randomSuffix}`;
			},

			// 获取总完单显示数量
			getTotalOrdersDisplay() {
				// 先尝试从 task_assignment.service_member 获取数据
				let serviceMember = null;
				if (this.orderInfo.task_assignment && this.orderInfo.task_assignment.service_member) {
					serviceMember = this.orderInfo.task_assignment.service_member;
				} else if (this.orderInfo.service_member) {
					// 如果 task_assignment.service_member 不存在，则从 service_member 获取
					serviceMember = this.orderInfo.service_member;
				}

				if (!serviceMember) {
					return 0;
				}

				const totalCompleted = serviceMember.total_completed_tasks_count || 0;

				// 如果总完单为0，返回0（不显示）
				if (totalCompleted === 0) {
					return 0;
				}

				// 总完单 * 5
				let displayCount = totalCompleted * 5;

				// 总完单最高不超过100，超过100使用最接近的数
				// if (displayCount > 100) {
				// 	// 找到最接近100的数，这里使用100作为上限
				// 	displayCount = 100;
				// }

				return displayCount;
			},

			// 获取建议上门时间显示
			getRecommendedTimeDisplay() {
				if (!this.orderInfo.recommended_service_time_start || !this.orderInfo.recommended_service_time_end) {
					return '';
				}

				const startTime = this.orderInfo.recommended_service_time_start;
				const endTime = this.orderInfo.recommended_service_time_end;

				// 如果开始和结束时间都是00:00，显示"全天"
				if (startTime === '00:00' && endTime === '00:00') {
					return '全天';
				}

				return `${startTime} - ${endTime}`;
			},

			// 复制订单编号
			copyOrderNumber() {
				const orderNo = this.orderInfo.task_no;
				if (!orderNo) {
					uni.showToast({
						title: '订单编号为空',
						icon: 'none'
					});
					return;
				}
				
				uni.setClipboardData({
					data: orderNo,
					success: () => {
						uni.showToast({
							title: '复制成功',
							icon: 'success'
						});
					},
					fail: (error) => {
						console.error('复制失败:', error);
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			},

			// 复制设备编码
			copyDeviceCode(code) {
				if (!code) {
					uni.showToast({
						title: '编码为空',
						icon: 'none'
					});
					return;
				}

				uni.setClipboardData({
					data: code,
					success: () => {
						uni.showToast({
							title: '设备编码已复制',
							icon: 'success'
						});
					},
					fail: (error) => {
						console.error('复制失败:', error);
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			},

			// 复制门店POI
			copyShopPoi() {
				const shopPoi = this.orderInfo.task_detail && this.orderInfo.task_detail.shop_poi;
				if (!shopPoi) {
					uni.showToast({
						title: '门店POI为空',
						icon: 'none'
					});
					return;
				}

				uni.setClipboardData({
					data: shopPoi,
					success: () => {
						uni.showToast({
							title: '门店POI已复制',
							icon: 'success'
						});
					},
					fail: (error) => {
						console.error('复制失败:', error);
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			},

			// 复制门店名称
			copyStoreName() {
				const storeName = this.orderInfo.task_detail && this.orderInfo.task_detail.store_name;
				if (!storeName) {
					uni.showToast({
						title: '门店名称为空',
						icon: 'none'
					});
					return;
				}
				
				uni.setClipboardData({
					data: storeName,
					success: () => {
						uni.showToast({
							title: '门店名称已复制',
							icon: 'success'
						});
					},
					fail: (error) => {
						console.error('复制失败:', error);
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			},

			// 复制详细地址
			copyAddress() {
				const address = `${this.orderInfo.province_name}${this.orderInfo.city_name}${this.orderInfo.district_name}${this.orderInfo.shop_address}${this.orderInfo.address}`;
				if (!address) {
					uni.showToast({
						title: '地址为空',
						icon: 'none'
					});
					return;
				}

				uni.setClipboardData({
					data: address,
					success: () => {
						uni.showToast({
							title: '地址已复制',
							icon: 'success'
						});
					},
					fail: (error) => {
						console.error('复制失败:', error);
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			},

			// 打开地图导航
			openNavigation() {
				const address = `${this.orderInfo.province_name}${this.orderInfo.city_name}${this.orderInfo.district_name}${this.orderInfo.shop_address}${this.orderInfo.address}`;
				const name = this.orderInfo.task_detail ? this.orderInfo.task_detail.store_name : '服务门店';
				
				if (!address) {
					uni.showToast({
						title: '地址信息不完整',
						icon: 'none'
					});
					return;
				}

				// 如果有经纬度信息，直接打开导航
				if (this.orderInfo.latitude && this.orderInfo.longitude) {
					uni.openLocation({
						latitude: this.orderInfo.latitude,
						longitude: this.orderInfo.longitude,
						name: name,
						address: address,
						scale: 15,
						success: () => {
							console.log('打开地图导航成功');
						},
						fail: (err) => {
							console.error('打开地图导航失败:', err);
							uni.showToast({
								title: '打开地图失败',
								icon: 'none'
							});
						}
					});
				} else {
					// 如果没有经纬度，提示用户复制地址
					uni.showModal({
						title: '提示',
						content: '暂无精确位置信息，是否复制地址？',
						success: (res) => {
							if (res.confirm) {
								uni.setClipboardData({
									data: address,
									success: () => {
										uni.showToast({
											title: '地址已复制',
											icon: 'success'
										});
									}
								});
							}
						}
					});
				}
			},

			// 修改订单信息
			editOrder() {
				// 初始化编辑表单数据
				// 处理过期时间的分离
				const deadline = this.orderInfo.deadline || '';
				let deadlineDate = '';
				let deadlineTime = '';

				if (deadline) {
					const parts = deadline.split(' ');
					deadlineDate = parts[0] || '';
					deadlineTime = parts[1] || '';
				}

				this.editForm = {
					additional_notes: this.orderInfo.task_detail?.additional_notes || '',
					sn_mac_code: this.orderInfo.task_detail?.sn_mac_code?.length > 0
						? [...this.orderInfo.task_detail.sn_mac_code]
						: [{ value: '' }],
					recommended_service_time_start: this.orderInfo.recommended_service_time_start || '',
					recommended_service_time_end: this.orderInfo.recommended_service_time_end || '',
					device_outside: this.orderInfo.task_detail?.device_outside,
					deadline: deadline,
					deadlineDate: deadlineDate,
					deadlineTime: deadlineTime
				};
				this.showEditModal = true;
			},

			// 关闭修改弹窗
			closeEditModal() {
				this.showEditModal = false;
				this.isSaving = false;
			},

			// 添加SN码
			addSN() {
				this.editForm.sn_mac_code.push({ value: '' });
			},

			// 移除SN码
			removeSN(index) {
				if (this.editForm.sn_mac_code.length > 1) {
					this.editForm.sn_mac_code.splice(index, 1);
				}
			},

			// 开始时间选择
			onStartTimeChange(e) {
				this.editForm.recommended_service_time_start = e.detail.value;
			},

			// 结束时间选择
			onEndTimeChange(e) {
				this.editForm.recommended_service_time_end = e.detail.value;
			},

			// 过期日期选择
			onDeadlineDateChange(e) {
				this.editForm.deadlineDate = e.detail.value;
				this.updateDeadline();
			},

			// 过期时间选择
			onDeadlineTimeChange(e) {
				this.editForm.deadlineTime = e.detail.value;
				this.updateDeadline();
			},

			// 更新完整的过期时间
			updateDeadline() {
				if (this.editForm.deadlineDate && this.editForm.deadlineTime) {
					this.editForm.deadline = `${this.editForm.deadlineDate} ${this.editForm.deadlineTime}`;
				} else if (this.editForm.deadlineDate) {
					this.editForm.deadline = this.editForm.deadlineDate;
				} else {
					this.editForm.deadline = '';
				}
			},

			// 保存订单修改
			async saveOrderChanges() {
				if (this.isSaving) return;

				this.isSaving = true;

				try {
					// 获取用户信息
					const userInfo = uni.getStorageSync('userInfo');
					const openid = uni.getStorageSync('openid');
					if (!userInfo || !userInfo.user_id || !openid) {
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						});
						return;
					}

					// 构建请求参数
					const params = {
						task_id: this.orderId,
						user_id: userInfo.user_id,
						additional_notes: this.editForm.additional_notes,
						sn_mac_code: this.editForm.sn_mac_code.filter(item => item.value.trim()),
						recommended_service_time_start: this.editForm.recommended_service_time_start,
						recommended_service_time_end: this.editForm.recommended_service_time_end,
						device_outside: this.editForm.device_outside,
						deadline: this.editForm.deadline,
						sign: 'chongchong'
					};

					console.log('修改订单参数:', params);

					// 调用修改接口
					const res = await this.$request('task/update/deadline', params, 'POST');

					if (res.code === 200) {
						uni.showToast({
							title: '修改成功',
							icon: 'success'
						});

						// 更新本地数据
						if (this.orderInfo.task_detail) {
							this.orderInfo.task_detail.additional_notes = this.editForm.additional_notes;
							this.orderInfo.task_detail.sn_mac_code = [...this.editForm.sn_mac_code];
							this.orderInfo.task_detail.device_outside = this.editForm.device_outside;
						}
						this.orderInfo.recommended_service_time_start = this.editForm.recommended_service_time_start;
						this.orderInfo.recommended_service_time_end = this.editForm.recommended_service_time_end;
						this.orderInfo.deadline = this.editForm.deadline;

						this.closeEditModal();
					} else {
						uni.showToast({
							title: res.message || '修改失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('修改订单失败:', error);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				} finally {
					this.isSaving = false;
				}
			},

			// 操作订单按钮点击事件
			handleOrderAction() {
				const actions = [];

				// 根据订单状态添加可用操作
				if (this.orderInfo.status === 'waiting') {
					// 待接单状态：打赏骑手、修改信息、取消订单（退款申请中时不显示）
					if(this.orderInfo.service_member_id){
						actions.push('打赏骑手');
					}
					actions.push('修改信息');
					if (this.orderInfo.refund_request !== 1) {
						actions.push('取消订单');
					}
				} else if (this.orderInfo.status === 'assigned') {
					// 作业中状态：联系骑手、打赏骑手、修改信息、取消订单（退款申请中时不显示）
					if(this.orderInfo.service_member_id){
						actions.push('联系骑手');
						actions.push('打赏骑手');
					}
					actions.push('修改信息');
					if (this.orderInfo.refund_request !== 1) {
						actions.push('取消订单');
					}
				} else if (this.orderInfo.status === 'finished') {
					// 待确认状态：确认完成
					actions.push('确认完成');
				} else if (this.orderInfo.status === 'completed') {
					// 已完成状态：查看详情
					actions.push('查看详情');
				}

				// 显示操作菜单
				uni.showActionSheet({
					itemList: actions,
					success: (res) => {
						const selectedAction = actions[res.tapIndex];

						// 执行对应操作
						switch(selectedAction) {
							case '联系骑手':
								uni.makePhoneCall({
									phoneNumber: '10086' // 这里替换为实际骑手电话
								});
								break;
							case '打赏骑手':
								this.openRewardModal();
								break;
							case '确认完成':
								this.confirmOrder();
								break;
							case '修改信息':
								this.editOrder();
								break;
							case '取消订单':
								this.cancelOrder();
								break;
							case '查看详情':
								uni.showToast({
									title: '订单已完成',
									icon: 'none'
								});
								break;
						}
					},
					fail: (err) => {
						console.log('操作菜单取消:', err);
					}
				});
			},

			// 打开打赏弹窗
			openRewardModal() {
				this.showRewardModal = true;
			},

			// 关闭打赏弹窗
			closeRewardModal() {
				this.showRewardModal = false;
				// 确保弹窗关闭后，底部操作按钮能正确显示
				this.$nextTick(() => {
					this.showRewardModal = false;
				});
			},

			// 处理打赏确认
			async handleRewardConfirm(amount) {
				try {
					// 获取用户信息
					const userInfo = uni.getStorageSync('userInfo');
					const openid = uni.getStorageSync('openid');
					if (!userInfo || !userInfo.user_id || !openid) {
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						});
						return;
					}

					// 获取骑手和服务商ID
					let service_member_id = null;
					let service_provider_id = null;
					
					if (this.orderInfo.task_assignment) {
						service_member_id = this.orderInfo.task_assignment.service_member_id;
						service_provider_id = this.orderInfo.task_assignment.service_provider_id;
					}
					
					// 如果是待接单状态，service_member_id 可以为空（作为订单激励金）
					// if (!service_member_id && this.orderInfo.status !== 'waiting') {
					// 	uni.showToast({
					// 		title: '暂无骑手接单',
					// 		icon: 'none'
					// 	});
					// 	return;
					// }

					uni.showLoading({
						title: '处理中...'
					});

					// 构建请求参数
					const params = {
						task_id: this.orderId,
						user_id: userInfo.user_id,
						openid: openid,  // 新增openid参数
						order_amount: amount,  // 参数名改为 order_amount
						service_member_id: service_member_id,  // 新增骑手ID
						service_provider_id: service_provider_id,  // 新增服务商ID
						sign: 'chongchong'
					};

					// 调用打赏接口 - 使用完整URL
					const res = await uni.request({
						url: 'https://ccpt.0871.cn/api/task/reward',
						method: 'POST',
						data: params,
						header: {
							'content-type': 'application/json'
						}
					});
					
					uni.hideLoading();

					if (res.data && res.data.code === 200) {
						// 获取支付参数
						const payRes = res.data.data.pay_res;
						
						// 调用微信支付
						this.callWechatPay(payRes, amount);
					} else {
						uni.showToast({
							title: (res.data && res.data.message) || '打赏失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error('打赏失败:', error);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				}
			},

			// 获取支付成功的打赏记录
			getSuccessfulRewards() {
				if (!this.orderInfo.reward || !Array.isArray(this.orderInfo.reward)) {
					return [];
				}
				// 只返回支付成功的打赏记录
				return this.orderInfo.reward.filter(item => item.status === 'paid');
			},

			// 计算打赏总金额
			getTotalRewardAmount() {
				const rewards = this.getSuccessfulRewards();
				if (rewards.length === 0) {
					return '0.00';
				}
				const total = rewards.reduce((sum, item) => {
					return sum + parseFloat(item.order_amount || 0);
				}, 0);
				return total.toFixed(2);
			},

			// 格式化打赏时间
			formatRewardTime(timeStr) {
				if (!timeStr) return '';
				
				try {
					// 处理带时区的时间格式 "2025-10-15T13:54:12.000000Z"
					const date = new Date(timeStr);
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					const hours = String(date.getHours()).padStart(2, '0');
					const minutes = String(date.getMinutes()).padStart(2, '0');
					
					return `${year}-${month}-${day} ${hours}:${minutes}`;
				} catch (e) {
					console.error('格式化打赏时间出错:', e);
					return timeStr;
				}
			},

			// 获取最近的打赏时间
			getLatestRewardTime() {
				const rewards = this.getSuccessfulRewards();
				if (rewards.length === 0) {
					return '';
				}
				
				// 按时间排序，获取最新的一条
				const sortedRewards = rewards.sort((a, b) => {
					const dateA = new Date(a.created_at || a.updated_at);
					const dateB = new Date(b.created_at || b.updated_at);
					return dateB - dateA; // 降序排列
				});
				
				const latestReward = sortedRewards[0];
				return this.formatRewardTime(latestReward.created_at || latestReward.updated_at);
			},

			// 调用微信支付
			callWechatPay(payParams, amount) {
				// #ifdef MP-WEIXIN
				// 微信小程序支付
				uni.requestPayment({
					provider: 'wxpay',
					timeStamp: payParams.timestamp,
					nonceStr: payParams.nonceStr,
					package: payParams.package,
					signType: payParams.signType,
					paySign: payParams.paySign,
					success: (res) => {
						console.log('支付成功', res);
						uni.showToast({
							title: `打赏${amount}元成功`,
							icon: 'success',
							duration: 2000
						});
						
						// 刷新订单详情
						setTimeout(() => {
							this.loadOrderDetail();
						}, 2000);
					},
					fail: (err) => {
						console.error('支付失败', err);
						if (err.errMsg && err.errMsg.includes('cancel')) {
							uni.showToast({
								title: '已取消支付',
								icon: 'none'
							});
						} else {
							uni.showToast({
								title: '支付失败',
								icon: 'none'
							});
						}
					}
				});
				// #endif
				
				// #ifdef H5
				// H5微信支付（公众号支付）
				if (typeof WeixinJSBridge !== 'undefined') {
					WeixinJSBridge.invoke(
						'getBrandWCPayRequest',
						{
							appId: payParams.appId,
							timeStamp: payParams.timestamp,
							nonceStr: payParams.nonceStr,
							package: payParams.package,
							signType: payParams.signType,
							paySign: payParams.paySign
						},
						(res) => {
							if (res.err_msg === 'get_brand_wcpay_request:ok') {
								uni.showToast({
									title: `打赏${amount}元成功`,
									icon: 'success',
									duration: 2000
								});
								
								// 刷新订单详情
								setTimeout(() => {
									this.loadOrderDetail();
								}, 2000);
							} else if (res.err_msg === 'get_brand_wcpay_request:cancel') {
								uni.showToast({
									title: '已取消支付',
									icon: 'none'
								});
							} else {
								uni.showToast({
									title: '支付失败',
									icon: 'none'
								});
							}
						}
					);
				} else {
					uni.showToast({
						title: '请在微信中打开',
						icon: 'none'
					});
				}
				// #endif
				
				// #ifndef MP-WEIXIN || H5
				// 其他平台暂不支持
				uni.showToast({
					title: '当前平台暂不支持支付',
					icon: 'none'
				});
				// #endif
			}
		}
	}
</script>

<style lang="scss" scoped>
	// 预估时间弹窗样式
	.predict-modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
	}

	.predict-modal-container {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 85%;
		max-width: 600rpx;
		background-color: transparent;
		border-radius: 24rpx;
		overflow: hidden;
		z-index: 1000;
		animation: modalSlideIn 0.3s ease;

		.predict-header-img {
			width: 100%;
			height: auto;
			display: block;
		}

		.predict-modal-close {
			background: #fff;
			padding: 24rpx 30rpx 30rpx;
			border-radius: 0 0 24rpx 24rpx;
			display: flex;
			justify-content: center;

			text {
				display: inline-block;
				padding: 16rpx 80rpx;
				background: linear-gradient(135deg, #4FB5FF 0%, #2492F2 100%);
				color: #fff;
				font-size: 28rpx;
				font-weight: 500;
				border-radius: 40rpx;
				box-shadow: 0 8rpx 24rpx rgba(36, 146, 242, 0.3);
			}
		}
	}

	.popup-content-z{
		.popup-bj{
			.text-2{
				text-align: center;
				font-size: 28rpx;
				font-weight: 500;
				letter-spacing: 0px;
				line-height: 1.5;
				color: rgba(36, 145, 240, 1);
				vertical-align: top;

				.highlight-time {
					color: #FF4D4F;
					text-decoration: underline;
					text-underline-offset: 6rpx;
					font-weight: 600;
				}
			}
			.popup-tips {
				margin-top: 16rpx;
				text-align: center;

				.tips-text {
					font-size: 22rpx;
					color: #FF4D4F;
					line-height: 1.5;
				}
			}
			padding: 0rpx 30rpx 25rpx 30rpx;
			height: 70px;
			opacity: 1;
			border-radius: 16rpx;
			background-size: cover;
			background-image: url('https://ccpt.qiniu.0871.cn/riderend/beij.svg');
			background-repeat: no-repeat;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}
		background: #fff;
	}
	.popup-content {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 0;
			width: 100%;

			image {
				width: 100%;
				height: auto;
				display: block;
				border-radius: 24rpx 24rpx 0 0;
			}
		}
	.status-btn {
			/* #ifndef APP-NVUE */
			display: flex;
			/* #endif */
			flex-direction: row;
			align-items: center;
			justify-content: center;
			height: 92rpx;
			margin: 30rpx;
			background-color: #007AFF;
		}
	
		.example-body {
			/* #ifndef APP-NVUE */
			display: block;
			/* #endif */
			padding: 15px;
			flex-direction: row;
		}
	.order-detail {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 40rpx;

		.content {
			padding: 0;
			margin: 20rpx 20rpx;
		}

		// 城市平均完单时效卡片容器
		.city-efficiency-wrapper {
			display: flex;
			justify-content: center;
			margin-bottom: 20rpx;

			.city-efficiency-card {
				background: linear-gradient(135deg, #E6F7FF 0%, #F0F9FF 100%);
				border-radius: 50rpx;
				padding: 20rpx 24rpx;
				box-shadow: 0 2rpx 8rpx rgba(36, 146, 242, 0.08);
				border: 2rpx solid rgba(24, 144, 255, 0.1);
				display: inline-block;

				.efficiency-content {
					display: flex;
					align-items: center;
					justify-content: center;
					flex-wrap: nowrap;
					white-space: nowrap;

					.city-area {
						display: flex;
						align-items: center;
						margin-right: 12rpx;
						padding-bottom: 4rpx;
						border-bottom: 2rpx solid #1890FF;

						.location-icon {
							width: 32rpx;
							height: 32rpx;
							margin-right: 8rpx;
							flex-shrink: 0;
						}

						.city-name {
							font-size: 28rpx;
							color: #1890FF;
							font-weight: 600;
						}
					}

					.efficiency-label {
						font-size: 26rpx;
						color: #1890FF;
						// margin-right: 8rpx;
					}

					.efficiency-value {
						font-size: 30rpx;
						color: #1890FF;
						// font-weight: 700;
					}
				}
			}
		}

		.order-header {
			background-color: #fff;
			padding: 30rpx 20rpx 0rpx 20rpx;
			margin-bottom: 0;

			.divider {
				height: 2rpx;
				background-color: #f5f5f5;
				margin: 20rpx 0;
			}

			.order-info-row {
				display: flex;
				justify-content: space-between;
				align-items: center; /* 改为水平居中对齐 */
				margin-bottom: 20rpx;

				.left-info {
					flex: 1;
					display: flex;
					flex-direction: column;
					position: relative;

					.order-number {
						font-size: 28rpx;
						color: #666;
						margin-top: 10px;
						margin-bottom: 12rpx; /* 增加间距 */
					}

					.waiting-status {
						position: absolute;
						top: 0;
						right: 0;
						background-color: rgba(36, 146, 242, 0.1);
						color: #ff7600;
						font-size: 24rpx;
						padding: 4rpx 8rpx;
						border-radius: 4rpx;
					}

					.assigned-status {
						position: absolute;
						top: 50%;
						right: 0;
						transform: translateY(-50%);
						background-color: rgba(255, 165, 0, 0.1);
						color: #FFA500;
						font-size: 24rpx;
						padding: 4rpx 8rpx;
						border-radius: 4rpx;
					}

					.finished-status {
						position: absolute;
						top: 50%;
						right: 0;
						transform: translateY(-50%);
						background-color: rgba(155, 89, 182, 0.1);
						color: #9B59B6;
						font-size: 24rpx;
						padding: 4rpx 8rpx;
						border-radius: 4rpx;
					}

					.completed-status {
						position: absolute;
						top: 50%;
						right: 0;
						transform: translateY(-50%);
						background-color: rgba(46, 204, 113, 0.1);
						color: #2ECC71;
						font-size: 24rpx;
						padding: 4rpx 8rpx;
						border-radius: 4rpx;
					}

					.timeout-status {
						position: absolute;
						top: 50%;
						right: 0;
						transform: translateY(-50%);
						background-color: rgba(255, 0, 0, 0.1);
						color: #FF0000;
						font-size: 24rpx;
						padding: 4rpx 8rpx;
						border-radius: 4rpx;
					}

					.order-time {
						font-size: 24rpx;
						color: #999;
					}

					.waiting-tip {
						position: absolute;
						top: 30px;
						right: 0;
						width: 240rpx;
						background-color: #F1FAFC;
						color: #419eea;
						font-size: 20rpx;
						padding: 8rpx 12rpx;
						border-radius: 4rpx;
						text-indent: 2em;
					}
				}

				.right-status {
					display: flex;
					flex-direction: column;
					align-items: flex-end;

					.status-gif {
						margin-bottom: 8rpx;

						.gif-image {
							width: 220rpx;
							height: 96rpx;
						}
					}

				.status-tag {
					color: #ff6b00;
					display: flex;
					align-items: center;
					background-color: rgba(255, 107, 0, 0.1);
					padding: 4rpx 12rpx;
					border-radius: 4rpx;
					margin-bottom: 4rpx;
					margin-top: 4rpx; /* 与promotion-banner对齐 */
					font-size: 22rpx;

					.arrow {
						margin-left: 6rpx;
						font-size: 20rpx;
					}
					
					&.status-refunded {
						color: #E74C3C;
						background-color: rgba(231, 76, 60, 0.1);
					}
				}

				.waiting-description {
						background-color: rgba(36, 146, 242, 0.05);
						border-radius: 4rpx;
						padding: 6rpx 8rpx;
						max-width: 220rpx; /* 增加宽度以容纳缩进 */

						.description-text {
							font-size: 18rpx;
							color: #2492F2;
							line-height: 1.3;
							text-align: left; /* 确保左对齐 */
							text-indent: 36rpx; /* 首行缩进2个字符 */
							padding-left: 0; /* 确保没有额外的左内边距 */
							margin-left: 0; /* 确保没有左外边距 */
							word-wrap: break-word;
							word-break: break-all;
							display: block; /* 确保是块级元素 */
						}
					}
				}
			}

			.order-title {
				display: flex;
				align-items: center;
				padding: 10rpx 0;

				.order-icon {
					width: 120rpx;
					height: 120rpx;
					margin-right: 20rpx;
					border-radius: 8rpx;
				}

				.title-content {
					flex: 1;

					.main-title {
						font-size: 32rpx;
						color: #333;
						font-weight: 500;
						margin-bottom: 10rpx;
					}

					.contact {
						font-size: 28rpx;
						color: #666;
						margin-bottom: 10rpx;
					}

											.meta-row {
							display: flex;
							align-items: center;
							gap: 20rpx;
							margin-top: 6rpx;

							.copy-order-btn {
								display: flex;
								align-items: center;
								justify-content: center;
								padding: 4rpx 8rpx;
								background-color: #F9C561;
								border-radius: 4rpx;
								cursor: pointer;
								position: relative;
								z-index: 10;
								
								&:active {
									background-color: #F0B84A;
								}
								
								.copy-text {
									font-size: 20rpx;
									color: #ffffff;
									line-height: 1;
									pointer-events: none;
								}
							}
						}
						.meta-number {
							font-size: 24rpx;
							color: #666;
						}
						.meta-time {
							font-size: 24rpx;
							color: #999;
						}
					}
				}
			}
		}
		
		
		.rider-info-card-2 {
			background: #FFFFFF;
			border-radius: 8rpx;
			margin-bottom: 20rpx;
			padding: 74rpx 0px;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

			.state-buzhou {
				.steps-container {
					display: flex;
					align-items: flex-start;
					justify-content: space-between;
					position: relative;
					padding: 20rpx 0;

					.step-item {
						flex: 1;
						display: flex;
						flex-direction: column;
						align-items: center;
						position: relative;

						.step-icon-wrapper {
							position: relative;
							display: flex;
							align-items: center;
							justify-content: center;
							margin-bottom: 12rpx;

							.scooter-icon {
								width: 80rpx;
								height: 80rpx;
								position: absolute;
								top: -40rpx;
								left: 50%;
								transform: translateX(-50%);
							}
							.step-lab{
								position: absolute;
								top: -64px;
								left: 50%;
								width: 106px;
								text-align: center;
								transform: translateX(-50%);
								font-size: 20rpx;
								color: #fff;
								background: #007AFF;
							}
							.step-dot {
								width: 24rpx;
								height: 24rpx;
								border-radius: 50%;
								background-color: #CCCCCC;
								// border: 4rpx solid #FFFFFF;
								box-shadow: 0 0 0 2rpx #E5E5E5;
								z-index: 2;

								&.step-dot-active {
									background-color: #1890FF;
									box-shadow: 0 0 0 2rpx #1890FF;
								}

								&.step-dot-half {
									width: 24rpx;
									height: 24rpx;
									border-radius: 50%;
									background: linear-gradient(to right, #1890FF 50%, #FFFFFF 50%);
									// border: 4rpx solid #FFFFFF;
									box-shadow: 0 0 0 2rpx #1890FF;
								}
							}

							.working-gif {
								width: 160rpx;
								height: 100rpx;
								position: absolute;
								top: -100rpx;
								left: 50%;
								transform: translateX(-50%);
								z-index: 3;
								mix-blend-mode: multiply;
							}

							.working-gif-2 {
								width: 126rpx;
								height: 78rpx;
								position: absolute;
								top: -80rpx;
								left: 50%;
								transform: translateX(-50%);
								z-index: 3;
								mix-blend-mode: multiply;
							}

							.working-wandan {
								width: 160rpx;
								height: 100rpx;
								position: absolute;
								top: -100rpx;
								left: 50%;
								transform: translateX(-50%);
								z-index: 3;
								mix-blend-mode: multiply;
							}
						}

						.step-content {
							display: flex;
							flex-direction: column;
							align-items: center;
							text-align: center;
							z-index: 2;

							.step-title {
								font-size: 24rpx;
								color: #999999;
								margin-bottom: 6rpx;
								white-space: nowrap;

								&.step-title-active {
									color: #1890FF;
									font-weight: 600;
								}

								&.step-title-working {
									color: #1890FF;
									font-weight: 600;
								}
							}

							.step-time {
								font-size: 20rpx;
								color: #1890FF;
								white-space: nowrap;
							}
						}

						.step-line {
							position: absolute;
							top: 12rpx;
							left: 50%;
							width: 100%;
							height: 4rpx;
							background-color: #E5E5E5;
							z-index: 1;

							&.step-line-active {
								background-color: #1890FF;
							}

							&.step-line-half {
								background-color: #E5E5E5;
							}
						}

						&.step-last {
							.step-line {
								display: none;
							}
						}

						&.step-active {
							.step-icon-wrapper {
								.step-dot {
									// 移除骑手已接单的闪烁动画
								}
							}
						}

						&.step-working {
							.step-icon-wrapper {
								.step-dot {
									animation: pulse 2s infinite;
								}
							}
						}
					}
				}
			}
		}

		@keyframes pulse {
			0% {
				box-shadow: 0 0 0 2rpx #1890FF, 0 0 0 4rpx rgba(24, 144, 255, 0);
			}
			50% {
				box-shadow: 0 0 0 2rpx #1890FF, 0 0 0 8rpx rgba(24, 144, 255, 0.3);
			}
			100% {
				box-shadow: 0 0 0 2rpx #1890FF, 0 0 0 4rpx rgba(24, 144, 255, 0);
			}
		}

		// 打赏信息卡片样式
		.reward-info-card {
			background: #FFFFFF;
			border-radius: 12rpx;
			margin: 20rpx 0;
			padding: 24rpx;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

			.reward-header {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;

				.reward-title {
					display: flex;
					align-items: center;
					gap: 12rpx;

					.reward-emoji {
						font-size: 36rpx;
						line-height: 1;
					}

					.reward-title-text {
						font-size: 30rpx;
						font-weight: 600;
						color: #333;
					}
				}

				.reward-summary {
					display: flex;
					flex-direction: column;
					align-items: flex-end;
					gap: 10rpx;

					.reward-total {
						display: flex;
						align-items: center;
						gap: 8rpx;

						.total-label {
							font-size: 26rpx;
							color: #666;
						}

						.total-amount {
							font-size: 32rpx;
							font-weight: 600;
							color: #FF6B00;
						}
					}

					.reward-latest-time {
						display: flex;
						align-items: center;
						gap: 8rpx;

						.time-label {
							font-size: 22rpx;
							color: #999;
						}

						.time-value {
							font-size: 22rpx;
							color: #666;
						}
					}
				}
			}
		}

		.rider-info-card {
			padding: 24rpx;
			display: flex;
			align-items: flex-start;
			gap: 20rpx;

			.rider-avatar-large {
				width: 130rpx;
				height: 140rpx;
				border-radius: 10rpx;
				flex-shrink: 0;
			}

			.rider-details {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 8rpx;

				.rider-name-row {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding-bottom: 12rpx;
					border-bottom: 1rpx solid #f5f5f5;

					.name-content {
						display: flex;
						align-items: center;
						gap: 8rpx;

						.rider-label {
							font-size: 28rpx;
							color: #666;
						}

						.rider-name {
							font-size: 32rpx;
							font-weight: 600;
							color: #1890FF;
						}
					}

					.entry-time {
						font-size: 24rpx;
						color: #999;
						white-space: nowrap;
					}
				}

				.rider-stats-row {
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-top: 4rpx;

					.stats-item {
						font-size: 26rpx;
						color: #666;
					}

					.reward-btn {
						position: absolute;
						right: 22px;
						width: 46rpx;
						height: 46rpx;
						background: #1890FF;
						border-radius: 12rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						flex-shrink: 0;
						cursor: pointer;
						transition: all 0.3s ease;

						&:active {
							transform: scale(0.95);
							background: #1576D2;
						}

						.reward-text {
							font-size: 28rpx;
							color: #FFFFFF;
							font-weight: 600;
						}
					}
				}

				.rider-rating-row {
					display: flex;
					align-items: center;
					gap: 8rpx;

					.rating-label {
						font-size: 26rpx;
						color: #666;
					}

					.rating-stars {
						display: flex;
						gap: 2rpx;

						.star {
							font-size: 28rpx;
							color: #1890FF;
						}
					}

					.rating-score {
						font-size: 28rpx;
						color: #1890FF;
						font-weight: 600;
						margin-left: 4rpx;
					}
				}
			}
		}

		// 地图导航卡片样式
		.map-card {
			background: #FFFFFF;
			border-radius: 12rpx;
			margin-bottom: 20rpx;
			overflow: hidden;
			box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

			.map-container {
				width: 100%;
				height: 220rpx;
				position: relative;
				overflow: hidden;

				.map-view {
					width: 100%;
					height: 100%;
				}

				.map-placeholder {
					width: 100%;
					height: 100%;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					gap: 16rpx;
					background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);

					.map-icon-wrapper {
						width: 100rpx;
						height: 100rpx;
						border-radius: 50%;
						background: rgba(255, 255, 255, 0.9);
						display: flex;
						align-items: center;
						justify-content: center;
						box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.2);

						.map-icon {
							width: 60rpx;
							height: 60rpx;
						}
					}

					.map-text {
						font-size: 28rpx;
						color: #1890FF;
						font-weight: 600;
					}

					.map-arrow {
						font-size: 32rpx;
						color: #1890FF;
						font-weight: bold;
					}
				}

				.map-store-name-overlay {
					position: absolute;
					top: 20rpx;
					left: 20rpx;
					z-index: 10;

					.store-name-tag {
						background: rgba(255, 255, 255, 0.95);
						border-radius: 30rpx;
						padding: 12rpx 24rpx;
						display: flex;
						align-items: center;
						gap: 8rpx;
						box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);

						.tag-icon {
							width: 28rpx;
							height: 28rpx;
						}

						.tag-text {
							font-size: 28rpx;
							font-weight: 600;
							color: #333;
						}
					}
				}

				.map-nav-button {
					position: absolute;
					bottom: 20rpx;
					right: 20rpx;
					z-index: 10;
					background: #1890FF;
					border-radius: 30rpx;
					padding: 12rpx 32rpx;
					box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
					transition: all 0.3s ease;

					&:active {
						transform: scale(0.95);
						background: #1576D2;
					}

					.nav-text {
						font-size: 28rpx;
						font-weight: 600;
						color: #FFFFFF;
					}
				}
			}
		}

		.order-title-new {
			display: flex;
			align-items: flex-start;
			padding: 20rpx 0;

			.order-basic-logo {
				width: 130rpx;
				height: 140rpx;
				border-radius: 10rpx;
				margin-right: 24rpx;
				flex-shrink: 0;
				display: flex;
				align-items: center;
				justify-content: center;
				overflow: hidden;

				.icon-content {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					width: 100%;
					height: 100%;

					.brand-text,
					.service-text {
						font-size: 41rpx;
						color: #fff;
						font-weight: bold;
						line-height: 1.2;
						text-align: center;
					}
				}

				// 品牌颜色样式
				&.brand-meituan {
					background-color: #F9E34F !important;

					.brand-text,
					.service-text {
						color: #333 !important;
					}
				}

				&.brand-guaishou {
					background-color: #27BFC0 !important;
				}

				&.brand-jiedian,
				&.brand-xiaodian,
				&.brand-default {
					background-color: #2492F2 !important;
				}

				&.brand-zhumang {
					background-color: #2492F2 !important;
				}
			}

			.title-info {
				flex: 1;

				.title-row {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 12rpx;

					.task-name {
						font-size: 32rpx;
						font-weight: 600;
						color: #333;
						flex: 1;
					}

					.publish-time {
						font-size: 24rpx;
						color: #999;
						margin-left: 16rpx;
						white-space: nowrap;
					}
				}

				.title-divider {
					height: 1rpx;
					background-color: #f5f5f5;
					margin: 12rpx 0;
				}

				.info-row {
					display: flex;
					align-items: center;
					margin-bottom: 8rpx;

					.info-label {
						font-size: 26rpx;
						color: #666;
						flex-shrink: 0;
					}

					.info-value {
						font-size: 26rpx;
						color: #333;
						flex: 1;
						margin: 0 8rpx;
					}

					.copy-btn {
						font-size: 22rpx;
						padding: 0rpx 4rpx;
						background-color: #f5f5f5;
						color: #666;
						border: 1rpx solid #ddd;
						border-radius: 20rpx;
						margin-left: 4rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						flex-shrink: 0;
						transition: all 0.2s ease;

						&:active {
							background-color: #e8e8e8;
							border-color: #ccc;
						}

						.copy-icon {
							width: 22rpx;
							height: 22rpx;
						}
					}
				}

				.device-code-row {
					display: flex;
					align-items: flex-start;
					margin-bottom: 8rpx;

					.device-code-list {
						flex: 1;
						display: flex;
						flex-direction: column;
						gap: 8rpx;

						.device-code-item {
							display: flex;
							align-items: center;

							.info-value {
								font-size: 26rpx;
								color: #333;
								flex: 1;
								margin: 0 8rpx;
							}
						}
					}
				}
			}
		}

		// 附加服务样式
		.extra-services {
			display: flex;
			align-items: flex-start;
			padding: 20rpx 0;
			border-top: 1rpx solid #f5f5f5;

			.extra-services-label {
				font-size: 26rpx;
				color: #666;
				flex-shrink: 0;
				min-width: 140rpx;
			}

			.extra-services-content {
				flex: 1;
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				font-size: 26rpx;

				.service-name {
					color: #333;
				}

				.service-count {
					color: #2492F2;
					margin-right: 4rpx;
				}

				.service-separator {
					color: #333;
					margin-right: 4rpx;
				}
			}
		}

		// 骑手已接单卡片样式
		.rider-assigned-card {
			background: linear-gradient(135deg, #E6F7FF, #F0F9FF);
			border: 2rpx solid #91D5FF;
			border-radius: 16rpx;
			margin: 15rpx 0;
			padding: 25rpx;
			box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.1);

			.rider-header {
				display: flex;
				align-items: center;
				justify-content: space-between;

				.rider-status {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;

					.status-gif {
						margin-top: -12px;

						.gif-image {
							width: 220rpx;
							height: 100rpx;
						}
					}

				.status-tag {
					color: #ff6b00;
					display: flex;
					align-items: center;
					background-color: rgba(255, 107, 0, 0.1);
					padding: 6rpx 12rpx;
					border-radius: 4rpx;
					font-size: 21rpx;

					.arrow {
						margin-left: 6rpx;
						font-size: 20rpx;
					}
					
					&.status-refunded {
						color: #E74C3C;
						background-color: rgba(231, 76, 60, 0.1);
					}
				}
			}

			.rider-info {
					flex: 1;
					display: flex;
					align-items: flex-start;

					.rider-avatar {
						width: 80rpx;
						height: 80rpx;
						border-radius: 10%;
						margin-right: 20rpx;
						flex-shrink: 0;
					}

					.rider-content {
						flex: 1;
					}

					.rider-title {
						margin-bottom: 12rpx;

						.title-text {
							font-size: 32rpx;
							font-weight: 500;
							color: #1890FF;
						}
					}

					.accept-time {
						display: flex;
						align-items: center;
						margin-bottom: 10rpx;
						white-space: nowrap;
						overflow: hidden;

						.time-label {
							font-size: 24rpx;
							color: #666666;
							margin-right: 6rpx;
							flex-shrink: 0;
						}

						.time-value {
							font-size: 23rpx;
							color: #333333;
							font-weight: 400;
							overflow: hidden;
							text-overflow: ellipsis;
						}
					}

					.promotion-banner {
						margin-left: -50px;
						margin-top: 4rpx;
						margin-bottom: 8rpx;
						display: flex;
						justify-content: flex-start;
						align-items: center;

						.promotion-image {
							width: 400rpx;
							height: 42rpx;
						}
					}


				}
			}
		}

		.divider-line {
			height: 0rpx;
			background-color: #f5f5f5;
			margin: 10rpx 0;
		}

		.order-detail-card {
			background: #fff;
			border-radius: 12rpx;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
			margin: 20rpx 0 0 0;
			padding: 0;
		}

		.detail-list-toggle {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 80rpx;
			padding: 0 30rpx;
			border-radius: 12rpx 12rpx 0 0;
			border-bottom: 2rpx solid #f5f5f5;
		}

	.toggle-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		
		.title-left {
			display: flex;
			align-items: center;
		}
		
		.order-no-right {
			display: flex;
			align-items: center;
			
			.order-no-text {
				font-size: 24rpx;
				color: #999;
				margin-right: 8rpx;
			}
			
			.copy-order-no-btn {
				padding: 8rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.copy-icon-small {
					width: 22rpx;
					height: 22rpx;
				}
			}
		}
	}

	.header-icon {
		width: 38rpx;
		height: 38rpx;
		margin-right: 10rpx;
	}

	.header-title {
		font-size: 32rpx;
		font-weight: 500;
		color: #333;
	}



		.detail-list-wrapper {
			position: relative;
			background: #fff;
			border-radius: 0 0 12rpx 12rpx;
		}

	.detail-list {
		padding: 30rpx;
		background: #fff;
		border-radius: 0 0 12rpx 12rpx;
		overflow: hidden;
		transition: max-height 0.3s ease;
	}

	/* 模糊效果层 */
	.blur-mask {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 120rpx;
			background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1));
			pointer-events: none;
			z-index: 1;
		}

		/* 展开/收起按钮 */
		.expand-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20rpx 0;
			background: #fff;
			border-radius: 0 0 12rpx 12rpx;
			position: relative;
			z-index: 2;
		}

		.expand-btn-content {
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #f5f5f5;
			border-radius: 30rpx;
			padding: 10rpx 30rpx;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
			transition: all 0.3s ease;
		}

		.expand-btn-content:active {
			transform: scale(0.98);
			box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.1);
		}

		.expand-text {
			color: #2492F2;
			font-size: 28rpx;
			font-weight: 500;
			margin-right: 10rpx;
		}

		.expand-icon {
			transition: transform 0.3s ease;
			display: flex;
			align-items: center;
		}

		.expand-icon.expanded {
			transform: rotate(180deg);
		}

		/* 操作按钮区域 */
		.action-buttons-above-expand {
			padding: 20rpx 30rpx 10rpx;
			background: #fff;
			border-top: 1rpx solid #f0f0f0;
			display: flex;
			gap: 20rpx;

			.btn {
				flex: 1;
				height: 80rpx;
				line-height: 80rpx;
				font-size: 32rpx;
				border-radius: 40rpx;
				border: none;

				&.edit-btn {
					background: #52c41a;
					color: #fff;
				}

				&.cancel-btn {
					background: #ff4d4f;
					color: #fff;
				}
			}
		}

		.detail-item {
			display: flex;
			align-items: flex-start;
			margin-bottom: 20rpx;
			padding-bottom: 20rpx;
			border-bottom: 2rpx solid #f5f5f5;


			.item-dot {
				width: 12rpx;
				height: 12rpx;
				border-radius: 50%;
				background-color: #2492F2;
				margin-right: 16rpx;
				margin-top: 8rpx;
			}

			.item-label {
				font-size: 28rpx;
				color: #333;
				width: 270rpx;
				text-align: left;
				flex-shrink: 0;
			}

			.item-value {
				flex: 1;
				font-size: 28rpx;
				color: #333;
				text-align: right;

				&.order-notes {
					text-align: right;
					line-height: 1.5;
					word-wrap: break-word;
					word-break: break-all;
					white-space: pre-wrap;
				}

				// SN码容器样式
				&.sn-code-container {
					display: flex;
					flex-direction: column;
					align-items: flex-end;
					gap: 8rpx;

					.sn-code-item {
						display: flex;
						align-items: center;
						gap: 8rpx;

						.sn-code-text {
							font-size: 26rpx;
							color: #333;
						}

						.copy-code-btn {
							font-size: 22rpx;
							padding: 0rpx 4rpx;
							background-color: #f5f5f5;
							color: #666;
							border: 1rpx solid #ddd;
							border-radius: 20rpx;
							margin-left: 4rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							flex-shrink: 0;
							transition: all 0.2s ease;
							cursor: pointer;
							position: relative;
							z-index: 10;
							
							&:active {
								background-color: #e8e8e8;
								border-color: #ccc;
							}

							.copy-icon-small {
								width: 22rpx;
								height: 22rpx;
							}
						}
					}
				}

			// 订单编号容器样式
			&.order-no-container {
				display: flex;
				align-items: center;
				justify-content: flex-end;

				.order-no-text {
					margin-right: 8rpx;
				}

				.copy-order-no-btn {
					font-size: 22rpx;
					padding: 0rpx 4rpx;
					background-color: #f5f5f5;
					color: #666;
					border: 1rpx solid #ddd;
					border-radius: 20rpx;
					margin-left: 4rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
					transition: all 0.2s ease;
					cursor: pointer;
					position: relative;
					z-index: 10;
					
					&:active {
						background-color: #e8e8e8;
						border-color: #ccc;
					}

					.copy-icon-small {
						width: 22rpx;
						height: 22rpx;
					}
				}
			}

			// 门店名称容器样式
			&.store-name-container {
				display: flex;
				align-items: center;
				justify-content: flex-end;

				.store-name-text {
					margin-right: 8rpx;
				}

					.copy-store-btn {
							font-size: 22rpx;
							padding: 0rpx 4rpx;
							background-color: #f5f5f5;
							color: #666;
							border: 1rpx solid #ddd;
							border-radius: 20rpx;
							margin-left: 4rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							flex-shrink: 0;
							transition: all 0.2s ease;
							cursor: pointer;
							position: relative;
							z-index: 10;
							
							&:active {
								background-color: #e8e8e8;
								border-color: #ccc;
							}

							.copy-icon-small {
								width: 22rpx;
								height: 22rpx;
							}
						}
				}
			}
		}

		.price-detail-toggle {
			cursor: pointer;
			transition: background-color 0.2s;
			
			&:hover {
				background-color: #f8f9fa;
			}
			
			.price-toggle {
				display: flex;
				align-items: center;
				width: 100%;
				
				.price-summary {
					font-size: 32rpx;
					color: #ff4d4f;
					font-weight: 500;
					margin-left: auto;
					margin-right: 12rpx;
				}
				
				.toggle-icon {
					transition: transform 0.3s ease;
					flex-shrink: 0;
					
					&.expanded {
						transform: rotate(180deg);
					}
				}
			}
		}
		
		.price-detail-content {
			margin-top: 16rpx;
			padding: 20rpx;
			background-color: #f8f9fa;
			border-radius: 8rpx;
			margin-left: 40rpx;

			// 打赏详情样式
			.reward-detail {
				margin-top: 20rpx;
				padding-top: 20rpx;
				border-top: 2rpx solid #e8e8e8;

				.reward-detail-title {
					display: flex;
					align-items: center;
					gap: 8rpx;
					margin-bottom: 12rpx;

					.reward-emoji {
						font-size: 24rpx;
					}

					text {
						font-size: 26rpx;
						font-weight: 600;
						color: #333;
					}
				}

			.reward-list {
				.reward-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 8rpx 0;

					.reward-amount {
						font-size: 26rpx;
						color: #FF6B00;
						font-weight: 500;
					}

					.reward-time {
						font-size: 24rpx;
						color: #999;
					}
				}
			}
		}
		
		.refund-detail {
			margin-top: 20rpx;
			padding-top: 20rpx;
			border-top: 2rpx solid #e8e8e8;

			.refund-detail-title {
				display: flex;
				align-items: center;
				gap: 8rpx;
				margin-bottom: 12rpx;

				.refund-emoji {
					font-size: 24rpx;
				}

				text {
					font-size: 26rpx;
					font-weight: 600;
					color: #333;
				}
			}

			.refund-info {
				.refund-info-item {
					display: flex;
					align-items: flex-start;
					padding: 8rpx 0;
					line-height: 1.5;

					.info-label {
						font-size: 26rpx;
						color: #666;
						min-width: 140rpx;
						flex-shrink: 0;
					}

					.info-value {
						font-size: 26rpx;
						color: #333;
						flex: 1;
						
						&.refund-status {
							color: #E74C3C;
							font-weight: 500;
						}
						
						&.refund-amount {
							color: #E74C3C;
							font-weight: 600;
						}
					}
				}
			}
		}
	}
	
	.price-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 10rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.label {
				font-size: 28rpx;
				color: #333;
				flex: 1;
			}

			.value {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
				text-align: right;
				min-width: 120rpx;
			}

			&.total {
				margin-top: 10rpx;
				border-top: 2rpx solid #e8e8e8;
				padding-top: 10rpx;
				font-weight: 600;
			}
		}

		.detail-sub-item {
			font-size: 28rpx;
			color: #666;
			padding-left: 28rpx;
			margin-bottom: 20rpx;
			padding-bottom: 20rpx;
			border-bottom: 2rpx solid #f5f5f5;

			.sn-code-item {
				display: flex;
				align-items: center;
				margin-bottom: 10rpx;

				&:last-child {
					margin-bottom: 0;
				}

				.sn-code-text {
					margin-right: 8rpx;
				}

							.copy-code-btn {
								font-size: 22rpx;
								padding: 0rpx 4rpx;
								background-color: #f5f5f5;
								color: #666;
								border: 1rpx solid #ddd;
								border-radius: 20rpx;
								margin-left: 4rpx;
								display: flex;
								align-items: center;
								justify-content: center;
								flex-shrink: 0;
								transition: all 0.2s ease;
								cursor: pointer;
								position: relative;
								z-index: 10;
								
								&:active {
									background-color: #e8e8e8;
									border-color: #ccc;
								}

								.copy-icon-small {
									width: 22rpx;
									height: 22rpx;
								}
							}
			}

			// 地址容器样式
			&.address-container {
				display: flex;
				align-items: center;

				.address-text {
					flex: 1;
					margin-right: 8rpx;
				}

					.copy-address-btn {
						font-size: 22rpx;
						padding: 0rpx 4rpx;
						background-color: #f5f5f5;
						color: #666;
						border: 1rpx solid #ddd;
						border-radius: 20rpx;
						margin-left: 4rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						flex-shrink: 0;
						transition: all 0.2s ease;
						cursor: pointer;
						position: relative;
						z-index: 10;
						
						&:active {
							background-color: #e8e8e8;
							border-color: #ccc;
						}

						.copy-icon-small {
							width: 22rpx;
							height: 22rpx;
						}
					}
			}
		}

		.store-images {
			display: flex;
			padding-left: 28rpx;
			margin-bottom: 20rpx;
			padding-bottom: 20rpx;
			border-bottom: 2rpx solid #f5f5f5;

			image {
				width: 160rpx;
				height: 120rpx;
				margin-right: 20rpx;
				border-radius: 8rpx;
			}
		}

		.store-desc {
			margin-top: 10rpx;
			padding-bottom: 20rpx;
			border-bottom: 2rpx solid #f5f5f5;
		}

		.feedback-card, .confirm-card {
			background-color: #fff;
			margin: 20rpx 0rpx;
			border-radius: 12rpx;
			padding: 30rpx;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

			.card-title {
				font-size: 32rpx;
				font-weight: 500;
				color: #333;
				margin-bottom: 20rpx;
				border-left: 8rpx solid #2492F2;
				padding-left: 20rpx;
			}

		.feedback-content, .confirm-content {
			overflow: hidden;
			transition: max-height 0.3s ease;
			
			.feedback-header {
				margin-bottom: 0;

				.rider-info {
					display: flex;
					align-items: center;

					.avatar {
						width: 60rpx;
						height: 60rpx;
						border-radius: 50%;
						margin-right: 16rpx;
					}

					.name {
						font-size: 28rpx;
						color: #333;
					}
				}
			}

			.feedback-info, .confirm-info {
				margin-top: 20rpx;
			}

				.images-section {
					margin-top: 20rpx;

					.section-title {
						font-size: 28rpx;
						color: #666;
						margin-bottom: 16rpx;
						display: block;
					}

					.images {
						display: flex;
						flex-wrap: wrap;
						margin: 0 -8rpx;

						.feedback-image-item {
							width: calc(50% - 16rpx);
							margin: 8rpx;
							display: flex;
							flex-direction: column;
							align-items: center;

							.feedback-image {
								width: 100%;
								height: 160rpx;
								border-radius: 8rpx;
								margin-bottom: 8rpx;
							}

							.image-label {
								font-size: 22rpx;
								color: #666;
								text-align: center;
							}
						}
					}
				}

				.remark {
					font-size: 28rpx;
					color: #333;
					margin-bottom: 20rpx;
					line-height: 1.6;

					.label {
						color: #666;
						margin-right: 10rpx;
					}

					.content {
						color: #333;
					}
				}
			}
		}

		.bottom-button {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 20rpx;
			background-color: #fff;
			box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
			padding-bottom: calc(20rpx + env(safe-area-inset-bottom));

			.btn {
				width: 90%;
				height: 80rpx;
				line-height: 80rpx;
				font-size: 32rpx;
				border-radius: 40rpx;
				border: none;

				&.confirm-btn {
					background: #2492F2;
					color: #fff;
				}

				&.cancel-btn {
					background: #ff4d4f;
					color: #fff;
				}
			}
		}

		.bottom-placeholder {
			height: 140rpx;
		}

		.more-button {
			display: flex;
			justify-content: center;
			margin-bottom: 30rpx;

			text {
				font-size: 28rpx;
				color: #999;
			}
		}

		// 评价相关样式
		.review-section {
			margin-top: 20rpx;
			padding-top: 20rpx;
			border-top: 1rpx solid #f0f0f0;

			.section-title {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
				margin-bottom: 16rpx;
			}

			.review-content {
				.review-rating {
					display: flex;
					align-items: center;
					margin-bottom: 12rpx;

					.rating-label {
						font-size: 26rpx;
						color: #666;
						margin-right: 8rpx;
					}

					.stars {
						display: flex;
						margin-right: 8rpx;

						.star {
							font-size: 24rpx;
							color: #ddd;
							margin-right: 2rpx;

							&.active {
								color: #FFD700;
							}
						}
					}

					.rating-text {
						font-size: 24rpx;
						color: #666;
					}
				}

				.review-tags {
					margin-bottom: 12rpx;

					.tags-label {
						font-size: 26rpx;
						color: #666;
						margin-bottom: 8rpx;
						display: block;
					}

					.tags-list {
						display: flex;
						flex-wrap: wrap;
						margin: -4rpx;

						.tag-item {
							font-size: 22rpx;
							color: #2492F2;
							background-color: rgba(36, 146, 242, 0.1);
							padding: 4rpx 12rpx;
							border-radius: 12rpx;
							margin: 4rpx;
							border: 1rpx solid rgba(36, 146, 242, 0.2);
						}
					}
				}

				.review-comment {
					margin-bottom: 12rpx;

					.comment-label {
						font-size: 26rpx;
						color: #666;
						font-weight: 500;
						margin-bottom: 8rpx;
						display: block;
					}

					.comment-text {
						font-size: 26rpx;
						color: #333;
						line-height: 1.6;
						background-color: #f8f9fa;
						padding: 12rpx;
						border-radius: 8rpx;
						display: block;
					}
				}

				.review-time {
					.time-label {
						font-size: 24rpx;
						color: #999;
						margin-right: 8rpx;
					}

					.time-text {
						font-size: 24rpx;
						color: #999;
					}
				}
			}
		}

	// 取消订单弹窗样式（新版）
	.cancel-modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
	}

	.cancel-modal-container {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 90%;
		max-width: 650rpx;
		background-color: transparent;
		border-radius: 24rpx;
		overflow: hidden;
		z-index: 1000;
		animation: modalSlideIn 0.3s ease;

		// 顶部区域带卡通人物
		.cancel-modal-top {
			position: relative;
			width: 100%;
			overflow: hidden;
			line-height: 0;
			font-size: 0;

			.modal-character {
				width: 100%;
				height: auto;
				display: block;
				vertical-align: bottom;
			}
		}

		// 内容区域
		.cancel-modal-content {
			padding: 0rpx 30rpx 30rpx 30rpx;
			background-color: #FFFFFF;
			margin-top: -1px;
			margin-bottom: -1px;

			// 取消原因列表
			.cancel-reason-list {
				background-color: #EBF5FF;
				border-radius: 12rpx;
				padding: 20rpx;
				
				.reason-list-title {
					display: block;
					font-size: 30rpx;
					color: #333333;
					font-weight: 500;
					margin-bottom: 20rpx;
				}

				.reason-options {
					.reason-option-item {
						display: flex;
						align-items: center;
						padding: 7rpx 0;
						border-bottom: 1rpx solid #f5f5f5;
						cursor: pointer;

						&:last-child {
							border-bottom: none;
						}

						radio {
							margin-right: 16rpx;
							transform: scale(0.9);
						}

						.reason-text {
							flex: 1;
							font-size: 28rpx;
							color: #333333;
							line-height: 1.4;
						}

						&:active {
							background-color: #f8f8f8;
						}
					}
				}
			}
		}

		// 底部按钮区域
		.cancel-modal-footer {
			display: flex;
			padding: 0 30rpx 30rpx;
			gap: 24rpx;
			background-color: #FFFFFF;

			.cancel-modal-btn {
				flex: 1;
				height: 88rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 32rpx;
				font-weight: 500;
				border-radius: 44rpx;
				cursor: pointer;
				transition: all 0.3s ease;

				&.cancel {
					color: #FF4D4F;
					background-color: #FFFFFF;
					border: 2rpx solid #FF4D4F;

					&:active {
						background-color: #FFF5F5;
						transform: scale(0.98);
					}
				}

				&.confirm {
					color: #FFFFFF;
					background: linear-gradient(135deg, #4FB5FF 0%, #2492F2 100%);
					box-shadow: 0 8rpx 24rpx rgba(36, 146, 242, 0.3);

					&:active {
						transform: scale(0.98);
						box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.2);
					}
				}
			}
		}
	}

	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: translate(-50%, -60%) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	// 二次确认弹窗样式
	.confirm-cancel-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1001;
	}

	.confirm-cancel-container {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 90%;
		max-width: 650rpx;
		border-radius: 24rpx;
		overflow: hidden;
		z-index: 1002;
		animation: modalSlideIn 0.3s ease;
		display: flex;
		flex-direction: column;

		// 顶部区域带卡通人物
		.confirm-cancel-top {
			position: relative;
			width: 100%;
			overflow: hidden;
			margin: 0;
			padding: 0;
			flex-shrink: 0;

			.modal-character {
				width: 100%;
				height: auto;
				display: block;
				vertical-align: bottom;
			}
		}

		// 内容区域
		.confirm-cancel-content {
			padding: 0;
			background-color: #FFFFFF;
			display: block;
			margin: 0;
			position: relative;
			z-index: 5;
			flex-shrink: 0;
			margin-bottom: -1px;
			margin-top: -1px;

			.content-image {
				width: 100%;
				height: auto;
				display: block;
				margin: 0;
				padding: 0;
				vertical-align: bottom;
				user-select: none;
				-webkit-user-select: none;
				pointer-events: none;
				line-height: 0;
				font-size: 0;
			}
		}

		// 底部按钮区域
		.confirm-cancel-footer {
			display: flex;
			padding: 30rpx;
			gap: 0;
			background-color: #FFFFFF;
			margin-top: 0;
			position: relative;
			z-index: 10;
			border-top: none;
			line-height: 0;
			font-size: 0;
			flex-shrink: 0;

			.confirm-cancel-btn {
				flex: 1;
				height: 88rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 32rpx;
				font-weight: 500;
				border-radius: 44rpx;
				cursor: pointer;
				transition: all 0.3s ease;
				margin: 0 12rpx;
				line-height: normal;

				&.withdraw {
					color: #FFFFFF;
					background: linear-gradient(135deg, #4FB5FF 0%, #2492F2 100%);
					box-shadow: 0 8rpx 24rpx rgba(36, 146, 242, 0.3);

					&:active {
						transform: scale(0.98);
						box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.2);
					}
				}

				&.confirm {
					color: #FFFFFF;
					background-color: #FF4D4F;
					box-shadow: 0 8rpx 24rpx rgba(255, 77, 79, 0.3);

					&:active {
						background-color: #E04345;
						transform: scale(0.98);
						box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.2);
					}
				}
			}
		}
	}

	// 修改订单弹窗样式
	.edit-modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
	}

	.edit-modal-container {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 90%;
		max-width: 700rpx;
		max-height: 80vh;
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		z-index: 1000;
		animation: modalSlideIn 0.3s ease;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;

		.edit-modal-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 24rpx;
			border-bottom: 1rpx solid #f0f0f0;
			flex-shrink: 0;

			.edit-modal-title {
				font-size: 28rpx;
				font-weight: 600;
				color: #333;
			}

			.edit-modal-close {
				width: 40rpx;
				height: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 36rpx;
				color: #999;
				cursor: pointer;
			}
		}

		.edit-modal-content {
			flex: 1;
			overflow-y: auto;
			padding: 24rpx;
			-webkit-overflow-scrolling: touch;

			.edit-form-group {
				margin-bottom: 32rpx;

				&:last-child {
					margin-bottom: 16rpx;
				}

				.edit-form-label {
					display: block;
					font-size: 26rpx;
					color: #333;
					font-weight: 600;
					margin-bottom: 12rpx;
					line-height: 1.4;
				}

				.edit-form-input {
					width: 100%;
					height: 66rpx;
					padding: 0 20rpx;
					border: 2rpx solid #e0e0e0;
					border-radius: 12rpx;
					font-size: 26rpx;
					color: #333;
					background-color: #fff;
					box-sizing: border-box;
					line-height: 1.4;

					&:focus {
						border-color: #2492F2;
						background-color: #fff;
						box-shadow: 0 0 0 2rpx rgba(36, 146, 242, 0.1);
					}

					&::placeholder {
						color: #999;
						font-size: 24rpx;
					}
				}

				textarea.edit-form-textarea {
					width: 100% !important;
					min-height: 130rpx !important;
					height: 130rpx !important;
					padding: 12rpx !important;
					border: 2rpx solid #e0e0e0;
					border-radius: 12rpx;
					font-size: 26rpx;
					color: #333;
					background-color: #fff;
					box-sizing: border-box;
					resize: none;
					line-height: 1.4;

					&:focus {
						border-color: #2492F2;
						background-color: #fff;
						box-shadow: 0 0 0 2rpx rgba(36, 146, 242, 0.1);
					}

					&::placeholder {
						color: #999;
						font-size: 24rpx;
					}
				}

				// SN码列表样式
				.sn-code-list {
					.sn-code-item {
						display: flex;
						align-items: center;
						margin-bottom: 20rpx;

						.edit-form-input {
							flex: 1;
							margin-right: 20rpx;
						}

						.remove-sn-btn {
							width: 40rpx;
							height: 40rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							background-color: #ff4d4f;
							color: #fff;
							border-radius: 50%;
							font-size: 28rpx;
							font-weight: bold;
							cursor: pointer;
							flex-shrink: 0;

							&:active {
								background-color: #d9363e;
								transform: scale(0.95);
							}
						}
					}

					.add-sn-btn {
						display: flex;
						align-items: center;
						justify-content: center;
						height: 54rpx;
						background-color: #52c41a;
						color: #fff;
						border-radius: 12rpx;
						font-size: 26rpx;
						font-weight: 500;
						cursor: pointer;
						margin-top: 10rpx;

						&:active {
							background-color: #389e0d;
							transform: scale(0.98);
						}
					}
				}

				// 时间选择器样式
				.time-range-selector {
					display: flex;
					gap: 24rpx;

					.time-item {
						flex: 1;

						.time-label {
							display: block;
							font-size: 28rpx;
							color: #666;
							margin-bottom: 16rpx;
							font-weight: 500;
						}

						.time-picker {
							height: 66rpx;
							line-height: 66rpx;
							padding: 0 20rpx;
							border: 2rpx solid #e0e0e0;
							border-radius: 12rpx;
							font-size: 26rpx;
							color: #333;
							background-color: #fff;
							text-align: center;
							cursor: pointer;
							transition: all 0.2s;

							&:active {
								border-color: #2492F2;
								background-color: #f0f9ff;
							}
						}
					}
				}

				// 日期时间选择器样式
				.datetime-selector {
					display: flex;
					gap: 24rpx;

					.datetime-item {
						flex: 1;

						.datetime-label {
							display: block;
							font-size: 24rpx;
							color: #666;
							margin-bottom: 12rpx;
							font-weight: 500;
						}

						.time-picker {
							height: 66rpx;
							line-height: 66rpx;
							padding: 0 20rpx;
							border: 2rpx solid #e0e0e0;
							border-radius: 12rpx;
							font-size: 26rpx;
							color: #333;
							background-color: #fff;
							text-align: center;
							cursor: pointer;
							transition: all 0.2s;

							&:active {
								border-color: #2492F2;
								background-color: #f0f9ff;
							}
						}
					}
				}

				// 设备外摆选择器样式
				.device-outside-selector {
					display: flex;
					gap: 24rpx;

					.device-option {
						flex: 1;
						height: 66rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						border: 2rpx solid #e0e0e0;
						border-radius: 12rpx;
						font-size: 26rpx;
						color: #666;
						background-color: #fff;
						cursor: pointer;
						transition: all 0.3s;
						font-weight: 500;

						&.active {
							border-color: #2492F2;
							background-color: #2492F2;
							color: #fff;
							box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.3);
						}

						&:active {
							transform: scale(0.96);
						}
					}
				}
			}
		}

		.edit-modal-footer {
			display: flex;
			border-top: 2rpx solid #f0f0f0;
			flex-shrink: 0;
			padding: 16rpx 0;

			.edit-modal-btn {
				flex: 1;
				height: 76rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 26rpx;
				font-weight: 600;
				cursor: pointer;
				transition: all 0.2s;
				margin: 0 16rpx;
				border-radius: 12rpx;

				&.cancel {
					color: #666;
					background-color: #f8f8f8;
					border: 2rpx solid #e0e0e0;

					&:active {
						background-color: #e8e8e8;
						transform: scale(0.98);
					}
				}

				&.confirm {
					color: #fff;
					background-color: #2492F2;
					box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.3);

					&:active {
						background-color: #1976D2;
						transform: scale(0.98);
					}

					&.disabled {
						background-color: #ccc;
						cursor: not-allowed;
						box-shadow: none;
						transform: none;

						&:active {
							transform: none;
						}
					}
				}
			}
		}
	}

	// 底部悬浮操作按钮
	.bottom-float-action {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #FFFFFF;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
		z-index: 999;

		.action-button {
			width: 100%;
			height: 88rpx;
			background: linear-gradient(135deg, #1890FF 0%, #0066CC 100%);
			border-radius: 44rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.35);
			transition: all 0.3s ease;

			&:active {
				transform: scale(0.98);
				box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.25);
			}

			.action-text {
				font-size: 32rpx;
				font-weight: 600;
				color: #FFFFFF;
				letter-spacing: 2rpx;
			}
		}
	}

	// 气泡提示样式
	.feedback-bubble {
		position: absolute;
		top: -150rpx;
		left: 50%;
		transform: translateX(-50%);
		z-index: 4;
		min-width: 220rpx;
		max-width: 320rpx;
		height: auto;
		min-height: 70rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.bubble-bg {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: -1;
			pointer-events: none;
		}

		.bubble-text {
			position: relative;
			z-index: 10;
			font-size: 21rpx;
			color: #FFFFFF;
			font-weight: 600;
			text-align: center;
			padding-bottom: 19rpx;
			width: 100%;
			box-sizing: border-box;
		}
	}
	
	
	// 时间轴弹窗样式
	
	.timeline-modal {
	  .modal-content {
	    max-height: 70vh;
	    overflow-y: auto;
	  }
	}
	
	.timeline-container {
		background: #F5FAFF;
	  padding: 20rpx 0;
	}
	
	.timeline-item {
	  display: flex;
	  align-items: flex-start;
	  margin-bottom: 40rpx;
	  position: relative;
	
	  &:last-child {
	    margin-bottom: 0;
	
	    &::after {
	      display: none;
	    }
	  }
	
	  &::after {
	    content: '';
	    position: absolute;
	    left: 15rpx;
	    top: 40rpx;
	    width: 2rpx;
	    height: 40rpx;
	    background-color: #e8e8e8;
	  }
	}
	
	.timeline-dot {
	  width: 30rpx;
	  height: 30rpx;
	  border-radius: 50%;
	  background-color: #e8e8e8;
	  margin-right: 20rpx;
	  flex-shrink: 0;
	  margin-top: 5rpx;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	
	  &.active {
	    background-color: #52C41A;
	  }
	
	  .timeline-check {
	    font-size: 18rpx;
	    color: #fff;
	    font-weight: bold;
	    line-height: 1;
	  }
	}
	
	.timeline-content {
	  flex: 1;
	  display: flex;
	  flex-direction: column;
	}
	
	.timeline-title {
	  font-size: 28rpx;
	  color: #333;
	  font-weight: 500;
	  margin-bottom: 8rpx;
	}
	
	.timeline-time {
	  font-size: 24rpx;
	  color: #666;
	  line-height: 1.4;
	
	  &.pending {
	    color: #999;
	    font-style: italic;
	  }
	}
	
	.timeline-detail {
	  font-size: 22rpx;
	  color: #999;
	  line-height: 1.5;
	  margin-top: 6rpx;
	  white-space: pre-line; // 支持换行符显示
	  word-break: break-all; // 防止长文本溢出
	}
	
	// 不同类型事件的特殊样式
	.cancel-dot {
	  background-color: #ff4d4f !important;
	
	  .timeline-cancel {
	    font-size: 16rpx;
	    color: #fff;
	    font-weight: bold;
	    line-height: 1;
	  }
	}
	
	.refund-dot {
	  background-color: #fa8c16 !important;
	
	  .timeline-refund {
	    font-size: 14rpx;
	    color: #fff;
	    font-weight: bold;
	    line-height: 1;
	  }
	}
	
	.abandon-dot {
	  background-color: #d9534f !important;
	
	  .timeline-abandon {
	    font-size: 16rpx;
	    color: #fff;
	    font-weight: bold;
	    line-height: 1;
	  }
	}
	
	.timeout-dot {
	  background-color: #f0ad4e !important;
	
	  .timeline-timeout {
	    font-size: 14rpx;
	    color: #fff;
	    font-weight: bold;
	    line-height: 1;
	  }
	}
	.timeout-back {
	  background-color: #5bc0de !important;
	  .timeline-timeout {
	    font-size: 14rpx;
	    color: #fff;
	    font-weight: bold;
	    line-height: 1;
	  }
	}
	.back-title{
		color: #5bc0de !important;  
	}
	
	.update-dot {
	  background-color: #5bc0de !important;
	
	  .timeline-update {
	    font-size: 14rpx;
	    color: #fff;
	    font-weight: bold;
	    line-height: 1;
	  }
	}
	.modal-content {
		background-color: #fff;
	  padding: 30rpx;
	}
</style>