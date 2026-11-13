import { useCallback, useEffect, useRef, useState } from "react";
import { WtGridLayout, WtProgress, WtSwitch, WtTag } from "@mache-hangar/components/react";
import type { GridLayoutItem } from "@mache-hangar/components";
import "./scss/wt-grid-layout.scss";

const COLUMNS = 48;
const GAP = 1;
const STORAGE_KEY = "wt-grid-layout-playground";

const INITIAL_ITEMS: GridLayoutItem[] = [
  { id: "overview", title: "运行概览", x: 0, y: 0, w: 11, h: 9, minW: 9, minHeight: 220 },
  { id: "trend", title: "近 7 日任务量", x: 12, y: 0, w: 20, h: 9, minW: 14, minHeight: 220 },
  { id: "health", title: "服务健康度", x: 33, y: 0, w: 15, h: 9, minW: 12, minHeight: 220 },
  { id: "activity", title: "最近活动", x: 0, y: 10, w: 19, h: 11, minW: 14, minHeight: 260 },
  { id: "load", title: "成员负载", x: 20, y: 10, w: 15, h: 11, minW: 12, minHeight: 260 },
  { id: "tasks", title: "待办清单", x: 36, y: 10, w: 12, h: 11, minW: 9, minHeight: 260 },
];

const KPIS = [
  { label: "在线 Agent", value: "12", delta: "+2 台", down: false },
  { label: "今日任务", value: "148", delta: "+17%", down: false },
  { label: "成功率", value: "97.4%", delta: "-0.3%", down: true },
];

const TREND = [
  { label: "周一", value: 42 },
  { label: "周二", value: 68 },
  { label: "周三", value: 91 },
  { label: "周四", value: 74 },
  { label: "周五", value: 120 },
  { label: "周六", value: 148 },
  { label: "周日", value: 96 },
];

const HEALTH = [
  { label: "调度器", value: 98, type: "success" as const },
  { label: "执行器", value: 92, type: "primary" as const },
  { label: "对象存储", value: 76, type: "error" as const },
];

const ACTIVITY = [
  { text: "发布 wt-grid-layout@0.1.0", time: "09:42", owner: "林一", tone: "success" },
  { text: "调度器扩容 2 个实例", time: "09:18", owner: "周岚", tone: "primary" },
  { text: "夜间回归 128 项全部通过", time: "08:55", owner: "CI", tone: "success" },
  { text: "存储节点 s-03 延迟升高", time: "08:30", owner: "监控", tone: "warning" },
];

const MEMBERS = [
  { name: "林一", percent: 78, type: "success" as const },
  { name: "周岚", percent: 64, type: "primary" as const },
  { name: "陈默", percent: 41, type: "primary" as const },
  { name: "许宁", percent: 92, type: "error" as const },
];

const INITIAL_TASKS = [
  { id: "safari", label: "校验看板拖拽在 Safari 的表现", done: true },
  { id: "size", label: "补齐卡片最小尺寸文档", done: false },
  { id: "space", label: "与设计确认 12px 卡片间距", done: false },
  { id: "release", label: "整理 0.1.0 发布说明", done: false },
];

interface LogEntry {
  id: number;
  time: string;
  name: string;
  detail: string;
}

