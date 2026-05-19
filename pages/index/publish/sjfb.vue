<template>
  <view class="container">
    <nav-bar :title="selectedCity || '商机发布'" title-align="center"></nav-bar>

    <view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
      <!-- 商机信息 -->
      <view class="info-card">
        <view class="section-title">商机信息</view>

        <!-- 点位业态 -->
        <view class="form-item">
          <view class="label" style="flex: 1;">
            <text class="required">*</text>点位业态
          </view>
          <!-- 详情模式：纯文本展示 -->
          <view v-if="formData.id" class="detail-text">
            {{ formData.industry || '未填写' }}
          </view>
          <!-- 编辑模式：选择器 -->
          <picker v-else mode="selector" :range="industryList" v-model="formData.industry" @change="onIndustryChange">
            <view class="picker-view">
              <text class="picker-text">{{ formData.industry || '如：便利店' }}</text>
              <image class="arrow" src="https://ccpt.qiniu.cc111.cn/publish/right.png"></image>
            </view>
          </picker>
        </view>

        <!-- 点位名称 -->
        <view class="form-item">
          <view class="label" style="min-width: 82px;">
            <text class="required">*</text>点位名称
          </view>
          <!-- 详情模式 -->
          <view v-if="formData.id" class="detail-text">
            {{ formData.storeName || '未填写' }}
          </view>
          <!-- 编辑模式 -->
          <view v-else class="input-wrapper">
            <input v-model="formData.storeName" placeholder="买家付款后可见" />
            <image class="edit-icon" src="https://ccpt.qiniu.cc111.cn/publish/edit.png"></image>
          </view>
        </view>

        <!-- 地址详情 -->
        <view class="form-item">
          <view class="label">
            <text class="required">*</text>地址详情
          </view>
          <!-- 详情模式 -->
          <view v-if="formData.id" class="detail-text">
            {{ formData.address || '未填写' }}
          </view>
          <!-- 编辑模式 -->
          <view v-else class="input-wrapper" @click="handleAddressSelect">
            <text class="input-text">{{ formData.address || '买家付款后可见' }}</text>
            <image class="map-icon" src="https://ccpt.qiniu.cc111.cn/publish/location.png"></image>
          </view>
        </view>

        <!-- 品牌要求 -->
        <view class="form-item">
          <view class="label" style="flex: 1;">
            <text class="required">*</text>品牌要求
          </view>
          <!-- 详情模式 -->
          <view v-if="formData.id" class="detail-text">
            {{ formData.brand || '未填写' }}
          </view>
          <!-- 编辑模式 -->
          <picker v-else mode="selector" :range="brandList" v-model="formData.brand" @change="onBrandChange">
            <view class="picker-view">
              <text class="picker-text">{{ formData.brand || '请选择' }}</text>
              <image class="arrow" src="https://ccpt.qiniu.cc111.cn/publish/right.png"></image>
            </view>
          </picker>
        </view>
      </view>

      <!-- 商机联系 -->
      <view class="info-card">
        <view class="section-title">商机联系</view>

        <!-- 对接人姓 -->
        <view class="form-item">
          <view class="label">
            <text class="required">*</text>对接人姓
          </view>
          <view v-if="formData.id" class="detail-text">
            {{ formData.contact_name || '未填写' }}
          </view>
          <view v-else class="input-wrapper">
            <input v-model="formData.contact_name" placeholder="买家付款后可见" />
            <image class="edit-icon" src="https://ccpt.qiniu.cc111.cn/publish/edit.png"></image>
          </view>
        </view>

        <!-- 联系电话 -->
        <view class="form-item">
          <view class="label">
            <text class="required">*</text>联系电话
          </view>
          <view v-if="formData.id" class="detail-text">
            {{ formData.phone || '未填写' }}
          </view>
          <view v-else class="input-wrapper">
            <input v-model="formData.phone" placeholder="买家付款后可见" />
            <image class="edit-icon" src="https://ccpt.qiniu.cc111.cn/publish/edit.png"></image>
          </view>
        </view>

        <!-- 对接身份 -->
        <view class="form-item">
          <view class="label" style="flex: 1;">
            <text class="required">*</text>对接身份
          </view>
          <view v-if="formData.id" class="detail-text">
            {{ formData.role || '未填写' }}
          </view>
          <picker v-else mode="selector" :range="roleList" v-model="formData.role" @change="onRoleChange">
            <view class="picker-view">
              <text class="picker-text">{{ formData.role || '如：店长' }}</text>
              <image class="arrow" src="https://ccpt.qiniu.cc111.cn/publish/right.png"></image>
            </view>
          </picker>
        </view>
      </view>

      <!-- 商机描述（选填） -->
      <view class="info-card">
        <view class="section-title-row">
          <view class="section-title">商机描述</view>
          <view class="optional-tag">选填</view>
          <view class="desc-tip">周边环境展示，增加吸引力</view>
        </view>

        <!-- 图片上传 -->
        <!-- 详情模式：展示图片 -->
        <view v-if="formData.id" class="upload-area"">
          <view v-for="(item, index) in formData.images" :key="index" class="upload-box">
            <image :src="item" mode="widthFix" class="preview-image" style="width: 100%;"></image>
          </view>
        </view>
        <!-- 编辑模式：上传入口 -->
        <view v-else class="upload-area">
          <view v-for="(item, index) in images" :key="index" class="upload-box">
            <image :src="item" mode="widthFix" class="preview-image" style="width: 100%;"></image>
            <view class="delete-icon" @click.stop="deleteImage(index)">×</view>
          </view>
          <view class="upload-box" v-if="images.length < 3" @click="uploadImage">
            <image src="https://ccpt.qiniu.cc111.cn/publish/add.png" class="add-icon"></image>
            <text class="upload-text">最多可传3张图</text>
          </view>
        </view>

        <!-- 描述文本框 -->
        <view class="textarea-wrapper">
          <!-- 详情模式 -->
          <view v-if="formData.id" class="detail-text">
            {{ formData.description || '未填写描述' }}
          </view>
          <!-- 编辑模式 -->
          <textarea
            v-else
            v-model="formData.description"
            placeholder="对该商机详情进一步说明，避免信息误解，增强吸引力，促进交易！"
            maxlength="200"
            class="description-textarea"
          ></textarea>
          <view v-if="!formData.id" class="char-count">{{ formData.description.length }}/200字</view>
        </view>
      </view>

      <!-- 底部提交栏（只有无id时显示） -->
      <view class="submit-bar" v-if="!formData.id">
        <view class="price-area">
          <view class="price-title">
            <text>商机索价</text>
            <text class="price-tip">付款后可见商机详情</text>
          </view>
          <view class="price-input">
            <view class="btn" @click="decreasePrice">-</view>
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ formData.price }}</text>
            <view class="btn" @click="increasePrice">+</view>
          </view>
        </view>
        <button class="submit-btn" @click="submitBusiness">提交商机</button>
      </view>
    </view>
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
      images: [],
      navBarHeight: 0,
      selectedCity: '',
      // 下拉选项数据
	  industryList: ['便利店/药店', '酒店民宿', '网咖电竞', 'KTV/酒吧', '餐饮', '饮品', '景区/游乐场', 
	  	'交通枢纽', '医院', '公寓写字楼', '美业', '棋牌茶楼', '健身体育馆', '行政服务', '其他(手填)'],

      	brandList: ['无要求', '美团', '怪兽', '街电', '小电', '其他'],
	 	roleList: ['老板', '店长', '店员', '股东', '其他'],

      // 表单数据
      formData: {
        industry: '',
        storeName: '',
        address: '',
        brand: '',
        contact_name: '',
        phone: '',
        role: '',
        description: '',
        price: 30,
        images: []
      }
    }
  },
  onLoad(options) {
    if (options.id) {
      this.$request('business/info', {id: options.id}, 'POST').then(res => {
        this.formData = {
          ...res.data,
          images: res.data.image.split(',')
        }
      })
      // this.formData.id = options.id
    }

    const systemInfo = uni.getSystemInfoSync()
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
    this.navBarHeight = menuButtonInfo.bottom + 12
    this.selectedCity = uni.getStorageSync('selectedCity') || ''
  },
  methods: {
    deleteImage(index) {
      this.images.splice(index, 1)
    },
    uploadImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed', 'original'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          uni.uploadFile({
            url: 'https://tixian.cc111.cn/upload/qiniuImageUpload', // 服务器上传接口地址
            filePath: res.tempFilePaths[0],
            name: 'image', // 必须填写，后台用来接收文件
            formData: {
              'spaceName': 'chongchongpaotui' // 其他要上传的参数
            },
            success: (uploadFileRes) => {
              const res = JSON.parse(uploadFileRes.data)
              this.images.push(res.path)
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
        fail: (error) => {
          console.error('选择图片失败:', error);
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },




    // 下拉选择事件
    onIndustryChange(e) {
      this.formData.industry = this.industryList[e.detail.value]
    },
    onBrandChange(e) {
      this.formData.brand = this.brandList[e.detail.value]
    },
    onRoleChange(e) {
      this.formData.role = this.roleList[e.detail.value]
    },
    // 地址选择
    handleAddressSelect() {
      uni.navigateTo({
        url: '/pages/index/publish/map/index?type=address'
      })
    },
    // 图片上传
    chooseImage() {
      uni.chooseImage({
        count: 3 - this.formData.images.length,
        success: (res) => {
          this.formData.images = [...this.formData.images, ...res.tempFilePaths]
        }
      })
    },
    // 价格增减
    decreasePrice() {
      if (this.formData.price > 1) {
        this.formData.price--
      }
    },
    increasePrice() {
      this.formData.price++
    },
    // 提交商机
    submitBusiness() {
		// 提交商机
		const userInfo = uni.getStorageSync('userInfo');
		console.log(userInfo)

		this.$request('business/create', {
			...this.formData,
			user_id: userInfo.user_id,
      images: this.images.join(',')
		}, 'POST').then(res => {
			console.log(res)
			if (res.code !== 200) {
				uni.showToast({
					title: res.message[0],
					icon: 'error'
				})
				return	
			}
			uni.showToast({
				title: '商机提交成功',
				icon: 'success'
			})

			// 3秒后返回上一页
			setTimeout(() => {
				uni.navigateBack()
			}, 3000)
		})
	  console.log(this.formData)
      
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
.content {
  padding: 20rpx;
  padding-bottom: 200rpx;
}
.info-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  position: relative;
  padding-left: 16rpx;
  margin-bottom: 30rpx;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6rpx;
    height: 30rpx;
    background-color: #1F91F1;
    border-radius: 3rpx;
  }
}
.section-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  .section-title {
    margin: 0;
    padding: 0;
    &::before {
      display: none;
    }
  }
  .optional-tag {
    background: #1F91F1;
    color: #fff;
    font-size: 20rpx;
    padding: 4rpx 8rpx;
    border-radius: 6rpx;
    margin-left: 10rpx;
  }
  .desc-tip {
    font-size: 24rpx;
    color: #999;
    margin-left: 10rpx;
  }
}
.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
  &:last-child {
    border-bottom: none;
  }
  .label {
    width: 200rpx;
    font-size: 28rpx;
    color: #333;
    .required {
      color: #ff4d4f;
      margin-right: 4rpx;
    }
  }
  .picker-view {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .picker-text {
      font-size: 28rpx;
      color: #333;
    }
    .arrow {
      width: 24rpx;
      height: 24rpx;
    }
  }
  .detail-text {
    font-size: 30rpx;
    text-align: right;
  }
  .input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    input, .input-text {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      text-align: right;
    }
    .edit-icon, .map-icon {
      width: 28rpx;
      height: 28rpx;
      margin-left: 10rpx;
    }
  }
}
.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
  .upload-box {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .add-icon {
      width: 40rpx;
      height: 40rpx;
      margin-bottom: 10rpx;
    }
    .upload-text {
      font-size: 24rpx;
      color: #999;
    }

    .delete-icon {
      position: absolute;
      top: 0;
      right: 0;
      width: 40rpx;
      height: 40rpx;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 30rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
.textarea-wrapper {
  position: relative;
  .description-textarea {
    width: 100%;
    min-height: 160rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 26rpx;
    box-sizing: border-box;
  }
  .char-count {
    position: absolute;
    right: 20rpx;
    bottom: 20rpx;
    font-size: 24rpx;
    color: #999;
  }
}
.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  .price-area {
    flex: 1;
    .price-title {
      display: flex;
      align-items: center;
      .price-tip {
        color: #ff4d4f;
        font-size: 24rpx;
        margin-left: 10rpx;
      }
    }
    .price-input {
      display: flex;
      align-items: center;
      margin-top: 10rpx;
      .btn {
        width: 60rpx;
        height: 60rpx;
        background: #f5f5f5;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
      }
      .price-symbol {
        font-size: 32rpx;
        color: #ff4d4f;
        margin: 0 10rpx;
      }
      .price-value {
        font-size: 40rpx;
        color: #ff4d4f;
        font-weight: bold;
      }
    }
  }
  .submit-btn {
    width: 240rpx;
    height: 80rpx;
    background: #1F91F1;
    color: #fff;
    border-radius: 40rpx;
    font-size: 30rpx;
    font-weight: bold;
  }
}
</style>