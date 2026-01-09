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


		<!-- 服务门店信息-->
		<view class="mar-top-10">
			<store-info
				:formData.sync="formData"
				@address-select="handleAddressSelect"
				@remove-sn-mac="removeSnMacInput"
				@add-sn-mac="addSnMacInput"
				@delete-image="deleteImage"
				@upload-image="uploadImage"
			/>
		</view>

		<!-- 服务品牌 - 独立卡片 -->
		<view class="info-card">
			<view class="form-label section-title main-service-title">
				<view class="title-left">
					<text class="dot"></text>
					<text>服务品牌</text>
				</view>
			</view>
			<view class="brand-list" :class="{ 'two-brands': availableBrands.length === 2 }" style="background: rgba(247, 247, 247, 1);">
				<view class="brand-item" v-if="providerInfo.meituan" :class="{ active: selectedBrand === 'meituan', 'meituan-active': selectedBrand === 'meituan' }" @click="selectBrand('meituan')">
					<image src="https://ccpt.qiniu.0871.cn/publish/meituan.png" mode="aspectFit"></image>
					<text>美团</text>
				</view>
				<view class="brand-item" v-if="providerInfo.guaishou" :class="{ active: selectedBrand === 'guaishou', 'didi-active': selectedBrand === 'guaishou' }" @click="selectBrand('guaishou')">
					<image src="https://ccpt.qiniu.0871.cn/publish/guaishou.png" mode="aspectFit"></image>
					<text>怪兽</text>
				</view>
				<view class="brand-item" v-if="providerInfo.jiedian" :class="{ active: selectedBrand === 'jiedian', 'jidian-active': selectedBrand === 'jiedian' }" @click="selectBrand('jiedian')">
					<image src="https://ccpt.qiniu.0871.cn/zhumang.png" mode="aspectFit"></image>
					<text>街电搜电</text>
				</view>
				<view class="brand-item" v-if="providerInfo.xiaodian" :class="{ active: selectedBrand === 'xiaodian', 'xiaoe-active': selectedBrand === 'xiaodian' }" @click="selectBrand('xiaodian')">
					<image src="https://ccpt.qiniu.0871.cn/publish/xiaodian.png" mode="aspectFit"></image>
					<text>小电</text>
				</view>
			</view>
		</view>

		<view class="info-card">
				<view class="form-item">
					<view class="form-label section-title main-service-title">
					<view class="title-left">
						<text class="dot"></text>
						<text>主项服务</text>
					</view>
				</view>
					<view class="service-options">
						<!-- 离线异常选项 -->
						<view class="service-option" :class="{'service-option-active': selectedService === 'offline_abnormal'}" @click="selectService('offline_abnormal')">
							<view class="option-circle" :style="{'border-color': '#2492F2', 'border-radius': '50%'}">
								<view v-if="selectedService === 'offline_abnormal'" class="inner-circle" :style="{'background-color': '#2492F2', 'border-radius': '50%'}"></view>
							</view>
							<view class="service-text">
								<text :style="{'color': selectedService === 'offline_abnormal' ? '#2492F2' : '#333333'}">离线异常</text>
								<text class="service-desc">仅处理线头脱落复插</text>
							</view>
							<!-- 数量选择器 -->
							<view class="quantity-selector">
								<view class="quantity-controls">
									<view class="quantity-btn minus" @click.stop="decreaseOfflineQuantity" :class="{ 'disabled': formData.offlineQuantity <= 1 }">-</view>
									<input
										type="number"
										v-model="formData.offlineQuantity"
										class="quantity-input"
										@input="handleOfflineQuantityInput"
										@click.stop
									/>
									<view class="quantity-btn plus" @click.stop="increaseOfflineQuantity">+</view>
								</view>
								<text class="unit-text">台</text>
							</view>
						</view>
						<view class="service-option" :class="{'service-option-active': selectedService === '补加电源线'}" @click="selectService('补加电源线')">
							<view class="option-circle" :style="{'border-color': '#2492F2', 'border-radius': '50%'}">
								<view v-if="selectedService === '补加电源线'" class="inner-circle" :style="{'background-color': '#2492F2', 'border-radius': '50%'}"></view>
							</view>
							<view class="service-text">
								<text :style="{'color': selectedService === '补加电源线' ? '#2492F2' : '#333333'}">补加电源线</text>
								<text class="service-desc">补/接电源线</text>
							</view>
							<!-- 数量选择器 -->
							<view class="quantity-selector">
								<view class="quantity-controls">
									<view class="quantity-btn minus" @click.stop="formData.bjdyx_num > 1 ? formData.bjdyx_num-- : formData.bjdyx_num = 1; calculatePrice()" :class="{ 'disabled': formData.bjdyx_num <= 1 }">-</view>
									<input
										type="number"
										v-model="formData.bjdyx_num"
										class="quantity-input"
										@input="calculatePrice()"
										@click.stop
									/>
									<view class="quantity-btn plus" @click.stop="formData.bjdyx_num++; calculatePrice()">+</view>
								</view>
								<text class="unit-text">台</text>
							</view>
						</view>

						<!-- 收益异常选项 -->
						<view class="service-option" :class="{'service-option-active': selectedService === 'income_abnormal'}" @click="selectService('income_abnormal')">
							<view class="option-circle" :style="{'border-color': '#2492F2', 'border-radius': '50%'}">
								<view v-if="selectedService === 'income_abnormal'" class="inner-circle" :style="{'background-color': '#2492F2', 'border-radius': '50%'}"></view>
							</view>
							<view class="service-text">
								<text :style="{'color': selectedService === 'income_abnormal' ? '#2492F2' : '#333333'}">收益异常</text>
								<text class="service-desc">流水异常骤降查看</text>
							</view>
						</view>

						<!-- 其他异常选项 -->
						<view class="service-option" :class="{'service-option-active': selectedService === 'other_abnormal'}" @click="selectService('other_abnormal')">
							<view class="option-circle" :style="{'border-color': '#2492F2', 'border-radius': '50%'}">
								<view v-if="selectedService === 'other_abnormal'" class="inner-circle" :style="{'background-color': '#2492F2', 'border-radius': '50%'}"></view>
							</view>
							<view class="service-text">
								<text :style="{'color': selectedService === 'other_abnormal' ? '#2492F2' : '#333333'}">其他异常</text>
								<text class="service-desc">请自填 仅到店查看反馈信息</text>
							</view>
						</view>
					</view>

					<!-- 其他异常的额外选项 -->
					<view v-if="selectedService === 'other_abnormal'" class="other-abnormal-options">
						<view class="feedback-title">
							<text>是否需要现场其他信息反馈</text>
						</view>
						<view class="feedback-checkboxes">
							<!-- 是否被共存 -->
							<view class="checkbox-item" @click="toggleFeedbackOption('coexist')">
								<view class="checkbox" :class="{ 'checked': formData.feedbackOptions.coexist }">
									<view v-if="formData.feedbackOptions.coexist" class="checkbox-inner">
										<text class="check-mark">✓</text>
									</view>
								</view>
								<text class="checkbox-label">是否被共存</text>
							</view>

							<!-- 设备是否污损 -->
							<view class="checkbox-item" @click="toggleFeedbackOption('damage')">
								<view class="checkbox" :class="{ 'checked': formData.feedbackOptions.damage }">
									<view v-if="formData.feedbackOptions.damage" class="checkbox-inner">
										<text class="check-mark">✓</text>
									</view>
								</view>
								<text class="checkbox-label">设备是否污损</text>
							</view>

							<!-- 机位疑似异常 拍照反馈 -->
							<view class="checkbox-item" @click="toggleFeedbackOption('position')">
								<view class="checkbox" :class="{ 'checked': formData.feedbackOptions.position }">
									<view v-if="formData.feedbackOptions.position" class="checkbox-inner">
										<text class="check-mark">✓</text>
									</view>
								</view>
								<text class="checkbox-label">机位疑似异常 拍照反馈</text>
							</view>
						</view>
					</view>

					<!-- 服务说明 -->
					<view class="service-note">
						<!-- <text class="time-note">骑手在约定时间内任意时间点完成</text> -->
						<text class="time-note">注：仅提供断电 收入骤降 仓内异物等现场图文反馈服务</text>
					</view>
				</view>
			</view>


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
										<text :style="{'color': formData.timeType === 'before_deadline' ? '#2492F2' : '#333333'}">约定时间范围内完成</text>
										<text class="time-note">骑手在约定时间内任意时间点完成</text>
									</view>
								</view>
								<view class="time-table-cell time-value" @click="showAppointmentTimePicker">
									<text>{{ beforeDeadlineTextShow || '请选择时间范围' }}</text>
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
									placeholder="请输入特殊要求或备注信息，如：设备位置、注意事项等"
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

					<!-- 特别提醒 -->
					<!-- <view class="coupon-section">
						<view class="coupon-reminder">
							<text class="reminder-text">特别提醒！下单前请确认点位/门店设备可服务。如因停电、维修、关门、商户不同意等非骑手原因无法处理的。骑手到店打卡并反馈问题，视为完成任务！</text>
						</view>
					</view> -->
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
								<text class="reminder-text">价格含：跑腿、备用宝、电费押金</text>
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
						<text class="value">¥{{(priceDetails.wireFee - priceDetails.extraWireFee).toFixed(2)}}</text>
					</view>
					<view class="detail-item" v-if="priceDetails.extraWireFee > 0">
						<text class="label">附加服务增量</text>
						<text class="value">¥{{priceDetails.extraWireFee.toFixed(2)}}</text>
					</view>
					<view class="detail-item" v-if="priceDetails.powerFee > 0">
						<text class="label">通电</text>
						<text class="value">¥{{priceDetails.powerFee.toFixed(2)}}</text>
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

		<!-- 悬浮聊天图标 -->
		<FloatingChatIconUser />
	</view>
