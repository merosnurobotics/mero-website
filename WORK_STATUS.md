# 2026-10-08 작성자 표시와 Localization 02/03

- 모든 교육자료에 작성자 조연우 / yencho929@snu.ac.kr. catalog의 자료별 author + 공통 mailto 표시. d026f57 Vercel 배포 및 기존 5편 live 확인 완료.
- Localization 시리즈: 01 LiDAR, 02 ROS 2 토픽으로 내보내기, 03 객체 localization. 새 2편에도 동일 작성자.
- 02: ddonggae arena_control_node의 scan 구독/최신 입력/발행 구조 참고. 경량 ROS node + 합성 LaserScan; PoseStamped/Float64로 출력. Humble 실제 송수신·stale scan 차단 integration 확인.
- 03: ddonggae match_runner의 mask 하단 픽셀/depth median/좌표변환을 재구성. mask 밖 depth 제외, ROS 축 통일, 카메라→로봇→map; stdlib geometry와 JSON 입력, 합성 demo. geometry 6개 및 기존 LiDAR 4개 테스트 통과. 실제 camera/model/depth 정확도 새 검증은 하지 않음.
- 원본 데이터/가중치/장착 calibration/IMU/경기 제어 코드 복사 없음. native mask/depth와 map 도식 사용.
- Production build/typecheck 통과. 로컬 browser에서 3편 순서, 새 2편 chapter/author/390·1440 px light/dark 및 오류·overflow 검사 통과. repo/site 새 변경 배포 확인 대기.

최종 검증: canonical production build 통과. 공개 모드 Playwright 6개 통과(비공개 전용 검사 1개 제외), 회원 전용 옵션 regression 2개 통과. Native 도식의 mobile/dark 화면 직접 확인. PID unit test 5개와 LiDAR unit test 4개 통과. 배포 후 공개 접근 확인 대기.

# 2026-10-08 최종 교육 구성

- 교육 전체 공개가 기본. EDUCATION_MEMBERS_ONLY=true로 페이지·미디어를 회원 전용으로 전환 가능. docs/education-access.md 운영 안내.
- LiDAR: 초기 방향 가정의 경량 known-wall x/y 실습. IMU는 심화 discussion의 방법론만. 요청한 robot-overview, arena-control-ui, robot-closeup 사진·캡션·파일 삭제.
- 직접 만든 도식은 HTML/CSS 및 theme-aware inline SVG. 생성한 이미지 파일 대신 반응형 원본 DOM으로 표시. Commons PID 그림/애니메이션 및 RustDesk 공식 screenshot만 외부 이미지로 유지.
- PID: 'PID 활용 예시' 아래 encoder motor/line tracking을 목표·측정·오차·출력 관점으로 정성적으로 설명. 모터/line simulation 그래프·결과·demo 삭제. meroedu-control c1c8d1c.
- 새 공개 repo: meroedu-localization 441a1bb, meroedu-control c1c8d1c, meroedu-setup b7099c6. 시리즈별 lessons/01-*와 후속 강의 확장 규칙.
- 실제 Jetson의 설정·Tailscale login·RustDesk 연결은 새로 수행하지 않음. SSH config 예제 해석과 경량 Python 계산을 검증.

# 2026-10-08 최종 변경: 교육 전체 공개

사용자가 회원 전용 요청을 철회하고 전체 공개를 요청했습니다. 기본 공개 상태이며 `EDUCATION_MEMBERS_ONLY=true`를 설정하고 재배포하면 회원 전용으로 바꿀 수 있습니다. 동일 옵션이 페이지와 자료 파일에 적용됩니다. docs/education-access.md에 운영 방법을 기록했습니다. 앞선 회원 전용 기록은 작업 이력입니다.

# 2026-10-08 추가 교육 자료와 회원 접근 제한

