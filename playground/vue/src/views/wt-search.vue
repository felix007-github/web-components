<template>
  <article class="demo-card" style="gap: 24px; display: flex; flex-direction: column">
    <!-- 三种尺寸 -->
    <div style="display: flex; flex-direction: column; gap: 12px">
      <p style="margin: 0; font-size: 13px; color: #78909C">三种尺寸</p>
      <div style="display: flex; flex-direction: column; gap: 10px">
        <WtSearch size="small" placeholder="Small 搜索..." />
        <WtSearch size="medium" placeholder="Medium 搜索..." />
        <WtSearch size="large" placeholder="Large 搜索..." />
      </div>
    </div>

    <!-- 双向绑定 -->
    <div style="display: flex; flex-direction: column; gap: 12px">
      <p style="margin: 0; font-size: 13px; color: #78909C">双向绑定</p>
      <WtSearch
        v-model="searchValue"
        placeholder="输入内容..."
        @wt-search="onSearch"
      />
      <span style="font-size: 13px; color: #455A64">
        当前值：{{ searchValue || '（空）' }}
      </span>
      <span v-if="searchResult" style="font-size: 13px; color: #51B5FC">
        搜索触发：{{ searchResult }}
      </span>
    </div>

    <!-- 预填内容 + clearable -->
    <div style="display: flex; flex-direction: column; gap: 12px">
      <p style="margin: 0; font-size: 13px; color: #78909C">预填内容 + clearable</p>
      <WtSearch v-model="prefilledValue" :clearable="true" placeholder="有预填内容..." />
    </div>

    <!-- 不可清除 -->
    <div style="display: flex; flex-direction: column; gap: 12px">
      <p style="margin: 0; font-size: 13px; color: #78909C">不可清除（clearable=false）</p>
      <WtSearch :clearable="false" default-value="不可清除内容" placeholder="不显示清除图标" />
    </div>

    <!-- 禁用状态 -->
    <div style="display: flex; flex-direction: column; gap: 12px">
      <p style="margin: 0; font-size: 13px; color: #78909C">禁用状态</p>
      <WtSearch disabled placeholder="禁用搜索框" />
      <WtSearch disabled default-value="禁用带内容" clearable />
    </div>

    <!-- 自定义宽度 -->
    <div style="display: flex; flex-direction: column; gap: 12px">
      <p style="margin: 0; font-size: 13px; color: #78909C">自定义宽度</p>
      <WtSearch width="100%" placeholder="宽度 100%" />
      <WtSearch width="200px" placeholder="宽度 200px" size="small" />
    </div>
  </article>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { WtSearch } from '@mache-hangar/components/vue';

const searchValue = ref('');
const prefilledValue = ref('预填内容');
const searchResult = ref('');

const onSearch = (e: CustomEvent<string>) => {
  searchResult.value = e.detail;
};
</script>
