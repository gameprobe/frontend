# TASK-015UI12E: 사이드바 보조 통계 rail 정리 및 카드 축소 (읽기 흐름 ④보조)

## Status

DONE — 커밋 및 동기화 완료

> TASK-015UI12D가 완료(DONE)되어 커밋/동기화된 Git 상태 위에서 진행한다.
> 사이드바(`ProfileSidebar.tsx`)를 support rail로 재정의하여 발로란트 특화 통계를 최상단으로 우선순위 재배치하고, 활동 시간대 및 자주 함께한 팀원 등 보조 정보는 축소/접음 처리를 도입한다. 또한 `SeasonSummaryCard`와 `RecentTwentySummaryCard` 등 보조 카드들의 테두리(Border) 두께와 간격을 줄여 조밀하게 압축한다.

## Goal

1. **사이드바(ProfileSidebar.tsx)를 support rail로 재배치**: 역할/맵/무기/정확도 등 발로란트 특화 카드를 최상단으로 우선순위 재배치하여 전적 검색 사이트로서의 정체성을 한눈에 보여준다.
2. **덜 중요한 정보 축소/접음 처리**: 활동 시간대, 자주 함께한 팀원, 시즌 기록(Career Peak, Rank History) 등 덜 중요한 정보는 접기/더보기 처리를 하거나 높이를 깎아 컴팩트하게 압축한다.
3. **보조 카드 테두리 및 여백 압축**: `SeasonSummaryCard`와 `RecentTwentySummaryCard` 등 보조 카드들의 테두리(Border) 두께와 간격을 줄여 파편화된 카드 위주의 조잡함을 제거하고 플랫하고 조밀하게 압축한다.

## Background

- `docs/ui12-implementation-plan.md` §3-6 및 §5-5: "사이드바 → support rail: 역할/맵/무기/정확도(VAL 특화) 우선, 활동/팀원/이전 시즌은 접힘/하단."
- `docs/ui12-visual-qa.md` §2-2 (결함 2: 두꺼운 보더와 파편화된 카드 위주 디자인) 및 §4-3: "globals.css 및 개별 카드 컴포넌트의 테두리 두께와 색상을 투명하게 낮추어, 파편화된 느낌을 지우고 플랫하고 깊이 있는 어두운 톤으로 일체화합니다. ... SeasonSummaryCard와 RecentTwentySummaryCard 등 보조 카드들의 테두리(Border) 두께와 간격을 줄여 조밀하게 압축."
- 현재 사이드바의 최상단에는 Career Peak와 Rank History가 큰 자리를 차지하고 있어 발로란트 게임 특화 분석(정확도, 역할군, 무기, 맵)을 확인하려면 스크롤이 강제된다. 이를 개선하여 전적 검색 서비스다운 정보 우선순위를 부여할 필요가 있다.

## Reference Direction

- OP.GG / Tracker.gg의 사이드바/레일 정보 배치 참고.
- 발로란트의 요원별/역할별/무기별/맵별 특화 통계가 최상단에 노출되도록 하여 전적 검색 사이트로서의 정체성을 한눈에 보여준다.
- 덜 중요한 범용 지표(활동 시간대, 함께한 팀원) 및 시즌 기록(Career Peak, Rank History)은 접기/더보기 처리를 도입하거나 높이를 줄여 압축한다.

## Allowed Changes

- `frontend/src/components/ProfileSidebar.tsx`
  - 사이드바 내 각 카드 섹션의 렌더링 순서 재배치 및 접기/더보기 상태 관리(useState) 도입.
- `frontend/src/components/SeasonSummaryCard.tsx`
  - 카드 내부의 padding, margin(gap) 및 테두리(Border) 두께 축소.
- `frontend/src/components/RecentTwentySummaryCard.tsx`
  - 카드 내부의 padding, margin(gap) 및 테두리(Border) 두께 축소.
- 관련 CSS
  - `frontend/src/app/globals.css` 내의 사이드바 및 카드 보더, 압축/간격 조정용 스타일 수정.

## Forbidden Changes

- **타 단계 범위 침범 금지**:
  - 전역 Mock 고지 단일화 및 CSS primitive 리팩토링 (UI12F): `globals.css`에 전역 리팩토링을 하거나 전역 Mock 고지 배지를 수정하는 등의 작업 금지.
  - 경기 리스트 및 상세 내부 수정 금지 (`MatchSummaryList.tsx`, `MatchDetailPanel.tsx` 등).
- **제품 코드 외 변경 금지**:
  - 신규 Mock 데이터 모델, 타입 필드 추가 금지 (기존 데이터 구조 그대로 사용).
  - backend, docker, scripts 경로 변경 금지.
  - 외부 Riot CDN 참조 추가 및 `Math.random` 사용 금지.
  - Git add/commit/push 실행 금지.

## Existing Data / Assets Available

- 기존의 `ProfileOverview` 및 `ProfileSidebarStats` 데이터 구조와 `getTierAssetPath`, `getWeaponAssetPath`, `getMapAssetPath` 에셋 매핑 함수 사용.
- 신규 자산 추가 없이, 기존에 복사된 에셋들만 사용.

## Required UI Changes

1. **사이드바 카드 순서 재배치**:
   - 상단 배치: 정확도 분포 (`정확도 분포`), 역할별 승률 (`역할별 승률`), 주 무기 (`주 무기`), 맵별 승률 (`맵별 승률`)
   - 하단 배치: 전체 시즌 최고 기록 (`전체 시즌 최고 기록`), 이전 시즌 티어 (`이전 시즌 티어`), 활동 시간대 (`활동 시간대`), 자주 함께한 팀원 (`자주 함께한 팀원`)