- Localization / LiDAR: ddonggae의 known-wall range matching을 경량 Python 코드로 재구성. 초기 yaw를 알고 있다고 가정하고 x/y 탐색. IMU는 심화 discussion의 방법론만 설명.
- Control theory / PID: P·I·D 도식/Commons 이미지/애니메이션, encoder motor의 원본 PI와 street line tracking의 원본 P를 명시하고 교육용 I/D 확장을 추가.
- 개발 환경 셋업 / 원격 작업: SSH server, Tailscale 로그인, key pair 등록, ssh jetson profile, 파일/장시간 작업, RustDesk GUI. 실제 장치 설정은 새로 바꾸지 않음.
- 세 공개 저장소: merosnurobotics/meroedu-localization (83776d7), meroedu-control (8f3df0e), meroedu-setup (4c78a4f). lessons/01-* 독립 구조이며 후속 강의 확장 가능.
- /education 페이지는 유효한 회원 로그인 필요. pending/active 등록 회원 허용, suspended/만료/무효 session 차단. 로봇 운용 권한은 기존 active 정책 유지.
- /education-assets 파일을 public에서 private로 이동해 authenticated Node route로 제공. Video byte range 지원, private no-store, optimizer 복사 차단. 교육 파일 public static copy 없음.
- GitHub 코드 저장소는 요청대로 공개이며 사이트 접근 제한과 별개. 공개 website source/history의 visibility는 변경하지 않음.
- 검증: 양쪽 site typecheck/build, canonical production server에서 Playwright 6개 통과, LiDAR/PID 단위 테스트 9개 통과, 합성 위치/모터/line demo 실행, OpenSSH profile 해석, 실제 새 교육 자료의 mobile/desktop light/dark screenshot 확인. Vercel 배포 후 비회원 차단 추가 확인 예정.


### 최종 반영 상태 · 2026-10-08

- 최신 강화학습 원본을 다시 이식: 6개 장, 영상 3개. 외란 비교 장·영상·강건성 설명 제거. GPU PPO400회/819200 transitions 및 기본 양발→왼발 검증 사례만 유지.
- meroedu-rl 로컬 첫 회차도 rest-zero CSV/lift-scale2.8, 미학습 초기화→외력 없는 GPU400회→GPU/Native 평가로 갱신. 초기 정책 생성·새 참조·CPU1회 PPO 검증 통과.
- GitHub 최초 공개 저장소 생성/업로드 성공 후 후속 Git push가 Internal Server Error로 반복 실패. REST blob 업로드도 HTTP500으로 실패. 사이트 변경과 RL 최종 변경은 로컬 커밋 상태이며 공개 사이트는 아직 미반영.
- 운영 사이트 로컬 체크아웃: /home/user/MEROsite/.local/site-publish. 교육 저장소: /home/user/MERO-education/meroedu-rl, /home/user/MERO-education/meroedu-detection.
- 인증은 merosnurobotics 활성, HTTPS Git 연결. 원래 YenCho 로그인은 유지. 연결된 GitHub 앱은 mero14robotics-ui로 확인되어 요청한 계정과 달라 쓰기 대체 경로로 사용하지 않음.

## 2026-10-08 · 교육 시리즈와 공개 콘텐츠 정리

- /home/user/ddonggae의 origin을 fetch해 원격 main이 로컬보다 9커밋 앞선 상태를 확인. 교육용 원본은 d85758c752e6cd3244e16d9ea4a3d2831da225b4로 고정했고 원본 작업 트리는 변경하지 않음.
- 교육 → 객체인식에 입문용 10개 장 추가. 이미지/정답, 합성 데이터, 도메인 랜덤화, 두 모델 구성, CPU 120장 실습, 분리/내보내기/학습/평가를 설명. 당시 COCO 배경과 최신 공개 경기장 레시피를 구분.
- educationTopics[].lessons 기반으로 시리즈에 여러 회차를 추가할 수 있게 구성.
- merosnurobotics/meroedu-rl 및 meroedu-detection 공개 저장소 생성. 각 lessons/01-...에 필요한 환경/코드/최소 입력만 배치. 영상·데이터셋·모델 가중치·과거 실험 제외.
- RL 참조 재생성과 CPU 2환경/1회 PPO 실행 통과. detection은 소스/셸 검사, 런처 인자 전달, 120개 fixture의 결정적 96/12/12 분할과 불완전 세트 거부 검증. 전체 데이터 렌더/장시간 학습을 새로 수행하지 않음.
- 웹 타입 검사/프로덕션 빌드와 교육 브라우저 테스트 3개 통과. 모바일/데스크톱 및 밝은/어두운 테마, 목차, 영상, 복사/다운로드 검증.
- TRI-RESPONSE 공개 목록/상세/프로젝트 문구/이미지/단일 HTML에서 제거. 원본은 로컬 .local/private에 보관하며 배포하지 않음.
- 운영 merosnurobotics/mero-website 별도 체크아웃에 콘텐츠 변경만 이식. 운영 Neon PostgreSQL/회원 기능 유지. main 업데이트로 기존 Vercel 자동 배포 사용.

