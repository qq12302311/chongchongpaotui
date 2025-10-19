import re
from pathlib import Path
path = Path('pages/order/detail.vue')
text = path.read_text(encoding='utf-8')
text, count = re.subn(r"'assigned': '.*?'", "'assigned': '充充小哥在路上...'", text, count=1)
text, count2 = re.subn(r"'finished': '.*?'", "'finished': '待确认'", text, count=1)
text, count3 = re.subn(r"'cancel': '.*?'", "'cancel': '已取消'", text, count=1)
text, count4 = re.subn(r"'completed': '.*?'", "'completed': '已完成'", text, count=1)
text = re.sub(r"getBrandDisplay\(\) \{\s*return this.getBrandText\(this.orderInfo.brand\) \|\| '.*?'\s*\}", "getBrandDisplay() {\n\t\t\t\treturn this.getBrandText(this.orderInfo.brand) || '充充'\n\t\t\t}", text, count=1)
path.write_text(text, encoding='utf-8')
