import service from '@/utils/fetch'

const phindApiPrefix = 'https://phind.com/api/'
const apiMap = {
  suggestions: `${phindApiPrefix}bing/suggestions`,
  search: `${phindApiPrefix}bing/search`,
  answer: `${phindApiPrefix}infer/answer`,
}

export function getSuggestions(params: { [char: string]: string }): Promise<any> {
  return service(apiMap.suggestions, { params })
}
export function search(params: any): Promise<any> {
  return service.post(apiMap.search, {
    userRankList: {
      '.rs': 1,
      'developer.mozilla.org': 1,
      'en.wikipedia.org': 1,
      'github.com': 1,
      'rust-lang': 2,
      'stackoverflow.com': 1,
      'www.amazon.com': -1,
      'www.pinterest.com': -3,
      'www.quora.com': -2,
      'www.reddit.com': 1,
    },
    browserLanguage: 'en',
    freshness: '',
    q: params.q,
  })
}

export function answer(...paramsRest: any[]): Promise<any> {
  return service.post(apiMap.answer, ...paramsRest)
}
