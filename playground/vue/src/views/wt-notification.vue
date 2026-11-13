<template>
  <article className="demo-card">
    <div className="msg-box">
      <WtNotification type="success" message="This is a success notification."></WtNotification>
      <WtNotification type="error" message="This is an error notification."></WtNotification>
      <WtNotification type="info" message="This is an info notification."></WtNotification>
      <WtNotification type="warning" message="This is a warning notification." @wt-close="() => hangClick()"> </WtNotification>
      <WtNotification type="success" :isFullWidth="true" message="This is a success notification." @wt-close="hangClick()"></WtNotification>
      <WtNotification
        type="warning"
        titleText="Warning"
        actionLabel="Action Label"
        :isFullWidth="true"
        message="This is a warning notification."
        @wt-action="hangClick()"
        @wt-close="hangClick()"
      ></WtNotification>
      <WtNotification
        type="info"
        titleText="Info"
        actionLabel="Action Label"
        :isFullWidth="true"
        message="This is an info notification."
        @wt-action="hangClick()"
        @wt-close="hangClick()"
      ></WtNotification>
      <WtNotification
        type="error"
        titleText="Error"
        actionLabel="Action Label"
        :isFullWidth="true"
        message="This is an error notification."
        @wt-action="hangClick()"
        @wt-close="hangClick()"
      ></WtNotification>
      <div class="flex-col">
        <WtButton size="small" type="primary" @click="() => openNotification2()">
          <WtIcon slot="before" :style="{ width: '16px', height: '16px', marginRight: '4px' }" name="check_circle_filled"></WtIcon>
          Success
        </WtButton>
        <WtButton size="small" type="dark" @click="() => openNotification3()">
          <WtIcon slot="before" :style="{ width: '16px', height: '16px', marginRight: '4px' }" name="critical_filled"></WtIcon>
          Info
        </WtButton>
        <WtButton size="small" @click="() => openNotification4()">
          <WtIcon slot="before" :style="{ width: '16px', height: '16px', marginRight: '4px' }" name="warning_filled"></WtIcon>
          Warning
        </WtButton>
        <WtButton size="small" @click="() => openNotification1()">
          <WtIcon slot="before" :style="{ width: '16px', height: '16px', marginRight: '4px' }" name="cross_circle_outline"></WtIcon>
          Error
        </WtButton>
      </div>
    </div>
  </article>
</template>
<script setup lang="ts">
import { WtNotification, WtButton, WtIcon, WtNotificationService } from '@mache-hangar/components/vue';
function hangClick() {
  WtNotificationService.open({
    type: 'info',
    title: 'Info',
    message: 'This is an info notification.',
    duration: 3000,
  });
}
const openNotification1 = () => {
  WtNotificationService.open({
    type: 'error',
    title: 'Error',
    message: 'This is an error notification.',
    duration: 3000,
  });
};
const openNotification2 = () => {
  WtNotificationService.open({
    type: 'success',
    message: 'This is a success notification.',
    duration: 3000,
  });
};
const openNotification3 = () => {
  WtNotificationService.open({
    type: 'info',
    title: 'Info',
    message: 'This is an info notification.',
    duration: 3000,
  });
};
const openNotification4 = () => {
  WtNotificationService.open({
    type: 'warning',
    title: 'Warning',
    message: 'This is a warning notification.',
    duration: 3000,
  });
};
</script>
