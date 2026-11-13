import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-vertical_align_bottom'
  })
  export class VtIconVerticalAlignBottom {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M16 13h-3V3h-2v10H8l4 4zM4 19v2h16v-2z"/></svg></Host>;
    }
  }
  