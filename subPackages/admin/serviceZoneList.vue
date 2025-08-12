<template>
  <view class="service-zone-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="服务区域列表" title-align="center"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder" :style="{ height: navBarHeight + 'px' }"></view>

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 服务区域列表 -->
      <view class="zone-list">
        <view v-if="loading" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>

        <view v-else-if="zoneList.length === 0" class="empty-state">
          <view class="empty-icon"></view>
          <text class="empty-text">暂无服务区域</text>
          <text class="empty-subtext">点击上方按钮添加服务区域</text>
        </view>

        <view v-else class="zone-items">
          <!-- 按省份分组显示 -->
          <view class="province-card" v-for="(province, provinceIndex) in zoneList" :key="provinceIndex">
            <!-- 省份标题 -->
            <view class="province-header" @click="toggleProvince(province.province_id)">
              <view class="province-icon"></view>
              <text class="province-title">{{ province.province }}</text>
              <view class="expand-icon" :class="{ expanded: isProvinceExpanded(province.province_id) }"></view>
            </view>

            <!-- 城市列表 -->
            <view class="city-list" v-if="isProvinceExpanded(province.province_id)">
              <view class="city-item" v-for="(city, cityIndex) in province.cities" :key="cityIndex">
                <!-- 城市标题 -->
                <view class="city-header" @click="toggleCity(province.province_id, city.city_id)">
                  <view class="city-icon"></view>
                  <text class="city-title">{{ city.city }}</text>
                  <view class="expand-icon" :class="{ expanded: isCityExpanded(province.province_id, city.city_id) }"></view>
                </view>

                <!-- 区县列表 -->
                <view class="district-list" v-if="isCityExpanded(province.province_id, city.city_id)">
                  <view class="district-item" v-for="(district, districtIndex) in city.districts" :key="districtIndex">
                    <view class="district-info">
                      <view class="district-name">{{ district.district }}</view>
                     <!-- <view class="district-coordinates">
                        <text class="coordinates-label">经度: </text>
                        <text class="coordinates-value">{{ district.longitude }}</text>
                        <text class="coordinates-separator">  |  </text>
                        <text class="coordinates-label">纬度: </text>
                        <text class="coordinates-value">{{ district.latitude }}</text>
                      </view> -->
                    </view>
                    <view class="district-actions">
                      <view class="action-btn delete" @click="deleteDistrict(province, city, district)">删除</view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 悬浮添加按钮 -->
    <view class="floating-add-btn" @click="showAddZoneForm">
      <view class="add-icon">+</view>
    </view>

    <!-- 添加/编辑服务区域表单 -->
    <view class="modal-mask" v-if="showZoneForm" @click="closeZoneForm"></view>
    <view class="zone-form-modal" v-if="showZoneForm">
      <view class="modal-header">
        <text class="modal-title">{{ isEditing ? '编辑服务区域' : '添加服务区域' }}</text>
        <view class="modal-close" @click="closeZoneForm">×</view>
      </view>

      <view class="modal-content">
        <view class="form-group">
          <!-- 省份、城市一行显示 -->
          <view class="form-row">
            <view class="form-item half">
              <text class="form-label required">省份</text>
              <input type="text" v-model="zoneForm.province" placeholder="请输入省份" class="form-input" />
            </view>
            <view class="form-item half">
              <text class="form-label required">城市</text>
              <input type="text" v-model="zoneForm.city" placeholder="请输入城市" class="form-input" />
            </view>
          </view>

          <view class="form-item">
            <text class="form-label required">区县</text>
            <input type="text" v-model="zoneForm.district" placeholder="请输入区县" class="form-input" />
          </view>

          <!-- 经度、纬度一行显示 -->
          <view class="form-row">
            <view class="form-item half">
              <text class="form-label required">经度</text>
              <input type="text" v-model="zoneForm.longitude" placeholder="请输入经度" class="form-input" />
            </view>
            <view class="form-item half">
              <text class="form-label required">纬度</text>
              <input type="text" v-model="zoneForm.latitude" placeholder="请输入纬度" class="form-input" />
            </view>
          </view>
        </view>

        <view class="form-actions">
          <view class="form-btn cancel" @click="closeZoneForm">取消</view>
          <view class="form-btn submit" :class="{ disabled: formSubmitting }" @click="submitZoneForm">
            {{ formSubmitting ? '提交中...' : '确认' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      navBarHeight: 0,
      // 服务区域相关数据
      showZoneForm: false,
      isEditing: false,
      loading: false,
      formSubmitting: false,
      zoneList: [],
      // 展开状态管理
      expandedProvinces: {}, // 省份展开状态
      expandedCities: {}, // 城市展开状态

      zoneForm: {
        province: '',
        city: '',
        district: '',
        latitude: '',
        longitude: ''
      },
      currentZone: null
    }
  },
  onLoad() {
    // 计算导航栏高度
    const systemInfo = uni.getSystemInfoSync();
    // 状态栏高度
    const statusBarHeight = systemInfo.statusBarHeight || 0;
    // 导航栏高度（根据不同平台可能有所不同）
    const navBarHeight = systemInfo.platform === 'ios' ? 44 : 48;
    // 设置导航栏占位高度
    this.navBarHeight = statusBarHeight + navBarHeight;
  },
  onShow() {
    this.loadZoneList();
  },
  methods: {
    // 显示添加服务区域表单
    showAddZoneForm() {
      this.isEditing = false;

      // 获取上次保存的省份和城市信息
      const lastZoneInfo = this.getLastZoneInfo();

      this.zoneForm = {
        province: lastZoneInfo.province || '',
        city: lastZoneInfo.city || '',
        district: '',
        latitude: '',
        longitude: ''
      };

      this.showZoneForm = true;
    },

    // 获取上次保存的省份和城市信息
    getLastZoneInfo() {
      try {
        const lastZoneInfo = uni.getStorageSync('lastZoneInfo');
        return lastZoneInfo || {};
      } catch (error) {
        console.error('获取上次区域信息失败:', error);
        return {};
      }
    },

    // 保存省份和城市信息
    saveLastZoneInfo(province, city) {
      try {
        const zoneInfo = {
          province: province,
          city: city,
          saveTime: new Date().getTime()
        };
        uni.setStorageSync('lastZoneInfo', zoneInfo);
        console.log('保存区域信息成功:', zoneInfo);
      } catch (error) {
        console.error('保存区域信息失败:', error);
      }
    },

    // 切换省份展开状态
    toggleProvince(provinceId) {
      this.expandedProvinces = {
        ...this.expandedProvinces,
        [provinceId]: !this.expandedProvinces[provinceId]
      };
    },

    // 切换城市展开状态
    toggleCity(provinceId, cityId) {
      const key = `${provinceId}-${cityId}`;
      this.expandedCities = {
        ...this.expandedCities,
        [key]: !this.expandedCities[key]
      };

      // 如果展开城市，确保其所属省份也展开
      if (!this.expandedProvinces[provinceId] && this.expandedCities[key]) {
        this.expandedProvinces = {
          ...this.expandedProvinces,
          [provinceId]: true
        };
      }
    },

    // 检查省份是否展开
    isProvinceExpanded(provinceId) {
      return !!this.expandedProvinces[provinceId];
    },

    // 检查城市是否展开
    isCityExpanded(provinceId, cityId) {
      const key = `${provinceId}-${cityId}`;
      return !!this.expandedCities[key];
    },

    // 删除区县
    deleteDistrict(province, city, district) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除 ${province.province} ${city.city} ${district.district} 吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              // 获取用户信息
              const userInfo = uni.getStorageSync('riderUserInfo') || {};
              if (!userInfo.id) {
                uni.showToast({
                  title: '请先登录',
                  icon: 'none'
                });
                return;
              }

              // 构建请求参数
              const params = {
                service_member_id: userInfo.id,
                service_zone_id: district.id, // 使用id参数
                sign: 'chongchong',
                delete_region: true
              };

              // 显示加载中
              uni.showLoading({
                title: '删除中...',
                mask: true
              });

              // 发送请求
              const res = await this.$request('service/group/zone/delete', params, 'POST');

              // 隐藏加载中
              uni.hideLoading();

              if (res.code === 200) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                });

                // 刷新列表
                this.loadZoneList();
              } else {
                uni.showToast({
                  title: res.msg || '删除失败',
                  icon: 'none'
                });
              }
            } catch (err) {
              console.error('删除服务区域失败:', err);
              uni.hideLoading();
              uni.showToast({
                title: '网络请求失败',
                icon: 'none'
              });
            }
          }
        }
      });
    },

    // 关闭服务区域表单
    closeZoneForm() {
      this.showZoneForm = false;
    },

    // 加载服务区域列表
    async loadZoneList() {
      this.loading = true;
      try {
        // 获取用户信息
        const userInfo = uni.getStorageSync('riderUserInfo') || {};
        if (!userInfo.id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          this.loading = false;
          return;
        }

        // 构建请求参数
        const params = {
			service_provider_id : 1,
			service_member_id : userInfo.id,
          sign: 'chongchong'
        };

        // 发送请求 - 使用service/zone接口获取服务区域数据
        const res = await this.$request('service/group/zones', params, 'POST');

        if (res.status === 'success' && res.data) {
          // 处理服务区域数据
          this.zoneList = this.processZoneData(res.data.service_zones) || [];
        } else {
          uni.showToast({
            title: res.msg || '获取服务区域列表失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('获取服务区域列表失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 处理服务区域数据
    processZoneData(data) {
      // 按省份分组的数据结构
      const groupedByProvince = {};

      try {
        // 确保数据是数组
        if (Array.isArray(data)) {
          // 遍历服务区域数组
          data.forEach(zone => {
            const provinceId = zone.province_id;
            const provinceName = zone.province_name || '';
            const cityId = zone.city_id;
            const cityName = zone.city_name || '';
            const districtId = zone.district_id;
            const districtName = zone.district_name || '';

            // 如果这个省份不存在，创建它
            if (!groupedByProvince[provinceId]) {
              groupedByProvince[provinceId] = {
                province: provinceName,
                province_id: provinceId,
                cities: {}
              };
            }

            // 如果这个城市不存在，创建它
            if (!groupedByProvince[provinceId].cities[cityId]) {
              groupedByProvince[provinceId].cities[cityId] = {
                city: cityName,
                city_id: cityId,
                districts: []
              };
            }

            // 添加区县到对应的城市
            groupedByProvince[provinceId].cities[cityId].districts.push({
              district: districtName,
              district_id: districtId,
              latitude: zone.latitude,
              longitude: zone.longitude,
              id: zone.id // 直接使用id字段，用于删除操作
            });
          });
        }



        // 将分组数据转换为数组，并将城市对象转换为数组
        const result = Object.values(groupedByProvince).map(province => {
          return {
            ...province,
            cities: Object.values(province.cities)
          };
        });

        return result;
      } catch (error) {
        console.error('处理服务区域数据失败:', error);
        return [];
      }
    },

    // 提交服务区域表单
    async submitZoneForm() {
      // 表单验证
      if (!this.zoneForm.province) {
        uni.showToast({
          title: '请输入省份',
          icon: 'none'
        });
        return;
      }

      if (!this.zoneForm.city) {
        uni.showToast({
          title: '请输入城市',
          icon: 'none'
        });
        return;
      }

      if (!this.zoneForm.district) {
        uni.showToast({
          title: '请输入区县',
          icon: 'none'
        });
        return;
      }

      if (!this.zoneForm.latitude) {
        uni.showToast({
          title: '请输入纬度',
          icon: 'none'
        });
        return;
      }

      if (!this.zoneForm.longitude) {
        uni.showToast({
          title: '请输入经度',
          icon: 'none'
        });
        return;
      }

      this.formSubmitting = true;
      try {
        // 获取用户信息
        const userInfo = uni.getStorageSync('riderUserInfo') || {};
        if (!userInfo.id) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          this.formSubmitting = false;
          return;
        }

        // 构建请求参数
        const params = {
          province: this.zoneForm.province,
          city: this.zoneForm.city,
          district: this.zoneForm.district,
          latitude: this.zoneForm.latitude,
          longitude: this.zoneForm.longitude,
          service_member_id: userInfo.id,
          service_provider_id: 1, // 添加service_provider_id参数，默认值为1
          sign: 'chongchong',
		  min_time_limit: '1',
		  max_nav_distance: '1',
        };

        // 发送请求
        const url = 'service/group/zone/add';
        const res = await this.$request(url, params, 'POST');

        if (res.code === 200) {
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          });

          // 保存省份和城市信息，供下次使用
          this.saveLastZoneInfo(this.zoneForm.province, this.zoneForm.city);

          // 关闭表单并刷新列表
          this.closeZoneForm();
          this.loadZoneList();
        } else {
          uni.showToast({
            title: res.msg || '添加失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('添加服务区域失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.formSubmitting = false;
      }
    },


  }
}
</script>

<style lang="scss" scoped>
.service-zone-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: "HarmonyOS Sans SC", "PingFang SC", sans-serif;
  color: #333;
  font-size: 28rpx;
  line-height: 1.5;
  padding-bottom: 30rpx;
}

.nav-placeholder {
  width: 100%;
  text-align: center;
}

.page-content {
  padding: 20rpx;
}

// 悬浮添加按钮
.floating-add-btn {
  position: fixed;
  right: 60rpx;
  top: 60%;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #2492F2, #1a7ad9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(36, 146, 242, 0.3);
  z-index: 99;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
    box-shadow: 0 3rpx 12rpx rgba(36, 146, 242, 0.4);
  }

  .add-icon {
    font-size: 40rpx;
    color: #fff;
    font-weight: bold;
    line-height: 1;
  }

  // 添加呼吸动画效果
  &::before {
    content: '';
    position: absolute;
    top: -5rpx;
    left: -5rpx;
    right: -5rpx;
    bottom: -5rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #2492F2, #1a7ad9);
    opacity: 0.3;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.1;
    }
    100% {
      transform: scale(1);
      opacity: 0.3;
    }
  }
}

