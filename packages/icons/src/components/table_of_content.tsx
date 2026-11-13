import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-table_of_content'
  })
  export class VtIconTableOfContent {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" fill-rule="evenodd" d="M4 4h2v2H4zM2 2h6v6H2zm16 9h2v2h-2zm-2-2h6v6h-6zm4 9h-2v2h2zm-2-2h-2v6h6v-6zM6 9H4v11h10v-2H6v-5h8v-2H6z" clip-rule="evenodd"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  