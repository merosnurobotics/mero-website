import type { Metadata } from "next";
import { Lesson, Chapter, Check } from "@/components/education/lesson-primitives";
import { FlowDiagram } from "@/components/education/native-diagrams";
import { CodeExample } from "@/components/education/code-example";
export const metadata: Metadata = {title:"Python으로 publisher/subscriber 만들기"};
export default function Page() {return <Lesson topic="ROS" topicPath="/education/ros" path="/education/ros/python-pubsub" title="Python으로 publisher/subscriber 만들기" intro="Python class와 callback을 이해하고, 작은 Node 두 개를 package로 실행합니다. 코드의 각 부분을 실제 메시지 흐름과 연결해봅니다." repo="meroedu-ros">
<Chapter id="classes" title="1. Python class에 ROS Node의 기능을 가져온다">
<p>Class는 객체가 갖는 상태와 동작을 정의합니다. Instance는 그 class로 만든 실제 객체입니다. <code>self.count</code>는 해당 객체의 상태, <code>self.publish_message</code>는 그 객체의 함수입니다. 모든 객체가 같은 count를 공유하는 것은 아닙니다.</p>
<CodeExample label="Node를 상속하고 이름 붙이기" code={`class Talker(Node):
    def __init__(self):
        super().__init__('meroedu_talker')
        self.count = 0`}/>
<p><code>Talker(Node)</code>는 ROS Node를 상속합니다. <code>super().__init__</code>은 Node 초기화를 호출하고 node 이름을 등록합니다. 따라서 class 안에서 publisher와 timer를 만들 수 있습니다. 이번 예제는 Ubuntu 22.04 · Humble · 시스템 Python 3.10을 사용하며 실물 로봇이 필요하지 않습니다.</p>
</Chapter>
<Chapter id="publisher" title="2. Timer가 message를 만들어 발행한다">
<FlowDiagram title="Publisher callback이 실행되는 흐름" steps={[{title:"Timer",lines:["1.0초 간격", "Callback 예약"]},{title:"Message 생성",lines:["String()", "msg.data에 문자열"]},{title:"Publish",lines:["/meroedu/chatter", "Count 증가"]}]} caption="Timer는 callback을 예약합니다. 실제 처리는 spin/executor가 수행합니다."/>
<p><code>create_publisher(String, topic, 10)</code>으로 publisher를 만듭니다. <code>10</code>은 queue depth로, 모든 과거 메시지를 영구 저장한다는 뜻이 아닙니다. <code>create_timer</code>에는 실행할 함수 자체를 넘기며 뒤에 괄호를 붙여 즉시 호출하지 않습니다.</p>
<CodeExample label="talker.py · 완성 코드" code={"# Copyright 2016 Open Source Robotics Foundation, Inc.\n# Copyright 2026 MERO educational adaptations\n# SPDX-License-Identifier: Apache-2.0\nimport rclpy\nfrom rclpy.node import Node\nfrom std_msgs.msg import String\n\nclass Talker(Node):\n    def __init__(self):\n        super().__init__('meroedu_talker')\n        self.publisher = self.create_publisher(String, '/meroedu/chatter', 10)\n        self.count = 0\n        self.timer = self.create_timer(1.0, self.publish_message)\n\n    def publish_message(self):\n        msg = String()\n        msg.data = f'hello MERO {self.count}'\n        self.publisher.publish(msg)\n        self.get_logger().info('TX: '+msg.data)\n        self.count += 1\n\ndef main(args=None):\n    rclpy.init(args=args)\n    node = Talker()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok(): rclpy.shutdown()\n\nif __name__ == '__main__': main()\n"}/>
</Chapter>
<Chapter id="subscriber" title="3. 같은 type과 topic으로 수신 callback을 만든다">
<p><code>create_subscription</code>에 message type·topic·callback·queue depth를 넣습니다. Message가 도착하면 <code>receive(msg)</code>가 실행되고 <code>msg.data</code>를 읽습니다. Subscriber가 늦게 시작하면 기본 설정에서 과거 message를 전부 받지 않습니다.</p>
<CodeExample label="listener.py · 완성 코드" code={"# Copyright 2016 Open Source Robotics Foundation, Inc.\n# Copyright 2026 MERO educational adaptations\n# SPDX-License-Identifier: Apache-2.0\nimport rclpy\nfrom rclpy.node import Node\nfrom std_msgs.msg import String\n\nclass Listener(Node):\n    def __init__(self):\n        super().__init__('meroedu_listener')\n        self.subscription = self.create_subscription(String, '/meroedu/chatter', self.receive, 10)\n\n    def receive(self, msg):\n        self.get_logger().info('RX: '+msg.data)\n\ndef main(args=None):\n    rclpy.init(args=args)\n    node = Listener()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok(): rclpy.shutdown()\n\nif __name__ == '__main__': main()\n"}/>
</Chapter>
<Chapter id="lifecycle" title="4. Spin은 timer와 수신 callback을 처리한다">
<FlowDiagram title="Node의 시작부터 종료까지" steps={[{title:"init + 생성",lines:["ROS context 준비", "Node instance 생성"]},{title:"spin",lines:["Timer / 수신 callback", "이벤트 처리"]},{title:"finally",lines:["destroy_node()", "shutdown()"]}]} caption="Ctrl+C로 빠져나오면 정리합니다. Callback 안에서 강제로 process를 종료하지 않습니다."/>
<p><code>rclpy.init</code>만 호출하고 끝내면 callback이 지속적으로 처리되지 않습니다. <code>spin</code>이 이벤트를 처리하도록 유지해야 합니다. 긴 연산이나 sleep을 callback에 넣으면 다른 callback이 지연될 수 있습니다. 첫 예제는 짧은 메시지 생성과 출력만 합니다.</p>
</Chapter>
<Chapter id="package" title="5. Package를 build해서 ros2 run으로 실행한다">
<p><a href="https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Publisher-And-Subscriber.html">공식 Python publisher/subscriber tutorial</a>과 <a href="https://github.com/ros2/examples/tree/humble/rclpy/topics">ROS 2 rclpy examples</a>를 함께 볼 수 있습니다. Topic 이름과 실행 항목을 교육 저장소에 맞게 정리하고 Ctrl+C 정리를 추가했습니다.</p><p>완성된 ament_python package는 교육 저장소에 있습니다. <code>package.xml</code>은 rclpy/std_msgs 의존성, <code>setup.py</code>는 talker/listener 실행 entry point, <code>setup.cfg</code>는 ros2 run이 찾는 설치 경로를 담습니다. Code만 쓰는 것과 실행 항목을 등록하는 것은 별개입니다.</p>
<CodeExample label="Clone · build · overlay 준비" code={`git clone https://github.com/merosnurobotics/meroedu-ros.git
cd meroedu-ros/lessons/02-python-pubsub/ros_ws
source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
colcon build --symlink-install --packages-select meroedu_ros_basics
source install/setup.bash
ros2 pkg executables meroedu_ros_basics`}/>
<p>기존 ROS 설치가 underlay, 이번 workspace가 overlay입니다. 두 setup을 순서대로 source하면 새 package를 찾습니다. colcon은 <code>ros_ws</code>에서 실행하세요. build/install/log는 생성물이므로 저장소에 올리지 않습니다.</p>
</Chapter>
<Chapter id="run" title="6. 세 터미널에서 직접 메시지를 주고받는다">
<CodeExample label="터미널 A · 준비된 ros_ws" code="ros2 run meroedu_ros_basics talker"/>
<CodeExample label="터미널 B · 같은 ros_ws에서 listener 실행" code={`source /opt/ros/humble/setup.bash
source install/setup.bash
export ROS_DOMAIN_ID=42
ros2 run meroedu_ros_basics listener`}/>
<CodeExample label="터미널 C · CLI로 내용 확인" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 topic echo /meroedu/chatter std_msgs/msg/String`}/>
<p>A에는 <code>TX: hello MERO 0, 1, 2…</code>, B에는 <code>RX: hello MERO …</code>가 나옵니다. 늦게 켠 B의 첫 count가 0이 아니어도 정상입니다. 종료는 Ctrl+C입니다.</p>
<p>Timer를 1.0→0.5로 바꾸고 다시 실행해 주기를 확인해보세요. Python 파일은 symlink-install이라 재실행으로 반영됩니다. 실행 중인 node가 자동 변경되지는 않습니다. Entry point나 package 설정을 바꾸면 다시 build하고 overlay를 source합니다.</p>
<Check><p>Talker의 topic만 바꾸면 listener가 계속 받을까요? 둘이 같은 topic을 사용해야 합니다. 이름을 맞추거나 두 실행 명령에 같은 remap을 적용하세요.</p></Check>
<p><a href="/education/ros/bag-rviz">rosbag과 RViz</a>로 데이터를 기록·표시한 다음, <a href="/education/ros/arduino-motor">Arduino motor 제어</a>와 <a href="/education/ros/dynamixel">DYNAMIXEL 제어</a>로 이어갈 수 있습니다.</p>
</Chapter>
<footer className="education-sources"><h2>참고 자료와 실습 코드</h2><p>제공된 「기계시스템설계 · 로봇프로그래밍 기초 ROS」 강의 PDF의 개념과 교육 흐름을 참고해 Humble 환경과 독립 실행 예제로 재구성했습니다. 슬라이드 이미지를 붙이는 대신 사이트 테마에 맞는 HTML 도식으로 정리했습니다.</p><p><a href="https://github.com/merosnurobotics/meroedu-ros">실습 저장소</a> · <a href="https://github.com/merosnurobotics/meroedu-ros/blob/main/NOTICE.md">참고한 페이지·재구성·라이선스</a> · <a href="https://docs.ros.org/en/humble/Tutorials.html">ROS 2 Humble 공식 tutorial</a></p></footer></Lesson>; }
