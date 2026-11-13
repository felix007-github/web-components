import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-format_underlined'
  })
  export class VtIconFormatUnderlined {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M12 17c3.31 0 6-2.69 6-6V4h-2.5v7c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V4H6v7c0 3.31 2.69 6 6 6m-7 2v2h14v-2z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  