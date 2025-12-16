import posthog from 'posthog-js';

let posthogInitialized = false;

export const initPostHog = () => {
  if (typeof window === 'undefined' || posthogInitialized) {
    return;
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!posthogKey) {
    return;
  }

  try {
    const rootDomain = window.location.hostname.split('.').slice(-2).join('.');
    const currentOrigin = window.location.origin;

    // localStorage 접근 가능 여부 확인
    let persistenceMode: 'localStorage+cookie' | 'cookie' | 'memory' = 'localStorage+cookie';
    try {
      localStorage.setItem('__storage_test__', '1');
      localStorage.removeItem('__storage_test__');
    } catch {
      // localStorage 접근 불가 시 cookie만 사용
      persistenceMode = 'cookie';
    }

    posthog.init(posthogKey, {
      api_host: posthogHost,
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      cross_subdomain_cookie: true,
      persistence: persistenceMode,
      ui_host: currentOrigin,
      session_recording: {
        recordCrossOriginIframes: false,
      },
      capture_performance: true,
      request_batching: true,
      loaded: (posthog) => {
        try {
          posthog.register({
            page_type: 'invest_system',
            site_version: '1.0',
            timestamp: new Date().toISOString(),
          });
        } catch {
        }
      },
    });

    posthogInitialized = true;
  } catch {
  }
};

export const isPostHogReady = (): boolean => {
  if (typeof window === 'undefined') return false;
  return posthog && typeof posthog.capture === 'function' && (!!posthog.__loaded || posthog.has_opted_in_capturing !== undefined);
};

export const getCommonProperties = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';

  return {
    page_url: url.toString(),
    page_path: window.location.pathname,
    referrer: document.referrer ? new URL(document.referrer).origin : 'direct',
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
    timestamp: new Date().toISOString(),
  };
};

export const captureEvent = (eventName: string, properties?: Record<string, string | number | boolean | null>) => {
  if (!isPostHogReady()) {
    return;
  }

  posthog.capture(eventName, {
    ...getCommonProperties(),
    ...properties,
  });
};

/**
 * PostHog 사용자 식별 함수
 * 로그인/회원가입 성공 시 호출하여 사용자를 식별합니다.
 * 랜딩 페이지에서 생성된 익명 ID를 식별된 사용자 ID로 연결합니다.
 * @param userId - 사용자 고유 ID (데이터베이스 user_id)
 * @param properties - 사용자 속성 (이름, 이메일, 학번 등)
 */
export const identifyUser = (
  userId: string | number,
  properties?: {
    name?: string;
    nickname?: string;
    email?: string;
    schoolNumber?: number;
    department?: string;
    [key: string]: string | number | boolean | null | undefined;
  }
) => {
  if (!isPostHogReady()) {
    return;
  }

  try {
    const userIdString = String(userId);
    const anonymousId = posthog.get_distinct_id();
    
    if (anonymousId && anonymousId !== userIdString) {
      try {
        posthog.alias(userIdString, anonymousId);
      } catch (aliasError) {
        // Alias 실패 시 무시
      }
    }
    
    const identifyProperties = {
      ...(properties?.name && { name: properties.name }),
      ...(properties?.nickname && { nickname: properties.nickname }),
      ...(properties?.email && { email: properties.email }),
      ...(properties?.schoolNumber && { schoolNumber: properties.schoolNumber }),
      ...(properties?.department && { department: properties.department }),
      ...Object.fromEntries(
        Object.entries(properties || {}).filter(([key]) => 
          !['name', 'nickname', 'email', 'schoolNumber', 'department'].includes(key)
        )
      ),
    };
    
    posthog.identify(userIdString, identifyProperties);
  } catch (error) {
    // Identify 실패 시 무시
  }
};

export { posthog };

