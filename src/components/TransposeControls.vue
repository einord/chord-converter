<script setup lang="ts">
import { computed } from 'vue'
import { getKeyFromOffset } from '../utils/transpose'

const originalKey = defineModel<string>('originalKey', { default: 'C' })
const transposeOffset = defineModel<number>('transposeOffset', { default: 0 })

const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const currentKey = computed(() => {
  return getKeyFromOffset(originalKey.value, transposeOffset.value)
})

function transposeUp() {
  transposeOffset.value = (transposeOffset.value + 1) % 12
}

function transposeDown() {
  transposeOffset.value = (transposeOffset.value - 1 + 12) % 12
}

function reset() {
  transposeOffset.value = 0
}
</script>

<template>
  <div class="transpose-controls">
    <div class="control-group">
      <label for="original-key">Originaltonart:</label>
      <select id="original-key" v-model="originalKey">
        <option v-for="key in keys" :key="key" :value="key">{{ key }}</option>
      </select>
    </div>

    <div class="control-group">
      <label>Transponera:</label>
      <div class="transpose-buttons">
        <button @click="transposeDown" class="transpose-btn">−</button>
        <span class="offset-display">{{ transposeOffset >= 0 ? '+' : '' }}{{ transposeOffset }}</span>
        <button @click="transposeUp" class="transpose-btn">+</button>
        <button @click="reset" class="reset-btn" v-if="transposeOffset !== 0">Återställ</button>
      </div>
    </div>

    <div class="current-key" v-if="transposeOffset !== 0">
      Ny tonart: <strong>{{ currentKey }}</strong>
    </div>
  </div>
</template>

<style scoped>
.transpose-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 500;
  font-size: 14px;
}

.control-group select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.transpose-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.transpose-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transpose-btn:hover {
  background: #e9e9e9;
}

.offset-display {
  min-width: 40px;
  text-align: center;
  font-weight: bold;
  font-family: monospace;
}

.reset-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  cursor: pointer;
}

.reset-btn:hover {
  background: #e9e9e9;
}

.current-key {
  font-size: 14px;
  margin-left: auto;
}
</style>
