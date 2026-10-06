# TASK-015UI10A: 배포 버전 표시 + 레퍼런스 비교 체크리스트/가드레일 문서화

## Status

COMMIT_READY

## Goal

UI9A까지의 수정이 의도한 방향(전적 사이트식 정보 구조)인지 검증하기 위한
**기준 문서를 확정**하고, 앞으로의 모든 UI 변경이 실제 배포에 반영됐는지
화면에서 확인할 수 있도록 **배포 버전 표시 장치**를 추가한다.

이 Task는 "전적 사이트의 무엇을 가져올지"를 **결정하는 단계가 아니라**, 그
결정을 위한 **레퍼런스 감사·가드레일을 문서로 고정**하고 **버전 확인 장치**만
구현한다. UI9B/UI9C/UI9D(자산·Mock) 착수는 이 Task 범위가 아니다.

## Background

- UI8A·UI8B·UI9A로 프로필/경기 상세 정보 구조를 재정렬했으나, 방향 확신이
  부족하다(Tracker.gg / OP.GG식 구조와의 차이가 검증되지 않음).
- 배포된 빌드가 어떤 UI 변경을 포함하는지 화면에서 확인할 장치가 없어, "수정이
  반영됐는지" 확인이 어렵다.
- 그래서 UI9B/C/D를 바로 진행하는 대신, 레퍼런스 감사 → 가드레일 → 작업 순서
  재정렬을 먼저 한다.
- Planner가 `docs/ui-reference-audit.md`, `docs/ui-design-guardrails.md`를
  작성했다. 이 Task는 그 문서를 작업 기준으로 고정하고, 버전 표시만 구현한다.

## Current Problems

- 배포 버전/빌드 식별 장치 부재 → 배포 검증 불가.
- 레퍼런스 대비 차이가 영역별로 정리되어 있었으나(임시) 산출물로 고정되지 않음.
- "가져올 것/가져오지 않을 것/데이터 없는 UI 금지/자산·Mock Stop" 기준이
  코드 리뷰에서 참조할 단일 문서로 존재하지 않음.

## Reference Audit Plan

1. `docs/ui-reference-audit.md`: 영역별(프로필 상단·좌측/보조·최근 경기 리스트·
   스코어보드·라운드 상세·성과/분석·버전 표시) 비교표 — 현재 GameProbe / Tracker·
   OP.GG식 패턴 / 차이점 / 가져올 것 / 가져오지 않을 것 / 필요한 데이터·에셋 /
   구현 난이도 / 사람 판단 필요. (작성 완료, 본 Task에서 검토·확정 대상)
2. `docs/ui-design-guardrails.md`: 가져올 것·가져오지 않을 것·표절 방지 기준·
   데이터 없는 UI 금지 기준·외부 자산/Mock Stop Condition. (작성 완료)
3. 본 Task 구현: 위 문서를 기준으로 **배포 버전 표시 장치**를 추가한다. 신규
   외부 자산·신규 Mock·신규 타입 필드·신규 패키지 없이, 기존 빌드 정보(예:
   `frontend/package.json` version)만 사용한다.

## Allowed Changes

문서:
- `docs/ui-reference-audit.md` (검토·보정)
- `docs/ui-design-guardrails.md` (검토·보정)
- `docs/tasks/TASK-015UI10A.md` (이 문서, Result/Notes 기록)
- `docs/PLAN.md`, `docs/PROGRESS.md` (상태·로그 최소 갱신)
- `.agent-reports/CURRENT.md` (`## Codex Implementation` 섹션, 공통 상태 스냅샷)

버전 표시 구현(최소 범위):
- `frontend/src/components/PlayerProfile.tsx` — 프로필 화면에 버전 표시 컴포넌트
  마운트.
- 신규 버전 표시 컴포넌트 1개(예: `frontend/src/components/AppVersionBadge.tsx`,
  푸터/배지 형태).
- `frontend/src/app/globals.css` — 버전 표시 스타일만.
- 버전 문자열은 기존 `frontend/package.json`의 `version` 등 **이미 존재하는
  빌드 정보**에서 읽는다(파일 수정 아님, 읽기/참조만).

## Forbidden Changes

- UI9B/UI9C/UI9D 범위 착수(요원 자산, 라운드 이벤트 Mock, 역할/무기 시각화).
- 신규 외부 이미지/아이콘 자산 다운로드·추가, `SOURCES.md`·`public/assets` 변경.
- 신규 Mock 데이터/필드, 신규 타입 필드, `frontend/src/data`·`frontend/src/types`·
  `frontend/src/lib/asset-map.ts`·`score-gameprobe.ts` 변경.
- 신규 npm 패키지, `package.json`/`package-lock.json` 변경, 런타임 외부 URL,
  `Math.random` 기반 값 생성.
- 신규 env/secret/CI 설정 추가(버전 표시를 위해 필요해지면 Stop — 아래 참조).
- `backend/`, `docker/`, `scripts/` 변경.
- UI10A 검증 전 Git add/commit/push. 단, 사용자 요청의 commit/push policy가
  충족되면 최종 단계에서 `[TASK-015UI10A] ...` 커밋과 `git push origin main`을
  수행할 수 있다.

## Acceptance Criteria

