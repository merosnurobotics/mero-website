# 교육자료 공개 옵션

기본값은 전체 공개입니다. 페이지와 이미지·영상·ZIP 파일 모두 로그인 없이 열립니다.

Vercel production 환경 변수 `EDUCATION_MEMBERS_ONLY`를 설정하고 다시 배포합니다.

| 값 | 사이트 교육자료 접근 |
| --- | --- |
| `false` 또는 미설정 | 전체 공개 |
| `true` | 유효한 로그인 회원만 페이지와 자료 파일 접근 가능 |

로컬에서도 같은 서버 환경 변수를 적용해 재시작합니다. 회원 전용이면 registered pending/active 회원을 허용하고 suspended·만료·무효 세션을 차단합니다. 로봇 운용의 active 승인 정책은 별도로 유지합니다.

자료 파일은 `private/education-assets`에서 `/education-assets/[...path]` route를 통해 제공합니다. 공개/비공개 모두 같은 경로를 사용하며 공유 캐시에 저장하지 않습니다. 영상 byte range를 지원합니다. 교육 이미지는 unoptimized로 제공해 검사를 우회하는 optimizer 복사본을 만들지 않습니다.

공개 GitHub 실습 저장소와 website source/history의 visibility는 이 환경 변수로 바뀌지 않습니다.

검사: `MERO_EDUCATION_TEST_URL`을 실행 서버로 설정합니다. 비공개 모드에는 `MERO_EDUCATION_TEST_MEMBERS_ONLY=true`와 검증용 이메일·비밀번호 환경 변수를 추가합니다. 공개 모드의 비회원 검사는 credentials 없이 실행할 수 있습니다.
