<template>
  <view class="order-hall">
    <!-- 顶部导航栏 -->
	<nav-bar title-align="left" :showBackButton="false">
		<template #title>
			<view style="display: flex; align-items: baseline;">
				<text style="font-size: 14px; font-weight: 500; color: #ffffff;">骑手端</text>
				<text style="font-size: 10px; font-weight: 400; color: #ffffff; margin-left: 4px;">（全国已开{{totalCityCount}}城）</text>
				<text @click="selectCity" style="font-size: 10px; font-weight: 400; color: #ffffff; margin-left: 4px;">{{ currentCity }}▼</text>
			</view>
		</template>
	</nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 城市选择器 -->
    <!-- <view class="city-selector-container">
      <view class="city-selector" @click="selectCity">
        <text class="city-name">{{ currentCity }}</text>
        <text class="arrow">▼</text>
      </view>
      <view class="city-count-badge">
        <text class="city-count-text">全国已开{{totalCityCount}}城</text>
      </view>
    </view> -->

    <!-- 广告横幅 -->
    <view class="banner">
      <swiper
        class="banner-swiper"
        :indicator-dots="true"
        :autoplay="true"
        :interval="3000"
        :duration="500"
        indicator-color="rgba(255, 255, 255, 0.5)"
        indicator-active-color="#ffffff"
        circular
      >
        <swiper-item v-for="(banner, index) in bannerList" :key="index">
          <image :src="banner.image" mode="aspectFill" class="banner-image"></image>
        </swiper-item>
      </swiper>
    </view>

    <!-- 接单大厅标题和搜索 -->
    <view class="hall-header">
	  <!-- 推广条 - 仅在接单大厅显示 -->
		<image style="width:100%;" src="https://ccpt.qiniu.0871.cn/riderend/tuigtiao.png" mode="widthFix" class="promotion-image"></image>
      <!-- <view class="hall-title">接单大厅</view>
      <view class="header-right">
        <view class="search-box">
          <image src="https://ccpt.qiniu.0871.cn/rider/sousuo.png" mode="aspectFit" class="search-icon"></image>
          <input type="text" placeholder="请输入搜索关键字" class="search-input" />
        </view>
      </view> -->
    </view>

    <view class="orderbox">
      <view :class="'filter-tabs ' + activeTab">
        <view class="tab-item" :class="{ active: activeTab === 'comprehensive' }" @click="setActiveTab('comprehensive')">
        <text>抢单大厅</text>
        <view class="active-line" v-if="activeTab === 'comprehensive'"></view>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'assigned' }" @click="setActiveTab('assigned')">
        <text>进行中</text>
        <view class="tab-badge" v-if="inProgressTasksCount > 0">{{ inProgressTasksCount }}</view>
        <view class="active-line" v-if="activeTab === 'assigned'"></view>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'finished' }" @click="setActiveTab('finished')">
        <text>完成待确认</text>
        <view class="active-line" v-if="activeTab === 'finished'"></view>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'completed' }" @click="setActiveTab('completed')">
        <text>已完成</text>
        <view class="active-line" v-if="activeTab === 'completed'"></view>
      </view>
    </view>

      <view class="order-list">

        <!-- 订单列表 -->
        <view>
          <!-- 接单大厅的订单样式 -->
          <template v-if="activeTab === 'comprehensive'">
            <view
              class="order-item pos-rel"
              :class="{ 'completed-order': order.isCompleted && order.isRecentTask, 'assigned-order': order.isAssigned && order.isRecentTask }"
              v-for="(order, index) in orderList"
              :key="`hall-${index}`"
              :data-index="index"
              @click="handleOrderClick">
              <!-- 完结订单盖章图片 - 只对recent_tasks显示 -->
            <image
              v-if="order.isCompleted && order.isRecentTask"
              class="completed-stamp-image-gray"
              src="https://ccpt.qiniu.0871.cn/rider/yiwanjie.svg"
              mode="aspectFit">
            </image>

            <image
              v-if="order.reward && order.reward.length > 0"
              style="position: absolute; top: 0; right: 0; z-index: 1; height: 72px;"
              src="https://ccpt.qiniu.0871.cn/已打赏.svg"
              mode="heightFix">
            </image>


            <!-- 进行中订单盖章图片 - 只对recent_tasks显示 -->
            <image
              v-if="order.isAssigned && order.isRecentTask"
              class="assigned-stamp-image"
              src="https://ccpt.qiniu.0871.cn/rider/assigned.svg"
              mode="aspectFit">
            </image>

            <!-- <view class="order-header">
              <view class="order-info">
                <text class="order-number">订单编号：{{ order.orderNumber }}</text>
                <view class="copy-btn" v-if="order.isSpecial" @click.stop="copyOrderNumber(order.orderNumber)">复制</view>
              </view>
              <view class="order-price">{{ getDisplayAmount(order) }}</view>
            </view> -->

            <!-- 广告横幅 -->
            <!-- <view class="ad-banner" v-if="!order.reward">
              <view class="ad-content">
                <view class="ad-text">
                  <text class="ad-promotion-text" style="margin-right: 5px;">推广 </text>
                  <text class="ad-main-text">不管您是哪家"充"，我们都在用</text>
                  <text class="ad-brand-text">充充</text>
                  <text class="ad-sub-text">！推荐骑手有奖金！</text>
                </view>
              </view>
              <view class="ad-gradient-overlay"></view>
            </view> -->
            
            <!-- 打赏信息横幅 -->
      <!-- <view class="reward-badge" v-if="order.reward">
        <image src="https://ccpt.qiniu.0871.cn/dstb.png" class="reward-badge-image" mode="aspectFit"></image>
        <text class="reward-badge-amount">{{ parseInt(getRewardAmount(order)) }}</text>
        </view> -->
            <!-- <view class="reward-banner" v-if="order.reward">
              <view class="reward-banner-content">
                <view class="reward-banner-text">
                  <text class="reward-promotion-text">推广 </text>
                  <text class="reward-main-text">不管您是哪家"充"，我们都在用 </text>
                  <text class="reward-brand-text">充充</text>
                  <text class="reward-sub-text">！推荐骑手有奖金！</text>
                </view>
              </view>
            </view> -->

            <!-- <view class="order-time"></view> -->
            <!-- <view class="order-time">发单时间：{{ order.orderTime }}</view> -->

            <view class="order-content">
              <view class="order-icon" :class="[order.serviceType, getBrandClass(order.brand)]">
                <view class="icon-content">
                  <text class="brand-text">{{ getServiceTypeFirstChar(order.serviceTypeText) }}</text>
                  <!-- <text class="brand-text">{{ order.brandText || '充充' }}</text> -->
                  <text class="service-text">{{ getBrandText(order.brand) }}{{ order.serviceTypeText }}</text>
                </view>
              </view>

              <view class="order-details">
                <view class="address">{{ formatAddress(order) }}</view>
                <view class="distance-info">
                  <image src="https://ccpt.qiniu.0871.cn/riderend/logo11.png" mode="aspectFit" class="location-icon"></image>
                  <text class="distance-text"><text class="highlight">{{ order.distance || 0 }}km</text></text>
                </view>
                <view class="service-item" :data-content="order.serviceItem">任务：</view>
                <view class="service-item" v-if="getAdditionalServices(order)" :data-content="getAdditionalServices(order)">附加：</view>
              </view>

              <view class="price-info-wrapper">
                <view class="service-time" :data-content="getTotalAmountWithReward(order)"></view>
                <!-- 订单金额+打赏金额 -->
                <view class="order-total-amount" v-if="order.reward">
                  <text class="total-amount-text">（订单{{ getDisplayAmount(order) }}+打赏{{ getRewardAmount(order) }}）</text>
                </view>
              </view>
              <view v-if="!order.isCompleted && !order.isAssigned && !order.refundRequest" class="order-action-buttons">
          <image class="button-class" src="https://ccpt.qiniu.0871.cn/riderend/qujiedan.png"></image>
                <!-- <button :class="['take-order-btn', { 'single-btn': isTransferredOrder(order) }]" @click.stop="handleOrderClick(order)">去接单</button>
                <button v-if="!isTransferredOrder(order)" class="transfer-order-btn" open-type="share" @click.stop="transferOrder(order)">转单</button> -->
              </view>
              <view v-else-if="!order.isCompleted && !order.isAssigned && order.refundRequest" class="refund-label">订单退款中</view>
              <view v-else-if="order.isAssigned" class="assigned-label">
                <template v-if="order.isRecentTask">
                  <text>{{ order.assigned_at }}</text>
                  <br>
                  <text>已被骑手接单</text>
                </template>
                <template v-else>进行中</template>
              </view>
              <view v-else class="completed-label">已完结</view>
            </view>
            </view>
          </template>

          <!-- 进行中、完成待确认、已完成的订单样式（与订单导航页面一致） -->
          <template v-if="activeTab !== 'comprehensive'">
            <view
              class="order-item-standard"
              v-for="(order, index) in orderList"
              :key="`order-${index}`"
              :data-index="index"
              @click="navigateToOrderInfo">
            <view class="status-tag" :class="order.status">
              <text v-if="order.status === 'waiting'">等待接单</text>
              <text v-else-if="order.status === 'assigned'">已接单</text>
              <text v-else-if="order.status === 'finished'">待确认</text>
              <text v-else-if="order.status === 'completed'">已完成</text>
            </view>
            <view class="order-header">
              <view class="order-info">
                <text class="order-number">订单编号：{{ order.orderNumber }}</text>
                <view class="copy-btn" @click.stop="copyOrderNumber(order.orderNumber)">复制</view>
              </view>
              <view class="order-time-row">
                <text class="countdown" v-if="order.status === 'assigned' && order.countdown && order.countdown !== '未知时间'">倒计时：{{ order.countdown }}</text>
                <text class="countdown" v-else-if="order.status === 'finished' || order.status === 'completed'">任务用时：{{ order.taskDuration }}</text>
              </view>
            </view>

            <view class="order-content">
              <view class="order-icon" :class="[order.serviceType, getBrandClass(order.brand), !order.doorImage ? 'no-image' : '']">
                <image v-if="order.doorImage" :src="order.doorImage" mode="aspectFill" class="door-image" />
                <view v-else class="icon-content">
                  <text class="brand-text">{{ getServiceTypeFirstChar(order.serviceTypeText) }}</text>
                  <text class="service-text">{{ getBrandText(order.brand) }}{{ order.serviceTypeText }}</text>
                </view>
              </view>

              <view class="order-details">
                <view class="store-name-row">
                  <text class="store-name">{{ formatStoreName(order.storeName) }}</text>
                  <view class="price-container">
                    <text class="price">{{ order.reward ? getTotalAmountWithReward(order) : getDisplayAmount(order) }}</text>
                    <text v-if="order.reward" class="reward-badge">赏{{ parseInt(getRewardAmount(order)) }}</text>
                  </view>
                </view>
                <view class="service-time">服务时间：<text class="highlight" style="white-space: pre-line;">{{ order.serviceTime }}</text></view>
                <view class="service-item">服务项目：<text class="highlight">{{ order.serviceItem }}</text></view>
                <view class="service-item" v-if="order.extraServices">附加服务：<text class="highlight">{{ order.extraServices }}</text></view>
                <view class="service-item" v-if="order.reward">
                  <text style="color: #FF6B00;">（订单{{ getDisplayAmount(order) }}+打赏{{ getRewardAmount(order) }}）</text>
                </view>
              </view>

              <view class="arrow-right">
                <view class="arrow"></view>
              </view>
            </view>

            <view class="order-footer">
              <view class="distance-info">
                <image src="https://ccpt.qiniu.0871.cn/riderend/logo11.png" mode="aspectFit" class="location-icon"></image>
                <text class="distance-text">距离订单地址<text class="highlight">{{ order.distance }}km</text></text>
                <text class="location-detail" @click.stop="showLocationDetail(order)">点击导航</text>
              </view>
            </view>
          </view>
          </template>

          <!-- 加载中提示 -->
          <view v-if="loading" class="loading-container">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载中...</text>
          </view>

          <!-- 无更多数据提示 -->
          <view v-if="!loading && !hasMore && orderList.length > 0" class="no-more-tip">
            <text v-if="activeTab === 'comprehensive'">仅展示近期10条历史订单...</text>
            <text v-else>没有更多订单了</text>
          </view>

          <!-- 无数据提示 -->
          <view v-if="!loading && orderList.length === 0" class="empty-tip">
            <image src="https://ccpt.qiniu.0871.cn/rider/empty.png" mode="aspectFit" class="empty-image"></image>
            <text class="empty-text" v-if="activeTab === 'comprehensive'">本区域暂无待接新订单</text>
            <text class="empty-text" v-else>暂无订单</text>
            <text class="empty-subtitle" v-if="activeTab === 'comprehensive'">请持续关注</text>

            <!-- 推广期提示 - 仅在接单大厅显示 -->
            <view class="promotion-tip" v-if="activeTab === 'comprehensive'">
              <text class="promotion-text">当前为平台推广期</text>
            </view>

            <!-- 推荐骑手 - 仅在接单大厅显示 -->
            <view class="recommend-item" v-if="activeTab === 'comprehensive'" @click="goToRiderRecommend">
              <text class="recommend-text">推荐骑手，得订单2.5%奖金 连拿100天！</text>
              <text class="recommend-btn">去推荐</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <tab-bar :activeTab="'hall'"></tab-bar>

    <!-- 悬浮小图 -->
    <floating-image
      :target-url="'/riderEnd/my'"
      :auto-open-share="true"
      :custom-click="handleFloatingImageClick"
    ></floating-image>

    <!-- 悬浮聊天图标 -->
    <floating-chat-icon></floating-chat-icon>

    <!-- 海报弹窗 -->
    <poster-modal
      :show="showPosterModal"
      :posters="posterList"
      @close="handlePosterClose"
      @posterClick="handlePosterClick"
    />

    <!-- 订单详情弹窗 -->
    <view v-if="showOrderModal" class="order-modal-mask" @click="closeOrderModal">
      <view class="order-modal-container" @click.stop>
        <!-- 顶部装饰图片 -->
        <image 
          class="order-modal-header-image" 
          src="https://ccpt.qiniu.0871.cn/duihua/dingdanjianshu.png" 
          mode="widthFix"
        ></image>
        
		<view class="asdasd" style="background-color:#fff; margin-top: -2rpx;">
			<view class="order-modal-content">
			  <!-- 订单基本信息 -->
			  <view class="order-modal-info">
				<!-- <view class="info-row">
				  <text class="info-label">订单编号：</text>
				  <text class="info-value">{{ currentOrderInfo.orderNumber }}</text>
				</view>
				<view class="info-row">
				  <text class="info-label">发单时间：</text>
				  <text class="info-value">{{ currentOrderInfo.orderTime }}</text>
				</view> -->
			<view class="info-row">
			  <text class="info-label">服务项目：</text>
			  <text class="info-value service-item-value">{{ currentOrderInfo.serviceItem }}</text>
			</view>
			<view class="info-row" v-if="getAdditionalServices(currentOrderInfo)">
			  <text class="info-label">附加服务：</text>
			  <text class="info-value service-item-value">{{ getAdditionalServices(currentOrderInfo) }}</text>
			</view>
			<view class="info-row">
			  <text class="info-label">服务佣金：</text>
			  <text class="info-value amount">{{ getDisplayAmount(currentOrderInfo) }}</text>
			</view>
			   <!-- <view class="info-row">
				  <text class="info-label">时效：</text>
				  <text class="info-value service-time-value">{{ currentOrderInfo.serviceTime }}</text>
				</view> -->
				<!-- <view class="info-row">
				  <text class="info-label">打赏金额：</text>
				  <text class="info-value service-amount">8.0元</text>
				</view> -->
			  </view>
			</view>
			
			<view class="order-modal-content mar-top-10">
			  <!-- 订单基本信息 -->
			  <view class="order-modal-info">
				<view class="info-row">
				  <text class="info-label">服务地址：</text>
				  <text class="info-value">{{ formatAddress(currentOrderInfo) }}</text>
				</view>
				<view class="info-row">
				  <text class="info-label">服务距离：</text>
				  <view class="distance-info-modal">
					<text class="navigation-btn" @click="navigateToOrder">导航</text>
					<text class="info-value">{{ currentOrderInfo.distance || 0 }}km</text>
				  </view>
				</view>
			  </view>
			</view>
			
			<!--预估完单时间-->
			<view class="order-modal-content mar-top-10">
			  <view class="order-modal-info">
				<view class="completion-time-label">
				  <text style="color: #FF4D4F;">*</text>
				  <text>请选择预估完单时间</text>
				  <text class="time-hint-red">（供参考 无关佣金）</text>
				</view>
				<view class="time-options">
				  <view class="time-option" :class="{ selected: selectedTimeOption === '马上去（3h内）' }" @click="selectTimeOption('马上去（3h内）')">马上去<text class="time-small">（3h内）</text></view>
				  <view class="time-option" :class="{ selected: selectedTimeOption === '明天上午' }" @click="selectTimeOption('明天上午')">明天上午</view>
				  <view class="time-option" :class="{ selected: selectedTimeOption === '明天内' }" @click="selectTimeOption('明天内')">明天内</view>
				  <view class="time-option" :class="{ selected: selectedTimeOption === '今天内' }" @click="selectTimeOption('今天内')">今天内</view>
				  <view class="time-option" :class="{ selected: selectedTimeOption === '明天下午' }" @click="selectTimeOption('明天下午')">明天下午</view>
				  <view class="time-option" :class="{ selected: selectedTimeOption === '不确定' }" @click="selectTimeOption('不确定')">不确定</view>
				</view>
				<view class="time-warning">提交后可于【我的】修改时间 取消请联系客服</view>
			  </view>
			</view>

			<!-- 关闭按钮 -->
			<!-- <view class="order-modal-close" @click="closeOrderModal">×</view> -->

			<!-- 转单奖励信息 - 已隐藏 -->
			<!-- <view v-if="!currentOrderInfo.isTransferOrder" class="order-modal-reward">
				<view class="pos-rel">
					<text class="reward-label">转单奖励</text>
					<view class="reward-condition">
						<text class="reward-condition-text">派出且成功完单</text>
					</view>
					<view class="pos-zhuanpai" v-if="countdownText && !canTransfer">{{ countdownText }}</view>
				</view>
				<view class="reward-amount">
					{{ getTransferReward(currentOrderInfo) }}
				</view>
			</view> -->

			<view class="order-modal-footer">
			  <button class="modal-btn cancel" @click="closeOrderModal">取消</button>
			  <!-- 订单转派按钮 - 已隐藏 -->
			  <!-- <button v-if="!currentOrderInfo.isTransferOrder && !currentOrderInfo.isTransferMode && !isTransferredOrder(currentOrderInfo)"
				  class="modal-btn transfer"
				  :class="{disabled: !canTransfer}"
				  :open-type="canTransfer ? 'share' : ''"
				  @click="transferOrderInModal">
				<text v-if="!canTransfer">订单转派</text>
				<text v-else>订单转派</text>
			  </button> -->
			  <button v-if="!currentOrderInfo.isTransferMode" class="modal-btn confirm" :class="{disabled: isAcceptingOrder}" @click="acceptOrder">
				<text v-if="isAcceptingOrder">接单中...</text>
				<text v-else>立即接单</text>
			  </button>
			  <button v-if="currentOrderInfo.isTransferMode" class="modal-btn confirm" :class="{disabled: isTransferringOrder}" @click="confirmTransferOrder">
				<text v-if="isTransferringOrder">转单中...</text>
				<text v-else>确认转单</text>
			  </button>
			</view>
		</view>
      </view>
      
      <!-- 剩余接单配额 -->
      <view class="order-quota-bar" @click.stop>
        <view class="quota-text">剩余接单配额数：18次</view>
        <view class="quota-link">通过这些任务为自己加配额 ></view>
      </view>
    </view>

    <!-- 认证提示弹窗 -->
    <auth-modal
      :show="showAuthModal"
      title="认证提示"
      content="您还未完成骑手认证，无法接单。是否前往认证页面？"
      cancel-text="取消"
      confirm-text="去认证"
      @cancel="showAuthModal = false"
      @confirm="goToAuth"
    />

    <!-- 自动撤销任务提醒弹窗 -->
    <view v-if="showCancelModal" class="cancel-modal-mask" @click="closeCancelModal">
      <view class="cancel-modal-container" @click.stop>
        <!-- 顶部图片 -->
        <view class="cancel-modal-header">
          <image 
            class="cancel-modal-header-image" 
            src="https://ccpt.qiniu.0871.cn/rider/new/chexiao.png" 
            mode="widthFix"
          ></image>
          <text class="cancel-intro-text">您有{{ canceledTasks.length }}个任务已被系统自动撤销：</text>
        </view>
        
        <!-- 内容区域 -->
        <view class="cancel-modal-content">
          
          <view v-if="canceledTasks.length === 1" class="single-task">
            <view class="task-item">
              <view class="task-row">
                <text class="task-label">订单编号</text>
                <text class="task-value">{{ canceledTasks[0].task.task_no }}</text>
              </view>
              <view class="task-row">
                <text class="task-label">门店名称</text>
                <text class="task-value">{{ canceledTasks[0].task.task_detail.store_name }}</text>
              </view>
              <view class="task-row">
                <text class="task-label">撤销时间</text>
                <text class="task-value">{{ formatCancelTime(canceledTasks[0].created_at) }}</text>
              </view>
              <view class="task-row">
                <text class="task-label">撤销原因</text>
                <text class="task-reason">{{ canceledTasks[0].cancel_reason || '订单超时自接单后36小时未完单' }}</text>
              </view>
            </view>
          </view>
          
          <view v-else class="multiple-tasks">
            <scroll-view scroll-y class="task-list">
              <view v-for="(task, index) in canceledTasks" :key="index" class="task-item">
                <view class="task-row">
                  <text class="task-label">订单编号</text>
                  <text class="task-value">{{ task.task.task_no }}</text>
                </view>
                <view class="task-row">
                  <text class="task-label">门店名称</text>
                  <text class="task-value">{{ task.task.task_detail.store_name }}</text>
                </view>
                <view class="task-row">
                  <text class="task-label">撤销时间</text>
                  <text class="task-value">{{ formatCancelTime(task.created_at) }}</text>
                </view>
                <view class="task-row">
                  <text class="task-label">撤销原因</text>
                  <text class="task-reason">{{ task.cancel_reason || '订单超时自接单后36小时未完单' }}</text>
                </view>
              </view>
            </scroll-view>
          </view>
        </view>
        
        <!-- 底部按钮 -->
        <view class="cancel-modal-footer">
          <view class="modal-btn-new confirm" @click="closeCancelModal">知道了 下次我尽快完成！</view>
        </view>
      </view>
    </view>

    <!-- 隐藏的canvas用于生成分享图片 -->
    <canvas
      canvas-id="shareCanvas"
      style="width: 400px; height: 300px; position: fixed; top: -9999px; left: -9999px;"
    ></canvas>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import TabBar from '@/components/rider/tab-bar/index.vue'
