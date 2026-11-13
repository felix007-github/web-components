import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-code'
  })
  export class VtIconCode {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" clip-path="url(#a)"><path d="M14.659 3.033a1 1 0 0 1 .707 1.225l-4.4 16.42a1 1 0 1 1-1.932-.517l4.4-16.42a1 1 0 0 1 1.225-.708M.707 11.242a1 1 0 0 0 0 1.414l4.95 4.95A1 1 0 1 0 7.07 16.19l-4.242-4.24 4.243-4.243a1 1 0 0 0-1.414-1.414zm18-4.95 4.95 4.95a1 1 0 0 1 0 1.414l-4.95 4.95a1 1 0 1 1-1.414-1.415l4.243-4.242-4.243-4.243a1 1 0 0 1 1.414-1.414"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  