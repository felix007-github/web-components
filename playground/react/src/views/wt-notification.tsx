import { forwardRef } from "react";
import {
  WtNotification,
  WtButton,
  WtIcon,
  WtNotificationService,
} from "@mache-hangar/components/react";
export const WtNotificationVs = forwardRef<
  HTMLWtNotificationElement,
  React.ComponentPropsWithoutRef<"wt-notification">
>((_props, _ref) => {
  function hangClick() {
    WtNotificationService.open({
      type: "error",
      title: "Error",
      message: "This is an error notification.",
      duration: 3000,
    });
  }
  const openNotification1 = () => {
    WtNotificationService.open({
      type: "error",
      title: "Error",
      message: "This is an error notification.",
      duration: 3000,
    });
  }
  const openNotification2 = () => {
    WtNotificationService.open({
      type: "success",
      message: "This is a success notification.",
      duration: 3000,
    });
  }
  const openNotification3 = () => {
    WtNotificationService.open({
      type: "info",
      title: "Info",
      message: "This is an info notification.",
      duration: 3000,
    });
  }
  const openNotification4 = () => {
    WtNotificationService.open({
      type: "warning",
      title: "Warning",
      message: "This is a warning notification.",
      duration: 3000,
    });
  }

  return (
    <article className="demo-card">
      <div className="msg-box">
        <WtNotification
          type="success"
          message="This is a success notification."
        ></WtNotification>
        <WtNotification
          type="error"
          message="This is an error notification."
        ></WtNotification>
        <WtNotification
          type="info"
          message="This is an info notification."
        ></WtNotification>
        <WtNotification
          type="warning"
          message="This is a warning notification."
          onWtClose={() => hangClick()}
        ></WtNotification>
        <WtNotification
          type="success"
          isFullWidth={true}
          message="This is a success notification."
        ></WtNotification>
        <WtNotification
          type="warning"
          titleText="Warning"
          actionLabel="Action Label"
          isFullWidth={true}
          message="This is a warning notification."
          onWtAction={() => hangClick()}
        ></WtNotification>
        <WtNotification
          type="info"
          titleText="Info"
          actionLabel="Action Label"
          isFullWidth={true}
          message="This is an info notification."
          onWtAction={() => hangClick()}
        ></WtNotification>
        <WtNotification
          type="error"
          titleText="Error"
          actionLabel="Action Label"
          isFullWidth={true}
          message="This is an error notification."
          onWtAction={() => hangClick()}
          onWtClose={() => hangClick()}
        ></WtNotification>
        <div className="flex-col">
          <WtButton size="small" type="primary" onClick={() => openNotification2()}>
            <WtIcon style={{width: '16px', height: '16px', marginRight: '4px'}} name="check_circle_filled" slot="before"></WtIcon>
            Success
          </WtButton>
          <WtButton size="small" type="dark" onClick={() => openNotification3()}>
            <WtIcon style={{width: '16px', height: '16px', marginRight: '4px'}} name="critical_filled" slot="before"></WtIcon>
            Info
          </WtButton>
          <WtButton size="small" onClick={() => openNotification4()}>
            <WtIcon style={{width: '16px', height: '16px', marginRight: '4px'}} name="warning_filled" slot="before"></WtIcon>
            Warning
          </WtButton>
          <WtButton size="small" onClick={() => openNotification1()}>
            <WtIcon style={{width: '16px', height: '16px', marginRight: '4px'}} name="cross_circle_outline" slot="before"></WtIcon>
            Error
          </WtButton>
        </div>
      </div>
    </article>
  );
});
