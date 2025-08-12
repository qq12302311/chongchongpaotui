<template>
  <view class="privacy-page">
    <!-- 顶部导航栏 -->
    <view class="custom-nav-bar">
      <nav-bar
        title="隐私政策"
        title-align="center"
        :showBackButton="true"
        @back="goBack"
        :backgroundColor="'#2492F2'"
        :textColor="'#ffffff'"
      ></nav-bar>
    </view>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 隐私政策内容 -->
    <view class="privacy-content">
      <view class="privacy-title">充充跑腿隐私政策</view>
      
      <view class="privacy-text">
        <view class="section">
          <text class="section-content">
            恒享时代（成都）科技有限公司（以下简称"我们"）深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。同时，我们承诺，我们将按业界成熟的安全标准，采取相应的安全保护措施来保护您的个人信息。
          </text>
        </view>

        <view class="section">
          <text class="section-content">
            请在使用我们的产品（或服务）前，仔细阅读并了解本《隐私政策》。
          </text>
        </view>

        <view class="section">
          <text class="section-title">一、我们如何收集和使用您的个人信息</text>
          <text class="section-content">
            个人信息是指以电子或者其他方式记录的能够单独或者与其他信息结合识别特定自然人身份或者反映特定自然人活动情况的各种信息。
          </text>
        </view>

        <view class="section">
          <text class="section-title">（一）您向我们提供的信息</text>
          <text class="section-content">
            1. 您在注册账户或使用我们的服务时，向我们提供的相关个人信息，例如：电话号码、电子邮箱等；
            <br/>2. 您通过我们的客服或参加我们举办的活动时所提交的信息，例如：您参与我们线上活动时填写的调查问卷中可能包含您的姓名、电话、家庭地址等信息。
          </text>
        </view>

        <view class="section">
          <text class="section-title">（二）我们在您使用服务过程中获取的信息</text>
          <text class="section-content">
            1. 日志信息：当您使用我们的服务时，我们可能会自动收集相关信息并存储为服务日志信息。
            <br/>2. 设备信息：我们可能会根据您在软件安装及使用中授予的具体权限，接收并记录您所使用的设备相关信息。
            <br/>3. 位置信息：当您使用与位置有关的服务时，我们可能会记录您设备所在的位置信息。
            <br/>4. 其他相关信息：为了帮助您更好地使用我们的产品或服务，我们会收集相关信息。
          </text>
        </view>

        <view class="section">
          <text class="section-title">二、我们如何使用Cookie和同类技术</text>
          <text class="section-content">
            为确保服务正常运转，我们会在您的计算机或移动设备上存储名为Cookie的小数据文件。Cookie通常包含标识符、站点名称以及一些号码和字符。借助于Cookie，网站能够存储您的偏好或购物篮内的商品等数据。
          </text>
        </view>

        <view class="section">
          <text class="section-title">三、我们如何共享、转让、公开披露您的个人信息</text>
          <text class="section-content">
            （一）共享
            <br/>我们不会与其他的任何公司、组织和个人分享您的个人信息，但以下情况除外：
            <br/>1. 在获取明确同意的情况下共享：获得您的明确同意后，我们会与其他方共享您的个人信息。
            <br/>2. 我们可能会根据法律法规规定，或按政府主管部门的强制性要求，对外共享您的个人信息。
          </text>
        </view>

        <view class="section">
          <text class="section-title">四、我们如何保护您的个人信息</text>
          <text class="section-content">
            （一）我们已使用符合业界标准的安全防护措施保护您提供的个人信息，防止数据遭到未经授权访问、公开披露、使用、修改、损坏或丢失。我们会采取一切合理可行的措施，保护您的个人信息。
            <br/>（二）我们会采取一切合理可行的措施，确保未收集无关的个人信息。我们只会在达成本政策所述目的所需的期限内保留您的个人信息，除非需要延长保留期或受到法律的允许。
          </text>
        </view>

        <view class="section">
          <text class="section-title">五、您的权利</text>
          <text class="section-content">
            按照中国相关的法律、法规、标准，以及其他国家、地区的通行做法，我们保障您对自己的个人信息行使以下权利：
            <br/>（一）访问您的个人信息
            <br/>（二）更正您的个人信息
            <br/>（三）删除您的个人信息
            <br/>（四）改变您授权同意的范围
            <br/>（五）注销账户
          </text>
        </view>

        <view class="section">
          <text class="section-title">六、我们如何处理儿童的个人信息</text>
          <text class="section-content">
            我们的产品、网站和服务主要面向成人。如果没有父母或监护人的同意，儿童不得创建自己的用户账户。对于经父母同意而收集儿童个人信息的情况，我们只会在受到法律允许、父母或监护人明确同意或者保护儿童所必要的情况下使用或公开披露此信息。
          </text>
        </view>

        <view class="section">
          <text class="section-title">七、您的个人信息如何在全球范围转移</text>
          <text class="section-content">
            原则上，我们在中华人民共和国境内收集和产生的个人信息，将存储在中华人民共和国境内。
          </text>
        </view>

        <view class="section">
          <text class="section-title">八、本政策如何更新</text>
          <text class="section-content">
            我们的隐私政策可能变更。未经您明确同意，我们不会削减您按照本隐私政策所应享有的权利。我们会在本页面上发布对本政策所做的任何变更。
          </text>
        </view>

        <view class="section">
          <text class="section-title">九、如何联系我们</text>
          <text class="section-content">
            如果您对本隐私政策有任何疑问、意见或建议，通过以下方式与我们联系：
            <br/>客服电话：400-1788-147
            <br/>违法和不良信息举报电话：19822909390（微信同号）
            <br/>违法和不良信息举报邮箱：19822909390@163.com
          </text>
        </view>
      </view>

      <!-- 底部提示 -->
      <view class="bottom-tip">
        <text>本政策将于发布之日起生效</text>
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
    return {}
  },
  methods: {
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style lang="scss" scoped>
.privacy-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.custom-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.nav-placeholder {
  height: 90px; /* 根据实际导航栏高度调整 */
}

.privacy-content {
  padding: 30rpx;
  background-color: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}

.privacy-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 60rpx;
  padding-bottom: 30rpx;
  border-bottom: 2rpx solid #e0e0e0;
}

.privacy-text {
  line-height: 1.8;
}

.section {
  margin-bottom: 30rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #2492F2;
  margin-bottom: 15rpx;
}

.section-content {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  text-indent: 0;
  margin-left: 20rpx;
}

.bottom-tip {
  margin-top: 60rpx;
  padding-top: 30rpx;
  border-top: 2rpx solid #e0e0e0;
  text-align: center;
  
  text {
    font-size: 24rpx;
    color: #999;
  }
}
</style>
