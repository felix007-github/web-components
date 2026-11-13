import { Component, Host, Prop, Event, EventEmitter, State, Watch, Element, h } from '@stencil/core';
import { WT_RADIO, Size } from '@/utils';

@Component({
  tag: 'wt-radio',
  styleUrl: 'wt-radio.scss',
  shadow: false,
})
export class WtRadio {
  @Element() el?: HTMLElement;
  
  /**
   * 单选框的值
   */
  @Prop() value?: any;

  /**
   * Vue v-model 绑定值 / React controlled value
   * @default undefined
   */
  @Prop() modelValue?: any;

  /**
   * 是否禁用
   * @default false
   */
  @Prop() disabled: boolean = false;

  /**
   * 单选框尺寸
   * @default 'medium'
   */
  @Prop() size: Size | 'medium' = 'medium';

  /**
   * 单选框名称，用于分组
   */
  @Prop() name?: string;

  /**
   * 值变更事件
   */
  @Event({ eventName: 'wt-change' }) changeEvent!: EventEmitter<any>;

  /**
   * 跨框架 v-model 更新事件
   */
  @Event({ eventName: 'updateModelValue' }) updateModelValue!: EventEmitter<any>;

  @State() isChecked = false;

  componentWillLoad() {
    this.updateCheckedState();
  }

  @Watch('modelValue')
  onModelValueChange() {
    this.updateCheckedState();
  }

  @Watch('value')
  onValueChange() {
    this.updateCheckedState();
  }

  private updateCheckedState() {
    // Handle wrapped CustomEvent from Vue v-model
    let value = this.modelValue;
    if (typeof value === 'object' && value !== null && 'detail' in value) {
      value = (value as CustomEvent<any>).detail;
    }
    this.isChecked = value === this.value;
  }

  private handleClick() {
    if (this.disabled) return;

    if (this.isChecked) return;

    this.isChecked = true;
    this.changeEvent.emit(this.value);
    this.updateModelValue.emit(this.value);
    this.el?.dispatchEvent(
      new CustomEvent('update:modelValue', this.value)
    );
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
      [WT_RADIO]: true,
      'is-checked': this.isChecked,
      'is-disabled': this.disabled,
      'is-small': this.size === 'small',
      'is-medium': this.size === 'medium',
      'is-large': this.size === 'large',
    };

    return (
      <Host>
        <span
          class={hostClasses}
          role="radio"
          aria-checked={this.isChecked ? 'true' : 'false'}
          aria-disabled={this.disabled ? 'true' : 'false'}
          tabindex={this.disabled ? '-1' : '0'}
          onClick={() => this.handleClick()}
          onKeyDown={(e: KeyboardEvent) => this.handleKeyDown(e)}
        >
          <span class="wt-radio__circle">
            {this.isChecked && <span class="wt-radio__dot"></span>}
          </span>
          <input
            class="wt-radio__original"
            type="radio"
            checked={this.isChecked}
            disabled={this.disabled}
            name={this.name}
            value={this.value}
            style={{ display: 'none' }}
          />
        </span>
      </Host>
    );
  }
}
