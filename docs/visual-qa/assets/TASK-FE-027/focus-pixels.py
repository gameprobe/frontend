from pathlib import Path
from PIL import Image
import json,re,math
root=Path('docs/visual-qa/assets/TASK-FE-027')
r=json.loads((root/'focus-final-results.json').read_text())
result={'states':[]}
for s in r['focus']:
 rect=s['rect'];im=Image.open(root/f"after-focus-{s['width']}-{s['kind']}.png").convert('RGB')
 box=(max(0,math.floor(rect['x'])-7),max(0,math.floor(rect['y'])-7),min(im.width,math.ceil(rect['x']+rect['width'])+7),min(im.height,math.ceil(rect['y']+rect['height'])+7))
 crop=im.crop(box);color=tuple(map(int,re.findall(r'\d+',s['outlineColor'])))
 pixels=crop.get_flattened_data() if hasattr(crop,'get_flattened_data') else crop.getdata()
 count=sum(1 for value in pixels if value==color)
 result['states'].append({'width':s['width'],'route':s['kind'],'outlineColor':color,'outlinePixelsInCardRegion':count,'region':box})
 assert count>=100,f"{s['width']} {s['kind']}: focus outline not visibly painted ({count} exact-color pixels)"
result['status']='PASS'
(root/'focus-pixel-results.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result))
