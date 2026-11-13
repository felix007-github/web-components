import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-move'
  })
  export class VtIconMove {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" clip-path="url(#a)"><path d="M13 13h7a1 1 0 1 0 0-2h-7V4a1 1 0 1 0-2 0v7H4a1 1 0 1 0 0 2h7v7a1 1 0 1 0 2 0z"/><path d="M6.343 7.757 2.101 12l4.242 4.243 1.414-1.414L4.93 12l2.828-2.828zm9.9-1.414L12 2.101 7.757 6.343l1.415 1.414L12 4.93l2.829 2.828zm1.414 9.9L21.9 12l-4.243-4.243-1.414 1.415L19.07 12l-2.828 2.829zm-9.9 1.414L12 21.9l4.243-4.243-1.414-1.414L12 19.07l-2.828-2.828z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  