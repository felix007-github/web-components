import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-question_filled'
  })
  export class VtIconQuestionFilled {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" fill-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10m0-16a4 4 0 0 0-4 4h2a2 2 0 1 1 4 0c0 .88-.58 1.324-1.23 1.822C11.942 12.457 11 13.179 11 15h2c0-1.095.711-1.717 1.44-2.354C15.21 11.973 16 11.283 16 10a4 4 0 0 0-4-4m1 12v-2h-2v2z" clip-rule="evenodd"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  