import PosterModal from '@/components/PosterModal/index.vue'
import FloatingImage from '@/components/FloatingImage/riderEnd_index.vue'
import AuthModal from '@/components/AuthModal/index.vue'
// import FloatingChatIcon from '@/components/FloatingChatIcon/index.vue'
	import md5 from 'md5'

export default {
  components: {
    NavBar,
    TabBar,
    PosterModal,
    FloatingImage,
    AuthModal,
    // FloatingChatIcon
  },
  data() {
    return {
		showAuthModal: false,
      currentCity: '海南',
      activeTab: 'comprehensive',
      orderList: [],
      riderUserInfo: null,
      userLocation: null,
      loading: true,
      page: 1,
      per_page: 10,
      hasMore: true,
      isRefreshing: false,
      isNavigating: false, // 防抖标志
      totalCityCount: 0, // 全国已开通城市数量
      showPosterModal: false, // 海报弹窗显示状态
      showCancelModal: false, // 撤销任务弹窗显示状态
      canceledTasks: [], // 撤销的任务列表
      selectedTimeOption: '', // 选中的预估完单时间
      inProgressTasksCount: 0, // 进行中任务数量
      posterList: [ // 海报列表
        {
          id: 1,
          image: 'https://ccpt.qiniu.0871.cn/banner123.png',
          title: '海报1',
          url: ''
        },
        {
          id: 2,
          image: 'https://ccpt.qiniu.0871.cn/banner20.png',
          title: '海报2',
          url: ''
        }
		// ,
  //       {
  //         id: 4,
  //         image: 'https://ccpt.qiniu.0871.cn/p2.png',
  //         title: '海报4',
  //         url: ''
  //       },
  //       {
  //         id: 5,
  //         image: 'https://ccpt.qiniu.0871.cn/p3.png',
  //         title: '海报5',
  //         url: ''
  //       }
      ],
      bannerList: [ // banner轮播图列表
        {
          id: 1,
          image: 'https://ccpt.qiniu.0871.cn/rider/banner3.png',
          title: 'Banner 1',
          url: ''
        },
        {
          id: 2,
          image: 'https://ccpt.qiniu.0871.cn/rider/banner5.png',
          title: 'Banner 1',
          url: ''
        },
        {
          id: 3,
          image: 'https://ccpt.qiniu.0871.cn/qs-bn.png',
          title: 'Banner 2',
          url: ''
        }
      ],
      // 订单弹窗相关
      showOrderModal: false,
      currentOrderInfo: {},
      isAcceptingOrder: false,
      isTransferringOrder: false,
      // 分享描述缓存
      shareDesc: '',
      // 分享订单数据缓存
      shareOrderData: [],
      // 分享统计数据缓存
      shareCountData: {},
      // 分享图片路径
      shareImageUrl: 'https://ccpt.qiniu.0871.cn/qs-bn.png',
      // 分享参数
      shareParams: null,
      // 当前要转派的订单
      currentTransferOrder: null,
      // 待处理的转派订单ID（从分享链接进入时使用）
      pendingTransferOrderId: null,
      // 倒计时相关
      countdownTimer: null,
      countdownText: '',
      showTransferCondition: true,
      canTransfer: true // 控制是否可以转单
    }
  },
  onLoad(options) {
    // 处理分享进入的参数
    if (options.task_referrer_id && options.shared_order_id) {
      console.log('通过订单转派分享进入:', {
        task_referrer_id: options.task_referrer_id,
        shared_order_id: options.shared_order_id
      });

      // 将 task_referrer_id 保存到本地存储
      uni.setStorageSync('current_task_referrer_id', options.task_referrer_id);

      // 保存分享参数，后续可用于处理订单接单逻辑
      this.shareParams = {
        task_referrer_id: options.task_referrer_id,
        shared_order_id: options.shared_order_id
      };

      // 保存分享订单ID，在订单列表加载完成后显示
      this.pendingTransferOrderId = options.shared_order_id;
    }
  },
  onShow() {
    // 获取骑手信息
    this.riderUserInfo = uni.getStorageSync('riderUserInfo')

    // 判断riderUserInfo是否存在，否则跳转登录页
    if (!this.riderUserInfo) {
      uni.reLaunch({
        url: '/riderEnd/login'
      })
      return
    }

    // 刷新用户信息
    this.fetchUserInfo()

    // 从本地存储获取当前城市
    const savedCity = uni.getStorageSync('rider_selectedCity')
    if (savedCity) {
      this.currentCity = savedCity.fullCityName
      // 获取用户位置
      this.getUserLocation()
      // 获取待接单列表
      // this.getWaitingTasks()

      // 获取已开通城市数量
      const totalCityCount = uni.getStorageSync('totalCityCount')
      if (totalCityCount) {
        this.totalCityCount = totalCityCount
      } else {
        // 如果没有缓存的城市数量，调用接口获取
        this.getCityCount()
      }
    } else {
      // 没有选择城市，默认全部区域
      this.currentCity = '全部'
      this.getUserLocation()
      // this.getWaitingTasks()
      const totalCityCount = uni.getStorageSync('totalCityCount')
      if (totalCityCount) {
        this.totalCityCount = totalCityCount
      } else {
        this.getCityCount()
      }
    }

    // 检查是否需要显示海报弹窗
    this.checkPosterModal()

    // 检查自动撤销的任务 - 已关闭调试
    // this.checkAutoCanceledTasks()
  },
  onPullDownRefresh() {
    const savedCity = uni.getStorageSync('rider_selectedCity')
    uni.setStorageSync('rider_selectedCity', {"name":"","fullCityName":"全部"})
    this.currentCity = '全部'
    this.refreshList()
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadMore()
    }
  },
  onUnload() {
    // 页面销毁时清除定时器
    this.clearCountdownTimer();
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    this.clearCountdownTimer();
  },
  // 微信分享到好友
  async onShareAppMessage() {
    console.log('onShareAppMessage 被调用');
    console.log('currentTransferOrder:', this.currentTransferOrder);
    console.log('currentOrderInfo:', this.currentOrderInfo);

    // 如果是订单转派分享，优先使用 currentTransferOrder，如果为空则使用 currentOrderInfo
    const order = this.currentTransferOrder || this.currentOrderInfo;

    if (order && order.id) {
      console.log('分享订单转派信息:', order);
      console.log('订单价格:', order.price);
      console.log('转单奖励:', this.getTransferReward(order));

      const shareData = {
        title: `${order.serviceItem} | ${this.getTransferDisplayAmount(order)} | ${this.formatAddress(order)}`,
        desc: `【订单转派】距离: ${order.distance}km | 转单奖励: ${this.getTransferReward(order)}`,
        path: `/riderEnd/index?task_referrer_id=${this.riderUserInfo.id}&shared_order_id=${order.id}`,
        imageUrl: 'https://ccpt.qiniu.0871.cn/qs-bn.png'
      };

      // 延迟清除转派订单信息，确保分享完成
      setTimeout(() => {
        this.currentTransferOrder = null;
      }, 1000);

      uni.showToast({
        title: '订单转派成功',
        icon: 'success'
      });

      return shareData;
    }
    
    // 默认分享逻辑
    // 显示加载提示
    uni.showLoading({
      title: '加载中...',
      mask: true
    });

    try {
      // 异步获取分享描述，但不等待结果
      const shareImageUrl = await this.generateShareDescSync();

      // 隐藏加载提示
      uni.hideLoading();

      return {
        title: '快来加入充充跑腿，成为骑手，轻松接单赚钱！',
        desc: '快来加入充充跑腿，成为骑手，轻松接单赚钱！',
        path: '/riderEnd/index',
        imageUrl: shareImageUrl
      }
    } catch (error) {
      console.error('分享准备失败:', error);
      // 隐藏加载提示
      uni.hideLoading();

      return {
        title: '快来加入充充跑腿，成为骑手，轻松接单赚钱！',
        desc: '快来加入充充跑腿，成为骑手，轻松接单赚钱！',
        path: '/riderEnd/index',
        imageUrl: 'https://ccpt.qiniu.0871.cn/qs-bn.png'
      }
    }
  },
  // 微信分享到朋友圈
  onShareTimeline() {
    return {
      title: '充充跑腿骑手端 - 抢单大厅',
      query: 'from=timeline',
      imageUrl: 'https://ccpt.qiniu.0871.cn/qs-bn.png'
    }
  },
  methods: {
    // 查询用户信息接口
    async fetchUserInfo() {
      try {
        const riderUserInfo = uni.getStorageSync('riderUserInfo');
        if (!riderUserInfo || !riderUserInfo.id || !riderUserInfo.phone) {
          console.error('获取用户信息失败: 缺少必要参数');
          return;
        }

        // 构建签名
        const signStr = `service_member_id=${riderUserInfo.id}&phone_number=${riderUserInfo.phone}`;
        const sign = md5(signStr);

        // 构建请求参数
        const params = {
          service_member_id: riderUserInfo.id,
          sign: sign,
          member_id: riderUserInfo.id
        };

        console.log('查询用户信息参数:', params);

        // 调用接口
        const res = await this.$request('service/member/info', params, 'POST');

        console.log('用户信息接口响应:', res);

        if (res.status === 'success' && res.data) {
          // 更新本地存储的用户信息
          const updatedUserInfo = {
			...riderUserInfo,
			...res.data,
			      ...res.data,
            balance: res.data.balance || 0,
            month_commission: res.data.month_commission || 0,
            month_completed_tasks_count: res.data.month_completed_tasks_count || 0,
            today_commission: res.data.today_commission || 0,
            today_completed_tasks_count: res.data.today_completed_tasks_count || 0,
            rate: res.data.rate || 1,
            zone: res.data.zone || null,
            latest_certification: res.data.latest_certification || null,
            submit_certification: res.data.submit_certification || '待审核'
          };

          // 保存到本地存储
          uni.setStorageSync('riderUserInfo', updatedUserInfo);

          // 更新当前页面的用户信息
          this.riderUserInfo = updatedUserInfo;

          console.log('用户信息已更新:', updatedUserInfo);
        } else {
          console.warn('获取用户信息失败:', res.msg || res.message || '未知错误');
        }
      } catch (error) {
        console.error('查询用户信息失败:', error);
        // 不显示错误提示，避免影响用户体验
      }
    },

    goToAuth() {
      this.showAuthModal = false;
      // 跳转到认证页面
      uni.navigateTo({
        url: '/riderEnd/verify'
      });
    },
    // 检查骑手认证状态
    checkRiderVerification() {
      const riderUserInfo = uni.getStorageSync('riderUserInfo');
      if (!riderUserInfo) {
        return false; // 未登录
      }

      // 检查认证状态：已通过才能接单
      return riderUserInfo.submit_certification === '已通过';
    },
    selectCity() {
      uni.navigateTo({
        url: '/riderEnd/city-select/index'
      })
    },
    setActiveTab(tab) {
      this.activeTab = tab

      // 如果切换到非接单大厅的标签，加载对应状态的订单
      if (tab !== 'comprehensive') {
        this.page = 1
        this.orderList = []
        this.getOrdersByStatus(tab)
      } else {
        // 切换回接单大厅，重新加载待接单列表
        this.page = 1
        this.orderList = []
        this.getWaitingTasks()
      }
    },
    takeOrder(orderId) {
      uni.showModal({
        title: '确认接单',
        content: '您确定要接此单吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '接单成功',
              icon: 'success'
            })
          }
        }
      })
    },
    copyOrderNumber(orderNumber) {
      uni.setClipboardData({
        data: orderNumber,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          });
        }
      });
    },
    // 格式化地址显示
    formatAddress(order) {
      const address = order.address;
      if (!address) return '';

      // 如果中文字数少于14个字，显示全部地址
      if (address.length < 18) {
        return address;
      }

      // 根据订单类型隐藏不同数量的字符
      const charsToHide = order.isRecentTask ? 4 : 6;

      if (address.length > charsToHide) {
        return address.slice(0, -charsToHide) + '...';
      } else {
        // 如果地址长度小于或等于要隐藏的字符数，则显示全部地址
        return address;
      }
    },
    // 获取用户位置
    getUserLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.userLocation = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          // 获取到位置后根据当前标签状态加载对应的订单列表
          this.refreshCurrentTabData()
        },
        fail: (err) => {
          console.error('获取位置失败:', err)
          uni.showToast({
            title: '获取位置失败',
            icon: 'none'
          })
        }
      })
    },

    // 根据当前标签状态刷新数据
    refreshCurrentTabData() {
      if (this.activeTab === 'comprehensive') {
        // 接单大厅
        this.getWaitingTasks()
      } else {
        // 其他标签（进行中、完成待确认、已完成）
        this.getOrdersByStatus(this.activeTab)
      }
    },
    // 计算两点之间的距离
    calculateDistance(lat1, lon1, lat2, lon2) {
      if (!lat1 || !lon1 || !lat2 || !lon2) return 0

      const R = 6371 // 地球半径，单位公里
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c

      return parseFloat(distance.toFixed(1))
    },
    // 刷新列表
    refreshList() {
      this.page = 1
      this.hasMore = true
      this.isRefreshing = true
      this.getWaitingTasks()
    },

    // 加载更多
    loadMore() {
      if (!this.hasMore || this.loading) return
      this.page++

      // 根据当前激活的标签加载对应的数据
      if (this.activeTab === 'comprehensive') {
        this.getWaitingTasks()
      } else {
        this.getOrdersByStatus(this.activeTab)
      }
    },

    // 根据状态获取订单列表
    async getOrdersByStatus(status) {
      if (!this.riderUserInfo) {
        this.loading = false
        this.isRefreshing = false
        uni.stopPullDownRefresh()
        return
      }

      this.loading = true
      try {
        const signStr = `service_member_id=${this.riderUserInfo.id}&phone_number=${this.riderUserInfo.phone}`
        const sign = md5(signStr)

        // 根据状态设置请求参数
        let requestStatus = status
        if (status === 'completed') {
          // 已完成状态包含completed和canceled
          requestStatus = ['completed', 'canceled']
        }

        const params = {
          service_member_id: this.riderUserInfo.id,
          phone_number: this.riderUserInfo.phone,
          sign: sign,
          status: requestStatus,
          page: this.page,
          per_page: this.per_page   
        }

        const res = await this.$request('task/list', params, 'POST')

        if (res.code === 200 && res.data) {
          const newOrders = res.data.map(item => {
            // 构建完整地址
            let fullAddress = '';
            if (item.shop_address) {
              fullAddress = [
                item.province_name,
                item.city_name,
                item.district_name,
                item.shop_address
              ].filter(Boolean).join('');
            }

            // 处理打赏信息
            let rewardInfo = null;
            if (item.reward && Array.isArray(item.reward) && item.reward.length > 0) {
              const paidRewards = item.reward.filter(r => r.status === 'paid');
              if (paidRewards.length > 0) {
                const totalAmount = paidRewards.reduce((sum, r) => sum + parseFloat(r.order_amount || 0), 0);
                rewardInfo = {
                  amount: totalAmount.toFixed(2),
                  count: paidRewards.length
                };
              }
            }

            return {
              id: item.task_id,
              orderNumber: item.task_no,
              task_date: item.task_date,
              price: `¥${parseFloat(item.order_amount).toFixed(2)}`,
              serviceType: this.getServiceTypeClass(item.task_detail?.detail || item.task_name),
              serviceTypeText: this.getServiceTypeDisplayText(item.task_detail?.detail || item.task_name),
              storeName: item.task_detail?.store_name || '未知店铺',
              serviceTime: this.formatServiceTime(item.task_date, item.deadline, item.time_limit),
              serviceItem: this.formatServiceItems(item.task_detail, item),
              extraServices: this.formatExtraServices(item.task_detail),
              contactName: item.name,
              contactPhone: item.phone_number,
              distance: this.userLocation ? this.calculateDistance(
                this.userLocation.latitude,
                this.userLocation.longitude,
                item.latitude,
                item.longitude
              ) : 0,
              countdown: this.calculateCountdown(item.deadline, item.start_date),
              taskDuration: this.calculateTaskDuration(item.start_date, item.task_assignment?.finished_at),
              deadline: item.deadline,
              startDate: item.start_date,
              timeLimit: item.time_limit,
              latitude: item.latitude,
              longitude: item.longitude,
              status: item.status,
              address: fullAddress || '未知地址',
              doorImage: item.task_detail && item.task_detail.pic_url && item.task_detail.pic_url.length > 0 ? item.task_detail.pic_url[0] : '',
              brand: item.brand || '',
              reward: rewardInfo,
              task_detail: item.task_detail
            }
          })

          // 根据页码更新列表
          if (this.page === 1) {
            this.orderList = newOrders
          } else {
            this.orderList = [...this.orderList, ...newOrders]
          }

          // 更新是否有更多数据
          this.hasMore = newOrders.length === this.per_page
        } else {
          if (this.page === 1) {
            this.orderList = []
          }
          this.hasMore = false
        }
      } catch (error) {
        console.error('获取订单列表失败:', error)
        uni.showToast({
          title: '获取订单列表失败',
          icon: 'none'
        })
        if (this.page === 1) {
          this.orderList = []
        }
        this.hasMore = false
      } finally {
        this.loading = false
        this.isRefreshing = false
        uni.stopPullDownRefresh()
      }
    },

    // 修改获取待接单列表方法
    async getWaitingTasks() {
      if (!this.riderUserInfo || !this.userLocation) {
        this.loading = false
        this.isRefreshing = false
        uni.stopPullDownRefresh()
        return
      }

      this.loading = true
      try {
        const timestamp = Date.now()
        const signStr = `service_member_id=${this.riderUserInfo.id}&phone_number=${this.riderUserInfo.phone}`
        const sign = md5(signStr)

        // 获取当前选择的城市
        const savedCity = uni.getStorageSync('rider_selectedCity')

        const params = {
          service_member_id: this.riderUserInfo.id,
          phone_number: this.riderUserInfo.phone,
          sign: sign,
          page: this.page,
          per_page: this.per_page,
			service_provider_id: this.riderUserInfo.provider_id, // 添加服务商ID
        }

        // 只有选择城市后才传 district_name
        if (savedCity && savedCity.name) {
          params.district_name = savedCity.name
        } else {
          // 首次进入不传 district_name
          if (params.district_name) delete params.district_name;
        }

        const res = await this.$request('task/list/waiting', params, 'POST')

		console.log(res)

        if (res.code === 200) {
          // 保存进行中任务数量
          this.inProgressTasksCount = res.in_progress_tasks_count || 0

          // 处理主要数据（data数组）
          const mainOrders = (res.data || []).map(order => {
            return this.formatOrderData(order, false);
          })

          // 处理最近任务数据（recent_tasks数组）- 根据状态判断，标记为recent_tasks来源
          const recentOrders = (res.recent_tasks || []).map(order => {
            const isAssigned = order.status === 'assigned'
            return this.formatOrderData(order, !isAssigned, isAssigned, true) // 第四个参数标记为recent_tasks
          })

          // 合并数据：先渲染data，再渲染recent_tasks
          const newOrders = [...mainOrders, ...recentOrders]

          // 根据页码更新列表
          if (this.page === 1) {
            this.orderList = newOrders
          } else {
            this.orderList = [...this.orderList, ...newOrders]
          }

          // 更新是否有更多数据（基于主要数据的长度）
          this.hasMore = mainOrders.length === this.per_page
        } else {
          if (this.page === 1) {
            this.orderList = []
          }
          this.hasMore = false
        }
      } catch (error) {
        console.error('获取待接单列表失败:', error)
        uni.showToast({
          title: '获取订单列表失败',
          icon: 'none'
        })
        if (this.page === 1) {
          this.orderList = []
        }
        this.hasMore = false
      } finally {
        this.loading = false
        this.isRefreshing = false
        uni.stopPullDownRefresh()
        
        // 如果有待处理的转派订单ID，尝试显示转派订单
        if (this.pendingTransferOrderId && this.page === 1) {
          const orderId = this.pendingTransferOrderId
          this.pendingTransferOrderId = null // 清除待处理的ID
          
          // 延迟500ms确保数据渲染完成
          setTimeout(() => {
            this.showTransferOrderModal(orderId)
          }, 500)
        }
      }
    },
    // 格式化订单数据的通用方法
    formatOrderData(order, isCompleted = false, isAssigned = false, isRecentTask = false) {
      const taskDetail = order.task_detail || {};
      
      // 处理打赏信息 - 只显示真实的打赏数据
      let rewardInfo = null;
      if (order.reward && Array.isArray(order.reward) && order.reward.length > 0) {
        // 计算打赏总金额（只计算已支付的）
        const paidRewards = order.reward.filter(item => item.status === 'paid');
        if (paidRewards.length > 0) {
          const totalAmount = paidRewards.reduce((sum, item) => sum + parseFloat(item.order_amount || 0), 0);
          rewardInfo = {
            amount: totalAmount.toFixed(2),
            count: paidRewards.length
          };
        }
      }
      
      return {
        id: order.task_id,
        orderNumber: order.task_no,
        orderTime: order.task_date,
        price: parseFloat(order.order_amount || 0),
        serviceType: this.getServiceTypeClass(taskDetail.detail || order.task_name),
        serviceTypeText: this.getServiceTypeDisplayText(taskDetail.detail || order.task_name),
        storeName: taskDetail.store_name || '未知店铺',
        serviceTime: this.formatServiceTime(order.start_date, order.deadline, order.time_limit),
        serviceItem: this.formatServiceItems(taskDetail, order),
        contactName: order.name,
        contactPhone: order.phone_number,
        distance: this.userLocation ?
          this.calculateDistance(
            this.userLocation.latitude,
            this.userLocation.longitude,
            order.latitude,
            order.longitude
          ) : 0,
        address: (() => {
          const fullAddress = [
            order.province_name,
            order.city_name,
            order.district_name,
            order.shop_address
          ].filter(Boolean).join('');

          if (isRecentTask && fullAddress.length > 8) {
            return fullAddress.slice(0, -8) + '...';
          }

          return fullAddress;
        })(),
        latitude: order.latitude,
        longitude: order.longitude,
        // 新增字段
        timeLimit: order.time_limit, // 服务时效（小时）
        deadline: order.deadline,    // 截止时间
        brand: order.brand || '', // 品牌信息
        brandText: this.getBrandText(order.brand || ''), // 品牌显示文字
        isCompleted: isCompleted, // 是否为已完结订单
        isAssigned: isAssigned, // 是否为进行中订单（assigned状态）
        isRecentTask: isRecentTask, // 是否来自recent_tasks数组
        refundRequest: order.refund_request === 1 || order.refund_request === '1', // 是否为退款中订单
        assigned_at: this.extractDeadlineTime(order.assigned_at), // 从时效中提取时间
        reward: rewardInfo, // 打赏信息
        task_detail: taskDetail // 任务详情，包含附加服务信息
      }
    },
    // 获取服务类型文本
    getServiceTypeText(type) {
      const typeMap = {
        'repair': '修',
        'supplement': '补'
      }
      return typeMap[type] || type
    },
    // 获取品牌显示文字
    getBrandText(brand) {
      const brandMap = {
        'meituan': '美团',
        'guaishou': '怪兽',
        'jiedian': '街电',
        'xiaodian': '小电',
        'zhumang': '竹芒'
      };
      return brandMap[brand] || '充充';
    },

    // 获取服务类型首字（用于大字显示）
    getServiceTypeFirstChar(serviceTypeText) {
      if (!serviceTypeText) return '补';

      // 如果包含"异常"，则显示"异"
      if (serviceTypeText.includes('异常')) {
        return '异';
      }

      const firstChar = serviceTypeText.charAt(0);
      // 如果首字是"好"或"坏"，则显示"收"
      if (firstChar === '好' || firstChar === '坏') {
        return '收';
      }
      return firstChar;
    },

    // 获取品牌对应的CSS类名
    getBrandClass(brand) {
      const brandClassMap = {
        'meituan': 'brand-meituan',
        'guaishou': 'brand-guaishou',
        'jiedian': 'brand-jiedian',
        'xiaodian': 'brand-xiaodian',
        'zhumang': 'brand-zhumang'
      };
      return brandClassMap[brand] || 'brand-default';
    },

    // 获取服务类型CSS类名
    getServiceTypeClass(detail) {
      // 处理多选情况，取第一个服务类型
      const firstDetail = detail && detail.includes(',') ? detail.split(',')[0].trim() : detail;
      
      switch (firstDetail) {
        case 'bubao':
          return 'supplement';
        case 'goodRecycle':
          return 'recycle';
        case 'badRecycle':
          return 'recycle';
        case 'offline_abnormal':
          return 'offline-abnormal';
        case 'income_abnormal':
          return 'income-abnormal';
        case 'other_abnormal':
          return 'other-abnormal';
        default:
          return 'repair';
      }
    },

    // 获取服务类型显示文本（只显示前两个字符）
    getServiceTypeDisplayText(detail) {
      // 处理多选情况，取第一个服务类型
      const firstDetail = detail && detail.includes(',') ? detail.split(',')[0].trim() : detail;
      
      switch (firstDetail) {
        case 'bubao':
          return '补宝';
        case 'goodRecycle':
          return '收宝';
        case 'badRecycle':
          return '收宝';
        case 'offline_abnormal':
          return '离线';
        case 'income_abnormal':
          return '收入';
        case 'other_abnormal':
          return '其他';
        default:
          // 如果是其他类型，取前两个字符
          return firstDetail ? firstDetail.substring(0, 2) : '';
      }
    },
    // 提取截止时间（仅时间部分）
    extractDeadlineTime(endTime) {
      // if (!endTime) return '未设置时间';

      const deadlineDate = new Date(endTime);

      // 根据订单时长决定提前时间：24小时单提前6小时，48小时以上提前12小时
      // let advanceHours = 6; // 默认提前6小时
      // if (startTime) {
      //   const startDate = new Date(startTime);
      //   const endDate = new Date(endTime);
      //   const durationHours = (endDate - startDate) / (1000 * 60 * 60); // 计算时长（小时）

      //   if (durationHours >= 48) {
      //     advanceHours = 12; // 48小时以上提前12小时
      //   } else if (durationHours >= 24) {
      //     advanceHours = 6;  // 24小时单提前6小时
      //   }
      // }

      deadlineDate.setHours(deadlineDate.getHours());
      return `${String(deadlineDate.getMonth() + 1).padStart(2, '0')}-${String(deadlineDate.getDate()).padStart(2, '0')} ${String(deadlineDate.getHours()).padStart(2, '0')}:${String(deadlineDate.getMinutes()).padStart(2, '0')}`;
    },

    // 格式化服务时间
    formatServiceTime(startTime, endTime, timeLimit) {
      // 添加时间限制和截止时间信息
      let timeInfo = '';

      if (timeLimit) {
        timeInfo += `${timeLimit}小时内`
      }

      if (endTime) {
        const deadlineDate = new Date(endTime)

        // 根据订单时长决定提前时间：24小时单提前6小时，48小时以上提前12小时
        let advanceHours = 6; // 默认提前6小时
        if (startTime) {
          const startDate = new Date(startTime);
          const endDate = new Date(endTime);
          const durationHours = (endDate - startDate) / (1000 * 60 * 60); // 计算时长（小时）

          if (durationHours >= 48) {
            advanceHours = 12; // 48小时以上提前12小时
          } else if (durationHours >= 24) {
            advanceHours = 6;  // 24小时单提前6小时
          }
        }

        deadlineDate.setHours(deadlineDate.getHours() - advanceHours)
        const deadlineFormatted = `${String(deadlineDate.getMonth() + 1).padStart(2, '0')}-${String(deadlineDate.getDate()).padStart(2, '0')} ${String(deadlineDate.getHours()).padStart(2, '0')}:${String(deadlineDate.getMinutes()).padStart(2, '0')}`
        if (timeLimit) {
          timeInfo += ` ${deadlineFormatted}前完成`
        } else {
          timeInfo += `${deadlineFormatted}前完成`
        }
      }

      return timeInfo || '未设置时效'; // 如果都没有设置，显示未设置时效
    },
    // 格式化服务项目
    formatServiceItems(taskDetail,order) {
      if (!taskDetail) return '';

      const items = [];
      const brandMap = {
        'meituan': '美团',
        'guaishou': '怪兽',
        'jiedian': '街电',
        'xiaodian': '小电'
      };

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
            
            // 添加品牌信息（如果存在）
            if (order.brand) {
              const brandName = brandMap[order.brand] || order.brand;
              itemName = `${brandName} ${itemName}`;
            }
            
            if (itemNumber > 0) {
              items.push(`${itemName}x${itemNumber}`);
            }
          });
        } else {
          // 单选时，保持原有逻辑
          let itemName;

          // 判断服务类型
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

          // 添加品牌信息（如果存在）
          if (order.brand) {
              const brandName = brandMap[order.brand] || order.brand;
              itemName = `${brandName} ${itemName}`;
          }

          items.push(`${itemName}x${taskDetail.item_number || 1}`);
        }
      }

      // 设备是否外摆
      // if (taskDetail.device_outside !== undefined) {
      //   items.push(`设备外摆：${taskDetail.device_outside ? '是' : '否'}`);
      // }

      return items.join('、') || '未知服务项目';
    },
    // 跳转到订单信息页（用于进行中、完成待确认、已完成标签页）
    navigateToOrderInfo(event) {
      if (this.isNavigating) return;
      this.isNavigating = true;
      setTimeout(() => { this.isNavigating = false }, 1200); // 1.2秒内不再响应

      // 从事件对象的dataset中获取索引
      const index = event.currentTarget.dataset.index;

      // 通过索引从orderList获取订单数据
      const order = this.orderList[index];

      if (!order || !order.id) {
        console.error('无法获取订单ID，index:', index);
        uni.showToast({
          title: '订单信息获取失败',
          icon: 'none'
        });
        return;
      }

      const id = String(order.id);

      uni.navigateTo({
        url: `/riderEnd/order-info?id=${id}`
      });
    },

    // 处理接单大厅的订单点击
    handleOrderClick(event) {
      // 从事件对象的dataset中获取索引
      const index = event.currentTarget.dataset.index;

      // 通过索引从orderList获取订单数据
      const order = this.orderList[index];

      if (!order) {
        console.error('无法从orderList中获取订单，index:', index);
        return;
      }

      this.goToOrderDetail(order);
    },
    goToOrderDetail(order) {
      // 防御性检查：确保order对象存在
      if (!order) {
        console.error('goToOrderDetail: order对象为undefined');
        return;
      }

      // 如果是recent_tasks的订单，不跳转页面
      if (order.isRecentTask) {
        if (order.isAssigned && !order.isCompleted) {
          // 已接订单提示去订单列表查看
          uni.showToast({
            title: '请到订单列表查看订单详情',
            icon: 'none',
            duration: 2000
          });
        }
        return;
      }

      // 普通订单（非recent_tasks）显示弹窗
      if (!order.isCompleted && !order.isAssigned && !order.refundRequest) {
        // 检查骑手认证状态
        if (!this.checkRiderVerification()) {
          // 未认证，显示认证提示弹窗
          this.showAuthModal = true;
          return;
        }
        // 已认证，显示接单弹窗
        this.showOrderDetailModal(order);
      } else if (!order.isCompleted && !order.isAssigned && order.refundRequest) {
        // 退款中订单不能接单
        uni.showToast({
          title: '该订单状态可能有变，请联系调度核实！',
          icon: 'none',
          duration: 2000
        });
        return;
      } else if (order.isAssigned && !order.isCompleted) {
        // 已接订单提示去订单列表查看
        uni.showToast({
          title: '请到订单列表查看订单详情',
          icon: 'none',
          duration: 2000
        });
      }
    },

    // 转单功能
    transferOrder(order) {
      // 如果是recent_tasks的订单，不跳转页面
      if (order.isRecentTask) {
        return;
      }

      // 普通订单显示弹窗，标记为转单模式
      if (!order.isCompleted && !order.isAssigned && !order.refundRequest) {
        // 检查骑手认证状态
        if (!this.checkRiderVerification()) {
          // 未认证，显示认证提示弹窗
          this.showAuthModal = true;
          return;
        }
        // 已认证，显示订单详情弹窗，标记为转单模式
        this.showTransferOrderDetailModal(order);
      }
    },

    // 显示转单订单详情弹窗
    showTransferOrderDetailModal(order) {
      // 标记这是转单模式，用于在弹窗中显示转单按钮而不是接单按钮
      this.currentOrderInfo = { ...order, isTransferMode: true };
      this.showOrderModal = true;
      // 启动倒计时定时器
      this.startCountdownTimer();
    },

    // 显示订单详情弹窗
    showOrderDetailModal(order) {
      this.currentOrderInfo = order;
      this.showOrderModal = true;
      // 启动倒计时定时器
      this.startCountdownTimer();
    },

    // 显示转派订单详情弹窗
    showTransferOrderModal(orderId) {
      // 在订单列表中查找对应的订单
      const order = this.orderList.find(o => o.id == orderId);
      if (order) {
        // 创建转派订单副本，修改价格为转派后的价格
        const transferOrder = { 
          ...order, 
          isTransferOrder: true,
          // 将价格改为转派后的价格（原价减去转单奖励）
          transferredPrice: this.getTransferDisplayAmount(order)
        };
        
        // 跳转到接单详情页，传递转派相关参数
        uni.navigateTo({
          url: `/riderEnd/order-detail?id=${orderId}&isTransferred=true&transferredPrice=${encodeURIComponent(transferOrder.transferredPrice)}`
        });
      } else {
        // 如果在当前列表中找不到，先重新加载订单列表
        uni.showToast({
          title: '正在加载订单信息...',
          icon: 'loading',
          mask: true
        });
        
        // 重新加载订单列表，并在加载完成后重试
        this.refreshList();
        
        // 延迟3秒后重试查找订单
        setTimeout(() => {
          const retryOrder = this.orderList.find(o => o.id == orderId);
          uni.hideToast();
          
          if (retryOrder) {
            // 找到订单，跳转到详情页
            const transferOrder = { 
              ...retryOrder, 
              isTransferOrder: true,
              transferredPrice: this.getTransferDisplayAmount(retryOrder)
            };
            
            uni.navigateTo({
              url: `/riderEnd/order-detail?id=${orderId}&isTransferred=true&transferredPrice=${encodeURIComponent(transferOrder.transferredPrice)}`
            });
          } else {
            // 仍然找不到订单
            uni.showModal({
              title: '提示',
              content: '未找到对应的转派订单，可能该订单已被其他骑手接单或状态发生变化。',
              showCancel: false,
              confirmText: '知道了'
            });
          }
        }, 3000);
      }
    },

    // 关闭订单详情弹窗
    closeOrderModal() {
      this.showOrderModal = false;
      this.currentOrderInfo = {};
      // 清除倒计时定时器
      this.clearCountdownTimer();
      // 重置转单状态
      this.canTransfer = true;
      this.countdownText = '';
      // 重置选中的时间选项
      this.selectedTimeOption = '';
    },

    // 选择预估完单时间
    selectTimeOption(option) {
      this.selectedTimeOption = option;
      console.log('选中的预估完单时间:', option);
    },

    // 导航到订单地址
    navigateToOrder() {
      if (!this.currentOrderInfo.latitude || !this.currentOrderInfo.longitude) {
        uni.showToast({
          title: '无法获取订单位置信息',
          icon: 'none'
        });
        return;
      }

      // 使用微信小程序的地图导航
      uni.openLocation({
        latitude: parseFloat(this.currentOrderInfo.latitude),
        longitude: parseFloat(this.currentOrderInfo.longitude),
        name: '订单地址',
        address: this.currentOrderInfo.address,
        scale: 18,
        success: () => {
          console.log('导航成功');
        },
        fail: (err) => {
          console.error('导航失败:', err);
          uni.showToast({
            title: '导航失败，请重试',
            icon: 'none'
          });
        }
      });
    },

    // 接单操作
    async acceptOrder() {
      if (this.isAcceptingOrder) return;

      // 验证是否已选择预估完单时间
      if (!this.selectedTimeOption) {
        uni.showToast({
          title: '请选择预估完单时间',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      this.isAcceptingOrder = true;

      try {
        // 生成签名
        const signStr = `service_member_id=${this.riderUserInfo.id}&phone_number=${this.riderUserInfo.phone}`;
        const sign = md5(signStr);

        // 调用接单API
        const params = {
          task_id: this.currentOrderInfo.id,
          service_provider_id: this.riderUserInfo.provider_id,
          service_member_id: this.riderUserInfo.id,
		  predict_complete_type: this.selectedTimeOption, // 预估完单
          sign: sign
        };

        // 从本地存储获取 task_referrer_id 并添加到参数中
        const localReferrerId = uni.getStorageSync('current_task_referrer_id');
        if (localReferrerId) {
          params.task_referrer_id = localReferrerId;
          console.log('接单时添加 task_referrer_id 参数:', localReferrerId);
        }

        const res = await this.$request('task/accept', params, 'POST');

        if (res.code === 200) {
          // 保存订单ID，因为关闭弹窗会清空currentOrderInfo
          const orderId = this.currentOrderInfo.id;

          // 接单成功后清除本地存储的 task_referrer_id
          if (localReferrerId) {
            uni.removeStorageSync('current_task_referrer_id');
            console.log('接单成功，已清除本地 task_referrer_id');
          }

          uni.showToast({
            title: '接单成功',
            icon: 'success'
          });

          // 关闭弹窗
          this.closeOrderModal();

          // 自动跳转到订单信息页面
          setTimeout(() => {
            uni.navigateTo({
              url: `/riderEnd/order-info?id=${orderId}`
            });
          }, 1500); // 延迟1.5秒跳转，让用户看到成功提示
        } else {
          uni.showToast({
            title: res.message || '接单失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('接单失败:', error);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      } finally {
        this.isAcceptingOrder = false;
      }
    },

    // 转单操作
    transferOrder() {
      try {
        // 直接转发订单信息
        // 设置当前要转发的订单信息
        this.currentTransferOrder = this.currentOrderInfo;
        
        // 为当前订单添加 task_referrer_id 标记
        const orderIndex = this.orderList.findIndex(order => order.id === this.currentOrderInfo.id);
        if (orderIndex !== -1) {
          this.orderList[orderIndex].task_referrer_id = this.riderUserInfo.id;
        }

        console.log('准备转派订单信息:', {
          order_id: this.currentOrderInfo.id,
          task_referrer_id: this.riderUserInfo.id
        });

        // 直接调用小程序转发接口
        if (typeof wx !== 'undefined' && wx.updateShareMenu) {
          // 更新分享菜单
          wx.updateShareMenu({
            withShareTicket: true,
            isUpdatableMessage: false,
            activityId: '',
            templateInfo: {},
            success: () => {
              console.log('更新分享菜单成功');
            },
            fail: (err) => {
              console.error('更新分享菜单失败:', err);
            }
          });
        }

        // 直接触发转发分享
        if (typeof wx !== 'undefined' && wx.shareAppMessage) {
          const order = this.currentOrderInfo; // 使用 currentOrderInfo，因为此时还未关闭弹窗
          console.log('转单分享订单信息:', order);
          console.log('订单价格:', order.price);
          console.log('转单奖励:', this.getTransferReward(order));

          const shareData = {
            title: `${order.serviceItem} | ${this.getTransferDisplayAmount(order)} | ${this.formatAddress(order)}`,
            desc: `【订单转派】距离: ${order.distance}km | 转单奖励: ${this.getTransferReward(order)}`,
            path: `/riderEnd/index?task_referrer_id=${this.riderUserInfo.id}&shared_order_id=${order.id}`,
            imageUrl: 'https://ccpt.qiniu.0871.cn/qs-bn.png',
            success: (res) => {
              console.log('订单转派分享成功', res);
              uni.showToast({
                title: '订单转派成功',
                icon: 'success'
              });
              this.closeOrderModal();
              // 清除转派订单信息
              this.currentTransferOrder = null;
            },
            fail: (err) => {
              console.error('订单转派分享失败:', err);
              uni.showToast({
                title: '转派失败，请重试',
                icon: 'none'
              });
              // 清除转派订单信息
              this.currentTransferOrder = null;
            }
          };
          
          wx.shareAppMessage(shareData);
        } else {
          // 备用方案：如果无法直接调用，则提示用户
          uni.showToast({
            title: '请点击右上角转发',
            icon: 'none',
            duration: 2000
          });
          this.closeOrderModal();
        }
      } catch (error) {
        console.error('订单转派失败:', error);
        uni.showToast({
          title: '转派失败，请重试',
          icon: 'none'
        });
        // 清除转派订单信息
        this.currentTransferOrder = null;
      }
    },

    // 弹窗中的转单操作（订单转派）
    transferOrderInModal() {
      // 检查是否可以转单
      if (!this.canTransfer) {
        uni.showToast({
          title: `${this.countdownText.replace('后可转单', '后才能转派')}`,
          icon: 'none',
          duration: 2000
        });
        return;
      }
      this.transferOrder();
    },

    // 确认转单操作
    async confirmTransferOrder() {
      if (this.isTransferringOrder) return;

      this.isTransferringOrder = true;

      try {
        // 这里可以添加转单的具体接口调用
        // 目前先显示提示
        uni.showToast({
          title: '转单功能开发中',
          icon: 'none',
          duration: 2000
        });

        // 模拟转单成功
        setTimeout(() => {
          this.closeOrderModal();
          this.isTransferringOrder = false;
        }, 1000);

      } catch (error) {
        console.error('转单失败:', error);
        uni.showToast({
          title: '转单失败，请重试',
          icon: 'none'
        });
        this.isTransferringOrder = false;
      }
    },

    // 获取已开通城市数量
    async getCityCount() {
      try {
        const res = await this.$request('service/zone', {}, 'POST');
        if (res.code === 200 && res.data) {
          // 计算已开通区县的总数
          let count = 0;
          res.data.forEach(province => {
            province.children.forEach(city => {
              if (city.children && city.children.length > 0) {
                count += city.children.length; // 累加每个城市下的区县数量
              }
            });
          });
          this.totalCityCount = count;
          uni.setStorageSync('totalCityCount', count);
        }
      } catch (err) {
        console.error('获取城市列表失败:', err);
      }
    },
    getDisplayAmount(order) {
      if (!this.riderUserInfo || !this.riderUserInfo.rate) return order.price;
      
      // 检查是否是转派订单：如果当前订单ID与转派订单ID匹配，则显示转派后价格
      if (this.shareParams && this.shareParams.shared_order_id && 
          String(order.id) === String(this.shareParams.shared_order_id)) {
        // 这是转派订单，显示转派后的价格（原价减去转单奖励）
        return this.getTransferDisplayAmount(order);
      }
      
      // 普通订单，显示原价乘以费率
      let amount = 0;
      if (typeof order.price === 'string') {
        amount = parseFloat(order.price.replace('¥', ''));
      } else {
        amount = Number(order.price);
      }
      const rate = Number(this.riderUserInfo.rate);
      const realAmount = amount * rate;
      return `¥${realAmount.toFixed(2)}`;
    },
    // 格式化店铺名称
    formatStoreName(name) {
      if (!name) return '';
      // 去除所有空格和换行
      return name.replace(/\s+/g, '');
    },
    // 显示位置详情（导航）
    showLocationDetail(order) {
      if (!order.latitude || !order.longitude) {
        uni.showToast({
          title: '订单地址信息不完整',
          icon: 'none'
        });
        return;
      }

      // 直接打开地图导航
      uni.openLocation({
        latitude: Number(order.latitude),
        longitude: Number(order.longitude),
        name: order.storeName || '目标位置',
        address: order.address || '未知地址',
        scale: 18,
        success: () => {
          console.log('打开地图成功');
        },
        fail: (err) => {
          console.error('打开地图失败:', err);
          uni.showToast({
            title: '打开地图失败，请检查是否安装地图应用',
            icon: 'none'
          });
        }
      });
    },
    // 获取附加服务
    getAdditionalServices(order) {
      if (!order || !order.task_detail) return '';
      
      const taskDetail = order.task_detail;
      const additionalServices = [];
      
      // 遍历 extra_task_1 到 extra_task_6
      for (let i = 1; i <= 6; i++) {
        const taskKey = `extra_task_${i}`;
        const taskNumberKey = `extra_task_${i}_item_number`;
        
        if (taskDetail[taskKey]) {
          const itemNumber = taskDetail[taskNumberKey] || 1;
          additionalServices.push(`${taskDetail[taskKey]}x${itemNumber}`);
        }
      }
      
      return additionalServices.join('、');
    },
    // 获取订单金额+打赏金额的总和
    getTotalAmountWithReward(order) {
      // 获取基础订单金额
      const baseAmount = this.getDisplayAmount(order);
      
      // 如果有打赏，则计算总金额
      if (order.reward && order.reward.amount) {
        // 提取数字部分
        const baseValue = parseFloat(baseAmount.replace('¥', ''));
        // 打赏金额乘以费率
        const rewardValue = parseFloat(order.reward.amount) * (this.riderUserInfo && this.riderUserInfo.rate ? Number(this.riderUserInfo.rate) : 1);
        const total = baseValue + rewardValue;
        return `¥${total.toFixed(2)}`;
      }
      
      // 没有打赏，返回原金额
      return baseAmount;
    },

    // 获取打赏金额（乘以费率）
    getRewardAmount(order) {
      if (!order.reward || !order.reward.amount) return '0.00';
      const rewardValue = parseFloat(order.reward.amount) * (this.riderUserInfo && this.riderUserInfo.rate ? Number(this.riderUserInfo.rate) : 1);
      return rewardValue.toFixed(2);
    },

    // 计算转单奖励金额
    getTransferReward(order) {
      if (!order || !order.price) return '￥3';

      let amount = 0;
      if (typeof order.price === 'string') {
        amount = parseFloat(order.price.replace('¥', ''));
      } else {
        amount = Number(order.price);
      }

      // 根据订单金额计算转单奖励
      if (amount <= 20) {
        return '￥3';
      } else if (amount <= 50) {
        return '￥6';
      } else {
        return '￥9';
      }
    },

    // 计算转单奖励数值（不带单位）
    getTransferRewardAmount(order) {
      if (!order || !order.price) return 3;

      let amount = 0;
      if (typeof order.price === 'string') {
        amount = parseFloat(order.price.replace('¥', ''));
      } else {
        amount = Number(order.price);
      }

      // 根据订单金额计算转单奖励
      if (amount <= 20) {
        return 3;
      } else if (amount <= 50) {
        return 6;
      } else {
        return 9;
      }
    },

    // 计算转单后的订单金额（原金额减去转单奖励）
    getTransferDisplayAmount(order) {
      if (!this.riderUserInfo || !this.riderUserInfo.rate) return order.price;

      let amount = 0;
      if (typeof order.price === 'string') {
        amount = parseFloat(order.price.replace('¥', ''));
      } else {
        amount = Number(order.price);
      }

      const rate = Number(this.riderUserInfo.rate);
      const rewardAmount = this.getTransferRewardAmount(order);
      const finalAmount = (amount * rate) - rewardAmount;

      return `¥${finalAmount.toFixed(2)}`;
    },

    // 判断是否是转派订单（被转派的骑手看到的订单）
    isTransferredOrder(order) {
      // 检查是否通过转派链接进入，且当前订单是转派的目标订单
      return this.shareParams && 
             this.shareParams.shared_order_id && 
             String(order.id) === String(this.shareParams.shared_order_id);
    },

    // 检查是否需要显示海报弹窗
    checkPosterModal() {
      const today = new Date().toDateString();
      const lastShownDate = uni.getStorageSync('riderPosterModalLastShown');

      // 如果今天还没有显示过海报弹窗，则显示
      if (lastShownDate !== today) {
        // 延迟1秒显示，确保页面加载完成
        setTimeout(() => {
          this.showPosterModal = true;
          // 记录今天已显示过海报弹窗
          uni.setStorageSync('riderPosterModalLastShown', today);
        }, 1000);
      }
    },

    // 检查自动撤销的任务
    async checkAutoCanceledTasks() {
      try {
        const riderUserInfo = uni.getStorageSync('riderUserInfo');
        if (!riderUserInfo || !riderUserInfo.id) {
          return;
        }

        // 为了方便调试，直接显示弹窗，跳过日期检查
        // const today = new Date().toDateString(); // 获取今天的日期字符串
        // const lastShownDate = uni.getStorageSync('cancelModalLastShown');

        // if (lastShownDate === today) {
        //   console.log('今天已经显示过撤销任务弹窗，跳过');
        //   return;
        // }

        // 获取当前时间和24小时前的时间
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

        // 格式化时间为 YYYY-MM-DD HH:mm:ss
        const formatDateTime = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

        const timestamp = Math.floor(Date.now() / 1000);

        const params = {
          start_date: formatDateTime(startDate),
          end_date: formatDateTime(endDate),
          service_member_id: riderUserInfo.id,
          timestamp: timestamp,
          sign: "chongchong"
        };

        console.log('检查自动撤销任务参数:', params);

        const res = await this.$request('task/list/autocanceled', params, 'POST');

        console.log('自动撤销任务接口响应:', res.data.data);

        // 为了方便调试，无论是否有数据都显示弹窗
        if (res.code === 200) {
          // 如果有真实数据就使用真实数据，否则使用模拟数据
          if (res.data.data && res.data.data.length > 0) {
            this.canceledTasks = res.data.data;
          } else {
            // 模拟撤销任务数据用于调试
            this.canceledTasks = [
              {
                id: 1,
                task: {
                  task_no: 'TEST001',
                  task_detail: {
                    store_name: '测试门店'
                  }
                },
                created_at: new Date().toISOString(),
                cancel_reason: '超时未处理'
              }
            ];
          }

          // 延迟显示，确保页面加载完成且不与海报弹窗冲突
          setTimeout(() => {
            this.showCancelModal = true;
          }, 2000);
        }
      } catch (error) {
        console.error('检查自动撤销任务失败:', error);
        // 即使接口失败也显示模拟数据用于调试
        this.canceledTasks = [
          {
            id: 1,
            task: {
              task_no: 'DEBUG001',
              task_detail: {
                store_name: '调试门店'
              }
            },
            created_at: new Date().toISOString(),
            cancel_reason: '调试模式'
          }
        ];

        setTimeout(() => {
          this.showCancelModal = true;
        }, 2000);
      }
    },

    // 关闭撤销任务弹窗
    async closeCancelModal() {
      // 如果有撤销任务，调用已读接口
      if (this.canceledTasks && this.canceledTasks.length > 0) {
        await this.markCanceledTasksAsRead();
      }

      this.showCancelModal = false;
      this.canceledTasks = [];

      // 调试模式下不记录日期，以便每次都能显示弹窗
      // uni.setStorageSync('cancelModalLastShown', new Date().toDateString());
    },

    // 标记撤销任务为已读
    async markCanceledTasksAsRead() {
      try {
        // 提取所有撤销任务的ID
        const ids = this.canceledTasks.map(task => task.id);
        const timestamp = Math.floor(Date.now() / 1000);
        
        const params = {
          ids: ids,
          service_member_id: this.riderUserInfo.id,
          sign: "chongchong",
          timestamp: timestamp
        };

        console.log('标记撤销任务已读参数:', params);

        const res = await this.$request('task/update/autocanceled', params, 'POST');

        if (res.code === 200) {
          console.log('撤销任务已标记为已读');
        } else {
          console.error('标记撤销任务已读失败:', res.message || res);
        }
      } catch (error) {
        console.error('调用撤销任务已读接口失败:', error);
      }
    },

    // 格式化撤销时间
    formatCancelTime(timeStr) {
      if (!timeStr) return '';
      try {
        const date = new Date(timeStr);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}-${day} ${hours}:${minutes}`;
      } catch (error) {
        return timeStr;
      }
    },

    // 处理海报弹窗关闭
    handlePosterClose() {
      this.showPosterModal = false;
    },

    // 处理海报点击
    handlePosterClick(poster) {
      console.log('点击海报:', poster);
      // 可以在这里处理海报点击事件，比如跳转到指定页面
      if (poster.url) {
        uni.navigateTo({
          url: poster.url
        });
      }
      this.showPosterModal = false;
    },

    // 处理悬浮小图点击
    handleFloatingImageClick() {
      console.log('点击悬浮小图');
      // 跳转到骑手端我的页面并自动打开分享推荐弹窗
      uni.navigateTo({
        url: '/riderEnd/my',
        success: () => {
          // 延迟一下确保页面加载完成，然后触发分享推荐弹窗
          setTimeout(() => {
            // 通过事件总线通知我的页面打开分享推荐弹窗
            uni.$emit('openRiderShareModal');
          }, 300);
        },
        fail: (err) => {
          console.error('跳转到骑手我的页面失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },

    // 跳转到推荐骑手（骑手端推荐分享管理弹窗）
    goToRiderRecommend() {
      uni.navigateTo({
        url: '/riderEnd/my',
        success: () => {
          // 延迟一下确保页面加载完成，然后触发推荐分享管理弹窗
          setTimeout(() => {
            // 通过事件总线通知骑手端我的页面打开推荐分享管理弹窗
            uni.$emit('openRiderShareModal');
          }, 300);
        },
        fail: (err) => {
          console.error('跳转到骑手端我的页面失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },

    // 跳转到推荐用户（用户端分享推荐弹窗）
    goToUserRecommend() {
      uni.switchTab({
        url: '/pages/my/my',
        success: () => {
          // 延迟一下确保页面加载完成，然后触发分享推荐弹窗
          setTimeout(() => {
            // 通过事件总线通知用户端我的页面打开分享推荐弹窗
            uni.$emit('openShareModal');
          }, 300);
        },
        fail: (err) => {
          console.error('跳转到用户端我的页面失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },

    // 异步生成分享描述（在onShareAppMessage中调用）
    async generateShareDescSync() {
      return new Promise(async (resolve, reject) => {
		  try {
			// 调用指定接口获取订单数据
			const params = {
			  service_member_id: 3,
			  sign: "chongchong",
			  status: ["waiting"],
			  page: 1,
			  per_page: 30
			};

			// 使用async/await方式调用接口
			const res = await this.requestShareData(params);

			if (res.code === 200 && res.data && res.data.length > 0) {
			  this.shareDesc = this.processOrderDataForShare(res.data);
			  // 保存订单数据用于生成标题
			  this.shareOrderData = res.data;
			  // 保存count_data用于订单数量计算
			  this.shareCountData = res.count_data || {};
			} else {
			  this.shareDesc = '快来加入充充跑腿，成为骑手，轻松接单赚钱！';
			  this.shareOrderData = [];
			  this.shareCountData = {};
			}

			// 生成分享图片
			const uploadedUrl = await this.generateShareImage();
            resolve(uploadedUrl);
		  } catch (error) {
			console.error('获取分享数据失败:', error);
			this.shareDesc = '快来加入充充跑腿，成为骑手，轻松接单赚钱！';
		  }
        });
    },

    // 封装请求方法，返回Promise
    requestShareData(params) {
      return new Promise((resolve, reject) => {
        uni.request({
          url: 'https://ccpt.0871.cn/api/service/task/list',
          method: 'POST',
          data: params,
          header: {
            'Content-Type': 'application/json'
          },
          success: (res) => {
            if (res.statusCode === 200) {
              resolve(res.data);
            } else {
              reject(new Error(`请求失败，状态码: ${res.statusCode}`));
            }
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    },

    // 生成分享图片
    async generateShareImage() {
      return new Promise(async (resolve, reject) => {
        try {
        const ctx = uni.createCanvasContext('shareCanvas', this);
        const canvasWidth = 400;
        const canvasHeight = 300;

        // 设置高级渐变背景
        const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        gradient.addColorStop(0, '#2392F2');
        // gradient.addColorStop(0.3, '#764ba2');
        // gradient.addColorStop(0.7, '#f093fb');
        // gradient.addColorStop(1, '#f5576c');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 添加装饰性几何图形
        ctx.save();

        // 左上角装饰圆
        ctx.beginPath();
        ctx.arc(-50, -50, 120, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();

        // 右下角装饰圆
        ctx.beginPath();
        ctx.arc(canvasWidth + 30, canvasHeight + 30, 100, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fill();

        // 中间装饰圆环
        ctx.beginPath();
        ctx.arc(canvasWidth - 80, 80, 60, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 添加微妙的网格纹理
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvasWidth; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvasHeight);
          ctx.stroke();
        }
        for (let i = 0; i < canvasHeight; i += 40) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(canvasWidth, i);
          ctx.stroke();
        }

        ctx.restore();

        // 设置标题样式
        ctx.save();

        // 添加标题背景
        ctx.fillStyle = '#FF8000';
        ctx.fillRect(20, 15, canvasWidth - 40, 40);

        // 设置标题文字
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // 生成标题：月日+"全国实时新订单："+ count_data.waiting_count*3
        const now = new Date();
        const month = (now.getMonth() + 1).toString();
        const day = now.getDate().toString().padStart(2, '0');
        const orderCount = this.shareCountData && this.shareCountData.waiting_count ? this.shareCountData.waiting_count * 2 : 0;
        const title = `全国实时（${month}.${day}）新订单：${orderCount}单`;

        // 检查标题长度，如果太长则分行显示
        const titleWidth = ctx.measureText(title).width;
        if (titleWidth > canvasWidth - 40) {
          // 分成两行显示
          const line1 = `全国实时（${month}.${day}）`;
          const line2 = `新订单：${orderCount}单`;
          ctx.fillText(line1, canvasWidth / 2, 28);
          ctx.fillText(line2, canvasWidth / 2, 48);
        } else {
          // 单行显示
          ctx.fillText(title, canvasWidth / 2, 38);
        }

        ctx.restore();

        // 绘制分享描述内容
        if (this.shareDesc && this.shareDesc !== '快来加入充充跑腿，成为骑手，轻松接单赚钱！') {
          const lines = this.shareDesc.split('\n');

          // 添加内容背景
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(15, 70, canvasWidth - 30, Math.min(lines.length, 8) * 24 + 20);

          // 设置文字样式
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 18px sans-serif';
          ctx.textAlign = 'left';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;

          let startY = 94;
          lines.forEach((line, index) => {
            if (line.trim() && index < 8) { // 最多显示8行
              ctx.fillText(line, canvasWidth / 7, startY + (index * 24));
            }
          });

          ctx.restore();
        } else {
          // 默认描述
          ctx.save();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 20px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          ctx.fillText('快来加入充充跑腿', canvasWidth / 2, 130);
          ctx.fillText('成为骑手，轻松接单赚钱！', canvasWidth / 2, 160);
          ctx.restore();
        }

        // 添加底部信息
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#E3F2FD';
        // ctx.fillText('点击小程序接单', canvasWidth / 2, canvasHeight - 30);
		

        // 绘制完成后导出图片
        await ctx.draw(false, () => {
          setTimeout(() => {
            uni.canvasToTempFilePath({
              canvasId: 'shareCanvas',
              success: async (res) => {
                console.log('分享图片生成成功:', res.tempFilePath);
                // 上传图片到服务器
                const uploadedUrl = await this.uploadFile(res.tempFilePath);
                resolve(uploadedUrl);
              },
              fail: (err) => {
                console.error('生成分享图片失败:', err);
                this.shareImageUrl = 'https://ccpt.qiniu.0871.cn/qs-bn.png';
                resolve(this.shareImageUrl);
              }
            }, this);
          }, 500);
        });
        } catch (error) {
          console.error('生成分享图片异常:', error);
          this.shareImageUrl = 'https://ccpt.qiniu.0871.cn/qs-bn.png';
          resolve(this.shareImageUrl);
        }
      });
    },
	
	// 开始上传
	async uploadFile(tempFilePaths) {
		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: 'https://tixian.0871.cn/upload/qiniuImageUpload', // 服务器上传接口地址
				filePath: tempFilePaths,
				name: 'image', // 必须填写，后台用来接收文件
				formData: {
					'spaceName': 'chongchongpaotui' // 其他要上传的参数
				},
				success: (uploadFileRes) => {
					try {
						const res = JSON.parse(uploadFileRes.data);
						if (res.path) {
							this.shareImageUrl = res.path;
							console.log('分享图片上传成功:', res.path);
							resolve(res.path);
						} else {
							console.error('上传响应中没有path字段:', res);
							this.shareImageUrl = 'https://ccpt.qiniu.0871.cn/qs-bn.png';
							resolve('https://ccpt.qiniu.0871.cn/qs-bn.png');
						}
					} catch (error) {
						console.error('解析上传响应失败:', error);
						this.shareImageUrl = 'https://ccpt.qiniu.0871.cn/qs-bn.png';
						resolve('https://ccpt.qiniu.0871.cn/qs-bn.png');
					}
				},
				fail: (uploadFileErr) => {
					console.error('图片上传失败', uploadFileErr);
					this.shareImageUrl = 'https://ccpt.qiniu.0871.cn/qs-bn.png';
					resolve('https://ccpt.qiniu.0871.cn/qs-bn.png');
				}
			});
		});
	},

    // 启动倒计时定时器
    startCountdownTimer() {
      // 先清除现有定时器
      this.clearCountdownTimer();

      // 立即更新一次倒计时
      this.updateCountdown();

      // 每秒更新倒计时
      this.countdownTimer = setInterval(() => {
        this.updateCountdown();
      }, 1000);
    },

    // 清除倒计时定时器
    clearCountdownTimer() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
    },

    // 更新倒计时显示
    updateCountdown() {
      if (!this.currentOrderInfo) return;

      const countdownResult = this.calculateTransferCountdown(this.currentOrderInfo);
      this.countdownText = countdownResult.countdownText;
      this.showTransferCondition = !countdownResult.canTransfer;
      this.canTransfer = countdownResult.canTransfer; // 更新转单按钮状态

      // 如果已经可以转单了，清除定时器
      if (countdownResult.canTransfer) {
        this.clearCountdownTimer();
      }
    },

    // 计算转单倒计时
    calculateTransferCountdown(order) {
      if (!order || !order.orderTime) {
        return {
          canTransfer: true,
          countdownText: '派出且成功完单'
        };
      }

      try {
        // 解析订单发布时间，支持多种时间格式
        let publishTime;
        if (typeof order.orderTime === 'string') {
          // 处理可能的时间格式
          publishTime = new Date(order.orderTime.replace(/-/g, '/'));
        } else {
          publishTime = new Date(order.orderTime);
        }

        // 检查时间是否有效
        if (isNaN(publishTime.getTime())) {
          console.warn('订单时间格式无效:', order.orderTime);
          return {
            canTransfer: true,
            countdownText: '派出且成功完单'
          };
        }

        const currentTime = new Date();
        const timeDiff = currentTime - publishTime;

        // 3小时 = 3 * 60 * 60 * 1000 毫秒
        const threeHours = 3 * 60 * 60 * 1000;

        if (timeDiff >= threeHours) {
          // 超过3小时，可以转单
          return {
            canTransfer: true,
            countdownText: '派出且成功完单'
          };
        } else if (timeDiff < 0) {
          // 如果订单时间是未来时间，显示可以转单
          return {
            canTransfer: true,
            countdownText: '派出且成功完单'
          };
        } else {
          // 未满3小时，显示倒计时
          const remainingTime = threeHours - timeDiff;
          const hours = Math.floor(remainingTime / (60 * 60 * 1000));
          const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
          const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

          // 确保时间不会是负数
          if (hours < 0 || minutes < 0 || seconds < 0) {
            return {
              canTransfer: true,
              countdownText: '派出且成功完单'
            };
          }

          return {
            canTransfer: false,
            countdownText: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}后订单可转派`
          };
        }
      } catch (error) {
        console.error('计算倒计时时发生错误:', error);
        return {
          canTransfer: true,
          countdownText: '派出且成功完单'
        };
      }
    },

    // 格式化附加服务
    formatExtraServices(taskDetail) {
      if (!taskDetail) return '';

      const extraServices = [];

      // 遍历 extra_task_1 到 extra_task_6
      for (let i = 1; i <= 6; i++) {
        const taskKey = `extra_task_${i}`;
        const taskNumberKey = `extra_task_${i}_item_number`;

        if (taskDetail[taskKey]) {
          const itemNumber = taskDetail[taskNumberKey] || 1;
          extraServices.push(`${taskDetail[taskKey]}x${itemNumber}`);
        }
      }

      return extraServices.join('、');
    },

    // 计算倒计时
    calculateCountdown(deadline, startDate) {
      if (!deadline) return '未知时间';

      try {
        const now = new Date();
        const deadlineDate = new Date(deadline);

        // 根据订单时长决定提前时间
        let advanceHours = 6; // 默认提前6小时
        if (startDate) {
          const startDateTime = new Date(startDate);
          const durationHours = (deadlineDate - startDateTime) / (1000 * 60 * 60);

          if (durationHours >= 48) {
            advanceHours = 12; // 48小时以上提前12小时
          } else if (durationHours >= 24) {
            advanceHours = 6;  // 24小时单提前6小时
          }
        }

        // 计算实际截止时间（提前N小时）
        const actualDeadline = new Date(deadlineDate.getTime() - advanceHours * 60 * 60 * 1000);
        const timeDiff = actualDeadline - now;

        if (timeDiff <= 0) {
          return '已超时';
        }

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
          return `${hours}小时${minutes}分钟`;
        } else {
          return `${minutes}分钟`;
        }
      } catch (error) {
        console.error('计算倒计时失败:', error);
        return '未知时间';
      }
    },

    // 计算任务用时
    calculateTaskDuration(startDate, finishedAt) {
      if (!startDate || !finishedAt) return '未知';

      try {
        const start = new Date(startDate);
        const finish = new Date(finishedAt);
        const duration = finish - start;

        if (duration < 0) return '未知';

        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
          return `${hours}小时${minutes}分钟`;
        } else {
          return `${minutes}分钟`;
        }
      } catch (error) {
        console.error('计算任务用时失败:', error);
        return '未知';
      }
    },

    // 处理订单数据生成分享描述
    processOrderDataForShare(orderData) {
      try {
        // 按地区和品牌统计订单数量
        const areaStats = {};

        orderData.forEach(order => {
          // 构建地区名称（只保留地级市和区县，去掉省份）
          let areaName = '';

          // 构建地区地址（不包含省份）
          const areaAddress = [
            order.city_name,
            order.district_name
          ].filter(Boolean).join('');

          // 提取地级市和区县
          if (areaAddress) {
            // 如果有区县，显示"地级市·区县"
            if (order.city_name && order.district_name) {
              areaName = `${order.city_name}·${order.district_name}`;
            } else if (order.city_name) {
              // 只有地级市
              areaName = order.city_name;
            } else if (order.district_name) {
              // 只有区县
              areaName = order.district_name;
            }
          }

          // 最终兜底
          if (!areaName) {
            areaName = '未知地区';
          }

          // 限制地区名称长度，过长的用...表示
          if (areaName.length > 8) {
            areaName = areaName.substring(0, 6) + '...';
          }

          // 获取品牌信息
          const brandMap = {
            'meituan': '美团',
            'guaishou': '怪兽',
            'jiedian': '街电',
            'xiaodian': '小电',
            'zhumang': '竹芒'
          };
          const brandName = brandMap[order.brand] || '充充';

          // 创建统计键：地区
          const statsKey = `${areaName}`;

          // 初始化地区统计
          if (!areaStats[statsKey]) {
            areaStats[statsKey] = {
              meituan: {},
              guaishou: {},
              xiaodian: {},
              jiedian: {},
              zhumang: {},
              other: {}
            };
          }

          // 获取项目名称
          const taskName = order.task_name || '未知';

          // 按品牌和项目分类统计
          if (order.brand === 'meituan') {
            if (!areaStats[statsKey].meituan[taskName]) {
              areaStats[statsKey].meituan[taskName] = 0;
            }
            areaStats[statsKey].meituan[taskName]++;
          } else if (order.brand === 'guaishou') {
            if (!areaStats[statsKey].guaishou[taskName]) {
              areaStats[statsKey].guaishou[taskName] = 0;
            }
            areaStats[statsKey].guaishou[taskName]++;
          } else if (order.brand === 'xiaodian') {
            if (!areaStats[statsKey].xiaodian[taskName]) {
              areaStats[statsKey].xiaodian[taskName] = 0;
            }
            areaStats[statsKey].xiaodian[taskName]++;
          } else if (order.brand === 'jiedian') {
            if (!areaStats[statsKey].jiedian[taskName]) {
              areaStats[statsKey].jiedian[taskName] = 0;
            }
            areaStats[statsKey].jiedian[taskName]++;
          } else if (order.brand === 'zhumang') {
            if (!areaStats[statsKey].zhumang[taskName]) {
              areaStats[statsKey].zhumang[taskName] = 0;
            }
            areaStats[statsKey].zhumang[taskName]++;
          } else {
            if (!areaStats[statsKey].other[taskName]) {
              areaStats[statsKey].other[taskName] = 0;
            }
            areaStats[statsKey].other[taskName]++;
          }
        });

        // 生成描述文本
        const areaList = Object.keys(areaStats);

        if (areaList.length === 0) {
          return '快来加入充充跑腿，成为骑手，轻松接单赚钱！';
        }

        // 按总订单数量排序，数量多的在前
        areaList.sort((a, b) => {
          const getTotalCount = (stats) => {
            let total = 0;
            Object.keys(stats).forEach(brand => {
              Object.values(stats[brand]).forEach(count => {
                total += count;
              });
            });
            return total;
          };

          const totalA = getTotalCount(areaStats[a]);
          const totalB = getTotalCount(areaStats[b]);
          return totalB - totalA;
        });

        // 生成描述，格式：序号、地区：美团X单 项目名、怪兽X单 项目名
        const descLines = areaList.map((area, index) => {
          const stats = areaStats[area];
          const parts = [];

          // 处理美团订单
          if (Object.keys(stats.meituan).length > 0) {
            Object.entries(stats.meituan).forEach(([taskName, count]) => {
              parts.push(`美团${count * 1}单 ${taskName}`);
            });
          }

          // 处理怪兽订单
          if (Object.keys(stats.guaishou).length > 0) {
            Object.entries(stats.guaishou).forEach(([taskName, count]) => {
              parts.push(`怪兽${count * 1}单 ${taskName}`);
            });
          }

          // 处理小电订单
          if (Object.keys(stats.xiaodian).length > 0) {
            Object.entries(stats.xiaodian).forEach(([taskName, count]) => {
              parts.push(`小电${count * 1}单 ${taskName}`);
            });
          }

          // 处理街电订单
          if (Object.keys(stats.jiedian).length > 0) {
            Object.entries(stats.jiedian).forEach(([taskName, count]) => {
              parts.push(`街电${count * 1}单 ${taskName}`);
            });
          }

          // 处理竹芒订单
          if (Object.keys(stats.zhumang).length > 0) {
            Object.entries(stats.zhumang).forEach(([taskName, count]) => {
              parts.push(`竹芒${count * 1}单 ${taskName}`);
            });
          }

          // 处理其他订单
          if (Object.keys(stats.other).length > 0) {
            Object.entries(stats.other).forEach(([taskName, count]) => {
              parts.push(`其他${count * 1}单 ${taskName}`);
            });
          }

          // 添加序列号，每个品牌项目换行显示
          return `${index + 1}、${area}：${parts.join('\n')}`;
        });

        // 最多显示前8个地区，避免描述过长
        const maxAreas = 8;
        const displayLines = descLines.slice(0, maxAreas);

        // 如果有更多地区，添加省略提示
        if (descLines.length > maxAreas) {
          displayLines.push('...');
        }

        return displayLines.join('\n');
      } catch (error) {
        console.error('处理分享数据失败:', error);
        return '快来加入充充跑腿，成为骑手，轻松接单赚钱！';
      }
    }
  }
}
</script>

