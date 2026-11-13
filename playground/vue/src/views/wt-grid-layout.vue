<template>
  <div class="grid-demo">
    <header class="grid-demo__bar">
      <div class="grid-demo__intro">
        <p class="grid-demo__eyebrow">wt-grid-layout</p>
        <h2 class="grid-demo__title">运营驾驶舱 · 卡片工作台</h2>
        <p class="grid-demo__desc">
          正方形细网格、整卡拖动、右下角缩放、实时碰撞避让与松开吸附全部由组件管理，内容通过命名插槽传入。
        </p>
      </div>
      <div class="grid-demo__actions">
        <span class="grid-demo__toggle">
          <WtSwitch v-model="editable" size="small" />
          <button type="button" class="grid-demo__toggle-label" @click="editable = !editable">编辑模式</button>
        </span>
        <button type="button" class="grid-demo__cta" @click="save()">保存布局</button>
        <button type="button" class="grid-demo__cta is-plain" @click="tidy()">紧凑排布</button>
        <button type="button" class="grid-demo__link" @click="restore()">撤销改动</button>
        <button type="button" class="grid-demo__link" @click="reset()">重置初始</button>
      </div>
    </header>

    <div class="grid-demo__meta">
      <span class="grid-demo__chip">columns={{ COLUMNS }}</span>
      <span class="grid-demo__chip">gap={{ GAP }}</span>
      <span class="grid-demo__chip">storage-key</span>
      <span :class="['grid-demo__state', { 'is-on': editable }]">{{ status }}</span>
      <span v-if="dirty" class="grid-demo__dirty">有未保存的改动</span>
      <span class="grid-demo__tip">拖动 ⠿ 或卡片空白处移动 · ⌟ 缩放 · 方向键微调 · Esc 取消</span>
    </div>

    <div
      ref="canvasRef"
      class="grid-demo__canvas-wrap"
      @wt-layout-change="handleChange"
      @wt-layout-save="handleSave"
      @wt-layout-error="handleError"
      @wt-layout-interaction="handleInteraction"
    >
      <WtGridLayout
        v-if="ready"
        :items="items"
        :columns="COLUMNS"
        :gap="GAP"
        :editable="editable"
        :storage-key="STORAGE_KEY"
        class="grid-demo__canvas"
      >
        <div slot="overview" class="panel kpi-panel">
          <div class="kpi-row">
            <div v-for="item in KPIS" :key="item.label" class="kpi">
              <span class="kpi__label">{{ item.label }}</span>
              <strong class="kpi__value">{{ item.value }}</strong>
              <span :class="['kpi__delta', { 'is-down': item.down }]">{{ item.delta }}</span>
            </div>
          </div>
          <div class="kpi-foot">
            <WtTag type="success" variant="outlined">全部区域运行中</WtTag>
            <span>最近刷新 2 分钟前</span>
          </div>
        </div>

        <div slot="trend" class="panel">
          <div class="chart">
            <div class="chart__track">
              <div v-for="item in TREND" :key="item.label" class="chart__col">
                <span class="chart__value">{{ item.value }}</span>
                <i
                  :class="['chart__bar', { 'is-peak': item.value === trendMax }]"
                  :style="{ height: `${Math.round((item.value / trendMax) * 96)}px` }"
                ></i>
              </div>
            </div>
            <div class="chart__labels">
              <span v-for="item in TREND" :key="item.label" class="chart__label">{{ item.label }}</span>
            </div>
          </div>
        </div>

        <div slot="health" class="panel health-panel">
          <div v-for="item in HEALTH" :key="item.label" class="health-row">
            <div class="health-row__head">
              <b>{{ item.label }}</b>
              <span>SLO 99.9%</span>
            </div>
            <WtProgress :percentage="item.value" :type="item.type" />
          </div>
          <div class="health-foot">
            <WtTag type="success">华东</WtTag>
            <WtTag type="success">华北</WtTag>
            <WtTag type="warning" variant="outlined">华南降级</WtTag>
          </div>
        </div>

        <div slot="activity" class="panel">
          <ul class="timeline">
            <li v-for="item in ACTIVITY" :key="item.text" :class="['timeline__item', `is-${item.tone}`]">
              <span class="timeline__dot"></span>
              <div class="timeline__body">
                <p>{{ item.text }}</p>
                <span>{{ item.time }} · {{ item.owner }}</span>
              </div>
            </li>
          </ul>
          <a class="panel__more" href="#activity" data-no-drag @click.prevent>查看全部记录 →</a>
        </div>

        <div slot="load" class="panel load-panel">
          <div v-for="member in MEMBERS" :key="member.name" class="member">
            <span class="member__avatar">{{ member.name.slice(0, 1) }}</span>
            <div class="member__body">
              <div class="member__head">
                <b>{{ member.name }}</b>
                <span>{{ member.percent }}% 负载</span>
              </div>
              <WtProgress :percentage="member.percent" :type="member.type" />
            </div>
          </div>
        </div>

        <span slot="header-tasks" class="card-heading">待办清单 <em>{{ openTasks }}</em></span>
        <div slot="tasks" class="panel task-panel">
          <label v-for="task in tasks" :key="task.id" :class="['task', { 'is-done': task.done }]">
            <input v-model="task.done" type="checkbox" />
            <span>{{ task.label }}</span>
          </label>
        </div>
      </WtGridLayout>
    </div>

    <div class="grid-demo__bottom">
      <section class="grid-demo__panel">
        <header class="grid-demo__panel-head">
          <h3>getLayout()</h3>
          <span>实时几何 · 已省略 title / minW / minHeight</span>
        </header>
        <pre class="grid-demo__json">{{ layoutJson }}</pre>
      </section>
      <section class="grid-demo__panel">
        <header class="grid-demo__panel-head">
          <h3>事件流</h3>
          <span>change / save / error / interaction</span>
        </header>
        <ol class="grid-demo__log">
          <li v-if="!logs.length" class="is-empty">拖动卡片、保存或重置后，这里会出现组件事件。</li>
          <li v-for="entry in logs" :key="entry.id">
            <time>{{ entry.time }}</time>
            <b>{{ entry.name }}</b>
            <span>{{ entry.detail }}</span>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { WtGridLayout, WtProgress, WtSwitch, WtTag } from "@mache-hangar/components/vue";
