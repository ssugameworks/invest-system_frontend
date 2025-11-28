import Header from '@/components/Header';
import Capital from './containers/Capital';
import InvestmentTrendSection from './containers/InvestmentTrendSection';
import Carousel from '@/components/Carousel';
import { sampleCards } from '@/constants/carouselSampleCards';
import LiveChatPreview from './containers/LiveChatPreview';

export default function MainPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background-card px-3">
      <Header className="absolute left-4 top-6" />
      <div className="flex flex-col gap-4 justify-center items-center w-full">
        <InvestmentTrendSection />
        <Carousel cards={sampleCards} />
        <LiveChatPreview />

      </div>
    
    </div>
  );
}
