import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-link'
  })
  export class VtIconLink {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" clip-path="url(#a)"><path d="M3 9.5a3 3 0 0 1 3-3h8a3 3 0 1 1 0 6h-4a1 1 0 1 0 0 2h4a5 5 0 0 0 0-10H6a5 5 0 0 0-3.75 8.308 1 1 0 0 0 1.5-1.324A3 3 0 0 1 3 9.5"/><path d="M10 8.5a5 5 0 0 0 0 10h8a5 5 0 0 0 3.75-8.307 1 1 0 1 0-1.5 1.323A3 3 0 0 1 18 16.5h-8a3 3 0 1 1 0-6h4a1 1 0 1 0 0-2z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  