import { ResultInfo } from '@/app/info-list/_components/ResultInfo';
import { ResultLists } from '@/app/info-list/_components/ResultList';

export default function InfoListPage() {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
      <ResultInfo
        first_line="여기 내 조건에 딱 맞는"
        second_line="장학 공고 251개를 찾았어요!"
      />
      <ResultLists
        title={'소득연계형 국가장학금'}
        recruitmentStatus={'recruiting'}
        facility={'한국장학재단'}
      />
    </div>
  );
}
