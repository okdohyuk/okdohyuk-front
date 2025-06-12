# okdohyuk-front

- **컴포넌트**: 역할별/도메인별로 세분화, Skeleton 등 로딩 UI 분리
- **상태 관리**: MobX, 도메인별 Store, useStore 훅으로 접근
- **유틸리티**: 클래스네임, 마크다운, 날짜 등 공통 로직 분리
- **라우팅**: 동적 라우트, 다국어([lng]), 커스텀 Link 컴포넌트

## 🚀 설치 및 실행

```bash
git clone https://github.com/okdohyuk/okdohyuk-front.git
cd okdohyuk-front
yarn install
yarn dev
```

- **노드 버전**: v20 이상 권장

## 🧩 디자인/UX

- Tailwind CSS 기반 반응형 UI
- Skeleton 컴포넌트로 로딩 UX 개선
- 일관된 커스텀 컴포넌트(Link, Tag 등)
- 다국어(i18n) 지원

## 🏗️ 디자인 패턴/코딩 컨벤션

- 타입스크립트 적극 활용(Props, Store, API 등)
- UI/상태/비즈니스 로직 분리
- 함수형/불변성 패턴
- 폴더/파일 네이밍 일관성

## ⚙️ 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 아래와 같이 환경변수를 설정하세요. 실제 값은 예시로 대체되어 있으니, 본인 서비스에 맞게 수정하세요.

```
# API 서버 주소 (예시)
API_PATH=https://api.example.com/

# 서비스 도메인 (예시)
NEXT_PUBLIC_URL=https://your-service.example.com/

# Google Analytics (예시)
NEXT_PUBLIC_GOOGLE_ANALYTICS_TRACKING_ID=G-XXXXXXXXXX

# Google Adsense (예시)
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX

# Google OAuth (예시)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_OAUTH_URL=https://accounts.google.com/o/oauth2/v2/auth
NEXT_PUBLIC_GOOGLE_SCOPE=https://www.googleapis.com/auth/userinfo.profile

# OpenAI API Key (예시)
OPENAI_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Notion API Key (예시)
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **필수 환경변수 목록**
>
> - `API_PATH` : 백엔드 API 서버 주소
> - `NEXT_PUBLIC_URL` : 서비스의 실제 도메인 주소
> - `NEXT_PUBLIC_GOOGLE_ANALYTICS_TRACKING_ID` : 구글 애널리틱스 추적 ID
> - `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID` : 구글 애드센스 클라이언트 ID
> - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` : 구글 OAuth 클라이언트 ID
> - `NEXT_PUBLIC_GOOGLE_OAUTH_URL` : 구글 OAuth 인증 URL
> - `NEXT_PUBLIC_GOOGLE_SCOPE` : 구글 OAuth 권한 범위
> - `OPENAI_KEY` : OpenAI API Key (필요시)
> - `NOTION_API_KEY` : Notion API Key (필요시)

## 🧪 테스팅

- **Jest** 기반 유닛/통합 테스트
- 커버리지 자동 수집

```bash
yarn test
```

- 커스텀 설정: `jest.config.js` 참고
- 테스트 커버리지 리포트: `coverage/` 폴더 생성

## 📡 API 명세 및 테스트

- **OpenAPI 3.0** 기반 명세: `api-spec/reference/` 폴더 참고
- 주요 엔드포인트 예시:

```
GET /blog?page=0&limit=10
POST /blog
GET /blog/{urlSlug}
PUT /blog/{urlSlug}
DELETE /blog/{urlSlug}
```

- 인증 필요 시: `Authorization: Bearer {token}` 헤더 사용
- 예시 요청/응답은 `test.http` 파일 참고 (VSCode REST Client 등으로 실행 가능)

### API 테스트 예시 (test.http)

```
POST https://api.example.com/blog HTTP/1.1
content-type: application/json
Authorization: Token exampletoken

{
  "isPublic": true,
  "title": "test-blogs",
  "contents": "This is a test post."
}
```

## 🤝 기여 방법

1. 이슈/PR 등록 전 최신 main 브랜치 pull
2. 기능/버그별 브랜치 생성 후 작업
3. 커밋 메시지는 명확하게 작성
4. PR 등록 시 변경 요약 및 스크린샷 첨부 권장

## 📄 라이선스

MIT
