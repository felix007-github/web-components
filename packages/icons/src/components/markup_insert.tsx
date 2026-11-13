import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-markup_insert'
  })
  export class VtIconMarkupInsert {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16c.27 0 .52.11.71.29.19.19.29.44.29.71v4c0 .27-.11.52-.29.71A1 1 0 0 1 20 10H4c-.27 0-.52-.11-.71-.29A1 1 0 0 1 3 9V5c0-.27.11-.52.29-.71A1 1 0 0 1 4 4m5 4h1V6H9zM5 6v2h2V6zm3 9h8v2H8z"/><path fill="currentColor" d="M11 20v-8h2v8z"/></svg></Host>;
    }
  }
  