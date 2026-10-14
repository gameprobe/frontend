# public/img 이미지 출처

모든 게임 이미지는 WebP(품질 80)다. 런타임에 외부 이미지를 불러오지 않는다.

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
