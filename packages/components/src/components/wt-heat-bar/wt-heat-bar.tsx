import { Component, Prop, h, Host, Method, State, Element } from '@stencil/core';
import { HeatBar, type HeatItemData } from './heat-bar';
import { WT_HEAT_BAR, Direction } from "@/utils";

@Component({
  tag: 'wt-heat-bar',
  styleUrl: 'wt-heat-bar.scss',
})
export class WtHeatBar {
  @Element() hostEl!: HTMLElement;
  @Prop() blinkClass!: string;
  @Prop() position: Direction = 'left';
  @Prop() direction: Direction = 'left';
  @Prop() containerSelector!: string;
  @Prop() heatItemData: HeatItemData[] = [];
  @State() isMounted = false;

  private heatBarInstance?: HeatBar;
  private currentDragElem?: HTMLElement;

  private get heatBar() {
    if (!this.heatBarInstance) {
      this.heatBarInstance = new HeatBar({
        hostElement: this.hostEl,
        heatItemData: this.heatItemData,
        heatBarSelector: `.${WT_HEAT_BAR}`,
        containerSelector: this.containerSelector,
      });
    }
    return this.heatBarInstance;
  }

  private get outerHeatItems() {
    return this.heatBar.heatItems.filter(item => item.mode === 'outer') || [];
  }

  private bindCurrentDrag() {
    if (this.currentDragElem && this.heatBar.mounted) {
      this.heatBar.setCurrentDrag(this.currentDragElem);
    }
  }

  private ensureMounted() {
    if (this.heatBar.mounted) {
      this.bindCurrentDrag();
      if (!this.isMounted) {
        this.isMounted = true;
      }
      return;
    }

    try {
      this.heatBar.mount();
      this.bindCurrentDrag();
      this.isMounted = true;
    } catch (err) {
      // Avoid crashing the host app when selectors are wrong or DOM isn't ready.
      console.warn('[wt-heat-bar] Failed to mount heat bar.', err);
      this.disposeHeatBar();
    }
  }

  componentDidLoad() {
    this.ensureMounted();
  }

  disconnectedCallback() {
    this.disposeHeatBar();
  }

  componentDidRender() {
    this.bindCurrentDrag();
  }

  private disposeHeatBar() {
    if (this.heatBarInstance) {
      this.heatBarInstance.destroyed();
    }
    this.heatBarInstance = undefined;
    this.currentDragElem = undefined;
    this.isMounted = false;
  }

  @Method()
  async getHeatBarInstance() {
    this.ensureMounted();
    return this.heatBar;
  }

  @Method()
  async mounted() {
    this.ensureMounted();
  }

  @Method()
  async destroyed() {
    this.disposeHeatBar();
  }
 
  render() {
    return (
      <Host>
        <div class={{ [WT_HEAT_BAR]: true, 'mount': this.isMounted, [this.position]: true }}>
          <canvas class="map"></canvas>
          {this.heatBar?.hoverHeatItem?.tooltip ? (
            <div
              class={`tooltip ${this.direction}`}
              style={{
                top: (this.heatBar?.hoverHeatItem.top - 15 || 0) + 'px',
                ...(this.direction === 'right' ? { right: 'calc(90% + 13px)' } : { left: 'calc(90% + 13px)' }),
              }}
            >
              <div class="tooltip__arrow"></div>
              {this.heatBar?.hoverHeatItem?.tooltip || ''}
            </div>
          ) : null}
          {this.heatBar?.currentPageData.height ? (
            <div
              class="current"
              ref={el => {
                if (el) {
                  this.currentDragElem = el as HTMLElement;
                  this.bindCurrentDrag();
                }
              }}
              style={{
                height: this.heatBar?.currentPageData.height + 'px',
                top: this.heatBar?.currentPageData.top + 'px',
              }}
            ></div>
          ) : null}
          {this.outerHeatItems.map(item => {
            return (
              <div
                key={'' + item.x + item.y + item.width}
                style={{ top: item.top + 'px' }}
                class={{ 'line-item': true, [this.direction]: true, 'active': !!item.active }}
                onClick={() => this.heatBar.togo(item.originElem as HTMLElement)}
              >
                <div class="line"></div>
                <span>{item.tooltip}</span>
              </div>
            );
          })}
        </div>
      </Host>
    );
  }
}
