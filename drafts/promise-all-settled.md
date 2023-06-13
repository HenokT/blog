---
title: A better Promise.all
publish_date: 2022-06-22
---

Ever since Promises was introduced in JavaScript I have been using `Promise.all` to execute async code in parallel.

```js
await Promise.all([
  fetch(`https://swapi.dev/api/planets`),
  fetch(`https://swapi.dev/api/people`),
  fetch(`://invalid-url`),
]);
```
