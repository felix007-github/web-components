import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-author_note'
  })
  export class VtIconAuthorNote {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9zm4 16H5V5h9v5h5m-2 4H7v-2h10m-3 5H7v-2h7"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  