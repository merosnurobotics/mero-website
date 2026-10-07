"use client";
import Link from "next/link";
import { useState } from "react";
import { BookOpen, DownloadSimple, GearSix, QrCode, TerminalWindow, WarningCircle } from "./icons";
import { CodeBlock } from "./code-block";
import { QRPanel } from "./qr-panel";
import { connectionConfigured, shellQuote, sshAlias, sshCommand, sshConfig } from "@/lib/ssh";
import type { Robot } from "@/lib/types";

const tabs = [{ id: "connect", label: "접속하기", icon: TerminalWindow }, { id: "manual", label: "제어 안내", icon: BookOpen }, { id: "qr", label: "QR 코드", icon: QrCode }];
export function RobotGuide({ robot, admin, baseUrl }: { robot: Robot; admin: boolean; baseUrl?: string }) {
  const [tab, setTab] = useState("connect");
  return <><div className="robot-tabs" role="tablist" aria-label="로봇 운용 안내">{tabs.map((item, index) => <button key={item.id} id={`robot-tab-${item.id}`} role="tab" aria-selected={tab === item.id} aria-controls={`robot-panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); const next = tabs[(index + (event.key === "ArrowRight" ? 1 : 2)) % tabs.length]; setTab(next.id); document.getElementById(`robot-tab-${next.id}`)?.focus(); } }}><item.icon size={19}/>{item.label}</button>)}</div>
    <div className="robot-tab-panel" role="tabpanel" id={`robot-panel-${tab}`} aria-labelledby={`robot-tab-${tab}`} tabIndex={0}>
      {tab === "connect" && (connectionConfigured(robot) ? <>
        {robot.network_note && <div className="info-notice"><TerminalWindow size={21}/><p style={{ whiteSpace: "pre-wrap" }}>{robot.network_note}</p></div>}
        <div className="connection-grid"><section className="guide-card"><h3>터미널에서 바로 연결.</h3><p>장비 네트워크에 연결한 후 명령어를 복사해 실행하세요. macOS·Linux 또는 OpenSSH가 설치된 Windows 터미널에서 사용할 수 있습니다.</p><CodeBlock code={sshCommand(robot)} label="SSH 접속"/><p className="guide-small-note">SSH 인증은 장비에 등록된 키 또는 장비 계정으로 진행합니다. 웹사이트 로그인과 장비 인증은 별도입니다.</p>{robot.workdir && <CodeBlock code={`cd -- ${shellQuote(robot.workdir)}`} label="프로젝트 폴더로 이동"/>}</section>
          <section className="guide-card"><h3>다음부터는 더 간단하게.</h3><p>SSH 설정 스크립트를 내려받아 내용을 확인한 뒤 실행하세요. 기존 설정을 백업하고 이 로봇의 설정 블록만 갱신합니다.</p><a className="button button-outline" href={`/api/robots/${robot.id}/setup.sh`} download><DownloadSimple size={17}/>SSH 설정 스크립트</a><CodeBlock code={`sh ~/Downloads/${robot.id}-setup-ssh.sh\nssh ${sshAlias(robot)}`} label="macOS / Linux 설정과 연결"/><p className="guide-small-note">Windows에서는 아래 SSH 설정 블록을 사용자 폴더의 .ssh/config 파일에 추가한 후 같은 별칭으로 접속하세요.</p><details style={{ marginTop: 15 }}><summary style={{ fontSize: 12, cursor: "pointer" }}>SSH 설정 블록 보기</summary><CodeBlock code={sshConfig(robot)} label="SSH config"/><a className="text-link" href={`/api/robots/${robot.id}/ssh-config`} download style={{ fontSize: 11, marginTop: 15 }}><DownloadSimple size={15}/>설정 파일 다운로드</a></details></section></div>
      </> : <div className="empty-state"><TerminalWindow size={36}/><h3>접속 정보를 준비하고 있습니다.</h3><p>담당 팀이 SSH 주소와 장비 사용자 이름을 등록하면 접속 명령어와 자동 설정 파일이 여기에 표시됩니다.</p>{admin && <Link className="text-link" href={`/admin?edit=${robot.id}`}><GearSix size={18}/>접속 정보 등록하기</Link>}</div>)}
      {tab === "manual" && <>
        {robot.status === "maintenance" && <div className="info-notice"><WarningCircle size={21}/><p>현재 점검 중인 장비입니다. 사용 재개 여부를 담당 팀에게 확인해 주세요.</p></div>}
        {robot.guide.map((section, index) => <section className="manual-section" key={index}><h3>{section.title}</h3><p>{section.body}</p>{section.command && <CodeBlock code={section.command} label={section.title}/>}</section>)}
        <div className="connection-grid"><section className="guide-card"><h3>제어 시작</h3>{robot.launch_command ? <CodeBlock code={robot.launch_command} label="로봇 제어 실행"/> : <p>담당 팀이 실제 장비에서 확인한 실행 명령을 등록하면 여기에 표시됩니다.</p>}</section><section className="guide-card"><h3>제어 종료</h3>{robot.stop_command ? <CodeBlock code={robot.stop_command} label="로봇 제어 종료"/> : <p>종료 명령과 장비의 정지 절차는 담당 팀이 확인 후 등록합니다.</p>}</section></div>{admin && <p style={{ marginTop: 25 }}><Link href={`/admin?edit=${robot.id}`} className="text-link"><GearSix size={18}/>운용 설명서 수정하기</Link></p>}
      </>}
      {tab === "qr" && <QRPanel id={robot.id} name={robot.name} baseUrl={baseUrl}/>}
    </div>
  </>;
}
