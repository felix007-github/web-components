import { useState } from "react";
import { WtSearch } from "@lpcp/components/react";

export const WtSearchVs = () => {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("预填内容");
  const [searchResult, setSearchResult] = useState("");

  return (
    <article className="demo-card" style={{ gap: "24px", display: "flex", flexDirection: "column" }}>
      {/* 三种尺寸 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>三种尺寸</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <WtSearch size="small" placeholder="Small 搜索..." />
          <WtSearch size="medium" placeholder="Medium 搜索..." />
          <WtSearch size="large" placeholder="Large 搜索..." />
        </div>
      </div>

      {/* 双向绑定 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>双向绑定</p>
        <WtSearch
          model-value={value1}
          placeholder="输入内容..."
          onUpdateModelValue={(e: CustomEvent<string>) => setValue1(e.detail)}
          onWtSearch={(e: CustomEvent<string>) => setSearchResult(e.detail)}
        />
        <span style={{ fontSize: "13px", color: "#455A64" }}>
          当前值：{value1 || <em style={{ color: "#C5CED9" }}>（空）</em>}
        </span>
        {searchResult && (
          <span style={{ fontSize: "13px", color: "#51B5FC" }}>
            搜索触发：{searchResult}
          </span>
        )}
      </div>

      {/* 预填内容 + clearable */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>预填内容 + clearable</p>
        <WtSearch
          model-value={value2}
          clearable
          placeholder="有预填内容..."
          onUpdateModelValue={(e: CustomEvent<string>) => setValue2(e.detail)}
          onWt-clear={() => setValue2("")}
        />
      </div>

      {/* 不可清除 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>不可清除（clearable=false）</p>
        <WtSearch clearable={false} default-value="不可清除内容" placeholder="不显示清除图标" />
      </div>

      {/* 禁用状态 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>禁用状态</p>
        <WtSearch disabled placeholder="禁用搜索框" />
        <WtSearch disabled default-value="禁用带内容" clearable />
      </div>

      {/* 自定义宽度 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#78909C" }}>自定义宽度</p>
        <WtSearch width="100%" placeholder="宽度 100%" />
        <WtSearch width="200px" placeholder="宽度 200px" size="small" />
      </div>
    </article>
  );
};
