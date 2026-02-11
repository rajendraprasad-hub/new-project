/**
 * Toast Notification System
 * Provides success, error, warning, and info notifications
 */

class NotificationManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('notificationContainer')) {
      this.container = document.createElement('div');
      this.container.id = 'notificationContainer';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
        pointer-events: none;
      `;
      // Accessibility: announce to screen readers
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('role', 'status');
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('notificationContainer');
    }
  }

  show(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `toast toast-${type}`;
    notification.setAttribute('role', 'status');
    
    const iconMap = {
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'info': 'ℹ️'
    };

    notification.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${iconMap[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
    `;

    this.container.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    if (duration > 0) {
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, duration);
    }

    return notification;
  }

  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 4000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 3500) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }

  loading(message) {
    return this.show(message, 'info', 0); // No auto-close
  }
}

// Global instance
const notify = new NotificationManager();
