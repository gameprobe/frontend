import { useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import chevronLeftIcon from "@/assets/icons/chevron-left.svg";
import playIcon from "@/assets/icons/play.svg";
import searchIcon from "@/assets/icons/search.svg";
import { VideoLink } from "@/components/guide-map/GuideDetail";
import { lineupDetailPath } from "@/components/guide-map/paths";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { usePublishedLineups } from "@/features/admin/public-guides";
import { MapPickerGrid } from "@/features/lineups/MapPickerGrid";
import { MinimapStage } from "@/features/lineups/MinimapStage";
import { SelectionRow } from "@/features/lineups/SelectionRow";
import { useStoredList } from "@/lib/stored-list";
import { agentIconPath, mapImagePath, ROLE_LABELS, skillIconPath, type AgentRole } from "@/lib/assets";
import { cx } from "@/lib/cx";
import {
  agentSkills,
  findLineupMap,
  findLineups,
  lineupAgents,
  siteLabel,
  type Lineup,
  type LineupSide,
  type Skill,
} from "@/mocks/lineups";
import { NotFoundPage } from "@/pages/NotFoundPage";

const SITE_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "A", label: "A" },
  { value: "미드", label: "미드" },
  { value: "B", label: "B" },
] as const;

type SiteFilter = (typeof SITE_OPTIONS)[number]["value"];
type Sort = "popular" | "latest";

const SIDE_LABEL: Record<LineupSide, string> = { attack: "공격", defense: "수비" };

/**
 * 기본 상태: 공격, 지금 진영에 라인업이 있는 스킬 전부, 사이트 전체, 인기순.
 * (어센트 · 소바 · 공격은 시안처럼 정찰용 화살·충격 화살 2개가 된다)
 */
function useBoardFilters(skills: Skill[], lineups: Lineup[]) {
  const [params, setParams] = useSearchParams();
  const side: LineupSide = params.get("side") === "defense" ? "defense" : "attack";
  const defaultSkills = skills
    .filter((skill) => lineups.some((lineup) => lineup.side === side && lineup.skillId === skill.skillId))
    .map((skill) => skill.skillId);

  const skillParam = params.get("skills");
  const selectedSkills = skillParam === null ? defaultSkills : skillParam.split(",").filter(Boolean);
  const site = (SITE_OPTIONS.find((option) => option.value === params.get("site"))?.value ?? "all") as SiteFilter;
  const sort: Sort = params.get("sort") === "latest" ? "latest" : "popular";
  const lineupId = params.get("lineup");

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: key !== "lineup" });
  };

  const toggleSkill = (skillId: string) => {
    const next = selectedSkills.includes(skillId)
      ? selectedSkills.filter((id) => id !== skillId)
      : [...selectedSkills, skillId];
    const isDefault = next.length === defaultSkills.length && next.every((id) => defaultSkills.includes(id));
    set("skills", isDefault ? null : next.join(","));
  };

  // 진영을 바꾸면 그 진영의 기본 스킬로 돌아간다.
  const changeSide = (next: LineupSide) => {
    const params2 = new URLSearchParams(params);
    params2.delete("skills");
    params2.delete("lineup");
    if (next === "attack") params2.delete("side");
    else params2.set("side", next);
    setParams(params2, { replace: true });
  };

  return { side, selectedSkills, site, sort, lineupId, set, toggleSkill, changeSide };
}

/** 시안(178:3343) 칩 순서: 전체 · 타격대 · 척후대 · 감시자 · 전략가 */
const PICKER_ROLES: AgentRole[] = ["duelist", "initiator", "sentinel", "controller"];
const ROLE_OPTIONS = [{ value: "all", label: "전체" }, ...PICKER_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }))] as const;