// 服务区域列表
.zone-list {
  .loading-container {
    padding: 60rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .loading-spinner {
      width: 60rpx;
      height: 60rpx;
      border: 4rpx solid #f3f3f3;
      border-top: 4rpx solid #2492F2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16rpx;
    }

    .loading-text {
      font-size: 26rpx;
      color: #999;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }

  .empty-state {
    padding: 100rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .empty-icon {
      width: 120rpx;
      height: 120rpx;
      background-color: #f5f5f5;
      border-radius: 50%;
      margin-bottom: 20rpx;
      position: relative;

      &::before, &::after {
        content: '';
        position: absolute;
        background-color: #ddd;
      }

      &::before {
        width: 60rpx;
        height: 4rpx;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      &::after {
        width: 4rpx;
        height: 60rpx;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }

    .empty-text {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 10rpx;
    }

    .empty-subtext {
      font-size: 24rpx;
      color: #999;
    }
  }

  .zone-items {
    // 省份卡片
    .province-card {
      background-color: #fff;
      border-radius: 12rpx;
      margin-bottom: 30rpx;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
      overflow: hidden;
      border: 1rpx solid #eaeaea;

      // 省份标题
      .province-header {
        display: flex;
        align-items: center;
        padding: 24rpx 30rpx;
        background-color: #f8f9fa;
        border-bottom: 2rpx solid #e8e8e8;
        position: relative;
        cursor: pointer;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6rpx;
          height: 36rpx;
          background-color: #2492F2;
          border-radius: 0 3rpx 3rpx 0;
        }

        &:active {
          background-color: #f0f0f0;
        }

        .province-icon {
          width: 32rpx;
          height: 32rpx;
          position: relative;
          margin-right: 16rpx;
          margin-left: 10rpx;

          &::before {
            content: '';
            position: absolute;
            width: 20rpx;
            height: 20rpx;
            border: 2rpx solid #2492F2;
            border-radius: 50%;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
          }

          &::after {
            content: '';
            position: absolute;
            width: 2rpx;
            height: 12rpx;
            background-color: #2492F2;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 0 0 2rpx 2rpx;
          }
        }

        .province-title {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
          flex: 1;
        }

        .expand-icon {
          width: 24rpx;
          height: 24rpx;
          position: relative;
          transition: transform 0.3s ease;

          &::before, &::after {
            content: '';
            position: absolute;
            background-color: #999;
            border-radius: 2rpx;
          }

          &::before {
            width: 14rpx;
            height: 2rpx;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }

          &::after {
            width: 2rpx;
            height: 14rpx;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            transition: transform 0.3s ease;
          }

          &.expanded::after {
            transform: translate(-50%, -50%) rotate(90deg);
          }
        }
      }

      // 城市列表
      .city-list {
        padding: 0;

        // 城市项
        .city-item {
          margin-bottom: 0;
          border-bottom: 1rpx solid #f0f0f0;

          &:last-child {
            margin-bottom: 0;
            border-bottom: none;
          }

          // 城市标题
          .city-header {
            display: flex;
            align-items: center;
            padding: 18rpx 30rpx 18rpx 50rpx; // 左侧增加缩进
            border-bottom: 1rpx solid #f0f0f0;
            position: relative;
            cursor: pointer;

            &::before {
              content: '';
              position: absolute;
              left: 30rpx;
              top: 50%;
              transform: translateY(-50%);
              width: 10rpx;
              height: 10rpx;
              background-color: #2492F2;
              border-radius: 50%;
            }

            &:active {
              background-color: #f8f8f8;
            }

            .city-icon {
              display: none; // 隐藏原来的图标，使用::before伪元素代替
            }

            .city-title {
              font-size: 28rpx;
              font-weight: 500;
              color: #333;
              flex: 1;
            }

            .expand-icon {
              width: 20rpx;
              height: 20rpx;
              position: relative;
              margin-right: 10rpx;
              transition: transform 0.3s ease;

              &::before, &::after {
                content: '';
                position: absolute;
                background-color: #bbb;
                border-radius: 1rpx;
              }

              &::before {
                width: 12rpx;
                height: 2rpx;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }

              &::after {
                width: 2rpx;
                height: 12rpx;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                transition: transform 0.3s ease;
              }

              &.expanded::after {
                transform: translate(-50%, -50%) rotate(90deg);
              }
            }
          }

          // 区县列表
          .district-list {
            padding: 0;

            .district-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 16rpx 20rpx 16rpx 70rpx; // 左侧增加更深的缩进
              border-bottom: 1rpx solid #f5f5f5;
              position: relative;

              &::before {
                content: '•';
                position: absolute;
                left: 54rpx;
                top: 50%;
                transform: translateY(-50%);
                color: #999;
                font-size: 24rpx;
              }

              &:last-child {
                border-bottom: none;
              }

              &:hover {
                background-color: #fafafa;
              }

              .district-info {
                flex: 1;

                .district-name {
                  font-size: 26rpx;
                  font-weight: 400;
                  color: #333;
                  margin-bottom: 6rpx;
                }

                .district-coordinates {
                  font-size: 22rpx;
                  color: #666;

                  .coordinates-label {
                    color: #999;
                  }

                  .coordinates-value {
                    color: #2492F2;
                  }

                  .coordinates-separator {
                    color: #ddd;
                    margin: 0 4rpx;
                  }
                }
              }

              .district-actions {
                display: flex;
                opacity: 0.8; // 默认稍微透明一些
                transition: opacity 0.2s;

                &:hover {
                  opacity: 1; // 鼠标悬停时完全不透明
                }

                .action-btn {
                  padding: 0 16rpx;
                  height: 50rpx;
                  line-height: 50rpx;
                  border-radius: 25rpx;
                  font-size: 22rpx;
                  margin-left: 10rpx;

                  &.delete {
                    background-color: rgba(255, 77, 79, 0.08);
                    color: #ff4d4f;
                    border: 1rpx solid rgba(255, 77, 79, 0.2);
                    width: 100%;
                    text-align: center;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// 模态框遮罩
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

// 服务区域表单模态框
.zone-form-modal {
  position: fixed;
  top: 210rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-height: calc(100vh - 160rpx);
  background-color: #fff;
  border-radius: 16rpx;
  z-index: 101;
  overflow: hidden;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.1);

  .modal-header {
    padding: 24rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid #f0f0f0;

    .modal-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .modal-close {
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

  .modal-content {
    padding: 24rpx;
    max-height: calc(100vh - 260rpx);
    overflow-y: auto;

    .form-group {
      .form-row {
        display: flex;
        gap: 20rpx;
        margin-bottom: 20rpx;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .form-item {
        margin-bottom: 20rpx;

        &:last-child {
          margin-bottom: 0;
        }

        &.half {
          flex: 1;
          margin-bottom: 0;
        }

        .form-label {
          display: block;
          font-size: 26rpx;
          color: #333;
          margin-bottom: 10rpx;

          &.required::before {
            content: '*';
            color: #ff4d4f;
            margin-right: 4rpx;
          }
        }

        .form-input {
          width: 100%;
          height: 80rpx;
          border: 1rpx solid #e0e0e0;
          border-radius: 8rpx;
          padding: 0 16rpx;
          font-size: 26rpx;
          box-sizing: border-box;
        }

        .form-picker {
          width: 100%;
          height: 80rpx;
          border: 1rpx solid #e0e0e0;
          border-radius: 8rpx;
          padding: 0 16rpx;
          font-size: 26rpx;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            right: 20rpx;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-left: 10rpx solid transparent;
            border-right: 10rpx solid transparent;
            border-top: 10rpx solid #999;
          }

          .picker-value {
            color: #333;
          }
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 30rpx;

      .form-btn {
        padding: 0 30rpx;
        height: 70rpx;
        line-height: 70rpx;
        border-radius: 35rpx;
        font-size: 28rpx;
        margin-left: 20rpx;

        &.cancel {
          background-color: #f5f5f5;
          color: #666;
        }

        &.submit {
          background-color: #2492F2;
          color: #fff;

          &.disabled {
            opacity: 0.6;
          }
        }
      }
    }
  }
}
</style>
