"use client";

import { SupportPage } from "../../features/stats-shell/SupportPage";
import { useLocale } from "../../features/stats-shell/locale";
import { serviceContact } from "../../features/stats-shell/service-notices";

// 확정된 운영 정보와 현재 데모 동작을 반영한다. 미정인 보관 기간은 임의로 채우지 않는다.
const privacySections = [
  {
    id: "collected-items",
    title: "현재 데모에서 사용하는 정보",
    titleEn: "Information used by the current demo",
    items: [
      "전적 화면은 미리 준비한 예시 데이터를 사용합니다. 입력한 Riot ID로 실제 계정이나 전적을 조회하지 않으며, Riot 비밀번호를 입력받지 않습니다.",
      "계정 연결 페이지는 합성 계정으로 공개 동의·취소·철회를 체험하는 화면입니다. 실제 Riot 로그인, 인증 토큰 발급, 계정 연결은 수행하지 않습니다.",
    ],
    itemsEn: [
      "Stats screens use prepared example data. Entering a Riot ID does not look up a real account or match history, and we do not ask for Riot passwords.",
      "The account connection page uses a synthetic account to demonstrate sharing consent, cancellation, and withdrawal. It does not perform Riot login, issue authentication tokens, or connect an account.",
    ],
  },
  {
    id: "purpose",
    title: "이용 목적",
    titleEn: "Purpose of use",
    items: [
      "예시 프로필·최근 경기·경기 상세를 통해 서비스 이용 흐름을 보여줍니다.",
      "언어 선택과 프로필 저장 여부는 같은 브라우저에서 이용 편의를 유지하는 데 사용합니다.",
      "라인업·스모크 가이드는 개인 Riot 계정 연결과 별도로 탐색할 수 있습니다.",
    ],
    itemsEn: [
      "Example profiles, recent matches, and match details demonstrate how the service works.",
      "Language preferences and saved-profile selections retain your choices in the same browser.",
      "Lineup and smoke guides can be explored independently of a personal Riot account connection.",
    ],
  },
  {
    id: "browser-storage",
    title: "브라우저에 저장하는 설정",
    titleEn: "Settings saved in your browser",
    items: [
      "선택한 언어와 프로필별 저장 여부를 이 브라우저의 사이트 저장소에 남깁니다. 프로필 저장은 전적 전체를 내려받거나 서버에 계정을 등록하는 기능이 아닙니다.",
      "프로필 저장을 해제하면 저장하지 않음 상태로 바뀝니다. 설정 자체를 지우려면 브라우저 설정에서 이 사이트의 데이터를 삭제할 수 있습니다. 별도의 자동 만료 기간은 설정되어 있지 않습니다.",
      "계정 연결 체험의 동의 상태는 브라우저 저장소에 기록하지 않습니다. 새로고침, 페이지 이탈 또는 처음부터 다시 보기로 초기화됩니다.",
    ],
    itemsEn: [
      "Your language and saved-profile choices are kept in this browser’s site storage. Saving a profile does not download its full match history or register an account on a server.",
      "Removing a saved profile marks it as not saved. You can remove the stored settings by clearing this site’s data in your browser. No automatic expiry period is configured.",
      "Consent in the account connection demo is not written to browser storage. It resets on refresh, leaving the page, or restarting the demo.",
    ],
  },
  {
    id: "sharing",
    title: "전적 공개와 계정 연결",
    titleEn: "Sharing stats and connecting an account",
    items: [
      "현재 공개된 두 데모와 경기 상세는 준비된 표본 화면입니다. 연결 체험에서 동의를 철회해도 다른 데모 화면은 그대로 제공됩니다.",
      "향후 실제 전적을 제공할 때는 RSO로 본인 계정을 확인하고, Riot ID·전적 통계 등 다른 이용자에게 공개할 범위를 설명한 뒤 동의를 받는 흐름으로 연결할 예정입니다.",
      "본인의 동의가 다른 참가자의 동의를 대신하지 않습니다. 서비스에서 공개에 동의하지 않은 플레이어의 정보를 다른 이용자에게 표시하지 않도록 실제 서버 처리가 필요합니다.",
    ],
    itemsEn: [
      "The two public demos and their match details are prepared examples. Withdrawing consent in the connection demo leaves those separate demo screens available.",
      "Before providing real stats, we plan to verify the account through RSO and obtain consent after explaining which information, such as the Riot ID and match statistics, will be visible to other users.",
      "Your consent does not cover other participants. Live server controls are still needed to prevent showing other users information about players who have not opted into sharing on this service.",
    ],
  },
  {
    id: "retention",
    title: "보관 및 파기",
    titleEn: "Retention and deletion",
    items: [
      "현재 연결 체험에서 취소·철회를 누르면 이 화면의 합성 프로필 요약이 숨겨집니다. 실제 계정 연결 해제나 서버 데이터 삭제를 수행하는 것은 아닙니다.",
      "실제 서비스의 계정 연결 해제, 공개 중단, 저장 데이터 삭제는 구분해서 안내해야 합니다. 실제 Riot 데이터의 보관 기간·삭제 절차는 아직 확정되지 않았으며, 수집을 시작하기 전에 정책과 기능을 함께 보완합니다.",
    ],
    itemsEn: [
      "Cancelling or withdrawing consent in the current demo hides its synthetic profile summary. It does not disconnect a real account or delete server data.",
      "Disconnecting an account, stopping public sharing, and deleting stored data must be explained separately for the live service. Retention periods and deletion procedures for real Riot data are not yet confirmed; the policy and functionality must be updated before collection starts.",
    ],
  },
  {
    id: "third-party",
    title: "접속 기록과 외부 서비스",
    titleEn: "Access records and external services",
    items: [
      "실제 Riot 전적을 조회하지 않는다는 설명이 모든 접속 기록이나 외부 서비스의 정보 처리가 없다는 뜻은 아닙니다.",
      "공개 웹사이트는 Vercel에서 제공합니다. 페이지를 요청하면 호스팅 서비스가 요청을 처리하며, 요청 경로·응답 상태·시각 등의 운영 기록이 발생할 수 있습니다. 예시 전적에 실제 개인정보가 없더라도 호스팅 처리는 별개입니다.",
      "2026년 9월 29일 확인 기준 Vercel Hobby 플랜을 사용합니다. Web Analytics는 비활성화되어 있으며 외부 로그 전달(Drains)은 등록되어 있지 않습니다. Speed Insights는 설치 안내 단계이며 수집된 이벤트가 없습니다. 접속 시각·요청 경로·응답 상태는 Vercel 로그 화면에 기록됩니다.",
      "현재 Hobby 플랜의 런타임 로그 조회 범위는 Vercel 공식 문서 기준 1시간입니다. 이는 보안 기록이나 백업을 포함한 모든 플랫폼 정보가 1시간 후 삭제된다는 뜻은 아닙니다. Vercel의 보안 기록과 백업은 제공자의 별도 보관·삭제 절차를 따릅니다.",
      "외부 영상이나 링크를 열면 해당 제공자의 서비스로 이동할 수 있으며, 그 제공자의 개인정보 안내도 적용될 수 있습니다.",
    ],
    itemsEn: [
      "Not looking up real Riot stats does not mean that all access logging or processing by external services is absent.",
      "The public website is hosted on Vercel. The hosting service processes page requests and may generate operational records such as request paths, response status and timestamps. Hosting processing is separate from the prepared example match data.",
      "As verified on September 29, 2026, this project uses the Vercel Hobby plan. Web Analytics is disabled and no external Drains are configured. Speed Insights shows setup instructions and no collected events. Vercel logs record request times, paths and response status.",
      "Vercel documents a one-hour runtime-log window for the current Hobby plan. This does not mean all platform information, including security records and backups, is deleted after one hour. Vercel security records and backups follow the provider’s separate retention and deletion procedures.",
      "Opening external videos or links may take you to another provider’s service, where that provider’s privacy information may also apply.",
    ],
  },
  {
    id: "overseas-processing",
    title: "외부 서비스와 국외 처리",
    titleEn: "External services and overseas processing",
    items: [
      "Vercel Inc.는 웹사이트 제공과 운영·보안을 위해 방문 시 네트워크를 통해 전달되는 IP 주소, 요청 경로, 접속 시각, 브라우저·기기 관련 정보 등을 처리할 수 있습니다. Vercel 개인정보 안내는 미국 및 기타 운영 국가의 처리를 명시합니다. 문의: privacy@vercel.com.",
      "Google LLC 및 계열사의 Gmail은 문의 메일의 수신·저장·답변에 사용합니다. 메일을 보낼 때 발신자 이메일·표시 이름·본문·첨부파일이 네트워크를 통해 전달됩니다. Google은 전 세계 서버에서 거주 국가 밖의 정보를 처리할 수 있다고 안내하며, 이 개인 Gmail 문의함에 한국 내 저장만 보장하는 설정은 확인되지 않았습니다.",
      "문의 해결 후 30일 이내 삭제 기준은 운영자가 관리하는 메일·휴지통·다운로드 사본에 적용합니다. Google 서버·백업의 삭제 완료 시점까지 같은 기간을 보장하지 않습니다. Google은 일반적인 삭제 절차에 약 2개월, 암호화된 백업에 최대 6개월이 걸릴 수 있으며 예외적으로 지연될 수 있다고 안내합니다.",
      "사이트 제공과 이메일 문의에는 위 외부 서비스 처리가 수반됩니다. 이메일 문의는 선택 사항이며 보내지 않아도 예시 화면을 볼 수 있습니다. 국외 처리 관련 문의나 처리 중지 요청은 아래 문의처로 보내주세요. 요청 범위에 따라 사이트 제공 또는 이메일 답변이 제한될 수 있습니다.",
      "제공자 공식 자료만으로 이 서비스에 적용되는 모든 처리 국가와 개별 기록의 파기일을 확정할 수는 없습니다. 해당 세부사항과 국내 법령상 국외 이전 요건 검토는 남아 있으며, 이 안내는 법률 검토 완료를 의미하지 않습니다.",
    ],
    itemsEn: [
      "Vercel Inc. may process IP addresses, request paths, access times, and browser or device information transmitted over the network when you visit, to host, operate and secure the website. Its privacy notice describes processing in the United States and other countries where it operates. Contact: privacy@vercel.com.",
      "Gmail, provided by Google LLC and its affiliates, is used to receive, store and answer inquiries. Sending an email transmits your sender address, display name, message and attachments over the network. Google describes processing on global servers outside your country of residence. Storage exclusively in Korea has not been confirmed for this personal Gmail mailbox.",
      "The 30-day deletion deadline after resolution applies to messages, Trash and downloaded copies managed by the operator. It does not guarantee the same deadline for deletion from Google servers or backups. Google describes a typical deletion process of about two months, with encrypted backups retained for up to six months and possible exceptional delays.",
      "Website delivery and email inquiries involve the external processing described above. Email inquiries are optional; you can view the examples without sending one. Contact the operator below with questions or requests to restrict overseas processing. Depending on the request, website delivery or email replies may be limited.",
      "Provider publications do not establish every processing country or the deletion date of each record for this service. These details and the applicable Korean requirements for overseas transfers remain under review. This notice does not represent completed legal review.",
    ],
  },
  {
    id: "user-rights",
    title: "이용자 권리",
    titleEn: "User rights",
    items: [
      "브라우저에 남은 언어·프로필 저장 설정은 이 사이트의 브라우저 데이터를 삭제해 지울 수 있습니다. 연결 체험은 취소·철회 또는 처음부터 다시 보기로 종료하거나 초기화할 수 있습니다.",
      `개인정보의 열람·정정·삭제·처리 중지 관련 문의는 ${serviceContact.email}로 보낼 수 있습니다. 담당자는 ShinJungho입니다. 현재 데모에는 실제 Riot 계정 데이터가 저장되지 않습니다.`,
      "요청 제목에 원하는 처리(열람·정정·삭제·처리 중지)를 적고 대상 문의의 제목·발송일 등 식별에 필요한 최소한의 내용을 보내주세요. 비밀번호나 신분증 사본을 보내지 마세요.",
    ],
    itemsEn: [
      "You can remove language and saved-profile settings by clearing this site’s browser data. Cancel, withdraw consent, or restart to exit or reset the connection demo.",
      `Send requests about access, correction, deletion, or restriction of processing to ${serviceContact.email}. ShinJungho handles these inquiries. The current demo does not store real Riot account data.`,
      "State the requested action (access, correction, deletion or restriction) in the subject and include only the details needed to identify the relevant inquiry, such as its subject and sending date. Do not send passwords or copies of identity documents.",
    ],
  },
  {
    id: "email-inquiries",
    title: "이메일 문의 처리",
    titleEn: "Email inquiries",
    items: [
      "문의 이메일은 Gmail(Google)을 이용합니다. 이메일을 보내면 발신자 주소와 표시 이름, 본문 및 첨부한 정보가 문의함에 전달됩니다. 문의 확인과 답변을 위해 담당자가 이를 확인합니다.",
      "Riot 비밀번호, 인증 코드, API 키 등 비밀정보는 보내지 마세요. 문의 처리에 필요한 내용만 보내주세요.",
      "이메일 문의는 브라우저의 사이트 데이터를 지워도 Gmail 문의함에서 삭제되지 않습니다. 문의가 해결된 날부터 30일 이내 관련 메일·첨부파일을 담당자가 수동 삭제하고 Gmail 휴지통에서도 영구 삭제합니다. 별도로 내려받은 사본도 함께 삭제합니다. 법령상 보존이 필요한 경우에는 해당 근거와 기간을 별도로 안내합니다. 이 사이트에는 문의 메일 자동 삭제 기능이 없습니다.",
    ],
    itemsEn: [
      "The contact mailbox uses Gmail (Google). Sending an email delivers your sender address, display name, message and any attachments to the mailbox, where the operator reviews them to handle and answer the inquiry.",
      "Do not send Riot passwords, verification codes, API keys or other secrets. Include only what is needed to explain your inquiry.",
      "Clearing this site’s browser data does not delete an inquiry from the Gmail mailbox. Within 30 days after an inquiry is resolved, the operator manually deletes the related messages and attachments, permanently removes them from Gmail Trash, and deletes any separately downloaded copies. If retention is required by law, we will separately explain the applicable basis and period. This website does not automatically delete inquiry emails.",
    ],
  },
  {
    id: "contact",
    title: "문의처",
    titleEn: "Contact",
    items: [
      `${serviceContact.label.ko}: ${serviceContact.email}`,
      serviceContact.notice.ko,
      `개인 운영자 및 개인정보 담당자: ${serviceContact.operator}`,
      serviceContact.region.ko,
    ],
    itemsEn: [
      `${serviceContact.label.en}: ${serviceContact.email}`,
      serviceContact.notice.en,
      `Individual operator and privacy contact: ${serviceContact.operator}`,
      serviceContact.region.en,
    ],
  },
];