<style lang="scss" scoped>
	.pos-zhuanpai{
		font-size: 13px;
		position: absolute;
		background: #fff;
		color: #FC5A35;
		width: 300rpx;
		height: 50rpx;
		line-height: 50rpx;
		    left: 70px;
		    top: 6px;
			border-radius: 4px;
			text-align: center;
	}
	.button-class{
		width:160rpx;
		height:52rpx;
	}
.order-hall {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: calc(100rpx + constant(safe-area-inset-bottom));
  /* iOS < 11.2 */
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
  /* iOS >= 11.2 */
  box-sizing: border-box;
  position: relative;
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
}

.nav-bar {
  height: 88rpx;
  background-color: #2492F2;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  padding-top: 44rpx; /* 适配状态栏 */

  .title {
    font-size: 34rpx;
    font-weight: 500;
  }

  .right-icons {
    display: flex;
    align-items: center;

    .icon {
      width: 44rpx;
      height: 44rpx;
      margin-left: 30rpx;
    }
  }
}

.city-selector-container {
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1rpx solid #eee;
  padding: 10rpx 0;
}

.city-selector {
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;

  .city-name {
    font-size: 28rpx;
    color: #333;
    margin-right: 10rpx;
  }

  .arrow {
    font-size: 24rpx;
    color: #999;
    transform: scale(0.8);
  }
}

