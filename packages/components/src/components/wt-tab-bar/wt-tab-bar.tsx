import { Component, h, Host, Prop, State, Event, EventEmitter, Watch } from '@stencil/core';
import { WT_TAB_BAR, WtTabBarListItem } from '@/utils';
@Component({
  tag: 'wt-tab-bar',
  styleUrl: 'wt-tab-bar.scss',
})
export class WtTabBar {
  @Prop() list: WtTabBarListItem[] = [];
  @Prop() activeValue: string = '';
  @Event({ eventName: 'wt-change' }) wtChange!: EventEmitter

  @State() activeTab: string = '';
  @State() indicatorStyle: { transform: string; width: string } = {
    transform: 'translateX(0)',
    width: '0px',
  };

  private tabBarEl?: HTMLDivElement;
  private itemEls: HTMLDivElement[] = [];
  private resizeObserver?: ResizeObserver;

  componentWillLoad() {
    this.activeTab = this.activeValue;
  }

  componentDidLoad() {
    this.resizeObserver = new ResizeObserver(() => this.updateActiveIndicator());
    if (this.tabBarEl) {
      this.resizeObserver.observe(this.tabBarEl);
    }
    this.updateActiveIndicator();
  }

  componentDidUpdate() {
    this.updateActiveIndicator();
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }

  @Watch('activeValue')
  activeValueChanged(value: string) {
    this.activeTab = value;
  }

  private updateActiveIndicator() {
    const activeIndex = this.list.findIndex(item => item.value === this.activeTab);
    const activeItem = this.itemEls[activeIndex];

    if (!activeItem) {
      return;
    }

    const nextStyle = {
      transform: `translateX(${activeItem.offsetLeft}px)`,
      width: `${activeItem.offsetWidth}px`,
    };

    if (
      this.indicatorStyle.transform !== nextStyle.transform ||
      this.indicatorStyle.width !== nextStyle.width
    ) {
      this.indicatorStyle = nextStyle;
    }
  }
  
  private handleTabClick(item: WtTabBarListItem) {
    this.activeTab = item.value;
    this.wtChange.emit({ value: item.value })
  }
  render() {
    return (
      <Host>
        <div class={WT_TAB_BAR} ref={el => { this.tabBarEl = el; }}>
          <div class={`${WT_TAB_BAR}-indicator`} style={this.indicatorStyle}></div>
          {this.list.map((item, index) => (
            <div
              class={{ [`${WT_TAB_BAR}-item`]: true, 'active': this.activeTab === item.value }}
              ref={el => {
                if (el) {
                  this.itemEls[index] = el;
                }
              }}
              onClick={() => this.handleTabClick(item)}
            >
              <span class={`${WT_TAB_BAR}-item-label`}>{item.label}</span>
            </div>
          ))}
        </div>
      </Host>
    );
  }
}
