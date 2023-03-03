import { initEventHandler } from '@/utils/extension-action'

const contentReq = {
  'example-func': example,
}

function example() {
  console.log('example')
}

initEventHandler(contentReq)
