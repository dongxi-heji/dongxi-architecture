import test from "node:test";
import assert from "node:assert/strict";
import {stripKnownRemoteFontRules,offlineLikeC4Fonts} from "./offline-fonts.mjs";
const cdn="https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-sans";
const fontA="@font-face{font-family:IBM Plex Sans Variable;font-style:normal;src:url("+cdn+":vf@latest/latin-wght-normal.woff2)}";
const fontB="@font-face{font-family:IBM Plex Sans Variable;font-style:normal;src:url("+cdn+":vf@latest/cyrillic-wght-normal.woff2)}";

test("a known two-rule LikeC4 stylesheet no longer requests a remote font",()=>{
 const input="var css=\`"+fontA+fontB+"\`;const answer=42;";
 const result=stripKnownRemoteFontRules(input);
 assert(!result.includes("cdn.jsdelivr.net"));
 assert(result.includes("answer=42"));
});
test("unexpected upstream font CSS is an error, not a silent fallback",()=>{
 assert.throws(()=>stripKnownRemoteFontRules(fontA),/unexpected_likec4_remote_font_contract/);
 assert.throws(()=>stripKnownRemoteFontRules(fontA+fontB+" "+cdn),/unhandled_external_font_reference/);
});
test("the plugin only transforms the expected LikeC4 module",()=>{
 const plug=offlineLikeC4Fonts();
 assert.equal(plug.transform(fontA+fontB,"/tmp/other/react/index.mjs"),null);
 assert(plug.transform(fontA+fontB,"/tmp/node_modules/likec4/react/index.mjs").code.includes("var")===false);
});
