import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-tone'
  })
  export class VtIconTone {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" clip-path="url(#a)"><path d="M12 3a1 1 0 0 1 1 1v16a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1M8 6a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1M4 9a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0v-4a1 1 0 0 1 1-1m16 0a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0v-4a1 1 0 0 1 1-1"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  