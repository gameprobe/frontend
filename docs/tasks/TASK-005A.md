# TASK-005A: Frontend 의존성 및 lockfile 정합성 복구

## Status

**DONE** (2026-06-12)

## Goal

TASK-005(공통 검증 명령 구성)가 `npm ci` 실패로 BLOCKED됐다. 이 Task는 그 선행 작업으로,
**Frontend의 Node.js/npm 실행 환경 기준을 확정하고, 그 환경에서 `package-lock.json`이
`package.json`과 정합성을 유지하도록 복구**한다.

이 Task는 다음을 수행한다:

1. 이 프로젝트에서 사용할 Node.js/npm 버전 기준을 확정하고 고정한다.
2. 확정한 버전 환경에서 `frontend/package-lock.json`을 정합성 있게 재생성/복구한다.
3. `npm ci`, `npm run build`, `npm run lint`가 모두 성공함을 검증한다.

다음은 이 Task의 범위가 아니다:

- `npm audit` 취약점 해결 (별도 후속 Task)
- `package.json`의 직접 의존성 버전 변경 (Next.js 14 등 현재 메이저 버전 유지)
- TASK-005 검증 스크립트(`scripts/verify.sh`) 수정
- TASK-006 이후 기능 작업

## Context

- TASK-005 구현 중 `frontend/npm ci`가 실패했다. 실패 사유: `package-lock.json`에
  `@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads` 관련 의존성 정보가
  `package.json`과 불일치하거나 누락되어 있다.
- 실패가 발생한 실행 환경은 **Node v25.1.0, npm 11.6.2**였다.
- `frontend/package-lock.json`은 TASK-001에서 생성됐으며, 그 이후 Node/npm 버전을
  명시적으로 고정한 적이 없다. `@emnapi/*` 패키지는 네이티브 바인딩을 사용하는
  의존성(예: 이미지 처리 관련 optional dependency)의 플랫폼/Node 버전별 optional
  dependency로, lockfile 생성 시점의 Node/npm 버전과 설치 시점의 Node/npm 버전이
  다르면 정합성이 깨질 수 있다.
- `frontend/package.json`의 `devDependencies.@types/node`는 `22.10.7`이다. Next.js 14는
  Node 18.17 이상을 요구한다.
- 현재 `frontend/`에는 Node 버전을 고정하는 파일(`.nvmrc` 등)이 없다.

**선행 조건**:
- TASK-001 (Frontend 초기화) — 완료됨.

**관련 Task**:
- TASK-005 (공통 검증 명령 구성) — 이 Task 완료 후 재시도한다.
- DEC-006 (Next.js 14 / Spring Boot 3.2.12 초기 부트스트랩 버전) — Next.js 메이저 버전은
  이 Task에서 변경하지 않는다.

## Allowed changes

```
frontend/package-lock.json     # 정합성 복구를 위한 재생성/수정
frontend/.nvmrc                 # (또는 동등한 Node 버전 고정 파일, 예: .node-version)
README.md                       # Node 실행 환경 안내 추가
docs/PLAN.md                    # TASK-005A 반영, 선행 관계 정리
docs/PROGRESS.md                # 완료 기록
docs/tasks/TASK-005A.md         # 이 문서의 Result 갱신
```

- `frontend/package.json`은 수정하지 않는다. 직접 의존성 버전(특히 `next`, `react`,
  `react-dom`, `eslint-config-next` 등)은 그대로 유지한다.

## Forbidden changes

- 애플리케이션 기능 코드 (`frontend/src/**`, `backend/**`)
- `frontend/package.json`의 직접 의존성 버전 변경 (Next.js 메이저 업그레이드 포함)
- `npm audit fix`, `npm audit fix --force` 실행
- TASK-005에서 작성한 `scripts/verify.sh` 수정
- TASK-006 이후 작업 시작
- `docs/` 중 위 `Allowed changes`에 명시되지 않은 문서 수정
- `AGENTS.md`, `CLAUDE.md` 수정

## Acceptance criteria

1. **Node/npm 버전 기준 확정**
   - [x] Next.js 14(요구: Node 18.17+)와 현재 `package.json`의 `@types/node` 메이저 버전을
     고려해, 안정적인 LTS Node 버전을 하나 선택한다.
   - [x] 선택한 버전을 `frontend/.nvmrc`(또는 동등 파일)에 고정하고, 선택 사유를
     `docs/tasks/TASK-005A.md`의 `Result`에 기록한다.
   - [x] `README.md`에 "이 버전으로 Frontend를 실행/설치해야 한다"는 안내를 추가한다.

2. **package.json 불변**
   - [x] 작업 종료 시점에 `frontend/package.json`이 작업 시작 시점과 바이트 단위로
     동일함을 `git diff --exit-code frontend/package.json`으로 확인한다.

3. **lockfile 정합성 복구**
   - [x] 고정한 Node/npm 버전 환경에서 `frontend/package-lock.json`을 재생성하거나
     정합성을 복구한다.
   - [x] 복구 후 `package-lock.json`의 `@emnapi/core`, `@emnapi/runtime`,
     `@emnapi/wasi-threads` 관련 항목이 `package.json`의 의존성 트리와 일치한다.

4. **검증 통과**
   - [x] `cd frontend && npm ci`가 고정 Node/npm 버전 환경에서 에러 없이 성공한다.
   - [x] `npm run build`가 성공한다.
   - [x] `npm run lint`가 경고/에러 없이 성공한다.