# 2026-10-07 Neon PostgreSQL 연결 코드 반영

- 사용자 확인: Vercel Storage에서 DB 연결 완료.
- `DATABASE_URL` / `POSTGRES_URL`이 있으면 PostgreSQL을 사용하고, 로컬에는 SQLite를 유지합니다.
- 회원·세션·로봇·관리자 처리를 비동기 DB 호출로 전환했습니다. 최초 요청에서 스키마와 실제 로봇 초기 자료를 트랜잭션으로 생성하며 기존 자료는 덮어쓰지 않습니다.
- 관리자 변경은 동일 연결의 트랜잭션·권한 재확인·DB 잠금을 사용합니다. 동시 변경으로 모든 관리자가 사라지는 경우를 방지합니다.
- 비밀번호 변경과 세션 해제는 원자적으로 처리합니다. 동시에 시도한 이전 비밀번호 로그인도 변경 후 유효한 세션을 남기지 못하도록 검증합니다.
- `/api/health`로 DB 준비 상태와 종류만 확인합니다. 실제 연결 문자열은 로그와 응답에 출력하지 않습니다.
- 실제 Neon 인증정보는 로컬 환경에 없으므로 사용자 DB에는 직접 접속하지 않았습니다. Vercel Preview는 인증 보호되어 원격 런타임 확인에 사용자 브라우저 접근이 필요합니다.
- 검증 완료: 타입 검사·Vercel 환경 빌드, SQLite/미설정 Vercel 테스트 18개, 실제 PostgreSQL 회귀 테스트 13개, PostgreSQL 실제 서버 브라우저 테스트 2개, 공유 HTML 브라우저 테스트 4개.
- 초기 운영 관리자 생성은 아직 수행하지 않았습니다. 방법은 README에 기록했습니다.

---

# 2026-10-07 GitHub 레포 이식

- 대상: `merosnurobotics/mero-website`, 브랜치 `feat/migrate-real-mero-site`.
- GitHub 활성 계정 `YenCho`의 `WRITE` 권한 확인.
- 기존 가상 콘텐츠와 자산을 제거하고 `/home/user/MEROsite`의 실제 사이트를 이식.
- 기존 Vercel 성공 배포는 `mero15/mero-website` 프로젝트에 연결. 팀 소유자의 개인 계정과 DB 연결 상태는 Vercel 인증이 없어 확인하지 못함.
- Next.js 빌드 설정과 Node 24.x 명시. 기존 main과 운영 배포는 변경하지 않음.
- Vercel에서 공개 정보와 QR을 DB 없이 제공. 회원 API는 외부 DB 연동 전 503 안내. 영구 디스크가 있는 Node 서버에서는 기존 SQLite 기능 유지.
- 로컬 회원 DB, 계정 정보와 환경 파일은 복사하거나 커밋하지 않음.
- 이식 검증: TypeScript, 단위·권한·Vercel 동작 테스트 13개, Vercel 환경 프로덕션 빌드 통과. 공개 페이지 HTTP 200, 제거한 가상 페이지 HTTP 404, Vercel 가입 API 503 확인. 공유 HTML 재생성 및 브라우저 테스트 4개 통과.

---

# 2026-10-02 재개 작업

## 완료한 작업

