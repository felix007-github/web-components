import { Component, Host, Prop, h } from '@stencil/core';
import { WT_DIVIDER } from '@/utils';

export type DividerDirection = 'horizontal' | 'vertical';
export type DividerStyle = 'solid' | 'dashed';
export type DividerVariant = 'default' | 'subdued' | 'strong';

// Default colors per variant
const VARIANT_COLORS: Record<DividerVariant, string> = {
  default: 'rgba(197, 206, 217, 1)',
  subdued: 'rgba(213, 221, 229, 1)',
  strong: 'rgba(80, 100, 133, 1)',
};

@Component({
  tag: 'wt-divider',
  styleUrl: 'wt-divider.scss',
  shadow: false,
})
export class WtDivider {
  /**
   * 分割线方向
   * @default 'horizontal'
   */
  @Prop() direction: DividerDirection = 'horizontal';

  /**
   * 分割线样式
   * @default 'solid'
   */
  @Prop() borderStyle: DividerStyle = 'solid';

  /**
   * 颜色变体：default | subdued | strong
   * 当 color 未设置时，根据 variant 选择默认颜色
   * @default 'default'
   */
  @Prop() variant: DividerVariant = 'default';

  /**
   * 自定义颜色，优先级高于 variant
   */
  @Prop() color?: string;

  /**
   * 分割线宽度（粗细）
   * @default '1px'
   */
  @Prop() borderWidth: string = '1px';

  private getColor(): string {
    return this.color || VARIANT_COLORS[this.variant] || VARIANT_COLORS.default;
  }

  render() {
    const isVertical = this.direction === 'vertical';
    const resolvedColor = this.getColor();

    const classes = {
      [WT_DIVIDER]: true,
      [`${WT_DIVIDER}--horizontal`]: !isVertical,
      [`${WT_DIVIDER}--vertical`]: isVertical,
      [`${WT_DIVIDER}--${this.borderStyle}`]: true,
      [`${WT_DIVIDER}--${this.variant}`]: true,
    };

    const inlineStyle: Record<string, string> = {
      '--wt-divider-color': resolvedColor,
      '--wt-divider-width': this.borderWidth,
    };

    return (
      <Host>
        <div class={classes} style={inlineStyle} role="separator" aria-orientation={this.direction} />
      </Host>
    );
  }
}
