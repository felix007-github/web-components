import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-vertical_align_top'
  })
  export class VtIconVerticalAlignTop {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M8 11h3v10h2V11h3l-4-4zM4 3v2h16V3z"/></svg></Host>;
    }
  }
  