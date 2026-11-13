import { Component, Prop, Host, h, Event, EventEmitter, State, Watch, Element } from '@stencil/core';
import { WT_SEARCH } from '@/utils';

export type SearchSize = 'small' | 'medium' | 'large';

@Component({
  tag: 'wt-search',
  styleUrl: 'wt-search.scss',
  shadow: true,
})
export class WtSearch {
  @Element() el!: HTMLElement;

  private inputRef?: HTMLInputElement;
  /** 组件尺寸：small | medium | large，默认 medium */
  @Prop() size: SearchSize = 'medium';

  /** 输入框占位文本 */
  @Prop() placeholder = '请输入搜索内容';

  /** 是否禁用组件 */
  @Prop() disabled = false;

  /** 是否显示清除图标，默认 true */
  @Prop() clearable = true;

  /** v-model 绑定值（Vue） */
  @Prop({ mutable: true }) modelValue?: string;

  /** React defaultValue */
  @Prop() defaultValue = '';

  /** 自定义宽度（px 值或 CSS 字符串） */
  @Prop() width?: string;

  /** 输入事件 */
  @Event({ eventName: 'wt-input' }) wtInput!: EventEmitter<string>;

  /** 清除事件 */
  @Event({ eventName: 'wt-clear' }) wtClear!: EventEmitter<void>;

  /** 搜索事件（点击搜索区域触发） */
  @Event({ eventName: 'wt-search' }) wtSearch!: EventEmitter<string>;

  /** Vue v-model 同步事件 */
  @Event({ eventName: 'updateModelValue' }) updateModelValue!: EventEmitter<string>;

  @State() innerValue = '';
  @State() isFocused = false;

  private normalizeValue(value: unknown, depth = 0): string {
    if (depth > 4) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value == null) return '';
    if (typeof value === 'object' && 'detail' in value) {
      return this.normalizeValue((value as CustomEvent<unknown>).detail, depth + 1);
    }
    return '';
  }

  componentWillLoad() {
    this.innerValue = this.normalizeValue(this.modelValue ?? this.defaultValue ?? '');
  }

  @Watch('modelValue')
  onModelValueChange(newValue: unknown) {
    this.innerValue = this.normalizeValue(newValue);
  }

  private handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.innerValue = value;
    this.wtInput.emit(value);
    this.updateModelValue.emit(value);
  }

  private handleFocus() {
    if (!this.disabled) {
      this.isFocused = true;
    }
  }

  private handleBlur() {
    this.isFocused = false;
  }

  private handleClear(event: MouseEvent) {
    event.stopPropagation();
    if (this.disabled) return;
    this.innerValue = '';
    this.wtInput.emit('');
    this.updateModelValue.emit('');
    this.wtClear.emit();
    this.inputRef?.focus();
  }

  private handleSearch() {
    if (this.disabled) return;
    this.wtSearch.emit(this.innerValue);
  }

  private getDefaultWidth(): string {
    if (this.size === 'small') return '320px';
    if (this.size === 'large') return '360px';
    return '340px'; // medium
  }

  render() {
    const hasValue = this.innerValue.length > 0;

    const wrapperClasses = {
      [WT_SEARCH]: true,
      [`${WT_SEARCH}--${this.size}`]: true,
      [`${WT_SEARCH}--focused`]: this.isFocused,
      [`${WT_SEARCH}--disabled`]: this.disabled,
    };

    const resolvedWidth = this.width ?? this.getDefaultWidth();

    return (
      <Host>
        <div class={wrapperClasses} style={{ width: resolvedWidth }}>
          {/* Input area */}
          <div class={`${WT_SEARCH}__input-wrap`}>
            <input
              class={`${WT_SEARCH}__inner`}
              type="text"
              placeholder={this.placeholder}
              value={this.innerValue}
              disabled={this.disabled}
              ref={el => (this.inputRef = el as HTMLInputElement)}
              onInput={e => this.handleInput(e)}
              onFocus={() => this.handleFocus()}
              onBlur={() => this.handleBlur()}
            />
            {/* Clear icon */}
            {this.clearable && hasValue && !this.disabled && (
              <div class={`${WT_SEARCH}__clear`} onClick={e => this.handleClear(e)}>
                <wt-icon class={`${WT_SEARCH}__clear-icon`} name="clear"  ></wt-icon>
              </div>
            )}
          </div>

          {/* Search button */}
          <div class={`${WT_SEARCH}__btn`} onClick={() => this.handleSearch()} aria-label="搜索">
            <wt-icon name="search" class={`${WT_SEARCH}__search-icon`}></wt-icon>
          </div>
        </div>
      </Host>
    );
  }
}
