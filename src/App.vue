<script setup lang="ts">
import { debounce } from './utils/index'
import { getSuggestions } from './api'
type SearchRes = {
  post: string[]
  suggestionList: string[]
}

const form = reactive({
  input: '',
})

const searchRes: SearchRes = reactive({
  post: [],
  suggestionList: [],
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
    console.log('to search')
  }
  searchRes.post = ['vue', 'react']
}
</script>

<template>
  <div class="text-center">
    <h2 class="text-2xl">Phind</h2>
    <p class="text-lg">The AI search engine for developers.</p>
  </div>
  <div class="input-group border-multicolor darkmode-light shadow">
    <textarea
      v-model="form.input"
      autofocus
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      name="q"
      class="form-control darkmode-light bg-white"
      rows="2"
      placeholder="For best results, use natural language. How to...? Why is...?"
      aria-label="For best results, use natural language. How to...? Why is...?"
      style="resize: none; height: 62px; width: 200px"
    ></textarea>
    <div class="mt-2 mb-1 text-center">
      <button class="btn btn-primary lift" type="submit" @click="toSearch()">Search</button
      ><button style="margin-left: 4%" class="btn btn-white lift ml-3" type="submit">Surprise Me</button>
    </div>
    <div v-for="(item, i) in searchRes.post" :key="i" @click="toSearch(i)">{{ item }}</div>
  </div>
</template>
