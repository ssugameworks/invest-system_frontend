import axiosInstance from '../axios';
import type { PriceItem } from './types';

/**
 * 전체 팀 가격 조회 API
 * GET /api/prices
 * 
 * 각 팀의 최신 가격 정보를 반환합니다.
 */
export const getPrices = async (): Promise<PriceItem[]> => {
  const response = await axiosInstance.get<PriceItem[]>('/api/prices');
  return response.data;
};

/**
 * 특정 팀의 가격 정보만 필터링
 */
export const getTeamPrice = async (teamId: number): Promise<PriceItem | undefined> => {
  const prices = await getPrices();
  return prices.find((price) => price.teamId === teamId);
};

