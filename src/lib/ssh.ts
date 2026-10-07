import type { Robot } from "./types";

export function connectionConfigured(robot: Robot) { return Boolean(robot.hostname && robot.ssh_user); }
export function sshAlias(robot: Robot) { return `mero-${robot.id}`; }
export function sshCommand(robot: Robot) { return `ssh -p ${robot.ssh_port} ${robot.ssh_user}@${robot.hostname}`; }
export function sshConfig(robot: Robot) {
  return `# BEGIN MERO ${robot.id}\nHost ${sshAlias(robot)}\n    HostName ${robot.hostname}\n    User ${robot.ssh_user}\n    Port ${robot.ssh_port}\n    ServerAliveInterval 30\n    ConnectTimeout 10\n# END MERO ${robot.id}\n`;
}
export function setupScript(robot: Robot) {
  return `#!/bin/sh
# MERO SSH setup: only writes the named block to your local SSH config.
# Review before running. Existing config is backed up; no keys or passwords are copied.
set -eu
umask 077
mkdir -p "$HOME/.ssh"
config_path="$HOME/.ssh/config"
if [ -L "$config_path" ]; then
  printf '%s\\n' 'SSH config is a symlink. Please add the downloaded block manually.' >&2
  exit 1
fi
if [ -e "$config_path" ] && [ ! -f "$config_path" ]; then
  printf '%s\\n' 'SSH config is not a regular file.' >&2
  exit 1
fi
if [ -f "$config_path" ]; then
  cp -p "$config_path" "$config_path.mero-backup.$(date +%Y%m%d%H%M%S).$$"
fi
temp_path=$(mktemp "$HOME/.ssh/mero-config.XXXXXX")
trap 'rm -f "$temp_path"' EXIT HUP INT TERM
if [ -f "$config_path" ]; then
  awk '/^# BEGIN MERO ${robot.id}$/ {skip=1; next} /^# END MERO ${robot.id}$/ {skip=0; next} !skip {print}' "$config_path" > "$temp_path"
fi
printf '\\n' >> "$temp_path"
cat >> "$temp_path" <<'MERO_SSH_BLOCK'
${sshConfig(robot)}MERO_SSH_BLOCK
chmod 600 "$temp_path"
mv "$temp_path" "$config_path"
printf '%s\\n' 'SSH configuration saved. Connect with: ssh ${sshAlias(robot)}'
`;
}
export function shellQuote(value: string) { return "'" + value.replaceAll("'", "'\\''") + "'"; }
