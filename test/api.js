import API from '../api'
import client from './client'

const api = API(client, {
  username: 'admin',
  password: '12345'
})

const run = (command, input) => {
  console.log('Running command "%s" with input %j', command, input)
  return api(command, input).then(success, error)
}

const success = result => console.log('   [SUCCESS] Result: %j', result)
const error = error => console.log('   [ERROR] Result: %j', error)

// add
const tests = [
  ['list'],
  ['list', 'stopped'],
  ['list', 'started'],

  ['add'],
  ['add', 'urltorrent'],
  ['add', 'urltorrent', 'asdasd'],

  ['remove'],
  ['remove', 'urltorrent'],
  ['remove', 'urltorrent', 'asdasd'],
]

let promise = Promise.resolve()
tests.forEach(args => {
  promise = promise.then(_ => run(...args))
})