import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-voice'
  })
  export class VtIconVoice {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" clip-path="url(#a)"><path fill-rule="evenodd" d="M12 2a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4m2 9V6a2 2 0 1 0-4 0v5a2 2 0 1 0 4 0" clip-rule="evenodd"/><path d="M13 18.938V22h-2v-3.062A8 8 0 0 1 4 11h2a6 6 0 0 0 12 0h2a8 8 0 0 1-7 7.938"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  