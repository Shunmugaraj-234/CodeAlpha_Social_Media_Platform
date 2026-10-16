/* Profile Page & Interest Map Handler */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const currentUser = PulseAPI.getCurrentUser();
  const targetUsername = params.get('username') || (currentUser ? currentUser.username : null);

  if (!targetUsername) {
    window.location.href = 'login.html';
    return;
  }

  loadUserProfile(targetUsername);
  setupEditProfileModal();
});

async function loadUserProfile(target) {
  try {
    const user = await PulseAPI.get(`/users/${target}`);
    const currentUser = PulseAPI.getCurrentUser();
    const isSelf = currentUser && (currentUser._id === user._id || currentUser.username === user.username);

    // Update Header UI
    document.getElementById('profile-cover-img').src = user.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80';
    document.getElementById('profile-avatar-img').src = user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
    document.getElementById('profile-fullname').textContent = user.fullName;
    document.getElementById('profile-username').textContent = `@${user.username}`;
    document.getElementById('profile-bio').textContent = user.bio || 'No bio provided yet.';
    document.getElementById('profile-pulse-score').textContent = `⚡ ${user.pulseScore || 150}`;
    
    document.getElementById('stat-followers').textContent = user.followersCount || 0;
    document.getElementById('stat-following').textContent = user.followingCount || 0;
    document.getElementById('stat-posts').textContent = user.postsCount || 0;
    document.getElementById('stat-joined').textContent = new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });

    // Action buttons
    const actionBtnContainer = document.getElementById('profile-action-btns');
    if (actionBtnContainer) {
      if (isSelf) {
        actionBtnContainer.innerHTML = `<button class="btn btn-secondary btn-sm" onclick="openEditProfileModal()">Edit Profile ✏️</button>`;
      } else {
        const isFollowing = user.isFollowing;
        actionBtnContainer.innerHTML = `
          <button class="btn ${isFollowing ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleFollowUser('${user._id}', this)">
            ${isFollowing ? 'Following' : 'Follow +'}
          </button>
          <button class="btn btn-secondary btn-sm" onclick="showToast('Message sent to ${user.fullName}!', 'info')">Message 💬</button>
        `;
      }
    }

    // Profile Strength Checklist (Requirement 26)
    const strengthContainer = document.getElementById('profile-strength-container');
    if (strengthContainer) {
      if (isSelf) {
        const strength = user.profileStrength || 80;
        let missing = [];
        if (!user.coverImage) missing.push('❌ Cover image');
        if (!user.bio || user.bio.length < 15) missing.push('❌ Complete Bio');
        if (!user.interests || user.interests.length < 3) missing.push('❌ 3+ Interests');

        strengthContainer.innerHTML = `
          <div class="profile-strength-box">
            <div>
              <strong style="font-size:0.9rem;">Profile Strength: ${strength}%</strong>
              <p style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
                ${missing.length > 0 ? `Missing: ${missing.join(' ')}` : '🎉 All profile details complete!'}
              </p>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="strength-bar-bg">
                <div class="strength-bar-fill" style="width: ${strength}%;"></div>
              </div>
              ${missing.length > 0 ? `<button class="btn btn-secondary btn-sm" onclick="openEditProfileModal()">Complete Profile</button>` : ''}
            </div>
          </div>
        `;
      } else {
        strengthContainer.style.display = 'none';
      }
    }

    // Load Interest Map Visualizer (Requirement 4)
    renderInterestMap(user._id, user.interests);

    // Load Pulse Score Breakdown (Requirement 16)
    renderPulseScoreBreakdown(user.scoreBreakdown || {});

    // Load Badges (Requirement 15)
    renderBadges(user.badges || []);

    // Load User Posts
    loadUserPosts(user._id);
  } catch (err) {
    showToast('Failed to load user profile', 'error');
  }
}