.city-count-badge {
  background-color: #f0f8ff;
  border-radius: 20rpx;
  padding: 4rpx 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;

  .city-count-text {
    font-size: 20rpx;
    color: #2492F2;
    font-weight: 400;
    line-height: 28rpx;
  }
}

.banner {
  padding: 20rpx 20rpx 0rpx 20rpx;
  width: 100%;
  height: 300rpx;
  // padding: 0 20rpx;
  box-sizing: border-box;

  .banner-swiper {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
    overflow: hidden;

    .banner-image {
      width: 100%;
      height: 100%;
      border-radius: 12rpx;
    }
  }

  // 保留原有的image样式作为备用
  image {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
  }
}

.hall-header {
  padding: 20rpx 20rpx;
  display: flex;
  // align-items: center;
  // justify-content: space-between;

  .hall-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }

  .header-right {
    flex: 1;
    display: flex;
    align-items: center;
    margin-left: 20rpx;

    .search-box {
      flex: 1;
      height: 64rpx;
      background-color: #fff;
      border-radius: 32rpx;
      display: flex;
      align-items: center;
      padding: 0 20rpx;

      .search-icon {
        width: 32rpx;
        height: 32rpx;
        margin-right: 10rpx;
      }

      .search-input {
        flex: 1;
        height: 100%;
        font-size: 26rpx;
        color: #333;
      }
    }

    .share-btn {
      width: 64rpx;
      height: 64rpx;
      background-color: #2492F2;
      border-radius: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 16rpx;
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.95);
        opacity: 0.8;
      }

      .share-icon {
        width: 32rpx;
        height: 32rpx;
        filter: brightness(0) invert(1);
      }
    }
  }
}

