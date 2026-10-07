import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { Readable } from "node:stream";
import { currentMember } from "@/lib/auth";

export const runtime = "nodejs";
const types: Record<string,string> = { ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp", ".gif":"image/gif", ".mp4":"video/mp4", ".zip":"application/zip", ".json":"application/json", ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".txt":"text/plain; charset=utf-8", ".md":"text/plain; charset=utf-8", ".sh":"text/plain; charset=utf-8", ".woff":"font/woff", ".woff2":"font/woff2", ".js":"text/javascript; charset=utf-8", ".csv":"text/csv; charset=utf-8", ".py":"text/plain; charset=utf-8" };
type Context = { params: Promise<{path:string[]}> };
async function serve(request: Request, context: Context, head: boolean) {
  const headers = new Headers({"Cache-Control":"private, no-store", "X-Content-Type-Options":"nosniff", "Vary":"Cookie"});
  if (!await currentMember()) return new Response(null,{status:401,headers});
  const {path} = await context.params;
  const root = resolve(process.cwd(),"private/education-assets");
  if (path.some(p=>!p || p === "." || p === ".." || /[\\/\0]/.test(p))) return new Response(null,{status:404,headers});
  const file = resolve(root,...path);
  if (!file.startsWith(root+sep)) return new Response(null,{status:404,headers});
  let info;
  try { info=await stat(file); } catch { return new Response(null,{status:404,headers}); }
  if (!info.isFile()) return new Response(null,{status:404,headers});
  headers.set("Content-Type",types[extname(file).toLowerCase()] || "application/octet-stream");
  headers.set("Accept-Ranges","bytes");
  let start=0, end=info.size-1, status=200;
  const range = request.headers.get("range");
  if (range) {
    const match=/^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1]&&!match[2])) { headers.set("Content-Range",`bytes */${info.size}`); return new Response(null,{status:416,headers}); }
    if (!match[1]) { start=Math.max(0,info.size-Number(match[2])); }
    else { start=Number(match[1]); if (match[2]) end=Math.min(end,Number(match[2])); }
    if (!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=info.size) { headers.set("Content-Range",`bytes */${info.size}`); return new Response(null,{status:416,headers}); }
    status=206; headers.set("Content-Range",`bytes ${start}-${end}/${info.size}`);
  }
  headers.set("Content-Length",String(Math.max(0,end-start+1)));
  const body = head || !info.size ? null : Readable.toWeb(createReadStream(file,{start,end})) as ReadableStream<Uint8Array>;
  return new Response(body,{status,headers});
}
export function GET(request: Request, context: Context) { return serve(request,context,false); }
export function HEAD(request: Request, context: Context) { return serve(request,context,true); }
