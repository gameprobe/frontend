/**
 * Riot VAL-MATCH-V1 / VAL-CONTENT-V1 문서에서 이번 계산에 사용하는 필드만 선언한다.
 * 전체 공식 DTO나 실응답을 검증한 타입이 아니다. 나머지 응답 필드는 검사 시 보존한다.
 * 출처: https://developer.riotgames.com/apis#val-match-v1/GET_getMatch (2026-09-20)
 * RR 변화·Probe Score·이미지·데모 상태는 이 계약에 넣지 않는다.
 */
export interface RiotMatchList {
  puuid: string;
  history: { matchId: string; gameStartTimeMillis: number; queueId: string }[];
}

export interface RiotPlayer {
  puuid: string;
  gameName: string;
  tagLine: string;
  teamId: string;
  characterId: string;
  competitiveTier: number;
  accountLevel: number;
  stats: {
    score: number;
    roundsPlayed: number;
    kills: number;
    deaths: number;
    assists: number;
    playtimeMillis: number;
  };
}

export interface RiotKill {
  timeSinceGameStartMillis: number;
  timeSinceRoundStartMillis: number;
  killer: string;
  victim: string;
  assistants: string[];
  finishingDamage: { damageType: string; damageItem: string; isSecondaryFireMode: boolean };
}

export interface RiotRoundPlayer {
  puuid: string;
  kills: RiotKill[];
  damage: { receiver: string; damage: number; legshots: number; bodyshots: number; headshots: number }[];
  score: number;
  economy: { loadoutValue: number; weapon: string; armor: string; remaining: number; spent: number };
}

export interface RiotRound {
  roundNum: number;
  roundResult: string;
  roundResultCode: string;
  winningTeam: string;
  winningTeamRole: string;
  playerStats: RiotRoundPlayer[];
}

export interface RiotMatch {
  matchInfo: {
    matchId: string;
    mapId: string;
    gameStartMillis: number;
    gameLengthMillis: number;
    queueId: string;
    gameMode: string;
    seasonId: string;
    isCompleted: boolean;
    isRanked: boolean;
  };
  players: RiotPlayer[];
  teams: { teamId: string; won: boolean; roundsPlayed: number; roundsWon: number; numPoints: number }[];
  roundResults: RiotRound[];
  coaches: { puuid: string; teamId: string }[];
}

/** CONTENT의 맵은 id가 아닌 assetPath로 matchInfo.mapId와 연결한다. */
export interface RiotContent {
  version: string;
  characters: { id: string; name: string }[];
  maps: { id: string; name: string; assetPath: string }[];
  equips: { id: string; name: string }[];
  acts: { id: string; name: string; isActive: boolean }[];
}
