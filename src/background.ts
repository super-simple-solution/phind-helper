import { initEventHandler } from '@/utils/extension-action'

const contentReq: { [char: string]: any } = {
  send_request: handleRequest,
}

function handleRequest(requestParam: FetchOptions, sendResponse: (arg0: any) => void) {
  const { resource, options } = requestParam
  fetch(resource, options)
    .then((res) => {
      const contentType = res.headers.get('content-type')
      if (contentType?.includes('text/html')) {
        return res.text()
      }
      // return res.text()
      return res.json()
    })
    .then((res) => {
      sendResponse(res)
    })
}

initEventHandler(contentReq)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request.data, 'request')
  const rdata = request.data
  const tabId = sender.tab && sender.tab.id
  const handler = contentReq[request.greeting]
  if (handler) {
    handler(rdata, sendResponse, tabId)
  }
  return true
})
