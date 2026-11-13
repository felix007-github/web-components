import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-select_doc'
  })
  export class VtIconSelectDoc {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="m23.61 17.244-5 5-3.5-3.5 1.5-1.5 2 2 3.5-3.5zm-17.5-15a2 2 0 0 0-2 2v16c0 1.11.89 2 2 2h7.81c-.36-.62-.61-1.3-.73-2H6.11v-16h7v5h5v4.08c.33-.05.67-.08 1-.08.34 0 .67.03 1 .08v-5.08l-6-6m-6 10v2h8v-2m-8 4v2h5v-2z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  