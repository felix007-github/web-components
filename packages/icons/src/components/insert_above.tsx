import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-insert_above'
  })
  export class VtIconInsertAbove {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M16 9H8V7h8z"/><path fill="currentColor" d="M13 4v8h-2V4z"/><path fill="currentColor" fill-rule="evenodd" d="M20 20a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm-4.333-2H19v-2h-3.333zm-2 0h-3.334v-2h3.334zM5 18h3.333v-2H5z" clip-rule="evenodd"/></svg></Host>;
    }
  }
  