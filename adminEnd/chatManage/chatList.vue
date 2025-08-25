<template>
  <view class="chat-list-page">
    <!-- 自定义导航栏 -->
    <nav-bar title="对话列表" title-align="center" :showBackButton="true"></nav-bar>

    <!-- 内容区域 -->
    <view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
      <!-- 搜索框 -->
      <view class="search-section">
        <view class="search-box">
          <text class="search-icon">🔍</text>
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="搜索聊天记录..."
            class="search-input"
            @input="onSearch" />
        </view>
      </view>

      <!-- 聊天列表 -->
      <view class="chat-list">
        <view
          v-for="(chat, index) in filteredChatList"
          :key="chat.room_id"
          class="chat-item"
          @click="enterChat(chat)">

          <!-- 头像 -->
          <view class="avatar">
            <image :src="chat.avatar || defaultAvatar" class="avatar-icon" mode="aspectFit"></image>
            <view v-if="chat.unread_count > 0" class="unread-badge">
              <text class="unread-text">{{ chat.unread_count > 99 ? '99+' : chat.unread_count }}</text>
            </view>
          </view>

          <!-- 聊天信息 -->
          <view class="chat-info">
            <view class="chat-header">
              <text class="chat-title">{{ chat.title || `聊天室 ${chat.room_id}` }}</text>
              <text class="chat-time">{{ formatTime(chat.last_message_time) }}</text>
            </view>
            <view class="chat-preview">
              <text class="last-message">{{ chat.last_message || '暂无消息' }}</text>
            </view>
          </view>

          <!-- 右侧箭头 -->
          <view class="arrow">
            <text class="arrow-icon">></text>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="filteredChatList.length === 0" class="empty-state">
          <text class="empty-icon">💬</text>
          <text class="empty-text">{{ searchKeyword ? '没有找到相关聊天记录' : '暂无聊天记录' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import md5 from 'md5'

export default {
  data() {
    return {
      navBarHeight: 88,
      searchKeyword: '',
      chatList: [],
      defaultAvatar: 'https://ccpt.qiniu.0871.cn/duihua2.svg'
    }
  },
  computed: {
    filteredChatList() {
      if (!this.searchKeyword) {
        return this.chatList
      }
      return this.chatList.filter(chat => {
        return chat.title.includes(this.searchKeyword) ||
               chat.last_message.includes(this.searchKeyword)
      })
    }
  },
  onLoad() {
    // 计算导航栏高度
    const systemInfo = uni.getSystemInfoSync()
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
    this.navBarHeight = menuButtonInfo.bottom + 12
  },
  onShow() {
    // 每次显示页面时刷新聊天列表
    this.loadChatList()
  },
  methods: {

    // 加载聊天列表
    async loadChatList() {
      try {
        // 获取用户信息
        const riderUserInfo = uni.getStorageSync('riderUserInfo')
        if (!riderUserInfo) {
          console.log('用户未登录')
          return
        }

        // 构建签名
        const signStr = `service_member_id=${riderUserInfo.id}&phone_number=${riderUserInfo.phone}`;
        const sign = md5(signStr);

        // 构建请求参数
        const params = {
          service_member_id: riderUserInfo.id,
          sign: 'chongchong',
          timestamp: Math.floor(Date.now() / 1000)
        };

        const res = await uni.request({
          url: 'https://ccpt.0871.cn/api/service/chatroom/list',
          method: 'POST',
          data: params,
          header: {
            'Content-Type': 'application/json'
          }
        })

        if (res.data.data) {
          // 使用返回数据中的chat_unread_count数组
          const chatUnreadCount = res.data.data || []

          // 将chat_unread_count数组转换为聊天列表格式
          this.chatList = chatUnreadCount.map(item => ({
            room_id: item.room_id,
			title: `${item.task[0].city_name}${item.task[0].district_name} ${item.room_id}`,
            last_message: '点击查看聊天记录',
            last_message_time: new Date(item.last_message_time).getTime(),
            unread_count: item.message_count,
            avatar: this.defaultAvatar,
            user_id: item.user_id,
            user_type: item.user_type
          }))

          console.log('聊天列表加载成功:', this.chatList.length, '个聊天室')
        } else {
          console.log('获取聊天列表失败:', res.data.message)
        }
      } catch (error) {
        console.error('加载聊天列表出错:', error)
      }
    },

    // 搜索
    onSearch() {
      // 搜索逻辑已在computed中处理
    },

    // 进入聊天室
    enterChat(chat) {
		console.log(chat,"123")
      uni.navigateTo({
        url: `/adminEnd/chatManage/chat-simple?room_id=${chat.room_id}&user_id=${chat.user_id}&user_type=${chat.user_type}&title=${encodeURIComponent(chat.title || '订单协办')}`
      })
    },

    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return ''

      const now = Date.now()
      const diff = now - timestamp
      const date = new Date(timestamp)

      if (diff < 1000 * 60) {
        return '刚刚'
      } else if (diff < 1000 * 60 * 60) {
        return `${Math.floor(diff / (1000 * 60))}分钟前`
      } else if (diff < 1000 * 60 * 60 * 24) {
        return `${Math.floor(diff / (1000 * 60 * 60))}小时前`
      } else if (diff < 1000 * 60 * 60 * 24 * 7) {
        return `${Math.floor(diff / (1000 * 60 * 60 * 24))}天前`
      } else {
        return `${date.getMonth() + 1}/${date.getDate()}`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx; // 为底部导航留出空间
}

.content {
  padding: 0 20rpx;
}

.search-section {
  padding: 20rpx 0;

  .search-box {
    background-color: #fff;
    border-radius: 24rpx;
    padding: 16rpx 20rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

    .search-icon {
      width: 32rpx;
      height: 32rpx;
      margin-right: 16rpx;
    }

    .search-input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }
  }
}

.chat-list {
  .chat-item {
    background-color: #fff;
    margin-bottom: 16rpx;
    border-radius: 12rpx;
    padding: 24rpx 20rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

    .avatar {
      position: relative;
      margin-right: 20rpx;

      .avatar-icon {
        width: 70rpx;
        height: 70rpx;
        border-radius: 50%;
      }

      .unread-badge {
        position: absolute;
        top: -8rpx;
        right: -8rpx;
        background-color: #ff4d4f;
        border-radius: 20rpx;
        min-width: 32rpx;
        height: 32rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        .unread-text {
          color: #fff;
          font-size: 20rpx;
          padding: 0 8rpx;
        }
      }
    }

    .chat-info {
      flex: 1;

      .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8rpx;

        .chat-title {
          font-size: 32rpx;
          font-weight: 500;
          color: #333;
        }

        .chat-time {
          font-size: 24rpx;
          color: #999;
        }
      }

      .chat-preview {
        .last-message {
          font-size: 28rpx;
          color: #666;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }

    .arrow {
      margin-left: 16rpx;

      .arrow-icon {
        font-size: 28rpx;
        color: #ccc;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;

  .empty-icon {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 32rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
