/**
 * 서비스 관련 유틸리티 함수들
 * 중복 제거를 위해 공통 유틸리티로 통합
 */

const SERVICE_OPEN_DATE = new Date('2025-12-19T19:00:00+09:00');

// ⭐ 최적화: 메모이제이션을 위한 캐시
let cachedAllowedNumbers: number[] | null = null;

/**
 * 허용된 학번 목록을 반환 (메모이제이션 적용)
 */
export function getAllowedSchoolNumbers(): number[] {
  if (cachedAllowedNumbers !== null) {
    return cachedAllowedNumbers;
  }

  const envValue = process.env.NEXT_PUBLIC_ALLOWED_SCHOOL_NUMBERS;
  if (!envValue) {
    cachedAllowedNumbers = [];
    return cachedAllowedNumbers;
  }

  cachedAllowedNumbers = envValue
    .split(',')
    .map((num) => parseInt(num.trim(), 10))
    .filter((num) => !isNaN(num));

  return cachedAllowedNumbers;
}

/**
 * 서비스 오픈 여부 확인
 */
export function isServiceOpen(): boolean {
  return new Date() >= SERVICE_OPEN_DATE;
}

/**
 * 허용된 사용자인지 확인
 */
export function isAllowedUser(schoolNumber: number): boolean {
  return getAllowedSchoolNumbers().includes(schoolNumber);
}

/**
 * 캐시 초기화 (테스트용 또는 환경 변수 변경 시)
 */
export function clearAllowedSchoolNumbersCache(): void {
  cachedAllowedNumbers = null;
}

