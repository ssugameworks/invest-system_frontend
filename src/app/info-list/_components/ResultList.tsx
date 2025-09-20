import {
  RecruitmentStatus,
  getStatusText,
  getStatusColor,
} from '../_utils/recruitmentUtils';
import { StatusEllipse } from './StatusEllipse';

interface ResultListProp {
  title: string;
  recruitmentStatus: RecruitmentStatus;
  facility: string;
}

export function ResultListHeader() {
  return (
    <div className="font-pretendard flex h-[1.875rem] items-center justify-between border-b-[0.0625rem] border-[#191919] text-left text-[0.875rem] leading-[1.5625rem] font-semibold tracking-[-0.0256rem] text-black">
      <div className="flex w-[12rem] justify-center">장학금명</div>
      <div>기관명</div>
      <div>모집현황</div>
    </div>
  );
}

export function ResultList({
  title,
  recruitmentStatus,
  facility,
}: ResultListProp) {
  return (
    <div className="font-pretendard flex h-[3rem] items-center justify-between border-b-[0.03125rem] border-[#7B7B7B] text-left text-[0.875rem] leading-[1rem] font-normal tracking-[-0.0256rem] text-black">
      <div className="flex w-[12rem] justify-center">{title}</div>
      <div>{facility}</div>
      <div
        className="flex items-center gap-1 pr-[0.25rem] text-[0.75rem] leading-[1.5625rem] font-medium"
        style={{ color: getStatusColor(recruitmentStatus) }}
      >
        <StatusEllipse color={getStatusColor(recruitmentStatus)} />
        &nbsp;
        {getStatusText(recruitmentStatus)}
      </div>
    </div>
  );
}

export function ResultLists({
  title,
  recruitmentStatus,
  facility,
}: ResultListProp) {
  return (
    <div className="w-full max-w-[22.5rem]">
      <ResultListHeader />
      <ResultList
        title={title || '소득연계형 국가장학금'}
        recruitmentStatus={recruitmentStatus || 'recruiting'}
        facility={facility || '한국장학재단'}
      />
      <ResultList
        title={title || '소득연계형 국가장학금'}
        recruitmentStatus={recruitmentStatus || 'recruiting'}
        facility={facility || '한국장학재단'}
      />
    </div>
  );
}
