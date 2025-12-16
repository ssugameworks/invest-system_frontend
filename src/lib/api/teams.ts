import axiosInstance from '../axios';
import type { Team } from './types';

export interface PriceHistory {
  price: number;
  tickTs: string;
}

/**
 * 전체 팀 목록 조회 API
 * GET /api/teams
 */
export const getTeams = async (): Promise<Team[]> => {
  const response = await axiosInstance.get<Team[]>('/api/teams');
  return response.data;
};

/**
 * 특정 팀 정보 조회 API
 * GET /api/teams/:teamId
 */
export const getTeam = async (teamId: number): Promise<Team> => {
  const response = await axiosInstance.get<Team>(`/api/teams/${teamId}`);
  return response.data;
};

/**
 * 팀 가격 히스토리 조회 API (최근 2.5시간 또는 since 이후)
 * GET /api/teams/:teamId/price-history
 */
export const getTeamPriceHistory = async (teamId: number, since?: string): Promise<PriceHistory[]> => {
  const params = since ? { since } : {};
  const response = await axiosInstance.get<PriceHistory[]>(`/api/teams/${teamId}/price-history`, { params });
  return response.data;
};