import type { GridLayoutItem } from "@mache-hangar/components";

const COLUMNS = 48;
const GAP = 1;
const STORAGE_KEY = "wt-grid-layout-playground";

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

const items: GridLayoutItem[] = [
  { id: "overview", title: "运行概览", x: 0, y: 0, w: 11, h: 9, minW: 9, minHeight: 220 },
  { id: "trend", title: "近 7 日任务量", x: 12, y: 0, w: 20, h: 9, minW: 14, minHeight: 220 },
  { id: "health", title: "服务健康度", x: 33, y: 0, w: 15, h: 9, minW: 12, minHeight: 220 },
  { id: "activity", title: "最近活动", x: 0, y: 10, w: 19, h: 11, minW: 14, minHeight: 260 },
  { id: "load", title: "成员负载", x: 20, y: 10, w: 15, h: 11, minW: 12, minHeight: 260 },
  { id: "tasks", title: "待办清单", x: 36, y: 10, w: 12, h: 11, minW: 9, minHeight: 260 },
];

const tasks = ref([
  { id: "safari", label: "校验看板拖拽在 Safari 的表现", done: true },
  { id: "size", label: "补齐卡片最小尺寸文档", done: false },
  { id: "space", label: "与设计确认 12px 卡片间距", done: false },
  { id: "release", label: "整理 0.1.0 发布说明", done: false },
]);

type GridElement = HTMLElement & {
  getLayout(): Promise<GridLayoutItem[]>;
  setLayout(next: GridLayoutItem[]): Promise<void>;
  saveLayout(): Promise<GridLayoutItem[]>;
  restoreLayout(): Promise<void>;
  resetLayout(): Promise<void>;
};

interface LogEntry {
  id: number;
  time: string;
  name: string;
  detail: string;
}