.filter-tabs {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;

  .tab-item {
    background-color: #fff;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex: 1;
    line-height: 32px;

    text {
      font-size: 28rpx;
      color: #666;
    }

    .arrow-icon {
      width: 24rpx;
      height: 24rpx;
      margin-left: 6rpx;
    }

    .tab-badge {
      position: absolute;
      top: 0rpx;
      right: 0rpx;
      min-width: 32rpx;
      height: 32rpx;
      line-height: 32rpx;
      background-color: #FF4D4F;
      color: #fff;
      font-size: 20rpx;
      font-weight: 500;
      text-align: center;
      border-radius: 16rpx;
      padding: 0 8rpx;
      box-sizing: border-box;
      z-index: 10;
    }

    .active-line {
      display: none;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      background-color: #2492F2;
    }

    &.active {
      line-height: 40px;
      background: #EFF7FF;
      border-radius: 12px 12px 0 0;
      box-shadow: 0 -2rpx 4rpx rgba(0, 0, 0, 0.05);
      text {
        color: #2492F2;
        font-weight: 500;
        font-size: 17px;
      }
    }
  }

  .tab-item-left{
    border-left: 1rpx solid #eee;
    border-radius: 12px 0 0 0;
  }
  .tab-item-right{
    border-right: 1rpx solid #eee;
    border-radius: 0 12px 0 0;
  }
}
.comprehensive {
  .tab-item:nth-child(2) {
    border-radius: 0 0 0 12px;
    box-shadow: 1px 0px 0px rgba(0, 0, 0, 0.05) inset;
  }
  .tab-item:nth-child(4) {
    border-radius: 0 12px 0 0;
  }
}
.assigned {
  .tab-item:nth-child(1) {
    border-radius: 12px 0 12px 0;
    box-shadow: -1px 0px 0px rgba(0, 0, 0, 0.05) inset;
  }
  .tab-item:nth-child(3) {
    border-radius: 0 0 0 12px;
    box-shadow: 1px 0px 0px rgba(0, 0, 0, 0.05) inset;
  }
}
.finished {
  .tab-item:nth-child(1) {
    border-radius: 12px 0 0 0;
  }
  .tab-item:nth-child(2) {
    border-radius: 0 0 12px 0;
    box-shadow: -1px 0px 0px rgba(0, 0, 0, 0.05) inset;
  }
  .tab-item:nth-child(4) {
    border-radius: 0 12px 0 12px;
    box-shadow: 1px 0px 0px rgba(0, 0, 0, 0.05) inset;
  }
}
.completed {
  .tab-item:nth-child(1) {
    border-radius: 12px 0 0 0;
  }
  .tab-item:nth-child(3) {
    border-radius: 0 0 12px 0;
    box-shadow: -1px 0px 0px rgba(0, 0, 0, 0.05) inset;
  }
}

