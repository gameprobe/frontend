import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { GuideDetail } from "@/components/guide-map/GuideDetail";
import { GuideRouteMap } from "@/components/guide-map/GuideRouteMap";
import { boardPath } from "@/components/guide-map/paths";
import { Button } from "@/components/ui/Button";
import { agentName } from "@/data/game-names";
import { usePublishedSmokesOnMap } from "@/features/admin/public-guides";
import { SmokeMarkerIcon } from "@/features/smokes/SmokeMinimap";
import { useStoredList } from "@/lib/stored-list";
import { findLineupMap, siteLabel } from "@/mocks/lineups";
import { findSmoke, SMOKE_VARIANT_LABEL } from "@/mocks/smokes";
import { NotFoundPage } from "@/pages/NotFoundPage";

/** 스모크 상세 (라인업 상세 Figma 222:6350과 같은 구성, TASK-FE-059). /smokes/:mapId/:smokeId */
export function SmokeDetailPage() {
  const { mapId = "", smokeId = "" } = useParams();
  const location = useLocation();
  const map = findLineupMap(mapId);
  const published = usePublishedSmokesOnMap(mapId);
  const smoke = map ? (findSmoke(mapId, smokeId) ?? published.find((candidate) => candidate.id === smokeId)) : undefined;
  const [helped, setHelped] = useState(false);
  const [saved, updateSaved] = useStoredList<string>("gp:saved-smokes", []);

  if (!map || !smoke) return <NotFoundPage />;

  const side = smoke.side === "attack" ? "공격" : "수비";
  const variant = SMOKE_VARIANT_LABEL[smoke.variant];
  const isSaved = saved.includes(smoke.id);
  const from = (location.state as { from?: string } | null)?.from;
  const defaults: Record<string, string> = {};
  if (smoke.side === "defense") defaults.side = "defense";
  if (smoke.variant === "harbor-wall") defaults.type = "harbor-wall";

  return (
    <GuideDetail
      tags={[variant, side, siteLabel(smoke.site)]}
      title={smoke.title}
      meta={`${agentName(smoke.agentId)} · ${variant} · 예시 · 패치 검증 필요`}
      back={{ to: boardPath(`/smokes/${mapId}`, "smoke", smoke.id, from, defaults), label: "스모크 목록" }}
      video={{ url: smoke.videoUrl, placeholder: "스모크 영상" }}
      steps={smoke.steps}
      mapTitle={`${map.name} · ${variant} 연막`}
      map={
        <GuideRouteMap
          mapId={mapId}
          mapName={map.name}
          agentId={smoke.agentId}
          landing={smoke.landing}
          throwFrom={smoke.throwFrom}
          path={smoke.path}
          marker={
            <span className="relative flex size-9 items-center justify-center">
              <SmokeMarkerIcon selected />
            </span>
          }
        />
      }
      description={smoke.description ?? `${smoke.destinationName ?? smoke.title} 쪽에 ${agentName(smoke.agentId)}의 ${variant} 연막을 설치해요. 아래 순서대로 서는 위치와 조준을 맞춰 보세요.`}
      info={[
        { label: "요원", value: agentName(smoke.agentId) },
        { label: "연막 유형", value: variant },
        { label: "진영", value: side },
        { label: "사이트", value: siteLabel(smoke.site) },
      ]}
      actions={
        <>
          <Button variant="secondary" className="flex-1 px-2 text-14 font-semibold" aria-pressed={helped} onClick={() => setHelped((value) => !value)}>
            {helped ? "도움됐어요" : "도움돼요"}
          </Button>
          <Button
            className="flex-1 px-2 text-14"
            aria-pressed={isSaved}
            onClick={() => updateSaved((current) => (isSaved ? current.filter((id) => id !== smoke.id) : [...current, smoke.id]))}
          >
            {isSaved ? "저장됨" : "스모크 저장"}
          </Button>
        </>
      }
    />
  );
}
