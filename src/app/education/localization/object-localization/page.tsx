import type { Metadata } from "next";
import Link from "next/link";
import { Lesson, Chapter, Check } from "@/components/education/lesson-primitives";
import { FlowDiagram } from "@/components/education/native-diagrams";
import { MaskDepthDiagram, ObjectMapDiagram } from "@/components/education/object-localization-diagrams";
import { CodeExample } from "@/components/education/code-example";
export const metadata: Metadata = { title: "Segmentation과 depth로 객체 localization 하기" };
const source="https://github.com/YenCho/ddonggae/blob/d85758c752e6cd3244e16d9ea4a3d2831da225b4";
export default function ObjectLocalizationLesson() { return <Lesson topic="Localization" topicPath="/education/localization" path="/education/localization/object-localization" title="Segmentation과 depth로 객체 localization 하기" intro="사진에서 물체를 찾은 다음, 그 물체가 로봇 앞 어디에 있는지 알아봅니다. Segmentation mask와 depth로 카메라 기준 관측점을 구하고, 촬영 당시 로봇 위치를 이용해 지도 좌표로 옮깁니다." repo="meroedu-localization">
  <Chapter id="task" title="1. 내가 어디 있는지와 물체가 어디 있는지는 다르다">
    <p>첫 자료의 LiDAR localization은 <strong>로봇의 지도 위치</strong>를 구했습니다. 이번 객체 localization은 <strong>카메라가 본 객체의 위치</strong>를 구합니다. 사진에서 사과를 찾았어도 화면의 오른쪽에 있다는 것만으로는 로봇이 얼마나 이동해야 하는지 알 수 없습니다.</p>
    <FlowDiagram title="사진의 물체를 지도 위 관측점으로" steps={[{title:"Segmentation",lines:["어떤 물체인가", "어느 픽셀인가"]},{title:"Depth + 카메라",lines:["픽셀의 깊이", "카메라 상대좌표"]},{title:"로봇 pose + 지도",lines:["장착 위치와 방향", "지도 좌표의 객체"]}]} caption="객체인식은 물체의 이름과 픽셀을, depth는 깊이를, 로봇 localization은 지도 기준 위치와 방향을 제공합니다."/>
    <p><Link href="/education/object-recognition/synthetic-data">객체인식 자료</Link>의 instance segmentation을 먼저 이해하면 좋습니다. 여기서 mask는 한 물체가 차지하는 픽셀 영역입니다. 사진 속 segmentation mask와 지도 위 object map은 서로 다른 결과입니다. Object map은 객체별 이름과 지도 좌표를 모아 둔 목록입니다.</p>
    <p>ddonggae는 두 카메라의 합쳐진 화면에서 물체를 인식하고, 원본 카메라 픽셀로 되돌아가 depth를 읽은 뒤 로봇 좌표와 지도 좌표로 변환했습니다. 이번에는 한 카메라 기준으로 이 geometry만 정리합니다.</p>
  </Chapter>
  <Chapter id="mask-depth" title="2. Mask와 depth를 같은 픽셀에 맞춘다">
    <p>RGB는 픽셀의 색을, depth는 픽셀 방향의 깊이를 저장합니다. 두 센서는 보는 위치나 해상도가 다를 수 있습니다. 따라서 RGB의 (u, v)로 depth를 읽으려면 depth를 RGB에 <strong>align</strong>해 같은 픽셀이 같은 광선을 가리키도록 해야 합니다. 배열 크기가 같다는 것만으로 정렬됐다고 판단할 수 없습니다.</p>
    <MaskDepthDiagram/>
    <p>ddonggae는 mask의 하단 대표 픽셀을 고르고 주변 패치의 depth 중앙값을 읽었습니다. 한 픽셀만 읽으면 경계의 빈 depth에 취약하기 때문입니다. 교육 코드는 mask 밖 배경을 제외하고, 0·NaN·무한대·범위 밖 depth도 버립니다. 쓸 수 있는 값이 부족하면 위치를 만들지 않습니다.</p>
    <CodeExample label="하단 대표 픽셀과 유효 depth · 정리한 교육 함수" code={`u, v = mask_bottom_pixel(mask)\ndepth_m = masked_depth_median(\n    depth, mask, u, v, scale_m=0.001\n)`}/>
    <p><code>scale_m</code>은 저장값 하나당 m입니다. 저장값이 mm이면 0.001, 이미 m이면 1.0입니다. RealSense에서는 장치가 제공하는 depth scale을 읽습니다. raw uint16이 언제나 mm 단위라고 가정하면 안 됩니다.</p>
    <Check><p>왜 box 가운데의 depth를 그냥 읽지 않을까요? Bounding box 안에는 배경이 섞일 수 있고, 물체 표면의 depth도 균일하지 않을 수 있습니다. Mask를 이용해 물체 쪽 측정을 고르되 경계의 혼합 depth도 확인해야 합니다.</p></Check>
  </Chapter>
  <Chapter id="projection" title="3. 픽셀 좌표에 깊이를 더해 카메라 좌표를 구한다">
    <p>픽셀 (u, v)와 depth Z를 알면, pinhole 카메라 모델로 3D 점을 구할 수 있습니다. <code>fx, fy</code>는 픽셀 단위 초점거리, <code>cx, cy</code>는 주점입니다. 이 네 값은 지금 사용하는 이미지에 대응하는 camera intrinsics에서 가져옵니다.</p>
    <CodeExample label="Rectified pinhole 이미지의 back-projection" code={`X = (u - cx) / fx * Z\nY = (v - cy) / fy * Z\n# camera optical: X 오른쪽, Y 아래, Z 앞쪽\ncamera_point = (X, Y, Z)`}/>
    <p>광축의 깊이 Z는 카메라에서 점까지의 직선 거리와 다릅니다. 화면 중심에서 멀어질수록 같은 Z라도 X/Y가 커집니다. 이미지 crop이나 resize를 했다면 intrinsics와 mask 좌표도 함께 바뀌어야 합니다. 첫 실습에서는 원본 이미지 해상도를 유지합니다.</p>
    <p>이 수식은 왜곡이 보정된 이미지와 그 intrinsics를 가정합니다. 왜곡이 남은 장치는 rectification을 하거나 카메라 SDK의 deprojection을 사용합니다. ddonggae의 stitch 화면은 여러 카메라를 합친 가상 이미지이므로, 그 픽셀에 한 카메라의 fx/fy를 바로 넣을 수 없습니다. 원본 카메라를 고르고 원본 픽셀로 되돌아가는 단계가 필요합니다.</p>
  </Chapter>
  <Chapter id="transform" title="4. 카메라 → 로봇 → 지도 순서로 옮긴다">
    <p>카메라는 로봇 중심에 있지 않을 수 있고 아래를 향해 기울어질 수도 있습니다. 카메라의 장착 위치와 회전인 <strong>extrinsics</strong>를 적용해야 로봇 기준 상대좌표가 됩니다. 그다음 로봇이 지도에서 바라보는 방향으로 회전시키고 로봇 위치를 더합니다.</p>
    <div className="education-table-wrap"><table><caption>코드에서 구분하는 좌표</caption><thead><tr><th>좌표</th><th>축과 단위</th><th>원점</th></tr></thead><tbody><tr><td>Image</td><td>u 오른쪽, v 아래 [pixel]</td><td>이미지 좌상단</td></tr><tr><td>Camera optical</td><td>x 오른쪽, y 아래, z 앞 [m]</td><td>카메라</td></tr><tr><td>Robot</td><td>x 앞, y 왼쪽, z 위 [m]</td><td>로봇 base</td></tr><tr><td>Map</td><td>고정 x/y, z 위 [m]</td><td>지도에 정한 원점</td></tr></tbody></table></div>
    <FlowDiagram title="같은 관측점, 서로 다른 좌표" steps={[{title:"Camera",lines:["intrinsics + depth", "카메라 기준 3D 점"]},{title:"Robot",lines:["카메라 장착 변환", "로봇 기준 상대좌표"]},{title:"Map",lines:["촬영 시각의 pose", "고정 원점의 좌표"]}]} caption="카메라→로봇은 장착 변환, 로봇→지도는 촬영 당시 로봇 pose입니다. 움직일 때는 그 관측 시각의 pose를 사용해야 합니다."/>
    <CodeExample label="로봇 상대좌표에서 지도 x/y로" code={`map_x = robot_x + math.cos(yaw) * x_forward - math.sin(yaw) * y_left\nmap_y = robot_y + math.sin(yaw) * x_forward + math.cos(yaw) * y_left`}/>
    <p>ddonggae 원본의 중간 표현은 오른쪽·앞쪽 좌표였습니다. 교육 코드에서는 ROS 관례에 맞춰 앞쪽·왼쪽·위쪽으로 이름과 부호를 함께 정리했습니다. 첫 예제는 카메라 yaw/roll이 정렬되고 아래쪽 pitch만 있다는 가정입니다. 일반적인 장착에는 전체 회전행렬과 이동벡터를 보정해야 합니다.</p>
    <ObjectMapDiagram/>
  </Chapter>
  <Chapter id="practice" title="5. 작은 입력으로 계산 흐름을 따라간다">
    <p>표준 라이브러리만 사용하는 Python 코드입니다. 카메라·ROS·GPU·모델 가중치 없이 작은 합성 mask와 depth를 만들어 geometry부터 실행합니다. 이미 clone했다면 저장소 루트에서 업데이트한 후 03 폴더로 이동하세요.</p>
    <CodeExample label="Localization 3번째 실습 · Python 3.10 이상" code={`git clone https://github.com/merosnurobotics/meroedu-localization.git\ncd meroedu-localization/lessons/03-object-localization\npython3 demo.py\ncat output/result.json\npython3 test_geometry.py`}/>
    <CodeExample label="실행한 합성 예제 결과 · 단위 m" code={`pixel_uv:      [11, 10]\ndepth_m:       1.5\ncamera_xyz_m:  [0.05625, 0.075, 1.5]\nrobot_xyz_m:   [1.62948, -0.05625, 0.13933]\nmap_xyz_m:     [0.55625, 1.12948, 0.13933]`}/>
    <p>이 예제의 로봇 pose는 (0.5, −0.5), yaw=90°입니다. 객체가 로봇 앞 약 1.63 m에 있으므로 지도에서는 위쪽에 놓입니다. 하단 표면을 대표하는 관측점이지, 물체 중심이나 정확한 바닥 접점, 실물 ground truth가 아닙니다. 실제 모델 예측 이미지로 설명한 값도 아닙니다.</p>
    <CodeExample label="핵심 흐름 · object_localizer.py" code={`u, v = mask_bottom_pixel(mask)\nz = masked_depth_median(depth, mask, u, v, depth_scale_m)\ncamera = back_project(u, v, z, intrinsics)\nrobot = camera_to_robot(camera, mount)\nmap_point = robot_to_map(robot, capture_pose)`}/>
    <p>예제 입력 형식은 <code>output/input.json</code>에 저장됩니다. 내 입력을 같은 형식으로 준비했다면 <code>python3 demo.py --input frame.json</code>으로 계산합니다. 여러 객체에 반복 적용해 이름과 지도 좌표를 모으면 간단한 object map이 됩니다.</p>
  </Chapter>
  <Chapter id="real-data" title="6. 실제 입력은 정렬·보정·시각부터 맞춘다">
    <p><strong>① 원본 RGB와 mask:</strong> 객체인식 강의에서 학습한 모델로 객체별 mask를 구하고, 원본 RGB의 픽셀 좌표로 맞춥니다. <strong>② aligned depth:</strong> SDK 또는 드라이버에서 depth를 RGB에 align합니다. Depth 이미지를 단순 resize하는 것으로 대신하지 않습니다.</p>
    <p><strong>③ 카메라와 장착 파라미터:</strong> 해당 해상도의 intrinsics, 실제 depth scale, 장착 위치·방향을 읽거나 측정합니다. 합성 예제의 값을 실물에 그대로 쓰지 않습니다. <strong>④ 촬영 당시 pose:</strong> RGB·depth·로봇 pose의 시각을 맞춥니다. 처음에는 로봇을 멈추고 줄자로 상대거리와 지도 좌표를 비교하세요. 이동 중에는 시간 동기화와 pose 보간이 필요합니다.</p>
    <Check><p>로봇을 제자리에서 회전했는데 같은 객체가 지도에서 함께 움직인다면? 촬영 시각의 yaw, 좌표 축의 부호, 카메라 장착 변환을 확인하세요. RGB는 현재인데 pose는 과거이면 수식이 맞아도 지도 위치가 틀어집니다.</p></Check>
    <p>ddonggae는 관측점을 경기장의 정해진 격자에 대응시키고 여러 관측의 투표를 모았습니다. 일반 환경에서는 객체가 그 격자에 있다는 보장이 없습니다. 먼저 연속 좌표를 확인한 뒤, 같은 객체의 반복 관측을 합치는 data association이나 환경에 맞는 map 표현을 다음 단계로 생각하세요.</p>
    <p><Link href="/education/localization/ros2-topics">앞의 ROS 2 자료</Link>와 연결하면 객체 관측점을 <code>PointStamped</code>처럼 시각·frame이 있는 메시지로 보낼 수 있습니다. 이름과 여러 객체를 함께 보내려면 별도 메시지 계약을 정해야 합니다. 이번 코드는 먼저 좌표 변환을 확인하는 실습입니다.</p>
  </Chapter>
  <footer className="education-sources"><h2>원본과 검증 범위</h2><p><a href={`${source}/perception/docs/pipeline.md#7-depth-back-projection-to-a-3d-target`}>ddonggae depth pipeline</a> · <a href={`${source}/mission/match_runner.py`}>원본 depth·좌표 변환 코드</a> · <a href="https://www.ros.org/reps/rep-0103.html">ROS 좌표 규약</a> · <a href="https://github.com/realsenseai/librealsense/blob/master/include/librealsense2/rsutil.h">RealSense deprojection API</a></p><p>카메라 축, 지도 회전·이동, 장착 pitch, 무효 depth와 배경 제외, 입력 계약, 전체 합성 흐름을 테스트했습니다. 새 실물 촬영·카메라 연결·모델 정확도 검증을 한 결과는 아닙니다. 원본 가중치·데이터·경기 제어 코드를 복사하지 않고 geometry를 정리했습니다.</p></footer>
</Lesson>; }
