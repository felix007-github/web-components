<template>
  <article class="demo-card">
    <div class="xml-container" style="border-top: 1px solid #e0e0e0;">
      <WtXmlEditor
        :showTag="true"
        :content="xml"
        :heatBarOption="{
          show: false,
          position: 'right',
        }"
      ></WtXmlEditor>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { setupMonacoEnvironment } from "@lpcp/raw-editor/core";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import xml from "../assets/test.xml?raw";
import { WtXmlEditor } from "@lpcp/xml-editor/vue";

setupMonacoEnvironment({
  getWorker(_workerId, label) {
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    return new editorWorker();
  },
});
</script>
