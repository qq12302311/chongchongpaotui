<template>
	<view class="order-info">
		<!-- 顶部导航栏 -->
		<nav-bar title="订单详情" title-align="center"></nav-bar>

	<!-- 导航栏占位元素 -->
	<view class="nav-placeholder"></view>

	<!-- 悬浮预估完单时间卡片 - 可拖拽 -->
	<!-- <view
		class="estimate-float-card"
		v-if="showEstimateCard && orderInfo.status === 'assigned' && orderInfo.task_assignment && orderInfo.task_assignment.predict_complete_type == null"
		:style="{
			left: estimateCardPosition.x + 'px',
			top: estimateCardPosition.y + 'px'
		}"
		@touchstart="handleEstimateTouchStart"
		@touchmove="handleEstimateTouchMove"
		@touchend="handleEstimateTouchEnd">
		<view class="estimate-card-content">
			<view class="estimate-selector-row">
				<picker 
					mode="selector" 
					:range="estimateTimeOptions" 
					range-key="label"
					@change="onEstimateTimeChange"
					class="estimate-picker">
					<view class="estimate-picker-content">
						<text class="estimate-label">请选择</text>
					</view>
				</picker>
			</view>
			<view class="estimate-selector-row-right">
				<view class="estimate-picker-content">
					<text class="estimate-label">{{ estimateTimeDisplay }}</text>
					<text class="estimate-arrow">▼</text>
				</view>
			</view>
			<button class="estimate-submit-btn" @click="submitEstimateTime">确认提交</button>
		</view>
	</view> -->

	<!-- 订单城市平均完单时效 -->
	<view class="city-efficiency-wrapper" v-if="orderInfo.estimated_completion_hours">
		<view class="city-efficiency-card">
			<view class="efficiency-content">
				<view class="city-area">
					<image src="https://ccpt.qiniu.0871.cn/tb11.png" class="location-icon" mode="aspectFit"></image>
					<text class="city-name">{{ orderInfo.city_name }} · {{ orderInfo.district_name }}</text>
				</view>
				<text class="efficiency-label">近100单平均完单时效：</text>
				<text class="efficiency-value">{{ displayEstimatedHours }}h</text>
			</view>
		</view>
	</view>

	<!-- 用户评价卡片 - 仅在已确认完成状态下显示，且在最上方 -->
	<view class="review-card" v-if="orderInfo.status === 'completed' && orderInfo.review">
		<view class="card-title">
			<text>用户评价</text>
		</view>
		<view class="review-card-content">
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

	<!-- 用户确认卡片 - 仅在已确认完成状态下显示，在用户评价下方 -->
	<view class="confirm-card" v-if="orderInfo.status === 'completed'">
		<view class="card-title">
			<text>用户确认</text>
		</view>
		<view class="confirm-content">
			<view class="confirm-info">
				<view class="remark" v-if="orderInfo.completed_at">
					<text class="label">确认时间：</text>
					<text class="content">{{ formatDateTime(orderInfo.completed_at) }}</text>
				</view>
			</view>
		</view>
	</view>

	<!-- 完成反馈卡片 - 仅在已确认完成状态下显示，在用户确认下方 -->
	<view class="feedback-card" v-if="orderInfo.status === 'completed'">
		<view class="card-title">
			<text>完成反馈</text>
		</view>
		<view class="detail-list-wrapper">
			<view class="feedback-content" :style="{ maxHeight: feedbackExpanded ? 'none' : '300rpx' }">
			<view class="feedback-info">
				<view class="remark" v-if="orderInfo.task_assignment.finished_at">
					<text class="label">完成时间：</text>
					<text class="content">{{ orderInfo.task_assignment.finished_at }}</text>
			</view>
				<view class="remark" v-if="orderInfo.task_assignment.after_detail">
					<text class="label">完成反馈：</text>
					<text class="content">{{ orderInfo.task_assignment.after_detail }}</text>
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
		<!-- 模糊效果层 -->
		<view class="blur-mask" v-if="!feedbackExpanded"></view>
	</view>
	
	<!-- 展开/收起按钮 -->
	<view class="expand-btn" @click="toggleFeedbackExpand">
		<view class="expand-btn-content">
			<text class="expand-text">{{ feedbackExpanded ? '收起' : '展开' }}</text>
			<view class="expand-icon" :class="{ 'expanded': feedbackExpanded }">
				<uni-icons type="bottom" size="16" color="#2492F2"></uni-icons>
			</view>
		</view>
	</view>
	</view>

	<!-- 地图和门店信息卡片 -->
	<view class="order-card map-store-card">
		<!-- 卡片背景图 -->
		<image class="card-bg-image store-bg-image" src="https://ccpt.qiniu.0871.cn/riderEnd/fuwumendian.svg" mode="aspectFit"></image>
		<!-- 地图导航 -->
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
				<!-- 导航按钮 -->
				<view class="map-nav-button">
					<text class="nav-text">门店地址：{{orderInfo.district_name}}{{orderInfo.task_detail && orderInfo.task_detail.store_name ? orderInfo.task_detail.store_name : ''}} 点击导航 ></text>
				</view>
			</view>
		</view>
		
	<!-- 地图下方警告提示 -->
	<view class="map-warning-container">
		<view class="arrow-up"></view>
		<text class="time-warning-text">通过其他导航或团购平台核对地址，再出发！</text>
	</view>
	
	<!-- 门头照 -->
	<view class="info-row photo-row" v-if="orderInfo.task_detail && orderInfo.task_detail.pic_url && orderInfo.task_detail.pic_url.length > 0">
		<view class="dot-icon"></view>
		<text class="info-label">门头照</text>
		<view class="info-value">
			<view class="shop-images">
				<image v-for="(url, index) in orderInfo.task_detail.pic_url" :key="index" :src="url"
					mode="aspectFill" @click="previewImage(index)" class="shop-image"></image>
			</view>
		</view>
	</view>
	
<!-- 服务门店 -->
<view class="info-row">
	<view class="dot-icon"></view>
	<text class="info-label">服务门店</text>
	<view class="info-value-wrapper">
		<text class="info-value">{{ orderInfo.task_detail && orderInfo.task_detail.store_name ? orderInfo.task_detail.store_name : '未知门店' }}</text>
		<view class="copy-btn" @click.stop="copyText(orderInfo.task_detail && orderInfo.task_detail.store_name ? orderInfo.task_detail.store_name : '', '服务门店')">
			<image src="https://ccpt.qiniu.0871.cn/adminEnd/copy.svg" style="width: 26rpx; height: 26rpx;"></image>
		</view>
	</view>
</view>

<!-- 地址详情 -->
<view class="info-row">
	<view class="dot-icon" style="opacity: 0;"></view>
	<text class="info-label">地址详情</text>
	<view class="info-value-wrapper">
		<text class="info-value">{{ orderInfo.shop_address ? orderInfo.shop_address : '无' }}</text>
		<view class="copy-btn" @click.stop="copyText(orderInfo.shop_address ? orderInfo.shop_address : '', '地址详情')">
			<image src="https://ccpt.qiniu.0871.cn/adminEnd/copy.svg" style="width: 26rpx; height: 26rpx;"></image>
		</view>
	</view>
</view>
	
<!-- 门店POI -->
	<view class="info-row poi-row">
		<!-- <view class="poi-warning-container" v-if="orderInfo.task_detail && orderInfo.task_detail.shop_poi">
			<text class="poi-warning-text">必核对机型，避免补错！</text>
		</view> -->
		<view class="dot-icon" style="opacity: 0;"></view>
		<text class="info-label">门店POI</text>
		<view class="info-value-wrapper">
			<text class="info-value">{{ orderInfo.task_detail && orderInfo.task_detail.shop_poi ? orderInfo.task_detail.shop_poi : '无' }}</text>
			<view class="copy-btn" v-if="orderInfo.task_detail && orderInfo.task_detail.shop_poi" @tap.stop="copyDeviceCode(orderInfo.task_detail.shop_poi)">
				<image src="https://ccpt.qiniu.0871.cn/adminEnd/copy.svg" style="width: 26rpx; height: 26rpx;"></image>
			</view>
		</view>
	</view>
		
<!-- 设备编码 -->
<view class="info-row device-code-row">
	<!-- 红色警告提示 -->
	<view class="time-warning-container">
		<text class="time-warning-text">务必核对柜机编码，避免补错！</text>
	</view>
	<view class="dot-icon" style="opacity: 0;"></view>
	<text class="info-label">设备编码</text>
		<view class="device-code-value">
			<view v-for="(code, index) in deviceCodes" :key="index" class="device-code-item">
				<text class="code-text">{{ code }}</text>
				<view class="copy-btn" @tap.stop="copyDeviceCode(code)">
					<image src="https://ccpt.qiniu.0871.cn/adminEnd/copy.svg" style="width: 26rpx; height: 26rpx;"></image>
				</view>
			</view>
			<text v-if="deviceCodes.length === 0">无</text>
		</view>
	</view>
	</view>

	<!-- 订单信息卡片 -->
	<view class="order-card order-info-card">
		<!-- 卡片背景图 -->
		<image class="card-bg-image order-bg-image" src="https://ccpt.qiniu.0871.cn/riderEnd/index/12311.svg" mode="aspectFit"></image>
		<!-- 订单编号 -->
		<view class="info-row">
			<view class="dot-icon"></view>
			<text class="info-label">订单编号</text>
			<view class="info-value-wrapper">
				<text class="info-value">{{ orderInfo.task_no }}</text>
				<view class="copy-btn" @tap.stop="copyOrderNumber">
					<image src="https://ccpt.qiniu.0871.cn/adminEnd/copy.svg" style="width: 26rpx; height: 26rpx;"></image>
				</view>
			</view>
		</view>
		
	<!-- 主项服务 -->
	<view class="info-row">
		<view class="dot-icon" style="opacity: 0;"></view>
		<text class="info-label">主项服务</text>
			<view :class="['service-tag', getBrandClass()]">{{ displayBrand }}</view>
			<text class="info-value">{{ displayServiceName }} <text style="color: #1890ff;">x{{ orderInfo.task_detail && orderInfo.task_detail.item_number ? orderInfo.task_detail.item_number : 1 }}</text></text>
		</view>
		
<!-- 附加服务 -->
<view class="info-row">
	<view class="dot-icon" style="opacity: 0;"></view>
	<text class="info-label">附加服务</text>
		<view :class="['service-tag', getBrandClass()]" v-if="hasExtraServices">{{ displayBrand }}</view>
		<view class="extra-services-text" v-if="hasExtraServices">
			<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_1">
				<text class="service-name">{{ orderInfo.task_detail.extra_task_1 }}</text>
				<text class="service-count"> x{{ orderInfo.task_detail.extra_task_1_item_number }}</text>
				<text v-if="orderInfo.task_detail.extra_task_2 || orderInfo.task_detail.extra_task_3 || orderInfo.task_detail.extra_task_4 || orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="service-separator">、</text>
			</template>
			<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_2">
				<text class="service-name">{{ orderInfo.task_detail.extra_task_2 }}</text>
				<text class="service-count"> x{{ orderInfo.task_detail.extra_task_2_item_number }}</text>
				<text v-if="orderInfo.task_detail.extra_task_3 || orderInfo.task_detail.extra_task_4 || orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="service-separator">、</text>
			</template>
			<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_3">
				<text class="service-name">{{ orderInfo.task_detail.extra_task_3 }}</text>
				<text class="service-count"> x{{ orderInfo.task_detail.extra_task_3_item_number }}</text>
				<text v-if="orderInfo.task_detail.extra_task_4 || orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="service-separator">、</text>
			</template>
			<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_4">
				<text class="service-name">{{ orderInfo.task_detail.extra_task_4 }}</text>
				<text class="service-count"> x{{ orderInfo.task_detail.extra_task_4_item_number }}</text>
				<text v-if="orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="service-separator">、</text>
			</template>
			<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_5">
				<text class="service-name">{{ orderInfo.task_detail.extra_task_5 }}</text>
				<text class="service-count"> x{{ orderInfo.task_detail.extra_task_5_item_number }}</text>
				<text v-if="orderInfo.task_detail.extra_task_6" class="service-separator">、</text>
			</template>
			<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_6">
				<text class="service-name">{{ orderInfo.task_detail.extra_task_6 }}</text>
				<text class="service-count"> x{{ orderInfo.task_detail.extra_task_6_item_number }}</text>
			</template>
		</view>
	<text class="info-value" v-else>无</text>
</view>

<!-- 打赏金额 -->
<view class="info-row" v-if="orderInfo.rewardInfo">
	<view class="dot-icon" style="opacity: 0;"></view>
	<text class="info-label">打赏金额</text>
	<text class="info-value" style="color: #FF6B00; font-weight: 500;">¥{{ getRewardAmount(orderInfo) }}</text>
</view>

<!-- 时效费用 -->
<view class="info-row">
	<view class="dot-icon" style="opacity: 0;"></view>
	<text class="info-label">时效费用</text>
	<text class="info-value" style="color: #FF6B00; font-weight: 500;">{{ orderInfo.time_fee ? '¥' + orderInfo.time_fee : '¥0.00' }}</text>
