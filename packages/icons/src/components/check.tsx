import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-check'
  })
  export class VtIconCheck {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M21 7 9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  