/**
 * 함수 실행을 지연시키는 debounce 유틸리티
 * @param func - 지연 실행할 함수
 * @param wait - 대기 시간 (ms)
 * @returns debounced 함수
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
