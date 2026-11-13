import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-paragraphs'
  })
  export class VtIconParagraphs {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M22 5.5h-1.3V20h-1.5V5.5h-1.3V20h-1.5v-8.4q-1.05 0-1.8-.3c-.5-.2-1-.5-1.4-.8s-.7-.8-.9-1.2q-.3-.75-.3-1.5 0-.9.3-1.5.3-.75.9-1.2c.4-.3.8-.6 1.4-.8q.75-.3 1.8-.3H22zm-10 0h-1.2V20H9.2V5.5H7.9V20H6.4v-8.4q-1.05 0-1.8-.3c-.5-.2-1-.5-1.4-.8s-.7-.8-.9-1.2Q2 8.55 2 7.8q0-.9.3-1.5c.2-.5.5-.9.8-1.3.4-.3.9-.5 1.4-.7.6-.2 1.2-.3 1.9-.3H12z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  