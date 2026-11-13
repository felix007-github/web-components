import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-show_hide_track_change'
  })
  export class VtIconShowHideTrackChange {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g clip-path="url(#a)"><path fill="currentColor" d="M8.2 11.1H6l1.9-4.9H10l1.9 4.9H9.7L8.9 9zm14 .9L21 13.2l-2.9-2.7c-.6.4-1.4.6-2.2.6-2.3 0-4.1-1.8-4.1-4.1s1.9-4 4.1-4S20 4.8 20 7.1c0 .8-.2 1.5-.6 2.2zm-4-4.9c0-1.2-1-2.3-2.3-2.3s-2.3 1-2.3 2.3 1 2.3 2.3 2.3 2.3-1.1 2.3-2.3M0 12.3h17.8v2h-4.7l2.6 6.7h-2.4l-1.2-3.2H5.6L4.4 21H2.1l2.6-6.7H0zm10.9 2H7l-.5 1.4h5z"/></g><defs><clipPath id="a"><path fill="currentColor" d="M0 0h24v24H0z"/></clipPath></defs></svg></Host>;
    }
  }
  