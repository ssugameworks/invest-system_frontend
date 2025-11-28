import { FALLBACK_CAPITAL_AMOUNT, fetchCapitalAmount } from '@/api/api';
import { formatCurrency } from '@/utils/formatters';

type CapitalProps = {
  className?: string;
};

export default async function Capital({ className = '' }: CapitalProps) {
  const amount = await loadCapitalAmount();

  return (
    <section
      className={`flex w-full flex-col items-center justify-center  text-center transform translate-y-[50px] z-100 ${className}`}
      aria-label="보유 현금"
      aria-live="polite"
      data-node-id="4377:2167"
    >
      <p
        className="font-pretendard text-lg font-medium text-text-secondary"
        data-node-id="4377:2168"
      >
        보유 현금
      </p>
      <p
        className="font-pretendard text-3xl font-bold text-white"
        data-node-id="4377:2171"
        style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
      >
        {formatCurrency(amount)}
      </p>
    </section>
  );
}

async function loadCapitalAmount(): Promise<number> {
  try {
    const amount = await fetchCapitalAmount();
    if (Number.isFinite(amount)) {
      return amount;
    }
  } catch (error) {
    console.error('[Capital] 보유 현금 데이터 로딩 실패', error);
  }

  return FALLBACK_CAPITAL_AMOUNT;
}

