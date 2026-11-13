import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-paragraph'
  })
  export class VtIconParagraph {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M18.3 5.5h-2.2V20h-1.5V5.5h-2.7V20h-1.5v-8.4q-1.05 0-1.8-.3c-.5-.2-1-.5-1.4-.8s-.7-.8-.9-1.2Q6 8.55 6 7.8q0-.9.3-1.5c.1-.5.4-.9.8-1.3.4-.3.8-.6 1.4-.8.5-.1 1.2-.2 1.8-.2h7.9v1.5z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  