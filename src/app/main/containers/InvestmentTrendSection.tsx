import InvestmentTrendChart from '@/components/InvestmentTrendChart';
import {
  FALLBACK_TREND_POINTS,
  fetchInvestmentTrendPoints,
  type InvestmentTrendPoint,
} from '@/api/api';
import Capital from './Capital';

export default async function InvestmentTrendSection() {
  const points = await loadInvestmentTrend();

  return (
    <section className="flex flex-col  w-full justify-center " aria-label="실시간 투자 추이">
    <Capital />
      <InvestmentTrendChart points={points} />
    </section>
  );
}

async function loadInvestmentTrend(): Promise<InvestmentTrendPoint[]> {
  try {
    const points = await fetchInvestmentTrendPoints();
    if (points.length) {
      return points;
    }
  } catch (error) {
    console.error('[InvestmentTrendSection] 그래프 데이터 로딩 실패', error);
  }

  return FALLBACK_TREND_POINTS;
}

