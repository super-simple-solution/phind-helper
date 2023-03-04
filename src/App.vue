<script setup lang="ts">
import { debounce } from './utils/index'
import { getSuggestions, search, concise } from '@/api'

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
const showList = ref(false)

const searchRes: SearchRes = reactive({
  post: [],
  suggestionList: ['react', 'vue'],
})

const toGetSuggestions = debounce(() => {
  loading.value = true
  getSuggestions({
    q: form.input,
  })
    .then((res: string[]) => {
      searchRes.suggestionList = res
      inputChange()
    })
    .finally(() => (loading.value = false))
}, 300)

watch(form, () => {
  showList.value = false
  toGetSuggestions()
})

function inputChange() {
  suggestionsListVisible.value = true
}

function toSelect(index = 0) {
  suggestionsListVisible.value = false
  if (typeof index === 'number' && searchRes.suggestionList[index]) {
    form.input = searchRes.suggestionList[index]
  }
  toSearch()
}

function toSearch() {
  showList.value = true
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
        resultList.value = data.map((item: string) => JSON.parse(item))
      })
      .finally(() => (loading.value = false))
  })
  searchRes.post = []
}
</script>

<template>
  <div class="w-[400px] p-2">
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
        @change="inputChange"
      ></textarea>
      <div class="mt-1 mb-1 text-center">
        <button class="btn btn-primary lift" type="submit" @click="toSearch()">
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
          Search
        </button>
      </div>
      <div v-if="searchRes.suggestionList.length && suggestionsListVisible" class="suggestion-container">
        <div
          v-for="(item, i) in searchRes.suggestionList"
          :key="i"
          class="select-item cursor-pointer px-2 py-2 shadow"
          @click="toSelect(i)"
        >
          {{ item }}
        </div>
      </div>
      <div v-if="resultList.length && showList" class="text-left">
        <a v-for="(item, index) in resultList" :key="index" :href="item.url" class="hover:underline">
          {{ item.sentence }}
        </a>
      </div>
      <Skeleton v-if="loading"></Skeleton>
    </div>
  </div>
</template>
