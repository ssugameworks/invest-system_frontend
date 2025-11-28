import StockInsight from '../containers/StockInsight';
import MemberSpotlight from '../containers/MemberSpotlight';
import PresentationMaterials from '../containers/PresentationMaterials';
import TradePanel from '../containers/TradePanel';
import { getKnownTeamParams, getTeamDetail } from '../detailData';

type TeamDetailPageProps = {
  params: {
    team: string;
  };
};

export default function TeamDetailPage({ params }: TeamDetailPageProps) {
  const detail = getTeamDetail(params.team);

  return (
    <div className="min-h-screen w-full bg-background-card pb-16">
      <div className="mx-auto flex w-full max-w-[24.5625rem] flex-col gap-5 px-5 pt-8">
        <StockInsight
          teamName={detail.name}
          currentPrice={detail.currentPrice}
          changeRate={detail.changeRate}
          totalInvestment={detail.totalInvestment}
          refreshSeconds={detail.refreshSeconds}
          trendPoints={detail.trendPoints}
        />
        <MemberSpotlight members={detail.members} />
        <PresentationMaterials documents={detail.documents} />
        <TradePanel availableBudget={detail.availableBudget} ownedShares={detail.ownedShares} />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return getKnownTeamParams();
}

