import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-reference'
  })
  export class VtIconReference {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8zm4 18H6V4h7v5h5zm-8.6-9.7V19h1.7v-3.5h.7l1 3.5h1.7l-1.1-3.6c.6-.3 1.1-.9 1.1-1.6v-1.7c0-.5-.2-.9-.5-1.2s-.8-.5-1.2-.5H9.4zm1.7 1.8h1.7v1.7h-1.7z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  