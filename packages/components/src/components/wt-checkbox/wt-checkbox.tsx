import { Component, Prop, Host, h, Event, EventEmitter, Watch, State } from "@stencil/core";
import { WT_CHECKBOX, Size } from "@/utils";

@Component({
  tag: "wt-checkbox",
  styleUrl: "wt-checkbox.scss",
  shadow: true,
})
export class WtCheckbox {
  private inputElement?: HTMLInputElement;

  @Prop() label?: string;
  @Prop({ mutable: true, reflect: true }) checked: boolean = false;
  @Prop() modelValue?: any;
  /** 当checkbox处于选中状态时的绑定值 */
  @Prop() trueValue: any = true;
  /** 当checkbox处于非选中状态时的绑定值 */
  @Prop() falseValue: any = false;
  @Prop({ reflect: true }) disabled: boolean = false;
  @Prop({ mutable: true, reflect: true }) indeterminate: boolean = false;
  @Prop() size?: Size | 'medium';
  @Prop() name?: string;
  @Prop() required: boolean = false;

  @Event({ eventName: "wt-change" }) changeEvent!: EventEmitter<any>;
  @Event({ eventName: "updateModelValue" }) updateModelValue!: EventEmitter<any>;

  @State() isFocused = false;

  componentWillLoad() {
    this.updateCheckedBasedOnModelValue(this.modelValue ?? this.checked);
  }

  componentDidLoad() {
    this.syncIndeterminateState();
  }

  @Watch("modelValue")
  onModelValueChange(newValue: any) {
    this.updateCheckedBasedOnModelValue(newValue);
  }

  private updateCheckedBasedOnModelValue(value: any) {
    // Handling React/Vue custom wrappers seamlessly
    let unwrappedValue = value;
    if (typeof value === 'object' && value !== null && 'detail' in value) {
      unwrappedValue = value.detail;
    }
    
    if (unwrappedValue === this.trueValue) {
      this.checked = true;
    } else if (unwrappedValue === this.falseValue) {
      this.checked = false;
    } else {
      this.checked = !!unwrappedValue; 
    }
  }

  @Watch("checked")
  @Watch("indeterminate")
  syncIndeterminateState() {
    if (this.inputElement) {
      this.inputElement.indeterminate = this.indeterminate;
    }
  }

  private handleChange = (event: Event) => {
    if (this.disabled) return;
    
    const nextChecked = (event.target as HTMLInputElement).checked;

    this.checked = nextChecked;
    this.indeterminate = false;
    
    const emitValue = nextChecked ? this.trueValue : this.falseValue;
    
    this.changeEvent.emit(emitValue);
    this.updateModelValue.emit(emitValue);
  };

  render() {

    const wrapClasses = {
      [WT_CHECKBOX]: true,
      [`is-checked`]: this.checked,
      [`is-disabled`]: this.disabled,
      [`is-indeterminate`]: this.indeterminate,
      [`is-${this.size || 'medium'}`]: true,
    };

    return (
      <Host>
        <label class={wrapClasses}>
          <span class={`${WT_CHECKBOX}__input`}>
            <span class={`${WT_CHECKBOX}__inner`}>
              {!this.indeterminate && <svg class={`${WT_CHECKBOX}__icon`} viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.2083 0.8225L3.20833 7.8225L0 4.61417L0.8225 3.79167L3.20833 6.17167L9.38583 0L10.2083 0.8225Z" fill="#FAFBFC"/>
              </svg>}
              {this.indeterminate && <svg class={`${WT_CHECKBOX}__icon`} viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.33333 1.33333H0V0H9.33333V1.33333Z" fill="#FAFBFC"/>
              </svg>}
            </span>
            <input
              ref={(element) => {
                this.inputElement = element;
                this.syncIndeterminateState();
              }}
              class={`${WT_CHECKBOX}__original`}
              type="checkbox"
              checked={this.checked}
              disabled={this.disabled}
              name={this.name}
              required={this.required}
              onChange={this.handleChange}
            />
          </span>
          <span class={`${WT_CHECKBOX}__label`}>
            {this.label ? this.label : <slot></slot>}
          </span>
        </label>
      </Host>
    );
  }
}