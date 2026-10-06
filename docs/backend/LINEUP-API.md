# 라인업 관리자 저장 API

TASK-BE-003 기준. 새 관리자 프론트 연결을 위한 계약이며 `/admin/preview`는 아직 메모리 예시 화면이다.
저장소는 기존 MongoDB `lineups` 컬렉션을 사용한다. 스모크 저장은 포함하지 않는다.

## 코드에서 확인할 위치

- `lineup/web/LineupController.kt`, `AdminAuthorization.kt`: HTTP 요청 처리와 기존 관리자 토큰 확인.
- `lineup/service/LineupService.kt`: 등록·수정 검증과 기존 정보 보존.
- `lineup/repository/LineupRepository.kt`: MongoTemplate으로 조회·등록·수정·삭제하는 단일 저장소 클래스.
- `lineup/dto/LineupRequest.kt`: 라인업 등록·수정 요청과 상태 변경 요청(`StatusRequest`), 입력 검증 조건.
- `lineup/dto/LineupResponse.kt`: 프론트에 반환하는 라인업 정보와 내부 모델의 응답 변환.
- `lineup/dto/AdminSessionDto.kt`: 기존 관리자 세션 요청·응답.
- `lineup/LineupModels.kt`: 서비스·저장·DTO가 함께 사용하는 라인업과 좌표/등록 정보 모델.
- `lineup/LineupDocument.kt`: MongoDB 문서와 내부 모델 변환.

Controller는 서비스의 라인업을 `LineupResponse`로 변환한다. 저장소는 인터페이스와 구현을 하나로
합쳤으며 별도 MongoLineupRepository 클래스는 없다.

최신 계약은 경로를 최상위 `pathPoints` 하나에 저장한다. 중복된 `registration.routePoints`,
요원 전용 `sovaSettings`, 충전 단계 `chargeLevel`, 계산 응답 `bounceCount`, 경유·튕김 구분 `kind`는 제거했다.
발사 방법과 충전 정도는 영상·이미지·설명으로 안내한다.

## 요청과 응답

| 동작 | 경로 | 성공 |
| --- | --- | --- |
| 관리자 등록 | `POST /api/admin/lineups` | 201, 저장된 라인업 |
| 관리자 수정 | `PUT /api/admin/lineups/{id}` | 200, 저장된 라인업 |
| 관리자 전체 목록/상세 | `GET /api/admin/lineups`, `GET /api/admin/lineups/{id}` | 200 |
| 상태 변경 | `PATCH /api/admin/lineups/{id}/status` | 200 |
| 삭제 | `DELETE /api/admin/lineups/{id}` | 204 |
| 공개 목록/상세 | `GET /api/lineups`, `GET /api/lineups/{id}` | 200, PUBLISHED 자료만 |

기존 경로와 `X-Admin-Token` 인증은 유지한다. 등록/수정은 아래와 같은 JSON을 받는다.
응답에는 요청 내용과 서버가 정한 `id`, `authorId`, `createdAt`, `updatedAt`이 포함된다.
목록은 같은 형태의 배열이며 기존 mapId/agentId/side 필터와 정렬을 유지한다.

```json
{
  "title": "소바 A 사이트 정찰",
  "description": "표시된 벽에 한 번 튕겨 사용합니다.",
  "mapId": "ascent",
  "side": "ATTACK",
  "agentId": "sova",
  "difficulty": "MEDIUM",
  "skillMarkers": [
    { "abilityId": "recon-bolt", "position": { "x": 0.72, "y": 0.28 }, "order": 0 }
  ],
  "agentMarkers": [
    { "position": { "x": 0.35, "y": 0.8 }, "label": "출발" }
  ],
  "pathPoints": [
    { "x": 0.45, "y": 0.6 },
    { "x": 0.61, "y": 0.45 }
  ],
  "status": "DRAFT",
  "registration": {
    "destination": {
      "id": "ascent-a-default",
      "name": "A 사이트 기본 위치",
      "point": { "x": 0.72, "y": 0.28 }
    },
    "media": { "type": "IMAGE", "url": "https://example.com/lineup.png" },
    "site": "A",
    "abilitySlot": "E"
  }
}
```