2. **덜 중요한 정보 축소/접음 처리**:
   - `활동 시간대` 및 `자주 함께한 팀원` 섹션 등에 `더보기 / 접기` 토글 버튼을 추가하거나 기본적으로 몇 개 항목만 노출하고 접음 처리하여 높이를 줄인다.
   - `전체 시즌 최고 기록` 및 `이전 시즌 티어` 섹션 역시 기본적으로 요약 형태로 압축하거나 높이를 다이어트한다.
3. **보조 카드 테두리 및 여백 압축**:
   - `SeasonSummaryCard`와 `RecentTwentySummaryCard` 카드의 보더 두께를 줄이거나 투명하게 변경하여 배경과 일체화되도록 조정 (`globals.css` 및 인라인 스타일 수정).
   - 카드 내부의 padding과 article 간의 margin(gap)을 축소하여 조밀하고 콤팩트한 뷰를 완성한다.

## Acceptance Criteria

1. 사이드바의 각 카드 렌더링 순서가 발로란트 특화 통계(정확도, 역할, 무기, 맵)가 최상단으로 오도록 재배치되었는가.
2. 활동 시간대 및 자주 함께한 팀원 정보 등이 기본적으로 축소되거나 접혀 있으며, 토글을 통해 펼칠 수 있는가.
3. `SeasonSummaryCard`, `RecentTwentySummaryCard` 등 보조 카드들의 테두리 두께가 줄어들고 전체적인 패딩/마진이 콤팩트하게 다이어트되었는가.
4. `tsc`, `lint`, `build`가 에러 없이 성공하는가.
5. 수정한 파일이 허용된 3개 컴포넌트 파일 및 CSS 스타일 파일로 제한되는가.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
git diff --check

# 변경 파일이 허용 범위 내에 있는지 검증
git status --porcelain | grep -v "docs/tasks/TASK-015UI12E.md"
```

## Stop Conditions

- 사이드바나 보조 카드들의 스타일 조정을 위해 허용되지 않은 파일(예: `PlayerProfile.tsx`, `MatchSummaryList.tsx`) 수정을 시도해야 할 때.
- 기존의 데이터 로더나 타입 정의의 수정을 강제하는 충돌이 발생할 때.
- 동일한 검증 에러가 3회 이상 발생할 시 `BLOCKED`로 처리하고 작업을 중단한다.

## Codex Implementation Notes

- **사이드바 카드 순서 재배치**:
  - `ProfileSidebar.tsx` 내의 각 카드 렌더링 순서를 발로란트 특화 통계가 상단에 오도록 다음과 같이 재배치했습니다: 정확도 분포 → 역할별 승률 → 주 무기 → 맵별 승률 → 전체 시즌 최고 기록 → 이전 시즌 티어 → 활동 시간대 → 자주 함께한 팀원.
- **활동 시간대 및 팀원 접기/더보기 기능**:
  - `useState`를 활용한 클라이언트 컴포넌트화(`'use client';`)를 도입했습니다.
  - 활동 시간대 및 자주 함께한 팀원에 기본적으로 3개 항목만 보여주도록 제한하고, "더보기" 및 "접기" 토글 버튼을 추가했습니다.
- **전체 시즌 최고 및 이전 시즌 티어 요약 압축**:
  - 전체 시즌 최고 기록 이미지 크기를 72px에서 48px로, 텍스트 크기를 22px에서 16px로 줄이고, 이전 시즌 티어 이미지 크기를 34px에서 24px로 줄였으며, padding/gap도 콤팩트하게 다이어트했습니다.
- **보조 카드 테두리 및 여백 압축**:
  - `SeasonSummaryCard` 및 `RecentTwentySummaryCard`를 감싸는 border 색상을 옅고 투명한 `rgba(255, 255, 255, 0.07)`로 낮추고 배경 알파 값을 조절하여 플랫한 느낌으로 바꿨습니다.
  - 카드 내부의 padding과 article 간의 margin(gap)을 각각 축소하고, 내부 폰트 크기도 조밀하게 줄여 컴팩트하게 구성했습니다.
- **검증 완료**:
  - `tsc --noEmit`, `npm run lint`, `npm run build`를 모두 에러 없이 통과했습니다.

## Cursor Review Notes

- **사이드바 카드 순서 및 스캔성 검증**: 정확도 분포 → 역할별 승률 → 주 무기 → 맵별 승률 순으로 발로란트 특화 통계가 상단에 정상 배치되었습니다. support rail로서의 성격에 맞게 전적 페이지의 아이덴티티가 향상되었습니다.
- **활동 시간대 및 팀원 접기/더보기 토글 검증**: `useState`를 통해 기본 3개 노출 제한 및 더보기/접기 토글 인터랙션이 React Client Component에서 경고 없이 부드럽게 작동합니다.
- **보조 카드 테두리 및 여백 압축 시각 검증**: `globals.css`를 통해 카드들의 border 색상이 투명도 높은 톤(`rgb(255 255 255 / 0.07)`)으로 완화되어 배경과 플랫하게 묻히며, padding/margin 및 폰트 크기 다이어트를 통해 조밀하고 깔끔한 밀도를 보여줍니다.
- **Allowed/Forbidden 범위 준수**: 허용 범위인 `ProfileSidebar.tsx`와 `globals.css` 외의 제품 코드 변경은 전혀 없으며, Mock 데이터 오염이나 외부 API URL 오용 등의 금지 원칙이 철저히 지켜졌습니다.
- **검증 완료**: `tsc`, `lint`, `build` 및 `git diff --check` 검증이 에러 없이 PASS했습니다.
- **최종 Verdict**: **`COMMIT_READY`** (커밋 가능)
