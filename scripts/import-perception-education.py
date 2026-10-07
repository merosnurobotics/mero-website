"""Snapshot the reviewed remote recipe and build a CPU smoke exercise, without running it."""
from pathlib import Path
import subprocess, re, json
repo = Path('/home/user/ddonggae')
out = Path('private/education-assets/object-recognition')
out.mkdir(parents=True, exist_ok=True)
# Reviewed version, independent of later changes to origin/main.
rev = 'd85758c'
rev = subprocess.check_output(['git', 'rev-parse', rev], cwd=repo, text=True).strip()
def read(p):
    return subprocess.check_output(['git', 'show', f'{rev}:{p}'], cwd=repo, text=True)
guide = read('perception/docs/synthetic-data-reproduction.md')
# Keep the standalone teaching recipe separate from the import source.
lesson_recipe = Path('/home/user/MERO-education/meroedu-detection/lessons/01-synthetic-data/FULL_RECIPE.md')
(out / 'source-reproduction.md').write_text(lesson_recipe.read_text())
(out / 'LICENSE.txt').write_text(read('LICENSE'))
blocks = re.findall(r'```(powershell|bash)\n(.*?)```', guide, re.S)
def bash(s):
    return s.replace('`\n', '§\n').replace('\\', '/').replace('§', '\\').replace('Set-Location perception/generation', 'cd perception/generation')
selected = [blocks[1][1], bash(blocks[2][1]), bash(blocks[3][1]), bash(blocks[5][1]), bash(blocks[6][1]), bash(blocks[7][1]), bash(blocks[10][1])]
names = ['01-environment', '02-assets', '03-render', '04-split', '05-export', '06-train', '07-evaluate']
commands = {}
for name, body in zip(names, selected):
    if name not in ['01-environment', '02-assets']:
        body = body.replace('public_fruits360_arena_v1', 'smoke120')
    if name == '06-train':
        body = body.replace('--epochs 140', '--epochs 1').replace('--epochs 120', '--epochs 1').replace('--batch 32', '--batch 4').replace('--workers 4', '--workers 0').replace('--device 0', '--device cpu')
    if name == '07-evaluate':
        body = body.replace('device=0', 'device=cpu')
        body = 'cd ../..\n' + body
    if name == '01-environment':
        body = body.replace('/whl/cu128', '/whl/cpu')
    body = body.replace('--tasks a1 c', '--tasks a1')
    commands[name] = body.strip()
    cwd = '저장소 루트' if name in ['01-environment', '02-assets'] else 'perception/generation'
    (out / f'{name}.sh').write_text('#!/usr/bin/env bash\n# MERO 객체인식 입문: ' + cwd + '에서 시작\n# 코드 출처·사용 조건: 별도 출처 기록 및 LICENSE\n# 같은 터미널에서 01부터 순서대로 source 명령으로 실행\nset -e\n' + body.strip() + '\n')
(out / 'full-render.sh').write_text('#!/usr/bin/env bash\n# perception/generation에서 실행; GPU 및 충분한 저장공간 필요\nset -e\n' + bash(blocks[4][1]))
Path('src/lib/education/perception-commands.ts').write_text('export const perceptionSourceCommit = ' + json.dumps(rev) + ';\nexport const perceptionCommands = ' + json.dumps(commands, ensure_ascii=False, indent=2) + ';\n')
(out / 'provenance.json').write_text(json.dumps({'repository': 'https://github.com/YenCho/ddonggae', 'commit': rev, 'guide': 'perception/docs/synthetic-data-reproduction.md', 'exercise_changes': ['120 scenes', 'CPU torch and inference', '1 epoch, batch 4, workers 0', 'shared smoke120 dataset naming'], 'executed': False}, indent=2) + '\n')
for source, name in [('docs/assets/synthetic-training-samples.jpg', 'synthetic-samples.jpg'), ('docs/assets/real-face-crops.jpg', 'real-crops.jpg'), ('media/perception/scan-overlay.jpg', 'scan-overlay.jpg'), ('media/perception/scan.mp4', 'scan.mp4')]:
    (out / name).write_bytes(subprocess.check_output(['git', 'show', f'{rev}:{source}'], cwd=repo))
print('Imported source and commands at', rev)