예시 주소는 실제 자료가 아니다. VIDEO도 같은 구조로 `media.type`과 URL을 지정한다.
백엔드는 URL을 저장할 뿐 다운로드하거나 영상/이미지의 존재·재생 가능 여부를 검사하지 않는다.
중간 지점의 좌표만 순서대로 지정하며 일반 경유·튕김을 구분하지 않는다.
등록·수정·응답·MongoDB 저장에 같은 경로를 사용하며, 별도 튕김 횟수는 입력·저장·응답하지 않는다.

## 새 관리자와의 대응

| 관리자 입력 | API 필드 | 규칙 |
| --- | --- | --- |
| 제목/설명 | title/description | 제목 필수, 최대160자. 설명 필수. preview의 선택 설명을 그대로 비워 보내면 400 |
| 맵/요원/공수 | mapId/agentId/side | 공수 ATTACK/DEFENSE |
| 난이도 | difficulty | EASY/MEDIUM/HARD. 프론트에 명시적인 선택 필요 |
| 출발점 | agentMarkers[0].position | 0~1 정규화 좌표 |
| 도착점 | skillMarkers[0].position + registration.destination | 도착 ID·이름·좌표 저장, 두 좌표 표현이 같아야 함 |
| 스킬 | skillMarkers[0].abilityId + registration.abilitySlot | 기존 abilityId와 슬롯 C/Q/E/X를 각각 지정. 슬롯을 실제 abilityId로 임의 치환하지 않음 |
| 중간 경로 | pathPoints | 출발·도착을 제외한 중간 좌표의 순서 있는 배열. 각 항목은 x/y, 최대30개 |
| 자료 주소 | registration.media | VIDEO/IMAGE, 자격정보 없는 절대 HTTP(S) URL, 최대2048자 |
| 사이트 | registration.site | A/B/C/MID (`Mid` 입력은 MID로 변환) |
| 공개 상태 | status | DRAFT/REVIEW/PUBLISHED/REJECTED, 기존 상태를 보존해서 제출 |

`pathPoints`는 중간 경로만 담당하고, `registration`은 도착점 식별 정보와 미디어·사이트·스킬 슬롯을
담당한다. 프론트는 중간 경로를 두 번 만들 필요가 없다. 도착점 좌표는 기존 화면의
`skillMarkers[0].position`과 `registration.destination.point`가 같아야 한다.

`registration`이 있는 자료는 출발·도착 마커가 각각 하나인 **개별 공략 하나**다.
기존 다중 마커 자료는 registration 없이 계속 저장·조회한다. 새 편집기가 이를
첫 마커 하나로 축소해서 저장하지 않도록 후속 프론트 연결에서 구분해야 한다.

기존 `skillMarkers[].youtubeUrl`은 계속 지원한다. 새 형식에서 함께 보내려면
media가 VIDEO이고 주소가 같아야 한다. IMAGE는 youtubeUrl을 생략/null로 보낸다.
일반 영상 주소의 실제 플레이어 지원 여부는 프론트에서 별도로 처리한다.

## 경로 하나로 저장

- `pathPoints`는 registration 유무와 관계없이 같은 형식이다. 소바도 다른 요원과 동일하게 등록한다.
- 각 항목의 `x`, `y`는 필수인 0~1 좌표다. 생략/null을 0으로 바꾸지 않고 400으로 거절한다. 출발점에서 도착점까지 지나는 순서대로 중간 지점을 보낸다.
- 출발점 → 중간 좌표들 → 도착점을 순서대로 연결한다. 꺾이는 좌표의 역할이나 튕김 횟수를 추론하지 않는다.
- 빈 배열은 중간 지점 없이 출발점과 도착점을 직선으로 연결하는 경로다. `pathPoints`를 생략해도 빈 배열이 된다.
  배열 자체의 null, null 항목, 30개 초과 또는 범위 밖 좌표는 400이다.
- 충전 시간·충전 단계·요원별 튕김 횟수 제한은 이 저장 계약에 없다. 실제 동작은 첨부 자료로 설명한다.

## 기존 자료와 수정 호환성

- registration 없는 MongoDB 문서는 `registration: null`로 읽으며, 기존 x/y 경로는 같은 형식으로 유지한다.
  실제 Atlas 자료를 읽거나 이전하지 않았으며, 새 소스를 실행 중인 서버에 재배포하지 않았다.
