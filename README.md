# redirect-function-output-streams

redirect `stdout` and/or `stderr` streams from within a function call.  WAT!

streams are not primatives of functions--they are primatives of processes. however,
it is feasible to isolate if stream content is being written within the context of a specific function's stack, and handle it.

```js
var redirect = require('redirect-function-output-streams')
function a () {
  console.log('intercepted and streamed elsewhere')
  console.error('err msg!')
  void function a_child () {
    console.log('also intercepted and streamed elsewhere')
  }()
  somethingElse() // all other stdout writes, ...also streamed elsewhere
}
console.log('will show in stdout')
redirect({ stdout: someFileStream }, a)()
```

## warning

- this module uses long stack traces, and consequently may create perf issues. try it, test it.
- if existing code intercepts `process.std[out|err]`, all guarantees are off!  IDEs for example, likely intercept streams before your code does, and may write anything they care to out!
- don't redirect within a redirect.  that's just uncool! :)
- this module might be a mistake.  maybe we should just be using `process.fork(...)`, but hey.
