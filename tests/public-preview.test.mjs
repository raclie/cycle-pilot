import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {initializeExample} from '../scripts/init-example.mjs';
import {verifyRelease,forbiddenText} from '../scripts/verify-release.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('inventory is intact and the publication flag agrees with the status',async()=>{
 const result=await verifyRelease(root);assert.deepEqual(result.errors,[]);
 const gate=JSON.parse(await fs.readFile(path.join(root,'PUBLICATION.json'),'utf8'));
 assert.equal(typeof gate.publicationApproved,'boolean');assert.equal(result.publicationApproved,gate.publicationApproved);
 assert.equal(gate.automaticPostingEnabled,false);assert.equal(gate.includesOperationalHistory,false);
});
test('synthetic Mission stays unassigned, creates missing parents and cannot overwrite prior work',async()=>{
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'cycle-public-'));
 try{const target=path.join(temp,'nested','example');await initializeExample(target);
  assert.match(await fs.readFile(path.join(target,'STATE.md'),'utf8'),/runner_status: not_started/);
  const owner=JSON.parse(await fs.readFile(path.join(target,'SESSION_OWNER.json'),'utf8'));
  assert.equal(owner.ownerSessionId,null);assert.equal(owner.automaticPostingEnabled,false);
  await fs.writeFile(path.join(target,'keep.txt'),'keep');await assert.rejects(initializeExample(target));assert.equal(await fs.readFile(path.join(target,'keep.txt'),'utf8'),'keep');
  const relative=path.relative(process.cwd(),path.join(temp,'relative'));await initializeExample(relative);await fs.access(path.join(temp,'relative','STATE.md'));
 }finally{await fs.rm(temp,{recursive:true,force:true});}
});
test('generic privacy patterns reject credentials, user-folder paths, emails and conversation links',()=>{
 const bad=['ghp_'+'x'.repeat(30),'sk-'+'a'.repeat(24),'AKIA'+'A'.repeat(16),'-----BEGIN '+'ENCRYPTED PRIVATE KEY-----','D:\\Users\\'+'someone\\notes','/ho'+'me/someone/notes','a'+'@example.test','https://claude.ai/chat/'+'0'.repeat(24)];
 for(const s of bad)assert.ok(forbiddenText.some(r=>r.test(s)),s);
 for(const s of ['Cycle Pilot','OBS（観測）','npm test','skills/gpt-engine/SKILL.md'])assert.equal(forbiddenText.some(r=>r.test(s)),false,s);
});
test('a root .git folder is allowed by default and rejected in strict mode',async()=>{
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'cycle-copy-'));
 try{const copy=path.join(temp,'copy');await fs.cp(root,copy,{recursive:true,filter:s=>path.basename(s)!=='.git'});await fs.mkdir(path.join(copy,'.git'));
  assert.deepEqual((await verifyRelease(copy)).errors,[]);
  assert.ok((await verifyRelease(copy,{strict:true})).errors.includes('git_history:.git'));
 }finally{await fs.rm(temp,{recursive:true,force:true});}
});
test('ordinary technical strings are not mistaken for emails or secrets',()=>{
 for(const s of ['npm install lodash@4.17.21','uses: actions/checkout@v4.1.0','git@github.com:owner/repo.git','node@22','weighs_something_long_here','C:\\Users\\<name>\\x','see `/home/<user>/x`'])assert.equal(forbiddenText.some(r=>r.test(s)),false,s);
 for(const s of ['C:\\Us'+'ers\\Taro','/mnt/c/Us'+'ers/taro/x','`/ho'+'me/taro/x`','file:/'+'//ho'+'me/taro/x','xox'+'b-1234567890-abcdef','AIza'+'x'.repeat(35),'https://chat.openai.com/c/'+'0'.repeat(24),'a'+'＠'+'example.test'])assert.ok(forbiddenText.some(r=>r.test(s)),s);
});
test('starting the scripts through a directory link still runs them',async()=>{
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'cycle-link-'));
 try{const link=path.join(temp,'link');
  try{await fs.symlink(root,link,'junction');}catch{return;}
  const {NODE_TEST_CONTEXT,...env}=process.env;
  const out=execFileSync(process.execPath,[path.join(link,'scripts','verify-release.mjs')],{encoding:'utf8',env});
  assert.equal(JSON.parse(out).errors.length,0);
  const created=execFileSync(process.execPath,[path.join(link,'scripts','init-example.mjs'),'--target',path.join(temp,'made')],{encoding:'utf8',env});
  assert.ok(JSON.parse(created).files.includes('STATE.md'));
 }finally{await fs.rm(temp,{recursive:true,force:true});}
});
test('fixed publication fields and operating-system noise are handled',async()=>{
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'cycle-gate-'));
 try{const copy=path.join(temp,'copy');await fs.cp(root,copy,{recursive:true,filter:s=>path.basename(s)!=='.git'});
  await fs.writeFile(path.join(copy,'.DS_Store'),'x');await fs.writeFile(path.join(copy,'.git'),'gitdir: elsewhere');
  assert.deepEqual((await verifyRelease(copy)).errors,[]);
  const strict=(await verifyRelease(copy,{strict:true})).errors;assert.ok(strict.includes('git_history:.git')&&strict.includes('unlisted:.DS_Store'));
  const gatePath=path.join(copy,'PUBLICATION.json');const gate=JSON.parse(await fs.readFile(gatePath,'utf8'));
  await fs.writeFile(gatePath,JSON.stringify({...gate,automaticPostingEnabled:true,originalCodeLicense:'GPL'}));
  const errors=(await verifyRelease(copy)).errors;assert.ok(errors.includes('publication_gate:automaticPostingEnabled')&&errors.includes('publication_gate:originalCodeLicense'));
 }finally{await fs.rm(temp,{recursive:true,force:true});}
});
test('packaged Markdown links resolve locally',async()=>{
 const inventory=JSON.parse(await fs.readFile(path.join(root,'RELEASE-INVENTORY.json'),'utf8'));
 for(const {path:p}of inventory.files.filter(x=>x.path.endsWith('.md'))){
  const text=await fs.readFile(path.join(root,p),'utf8');
  for(const m of text.matchAll(/\]\(([^\s)]+)\)/g)){
   const link=m[1].split('#')[0];if(!link||/^[a-z]+:/i.test(link)||link.includes('<'))continue;
   await assert.doesNotReject(fs.access(path.resolve(root,path.dirname(p),link)),`${p}: ${link}`);
  }
 }
});
test('CONTEXT.md follows the real target and unusable Windows names are refused',async()=>{
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'cycle-ctx-'));const before=process.cwd();
 try{process.chdir(temp);
  await initializeExample('workspaces/Sales/missions/Q1Plan');
  const ctx=await fs.readFile(path.join(temp,'workspaces','Sales','missions','Q1Plan','CONTEXT.md'),'utf8');
  assert.match(ctx,/workspace: Sales/);assert.match(ctx,/mission: Q1Plan/);assert.match(ctx,/mission_path: workspaces\/Sales\/missions\/Q1Plan\n/);assert.doesNotMatch(ctx,/Example/);
  await initializeExample('free-form');assert.doesNotMatch(await fs.readFile(path.join(temp,'free-form','CONTEXT.md'),'utf8'),/Example|workspace:/);
  for(const bad of ['nul','Aux.txt','name.','name ','x./y','aux/x','ok/con.d/x','com1','LPT9.txt','com¹'])await assert.rejects(initializeExample(path.join(temp,bad)),/cannot be used on Windows/,bad);
  await initializeExample('console');
  const outside=await fs.mkdtemp(path.join(os.tmpdir(),'cycle-out-'));
  try{await initializeExample(path.join(outside,'x'));assert.match(await fs.readFile(path.join(outside,'x','CONTEXT.md'),'utf8'),/mission_path: （このフォルダ/);}finally{await fs.rm(outside,{recursive:true,force:true});}
 }finally{process.chdir(before);await fs.rm(temp,{recursive:true,force:true});}
});
test('lock files, binary content, broken gate files and unknown options are handled',async()=>{
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'cycle-edge-'));
 try{const copy=path.join(temp,'copy');await fs.cp(root,copy,{recursive:true,filter:s=>path.basename(s)!=='.git'});
  await fs.writeFile(path.join(copy,'package-lock.json'),'{}');
  assert.deepEqual((await verifyRelease(copy)).errors,[]);
  assert.ok((await verifyRelease(copy,{strict:true})).errors.includes('unlisted:package-lock.json'));
  await fs.rm(path.join(copy,'package-lock.json'));
  const readme=path.join(copy,'README.md');const original=await fs.readFile(readme);
  await fs.writeFile(readme,Buffer.concat([original,Buffer.from([0,0x41,0])]));
  assert.ok((await verifyRelease(copy)).errors.includes('not_utf8_text:README.md'));
  await fs.writeFile(readme,Buffer.concat([Buffer.from([0xff,0xfe,0x42,0x30]),original]));
  assert.ok((await verifyRelease(copy)).errors.includes('not_utf8_text:README.md'));
  await fs.writeFile(readme,original);
  await fs.writeFile(path.join(copy,'docs','package-lock.json'),'{}');
  assert.ok((await verifyRelease(copy)).errors.includes('unlisted:docs/package-lock.json'));
  await fs.rm(path.join(copy,'docs','package-lock.json'));
  const gatePath=path.join(copy,'PUBLICATION.json');const gateText=await fs.readFile(gatePath,'utf8');
  for(const broken of ['null','[]','{"schemaVersion":1,'])await fs.writeFile(gatePath,broken),assert.ok((await verifyRelease(copy)).errors.includes('publication_gate:invalid'),broken);
  // 承認済みの状態でも、readyToPublish は --strict のときだけ true になる。
  const approvedGate=JSON.stringify({...JSON.parse(gateText),publicationApproved:true,status:'public-preview'},null,2)+'\n';
  await fs.writeFile(gatePath,approvedGate);
  const inventoryPath=path.join(copy,'RELEASE-INVENTORY.json');const inventory=JSON.parse(await fs.readFile(inventoryPath,'utf8'));
  const row=inventory.files.find(f=>f.path==='PUBLICATION.json');row.bytes=Buffer.byteLength(approvedGate);row.sha256=createHash('sha256').update(approvedGate).digest('hex');
  await fs.writeFile(inventoryPath,JSON.stringify(inventory,null,2)+'\n');
  const loose=await verifyRelease(copy),tight=await verifyRelease(copy,{strict:true});
  assert.equal(loose.readyToPublish,false);assert.equal(tight.readyToPublish,true,JSON.stringify(tight.errors));
  await fs.writeFile(gatePath,'null');
  const {NODE_TEST_CONTEXT,...env}=process.env;
  assert.throws(()=>execFileSync(process.execPath,[path.join(root,'scripts','verify-release.mjs'),'--strcit'],{env,stdio:'pipe'}),/Command failed/);
 }finally{await fs.rm(temp,{recursive:true,force:true});}
});
