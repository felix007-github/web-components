import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-table_column'
  })
  export class VtIconTableColumn {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M16 3.111C16 2.497 15.403 2 14.667 2H9.333C8.597 2 8 2.497 8 3.111V20.89c0 .613.597 1.11 1.333 1.11h5.334c.736 0 1.333-.497 1.333-1.111zM14.083 8V4.222H10V8zm0 2.148v3.704H10v-3.704zm0 9.63v-3.704H10v3.704z" clip-rule="evenodd"/></svg></Host>;
    }
  }
  