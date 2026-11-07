// Synthetic example only. No external systems.
import {checkAvailability} from './catalog.mjs'
import {recordLoan} from './ledger.mjs'
export function requestBook(bookId) {
  return checkAvailability(bookId) ? recordLoan(bookId) : {status:'unavailable'}
}
