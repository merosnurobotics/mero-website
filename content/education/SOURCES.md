# 입문 교육 원문과 재사용 기록

확인일: 2026-10-09. 강의 전체나 외부 영상·도표를 일괄 복제하지 않고, 동아리 로봇 제어에 필요한 입문 설명을 선별 번역·편집한다. 각 교육 페이지에서 출처, 수정 범위, 해당 라이선스 전문을 제공한다.

| 자료 | 성격과 적용 범위 | 라이선스와 처리 |
| --- | --- | --- |
| [OpenAI Spinning Up](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html) | 관측·행동·정책·보상·PPO 입문 | [MIT](https://github.com/openai/spinningup/blob/master/LICENSE). 문서 포함. OpenAI 고지 전문 유지. 고급 증명 제외. |
| [Hugging Face Deep RL Course](https://huggingface.co/learn/deep-rl-course/en/unit1/rl-framework) | 누적 보상과 경험의 연결 설명 | [Apache 2.0](https://github.com/huggingface/deep-rl-class/blob/main/LICENSE.md). 선택 번역과 로봇 예시 변경 표시. 외부 데이터셋의 그림과 제3자 인용 그림은 가져오지 않음. |
| [MuJoCo 공식 문서](https://mujoco.readthedocs.io/en/stable/overview.html) | 몸체·관절·구동기, MjModel/MjData, 스텝과 렌더링 | [Apache 2.0](https://github.com/google-deepmind/mujoco/blob/main/LICENSE). 선택 번역·요약. 정진자·역진자·Cart-pole XML·코드·PNG·GIF는 MERO 제작. |
| [Gymnasium Basic Usage](https://gymnasium.farama.org/introduction/basic_usage/) | reset/step, terminated/truncated, 관측·행동·보상 | [MIT](https://github.com/Farama-Foundation/Gymnasium/blob/main/LICENSE). OpenAI/Farama 고지 유지. `docs/_static/diagrams/AE_loop.png`를 원본 그대로 첨부. |
| [ROS 2 URDF 입문](https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/Building-a-Visual-Robot-Model-with-URDF-from-Scratch.html) | 링크·관절·형상 설명 | [CC BY 4.0](https://github.com/ros2/ros2_documentation/blob/humble/LICENSE). ROS 2 기여자 출처, 라이선스, 한국어 편집·요약 표시. 시간 활동 및 외부 메시 파일 제외. |
| [PyTorch Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/intro.html) | 딥러닝 보충 자료의 참고 링크 | 본문·그림 복제 없음. MERO 센서 사례와 자체 실행 코드·손실 곡선 사용. |
| [ManimML](https://github.com/helblazer811/ManimML) | 머신러닝 구조·순전파 애니메이션 제작 도구 | [MIT](https://github.com/helblazer811/ManimML/blob/main/LICENSE.md). MERO가 장면을 직접 작성·렌더링. Manim Community도 MIT. |
| [3Blue1Brown 신경망](https://www.3blue1brown.com/lessons/neural-networks/) | 시각적 설명 참고 | Manim 엔진의 MIT와 영상 콘텐츠 권리는 별개. [videos 저장소](https://github.com/3b1b/videos)의 콘텐츠는 CC BY-NC-SA 4.0. 웹사이트 개별 이미지의 권리 범위를 별도로 확인하지 못해 해당 파일은 복제하지 않음. 자체 ManimML 시각화 사용. |
| [Modern Robotics](https://modernrobotics.northwestern.edu/nu-gm-book-resource/) | 로보틱스 입문 후보 | Kevin M. Lynch · Frank C. Park 교재의 2·3·4·6·11장 개념을 참고해 로봇 모델 자료를 보강. 본문·원본 그림은 복제하지 않고 자체 두 링크 예제를 실행. [NxRLab 코드](https://github.com/NxRLab/ModernRobotics/blob/master/LICENSE)는 MIT이며 실제 `FKinSpace()` 실행에 사용하고 고지 유지. 무료 preprint 제공을 교재 번역·재배포 허가로 간주하지 않음. |
| [Robotics Book](https://www.roboticsbook.org/intro.html) | 센서·모델·계획을 연결하는 입문 후보 | 해당 사이트의 명시적 번역·재배포 조건을 확인하지 못해 링크 참고만 사용. |

원문 SHA와 라이선스 전문: `src/lib/education/generated/source-notices.json`, Spinning Up은 `spinningup-license.json`. 원본 RST/MDX는 `.local/research/`에 저장해 확인했다. MuJoCo/Hugging Face의 채택한 버전 트리에 NOTICE 파일은 없었다. 선택한 설명에 포함된 외부 링크의 논문·영상·게임 스크린샷 권리는 해당 저장소 라이선스로 간주하지 않았다.

교육 전체를 같은 라이선스로 묶지 않는다. CC BY 4.0은 해당 ROS 원문을 편집한 부분에, MIT/Apache는 각각 채택한 문서와 자산에 적용한다.

Manim 렌더링은 사용자 규칙에 따라 영문 전용, Lato 폰트 사용. `private/education-assets/deepml/fonts/OFL.txt`에 폰트 라이선스 보존. Python 3.12.13 / Manim 0.22.0 / ManimML 0.0.24 / modern-robotics 1.1.1. ManimML의 빈 animation group과 최신 Manim의 호환성 문제는 패키지 수정 없이 실제 connective layer의 순전파 함수를 사용하여 해결.

VLA/Gazebo 추가분은 공식 문서·연구 소개의 개념을 참고한 자체 설명·도식이며 외부 본문·이미지를 복제하지 않았다. VLA는 OpenVLA 연구 소개, LeRobot ACT·SmolVLA 공식 문서, Rainbow Robotics RB-Y1 SDK를 참고한다. Gazebo는 공식 ROS 호환 안내와 Harmonic 모델·센서·ROS 연결 튜토리얼을 연결한다. 원문 번역판이나 공식 인증 교육으로 표기하지 않는다. Gazebo·RB-Y1 실행 검증 없이 개념과 실행 경로만 제공한다.
