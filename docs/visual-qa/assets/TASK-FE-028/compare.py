import json
from pathlib import Path
from PIL import Image, ImageChops
root = Path(__file__).resolve().parent
before = json.loads((root / 'before.json').read_text())
after = json.loads((root / 'after.json').read_text())
results = []
for old, new in zip(before['states'], after['states']):
    assert (old['name'], old['width']) == (new['name'], new['width'])
    a = Image.open(root / old['file']).convert('RGB')
    b = Image.open(root / new['file']).convert('RGB')
    top = int(old['nav']['y'] + old['nav']['height'])
    diff = ImageChops.difference(a.crop((0,top,a.width,a.height)), b.crop((0,top,b.width,b.height)))
    changed = sum(pixel != (0,0,0) for pixel in diff.getdata())
    results.append({'page':old['name'],'width':old['width'],'below_header_changed_pixels':changed,'header_geometry_unchanged':old['nav']==new['nav'],'document_overflow':new['overflow']})
output = {'results':results}
(root/'comparison.json').write_text(json.dumps(output,indent=2)+'\n')
print(json.dumps(output))
