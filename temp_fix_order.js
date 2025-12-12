const fs = require('fs');

// 读取文件
const content = fs.readFileSync('pages/order/order.vue', 'utf8');
const lines = content.split('\n');

// 新的代码行（第304-333行）
const newCode = [
    '\t\t\t\t// 获取状态值（可能是字符串或数组）',
    '\t\t\t\tconst statusValue = statusMap[this.currentTab]',
    '\t\t\t\t',
    '\t\t\t\t// 构建请求参数，status 直接传递（字符串或数组）',
    '\t\t\t\tconst params = {',
    '\t\t\t\t\tstatus: statusValue,',
    '\t\t\t\t\tuser_id: userInfo.user_id,',
    '\t\t\t\t\tsign: sign,',
    '\t\t\t\t\tper_page: 20,',
    '\t\t\t\t\tpage: this.page',
    '\t\t\t\t}',
    '',
    '\t\t\t\tconsole.log(\'请求订单列表参数:\', params)',
    '\t\t\t\tconsole.log(\'当前标签:\', this.tabs[this.currentTab], \'status值:\', statusValue)',
    '',
    '\t\t\t\tconst res = await this.$request(\'task/list\', params, \'POST\')',
    '',
    '\t\t\t\tconsole.log(\'订单列表返回结果:\', res)',
    '\t\t\t\tconsole.log(\'返回的订单数量:\', res.data ? res.data.length : 0)',
    '\t\t\t\t',
    '\t\t\t\tif (res.code === 200) {',
    '\t\t\t\t\tlist = res.data || []',
    '\t\t\t\t} else {',
    '\t\t\t\t\tconsole.error(\'加载订单失败:\', res.msg || \'未知错误\')',
    '\t\t\t\t\tuni.showToast({',
    '\t\t\t\t\t\ttitle: res.msg || \'加载失败\',',
    '\t\t\t\t\t\ticon: \'none\'',
    '\t\t\t\t\t})',
    '\t\t\t\t\tthis.loading = false',
    '\t\t\t\t\treturn',
    '\t\t\t\t}'
];

// 组合新文件：前303行 + 新代码 + 第363行之后
const newLines = [
    ...lines.slice(0, 303),
    ...newCode,
    ...lines.slice(362)
];

// 写入文件
fs.writeFileSync('pages/order/order.vue', newLines.join('\n'), 'utf8');
console.log('✅ 文件修改成功！已将第304-362行替换为简化的合并请求逻辑。');