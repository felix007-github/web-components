import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-list_roman'
  })
  export class VtIconListRoman {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" clip-path="url(#a)"><path d="M2.5 19V5h2.01v14zm8.701 0H8.656L5.759 5h2.244L9.98 16.232h.05L12.005 5h2.143zm9.139 0-1.976-5.359L16.372 19h-2.093l2.964-7.376L14.563 5h2.094l1.758 4.825L20.155 5h2.06l-2.695 6.624L22.5 19z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  