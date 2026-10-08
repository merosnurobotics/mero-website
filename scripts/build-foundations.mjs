import {spawnSync} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {homedir} from 'node:os';
const skill=process.env.ANSWER_HTML_SKILL_DIR || resolve(homedir(),'.codex/skills/answer-me-with-html');
await mkdir('.local/foundations',{recursive:true});
const out=resolve('.local/foundations/bridges.html');
const result=spawnSync(process.execPath,[resolve(skill,'scripts/am.mjs'),'render','content/education/foundations/bridges.md','-o',out,'--no-open'],{encoding:'utf8'});
if(result.status!==0)throw new Error(result.stderr || result.stdout);
process.stdout.write(result.stdout);
const html=await readFile(out,'utf8');
const draft = await readFile('content/education/foundations/bridges.md','utf8');
const mobileDraft=resolve('.local/foundations/mobile.md');
await writeFile(mobileDraft,draft.replaceAll('```flow LR','```flow TB'));
const mobileOut=resolve('.local/foundations/mobile.html');
const mobile=spawnSync(process.execPath,[resolve(skill,'scripts/am.mjs'),'render',mobileDraft,'-o',mobileOut,'--no-open'],{encoding:'utf8'});
if(mobile.status!==0)throw new Error(mobile.stderr || mobile.stdout);
const mobileHtml=await readFile(mobileOut,'utf8');
const mobileFigures=[...mobileHtml.matchAll(/<figure class="am-diagram[^"]*"[\s\S]*?<\/figure>/g)];
let diagram=0;
function adapt(body) {
 return body.replace(/<img data-am-src="\/home\/user\/MEROsite\/private\/education-assets\/([^"]+)" src="[^"]+"/g, '<img src="/education-assets/$1"').replace(/<figure class="am-diagram[^"]*"[\s\S]*?<\/figure>/g,desktop=>desktop.replace('class="am-diagram','class="am-diagram am-flow-desktop')+mobileFigures[diagram++][0].replaceAll(/am(\d+)-/g,'am-foundation-mobile$1-').replace('class="am-diagram','class="am-diagram am-flow-mobile')).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
}
const ids=['system','local-python','arrays','units','frames','pid-response','joint-control','trajectory-control','contact-control'];
const panels=[...html.matchAll(/<section class="am-panel" id="panel-[^"]+">([\s\S]*?)<\/section>/g)];
if(panels.length!==ids.length)throw new Error('Unexpected foundations panel count');
const generated=Object.fromEntries(panels.map((panel,i)=>[ids[i],{title:panel[1].match(/<h2>([\s\S]*?)<\/h2>/)[1],html:adapt(panel[1].match(/<div class="am-panel-body">([\s\S]*)<\/div>\s*$/)[1])}]));
await writeFile('src/lib/education/generated/foundations.json',JSON.stringify(generated,null,2)+'\n');

const notesOutput=resolve('.local/foundations/microban-notes.html');
const notesRun=spawnSync(process.execPath,[resolve(skill,'scripts/am.mjs'),'render','content/education/foundations/microban-notes.md','-o',notesOutput,'--no-open'],{encoding:'utf8'});
if(notesRun.status!==0)throw new Error(notesRun.stderr || notesRun.stdout);
process.stdout.write(notesRun.stdout);
const notes=await readFile(notesOutput,'utf8');
const notesIds=['observations','action-contract','reward-terms','implementation-notes','balance-physics','control-comparison'];
const notesPanels=[...notes.matchAll(/<section class="am-panel" id="panel-[^"]+">([\s\S]*?)<\/section>/g)];
if(notesPanels.length!==notesIds.length)throw new Error('Unexpected Microban notes panel count');
await writeFile('src/lib/education/generated/microban-notes.json',JSON.stringify(Object.fromEntries(notesPanels.map((panel,i)=>[notesIds[i],{title:panel[1].match(/<h2>([\s\S]*?)<\/h2>/)[1],html:panel[1].match(/<div class="am-panel-body">([\s\S]*)<\/div>\s*$/)[1].replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>')}])) ,null,2)+'\n');
