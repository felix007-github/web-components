import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-sort_alphabetical_ascending'
  })
  export class VtIconSortAlphabeticalAscending {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M11 13v2l-3.33 4H11v2H5v-2l3.33-4H5v-2"/><path fill="currentColor" d="M19 17h3l-4 4-4-4h3V3h2z"/><path fill="currentColor" fill-rule="evenodd" d="M9 3a2 2 0 0 1 2 2v6H9V9H7v2H5V5c0-1.1.9-2 2-2zM7 7h2V5H7z" clip-rule="evenodd"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  