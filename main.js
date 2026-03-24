// 定义请求函数
const request = (urlSuffix, params = {}, method = 'GET') => {
  const baseUrl = 'https://ccpt.cc111.cn/api/';
  const url = baseUrl + urlSuffix;
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      data: params,
      method,
      success: (res) => resolve(res.data),
      fail: (err) => reject(err)
    })
  })
}

import Vue from 'vue'
import App from './App'
import userMixin from './mixins/userMixin'

// 注册全局混入
Vue.mixin(userMixin)

// 将request函数挂载到Vue原型上
Vue.prototype.$request = request

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()

// #ifndef VUE3
import './uni.promisify.adaptor'

// #endif



// #ifdef VUE3
import { createSSRApp } from 'vue'
import uviewPlus from 'uview-plus'

export function createApp() {
  const app = createSSRApp(App)
  app.use(uviewPlus)
  return {
    app
  }
}

// #endif