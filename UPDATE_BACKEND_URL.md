# 🔄 프론트엔드 환경 변수 업데이트 가이드

## Railway 백엔드 배포 후 필수 작업!

---

## ⚡ 빠른 시작

Railway에서 백엔드 배포 후 받은 URL을 Vercel 프론트엔드에 설정합니다.

**예상 소요 시간**: 3분

---

## 📋 Step 1: Railway 백엔드 URL 확인

1. Railway 대시보드 접속
2. 백엔드 프로젝트 선택
3. **"Settings"** → **"Networking"** 섹션
4. Public URL 복사 (예: `invest-backend-production.up.railway.app`)

**전체 URL**: `https://invest-backend-production.up.railway.app`

---

## 🔧 Step 2: Vercel 환경 변수 업데이트

### 방법 A: Vercel 웹 대시보드 (추천)

1. **Vercel 대시보드** 접속: https://vercel.com/dashboard
2. 프론트엔드 프로젝트 선택 (`invest-system_frontend`)
3. **"Settings"** 탭 클릭
4. 좌측 메뉴에서 **"Environment Variables"** 클릭
5. `NEXT_PUBLIC_API_BASE_URL` 찾기 (있으면 수정, 없으면 추가)

#### 새로 추가하는 경우:
- **Key**: `NEXT_PUBLIC_API_BASE_URL`
- **Value**: `https://your-backend.up.railway.app`
- **Environment**: Production, Preview, Development 모두 체크 ✅
- **"Save"** 클릭

#### 이미 있는 경우:
- 해당 변수 옆 **"Edit"** 클릭
- Value 업데이트
- **"Save"** 클릭

### 방법 B: Vercel CLI

```bash
# Vercel CLI 설치 (없다면)
npm i -g vercel

# 로그인
vercel login

# 환경 변수 설정
cd invest-system_frontend
vercel env add NEXT_PUBLIC_API_BASE_URL production
# 프롬프트에서 Railway URL 입력

# Preview/Development에도 추가
vercel env add NEXT_PUBLIC_API_BASE_URL preview
vercel env add NEXT_PUBLIC_API_BASE_URL development
```

---

## 🚀 Step 3: 재배포

환경 변수만 변경했을 때는 **재배포가 필요합니다!**

### 방법 A: Vercel 대시보드

1. 프로젝트 페이지에서 **"Deployments"** 탭
2. 최신 배포 찾기
3. 오른쪽 메뉴 **"..."** 클릭
4. **"Redeploy"** 선택
5. "Use existing Build Cache" 체크 해제 (환경 변수 새로 적용)
6. **"Redeploy"** 확인

### 방법 B: Git Push (더 간단)

```bash
cd invest-system_frontend

# 빈 커밋으로 재배포 트리거
git commit --allow-empty -m "Update backend URL"
git push origin main

# Vercel이 자동으로 재배포 시작!
```

---

## ✅ Step 4: 배포 확인

### 4-1. 빌드 성공 확인

1. Vercel 대시보드 → "Deployments"
2. 최신 배포 상태가 "Ready" (초록색) 확인
3. 배포 로그에서 에러 없는지 확인

### 4-2. 환경 변수 적용 확인

