import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-add_child'
  })
  export class VtIconAddChild {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M16 10a6 6 0 0 0-5.932 5.1H7.2a.7.7 0 0 1-.7-.7V5.3h7.275a2.4 2.4 0 1 0 0-1.8H2v1.8h2.7v9.1a2.5 2.5 0 0 0 2.5 2.5h2.868A6.001 6.001 0 0 0 22 16c0-3.312-2.687-6-6-6m3.2 6.65a.2.2 0 0 1-.2.2h-2.15V19a.2.2 0 0 1-.2.2h-1.3a.2.2 0 0 1-.2-.2v-2.15H13a.2.2 0 0 1-.2-.2v-1.3c0-.11.09-.2.2-.2h2.15V13c0-.11.09-.2.2-.2h1.3c.11 0 .2.09.2.2v2.15H19c.11 0 .2.09.2.2z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  