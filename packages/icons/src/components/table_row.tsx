import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-table_row'
  })
  export class VtIconTableRow {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M3.111 8C2.497 8 2 8.597 2 9.333v5.334C2 15.403 2.497 16 3.111 16H20.89c.614 0 1.111-.597 1.111-1.333V9.333C22 8.597 21.503 8 20.889 8zM8 9.917H4.222V14H8zm2.148 0h3.704V14h-3.704zm9.63 0h-3.704V14h3.704z" clip-rule="evenodd"/></svg></Host>;
    }
  }
  