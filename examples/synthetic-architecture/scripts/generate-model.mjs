// Builds an intentionally lossy LikeC4 view of an invented software fixture.
// The model is a derived visualization, never a source of operational truth.
import {readFileSync,writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import {fixture,validateFixture} from "../src/fixture.mjs";

const output=new URL("../src/model.c4",import.meta.url);
function quoted(text) {
 if(typeof text!=="string"||!text.trim()||/['\\\r\n]/.test(text))throw Error("unsafe_likec4_text");
 return "'"+text+"'";
}
export function renderModel(data) {
 const errors=validateFixture(data);
 if(errors.length)throw Error("fixture_invalid:"+errors.join(","));
 const lines=[
  "// GENERATED — derived from src/fixture.mjs (invented example only).",
  "// Regenerate with npm run generate:model. Not a factual architecture authority.",
  "specification {", "  element component", "}", "", "model {"
 ];
 for(const n of data.nodes)lines.push("  "+n.id+" = component "+quoted(n.label));
 lines.push("");
 for(const r of data.relations)lines.push("  "+r.from+" -> "+r.to+" "+quoted(r.label));
 lines.push("}","","views {","  view index {","    title "+quoted(data.title),"    include *","  }","}","");
 return lines.join("\n");
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(fileURLToPath(import.meta.url))){
 const expected=renderModel(fixture);
 if(process.argv[2]==="--check"){
   if(readFileSync(output,"utf8")!==expected)throw Error("model_drift_regenerate_and_review");
   console.log("synthetic model: exact source projection");
 }else if(process.argv[2]==="--write"){
   writeFileSync(output,expected);console.log("synthetic model generated");
 }else{console.error("Usage: generate-model.mjs --check|--write");process.exitCode=2}
}
