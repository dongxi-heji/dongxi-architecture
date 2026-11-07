import test from "node:test";
import assert from "node:assert/strict";
import {requestBook} from "./api.mjs";

test("available fictional book returns simulated in-memory result and mock notice",()=>{
 const result=requestBook("demo-book-a");
 assert.deepEqual(result,{
  status:"simulated",
  bookId:"demo-book-a",
  notice:"Mock notice for demo-book-a"
 });
});
test("missing fictional book does not create a simulated loan",()=>{
 assert.deepEqual(requestBook("not-in-demo-catalog"),{status:"unavailable"});
});
