import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-publish'
  })
  export class VtIconPublish {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M5 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h7.8c-.4-.6-.6-1.3-.7-2H5V4h7v5h5v4.1c.3-.1.7-.1 1-.1s.7 0 1 .1V8l-6-6M7 12v2h8v-2m-8 4v2h5v-2zm10.3-2.5 5 5h-3v4h-4v-4h-3.1z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  