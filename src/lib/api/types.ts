// ============================================
// 백엔드 API 응답 타입 정의
// ============================================

// ========== Auth API ==========
export interface SignUpRequest {
  schoolNumber: number;
  department: string;
  password: string;
  phoneNumber: string;
}

export interface SignUpResponse {
  accessToken: string;
}

export interface SignInRequest {
  schoolNumber: number;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
  userId: number;
  nickname: string;
}

// ========== User API ==========
export interface UserResponse {
  id: number;
  name: string;
  schoolNumber: number;
  department: string;
  capital: number;
  total_assets?: number;
  stock_value?: number;
  roi: number;
  rank: number;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardItem {
  name: string;
  schoolNumber: number;
  department: string;
  capital: number | null;
  roi: number | null;
  rank: number | null;
}

export interface LeaderboardParams {
  page?: number;
  pageSize?: number;
}

// ========== Invest API ==========
export interface InvestRequest {
  teamId: number;
  amount: number;
}

export interface InvestResponse {
  amount: number;
  status: 'success' | 'error';
  message: string;
}

// ========== Portfolio API ==========
export interface TeamInvestmentInfo {
  team_id: number;
  team_name: string;
  shares: number; // 보유 주식 수
  invested_amount: number; // 투자 원금
  average_price: number; // 평균 매수 단가
  current_price: number; // 현재 주가
  current_value: number; // 현재 평가액
  amount: number; // 매도 시 사용할 금액 (current_value와 동일)
  profit_loss: number; // 평가 손익
  profit_rate: number; // 수익률 (%)
}

export interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  profit_loss: number;
  roi: number;
  items: TeamInvestmentInfo[];
}

// ========== Team API ==========
export type TeamStatus = 'upcoming' | 'ongoing' | 'ended';

export interface Team {
  id: number;
  teamName: string;
  members: string[][];
  status: TeamStatus;
  pitch_url: string;
  money: number | null;
  p: number | null; // 현재 가격
  p0: number; // 초기 가격
  p1: number | null;
  p2: number | null;
  created_at: string;
  updated_at: string;
}

// ========== Price API ==========
export interface PriceItem {
  teamId: number;
  round: number;
  price: number;
  tickTs: string;
}

// ========== Comment API ==========
export interface CommentEntity {
  id: number;
  team_id: number;
  author_id: number;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface TeamCommentsResponse {
  items: CommentEntity[];
  count: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface GetTeamCommentsParams {
  teamId: number;
  limit?: number;
  cursor?: string;
  mode?: 'preview' | 'default';
}

export interface CreateCommentRequest {
  author_id: number;
  body: string;
}

// ========== Error Response ==========
export interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

