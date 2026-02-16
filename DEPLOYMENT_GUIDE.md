# 배포 가이드

## 환경 변수 설정

### OpenAI API 키 설정 (필수)

`vista_news` 기능은 OpenAI API를 사용하여 뉴스를 분석합니다. 배포 시 다음과 같이 환경 변수를 설정해야 합니다.

#### 로컬 개발
```bash
# .env.local 파일에 설정
OPENAI_API_KEY=sk-proj-xxxx...
```

#### Vercel 배포
1. [Vercel Dashboard](https://vercel.com/dashboard)에서 프로젝트 선택
2. **Settings** → **Environment Variables**로 이동
3. 다음 환경 변수 추가:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: OpenAI API 키 (https://platform.openai.com/api-keys에서 발급)
   - **Environments**: Production, Preview, Development 모두 선택
4. 저장 후 새로 배포

#### Railway 배포
1. [Railway Dashboard](https://railway.app)에서 프로젝트 선택
2. **Variables** 탭으로 이동
3. `OPENAI_API_KEY` 추가
4. 저장 후 재배포

#### Netlify 배포
1. Site settings → **Build & deploy** → **Environment**
2. `OPENAI_API_KEY` 추가
3. 저장 후 재배포

### 기타 필수 환경 변수

다음 환경 변수들도 배포 환경에 설정하세요:

```
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# 공공 API (선택)
PUBLIC_DATA_API_KEY=your_key
KIS_APPKEY=your_key
KIS_APPSECRET=your_key
KRX_OPEN_API_KEY=your_key
```

## 문제 해결

### "OPENAI_API_KEY environment variable is not set" 오류

**원인**: 배포 환경에 `OPENAI_API_KEY` 환경 변수가 설정되지 않았음

**해결방법**:
1. 사용 중인 배포 플랫폼의 환경 변수 설정 페이지에서 `OPENAI_API_KEY` 추가
2. 배포 플랫폼에서 재배포 수행

### 로컬에서는 작동하는데 배포 후 오류 발생

1. 배포 환경의 환경 변수 설정이 올바른지 확인
2. 배포 로그에서 환경 변수가 제대로 로드되었는지 확인
3. 필요시 배포 플랫폼에서 캐시 초기화 후 재배포

## 보안 주의사항

- `.env.local` 파일은 절대 Git에 커밋하지 마세요 (이미 `.gitignore`에 설정됨)
- API 키는 공개 저장소에 노출되지 않도록 주의하세요
- 배포 환경에서만 실제 API 키를 사용하세요