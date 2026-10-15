import { Link } from "react-router-dom";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RiotName } from "@/components/ui/RiotName";
import { CardTitleRow, TextLink } from "@/components/ui/SectionHeader";
import { favoriteSummary, useFavoritePlayers } from "@/features/search/player-lists";
import { agentIconPath } from "@/lib/assets";
import { formatRiotId, playerPath } from "@/lib/riot-id";

const HOME_FAVORITE_LIMIT = 3;

/** 즐겨찾기 플레이어 + 라이엇 계정 연동 (53:47) */
export function FavoritesAndLogin() {
  const { players } = useFavoritePlayers();

  return (
    <section aria-label="즐겨찾기와 계정 연동" className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Card className="flex flex-col gap-4 self-start px-6 pt-6 pb-10">
        <CardTitleRow title="즐겨찾기 플레이어" action={<TextLink to="/my/favorites">전체 보기</TextLink>} />
        {players.length > 0 ? (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {players.slice(0, HOME_FAVORITE_LIMIT).map((player) => (
              <li key={formatRiotId(player)}>
                <Link
                  to={playerPath(player)}
                  className="flex items-center gap-3 rounded-thumb bg-elevated p-4 hover:brightness-110"
                >
                  <img src={agentIconPath(player.agentId)} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
                  <span className="flex min-w-0 flex-col gap-1">
                    <RiotName id={player} weight="semibold" />
                    <span className="text-13 text-sub">{favoriteSummary(player)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-14 text-sub">플레이어 프로필에서 별을 눌러 즐겨찾기에 추가해 보세요.</p>
        )}
      </Card>

      <Card className="flex flex-col justify-between gap-5 p-6">
        <div className="flex flex-col">
          <p className="text-14 font-medium">계정 연결 예시</p>
          <h2 className="text-20 font-semibold">내 전적 연결 과정을 체험해 보세요</h2>
          <p className="text-14 text-sub">가상 계정으로 동의·연결·해제 흐름을 살펴보세요.</p>
        </div>
        <ButtonLink to="/my" className="w-full">
          예시 연결 체험
        </ButtonLink>
      </Card>
    </section>
  );
}
