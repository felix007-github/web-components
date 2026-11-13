import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-supplement'
  })
  export class VtIconSupplement {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M22.159 9.159c1.25-1.25.68-2.71 0-3.42l-3-3c-1.26-1.25-2.71-.68-3.42 0l-1.7 1.71h-2.59c-1.9 0-3 1-3.56 2.15l-4.44 4.44v4l-.71.7c-1.25 1.26-.68 2.71 0 3.42l3 3c.54.54 1.12.74 1.67.74.71 0 1.36-.35 1.75-.74l2.7-2.71h3.59c1.7 0 2.56-1.06 2.87-2.1 1.13-.3 1.75-1.16 2-2 1.55-.4 2.13-1.87 2.13-2.9v-3h-.59zm-1.71 3.29c0 .45-.19 1-1 1h-1v1c0 .45-.19 1-1 1h-1v1c0 .45-.19 1-1 1h-4.41l-3.28 3.28c-.31.29-.49.12-.6.01l-2.99-2.98c-.29-.31-.12-.49-.01-.6l1.29-1.3v-4l2-2v1.59c0 1.21.8 3 3 3s3-1.79 3-3h7zm.29-4.71-1.7 1.71h-7.59v2c0 .45-.19 1-1 1s-1-.55-1-1v-3c0-.46.17-2 2-2h3.41l2.28-2.28c.31-.29.49-.12.6-.01l2.99 2.98c.29.31.12.49.01.6"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  