/** Figma dropdown / 요원 선택(178:3337). 검색 · 역할 칩 · 4열 초상 그리드(스크롤). */
function AgentPicker({ id, mapId, current, onPick }: { id: string; mapId: string; current: string; onPick: (agentId: string) => void }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | AgentRole>("all");
  const agents = lineupAgents(mapId)
    .filter((agent) => role === "all" || agent.role === role)
    .filter((agent) => agent.name.includes(query.trim()))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  return (
    <div id={id} className="flex flex-col gap-3">
      <label className="flex items-center gap-2 rounded-lg border border-line bg-page px-3 py-[9px]">
        <img src={searchIcon} alt="" width={16} height={16} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="요원 이름 검색"
          aria-label="요원 이름 검색"
          className="w-full min-w-0 bg-transparent text-13 outline-none placeholder:text-sub-weak [&::-webkit-search-cancel-button]:hidden"
        />
      </label>
      <div role="radiogroup" aria-label="역할군" className="flex flex-wrap gap-1.5">
        {ROLE_OPTIONS.map((option) => {
          const on = option.value === role;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setRole(option.value)}
              className={cx(
                "rounded-full border px-2.5 py-[5px] text-12 font-medium tracking-normal",
                on ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-sub hover:text-main",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <div className="relative">
        <ul aria-label="요원 선택" className="grid h-[296px] grid-cols-4 content-start justify-between gap-x-1 gap-y-2.5 overflow-y-auto overscroll-contain pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {agents.map((agent) => {
            const selected = agent.agentId === current;
            return (
              <li key={agent.agentId} className="flex justify-center">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onPick(agent.agentId)}
                  className="flex w-[52px] flex-col items-center gap-[5px]"
                >
                  <img
                    src={agentIconPath(agent.agentId)}
                    alt=""
                    className={cx(
                      "size-[52px] rounded-[10px] bg-elevated object-cover",
                      selected ? "border-2 border-primary" : "border border-line hover:border-line-strong",
                    )}
                  />
                  <span className={cx("w-14 text-center text-11 leading-[1.3]", selected ? "font-semibold text-primary" : "font-medium text-sub")}>
                    {agent.name}
                  </span>
                </button>
              </li>
            );
          })}
          {agents.length === 0 && <li className="col-span-4 py-6 text-center text-13 text-sub">맞는 요원이 없어요.</li>}
        </ul>
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-9 bg-gradient-to-b from-[rgba(22,29,40,0)] to-surface" />
      </div>
    </div>
  );
}

