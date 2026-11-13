import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-italic_underline'
  })
  export class VtIconItalicUnderline {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" clip-path="url(#a)"><path fill-rule="evenodd" d="m7.272 17.5 2.689-3.244h6.968V17.5H19v-14h-2.426L5 17.5zm3.967-4.786 5.69-6.865v6.865z" clip-rule="evenodd"/><path d="M5 19h14v1.5H5z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  