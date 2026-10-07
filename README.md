# MERO

서울대학교 로봇 동아리 MERO 소개 및 회원·로봇 관리 사이트. Next.js App Router, React, TypeScript, Radix Themes, Node SQLite로 구성했습니다.

## GitHub / Vercel 이식

기존 `merosnurobotics/mero-website`의 가상 콘텐츠를 제거하고 실제 MERO 사이트를 이식했습니다. 기존 GitHub–Vercel 프로젝트 연결을 그대로 사용합니다. `vercel.json`은 Next.js 빌드와 출력 경로를 명시하고 Node.js는 `24.x`로 고정합니다. 운영 브랜치는 변경하지 않았습니다.

새 브랜치의 Preview 배포에서는 공개 페이지, 로봇 제작 정보와 QR 다운로드를 사용할 수 있습니다. Vercel에는 영구 로컬 파일시스템이 없으므로 SQLite 회원·관리자 기능은 활성화하지 않습니다. 가입·로그인·관리자 API는 `503`과 준비 안내를 반환하며 회원 데이터를 임시 디스크에 저장하지 않습니다. 외부 DB 연동은 별도 후속 작업입니다. `DATABASE_PATH`를 `/tmp`로 설정해도 이 제한을 해제하지 않습니다.

회원·관리자 기능은 영구 저장소가 있는 Node.js 서버에서 기존과 동일하게 동작합니다. 실제 운영 회원 DB, 계정 정보, `.env.local`, `.local` 자료는 이식하지 않았습니다.

Vercel Preview에서 `NEXT_PUBLIC_SITE_URL`은 비워 두면 배포 주소를 사용합니다. 운영 주소 확정 후 HTTPS 주소로 설정하고 `COOKIE_SECURE=true`를 사용하세요. 운영 배포 전에는 외부 DB 연동, 관리자 생성, 실제 장비 접속 정보 등록이 필요합니다.

Vercel 프로젝트 설정에 별도의 Root Directory / Build Command / Ignored Build Step이 지정되어 있다면 대시보드에서 확인해야 합니다. 저장소에는 별도 프로젝트 ID나 `.vercel` 연결 파일이 없고, 기존 성공 배포 기록으로 연동을 확인했습니다.

## HTML 파일로 초안 공유

`output/MERO-preview.html` 하나만 전달하면 됩니다. 사진·로고·글꼴·스타일·브라우저 코드가 모두 들어 있어 서버 없이 브라우저에서 열 수 있습니다. 홈부터 프로젝트·활동 상세, 회원·관리자 화면까지 19개 화면을 담았습니다. 상단의 페이지 선택과 방문자·회원·관리자 체험 버튼으로 이동할 수 있습니다.

가입·회원 승인·로봇 편집은 메모리에서만 동작하는 데모이며 파일을 새로 열면 초기화됩니다. 실제 회원 데이터나 관리자 로그인 정보는 포함하지 않았습니다. 외부 YouTube 영상과 기사·자료 링크는 인터넷 연결이 필요합니다.

```sh
npm run preview:build
npm run test:e2e -- tests/offline-preview.spec.ts
```

다시 생성할 때 현재 페이지 컴포넌트와 공개 자산을 사용하며 운영 데이터베이스는 읽지 않습니다. 로컬 웹 미리보기 주소는 http://localhost:3000/MERO-preview.html 입니다.

## 실행

Node.js 24 이상과 영구 저장이 가능한 파일시스템이 필요합니다.

```sh
npm install
cp .env.example .env.local
npm run dev
```

미리보기: http://localhost:3000

```sh
npm run typecheck
npm test
npm run build
npm start
```

## 실제 브라우저 기능 검증

공유 HTML과 별개로 실제 서버의 가입·승인·로봇 편집·다운로드·비밀번호 변경을 검증합니다. 아래 데이터베이스는 테스트 전용이며 기존 회원 데이터와 관리자 비밀번호 파일을 사용하지 않습니다.

```sh
DATABASE_PATH=.local/qa/live.sqlite npm run test:e2e:seed
DATABASE_PATH=.local/qa/live.sqlite npm run build
DATABASE_PATH=.local/qa/live.sqlite NEXT_PUBLIC_SITE_URL=http://localhost:3100 COOKIE_SECURE=false npm run start -- --port 3100
```

다른 터미널에서 실행합니다. 아래 계정은 테스트 데이터베이스에만 생성됩니다.

```sh
MERO_LIVE_E2E_BASE_URL=http://localhost:3100 \
MERO_LIVE_E2E_ADMIN_EMAIL=qa-admin@mero.test \
MERO_LIVE_E2E_ADMIN_PASSWORD='QA-only-MERO-2026!' \
npm run test:e2e:live
```

2026-10-02 검증: 단위·권한 테스트 11개, 공유 HTML 브라우저 테스트 4개, 실제 서버 브라우저 테스트 2개 통과. 공개 화면 19개를 320/390/1440px와 두 테마에서 확인했습니다. 홈과 QDD 프로젝트의 Lighthouse는 데스크톱 성능 100, 모바일 성능 97이며 접근성·권장사항·SEO는 모두 100입니다. 보고서는 `.local/qa`에 저장했습니다.

