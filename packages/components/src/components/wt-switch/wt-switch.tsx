import { Component, Host, Prop, Event, EventEmitter, State, Watch, h } from '@stencil/core';
import { WT_SWITCH, Size } from '@/utils';

@Component({
  tag: 'wt-switch',
  styleUrl: 'wt-switch.scss',
  shadow: false,
})
export class WtSwitch {
  /**
   * Vue v-model 绑定值 / React controlled value
   * @default false
   */
  @Prop() modelValue?: boolean;

  /**
   * 是否禁用
   * @default false
   */
  @Prop() disabled: boolean = false;

  /**
   * 开关尺寸
   * @default 'medium'
   */
  @Prop() size: Size | 'medium' = 'medium';

  /**
   * 跨框架 v-model 更新事件
   */
  @Event({ eventName: 'updateModelValue' }) updateModelValue!: EventEmitter<boolean>;

  /**
   * 值变更事件
   */
  @Event({ eventName: 'wt-change' }) changeEvent!: EventEmitter<boolean>;

  @State() innerValue = false;

  private normalizeModelValue(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    if (value == null) {
      return false;
    }
    // Handle wrapped CustomEvent from Vue v-model
    if (typeof value === 'object' && 'detail' in value) {
      return this.normalizeModelValue((value as CustomEvent<unknown>).detail);
    }
    return false;
  }

  componentWillLoad() {
    this.innerValue = this.normalizeModelValue(this.modelValue ?? false);
  }

  @Watch('modelValue')
  onModelValueChange(newValue: unknown) {
    this.innerValue = this.normalizeModelValue(newValue);
  }

  private handleClick() {
    if (this.disabled) return;
    const newValue = !this.innerValue;
    this.innerValue = newValue;
    this.changeEvent.emit(newValue);
    this.updateModelValue.emit(newValue);
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleClick();
    }
  }

  render() {
    const hostClasses = {
      [WT_SWITCH]: true,
      'is-checked': this.innerValue,
      'is-disabled': this.disabled,
      'is-small': this.size === 'small',
    };

    return (
      <Host>
        <span
          class={hostClasses}
          role="switch"
          aria-checked={this.innerValue ? 'true' : 'false'}
          aria-disabled={this.disabled ? 'true' : 'false'}
          tabindex={this.disabled ? '-1' : '0'}
          onClick={() => this.handleClick()}
          onKeyDown={(e: KeyboardEvent) => this.handleKeyDown(e)}
        >
          <span class="wt-switch__track">
            <span class="wt-switch__thumb"></span>
          </span>
        </span>
      </Host>
    );
  }
}
