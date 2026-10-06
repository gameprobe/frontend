"use client";

import { SupportPage } from "../../features/stats-shell/SupportPage";
import { branding } from "../../features/stats-shell/branding";
import { useLocale } from "../../features/stats-shell/locale";
import { serviceContact } from "../../features/stats-shell/service-notices";

// 기능 설명과 운영 정보는 확인된 데모 기준이며, 분쟁 조건 등 미확정 항목은 초안으로 유지한다.
const termsSections = [
  {
    id: "service",
    title: "서비스 정의",
    titleEn: "Definition of the service",
    items: [
      `${branding.name}는 VALORANT 전적 화면의 데모와 라인업·스모크 가이드 탐색을 제공하는 웹 서비스입니다.`,
      "전적 검색·프로필·경기 상세는 준비된 예시 데이터를 보여줍니다. 실제 Riot 전적 조회나 RSO 인증은 아직 제공하지 않습니다.",
      "라인업은 공개 자료 연결 상태에 따라 등록된 자료 또는 예시를 표시하며, 스모크 가이드는 제공된 전술 자료를 탐색하는 기능입니다. 자료 상태와 검증 여부는 각 화면의 안내를 확인하세요.",
    ],
    itemsEn: [
      `${branding.name} provides a VALORANT stats demo and tools for exploring lineup and smoke guides.`,
      "Search, profile, and match-detail screens show prepared examples. Live Riot match lookup and RSO authentication are not available yet.",
      "Lineups show published records or examples depending on the data connection. Smoke guides let you explore the provided tactical content. Check each screen’s notices for data availability and verification status.",
    ],
  },
  {
    id: "conditions",
    title: "이용 조건",
    titleEn: "Conditions of use",
    items: [
      "이용자는 관계 법령, Riot Games 정책, 본 약관 초안의 취지에 맞게 서비스를 이용해야 합니다.",
      "계정 연결 페이지의 동의·취소·철회는 합성 계정으로 진행하는 시연입니다. 실제 로그인, 공개 권한 변경, 서버 데이터 삭제를 처리하지 않습니다.",
      "향후 실제 계정 정보를 공개할 때는 RSO 연결과 공개 범위 안내·동의 절차가 필요합니다. 본인의 동의가 다른 참가자의 정보 공개 동의를 대신하지 않습니다.",
    ],
    itemsEn: [
      "Users must use the service in accordance with applicable laws, Riot Games policies, and the intent of this draft.",
      "Consent, cancellation, and withdrawal on the account connection page are demonstrations using a synthetic account. They do not perform real login, change public access permissions, or delete server data.",
      "Sharing real account information will require RSO connection and a consent flow that explains the disclosure scope. Your consent does not replace another participant’s consent to sharing their information.",
    ],
  },
  {
    id: "prohibited",
    title: "금지 행위",
    titleEn: "Prohibited activities",
    items: [
      "비공식 Riot 클라이언트 API나 승인되지 않은 방법으로 데이터를 수집하도록 서비스를 악용하는 행위",
      "서비스 장애를 유발하거나 다른 이용자의 정상적인 이용을 방해하는 행위",
      "허위 정보 입력, 자동화된 대량 요청, 보안 취약점 악용 행위",
    ],
    itemsEn: [
      "Misusing the service to collect data through unofficial Riot client APIs or other unauthorized methods",
      "Causing service disruptions or interfering with other users' normal use of the service",
      "Submitting false information, making automated bulk requests, or exploiting security vulnerabilities",
    ],
  },
  {
    id: "liability",
    title: "책임 제한",
    titleEn: "Limitation of liability",
    items: [
      "현재 제공하는 예시 데이터와 화면은 실제 전적, 랭크, 경기 결과를 보장하지 않습니다.",
      "라인업·스모크 자료는 게임 패치나 상황에 따라 달라질 수 있으며, 표시된 검증 상태가 모든 상황에서의 성공을 보장하지는 않습니다.",
      "서비스 제공자는 법률상 허용되는 범위에서 외부 플랫폼 장애, Riot API 정책 변경, 불가항력으로 인한 손해에 대한 책임을 제한할 수 있습니다.",
    ],
    itemsEn: [
      "The example data and screens currently provided do not guarantee actual match records, ranks, or match results.",
      "Lineup and smoke guidance may vary with game patches and circumstances. A displayed verification status does not guarantee success in every situation.",
      "To the extent permitted by law, the service provider may limit liability for losses caused by external platform outages, changes to Riot API policies, or force majeure.",
    ],
  },
  {
    id: "law",
    title: "준거법 및 분쟁",
    titleEn: "Governing law and disputes",
    items: [
      "준거법, 관할, 분쟁 해결 절차는 최종 약관 검토에서 정합니다.",
      "본 초안은 법률 검토 전 문서이며 분쟁 해결 기준으로 사용할 수 없습니다.",
    ],
    itemsEn: [
      "Governing law, jurisdiction, and dispute-resolution procedures will be specified in the final terms following final review.",
      "This draft has not undergone legal review and cannot be used as a basis for resolving disputes.",
    ],
  },
  {
    id: "changes",
    title: "약관 변경",
    titleEn: "Changes to the terms",
    items: [
      "서비스 기능, Riot API 정책, 법령 변경에 따라 약관이 변경될 수 있습니다.",
      "변경 공지 방식과 효력 발생 시점은 법률 검토에서 최종 확정합니다.",
    ],
    itemsEn: [
      "These terms may change in response to changes in service features, Riot API policies, or laws.",
      "The method for announcing changes and when they take effect will be finalized through legal review.",
    ],
  },
  {
    id: "contact",
    title: "문의처",
    titleEn: "Contact",
    items: [
      `${serviceContact.label.ko}: ${serviceContact.email}`,
      serviceContact.notice.ko,
      `개인 운영자: ${serviceContact.operator}`,
      serviceContact.region.ko,
    ],
    itemsEn: [
      `${serviceContact.label.en}: ${serviceContact.email}`,
      serviceContact.notice.en,
      `Individual operator: ${serviceContact.operator}`,
      serviceContact.region.en,
    ],
  },
];

export default function TermsPage() {
  const { t, copy } = useLocale();

  return (
    <SupportPage>
      <section aria-labelledby="terms-heading">
        <p className="eyebrow">{t("이용약관 초안", "Terms of service draft")}</p>
        <h1 id="terms-heading">{t("이용약관", "Terms of service")}</h1>
        <p>
          {t(
            "이 문서는 Riot Production API 신청 준비를 위한 이용약관 초안입니다.",
            "This is a draft terms of service document prepared for the Riot Production API application.",
          )}{" "}{copy.legalReview}
        </p>
      </section>

      {termsSections.map((section) => (
        <section key={section.id} aria-labelledby={`terms-${section.id}`}>
          <h2 id={`terms-${section.id}`}>{t(section.title, section.titleEn)}</h2>
          <ul>
            {t(section.items, section.itemsEn).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </SupportPage>
  );
}
