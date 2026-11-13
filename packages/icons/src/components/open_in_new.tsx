import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-open_in_new'
  })
  export class VtIconOpenInNew {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" fill-rule="evenodd" d="M9 3h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2V5a2 2 0 0 1 2-2M7 9H5v10h10v-2H9a2 2 0 0 1-2-2zm12-4H9v10h10zm-3 1h-4v2h2.586l-4.293 4.293 1.414 1.414L16 9.414V12h2V6z" clip-rule="evenodd"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  