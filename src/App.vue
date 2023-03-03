<script setup lang="ts">
import { debounce } from './utils/index'
import { getSuggestions, search, concise } from './api'
type SearchRes = {
  post: string[]
  suggestionList: string[]
}

const form = reactive({
  input: '',
})

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

function toSearch(index = 0) {
  if (typeof index === 'number' && searchRes.suggestionList[index]) {
    form.input = searchRes.suggestionList[index]
  }
  search({
    q: form.input,
  }).then((res) => {
    concise({
      bingResults: res.processedBingResults,
      question: form.input,
    }).then((res) => {
      console.log(res, 'res')
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
        class="form-control darkmode-light bg-white shadow"
        rows="2"
        placeholder="For best results, use natural language. How to...? Why is...?"
        aria-label="For best results, use natural language. How to...? Why is...?"
        style="resize: none; height: 62px; width: 200px"
      ></textarea>
      <div class="mt-1 mb-1 text-center">
        <button class="btn btn-primary lift" type="submit" @click="toSearch()">Search</button>
      </div>
      <div v-if="searchRes.suggestionList.length" class="suggestion-container">
        <div
          v-for="(item, i) in searchRes.suggestionList"
          :key="i"
          class="select-item w-[200px] cursor-pointer px-2 py-2 shadow"
          @click="toSearch(i)"
        >
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>
