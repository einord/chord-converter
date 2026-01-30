<script setup lang="ts">
import { ref, computed } from 'vue'
import ChordEditor from './components/ChordEditor.vue'
import TransposeControls from './components/TransposeControls.vue'
import ChordSheet from './components/ChordSheet.vue'
import { parseSong } from './utils/parser'
import type { ParsedSong } from './types'

const inputText = ref('')
const originalKey = ref('C')
const transposeOffset = ref(0)
const columns = ref(1)

const parsedSong = computed<ParsedSong>(() => {
  return parseSong(inputText.value)
})
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Ackordis</h1>
    </header>

    <main class="app-main">
      <div class="left-panel">
        <div class="controls-row">
          <TransposeControls
            v-model:originalKey="originalKey"
            v-model:transposeOffset="transposeOffset"
          />
          <div class="column-controls">
            <label for="columns">Spalter:</label>
            <select id="columns" v-model="columns">
              <option :value="1">1</option>
              <option :value="2">2</option>
              <option :value="3">3</option>
            </select>
          </div>
        </div>
        <ChordEditor v-model="inputText" />
      </div>

      <div class="right-panel">
        <ChordSheet
          :song="parsedSong"
          :transposeOffset="transposeOffset"
          :columns="columns"
        />
      </div>
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #f0f2f5;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: 1rem;
  background: #2c3e50;
  color: white;
}

.app-header h1 {
  font-size: 1.25rem;
  font-weight: 500;
}

.app-main {
  flex: 1;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  overflow: hidden;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.controls-row {
  display: flex;
  gap: 1rem;
  align-items: stretch;
  margin-bottom: 0;
}

.controls-row > * {
  margin-bottom: 0 !important;
}

.column-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.column-controls label {
  font-weight: 500;
  font-size: 14px;
}

.column-controls select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

@media (max-width: 768px) {
  .app-main {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    flex: none;
    height: 50%;
  }
}
</style>
