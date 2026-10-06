# AGENTS.md

이 문서는 AI 에이전트가 이 프로젝트에서 작업할 때 따라야 하는 규칙을 정의한다.

## 작업 시작 전

1. 이 문서(AGENTS.md)를 읽는다.
2. `docs/PLAN.md`에서 현재 Phase와 진행 상황을 확인한다.
3. 할당된 Task 문서(`docs/tasks/TASK-XXX.md`)를 읽는다.
4. `docs/PROGRESS.md`에서 최근 변경 사항을 확인한다.

## 핵심 규칙

### 작업 범위

- **한 번에 Task 하나만 수행한다.**
- Task의 `Allowed changes` 섹션에 명시된 파일만 수정한다.
- 관련 없는 기능 추가, 리팩터링, "개선"을 하지 않는다.
- 요청받은 범위를 벗어나는 작업은 새로운 Task로 제안한다.

### 검증과 완료

- 모든 `Verification commands`가 통과해야 Task를 완료할 수 있다.
- 검증이 실패하면 완료로 처리하지 않는다.
- 테스트를 삭제하거나 비활성화해서 통과시키지 않는다.
- 같은 실패가 3회 반복되면 `BLOCKED` 상태로 보고하고 중단한다.
- **Visual QA 및 자동 디버깅 피드백 루프**:
  - UI 및 CSS 변경이 포함된 작업의 경우, 구현자(Codex)는 구현 전(Before)과 구현 완료 후(After)의 화면 스크린샷을 Playwright를 사용하여 반드시 캡처하고, 이를 대조하는 시각 검증 보고서(`docs/visual-qa/TASK-XXX.md`)를 자동 생성해야 한다.
  - 검증자(Cursor)는 코드 분석과 더불어, Codex가 올린 `After` 스크린샷과 기획서의 `레퍼런스 이미지`를 멀티모달(LMM)로 교차 대조하여 시각적 오류(레이아웃 붕괴, 어색한 여백, 폰트 겹침 등)가 있는지 반드시 정성 평가해야 한다.
  - 시각적 결함이 발견될 경우, Cursor는 코드 컴파일 성공 여부와 무관하게 즉시 `Verdict: CHANGES_REQUIRED`를 내리고 구체적인 **디버깅 피드백(Visual Debugging Feedback)**을 적어 `.agent-reports/VERDICT.json`을 통해 Codex에게 수정을 요구해야 한다.
  - Codex는 이 피드백을 수령하면 CSS/TSX 코드를 자동 수정(Self-Correcting)하고, 스크린샷을 재촬영하여 보고서를 업데이트해야 한다.

### 승인이 필요한 변경

다음 변경은 사람의 명시적 승인이 필요하다:

- 공개 API 엔드포인트 추가 또는 변경
- 데이터베이스 스키마 변경
- 인증/인가 정책 변경
- 새로운 운영 의존성 추가 (라이브러리, 서비스 등)
- 보안 관련 설정 변경

### 작업 완료 후

Task의 `Result` 섹션에 다음을 기록한다:

- 변경된 파일 목록
- 실행한 명령어
- 검증 결과
- 남은 위험 또는 주의 사항

### Agent Report

- 세션 시작 시 `.agent-reports/CURRENT.md`가 존재하면 읽는다.
- 구현 작업 종료 시 `.agent-reports/CURRENT.md`의 `## Codex Implementation`
  섹션만 갱신한다.
- `## Claude Plan` 및 `## Cursor Review` 섹션의 본문은 수정하거나 삭제하지
  않는다.
- Codex 보고에는 반드시 다음을 기록한다:
  - Status
  - Human Decision Required
  - 구현 요약
  - 실제 변경 파일 전체
  - 실행한 검증 명령과 실제 결과
  - 남은 문제
- 사람이 결정해야 할 요구사항, 범위 확장, 데이터 의미 변경, 외부 자산·라이선스,
  패키지 추가, 삭제 또는 배포 문제가 있으면 `Human Decision Required: YES`로
  기록하고 구현을 임의로 계속하지 않는다.
- 정상 완료 시 `Status: IMPLEMENTED`, 사람 판단이 필요 없으면
  `Human Decision Required: NO`로 기록한다.
