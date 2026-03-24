<template>
  <view class="contract-page">
    <!-- 顶部导航栏 -->
    <nav-bar title="服务商合同签署" title-align="center" :showBackButton="true"></nav-bar>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 合同信息卡片 -->
    <view class="contract-card">
      <view class="contract-header">
        <view class="contract-icon">
          <text class="emoji-icon">��</text>
        </view>
        <view class="contract-title">
          <text class="title">服务商合作协议</text>
          <text class="subtitle">请仔细阅读合同条款并签署</text>
        </view>
      </view>
      
      <!-- 合同状态 -->
      <view class="contract-status">
        <view class="status-item" :class="{ 'signed': contractStatus === 'signed' }">
          <view class="status-icon">
            <text v-if="contractStatus === 'signed'">✓</text>
            <text v-else>○</text>
          </view>
          <text class="status-text">{{ contractStatusText }}</text>
        </view>
      </view>
    </view>

    <!-- 合同内容 -->
    <view class="contract-content">
      <view class="content-header">
        <text class="content-title">合同条款</text>
      </view>
      
      <scroll-view class="contract-text" scroll-y="true">
        <view class="text-content">
          <view class="contract-form">
            <view class="contract-title-section">
              <text class="main-title">充充跑腿服务商合作协议</text>
            </view>

            <view class="contract-parties">
              <text class="parties-title">合同双方：</text>
              <view class="party-info">
                <text class="party-label">甲方（平台方）：</text>
                <text class="party-name">充充跑腿平台</text>
              </view>
              <view class="party-info">
                <text class="party-label">乙方（服务商）：</text>
                <input
                  class="party-input"
                  v-model="contractData.serviceProviderName"
                  placeholder="请输入服务商姓名"
                  :disabled="contractStatus === 'signed'"
                />
              </view>
              <view class="party-info">
                <text class="party-label">身份证号：</text>
                <input
                  class="party-input"
                  v-model="contractData.idNumber"
                  placeholder="请输入身份证号"
                  :disabled="contractStatus === 'signed'"
                />
              </view>
              <view class="party-info">
                <text class="party-label">联系电话：</text>
                <input
                  class="party-input"
                  v-model="contractData.phoneNumber"
                  placeholder="请输入联系电话"
                  :disabled="contractStatus === 'signed'"
                />
              </view>
              <view class="party-info">
                <text class="party-label">服务区域：</text>
                <input
                  class="party-input"
                  v-model="contractData.serviceArea"
                  placeholder="请输入服务区域"
                  :disabled="contractStatus === 'signed'"
                />
              </view>
            </view>

            <view class="contract-content-section">
              <text class="contract-article">
                第一条 合作内容与服务范围

                1.1 甲方为乙方提供充充跑腿平台的订单分发服务，乙方作为独立的服务提供商，在平台上接受并完成各类跑腿服务订单。

                1.2 服务范围包括但不限于：代购代送、文件递送、排队代办、生活服务、快递代收、跑腿代办、购物代买、餐饮外卖、鲜花配送、药品代购、文件打印复印、排队挂号、代缴费用、宠物服务、家政清洁、搬家服务、维修安装等平台认可的合法服务项目。

                1.3 乙方应在约定的服务区域内提供服务，服务区域为：<text class="fillable-text">{{contractData.serviceArea || '_______________'}}</text>

                1.4 双方建立长期稳定的合作关系，共同维护平台服务质量和用户体验。

                1.5 乙方有权根据自身情况选择接受订单，但一旦接受订单，应按照约定完成服务。

                第二条 服务标准与要求

                2.1 乙方应严格按照平台制定的服务标准和操作规范提供服务，确保服务质量符合平台要求。

                2.2 乙方应在接单后的合理时间内完成服务，一般情况下应在2小时内完成，特殊情况应及时与用户和平台沟通。

                2.3 乙方应保护用户隐私信息和商业机密，不得泄露、出售或滥用用户信息。

                2.4 乙方应保持良好的服务态度，使用文明用语，着装整洁，维护平台形象。

                2.5 乙方应确保提供的服务合法合规，不得从事违法违规活动，不得代购违禁物品。

                2.6 乙方应具备相应的服务能力和条件，包括但不限于交通工具、通讯设备等。

                2.7 乙方应按照平台要求上传服务过程中的必要照片和信息，确保服务透明度。

                第三条 费用结算与支付

                3.1 平台按照订单完成情况和约定标准向乙方支付服务费用，费用构成包括基础服务费、距离费、时长费等。

                3.2 结算周期为每周结算一次，具体结算日期为每周一，遇节假日顺延。

                3.3 费用通过平台指定的支付方式进行结算，包括银行转账、支付宝、微信等，乙方应提供准确的收款信息。

                3.4 平台有权根据服务质量、用户评价、市场情况等因素调整费用标准，调整前会提前7天通知乙方。

                3.5 如发生服务纠纷或用户投诉，平台有权暂停相关费用结算，待纠纷解决后再行处理。

                3.6 乙方应依法纳税，相关税费由乙方自行承担。

                第四条 权利与义务

                4.1 甲方权利义务：
                - 为乙方提供订单信息和技术支持
                - 制定并执行平台服务标准和管理制度
                - 按约定及时支付服务费用
                - 对违规行为进行处理和管理
                - 提供必要的培训和指导
                - 保护乙方合法权益
                - 建立客服体系处理纠纷

                4.2 乙方权利义务：
                - 按照平台要求提供优质服务
                - 严格遵守平台规则和服务标准
                - 保护用户信息安全和隐私
                - 维护平台声誉和形象
                - 及时响应用户需求和平台通知
                - 配合平台的管理和监督
                - 持续提升服务质量和专业水平

                第五条 服务质量管理

                5.1 平台建立服务质量评价体系，用户可对服务进行评价和投诉。

                5.2 乙方应保持良好的服务评价，评价过低可能影响订单分配和费用结算。

                5.3 对于用户投诉，乙方应积极配合调查和处理。

                5.4 平台有权对服务质量不达标的乙方进行培训、警告或暂停合作。

                第六条 违约责任

                6.1 任何一方违反本协议约定，应承担相应的违约责任。

                6.2 乙方违约情形包括但不限于：
                - 服务质量不达标或态度恶劣
                - 违反平台规则和操作规范
                - 泄露或滥用用户信息
                - 从事违法违规活动
                - 恶意刷单或虚假交易
                - 损坏用户财物或造成人身伤害
                - 无故取消已接受的订单

                6.3 因违约造成损失的，违约方应承担赔偿责任，包括直接损失和间接损失。

                6.4 严重违约的，守约方有权立即解除合作关系，并要求违约方承担相应法律责任。

                6.5 乙方因违约行为给平台造成损失的，应承担赔偿责任。

                第七条 保险与责任

                7.1 建议乙方购买相关保险，包括人身意外险、第三者责任险等。

                7.2 乙方在提供服务过程中发生的人身伤害或财产损失，由乙方承担相应责任。

                7.3 因乙方过错造成用户损失的，由乙方承担赔偿责任。

                第八条 知识产权

                8.1 平台的商标、标识、软件等知识产权归甲方所有。

                8.2 乙方不得擅自使用平台的知识产权，不得进行侵权行为。

                8.3 乙方在服务过程中产生的数据和信息归平台所有。

                第九条 保密条款

                9.1 双方应对在合作过程中获得的商业秘密和机密信息承担保密义务。

                9.2 保密义务在本协议终止后仍然有效。

                9.3 违反保密义务的，应承担相应的法律责任。

                第十条 协议变更与终止

                10.1 本协议的修改需双方协商一致，并以书面形式确认。

                10.2 任何一方可提前30天书面通知对方终止本协议。

                10.3 协议终止后，双方应妥善处理未完成的订单和费用结算。

                10.4 协议终止不影响已产生的权利义务关系。

                第十一条 争议解决

                11.1 因本协议产生的争议，双方应首先通过友好协商解决。

                11.2 协商不成的，可向甲方所在地人民法院提起诉讼。

                11.3 在争议解决期间，不影响协议其他条款的执行。

                第十二条 不可抗力

                12.1 因不可抗力因素导致无法履行协议的，双方均不承担违约责任。

                12.2 不可抗力包括但不限于自然灾害、政府行为、法律法规变化等。

                12.3 发生不可抗力时，应及时通知对方并提供相关证明。

                第十三条 其他条款

                13.1 本协议自双方签署之日起生效，有效期为一年，到期后自动续签。

                13.2 本协议未尽事宜，按照国家相关法律法规执行。

                13.3 本协议的附件和补充协议与本协议具有同等法律效力。

                13.4 本协议一式两份，双方各执一份，具有同等法律效力。

                13.5 如本协议条款与法律法规冲突，以法律法规为准。

                签署信息：
                甲方：充充跑腿平台
                法定代表人：_______________
                签署日期：{{formatSignedTime(signedTime) || '_______________'}}

                乙方签名：（手写签名）
                身份证号：{{contractData.idNumber || '_______________'}}
                联系电话：{{contractData.phoneNumber || '_______________'}}
                服务区域：{{contractData.serviceArea || '_______________'}}
                签署日期：{{formatSignedTime(signedTime) || '_______________'}}

                特别声明：
                1. 本协议经双方充分协商一致签署，双方对协议内容完全理解并同意遵守。
                2. 乙方确认已年满18周岁，具有完全民事行为能力。
                3. 乙方承诺提供的个人信息真实有效，如有虚假承担相应责任。
                4. 本协议的签署、履行和解释均适用中华人民共和国法律。
              </text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 签署区域 -->
    <view class="sign-section" v-if="contractStatus !== 'signed'">
      <view class="agreement-check">
        <checkbox-group @change="onAgreementChange">
          <label class="checkbox-label">
            <checkbox value="agree" :checked="isAgreed" />
            <text class="checkbox-text">我已仔细阅读并同意以上合同条款</text>
          </label>
        </checkbox-group>
      </view>

      <!-- 手写签名区域 -->
      <view class="signature-section">
        <view class="signature-title">
          <text>请在下方区域手写签名：</text>
        </view>
        <view class="signature-canvas-container">
          <canvas
            canvas-id="signatureCanvas"
            class="signature-canvas"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            disable-scroll="true"
          ></canvas>
          <view class="signature-placeholder" v-if="!hasSignature">
            <text>请在此处签名</text>
          </view>
        </view>
        <view class="signature-actions">
          <button class="clear-btn" @click="clearSignature">清除重写</button>
        </view>
      </view>

      <view class="sign-buttons">
        <button class="sign-btn" :disabled="!canSign" @click="signContract">
          确认签署合同
        </button>
      </view>
    </view>

    <!-- 已签署状态 -->
    <view class="signed-info" v-if="contractStatus === 'signed'">
      <view class="signed-card">
        <view class="signed-icon">✓</view>
        <view class="signed-text">
          <text class="signed-title">合同已签署</text>
          <text class="signed-time">签署时间：{{ signedTime }}</text>
        </view>
      </view>

      <!-- 显示签署的合同预览 -->
      <view class="contract-preview" v-if="contractImagePath">
        <view class="preview-title">
          <text>电子合同预览</text>
        </view>
        <image :src="contractImagePath" mode="aspectFit" class="contract-image" @click="previewContract"></image>
      </view>

      <view class="action-buttons">
        <button class="view-btn" @click="viewContract">查看合同</button>
        <button class="download-btn" @click="downloadContract">下载合同</button>
      </view>
    </view>

    <!-- 隐藏的合成画布 -->
    <canvas
      canvas-id="contractCanvas"
      class="hidden-canvas"
      :style="{ width: '595px', height: '1500px' }"
    ></canvas>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

