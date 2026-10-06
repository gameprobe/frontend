# TASK-FE-026: Smoke 전용 가이드 페이지

## Status

IMPLEMENTED

## Goal

기존 `/lineups`와 같은 맵 우선 탐색 흐름을 사용하되, 연막을 어디에 설치하면
좋은지 안내하는 Smoke 전용 공개 페이지 `/smokes`를 만든다.

## Scope

- 맵을 먼저 선택하는 Smoke 인덱스
- 맵 선택 후 공격/수비, 사이트, 연막 유형 필터
- 투척자 위치·연막 도착 위치·투사 경로 표시
- 연막 설치 팁과 상황 설명 표시
- 현재 MVP는 로컬 Preview 데이터로 동작
- 기존 라인업 API 계약과 백엔드 스키마는 변경하지 않음
- 기존 `/lineups`의 라인업 탐색 동작은 유지하되 맵 선택 UI는 `/smokes`와 공통 방식으로 개선

## Acceptance criteria

1. `/smokes`에서 경쟁 맵 카드가 먼저 표시된다.
2. 맵을 선택하기 전에는 상세 필터와 전술 지도가 표시되지 않는다.
3. 맵을 선택하면 공격/수비, 사이트, 연막 유형을 선택할 수 있다. 컨트롤러 선택은 제공하지 않는다.
4. 필터 선택에 따라 연막 목록과 지도 표시가 함께 갱신된다.
5. 선택한 연막에는 투척자 위치, 도착 위치, 방향선, 설치 설명이 표시된다.
6. 공격과 수비 데이터가 서로 섞이지 않는다.
7. 좌측에 Omen, Brimstone, Astra, Clove, Harbor, Miks의 공통 연막 크기·지속시간 비교표를 제공한다.
8. 모든 맵에 Viper를 제외한 공통 원형 연막을 제공하고, Harbor 일자 연막만 별도 유형으로 제공한다. Viper 라인업은 기존 `/lineups`에서 제공한다.
9. 데스크톱과 390px 모바일에서 가로 overflow가 없다.
10. 지도·요원 이미지는 기존 로컬 자산만 사용한다.
11. Preview 데이터임을 사용자에게 명확히 표시한다.
12. 기존 사이트 헤더에서 `/smokes`로 이동할 수 있다.
13. `/lineups`와 `/smokes` 상세 화면의 맵 필터 상단에 선택된 맵의 컨셉 아트와 이름이 표시된다.
14. 선택 맵 컨트롤을 누르면 상세 화면을 벗어나지 않고 12개 맵 목록이 펼쳐지며, 다른 맵 선택 시 해당 화면이 갱신된다.
15. 상세 전술 지도 뒤에는 컨셉 아트 배경을 표시하지 않고 전술 맵만 표시한다.

## Out of scope

- Riot API 및 RSO 연동
- 새로운 백엔드 엔드포인트·DB 스키마
- 실제 패치별 자동 검증
- 사용자 업로드·댓글·즐겨찾기

## Verification commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
```

## Result

- `/smokes` 맵 인덱스와 맵 선택 후 탐색 화면을 추가했습니다.
- 공격/수비, 사이트, 연막 유형 필터와 로컬 Preview 연막 데이터를 추가했습니다. 컨트롤러 선택은 제거했습니다.
- 모든 경쟁 맵에 Viper를 제외한 공통 원형 연막을 연결하고, Harbor 일자 연막만 별도 유형으로 추가했습니다.
- 좌측에 Omen·Brimstone·Astra·Clove·Harbor·Miks 6명의 공통 연막 크기·지속시간 비교표를 추가했습니다. Viper 전용 라인업은 기존 `/lineups`로 분류했습니다.
- 연막 도착 아이콘을 선택하기 전에는 경로를 숨기고, 선택 후 투척 위치·경로·설치 단계를 표시합니다.
- 기존 로컬 맵·요원·스킬 자산을 재사용하고 헤더에 Smoke 메뉴를 추가했습니다.
- `/lineups`와 `/smokes`의 맵 상세 필터에 선택된 맵 아트·이름 버튼을 추가하고, 버튼을 누르면 같은 화면에서 12개 맵을 선택할 수 있도록 공통 인라인 맵 선택 UI를 적용했습니다.
- 두 상세 전술 지도에서 컨셉 아트 배경 레이어를 제거하고 전술 맵 이미지만 표시하도록 정리했습니다.
- 라인업 요원 선택 아이콘을 로컬 원본으로 즉시 로드하도록 수정해 빈 슬롯을 제거하고, 공격 90°·수비 270° 맵 회전 규칙을 명시적으로 복구했습니다.

## Verification result

- `cd frontend && npx tsc --noEmit` — PASS
- `cd frontend && npm run lint` — PASS
- `cd frontend && npm run build` — PASS
- Browser `/smokes` 맵 인덱스 — PASS
- Browser Ascent 선택 후 공격 필터·연막 아이콘·가이드 목록 — PASS
- Browser 연막 아이콘 선택 후 투척 위치·경로·설치 단계 — PASS
- Browser 컨트롤러 필터 제거·6명 비교표·`모든 연막 (바이퍼 제외)`/Harbor 유형 표시·바이퍼 유형 미표시 — PASS
- Browser 공통 유형 1개 가이드 및 Harbor 유형 1개 가이드·연막 선택 후 경로 1개 — PASS
- Browser Harbor 일자 연막 선택 후 wall line 표시 — PASS
- Browser 공격→수비 전환 및 데이터 분리 — PASS
- Browser `/lineups`·`/smokes` 선택 맵 아트·이름 버튼 표시 — PASS
- Browser 두 페이지에서 맵 변경 버튼 클릭 후 12개 맵 목록 펼침·Haven 전환 — PASS
- Browser `/lineups`·`/smokes` 상세 지도 컨셉 아트 배경 레이어 0개·전술 맵 1개 — PASS
- Browser `/lineups` 요원 아이콘 29/29 로드 — PASS
- Browser `/lineups` 공격 회전 90°·수비 회전 270° — PASS
- Browser 390px 모바일 `scrollWidth === clientWidth` — PASS

## Remaining risks

- 현재 데이터는 Preview 예시이며, 실제 패치별 좌표 검증과 관리자 등록 흐름은 후속 범위입니다.