.orderbox{
  margin: 0 10px;
  // background: #EFF7FF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.order-list {
  margin-top: -8px;
  padding-top: 24px;
  box-sizing: border-box;
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  /* iOS < 11.2 */
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  /* iOS >= 11.2 */
  width: 100%;
  box-sizing: border-box;
  background: #EFF7FF;
  border-radius: 12px;


  // 推广条样式
  .promotion-bar {
    width: 730rpx;
    height: 58rpx;
    padding: 10rpx 10rpx;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
  }

  .promotion-image {
    width: 100%;
    height: 100%;
    display: block;
  }

  .order-item {
    border: 1rpx solid #8AC6F8;
    background-color: #fff;
    margin: 0px 20rpx;
    margin-bottom: 20rpx;
    border-radius: 12rpx;
    padding: 20rpx;
    width: calc(100% - 40rpx);
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;

    // 第一个订单项的特殊样式
    &:first-child {
      // margin: 0rpx 10rpx 10rpx 10rpx;
      margin-bottom: 20rpx;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10rpx;

      .order-info {
        display: flex;
        align-items: center;

        .order-number {
          font-size: 26rpx;
          color: #666;
        }

        .copy-btn {
          font-size: 22rpx;
          color: #fff;
          background-color: rgba(36, 146, 242, 0.6);
          padding: 4rpx 16rpx;
          border-radius: 4rpx;
          margin-left: 10rpx;
        }
      }

      .order-price {
        font-size: 32rpx;
        color: #F6552D;
        font-weight: 500;
      }
    }

    // 广告横幅样式
    .ad-banner {
      position: relative;
      width: 100%;
      height: 47rpx;
      margin-bottom: 20rpx;
      border-radius: 12rpx;
      overflow: hidden;
	  background: #E6F1FA;
      // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      // box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.3);

      .ad-content {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        height: 100%;
        padding-left: 20rpx;
        z-index: 2;

        .ad-icon {
          margin-right: 12rpx;

          .ad-emoji {
            font-size: 28rpx;
            animation: pulse 2s infinite;
          }
        }

                  .ad-text {
            display: flex;
            align-items: center;
            flex-wrap: nowrap;
            justify-content: flex-start;
            white-space: nowrap;

            .ad-main-text {
            font-size: 22rpx;
            color: #2492F2;
            font-weight: 400;
            text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
          }

          .ad-promotion-text {
            font-size: 28rpx;
            color: #2492F2;
            font-weight: 400;
            text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
          }

          .ad-brand-text {
            font-size: 28rpx;
            color: #FF9A1A;
            font-weight: 700;
            margin: 0 6rpx;
            text-shadow: 0 2rpx 6rpx rgba(255, 215, 0, 0.4);
            animation: glow 2s ease-in-out infinite alternate;
          }

          .ad-sub-text {
            font-size: 26rpx;
            color: #2492F2;
            font-weight: 400;
            text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
          }
        }

        .ad-decoration {
          position: absolute;
          right: 15rpx;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 40rpx;
          justify-content: space-between;

          .ad-sparkle {
            font-size: 18rpx;
            color: #FFD700;
            animation: sparkle 1.5s infinite;
            line-height: 1;

            &.ad-sparkle-delay {
              animation-delay: 0.75s;
              margin-left: 0;
            }
          }
        }
      }

      .ad-gradient-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg,
          rgba(255, 255, 255, 0.1) 0%,
          transparent 50%,
          rgba(255, 255, 255, 0.1) 100%);
        animation: shimmer 3s infinite;
        z-index: 1;
      }

      // 悬停效果
      &:active {
        transform: scale(0.98);
        transition: transform 0.1s ease;
      }
    }
    
    // 打赏信息横幅样式
    .reward-banner {
      position: relative;
      width: 90%;
      height: 47rpx;
      margin-bottom: 20rpx;
      border-radius: 12rpx;
      background: #E6F1FA;

      .reward-banner-content {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        padding: 0 20rpx;
        z-index: 2;

        .reward-banner-text {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          white-space: nowrap;

          .reward-promotion-text {
            font-size: 24rpx;
            color: #2492F2;
            font-weight: 400;
            margin-right: 5rpx;
          }

          .reward-main-text {
            font-size: 22rpx;
            color: #2492F2;
            font-weight: 400;
          }

          .reward-brand-text {
            font-size: 22rpx;
            color: #FF6B00;
            font-weight: 600;
            margin: 0 4rpx;
          }

          .reward-sub-text {
            font-size: 22rpx;
            color: #2492F2;
            font-weight: 400;
          }
        }
      }
    }

        .reward-badge {
			    right: 10px;
			    top: -5px;
			position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4rpx;

          .reward-badge-image {
               width: 66rpx;
               height: 96rpx;
          }

          .reward-badge-amount {
            font-size: 28rpx;
            color: #FF6B00;
            font-weight: 700;
			position: absolute;
			left: 57%;
			bottom: 15%;
			transform: translateX(-50%);
          }
        }

    .order-time {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 20rpx;
      padding-bottom: 10rpx;
      border-bottom: 1rpx solid #eee;
    }
    
    // 订单金额+打赏金额样式
    .order-total-amount {
      right: -10px;
      top: 9px;
      position: absolute;
      width: 241rpx;
      text-align: right;
      
      .total-amount-text {
        font-size: 18rpx;
        background: rgba(255, 246, 245, 1);
        color: rgba(255, 87, 51, 1);
      }
    }

    .order-content {
      display: flex;
      align-items: flex-start;
      width: 100%;
      box-sizing: border-box;
      position: relative;
      // padding-bottom: 20rpx;

      .order-icon {
        width: 100rpx;
        height: 110rpx;
        border-radius: 10rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;
        flex-shrink: 0;

        .icon-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;

          .brand-text {
            font-size: 50rpx;
            color: #fff;
            font-weight: bold;
            // margin-bottom: 16rpx;
            line-height: 1;
          }

          .service-text {
            font-size: 18rpx;
			padding-top: 18rpx;
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

        &.repair {
          background-color: #2492F2;
        }

        &.supplement {
          background-color: #2492F2;
        }

        &.offline-abnormal {
          background-color: #2492F2;
        }

        &.income-abnormal {
          background-color: #2492F2;
        }

        &.other-abnormal {
          background-color: #2492F2;
        }

        // 品牌颜色样式
        &.brand-meituan {
          background-image: url('https://ccpt.qiniu.0871.cn/riderend/meituan-b.png') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-color: transparent !important;

          .brand-text, .service-text {
            color: #000000 !important;
          }
        }

        &.brand-guaishou {
          background-image: url('https://ccpt.qiniu.0871.cn/riderend/guaishou-b.png') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-color: transparent !important;

          .brand-text{
            color: #fff !important;
          }

          .service-text {
            color: rgba(0, 0, 0, 1) !important;
          }
        }

        &.brand-jiedian {
          background-image: url('https://ccpt.qiniu.0871.cn/riderend/zhumang-b2.png') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-color: transparent !important;

          .brand-text{
            color: #fff !important;
		  }
		  .service-text {
            color: #333 !important;
          }
        }

        &.brand-xiaodian {
          background-image: url('https://ccpt.qiniu.0871.cn/riderend/xiaodian-b.png') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-color: transparent !important;

          .brand-text{
            color: #FFFFFF !important;
          }
		  .service-text {
            color: #333 !important;
          }
        }

        &.brand-zhumang {
          background-image: url('https://ccpt.qiniu.0871.cn/riderend/zhumang-b2.png') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-color: transparent !important;

          .brand-text, .service-text {
            color: #FFFFFF !important;
          }
        }

        &.brand-default {
          background-color: #2492F2 !important;

          .brand-text, .service-text {
            color: #FFFFFF !important;
          }
        }
      }

      .order-details {
        flex: 1;
        min-width: 0;
        max-width: calc(100% - 323rpx);
        padding-right: 10rpx;

        .address {
          font-size: 25rpx;
          color: #333;
          font-weight: 600;
          margin-bottom: 10rpx;
          word-break: break-all;
          max-width: 100%;
          overflow: hidden;
          line-height: 1.5;
          min-height: 40rpx;
          max-height: 75rpx;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .service-time, .service-item {
          font-size: 22rpx;
          color: #666;
          word-break: break-all;

          &::after {
            content: attr(data-content);
            color: #EB5E2A;
            margin-left: 10rpx;
          }
        }

        .service-item {
          &::after {
            color: #F04141;
          }
        }

        .distance-info {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          width: fit-content;
          background-color: #E6F1FA;
          padding: 4rpx 10rpx;
          border-radius: 6rpx;
          margin-bottom: 6rpx;

          .location-icon {
            width: 24rpx;
            height: 24rpx;
          }

          text {
            font-size: 18rpx;
            color: #2492F2;
          }
        }
      }



      // 价格信息容器
      .price-info-wrapper {
        position: absolute;
        right: 10rpx;
        top: 40rpx;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4rpx;
        z-index: 10;
        justify-content: flex-start;
        padding-bottom: 10rpx;
      }

      .service-time {
        font-size: 26rpx;
        color: #666;
        word-break: break-all;
        text-align: right;
        line-height: 1.2;

        &::after {
          content: attr(data-content);
          color: #EB5E2A;
          margin-left: 10rpx;
        }
      }

      .order-action-buttons {
        position: absolute;
        right: 0;
        bottom: 10rpx;
        display: flex;
        height: 50rpx;
        border-radius: 25rpx;
        overflow: hidden;
        box-shadow: 0 2rpx 8rpx rgba(255, 107, 0, 0.3);
        z-index: 5;
      }

      .take-order-btn {
        width: 120rpx;
        height: 50rpx;
        line-height: 50rpx;
        background-color: #ff6b00;
        color: #fff;
        font-size: 24rpx;
        font-weight: 500;
        border-radius: 25rpx 0 0 25rpx;
        text-align: center;
        padding: 0;
        border: none;
        margin: 0;
        position: relative;
        
        // 当只有单个按钮时的样式
        &.single-btn {
          width: 200rpx;
          border-radius: 25rpx;
        }
      }

      .transfer-order-btn {
        width: 80rpx;
        height: 50rpx;
        line-height: 50rpx;
        background-color: #fff;
        color: #ff6b00;
        font-size: 24rpx;
        font-weight: 500;
        border-radius: 0 25rpx 25rpx 0;
        text-align: center;
        padding: 0;
        border: 2rpx solid #ff6b00;
        border-left: none;
        margin: 0;
        margin-left: -2rpx;
        box-sizing: border-box;
      }

      .completed-label {
        position: absolute;
        right: 0;
        bottom: 5rpx;
        width: 120rpx;
        height: 50rpx;
        line-height: 50rpx;
        background-color: #ccc;
        color: #666;
        font-size: 24rpx;
        border-radius: 25rpx;
        text-align: center;
      }

      .assigned-label {
        position: absolute;
        right: 0;
        bottom: 5rpx;
        min-width: 120rpx;
        max-width: 280rpx;
        min-height: 50rpx;
        line-height: 25rpx;
        background-color: #5B93E1;
        color: #ffffff;
        font-size: 22rpx;
        border-radius: 10rpx;
        text-align: center;
        padding: 5rpx 10rpx;
        box-sizing: border-box;
        white-space: normal;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .refund-label {
        position: absolute;
        right: 0;
        bottom: 5rpx;
        min-width: 120rpx;
        max-width: 160rpx;
        height: 50rpx;
        line-height: 50rpx;
        background-color: #ff9500;
        color: #fff;
        font-size: 22rpx;
        border-radius: 25rpx;
        text-align: center;
        padding: 0 10rpx;
        box-sizing: border-box;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .order-footer {
      display: none;
    }

    // 完结订单样式
    &.completed-order {
      opacity: 0.6;
      position: relative;
      overflow: hidden;

      .order-header,
      .order-time,
      .order-content {
        position: relative;
        z-index: 1;
      }
    }

    // 进行中订单样式
    &.assigned-order {
      opacity: 0.7;
      position: relative;
      overflow: hidden;

      .order-header,
      .order-time,
      .order-content {
        position: relative;
        z-index: 1;
      }
    }
  }

  // 标准订单列表样式（与order.vue保持一致）
  .order-item-standard {
    margin: 0px 20rpx;
    margin-bottom: 16px;
    border-radius: 12rpx;
    padding: 20rpx;
    width: calc(100% - 40rpx);
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;
    border: 1rpx solid #8AC6F8;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    background-color: #fff;
    cursor: pointer;
    position: relative;

    .status-tag {
      position: absolute;
      top: 20rpx;
      right: 20rpx;
      padding: 6rpx 16rpx;
      border-radius: 6rpx;
      font-size: 22rpx;
      font-weight: 500;
      z-index: 1;

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
      flex-direction: column;
      padding-bottom: 15rpx;
      border-bottom: 1rpx solid #f5f5f5;
      margin-bottom: 15rpx;

      .order-info {
        display: flex;
        align-items: center;
        margin-bottom: 10rpx;

        .order-number {
          font-size: 26rpx;
          color: #666;
        }

        .copy-btn {
          font-size: 22rpx;
          color: #fff;
          background-color: rgba(36, 146, 242, 0.6);
          padding: 4rpx 16rpx;
          border-radius: 4rpx;
          margin-left: 10rpx;
        }
      }

      .order-time-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .order-time {
          font-size: 24rpx;
          color: #999;
        }

        .countdown {
          font-size: 24rpx;
          color: #FF6B00;
          background-color: rgba(255, 107, 0, 0.1);
          padding: 4rpx 10rpx;
          border-radius: 4rpx;
        }
      }
    }

    .order-content {
      display: flex;
      align-items: stretch;
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid #f5f5f5;
      position: relative;

      .order-icon {
        width: 100rpx;
        height: 110rpx;
        border-radius: 10rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;
        flex-shrink: 0;
        background: #f5f5f5;

        .icon-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;

          .brand-text {
            font-size: 50rpx;
            color: #fff;
            font-weight: bold;
            // margin-bottom: 16rpx;
            line-height: 1;
          }

          .service-text {
            font-size: 18rpx;
			padding-top: 18rpx;
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

        &.no-image {
          background: #2492F2;
        }

        // 新增异常类型样式
        &.offline-abnormal.no-image {
          background: #2492F2;
        }

        &.income-abnormal.no-image {
          background: #2492F2;
        }

        &.other-abnormal.no-image {
          background: #2492F2;
        }

        &.supplement.no-image {
          background: #2492F2;
        }

        &.repair.no-image {
          background: #2492F2;
        }

        // 品牌颜色样式
        &.brand-meituan {
          background-image: url('https://ccpt.qiniu.0871.cn/riderend/meituan-b.png') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-color: transparent !important;

          .brand-text, .service-text {
            color: #000000 !important;
          }
        }

        &.brand-guaishou {
          background-image: url('https://ccpt.qiniu.0871.cn/riderend/guaishou-b.png') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-color: transparent !important;

          .brand-text{
            color: #fff !important;
          }

		  .service-text {
            color: rgba(0, 0, 0, 1) !important;
          }
        }

        &.brand-jiedian {
          background-image: url('https://ccpt.qiniu.0871.cn/riderend/zhumang-b2.png') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-color: transparent !important;

          .brand-text, .service-text {
            color: #FFFFFF !important;
          }
        }

        &.brand-xiaodian {
          background-image: url('https://ccpt.qiniu.0871.cn/riderend/xiaodian-b.png') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-color: transparent !important;

          .brand-text, .service-text {
            color: #FFFFFF !important;
          }
        }

        &.brand-zhumang {
          background-image: url('https://ccpt.qiniu.0871.cn/riderend/zhumang-b2.png') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-color: transparent !important;

          .brand-text, .service-text {
            color: #FFFFFF !important;
          }
        }

        &.brand-default {
          background-color: #2492F2 !important;

          .brand-text, .service-text {
            color: #FFFFFF !important;
          }
        }

        .door-image {
          width: 100rpx;
          height: 110rpx;
          object-fit: cover;
          border-radius: 10rpx;
        }
      }

      .order-details {
        flex: 1;
        padding-right: 30rpx;

        .store-name-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10rpx;

          .store-name {
            font-size: 32rpx;
            color: #333;
            font-weight: 600;
            flex: 1;
          }

          .price-container {
            display: flex;
            align-items: center;
            gap: 8rpx;
          }

          .price {
            font-size: 30rpx;
            color: #FF6B00;
            font-weight: 500;
          }

          .reward-badge {
            background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
            color: #fff;
            font-size: 20rpx;
            padding: 4rpx 10rpx;
            border-radius: 8rpx;
            font-weight: 500;
            white-space: nowrap;
          }
        }

        .service-time, .service-item, .contact-info {
          font-size: 24rpx;
          color: #666;
          margin-bottom: 6rpx;

          .highlight {
            color: #2492F2;
          }
        }
      }

      .arrow-right {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40rpx;
        height: 40rpx;

        .arrow {
          width: 16rpx;
          height: 16rpx;
          border-top: 2rpx solid #ccc;
          border-right: 2rpx solid #ccc;
          transform: rotate(45deg);
        }
      }
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20rpx;

      .distance-info {
        display: flex;
        align-items: center;
        flex: 1;

        .location-icon {
          width: 32rpx;
          height: 32rpx;
          margin-right: 6rpx;
        }

        .distance-text {
          font-size: 24rpx;
          color: #2492F2;

          .highlight {
            color: #2492F2;
          }
        }

        .location-detail {
          color: #2492F2;
          background-color: rgba(36, 146, 242, 0.1);
          font-size: 24rpx;
          margin-left: 10rpx;
          padding: 4rpx 10rpx;
          border-radius: 4rpx;
        }
      }

      .contact-btn {
        height: 50rpx;
        line-height: 50rpx;
        background-color: #fff;
        color: #666;
        font-size: 24rpx;
        border: 1rpx solid #ccc;
        border-radius: 25rpx;
        padding: 0 20rpx;
        margin-left: 20rpx;
      }
    }
  }

  // 完结订单盖章图片样式
  .completed-stamp-image {
	  transform: rotate(60deg);
    position: absolute;
    top: 30rpx;
    right: 80rpx;
    width: 150rpx;
    height: 150rpx;
    z-index: 10;
    pointer-events: none;
    filter: brightness(0) saturate(100%) invert(27%) sepia(99%) saturate(1234%) hue-rotate(201deg) brightness(96%) contrast(95%);
  }

  // recent_tasks 完结订单盖章图片样式（灰色）
  .completed-stamp-image-gray {
	  transform: rotate(60deg);
    position: absolute;
    top: 13rpx;
    right: 166rpx;
    width: 115rpx;
    height: 150rpx;
    z-index: 10;
    pointer-events: none;
    filter: brightness(0) saturate(100%) invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
  }

  // 进行中订单盖章图片样式
  .assigned-stamp-image {
    -webkit-transform: rotate(60deg);
    transform: rotate(60deg);
    position: absolute;
    top: 11rpx;
    right: 166rpx;
    width: 115rpx;
    height: 150rpx;
    z-index: 10;
    pointer-events: none;
    -webkit-filter: brightness(0) saturate(100%) invert(27%) sepia(99%) saturate(1234%) hue-rotate(201deg) brightness(96%) contrast(95%);
    filter: brightness(0) saturate(100%) invert(27%) sepia(99%) saturate(1234%) hue-rotate(201deg) brightness(96%) contrast(95%);
  }
}

.loading-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;

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

.no-more-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;

  text {
    font-size: 24rpx;
    color: #999;
  }
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 40rpx;

  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 10rpx;
  }

  .empty-subtitle {
    font-size: 32rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 50rpx;
  }

  .promotion-tip {
    background-color: #2492F2;
    border-radius: 20rpx;
    padding: 12rpx 24rpx;
    margin-bottom: 30rpx;

    .promotion-text {
      font-size: 26rpx;
      color: #fff;
      font-weight: 500;
    }
  }

  .recommend-item {
    width: 100%;
    background-color: #fff;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    margin-bottom: 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

    .recommend-text {
      flex: 1;
      font-size: 26rpx;
      color: #333;
      line-height: 1.4;
    }

    .recommend-btn {
      font-size: 28rpx;
      color: #ff4d4f;
      font-weight: 600;
      margin-left: 20rpx;
      flex-shrink: 0;
    }

    &:active {
      background-color: #f5f5f5;
    }
  }
}

