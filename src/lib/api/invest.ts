import axiosInstance from '../axios';
import type { InvestRequest, InvestResponse, TeamInvestmentInfo } from './types';

/**
 * 투자 실행 API (매수)
 * POST /api/invest
 * 인증 필요 (Bearer Token)
 * 
 * @param data.teamId - 투자할 팀 ID
 * @param data.amount - 투자 금액
 */
export const invest = async (data: InvestRequest): Promise<InvestResponse> => {
  const response = await axiosInstance.post<InvestResponse>('/api/invest', data);
  return response.data;
};

/**
 * 투자 회수 API (매도)
 * POST /api/sell
 * 인증 필요 (Bearer Token)
 * 
 * @param data.teamId - 매도할 팀 ID
 * @param data.amount - 매도 금액 (주식 평가액)
 */
export const sell = async (data: InvestRequest): Promise<InvestResponse> => {
  const response = await axiosInstance.post<InvestResponse>('/api/sell', data);
  return response.data;
};

/**
 * 특정 팀의 보유 주식 조회 API
 * GET /api/user/portfolio/:teamId
 * 인증 필요 (Bearer Token)
 * 
 * @param teamId - 조회할 팀 ID
 */
export const getTeamInvestment = async (teamId: number): Promise<TeamInvestmentInfo> => {
  const response = await axiosInstance.get<TeamInvestmentInfo>(`/api/user/portfolio/${teamId}`);
  return response.data;
};

