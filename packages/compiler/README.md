# @neurova/compiler

Parses `.nv` single-file components and emits JavaScript targeting either
`@neurova/runtime` (default) or React.

```nv
component Counter(start = 0) {
  state count = start
  <button on:click={() => count.set(count() + 1)}>
    Clicked {count()} times
  </button>
}
```

```bash
npx neurova-compile Counter.nv --target runtime -o Counter.js
```

Original DSL by neurova. © @analyticswithharry and Squid Consultancy Group Ltd. MIT.