- 추가 재개 요청으로 기계공학부 로고의 실제 투명 PNG 처리를 완료했습니다. 원본 픽셀을 기준으로 흰 배경과 가장자리의 흰색 성분을 제거하는 재현 가능한 Node/Sharp 스크립트를 만들었습니다.
- 최종 자산: `public/brand/mechanical-engineering-transparent.png`, `public/brand/mechanical-engineering-dark.png`. 두 파일 모두 868×230이며 같은 알파와 주황색을 유지합니다. 어두운 테마에서는 회색만 밝게 표시합니다. 원본은 기존 공개 파일과 `.local/archive/mechanical-engineering-original.png`에 보존했고 SHA-256이 같습니다.
- 로고 독립 검증: 흰 배경 130,431픽셀 완전 투명, 부분 알파 22,534픽셀, 실색 46,675픽셀 원본 그대로 보존. 비흰색 좌표 삭제 0, 흰 배경 재합성 RGB 차이 0. 검증 보고서와 비교 이미지는 `.local/qa/logo-validation.json`, `logo-dark-validation.json`, `logo-alpha-comparison.png`입니다.
- 푸터의 multiply/screen CSS 합성을 제거하고 테마별 투명 자산을 사용합니다. 공유 HTML의 임시 합성 배경도 제거했습니다. 로고 변경 후 TypeScript·프로덕션 빌드·공유 HTML 테스트 4개 통과. 실제 사이트와 공유 HTML의 두 테마 × 320/390/1440px, 총 12개 푸터 화면과 테마 전환을 확인했습니다. 흰 배경·가장자리 번짐·가로 넘침·이미지 실패·JavaScript 오류가 없으며 검증 자료는 `.local/qa/footer-final`에 있습니다.
- 실제 브라우저에서 가입 직후 계정·관리자 화면이 실패하던 오류 수정. Node SQLite의 null-prototype 조회 결과를 React에 전달할 수 있는 일반 객체로 변환했습니다.
- 서버 내부 주소가 0.0.0.0일 때 localhost와 다른 포트의 정상 요청이 403으로 막히던 출처 검증 수정. 실제 Host와 포트를 확인하며 다른 출처와 다른 포트 요청은 계속 차단합니다.
- 프로덕션 파일 추적이 회원 DB와 로컬 파일까지 포함하던 문제 수정. 런타임 DB 경로의 정적 추적을 중단하고 data/.local/.env/output을 배포 목록에서 제외했습니다. 최종 19개 파일 목록에 비공개 자산 0개임을 확인했습니다.
- 관리자 CSS를 관리자 페이지에서만 불러오도록 이동. 고정 문구 글꼴을 약 100KB로 줄이고, 포함되지 않은 이름·문구는 원본 글꼴을 필요할 때 불러옵니다. 드문 한글 글자에서 원본 글꼴이 실제로 추가 로드되는 것도 확인했습니다.
- Image의 deprecated priority 사용을 eager/high fetchPriority로 교체하고 favicon을 등록했습니다.
- 프로젝트 카드 제목 계층, 모바일 현재 메뉴 표시, 갤러리 가운데 정렬 수정.
- 320px 관리자 편집창과 선택 메뉴가 상단 헤더 뒤에 가려지던 레이어 순서 수정.
- 단일 공유 HTML을 현재 코드로 다시 생성했습니다. output/public 파일은 동일하며 약 8.47 MiB입니다.
- 실제 사이트 미리보기: http://localhost:3000 (프로덕션 서버). 공유 HTML: http://localhost:3000/MERO-preview.html.

## 검증 결과

