import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-vertical_align_center'
  })
  export class VtIconVerticalAlignCenter {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M8 19h3v4h2v-4h3l-4-4zm8-14h-3V1h-2v4H8l4 4zM4 11v2h16v-2z"/></svg></Host>;
    }
  }
  