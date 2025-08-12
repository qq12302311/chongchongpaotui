<template>
  <view class="settings-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="骑手设置" title-align="center" :showBackButton="true"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 设置列表 -->
    <view class="settings-list">
      <!-- 服务区域设置 -->
      <view class="settings-item" @click="editServiceAreas">
        <view class="settings-icon">
          <text class="emoji-icon">📍</text>
        </view>
        <view class="settings-content">
          <text class="settings-title">服务区域</text>
          <text class="settings-desc">{{ serviceAreasText }}</text>
        </view>
        <view class="settings-right">
          <image src="https://ccpt.qiniu.0871.cn/rider/xiangyou.png" mode="aspectFit" class="arrow-icon"></image>
        </view>
      </view>

      <!-- 修改密码 -->
      <view class="settings-item" @click="changePassword">
        <view class="settings-icon">
          <text class="emoji-icon">🔒</text>
        </view>
        <view class="settings-content">
          <text class="settings-title">修改密码</text>
          <text class="settings-desc">修改登录密码</text>
        </view>
        <view class="settings-right">
          <image src="https://ccpt.qiniu.0871.cn/rider/xiangyou.png" mode="aspectFit" class="arrow-icon"></image>
        </view>
      </view>
    </view>

    <!-- 编辑服务区域弹窗 -->
    <view class="modal-mask" v-if="showServiceAreaModal" @click="closeServiceAreaModal"></view>
    <view class="modal-container" v-if="showServiceAreaModal">
      <view class="modal-header">
        <text class="modal-title">编辑服务区域</text>
        <view class="modal-close" @click="closeServiceAreaModal">×</view>
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
      <view class="safe-area-bottom"></view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="closeServiceAreaModal">取消</view>
        <view class="modal-btn confirm" @click="saveServiceAreas" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </view>
      </view>
    </view>



    <!-- 修改密码弹窗 -->
    <view class="modal-mask" v-if="showPasswordModal" @click="closePasswordModal"></view>
    <view class="password-modal-container" v-if="showPasswordModal">
      <view class="modal-header">
        <text class="modal-title">修改密码</text>
        <view class="modal-close" @click="closePasswordModal">×</view>
      </view>
      <view class="modal-content">
        <view class="input-group">
          <text class="input-label">新密码</text>
          <input
            type="password"
            v-model="passwordForm.newPassword"
            placeholder="请输入新密码"
            class="input-field"
          />
        </view>
        <view class="input-group">
          <text class="input-label">确认新密码</text>
          <input
            type="password"
            v-model="passwordForm.confirmPassword"
            placeholder="请再次输入新密码"
            class="input-field"
          />
        </view>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="closePasswordModal">取消</view>
        <view class="modal-btn confirm" @click="savePassword" :disabled="passwordSaving">
          {{ passwordSaving ? '修改中...' : '确认修改' }}
        </view>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 用户信息
      userInfo: {},

      // 服务区域相关
      showServiceAreaModal: false,
      allZones: [], // 所有可用区域数据
      selectedZones: [], // 选中的区域ID数组
      selectedZoneNames: [], // 选中的区域名称数组
      expandedProvinces: {}, // 展开的省份
      expandedCities: {}, // 展开的城市
      saving: false,

      // 修改密码相关
      showPasswordModal: false,
      passwordForm: {
        newPassword: '',
        confirmPassword: ''
      },
      passwordSaving: false
    }
  },

  computed: {
    serviceAreasText() {
      // 优先显示从 riderUserInfo.zone 获取的当前服务区域
      if (this.userInfo && this.userInfo.zone && Array.isArray(this.userInfo.zone) && this.userInfo.zone.length > 0) {
        return this.formatZoneText(this.userInfo.zone);
      }

      return '未设置服务区域，点击设置';
    }
  },

  onShow() {
    this.loadUserInfo();
  },

  methods: {
    // 加载用户信息
    loadUserInfo() {
      const userInfo = uni.getStorageSync('riderUserInfo');
      if (userInfo) {
        this.userInfo = userInfo;
        console.log('当前用户信息:', userInfo);
        console.log('当前服务区域 zone:', userInfo.zone);
      }
    },

    // 格式化 zone 数据显示文本
    formatZoneText(zoneData) {
      if (!zoneData || !Array.isArray(zoneData) || zoneData.length === 0) {
        return '未设置服务区域，点击设置';
      }

      // 按城市分组统计区域
      const cityMap = new Map();

      zoneData.forEach(zone => {
        const cityKey = `${zone.province_name || zone.province || ''}-${zone.city_name || zone.city || ''}`;
        const cityName = `${zone.province_name || zone.province || ''}${zone.city_name || zone.city || ''}`;

        if (!cityMap.has(cityKey)) {
          cityMap.set(cityKey, {
            cityName: cityName,
            districts: []
          });
        }

        // 添加区县信息
        if (zone.district_name || zone.district || zone.name) {
          cityMap.get(cityKey).districts.push(zone.district_name || zone.district || zone.name);
        }
      });

      // 生成显示文本
      const cityTexts = Array.from(cityMap.values()).map(city => {
        const districtCount = city.districts.length;
        return districtCount > 0 ? `${city.cityName}(${districtCount}个区县)` : city.cityName;
      });

      return `当前服务${cityTexts.length}个城市：${cityTexts.join('、')}`;
    },



    // 编辑服务区域
    editServiceAreas() {
      // 初始化选中的区域
      this.initSelectedZones();
      // 加载所有可用区域
      this.fetchAllZones();
      // 重置展开状态
      this.expandedProvinces = {};
      this.expandedCities = {};
      this.showServiceAreaModal = true;
    },

    // 关闭服务区域弹窗
    closeServiceAreaModal() {
      this.showServiceAreaModal = false;
    },

    // 初始化选中的区域
    initSelectedZones() {
      // 重置选中的区域
      this.selectedZones = [];
      this.selectedZoneNames = [];

      // 从用户信息中获取当前绑定的服务区域
      if (this.userInfo && this.userInfo.zone && Array.isArray(this.userInfo.zone)) {
        console.log('当前骑手已有区域:', this.userInfo.zone);

        // 遍历骑手已有的区域，提取district_id和区域名称
        this.userInfo.zone.forEach(zoneItem => {
          if (typeof zoneItem === 'object' && zoneItem.district_id) {
            // 如果zone中存储的是对象格式，包含district_id
            this.selectedZones.push(zoneItem.district_id);
            this.selectedZoneNames.push(zoneItem.district_name || zoneItem.name);
          } else if (typeof zoneItem === 'string') {
            // 如果zone中存储的是字符串格式的区域名称
            this.selectedZoneNames.push(zoneItem);
            // 注意：这种情况下我们没有district_id，需要在获取到allZones后再匹配
          }
        });
      }

      // 备用：如果有service_zone字段，也使用它
      if (this.userInfo && this.userInfo.service_zone && Array.isArray(this.userInfo.service_zone)) {
        this.userInfo.service_zone.forEach(zoneId => {
          if (!this.selectedZones.includes(zoneId)) {
            this.selectedZones.push(zoneId);
          }
        });
      }

      console.log('初始化选中的区域ID:', this.selectedZones);
      console.log('初始化选中的区域名称:', this.selectedZoneNames);
    },

    // 获取所有可用区域
    async fetchAllZones() {
      try {
        uni.showLoading({ title: '加载中...' });

        const params = {
          service_member_id: this.userInfo.service_member_id || this.userInfo.id,
          service_provider_id: this.userInfo.service_provider_id || this.userInfo.provider_id || 1,
          sign: 'chongchong'
        };

        const res = await this.$request('service/group/zones', params, 'POST');

        console.log('service/group/zones 接口返回:', res);

        if (res.status === 'success' && res.data && res.data.service_zones) {
          // 处理返回的区域数据，转换为省市区三级结构
          this.allZones = this.processZoneData(res.data.service_zones);

          // 如果selectedZones为空但有selectedZoneNames，尝试通过名称匹配district_id
          this.matchZoneIdsByNames(res.data.service_zones);
        } else {
          uni.showToast({
            title: res.message || res.msg || '加载区域失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('加载可用区域失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 处理区域数据，转换为省市区三级结构
    processZoneData(serviceZones) {
      console.log('原始service_zones数据:', serviceZones);

      if (!Array.isArray(serviceZones) || serviceZones.length === 0) {
        console.log('service_zones数据格式不正确或为空，返回空数组');
        return [];
      }

      // 按省份分组
      const provinceMap = new Map();

      serviceZones.forEach(zone => {
        const provinceName = zone.province_name;
        const cityName = zone.city_name;
        const districtName = zone.district_name;
        const districtId = zone.district_id;

        if (!provinceName || !cityName || !districtName) {
          console.log('跳过无效区域数据:', zone);
          return;
        }

        // 创建省份
        if (!provinceMap.has(provinceName)) {
          provinceMap.set(provinceName, {
            province_id: zone.province_id,
            name: provinceName,
            children: new Map()
          });
        }

        const province = provinceMap.get(provinceName);

        // 创建城市
        if (!province.children.has(cityName)) {
          province.children.set(cityName, {
            city_id: zone.city_id,
            name: cityName,
            children: []
          });
        }

        const city = province.children.get(cityName);

        // 添加区县
        city.children.push({
          district_id: districtId,
          name: districtName
        });
      });

      // 转换为数组格式
      const result = Array.from(provinceMap.values()).map(province => ({
        ...province,
        children: Array.from(province.children.values())
      }));

      console.log('处理后的区域数据:', result);
      return result;
    },

    // 通过区域名称匹配district_id
    matchZoneIdsByNames(serviceZones) {
      if (this.selectedZoneNames.length > 0 && this.selectedZones.length === 0) {
        console.log('尝试通过区域名称匹配district_id');

        this.selectedZoneNames.forEach(zoneName => {
          const matchedZone = serviceZones.find(zone =>
            zone.district_name === zoneName ||
            zone.district_name.includes(zoneName) ||
            zoneName.includes(zone.district_name)
          );

          if (matchedZone && !this.selectedZones.includes(matchedZone.district_id)) {
            this.selectedZones.push(matchedZone.district_id);
            console.log(`匹配到区域: ${zoneName} -> district_id: ${matchedZone.district_id}`);
          }
        });

        console.log('匹配后的选中区域ID:', this.selectedZones);
      }
    },



    // 切换省份展开/折叠状态
    toggleProvince(provinceId) {
      const currentState = this.isProvinceExpanded(provinceId);
      this.$set(this.expandedProvinces, provinceId, !currentState);
    },

    // 判断省份是否展开
    isProvinceExpanded(provinceId) {
      return this.expandedProvinces[provinceId] === true;
    },

    // 切换城市展开/折叠状态
    toggleCity(provinceId, cityId) {
      const cityKey = `${provinceId}-${cityId}`;
      const currentState = this.isCityExpanded(provinceId, cityId);
      this.$set(this.expandedCities, cityKey, !currentState);
    },

    // 判断城市是否展开
    isCityExpanded(provinceId, cityId) {
      const cityKey = `${provinceId}-${cityId}`;
      return this.expandedCities[cityKey] === true;
    },

    // 切换区域选择
    toggleZone(zoneId, zoneName) {
      const idx = this.selectedZones.indexOf(zoneId);
      if (idx > -1) {
        // 取消选中
        this.selectedZones.splice(idx, 1);
        const nameIdx = this.selectedZoneNames.indexOf(zoneName);
        if (nameIdx > -1) this.selectedZoneNames.splice(nameIdx, 1);
      } else {
        // 选中
        this.selectedZones.push(zoneId);
        if (!this.selectedZoneNames.includes(zoneName)) {
          this.selectedZoneNames.push(zoneName);
        }
      }
    },

    // 保存服务区域
    async saveServiceAreas() {
      this.saving = true;

      try {
        const params = {
          service_member_id: this.userInfo.service_member_id || this.userInfo.id,
          service_zone: this.selectedZones, // 区县id数组
          sign: 'chongchong'
        };

        const res = await this.$request('service/member/update', params, 'POST');

        if (res.code === '200' || res.status === 'success') {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          });

          // 更新本地用户信息
          const updatedUserInfo = {
            ...this.userInfo,
            service_zone: [...this.selectedZones],
            zone: [...this.selectedZoneNames]
          };
          uni.setStorageSync('riderUserInfo', updatedUserInfo);
          this.userInfo = updatedUserInfo;

          this.closeServiceAreaModal();
        } else {
          uni.showToast({
            title: res.message || '保存失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('保存服务区域失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.saving = false;
      }
    },

    // 修改密码
    changePassword() {
      this.showPasswordModal = true;
    },

    // 关闭密码弹窗
    closePasswordModal() {
      this.showPasswordModal = false;
      this.resetPasswordForm();
    },

    // 重置密码表单
    resetPasswordForm() {
      this.passwordForm = {
        newPassword: '',
        confirmPassword: ''
      };
    },

    // 保存密码
    async savePassword() {
      const { newPassword, confirmPassword } = this.passwordForm;

      if (!newPassword) {
        uni.showToast({
          title: '请输入新密码',
          icon: 'none'
        });
        return;
      }

      if (newPassword.length < 6) {
        uni.showToast({
          title: '新密码至少6位',
          icon: 'none'
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        });
        return;
      }

      this.passwordSaving = true;

      try {
        const params = {
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
          phone_number: this.userInfo.phone_number || this.userInfo.phone,
          sign: 'chongchong'
        };

        const res = await this.$request('service/member/password', params, 'POST');

        if (res.code === '200' || res.status === 'success') {
          uni.showToast({
            title: '密码修改成功',
            icon: 'success'
          });
          
          this.closePasswordModal();
        } else {
          uni.showToast({
            title: res.message || '密码修改失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('修改密码失败:', err);
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      } finally {
        this.passwordSaving = false;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background-color: #f5f6fa;
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
}

// 设置列表
.settings-list {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;

  .settings-item {
    display: flex;
    align-items: center;
    padding: 30rpx 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
    transition: background-color 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background-color: #f8f9fa;
    }

    .settings-icon {
      width: 60rpx;
      height: 60rpx;
      background-color: #f0f8ff;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;

      .emoji-icon {
        font-size: 32rpx;
      }
    }

    .settings-content {
      flex: 1;

      .settings-title {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
        display: block;
        margin-bottom: 8rpx;
      }

      .settings-desc {
        font-size: 26rpx;
        color: #999;
        display: block;
      }
    }

    .settings-right {
      .arrow-icon {
        width: 24rpx;
        height: 24rpx;
      }
    }
  }
}

// 弹窗通用样式
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
}

.modal-container {
  position: fixed;
  top: 15%;
  left: 5%;
  width: 90%;
  height: 70%;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    background-color: #fff;
    position: sticky;
    top: 0;
    z-index: 10;

    .modal-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
    }

    .modal-close {
      font-size: 40rpx;
      color: #999;
      cursor: pointer;
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 20rpx;
  }

  .modal-footer {
    display: flex;
    justify-content: space-around;
    padding: 20rpx 30rpx;
    border-top: 1rpx solid #f0f0f0;
    background-color: #fff;
    position: sticky;
    bottom: 0;

    .modal-btn {
      flex: 1;
      margin: 0 10rpx;
      padding: 16rpx 32rpx;
      border-radius: 8rpx;
      font-size: 28rpx;
      border: none;
      text-align: center;

      &.cancel {
        background-color: #f5f5f5;
        color: #666;
      }

      &.confirm {
        background-color: #2492F2;
        color: #fff;

        &:disabled {
          opacity: 0.6;
        }
      }

      &:active {
        opacity: 0.9;
      }
    }
  }
}

// 省市区选择器样式
.province-list {
  .province-block {
    margin-bottom: 20rpx;

    .province-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      cursor: pointer;

      .province-name {
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
      }

      .toggle-icon {
        font-size: 24rpx;
        color: #999;
        transition: transform 0.3s ease;

        &.expanded {
          transform: rotate(180deg);
        }
      }
    }

    .city-list {
      padding-left: 20rpx;

      .city-block {
        margin-bottom: 15rpx;

        .city-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15rpx 0;
          border-bottom: 1rpx solid #f5f5f5;
          cursor: pointer;

          .city-name {
            font-size: 28rpx;
            color: #333;
          }

          .toggle-icon {
            font-size: 22rpx;
            color: #999;
            transition: transform 0.3s ease;

            &.expanded {
              transform: rotate(180deg);
            }
          }
        }

        .zone-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10rpx;
          padding: 15rpx 0;

          .zone-item {
            padding: 8rpx 16rpx;
            background-color: #f8f9fa;
            color: #666;
            border-radius: 16rpx;
            font-size: 24rpx;
            cursor: pointer;
            border: 1rpx solid #e9ecef;
            transition: all 0.2s ease;

            &.selected {
              background-color: #2492F2;
              color: #fff;
              border-color: #2492F2;
            }

            &:active {
              opacity: 0.8;
            }
          }
        }
      }
    }
  }
}



// 密码弹窗特有样式
.password-modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  z-index: 9999;

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .modal-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
    }

    .modal-close {
      font-size: 40rpx;
      color: #999;
      cursor: pointer;
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .modal-content {
    padding: 30rpx;

    .input-group {
      margin-bottom: 30rpx;

      .input-label {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 12rpx;
        display: block;
      }

      .input-field {
        width: 100%;
        height: 80rpx;
        padding: 0 20rpx;
        border: 1rpx solid #e0e0e0;
        border-radius: 8rpx;
        font-size: 28rpx;
        background-color: #fff;
        box-sizing: border-box;

        &:focus {
          border-color: #2492F2;
        }
      }
    }
  }

  .modal-footer {
    display: flex;
    justify-content: space-around;
    padding: 20rpx 30rpx;
    border-top: 1rpx solid #f0f0f0;

    .modal-btn {
      flex: 1;
      margin: 0 10rpx;
      padding: 16rpx 32rpx;
      border-radius: 8rpx;
      font-size: 28rpx;
      border: none;
      text-align: center;

      &.cancel {
        background-color: #f5f5f5;
        color: #666;
      }

      &.confirm {
        background-color: #2492F2;
        color: #fff;

        &:disabled {
          opacity: 0.6;
        }
      }

      &:active {
        opacity: 0.9;
      }
    }
  }
}

// 底部安全区域
.safe-area-bottom {
  height: env(safe-area-inset-bottom, 0px);
  background-color: #f5f6fa;
}
</style>
