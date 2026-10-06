"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "../features/stats-shell/locale";

export function HomeSearch() {
  const { t, copy } = useLocale();
  const router = useRouter();
  const [riotId, setRiotId] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/players/ied-agent-allen");
  }

  return (
    <section className="search-panel" aria-labelledby="home-search-heading">
      <h2 id="home-search-heading">{t("기존 디자인 데모 미리보기", "Original design demo preview")}</h2>
      <form className="search-form" onSubmit={handleSubmit}>
        <label htmlFor="riot-id">Riot ID</label>
        <div className="search-row">
          <input
            id="riot-id"
            name="riotId"
            placeholder="IED agent#Allen"
            aria-describedby="demo-search-note"
            value={riotId}
            onChange={(event) => setRiotId(event.target.value)}
          />
          <button type="submit">{t("데모 보기", "View demo")}</button>
        </div>
      </form>
      <p id="demo-search-note">{copy.searchUnavailable} {t("입력값과 관계없이 기존 디자인 데모로 이동합니다.", "Any input opens the original design demo.")}</p>
    </section>
  );
}
