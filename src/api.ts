import service from '@/utils/fetch'

const apiMap = {
  suggestions: 'https://phind.com/api/suggestions',
}

export function getSuggestions(params: { [char: string]: string }): Promise<any> {
  return service(apiMap.suggestions, { params })
}
