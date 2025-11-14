<template>
	<view class="container">
		<nav-bar :title="selectedCity || '请选择服务区域'" title-align="center"></nav-bar>

		<!-- 透明蒙版：当用户没有选择城市时覆盖整个页面 -->
		<view
			v-if="!hasSelectedArea"
			class="area-selection-mask"
			:style="{ top: navBarHeight + 'px' }"
			@click="showAreaSelectionModal"
		></view>

		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
		<!-- 主项服务 - 独立卡片 -->
		<view class="info-card mar-top-10">
			<view class="form-item">
			<view class="brand-list" :class="{ 'two-brands': availableBrands.length === 2 }" style="background: rgba(247, 247, 247, 1);">
				<view class="brand-item" v-if="providerInfo.meituan" :class="{ active: selectedBrand === 'meituan', 'meituan-active': selectedBrand === 'meituan' }" @click="selectBrand('meituan')">
					<image src="https://ccpt.qiniu.0871.cn/meituan.svg" mode="aspectFit"></image>
				</view>
				<view class="brand-item" v-if="providerInfo.guaishou" :class="{ active: selectedBrand === 'guaishou', 'didi-active': selectedBrand === 'guaishou' }" @click="selectBrand('guaishou')">
					<image src="https://ccpt.qiniu.0871.cn/guaishou.svg" mode="aspectFit"></image>
				</view>
				<view class="brand-item" v-if="providerInfo.jiedian" :class="{ active: selectedBrand === 'jiedian', 'jidian-active': selectedBrand === 'jiedian' }" @click="selectBrand('jiedian')">
					<image src="https://ccpt.qiniu.0871.cn/zhumang.svg" mode="aspectFit"></image>
				</view>
				<view class="brand-item" v-if="providerInfo.xiaodian" :class="{ active: selectedBrand === 'xiaodian', 'xiaoe-active': selectedBrand === 'xiaodian' }" @click="selectBrand('xiaodian')">
					<image src="https://ccpt.qiniu.0871.cn/xiaodian.svg" mode="aspectFit"></image>
				</view>
			</view>
			<view class="form-label section-title main-service-title" style="margin-top:20px;">
				<view class="title-left">
					<text class="dot"></text>
					<text>主项服务</text>
				</view>
				<text class="optional-tag-red">必填</text>
			</view>
			<view class="service-options">
		<!-- 补宝选项 -->
				<view class="service-option bubao-option" :class="{'service-option-active': selectedService === 'bubao'}" @click="selectService('bubao')">
					<view class="option-circle" :style="{'border-color': '#2492F2', 'border-radius': '50%'}">
						<view v-if="selectedService === 'bubao'" class="inner-circle" :style="{'background-color': '#2492F2', 'border-radius': '50%'}"></view>
					</view>
					<text :style="{'color': selectedService === 'bubao' ? '#2492F2' : '#333333'}">补宝</text>
					<text class="bubao-note">骑手供宝</text>
				</view>

						<!-- 数量选择 -->
						<view class="quantity-selector">
							<view class="quantity-controls">
								<view class="quantity-btn minus" @click="decreaseQuantity">-</view>
								<input type="number" v-model="formData.quantity" class="quantity-input" placeholder="必填" @input="onQuantityInput" />
								<view class="quantity-btn plus" @click="increaseQuantity">+</view>
							</view>
							<text>个</text>
						</view>
					</view>
				</view>

			<!-- 附加服务 -->
			<view class="form-label section-title additional-service-title" style="margin-top: 30rpx;">
				<view class="title-left">
					<text class="dot"></text>
					<text>附加服务</text>
				</view>
				<text class="optional-tag-blue">选填 可多择</text>
			</view>
				<view class="additional-services">
			<!-- 处理异常 -->
			<view class="service-row">
				<view class="service-option" :class="{'service-option-active': selectedAdditionalServices.includes('handleException')}" @click="selectAdditionalService('handleException')">
					<view class="option-circle" :style="{'border-color': selectedAdditionalServices.includes('handleException') ? '#2492F2' : '#CCCCCC'}">
						<view v-if="selectedAdditionalServices.includes('handleException')" class="inner-circle" :style="{'background-color': '#2492F2'}">
							<text class="check-mark">✓</text>
						</view>
					</view>
					<view class="service-label-container">
						<text :style="{'color': selectedAdditionalServices.includes('handleException') ? '#2492F2' : '#333333'}">处理异常</text>
						<text class="service-note">断电、仓异常等</text>
					</view>
				</view>
				<view class="quantity-selector">
					<view class="quantity-controls">
						<view class="quantity-btn minus" @click="decreaseExceptionQuantity">-</view>
						<input type="number" v-model="formData.exceptionQuantity" class="quantity-input" @focus="onExceptionQuantityFocus" @input="onExceptionQuantityInput" />
						<view class="quantity-btn plus" @click="increaseExceptionQuantity">+</view>
					</view>
					<text class="unit-text">台</text>
				</view>
			</view>

				<!-- 坏宝回收 -->
				<view class="service-row">
					<view class="service-option" :class="{'service-option-active': selectedAdditionalServices.includes('badItemRecycle')}" @click="selectAdditionalService('badItemRecycle')">
						<view class="option-circle" :style="{'border-color': selectedAdditionalServices.includes('badItemRecycle') ? '#2492F2' : '#CCCCCC'}">
							<view v-if="selectedAdditionalServices.includes('badItemRecycle')" class="inner-circle" :style="{'background-color': '#2492F2'}">
								<text class="check-mark">✓</text>
							</view>
						</view>
						<view class="service-label-container">
							<text :style="{'color': selectedAdditionalServices.includes('badItemRecycle') ? '#2492F2' : '#333333'}">坏宝回收</text>
							<text class="service-note">骑手收走报修返厂</text>
						</view>
					</view>
					<view class="quantity-selector">
						<view class="quantity-controls">
							<view class="quantity-btn minus" @click="decreaseBadItemRecycleQuantity">-</view>
							<input type="number" v-model="formData.badItemRecycleQuantity" class="quantity-input" @focus="onBadItemRecycleQuantityFocus" @input="onBadItemRecycleQuantityInput" />
							<view class="quantity-btn plus" @click="increaseBadItemRecycleQuantity">+</view>
						</view>
						<text class="unit-text">个</text>
					</view>
				</view>

			<!-- 加电源线 -->
			<view class="service-row">
				<view class="service-option" :class="{'service-option-active': selectedAdditionalServices.includes('addPowerCable')}" @click="selectAdditionalService('addPowerCable')">
					<view class="option-circle" :style="{'border-color': selectedAdditionalServices.includes('addPowerCable') ? '#2492F2' : '#CCCCCC'}">
						<view v-if="selectedAdditionalServices.includes('addPowerCable')" class="inner-circle" :style="{'background-color': '#2492F2'}">
							<text class="check-mark">✓</text>
						</view>
					</view>
					<view class="service-label-container">
						<text :style="{'color': selectedAdditionalServices.includes('addPowerCable') ? '#2492F2' : '#333333'}">加电源线</text>
						<text class="service-note">15元/条 不含跑腿费</text>
					</view>
				</view>
				<view class="quantity-selector">
					<view class="quantity-controls">
						<view class="quantity-btn minus" @click="decreasePowerCableQuantity">-</view>
						<input type="number" v-model="formData.powerCableQuantity" class="quantity-input" @focus="onPowerCableQuantityFocus" @input="onPowerCableQuantityInput" />
						<view class="quantity-btn plus" @click="increasePowerCableQuantity">+</view>
					</view>
					<text class="unit-text">条</text>
				</view>
			</view>
				</view>
			</view>

			<!-- 服务门店信息-->
			<store-info
				:formData.sync="formData"
				@address-select="handleAddressSelect"
				@remove-sn-mac="removeSnMacInput"
				@add-sn-mac="addSnMacInput"
				@delete-image="deleteImage"
				@upload-image="uploadImage"
			/>

			<!-- 附加服务 - 独立卡片 -->
			<!-- <view class="info-card">
				<view class="form-item">
					<view class="form-label section-title">
						<text>附加服务（选填）</text>
					</view>
					<view class="additional-services">
						<view class="service-row">
							<view class="service-option" :class="{'service-option-active': selectedAdditionalServices.includes('power')}" @click="selectAdditionalService('power')">
								<view class="option-circle" :style="{'border-color': selectedAdditionalServices.includes('power') ? '#2492F2' : '#CCCCCC'}">
									<view v-if="selectedAdditionalServices.includes('power')" class="inner-circle" :style="{'background-color': '#2492F2'}">
										<text class="check-mark">✓</text>
									</view>
								</view>
								<text :style="{'color': selectedAdditionalServices.includes('power') ? '#2492F2' : '#333333'}">通电</text>
							</view>
							<view class="quantity-selector">
								<view class="quantity-controls">
									<view class="quantity-btn minus" @click="decreasePowerQuantity">-</view>
									<input type="number" v-model="formData.powerQuantity" class="quantity-input" />
									<view class="quantity-btn plus" @click="increasePowerQuantity">+</view>
								</view>
								<text class="unit-text">台</text>
							</view>
						</view>

						<view class="service-row power-cable-row" style="position:relative;">
							<view class="service-option" :class="{'service-option-active': selectedAdditionalServices.includes('powerCable')}" @click="selectAdditionalService('powerCable')">
								<view class="option-circle" :style="{'border-color': selectedAdditionalServices.includes('powerCable') ? '#2492F2' : '#CCCCCC'}">
									<view v-if="selectedAdditionalServices.includes('powerCable')" class="inner-circle" :style="{'background-color': '#2492F2'}">
										<text class="check-mark">✓</text>
									</view>
								</view>
								<text :style="{'color': selectedAdditionalServices.includes('powerCable') ? '#2492F2' : '#333333'}">换/加/接电源线</text>
							</view>
							<view class="quantity-selector">
								<view class="quantity-controls">
									<view class="quantity-btn minus" @click="decreaseCableQuantity">-</view>
									<input type="number" v-model="formData.cableQuantity" class="quantity-input" />
									<view class="quantity-btn plus" @click="increaseCableQuantity">+</view>
								</view>
								<text class="unit-text">条</text>
							</view>
							<text class="time-note power-cable-note abs-note">限提供1.5米长电源线</text>
						</view>
					</view>
				</view>
			</view> -->

			<!-- 服务时效 - 独立卡片 -->
			<view class="info-card">
				<view>
					<view class="form-label section-title">
						<text class="dot"></text>
						<text>服务时效</text>
						<!-- <text style="color:red;font-size:24rpx;">（ 以下时效要求二选一 ）</text> -->
					</view>

					<!-- 服务时效 -->
					<view class="form-item">
						<view class="time-table">
							<!-- 约定时间范围内完成 -->
							<view class="time-table-row">
								<view class="time-table-cell time-option" :class="{'time-option-active': formData.timeType === 'before_deadline'}" @click="selectTimeType('before_deadline')">
									<view class="option-circle" :style="{'border-color': formData.timeType === 'before_deadline' ? '#2492F2' : '#CCCCCC'}">
										<view v-if="formData.timeType === 'before_deadline'" class="inner-circle" :style="{'background-color': '#2492F2'}"></view>
									</view>
									<view class="option-content">
										<text :style="{'color': formData.timeType === 'before_deadline' ? '#2492F2' : '#333333'}">约定时效内完成</text>
										<text class="time-note">骑手在约定时效内任意时间点完成</text>
									</view>
								</view>
								<view class="time-table-cell time-value" @click="showAppointmentTimePicker">
									<text>{{ beforeDeadlineTextShow || '请选择时效范围' }}</text>
									<image src="https://ccpt.qiniu.0871.cn/publish/right.png" class="time-icon"></image>
								</view>
							</view>

							<!-- 指定时间区间内完成 -->
							<!-- <view class="time-table-row">
								<view class="time-table-cell time-option" :class="{'time-option-active': formData.timeType === 'time_range'}" @click="selectTimeType('time_range')">
									<view class="option-circle" :style="{'border-color': formData.timeType === 'time_range' ? '#2492F2' : '#CCCCCC'}">
										<view v-if="formData.timeType === 'time_range'" class="inner-circle" :style="{'background-color': '#2492F2'}"></view>
									</view>
									<view class="option-content">
										<text :style="{'color': formData.timeType === 'time_range' ? '#2492F2' : '#333333'}">指定时间区间内完成</text>
										<text class="time-note">骑手必须在指定时间区间内完成</text>
									</view>
								</view>
								<view class="time-table-cell time-value" @click="showTimeIntervalPicker">
									<text>{{ timePickerTextShow || '请选择指定时间' }}</text>
									<image src="https://ccpt.qiniu.0871.cn/publish/right.png" class="time-icon"></image>
								</view>
							</view> -->
						</view>

						<!-- 时间选择弹窗 -->
						<time-picker
							:show="showTimePicker"
							:type="currentTimeType"
							:lastSelectedTime="lastAppointmentTime"
							:lastRemark="lastTimeRemark"
							:prices-str="JSON.stringify(providerInfo.prices || {})"
							@update:show="showTimePicker = $event"
							@select="handleTimeSelect"
							@timeOptionSelected="handleTimeOptionSelected"
						/>
					</view>

					<!-- 建议骑手上门时间段 -->
					<view class="time-range-section">
						<view class="time-table-row">
							<view class="time-table-cell time-option">
								<view class="required-label">
									<text class="required-dot"></text>
									<text>建议骑手上门时间段</text>
									<text class="time-note">请核实后填写 以便骑手高效完单！</text>
								</view>
							</view>
							<view class="time-table-cell time-value">
								<view class="time-picker-wrapper" @click="showTimeRangePicker">
									<text class="time-display">{{ getTimeRangeDisplay() }}</text>
									<image src="https://ccpt.qiniu.0871.cn/publish/right.png" class="time-arrow"></image>
								</view>
							</view>
						</view>
						<!-- 间隔线 -->
						<view class="divider-line"></view>
					</view>

					<!-- 订单备注 -->
					<view class="notes-section">
						<view class="time-table-row">
							<view class="time-table-cell time-option">
								<text>订单备注</text>
								<text class="optional-tag">选填</text>
							</view>
							<view class="time-table-cell time-value notes-input">
							</view>
						</view>
						<view class="notes-input-container">
							<view class="textarea-wrapper">
								<textarea
									v-model="formData.additional_notes"
									placeholder="如您对任务、门店情况、定位、时间有特别说明或需叮嘱骑手，请填写备注！充充小哥可见！额外备注任务小哥尽量完成，无法完成不影响本单履约！"
									class="notes-textarea"
									maxlength="200"
									auto-height
									@focus="onNotesInputFocus"
									@blur="onNotesInputBlur"
									@input="onNotesInput"
								></textarea>
								<view class="char-count-inner">
									<text class="count-text">{{ formData.additional_notes.length }}/200</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 优惠券选择 - 只有user_id为37时显示 -->
					<view class="coupon-section" v-if="currentUserInfo && currentUserInfo.user_id === 37">
						<view class="time-table-row">
							<view class="time-table-cell time-option">
								<text>优惠券</text>
							</view>
							<view class="time-table-cell time-value" @click="showCouponPicker">
								<text>{{ formData.coupon || '请选择优惠券' }}</text>
								<image src="https://ccpt.qiniu.0871.cn/publish/right.png" class="time-icon"></image>
							</view>
						</view>
					</view>


				</view>
			</view>

			<!-- 底部提交元素 -->
			<view class="submit-bar">

				<!-- 特别提醒 -->
				<view class="coupon-section">
					<view class="coupon-reminder">
						<text class="reminder-text">特别提醒！下单前请确认点位/门店设备可服务。如因停电、维修、关门、商户不同意等非骑手原因无法处理的。骑手到店打卡并反馈问题，视为完成任务！</text>
					</view>
				</view>

				<!-- 间隔线 -->
				<view class="divider-line" style="margin-bottom: 5px;"></view>
				
				<view class="submit-content">
					<view class="price-section" @tap="togglePriceDetail">
						<text class="price-label">预估价格</text>
						<view class="price-value">
							<text class="currency">¥</text>
							<text class="amount">{{priceDetails.total.toFixed(2)}}</text>
							<text class="arrow" :class="{ 'arrow-up': showPricePopup }">▼</text>
							<!-- 价格疑问提示 -->
							<view class="price-question" @click.stop="showPriceQuestionModal">
								<text class="question-text">价格有疑问？</text>
							</view>
						</view>
						<view class="coupon-section2">
							<view class="coupon-reminder2">
								<text class="reminder-text">价格含：跑腿、备宝</text>
							</view>
						</view>
					</view>
					<button
						class="cart-btn"
						:style="{
							'background-color': isLoggedIn ? '#52C41A' : '#52C41A',
							'color': '#2492F2'
						}"
						@click="isLoggedIn ? addToCart() : goToLogin()">{{ isLoggedIn ? '加入购物车' : '去登录' }}</button>
					<button
						class="submit-btn"
						:style="{
							'background-color': isLoggedIn ? '#2492F2' : '#2492F2',
							'color': '#FFFFFF'
						}"
						@click="isLoggedIn ? submitOrder() : goToLogin()">{{ isLoggedIn ? '提交订单' : '去登录' }}</button>
				</view>
			</view>
		</view>

		<!-- 价格明细弹窗 -->
		<uni-popup ref="pricePopup" type="bottom" @change="onPricePopupChange" :mask-click="true" :z-index="100000">
			<view class="price-detail">
				<view class="detail-header">
					<text class="title">价格明细</text>
					<text class="close" @tap="closePricePopup">×</text>
				</view>
				<view class="detail-content">
					<view class="detail-item">
						<text class="label">主项服务</text>
						<text class="value">¥{{priceDetails.baseServiceFee.toFixed(2)}}</text>
					</view>
					<view class="detail-item" v-if="priceDetails.extraDeviceFee > 0">
						<text class="label">主项服务增量</text>
						<text class="value">¥{{priceDetails.extraDeviceFee.toFixed(2)}}</text>
					</view>
					<view class="detail-item">
						<text class="label">基础距离</text>
						<text class="value">¥{{priceDetails.distanceFee.toFixed(2)}}</text>
					</view>
					<view class="detail-item" v-if="priceDetails.extraDistanceFee > 0">
						<text class="label">基础距离增量</text>
						<text class="value">¥{{priceDetails.extraDistanceFee.toFixed(2)}}</text>
					</view>
					<view class="detail-item" v-if="priceDetails.timeLimitFee !== 0">
						<text class="label">服务时效</text>
						<text class="value">¥{{priceDetails.timeLimitFee.toFixed(2)}}</text>
					</view>
					<view class="detail-item" v-if="priceDetails.wireFee > 0">
						<text class="label">附加服务基础</text>
						<text class="value">¥{{priceDetails.wireFee.toFixed(2)}}</text>
					</view>
					<view class="detail-item" v-if="priceDetails.extraWireFee > 0">
						<text class="label">附加服务增量</text>
						<text class="value">¥{{priceDetails.extraWireFee.toFixed(2)}}</text>
					</view>
					<view class="detail-item" v-if="priceDetails.powerFee > 0">
						<text class="label">通电</text>
						<text class="value">¥{{priceDetails.powerFee.toFixed(2)}}</text>
					</view>
					<view class="detail-item" v-if="priceDetails.riderTip > 0">
						<text class="label">骑手打赏</text>
						<text class="value">¥{{priceDetails.riderTip.toFixed(2)}}</text>
					</view>
					<view class="detail-item" v-if="priceDetails.couponAmount > 0">
						<text class="label">优惠券减免</text>
						<text class="value" style="color:#52c41a;">-¥{{priceDetails.couponAmount.toFixed(2)}}</text>
					</view>
					<view class="detail-item total">
						<text class="label">总计</text>
						<view class="value-wrapper">
							<text class="value">¥{{priceDetails.total.toFixed(2)}}</text>
							<view class="info-icon" @click.stop="showPriceAgreement">!</view>
						</view>
					</view>
					<view v-if="priceDetails.couponAmount > 0 && priceDetails.total <= 1" class="price-tip">
						<text class="tip-icon">💡</text>
						<text class="tip-text">支付金额低于1元时，实际需支付 <text style='color:#2492F2;font-weight:bold;'>1元</text></text>
					</view>
					<!-- 底部安全区域 -->
					<view class="safe-area-bottom"></view>
				</view>
			</view>
		</uni-popup>

		<!-- 价格协议弹窗 -->
		<uni-popup ref="agreementPopup" type="center" @change="onAgreementPopupChange" :mask-click="true" :z-index="100000">
			<view class="agreement-popup">
				<view class="agreement-header">
					<text class="title">价格协议</text>
					<text class="close" @tap="closeAgreementPopup">×</text>
				</view>
				<scroll-view class="agreement-content" scroll-y>
					<view class="agreement-text">
						<text class="section-title">一、基础服务费</text>
						<text class="section-content">1. 补宝服务：50元/次</text>
						<text class="section-content">2. 坏单服务：60元/次</text>
						<text class="section-content">3. 接电源线：40元/次</text>

						<text class="section-title">二、附加服务费</text>
						<text class="section-content">1. 额外设备：10元/个</text>
						<text class="section-content">2. 特殊时段：加收20%</text>

						<text class="section-title">三、其他说明</text>
						<text class="section-content">1. 所有价格均为含税价</text>
						<text class="section-content">2. 特殊情况下可能会有调整</text>
					</view>
				</scroll-view>
			</view>
		</uni-popup>

		<!-- 价格疑问弹窗 -->
		<auth-modal
			:show="showPriceQuestionPopup"
			title="提示！"
			content="价格由：起步价+增量价+时效价+距离组成。如有异常联系V：19822909390"
			cancel-text="取消"
			confirm-text="知道了"
			@confirm="closePriceQuestionPopup"
			@cancel="closePriceQuestionPopup"
		/>

		<!-- 时间段选择弹窗 -->
		<uni-popup ref="timeRangePopup" type="bottom" @change="onTimeRangePopupChange" :mask-click="true" :z-index="999999">
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

		<!-- 骑手打赏弹窗 -->
		<!-- <uni-popup ref="tipModal" type="bottom" @change="onTipModalChange" :mask-click="true" :z-index="100000">
			<view class="tip-modal">
				<view class="tip-close" @click="closeTipModal">×</view>
				<image src="https://ccpt.qiniu.0871.cn/fb-toubutupian.png" class="tip-banner" mode="widthFix"></image>
				<view class="tip-panel">
					<view class="tip-options">
						<view class="tip-option" :class="{ active: selectedTipOption === 'heart' }" @click="selectTipOption('heart', 8)">
							<view class="option-icon-wrap">
								<image src="https://ccpt.qiniu.0871.cn/fb-songaixin.png" class="option-icon" mode="aspectFit"></image>
							</view>
							<text class="option-title">送爱心</text>
							<view class="option-amount" :class="{ active: selectedTipOption === 'heart' }">
								<text class="amount-label">打赏</text>
								<text class="amount-value">8元</text>
							</view>
						</view>
						<view class="tip-option" :class="{ active: selectedTipOption === 'drink' }" @click="selectTipOption('drink', 12)">
							<view class="option-icon-wrap">
								<image src="https://ccpt.qiniu.0871.cn/fb-zengyinliao.png" class="option-icon" mode="aspectFit"></image>
							</view>
							<text class="option-title">赠饮料</text>
							<view class="option-amount" :class="{ active: selectedTipOption === 'drink' }">
								<text class="amount-label">打赏</text>
								<text class="amount-value">12元</text>
							</view>
						</view>
						<view class="tip-option" :class="{ active: selectedTipOption === 'chicken' }" @click="selectTipOption('chicken', 20)">
							<view class="option-icon-wrap">
								<image src="https://ccpt.qiniu.0871.cn/fb-jiajitui.png" class="option-icon" mode="aspectFit"></image>
							</view>
							<text class="option-title">加鸡腿</text>
							<view class="option-amount" :class="{ active: selectedTipOption === 'chicken' }">
								<text class="amount-label">打赏</text>
								<text class="amount-value">20元</text>
							</view>
						</view>
						<view class="tip-option" :class="{ active: selectedTipOption === 'redpack' }" @click="selectTipOption('redpack', 'more')">
							<view class="option-icon-wrap">
								<image src="https://ccpt.qiniu.0871.cn/fb-dahongbao.png" class="option-icon" mode="aspectFit"></image>
							</view>
							<text class="option-title">豪横大红包</text>
							<view class="option-amount" :class="{ active: selectedTipOption === 'redpack' }">
								<text class="amount-label">打赏</text>
								<text class="amount-value">更多</text>
							</view>
						</view>
					</view>
				</view>
				<view class="tip-footer">
					<button class="confirm-tip-btn" @click="confirmTip">
						{{ selectedTipAmount === 'more' ? '打赏更多' : '确定打赏 ' + selectedTipAmount + '元' }}
					</button>
				</view>
			</view>
		</uni-popup> -->

		<!-- 悬浮聊天图标 -->
		<FloatingChatIconUser />

		<!-- 订单确认弹窗 -->
		<uni-popup ref="orderConfirmPopup" type="center" @change="onOrderConfirmPopupChange" :mask-click="false" :z-index="100000">
			<view class="order-confirm-popup">
				<view class="confirm-header">
					<image src="https://ccpt.qiniu.0871.cn/home/querengongdan.png" class="confirm-header-bg" mode="aspectFill"></image>
				</view>
				<view class="confirm-content">
					<!-- 服务信息块 -->
					<view class="service-info-block imgcc1">
						<view class="confirm-item service-item">
							<view class="confirm-value brand-value service-value">
								<image v-if="selectedBrand === 'meituan'" src="https://ccpt.qiniu.0871.cn/meituan.svg" class="brand-icon" mode="aspectFit"></image>
								<image v-if="selectedBrand === 'guaishou'" src="https://ccpt.qiniu.0871.cn/guaishou.svg" class="brand-icon" mode="aspectFit"></image>
								<image v-if="selectedBrand === 'jiedian'" src="https://ccpt.qiniu.0871.cn/zhumang.svg" class="brand-icon" mode="aspectFit"></image>
								<image v-if="selectedBrand === 'xiaodian'" src="https://ccpt.qiniu.0871.cn/xiaodian.svg" class="brand-icon" mode="aspectFit"></image>
								<text class="brand-text">{{ getBrandName() }}</text>
							</view>
							<text class="confirm-label service-label">服务品牌</text>
						</view>
						<view class="confirm-item service-item">
							<text class="confirm-value service-value">补宝 x{{ formData.quantity }}</text>
							<text class="confirm-label service-label">服务项目</text>
						</view>
						<view class="confirm-item service-item">
							<text class="confirm-value service-value">{{ getDeviceCode() }}</text>
							<text class="confirm-label service-label">设备编码</text>
						</view>
					</view>
					<!-- 门店信息块 -->
					<view class="service-info-block imgcc2">
						<view class="confirm-item service-item">
							<text class="confirm-value store-value">{{ formData.storeName }}</text>
							<text class="confirm-label service-label">门店名称</text>
						</view>
						<view class="confirm-item-left">
							<text class="confirm-label">门店地址</text>
							<text class="confirm-value-left">{{ formData.address }}</text>
						</view>
					<view class="confirm-item-left">
						<text class="confirm-label">门店POI</text>
						<text class="confirm-value-left">{{ formData.shop_poi || '未填写' }}</text>
					</view>
						<view class="confirm-item-left" v-if="formData.detailAddress">
							<text class="confirm-label">补充地址</text>
							<text class="confirm-value-left">{{ formData.detailAddress }}</text>
						</view>
					</view>
					<!-- 约定时效与作业时段信息块 -->
					<view class="service-info-block imgcc3">
						<view class="confirm-item service-item">
							<text class="confirm-value service-value" style="color: #5B5B5C !important;">{{ beforeDeadlineTextShow || '未选择' }}</text>
							<text class="confirm-label service-label">约定时效</text>
						</view>
						<view class="confirm-item service-item">
							<text class="confirm-value service-value" style="color: #5B5B5C !important;">{{ getWorkTimeDisplay() }}</text>
							<text class="confirm-label service-label">作业时段</text>
						</view>
					</view>
				<!-- 我的备注信息块 -->
				<view class="service-info-block imgcc4">
					<view class="confirm-item service-item" v-if="formData.additional_notes">
						<text class="confirm-value service-value">{{ formData.additional_notes }}</text>
						<text class="confirm-label service-label">我的备注</text>
					</view>
					<!-- <view class="confirm-item service-item" v-if="formData.locationDesc">
						<text class="confirm-value service-value" style="color: #5B5B5C !important;">{{ formData.locationDesc }}</text>
						<text class="confirm-label service-label">我的备注</text>
					</view> -->
					<view class="confirm-item service-item" v-if="!formData.additional_notes">
						<text class="confirm-value service-value">未填写</text>
						<text class="confirm-label service-label">备注信息</text>
					</view>
				</view>
				<!-- 骑手接单偏好信息块 -->
				<view class="service-info-block imgcc5">
					<view class="prefer-member-section">
						<text class="prefer-member-title">骑手接单偏好</text>
						<view class="prefer-member-options">
							<view 
								class="prefer-option" 
								:class="{ 'prefer-option-active': formData.prefer_member === 'same' }"
								@click="selectPreferMember('same')"
							>
								<view class="option-radio">
									<view class="radio-inner" v-if="formData.prefer_member === 'same'"></view>
								</view>
								<text class="option-text">希望同个骑手接单</text>
							</view>
							<view 
								class="prefer-option" 
								:class="{ 'prefer-option-active': formData.prefer_member === 'different' }"
								@click="selectPreferMember('different')"
							>
								<view class="option-radio">
									<view class="radio-inner" v-if="formData.prefer_member === 'different'"></view>
								</view>
								<text class="option-text">希望不同骑手接单</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="confirm-footer">
				<button class="cancel-btn" @click="closeOrderConfirmPopup">返回修改</button>
				<button class="confirm-btn" @click="confirmSubmitOrder">确认并支付</button>
			</view>
			</view>
		</uni-popup>

		<!-- 门店地址弹窗 -->
		<!-- <auth-modal
			:show="showAddressPopup"
			title="提示！"
			:content="'当前选择了' + selectedCity + '与下单地址不符，请核对是否有误'"
			cancel-text="取消"
			confirm-text="知道了"
			@confirm="showAddressPopup=false; formData.address = ''"
			@cancel="showAddressPopup=false; formData.address = ''"
		/> -->

		<!-- 打赏弹窗 -->
		<reward-modal
			:show="showRewardModal"
			@close="showRewardModal = false"
			@confirm="handleRewardConfirm"
		/>
	</view>
