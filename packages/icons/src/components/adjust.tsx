import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-adjust'
  })
  export class VtIconAdjust {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" clip-path="url(#a)"><path d="M14 16a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-.5H4a1 1 0 1 1 0-2h9V17a1 1 0 0 1 1-1m6 1.5a1 1 0 1 1 0 2h-3a1 1 0 1 1 0-2zm-10-8a1 1 0 0 1 1 1v.5h9a1 1 0 1 1 0 2h-9v.5a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1M7 11a1 1 0 1 1 0 2H4a1 1 0 1 1 0-2zm7-8a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-.5H4a1 1 0 0 1 0-2h9V4a1 1 0 0 1 1-1m6 1.5a1 1 0 1 1 0 2h-3a1 1 0 1 1 0-2z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  