function LineupDetail({ lineup, skill, detailPath, onBack }: { lineup: Lineup; skill?: Skill; detailPath: string; onBack: () => void }) {
  const [helped, setHelped] = useState(false);
  const [saved, updateSaved] = useStoredList<string>("gp:saved-lineups", []);
  const isSaved = saved.includes(lineup.id);

  return (
    <Card as="section" aria-label={`${lineup.title} 상세`} className="flex flex-col gap-5 p-5">
      <button type="button" onClick={onBack} className="flex w-fit items-center gap-1 text-13 font-semibold text-primary hover:underline">
        <img src={chevronLeftIcon} alt="" width={14} height={14} />
        라인업 목록
      </button>
      <div className="flex flex-col gap-2">
        <ul className="flex flex-wrap gap-1.5">
          {[skill?.name, SIDE_LABEL[lineup.side], siteLabel(lineup.site)].filter(Boolean).map((tag) => (
            <li key={tag} className="rounded-md bg-elevated px-2 py-1 text-12 font-medium text-sub">
              {tag}
            </li>
          ))}
        </ul>
        <h2 className="text-20 font-semibold">{lineup.title}</h2>
        <p className="text-13 text-sub">
          {[
            lineup.charge !== null && `충전 ${lineup.charge}칸`,
            lineup.bounce !== null && `바운스 ${lineup.bounce}회`,
            `난이도 ${lineup.difficulty}`,
            `추천 ${lineup.votes}`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {/* 영상은 상세 페이지에서 본다(TASK-FE-059). 영상 주소가 없는 생성 예시는 자리만 보여준다 */}
      {lineup.videoUrl ? (
        <VideoLink to={detailPath} label={`라인업 영상${lineup.videoLength ? ` · ${lineup.videoLength}` : ""}`} />
      ) : (
      <div className="flex h-[158px] flex-col items-center justify-center gap-2 rounded-thumb bg-elevated" aria-label="라인업 영상 (준비 중)">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary">
          <img src={playIcon} alt="" width={16} height={16} />
        </span>
        <span className="text-12 font-medium text-sub">라인업 영상 · {lineup.videoLength}</span>
      </div>
      )}
      <ol className="flex flex-col gap-4">
        {lineup.steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span lang="en" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-12 font-semibold text-primary">
              {index + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-14 font-semibold">{step.title}</p>
                <p className="text-13 text-sub">{step.text}</p>
              </div>
              {step.screenshot && (
                <div className="flex h-[120px] items-center justify-center rounded-lg border border-dashed border-line bg-elevated text-12 text-disabled">
                  {step.screenshot}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="flex gap-2">
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
      </div>
    </Card>
  );
}

/** 08 라인업 - 맵 뷰 (Figma 72:65) · 상세 (72:96). 필터와 고른 라인업은 쿼리(?side·skills·site·sort·lineup)에 둔다. */
export function LineupBoardPage() {
  const { mapId, agentId } = useParams();
  const map = findLineupMap(mapId);
  const agent = map ? lineupAgents(map.mapId).find((candidate) => candidate.agentId === agentId) : undefined;
  // 관리자 예시에서 게시한 공략도 같은 탭에서는 함께 보여준다 (TASK-FE-056)
  const published = usePublishedLineups(map?.mapId, agent?.agentId);
  const all = map && agent ? [...findLineups(map.mapId, agent.agentId), ...published] : [];
  const skills = agent ? agentSkills(agent.agentId) : [];
  const filters = useBoardFilters(skills, all);
  const [reportNote, setReportNote] = useState(false);
  const [picker, setPicker] = useState<"map" | "agent" | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  if (!map || !agent) return <NotFoundPage />;

  const visible = all
    .filter((lineup) => lineup.side === filters.side)
    .filter((lineup) => filters.selectedSkills.includes(lineup.skillId))
    .filter((lineup) => filters.site === "all" || lineup.site === filters.site)
    .sort((a, b) => (filters.sort === "popular" ? b.votes - a.votes : b.addedAt.localeCompare(a.addedAt)));
  const selected = visible.find((lineup) => lineup.id === filters.lineupId);
  const skillOf = (lineup: Lineup) => skills.find((skill) => skill.skillId === lineup.skillId);

  const emptyMessage =
    all.length === 0
      ? `${map.name} · ${agent.name} 라인업 예시는 아직 없어요. 시안 예시는 어센트 · 소바예요.`
      : filters.selectedSkills.length === 0
        ? "스킬을 하나 이상 골라 주세요."
        : "조건에 맞는 라인업이 없어요.";

  return (
    <div className="container-page pt-8 pb-20">
      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside aria-label="라인업 필터" className="flex flex-col gap-4">
          <Card
            className="flex flex-col gap-4 p-5"
            onKeyDown={(event) => {
              if (event.key === "Escape") setPicker(null);
            }}
          >
            <SelectionRow
              label="맵"
              title={map.name}
              image={mapImagePath(map.mapId)}
              wide
              open={picker === "map"}
              controls="lineup-map-picker"
              onToggle={() => setPicker(picker === "map" ? null : "map")}
            />
            <span aria-hidden className="h-px bg-line" />
            {picker === "map" ? (
              <MapPickerGrid
                id="lineup-map-picker"
                current={map.mapId}
                onPick={(next) => {
                  setPicker(null);
                  if (next !== map.mapId) navigate(`/lineups/${next}/${agent.agentId}`);
                }}
              />
            ) : (
              <SelectionRow
                label="요원"
                title={`${agent.name} · ${ROLE_LABELS[agent.role]}`}
                image={agentIconPath(agent.agentId)}
                open={picker === "agent"}
                controls="lineup-agent-picker"
                onToggle={() => setPicker(picker === "agent" ? null : "agent")}
              />
            )}
            {picker === "agent" && (
              <AgentPicker
                id="lineup-agent-picker"
                mapId={map.mapId}
                current={agent.agentId}
                onPick={(next) => {
                  setPicker(null);
                  if (next !== agent.agentId) navigate(`/lineups/${map.mapId}/${next}`);
                }}
              />
            )}
          </Card>
          <div role="radiogroup" aria-label="공격 · 수비" className="flex gap-1 rounded-thumb border border-line bg-surface p-1">
            {(["attack", "defense"] as const).map((side) => {
              const active = filters.side === side;
              return (
                <button
                  key={side}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => filters.changeSide(side)}
                  className={cx(
                    "flex-1 rounded-lg py-2 text-14",
                    active ? "bg-primary-soft font-semibold text-primary" : "font-medium text-sub hover:text-main",
                  )}
                >
                  {SIDE_LABEL[side]}
                </button>
              );
            })}
          </div>
          <Card as="section" aria-labelledby="skill-title" className="flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between">
              <h2 id="skill-title" className="text-16 font-semibold">
                스킬
              </h2>
              {skills.length > 0 && (
                <p className="text-12 text-sub-weak">
                  {filters.selectedSkills.length} / {skills.length} 선택
                </p>
              )}
            </div>
            {skills.length === 0 ? (
              <p className="text-13 text-sub">이 요원의 스킬 정보는 준비 중이에요.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {skills.map((skill) => {
                  const on = filters.selectedSkills.includes(skill.skillId);
                  return (
                    <li key={skill.skillId}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => filters.toggleSkill(skill.skillId)}
                        className={cx(
                          "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left",
                          on ? "border-primary bg-primary-soft" : "border-transparent bg-elevated hover:border-line-strong",
                        )}
                      >
                        <img src={skillIconPath(skill.skillId)} alt="" className={cx("size-7", !on && "opacity-50")} />
                        <span className={cx("flex-1 text-14 font-medium", !on && "text-sub")}>{skill.name}</span>
                        <span lang="en" className={cx("text-13 font-semibold", on ? "text-primary" : "text-sub-weak")}>
                          {skill.key}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
          <Card as="section" aria-labelledby="site-title" className="flex flex-col gap-3 p-5">
            <h2 id="site-title" className="text-16 font-semibold">
              사이트
            </h2>
            <FilterChipGroup
              label="사이트"
              options={SITE_OPTIONS}
              value={filters.site}
              onChange={(next) => filters.set("site", next === "all" ? null : next)}
              size="xl"
            />
          </Card>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" size="lg" className="w-full text-14 font-semibold" onClick={() => setReportNote(true)}>
              + 라인업 제보하기
            </Button>
            <p aria-live="polite" className="text-center text-12 text-sub-weak">
              {reportNote ? "라인업 제보는 준비 중이에요." : ""}
            </p>
          </div>
        </aside>

        <Card as="section" aria-labelledby="board-title" className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 id="board-title" className="text-18 font-semibold">
                {map.name} · {SIDE_LABEL[filters.side]}
              </h2>
              <p className="text-13 text-sub">
                {selected
                  ? "던지는 위치에서 착지 지점까지의 경로예요. 던지는 위치를 누르면 영상이 재생돼요."
                  : "착지 마커에 마우스를 올리면 출발지가 보이고, 출발지를 누르면 영상이 재생돼요."}
              </p>
            </div>
            <p className="shrink-0 text-13 font-medium text-sub-weak">라인업 {visible.length}개</p>
          </div>
          <MinimapStage
            mapId={map.mapId}
            mapName={map.name}
            agentId={agent.agentId}
            lineups={visible}
            selected={selected}
            onSelect={(lineup) => filters.set("lineup", lineup.id)}
            // 출발지를 누르면 상세 페이지로 간다. 돌아올 때 지금 필터를 살리도록 쿼리를 넘긴다 (TASK-FE-059)
            onPlay={(lineup) => navigate(lineupDetailPath(map.mapId, agent.agentId, lineup.id), { state: { from: location.search } })}
          />
        </Card>

        {selected ? (
          <LineupDetail
            key={selected.id}
            lineup={selected}
            skill={skillOf(selected)}
            detailPath={lineupDetailPath(map.mapId, agent.agentId, selected.id)}
            onBack={() => filters.set("lineup", null)}
          />
        ) : (
          <Card as="section" aria-labelledby="list-title" className="flex flex-col gap-1 px-3 pt-5 pb-4">
            <div className="flex items-center justify-between px-2 pb-2">
              <h2 id="list-title" className="text-16 font-semibold">
                라인업 목록
              </h2>
              <div role="radiogroup" aria-label="정렬" className="flex gap-3 text-13">
                {(["popular", "latest"] as const).map((sort) => (
                  <button
                    key={sort}
                    type="button"
                    role="radio"
                    aria-checked={filters.sort === sort}
                    onClick={() => filters.set("sort", sort === "popular" ? null : sort)}
                    className={filters.sort === sort ? "font-semibold text-primary" : "font-medium text-sub-weak hover:text-main"}
                  >
                    {sort === "popular" ? "인기순" : "최신순"}
                  </button>
                ))}
              </div>
            </div>
            {visible.length === 0 ? (
              <p role="status" className="px-2 py-6 text-14 text-sub">
                {emptyMessage}
              </p>
            ) : (
              <ul aria-label="라인업 목록" className="flex flex-col gap-1">
                {visible.map((lineup) => (
                  <li key={lineup.id}>
                    <button
                      type="button"
                      onClick={() => filters.set("lineup", lineup.id)}
                      className="flex w-full items-center gap-3 rounded-thumb p-3 text-left hover:bg-elevated"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-elevated">
                        <img src={skillIconPath(lineup.skillId)} alt="" className="size-6" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate text-14 font-semibold">{lineup.title}</span>
                        <span className="truncate text-12 text-sub">
                          {[
                            skillOf(lineup)?.name,
                            lineup.charge !== null && `충전 ${lineup.charge}`,
                            lineup.bounce !== null && `바운스 ${lineup.bounce}`,
                            lineup.difficulty,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                      <span lang="en" className="text-12 font-medium text-sub-weak">
                        {lineup.votes}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
