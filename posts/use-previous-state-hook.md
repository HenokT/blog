---
title: Remembering the previous value of a prop or a state while using React Hooks
publish_date: 2019-06-15
---

Prior to the introduction of hooks, if you want to know the previous value of a React component’s prop or state, you’d have to implement the life cycle method `componentDidUpdate(prevProps, prevState){...}`. However, with hooks, you can’t use class components and life-cycle methods and there is no built-in mechanism of accessing the previous value of a prop or state from your function components. Fortunately, you can write a custom hook that relies on `useRef` and `useEffect` to remember previous values of any value it’s provided.

```jsx
import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";

const usePreviousValue = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

function App() {
  const [value, setValue] = useState("");
  const prevValue = usePreviousValue(value);
  return (
    <div className="App container mt-5">
      <input
        className="form-control"
        placeholder="Type something here"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="text-left mt-2">Curr Value: {value}</div>
      <div className="text-left">Prev Value: {prevValue}</div>
    </div>
  );
}
```

You can even combine it with `useState` to create another custom hook that returns both the previous and current value of a state in one call

```jsx
const useTraceableState = initialValue => {
  const [value, setValue] = useState(initialValue);
  const prevValue = usePreviousValue(value);
  return [prevValue, value, setValue];
};
```

That’s it. You got to love the composability of hooks!