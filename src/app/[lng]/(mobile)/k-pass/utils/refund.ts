export type KPassTier = 'general' | 'youth' | 'lowIncome';
export type KPassRegion = 'national' | 'gyeonggi' | 'incheon';

export const KPASS_RATE: Record<KPassTier, number> = {
  general: 0.2,
  youth: 0.3,
  lowIncome: 0.53,
};

export const KPASS_MIN_USES = 15;
export const KPASS_CAP_NATIONAL = 60;

// 환급률·한도 등 K-패스 제도 규칙을 수집·검증한 마지막 날짜.
// 제도 개정 시 이 상수와 locales/k-pass.json 본문을 함께 갱신할 것.
export const KPASS_RULES_UPDATED_AT = '2026-05-23';

export type KPassInput = {
  monthlyFare: number;
  monthlyUses: number;
  tier: KPassTier;
  region: KPassRegion;
};

export type KPassResult = {
  farePerRide: number;
  refundPerRide: number;
  effectiveUses: number;
  monthlyRefund: number;
  annualSaving: number;
  vsGeneral: number;
  eligible: boolean;
  capped: boolean;
  cap: number | null;
};

export function calculateKPassRefund(input: KPassInput): KPassResult {
  const { monthlyFare, monthlyUses, tier, region } = input;
  const farePerRide = monthlyUses > 0 ? monthlyFare / monthlyUses : 0;
  const eligible = monthlyUses >= KPASS_MIN_USES;
  const cap = region === 'national' ? KPASS_CAP_NATIONAL : null;
  const effectiveUses = cap !== null ? Math.min(monthlyUses, cap) : monthlyUses;
  const capped = cap !== null && monthlyUses > cap;
  const refundPerRide = Math.floor(farePerRide * KPASS_RATE[tier]);
  const monthlyRefund = eligible ? Math.floor(refundPerRide * effectiveUses) : 0;
  const annualSaving = monthlyRefund * 12;
  const generalMonthly = eligible
    ? Math.floor(Math.floor(farePerRide * KPASS_RATE.general) * effectiveUses)
    : 0;
  const vsGeneral = monthlyRefund - generalMonthly;

  return {
    farePerRide,
    refundPerRide,
    effectiveUses,
    monthlyRefund,
    annualSaving,
    vsGeneral,
    eligible,
    capped,
    cap,
  };
}
