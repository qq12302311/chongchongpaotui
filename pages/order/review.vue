<template>
  <view class="review-page">
    <!-- 导航栏 -->
    <nav-bar title="服务评价" :show-back="true"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 评价内容 -->
    <view class="review-content">
      <!-- 评价标题 -->
      <view class="review-header">
        <view class="header-icon-wrapper">
          <text class="header-star-icon">⭐</text>
        </view>
        <text class="header-title">请为本次服务评价</text>
        <text class="header-subtitle">请给充充小哥一些鼓励和建议吧！我们努力做更好！</text>
      </view>

      <!-- 星级评分 -->
      <view class="rating-section">
        <view class="stars">
          <view
            v-for="(star, index) in 5"
            :key="index"
            class="star"
            :class="{ active: index < rating }"
            @click="setRating(index + 1)"
          >
            <text class="star-icon">★</text>
          </view>
        </view>
        <text class="rating-text">{{ ratingTexts[rating - 1] || '请选择评分' }}</text>
      </view>

      <!-- 评价标签 -->
      <view class="tags-section">
        <text class="section-title">选择标签（可多选）</text>
        <view class="tags-grid">
          <view
            v-for="(tag, index) in availableTags"
            :key="index"
            class="tag-item"
            :class="{ active: selectedTags.includes(tag.value) }"
            @click="toggleTag(tag.value)"
          >
            <text>{{ tag.label }}</text>
          </view>
        </view>
      </view>

      <!-- 评价内容 -->
      <view class="comment-section">
        <text class="section-title">评价内容</text>
        <textarea
          v-model="comment"
          class="comment-input"
          placeholder="请录入您的评价、建议和高见!我们会积极听取，不断优化充充跑腿服务能力，为您持续提供更好服务!"
          maxlength="200"
          :show-confirm-bar="false"
        ></textarea>
        <text class="char-count">{{ comment.length }}/200</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <button class="submit-btn" :disabled="rating === 0" @click="submitReview">
        提交评价
      </button>
    </view>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import md5 from 'md5'

export default {
  components: {
    NavBar
  },
  data() {
    return {
      taskId: '',
      rating: 0,
      selectedTags: [],
      comment: '',
      ratingTexts: [
        '非常不满意',
        '不满意',
        '一般',
        '满意',
        '非常满意'
      ],
      availableTags: [
        { label: '我非常满意', value: '我非常满意' },
        { label: '超出预期', value: '超出预期' },
        { label: '性价比高', value: '性价比高' },
        { label: '准时高效', value: '准时高效' },
        { label: '服务专业', value: '服务专业' },
        { label: '我愿再下单', value: '我愿再下单' },
        { label: '愿推荐他人使用', value: '愿推荐他人使用' }
      ]
    }
  },
  onLoad(options) {
    this.taskId = options.task_id || ''
    if (!this.taskId) {
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },
  methods: {
    // 设置评分
    setRating(rating) {
      this.rating = rating
    },

    // 切换标签选择
    toggleTag(tagValue) {
      const index = this.selectedTags.indexOf(tagValue)
      if (index > -1) {
        this.selectedTags.splice(index, 1)
      } else {
        this.selectedTags.push(tagValue)
      }
    },

    // 提交评价
    async submitReview() {
      if (this.rating === 0) {
        uni.showToast({
          title: '请选择评分',
          icon: 'none'
        })
        return
      }

      try {
        // 获取用户信息
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.user_id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }

        // 构建请求参数
        const timestamp = Math.floor(Date.now() / 1000)
        const params = {
          task_id: parseInt(this.taskId),
          user_id: userInfo.user_id,
          rating: this.rating,
          tags: this.selectedTags,
          comment: this.comment.trim(),
          timestamp: timestamp,
          sign: 'chongchong'
        }

        uni.showLoading({
          title: '提交中...'
        })

        const res = await this.$request('task/review', params, 'POST')
        uni.hideLoading()

        if (res.status === 'success') {
          uni.showToast({
            title: '评价成功',
            icon: 'success'
          })

          // 延迟返回订单列表
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/order/order'
            })
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '评价失败',
            icon: 'none'
          })
        }
      } catch (err) {
        uni.hideLoading()
        console.error('提交评价失败:', err)
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.review-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: calc(100rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
}

.review-content {
  padding: 20rpx;
}

.review-header {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 40rpx 30rpx;
  text-align: center;
  margin-bottom: 20rpx;

  .header-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20rpx;
  }

  .header-star-icon {
    font-size: 50rpx;
    color: #FFD700;
    line-height: 1;
    text-shadow: 0 2rpx 4rpx rgba(255, 215, 0, 0.3);
  }

  .header-title {
    display: block;
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 10rpx;
  }

  .header-subtitle {
    display: block;
    font-size: 24rpx;
    color: #999;
  }
}

.rating-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  text-align: center;
  margin-bottom: 20rpx;

  .stars {
    display: flex;
    justify-content: center;
    margin-bottom: 20rpx;

    .star {
      margin: 0 10rpx;

      .star-icon {
        font-size: 60rpx;
        color: #ddd;
        transition: color 0.3s ease;
      }

      &.active .star-icon {
        color: #FFD700;
      }
    }
  }

  .rating-text {
    font-size: 28rpx;
    color: #666;
  }
}

.tags-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 20rpx;
  }

  .tags-grid {
    display: flex;
    flex-wrap: wrap;
    margin: -10rpx;

    .tag-item {
      margin: 10rpx;
      padding: 16rpx 24rpx;
      background-color: #f5f5f5;
      border-radius: 30rpx;
      border: 2rpx solid transparent;
      transition: all 0.3s ease;

      text {
        font-size: 26rpx;
        color: #666;
      }

      &.active {
        background-color: rgba(36, 146, 242, 0.1);
        border-color: #2492F2;

        text {
          color: #2492F2;
        }
      }
    }
  }
}

.comment-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 20rpx;
  }

  .comment-input {
    width: 100%;
    min-height: 200rpx;
    padding: 20rpx;
    background-color: #f9f9f9;
    border-radius: 8rpx;
    font-size: 28rpx;
    color: #333;
    line-height: 1.5;
    box-sizing: border-box;
  }

  .char-count {
    display: block;
    text-align: right;
    font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
  }
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);

  .submit-btn {
    width: 100%;
    height: 80rpx;
    background-color: #2492F2;
    color: #fff;
    font-size: 32rpx;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;

    &:disabled {
      background-color: #ccc;
      color: #999;
    }
  }
}
</style>
