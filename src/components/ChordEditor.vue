<script setup lang="ts">
const modelValue = defineModel<string>({ default: '' })
</script>

<template>
  <div class="chord-editor">
    <textarea
      v-model="modelValue"
      placeholder="# Sångtitel

## Vers 1
[G]Amazing [G7]grace, how [C]sweet the [G]sound
That [G]saved a [Em]wretch like [D]me

## Refräng
[C]This is the [G]chorus..."
      class="editor-textarea"
    ></textarea>
  </div>
</template>

<style scoped>
.chord-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-textarea {
  flex: 1;
  width: 100%;
  padding: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: none;
}

.editor-textarea:focus {
  outline: none;
  border-color: #4a90d9;
  box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.2);
}
</style>
