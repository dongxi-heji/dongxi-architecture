// Local development ONLY: a fixed-action, same-origin endpoint for replaying
// checks on independently invented synthetic source. No arbitrary commands,
// paths, request bodies, credentials, private sources or deployment listener.
import {execFile} from "node:child_process";
import {fileURLToPath} from "node:url";
import {resolve,dirname} from "node:path";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const command=resolve(root,"scripts/check-reality.mjs");
const ENDPOINT="/api/reality/recheck";

export function allowedRefreshRequest(req){
 const host=req.headers?.host;
 const origin=req.headers?.origin;
 const remote=req.socket?.remoteAddress;
 const site=req.headers?.["sec-fetch-site"];
 return req.method==="POST"&&req.url===ENDPOINT&&
   typeof host==="string"&&/^127\.0\.0\.1:\d{1,5}$/.test(host)&&
   origin==="http://"+host&&
   (remote==="127.0.0.1"||remote==="::ffff:127.0.0.1")&&
   (!site||site==="same-origin")&&
   !req.headers?.["transfer-encoding"]&&
   (req.headers?.["content-length"]===undefined||
      req.headers["content-length"]==="0");
}
export function validateReplayPayload(data){
 return data?.contract==="dongxi.reality-replay/v0"&&
   data?.sourceKind==="original_synthetic"&&
   typeof data?.sourceRevision==="string"&&
   Object.keys(data?.assessments??{}).length===2&&
   ["demo_lookup","demo_reserve"].every(key=>
     data.assessments?.[key]?.subjectId===key&&
     typeof data.assessments[key].result==="string")&&
   Array.isArray(data?.toolRuns)&&data.toolRuns.length===2;
}

export function fixedPublicReplay(){
 return new Promise((accept,reject)=>{
   const env={...process.env};
   delete env.NODE_TEST_CONTEXT;
   execFile(process.execPath,[command,"--show"],{
     cwd:root,env,timeout:120000,maxBuffer:1_000_000,encoding:"utf8"
   },(error,stdout)=>{
     if(error)return reject(Error("replay_process_failed"));
     let result;
     try{result=JSON.parse(stdout)}catch{return reject(Error("replay_output_invalid"))}
     if(!validateReplayPayload(result))return reject(Error("replay_contract_mismatch"));
     accept(result);
   });
 });
}
function reply(res,status,data){
 res.writeHead(status,{
   "Content-Type":"application/json; charset=utf-8",
   "Cache-Control":"no-store, max-age=0",
   "X-Content-Type-Options":"nosniff",
   "Cross-Origin-Resource-Policy":"same-origin",
   "X-Frame-Options":"DENY",
   "Referrer-Policy":"no-referrer"
 });
 res.end(JSON.stringify(data));
}
export function createRefreshMiddleware(replay=fixedPublicReplay){
 let active=false;
 return async(req,res,next)=>{
   if(req.url!==ENDPOINT){next();return}
   if(!allowedRefreshRequest(req)){
     reply(res,403,{contract:"dongxi.reality-refresh/v0",status:"refused"});
     return;
   }
   if(active){
     reply(res,409,{contract:"dongxi.reality-refresh/v0",status:"busy"});
     return;
   }
   active=true;
   try{
     const readout=await replay();
     if(!validateReplayPayload(readout))throw Error("replay_contract_mismatch");
     reply(res,200,{
       contract:"dongxi.reality-refresh/v0",
       status:"rechecked",
       recheckedAt:new Date().toISOString(),
       readout
     });
   }catch{
     // A stale previous "supported" result cannot be returned on failure.
     reply(res,503,{contract:"dongxi.reality-refresh/v0",status:"open",
       reason:"reanalysis_unavailable"});
   }finally{active=false}
 };
}
export function localRealityRefresh(){
 return {
   name:"synthetic-local-reality-refresh",
   apply:"serve",
   configureServer(server){
     // Vite is explicitly bound to 127.0.0.1 for this self-contained demo.
     server.middlewares.use(createRefreshMiddleware());
   }
 };
}