- 기존 다중 마커 자료는 registration 없이 등록·수정할 수 있다. 소바에도 별도 설정 필수 규칙은 없다.
- 기존 PUT이 registration을 생략하거나 null로 보내면 이미 저장된 registration은 보존한다.
- 이때 제목·설명·난이도·상태와 `pathPoints` 변경은 가능하다. 경로의 좌표·순서 변경과
  빈 배열로 초기화하는 동작은 registration과 독립적이다. PUT에서 pathPoints를 생략해도
  빈 배열로 교체되므로 기존 경로를 유지하려면 그 배열을 함께 보낸다.
- 지도·요원·공수·출발/도착 마커를 바꾸면서 registration을 보내지 않으면 409를 반환한다.
  이미 저장된 도착점·미디어 정보가 바뀐 맥락과 뒤섞이지 않도록 하는 규칙이다.
- 새 편집기는 수정할 때 registration 전체를 함께 보낸다. 이 계약에 registration 제거 동작은 없다.
- 제거한 sovaSettings·chargeLevel·registration.routePoints·bounceCount·pathPoints[].kind를 기존 요청이 보내더라도
  알려지지 않은 JSON 필드로 무시하며 저장·반환하지 않는다. 이전 값의 승계나 대체 경로 변환은 없다.
  기존 MongoDB 문서에 남아 있는 제거 필드는 응답 모델에 포함하지 않으며, 문서를 전체 교체하는 수정 때 제거된다.
- 상태 PATCH는 pathPoints와 registration을 포함한 현재 모델의 나머지 내용을 보존한다.

기존 프론트가 사용하는 x/y 경로는 그대로 보낼 수 있지만, 소바 전용 입력·표시와 경유·튕김 구분 버튼은 후속 프론트 작업에서
정리해야 한다. 이번 작업은 백엔드 계약만 변경하며 `/admin/preview`의 메모리 예시는 실제 저장으로 전환하지 않는다.

위 보존 검사는 요청이 순차 처리되는 경우의 규칙이다. 기존 저장 구현은 문서 전체를 교체하며
버전 기반 동시 수정 검사를 제공하지 않는다. 여러 관리자가 같은 자료를 동시에 저장하면
이전 내용을 나중 요청이 덮어쓸 수 있다. 동시 편집 충돌 방지는 별도 저장 계약 보완 사항이다.

## 같은 도착점의 여러 공략

같은 맵에서 destination.id를 재사용하면 같은 도착점으로 묶을 수 있다.
각 라인업은 별도의 ID·출발점·경로·미디어를 갖는다. 동일 출발점에서 다른 도착점으로
가는 공략도 별도 라인업으로 등록한다.

이번 계약은 **공략별 도착점 ID와 스냅샷의 저장**이다. 한 공략의 도착점 변경이 다른
공략에 자동 반영되지는 않으며, 같은 ID의 좌표가 모두 같다는 DB 제약도 없다.
새 자료를 기존 도착점에 추가할 때는 기존 ID/이름/좌표를 함께 재사용한다.
여러 공략의 도착점을 한 번에 옮기는 동작은 원자적 일괄 수정·동시 편집 규칙이 필요하므로
후속 API 작업 전에는 실제 연결 화면에서 활성화하지 않는다. 순차 PUT을 일괄 수정처럼 취급하지 않는다.

## 오류와 검증 범위

- 400: 필수 입력 오류, 필드의 형식/길이/enum 오류, 경로의 null/길이/좌표 오류,
  도착점과 마커의 좌표 불일치, 잘못된 미디어 URL.
- 403: 기존 관리자 토큰 누락/불일치. 세션 검증 실패는 기존대로 401.
- 404: 없는 자료, 공개되지 않은 자료의 공개 상세 조회.
- 409: 새 등록 정보가 있는 자료의 관련 정보를 registration 없는 구형 PUT으로 변경.
- 오류 본문의 세부 형식은 기존 Spring 설정을 따른다. 프론트는 상태 코드를 기준으로 안내한다.
- 수정은 DTO 검증·인증 후 기존 자료 조회 → 등록 정보 보존 → 서비스 검증 순서다.
  동시에 여러 오류가 있으면 없는 자료404 또는 구형 수정 충돌409가 서비스 입력 오류400보다 먼저 반환될 수 있다.

벽 반사 물리, 지형 충돌, 해당 요원의 실제 스킬 슬롯/맵 사이트 유효성은 계산하지 않는다.
운영자가 입력한 경로를 검증 가능한 형식으로 보존한다. 실제 자료 품질 검수는 별도다.
난이도·설명 등 기존 필수값은 실제 연결 때 입력을 보완한다. 추정값은 저장하지 않는다.
