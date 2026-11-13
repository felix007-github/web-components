import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: 'wt-icon-left_panel_open'
  })
  export class VtIconLeftPanelOpen {
    render() {
      return <Host class="wt-svg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12.5 8v8l4-4zM5 21q-.824 0-1.412-.587A1.93 1.93 0 0 1 3 19V5q0-.824.587-1.412A1.93 1.93 0 0 1 5 3h14q.824 0 1.413.587Q21 4.176 21 5v14q0 .824-.587 1.413A1.93 1.93 0 0 1 19 21zm3-2V5H5v14zm2 0h9V5h-9z"/></svg></Host>;
    }
  }
  