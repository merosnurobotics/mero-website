export type Role = "member" | "admin";
export type MemberStatus = "pending" | "active" | "suspended";
export type RobotStatus = "building" | "ready" | "maintenance" | "archived";
export type Member = {
  id: string; name: string; email: string; department: string;
  role: Role; status: MemberStatus; created_at: string;
};
export type GuideSection = { title: string; body: string; command?: string };
export type Robot = {
  id: string; name: string; platform: string; project_id: string;
  status: RobotStatus; description: string; creators: string[];
  start_date: string; end_date: string; hostname: string; ssh_user: string;
  ssh_port: number; workdir: string; launch_command: string; stop_command: string;
  network_note: string; guide: GuideSection[]; updated_at: string;
};
export type PublicRobot = Omit<Robot, "hostname" | "ssh_user" | "ssh_port" | "workdir" | "launch_command" | "stop_command" | "network_note" | "guide">;
export type Project = {
  id: string; title: string; english: string; category: string; summary: string;
  description: string; semester: string; image: string; imageType: "concept" | "reference";
  imageCredit: string; imageSource?: string; referenceImage?: string; tags: string[];
  goals: { title: string; text: string }[];
  milestones: { title: string; text: string }[];
  links: { title: string; url: string }[];
};