프로덕션 파일 목록에서 회원 DB·로컬 관리자 정보·환경 파일을 제외했습니다. 실제 운영 DB는 서버의 영구 저장 영역에 따로 보관해야 합니다.

## 관리자

```sh
npm run admin:create -- --email admin@mero.local --name 'MERO 운영진'
```

초기 비밀번호는 `.local/admin-credentials.txt`에 저장합니다. 파일 권한은 600이며 공개 폴더와 저장소에서 제외됩니다. 기존 계정이 있으면 변경하지 않습니다. 로그인 후 내 계정에서 비밀번호를 바꿀 수 있습니다.

회원가입 시 기본 상태는 승인 대기입니다. 관리자가 승인한 회원에게 로봇 접속 정보와 운용 설명서를 제공합니다. 웹 로그인과 SSH 장비 인증은 별도입니다.

관리자는 로봇의 설명, 제작자, 기간, SSH 정보, 제어 명령과 설명서를 편집할 수 있습니다. 초기 장비의 실제 IP·사용자·실행 명령은 비워 두었습니다. QR 주소는 `/robots/로봇ID`이고 ID는 변경할 수 없습니다.

운영 도메인을 정한 후 `NEXT_PUBLIC_SITE_URL`을 지정하고 HTTPS 환경에서는 `COOKIE_SECURE=true`를 사용하세요. 로봇 QR에 localhost를 사용하면 다른 기기에서 접속할 수 없습니다. 회원·세션·로봇 데이터는 `data/mero.sqlite`에 저장됩니다. 이 사이트는 정적 HTML 배포용이 아닙니다.

## 디자인과 자료

- 홈은 동아리 전반을 소개하고, 학기별 프로젝트는 ‘활동’에서 볼 수 있습니다.
- 색상 기준: [서울대학교 로보틱스 사이트](https://robotics.snu.ac.kr/). 원본 CSS의 `#1640a8`, `#183889`를 기본·강조 색상으로 적용했습니다.
- 활동 구조 참고: [KAIST MR history](https://mr.kaist.ac.kr/history). 학기/연도 구분과 활동 본문을 분리하는 구조를 참고해 새로 구현했습니다.
- MERO 로고: `MERO_2026_OT.pptx` 첫 장 원본 그림에서 하단 영문 설명을 제외하고 SVG 경로로 변환했습니다. `public/brand/mero.svg`.
- 기계공학부 로고는 원본의 흰색 배경과 가장자리의 흰색 성분만 제거한 실제 투명 PNG입니다. `public/brand/mechanical-engineering-transparent.png`를 밝은 테마, 같은 윤곽·주황색을 유지하고 회색을 밝힌 `mechanical-engineering-dark.png`를 어두운 테마에 사용합니다. 원본은 `mechanical-engineering.png`에 보존하며 `node scripts/prepare-department-logo.mjs`로 다시 만들 수 있습니다. 흰 배경에 재합성한 결과와 원본의 픽셀 차이가 0임을 확인했습니다.
- 홈·소개 사진: 사용자가 제공한 `competition-group.jpg`. `public/images/mero-team.webp`.
- AI 로봇챌린지 대표 사진: 사용자가 제공한 `6a7e83d019eba6286655.jpg`. `public/images/challenge-cover.webp`.
- 활동 사진: 사용자가 제공한 AI챌린지, RI 개소식 ZIP.
- [AI 로봇챌린지 영상](https://www.youtube.com/watch?v=bwild_6jS2U), [로봇신문 기사](https://www.irobotnews.com/news/articleView.html?idxno=47888)는 활동 상세 페이지에 연결했습니다.
- 로봇 스케치는 실제 Mini Cheetah, Microban, RBY1 사진을 참고해 이미지 생성 도구로 제작했습니다. 실물 사진과 생성 스케치는 상세 페이지에서 구분합니다.
- Microban 원본: [Rhoban Microban](https://github.com/rhoban/microban). 하드웨어·문서는 CC BY-NC-SA 4.0, 소프트웨어는 GPL-3.0입니다. 실제 프로젝트 자료는 `/home/user/microban`을 참고했습니다.
- Pretendard 글꼴은 자체 제공하며 라이선스는 `public/fonts/OFL.txt`에 있습니다.

사이트의 고정 문구는 같은 글꼴에서 추출한 약 100KB의 `MeroSiteSans.woff2`로 먼저 표시합니다. 포함되지 않은 회원 이름·편집 문구는 원본 Pretendard를 필요할 때 불러옵니다. 파생 글꼴은 OFL의 예약 이름 규칙에 따라 내부 이름을 변경했습니다. 고정 문구가 크게 바뀌면 `fonttools[woff]`가 설치된 환경에서 `python3 scripts/build-font-subset.py`로 다시 생성할 수 있습니다. 공유 HTML은 원본 글꼴을 포함합니다.

작업 기록과 남은 준비 사항은 [WORK_STATUS.md](WORK_STATUS.md)에 기록했습니다.
