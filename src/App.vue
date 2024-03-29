<script setup lang="ts">
import hljs from 'highlight.js'
import 'highlight.js/styles/stackoverflow-dark.css'
import { debounce } from './utils/index'
import { dateFormat } from '@/utils/moment'
import { getSuggestions, search, answer } from '@/api'
import MarkdownIt from 'markdown-it'
type SearchRes = {
  post: string[]
  suggestionList: string[]
}

const loading = ref(false)
const form = reactive({
  input: '',
})
const resultList = ref<{ sentence: string; url: string; original_sentence: string }[]>([])
const suggestionsListVisible = ref(false)

const searchRes: SearchRes = reactive({
  post: [],
  suggestionList: [],
})

const toGetSuggestions = debounce(() => {
  if (!form.input) {
    clearSuggestions()
    return
  }
  loading.value = true
  getSuggestions({
    q: form.input,
  })
    .then((res: string[]) => {
      searchRes.suggestionList = res
      showSuggestions()
    })
    .finally(() => (loading.value = false))
}, 300)

function clearSuggestions() {
  searchRes.suggestionList = []
}

function showSuggestions(show = true, immidiate = true) {
  if (immidiate) {
    suggestionsListVisible.value = show
  } else {
    // 选中后消失
    setTimeout(() => (suggestionsListVisible.value = show))
  }
}

function toSelect(index = 0) {
  if (typeof index === 'number' && searchRes.suggestionList[index]) {
    form.input = searchRes.suggestionList[index]
  }
  toSearch()
}

const md: MarkdownIt = new MarkdownIt({
  html: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (e) {
        console.log(e)
      }
    } else {
      return hljs.highlightAuto(str).value
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code> <a href="baidu.com"></a> </pre>`
    // return ''; // use external default escaping
  },
})
function toSearch() {
  if (!form.input) return
  showSuggestions(false)
  clearSuggestions()
  resultList.value = []
  loading.value = true
  search({
    q: form.input,
  }).then((res) => {
    answer({
      bingResults: res.processedBingResults,
      question: form.input,
      options: {
        skill: 'intermediate',
        detailed: true,
        creative: false,
        language: 'en',
        date: dateFormat(new Date().getTime()),
      },
    })
      .then((res) => {
        const resRaw = Array.from(res.matchAll(/data:\s{"sentence"[^\n]+/gm), (m: any) => Array.from(m)[0])
        const dataList = resRaw
          .map((item: string | unknown) => {
            if (typeof item === 'string') {
              return item.replace(/^\s*?data:/g, '')?.trim()
            }
            return ''
          })
          .filter(Boolean)
        resultList.value = dataList.map((item: string) => {
          let jsonRes: any = {}
          try {
            jsonRes = JSON.parse(item)
          } catch (error) {
            console.log(item, 'error res')
          }
          const mdRes = md.render(jsonRes.sentence || '')
          return {
            ...jsonRes,
            original_sentence: jsonRes.sentence,
            sentence: mdRes,
          }
        })
      })
      .finally(() => (loading.value = false))
  })
  searchRes.post = []
}
</script>

<template>
  <div class="w-[500px] bg-white p-2">
    <div class="text-center">
      <h2 class="text-2xl">Phind</h2>
      <p class="text-lg">The AI search engine for developers.</p>
    </div>
    <div class="input-group border-multicolor darkmode-light">
      <textarea
        v-model="form.input"
        autofocus
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        name="q"
        class="form-control darkmode-light w-full bg-white shadow"
        rows="2"
        placeholder="For best results, use natural language. How to...? Why is...?"
        aria-label="For best results, use natural language. How to...? Why is...?"
        style="resize: none; height: 62px"
        @keydown.enter.prevent="toSearch()"
        @input="toGetSuggestions"
      ></textarea>
      <div class="my-3 mb-1 flex justify-center text-center">
        <button class="btn btn-primary lift flex items-center justify-center" type="submit" @click="toSearch()">
          <svg
            v-if="loading"
            class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Search</span>
        </button>
      </div>
      <div v-if="suggestionsListVisible && searchRes.suggestionList.length" class="suggestion-container">
        <div
          v-for="(item, i) in searchRes.suggestionList"
          :key="i"
          class="select-item cursor-pointer px-2 py-2 shadow"
          @click="toSelect(i)"
        >
          {{ item }}
        </div>
      </div>
      <div v-if="resultList.length" class="result-box text-left">
        <template v-for="(item, index) in resultList" :key="index">
          <a v-if="item.url && !item.original_sentence.includes('```')" :href="item.url" class="hover:underline">
            <span v-html="item.sentence"></span>
          </a>
          <span v-else v-html="item.sentence"></span>
        </template>
      </div>
      <Skeleton v-if="loading"></Skeleton>
    </div>
  </div>
</template>

<style lang="scss">
.result-box {
  font-size: 14px;
  ul li,
  ol li {
    line-height: 2;
    code {
      background-color: rgb(40, 42, 54);
      padding: 3px;
      border-radius: 8px;
      color: white;
    }
  }
  p {
    margin-bottom: 10px;
    code {
      background-color: rgb(40, 42, 54);
      padding: 3px;
      border-radius: 8px;
      color: white;
    }
  }
  span pre {
    display: block;
    background-color: rgb(40, 42, 54);
    border-radius: 12px;
    margin-bottom: 1rem;
    margin-top: 0;
    overflow: auto;
    margin-top: 0.75rem;
    padding: 0.25rem;
    unicode-bidi: bidi-override;
    code {
      color: rgb(248, 248, 242);
      text-shadow: rgb(0 0 0 / 30%) 0px 1px;
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
      text-align: left;
      white-space: pre;
      word-spacing: normal;
      word-break: normal;
      overflow-wrap: normal;
      line-height: 1.5;
      tab-size: 4;
      hyphens: none;
    }
  }
}
</style>
