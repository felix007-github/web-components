import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-email_ticked'
  })
  export class VtIconEmailTicked {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" clip-path="url(#a)"><path d="m22.476 12.5 1.572 1.5-6.323 7L13 16.5l1.571-1.5 3.154 3z"/><path fill-rule="evenodd" d="M20 4c1.1 0 2 .9 2 2v5.5h-2V8l-8 5-8-5v10h8v2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm-8 7 8-5H4z" clip-rule="evenodd"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  