import { forwardRef, useState } from "react";
import type { WtButtonCustomEvent } from "@lpcp/components";
import { WtButton, WtTooltip } from "@lpcp/components/react";
export const WtButtonVs = forwardRef<
  HTMLWtButtonElement,
  React.ComponentPropsWithoutRef<"wt-button">
>((_props, _ref) => {
  const [lastButtonClick, setLastButtonClick] = useState("Not fired yet");
  const handleButtonClick = (event: WtButtonCustomEvent<{ time: Date }>) => {
    const clickedAt = new Date(event.detail.time);
    setLastButtonClick(
      clickedAt.toLocaleTimeString("en-US", { hour12: false }),
    );
  };
  return (
    <article className="demo-card">
      <div className="button-stack">
        <WtButton size="large" onClickBtn={handleButtonClick}>
          <wt-icon name="add" slot="before" />
          Primary action
        </WtButton>
        <WtButton size="medium" plain>
          Primary action
        </WtButton>
        <WtButton size="small" plain>
          Primary action
        </WtButton>
        <WtButton size="min" type="dark">
          Dark action
        </WtButton>
        <WtButton type="dark" plain>
          Secondary action
        </WtButton>
        <WtButton disabled>Disabled action</WtButton>
        <WtTooltip trigger={'click'} content="Tooltip content">
          <WtButton>Hover me</WtButton>
        </WtTooltip>
      </div>
      <div className="echo-panel">
        <span className="status-label">Last button event: </span>
        <strong>{lastButtonClick}</strong>
      </div>
    </article>
  );
});
