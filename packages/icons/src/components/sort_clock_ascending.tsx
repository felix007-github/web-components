import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-sort_clock_ascending'
  })
  export class VtIconSortClockAscending {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M8 5c-3.86 0-7 3.13-7 7s3.13 7 7 7c3.86 0 7-3.13 7-7s-3.13-7-7-7m0 2.15c2.67 0 4.85 2.17 4.85 4.85S10.68 16.85 8 16.85 3.15 14.68 3.15 12 5.32 7.15 8 7.15M7 9v3.69l3.19 1.84.75-1.3-2.44-1.41V9"/><path fill="currentColor" d="M23 17h-3V3h-2v14h-3l4 4z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  