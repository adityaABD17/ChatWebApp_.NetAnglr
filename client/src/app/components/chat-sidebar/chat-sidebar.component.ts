import { Component,AfterViewInit } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-chat-sidebar',
  imports: [MatIconButton,MatIconModule,MatMenuModule],
  templateUrl: './chat-sidebar.component.html',
  styles: ``
})
export class ChatSidebarComponent implements AfterViewInit {
  ngAfterViewInit() {
      this.initResizer();
  }


  initResizer() {
    const sidebar = document.getElementById('sidebar');
    const resizer = document.getElementById('resizer');
    let isResizing = false;

    resizer?.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', () => {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
      });
    });

    function handleMouseMove(e: MouseEvent) {
      if (isResizing && sidebar) {
        let newWidth = e.clientX;
        newWidth = Math.max(200, newWidth); // Min width 200px
        newWidth = Math.min(window.innerWidth * 0.5, newWidth); // Max width 50% of screen
        sidebar.style.width = `${newWidth}px`;
      }
    }
  }
}
