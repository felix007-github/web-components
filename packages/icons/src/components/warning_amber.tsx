import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-warning_amber'
  })
  export class VtIconWarningAmber {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="m12 5.494 7.53 13.01H4.47zm-9.26 12.01c-.77 1.33.19 3 1.73 3h15.06c1.54 0 2.5-1.67 1.73-3l-7.53-13.01c-.77-1.33-2.69-1.33-3.46 0zm8.26-7v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1m0 5h2v2h-2z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  