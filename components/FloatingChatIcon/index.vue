<template>
  <view>
    <!-- 悬浮聊天图标 -->
    <view 
      class="floating-chat-icon" 
      :class="{ 'is-dragging': isDragging }"
      :style="{ left: left + 'px', top: top + 'px' }"
      @touchstart="handleTouchStart"
      @touchmove.stop.prevent="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <view class="icon-wrapper">
        <image 
          src="https://ccpt.qiniu.0871.cn/duihua2-active.svg" 
          mode="aspectFit" 
          class="chat-icon"
        ></image>
        <!-- 未读消息角标 -->
        <view class="badge" v-if="unreadCount > 0">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </view>
      </view>
      <text class="chat-text">连通客户和平台协同办理</text>
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
import md5 from 'md5';

export default {
  name: 'FloatingChatIcon',
  props: {
    // 跳转路径，默认为riderEnd/chat-list
    targetUrl: {
      type: String,
      default: '/riderEnd/chat-list'
    },
    // 是否为tab页面导航
    isTabPage: {
      type: Boolean,
      default: false
    },
    // 订单ID，如果提供则进入订单专属聊天室
    orderId: {
      type: String,
      default: ''
    },
    // 订单标题，用于聊天室标题显示
    orderTitle: {
      type: String,
      default: '订单协办'
    }
  },
  data() {
    return {
      unreadCount: 0, // 未读消息总数
      timer: null, // 轮询定时器
      // 拖拽相关
      left: 0,
      top: 0,
      startX: 0,
      startY: 0,
      isDragging: false,
      startTime: 0,
      screenWidth: 0,
      screenHeight: 0,
      iconSizePx: 0, // 图标实际像素大小
      // 消息框相关
      showMessageBox: false,
      messageText: '',
      messages: [],
      scrollTop: 0,
      chatLoading: false,
      quickReplies: [
        '您好！请问我的订单什么时候去完成？',
        '定位不太准，poi对的可以搜索导航前往！',
        '订单有特别要求，请小哥注意查看备注哦！',
        '请在订单说明的作业时段上门，以免空跑'
      ],
      currentRoomId: null,
      chatCity: '',
      chatDistrict: '',
      chatOrderNo: '',
      // WebSocket 相关
      socketTask: null,
      websocketurl: '',
      user_type: '',
      user_id: '',
      connectionStatus: 'disconnected',
      // 上次未读消息数量
      lastUnreadCount: 0,
      hasAutoShown: false,
      isPageVisible: true,
      lastVisibleUnreadCount: 0
    }
  },
  computed: {
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
    this.screenWidth = systemInfo.windowWidth;
    this.screenHeight = systemInfo.windowHeight;
    
    // 计算图标实际像素大小（100rpx转px）
    // uni-app中，750rpx = 屏幕宽度，所以 100rpx = 屏幕宽度 * (100/750)
    this.iconSizePx = (100 / 750) * systemInfo.screenWidth;
    
    // 初始化位置（右侧中间偏上）
    this.left = this.screenWidth - this.iconSizePx - 10; // 距离右边10px
    this.top = 300; // 距离顶部300px
    
    // 组件挂载时获取未读消息数
    this.fetchUnreadCount();
    // 设置定时轮询，每30秒更新一次
    this.timer = setInterval(() => {
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
    // 组件销毁前清除定时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // 关闭WebSocket
    this.closeWebSocket();
    // 移除事件监听
    uni.$off('pageShow');
    uni.$off('pageHide');
  },
  methods: {
    // 触摸开始
    handleTouchStart(e) {
      this.isDragging = false;
      this.startTime = Date.now();
      this.startX = e.touches[0].clientX - this.left;
      this.startY = e.touches[0].clientY - this.top;
    },
    
    // 触摸移动
    handleTouchMove(e) {
      // 标记为拖拽状态
      if (!this.isDragging) {
        this.isDragging = true;
      }
      
      // 计算新位置
      let newLeft = e.touches[0].clientX - this.startX;
      let newTop = e.touches[0].clientY - this.startY;
      
      // 边界检测（使用计算出的实际图标大小）
      if (newLeft < 0) newLeft = 0;
      if (newLeft > this.screenWidth - this.iconSizePx) newLeft = this.screenWidth - this.iconSizePx;
      if (newTop < 0) newTop = 0;
      if (newTop > this.screenHeight - this.iconSizePx) newTop = this.screenHeight - this.iconSizePx;
      
      this.left = newLeft;
      this.top = newTop;
    },
    
    // 触摸结束
    handleTouchEnd(e) {
      const endTime = Date.now();
      const duration = endTime - this.startTime;
      
      // 如果没有拖拽（时间很短），则触发点击事件
      if (!this.isDragging && duration < 200) {
        this.goToChat();
        return;
      }
      
      // 先取消拖拽状态，让过渡动画生效
      this.isDragging = false;
      
      // 使用 nextTick 确保状态更新后再执行吸附
      this.$nextTick(() => {
        // 自动吸附到左右边缘
        const screenCenter = this.screenWidth / 2;
        
        if (this.left < screenCenter) {
          // 吸附到左边
          this.left = 10;
        } else {
          // 吸附到右边（使用实际图标大小）
          this.left = this.screenWidth - this.iconSizePx - 10;
        }
      });
    },
    
    // 获取未读消息数量
    async fetchUnreadCount() {
      try {
        // 从本地存储获取骑手用户信息
        const riderUserInfo = uni.getStorageSync('riderUserInfo');

        // 如果没有登录信息，则不显示角标
        if (!riderUserInfo || !riderUserInfo.id || !riderUserInfo.phone) {
          this.unreadCount = 0;
          return;
        }

        // 生成签名
        const signStr = `service_member_id=${riderUserInfo.id}&phone_number=${riderUserInfo.phone}`;
        const sign = md5(signStr);

        // 请求参数
        const params = {
          service_member_id: riderUserInfo.id,
          sign: sign,
          member_id: riderUserInfo.id
        };

        // 发起请求
        const res = await uni.request({
          url: 'https://ccpt.0871.cn/api/service/member/info',
          method: 'POST',
          data: params,
          header: {
            'Content-Type': 'application/json'
          }
        });

        console.log('获取未读消息数量响应:', res);

        // 检查响应状态
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const chatUnreadCount = res.data.data.chat_unread_count || [];
          console.log('chat_unread_count 原始数据:', chatUnreadCount);

          // 统计所有聊天室的未读消息总数
          const totalCount = chatUnreadCount.reduce((sum, item) => {
            return sum + (item.count || 0);
          }, 0);
          
          // 保存第一个有未读消息的房间ID和相关信息
          if (Array.isArray(chatUnreadCount) && chatUnreadCount.length > 0 && chatUnreadCount[0].count > 0) {
            const roomData = chatUnreadCount[0];
            this.currentRoomId = roomData.room_id;
            
            // 从 task 数组中提取区县和订单号信息
            if (roomData.task && Array.isArray(roomData.task) && roomData.task.length > 0) {
              const taskData = roomData.task[0];
              if (taskData.city_name) {
                this.chatCity = taskData.city_name;
              }
              if (taskData.district_name) {
                this.chatDistrict = taskData.district_name;
              }
              this.chatOrderNo = roomData.room_id;
              
              console.log('从task提取标题信息:');
              console.log('- 城市:', taskData.city_name);
              console.log('- 区县:', taskData.district_name);
              console.log('- 订单号(room_id):', roomData.room_id);
            } else {
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
          console.warn('获取未读消息数失败:', res);
        }
      } catch (error) {
        console.error('获取未读消息数异常:', error);
        // 请求失败时不改变当前显示状态
      }
    },

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
          // this.autoShowMessageBox();
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
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
        console.log('页面隐藏，暂停定时刷新');
      }
    },
    
    // 恢复定时刷新
    resumeRefreshTimer() {
      // 清除旧的定时器（如果存在）
      if (this.timer) {
        clearInterval(this.timer);
      }
      
      // 重新启动定时器
      this.timer = setInterval(() => {
        this.fetchUnreadCount();
      }, 30000);
      console.log('恢复定时刷新');
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
    
    // 获取聊天记录
    async getChat() {
      if (!this.currentRoomId) {
        console.log('没有房间ID，无法获取聊天记录');
        return;
      }

      try {
        const riderUserInfo = uni.getStorageSync('riderUserInfo');
        if (!riderUserInfo || !riderUserInfo.id) {
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
            user_id: riderUserInfo.id,
            messageable_type: "service_member",
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

          // 提取区县和订单号信息
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
          
          // 方式4: 尝试从 room_id 解析
          if (!foundOrderNo && this.currentRoomId) {
            console.log('尝试从 room_id 解析:', this.currentRoomId);
            const roomIdStr = String(this.currentRoomId);
            const match = roomIdStr.match(/(\d{4,})/);
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
            this.messages = [];
            res.data.history.forEach(item => {
              // 判断消息类型
              const messageType = item.messageable_id == riderUserInfo.id ? 'self' : 'other';
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
    
    // 关闭消息框
    closeMessageBox() {
      console.log('关闭消息框');
      this.showMessageBox = false;
      this.messageText = '';
      this.messages = [];
      this.scrollTop = 0;
      this.chatLoading = false;
      // 关闭WebSocket
      this.closeWebSocket();
      // 标记用户已经关闭过消息框（避免重复自动弹出）
      this.hasAutoShown = true;
      
      // 刷新未读消息数量
      setTimeout(() => {
        this.fetchUnreadCount();
      }, 500);
    },
    
    // 连接WebSocket
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
    
    // 格式化时间
    formatTime(timestamp) {
      // 如果时间戳是秒级，转换为毫秒级
      const milliseconds = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
      const date = new Date(milliseconds);
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    
    // 获取默认头像
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
    
    // 发送消息
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
        const riderUserInfo = uni.getStorageSync('riderUserInfo');
        if (!riderUserInfo || !riderUserInfo.id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        const payload = {
          name: riderUserInfo.name || riderUserInfo.phone || '骑手',
          user_id: this.user_id,
          user_type: this.user_type,
          room_id: this.currentRoomId,
          message: message,
          timestamp: Math.floor(Date.now() / 1000)
        };

        console.log('准备发送消息:', payload);

        // 先显示自己的消息
        const selfAvatar = riderUserInfo.avatar || 'https://ccpt.qiniu.0871.cn/duihua/qishou.png';
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
    
    goToChat() {
      if (this.isDragging) return;
      
      // 关闭消息框
      this.showMessageBox = false;
      // 关闭 WebSocket
      this.closeWebSocket();
      // 重置自动显示标记（允许用户从聊天列表回来后再次自动弹出）
      this.hasAutoShown = false;
      
      // 如果提供了订单ID，跳转到订单专属聊天室
      if (this.orderId) {
        uni.navigateTo({
          url: `/riderEnd/chat-simple?roomId=${this.orderId}&title=${encodeURIComponent(this.orderTitle)}`,
          success: () => {
            console.log('跳转到订单聊天室成功');
          },
          fail: (err) => {
            console.error('跳转到订单聊天室失败:', err);
            uni.showToast({
              title: '跳转失败',
              icon: 'none'
            });
          }
        });
        return;
      }
      
      // 根据isTabPage决定使用switchTab还是navigateTo
      const navigationMethod = this.isTabPage ? 'switchTab' : 'navigateTo';

      uni[navigationMethod]({
        url: this.targetUrl,
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
    }
  }
}
</script>

<style lang="scss" scoped>
.floating-chat-icon {
  position: fixed;
  z-index: 999;
  width: 100rpx;
  /* 拖拽时无过渡，松手后吸附时有过渡 */
  transition: none;
  /* 阻止触摸时的默认行为，防止页面滚动 */
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 非拖拽状态时的过渡动画（用于吸附效果） */
.floating-chat-icon:not(.is-dragging) {
  transition: left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 拖拽状态时的视觉反馈 */
.floating-chat-icon.is-dragging {
  opacity: 0.9;
  transform: scale(1.05);
}

.floating-chat-icon:active:not(.is-dragging) {
  transform: scale(0.95);
}

.icon-wrapper {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  /* background: linear-gradient(135deg, #2492F2 0%, #1976D2 100%); */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(36, 146, 242, 0.4);
  border: 3rpx solid #ffffff;
}

.icon-wrapper::before {
  content: '';
  position: absolute;
  inset: -6rpx;
  background: linear-gradient(45deg, rgba(255,255,255,0.3), transparent, rgba(255,255,255,0.3));
  border-radius: 50%;
  z-index: -1;
  animation: rotate 3s linear infinite;
}

.chat-icon {
  width: 90rpx;
  height: 90rpx;
  /* filter: brightness(0) invert(1); */
}

.chat-text {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #1890ff;
  white-space: nowrap;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.badge {
  position: absolute;
  top: 0rpx;
  right: 0rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  background: #ff4757;
  border-radius: 16rpx;
  border: 3rpx solid #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(255, 71, 87, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: bold;
  color: #ffffff;
  line-height: 1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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

// 聊天消息区域
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

// 快捷回复区域
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

// 输入区域
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
