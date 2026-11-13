import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-cheklist'
  })
  export class VtIconCheklist {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" clip-path="url(#a)"><path d="M8 19.5h13v-2H8zm0-6h13v-2H8zm0-8v2h13v-2z"/><path fill-rule="evenodd" d="m5.178 4.44.894.875L2.757 8.56.928 6.77l.894-.875.935.913zm0 6 .894.875-3.315 3.245-1.829-1.79.894-.875.935.913zm0 6 .894.875-3.315 3.245-1.829-1.79.894-.875.935.913z" clip-rule="evenodd"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  