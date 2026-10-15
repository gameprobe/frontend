import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { RiotName } from "@/components/ui/RiotName";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useMockSession, useSettings, type Settings } from "@/features/my/my-store";
import { favoriteSummary, useFavoritePlayers } from "@/features/search/player-lists";
import { agentIconPath } from "@/lib/assets";
import { formatRiotId, playerPath } from "@/lib/riot-id";
import { PROBE_PROFILE } from "@/mocks/profile";

/** 28 마이 - 계정 연동 (Figma 57:1267) */
export function AccountTab() {
  const navigate = useNavigate();
  const { session, signOut } = useMockSession();
  if (!session) return null;

  const disconnect = () => {
    signOut();
    navigate("/my");
  };

  return (
    <Card as="section" aria-label="연결된 예시 계정" className="flex flex-wrap items-center gap-5 p-6 md:p-8">
      <img src={agentIconPath(PROBE_PROFILE.agentId)} alt="" className="size-16 shrink-0 rounded-thumb object-cover" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-13 font-medium text-sub">연결된 예시 계정</p>
        <p className="truncate text-20 font-semibold">{formatRiotId(session)}</p>
        <p className="text-13 text-sub-weak">
          {PROBE_PROFILE.server} · {session.linkedAt} 연동
        </p>
      </div>
      <Button variant="secondary" className="px-4 text-14" onClick={disconnect}>
        예시 연결 해제
      </Button>
    </Card>
  );
}

/** 29 마이 - 내 전적 바로가기 (Figma 57:1318) */
export function RecordTab() {
  const { session } = useMockSession();
  if (!session) return null;
  const { rank, summary } = PROBE_PROFILE;
  const stats = [
    { label: "승률", value: `${summary.winRate}%` },
    { label: "K/D", value: summary.kd.toFixed(2) },
    { label: "평균 ACS", value: String(summary.acs) },
    { label: "헤드샷", value: `${summary.headshot}%` },
  ];

  return (
    <Card as="section" aria-label="내 전적 요약" className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center gap-4">
        <img src={agentIconPath(PROBE_PROFILE.agentId)} alt="" className="size-14 shrink-0 rounded-thumb object-cover" />
        <div className="flex flex-col gap-1">
          <p className="text-20 font-semibold">{formatRiotId(session)}</p>
          <p className="text-14 text-sub">
            {rank.tier} · <span lang="en">{rank.rr} RR</span>
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 rounded-thumb bg-elevated p-4">
            <dt className="text-13 text-sub">{stat.label}</dt>
            <dd lang="en" className="text-24 font-semibold">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
      <div>
        <ButtonLink to={playerPath(session)} className="h-12 px-6">
          내 전적 페이지로 이동
        </ButtonLink>
      </div>
    </Card>
  );
}

/** 30 마이 - 즐겨찾기 관리 (Figma 57:1382). 전적 검색·홈의 즐겨찾기와 같은 목록이다. */
export function FavoritesTab() {
  const { players, remove } = useFavoritePlayers();

  if (players.length === 0) {
    return (
      <Card as="section" role="status" className="flex flex-col items-start gap-4 p-6 md:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-18 font-semibold">즐겨찾기한 플레이어가 없어요</h2>
          <p className="text-14 text-sub">플레이어 프로필에서 별을 눌러 추가할 수 있어요.</p>
        </div>
        <ButtonLink to="/search" variant="secondary">
          전적 검색으로 가기
        </ButtonLink>
      </Card>
    );
  }

  return (
    <Card as="section" aria-label="즐겨찾기 관리" className="px-5 py-2 md:px-6">
      <ul>
        {players.map((player) => (
          <li key={formatRiotId(player)} className="flex items-center gap-3 border-b border-line-light py-4 last:border-b-0">
            <img src={agentIconPath(player.agentId)} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
            <Link to={playerPath(player)} className="group flex min-w-0 flex-1 flex-col gap-1">
              <RiotName id={player} weight="semibold" className="group-hover:underline" />
              <span className="text-13 text-sub">{favoriteSummary(player)}</span>
            </Link>
            <Button
              variant="secondary"
              className="h-9 px-4 text-13 text-sub"
              onClick={() => remove(player)}
              aria-label={`${formatRiotId(player)} 즐겨찾기 삭제`}
            >
              삭제
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const THEME_OPTIONS = [
  { value: "dark", label: "다크" },
  { value: "light", label: "라이트" },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
] as const;

const REGION_OPTIONS = [
  { value: "kr", label: "한국" },
  { value: "ap", label: "아시아 태평양" },
  { value: "na", label: "북미" },
  { value: "eu", label: "유럽" },
] as const;

function SettingRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <li className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line-light py-5 last:border-b-0">
      <div className="flex min-w-[200px] flex-1 flex-col gap-1">
        <p className="text-16 font-semibold">{title}</p>
        <p className="text-13 text-sub">{description}</p>
      </div>
      {children}
    </li>
  );
}

/**
 * 31 마이 - 설정 (Figma 57:1440). 선택은 브라우저에 저장한다.
 * 라이트 테마·영어 화면은 시안이 없어 아직 바뀌지 않고, 설명 문구로 알려 준다.
 */
export function SettingsTab() {
  const [settings, update] = useSettings();

  return (
    <Card as="section" aria-label="설정" className="px-5 py-2 md:px-6">
      <ul>
        <SettingRow
          title="테마"
          description={
            settings.theme === "dark" ? "딥 다크 슬레이트 테마를 사용 중이에요" : "라이트 테마는 준비 중이라 지금은 다크로 보여요"
          }
        >
          <SegmentedControl
            label="테마"
            options={THEME_OPTIONS}
            value={settings.theme}
            onChange={(value: Settings["theme"]) => update("theme", value)}
          />
        </SettingRow>
        <SettingRow
          title="언어"
          description={settings.language === "ko" ? "서비스 화면에 표시할 언어" : "영어 화면은 준비 중이에요"}
        >
          <Dropdown
            label="언어"
            appearance="field"
            options={LANGUAGE_OPTIONS}
            value={settings.language}
            onChange={(value: Settings["language"]) => update("language", value)}
            className="w-40"
          />
        </SettingRow>
        <SettingRow title="기본 서버 지역" description="랭킹을 열 때 먼저 적용돼요">
          <SegmentedControl
            label="기본 서버 지역"
            options={REGION_OPTIONS}
            value={settings.region}
            onChange={(value: Settings["region"]) => update("region", value)}
          />
        </SettingRow>
      </ul>
    </Card>
  );
}
