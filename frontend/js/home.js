/* Home Feed Dashboard Handler */
let currentFeedMode = 'FOR YOU';

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = PulseAPI.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  setupSidebarUserInfo(currentUser);
  setupFeedTabs();
  setupPostCreationForm();
  loadFeed(currentFeedMode);
  loadTrendingWidget();
  loadSuggestionsWidget();

  window.reloadCurrentFeed = () => loadFeed(currentFeedMode);
});

function setupSidebarUserInfo(user) {
  const sidebarAvatar = document.getElementById('sidebar-user-avatar');
  const sidebarName = document.getElementById('sidebar-user-name');
  const sidebarUsername = document.getElementById('sidebar-user-username');
  const sidebarScore = document.getElementById('sidebar-user-score');

  if (sidebarAvatar) sidebarAvatar.src = user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
  if (sidebarName) sidebarName.textContent = user.fullName;
  if (sidebarUsername) sidebarUsername.textContent = `@${user.username}`;
  if (sidebarScore) sidebarScore.textContent = `⚡ ${user.pulseScore || 150} Pulse`;
}

function setupFeedTabs() {
  const tabBtns = document.querySelectorAll('.feed-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFeedMode = btn.dataset.mode || 'FOR YOU';
      loadFeed(currentFeedMode);
    });
  });
}

async function loadFeed(mode) {
  const feedContainer = document.getElementById('feed-container');
  if (!feedContainer) return;

  feedContainer.innerHTML = `
    <div class="skeleton" style="height: 180px; margin-bottom: 16px;"></div>
    <div class="skeleton" style="height: 180px; margin-bottom: 16px;"></div>
  `;

  try {
    const data = await PulseAPI.get(`/posts?mode=${encodeURIComponent(mode)}`);
    const posts = data.posts || [];
    const currentUser = PulseAPI.getCurrentUser();

    if (posts.length === 0) {
      feedContainer.innerHTML = `
        <div class="glass-panel" style="padding: 40px; text-align: center; color: var(--text-secondary);">
          <span style="font-size: 2.5rem; display: block; margin-bottom: 10px;">🌟</span>
          <h3>No posts found in ${mode} feed</h3>
          <p style="font-size: 0.9rem; margin-top: 6px;">Be the first to share an insightful idea with your community!</p>
        </div>
      `;
      return;
    }

    feedContainer.innerHTML = posts.map(p => createPostCardHTML(p, currentUser)).join('');
  } catch (err) {
    feedContainer.innerHTML = `
      <div class="glass-panel" style="padding: 30px; text-align: center; color: var(--danger);">
        <p>Unable to load your feed. Please try again.</p>
      </div>
    `;
  }
}

function setupPostCreationForm() {
  const createForm = document.getElementById('create-post-form');
  const typePills = document.querySelectorAll('.type-pill');
  const pollSection = document.getElementById('poll-builder-section');
  let selectedType = 'text';

  typePills.forEach(pill => {
    pill.addEventListener('click', () => {
      typePills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      selectedType = pill.dataset.type;

      if (pollSection) {
        pollSection.style.display = selectedType === 'poll' ? 'flex' : 'none';
      }
    });
  });

  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = document.getElementById('post-content-input').value.trim();
      const image = document.getElementById('post-image-input')?.value.trim() || '';
      const mood = document.getElementById('post-mood-select')?.value || '';
      const topic = document.getElementById('post-topic-select')?.value || 'General';

      if (!content) {
        showToast('Please enter post content', 'warning');
        return;
      }

      // Poll object parsing if poll selected
      let pollData = null;
      if (selectedType === 'poll') {
        const q = document.getElementById('poll-question-input')?.value.trim();
        const opt1 = document.getElementById('poll-opt-1')?.value.trim();
        const opt2 = document.getElementById('poll-opt-2')?.value.trim();
        const opt3 = document.getElementById('poll-opt-3')?.value.trim();
        
        if (!q || !opt1 || !opt2) {
          showToast('Please enter a poll question and at least 2 options', 'warning');
          return;
        }

        const options = [opt1, opt2];
        if (opt3) options.push(opt3);

        pollData = { question: q, options };
      }

      const submitBtn = createForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publishing...';

      try {
        await PulseAPI.post('/posts', {
          content,
          image,
          postType: selectedType,
          mood,
          topic,
          poll: pollData
        });

        showToast('Idea published successfully! 🚀', 'success');
        createForm.reset();
        if (pollSection) pollSection.style.display = 'none';

        loadFeed(currentFeedMode);
      } catch (err) {
        if (err.message.includes('respectful')) {
          showToast(' Please keep the conversation respectful.', 'error');
        } else {
          showToast(err.message, 'error');
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish Idea';
      }
    });
  }
}

async function loadTrendingWidget() {
  const container = document.getElementById('trending-topics-widget');
  if (!container) return;

  try {
    const trends = await PulseAPI.get('/search/trending');
    container.innerHTML = trends.slice(0, 5).map(t => `
      <div class="trend-item" onclick="navigateToHashtag('${t.name.replace('#', '')}')" style="cursor:pointer;">
        <div>
          <div class="trend-name">${t.name}</div>
          <div class="trend-meta">${t.postsCount || t.count || 120} posts</div>
        </div>
        <div class="growth-badge">${t.growth || '+35%'}</div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted);">Failed to load trends</p>`;
  }
}

async function loadSuggestionsWidget() {
  const container = document.getElementById('suggested-people-widget');
  if (!container) return;

  try {
    const suggestions = await PulseAPI.get('/users/suggestions');
    if (suggestions.length === 0) {
      container.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted);">No suggestions right now</p>`;
      return;
    }

    container.innerHTML = suggestions.slice(0, 3).map(u => `
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 0; border-bottom:1px solid var(--border-color);">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${u.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}" class="avatar avatar-sm" onclick="navigateToProfile('${u.username}')" style="cursor:pointer;" />
          <div>
            <h5 style="font-size:0.88rem; font-weight:700;"><a href="profile.html?username=${u.username}">${u.fullName}</a></h5>
            <span style="font-size:0.75rem; color:var(--primary); font-weight:700;">${u.matchPercentage}% Interest Match</span>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="followUserFromWidget('${u._id}', this)">Follow</button>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted);">Failed to load suggestions</p>`;
  }
}

async function followUserFromWidget(userId, btn) {
  try {
    const res = await PulseAPI.post(`/users/${userId}/follow`, {});
    showToast(res.message, 'success');
    btn.textContent = 'Following';
    btn.disabled = true;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openDiscussionModal(postId) {
  window.location.href = `home.html?post=${postId}#discussion`;
}
