import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-shortcut'
  })
  export class VtIconShortcut {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="currentColor" fill-rule="evenodd" clip-path="url(#a)" clip-rule="evenodd"><path d="M7 14.941c0-1.138.921-2.059 2.059-2.059v-.002h.883v-1.765H9.06a2.058 2.058 0 1 1 2.059-2.056v.883h1.765V9.06a2.058 2.058 0 1 1 4.117 0 2.06 2.06 0 0 1-2.059 2.059h-.883v1.765h.883a2.058 2.058 0 1 1 0 4.117 2.06 2.06 0 0 1-2.059-2.059v-.883h-1.764v.883a2.058 2.058 0 1 1-4.118 0m2.059.884a.884.884 0 0 0 .883-.884v-.883H9.06a.884.884 0 0 0 0 1.767m5.884-7.652a.884.884 0 0 0-.883.884v.883h.883a.884.884 0 0 0 0-1.767m0 5.885h-.883v.883a.884.884 0 1 0 .883-.883m-2.06-2.943h-1.765v1.765h1.765zM8.175 9.057c0 .487.396.883.884.883h.883v-.883a.884.884 0 0 0-1.767 0"/><path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm2 0h14v14H5z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  