- TypeScript 검사와 경고 없는 프로덕션 빌드 통과.
- 권한·보안·SSH 단위 테스트 11개 통과.
- 단일 HTML 통합 테스트 4개 통과.
- 실제 서버 브라우저 통합 테스트 2개: 가입 → 승인 대기 권한 차단 → 관리자 승인 → 로봇 안내 → 편집 → SSH/QR 다운로드 → 비밀번호 변경과 기존 세션 해제 → 재로그인. 모바일 두 테마, 관리자 대화상자·선택 메뉴·QR 오류 상태도 확인합니다.
- 공개 경로 19개 × 320/390/1440px × 두 테마 = 114개 화면: 가로 넘침, 이미지 실패, JavaScript 오류, axe 접근성 위반 0개. 없는 페이지는 HTTP 404.
- 키보드·검색·갤러리 28개 확인 및 테마 저장 6개 확인 통과.
- Lighthouse 홈/QDD 상세: 데스크톱 성능 100, 모바일 성능 97. 접근성·권장사항·SEO 모두 100. 모바일 LCP 12.9초 → 2.6초, 데스크톱 2.2초 → 0.6초. 로컬 측정이며 배포 환경에서는 달라질 수 있습니다.
- 검증 자료: `.local/qa`의 빌드 로그·파일 추적 확인·Lighthouse HTML/JSON·visual 폴더. 관리자 모바일 화면은 `.local/live-admin-mobile-light.png`, `.local/live-admin-mobile-dark.png`.
- 검증은 `.local/qa/live.sqlite`와 테스트 전용 계정을 사용했습니다. 기존 회원 DB와 `.local/admin-credentials.txt`를 테스트에 사용하지 않았습니다.
- 재실행 방법은 README의 ‘실제 브라우저 기능 검증’에 기록했습니다.

## 남은 입력과 처리

로고 처리와 로컬 사이트 검증은 완료했습니다. 운영 도메인과 실제 장비 호스트·계정·프로젝트 경로·제어 명령을 확정한 뒤 운영 주소와 영구 QR을 발급해야 합니다. 외부 배포는 수행하지 않았습니다.

이미지 생성 재시도 기록: 기본 내장 image_gen, 원본 `public/brand/mechanical-engineering.png`, transparent_background=true. 프롬프트는 흰 배경만 제거하고 정장·주황 ENGINEERING·회색 영문/한글의 위치·비율·색·윤곽을 그대로 보존하도록 요청했습니다. 미채택 결과는 `.local/archive/mechanical-background-rejected.png`에 보관했고 공개 페이지에는 사용하지 않습니다.

---

# 작업 종료 메모

## 추가 요청: 단일 HTML 공유 초안

2026-10-01 사용자 요청으로 공유용 HTML을 별도로 만들었습니다. 정식 사이트의 남은 작업 목록은 아래에 유지합니다.

- 전달 파일: `output/MERO-preview.html`. 같은 파일을 `public/MERO-preview.html`에도 저장해 로컬 웹에서 열 수 있습니다.
- 전체 19개 화면, 사진·로고·Pretendard 글꼴·CSS·브라우저 코드를 파일 안에 포함했습니다. 서버 없는 file:// 실행을 확인했습니다.
- 방문자·회원·관리자 체험, 가입/로그인, 승인, 로봇 편집, QR PNG와 SSH 설정 파일 다운로드는 메모리에서 동작하는 데모입니다. 실제 회원 DB와 관리자 계정은 포함하지 않습니다.
- 상단 페이지 선택기에서 내 계정·관리자 화면도 직접 열 수 있습니다.
- 외부 영상·기사·참고자료 링크만 인터넷 연결이 필요합니다.
- 생성: `npm run preview:build`. Next.js 원본 페이지는 수정하지 않고 내보내기 단계에서 로컬 데모 데이터로 연결합니다.
- 19개 화면에서 오류와 가로 넘침이 없고 외부 HTTP 요청 없이 동작함을 확인했습니다. 브라우저 통합 검증 4개 통과: 전체 화면, 가입→승인→QR 다운로드, 로봇 편집→SSH 다운로드, 모바일 검색·필터·사진 확대·두 테마. 320px에서도 모든 화면을 확인했습니다.
- TypeScript 검사 통과. MIT/OFL 등 포함 라이브러리와 글꼴의 라이선스 안내도 HTML 내부에 보관합니다.

---

2026-10-01. 사용자 요청으로 오늘 작업을 종료했습니다.

## 반영한 내용

