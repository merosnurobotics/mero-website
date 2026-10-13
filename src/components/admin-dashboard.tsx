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
import { getProjects, memberStatusLabel, projects, robotStatusLabel } from "@/lib/content";
import { tr } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import { connectionConfigured } from "@/lib/ssh";
import type { Member, MemberStatus, Robot, RobotStatus, Role } from "@/lib/types";

const memberStatuses: MemberStatus[] = ["pending", "active", "suspended"];
const robotStatuses: RobotStatus[] = ["building", "ready", "maintenance", "archived"];
function useT() { const { locale } = useLocale(); return { locale, t: (ko: string, en: string) => tr(locale, ko, en) }; }

type DashboardProps = { member: Member; initialMembers: Member[]; initialRobots: Robot[]; initialEdit?: string; baseUrl?: string };
export function AdminDashboard({ member, initialMembers, initialRobots, initialEdit, baseUrl }: DashboardProps) {
  const router = useRouter(); const { theme } = useTheme(); const { locale, t } = useT();
  const [members, setMembers] = useState(initialMembers); const [robots, setRobots] = useState(initialRobots);
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("all");
  const [editor, setEditor] = useState<Robot | "new" | null>(() => initialRobots.find(robot => robot.id === initialEdit) || null);
  const [feedback, setFeedback] = useState("");
  const query = search.trim().toLocaleLowerCase();
  const filtered = members.filter(item => (status === "all" || item.status === status) && `${item.name} ${item.email} ${item.department}`.toLocaleLowerCase().includes(query));
  function savedMember(updated: Member) {
    setMembers(current => current.map(item => item.id === updated.id ? updated : item));
    setFeedback(t(`${updated.name} 님의 회원 정보가 저장되었습니다.`, `Saved member details for ${updated.name}.`)); router.refresh();
  }
  function savedRobot(updated: Robot) {
    setRobots(current => current.some(item => item.id === updated.id) ? current.map(item => item.id === updated.id ? updated : item) : [...current, updated]);
    setEditor(null); setFeedback(t(`${updated.name} 정보가 저장되었습니다.`, `Saved details for ${updated.name}.`)); router.refresh();
  }
  return <Theme appearance={theme} accentColor="blue" grayColor="slate" radius="medium" className="admin-shell">
    <div className="admin-summary">
      <div><span>{t("승인 대기", "Awaiting approval")}</span><strong>{members.filter(item => item.status === "pending").length}</strong></div>
      <div><span>{t("활동 회원", "Active members")}</span><strong>{members.filter(item => item.status === "active").length}</strong></div>
      <div><span>{t("활동 관리자", "Active admins")}</span><strong>{members.filter(item => item.role === "admin" && item.status === "active").length}</strong></div>
      <div><span>{t("등록된 로봇", "Registered robots")}</span><strong>{robots.length}</strong></div>
    </div>
    {feedback && <p className="form-success admin-feedback" role="status">{feedback}</p>}
    <Tabs.Root defaultValue={initialEdit ? "robots" : "members"}>
      <Tabs.List aria-label={t("동아리 관리 메뉴", "Club admin menu")}><Tabs.Trigger value="members">{t("회원 관리", "Members")}</Tabs.Trigger><Tabs.Trigger value="robots">{t("로봇 관리", "Robots")}</Tabs.Trigger></Tabs.List>
      <Tabs.Content value="members">
        <div className="admin-toolbar"><label className="search-field"><MagnifyingGlass size={17}/><input aria-label={t("회원 검색", "Search members")} placeholder={t("이름, 이메일, 소속 검색", "Search by name, email or affiliation")} value={search} onChange={event => setSearch(event.target.value)}/></label><Select.Root value={status} onValueChange={setStatus}><Select.Trigger aria-label={t("회원 상태 필터", "Filter by member status")}/><Select.Content position="popper"><Select.Item value="all">{t("전체 회원", "All members")}</Select.Item>{memberStatuses.map(value => <Select.Item key={value} value={value}>{memberStatusLabel(value, locale)}</Select.Item>)}</Select.Content></Select.Root></div>
        <div className="admin-table"><Table.Root><Table.Header><Table.Row><Table.ColumnHeaderCell>{t("회원", "Member")}</Table.ColumnHeaderCell><Table.ColumnHeaderCell>{t("소속", "Affiliation")}</Table.ColumnHeaderCell><Table.ColumnHeaderCell>{t("가입일", "Joined")}</Table.ColumnHeaderCell><Table.ColumnHeaderCell>{t("권한", "Role")}</Table.ColumnHeaderCell><Table.ColumnHeaderCell>{t("회원 상태", "Status")}</Table.ColumnHeaderCell><Table.ColumnHeaderCell>{t("저장", "Save")}</Table.ColumnHeaderCell></Table.Row></Table.Header><Table.Body>{filtered.map(item => <MemberRow key={`${item.id}-${item.role}-${item.status}`} member={item} self={item.id === member.id} onSaved={savedMember}/>)}{filtered.length === 0 && <Table.Row><Table.Cell colSpan={6}><p className="admin-empty">{t("조건에 맞는 회원이 없습니다.", "No members match these filters.")}</p></Table.Cell></Table.Row>}</Table.Body></Table.Root></div><p className="admin-note">{t("승인된 회원만 로봇 접속 정보와 제어 설명서를 열 수 있습니다. 이용 중지 시 기존 로그인 세션도 해제됩니다.", "Only approved members can open robot connection details and control manuals. Suspending a member also ends their existing login sessions.")}</p>
      </Tabs.Content>
      <Tabs.Content value="robots">
        <div className="admin-toolbar"><p className="admin-note">{t("로봇 ID는 QR 주소에 사용되며 생성 후에는 유지됩니다.", "The robot ID is used in the QR address and stays fixed after creation.")}</p><Button onClick={() => setEditor("new")}><Plus size={17}/>{t("로봇 등록", "Add robot")}</Button></div>
        <div className="admin-table"><Table.Root><Table.Header><Table.Row><Table.ColumnHeaderCell>{t("로봇", "Robot")}</Table.ColumnHeaderCell><Table.ColumnHeaderCell>{t("프로젝트", "Project")}</Table.ColumnHeaderCell><Table.ColumnHeaderCell>{t("상태", "Status")}</Table.ColumnHeaderCell><Table.ColumnHeaderCell>{t("접속 정보", "Connection")}</Table.ColumnHeaderCell><Table.ColumnHeaderCell>{t("관리", "Manage")}</Table.ColumnHeaderCell></Table.Row></Table.Header><Table.Body>{robots.map(robot => <Table.Row key={robot.id}><Table.Cell><div className="admin-member-name">{robot.name}</div><div className="admin-member-email">{robot.id} · {robot.platform}</div></Table.Cell><Table.Cell>{getProjects(locale).find(project => project.id === robot.project_id)?.title}</Table.Cell><Table.Cell><StatusBadge status={robot.status}/></Table.Cell><Table.Cell>{connectionConfigured(robot) ? t("등록됨", "Registered") : t("등록 대기", "Pending")}</Table.Cell><Table.Cell><div className="admin-row-actions"><Button size="1" variant="soft" onClick={() => setEditor(robot)} aria-label={t(`${robot.name} 편집`, `Edit ${robot.name}`)}><PencilSimple size={15}/>{t("편집", "Edit")}</Button><Link className="admin-view-link" href={`/robots/${robot.id}`} aria-label={t(`${robot.name} 안내 페이지`, `${robot.name} guide page`)}><ArrowUpRight size={18}/></Link></div></Table.Cell></Table.Row>)}</Table.Body></Table.Root></div>
      </Tabs.Content>
    </Tabs.Root>
    <Dialog.Root open={editor !== null} onOpenChange={open => { if (!open) setEditor(null); }}><Dialog.Content maxWidth="840px" className="robot-editor">{editor !== null && <RobotEditor key={editor === "new" ? "new" : editor.id} initial={editor === "new" ? undefined : editor} baseUrl={baseUrl} onSaved={savedRobot} onClose={() => setEditor(null)}/>}</Dialog.Content></Dialog.Root>
  </Theme>;
}

