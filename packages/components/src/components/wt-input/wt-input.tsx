import { Component, Prop, h, Event, EventEmitter, State, Watch, Host } from '@stencil/core';
import { Size, WT_INPUT } from "@/utils";
@Component({
  tag: 'wt-input', // 组件标签名（必须小写、含连字符）
  styleUrl: 'wt-input.scss', // 样式文件
  shadow: true, // 开启 Shadow DOM（样式隔离）
})
export class WtInput {
  @Prop() class = "" ; // 自定义类名
  @Prop() error = false; // 是否错误状态
  @Prop() type: 'text' | 'password' = 'text'; // 输入框类型
  @Prop() placeholder = 'Please input'; // 占位文本
  @Prop() disabled = false; // 是否禁用
  @Prop() size:  'min' | Size = 'medium'; // 输入框尺寸
  @Prop() defaultValue = ''; // React 默认值
  @Prop() modelValue?: string; // Vue v-model 绑定值
  @Event({ eventName: 'wt-focus' }) focus!: EventEmitter<{ time: Date }>; // 自定义聚焦事件
  @Event({ eventName: 'wt-input' }) change!: EventEmitter<string>; // 输入事件
  @Event({ eventName: 'updateModelValue' }) updateModelValue!: EventEmitter<string>; // 跨框架更新事件
  @State() isFocused = false; // 输入框是否聚焦
  @State() innerValue = ''; // 当前输入值


  private normalizeModelValue(value: unknown, depth = 0): string {
    if (depth > 4) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (value == null) {
      return '';
    }

    if (typeof value === 'object' && 'detail' in value) {
      const detailValue = (value as CustomEvent<unknown>).detail;
      
      return this.normalizeModelValue(detailValue, depth + 1);
    }

    // Keep the input stable when unexpected objects are passed via model binding.
    return '';
  }

  componentWillLoad() {
    this.innerValue = this.normalizeModelValue(this.modelValue ?? this.defaultValue ?? '');
  }

  @Watch('modelValue')
  onModelValueChange(newValue: unknown) {
    this.innerValue = this.normalizeModelValue(newValue);
  }

   // 3. 核心方法：处理聚焦
  private handleFocus() {
    if (!this.disabled) {
      this.isFocused = true;
      this.focus.emit({ time: new Date() }); // 触发自定义事件并传参
    }
  }

  private handleChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.innerValue = value;
    this.change.emit(value);
    this.updateModelValue.emit(value);
  }

  render() {
    // 根据 props 动态设置样式类名
    const inputClasses = {
      [WT_INPUT]: true,
      'error': this.error,
      'focused': this.isFocused,
      'disabled': this.disabled,
      [this.size]: true,
      [this.class]: !!this.class,
    };

    return (
      <Host>
        <div class={inputClasses}>
          <div class={`${WT_INPUT}__wrapper`}>
            <slot name="before"></slot>
            <input class={`${WT_INPUT}__inner`} 
              type={this.type}
              placeholder={this.placeholder} 
              value={this.innerValue}
              disabled={this.disabled}
              onInput={(event) => this.handleChange(event)}
              onFocus={() => this.handleFocus()}
              onBlur={() => this.isFocused = false}
              ></input>
            <slot name="after"></slot>
          </div>
        </div>
      </Host>
    );
  }
}
