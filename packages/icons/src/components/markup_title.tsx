import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-markup_title'
  })
  export class VtIconMarkupTitle {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M20 4H4c-.27 0-.52.1-.71.29-.18.19-.29.44-.29.71v4c0 .27.1.52.29.71.19.18.44.29.71.29h16c.27 0 .52-.1.71-.29.18-.19.29-.44.29-.71V5c0-.27-.1-.52-.29-.71-.19-.18-.44-.29-.71-.29M10 8H9V6h1zM5 8V6h2v2z" clip-rule="evenodd"/><path fill="currentColor" d="M8 12v1.8h3.077V21h1.846v-7.2H16V12z"/></svg></Host>;
    }
  }
  