</template>

<script>
	import NavBar from '@/components/NavBar.vue'
	import TimePicker from '@/components/time-picker/index.vue'
	import StoreInfo from '@/components/StoreInfo.vue'
	import AuthModal from '@/components/AuthModal/index.vue'
	import FloatingChatIconUser from '@/components/FloatingChatIconUser/index.vue'
	import RewardModal from '@/components/RewardModal/index.vue'

	export default {
		components: {
			NavBar,
			TimePicker,
			StoreInfo,
			AuthModal,
			FloatingChatIconUser,
			RewardModal
		},
		// watch: {
		// 	'formData.address'(newValue) {
		// 		if(newValue == '' || newValue == undefined){
		// 			return
		// 		}
		// 		let selectedCity = uni.getStorageSync('selectedCity') || ''
		// 		selectedCity = selectedCity.replace(/·/g, '').replace(/ /g, '')
		// 		console.log('selectedCity', selectedCity)
		// 		if (!newValue.includes(selectedCity) && selectedCity != '') {
		// 			this.showAddressPopup = true
		// 		}
		// 	}
		// },
	data() {
		return {
			showAddressPopup: false,
			showRewardModal: false,
			navBarHeight: 0,
			selectedBrand: '', // 修改默认值为空字符串
			selectedService: 'bubao', // 默认选择补宝服务
			taskTypeId: null, // 添加 taskTypeId 字段
			isReorderMode: false, // 标记是否为再来一单模式

			selectedAdditionalServices: [], // 改为数组，支持多选
			inputFocus: '',
			formData: {
				storeName: '',
				snMacList: [''], // 初始化一个空的输入框
				address: '',
				detailAddress: '', // 添加详细地址字段
				doorImages: [],
				locationDesc: '',
				taskDetails: '',
				goodsRequirement: '',
				timeFrame: '5小时内',
				timeSlot: '15日 12点-14点',
				additional_notes: '', // 添加订单备注字段
				recommended_service_time_start: '', // 建议骑手上门开始时间
				recommended_service_time_end: '', // 建议骑手上门结束时间
				coupon: '',
				couponId: '', // 添加优惠券ID字段
				couponAmount: 0, // 添加优惠券金额字段
				estimatedPrice: 0.01,
				quantity: '', // 补宝数量没有默认值，必须填写
				badItemQuantity: 0, // 修改为默认数量0
				cableQuantity: 0, // 修改为默认数量0
				wiringQuantity: 0, // 添加接线数量字段
				timeType: 'before_deadline', // 默认选择约定时间内完成
				appointmentTime: '', // 约定时间
				timeInterval: '', // 指定时间区间
				timeRemark: '', // 添加时间备注字段
			powerQuantity: 0,
			warehouseQuantity: 0,
			exceptionQuantity: 0, // 处理异常数量
			badItemRecycleQuantity: 0, // 坏宝回收数量
			powerCableQuantity: 0, // 加电源线数量
			phone: '', // 添加联系电话字段
			contact: '', // 添加联系人字段
			distance: 0, // 选中地址后与服务点位测算的距离
			riderTip: 0, // 给骑手的打赏金额
			shop_poi: '', // 新增POI字段
			device_outside: false, // 设备是否外摆，默认为否
			prefer_member: '', // 骑手接单偏好：same-相同骑手 / different-不同骑手
		},
				showTimePicker: false,
				currentTimeType: 'before_deadline',
				lastAppointmentTime: null,
				lastTimeRemark: '',

				showPricePopup: false, // 添加价格明细弹窗显示状态
				showAgreementPopup: false, // 添加价格协议弹窗显示状态
				showPriceQuestionPopup: false, // 添加价格疑问弹窗显示状态
				startAddress: '', // 起点地址
				endAddress: '', // 终点地址
				startLocation: null, // 起点位置
				endLocation: null, // 终点位置
				showTimeSelect: false,
				selectedDate: '',
				selectedTime: '',
				selectedTimeRange: [],
				timePickerTextShow: '',
				beforeDeadlineTextShow: '',
				priceDetails: {
					baseServiceFee: 0,
					extraDeviceFee: 0,
					distanceFee: 0,
					extraDistanceFee: 0,
					timeLimitFee: 0,
					wireFee: 0,
					extraWireFee: 0,
					powerFee: 0,
					couponAmount: 0, // 添加优惠券金额
					total: 0
				},
				providerInfo: {},
				// 区域选择相关数据
				selectedCity: '',
				selectedDistrictId: '',
				// 时间段选择器相关数据
				timeRangePickerData: [[], [], [], []], // [开始小时, 开始分钟, 结束小时, 结束分钟]
				timeRangeIndex: [10, 0, 19, 0], // 默认选择 09:00 - 18:00 (因为第一个是"24小时均可"，所以索引+1)
				showTimeRangePopup: false, // 时间段选择弹窗显示状态
				tempTimeRangeIndex: [10, 0, 19, 0], // 临时时间段索引
				indicatorStyle: 'height: 50px;', // picker-view指示器样式
				// 用户信息
				currentUserInfo: {},
				// 订单确认弹窗
				showOrderConfirmPopup: false,
				// 打赏弹窗相关
				showTipModal: false,
				selectedTipOption: 'drink',
				selectedTipAmount: 12
			}
		},
		// 添加计算属性，处理表单字段状态
		computed: {
			// 检查是否已选择区域
			hasSelectedArea() {
				return !!(this.selectedCity && this.selectedDistrictId);
			},

			showStoreNamePlaceholder() {
				return this.formData.storeName === '';
			},

			showSnMacPlaceholder() {
				return this.formData.snMacList.some(snMac => snMac === '');
			},

			showAddressPlaceholder() {
				return this.formData.address === '';
			},
			availableBrands() {
				const arr = []
				if (this.providerInfo.meituan) arr.push('meituan')
				if (this.providerInfo.guaishou) arr.push('guaishou')
				if (this.providerInfo.jiedian) arr.push('jiedian')
				if (this.providerInfo.xiaodian) arr.push('xiaodian')
				return arr
			},
			// 判断用户是否已登录
			isLoggedIn() {
				// 检查本地存储中的用户信息
				const userInfo = uni.getStorageSync('userInfo');
				// 检查本地存储中的手机号
				const userPhone = uni.getStorageSync('userPhone');
				// 如果有用户信息和手机号，则认为已登录
				return (userInfo && userInfo.openid) || userPhone;
			},

			// 获取用户信息
			userInfo() {
				return this.currentUserInfo;
			},
		},
		// 页面显示时检查登录状态
		onShow() {
			// 更新用户信息
			this.currentUserInfo = uni.getStorageSync('userInfo') || {};

			// 每次页面显示时重新检查登录状态
			// isLoggedIn 是计算属性，会自动更新
			// console.log('页面显示，登录状态:', this.isLoggedIn);
			// console.log('用户信息:', this.userInfo);
			// console.log('用户ID:', this.userInfo.user_id);

			// 重新计算价格（可能用户信息发生了变化）
			// this.calculatePrice();
		},

		onLoad(options) {
			const systemInfo = uni.getSystemInfoSync()
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			this.navBarHeight = menuButtonInfo.bottom + 12

			// 从首页获取 taskTypeId
			if (options.taskTypeId) {
				this.taskTypeId = parseInt(options.taskTypeId)
			} else {
				// 如果没有传入 taskTypeId，则根据 selectedService 设置默认值
				this.taskTypeId = this.selectedService === 'bubao' ? 1 : 2
			}

			// 处理再来一单的数据导入
			if (options.from === 'reorder') {
				const reorderData = uni.getStorageSync('reorderFormData')
				console.log('从存储读取的再来一单数据:', reorderData)
				
				// 立即清除临时数据，防止数据污染
				uni.removeStorageSync('reorderFormData')
				
				if (reorderData) {
					// 验证数据时效性（5分钟内的数据才有效）
					const currentTime = Date.now()
					const dataTimestamp = reorderData._timestamp || 0
					const timeElapsed = (currentTime - dataTimestamp) / 1000 / 60  // 转换为分钟
					
					if (timeElapsed > 5) {
						console.warn('再来一单数据已过期，忽略导入')
						uni.showToast({
							title: '数据已过期，请重新操作',
							icon: 'none'
						})
						return
					}
					
					console.log('数据来源:', reorderData._source, '时间差:', timeElapsed.toFixed(2), '分钟')
					
				// 移除元数据字段
				delete reorderData._timestamp
				delete reorderData._source
				
				// 直接替换 formData，确保所有字段都被正确设置
				this.formData = reorderData
				
			// 【关键】再次确保所有数量和价格字段都已清空，避免价格计算错误
			this.formData.quantity = ''
			this.formData.badItemQuantity = 0
			this.formData.cableQuantity = 0
			this.formData.powerQuantity = 0
			this.formData.wiringQuantity = 0
			this.formData.warehouseQuantity = 0
			this.formData.exceptionQuantity = 0
			this.formData.badItemRecycleQuantity = 0
			this.formData.powerCableQuantity = 0
			this.formData.riderTip = 0
			this.formData.distance = 0
			this.formData.estimatedPrice = 0.01
			this.formData.appointmentTime = ''
			this.formData.timeInterval = ''
			this.formData.couponAmount = 0
			
			// 清空附加服务选项
				this.selectedAdditionalServices = []
				
				// 清空品牌和服务选择（用户需要重新选择）
				this.selectedBrand = ''
				
				console.log('导入后的formData:', this.formData)
				console.log('地址字段:', {
					address: this.formData.address,
					detailAddress: this.formData.detailAddress,
					storeName: this.formData.storeName,
					province: this.formData.province,
					city: this.formData.city,
					district: this.formData.district
				})
				console.log('数量字段（应该全部为空或0）:', {
					quantity: this.formData.quantity,
					badItemQuantity: this.formData.badItemQuantity,
					cableQuantity: this.formData.cableQuantity,
					powerQuantity: this.formData.powerQuantity,
					distance: this.formData.distance
				})
				
				// 强制更新视图
				this.$nextTick(() => {
					this.$forceUpdate()
				})
				
				// 标记为再来一单模式，在 onShow 中处理接口调用顺序
				this.isReorderMode = true
				}
			}

			// 获取并打印用户信息用于调试
			this.currentUserInfo = uni.getStorageSync('userInfo') || {};
			console.log('页面加载时的用户信息:', this.currentUserInfo);
			console.log('用户ID:', this.currentUserInfo.user_id || '未获取到');

			// 初始化时间段选择器数据
			this.initTimeRangePickerData();

			// 延迟初始化一些需要等待组件加载完成的操作
			setTimeout(() => {
				this.initializeComponents();
			}, 100);
		},
	onReady() {
		// 页面渲染完成后执行的操作
		this.initializeComponents();
	},
		onUnload() {
			// 页面卸载时清理可能残留的临时数据
			uni.removeStorageSync('reorderFormData')
		},
	async onShow(){
		// 初始化区域选择数据
		this.initAreaData();

		// 如果是再来一单模式，先调用 user/create，再调用 getProviderInfo
		if (this.isReorderMode) {
			console.log('再来一单模式：开始按顺序调用接口')
			
			// 1. 先调用 user/create 接口
			await this.callUserCreate()
			
			// 2. 再调用 task/provider/info 接口
			await this.getProviderInfo()
			
			// 3. 【关键】再次确保所有数量字段为空，避免价格异常
			this.formData.quantity = ''
			this.formData.badItemQuantity = 0
			this.formData.cableQuantity = 0
			this.formData.powerQuantity = 0
			this.formData.wiringQuantity = 0
			this.formData.warehouseQuantity = 0
			this.formData.exceptionQuantity = 0
			this.formData.badItemRecycleQuantity = 0
			this.formData.powerCableQuantity = 0
			this.formData.riderTip = 0
			this.formData.distance = 0
			this.formData.estimatedPrice = 0.01
			this.selectedAdditionalServices = []
			
			console.log('再来一单：数量字段已全部清零')
			
			// 重置标记
			this.isReorderMode = false
		} else {
			// 正常模式：直接获取服务商信息
			await this.getProviderInfo()
		}

		this.calculatePrice()

		// 不再在页面进入时检查区域，等用户点击选项时再检查
		// this.checkInitialAreaSelection()
	},
		methods: {
			// 初始化区域数据
			initAreaData() {
				this.selectedCity = uni.getStorageSync('selectedCity') || '';
				this.selectedDistrictId = uni.getStorageSync('selectedDistrictId') || '';
				console.log('🏙️ 初始化区域数据:', {
					selectedCity: this.selectedCity,
					selectedDistrictId: this.selectedDistrictId,
					hasSelectedArea: this.hasSelectedArea
				});
			},

			// 显示区域选择模态框（透明蒙版点击时）
			showAreaSelectionModal() {
				console.log('🎭 透明蒙版被点击，显示区域选择提示');

				uni.showModal({
					title: '选择服务区域',
					content: '请先选择您的服务区域，以便为您提供准确的服务',
					showCancel: true,
					cancelText: '取消',
					confirmText: '去选择',
					success: (res) => {
						if (res.confirm) {
							// 监听区域选择完成事件
							uni.$on('areaSelected', (data) => {
								console.log('🎯 监听到区域选择完成，重新获取服务商信息', data);
								// 更新 Vue 响应式数据
								this.selectedCity = data.city;
								this.selectedDistrictId = data.districtId;
								console.log('✅ 更新区域数据:', {
									selectedCity: this.selectedCity,
									selectedDistrictId: this.selectedDistrictId,
									hasSelectedArea: this.hasSelectedArea
								});
								// 重新获取服务商信息（会自动触发价格计算）
								this.getProviderInfo();
								// 移除事件监听
								uni.$off('areaSelected');
							});

							uni.navigateTo({
								url: '/pages/index/city/index',
								fail: (err) => {
									console.error('页面跳转失败:', err);
									uni.showToast({
										title: '页面跳转失败',
										icon: 'none'
									});
								}
							});
						}
					}
				});
			},

			// 初始区域检查（页面进入时）
			checkInitialAreaSelection() {
				const selectedCity = uni.getStorageSync('selectedCity');
				const selectedDistrictId = uni.getStorageSync('selectedDistrictId');

				console.log('🏙️ 初始区域检查:', { selectedCity, selectedDistrictId });

				// 如果没有选择城市或区域，立即弹出区域选择页面
				if (!selectedCity || !selectedDistrictId) {
					console.log('❌ 未选择区域，立即跳转到区域选择页面');

					// 延迟一下确保页面加载完成
					setTimeout(() => {
						uni.showModal({
							title: '选择服务区域',
							content: '请先选择您的服务区域，以便为您提供准确的服务',
							showCancel: false,
							confirmText: '去选择',
							success: (res) => {
								if (res.confirm) {
									uni.navigateTo({
										url: '/pages/index/city/index',
										fail: (err) => {
											console.error('页面跳转失败:', err);
											uni.showToast({
												title: '页面跳转失败',
												icon: 'none'
											});
										}
									});
								}
							}
						});
					}, 500);
				}
			},

			// 检查区域选择（交互时）
			checkAreaSelection() {
				const selectedCity = uni.getStorageSync('selectedCity');
				const selectedDistrictId = uni.getStorageSync('selectedDistrictId');

				console.log('🏙️ 检查区域选择:', { selectedCity, selectedDistrictId });

				// 如果没有选择城市或区域，弹出区域选择页面
				if (!selectedCity || !selectedDistrictId) {
					console.log('❌ 未选择区域，跳转到区域选择页面');

					uni.showModal({
						title: '选择服务区域',
						content: '请先选择您的服务区域',
						showCancel: true,
						cancelText: '取消',
						confirmText: '去选择',
						success: (res) => {
							if (res.confirm) {
								uni.navigateTo({
									url: '/pages/index/city/index',
									fail: (err) => {
										console.error('页面跳转失败:', err);
										uni.showToast({
											title: '页面跳转失败',
											icon: 'none'
										});
									}
								});
							}
						}
					});

					return false; // 阻止其他操作
				}

				console.log('✅ 已选择区域，可以继续操作');
				return true; // 允许继续操作
			},

		// 调用 user/create 接口
		async callUserCreate() {
			try {
				console.log('📞 调用 user/create 接口')
				const userInfo = uni.getStorageSync('userInfo')
				
				if (!userInfo || !userInfo.openid) {
					console.log('用户未登录，跳过 user/create 接口')
					return
				}

				const params = {
					openid: userInfo.openid,
					userPhone: userInfo.phone_number || userInfo.userPhone || ''
				}

				const response = await uni.request({
					url: 'https://ccpt.0871.cn/api/user/create',
					method: 'POST',
					data: params,
					header: {
						'Content-Type': 'application/json'
					}
				})

				if (response.statusCode === 200 && response.data) {
					console.log('✅ user/create 接口调用成功:', response.data)
					// 更新用户信息（如果接口返回了新的用户信息）
					if (response.data.data) {
						const updatedUserInfo = {
							...userInfo,
							...response.data.data
						}
						uni.setStorageSync('userInfo', updatedUserInfo)
						this.currentUserInfo = updatedUserInfo
					}
				} else {
					console.error('❌ user/create 接口调用失败:', response)
				}
			} catch (error) {
				console.error('❌ user/create 接口调用异常:', error)
			}
		},

		// 获取服务商信息
		async getProviderInfo() {
			try {
				let selectedDistrictId;
				const selectedDistrictId_new = uni.getStorageSync('selectedDistrictId_new');
				if(selectedDistrictId_new) {
					selectedDistrictId = selectedDistrictId_new
				} else {
					selectedDistrictId = uni.getStorageSync('selectedDistrictId');
					if (!selectedDistrictId) {
						console.log('未选择服务区域，跳过获取服务商信息');
						return;
					}
				}

				console.log('🏪 获取服务商信息，区域ID:', selectedDistrictId);
				const res = await this.$request('task/provider/info', { district_id: selectedDistrictId }, 'POST');
				console.log('服务商信息:', res);

					if (res.code === 200) {
						uni.removeStorageSync('selectedDistrictId_new');
						this.providerInfo = res.data;
						// 保存到本地存储供价格计算使用
						uni.setStorageSync('providerInfo', res.data);

						// 更新可用品牌列表
						this.updateAvailableBrands();

						// 重新计算价格
						this.calculatePrice();

						console.log('✅ 服务商信息获取成功，价格已重新计算');
					} else {
						console.error('获取服务商信息失败:', res.msg);
						uni.showToast({
							title: res.msg || '获取服务商信息失败',
							icon: 'none'
						});
					}
				} catch (err) {
					console.error('获取服务商信息失败:', err);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					});
				}
			},

			// 更新可用品牌列表
			updateAvailableBrands() {
				// 不自动选择品牌，让用户手动选择
				console.log('可用品牌列表:', this.availableBrands);
			},

			// 添加初始化组件的方法
			initializeComponents() {
				// 初始化价格计算
				// this.calculatePrice();

				// 初始化其他需要等待组件加载完成的操作
				if (this.$refs.pricePopup) {
					// 初始化价格弹窗
				}

				if (this.$refs.agreementPopup) {
					// 初始化协议弹窗
				}
			},
			// 角度转弧度
			deg2rad(deg) {
				return deg * (Math.PI / 180);
			},
			// 计算两点之间的距离（单位：千米）
			calculateDistance(lat1, lon1, lat2, lon2) {
				// 使用Haversine公式计算两点之间的距离
				const R = 6371; // 地球半径（千米）
				const dLat = this.deg2rad(lat2 - lat1);
				const dLon = this.deg2rad(lon2 - lon1);
				const a =
					Math.sin(dLat / 2) * Math.sin(dLat / 2) +
					Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
					Math.sin(dLon / 2) * Math.sin(dLon / 2);
				const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
				const distance = R * c;

				// 保留一位小数
				return distance.toFixed(1);
			},
			// 添加价格计算方法
			calculatePrice() {
				console.log('=== 开始计算价格 ===');
				console.log('当前时间:', new Date().toLocaleTimeString());

				// 获取服务商信息
				if (!this.providerInfo) {
					console.log('providerInfo为空，退出计算');
					// 静默处理，不显示弹窗
					return;
				}

				// 【调试日志】服务商信息状态
				console.log('providerInfo状态:', {
					hasProviderInfo: !!this.providerInfo,
					service_provider_id: this.providerInfo.service_provider_id,
					latitude: this.providerInfo.latitude,
					longitude: this.providerInfo.longitude,
					bubao_base_distance: this.providerInfo.bubao_base_distance,
					bubao_extra_distance: this.providerInfo.bubao_extra_distance,
					bubao_extra_distance_fee: this.providerInfo.bubao_extra_distance_fee
				});
				

				// this.providerInfo = providerInfo	

				const info = this.providerInfo.prices;

				// 获取数量，如果为空则使用0进行计算
				const quantity = parseInt(this.formData.quantity) || 0;

				// 1. 计算基础补宝服务费用
				let baseServiceFee = 0;
				let extraDeviceFee = 0;

				// 只有当数量大于0时才计算费用
				if (quantity > 0) {
					baseServiceFee = parseFloat(info.bubao_base_device_fee) || 0; // 初始为基础设备费用

					// 如果设备数量超过基础数量，计算额外费用
					if (quantity > info.bubao_base_device) {
						const extraDevices = Math.ceil((quantity - info.bubao_base_device) / info.bubao_extra_device);
						
					// bubao_extra_device_fee: "2.00"
					// bubao_extra_device_fee_2: "0.50"
					// bubao_extra_device_fee_3: "0.30"
					// bubao_extra_device_fee_4: "0.20"
					// bubao_extra_device_fee_5: "0.10"
					// bubao_extra_device_upper_number: 8
					// bubao_extra_device_upper_number_2: 30
					// bubao_extra_device_upper_number_3: 50
					// bubao_extra_device_upper_number_4: 100
					// bubao_extra_device_upper_number_5: 200
					extraDeviceFee = extraDevices * (parseFloat(info.bubao_extra_device_fee) || 0);
					// 超出金额累加
					if(quantity > info.bubao_extra_device_upper_number_5) {
						extraDeviceFee = extraDeviceFee + 
						(
							(info.bubao_extra_device_fee_5*100)
						) * (quantity - info.bubao_extra_device_upper_number_5) / 100;
					}
					
					if(quantity > info.bubao_extra_device_upper_number_4) {
						extraDeviceFee = extraDeviceFee + 
						(
							(info.bubao_extra_device_fee_4*100)
						) * (quantity - info.bubao_extra_device_upper_number_4) / 100;
					}
					
					if(quantity > info.bubao_extra_device_upper_number_3) {
						extraDeviceFee = extraDeviceFee + 
						(
							(info.bubao_extra_device_fee_3*100)
						) * (quantity - info.bubao_extra_device_upper_number_3) / 100;
					}
					
					if(quantity > info.bubao_extra_device_upper_number_2) {
						extraDeviceFee = extraDeviceFee + 
						(
							(info.bubao_extra_device_fee_2*100)
						) * (quantity - info.bubao_extra_device_upper_number_2) / 100;
					}
					}
				}

				// 2. 计算距离费用
				let distanceFee = parseFloat(info.bubao_base_distance_fee) || 0; // 初始为基础距离费用
				let extraDistanceFee = 0;

				// 计算实时距离（确保使用最新的坐标计算）
				let distance = 0;
				if (this.formData.latitude && this.formData.longitude && this.providerInfo.latitude && this.providerInfo.longitude) {
					distance = parseFloat(this.calculateDistance(
						this.providerInfo.latitude,
						this.providerInfo.longitude,
						this.formData.latitude,
						this.formData.longitude
					));

					// 【调试日志】坐标和距离计算详情
					console.log('=== 距离计算详情 ===');
					console.log('服务商坐标:', {
						latitude: this.providerInfo.latitude,
						longitude: this.providerInfo.longitude
					});
					console.log('门店坐标:', {
						latitude: this.formData.latitude,
						longitude: this.formData.longitude
					});
					console.log('计算出的距离:', distance);
					console.log('formData中原有的distance:', this.formData.distance);

					// 同步更新formData中的distance字段
					this.formData.distance = distance;
					console.log('更新后的formData.distance:', this.formData.distance);
				}

				// 如果距离超过基础距离，计算额外费用
				if (distance > info.bubao_base_distance) {
					const extraDistance = Math.ceil((distance - info.bubao_base_distance) / info.bubao_extra_distance);
					extraDistanceFee = extraDistance * (parseFloat(info.bubao_extra_distance_fee) || 0);

					// 【调试日志】距离费用计算详情
					console.log('距离费用计算详情:', {
						实际距离: distance,
						基础距离: info.bubao_base_distance,
						超出距离: distance - info.bubao_base_distance,
						增量距离单位: info.bubao_extra_distance,
						增量距离倍数: extraDistance,
						单位增量费用: info.bubao_extra_distance_fee,
						总增量费用: extraDistanceFee
					});
				}

				// 3. 计算时间限制费用
				let timeLimitFee = 0;
				if (this.formData.timeType === 'before_deadline' && this.formData.appointmentTime) {
					const hours = parseInt(this.formData.appointmentTime);
					// 根据小时数查找对应的时间限制费用
					for (let i = 1; i <= 10; i++) {
						if (hours <= info[`bubao_time_limit_${i}`]) {
							timeLimitFee = parseFloat(info[`bubao_time_limit_${i}_fee`]) || 0;
							break;
						}
					}
				}

				// 4. 计算电源线相关费用
				let wireFee = 0;
				let extraWireFee = 0;

				if (this.selectedAdditionalServices.includes('powerCable')) {
					wireFee = parseFloat(info.bubao_wire_base_fee) || 0; // 基础费用
					// 如果设备数量超过基础数量，计算额外费用
					if (this.formData.cableQuantity > info.bubao_wire_base_device) {
						const extraDevices = Math.ceil((this.formData.cableQuantity - info.bubao_wire_base_device) / info.bubao_wire_device_count);
						extraWireFee = extraDevices * (parseFloat(info.bubao_wire_device_fee) || 0);
					}
				}

			// 5. 计算通电费用
			let powerFee = 0;
			if (this.selectedAdditionalServices.includes('power')) {
				// 基础费用
				powerFee = parseFloat(info.bubao_power_fee) || 0;
				// 如果设备数量超过基础数量，计算额外费用
				if (this.formData.powerQuantity > info.bubao_power_base_device) {
					const extraDevices = Math.ceil((this.formData.powerQuantity - info.bubao_power_base_device) / info.bubao_power_device_count);
					powerFee += extraDevices * (parseFloat(info.bubao_power_device_fee) || 0);
				}
			}

		// 6. 计算新附加服务费用
		// 6.1 处理异常费用
		let exceptionFee = 0;
		let exceptionExtraFee = 0;
		if (this.selectedAdditionalServices.includes('handleException') && this.formData.exceptionQuantity > 0) {
			exceptionFee = parseFloat(info.bubao_exception_base_fee) || 0; // 使用bubao_exception_base_fee作为基础费用
			// 如果设备数量超过基础数量，计算额外费用
			if (this.formData.exceptionQuantity > (info.bubao_exception_base_device || 1)) {
				const extraDevices = Math.ceil((this.formData.exceptionQuantity - (info.bubao_exception_base_device || 1)) / (info.bubao_exception_extra_device || 1));
				exceptionExtraFee = extraDevices * (parseFloat(info.bubao_exception_extra_device_fee) || 0);
			}
		}

		// 6.2 坏宝回收费用
		let badItemRecycleFee = 0;
		let badItemRecycleExtraFee = 0;
		if (this.selectedAdditionalServices.includes('badItemRecycle') && this.formData.badItemRecycleQuantity > 0) {
			badItemRecycleFee = parseFloat(info.bubao_shoubao_base_fee) || 0;
			// 如果设备数量超过基础数量，计算额外费用
			if (this.formData.badItemRecycleQuantity > (info.bubao_shoubao_base_device || 1)) {
				const extraDevices = Math.ceil((this.formData.badItemRecycleQuantity - (info.bubao_shoubao_base_device || 1)) / (info.bubao_shoubao_extra_device || 1));
				badItemRecycleExtraFee = extraDevices * (parseFloat(info.bubao_shoubao_extra_device_fee) || 0);
			}
		}

		// 6.3 加电源线费用
		let addPowerCableFee = 0;
		let addPowerCableExtraFee = 0;
		if (this.selectedAdditionalServices.includes('addPowerCable') && this.formData.powerCableQuantity > 0) {
			addPowerCableFee = parseFloat(info.bubao_wire_base_fee) || 0;
			// 如果设备数量超过基础数量，计算额外费用
			if (this.formData.powerCableQuantity > (info.bubao_wire_base_device || 1)) {
				const extraDevices = Math.ceil((this.formData.powerCableQuantity - (info.bubao_wire_base_device || 1)) / (info.bubao_wire_extra_device || 1));
				addPowerCableExtraFee = extraDevices * (parseFloat(info.bubao_wire_extra_device_fee) || 0);
			}
		}

			// 7. 获取打赏金额

			const riderTip = parseFloat(this.formData.riderTip) || 0;



				// 计算服务费用总额（未减优惠券金额，不含打赏）

				const serviceAmount = baseServiceFee + distanceFee + timeLimitFee + wireFee + powerFee + extraDeviceFee + extraDistanceFee + extraWireFee + exceptionFee + exceptionExtraFee + badItemRecycleFee + badItemRecycleExtraFee + addPowerCableFee + addPowerCableExtraFee;



				// 【调试日志】金额计算详情

				console.log('总价计算详情:', {

					主项服务费用: baseServiceFee,

					主项增量费用: extraDeviceFee,

					基础距离费用: distanceFee,

					距离增量费用: extraDistanceFee,

					时间限制费用: timeLimitFee,

					线路费用: wireFee,

					线路增量费用: extraWireFee,

					电力费用: powerFee,

					骑手打赏: riderTip,

					服务金额: serviceAmount

				});



				// 6. 减去优惠券金额（仅作用于服务金额）

				const couponAmount = parseFloat(this.formData.couponAmount) || 0;

				let totalPrice = Math.max(1, serviceAmount - couponAmount); // 确保总价不低于1元



				// 更新表单数据
				this.formData.estimatedPrice = totalPrice;

			// 更新价格详情
			this.priceDetails = {
				baseServiceFee: parseFloat(baseServiceFee),
				extraDeviceFee: parseFloat(extraDeviceFee),
				distanceFee: parseFloat(distanceFee),
				extraDistanceFee: parseFloat(extraDistanceFee),
				timeLimitFee: parseFloat(timeLimitFee),
				wireFee: parseFloat(wireFee),
				extraWireFee: parseFloat(extraWireFee),
				powerFee: parseFloat(powerFee),
				exceptionFee: parseFloat(exceptionFee),
				exceptionExtraFee: parseFloat(exceptionExtraFee),
				badItemRecycleFee: parseFloat(badItemRecycleFee),
				badItemRecycleExtraFee: parseFloat(badItemRecycleExtraFee),
				addPowerCableFee: parseFloat(addPowerCableFee),
				addPowerCableExtraFee: parseFloat(addPowerCableExtraFee),
				riderTip: parseFloat(riderTip), // 添加骑手打赏金额
				couponAmount: parseFloat(couponAmount), // 添加优惠券金额
				serviceAmount: parseFloat(serviceAmount),
				total: parseFloat(totalPrice)
			};

				// 【调试日志】最终价格详情
				console.log('=== 最终价格详情 ===');
				console.log('各项费用明细:', this.priceDetails);
				console.log('预期总价:', this.priceDetails.total);
				console.log('formData中的价格:', this.formData.estimatedPrice);
				console.log('=== 价格计算结束 ===');

				console.log('价格计算详情:', {
					baseServiceFee,
					extraDeviceFee,
					distanceFee,
					extraDistanceFee,
					timeLimitFee,
					wireFee,
					extraWireFee,
					powerFee,
					couponAmount,
					totalPrice
				});
			},
			selectBrand(brand) {
				this.selectedBrand = brand
			},
			selectService(service) {
				this.selectedService = service
			},
			selectAdditionalService(service) {
				const index = this.selectedAdditionalServices.indexOf(service)
				if (index === -1) {
					this.selectedAdditionalServices.push(service)
					// 选中时设置默认数量为1
					if (service === 'power') {
						this.formData.powerQuantity = 1
					} else if (service === 'warehouse') {
						this.formData.warehouseQuantity = 1
					} else if (service === 'powerCable') {
						this.formData.cableQuantity = 1
					} else if (service === 'handleException') {
						this.formData.exceptionQuantity = 1
					} else if (service === 'badItemRecycle') {
						this.formData.badItemRecycleQuantity = 1
					} else if (service === 'addPowerCable') {
						this.formData.powerCableQuantity = 1
					}
				} else {
					this.selectedAdditionalServices.splice(index, 1)
					// 取消选中时设置数量为0
					if (service === 'power') {
						this.formData.powerQuantity = 0
					} else if (service === 'warehouse') {
						this.formData.warehouseQuantity = 0
					} else if (service === 'powerCable') {
						this.formData.cableQuantity = 0
					} else if (service === 'handleException') {
						this.formData.exceptionQuantity = 0
					} else if (service === 'badItemRecycle') {
						this.formData.badItemRecycleQuantity = 0
					} else if (service === 'addPowerCable') {
						this.formData.powerCableQuantity = 0
					}
				}
				this.calculatePrice() // 更新价格
			},
			getBrandColor() {
				// 根据选择的品牌返回对应的颜色
				switch(this.selectedBrand) {
					case 'meituan':
						return '#FFD100'
					case 'xiaoe':
						return '#0FB269'
					case 'didi':
						return '#16C2C2'
					case 'jidian':
						return '#61CA87'
					default:
						return '#2492F2'
				}
			},
			increaseQuantity() {
				const currentQuantity = parseInt(this.formData.quantity) || 0;
				this.formData.quantity = currentQuantity + 1;
				this.calculatePrice(); // 更新价格
			},
			decreaseQuantity() {
				const currentQuantity = parseInt(this.formData.quantity) || 0;
				if (currentQuantity > 1) {
					this.formData.quantity = currentQuantity - 1;
					this.calculatePrice(); // 更新价格
				} else if (currentQuantity === 1) {
					// 当数量为1时，减少后变为空
					this.formData.quantity = '';
					this.calculatePrice(); // 更新价格
				}
			},
			// 处理数量输入变化
			onQuantityInput(e) {
				const inputValue = e.detail.value;
				if (inputValue === '' || inputValue === null || inputValue === undefined) {
					// 允许空值
					this.formData.quantity = '';
				} else {
					const value = parseInt(inputValue);
					if (isNaN(value) || value < 1) {
						// 如果输入无效或小于1，设置为空
						this.formData.quantity = '';
					} else {
						// 不限制数量上限
						this.formData.quantity = value;
					}
				}
				// 触发价格重新计算
				this.calculatePrice();
			},
			increaseBadItemQuantity() {
				this.formData.badItemQuantity++
				if (this.formData.badItemQuantity > 0 && !this.selectedAdditionalServices.includes('badItem')) {
					this.selectedAdditionalServices.push('badItem')
				}
			},
			decreaseBadItemQuantity() {
				if (this.formData.badItemQuantity > 0) {
					this.formData.badItemQuantity--
					if (this.formData.badItemQuantity === 0) {
						this.selectedAdditionalServices = this.selectedAdditionalServices.filter(s => s !== 'badItem')
					}
				}
			},
			increaseWiringQuantity() {
				this.formData.wiringQuantity++
				if (this.formData.wiringQuantity > 0 && !this.selectedAdditionalServices.includes('wiring')) {
					this.selectedAdditionalServices.push('wiring')
				}
			},
			decreaseWiringQuantity() {
				if (this.formData.wiringQuantity > 0) {
					this.formData.wiringQuantity--
					if (this.formData.wiringQuantity === 0) {
						this.selectedAdditionalServices = this.selectedAdditionalServices.filter(s => s !== 'wiring')
					}
				}
			},
			increaseCableQuantity() {
				this.formData.cableQuantity++
				if (this.formData.cableQuantity > 0 && !this.selectedAdditionalServices.includes('powerCable')) {
					this.selectedAdditionalServices.push('powerCable')
				}
				this.calculatePrice() // 更新价格
			},
			decreaseCableQuantity() {
				if (this.formData.cableQuantity > 0) {
					this.formData.cableQuantity--
					if (this.formData.cableQuantity === 0) {
						this.selectedAdditionalServices = this.selectedAdditionalServices.filter(s => s !== 'powerCable')
					}
				}
				this.calculatePrice() // 更新价格
			},
		// 处理异常数量增加
		increaseExceptionQuantity() {
			// 如果服务未选中，先选中
			if (!this.selectedAdditionalServices.includes('handleException')) {
				this.selectedAdditionalServices.push('handleException')
				this.formData.exceptionQuantity = 1
			} else {
				this.formData.exceptionQuantity++
			}
			this.calculatePrice()
		},
		// 处理异常数量减少
		decreaseExceptionQuantity() {
			if (this.formData.exceptionQuantity > 0) {
				this.formData.exceptionQuantity--
				// 如果数量减到0，取消选中
				if (this.formData.exceptionQuantity === 0) {
					this.selectedAdditionalServices = this.selectedAdditionalServices.filter(s => s !== 'handleException')
				}
				this.calculatePrice()
			}
		},
		// 坏宝回收数量增加
		increaseBadItemRecycleQuantity() {
			// 如果服务未选中，先选中
			if (!this.selectedAdditionalServices.includes('badItemRecycle')) {
				this.selectedAdditionalServices.push('badItemRecycle')
				this.formData.badItemRecycleQuantity = 1
			} else {
				this.formData.badItemRecycleQuantity++
			}
			this.calculatePrice()
		},
		// 坏宝回收数量减少
		decreaseBadItemRecycleQuantity() {
			if (this.formData.badItemRecycleQuantity > 0) {
				this.formData.badItemRecycleQuantity--
				// 如果数量减到0，取消选中
				if (this.formData.badItemRecycleQuantity === 0) {
					this.selectedAdditionalServices = this.selectedAdditionalServices.filter(s => s !== 'badItemRecycle')
				}
				this.calculatePrice()
			}
		},
		// 加电源线数量增加
		increasePowerCableQuantity() {
			// 如果服务未选中，先选中
			if (!this.selectedAdditionalServices.includes('addPowerCable')) {
				this.selectedAdditionalServices.push('addPowerCable')
				this.formData.powerCableQuantity = 1
			} else {
				this.formData.powerCableQuantity++
			}
			this.calculatePrice()
		},
		// 加电源线数量减少
		decreasePowerCableQuantity() {
			if (this.formData.powerCableQuantity > 0) {
				this.formData.powerCableQuantity--
				// 如果数量减到0，取消选中
				if (this.formData.powerCableQuantity === 0) {
					this.selectedAdditionalServices = this.selectedAdditionalServices.filter(s => s !== 'addPowerCable')
				}
				this.calculatePrice()
			}
		},
		// 处理异常输入框聚焦事件
		onExceptionQuantityFocus() {
			if (!this.selectedAdditionalServices.includes('handleException')) {
				this.selectedAdditionalServices.push('handleException')
				if (this.formData.exceptionQuantity === 0) {
					this.formData.exceptionQuantity = 1
				}
				this.calculatePrice()
			}
		},
		// 坏宝回收输入框聚焦事件
		onBadItemRecycleQuantityFocus() {
			if (!this.selectedAdditionalServices.includes('badItemRecycle')) {
				this.selectedAdditionalServices.push('badItemRecycle')
				if (this.formData.badItemRecycleQuantity === 0) {
					this.formData.badItemRecycleQuantity = 1
				}
				this.calculatePrice()
			}
		},
		// 加电源线输入框聚焦事件
		onPowerCableQuantityFocus() {
			if (!this.selectedAdditionalServices.includes('addPowerCable')) {
				this.selectedAdditionalServices.push('addPowerCable')
				if (this.formData.powerCableQuantity === 0) {
					this.formData.powerCableQuantity = 1
				}
				this.calculatePrice()
			}
		},
		// 处理异常输入框输入事件
		onExceptionQuantityInput(e) {
			const value = parseInt(e.detail.value) || 0
			this.formData.exceptionQuantity = value
			if (value > 0) {
				if (!this.selectedAdditionalServices.includes('handleException')) {
					this.selectedAdditionalServices.push('handleException')
				}
			} else {
				this.selectedAdditionalServices = this.selectedAdditionalServices.filter(s => s !== 'handleException')
			}
			this.calculatePrice()
		},
		// 坏宝回收输入框输入事件
		onBadItemRecycleQuantityInput(e) {
			const value = parseInt(e.detail.value) || 0
			this.formData.badItemRecycleQuantity = value
			if (value > 0) {
				if (!this.selectedAdditionalServices.includes('badItemRecycle')) {
					this.selectedAdditionalServices.push('badItemRecycle')
				}
			} else {
				this.selectedAdditionalServices = this.selectedAdditionalServices.filter(s => s !== 'badItemRecycle')
			}
			this.calculatePrice()
		},
		// 加电源线输入框输入事件
		onPowerCableQuantityInput(e) {
			const value = parseInt(e.detail.value) || 0
			this.formData.powerCableQuantity = value
			if (value > 0) {
				if (!this.selectedAdditionalServices.includes('addPowerCable')) {
					this.selectedAdditionalServices.push('addPowerCable')
				}
			} else {
				this.selectedAdditionalServices = this.selectedAdditionalServices.filter(s => s !== 'addPowerCable')
			}
			this.calculatePrice()
		},
			// 开始上传
			uploadFile(tempFilePaths) {
				uni.uploadFile({
					url: 'https://tixian.0871.cn/upload/qiniuImageUpload', // 服务器上传接口地址
					filePath: tempFilePaths[0],
					name: 'image', // 必须填写，后台用来接收文件
					formData: {
						'spaceName': 'chongchongpaotui' // 其他要上传的参数
					},
					success: (uploadFileRes) => {
						const res = JSON.parse(uploadFileRes.data)
						this.formData.doorImages.push(res.path)
						// 这里可以添加上传到服务器的代码
						uni.showToast({
							title: '上传成功',
							icon: 'success'
						})
					},
					fail: (uploadFileErr) => {
						console.error('图片上传失败', uploadFileErr);
					}
				});
			},
			uploadImage() {
				// 上传多张门头照片
				uni.chooseImage({
					count: 9, // 最多可以选择的图片张数
					success: (res) => {
						console.log("照片",res)
						this.uploadFile(res.tempFilePaths)
						// const tempFilePaths = res.tempFilePaths
						// // 将新选择的图片添加到数组中，控制总数不超过5张
						// const remaining = 5 - this.formData.doorImages.length
						// const newImages = tempFilePaths.slice(0, remaining)

						// this.formData.doorImages = [...this.formData.doorImages, ...newImages]
					}
				})
			},
			deleteImage(index) {
				// let url = this.formData.doorImages[index]
				// console.log("删除图片",url)
				this.uploadRemove_api(index)
			},
			// 删除七牛云照片
			uploadRemove_api(index) {
				let url = this.formData.doorImages[index]
				let data = {
					fileName: url,
				}
				uni.request({
					url: 'https://tixian.0871.cn/upload/qiniuDelete',
					data: data,
					header: {
						'Accept': 'application/json',
						'content-type': 'application/x-www-form-urlencoded',
						'Access-Control-Allow-Origin': '*',
						'token': uni.getStorageSync('token'),
					},
					method: "POST",
					success: (res) => {
						console.log(res)
						this.formData.doorImages.splice(index, 1)
						uni.showToast({
							title: '图片删除成功',
							icon: 'success'
						})
					},
					fail: (err) => {
						console.log(err)
					},
				})
			},
			async submitOrder() {
				// 验证表单
				if (!this.validateForm()) {
					return;
				}

				// 显示订单确认弹窗
				this.showOrderConfirmPopup = true;
				this.$refs.orderConfirmPopup.open();
			},

			// 加入购物车
			async addToCart() {
				// 验证表单
				if (!this.validateForm()) {
					return;
				}

				// 关闭确认弹窗
				this.closeOrderConfirmPopup();

				// 显示加载提示
				uni.showLoading({
					title: '加入购物车中...',
					mask: true
				});

				try {
					// 获取用户信息
					const userInfo = uni.getStorageSync('userInfo');
					if (!userInfo || !userInfo.openid) {
						uni.hideLoading();
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						});
						return;
					}

					// 构建请求数据
					const submitData = {
						openid: userInfo.openid,
						user_id: userInfo.user_id,
						task_type_id: this.taskTypeId,
						service_provider_id: this.providerInfo.service_provider_id,
						phone_number: this.formData.phone,
						name: this.formData.contact,
						brand: this.selectedBrand,
						province: this.formData.province,
						city: this.formData.city,
						district: this.formData.district,
						shop_address: this.formData.address,
						address: this.formData.detailAddress,
						longitude: this.formData.longitude,
						latitude: this.formData.latitude,
						base_service_fee: this.priceDetails.baseServiceFee + this.priceDetails.extraDeviceFee + this.priceDetails.distanceFee + this.priceDetails.timeLimitFee,
						extra_distance_fee: this.priceDetails.extraDistanceFee,
						additional_service_fee: this.priceDetails.wireFee + this.priceDetails.extraWireFee + this.priceDetails.powerFee,
						rider_tip: this.formData.riderTip,
						time_fee: this.priceDetails.timeLimitFee,
						order_amount: this.formData.estimatedPrice,
						service_time_type: this.formData.timeType,
						time_limit: this.formData.timeType === 'before_deadline' ? parseInt(this.formData.appointmentTime) : null,
						range_start_date: this.formData.timeType === 'time_range' && this.formData.timeInterval ? (() => {
							console.log('【调试】timeInterval处理前:', this.formData.timeInterval, '类型:', typeof this.formData.timeInterval);
							const timeStr = String(this.formData.timeInterval);
							console.log('【调试】timeInterval处理后:', timeStr);
							return timeStr.substring(0, 19);
						})() : null,
						range_end_date: this.formData.timeType === 'time_range' && this.formData.timeInterval ? String(this.formData.timeInterval).substring(20) : null,
						recommended_service_time_start: this.formData.recommended_service_time_start || '',
						recommended_service_time_end: this.formData.recommended_service_time_end || '',
						distance: this.formData.distance,
						store_name: this.formData.storeName,
						sn_mac_code: this.formData.snMacList,
						detail: this.selectedService,
						item_number: this.formData.quantity,
					device_outside: this.formData.device_outside ? 1 : 0,
				extra_task_1: this.selectedAdditionalServices.includes('handleException') ? '处理异常' : null,
				extra_task_1_item_number: this.selectedAdditionalServices.includes('handleException') ? (this.formData.exceptionQuantity || 0) : 0,
				extra_task_2: this.selectedAdditionalServices.includes('badItemRecycle') ? '坏宝回收' : null,
				extra_task_2_item_number: this.selectedAdditionalServices.includes('badItemRecycle') ? (this.formData.badItemRecycleQuantity || 0) : 0,
				extra_task_3: this.selectedAdditionalServices.includes('addPowerCable') ? '加电源线' : null,
				extra_task_3_item_number: this.selectedAdditionalServices.includes('addPowerCable') ? (this.formData.powerCableQuantity || 0) : 0,
				description: this.formData.locationDesc,
						additional_notes: this.formData.additional_notes || '',
						pic_url: this.formData.doorImages,
						shop_poi: this.formData.shop_poi,
						ticket_id: this.formData.couponId || null,
						timestamp: Math.floor(Date.now() / 1000),
						sign: 'chongchong'
					};

					// 调用加入购物车接口
					const res = await this.$request('cart/add', submitData, 'POST');
					
					// 隐藏加载提示
					uni.hideLoading();

					if (res.code === 200) {
						// 加入购物车成功
						uni.showToast({
							title: '已加入购物车',
							icon: 'success',
							duration: 2000
						});

						// 触发购物车更新事件
						uni.$emit('cartUpdated');

						// 询问是否查看购物车
						setTimeout(() => {
							uni.showModal({
								title: '提示',
								content: '是否立即查看购物车？',
								success: (modalRes) => {
									if (modalRes.confirm) {
										// 跳转到购物车页面
										uni.switchTab({
											url: '/pages/cart/index',
											fail: () => {
												uni.showToast({
													title: '购物车页面暂未开发',
													icon: 'none'
												});
											}
										});
									}
								}
							});
						}, 1500);
					} else {
						// 加入购物车失败
						uni.showToast({
							title: res.message || '加入购物车失败',
							icon: 'none'
						});
					}
				} catch (error) {
					// 隐藏加载提示
					uni.hideLoading();

					console.error('加入购物车失败:', error);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					});
				}
			},

			// 确认提交订单
			async confirmSubmitOrder() {
				// 关闭确认弹窗
				this.closeOrderConfirmPopup();

				// 显示加载提示
				uni.showLoading({
					title: '提交中...',
					mask: true
				});

				try {
					// 获取用户信息
					const userInfo = uni.getStorageSync('userInfo');
					if (!userInfo || !userInfo.openid) {
						uni.hideLoading();
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						});
						return;
					}

					// 构建提交数据
					const submitData = {
						user_id: userInfo.user_id,
						openid: userInfo.openid,
						task_type_id: this.taskTypeId, // 使用首页服务网格选中的 task_type_id
						service_provider_id: this.providerInfo.service_provider_id, // 添加服务商ID
						item_number: this.formData.quantity,
						brand: this.selectedBrand,
						province: this.formData.province,
						city: this.formData.city,
						district: this.formData.district,
						shop_address: this.formData.address,
						address: this.formData.detailAddress,
						longitude: this.formData.longitude,
						latitude: this.formData.latitude,
						order_amount: this.formData.estimatedPrice,
						service_time_type: this.formData.timeType, // 直接使用 timeType 值
						time_limit: this.formData.timeType === 'before_deadline' ? parseInt(this.formData.appointmentTime) : null,
						range_start_date: this.formData.timeType === 'time_range' && this.formData.timeInterval ? String(this.formData.timeInterval).substring(0, 19) : null,
						range_end_date: this.formData.timeType === 'time_range' && this.formData.timeInterval ? String(this.formData.timeInterval).substring(20) : null,
						distance: this.formData.distance, // 需要计算服务地点到服务商基地的导航距离
						detail: this.selectedService,
						// 添加基础服务费用
						base_service_fee: this.priceDetails.baseServiceFee + this.priceDetails.extraDeviceFee + this.priceDetails.distanceFee + this.priceDetails.timeLimitFee,
						extra_distance_fee: this.priceDetails.extraDistanceFee,
						// 添加附加服务费用
						 additional_service_fee: this.priceDetails.wireFee + this.priceDetails.extraWireFee + this.priceDetails.powerFee,
						// 添加骑手打赏
						rider_tip: this.formData.riderTip,
						// 添加时效费用
						time_fee: this.priceDetails.timeLimitFee,
						// 添加优惠券ID
						ticket_id: this.formData.couponId || '',
						// 添加订单备注
						additional_notes: this.formData.additional_notes || '',
						// 添加建议骑手上门时间段
					recommended_service_time_start: this.formData.recommended_service_time_start || '',
					recommended_service_time_end: this.formData.recommended_service_time_end || '',

				extra_task_1: this.selectedAdditionalServices.includes('handleException') ? '处理异常' : null,
				extra_task_1_item_number: this.selectedAdditionalServices.includes('handleException') ? (this.formData.exceptionQuantity || 0) : 0,
				extra_task_2: this.selectedAdditionalServices.includes('badItemRecycle') ? '坏宝回收' : null,
				extra_task_2_item_number: this.selectedAdditionalServices.includes('badItemRecycle') ? (this.formData.badItemRecycleQuantity || 0) : 0,
				extra_task_3: this.selectedAdditionalServices.includes('addPowerCable') ? '加电源线' : null,
				extra_task_3_item_number: this.selectedAdditionalServices.includes('addPowerCable') ? (this.formData.powerCableQuantity || 0) : 0,

				description: this.formData.locationDesc,
					store_name: this.formData.storeName,
					sn_mac_code: this.formData.snMacList,
					pic_url: this.formData.doorImages ,// 门头照组
					phone_number: this.formData.phone,
					name: this.formData.contact,
					shop_poi: this.formData.shop_poi, // 门店POI
					device_outside: this.formData.device_outside, // 设备是否外摆
					prefer_member: this.formData.prefer_member || '' // 骑手接单偏好
				};

					// 打印提交数据
					console.log('提交数据:', submitData);

					// 使用 this.$request 发送请求
					const res = await this.$request('task/create', submitData, 'POST');
					// console.log(res)
					// 隐藏加载提示
					uni.hideLoading();

				if (res.code === 200) {
					// 提交成功，开始微信支付
					this.requestPayment(res.data);
				} else {
						// 提交失败
						uni.showToast({
							title: res.message || '提交失败',
							icon: 'none'
						});
					}
				} catch (error) {
					// 隐藏加载提示
					uni.hideLoading();

					console.error('提交订单失败:', error);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					});
				}
			},
			// 添加微信支付方法
			requestPayment(payParams) {
				// 显示支付中提示
				uni.showLoading({
					title: '支付中...',
					mask: true
				});

				// 保存门店记录
				this.saveStoreHistory();

				// 调用微信支付
				uni.requestPayment({
					provider: "weixin",
					timeStamp: payParams.pay_res.timestamp,
					nonceStr: payParams.pay_res.nonceStr,
					package: payParams.pay_res.package,
					signType: payParams.pay_res.signType,
					paySign: payParams.pay_res.paySign,
					success: async (res) => {
						// console.log('支付成功:', res);
						uni.hideLoading();
						uni.showToast({
							title: '支付成功',
							icon: 'success'
						});

						// 支付成功后保存价格明细
						await this.savePriceDetails(payParams.task_id);

						// 支付成功后跳转到订单详情页
						setTimeout(() => {
							uni.redirectTo({
								url: `/pages/order/detail?id=${payParams.task_id}`
							});
						}, 1500);
					},
					fail: (err) => {
						console.error('支付失败:', err);
						uni.hideLoading();

						// 支付失败，询问是否继续支付
						uni.showModal({
							title: '支付失败',
							content: '是否重新尝试支付？',
							success: (res) => {
								if (res.confirm) {
									// 用户点击确定，重新发起支付
									this.requestPayment(payParams);
								} else {
									// 用户点击取消，跳转到订单列表
									uni.redirectTo({
										url: '/pages/order/order'
									});
								}
							}
						});
					}
				});
			},

			/**
			 * 保存价格明细到云数据库
			 * @param {String} task_id 订单ID
			 */
			async savePriceDetails(task_id) {
				try {
					console.log('开始保存价格明细，订单ID:', task_id);
					
					// 获取用户信息
					const userInfo = uni.getStorageSync('userInfo');
					if (!userInfo || !userInfo.user_id) {
						console.error('未找到用户信息，无法保存价格明细');
						return;
					}

					// 准备基础信息
					const baseInfo = {
						item_number: parseInt(this.formData.quantity) || 0,
						distance: parseFloat(this.formData.distance) || 0,
						time_type: this.formData.timeType || '',
						time_limit: this.formData.timeType === 'before_deadline' 
							? parseInt(this.formData.appointmentTime) 
							: 0,
						// 附加服务数量信息
						cableQuantity: parseInt(this.formData.cableQuantity) || 0,
						powerQuantity: parseInt(this.formData.powerQuantity) || 0,
						exceptionQuantity: parseInt(this.formData.exceptionQuantity) || 0,
						badItemRecycleQuantity: parseInt(this.formData.badItemRecycleQuantity) || 0,
						powerCableQuantity: parseInt(this.formData.powerCableQuantity) || 0,
						// 优惠券信息
						coupon_id: this.formData.couponId || '',
						coupon_name: this.formData.coupon || '',
						coupon_type: 'discount' // 可根据实际情况调整
					};

					// 准备服务商价格配置快照（记录当时的价格配置，便于后续核对）
					const providerConfig = this.providerInfo?.prices ? {
						bubao_base_device: this.providerInfo.prices.bubao_base_device,
						bubao_base_device_fee: this.providerInfo.prices.bubao_base_device_fee,
						bubao_extra_device: this.providerInfo.prices.bubao_extra_device,
						bubao_extra_device_fee: this.providerInfo.prices.bubao_extra_device_fee,
						bubao_base_distance: this.providerInfo.prices.bubao_base_distance,
						bubao_base_distance_fee: this.providerInfo.prices.bubao_base_distance_fee,
						bubao_extra_distance: this.providerInfo.prices.bubao_extra_distance,
						bubao_extra_distance_fee: this.providerInfo.prices.bubao_extra_distance_fee,
						bubao_wire_base_device: this.providerInfo.prices.bubao_wire_base_device,
						bubao_wire_base_fee: this.providerInfo.prices.bubao_wire_base_fee,
						bubao_wire_device_fee: this.providerInfo.prices.bubao_wire_device_fee,
						bubao_wire_extra_device: this.providerInfo.prices.bubao_wire_extra_device,
						bubao_power_fee: this.providerInfo.prices.bubao_power_fee,
						bubao_power_base_device: this.providerInfo.prices.bubao_power_base_device,
						bubao_power_device_fee: this.providerInfo.prices.bubao_power_device_fee,
						bubao_exception_base_device: this.providerInfo.prices.bubao_exception_base_device,
						bubao_exception_base_fee: this.providerInfo.prices.bubao_exception_base_fee,
						bubao_exception_extra_device_fee: this.providerInfo.prices.bubao_exception_extra_device_fee,
						bubao_shoubao_base_device: this.providerInfo.prices.bubao_shoubao_base_device,
						bubao_shoubao_base_fee: this.providerInfo.prices.bubao_shoubao_base_fee,
						bubao_shoubao_extra_device_fee: this.providerInfo.prices.bubao_shoubao_extra_device_fee
					} : {};

					// 调用云函数保存价格明细
					const result = await uniCloud.callFunction({
						name: 'save-price-details',
						data: {
							task_id: task_id,
							user_id: userInfo.user_id,
							service_provider_id: this.providerInfo?.service_provider_id || '',
							task_type_id: this.taskTypeId || '',
							base_info: baseInfo,
							price_details: this.priceDetails,
							provider_config: providerConfig
						}
					});

					console.log('价格明细保存结果:', result);

					if (result.result && result.result.code === 200) {
						console.log('价格明细保存成功');
						// 如果是高价订单，可以在这里添加额外提示
						if (result.result.data.is_high_price) {
							console.log('这是一个高价订单，已保存详细价格明细');
						}
					} else {
						console.error('价格明细保存失败:', result.result?.message || '未知错误');
					}

				} catch (error) {
					console.error('保存价格明细异常:', error);
					// 即使保存失败也不影响主流程，只记录错误日志
				}
			},

			// 打赏确认回调
			handleRewardConfirm(amount) {
				console.log('用户选择打赏金额:', amount);
				// 可以在这里处理打赏逻辑
				uni.showToast({
					title: `已选择打赏¥${amount}`,
					icon: 'success'
				});
			},

			selectTimeType(type) {
				// 更新timeType
				this.formData.timeType = type;

				// 根据type显示对应的时间选择器
				if (type === 'before_deadline') {
					this.showAppointmentTimePicker();
				} else {
					this.showTimeIntervalPicker();
				}
			},
			showAppointmentTimePicker() {
				this.currentTimeType = 'before_deadline';
				this.showTimePicker = true;
			},
			showTimeIntervalPicker() {
				this.currentTimeType = 'time_range';
				this.showTimePicker = true;
			},
			// 处理时间选项选择事件（点击时间选项时触发）
			handleTimeSelect(e) {
				const { type, label, textShow, remark } = e;
				if (type === 'before_deadline') {
					// 保存上次选中的时间
					this.lastAppointmentTime = { value: label, label: textShow };
					this.lastTimeRemark = remark;
					// 更新表单数据
					this.formData.appointmentTime = label;
					this.formData.appointmentTimeText = textShow;
					this.formData.timeRemark = remark;
					// 更新显示文本
					this.beforeDeadlineTextShow = textShow;
					// 立即计算价格
					this.$nextTick(() => {
						this.calculatePrice();
					});
				}
			},
			// 处理时间选项选择事件（点击时间选项时触发）
			handleTimeOptionSelected(e) {
				const { type, label, textShow, remark } = e;
				if (type === 'before_deadline') {
					// 更新表单数据
					this.formData.appointmentTime = label;
					this.formData.appointmentTimeText = textShow;
					this.formData.timeRemark = remark;
					// 更新显示文本
					this.beforeDeadlineTextShow = textShow;
					// 立即计算价格
					this.$nextTick(() => {
						this.calculatePrice();
					});
				}
			},
			togglePriceDetail() {
				if (this.showPricePopup) {
					this.closePricePopup()
				} else {
					this.showPricePopup = true
					this.$refs.pricePopup.open()
				}
			},
			closePricePopup() {
				this.showPricePopup = false
				this.$refs.pricePopup.close()
			},
			onPricePopupChange(e) {
				this.showPricePopup = e.show
				console.log('弹窗状态：', e.show)
			},
			handleShowAgreement() {
				this.showAgreementPopup = true
				this.$refs.agreementPopup.open()
			},
			closeAgreementPopup() {
				this.showAgreementPopup = false
				this.$refs.agreementPopup.close()
			},
			onAgreementPopupChange(e) {
				this.showAgreementPopup = e.show
			},
			showCouponPicker() {
				uni.navigateTo({
					url: '/pages/index/publish/coupon/index?baseServiceFee=' + this.priceDetails.baseServiceFee.toFixed(2),
					fail: (err) => {
						console.error('页面跳转失败:', err)
						uni.showToast({
							title: '页面跳转失败',
							icon: 'none'
						})
					}
				})
			},

			// 订单备注输入事件
			onNotesInputFocus() {
				// 输入框获得焦点时的处理
			},

			onNotesInputBlur() {
				// 输入框失去焦点时的处理
			},

			onNotesInput(e) {
				// 输入内容变化时的处理
				this.formData.additional_notes = e.detail.value;
			},

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

			// 时间段选择变化
			onTimeRangeChange(e) {
				const values = e.detail.value;
				this.timeRangeIndex = values;

				const startHour = this.timeRangePickerData[0][values[0]];
				const startMinute = this.timeRangePickerData[1][values[1]];
				const endHour = this.timeRangePickerData[2][values[2]];
				const endMinute = this.timeRangePickerData[3][values[3]];

				// 如果选择了"24小时均可"
				if (startHour === '24小时均可' || endHour === '24小时均可') {
					this.formData.recommended_service_time_start = '00:00';
					this.formData.recommended_service_time_end = '00:00';
				} else {
					this.formData.recommended_service_time_start = `${startHour}:${startMinute}`;
					this.formData.recommended_service_time_end = `${endHour}:${endMinute}`;
				}
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
			// 获取打赏显示文本
			getTipDisplay() {
				if (this.formData.riderTip > 0) {
					return `¥${this.formData.riderTip.toFixed(2)}`;
				}
				return '选择打赏金额';
			},

			// 显示打赏弹窗
			openTipModal() {
				this.showTipModal = true;
				this.$refs.tipModal.open();
			},

			// 关闭打赏弹窗
			closeTipModal() {
				this.showTipModal = false;
				this.$refs.tipModal.close();
			},

			// 打赏弹窗状态变化
			onTipModalChange(e) {
				this.showTipModal = e.show;
			},

			// 选择打赏选项
			selectTipOption(option, amount) {
				this.selectedTipOption = option;
				if (amount === 'more') {
					this.selectedTipAmount = 'more';
					return;
				}
				if (amount > 0) {
					this.selectedTipAmount = amount;
				}
			},

			// 选择打赏金额
			selectTipAmount(amount) {
				this.selectedTipAmount = amount;
				if (amount === 'more') {
					// 显示自定义金额输入
					this.showCustomTipInput();
				}
			},

			// 确认打赏
			confirmTip() {
				if (this.selectedTipAmount === 'more') {
					// 显示自定义金额输入
					this.showCustomTipInput();
					return;
				}

				// 设置打赏金额
				this.formData.riderTip = this.selectedTipAmount || 0;

				// 重新计算价格
				this.calculatePrice();

				// 关闭弹窗
				this.closeTipModal();

			},
			// 显示打赏选择器
			showTipPicker() {
				const tipOptions = ['不打赏', '¥2.00', '¥5.00', '¥10.00', '¥20.00', '自定义金额'];
				uni.showActionSheet({
					itemList: tipOptions,
					success: (res) => {
						const selectedIndex = res.tapIndex;
						switch (selectedIndex) {
							case 0: // 不打赏
								this.formData.riderTip = 0;
								break;
							case 1: // ¥2.00
								this.formData.riderTip = 2;
								break;
							case 2: // ¥5.00
								this.formData.riderTip = 5;
								break;
							case 3: // ¥10.00
								this.formData.riderTip = 10;
								break;
							case 4: // ¥20.00
								this.formData.riderTip = 20;
								break;
							case 5: // 自定义金额
								this.showCustomTipInput();
								break;
						}
						// 重新计算价格
						this.calculatePrice();
					}
				});
			},
			// 显示自定义打赏金额输入
		showCustomTipInput() {
			uni.showModal({
				title: '自定义打赏金额',
				editable: true,
				placeholderText: '请输入打赏金额',
				success: (res) => {
					if (res.confirm && res.content) {
						const tipAmount = parseFloat(res.content);
						if (isNaN(tipAmount) || tipAmount < 0) {
							uni.showToast({
								title: '请输入有效的金额',
								icon: 'none'
							});
							return;
						}
						this.formData.riderTip = tipAmount;
						this.selectedTipAmount = tipAmount;
						// 重新计算价格
						this.calculatePrice();
						if (this.showTipModal) {
							this.closeTipModal();
						}
					}
				}
			});
		},
			showPriceAgreement() {
				uni.navigateTo({
					url: '/pages/index/price-agreement/index'
				})
			},
			// 显示价格疑问弹窗
			showPriceQuestionModal() {
				this.showPriceQuestionPopup = true
			},
			// 关闭价格疑问弹窗
			closePriceQuestionPopup() {
				this.showPriceQuestionPopup = false
			},

			// 关闭订单确认弹窗
			closeOrderConfirmPopup() {
				this.showOrderConfirmPopup = false;
				this.$refs.orderConfirmPopup.close();
			},

		// 订单确认弹窗状态变化
		onOrderConfirmPopupChange(e) {
			this.showOrderConfirmPopup = e.show;
		},

		// 选择骑手接单偏好
		selectPreferMember(type) {
			this.formData.prefer_member = type;
		},

		// 获取品牌名称
		getBrandName() {
				const brandMap = {
					'meituan': '美团',
					'guaishou': '怪兽',
					'jiedian': '街电搜电',
					'xiaodian': '小电'
				};
				return brandMap[this.selectedBrand] || '';
			},

			// 获取设备编码
			getDeviceCode() {
				// 从 formData.snMacList 中获取设备编码
				if (this.formData.snMacList && Array.isArray(this.formData.snMacList)) {
					const codes = this.formData.snMacList
						.filter(item => item && ((typeof item === 'string' && item.trim()) || (item.value && item.value.trim())))
						.map(item => typeof item === 'string' ? item.trim() : item.value.trim());
					if (codes.length > 0) {
						return codes.join(', ');
					}
				}
				return '未填写';
			},

			// 获取工作时段显示
			getWorkTimeDisplay() {
				if (this.formData.recommended_service_time_start && this.formData.recommended_service_time_end) {
					const today = new Date();
					const year = today.getFullYear();
					const month = String(today.getMonth() + 1).padStart(2, '0');
					const day = String(today.getDate()).padStart(2, '0');
					// 如果是24小时均可
					if (this.formData.recommended_service_time_start === '00:00' && this.formData.recommended_service_time_end === '00:00') {
						return `${year}-${month}-${day} 24小时均可`;
					}
					return `${year}-${month}-${day} ${this.formData.recommended_service_time_start}-${this.formData.recommended_service_time_end}`;
				}
				return '未选择';
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
			},
			// 跳转到登录页面
			goToLogin() {
				// 保存当前页面路径，以便登录后返回
				const currentPage = getCurrentPages();
				const currentRoute = currentPage[currentPage.length - 1].route;
				const currentParams = currentPage[currentPage.length - 1].options;

				// 构建完整的返回路径
				let returnPath = `/${currentRoute}`;
				if (currentParams && Object.keys(currentParams).length > 0) {
					const queryParams = [];
					for (const key in currentParams) {
						queryParams.push(`${key}=${currentParams[key]}`);
					}
					returnPath += `?${queryParams.join('&')}`;
				}

				// 将返回路径存储到本地，以便登录页面使用
				uni.setStorageSync('loginReturnPath', returnPath);

				// 跳转到登录页面
				uni.navigateTo({
					url: '/pages/login/index',
					fail: (err) => {
						console.error('跳转到登录页面失败:', err);
						uni.showToast({
							title: '页面跳转失败',
							icon: 'none'
						});
					}
				});
			},

			// 处理起点地址选择
			handleStartAddressSelect() {
				uni.navigateTo({
					url: '/pages/index/publish/map/index?type=start',
					fail: (err) => {
						console.error('页面跳转失败:', err);
						uni.showToast({
							title: '页面跳转失败',
							icon: 'none'
						});
					}
				});
			},
			// 处理终点地址选择
			handleEndAddressSelect() {
				uni.navigateTo({
					url: '/pages/index/publish/map/index?type=end',
					fail: (err) => {
						console.error('页面跳转失败:', err);
						uni.showToast({
							title: '页面跳转失败',
							icon: 'none'
						});
					}
				});
			},
			// 处理详细地址选择
			handleAddressSelect() {
				uni.navigateTo({
					url: '/pages/index/publish/map/index?type=address',
					success: (res) => {
						// 监听地址选择页面返回的数据
						uni.$on('addressSelected', (data) => {
							console.log('接收到的地址数据：', data);

					// 更新地址相关信息
					this.formData = {
						...this.formData,
						address: data.address || '',
						province: data.province || '',
						city: data.city || '',
						district: data.district || '',
						longitude: data.longitude || '',
						latitude: data.latitude || '',
						shop_poi: data.poiRemark || '' // 门店POI字段
					};

							// 移除事件监听，避免重复触发
							uni.$off('addressSelected');
						});
					},
					fail: (err) => {
						console.error('页面跳转失败:', err);
						uni.showToast({
							title: '页面跳转失败',
							icon: 'none'
						});
					}
				});
			},
			// 添加新的 SN/MAC 输入框
			addSnMacInput() {
				this.formData.snMacList.push('')
			},

			// 删除指定的 SN/MAC 输入框
			removeSnMacInput(index) {
				if (this.formData.snMacList.length > 1) {
					this.formData.snMacList.splice(index, 1)
				}
			},
			// 保存门店历史记录
			saveStoreHistory() {
				// 获取当前表单数据
				const record = {
					address: this.formData.address,
					detailAddress: this.formData.detailAddress,
					longitude: this.formData.longitude,
					latitude: this.formData.latitude,
					province: this.formData.province || '',
					city: this.formData.city || '',
					district: this.formData.district || '',
					storeName: this.formData.storeName,
					doorImages: this.formData.doorImages,
					snMacList: this.formData.snMacList || [],
					locationDesc: this.formData.locationDesc || '',
					createTime: new Date().getTime(),
					phone: this.formData.phone,
					contact: this.formData.contact,
					shop_poi: this.formData.shop_poi || '', // 新增POI字段
					device_outside: this.formData.device_outside || false, // 设备是否外摆
					recommended_service_time_start: this.formData.recommended_service_time_start || '', // 建议骑手上门开始时间
					recommended_service_time_end: this.formData.recommended_service_time_end || '', // 建议骑手上门结束时间
				}

				// 从本地存储获取现有记录
				let records = uni.getStorageSync('storeHistoryRecords') || []

				// 检查是否已存在相同门店名称的记录
				const existingIndex = records.findIndex(item => item.storeName === record.storeName)

				if (existingIndex !== -1) {
					// 如果存在，删除旧记录
					records.splice(existingIndex, 1)
				}

				// 添加新记录到开头
				records.unshift(record)

				// 限制记录数量为20条
				if (records.length > 20) {
					records = records.slice(0, 20)
				}

				// 保存到本地存储
				uni.setStorageSync('storeHistoryRecords', records)
				console.log('门店记录已保存:', record.storeName)
			},

			validateForm() {
				// 验证地址
				if (!this.formData.address) {
					uni.showToast({
						title: '请选择门店地址',
						icon: 'none'
					});
					return false;
				}

				// 验证品牌
				if (!this.selectedBrand) {
					uni.showToast({
						title: '请选择品牌',
						icon: 'none'
					});
					return false;
				}

				// 验证门店名称
				if (!this.formData.storeName) {
					uni.showToast({
						title: '请输入门店名称',
						icon: 'none'
					});
					return false;
				}

				// 验证联系电话
				if (!this.formData.phone) {
					uni.showToast({
						title: '请输入联系电话',
						icon: 'none'
					});
					return false;
				}

				// 验证SN/MAC码
				if (this.formData.snMacList.some(function (item) {
					return !item.value;
				})) {
					uni.showToast({
						title: '请填写所有SN/MAC码',
						icon: 'none'
					});
					return false;
				}

				// 验证门头照片
				// if (this.formData.doorImages.length === 0) {
				//     uni.showToast({
				//         title: '请上传门头照片',
				//         icon: 'none'
				//     });
				//     return false;
				// }

				// 验证服务时间
				if (this.formData.timeType === 'before_deadline' && !this.formData.appointmentTime) {
					uni.showToast({
						title: '请选择约定时间',
						icon: 'none'
					});
					return false;
				}

				if (this.formData.timeType === 'time_range' && !this.formData.timeInterval) {
					uni.showToast({
						title: '请选择时间区间',
						icon: 'none'
					});
					return false;
				}

				// 验证主服务项
				if (!this.selectedService) {
					uni.showToast({
						title: '请选择主服务项',
						icon: 'none'
					});
					return false;
				}

				// 验证数量
				const quantity = parseInt(this.formData.quantity);
				if (!this.formData.quantity || isNaN(quantity) || quantity < 1) {
					uni.showToast({
						title: '请填写补宝数量',
						icon: 'none'
					});
					return false;
				}

				// 如果选择了附加服务，验证其数量
				if (this.selectedAdditionalServices.includes('badItem') && this.formData.badItemQuantity < 1) {
					uni.showToast({
						title: '请选择取坏宝数量',
						icon: 'none'
					});
					return false;
				}

				if (this.selectedAdditionalServices.includes('wiring') && this.formData.wiringQuantity < 1) {
					uni.showToast({
						title: '请选择接电源线数量',
						icon: 'none'
					});
					return false;
				}

				if (this.selectedAdditionalServices.includes('powerCable') && this.formData.cableQuantity < 1) {
					uni.showToast({
						title: '请选择换/补电源线数量',
						icon: 'none'
					});
					return false;
				}

				// 验证建议骑手上门时间段（必填）
				if (!this.formData.recommended_service_time_start || !this.formData.recommended_service_time_end) {
					uni.showToast({
						title: '请选择建议骑手上门时间段',
						icon: 'none'
					});
					return false;
				}

				return true;
			},
			// 通电数量控制
			decreasePowerQuantity() {
				if (this.formData.powerQuantity > 0) {
					this.formData.powerQuantity--
					if (this.formData.powerQuantity === 0) {
						this.selectedAdditionalServices = this.selectedAdditionalServices.filter(s => s !== 'power')
					}
				}
				this.calculatePrice() // 更新价格
			},
			increasePowerQuantity() {
				this.formData.powerQuantity++
				if (this.formData.powerQuantity > 0 && !this.selectedAdditionalServices.includes('power')) {
					this.selectedAdditionalServices.push('power')
				}
				this.calculatePrice() // 更新价格
			},

			// 仓异常数量控制
			decreaseWarehouseQuantity() {
				if (this.formData.warehouseQuantity > 0) {
					this.formData.warehouseQuantity--
					// 当数量为0时，取消选中
					if (this.formData.warehouseQuantity === 0) {
						this.selectedAdditionalServices = this.selectedAdditionalServices.filter(s => s !== 'warehouse')
					}
				}
			},
			increaseWarehouseQuantity() {
				this.formData.warehouseQuantity++ 
				// 当数量大于0时，自动选中
				if (this.formData.warehouseQuantity > 0 && !this.selectedAdditionalServices.includes('warehouse')) {
					this.selectedAdditionalServices.push('warehouse')
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.shang-class{
		background-color: #1F91F1;
		padding: 3px;
		border-radius: 4px;
		margin-right: 5px;
	}
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		font-family: "HarmonyOS Sans SC", sans-serif;
	}

	.content {
		padding: 30rpx;
		position: relative;
		padding-bottom: 400rpx; /* 增加底部内边距,从180rpx改为240rpx */
	}

	.info-card {
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 20rpx 30rpx 30rpx 30rpx;
		margin-bottom: 20rpx;
	}

	.card-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
		position: relative;
		padding-left: 20rpx;

		&:before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 6rpx;
			height: 30rpx;
			background-color: #2492F2;
			border-radius: 3rpx;
		}
	}

	.form-item {
		margin-bottom: 20rpx;
	}

	.form-item:nth-child(2) {
		margin-bottom: 15rpx;
	}

	.form-label {
		display: flex;
		align-items: center;
		margin-top: 20px;
		margin-bottom: 20rpx;

		.dot {
			width: 10rpx;
			height: 10rpx;
			border-radius: 50%;
			background-color: #f00;
			margin-right: 10rpx;
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

		&.section-title {
			margin-bottom: 16rpx;

			text {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}

			.dot {
				width: 12rpx;
				height: 12rpx;
				background-color: #f00;
				margin-right: 12rpx;
			}
		}

		&.main-service-title {
			display: flex;
			align-items: center;

			.title-left {
				display: flex;
				align-items: center;
				margin-right: 10px;
			}

			.optional-tag-red {
				background: #FF0000;
				color: #FFFFFF;
				font-size: 20rpx;
				padding: 4rpx 12rpx;
				border-radius: 8rpx;
				font-weight: normal;
			}
		}

		&.additional-service-title {
			display: flex;
			// justify-content: space-between;
			align-items: center;

			.title-left {
				display: flex;
				align-items: center;
				margin-right: 10px;
			}

			.optional-tag-blue {
				background: #2492F2;
				color: #FFFFFF;
				font-size: 20rpx;
				padding: 4rpx 12rpx;
				border-radius: 8rpx;
				font-weight: normal;
			}
		}
	}

	.brand-list {
		display: flex;
		justify-content: space-between;
		padding: 30rpx 30rpx;
		border-radius: 8px;
		margin-bottom: 30rpx;
		&.two-brands {
			justify-content: flex-start;
			.brand-item {
				margin-right: 40rpx;
			}
			.brand-item:last-child {
				margin-right: 0;
			}
		}

		.brand-item {
			width: 120rpx;
			    height: 90rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			border: 2rpx solid transparent;
			border-radius: 8rpx;
			transition: all 0.3s ease;

			image {
				width: 80rpx;
				height: 80rpx;
				margin-bottom: 5rpx;
				border: 2rpx solid transparent;
				border-radius: 12rpx;
				padding: 6rpx;
				box-shadow: 0 0 0 0 transparent;
				transition: all 0.3s ease;
			}

			text {
				font-size: 22rpx;
				color: #333;
				margin-top: 4rpx;
				transition: all 0.3s ease;
				-webkit-font-smoothing: antialiased;
				-moz-osx-font-smoothing: grayscale;
			}

			&.meituan-active {
				transform: scale(1.15);

				image {
					border-color: #FFD100;
					box-shadow: 0 0 10rpx rgba(255, 209, 0, 0.3);
					width: 70rpx;
					height: 70rpx;
				}

				text {
					color: #FFD100;
					font-size: 28rpx;
					font-weight: 500;
				}
			}

			&.xiaoe-active {
				transform: scale(1.15);

				image {
					border-color: #0FB269;
					box-shadow: 0 0 10rpx rgba(15, 178, 105, 0.3);
					width: 70rpx;
					height: 70rpx;
				}

				text {
					color: #0FB269;
					font-size: 28rpx;
					font-weight: 500;
				}
			}

			&.didi-active {
				transform: scale(1.15);

				image {
					border-color: #16C2C2;
					box-shadow: 0 0 10rpx rgba(22, 194, 194, 0.3);
					width: 70rpx;
					height: 70rpx;
				}

				text {
					color: #16C2C2;
					font-size: 28rpx;
					font-weight: 500;
				}
			}

			&.jidian-active {
				transform: scale(1.15);

				image {
					border-color: #61CA87;
					box-shadow: 0 0 10rpx rgba(97, 202, 135, 0.3);
					width: 70rpx;
					height: 70rpx;
				}

				text {
					color: #61CA87;
					font-size: 28rpx;
					font-weight: 500;
				}
			}
		}
	}

	/* 主服务项样式 */
	.service-options {
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;

		.service-option {
			display: flex;
			align-items: center;
			padding: 10rpx 0;

		.option-circle {
			width: 36rpx;
			height: 36rpx;
			border: 2rpx solid #CCCCCC;
			margin-right: 20rpx;
			flex-shrink: 0;
			display: flex;
			align-items: center;
			justify-content: center;

				.inner-circle {
					width: 24rpx;
					height: 24rpx;
				}
			}

			text {
				font-size: 28rpx;
				color: #333;
			}
		}

		.service-option-active {
			.option-circle {
				border-color: #CCCCCC; /* 已经使用了内联样式，这里是默认值 */
			}

			text {
				font-weight: 500; /* 保留字体粗细 */
			}
		}
		
		.bubao-note {
			position: absolute;
			top: 26px;
			left: 56rpx;
			font-size: 20rpx !important;
			color: #FF6B6B !important;
			background-color: #FFF1F0;
			padding: 6rpx 10rpx;
			border-radius: 8rpx;
		}

		.quantity-selector {
			display: flex;
			align-items: center;

			text {
				font-size: 28rpx;
				color: #333;
				margin-left: 20rpx;
			}

			.quantity-controls {
				display: flex;
				align-items: center;

				.quantity-btn {
					width: 60rpx;
					height: 60rpx;
					border: 1rpx solid #EEEEEE;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 32rpx;
					color: #333;
					background-color: #F8F8F8;
				}

				.minus {
					border-radius: 8rpx 0 0 8rpx;
				}

				.plus {
					border-radius: 0 8rpx 8rpx 0;
				}

				.quantity-input {
					width: 80rpx;
					height: 60rpx;
					border-top: 1rpx solid #EEEEEE;
					border-bottom: 1rpx solid #EEEEEE;
					text-align: center;
					font-size: 28rpx;
					color: #333;
				}
			}
		}
	}

	.service-label {
		display: flex;
		align-items: center;
		justify-content: flex-start;

		.label-icon {
			width: 30rpx;
			height: 30rpx;
			margin-right: 10rpx;
			border-radius: 4rpx;
		}

		text {
			font-size: 32rpx;
			color: #333;
			font-weight: bold;
		}
	}

	.store-info {
		padding: 0;
	}

	.input-row {
		display: flex;
		align-items: center;
		border-bottom: 1rpx solid #eee;
		padding-bottom: 10rpx;
	}

	.label-container {
		display: flex;
		align-items: center;
		width: 180rpx;
		border-bottom: none;
		padding-bottom: 0;
		position: relative;

		.dot {
			width: 10rpx;
			height: 10rpx;
			border-radius: 50%;
			background-color: #f00;
			margin-right: 10rpx;
		}

		text {
			font-size: 28rpx;
			color: #333;
		}

		&::after {
			content: '';
			position: absolute;
			right: 10rpx;
			top: 50%;
			transform: translateY(-50%);
			height: 30rpx;
			width: 1rpx;
			background-color: #eee;
		}
	}

	.input-container {
		display: flex;
		align-items: center;
		border-bottom: none;
		padding-bottom: 0;

		&.horizontal {
			flex: 1;
			padding-left: 20rpx;
			justify-content: flex-end;
		}

		.input-wrapper {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: flex-end;
			width: 100%;
			position: relative;

			&.address-input-wrapper {
				.address-textarea {
					min-height: 60rpx;
					line-height: 1.3;
					// padding: 10rpx;
				}
			}

			.custom-input {
				flex: 1;
				height: 50rpx;
				font-size: 24rpx;
				color: #666666;
				text-align: right;
				background-color: transparent;
				z-index: 2;
			}

			.placeholder-box {
				position: absolute;
				top: 0;
				right: 0;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: flex-end;
				z-index: 1;
				pointer-events: none;

				.input-icon {
					width: 24rpx;
					height: 24rpx;
					margin-right: 8rpx;
				}

				.placeholder-text {
					color: #CCCCCC;
					font-size: 24rpx;
				}

				.location-icon {
					width: 32rpx;
					height: 32rpx;
					margin-left: 8rpx;
				}
			}
		}
	}

	.custom-placeholder {
		text-align: right;
		color: #CCCCCC;
		font-size: 24rpx;
	}

	.upload-container {
		.upload-list {
			display: flex;
			flex-wrap: wrap;
			gap: 20rpx;

			.upload-item {
				width: 130rpx;
				height: 130rpx;
				border-radius: 8rpx;
				position: relative;
				overflow: hidden;

				.preview-image {
					width: 100%;
					height: 100%;
					border-radius: 8rpx;
				}

				.delete-icon {
					position: absolute;
					top: 0;
					right: 0;
					width: 40rpx;
					height: 40rpx;
					background-color: rgba(0, 0, 0, 0.5);
					color: #fff;
					font-size: 30rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					border-bottom-left-radius: 8rpx;
				}
			}

			.upload-btn {
				width: 130rpx;
				height: 130rpx;
				background-color: #f8f8f8;
				border-radius: 8rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				border: 2rpx solid #D3D4D6;

				.upload-icon {
					width: 36rpx;
					height: 36rpx;
					margin-bottom: 8rpx;
				}

				.upload-text {
					font-size: 20rpx;
					color: #666;
					text-align: center;
				}
			}
		}
	}

	.textarea-container {
		textarea {
			width: 100%;
			height: 160rpx;
			background-color: #f8f8f8;
			border-radius: 8rpx;
			padding: 20rpx;
			font-size: 26rpx;
			box-sizing: border-box;
		}
	}

	.placeholder-text {
		font-size: 28rpx;
		color: #999;
		text-align: center;
		padding: 30rpx 0;
	}

	.submit-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #FFFFFF;
		padding: 12rpx 30rpx;
		padding-bottom: calc(12rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
		z-index: 100;

		.submit-content {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			max-width: 750rpx;
			margin: 0 auto;
			gap: 20rpx;
			padding: 0;
		}

		.price-section {
			display: flex;
			flex-direction: column;
			gap: 8rpx;

			.price-label {
				font-size: 28rpx;
				color: #666666;
			}

			.price-value {
				display: flex;
				align-items: baseline;
				gap: 4rpx;

				.currency {
					font-size: 32rpx;
					color: #FF4D4F;
					font-weight: 500;
				}

				.amount {
					font-size: 40rpx;
					color: #FF4D4F;
					font-weight: 600;
				}

				.arrow {
					font-size: 24rpx;
					color: #999999;
					margin-left: 8rpx;
					transition: transform 0.3s ease;

					&.arrow-up {
						transform: rotate(180deg);
					}
				}

				.price-question {
					margin-left: 16rpx;
					cursor: pointer;

					.question-text {
						font-size: 22rpx;
						color: #2492F2;
						text-decoration: underline;
						transition: color 0.3s ease;

						&:active {
							color: #1976D2;
						}
					}
				}
			}
		}



		.cart-btn {
			width: 190rpx;
			height: 60rpx;
			line-height: 60rpx;
			text-align: center;
			font-size: 26rpx;
			border-radius: 30rpx;
			border: 2rpx solid #2492F2;
			background: transparent;
			color: #2492F2;
			font-weight: 500;
			transition: all 0.3s ease;
			background-color: transparent !important;

			&:active {
				transform: translateY(2rpx);
				opacity: 0.9;
			}
		}

		.submit-btn {
			width: 180rpx;
			height: 60rpx;
			line-height: 60rpx;
			text-align: center;
			font-size: 26rpx;
			border-radius: 30rpx;
			border: none;
			font-weight: 500;
			transition: all 0.3s ease;
			background-color: #2492F2 !important;

			&:active {
				transform: translateY(2rpx);
				opacity: 0.9;
			}
		}
	}

	/* 为底部按钮预留空间 */
	.page-container {
		padding-bottom: calc(120rpx + constant(safe-area-inset-bottom)); /* iOS < 11.2 */
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom)); /* iOS >= 11.2 */
	}

	/* 表单内容区域 */
	.form-content {
		padding: 30rpx;
		padding-bottom: calc(140rpx + env(safe-area-inset-bottom)); /* 增加底部间距，避免被底部栏遮挡 */
	}

	/* 附加服务样式 */
	.additional-services {
		display: flex;
		flex-direction: column;

		.service-row {
			display: flex;
			justify-content: space-between;
			align-items: center;

			&:last-child {
				margin-bottom: 0;
			}

			.service-option {
				display: flex;
				align-items: center;
				padding: 10rpx 0;

				.option-circle {
					width: 36rpx;
					height: 36rpx;
					border-radius: 4rpx;
					border: 2rpx solid #CCCCCC;
					margin-right: 20rpx;
					display: flex;
					align-items: center;
					justify-content: center;

					.inner-circle {
						width: 24rpx;
						height: 24rpx;
						border-radius: 2rpx;
						display: flex;
						align-items: center;
						justify-content: center;

						.check-mark {
							color: white;
							font-size: 20rpx;
							font-weight: bold;
							line-height: 20rpx;
						}
					}
				}

				text {
					font-size: 28rpx;
					color: #333;
				}

				.service-label-container {
					display: flex;
					flex-direction: column;

					text {
						font-size: 28rpx;
						color: #333;
					}

					.service-note {
						font-size: 20rpx !important;
						color: #FF6B6B !important;
						background-color: #FFF1F0;
						padding: 6rpx 10rpx;
						border-radius: 8rpx;
						margin-top: 4rpx;
					}
				}
			}

			.quantity-selector {
				display: flex;
				align-items: center;

				text {
					font-size: 28rpx;
					color: #333;
					margin-left: 20rpx;
				}

				.unit-text {
					font-size: 28rpx;
					color: #333;
					margin-left: 20rpx;
				}

				.quantity-controls {
					display: flex;
					align-items: center;

					.quantity-btn {
						width: 60rpx;
						height: 60rpx;
						border: 1rpx solid #EEEEEE;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 32rpx;
						color: #333;
						background-color: #F8F8F8;
					}

					.minus {
						border-radius: 8rpx 0 0 8rpx;
					}

					.plus {
						border-radius: 0 8rpx 8rpx 0;
					}

					.quantity-input {
						width: 80rpx;
						height: 60rpx;
						border-top: 1rpx solid #EEEEEE;
						border-bottom: 1rpx solid #EEEEEE;
						text-align: center;
						font-size: 28rpx;
						color: #333;
					}
				}
			}
		}
	}

	.time-table {
		margin-bottom: 30rpx;

		.time-table-row {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			// padding: 24rpx 0;
			padding: 24rpx 0 56rpx 0;

			&:first-child {
				border-bottom: none;
			}

			&:last-child {
				border-bottom: 1rpx solid #eee;
			}

			.time-table-cell {
				position: relative;
				display: flex;
				align-items: flex-start;

				&.time-option {
					width: 45%;
					white-space: nowrap;
					flex-shrink: 0;

					.option-circle {
						width: 36rpx;
						height: 36rpx;
						border: 2rpx solid #CCCCCC;
						border-radius: 50%;
						margin-right: 20rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						flex-shrink: 0;

						.inner-circle {
							width: 24rpx;
							height: 24rpx;
							border-radius: 50%;
						}
					}

					.option-content {
						display: flex;
						flex-direction: column;

						text {
							font-size: 28rpx;
							color: #333;
							white-space: nowrap;
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
							// text-indent: 2em;
							display: block;
							background-color: #FFF1F0;
							padding: 6rpx 10rpx;
							border-radius: 8rpx;
							margin-top: 8rpx;
						}
					}
				}

				&.time-value {
					width: 55%;
					justify-content: flex-end;
					flex-shrink: 1;
					min-width: 0;
					padding-top: 4rpx;

					text {
						font-size: 24rpx;
						color: #666;
						margin-right: 6rpx;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.time-icon {
						width: 24rpx;
						height: 24rpx;
						flex-shrink: 0;
					}
				}
			}
		}
	}

	.coupon-section2 {
		margin-bottom: 0;

		.time-table-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 24rpx 0;
			border-bottom: 1rpx solid #eee;

			.time-table-cell {
				display: flex;
				align-items: center;

				&.time-option {
					width: 45%;

					text {
						font-size: 28rpx;
						color: #333;
					}
				}

				&.time-value {
					width: 55%;
					justify-content: flex-end;

					text {
						font-size: 28rpx;
						color: #333;
						margin-right: 10rpx;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.time-icon {
						width: 32rpx;
						height: 32rpx;
						flex-shrink: 0;
					}
				}
			}
		}
	}

	.coupon-section {
		margin-bottom: 0;

		.time-table-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 24rpx 0;
			border-bottom: 1rpx solid #eee;

			.time-table-cell {
				display: flex;
				align-items: center;

				&.time-option {
					width: 45%;

					text {
						font-size: 28rpx;
						color: #333;
					}
				}

				&.time-value {
					width: 55%;
					justify-content: flex-end;

					text {
						font-size: 28rpx;
						color: #333;
						margin-right: 10rpx;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.time-icon {
						width: 32rpx;
						height: 32rpx;
						flex-shrink: 0;
					}
				}
			}
		}
	}

	.price-section {
		margin-bottom: 30rpx;

		.price-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 0;
			border-bottom: 1rpx solid #eee;

			.price-label {
				font-size: 28rpx;
				color: #333;
			}

			.price-value {
				font-size: 32rpx;
				color: #f00;
				font-weight: bold;
			}
		}
	}

	/* 价格明细弹窗 */
	.price-detail {
		background-color: #FFFFFF;
		padding: 30rpx;
		border-radius: 24rpx 24rpx 0 0;
		position: relative;
		z-index: 100000;
		margin-bottom: 40rpx;
		padding-bottom: calc(40rpx + env(safe-area-inset-bottom)); /* 增加底部安全区域间距 */

		.detail-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;
			padding-bottom: 20rpx;
			border-bottom: 2rpx solid #EEEEEE;

			.title {
				font-size: 32rpx;
				color: #333333;
				font-weight: 500;
			}

			.close {
				font-size: 40rpx;
				color: #999999;
				padding: 10rpx;
				position: relative;
				z-index: 100001;
			}
		}

		.detail-content {
			position: relative;
			z-index: 100000;
			margin-bottom: 30rpx;

			.detail-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;

				.label {
					font-size: 28rpx;
					color: #666666;
				}

				.value {
					font-size: 28rpx;
					color: #333333;
					font-weight: 500;
				}

				&.total {
					margin-top: 20rpx;
					padding-top: 20rpx;
					border-top: 2rpx solid #EEEEEE;
					margin-bottom: 40rpx;

					.label {
						font-size: 28rpx;
						color: #333333;
						font-weight: 500;
					}

					.value-wrapper {
						display: flex;
						align-items: center;
						gap: 8rpx;

						.value {
							font-size: 32rpx;
							color: #FF4D4F;
							font-weight: 600;
						}

						.info-icon {
							width: 24rpx;
							height: 24rpx;
							line-height: 24rpx;
							text-align: center;
							background-color: #CCCCCC;
							color: #FFFFFF;
							border-radius: 50%;
							font-size: 20rpx;
							font-weight: bold;
							position: relative;
							z-index: 100001;
							cursor: pointer;
						}
					}
				}
			}
		}

		.detail-footer {
			padding-top: 20rpx;
			border-top: 2rpx solid #EEEEEE;

			.total-amount {
				display: flex;
				align-items: center;
				gap: 8rpx;

				text {
					font-size: 24rpx;
					color: #666666;
				}

				.amount {
					font-size: 28rpx;
					color: #FF4D4F;
					font-weight: 600;
				}

				.info-icon {
					width: 32rpx;
					height: 32rpx;
					line-height: 32rpx;
					text-align: center;
					background-color: #FF4D4F;
					color: #FFFFFF;
					border-radius: 50%;
					font-size: 24rpx;
					font-weight: bold;
				}
			}
		}
	}

	/* 价格协议弹窗 */
	.agreement-popup {
		width: 600rpx;
		background-color: #FFFFFF;
		border-radius: 24rpx;
		overflow: hidden;

		.agreement-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx;
			border-bottom: 2rpx solid #EEEEEE;

			.title {
				font-size: 32rpx;
				color: #333333;
				font-weight: 500;
			}

			.close {
				font-size: 40rpx;
				color: #999999;
				padding: 10rpx;
			}
		}

		.agreement-content {
			max-height: 800rpx;
			padding: 30rpx;
			padding-bottom: calc(30rpx + env(safe-area-inset-bottom)); /* 增加底部安全区域间距 */

			.agreement-text {
				display: flex;
				flex-direction: column;
				gap: 16rpx;

				.section-title {
					font-size: 30rpx;
					color: #333333;
					font-weight: 500;
					margin-top: 20rpx;

					&:first-child {
						margin-top: 0;
					}
				}

				.section-content {
					font-size: 28rpx;
					color: #666666;
					line-height: 1.5;
					padding-left: 20rpx;
				}
			}
		}
	}

	.address-section {
		background-color: #ffffff;
		margin-bottom: 20rpx;

		.address-item {
			display: flex;
			align-items: center;
			padding: 30rpx 20rpx;
			border-bottom: 1rpx solid #f5f5f5;

			&:last-child {
				border-bottom: none;
			}

			.address-label {
				width: 80rpx;
				font-size: 28rpx;
				color: #333333;
				font-weight: normal;
			}

			.address-content {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: space-between;

				.address-text {
					flex: 1;
					font-size: 32rpx;
					color: #666666;
				}

				.arrow {
					font-size: 32rpx;
					color: #999999;
				}
			}
		}
	}

	.address-label {
		border: none;
		// padding-bottom: 20rpx;
		// margin-bottom: 10rpx;

		&::after {
			display: none;
		}

		text {
			font-size: 28rpx;
			font-weight: normal;
		}
	}

	.divider {
		height: 20rpx;
		background-color: #F5F5F5;
		margin: 0 -30rpx;
	}

	.snmac-list {
		.snmac-item {
			margin-bottom: 20rpx;

			&:last-child {
				margin-bottom: 10rpx;
			}

			.input-row {
				border-bottom: 1rpx solid #eee;
				padding-bottom: 20rpx;
			}

			.input-container {
				display: flex;
				align-items: center;

				.input-wrapper {
					flex: 1;
					position: relative;

					.custom-input {
						width: 100%;
						height: 50rpx;
						font-size: 28rpx;
						color: #333;
						text-align: right; /* 修改为右对齐 */
						padding-right: 20rpx;
					}

					.placeholder-box {
						position: absolute;
						top: 50%;
						transform: translateY(-50%);
						right: 20rpx; /* 修改为右对齐 */
						left: auto; /* 取消左对齐 */
						display: flex;
						align-items: center;
						justify-content: flex-end; /* 内容右对齐 */
					}
				}

				.snmac-actions {
					display: flex;
					align-items: center;
					padding-left: 20rpx;

					.delete-btn {
						color: #FF4D4F;
						font-size: 28rpx;
						padding: 4rpx 12rpx;
						border-radius: 4rpx;
						background-color: #FFF1F0;
					}
				}
			}
		}

		.add-snmac {
			display: flex;
			align-items: center;
			padding: 20rpx 0;
			color: #2492F2;
			font-size: 28rpx;

			.add-icon {
				margin-right: 10rpx;
				font-size: 32rpx;
				font-weight: bold;
			}
		}
	}

	// 给骑手打赏样式
	.tip-section {
		background-color: #FFFFFF;
		margin-bottom: 30rpx;

		.time-table-row {
			display: flex;
			align-items: center;
			min-height: 88rpx;
			padding: 0 0 36rpx 0;
		}

		.time-option {
			display: flex;
			align-items: center;

			text {
				font-size: 28rpx;
				color: #333;
			}

			.optional-tag {
				background: linear-gradient(135deg, #2492F2, #1890FF);
				color: #FFFFFF;
				font-size: 18rpx;
				padding: 2rpx 8rpx;
				border-radius: 8rpx;
				font-weight: 500;
				margin-left: 12rpx;
			}

			.required-label {
				position: relative;
				display: flex;
				align-items: center;

				.required-dot {
					width: 8rpx;
					height: 8rpx;
					border-radius: 50%;
					background-color: #FF4D4F;
					margin-right: 8rpx;
					flex-shrink: 0;
				}

				text {
					font-size: 28rpx;
					color: #333;
				}
			}
		}

		.time-value {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			flex: 1;
		}

		.tip-picker-wrapper {
			display: flex;
			align-items: center;
			justify-content: flex-end;

			.tip-display {
				font-size: 26rpx;
				color: #666666;
				margin-right: 12rpx;

				&:empty::before {
					content: '选择打赏金额';
					color: #CCCCCC;
				}
			}

			.time-arrow {
				width: 24rpx;
				height: 24rpx;
				opacity: 0.6;
			}
		}

		.divider-line {
			height: 1rpx;
			background-color: #F0F0F0;
			margin: 0 0rpx;
		}
	}

	// 订单备注样式
	.notes-section {
		background-color: #FFFFFF;
		margin-bottom: 30rpx;

		.time-option {
			display: flex;
			align-items: center;

			text {
				font-size: 28rpx;
				color: #333;
			}

			.optional-tag {
				background: linear-gradient(135deg, #2492F2, #1890FF);
				color: #FFFFFF;
				font-size: 18rpx;
				padding: 2rpx 8rpx;
				border-radius: 8rpx;
				font-weight: 500;
				margin-left: 12rpx;
			}
		}

		.notes-input {
			padding: 0 !important;
		}

		.notes-input-container {
			position: relative;
			margin-top: 20rpx;
			padding: 0 0rpx;

			.textarea-wrapper {
				position: relative;

				.notes-textarea {
					width: 100%;
					min-height: 160rpx;
					max-height: 320rpx;
					font-size: 22rpx;
					color: #333333;
					line-height: 1.6;
					padding: 24rpx 30rpx;
					padding-bottom: 60rpx;
					border: 2rpx solid #E8F4FD;
					border-radius: 16rpx;
					background-color: #FAFCFF;
					resize: none;
					box-sizing: border-box;
					transition: all 0.3s ease;

					&:focus {
						border-color: #2492F2;
						background-color: #FFFFFF;
						box-shadow: 0 0 0 4rpx rgba(36, 146, 242, 0.1);
					}
				}

				.char-count-inner {
					position: absolute;
					bottom: 16rpx;
					right: 24rpx;
					background-color: rgba(255, 255, 255, 0.9);
					padding: 4rpx 12rpx;
					border-radius: 12rpx;
					backdrop-filter: blur(4rpx);

					.count-text {
						font-size: 20rpx;
						color: #999999;
					}
				}
			}
		}
	}

	// 建议骑手上门时间段样式
	.time-range-section {
		background-color: #FFFFFF;
		margin-bottom: 30rpx;

		.time-table-row {
			display: flex;
			align-items: center;
			min-height: 88rpx;
			padding: 0 0 36rpx 0;
		}

		.time-option {
			display: flex;
			align-items: center;

			text {
				font-size: 28rpx;
				color: #333;
			}

			.optional-tag {
				background: linear-gradient(135deg, #2492F2, #1890FF);
				color: #FFFFFF;
				font-size: 18rpx;
				padding: 2rpx 8rpx;
				border-radius: 8rpx;
				font-weight: 500;
				margin-left: 12rpx;
			}

			.required-tag {
				background: linear-gradient(135deg, #FF4D4F, #FF7875);
				color: #FFFFFF;
				font-size: 18rpx;
				padding: 2rpx 8rpx;
				border-radius: 8rpx;
				font-weight: 500;
				margin-left: 12rpx;
			}

			.required-label {
				position: relative;
				display: flex;
				align-items: center;
				
				.time-note{
					position: absolute;
					top: 22px;
					left: 0px;
					font-size: 20rpx;
					color: #FF4D4F;
					margin-top: 4rpx;
					white-space: nowrap;
					line-height: 1.3;
					// text-indent: 2em;
					display: block;
					background-color: #FFF1F0;
					padding: 6rpx 10rpx;
					border-radius: 8rpx;
					margin-top: 8rpx;
				}
				
				.time-note-2{
					position: absolute;
					top: 26px;
					left: 0px;
					font-size: 20rpx;
					color: #FF4D4F;
					margin-top: 4rpx;
					white-space: nowrap;
					line-height: 1.3;
					// text-indent: 2em;
					display: block;
					background-color: #FFF1F0;
					padding: 6rpx 10rpx;
					border-radius: 8rpx;
					margin-top: 8rpx;
				}

				.required-dot {
					width: 8rpx;
					height: 8rpx;
					border-radius: 50%;
					background-color: #FF4D4F;
					margin-right: 8rpx;
					flex-shrink: 0;
				}

				text {
					font-size: 28rpx;
					color: #333;
				}
			}
		}

		.time-value {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			flex: 1;
		}

		.time-picker-wrapper {
			display: flex;
			align-items: center;
			justify-content: flex-end;

			.time-display {
				font-size: 26rpx;
				color: #666666;
				margin-right: 12rpx;

				&:empty::before {
					content: '请选择时间段';
					color: #CCCCCC;
				}
			}

			.time-arrow {
				width: 24rpx;
				height: 24rpx;
				opacity: 0.6;
			}
		}

		.divider-line {
			height: 1rpx;
			background-color: #F0F0F0;
			margin: 0 0rpx;
		}
	}

	.coupon-reminder2 {
		padding: 10rpx;
		background-color: #FFF1F0;
		border-radius: 8rpx;
		display: inline-block;
		width: fit-content;

		.reminder-text {
			font-size: 20rpx;
			color: #FF4D4F;
			line-height: 1.3; /* 减小行间距 */
			display: block; /* 确保文本缩进生效 */
		}
	}

	.coupon-reminder {
		padding: 10rpx;
		background-color: #FFF1F0;
		border-radius: 8rpx;

		.reminder-text {
			font-size: 20rpx;
			color: #FF4D4F;
			line-height: 1.3; /* 减小行间距 */
			text-indent: 2em; /* 添加首行缩进 */
			display: block; /* 确保文本缩进生效 */
		}
	}

	.power-cable-note {
		color: #FF4D4F !important;
		background-color: #FFF1F0 !important;
		font-size: 20rpx !important;
		margin-top: 0 !important;
		margin-bottom: 12rpx !important;
		padding: 6rpx 10rpx !important;
		border-radius: 8rpx !important;
		display: block;
		line-height: 1.3;
		text-align: left;
	}
	.indent-left {
		margin-left: 56rpx !important; /* 与选项卡左对齐，等于.option-circle+间距 */
	}
	.power-cable-row {
		position: relative;
	}
	.power-cable-note.abs-note {
		position: absolute;
		left: 56rpx;
		top: 100%;
		margin-top: 2rpx;
		z-index: 2;
		display: inline-block;
		width: auto;
		min-width: 0;
		max-width: 80vw;
		background: #FFF1F0 !important;
		color: #FF4D4F !important;
		font-size: 20rpx !important;
		padding: 2rpx 10rpx !important;
		border-radius: 8rpx !important;
		line-height: 1.3;
		text-align: left;
		white-space: nowrap;
		box-shadow: 0 2rpx 8rpx rgba(255,77,79,0.04);
	}

	.price-tip {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 10rpx;
		margin-bottom: 10rpx;
		color: #999;
		font-size: 24rpx;
		text-align: center;
		.tip-icon {
			margin-right: 8rpx;
			font-size: 26rpx;
		}
		.tip-text {
			color: #999;
			font-size: 24rpx;
		}
	}

	/* 底部安全区域 */
	.safe-area-bottom {
		height: calc(20rpx + env(safe-area-inset-bottom));
		min-height: 20rpx;
	}

	/* 时间段选择弹窗样式 */
	.time-range-popup {
		background: #FFFFFF;
		border-radius: 20rpx 20rpx 0 0;
		padding: 0;
		max-height: 80vh;
		position: relative;
		z-index: 999999;

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
			z-index: 999999;

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

	/* 强制设置订单备注占位符样式 - 使用深度选择器 */
	::v-deep .notes-textarea::placeholder {
		color: #CCCCCC !important;
		font-size: 20rpx !important;
	}

	::v-deep .notes-textarea::-webkit-input-placeholder {
		color: #CCCCCC !important;
		font-size: 20rpx !important;
	}

	::v-deep .notes-textarea::-moz-placeholder {
		color: #CCCCCC !important;
		font-size: 20rpx !important;
	}

	::v-deep .notes-textarea:-ms-input-placeholder {
		color: #CCCCCC !important;
		font-size: 20rpx !important;
	}

</style>

<style>
	/* 全局样式 - 强制设置订单备注占位符字体大小 */
	.notes-textarea::placeholder {
		font-size: 20rpx !important;
		color: #CCCCCC !important;
	}

	.notes-textarea::-webkit-input-placeholder {
		font-size: 20rpx !important;
		color: #CCCCCC !important;
	}

	.notes-textarea::-moz-placeholder {
		font-size: 20rpx !important;
		color: #CCCCCC !important;
	}

	/* 透明蒙版样式 */
	.area-selection-mask {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		background-color: transparent;
		/* 可选：添加轻微的背景色提示用户需要选择区域 */
		/* background-color: rgba(0, 0, 0, 0.01); */
	}

	.notes-textarea:-ms-input-placeholder {
		font-size: 20rpx !important;
		color: #CCCCCC !important;
	}

	/* 确保时间段弹窗在最上层 */
	::v-deep .uni-popup {
		z-index: 999999 !important;
	}

	::v-deep .uni-popup__wrapper {
		z-index: 999999 !important;
	}

	::v-deep .uni-popup-bottom {
		z-index: 999999 !important;
	}

	/* 订单确认弹窗样式 */
	.order-confirm-popup {
		width: 600rpx;
		background: transparent;
		border-radius: 20rpx;
		padding: 0;
		position: relative;
		overflow: hidden;
	}

	.confirm-header {
		position: relative;
		height: 180rpx;
		overflow: hidden;
	}

	.confirm-header-bg {
		width: 100%;
		height: 100%;
	}

	.confirm-content {
		padding: 20rpx;
		max-height: 800rpx;
		overflow-y: auto;
		background: #ffffff;
	}

	.confirm-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12rpx 0;
	}


	.confirm-label {
		color: #666666;
		font-size: 26rpx;
		flex-shrink: 0;
		width: 120rpx;
	}

	.confirm-value {
		color: #333333;
		font-size: 26rpx;
		text-align: right;
		flex: 1;
		word-break: break-all;
	}

	.brand-value {
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.brand-icon {
		width: 40rpx;
		height: 40rpx;
		margin-right: 10rpx;
	}

	.brand-text {
		color: #333333;
		font-size: 28rpx;
	}

	.confirm-footer {
		display: flex;
		padding: 20rpx;
		gap: 20rpx;
		border-top: 1rpx solid #f0f0f0;
		background: #ffffff;
		border-radius: 0 0 20rpx 20rpx;
	}

	.cancel-btn {
		flex: 1;
		height: 70rpx;
		line-height: 70rpx;
		background: linear-gradient(135deg, #4A9FFF 0%, #2E86FF 100%);
		color: #ffffff;
		border: none;
		border-radius: 35rpx;
		font-size: 28rpx;
		text-align: center;
		font-weight: bold;
	}

	.cancel-btn:active {
		background: linear-gradient(135deg, #2E86FF 0%, #1976D2 100%);
		opacity: 0.9;
	}

	.cart-btn {
		width: 190rpx;
		height: 60rpx;
		line-height: 60rpx;
		background: transparent;
		color: #2492F2;
		border: 2rpx solid #2492F2;
		border-radius: 30rpx;
		font-size: 26rpx;
		text-align: center;
		font-weight: bold;
	}

	.cart-btn:active {
		background: rgba(36, 146, 242, 0.1);
		opacity: 0.9;
	}

	.confirm-btn {
		flex: 1;
		height: 70rpx;
		line-height: 70rpx;
		background: linear-gradient(135deg, #FF7F47 0%, #FF6B2B 100%);
		color: #ffffff;
		border: none;
		border-radius: 35rpx;
		font-size: 28rpx;
		text-align: center;
		font-weight: bold;
	}

	.confirm-btn:active {
		background: linear-gradient(135deg, #FF6B2B 0%, #FF5722 100%);
		opacity: 0.9;
	}

	/* 服务信息块样式 */
	.service-info-block {
		background: #F0F8FF;
		border-radius: 12rpx;
		padding: 15rpx;
		margin-bottom: 12rpx;
		position: relative;
		overflow: hidden;
	}

	/* .service-info-block::after {
		content: '';
		position: absolute;
		right: 0;
		bottom: 0;
		width: 80rpx;
		height: 80rpx;
		background-image: url('https://ccpt.qiniu.0871.cn/home/di1.svg');
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
		opacity: 0.6;
	} */
	
	.imgcc1::after{
		content: '';
		position: absolute;
		right: 0;
		bottom: 0;
		width: 80rpx;
		height: 80rpx;
		background-image: url('https://ccpt.qiniu.0871.cn/home/di1.svg');
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
		opacity: 0.6;
	}
	
	.imgcc2::after{
		content: '';
		position: absolute;
		right: 0;
		bottom: 0;
		width: 80rpx;
		height: 80rpx;
		background-image: url('https://ccpt.qiniu.0871.cn/home/di1.svg');
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
		opacity: 0.6;
	}
	
	.imgcc3::after{
		content: '';
		position: absolute;
		right: 0;
		bottom: 0;
		width: 80rpx;
		height: 80rpx;
		background-image: url('https://ccpt.qiniu.0871.cn/home/di1.svg');
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
		opacity: 0.6;
	}
	
	.imgcc4::after{
		content: '';
		position: absolute;
		right: 0;
		bottom: 0;
		width: 80rpx;
		height: 80rpx;
		background-image: url('https://ccpt.qiniu.0871.cn/home/di1.svg');
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
		opacity: 0.6;
	}
	
	.imgcc5::after{
		content: '';
		position: absolute;
		right: 0;
		bottom: 0;
		width: 80rpx;
		height: 80rpx;
		background-image: url('https://ccpt.qiniu.0871.cn/home/di1.svg');
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
		opacity: 0.6;
	}

	.service-info-block .confirm-item {
	}

	/* 骑手接单偏好样式 */
	.prefer-member-section {
		display: flex;
		flex-direction: column;
		gap: 15rpx;
	}

	.prefer-member-title {
		font-size: 26rpx;
		color: #666666;
		font-weight: bold;
		margin-bottom: 5rpx;
	}

	.prefer-member-options {
		display: flex;
		flex-direction: column;
		gap: 15rpx;
	}

	.prefer-option {
		display: flex;
		align-items: center;
		padding: 15rpx;
		background: #FFFFFF;
		border: 2rpx solid #E0E0E0;
		border-radius: 8rpx;
		transition: all 0.3s;
		position: relative;
		z-index: 1;
	}

	.prefer-option-active {
		border-color: #FF7F47;
		background: rgba(255, 127, 71, 0.05);
	}

	.option-radio {
		width: 36rpx;
		height: 36rpx;
		border: 2rpx solid #E0E0E0;
		border-radius: 50%;
		margin-right: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.3s;
	}

	.prefer-option-active .option-radio {
		border-color: #FF7F47;
	}

	.radio-inner {
		width: 20rpx;
		height: 20rpx;
		background: #FF7F47;
		border-radius: 50%;
	}

	.option-text {
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
	}


	/* 服务信息块内的特殊样式 */
	.service-item {
		flex-direction: row-reverse;
	}

	.service-value {
		text-align: left !important;
		color: #ff4444 !important;
		font-weight: bold;
	}

	.service-label {
		color: #666666 !important;
		text-align: right;
	}

	/* 门店信息块样式 */
	.store-info-block {
		background: #F0F8FF;
		border-radius: 12rpx;
		padding: 15rpx;
		margin-bottom: 12rpx;
		position: relative;
		overflow: hidden;
	}

	.store-info-block::after {
		content: '';
		position: absolute;
		right: 0;
		bottom: 0;
		width: 80rpx;
		height: 80rpx;
		background-image: url('https://ccpt.qiniu.0871.cn/home/di2.svg');
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
		opacity: 0.6;
	}

	.store-info-block .confirm-item {
	}


	/* 门店信息块内的特殊样式 */
	.store-item {
		flex-direction: row-reverse;
	}

	/* 门店地址和POI需要特殊处理，使用正常的flex方向 */
	.store-item:nth-child(2), .store-item:nth-child(3) {
		flex-direction: row !important;
	}

	.store-item:nth-child(2) .confirm-value, .store-item:nth-child(3) .confirm-value {
		text-align: left !important;
		justify-content: flex-start !important;
		order: 2;
	}

	.store-item:nth-child(2) .confirm-label, .store-item:nth-child(3) .confirm-label {
		order: 1;
		text-align: left !important;
		margin-right: auto;
	}

	.confirm-value.store-value {
		text-align: left !important;
		color: #616161 !important;
		font-weight: bold;
	}

	.store-label {
		color: #666666 !important;
		text-align: right;
	}

	/* 强制门店信息左对齐 */
	.confirm-item .confirm-value.store-value {
		text-align: left !important;
		display: flex !important;
		justify-content: flex-start !important;
	}

	/* 针对service-item中的门店信息强制左对齐 */
	.service-item .confirm-value.store-value {
		text-align: left !important;
		justify-content: flex-start !important;
		display: flex !important;
	}

	/* 专门针对门店地址和POI的样式覆盖 */
	.store-item .confirm-value.store-value {
		text-align: left !important;
		justify-content: flex-start !important;
		display: flex !important;
		align-items: flex-start !important;
	}

	/* 左对齐的确认项样式 */
	.confirm-item-left {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		padding: 12rpx 0;
	}


	.confirm-item-left .confirm-label {
		color: #666666;
		font-size: 26rpx;
		width: 120rpx;
		flex-shrink: 0;
		text-align: left;
	}

	.confirm-value-left {
		color: #616161;
		font-size: 26rpx;
		font-weight: bold;
		text-align: left;
		flex: 1;
		word-break: break-all;
	}

	/* 骑手打赏弹窗样式 */
	.tip-modal {
		width: 100%;
		box-sizing: border-box;
		padding: 80rpx 32rpx calc(80rpx + env(safe-area-inset-bottom));
		border-radius: 40rpx 40rpx 0 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 36rpx;
		position: relative;
		overflow: visible;
	}

	.tip-modal::before {
		content: '';
		position: absolute;
		top: 260rpx;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 40rpx 40rpx 0 0;
		background: linear-gradient(180deg, #0aa9ff 0%, #0b4dff 100%);
		z-index: -1;
		pointer-events: none;
	}

	.tip-close {
		position: absolute;
		top: 40rpx;
		right: 46rpx;
		width: 56rpx;
		height: 56rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.95);
		box-shadow: 0 12rpx 26rpx rgba(9, 78, 189, 0.18);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 34rpx;
		color: #5f7198;
		z-index: 4;
	}

	.tip-banner {
		width: calc(100% + 64rpx);
		margin: 0 -32rpx;
		display: block;
		border-radius: 0;
		box-shadow: none;
	}

	.tip-panel {
		width: 100%;
		background: #FFFFFF;
		border-radius: 36rpx;
		padding: 8rpx 18rpx 44rpx 18rpx;
		box-shadow: 0 30rpx 70rpx rgba(11, 82, 189, 0.22);
		margin-top: -24rpx;
	}

	.tip-options {
		display: flex;
		justify-content: space-between;
		gap: 20rpx;
	}

	.tip-option {
		flex: none;
		width: 130rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 28rpx 12rpx 32rpx;
		border-radius: 28rpx;
		background: #FFFFFF;
		box-shadow: 0 14rpx 28rpx rgba(22, 102, 212, 0.12);
		transition: all 0.25s ease;
	}

	.tip-option.active {
		transform: translateY(-6rpx);
		box-shadow: 0 28rpx 38rpx rgba(15, 110, 240, 0.24);
	}

	.option-icon-wrap {
		width: 116rpx;
		height: 116rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #66d0ff 0%, #2588ff 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 18rpx;
		box-shadow: 0 16rpx 28rpx rgba(13, 90, 210, 0.2);
	}

	.tip-option.active .option-icon-wrap {
		box-shadow: 0 20rpx 34rpx rgba(15, 110, 240, 0.28);
	}

	.option-icon {
		width: 86rpx;
		height: 86rpx;
	}

	.option-title {
		font-size: 26rpx;
		color: #1f3360;
		font-weight: 600;
		margin-bottom: 10rpx;
	}

	.tip-option.active .option-title {
		color: #0f49f6;
	}

	.option-amount {
		margin-top: 32rpx;
		width: 140rpx;
		min-height: 98rpx;
		padding: 16rpx 0 12rpx;
		border-radius: 28rpx;
		border: 2rpx solid #2a7fff;
		background: #FFFFFF;
		color: #276efc;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		line-height: 1.2;
		position: relative;
	}

	.option-amount .amount-label {
		color: #BFBFBF;
		font-size: 22rpx;
		margin-bottom: 8rpx;
	}

	.option-amount .amount-value {
		font-size: 30rpx;
		font-weight: 700;
	}

	.option-amount.active {
		background: linear-gradient(180deg, #52d4ff 0%, #0f66ff 100%);
		color: #FFFFFF;
		border: none;
		box-shadow: 0 18rpx 32rpx rgba(15, 110, 240, 0.28);
	}

	.option-amount.active::before {
		content: '';
		position: absolute;
		top: -22rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 18rpx solid transparent;
		border-right: 18rpx solid transparent;
		border-bottom: 22rpx solid #52d4ff;
	}

	.option-amount.active .amount-label,
	.option-amount.active .amount-value {
		color: #FFFFFF;
	}

	.tip-footer {
		width: 100%;
		margin-top: 8rpx;
	}

	.confirm-tip-btn {
		width: 100%;
		height: 96rpx;
		background: linear-gradient(135deg, #ff8b2f 0%, #ff4b47 100%);
		color: #FFFFFF;
		font-size: 32rpx;
		font-weight: 700;
		border-radius: 48rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 20rpx 32rpx rgba(255, 110, 64, 0.32);
		transition: all 0.25s ease;
	}

	.confirm-tip-btn:active {
		opacity: 0.9;
		transform: translateY(2rpx);
		box-shadow: 0 12rpx 26rpx rgba(255, 110, 64, 0.24);
	}
</style>
