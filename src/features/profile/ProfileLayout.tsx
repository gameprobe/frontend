import { NavLink, Outlet, useParams, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { ProfileHeader } from "@/features/profile/ProfileHeader";
import { parseQueue, QUEUE_OPTIONS, queueHasData, type ProfileOutletContext } from "@/features/profile/profile-context";
import { PlayerNotFoundCard } from "@/features/search/SearchCards";
import { cx } from "@/lib/cx";
import { parseRiotId, playerPath } from "@/lib/riot-id";
import { findMockPlayer } from "@/mocks/players";
import { getMockProfile } from "@/mocks/profile";

const TABS = [
  { label: "개요 · 랭크/티어", path: "" },
  { label: "매치 기록", path: "/matches" },
  { label: "요원별 통계", path: "/agents" },
  { label: "맵별 통계", path: "/maps" },
  { label: "무기별 통계", path: "/weapons" },
] as const;

/** 02 플레이어 프로필 공통 틀: 프로필 카드 + 탭 + 큐 필터 (Figma 96:295). */
export function ProfileLayout() {
  const { riotId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = parseRiotId(riotId);
  const player = parsed ? findMockPlayer(parsed) : undefined;

  if (!player) {
    return (
      <div className="container-page pt-8 pb-20 md:pt-10">
        <PlayerNotFoundCard query={riotId} />
      </div>
    );
  }

  const profile = getMockProfile(player);
  const basePath = playerPath(player);
  const queue = parseQueue(searchParams.get("queue"));
  const search = queue === "all" ? "" : `?queue=${queue}`;
  const context: ProfileOutletContext = { profile, search, basePath };

  const changeQueue = (next: typeof queue) => {
    setSearchParams(next === "all" ? {} : { queue: next }, { replace: true });
  };

  return (
    <div className="container-page flex flex-col gap-5 pt-6 pb-20 md:pt-8">
      <div className="flex flex-col gap-5">
        <ProfileHeader profile={profile} />
        <div className="flex items-end justify-between gap-4 border-b border-line">
          <nav aria-label="프로필 메뉴" className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]">
            {TABS.map((tab) => (
              <NavLink
                key={tab.label}
                to={`${basePath}${tab.path}${search}`}
                end
                className={({ isActive }) =>
                  cx(
                    "flex h-11 shrink-0 items-center border-b-2 px-3 text-15 font-semibold whitespace-nowrap md:px-4 md:text-16",
                    isActive ? "border-primary text-main" : "border-transparent text-sub hover:text-main",
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
          <Dropdown label="큐" options={QUEUE_OPTIONS} value={queue} onChange={changeQueue} className="shrink-0 pb-1.5" />
        </div>
      </div>

      {queueHasData(queue) ? (
        <Outlet context={context} />
      ) : (
        <Card as="section" role="status" className="flex flex-col gap-1 p-6 md:p-8">
          <h2 className="text-18 font-semibold">이 큐의 경기 기록이 없어요</h2>
          <p className="text-14 text-sub">다른 큐를 선택하거나 ‘큐 전체’로 다시 확인해 주세요.</p>
        </Card>
      )}
    </div>
  );
}
