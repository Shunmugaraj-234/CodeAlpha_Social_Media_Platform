/* Interest Communities Handler */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const communityId = params.get('id');

  if (communityId) {
    loadCommunityDetails(communityId);
  } else {
    loadCommunitiesList();
  }

  setupCreateCommunityModal();
});

async function loadCommunitiesList() {
  const container = document.getElementById('communities-container');
  if (!container) return;

  try {
    const communities = await PulseAPI.get('/communities');
    
    container.innerHTML = `
      <div class="communities-grid">
        ${communities.map(c => `
          <div class="community-card glass-panel">
            <img src="${c.banner || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80'}" class="community-banner" />
            <div class="community-body">
              <div class="community-header-info">
                <span class="community-icon">${c.icon || '🚀'}</span>
                <div>
                  <h3 class="community-name"><a href="community.html?id=${c.slug}">${c.name}</a></h3>
                  <span style="font-size:0.75rem; color:var(--primary); font-weight:700;">${c.category}</span>
                </div>
              </div>
              <p class="community-desc">${c.description}</p>
              <div class="community-footer">
                <span style="font-size:0.82rem; color:var(--text-secondary); font-weight:600;">👥 ${c.membersCount || 1} members</span>
                <button class="btn ${c.isMember ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleJoinCommunity('${c._id}', this)">
                  ${c.isMember ? 'Joined' : 'Join +'}
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Error loading communities</p>`;
  }
}

async function loadCommunityDetails(id) {
  const container = document.getElementById('communities-container');
  if (!container) return;

  try {
    const c = await PulseAPI.get(`/communities/${id}`);
    const postsData = await PulseAPI.get(`/posts?community=${c._id}`);
    const currentUser = PulseAPI.getCurrentUser();
    const posts = postsData.posts || [];

    container.innerHTML = `
      <div class="glass-panel" style="padding:0; overflow:hidden; margin-bottom:28px;">
        <img src="${c.banner}" style="width:100%; height:200px; object-fit:cover;" />
        <div style="padding:24px; display:flex; justify-content:space-between; align-items:flex-end; margin-top:-40px;">
          <div style="display:flex; align-items:flex-end; gap:16px;">
            <div style="width:80px; height:80px; border-radius:var(--radius-lg); background:var(--bg-card); border:3px solid var(--border-color); display:flex; align-items:center; justify-content:center; font-size:2.5rem; box-shadow:var(--shadow-md);">
              ${c.icon || '🚀'}
            </div>
            <div>
              <h1 style="font-size:1.8rem; font-weight:800;">${c.name}</h1>
              <p style="color:var(--text-secondary); font-size:0.9rem;">${c.category} • 👥 ${c.membersCount} members</p>
            </div>
          </div>

          <button class="btn ${c.isMember ? 'btn-secondary' : 'btn-primary'}" onclick="toggleJoinCommunity('${c._id}', this)">
            ${c.isMember ? 'Joined' : 'Join Community'}
          </button>
        </div>
        <div style="padding:0 24px 20px 24px;">
          <p style="color:var(--text-primary); font-size:0.95rem;">${c.description}</p>
        </div>
      </div>

      <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:16px;">Community Discussions</h3>
      <div style="display:flex; flex-direction:column; gap:20px;">
        ${posts.length > 0 ? posts.map(p => createPostCardHTML(p, currentUser)).join('') : '<p style="color:var(--text-muted);">No posts in this community yet.</p>'}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Error loading community details</p>`;
  }
}

async function toggleJoinCommunity(id, btn) {
  const isJoined = btn.textContent.trim().toLowerCase().includes('joined');
  try {
    if (isJoined) {
      const res = await PulseAPI.delete(`/communities/${id}/leave`);
      showToast(res.message, 'info');
      btn.textContent = 'Join +';
      btn.className = 'btn btn-primary btn-sm';
    } else {
      const res = await PulseAPI.post(`/communities/${id}/join`, {});
      showToast(res.message, 'success');
      btn.textContent = 'Joined';
      btn.className = 'btn btn-secondary btn-sm';
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function setupCreateCommunityModal() {
  const modal = document.getElementById('create-community-modal');
  const form = document.getElementById('create-community-form');
  if (!modal || !form) return;

  window.openCreateCommunityModal = () => modal.classList.add('active');
  window.closeCreateCommunityModal = () => modal.classList.remove('active');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('comm-name').value.trim();
    const category = document.getElementById('comm-category').value;
    const description = document.getElementById('comm-desc').value.trim();
    const icon = document.getElementById('comm-icon').value.trim() || '🚀';

    try {
      const created = await PulseAPI.post('/communities', { name, category, description, icon });
      showToast(`Community "${created.name}" created!`, 'success');
      closeCreateCommunityModal();
      window.location.href = `community.html?id=${created.slug}`;
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