export function WtGridLayoutVs() {
  const gridRef = useRef<HTMLWtGridLayoutElement>(null);
  const logId = useRef(0);
  const [editable, setEditable] = useState(false);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [layoutJson, setLayoutJson] = useState("[]");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState("只读预览");

  const pushLog = useCallback((name: string, detail: string) => {
    logId.current += 1;
    const entry: LogEntry = {
      id: logId.current,
      time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
      name,
      detail,
    };
    setLogs(previous => [entry, ...previous].slice(0, 10));
  }, []);

  const refreshLayout = useCallback(async () => {
    const layout = await gridRef.current?.getLayout();
    if (!layout) return null;
    setLayoutJson(JSON.stringify(layout.map(({ id, x, y, w, h }) => ({ id, x, y, w, h })), null, 2));
    return layout;
  }, []);

  useEffect(() => {
    let active = true;
    let tries = 0;
    const sync = async () => {
      if (!active) return;
      const layout = await refreshLayout().catch(() => null);
      if (active && !layout?.length && ++tries < 40) window.setTimeout(sync, 80);
    };
    void sync();
    return () => {
      active = false;
    };
  }, [refreshLayout]);

  const handleChange = (event: CustomEvent<GridLayoutItem[]>) => {
    setDirty(true);
    setStatus("布局已提交");
    pushLog("wt-layout-change", `${event.detail.length} 张卡片`);
    void refreshLayout();
  };

  const handleSave = (event: CustomEvent<GridLayoutItem[]>) => {
    pushLog("wt-layout-save", `已保存 ${event.detail.length} 张卡片`);
  };

  const handleError = (event: CustomEvent<{ message: string }>) => {
    pushLog("wt-layout-error", event.detail.message);
  };

  const handleInteraction = (event: CustomEvent<{ id: string; action: "move" | "resize"; phase: "start" | "end" | "cancel" }>) => {
    const { id, action, phase } = event.detail;
    const verb = action === "move" ? "移动" : "缩放";
    if (phase === "start") {
      setStatus(`${verb} ${id}…`);
      return;
    }
    setStatus(phase === "end" ? `${verb}完成` : "已取消本次操作");
    pushLog("wt-layout-interaction", `${verb} ${id} · ${phase}`);
  };

  const save = async () => {
    try {
      const snapshot = await gridRef.current?.saveLayout();
      if (!snapshot) return;
      setDirty(false);
      setStatus("已保存为取消基线");
      await refreshLayout();
    } catch (error) {
      pushLog("saveLayout() 失败", error instanceof Error ? error.message : String(error));
    }
  };

  const restore = async () => {
    await gridRef.current?.restoreLayout();
    setDirty(false);
    setStatus("已回到上次保存的布局");
    await refreshLayout();
  };

  const reset = async () => {
    await gridRef.current?.resetLayout();
    setDirty(false);
    setStatus("已恢复初始布局");
    await refreshLayout();
  };

  const tidy = async () => {
    const grid = gridRef.current;
    if (!grid) return;
    const current = await grid.getLayout();
    const ordered = [...current].sort((a, b) => b.w - a.w || a.id.localeCompare(b.id));
    let x = 0;
    let y = 0;
    let rowHeight = 0;
    const next = ordered.map(item => {
      if (x > 0 && x + item.w > COLUMNS) {
        x = 0;
        y += rowHeight + GAP;
        rowHeight = 0;
      }
      const placed = { ...item, x, y };
      x += item.w + GAP;
      rowHeight = Math.max(rowHeight, item.h);
      return placed;
    });
    await grid.setLayout(next);
    setDirty(true);
    setStatus("已通过 setLayout() 重排");
    pushLog("setLayout(items)", `紧凑排布 ${next.length} 张卡片`);
    await refreshLayout();
  };

  const toggleTask = (id: string) => {
    setTasks(previous => previous.map(task => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const openTasks = tasks.filter(task => !task.done).length;
  const trendMax = Math.max(...TREND.map(item => item.value));

  return (
    <div className="grid-demo">
      <header className="grid-demo__bar">
        <div className="grid-demo__intro">
          <p className="grid-demo__eyebrow">wt-grid-layout</p>
          <h2 className="grid-demo__title">运营驾驶舱 · 卡片工作台</h2>
          <p className="grid-demo__desc">
            正方形细网格、整卡拖动、右下角缩放、实时碰撞避让与松开吸附全部由组件管理，内容通过命名插槽传入。
          </p>
        </div>
        <div className="grid-demo__actions">
          <span className="grid-demo__toggle">
            <WtSwitch
              size="small"
              modelValue={editable}
              onUpdateModelValue={event => setEditable(event.detail)}
            />
            <button
              type="button"
              className="grid-demo__toggle-label"
              onClick={() => setEditable(value => !value)}
            >
              编辑模式
            </button>
          </span>
          <button type="button" className="grid-demo__cta" onClick={() => void save()}>
            保存布局
          </button>
          <button type="button" className="grid-demo__cta is-plain" onClick={() => void tidy()}>
            紧凑排布
          </button>
          <button type="button" className="grid-demo__link" onClick={() => void restore()}>
            撤销改动
          </button>
          <button type="button" className="grid-demo__link" onClick={() => void reset()}>
            重置初始
          </button>
        </div>
      </header>

      <div className="grid-demo__meta">
        <span className="grid-demo__chip">columns={COLUMNS}</span>
        <span className="grid-demo__chip">gap={GAP}</span>
        <span className="grid-demo__chip">storage-key</span>
        <span className={`grid-demo__state${editable ? " is-on" : ""}`}>{status}</span>
        {dirty && <span className="grid-demo__dirty">有未保存的改动</span>}
        <span className="grid-demo__tip">
          拖动 ⠿ 或卡片空白处移动 · ⌟ 缩放 · 方向键微调 · Esc 取消
        </span>
      </div>

      <WtGridLayout
        ref={gridRef}
        items={INITIAL_ITEMS}
        columns={COLUMNS}
        gap={GAP}
        editable={editable}
        storageKey={STORAGE_KEY}
        className="grid-demo__canvas"
        onWtLayoutChange={handleChange}
        onWtLayoutSave={handleSave}
        onWtLayoutError={handleError}
        onWtLayoutInteraction={handleInteraction}
      >
        <div slot="overview" className="panel kpi-panel">
          <div className="kpi-row">
            {KPIS.map(item => (
              <div className="kpi" key={item.label}>
                <span className="kpi__label">{item.label}</span>
                <strong className="kpi__value">{item.value}</strong>
                <span className={`kpi__delta${item.down ? " is-down" : ""}`}>{item.delta}</span>
              </div>
            ))}
          </div>
          <div className="kpi-foot">
            <WtTag type="success" variant="outlined">
              全部区域运行中
            </WtTag>
            <span>最近刷新 2 分钟前</span>
          </div>
        </div>

        <div slot="trend" className="panel">
          <div className="chart">
            <div className="chart__track">
              {TREND.map(item => (
                <div className="chart__col" key={item.label}>
                  <span className="chart__value">{item.value}</span>
                  <i
                    className={`chart__bar${item.value === trendMax ? " is-peak" : ""}`}
                    style={{ height: `${Math.round((item.value / trendMax) * 96)}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="chart__labels">
              {TREND.map(item => (
                <span className="chart__label" key={item.label}>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div slot="health" className="panel health-panel">
          {HEALTH.map(item => (
            <div className="health-row" key={item.label}>
              <div className="health-row__head">
                <b>{item.label}</b>
                <span>SLO 99.9%</span>
              </div>
              <WtProgress percentage={item.value} type={item.type} />
            </div>
          ))}
          <div className="health-foot">
            <WtTag type="success">华东</WtTag>
            <WtTag type="success">华北</WtTag>
            <WtTag type="warning" variant="outlined">
              华南降级
            </WtTag>
          </div>
        </div>

        <div slot="activity" className="panel">
          <ul className="timeline">
            {ACTIVITY.map(item => (
              <li className={`timeline__item is-${item.tone}`} key={item.text}>
                <span className="timeline__dot" />
                <div className="timeline__body">
                  <p>{item.text}</p>
                  <span>
                    {item.time} · {item.owner}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <a className="panel__more" href="#activity" data-no-drag onClick={event => event.preventDefault()}>
            查看全部记录 →
          </a>
        </div>

        <div slot="load" className="panel load-panel">
          {MEMBERS.map(member => (
            <div className="member" key={member.name}>
              <span className="member__avatar">{member.name.slice(0, 1)}</span>
              <div className="member__body">
                <div className="member__head">
                  <b>{member.name}</b>
                  <span>{member.percent}% 负载</span>
                </div>
                <WtProgress percentage={member.percent} type={member.type} />
              </div>
            </div>
          ))}
        </div>

        <span slot="header-tasks" className="card-heading">
          待办清单 <em>{openTasks}</em>
        </span>
        <div slot="tasks" className="panel task-panel">
          {tasks.map(task => (
            <label className={`task${task.done ? " is-done" : ""}`} key={task.id}>
              <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
              <span>{task.label}</span>
            </label>
          ))}
        </div>
      </WtGridLayout>

      <div className="grid-demo__bottom">
        <section className="grid-demo__panel">
          <header className="grid-demo__panel-head">
            <h3>getLayout()</h3>
            <span>实时几何 · 已省略 title / minW / minHeight</span>
          </header>
          <pre className="grid-demo__json">{layoutJson}</pre>
        </section>
        <section className="grid-demo__panel">
          <header className="grid-demo__panel-head">
            <h3>事件流</h3>
            <span>change / save / error / interaction</span>
          </header>
          <ol className="grid-demo__log">
            {!logs.length && <li className="is-empty">拖动卡片、保存或重置后，这里会出现组件事件。</li>}
            {logs.map(entry => (
              <li key={entry.id}>
                <time>{entry.time}</time>
                <b>{entry.name}</b>
                <span>{entry.detail}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
