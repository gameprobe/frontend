import json
from pathlib import Path
from PIL import Image,ImageChops
root=Path('docs/visual-qa/assets/TASK-FE-027')
before=json.loads((root/'before-results.json').read_text())
after=json.loads((root/'after-results.json').read_text())
b={s['name']:s for s in before['states']}
r={'state_comparisons':[],'regression':[]}
for s in after['states']:
 name=s['name'];old=b[name]
 if name.endswith('ascent'):
  for key in ['pins','paths']:
   assert old[key]==s[key],(name,key,old[key],s[key])
  assert [m['transform'] for m in old['map']]==[m['transform'] for m in s['map']],name
  r['state_comparisons'].append({'name':name,'pins_paths_rotation':'identical'})
 if name in ['1440-home','1440-profile']:
  assert old['regression']==s['regression'],name+' DOM/style/rect differs'
  a=Image.open(root/old['file']).convert('RGB');z=Image.open(root/s['file']).convert('RGB')
  assert a.size==z.size,(name,a.size,z.size)
  d=ImageChops.difference(a,z);bbox=d.getbbox();count=sum(1 for px in d.getdata() if px!=(0,0,0))
  r['regression'].append({'name':name,'size':list(a.size),'changed_pixels':count,'difference_bbox':bbox,'DOM_style_rect':'identical'})
  if bbox:d.save(root/(name+'-regression-diff.png'))
  assert count==0,name+' screenshot differs'
r['status']='PASS'
(root/'comparison-results.json').write_text(json.dumps(r,indent=2))
print(json.dumps(r))
