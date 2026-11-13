import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-bold_italic_underline'
  })
  export class VtIconBoldItalicUnderline {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" clip-path="url(#a)"><path fill-rule="evenodd" d="M19 3h-3L5 17h3.5l2.337-2.966H16V17h3zm-3 4.48-3.107 3.944H16z" clip-rule="evenodd"/><path d="M19 19H5v2h14z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  