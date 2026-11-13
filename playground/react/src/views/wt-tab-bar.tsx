import { forwardRef } from "react";
import { WtTabBar } from "@mache-hangar/components/react";
export const WtTabBarVs = forwardRef<
  HTMLWtTabBarElement,
  React.ComponentPropsWithoutRef<"wt-tab-bar">
>((_props, _ref) => {
  return (
    <article className="demo-card">
      <div className="flex-col">
        <WtTabBar list={[{ label: "Tab 1", value: "tab1" }, { label: "Tab 2", value: "tab2" }]} activeValue="tab1"></WtTabBar>
        <WtTabBar list={[{ label: "Tab 1-1", value: "tab1-1" }, { label: "Tab 2-1", value: "tab2-1" }, { label: "Tab 3-1", value: "tab3-1" }]} activeValue="tab1-1"></WtTabBar>
        <WtTabBar list={[
          { label: "Tab 1-2", value: "tab1-2" }, 
          { label: "Tab 2-2", value: "tab2-2" }, 
          { label: "Tab 3-2", value: "tab3-2" },
          { label: "Tab 4-2", value: "tab4-2" },
        ]} activeValue="tab1-2"></WtTabBar>
      </div>
      <div className="flex-col" style={{ marginTop: "20px" }}>
        <WtTabBar list={[
          { label: "this is a very long tab label", value: "tab1" },
          { label: "Tab 2", value: "tab2" }
        ]} activeValue="tab1"></WtTabBar>
        <WtTabBar list={[
          { label: "Tab 1-1", value: "tab1-1" }, 
          { label: "Tab 2-1", value: "tab2-1" }, 
          { label: "Tab 3-1", value: "tab3-1" }
        ]} activeValue="tab1-1"></WtTabBar>
        <WtTabBar list={[
          { label: "Tab 1-2", value: "tab1-2" }, 
          { label: "Tab 2-2", value: "tab2-2" }, 
          { label: "Tab 3-2", value: "tab3-2" },
          { label: "Tab 4-2", value: "tab4-2" },
        ]} activeValue="tab1-2"></WtTabBar>
      </div>
    </article>
  );
});