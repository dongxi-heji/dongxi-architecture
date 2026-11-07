// Vite raw imports are allowed ONLY because these are invented, PUBLIC fixture
// files. Do not replace this with imports of a private project, even locally.
// The displayed text is a bundled snapshot, not a fresh backend file read.
import api from './sample-domain/api.mjs?raw'
import catalog from './sample-domain/catalog.mjs?raw'
import ledger from './sample-domain/ledger.mjs?raw'
import notice from './sample-domain/notice.mjs?raw'
import behaviorTest from './sample-domain/behavior.test.mjs?raw'

export const publicSourceSnapshots:Readonly<Record<string,string>>=Object.freeze({
 api,catalog,ledger,notice,behavior_test:behaviorTest
})
