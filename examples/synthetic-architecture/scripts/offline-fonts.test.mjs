import test from "node:test";
import assert from "node:assert/strict";
import {stripKnownRemoteFontRules,offlineLikeC4Fonts} from "./offline-fonts.mjs";
const cdn="https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-sans";
const subsets=["latin","cyrillic","cyrillic-ext","greek","latin-ext","vietnamese"];
const fonts=subsets.map(x=>"@font-face{font-family:IBM Plex Sans Variable;font-style:normal;src:url("+cdn+":vf@latest/"+x+"-wght-normal.woff2)}").join("");

test("all six expected LikeC4 font subsets no longer requests a remote font",()=>{
 const input="var css=\`"+fonts+"\`;const answer=42;";
 const result=stripKnownRemoteFontRules(input);
 assert(!result.includes("cdn.jsdelivr.net"));
 assert(result.includes("answer=42"));
});
test("unexpected upstream font CSS is an error, not a silent fallback",()=>{
 assert.throws(()=>stripKnownRemoteFontRules(fonts.slice(0,fonts.indexOf("}@font-face")+1)),/unexpected_likec4_remote_font_contract/);
 assert.throws(()=>stripKnownRemoteFontRules(fonts+" "+cdn),/unhandled_external_font_reference/);
});
test("the plugin only transforms the expected LikeC4 module",()=>{
 const plug=offlineLikeC4Fonts();
 assert.equal(plug.transform(fonts,"/tmp/other/react/index.mjs"),null);
 assert(plug.transform(fonts,"/tmp/node_modules/likec4/react/index.mjs").code.includes("var")===false);
});
