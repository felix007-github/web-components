import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-attribute'
  })
  export class VtIconAttribute {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M11 20v2H3c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2v8.1l-.2-.2c-.5-.5-1.1-.8-1.8-.8V6H3v14zm10.4-6.7 1.3 1.3c.2.2.2.6 0 .8l-1 1-2.1-2.1 1-1c.1-.1.2-.2.4-.2s.3.1.4.2m-.3 3.6-6 6.1H13v-2.1l6.1-6.1z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  