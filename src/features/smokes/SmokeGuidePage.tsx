import { Fragment, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { agentName } from "@/data/game-names";
import { MapPickerGrid } from "@/features/lineups/MapPickerGrid";
import { SelectionRow } from "@/features/lineups/SelectionRow";
import { SmokeMarkerIcon, SmokeMinimap } from "@/features/smokes/SmokeMinimap";
import { agentIconPath, mapImagePath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { findLineupMap, siteLabel, type LineupSide } from "@/mocks/lineups";
import {
  findSmokes,
  SMOKE_AGENT_STATS,
  SMOKE_VARIANT_LABEL,
  smokeMeta,
  smokeSiteOptions,
  type SmokeGuide,
  type SmokeVariant,
} from "@/mocks/smokes";

const SIDE_LABEL: Record<LineupSide, string> = { attack: "공격", defense: "수비" };
const DEFAULT_MAP = "ascent";

/** 필터와 고른 연막은 쿼리(?map·side·site·type·smoke)에 둔다. 기본: 어센트 · 공격 · 전체 · 공통 원형. */
function useSmokeFilters() {
  const [params, setParams] = useSearchParams();
  const map = findLineupMap(params.get("map") ?? DEFAULT_MAP) ?? findLineupMap(DEFAULT_MAP)!;
  const side: LineupSide = params.get("side") === "defense" ? "defense" : "attack";
  const variant: SmokeVariant = params.get("type") === "harbor-wall" ? "harbor-wall" : "circle";
  const siteOptions = smokeSiteOptions(map.mapId);
  const site = siteOptions.find((option) => option.value === params.get("site"))?.value ?? "all";
  const smokeId = params.get("smoke");

  /** 값을 바꾸면 고른 연막은 닫는다. 연막을 고를 때만 기록에 남긴다. */
  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    if (!("smoke" in changes)) next.delete("smoke");
    setParams(next, { replace: !("smoke" in changes) });
  };

  return { map, side, variant, site, siteOptions, smokeId, update };
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cx("flex gap-1 rounded-thumb border border-line p-1", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cx(
              "flex-1 rounded-lg py-2 text-14",
              active ? "bg-primary-soft font-semibold text-primary" : "font-medium text-sub hover:text-main",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function CompareTable() {
  return (
    <Card as="section" aria-labelledby="smoke-compare-title" className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <h2 id="smoke-compare-title" className="text-15 font-semibold tracking-normal">
          요원별 연막 비교
        </h2>
        <p className="text-12 font-medium tracking-normal text-caution">예시 · 검증 전</p>
      </div>
      <table className="w-full overflow-hidden rounded-[10px] bg-page text-12 tracking-normal outline outline-1 -outline-offset-1 outline-line">
        <thead>
          <tr className="text-left text-sub-weak">
            <th scope="col" className="w-[106px] py-2 pl-2.5 font-medium">
              요원
            </th>
            <th scope="col" className="w-16 py-2 font-medium">
              크기
            </th>
            <th scope="col" className="py-2 pr-2.5 font-medium">
              지속
            </th>
          </tr>
        </thead>
        <tbody>
          {SMOKE_AGENT_STATS.map((stat) => (
            <tr key={stat.agentId} className="border-t border-line-light text-sub">
              <th scope="row" className="py-1 pl-2.5 text-left">
                <span className="flex items-center gap-1.5 font-semibold text-main">
                  <img src={agentIconPath(stat.agentId)} alt="" className="size-5 rounded-md bg-elevated object-cover" />
                  {stat.name}
                </span>
              </th>
              <td className="py-1">{stat.size}</td>
              <td className="py-1 pr-2.5">{stat.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-12 leading-[1.55] tracking-normal text-sub-weak">바이퍼 전용 연막은 라인업 페이지에서 확인할 수 있어요.</p>
    </Card>
  );
}

function SmokeDetail({ smoke }: { smoke: SmokeGuide }) {
  return (
    <section aria-label={`${smoke.title} 상세`} className="flex flex-col gap-4 rounded-thumb border border-line bg-page p-5 tracking-normal">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-16 font-semibold">{smoke.title}</h3>
          <p className="text-12 text-sub">
            {agentName(smoke.agentId)} · {SMOKE_VARIANT_LABEL[smoke.variant]} · 예시 설명
          </p>
        </div>
        <ul className="flex gap-1.5">
          {[SIDE_LABEL[smoke.side], siteLabel(smoke.site)].map((tag) => (
            <li key={tag} className="rounded-md bg-elevated px-2 py-1 text-12 font-medium text-sub">
              {tag}
            </li>
          ))}
        </ul>
      </div>
      <ol className="grid gap-3 sm:grid-cols-3">
        {smoke.steps.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-2.5">
            {/* 스크린샷은 아직 없어 자리만 보여준다 */}
            <div className="flex h-28 items-center justify-center rounded-lg border border-line bg-elevated text-12 text-sub-weak">
              {step.screenshot}
            </div>
            <p className="flex items-center gap-2 text-13 font-semibold">
              <span lang="en" className="flex size-5 items-center justify-center rounded-full bg-primary text-11 font-semibold text-on-primary">
                {index + 1}
              </span>
              {step.title}
            </p>
            <p className="text-12 leading-[1.55] text-sub">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** 09 스모크 가이드 - 기본 (Figma 182:4065) · 맵 드롭다운 (185:4122) · 연막 선택 (185:4375) */
export function SmokeGuidePage() {
  const filters = useSmokeFilters();
  const { map, side, variant, site } = filters;
  const [mapOpen, setMapOpen] = useState(false);

  const all = findSmokes(map.mapId, side, variant);
  const visible = all.filter((smoke) => site === "all" || smoke.site === site);
  const selected = visible.find((smoke) => smoke.id === filters.smokeId);
  const select = (smoke: SmokeGuide) => filters.update({ smoke: smoke.id === selected?.id ? null : smoke.id });

  return (
    <div className="container-page flex flex-col gap-6 pt-8 pb-12">
      <Card as="section" className="flex flex-wrap items-center justify-between gap-6 p-7">
        <div className="flex flex-col gap-2">
          <p lang="en" className="text-12 font-semibold tracking-[1.44px] text-primary">
            GAMEPROBE SMOKE LIBRARY
          </p>
          <h1 className="text-28 leading-[1.35] font-semibold tracking-normal">스모크 가이드</h1>
          <p className="text-14 leading-[1.6] tracking-normal text-sub">
            맵과 진영을 고르면 어디에 연막을 설치하면 좋은지 미니맵 위에서 바로 확인할 수 있어요.
            <br />
            바이퍼를 제외한 공통 원형 연막과 하버 일자 연막을 안내해요.
          </p>
        </div>
        <div className="flex w-full flex-col gap-1.5 rounded-thumb border-l-3 border-caution bg-page px-5 py-4 tracking-normal md:w-[380px]">
          <p className="text-14 font-semibold text-caution">예시 스모크 가이드</p>
          <p className="text-13 leading-[1.55] text-sub">위치·경로·크기·지속시간은 예시예요. 실제 사용 전 패치별 검증이 필요해요.</p>
        </div>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside aria-label="스모크 필터" className="flex flex-col gap-4">
          <Card
            className="flex flex-col gap-4 p-5"
            onKeyDown={(event) => {
              if (event.key === "Escape") setMapOpen(false);
            }}
          >
            <SelectionRow
              label="맵"
              title={map.name}
              image={mapImagePath(map.mapId)}
              wide
              open={mapOpen}
              controls="smoke-map-picker"
              onToggle={() => setMapOpen((open) => !open)}
            />
            {mapOpen && (
              <>
                <span aria-hidden className="h-px bg-line" />
                <MapPickerGrid
                  id="smoke-map-picker"
                  current={map.mapId}
                  onPick={(next) => {
                    setMapOpen(false);
                    if (next !== map.mapId) filters.update({ map: next === DEFAULT_MAP ? null : next, site: null });
                  }}
                />
              </>
            )}
          </Card>
          <Segmented
            label="공격 · 수비"
            options={[
              { value: "attack", label: "공격" },
              { value: "defense", label: "수비" },
            ]}
            value={side}
            onChange={(next) => filters.update({ side: next === "attack" ? null : next })}
            className="bg-surface"
          />
          <CompareTable />
          <Card as="section" aria-labelledby="smoke-site-title" className="flex flex-col gap-3 p-5">
            <h2 id="smoke-site-title" className="text-16 font-semibold">
              사이트
            </h2>
            <FilterChipGroup
              label="사이트"
              options={filters.siteOptions}
              value={site}
              onChange={(next) => filters.update({ site: next === "all" ? null : next })}
              size="xl"
            />
          </Card>
          <Card as="section" aria-labelledby="smoke-type-title" className="flex flex-col gap-3 p-5">
            <h2 id="smoke-type-title" className="text-15 font-semibold tracking-normal">
              연막 유형
            </h2>
            <Segmented
              label="연막 유형"
              options={[
                { value: "circle", label: "공통 원형" },
                { value: "harbor-wall", label: "하버 일자" },
              ]}
              value={variant}
              onChange={(next) => filters.update({ type: next === "circle" ? null : next })}
              className="bg-page"
            />
          </Card>
        </aside>

        <Card as="section" aria-labelledby="smoke-explorer-title" className="flex min-w-0 flex-col overflow-hidden tracking-normal">
          <div className="flex items-center justify-between gap-3 border-b border-line-light px-6 py-5">
            <div className="flex flex-col gap-1">
              <p lang="en" className="text-11 font-semibold tracking-[1.32px] text-sub-weak">
                SMOKE EXPLORER
              </p>
              <h2 id="smoke-explorer-title" className="text-20 leading-[1.35] font-semibold">
                {map.name} · {SIDE_LABEL[side]}
              </h2>
            </div>
            <p className="text-13 font-medium text-sub">
              가이드 {visible.length}개 · {SIDE_LABEL[side]}
            </p>
          </div>
          <div className="flex justify-center bg-page px-4 py-7">
            <SmokeMinimap mapId={map.mapId} mapName={map.name} smokes={visible} selected={selected} onSelect={select} />
          </div>
          <ul aria-label="범례" className="flex flex-wrap gap-5 border-t border-line-light px-6 py-4 text-12 text-sub">
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-full bg-primary" />
              연막 도착 위치
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-full bg-win" />
              투척 위치
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="h-0.5 w-4 bg-primary" />
              투사 경로
            </li>
          </ul>
          <div className="flex flex-col gap-2.5 px-6 pt-5 pb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-15 font-semibold">연막 예시 목록</h3>
              <p className="text-13 font-medium text-sub-weak">{visible.length}개</p>
            </div>
            {visible.length === 0 ? (
              <p role="status" className="py-6 text-center text-14 text-sub">
                조건에 맞는 연막 예시가 없어요.
              </p>
            ) : (
              <ul aria-label="연막 예시 목록" className="flex flex-col gap-2.5">
                {visible.map((smoke) => {
                  const active = smoke.id === selected?.id;
                  return (
                    <Fragment key={smoke.id}>
                      <li>
                        <button
                          type="button"
                          aria-expanded={active}
                          onClick={() => select(smoke)}
                          className={cx(
                            "flex w-full items-center gap-3.5 rounded-thumb bg-elevated py-3 pr-4 pl-3.5 text-left",
                            active ? "border-[1.5px] border-primary" : "border border-line hover:border-line-strong",
                          )}
                        >
                          <span className="relative flex size-9 shrink-0 items-center justify-center">
                            {smoke.variant === "circle" ? (
                              <SmokeMarkerIcon />
                            ) : (
                              <img src={agentIconPath(smoke.agentId)} alt="" className="size-9 rounded-full bg-elevated object-cover" />
                            )}
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="truncate text-14 font-semibold">{smoke.title}</span>
                            <span className="truncate text-12 text-sub">{smokeMeta(smoke)}</span>
                          </span>
                          <span className="hidden text-12 font-medium whitespace-nowrap text-caution sm:inline">예시 · 패치 검증 필요</span>
                        </button>
                      </li>
                      {active && (
                        <li>
                          <SmokeDetail smoke={smoke} />
                        </li>
                      )}
                    </Fragment>
                  );
                })}
              </ul>
            )}
            {!selected && visible.length > 0 && (
              <p className="rounded-thumb border border-dashed border-line px-4 py-5 text-center text-13 text-sub">
                지도 위 연막 아이콘이나 목록을 선택하면 투척 경로와 설치 방법을 볼 수 있어요.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
