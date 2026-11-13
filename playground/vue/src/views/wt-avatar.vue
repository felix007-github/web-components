<template>
  <article class="demo-card">
    <div class="avatar-box">
      <WtAvatar text="Felix, Li" size="large"></WtAvatar>
      <WtAvatar text="Duo, Li" size="medium"></WtAvatar>
      <WtAvatar text="Charlie, Li" size="small"></WtAvatar>
      <WtAvatar text="Dana, Li" shape="square"></WtAvatar>
      <WtAvatar
        :src="useImage"
        alt="avatar"
        size="large"
      ></WtAvatar>
      <WtAvatar
        :src="useImage"
        alt="avatar"
        size="medium"
      ></WtAvatar>
      <WtAvatar
        text="Dana, Li"
        shape="square"
        :styles="{
          backgroundColor: 'lightblue',
          color: 'white',
        }"
      ></WtAvatar>
      <WtAvatarGroup
        :list="[
          { text: 'Alice, Li' },
          { text: 'Bob, Li' },
          { text: 'Charlie, Li' },
          { text: 'Dana, Li' },
        ]"
        :max="3"
        size="large"
      ></WtAvatarGroup>
      <WtAvatarGroup
        :list="[
          { text: 'Alice, Li' },
          { text: 'Bob, Li' },
          { text: 'Charlie, Li' },
          { text: 'Dana, Li' },
        ]"
        :max="3"
      ></WtAvatarGroup>
      <WtAvatarGroup
        :list="[
          { text: 'Alice, Li' },
          { text: 'Bob, Li' },
          { text: 'Charlie, Li' },
          { text: 'Dana, Li' },
        ]"
        :max="3"
        size="small"
      ></WtAvatarGroup>
    </div>
    <div class="avatar-box" style="margin-top: 20px">
      <WtAvatar text="Felix, Li" size="large"></WtAvatar>
      <WtAvatar text="Duo, Li" size="medium"></WtAvatar>
      <WtAvatar text="Charlie, Li" size="small"></WtAvatar>
      <WtAvatar text="Dana, Li" shape="square"></WtAvatar>
      <WtAvatar
        :src="useImage"
        alt="avatar"
        size="large"
      ></WtAvatar>
      <WtAvatar
        :src="useImage"
        alt="avatar"
        size="medium"
      ></WtAvatar>
      <WtAvatar
        text="Dana, Li"
        shape="square"
        :styles="{
          backgroundColor: 'lightblue',
          color: 'white',
        }"
      ></WtAvatar>
      <WtAvatarGroup
        :list="[
          { text: 'Alice, Li' },
          { text: 'Bob, Li' },
          { text: 'Charlie, Li' },
          { text: 'Dana, Li' },
        ]"
        :max="3"
        size="large"
      ></WtAvatarGroup>
      <WtAvatarGroup
        :list="[
          { text: 'Alice, Li' },
          { text: 'Bob, Li' },
          { text: 'Charlie, Li' },
          { text: 'Dana, Li' },
        ]"
        :max="3"
      ></WtAvatarGroup>
      <WtAvatarGroup
        :list="[
          { text: 'Alice, Li' },
          { text: 'Bob, Li' },
          { text: 'Charlie, Li' },
          { text: 'Dana, Li' },
        ]"
        :max="3"
        size="small"
      ></WtAvatarGroup>
    </div>
  </article>
</template>
<script lang="ts" setup>
import { WtAvatar, WtAvatarGroup } from "@lpcp/components/vue";
import useImage from "../images/avatar.png";
</script>
