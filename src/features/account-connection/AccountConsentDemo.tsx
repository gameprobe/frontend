"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef } from "react";
import { useLocale } from "../stats-shell/locale";
import { branding } from "../stats-shell/branding";
import { demoProfile } from "../tracker-profile/data/provider";
import { consentDemoReducer, initialConsentDemoState } from "./consentDemo";
import { ConsentProfilePreview } from "./ConsentProfilePreview";
import s from "./AccountConsentDemo.module.css";

/** /connect 전용 체험. 이 상태는 실제 인증/공개 권한이 아니며 페이지를 나가면 사라진다. */
export function AccountConsentDemo() {
  const { t } = useLocale();
  const [state, dispatch] = useReducer(consentDemoReducer, initialConsentDemoState);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(state.step);
  useEffect(() => {
    // 첫 진입이나 언어 변경에는 초점을 빼앗지 않고, 사용자가 바꾼 단계만 안내한다.
    if (previousStep.current !== state.step) headingRef.current?.focus();
    previousStep.current = state.step;
  }, [state.step]);

  const stepNumber = state.step === "intro" ? 0 : state.step === "consent" ? 1 : 2;
  const labels = [t("연결 안내", "Connection"), t("공개 동의", "Sharing consent"), t("프로필 체험", "Profile preview")];
  const title = state.step === "intro" ? t("연결 전에 알아두세요", "Before you connect")
    : state.step === "consent" ? t("공개되는 정보를 확인하세요", "Review what becomes public")
      : state.step === "profile" ? t("공개 프로필 미리보기", "Public profile preview")
        : state.outcome === "revoked" ? t("공개 동의를 철회한 상태", "Sharing consent withdrawn")
          : t("연결을 취소한 상태", "Connection cancelled");

  return (
    <section className={s.demo} aria-labelledby="connection-title">
      <div className={s.headingRow}>
        <div>
          <p className="eyebrow">{t("계정 연결", "Account connection")}</p>
          <h1 id="connection-title">{t("Riot 계정 연결 체험", "Try the account connection flow")}</h1>
        </div>
        <span className={s.demoBadge}>{t("데모 체험", "DEMO")}</span>
      </div>
      <p className={s.lead}>{t("공개 동의부터 프로필 확인까지, 합성 계정으로 미리 체험해 보세요.", "Explore sharing consent and a profile preview with a synthetic account.")}</p>
      <div className={s.notice}>
        <strong>{t("실제 Riot 로그인이나 데이터 공개는 이루어지지 않습니다.", "No real Riot login or data sharing takes place.")}</strong>
        <span>{t("체험 상태는 저장되지 않으며 새로고침하거나 페이지를 나가면 초기화됩니다.", "Your choices are not saved. Refreshing or leaving this page resets the demo.")}</span>
      </div>
      <ol className={s.steps} aria-label={t("계정 연결 체험 순서", "Connection demo steps")}>
        {labels.map((label, index) => (
          <li key={index} aria-current={index === stepNumber ? "step" : undefined}>
            <span aria-hidden="true">0{index + 1}</span>{label}
          </li>
        ))}
      </ol>
      <div className={s.stage}>
        <h2 ref={headingRef} tabIndex={-1}>{title}</h2>
        {state.step === "intro" && <>
          <p>{t("실제 서비스에서는 Riot 로그인으로 본인을 확인한 뒤, 공개에 동의한 계정의 기록을 보여줄 예정입니다. 지금은 준비된 데모 계정을 사용합니다.", "The planned service will use Riot login to verify your identity and show records for accounts that opt in to sharing. This preview uses a prepared demo account.")}</p>
          <div className={s.account}>
            <span className={s.accountMark} aria-hidden="true">{branding.logoText}</span>
            <div><span>{t("체험용 합성 계정", "Synthetic demo account")}</span><strong>{demoProfile.name}<small>#{demoProfile.tag}</small></strong></div>
          </div>
          <ul className={s.explainer}>
            <li>{t("공개할 정보와 공개 대상을 먼저 확인합니다.", "Review which information will be shared and who can see it.")}</li>
            <li>{t("동의하거나 취소한 뒤의 화면을 확인합니다.", "See what happens when you agree or cancel.")}</li>
            <li>{t("프로필을 본 후 동의 철회도 체험할 수 있습니다.", "Try withdrawing consent after viewing the profile.")}</li>
          </ul>
          <div className={s.actions}>
            <button className={s.primary} onClick={() => dispatch({ type: "begin" })}>{t("공개 동의 체험하기", "Try sharing consent")}</button>
            <Link className={s.secondary} href="/">{t("홈으로", "Back to home")}</Link>
          </div>
        </>}
        {state.step === "consent" && <>
          <p>{t(`계정을 연결하고 공개에 동의하면, 내 Riot ID와 전적 통계를 ${branding.name}의 다른 이용자가 볼 수 있게 됩니다. 아래는 그 과정을 보여주는 데모입니다.`, `Linking your account and opting in makes your Riot ID and match statistics visible to other ${branding.name} users. The choices below only simulate that process.`)}</p>
          <dl className={s.disclosure}>
            <div><dt>{t("대상 계정", "Account")}</dt><dd>{demoProfile.name} #{demoProfile.tag} <span>({t("합성 계정", "synthetic")})</span></dd></div>
            <div><dt>{t("공개 정보", "Shared information")}</dt><dd>{t("Riot ID, 경기 기록, 요원·맵별 전적 통계", "Riot ID, match history, and agent/map statistics")}</dd></div>
            <div><dt>{t("공개 대상", "Visible to")}</dt><dd>{t(`${branding.name}의 다른 이용자`, `Other ${branding.name} users`)}</dd></div>
          </dl>
          <p className={s.boundary}>{t("내 동의가 다른 경기 참가자의 동의를 대신하지 않습니다. 이 미리보기에는 선택한 합성 계정의 기록만 표시합니다.", "Your consent does not cover other match participants. This preview shows only the selected synthetic account’s records.")}</p>
          <div className={s.policyLinks}>
            <Link href="/privacy" target="_blank" rel="noopener noreferrer">{t("개인정보처리방침 (새 탭)", "Privacy policy (new tab)")}</Link>
            <Link href="/terms" target="_blank" rel="noopener noreferrer">{t("이용약관 (새 탭)", "Terms of service (new tab)")}</Link>
          </div>
          <label className={s.consent}>
            <input type="checkbox" checked={state.accepted} onChange={event => dispatch({ type: "accept", value: event.target.checked })} />
            <span>{t("위 공개 범위를 확인했으며, 데모 프로필 표시를 허용합니다.", "I have reviewed the sharing scope and allow the demo profile to be displayed.")}</span>
          </label>
          <div className={s.actions}>
            <button className={s.primary} disabled={!state.accepted} onClick={() => dispatch({ type: "grant" })}>{t("동의하고 데모 프로필 보기", "Agree and view demo profile")}</button>
            <button className={s.secondary} onClick={() => dispatch({ type: "cancel" })}>{t("동의하지 않고 취소", "Cancel without sharing")}</button>
          </div>
        </>}
        {state.step === "profile" && <>
          <p>{t("동의 후 다른 이용자에게 보일 프로필을 요약한 예시입니다. 아래 수치는 모두 합성 데이터입니다.", "This is a summary of how a profile could appear to other users after consent. All figures below are synthetic.")}</p>
          <ConsentProfilePreview />
          <div className={s.actions}>
            <button className={s.secondary} onClick={() => dispatch({ type: "revoke" })}>{t("공개 동의 철회 체험", "Try withdrawing consent")}</button>
            <button className={s.textButton} onClick={() => dispatch({ type: "reset" })}>{t("처음부터 다시 보기", "Restart demo")}</button>
          </div>
        </>}
        {state.step === "private" && <>
          <div className={s.privateCard}>
            <span className={s.privateBadge}>{t("비공개 · 체험", "PRIVATE · DEMO")}</span>
            <strong>{t("이 체험의 프로필을 표시하지 않습니다.", "The profile is hidden in this preview.")}</strong>
            <p>{state.outcome === "revoked"
              ? t("동의 철회 뒤의 화면입니다. 다시 프로필을 보려면 공개 범위를 확인하고 새로 동의해 주세요.", "This demonstrates the state after consent is withdrawn. Review the sharing scope and agree again to show the profile.")
              : t("공개에 동의하지 않아 프로필을 표시하지 않았습니다. 원하면 다시 체험할 수 있습니다.", "The profile was not shown because sharing was not approved. You can try the flow again whenever you like.")}</p>
          </div>
          <p className={s.boundary}>{t("실제 계정의 공개 상태나 데이터가 변경된 것은 아닙니다. 기존 디자인·새 데이터 데모는 별도의 공개 예시로 유지됩니다.", "No real account visibility or data has changed. The original design and new-data demos remain separate public examples.")}</p>
          <div className={s.actions}>
            <button className={s.primary} onClick={() => dispatch({ type: "begin" })}>{t("공개 동의 다시 체험", "Review sharing consent again")}</button>
            <button className={s.secondary} onClick={() => dispatch({ type: "reset" })}>{t("처음부터 다시 보기", "Restart demo")}</button>
          </div>
        </>}
      </div>
      <p className={s.footnote}>{t("실제 Riot 계정 연결은 API 승인과 RSO 연동 후 제공할 예정입니다.", "Real Riot account connection is planned after API approval and RSO integration.")}</p>
    </section>
  );
}
