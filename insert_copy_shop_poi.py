from pathlib import Path
text = Path("pages/order/detail.vue").read_text(encoding="utf-8")
marker = "// 复制"
idx = text.find(marker, text.find('copyOrderNumber'))
if idx == -1:
    raise SystemExit('comment marker not found')
method_start = text.find('copyDeviceCode(code)', idx)
if method_start == -1:
    raise SystemExit('method start not found')
method_end = text.find('\n\t\t\t},\n', method_start)
if method_end == -1:
    raise SystemExit('method end not found')
insert_pos = method_end + len('\n\t\t\t},\n')
addition = "\n\t\t\tcopyShopPoi(poi) {\n\t\t\t\tif (!poi) {\n\t\t\t\t\tuni.showToast({\n\t\t\t\t\t\ttitle: '门店POI为空',\n\t\t\t\t\t\ticon: 'none'\n\t\t\t\t\t});\n\t\t\t\t\treturn;\n\t\t\t\t}\n\n\t\t\t\tuni.setClipboardData({\n\t\t\t\t\tdata: poi,\n\t\t\t\t\tsuccess: () => {\n\t\t\t\t\t\tuni.showToast({\n\t\t\t\t\t\t\ttitle: '门店POI已复制',\n\t\t\t\t\t\t\ticon: 'success'\n\t\t\t\t\t\t});\n\t\t\t\t\t},\n\t\t\t\t\tfail: (error) => {\n\t\t\t\t\t\tconsole.error('复制失败:', error);\n\t\t\t\t\t\tuni.showToast({\n\t\t\t\t\t\t\ttitle: '复制失败',\n\t\t\t\t\t\t\ticon: 'none'\n\t\t\t\t\t\t});\n\t\t\t\t\t}\n\t\t\t\t});\n\t\t\t},\n"
text = text[:insert_pos] + addition + text[insert_pos:]
Path("pages/order/detail.vue").write_text(text, encoding="utf-8")
