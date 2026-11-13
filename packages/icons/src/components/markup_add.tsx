import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-markup_add'
  })
  export class VtIconMarkupAdd {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M4 4h16c.27 0 .52.11.71.29.19.19.29.44.29.71v4c0 .27-.11.52-.29.71A1 1 0 0 1 20 10H4c-.27 0-.52-.11-.71-.29A1 1 0 0 1 3 9V5c0-.27.11-.52.29-.71A1 1 0 0 1 4 4m5 4h1V6H9zM5 6v2h2V6zm12.22 7.84L10.06 21l-3.28-3.28L8.2 16.3l1.87 1.86 5.73-5.73 1.41 1.41z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  