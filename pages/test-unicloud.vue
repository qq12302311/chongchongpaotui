<template>
  <view class="container">
    <view class="title">uniCloud连接测试</view>
    <button @click="testConnection" class="test-btn">测试连接</button>
    <view class="result">{{ result }}</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      result: '点击按钮测试连接'
    }
  },
  methods: {
    async testConnection() {
      try {
        this.result = '连接中...';
        
        // 测试云函数调用
        const res = await uniCloud.callFunction({
          name: 'send-sms',
          data: {
            phone_number: '13800138000'
          }
        });
        
        this.result = '连接成功！' + JSON.stringify(res);
      } catch (error) {
        this.result = '连接失败：' + error.message;
        console.error('uniCloud连接测试失败:', error);
      }
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.test-btn {
  background-color: #007aff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.result {
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
  word-break: break-all;
}
</style>