function MemberRow({ member, self, onSaved }: { member: Member; self: boolean; onSaved: (member: Member) => void }) {
  const [role, setRole] = useState<Role>(member.role); const [status, setStatus] = useState<MemberStatus>(member.status);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const { locale, t } = useT();
  const changed = role !== member.role || status !== member.status;
  async function save(approve = false) {
    setError(""); setBusy(true);
    try { const result = await api<{ member: Member }>(`/api/admin/members/${member.id}`, "PATCH", { role, status: approve ? "active" : status }); onSaved(result.member); }
    catch (err) { setError(err instanceof Error ? err.message : t("회원 정보를 저장하지 못했습니다.", "Could not save member details.")); }
    finally { setBusy(false); }
  }
  return <Table.Row><Table.Cell><div className="admin-member-name">{member.name}{self ? t(" (나)", " (you)") : ""}</div><div className="admin-member-email">{member.email}</div>{error && <p className="admin-row-error" role="alert">{error}</p>}</Table.Cell><Table.Cell>{member.department || t("미입력", "Not provided")}</Table.Cell><Table.Cell>{new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul" }).format(new Date(member.created_at))}</Table.Cell><Table.Cell><Select.Root size="1" value={role} disabled={self || busy} onValueChange={value => { setRole(value as Role); if (value === "admin") setStatus("active"); }}><Select.Trigger aria-label={t(`${member.name} 권한`, `Role for ${member.name}`)}/><Select.Content position="popper"><Select.Item value="member">{t("회원", "Member")}</Select.Item><Select.Item value="admin">{t("관리자", "Admin")}</Select.Item></Select.Content></Select.Root></Table.Cell><Table.Cell><Select.Root size="1" value={status} disabled={self || busy} onValueChange={value => setStatus(value as MemberStatus)}><Select.Trigger aria-label={t(`${member.name} 상태`, `Status for ${member.name}`)}/><Select.Content position="popper">{memberStatuses.map(value => <Select.Item key={value} value={value} disabled={role === "admin" && value !== "active"}>{memberStatusLabel(value, locale)}</Select.Item>)}</Select.Content></Select.Root></Table.Cell><Table.Cell><div className="admin-row-actions">{member.status === "pending" && !changed ? <Button size="1" onClick={() => save(true)} disabled={busy}><Check size={14}/>{busy ? t("처리 중", "Working") : t("승인", "Approve")}</Button> : <Button size="1" variant="soft" disabled={!changed || busy || self} onClick={() => save()}>{busy ? t("저장 중", "Saving") : t("저장", "Save")}</Button>}</div></Table.Cell></Table.Row>;
}

function emptyRobot(): Robot { return { id: "", name: "", platform: "", project_id: projects[0].id, status: "building", description: "", creators: [], start_date: "2026-2", end_date: "", hostname: "", ssh_user: "", ssh_port: 22, workdir: "", launch_command: "", stop_command: "", network_note: "", guide: [], updated_at: "" }; }
function RobotEditor({ initial, onSaved, onClose, baseUrl }: { initial?: Robot; onSaved: (robot: Robot) => void; onClose: () => void; baseUrl?: string }) {
  const [draft, setDraft] = useState<Robot>(() => initial || emptyRobot()); const [creators, setCreators] = useState(initial?.creators.join(", ") || "");
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const { locale, t } = useT();
  function field(key: keyof Robot, value: string | number) { setDraft(current => ({ ...current, [key]: value })); }
  function guideField(index: number, key: "title" | "body" | "command", value: string) { setDraft(current => ({ ...current, guide: current.guide.map((section, i) => i === index ? { ...section, [key]: value } : section) })); }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const payload = { ...draft, creators: creators.split(/[,\n]/).map(name => name.trim()).filter(Boolean) };
      const result = await api<{ robot: Robot }>(initial ? `/api/admin/robots/${initial.id}` : "/api/admin/robots", initial ? "PATCH" : "POST", payload);
      onSaved(result.robot);
    } catch (err) { setError(err instanceof Error ? err.message : t("로봇 정보를 저장하지 못했습니다.", "Could not save robot details.")); }
    finally { setBusy(false); }
  }
  return <><div className="editor-title-row"><Dialog.Title>{initial ? t(`${initial.name} 정보 관리`, `Manage ${initial.name}`) : t("새 로봇 등록", "Add a new robot")}</Dialog.Title><button className="icon-button" type="button" onClick={onClose} aria-label={t("편집 창 닫기", "Close editor")}><X size={21}/></button></div><Dialog.Description size="2" mb="5">{t("설명과 제작 정보를 공개하고, 접속 정보와 운용 설명서는 승인된 회원에게 제공합니다.", "The description and build details are public; connection details and operating manuals are shown only to approved members.")}</Dialog.Description><Tabs.Root defaultValue="information"><Tabs.List aria-label={t("로봇 편집 메뉴", "Robot editor menu")}><Tabs.Trigger value="information">{t("정보 / 설명서", "Details / Manual")}</Tabs.Trigger><Tabs.Trigger value="qr" disabled={!initial}>{t("QR 코드", "QR code")}</Tabs.Trigger></Tabs.List><Tabs.Content value="information"><form onSubmit={save} className="robot-editor-form">
    <section className="editor-section"><h3>{t("기본 정보", "Basic information")}</h3><div className="form-grid">
      <EditorField id="robot-id" label={t("로봇 ID", "Robot ID")} value={draft.id} onChange={value => field("id", value)} required disabled={Boolean(initial)} hint={initial ? t("QR 주소 유지를 위해 ID는 변경할 수 없습니다.", "The ID cannot be changed so the QR address keeps working.") : t("소문자, 숫자, 하이픈 3~40자. 예: microban-02", "3–40 lowercase letters, digits or hyphens. e.g. microban-02")}/>
      <EditorField id="robot-name" label={t("로봇 이름", "Robot name")} value={draft.name} onChange={value => field("name", value)} required/>
      <EditorField id="robot-platform" label={t("플랫폼 / 모델", "Platform / Model")} value={draft.platform} onChange={value => field("platform", value)} required/>
      <div className="form-field"><label htmlFor="robot-project">{t("연결 프로젝트", "Linked project")}</label><select id="robot-project" value={draft.project_id} onChange={event => field("project_id", event.target.value)}>{getProjects(locale).map(project => <option key={project.id} value={project.id}>{project.title}</option>)}</select></div>
      <div className="form-field"><label htmlFor="robot-status">{t("로봇 상태", "Robot status")}</label><select id="robot-status" value={draft.status} onChange={event => field("status", event.target.value)}>{robotStatuses.map(value => <option key={value} value={value}>{robotStatusLabel(value, locale)}</option>)}</select></div>
      <EditorField id="robot-creators" label={t("제작 / 운영 팀", "Build / Operating team")} value={creators} onChange={setCreators} hint={t("여러 이름이나 팀은 쉼표로 구분해 주세요.", "Separate multiple names or teams with commas.")}/>
      <EditorField id="robot-start" label={t("시작 학기 / 날짜", "Start semester / Date")} value={draft.start_date} onChange={value => field("start_date", value)} placeholder={t("2026-2 또는 2026-09-01", "2026-2 or 2026-09-01")}/>
      <EditorField id="robot-end" label={t("종료 학기 / 날짜", "End semester / Date")} value={draft.end_date} onChange={value => field("end_date", value)} placeholder={t("진행 중이면 비워 두세요.", "Leave blank if ongoing.")}/>
      <EditorField id="robot-description" label={t("프로젝트 / 로봇 설명", "Project / Robot description")} value={draft.description} onChange={value => field("description", value)} textarea required full/>
    </div></section>
    <section className="editor-section"><h3>{t("SSH 접속과 제어", "SSH access and control")}</h3><p className="admin-note editor-note">{t("실제 장비에서 확인한 값을 등록해 주세요. SSH 비밀번호와 비밀키는 이 사이트에 저장하지 않습니다.", "Enter values verified on the actual hardware. SSH passwords and private keys are never stored on this site.")}</p><div className="form-grid">
      <EditorField id="robot-host" label={t("호스트 이름 / IP", "Hostname / IP")} value={draft.hostname} onChange={value => field("hostname", value)} placeholder={t("등록 전이면 비워 두세요.", "Leave blank until it is set up.")}/>
      <EditorField id="robot-ssh-user" label={t("장비 사용자 이름", "Device username")} value={draft.ssh_user} onChange={value => field("ssh_user", value)}/>
      <div className="form-field"><label htmlFor="robot-port">{t("SSH 포트", "SSH port")}</label><input id="robot-port" type="number" min="1" max="65535" required value={draft.ssh_port} onChange={event => field("ssh_port", Number(event.target.value))}/></div>
      <EditorField id="robot-workdir" label={t("장비의 프로젝트 폴더", "Project folder on the device")} value={draft.workdir} onChange={value => field("workdir", value)}/>
      <EditorField id="robot-network" label={t("네트워크 / 접속 안내", "Network / Access notes")} value={draft.network_note} onChange={value => field("network_note", value)} textarea full/>
      <EditorField id="robot-launch" label={t("제어 시작 명령어", "Control start command")} value={draft.launch_command} onChange={value => field("launch_command", value)} textarea/>
      <EditorField id="robot-stop" label={t("제어 종료 명령어", "Control stop command")} value={draft.stop_command} onChange={value => field("stop_command", value)} textarea/>
    </div></section>
    <section className="editor-section"><h3>{t("운용 설명서", "Operating manual")}</h3>{draft.guide.map((section,index) => <div className="editor-guide" key={index}><div className="editor-guide-header"><span>{t("설명서", "Section")} {index + 1}</span><Button type="button" variant="ghost" size="1" onClick={() => setDraft(current => ({ ...current, guide: current.guide.filter((_,i) => i !== index) }))}>{t("항목 삭제", "Remove section")}</Button></div><EditorField id={`guide-title-${index}`} label={t("제목", "Title")} value={section.title} onChange={value => guideField(index,"title",value)} required/><EditorField id={`guide-body-${index}`} label={t("설명", "Description")} value={section.body} onChange={value => guideField(index,"body",value)} textarea required/><EditorField id={`guide-command-${index}`} label={t("관련 명령어 (선택)", "Related command (optional)")} value={section.command || ""} onChange={value => guideField(index,"command",value)} textarea/></div>)}<Button type="button" variant="soft" disabled={draft.guide.length >= 16} onClick={() => setDraft(current => ({ ...current, guide: [...current.guide, { title: "", body: "", command: "" }] }))}><Plus size={16}/>{t("설명서 항목 추가", "Add manual section")}</Button></section>
    {error && <p className="form-error editor-error" role="alert">{error}</p>}<div className="editor-footer"><Button type="button" variant="soft" color="gray" onClick={onClose} disabled={busy}>{t("취소", "Cancel")}</Button><Button type="submit" disabled={busy}>{busy ? t("저장 중…", "Saving…") : t("로봇 정보 저장", "Save robot")}</Button></div>
  </form></Tabs.Content><Tabs.Content value="qr">{initial && <div className="editor-qr"><QRPanel id={initial.id} name={initial.name} baseUrl={baseUrl}/></div>}</Tabs.Content></Tabs.Root></>;
}
function EditorField({ id, label, value, onChange, textarea, required, disabled, full, hint, placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; textarea?: boolean; required?: boolean; disabled?: boolean; full?: boolean; hint?: string; placeholder?: string }) {
  const props = { id, value, required, disabled, placeholder, "aria-describedby": hint ? `${id}-hint` : undefined, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value) };
  return <div className={`form-field ${full ? "full-width" : ""}`}><label htmlFor={id}>{label}</label>{textarea ? <textarea {...props} rows={3}/> : <input {...props} type="text"/>}{hint && <small id={`${id}-hint`}>{hint}</small>}</div>;
}