export default function PrivacyPage() {
  const { t, copy } = useLocale();

  return (
    <SupportPage>
      <section aria-labelledby="privacy-heading">
        <p className="eyebrow">{t("개인정보처리방침 초안", "Privacy policy draft")}</p>
        <h1 id="privacy-heading">{t("개인정보처리방침", "Privacy policy")}</h1>
        <p>
          {t(
            "이 문서는 Riot Production API 신청 준비를 위한 개인정보처리방침 초안입니다.",
            "This is a draft privacy policy prepared for the Riot Production API application.",
          )}{" "}{copy.legalReview}
        </p>
      </section>

      <section aria-labelledby="privacy-provider-policies">
        <h2 id="privacy-provider-policies">{t("외부 서비스 공식 안내", "Official provider information")}</h2>
        <ul>
          <li><a href="https://vercel.com/legal/privacy-notice">Vercel Privacy Notice</a></li>
          <li><a href="https://vercel.com/docs/logs/runtime">Vercel Runtime Logs</a></li>
          <li><a href="https://policies.google.com/privacy">Google Privacy Policy</a></li>
          <li><a href="https://policies.google.com/technologies/retention">{t("Google 데이터 보관·삭제", "Google retention and deletion")}</a></li>
        </ul>
      </section>

      {privacySections.map((section) => (
        <section key={section.id} aria-labelledby={`privacy-${section.id}`}>
          <h2 id={`privacy-${section.id}`}>{t(section.title, section.titleEn)}</h2>
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
