var ava = require('ava').default
var callsites = require('callsites')

// ava.beforeEach(async function (t) {
//   var port = await freeport()
//   t.context.api = new Service()
//   t.context.origin = `http://localhost:${port}`
//   await t.context.api.start({ server: { port } })
// })
// ava.afterEach.always(t => t.context.api.stop())

function root () {
  return function child (cb) {
    return cb()
  }
}

ava('callsites:independence', async function (t) {
  function getCallsiteOfParent () {
    var sites = callsites()
    // sites[0] ~= getCallsiteOfParent
    // sites[1] ~= child
    return sites[1]
  }
  var a = root()(getCallsiteOfParent)
  var b = root()(getCallsiteOfParent)
  t.not(a, b)
  t.is(a.getFunctionName(), b.getFunctionName())
  t.is(a.getFunctionName(), 'child')
})
