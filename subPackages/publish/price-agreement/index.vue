<template>
	<view class="container">
		<nav-bar title="价格协议" title-align="center"></nav-bar>

		<view class="watermark-1">充充跑腿CCPT-共享行业跑腿平台</view>
		<view class="watermark-2">充充跑腿CCPT-共享行业跑腿平台</view>
		<view class="watermark-3">充充跑腿CCPT-共享行业跑腿平台</view>
		<view class="watermark-4">充充跑腿CCPT-共享行业跑腿平台</view>
		<view class="watermark-5">充充跑腿CCPT-共享行业跑腿平台</view>
		<view class="watermark-6">充充跑腿CCPT-共享行业跑腿平台</view>

		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<view class="agreement-content">
				<!-- 用户协议部分 -->
				<view class="section">
					<view class="section-title">《充充跑腿用户协议》</view>
					<view class="section-content">
						<view class="paragraph">
							在使用"充充跑腿"平台的物品（"递送物品"）递送服务（"服务"）之前，请认真阅读本协议内容，下单前勾选已阅读视为您已认真阅读该协议并接受协议义务的和相关法规的约束。
						</view>
						<view class="paragraph">
							第一条 本协议适用于恒享时代（成都）科技有限公司运营的"充充跑腿"项目（以下简称"充充跑腿"）为用户（"用户"或"下单人）提供的配送需求信息发布服务。本协议所称"充充跑腿"平台"是指名称为"充充跑腿"的移动应用，以及与此相关的微信公众账号、微博等将来可能新设立的其他平台的单称或合称。
						</view>
						<view class="paragraph">
							第二条 用户充分理解"充充跑腿"平台本身不提供物品配送服务，仅对用户发布的配送需求信息（以下简称"订单"）予以推送，由在平台注册的服务人员（非平台所属公司劳动合同意义下的员工，以下简称"骑手"）自主接单并完成配送服务。"充充跑腿"平台将采用相关激励、奖罚措施以优化骑手服务，提高用户体验，但对任一订单是否被骑手承接不作任何承诺。
						</view>
						<view class="paragraph">
							第三条 如双方就本协议内容或其执行发生任何争议，双方应尽力友好协商解决；协商不成时，任何一方均有权向有管辖权的人民法院诉讼解决。本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律（仅为本协议之目的，不含香港、澳门和台湾地区法律）。
						</view>
						<view class="paragraph">
							第四条"充充跑腿"重视对用户个人信息的保护，并严格按适用法律的规定保护用户个人信息和隐私安全。用户同意，"充充跑腿"有权通过使用用户的个人信息向用户提供服务，包括但不限于向用户发出产品和服务信息，或者与"充充跑腿"合作伙伴共享该等信息。"充充跑腿"在"充充跑腿"平台的某些网页上可能使用诸如 Cookies的资料收集装置，通过"充充跑腿"所设Cookies所取得的有关信息，将适用本协议约定。在"充充跑腿"平台上发布广告的主体通过广告在用户电脑上设定的Cookies，将按其自己的信息保护或隐私权政策使用。
						</view>
						<view class="paragraph">
							第五条 用户在任一"充充跑腿"平台中点击注册页面的同意注册按钮并完成注册程序后，视为用户已达成本协议。本协议内容包括协议正文及所有"充充跑腿"已经发布的或将来可能发布的各类规则，所有规则为本协议不可分割的一部分，与本协议正文具有同等法律效力。
						</view>
						<view class="paragraph">
							第六条 用户在使用"充充跑腿"平台提供的服务的同时，承诺接受并遵守各类相关规则的规定，包括但不限于递送物品配送流程及费用支付的相关规定。"充充跑腿"有权根据需要不定时地制定、修改本协议或各类规则。如本协议有任何变更，"充充跑腿"将在其"充充跑腿"平台中刊载公告，通知用户。如用户不同意相关变更，必须停止使用"充充跑腿"。经修订的协议已经在任一"充充跑腿"平台公布后，立即自动生效。"充充跑腿"各类规则会在发布后生效，亦成为本协议的一部分。登陆或继续使用任一"充充跑腿"平台将表示用户接受修订的协议。
						</view>
						<view class="paragraph">
							第七条 用户注册成为"充充跑腿"会员，获取"充充跑腿"会员账户的使用权，有权使用"充充跑腿"产品和服务，并同意受本用户协议的约束，合理使用会员账户。用户理解并同意，用户将对利用该用户账户所进行的一切行动、言论，负完全的责任。
						</view>
						<view class="paragraph">
							第八条 用户承诺符合"充充跑腿"的会员注册要求，若用户为自然人，则其应具有完全民事权利能力和行为能力，或虽不具有完全民事权利能力和行为能力但经其法定代理人同意并由其法定代理人代理注册并合法使用"充充跑腿若用户为非自然人，则其应为依照中华人民共和国法律法规设立的合法组织。如用户没有前述主体资格，"充充跑腿"有权拒绝用户的注册或注销用户的账户，且因此造成的损失由用户自行承担。
						</view>
						<view class="paragraph">
							第九条 用户不得将在"充充跑腿"平台注册获得的账户借（租）给他人使用；用户没有通过"充充跑腿"平台正规预约渠道进行下单，私下下单要求骑手提供服务的，由此产生的纠纷，用户应承担全部责任，并与实际使用人承担连带责任，"充充跑腿"不承担任何赔偿责任。
						</view>
						<view class="paragraph">
							第十条 如用户连续一年未使用"充充跑腿"会员账号或密码登录"充充跑腿"，则"充充跑腿"有权注销该用户的会员账号。用户的会员账户被注销后，"充充跑腿"没有义务为其保留或向其披露其账户中的任何信息，也没有义务向用户或第三方转发任何用户未曾阅读或发送过的信息。
						</view>
						<view class="paragraph">
							第十一条 为保证配送质量和安全，用户同意按照"充充跑腿"的服务流程要求使用"充充跑腿"，并同意在使用"充充跑腿"时事先告知收件人和寄件人"充充跑腿"的服务流程，包括但不限于本协议第十三条、第十四条约定的流程。对于用户、收件人或寄件人不能遵守"充充跑腿"流程导致纠纷或发生损害的，由用户、收件人或寄件人自行承担。
						</view>
						<view class="paragraph">
							第十二条 用户在递送物品时应核实骑手的身份信息及服务单号等，如因用户未经身份核实使用了未在"充充跑腿"平台注册的人员，导致纠纷或损害的，"充充跑腿"不就此承担任何法律责任；若用户不主动告知或隐瞒以上状况导致纠纷或者损害的，由用户自行承担相关责任。
						</view>
						<view class="paragraph">
							第十三条 为保证服务安全，"充充跑腿"采取密码换货的原则。用户在下单时，"充充跑腿"将提供收件密码给收件人。收件人应在确保见到递送物品后向骑手提供收件密码。如因任何原因收件人无法向骑手出示收件密码，下单人或寄件人在核实收件人身份且已确保递送物品已递送至目的地后，也可直接向骑手提供收件密码。若收件人未见到递送物品，或下单人或寄件人未核实收件人身份或未确保递送物品已递送至目的地而直接向骑手提供收件密码，下单人、收件人或寄件人应自行承担由此产生的全部风险及损失。
						</view>
						<view class="paragraph">
							第十四条 骑手有权在取件时开箱检查递送物品，用户须予以配合。用户在下单后须对递送物品进行拍照，并留存照片以便"充充跑腿"查验递送物品的真实性。
						</view>
						<view class="paragraph">
							第十五条 如递送物品是动物（含宠物）、植物、各类贵重物品、货币、古玩字画等特殊物品，请自行施加保护措施；如因没有保护措施或措施不当导致递送物品损坏或产生不良结果，用户应承担责任；如遇自然天气、灾害等人力不可抗拒的情况，导致一系列不良结果，"充充跑腿"不承担责任。
						</view>
						<view class="paragraph">
							第十六条 因骑手过错导致的递送物品的损毁或丢失，用户可以向"充充跑腿"申请，经"充充跑腿"确认该损失属实的，"充充跑腿"代骑手向用户先予赔付。同时，用户将向骑手索赔的权利让与"充充跑腿"。此外，用户与"充充跑腿"就先予赔偿有关事项，作出如下约定：
						</view>
						<view class="sub-paragraph">
							1、用户仅有权对因骑手过错导致的递送物品的损毁或丢失请求"充充跑腿"先予赔偿。为更明确之目的，因下列情形导致递送物品延误、损毁或遗失，不属于"充充跑腿"先予赔偿的范围，用户请自行向骑手主张：
						</view>
						<view class="sub-paragraph">
							（1）递送物品本身的自然性质或者合理损耗；
						</view>
						<view class="sub-paragraph">
							（2）不可抗力
						</view>
						<view class="sub-paragraph">
							（3）下单人、寄件人或收件人过错。
						</view>
						<view class="sub-paragraph">
							（4）用户或收件人已提交取收件密码，且在"充充跑腿"平台系统内形成交接记录。
						</view>
						<view class="sub-paragraph">
							2、"充充跑腿"仅在递送物品的实际价值（定义见下文）的范围内代骑手先予赔偿用户的实际损失，但在任何情况下，"充充跑腿"针对每个订单的最高赔偿额度不超过人民币5000元，且"充充跑腿"不承担任何其它损失或损害（包括但不限于利润、收入、利息及未来业务的损失），无论这些其它损失和损害是特殊性或是间接性，无论是否在向用户提供服务之前或之后知晓有这些损失或损害的风险。
						</view>
						<view class="sub-paragraph">
							3、用户在向"充充跑腿"提出先予赔偿请求时，应如实告知递送物品的类别及实际价值，并证明递送物品的实际价值。递送物品的"实际价值"应按如下规则确定：
						</view>
						<view class="sub-paragraph">
							（1）若递送物品为全新或未开封商品，"实际价值"为用户提供的购买递送物品或生产递送物品所付出成本的购物小票、发票等价值证明文件（"价值证明文件"）中所显示的递送物品的价格信息。若用户不能提供任何价值证明文件或价值证明文件中的价格信息明显高于市场公允价格，"充充跑腿"有权按照市场公允价格中的最低价格进行赔偿。
						</view>
						<view class="sub-paragraph">
							（2）若递送物品非全新商品，"实际价值"为用户提供的购买递送物品或生产递送物品所付出成本的购物小票、发票等价值证明文件（"价值证明文件"）中所显示的递送物品的价格信息，同时需考虑商品的折旧程度。若用户不能提供任何价值证明文件或价值证明文件中的价格信息明显高于市场公允价格，"充充跑腿"有权按照市场公允价格中的最低价格在考虑商品折旧程度的基础上进行赔偿。
						</view>
						<view class="sub-paragraph">
							（3）尽管有前述规定，"充充跑腿"有权在其认为需要的情况下要求用户提供由权威机构或价值鉴定机构出具的递送物品的价值证明报告或其他报告。
						</view>
						<view class="sub-paragraph">
							4、用户对每一次服务只能申请一次先予赔偿，任何申请必须在下单后三十（30）内以书面方式向"充充跑腿"提出，否则"充充跑腿"将不再予以接受，用户应自行向骑手索赔。用户在根据本协议向"充充跑腿"提出先予赔偿请求后的三十（30）日内时，应当根据"充充跑腿"的要求出具用户有效的身份证明、递送物品的照片、价值证明、鉴定证明及索赔函等，如用户为单位，应在上述文件上加盖公章，提交"充充跑腿"审核确认。若收件人在接收递送物品时没有说明递送物品有任何损坏，"充充跑腿"视为递送物品被完好送达。
						</view>
						<view class="sub-paragraph">
							5、"充充跑腿"先予赔偿的金额无法弥补用户损失的，就先予赔偿金额范围外的损失，用户可自行向骑手索赔。
						</view>
						<view class="paragraph">
							第十七条"充充跑腿"严禁递送违禁品，如发现疑似违禁品，"充充跑腿"和骑手有向公安机关举报的权利。用户保证不递送违禁品，对于违禁品在"充充跑腿"过程中发生的扣押、盗抢、损毁、灭失等，"充充跑腿"不承担任何赔偿责任。违禁品包括：
						</view>
						<view class="sub-paragraph">
							1、各类武器、弹药。如枪支、子弹、炮弹、手榴弹、地雷、炸弹等。
						</view>
						<view class="sub-paragraph">
							2、各类易爆炸性物品。如雷管、炸药、火药、鞭炮等。
						</view>
						<view class="sub-paragraph">
							3、各类易燃烧性物品，包括液体、气体和固体。如汽油、煤油、桐油、酒精、生漆、柴油、气雾剂、气体打火机、瓦斯气瓶、磷、硫磺、火柴等。
						</view>
						<view class="sub-paragraph">
							4、各类易腐蚀性物品。如火硫酸、盐酸、硝酸、有机溶剂、农药、双氧水、危险化学品等。
						</view>
						<view class="sub-paragraph">
							5、各类放射性元素及容器。如铀、钴、镭、钚等。
						</view>
						<view class="sub-paragraph">
							6、各类烈性毒药。如铊、氰化物、砒霜等。
						</view>
						<view class="sub-paragraph">
							7、各类麻醉药物。如鸦片（包括罂粟壳、花、苞、叶）、吗啡、可卡因、海洛因、大麻、冰毒、麻黄素及其它制品等。
						</view>
						<view class="sub-paragraph">
							8、各类生化制品和传染性物品。如炭疽、危险性病菌、医药用废弃物等。
						</view>
						<view class="sub-paragraph">
							9、各种危害国家安全和社会政治稳定以及淫秽的出版物、宣传品、印刷品等。
						</view>
						<view class="sub-paragraph">
							10、各种妨害公共卫生的物品。如尸骨、动物器官、肢体、未经硝制的 兽皮、未经药制的兽骨等。
						</view>
						<view class="sub-paragraph">
							11、中国法律、法规、行政规章明令禁止流通、寄递或进出境的物品，如国家秘密文件和资料、国家货币及伪造的货币和有价证券、仿真武器、管制刀具、珍贵文物、濒危野生动物及其制品等。
						</view>
						<view class="sub-paragraph">
							12、包装不妥，可能危害人身安全、污染或者损毁其他寄递件、设备的物品等。
						</view>
						<view class="sub-paragraph">
							13、各寄达国（地区）禁止寄递进口的物品等。
						</view>
						<view class="sub-paragraph">
							14、其他适用法律禁止寄递的物品。
						</view>
						<view class="paragraph">
							用户还应当遵守中国法律关于下述限制配送的规定：
						</view>
						<view class="sub-paragraph">
							寄递卷烟、雪茄烟每件以二条（400支）为限（二者合寄时亦限二条）。寄递烟叶、烟丝每件以5公斤为限（二者合寄不得超过10公斤）。
						</view>
						<view class="paragraph">
							第十八条 用户承诺自己在使用"充充跑腿"时不会出现以下行为，如因用户以下行为而给"充充跑腿"或任何其他第三人造成损失，用户同意承担承担所有责任，包括但不限于赔偿"充充跑腿"并使其免于因此遭受所有直接和间接损失（包括任何直接经济损失、商誉损失及对外支付的赔偿金、和解款、律师费、诉讼费）：
						</view>
						<view class="sub-paragraph">
							1、违反中国法律、法规要求以及各种社会公共利益或公共道德的行为；
						</view>
						<view class="sub-paragraph">
							2、违反"充充跑腿"相关规定的行为（包括但不限于制造虚假订单、利用系统漏洞获取利润、违规套现等）；
						</view>
						<view class="sub-paragraph">
							3、违反本协议约定的行为；
						</view>
						<view class="sub-paragraph">
							4、其他损害"充充跑腿"、骑手和其他用户利益的行为。
						</view>
						<view class="paragraph">
							第十九条 对于用户在使用"充充跑腿"中的不当行为或其他任何"充充跑腿"认为应当终止服务的情况，"充充跑腿"有权随时做出删除相关信息、终止提供服务等处理，而无须征得用户的同意。
						</view>
						<view class="paragraph">
							第二十条 对于用户在使用"充充跑腿"中出现包括但不限于与骑手串通下假单、毁损货物等损害"充充跑腿"利益的行为，"充充跑腿"有权单方终止提供服务，并要求用户双倍返还因该等行为取得的不良利益，如不足以赔偿"充充跑腿"的实际损失（包括合理的律师费用），"充充跑腿"有权进一步追偿。
						</view>
						<view class="paragraph">
							第二十一条 对于不可抗力、计算机病毒、黑客攻击、系统不稳定、用户所在位置、用户关机以及其他任何网络、技术、通信线路等原因造成的"充充跑腿"中断或不能满足用户要求的风险，用户理解并同意，"充充跑腿"对该等风险没有过错，同时，"充充跑腿"不对此承担任何责任。
						</view>
						<view class="paragraph">
							第二十二条 如果本协议中的任何条款由于对其适用的中国法律而无效或不可强制执行，则该条款应当视为自始不存在而不影响本补充协议其他条款的有效性。
						</view>
						<view class="paragraph">
							第二十三条 除非本协议另有规定，一方未行使或迟延行使本协议项下的权利、权力或特权并不构成放弃这些权利、权力和特权，而单一或部分行使 这些权利、权力和特权并不排斥行使任何其他权利、权力和特权。
						</view>
					</view>
				</view>

				<!-- 计价说明部分 -->
				<view class="section">
					<view class="section-title">《计价说明》</view>
					<view class="section-content">
						<view class="paragraph">
							充充跑腿服务分为：物件支持类跑腿服务和纯服务跑腿服务
						</view>
						<view class="paragraph">
							物件支持类跑腿服务，基础计价维度五项：物件费+距离费+时效费+夜间费+特勤溢价费
						</view>
						<view class="paragraph">
							纯服务跑腿服务，基础计价维度四项：距离费+时效费+夜间费+特勤溢价费
						</view>
						<view class="paragraph">
							备注：每一项计价维度分为起步价和分段溢价，具体金额因城市而异，可前往下单页面查看。
						</view>
						<view class="paragraph">
							特勤溢价费说明：
						</view>
						<view class="sub-paragraph">
							1、溢价是充充跑腿为了保证服务体验和骑手积极性，根据特殊情况和供求情况进行动态调整价格的策略。
						</view>
						<view class="sub-paragraph">
							2、特殊情况包括：超远距离、极端天气、夜间、节假日等可能产生溢价。
						</view>
						<view class="sub-paragraph">
							3、溢价运算公式：订单计算价*（1+溢价率）
						</view>
					</view>
				</view>

				<!-- 特殊订单撮合交易规则部分 -->
				<view class="section">
					<view class="section-title">《特殊订单撮合交易规则》</view>
					<view class="section-content">
						<view class="sub-paragraph">
							1、特殊订单是指点位超远，往往不在骑手城市服务画圈内的点位，如：景区、机场、高速服务区等
						</view>
						<view class="sub-paragraph">
							2、用户特定通道选择"特殊订单"下单，填写需求详情和愿出价，省内骑手端均可响应，骑手根据情况反馈接单价。如未达成，用户有一次改价撮合机会，达成则先付费再服务。如仍未达成订单手动或自动到时终止。
						</view>
						<view class="sub-paragraph">
							3、特殊订单用户提前24小时取消免责，全额退款。小于24小时，以订单完成时效节点，按小时扣费，扣完为止。
						</view>
					</view>
				</view>

				<!-- 取消订单扣款规则部分 -->
				<view class="section">
					<view class="section-title">《取消订单扣款规则》</view>
					<view class="section-content">
						<view class="sub-paragraph">
							1、下单后5分钟内可免费取消订单。
						</view>
						<view class="sub-paragraph">
							2、下单5分钟后，如取消订单则需以下单时效完成节点为准按小时扣费。
						</view>
						<view class="sub-paragraph">
							例如：订单费15元，完成时效5小时内，5分钟后第1小时内取消扣费3元，第2小时内取消扣6元，以此类推，扣完为止。
						</view>
						<view class="sub-paragraph">
							注：取消费用于补尝骑手为订单所做准备工作和已产生跑腿里程，感谢理解！
						</view>
						<view class="sub-paragraph">
							以下情况也可免费取消订单：
						</view>
						<view class="sub-paragraph">
							骑手接单后因故无法完成任务
						</view>
					</view>
				</view>

				<!-- 个人信息保护及隐私政策摘要部分 -->
				<view class="section">
					<view class="section-title">《个人信息保护及隐私政策摘要》</view>
					<view class="section-content">
						<view class="paragraph">
							我们非常重视用户隐私和个人信息的保护。本摘要是《个人信息保护及隐私政策》的附件，我们将通过本摘要向您简要说明充充跑腿如何收集、存储、使用、披露和保护您的个人信息。同时为了使您完整了解了解我们的隐私政策，建议您阅读完整的《个人信息保护及隐私政策》。
						</view>
						<view class="paragraph">
							一、我们如何收集和使用您的个人信息
						</view>
						<view class="sub-paragraph">
							账户信息
						</view>
						<view class="sub-paragraph">
							您使用充充跑腿服务前，需要在充充跑腿平台创建账号，充充跑腿平台的账户类型包括个人用户、企业员工用户以及商家用户。视您的账号类型不同，在账号注册过程中可能需要向我们提供您的手机号码、身份证号、身份证照片等个人信息，并设置您在充充跑腿平台的用户密码。充充跑腿平台的全部基本服务功能及大部分附加功能均需要完成账户注册后方可使用，如果您仅需使用浏览功能，则您无需注册。
						</view>
						<view class="sub-paragraph">
							位置信息
						</view>
						<view class="sub-paragraph">
							使用目的：经您授权，我们会收集您的位置信息，以便估算您周边的骑手密度，或方便您使用一键下单功能，帮助您进行消费决策等。
						</view>
						<view class="sub-paragraph">
							信息说明：位置信息来源包括IP地址、GPS以及能够提供相关信息的WLAN接入点、蓝牙和基站等传感器信息。
						</view>
						<view class="sub-paragraph">
							当您拒绝授权位置信息后，仍可以使用手动填入位置信息来使用充充跑腿的基本服务。
						</view>
						<view class="sub-paragraph">
							摄像头
						</view>
						<view class="sub-paragraph">
							使用目的：经您授权，我们会收集您的摄像头信息，以便您在设置头像、聊天、智能识别等功能中拍摄照片。
						</view>
						<view class="sub-paragraph">
							信息说明：我们仅在您使用对应功能时收集相应信息，不同系统中显示名称可能不同，例如摄像头、相机等。
						</view>
						<view class="sub-paragraph">
							当您拒绝授权摄像头信息，或关闭授权后，可能无法使用对应的功能，但不影响您使用下单等基本服务。
						</view>
						<view class="sub-paragraph">
							麦克风
						</view>
						<view class="sub-paragraph">
							使用目的：经您授权，我们会收集您的通话信息、您提出的意见等信息，以便我们处理纠纷、解决问题或向您反馈结果。
						</view>
						<view class="sub-paragraph">
							信息说明：我们仅在您使用对应功能时收集相应信息，您可以随时开启或关闭授权。
						</view>
						<view class="sub-paragraph">
							当您拒绝授权录音信息或关闭授权后，您将无法拨打我们的客服电话或客服团队无法将处理结果反馈到您，但不影响您使用充充跑腿平台的基本功能。
						</view>
						<view class="sub-paragraph">
							通讯录
						</view>
						<view class="sub-paragraph">
							使用目的：经您授权，我们会收集您的手机通讯录信息，以便您在下单过程中快速填入发件人或收件人信息。
						</view>
						<view class="sub-paragraph">
							信息说明：我们仅在您使用对应功能时收集相应信息，您可以随时开启或关闭授权。
						</view>
						<view class="sub-paragraph">
							当您拒绝授权通讯录信息或关闭授权后，您将无法使用快捷输入功能，但不影响您正常使用下单等基本服务。
						</view>
						<view class="sub-paragraph">
							设备信息
						</view>
						<view class="sub-paragraph">
							使用目的：在您访问或使用我们服务的过程中，我们会收集您的设备信息，以便获取屏幕分辨率等信息进行界面展示、避免其他设备的异常登录、留存必要的日志信息，从而保障您的账号安全、交易安全和系统运行安全。
						</view>
						<view class="sub-paragraph">
							信息说明：我们收集的设备状态包括您的设备型号、硬件序列号、设备MAC地址、唯一设备识别码（如IMEI/androidID/IDFA/OPENUDID/GUID/OAID、SIM卡IMSI、ICCID信息等设备标识符）、移动应用列表、电信运营商等。未经您的授权，我们不会提前获取以上信息。目前多数手机终端厂商支持对设备标识符的更改，以保障您对个人信息的自主控制，具体撤回或更改的方式可参见您所使用的终端设备说明。
						</view>
						<view class="sub-paragraph">
							您在使用过程中主动提供的信息
						</view>
						<view class="sub-paragraph">
							使用目的：在您使用我们提供的产品/服务过程中，我们根据您使用的特定场景可能会收集您提供的个人信息，以实现您所需要使用的功能。
						</view>
						<view class="sub-paragraph">
							信息说明：我们会根据具体的场景请求您提供对应的信息并会严格依法保护您的个人信息，例如下单需要您提供联系人信息、联系方式、收货地址信息，撰写带图评价时需要提供昵称、头像、相关评价图片/视频等发布内容。此外，如果您愿意额外补充您的其他个人资料，将有助于我们为您提供更加个性化的服务，但如果您不提供该等信息，不会影响您使用我们产品/服务的基本功能。
						</view>
						<view class="sub-paragraph">
							除法律另有规定外，我们仅会在实现目的所必需的最短时间内留存您的相关个人信息。如您希望详细了解我们所收集的具体各项个人信息及对应的场景，请查阅隐私政策正文。
						</view>
						<view class="paragraph">
							二、我们如何共享、转让、公开披露您的信息
						</view>
						<view class="sub-paragraph">
							请您知悉，我们为您提供的大部分产品或服务，是我们无法单独完成的，因此我们可能会与我们的关联公司或者其他合作方等第三方共享或委托其处理您的部分个人信息。
						</view>
						<view class="sub-paragraph">
							我们再次获得您明确的同意或授权，此类共享主要包括：根据行政、司法机关要求提供必要的信息；为提供账号安全服务的第三方提供必要信息；为提供配送、第三方支付等服务的供应商、骑手、支付机构等提供必要的信息。
						</view>
						<view class="sub-paragraph">
							我们仅会出于合法、正当、必要、特定、明确的目的共享您的个人信息，并且只会共享提供服务所必要的个人信息。同时针对接收信息的第三方，我们将会与其签署严格的信息保护和保密协定，要求其遵守协议并采取相关安全措施来保护您的信息。
						</view>
						<view class="sub-paragraph">
							我们不会将您的个人信息转让给任何公司、组织或个人，但下述情形除外：1)事先已征得您的同意；2)您自行提出的；3)如果公司发生合并、分立、解散、收购或破产清算，将可能涉及到个人信息转让，此种情况下我们会告知您有关情况并要求新的持有您个人信息的公司名称及联系方式，并确保其继续受本政策的约束。否则我们将要求其重新获取您的明示同意；4)其他法律法规规定的情形。
						</view>
						<view class="sub-paragraph">
							我们仅会在以下情况下，公开披露您的个人信息：1)获得您明确同意后；2)基于法律的披露：在法律、法律程序、诉讼或政府主管部门强制性要求的情况下，我们可能会公开披露您的个人信息，且不再另行通知您；3) 当您和平台其他用户发生法律纠纷或其他可能涉及法律诉讼的情形时，基于其他平台用户或者任何第三人的申请、并提供初步证据的披露，同时我们会保留申请人披露记录，以备您随时查询您个人信息的披露情况。
						</view>
						<view class="paragraph">
							三、您如何管理您的信息
						</view>
						<view class="sub-paragraph">
							您有权管理您的个人信息，包括访问、更正、删除您的个人信息、撤回授权我们收集您的个人信息的同意或变更授权范围，以及注销您的账号等。您可以通过我们的APP中提供的相应功能或隐私管理中进行上述操作。
						</view>
						<view class="sub-paragraph">
							如果您无法通过上述方式进行管理，也可以通过本摘要提供的联系方式联系我们，我们将在15日内回复您的要求。
						</view>
						<view class="paragraph">
							四、我们如何使用相关算法
						</view>
						<view class="sub-paragraph">
							我们为了将用户订单分配给充充跑腿员，完成订单，使用了调度决策类相关算法，并将其公示给您供您查阅。
						</view>
						<view class="sub-paragraph">
							算法的基本原理，是在用户下单而产生订单后，以订单信息和范围内充充跑腿员的匹配分为权重，找到整体的权重最优的匹配结果，将订单分配给该充充跑腿员。
						</view>
						<view class="sub-paragraph">
							算法的应用场景是充充跑腿网页端、充充跑腿APP、充充跑腿小程序、充充跑腿商家版网页端、充充跑腿商家版APP下单后以及充充跑腿员APP开启听单后的订单分配场景。
						</view>
						<view class="sub-paragraph">
							在经过安全加密技术处理、严格去标识化且无法重新识别特定个人的前提下，我们可能会将所收集的数据用于算法的模型优化，并不断调整算法的效果，不会未经您的同意将之用于任何其他目的。
						</view>
						<view class="paragraph">
							五、我们如何做好未成年人保护
						</view>
						<view class="sub-paragraph">
							我们非常重视对未成年人信息的保护并将根据国家相关法律法规的规定保护儿童个人信息。如果您是未满18周岁的未成年人，您的监护人需要仔细阅读本政策并授权您同意依照本政策使用充充跑腿平台。如果您是未满14周岁的未成年人，您的监护人需要仔细阅读本政策并同意您依照本政策使用充充跑腿平台。请您和您的监护人仔细阅读我们的隐私政策正文，并在指导下使用我们的服务。
						</view>
						<view class="paragraph">
							六、您如何联系我们
						</view>
						<view class="sub-paragraph">
							您可以通过以下方式联系我们，我们将在15日内回复您的要求：
						</view>
						<view class="sub-paragraph">
							1)客服电话：400-1788-147；
						</view>
						<view class="sub-paragraph">
							2)违法和不良信息举报电话：19822909390（微信同号）；
						</view>
						<view class="sub-paragraph">
							3)违法和不良信息举报邮箱：19822909390@163.com；
						</view>
					</view>
				</view>
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
			navBarHeight: 0
		}
	},
	onLoad() {
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
		this.navBarHeight = menuButtonInfo.bottom + 12
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
	font-family: "HarmonyOS Sans SC", sans-serif;
	position: relative;
	overflow: hidden;
}