- 실패 시 `Status: BLOCKED` 또는 `Status: VERIFICATION_FAILED`를 명확히
  기록한다.
- 채팅 보고만 출력하지 말고 `.agent-reports/CURRENT.md` 갱신을 완료 조건으로
  취급한다.
- 보고서를 갱신할 때 `Current Task`, `Current Git State`, `Next Action`도
  현재 사실에 맞게 갱신할 수 있다. 단, 다른 에이전트의 본문 섹션은 변경하지
  않는다.
- `git add`/`git commit`은 사람이 명시적으로 요청한 경우에만 수행한다.

### 자동화 금지

- `PLAN.md`의 다음 작업을 자동으로 시작하지 않는다.
- 각 Task 완료 후 사람의 검토와 승인을 대기한다.

## 프로젝트 구조

```
valorant-platform/
├── frontend/              # Next.js + TypeScript
├── backend/               # Spring Boot + Kotlin
├── docs/
│   ├── tasks/             # 개별 Task 문서
│   ├── SPEC.md            # 제품 명세
│   ├── ARCHITECTURE.md    # 아키텍처 설계
│   ├── PLAN.md            # 개발 계획과 Phase
│   ├── PROGRESS.md        # 진행 상황 로그
│   └── DECISIONS.md       # 기술 결정 기록
├── AGENTS.md              # 이 문서
├── README.md              # 프로젝트 소개
└── .gitignore
```

## 커밋 규칙

- Task 단위로 커밋한다.
- 커밋 메시지 형식: `[TASK-XXX] 작업 내용 요약`
- 검증이 통과한 상태에서만 커밋한다.

## 문서 참조 우선순위

1. 현재 Task 문서 (`docs/tasks/TASK-XXX.md`)
2. 이 문서 (`AGENTS.md`)
3. `docs/SPEC.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DECISIONS.md`

## 에이전트 호출 프롬프트 원칙

- 역할과 공통 규칙은 각 도구의 전용 지침 파일(`AGENTS.md`, `CLAUDE.md` 등)에 이미 정의되어 있다. 새 세션마다 긴 역할 설명을 반복하지 않는다.
- **Codex**: 현재 수행할 Task만 짧게 지정한다 (예: `TASK-XXX 진행해`).
- **Cursor**: 리뷰할 Task와 diff만 지정한다.
- **Claude**: 계획 또는 문서 수정 대상만 지정한다.
- 긴 프롬프트는 해당 도구에 전용 지침 파일이 없거나, 지침 파일의 적용 여부가 불확실할 때만 사용한다.

## 에이전트 간 Handoff 스펙 규격화 (토큰 절약 프로토콜)

에이전트 간의 소통 시 불필요한 마크다운 분석과 전체 파일 검색으로 인한 토큰 낭비를 최소화하기 위해 다음 규격 파일을 사용한다.

1. **에이전트별 전용 프로파일 지침**:
   - **기획 (Claude)**: 루트의 `CLAUDE.md` 규칙을 반드시 따른다.
   - **구현 (Codex)**: 루트의 `AGENTS.md` (이 문서)의 규칙을 따르며, **작업을 시작할 때 반드시 `.agent-reports/HANDOFF.json`을 읽고 `allowed_files`에 지정되지 않은 소스 파일은 절대로 열거나, 읽거나, 수정하지 않아야 한다 (토큰 소모 차단).**
   - **검증 (Cursor)**: `.cursor/rules/*.mdc` 규칙을 반드시 따른다.
2. **에이전트 간 스펙 연동 파일**:
   - **`.agent-reports/HANDOFF.json`**: 기획자(Claude)가 구현자(Codex)를 위해 작성하는 최소한의 타겟팅 변경 스펙이다. Codex는 오직 여기에 나열된 `allowed_files` 및 지침만 열어서 작업한다.
   - **`.agent-reports/VERDICT.json`**: 검증자(Cursor)가 실패 시 Codex의 재작업을 돕기 위해 오류 지점(줄 번호, 현상, 기대 결과)을 정밀하게 기록하는 피드백 파일이다.


