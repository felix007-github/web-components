import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-expand'
  })
  export class VtIconExpand {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="m21.187 2.574-5.068.63a.213.213 0 0 0-.126.361L17.46 5.03l-4.112 4.112a.215.215 0 0 0 0 .303l1.208 1.208c.083.083.22.083.303 0l4.114-4.114 1.465 1.465a.212.212 0 0 0 .362-.126l.627-5.065a.212.212 0 0 0-.239-.239M9.444 13.347a.215.215 0 0 0-.302 0L5.03 17.462l-1.465-1.465a.212.212 0 0 0-.362.125l-.63 5.066c-.015.139.1.254.24.238l5.067-.63a.213.213 0 0 0 .126-.361L6.54 18.97l4.114-4.114a.215.215 0 0 0 0-.303z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  