브라우저에서 프론트엔드 접속 후:
1. F12 (개발자 도구) 열기
2. **Console** 탭
3. 다음 입력:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_API_BASE_URL)
   ```
4. Railway 백엔드 URL이 출력되는지 확인

또는 **Network** 탭에서:
- API 요청 URL이 Railway 도메인으로 가는지 확인

---

## 🧪 Step 5: 통합 테스트

### 테스트 1: 로그인

1. 프론트엔드 접속
2. 로그인 페이지로 이동
3. 학번과 비밀번호 입력
4. 로그인 시도

**예상 결과**: 로그인 성공 → 메인 페이지 이동

### 테스트 2: API 호출 확인

브라우저 개발자 도구 (F12):
1. **Network** 탭 열기
2. 로그인 또는 다른 액션 수행
3. API 요청 확인:
   - Request URL이 Railway 도메인인지
   - Status가 200 또는 201인지
   - Response가 정상인지

### 테스트 3: 실시간 기능

1. 팀 상세 페이지 접속
2. 주가가 10초마다 업데이트되는지 확인
3. 댓글 작성/읽기 테스트
4. 투자/매도 기능 테스트

---

## 🐛 문제 해결

### 문제: "API 요청 실패" 또는 CORS 오류

**원인**: 백엔드 환경 변수 `FRONTEND_URL`이 잘못됨

**해결**:
1. Railway 대시보드 접속
2. 백엔드 프로젝트 → "Variables" 탭
3. `FRONTEND_URL` 확인/수정:
   ```
   FRONTEND_URL=https://your-actual-frontend.vercel.app
   ```
4. 저장 → 자동 재배포 대기

### 문제: 환경 변수가 적용되지 않음

**원인**: 빌드 캐시 때문에 새 환경 변수가 반영 안됨

**해결**:
1. Vercel에서 재배포 시 "Use existing Build Cache" 체크 해제
2. 또는 다음 명령어로 캐시 클리어:
   ```bash
   vercel --prod --force
   ```

### 문제: 로그인 후 토큰 오류

**원인**: JWT_SECRET 불일치 또는 백엔드 재시작

**해결**:
1. 쿠키 삭제 (개발자 도구 → Application → Cookies → Clear)
2. 다시 로그인
3. Railway 로그에서 JWT 관련 오류 확인

### 문제: 일부 API만 실패

**원인**: 특정 엔드포인트 문제 또는 데이터베이스 이슈

**해결**:
1. Railway Logs에서 에러 확인
2. Swagger 문서에서 해당 엔드포인트 직접 테스트:
   ```
   https://your-backend.up.railway.app/api
   ```
3. 데이터베이스 연결 상태 확인

---

## 📊 환경 변수 전체 목록

### 프론트엔드 (Vercel)

```env
# 필수
NEXT_PUBLIC_API_BASE_URL=https://your-backend.up.railway.app

# 선택 (커스텀 엔드포인트 사용 시)
NEXT_PUBLIC_TREND_ENDPOINT=/api/investments/timeline
NEXT_PUBLIC_CAPITAL_ENDPOINT=/api/capital
NEXT_PUBLIC_RECENT_COMMENTS_ENDPOINT=/api/comments/recent
```

### 백엔드 (Railway)

```env
# 필수
SUPABASE_DB_POOLED_URL=postgresql://...
JWT_SECRET=...
NODE_ENV=production

# CORS 설정
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## ✅ 완료 체크리스트

- [ ] Railway 백엔드 URL 복사
- [ ] Vercel 환경 변수 추가/수정
- [ ] Vercel 재배포 완료
- [ ] 배포 성공 확인 (Ready 상태)
- [ ] 환경 변수 적용 확인 (Console)
- [ ] 로그인 테스트 성공
- [ ] API 호출 확인 (Network 탭)
- [ ] 실시간 기능 테스트

---

## 🎉 완료!

축하합니다! 프론트엔드와 백엔드가 성공적으로 연결되었습니다.

### 최종 URL

- **프론트엔드**: `https://your-frontend.vercel.app`
- **백엔드**: `https://your-backend.up.railway.app`
- **API 문서**: `https://your-backend.up.railway.app/api`

### 모니터링

- **프론트엔드**: Vercel Analytics
- **백엔드**: Railway Logs & Metrics
- **데이터베이스**: Supabase Dashboard

---

## 📞 추가 지원

문제가 계속되면:
1. Railway Logs 확인
2. Vercel Function Logs 확인
3. 브라우저 Console 오류 확인
4. Network 탭에서 실패한 요청 상세 확인

