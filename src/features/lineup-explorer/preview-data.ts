import mockLineups from "../../data/mock-lineups.json";
import type { Lineup, LineupPoint } from "../../types/lineup";

type ExamplePosition = { start: LineupPoint; target: LineupPoint; path: LineupPoint[]; name: string };

// 실제 공략 검증 결과가 아닌 합성 좌표다. 목록과 상세가 이 원본을 함께 사용한다.
const positions: Record<string, ExamplePosition> = {
  "ascent-sova-a-main-recon-001": { start: { x: .28, y: .66 }, target: { x: .72, y: .42 }, path: [{ x: .46, y: .54 }], name: "예시 A 도착점" },
  "ascent-sova-b-lobby-shock-002": { start: { x: .3, y: .75 }, target: { x: .34, y: .3 }, path: [{ x: .42, y: .6 }, { x: .28, y: .45 }], name: "예시 B 도착점" },
  "ascent-killjoy-b-site-molly-003": { start: { x: .22, y: .43 }, target: { x: .35, y: .31 }, path: [], name: "예시 B 설치 위치" },
  "haven-sova-c-long-recon-004": { start: { x: .2, y: .76 }, target: { x: .24, y: .26 }, path: [{ x: .33, y: .51 }], name: "예시 C 도착점" },
  "haven-killjoy-c-garage-turret-005": { start: { x: .42, y: .37 }, target: { x: .3, y: .3 }, path: [], name: "예시 C 감시 위치" },
  "haven-cypher-a-lobby-trip-006": { start: { x: .74, y: .27 }, target: { x: .78, y: .47 }, path: [], name: "예시 A 도착점" },
  "split-viper-b-main-screen-007": { start: { x: .22, y: .36 }, target: { x: .35, y: .55 }, path: [], name: "예시 B 도착점" },
  "split-viper-a-postplant-snakebite-008": { start: { x: .65, y: .74 }, target: { x: .75, y: .35 }, path: [{ x: .83, y: .52 }], name: "예시 A 도착점" },
  "split-cypher-b-main-camera-009": { start: { x: .34, y: .3 }, target: { x: .22, y: .42 }, path: [], name: "예시 B 감시 위치" },
  "ascent-killjoy-a-lockdown-010": { start: { x: .77, y: .26 }, target: { x: .69, y: .32 }, path: [], name: "예시 A 배치 위치" },
};

const existingExamples: Lineup[] = (mockLineups as Lineup[]).map(lineup => {
  const position = positions[lineup.id];
  return {
    ...lineup,
    isExample: true,
    // 기존 demo-* 주소는 실제 재생 자료가 아니므로 공개 미리보기에서 링크로 만들지 않는다.
    media: { ...lineup.media, youtubeUrl: undefined },
    mapPreview: {
      destinationId: `example-destination-${lineup.id}`,
      destinationName: position.name,
      agentPosition: { ...position.start },
      skillPosition: { ...position.target },
      pathPoints: position.path.map(point => ({ ...point })),
    },
  };
});

const first = existingExamples[0];
const additionalExamples: Lineup[] = [
  {
    ...first,
    id: "example-ascent-sova-a-recon-origin-2",
    title: "예시 · 다른 출발점에서 A 도착점으로 ②",
    description: "같은 도착점을 향하는 두 번째 출발·경로를 선택하는 화면 동작용 합성 예시입니다.",
    steps: ["지도에서 두 번째 출발점을 선택합니다.", "이 공략에 연결된 경로와 상세 화면을 확인합니다."],
    media: { ...first.media },
    mapPreview: { ...first.mapPreview, agentPosition: { x: .43, y: .8 }, skillPosition: { ...first.mapPreview!.skillPosition! }, pathPoints: [{ x: .61, y: .67 }] },
  },
  {
    ...first,
    id: "example-ascent-sova-a-recon-origin-3",
    title: "예시 · 다른 출발점에서 A 도착점으로 ③",
    description: "같은 도착점으로 이어지는 세 번째 출발·직선 경로를 비교하는 합성 예시입니다.",
    steps: ["지도에서 세 번째 출발점을 선택합니다.", "이 공략에 연결된 경로와 상세 화면을 확인합니다."],
    media: { ...first.media },
    mapPreview: { ...first.mapPreview, agentPosition: { x: .8, y: .7 }, skillPosition: { ...first.mapPreview!.skillPosition! }, pathPoints: [] },
  },
  {
    ...first,
    id: "example-ascent-sova-recon-other-destination",
    title: "예시 · 같은 스킬의 별도 도착점",
    description: "요원과 스킬이 같아도 다른 도착점을 별도로 선택하는 화면 동작용 합성 예시입니다.",
    steps: ["다른 도착점을 선택합니다.", "앞선 A 도착점과 공략이 섞이지 않는지 확인합니다."],
    media: { ...first.media },
    mapPreview: {
      destinationId: "example-ascent-sova-recon-other-destination",
      destinationName: "예시 별도 도착점",
      agentPosition: { x: .45, y: .76 }, skillPosition: { x: .3, y: .27 }, pathPoints: [{ x: .36, y: .48 }],
    },
  },
];

/** 기존 열 공략의 ID를 보존하고 같은 도착점/별도 도착점을 비교하는 세 예시를 추가한다. */
export const previewLineups: Lineup[] = [...existingExamples, ...additionalExamples];
