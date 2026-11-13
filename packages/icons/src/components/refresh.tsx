import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-refresh'
  })
  export class VtIconRefresh {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M17.64 6.35A7.96 7.96 0 0 0 11.99 4C7.57 4 4 7.58 4 12s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08a5.99 5.99 0 0 1-5.65 4c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L12.99 11h7V4z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  