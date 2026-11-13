import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-video'
  })
  export class VtIconVideo {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M10 15.5v-7a.5.5 0 0 1 .8-.4l4.67 3.5c.27.2.27.6 0 .8l-4.67 3.5a.5.5 0 0 1-.8-.4"/><path fill="currentColor" fill-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10m-2 0a8 8 0 1 1-16 0 8 8 0 0 1 16 0" clip-rule="evenodd"/></svg></Host>;
    }
  }
  