<template>
	<view class="box-bg">
		<uni-nav-bar :color="color" :left-icon="leftIcon" :backgroundColor="backgroundColor" :title="title" fixed :border="false" :statusBar="true"
			:autoBack="autoBack" @clickLeft="clickLeft" :text_left_icon="text_left_icon" :text_right_icon="text_right_icon"/>
	</view>
	<!-- <view>
		<u-navbar :leftIcon="leftIcon" :placeholder="true" :title="title" :titleStyle="titleStyle" :bgColor="bgColor">
		</u-navbar>
	</view> -->
</template>

<script>
	export default {
		data() {
			return {}
		},
		props: {
			// 左侧图标，周洋
			text_left_icon: {
				type: Object,
				default: {},
			},
			// 右侧图标，周洋
			text_right_icon: {
				type: Object,
				default: {},
			},
			color: {
				type: String,
				default: ''
			},
			titleStyle: {
				type: String,
				default: ''
			},
			backgroundColor: {
				type: String,
				default: ''
				// default: '#FFE500'
			},
			title: {
				type: String,
				default: '阿杆24h自助台球'
			},
			leftIcon: {
				type: String,
				default: 'left'
			},
			// 周扬2024年3月20日
			// 如果配置了autoBack，自动返回上一页
			autoBack: {
				type: [Boolean],
				default: false
			},
			// 周扬2024年5月26日
			// 为了解决扫描二维码进入开台页返回页面出现空白页的问题
			jumpType: {
				type: [Boolean],
				default: false
			},
			// leftIcon: {
			// 	type: String,
			// 	default: 'arrow-left'
			// },
		},
		methods: {
			// 返回上一页触发事件
			clickLeft(){
				this.$emit("clickLeft");
			},
		},
	}
</script>

<style lang="scss">
	$nav-height: 30px;

	.box-bg {
		background-color: #F5F5F5;
		padding: 0 0 5px 0;
	}

	.city {
		/* #ifndef APP-PLUS-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		// width: 160rpx;
		margin-left: 4px;
	}

	.input-view {
		/* #ifndef APP-PLUS-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		// width: 500rpx;
		flex: 1;
		background-color: #f8f8f8;
		height: $nav-height;
		border-radius: 15px;
		padding: 0 15px;
		flex-wrap: nowrap;
		margin: 7px 0;
		line-height: $nav-height;
	}

	.input-uni-icon {
		line-height: $nav-height;
	}

	.nav-bar-input {
		height: $nav-height;
		line-height: $nav-height;
		/* #ifdef APP-PLUS-NVUE */
		width: 370rpx;
		/* #endif */
		padding: 0 5px;
		font-size: 12px;
		background-color: #f8f8f8;
	}
</style>