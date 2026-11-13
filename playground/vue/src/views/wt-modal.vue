<template>
  <article class="demo-card">
    <div class="button-stack">
      <WtButton @click="isOpen = true">open modal</WtButton>
    </div>

    <WtModal v-model="isOpen" titleText="Custom Modal Title">
      <div slot="content">
        <p>This is the content of the modal.</p>
      </div>
      <div slot="footer" class="button-stack">
        <WtButton plain @click="isOpen = false">Cancel</WtButton>
        <WtButton @click="isOpen = false">Confirm</WtButton>
      </div>
    </WtModal>
  </article>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { WtButton, WtModal } from '@mache-hangar/components/vue';

const isOpen = ref(false);
</script>
