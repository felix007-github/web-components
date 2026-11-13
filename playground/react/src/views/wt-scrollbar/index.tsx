import React, { useRef, useEffect } from 'react';
import { WtScrollbar } from "@lpcp/components/react";

import './index.css';

export const WtScrollbarVs: React.FC = () => {
  const scrollbarRef = useRef<any>(null);
  const scrollbarRef2 = useRef<any>(null);

  useEffect(() => {
    const handleScroll = (e: CustomEvent) => {
      console.log('Scroll event:', e.detail);
    };

    const el = scrollbarRef.current;
    if (el) {
      el.addEventListener('wt-scroll', handleScroll);
    }

    return () => {
      if (el) {
        el.removeEventListener('wt-scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTop = async () => {
    await scrollbarRef2.current?.wtSetScrollTop(0);
  };

  const scrollToBottom = async () => {
    const wrap = await scrollbarRef2.current?.wtWrapRef();
    if (wrap) {
      await scrollbarRef2.current?.wtSetScrollTop(wrap.scrollHeight);
    }
  };

  const scrollToPos = async () => {
    await scrollbarRef2.current?.wtScrollTo({ top: 200 });
  };

  const scrollRight = async () => {
    await scrollbarRef2.current?.wtSetScrollLeft(300);
  };

  const logWrapRef = async () => {
    const wrap = await scrollbarRef2.current?.wtWrapRef();
    console.log('wrapRef element:', wrap);
  };

  return (
    <div className="scrollbar-demo">
      <h3>WtScrollbar 组件</h3>

      <div className="demo-section">
        <h4>基础用法</h4>
        <div style={{ height: '200px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <WtScrollbar>
            <div style={{ padding: '20px' }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <p key={i} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  Scrollable item {i + 1}
                </p>
              ))}
            </div>
          </WtScrollbar>
        </div>
      </div>

      <div className="demo-section">
        <h4>横向滚动</h4>
        <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
          <WtScrollbar>
            <div style={{ display: 'flex', width: '2000px', padding: '20px' }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ minWidth: '200px', padding: '10px', background: i % 2 === 0 ? '#f0f0f0' : '#e0e0e0', textAlign: 'center' }}>
                  Horizontal item {i + 1}
                </div>
              ))}
            </div>
          </WtScrollbar>
        </div>
      </div>

      <div className="demo-section">
        <h4>尺寸 (small, medium, large)</h4>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ height: '150px', flex: 1, border: '1px solid #ddd' }}>
            <WtScrollbar size="small">
               <div style={{ height: '300px', padding: '10px' }}>Small (2px)</div>
            </WtScrollbar>
          </div>
          <div style={{ height: '150px', flex: 1, border: '1px solid #ddd' }}>
            <WtScrollbar size="medium">
               <div style={{ height: '300px', padding: '10px' }}>Medium(4px) default</div>
            </WtScrollbar>
          </div>
          <div style={{ height: '150px', flex: 1, border: '1px solid #ddd' }}>
            <WtScrollbar size="large">
               <div style={{ height: '300px', padding: '10px' }}>Large (6px)</div>
            </WtScrollbar>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h4>一直显示 (always = true) + 滚动事件</h4>
        <div style={{ height: '200px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <WtScrollbar always={true} ref={scrollbarRef}>
            <div style={{ padding: '20px' }}>
              {Array.from({ length: 15 }).map((_, i) => (
                <p key={i} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  Item {i + 1} (Always visible scrollbar)
                </p>
              ))}
            </div>
          </WtScrollbar>
        </div>
      </div>

      <div className="demo-section">
        <h4>编程式滚动 (scrollTo / setScrollTop / setScrollLeft / wrapRef)</h4>
        <div className="btn-group">
          <button onClick={scrollToTop}>Scroll to Top</button>
          <button onClick={scrollToBottom}>Scroll to Bottom</button>
          <button onClick={scrollToPos}>Scroll to 200px</button>
          <button onClick={scrollRight}>Scroll Right 300px</button>
          <button onClick={logWrapRef}>Log wrapRef</button>
        </div>
        <div style={{ height: '200px', border: '1px solid #ddd', borderRadius: '4px', marginTop: '12px' }}>
          <WtScrollbar ref={scrollbarRef2}>
            <div style={{ width: '1200px', padding: '20px' }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <p key={i} style={{ padding: '8px 0', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>
                  Item {i + 1} — long content that extends horizontally for demo purposes
                </p>
              ))}
            </div>
          </WtScrollbar>
        </div>
      </div>
    </div>
  );
};
