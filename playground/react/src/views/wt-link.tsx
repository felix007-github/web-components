import { useState } from "react";
import { WtLink } from "@lpcp/components/react";

export const WtLinkVs = () => {
  const [count, setCount] = useState(0);

  return (
    <article className="demo-card" style={{ gap: "18px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>三种字号</p>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <WtLink size="small">Small Link</WtLink>
          <WtLink size="medium">Medium Link</WtLink>
          <WtLink size="large">Large Link</WtLink>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>下划线 / 无下划线</p>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <WtLink underline>Underline Link</WtLink>
          <WtLink>No Underline Link</WtLink>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>可用 / 不可用</p>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <WtLink href="https://example.com" target="_blank">Available Link</WtLink>
          <WtLink disabled underline>Disabled Link</WtLink>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>自定义颜色</p>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <WtLink color="rgba(0, 122, 204, 1)">Blue Link</WtLink>
          <WtLink color="rgba(2, 136, 99, 1)" underline>Green Link</WtLink>
          <WtLink color="rgba(216, 27, 96, 1)">Pink Link</WtLink>
        </div>
      </div>
    </article>
  );
};
