<script setup lang="ts">
import { computed } from 'vue'
import type { ParsedSong } from '../types'
import { transposeSong } from '../utils/transpose'

const props = defineProps<{
  song: ParsedSong
  transposeOffset: number
}>()

const transposedSong = computed(() => {
  if (props.transposeOffset === 0) {
    return props.song
  }
  return transposeSong(props.song, props.transposeOffset)
})

function printSheet() {
  const printContent = document.querySelector('.chord-sheet')?.innerHTML
  if (!printContent) return

  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ackordblad</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12pt;
          line-height: 1.4;
        }
        h1 {
          font-size: 18pt;
          margin-bottom: 5mm;
          text-align: center;
        }
        h2 {
          font-size: 14pt;
          margin-top: 8mm;
          margin-bottom: 3mm;
        }
        .line {
          margin-bottom: 2mm;
        }
        .chunk {
          display: inline-flex;
          flex-direction: column;
          align-items: flex-start;
          vertical-align: bottom;
        }
        .chunk .chord {
          font-weight: bold;
          color: #333;
          font-size: 0.9em;
          min-height: 1.2em;
        }
        .chunk .text {
          white-space: pre-wrap;
        }
        .empty-line {
          height: 4mm;
        }
      </style>
    </head>
    <body>
      ${printContent}
    </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()

  setTimeout(() => {
    printWindow.print()
  }, 250)
}
</script>

<template>
  <div class="chord-sheet-container">
    <div class="sheet-header">
      <button @click="printSheet" class="print-btn">Skriv ut</button>
    </div>

    <div class="chord-sheet">
      <template v-for="(section, sectionIndex) in transposedSong.sections" :key="sectionIndex">
        <h1 v-if="section.type === 'title'">{{ section.name }}</h1>
        <h2 v-else>{{ section.name }}</h2>

        <div v-for="(line, lineIndex) in section.lines" :key="lineIndex" class="line">
          <template v-if="line.chunks.length > 0 && (line.chunks.some(c => c.chord) || line.chunks.some(c => c.text))">
            <span
              v-for="(chunk, chunkIndex) in line.chunks"
              :key="chunkIndex"
              class="chunk"
              :class="{ 'has-chord': chunk.chord }"
            >
              <span class="chord">{{ chunk.chord || '' }}</span>
              <span class="text">{{ chunk.text }}</span>
            </span>
          </template>
          <div v-else class="empty-line">&nbsp;</div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.chord-sheet-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sheet-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.print-btn {
  padding: 0.5rem 1rem;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.print-btn:hover {
  background: #357abd;
}

.chord-sheet {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
}

.chord-sheet h1 {
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  text-align: center;
}

.chord-sheet h2 {
  font-size: 1.1rem;
  margin: 1.5rem 0 0.5rem 0;
  color: #555;
}

.line {
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.chunk {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  vertical-align: bottom;
}

.chunk .chord {
  font-weight: bold;
  color: #4a90d9;
  font-size: 0.9em;
  min-height: 1.2em;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chunk .text {
  white-space: pre-wrap;
}

.empty-line {
  height: 1.5rem;
}
</style>