async function renderInterestMap(userId, interests = []) {
  const container = document.getElementById('interest-map-viewport');
  if (!container) return;

  try {
    const mapData = await PulseAPI.get(`/users/${userId}/interest-map`);
    const nodes = mapData.nodes || [];

    if (nodes.length === 0) {
      container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No interests added yet</p>`;
      return;
    }

    // Generate dynamic positioned floating SVG nodes
    let html = `
      <svg style="position:absolute; width:100%; height:100%; top:0; left:0; pointer-events:none;">
        <line x1="20%" y1="50%" x2="50%" y2="30%" stroke="rgba(99, 102, 241, 0.3)" stroke-width="2" stroke-dasharray="4" />
        <line x1="50%" y1="30%" x2="80%" y2="50%" stroke="rgba(139, 92, 246, 0.3)" stroke-width="2" stroke-dasharray="4" />
        <line x1="50%" y1="30%" x2="50%" y2="75%" stroke="rgba(236, 72, 153, 0.3)" stroke-width="2" stroke-dasharray="4" />
      </svg>
    `;

    const positions = [
      { top: '25%', left: '45%' },
      { top: '55%', left: '18%' },
      { top: '55%', left: '72%' },
      { top: '70%', left: '45%' },
      { top: '20%', left: '20%' },
      { top: '20%', left: '75%' }
    ];

    nodes.forEach((node, i) => {
      const pos = positions[i % positions.length];
      const size = node.size || 40;
      html += `
        <div class="map-node" style="top:${pos.top}; left:${pos.left}; width:${size * 2}px; height:${size * 2}px; animation-delay:${i * 0.4}s;" onclick="navigateToHashtag('${node.label}')">
          <span style="font-size:${Math.max(0.7, size / 45)}rem;">${node.label}</span>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">Error loading interest map</p>`;
  }
}

function renderPulseScoreBreakdown(breakdown) {
  const container = document.getElementById('pulse-breakdown-container');
  if (!container) return;

  const maxVal = 400;
  const items = [
    { label: 'Posts', val: breakdown.posts || 40 },
    { label: 'Discussion', val: breakdown.discussion || 50 },
    { label: 'Community', val: breakdown.community || 30 },
    { label: 'Challenges', val: breakdown.challenges || 20 },
    { label: 'Connections', val: breakdown.connections || 10 }
  ];

  container.innerHTML = items.map(item => {
    const pct = Math.min(100, Math.round((item.val / maxVal) * 100));
    return `
      <div class="breakdown-row">
        <span class="breakdown-label">${item.label}</span>
        <div class="breakdown-bar-bg">
          <div class="breakdown-bar-fill" style="width:${pct}%;"></div>
        </div>
        <span class="breakdown-val">${item.val} pts</span>
      </div>
    `;
  }).join('');
}

function renderBadges(badges) {
  const container = document.getElementById('badges-grid');
  if (!container) return;

  if (badges.length === 0) {
    container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); grid-column: 1 / -1;">No badges unlocked yet</p>`;
    return;
  }

  container.innerHTML = badges.map(b => `
    <div class="badge-card glass-panel">
      <span class="badge-icon">${b.icon || '🏆'}</span>
      <span class="badge-title">${b.title || 'Explorer'}</span>
    </div>
  `).join('');
}

async function loadUserPosts(userId) {
  const container = document.getElementById('user-posts-container');
  if (!container) return;

  try {
    const data = await PulseAPI.get(`/posts?user=${userId}`);
    const posts = data.posts || [];
    const currentUser = PulseAPI.getCurrentUser();

    if (posts.length === 0) {
      container.innerHTML = `<div class="glass-panel" style="padding:30px; text-align:center; color:var(--text-muted);">No posts published yet.</div>`;
      return;
    }

    container.innerHTML = posts.map(p => createPostCardHTML(p, currentUser)).join('');
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger); text-align:center;">Error loading posts</p>`;
  }
}

async function toggleFollowUser(targetId, btn) {
  const isFollowing = btn.textContent.trim().toLowerCase().includes('following');
  try {
    if (isFollowing) {
      const res = await PulseAPI.delete(`/users/${targetId}/follow`);
      showToast(res.message, 'info');
      btn.textContent = 'Follow +';
      btn.className = 'btn btn-primary btn-sm';
    } else {
      const res = await PulseAPI.post(`/users/${targetId}/follow`, {});
      showToast(res.message, 'success');
      btn.textContent = 'Following';
      btn.className = 'btn btn-secondary btn-sm';
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function setupEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  const form = document.getElementById('edit-profile-form');
  if (!modal || !form) return;

  window.openEditProfileModal = () => {
    const currentUser = PulseAPI.getCurrentUser();
    if (currentUser) {
      document.getElementById('edit-fullname').value = currentUser.fullName || '';
      document.getElementById('edit-bio').value = currentUser.bio || '';
      document.getElementById('edit-interests').value = (currentUser.interests || []).join(', ');
      document.getElementById('edit-avatar').value = currentUser.profileImage || '';
      document.getElementById('edit-cover').value = currentUser.coverImage || '';
    }
    modal.classList.add('active');
  };

  window.closeEditProfileModal = () => {
    modal.classList.remove('active');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentUser = PulseAPI.getCurrentUser();
    const fullName = document.getElementById('edit-fullname').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    const interests = document.getElementById('edit-interests').value.trim();
    const profileImage = document.getElementById('edit-avatar').value.trim();
    const coverImage = document.getElementById('edit-cover').value.trim();

    try {
      const updated = await PulseAPI.put(`/users/${currentUser._id}`, {
        fullName,
        bio,
        interests,
        profileImage,
        coverImage
      });

      PulseAPI.setCurrentUser(updated);
      showToast('Profile updated successfully!', 'success');
      closeEditProfileModal();
      loadUserProfile(updated.username);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
