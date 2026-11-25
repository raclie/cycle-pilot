import fs from 'node:fs/promises';
import {realpathSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

// 一般的な「出してはいけない型」を見る。
export const forbiddenText=[
 /\b(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{12,}/,
 /\bsk-[A-Za-z0-9_-]{20,}/,
 /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/,
 /\bxox[baprs]-[0-9A-Za-z-]{10,}/,
 /\bAIza[0-9A-Za-z_-]{30,}/,
 /\bglpat-[0-9A-Za-z_-]{20,}/,
 /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./,
 /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
 /[A-Za-z]:[\\/]+Users[\\/]+[^\\/\s<>"'`]+/i,
 /(?:^|[^\w.-])\/(?:mnt\/[a-z]|[a-z])\/Users\/[^\s/<>"'`]+/,
 /(?:^|[^\w.-])\/(?:home|Users)\/[^\s/<>"'`]+/,
 /https:\/\/(?:chatgpt\.com|chat\.openai\.com|claude\.ai)\/(?:c|chat|share)\/[0-9a-f-]{20,}/i,
 /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
 /(?<![\w.@/-])(?!git@github\.com)[A-Za-z0-9._%+-]+[@＠][A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}\b/
];
const hash=b=>createHash('sha256').update(b).digest('hex');
const safe=p=>typeof p==='string'&&p.split('/').every(x=>x&&!['.','..'].includes(x)&&!/[\\:\x00-\x1f]/.test(x));
const osNoise=['.DS_Store','Thumbs.db','desktop.ini'];
// strict は、配布前の確認用。利用者がcloneした作業コピーの根にある .git は、通常は問題にしない。
export async function verifyRelease(root,{strict=false}={}){
 const rawManifest=await fs.readFile(path.join(root,'RELEASE-INVENTORY.json'),'utf8');
 const manifest=JSON.parse(rawManifest);
 const errors=[];
 if(forbiddenText.some(r=>r.test(rawManifest)))errors.push('sensitive_pattern:RELEASE-INVENTORY.json');
 if(!manifest||manifest.schemaVersion!==1||!Array.isArray(manifest.files)||manifest.files.length===0)throw Error('Invalid inventory');
 const names=new Set();
 for(const row of manifest.files){
  if(!row||typeof row!=='object'||!safe(row.path)||names.has(row.path.toLowerCase())){errors.push('unsafe_or_duplicate_path');continue;}
  names.add(row.path.toLowerCase());
  const p=path.join(root,...row.path.split('/'));
  try{const stat=await fs.lstat(p);if(!stat.isFile()||stat.isSymbolicLink())throw Error('not regular');
   const b=await fs.readFile(p);if(hash(b)!==row.sha256||b.length!==row.bytes)errors.push('identity:'+row.path);
   // UTF-16やバイナリは、文字の照合をすり抜けるため受け付けない。
   if(b.includes(0)||(b[0]===0xff&&b[1]===0xfe)||(b[0]===0xfe&&b[1]===0xff))errors.push('not_utf8_text:'+row.path);
   else if(forbiddenText.some(r=>r.test(b.toString('utf8'))))errors.push('sensitive_pattern:'+row.path);
  }catch{errors.push('missing_or_unsafe:'+row.path);}
 }
 async function walk(dir,relative=''){
  for(const e of await fs.readdir(dir,{withFileTypes:true})){
   const p=relative?relative+'/'+e.name:e.name;
   if(e.isSymbolicLink()){errors.push('symlink:'+p);continue;}
   if(e.isDirectory()){
    if(e.name==='.git'){if(strict||relative)errors.push('git_history:'+p);continue;}
    if(['node_modules','__pycache__'].includes(e.name)){errors.push('operational_path:'+p);continue;}
    if(['workspaces','runtime','.runtime','worktrees','wt','cycles','release-manifests'].includes(e.name)){errors.push('operational_path:'+p);continue;}
    await walk(path.join(dir,e.name),p);
   }else if(!relative&&e.name==='.git'){if(strict)errors.push('git_history:.git');}
   else if(!strict&&(osNoise.includes(e.name)||(!relative&&e.name==='package-lock.json')))continue; // npm install が作る lock file は、通常は無視する。
   else if(p!=='RELEASE-INVENTORY.json'&&!names.has(p.toLowerCase()))errors.push('unlisted:'+p);
  }
 }
 await walk(root);
 let gate;
 try{gate=JSON.parse(await fs.readFile(path.join(root,'PUBLICATION.json'),'utf8'));if(!gate||typeof gate!=='object'||Array.isArray(gate))throw Error('not an object');}
 catch{errors.push('publication_gate:invalid');return{errors,files:manifest.files.length,publicationApproved:false,readyToPublish:false};}
 const approved=gate.publicationApproved===true;
 if(gate.status!==(approved?'public-preview':'private-local-preview'))errors.push('publication_status_mismatch');
 for(const [field,value] of Object.entries({schemaVersion:1,originalCodeLicense:'MIT',automaticPostingEnabled:false,includesOperationalHistory:false}))if(gate[field]!==value)errors.push('publication_gate:'+field);
 if(typeof gate.publicationApproved!=='boolean')errors.push('publication_gate:publicationApproved');
 if(manifest.historyIncluded!==false)errors.push('inventory_gate:historyIncluded');
 if(manifest.edition!==gate.edition)errors.push('inventory_gate:edition');
 return{errors,files:manifest.files.length,publicationApproved:approved,readyToPublish:strict&&approved&&errors.length===0};
}
// リンク（ジャンクション等）を通って起動しても、実体のpathで比べる。
const startedDirectly=()=>{try{return Boolean(process.argv[1])&&realpathSync(path.resolve(process.argv[1]))===realpathSync(fileURLToPath(import.meta.url));}catch{return false;}};
if(startedDirectly()){
 try{const unknown=process.argv.slice(2).filter(a=>a!=='--strict');if(unknown.length)throw Error('Unknown argument: '+unknown.join(' ')+' (usage: node scripts/verify-release.mjs [--strict])');
  const result=await verifyRelease(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),{strict:process.argv.includes('--strict')});console.log(JSON.stringify(result));process.exitCode=result.errors.length?1:0;}
 catch(error){console.error(error.message);process.exitCode=1;}
}
