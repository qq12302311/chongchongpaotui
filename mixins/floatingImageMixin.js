// FloatingImage组件页面显示/隐藏事件mixin
// 用于在使用FloatingImage组件的页面中自动触发pageShow和pageHide事件

export default {
  onShow() {
    // 触发页面显示事件（通知FloatingImage组件）
    uni.$emit('pageShow');
  },
  
  onHide() {
    // 触发页面隐藏事件（通知FloatingImage组件）
    uni.$emit('pageHide');
  }
}

