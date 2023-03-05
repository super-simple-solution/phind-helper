<script setup lang="ts">
import { debounce } from './utils/index'
import { getSuggestions, search, concise } from '@/api'
import MarkdownIt from 'markdown-it'

type SearchRes = {
  post: string[]
  suggestionList: string[]
}

const loading = ref(false)
const form = reactive({
  input: '',
})
const resultList = ref<{ sentence: string; url: string }[]>([])
const suggestionsListVisible = ref(false)

const searchRes: SearchRes = reactive({
  post: [],
  suggestionList: [],
})

const toGetSuggestions = debounce(() => {
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

const md = new MarkdownIt({ html: true })
function toSearch() {
  showSuggestions(false)
  clearSuggestions()
  search({
    q: form.input,
  }).then((res) => {
    loading.value = true
    concise({
      bingResults: res.processedBingResults,
      question: form.input,
    })
      .then((res) => {
        const data = res.match(/{"sentence":(.*?)}/g)
        resultList.value = data
          .map((item: string) => JSON.parse(item))
          .map((item) => ({
            ...item,
            sentence: md.render(item.sentence),
          }))
      })
      .finally(() => (loading.value = false))
  })
  searchRes.post = []
}
</script>

<template>
  <div class="w-[400px] bg-white p-2">
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
        @keyup.enter="toSearch()"
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
      <div v-if="resultList.length" class="text-left">
        <a v-for="(item, index) in resultList" :key="index" :href="item.url" class="hover:underline">
          {{ item.sentence }}
        </a>
      </div>
      <Skeleton v-if="loading"></Skeleton>
    </div>
  </div>
</template>
