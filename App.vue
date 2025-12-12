<template>
	<view>
		<view class="container">
			<slot></slot>
		</view>
	</view>
</template>

<script>
export default {
	onLaunch: function() {
		console.log('App Launch')
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	},
	onPageNotFound() {
		uni.switchTab({
			url: '/pages/index/index'
		})
	}
}
</script>

<style>
	/*每个页面公共css */
	page {
		background-color: #f5f5f5;
		font-family: "HarmonyOS Sans SC", sans-serif;
	}

	/* 状态栏高度 */
	.status-bar {
		height: var(--status-bar-height);
		width: 100%;
	}

	/* 导航栏高度 */
	.nav-bar {
		height: 44px;
	}

	/* 顶部安全区域 */
	.top-safe-area {
		height: constant(safe-area-inset-top);
		height: env(safe-area-inset-top);
	}

	/* 设置所有文本元素的字体 */
	view, text {
		font-family: "HarmonyOS Sans SC", sans-serif;
	}
	
	.mar-0-i{
		margin:0px !important;
	}
	
	.font-size-9-i{
		font-size: 18rpx !important;
	}
	/*台时券*/
	.color-tsq{
		color: #448DFF !important;
	}
	/*预付款*/
	.color-yfk{
		color: #00D364 !important;
	}
	/*优惠券*/
	.color-yhq{
		color: #FFB608 !important;
	}
	/*抖音团购*/
	.color-dytg{
		color: #FF3D37 !important;
	}
	/*美团团购*/
	.color-mttg{
		color: #6812FF !important;
	}
	/*快手团购*/
	.color-kstg{
		color: #F912FF !important;
	}
	/*余额订单*/
	.color-yedd{
		color: #73C0DE !important;
	}
	
	.n-zi-zhu{
		color: #C81D23;
	}
	
	.nbody {
		border-radius: 8px;
		background-color: #fff;
		margin: 0px 10px 0px 10px;
		padding: 10px;
	}
	
	// 间隔槽
	.zy-line {
		height: 1px;
		background-color: #e5e5e5;
	}
	
	.main-1 {
		position: relative;
		min-height: 100vh;
		// color: #333
	}
	
	.main-body {
		width: 100%;
		border-radius: 8px;
		background: #fff;
		padding: 10px 10px 10px 10px;
	}
	
	.main {
		padding: 10px;
		position: relative;
		min-height: 100vh;
		background-image: linear-gradient(#FFE500, #fff);
	}
	
	
	//弹性布局
	.dis_flex {
		display: flex;
	}
	
	// 这是换行属性：nowrap（不换行）、wrap（换行）、wrap-reverse（方向换行）
	.fle-wra {
		flex-wrap: wrap;
	}
	
	/*左右对齐*/
	.jus-con {
		justify-content: space-between;
	}
	
	/*中间对齐*/
	.jus-con-spa-eve {
		justify-content: space-evenly;
	}
	
	/*左右对齐 - 左右有间隔*/
	.jus-aro {
		justify-content: space-around;
	}
	
	/*左右对齐*/
	.jus-bet {
		justify-content: space-between;
	}
	
	//居中对齐
	.jus-cen {
		justify-content: center;
	}
	
	//左对齐
	.jus-sta {
		justify-content: flex-start;
	}
	
	//右对齐
	.jus-end {
		justify-content: flex-end;
	}
	
	//每个项目两侧的间隔相等
	.jus-aro {
		justify-content: space-around;
	}
	
	.flex-1{
		flex: 1
	}
	
	.flex-2{
		flex: 2
	}
	
	.flex-3{
		flex: 3
	}
	
	.flex-4{
		flex: 4
	}
	
	.flex-5{
		flex: 4
	}
	
	.flex-6{
		flex: 4
	}
	
	.flex-7{
		flex: 4
	}
	
	.flex-8{
		flex: 4
	}
	
	// 子元素水平垂直居中
	.son-conter {
		display: grid;
		place-items: center;
	}
	
	//居中
	.ali-ite {
		align-items: center;
	}
	
	//居底部
	.ali-ite-end {
		align-items: flex-end;
	}
	
	// 如果项目未设置高度或设为auto，将占满整个容器的高度
	.ali-str {
		align-items: stretch;
	}
	
	// 项目的第一行文字的基线对齐。
	.ali-bas {
		align-items: baseline;
	}
	
	//垂直居中
	.fle-flo {
		flex-flow: column;
	}
	
	/*四字对齐*/
	.text-align-last {
		width: 90rpx;
		text-align-last: justify;
	}
	
	
	//内容居中
	.text-align {
		text-align: center;
	}
	
	//内容居右
	.text-align-right {
		text-align: right;
	}
	
	//居中
	.mar-aut {
		margin: auto;
	}
	
	.bor-rad-6 {
		border-radius: 6px;
	}
	
	.bor-rad-8 {
		border-radius: 8px;
	}
	
	/*按钮点击反馈效果*/
	.wsui-btn__hover_list {
		opacity: 0.7;
		background: #FFFFFF;
		position: relative;
		top: 3rpx;
		left: 3rpx;
		box-shadow: 0px 0px 8px rgba(0, 0, 0, .1) inset;
	}
	
	.blueButton {
		background: #0051BA;
		color: #FFFFFF;
	}
	
	.col-fff {
		color: #FFFFFF;
	}
	
	/*font-size*/
	.fon-siz-8 {
		font-size: 8px;
	}
	
	.fon-siz-9 {
		font-size: 9px;
	}
	
	.fon-siz-10 {
		font-size: 10px;
	}
	
	.fon-siz-11 {
		font-size: 11px;
	}
	
	.fon-siz-12 {
		font-size: 12px;
	}
	
	.fon-siz-13 {
		font-size: 13px;
	}
	
	.fon-siz-14 {
		font-size: 14px;
	}
	
	.fon-siz-15 {
		font-size: 15px;
	}
	
	.fon-siz-16 {
		font-size: 16px;
	}
	
	.fon-siz-17 {
		font-size: 17px;
	}
	
	.fon-siz-18 {
		font-size: 18px;
	}
	
	.fon-siz-19 {
		font-size: 19px;
	}
	
	.fon-siz-20 {
		font-size: 20px;
	}
	
	.fon-siz-21 {
		font-size: 21px;
	}
	
	.font-size-18rpx {
		font-size: 18rpx;
	}
	
	.font-size-19rpx {
		font-size: 19rpx;
	}
	
	.font-size-20rpx {
		font-size: 20rpx;
	}
	
	.font-size-21rpx {
		font-size: 21rpx;
	}
	
	.font-size-22rpx {
		font-size: 22rpx;
	}
	
	.font-size-23rpx {
		font-size: 23rpx;
	}
	
	.font-size-24rpx {
		font-size: 24rpx;
	}
	
	.font-size-25rpx {
		font-size: 25rpx;
	}
	
	.font-size-26rpx {
		font-size: 26rpx;
	}
	
	.font-20-medium{
		font-family: SourceHanSansCN-Medium;
		font-size: 20px;
		letter-spacing: 0;
		text-align: right;
		font-weight: 500;
	}
	
	.font-18-medium{
		font-family: SourceHanSansCN-Medium;
		font-size: 18px;
		letter-spacing: 0;
		font-weight: 500;
	}
	
	.font-14-regular{
		font-family: SourceHanSansCN-Regular;
		font-size: 14px;
		letter-spacing: 0;
		font-weight: 400;
	}
	
	.font-13-regular{
		font-family: SourceHanSansCN-Regular;
		font-size: 13px;
		letter-spacing: 0;
		font-weight: 400;
	}
	
	.font-12-regular{
		font-family: SourceHanSansCN-Regular;
		font-size: 12px;
		letter-spacing: 0;
		font-weight: 400;
	}
	
	.font-11-regular{
		font-family: SourceHanSansCN-Regular;
		font-size: 11px;
		letter-spacing: 0;
		font-weight: 400;
	}
	
	/*font-weight*/
	.fon-wei-bol {
		font-weight: bolder;
	}
	
	/*margin*/
	.mar-top-1 {
		margin-top: 1px;
	}
	.mar-top-2 {
		margin-top: 2px;
	}
	
	.mar-top-3 {
		margin-top: 3px;
	}
	
	.mar-top-4 {
		margin-top: 4px;
	}
	
	.mar-top-5 {
		margin-top: 5px;
	}
	
	.mar-top-6 {
		margin-top: 6px;
	}
	
	.mar-top-7 {
		margin-top: 7px;
	}
	
	.mar-top-8 {
		margin-top: 8px;
	}
	
	.mar-top-10 {
		margin-top: 10px;
	}
	
	.mar-top-15 {
		margin-top: 15px;
	}
	
	.mar-top-20 {
		margin-top: 20px;
	}
	
	.mar-top-25 {
		margin-top: 25px;
	}
	
	.mar-top-30 {
		margin-top: 30px;
	}
	
	.mar-top-40 {
		margin-top: 40px;
	}
	
	.mar-rig-2 {
		margin-right: 2px;
	}
	
	.mar-rig-3 {
		margin-right: 3px;
	}
	
	.mar-rig-4 {
		margin-right: 4px;
	}
	
	.mar-rig-5 {
		margin-right: 5px;
	}
	
	.mar-rig-7 {
		margin-right: 7px;
	}
	
	.mar-rig-8 {
		margin-right: 8px;
	}
	
	.mar-rig-10 {
		margin-right: 10px;
	}
	
	.mar-rig-15 {
		margin-right: 15px;
	}
	
	.mar-rig-20 {
		margin-right: 20px;
	}
	
	.mar-rig-25 {
		margin-right: 25px;
	}
	
	.mar-rig-30 {
		margin-right: 30px;
	}
	
	.mar-bot-1 {
		margin-bottom: 1px;
	}
	
	.mar-bot-2 {
		margin-bottom: 2px;
	}
	
	.mar-bot-3 {
		margin-bottom: 3px;
	}
	
	.mar-bot-4 {
		margin-bottom: 4px;
	}
	
	.mar-bot-5 {
		margin-bottom: 5px;
	}
	
	.mar-bot-7 {
		margin-bottom: 7px;
	}
	
	.mar-bot-8 {
		margin-bottom: 8px;
	}
	
	.mar-bot-10 {
		margin-bottom: 10px;
	}
	
	.mar-bot-15 {
		margin-bottom: 15px;
	}
	
	.mar-bot-20 {
		margin-bottom: 20px;
	}
	
	.mar-bot-30 {
		margin-bottom: 30px;
	}
	
	.mar-bot-40 {
		margin-bottom: 40px;
	}
	
	.mar-lef-2 {
		margin-left: 2px;
	}
	
	.mar-lef-3 {
		margin-left: 3px;
	}
	
	.mar-lef-4 {
		margin-left: 4px;
	}
	
	.mar-lef-5 {
		margin-left: 5px;
	}
	
	.mar-lef-6 {
		margin-left: 6px;
	}
	
	.mar-lef-8 {
		margin-left: 8px;
	}
	
	.mar-lef-10 {
		margin-left: 10px;
	}
	
	.mar-lef-15 {
		margin-left: 15px;
	}
	
	.mar-lef-20 {
		margin-left: 20px;
	}
	
	.mar-lef-25 {
		margin-left: 25px;
	}
	
	.mar-lef-30 {
		margin-left: 30px;
	}
	
	.margin-10 {
		margin: 10px;
	}
	
	.padding-2 {
		padding: 2px;
	}
	
	.padding-3 {
		padding: 3px;
	}
	
	.padding-4 {
		padding: 4px;
	}
	
	.padding-5 {
		padding: 5px;
	}
	
	.padding-10 {
		padding: 10px;
	}
	
	.padding-15 {
		padding: 15px;
	}
	
	.padding-20 {
		padding: 20px;
	}
	
	.padding-30 {
		padding: 30px;
	}
	
	.padding-40 {
		padding: 40px;
	}
	
	.pad-lef-5 {
		padding-left: 5px;
	}
	
	.pad-lef-4 {
		padding-left: 4px;
	}
	
	.pad-lef-3 {
		padding-left: 3px;
	}
	
	.pad-lef-2 {
		padding-left: 2px;
	}
	
	.pad-lef-1 {
		padding-left: 1px;
	}
	
	.pad-bot-10 {
		padding-bottom: 10px;
	}
	
	.pad-top-10 {
		padding-top: 10px;
	}
	
	.pad-top-15 {
		padding-top: 15px;
	}
	
	.zi-qian-hui-2 {
		color: #929292;
	}
	
	.zi-hui-fu {
		color: #898989;
	}
	
	.zi-qian-hui {
		color: #898989;
	}
	
	// 主题蓝色
	.zhulan {
		color: #0051BA;
	}
	
	.zhucheng {
		color: #FFDA1A;
	}
	
	.zhuhui {
		color: #8a8a8a;
	}
	
	.zhuhong {
		color: red;
	}
	
	.se-red {
		color: red;
	}
	
	/**
	 * 成功颜色
	 */
	.se-chenggong {
		color: #19be6b;
	}
	
	/**
	 * 提醒颜色
	 */
	.se-tixing {
		color: #ff9900;
	}
	
	.zi-lv {
		color: #19be6b;
	}
	
	.ziti-bai {
		color: #fff;
	}
	
	.ziti-hei {
		color: #333;
	}
	
	.dis_non {
		display: none;
	}
	
	.dabiaoti {
		font-size: 16px;
		color: #0051BA;
		font-weight: bolder;
	}
	
	.main-body-e {
		padding: 20px;
		background-color: #ffffff;
		border-radius: 8px;
	}
	
	._h1_32 {
		font-size: 32rpx;
		font-weight: bold;
	}
	
	._h1 {
		font-size: 26rpx;
		font-weight: bold;
	}
	
	.padding-sx {
		padding: 7px 0;
	}
	
	.lin-hei-30 {
		line-height: 30px;
	}
	
	.zi-zhu {
		color: #06C160;
	}
	
	.zi-lan {
		color: #2979FF;
	}
	
	.zi-chenggong {
		color: #67C23A;
	}
	
	.zi-hong {
		color: red;
	}
	
	.text-ali-lef {
		text-align: left;
	}
	
	.text-ali-rig {
		text-align: right;
	}
	
	._hh1p_nb {
		font-size: 34rpx;
	}
	
	._hh1_nb {
		font-size: 26rpx;
	}
	
	.pos-rel {
		position: relative;
	}
	
	.pos-abs {
		position: absolute;
	}
	
	.pos-fix {
		position: fixed;
	}
	
	/**
	 * 黏性定位
	 */
	.pos-sti-top {
		position: sticky;
		top: 68px;
	}
	
	.zi-chengse {
		color: #FF6B00;
	}
	
	.zi-tixing {
		color: #E6A23C;
	}
	
	.zi-shouyilv {
		color: #419579;
	}
	
	.zi-zhuse {
		color: rgba(0, 81, 186, 1)
	}
	
	.zi-red {
		color: red;
	}
	
	.zi-hui {
		color: #ccc;
	}
	
	.zi-qianhui {
		color: #8A8A8A;
	}
	
	.main {
		padding: 10px;
		position: relative;
		min-height: 100vh;
		background-image: linear-gradient(#022F97, #E4E4E5);
	}
	
	.lin-hei-10 {
		line-height: 10px;
	}
	
	.lin-hei-20 {
		line-height: 20px;
	}
	
	
	._h2 {
		font-size: 24rpx;
		font-weight: bold;
	}
</style>
