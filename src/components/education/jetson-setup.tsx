import { CodeExample } from "@/components/education/code-example";
export function JetsonSetup() { return <>
  <h3>수업 전에 Jetson을 준비합니다</h3>
  <p>실습 기준은 <strong>Jetson Orin Nano 8GB · JetPack 6 · Ubuntu 22.04 · ROS 2 Humble · 시스템 Python 3.10</strong>입니다. 사용 이력이 있는 환경을 바탕으로 필요한 의존성만 정리했습니다. JetPack의 특정 minor 버전은 고정하지 않습니다. Camera·CUDA·학습 프레임워크는 이 제어 실습에 필요하지 않습니다.</p>
  <p>처음 사용하는 Jetson은 <a href="https://developer.nvidia.com/embedded/jetpack">JetPack 설치</a>와 <a href="https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html">ROS 2 Humble Ubuntu deb 설치</a>를 수업 전에 완료하세요. Ubuntu 22.04에 <code>ros-humble-ros-base</code>를 설치한 뒤 아래 의존성을 준비합니다.</p>
  <CodeExample label="Jetson · 의존성과 USB 권한" code={`sudo apt update
sudo apt install python3-serial ros-humble-geometry-msgs ros-humble-std-msgs
sudo usermod -aG dialout "$USER"
# 로그아웃 후 다시 로그인합니다.
source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
/usr/bin/python3 -c 'import serial, rclpy; print("ready")'
ls -l /dev/serial/by-id/`}/>
  <p>모든 ROS 터미널에서 같은 setup과 domain 번호를 사용합니다. 여러 팀이 같은 네트워크에서 실습하면 팀마다 다른 번호를 정하세요. <code>/usr/bin/python3</code>로 실행하면 apt로 설치한 ROS 모듈을 그대로 사용합니다.</p>
  <p>Arduino와 OpenRB는 하나씩 연결해 실제 USB 이름을 확인하세요. <code>/dev/ttyACM0</code>은 연결 순서에 따라 달라집니다. 실습 명령의 <code>PORT</code>는 실제 <code>/dev/serial/by-id/…</code> 경로로 바꿉니다. Serial monitor·Wizard·console·ROS bridge 중 하나만 같은 port를 열게 합니다.</p>
  <p><a href="https://github.com/merosnurobotics/meroedu-control/blob/main/setup/JETSON_SETUP.md">Jetson 준비 안내</a>와 저장소의 <code>bash setup/check_jetson.sh</code>로 환경을 점검할 수 있습니다. 점검 스크립트는 설치·업로드·모터 동작을 하지 않습니다.</p>
</>; }
