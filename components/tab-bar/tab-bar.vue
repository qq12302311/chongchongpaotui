<template>
	<view class="tab-bar-container">
		<view class="tab-bar">
			<view class="tab-bar-content">
				<view
					class="tab-item"
					:class="{ active: current === 0 }"
					@tap="onChange(0)"
				>
					<image
						class="icon"
						:src="current === 0 ? 'https://ccpt.qiniu.0871.cn/home-active.svg' : 'https://ccpt.qiniu.0871.cn/home2.svg'"
					></image>
					<text class="text" :class="{ active: current === 0 }">首页</text>
				</view>

				<view
					class="tab-item"
					:class="{ active: current === 1 }"
					@tap="onChange(1)"
				>
					<image
						class="icon"
						:src="current === 1 ? 'https://ccpt.qiniu.0871.cn/order2-active.svg' : 'https://ccpt.qiniu.0871.cn/order2.svg'"
					></image>
					<text class="text" :class="{ active: current === 1 }">订单</text>
				</view>

				<view
					class="tab-item"
					:class="{ active: current === 2 }"
					@tap="onChange(2)"
				>
					<image
						class="icon"
						:src="current === 2 ? 'https://ccpt.qiniu.0871.cn/duihua-active.svg' : 'https://ccpt.qiniu.0871.cn/duihua.svg'"
					></image>
					<text class="text" :class="{ active: current === 2 }">对话</text>
				</view>

				<view
					class="tab-item"
					:class="{ active: current === 3 }"
					@tap="onChange(3)"
				>
					<image
						class="icon"
						:src="current === 3 ? 'https://ccpt.qiniu.0871.cn/my-active.svg' : 'https://ccpt.qiniu.0871.cn/my.svg'"
					></image>
					<text class="text" :class="{ active: current === 3 }">我的</text>
				</view>
			</view>
		</view>
		<view class="safe-area"></view>
	</view>
</template>

<script>
export default {
	name: 'tab-bar',
	data() {
		return {
			current: 0,
			activeColor: '#2979ff',
			inactiveColor: '#909399'
		}
	},
	watch: {
		$route: {
			handler(to) {
				this.updateCurrent()
			},
			immediate: true
		}
	},
	methods: {
		onChange(index) {
			const routes = [
				'/pages/index/index',
				'/pages/order/order',
				'/pages/chat/chat-list',
				'/pages/my/my'
			]

			// 首页、订单、我的使用switchTab
			uni.switchTab({
				url: routes[index]
			})
		},
		updateCurrent() {
			const pages = getCurrentPages()
			const currentPage = pages[pages.length - 1]
			if (!currentPage) return

			const route = `/${currentPage.route}`
			const routeMap = {
				'/pages/index/index': 0,
				'/pages/order/order': 1,
				'/pages/chat/chat-list': 2,
				'/pages/my/my': 3
			}

			if (routeMap[route] !== undefined) {
				this.current = routeMap[route]
			}
		}
	},
	onLoad() {
		this.updateCurrent()
	},
	onShow() {
		this.updateCurrent()
	}
}
</script>

<style lang="scss" scoped>
.tab-bar-container {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 999;
	display: flex;
	flex-direction: column;
}

.tab-bar {
	background-color: #ffffff;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.tab-bar-content {
	height: 100rpx;
	display: flex;
	align-items: center;
	justify-content: space-around;
	position: relative;
	padding: 0 10rpx;
}

.tab-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	position: relative;
}

.tab-item .icon {
	width: 44rpx;
	height: 44rpx;
	margin-bottom: 4rpx;
}

.tab-item .text {
	font-size: 24rpx;
	color: #909399;
}

.tab-item .text.active {
	color: #2979ff;
}

.center-item-wrapper {
	position: relative;
	height: 100%;
	margin-top: -60rpx;
}

.center-item-wrapper .text {
	position: absolute;
	bottom: -30rpx;
	left: 50%;
	transform: translateX(-50%);
	white-space: nowrap;
}

.center-item {
	width: 120rpx;
	height: 120rpx;
	background: #ffffff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	left: 50%;
	bottom: 0;
	transform: translateX(-50%);
	box-shadow: 0 -8rpx 20rpx rgba(41, 121, 255, 0.2);
}

.center-item .icon {
	width: 100rpx;
	height: 100rpx;
	margin-bottom: 0;
}

.safe-area {
	height: constant(safe-area-inset-bottom);
	height: env(safe-area-inset-bottom);
	background-color: #ffffff;
	width: 100%;
}
</style>