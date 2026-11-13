import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-plus_box_outline'
  })
  export class VtIconPlusBoxOutline {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M19.057 19.097v-14h-14v14zm0-16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2v-14a2 2 0 0 1 2-2zm-8 4h2v4h4v2h-4v4h-2v-4h-4v-2h4z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  