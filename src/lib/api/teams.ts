import axiosInstance from '../axios';
import type { Team } from './types';

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

