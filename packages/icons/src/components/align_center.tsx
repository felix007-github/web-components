import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-align_center'
  })
  export class VtIconAlignCenter {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M7 15v2h10v-2zm-4 6h18v-2H3zm0-8h18v-2H3zm4-6v2h10V7zM3 3v2h18V3z"/></svg></Host>;
    }
  }
  