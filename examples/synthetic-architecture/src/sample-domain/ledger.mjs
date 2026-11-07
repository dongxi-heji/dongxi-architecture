// Fictional ledger, always in-memory and deterministic.
import {createNotice} from './notice.mjs'
export function recordLoan(bookId) {
  return {status:'simulated',bookId,notice:createNotice(bookId)}
}