// 订单详情弹窗样式
.order-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.order-modal-container {
  width: 85%;
  max-width: 600rpx;
  border-radius: 20rpx;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
  // box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
  position: relative;

  .order-modal-close {
    position: absolute;
    right: 20rpx;
    top: 20rpx;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    cursor: pointer;
    z-index: 10;

    &:active {
      background-color: rgba(0, 0, 0, 0.5);
      transform: scale(0.95);
    }
  }
}

.order-modal-header-image {
  height: auto;
  display: block;
  border-radius: 20rpx 20rpx 0 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.order-modal-content {
  background-color: #fff;
  padding: 0 30rpx 0rpx 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.order-modal-info {
	background-color: #e6f1fa;
	padding: 10px;
	border-radius: 8px;

  // 预估完单时间样式
  .completion-time-label {
    font-size: 26rpx;
    color: #333;
    margin-bottom: 20rpx;
    font-weight: 500;

    .time-hint {
      color: #999;
      font-size: 22rpx;
      margin-left: 8rpx;
    }

    .time-hint-red {
      color: #FF4D4F;
      font-size: 22rpx;
      margin-left: 8rpx;
    }
  }

  .time-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
    margin-bottom: 20rpx;

    .time-option {
      background-color: #fff;
      border: 1rpx solid #2492F2;
      border-radius: 20rpx;
      padding: 9rpx 10rpx;
      text-align: center;
      font-size: 24rpx;
      color: #2492F2;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;

      .time-small {
        font-size: 18rpx;
      }

      &:active {
        background-color: #1E7FD8;
        color: #fff;
        transform: scale(0.95);
      }

      &.selected {
        background-color: #1E7FD8;
        color: #fff;
        border-color: #1E7FD8;
      }
    }
  }

  .time-warning {
    font-size: 20rpx;
    color: #FF6B6B;
    background-color: #FFF1F0;
    text-align: center;
    line-height: 1.5;
    width: 85%;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    margin: 0 auto;
  }

  .info-row {
    display: flex;
	justify-content: space-between;
    margin-bottom: 20rpx;
    font-size: 26rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      color: #666;
      width: 140rpx;
      font-weight: 500;
      flex-shrink: 0;
    }

    .info-value {
      color: #333;
      flex: 1;
      font-weight: 500;
      text-align: right;

      &.amount {
        color: #ff4d4f;
        font-weight: 600;
        font-size: 28rpx;
      }

      &.service-time-value {
        color: #EB5E2A;
        font-weight: 500;
      }

      &.service-item-value {
        color: #F04141;
        font-weight: 500;
      }

      &.service-amount {
        color: #ff4d4f;
        font-weight: 600;
        font-size: 28rpx;
      }
    }

    .service-time-modal, .service-item-modal {
      font-size: 26rpx;
      color: #666;
      position: relative;

      &::after {
        content: attr(data-content);
        color: #EB5E2A;
        margin-left: 10rpx;
        font-weight: 500;
      }
    }

    .service-item-modal {
      &::after {
        color: #F04141;
      }
    }

    .distance-info-modal {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      // flex: 1;

      .navigation-btn {
        color: #fff;
        background: linear-gradient(135deg, #2492F2 0%, #1E7FD8 100%);
        font-size: 22rpx;
        font-weight: 500;
        padding: 6rpx 16rpx;
        border-radius: 20rpx;
        cursor: pointer;
        box-shadow: 0 2rpx 8rpx rgba(36, 146, 242, 0.3);
        transition: all 0.3s ease;
        flex-shrink: 0;
        margin-right: 6rpx;

        &:active {
          transform: scale(0.95);
          box-shadow: 0 1rpx 4rpx rgba(36, 146, 242, 0.4);
        }
      }

      .info-value {
        color: #333;
        font-weight: 500;
      }
    }
  }
}

// 转单奖励信息样式
.order-modal-reward {
  background-color: #e6f1fa;
      border: 1rpx solid #e6f1fa;
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 20rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .reward-label {
    font-size: 29rpx;
    color: #333;
    font-weight: 500;
  }

  .reward-amount {
    font-size: 34rpx;
    color: #ff6b35;
    font-weight: 600;
    text-align: center;
  }

  .reward-condition {
	  padding: 6rpx 6rpx;
	  background-color: #ffe6f0;
	  border: 1rpx solid #ffb3d1;
	  border-radius: 8rpx;
	  // margin-left: 10rpx;
	  min-height: auto;
	  height: auto;
	  display: flex;
	  align-items: center;

    .reward-condition-text {
      font-size: 14rpx;
      color: #FF4D4F;
	  background-color: #FFF1F0;
      font-weight: 400;
      line-height: 1.2;
      word-wrap: break-word;
      margin: 0;
      padding: 0;
    }
  }
}

.order-modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
  gap: 16rpx;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
}

