import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { GuideDetail } from "@/components/guide-map/GuideDetail";
import { GuideRouteMap } from "@/components/guide-map/GuideRouteMap";
import { boardPath } from "@/components/guide-map/paths";
import { Button } from "@/components/ui/Button";
import { usePublishedLineups } from "@/features/admin/public-guides";
import { skillIconPath } from "@/lib/assets";
import { useStoredList } from "@/lib/stored-list";
import { agentSkills, findLineup, findLineupMap, siteLabel } from "@/mocks/lineups";
import { NotFoundPage } from "@/pages/NotFoundPage";

/** 라인업 상세 (Figma 222:6350, TASK-FE-059). /lineups/:mapId/:agentId/:lineupId */
export function LineupDetailPage() {
  const { mapId = "", agentId = "", lineupId = "" } = useParams();
  const location = useLocation();
  const map = findLineupMap(mapId);
  const published = usePublishedLineups(mapId, agentId);
  const lineup = map ? (findLineup(mapId, agentId, lineupId) ?? published.find((candidate) => candidate.id === lineupId)) : undefined;
  const [helped, setHelped] = useState(false);
  const [saved, updateSaved] = useStoredList<string>("gp:saved-lineups", []);

  if (!map || !lineup) return <NotFoundPage />;

  const skill = agentSkills(agentId).find((candidate) => candidate.skillId === lineup.skillId);
  const side = lineup.side === "attack" ? "공격" : "수비";
  const isSaved = saved.includes(lineup.id);
  const from = (location.state as { from?: string } | null)?.from;

  return (
    <GuideDetail
      tags={[skill?.name, side, siteLabel(lineup.site)].filter((tag): tag is string => Boolean(tag))}
      title={lineup.title}
      meta={[
        lineup.charge !== null && `충전 ${lineup.charge}칸`,
        lineup.bounce !== null && `바운스 ${lineup.bounce}회`,
        `난이도 ${lineup.difficulty}`,
        `추천 ${lineup.votes + (helped ? 1 : 0)}`,
      ]
        .filter(Boolean)
        .join(" · ")}
      back={{
        to: boardPath(`/lineups/${mapId}/${agentId}`, "lineup", lineup.id, from, lineup.side === "defense" ? { side: "defense" } : {}),
        label: "라인업 목록",
      }}
      video={{ url: lineup.videoUrl, placeholder: `라인업 영상${lineup.videoLength ? ` · ${lineup.videoLength}` : ""}` }}
      steps={lineup.steps}
      mapTitle={`${map.name} · ${skill?.name ?? "스킬"}`}
      map={
        <GuideRouteMap
          side={lineup.side}
          mapId={mapId}
          mapName={map.name}
          agentId={agentId}
          landing={lineup.landing}
          throwFrom={lineup.throwFrom}
          path={lineup.path}
          marker={
            <span className="flex size-11 items-center justify-center rounded-full border-2 border-main bg-primary drop-shadow-[0_0_8px_rgba(91,140,255,0.45)]">
              <img src={skillIconPath(lineup.skillId)} alt="" className="size-7" />
            </span>
          }
        />
      }
      description={lineup.description ?? `${lineup.title} 라인업이에요. 아래 순서대로 서는 위치와 조준을 맞춰 보세요.`}
      info={[
        { label: "스킬", value: skill ? `${skill.name} (${skill.key})` : lineup.skillId },
        ...(lineup.charge !== null ? [{ label: "충전", value: `${lineup.charge}칸` }] : []),
        ...(lineup.bounce !== null ? [{ label: "바운스", value: `${lineup.bounce}회` }] : []),
        { label: "난이도", value: lineup.difficulty },
      ]}
      actions={
        <>
          <Button variant="secondary" className="flex-1 px-2 text-14 font-semibold" aria-pressed={helped} onClick={() => setHelped((value) => !value)}>
            도움돼요 {lineup.votes + (helped ? 1 : 0)}
          </Button>
          <Button
            className="flex-1 px-2 text-14"
            aria-pressed={isSaved}
            onClick={() => updateSaved((current) => (isSaved ? current.filter((id) => id !== lineup.id) : [...current, lineup.id]))}
          >
            {isSaved ? "저장됨" : "라인업 저장"}
          </Button>
        </>
      }
    />
  );
}
