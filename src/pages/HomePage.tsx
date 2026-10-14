import { FavoritesAndLogin } from "@/features/home/FavoritesAndLogin";
import { HomeHero } from "@/features/home/HomeHero";
import { MapsAndLeaderboard } from "@/features/home/MapsAndLeaderboard";
import { PatchNoteBanner } from "@/features/home/PatchNoteBanner";
import { TopAgents } from "@/features/home/TopAgents";

/** 01 메인 홈(Figma 53:2). 섹션 간격 32 (사용자 지정, 세 화면 통일). */
export function HomePage() {
  return (
    <div className="container-page flex flex-col gap-8 pt-6 pb-20 md:pt-8">
      <HomeHero />
      <FavoritesAndLogin />
      <TopAgents />
      <MapsAndLeaderboard />
      <PatchNoteBanner />
    </div>
  );
}
