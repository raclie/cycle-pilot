import fs from 'node:fs/promises';
import path from 'node:path';
import {realpathSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export async function initializeExample(target){
 if(typeof target!=='string'||!target)throw Error('A new target directory is required');
 const absolute=path.resolve(target),parent=path.dirname(absolute);
 // Windowsで扱いにくい名前（予約名、末尾のドットや空白）は作らない。
 // 新しく作る部分の、すべての階層に適用する。
 const unusable=name=>/^(?:con|prn|aux|nul|conin\$|conout\$|com[0-9¹²³]|lpt[0-9¹²³])(?:\..*)?$/i.test(name)||/[. ]$/.test(name);
 let existing=absolute;
 for(;;){try{await fs.lstat(existing);break;}catch{const up=path.dirname(existing);if(up===existing)break;existing=up;}}
 for(const part of path.relative(existing,absolute).split(path.sep).filter(Boolean))if(unusable(part))throw Error('This folder name cannot be used on Windows: '+part);
 await fs.mkdir(parent,{recursive:true});
 if((await fs.lstat(parent)).isSymbolicLink())throw Error('Target parent must not be a symlink');
 // CONTEXT.md は、実行した場所（repositoryの根で実行する）からの相対pathで書く。その外なら、場所は書かない。
 const rel=path.relative(process.cwd(),absolute).split(path.sep).join('/');
 const inside=Boolean(rel)&&!rel.startsWith('..')&&!path.isAbsolute(rel);
 const named=inside?rel.match(/^workspaces\/([^/]+)\/missions\/([^/]+)$/):null;
 const where=inside?`- mission_path: ${rel}\n- state_path: ${rel}/STATE.md\n`:'- mission_path: （このフォルダの場所を、自分のrepositoryの相対pathで書く）\n- state_path: （同上。末尾に /STATE.md）\n';
 const files={
  'CONTEXT.md':`# 合成Mission\n\n${named?`- workspace: ${named[1]}\n- mission: ${named[2]}\n`:''}${where}\n利用するrepoと担当を別途確定する。\n`,
  'MISSION.md':'# 初回Mission\n\n## Execution Stage\npreconstruction\n\n## Scope Revision\n1\n\n## Purpose\n未設定。利用者の依頼から定義する。\n\n## 成功条件\n未設定。成果と検証方法を定義してから開始する。\n\n## 許可範囲\n未設定。公開・購入・本番反映・新しい定期実行を許可しない。\n',
  'STATE.md':'# Current State\n\n- schema_version: 2\n- architecture_version: 1\n- mission_status: awaiting_definition\n- runner_status: not_started\n- execution_stage: preconstruction\n- scope_revision: 1\n- stage_status: not_started\n- handoff_status: not_started\n- downstream_status: pending\n- ticket_binding: unresolved\n- current_cycle: 0001\n- cycle_status: not_started\n- last_completed_step: 0\n- next_step: 1\n',
  'BACKLOG.md':'# Backlog\n\n目的と受入条件の確定後にActionを追加する。現在の登録は0件。\n',
  'SESSION_OWNER.json':JSON.stringify({schemaVersion:1,status:'unassigned',ownerSessionId:null,automaticPostingEnabled:false},null,2)+'\n'
 };
 try{await fs.mkdir(absolute);}catch(error){if(error.code==='EEXIST')throw Error('Target already exists; refusing to overwrite: '+absolute);throw error;}
 try{for(const [name,text]of Object.entries(files))await fs.writeFile(path.join(absolute,name),text,{encoding:'utf8',flag:'wx'});}
 catch(error){await fs.rm(absolute,{recursive:true,force:true});throw error;}
 return{target:absolute,files:Object.keys(files),automaticPostingEnabled:false};
}
const startedDirectly=()=>{try{return Boolean(process.argv[1])&&realpathSync(path.resolve(process.argv[1]))===realpathSync(fileURLToPath(import.meta.url));}catch{return false;}};
if(startedDirectly()){
 if(process.argv.length!==4||process.argv[2]!=='--target'){console.error('Usage: node scripts/init-example.mjs --target <new-directory>');process.exitCode=1;}
 else try{console.log(JSON.stringify(await initializeExample(process.argv[3])));}catch(error){console.error(error.message);process.exitCode=1;}
}
