import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-msg_send'
  })
  export class VtIconMsgSend {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" fill-rule="evenodd" d="M20.736 3.264a.9.9 0 0 1 .213.933l-5.67 16.2a.9.9 0 0 1-1.671.069l-3.1-6.974-6.974-3.1a.9.9 0 0 1 .069-1.671l16.2-5.67a.9.9 0 0 1 .933.213m-8.472 9.745 2.066 4.651 3.618-10.335zm4.41-6.957L6.34 9.67l4.65 2.066z" clip-rule="evenodd"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  