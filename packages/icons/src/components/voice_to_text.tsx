import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-voice_to_text'
  })
  export class VtIconVoiceToText {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" clip-path="url(#a)"><path fill-rule="evenodd" d="M5.88 6a3 3 0 0 1 6 0v4a3 3 0 1 1-6 0zm4 0v4a1 1 0 1 1-2 0V6a1 1 0 0 1 2 0" clip-rule="evenodd"/><path d="M3 11a6.01 6.01 0 0 0 4.88 4.717V18h2v-2.283A6.01 6.01 0 0 0 14.76 11h-2.063a4.002 4.002 0 0 1-7.634 0z"/><path fill-rule="evenodd" d="M16.175 13h1.389l3.316 8h-1.895l-.657-1.695h-2.96L14.731 21H12.88zm.646 2.328-.926 2.486h1.862z" clip-rule="evenodd"/><path d="M16.63 8.5a2.75 2.75 0 0 0-2.75-2.75v-1.5a4.25 4.25 0 0 1 4.25 4.25h1.509a.1.1 0 0 1 .07.17l-2.258 2.26a.1.1 0 0 1-.142 0l-2.258-2.26a.1.1 0 0 1 .07-.17z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  