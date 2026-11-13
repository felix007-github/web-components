import { forwardRef } from "react";
import { WtIcon } from "@mache-hangar/components/react";
import { icons } from "@mache-hangar/icons";
import "./scss/wt-icon.scss";

const iconList = [...icons].filter(Boolean).sort((a, b) => a.localeCompare(b));

export const WtIconVs = forwardRef<
  HTMLWtIconElement,
  React.ComponentPropsWithoutRef<"wt-icon">
>((_props, _ref) => {
  return (
    <article className="demo-card">
      <p className="icon-total">Total: {iconList.length}</p>
      <div className="icon-grid">
        {iconList.map((iconName) => (
          <div className="icon-item" key={iconName}>
            <WtIcon name={iconName} size="20" />
            <span className="icon-name">{iconName}</span>
          </div>
        ))}
      </div>
    </article>
  );
});
