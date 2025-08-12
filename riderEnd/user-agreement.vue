<template>
  <view class="agreement-page">
    <!-- 顶部导航栏 -->
    <view class="custom-nav-bar">
      <nav-bar
        title="用户协议"
        title-align="center"
        :showBackButton="true"
        @back="goBack"
        :backgroundColor="'#2492F2'"
        :textColor="'#ffffff'"
      ></nav-bar>
    </view>

    <!-- 导航栏占位元素 -->
    <view class="nav-placeholder"></view>

    <!-- 协议内容 -->
    <view class="agreement-content">
      <view class="agreement-title">充充跑腿用户协议</view>
      
      <view class="agreement-text">
        <view class="section">
          <text class="section-content">
            在使用"充充跑腿"平台的物品（"递送物品"）递送服务（"服务"）之前，请认真阅读本协议内容，下单前勾选已阅读视为您已认真阅读该协议并接受协议义务的和相关法规的约束。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第一条</text>
          <text class="section-content">
            本协议适用于恒享时代（成都）科技有限公司运营的"充充跑腿"项目（以下简称"充充跑腿"）为用户（"用户"或"下单人）提供的配送需求信息发布服务。本协议所称"充充跑腿"平台"是指名称为"充充跑腿"的移动应用，以及与此相关的微信公众账号、微博等将来可能新设立的其他平台的单称或合称。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第二条</text>
          <text class="section-content">
            用户充分理解"充充跑腿"平台本身不提供物品配送服务，仅对用户发布的配送需求信息（以下简称"订单"）予以推送，由在平台注册的服务人员（非平台所属公司劳动合同意义下的员工，以下简称"骑手"）自主接单并完成配送服务。"充充跑腿"平台将采用相关激励、奖罚措施以优化骑手服务，提高用户体验，但对任一订单是否被骑手承接不作任何承诺。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第三条</text>
          <text class="section-content">
            如双方就本协议内容或其执行发生任何争议，双方应尽力友好协商解决；协商不成时，任何一方均有权向有管辖权的人民法院诉讼解决。本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律（仅为本协议之目的，不含香港、澳门和台湾地区法律）。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第四条</text>
          <text class="section-content">
            "充充跑腿"重视对用户个人信息的保护，并严格按适用法律的规定保护用户个人信息和隐私安全。用户同意，"充充跑腿"有权通过使用用户的个人信息向用户提供服务，包括但不限于向用户发出产品和服务信息，或者与"充充跑腿"合作伙伴共享该等信息。"充充跑腿"在"充充跑腿"平台的某些网页上可能使用诸如 Cookies的资料收集装置，通过"充充跑腿"所设Cookies所取得的有关信息，将适用本协议约定。在"充充跑腿"平台上发布广告的主体通过广告在用户电脑上设定的Cookies，将按其自己的信息保护或隐私权政策使用。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第五条</text>
          <text class="section-content">
            用户在任一"充充跑腿"平台中点击注册页面的同意注册按钮并完成注册程序后，视为用户已达成本协议。本协议内容包括协议正文及所有"充充跑腿"已经发布的或将来可能发布的各类规则，所有规则为本协议不可分割的一部分，与本协议正文具有同等法律效力。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第六条</text>
          <text class="section-content">
            用户在使用"充充跑腿"平台提供的服务的同时，承诺接受并遵守各类相关规则的规定，包括但不限于递送物品配送流程及费用支付的相关规定。"充充跑腿"有权根据需要不定时地制定、修改本协议或各类规则。如本协议有任何变更，"充充跑腿"将在其"充充跑腿"平台中刊载公告，通知用户。如用户不同意相关变更，必须停止使用"充充跑腿"。经修订的协议已经在任一"充充跑腿"平台公布后，立即自动生效。"充充跑腿"各类规则会在发布后生效，亦成为本协议的一部分。登陆或继续使用任一"充充跑腿"平台将表示用户接受修订的协议。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第七条</text>
          <text class="section-content">
            用户注册成为"充充跑腿"会员，获取"充充跑腿"会员账户的使用权，有权使用"充充跑腿"产品和服务，并同意受本用户协议的约束，合理使用会员账户。用户理解并同意，用户将对利用该用户账户所进行的一切行动、言论，负完全的责任。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第八条</text>
          <text class="section-content">
            用户承诺符合"充充跑腿"的会员注册要求，若用户为自然人，则其应具有完全民事权利能力和行为能力，或虽不具有完全民事权利能力和行为能力但经其法定代理人同意并由其法定代理人代理注册并合法使用"充充跑腿若用户为非自然人，则其应为依照中华人民共和国法律法规设立的合法组织。如用户没有前述主体资格，"充充跑腿"有权拒绝用户的注册或注销用户的账户，且因此造成的损失由用户自行承担。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第九条</text>
          <text class="section-content">
            用户不得将在"充充跑腿"平台注册获得的账户借（租）给他人使用；用户没有通过"充充跑腿"平台正规预约渠道进行下单，私下下单要求骑手提供服务的，由此产生的纠纷，用户应承担全部责任，并与实际使用人承担连带责任，"充充跑腿"不承担任何赔偿责任。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第十条</text>
          <text class="section-content">
            如用户连续一年未使用"充充跑腿"会员账号或密码登录"充充跑腿"，则"充充跑腿"有权注销该用户的会员账号。用户的会员账户被注销后，"充充跑腿"没有义务为其保留或向其披露其账户中的任何信息，也没有义务向用户或第三方转发任何用户未曾阅读或发送过的信息。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第十一条</text>
          <text class="section-content">
            为保证配送质量和安全，用户同意按照"充充跑腿"的服务流程要求使用"充充跑腿"，并同意在使用"充充跑腿"时事先告知收件人和寄件人"充充跑腿"的服务流程，包括但不限于本协议第十三条、第十四条约定的流程。对于用户、收件人或寄件人不能遵守"充充跑腿"流程导致纠纷或发生损害的，由用户、收件人或寄件人自行承担。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第十二条</text>
          <text class="section-content">
            用户在递送物品时应核实骑手的身份信息及服务单号等，如因用户未经身份核实使用了未在"充充跑腿"平台注册的人员，导致纠纷或损害的，"充充跑腿"不就此承担任何法律责任；若用户不主动告知或隐瞒以上状况导致纠纷或者损害的，由用户自行承担相关责任。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第十三条</text>
          <text class="section-content">
            为保证服务安全，"充充跑腿"采取密码换货的原则。用户在下单时，"充充跑腿"将提供收件密码给收件人。收件人应在确保见到递送物品后向骑手提供收件密码。如因任何原因收件人无法向骑手出示收件密码，下单人或寄件人在核实收件人身份且已确保递送物品已递送至目的地后，也可直接向骑手提供收件密码。若收件人未见到递送物品，或下单人或寄件人未核实收件人身份或未确保递送物品已递送至目的地而直接向骑手提供收件密码，下单人、收件人或寄件人应自行承担由此产生的全部风险及损失。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第十四条</text>
          <text class="section-content">
            骑手有权在取件时开箱检查递送物品，用户须予以配合。用户在下单后须对递送物品进行拍照，并留存照片以便"充充跑腿"查验递送物品的真实性。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第十五条</text>
          <text class="section-content">
            如递送物品是动物（含宠物）、植物、各类贵重物品、货币、古玩字画等特殊物品，请自行施加保护措施；如因没有保护措施或措施不当导致递送物品损坏或产生不良结果，用户应承担责任；如遇自然天气、灾害等人力不可抗拒的情况，导致一系列不良结果，"充充跑腿"不承担责任。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第十六条</text>
          <text class="section-content">
            因骑手过错导致的递送物品的损毁或丢失，用户可以向"充充跑腿"申请，经"充充跑腿"确认该损失属实的，"充充跑腿"代骑手向用户先予赔付。同时，用户将向骑手索赔的权利让与"充充跑腿"。此外，用户与"充充跑腿"就先予赔偿有关事项，作出如下约定：
            <br/>1、用户仅有权对因骑手过错导致的递送物品的损毁或丢失请求"充充跑腿"先予赔偿。为更明确之目的，因下列情形导致递送物品延误、损毁或遗失，不属于"充充跑腿"先予赔偿的范围，用户请自行向骑手主张：
            <br/>（1）递送物品本身的自然性质或者合理损耗；
            <br/>（2）不可抗力
            <br/>（3）下单人、寄件人或收件人过错。
            <br/>（4）用户或收件人已提交取收件密码，且在"充充跑腿"平台系统内形成交接记录。
            <br/>2、"充充跑腿"仅在递送物品的实际价值（定义见下文）的范围内代骑手先予赔偿用户的实际损失，但在任何情况下，"充充跑腿"针对每个订单的最高赔偿额度不超过人民币5000元，且"充充跑腿"不承担任何其它损失或损害（包括但不限于利润、收入、利息及未来业务的损失），无论这些其它损失和损害是特殊性或是间接性，无论是否在向用户提供服务之前或之后知晓有这些损失或损害的风险。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第十七条</text>
          <text class="section-content">
            "充充跑腿"严禁递送违禁品，如发现疑似违禁品，"充充跑腿"和骑手有向公安机关举报的权利。用户保证不递送违禁品，对于违禁品在"充充跑腿"过程中发生的扣押、盗抢、损毁、灭失等，"充充跑腿"不承担任何赔偿责任。违禁品包括：
            <br/>1、各类武器、弹药。如枪支、子弹、炮弹、手榴弹、地雷、炸弹等。
            <br/>2、各类易爆炸性物品。如雷管、炸药、火药、鞭炮等。
            <br/>3、各类易燃烧性物品，包括液体、气体和固体。如汽油、煤油、桐油、酒精、生漆、柴油、气雾剂、气体打火机、瓦斯气瓶、磷、硫磺、火柴等。
            <br/>4、各类易腐蚀性物品。如火硫酸、盐酸、硝酸、有机溶剂、农药、双氧水、危险化学品等。
            <br/>5、各类放射性元素及容器。如铀、钴、镭、钚等。
            <br/>6、各类烈性毒药。如铊、氰化物、砒霜等。
            <br/>7、各类麻醉药物。如鸦片（包括罂粟壳、花、苞、叶）、吗啡、可卡因、海洛因、大麻、冰毒、麻黄素及其它制品等。
            <br/>8、各类生化制品和传染性物品。如炭疽、危险性病菌、医药用废弃物等。
            <br/>9、各种危害国家安全和社会政治稳定以及淫秽的出版物、宣传品、印刷品等。
            <br/>10、各种妨害公共卫生的物品。如尸骨、动物器官、肢体、未经硝制的兽皮、未经药制的兽骨等。
            <br/>11、中国法律、法规、行政规章明令禁止流通、寄递或进出境的物品，如国家秘密文件和资料、国家货币及伪造的货币和有价证券、仿真武器、管制刀具、珍贵文物、濒危野生动物及其制品等。
            <br/>12、包装不妥，可能危害人身安全、污染或者损毁其他寄递件、设备的物品等。
            <br/>13、各寄达国（地区）禁止寄递进口的物品等。
            <br/>14、其他适用法律禁止寄递的物品。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第十八条</text>
          <text class="section-content">
            用户承诺自己在使用"充充跑腿"时不会出现以下行为，如因用户以下行为而给"充充跑腿"或任何其他第三人造成损失，用户同意承担承担所有责任，包括但不限于赔偿"充充跑腿"并使其免于因此遭受所有直接和间接损失（包括任何直接经济损失、商誉损失及对外支付的赔偿金、和解款、律师费、诉讼费）：
            <br/>1、违反中国法律、法规要求以及各种社会公共利益或公共道德的行为；
            <br/>2、违反"充充跑腿"相关规定的行为（包括但不限于制造虚假订单、利用系统漏洞获取利润、违规套现等）；
            <br/>3、违反本协议约定的行为；
            <br/>4、其他损害"充充跑腿"、骑手和其他用户利益的行为。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第十九条</text>
          <text class="section-content">
            对于用户在使用"充充跑腿"中的不当行为或其他任何"充充跑腿"认为应当终止服务的情况，"充充跑腿"有权随时做出删除相关信息、终止提供服务等处理，而无须征得用户的同意。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第二十条</text>
          <text class="section-content">
            对于用户在使用"充充跑腿"中出现包括但不限于与骑手串通下假单、毁损货物等损害"充充跑腿"利益的行为，"充充跑腿"有权单方终止提供服务，并要求用户双倍返还因该等行为取得的不良利益，如不足以赔偿"充充跑腿"的实际损失（包括合理的律师费用），"充充跑腿"有权进一步追偿。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第二十一条</text>
          <text class="section-content">
            对于不可抗力、计算机病毒、黑客攻击、系统不稳定、用户所在位置、用户关机以及其他任何网络、技术、通信线路等原因造成的"充充跑腿"中断或不能满足用户要求的风险，用户理解并同意，"充充跑腿"对该等风险没有过错，同时，"充充跑腿"不对此承担任何责任。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第二十二条</text>
          <text class="section-content">
            如果本协议中的任何条款由于对其适用的中国法律而无效或不可强制执行，则该条款应当视为自始不存在而不影响本补充协议其他条款的有效性。
          </text>
        </view>

        <view class="section">
          <text class="section-title">第二十三条</text>
          <text class="section-content">
            除非本协议另有规定，一方未行使或迟延行使本协议项下的权利、权力或特权并不构成放弃这些权利、权力和特权，而单一或部分行使这些权利、权力和特权并不排斥行使任何其他权利、权力和特权。
          </text>
        </view>

        <view class="section">
          <text class="section-title">《计价说明》</text>
          <text class="section-content">
            充充跑腿服务分为：物件支持类跑腿服务和纯服务跑腿服务
            <br/>物件支持类跑腿服务，基础计价维度五项：物件费+距离费+时效费+夜间费+特勤溢价费
            <br/>纯服务跑腿服务，基础计价维度四项：距离费+时效费+夜间费+特勤溢价费
            <br/>备注：每一项计价维度分为起步价和分段溢价，具体金额因城市而异，可前往下单页面查看。
          </text>
        </view>

        <view class="section">
          <text class="section-title">特勤溢价费说明：</text>
          <text class="section-content">
            1、溢价是充充跑腿为了保证服务体验和骑手积极性，根据特殊情况和供求情况进行动态调整价格的策略。
            <br/>2、特殊情况包括：超远距离、极端天气、夜间、节假日等可能产生溢价。
            <br/>3、溢价运算公式：订单计算价*（1+溢价率）
          </text>
        </view>

        <view class="section">
          <text class="section-title">《特殊订单撮合交易规则》</text>
          <text class="section-content">
            1、特殊订单是指点位超远，往往不在骑手城市服务画圈内的点位，如：景区、机场、高速服务区等
            <br/>2、用户特定通道选择"特殊订单"下单，填写需求详情和愿出价，省内骑手端均可响应，骑手根据情况反馈接单价。如未达成，用户有一次改价撮合机会，达成则先付费再服务。如仍未达成订单手动或自动到时终止。
            <br/>3、特殊订单用户提前24小时取消免责，全额退款。小于24小时，以订单完成时效节点，按小时扣费，扣完为止。
          </text>
        </view>

        <view class="section">
          <text class="section-title">《取消订单扣款规则》</text>
          <text class="section-content">
            1、下单后5分钟内可无理由免费取消订单。
            <br/>2、下单5分钟后，取消订单则需以下单时效完成节点为准按小时扣费。
            <br/>例如：订单费15元，完成时效5小时内，5分钟后第1小时内取消扣费3元，第2小时内取消扣6元，不满1小时按1小时计，以此类推，扣完为止。
            <br/>注：取消费用于补尝骑手为订单所做准备工作和已产生跑腿里程，感谢理解！
          </text>
        </view>

        <view class="section">
          <text class="section-title">以下情况也可免费取消订单：</text>
          <text class="section-content">
            1、骑手接单后因故无法完成任务
            <br/>2、超时未接单
          </text>
        </view>

        <view class="section">
          <text class="section-title">《个人信息保护及隐私政策摘要》</text>
          <text class="section-content">
            我们非常重视用户隐私和个人信息的保护。本摘要是《个人信息保护及隐私政策》的附件，我们将通过本摘要向您简要说明充充跑腿如何收集、存储、使用、披露和保护您的个人信息。同时为了使您完整了解了解我们的隐私政策，建议您阅读完整的《个人信息保护及隐私政策》。
          </text>
        </view>

        <view class="section">
          <text class="section-title">一、我们如何收集和使用您的个人信息</text>
          <text class="section-content">
            账户信息：您使用充充跑腿服务前，需要在充充跑腿平台创建账号，充充跑腿平台的账户类型包括个人用户、企业员工用户以及商家用户。视您的账号类型不同，在账号注册过程中可能需要向我们提供您的手机号码、身份证号、身份证照片等个人信息，并设置您在充充跑腿平台的用户密码。
            <br/>位置信息：经您授权，我们会收集您的位置信息，以便估算您周边的骑手密度，或方便您使用一键下单功能，帮助您进行消费决策等。
            <br/>摄像头：经您授权，我们会收集您的摄像头信息，以便您在设置头像、聊天、智能识别等功能中拍摄照片。
            <br/>麦克风：经您授权，我们会收集您的通话信息、您提出的意见等信息，以便我们处理纠纷、解决问题或向您反馈结果。
            <br/>通讯录：经您授权，我们会收集您的手机通讯录信息，以便您在下单过程中快速填入发件人或收件人信息。
            <br/>设备信息：在您访问或使用我们服务的过程中，我们会收集您的设备信息，以便获取屏幕分辨率等信息进行界面展示、避免其他设备的异常登录、留存必要的日志信息，从而保障您的账号安全、交易安全和系统运行安全。
          </text>
        </view>

        <view class="section">
          <text class="section-title">二、我们如何共享、转让、公开披露您的信息</text>
          <text class="section-content">
            请您知悉，我们为您提供的大部分产品或服务，是我们无法单独完成的，因此我们可能会与我们的关联公司或者其他合作方等第三方共享或委托其处理您的部分个人信息。我们仅会出于合法、正当、必要、特定、明确的目的共享您的个人信息，并且只会共享提供服务所必要的个人信息。
          </text>
        </view>

        <view class="section">
          <text class="section-title">三、您如何管理您的信息</text>
          <text class="section-content">
            您有权管理您的个人信息，包括访问、更正、删除您的个人信息、撤回授权我们收集您的个人信息的同意或变更授权范围，以及注销您的账号等。您可以通过我们的APP中提供的相应功能或隐私管理中进行上述操作。
          </text>
        </view>

        <view class="section">
          <text class="section-title">四、我们如何使用相关算法</text>
          <text class="section-content">
            我们为了将用户订单分配给充充跑腿员，完成订单，使用了调度决策类相关算法，并将其公示给您供您查阅。算法的基本原理，是在用户下单而产生订单后，以订单信息和范围内充充跑腿员的匹配分为权重，找到整体的权重最优的匹配结果，将订单分配给该充充跑腿员。
          </text>
        </view>

        <view class="section">
          <text class="section-title">五、我们如何做好未成年人保护</text>
          <text class="section-content">
            我们非常重视对未成年人信息的保护并将根据国家相关法律法规的规定保护儿童个人信息。如果您是未满18周岁的未成年人，您的监护人需要仔细阅读本政策并授权您同意依照本政策使用充充跑腿平台。如果您是未满14周岁的未成年人，您的监护人需要仔细阅读本政策并同意您依照本政策使用充充跑腿平台。
          </text>
        </view>

        <view class="section">
          <text class="section-title">六、您如何联系我们</text>
          <text class="section-content">
            您可以通过以下方式联系我们，我们将在15日内回复您的要求：
            <br/>1)客服电话：400-1788-147；
            <br/>2)违法和不良信息举报电话：19822909390（微信同号）；
            <br/>3)违法和不良信息举报邮箱：19822909390@163.com；
          </text>
        </view>
      </view>

      <!-- 底部提示 -->
      <view class="bottom-tip">
        <text>如有疑问，请联系客服：400-1788-147</text>
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
.agreement-page {
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

.agreement-content {
  padding: 30rpx;
  background-color: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}

.agreement-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 60rpx;
  padding-bottom: 30rpx;
  border-bottom: 2rpx solid #e0e0e0;
}

.agreement-text {
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
