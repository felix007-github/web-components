import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-paste'
  })
  export class VtIconPaste {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M19.6 4.4c-.3-.3-.8-.5-1.3-.5h-3.8C14.2 2.8 13.2 2 12 2s-2.2.8-2.6 1.8H5.6c-.4 0-.9.2-1.2.6-.4.3-.6.8-.6 1.2v14.5c0 .5.2.9.5 1.3.4.4.9.6 1.3.6h4.5v-1.8H5.6V5.6h1.8v2.7h9.1V5.6h1.8v5.8h1.8V5.6c.1-.4-.1-.9-.5-1.2m-7 1q-.3.3-.6.3c-.2 0-.5-.1-.6-.3q-.3-.3-.3-.6c0-.2.1-.5.3-.6q.3-.3.6-.3c.2 0 .5.1.6.3q.3.3.3.6t-.3.6m-1.1 7.2v1.8h3.1v7.5h1.8v-7.5h3.1v-1.8z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  