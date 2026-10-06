import json
from pathlib import Path
from PIL import Image, ImageChops

directory = Path(__file__).resolve().parent
before = json.loads((directory / 'before.json').read_text())
after = json.loads((directory / 'after.json').read_text())
result = {'status': 'PASS', 'geometry': [], 'pixels': []}
geometry_keys = ['mapCards', 'guideCards', 'rotation', 'pins', 'paths', 'lines', 'detailLink', 'nav']
for old in before['screenshots']:
    new = next(item for item in after['screenshots'] if item['name'] == old['name'] and item['width'] == old['width'])
    changed = [key for key in geometry_keys if old[key] != new[key]]
    result['geometry'].append({'name': old['name'], 'width': old['width'], 'changed': changed})
    if changed:
        result['status'] = 'FAIL'
for name in ['home', 'profile']:
    a = Image.open(directory / f'before-1440-{name}.png').convert('RGB')
    b = Image.open(directory / f'after-1440-{name}.png').convert('RGB')
    assert a.size == b.size
    difference = ImageChops.difference(a, b)
    changed = sum(1 for pixel in difference.getdata() if pixel != (0, 0, 0))
    result['pixels'].append({'name': name, 'width': 1440, 'size': list(a.size), 'changedPixels': changed})
    if changed:
        result['status'] = 'FAIL'
(directory / 'comparison.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
raise SystemExit(0 if result['status'] == 'PASS' else 1)
