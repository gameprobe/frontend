import type { WeaponKillBreakdown } from "../types/match";

interface WeaponDistributionProps {
  weapons: WeaponKillBreakdown[];
}

export function WeaponDistribution({ weapons }: WeaponDistributionProps) {
  const sortedWeapons = [...weapons]
    .filter((weapon) => weapon.kills > 0)
    .sort((left, right) => right.kills - left.kills);
  const totalKills = sortedWeapons.reduce((sum, weapon) => sum + weapon.kills, 0);

  return (
    <section className="weapon-distribution-card" aria-label="무기별 킬 분포">
      <div className="performance-widget-head">
        <div>
          <span className="match-tab-section-label">Weapon usage</span>
          <h4>무기 킬 분포</h4>
        </div>
        <strong>{totalKills} KILLS</strong>
      </div>

      {sortedWeapons.length > 0 ? (
        <>
          <div className="weapon-stack-bar" aria-hidden="true">
            {sortedWeapons.map((weapon, index) => (
              <span
                className={`weapon-stack-segment weapon-stack-${(index % 4) + 1}`}
                key={weapon.weaponId}
                style={{ width: `${(weapon.kills / totalKills) * 100}%` }}
              />
            ))}
          </div>
          <ol className="weapon-distribution-list">
            {sortedWeapons.map((weapon, index) => {
              const percentage = totalKills > 0
                ? Math.round((weapon.kills / totalKills) * 100)
                : 0;

              return (
                <li key={weapon.weaponId}>
                  <span className="weapon-rank">{index + 1}</span>
                  <span className="weapon-name">
                    <strong>{weapon.displayName}</strong>
                    <small>{percentage}% of kills</small>
                  </span>
                  <span className="weapon-bar-track">
                    <i style={{ width: `${percentage}%` }} />
                  </span>
                  <strong className="weapon-kills">{weapon.kills}</strong>
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        <p className="performance-empty">무기 기록 없음(Mock)</p>
      )}
    </section>
  );
}
