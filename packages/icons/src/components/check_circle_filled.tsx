import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-check_circle_filled'
  })
  export class VtIconCheckCircleFilled {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" fill-rule="evenodd" d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2m-1 11.586-3-3L6.586 12 11 16.414 18.414 9 17 7.586z" clip-rule="evenodd"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  