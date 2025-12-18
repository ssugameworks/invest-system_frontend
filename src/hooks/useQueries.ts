'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyInfo,
  getMyPortfolio,
  getTeams,
  getTeam,
  getTeamInvestment,
  getTeamPriceHistory,
  getOngoingTeam,
  getCurrentSlide,
  invest,
  sell,
} from '@/lib/api';
import type { Team, UserResponse, PortfolioSummary, TeamInvestmentInfo, InvestRequest } from '@/lib/api/types';
import type { PriceHistory } from '@/lib/api/teams';

// Query Keys - 일관성을 위해 상수로 관리
export const queryKeys = {
  user: ['user'] as const,
  portfolio: ['portfolio'] as const,
  teams: ['teams'] as const,
  team: (id: number) => ['team', id] as const,
  teamInvestment: (id: number) => ['teamInvestment', id] as const,
  teamPriceHistory: (id: number) => ['teamPriceHistory', id] as const,
  ongoingTeam: ['ongoingTeam'] as const,
  currentSlide: (teamId: number) => ['currentSlide', teamId] as const,
};

// 사용자 정보 조회
export function useUser() {
  return useQuery<UserResponse>({
    queryKey: queryKeys.user,
    queryFn: getMyInfo,
    staleTime: 30 * 1000, // 30초 동안 fresh
    gcTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
    retry: 1,
  });
}

// 포트폴리오 조회
export function usePortfolio() {
  return useQuery<PortfolioSummary>({
    queryKey: queryKeys.portfolio,
    queryFn: getMyPortfolio,
    staleTime: 10 * 1000, // 10초 동안 fresh
    gcTime: 2 * 60 * 1000, // 2분 동안 캐시 유지
    retry: 1,
  });
}

// 전체 팀 목록 조회
export function useTeams() {
  return useQuery<Team[]>({
    queryKey: queryKeys.teams,
    queryFn: getTeams,
    staleTime: 15 * 1000, // 15초 동안 fresh
    gcTime: 3 * 60 * 1000, // 3분 동안 캐시 유지
    retry: 1,
  });
}

// 특정 팀 정보 조회
export function useTeam(teamId: number, enabled = true) {
  return useQuery<Team>({
    queryKey: queryKeys.team(teamId),
    queryFn: () => getTeam(teamId),
    staleTime: 5 * 1000, // 5초 동안 fresh
    gcTime: 2 * 60 * 1000,
    retry: 1,
    enabled: enabled && !isNaN(teamId),
  });
}

// 팀 투자 정보 조회
export function useTeamInvestment(teamId: number, enabled = true) {
  return useQuery<TeamInvestmentInfo | null>({
    queryKey: queryKeys.teamInvestment(teamId),
    queryFn: () => getTeamInvestment(teamId).catch(() => null),
    staleTime: 5 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 1,
    enabled: enabled && !isNaN(teamId),
  });
}

// 팀 가격 히스토리 조회
export function useTeamPriceHistory(teamId: number, enabled = true) {
  return useQuery<PriceHistory[]>({
    queryKey: queryKeys.teamPriceHistory(teamId),
    queryFn: () => getTeamPriceHistory(teamId),
    staleTime: 3 * 1000, // 3초 동안 fresh
    gcTime: 60 * 1000,
    retry: 1,
    enabled: enabled && !isNaN(teamId),
  });
}

// 현재 발표 중인 팀 조회 (자동 폴링 지원)
export function useOngoingTeam(refetchInterval: number | false = false) {
  return useQuery<Team | null>({
    queryKey: queryKeys.ongoingTeam,
    queryFn: () => getOngoingTeam().catch(() => null),
    staleTime: 2 * 1000,
    gcTime: 30 * 1000,
    retry: 1,
    refetchInterval,
    refetchIntervalInBackground: false, // 백그라운드에서는 폴링 안 함
  });
}

// 현재 슬라이드 조회 (자동 폴링 지원)
export function useCurrentSlide(teamId: number | null, refetchInterval: number | false = false) {
  return useQuery<{ currentSlide: number }>({
    queryKey: queryKeys.currentSlide(teamId ?? 0),
    queryFn: () => getCurrentSlide(teamId!),
    staleTime: 1 * 1000,
    gcTime: 30 * 1000,
    retry: 1,
    enabled: teamId !== null && teamId > 0,
    refetchInterval,
    refetchIntervalInBackground: false,
  });
}

// 투자 실행 (매수)
export function useInvest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InvestRequest) => invest(data),
    onSuccess: (_, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
      queryClient.invalidateQueries({ queryKey: queryKeys.team(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teamInvestment(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams });
    },
  });
}

// 투자 회수 (매도)
export function useSell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InvestRequest) => sell(data),
    onSuccess: (_, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
      queryClient.invalidateQueries({ queryKey: queryKeys.team(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teamInvestment(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams });
    },
  });
}

// 메인 페이지 데이터 프리페칭
export function usePrefetchMainData() {
  const queryClient = useQueryClient();

  return {
    prefetchAll: async () => {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: queryKeys.user,
          queryFn: getMyInfo,
          staleTime: 30 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.teams,
          queryFn: getTeams,
          staleTime: 15 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.portfolio,
          queryFn: getMyPortfolio,
          staleTime: 10 * 1000,
        }),
      ]);
    },
  };
}

// 수동으로 쿼리 무효화하는 헬퍼 hook
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateTeamData: (teamId: number) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teamInvestment(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teamPriceHistory(teamId) });
    },
    invalidateUserData: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
  };
}