1. `docs/ui-reference-audit.md`가 7개 영역(프로필 상단·좌측/보조·최근 경기
   리스트·스코어보드·라운드 상세·성과/분석·버전 표시)을 지정된 표 컬럼으로
   포함한다.
2. `docs/ui-design-guardrails.md`가 가져올 것·가져오지 않을 것·표절 방지 기준·
   데이터 없는 UI 금지 기준·외부 자산/Mock Stop Condition을 포함한다.
3. 앱 화면에 **배포 버전 식별 문자열**(앱 version, 선택적으로 빌드 시각/SHA)이
   표시된다. 신규 자산·Mock·타입·패키지 없이 기존 빌드 정보만 사용한다.
4. 버전 표시는 민감 정보(내부 경로·비밀)를 노출하지 않는다.
5. UI9A까지의 기존 화면·접근성(UI8A)·라운드 타임라인(UI8B)이 보존된다.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
git diff --check
# 금지 범위 미변경 확인
git status --porcelain -- frontend/public/assets frontend/src/data frontend/src/types frontend/package.json frontend/package-lock.json backend docker scripts
git diff -- frontend/src/lib/asset-map.ts frontend/src/lib/score-gameprobe.ts
# 외부 URL/난수/신규 이벤트 미사용 확인
grep -RnE "https?://|Math.random" frontend/src/components/AppVersionBadge.tsx frontend/src/app/globals.css || true
```

## Stop Conditions

- 버전 표시를 위해 **신규 env/secret/CI 설정**이나 `package.json`/lockfile 변경,
  신규 패키지가 필요해지면 즉시 중단하고 사람 결정을 요청한다(예: git SHA·빌드
  시각을 빌드 타임에 주입하려면 설정이 필요).
- 레퍼런스 감사·가드레일 문서가 **외부 자산/Mock 결정**을 요구하는 방향으로
  확장되려 하면 중단한다(이 Task 범위 아님).
- 같은 검증 실패가 3회 반복되면 `BLOCKED`로 보고하고 중단한다.

## Human Decisions

- **버전 문자열 출처**: (기본 권장) `frontend/package.json`의 `version`만 표시.
  옵션 — 빌드 시각 / git SHA 추가는 설정 작업이 필요하므로 별도 승인 사안.
- 버전 표시 **위치/형태**(전역 푸터 vs 우하단 배지 등).
- `ui-reference-audit.md`의 "작업 순서 재정렬 후보"를 확정/조정할지 — 확정 후에야
  UI9B/UI9C/UI9D 또는 다른 UI10 계열의 다음 Task를 정한다.

## Codex Implementation Notes

- 버전 표시 위치: 프로필 화면 우하단 fixed badge.
- 표시 문자열: `GameProbe Preview`, `UI Build: UI10A`, `App v0.1.0`.
- 버전 출처: `frontend/package.json`의 기존 `version` 필드. git SHA·빌드 시각은
  빌드 설정 주입이 필요하므로 사용하지 않았다.
- 제품 코드 변경은 `AppVersionBadge` 추가, `PlayerProfile` 마운트, badge CSS에
  한정했다.
- 신규 자산, 신규 Mock, 신규 타입 필드, 신규 패키지, 외부 URL, 난수 사용 없음.
- 검증 결과는 Result 섹션과 `.agent-reports/CURRENT.md`에 기록한다.

## Cursor Review Notes

(리뷰 후 Cursor가 기록: Allowed/Forbidden 준수, AC 충족, BLOCKER/MAJOR/MINOR,
커밋 가능 여부.)

## Result

### Changed Files

- `frontend/src/components/AppVersionBadge.tsx` (신규)
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/app/globals.css`
- `docs/ui-reference-audit.md`
- `docs/ui-design-guardrails.md`
- `docs/tasks/TASK-015UI10A.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `.agent-reports/CURRENT.md`

### Verification Results

- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `git diff --check`: 성공.
- `git status --short`: 예상 UI10A 파일만 표시.
- `git diff --stat`: 확인.
- `git diff --name-only | grep -E 'package.json|package-lock.json|backend/|docker/|scripts/' || true`: 출력 없음.
- `git diff --name-only | grep -E 'frontend/public/assets|SOURCES.md|frontend/src/data|frontend/src/types|frontend/src/lib/asset-map.ts' || true`: 출력 없음.
- `grep -R "https://\|http://\|Math.random" frontend/src/components frontend/src/app/globals.css || true`: 출력 없음.
- `grep -R "first kill\|first death\|clutch\|multikill\|plant\|defuse\|spike planter\|spike defuser" frontend/src/components || true`: 기존 `SeasonSummaryCard.tsx`의 `clutchWinRate` 1건만 출력. 이번 Task 신규 이벤트/Mock 아님.

### Remaining Risks

- 배지는 `frontend/package.json` version과 `UI10A` 라벨만 표시한다. 최종 commit SHA나
  빌드 시각 표시는 빌드 타임 주입 설정이 필요하므로 이번 Task에서 제외했다.
- UI9B/UI9C/UI9D에 해당하는 요원 자산, 역할 아이콘, 라운드 이벤트 Mock, 무기
  적중 분포는 여전히 사람 결정 후 별도 Task로만 진행한다.
