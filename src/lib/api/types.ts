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

export interface InvestRequest {
  teamId: number;
  amount: number;
}

export interface InvestResponse {
  amount: number;
  status: 'success' | 'error';
  message: string;
}

export interface TeamInvestmentInfo {
  team_id: number;
  team_name: string;
  shares: number;
  invested_amount: number;
  average_price: number;
  current_price: number;
  current_value: number;
  amount: number;
  profit_loss: number;
  profit_rate: number;
}

export interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  profit_loss: number;
  roi: number;
  items: TeamInvestmentInfo[];
}

export type TeamStatus = 'upcoming' | 'ongoing' | 'ended';

export interface TeamMemberInfo {
  name: string;
  major: string;
}

export interface Team {
  id: number;
  teamName: string;
  members: TeamMemberInfo[];
  status: TeamStatus;
  pitch_url: string;
  money: number | null;
  p: number | null;
  p0: number;
  p1: number | null;
  p2: number | null;
  created_at: string;
  updated_at: string;
}

export interface PriceItem {
  teamId: number;
  round: number;
  price: number;
  tickTs: string;
}

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

export interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

