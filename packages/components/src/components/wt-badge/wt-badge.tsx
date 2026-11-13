import { Component, Host, Prop, h } from '@stencil/core';
import { WT_BADGE } from '@/utils';

export type BadgeType = 'primary' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  tag: 'wt-badge',
  styleUrl: 'wt-badge.scss',
  shadow: false,
})
export class WtBadge {
  /**
   * 显示值
   * @default ''
   */
  @Prop() value: string | number = '';

  /**
   * 最大值，超过最大值会显示 {max}+。只有当 value 是数字类型时起作用。
   * @default 99
   */
  @Prop() max: number = 99;

  /**
   * 是否显示小圆点
   * @default false
   */
  @Prop() isDot: boolean = false;

  /**
   * 是否隐藏 Badge
   * @default false
   */
  @Prop() hidden: boolean = false;

  /**
   * badge 类型
   * @default 'danger'
   */
  @Prop() type: BadgeType = 'danger';

  private getDisplayValue(): string {
    if (this.isDot) return '';
    if (typeof this.value === 'number' && this.value > this.max) {
      return `${this.max}+`;
    }
    return String(this.value);
  }

  render() {
    const badgeClass = {
      [WT_BADGE]: true,
      [`${WT_BADGE}--dot`]: this.isDot,
      [`${WT_BADGE}--${this.type}`]: true,
      [`${WT_BADGE}--hidden`]: this.hidden,
    };

    return (
      <Host>
        <span class={`${WT_BADGE}-wrap`}>
          <slot></slot>
          <span class={badgeClass} aria-label={`badge: ${this.getDisplayValue()}`}>
            {!this.isDot && this.getDisplayValue()}
          </span>
        </span>
      </Host>
    );
  }
}
