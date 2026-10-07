import type { Metadata } from "next";
import { Lesson, Chapter, Figure, Check } from "@/components/education/lesson-primitives";
import { CodeExample } from "@/components/education/code-example";
export const metadata: Metadata = {title:"원격 작업하기: SSH · Tailscale · RustDesk"};
const a="/education-assets/setup";
export default function RemoteWorkLesson() { return <Lesson topic="개발 환경 셋업" topicPath="/education/development-setup" path="/education/development-setup/remote-work" title="원격 작업하기: ssh jetson부터 GUI까지" intro="내 노트북의 터미널에서 Jetson의 코드를 실행하는 환경을 만듭니다. SSH 서버, Tailscale 로그인, SSH 키 등록과 접속 별칭을 순서대로 설정하고, 화면이 필요한 작업에는 RustDesk를 사용합니다." repo="meroedu-setup">
  <Chapter id="roles" title="1. 명령을 입력하는 컴퓨터와 실행하는 컴퓨터">
    <p>로컬 컴퓨터는 지금 키보드를 누르고 있는 노트북입니다. Jetson은 로봇에 달린 별도의 Linux 컴퓨터입니다. SSH로 접속하면 터미널 창은 노트북에 있지만 그 안의 명령은 Jetson에서 실행됩니다. 예를 들어 접속 후 <code>python3 train.py</code>를 실행하면 Jetson의 Python, 파일, CPU/GPU를 사용합니다.</p>
    <Figure src={`${a}/remote-network.svg`} alt="로컬 컴퓨터와 Jetson 사이의 Tailscale 네트워크, SSH 명령 실행과 RustDesk 화면 접속 관계" caption="SSH는 원격 명령과 파일 작업을, Tailscale은 장치 사이의 연결을, RustDesk는 원격 화면 조작을 담당합니다. 서로 역할이 다릅니다."/>
    <p>이번 실습의 원격 장치는 Ubuntu 기반 Jetson입니다. 로컬 명령은 Linux·macOS 터미널 기준으로 적고 Windows PowerShell 방법도 함께 안내합니다. Jetson에 처음 설정할 때는 모니터·키보드 또는 이미 가능한 접속 수단이 있어야 합니다. 이 자료는 본인에게 접속 권한이 있는 장치를 설정하는 과정입니다.</p>
    <div className="education-table-wrap"><table><thead><tr><th>어디서?</th><th>무엇을 설정?</th></tr></thead><tbody><tr><td>Jetson</td><td>SSH server, Tailscale, 공개키 등록, 필요하면 RustDesk</td></tr><tr><td>로컬 컴퓨터</td><td>SSH client, Tailscale, 개인키 생성, ~/.ssh/config 별칭</td></tr><tr><td>브라우저</td><td>Tailscale 로그인 및 같은 tailnet의 장치 확인</td></tr></tbody></table></div>
  </Chapter>
  <Chapter id="server" title="2. Jetson에서 SSH 서버를 준비한다">
    <p>Jetson에 로그인한 상태로 터미널을 열고 실행합니다. OpenSSH server는 다른 컴퓨터의 SSH 접속을 받아주는 프로그램입니다. <code>whoami</code>에 나오는 이름이 이후 SSH의 User입니다. 예제에서는 robot을 쓰지만 실제 장치의 계정 이름으로 바꾸세요.</p>
    <CodeExample label="Jetson에서 실행 · SSH server" code={`whoami\nhostname\nsudo apt update\nsudo apt install openssh-server\nsudo systemctl enable --now ssh\nsystemctl is-active ssh\n# active가 나오는지 확인`}/>
    <p>로컬 컴퓨터에서는 <code>ssh -V</code>로 client를 확인합니다. Linux에 없다면 <code>sudo apt install openssh-client</code>로 설치합니다. macOS에는 보통 기본으로 있고, Windows는 설정의 선택적 기능에서 OpenSSH Client를 설치한 뒤 PowerShell을 다시 엽니다.</p>
    <p>네트워크 연결과 서버 로그인은 서로 다른 단계입니다. Jetson의 전원과 인터넷 연결이 먼저 살아 있어야 하고, SSH 서버가 실행 중이어야 합니다. 원격에서 서버를 설정한다고 생각하기 전에 Jetson에서 위 확인 명령부터 실행하세요.</p>
  </Chapter>
  <Chapter id="tailscale" title="3. 두 컴퓨터에서 Tailscale에 로그인한다">
    <p>서로 다른 Wi-Fi에 있는 장치는 내부 주소만으로 바로 연결하기 어려울 수 있습니다. Tailscale은 장치들을 tailnet이라는 private network에 연결합니다. 허용된 장치의 Tailscale IP 또는 이름으로 접속할 수 있게 해주는 역할입니다.</p>
    <CodeExample label="Jetson과 Linux 로컬 컴퓨터 · 각각 실행" code={`curl -fsSL https://tailscale.com/install.sh -o /tmp/tailscale-install.sh\n# 공식 설치 스크립트를 확인한 뒤 실행\nless /tmp/tailscale-install.sh\nsh /tmp/tailscale-install.sh\nsudo tailscale up\n# 출력된 로그인 URL을 브라우저에서 열어 로그인\ntailscale status\ntailscale ip -4`}/>
    <p>Windows·macOS 로컬 컴퓨터는 <a href="https://tailscale.com/download">공식 앱</a>을 설치하고 메뉴에서 로그인합니다. Jetson과 로컬 컴퓨터가 같은 tailnet에 들어가도록 로그인하세요. 팀에서 운영하는 tailnet은 초대·장치 승인·접속 정책이 필요할 수 있습니다.</p>
    <p>Jetson의 <code>tailscale ip -4</code> 값을 기록합니다. 예제 IP <code>100.101.102.103</code>은 설명용이며 복사해서 사용할 실제 주소가 아닙니다. 로컬 컴퓨터에서 다음을 실행해 연결부터 확인합니다.</p>
    <CodeExample label="로컬 컴퓨터 · Jetson 연결 확인" code={`tailscale ping 100.101.102.103\nssh robot@100.101.102.103\n# IP와 robot을 실제 Jetson 값으로 바꾸세요.`}/>
    <p>이 자료는 <strong>일반 OpenSSH를 Tailscale 네트워크 위에서 사용하는 구성</strong>입니다. 별도 기능인 Tailscale SSH를 켜는 <code>tailscale up --ssh</code>는 사용하지 않습니다. Tailscale 로그인으로 네트워크를 연결한 다음 SSH 키로 Linux 계정에 로그인합니다.</p>
  </Chapter>
  <Chapter id="keys" title="4. 개인키는 로컬에, 공개키는 Jetson에">
    <Figure src={`${a}/ssh-keys.svg`} alt="로컬의 SSH 개인키와 Jetson authorized_keys에 복사한 공개키의 관계" caption="개인키는 로컬 컴퓨터에 남깁니다. Jetson에는 .pub 공개키만 등록합니다. Tailscale 로그인은 이 키 등록을 대신하지 않습니다."/>
    <CodeExample label="로컬 Linux·macOS · SSH 키 생성" code={`mkdir -p ~/.ssh\nchmod 700 ~/.ssh\nssh-keygen -t ed25519 -a 64 -f ~/.ssh/id_ed25519_jetson -C "mero-jetson"\n# 새 키를 보호할 passphrase 입력\n# 같은 파일이 이미 있다면 덮어쓰지 말고 기존 키를 확인\nls ~/.ssh/id_ed25519_jetson*`}/>
    <p>Passphrase는 개인키 파일을 보호합니다. SSH 계정 비밀번호와는 다릅니다. <code>id_ed25519_jetson</code>이 개인키이고, <code>id_ed25519_jetson.pub</code>이 공개키입니다. 개인키를 Git 저장소나 Jetson에 복사하지 않습니다.</p>
    <p>처음 Jetson에 접속할 때는 host key fingerprint를 확인합니다. Jetson의 로컬 터미널에서 아래 명령으로 표시한 SHA256 값을, 노트북이 접속할 때 보여주는 값과 비교하세요. Host key는 접속할 서버가 맞는지 확인하는 키이며 개인의 로그인 키와 역할이 다릅니다.</p>
    <CodeExample label="Jetson · 서버 fingerprint 확인" code={`sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`}/>
    <CodeExample label="로컬 Linux·macOS · 공개키 등록" code={`ssh-copy-id -i ~/.ssh/id_ed25519_jetson.pub robot@100.101.102.103\n# 처음에는 Jetson 계정 비밀번호로 공개키 등록\nssh -i ~/.ssh/id_ed25519_jetson robot@100.101.102.103`}/>
    <details className="education-recipe"><summary>Windows PowerShell에서는 이렇게 등록합니다</summary><CodeExample label="PowerShell · 키 생성과 공개키 등록" code={`New-Item -ItemType Directory -Force "$HOME/.ssh"\nssh-keygen -t ed25519 -a 64 -f "$HOME/.ssh/id_ed25519_jetson" -C "mero-jetson"\nGet-Content "$HOME/.ssh/id_ed25519_jetson.pub" | ssh robot@100.101.102.103 "umask 077; mkdir -p ~/.ssh; cat >> ~/.ssh/authorized_keys"\nssh -i "$HOME/.ssh/id_ed25519_jetson" robot@100.101.102.103`}/></details>
    <p>등록이 성공하면 서버 계정 비밀번호 대신 키로 인증합니다. 개인키의 passphrase 입력을 줄이려면 로컬의 ssh-agent에 키를 등록하세요. Linux·macOS는 <code>ssh-add ~/.ssh/id_ed25519_jetson</code>을 사용합니다. Agent가 없다면 현재 터미널에서 <code>eval &quot;$(ssh-agent -s)&quot;</code>로 시작합니다.</p>
    <Check><p>Tailscale IP로 연결되는데 Permission denied가 나온다면 어느 단계일까요? 네트워크가 아니라 Linux 계정 이름·공개키 등록·개인키 선택을 확인할 단계입니다.</p></Check>
  </Chapter>
  <Chapter id="alias" title="5. 이제 ssh jetson으로 접속한다">
    <p>로컬의 <code>~/.ssh/config</code>에 아래 내용을 <strong>추가</strong>합니다. 기존 파일을 통째로 덮어쓰지 않습니다. Host는 내가 붙이는 별칭이고, HostName은 실제 접속 주소입니다. User는 Jetson 계정, IdentityFile은 로컬의 개인키 경로입니다.</p>
    <CodeExample label="로컬 ~/.ssh/config · Jetson 별칭" code={`Host jetson\n    HostName 100.101.102.103\n    User robot\n    IdentityFile ~/.ssh/id_ed25519_jetson\n    IdentitiesOnly yes\n    ServerAliveInterval 30\n    ServerAliveCountMax 3`}/>
    <p>Linux·macOS는 <code>chmod 600 ~/.ssh/config</code>를 실행합니다. Windows는 <code>$HOME/.ssh/config</code>에 확장자 없이 저장합니다. 메모장이 <code>config.txt</code>로 저장하지 않았는지 확인하세요.</p>
    <Figure src={`${a}/ssh-alias.svg`} alt="ssh jetson 명령이 로컬 config의 주소 사용자 개인키 설정을 읽고 Jetson shell에 접속하는 도식" caption="긴 접속 명령이 별칭 하나로 정리됩니다. 설정 파일은 Jetson이 아니라 접속을 시작하는 로컬 컴퓨터에 둡니다."/>
    <CodeExample label="로컬 · 별칭 확인과 접속" code={`ssh -G jetson\n# hostname, user, identityfile이 의도한 값인지 확인\nssh jetson\n# 접속 후 아래 명령은 Jetson에서 실행됩니다.\nhostname\nwhoami\npwd\nexit`}/>
    <p>IP 대신 MagicDNS 이름을 HostName으로 넣는 것도 가능합니다. 먼저 그 이름으로 연결되는지 확인하세요. <code>jetson</code>이라는 별칭 자체는 DNS 이름이 아니므로, config가 없으면 이 자료의 방식으로 동작하지 않습니다.</p>
  </Chapter>
  <Chapter id="workflow" title="6. 파일을 옮기고 원격에서 작업한다">
    <CodeExample label="로컬 · 파일 복사와 SSH" code={`scp ./example.py jetson:~/example.py\nssh jetson\npython3 ~/example.py\n# Jetson의 파일을 내려받기: 로컬 터미널에서\n# scp jetson:~/result.csv ./result.csv`}/>
    <p>편집기는 로컬에 두고, VS Code Remote SSH로 같은 <code>jetson</code> 별칭을 선택해 원격 폴더를 열 수도 있습니다. 그 창의 터미널과 Python 환경이 어느 컴퓨터에 있는지 확인하세요. 로컬에 설치한 Python package가 Jetson에도 자동으로 설치되는 것은 아닙니다.</p>
    <p>접속이 끊겨도 계속할 작업은 Jetson의 tmux 세션 안에서 실행합니다. SSH의 keepalive는 연결 상태를 확인하는 기능이며 프로그램의 수명을 보장하지 않습니다.</p>
    <CodeExample label="Jetson · tmux 작업 세션" code={`sudo apt install tmux\ntmux new -s mero\n# 여기서 작업 명령을 실행\n# Ctrl-b를 누른 뒤 d: detach\n# 다음 접속 때\ntmux attach -t mero`}/>
    <p>교육 저장소에는 개인 주소와 키를 포함하지 않는 config 예제와 설정 점검 코드만 담았습니다. 다음 명령은 파일 예제를 읽고 SSH가 어떤 접속 설정으로 해석하는지 확인하며, 키 생성·설치·로그인을 자동으로 실행하지 않습니다.</p>
    <CodeExample label="로컬 · 설정 예제 확인" code={`git clone https://github.com/merosnurobotics/meroedu-setup.git\ncd meroedu-setup/lessons/01-remote-work\npython3 check_config.py ssh_config.example\n# 이후 예제의 IP와 User를 본인 값으로 수정해 ~/.ssh/config에 추가`}/>
  </Chapter>
  <Chapter id="gui" title="7. GUI가 필요한 작업에는 RustDesk">
    <Figure src={`${a}/remote-workflow.svg`} alt="로컬에서 SSH로 원격 터미널 작업을 하고 RustDesk로 Jetson GUI를 조작하는 두 경로" caption="명령과 파일은 SSH, 카메라 설정이나 RViz처럼 화면이 필요한 작업은 RustDesk로 나눠 생각하면 됩니다."/>
    <p>RustDesk는 원격 컴퓨터의 화면을 보고 마우스·키보드로 조작하는 프로그램입니다. 두 컴퓨터에 호환되는 앱을 설치하고 Jetson 화면에 표시된 ID로 접속한 뒤 연결 승인을 받거나 설정한 비밀번호로 인증합니다.</p>
    <Figure src={`${a}/rustdesk-client.png`} width={874} height={632} alt="RustDesk 공식 안내 화면의 내 ID와 일회용 비밀번호 및 상대 컴퓨터 ID 입력 영역" caption="공식 문서의 예시 화면입니다. 내 장치 ID와 접속할 상대 장치의 입력 칸을 구분하세요. 화면의 값은 우리 동아리 장치의 접속 정보가 아닙니다." credit={<><a href="https://rustdesk.com/docs/en/client/">RustDesk 공식 client 문서</a> · <a href={`${a}/RUSTDESK-LICENSE.txt`}>문서 저장소 MIT license</a></>}/>
    <p>Jetson은 보통 ARM64입니다. <code>uname -m</code>으로 확인하고, <a href="https://github.com/rustdesk/rustdesk/releases">공식 release</a>에서 현재 OS와 아키텍처에 맞는 배포본을 선택합니다. x86_64 노트북용 파일을 Jetson에 그대로 설치하면 안 됩니다. 그래픽 desktop이 실행되어야 하고, Linux의 Wayland·로그인 화면 제약은 <a href="https://rustdesk.com/docs/en/client/linux/">공식 Linux 안내</a>를 확인하세요.</p>
    <p>Tailscale을 통한 직접 IP 연결도 가능합니다. Jetson RustDesk에서 direct IP access를 허용하고, 로컬 앱에 Jetson의 Tailscale IP를 입력합니다. 접속 정책과 firewall이 필요한 연결을 허용해야 합니다. 자세한 설정은 <a href="https://tailscale.com/docs/solutions/access-remote-desktops-with-rustdesk">공식 Tailscale + RustDesk 안내</a>를 참고하세요.</p>
  </Chapter>
  <Chapter id="troubleshooting" title="8. 어디까지 성공했는지 나눠 확인한다">
    <div className="education-table-wrap"><table><thead><tr><th>증상</th><th>확인할 곳</th></tr></thead><tbody><tr><td>Tailscale ping 실패</td><td>두 장치 전원·인터넷·로그인·같은 tailnet·장치 승인과 정책</td></tr><tr><td>Connection refused</td><td>Jetson SSH server가 active인지, 실제 주소와 port가 맞는지</td></tr><tr><td>Connection timed out</td><td>도달 경로, 접속 정책, firewall, 서버 상태</td></tr><tr><td>Permission denied (publickey)</td><td>User 이름, .pub 등록, IdentityFile 경로와 파일 권한</td></tr><tr><td>IP로는 되는데 별칭은 실패</td><td>로컬 config 위치, Host 이름, config.txt 여부, ssh -G jetson 결과</td></tr><tr><td>Host key changed</td><td>장치 재설치·교체 여부를 확인하고 실제 fingerprint를 다시 비교</td></tr><tr><td>RustDesk 화면이 안 보임</td><td>desktop 실행 여부, display server 지원과 화면 접근 권한</td></tr></tbody></table></div>
    <CodeExample label="로컬 · 자세한 SSH 연결 로그" code={`ssh -v jetson\n# 로그를 공유하기 전 주소·계정·경로 등 개인 정보 확인`}/>
    <Check><p>최종 확인: <code>ssh jetson</code> → Jetson의 hostname 확인 → 파일 업로드와 실행 → <code>exit</code> 후 로컬 hostname 확인. 두 컴퓨터에서 명령이 실행되는 위치를 설명할 수 있으면 첫 원격 작업 준비가 끝났습니다.</p></Check>
  </Chapter>
  <footer className="education-sources"><h2>공식 설정 문서</h2><p><a href="https://man.openbsd.org/ssh-keygen">OpenSSH key generation</a> · <a href="https://man.openbsd.org/ssh_config">SSH client config</a> · <a href="https://tailscale.com/docs/install/linux">Tailscale Linux 설치</a> · <a href="https://tailscale.com/docs/reference/ssh-over-tailscale">OpenSSH over Tailscale</a> · <a href="https://rustdesk.com/docs/en/client/">RustDesk client</a></p><p>설정 예제는 SSH client로 해석을 확인했습니다. 이 자료를 작성하면서 실제 Jetson의 키·계정·네트워크 설정을 바꾸거나 신규 장치 로그인을 수행하지는 않았습니다. 도식은 역할 설명용이며 실제 장치 정보가 아닙니다. <a href={`${a}/NOTICE.md`}>이미지 출처</a></p></footer>
</Lesson>; }