.modal-btn {
  padding: 0rpx 32rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 106rpx;
  border: none;
  outline: none;
  background: none;

  &.cancel {
    background-color: #fff;
	border:1px solid #FC5A35;
    color: #FC5A35;
    flex: 1;

    &:active {
      background-color: #e8e8e8;
      transform: scale(0.95);
    }
  }

  &.transfer {
    background: linear-gradient(135deg, #4D90F3 0%, #3B73E3 100%);
    color: #fff;
    flex: 1;

    &:active {
      opacity: 0.9;
      transform: scale(0.95);
    }

    &.disabled {
      background: #ccc;
      color: #666;
      cursor: not-allowed;
      pointer-events: none;

      &:active {
        transform: none;
        opacity: 1;
      }
    }
  }

  &.navigate {
    background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
    color: #fff;
    border: 1rpx solid #52c41a;

    &:active {
      opacity: 0.9;
      transform: scale(0.95);
    }
  }

  &.confirm {
    background: linear-gradient(135deg, #FA8340 0%, #FD503A 100%);
	// background: #F35C43;
    color: #fff;
    // border: 1rpx solid #2492F2;
    flex: 1;

    &:active {
      opacity: 0.9;
      transform: scale(0.95);
    }

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;

      &:active {
        transform: none;
        opacity: 0.6;
      }
    }
  }
}

.order-quota-bar {
  width: 85%;
  max-width: 550rpx;
  background-color: #fff;
  padding: 20rpx 30rpx;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 10px;

  .quota-text {
    font-size: 26rpx;
    color: rgba(97, 97, 97, 1);
    margin-bottom: 10rpx;
  }

  .quota-link {
    font-size: 24rpx;
    color: #616161;
    cursor: pointer;
    transition: opacity 0.3s ease;

    &:active {
      opacity: 0.7;
    }
  }
}

// 广告横幅动画效果
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes glow {
  from {
    text-shadow: 0 2rpx 6rpx rgba(255, 215, 0, 0.4);
  }
  to {
    text-shadow: 0 2rpx 12rpx rgba(255, 215, 0, 0.8), 0 0 20rpx rgba(255, 215, 0, 0.3);
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

// 撤销任务弹窗样式
.cancel-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.cancel-modal-container {
  width: 85%;
  max-width: 600rpx;
  border-radius: 20rpx;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
  background: transparent;
}

.cancel-modal-header {
	position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  margin-bottom: -2rpx;

  .cancel-modal-header-image {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 20rpx 20rpx 0 0;
  }
  .cancel-intro-text {
	  position: absolute;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 20rpx;
    display: block;
    font-weight: 500;
    line-height: 1.4;
	top: 115px;
	    left: 12px;
  }
}

.cancel-modal-content {
  padding: 0px 20rpx 1rpx 20rpx;
  max-height: 500rpx;
  background-color: #fff;
  margin-top: 0;


  .single-task, .multiple-tasks {
    .task-item {
      background-color: #F0F8FF;
      border-radius: 12rpx;
      padding: 24rpx;
      margin-bottom: 15rpx;
      // border-left: 4rpx solid #FF6B35;

      .task-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12rpx;
        min-height: 40rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .task-label {
          font-size: 26rpx;
          color: #666;
          font-weight: 500;
          flex-shrink: 0;
          width: 140rpx;
          line-height: 1.4;
        }

        .task-value {
          font-size: 26rpx;
          color: #333;
          font-weight: 500;
          text-align: right;
          flex: 1;
          line-height: 1.4;
          word-break: break-all;
        }

        .task-reason {
          font-size: 26rpx;
          color: #FF6B35;
          font-weight: 600;
          text-align: right;
          flex: 1;
          line-height: 1.4;
          word-break: break-all;
        }
      }
    }
  }

  .multiple-tasks {
    .task-list {
      max-height: 300rpx;
    }
  }
}

.cancel-modal-footer {
  padding: 20rpx 30rpx 30rpx;
  display: flex;
  justify-content: center;
  background-color: #fff;
  border-radius: 0 0 20rpx 20rpx;

  .modal-btn-new {
    flex: 1;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &.confirm {
      background: linear-gradient(135deg, #FF6B35 0%, #F35C43 100%);
      color: #fff;
      box-shadow: 0 4rpx 12rpx rgba(255, 107, 53, 0.3);

      &:active {
        transform: scale(0.98);
        opacity: 0.9;
        box-shadow: 0 2rpx 8rpx rgba(255, 107, 53, 0.4);
      }
    }
  }
}
</style>
