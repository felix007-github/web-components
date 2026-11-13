import { Component, Host, Prop, Event, EventEmitter, h, Element } from '@stencil/core';
import { Size, WT_BUTTON } from '@/utils';
// 定义自定义组件（最终编译为 <wt-button> 原生组件）
@Component({
  tag: 'wt-button', // 组件标签名（必须小写、含连字符）
  styleUrl: 'wt-button.scss', // 样式文件
  shadow: false, // 使用 Shadow DOM，避免 React 更新 children 时覆盖内部结构
})
export class WtButton {
  // 1. 定义组件属性（Props）
  @Prop() type: 'primary' | 'dark' = 'primary'; // 按钮类型
  @Prop() size: 'min' | Size = 'medium'; // 按钮尺寸
  @Prop() disabled = false; // 是否禁用
  @Prop() loading = false; // 是否加载中
  @Prop() plain = false; // 是否朴素按钮

  // 2. 定义组件事件（Events）
  @Event({ eventName: 'click-btn' }) clickBtn!: EventEmitter<{ time: Date }>; // 自定义点击事件（跨框架使用 kebab-case）

  @Element() el!: HTMLElement;
  // 3. 核心方法：处理点击
  private handleClick() {
    if (!this.disabled && !this.loading) {
      this.clickBtn.emit({ time: new Date() }); // 触发自定义事件并传参
    }
  }

  // 4. 渲染组件（类似 React JSX）
  render() {
    // 根据 props 动态设置样式类名
    const btnClasses = {
      [WT_BUTTON]: true,
      plain: this.plain,
      disabled: this.disabled,
      'is-loading': this.loading,
      sm: this.size === 'small',
      lg: this.size === 'large',
      md: this.size === 'medium',
      min: this.size === 'min',
      dark: this.type === 'dark',
      primary: this.type === 'primary',
    };

    return (
      <Host class={btnClasses} onClick={() => this.handleClick()}>
        {this.loading ? <span class="loading-icon" aria-hidden="true"></span> : <slot name="before"></slot>}
        {this.el.textContent ? (
          <span class="btn-text">
            <slot />
          </span>
        ) : null}
        <slot name="after"></slot>
      </Host>
    );
  }
}