export default {
  name: 'ContractPage',
  components: {
    NavBar
  },
  data() {
    return {
      contractStatus: 'unsigned', // unsigned: 未签署, signed: 已签署
      isAgreed: false,
      signedTime: '',
      // 合同数据
      contractData: {
        serviceProviderName: '', // 服务商姓名
        idNumber: '', // 身份证号
        phoneNumber: '', // 联系电话
        serviceArea: '' // 服务区域
      },
      // 签名相关 (使用rpx转px的比例，一般是1:2)
      canvasWidth: 280, // 对应560rpx
      canvasHeight: 140, // 对应280rpx
      canvasCtx: null,
      hasSignature: false,
      isDrawing: false,
      lastPoint: null,
      signatureImagePath: '', // 签名图片路径
      contractTemplateUrl: 'https://ccpt.qiniu.cc111.cn/contract/template.png', // 合同模板图片
      contractImagePath: '', // 完整合同图片路径
      paths: [] // 存储所有绘制路径
    }
  },
  computed: {
    contractStatusText() {
      return this.contractStatus === 'signed' ? '已签署' : '待签署'
    },
    canSign() {
      return this.isAgreed &&
             this.hasSignature &&
             this.contractData.serviceProviderName.trim() &&
             this.contractData.idNumber.trim() &&
             this.contractData.phoneNumber.trim() &&
             this.contractData.serviceArea.trim()
    }
  },
  onLoad() {
    this.checkContractStatus()
  },

  onReady() {
    // 延迟初始化，确保DOM渲染完成
    setTimeout(() => {
      this.initSignatureCanvas()
    }, 100)
  },
  methods: {
    // 格式化签署时间
    formatSignedTime(timeStr) {
      if (!timeStr) return ''

      try {
        let date

        // 如果是中文格式的时间字符串，需要特殊处理
        if (timeStr.includes('年') || timeStr.includes('月') || timeStr.includes('日')) {
          // 已经是目标格式，直接返回
          return timeStr
        }

        // 处理本地化字符串格式，如 "2025/7/25下午6:20:30"
        if (timeStr.includes('上午') || timeStr.includes('下午')) {
          // 替换中文的上午下午标识
          let processedStr = timeStr.replace('上午', ' AM').replace('下午', ' PM')
          // 将斜杠替换为标准分隔符
          processedStr = processedStr.replace(/\//g, '-')
          date = new Date(processedStr)
        } else {
          // 尝试直接解析
          date = new Date(timeStr)
        }

        // 检查日期是否有效
        if (isNaN(date.getTime())) {
          // 如果解析失败，尝试当前时间
          date = new Date()
        }

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')

        return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
      } catch (error) {
        console.error('时间格式化错误:', error, timeStr)
        // 如果格式化失败，返回当前时间的格式化结果
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const seconds = String(now.getSeconds()).padStart(2, '0')

        return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
      }
    },

    // 检查合同签署状态
    async checkContractStatus() {
      try {
        // 这里应该调用API检查用户的合同签署状态
        // const res = await this.$api.checkContractStatus()
        // this.contractStatus = res.data.status
        // this.signedTime = res.data.signedTime

        // 临时模拟数据
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo && userInfo.contractSigned) {
          this.contractStatus = 'signed'
          this.signedTime = userInfo.contractSignedTime || '2024-01-01 10:00:00'
          this.contractImagePath = userInfo.contractImagePath || ''
          // 加载已保存的合同数据
          if (userInfo.contractData) {
            this.contractData = { ...userInfo.contractData }
          }
        } else {
          // 如果未签署，尝试从用户信息中预填充一些数据
          if (userInfo) {
            this.contractData.serviceProviderName = userInfo.name || ''
            this.contractData.phoneNumber = userInfo.phone || ''
            // 可以根据用户信息预填充其他字段
          }
        }
      } catch (error) {
        console.error('检查合同状态失败:', error)
      }
    },
    
    // 初始化签名画布
    initSignatureCanvas() {
      // 获取Canvas的实际尺寸
      const query = uni.createSelectorQuery().in(this)
      query.select('.signature-canvas').boundingClientRect((rect) => {
        if (rect) {
          this.canvasWidth = rect.width
          this.canvasHeight = rect.height
          console.log('Canvas实际尺寸:', this.canvasWidth, this.canvasHeight)
        }

        // 获取系统信息，适配不同设备的像素比
        const systemInfo = uni.getSystemInfoSync()
        const pixelRatio = systemInfo.pixelRatio || 1

        const ctx = uni.createCanvasContext('signatureCanvas', this)

        // 设置画笔样式
        ctx.setStrokeStyle('#000000')
        ctx.setFillStyle('#000000')
        ctx.setLineWidth(3) // 固定线宽
        ctx.setLineCap('round')
        ctx.setLineJoin('round')

        // 设置画布背景为白色
        ctx.setFillStyle('#ffffff')
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
        ctx.setFillStyle('#000000') // 重新设置为黑色用于绘制
        ctx.draw()

        this.canvasCtx = ctx
      }).exec()
    },

    // 触摸开始
    handleTouchStart(e) {
      if (!this.canvasCtx) return

      const touch = e.touches[0]
      const x = touch.x
      const y = touch.y

      this.isDrawing = true
      this.lastPoint = { x, y }

      // 开始新的路径并存储
      const newPath = [{ x, y }]
      this.paths.push(newPath)

      this.hasSignature = true
    },

    // 触摸移动
    handleTouchMove(e) {
      if (!this.canvasCtx || !this.isDrawing || this.paths.length === 0) return

      const touch = e.touches[0]
      const x = touch.x
      const y = touch.y

      if (this.lastPoint) {
        // 计算距离，避免过于密集的点
        const distance = Math.sqrt(
          Math.pow(x - this.lastPoint.x, 2) + Math.pow(y - this.lastPoint.y, 2)
        )

        if (distance > 1) {
          // 添加点到当前路径
          const currentPath = this.paths[this.paths.length - 1]
          currentPath.push({ x, y })

          // 重新绘制所有路径
          this.redrawAllPaths()

          this.lastPoint = { x, y }
        }
      }
    },

    // 触摸结束
    handleTouchEnd(e) {
      if (!this.canvasCtx || !this.isDrawing) return

      this.isDrawing = false
      this.lastPoint = null
    },

    // 重新绘制所有路径
    redrawAllPaths() {
      if (!this.canvasCtx) return

      // 清空画布
      this.canvasCtx.setFillStyle('#ffffff')
      this.canvasCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)

      // 设置画笔样式
      this.canvasCtx.setStrokeStyle('#000000')
      this.canvasCtx.setLineWidth(3)
      this.canvasCtx.setLineCap('round')
      this.canvasCtx.setLineJoin('round')

      // 绘制所有路径
      this.paths.forEach(path => {
        if (path.length > 0) {
          this.canvasCtx.beginPath()
          this.canvasCtx.moveTo(path[0].x, path[0].y)

          for (let i = 1; i < path.length; i++) {
            this.canvasCtx.lineTo(path[i].x, path[i].y)
          }

          this.canvasCtx.stroke()
        }
      })

      this.canvasCtx.draw()
    },

    // 清除签名
    clearSignature() {
      if (!this.canvasCtx) return

      // 清除所有路径数据
      this.paths = []

      // 重新初始化画布
      this.canvasCtx.setFillStyle('#ffffff')
      this.canvasCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
      this.canvasCtx.setFillStyle('#000000') // 重新设置为黑色用于绘制
      this.canvasCtx.draw()

      this.hasSignature = false
      this.signatureImagePath = ''
      this.isDrawing = false
      this.lastPoint = null
    },

    // 同意协议变化
    onAgreementChange(e) {
      this.isAgreed = e.detail.value.includes('agree')
    },
    
    // 签署合同
    async signContract() {
      if (!this.isAgreed) {
        uni.showToast({
          title: '请先同意合同条款',
          icon: 'none'
        })
        return
      }

      if (!this.hasSignature) {
        uni.showToast({
          title: '请先完成签名',
          icon: 'none'
        })
        return
      }

      // 验证必填字段
      if (!this.contractData.serviceProviderName.trim()) {
        uni.showToast({
          title: '请填写服务商姓名',
          icon: 'none'
        })
        return
      }

      if (!this.contractData.idNumber.trim()) {
        uni.showToast({
          title: '请填写身份证号',
          icon: 'none'
        })
        return
      }

      if (!this.contractData.phoneNumber.trim()) {
        uni.showToast({
          title: '请填写联系电话',
          icon: 'none'
        })
        return
      }

      if (!this.contractData.serviceArea.trim()) {
        uni.showToast({
          title: '请填写服务区域',
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({
          title: '生成合同中...'
        })

        // 1. 先设置签署时间和状态
        this.contractStatus = 'signed'
        // 直接生成目标格式的时间字符串
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const seconds = String(now.getSeconds()).padStart(2, '0')
        this.signedTime = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`

        // 2. 保存签名为图片
        const signatureImage = await this.saveSignatureAsImage()

        // 3. 生成完整的电子合同
        const contractImage = await this.generateContractImage(signatureImage)

        // 4. 上传合同图片到服务器
        // const uploadRes = await this.uploadContractImage(contractImage)

        uni.hideLoading()

        this.contractImagePath = contractImage

        // 更新本地存储
        const userInfo = uni.getStorageSync('userInfo') || {}
        userInfo.contractSigned = true
        userInfo.contractSignedTime = this.signedTime
        userInfo.contractImagePath = contractImage
        userInfo.contractData = { ...this.contractData } // 保存合同数据
        uni.setStorageSync('userInfo', userInfo)

        uni.showToast({
          title: '合同签署成功',
          icon: 'success'
        })

      } catch (error) {
        uni.hideLoading()
        console.error('签署合同失败:', error)
        uni.showToast({
          title: '签署失败，请重试',
          icon: 'none'
        })
      }
    },

    // 保存签名为图片
    saveSignatureAsImage() {
      return new Promise((resolve, reject) => {
        uni.canvasToTempFilePath({
          canvasId: 'signatureCanvas',
          success: (res) => {
            this.signatureImagePath = res.tempFilePath
            resolve(res.tempFilePath)
          },
          fail: (err) => {
            console.error('保存签名失败:', err)
            reject(err)
          }
        }, this)
      })
    },

    // 生成完整的电子合同图片
    generateContractImage(signatureImagePath) {
      return new Promise((resolve, reject) => {
        const ctx = uni.createCanvasContext('contractCanvas', this)

        // 设置合成画布尺寸 (A4比例，增加高度以容纳更多内容)
        const contractWidth = 595
        const contractHeight = 1500 // 增加高度

        // 1. 设置背景为白色
        ctx.setFillStyle('#ffffff')
        ctx.fillRect(0, 0, contractWidth, contractHeight)

        // 2. 绘制合同标题
        ctx.setFillStyle('#333333')
        ctx.setFontSize(18)
        ctx.setTextAlign('center')
        ctx.fillText('充充跑腿服务商合作协议', contractWidth / 2, 40)

        // 3. 绘制合同信息
        ctx.setFontSize(10)
        ctx.setTextAlign('left')
        let yPosition = 80

        // 合同双方信息
        ctx.setFontSize(12)
        ctx.fillText('合同双方：', 50, yPosition)
        yPosition += 20
        ctx.setFontSize(10)
        ctx.fillText('甲方（平台方）：充充跑腿平台', 50, yPosition)
        yPosition += 15
        ctx.fillText(`乙方（服务商）：${this.contractData.serviceProviderName}`, 50, yPosition)
        yPosition += 15
        ctx.fillText(`身份证号：${this.contractData.idNumber}`, 50, yPosition)
        yPosition += 15
        ctx.fillText(`联系电话：${this.contractData.phoneNumber}`, 50, yPosition)
        yPosition += 15
        ctx.fillText(`服务区域：${this.contractData.serviceArea}`, 50, yPosition)
        yPosition += 25

        // 完整的合同条款内容
        const fullClauses = [
          '第一条 合作内容与服务范围',
          '1.1 甲方为乙方提供充充跑腿平台的订单分发服务，乙方作为独立的服务提供商，',
          '在平台上接受并完成各类跑腿服务订单。',
          '1.2 服务范围包括但不限于：代购代送、文件递送、排队代办、生活服务、',
          '快递代收、跑腿代办、购物代买、餐饮外卖等平台认可的合法服务项目。',
          `1.3 乙方应在约定的服务区域内提供服务，服务区域为：${this.contractData.serviceArea}`,
          '1.4 双方建立长期稳定的合作关系，共同维护平台服务质量和用户体验。',
          '',
          '第二条 服务标准与要求',
          '2.1 乙方应严格按照平台制定的服务标准和操作规范提供服务，',
          '确保服务质量符合平台要求。',
          '2.2 乙方应在接单后的合理时间内完成服务，一般情况下应在2小时内完成，',
          '特殊情况应及时与用户和平台沟通。',
          '2.3 乙方应保护用户隐私信息和商业机密，不得泄露、出售或滥用用户信息。',
          '2.4 乙方应保持良好的服务态度，使用文明用语，着装整洁，维护平台形象。',
          '2.5 乙方应确保提供的服务合法合规，不得从事违法违规活动。',
          '',
          '第三条 费用结算与支付',
          '3.1 平台按照订单完成情况和约定标准向乙方支付服务费用，',
          '费用构成包括基础服务费、距离费、时长费等。',
          '3.2 结算周期为每周结算一次，具体结算日期为每周一，遇节假日顺延。',
          '3.3 费用通过平台指定的支付方式进行结算，包括银行转账、支付宝、',
          '微信等，乙方应提供准确的收款信息。',
          '3.4 平台有权根据服务质量、用户评价、市场情况等因素调整费用标准，',
          '调整前会提前7天通知乙方。',
          '',
          '第四条 权利与义务',
          '4.1 甲方权利义务：',
          '- 为乙方提供订单信息和技术支持',
          '- 制定并执行平台服务标准和管理制度',
          '- 按约定及时支付服务费用',
          '- 对违规行为进行处理和管理',
          '4.2 乙方权利义务：',
          '- 按照平台要求提供优质服务',
          '- 严格遵守平台规则和服务标准',
          '- 保护用户信息安全和隐私',
          '- 维护平台声誉和形象',
          '',
          '第五条 服务质量管理',
          '5.1 平台建立服务质量评价体系，用户可对服务进行评价和投诉。',
          '5.2 乙方应保持良好的服务评价，评价过低可能影响订单分配和费用结算。',
          '5.3 对于用户投诉，乙方应积极配合调查和处理。',
          '',
          '第六条 违约责任',
          '6.1 任何一方违反本协议约定，应承担相应的违约责任。',
          '6.2 乙方违约情形包括但不限于：服务质量不达标、违反平台规则、',
          '泄露用户信息、从事违法违规活动等。',
          '6.3 因违约造成损失的，违约方应承担赔偿责任。',
          '6.4 严重违约的，守约方有权立即解除合作关系。',
          '',
          '第七条 保险与责任',
          '7.1 建议乙方购买相关保险，包括人身意外险、第三者责任险等。',
          '7.2 乙方在提供服务过程中发生的人身伤害或财产损失，由乙方承担相应责任。',
          '',
          '第八条 知识产权',
          '8.1 平台的商标、标识、软件等知识产权归甲方所有。',
          '8.2 乙方不得擅自使用平台的知识产权，不得进行侵权行为。',
          '',
          '第九条 保密条款',
          '9.1 双方应对在合作过程中获得的商业秘密和机密信息承担保密义务。',
          '9.2 保密义务在本协议终止后仍然有效。',
          '',
          '第十条 协议变更与终止',
          '10.1 本协议的修改需双方协商一致，并以书面形式确认。',
          '10.2 任何一方可提前30天书面通知对方终止本协议。',
          '10.3 协议终止后，双方应妥善处理未完成的订单和费用结算。',
          '',
          '第十一条 争议解决',
          '11.1 因本协议产生的争议，双方应首先通过友好协商解决。',
          '11.2 协商不成的，可向甲方所在地人民法院提起诉讼。',
          '',
          '第十二条 不可抗力',
          '12.1 因不可抗力因素导致无法履行协议的，双方均不承担违约责任。',
          '12.2 不可抗力包括但不限于自然灾害、政府行为、法律法规变化等。',
          '',
          '第十三条 其他条款',
          '13.1 本协议自双方签署之日起生效，有效期为一年，到期后自动续签。',
          '13.2 本协议未尽事宜，按照国家相关法律法规执行。',
          '13.3 本协议一式两份，双方各执一份，具有同等法律效力。',
          '13.4 如本协议条款与法律法规冲突，以法律法规为准。'
        ]

        // 绘制合同条款
        fullClauses.forEach(clause => {
          if (clause.trim()) {
            // 检查是否需要换页
            if (yPosition > contractHeight - 200) {
              // 这里可以添加分页逻辑，暂时只在一页内显示
              return
            }

            // 条款标题使用稍大字体
            if (clause.startsWith('第') && clause.includes('条')) {
              ctx.setFontSize(11)
              ctx.fillText(clause, 50, yPosition)
              ctx.setFontSize(10)
            } else {
              ctx.fillText(clause, 50, yPosition)
            }
          }
          yPosition += clause.trim() ? 15 : 8
        })

        // 4. 添加签署信息标题
        yPosition += 20
        ctx.setFontSize(11)
        ctx.fillText('签署信息：', 50, yPosition)
        yPosition += 20

        // 5. 添加甲方签署信息（左侧）
        ctx.setFontSize(10)
        ctx.setFillStyle('#333333')
        const leftX = 50
        ctx.fillText('甲方：充充跑腿平台', leftX, yPosition)
        yPosition += 15
        ctx.fillText('法定代表人：_______________', leftX, yPosition)
        yPosition += 15

        // 甲方签署日期
        const formattedTime = this.formatSignedTime(this.signedTime) || '_______________'
        ctx.fillText(`签署日期：${formattedTime}`, leftX, yPosition)

        // 6. 添加乙方签署信息（右侧）
        const rightX = contractWidth / 2 + 50 // 右侧起始位置
        let rightY = yPosition - 30 // 与甲方信息对齐

        // 乙方签名（手写签名位置）
        ctx.setFillStyle('#333333')
        ctx.fillText('乙方签名：', rightX, rightY)

        // 在乙方签名后面绘制手写签名
        const signatureX = rightX + 70
        const signatureY = rightY - 25
        const signatureWidth = 80
        const signatureHeight = 40
        ctx.drawImage(signatureImagePath, signatureX, signatureY, signatureWidth, signatureHeight)

        rightY += 15
        // 身份证号
        ctx.fillText(`身份证号：${this.contractData.idNumber || '_______________'}`, rightX, rightY)

        rightY += 15
        // 联系电话
        ctx.fillText(`联系电话：${this.contractData.phoneNumber || '_______________'}`, rightX, rightY)

        rightY += 15
        // 服务区域
        ctx.fillText(`服务区域：${this.contractData.serviceArea || '_______________'}`, rightX, rightY)

        rightY += 15
        // 乙方签署日期
        const rightFormattedTime = this.formatSignedTime(this.signedTime) || '_______________'
        ctx.fillText(`签署日期：${rightFormattedTime}`, rightX, rightY)

        // 7. 添加特别声明
        yPosition += 40
        ctx.setFontSize(9)
        ctx.fillText('特别声明：', 50, yPosition)
        yPosition += 12
        ctx.fillText('1. 本协议经双方充分协商一致签署，双方对协议内容完全理解并同意遵守。', 50, yPosition)
        yPosition += 12
        ctx.fillText('2. 乙方确认已年满18周岁，具有完全民事行为能力。', 50, yPosition)
        yPosition += 12
        ctx.fillText('3. 乙方承诺提供的个人信息真实有效，如有虚假承担相应责任。', 50, yPosition)
        yPosition += 12
        ctx.fillText('4. 本协议的签署、履行和解释均适用中华人民共和国法律。', 50, yPosition)

        ctx.draw(false, () => {
          setTimeout(() => {
            uni.canvasToTempFilePath({
              canvasId: 'contractCanvas',
              success: (res) => {
                resolve(res.tempFilePath)
              },
              fail: (err) => {
                console.error('生成合同图片失败:', err)
                reject(err)
              }
            }, this)
          }, 500)
        })
      })
    },
    
    // 预览合同图片
    previewContract() {
      if (this.contractImagePath) {
        uni.previewImage({
          urls: [this.contractImagePath],
          current: this.contractImagePath
        })
      }
    },

    // 查看合同
    viewContract() {
      if (this.contractImagePath) {
        this.previewContract()
      } else {
        uni.showToast({
          title: '合同图片不存在',
          icon: 'none'
        })
      }
    },

    // 下载合同
    downloadContract() {
      if (!this.contractImagePath) {
        uni.showToast({
          title: '合同图片不存在',
          icon: 'none'
        })
        return
      }

      uni.saveImageToPhotosAlbum({
        filePath: this.contractImagePath,
        success: () => {
          uni.showToast({
            title: '合同已保存到相册',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('保存失败:', err)
          uni.showToast({
            title: '保存失败，请重试',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.contract-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.nav-placeholder {
  height: 180rpx;
  width: 100%;
}

.contract-card {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;
  
  .contract-header {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    
    .contract-icon {
      width: 80rpx;
      height: 80rpx;
      margin-right: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      image {
        width: 100%;
        height: 100%;
      }

      .emoji-icon {
        font-size: 60rpx;
        line-height: 1;
      }
    }
    
    .contract-title {
      flex: 1;
      
      .title {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .subtitle {
        font-size: 26rpx;
        color: #666;
      }
    }
  }
  
  .contract-status {
    .status-item {
      display: flex;
      align-items: center;
      padding: 20rpx;
      background-color: #f8f9fa;
      border-radius: 8rpx;
      
      &.signed {
        background-color: #e8f5e8;
        
        .status-icon {
          background-color: #52c41a;
          color: #fff;
        }
        
        .status-text {
          color: #52c41a;
        }
      }
      
      .status-icon {
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        background-color: #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16rpx;
        font-size: 24rpx;
        color: #666;
      }
      
      .status-text {
        font-size: 28rpx;
        color: #666;
      }
    }
  }
}

.contract-content {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 12rpx;

  .content-header {
    padding: 30rpx 30rpx 20rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .content-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .contract-text {
    height: 1200rpx;

    .text-content {
      padding: 30rpx;

      .contract-form {
        .contract-title-section {
          text-align: center;
          margin-bottom: 40rpx;

          .main-title {
            font-size: 36rpx;
            font-weight: 700;
            color: #333;
          }
        }

        .contract-parties {
          margin-bottom: 40rpx;
          padding: 30rpx;
          background-color: #f8f9fa;
          border-radius: 12rpx;

          .parties-title {
            font-size: 30rpx;
            font-weight: 600;
            color: #333;
            margin-bottom: 20rpx;
            display: block;
          }

          .party-info {
            display: flex;
            align-items: center;
            margin-bottom: 20rpx;

            .party-label {
              font-size: 26rpx;
              color: #666;
              width: 160rpx;
              flex-shrink: 0;
            }

            .party-name {
              font-size: 26rpx;
              color: #333;
              font-weight: 500;
            }

            .party-input {
              flex: 1;
              height: 60rpx;
              padding: 0 20rpx;
              border: 1rpx solid #e0e0e0;
              border-radius: 8rpx;
              font-size: 26rpx;
              color: #333;
              background-color: #fff;

              &:disabled {
                background-color: #f5f5f5;
                color: #999;
              }

              &::placeholder {
                color: #999;
              }
            }
          }
        }

        .contract-content-section {
          .contract-article {
            font-size: 26rpx;
            line-height: 1.8;
            color: #333;
            white-space: pre-line;

            .fillable-text {
              color: #333;
              font-weight: 400;
            }
          }
        }
      }
    }
  }
}

.sign-section {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;

  .agreement-check {
    margin-bottom: 30rpx;

    .checkbox-label {
      display: flex;
      align-items: center;

      .checkbox-text {
        margin-left: 16rpx;
        font-size: 26rpx;
        color: #333;
      }
    }
  }

  .signature-section {
    margin-bottom: 30rpx;

    .signature-title {
      margin-bottom: 20rpx;

      text {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }
    }

    .signature-canvas-container {
      position: relative;
      border: 2rpx dashed #ddd;
      border-radius: 8rpx;
      background-color: #fafafa;

      .signature-canvas {
        display: block;
        width: 560rpx;
        height: 280rpx;
        background-color: #fff;
        border-radius: 6rpx;
        touch-action: none; /* 禁用浏览器默认触摸行为 */
        -webkit-touch-callout: none; /* 禁用长按菜单 */
        -webkit-user-select: none; /* 禁用文本选择 */
        user-select: none;
      }

      .signature-placeholder {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;

        text {
          font-size: 24rpx;
          color: #999;
        }
      }
    }

    .signature-actions {
      margin-top: 20rpx;
      text-align: center;

      .clear-btn {
        padding: 16rpx 40rpx;
        background-color: #f5f5f5;
        color: #666;
        border: none;
        border-radius: 6rpx;
        font-size: 26rpx;
      }
    }
  }

  .sign-buttons {
    .sign-btn {
      width: 100%;
      height: 88rpx;
      background-color: #2492F2;
      color: #fff;
      border: none;
      border-radius: 8rpx;
      font-size: 30rpx;

      &:disabled {
        background-color: #ddd;
        color: #999;
      }
    }
  }
}

.signed-info {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;

  .signed-card {
    display: flex;
    align-items: center;
    padding: 30rpx;
    background-color: #e8f5e8;
    border-radius: 8rpx;
    margin-bottom: 30rpx;

    .signed-icon {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background-color: #52c41a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      margin-right: 20rpx;
    }

    .signed-text {
      flex: 1;

      .signed-title {
        display: block;
        font-size: 30rpx;
        font-weight: 600;
        color: #52c41a;
        margin-bottom: 8rpx;
      }

      .signed-time {
        font-size: 24rpx;
        color: #666;
      }
    }
  }

  .contract-preview {
    margin-bottom: 30rpx;

    .preview-title {
      margin-bottom: 20rpx;

      text {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }
    }

    .contract-image {
      width: 100%;
      max-height: 400rpx;
      border: 1rpx solid #e0e0e0;
      border-radius: 8rpx;
      background-color: #f9f9f9;
    }
  }

  .action-buttons {
    display: flex;
    gap: 20rpx;

    button {
      flex: 1;
      height: 80rpx;
      border: none;
      border-radius: 8rpx;
      font-size: 28rpx;
    }

    .view-btn {
      background-color: #f0f0f0;
      color: #333;
    }

    .download-btn {
      background-color: #2492F2;
      color: #fff;
    }
  }
}

.hidden-canvas {
  position: fixed;
  top: -9999px;
  left: -9999px;
  z-index: -1;
}
</style>
