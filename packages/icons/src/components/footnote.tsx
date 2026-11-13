import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-footnote'
  })
  export class VtIconFootnote {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M15 3H5c-.5 0-1 .2-1.4.6S3 4.5 3 5v14c0 .5.2 1 .6 1.4s.9.6 1.4.6h14c.5 0 1-.2 1.4-.6s.6-.9.6-1.4V9zm4 16H5V5h9v5h5m-2 7H7v-2.5h10"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  