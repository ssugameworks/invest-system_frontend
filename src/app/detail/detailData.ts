import { FALLBACK_TREND_POINTS, type InvestmentTrendPoint } from '@/api/api';
import type { TeamMember } from './containers/MemberSpotlight';
import type { PresentationDocument } from './containers/PresentationMaterials';

export const DEFAULT_TEAM_NAME = '일식이조아';

export type TeamDetailContent = {
  name: string;
  currentPrice: number;
  changeRate: number;
  totalInvestment: number;
  refreshSeconds: number;
  members: TeamMember[];
  documents: PresentationDocument[];
  availableBudget: number;
  ownedShares: number;
  trendPoints: InvestmentTrendPoint[];
};

type TeamDetailPreset = Omit<TeamDetailContent, 'name'>;

const AVATAR_IMAGES = [
  'http://localhost:3845/assets/4c4ac2c57344696890fcb285541151278657cd39.png',
  'http://localhost:3845/assets/e7081910be6a9f45db2f8082138f7ae044b638c8.png',
  'http://localhost:3845/assets/dcf534a53a49035b3bfb23403a5cc24c4e438325.png',
];

const MEMBER_BLUEPRINT = [
  { role: '리드', department: '글로벌미디어학부' },
  { role: '디자이너', department: '디지털콘텐츠학부' },
  { role: '엔지니어', department: '소프트웨어학부' },
];

const DEFAULT_DOCUMENTS: PresentationDocument[] = [
  { id: 101, title: '비즈니스 모델', description: '핵심 전략 정리' },
  { id: 102, title: '재무 계획', description: '분기별 추정 손익' },
  { id: 103, title: '팀 소개', description: '조직 구조 & 역할' },
];

const FALLBACK_PRESET: TeamDetailPreset = {
  currentPrice: 1100,
  changeRate: 3.2,
  totalInvestment: 15_000_000,
  refreshSeconds: 10,
  members: createMembers(DEFAULT_TEAM_NAME),
  documents: DEFAULT_DOCUMENTS,
  availableBudget: 45_000,
  ownedShares: 24,
  trendPoints: FALLBACK_TREND_POINTS,
};

const TEAM_DETAIL_PRESETS: Record<string, TeamDetailPreset> = {
  [DEFAULT_TEAM_NAME]: {
    currentPrice: 1200,
    changeRate: 12,
    totalInvestment: 23_450_000,
    refreshSeconds: 8,
    members: [
      { id: 1, name: '편유나', department: '글로벌미디어학부', avatar: AVATAR_IMAGES[0] },
      { id: 2, name: '김민규', department: '글로벌미디어학부', avatar: AVATAR_IMAGES[1] },
      { id: 3, name: '이서준', department: '글로벌미디어학부', avatar: AVATAR_IMAGES[2] },
    ],
    documents: DEFAULT_DOCUMENTS,
    availableBudget: 50_000,
    ownedShares: 32,
    trendPoints: FALLBACK_TREND_POINTS,
  },
  TIO: {
    currentPrice: 980,
    changeRate: -4.5,
    totalInvestment: 18_000_000,
    refreshSeconds: 12,
    members: createMembers('TIO'),
    documents: createDocuments('TIO'),
    availableBudget: 38_000,
    ownedShares: 18,
    trendPoints: createTrendPoints(-12, 1.1),
  },
  'Game Studio': {
    currentPrice: 1420,
    changeRate: 6.8,
    totalInvestment: 26_800_000,
    refreshSeconds: 15,
    members: createMembers('Game Studio'),
    documents: createDocuments('Game Studio'),
    availableBudget: 70_000,
    ownedShares: 45,
    trendPoints: createTrendPoints(5, 1.2),
  },
  'Design Team': {
    currentPrice: 890,
    changeRate: 2.7,
    totalInvestment: 12_300_000,
    refreshSeconds: 20,
    members: createMembers('Design Team'),
    documents: createDocuments('Design Team'),
    availableBudget: 28_000,
    ownedShares: 12,
    trendPoints: createTrendPoints(-4, 0.95),
  },
  'Indie Lab': {
    currentPrice: 1010,
    changeRate: -1.2,
    totalInvestment: 15_800_000,
    refreshSeconds: 18,
    members: createMembers('Indie Lab'),
    documents: createDocuments('Indie Lab'),
    availableBudget: 33_000,
    ownedShares: 20,
    trendPoints: createTrendPoints(-8, 1.05),
  },
};

export function getTeamDetail(teamParam?: string): TeamDetailContent {
  const decodedName = decodeTeamParam(teamParam);
  const preset = TEAM_DETAIL_PRESETS[decodedName];

  if (preset) {
    return {
      name: decodedName,
      ...preset,
    };
  }

  return {
    name: decodedName,
    ...FALLBACK_PRESET,
    members: createMembers(decodedName),
    documents: createDocuments(decodedName),
  };
}

export function getKnownTeamParams() {
  return Object.keys(TEAM_DETAIL_PRESETS).map(team => ({ team }));
}

function decodeTeamParam(param?: string): string {
  if (!param) {
    return DEFAULT_TEAM_NAME;
  }

  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}

function createMembers(teamName: string): TeamMember[] {
  return MEMBER_BLUEPRINT.map((blueprint, index) => ({
    id: index + 1,
    name: `${teamName} ${blueprint.role}`,
    department: blueprint.department,
    avatar: AVATAR_IMAGES[index % AVATAR_IMAGES.length],
  }));
}

function createDocuments(teamName: string): PresentationDocument[] {
  return [
    { id: 201, title: `${teamName} 소개`, description: '프로젝트 핵심 아젠다' },
    { id: 202, title: '시장 분석', description: 'Target & TAM 정리' },
    { id: 203, title: '로드맵', description: '향후 3개월 계획' },
  ];
}

function createTrendPoints(offset = 0, scale = 1): InvestmentTrendPoint[] {
  return FALLBACK_TREND_POINTS.map(point => ({
    label: point.label,
    value: Math.max(5, Math.round(point.value * scale + offset)),
  }));
}

