require('trace/trace')
var hook = require('hook-std')
var callsites = require('callsites')
var REDIRECTED_STDOUT_FNS = {}
var REDIRECTED_STDERR_FNS = {}

var STATE = {
  REDIRECTING: false,

  STDOUT_HOOK: null,
  STDOUT_UNHOOK: null,

  STDERR_HOOK: null,
  STDERR_UNHOOK: null,

  REDIRECTED_COUNTER: 0
}
function init () {
  STATE.STDOUT_HOOK = function redirectFnStdout (output) {
    // find matching callsite, up the stack. if found, we are redirecting
    // for that site (i.e. function's) stdout.
    // otherwise, send directly to stdio stream
    for (var site of callsites()) {
      var fnName = site.getFunctionName()
      if (fnName in REDIRECTED_STDOUT_FNS) {
        REDIRECTED_STDOUT_FNS[fnName].write(output)
        return
      }
    }
    return STATE.STDOUT_HOOK.originalStream.pipe(output)
  }
  STATE.STDOUT_UNHOOK = hook.stdout({ silent: true }, STATE.STDOUT_HOOK)

  STATE.STDERR_HOOK = function redirectFnStderr (output) {
    // find matching callsite, up the stack. if found, we are redirecting
    // for that site (i.e. function's) stdout.
    // otherwise, send directly to stdio stream
    for (var site of callsites()) {
      var fnName = site.getFunctionName()
      if (fnName in REDIRECTED_STDERR_FNS) {
        REDIRECTED_STDERR_FNS[fnName].write(output)
        return
      }
    }
    return STATE.STDERR_HOOK.originalStream.pipe(output)
  }
  STATE.STDERR_UNHOOK = hook.stderr({ silent: true }, STATE.STDERR_HOOK)

  STATE.REDIRECTING = true
}

function redirectFunctionOutputStreams (opts, fn) {
  opts = opts || {}
  var { stderr, stdout } = opts // eslint-disable-line
  if (!STATE.REDIRECTING) init()
  var redirectFnName = `redirectStream_${fn.name || ''}_${STATE.REDIRECTED_COUNTER}`
  ++STATE.REDIRECTED_COUNTER
  /* eslint-disable */
  eval(`
    var redir = function ${redirectFnName} () {
      if (stdout) REDIRECTED_STDOUT_FNS['${redirectFnName}'] = stdout
      if (stderr) REDIRECTED_STDERR_FNS['${redirectFnName}'] = stderr
      return fn.apply(null, arguments)
    }
  `)
  return redir
  /* eslint-enable */
}

module.exports = redirectFunctionOutputStreams
