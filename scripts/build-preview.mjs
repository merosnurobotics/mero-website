import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const offline = path.join(root,"scripts/offline");
const plugin = {
  name: "mero-offline-adapters",
  setup(builder) {
    builder.onResolve({filter:/^next\/(link|image|navigation)$/}, args => ({path:path.join(offline, args.path === "next/navigation" ? "navigation.tsx" : `next-${args.path.split("/")[1]}.tsx`)}));
    builder.onResolve({filter:/^@\/lib\/(db|auth|security|client-api)$/}, () => ({path:path.join(offline,"store.ts")}));
    builder.onResolve({filter:/^(\.\/qr-panel|@\/components\/qr-panel)$/}, args => args.importer.includes(`${path.sep}src${path.sep}components${path.sep}`) ? {path:path.join(offline,"qr-panel.tsx")} : null);
    builder.onLoad({filter:/\/src\/app\/.*\.tsx$/}, async args => {
      let contents = await fs.readFile(args.path,"utf8");
      // Export-only adaptation: page data comes from the in-memory demo store.
      // The production Next pages and its database are never changed or copied.
      contents = contents.replace(/export default async function/g,"export default function").replace(/\bawait\s+/g,"");
      return { contents,loader:"tsx",resolveDir:path.dirname(args.path) };
    });
  },
};
const bundle = await build({
  entryPoints:[path.join(offline,"app.tsx")],bundle:true,write:false,outdir:path.join(root,".local/offline-build"),
  format:"iife",platform:"browser",target:["es2022"],jsx:"automatic",minify:true,legalComments:"none",metafile:true,
  define:{"process.env.NODE_ENV":'"production"',"process.env.NEXT_PUBLIC_SITE_URL":'"https://mero.example.com"'},plugins:[plugin],
});
const javascript = bundle.outputFiles.find(file => file.path.endsWith(".js"))?.text;
const radix = bundle.outputFiles.find(file => file.path.endsWith(".css"))?.text || "";
if (!javascript) throw new Error("The standalone browser bundle was not produced.");
for (const entry of Object.keys(bundle.metafile.inputs)) {
  if (/src\/lib\/(?:db|auth|security|client-api)\.ts$/.test(entry)) throw new Error(`Server-only module reached the public preview: ${entry}`);
}
const assets = {};
const types = {".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml"};
for (const directory of ["images","brand"]) {
  for (const file of await fs.readdir(path.join(root,"public",directory))) {
    if (!types[path.extname(file)]) continue;
    const buffer = await fs.readFile(path.join(root,"public",directory,file));
    assets[`/${directory}/${file}`] = `data:${types[path.extname(file)]};base64,${buffer.toString("base64")}`;
  }
}
const font = (await fs.readFile(path.join(root,"public/fonts/PretendardVariable.woff2"))).toString("base64");
const notices = ["Pretendard font\n" + await fs.readFile(path.join(root,"public/fonts/OFL.txt"),"utf8")];
const packages = new Set(Object.keys(bundle.metafile.inputs).map(file => file.match(/^node_modules\/((?:@[^/]+\/)?[^/]+)/)?.[1]).filter(Boolean));
for (const name of packages) {
  const directory = path.join(root,"node_modules",name);
  try {
    const filenames = (await fs.readdir(directory)).filter(file => /^licen[cs]e(?:\.(?:md|txt))?$/i.test(file));
    for (const filename of filenames) notices.push(`${name}\n${await fs.readFile(path.join(directory,filename),"utf8")}`);
  } catch { /* Nested package notices are retained by their parent distribution. */ }
}
let css = (await fs.readFile(path.join(root,"src/app/globals.css"),"utf8")).replace('@import "tailwindcss";',"");
for (const [source,uri] of Object.entries(assets)) css = css.split(`url('${source}')`).join(`url('${uri}')`);
const extra = `
@font-face{font-family:PreviewPretendard;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900;font-display:swap}
:root{--font-pretendard:PreviewPretendard}body{min-height:100dvh}.preview-toolbar{background:var(--surface);border-bottom:1px solid var(--line)}
.preview-toolbar-inner{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:46px;padding-block:8px}.preview-purpose{display:flex;align-items:center;gap:12px;font-size:11px;white-space:nowrap}.preview-purpose>span{color:var(--accent);font-weight:650}.preview-purpose p{color:var(--muted)}.preview-tools{display:flex;align-items:center;gap:13px}.preview-view-select{display:flex;position:relative;align-items:center}.preview-view-select select{max-width:210px;appearance:none;background:var(--surface-raised);color:var(--text);font-size:11px;border:1px solid var(--line);border-radius:6px;padding:6px 26px 6px 10px;min-height:30px}.preview-view-select svg{position:absolute;right:8px;pointer-events:none}.preview-role-buttons{display:flex;gap:3px}.preview-role-buttons button{border:0;background:none;color:var(--muted);padding:5px 10px;font-size:11px;border-radius:5px;min-height:30px}.preview-role-buttons .selected{background:var(--accent-soft);color:var(--accent);font-weight:600}.preview-reset{min-width:30px;min-height:30px;padding:5px}
.demo-auth-help{margin-top:28px;padding:22px 24px;border:1px solid var(--line);border-radius:12px;display:flex;gap:25px;justify-content:space-between;align-items:center;background:var(--surface)}.demo-auth-help>div:first-child{display:flex;gap:13px;align-items:flex-start}.demo-auth-help svg{color:var(--accent)}.demo-auth-help h2{font-size:16px;font-weight:650}.demo-auth-help p{color:var(--muted);font-size:11px;margin-top:7px;line-height:1.8}.demo-auth-actions{display:flex;gap:8px;flex-shrink:0}.demo-auth-help code{color:var(--text)}.demo-account-examples{letter-spacing:0}.preview-privacy-note{padding-block:24px 0;color:var(--muted);font-size:12px}.radix-themes{--default-font-family:PreviewPretendard,sans-serif}.admin-shell{min-height:0}.rt-BaseDialogOverlay{z-index:40}[data-radix-popper-content-wrapper]{z-index:50!important}
@media(max-width:1100px){.demo-auth-help{flex-direction:column;align-items:flex-start}.preview-purpose p{display:none}}
@media(max-width:767px){.preview-toolbar-inner{flex-wrap:wrap;gap:8px;padding-block:10px}.preview-purpose{width:100%;font-size:10px}.preview-purpose p{display:block;font-size:10px}.preview-tools{justify-content:space-between;width:100%;gap:8px}.preview-view-select{flex:1;min-width:0}.preview-view-select select{width:100%;max-width:none;min-width:0;font-size:10px}.preview-role-buttons{gap:0}.preview-role-buttons button{font-size:10px;padding-inline:8px}.preview-reset{display:none}.demo-auth-help{margin-top:20px;padding:18px;gap:18px}.demo-auth-help h2{font-size:15px}.demo-auth-help p{font-size:10px}.demo-auth-actions{flex-wrap:wrap}.demo-auth-actions .button{font-size:11px}.site-header .header-actions{gap:8px}.hero-enter{animation-duration:.45s}.preview-privacy-note{font-size:11px}}
`;
const title = "MERO · 공유용 초안";
const escapeScript = value => value.replace(/<\/script/gi,"<\\/script");
const html = `<!doctype html>\n<html lang="ko" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="MERO 서울대학교 로봇 동아리. 사진과 전체 페이지를 담은 단일 HTML 공유용 초안."><title>${title}</title><link rel="icon" href="${assets['/brand/mero.svg']}"><style>${radix}\n${css}\n${extra}</style><script type="text/plain" id="third-party-notices">${escapeScript(notices.join("\n\n"))}</script><script>try{var t=localStorage.getItem('mero-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){}</script></head><body><div id="app-root"><div style="padding:80px 24px;text-align:center;font-family:sans-serif"><h1>MERO</h1><p>미리보기 화면을 여는 중입니다.</p></div></div><noscript><p>이 HTML의 탭과 데모 기능을 사용하려면 브라우저에서 JavaScript를 허용해 주세요.</p></noscript><script>window.MERO_ASSETS=${escapeScript(JSON.stringify(assets))};</script><script>${escapeScript(javascript)}</script></body></html>`;
const output = path.join(root,"output/MERO-preview.html");
await fs.mkdir(path.dirname(output),{recursive:true});
await fs.writeFile(output,html);
await fs.writeFile(path.join(root,"public/MERO-preview.html"),html);
await fs.mkdir(path.join(root,".local"),{recursive:true});
await fs.writeFile(path.join(root,".local/preview-bundle.json"),JSON.stringify({assets:Object.keys(assets),bytes:Buffer.byteLength(html),inputs:Object.keys(bundle.metafile.inputs)},null,2));
console.log(`Saved ${output} (${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MiB). Photos, logo, font, CSS and JavaScript are embedded. No server database or login credentials are included.`);