.watermark {
	content: "充充跑腿CCPT-共享行业跑腿平台";
	position: fixed;
	transform: translate(-50%, -50%) rotate(-30deg);
	font-size: 24rpx;
	color: rgba(0, 0, 0, 0.15);
	white-space: nowrap;
	pointer-events: none;
	z-index: 999;
}

.watermark-1 {
	@extend .watermark;
	top: 12%;
	left: 25%;
	transform: translate(-50%, -50%) rotate(-15deg);
}

.watermark-2 {
	@extend .watermark;
	top: 38%;
	left: 80%;
	transform: translate(-50%, -50%) rotate(-45deg);
}

.watermark-3 {
	@extend .watermark;
	top: 62%;
	left: 20%;
	transform: translate(-50%, -50%) rotate(-30deg);
}

.watermark-4 {
	@extend .watermark;
	top: 88%;
	left: 75%;
	transform: translate(-50%, -50%) rotate(-60deg);
}

.watermark-5 {
	@extend .watermark;
	top: 22%;
	left: 65%;
	transform: translate(-50%, -50%) rotate(-25deg);
}

.watermark-6 {
	@extend .watermark;
	top: 72%;
	left: 35%;
	transform: translate(-50%, -50%) rotate(-40deg);
}

.content {
	padding: 30rpx;
	position: relative;
	z-index: 1;
}

.agreement-content {
	background-color: #FFFFFF;
	border-radius: 20rpx;
	padding: 30rpx;
}

.section {
	margin-bottom: 40rpx;
	
	&:last-child {
		margin-bottom: 0;
	}
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
	margin-bottom: 20rpx;
	padding-left: 20rpx;
	border-left: 8rpx solid #2492F2;
}

.section-content {
	background-color: #F8F8F8;
	border-radius: 12rpx;
	padding: 20rpx;
}

.paragraph {
	font-size: 28rpx;
	color: #333333;
	line-height: 1.6;
	margin-bottom: 16rpx;
	
	&:last-child {
		margin-bottom: 0;
	}
}

.sub-paragraph {
	font-size: 28rpx;
	color: #666666;
	line-height: 1.6;
	margin-bottom: 12rpx;
	padding-left: 20rpx;
	
	&:last-child {
		margin-bottom: 0;
	}
}
</style> 