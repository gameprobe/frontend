# TASK-017_DESIGN_SYSTEM: 디자인 시스템 토큰 수립 및 CSS 치환 (PR-1)

- **Status**: READY
- **Owner**: Codex (Implementer)
- **Reviewer**: Cursor (Reviewer)
- **Goal**: globals.css 내의 무분별한 하드코딩 값을 Spacing/Radius/Typography 디자인 토큰(CSS Variables)으로 치환하여 UI 완성도와 유지보수성을 극대화하고, PR-0 시각적 기준선과 비교해 100% 시각적 무결성을 검증한다.

---

## 1. Background & Current Problems

- **globals.css 비대화 및 파편화**: globals.css가 4,617줄로 거대해졌으나 Spacing, Border Radius, Typography 크기 등이 표준화되어 있지 않고 하드코딩되어 있습니다.
- **즉흥적 스페이싱 및 가독성 위계**: 4px 배수 그리드와 6px, 10px, 14px, 18px 등 불규칙한 마진/패딩이 산재하여, 미세하게 정렬이 어긋나거나 화면 밀도가 깨지는 원인이 됩니다.
- **Visual Regression 위험**: 단순 치환 시 CSS Cascade(우선순위 상속)가 깨져 레이아웃이 붕괴할 수 있습니다. PR-0에서 확보한 14종의 시각적 기준선(Visual Baseline) 이미지와의 픽셀 단위 대조가 필수적입니다.

---

## 2. Allowed & Forbidden Changes

### Allowed Changes
- `frontend/src/app/globals.css` (토큰 정의 및 치환)
- `frontend/src/components/PlayerHeaderCard.tsx` (인라인 스타일 1건 globals.css 클래스로 이관)

### Forbidden Changes
- 신규 npm 패키지 설치 금지
- Mock 데이터 구조(`mock-data.json`), API 인터페이스/타입(`types/`), 라우트 추가/변경 일절 금지
- 타 페이지(.tsx 컴포넌트) 스타일 시트 침범 금지

---

## 3. Required Implementation Steps

### Step 1: Primitive CSS 변수 정의 (`globals.css` 내 `:root`)
- **Spacing Scale (4px 배수 계층)**:
  - `--space-1`: `4px`
  - `--space-2`: `8px`
  - `--space-3`: `12px`
  - `--space-4`: `16px`
  - `--space-5`: `24px`
  - `--space-6`: `32px`
- **Border Radius Scale**:
  - `--radius-sm`: `4px` (Rounds / Button / Small elements)
  - `--radius-md`: `6px` (KPI Card / Scoreboard table / Medium elements)
  - `--radius-lg`: `8px` (Player Hero avatar / Large containers)
  - `--radius-full`: `999px` (Pills, timeline chips)
- **Typography font-size Scale**:
  - `--text-xs`: `10px`
  - `--text-sm`: `12px`
  - `--text-base`: `14px`
  - `--text-lg`: `18px`
  - `--text-xl`: `20px`
  - `--text-xxl`: `32px`

### Step 2: globals.css 하드코딩 치환
- `globals.css` 전체를 스캔하여 Spacing, Radii, Font-size에 해당하는 하드코딩 리터럴을 Step 1에 정의한 `--space-*`, `--radius-*`, `--text-*` 변수로 일괄 안전 치환합니다.
- Cascade 우선순위와 `@media` 쿼리 내 오버라이딩(`!important` 사용 규칙 포함) 구조가 깨지지 않도록 유의합니다.

### Step 3: PlayerHeaderCard 인라인 스타일 정적화
- `PlayerHeaderCard.tsx` 61라인의 `style={{ objectFit: "contain", objectPosition: "right bottom" }}` 인라인 속성을 제거하고, `globals.css`에 신규 클래스(`.agent-hero-image-fit`)를 정의하여 이식합니다.

---

## 4. Verification & Acceptance Criteria

1. **디자인 토큰화 완수**:
   - `:root`에 명시된 16개 이상의 디자인 토큰이 성공적으로 바인딩되었는가?
   - `globals.css` 내에서 마진, 패딩, 보더 라운드, 폰트 크기 관련 하드코딩 수치들이 토큰 변수로 치환되었는가?
2. **시각적 회귀(Visual Regression) 0%**:
   - 수정 후 로컬 서버 실행 $\rightarrow$ 스크린샷 캡처 후 `screenshots/page-states/`에 저장된 PR-0의 14개 기준선 이미지와 pixel-by-pixel 비교하여 미세한 레이아웃 붕괴, 자간 틀어짐, 패딩 변형이 단 1픽셀도 존재하지 않는가?
3. **빌드 안정성**:
   - `npx tsc --noEmit && npm run lint && npm run build` 검증 통과 여부.
