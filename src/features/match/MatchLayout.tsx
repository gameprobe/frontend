import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import chevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { agentIconPath, mapImagePath } from "@/lib/assets";
import { type MatchOutletContext } from "@/features/match/match-context";
import { cx } from "@/lib/cx";
import { formatSigned } from "@/lib/format";
import { formatRiotId, playerPath } from "@/lib/riot-id";
import { DEMO_MATCH, getMatchDetail, type MatchDetail } from "@/mocks/match";
import { PROBE_PROFILE } from "@/mocks/profile";

const TABS = [
  { label: "스코어보드", path: "" },
  { label: "라운드 타임라인", path: "/rounds" },
  { label: "팀 경제 · 퍼포먼스", path: "/economy" },
  { label: "플레이어 비교", path: "/compare" },
] as const;

function MatchHero({ match }: { match: MatchDetail }) {
  const me = match.players.find((player) => player.isMe);
  const win = match.result === "win";

  return (
    <Card as="section" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[170px]">
        <img src={mapImagePath(match.mapId)} alt="" className="h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#161d28_30%,rgba(22,29,40,0.55))]" />
      </div>
      <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-end md:gap-10 md:p-10">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-16 font-medium">
            {match.mapName} · {match.queue} · {match.ago} · {match.durationMin}분
          </p>
          <h1 className="flex items-baseline gap-5 text-32 font-semibold md:text-40">
            <span className={win ? "text-win" : "text-loss"}>{win ? "승리" : "패배"}</span>
            <span lang="en">
              {match.score[0]} : {match.score[1]}
            </span>
          </h1>
        </div>
        {me && (
          <div className="flex items-center gap-4 rounded-thumb border border-line bg-page px-5 py-4">
            <img src={agentIconPath(me.agentId)} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
            <div className="flex flex-col gap-1">
              <p className="text-13 text-sub">{me.agentName} · 내 성적</p>
              <p lang="en" className="text-20 font-semibold whitespace-nowrap">
                {me.kills} / {me.deaths} / {me.assists}
              </p>
            </div>
            <span aria-hidden className="h-10 w-px bg-line" />
            <div className="flex flex-col gap-1">
              <p lang="en" className="text-13 text-sub">
                ACS
              </p>
              <p lang="en" className="text-20 font-semibold">
                {me.acs}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p lang="en" className="text-13 text-sub">
                RR
              </p>
              <p lang="en" className={cx("text-20 font-semibold", match.rrChange >= 0 ? "text-win" : "text-loss")}>
                {formatSigned(match.rrChange)}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/** 예시 상세가 없는 경기: 프로필 목록에는 있지만 시안에는 첫 경기 상세만 있다. */
function MissingMatch({ matchId }: { matchId: string }) {
  const known = PROBE_PROFILE.matches.some((match) => match.id === matchId);
  return (
    <div className="container-page pt-8 pb-20 md:pt-10">
      <Card as="section" role="status" className="flex flex-col items-start gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-1">
          <p className="text-14 font-medium text-sub">매치 상세</p>
          <h1 className="text-24 font-semibold">
            {known ? "이 경기는 아직 상세 예시 데이터가 없어요" : "경기를 찾을 수 없어요"}
          </h1>
          <p className="mt-2 text-15 text-sub">
            백엔드를 연결하기 전까지는 예시 경기(선셋 13 : 4) 한 개만 상세를 볼 수 있어요.
          </p>
        </div>
        <ButtonLink to={`/matches/${DEMO_MATCH.id}`}>예시 경기 보기</ButtonLink>
      </Card>
    </div>
  );
}

/** 03 매치 상세 공통 틀: 뒤로 가기 + 경기 요약 + 탭 (Figma 96:331). */
export function MatchLayout() {
  const { matchId = "" } = useParams();
  const match = getMatchDetail(matchId);
  if (!match) return <MissingMatch matchId={matchId} />;

  const basePath = `/matches/${match.id}`;

  return (
    <div className="container-page flex flex-col gap-4 pt-6 pb-20 md:pt-8">
      <div className="flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col gap-4">
          <Link
            to={`${playerPath(match.owner)}/matches`}
            className="flex w-fit items-center gap-1 text-14 font-medium text-primary hover:underline"
          >
            <img src={chevronLeftIcon} alt="" width={16} height={16} />
            {formatRiotId(match.owner)} 님의 매치 기록
          </Link>
          <MatchHero match={match} />
        </div>
        <nav aria-label="매치 상세 메뉴" className="flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]">
          {TABS.map((tab) => (
            <NavLink
              key={tab.label}
              to={`${basePath}${tab.path}`}
              end
              className={({ isActive }) =>
                cx(
                  "-mb-px flex h-11 shrink-0 items-center border-b-2 px-3 text-15 font-semibold whitespace-nowrap md:px-4 md:text-16",
                  isActive ? "border-primary text-main" : "border-transparent text-sub hover:text-main",
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet context={{ match } satisfies MatchOutletContext} />
    </div>
  );
}