5. **범위 제외 사항 명시**
   - [x] `docs/tasks/TASK-005A.md`의 `Result`에 "npm audit 취약점 해결은 이 Task의
     범위가 아니며 별도 후속 Task로 남긴다"를 기록한다.

## Verification commands

```bash
# 0) Node/npm 버전 확인 (고정한 버전과 일치해야 함)
cat frontend/.nvmrc            # 또는 .node-version 등
node --version
npm --version

# 1) package.json 불변 확인
cd frontend
git diff --exit-code package.json
echo "package.json unchanged: $?"   # 0 이어야 함

# 2) lockfile 정합성 복구 (구현자가 선택한 방법을 Result에 기록)
#    예시: 캐시/노드모듈을 정리하고 npm install로 lockfile을 재생성한 뒤 npm ci로 재검증
rm -rf node_modules
npm install
git diff --stat package-lock.json   # 변경 내용을 Result에 요약

# 3) 핵심 검증
npm ci
npm run build
npm run lint

# 4) package.json 불변 재확인 (npm install 이후에도 변경되지 않았는지)
git diff --exit-code package.json
```

## Stop conditions

다음 상황에서 작업을 중단하고 BLOCKED로 보고한다:

1. 정합성 복구를 위해 `frontend/package.json`의 직접 의존성 버전 변경(Next.js 메이저
   업그레이드 포함)이 불가피한 경우.
2. 고정한 Node/npm 버전에서도 `npm ci`, `npm run build`, `npm run lint` 중 하나가
   3회 이상 반복 실패하는 경우.
3. lockfile 복구 과정에서 `npm audit fix`/`npm audit fix --force` 없이는 해결되지
   않는 구조적 문제가 발견되는 경우. (해결하지 말고 별도 Task로 제안한다.)
4. 선택 가능한 LTS Node 버전 중 Next.js 14 요구 사항(18.17+)을 만족하는 버전이
   현재 환경에 설치 불가능한 경우.

## Result

**상태**: DONE

**선택한 Node/npm 버전과 사유**:
- Node.js `22.20.0`, npm `10.9.3`.
- Next.js 14의 요구 사항(Node 18.17+)을 충족하고, 현재 `frontend/package.json`의
  `devDependencies.@types/node` 메이저 버전(`22.10.7`)과 일치하는 LTS 계열이다.
- 현재 개발 환경에 이미 설치되어 있으며 `nvm use`로 재현 가능하므로 Frontend 기준 버전으로
  `frontend/.nvmrc`에 고정했다.

**변경된 파일**:
- `frontend/.nvmrc`
- `frontend/package-lock.json`
- `README.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `docs/tasks/TASK-005A.md`

**실행한 명령**:
- `cat frontend/.nvmrc`
- `node --version`
- `npm --version`
- `shasum -a 256 frontend/package.json`
- `git diff --exit-code package.json`
- `cd frontend && npm install`
- `cd frontend && rm -rf node_modules && /Users/shinjungho/.nvm/versions/node/v22.20.0/bin/npm install && /Users/shinjungho/.nvm/versions/node/v22.20.0/bin/npm ci && /Users/shinjungho/.nvm/versions/node/v22.20.0/bin/npm run build && /Users/shinjungho/.nvm/versions/node/v22.20.0/bin/npm run lint`
- `git diff --stat package-lock.json`
- `git diff --exit-code package.json`
- `rg -n '"@napi-rs/wasm-runtime"|"@emnapi/core"|"@emnapi/runtime"|"@emnapi/wasi-threads"|"@unrs/resolver-binding-wasm32-wasi"' frontend/package-lock.json`

**검증 결과**:
- `cat frontend/.nvmrc`: `22.20.0`.
- `node --version`: `v22.20.0`.
- `npm --version`: `10.9.3`.
- `git diff --exit-code frontend/package.json`: 성공. 작업 전후 `frontend/package.json` 변경 없음.
- `npm install`: 성공. `frontend/package-lock.json` 정합성 복구.
- `git diff --stat package-lock.json`: `74` lines changed, `63` insertions, `11` deletions.
- `package-lock.json` 변경 요약:
  - 누락됐던 top-level optional peer `@emnapi/core@1.11.0`, `@emnapi/runtime@1.11.0` 추가.
  - `@emnapi/wasi-threads` top-level 항목을 `1.2.2`로 정합화.
  - `@unrs/resolver-binding-wasm32-wasi` 하위 의존성으로 `@emnapi/core@1.10.0`,
    `@emnapi/runtime@1.10.0`, `@emnapi/wasi-threads@1.2.1` 항목 추가.
- `npm ci`: 성공.
- `npm run build`: 성공.
- `npm run lint`: 성공. ESLint 경고/에러 없음.
- `README.md`: Frontend 기준 Node.js `22.20.0`과 `nvm use` 안내 추가.

**범위 제외 사항**:
- npm audit 취약점 해결은 이 Task에서 다루지 않으며, 별도 후속 Task로 분리한다.

**남은 위험**:
- npm install/ci 중 deprecated package 경고가 출력된다. 이 Task의 실패 조건은 아니며,
  의존성 업그레이드나 audit 대응은 별도 후속 Task에서 다룬다.
- 다른 Node/npm 메이저 버전(예: Node 25/npm 11)으로 설치하면 lockfile 해석이 달라질 수 있으므로,
  Frontend 작업 전 `frontend/.nvmrc` 기준으로 `nvm use`를 실행해야 한다.
