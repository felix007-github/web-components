<template>
  <article class="demo-card">
    <div class="flex-col" style="height: calc(100% - 45px);">
      <div class="xml-raw-container">
        <WtRawEditor :content="xml"></WtRawEditor>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { setupMonacoEnvironment } from '@lpcp/raw-editor/core';
import { WtRawEditor } from '@lpcp/raw-editor/vue';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import xml from '../assets/test.xml?raw';

setupMonacoEnvironment({
  getWorker(_workerId, label) {
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    return new editorWorker();
  },
});
</script>
