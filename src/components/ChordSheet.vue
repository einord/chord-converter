<script setup lang="ts">
import { computed } from 'vue'
import type { ParsedSong } from '../types'
import { transposeSong } from '../utils/transpose'

const props = defineProps<{
  song: ParsedSong
  transposeOffset: number
  columns: number
}>()

const transposedSong = computed(() => {
  if (props.transposeOffset === 0) {
    return props.song
  }
  return transposeSong(props.song, props.transposeOffset)
})

const metadataDisplay = computed(() => {
  const metadata = props.song.metadata
  if (!metadata) return ''

  const musik = metadata.musik?.trim()
  const text = metadata.text?.trim()

  if (!musik && !text) return ''

  // Check if musik and text are the same (case-insensitive)
  if (musik && text && musik.toLowerCase() === text.toLowerCase()) {
    return `Musik & Text: ${musik}`
  }

  const parts: string[] = []
  if (musik) parts.push(`Musik: ${musik}`)
  if (text) parts.push(`Text: ${text}`)

  return parts.join(' | ')
})

const hasCopyright = computed(() => {
  return !!props.song.metadata?.copyright?.trim()
})

const copyrightText = computed(() => {
  const copyright = props.song.metadata?.copyright?.trim()
  return copyright ? `\u00A9 ${copyright}` : ''
})

// Separate title section from content sections
const titleSection = computed(() => {
  return transposedSong.value.sections.find(s => s.type === 'title')
})

const contentSections = computed(() => {
  return transposedSong.value.sections.filter(s => s.type !== 'title')
})

function printSheet() {
  const printContent = document.querySelector('.chord-sheet')?.innerHTML
  if (!printContent) return

  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) return

  const documentTitle = titleSection.value?.name || 'Ackordblad'

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${documentTitle}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        * {
          box-sizing: border-box;
        }
        html, body {
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12pt;
          line-height: 1.4;
        }
        .song-header {
          margin-bottom: 5mm;
        }
        .song-content {
          column-count: ${props.columns};
          column-gap: 10mm;
        }
        .section {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
          display: inline-block;
          width: 100%;
        }
        h1 {
          font-size: 18pt;
          margin: 0 0 3mm 0;
          text-align: center;
        }
        h2 {
          font-size: 14pt;
          margin-top: 4mm;
          margin-bottom: 2mm;
          page-break-after: avoid !important;
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
        .metadata {
          text-align: center;
          font-size: 10pt;
          color: #666;
          margin-bottom: 3mm;
        }
        .copyright-footer {
          text-align: center;
          font-size: 9pt;
          color: #888;
          margin-top: 10mm;
          padding-top: 3mm;
          border-top: 1px solid #ddd;
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
      <!-- Title and metadata outside columns -->
      <div v-if="titleSection" class="song-header">
        <h1>{{ titleSection.name }}</h1>
        <div v-if="metadataDisplay" class="metadata">{{ metadataDisplay }}</div>
      </div>

      <!-- Content sections in columns -->
      <div class="song-content" :style="{ columnCount: columns }">
        <div
          v-for="(section, sectionIndex) in contentSections"
          :key="sectionIndex"
          class="section"
        >
          <h2>{{ section.name }}</h2>

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
        </div>
      </div>

      <div v-if="hasCopyright" class="copyright-footer">{{ copyrightText }}</div>
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

.song-header {
  margin-bottom: 1rem;
}

.song-content {
  column-gap: 2rem;
}

.section {
  display: inline-block;
  width: 100%;
  page-break-inside: avoid;
  break-inside: avoid;
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

.metadata {
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.copyright-footer {
  text-align: center;
  font-size: 0.85rem;
  color: #888;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}
</style>
