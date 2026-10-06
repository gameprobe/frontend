import { matches, matchList } from './fixtures/matches';
import { content } from './fixtures/content';
import { manifest } from './fixtures/manifest';
import { buildProfile, type ProfileQuery } from './profile';

const viewer = matches[0].players.find(player => player.puuid === manifest.viewerPuuid)!;
/** 홈 데모 링크와 프로필 신원을 같은 원본에서 읽는다. 실제 Riot ID 검색 결과가 아니다. */
export const demoProfile = {
  puuid: viewer.puuid, name: viewer.gameName, tag: viewer.tagLine,
  href: `/players/${viewer.puuid}`, level: viewer.accountLevel,
};
export const demoSeason = { id: matches[0].matchInfo.seasonId, label: 'Demo Act' };
export type DemoScenario = 'ready' | 'partial' | 'empty' | 'error';
export function demoScenario(value?: string): DemoScenario {
  return value === 'partial' || value === 'empty' || value === 'error' ? value : 'ready';
}
export type ProfileResult = ReturnType<typeof buildProfile>;
export type ProfileProvider = (query: ProfileQuery, signal: AbortSignal) => Promise<ProfileResult>;

/** 실제 연결 때 교체할 공급 경계. 지금은 HTTP/키 없이 같은 DTO 검증·집계 경로를 통과한다. */
export function createMockProvider(scenario: DemoScenario = 'ready'): ProfileProvider {
  return async (query, signal) => {
    // 비동기 응답 수명을 유지하여 화면에서 조회 변경/취소를 처리한다.
    await Promise.resolve();
    if (signal.aborted) throw new Error('Request cancelled');
    if (scenario === 'error') throw new Error('Demo request failure');
    return buildProfile(scenario === 'empty' ? { ...matchList, history: [] } : matchList,
      matches.map((data, index) => scenario === 'partial' && index === 1
        ? { matchId: data.matchInfo.matchId, status: 'error' as const, reason: 'demo_detail_failure' }
        : { matchId: data.matchInfo.matchId, status: 'ok' as const, data }), content, query);
  };
}
