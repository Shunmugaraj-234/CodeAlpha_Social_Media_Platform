/* Global Search & Discovery Handler */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  const hashtag = params.get('hashtag') || '';

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    if (query) searchInput.value = query;
    searchInput.addEventListener('input', debounce(() => {
      performGlobalSearch(searchInput.value.trim());
    }, 400));
  }

  if (hashtag) {
    loadHashtagPage(hashtag);
  } else if (query) {
    performGlobalSearch(query);
  } else {
    loadSuggestedPeoplePage();
  }
});

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    setTimeout(later, wait);
  };
}

async function performGlobalSearch(q) {
  const container = document.getElementById('search-results-container');
  if (!container) return;

  if (!q) {
    loadSuggestedPeoplePage();
    return;
  }

  container.innerHTML = `<div class="skeleton" style="height:200px;"></div>`;

  try {
    const res = await PulseAPI.get(`/search?q=${encodeURIComponent(q)}`);
    const currentUser = PulseAPI.getCurrentUser();

    const users = res.users || [];
    const posts = res.posts || [];
    const communities = res.communities || [];
    const hashtags = res.hashtags || [];

    if (users.length === 0 && posts.length === 0 && communities.length === 0 && hashtags.length === 0) {
      container.innerHTML = `
        <div class="glass-panel" style="padding:40px; text-align:center; color:var(--text-secondary);">
          <h3>No matches found for "${q}"</h3>
          <p style="font-size:0.9rem; margin-top:6px;">Try searching for topics like AI, Web Development, or usernames.</p>
        </div>
      `;
      return;
    }

    let html = '';

    // Users Section
    if (users.length > 0) {
      html += `
        <section style="margin-bottom:28px;">
          <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:14px;">People (${users.length})</h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:14px;">
            ${users.map(u => `
              <div class="glass-panel" style="padding:16px; display:flex; items-center; gap:12px;">
                <img src="${u.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}" class="avatar" />
                <div style="flex:1;">
                  <h4 style="font-size:0.95rem; font-weight:700;"><a href="profile.html?username=${u.username}">${u.fullName}</a></h4>
                  <p style="font-size:0.78rem; color:var(--text-secondary);">@${u.username} • ⚡ ${u.pulseScore || 150} Pulse</p>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }

    // Communities Section
    if (communities.length > 0) {
      html += `
        <section style="margin-bottom:28px;">
          <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:14px;">Communities (${communities.length})</h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:14px;">
            ${communities.map(c => `
              <div class="glass-panel" style="padding:16px; display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="window.location.href='community.html?id=${c.slug}'">
                <span style="font-size:2rem;">${c.icon || '🚀'}</span>
                <div>
                  <h4 style="font-size:0.95rem; font-weight:700;">${c.name}</h4>
                  <p style="font-size:0.78rem; color:var(--text-secondary);">${c.membersCount || 1} members</p>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }

    // Posts Section
    if (posts.length > 0) {
      html += `
        <section>
          <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:14px;">Posts (${posts.length})</h3>
          <div style="display:flex; flex-direction:column; gap:18px;">
            ${posts.map(p => createPostCardHTML(p, currentUser)).join('')}
          </div>
        </section>
      `;
    }

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Error searching</p>`;
  }
}

async function loadSuggestedPeoplePage() {
  const container = document.getElementById('search-results-container');
  if (!container) return;

  try {
    const suggestions = await PulseAPI.get('/users/suggestions');

    let html = `
      <section>
        <div style="margin-bottom:20px;">
          <h2 style="font-size:1.4rem; font-weight:800;">Smart People Discovery 🤝</h2>
          <p style="color:var(--text-secondary); font-size:0.9rem;">Recommended creators based on your interests and activity match.</p>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
          ${suggestions.map(u => `
            <div class="glass-panel" style="padding:22px; display:flex; flex-direction:column; gap:14px; text-align:center; position:relative;">
              <span class="pulse-score-badge" style="position:absolute; top:16px; right:16px;">${u.matchPercentage}% Interest Match</span>
              <img src="${u.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}" class="avatar avatar-lg" style="margin:0 auto;" />
              <div>
                <h3 style="font-size:1.1rem; font-weight:800;"><a href="profile.html?username=${u.username}">${u.fullName}</a></h3>
                <p style="font-size:0.82rem; color:var(--text-secondary); margin-top:2px;">@${u.username} • ⚡ ${u.pulseScore || 150} Pulse</p>
                <p style="font-size:0.85rem; color:var(--primary); font-weight:600; margin-top:6px;">💡 ${u.recommendationReason}</p>
              </div>
              <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.4;">${u.bio || 'Passionate about sharing ideas & connecting.'}</p>
              <button class="btn btn-primary btn-sm" style="margin-top:auto;" onclick="followUserFromWidget('${u._id}', this)">Follow +</button>
            </div>
          `).join('')}
        </div>
      </section>
    `;

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Error loading recommendations</p>`;
  }
}

async function loadHashtagPage(tag) {
  const container = document.getElementById('search-results-container');
  if (!container) return;

  try {
    const data = await PulseAPI.get(`/search/hashtag/${encodeURIComponent(tag)}`);
    const currentUser = PulseAPI.getCurrentUser();
    const posts = data.trendingPosts || [];

    let html = `
      <div class="glass-panel" style="padding:28px; margin-bottom:28px; background:var(--gradient-glass);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h1 style="font-size:2rem; font-weight:800;">${data.tag}</h1>
            <p style="color:var(--text-secondary); font-size:0.95rem; margin-top:4px;">Topic Overview & Community Activity</p>
          </div>
          <span class="growth-badge" style="font-size:0.95rem; padding:6px 14px; background:rgba(16, 185, 129, 0.15); border-radius:var(--radius-full);">${data.growthPercentage}</span>
        </div>

        <div style="display:flex; gap:32px; margin-top:20px; border-top:1px solid var(--border-color); padding-top:16px;">
          <div>
            <span style="font-size:1.3rem; font-weight:800;">${data.postsCount}</span>
            <span style="font-size:0.85rem; color:var(--text-secondary); display:block;">Total Posts</span>
          </div>
          <div>
            <span style="font-size:1.3rem; font-weight:800;">${data.participantsCount || 12}</span>
            <span style="font-size:0.85rem; color:var(--text-secondary); display:block;">Active Creators</span>
          </div>
        </div>
      </div>

      <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:16px;">Trending Posts in ${data.tag}</h3>
      <div style="display:flex; flex-direction:column; gap:20px;">
        ${posts.map(p => createPostCardHTML(p, currentUser)).join('')}
      </div>
    `;

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Error loading hashtag page</p>`;
  }
}
