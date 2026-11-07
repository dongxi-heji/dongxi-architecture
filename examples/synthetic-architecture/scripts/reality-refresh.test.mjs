import test from "node:test";
import assert from "node:assert/strict";
import {allowedRefreshRequest,validateReplayPayload,createRefreshMiddleware} from "./reality-refresh.mjs";
const okRequest=()=>({
 method:"POST",url:"/api/reality/recheck",
 headers:{host:"127.0.0.1:5173",origin:"http://127.0.0.1:5173","sec-fetch-site":"same-origin"},
 socket:{remoteAddress:"127.0.0.1"}
});
const readout={
 contract:"dongxi.reality-replay/v0",
 sourceKind:"original_synthetic",
 sourceRevision:"library_demo_v1",
 assessments:{
  demo_lookup:{subjectId:"demo_lookup",result:"supported-in-scope"},
  demo_reserve:{subjectId:"demo_reserve",result:"supported-in-scope"}
 },
 toolRuns:[{method:"dependency-cruiser",status:"passed"},{method:"node:test",status:"passed"}]
};
function mockResponse(){
 return {
  statusCode:null,headers:null,body:null,
  writeHead(code,headers){this.statusCode=code;this.headers=headers},
  end(body){this.body=JSON.parse(body)}
 };
}
test("only POST from exact loopback origin can invoke a fixed recheck",()=>{
 assert.equal(allowedRefreshRequest(okRequest()),true);
 for(const change of [
  {method:"GET"},
  {url:"/api/reality/recheck?command=whoami"},
  {headers:{host:"127.0.0.1:5173",origin:"http://evil.example"}},
  {headers:{...okRequest().headers,"sec-fetch-site":"cross-site"}},
  {headers:{...okRequest().headers,"content-length":"200"}},
  {headers:{...okRequest().headers,"transfer-encoding":"chunked"}},
  {socket:{remoteAddress:"10.1.2.3"}},
  {headers:{...okRequest().headers,host:"localhost:5173"}}
 ]){
  const input={...okRequest(),...change};
  assert.equal(allowedRefreshRequest(input),false,JSON.stringify(change));
 }
});
test("refresh is a dev-only fixed-action middleware, not a general command endpoint",async()=>{
 let invoked=0,forwarded=0;
 const middleware=createRefreshMiddleware(async()=>{invoked++;return readout});
 const unrelated=mockResponse();
 await middleware({...okRequest(),url:"/else"},unrelated,()=>forwarded++);
 assert.equal(forwarded,1);
 assert.equal(invoked,0);
 const res=mockResponse();
 await middleware(okRequest(),res,()=>forwarded++);
 assert.equal(res.statusCode,200);
 assert.equal(invoked,1);
 assert.equal(res.body.status,"rechecked");
 assert.equal(res.body.readout.sourceKind,"original_synthetic");
 assert.match(res.body.recheckedAt,/^\d{4}-\d\d-\d\dT/);
 assert.equal(res.headers["Cache-Control"],"no-store, max-age=0");
});
test("rejects foreign source readouts and never leaks a stale prior support on failure",async()=>{
 const wrong=structuredClone(readout);
 wrong.sourceKind="local_private";
 assert.equal(validateReplayPayload(wrong),false);
 const invalid=mockResponse();
 await createRefreshMiddleware(async()=>wrong)(okRequest(),invalid,()=>{throw Error("must not forward")});
 assert.equal(invalid.statusCode,503);
 assert.equal(invalid.body.status,"open");
 assert.equal(invalid.body.readout,undefined);
 const rejected=mockResponse();
 await createRefreshMiddleware(async()=>{throw Error("secret file path")})(okRequest(),rejected,()=>{});
 assert.equal(rejected.statusCode,503);
 assert.equal(JSON.stringify(rejected.body).includes("secret file path"),false);
});
test("concurrent recheck is bounded to one analyzer invocation",async()=>{
 let release,started;
 const work=new Promise(resolve=>{release=resolve});
 const go=new Promise(resolve=>{started=resolve});
 let calls=0;
 const middleware=createRefreshMiddleware(async()=>{
  calls++;started();await work;return readout;
 });
 const first=mockResponse();
 const promise=middleware(okRequest(),first,()=>{});
 await go;
 const second=mockResponse();
 await middleware(okRequest(),second,()=>{});
 assert.equal(second.statusCode,409);
 assert.equal(second.body.status,"busy");
 release();
 await promise;
 assert.equal(calls,1);
 assert.equal(first.statusCode,200);
});
test("refuses requests with missing origin and arbitrary request body",async()=>{
 const request=okRequest(); delete request.headers.origin;
 const out=mockResponse();
 await createRefreshMiddleware(async()=>{throw Error("must not run")})(request,out,()=>{});
 assert.equal(out.statusCode,403);
 assert.equal(out.body.status,"refused");
});
