import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-align_left'
  })
  export class VtIconAlignLeft {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M15 15H3v2h12zm0-8H3v2h12zM3 13h18v-2H3zm0 8h18v-2H3zM3 3v2h18V3z"/></svg></Host>;
    }
  }
  