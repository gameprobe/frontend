"""저장한 Before/After에서 위치 데이터와 영향 밖 화면/소스 보존을 확인한다."""
import json
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parent
repo = root.parents[3]
before = json.loads((root / 'before.json').read_text())
after = json.loads((root / 'after.json').read_text())
indexed = {(row['width'], row['name']): row for row in before}
checks = []
for row in after:
    original = indexed[(row['width'], row['name'])]
    for key in ('pins', 'paths', 'iframe'):
        assert original.get(key) == row.get(key), (row['name'], key)
    assert not row['overflow'] and not row['errors'] and row['mainCount'] == 1, row
    checks.append({'width': row['width'], 'name': row['name'], 'geometryDataSame': True,
                   'overflow': row['overflow'], 'errors': len(row['errors'])})
images = {}
for name in ('home', 'profile'):
    images[name] = (root / f'before-1440-{name}.png').read_bytes() == (root / f'after-1440-{name}.png').read_bytes()
    assert images[name], name
protected = [
    'frontend/src/app/globals.css', 'frontend/src/lib/lineup-api.ts', 'frontend/src/types/lineup.ts',
    'frontend/src/data/mock-lineups.json', 'frontend/src/data/mock-data.json', 'frontend/src/lib/mock-data.ts',
    'frontend/src/lib/smoke-data.ts', 'frontend/src/lib/asset-map.ts', 'frontend/src/features/stats-shell/StatsHeader.tsx',
    'frontend/src/features/stats-shell/StatsShell.tsx', 'frontend/src/features/stats-shell/StatsShell.module.css',
    'frontend/src/features/stats-shell/theme.module.css', 'frontend/src/features/stats-shell/locale.tsx',
    'frontend/src/features/tracker-profile/SyntheticMatchPage.tsx', 'frontend/src/features/tracker-profile/TrackerProfile.tsx',
    'frontend/src/features/home/HomeLanding.tsx', 'frontend/package.json',
]
for name in protected:
    assert subprocess.check_output(['git', 'show', '76adc9e:' + name], cwd=repo) == (repo / name).read_bytes(), name
result = {'layouts': checks, 'homeProfilePngByteSame': images, 'unchangedSources': protected}
(root / 'comparison.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(f'PASS: {len(checks)} layouts, {len(protected)} protected sources, home/profile identical PNGs')
