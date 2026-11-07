// Guards only the initial shell; this does not replace runtime performance review.
import {readdirSync,statSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {join} from "node:path";
const base=fileURLToPath(new URL("../dist/assets/",import.meta.url));
const files=readdirSync(base).filter(n=>n.endsWith(".js"));
const initial=files.filter(n=>/^index-[\w-]+\.js$/.test(n));
const graphic=files.filter(n=>/^LikeC4Canvas-[\w-]+\.js$/.test(n));
if(initial.length!==1||graphic.length!==1)throw Error("lazy_loading_boundary_lost:"+JSON.stringify(files));
const size=path=>statSync(join(base,path)).size;
const shell=size(initial[0]),heavy=size(graphic[0]);
console.log(JSON.stringify({initialShellBytes:shell,asyncDiagramBytes:heavy,shellBudgetBytes:350000}));
if(shell>350000)throw Error("initial_shell_size_regression");
