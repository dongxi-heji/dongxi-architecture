// Fictional catalog fixture, not an actual library service.
export const sampleBooks = Object.freeze(['demo-book-a','demo-book-b'])
export function checkAvailability(bookId) { return sampleBooks.includes(bookId) }
