import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-pin_filled'
  })
  export class VtIconPinFilled {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M16 4v8l2 2v2h-5.2v6h-1.6v-6H6v-2l2-2V4H7V2h10v2z"/></svg></Host>;
    }
  }
  