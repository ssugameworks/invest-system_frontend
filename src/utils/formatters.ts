/**
 * 숫자 포맷팅 유틸리티 함수들
 */

/**
 * 문자열에서 숫자만 추출
 * @param value - 입력 문자열
 * @returns 숫자만 포함된 문자열
 */
export function extractNumbers(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

/**
 * 숫자를 천단위 콤마로 포맷팅
 * @param value - 숫자 문자열
 * @returns 천단위 콤마가 추가된 문자열
 */
export function formatNumberWithCommas(value: string | number): string {
  if (!value) return '';
  const stringValue = String(value);
  return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 천단위 콤마가 포함된 문자열을 숫자로 변환
 * @param value - 콤마가 포함된 숫자 문자열
 * @returns 숫자
 */
export function parseFormattedNumber(value: string): number {
  return parseInt(value.replace(/,/g, ''), 10);
}
