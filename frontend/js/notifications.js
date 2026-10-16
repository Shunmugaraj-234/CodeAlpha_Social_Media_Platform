/* Activity Center & Notifications Handler */
document.addEventListener('DOMContentLoaded', () => {
  loadNotifications();
});

async function loadNotifications() {
  const container = document.getElementById('notifications-container');
  const unreadBadge = document.getElementById('unread-count-badge');

  try {
    const data = await PulseAPI.get('/notifications');
    const list = data.notifications || [];
    const unread = data.unreadCount || 0;

    if (unreadBadge) {
      unreadBadge.textContent = unread;
      unreadBadge.style.display = unread > 0 ? 'inline-block' : 'none';
    }

    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="glass-panel" style="padding:40px; text-align:center; color:var(--text-secondary);">
          <span style="font-size:2.5rem; display:block; margin-bottom:10px;">🔔</span>
          <h3>No activity yet</h3>
          <p style="font-size:0.9rem; margin-top:4px;">Notifications will appear here when people interact with your posts or follow you.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="font-size:1.4rem; font-weight:800;">Activity Center 🔔</h2>
        ${unread > 0 ? `<button class="btn btn-secondary btn-sm" onclick="markAllNotificationsRead()">Mark all read</button>` : ''}
      </div>

      <div style="display:flex; flex-direction:column; gap:12px;">
        ${list.map(n => {
          const sender = n.sender || {};
          const isUnread = !n.read;
          return `
            <div class="glass-panel" style="padding:16px; display:flex; align-items:center; gap:14px; ${isUnread ? 'border-left:4px solid var(--primary); background:rgba(99, 102, 241, 0.04);' : ''}">
              <img src="${sender.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}" class="avatar" />
              <div style="flex:1;">
                <p style="font-size:0.92rem; color:var(--text-primary); font-weight:600;">${n.message}</p>
                <span style="font-size:0.78rem; color:var(--text-secondary);">${new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
              ${n.post ? `<a href="home.html?post=${n.post._id || n.post}" class="btn btn-secondary btn-sm">View</a>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (err) {
    if (container) container.innerHTML = `<p style="color:var(--danger);">Error loading notifications</p>`;
  }
}

async function markAllNotificationsRead() {
  try {
    await PulseAPI.put('/notifications/all/read', {});
    showToast('Notifications marked as read', 'success');
    loadNotifications();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
