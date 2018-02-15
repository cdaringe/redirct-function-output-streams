var ava = require('ava').default
var MemoryStream = require('memory-stream')
var redirect = require('../')
var bluebird = require('bluebird')

async function a () {
  console.log('so:a1')
  console.error('se:a1')
  await bluebird.delay(5)
  console.log('so:a2')
  console.error('se:a2')
}

function b (cb) {
  console.log('so:b1')
  console.error('se:b1')
  setTimeout(() => {
    console.log('so:b2')
    console.error('se:b2')
    cb()
  }, 2)
}

ava('redirects:so', async function (t) {
  var aOut = new MemoryStream()
  var bOut = new MemoryStream()
  var redirectA = redirect({ stdout: aOut }, a)
  await redirectA()
  var redirectB = redirect({ stdout: bOut }, b)
  await bluebird.promisify(redirectB)()
  var aFinal = aOut.toString()
  var bFinal = bOut.toString()
  t.is(aFinal, 'so:a1\nso:a2\n')
  t.is(bFinal, 'so:b1\nso:b2\n')
})

ava('redirects:stderr', async function (t) {
  var aErr = new MemoryStream()
  var bErr = new MemoryStream()
  var redirectA = redirect({ stderr: aErr }, a)
  await redirectA()
  var redirectB = redirect({ stderr: bErr }, b)
  await bluebird.promisify(redirectB)()
  var aFinal = aErr.toString()
  var bFinal = bErr.toString()
  t.is(aFinal, 'se:a1\nse:a2\n')
  t.is(bFinal, 'se:b1\nse:b2\n')
})
