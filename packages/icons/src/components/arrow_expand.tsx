import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-arrow_expand'
  })
  export class VtIconArrowExpand {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M12 9.636 16.59 5 18 6.427 12 12.5 6 6.427 7.41 5zm0 6L16.59 11 18 12.427 12 18.5l-6-6.073L7.41 11z" clip-rule="evenodd"/></svg></Host>;
    }
  }
  