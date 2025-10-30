import { Comment } from '@/types/bottomSheet';

export interface TeamDetail {
  id: string;
  title: string;
  members: string;
  totalInvestment: number;
  pdfUrls: string[];
  comments: Comment[];
}

export const sampleTeams: TeamDetail[] = [
  {
    id: '1',
    title: '일식이 조아',
    members: '정제훈, 김용기, 최효우',
    totalInvestment: 150000,
    pdfUrls: [],
    comments: [
      { id: '1', nickname: '투자왕', studentId: '202418XX', content: '일식 좋아하시는군요!' },
      { id: '2', nickname: '맛집러버', studentId: '202419XX', content: '이거 괜찮을듯' },
    ],
  },
  {
    id: '2',
    title: 'TIO',
    members: '편유나, 김민규',
    totalInvestment: 180000,
    pdfUrls: [],
    comments: [
      { id: '1', nickname: '테크러버', studentId: '202420XX', content: 'TIO 화이팅!' },
      { id: '2', nickname: '개발자', studentId: '202421XX', content: '기대됩니다' },
    ],
  },
  {
    id: '3',
    title: 'TIO',
    members: '정제훈, 김용기, 최효우',
    totalInvestment: 100000,
    pdfUrls: [],
    comments: [
      { id: '1', nickname: '스타트업', studentId: '202422XX', content: '좋은 아이디어네요' },
    ],
  },
  {
    id: '4',
    title: 'Game Studio',
    members: '김철수, 이영희',
    totalInvestment: 120000,
    pdfUrls: [],
    comments: [
      { id: '1', nickname: '게이머', studentId: '202423XX', content: '게임 개발 응원합니다' },
    ],
  },
  {
    id: '5',
    title: 'Design Team',
    members: '박민수, 최지은, 홍길동',
    totalInvestment: 250000,
    pdfUrls: [],
    comments: [
      { id: '1', nickname: '디자이너', studentId: '20242424', content: '디자인팀 최고!' },
      { id: '2', nickname: 'UI러버', studentId: '20242524', content: '멋져요' },
    ],
  },
];
