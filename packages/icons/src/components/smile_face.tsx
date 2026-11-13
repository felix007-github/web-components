import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-smile_face'
  })
  export class VtIconSmileFace {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" clip-path="url(#a)"><path d="M10 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m5.5 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m-7.447 2.606a1 1 0 0 1 1.337.439l.001.001.018.032q.03.051.102.157c.098.138.252.328.466.518.418.372 1.066.747 2.023.747s1.604-.375 2.023-.747a3.1 3.1 0 0 0 .568-.675l.018-.032v-.001a1 1 0 0 1 1.785.902L15.5 15l.894.448-.002.003-.002.005-.006.011a2 2 0 0 1-.07.127 5.1 5.1 0 0 1-.962 1.154C14.646 17.374 13.542 18 12 18c-1.543 0-2.646-.625-3.352-1.253a5 5 0 0 1-.769-.857 4 4 0 0 1-.263-.423l-.006-.011-.003-.005v-.002h-.001c0-.001 0-.002.894-.449l-.894.447a1 1 0 0 1 .447-1.341"/><path fill-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10m8-10a8 8 0 1 1-16 0 8 8 0 0 1 16 0" clip-rule="evenodd"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  