const canvasRef = ref<HTMLElement | null>(null);
const ready = ref(false);
const editable = ref(false);
const layoutJson = ref("[]");
const logs = ref<LogEntry[]>([]);
const dirty = ref(false);
const status = ref("只读预览");
let logId = 0;

const trendMax = Math.max(...TREND.map(item => item.value));
const openTasks = computed(() => tasks.value.filter(task => !task.done).length);

function grid() {
  return canvasRef.value?.querySelector<GridElement>("wt-grid-layout") ?? null;
}

function pushLog(name: string, detail: string) {
  logId += 1;
  logs.value = [
    { id: logId, time: new Date().toLocaleTimeString("zh-CN", { hour12: false }), name, detail },
    ...logs.value,
  ].slice(0, 10);
}

async function refreshLayout() {
  const element = grid();
  if (!element || typeof element.getLayout !== "function") return null;
  const layout = await element.getLayout();
  layoutJson.value = JSON.stringify(layout.map(({ id, x, y, w, h }) => ({ id, x, y, w, h })), null, 2);
  return layout;
}

function handleChange(event: Event) {
  const detail = (event as CustomEvent<GridLayoutItem[]>).detail;
  dirty.value = true;
  status.value = "布局已提交";
  pushLog("wt-layout-change", `${detail.length} 张卡片`);
  void refreshLayout();
}

function handleSave(event: Event) {
  const detail = (event as CustomEvent<GridLayoutItem[]>).detail;
  pushLog("wt-layout-save", `已保存 ${detail.length} 张卡片`);
}

function handleError(event: Event) {
  const detail = (event as CustomEvent<{ message: string }>).detail;
  pushLog("wt-layout-error", detail.message);
}

function handleInteraction(event: Event) {
  const { id, action, phase } = (event as CustomEvent<{ id: string; action: "move" | "resize"; phase: "start" | "end" | "cancel" }>).detail;
  const verb = action === "move" ? "移动" : "缩放";
  if (phase === "start") {
    status.value = `${verb} ${id}…`;
    return;
  }
  status.value = phase === "end" ? `${verb}完成` : "已取消本次操作";
  pushLog("wt-layout-interaction", `${verb} ${id} · ${phase}`);
}

async function save() {
  try {
    const snapshot = await grid()?.saveLayout();
    if (!snapshot) return;
    dirty.value = false;
    status.value = "已保存为取消基线";
    await refreshLayout();
  } catch (error) {
    pushLog("saveLayout() 失败", error instanceof Error ? error.message : String(error));
  }
}

async function restore() {
  await grid()?.restoreLayout();
  dirty.value = false;
  status.value = "已回到上次保存的布局";
  await refreshLayout();
}

async function reset() {
  await grid()?.resetLayout();
  dirty.value = false;
  status.value = "已恢复初始布局";
  await refreshLayout();
}

async function tidy() {
  const element = grid();
  if (!element) return;
  const current = await element.getLayout();
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
  await element.setLayout(next);
  dirty.value = true;
  status.value = "已通过 setLayout() 重排";
  pushLog("setLayout(items)", `紧凑排布 ${next.length} 张卡片`);
  await refreshLayout();
}

onMounted(() => {
  // 等容器完成首次布局后再挂载网格：组件在 componentWillLoad 里读取 clientWidth，
  // 若此时宽度还是 0 会退回 7px 单元格，minHeight 会被放大成过多行高。
  let frames = 0;
  const mount = () => {
    if ((canvasRef.value?.clientWidth ?? 0) > 0) {
      ready.value = true;
      return;
    }
    if (++frames < 60) requestAnimationFrame(mount);
  };
  requestAnimationFrame(mount);

  let tries = 0;
  const sync = async () => {
    if (++tries > 60) return;
    if (!ready.value) {
      window.setTimeout(sync, 80);
      return;
    }
    const layout = await refreshLayout().catch(() => null);
    if (!layout?.length) window.setTimeout(sync, 80);
  };
  window.setTimeout(sync, 80);
});
</script>

<style lang="scss">
@use "./scss/wt-grid-layout.scss" as *;
</style>
