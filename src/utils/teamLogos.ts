import venLogo from '@/assets/ven_logo.png';
import didimLogo from '@/assets/didim_logo.png';
import avabLogo from '@/assets/avab_logo.png';
import tioLogo from '@/assets/tio_logo.png';
import fireantsLogo from '@/assets/fireants_logo.png';
import slowLogo from '@/assets/slow_logo.png';

export interface TeamLogoMap {
  [key: string]: string;
}

export interface TeamLogoConfig {
  logoUrl: string;
  backgroundColor: string;
}

export interface TeamLogoConfigMap {
  [key: string]: TeamLogoConfig;
}

export const TEAM_LOGOS: TeamLogoMap = {
  '벤양': venLogo.src,
  '일식이 좋아': didimLogo.src,
  '일식이좋아': didimLogo.src,
  '힙72': avabLogo.src,
  'TIO': tioLogo.src,
  '불개미': fireantsLogo.src,
  'SLOW': slowLogo.src,
};

/**
 * 팀별 로고와 배경색 설정
 */
export const TEAM_LOGO_CONFIGS: TeamLogoConfigMap = {
  '벤양': {
    logoUrl: venLogo.src,
    backgroundColor: '#5a8a8d', // 청록색
  },
  '일식이 좋아': {
    logoUrl: didimLogo.src,
    backgroundColor: '#1a1d2e', // 어두운 남색
  },
  '일식이좋아': {
    logoUrl: didimLogo.src,
    backgroundColor: '#1a1d2e', // 어두운 남색
  },
  '힙72': {
    logoUrl: avabLogo.src,
    backgroundColor: '#e8e8e8', // 밝은 회색
  },
  'TIO': {
    logoUrl: tioLogo.src,
    backgroundColor: '#1a2332', // 어두운 파란색
  },
  '불개미': {
    logoUrl: fireantsLogo.src,
    backgroundColor: '#2b1300', // 딥 오렌지 계열
  },
  'SLOW': {
    logoUrl: slowLogo.src,
    backgroundColor: '#1b1433', // 딥 퍼플 계열
  },
};

/**
 * 팀 이름에 해당하는 로고 URL을 반환합니다.
 * @param teamName 팀 이름
 * @returns 로고 URL 또는 undefined
 */
export const getTeamLogo = (teamName: string): string | undefined => {
  return TEAM_LOGOS[teamName];
};

/**
 * 팀 이름에 해당하는 로고 설정을 반환합니다.
 * @param teamName 팀 이름
 * @returns 로고 설정 (로고 URL과 배경색) 또는 undefined
 */
export const getTeamLogoConfig = (teamName: string): TeamLogoConfig | undefined => {
  return TEAM_LOGO_CONFIGS[teamName];
};

/**
 * 팀 이름에 로고가 있는지 확인합니다.
 * @param teamName 팀 이름
 * @returns 로고 존재 여부
 */
export const hasTeamLogo = (teamName: string): boolean => {
  return teamName in TEAM_LOGOS;
};

/**
 * 팀 이름과 이미지 폴더명 매핑
 */
export const TEAM_FOLDER_MAP: Record<string, string> = {
  '벤양': 'ven',
  '일식이 좋아': 'didim',
  '일식이좋아': 'didim',
  '힙72': 'avab',
  'TIO': 'tio',
  '불개미': 'fire',
};

/**
 * 팀원 이미지 경로를 생성합니다.
 * @param teamName 팀 이름
 * @param memberName 팀원 이름
 * @returns 이미지 경로 또는 undefined
 */
export const getTeamMemberImage = (teamName: string, memberName: string): string | undefined => {
  const folderName = TEAM_FOLDER_MAP[teamName];
  if (!folderName || !memberName) return undefined;
  
  // 이름을 URL 인코딩하여 파일 경로 생성
  return `/team_image/${folderName}/${encodeURIComponent(memberName)}.webp`;
};

