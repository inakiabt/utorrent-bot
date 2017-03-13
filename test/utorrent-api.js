import API from '../api'
import client from 'library-utorrent'
import omit from 'lodash/omit'

const api = API(client, {
  host: process.env.UTORRENT_HOST,
  port: process.env.UTORRENT_PORT,
  username: process.env.UTORRENT_USERNAME,
  password: process.env.UTORRENT_PASSWORD
})

const run = (command, input) => {
  console.log('Running command "%s" with input %j', command, input)
  return api(command, input).then(success, error)
}

const success = result => console.log('   [SUCCESS] Result: %j', result)
const error = error => console.log('   [ERROR] Result: %j', error, error)

// add
const tests = [
  // ['list', 'finished'],
  // ['list', 'stopped'],

  ['details', 'C05DD7E9813431F9B7E986292EB6D8626CB5AD5D'],
  // ['add', 'urltorrent', 'asdasd'],

  // ['remove'],
  // ['remove', 'urltorrent'],
  // ['remove', 'urltorrent', 'asdasd'],
]

let promise = Promise.resolve()
tests.forEach(args => {
  promise = promise.then(_ => run(...args))
})