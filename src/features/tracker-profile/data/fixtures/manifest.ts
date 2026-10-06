import { contentIds } from './content';

/** 역할은 Riot MATCH/CONTENT 필드가 아닌 이 데모의 앱 메타데이터다. */
export const agentRoles: Readonly<Record<string, string>> = {
  [contentIds.agents.jett]: 'duelist',
  [contentIds.agents.omen]: 'controller',
  [contentIds.agents.sova]: 'initiator',
  [contentIds.agents.sage]: 'sentinel',
  [contentIds.agents.raze]: 'duelist',
  [contentIds.agents.brimstone]: 'controller',
  [contentIds.agents.cypher]: 'sentinel',
};

/** 원본 DTO 밖에서만 합성 여부·검증 범위·고정 시간·단순화 가정을 설명한다. */
export const manifest = {
  kind: 'synthetic',
  fixtureVersion: '1.0.0',
  metricDefinitionVersion: '1.0.0',
  documentationCheckedAt: '2026-09-20',
  fixedNowMillis: 1789905600000,
  viewerPuuid: 'demo-player-01',
  source: {
    match: 'https://developer.riotgames.com/apis#val-match-v1/GET_getMatch',
    matchList: 'https://developer.riotgames.com/apis#val-match-v1/GET_getMatchlist',
    content: 'https://developer.riotgames.com/apis#val-content-v1/GET_getContent',
  },
  sourceDescription: '공식 문서의 사용 필드만 본떠 만든 합성 표본. 실제 API 호출·실사용자 데이터·공식 콘텐츠 ID를 포함하지 않는다.',
  platform: 'pc',
  shard: 'kr',
  consent: 'demo_explanation_only',
  coverage: {
    matchCount: 4,
    playersPerMatch: 10,
    allRounds: true,
    allKillEvents: true,
    allDamageEvents: true,
    allEconomyRecords: true,
    completeSeason: false,
    validatesEntireOfficialResponse: false,
  },
  agentRoles,
  expectedViewer: { kills: 65, deaths: 56, assists: 23, wins: 3, losses: 1 },
  expectedJett: { matches: 2, kills: 42, deaths: 32, assists: 11 },
  simplifications: [
    '모든 라운드는 전멸로 끝난다. 설치·해체·위치·코치·부활·환경사 이벤트는 생성하지 않는다.',
    '좌표와 연속 이동 경로를 만들지 않는다. 관련 필드는 이번 소비 DTO의 범위 밖이다.',
    '킬 시점은 라운드 시작 후 15초부터 3초 간격이며 라운드 길이는 90초로 고정한다.',
    '피해는 처치당 합계 150으로 단순화하고 어시스트 기여자에게 30씩 배분한다. 무기별 탄도·방어구·치유를 재현하지 않는다.',
    '명중 부위 수는 합성 값이며 DamageDto에 없는 무기별 명중이나 무기별 피해를 추정하는 근거가 아니다.',
    '라운드 score는 합성 피해 + 킬 × 100 + assist × 25로 만든다. 실제 Riot 전투점수 산식을 구현한 것이 아니다.',
    '장비·지출·잔액은 라운드별 합성 관측값이다. 이전 라운드 잔액에서 다음 구매를 시뮬레이션하지 않는다.',
    'Weapon/Ability, Eliminated, Attacker/Defender는 fixture에서 사용하는 값이며 공식 enum 전체라고 주장하지 않는다.',
    '콘텐츠 이름과 역할은 데모 표시용 메타데이터다. ID와 assetPath는 모두 demo 전용이며 외부 자산은 포함하지 않는다.',
  ],
} as const;
