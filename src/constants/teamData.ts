import { Comment } from '@/types/bottomSheet';

/**
 * 투자 팀 상세 정보
 * API 연결 전 임시 데이터 구조
 */
export interface TeamDetail {
  id: number;
  title: string;
  members: string;
  totalInvestment: number;
  pdfUrls: string[];
  comments: Comment[];
}

export const sampleTeams: TeamDetail[] = [
  {
    id: 1,
    title: '일식이 조아',
    members: '정제훈, 김용기, 최효우',
    totalInvestment: 150000,
    pdfUrls: [],
    comments: [
      { id: 1, nickname: '멋진 댕댕이', studentId: 20241801, content: '이건 좀 괜찮은듯' },
      { id: 2, nickname: '동작구 까불이', studentId: 20241802, content: '음 좀 별론데' },
      { id: 3, nickname: '상도동 콩콩이', studentId: 20241803, content: '요호 좋은데 좋은데' },
    ],
  },
  {
    id: 2,
    title: 'TIO',
    members: '편유나, 김민규',
    totalInvestment: 180000,
    pdfUrls: [],
    comments: [
      { id: 4, nickname: '숭구리 당당', studentId: 20243201, content: '🤯' },
      { id: 5, nickname: '화난 무지', studentId: 20243202, content: '우앙' },
      { id: 6, nickname: '신림동 토끼', studentId: 20241901, content: '이거 대박일듯' },
      { id: 7, nickname: '조용한 사자', studentId: 20242001, content: '투자각이네요' },
    ],
  },
  {
    id: 3,
    title: 'TIO',
    members: '정제훈, 김용기, 최효우',
    totalInvestment: 100000,
    pdfUrls: [],
    comments: [
      { id: 8, nickname: '귀여운 햄스터', studentId: 20242101, content: '오 진짜?' },
      { id: 9, nickname: '활발한 펭귄', studentId: 20242201, content: '와 이거 좋다' },
    ],
  },
  {
    id: 4,
    title: 'Game Studio',
    members: '김철수, 이영희',
    totalInvestment: 120000,
    pdfUrls: [],
    comments: [
      { id: 10, nickname: '흑석동 판다', studentId: 20242301, content: '게임 좋아요 ㅎㅎ' },
      { id: 11, nickname: '달리는 치타', studentId: 20242401, content: '헐 대박' },
      { id: 12, nickname: '노래하는 고양이', studentId: 20242501, content: '나도 투자할래' },
    ],
  },
  {
    id: 5,
    title: 'Design Team',
    members: '박민수, 최지은, 홍길동',
    totalInvestment: 250000,
    pdfUrls: [],
    comments: [
      { id: 13, nickname: '춤추는 곰', studentId: 20242601, content: '디자인 진짜 예쁘다' },
      { id: 14, nickname: '웃긴 원숭이', studentId: 20242701, content: '😍😍' },
      { id: 15, nickname: '상도동 호랑이', studentId: 20242801, content: '이건 투자해야지' },
      { id: 16, nickname: '날아다니는 독수리', studentId: 20242901, content: 'ㄹㅇ 좋음' },
    ],
  },
];