</view>

	<!-- 设备位置 -->
	<view class="info-row" v-if="orderInfo.task_detail && orderInfo.task_detail.device_outside !== undefined">
		<view class="dot-icon" style="opacity: 0;"></view>
		<text class="info-label">设备位置</text>
			<text class="info-value">{{ orderInfo.task_detail.device_outside ? '外摆' : '非外摆' }}</text>
		</view>
		<!-- 预估完单 -->
		<view class="info-row" v-if="orderInfo.task_assignment && orderInfo.task_assignment.predict_complete_type !== undefined">
			<view class="dot-icon" style="opacity: 0;"></view>
			<text class="info-label">预估完单</text>
			<text class="info-value">{{ orderInfo.task_assignment.predict_complete_type || '无' }}</text>
		</view>
	</view>

	<!-- 约定时效和上门时段卡片 -->
	<view class="order-card time-card">
		<!-- 卡片背景图 -->
		<image class="card-bg-image time-bg-image" src="https://ccpt.qiniu.0871.cn/riderEnd/yuedingshixiao.svg" mode="aspectFit"></image>
		<!-- 约定时效 -->
		<view class="info-row time-row">
			<view class="dot-icon"></view>
			<text class="info-label">约定时效</text>
			<text class="info-value">{{ formatNewServiceTime() }}</text>
			<text class="deadline-value" v-if="orderInfo.deadline"> {{ orderInfo.deadline }}前完成</text>
		</view>
		
	<!-- 上门时段 -->
	<view class="info-row door-time-row" v-if="orderInfo.recommended_service_time_start && orderInfo.recommended_service_time_end">
		<!-- 红色警告提示 -->
		<view class="time-warning-container">
			<text class="time-warning-text">请过其他导航或团购平台门店信息核实时间，以免跑空！</text>
		</view>
		<view class="dot-icon" style="opacity: 0;"></view>
		<text class="info-label">上门时段</text>
			<text class="info-value">{{ getRecommendedTimeDisplay() }}</text>
		</view>
	</view>

	<!-- 订单备注卡片 -->
	<view class="order-card remark-card-new">
		<!-- 卡片背景图 -->
		<image class="card-bg-image remark-bg-image" src="https://ccpt.qiniu.0871.cn/riderEnd/dingdanbeizhu.svg" mode="aspectFit"></image>
		<view class="info-row">
			<view class="dot-icon"></view>
			<text class="info-label">订单备注</text>
			<text class="info-value">{{ filteredOrderNotes || '无' }}</text>
		</view>
	</view>

	<!-- 隐藏旧的订单详情列表 -->
	<view class="order-info-list" style="display: none;">
		<view class="divider"></view>
				<!-- <view class="info-item">
					<text class="label">附加服务：</text>
					<text class="value">
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_1">
							<text class="task-name">{{ orderInfo.task_detail.extra_task_1 }}</text>
							<text class="item-number">x{{ orderInfo.task_detail.extra_task_1_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_2 || orderInfo.task_detail.extra_task_3 || orderInfo.task_detail.extra_task_4 || orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="task-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_2">
							<text class="task-name">{{ orderInfo.task_detail.extra_task_2 }}</text>
							<text class="item-number">x{{ orderInfo.task_detail.extra_task_2_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_3 || orderInfo.task_detail.extra_task_4 || orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="task-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_3">
							<text class="task-name">{{ orderInfo.task_detail.extra_task_3 }}</text>
							<text class="item-number">x{{ orderInfo.task_detail.extra_task_3_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_4 || orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="task-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_4">
							<text class="task-name">{{ orderInfo.task_detail.extra_task_4 }}</text>
							<text class="item-number">x{{ orderInfo.task_detail.extra_task_4_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_5 || orderInfo.task_detail.extra_task_6" class="task-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_5">
							<text class="task-name">{{ orderInfo.task_detail.extra_task_5 }}</text>
							<text class="item-number">x{{ orderInfo.task_detail.extra_task_5_item_number }}</text>
							<text v-if="orderInfo.task_detail.extra_task_6" class="task-separator">、</text>
						</template>
						<template v-if="orderInfo.task_detail && orderInfo.task_detail.extra_task_6">
							<text class="task-name">{{ orderInfo.task_detail.extra_task_6 }}</text>
							<text class="item-number">x{{ orderInfo.task_detail.extra_task_6_item_number }}</text>
						</template>
						<text v-if="!orderInfo.task_detail || (!orderInfo.task_detail.extra_task_1 && !orderInfo.task_detail.extra_task_2 && !orderInfo.task_detail.extra_task_3 && !orderInfo.task_detail.extra_task_4 && !orderInfo.task_detail.extra_task_5 && !orderInfo.task_detail.extra_task_6)" class="task-name">无</text>
					</text>
				</view>
				<view class="divider"></view> -->
				<view class="sn-tip-bg sn-tip">
					<text>小哥：请务必核对柜机SN 或MAC码，避免补错！</text>
				</view>
				<view class="info-item">
					<text class="label">设备编码：</text>
					<view class="value device-codes">
						<view 
							v-for="(code, index) in deviceCodes" 
							:key="index" 
							class="code-item">
							<text class="code-text">{{ code }}</text>
							<view class="copy-code-btn" @tap="copyDeviceCode(code)">
								<text class="copy-text">复制</text>
							</view>
						</view>
						<text v-if="deviceCodes.length === 0" class="no-code">无</text>
					</view>
				</view>
				<view class="divider" v-if="orderInfo.task_detail && orderInfo.task_detail.device_outside !== undefined"></view>
				<view class="info-item" v-if="orderInfo.task_detail && orderInfo.task_detail.device_outside !== undefined">
					<text class="label">设备是否外摆：</text>
					<text class="value">{{ orderInfo.task_detail.device_outside ? '是' : '否' }}</text>
				</view>
				<view class="info-item" v-if="orderInfo.task_detail && orderInfo.task_detail.shop_poi">
					<text class="label">门店POI：</text>
					<text class="value">{{ orderInfo.task_detail.shop_poi }}</text>
				</view>
		<view class="divider"></view>
		<view class="info-item" v-if="orderInfo.task_detail && orderInfo.task_detail.pic_url && orderInfo.task_detail.pic_url.length > 0">
			<text class="label">门头照：</text>
			<view class="value">
				<view class="shop-images">
					<image v-for="(url, index) in orderInfo.task_detail.pic_url" :key="index" :src="url"
						mode="aspectFill" @click="previewImage(index)" class="shop-image"></image>
				</view>
			</view>
		</view>
		<view class="divider" v-if="orderInfo.task_detail && orderInfo.task_detail.pic_url && orderInfo.task_detail.pic_url.length > 0"></view>
		<view class="info-item" v-if="orderInfo.task_detail && orderInfo.task_detail.description">
			<text class="label">订单备注：</text>
			<view class="value">
				<text class="remark-text">{{ orderInfo.task_detail.description }}</text>
			</view>
		</view>
		<view class="divider" v-if="orderInfo.task_detail && orderInfo.task_detail.description"></view>
		<view class="info-item">
			<text class="label">服务时效：</text>
			<text class="value">{{ formatNewServiceTime() }}</text>
		</view>
		<view class="divider"></view>
		<view class="info-item">
			<text class="label">时效费用：</text>
			<text class="value" style="color: #FF6B00; font-weight: 500;">{{ orderInfo.time_limit_fee ? '¥' + orderInfo.time_limit_fee : '¥0.00' }}</text>
		</view>
		<!-- 打赏金额 -->
		<view class="divider" v-if="orderInfo.rewardInfo"></view>
		<view class="info-item" v-if="orderInfo.rewardInfo">
			<text class="label">打赏金额：</text>
			<text class="value" style="color: #FF6B00; font-weight: 500;">¥{{ getRewardAmount(orderInfo) }}</text>
		</view>
		<!-- 订单总金额 -->
		<view class="divider" v-if="orderInfo.rewardInfo"></view>
		<view class="info-item" v-if="orderInfo.rewardInfo">
			<text class="label">订单总额：</text>
			<text class="value" style="color: #FF6B00; font-weight: 600; font-size: 32rpx;">{{ getTotalAmountWithReward(orderInfo) }}</text>
		</view>
		<view class="divider" v-if="orderInfo.rewardInfo"></view>
		<view class="info-item" v-if="orderInfo.rewardInfo" style="background-color: #FFF7E6; padding: 15rpx 0; margin: 0 -30rpx; padding-left: 30rpx;">
			<text class="label"></text>
			<text class="value" style="color: #FF6B00; font-size: 24rpx;">
				（订单{{ getDisplayAmount(orderInfo) }}+打赏¥{{ getRewardAmount(orderInfo) }}）
			</text>
		</view>
		<!-- 建议骑手上门时间段 -->
		<view class="divider" v-if="orderInfo.recommended_service_time_start && orderInfo.recommended_service_time_end"></view>
		<view class="info-item" v-if="orderInfo.recommended_service_time_start && orderInfo.recommended_service_time_end">
			<text class="label">建议骑手上门时间段：</text>
			<text class="value">{{ getRecommendedTimeDisplay() }}</text>
		</view>
		
		<view class="time-note2">请小哥自行通过其他导航或者团购平台门店电话确认时间</view>
	<!-- 订单备注 -->
	<view class="divider"></view>
	<view class="info-item">
		<text class="label">订单备注：</text>
		<text class="value order-notes">{{ filteredOrderNotes || '无' }}</text>
	</view>
				<!-- <view class="divider"></view>
				<view class="info-item">
					<text class="label">费用明细：</text>
					<view class="value">
						<view class="fee-detail">
							<view class="fee-item">
								<text class="fee-label">基础服务费：</text>
								<text class="fee-value">{{ getDisplayAmount({ ...orderInfo, order_amount: orderInfo.base_service_fee }) }}</text>
							</view>
							<view class="fee-item">
								<text class="fee-label">附加服务费：</text>
								<text class="fee-value">{{ getDisplayAmount({ ...orderInfo, order_amount: orderInfo.additional_service_fee }) }}</text>
							</view>
							<view class="fee-item" v-if="orderInfo.ticket_amount && Number(orderInfo.ticket_amount) > 0">
								<text class="fee-label">优惠券减免：</text>
								<text class="fee-value" style="color:#52c41a;">-¥{{ getDisplayAmount({ ...orderInfo, order_amount: orderInfo.ticket_amount }) }}</text>
							</view>
							<view class="fee-item total">
								<text class="fee-label">总计：</text>
								<text class="fee-value">{{ getDisplayAmount(orderInfo) }}</text>
							</view>
						</view>
					</view>
				</view> -->
		</view>

	<!-- 完成反馈卡片 - 仅在待用户确认状态（finished）显示 -->
	<view class="feedback-card" v-if="orderInfo.status === 'finished'">
			<view class="card-title">
				<text>完成反馈</text>
				<!-- 再次修改按钮，只在订单状态为待用户确认时显示 -->
				<button
					class="modify-btn"
					@click="modifyFeedback">
					再次修改
				</button>
			</view>
			<view class="detail-list-wrapper">
				<view class="feedback-content" :style="{ maxHeight: feedbackExpanded ? 'none' : '300rpx' }">
				<view class="feedback-info">
					<view class="remark" v-if="orderInfo.task_assignment.finished_at">
						<text class="label">完成时间：</text>
						<text class="content">{{ orderInfo.task_assignment.finished_at }}</text>
				</view>
					<view class="remark" v-if="orderInfo.task_assignment.after_detail">
						<text class="label">完成反馈：</text>
						<text class="content">{{ orderInfo.task_assignment.after_detail }}</text>
					</view>
					<!-- 其他备注已取消 -->
					<!-- <view class="remark" v-if="orderInfo.task_assignment.additional_feedback">
						<text class="label">其他备注：</text>
						<text class="content">{{ orderInfo.task_assignment.additional_feedback }}</text>
					</view> -->
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
			<!-- 模糊效果层 -->
			<view class="blur-mask" v-if="!feedbackExpanded"></view>
		</view>
		
		<!-- 展开/收起按钮 -->
		<view class="expand-btn" @click="toggleFeedbackExpand">
			<view class="expand-btn-content">
				<text class="expand-text">{{ feedbackExpanded ? '收起' : '展开' }}</text>
				<view class="expand-icon" :class="{ 'expanded': feedbackExpanded }">
					<uni-icons type="bottom" size="16" color="#2492F2"></uni-icons>
				</view>
			</view>
		</view>
	</view>

		<!-- 底部按钮 -->
		<view class="bottom-bar">
			<view class="home-btn" @click="goToHome">
				<image src="https://ccpt.qiniu.0871.cn/rider/home.png" mode="aspectFit"></image>
				<text>接单大厅</text>
			</view>
			<!-- <view class="chat-btn" @click="goToChat">
				<image src="https://ccpt.qiniu.0871.cn/rider/chat.png" mode="aspectFit"></image>
				<text>聊天</text>
			</view> -->
			<template v-if="orderInfo.status === 'assigned'">
				<button class="cancel-btn" @click="showCancelConfirm">放弃</button>
				<button class="confirm-btn" @click="showFeedbackPopup">提交完成订单反馈</button>
			</template>
			<button class="confirm-btn" v-else-if="orderInfo.status === 'finished'" disabled>24小时客户未确认  系统自动确认</button>
			<button class="confirm-btn" v-else-if="orderInfo.status === 'completed'" disabled>已确认完成</button>
			<button class="confirm-btn" v-else disabled>等待接单</button>
		</view>

		<!-- 完成反馈弹窗 -->
		<view class="feedback-popup" v-if="showPopup">
			<view class="popup-mask" @click="closeFeedbackPopup"></view>
			<view class="popup-content">
			<view class="popup-header">
				<image class="header-image" src="https://ccpt.qiniu.0871.cn/tjwct.png" mode="widthFix"></image>
				<text class="close" @click="closeFeedbackPopup">×</text>
			</view>
				<view class="popup-body">
					<view style="background-color: #F5F9FF;">
						<!-- 示例图展示 -->
						<view class="example-section">
							<view class="example-images">
								<view class="example-item">
									<text class="example-label">到店持宝打卡</text>
									<image src="https://ccpt.qiniu.0871.cn/tupian1.jpg" mode="aspectFill" class="example-image"></image>
									<text class="example-tag">示例图</text>
								</view>
								<view class="example-item">
									<text class="example-label">维护前</text>
									<image src="https://ccpt.qiniu.0871.cn/tupian2.jpg" mode="aspectFill" class="example-image"></image>
									<text class="example-tag">示例图</text>
								</view>
								<view class="example-item">
									<text class="example-label">维护后</text>
									<image src="https://ccpt.qiniu.0871.cn/tupian3.jpg" mode="aspectFill" class="example-image"></image>
									<text class="example-tag">示例图</text>
								</view>
								<view class="example-item">
									<text class="example-label">仓宝状态确认</text>
									<image src="https://ccpt.qiniu.0871.cn/tupian4.jpg" mode="aspectFill" class="example-image"></image>
									<text class="example-tag">示例图</text>
								</view>
							</view>
						</view>
						
						<!-- 完成反馈板块 -->
						<view class="feedback-display-section">
							<view class="feedback-header">
								<text class="feedback-title">完成反馈</text>
								<text class="toggle-btn" @click="toggleFeedbackDisplay">{{ showFeedbackDisplay ? '收起' : '展开' }}</text>
							</view>
							<view class="feedback-content" v-show="showFeedbackDisplay">
								<text class="feedback-text">已按订单要求宝数完成补宝！</text>
								<text class="feedback-text">场内独家，无异常！商户反馈要求及时补宝。</text>
							</view>
						</view>
					</view>
					
					<view class="upload-section">
						<text class="section-title">上传完成照片<text class="required">*</text></text>
						<view class="image-grid">
							<!-- 到店打卡 -->
							<view class="image-upload-item">
								<text class="upload-label">到店打卡<text class="required">*</text></text>
								<view class="upload-container" @click="chooseImage('checkin')" v-if="!feedbackImages.checkin">
									<text class="plus">+</text>
									<text class="upload-text">上传照片</text>
								</view>
								<view class="image-preview" v-else>
									<image :src="feedbackImages.checkin" mode="aspectFill" class="preview-image"></image>
									<text class="delete-btn" @click="deleteImage('checkin')">×</text>
								</view>
							</view>

							<!-- 维护前 -->
							<view class="image-upload-item">
								<text class="upload-label">维护前<text class="required">*</text></text>
								<view class="upload-container" @click="chooseImage('before')" v-if="!feedbackImages.before">
									<text class="plus">+</text>
									<text class="upload-text">上传照片</text>
								</view>
								<view class="image-preview" v-else>
									<image :src="feedbackImages.before" mode="aspectFill" class="preview-image"></image>
									<text class="delete-btn" @click="deleteImage('before')">×</text>
								</view>
							</view>

							<!-- 维护后 -->
							<view class="image-upload-item">
								<text class="upload-label">维护后<text class="required">*</text></text>
								<view class="upload-container" @click="chooseImage('after')" v-if="!feedbackImages.after">
									<text class="plus">+</text>
									<text class="upload-text">上传照片</text>
								</view>
								<view class="image-preview" v-else>
									<image :src="feedbackImages.after" mode="aspectFill" class="preview-image"></image>
									<text class="delete-btn" @click="deleteImage('after')">×</text>
								</view>
							</view>

						<!-- 仓宝状态确认 -->
						<view class="image-upload-item">
							<text class="upload-label">仓宝状态确认</text>
							<view class="upload-container" @click="chooseImage('confirm')" v-if="!feedbackImages.confirm">
								<text class="plus">+</text>
								<text class="upload-text">上传照片</text>
							</view>
							<view class="image-preview" v-else>
								<image :src="feedbackImages.confirm" mode="aspectFill" class="preview-image"></image>
								<text class="delete-btn" @click="deleteImage('confirm')">×</text>
							</view>
						</view>
						</view>
					</view>

					<!-- 其他反馈图片单独一行 -->
					<view class="other-images-section">
						<text class="section-title">其他反馈图片（选填，最多4张）</text>
						<view class="other-images-grid">
							<view
								v-for="(image, index) in otherImages"
								:key="index"
								class="other-image-item">
								<view class="image-preview">
									<image :src="image" mode="aspectFill" class="preview-image"></image>
									<text class="delete-btn" @click="deleteOtherImage(index)">×</text>
								</view>
							</view>
							<view
								v-if="otherImages.length < 4"
								class="other-image-item">
								<view class="upload-container" @click="chooseOtherImage">
									<text class="plus">+</text>
									<text class="upload-text">上传照片</text>
								</view>
							</view>
						</view>
					</view>
					<view class="remark-section">
						<text class="section-title">完成反馈<text class="required">*</text></text>
						<textarea class="remark-input" v-model="feedbackRemark" placeholder="请反馈完成情况，如现场有其他异常情况或商户反馈问题，也请一并反馈给客户！" maxlength="200"></textarea>
						<!-- <view class="remark-hint" v-if="!feedbackRemark || feedbackRemark.trim().length === 0">
							<text class="hint-title">骑手小哥辛苦啦！</text>
							<text class="hint-text">请反馈完成情况，如现场有其他异常情况或商户反馈问题，也请一并反馈给客户！</text>
						</view> -->
						<text class="word-count">{{ feedbackRemark.length }}/200字</text>
					</view>
					<!-- 其他反馈已取消 -->
					<!-- <view class="other-feedback-section">
						<text class="section-title">其他反馈（选填）</text>
						<textarea class="other-feedback-input" v-model="otherFeedback" placeholder="充充骑手您辛苦了！根据现场情况，您还有哪些反馈和建议。帮助客户提高收益、避免资损。亦有助于后续增加下单跑腿哦！" maxlength="200"></textarea>
						<text class="word-count">{{ otherFeedback.length }}/200</text>
					</view> -->
				</view>
				<view class="popup-footer">
					<button class="submit-btn" @click="submitFeedback">提交</button>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="loading">
			<div class="loading-spinner"></div>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 放弃任务确认弹窗 -->
		<view class="cancel-popup" v-if="showCancelModal">
			<view class="popup-mask" @click="handleCancelCancel"></view>
			<view class="cancel-popup-content">
				<!-- 顶部图片区域 -->
				<view class="cancel-header-wrapper">
					<image class="cancel-header-image" src="https://ccpt.qiniu.0871.cn/riderEnd/qxtc.png" mode="widthFix"></image>
					<!-- 红色提示文字 -->
					<text class="cancel-warning-text">辛苦小哥尽量完成订单！</text>
					<text class="cancel-warning-text-2">放弃将消耗您1次接单配额！</text>
				</view>
				
				<!-- 白色内容区 -->
				<view class="cancel-white-bg">
					<!-- 取消原因 -->
					<view class="cancel-body">
						<view class="cancel-reason-section">
							<text class="cancel-reason-title">取消原因（必填）：</text>
							<textarea 
								class="cancel-reason-input" 
								v-model="cancelReason" 
								placeholder="请在此处填写" 
								maxlength="100"
							></textarea>
							<text class="cancel-word-count">{{ cancelReason.length }}/100字</text>
						</view>
					</view>
					
					<!-- 底部按钮 -->
					<view class="cancel-footer">
						<button class="cancel-give-up-btn" @click="handleCancelConfirm">狠心放弃</button>
						<button class="cancel-continue-btn" @click="handleCancelCancel">继续任务</button>
					</view>
				</view>
			</view>
		</view>

	<!-- 悬浮钱袋图标 -->
	<view class="floating-money-bag" @click="handleMoneyBagClick" v-if="orderInfo.rewardInfo">
		<image class="money-bag-icon" src="https://ccpt.qiniu.0871.cn/riderEnd/qiandai.svg" mode="aspectFit"></image>
	</view>

	<!-- 悬浮聊天图标 -->
	<floating-chat-icon 
		:orderId="taskId" 
		:orderTitle="`${orderInfo.city_name || ''}${orderInfo.district_name || ''} ${taskId}`">
	</floating-chat-icon>
</view>
</template>

<script>
	import NavBar from '@/components/NavBar.vue'
	import AuthModal from '@/components/AuthModal/index.vue'
	import FloatingChatIcon from '@/components/FloatingChatIcon/index.vue'
	import md5 from 'md5'

	export default {
		components: {
			NavBar,
			AuthModal,
			FloatingChatIcon
		},
		data() {
			return {
				orderInfo: {
					shop_address: '',
					task_no: '',
					task_date: '',
					brand: '',
					task_detail: {
						task_name: '',
						item_number: 0,
						description: '',
						sn_mac_code: []
					},
					start_date: '',
					deadline: '',
					order_amount: '0.00'
				},
				brandMap: {
					'meituan': '美团',
					'guaishou': '怪兽',
					'jiedian': '街电',
					'xiaodian': '小电'
				},
				taskId: '',
				riderUserInfo: null,
				loading: true,
				countdown: '计算中...',
				timer: null,
				taskDuration: '', // 将taskDuration从计算属性改为数据属性
				isTransferred: false, // 是否为转派订单
				transferredPrice: '', // 转派后的价格
				detailInfo: {
					shopName: '',
					detailAddress: '',
					priceDetails: [],
					snCode: '',
					macCode: '',
					shopImage: ''
				},
			showPopup: false,
			feedbackImages: {
				checkin: '', // 到店打卡
				before: '', // 维护前
				after: '', // 维护后
				confirm: '' // 仓宝状态确认
			},
			otherImages: [], // 其他反馈图片数组，最多4张
			feedbackRemark: '',
			otherFeedback: '',
			showCancelModal: false, // 控制放弃任务弹窗显示
			feedbackExpanded: false, // 控制完成反馈的展开/收起状态，默认收起
				cancelReason: '', // 放弃任务原因
				isModifyMode: false, // 标识是否为修改模式
				showFeedbackDisplay: true, // 控制完成反馈展示的展开/收起
			// 区域微信号映射
			regionWechatMap: {
				'京津冀 东三省 内蒙 海南': 'HKxgs2020',
				'云南贵州广西湖北西藏': 'weiazzy',
				'剩余区域': 'agan-24h'
			},
			mapMarkers: [], // 地图标记点
			// 预估完单时间相关
			showEstimatePopup: false, // 控制预估完单时间弹窗显示
			estimateTimeValue: '', // 选中的预估时间值
			estimateTimeDisplay: '请选择', // 显示的预估时间文本
			estimateTimeOptions: [
				{ value: 'within3h', label: '3小时内' },
				{ value: 'today', label: '今天内' },
				{ value: 'tomorrowAM', label: '明天上午' },
				{ value: 'tomorrowPM', label: '明天下午' },
				{ value: 'tomorrow', label: '明天内' },
				{ value: 'customDate', label: '后天内' },
				{ value: 'uncertain', label: '不确定' }
			],
			showEstimateCard: true, // 控制预估完单卡片的显示
			// 拖拽相关
			estimateCardPosition: { x: 180, y: 390 }, // 卡片位置（单位：px）
			estimateDragStart: { x: 0, y: 0 }, // 拖拽起始位置
			estimateIsDragging: false // 是否正在拖拽
		}
	},
	computed: {
	// 计算显示的平均完单时效（真实值的60%）
	displayEstimatedHours() {
		if (!this.orderInfo.estimated_completion_hours) return 0;
		const realHours = parseFloat(this.orderInfo.estimated_completion_hours);
		const displayHours = realHours * 0.6;
		// 保留一位小数
		return displayHours.toFixed(1);
	},
	
	// 转换品牌显示
	displayBrand() {
		const brand = this.orderInfo.brand || ''
		return this.brandMap[brand.toLowerCase()] || brand
	},
		
		// 获取服务名称（完整）
		displayServiceName() {
			if (!this.orderInfo.task_detail || !this.orderInfo.task_detail.detail) {
				return this.orderInfo.task_detail && this.orderInfo.task_detail.task_name ? this.orderInfo.task_detail.task_name : '充充跑腿';
			}
			
			const detail = this.orderInfo.task_detail.detail;
			const serviceNameMap = {
				'bubao': '补宝',
				'goodRecycle': '好宝回收',
				'badRecycle': '坏宝回收',
				'offline_abnormal': '离线异常',
				'income_abnormal': '收入异常',
				'other_abnormal': '其他异常'
			};
			
			return serviceNameMap[detail] || this.orderInfo.task_detail.task_name || '充充跑腿';
		},
		
		// 获取服务名称（简化版 - 用于 .service-text）
		displayServiceTextSimplified() {
			if (!this.orderInfo.task_detail || !this.orderInfo.task_detail.detail) {
				return this.orderInfo.task_detail && this.orderInfo.task_detail.task_name ? this.orderInfo.task_detail.task_name.substring(0, 2) : '充充';
			}
			
			const detail = this.orderInfo.task_detail.detail;
			// 好宝回收、坏宝回收 → 显示"收宝"
			if (detail === 'goodRecycle' || detail === 'badRecycle') {
				return '收宝';
			}
			// 离线异常、收入异常、其他异常 → 显示"异常"
			if (detail === 'offline_abnormal' || detail === 'income_abnormal' || detail === 'other_abnormal') {
				return '异常';
			}
			// 补宝 → 显示"补宝"
			if (detail === 'bubao') {
				return '补宝';
			}
			// 其他情况取前两个字符
			return this.orderInfo.task_detail.task_name ? this.orderInfo.task_detail.task_name.substring(0, 2) : '充充';
		},

			// 格式化设备编码
			formatSnMacCodes() {
				const codes = (this.orderInfo.task_detail && this.orderInfo.task_detail.sn_mac_code) || []
				return codes.map(item => item.value).join('\n') || '无'
			},

			// 获取设备编码数组
			deviceCodes() {
				const codes = (this.orderInfo.task_detail && this.orderInfo.task_detail.sn_mac_code) || []
				return codes.map(item => item.value).filter(value => value && value.trim())
			},
			
			// 过滤订单备注中连续3位以上的数字
			filteredOrderNotes() {
				const notes = this.orderInfo.task_detail && this.orderInfo.task_detail.additional_notes
				if (!notes) return ''
				// 使用正则表达式过滤掉连续3位以上的数字
				return notes.replace(/\d{3,}/g, '')
			},
			
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
			// 已将taskDuration从计算属性改为数据属性
		},
		onLoad(options) {
			// 确保taskId是字符串类型
			this.taskId = String(options.id || '');
			
			// 检查是否是转派订单
			this.isTransferred = options.isTransferred === 'true';
			this.transferredPrice = options.transferredPrice ? decodeURIComponent(options.transferredPrice) : '';
			
			// 获取骑手信息
			this.riderUserInfo = uni.getStorageSync('riderUserInfo');
			// 获取订单详情
			this.getTaskInfo();
		},
		onUnload() {
			// 页面卸载时清除定时器
			if (this.timer) {
				clearInterval(this.timer)
			}
		},
	methods: {
		// 获取品牌对应的样式类
		getBrandClass() {
			const brand = this.orderInfo.brand || '';
			const brandClassMap = {
				'meituan': 'brand-meituan',
				'guaishou': 'brand-guaishou',
				'jiedian': 'brand-jiedian',
				'xiaodian': 'brand-xiaodian',
				'zhumang': 'brand-zhumang'
			};
			return brandClassMap[brand.toLowerCase()] || 'brand-default';
		},
		// 钱袋图标点击事件
		handleMoneyBagClick() {
			// 这里可以添加点击后的跳转或功能
			// 例如：跳转到收益页面
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			});
		},
		// 切换完成反馈展开/收起状态
		toggleFeedbackExpand() {
			this.feedbackExpanded = !this.feedbackExpanded;
		},
		// 切换完成反馈展示状态
		toggleFeedbackDisplay() {
			this.showFeedbackDisplay = !this.showFeedbackDisplay;
		},
		
		// 处理预估完单时间选择
		onEstimateTimeChange(e) {
			const index = e.detail.value;
			const selected = this.estimateTimeOptions[index];
			this.estimateTimeValue = selected.value;
			this.estimateTimeDisplay = selected.label;
		},
		
		// 提交预估完单时间
		async submitEstimateTime() {
			if (!this.estimateTimeValue) {
				uni.showToast({
					title: '请选择预估完单时间',
					icon: 'none'
				});
				return;
			}
			
			// 这里添加提交逻辑，比如调用API保存预估时间
			const riderUserInfo = uni.getStorageSync('riderUserInfo');

			// 构建请求参数
			const params = {
				task_id: this.taskId,
				user_id: riderUserInfo.id,
				predict_complete_type: this.estimateTimeDisplay,
				sign: 'chongchong'
			};

			console.log('修改订单参数:', params);

			// 调用修改接口
			const res = await this.$request('task/update/deadline', params, 'POST');
			
			if (res.code === 200) {
				uni.showToast({
					title: '提交成功',
					icon: 'success'
				});
				// 提交成功后隐藏卡片
				this.showEstimateCard = false;
				// 重新查询订单信息
				this.getTaskInfo();
			}

		},
		
		// 处理预估卡片拖拽开始
		handleEstimateTouchStart(e) {
			this.estimateIsDragging = true;
			const touch = e.touches[0];
			this.estimateDragStart = {
				x: touch.clientX - this.estimateCardPosition.x,
				y: touch.clientY - this.estimateCardPosition.y
			};
		},
		
		// 处理预估卡片拖拽移动
		handleEstimateTouchMove(e) {
			if (!this.estimateIsDragging) return;
			
			const touch = e.touches[0];
			let newX = touch.clientX - this.estimateDragStart.x;
			let newY = touch.clientY - this.estimateDragStart.y;
			
			// 获取屏幕尺寸和卡片尺寸
			const systemInfo = uni.getSystemInfoSync();
			const screenWidth = systemInfo.windowWidth;
			const screenHeight = systemInfo.windowHeight;
			const cardWidth = 170; // 340rpx 转换为 px（约170px）
			const cardHeight = 240; // 估算的卡片高度
			
			// 限制拖拽范围，不超出屏幕
			newX = Math.max(0, Math.min(newX, screenWidth - cardWidth));
			newY = Math.max(0, Math.min(newY, screenHeight - cardHeight));
			
			this.estimateCardPosition = {
				x: newX,
				y: newY
			};
		},
		
		// 处理预估卡片拖拽结束
		handleEstimateTouchEnd() {
			this.estimateIsDragging = false;
		},
		// 计算倒计时
		calculateCountdown() {
				if (!this.orderInfo.deadline) return '未知时间'

				try {
					// 根据订单时长决定提前时间：24小时单提前6小时，48小时以上提前12小时
					const deadlineDate = new Date(this.orderInfo.deadline.replace(/-/g, '/'))

					let advanceHours = 6; // 默认提前6小时
					if (this.orderInfo.start_date) {
						const startDate = new Date(this.orderInfo.start_date.replace(/-/g, '/'));
						const durationHours = (deadlineDate - startDate) / (1000 * 60 * 60); // 计算时长（小时）

					  if (durationHours >= 72) {
						advanceHours = 18; // 72小时以上提前18小时
					  } else if (durationHours >= 48) {
						advanceHours = 12; // 48小时以上提前12小时
					  } else if (durationHours >= 24) {
						advanceHours = 3;  // 24小时单提前6小时
					  }
					}

					deadlineDate.setHours(deadlineDate.getHours() - advanceHours)
					const deadline = deadlineDate.getTime()
					const now = new Date().getTime()
					const diff = deadline - now

					if (diff <= 0) {
						return '已超时'
					}

					const hours = Math.floor(diff / (1000 * 60 * 60))
					const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
					const seconds = Math.floor((diff % (1000 * 60)) / 1000)

					return `${hours}小时${minutes}分${seconds}秒`
				} catch (e) {
					console.error('计算倒计时出错:', e)
					return '计算错误'
				}
			},
			// 开始倒计时
			startCountdown() {
				// 先计算一次
				this.countdown = this.calculateCountdown()

				// 每秒更新一次
				this.timer = setInterval(() => {
					this.countdown = this.calculateCountdown()
				}, 1000)
			},
			// 获取订单详情
			async getTaskInfo() {
				if (!this.taskId || !this.riderUserInfo) {
					uni.showToast({
						title: '参数错误',
						icon: 'none'
					});
					return;
				}

				this.loading = true;
				try {
					// 计算sign参数
					const signStr = `service_member_id=${this.riderUserInfo.id}&phone_number=${this.riderUserInfo.phone}`;
					const sign = md5(signStr);

					const res = await this.$request('task/info', {
						task_id: String(this.taskId), // 确保task_id是字符串类型
						service_member_id: this.riderUserInfo.id,
						sign: sign,
					}, 'POST');

				if (res.code === 200 && res.data) {
					this.orderInfo = res.data
					
					// 处理打赏信息
					if (res.data.reward && Array.isArray(res.data.reward) && res.data.reward.length > 0) {
						const paidRewards = res.data.reward.filter(item => item.status === 'paid');
						if (paidRewards.length > 0) {
							const totalAmount = paidRewards.reduce((sum, item) => sum + parseFloat(item.order_amount || 0), 0);
							this.orderInfo.rewardInfo = {
								amount: totalAmount.toFixed(2),
								count: paidRewards.length
							};
						}
					}
					
					// 更新任务用时
					if (this.orderInfo.status === 'finished' || this.orderInfo.status === 'completed') {
						this.taskDuration = this.calculateTaskDuration();
					} else {
					// 开始倒计时
					this.startCountdown()
					}
					
					// 更新地图标记
					if (this.orderInfo.latitude && this.orderInfo.longitude) {
						this.mapMarkers = [{
							id: 1,
							latitude: this.orderInfo.latitude,
							longitude: this.orderInfo.longitude,
							iconPath: 'https://ccpt.qiniu.0871.cn/tb11.png',
							width: 30,
							height: 30
						}];
					}
				} else {
						uni.showToast({
							title: res.message || '获取订单详情失败',
							icon: 'none'
						})
						console.error('获取订单详情失败22:', res)
					}
				} catch (err) {
					console.error('获取订单详情失败:', err)
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},
			// 格式化服务时间
			formatServiceTime(startTime, endTime) {
				if (!startTime || !endTime) return '未知时间';

				// 格式化开始时间
				const startDate = new Date(startTime);
				const formattedStart =
					`${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} ${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;

				// 根据订单时长决定提前时间：24小时单提前6小时，48小时以上提前12小时
				const endDate = new Date(endTime);
				const durationHours = (endDate - startDate) / (1000 * 60 * 60); // 计算时长（小时）

				let advanceHours = 6; // 默认提前6小时
				if (durationHours >= 48) {
					advanceHours = 12; // 48小时以上提前12小时
				} else if (durationHours >= 24) {
					advanceHours = 6;  // 24小时单提前6小时
				}

				endDate.setHours(endDate.getHours() - advanceHours);
				const formattedEnd =
					`${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

				return `${formattedStart} 至 ${formattedEnd}`;
			},

		// 新的服务时效格式化方法
		formatNewServiceTime() {
			if (!this.orderInfo) return '未知时间';

			const timeLimit = this.orderInfo.time_limit || '未知';
			const deadline = this.orderInfo.deadline;

			if (!deadline) return `${timeLimit}小时内`;

			// 根据订单时长决定提前时间：24小时单提前6小时，48小时以上提前12小时
			const deadlineDate = new Date(deadline.replace(/-/g, '/'));

			let advanceHours = 6; // 默认提前6小时
			if (this.orderInfo.start_date) {
				const startDate = new Date(this.orderInfo.start_date.replace(/-/g, '/'));
				const durationHours = (deadlineDate - startDate) / (1000 * 60 * 60); // 计算时长（小时）

				if (durationHours >= 48) {
					advanceHours = 12; // 48小时以上提前12小时
				} else if (durationHours >= 24) {
					advanceHours = 6;  // 24小时单提前6小时
				}
			}

			// 应用提前时间
			deadlineDate.setHours(deadlineDate.getHours() - advanceHours);

			// 格式化调整后的 deadline
			const formattedDeadline = `${deadlineDate.getFullYear()}-${String(deadlineDate.getMonth() + 1).padStart(2, '0')}-${String(deadlineDate.getDate()).padStart(2, '0')} ${String(deadlineDate.getHours()).padStart(2, '0')}:${String(deadlineDate.getMinutes()).padStart(2, '0')}`;

			// return `${timeLimit}小时内 ${formattedDeadline}`;
			return `${timeLimit}小时内`;
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
			goToHome() {
				uni.redirectTo({
					url: '/riderEnd/index'
				})
			},

			// 跳转到聊天页面
			goToChat() {
				// 使用订单ID作为聊天室ID
				const roomId = this.orderInfo.task_id || this.taskId || 'default'
				uni.navigateTo({
					url: `/riderEnd/chat-simple?roomId=${roomId}`
				})
			},

			// 显示放弃任务确认弹窗
			showCancelConfirm() {
				this.showCancelModal = true;
			},

			// 处理放弃任务确认
			handleCancelConfirm() {
				// 验证取消原因
				if (!this.cancelReason || this.cancelReason.trim().length === 0) {
					uni.showToast({
						title: '请填写取消原因',
						icon: 'none'
					});
					return;
				}
				
				this.showCancelModal = false;
				this.cancelOrder();
			},

			// 处理放弃任务取消
			handleCancelCancel() {
				this.showCancelModal = false;
				this.cancelReason = ''; // 清空取消原因
			},

			// 放弃任务
			async cancelOrder() {
				if (!this.taskId || !this.riderUserInfo) {
					uni.showToast({
						title: '参数错误',
						icon: 'none'
					});
					return;
				}

				// 显示加载提示
				uni.showLoading({
					title: '放弃中...',
					mask: true
				});

				try {
					// 构建请求参数
					const params = {
						task_id: parseInt(this.taskId),
						service_member_id: this.riderUserInfo.id,
						reason: this.cancelReason, // 添加取消原因
						sign: 'chongchong'
					};

					console.log('放弃任务参数:', params);

					// 发送放弃任务请求
					const res = await this.$request('task/giveup', params, 'POST');

					console.log('放弃任务响应:', res);

					if (res.code === 200) {
						// 清空取消原因
						this.cancelReason = '';
						
						uni.showToast({
							title: '任务已放弃',
							icon: 'success'
						});
						// 延迟跳转到接单大厅
						setTimeout(() => {
							uni.redirectTo({
								url: '/riderEnd/index'
							});
						}, 1500);
					} else {
						uni.showToast({
							title: res.message || '放弃任务失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('放弃任务失败:', error);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			// 预览图片
			previewImage(current) {
				const urls = this.orderInfo.task_detail && this.orderInfo.task_detail.pic_url || []
				uni.previewImage({
					urls: urls,
					current: current
				})
			},
			showFeedbackPopup() {
				// 如果不是修改模式，清空所有数据
				if (!this.isModifyMode) {
					this.clearFeedbackData();
				}
				this.showPopup = true
			},

			// 清空反馈数据
			clearFeedbackData() {
				this.feedbackImages = {
					checkin: '',
					before: '',
					after: ''
				};
				this.otherImages = [];
				this.feedbackRemark = '';
				// otherFeedback 字段已取消
			},
			closeFeedbackPopup() {
				this.showPopup = false
				// 重置修改模式标识
				this.isModifyMode = false
			},
			async chooseImage(type) {
				try {
					const res = await uni.chooseImage({
						count: 1,
						sizeType: ['compressed'],
						sourceType: ['album', 'camera']
					})
					this.qiniuUploadFile(res.tempFilePaths, type)
				} catch (err) {
					console.error('选择图片失败:', err)
				}
			},
			// 开始上传七牛云
			qiniuUploadFile(tempFilePaths, type) {
				uni.showLoading({
					title: '上传中...',
					mask: true
				});

				uni.uploadFile({
					url: 'https://tixian.0871.cn/upload/qiniuImageUpload', // 服务器上传接口地址
					filePath: tempFilePaths[0],
					name: 'image', // 必须填写，后台用来接收文件
					formData: {
						'spaceName': 'agan_complain' // 其他要上传的参数
					},
					success: (uploadFileRes) => {
						const res = JSON.parse(uploadFileRes.data)
						this.feedbackImages[type] = res.path
						uni.hideLoading();
						uni.showToast({
							title: '上传成功',
							icon: 'success'
						});
					},
					fail: (uploadFileErr) => {
						console.error('图片上传失败', uploadFileErr);
						uni.hideLoading();
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						});
					}
				});
			},
			deleteImage(type) {
				this.feedbackImages[type] = ''
			},

			// 选择其他反馈图片
			async chooseOtherImage() {
				if (this.otherImages.length >= 4) {
					uni.showToast({
						title: '最多只能上传4张图片',
						icon: 'none'
					});
					return;
				}

				try {
					const res = await uni.chooseImage({
						count: 4 - this.otherImages.length, // 剩余可选择的数量
						sizeType: ['compressed'],
						sourceType: ['album', 'camera']
					})
					this.qiniuUploadOtherImages(res.tempFilePaths)
				} catch (err) {
					console.error('选择图片失败:', err)
				}
			},

			// 上传其他反馈图片到七牛云
			qiniuUploadOtherImages(tempFilePaths) {
				uni.showLoading({
					title: '上传中...',
					mask: true
				});

				let uploadCount = 0;
				const totalCount = tempFilePaths.length;

				tempFilePaths.forEach((filePath, index) => {
					uni.uploadFile({
						url: 'https://tixian.0871.cn/upload/qiniuImageUpload',
						filePath: filePath,
						name: 'image',
						formData: {
							'spaceName': 'agan_complain'
						},
						success: (uploadFileRes) => {
							const res = JSON.parse(uploadFileRes.data)
							this.otherImages.push(res.path)
							uploadCount++

							if (uploadCount === totalCount) {
								uni.hideLoading();
								uni.showToast({
									title: '上传成功',
									icon: 'success'
								});
							}
						},
						fail: (uploadFileErr) => {
							console.error('图片上传失败', uploadFileErr);
							uploadCount++

							if (uploadCount === totalCount) {
								uni.hideLoading();
							}

							uni.showToast({
								title: '部分图片上传失败',
								icon: 'none'
							});
						}
					});
				});
			},

			// 删除其他反馈图片
			deleteOtherImage(index) {
				this.otherImages.splice(index, 1)
			},
			async submitFeedback() {
				// 验证必填项
				if (!this.feedbackImages.checkin) {
					uni.showToast({
						title: '请上传到店打卡照片',
						icon: 'none'
					});
					return;
				}

				if (!this.feedbackImages.before) {
					uni.showToast({
						title: '请上传维护前照片',
						icon: 'none'
					});
					return;
				}

				if (!this.feedbackImages.after) {
					uni.showToast({
						title: '请上传维护后照片',
						icon: 'none'
					});
					return;
				}

				if (!this.feedbackRemark.trim()) {
					uni.showToast({
						title: '请输入完成反馈',
						icon: 'none'
					});
					return;
				}

				// 显示加载提示
				uni.showLoading({
					title: '提交中...',
					mask: true
				});

				try {
					// 计算sign参数
					const signStr = `service_member_id=${this.riderUserInfo.id}&phone_number=${this.riderUserInfo.phone}`;
					const sign = md5(signStr);

					// 构建图片数组，按指定顺序：第一张到店打卡、第二张维护前、第三张维护后、第四张仓宝状态确认（选填）、其他反馈图片
					const imageArray = [];
					// 第一张：到店打卡（必传）
					imageArray.push(this.feedbackImages.checkin);
					// 第二张：维护前（必传）
					imageArray.push(this.feedbackImages.before);
					// 第三张：维护后（必传）
					imageArray.push(this.feedbackImages.after);
					// 第四张：仓宝状态确认（选填）
					if (this.feedbackImages.confirm) {
						imageArray.push(this.feedbackImages.confirm);
					}
					// 其他反馈图片（选填，可以有多张）
					if (this.otherImages && this.otherImages.length > 0) {
						imageArray.push(...this.otherImages);
					}

					// 构建提交数据
					const submitData = {
						task_id: parseInt(this.taskId),
						service_member_id: this.riderUserInfo.id,
						after_pic_url: imageArray,
						after_detail: this.feedbackRemark,
						// additional_feedback 字段已取消
						sign: this.isModifyMode ? 'chongchong' : sign
					};

					let res;
					// 根据是否为修改模式调用不同的接口
					if (this.isModifyMode) {
						// 修改模式：调用更新接口
						res = await uni.request({
							url: 'https://ccpt.0871.cn/api/task/finish/update',
							method: 'POST',
							data: submitData,
							header: {
								'Content-Type': 'application/json'
							}
						});
						// 处理uni.request的响应格式
						res = res.data;
					} else {
						// 新建模式：调用原有接口
						res = await this.$request('task/finish', submitData, 'POST');
					}

					if (res.code === 200) {
						uni.showToast({
							title: this.isModifyMode ? '修改成功' : '提交成功',
							icon: 'success'
						});
						// 关闭弹窗
						this.closeFeedbackPopup();
						// 刷新订单信息
						this.getTaskInfo();
					} else {
						uni.showToast({
							title: res.message || (this.isModifyMode ? '修改失败' : '提交失败'),
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('提交反馈失败:', error);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			// 预览反馈图片
			previewFeedbackImage(current) {
				const urls = this.orderInfo.task_assignment.after_pic_url || []
				uni.previewImage({
					urls: urls,
					current: current
				})
			},
			// 获取反馈图片标签
			getFeedbackImageLabel(index) {
				const labels = ['到店打卡', '维护前', '维护后', '仓宝状态确认', '其他反馈'];
				return labels[index] || `图片${index + 1}`;
			},
			// 计算任务用时
			calculateTaskDuration() {
				if (!this.orderInfo.start_date || !this.orderInfo.task_assignment || !this.orderInfo.task_assignment.finished_at) {
					return '未知时间';
				}

				try {
					const startTime = new Date(this.orderInfo.start_date.replace(/-/g, '/'));
					const endTime = new Date(this.orderInfo.task_assignment.finished_at.replace(/-/g, '/'));
					const duration = endTime - startTime;

					const hours = Math.floor(duration / (1000 * 60 * 60));
					const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

					return `${hours}小时${minutes}分钟`;
				} catch (e) {
					console.error('计算任务用时出错:', e);
					return '未知时间';
				}
			},
			// 复用订单金额展示方法
			getDisplayAmount(order) {
				// 如果是转派订单，直接返回转派后的价格
				if (this.isTransferred && this.transferredPrice) {
					return this.transferredPrice;
				}
				
				if (!this.riderUserInfo || !this.riderUserInfo.rate) return order.order_amount || order.price;
				let amount = 0;
				if (typeof order.order_amount === 'string') {
					amount = parseFloat(order.order_amount.replace('¥', ''));
				} else if (order.order_amount !== undefined) {
					amount = Number(order.order_amount);
				} else if (typeof order.price === 'string') {
					amount = parseFloat(order.price.replace('¥', ''));
				} else {
					amount = Number(order.price);
				}
				const rate = Number(this.riderUserInfo.rate);
				const realAmount = amount * rate;
				return `¥${realAmount.toFixed(2)}`;
			},
			
			// 获取打赏金额（乘以费率）
			getRewardAmount(order) {
				if (!order || !order.rewardInfo || !order.rewardInfo.amount) return '0.00';
				const rewardValue = parseFloat(order.rewardInfo.amount) * (this.riderUserInfo && this.riderUserInfo.rate ? Number(this.riderUserInfo.rate) : 1);
				return rewardValue.toFixed(2);
			},
			
			// 获取订单金额+打赏金额的总和
			getTotalAmountWithReward(order) {
				// 获取基础订单金额
				const baseAmount = this.getDisplayAmount(order);
				
				// 如果有打赏，则计算总金额
				if (order.rewardInfo && order.rewardInfo.amount) {
					// 提取数字部分
					const baseValue = parseFloat(baseAmount.replace('¥', ''));
					// 打赏金额乘以费率
					const rewardValue = parseFloat(order.rewardInfo.amount) * (this.riderUserInfo && this.riderUserInfo.rate ? Number(this.riderUserInfo.rate) : 1);
					const total = baseValue + rewardValue;
					return `¥${total.toFixed(2)}`;
				}
				
				// 没有打赏，返回原金额
				return baseAmount;
			},
		openShopLocation() {
			const detail = this.orderInfo.task_detail || {};
			const latitude = Number(this.orderInfo.latitude || detail.latitude);
			const longitude = Number(this.orderInfo.longitude || detail.longitude);
			const name = detail.store_name || '门店';
			const address = this.orderInfo.shop_address + this.orderInfo.address;
			if (!latitude || !longitude) {
				uni.showToast({ title: '无有效门店定位', icon: 'none' });
				return;
			}
			uni.openLocation({
				latitude,
				longitude,
				name,
				address
			});
		},
		
		// 打开地图导航
		openNavigation() {
			const address = `${this.orderInfo.shop_address || ''}${this.orderInfo.address || ''}`;
			const name = this.orderInfo.task_detail ? this.orderInfo.task_detail.store_name : '服务门店';
			
			if (!address) {
				uni.showToast({
					title: '暂无地址信息',
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
				uni.showToast({
					title: '无有效门店定位',
					icon: 'none'
				});
			}
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
			callPhone(phoneNumber) {
				// 实现拨打电话的逻辑
				console.log('拨打电话:', phoneNumber);
				// 添加拨打电话逻辑
				if (phoneNumber) {
					uni.makePhoneCall({
						phoneNumber: phoneNumber,
						fail: (err) => {
							console.error('拨打电话失败:', err);
							uni.showToast({
								title: '拨打电话失败',
								icon: 'none'
							});
						}
					});
				} else {
					uni.showToast({
						title: '电话号码为空',
						icon: 'none'
					});
				}
			},

			// 根据订单地址确定区域
			getRegionByAddress() {
				const address = this.orderInfo.province_name;

				// 京津冀 东三省 内蒙 海南
				if (address.includes('北京') || address.includes('天津') || address.includes('河北') ||
					address.includes('辽宁') || address.includes('吉林') || address.includes('黑龙江') ||
					address.includes('内蒙') || address.includes('海南')) {
					return '京津冀 东三省 内蒙 海南';
				}

				// 云南贵州广西湖北西藏
				if (address.includes('云南') || address.includes('贵州') || address.includes('广西') ||
					address.includes('湖北') || address.includes('西藏')) {
					return '云南贵州广西湖北西藏';
				}

				// 剩余区域
				return '剩余区域';
			},

			// 获取当前区域对应的微信号
			getCurrentRegionWechat() {
				const region = this.getRegionByAddress();
				return this.regionWechatMap[region];
			},

			// 显示分区运营信息 - 直接复制微信号
			showRegionWechat() {
				const region = this.getRegionByAddress();
				const wechat = this.regionWechatMap[region];

				uni.setClipboardData({
					data: wechat,
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

			// 复制区域微信号
			copyRegionWechat() {
				const wechat = this.getCurrentRegionWechat();

				uni.setClipboardData({
					data: wechat,
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

			// 再次修改完成反馈
			modifyFeedback() {
				// 设置为修改模式
				this.isModifyMode = true;

				// 预填充已提交的反馈数据
				this.prefillFeedbackData();

				// 打开反馈弹窗
				this.showFeedbackPopup();
			},

			// 预填充反馈数据
			prefillFeedbackData() {
				if (!this.orderInfo.task_assignment) return;

				const assignment = this.orderInfo.task_assignment;

				// 预填充文本内容
				this.feedbackRemark = assignment.after_detail || '';
				// otherFeedback 字段已取消

				// 预填充图片
				if (assignment.after_pic_url && assignment.after_pic_url.length > 0) {
					const images = assignment.after_pic_url;

					// 根据图片数量和位置预填充
					// 第一张：到店打卡
					if (images[0]) {
						this.feedbackImages.checkin = images[0];
					}
					// 第二张：维护前
					if (images[1]) {
						this.feedbackImages.before = images[1];
					}
					// 第三张：维护后
					if (images[2]) {
						this.feedbackImages.after = images[2];
					}
					// 第四张：仓宝状态确认
					if (images[3]) {
						this.feedbackImages.confirm = images[3];
					}
					// 其他图片（第5张及以后）
					if (images.length > 4) {
						this.otherImages = images.slice(4);
					}
				}
			},

			// 复制订单编号
			copyOrderNumber() {
				console.log('点击了复制按钮');
				const orderNo = this.orderInfo.task_no;
				console.log('订单编号:', orderNo);
				
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
						console.log('复制成功');
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
				console.log('复制设备编码:', code);
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

			// 复制门店名称
			copyStoreName() {
				const storeName = this.orderInfo.task_detail && this.orderInfo.task_detail.store_name;
				console.log('复制门店名称:', storeName);
				
				if (!storeName || storeName === '未知门店') {
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
			const address = this.orderInfo.address;
			console.log('复制详细地址:', address);
			
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

		// 复制完整地址（门店地址 + 详细地址）
		copyFullAddress() {
			const fullAddress = `${this.orderInfo.shop_address || ''}${this.orderInfo.address || ''}`;
			console.log('复制完整地址:', fullAddress);

			if (!fullAddress || fullAddress.trim() === '') {
				uni.showToast({
					title: '地址为空',
					icon: 'none'
				});
				return;
			}

			uni.setClipboardData({
				data: fullAddress,
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

		// 复制文本到剪贴板
		copyText(text, type) {
			if (!text || text === '未知门店' || text === '无') {
				uni.showToast({
					title: `${type}为空`,
					icon: 'none',
					duration: 1500
				});
				return;
			}

			uni.setClipboardData({
				data: text,
				success: () => {
					uni.showToast({
						title: `${type}已复制`,
						icon: 'success',
						duration: 1500
					});
				},
				fail: () => {
					uni.showToast({
						title: '复制失败',
						icon: 'none',
						duration: 1500
					});
				}
			});
		},
		}
	}
</script>

<style lang="scss" scoped>
	.order-price{
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.order-info {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
		position: relative;
	}

	.nav-placeholder {
		height: 180rpx;
		width: 100%;
		background-color: #2492F2;
	}

	// 预估完单时间悬浮卡片
	.estimate-float-card {
		position: fixed;
		z-index: 999;
		width: 400rpx;
		height: 106px;
		cursor: move;
		touch-action: none;
		transition: box-shadow 0.2s ease;
		
		.estimate-card-content {
			position: relative;
			width: 100%;
			height: 100%;
			box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
			overflow: visible;

			// 使用伪元素作为背景图，解决安卓兼容性问题
			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background-image: url('https://ccpt.qiniu.0871.cn/riderend/ygwd.svg');
				background-size: 100% 100%;
				background-position: center;
				background-repeat: no-repeat;
				z-index: -1;
			}
			
			.estimate-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #FFFFFF;
				width: 100px;
				// margin-bottom: 16rpx;
				text-align: left;
				text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
			}
			
			.estimate-warning {
				background-color: rgba(255, 255, 255, 0.95);
				border-radius: 8rpx;
				padding: 12rpx 16rpx;
				margin-bottom: 20rpx;
				
				text {
					font-size: 24rpx;
					color: #FF4D4F;
					line-height: 1.5;
					display: block;
				}
			}
			
			.estimate-selector-row {
				margin-bottom: 20rpx;
				padding-top: 47px;
				width: 100px;
				padding-left: 26px;
				
				.estimate-picker {
					width: 100%;
					
					.estimate-picker-content {
						// background-color: #FFFFFF;
						border-radius: 8rpx;
						// padding: 20rpx 24rpx;
						display: flex;
						justify-content: space-between;
						align-items: center;
						
						.estimate-label {
							font-size: 24rpx;
							color: #333333;
							flex: 1;
						}
						
						.estimate-arrow {
							font-size: 24rpx;
							color: #2492F2;
							margin-left: 16rpx;
						}
					}
				}
			}
			
			.estimate-selector-row-right{
				position: absolute;
				top: 48px;
				right: 12px;
					
				.estimate-picker-content {
					// background-color: #FFFFFF;
					border-radius: 8rpx;
					// padding: 20rpx 24rpx;
					display: flex;
					justify-content: space-between;
					align-items: center;
					
					.estimate-label {
						font-size: 24rpx;
						color: rgba(36, 146, 242, 1);
						flex: 1;
					}
					
					.estimate-arrow {
						font-size: 24rpx;
						color: rgba(36, 146, 242, 1);
						margin-left: 6rpx;
					}
				}
				
				.estimate-picker {
					width: 100%;
				}
			}
			
			.estimate-submit-btn {
				margin-top: 10px;
				width: 100%;
				background: linear-gradient(135deg, #2492F2 0%, #1E7FD8 100%);
				color: #FFFFFF;
				font-size: 23rpx;
				font-weight: bold;
				border-radius: 40rpx;
				// padding: 16rpx 0;
				width: 96px;
				border: none;
				box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.3);
				
				&:active {
					opacity: 0.9;
					transform: scale(0.98);
				}
			}
		}
	}

	// 城市平均完单时效卡片容器
	.city-efficiency-wrapper {
		margin-top: 40rpx;
		display: flex;
		justify-content: center;
		margin-bottom: 20rpx;

		.city-efficiency-card {
			background: linear-gradient(135deg, #E6F7FF 0%, #F0F9FF 100%);
			border-radius: 50rpx;
			padding: 10rpx 24rpx;
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
						color: #333;
						font-weight: 600;
					}
				}

				.efficiency-label {
					font-size: 26rpx;
					color: #1890FF;
				}

				.efficiency-value {
					font-size: 30rpx;
					color: #1890FF;
					font-weight: 700;
					margin-left: 4rpx;
				}
			}
		}
	}

	.order-card {
		background-color: #fff;
		margin: 20rpx;
		border-radius: 16rpx;
		padding: 30rpx;
		position: relative;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		overflow: hidden;
	}
	
	// 卡片背景图通用样式
	.card-bg-image {
		// position: absolute;
		// right: 10rpx;
		// bottom: 10rpx;
		// pointer-events: none;
		// z-index: 0;
	}
	
	// 服务门店卡片背景图
	.store-bg-image {
		position: absolute;
		right: 0rpx;
		bottom: -100rpx;
		pointer-events: none;
		z-index: 0;
		// 可以在这里单独设置服务门店卡片的背景图样式
	}
	
	// 订单信息卡片背景图
	.order-bg-image {
		position: absolute;
		right: 0rpx;
		bottom: -120rpx;
		pointer-events: none;
		z-index: 0;
		// 可以在这里单独设置订单信息卡片的背景图样式
	}
	
	// 约定时效卡片背景图
	.time-bg-image {
		position: absolute;
		right: -15rpx;
		    bottom: -135rpx;
		pointer-events: none;
		z-index: 0;
		// 可以在这里单独设置约定时效卡片的背景图样式
	}
	
	// 订单备注卡片背景图
	.remark-bg-image {
		position: absolute;
		right: 0rpx;
		bottom: -175rpx;
		pointer-events: none;
		z-index: 0;
		// 可以在这里单独设置订单备注卡片的背景图样式
	}
	
	// 地图和门店信息卡片
	.map-store-card {
		padding: 30rpx !important;
		
		.map-card {
			margin-bottom: 12rpx;
			border-radius: 12rpx;
			overflow: hidden;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
			position: relative;
			z-index: 1;
		}
		
		// 地图下方警告提示
		.map-warning-container {
			margin-bottom: 24rpx;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			padding-left: 20rpx;
			position: relative;

			.arrow-up {
				width: 0;
				height: 0;
				border-left: 16rpx solid transparent;
				border-right: 16rpx solid transparent;
				border-bottom: 20rpx solid #FF4D4F;
				margin-left: 20rpx;
				margin-bottom: -2rpx;
			}

			.time-warning-text {
				position: relative;
				display: inline-block;
				background-color: #FF4D4F;
				color: #FFFFFF;
				font-size: 19rpx;
				padding: 6rpx 12rpx;
				border-radius: 8rpx;
				font-weight: 500;
				line-height: 1.5;
			}
		}
		
		// 设备编码行留出顶部空间
		.device-code-row {
			position: relative;
			margin-top: 40rpx;
			
			.time-warning-container {
				position: absolute;
				top: -50rpx;
				left: 164rpx;
				z-index: 10;
				
				.time-warning-text {
					position: relative;
					display: inline-block;
					background-color: #FF4D4F;
					color: #FFFFFF;
					font-size: 19rpx;
					padding: 6rpx 12rpx;
					border-radius: 8rpx;
					font-weight: 500;
					line-height: 1.5;
					
					// 左侧向下的箭头
					&::after {
						content: '';
						position: absolute;
						top: 100%;
						left: 12rpx;
						margin-top: 0;
						width: 0;
						height: 0;
						border-left: 8rpx solid transparent;
						border-right: 8rpx solid transparent;
						border-top: 10rpx solid #FF4D4F;
					}
				}
			}
		}
		
		// 为POI行留出顶部空间
		.poi-row {
			// margin-top: 84rpx;
			position: relative;
		}
	}
	
	// 统一的信息行样式
	.info-row {
		display: flex;
		align-items: center;
		position: relative;
		min-height: 50rpx;
		z-index: 1;
		// margin-bottom: 24rpx;
		
		&:last-child {
			margin-bottom: 0;
		}
		
	// 包含图片的行样式
	&.photo-row {
		align-items: flex-start;
		
		.dot-icon {
			margin-top: 20rpx;
		}
		
		.info-label {
			margin-top: 6rpx;
		}
		
		.shop-images {
			display: flex;
			flex-wrap: wrap;
			margin: 0 -6rpx;
			
			.shop-image {
				width: 120rpx;
				height: 120rpx;
				margin: 6rpx;
				border-radius: 6rpx;
			}
		}
	}
		
		.dot-icon {
			width: 12rpx;
			height: 12rpx;
			margin-right: 12rpx;
			flex-shrink: 0;
			background-color: #2492F2;
			border-radius: 50%;
		}
		
	.info-label {
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
		min-width: 140rpx;
		flex-shrink: 0;
	}

	// 信息值容器（用于包裹值和复制按钮）
	.info-value-wrapper {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.info-value {
		font-size: 28rpx;
		color: #333;
		word-wrap: break-word;
		word-break: break-all;
		flex: 0 1 auto;
		}

	// 复制按钮样式
	.copy-btn {
		font-size: 22rpx;
		padding: 0rpx 4rpx;
		background-color: #f5f5f5;
		color: #666;
		border: 1rpx solid #ddd;
		border-radius: 20rpx;
		margin-left: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.2s ease;

		&:active {
			background-color: #e8e8e8;
			transform: scale(0.95);
		}
	}

	.device-code-value {
		font-size: 28rpx;
		color: #666;
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		
		.device-code-item {
			display: flex;
			align-items: center;
			gap: 16rpx;
		}
		
		.code-text {
			word-wrap: break-word;
			word-break: break-all;
			flex: 1;
		}
	}
		
		.service-tag {
			font-size: 20rpx;
			font-weight: 600;
			padding: 4rpx 12rpx;
			border-radius: 8rpx;
			margin-right: 12rpx;
			flex-shrink: 0;
			
			&.brand-meituan {
				background-color: rgba(255, 195, 0, 1);
				color: rgba(0, 0, 0, 1);
			}
			
			&.brand-guaishou {
				background-color: rgba(42, 193, 194, 1);
				color: rgba(255, 255, 255, 1);
			}
			
			&.brand-jiedian {
				background-color: rgba(37, 196, 67, 1);
				color: rgba(255, 255, 255, 1);
			}
			
			&.brand-xiaodian {
				background-color: #2492F2;
				color: rgba(255, 255, 255, 1);
			}
			
			&.brand-zhumang {
				background-color: #2492F2;
				color: rgba(255, 255, 255, 1);
			}
			
			&.brand-default {
				background-color: #2492F2;
				color: rgba(255, 255, 255, 1);
			}
		}
		
		.extra-services-text {
			flex: 1;
			font-size: 28rpx;
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			
			.service-name {
				color: #666;
			}
			
			.service-count {
				color: #2492F2;
				margin-right: 4rpx;
			}
			
			.service-separator {
				color: #666;
				margin-right: 4rpx;
			}
		}

		// .copy-btn-small {
		// 	display: flex;
		// 	align-items: center;
		// 	justify-content: center;
		// 	width: 32rpx;
		// 	height: 32rpx;
		// 	margin-left: 8rpx;
		// 	flex-shrink: 0;
		//
		// 	&:active {
		// 		opacity: 0.6;
		// 	}
		//
		// 	.copy-icon {
		// 		width: 32rpx;
		// 		height: 32rpx;
		// 	}
		// }

		.deadline-value {
			font-size: 26rpx;
			color: #999;
			margin-left: 8rpx;
		}
	}
	
	// POI警告提示（红色，绝对定位）
	.poi-warning-container {
		position: absolute;
		top: -55rpx;
		left: 0;
		right: 0;
		z-index: 10;
		
		.poi-warning-text {
			display: inline-block;
			background-color: #FFF1F0;
			color: #FF4D4F;
			font-size: 24rpx;
			padding: 10rpx 20rpx;
			border-radius: 8rpx;
			border-left: 6rpx solid #FF4D4F;
			font-weight: 500;
			line-height: 1.5;
		}
	}
	
	// 时效警告提示（红色）
	.time-warning-container {
		position: absolute;
		top: -50rpx;
		left: 164rpx;
		z-index: 10;
		
		.time-warning-text {
			position: relative;
			display: inline-block;
			background-color: #FF4D4F;
			color: #FFFFFF;
			font-size: 19rpx;
			padding: 6rpx 12rpx;
			border-radius: 8rpx;
			font-weight: 500;
			line-height: 1.5;
			
			// 左侧向下的箭头
			&::after {
				content: '';
				position: absolute;
				top: 100%;
				left: 12rpx;
				margin-top: 0;
				width: 0;
				height: 0;
				border-left: 8rpx solid transparent;
				border-right: 8rpx solid transparent;
				border-top: 10rpx solid #FF4D4F;
			}
		}
	}
	
	// 备注行样式
	.remark-row {
		flex-direction: column;
		align-items: flex-start;
		
		.remark-content {
			width: 100%;
			margin-top: 12rpx;
			padding-left: 24rpx;
			font-size: 26rpx;
			color: #666;
			line-height: 1.6;
			word-wrap: break-word;
			word-break: break-all;
		}
	}
	
	// 时效卡片特殊样式
	// 约定时效卡片
	.time-card {
		.time-row {
			position: relative;
		}
		
		.door-time-row {
			position: relative;
			margin-top: 40rpx;
			margin-bottom: 0;
		}
		
		.info-row {
			margin-bottom: 20rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
		}
	}
	
	// 旧版样式保留
	.order-card-old {
		background-color: #fff;
		margin: 20rpx;
		border-radius: 12rpx;
		padding: 30rpx;
		position: relative;

		// 打赏徽章样式
		.reward-badge-info {
			position: absolute;
			top: 20rpx;
			left: 20rpx;
			background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
			border-radius: 30rpx;
			padding: 8rpx 20rpx;
			display: flex;
			align-items: center;
			gap: 6rpx;
			box-shadow: 0 4rpx 12rpx rgba(255, 107, 0, 0.3);
			z-index: 20;
			
			.reward-icon {
				font-size: 28rpx;
			}
			
			.reward-text {
				font-size: 24rpx;
				color: #fff;
				font-weight: 600;
			}
		}

		.status-tag {
			padding: 8rpx 16rpx;
			border-radius: 0rpx 12rpx 0rpx 12rpx;
			font-size: 24rpx;
			font-weight: 500;
			z-index: 10;

			&.waiting {
				background-color: rgba(255, 107, 0, 0.1);
				color: #FF6B00;
			}

			&.assigned {
				background-color: rgba(36, 146, 242, 0.1);
				color: #2492F2;
			}

			&.finished {
				background-color: rgba(0, 200, 0, 0.1);
				color: #00C800;
			}

			&.completed {
				background-color: rgba(0, 200, 0, 0.1);
				color: #00C800;
			}
		}

		.order-header {
			display: flex;
			align-items: flex-start;
			margin-bottom: 30rpx;

			.order-address {
				flex: 1;

				.order-number {
					font-size: 28rpx;
					color: #999;
					margin-bottom: 8rpx;
					font-weight: 600;
					display: flex;
					align-items: center;
					flex-wrap: wrap;
					
					.copy-order-btn {
						display: flex;
						align-items: center;
						justify-content: center;
						margin-left: 8rpx;
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
							font-size: 22rpx;
							color: #ffffff;
							line-height: 1;
							pointer-events: none;
						}
					}
				}

				.order-time {
					font-size: 24rpx;
					color: #999;
					position: relative;
					min-height: 40rpx;
					z-index: 2;

					text {
						display: inline-block;
					}

					.countdown-box {
						padding: 6rpx 12rpx;
						background-color: rgba(255, 107, 0, 0.1);
						border-radius: 6rpx;
						// display: flex;
						// flex-direction: column;
						align-items: flex-end;
						white-space: nowrap;
						text-align:center;
						z-index: 2;

						.countdown-line {
							display: flex;
							align-items: center;
							margin-bottom: 2rpx;

							&:last-child {
								margin-bottom: 0;
							}
						}

						.countdown-label {
							font-size: 20rpx;
							color: #666;
							margin-right: 4rpx;
						}

						.countdown-value {
							font-size: 20rpx;
							color: #FF6B00;
							font-weight: 500;
						}
					}
				}

				.divider {
					height: 1rpx;
					background-color: #eee;
					margin: 16rpx 0;
				}

				.info-content {
					position: relative;
					display: flex;
					align-items: flex-start;
					margin-top: 20rpx;

					.order-icon {
						width: 100rpx;
						height: 97rpx;
						background-color: #2492F2;
						border-radius: 10rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 20rpx;
						flex-shrink: 0;
						margin-top: 0;

						.icon-content {
							display: flex;
							flex-direction: column;
							align-items: center;
							justify-content: center;
							text-align: center;

							.brand-text {
								font-size: 28rpx;
								color: #fff;
								font-weight: bold;
								margin-bottom: 4rpx;
								line-height: 1;
							}

							.service-text {
								font-size: 28rpx;
								color: #fff;
								font-weight: bold;
								line-height: 1;
							}
						}

						text {
							font-size: 44rpx;
							color: #fff;
							font-weight: bold;
						}
					}

					.info-right {
						flex: 1;
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						min-height: 97rpx;
					}

					.info-row {
						display: flex;
						align-items: center;
						justify-content: space-between;
						margin-bottom: 12rpx;
					}

					.order-title {
						font-size: 32rpx;
						color: #333;
						font-weight: 500;
						margin-bottom: 8rpx;
						display: flex;
						align-items: center;

						.title-separator {
							margin: 0 8rpx;
						}

						.quantity-text {
							color: #2492F2;
						}
					}

					.contact-info {
						    position: absolute;
						    width: 200rpx;
						    height: 200rpx;
						    right: 10rpx;
							top: -40rpx;
						display: flex;
						align-items: center;
						font-size: 28rpx;
						color: #666;

						.contact-name {
							margin-right: 20rpx;
							color: #2492F2;
						}

						.region-operation-btn {
							background-color: #2492F2;
							color: #fff;
							padding: 4rpx 12rpx;
							border-radius: 4rpx;
							font-size: 24rpx;
							margin-right: 8rpx;

							.region-text {
								font-size: 24rpx;
								color: #fff;
							}
						}

						.copy-btn {
							display: flex;
							align-items: center;
							justify-content: center;
							margin-left: 8rpx;
							margin-right: 10rpx;
							padding: 4rpx;

							.copy-icon {
								font-size: 24rpx;
								color: #2492F2;
								line-height: 1;
							}
						}

						.call-btn {
							display: flex;
							align-items: center;
							justify-content: center;
							margin-left: 10rpx;
							margin-right: 10rpx;
							padding: 4rpx;

							.phone-icon {
								font-size: 24rpx;
								line-height: 1;
							}
						}

						.order-total {
							position: absolute;
							right: 0px;
							top: 20px;
							// transform: translateY(-50%);
							font-size: 28rpx;

							.price {
								color: #FF6B00;
								font-size: 32rpx;
								font-weight: 500;
							}
						}
					}

					.address-text {
						font-size: 26rpx;
						color: #666;
						margin-bottom: 12rpx;
					}
				}
			}
			
			// 附加服务样式
			.extra-services-section {
				margin-top: 20rpx;
				
				.divider-line {
					height: 1rpx;
					background-color: #eee;
					margin-bottom: 20rpx;
				}
				
				.extra-services-row {
					display: flex;
					align-items: flex-start;
					
					.extra-label {
						font-size: 28rpx;
						color: #666;
						min-width: 140rpx;
						flex-shrink: 0;
					}
					
					.extra-content {
						flex: 1;
						display: flex;
						flex-wrap: wrap;
						align-items: center;
						font-size: 28rpx;
						line-height: 1.6;
						
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
			}
		}

		.order-info-list {
			.divider {
				height: 1rpx;
				background-color: #eee;
				margin: 0;
			}

			.info-item {
			position: relative;
				display: flex;
				padding: 20rpx 0;
				font-size: 28rpx;
				line-height: 1.5;

				.label {
					color: #666;
					min-width: 140rpx;
				}

				.value {
					flex: 1;
					color: #333;
					white-space: pre-line;

					&.highlight {
						color: #2492F2;
					}

					&.remark {
						color: #818181;
					}

					&.order-notes {
						// text-align: right;
						line-height: 1.5;
						word-wrap: break-word;
						word-break: break-all;
						white-space: pre-wrap;
					}

					.shop-images {
						display: flex;
						flex-wrap: wrap;
						margin: 0 -8rpx;

						.shop-image {
							width: 100rpx;
							height: 100rpx;
							margin: 8rpx;
							border-radius: 6rpx;
						}
					}

					&.shop-info {
						.shop-name {
							font-size: 28rpx;
							color: #333;
							margin-bottom: 8rpx;
							padding-right: 160rpx; /* 为导航按钮预留空间 */
							word-wrap: break-word;
							word-break: break-all;
						}

						.shop-address {
							font-size: 26rpx;
							color: #666;
							margin-bottom: 16rpx;
							padding-right: 160rpx; /* 为导航按钮预留空间 */
							word-wrap: break-word;
							word-break: break-all;
						}

				.shop-images {
					display: flex;
					flex-wrap: wrap;
					margin: 0 -8rpx;
					margin-bottom: 16rpx;

					.shop-image {
						width: 100rpx;
						height: 100rpx;
						margin: 8rpx;
						border-radius: 6rpx;
					}
				}

						.shop-remark {
							font-size: 26rpx;
							color: #818181;
							padding-right: 160rpx; /* 为导航按钮预留空间 */
							word-wrap: break-word;
							word-break: break-all;
						}

						// 门店名称容器样式
						.shop-name-container {
							display: flex;
							align-items: center;
							margin-bottom: 8rpx;
							
							.shop-name {
								word-wrap: break-word;
								word-break: break-all;
								font-size: 28rpx;
								color: #333;
								padding-right: 8rpx;
							}
							
							.copy-store-btn {
								display: flex;
								align-items: center;
								justify-content: center;
								padding: 6rpx 12rpx;
								background-color: #F9C561;
								border-radius: 4rpx;
								cursor: pointer;
								position: relative;
								z-index: 10;
								flex-shrink: 0;
								
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

					// 详细地址容器样式
					.shop-address-container {
						display: flex;
						align-items: center;
						margin-bottom: 16rpx;
						
						.shop-address {
							font-size: 26rpx;
							color: #666;
							padding-right: 8rpx;
							word-wrap: break-word;
							word-break: break-all;
						}
						
						.copy-address-btn {
							display: flex;
							align-items: center;
							justify-content: center;
							padding: 6rpx 12rpx;
							background-color: #F9C561;
							border-radius: 4rpx;
							cursor: pointer;
							position: relative;
							z-index: 10;
							flex-shrink: 0;
							
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
				}

			// 地址容器样式
			.address-container {
				display: flex;
				align-items: center;
				
				.address-text {
					font-size: 26rpx;
					color: #333;
					padding-right: 8rpx;
					word-wrap: break-word;
					word-break: break-all;
					flex: 1;
				}
				
				.copy-address-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 6rpx 12rpx;
					background-color: #F9C561;
					border-radius: 4rpx;
					cursor: pointer;
					position: relative;
					z-index: 10;
					flex-shrink: 0;
					
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

			// 备注文本样式
			.remark-text {
				font-size: 26rpx;
				color: #666;
				word-wrap: break-word;
				word-break: break-all;
				line-height: 1.6;
			}

		// 设备编码样式
		&.device-codes {
				.code-item {
					display: flex;
					align-items: center;
					margin-bottom: 8rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					.code-text {
						word-break: break-all;
						margin-right: 8rpx;
					}
					
					.copy-code-btn {
						display: flex;
						align-items: center;
						justify-content: center;
						padding: 6rpx 12rpx;
						background-color: #F9C561;
						border-radius: 4rpx;
						cursor: pointer;
						position: relative;
						z-index: 10;
						flex-shrink: 0;
						
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
				
				.no-code {
					color: #999;
				}
			}

			.task-name {
				color: #333;
			}

			.item-number {
				color: #2492F2;
			}

			.task-separator {
				color: #333;
			}
		}
	}
		}
	}

.order-total {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	margin-top: 30rpx;
	font-size: 28rpx;

	.price {
		color: #FF6B00;
		font-size: 36rpx;
		font-weight: 500;
		margin-left: 10rpx;
	}
}

.info-section {
		background-color: #fff;
		margin: 20rpx;
		border-radius: 12rpx;
		padding: 30rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 500;
			color: #999;
			margin-bottom: 20rpx;
			border-left: 8rpx solid #2492F2;
			padding-left: 20rpx;
		}

		.info-item {
			position: relative;
			display: flex;
			margin-bottom: 16rpx;
			font-size: 28rpx;
			line-height: 1.5;

			.label {
				color: #666;
				min-width: 140rpx;
			}

			.value {
				flex: 1;
				color: #333;
			}
		}

		.price-item {
			display: flex;
			justify-content: space-between;
			margin-bottom: 16rpx;
			font-size: 28rpx;

			.label {
				color: #666;
			}

		.value {
			color: #FF6B00;
			font-weight: 500;
		}
	}

	.shop-image {
		width: 100rpx;
		height: 100rpx;
		border-radius: 8rpx;
	}
}

	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 120rpx;
		background-color: #fff;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
		border-top: 1rpx solid #F0F0F0;
		z-index: 500;

		.home-btn,
		.chat-btn {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-right: 30rpx;

			image {
				width: 44rpx;
				height: 44rpx;
				margin-bottom: 6rpx;
			}

			text {
				font-size: 22rpx;
				color: #666;
			}
		}

		.confirm-btn {
			flex: 1;
			height: 88rpx;
			background: linear-gradient(135deg, #4BA3F5 0%, #2492F2 100%);
			border-radius: 44rpx;
			color: #fff;
			font-size: 32rpx;
			font-weight: 600;
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 0;
			padding: 0;
			box-shadow: 0 4rpx 12rpx rgba(36, 146, 242, 0.3);

			&[disabled] {
				background-color: #CCCCCC;
				color: #FFFFFF;
			}
		}

	.cancel-btn {
		flex: none;
		width: auto;
		min-width: 140rpx;
		height: 88rpx;
		background-color: #FFFFFF;
		border-radius: 44rpx;
		color: #666;
		font-size: 32rpx;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 20rpx 0 0;
		padding: 0 30rpx;
		border: 2rpx solid #E5E5E5;

			&:active {
				background-color: rgba(255, 71, 87, 0.1);
				color: #ff3742;
				border-color: #ff3742;
			}
		}
	}

	.loading-container {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

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
			font-size: 28rpx;
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

	.order-images {
		margin-top: 30rpx;
		padding-top: 30rpx;
		border-top: 1rpx solid #eee;

		.images-title {
			font-size: 28rpx;
			color: #666;
			margin-bottom: 20rpx;
		}

		.image-list {
			display: flex;
			flex-wrap: wrap;
			margin: 0 -10rpx;

			.order-image {
				width: calc(33.33% - 20rpx);
				height: 200rpx;
				margin: 10rpx;
				border-radius: 8rpx;
			}
		}
	}

	.feedback-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;

		.popup-mask {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, 0.5);
		}

	.popup-content {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 24rpx 24rpx 0 0;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		transform: translateY(0);
		transition: transform 0.3s ease-out;

		.popup-header {
			display: flex;
			justify-content: center;
			align-items: center;
			border-bottom: 1rpx solid #eee;
			position: relative;

			.header-image {
				width: 100%;
				margin-bottom: -1px;
			}

			.title {
				font-size: 32rpx;
				font-weight: 500;
				color: #333;
			}

			.close {
				position: absolute;
				right: 30rpx;
				top: 50%;
				transform: translateY(-50%);
				font-size: 40rpx;
				color: #999;
				padding: 0 20rpx;
				z-index: 10;
			}
		}

		.popup-body {
			padding: 0rpx 30rpx 30rpx 30rpx;
			background-color: #fff;
			-webkit-overflow-scrolling: touch;

			.section-title {
				font-size: 28rpx;
				color: #999;
				margin-bottom: 20rpx;
				display: block;
			}

				// 示例图样式
				.example-section {
					padding-top: 10rpx;
					
					.example-images {
						display: flex;
						justify-content: space-between;
						gap: 15rpx;
						padding: 5px 15px 0px 15px;
						
						.example-item {
							flex: 1;
							position: relative;
							
							.example-image {
								width: 100%;
								height: 100rpx;
								border-radius: 8rpx;
								border: 1rpx solid #f0f0f0;
							}
							
							.example-label {
								display: block;
								font-size: 18rpx;
								color: #999;
								text-align: center;
								margin-bottom: 6rpx;
								white-space: nowrap;
								overflow: hidden;
								text-overflow: ellipsis;
								font-weight: 500;
							}
							
							.example-tag {
								position: absolute;
								bottom: 8rpx;
								left: 50%;
								transform: translateX(-50%);
								background-color: rgba(36, 146, 242, 0.9);
								color: #fff;
								font-size: 18rpx;
								padding: 2rpx 8rpx;
								border-radius: 4rpx;
							}
						}
					}
				}
				
				// 完成反馈展示板块样式
				.feedback-display-section {
					background-color: #F5F9FF;
					border-radius: 8rpx;
					padding: 10rpx 10rpx 0rpx 10rpx;
					margin-bottom: 30rpx;
					
					.feedback-header {
						display: flex;
						justify-content: space-between;
						align-items: center;
						
						.feedback-title {
							font-size: 20rpx;
							color: #333;
							font-weight: 500;
						}
						
						.toggle-btn {
							font-size: 19rpx;
							color: #2492F2;
							padding: 6rpx 16rpx;
							background-color: rgba(36, 146, 242, 0.1);
							border-radius: 12rpx;
							
							&:active {
								background-color: rgba(36, 146, 242, 0.2);
							}
						}
					}
					
					.feedback-content {
						background-color: #F5F5F5;
						color: #999;
						padding: 10rpx;
						border-radius: 8rpx;
						
						.feedback-text {
							display: block;
							font-size: 16rpx;
							color: #999;
							line-height: 1.6;
							margin-bottom: 8rpx;
							
							&:last-child {
								margin-bottom: 0;
							}
						}
					}
				}

				.upload-section {
					margin-bottom: 40rpx;

					.image-grid {
						display: flex;
						justify-content: space-between;
						gap: 10rpx;

						.image-upload-item {
							flex: 1;
							display: flex;
							flex-direction: column;
							align-items: center;

							.upload-label {
								font-size: 22rpx;
								color: #333;
								margin-bottom: 8rpx;
								text-align: center;
								white-space: nowrap;
							}

							.upload-container {
								width: 100%;
								height: 100rpx;
								background-color: #f5f5f5;
								border-radius: 8rpx;
								display: flex;
								flex-direction: column;
								align-items: center;
								justify-content: center;
								border: 2rpx dashed #ddd;

								.plus {
									font-size: 32rpx;
									color: #999;
									margin-bottom: 4rpx;
								}

								.upload-text {
									font-size: 18rpx;
									color: #999;
								}
							}

							.image-preview {
								width: 100%;
								height: 120rpx;
								position: relative;

								.preview-image {
									width: 100%;
									height: 100%;
									border-radius: 8rpx;
								}

								.delete-btn {
									position: absolute;
									top: -8rpx;
									right: -8rpx;
									width: 28rpx;
									height: 28rpx;
									background-color: rgba(0, 0, 0, 0.6);
									color: #fff;
									border-radius: 50%;
									display: flex;
									align-items: center;
									justify-content: center;
									font-size: 20rpx;
								}
							}
						}
					}
				}

				.other-images-section {
					margin-bottom: 40rpx;

					.other-images-grid {
						display: flex;
						flex-wrap: nowrap;
						justify-content: flex-start;
						gap: 8rpx;

						.other-image-item {
							width: calc(25% - 6rpx);
							flex-shrink: 0;
							display: flex;
							flex-direction: column;
							align-items: center;

							.upload-container {
								width: 100%;
								height: 100rpx;
								background-color: #f5f5f5;
								border-radius: 8rpx;
								display: flex;
								flex-direction: column;
								align-items: center;
								justify-content: center;
								border: 2rpx dashed #ddd;

								.plus {
									font-size: 32rpx;
									color: #999;
									margin-bottom: 4rpx;
								}

								.upload-text {
									font-size: 18rpx;
									color: #999;
								}
							}

							.image-preview {
								width: 100%;
								height: 120rpx;
								position: relative;

								.preview-image {
									width: 100%;
									height: 100%;
									border-radius: 8rpx;
								}

								.delete-btn {
									position: absolute;
									top: -8rpx;
									right: -8rpx;
									width: 28rpx;
									height: 28rpx;
									background-color: rgba(0, 0, 0, 0.6);
									color: #fff;
									border-radius: 50%;
									display: flex;
									align-items: center;
									justify-content: center;
									font-size: 20rpx;
								}
							}
						}
					}
				}

				.remark-section {
					position: relative;

					.remark-input {
						width: 100%;
						height: 180rpx;
						background-color: #f5f5f5;
						border-radius: 8rpx;
						padding: 20rpx;
						font-size: 28rpx;
						box-sizing: border-box;
					}

					.remark-hint {
						background: #FFF5F5;
						position: absolute;
						top: 123rpx;
						left: 20rpx;
						pointer-events: none;
						display: inline-flex;
						flex-direction: column;
						max-width: calc(100% - 40rpx);
						
						.hint-title {
							font-size: 19rpx;
							color: #ff4444;
							font-weight: bold;
							line-height: 1.6;
							margin-bottom: 4rpx;
						}
						
						.hint-text {
							font-size: 16rpx;
							color: #ff4444;
							line-height: 1.6;
						}
					}

					.word-count {
						position: absolute;
						right: 20rpx;
						bottom: 20rpx;
						font-size: 24rpx;
						color: #999;
					}
				}

				.other-feedback-section {
					margin-top: 30rpx;
					position: relative;

					.other-feedback-input {
						width: 100%;
						height: 200rpx;
						background-color: #F8F8F8;
						border-radius: 8rpx;
						padding: 20rpx;
						font-size: 28rpx;
						color: #333;
						box-sizing: border-box;
					}

					.word-count {
						position: absolute;
						right: 20rpx;
						bottom: 20rpx;
						font-size: 24rpx;
						color: #999;
					}
				}
			}

		.popup-footer {
			padding: 30rpx;
			border-top: 1rpx solid #eee;
			background-color: #fff;

			.submit-btn {
					width: 100%;
					height: 80rpx;
					background-color: #2492F2;
					border-radius: 40rpx;
					color: #fff;
					font-size: 32rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}
		}
	}

	.feedback-card, .confirm-card, .review-card {
		background-color: #fff;
		margin: 20rpx;
		border-radius: 12rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

		.card-title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
			margin-bottom: 20rpx;
			border-left: 8rpx solid #2492F2;
			padding-left: 20rpx;

			.modify-btn {
				background-color: #2492F2;
				color: #fff;
				border: none;
				border-radius: 20rpx;
				padding: 8rpx 20rpx;
				font-size: 24rpx;
				font-weight: 400;
				margin: 0;
				min-width: auto;
				height: auto;
				line-height: 1;

				&:active {
					background-color: #1976D2;
				}
			}
		}

		.detail-list-wrapper {
			position: relative;
			background: #fff;
			border-radius: 8rpx;
		}

		.feedback-content {
			background-color: #F5F5F5;
			padding: 10rpx;
			border-radius: 8rpx;
			overflow: hidden;
			transition: max-height 0.3s ease;
		}
		
		.feedback-content, .confirm-content, .review-card-content {
			.feedback-info, .confirm-info {
				.remark {
					font-size: 26rpx;
					color: #999;
					line-height: 1.6;
					margin-bottom: 12rpx;
				}

				.label {
					font-weight: 500;
					color: #999;
				}

				.content {
					margin-left: 10rpx;
					color: #999;
				}
			}

			.images-section {
				margin-top: 20rpx;
				margin-bottom: 20rpx;

				.section-title {
					font-size: 28rpx;
					color: #999;
					margin-bottom: 20rpx;
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

			// 用户评价样式
			.review-rating {
				display: flex;
				align-items: center;
				margin-bottom: 16rpx;

				.rating-label {
					font-size: 28rpx;
					color: #666;
					margin-right: 12rpx;
				}

				.stars {
					display: flex;
					margin-right: 12rpx;

					.star {
						font-size: 32rpx;
						color: #ddd;
						margin-right: 4rpx;

						&.active {
							color: #FFB800;
						}
					}
				}

				.rating-text {
					font-size: 28rpx;
					color: #666;
				}
			}

			.review-tags {
				margin-bottom: 16rpx;

				.tags-label {
					font-size: 28rpx;
					color: #666;
					margin-bottom: 8rpx;
					display: block;
				}

				.tags-list {
					display: flex;
					flex-wrap: wrap;
					gap: 8rpx;

					.tag-item {
						background-color: #E8F4FF;
						color: #2492F2;
						padding: 4rpx 12rpx;
						border-radius: 4rpx;
						font-size: 24rpx;
					}
				}
			}

			.review-comment {
				margin-bottom: 16rpx;

				.comment-label {
					font-size: 28rpx;
					color: #666;
					margin-bottom: 8rpx;
					display: block;
				}

				.comment-text {
					font-size: 26rpx;
					color: #999;
					line-height: 1.6;
				}
			}

			.review-time {
				.time-label {
					font-size: 26rpx;
					color: #999;
				}

				.time-text {
					font-size: 26rpx;
					color: #999;
					margin-left: 8rpx;
				}
			}
		}
	}

	.fee-detail {
		display: flex;
		flex-direction: column;
		gap: 12rpx;

		.fee-item {
			display: flex;
			justify-content: space-between;
			align-items: center;

			&.total {
				margin-top: 8rpx;
				padding-top: 8rpx;
				border-top: 1rpx solid #eee;

				.fee-label {
					font-weight: 500;
				}

				.fee-value {
					color: #FF6B00;
					font-weight: 500;
				}
			}

			.fee-label {
				font-size: 28rpx;
				color: #666;
			}

			.fee-value {
				font-size: 28rpx;
				color: #333;
			}
		}
	}

	.required {
		color: #FF4D4F;
		margin-left: 4rpx;
	}

	.sn-tip {
		padding: 10rpx 0 10rpx 140rpx;

		text {
			font-size: 20rpx;
			color: #FF4D4F;
		}
	}

	.sn-tip-bg {
		background: #FFF1F0;
		border-radius: 12rpx;
		padding: 0rpx 10rpx;
		margin: 10rpx 0 0rpx 0rpx;
		display: inline-block;
	}

	.nav-btn-mini {
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(36,146,242,0.08);
		color: #2492F2;
		border-radius: 24rpx;
		font-size: 22rpx;
		padding: 0 18rpx;
		height: 48rpx;
		border: 1px solid #b3d6fa;
		box-shadow: none;
		z-index: 10; /* 提高z-index确保不被遮挡 */
		line-height: 48rpx;
		min-width: 100rpx;
		transition: background 0.2s;
		outline: none;
		pointer-events: auto; /* 确保可点击 */
	}
	.nav-btn-mini:active {
		background: rgba(36,146,242,0.18);
	}
	.nav-icon {
		width: 28rpx;
		height: 28rpx;
		margin-right: 6rpx;
		display: block;
	}
	.nav-text {
		display: flex;
		align-items: center;
		justify-content: center;
		width: auto;
		flex: 1;
		text-align: center;
	}

	// 模糊效果层
	.blur-mask {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 120rpx;
		background: linear-gradient(to bottom, rgba(245,245,245,0), rgba(245,245,245,1));
		pointer-events: none;
		z-index: 1;
		border-radius: 0 0 8rpx 8rpx;
	}

	// 展开/收起按钮
	.expand-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0 0 0;
		background: #fff;
		border-radius: 0 0 12rpx 12rpx;
		z-index: 2;
	}

	.expand-btn-content {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10rpx 30rpx;
		background: #fff;
		border-radius: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.98);
			box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.1);
		}
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

		&.expanded {
			transform: rotate(180deg);
		}
	}

	// 悬浮钱袋图标样式
	.floating-money-bag {
		position: fixed;
		right: 30rpx;
		bottom: 200rpx;
		width: 100rpx;
		height: 100rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
		transition: all 0.3s ease;
		animation: float 3s ease-in-out infinite;

		&:active {
			transform: scale(0.9);
		}

		.money-bag-icon {
			width: 100rpx;
			height: 100rpx;
			filter: drop-shadow(0 4rpx 12rpx rgba(0, 0, 0, 0.15));
		}
	}

	// 钱袋浮动动画
	@keyframes float {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10rpx);
		}
	}

	// 评价相关样式
	.review-section {
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #f0f0f0;

		.section-title {
			font-size: 28rpx;
			color: #999;
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

		.time-note {
			position: absolute;
			// width: 60px;
			top: -35px;
			left: -5px;
			font-size: 21rpx;
			color: #FF4D4F;
			margin-top: 8rpx;
			line-height: 1.3;
			letter-spacing: 2px;
			display: block;
			background-color: #FFF1F0;
			padding: 6rpx 10rpx;
			border-radius: 8rpx;
			word-wrap: break-word;
			word-break: break-all;
			white-space: normal;
		}
		.time-note2 {
			font-size: 21rpx;
			color: #FF4D4F;
			line-height: 1.3;
			letter-spacing: 2px;
			display: block;
			background-color: #FFF1F0;
			padding: 6rpx 10rpx;
			border-radius: 8rpx;
			word-wrap: break-word;
			word-break: break-all;
			white-space: normal;
		}

		// 地图导航卡片样式
		.map-card {
			background: #F8F9FA;
			border-radius: 12rpx;
			margin: 0;
			overflow: hidden;

			.map-container {
				width: 100%;
				height: 200rpx;
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
				bottom: 12rpx;
				left: 12rpx;
				right: 12rpx;
				z-index: 10;
				background: rgba(101, 182, 252, 1);
				border-radius: 8rpx;
				padding: 10rpx 16rpx;
				box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.25);
				backdrop-filter: blur(10rpx);

				&:active {
					background: rgba(21, 118, 210, 0.95);
				}

				.nav-text {
					font-size: 22rpx;
					font-weight: 500;
					color: #FFFFFF;
					line-height: 1.4;
				}
			}
			}
		}

		// 放弃任务弹窗样式
		.cancel-popup {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 999;
			display: flex;
			align-items: center;
			justify-content: center;

			.popup-mask {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background-color: rgba(0, 0, 0, 0.5);
			}

			.cancel-popup-content {
				position: relative;
				width: 650rpx;
				z-index: 1000;

				.cancel-header-wrapper {
					position: relative;
					width: 100%;

					.cancel-header-image {
						width: 100%;
						display: block;
					}

					.cancel-warning-text {
						position: absolute;
						bottom: 55rpx;
						left: 40rpx;
						right: 40rpx;
						font-size: 26rpx;
						color: #FF4D4F;
						line-height: 1.5;
						text-align: left;
						display: block;
						width: 212px;
					}

					.cancel-warning-text-2 {
						position: absolute;
						bottom: 21rpx;
						left: 40rpx;
						right: 40rpx;
						font-size: 26rpx;
						color: #FF4D4F;
						line-height: 1.5;
						text-align: left;
						display: block;
						width: 212px;
					}
				}

				.cancel-white-bg {
					background-color: #fff;
					border-radius: 0 0 24rpx 24rpx;
					margin-top: -4rpx;

					.cancel-body {
						padding: 30rpx 40rpx;
						margin: 0px 10px 10px 10px;
						background-color: #F5F9FF;
						border-radius: 12rpx;

						.cancel-reason-section {
							position: relative;

							.cancel-reason-title {
								display: block;
								font-size: 28rpx;
								color: #333;
								margin-bottom: 20rpx;
								font-weight: 500;
							}

							.cancel-reason-input {
								width: 100%;
								height: 200rpx;
								background-color: #fff;
								border-radius: 12rpx;
								padding: 20rpx;
								font-size: 28rpx;
								color: #333;
								box-sizing: border-box;
								border: 2rpx solid #E4E7ED;

								&:focus {
									border-color: #2492F2;
									background-color: #fff;
								}
							}

							.cancel-word-count {
								position: absolute;
								right: 20rpx;
								bottom: 20rpx;
								font-size: 24rpx;
								color: #999;
							}
						}
					}

					.cancel-footer {
						display: flex;
						padding: 0 40rpx 40rpx 40rpx;
						gap: 20rpx;

						.cancel-give-up-btn {
							flex: 1;
							height: 88rpx;
							background-color: transparent;
							border: 2rpx solid #FF4757;
							border-radius: 44rpx;
							color: #FF4757;
							font-size: 32rpx;
							font-weight: 500;
							display: flex;
							align-items: center;
							justify-content: center;
							margin: 0;
							padding: 0;

							&:active {
								background-color: rgba(255, 71, 87, 0.1);
							}
						}

						.cancel-continue-btn {
							flex: 1;
							height: 88rpx;
							background-color: #2492F2;
							border-radius: 44rpx;
							color: #fff;
							font-size: 32rpx;
							font-weight: 500;
							display: flex;
							align-items: center;
							justify-content: center;
							margin: 0;
							padding: 0;
							border: none;

							&:active {
								background-color: #1976D2;
							}
						}
					}
				}
			}
		}
</style>