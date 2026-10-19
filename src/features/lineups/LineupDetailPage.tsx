import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { GuideDetail } from "@/components/guide-map/GuideDetail";
import { GuideRouteMap } from "@/components/guide-map/GuideRouteMap";
import { boardPath } from "@/components/guide-map/paths";
import { useAdminMode } from "@/features/admin/admin-session";
import { createPublicLineupApi, PublicLineupError, toPublicLineup } from "@/features/lineups/lineup-api";
import { LineupMedia } from "@/features/lineups/LineupMedia";
import { Button } from "@/components/ui/Button";
import { usePublishedLineups } from "@/features/admin/public-guides";
import { skillIconPath } from "@/lib/assets";
import { useStoredList } from "@/lib/stored-list";
import { agentSkills, findLineup, findLineupMap, type Lineup } from "@/mocks/lineups";
import { NotFoundPage } from "@/pages/NotFoundPage";

/** 라인업 상세 (Figma 222:6350, TASK-FE-059). /lineups/:mapId/:agentId/:lineupId */
export function LineupDetailPage() {
  const { mapId = "", agentId = "", lineupId = "" } = useParams();
  const location = useLocation();
  const map = findLineupMap(mapId);
  const demo = useAdminMode() === "demo";
  const published = usePublishedLineups(mapId, agentId);
  const requestKey = `${mapId}/${agentId}/${lineupId}`;
  const [reload, setReload] = useState(0);
  const [remote, setRemote] = useState<{ key: string; lineup?: Lineup; loading: boolean; error: string; missing: boolean }>({ key: "", loading: true, error: "", missing: false });
  useEffect(() => {
    if (demo || !mapId || !agentId || !lineupId) return;
    const controller = new AbortController();
    const key = `${mapId}/${agentId}/${lineupId}`;
    setRemote({ key, loading: true, error: "", missing: false });
    createPublicLineupApi(import.meta.env.VITE_BACKEND_URL).get(lineupId, controller.signal)
      .then((record) => {
        if (controller.signal.aborted) return;
        const matches = record.id === lineupId && record.mapId === mapId && record.agentId === agentId;
        setRemote({ key, lineup: matches ? toPublicLineup(record) : undefined, loading: false, error: "", missing: !matches });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setRemote({ key, loading: false, error: error instanceof Error ? error.message : "라인업을 불러오지 못했습니다.", missing: error instanceof PublicLineupError && error.status === 404 });
      });
    return () => controller.abort();
  }, [mapId, agentId, lineupId, demo, reload]);
  const lineup = demo && map ? (findLineup(mapId, agentId, lineupId) ?? published.find((candidate) => candidate.id === lineupId))
    : remote.key === requestKey ? remote.lineup : undefined;
  const [helped, setHelped] = useState(false);
  const [saved, updateSaved] = useStoredList<string>("gp:saved-lineups", []);

  if (!map) return <NotFoundPage />;
  if (!demo && (remote.key !== requestKey || remote.loading)) {
    return <div role="status" className="container-page py-10 text-15 text-sub">라인업을 불러오는 중이에요.</div>;
  }
  if (!demo && remote.missing) {
    return <div className="container-page flex flex-col items-start gap-4 py-10"><p role="status" className="text-15 text-sub">공개된 라인업을 찾을 수 없습니다. 삭제되었거나 비활성 상태일 수 있어요.</p><a href={`/lineups/${mapId}/${agentId}`} className="text-primary hover:underline">라인업 목록으로 돌아가기</a></div>;
  }
  if (!demo && remote.error) {
    return <div className="container-page flex flex-col items-start gap-4 py-10"><p role="alert" className="text-15 text-sub">{remote.error}</p><Button variant="secondary" onClick={() => setReload((value) => value + 1)}>다시 시도</Button></div>;
  }
  if (!lineup) return <NotFoundPage />;

  const skill = agentSkills(agentId).find((candidate) => candidate.skillId === lineup.skillId);
  const side = lineup.side === "attack" ? "공격" : "수비";
  const isSaved = saved.includes(lineup.id);
  const from = (location.state as { from?: string } | null)?.from;

  return (
    <GuideDetail
      tags={[skill?.name, side, demo ? "예시 자료" : undefined].filter((tag): tag is string => Boolean(tag))}
      title={lineup.title}
      meta={[
        lineup.charge !== null && `충전 ${lineup.charge}칸`,
        lineup.bounce !== null && `바운스 ${lineup.bounce}회`,
        demo && `난이도 ${lineup.difficulty}`,
        demo && `추천 ${lineup.votes + (helped ? 1 : 0)}`,
        !demo && `등록 ${lineup.addedAt.slice(0, 10)}`,
      ]
        .filter(Boolean)
        .join(" · ")}
      back={{
        to: boardPath(`/lineups/${mapId}/${agentId}`, "lineup", lineup.id, from, lineup.side === "defense" ? { side: "defense" } : {}),
        label: "라인업 목록",
      }}
      video={{ url: lineup.videoUrl, placeholder: `라인업 영상${lineup.videoLength ? ` · ${lineup.videoLength}` : ""}` }}
      media={<LineupMedia key={lineup.id} lineupId={lineup.id} title={lineup.title} videoUrl={lineup.videoUrl} images={lineup.images} />}
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
        ...(lineup.destinationName ? [{ label: "도착점", value: lineup.destinationName }] : []),
        ...(demo ? [{ label: "난이도", value: lineup.difficulty }] : []),
      ]}
      actions={
        <>
          {demo && <Button variant="secondary" className="flex-1 px-2 text-14 font-semibold" aria-pressed={helped} onClick={() => setHelped((value) => !value)}>
            도움돼요 {lineup.votes + (helped ? 1 : 0)}
          </Button>}
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