</template>

<script>
	import NavBar from '@/components/NavBar.vue'
	import TimePicker from '@/components/time-picker/index.vue'
	import StoreInfo from '@/components/StoreInfo.vue'
	import FloatingChatIconUser from '@/components/FloatingChatIconUser/index.vue'
	import AuthModal from '@/components/AuthModal/index.vue'

	export default {
		components: {
			NavBar,
			TimePicker,
			StoreInfo,
			AuthModal,
			FloatingChatIconUser
		},
		data() {
			return {
				navBarHeight: 0,
				selectedBrand: '', // 修改默认值为空字符串
				selectedService: 'offline_abnormal', // 默认不选中任何服务
				taskTypeId: null, // 添加 taskTypeId 字段

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
					quantity: 1, // 默认数量为1
					offlineQuantity: 1, // 离线异常数量，默认为1
					feedbackOptions: { // 其他异常的反馈选项
						coexist: false,    // 是否被共存
						damage: false,     // 设备是否污损
						position: false    // 机位疑似异常 拍照反馈
					},
					badItemQuantity: 0, // 修改为默认数量0
					cableQuantity: 0, // 修改为默认数量0
					wiringQuantity: 0, // 添加接线数量字段
					timeType: 'before_deadline', // 默认选择约定时间内完成
					appointmentTime: '', // 约定时间
					timeInterval: '', // 指定时间区间
					timeRemark: '', // 添加时间备注字段
					powerQuantity: 0,
					warehouseQuantity: 0,
					phone: '', // 添加联系电话字段
					distance: 0, // 选中地址后与服务点位测算的距离
					shop_poi: '', // 新增POI字段
					device_outside: false, // 设备是否外摆，默认为否

					bjdyx_num: 1, // 补加电源线数量

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
					couponAmount: 0,
					total: 0 // 初始化为0，等待用户选择服务后计算
				},
				providerInfo: {},
				// 区域选择相关数据
				selectedCity: '',
				selectedDistrictId: '',
				// 时间段选择器相关数据
				timeRangePickerData: [[], [], [], []], // [开始小时, 开始分钟, 结束小时, 结束分钟]
				timeRangeIndex: [0, 0, 0, 0], // 默认选择 24小时均可 (索引0是"24小时均可")
				showTimeRangePopup: false, // 时间段选择弹窗显示状态
				tempTimeRangeIndex: [0, 0, 0, 0], // 临时时间段索引
				indicatorStyle: 'height: 50px;', // picker-view指示器样式
				// 用户信息
				currentUserInfo: {}
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
				return this.currentUserInfo || {};
			},
		},
		// 页面显示时检查登录状态
		onShow() {
			console.log('📱 离线异常页面-onShow 触发');

			// 更新用户信息
			this.currentUserInfo = uni.getStorageSync('userInfo') || {};

			// 每次页面显示时重新检查登录状态
			// isLoggedIn 是计算属性，会自动更新
			console.log('页面显示，登录状态:', this.isLoggedIn);
			console.log('用户信息:', this.userInfo);
			console.log('用户ID:', this.userInfo && this.userInfo.user_id ? this.userInfo.user_id : '未获取到');

			// 初始化区域选择数据
			this.initAreaData();

			// 获取服务商信息（异步）
			this.getProviderInfo();

			// 注意：calculatePrice() 会在 getProviderInfo() 完成后自动调用
			// 如果提前调用会因为 providerInfo 未加载而失败

			// 不再在页面进入时检查区域，等用户点击选项时再检查
			// this.checkInitialAreaSelection();
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

			// 获取并打印用户信息用于调试
			this.currentUserInfo = uni.getStorageSync('userInfo') || {};
			console.log('页面加载时的用户信息:', this.currentUserInfo);
			console.log('用户ID:', this.currentUserInfo.user_id || '未获取到');

			// 初始化时间段选择器数据
			this.initTimeRangePickerData();

			// 设置默认时间为24小时均可
			this.formData.recommended_service_time_start = '00:00';
			this.formData.recommended_service_time_end = '00:00';

			// 注意：不要在这里调用 calculatePrice()，因为 providerInfo 还未加载
			// calculatePrice() 会在 onShow() -> getProviderInfo() 完成后自动调用

			// 延迟初始化一些需要等待组件加载完成的操作
			setTimeout(() => {
				this.initializeComponents();
			}, 100);
		},
		onReady() {
			// 页面渲染完成后执行的操作
			this.initializeComponents();
		},

		methods: {
			// 初始化区域数据
			initAreaData() {
				this.selectedCity = uni.getStorageSync('selectedCity') || '';
				this.selectedDistrictId = uni.getStorageSync('selectedDistrictId') || '';
				console.log('🏙️ 离线异常页面-初始化区域数据:', {
					selectedCity: this.selectedCity,
					selectedDistrictId: this.selectedDistrictId,
					hasSelectedArea: this.hasSelectedArea
				});
			},

			// 显示区域选择模态框（透明蒙版点击时）
			showAreaSelectionModal() {
				console.log('🎭 离线异常页面-透明蒙版被点击，显示区域选择提示');

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
								console.log('🎯 离线异常页面-监听到区域选择完成，重新获取服务商信息', data);
								// 更新 Vue 响应式数据
								this.selectedCity = data.city;
								this.selectedDistrictId = data.districtId;
								console.log('✅ 离线异常页面-更新区域数据:', {
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

				console.log('🏙️ 离线异常页面-初始区域检查:', { selectedCity, selectedDistrictId });

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

				console.log('🏙️ 离线异常页面-检查区域选择:', { selectedCity, selectedDistrictId });

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

			// 获取服务商信息
			async getProviderInfo() {
				try {
					const selectedDistrictId = uni.getStorageSync('selectedDistrictId');
					if (!selectedDistrictId) {
						console.log('⚠️ 未选择服务区域，跳过获取服务商信息');
						return;
					}

					console.log('🔄 正在获取服务商信息，区域ID:', selectedDistrictId);
					const res = await this.$request('task/provider/info', { district_id: selectedDistrictId }, 'POST');
					console.log('📦 服务商信息返回:', res);

					if (res.code === 200) {
						this.providerInfo = res.data;
						// 保存到本地存储供价格计算使用
						uni.setStorageSync('providerInfo', res.data);

						console.log('✅ 服务商信息设置成功:', {
							service_provider_id: res.data.service_provider_id,
							hasPrices: !!res.data.prices,
							priceKeys: res.data.prices ? Object.keys(res.data.prices) : []
						});

						// 更新可用品牌列表
						this.updateAvailableBrands();

						// 重新计算价格
						console.log('🔢 准备重新计算价格...');
						this.calculatePrice();

						console.log('✅ 离线异常页面-服务商信息获取成功，价格已重新计算');
					} else {
						console.error('❌ 获取服务商信息失败:', res.msg);
					}
				} catch (err) {
					console.error('❌ 获取服务商信息异常:', err);
				}
			},

			// 更新可用品牌列表
			updateAvailableBrands() {
				// 不自动选择品牌，让用户手动选择
				console.log('可用品牌列表:', this.availableBrands);
			},
			// 添加价格计算方法
			calculatePrice() {
				console.log('🔢 开始计算价格:', {
					selectedService: this.selectedService,
					selectedBrand: this.selectedBrand,
					offlineQuantity: this.formData.offlineQuantity
				});

				// 如果没有选择服务，重置价格为0
				if (!this.selectedService) {
					console.log('❌ 未选择服务，价格重置为0');
					this.formData.estimatedPrice = 0;
					this.priceDetails = {
						baseServiceFee: 0,
						extraDeviceFee: 0,
						distanceFee: 0,
						extraDistanceFee: 0,
						timeLimitFee: 0,
						wireFee: 0,
						extraWireFee: 0,
						powerFee: 0,
						couponAmount: 0,
						total: 0
					};
					return;
				}

				// 获取服务商信息
				const providerInfo = uni.getStorageSync('providerInfo');
				if (!providerInfo || !providerInfo.prices) {
					console.log('⚠️ 服务商信息未加载，价格重置为0');
					this.formData.estimatedPrice = 0;
					this.priceDetails = {
						baseServiceFee: 0,
						extraDeviceFee: 0,
						distanceFee: 0,
						extraDistanceFee: 0,
						timeLimitFee: 0,
						wireFee: 0,
						extraWireFee: 0,
						powerFee: 0,
						couponAmount: 0,
						total: 0
					};
					return;
				}

				this.providerInfo = providerInfo

				const info = providerInfo.prices;

				// 1. 计算基础设备离线服务费用
				let baseServiceFee = 0;
				let extraDeviceFee = 0;

				// 根据选择的服务类型计算费用
				if (this.selectedService === 'offline_abnormal') {
					// 离线异常服务
					baseServiceFee = parseFloat(info.exception_offline_base_device_fee) || 0;

					// 如果设备数量超过基础数量，计算额外费用
					if (this.formData.offlineQuantity > (info.exception_offline_base_device || 1)) {
						const extraDevices = Math.ceil((this.formData.offlineQuantity - (info.exception_offline_base_device || 1)) / (info.exception_offline_extra_device || 1));
						extraDeviceFee = extraDevices * (parseFloat(info.exception_offline_extra_device_fee) || 0);
					}
				} else if (this.selectedService === 'income_abnormal') {
					// 收入异常服务
					baseServiceFee = parseFloat(info.income_exception_base_device_fee) || 0;

					// 收入异常没有数量选择，使用基础设备数量
					const baseDeviceCount = info.income_exception_base_device || 1;
					if (baseDeviceCount > (info.income_exception_base_device || 1)) {
						const extraDevices = Math.ceil((baseDeviceCount - (info.income_exception_base_device || 1)) / (info.income_exception_extra_device || 1));
						extraDeviceFee = extraDevices * (parseFloat(info.income_exception_extra_device_fee) || 0);
					}
				} 
				
				else if (this.selectedService === '补加电源线') {
					baseServiceFee = parseFloat(info.bjdyx_base_fee) || 0;

					// 如果设备数量超过基础数量，计算额外费用
					if (this.formData.bjdyx_num > 1) {
						const extraDevices = (this.formData.bjdyx_num - 1);
						extraDeviceFee = extraDevices * (parseFloat(info.bjdyx_fee) || 0);
					}
				}
				
				else if (this.selectedService === 'other_abnormal') {
					// 其他异常服务
					baseServiceFee = parseFloat(info.other_exception_base_device_fee) || 0;

					// 其他异常没有数量选择，使用基础设备数量
					const baseDeviceCount = info.other_exception_base_device || 1;
					if (baseDeviceCount > (info.other_exception_base_device || 1)) {
						const extraDevices = Math.ceil((baseDeviceCount - (info.other_exception_base_device || 1)) / (info.other_exception_extre_device || 1));
						extraDeviceFee = extraDevices * (parseFloat(info.other_exception_extre_device_fee) || 0);
					}
				}

				// 2. 计算距离费用（离线&异常服务可能使用相同的距离费用结构）
				let distanceFee = 0;
				let extraDistanceFee = 0;

				// 如果选择了服务，计算距离费用
				if (this.selectedService) {
					distanceFee = parseFloat(info.bubao_base_distance_fee) || 0; // 使用基础距离费用

					// 如果距离超过基础距离，计算额外费用
					if (this.formData.distance > (info.bubao_base_distance || 0)) {
						const extraDistance = Math.ceil((this.formData.distance - (info.bubao_base_distance || 0)) / (info.bubao_extra_distance || 1));
						extraDistanceFee = extraDistance * (parseFloat(info.bubao_extra_distance_fee) || 0);
					}
				}

				// 3. 计算时间限制费用（离线&异常服务可能使用相同的时间限制结构）
				let timeLimitFee = 0;
				if (this.selectedService && this.formData.timeType === 'before_deadline' && this.formData.appointmentTime) {
					const hours = parseInt(this.formData.appointmentTime);
					// 根据小时数查找对应的时间限制费用（使用原有的bubao时间限制字段）
					for (let i = 1; i <= 10; i++) {
						if (hours <= (info[`bubao_time_limit_${i}`] || 0)) {
							timeLimitFee = parseFloat(info[`bubao_time_limit_${i}_fee`]) || 0;
							break;
						}
					}
				}

				// 4. 离线&异常服务不需要电源线和通电费用
				let wireFee = 0;
				let extraWireFee = 0;
				let powerFee = 0;

				// 离线&异常服务暂时不包含额外的电源线和通电服务

				// 计算总价（未减优惠券金额）
				let totalPrice = baseServiceFee + distanceFee + timeLimitFee + wireFee + powerFee + extraDeviceFee + extraDistanceFee + extraWireFee;

				// 6. 减去优惠券金额
				const couponAmount = parseFloat(this.formData.couponAmount) || 0;
				totalPrice = Math.max(1, totalPrice - couponAmount); // 确保总价不低于1元

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
					couponAmount: parseFloat(couponAmount), // 添加优惠券金额
					total: parseFloat(totalPrice)
				};

				console.log('✅ 离线&异常服务价格计算完成:', {
					selectedService: this.selectedService,
					baseServiceFee,
					extraDeviceFee,
					distanceFee,
					extraDistanceFee,
					timeLimitFee,
					wireFee,
					extraWireFee,
					powerFee,
					couponAmount,
					totalPrice,
					offlineQuantity: this.formData.offlineQuantity,
					priceDetails: this.priceDetails
				});

				// 强制触发视图更新
				this.$forceUpdate();
			},
			selectBrand(brand) {
				this.selectedBrand = brand
			},
			selectService(service) {
				this.selectedService = service;
				console.log('选择服务:', service);

				// 如果不是其他异常，重置反馈选项
				if (service !== 'other_abnormal') {
					this.formData.feedbackOptions = {
						coexist: false,
						damage: false,
						position: false
					};
				}

				// 选择服务后重新计算价格
				this.calculatePrice();
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
				if (this.formData.quantity < 99) {
					this.formData.quantity++
					this.calculatePrice() // 更新价格
				}
			},
			decreaseQuantity() {
				if (this.formData.quantity > 1) {
					this.formData.quantity--
					this.calculatePrice() // 更新价格
				}
			},

			// 离线异常数量控制
			increaseOfflineQuantity() {
				if (this.formData.offlineQuantity < 99) {
					this.formData.offlineQuantity++
					// 自动选中离线异常选项
					if (this.selectedService !== 'offline_abnormal') {
						this.selectService('offline_abnormal')
					} else {
						this.calculatePrice() // 如果已经选中，只更新价格
					}
				}
			},
			decreaseOfflineQuantity() {
				if (this.formData.offlineQuantity > 1) {
					this.formData.offlineQuantity--
					// 自动选中离线异常选项
					if (this.selectedService !== 'offline_abnormal') {
						this.selectService('offline_abnormal')
					} else {
						this.calculatePrice() // 如果已经选中，只更新价格
					}
				}
			},
			handleOfflineQuantityInput(e) {
				const value = parseInt(e.target.value)
				if (value >= 1 && value <= 99) {
					this.formData.offlineQuantity = value
				} else if (value < 1) {
					this.formData.offlineQuantity = 1
				} else {
					this.formData.offlineQuantity = 99
				}

				// 自动选中离线异常选项
				if (this.selectedService !== 'offline_abnormal') {
					this.selectService('offline_abnormal')
				} else {
					this.calculatePrice() // 如果已经选中，只更新价格
				}
			},

			// 切换反馈选项
			toggleFeedbackOption(option) {
				this.formData.feedbackOptions[option] = !this.formData.feedbackOptions[option];
				console.log('反馈选项更新:', this.formData.feedbackOptions);

				// 如果反馈选项影响价格，重新计算价格
				// this.calculatePrice();
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

			// 加入购物车
			async addToCart() {
				// 验证表单
				if (!this.validateForm()) {
					return;
				}

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

					// 根据服务类型选择数量
					const itemNumber = this.selectedService === 'offline_abnormal'
						? this.formData.offlineQuantity
						: this.formData.quantity;

					const timeIntervalStr = this.formData.timeInterval ? String(this.formData.timeInterval) : '';

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
						time_fee: this.priceDetails.timeLimitFee,
						order_amount: this.formData.estimatedPrice,
						service_time_type: this.formData.timeType,
						time_limit: this.formData.timeType === 'before_deadline' ? parseInt(this.formData.appointmentTime) : null,
						range_start_date: this.formData.timeType === 'time_range' && timeIntervalStr ? timeIntervalStr.substring(0, 19) : null,
						range_end_date: this.formData.timeType === 'time_range' && timeIntervalStr ? timeIntervalStr.substring(20) : null,
						recommended_service_time_start: this.formData.recommended_service_time_start || '',
						recommended_service_time_end: this.formData.recommended_service_time_end || '',
						distance: this.formData.distance,
						store_name: this.formData.storeName,
						sn_mac_code: this.formData.snMacList,
						detail: this.selectedService,
						item_number: itemNumber,
						device_outside: this.formData.device_outside,
						extra_task_1: this.selectedService === 'other_abnormal' && this.formData.feedbackOptions.coexist ? true : null,
						extra_task_2: this.selectedService === 'other_abnormal' && this.formData.feedbackOptions.damage ? true : null,
						extra_task_3: this.selectedService === 'other_abnormal' && this.formData.feedbackOptions.position ? true : null,
						extra_task_4: this.selectedAdditionalServices.includes('wiring') ? '接电源线' : null,
						extra_task_4_item_number: this.selectedAdditionalServices.includes('wiring') ? this.formData.wiringQuantity : 0,
						extra_task_5: this.selectedAdditionalServices.includes('powerCable') ? '换根电源线' : null,
						extra_task_5_item_number: this.selectedAdditionalServices.includes('powerCable') ? this.formData.cableQuantity : 0,
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
						uni.showToast({
							title: '已加入购物车',
							icon: 'success',
							duration: 2000
						});

						// 通知购物车数据更新
						uni.$emit('cartUpdated');

						// 提示是否跳转购物车
						setTimeout(() => {
							uni.showModal({
								title: '提示',
								content: '是否立即查看购物车？',
								success: (modalRes) => {
									if (modalRes.confirm) {
										uni.switchTab({
											url: '/pages/cart/index',
											fail: () => {
												uni.showToast({
												title: '购物车页面暂未开放',
												icon: 'none'
											});
											}
										});
									}
								}
							});
						}, 1500);
					} else {
						uni.showToast({
							title: res.message || '加入购物车失败',
							icon: 'none'
						});
					}
				} catch (error) {
					// 隐藏加载提示
					uni.hideLoading();

					console.error('加入购物车失败', error);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					});
				}
			},

			async submitOrder() {
				// 验证表单
				if (!this.validateForm()) {
					return;
				}

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
						range_start_date: this.formData.timeType === 'time_range' ? this.formData.timeInterval.substring(0, 19) : null,
						range_end_date: this.formData.timeType === 'time_range' ? this.formData.timeInterval.substring(20) : null,
						distance: this.formData.distance, // 需要计算服务地点到服务商基地的导航距离
						detail: this.selectedService,
						// 添加基础服务费用
						base_service_fee: this.priceDetails.baseServiceFee + this.priceDetails.extraDeviceFee + this.priceDetails.distanceFee + this.priceDetails.extraDistanceFee + this.priceDetails.timeLimitFee,
						// 添加附加服务费用
						 additional_service_fee: this.priceDetails.wireFee + this.priceDetails.extraWireFee + this.priceDetails.powerFee,
						// 添加优惠券ID
						ticket_id: this.formData.couponId || '',
						// 添加订单备注
						additional_notes: this.formData.additional_notes || '',
						// 添加建议骑手上门时间段
						recommended_service_time_start: this.formData.recommended_service_time_start || '',
						recommended_service_time_end: this.formData.recommended_service_time_end || '',

						// 其他异常的反馈选项使用 extra_task_1、extra_task_2、extra_task_3，使用boolean值
						...(this.selectedService === 'other_abnormal' && this.formData.feedbackOptions.coexist && { extra_task_1: true }),
						...(this.selectedService === 'other_abnormal' && this.formData.feedbackOptions.damage && { extra_task_2: true }),
						...(this.selectedService === 'other_abnormal' && this.formData.feedbackOptions.position && { extra_task_3: true }),
						extra_task_4: this.selectedAdditionalServices.includes('wiring') ? '接电源线' : null,
						extra_task_4_item_number: this.selectedAdditionalServices.includes('wiring') ? this.formData.wiringQuantity : 0,
						extra_task_5: this.selectedAdditionalServices.includes('powerCable') ? '换根电源线' : null,
						extra_task_5_item_number: this.selectedAdditionalServices.includes('powerCable') ? this.formData.cableQuantity : 0,

						description: this.formData.locationDesc,
						store_name: this.formData.storeName,
						sn_mac_code: this.formData.snMacList,
						pic_url: this.formData.doorImages ,// 门头照组
						phone_number: this.formData.phone,
						name: this.formData.contact,
						shop_poi: this.formData.shop_poi, // 门店POI
						device_outside: this.formData.device_outside, // 设备是否外摆
						service_provider_id: this.providerInfo.service_provider_id, // 添加服务商ID
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
					success: (res) => {
						// console.log('支付成功:', res);
						uni.hideLoading();
						uni.showToast({
							title: '支付成功',
							icon: 'success'
						});

						// 支付成功后跳转到支付成功页面
						setTimeout(() => {
							uni.redirectTo({
								url: `/pages/pay/success?id=${payParams.task_id}`
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
								latitude: data.latitude || ''
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

				// 验证主服务项
				if (!this.selectedService) {
					uni.showToast({
						title: '请选择主服务项',
						icon: 'none'
					});
					return false;
				}

			// 验证数量 - 根据服务类型验证对应的数量字段
			if (this.selectedService === 'offline_abnormal') {
				// 离线异常服务验证 offlineQuantity
				if (!this.formData.offlineQuantity || this.formData.offlineQuantity < 1) {
					uni.showToast({
						title: '请选择正确的数量',
						icon: 'none'
					});
					return false;
				}
			} else {
				// 其他服务验证 quantity
				if (!this.formData.quantity || this.formData.quantity < 1) {
					uni.showToast({
						title: '请选择正确的数量',
						icon: 'none'
					});
					return false;
				}
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
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		font-family: "HarmonyOS Sans SC", sans-serif;
	}

	.content {
		padding: 30rpx;
		position: relative;
		padding-bottom: 405rpx; /* 预留足够空间避免被底部栏遮挡 */
	}

	.info-card {
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
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
		margin-bottom: 20rpx;

		.title-left {
			display: flex;
			align-items: center;
		}

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

		.optional-tag-red {
			font-size: 24rpx;
			color: #f00;
			margin-left: 10rpx;
		}

		&.section-title {
			margin-bottom: 30rpx;

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
	}

	.brand-list {
		display: flex;
		justify-content: space-between;
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
			width: 140rpx;
			height: 110rpx;
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
					width: 100rpx;
					height: 100rpx;
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
					width: 100rpx;
					height: 100rpx;
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
					width: 100rpx;
					height: 100rpx;
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
					width: 100rpx;
					height: 100rpx;
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
		flex-direction: column;
		gap: 20rpx;

		.service-option {
			display: flex;
			align-items: center;
			padding: 20rpx;
			border: 2rpx solid #f0f0f0;
			border-radius: 12rpx;
			background-color: #fafafa;
			transition: all 0.3s ease;

			&.service-option-active {
				border-color: #2492F2;
				background-color: rgba(36, 146, 242, 0.05);
			}

			.option-circle {
				width: 36rpx;
				height: 36rpx;
				border: 2rpx solid #CCCCCC;
				margin-right: 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;

				.inner-circle {
					width: 24rpx;
					height: 24rpx;
				}
			}

			.service-text {
				flex: 1;

				text {
					display: block;

					&:first-child {
						font-size: 28rpx;
						font-weight: 500;
						margin-bottom: 8rpx;
					}
				}

				.service-desc {
					font-size: 24rpx;
					color: #999;
					line-height: 1.4;
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

	.service-note {
		// margin-top: 30rpx;
		// padding: 20rpx;
		// background-color: #f8f9fa;
		// border-radius: 8rpx;
		// border-left: 4rpx solid #2492F2;

		// .note-text {
		// 	font-size: 24rpx;
		// 	color: #666;
		// 	line-height: 1.5;
		// }
		.time-note {
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
			margin-top: 24rpx;
		}
	}

	.other-abnormal-options {
		margin-top: 30rpx;
		padding: 24rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		border: 1rpx solid #e5e7eb;

		.feedback-title {
			margin-bottom: 24rpx;

			text {
				font-size: 28rpx;
				font-weight: 500;
				color: #333;
			}
		}

		.feedback-checkboxes {
			display: flex;
			flex-direction: column;
			gap: 20rpx;

			.checkbox-item {
				display: flex;
				align-items: center;
				padding: 16rpx 0;
				cursor: pointer;

				.checkbox {
					width: 36rpx;
					height: 36rpx;
					border: 2rpx solid #d1d5db;
					border-radius: 6rpx;
					margin-right: 20rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: #fff;
					transition: all 0.3s ease;

					&.checked {
						border-color: #2492F2;
						background-color: #2492F2;
					}

					.checkbox-inner {
						width: 100%;
						height: 100%;
						display: flex;
						align-items: center;
						justify-content: center;

						.check-mark {
							color: #fff;
							font-size: 24rpx;
							font-weight: bold;
						}
					}
				}

				.checkbox-label {
					font-size: 28rpx;
					color: #333;
					line-height: 1.4;
					flex: 1;
				}

				&:active {
					opacity: 0.7;
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
					margin-left: 12rpx;
					cursor: pointer;
					display: flex;
					align-items: center;

					.question-text {
						font-size: 24rpx;
						color: #2492F2;
						text-decoration: none;
						transition: color 0.2s ease;
						white-space: nowrap;

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
			width: 220rpx;
			height: 70rpx;
			line-height: 70rpx;
			text-align: center;
			font-size: 30rpx;
			border-radius: 35rpx;
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
			margin-bottom: 20rpx;

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

						&.disabled {
							opacity: 0.5;
							pointer-events: none;
						}
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
			padding: 24rpx 0;

			&:first-child {
				border-bottom: none;
			}

			&:last-child {
				border-bottom: 1rpx solid #eee;
			}

			.time-table-cell {
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
						margin-top: 4rpx;

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

	.coupon-section2 {
		margin-top: 6rpx;

		.coupon-reminder2 {
			padding: 10rpx;
			background-color: #FFF1F0;
			border-radius: 8rpx;
			display: inline-block;
			width: fit-content;

			.reminder-text {
				font-size: 20rpx;
				color: #FF4D4F;
				line-height: 1.3;
				display: block;
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
			padding: 0 0rpx;
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

	.coupon-reminder {
		margin-top: 20rpx;
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
</style>
