import http from 'k6/http'
import { sleep, check } from 'k6'

export const options = {
  vus: 5,
  duration: '15s',
}

export default function () {
  const res = http.get('http://localhost:5173/random-sex-position/')
  check(res, { 'status 200': r => r.status === 200 })
  sleep(1)
}

