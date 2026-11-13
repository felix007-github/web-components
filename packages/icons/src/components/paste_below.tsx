import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-paste_below'
  })
  export class VtIconPasteBelow {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" clip-path="url(#a)"><path d="M5 2h10v2H5v14H3V4c0-1.1.9-2 2-2"/><path d="M9 6h9c1.1 0 2 .9 2 2v3h-2V8H9v12h4v2H9c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2"/><path d="m18.5 18.204 1.864-1.864 1.414 1.414-4.242 4.243-4.243-4.243 1.414-1.414 1.793 1.793V13h2z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  