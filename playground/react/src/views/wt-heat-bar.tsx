import {
  forwardRef,
  useState,
  useEffect,
  useRef,
  type ComponentPropsWithRef,
  type Ref,
} from "react";
import { WtHeatBar, type WtHeatBarExpose } from "@lpcp/components/react";
import "./scss/heat-bar.scss";

type WtHeatBarInstance = NonNullable<
  ComponentPropsWithRef<typeof WtHeatBar>["ref"]
> extends Ref<infer R>
  ? R
  : never;

export const WtHeatBarVs = forwardRef<HTMLDivElement, Record<string, never>>(
  (_props, _ref) => {
    const [showHeatBar, setShowHeatBar] = useState(false);

    const [contentList] = useState(Array.from({ length: 20 }, (_, i) => i + 1));

    const wtHeatBarRef = useRef<WtHeatBarInstance | null>(null);

    const getHeatBarExpose = () =>
      wtHeatBarRef.current as (WtHeatBarInstance & WtHeatBarExpose) | null;

    const [heatItemData] = useState([
      {
        targetSelector: ".item1",
        color: "#667eea",
        mode: "inner" as const,
      },
      {
        targetSelector: ".item2",
        color: "#764ba2",
        mode: "inner" as const,
      },
    ]);

    useEffect(() => {
      setShowHeatBar(true);
    }, []);

    useEffect(() => {
      if (!showHeatBar) {
        return;
      }
      const timer = window.setTimeout(() => {
        const expose = getHeatBarExpose();
        if (expose) {
          void expose.mounted?.();
        }
      }, 1000);
      return () => {
        window.clearTimeout(timer);
      };
    }, [showHeatBar]);

    return (
      <article className="demo-card">
        <div className="heat-bar-out">
          <div className="heat-stage">
            <div className="heat-content-box">
              {contentList.map((item) => (
                <div key={`a-${item}`} className="content-box__item item1">
                  <p>Group A · Content Item {item}</p>
                </div>
              ))}

              {contentList.map((item) => (
                <div key={`b-${item}`} className="content-box__item item2">
                  <p>Group B · Content Item {item}</p>
                </div>
              ))}
            </div>

            {showHeatBar ? (
              <WtHeatBar
                ref={wtHeatBarRef}
                direction="right"
                containerSelector=".heat-content-box"
                heatItemData={heatItemData}
                blinkClass={".heat-content-box"}
              />
            ) : null}
          </div>
        </div>
      </article>
    );
  },
);
