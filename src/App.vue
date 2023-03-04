<script setup lang="ts">
import { debounce } from './utils/index'
import { getSuggestions, search, concise } from '@/api'

type SearchRes = {
  post: string[]
  suggestionList: string[]
}

const form = reactive({
  input: '',
})
const resultList = ref()
const suggestionsListVisible = ref(false)

const searchRes: SearchRes = reactive({
  post: [],
  suggestionList: ['react', 'vue'],
})

const toGetSuggestions = debounce(() => {
  getSuggestions({
    q: form.input,
  }).then((res: string[]) => {
    searchRes.suggestionList = res
  })
}, 500)

watch(form, () => {
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
  search({
    q: form.input,
  }).then((res) => {
    concise({
      bingResults: res.processedBingResults,
      question: form.input,
    }).then((res) => {
      const data = res.match(/{"sentence":(.*?)}/g)
      resultList.value = data.map((item: string) => JSON.parse(item))
    })
  })
  searchRes.post = ['vue', 'react']
}
</script>

<template>
  <div class="p-3">
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
        <button class="btn btn-primary lift" type="submit" @click="toSearch()">Search</button>
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
      <div class="text-left">
        <a v-for="(item, index) in resultList" :key="index" :href="item.url" class="hover:underline">
          {{ item.sentence }}
        </a>
      </div>
    </div>
  </div>
</template>
