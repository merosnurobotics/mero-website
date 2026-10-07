import { FlowDiagram, LidarDiagram } from "@/components/education/native-diagrams";
import Link from "next/link";
import type { Metadata } from "next";
import { Lesson, Chapter, Check } from "@/components/education/lesson-primitives";
import { CodeExample } from "@/components/education/code-example";
export const metadata: Metadata = {title:"LiDAR로 시작하는 localization"};
const a="/education-assets/localization";
export default function LidarLesson() { return <Lesson topic="Localization" topicPath="/education/localization" path="/education/localization/lidar" title="LiDAR로 시작하는 localization" intro="로봇이 지금 어디에 있는지 어떻게 알아낼까요? LiDAR가 보내는 거리와 각도를 이해하고, 이미 알고 있는 사각형 벽과 비교해 위치를 찾습니다. 센서가 없어도 작은 Python 실습부터 시작할 수 있습니다." repo="meroedu-localization">
  <Chapter id="sensor" title="1. LiDAR는 사진 대신 거리를 보낸다">
    <p>LiDAR는 빛을 쏘아 주변 물체까지의 거리를 측정하는 센서입니다. 여기서는 수평면을 한 바퀴 훑는 2D LiDAR를 다룹니다. 카메라처럼 색상을 보내는 대신, 방향마다 얼마나 멀리서 반사되었는지 알려줍니다. 사람이나 벽을 만나는 가장 가까운 표면의 거리이지, 그 뒤에 숨은 벽의 거리는 아닙니다.</p>
    <p>한 번의 scan은 여러 쌍의 <code>(angle, range)</code>입니다. 정면 0°에서 1.5 m, 왼쪽 90°에서 2 m처럼 생각하면 됩니다. 센서의 정면이 로봇의 정면과 일치하는지는 장착 방향을 보고 확인해야 합니다. ROS의 LaserScan은 시작 각도, 각도 간격, 거리 배열과 유효 거리 범위를 함께 보냅니다.</p>
    <LidarDiagram kind="scan"/>
    <Check><p>한 방향에서 0.8 m가 나왔다고 로봇의 위치를 바로 알 수 있을까요? 아닙니다. 어느 벽을 보고 있는지와 로봇의 방향을 함께 알아야 합니다.</p></Check>
  </Chapter>
  <Chapter id="coordinates" title="2. 센서 좌표와 지도 좌표를 구분한다">
    <p>센서 좌표는 센서 자신이 원점입니다. 거리 r, 각도 θ를 점으로 바꾸면 <code>x = r cos θ</code>, <code>y = r sin θ</code>입니다. 로봇이 움직여도 센서는 항상 자기 앞을 0°로 봅니다. 지도 좌표는 방 안에 고정된 원점에서 측정합니다.</p>
    <CodeExample label="거리와 각도를 지도 위 점으로 바꾸기" code={`# yaw: 지도 기준 로봇 방향 [rad]\n# x, y: 지도 기준 센서 위치 [m]\npoint_x = x + r * math.cos(yaw + angle)\npoint_y = y + r * math.sin(yaw + angle)`}/>
    <p>이 식은 센서가 로봇 중심에 있고 두 정면이 일치한다는 첫 실습의 가정입니다. 실제 센서가 중심에서 5 cm 앞에 있다면 그 오프셋도 회전시켜 더해야 합니다. 처음에는 센서를 고정하고 정면·왼쪽·오른쪽 벽까지 거리를 줄자로 재면서 축과 부호부터 맞추세요.</p>
    <p>이번 실습의 방은 x, y가 각각 −2 m부터 +2 m까지인 4 × 4 m 사각형입니다. 위치는 m, 각도는 rad를 사용합니다. 각도 90°는 π/2 rad입니다. 단위를 한 가지로 통일해야 코드에서 숫자를 그대로 더하고 비교할 수 있습니다.</p>
  </Chapter>
  <Chapter id="matching" title="3. 이 위치라면 벽까지 몇 m일까?">
    <p>위치를 찾는 방법은 다음과 같습니다. 방의 벽 위치를 알고 있으니, 로봇이 후보 위치에 있다고 가정했을 때 각 광선이 벽에 닿는 거리를 계산합니다. 그리고 실제 측정 거리와 비교합니다. 잘 맞는 후보가 현재 위치의 추정값입니다. 지도를 새로 만드는 SLAM과 달리, 이미 주어진 지도를 이용하는 localization입니다.</p>
    <FlowDiagram title="LiDAR scan으로 위치 찾기" steps={[{title:"LiDAR scan",lines:["각도와 거리", "측정값"]},{title:"후보 위치",lines:["알려진 사각 벽", "예상 거리"]},{title:"거리 비교",lines:["오차 점수", "가장 잘 맞는 x, y"]}]} note="첫 실습: 방향 yaw를 알고 있다고 가정하고 x, y만 찾습니다." caption="scan → 후보별 예상 거리 → 오차 점수 → 위치 추정. 센서가 없어도 합성 scan으로 시작할 수 있습니다."/>
    <p>예를 들어 로봇이 (0.5, 0)에 있고 동쪽을 바라보면 동쪽 벽 x=2까지 1.5 m입니다. 대각선 광선은 x 벽 또는 y 벽 중 먼저 닿는 것을 선택합니다. 구현에서는 각 축의 교차 거리 중 양수인 최소값을 구합니다.</p>
    <CodeExample label="동쪽 벽까지 예상 거리" code={`# cos(theta) > 0인 광선\ndistance_to_east_wall = (xmax - x) / math.cos(theta)\n# 실제 코드는 동/서/남/북 중 광선이 먼저 만나는 벽을 선택합니다.`}/>
    <p>측정과 예상의 차이를 절댓값으로 계산하고, 너무 큰 값은 0.35 m로 제한합니다. 큰 오차 상위 30%를 제외한 평균으로 점수를 매깁니다. 잘못된 측정 몇 개가 전체를 압도하지 않게 하는 방법입니다. 사용할 수 있는 측정이 8개보다 적으면 위치를 갱신하지 않습니다. 이 숫자들은 실습을 위한 시작값이며 센서와 방에 맞게 확인해야 합니다.</p>
    <LidarDiagram kind="score"/>
  </Chapter>
  <Chapter id="practice" title="4. 센서 없이 경량 코드부터 실행한다">
    <p>실습 저장소에는 벽 거리 계산·오차 점수·x/y 탐색을 수행하는 Python 코드와 합성 scan 실행 예제가 있습니다. 표준 라이브러리만 사용하므로 LiDAR, ROS, GPU가 없어도 실행됩니다. Python 3.10 이상과 Git을 준비하세요.</p>
    <CodeExample label="LiDAR 첫 실습 · 로컬 컴퓨터" code={`git clone https://github.com/merosnurobotics/meroedu-localization.git\ncd meroedu-localization/lessons/01-lidar\npython3 demo.py --output output\ncat output/result.json`}/>
    <p><code>scan.csv</code>는 코드가 만든 48개 방향의 합성 측정입니다. 실제 센서 기록이 아닙니다. 정답 위치 (0.63, −0.47)에서 scan을 만들고, 알고 있는 초기 yaw=0.35 rad를 입력해 위치를 찾습니다. 정답 좌표 자체는 탐색 함수에 전달하지 않습니다.</p>
    <CodeExample label="실제로 실행한 합성 실습 결과" code={`truth:    x=0.6300, y=-0.4700, yaw=0.3500\nestimate: x=0.6281, y=-0.4688, yaw=0.3500\nposition_error_m: 0.00225\nscore_m: 0.00397`}/>
    <p>작은 오차는 이 단순한 합성 예제의 결과입니다. 실제 로봇의 정확도를 의미하지 않습니다. 정답을 바꾸거나 거리 잡음을 키운 뒤 다시 실행해보세요. 초기 yaw를 일부러 10° 틀리게 주면 위치가 어떻게 바뀌는지도 비교해보면 좋습니다.</p>
    <Check><p>위치 탐색이 사용하는 값은 scan, 벽 범위, 초기 방향입니다. <code>truth.x</code>와 <code>truth.y</code>는 scan을 만들고 마지막 오차를 확인할 때만 사용합니다.</p></Check>
  </Chapter>
  <Chapter id="robot" title="5. 실제 LiDAR에 연결할 때 바뀌는 부분">
    <p>실제로는 합성 scan을 만드는 부분을 드라이버의 LaserScan 입력으로 바꾸면 됩니다. Scan에는 방향별 거리와 각도 간격이 들어 있습니다. 유효 거리만 골라 같은 계산 함수에 넣습니다. 먼저 센서 드라이버만 실행해 scan이 나오는지 확인한 다음 위치 계산을 붙이세요.</p>
    <CodeExample label="LaserScan에서 교육 코드 입력 만들기" code={`beams = []\nfor i, distance in enumerate(msg.ranges):\n    if math.isfinite(distance) and msg.range_min < distance < msg.range_max:\n        angle = msg.angle_min + i * msg.angle_increment\n        beams.append((angle, distance))\n# 센서가 고정되고 초기 방향을 알고 있는 상태에서\npose, score_m = grid_search(beams, known_initial_yaw)`}/>
    <p>벽이 가려지지 않는 사각형 환경에서 먼저 확인합니다. 실습 matcher는 짧게 돌아온 광선을 정상적인 가림으로 무시하지 않고 오차로 계산합니다. 사람이나 높은 물체가 scan 높이를 가로막는 일반 환경에는 그대로 적용할 수 없습니다. 지도 형태가 복잡해지면 occupancy map 기반 scan matching 같은 다른 방법이 필요합니다.</p>
    <p>scan이 늦으면 과거 위치를 계속 사용하는 문제가 생깁니다. 가장 최근 scan을 우선 처리하고, 일정 시간 입력이 없으면 이동을 멈추는 구성이 필요합니다. 이 교육 실습은 위치 계산을 이해하는 단계이며 로봇을 자동으로 구동하는 코드는 포함하지 않습니다.</p>
  </Chapter>
  <Chapter id="discussion" title="6. 심화 discussion: 방향은 어떻게 알 수 있을까?">
    <LidarDiagram kind="symmetry"/>
    <p>첫 실습은 로봇이 처음 정해둔 방향을 유지한다고 가정합니다. 로봇을 회전시키려면 이 가정을 확장해야 합니다. 시작 방향을 정한 뒤 wheel odometry 또는 IMU로 방향의 변화량을 추정하고, LiDAR의 위치 비교에 그 방향을 넣는 방법을 생각할 수 있습니다.</p>
    <p>IMU의 gyro는 회전 속도를 측정합니다. 짧은 시간 동안의 회전 속도 × 시간 간격을 더하면 방향의 변화량을 얻습니다. 누적 오차가 생기므로 신뢰할 수 있는 지도 관측이나 다른 센서로 주기적으로 보완하는 접근이 필요합니다. 여기서는 결합의 역할만 설명하고 센서 장착·축 보정·필터 구현은 다루지 않습니다.</p>
    <Check><p>토론: 시작 방향을 잘못 입력했다면 어떤 결과가 나올까요? 벽을 하나 다른 모양으로 만들거나 비대칭 landmark를 추가하면 방향의 모호함을 줄일 수 있을까요?</p></Check>
  </Chapter>
  <p>다음 자료: <Link href="/education/ros/localization-topics">ROS 2 토픽으로 내보내기</Link>에서 이 위치 계산을 node로 연결합니다.</p>
  <footer className="education-sources"><h2>참고 자료와 실행 확인</h2><p><a href="https://docs.ros.org/en/rolling/p/sensor_msgs/msg/LaserScan.html">ROS LaserScan 정의</a> · <a href="https://github.com/merosnurobotics/meroedu-localization/tree/main/lessons/01-lidar">실습 코드와 실행 안내</a></p><p>합성 실습은 실행 확인했으며 실제 LiDAR 연결은 이 자료 작성 과정에서 새로 검증하지 않았습니다. 코드 출처와 사용 조건은 <a href={`${a}/NOTICE.md`}>출처·라이선스 기록</a>에 정리했습니다.</p></footer>
</Lesson>; }
