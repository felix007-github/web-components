import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-content_copy'
  })
  export class VtIconContentCopy {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M17 1H5c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H9c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H9V7h11z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  