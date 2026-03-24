<template>
  <view class="rider-list-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="骑手列表" title-align="center"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 固定的顶部区域 -->
    <view class="fixed-top">
      <!-- 搜索和筛选区域 -->
      <view class="search-filter">
        <view class="search-box">
          <view class="search-icon-wrapper">
            <view class="search-icon"></view>
          </view>
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="输入骑手昵称、ID、手机号搜索"
            class="search-input"
            @confirm="searchRiders"
          />
          <view class="search-btn" @click="searchRiders">搜索</view>
        </view>
        <view class="filter-options">
          <!-- 骑手认证状态筛选 -->
          <view class="filter-section">
            <view class="filter-title">
              <view class="title-icon status-icon"></view>
              <text>认证状态</text>
            </view>
            <view class="filter-items">
              <view
                class="filter-item"
                :class="{ active: currentCertStatus === status.value }"
                v-for="status in certStatusOptions"
                :key="status.value"
                @click="switchCertStatus(status.value)"
              >
                {{ status.label }}
                <!-- 显示徽标数 -->
                <view class="badge" v-if="status.value !== 'all' && getCertificationCount(status.label) > 0">
                  {{ getCertificationCount(status.label) }}
                </view>
              </view>
            </view>
          </view>

          <!-- 服务区域筛选 -->
          <view class="filter-section">
            <view class="filter-title">
              <view class="title-icon zone-icon"></view>
              <text>服务区域</text>
            </view>
            <view class="filter-items">
              <view class="zone-selector" @click="showCascadeSelector">
                <text class="zone-text">{{ zoneOptions.length > 0 ? zoneOptions[0].label : '全部区域' }}</text>
                <view class="zone-arrow"></view>
              </view>
            </view>
          </view>

          <!-- 级联选择器 -->
          <view class="cascade-mask" v-if="showCascade" @click="hideCascadeSelector"></view>
          <view class="cascade-container" v-if="showCascade">
            <view class="cascade-header">
              <view class="cascade-title">选择区域</view>
              <view class="cascade-close" @click="hideCascadeSelector">×</view>
            </view>

            <view class="cascade-tabs">
              <view
                class="cascade-tab"
                :class="{ active: currentLevel === 'province' }"
                @click="currentLevel = 'province'"
              >
                {{ selectedProvince ? (provinceList.find(p => p.province_id === selectedProvince) ? provinceList.find(p => p.province_id === selectedProvince).name : '省份') : '省份' }}
              </view>
              <view
                class="cascade-tab"
                :class="{ active: currentLevel === 'city', disabled: !selectedProvince }"
                @click="selectedProvince && (currentLevel = 'city')"
              >
                {{ selectedCity ? (cityList.find(c => c.city_id === selectedCity) ? cityList.find(c => c.city_id === selectedCity).name : '城市') : '城市' }}
              </view>
              <view
                class="cascade-tab"
                :class="{ active: currentLevel === 'district', disabled: !selectedCity }"
                @click="selectedCity && (currentLevel = 'district')"
              >
                {{ selectedDistrict ? (districtList.find(d => d.district_id === selectedDistrict) ? districtList.find(d => d.district_id === selectedDistrict).name : '区县') : '区县' }}
              </view>
            </view>

            <view class="cascade-content">
              <!-- 省份列表 -->
              <scroll-view
                scroll-y
                class="cascade-list"
                v-if="currentLevel === 'province'"
              >
                <view
                  class="cascade-item"
                  :class="{ active: selectedProvince === province.province_id }"
                  v-for="province in provinceList"
                  :key="province.province_id"
                  @click="selectProvince(province.province_id)"
                >
                  {{ province.name }}
                </view>
              </scroll-view>

              <!-- 城市列表 -->
              <scroll-view
                scroll-y
                class="cascade-list"
                v-if="currentLevel === 'city'"
              >
                <view
                  class="cascade-item"
                  :class="{ active: selectedCity === city.city_id }"
                  v-for="city in cityList"
                  :key="city.city_id"
                  @click="selectCity(city.city_id)"
                >
                  {{ city.name }}
                </view>
              </scroll-view>

              <!-- 区县列表 -->
              <scroll-view
                scroll-y
                class="cascade-list"
                v-if="currentLevel === 'district'"
              >
                <view
                  class="cascade-item"
                  :class="{ active: selectedDistrict === district.district_id }"
                  v-for="district in districtList"
                  :key="district.district_id"
                  @click="selectDistrict(district.district_id)"
                >
                  {{ district.name }}
                </view>
              </scroll-view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 列表内容区域的占位元素 -->
    <view class="search-filter-placeholder"></view>

    <!-- 骑手列表 -->
    <scroll-view
      class="rider-list"
      scroll-y
      @scrolltolower="onScrollToLower"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="refreshRiders"
      :refresher-threshold="100"
      :refresher-background="'#f8f9fa'"
      :bounces="false"
      lower-threshold="50"
    >
      <!-- 加载中提示 - 仅在第一页加载时显示 -->
      <view v-if="loading && !refreshing && page === 1" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="riderList.length === 0" class="empty-state">
        <view class="empty-icon"></view>
        <text class="empty-text">暂无相关骑手</text>
      </view>

      <!-- 骑手列表内容 -->
      <view v-else class="rider-list-content">
        <view
          class="rider-item"
          v-for="(rider, index) in riderList"
          :key="index"
          @click="showRiderDetail(rider)"
        >
          <!-- 推荐标识 - 绝对定位在右上角 -->
          <view v-if="rider.referrer_id" class="referral-badge">{{rider.referrer_id}}荐</view>

          <view class="rider-header">
            <view class="rider-avatar-section">
              <view class="rider-avatar">
                <image src="https://ccpt.qiniu.cc111.cn/rider/verify/touxiang.png" mode="aspectFill"></image>
              </view>

              <!-- 骑手认证状态 - 放在头像下面 -->
              <view class="cert-status-wrapper" v-if="rider.submit_certification">
                <!-- 已通过状态 - 添加向下箭头图标 -->
                <view
                  v-if="rider.submit_certification === '已通过'"
                  class="cert-status-badge approved clickable"
                  @click.stop="rider.latest_certification && showCertificationDetail(rider)"
                >
                  <view class="cert-icon cert-approved-icon"></view>
                  <text class="cert-approved">{{ formatCertificationStatus(rider.submit_certification) }}</text>
                  <view v-if="rider.latest_certification" class="arrow-down"></view>
                </view>

                <!-- 其他状态 -->
                <template v-else>
                  <view
                    class="cert-status-badge"
                    :class="{'clickable': rider.latest_certification && (rider.submit_certification === '待审核' || rider.submit_certification === '已拒绝')}"
                    @click.stop="rider.latest_certification && (rider.submit_certification === '待审核' || rider.submit_certification === '已拒绝') && showCertificationDetail(rider)"
                  >
                    <view v-if="rider.submit_certification === '待审核'" class="cert-icon cert-pending-icon"></view>
                    <view v-else-if="rider.submit_certification === '已拒绝'" class="cert-icon cert-rejected-icon"></view>
                    <view v-else-if="rider.submit_certification === '未提交'" class="cert-icon cert-none-icon"></view>
                    <text
                      :class="{
                        'cert-none': rider.submit_certification === '未提交' || !rider.submit_certification,
                        'cert-pending': rider.submit_certification === '待审核',
                        'cert-rejected': rider.submit_certification === '已拒绝'
                      }"
                    >{{ formatCertificationStatus(rider.submit_certification) }}</text>
                    <view v-if="rider.latest_certification && (rider.submit_certification === '待审核' || rider.submit_certification === '已拒绝')" class="arrow-down"></view>
                  </view>
                </template>
              </view>
            </view>

            <view class="rider-info">
              <view class="rider-name-row">
                <view class="rider-name">
                  <text class="main-name" v-if="rider.real_name">{{ rider.real_name }}</text>
                  <text class="main-name" v-else>{{ rider.contact_person || '未设置姓名' }}</text>
                  <text class="sub-name" v-if="rider.real_name && rider.contact_person">（{{ rider.contact_person }}）</text>
                  <view class="rider-level-tag">等级{{ rider.level || '1' }}</view>
                </view>
                <view class="rider-balance-wrapper">
                  <text class="balance-label">余额:</text>
                  <text class="rider-balance">¥{{ rider.balance || '0.00' }}</text>
                </view>
              </view>
              <view class="rider-phone-row">
                <view class="rider-phone">
                  <text class="phone-label">电话：</text>
                  <text class="phone-text">{{ rider.phone_number }}</text>
                  <view class="copy-btn" @click.stop="copyText(rider.phone_number, '手机号')">
                    <!-- 复制 -->
                    <image src="https://ccpt.qiniu.cc111.cn/adminEnd/copy.svg" style="width: 26rpx; height: 26rpx;"></image>
                  </view>
                </view>
                <view class="rider-rate-wrapper">
                  <text class="rate-label">佣金:</text>
                  <text class="rider-rate">{{ formatRate(rider.rate) }}%</text>
                </view>
              </view>
              <view class="rider-weixin-row" v-if="rider.weixin">
                <view class="rider-weixin">
                  <text class="weixin-label">微信：</text>
                  <text class="weixin-text">{{ rider.weixin }}</text>
                  <view class="copy-btn" @click.stop="copyText(rider.weixin, '微信号')">
                    <!-- 复制 -->
                    <image src="https://ccpt.qiniu.cc111.cn/adminEnd/copy.svg" style="width: 26rpx; height: 26rpx;"></image>
                  </view>
                </view>
                <view class="rider-deposit-wrapper">
                  <text class="deposit-label">保证金:</text>
                  <text class="rider-deposit">¥{{ rider.actual_deposit || '0.00' }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="rider-details">
            <view class="detail-item registration-time-item">
              <view class="registration-time-left">
                <text class="detail-label">注册:</text>
                <text class="detail-value">{{ formatDate(rider.created_at) }}</text>
              </view>
              <view class="rider-id-wrapper">
                <text class="detail-label">ID:</text>
                <text class="detail-value">{{ rider.service_member_id }}</text>
              </view>
            </view>

            <!-- 服务区域 -->
            <view class="detail-item service-zone-item" style="width: 100%;">
              <text class="detail-label">区域:</text>
              <view class="service-zone-wrapper">
                <text v-if="!rider.zone || rider.zone.length === 0" class="detail-value cert-none">未设置</text>
                <view v-else class="service-zone-tags">
                  <!-- 未展开状态：显示前3个区域 -->
                  <template v-if="!isZoneExpanded(rider.service_member_id) && rider.zone.length > 0">
                    <text v-for="(zone, zIndex) in rider.zone.slice(0, 3)" :key="zIndex" class="zone-tag">{{ zone }}</text>
                    <view
                      v-if="rider.zone.length > 3"
                      class="zone-expand-btn"
                      @click.stop="toggleZoneExpand(rider.service_member_id)"
                    >
                      <text class="zone-count">查看全部{{ rider.zone.length }}个</text>
                      <view class="arrow-down"></view>
                    </view>
                  </template>

                  <!-- 展开状态：显示所有区域 -->
                  <template v-if="isZoneExpanded(rider.service_member_id)">
                    <text v-for="(zone, zIndex) in rider.zone" :key="zIndex" class="zone-tag">{{ zone }}</text>
                    <view
                      class="zone-expand-btn"
                      @click.stop="toggleZoneExpand(rider.service_member_id)"
                    >
                      <text class="zone-count">收起列表</text>
                      <view class="arrow-up"></view>
                    </view>
                  </template>
                </view>
              </view>
            </view>

            <!-- 服务品牌 -->
            <view class="detail-item service-brands-item" style="width: 100%;">
              <text class="detail-label">品牌:</text>
              <view class="service-brands-wrapper">
                <text v-if="!rider.service_brands || rider.service_brands.length === 0" class="detail-value cert-none">未设置</text>
                <view v-else class="service-brands-tags">
                  <text v-for="(brand, bIndex) in rider.service_brands" :key="bIndex" class="brand-tag">{{ formatBrandName(brand) }}</text>
                </view>
              </view>
            </view>
            <!-- 拒绝理由显示 -->
            <view v-if="rider.submit_certification === '已拒绝' && rider.latest_certification && rider.latest_certification.reject_reason" class="detail-item reject-reason-item" style="width: 100%;">
              <text class="detail-label">拒绝理由:</text>
              <text class="detail-value reject-reason-text">{{ rider.latest_certification.reject_reason }}</text>
            </view>
          </view>
          <view class="rider-actions">
            <view class="action-btn edit" @click.stop="showEditModal(rider)">编辑</view>
            <view class="action-btn edit" @click.stop="showZoneEditModal(rider)">编辑区域</view>
            <view class="action-btn reset" @click.stop="showResetPasswordModal(rider)">密码</view>
            <view v-if="rider.submit_certification === '待审核' && rider.latest_certification" class="action-btn verify" @click.stop="showVerifyModal(rider)">
              审核
            </view>
            <!-- <view class="action-btn" :class="rider.status === 0 ? 'disable' : 'enable'" @click.stop="toggleRiderStatus(rider)">
              {{ rider.status === 0 ? '禁用' : '启用' }}
            </view> -->
          </view>
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view v-if="riderList.length > 0 && loading && page > 1" class="loading-more">
        <view class="loading-spinner-small"></view>
        <text>加载中...</text>
      </view>
      <view v-else-if="riderList.length > 0 && hasMore" class="load-more" @click="loadMoreRiders">
        <text>点击加载更多</text>
      </view>
      <view v-else-if="riderList.length > 0 && !hasMore" class="no-more">
        <text>没有更多数据了</text>
      </view>
    </scroll-view>

    <!-- 编辑骑手信息弹窗 -->
    <view class="modal-mask" v-if="showEdit" @click="closeEditModal"></view>
    <view class="modal-container" v-if="showEdit">
      <view class="modal-header">
        <text class="modal-title">编辑骑手信息</text>
        <view class="modal-close" @click="closeEditModal">×</view>
      </view>
      <view class="modal-content">
        <view class="input-group">
          <text class="input-label">姓名</text>
          <input type="text" v-model="editForm.contact_person" placeholder="请输入姓名" class="input-field" disabled />
        </view>
        <view class="input-group">
          <text class="input-label">手机号</text>
          <input type="text" v-model="editForm.phone_number" placeholder="请输入手机号" class="input-field" disabled />
        </view>
        <view class="input-group">
          <text class="input-label">骑手等级</text>
          <input type="number" v-model="editForm.level" placeholder="请输入骑手等级" class="input-field" />
        </view>
        <view class="input-group">
          <text class="input-label">佣金比例(%)</text>
          <input type="digit" v-model="editForm.rate" placeholder="请输入佣金比例" class="input-field" />
        </view>
        <view class="input-group">
          <text class="input-label">账户余额(¥)</text>
          <input type="digit" v-model="editForm.balance" placeholder="请输入账户余额" class="input-field" disabled />
        </view>
        <view class="input-group">
          <text class="input-label">实际保证金(¥)</text>
          <input type="digit" v-model="editForm.actual_deposit" placeholder="请输入实际保证金" class="input-field" disabled />
        </view>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="closeEditModal">取消</view>
        <view class="modal-btn confirm" @click="confirmEdit">确认</view>
      </view>
    </view>

    <!-- 编辑服务区域弹窗 -->
    <view class="modal-mask" v-if="showZoneEdit" @click="showZoneEdit = false"></view>
    <view class="modal-container" v-if="showZoneEdit">
      <view class="modal-header">
        <text class="modal-title">编辑服务区域</text>
        <view class="modal-close" @click="showZoneEdit = false">×</view>
      </view>
      <view class="modal-content">
        <view class="province-list">
          <view v-for="province in allZones" :key="province.province_id" class="province-block">
            <!-- 省份标题，点击展开/折叠 -->
            <view class="province-header" @click="toggleProvince(province.province_id)">
              <view class="province-name">{{ province.name }}</view>
              <view class="toggle-icon" :class="{ 'expanded': isProvinceExpanded(province.province_id) }">
                <text>{{ isProvinceExpanded(province.province_id) ? '收起' : '展开' }}</text>
              </view>
            </view>

            <!-- 城市列表，默认不展开 -->
            <view v-if="isProvinceExpanded(province.province_id)" class="city-list">
              <view v-for="city in province.children" :key="city.city_id" class="city-block">
                <!-- 城市标题，点击展开/折叠 -->
                <view class="city-header" @click="toggleCity(province.province_id, city.city_id)">
                  <view class="city-name">{{ city.name }}</view>
                  <view class="toggle-icon" :class="{ 'expanded': isCityExpanded(province.province_id, city.city_id) }">
                    <text>{{ isCityExpanded(province.province_id, city.city_id) ? '收起' : '展开' }}</text>
                  </view>
                </view>

                <!-- 区县列表，默认不展开 -->
                <view v-if="isCityExpanded(province.province_id, city.city_id)" class="zone-list">
                  <view
                    v-for="district in city.children"
                    :key="district.district_id"
                    class="zone-item"
                    :class="{ selected: selectedZones.includes(district.district_id) }"
                    @click="toggleZone(district.district_id, district.name)"
                  >
                    {{ district.name }}
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="cascade-safe-area-bottom"></view> <!-- 底部安全区域 -->
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="showZoneEdit = false">取消</view>
        <view class="modal-btn confirm" @click="saveZoneEdit">保存</view>
      </view>
    </view>

    <!-- 审核弹窗 -->
    <view class="modal-mask" v-if="showVerify" @click="closeVerifyModal"></view>
    <view class="modal-container" v-if="showVerify">
      <view class="modal-header">
        <text class="modal-title">骑手认证审核</text>
        <view class="modal-close" @click="closeVerifyModal">×</view>
      </view>
      <view class="modal-content">
        <view class="input-group">
          <text class="input-label">真实姓名</text>
          <input type="text" :value="currentRider.latest_certification && currentRider.latest_certification.real_name || '未设置'" class="input-field" disabled />
        </view>
        <view class="input-group">
          <text class="input-label">手机号码</text>
          <input type="text" :value="currentRider.latest_certification && currentRider.latest_certification.phone_number || '未设置'" class="input-field" disabled />
        </view>
        <view class="input-group">
          <text class="input-label">微信号</text>
          <input type="text" :value="currentRider.latest_certification && currentRider.latest_certification.wechat_id || '未设置'" class="input-field" disabled />
        </view>
        <view class="input-group">
          <text class="input-label">身份证号</text>
          <input type="text" :value="currentRider.latest_certification && currentRider.latest_certification.id_card_number || '未设置'" class="input-field" disabled />
        </view>
        <view class="input-group">
          <text class="input-label">申请时间</text>
          <input type="text" :value="currentRider.latest_certification && currentRider.latest_certification.created_at || '未知'" class="input-field" disabled />
        </view>

        <view class="input-group" style="margin-top: 20rpx;">
          <text class="input-label">身份证照片</text>
        </view>
        <view class="id-card-images">
          <view class="id-card-item">
            <text class="id-card-label">身份证正面</text>
            <image
              :src="currentRider.latest_certification && currentRider.latest_certification.id_card_front_url"
              mode="aspectFit"
              class="id-card-image"
              @click="previewImage(currentRider.latest_certification && currentRider.latest_certification.id_card_front_url)"
            />
          </view>
          <view class="id-card-item">
            <text class="id-card-label">身份证背面</text>
            <image
              :src="currentRider.latest_certification && currentRider.latest_certification.id_card_back_url"
              mode="aspectFit"
              class="id-card-image"
              @click="previewImage(currentRider.latest_certification && currentRider.latest_certification.id_card_back_url)"
            />
          </view>
        </view>

        <!-- 显示之前的拒绝理由（如果有） -->
        <view v-if="currentRider.latest_certification && currentRider.latest_certification.reject_reason" class="input-group" style="margin-top: 20rpx;">
          <text class="input-label" style="color: #ff4757;">上次拒绝理由</text>
          <view class="reject-reason-box">
            {{ currentRider.latest_certification.reject_reason }}
          </view>
        </view>

        <view class="input-group" style="margin-top: 20rpx;">
          <text class="input-label" style="color: #2492F2; font-weight: bold;">是否通过该骑手的认证申请？</text>
        </view>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="closeVerifyModal" :class="{ 'btn-disabled': verifyLoading }">取消</view>
        <view class="modal-btn reject" @click="rejectVerify" :class="{ 'btn-disabled': verifyLoading }">
          <view v-if="verifyLoading" class="btn-loading-small"></view>
          <text>拒绝</text>
        </view>
        <view class="modal-btn confirm" @click="approveVerify" :class="{ 'btn-disabled': verifyLoading }">
          <view v-if="verifyLoading" class="btn-loading-small"></view>
          <text>通过</text>
        </view>
      </view>
    </view>

    <!-- 拒绝理由弹窗 -->
    <view class="modal-mask reject-modal-mask" v-if="showRejectDialog"></view>
    <view class="modal-container reject-modal-container" v-if="showRejectDialog">
      <view class="modal-header">
        <text class="modal-title">拒绝认证理由</text>
        <view class="modal-close" @click="showRejectDialog = false">×</view>
      </view>
      <view class="modal-content">
        <view class="input-group">
          <textarea
            v-model="rejectReason"
            placeholder="请输入拒绝理由，将会通知骑手"
            class="input-textarea"
            maxlength="200"
          ></textarea>
          <text class="textarea-counter">{{ rejectReason.length }}/200</text>
        </view>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="showRejectDialog = false">取消</view>
        <view class="modal-btn confirm" @click="confirmReject" :class="{ 'btn-disabled': !rejectReason.trim() || verifyLoading }">
          <view v-if="verifyLoading" class="btn-loading-small"></view>
          <text>确认</text>
        </view>
      </view>
    </view>

    <!-- 认证资料详情弹窗 -->
    <view class="modal-mask" v-if="showCertDetail" @click="closeCertDetail"></view>
    <view class="modal-container cert-detail-modal" v-if="showCertDetail">
      <view class="modal-header">
        <text class="modal-title">认证资料详情</text>
        <view class="modal-close" @click="closeCertDetail">×</view>
      </view>
      <view class="modal-content">
        <view class="input-group">
          <text class="input-label">真实姓名</text>
          <input type="text" :value="currentRider.latest_certification && currentRider.latest_certification.real_name || '未设置'" class="input-field" disabled />
        </view>
        <view class="input-group">
          <text class="input-label">手机号码</text>
          <input type="text" :value="currentRider.latest_certification && currentRider.latest_certification.phone_number || '未设置'" class="input-field" disabled />
        </view>
        <view class="input-group">
          <text class="input-label">微信号</text>
          <input type="text" :value="currentRider.latest_certification && currentRider.latest_certification.wechat_id || '未设置'" class="input-field" disabled />
        </view>
        <view class="input-group">
          <text class="input-label">身份证号</text>
          <input type="text" :value="currentRider.latest_certification && currentRider.latest_certification.id_card_number || '未设置'" class="input-field" disabled />
        </view>
        <view class="input-group">
          <text class="input-label">申请时间</text>
          <input type="text" :value="formatDate(currentRider.latest_certification && currentRider.latest_certification.created_at) || '未知'" class="input-field" disabled />
        </view>

        <view class="input-group" style="margin-top: 20rpx;">
          <text class="input-label">身份证照片</text>
        </view>
        <view class="id-card-images">
          <view class="id-card-item">
            <text class="id-card-label">身份证正面</text>
            <image
              :src="currentRider.latest_certification && currentRider.latest_certification.id_card_front_url"
              mode="aspectFit"
              class="id-card-image"
              @click="previewImage(currentRider.latest_certification && currentRider.latest_certification.id_card_front_url)"
            />
          </view>
          <view class="id-card-item">
            <text class="id-card-label">身份证背面</text>
            <image
              :src="currentRider.latest_certification && currentRider.latest_certification.id_card_back_url"
              mode="aspectFit"
              class="id-card-image"
              @click="previewImage(currentRider.latest_certification && currentRider.latest_certification.id_card_back_url)"
            />
          </view>
        </view>

        <!-- 显示拒绝理由（如果有） -->
        <view v-if="currentRider.latest_certification && currentRider.latest_certification.reject_reason" class="input-group" style="margin-top: 20rpx;">
          <text class="input-label" style="color: #ff4757;">拒绝理由</text>
          <view class="reject-reason-box">
            {{ currentRider.latest_certification.reject_reason }}
          </view>
        </view>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="closeCertDetail">关闭</view>
        <view v-if="currentRider.submit_certification === '待审核'" class="modal-btn reject" @click="rejectVerify">拒绝</view>
        <view v-if="currentRider.submit_certification === '待审核'" class="modal-btn confirm" @click="approveVerify">通过</view>
      </view>
    </view>



    <!-- 修改密码弹窗 -->
    <view class="modal-mask" v-if="showResetPassword" @click="closeResetPasswordModal"></view>
    <view class="modal-container" v-if="showResetPassword">
      <view class="modal-header">
        <text class="modal-title">修改骑手密码</text>
        <view class="modal-close" @click="closeResetPasswordModal">×</view>
      </view>
      <view class="modal-content">
        <view class="input-group">
          <text class="input-label">骑手手机号</text>
          <input type="text" v-model="resetPasswordForm.phone_number" class="input-field" disabled />
        </view>
        <view class="input-group">
          <text class="input-label">新密码</text>
          <input type="text" v-model="resetPasswordForm.new_password" class="input-field" />
        </view>
        <view class="input-group">
          <text class="input-label">确认新密码</text>
          <input type="text" v-model="resetPasswordForm.new_password_confirmation" class="input-field" />
        </view>
        <view class="reset-password-tips">
          <text class="tips-text">注意：修改密码后，骑手需要使用新密码登录。</text>
        </view>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="closeResetPasswordModal" :class="{ 'btn-disabled': resetPasswordLoading }">取消</view>
        <view class="modal-btn reset" @click="resetToDefaultPassword" :class="{ 'btn-disabled': resetPasswordLoading }">重置默认密码</view>
        <view class="modal-btn confirm" @click="confirmResetPassword" :class="{ 'btn-disabled': resetPasswordLoading }">
          <view v-if="resetPasswordLoading" class="btn-loading-small"></view>
          <text>确认修改</text>
        </view>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

export default {
  components: {
    NavBar
  },
  data() {
    return {
      searchKeyword: '',
      currentStatus: 'all',
      statusOptions: [
        { label: '全部', value: 'all' },
        { label: '正常', value: '0' },
        { label: '禁用', value: '1' }
      ],
      // 认证状态筛选选项
      currentCertStatus: 'all',
      certStatusOptions: [
        { label: '全部', value: 'all' },
        { label: '未认证', value: '未提交' },
        { label: '待审核', value: '待审核' },
        { label: '已认证', value: '已通过' },
        { label: '已拒绝', value: '已拒绝' }
      ],
      // 认证状态统计数据
      certificationStats: {
        not_submitted: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      },
      // 服务区域筛选
      showCascade: false, // 是否显示级联选择器
      currentLevel: 'province', // 当前级联选择器层级
      selectedProvince: null, // 选中的省份ID
      selectedCity: null, // 选中的城市ID
      selectedDistrict: null, // 选中的区县ID
      provinceList: [], // 省份列表
      cityList: [], // 城市列表
      districtList: [], // 区县列表
      zoneOptions: [{ label: '全部区域', value: 'all' }], // 区域选项
      riderList: [],
      loading: false,
      refreshing: false,
      page: 1,
      per_page: 10,
      hasMore: true,
      showEdit: false,
      currentRider: {},
      editForm: {
        service_member_id: '',
        contact_person: '',
        phone_number: '',
        level: '',
        rate: '',
        balance: '',
        actual_deposit: '',
        service_zone: [],
        zone: []
      },
      adminInfo: null,
      showZoneEdit: false,
      allZones: [], // 所有可选区县
      selectedZones: [], // 当前编辑骑手已选区县id
      selectedZoneNames: [], // 当前编辑骑手已选区县名称
      editingRiderId: null,
      expandedProvinces: {}, // 记录省份展开状态，格式: { 'provinceId': true }
      expandedCities: {}, // 记录城市展开状态，格式: { 'provinceId': { 'cityId': true } }
      showVerify: false, // 是否显示审核弹窗
      verifyLoading: false, // 审核操作加载状态
      rejectReason: '', // 拒绝认证理由
      showRejectDialog: false, // 是否显示拒绝理由输入弹窗
      expandedZones: [], // 存储已展开服务区域的骑手ID
      showCertDetail: false, // 是否显示认证资料详情弹窗
      showResetPassword: false, // 是否显示重置密码弹窗
      resetPasswordLoading: false, // 重置密码加载状态
      resetPasswordForm: {
        phone_number: '',
        new_password: '',
        new_password_confirmation: ''
      },
      defaultPassword: 'ccqs666'
    }
  },
  onLoad() {
    // 获取管理员信息
    this.adminInfo = uni.getStorageSync('riderUserInfo');

    // 加载服务区域数据
    this.fetchFilterZones();

    // 加载骑手列表
    this.getRiderList();
  },
  methods: {
    // 获取骑手列表
    async getRiderList() {
      if (this.loading) return;

      this.loading = true;
      try {
        // 检查管理员信息
        if (!this.adminInfo || !this.adminInfo.id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          this.loading = false;
          return;
        }

        // 构建请求参数
        const params = {
          service_member_id: this.adminInfo.id, // 使用固定值，根据接口要求
          sign: "chongchong",
          page: this.page,
          per_page: this.per_page
        };

        // 添加搜索关键字
        if (this.searchKeyword) {
          params.search_term = this.searchKeyword;
        }

        // 添加状态筛选
        if (this.currentStatus !== 'all') {
          params.status = this.currentStatus;
        }

        // 添加认证状态筛选 - 只有在没有搜索关键字时才添加
        if (this.currentCertStatus !== 'all' && !this.searchKeyword) {
          params.submit_certification = this.currentCertStatus;
        }

        // 添加服务区域筛选
        if (this.zoneOptions.length > 0 && this.zoneOptions[0].value !== 'all') {
          params.district_id = this.zoneOptions[0].value;
        }

        // 发送请求
        const res = await this.$request('service/member/list', params, 'POST');

        if (res.code === 200 && res.data) {
          // 处理返回的数据
          const newRiders = res.data || [];

          // 打印第一条数据，查看是否包含注册时间字段
          if (newRiders.length > 0) {
            console.log('骑手数据示例:', newRiders[0]);
          }

          // 追加新数据
          if (this.page === 1) {
            this.riderList = newRiders;

            // 如果是第一页，并且返回了认证统计数据，则更新统计数据
            if (res.certification_stats) {
              console.log('认证统计数据:', res.certification_stats);
              this.certificationStats = {
                not_submitted: res.certification_stats.not_submitted || 0,
                pending: res.certification_stats.pending || 0,
                approved: res.certification_stats.approved || 0,
                rejected: res.certification_stats.rejected || 0
              };
            } else {
              // 如果接口没有返回统计数据，手动计算
              console.log('接口未返回认证统计数据，手动计算...');
              this.calculateCertificationStats(newRiders);
            }
          } else {
            this.riderList = [...this.riderList, ...newRiders];
          }

          // 判断是否还有更多数据
          this.hasMore = newRiders.length === this.per_page;
        } else {
          uni.showToast({
            title: res.msg || '获取骑手列表失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('获取骑手列表失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 搜索骑手
    searchRiders() {
      this.page = 1;
      this.riderList = [];
      this.hasMore = true;
      this.getRiderList();
    },

    // 刷新骑手列表
    refreshRiders() {
      this.refreshing = true;
      this.page = 1;
      this.riderList = [];
      this.hasMore = true;
      this.getRiderList().finally(() => {
        this.refreshing = false;
      });
    },

    // 滚动到底部触发
    onScrollToLower() {
      if (this.hasMore && !this.loading) {
        // 自动加载更多
        this.loadMoreRiders();
      }
    },

    // 加载更多骑手
    loadMoreRiders() {
      if (this.hasMore && !this.loading) {
        this.page++;
        this.getRiderList();
      }
    },

    // 切换骑手状态筛选
    switchStatus(status) {
      this.currentStatus = status;
      this.page = 1;
      this.riderList = [];
      this.hasMore = true;
      this.getRiderList();
    },

    // 切换认证状态筛选
    switchCertStatus(status) {
      this.currentCertStatus = status;
      this.page = 1;
      this.riderList = [];
      this.hasMore = true;
      this.getRiderList();
    },

    // 获取认证状态对应的数量
    getCertificationCount(status) {
      // 将显示文本映射到接口返回的英文状态值
      const statusMap = {
        '未认证': 'not_submitted',
        '待审核': 'pending',
        '已认证': 'approved',
        '已拒绝': 'rejected'
      };

      // 获取对应的数量
      const key = statusMap[status];
      const count = key ? this.certificationStats[key] : 0;

      return count;
    },

    // 转换认证状态显示文本
    formatCertificationStatus(status) {
      const statusMap = {
        '未提交': '未认证',
        '已通过': '已认证',
        '待审核': '待审核',
        '已拒绝': '已拒绝'
      };
      return statusMap[status] || status;
    },

    // 手动计算认证统计数据
    calculateCertificationStats(riderList) {
      const stats = {
        not_submitted: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      };

      // 遍历骑手列表，统计各状态数量
      riderList.forEach(rider => {
        const status = rider.submit_certification;
        switch (status) {
          case '未提交':
            stats.not_submitted++;
            break;
          case '待审核':
            stats.pending++;
            break;
          case '已通过':
            stats.approved++;
            break;
          case '已拒绝':
            stats.rejected++;
            break;
        }
      });

      this.certificationStats = stats;
      console.log('手动计算的认证统计数据:', stats);
    },

    // 显示级联选择器
    showCascadeSelector() {
      this.showCascade = true;

      // 如果省份列表为空，则获取省份列表
      if (this.provinceList.length === 0) {
        this.getProvinceList();
      }
    },

    // 隐藏级联选择器
    hideCascadeSelector() {
      this.showCascade = false;
    },

    // 获取省份列表
    async getProvinceList() {
      try {
        // 从本地存储获取城市列表
        // const cityList = uni.getStorageSync('cityList');
        // if (cityList) {
        //   let parsedCityList;
        //   try {
        //     // 尝试解析 JSON 字符串
        //     parsedCityList = typeof cityList === 'string' ? JSON.parse(cityList) : cityList;

        //     // 设置省份列表
        //     this.provinceList = parsedCityList;
        //   } catch (error) {
        //     console.error('解析城市列表失败:', error);
        //   }
        // } else {
          // 如果本地存储没有城市列表，则从接口获取
          const res = await this.$request('service/zone', {
            // service_member_id: this.adminInfo && this.adminInfo.id ? this.adminInfo.id : '',
            sign: "chongchong"
          }, 'POST');

          if (res.code === 200 && res.data) {
            this.provinceList = res.data;
            // 保存到本地存储
            uni.setStorageSync('cityList', JSON.stringify(res.data));
          }
        // }
      } catch (err) {
        console.error('获取省份列表失败:', err);
      }
    },

    // 选择省份
    selectProvince(provinceId) {
      this.selectedProvince = provinceId;
      this.selectedCity = null;
      this.selectedDistrict = null;

      // 获取城市列表
      const province = this.provinceList.find(p => p.province_id === provinceId);
      if (province && province.children) {
        this.cityList = province.children;
      } else {
        this.cityList = [];
      }

      // 切换到城市层级
      this.currentLevel = 'city';
    },

    // 选择城市
    selectCity(cityId) {
      this.selectedCity = cityId;
      this.selectedDistrict = null;

      // 获取区县列表
      const city = this.cityList.find(c => c.city_id === cityId);
      if (city && city.children) {
        this.districtList = city.children;
      } else {
        this.districtList = [];
      }

      // 切换到区县层级
      this.currentLevel = 'district';
    },

    // 选择区县
    selectDistrict(districtId) {
      this.selectedDistrict = districtId;

      // 获取区县名称
      const district = this.districtList.find(d => d.district_id === districtId);
      const city = this.cityList.find(c => c.city_id === this.selectedCity);
      const province = this.provinceList.find(p => p.province_id === this.selectedProvince);

      // 更新区域选项
      if (district && city && province) {
        this.zoneOptions = [{
          label: `${province.name} ${city.name} ${district.name}`,
          value: districtId
        }];
      }

      // 隐藏级联选择器
      this.hideCascadeSelector();

      // 刷新列表
      this.page = 1;
      this.riderList = [];
      this.hasMore = true;

      // 添加区县ID筛选参数
      this.getRiderList();
    },

    // 获取服务区域数据
    async fetchFilterZones() {
      try {
        // 从本地存储获取城市列表
        // const cityList = uni.getStorageSync('cityList');
        // if (cityList) {
        //   let parsedCityList;
        //   try {
        //     // 尝试解析 JSON 字符串
        //     parsedCityList = typeof cityList === 'string' ? JSON.parse(cityList) : cityList;

        //     // 设置省份列表
        //     this.provinceList = parsedCityList;
        //     this.allZones = parsedCityList;
        //   } catch (error) {
        //     console.error('解析城市列表失败:', error);
        //   }
        // } else {
          // 如果本地存储没有城市列表，则从接口获取
          const res = await this.$request('service/zone', {
            // service_member_id: this.adminInfo && this.adminInfo.id ? this.adminInfo.id : '',
            sign: "chongchong"
          }, 'POST');

          if (res.code === 200 && res.data) {
            this.provinceList = res.data;
            this.allZones = res.data;
            // 保存到本地存储
            uni.setStorageSync('cityList', JSON.stringify(res.data));
          }
        // }
      } catch (err) {
        console.error('获取服务区域失败:', err);
        uni.showToast({
          title: '获取服务区域失败',
          icon: 'none'
        });
      }
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        0: '正常',
        1: '禁用'
      };
      return statusMap[status] || '未知';
    },

    // 格式化时间
    formatDate(timestamp) {
      if (!timestamp) return '未知';

      try {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
      } catch (err) {
        console.error('时间格式化错误:', err);
        return '格式错误';
      }
    },

    // 预览图片
    previewImage(url) {
      if (!url) return;

      uni.previewImage({
        urls: [url],
        current: url,
        indicator: 'number',
        loop: false
      });
    },

    // 显示骑手详情
    showRiderDetail(rider) {
      // 避免与展开服务区域的点击冲突
      if (event && event.target && (
        event.target.className.includes('zone-expand-btn') ||
        event.target.className.includes('zone-count') ||
        event.target.className.includes('arrow')
      )) {
        return;
      }

      // 可以在这里实现查看详情的逻辑
      console.log('查看骑手详情:', rider);
    },

    // 显示编辑弹窗
    showEditModal(rider) {
      this.currentRider = rider;
      this.editForm = {
        service_member_id: rider.service_member_id,
        contact_person: rider.contact_person || '',
        phone_number: rider.phone_number || '',
        level: rider.level || '',
        rate: rider.rate ? (rider.rate * 100).toFixed(2) : '',
        balance: rider.balance || '',
        actual_deposit: rider.actual_deposit || '',
        service_zone: Array.isArray(rider.service_zone) ? [...rider.service_zone] : [],
        zone: Array.isArray(rider.zone) ? [...rider.zone] : []
      };
      this.showEdit = true;
    },

    // 关闭编辑弹窗
    closeEditModal() {
      this.showEdit = false;
    },

    // 确认编辑
    async confirmEdit() {
      try {
        // 构建请求参数
        const params = {
          service_member_id: this.adminInfo.id, // 使用固定值，根据接口要求
          member_id: this.editForm.service_member_id,
          contact_person: this.editForm.contact_person,
          level: this.editForm.level,
          rate: this.editForm.rate ? (parseFloat(this.editForm.rate) / 100).toFixed(4) : '',
          balance: this.editForm.balance,
          actual_deposit: this.editForm.actual_deposit,
          service_zone: this.editForm.service_zone,
          zone: this.editForm.zone,
          sign: "chongchong"
        };

        // 发送请求
        const res = await this.$request('service/member/update/admin', params, 'POST');

        if (res.status === 'success') {
          uni.showToast({
            title: '更新成功',
            icon: 'success'
          });
          this.closeEditModal();

          // 更新本地数据，避免刷新整个列表
          const idx = this.riderList.findIndex(item => item.service_member_id === this.currentRider.service_member_id);
          if (idx !== -1) {
            this.riderList[idx] = {
              ...this.riderList[idx],
              contact_person: this.editForm.contact_person,
              phone_number: this.editForm.phone_number,
              level: this.editForm.level,
              rate: this.editForm.rate ? (parseFloat(this.editForm.rate) / 100) : '',
              balance: this.editForm.balance,
              actual_deposit: this.editForm.actual_deposit,
              service_zone: [...this.editForm.service_zone],
              zone: [...this.editForm.zone]
            };
          }

          // 如果当前编辑的骑手是本地存储的riderUserInfo，则同步更新本地存储
          let localUser = uni.getStorageSync('riderUserInfo');
          if (localUser && localUser.id === this.editForm.service_member_id) {
            localUser = {
              ...localUser,
              level: this.editForm.level,
              rate: this.editForm.rate ? (parseFloat(this.editForm.rate) / 100) : '',
              service_zone: [...this.editForm.service_zone],
              zone: [...this.editForm.zone]
            };
            uni.setStorageSync('riderUserInfo', localUser);
          }
        } else {
          uni.showToast({
            title: res.msg || '更新失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('更新骑手信息失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    },

    // 切换骑手状态（启用/禁用）
    async toggleRiderStatus(rider) {
      try {
        // 构建请求参数
        const newStatus = rider.status === 0 ? 1 : 0;
        const params = {
          service_member_id: "1", // 使用固定值，根据接口要求
          rider_id: rider.service_member_id,
          status: newStatus,
          sign: "chongchong"
        };

        // 发送请求
        const res = await this.$request('service/member/status/update', params, 'POST');

        if (res.code === 200) {
          uni.showToast({
            title: newStatus === 0 ? '已启用' : '已禁用',
            icon: 'success'
          });

          // 更新本地数据，避免刷新整个列表
          const index = this.riderList.findIndex(item => item.service_member_id === rider.service_member_id);
          if (index !== -1) {
            this.riderList[index] = {
              ...this.riderList[index],
              status: newStatus
            };
          }
        } else {
          uni.showToast({
            title: res.msg || '操作失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('更新骑手状态失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    },

    async fetchAllZones(rider) {
      // 如果已经有数据，则不再重复请求
      // if (this.allZones && this.allZones.length > 0) {
      //   return;
      // }

      const res = await this.$request('service/zone', {
        service_provider_id: rider.provider_id,
        sign: "chongchong"
      }, 'POST');

      if (res.code === 200 && res.data) {
        // 直接保留原始省-市-区结构，便于分组展示
        this.allZones = res.data;
      }
    },

    showZoneEditModal(rider) {
      this.editingRiderId = rider.service_member_id;
      this.selectedZones = Array.isArray(rider.service_zone) ? [...rider.service_zone] : [];
      this.selectedZoneNames = Array.isArray(rider.zone) ? [...rider.zone] : [];
      // 重置展开状态
      this.expandedProvinces = {};
      this.expandedCities = {};
      this.fetchAllZones(rider);
      this.showZoneEdit = true;
    },

    // 切换省份展开/折叠状态
    toggleProvince(provinceId) {
      // 切换省份的展开状态
      const currentState = this.isProvinceExpanded(provinceId);
      this.$set(this.expandedProvinces, provinceId, !currentState);
    },

    // 判断省份是否展开
    isProvinceExpanded(provinceId) {
      return this.expandedProvinces[provinceId] === true;
    },

    // 切换城市展开/折叠状态
    toggleCity(provinceId, cityId) {
      // 如果省份不存在于expandedCities中，先初始化
      if (!this.expandedCities[provinceId]) {
        this.$set(this.expandedCities, provinceId, {});
      }

      // 切换城市的展开状态
      const currentState = this.isCityExpanded(provinceId, cityId);
      this.$set(this.expandedCities[provinceId], cityId, !currentState);

      // 阻止事件冒泡，避免触发省份的展开/折叠
      event.stopPropagation();
    },

    // 判断城市是否展开
    isCityExpanded(provinceId, cityId) {
      return this.expandedCities[provinceId] && this.expandedCities[provinceId][cityId] === true;
    },

    toggleZone(zoneId, zoneName) {
      const idx = this.selectedZones.indexOf(zoneId);
      if (idx > -1) {
        this.selectedZones.splice(idx, 1);
        const nameIdx = this.selectedZoneNames.indexOf(zoneName);
        if (nameIdx > -1) this.selectedZoneNames.splice(nameIdx, 1);
      } else {
        this.selectedZones.push(zoneId);
        if (!this.selectedZoneNames.includes(zoneName)) {
          this.selectedZoneNames.push(zoneName);
        }
      }

      // 阻止事件冒泡，避免触发城市的展开/折叠
      event.stopPropagation();
    },

    async saveZoneEdit() {
      const params = {
        service_member_id: this.adminInfo && this.adminInfo.id ? this.adminInfo.id : '',
        service_zone: this.selectedZones, // 区县id数组
        member_id: this.editingRiderId,
        sign: 'chongchong'
      };
      const res = await this.$request('service/member/update/admin', params, 'POST');
      if (res.status === 'success') {
        uni.showToast({ title: '保存成功', icon: 'success' });
        this.showZoneEdit = false;
        // 只更新本地riderList中对应骑手的服务区域
        const idx = this.riderList.findIndex(item => item.service_member_id === this.editingRiderId);
        if (idx !== -1) {
          this.riderList[idx] = {
            ...this.riderList[idx],
            service_zone: [...this.selectedZones],
            zone: [...this.selectedZoneNames]
          };
        }
      } else {
        uni.showToast({ title: res.msg || '保存失败', icon: 'none' });
      }
    },

    // 佣金比例格式化：整数不带小数，非整数保留最多两位
    formatRate(rate) {
      if (rate === undefined || rate === null || rate === '') return '0';
      const val = rate * 100;
      return Number.isInteger(val) ? val : parseFloat(val.toFixed(2));
    },

    // 复制文本到剪贴板
    copyText(text, type) {
      if (!text) {
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

    // 格式化品牌名称
    formatBrandName(brand) {
      const brandMap = {
        'meituan': '美团',
        'guaishou': '怪兽',
        'mangzhu': '芒竹',
        'zhumang': '竹芒',
        'jiedian': '街电',
        'xiaodian': '小电'
      };
      return brandMap[brand] || brand;
    },

    // 切换服务区域展开状态
    toggleZoneExpand(riderId) {
      const index = this.expandedZones.indexOf(riderId);
      if (index > -1) {
        // 如果已经展开，则收起
        this.expandedZones.splice(index, 1);
      } else {
        // 如果未展开，则展开
        this.expandedZones.push(riderId);
      }
    },

    // 检查骑手服务区域是否展开
    isZoneExpanded(riderId) {
      return this.expandedZones.includes(riderId);
    },

    // 显示认证资料详情弹窗
    showCertificationDetail(rider) {
      this.currentRider = rider;
      this.showCertDetail = true;
    },

    // 关闭认证资料详情弹窗
    closeCertDetail() {
      this.showCertDetail = false;
    },

    // 显示修改密码弹窗
    showResetPasswordModal(rider) {
      this.currentRider = rider;
      this.resetPasswordForm.phone_number = rider.phone_number;
      this.resetPasswordForm.new_password = '';
      this.resetPasswordForm.new_password_confirmation = '';
      this.showResetPassword = true;
    },

    // 关闭修改密码弹窗
    closeResetPasswordModal() {
      this.showResetPassword = false;
      this.resetPasswordLoading = false;
    },

    // 重置为默认密码
    async resetToDefaultPassword() {
      if (this.resetPasswordLoading) return; // 如果正在加载中，则不执行

      // 显示确认对话框
      uni.showModal({
        title: '重置密码确认',
        content: `确定要将骑手 ${this.resetPasswordForm.phone_number} 的密码重置为默认密码 ${this.defaultPassword} 吗？`,
        cancelText: '取消',
        confirmText: '确定重置',
        success: async (res) => {
          if (res.confirm) {
            // 用户点击确定，执行重置操作
            this.resetPasswordLoading = true; // 设置加载状态
            uni.showLoading({ title: '处理中...', mask: true }); // 显示加载提示

            try {
              const params = {
                phone_number: this.resetPasswordForm.phone_number,
                new_password: this.defaultPassword,
                new_password_confirmation: this.defaultPassword,
                sign: "chongchong"
              };

              const result = await this.$request('service/member/password', params, 'POST');

              uni.hideLoading(); // 隐藏加载提示

              if (result.status === 'success') {
                // 先关闭弹窗
                this.closeResetPasswordModal();

                // 显示成功提示，包含密码信息
                uni.showModal({
                  title: '密码重置成功',
                  content: `骑手 ${this.resetPasswordForm.phone_number} 的新密码为: ${this.defaultPassword}`,
                  showCancel: false,
                  confirmText: '知道了'
                });
              } else {
                uni.showToast({
                  title: result.msg || '密码重置失败',
                  icon: 'none',
                  duration: 2000
                });
              }
            } catch (err) {
              uni.hideLoading(); // 隐藏加载提示
              console.error('密码重置失败:', err);
              uni.showToast({
                title: '网络请求失败',
                icon: 'none',
                duration: 2000
              });
            } finally {
              this.resetPasswordLoading = false; // 重置加载状态
            }
          }
        }
      });
    },

    // 确认修改密码
    async confirmResetPassword() {
      if (this.resetPasswordLoading) return; // 如果正在加载中，则不执行

      // 验证密码
      if (!this.resetPasswordForm.new_password) {
        uni.showToast({
          title: '请输入新密码',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      if (this.resetPasswordForm.new_password !== this.resetPasswordForm.new_password_confirmation) {
        uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      this.resetPasswordLoading = true; // 设置加载状态
      uni.showLoading({ title: '处理中...', mask: true }); // 显示加载提示

      try {
        const params = {
          phone_number: this.resetPasswordForm.phone_number,
          new_password: this.resetPasswordForm.new_password,
          new_password_confirmation: this.resetPasswordForm.new_password_confirmation,
          sign: "chongchong"
        };

        const res = await this.$request('service/member/password', params, 'POST');

        uni.hideLoading(); // 隐藏加载提示

        if (res.status === 'success') {
          // 先关闭弹窗
          this.closeResetPasswordModal();

          // 显示成功提示，包含密码信息
          uni.showModal({
            title: '密码修改成功',
            content: `骑手 ${this.resetPasswordForm.phone_number} 的新密码为: ${this.resetPasswordForm.new_password}`,
            showCancel: false,
            confirmText: '知道了'
          });
        } else {
          uni.showToast({
            title: res.msg || '密码修改失败',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (err) {
        uni.hideLoading(); // 隐藏加载提示
        console.error('密码修改失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.resetPasswordLoading = false; // 重置加载状态
      }
    },

    // 显示审核弹窗
    showVerifyModal(rider) {
      this.currentRider = rider;
      console.log('显示审核弹窗，骑手信息:', rider);
      this.showVerify = true;
    },

    // 关闭审核弹窗
    closeVerifyModal() {
      this.showVerify = false;
      this.showRejectDialog = false; // 同时关闭拒绝理由弹窗
      this.rejectReason = ''; // 清空拒绝理由
      this.currentRider = null; // 清空当前骑手
    },

    // 通过认证
    async approveVerify() {
      if (this.verifyLoading) return; // 如果正在加载中，则不执行

      this.verifyLoading = true; // 设置加载状态
      uni.showLoading({ title: '处理中...', mask: true }); // 显示加载提示

      try {
        const params = {
          service_member_id: this.adminInfo.id, // 审核管理员ID
          member_id: this.currentRider.service_member_id, // 被审核骑手ID
          sign: "chongchong",
          status: 1 // 1是通过
        };

        const res = await this.$request('service/member/verify/admin', params, 'POST');

        if (res.status === 'success') {
          uni.hideLoading(); // 隐藏加载提示
          uni.showToast({
            title: '审核通过',
            icon: 'success',
            duration: 2000
          });

          // 更新本地数据
          const index = this.riderList.findIndex(item => item.service_member_id === this.currentRider.service_member_id);
          if (index !== -1) {
            this.riderList[index] = {
              ...this.riderList[index],
              submit_certification: '已通过' // 更新为已通过状态
            };

            // 重新计算统计数据
            this.calculateCertificationStats(this.riderList);
          }

          // 同步更新本地存储的riderUserInfo
          let localUser = uni.getStorageSync('riderUserInfo');
          if (localUser && localUser.id === this.currentRider.service_member_id) {
            localUser.submit_certification = '已通过';
            uni.setStorageSync('riderUserInfo', localUser);
          }

          this.closeVerifyModal();
        } else {
          uni.hideLoading(); // 隐藏加载提示
          uni.showToast({
            title: res.msg || '操作失败',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (err) {
        uni.hideLoading(); // 隐藏加载提示
        console.error('审核操作失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.verifyLoading = false; // 重置加载状态
      }
    },

    // 拒绝认证 - 显示拒绝理由输入框
    rejectVerify() {
      if (this.verifyLoading) return; // 如果正在加载中，则不执行

      this.rejectReason = ''; // 清空拒绝理由
      this.showRejectDialog = true; // 显示拒绝理由输入弹窗
    },

    // 确认拒绝认证
    async confirmReject() {
      if (this.verifyLoading || !this.rejectReason.trim()) return; // 如果正在加载中或没有输入理由，则不执行

      this.verifyLoading = true; // 设置加载状态
      uni.showLoading({ title: '处理中...', mask: true }); // 显示加载提示

      try {
        const params = {
          service_member_id: this.adminInfo.id, // 审核管理员ID
          member_id: this.currentRider.service_member_id, // 被审核骑手ID
          sign: "chongchong",
          status: 2, // 2是拒绝
          reject_reason: this.rejectReason.trim() // 拒绝理由
        };

        const res = await this.$request('service/member/verify/admin', params, 'POST');

        if (res.status === 'success') {
          uni.hideLoading(); // 隐藏加载提示
          uni.showToast({
            title: '已拒绝认证',
            icon: 'success',
            duration: 2000
          });

          // 更新本地数据
          const index = this.riderList.findIndex(item => item.service_member_id === this.currentRider.service_member_id);
          if (index !== -1) {
            // 确保latest_certification对象存在
            if (!this.riderList[index].latest_certification) {
              this.riderList[index].latest_certification = {};
            }

            // 更新骑手数据
            this.riderList[index] = {
              ...this.riderList[index],
              submit_certification: '已拒绝', // 更新为已拒绝状态
              latest_certification: {
                ...this.riderList[index].latest_certification,
                reject_reason: this.rejectReason.trim() // 保存拒绝理由
              }
            };

            // 重新计算统计数据
            this.calculateCertificationStats(this.riderList);
          }

          this.showRejectDialog = false; // 关闭拒绝理由弹窗
          this.closeVerifyModal(); // 关闭审核弹窗
        } else {
          uni.hideLoading(); // 隐藏加载提示
          uni.showToast({
            title: res.msg || '操作失败',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (err) {
        uni.hideLoading(); // 隐藏加载提示
        console.error('审核操作失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.verifyLoading = false; // 重置加载状态
      }
    },

    // 格式化佣金比例
    formatRate(rate) {
      if (!rate) return '0';
      // 如果rate是小数（如0.15），转换为百分比（15）
      if (rate < 1) {
        return (rate * 100).toFixed(0);
      }
      // 如果rate已经是百分比形式（如15），直接返回
      return parseFloat(rate).toFixed(0);
    },
  }
}
</script>

<style lang="scss" scoped>
.rider-list-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: "HarmonyOS Sans SC", "PingFang SC", sans-serif;
  color: #333;
  font-size: 28rpx;
  line-height: 1.5;
}

.nav-placeholder {
  height: 90px; /* 适配顶部导航栏和状态栏 */
  width: 100%;
  background-color: #2492F2;
}

// 固定顶部区域
.fixed-top {
  position: fixed;
  top: 90px; /* 与导航栏占位元素高度一致 */
  left: 0;
  right: 0;
  z-index: 10; /* 降低z-index，确保不会遮挡其他内容 */
  background-color: #f8f9fa;
}

// 搜索和筛选区域
.search-filter {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 16rpx;
  margin: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #f0f0f0;
  max-height: 300rpx;
  overflow-y: auto;
}

// 搜索和筛选区域的占位元素
.search-filter-placeholder {
  height: 360rpx; /* 进一步增加高度，确保不会遮挡列表内容 */
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 12rpx;
  margin-bottom: 12rpx;
  border: 1rpx solid #eee;
  height: 70rpx;
}

.search-icon-wrapper {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon {
  width: 24rpx;
  height: 24rpx;
  border: 2rpx solid #999;
  border-radius: 50%;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    width: 8rpx;
    height: 2rpx;
    background-color: #999;
    bottom: -5rpx;
    right: -5rpx;
    transform: rotate(45deg);
  }
}

.search-input {
  flex: 1;
  height: 60rpx;
  font-size: 26rpx;
  padding: 0 16rpx;
}

.search-btn {
  padding: 0 16rpx;
  height: 60rpx;
  line-height: 60rpx;
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

.filter-options {
  display: flex;
  flex-direction: column;
}

.filter-section {
  margin-bottom: 12rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.filter-title {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 10rpx;

  .title-icon {
    width: 24rpx;
    height: 24rpx;
    margin-right: 8rpx;
    position: relative;
  }

  .status-icon {
    &::before {
      content: '';
      position: absolute;
      width: 18rpx;
      height: 18rpx;
      border: 2rpx solid #2492F2;
      border-radius: 50%;
      top: 1rpx;
      left: 1rpx;
    }

    &::after {
      content: '';
      position: absolute;
      width: 8rpx;
      height: 4rpx;
      border-left: 2rpx solid #2492F2;
      border-bottom: 2rpx solid #2492F2;
      transform: rotate(-45deg);
      top: 8rpx;
      left: 6rpx;
    }
  }

  .zone-icon {
    &::before {
      content: '';
      position: absolute;
      width: 16rpx;
      height: 16rpx;
      border: 2rpx solid #2492F2;
      border-radius: 50%;
      top: 2rpx;
      left: 2rpx;
    }

    &::after {
      content: '';
      position: absolute;
      width: 2rpx;
      height: 8rpx;
      background-color: #2492F2;
      top: 12rpx;
      left: 10rpx;
      box-shadow: -4rpx -4rpx 0 #2492F2, 4rpx -4rpx 0 #2492F2;
    }
  }
}

.filter-items {
  display: flex;
  flex-wrap: wrap;
}

.filter-item {
  display: inline-block;
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  color: #666;
  margin-right: 12rpx;
  margin-bottom: 8rpx;
  border-radius: 20rpx;
  background-color: #f5f5f5;
  transition: all 0.2s ease;
  position: relative; /* 添加相对定位，用于徽标的绝对定位 */

  &.active {
    background-color: #2492F2;
    color: #fff;

    /* 激活状态下徽标的样式 */
    .badge {
      background-color: #fff;
      color: #2492F2;
    }
  }

  &:active {
    opacity: 0.8;
  }

  /* 徽标样式 */
  .badge {
    position: absolute;
    top: -8rpx;
    right: -8rpx;
    min-width: 32rpx;
    height: 32rpx;
    line-height: 32rpx;
    text-align: center;
    background-color: #ff4757;
    color: #fff;
    border-radius: 16rpx;
    font-size: 20rpx;
    padding: 0 6rpx;
    box-sizing: border-box;
    font-weight: bold;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  }
}



// 骑手列表
.rider-list {
  height: calc(100vh - 90px - 360rpx - 34px); /* 减去导航栏高度、搜索区域高度和底部安全区域高度 */
  padding: 0 20rpx;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  margin-top: -6rpx; /* 增加顶部间距，避免紧贴筛选区域 */
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;

  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid rgba(36, 146, 242, 0.2);
    border-top: 4rpx solid #2492F2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16rpx;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;

  .empty-icon {
    width: 120rpx;
    height: 120rpx;
    background-color: rgba(36, 146, 242, 0.1);
    border-radius: 50%;
    margin-bottom: 20rpx;
    position: relative;

    &::before, &::after {
      content: '';
      position: absolute;
      background-color: rgba(36, 146, 242, 0.5);
    }

    &::before {
      width: 60rpx;
      height: 4rpx;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.rider-list-content {
  padding: 20rpx 0 10rpx;
  width: 100%;
  box-sizing: border-box;
}

.rider-item {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.rider-header {
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.rider-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.rider-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
  flex-shrink: 0;

  image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.rider-info {
  flex: 1;
  min-width: 0;
  max-width: calc(100% - 180rpx); /* 限制最大宽度，为右侧认证状态留出空间 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.rider-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 4rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  overflow: hidden;

  .main-name {
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
  }

  .sub-name {
    font-size: 22rpx;
    font-weight: normal;
    color: #999;
    margin-left: 8rpx;
  }

  .rider-level-tag {
    font-size: 20rpx;
    color: #666;
    background-color: #f8f9fa;
    padding: 2rpx 8rpx;
    border-radius: 4rpx;
    margin-left: 8rpx;
    border: 1rpx solid #e9ecef;
    display: inline-block;
    line-height: 1.3;
    font-weight: normal;
    box-shadow: none;
  }
}

.referral-badge {
  position: absolute !important;
  top: 8rpx !important;
  right: 8rpx !important;
  left: auto !important;
  font-size: 18rpx;
  color: #ffffff;
  background-color: #FF6B00;
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-weight: bold;
  min-width: auto;
  height: 24rpx;
  text-align: center;
  z-index: 999;
  box-shadow: 0 2rpx 6rpx rgba(255, 107, 0, 0.4);
  border: 2rpx solid #ffffff;
  white-space: nowrap;
}

.cert-status-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* 移除不再需要的水平排列样式 */

.cert-status-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  padding: 6rpx 12rpx;
  border-radius: 20rpx;
  background-color: #f8f8f8;
  border: 1rpx solid #eee;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  min-width: 80rpx;
  text-align: center;

  &.clickable {
    cursor: pointer;

    &:active {
      opacity: 0.8;
      transform: scale(0.98);
    }
  }

  &.approved {
    background-color: #e6f9ee;
    border-color: #c3f0d5;
  }
}

.arrow-down {
  width: 0;
  height: 0;
  border-left: 6rpx solid transparent;
  border-right: 6rpx solid transparent;
  border-top: 8rpx solid #999;
  margin-left: 6rpx;

  .approved & {
    border-top-color: #2ed573;
  }
}

.cert-approved {
  color: #2ed573;
  font-weight: bold;
}

.cert-pending {
  color: #ffa502;
}

.cert-rejected {
  color: #ff4757;
}

.cert-none {
  color: #999;
}

/* 移除不再需要的查看资料按钮样式 */

// 新的行布局样式
.rider-name-row, .rider-phone-row, .rider-weixin-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rpx;
  width: 100%;
}

// 移除原来的 .rider-id 样式，现在在 .rider-id-section 中定义

// 包装器样式 - 贴近右侧边缘
.rider-balance-wrapper, .rider-rate-wrapper, .rider-deposit-wrapper {
  display: flex;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;
}

// 标签样式
.balance-label, .rate-label, .deposit-label {
  font-size: 26rpx; /* 使用之前确定的字体大小 */
  color: #666;
  margin-right: 8rpx;
  display: inline-block;
  width: 120rpx; /* 保持之前的宽度 */
  text-align: right; /* 添加右对齐 */
}

// 数值样式
.rider-balance {
  font-size: 24rpx;
  color: #2492F2;
  font-weight: 500;
}

.rider-rate {
  font-size: 24rpx;
  color: #ff6b00;
  font-weight: 500;
}

.rider-deposit {
  font-size: 24rpx;
  color: #2ed573;
  font-weight: 500;
}

.rider-phone, .rider-weixin {
  font-size: 24rpx;
  color: #999;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  flex: 1;

  .phone-text, .weixin-text {
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100% - 80rpx);
  }

  .phone-label, .weixin-label {
    margin-right: 4rpx;
    flex-shrink: 0;
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
      transform: scale(0.95);
    }
  }
}

.rider-status {
  padding: 4rpx 16rpx;
  border-radius: 30rpx;
  font-size: 22rpx;

  &.active {
    background-color: rgba(46, 213, 115, 0.1);
    color: #2ed573;
  }

  &.disabled {
    background-color: rgba(255, 71, 87, 0.1);
    color: #ff4757;
  }
}

.rider-details {
  padding: 16rpx 20rpx;
  display: flex;
  flex-wrap: wrap;
  /* 移除 gap 属性，使用更兼容的方式 */
}

.detail-item {
  display: flex;
  align-items: center;
  width: 50%; /* 固定宽度为50%，不使用calc */
  box-sizing: border-box;
  overflow: hidden;
  padding: 8rpx;

  &.service-brands-item {
    width: 100% !important; /* 服务品牌项目占满整行 */
    flex-direction: row;
    align-items: flex-start;
  }

  &.registration-time-item {
    width: 100% !important; /* 注册时间项目占满整行 */
    justify-content: space-between;

    .registration-time-left {
      display: flex;
      align-items: center;
    }

    .rider-id-wrapper {
      display: flex;
      align-items: center;
      margin-left: auto;
      flex-shrink: 0;
    }
  }
}

.detail-label {
  font-size: 24rpx;
  color: #666;
  margin-right: 8rpx;
  display: flex;
  align-items: center;
}

.cert-status-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}

.cert-icon {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 8rpx;
  flex-shrink: 0;

  &.cert-none-icon {
    background-color: #999;
    position: relative;

    &::before, &::after {
      content: '';
      position: absolute;
      background-color: #fff;
    }

    &::before {
      width: 8rpx;
      height: 2rpx;
      top: 7rpx;
      left: 4rpx;
    }
  }

  &.cert-pending-icon {
    background-color: #f39c12;
  }

  &.cert-approved-icon {
    background-color: #2ed573;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      width: 6rpx;
      height: 10rpx;
      border: 2rpx solid #fff;
      border-top: 0;
      border-left: 0;
      transform: rotate(45deg);
      top: 2rpx;
      left: 5rpx;
    }
  }

  &.cert-rejected-icon {
    background-color: #ff4757;
    position: relative;

    &::before, &::after {
      content: '';
      position: absolute;
      width: 10rpx;
      height: 2rpx;
      background-color: #fff;
      top: 7rpx;
      left: 3rpx;
    }

    &::before {
      transform: rotate(45deg);
    }

    &::after {
      transform: rotate(-45deg);
    }
  }
}

.detail-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;

  &.cert-none {
    color: #999;
  }

  &.cert-pending {
    color: #f39c12;
  }

  &.cert-approved {
    color: #2ed573;
  }

  &.cert-rejected {
    color: #ff4757;
  }

  &.reject-reason-text {
    white-space: normal; /* 允许文本换行 */
    word-break: break-all; /* 在任意字符间断行 */
    color: #ff4757;
  }
}

.rider-actions {
  display: flex;
  padding: 16rpx 20rpx;
  border-top: 1rpx solid #f5f5f5;
  justify-content: flex-end;
}

.action-btn {
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  margin-left: 16rpx;

  &.edit {
    background-color: rgba(36, 146, 242, 0.1);
    color: #2492F2;
  }

  &.verify {
    background-color: rgba(243, 156, 18, 0.1);
    color: #f39c12;
  }

  &.reset {
    background-color: rgba(108, 92, 231, 0.1);
    color: #6c5ce7;
  }

  &.disable {
    background-color: rgba(255, 71, 87, 0.1);
    color: #ff4757;
  }

  &.enable {
    background-color: rgba(46, 213, 115, 0.1);
    color: #2ed573;
  }
}

.load-more, .no-more, .loading-more {
  text-align: center;
  padding: 20rpx 0;
  font-size: 24rpx;
  color: #999;
}

.load-more {
  background-color: rgba(36, 146, 242, 0.05);
  margin: 20rpx;
  padding: 20rpx 0;
  border-radius: 8rpx;
  cursor: pointer;

  &:active {
    background-color: rgba(36, 146, 242, 0.1);
  }
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;

  .loading-spinner-small {
    width: 30rpx;
    height: 30rpx;
    border: 3rpx solid rgba(36, 146, 242, 0.2);
    border-top: 3rpx solid #2492F2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 10rpx;
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
  z-index: 1000;
}

.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  z-index: 1001;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

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

.modal-content {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.input-group {
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.input-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.input-field {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #f5f5f5;
}

.modal-btn {
  flex: 1;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  position: relative;

  &.cancel {
    color: #666;
    background-color: #f5f5f5;
  }

  &.confirm {
    color: #fff;
    background-color: #2492F2;
  }

  &.reject {
    color: #fff;
    background-color: #ff4757;
    border-right: 1rpx solid #f5f5f5;
  }

  &.reset {
    color: #fff;
    background-color: #6c5ce7;
    border-right: 1rpx solid #f5f5f5;
  }

  &.btn-disabled {
    opacity: 0.7;
    pointer-events: none;
}

  .btn-loading-small {
    width: 24rpx;
    height: 24rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.3);
    border-top: 2rpx solid #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 8rpx;
  }
}



.id-card-images {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.id-card-item {
  width: 48%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.id-card-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.id-card-image {
  width: 100%;
  height: 200rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  object-fit: contain;
}

.safe-area-bottom {
  height: 34px; /* 适配iPhone X及以上机型的底部安全区域 */
  width: 100%;
  background-color: #fff;
}

.province-list {
  max-height: 60vh;
  overflow-y: auto;
}

.province-block {
  margin-bottom: 24rpx;
}

// 省份标题样式
.province-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 16rpx;
  background-color: #f8f9fa;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
  cursor: pointer;
  border: 1rpx solid rgba(0, 0, 0, 0.05);

  &:active {
    background-color: #f0f3f9;
  }
}

.province-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #2492F2;
  position: relative;
  padding-left: 16rpx;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6rpx;
    height: 28rpx;
    background-color: #2492F2;
    border-radius: 3rpx;
  }
}

.city-list {
  margin-left: 24rpx;
  margin-bottom: 16rpx;
}

.city-block {
  margin-bottom: 12rpx;
}

// 城市标题样式
.city-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 16rpx;
  background-color: #f5f5f5;
  border-radius: 6rpx;
  margin-bottom: 8rpx;
  cursor: pointer;
  border: 1rpx solid rgba(0, 0, 0, 0.03);

  &:active {
    background-color: #f0f0f0;
  }
}

.city-name {
  font-size: 26rpx;
  color: #333;
  position: relative;
  padding-left: 12rpx;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4rpx;
    height: 20rpx;
    background-color: #2492F2;
    border-radius: 2rpx;
  }
}

// 展开/折叠按钮样式
.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #2492F2;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  background-color: rgba(36, 146, 242, 0.05);
  transition: all 0.3s ease;

  &.expanded {
    background-color: rgba(36, 146, 242, 0.1);
  }
}

.zone-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.zone-item {
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
  color: #666;
  margin-bottom: 8rpx;
  cursor: pointer;
  border: 1rpx solid #eee;
  transition: all 0.2s;
  &.selected {
    background: #2492F2;
    color: #fff;
    border-color: #2492F2;
  }
}

.input-field[disabled] {
  background: #f5f5f5;
  color: #999;
}

.input-textarea {
  width: 100%;
  height: 200rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  line-height: 1.5;
}

.textarea-counter {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  margin-top: 8rpx;
  display: block;
}

// 拒绝理由弹窗样式
.reject-modal-mask {
  z-index: 1002; // 高于普通弹窗
}

.reject-modal-container {
  z-index: 1003; // 高于普通弹窗
}

// 拒绝理由样式
.reject-reason-item {
  width: 100% !important; /* 强制宽度为100% */
  margin-top: 8rpx;
  padding: 8rpx !important;
  background-color: rgba(255, 71, 87, 0.05);
  border-radius: 8rpx;
  border: 1rpx solid rgba(255, 71, 87, 0.1);
}

.reject-reason-text {
  color: #ff4757 !important;
  font-size: 24rpx;
  line-height: 1.4;
  word-break: break-all;
  white-space: normal !important;
  overflow: visible;
  flex: 1;
}

// 服务区域样式
.service-zone-item {
  margin-top: 8rpx;
  min-height: 40rpx;
  display: flex;
  align-items: center;
}

.service-zone-wrapper {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.service-zone-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  width: 100%;
  align-items: center;
}

.zone-tag {
  font-size: 22rpx;
  color: #333;
  background-color: #f8f8f8;
  border-radius: 4rpx;
  padding: 4rpx 8rpx;
  margin-right: 8rpx;
  border: 1rpx solid #eee;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

.zone-count {
  font-size: 22rpx;
  color: #2492F2;
  margin-left: 4rpx;
  align-self: center;
}

.zone-expand-btn, .cert-expand-btn {
  display: flex;
  align-items: center;
  padding: 4rpx 12rpx;
  background-color: #e6f2ff;
  border-radius: 16rpx;
  margin-left: 8rpx;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1rpx solid #d1e6ff;
  color: #2492F2;

  &:active {
    opacity: 0.7;
    transform: scale(0.98);
  }
}

.cert-btn-text {
  font-size: 22rpx;
  color: #2492F2;
}

.arrow-down {
  width: 0;
  height: 0;
  border-left: 6rpx solid transparent;
  border-right: 6rpx solid transparent;
  border-top: 8rpx solid #2492F2;
  margin-left: 6rpx;
}

.arrow-up {
  width: 0;
  height: 0;
  border-left: 6rpx solid transparent;
  border-right: 6rpx solid transparent;
  border-bottom: 8rpx solid #2492F2;
  margin-left: 6rpx;
}

.reject-reason-box {
  background-color: rgba(255, 71, 87, 0.05);
  border: 1rpx solid rgba(255, 71, 87, 0.2);
  border-radius: 8rpx;
  padding: 16rpx;
  font-size: 26rpx;
  color: #ff4757;
  line-height: 1.5;
  margin-top: 8rpx;
}

.reset-default-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(108, 92, 231, 0.1);
  border: 1rpx solid rgba(108, 92, 231, 0.3);
  border-radius: 8rpx;
  padding: 16rpx;
  margin-bottom: 20rpx;
  cursor: pointer;
  transition: all 0.2s ease;

  text {
    font-size: 28rpx;
    color: #6c5ce7;
    font-weight: 500;
  }

  &:active {
    background-color: rgba(108, 92, 231, 0.2);
    transform: scale(0.98);
  }
}

.reset-password-tips {
  margin-top: 20rpx;
  background-color: rgba(108, 92, 231, 0.05);
  border: 1rpx solid rgba(108, 92, 231, 0.2);
  border-radius: 8rpx;
  padding: 16rpx;
}

.tips-text {
  font-size: 26rpx;
  color: #6c5ce7;
  line-height: 1.5;
}

// 服务区域筛选弹窗样式
// 区域选择器
.zone-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 16rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  border: 1rpx solid #eee;
  width: 100%;
  box-sizing: border-box;
}

.zone-text {
  font-size: 24rpx;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.zone-arrow {
  width: 16rpx;
  height: 16rpx;
  border-right: 2rpx solid #999;
  border-bottom: 2rpx solid #999;
  transform: rotate(45deg);
  margin-left: 8rpx;
  flex-shrink: 0;
}

// 级联选择器
.cascade-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.cascade-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  z-index: 1000;
  border-top-left-radius: 16rpx;
  border-top-right-radius: 16rpx;
  max-height: 75vh; /* 设置弹窗最大高度 */
  min-height: 75vh; /* 设置弹窗最大高度 */
  display: flex;
  flex-direction: column;
}

.cascade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.cascade-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.cascade-close {
  font-size: 36rpx;
  color: #999;
  padding: 0 10rpx;
}

.cascade-tabs {
  display: flex;
  padding: 16rpx;
  border-bottom: 1rpx solid #eee;
}

.cascade-tab {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  padding: 10rpx 0;
  position: relative;

  &.active {
    color: #2492F2;
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: -16rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      background-color: #2492F2;
    }
  }

  &.disabled {
    color: #ccc;
  }
}

.cascade-content {
  flex: 1;
  overflow: hidden;
  max-height: calc(70vh - 180rpx); /* 设置最大高度，预留头部和tabs空间 */
  overflow-y: auto; /* 内容溢出时显示垂直滚动条 */
}

.cascade-list {
  height: auto; // 将固定高度改为自适应
  padding: 0 20rpx;
}

.cascade-item {
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #333;
  border-bottom: 1rpx solid #f5f5f5;

  &.active {
    color: #2492F2;
  }
}

// 级联选择器底部安全区域
.cascade-safe-area-bottom {
  height: 34px; /* 与页面底部安全区域高度一致 */
  width: 100%;
  background-color: #fff; /* 与弹窗背景一致 */
}

// 服务品牌样式
.service-brands-item {
  .service-brands-wrapper {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }
}

.service-brands-tags {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */

  &::-webkit-scrollbar {
    display: none; /* Chrome Safari */
  }

  .brand-tag {
    background-color: rgba(255, 165, 0, 0.1);
    color: #ff8c00;
    font-size: 22rpx;
    padding: 0rpx 8rpx;
    border-radius: 4rpx;
    margin-right: 8rpx;
    white-space: nowrap;
    border: 1rpx solid rgba(255, 165, 0, 0.2);
    font-weight: 500;
    flex-shrink: 0;

    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
