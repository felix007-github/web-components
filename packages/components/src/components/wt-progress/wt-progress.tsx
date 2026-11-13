import { Component, h, Host, Prop, State, Watch } from "@stencil/core";
import { WT_PROGRESS, ProgressShape } from "@/utils";
@Component({
  tag: "wt-progress",
  styleUrl: "wt-progress.scss",
})
export class WtProgress {
  @Prop() label: string = "";
  @Prop() type: "primary" | "success" | "error" = "primary";
  @Prop() shape: ProgressShape = 'line';
  @Prop() percentage: number = 0;
  @State() fillWidth: number = 0;


  componentDidLoad() {
    // 初始动画
    setTimeout(() => {
      this.fillWidth = this.percentage;
    }, 0);
  }

  @Watch('percentage')
  onPercentageChange(newValue: number) {
    // 触发动画
    setTimeout(() => {
      this.fillWidth = newValue;
    }, 0);
  }

  render() {
    if (this.shape === 'circle') {
      // 圆环参数
      const size = 20;
      const strokeWidth = 4;
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const progress = Math.max(0, Math.min(100, this.percentage));
      const dash = (progress / 100) * circumference;
      return (
        <Host>
          <div class={`${WT_PROGRESS}-circle ${this.type}`}>
            <svg width={size} height={size}>
              <circle
                class={`${WT_PROGRESS}-circle-bg`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
              />
              <circle
                class={`${WT_PROGRESS}-circle-bar`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke-dasharray={`${dash},${circumference - dash}`}
              />
            </svg>
            <span class={`${WT_PROGRESS}-circle-label`}>
              {this.label || `${progress}%`}
            </span>
          </div>
        </Host>
      );
    }
    // 默认线性进度条
    return (
      <Host>
        <div class={`${WT_PROGRESS}`}>
          <div class={`${WT_PROGRESS}-bar`}>
            <div class={`${WT_PROGRESS}-fill ${this.type}`} style={{ width: `${this.fillWidth}%` }}></div>
          </div>
          <span class={`${WT_PROGRESS}-label ${this.type}`}>
            {this.label || `${this.percentage}%`}
          </span>
        </div>
      </Host>
    );
  }
}