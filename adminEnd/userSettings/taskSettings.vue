<template>
	<view class="task-settings-container">
		<!-- 顶部导航栏 -->
		<nav-bar title="发布任务设置" title-align="center" :showBackButton="true" @leftClick="goBack"></nav-bar>

		<!-- 导航栏占位元素 -->
		<view class="nav-placeholder" :style="{ height: navBarHeight + 'px' }"></view>

		<!-- 设置内容 -->
		<view class="settings-content">
			<!-- 业务板块选择 -->
			<view class="settings-section">
				<view class="section-header">
					<view class="section-title-wrapper">
						<view class="section-title">业务板块选择</view>
						<view class="section-subtitle">选择要设置的业务板块</view>
					</view>
				</view>

				<view class="business-module-selector">
					<view v-for="module in businessModules" :key="module.key"
						class="module-item"
						:class="{ active: currentModule === module.key }"
						@click="switchModule(module.key)">
						<text class="module-name">{{ module.name }}</text>
						<view class="module-status" v-if="module.status">
							<text class="status-text" :class="module.status">{{ getModuleStatusText(module.status) }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 待开发业务板块显示开发中提示 -->
			<template v-if="isCurrentModuleDevelopment">
				<view class="module-development-notice">
					<view class="development-icon">🚧</view>
					<text class="development-title">{{ getModuleServiceTitle(currentModule) }}</text>
					<text class="development-text">该业务板块正在开发中，敬请期待</text>
				</view>
			</template>

			<!-- 可用业务板块显示完整设置 -->
			<template v-else>
				<!-- 服务区域选择 -->
				<view class="settings-section">
					<view class="section-header">
						<view class="section-title-wrapper">
							<view class="section-title">服务区域选择</view>
							<view class="section-subtitle">选择要设置的服务区域</view>
						</view>
					</view>

					<view class="service-area-selector">
						<!-- 联级选择器 -->
						<view class="cascade-selector">
							<!-- 选择器头部 -->
							<view class="selector-header">
								<view class="selected-area-info">
									<text class="area-label">已选区域：</text>
									<text class="area-value" v-if="currentProvider !== '0'">{{ getSelectedAreaName() }}</text>
									<text class="area-value empty" v-else>未选择</text>
								</view>
								<view class="selector-action" @click="showAreaSelector">
									<text class="action-text">{{ currentProvider !== '0' ? '修改' : '选择' }}</text>
								</view>
							</view>

							<!-- 选择器导航路径 -->
							<view class="selector-path" v-if="showSelector">
								<view class="path-wrapper">
									<text class="path-item" @click="resetSelection">全部</text>
									<text class="path-separator" v-if="selectedProvince">></text>
									<text class="path-item" v-if="selectedProvince" @click="selectProvince(selectedProvince)">
										{{ getProvinceName(selectedProvince) }}
									</text>
									<text class="path-separator" v-if="selectedCity">></text>
									<text class="path-item" v-if="selectedCity" @click="selectCity(selectedProvince, selectedCity)">
										{{ getCityName(selectedProvince, selectedCity) }}
									</text>
								</view>
							</view>

							<!-- 选择器内容 -->
							<view class="selector-content" v-if="showSelector">
								<!-- 省份列表 -->
								<view class="selector-list" v-if="!selectedProvince">
									<view v-for="province in groupedServiceAreas" :key="province.id"
										class="selector-item" @click="selectProvince(province.id)">
										<text class="item-name">{{ province.name }}</text>
										<text class="item-count">{{ province.cities.length }}个城市</text>
										<view class="item-arrow"></view>
									</view>
								</view>

								<!-- 城市列表 -->
								<view class="selector-list" v-else-if="selectedProvince && !selectedCity">
									<view v-for="city in getCities(selectedProvince)" :key="city.id"
										class="selector-item" @click="selectCity(selectedProvince, city.id)">
										<text class="item-name">{{ city.name }}</text>
										<text class="item-count">{{ city.districts.length }}个区县</text>
										<view class="item-arrow"></view>
									</view>
								</view>

								<!-- 区县列表 -->
								<view class="selector-list" v-else-if="selectedProvince && selectedCity">
									<view v-for="district in getDistricts(selectedProvince, selectedCity)" :key="district.id"
										class="selector-item district-item"
										:class="{ active: currentProvider === district.id }"
										@click="selectDistrict(district.id)">
										<text class="item-name">{{ district.name }}</text>
										<view v-if="currentProvider === district.id" class="item-check"></view>
									</view>
								</view>
							</view>
						</view>



						<!-- 如果没有分组数据，显示原始列表 -->
						<view v-if="!hasGroupedData" class="service-provider-selector">
							<view v-for="provider in serviceProviders" :key="provider.id" class="provider-item"
								:class="{ active: currentProvider === provider.id }" @click="switchProvider(provider.id)">
								<text class="provider-name">{{ provider.name }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 基本设置已移除 -->

				<!-- 品牌选择 -->
				<view class="settings-section">
					<view class="section-header">
						<view class="section-title">品牌选择</view>
						<view class="section-subtitle">支持的品牌设置</view>
					</view>

					<view class="brand-selection">
						<view class="brand-item" :class="{ active: currentSettings.meituan === '1' }"
							@click="toggleBrand('meituan')">
							<text class="brand-name">美团</text>
							<view class="brand-check" v-if="currentSettings.meituan === '1'"></view>
						</view>

						<view class="brand-item" :class="{ active: currentSettings.guaishou === '1' }"
							@click="toggleBrand('guaishou')">
							<text class="brand-name">怪兽</text>
							<view class="brand-check" v-if="currentSettings.guaishou === '1'"></view>
						</view>

						<view class="brand-item" :class="{ active: currentSettings.jiedian === '1' }"
							@click="toggleBrand('jiedian')">
							<text class="brand-name">街电</text>
							<view class="brand-check" v-if="currentSettings.jiedian === '1'"></view>
						</view>

						<view class="brand-item" :class="{ active: currentSettings.xiaodian === '1' }"
							@click="toggleBrand('xiaodian')">
							<text class="brand-name">小电</text>
							<view class="brand-check" v-if="currentSettings.xiaodian === '1'"></view>
						</view>
					</view>
				</view>

				<!-- 主项服务 -->
				<view class="settings-section">
					<view class="section-header">
						<view class="section-title">主项服务</view>
						<view class="section-subtitle">{{ getModuleServiceTitle(currentModule) }}</view>
					</view>

					<!-- 补宝服务设置 -->
					<template v-if="currentModule === 'bubao'">
						<view class="settings-row">
							<view class="settings-item">
								<text class="item-label">补宝基础设备数量</text>
								<view class="number-stepper">
									<view class="stepper-btn" @click="decrementValue('bubao_base_device')"
										:class="{ disabled: currentSettings.bubao_base_device <= 1 }">
										<view class="btn-icon minus"></view>
									</view>
									<input type="number" v-model="currentSettings.bubao_base_device" class="stepper-input" />
									<view class="stepper-btn" @click="incrementValue('bubao_base_device')">
										<view class="btn-icon plus"></view>
									</view>
								</view>
							</view>

							<view class="settings-item">
								<text class="item-label">补宝基础设备费用（元）</text>
								<input type="text" v-model="currentSettings.bubao_base_device_fee" class="item-input"
									@input="validateNumberInput($event, 'bubao_base_device_fee')"
									placeholder="数字/小数/负数"
									inputmode="decimal"
									pattern="[-]?[0-9]*[.]?[0-9]*" />
							</view>
						</view>

						<view class="settings-row">
							<view class="settings-item">
								<text class="item-label">补宝额外设备数量</text>
								<view class="number-stepper">
									<view class="stepper-btn" @click="decrementValue('bubao_extra_device')"
										:class="{ disabled: currentSettings.bubao_extra_device <= 1 }">
										<view class="btn-icon minus"></view>
									</view>
									<input type="number" v-model="currentSettings.bubao_extra_device" class="stepper-input" />
									<view class="stepper-btn" @click="incrementValue('bubao_extra_device')">
										<view class="btn-icon plus"></view>
									</view>
								</view>
							</view>

							<view class="settings-item">
								<text class="item-label">补宝额外设备费用（元/个）</text>
								<input type="text" v-model="currentSettings.bubao_extra_device_fee" class="item-input"
									@input="validateNumberInput($event, 'bubao_extra_device_fee')"
									placeholder="数字/小数/负数"
									inputmode="decimal"
									pattern="[-]?[0-9]*[.]?[0-9]*" />
							</view>
						</view>
					</template>

					<!-- 离线异常服务设置 -->
					<template v-else-if="currentModule === 'offline_abnormal'">
						<!-- 离线异常 -->
						<view class="exception-service-group">
							<view class="service-group-title">离线异常</view>
							<view class="settings-row">
								<view class="settings-item">
									<text class="item-label">基础设备数量</text>
									<view class="number-stepper">
										<view class="stepper-btn" @click="decrementValue('exception_offline_base_device')"
											:class="{ disabled: currentSettings.exception_offline_base_device <= 1 }">
											<view class="btn-icon minus"></view>
										</view>
										<input type="number" v-model="currentSettings.exception_offline_base_device" class="stepper-input" />
										<view class="stepper-btn" @click="incrementValue('exception_offline_base_device')">
											<view class="btn-icon plus"></view>
										</view>
									</view>
								</view>

								<view class="settings-item">
									<text class="item-label">基础设备费用（元）</text>
									<input type="text" v-model="currentSettings.exception_offline_base_device_fee" class="item-input"
										@input="validateNumberInput($event, 'exception_offline_base_device_fee')"
										placeholder="数字/小数/负数"
										inputmode="decimal"
										pattern="[-]?[0-9]*[.]?[0-9]*" />
								</view>
							</view>

							<view class="settings-row">
								<view class="settings-item">
									<text class="item-label">额外设备数量（单位1）</text>
									<view class="number-stepper">
										<view class="stepper-btn" @click="decrementValue('exception_offline_extra_device')"
											:class="{ disabled: currentSettings.exception_offline_extra_device <= 1 }">
											<view class="btn-icon minus"></view>
										</view>
										<input type="number" v-model="currentSettings.exception_offline_extra_device" class="stepper-input" />
										<view class="stepper-btn" @click="incrementValue('exception_offline_extra_device')">
											<view class="btn-icon plus"></view>
										</view>
									</view>
								</view>

								<view class="settings-item">
									<text class="item-label">额外设备费用（元/个）</text>
									<input type="text" v-model="currentSettings.exception_offline_extra_device_fee" class="item-input"
										@input="validateNumberInput($event, 'exception_offline_extra_device_fee')"
										placeholder="数字/小数/负数"
										inputmode="decimal"
										pattern="[-]?[0-9]*[.]?[0-9]*" />
								</view>
							</view>
						</view>

						<!-- 收入异常 -->
						<view class="exception-service-group">
							<view class="service-group-title">收入异常</view>
							<view class="settings-row">
								<view class="settings-item">
									<text class="item-label">基础设备数量</text>
									<view class="number-stepper">
										<view class="stepper-btn" @click="decrementValue('income_exception_base_device')"
											:class="{ disabled: currentSettings.income_exception_base_device <= 1 }">
											<view class="btn-icon minus"></view>
										</view>
										<input type="number" v-model="currentSettings.income_exception_base_device" class="stepper-input" />
										<view class="stepper-btn" @click="incrementValue('income_exception_base_device')">
											<view class="btn-icon plus"></view>
										</view>
									</view>
								</view>

								<view class="settings-item">
									<text class="item-label">基础设备费用（元）</text>
									<input type="text" v-model="currentSettings.income_exception_base_device_fee" class="item-input"
										@input="validateNumberInput($event, 'income_exception_base_device_fee')"
										placeholder="数字/小数/负数"
										inputmode="decimal"
										pattern="[-]?[0-9]*[.]?[0-9]*" />
								</view>
							</view>
						</view>

						<!-- 其他异常 -->
						<view class="exception-service-group">
							<view class="service-group-title">其他异常</view>
							<view class="settings-row">
								<view class="settings-item">
									<text class="item-label">基础设备数量</text>
									<view class="number-stepper">
										<view class="stepper-btn" @click="decrementValue('other_exception_base_device')"
											:class="{ disabled: currentSettings.other_exception_base_device <= 1 }">
											<view class="btn-icon minus"></view>
										</view>
										<input type="number" v-model="currentSettings.other_exception_base_device" class="stepper-input" />
										<view class="stepper-btn" @click="incrementValue('other_exception_base_device')">
											<view class="btn-icon plus"></view>
										</view>
									</view>
								</view>

								<view class="settings-item">
									<text class="item-label">基础设备费用（元）</text>
									<input type="text" v-model="currentSettings.other_exception_base_device_fee" class="item-input"
										@input="validateNumberInput($event, 'other_exception_base_device_fee')"
										placeholder="数字/小数/负数"
										inputmode="decimal"
										pattern="[-]?[0-9]*[.]?[0-9]*" />
								</view>
							</view>
						</view>
					</template>
				</view>

				<!-- 附加服务 -->
				<!-- <view class="settings-section">
					<view class="section-header">
						<view class="section-title">附加服务</view>
						<view class="section-subtitle">通电、换/加/接电源线设置</view>
					</view>

					<view class="settings-row">
						<view class="settings-item">
							<text class="item-label">通电基础设备数量</text>
							<view class="number-stepper">
								<view class="stepper-btn" @click="decrementValue('bubao_power_base_device')"
									:class="{ disabled: currentSettings.bubao_power_base_device <= 1 }">
									<view class="btn-icon minus"></view>
								</view>
								<input type="number" v-model="currentSettings.bubao_power_base_device" class="stepper-input" />
								<view class="stepper-btn" @click="incrementValue('bubao_power_base_device')">
									<view class="btn-icon plus"></view>
								</view>
							</view>
						</view>

						<view class="settings-item">
							<text class="item-label">通电基础费用（元）</text>
							<input type="number" v-model="currentSettings.bubao_power_fee" class="item-input" />
						</view>
					</view>

					<view class="settings-row">
						<view class="settings-item">
							<text class="item-label">通电额外设备数量</text>
							<view class="number-stepper">
								<view class="stepper-btn" @click="decrementValue('bubao_power_device_count')"
									:class="{ disabled: currentSettings.bubao_power_device_count <= 1 }">
									<view class="btn-icon minus"></view>
								</view>
								<input type="number" v-model="currentSettings.bubao_power_device_count" class="stepper-input" />
								<view class="stepper-btn" @click="incrementValue('bubao_power_device_count')">
									<view class="btn-icon plus"></view>
								</view>
							</view>
						</view>

						<view class="settings-item">
							<text class="item-label">通电额外设备费用（元/个）</text>
							<input type="number" v-model="currentSettings.bubao_power_device_fee" class="item-input" />
						</view>
					</view>

					<view class="settings-row">
						<view class="settings-item">
							<text class="item-label">电源线基础数量</text>
							<view class="number-stepper">
								<view class="stepper-btn" @click="decrementValue('bubao_wire_base_device')"
									:class="{ disabled: currentSettings.bubao_wire_base_device <= 0 }">
									<view class="btn-icon minus"></view>
								</view>
								<input type="number" v-model="currentSettings.bubao_wire_base_device" class="stepper-input" />
								<view class="stepper-btn" @click="incrementValue('bubao_wire_base_device')">
									<view class="btn-icon plus"></view>
								</view>
							</view>
						</view>

						<view class="settings-item">
							<text class="item-label">电源线基础费用（元）</text>
							<input type="number" v-model="currentSettings.bubao_wire_base_fee" class="item-input" />
						</view>
					</view>

					<view class="settings-row">
						<view class="settings-item">
							<text class="item-label">电源线额外数量</text>
							<view class="number-stepper">
								<view class="stepper-btn" @click="decrementValue('bubao_wire_device_count')"
									:class="{ disabled: currentSettings.bubao_wire_device_count <= 1 }">
									<view class="btn-icon minus"></view>
								</view>
								<input type="number" v-model="currentSettings.bubao_wire_device_count" class="stepper-input" />
								<view class="stepper-btn" @click="incrementValue('bubao_wire_device_count')">
									<view class="btn-icon plus"></view>
								</view>
							</view>
						</view>

						<view class="settings-item">
							<text class="item-label">电源线额外费用（元/个）</text>
							<input type="number" v-model="currentSettings.bubao_wire_device_fee" class="item-input" />
						</view>
					</view>
				</view> -->

				<!-- 服务时效 -->
				<view class="settings-section">
					<view class="section-header">
						<view class="section-title">服务时效</view>
						<view class="section-subtitle">不同时间段的费用设置</view>
					</view>

					<view v-if="timeOptions.length === 0" class="empty-time-options">
						<text class="empty-text">暂无时效数据，请先选择服务商</text>
					</view>

					<view v-else class="time-fee-grid">
						<view v-for="(time, index) in timeOptions" :key="index" class="time-fee-item">
							<text class="time-label">{{time.hours}}小时内</text>
							<view class="fee-input-wrapper">
								<input type="text" v-model="currentSettings[`bubao_time_limit_${time.index}_fee`]"
									class="item-input fee-input" placeholder="数字/小数/负数"
									@input="validateNumberInput($event, `bubao_time_limit_${time.index}_fee`)"
									inputmode="decimal"
									pattern="[-]?[0-9]*[.]?[0-9]*" />
								<text class="fee-unit">元</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 距离费用 -->
				<view class="settings-section">
					<view class="section-header">
						<view class="section-title">距离费用</view>
						<view class="section-subtitle">基础距离和额外距离费用</view>
					</view>

					<view class="settings-row">
						<view class="settings-item full-width">
							<text class="item-label">基础距离（公里）</text>
							<view class="number-stepper">
								<view class="stepper-btn" @click="decrementValue('bubao_base_distance', 1)"
									:class="{ disabled: currentSettings.bubao_base_distance <= 1 }">
									<view class="btn-icon minus"></view>
								</view>
								<input type="number" v-model="currentSettings.bubao_base_distance" class="stepper-input" />
								<view class="stepper-btn" @click="incrementValue('bubao_base_distance', 1)">
									<view class="btn-icon plus"></view>
								</view>
							</view>
						</view>
					</view>

					<view class="settings-row">
						<view class="settings-item full-width">
							<text class="item-label">基础距离费用（元）</text>
							<input type="text" v-model="currentSettings.bubao_base_distance_fee" class="item-input"
								@input="validateNumberInput($event, 'bubao_base_distance_fee')"
								placeholder="数字/小数/负数"
								inputmode="decimal"
								pattern="[-]?[0-9]*[.]?[0-9]*" />
						</view>
					</view>

					<view class="settings-row">
						<view class="settings-item full-width">
							<text class="item-label">额外距离（公里）</text>
							<view class="number-stepper">
								<view class="stepper-btn" @click="decrementValue('bubao_extra_distance', 1)"
									:class="{ disabled: currentSettings.bubao_extra_distance <= 1 }">
									<view class="btn-icon minus"></view>
								</view>
								<input type="number" v-model="currentSettings.bubao_extra_distance" class="stepper-input" />
								<view class="stepper-btn" @click="incrementValue('bubao_extra_distance', 1)">
									<view class="btn-icon plus"></view>
								</view>
							</view>
						</view>
					</view>

					<view class="settings-row">
						<view class="settings-item full-width">
							<text class="item-label">额外距离费用（元/公里）</text>
							<input type="text" v-model="currentSettings.bubao_extra_distance_fee" class="item-input"
								@input="validateNumberInput($event, 'bubao_extra_distance_fee')"
								placeholder="数字/小数/负数"
								inputmode="decimal"
								pattern="[-]?[0-9]*[.]?[0-9]*" />
						</view>
					</view>
				</view>

				<!-- 操作按钮 -->
				<view class="action-buttons-wrapper">
					<button class="save-button" @click="saveSettings">保存设置</button>
					<button class="bulk-update-button" @click="showBulkUpdateModal">批量修改定价</button>
				</view>
				<!-- 底部安全区占位 -->
				<view style="height: env(safe-area-inset-bottom, 0px);"></view>
			</template>
		</view>

		<!-- 批量修改定价弹窗 -->
		<view v-if="showBulkModal" class="bulk-modal-overlay" @click="hideBulkUpdateModal">
			<view class="bulk-modal" @click.stop>
				<view class="bulk-modal-header">
					<text class="bulk-modal-title">批量修改定价</text>
					<view class="bulk-modal-close" @click="hideBulkUpdateModal">×</view>
				</view>

				<view class="bulk-modal-content">
					<!-- 区域选择 -->
					<view class="bulk-section">
						<text class="bulk-section-title">选择区域</text>
						<view class="bulk-area-selector">
							<!-- 省份列表 -->
							<view v-for="province in groupedServiceAreas" :key="province.id" class="bulk-province-item">
								<view class="bulk-province-header" @click="toggleProvinceExpand(province.id)">
									<view class="province-checkbox-wrapper">
										<view class="area-checkbox"
											:class="{ checked: isProvinceSelected(province.id), indeterminate: isProvinceIndeterminate(province.id) }"
											@click.stop="toggleProvinceSelection(province.id)"></view>
										<text class="province-name">{{ province.name }}</text>
									</view>
									<view class="expand-icon" :class="{ expanded: expandedProvinces.includes(province.id) }">
										<text>▼</text>
									</view>
								</view>

								<!-- 城市和区县列表 -->
								<view v-if="expandedProvinces.includes(province.id)" class="bulk-cities-list">
									<view v-for="city in province.cities" :key="city.id" class="bulk-city-item">
										<view class="bulk-city-header" @click="toggleCityExpand(province.id, city.id)">
											<view class="city-checkbox-wrapper">
												<view class="area-checkbox"
													:class="{ checked: isCitySelected(province.id, city.id), indeterminate: isCityIndeterminate(province.id, city.id) }"
													@click.stop="toggleCitySelection(province.id, city.id)"></view>
												<text class="city-name">{{ city.name }}</text>
											</view>
											<view class="expand-icon" :class="{ expanded: expandedCities.includes(`${province.id}-${city.id}`) }">
												<text>▼</text>
											</view>
										</view>

										<!-- 区县列表 -->
										<view v-if="expandedCities.includes(`${province.id}-${city.id}`)" class="bulk-districts-list">
											<view v-for="district in city.districts" :key="district.id"
												class="bulk-district-item"
												:class="{ selected: selectedAreas.includes(district.district_id) }"
												@click="toggleAreaSelection(district.district_id)">
												<view class="area-checkbox" :class="{ checked: selectedAreas.includes(district.district_id) }"></view>
												<text class="district-name">{{ district.name }}</text>
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 品牌选择 -->
					<view class="bulk-section">
						<text class="bulk-section-title">品牌选择</text>
						<view class="bulk-brand-selection">
							<view class="bulk-brand-item" :class="{ active: bulkSettings.meituan }"
								@click="toggleBulkBrand('meituan')">
								<text class="bulk-brand-name">美团</text>
								<view class="bulk-brand-check" v-if="bulkSettings.meituan"></view>
							</view>
							<view class="bulk-brand-item" :class="{ active: bulkSettings.guaishou }"
								@click="toggleBulkBrand('guaishou')">
								<text class="bulk-brand-name">怪兽</text>
								<view class="bulk-brand-check" v-if="bulkSettings.guaishou"></view>
							</view>
							<view class="bulk-brand-item" :class="{ active: bulkSettings.jiedian }"
								@click="toggleBulkBrand('jiedian')">
								<text class="bulk-brand-name">街电</text>
								<view class="bulk-brand-check" v-if="bulkSettings.jiedian"></view>
							</view>
							<view class="bulk-brand-item" :class="{ active: bulkSettings.xiaodian }"
								@click="toggleBulkBrand('xiaodian')">
								<text class="bulk-brand-name">小电</text>
								<view class="bulk-brand-check" v-if="bulkSettings.xiaodian"></view>
							</view>
						</view>
					</view>

					<!-- 主项服务 -->
					<view class="bulk-section">
						<text class="bulk-section-title">主项服务 - {{ getBulkModuleTitle(currentModule) }}</text>

						<!-- 补宝服务设置 -->
						<template v-if="currentModule === 'bubao'">
							<view class="bulk-settings-grid">
								<view class="bulk-setting-item">
									<text class="bulk-setting-label">补宝基础设备数量</text>
									<input type="number" v-model="bulkSettings.bubao_base_device" class="bulk-setting-input" />
								</view>
								<view class="bulk-setting-item">
									<text class="bulk-setting-label">补宝基础设备费用（元）</text>
									<input type="text" v-model="bulkSettings.bubao_base_device_fee" class="bulk-setting-input"
										placeholder="数字/小数/负数" />
								</view>
								<view class="bulk-setting-item">
									<text class="bulk-setting-label">补宝额外设备数量</text>
									<input type="number" v-model="bulkSettings.bubao_extra_device" class="bulk-setting-input" />
								</view>
								<view class="bulk-setting-item">
									<text class="bulk-setting-label">补宝额外设备费用（元/个）</text>
									<input type="text" v-model="bulkSettings.bubao_extra_device_fee" class="bulk-setting-input"
										placeholder="数字/小数/负数" />
								</view>
							</view>
						</template>

						<!-- 离线异常服务设置 -->
						<template v-else-if="currentModule === 'offline_abnormal'">
							<!-- 离线异常 -->
							<view class="bulk-exception-group">
								<view class="bulk-exception-title">离线异常</view>
								<view class="bulk-settings-grid">
									<view class="bulk-setting-item">
										<text class="bulk-setting-label">基础设备数量</text>
										<view class="bulk-input-wrapper">
											<input type="number" v-model="bulkSettings.exception_offline_base_device" class="bulk-setting-input" />
											<text v-if="getLastSettingReference('exception_offline_base_device')" class="last-setting-reference">
												上次：{{ getLastSettingReference('exception_offline_base_device') }}
											</text>
										</view>
									</view>
									<view class="bulk-setting-item">
										<text class="bulk-setting-label">基础设备费用（元）</text>
										<view class="bulk-input-wrapper">
											<input type="text" v-model="bulkSettings.exception_offline_base_device_fee" class="bulk-setting-input"
												placeholder="数字/小数/负数" />
											<text v-if="getLastSettingReference('exception_offline_base_device_fee')" class="last-setting-reference">
												上次：{{ getLastSettingReference('exception_offline_base_device_fee') }}
											</text>
										</view>
									</view>
									<view class="bulk-setting-item">
										<text class="bulk-setting-label">额外设备数量（单位1）</text>
										<view class="bulk-input-wrapper">
											<input type="number" v-model="bulkSettings.exception_offline_extra_device" class="bulk-setting-input" />
											<text v-if="getLastSettingReference('exception_offline_extra_device')" class="last-setting-reference">
												上次：{{ getLastSettingReference('exception_offline_extra_device') }}
											</text>
										</view>
									</view>
									<view class="bulk-setting-item">
										<text class="bulk-setting-label">额外设备费用（元/个）</text>
										<view class="bulk-input-wrapper">
											<input type="text" v-model="bulkSettings.exception_offline_extra_device_fee" class="bulk-setting-input"
												placeholder="数字/小数/负数" />
											<text v-if="getLastSettingReference('exception_offline_extra_device_fee')" class="last-setting-reference">
												上次：{{ getLastSettingReference('exception_offline_extra_device_fee') }}
											</text>
										</view>
									</view>
								</view>
							</view>

							<!-- 收入异常 -->
							<view class="bulk-exception-group">
								<view class="bulk-exception-title">收入异常</view>
								<view class="bulk-settings-grid">
									<view class="bulk-setting-item">
										<text class="bulk-setting-label">基础设备数量</text>
										<view class="bulk-input-wrapper">
											<input type="number" v-model="bulkSettings.income_exception_base_device" class="bulk-setting-input" />
											<text v-if="getLastSettingReference('income_exception_base_device')" class="last-setting-reference">
												上次：{{ getLastSettingReference('income_exception_base_device') }}
											</text>
										</view>
									</view>
									<view class="bulk-setting-item">
										<text class="bulk-setting-label">基础设备费用（元）</text>
										<view class="bulk-input-wrapper">
											<input type="text" v-model="bulkSettings.income_exception_base_device_fee" class="bulk-setting-input"
												placeholder="数字/小数/负数" />
											<text v-if="getLastSettingReference('income_exception_base_device_fee')" class="last-setting-reference">
												上次：{{ getLastSettingReference('income_exception_base_device_fee') }}
											</text>
										</view>
									</view>
								</view>
							</view>

							<!-- 其他异常 -->
							<view class="bulk-exception-group">
								<view class="bulk-exception-title">其他异常</view>
								<view class="bulk-settings-grid">
									<view class="bulk-setting-item">
										<text class="bulk-setting-label">基础设备数量</text>
										<view class="bulk-input-wrapper">
											<input type="number" v-model="bulkSettings.other_exception_base_device" class="bulk-setting-input" />
											<text v-if="getLastSettingReference('other_exception_base_device')" class="last-setting-reference">
												上次：{{ getLastSettingReference('other_exception_base_device') }}
											</text>
										</view>
									</view>
									<view class="bulk-setting-item">
										<text class="bulk-setting-label">基础设备费用（元）</text>
										<view class="bulk-input-wrapper">
											<input type="text" v-model="bulkSettings.other_exception_base_device_fee" class="bulk-setting-input"
												placeholder="数字/小数/负数" />
											<text v-if="getLastSettingReference('other_exception_base_device_fee')" class="last-setting-reference">
												上次：{{ getLastSettingReference('other_exception_base_device_fee') }}
											</text>
										</view>
									</view>
								</view>
							</view>
						</template>

						<!-- 其他业务板块显示提示 -->
						<template v-else>
							<view class="bulk-under-development">
								<text class="bulk-development-text">该业务板块暂不支持批量修改定价</text>
							</view>
						</template>
					</view>

					<!-- 服务时效 -->
					<view class="bulk-section">
						<text class="bulk-section-title">服务时效</text>
						<view class="bulk-settings-grid">
							<view v-for="(time, index) in timeOptions" :key="index" class="bulk-setting-item">
								<text class="bulk-setting-label">{{time.hours}}小时内费用（元）</text>
								<input type="text" v-model="bulkSettings[`bubao_time_limit_${time.index}_fee`]"
									class="bulk-setting-input" placeholder="数字/小数/负数" />
							</view>
						</view>
					</view>

					<!-- 距离费用 -->
					<view class="bulk-section">
						<text class="bulk-section-title">距离费用</text>
						<view class="bulk-settings-grid">
							<view class="bulk-setting-item">
								<text class="bulk-setting-label">基础距离（公里）</text>
								<input type="number" v-model="bulkSettings.bubao_base_distance" class="bulk-setting-input" />
							</view>
							<view class="bulk-setting-item">
								<text class="bulk-setting-label">基础距离费用（元）</text>
								<input type="text" v-model="bulkSettings.bubao_base_distance_fee" class="bulk-setting-input"
									placeholder="数字/小数/负数" />
							</view>
							<view class="bulk-setting-item">
								<text class="bulk-setting-label">额外距离（公里）</text>
								<input type="number" v-model="bulkSettings.bubao_extra_distance" class="bulk-setting-input" />
							</view>
							<view class="bulk-setting-item">
								<text class="bulk-setting-label">额外距离费用（元/公里）</text>
								<input type="text" v-model="bulkSettings.bubao_extra_distance_fee" class="bulk-setting-input"
									placeholder="数字/小数/负数" />
							</view>
						</view>
					</view>
				</view>

				<view class="bulk-modal-footer">
					<button class="bulk-cancel-btn" @click="hideBulkUpdateModal">取消</button>
					<button class="bulk-confirm-btn" @click="confirmBulkUpdate">确认修改</button>
				</view>
				<!-- 弹窗底部安全区占位 -->
				<view style="height: env(safe-area-inset-bottom, 0px);"></view>
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
				currentProvider: '0', // 当前选择的服务商
				currentModule: 'bubao', // 当前选择的业务板块

				// 业务板块列表
				businessModules: [
					{ key: 'bubao', name: '补宝', status: 'available' },
					{ key: 'offline_abnormal', name: '离线异常', status: 'available' },
					{ key: 'installation', name: '装机', status: 'development' },
					{ key: 'removal', name: '撤机', status: 'development' },
					{ key: 'recycle', name: '回收坏宝', status: 'development' },
					{ key: 'delivery', name: '送装配件', status: 'development' },
					{ key: 'onsite', name: '上门服务', status: 'development' }
				],

				// 服务商列表
				serviceProviders: [{
					id: '0',
					name: '默认区域'
				}],

				// 按省份、市、区县分组的服务区域
				groupedServiceAreas: [],

				// 联级选择器状态
				selectedProvince: null, // 当前选中的省份ID
				selectedCity: null, // 当前选中的城市ID
				showSelector: false, // 是否显示选择器

				// 是否有分组数据
				hasGroupedData: false,

				// 时间选项（将在处理数据时动态生成）
				timeOptions: [],

				// 批量修改相关数据
				showBulkModal: false,
				selectedAreas: [],
				availableAreas: [],
				expandedProvinces: [],
				expandedCities: [],
				lastBulkSettings: null, // 上次批量设置，用于参考显示
				bulkSettings: {
					// 品牌设置
					meituan: false,
					guaishou: false,
					xiaodian: false,
					jiedian: false,
					// 主项服务设置 - 补宝
					bubao_base_device: '',
					bubao_base_device_fee: '',
					bubao_extra_device: '',
					bubao_extra_device_fee: '',
					// 异常服务设置 - 离线异常
					exception_offline_base_device: '',
					exception_offline_base_device_fee: '',
					exception_offline_extra_device: '',
					exception_offline_extra_device_fee: '',
					// 异常服务设置 - 收入异常
					income_exception_base_device: '',
					income_exception_base_device_fee: '',
					// 异常服务设置 - 其他异常
					other_exception_base_device: '',
					other_exception_base_device_fee: '',
					// 距离费用设置
					bubao_base_distance: '',
					bubao_base_distance_fee: '',
					bubao_extra_distance: '',
					bubao_extra_distance_fee: ''
					// 服务时效设置将动态添加
				},

				// 所有服务商的设置
				providerSettings: {
					'0': {
						// 基本设置
						min_time_limit: '30',
						max_nav_distance: '5',
						night_service: '0',

						// 品牌设置
						meituan: '1',
						guaishou: '1',
						xiaodian: '1',
						jiedian: '1',

						// 附加服务设置
						power_service: '1',
						wire_service: '1',

						// 服务时效设置
						bubao_time_limit_1: '1',
						bubao_time_limit_1_fee: '1',
						bubao_time_limit_2: '2',
						bubao_time_limit_2_fee: '2',
						bubao_time_limit_3: '3',
						bubao_time_limit_3_fee: '3',
						bubao_time_limit_4: '5',
						bubao_time_limit_4_fee: '5',
						bubao_time_limit_5: '7',
						bubao_time_limit_5_fee: '7',
						bubao_time_limit_6: '12',
						bubao_time_limit_6_fee: '12',
						bubao_time_limit_7: '24',
						bubao_time_limit_7_fee: '24',
						bubao_time_limit_8: '48',
						bubao_time_limit_8_fee: '48',
						bubao_time_limit_9: '72',
						bubao_time_limit_9_fee: '-2',
						bubao_time_limit_10: '0',
						bubao_time_limit_10_fee: '0',

						// 主项服务设置 - 补宝
						bubao_base_device: '1',
						bubao_base_device_fee: '5',
						bubao_extra_device: '1',
						bubao_extra_device_fee: '3',

						// 离线异常服务设置
						exception_offline_base_device: '1',
						exception_offline_base_device_fee: '10',
						exception_offline_extra_device: '1',
						exception_offline_extra_device_fee: '5',

						// 收入异常服务设置
						income_exception_base_device: '1',
						income_exception_base_device_fee: '15',
						income_exception_extra_device: '1',
						income_exception_extra_device_fee: '8',

						// 其他异常服务设置
						other_exception_base_device: '1',
						other_exception_base_device_fee: '20',
						other_exception_extre_device: '1',
						other_exception_extre_device_fee: '10',

						// 距离费用设置
						bubao_base_distance: '1',
						bubao_base_distance_fee: '0',
						bubao_extra_distance: '1',
						bubao_extra_distance_fee: '0',

						// 附加服务设置
						bubao_wire_base_device: '1',
						bubao_wire_base_fee: '0',
						bubao_wire_device_count: '1',
						bubao_wire_device_fee: '0',
						bubao_power_fee: '0',
						bubao_change_wire_base_fee: '15',
						bubao_change_wire_device_count: '1',
						bubao_change_wire_device_fee: '8',

						// 区域信息
						districtInfo: {
							district_id: 0,
							district_name: '默认区域',
							city_id: 0,
							city_name: '默认城市',
							province_id: 0,
							province_name: '默认省份'
						},

						// 时间选项
						timeOptions: [{
								index: 1,
								hours: 1,
								fee: 1
							},
							{
								index: 2,
								hours: 2,
								fee: 2
							},
							{
								index: 3,
								hours: 3,
								fee: 3
							},
							{
								index: 4,
								hours: 5,
								fee: 5
							},
							{
								index: 5,
								hours: 7,
								fee: 7
							},
							{
								index: 6,
								hours: 12,
								fee: 12
							},
							{
								index: 7,
								hours: 24,
								fee: 24
							},
							{
								index: 8,
								hours: 48,
								fee: 48
							},
							{
								index: 9,
								hours: 72,
								fee: -2
							},
							{
								index: 10,
								hours: 0,
								fee: 0
							}
						]
					}
				}
			}
		},
		computed: {
			// 当前服务商的设置
			currentSettings: {
				get() {
					// 如果没有当前服务商的设置，则使用默认设置
					if (!this.providerSettings[this.currentProvider]) {
						console.warn(`未找到服务商ID为${this.currentProvider}的设置，使用默认设置`);

						// 如果默认设置存在，返回默认设置
						if (this.providerSettings['0']) {
							return this.providerSettings['0'];
						}

						// 如果默认设置不存在，返回空对象
						return {
							// 品牌设置
							meituan: '0',
							guaishou: '0',
							xiaodian: '0',
							jiedian: '0'
						};
					}

					// 返回当前服务商的设置
					return this.providerSettings[this.currentProvider];
				},
				set(newValue) {
					// 确保当前服务商ID有效
					if (!this.currentProvider) {
						console.error('当前服务商ID无效，无法更新设置');
						return;
					}

					// 确保当前服务商的设置对象存在
					if (!this.providerSettings[this.currentProvider]) {
						console.log(`创建服务商ID为${this.currentProvider}的设置对象`);
						this.providerSettings[this.currentProvider] = {};
					}

					// 更新当前服务商的设置
					console.log(`更新服务商ID为${this.currentProvider}的设置`);
					Object.assign(this.providerSettings[this.currentProvider], newValue);
				}
			},

			// 判断当前业务板块是否为待开发状态
			isCurrentModuleDevelopment() {
				const currentModuleInfo = this.businessModules.find(module => module.key === this.currentModule);
				return currentModuleInfo && currentModuleInfo.status === 'development';
			}
		},
		onShow() {
			// 计算导航栏高度
			const systemInfo = uni.getSystemInfoSync();
			// 状态栏高度
			const statusBarHeight = systemInfo.statusBarHeight || 0;
			// 导航栏高度（根据不同平台可能有所不同）
			const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48;
			// 设置导航栏占位高度
			this.navBarHeight = statusBarHeight + navBarHeight;

			// 获取设置
			this.getSettings();
		},
		methods: {
			// 切换业务板块
			switchModule(moduleKey) {
				this.currentModule = moduleKey;
				console.log('切换到业务板块:', moduleKey);
			},

			// 获取业务板块状态文本
			getModuleStatusText(status) {
				const statusMap = {
					'available': '可用',
					'development': '待开发'
				};
				return statusMap[status] || status;
			},

			// 获取业务板块服务标题
			getModuleServiceTitle(moduleKey) {
				const titleMap = {
					'bubao': '补宝服务设置',
					'offline_abnormal': '离线异常服务设置',
					'installation': '装机服务设置',
					'removal': '撤机服务设置',
					'recycle': '回收坏宝服务设置',
					'delivery': '送装配件服务设置',
					'onsite': '上门服务设置'
				};
				return titleMap[moduleKey] || '服务设置';
			},

			// 获取批量修改弹窗中的业务板块标题
			getBulkModuleTitle(moduleKey) {
				const titleMap = {
					'bubao': '补宝',
					'offline_abnormal': '离线异常',
					'installation': '装机',
					'removal': '撤机',
					'recycle': '回收坏宝',
					'delivery': '送装配件',
					'onsite': '上门服务'
				};
				return titleMap[moduleKey] || '未知';
			},

			// 切换服务商
			switchProvider(providerId) {
				// 更新当前选中的服务商
				this.currentProvider = providerId;

				// 更新时间选项
				if (this.providerSettings[providerId]) {
					// 更新时间选项
					if (this.providerSettings[providerId].timeOptions) {
						this.timeOptions = [...this.providerSettings[providerId].timeOptions];
					} else {
						this.timeOptions = [];
					}
				} else {
					// 如果没有该服务商的设置，使用空数组
					this.timeOptions = [];
				}

				console.log('切换到服务区域:', providerId, '时间选项:', this.timeOptions);

				// 查询选中区域的详细价格和品牌设置
				if (providerId !== '0') {
					this.fetchZoneDetailInfo(providerId);
				}
			},

			// 显示/隐藏区域选择器
			showAreaSelector() {
				this.showSelector = !this.showSelector;
			},

			// 重置选择
			resetSelection() {
				this.selectedProvince = null;
				this.selectedCity = null;
				this.showSelector = true;
			},

			// 选择省份
			selectProvince(provinceId) {
				if (this.selectedProvince === provinceId) {
					// 如果点击当前选中的省份，则返回省份列表
					this.selectedProvince = null;
					this.selectedCity = null;
				} else {
					this.selectedProvince = provinceId;
					this.selectedCity = null;
				}
			},

			// 选择城市
			selectCity(provinceId, cityId) {
				if (this.selectedCity === cityId) {
					// 如果点击当前选中的城市，则返回城市列表
					this.selectedCity = null;
				} else {
					this.selectedCity = cityId;
				}
			},

			// 选择区县
			selectDistrict(districtId) {
				console.log(districtId,"ffd房东是")
				// 更新当前选中的服务商
				this.currentProvider = districtId;

				// 更新时间选项
				if (this.providerSettings[districtId]) {
					if (this.providerSettings[districtId].timeOptions) {
						this.timeOptions = [...this.providerSettings[districtId].timeOptions];
					} else {
						this.timeOptions = [];
					}
				} else {
					this.timeOptions = [];
				}

				// 记录选择
				console.log('选择区县:', districtId, '时间选项:', this.timeOptions);

				// 关闭选择器
				this.showSelector = false;

				// 查询选中区域的详细价格和品牌设置
				if (districtId !== '0') {
					this.fetchZoneDetailInfo(districtId);
				}
			},

			// 清除选择
			clearSelection() {
				this.switchProvider('0');
				this.selectedProvince = null;
				this.selectedCity = null;
			},

			// 获取省份名称
			getProvinceName(provinceId) {
				const province = this.groupedServiceAreas.find(p => p.id === provinceId);
				return province ? province.name : '';
			},

			// 获取城市名称
			getCityName(provinceId, cityId) {
				const province = this.groupedServiceAreas.find(p => p.id === provinceId);
				if (!province) return '';

				const city = province.cities.find(c => c.id === cityId);
				return city ? city.name : '';
			},

			// 获取省份下的城市列表
			getCities(provinceId) {
				const province = this.groupedServiceAreas.find(p => p.id === provinceId);
				return province ? province.cities : [];
			},

			// 获取城市下的区县列表
			getDistricts(provinceId, cityId) {
				const province = this.groupedServiceAreas.find(p => p.id === provinceId);
				if (!province) return [];

				const city = province.cities.find(c => c.id === cityId);
				return city ? city.districts : [];
			},

			// 获取当前选中的区域名称
			getSelectedAreaName() {
				if (this.currentProvider === '0') return '默认区域';

				// 遍历查找当前选中的区域
				for (const province of this.groupedServiceAreas) {
					for (const city of province.cities) {
						const district = city.districts.find(d => d.id === this.currentProvider);
						if (district) {
							return `${province.name} > ${city.name} > ${district.name}`;
						}
					}
				}

				// 如果在分组数据中找不到，则在原始列表中查找
				const provider = this.serviceProviders.find(p => p.id === this.currentProvider);
				return provider ? provider.name : '';
			},

			// 处理区域详细信息
			processZoneInfo(data) {
				console.log('处理区域详细信息:', data);

				if (!data || typeof data !== 'object') {
					console.warn('区域详细信息数据无效');
					return;
				}

				// 更新当前选中区域的价格设置
				if (this.currentProvider && this.providerSettings[this.currentProvider]) {
					const currentSettings = this.providerSettings[this.currentProvider];

					// 更新基本设置
					if (data.min_time_limit !== undefined) {
						currentSettings.min_time_limit = data.min_time_limit.toString();
					}
					if (data.max_nav_distance !== undefined) {
						currentSettings.max_nav_distance = data.max_nav_distance.toString();
					}
					if (data.night_service !== undefined) {
						currentSettings.night_service = data.night_service ? '1' : '0';
					}

					// 更新品牌设置
					if (data.meituan !== undefined) {
						currentSettings.meituan = data.meituan ? '1' : '0';
					}
					if (data.guaishou !== undefined) {
						currentSettings.guaishou = data.guaishou ? '1' : '0';
					}
					if (data.xiaodian !== undefined) {
						currentSettings.xiaodian = data.xiaodian ? '1' : '0';
					}
					if (data.jiedian !== undefined) {
						currentSettings.jiedian = data.jiedian ? '1' : '0';
					}

					// 更新价格设置 - 使用 data.prices 对象
					if (data.prices && typeof data.prices === 'object') {
						this.updatePriceSettings(currentSettings, data.prices);
						// 更新时间选项 - 使用 data.prices 对象
						this.updateTimeOptions(currentSettings, data.prices);
					} else {
						console.warn('prices 数据不存在或格式错误:', data.prices);
					}

					// 更新区域信息
					if (data.district_name) {
						currentSettings.districtInfo = {
							district_id: data.district_id,
							district_name: data.district_name,
							city_id: data.city_id,
							city_name: data.city_name,
							province_id: data.province_id,
							province_name: data.province_name
						};
					}

					// 保存服务列表
					if (data.service_list && Array.isArray(data.service_list)) {
						currentSettings.serviceList = data.service_list;
					}

					// 保存详细信息
					currentSettings.zoneInfo = data;

					console.log('区域详细信息已更新到当前设置');
					console.log('当前设置的时间费用:', {
						bubao_time_limit_1_fee: currentSettings.bubao_time_limit_1_fee,
						bubao_time_limit_2_fee: currentSettings.bubao_time_limit_2_fee,
						bubao_time_limit_3_fee: currentSettings.bubao_time_limit_3_fee
					});

					// 强制更新页面渲染
					this.$nextTick(() => {
						this.$forceUpdate();
					});
				}
			},

			// 更新价格设置
			updatePriceSettings(settings, pricesData) {
				// console.log('更新价格设置，prices数据:', pricesData);

				// 更新主项服务设置 - 补宝
				if (pricesData.bubao_base_device !== undefined) {
					settings.bubao_base_device = pricesData.bubao_base_device.toString();
				}
				if (pricesData.bubao_base_device_fee !== undefined) {
					settings.bubao_base_device_fee = parseFloat(pricesData.bubao_base_device_fee).toString();
				}
				if (pricesData.bubao_extra_device !== undefined) {
					settings.bubao_extra_device = pricesData.bubao_extra_device.toString();
				}
				if (pricesData.bubao_extra_device_fee !== undefined) {
					settings.bubao_extra_device_fee = parseFloat(pricesData.bubao_extra_device_fee).toString();
				}

				// 更新离线异常服务设置
				if (pricesData.exception_offline_base_device !== undefined) {
					settings.exception_offline_base_device = pricesData.exception_offline_base_device.toString();
				}
				if (pricesData.exception_offline_base_device_fee !== undefined) {
					settings.exception_offline_base_device_fee = parseFloat(pricesData.exception_offline_base_device_fee).toString();
				}
				if (pricesData.exception_offline_extra_device !== undefined) {
					settings.exception_offline_extra_device = pricesData.exception_offline_extra_device.toString();
				}
				if (pricesData.exception_offline_extra_device_fee !== undefined) {
					settings.exception_offline_extra_device_fee = parseFloat(pricesData.exception_offline_extra_device_fee).toString();
				}

				// 更新收入异常服务设置
				if (pricesData.income_exception_base_device !== undefined) {
					settings.income_exception_base_device = pricesData.income_exception_base_device.toString();
				}
				if (pricesData.income_exception_base_device_fee !== undefined) {
					settings.income_exception_base_device_fee = parseFloat(pricesData.income_exception_base_device_fee).toString();
				}
				if (pricesData.income_exception_extra_device !== undefined) {
					settings.income_exception_extra_device = pricesData.income_exception_extra_device.toString();
				}
				if (pricesData.income_exception_extra_device_fee !== undefined) {
					settings.income_exception_extra_device_fee = parseFloat(pricesData.income_exception_extra_device_fee).toString();
				}

				// 更新其他异常服务设置
				if (pricesData.other_exception_base_device !== undefined) {
					settings.other_exception_base_device = pricesData.other_exception_base_device.toString();
				}
				if (pricesData.other_exception_base_device_fee !== undefined) {
					settings.other_exception_base_device_fee = parseFloat(pricesData.other_exception_base_device_fee).toString();
				}
				if (pricesData.other_exception_extre_device !== undefined) {
					settings.other_exception_extre_device = pricesData.other_exception_extre_device.toString();
				}
				if (pricesData.other_exception_extre_device_fee !== undefined) {
					settings.other_exception_extre_device_fee = parseFloat(pricesData.other_exception_extre_device_fee).toString();
				}

				// 更新距离设置
				if (pricesData.bubao_base_distance !== undefined) {
					settings.bubao_base_distance = pricesData.bubao_base_distance.toString();
				}
				if (pricesData.bubao_base_distance_fee !== undefined) {
					settings.bubao_base_distance_fee = parseFloat(pricesData.bubao_base_distance_fee).toString();
				}
				if (pricesData.bubao_extra_distance !== undefined) {
					settings.bubao_extra_distance = pricesData.bubao_extra_distance.toString();
				}
				if (pricesData.bubao_extra_distance_fee !== undefined) {
					settings.bubao_extra_distance_fee = parseFloat(pricesData.bubao_extra_distance_fee).toString();
				}

				// 更新通电服务设置
				if (pricesData.bubao_power_base_device !== undefined) {
					settings.bubao_power_base_device = Math.max(1, parseInt(pricesData.bubao_power_base_device)).toString();
				}
				if (pricesData.bubao_power_fee !== undefined) {
					settings.bubao_power_fee = parseFloat(pricesData.bubao_power_fee).toString();
				}
				if (pricesData.bubao_power_device_count !== undefined) {
					settings.bubao_power_device_count = Math.max(1, parseInt(pricesData.bubao_power_device_count)).toString();
				}
				if (pricesData.bubao_power_device_fee !== undefined) {
					settings.bubao_power_device_fee = parseFloat(pricesData.bubao_power_device_fee).toString();
				}

				// 更新电源线服务设置
				if (pricesData.bubao_wire_base_device !== undefined) {
					settings.bubao_wire_base_device = Math.max(1, parseInt(pricesData.bubao_wire_base_device)).toString();
				}
				if (pricesData.bubao_wire_base_fee !== undefined) {
					settings.bubao_wire_base_fee = parseFloat(pricesData.bubao_wire_base_fee).toString();
				}
				if (pricesData.bubao_wire_device_count !== undefined) {
					settings.bubao_wire_device_count = Math.max(1, parseInt(pricesData.bubao_wire_device_count)).toString();
				}
				if (pricesData.bubao_wire_device_fee !== undefined) {
					settings.bubao_wire_device_fee = parseFloat(pricesData.bubao_wire_device_fee).toString();
				}

				// console.log('价格设置已更新，当前设置:', {
				// 	bubao_base_device: settings.bubao_base_device,
				// 	bubao_base_device_fee: settings.bubao_base_device_fee,
				// 	bubao_power_fee: settings.bubao_power_fee,
				// 	bubao_wire_base_fee: settings.bubao_wire_base_fee
				// });
			},

			// 更新时间选项
			updateTimeOptions(settings, pricesData) {
				// console.log('更新时间选项，prices数据:', pricesData);
				const timeOptions = [];

				// 更新时间限制和费用
				for (let i = 1; i <= 10; i++) {
					const timeField = `bubao_time_limit_${i}`;
					const feeField = `${timeField}_fee`;

					if (pricesData[timeField] !== undefined) {
						settings[timeField] = pricesData[timeField].toString();

						// 只添加有效的时间选项（时间大于0）
						const hours = parseInt(pricesData[timeField]);
						if (hours > 0) {
							timeOptions.push({
								index: i,
								hours: hours,
								fee: pricesData[feeField] !== undefined ? parseFloat(pricesData[feeField]) : 0
							});
						}
					}

					if (pricesData[feeField] !== undefined) {
						settings[feeField] = parseFloat(pricesData[feeField]).toString();
					}
				}

				// 按小时数排序
				timeOptions.sort((a, b) => a.hours - b.hours);

				// 保存到设置中
				settings.timeOptions = timeOptions;

				// 更新当前页面的时间选项
				if (this.currentProvider && this.providerSettings[this.currentProvider] === settings) {
					this.timeOptions = [...timeOptions];

					// 强制更新Vue的响应式数据
					this.$forceUpdate();
				}

				// console.log('时间选项已更新:', timeOptions);
				// console.log('时间费用字段已更新:', {
				// 	bubao_time_limit_1_fee: settings.bubao_time_limit_1_fee,
				// 	bubao_time_limit_2_fee: settings.bubao_time_limit_2_fee,
				// 	bubao_time_limit_3_fee: settings.bubao_time_limit_3_fee
				// });

				// 调试：检查当前设置对象
				// console.log('当前设置对象完整内容:', JSON.stringify(settings, null, 2));
			},

			// 调试方法：检查时间费用数据
			// debugTimeFees() {
			// 	console.log('=== 调试时间费用数据 ===');
			// 	console.log('当前服务商ID:', this.currentProvider);
			// 	console.log('时间选项数组:', this.timeOptions);
			// 	console.log('当前设置对象:', this.currentSettings);

			// 	// 检查每个时间费用字段
			// 	for (let i = 1; i <= 10; i++) {
			// 		const feeField = `bubao_time_limit_${i}_fee`;
			// 		console.log(`${feeField}:`, this.currentSettings[feeField]);
			// 	}
			// },

			// 获取设置
			getSettings() {
				uni.showLoading({
					title: '加载中...'
				});

				// 调用接口获取设置数据
				this.fetchServiceSettings();
			},

			// 从接口获取服务设置数据
			async fetchServiceSettings() {
				try {
					// 获取骑手用户信息
					const riderUserInfo = uni.getStorageSync('riderUserInfo') || {};

					// 确保获取到完整的用户信息
					console.log('获取到的用户信息:', riderUserInfo);

					// 获取用户ID和电话号码
					const userId = riderUserInfo.service_member_id || riderUserInfo.id || '';
					const userPhone = riderUserInfo.phone_number || riderUserInfo.phone || '';

					// 计算签名
					const signStr = `service_member_id=${userId}&phone_number=${userPhone}`;
					const sign = md5(signStr);

					console.log('使用的用户ID:', userId, '电话:', userPhone);

					// 准备请求参数
					const params = {
						service_member_id: userId,
						service_provider_id: 1,
						sign: 'chongchong' // 使用固定签名
					};

					// 使用$request发起POST请求
					console.log('请求service/group/zones接口参数:', params);
					const res = await this.$request('service/group/zones', params, 'POST');

					// 详细记录接口返回的数据结构
					// console.log('接口返回的原始数据:', res);
					// if (res && res.data) {
					// 	console.log('res.data类型:', typeof res.data);

					// 	// 检查是否包含service_zone_id
					// 	if (Array.isArray(res.data)) {
					// 		res.data.forEach((zone, index) => {
					// 			if (zone.prices && zone.prices.service_zone_id) {
					// 				console.log(`区域${index} - prices.service_zone_id:`, zone.prices.service_zone_id);
					// 			} else if (zone.service_zone_id) {
					// 				console.log(`区域${index} - service_zone_id:`, zone.service_zone_id);
					// 			} else {
					// 				console.log(`区域${index} - 未找到service_zone_id`);
					// 			}
					// 		});
					// 	} else if (res.data.service_zones && Array.isArray(res.data.service_zones)) {
					// 		res.data.service_zones.forEach((zone, index) => {
					// 			if (zone.prices && zone.prices.service_zone_id) {
					// 				console.log(`区域${index} - prices.service_zone_id:`, zone.prices.service_zone_id);
					// 			} else if (zone.service_zone_id) {
					// 				console.log(`区域${index} - service_zone_id:`, zone.service_zone_id);
					// 			} else {
					// 				console.log(`区域${index} - 未找到service_zone_id`);
					// 			}
					// 		});
					// 	}
					// }

					if (res && res.status === 'success') {
						// 请求成功，处理返回的数据
						this.processSettingsData(res.data);
					} else {
						// 请求失败，显示错误信息
						uni.showToast({
							title: res.msg || '获取设置失败',
							icon: 'none'
						});

						// 使用默认设置
						this.initDefaultSettings();
					}
				} catch (err) {
					console.error('获取服务设置失败:', err);
					uni.showToast({
						title: '网络请求失败，请检查网络',
						icon: 'none'
					});

					// 使用默认设置
					this.initDefaultSettings();
				} finally {
					uni.hideLoading();
				}
			},

			// 处理接口返回的设置数据
			processSettingsData(data) {
				console.log('开始处理数据:', data);

				// 获取service_zones数组
				let serviceZones = [];

				if (data && data.service_zones && Array.isArray(data.service_zones)) {
					// 标准格式：data.service_zones是数组
					console.log('使用标准格式：data.service_zones数组');
					serviceZones = data.service_zones;
				} else if (Array.isArray(data)) {
					// 如果data本身就是数组，直接使用
					console.log('数据本身是数组，直接使用');
					serviceZones = data;
				} else {
					console.error('无法获取服务区域数组:', data);
					// 初始化默认设置
					this.initDefaultSettings();
					return;
				}

				if (serviceZones.length === 0) {
					console.warn('服务区域数组为空，使用默认设置');
					this.initDefaultSettings();
					return;
				}

				// console.log(`找到${serviceZones.length}个服务商:`, serviceZones);

				// 服务商设置映射
				const providerSettings = {};

				// 遍历服务区域
				serviceZones.forEach((zone) => {
					if (!zone || typeof zone !== 'object') {
						// console.warn('跳过无效的服务区域:', zone);
						return;
					}

					// 使用 zone.id 作为服务商ID，这个 id 就是正确的 service_zone_id
					const providerId = zone.id;
					// console.log(`区域信息 - district_id: ${zone.district_id}, id: ${zone.id}, 使用providerId: ${providerId}`);

					// 保存区域信息
					const districtInfo = {
						district_id: zone.district_id,
						district_name: zone.district_name || '未知区域',
						city_id: zone.city_id,
						city_name: zone.city_name || '未知城市',
						province_id: zone.province_id,
						province_name: zone.province_name || '未知省份'
					};

					// 创建默认设置模板
					const defaultSettings = {
						// 基本设置
						min_time_limit: '30',
						max_nav_distance: '5',
						night_service: '0',

						// 品牌设置
						meituan: '0',
						guaishou: '0',
						xiaodian: '0',
						jiedian: '0',

						// 附加服务
						power_service: '0',
						wire_service: '0'
					};

					// 创建服务商设置
					if (!providerSettings[providerId]) {
						providerSettings[providerId] = JSON.parse(JSON.stringify(defaultSettings));
					}

					// 获取设置对象
					const settings = providerSettings[providerId];

					// 保存区域信息
					settings.districtInfo = districtInfo;

					// service_zone_id 就是区县的 id，即 providerId
					settings.service_zone_id = providerId;
					// console.log(`保存区县ID作为service_zone_id: ${providerId}`);

					// 打印完整的区域信息，方便调试
					// console.log('区域完整信息:', JSON.stringify({
					// 	providerId,
					// 	district_id: zone.district_id,
					// 	zone_id: zone.id,
					// 	service_zone_id: settings.service_zone_id
					// }));

					// 更新基本设置
					if (zone.min_time_limit !== undefined) settings.min_time_limit = zone.min_time_limit
						.toString();
					if (zone.max_nav_distance !== undefined) settings.max_nav_distance = zone.max_nav_distance
						.toString();
					if (zone.night_service !== undefined) settings.night_service = zone.night_service ? '1' : '0';

					// 更新品牌设置
					if (zone.meituan !== undefined) settings.meituan = zone.meituan ? '1' : '0';
					if (zone.guaishou !== undefined) settings.guaishou = zone.guaishou ? '1' : '0';
					if (zone.xiaodian !== undefined) settings.xiaodian = zone.xiaodian ? '1' : '0';
					if (zone.jiedian !== undefined) settings.jiedian = zone.jiedian ? '1' : '0';

					// 处理价格信息
					let prices = null;

					if (zone.prices && typeof zone.prices === 'object') {
						// 如果zone.prices是对象，直接使用
						prices = zone.prices;
					} else if (zone.prices_info && typeof zone.prices_info === 'object') {
						// 如果zone.prices_info是对象，使用它
						prices = zone.prices_info;
					} else {
						// 检查zone本身是否包含价格信息
						const hasPriceFields = [
							'bubao_time_limit_1', 'bubao_time_limit_1_fee',
							'bubao_base_distance', 'bubao_base_distance_fee'
						].some(field => zone[field] !== undefined);

						if (hasPriceFields) {
							// 如果zone本身包含价格字段，使用zone作为prices
							prices = zone;
						}
					}

					if (prices) {
						// 收集时间选项
						const timeOptions = [];

						// 更新时间限制和费用
						for (let i = 1; i <= 10; i++) {
							const timeField = `bubao_time_limit_${i}`;
							const feeField = `${timeField}_fee`;

							if (prices[timeField] !== undefined) {
								settings[timeField] = prices[timeField].toString();

								// 只添加有效的时间选项（时间大于0）
								const hours = parseInt(prices[timeField]);
								if (hours > 0) {
									timeOptions.push({
										index: i,
										hours: hours,
										fee: prices[feeField] !== undefined ? parseFloat(prices[feeField]) : 0
									});
								}
							}

							if (prices[feeField] !== undefined) {
								settings[feeField] = parseFloat(prices[feeField]).toString();
							}
						}

						// 按小时数排序
						timeOptions.sort((a, b) => a.hours - b.hours);

						// 保存到设置中
						settings.timeOptions = timeOptions;

						// 更新距离设置
						if (prices.bubao_base_distance !== undefined) {
							settings.bubao_base_distance = prices.bubao_base_distance.toString();
						}
						if (prices.bubao_base_distance_fee !== undefined) {
							settings.bubao_base_distance_fee = parseFloat(prices.bubao_base_distance_fee).toString();
						}
						if (prices.bubao_extra_distance !== undefined) {
							settings.bubao_extra_distance = prices.bubao_extra_distance.toString();
						}
						if (prices.bubao_extra_distance_fee !== undefined) {
							settings.bubao_extra_distance_fee = parseFloat(prices.bubao_extra_distance_fee).toString();
						}

						// 更新设备设置 - 补宝
						if (prices.bubao_base_device !== undefined) {
							settings.bubao_base_device = prices.bubao_base_device.toString();
						}
						if (prices.bubao_base_device_fee !== undefined) {
							settings.bubao_base_device_fee = parseFloat(prices.bubao_base_device_fee).toString();
						}
						if (prices.bubao_extra_device !== undefined) {
							settings.bubao_extra_device = prices.bubao_extra_device.toString();
						}
						if (prices.bubao_extra_device_fee !== undefined) {
							settings.bubao_extra_device_fee = parseFloat(prices.bubao_extra_device_fee).toString();
						}

						// 更新异常服务设置 - 离线异常
						if (prices.exception_offline_base_device !== undefined) {
							settings.exception_offline_base_device = prices.exception_offline_base_device.toString();
						}
						if (prices.exception_offline_base_device_fee !== undefined) {
							settings.exception_offline_base_device_fee = parseFloat(prices.exception_offline_base_device_fee).toString();
						}
						if (prices.exception_offline_extra_device !== undefined) {
							settings.exception_offline_extra_device = prices.exception_offline_extra_device.toString();
						}
						if (prices.exception_offline_extra_device_fee !== undefined) {
							settings.exception_offline_extra_device_fee = parseFloat(prices.exception_offline_extra_device_fee).toString();
						}

						// 更新异常服务设置 - 收入异常
						if (prices.income_exception_base_device !== undefined) {
							settings.income_exception_base_device = prices.income_exception_base_device.toString();
						}
						if (prices.income_exception_base_device_fee !== undefined) {
							settings.income_exception_base_device_fee = parseFloat(prices.income_exception_base_device_fee).toString();
						}
						if (prices.income_exception_extra_device !== undefined) {
							settings.income_exception_extra_device = prices.income_exception_extra_device.toString();
						}
						if (prices.income_exception_extra_device_fee !== undefined) {
							settings.income_exception_extra_device_fee = parseFloat(prices.income_exception_extra_device_fee).toString();
						}

						// 更新异常服务设置 - 其他异常
						if (prices.other_exception_base_device !== undefined) {
							settings.other_exception_base_device = prices.other_exception_base_device.toString();
						}
						if (prices.other_exception_base_device_fee !== undefined) {
							settings.other_exception_base_device_fee = parseFloat(prices.other_exception_base_device_fee).toString();
						}
						if (prices.other_exception_extre_device !== undefined) {
							settings.other_exception_extre_device = prices.other_exception_extre_device.toString();
						}
						if (prices.other_exception_extre_device_fee !== undefined) {
							settings.other_exception_extre_device_fee = parseFloat(prices.other_exception_extre_device_fee).toString();
						}

						// 处理通电服务设置
						settings.bubao_power_base_device = prices.bubao_power_base_device || prices.bubao_power_base_device === 0 ? Math.max(1, parseInt(prices.bubao_power_base_device)) : 1;
						settings.bubao_power_fee = prices.bubao_power_fee || prices.bubao_power_fee === 0 ? parseFloat(prices.bubao_power_fee) : 0;
						settings.bubao_power_device_count = prices.bubao_power_device_count || prices.bubao_power_device_count === 0 ? Math.max(1, parseInt(prices.bubao_power_device_count)) : 1;
						settings.bubao_power_device_fee = prices.bubao_power_device_fee || prices.bubao_power_device_fee === 0 ? parseFloat(prices.bubao_power_device_fee) : 0;

						// 处理电源线服务设置
						settings.bubao_wire_base_device = prices.bubao_wire_base_device || prices.bubao_wire_base_device === 0 ? Math.max(1, parseInt(prices.bubao_wire_base_device)) : 1;
						settings.bubao_wire_base_fee = prices.bubao_wire_base_fee || prices.bubao_wire_base_fee === 0 ? parseFloat(prices.bubao_wire_base_fee) : 0;
						settings.bubao_wire_device_count = prices.bubao_wire_device_count || prices.bubao_wire_device_count === 0 ? Math.max(1, parseInt(prices.bubao_wire_device_count)) : 1;
						settings.bubao_wire_device_fee = prices.bubao_wire_device_fee || prices.bubao_wire_device_fee === 0 ? parseFloat(prices.bubao_wire_device_fee) : 0;

						// 设置附加服务开关状态
						settings.power_service = prices.bubao_power_fee && parseFloat(prices.bubao_power_fee) > 0 ?
							'1' : '0';
						settings.wire_service = prices.bubao_wire_base_fee && parseFloat(prices
							.bubao_wire_base_fee) > 0 ? '1' : '0';
					}

					// 存储服务商信息
					if (zone.info) {
						settings.providerInfo = zone.info;
					}

					// 存储可用服务列表
					if (zone.service_list) {
						settings.serviceList = zone.service_list;
					}
				});

				// 更新设置
				this.providerSettings = {
					...this.providerSettings,
					...providerSettings
				};

				// 保存所有服务区域的设置
				const allProviderIds = Object.keys(providerSettings);
				// console.log('所有服务区域IDs:', allProviderIds);

				// 更新服务商列表
				this.updateServiceProviders(allProviderIds);

				// 如果有服务商，自动选择第一个并初始化时间选项
				if (allProviderIds.length > 0) {
					const firstProviderId = allProviderIds[0];
					// console.log('自动选择第一个区县:', firstProviderId);

					// 直接设置当前选中的服务商，而不是调用switchProvider
					this.currentProvider = firstProviderId;

					// 更新时间选项
					if (this.providerSettings[firstProviderId] && this.providerSettings[firstProviderId].timeOptions) {
						this.timeOptions = [...this.providerSettings[firstProviderId].timeOptions];
					} else {
						this.timeOptions = [];
					}

					// 查询当前选中区域的详细价格信息
					this.fetchZoneDetailInfo(firstProviderId);
				} else {
					console.warn('没有找到可用的区县');
					this.currentProvider = '0';
					this.timeOptions = [];
				}
			},

			// 查询区域详细信息
			async fetchZoneDetailInfo(providerId) {
				try {
					// 获取用户信息
					const riderUserInfo = uni.getStorageSync('riderUserInfo') || {};
					const userId = riderUserInfo.service_member_id || riderUserInfo.id || '';

					// 获取当前选中区域的service_zone_id
					// service_zone_id 应该是 service/group/zones 接口返回的每个区县的 id 字段
					let serviceZoneId = parseInt(providerId); // 直接使用区县的 id

					console.log(`使用区县ID作为service_zone_id: ${serviceZoneId}`);

					// 准备请求参数
					const params = {
						service_member_id: userId,
						service_zone_id: serviceZoneId,
						sign: 'chongchong'
					};

					// console.log('查询区域详细信息参数:', params);
					// console.log('当前选中区域设置:', this.providerSettings[providerId]);

					// 调用接口
					const res = await this.$request('service/group/zone/info', params, 'POST');

					// console.log('区域详细信息接口返回:', res);

					if (res) {
						if (res.status === 'success' || res.code === 200) {
							// 处理区域详细信息
							this.processZoneInfo(res.data);
							console.log('区域详细信息查询成功');
						} else {
							console.warn('查询区域详细信息失败:', res.msg || res.message || '未知错误');
						}
					} else {
						console.warn('区域详细信息接口无返回数据');
					}
				} catch (error) {
					console.error('查询区域详细信息网络错误:', error);
				}
			},

			// 更新服务商列表
			updateServiceProviders(providerIds) {
				// console.log("服务区域IDs:", providerIds);
				// 创建服务商列表（不再包含默认设置）
				const providers = [];

				// 用于按省份、市、区县分组的数据结构
				const provinceMap = new Map(); // 省份映射: provinceId -> province对象

				// 添加接口返回的服务商
				providerIds.forEach(id => {
					// 获取服务商信息
					const settings = this.providerSettings[id];
					const info = settings && settings.providerInfo;

					// 优先使用区域名称
					let name = `服务区域${providers.length}`;

					// 区域信息
					let districtInfo = null;

					// 如果有区域信息，使用区域名称
					if (settings.districtInfo) {
						districtInfo = settings.districtInfo;
						const district = settings.districtInfo;
						if (district.district_name && district.city_name) {
							name = `${district.city_name} ${district.district_name}`;
						} else if (district.district_name) {
							name = district.district_name;
						} else if (district.city_name) {
							name = district.city_name;
						}
					}
					// 如果没有区域信息，尝试使用服务商信息
					else if (info) {
						if (info.company_name) {
							name = info.company_name;
						} else if (info.contact_person) {
							name = `${info.contact_person}的服务区域`;
						}
					}

					// 添加到服务商列表
					providers.push({
						id: id,
						name: name,
						info: info || {}
					});

					// 如果有区域信息，添加到分组数据中
					if (districtInfo) {
						const { province_id, province_name, city_id, city_name, district_id, district_name } = districtInfo;

						// 确保ID是字符串类型
						const provinceId = String(province_id);
						const cityId = String(city_id);
						const realDistrictId = String(district_id); // 使用真正的district_id

						// 如果省份不存在，创建省份
						if (!provinceMap.has(provinceId)) {
							provinceMap.set(provinceId, {
								id: provinceId,
								name: province_name || '未知省份',
								cities: new Map() // 城市映射: cityId -> city对象
							});
						}

						const province = provinceMap.get(provinceId);

						// 如果城市不存在，创建城市
						if (!province.cities.has(cityId)) {
							province.cities.set(cityId, {
								id: cityId,
								name: city_name || '未知城市',
								districts: [] // 区县列表
							});
						}

						const city = province.cities.get(cityId);

						// 添加区县
						const districtObj = {
							id: String(id), // 使用服务商ID（即zone.id）用于页面操作
							district_id: realDistrictId, // 使用真正的district_id用于API调用
							name: district_name || name,
							info: info || {}
						};
						city.districts.push(districtObj);
					}
				});

				// 转换Map为数组
				const groupedAreas = [];
				provinceMap.forEach(province => {
					const citiesArray = [];
					province.cities.forEach(city => {
						citiesArray.push({
							...city,
							districts: city.districts
						});
					});

					groupedAreas.push({
						...province,
						cities: citiesArray
					});
				});

				// 更新数据
				this.serviceProviders = providers;
				this.groupedServiceAreas = groupedAreas;
				this.hasGroupedData = groupedAreas.length > 0;

				// console.log('更新服务区域列表:', providers);
				// console.log('分组后的服务区域:', groupedAreas);
			},

			// 初始化默认设置
			initDefaultSettings() {
				// 创建一个默认的服务商设置
				const defaultSettings = {
					// 基本设置
					min_time_limit: '30',
					max_nav_distance: '5',
					night_service: '0',

					// 品牌设置
					meituan: '0',
					guaishou: '0',
					xiaodian: '0',
					jiedian: '0',

					// 时间费用设置
					bubao_time_limit_1: '1',
					bubao_time_limit_1_fee: '1',
					bubao_time_limit_2: '2',
					bubao_time_limit_2_fee: '2',
					bubao_time_limit_3: '3',
					bubao_time_limit_3_fee: '3',
					bubao_time_limit_4: '5',
					bubao_time_limit_4_fee: '5',
					bubao_time_limit_5: '7',
					bubao_time_limit_5_fee: '7',
					bubao_time_limit_6: '12',
					bubao_time_limit_6_fee: '12',
					bubao_time_limit_7: '24',
					bubao_time_limit_7_fee: '24',
					bubao_time_limit_8: '48',
					bubao_time_limit_8_fee: '48',
					bubao_time_limit_9: '72',
					bubao_time_limit_9_fee: '-2',
					bubao_time_limit_10: '0',
					bubao_time_limit_10_fee: '0',

					// 距离设置
					bubao_base_distance: '1',
					bubao_base_distance_fee: '0',
					bubao_extra_distance: '1',
					bubao_extra_distance_fee: '0',

					// 设备设置 - 补宝
					bubao_base_device: '1',
					bubao_base_device_fee: '5',
					bubao_extra_device: '1',
					bubao_extra_device_fee: '3',

					// 异常服务设置 - 离线异常
					exception_offline_base_device: '1',
					exception_offline_base_device_fee: '10',
					exception_offline_extra_device: '1',
					exception_offline_extra_device_fee: '5',

					// 异常服务设置 - 收入异常
					income_exception_base_device: '1',
					income_exception_base_device_fee: '15',
					income_exception_extra_device: '1',
					income_exception_extra_device_fee: '8',

					// 异常服务设置 - 其他异常
					other_exception_base_device: '1',
					other_exception_base_device_fee: '20',
					other_exception_extre_device: '1',
					other_exception_extre_device_fee: '10',

					// 通电服务设置
					bubao_power_base_device: '1',
					bubao_power_fee: '0',
					bubao_power_device_count: '1',
					bubao_power_device_fee: '0',

					// 电源线服务设置
					bubao_wire_base_device: '1',
					bubao_wire_base_fee: '0',
					bubao_wire_device_count: '1',
					bubao_wire_device_fee: '0',

					// 时间选项
					timeOptions: [{
							index: 1,
							hours: 1,
							fee: 1
						},
						{
							index: 2,
							hours: 2,
							fee: 2
						},
						{
							index: 3,
							hours: 3,
							fee: 3
						},
						{
							index: 4,
							hours: 5,
							fee: 5
						},
						{
							index: 5,
							hours: 7,
							fee: 7
						},
						{
							index: 6,
							hours: 12,
							fee: 12
						},
						{
							index: 7,
							hours: 24,
							fee: 24
						},
						{
							index: 8,
							hours: 48,
							fee: 48
						},
						{
							index: 9,
							hours: 72,
							fee: -2
						},
						{
							index: 10,
							hours: 0,
							fee: 0
						}
					]
				};

				// 添加一个默认服务商
				this.providerSettings = {
					'0': {
						...defaultSettings,
						districtInfo: {
							district_id: 0,
							district_name: '默认区域',
							city_id: 0,
							city_name: '默认城市',
							province_id: 0,
							province_name: '默认省份'
						}
					}
				};

				// 更新服务商列表
				this.updateServiceProviders(['0']);

				// 选择默认服务商
				this.switchProvider('0');
			},

			// 处理开关变化
			handleSwitchChange(key, event) {
				this.currentSettings[key] = event.detail.value ? '1' : '0';
			},

			// 切换品牌选择
			toggleBrand(brand) {
				// 确保currentSettings存在
				if (!this.currentSettings) {
					console.error('currentSettings不存在，无法切换品牌');
					return;
				}

				// 确保当前品牌设置存在
				if (this.currentSettings[brand] === undefined) {
					console.log(`初始化品牌${brand}设置为0`);
					this.currentSettings[brand] = '0';
				}

				// 切换品牌设置
				const newValue = this.currentSettings[brand] === '1' ? '0' : '1';
				this.currentSettings[brand] = newValue;

				console.log(`切换品牌${brand}设置为${newValue}`);
			},

			// 增加数值
			incrementValue(key, step = 1) {
				const value = parseFloat(this.currentSettings[key]);
				if (key.includes('device')) {
					// 对于设备数量，确保最小值为1
					this.currentSettings[key] = Math.max(1, (value + step)).toString();
				} else {
					this.currentSettings[key] = (value + step).toString();
				}
			},

			// 减少数值
			decrementValue(key, step = 1) {
				const value = parseFloat(this.currentSettings[key]);
				if (key.includes('device')) {
					// 对于设备数量，确保最小值为1
					this.currentSettings[key] = Math.max(1, (value - step)).toString();
				} else if (value > step) {
					this.currentSettings[key] = (value - step).toString();
				} else {
					this.currentSettings[key] = step.toString();
				}
			},

			// 验证数字输入（支持负数和小数点）
			validateNumberInput(event, fieldName) {
				let value = event.detail.value;

				// 由于使用了 type="number" 和 inputmode="decimal"，
				// 键盘已经限制了输入，这里只需要做基本的格式验证

				// 确保只包含数字、负号和小数点
				value = value.replace(/[^-\d.]/g, '');

				// 处理负号：只能在开头出现一次
				if (value.includes('-')) {
					const firstChar = value.charAt(0);
					value = value.replace(/-/g, '');
					if (firstChar === '-') {
						value = '-' + value;
					}
				}

				// 处理小数点：只能有一个
				const dotCount = (value.match(/\./g) || []).length;
				if (dotCount > 1) {
					const firstDotIndex = value.indexOf('.');
					const beforeDot = value.substring(0, firstDotIndex + 1);
					const afterDot = value.substring(firstDotIndex + 1).replace(/\./g, '');
					value = beforeDot + afterDot;
				}

				// 更新值
				this.currentSettings[fieldName] = value;
			},

			// 保存设置
			async saveSettings() {
				uni.showLoading({
					title: '保存中...'
				});

				try {
					// 获取骑手用户信息
					const riderUserInfo = uni.getStorageSync('riderUserInfo') || {};

					// 确保获取到完整的用户信息
					console.log('保存时获取到的用户信息:', riderUserInfo);

					// 获取用户ID和电话号码
					const userId = riderUserInfo.service_member_id || riderUserInfo.id || '';
					const userPhone = riderUserInfo.phone_number || riderUserInfo.phone || '';

					// 获取当前服务商ID
					const serviceProviderId = parseInt(this.currentProvider);

					// 准备当前选中的服务商设置
					const serviceZone = this.prepareSettingsData(this.currentSettings);

					console.log('保存时使用的用户ID:', userId, '电话:', userPhone);
					console.log('保存的service_zone_id:', serviceZone.service_zone_id);

					// 打印当前设置的完整信息
					console.log('当前设置的完整信息:', {
						currentProvider: this.currentProvider,
						currentSettings: this.currentSettings,
						serviceZone
					});

					// 添加服务商ID和用户ID
					serviceZone.service_provider_id = serviceProviderId;
					serviceZone.service_member_id = userId;
					serviceZone.sign = 'chongchong'; // 使用固定签名

					// 准备要保存的数据
					// const saveData = {
					// 	service_member_id: riderUserInfo.id || '',
					// 	service_zones: [serviceZone]
					// };

					// console.log('保存的服务商ID:', serviceProviderId);
					console.log('保存的服务区域数据:', serviceZone);

					// console.log('最终使用的保存数据:', saveData);

					// 使用$request调用接口保存设置
					const res = await this.$request('service/group/zone/update', serviceZone, 'POST');

					console.log('保存结果:', res);

					if (res && res.status === 'success') {
						// 保存成功
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						});
					} else {
						// 保存失败
						uni.showToast({
							title: res.msg || '保存失败',
							icon: 'none'
						});
					}
				} catch (err) {
					console.error('保存设置失败:', err);
					uni.showToast({
						title: '网络请求失败，请检查网络',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			// 准备要保存的设置数据
			prepareSettingsData(settings) {
				// 获取正确的service_zone_id
				let serviceZoneId = null;

				// 优先使用从接口获取的service_zone_id
				if (settings.service_zone_id) {
					serviceZoneId = settings.service_zone_id;
					console.log(`使用保存的service_zone_id: ${serviceZoneId}`);
				} else if (settings.districtInfo && settings.districtInfo.district_id) {
					// 如果没有保存的service_zone_id，但有district_id，使用district_id
					serviceZoneId = settings.districtInfo.district_id;
					console.log(`未找到保存的service_zone_id，使用district_id: ${serviceZoneId}`);
				} else {
					// 如果没有保存的service_zone_id和district_id，使用当前provider ID
					serviceZoneId = parseInt(this.currentProvider);
					console.log(`未找到保存的service_zone_id和district_id，使用当前provider ID: ${serviceZoneId}`);
				}

				// 打印当前设置的完整信息，方便调试
				console.log('当前设置信息:', {
					currentProvider: this.currentProvider,
					serviceZoneId,
					hasServiceZoneId: !!settings.service_zone_id,
					districtInfo: settings.districtInfo
				});

				// 创建服务区域对象
				const serviceZone = {
					// 服务商ID
					service_provider_id: parseInt(this.currentProvider),
					// 服务区域ID
					service_zone_id: serviceZoneId,

					// 基本设置
					min_time_limit: settings.min_time_limit !== undefined ? parseInt(settings.min_time_limit) : 0,
					max_nav_distance: settings.max_nav_distance !== undefined ? parseFloat(settings.max_nav_distance) : 0,
					night_service: settings.night_service === '1',

					// 品牌设置
					meituan: settings.meituan === '1',
					guaishou: settings.guaishou === '1',
					xiaodian: settings.xiaodian === '1',
					jiedian: settings.jiedian === '1',

					// 时间限制和费用
					bubao_time_limit_1: parseInt(settings.bubao_time_limit_1 || '1'),
					bubao_time_limit_1_fee: parseFloat(settings.bubao_time_limit_1_fee || '0'),
					bubao_time_limit_2: parseInt(settings.bubao_time_limit_2 || '2'),
					bubao_time_limit_2_fee: parseFloat(settings.bubao_time_limit_2_fee || '0'),
					bubao_time_limit_3: parseInt(settings.bubao_time_limit_3 || '5'),
					bubao_time_limit_3_fee: parseFloat(settings.bubao_time_limit_3_fee || '0'),
					bubao_time_limit_4: parseInt(settings.bubao_time_limit_4 || '7'),
					bubao_time_limit_4_fee: parseFloat(settings.bubao_time_limit_4_fee || '0'),
					bubao_time_limit_5: parseInt(settings.bubao_time_limit_5 || '12'),
					bubao_time_limit_5_fee: parseFloat(settings.bubao_time_limit_5_fee || '0'),
					bubao_time_limit_6: parseInt(settings.bubao_time_limit_6 || '24'),
					bubao_time_limit_6_fee: parseFloat(settings.bubao_time_limit_6_fee || '0'),
					bubao_time_limit_7: parseInt(settings.bubao_time_limit_7 || '48'),
					bubao_time_limit_7_fee: parseFloat(settings.bubao_time_limit_7_fee || '0'),
					bubao_time_limit_8: parseInt(settings.bubao_time_limit_8 || '72'),
					bubao_time_limit_8_fee: parseFloat(settings.bubao_time_limit_8_fee || '0'),
					bubao_time_limit_9: parseInt(settings.bubao_time_limit_9 || '72'),
					bubao_time_limit_9_fee: parseFloat(settings.bubao_time_limit_9_fee || '0'),
					bubao_time_limit_10: parseInt(settings.bubao_time_limit_10 || '0'),
					bubao_time_limit_10_fee: parseFloat(settings.bubao_time_limit_10_fee || '0'),

					// 距离设置
					bubao_base_distance: parseFloat(settings.bubao_base_distance || '1'),
					bubao_base_distance_fee: parseFloat(settings.bubao_base_distance_fee || '0'),
					bubao_extra_distance: parseFloat(settings.bubao_extra_distance || '1'),
					bubao_extra_distance_fee: parseFloat(settings.bubao_extra_distance_fee || '0'),

					// 设备设置 - 补宝
					bubao_base_device: parseInt(settings.bubao_base_device || '0'),
					bubao_base_device_fee: parseFloat(settings.bubao_base_device_fee || '0'),
					bubao_extra_device: parseInt(settings.bubao_extra_device || '0'),
					bubao_extra_device_fee: parseFloat(settings.bubao_extra_device_fee || '0'),

					// 异常服务设置 - 离线异常
					exception_offline_base_device: parseInt(settings.exception_offline_base_device || '1'),
					exception_offline_base_device_fee: parseFloat(settings.exception_offline_base_device_fee || '0'),
					exception_offline_extra_device: parseInt(settings.exception_offline_extra_device || '1'),
					exception_offline_extra_device_fee: parseFloat(settings.exception_offline_extra_device_fee || '0'),

					// 异常服务设置 - 收入异常
					income_exception_base_device: parseInt(settings.income_exception_base_device || '1'),
					income_exception_base_device_fee: parseFloat(settings.income_exception_base_device_fee || '0'),
					income_exception_extra_device: parseInt(settings.income_exception_extra_device || '1'),
					income_exception_extra_device_fee: parseFloat(settings.income_exception_extra_device_fee || '0'),

					// 异常服务设置 - 其他异常
					other_exception_base_device: parseInt(settings.other_exception_base_device || '1'),
					other_exception_base_device_fee: parseFloat(settings.other_exception_base_device_fee || '0'),
					other_exception_extre_device: parseInt(settings.other_exception_extre_device || '1'),
					other_exception_extre_device_fee: parseFloat(settings.other_exception_extre_device_fee || '0'),

					// 通电服务设置
					bubao_power_base_device: Math.max(1, parseInt(settings.bubao_power_base_device || '1')),
					bubao_power_fee: parseFloat(settings.bubao_power_fee || '0'),
					bubao_power_device_count: Math.max(1, parseInt(settings.bubao_power_device_count || '1')),
					bubao_power_device_fee: parseFloat(settings.bubao_power_device_fee || '0'),

					// 电源线服务设置
					bubao_wire_base_device: Math.max(1, parseInt(settings.bubao_wire_base_device || '1')),
					bubao_wire_base_fee: parseFloat(settings.bubao_wire_base_fee || '0'),
					bubao_wire_device_count: Math.max(1, parseInt(settings.bubao_wire_device_count || '1')),
					bubao_wire_device_fee: parseFloat(settings.bubao_wire_device_fee || '0')
				};

				return serviceZone;
			},

			// 显示批量修改弹窗
			showBulkUpdateModal() {
				// 准备可用区域列表
				this.prepareAvailableAreas();
				// 获取上次批量设置作为参考
				const lastBulkSettings = uni.getStorageSync('lastBulkSettings');
				if (lastBulkSettings && typeof lastBulkSettings === 'object') {
					this.lastBulkSettings = lastBulkSettings;
				} else {
					this.lastBulkSettings = null;
				}
				// 重置批量设置为空
				this.resetBulkSettings();
				// 显示弹窗
				this.showBulkModal = true;
			},

			// 隐藏批量修改弹窗
			hideBulkUpdateModal() {
				this.showBulkModal = false;
				this.selectedAreas = [];
				this.lastBulkSettings = null;
			},

			// 获取上次设置的参考值
			getLastSettingReference(fieldName) {
				if (!this.lastBulkSettings || !this.lastBulkSettings[fieldName]) {
					return '';
				}
				return this.lastBulkSettings[fieldName];
			},

			// 准备可用区域列表
			prepareAvailableAreas() {
				this.availableAreas = [];

				// 遍历所有服务区域
				this.groupedServiceAreas.forEach(province => {
					province.cities.forEach(city => {
						city.districts.forEach(district => {
							this.availableAreas.push({
								id: district.district_id, // 使用district_id而不是id
								name: `${province.name} > ${city.name} > ${district.name}`
							});
						});
					});
				});
			},

			// 重置批量设置
			resetBulkSettings(bulkSettings = null) {
				const defaultSettings = {
					// 品牌设置
					meituan: false,
					guaishou: false,
					xiaodian: false,
					jiedian: false,
					// 主项服务设置 - 补宝
					bubao_base_device: '',
					bubao_base_device_fee: '',
					bubao_extra_device: '',
					bubao_extra_device_fee: '',
					// 异常服务设置 - 离线异常
					exception_offline_base_device: '',
					exception_offline_base_device_fee: '',
					exception_offline_extra_device: '',
					exception_offline_extra_device_fee: '',
					// 异常服务设置 - 收入异常
					income_exception_base_device: '',
					income_exception_base_device_fee: '',
					// 异常服务设置 - 其他异常
					other_exception_base_device: '',
					other_exception_base_device_fee: '',
					// 距离费用设置
					bubao_base_distance: '',
					bubao_base_distance_fee: '',
					bubao_extra_distance: '',
					bubao_extra_distance_fee: ''
				};
				this.bulkSettings = Object.assign({}, defaultSettings, bulkSettings || {});
				// 重置服务时效设置
				this.timeOptions.forEach(time => {
					this.bulkSettings[`bubao_time_limit_${time.index}_fee`] = (bulkSettings && bulkSettings[`bubao_time_limit_${time.index}_fee`]) || '';
				});
				// 重置展开状态
				this.expandedProvinces = [];
				this.expandedCities = [];
			},

			// 切换省份展开状态
			toggleProvinceExpand(provinceId) {
				const index = this.expandedProvinces.indexOf(provinceId);
				if (index > -1) {
					this.expandedProvinces.splice(index, 1);
				} else {
					this.expandedProvinces.push(provinceId);
				}
			},

			// 切换城市展开状态
			toggleCityExpand(provinceId, cityId) {
				const key = `${provinceId}-${cityId}`;
				const index = this.expandedCities.indexOf(key);
				if (index > -1) {
					this.expandedCities.splice(index, 1);
				} else {
					this.expandedCities.push(key);
				}
			},

			// 切换省份选择
			toggleProvinceSelection(provinceId) {
				const province = this.groupedServiceAreas.find(p => p.id === provinceId);
				if (!province) return;

				const allDistrictIds = [];
				province.cities.forEach(city => {
					city.districts.forEach(district => {
						allDistrictIds.push(district.district_id); // 使用district_id而不是id
					});
				});

				const isAllSelected = allDistrictIds.every(id => this.selectedAreas.includes(id));

				if (isAllSelected) {
					// 取消选择所有区县
					allDistrictIds.forEach(id => {
						const index = this.selectedAreas.indexOf(id);
						if (index > -1) {
							this.selectedAreas.splice(index, 1);
						}
					});
				} else {
					// 选择所有区县
					allDistrictIds.forEach(id => {
						if (!this.selectedAreas.includes(id)) {
							this.selectedAreas.push(id);
						}
					});
				}
			},

			// 切换城市选择
			toggleCitySelection(provinceId, cityId) {
				const province = this.groupedServiceAreas.find(p => p.id === provinceId);
				if (!province) return;

				const city = province.cities.find(c => c.id === cityId);
				if (!city) return;

				const allDistrictIds = city.districts.map(d => d.district_id); // 使用district_id而不是id
				const isAllSelected = allDistrictIds.every(id => this.selectedAreas.includes(id));

				if (isAllSelected) {
					// 取消选择所有区县
					allDistrictIds.forEach(id => {
						const index = this.selectedAreas.indexOf(id);
						if (index > -1) {
							this.selectedAreas.splice(index, 1);
						}
					});
				} else {
					// 选择所有区县
					allDistrictIds.forEach(id => {
						if (!this.selectedAreas.includes(id)) {
							this.selectedAreas.push(id);
						}
					});
				}
			},

			// 判断省份是否完全选中
			isProvinceSelected(provinceId) {
				const province = this.groupedServiceAreas.find(p => p.id === provinceId);
				if (!province) return false;

				const allDistrictIds = [];
				province.cities.forEach(city => {
					city.districts.forEach(district => {
						allDistrictIds.push(district.district_id); // 使用district_id而不是id
					});
				});

				return allDistrictIds.length > 0 && allDistrictIds.every(id => this.selectedAreas.includes(id));
			},

			// 判断省份是否部分选中
			isProvinceIndeterminate(provinceId) {
				const province = this.groupedServiceAreas.find(p => p.id === provinceId);
				if (!province) return false;

				const allDistrictIds = [];
				province.cities.forEach(city => {
					city.districts.forEach(district => {
						allDistrictIds.push(district.district_id); // 使用district_id而不是id
					});
				});

				const selectedCount = allDistrictIds.filter(id => this.selectedAreas.includes(id)).length;
				return selectedCount > 0 && selectedCount < allDistrictIds.length;
			},

			// 判断城市是否完全选中
			isCitySelected(provinceId, cityId) {
				const province = this.groupedServiceAreas.find(p => p.id === provinceId);
				if (!province) return false;

				const city = province.cities.find(c => c.id === cityId);
				if (!city) return false;

				const allDistrictIds = city.districts.map(d => d.district_id); // 使用district_id而不是id
				return allDistrictIds.length > 0 && allDistrictIds.every(id => this.selectedAreas.includes(id));
			},

			// 判断城市是否部分选中
			isCityIndeterminate(provinceId, cityId) {
				const province = this.groupedServiceAreas.find(p => p.id === provinceId);
				if (!province) return false;

				const city = province.cities.find(c => c.id === cityId);
				if (!city) return false;

				const allDistrictIds = city.districts.map(d => d.district_id); // 使用district_id而不是id
				const selectedCount = allDistrictIds.filter(id => this.selectedAreas.includes(id)).length;
				return selectedCount > 0 && selectedCount < allDistrictIds.length;
			},

			// 切换区域选择
			toggleAreaSelection(areaId) {
				const index = this.selectedAreas.indexOf(areaId);
				if (index > -1) {
					this.selectedAreas.splice(index, 1);
				} else {
					this.selectedAreas.push(areaId);
				}
			},

			// 切换批量品牌选择
			toggleBulkBrand(brand) {
				this.bulkSettings[brand] = !this.bulkSettings[brand];
			},

			// 确认批量修改
			async confirmBulkUpdate() {
				if (this.selectedAreas.length === 0) {
					uni.showToast({
						title: '请选择要修改的区域',
						icon: 'none'
					});
					return;
				}

				// 检查是否有设置需要修改
				const hasChanges = this.bulkSettings.meituan ||
					this.bulkSettings.guaishou ||
					this.bulkSettings.xiaodian ||
					this.bulkSettings.jiedian ||
					// 补宝服务字段
					this.bulkSettings.bubao_base_device ||
					this.bulkSettings.bubao_base_device_fee ||
					this.bulkSettings.bubao_extra_device ||
					this.bulkSettings.bubao_extra_device_fee ||
					// 异常服务字段
					this.bulkSettings.exception_offline_base_device ||
					this.bulkSettings.exception_offline_base_device_fee ||
					this.bulkSettings.exception_offline_extra_device ||
					this.bulkSettings.exception_offline_extra_device_fee ||
					this.bulkSettings.income_exception_base_device ||
					this.bulkSettings.income_exception_base_device_fee ||
					this.bulkSettings.other_exception_base_device ||
					this.bulkSettings.other_exception_base_device_fee ||
					// 距离费用字段
					this.bulkSettings.bubao_base_distance ||
					this.bulkSettings.bubao_base_distance_fee ||
					this.bulkSettings.bubao_extra_distance ||
					this.bulkSettings.bubao_extra_distance_fee ||
					// 服务时效字段
					this.timeOptions.some(time => this.bulkSettings[`bubao_time_limit_${time.index}_fee`]);

				if (!hasChanges) {
					uni.showToast({
						title: '请设置要修改的内容',
						icon: 'none'
					});
					return;
				}

				uni.showLoading({
					title: '批量修改中...'
				});

				try {
					// 获取骑手用户信息
					const riderUserInfo = uni.getStorageSync('riderUserInfo') || {};
					const userId = riderUserInfo.service_member_id || riderUserInfo.id || '';

					// 准备批量修改参数
					const params = {
						service_member_id: userId,
						district_ids: this.selectedAreas.map(id => parseInt(id)), // 传递选中区县的district_id字段值
						sign: 'chongchong'
					};

					// 添加品牌设置
					if (this.bulkSettings.meituan) params.meituan = true;
					if (this.bulkSettings.guaishou) params.guaishou = true;
					if (this.bulkSettings.xiaodian) params.xiaodian = true;
					if (this.bulkSettings.jiedian) params.jiedian = true;

					// 添加主项服务设置 - 补宝
					if (this.bulkSettings.bubao_base_device) {
						params.bubao_base_device = parseInt(this.bulkSettings.bubao_base_device);
					}
					if (this.bulkSettings.bubao_base_device_fee) {
						params.bubao_base_device_fee = parseFloat(this.bulkSettings.bubao_base_device_fee);
					}
					if (this.bulkSettings.bubao_extra_device) {
						params.bubao_extra_device = parseInt(this.bulkSettings.bubao_extra_device);
					}
					if (this.bulkSettings.bubao_extra_device_fee) {
						params.bubao_extra_device_fee = parseFloat(this.bulkSettings.bubao_extra_device_fee);
					}

					// 添加异常服务设置 - 离线异常
					if (this.bulkSettings.exception_offline_base_device) {
						params.exception_offline_base_device = parseInt(this.bulkSettings.exception_offline_base_device);
					}
					if (this.bulkSettings.exception_offline_base_device_fee) {
						params.exception_offline_base_device_fee = parseFloat(this.bulkSettings.exception_offline_base_device_fee);
					}
					if (this.bulkSettings.exception_offline_extra_device) {
						params.exception_offline_extra_device = parseInt(this.bulkSettings.exception_offline_extra_device);
					}
					if (this.bulkSettings.exception_offline_extra_device_fee) {
						params.exception_offline_extra_device_fee = parseFloat(this.bulkSettings.exception_offline_extra_device_fee);
					}

					// 添加异常服务设置 - 收入异常
					if (this.bulkSettings.income_exception_base_device) {
						params.income_exception_base_device = parseInt(this.bulkSettings.income_exception_base_device);
					}
					if (this.bulkSettings.income_exception_base_device_fee) {
						params.income_exception_base_device_fee = parseFloat(this.bulkSettings.income_exception_base_device_fee);
					}

					// 添加异常服务设置 - 其他异常
					if (this.bulkSettings.other_exception_base_device) {
						params.other_exception_base_device = parseInt(this.bulkSettings.other_exception_base_device);
					}
					if (this.bulkSettings.other_exception_base_device_fee) {
						params.other_exception_base_device_fee = parseFloat(this.bulkSettings.other_exception_base_device_fee);
					}

					// 添加距离费用设置
					if (this.bulkSettings.bubao_base_distance) {
						params.bubao_base_distance = parseInt(this.bulkSettings.bubao_base_distance);
					}
					if (this.bulkSettings.bubao_base_distance_fee) {
						params.bubao_base_distance_fee = parseFloat(this.bulkSettings.bubao_base_distance_fee);
					}
					if (this.bulkSettings.bubao_extra_distance) {
						params.bubao_extra_distance = parseInt(this.bulkSettings.bubao_extra_distance);
					}
					if (this.bulkSettings.bubao_extra_distance_fee) {
						params.bubao_extra_distance_fee = parseFloat(this.bulkSettings.bubao_extra_distance_fee);
					}

					// 添加服务时效设置
					this.timeOptions.forEach(time => {
						const feeValue = this.bulkSettings[`bubao_time_limit_${time.index}_fee`];
						if (feeValue) {
							params[`bubao_time_limit_${time.index}_fee`] = parseFloat(feeValue);
						}
					});

					console.log('批量修改参数:', params);

					// 调用批量修改接口
					const res = await this.$request('service/group/zone/bulkupdate', params, 'POST');

					console.log('批量修改结果:', res);

					if (res && res.status === 'success') {
						uni.showToast({
							title: '批量修改成功',
							icon: 'success'
						});

						try {
							// 直接更新本地数据，无需重新请求接口
							this.updateLocalDataAfterBulkUpdate(this.selectedAreas, this.bulkSettings);

							// 验证本地数据更新是否成功
							this.validateLocalDataUpdate(this.selectedAreas, this.bulkSettings);

							console.log('本地数据更新和验证成功，无需重新请求接口');
						} catch (error) {
							console.error('本地数据更新或验证失败，将重新请求接口:', error);
							// 如果本地更新失败，作为备用方案重新请求接口
							this.getSettings();
						}

						// 关闭弹窗
						this.hideBulkUpdateModal();
					} else {
						uni.showToast({
							title: res.msg || '批量修改失败',
							icon: 'none'
						});
					}
				} catch (err) {
					console.error('批量修改失败:', err);
					uni.showToast({
						title: '网络请求失败，请检查网络',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			// 批量修改成功后更新本地数据
			updateLocalDataAfterBulkUpdate(selectedDistrictIds, bulkSettings) {
				console.log('开始更新本地数据:', { selectedDistrictIds, bulkSettings });

				let updatedCount = 0;

				// 遍历所有选中的区县ID，更新对应的本地设置
				selectedDistrictIds.forEach(districtId => {
					// 查找对应的服务商ID（zone.id）
					const providerId = this.findProviderIdByDistrictId(districtId);
					if (!providerId) {
						console.warn(`未找到district_id为${districtId}的服务商`);
						return;
					}

					// 获取当前服务商的设置
					const currentSettings = this.providerSettings[providerId];
					if (!currentSettings) {
						console.warn(`未找到providerId为${providerId}的设置`);
						return;
					}

					console.log(`更新providerId ${providerId} (district_id: ${districtId}) 的设置`);

					// 更新品牌设置（只有选中的品牌才更新）
					if (bulkSettings.meituan) {
						currentSettings.meituan = '1';
					}
					if (bulkSettings.guaishou) {
						currentSettings.guaishou = '1';
					}
					if (bulkSettings.xiaodian) {
						currentSettings.xiaodian = '1';
					}
					if (bulkSettings.jiedian) {
						currentSettings.jiedian = '1';
					}

					// 更新主项服务设置 - 补宝
					if (bulkSettings.bubao_base_device) {
						currentSettings.bubao_base_device = bulkSettings.bubao_base_device.toString();
					}
					if (bulkSettings.bubao_base_device_fee) {
						currentSettings.bubao_base_device_fee = bulkSettings.bubao_base_device_fee.toString();
					}
					if (bulkSettings.bubao_extra_device) {
						currentSettings.bubao_extra_device = bulkSettings.bubao_extra_device.toString();
					}
					if (bulkSettings.bubao_extra_device_fee) {
						currentSettings.bubao_extra_device_fee = bulkSettings.bubao_extra_device_fee.toString();
					}

					// 更新异常服务设置 - 离线异常
					if (bulkSettings.exception_offline_base_device) {
						currentSettings.exception_offline_base_device = bulkSettings.exception_offline_base_device.toString();
					}
					if (bulkSettings.exception_offline_base_device_fee) {
						currentSettings.exception_offline_base_device_fee = bulkSettings.exception_offline_base_device_fee.toString();
					}
					if (bulkSettings.exception_offline_extra_device) {
						currentSettings.exception_offline_extra_device = bulkSettings.exception_offline_extra_device.toString();
					}
					if (bulkSettings.exception_offline_extra_device_fee) {
						currentSettings.exception_offline_extra_device_fee = bulkSettings.exception_offline_extra_device_fee.toString();
					}

					// 更新异常服务设置 - 收入异常
					if (bulkSettings.income_exception_base_device) {
						currentSettings.income_exception_base_device = bulkSettings.income_exception_base_device.toString();
					}
					if (bulkSettings.income_exception_base_device_fee) {
						currentSettings.income_exception_base_device_fee = bulkSettings.income_exception_base_device_fee.toString();
					}

					// 更新异常服务设置 - 其他异常
					if (bulkSettings.other_exception_base_device) {
						currentSettings.other_exception_base_device = bulkSettings.other_exception_base_device.toString();
					}
					if (bulkSettings.other_exception_base_device_fee) {
						currentSettings.other_exception_base_device_fee = bulkSettings.other_exception_base_device_fee.toString();
					}

					// 更新距离费用设置
					if (bulkSettings.bubao_base_distance) {
						currentSettings.bubao_base_distance = bulkSettings.bubao_base_distance.toString();
					}
					if (bulkSettings.bubao_base_distance_fee) {
						currentSettings.bubao_base_distance_fee = bulkSettings.bubao_base_distance_fee.toString();
					}
					if (bulkSettings.bubao_extra_distance) {
						currentSettings.bubao_extra_distance = bulkSettings.bubao_extra_distance.toString();
					}
					if (bulkSettings.bubao_extra_distance_fee) {
						currentSettings.bubao_extra_distance_fee = bulkSettings.bubao_extra_distance_fee.toString();
					}

					// 更新服务时效设置
					this.timeOptions.forEach(time => {
						const feeKey = `bubao_time_limit_${time.index}_fee`;
						if (bulkSettings[feeKey]) {
							currentSettings[feeKey] = bulkSettings[feeKey].toString();

							// 同时更新时间选项中的费用
							if (currentSettings.timeOptions) {
								const timeOption = currentSettings.timeOptions.find(t => t.index === time.index);
								if (timeOption) {
									timeOption.fee = parseFloat(bulkSettings[feeKey]);
								}
							}
						}
					});

					console.log(`已更新providerId ${providerId} 的设置`);
					updatedCount++;
				});

				// 如果当前选中的服务商也在更新列表中，需要刷新当前显示的时间选项
				const currentProviderId = this.currentProvider;
				const currentDistrictId = this.getCurrentDistrictId();

				if (currentDistrictId && selectedDistrictIds.includes(currentDistrictId)) {
					console.log('当前选中的服务商也被更新，刷新时间选项');

					// 更新当前显示的时间选项
					if (this.providerSettings[currentProviderId] && this.providerSettings[currentProviderId].timeOptions) {
						this.timeOptions = [...this.providerSettings[currentProviderId].timeOptions];
					}

					// 强制更新页面渲染
					this.$nextTick(() => {
						this.$forceUpdate();
					});
				}

				console.log(`本地数据更新完成，共更新了 ${updatedCount} 个区域的设置`);
				// 保存本次批量设置到本地，便于下次自动填入
				try {
					uni.setStorageSync('lastBulkSettings', this.bulkSettings);
				} catch (e) {
					console.warn('保存lastBulkSettings失败', e);
				}
			},

			// 根据district_id查找对应的providerId（zone.id）
			findProviderIdByDistrictId(districtId) {
				// 遍历所有服务商设置，查找匹配的district_id
				for (const providerId in this.providerSettings) {
					const settings = this.providerSettings[providerId];
					if (settings.districtInfo && settings.districtInfo.district_id == districtId) {
						return providerId;
					}
				}
				return null;
			},

			// 获取当前选中服务商的district_id
			getCurrentDistrictId() {
				const currentSettings = this.providerSettings[this.currentProvider];
				if (currentSettings && currentSettings.districtInfo) {
					return currentSettings.districtInfo.district_id;
				}
				return null;
			},

			// 验证本地数据更新是否成功
			validateLocalDataUpdate(selectedDistrictIds, bulkSettings) {
				let validationPassed = true;
				const validationErrors = [];

				selectedDistrictIds.forEach(districtId => {
					const providerId = this.findProviderIdByDistrictId(districtId);
					if (!providerId) {
						validationErrors.push(`未找到district_id为${districtId}的服务商`);
						validationPassed = false;
						return;
					}

					const settings = this.providerSettings[providerId];
					if (!settings) {
						validationErrors.push(`未找到providerId为${providerId}的设置`);
						validationPassed = false;
						return;
					}

					// 验证品牌设置是否正确更新
					if (bulkSettings.meituan && settings.meituan !== '1') {
						validationErrors.push(`providerId ${providerId} 的美团设置更新失败`);
						validationPassed = false;
					}
					if (bulkSettings.guaishou && settings.guaishou !== '1') {
						validationErrors.push(`providerId ${providerId} 的怪兽设置更新失败`);
						validationPassed = false;
					}
					if (bulkSettings.xiaodian && settings.xiaodian !== '1') {
						validationErrors.push(`providerId ${providerId} 的小电设置更新失败`);
						validationPassed = false;
					}
					if (bulkSettings.jiedian && settings.jiedian !== '1') {
						validationErrors.push(`providerId ${providerId} 的街电设置更新失败`);
						validationPassed = false;
					}

					// 验证主项服务设置
					if (bulkSettings.bubao_base_device && settings.bubao_base_device !== bulkSettings.bubao_base_device.toString()) {
						validationErrors.push(`providerId ${providerId} 的基础设备数量更新失败`);
						validationPassed = false;
					}
					if (bulkSettings.bubao_base_device_fee && settings.bubao_base_device_fee !== bulkSettings.bubao_base_device_fee.toString()) {
						validationErrors.push(`providerId ${providerId} 的基础设备费用更新失败`);
						validationPassed = false;
					}
				});

				if (!validationPassed) {
					console.error('本地数据更新验证失败:', validationErrors);
					throw new Error('本地数据更新验证失败: ' + validationErrors.join(', '));
				}

				console.log('本地数据更新验证通过');
				return true;
			},

			// 返回上一页
			goBack() {
				uni.navigateBack();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.task-settings-container {
		min-height: 100vh;
		background-color: #f8f9fa;
		font-family: "HarmonyOS Sans SC", "PingFang SC", sans-serif;
		color: #333;
		font-size: 28rpx;
		line-height: 1.5;
		padding-bottom: 120rpx;

		&::before {
			content: '';
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			height: 200rpx;
			background: linear-gradient(180deg, rgba(68, 129, 235, 0.08) 0%, rgba(4, 190, 254, 0.03) 100%);
			z-index: -1;
		}
	}

	.nav-placeholder {
		width: 100%;
	}

	.settings-content {
		padding: 20rpx 24rpx;

		&::after {
			content: '';
			display: block;
			height: 40rpx;
		}
	}

	// 行布局样式
	.settings-row {
		display: flex;
		flex-wrap: wrap;
		margin: 0 -10rpx;
	}

	// 设置区域样式
	.settings-section {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx 20rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.04);
		border: 1rpx solid rgba(0, 0, 0, 0.02);
	}

	// 区域标题样式
	.section-header {
		margin-bottom: 20rpx;
		padding: 0 10rpx;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;

		.section-title-wrapper {
			flex: 1;

			.section-title {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 8rpx;
				position: relative;
				display: inline-block;

				&::after {
					content: '';
					position: absolute;
					bottom: -8rpx;
					left: 0;
					width: 36rpx;
					height: 4rpx;
					background: linear-gradient(90deg, #4481eb, #04befe);
					border-radius: 4rpx;
				}
			}

			.section-subtitle {
				font-size: 24rpx;
				color: #999;
				margin-left: 2rpx;
			}

			&:active {
				background-color: #1976d2;
				transform: scale(0.95);
			}
		}
	}

	// 设置项样式
	.settings-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18rpx 12rpx;
		border-bottom: 1rpx solid rgba(0, 0, 0, 0.03);
		box-sizing: border-box;

		&:last-child {
			border-bottom: none;
		}

		&.half-width {
			width: 50%;
			padding-right: 15rpx;
			padding-left: 15rpx;
		}

		&.full-width {
			width: 100%;
			padding: 12rpx 15rpx;
		}

		.item-label {
			font-size: 26rpx;
			color: #333;
			flex: 1;
			padding-right: 20rpx;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.item-input {
			width: 120rpx;
			height: 60rpx;
			border: 1rpx solid #e0e0e0;
			border-radius: 8rpx;
			padding: 0 10rpx;
			text-align: center;
			font-size: 26rpx;
			background-color: #f9f9f9;

			&:focus {
				border-color: #4481eb;
				background-color: #fff;
			}
		}
	}

	// 时间限制网格样式
	.time-limits-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
		padding: 15rpx 10rpx;
		margin-top: 10rpx;
	}

	// 时间限制项样式
	.time-limit-item {
		background-color: rgba(68, 129, 235, 0.05);
		border-radius: 12rpx;
		padding: 18rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
		border: 1rpx solid rgba(68, 129, 235, 0.1);

		.time-limit-content {
			display: flex;
			flex-direction: column;
		}

		.time-limit-label {
			font-size: 26rpx;
			font-weight: bold;
			color: #4481eb;
			margin-bottom: 12rpx;
			text-align: center;
		}

		.time-limit-inputs {
			display: flex;
			align-items: center;
			justify-content: center;

			.time-input {
				width: 80rpx;
				margin-right: 10rpx;
				background-color: rgba(255, 255, 255, 0.8);
			}

			.fee-separator {
				font-size: 24rpx;
				color: #666;
				margin: 0 10rpx;
			}

			.fee-input {
				width: 100rpx;
				background-color: rgba(255, 255, 255, 0.8);
			}

			.fee-unit {
				font-size: 24rpx;
				color: #666;
				margin-left: 10rpx;
			}
		}

		&:hover {
			background-color: rgba(68, 129, 235, 0.08);
		}
	}

	// 服务区域选择器样式
	.service-area-selector {
		padding: 15rpx 10rpx;

		// 联级选择器样式
		.cascade-selector {
			background-color: #fff;
			border-radius: 12rpx;
			overflow: hidden;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
			border: 1rpx solid rgba(0, 0, 0, 0.05);
			margin-bottom: 20rpx;
		}

		// 选择器头部样式
		.selector-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx;
			background-color: #f8f9fa;
			border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);

			.selected-area-info {
				display: flex;
				align-items: center;
				flex: 1;
				overflow: hidden;

				.area-label {
					font-size: 28rpx;
					color: #666;
					margin-right: 10rpx;
				}

				.area-value {
					font-size: 28rpx;
					color: #333;
					font-weight: 500;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					max-width: 400rpx;

					&.empty {
						color: #999;
						font-weight: normal;
					}
				}
			}

			.selector-action {
				padding: 6rpx 16rpx;
				background-color: rgba(36, 146, 242, 0.1);
				border-radius: 30rpx;
				transition: all 0.3s ease;

				.action-text {
					font-size: 26rpx;
					color: #2492F2;
					font-weight: 500;
				}

				&:active {
					background-color: rgba(36, 146, 242, 0.2);
					transform: scale(0.95);
				}
			}
		}

		// 选择器导航路径样式
		.selector-path {
			padding: 15rpx 20rpx;
			background-color: #f0f3f9;
			border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);

			.path-wrapper {
				display: flex;
				align-items: center;
				overflow-x: auto;
				white-space: nowrap;

				&::-webkit-scrollbar {
					display: none;
				}

				.path-item {
					font-size: 26rpx;
					color: #2492F2;
					padding: 6rpx 10rpx;
					border-radius: 6rpx;
					transition: all 0.3s ease;

					&:active {
						background-color: rgba(36, 146, 242, 0.1);
					}
				}

				.path-separator {
					font-size: 22rpx;
					color: #999;
					margin: 0 6rpx;
				}
			}
		}

		// 选择器内容样式
		.selector-content {
			max-height: 600rpx;
			overflow-y: auto;
		}

		// 选择器列表样式
		.selector-list {
			padding: 10rpx 0;
		}

		// 选择器项样式
		.selector-item {
			display: flex;
			align-items: center;
			padding: 20rpx;
			border-bottom: 1rpx solid rgba(0, 0, 0, 0.03);
			transition: all 0.3s ease;
			position: relative;

			&:last-child {
				border-bottom: none;
			}

			&:active {
				background-color: #f5f5f5;
			}

			.item-name {
				font-size: 28rpx;
				color: #333;
				flex: 1;
			}

			.item-count {
				font-size: 24rpx;
				color: #999;
				margin-right: 10rpx;
			}

			.item-arrow {
				width: 16rpx;
				height: 16rpx;
				border-top: 2rpx solid #999;
				border-right: 2rpx solid #999;
				transform: rotate(45deg);
			}

			.item-check {
				width: 20rpx;
				height: 20rpx;
				border-radius: 50%;
				background-color: #2492F2;
				position: relative;

				&::before {
					content: '';
					position: absolute;
					width: 8rpx;
					height: 4rpx;
					border-right: 2rpx solid #fff;
					border-bottom: 2rpx solid #fff;
					transform: rotate(45deg);
					top: 6rpx;
					left: 5rpx;
				}
			}

			// 区县项特殊样式
			&.district-item {
				&.active {
					background-color: rgba(36, 146, 242, 0.05);

					.item-name {
						color: #2492F2;
						font-weight: 500;
					}
				}
			}
		}


	}

	// 原始服务商选择器样式（兼容旧版）
	.service-provider-selector {
		display: flex;
		flex-wrap: wrap;
		padding: 15rpx 10rpx;
		gap: 20rpx;

		.provider-item {
			flex: 1;
			min-width: 160rpx;
			height: 76rpx;
			background-color: #f5f7fa;
			border-radius: 38rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s ease;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
			border: 1rpx solid rgba(0, 0, 0, 0.03);

			&.active {
				background: linear-gradient(135deg, #4481eb 0%, #04befe 100%);
				box-shadow: 0 6rpx 12rpx rgba(4, 190, 254, 0.2);
				border: none;

				.provider-name {
					color: #fff;
					font-weight: bold;
					letter-spacing: 1rpx;
				}
			}

			.provider-name {
				font-size: 26rpx;
				color: #666;
			}

			&:active {
				transform: scale(0.95);
				opacity: 0.9;
			}
		}
	}

	// 操作按钮样式
	.action-buttons-wrapper {
		padding: 20rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom, 0px));
		position: sticky;
		bottom: 0;
		background-color: rgba(248, 249, 250, 0.95);
		backdrop-filter: blur(10rpx);
		z-index: 10;
		border-top: 1rpx solid rgba(0, 0, 0, 0.03);
		display: flex;
		gap: 15rpx;

		.save-button {
			flex: 1;
			background: linear-gradient(135deg, #4481eb 0%, #04befe 100%);
			color: #fff;
			border-radius: 40rpx;
			height: 70rpx;
			line-height: 70rpx;
			font-size: 28rpx;
			font-weight: bold;
			letter-spacing: 2rpx;
			box-shadow: 0 8rpx 16rpx rgba(4, 190, 254, 0.2);
			transition: all 0.3s ease;
			border: none;
			text-align: center;

			&:active {
				transform: scale(0.98);
				opacity: 0.9;
				box-shadow: 0 4rpx 8rpx rgba(4, 190, 254, 0.15);
			}
		}

		.bulk-update-button {
			flex: 1;
			background: #fff;
			color: #2492F2;
			border: 2rpx solid #2492F2;
			border-radius: 40rpx;
			height: 70rpx;
			line-height: 70rpx;
			font-size: 28rpx;
			font-weight: bold;
			letter-spacing: 2rpx;
			box-shadow: 0 8rpx 16rpx rgba(36, 146, 242, 0.1);
			transition: all 0.3s ease;
			text-align: center;

			&:active {
				transform: scale(0.98);
				background-color: #f8f9fa;
				box-shadow: 0 4rpx 8rpx rgba(36, 146, 242, 0.05);
			}
		}
	}

	// 数字步进器样式
	.number-stepper {
		display: flex;
		align-items: center;
		height: 60rpx;
		border-radius: 8rpx;
		overflow: hidden;
		border: 1rpx solid #e0e0e0;
		background-color: #f9f9f9;

		.stepper-btn {
			width: 60rpx;
			height: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #f2f2f2;
			transition: all 0.2s ease;

			&:active {
				background-color: #e0e0e0;
			}

			&.disabled {
				opacity: 0.5;
				pointer-events: none;
			}

			.btn-icon {
				width: 24rpx;
				height: 24rpx;
				position: relative;

				&.minus::before {
					content: '';
					position: absolute;
					top: 50%;
					left: 0;
					width: 100%;
					height: 2rpx;
					background-color: #666;
					transform: translateY(-50%);
				}

				&.plus::before {
					content: '';
					position: absolute;
					top: 50%;
					left: 0;
					width: 100%;
					height: 2rpx;
					background-color: #666;
					transform: translateY(-50%);
				}

				&.plus::after {
					content: '';
					position: absolute;
					top: 0;
					left: 50%;
					width: 2rpx;
					height: 100%;
					background-color: #666;
					transform: translateX(-50%);
				}
			}
		}

		.stepper-input {
			width: 80rpx;
			height: 100%;
			text-align: center;
			font-size: 26rpx;
			color: #333;
			background-color: #fff;
			border-left: 1rpx solid #e0e0e0;
			border-right: 1rpx solid #e0e0e0;
		}
	}

	// 品牌选择样式
	.brand-selection {
		display: flex;
		flex-wrap: nowrap;
		padding: 15rpx;
		gap: 12rpx;
		justify-content: space-between;

		.brand-item {
			flex: 1;
			min-width: 100rpx;
			height: 70rpx;
			background-color: #f5f7fa;
			border-radius: 35rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			position: relative;
			padding: 0 15rpx;
			transition: all 0.3s ease;
			border: 1rpx solid rgba(0, 0, 0, 0.05);
			overflow: hidden;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: linear-gradient(135deg, #4481eb, #04befe);
				opacity: 0;
				transition: opacity 0.3s ease;
				z-index: 1;
			}

			&.active {
				border: none;
				box-shadow: 0 4rpx 12rpx rgba(68, 129, 235, 0.25);

				&::before {
					opacity: 1;
				}

				.brand-name {
					color: #fff;
					font-weight: 500;
					transform: scale(1.05);
				}

				.brand-check {
					opacity: 1;
					transform: scale(1);
					background-color: #fff;
					box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);

					&::before {
						border-color: #4481eb;
					}
				}
			}

			.brand-name {
				font-size: 26rpx;
				color: #333;
				text-align: center;
				transition: all 0.3s ease;
				position: relative;
				z-index: 2;
			}

			.brand-check {
				position: absolute;
				right: 8rpx;
				top: 8rpx;
				width: 16rpx;
				height: 16rpx;
				border-radius: 50%;
				background-color: #4481eb;
				opacity: 0;
				transform: scale(0.8);
				transition: all 0.3s ease;
				z-index: 2;

				&::before {
					content: '';
					position: absolute;
					width: 6rpx;
					height: 8rpx;
					border-right: 2rpx solid #fff;
					border-bottom: 2rpx solid #fff;
					transform: rotate(45deg);
					top: 3rpx;
					left: 5rpx;
				}
			}

			&:active {
				transform: scale(0.95);
				opacity: 0.9;
			}

			&:hover {
				background-color: #f0f3f9;
			}
		}
	}

	// 服务时效费用网格
	.time-fee-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16rpx;
		padding: 10rpx;
	}

	.time-fee-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #f9f9f9;
		border-radius: 10rpx;
		padding: 16rpx 20rpx;
		border: 1rpx solid rgba(0, 0, 0, 0.05);

		.time-label {
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
		}

		.fee-input-wrapper {
			display: flex;
			align-items: center;

			.fee-input {
				width: 100rpx;
				height: 60rpx;
				background-color: #fff;
				border: 1rpx solid #e0e0e0;
				border-radius: 8rpx;
				text-align: center;
			}

			.fee-unit {
				font-size: 24rpx;
				color: #666;
				margin-left: 8rpx;
			}
		}

		// 空数据提示样式
		.empty-time-options {
			padding: 40rpx 0;
			text-align: center;

			.empty-text {
				font-size: 28rpx;
				color: #999;
			}
		}

		&:hover {
			background-color: #f5f5f5;
		}
	}

	// 批量修改弹窗样式
	.bulk-modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40rpx;
	}

	.bulk-modal {
		background-color: #fff;
		border-radius: 16rpx;
		width: 100%;
		max-width: 600rpx;
		max-height: 85vh;
		overflow: hidden;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
	}

	.bulk-modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.bulk-modal-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}

		.bulk-modal-close {
			width: 40rpx;
			height: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 40rpx;
			color: #999;
			line-height: 1;
		}
	}

	.bulk-modal-content {
		padding: 24rpx;
		flex: 1;
		overflow-y: auto;
		max-height: calc(85vh - 200rpx);
	}

	.bulk-section {
		margin-bottom: 30rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.bulk-section-title {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 16rpx;
		}
	}

	.bulk-area-selector {
		max-height: 300rpx;
		overflow-y: auto;
		border: 1rpx solid #e0e0e0;
		border-radius: 8rpx;
	}

	.bulk-province-item {
		border-bottom: 1rpx solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}
	}

	.bulk-province-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12rpx 16rpx;
		background-color: #f8f9fa;
		transition: all 0.3s ease;

		&:active {
			background-color: #e9ecef;
		}

		.province-checkbox-wrapper {
			display: flex;
			align-items: center;
			flex: 1;
		}

		.province-name {
			font-size: 28rpx;
			font-weight: 500;
			color: #333;
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

			text {
				font-size: 20rpx;
				color: #666;
			}
		}
	}

	.bulk-cities-list {
		background-color: #fff;
	}

	.bulk-city-item {
		border-bottom: 1rpx solid #f5f5f5;

		&:last-child {
			border-bottom: none;
		}
	}

	.bulk-city-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10rpx 16rpx 10rpx 32rpx;
		background-color: #fafbfc;
		transition: all 0.3s ease;

		&:active {
			background-color: #f0f1f2;
		}

		.city-checkbox-wrapper {
			display: flex;
			align-items: center;
			flex: 1;
		}

		.city-name {
			font-size: 26rpx;
			color: #555;
		}

		.expand-icon {
			width: 20rpx;
			height: 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: transform 0.3s ease;

			&.expanded {
				transform: rotate(180deg);
			}

			text {
				font-size: 18rpx;
				color: #888;
			}
		}
	}

	.bulk-districts-list {
		background-color: #fff;
	}

	.bulk-district-item {
		display: flex;
		align-items: center;
		padding: 8rpx 16rpx 8rpx 48rpx;
		border-bottom: 1rpx solid #f8f9fa;
		transition: all 0.3s ease;

		&:last-child {
			border-bottom: none;
		}

		&.selected {
			background-color: rgba(36, 146, 242, 0.1);
		}

		&:active {
			background-color: #f5f5f5;
		}

		.district-name {
			font-size: 24rpx;
			color: #666;
		}
	}

	.area-checkbox {
		width: 20rpx;
		height: 20rpx;
		border: 2rpx solid #ddd;
		border-radius: 4rpx;
		margin-right: 12rpx;
		position: relative;
		transition: all 0.3s ease;

		&.checked {
			background-color: #2492F2;
			border-color: #2492F2;

			&::after {
				content: '';
				position: absolute;
				width: 8rpx;
				height: 4rpx;
				border-right: 2rpx solid #fff;
				border-bottom: 2rpx solid #fff;
				transform: rotate(45deg);
				top: 4rpx;
				left: 5rpx;
			}
		}

		&.indeterminate {
			background-color: #2492F2;
			border-color: #2492F2;

			&::after {
				content: '';
				position: absolute;
				width: 10rpx;
				height: 2rpx;
				background-color: #fff;
				top: 8rpx;
				left: 4rpx;
			}
		}
	}

	.bulk-brand-selection {
		display: flex;
		gap: 12rpx;
		flex-wrap: wrap;
	}

	.bulk-brand-item {
		flex: 1;
		min-width: 100rpx;
		height: 60rpx;
		background-color: #f5f7fa;
		border-radius: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 0.3s ease;
		border: 1rpx solid rgba(0, 0, 0, 0.05);

		&.active {
			background-color: #2492F2;
			border-color: #2492F2;

			.bulk-brand-name {
				color: #fff;
			}

			.bulk-brand-check {
				opacity: 1;
			}
		}

		.bulk-brand-name {
			font-size: 24rpx;
			color: #333;
			transition: all 0.3s ease;
		}

		.bulk-brand-check {
			position: absolute;
			right: 6rpx;
			top: 6rpx;
			width: 12rpx;
			height: 12rpx;
			border-radius: 50%;
			background-color: #fff;
			opacity: 0;
			transition: all 0.3s ease;

			&::before {
				content: '';
				position: absolute;
				width: 4rpx;
				height: 2rpx;
				border-right: 1rpx solid #2492F2;
				border-bottom: 1rpx solid #2492F2;
				transform: rotate(45deg);
				top: 3rpx;
				left: 3rpx;
			}
		}
	}

	.bulk-settings-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16rpx;
	}

	.bulk-setting-item {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;

		.bulk-setting-label {
			font-size: 26rpx;
			color: #333;
			flex: 1;
			margin-right: 16rpx;
			margin-top: 15rpx;
		}

		.bulk-input-wrapper {
			display: flex;
			flex-direction: column;
			gap: 6rpx;
			min-width: 120rpx;

			.bulk-setting-input {
				width: 120rpx;
				height: 60rpx;
				border: 1rpx solid #e0e0e0;
				border-radius: 8rpx;
				padding: 0 10rpx;
				text-align: center;
				font-size: 24rpx;
				background-color: #f9f9f9;

				&:focus {
					border-color: #2492F2;
					background-color: #fff;
				}
			}

			.last-setting-reference {
				font-size: 20rpx;
				color: #999;
				text-align: center;
				line-height: 1.2;
				padding: 0 5rpx;
			}
		}

		// 兼容旧的直接输入框样式
		.bulk-setting-input {
			width: 120rpx;
			height: 60rpx;
			border: 1rpx solid #e0e0e0;
			border-radius: 8rpx;
			padding: 0 10rpx;
			text-align: center;
			font-size: 24rpx;
			background-color: #f9f9f9;

			&:focus {
				border-color: #2492F2;
				background-color: #fff;
			}
		}
	}

	.bulk-modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 15rpx;
		padding: 20rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom, 0px));
		border-top: 1rpx solid #f0f0f0;
		flex-shrink: 0;
		background-color: #fff;

		.bulk-cancel-btn {
			padding: 0 20rpx;
			height: 60rpx;
			line-height: 60rpx;
			border-radius: 30rpx;
			font-size: 26rpx;
			background-color: #f5f5f5;
			color: #666;
		}

		.bulk-confirm-btn {
			padding: 0 20rpx;
			height: 60rpx;
			line-height: 60rpx;
			border-radius: 30rpx;
			font-size: 26rpx;
			background-color: #2492F2;
			color: #fff;
		}
	}

	/* 业务板块选择器样式 */
	.business-module-selector {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		padding: 20rpx 0;
	}

	.module-item {
		flex: 1;
		min-width: 200rpx;
		height: 80rpx;
		background-color: #f8f9fa;
		border: 2rpx solid #e9ecef;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 0.3s ease;
		cursor: pointer;

		&.active {
			background-color: #2492F2;
			border-color: #2492F2;

			.module-name {
				color: #fff;
			}

			.status-text {
				color: rgba(255, 255, 255, 0.8);
			}
		}

		.module-name {
			font-size: 28rpx;
			font-weight: 500;
			color: #333;
			margin-bottom: 4rpx;
			transition: all 0.3s ease;
		}

		.module-status {
			.status-text {
				font-size: 20rpx;
				color: #666;
				transition: all 0.3s ease;

				&.available {
					color: #28a745;
				}

				&.development {
					color: #ffc107;
				}
			}
		}
	}

	/* 异常服务分组样式 */
	.exception-service-group {
		margin-bottom: 40rpx;
		padding: 24rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		border-left: 4rpx solid #2492F2;

		.service-group-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #2492F2;
			margin-bottom: 20rpx;
			padding-bottom: 12rpx;
			border-bottom: 1rpx solid #e9ecef;
		}
	}

	/* 业务板块开发中提示样式 */
	.module-development-notice {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 40rpx;
		margin: 40rpx 0;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border-radius: 16rpx;
		border: 2rpx dashed #dee2e6;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

		.development-icon {
			font-size: 100rpx;
			margin-bottom: 24rpx;
			animation: bounce 2s infinite;
		}

		.development-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #495057;
			margin-bottom: 16rpx;
			text-align: center;
		}

		.development-text {
			font-size: 28rpx;
			color: #6c757d;
			text-align: center;
			line-height: 1.5;
		}
	}

	/* 待开发状态样式 */
	.under-development {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 40rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		border: 2rpx dashed #dee2e6;

		.development-icon {
			font-size: 80rpx;
			margin-bottom: 20rpx;
		}

		.development-text {
			font-size: 28rpx;
			color: #6c757d;
			text-align: center;
		}
	}

	/* 弹跳动画 */
	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-10rpx);
		}
		60% {
			transform: translateY(-5rpx);
		}
	}

	/* 批量修改弹窗中的异常服务分组样式 */
	.bulk-exception-group {
		margin-bottom: 30rpx;
		padding: 20rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		border-left: 4rpx solid #2492F2;

		.bulk-exception-title {
			font-size: 28rpx;
			font-weight: 600;
			color: #2492F2;
			margin-bottom: 16rpx;
			padding-bottom: 8rpx;
			border-bottom: 1rpx solid #e9ecef;
		}
	}

	/* 批量修改弹窗中的待开发状态样式 */
	.bulk-under-development {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60rpx 40rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		border: 2rpx dashed #dee2e6;

		.bulk-development-text {
			font-size: 26rpx;
			color: #6c757d;
			text-align: center;
		}
	}
</style>