- MERO / 서울대학교 301동 정보.
- 홈의 이번 학기 프로젝트 소개 제거. 메뉴는 ‘동아리 소개 / 활동 / 로봇 안내’.
- 2026-2 QDD 사족보행, Microban 미니 휴머노이드, RBY1 VLA manipulation 소개는 활동 내부에 배치.
- AI 로봇챌린지 영상과 기사 연결, 활동 갤러리.
- 서울대 로보틱스 원본 CSS의 블루 계열 적용, 밝은/어두운 테마.
- PPT 첫 장의 MERO 로고에서 하단 영문 설명 제외, SVG 변환.
- 사용자의 마지막 사진 지정: 홈·소개 = competition-group.jpg, 챌린지 대표 = 6a7e83d019eba6286655.jpg.
- 소개 문구를 특정 학기/로봇 설명에서 동아리의 포괄적인 소개로 수정.
- 서울대 정장 PNG는 실제 투명 배경이며 하단 흰 박스 제거.
- 기계과 로고는 원본 PNG를 유지하고 CSS 합성으로 흰 배경을 화면에서 제거한 임시 상태.
- SQLite 회원/세션/로봇 저장, 관리자 승인, 권한 구분, 로봇 편집, QR PNG, SSH 설정 파일·스크립트, 설명서 UI.
- 로컬 관리자 계정 생성. 정보는 비공개 `.local/admin-credentials.txt`.

## 확인한 내용

- TypeScript 검사 통과.
- 권한, 가입 시 관리자 위조 방지, CSRF, 승인 반영, 비공개 정보 보호, 세션 해제, 비밀번호 변경, SSH 설정 보존·백업·재실행·심볼릭 링크 거부 테스트 10개 통과.
- 홈페이지 HTTP 200, 데스크톱에서 프로젝트 노출 없음, 가로 넘침 없음.
- npm 의존성 감사 결과 취약점 0개. SVG 추적용 일회성 potrace 의존성은 작업 후 제거.

## 다음 작업

1. 기계과 로고의 원본 글자와 형태를 보존한 실제 투명 PNG 정리. 이미지 생성 도구의 배경 제거 결과는 글자/윤곽 품질 때문에 채택하지 않았음. 현재 원본 로고를 CSS로 합성해 표시하며 실제 알파 변환은 미완료.
2. 실제 브라우저에서 가입 → 관리자 승인 → 로봇 안내 → 편집/다운로드 흐름 검증. localhost 로그인 출처 검증 403을 발견했으며 `.env.local`의 사이트 원점을 localhost:3000으로 설정. 설정 반영 후 브라우저 확인 필요.
3. 모바일, 두 테마, 관리자 대화상자, 오류/빈 상태 시각 검증.
4. 프로덕션 빌드 및 Lighthouse. 아직 실행하지 않았으므로 배포 완료로 간주하지 말 것.
5. 운영 도메인과 실제 장비 접속 정보를 확정한 뒤 영구 QR 발급.

## 이미지 생성 기록

실물 참조 기반 로봇 스케치 최종 자산은 `public/images/robot-sketches.webp`.

도구: 내장 image_gen, 실제 참조 사진: `public/images/minicheetah-reference.jpg`, `public/images/microban.png`, `public/images/rby1.png`. 목표: 흰 스케치북 위에 그린 연필 엔지니어링 스케치, 세 로봇을 동일한 폭의 세 영역에 배치, 실물의 실루엣과 관절 구조를 유지, 실사 렌더 제거.

생성 원본: `/home/user/.codex/generated_images/01a0f326-da5e-71a1-a1bc-ae6d835e5358/exec-f3f64312-7575-4a00-81f0-b12e9ed026d4.png`. 프로젝트 안에도 `.local/archive/robot-sketches.png`로 보존했습니다. 채택하지 않은 이전 실사형 이미지는 `.local/archive`에 있으며 공개 페이지에서 사용하지 않습니다.

기계과 배경 제거 시도 원본: `/home/user/.codex/generated_images/01a0f326-da5e-71a1-a1bc-ae6d835e5358/exec-00c06dbd-3ed6-457d-b20e-373372fa98eb.png`. 채택하지 않았음. 프롬프트: 원본 가로 로고의 흰 배경과 흰 여백만 투명 처리하고 주황 ENGINEERING, 회색 영문·한글과 정장의 색상·형태·비율을 그대로 유지하도록 요청.
