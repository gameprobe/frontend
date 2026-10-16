# public/img 이미지 출처

모든 게임 이미지는 WebP(품질 80)다. 런타임에 외부 이미지를 불러오지 않는다.

## TASK-FE-061 미니맵 갱신 — 2026-10-16

브리즈·로터스·선셋·아이스박스·펄·바인드의 `maps-mini/*.webp`는 Valorant-API의 같은 맵 UUID `displayIcon` PNG를 내려받아 1024×1024 WebP(quality80, method6)로 변환했다. 아래 기존 원본 설명은 이 6개 파일에는 더 이상 적용되지 않는다. 게임 자산의 저작자는 Riot Games이며, 공급원 Valorant-API는 Riot 비공식 서비스다.

- 메타데이터: `https://valorant-api.com/v1/maps?language=ko-KR`
- 공급원 버전 응답: `13.08.00.5627607` / `release-13.08`. 이는 공급원 전체 버전이며 각 이미지의 변경 패치를 보증하지 않는다.
- PNG 주소: `https://media.valorant-api.com/maps/{아래 UUID}/displayicon.png`

| 파일 | UUID |
|---|---|
| `maps-mini/breeze.webp` | `2fb9a4fd-47b8-4e7d-a969-74b4046ebd53` |
| `maps-mini/lotus.webp` | `2fe4ed3a-450a-948b-6d6b-e89a78e680a9` |
| `maps-mini/sunset.webp` | `92584fbe-486a-b1b2-9faa-39b0f486b498` |
| `maps-mini/icebox.webp` | `e2ad5c54-4114-a870-9641-8ea21279579a` |
| `maps-mini/pearl.webp` | `fd267378-4d1d-484f-ff52-77821ed10dc2` |
| `maps-mini/bind.webp` | `2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba` |

이미지는 원본 방향으로 보관한다. `src/data/minimap-layout.ts`의 스폰·사이트 위치는 같은 공급원의 callouts에서 변환했다(`imageX = worldY * xMultiplier + xScalarToAdd`, `imageY = worldX * yMultiplier + yScalarToAdd`). 스폰 좌표는 회전 방향 결정에만 쓴다. 화면에 A/B/C 사이트 글자나 스폰 글자를 별도로 덧씌우지 않고 원본 이미지에 들어 있는 표시만 사용한다. 화면에서 지도·마커·경로를 함께 회전하며 DB의 원본 좌표는 변경하지 않는다. 클릭·드래그·방향키 입력은 역변환한다.

공격 기준 회전: 어센트·헤이븐·스플릿 +90°, 아이스박스 -90°, 나머지 기존6개 0°. 수비 기준은 여기에180°를 더한다. 스모크의 진영 전환은 지도 방향만 바꾸며 서버 자료를 필터링하거나 스킬 의미를 변경하지 않는다.

갱신6개의 지도 내부 예시 좌표 표본은 새 이미지에서 재생성했고 기존10개 맵의 A/B/C 명칭은 callouts에 맞췄다. 이 표본과 지도에서 실제 게임의 라인업 성공 여부를 추론해서는 안 된다. 좌표 검증과 시각 검증 결과는 `docs/visual-qa/TASK-FE-061.md`를 따른다.

## 원본

TASK-FE-050(2026-10-09)부터 사용자가 저장소 루트 `Assets/`(Git 제외)에 넣은 Riot 공식 원본을 쓴다.

- 이미지: `Assets/Abilities_Renamed/`, `Assets/mapCharacters/`, `Assets/Weapons/`, `Assets/CharacterRoles/`
- 데이터: `Assets/PublicContentCatalog.json` (Riot Public Content Catalog). 요원·스킬·맵·무기·역할의 GUID와 한글·영어 이름이 있다.

| 경로 | 원본 | 크기 | 매칭 기준 |
|---|---|---|---|
| `maps/{map}.webp` | `mapCharacters/{uuid}_splash.png` | 가로 1920 이하(로터스 원본 3840 → 1920) | 카탈로그 맵 GUID |
| `maps-list/{map}.webp` | `mapCharacters/{uuid}_listview.png` | 456×100 | 카탈로그 맵 GUID |
| `maps-mini/{map}.webp` | `mapCharacters/{uuid}.png` | 1024×1024 | 카탈로그 맵 GUID |
| `weapons/{weapon}.webp` | `Weapons/{uuid}.png` | 가로 512 | 카탈로그 무기 GUID |
| `roles/{role}.webp` | `CharacterRoles/{uuid}.png` | 128 | 카탈로그 역할 GUID |
| `skills/{agent}-{q,e,c,x}.webp` | `Abilities_Renamed/[요원] 한글 (English).png` | 128 | 카탈로그 스킬 영어 이름 |
| `agents/{agent}.webp` | 이전 `agents/*.png` | 160×160 | 아래 참고 |
| `agents-full/{agent}.webp` | 이전 `agents-full/*.png` | 880×800 | 아래 참고 |

- 요원 초상과 전신은 새 `Assets/`에 없다. TASK-FE-042~047에서 Figma 시안 파일 `zMbn8YMcz2YgxuEatTZGlj`의 이미지(Figma가 내보낸 SVG 안의 PNG)로 만든 파일을 WebP로만 바꿨다.
- 미니맵 1024 원본은 이전 512 미니맵(Figma)과 방향·여백이 같다. 그래서 06·08의 마커 좌표(512 기준 %)를 그대로 쓴다.
- 튜토리얼 소바(`[소바 (튜토리얼)] …`) 아이콘은 쓰지 않는다.

## 다시 만드는 방법

```bash
python3 -I scripts/generate-game-data.py            # 카탈로그 → frontend/src/data/game-catalog.ts, scripts/asset-manifest.json
mkdir -p /tmp/imgtools && cd /tmp/imgtools && npm init -y && npm install sharp@0.33.5   # 프로젝트 의존성 아님
node scripts/convert-images.mjs /tmp/imgtools       # Assets 원본 → public/img/*.webp (이전 png/jpg 삭제)
node scripts/extract-minimap-points.mjs /tmp/imgtools  # 미니맵 → frontend/src/data/minimap-points.ts (라인업 예시 좌표)
```

`convert-images.mjs`는 요원 초상·전신을 `public/img`의 PNG에서 변환한다. 이미 WebP로 바뀐 뒤에 다시 돌리면 요원 이미지는 건너뛴다.

## 공개 전 확인

요원·맵·무기·스킬 이미지는 VALORANT 게임 이미지(Riot Games 저작물)다. 맵·무기·스킬·역할은 Riot Public Content Catalog 원본이다. 요원 이미지는 출처를 같은 수준으로 확인하거나 공식 원본으로 바꿔야 한다. 앱의 Riot 팬 콘텐츠 고지(푸터)는 유지한다.

아이콘 SVG(`frontend/src/assets/icons/*`)는 Figma MCP 에셋 URL에서 받았다. `menu.svg`와 `menu-close.svg`만 직접 그렸다.
