"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Dialog, Select, Table, Tabs, Theme } from "@radix-ui/themes";
import { ArrowUpRight, Check, MagnifyingGlass, PencilSimple, Plus, X } from "./icons";
import { QRPanel } from "./qr-panel";
import { StatusBadge } from "./shared";
import { useTheme } from "./theme-provider";
import { api } from "@/lib/client-api";
import { memberStatusLabels, projects, robotStatusLabels } from "@/lib/content";
import { connectionConfigured } from "@/lib/ssh";
import type { Member, MemberStatus, Robot, Role } from "@/lib/types";

type DashboardProps = { member: Member; initialMembers: Member[]; initialRobots: Robot[]; initialEdit?: string; baseUrl?: string };
export function AdminDashboard({ member, initialMembers, initialRobots, initialEdit, baseUrl }: DashboardProps) {
  const router = useRouter(); const { theme } = useTheme();
  const [members, setMembers] = useState(initialMembers); const [robots, setRobots] = useState(initialRobots);
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("all");
  const [editor, setEditor] = useState<Robot | "new" | null>(() => initialRobots.find(robot => robot.id === initialEdit) || null);
  const [feedback, setFeedback] = useState("");
  const query = search.trim().toLocaleLowerCase();
  const filtered = members.filter(item => (status === "all" || item.status === status) && `${item.name} ${item.email} ${item.department}`.toLocaleLowerCase().includes(query));
  function savedMember(updated: Member) {
    setMembers(current => current.map(item => item.id === updated.id ? updated : item));
    setFeedback(`${updated.name} 님의 회원 정보가 저장되었습니다.`); router.refresh();
  }
  function savedRobot(updated: Robot) {
    setRobots(current => current.some(item => item.id === updated.id) ? current.map(item => item.id === updated.id ? updated : item) : [...current, updated]);
    setEditor(null); setFeedback(`${updated.name} 정보가 저장되었습니다.`); router.refresh();
  }
  return <Theme appearance={theme} accentColor="blue" grayColor="slate" radius="medium" className="admin-shell">
    <div className="admin-summary">
      <div><span>승인 대기</span><strong>{members.filter(item => item.status === "pending").length}</strong></div>
      <div><span>활동 회원</span><strong>{members.filter(item => item.status === "active").length}</strong></div>
      <div><span>활동 관리자</span><strong>{members.filter(item => item.role === "admin" && item.status === "active").length}</strong></div>
      <div><span>등록된 로봇</span><strong>{robots.length}</strong></div>
    </div>
    {feedback && <p className="form-success admin-feedback" role="status">{feedback}</p>}
    <Tabs.Root defaultValue={initialEdit ? "robots" : "members"}>
      <Tabs.List aria-label="동아리 관리 메뉴"><Tabs.Trigger value="members">회원 관리</Tabs.Trigger><Tabs.Trigger value="robots">로봇 관리</Tabs.Trigger></Tabs.List>
      <Tabs.Content value="members">
        <div className="admin-toolbar"><label className="search-field"><MagnifyingGlass size={17}/><input aria-label="회원 검색" placeholder="이름, 이메일, 소속 검색" value={search} onChange={event => setSearch(event.target.value)}/></label><Select.Root value={status} onValueChange={setStatus}><Select.Trigger aria-label="회원 상태 필터"/><Select.Content position="popper"><Select.Item value="all">전체 회원</Select.Item>{Object.entries(memberStatusLabels).map(([value, label]) => <Select.Item key={value} value={value}>{label}</Select.Item>)}</Select.Content></Select.Root></div>
        <div className="admin-table"><Table.Root><Table.Header><Table.Row><Table.ColumnHeaderCell>회원</Table.ColumnHeaderCell><Table.ColumnHeaderCell>소속</Table.ColumnHeaderCell><Table.ColumnHeaderCell>가입일</Table.ColumnHeaderCell><Table.ColumnHeaderCell>권한</Table.ColumnHeaderCell><Table.ColumnHeaderCell>회원 상태</Table.ColumnHeaderCell><Table.ColumnHeaderCell>저장</Table.ColumnHeaderCell></Table.Row></Table.Header><Table.Body>{filtered.map(item => <MemberRow key={`${item.id}-${item.role}-${item.status}`} member={item} self={item.id === member.id} onSaved={savedMember}/>)}{filtered.length === 0 && <Table.Row><Table.Cell colSpan={6}><p className="admin-empty">조건에 맞는 회원이 없습니다.</p></Table.Cell></Table.Row>}</Table.Body></Table.Root></div><p className="admin-note">승인된 회원만 로봇 접속 정보와 제어 설명서를 열 수 있습니다. 이용 중지 시 기존 로그인 세션도 해제됩니다.</p>
      </Tabs.Content>
      <Tabs.Content value="robots">
        <div className="admin-toolbar"><p className="admin-note">로봇 ID는 QR 주소에 사용되며 생성 후에는 유지됩니다.</p><Button onClick={() => setEditor("new")}><Plus size={17}/>로봇 등록</Button></div>
        <div className="admin-table"><Table.Root><Table.Header><Table.Row><Table.ColumnHeaderCell>로봇</Table.ColumnHeaderCell><Table.ColumnHeaderCell>프로젝트</Table.ColumnHeaderCell><Table.ColumnHeaderCell>상태</Table.ColumnHeaderCell><Table.ColumnHeaderCell>접속 정보</Table.ColumnHeaderCell><Table.ColumnHeaderCell>관리</Table.ColumnHeaderCell></Table.Row></Table.Header><Table.Body>{robots.map(robot => <Table.Row key={robot.id}><Table.Cell><div className="admin-member-name">{robot.name}</div><div className="admin-member-email">{robot.id} · {robot.platform}</div></Table.Cell><Table.Cell>{projects.find(project => project.id === robot.project_id)?.title}</Table.Cell><Table.Cell><StatusBadge status={robot.status}/></Table.Cell><Table.Cell>{connectionConfigured(robot) ? "등록됨" : "등록 대기"}</Table.Cell><Table.Cell><div className="admin-row-actions"><Button size="1" variant="soft" onClick={() => setEditor(robot)} aria-label={`${robot.name} 편집`}><PencilSimple size={15}/>편집</Button><Link className="admin-view-link" href={`/robots/${robot.id}`} aria-label={`${robot.name} 안내 페이지`}><ArrowUpRight size={18}/></Link></div></Table.Cell></Table.Row>)}</Table.Body></Table.Root></div>
      </Tabs.Content>
    </Tabs.Root>
    <Dialog.Root open={editor !== null} onOpenChange={open => { if (!open) setEditor(null); }}><Dialog.Content maxWidth="840px" className="robot-editor">{editor !== null && <RobotEditor key={editor === "new" ? "new" : editor.id} initial={editor === "new" ? undefined : editor} baseUrl={baseUrl} onSaved={savedRobot} onClose={() => setEditor(null)}/>}</Dialog.Content></Dialog.Root>
  </Theme>;
}

