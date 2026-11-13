import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-tag_title'
  })
  export class VtIconTagTitle {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M3 20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zM5 5v14h14V5z" clip-rule="evenodd"/><path fill="currentColor" d="M8 8v1.8h3.077V17h1.846V9.8H16V8z"/></svg></Host>;
    }
  }
  