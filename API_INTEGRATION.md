# 백엔드 API 연동 가이드

## 🎉 완료된 작업

### 1. Axios 설정
- ✅ Axios 인스턴스 생성 (`src/lib/axios.ts`)
- ✅ JWT 토큰 자동 관리 (localStorage)
- ✅ Request/Response 인터셉터 설정
- ✅ 401 에러 시 자동 로그인 페이지 리다이렉트
- ✅ 개발 환경에서 요청/응답 로깅

### 2. API 함수 작성
다음 API 함수들이 작성되었습니다:

#### Auth API (`src/lib/api/auth.ts`)
- `signUp(data)` - 회원가입
- `logout()` - 로그아웃
- `isAuthenticated()` - 인증 상태 확인

#### User API (`src/lib/api/user.ts`)
- `getMyInfo()` - 내 정보 조회
- `getLeaderboard(params)` - 리더보드 조회

#### Invest API (`src/lib/api/invest.ts`)
- `invest(data)` - 투자 실행

#### Pricing API (`src/lib/api/pricing.ts`)
- `getPrices()` - 전체 팀 가격 조회
- `getTeamPrice(teamId)` - 특정 팀 가격 조회

#### Comments API (`src/lib/api/comments.ts`)
- `getTeamComments(params)` - 팀 댓글 조회
- `createTeamComment(teamId, data)` - 팀 댓글 작성

### 3. 컴포넌트 연동
- ✅ `/login` - 회원가입 API 연동
- ✅ `/main` - Capital 컴포넌트 (내 정보 API 사용)
- ⚠️ LiveChatPreview - 백엔드 API 추가 필요 (아래 참조)

---

## ⚠️ 확인 및 수정 필요 사항

### 1. 로그인 페이지 필드 불일치
**현재 상황:**
- 프론트엔드: `studentId`, `password`, `department`, `phoneNumber`
- 백엔드: `schoolNumber`, `password`, `department`

**질문:**
1. `phoneNumber` 필드를 제거해야 하나요?
2. `studentId` = `schoolNumber`로 매핑해도 되나요?

**임시 조치:** `phoneNumber`를 optional로 처리하고, `studentId` → `schoolNumber`로 매핑함

### 2. 백엔드 API 추가 필요

#### 2-1. 전체 팀 목록 조회 API
```typescript
GET /api/teams
// 응답
[
  {
    id: 1,
    teamName: "팀 이름",
    members: [["팀장", "학번"], ["팀원1", "학번"]],
    status: "ongoing",
    pitch_url: "...",
    money: 10000,
    p: 1200,
    // ...
  }
]
```

#### 2-2. 전체 최근 댓글 조회 API
**현재:** 특정 팀의 댓글만 조회 가능 (`GET /teams/:teamId/comments`)

**필요:** 전체 팀의 최근 댓글 조회
```typescript
GET /api/comments/recent?limit=10
// 응답
{
  comments: [
    {
      id: 1,
      team_id: 5,
      author_id: 123,
      body: "좋은 팀입니다!",
      created_at: "2025-11-28T10:00:00Z",
      // 추가로 사용자 정보 조인하면 더 좋음
      author_name?: "멋진 호랑이"
    }
  ],
  totalCount: 100
}
```

#### 2-3. 투자 추이 API (선택사항)
**현재:** `prices` 테이블의 가격 히스토리만 있음

**필요:** 시간대별 투자 금액 추이
```typescript
GET /api/investments/timeline?hours=6
// 응답
{
  timeline: [
    { timestamp: "2025-11-28T19:00:00Z", amount: 50000 },
    { timestamp: "2025-11-28T19:30:00Z", amount: 72000 },
    // ...
  ]
}
```

---

## 🚀 사용 방법

### 1. 환경 변수 설정
`.env.local` 파일 생성:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

프로덕션:
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend.vercel.app
```

### 2. 패키지 설치
```bash
npm install
# or
pnpm install
```

### 3. API 사용 예시

#### 회원가입
```typescript
import { signUp } from '@/lib/api';

const handleSignUp = async () => {
  try {
    const response = await signUp({
      schoolNumber: 20241234,
      department: '컴퓨터공학과',
      password: 'password123',
    });
    console.log('회원가입 성공:', response.accessToken);
  } catch (error) {
    console.error('회원가입 실패:', error.message);
  }
};
```

#### 내 정보 조회 (인증 필요)
```typescript
import { getMyInfo } from '@/lib/api';

const fetchUserInfo = async () => {
  try {
    const user = await getMyInfo();
    console.log('내 정보:', user);
  } catch (error) {
    // 401 에러 시 자동으로 로그인 페이지로 리다이렉트됨
    console.error('정보 조회 실패:', error.message);
  }
};
```

#### 투자하기
```typescript
import { invest } from '@/lib/api';

const handleInvest = async (teamId: number, amount: number) => {
  try {
    const result = await invest({ teamId, amount });
    alert(result.message); // "투자가 완료되었습니다."
  } catch (error) {
    alert(error.message);
  }
};
```

#### 팀 댓글 조회
```typescript
import { getTeamComments } from '@/lib/api';

const fetchComments = async (teamId: number) => {
  const response = await getTeamComments({
    teamId,
    mode: 'default', // 또는 'preview'
    limit: 10,
  });

  console.log('댓글:', response.items);
  console.log('더 보기 가능:', response.hasMore);
};
```

### 4. 토큰 관리
```typescript
import { tokenManager } from '@/lib/axios';

// 토큰 가져오기
const token = tokenManager.getToken();

// 토큰 저장
tokenManager.setToken('your-jwt-token');

// 토큰 삭제
tokenManager.removeToken();

// 토큰 유효성 확인
const isValid = tokenManager.isTokenValid();
```

---

## 🔒 보안 설정

### 1. CORS 설정 (백엔드)
백엔드에서 프론트엔드 도메인 허용:
```typescript
// main.ts 또는 app.module.ts
cors: {
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app'
  ],
  credentials: true,
}
```

### 2. JWT 토큰
- localStorage에 저장
- 모든 인증 필요한 요청에 자동으로 `Authorization: Bearer {token}` 헤더 추가
- 만료 시간 검증 (JWT payload의 `exp` 필드)

### 3. 에러 처리
- 401: 자동 로그아웃 및 로그인 페이지 리다이렉트
- 403: 권한 없음 에러
- 404: 리소스 없음
- 500: 서버 에러

---

## 📝 변수명 매핑

| 프론트엔드 | 백엔드 | 설명 |
|-----------|--------|------|
| `studentId` | `schoolNumber` | 학번 (8자리) |
| `nickname` | `name` | 사용자 닉네임 |
| `content` | `body` | 댓글 내용 |
| `createdAt` | `created_at` | 생성 시간 |

---

## 🐛 디버깅

### 개발 환경에서 로그 확인
브라우저 콘솔에서 다음과 같은 로그를 확인할 수 있습니다:
```
[API Request] POST /api/auth/signup
[API Response] POST /api/auth/signup (201)
[API Error] GET /api/user (401)
```

### 네트워크 탭
브라우저 개발자 도구 > Network 탭에서 실제 요청/응답 확인

---

## 📞 문의사항

위 내용 중 불명확한 부분이나 추가 API가 필요하면 알려주세요!

