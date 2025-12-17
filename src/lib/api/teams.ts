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

/**
 * 현재 발표 중인 팀 조회 API
 * GET /api/teams/ongoing
 */
export const getOngoingTeam = async (): Promise<Team | null> => {
  const response = await axiosInstance.get<Team | null>('/api/teams/ongoing');
  return response.data;
};

/**
 * 팀 상태 업데이트 API (인터널용)
 * PATCH /api/teams/:teamId/status
 */
export const updateTeamStatus = async (teamId: number, status: 'upcoming' | 'ongoing' | 'ended'): Promise<Team> => {
  const response = await axiosInstance.patch<Team>(`/api/teams/${teamId}/status`, { status });
  return response.data;
};

/**
 * 현재 슬라이드 번호 조회 API
 * GET /api/teams/:teamId/current-slide
 */
export const getCurrentSlide = async (teamId: number): Promise<{ currentSlide: number }> => {
  const response = await axiosInstance.get<{ currentSlide: number }>(`/api/teams/${teamId}/current-slide`);
  return response.data;
};

/**
 * 현재 슬라이드 번호 업데이트 API (인터널용)
 * POST /api/teams/:teamId/current-slide
 */
export const updateCurrentSlide = async (teamId: number, currentSlide: number): Promise<{ currentSlide: number }> => {
  const response = await axiosInstance.post<{ currentSlide: number }>(`/api/teams/${teamId}/current-slide`, { currentSlide });
  return response.data;
};

