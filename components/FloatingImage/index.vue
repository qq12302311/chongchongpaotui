<template>
  <view>
    <!-- 悬浮图标 -->
    <view 
      class="floating-image"
      :style="{ right: position.x + 'px', bottom: position.y + 'px' }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- <image :src="imageSrc" mode="aspectFit"></image> -->
      <!-- <image src="https://ccpt.qiniu.0871.cn/gwc-1.png" mode="aspectFit"></image> -->
      <!-- <image @click="goToCart" class="img-3" src="https://ccpt.qiniu.0871.cn/gwc-gwc2.svg" mode="aspectFit"></image> -->
      <view class="img-wrapper" @tap.stop="handleChatClick">
        <image class="img-4" src="https://ccpt.qiniu.0871.cn/duihua2-active.svg" mode="aspectFit"></image>
        <!-- 角标 -->
        <view v-if="showBadge" class="badge">{{ displayUnreadCount }}</view>
      </view>
      <view @tap.stop="handleClick">
        <image class="img-2" src="https://ccpt.qiniu.0871.cn/home/ptyh.svg" mode="aspectFit"></image>
      </view>
	  <view @tap.stop="handleClick">
	    <image class="img-5" src="https://ccpt.qiniu.0871.cn/gwc-gwc2.svg" mode="aspectFit"></image>
	  </view>
    </view>

    <!-- 底部临时消息框 -->
    <view v-if="showMessageBox" class="message-box-wrapper" @click="closeMessageBox">
      <view class="message-box" @click.stop="">
        <!-- 标题栏 -->
        <view class="message-box-header">
          <text class="header-title">{{ chatTitle }}</text>
          <view class="close-icon" @click.stop="closeMessageBox">
            <text>×</text>
          </view>
        </view>
        
        <!-- 聊天消息区域 -->
        <scroll-view 
          class="chat-box" 
          scroll-y 
          :scroll-top="scrollTop"
          :scroll-with-animation="true"
        >
          <!-- 加载提示 -->
          <view v-if="chatLoading" class="loading-container">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载消息中...</text>
          </view>
          
          <!-- 消息列表 -->
          <view v-else>
            <view
              v-for="(msg, index) in messages"
              :key="index"
              class="message"
              :class="msg.type">
              <!-- 系统消息 -->
              <template v-if="msg.type === 'system'">
                <view class="message-content">
                  <text>{{ msg.message }}</text>
                </view>
                <view class="message-time">{{ formatTime(msg.timestamp) }}</view>
              </template>

              <!-- 普通消息 -->
              <template v-else>
                <view class="message-wrapper">
                  <view class="avatar">
                    <image :src="msg.avatar || getDefaultAvatar(msg.type)" class="avatar-img" mode="aspectFill"></image>
                  </view>
                  <view class="message-info">
                    <view class="message-content">
                      <text>{{ msg.message }}</text>
                    </view>
                  </view>
                </view>
                <view class="message-time">{{ formatTime(msg.timestamp) }}</view>
              </template>
            </view>
            
            <!-- 无消息提示 -->
            <view v-if="messages.length === 0" class="empty-message">
              <text class="empty-text">暂无消息</text>
            </view>
          </view>
        </scroll-view>

        <!-- 快捷回复区域 -->
        <view class="quick-reply-area">
          <view class="quick-reply-header">
            <image src="https://ccpt.qiniu.0871.cn/publish/bi.png" class="header-icon"></image>
            <text class="header-text">快捷回复</text>
          </view>
          <view class="quick-reply-list">
            <view 
              class="quick-reply-item" 
              v-for="(reply, index) in quickReplies" 
              :key="index"
              @click="selectQuickReply(reply)"
            >
              <text>{{ reply }}</text>
            </view>
          </view>
        </view>

        <!-- 输入区域 -->
        <view class="input-area">
          <input 
            type="text"
            class="message-input" 
            v-model="messageText" 
            placeholder="输入消息..."
            confirm-type="send"
            @confirm="sendMessage"
          />
          <button class="send-btn" @click="sendMessage">发送</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FloatingImage',
  props: {
    // 图片地址
    imageSrc: {
      type: String,
      default: 'https://ccpt.qiniu.0871.cn/tuijian.png'
    },
    // 点击跳转的页面路径
    targetUrl: {
      type: String,
      default: '/pages/my/my'
    },
    // 是否自动打开分享推荐弹窗
    autoOpenShare: {
      type: Boolean,
      default: true
    },
    // 自定义点击事件
    customClick: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      // 悬浮组件位置
      position: {
        x: 10, // right距离
        y: 105 // bottom距离
      },
      // 拖拽状态
      dragging: false,
      // 记录触摸开始位置，用于判断是否为拖拽
      touchStartPos: null,
      // 屏幕尺寸
      screenSize: {
        width: 0,
        height: 0
      },
      // 未读消息数量
      unreadCount: 0,
      // 是否显示消息框
      showMessageBox: false,
      // 输入的消息文本
      messageText: '',
      // 聊天消息列表（真实数据）
      messages: [],
      // 聊天滚动位置
      scrollTop: 0,
      // 聊天记录加载状态
      chatLoading: false,
      // 快捷回复列表（与 chat-simple.vue 保持一致）
      quickReplies: [
        '您好！请问我的订单什么时候去完成？',
        '定位不太准，poi对的可以搜索导航前往！',
        '订单有特别要求，请小哥注意查看备注哦！',
        '请在订单说明的作业时段上门，以免空跑'
      ],
      // 当前聊天室ID
      currentRoomId: null,
      // 聊天标题信息
      chatCity: '', // 城市
      chatDistrict: '', // 区县
      chatOrderNo: '', // 订单号
      // WebSocket 相关
      socketTask: null,
      websocketurl: '',
      user_type: '',
      user_id: '',
      connectionStatus: 'disconnected', // disconnected, connecting, connected, error
      // 定时器ID
      refreshTimer: null,
      // 上次未读消息数量（用于检测是否有新消息）
      lastUnreadCount: 0,
      // 是否已经自动显示过消息框（避免重复弹出）
      hasAutoShown: false,
      // 页面是否可见
      isPageVisible: true,
      // 上次页面可见时的未读数量
      lastVisibleUnreadCount: 0
    }
  },
  computed: {
    // 显示的未读消息数量（超过99显示99+）
    displayUnreadCount() {
      return this.unreadCount > 99 ? '99+' : this.unreadCount;
    },
    // 是否显示角标
    showBadge() {
      return this.unreadCount > 0;
    },
    // 聊天标题：区县+订单号+订单消息通知
    chatTitle() {
      if (this.chatDistrict && this.chatOrderNo) {
        return `${this.chatDistrict} ${this.chatOrderNo} 订单消息通知`;
      }
      return '订单消息通知';
    }
  },
  mounted() {
    // 获取屏幕尺寸
    const systemInfo = uni.getSystemInfoSync();
    this.screenSize.width = systemInfo.screenWidth;
    this.screenSize.height = systemInfo.screenHeight;

    // 从本地存储恢复位置
    const savedPosition = uni.getStorageSync('floating_image_position');
    if (savedPosition) {
      this.position = savedPosition;
    } else {
      // 设置默认位置（考虑安全区域）
      this.position.y = 105 + (systemInfo.safeAreaInsets ? systemInfo.safeAreaInsets.bottom : 0);
    }

    // 获取未读消息数量
    this.fetchUnreadCount();
    
    // 定时刷新未读消息数量（每30秒刷新一次）
    this.refreshTimer = setInterval(() => {
      this.fetchUnreadCount();
    }, 30000);
    
    // 监听应用显示事件
    uni.onAppShow(() => {
      console.log('应用从后台切回前台');
      this.handlePageShow();
    });
    
    // 监听应用隐藏事件
    uni.onAppHide(() => {
      console.log('应用切换到后台');
      this.handlePageHide();
    });
    
    // 监听页面显示事件（页面间切换）
    uni.$on('pageShow', () => {
      console.log('页面显示事件（页面切换）');
      this.handlePageShow();
    });
    
    // 监听页面隐藏事件（页面间切换）
    uni.$on('pageHide', () => {
      console.log('页面隐藏事件（页面切换）');
      this.handlePageHide();
    });
  },
  beforeDestroy() {
    // 清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    // 关闭WebSocket
    this.closeWebSocket();
    // 移除事件监听
    uni.$off('pageShow');
    uni.$off('pageHide');
  },
  methods: {
    // 处理页面显示
    async handlePageShow() {
      console.log('页面显示，当前未读数量:', this.unreadCount, '上次可见时未读数量:', this.lastVisibleUnreadCount);
      this.isPageVisible = true;
      
      // 恢复定时刷新
      this.resumeRefreshTimer();
      
      // 刷新未读消息数量
      await this.fetchUnreadCount();
      
      // 延迟一下再检查并弹出，确保数据已更新
      setTimeout(() => {
        // 如果有未读消息且消息框未打开，则弹出
        if (this.unreadCount > 0 && !this.showMessageBox) {
          console.log('页面切回，检测到未读消息，准备弹出');
          // 重置标记，允许弹出
          this.hasAutoShown = false;
          this.autoShowMessageBox();
        }
      }, 300);
    },
    
    // 处理页面隐藏
    handlePageHide() {
      console.log('页面隐藏');
      this.isPageVisible = false;
      // 记录页面隐藏时的未读数量
      this.lastVisibleUnreadCount = this.unreadCount;
      
      // 页面隐藏时暂停定时器（节省资源）
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
        console.log('页面隐藏，暂停定时刷新');
      }
    },
    
    // 恢复定时刷新
    resumeRefreshTimer() {
      // 清除旧的定时器（如果存在）
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
      }
      
      // 重新启动定时器
      this.refreshTimer = setInterval(() => {
        this.fetchUnreadCount();
      }, 30000);
      console.log('恢复定时刷新');
    },
    
    // 获取用户未读消息数量
    async fetchUnreadCount() {
      try {
        // 从本地存储获取用户信息
        const userInfo = uni.getStorageSync('userInfo');
        if (!userInfo || !userInfo.openid) {
          console.log('用户未登录，无法获取未读消息数量');
          this.unreadCount = 0;
          return;
        }

        // 调用接口获取未读消息数量
        const response = await uni.request({
          url: 'https://ccpt.0871.cn/api/user/create',
          method: 'POST',
          data: {
            openid: userInfo.openid,
            userPhone: userInfo.phone_number || userInfo.userPhone
          }
        });

        console.log('获取未读消息数量响应:', response);

        // 处理返回数据
        if (response.statusCode === 200 && response.data && response.data.data) {
          const chatUnreadCount = response.data.data.chat_unread_count;
          console.log('chat_unread_count 原始数据:', chatUnreadCount);
          
          if (Array.isArray(chatUnreadCount)) {
            // 统计所有房间的未读消息总数
            const totalCount = chatUnreadCount.reduce((sum, item) => {
              return sum + (item.count || 0);
            }, 0);
            
            // 保存第一个有未读消息的房间ID和相关信息
            if (chatUnreadCount.length > 0 && chatUnreadCount[0].count > 0) {
              const roomData = chatUnreadCount[0];
              this.currentRoomId = roomData.room_id;
              
              // 从 task 数组中提取区县和订单号信息
              if (roomData.task && Array.isArray(roomData.task) && roomData.task.length > 0) {
                const taskData = roomData.task[0];
                // 城市名
                if (taskData.city_name) {
                  this.chatCity = taskData.city_name;
                }
                // 区县名
                if (taskData.district_name) {
                  this.chatDistrict = taskData.district_name;
                }
                // 订单号使用 room_id
                this.chatOrderNo = roomData.room_id;
                
                console.log('从task提取标题信息:');
                console.log('- 城市:', taskData.city_name);
                console.log('- 区县:', taskData.district_name);
                console.log('- 订单号(room_id):', roomData.room_id);
              } else {
                // 降级方案：直接使用 room_id 作为订单号
                this.chatOrderNo = roomData.room_id;
                console.log('未找到task数据，使用room_id作为订单号:', this.chatOrderNo);
              }
              
              console.log('未读消息完整数据:', JSON.stringify(roomData, null, 2));
            }
            
            // 保存上次的未读数量
            const previousCount = this.unreadCount;
            this.unreadCount = totalCount;
            console.log('设置未读消息数量:', this.unreadCount, '类型:', typeof this.unreadCount, '上次数量:', previousCount);
            
            // 自动弹出消息框的逻辑（只在页面可见时弹出）
            if (this.unreadCount > 0 && !this.showMessageBox && this.isPageVisible) {
              // 情况1：首次加载且有未读消息
              // 情况2：有新的未读消息（数量增加）
              if (previousCount === 0 || this.unreadCount > previousCount) {
                console.log('检测到未读消息，自动弹出消息框');
                console.log('previousCount:', previousCount, 'currentCount:', this.unreadCount, 'isPageVisible:', this.isPageVisible);
                // 有新消息时重置自动显示标记，允许弹出
                this.hasAutoShown = false;
                this.autoShowMessageBox();
              }
            }
          } else {
            this.unreadCount = 0;
            console.log('chat_unread_count 不是数组，设置为0');
          }
        } else {
          console.log('响应状态码或数据格式不正确');
          this.unreadCount = 0;
        }
      } catch (error) {
        console.error('获取未读消息数量失败:', error);
        this.unreadCount = 0;
      }
    },
    // 自动显示消息框
    autoShowMessageBox() {
      // 延迟一小段时间再弹出，避免页面刚加载就弹出
      setTimeout(() => {
        // 再次检查是否满足弹出条件
        if (this.unreadCount > 0 && !this.showMessageBox) {
          console.log('自动弹出消息框，未读数量:', this.unreadCount);
          
          // 振动提醒用户有新消息
          uni.vibrateShort({
            fail: () => {
              console.log('设备不支持振动');
            }
          });
          
          this.showMessageBox = true;
          // 标记已自动显示
          this.hasAutoShown = true;
          // 获取聊天记录
          this.getChat();
          // 更新上次未读数量
          this.lastUnreadCount = this.unreadCount;
        } else {
          console.log('不满足弹出条件 - unreadCount:', this.unreadCount, 'showMessageBox:', this.showMessageBox);
        }
      }, 500);
    },
    // 获取聊天记录（复制自 chat-simple.vue）
    async getChat() {
      if (!this.currentRoomId) {
        console.log('没有房间ID，无法获取聊天记录');
        return;
      }

      try {
        const userInfo = uni.getStorageSync('userInfo');
        if (!userInfo || !userInfo.user_id) {
          console.log('用户未登录');
          return;
        }

        // 开始加载
        this.chatLoading = true;
        console.log('开始获取聊天记录...');

        const res = await uni.request({
          url: `https://ccpt.0871.cn/api/chat`,
          method: 'POST',
          data: {
            room_id: this.currentRoomId,
            user_id: userInfo.user_id,
            messageable_type: "user",
            timestamp: Math.floor(Date.now() / 1000),
            sign: 'chongchong'
          },
          header: {
            'Content-Type': 'application/json'
          }
        });

        console.log('获取聊天记录完整响应:', JSON.stringify(res.data, null, 2));

        if (res.data.websocket_url) {
          this.user_type = res.data.user.type;
          this.user_id = res.data.user.id;
          this.websocketurl = res.data.websocket_url;

          // 提取区县和订单号信息 - 尝试多种可能的数据结构
          let foundDistrict = false;
          let foundOrderNo = false;
          
          // 方式1: 从 room 对象获取
          if (res.data.room) {
            console.log('room 数据:', res.data.room);
            if (res.data.room.district || res.data.room.area) {
              this.chatDistrict = res.data.room.district || res.data.room.area || '';
              foundDistrict = true;
            }
            if (res.data.room.order_no || res.data.room.order_number || res.data.room.orderNo) {
              this.chatOrderNo = res.data.room.order_no || res.data.room.order_number || res.data.room.orderNo || '';
              foundOrderNo = true;
            }
            if (res.data.room.name) {
              // room.name 可能包含订单号信息
              console.log('room.name:', res.data.room.name);
            }
          }
          
          // 方式2: 从 order 对象获取
          if (res.data.order) {
            console.log('order 数据:', res.data.order);
            if (!foundDistrict && (res.data.order.district || res.data.order.area)) {
              this.chatDistrict = res.data.order.district || res.data.order.area || '';
              foundDistrict = true;
            }
            if (!foundOrderNo && (res.data.order.order_no || res.data.order.order_number || res.data.order.orderNo)) {
              this.chatOrderNo = res.data.order.order_no || res.data.order.order_number || res.data.order.orderNo || '';
              foundOrderNo = true;
            }
          }
          
          // 方式3: 直接从顶层数据获取
          if (!foundDistrict && (res.data.district || res.data.area)) {
            this.chatDistrict = res.data.district || res.data.area || '';
            foundDistrict = true;
          }
          if (!foundOrderNo && (res.data.order_no || res.data.order_number || res.data.orderNo)) {
            this.chatOrderNo = res.data.order_no || res.data.order_number || res.data.orderNo || '';
            foundOrderNo = true;
          }
          
          // 方式4: 尝试从 room_id 解析（如果 room_id 是特定格式）
          if (!foundOrderNo && this.currentRoomId) {
            console.log('尝试从 room_id 解析:', this.currentRoomId);
            // 如果 room_id 格式类似 "order_123456" 或包含订单号
            const roomIdStr = String(this.currentRoomId);
            const match = roomIdStr.match(/(\d{4,})/); // 匹配至少4位数字
            if (match) {
              this.chatOrderNo = match[1];
              foundOrderNo = true;
              console.log('从 room_id 解析出订单号:', this.chatOrderNo);
            }
          }
          
          console.log('最终提取的标题信息 - 区县:', this.chatDistrict, '订单号:', this.chatOrderNo);
          console.log('提取状态 - 区县:', foundDistrict, '订单号:', foundOrderNo);

          // 渲染历史聊天记录
          if (res.data.history && Array.isArray(res.data.history)) {
            this.messages = []; // 清空现有消息
            res.data.history.forEach(item => {
              // 判断消息类型：如果messageable_id等于当前用户id，则为自己发送的消息
              const messageType = item.messageable_id == userInfo.user_id ? 'self' : 'other';
              const senderName = messageType === 'self' ? '我' : (item.name || '用户');

              // 根据messageable_type设置头像
              let avatar = item.avatar;
              if (!avatar) {
                if (item.messageable_type === 'App\\Models\\ServiceMember') {
                  avatar = 'https://ccpt.qiniu.0871.cn/duihua/qishou.png';
                } else if (item.messageable_type === 'App\\Models\\User') {
                  avatar = 'https://ccpt.qiniu.0871.cn/112lbtx.png';
                } else {
                  avatar = null;
                }
              }

              // 转换时间格式
              const timestamp = item.created_at ?
                Math.floor(new Date(item.created_at).getTime() / 1000) :
                Math.floor(Date.now() / 1000);

              this.messages.push({
                sender: senderName,
                message: item.message,
                type: messageType,
                avatar: avatar,
                timestamp: timestamp
              });
            });

            console.log('聊天记录加载完成，共', this.messages.length, '条消息');
            
            // 加载完成
            this.chatLoading = false;
            
            // 滚动到底部
            this.scrollToBottom();
          } else {
            // 没有历史消息
            this.chatLoading = false;
          }

          // 连接WebSocket
          this.connectWebSocket();
        } else {
          console.log('获取聊天记录失败:', res.data.message || '未知错误');
          this.chatLoading = false;
        }
      } catch (error) {
        console.error('获取聊天记录失败:', error);
        this.chatLoading = false;
      }
    },
    // 触摸开始
    onTouchStart(e) {
      const touch = e.touches[0];
      // 记录触摸开始位置
      this.touchStartPos = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      this.dragging = false;
    },
    
    // 触摸移动
    onTouchMove(e) {
      if (!this.touchStartPos) return;
      
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - this.touchStartPos.x);
      const deltaY = Math.abs(touch.clientY - this.touchStartPos.y);
      
      // 如果移动距离超过10px，认为是拖拽
      if (deltaX > 10 || deltaY > 10) {
        this.dragging = true;
      }
      
      if (!this.dragging) return;
      
      // 修正坐标计算：right位置应该是屏幕宽度减去touch.clientX
      // bottom位置应该是屏幕高度减去touch.clientY
      const newX = this.screenSize.width - touch.clientX - 50; // 50px为组件宽度的一半，保持中心对齐
      const newY = this.screenSize.height - touch.clientY - 72; // 72px为组件高度的一半
      
      // 边界限制
      const componentWidth = 50; // 100rpx ≈ 50px
      const componentHeight = 145; // 290rpx ≈ 145px
      const safeAreaBottom = 100; // 底部安全区域
      
      // 限制在屏幕范围内，确保组件完全可见
      const limitedX = Math.max(10, Math.min(newX, this.screenSize.width - componentWidth - 10));
      const limitedY = Math.max(10, Math.min(newY, this.screenSize.height - componentHeight - safeAreaBottom));
      
      this.position.x = limitedX;
      this.position.y = limitedY;
      
      // 防止页面滚动
      e.preventDefault();
    },
    
    // 触摸结束
    onTouchEnd(e) {
      // 保存位置到本地存储（如果发生了拖拽）
      if (this.dragging) {
        uni.setStorageSync('floating_image_position', this.position);
      }
      
      // 延迟重置拖拽状态，防止影响点击事件
      setTimeout(() => {
        this.dragging = false;
        this.touchStartPos = null;
      }, 100);
    },
    
  goToCart(){
	  if (this.dragging) return; // 拖拽时不触发点击事件
	  
	  uni.navigateTo({
		url: '/pages/cart/index',
		fail: (err) => {
		  console.error('跳转到购物车:', err);
		  uni.showToast({
			title: '跳转失败',
			icon: 'none'
		  });
		}
	  });
  },
    // 点击聊天图标
    handleChatClick() {
      console.log('点击聊天图标, dragging:', this.dragging);
      
      if (this.dragging) {
        console.log('正在拖拽，取消点击');
        return; // 拖拽时不触发点击事件
      }
      
      // 点击聊天图标直接跳转到聊天列表
      console.log('跳转到聊天列表');
      this.goToChat();
    },
    // 跳转到聊天列表
    goToChat() {
      if (this.dragging) return; // 拖拽时不触发点击事件
      
      // 关闭消息框
      this.showMessageBox = false;
      // 关闭 WebSocket
      this.closeWebSocket();
      // 重置自动显示标记（允许用户从聊天列表回来后再次自动弹出）
      this.hasAutoShown = false;
      
      // 跳转到用户端聊天列表（tab页面）
      uni.navigateTo({
        url: '/pages/chat/chat-list',
        success: () => {
          console.log('跳转到聊天列表成功');
        },
        fail: (err) => {
          console.error('跳转到聊天列表失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },
    // 关闭消息框
    closeMessageBox() {
      console.log('关闭消息框');
      this.showMessageBox = false;
      this.messageText = '';
      this.messages = [];
      this.scrollTop = 0; // 重置滚动位置
      this.chatLoading = false; // 重置加载状态
      // 关闭WebSocket
      this.closeWebSocket();
      // 标记用户已经关闭过消息框（避免重复自动弹出）
      this.hasAutoShown = true;
      
      // 刷新未读消息数量
      setTimeout(() => {
        this.fetchUnreadCount();
      }, 500);
    },
    // 连接WebSocket（复制自 chat-simple.vue）
    connectWebSocket() {
      if (this.connectionStatus === 'connected' || this.connectionStatus === 'connecting') {
        console.log('WebSocket已连接或正在连接');
        return;
      }

      this.connectionStatus = 'connecting';

      const url = this.websocketurl + `?room_id=${encodeURIComponent(this.currentRoomId)}` + `&user_type=` + encodeURIComponent(this.user_type) + `&user_id=` + encodeURIComponent(this.user_id);
      console.log('连接WebSocket:', url);

      this.socketTask = uni.connectSocket({
        url: url,
        protocols: [],
        success: (res) => {
          console.log('WebSocket连接请求成功:', res);
        },
        fail: (err) => {
          console.error('WebSocket连接请求失败:', err);
          this.connectionStatus = 'error';
        }
      });

      this.socketTask.onOpen((res) => {
        console.log('WebSocket连接已打开', res);
        this.connectionStatus = 'connected';
      });

      this.socketTask.onMessage((res) => {
        console.log('收到消息:', res.data);
        try {
          const data = JSON.parse(res.data);

          // 过滤心跳消息
          if (data.type === 'heartbeat') {
            return;
          }

          // 过滤自己发送的消息
          if (data.user_id !== this.user_id) {
            // 创建消息对象，处理时间戳
            const timestamp = data.timestamp ?
              (data.timestamp < 10000000000 ? data.timestamp : Math.floor(data.timestamp / 1000)) :
              Math.floor(Date.now() / 1000);

            this.messages.push({
              sender: data.name || '用户',
              message: data.message,
              type: 'other',
              avatar: data.avatar || null,
              timestamp: timestamp
            });
            
            // 收到新消息后滚动到底部
            this.scrollToBottom();
            
            // 收到新消息后刷新未读消息数量（如果消息框未打开）
            if (!this.showMessageBox) {
              setTimeout(() => {
                this.fetchUnreadCount();
              }, 500);
            }
          }
        } catch (e) {
          console.error('解析消息失败:', e);
        }
      });

      this.socketTask.onClose((res) => {
        console.log('WebSocket连接关闭', res);
        this.connectionStatus = 'disconnected';
      });

      this.socketTask.onError((res) => {
        console.error('WebSocket连接错误', res);
        this.connectionStatus = 'error';
      });
    },
    // 关闭WebSocket
    closeWebSocket() {
      if (this.socketTask) {
        this.socketTask.close();
        this.socketTask = null;
      }
      this.connectionStatus = 'disconnected';
    },
    // 格式化时间（复制自 chat-simple.vue）
    formatTime(timestamp) {
      // 如果时间戳是秒级，转换为毫秒级
      const milliseconds = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
      const date = new Date(milliseconds);
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    // 获取默认头像（复制自 chat-simple.vue）
    getDefaultAvatar(type) {
      if (type === 'self') {
        return 'https://ccpt.qiniu.0871.cn/duihua/qishou.png';
      } else {
        return 'https://ccpt.qiniu.0871.cn/112lbtx.png';
      }
    },
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        // 设置一个较大的值，确保滚动到底部
        this.scrollTop = this.messages.length * 1000;
        console.log('滚动到底部，消息数量:', this.messages.length);
      });
    },
    // 选择快捷回复
    selectQuickReply(reply) {
      this.messageText = reply;
    },
    // 发送消息（使用真实的 WebSocket）
    async sendMessage() {
      const message = this.messageText.trim();
      if (!message) {
        uni.showToast({
          title: '请输入消息内容',
          icon: 'none'
        });
        return;
      }

      // 检查连接状态
      if (this.connectionStatus !== 'connected') {
        uni.showToast({
          title: '连接已断开，请重新打开',
          icon: 'none'
        });
        return;
      }

      // 检查socketTask是否存在
      if (!this.socketTask) {
        uni.showToast({
          title: '连接异常，请重新打开',
          icon: 'none'
        });
        return;
      }

      try {
        const userInfo = uni.getStorageSync('userInfo');
        if (!userInfo || !userInfo.user_id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        const payload = {
          name: userInfo.name || userInfo.phone || '用户',
          user_id: this.user_id,
          user_type: this.user_type,
          room_id: this.currentRoomId,
          message: message,
          timestamp: Math.floor(Date.now() / 1000)
        };

        console.log('准备发送消息:', payload);

        // 先显示自己的消息
        const selfAvatar = userInfo.avatar || 'https://ccpt.qiniu.0871.cn/112lbtx.png';
        this.messages.push({
          sender: '我',
          message: message,
          type: 'self',
          avatar: selfAvatar,
          timestamp: Math.floor(Date.now() / 1000)
        });
        
        // 发送消息后滚动到底部
        this.scrollToBottom();
        
        // 清空输入框
        this.messageText = '';

        // 发送到服务器
        this.socketTask.send({
          data: JSON.stringify(payload),
          success: (res) => {
            console.log('消息发送成功:', res);
            uni.showToast({
              title: '发送成功',
              icon: 'success',
              duration: 1000
            });
            
            // 发送成功后刷新未读消息数量
            setTimeout(() => {
              this.fetchUnreadCount();
            }, 1000);
          },
          fail: (err) => {
            console.error('消息发送失败:', err);
            uni.showToast({
              title: '发送失败，请重试',
              icon: 'none'
            });
            // 移除未发送成功的消息
            this.messages.pop();
          }
        });
      } catch (error) {
        console.error('发送消息异常:', error);
        uni.showToast({
          title: '发送异常',
          icon: 'none'
        });
      }
    },
    handleClick() {
		return false;
      if (this.dragging) return; // 拖拽时不触发点击事件
      
      // console.log('点击悬浮小图');

      // 发射点击事件
      this.$emit('click');

      // 如果有自定义点击事件，优先执行自定义事件
      if (this.customClick && typeof this.customClick === 'function') {
        console.log('执行自定义点击事件');
        try {
          this.customClick();
        } catch (error) {
          console.error('执行自定义点击事件失败:', error);
        }
        return;
      }

      // 默认行为：跳转到指定页面
      if (this.targetUrl === '/pages/my/my' && this.autoOpenShare) {
        // 跳转到我的页面并自动打开分享推荐弹窗
        uni.switchTab({
          url: this.targetUrl,
          success: () => {
            // 延迟一下确保页面加载完成，然后触发分享推荐弹窗
            setTimeout(() => {
              // 通过事件总线通知我的页面打开分享推荐弹窗
              uni.$emit('openShareModal');
            }, 300);
          },
          fail: (err) => {
            console.error('跳转到我的页面失败:', err);
            uni.showToast({
              title: '跳转失败',
              icon: 'none'
            });
          }
        });
      } else {
        // 普通页面跳转
        if (this.targetUrl.startsWith('/pages/')) {
          // 判断是否为tabBar页面
          const tabBarPages = ['/pages/index/index', '/pages/order/index', '/pages/my/my'];
          if (tabBarPages.includes(this.targetUrl)) {
            uni.switchTab({
              url: this.targetUrl,
              fail: (err) => {
                console.error('跳转失败:', err);
                uni.showToast({
                  title: '跳转失败',
                  icon: 'none'
                });
              }
            });
          } else {
            uni.navigateTo({
              url: this.targetUrl,
              fail: (err) => {
                console.error('跳转失败:', err);
                uni.showToast({
                  title: '跳转失败',
                  icon: 'none'
                });
              }
            });
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 悬浮小图样式
.floating-image {
	background-image: url('https://ccpt.qiniu.0871.cn/riderEnd/index/beiban.svg');
	background-size: 100% 100%;
  position: fixed;
  // 移除固定的 right 和 bottom，改为动态设置
  width: 100rpx;
  height: 300rpx;
  z-index: 999;
  transition: none; // 移除过渡动画，提高拖拽响应性
  
  // 增强拖拽相关样式
  touch-action: none; // 禁用浏览器默认触摸行为
  user-select: none; // 防止选择文本
  cursor: move; // 显示移动光标
  
  // 拖拽时的视觉反馈
  &:active {
    transform: scale(1.05);
    opacity: 0.9;
  }

  .img-2 {
	  margin-top: 4px;
    width: 110rpx;
    height: 100rpx;
    pointer-events: auto; // 确保图片可点击
    &:active {
      transform: scale(0.95);
    }
  }

  .img-3 {
    width: 100rpx;
    height: 80rpx;
    margin-top: 4px;
    pointer-events: auto; // 确保图片可点击
    &:active {
      transform: scale(0.95);
    }
  }

  .img-4 {
    width: 100rpx;
    height: 80rpx;
    pointer-events: auto; // 确保图片可点击
    &:active {
      transform: scale(0.95);
    }
  }
  .img-5 {
  	margin-top: -5px;
	margin-left: 3px;
    width: 90rpx;
    height: 90rpx;
    pointer-events: auto; // 确保图片可点击
    &:active {
      transform: scale(0.95);
    }
  }

  // 图片包裹容器（用于定位角标）
  .img-wrapper {
    position: relative;
    width: 100rpx;
    height: 80rpx;
    margin-top: 7px;
  }

  // 角标样式
  .badge {
    position: absolute;
    top: -6rpx;
    right: -6rpx;
    min-width: 32rpx;
    height: 32rpx;
    line-height: 32rpx;
    padding: 0 8rpx;
    background-color: #ff4d4f;
    color: #ffffff;
    font-size: 20rpx;
    font-weight: bold;
    text-align: center;
    border-radius: 16rpx;
    border: 2rpx solid #ffffff;
    box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.4);
    z-index: 1;
  }
}

// 底部消息框样式
.message-box-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.message-box {
  position: relative;
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 32rpx 32rpx 0 0;
  padding: 0;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  animation: slideUp 0.3s ease-in-out;
  max-height: 85vh;
  overflow-y: auto;
  box-sizing: border-box;
}

// 标题栏
.message-box-header {
  position: relative;
  background: rgba(36, 146, 242, 1);
  border-radius: 32rpx 32rpx 0 0;
  padding: 24rpx 80rpx 24rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .header-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #ffffff;
    text-align: center;
    line-height: 1.4;
  }
}

// 关闭按钮
.close-icon {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 60rpx;
  height: 60rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
  text {
    font-size: 48rpx;
    color: #ffffff;
    line-height: 1;
  }
  
  &:active {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

// 聊天消息区域（复制自 chat-simple.vue）
.chat-box {
  background-color: white;
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 20rpx;
  margin-bottom: 16rpx;
  box-sizing: border-box;
  height: 400rpx;
  max-height: 50vh;
  overflow-y: auto;
}

// 加载提示
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f0f0f0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999999;
}

// 无消息提示
.empty-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}

.message {
  margin-bottom: 20rpx;
  width: 100%;
  box-sizing: border-box;

  .message-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
  }

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 8rpx;
    overflow: hidden;
    flex-shrink: 0;

    .avatar-img {
      width: 100%;
      height: 100%;
      background-color: #f0f0f0;
    }
  }

  .message-info {
    flex: 1;
    max-width: calc(100% - 96rpx);
  }

  .sender-name {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 8rpx;
    font-weight: 500;
  }

  &.self {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .message-wrapper {
      flex-direction: row-reverse;
    }

    .sender-name {
      text-align: right;
    }

    .message-content {
      background-color: #007bff;
      color: white;
      padding: 12rpx 16rpx;
      border-radius: 18rpx;
      max-width: 100%;
      word-wrap: break-word;
      word-break: break-all;
      white-space: pre-wrap;
      box-sizing: border-box;
    }

    .message-time {
      text-align: right;
    }
  }

  &.other {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .sender-name {
      text-align: left;
    }

    .message-content {
      background-color: #e9ecef;
      color: #333;
      padding: 12rpx 16rpx;
      border-radius: 18rpx;
      max-width: 100%;
      word-wrap: break-word;
      word-break: break-all;
      white-space: pre-wrap;
      box-sizing: border-box;
    }

    .message-time {
      text-align: left;
    }
  }

  &.system {
    display: flex;
    flex-direction: column;
    align-items: center;

    .message-content {
      background-color: #f8f9fa;
      color: #6c757d;
      padding: 8rpx 12rpx;
      border-radius: 12rpx;
      font-size: 24rpx;
      max-width: 80%;
      word-wrap: break-word;
      word-break: break-all;
      white-space: pre-wrap;
      box-sizing: border-box;
      text-align: center;
    }
  }

  .message-time {
    font-size: 20rpx;
    color: #999;
    margin-top: 8rpx;
  }
}

// 快捷回复区域（复制自 chat-simple.vue）
.quick-reply-area {
  background-color: white;
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 0 20rpx 16rpx 20rpx;
  box-sizing: border-box;

  .quick-reply-header {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;

    .header-icon {
      width: 32rpx;
      height: 32rpx;
      margin-right: 8rpx;
    }

    .header-text {
      font-size: 28rpx;
      color: #2492F2;
      font-weight: 500;
    }
  }

  .quick-reply-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .quick-reply-item {
      background-color: #F0F9FF;
      border: 1rpx solid #E6F4FF;
      border-radius: 8rpx;
      padding: 16rpx 20rpx;
      transition: all 0.3s ease;

      text {
        font-size: 26rpx;
        color: #333333;
        line-height: 1.5;
      }

      &:active {
        background-color: #E6F4FF;
        transform: scale(0.98);
      }
    }
  }
}

// 输入区域（复制自 chat-simple.vue）
.input-area {
  display: flex;
  gap: 16rpx;
  margin: 0 20rpx 20rpx 20rpx;
  align-items: center;

  .message-input {
    flex: 1;
    height: 70rpx;
    padding: 0 20rpx;
    border: 1rpx solid #ddd;
    border-radius: 35rpx;
    background-color: white;
    font-size: 28rpx;
  }

  .send-btn {
    height: 70rpx;
    line-height: 70rpx;
    padding: 0 32rpx;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 35rpx;
    font-size: 28rpx;

    &:disabled {
      background-color: #ccc;
    }
  }
}
</style>