function MemberRow({ member, self, onSaved }: { member: Member; self: boolean; onSaved: (member: Member) => void }) {
  const [role, setRole] = useState<Role>(member.role); const [status, setStatus] = useState<MemberStatus>(member.status);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const changed = role !== member.role || status !== member.status;
  async function save(approve = false) {
    setError(""); setBusy(true);
    try { const result = await api<{ member: Member }>(`/api/admin/members/${member.id}`, "PATCH", { role, status: approve ? "active" : status }); onSaved(result.member); }
    catch (err) { setError(err instanceof Error ? err.message : "회원 정보를 저장하지 못했습니다."); }
    finally { setBusy(false); }
  }
  return <Table.Row><Table.Cell><div className="admin-member-name">{member.name}{self ? " (나)" : ""}</div><div className="admin-member-email">{member.email}</div>{error && <p className="admin-row-error" role="alert">{error}</p>}</Table.Cell><Table.Cell>{member.department || "미입력"}</Table.Cell><Table.Cell>{new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul" }).format(new Date(member.created_at))}</Table.Cell><Table.Cell><Select.Root size="1" value={role} disabled={self || busy} onValueChange={value => { setRole(value as Role); if (value === "admin") setStatus("active"); }}><Select.Trigger aria-label={`${member.name} 권한`}/><Select.Content position="popper"><Select.Item value="member">회원</Select.Item><Select.Item value="admin">관리자</Select.Item></Select.Content></Select.Root></Table.Cell><Table.Cell><Select.Root size="1" value={status} disabled={self || busy} onValueChange={value => setStatus(value as MemberStatus)}><Select.Trigger aria-label={`${member.name} 상태`}/><Select.Content position="popper">{Object.entries(memberStatusLabels).map(([value,label]) => <Select.Item key={value} value={value} disabled={role === "admin" && value !== "active"}>{label}</Select.Item>)}</Select.Content></Select.Root></Table.Cell><Table.Cell><div className="admin-row-actions">{member.status === "pending" && !changed ? <Button size="1" onClick={() => save(true)} disabled={busy}><Check size={14}/>{busy ? "처리 중" : "승인"}</Button> : <Button size="1" variant="soft" disabled={!changed || busy || self} onClick={() => save()}>{busy ? "저장 중" : "저장"}</Button>}</div></Table.Cell></Table.Row>;
}

function emptyRobot(): Robot { return { id: "", name: "", platform: "", project_id: projects[0].id, status: "building", description: "", creators: [], start_date: "2026-2", end_date: "", hostname: "", ssh_user: "", ssh_port: 22, workdir: "", launch_command: "", stop_command: "", network_note: "", guide: [], updated_at: "" }; }
function RobotEditor({ initial, onSaved, onClose, baseUrl }: { initial?: Robot; onSaved: (robot: Robot) => void; onClose: () => void; baseUrl?: string }) {
  const [draft, setDraft] = useState<Robot>(() => initial || emptyRobot()); const [creators, setCreators] = useState(initial?.creators.join(", ") || "");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  function field(key: keyof Robot, value: string | number) { setDraft(current => ({ ...current, [key]: value })); }
  function guideField(index: number, key: "title" | "body" | "command", value: string) { setDraft(current => ({ ...current, guide: current.guide.map((section, i) => i === index ? { ...section, [key]: value } : section) })); }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const payload = { ...draft, creators: creators.split(/[,\n]/).map(name => name.trim()).filter(Boolean) };
      const result = await api<{ robot: Robot }>(initial ? `/api/admin/robots/${initial.id}` : "/api/admin/robots", initial ? "PATCH" : "POST", payload);
      onSaved(result.robot);
    } catch (err) { setError(err instanceof Error ? err.message : "로봇 정보를 저장하지 못했습니다."); }
    finally { setBusy(false); }
  }
  return <><div className="editor-title-row"><Dialog.Title>{initial ? `${initial.name} 정보 관리` : "새 로봇 등록"}</Dialog.Title><button className="icon-button" type="button" onClick={onClose} aria-label="편집 창 닫기"><X size={21}/></button></div><Dialog.Description size="2" mb="5">설명과 제작 정보를 공개하고, 접속 정보와 운용 설명서는 승인된 회원에게 제공합니다.</Dialog.Description><Tabs.Root defaultValue="information"><Tabs.List aria-label="로봇 편집 메뉴"><Tabs.Trigger value="information">정보 / 설명서</Tabs.Trigger><Tabs.Trigger value="qr" disabled={!initial}>QR 코드</Tabs.Trigger></Tabs.List><Tabs.Content value="information"><form onSubmit={save} className="robot-editor-form">
    <section className="editor-section"><h3>기본 정보</h3><div className="form-grid">
      <EditorField id="robot-id" label="로봇 ID" value={draft.id} onChange={value => field("id", value)} required disabled={Boolean(initial)} hint={initial ? "QR 주소 유지를 위해 ID는 변경할 수 없습니다." : "소문자, 숫자, 하이픈 3~40자. 예: microban-02"}/>
      <EditorField id="robot-name" label="로봇 이름" value={draft.name} onChange={value => field("name", value)} required/>
      <EditorField id="robot-platform" label="플랫폼 / 모델" value={draft.platform} onChange={value => field("platform", value)} required/>
      <div className="form-field"><label htmlFor="robot-project">연결 프로젝트</label><select id="robot-project" value={draft.project_id} onChange={event => field("project_id", event.target.value)}>{projects.map(project => <option key={project.id} value={project.id}>{project.title}</option>)}</select></div>
      <div className="form-field"><label htmlFor="robot-status">로봇 상태</label><select id="robot-status" value={draft.status} onChange={event => field("status", event.target.value)}>{Object.entries(robotStatusLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <EditorField id="robot-creators" label="제작 / 운영 팀" value={creators} onChange={setCreators} hint="여러 이름이나 팀은 쉼표로 구분해 주세요."/>
      <EditorField id="robot-start" label="시작 학기 / 날짜" value={draft.start_date} onChange={value => field("start_date", value)} placeholder="2026-2 또는 2026-09-01"/>
      <EditorField id="robot-end" label="종료 학기 / 날짜" value={draft.end_date} onChange={value => field("end_date", value)} placeholder="진행 중이면 비워 두세요."/>
      <EditorField id="robot-description" label="프로젝트 / 로봇 설명" value={draft.description} onChange={value => field("description", value)} textarea required full/>
    </div></section>
    <section className="editor-section"><h3>SSH 접속과 제어</h3><p className="admin-note editor-note">실제 장비에서 확인한 값을 등록해 주세요. SSH 비밀번호와 비밀키는 이 사이트에 저장하지 않습니다.</p><div className="form-grid">
      <EditorField id="robot-host" label="호스트 이름 / IP" value={draft.hostname} onChange={value => field("hostname", value)} placeholder="등록 전이면 비워 두세요."/>
      <EditorField id="robot-ssh-user" label="장비 사용자 이름" value={draft.ssh_user} onChange={value => field("ssh_user", value)}/>
      <div className="form-field"><label htmlFor="robot-port">SSH 포트</label><input id="robot-port" type="number" min="1" max="65535" required value={draft.ssh_port} onChange={event => field("ssh_port", Number(event.target.value))}/></div>
      <EditorField id="robot-workdir" label="장비의 프로젝트 폴더" value={draft.workdir} onChange={value => field("workdir", value)}/>
      <EditorField id="robot-network" label="네트워크 / 접속 안내" value={draft.network_note} onChange={value => field("network_note", value)} textarea full/>
      <EditorField id="robot-launch" label="제어 시작 명령어" value={draft.launch_command} onChange={value => field("launch_command", value)} textarea/>
      <EditorField id="robot-stop" label="제어 종료 명령어" value={draft.stop_command} onChange={value => field("stop_command", value)} textarea/>
    </div></section>
    <section className="editor-section"><h3>운용 설명서</h3>{draft.guide.map((section,index) => <div className="editor-guide" key={index}><div className="editor-guide-header"><span>설명서 {index + 1}</span><Button type="button" variant="ghost" size="1" onClick={() => setDraft(current => ({ ...current, guide: current.guide.filter((_,i) => i !== index) }))}>항목 삭제</Button></div><EditorField id={`guide-title-${index}`} label="제목" value={section.title} onChange={value => guideField(index,"title",value)} required/><EditorField id={`guide-body-${index}`} label="설명" value={section.body} onChange={value => guideField(index,"body",value)} textarea required/><EditorField id={`guide-command-${index}`} label="관련 명령어 (선택)" value={section.command || ""} onChange={value => guideField(index,"command",value)} textarea/></div>)}<Button type="button" variant="soft" disabled={draft.guide.length >= 16} onClick={() => setDraft(current => ({ ...current, guide: [...current.guide, { title: "", body: "", command: "" }] }))}><Plus size={16}/>설명서 항목 추가</Button></section>
    {error && <p className="form-error editor-error" role="alert">{error}</p>}<div className="editor-footer"><Button type="button" variant="soft" color="gray" onClick={onClose} disabled={busy}>취소</Button><Button type="submit" disabled={busy}>{busy ? "저장 중…" : "로봇 정보 저장"}</Button></div>
  </form></Tabs.Content><Tabs.Content value="qr">{initial && <div className="editor-qr"><QRPanel id={initial.id} name={initial.name} baseUrl={baseUrl}/></div>}</Tabs.Content></Tabs.Root></>;
}
function EditorField({ id, label, value, onChange, textarea, required, disabled, full, hint, placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; textarea?: boolean; required?: boolean; disabled?: boolean; full?: boolean; hint?: string; placeholder?: string }) {
  const props = { id, value, required, disabled, placeholder, "aria-describedby": hint ? `${id}-hint` : undefined, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value) };
  return <div className={`form-field ${full ? "full-width" : ""}`}><label htmlFor={id}>{label}</label>{textarea ? <textarea {...props} rows={3}/> : <input {...props} type="text"/>}{hint && <small id={`${id}-hint`}>{hint}</small>}</div>;
}
