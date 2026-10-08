# MERO

서울대학교 로봇 동아리 MERO 소개 및 회원·로봇 관리 사이트. Next.js App Router, React, TypeScript, Radix Themes, Node SQLite로 구성했습니다.

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

## 교육 자료

교육 첫 화면(`/education`)에서 기존 자료와 입문 보충 자료를 연결한 21개 자료를 읽는 순서대로 안내합니다. 목록은 처음에 접혀 있습니다. **개발 환경 → 피드백 제어와 모터 → ROS → DeepML 기초 → 객체인식 → 위치 추정 → 로봇 모델·MuJoCo → 강화학습 기초·환경 → Kimodo 응용** 순서이며, ROS로 위치를 발행하는 자료는 LiDAR 개념 다음에 읽습니다. 순서와 자료 사이의 연결 설명은 `src/lib/education/curriculum.ts`에서 관리합니다. 각 자료 아래에는 이전·다음 자료 링크가 있습니다.

신경망·가중치·손실·학습·추론은 기존 객체인식 본문에서, 관측·행동·보상·정책·에피소드는 기존 모방 강화학습 본문에서 설명합니다. 별도 입문 과정이나 활동·과제·진도·수료 기능은 두지 않습니다.

PID·객체인식·강화학습 본문의 개념도는 [Answer me with HTML](https://github.com/QingYunA/answer-me-with-html) 스킬의 CLI로 생성합니다. 원고는 `content/education/diagrams.md`이며, 2026-10-08 작업에서는 0.4.14를 사용했습니다.

```bash
# ~/.codex/skills/answer-me-with-html에 설치한 스킬 사용
npm run education:build
# 다른 설치 위치를 사용한다면
ANSWER_HTML_SKILL_DIR=/path/to/answer-me-with-html npm run education:build
```

생성한 그림은 `src/lib/education/generated/diagrams.json`, 범위를 제한한 스타일은 `src/app/education/diagrams.generated.css`에 저장합니다. `.local/education-diagrams.html`은 제작용 중간 파일이며 별도 교육 페이지로 제공하지 않습니다. 생성물을 함께 유지하므로 일반 `npm run build`에는 스킬 설치가 필요하지 않습니다. 공개/회원 전용 설정은 기존 `EDUCATION_MEMBERS_ONLY`를 따릅니다.

기존 13개 자료에는 실제 실행으로 얻은 PNG 29개를 본문에 첨부했습니다. 터미널은 Xterm, ROS 화면은 RViz에서 직접 캡처했으며, 그래프는 실행이 저장한 수치로 그렸습니다. 원본 PNG·출력 로그·CSV/JSON·RViz 설정은 `private/education-assets/execution/`, 일괄 다운로드는 `private/education-assets/execution-captures.zip`에 있습니다. 모든 자료는 기존 교육 자료 접근 설정을 따르는 `/education-assets/` 경로로 제공합니다. 이미지 목록과 크기는 `src/lib/education/execution-results.json`, 실행 명령·원본 코드 해시·PNG 해시는 `execution/manifest.json`에 기록합니다.

다시 캡처하려면 이 작업에서 사용한 ROS 2 Humble, `/home/user/MERO-education`의 실습 저장소, `/home/user/microbanRL`의 Python 환경과 저장 정책이 필요합니다. 객체인식은 이미 학습된 가중치로 실사진 4장에 추론을 실행합니다. 캡처 스크립트의 로컬 경로는 실행 환경에 맞게 조정하세요. Xvfb·Xterm·libutempter는 `.local/capture-tools/root/usr`, 추론용 추가 패키지는 `.local/inference-deps`를 사용합니다.

```bash
source /opt/ros/humble/setup.bash
/usr/bin/python3 scripts/capture-education-results.py all
# 일부만 다시 실행: all 대신 basic, ros, perception, microban
```

스크립트는 별도 X 디스플레이와 로컬 ROS 도메인 183을 사용하고, 자신이 시작한 프로세스를 종료합니다. 모터는 드라이런, LiDAR·물체 좌표 계산은 합성 입력, PID는 예제 입력 수열임을 본문 캡션에 명시했습니다. Microban은 저장 정책을 Native MuJoCo에서 18초간 재실행한 결과이며, 새로 학습한 결과가 아닙니다. 수치 계산과 PNG 렌더링은 `scripts/capture-education-data.py`가 담당합니다. ZIP은 캡처 당시의 묶음이므로 다시 캡처했다면 함께 갱신해야 합니다.

`/education` → `/education/reinforcement-learning` → `/education/reinforcement-learning/kimodo-mjwarp` 순서로 교육 목록, 강화학습 시리즈, 첫 번째 강의에 접근합니다. 왼쪽 자료 목록은 주제와 강의별로 펼칠 수 있으며 모바일에서는 상단 버튼으로 목록 전체를 여닫습니다.

첫 강의는 `/home/user/microbanRL/education/index.html`의 7개 장을 이식했습니다. HTML 스냅샷은 `src/lib/education/kimodo-lesson.ts`, 목차는 `src/lib/education/catalog.ts`, MERO 테마는 `src/app/education/education.css`에 있습니다. 원본의 큐레이션된 오프라인 ZIP에서 영상·코드·근거 자료·라이선스를 `public/education-assets/kimodo-mjwarp`로 가져왔고 ZIP 다운로드도 제공합니다. 회원 로그인 없이 읽을 수 있습니다.

원본 갱신 시 `node scripts/import-education.mjs /path/to/education`을 실행하면 강의 HTML, 범위를 제한한 원본 CSS, 공개 자료를 다시 가져옵니다. MERO 테마 CSS와 상호작용 컴포넌트는 유지됩니다. 가져오는 HTML은 직접 작성한 신뢰할 수 있는 원본이어야 합니다.

검증: 실행 중인 서버에 `MERO_EDUCATION_TEST_URL=http://localhost:3100 npx playwright test tests/education.spec.ts`를 실행합니다. 탐색·자료 목록·프레임 이동·코드 복사·동시 재생·속도 변경·인쇄·ZIP 다운로드와 320/390/1440px의 밝은/어두운 테마를 확인합니다.

객체인식 시리즈는 `/education/object-recognition`, 첫 회차는 `/education/object-recognition/synthetic-data`입니다. `src/lib/education/catalog.ts`의 `educationTopics[].lessons`에 회차를 추가하면 시리즈 소개와 왼쪽 교육 목록에 반영됩니다. 각 회차의 페이지·장 목록은 별도로 만듭니다.

실습 저장소는 [meroedu-rl](https://github.com/merosnurobotics/meroedu-rl), [meroedu-detection](https://github.com/merosnurobotics/meroedu-detection)입니다. 루트는 시리즈 목차, `lessons/01-.../`은 독립된 환경·실행 코드·최소 입력입니다. 영상과 과거 실험 결과는 교육 사이트에 남깁니다.

객체인식 원본은 YenCho/ddonggae의 `d85758c`입니다. `scripts/import-perception-education.py`로 이 버전의 문서·그림·실습 명령을 스냅샷합니다. 전체 렌더링이나 학습을 자동 실행하지 않습니다.


### DeepML·시뮬레이션 입문 자료

`content/education/deepml/`의 5개 초안 중 3개는 DeepML, 2개는 강화학습 주제에 배치합니다. `content/education/simulation/`의 3개 자료는 로봇 모델·MuJoCo·환경의 계약을 다룹니다. Kimodo는 강화학습 기초 자료와 같은 큰 주제에 둡니다. 강의 HTML은 Answer me with HTML CLI가 생성하며, 데스크톱 LR/모바일 TB 흐름도를 각각 렌더링합니다. 한국어 문장 옆에서도 강조가 실제 `<strong>`으로 표시되도록 생성 과정에서 보완합니다.

```bash
npm run education:deepml
/home/user/microbanRL/.venv/bin/python scripts/run-deepml-example.py
MUJOCO_GL=egl /home/user/microbanRL/.venv/bin/python scripts/run-mujoco-intro.py
MUJOCO_GL=egl /home/user/microbanRL/.venv/bin/python scripts/render-pendulum-examples.py
.local/manim-venv/bin/python scripts/run-robot-kinematics.py
.local/manim-venv/bin/manim -qm --renderer=cairo --media_dir .local/manim-render scripts/render-neural-network.py LearningNetwork
```

자료 재생성에는 설치된 HTML 스킬과 `.local/research/`의 고정 버전 원문이 필요합니다. 생성된 JSON/CSS와 PNG/GIF를 함께 유지하므로 일반 사이트 빌드는 이 도구들을 실행하지 않습니다. 실제 실험 수치와 합성·설명용 데이터 범위는 `private/education-assets/deepml/results.json`, `simulation/results.json`, `simulation/kinematics-results.json`에 기록합니다. Manim/ManimML 자산 내부 텍스트는 영문 전용이며 Lato 폰트를 직접 등록합니다. 영상은 `.local/manim-render/videos/render-neural-network/720p30/LearningNetwork.mp4`에서 `private/education-assets/deepml/neural-network.mp4`로 복사하고, ffmpeg로 0.5초 프레임을 `neural-network.png`에 저장합니다. 웹에는 10 fps·960px·96색 팔레트로 압축한 `neural-network.gif`를 첨부하며, 재생 조작이 필요 없는 짧은 설명은 GIF를 우선합니다. 이후 `npm run education:deepml`을 실행합니다.

원문 선정·재사용 범위는 `content/education/SOURCES.md`, 각 라이선스와 원문 커밋은 `src/lib/education/generated/source-notices.json`에 보존합니다. Modern Robotics의 교재 개념은 자체 예제로 설명하고, MIT인 동반 코드의 `FKinSpace`를 실행합니다. 교재 본문·그림의 재배포 허가와 코드 라이선스를 혼동하지 않습니다.

검증: `MERO_EDUCATION_TEST_URL=http://localhost:3100 npx playwright test tests/education.spec.ts tests/education-foundations.spec.ts`.

MuJoCo 자료의 정진자·역진자 GIF는 실제 물리 상태를 20fps로 렌더링합니다. 정진자는 3초, 역진자는 6초이며, 제어 없음과 PD 제어를 같은 초기 조건에서 비교합니다. 역진자는 고정 관절의 위쪽 균형 유지 예제로 2초에 외부 토크를 가합니다. XML·실행 수치·해시는 `private/education-assets/simulation/*-demo*`에 보관합니다. 움직임 줄이기 설정에서는 정적 PNG로 바뀝니다.
