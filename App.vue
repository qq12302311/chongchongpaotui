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
</style>
