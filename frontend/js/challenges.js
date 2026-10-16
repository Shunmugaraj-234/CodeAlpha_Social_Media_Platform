/* Community Challenges Handler */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const challengeId = params.get('id');

  if (challengeId) {
    loadChallengeDetails(challengeId);
  } else {
    loadChallengesList();
  }
});

async function loadChallengesList() {
  const container = document.getElementById('challenges-container');
  if (!container) return;

  try {
    const challenges = await PulseAPI.get('/challenges');

    container.innerHTML = `
      <div class="challenges-list">
        ${challenges.map(ch => `
          <div class="challenge-card glass-panel">
            <img src="${ch.banner}" class="challenge-banner" />
            <div class="challenge-info">
              <span class="challenge-tag">${ch.hashtag}</span>
              <h3 style="font-size:1.2rem; font-weight:800;"><a href="challenge.html?id=${ch._id}">${ch.title}</a></h3>
              <p style="font-size:0.88rem; color:var(--text-secondary);">${ch.description}</p>
              <div style="display:flex; align-items:center; gap:16px; margin-top:6px;">
                <span style="font-size:0.8rem; color:var(--text-muted);">👥 ${ch.participantsCount || 0} Participants</span>
                <span style="font-size:0.8rem; color:var(--primary); font-weight:700;">Reward: ${ch.badgeReward || '🏆 Champion'}</span>
              </div>
            </div>
            <button class="btn ${ch.isParticipating ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleParticipate('${ch._id}', this)">
              ${ch.isParticipating ? 'Joined' : 'Participate'}
            </button>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Error loading challenges</p>`;
  }
}

async function loadChallengeDetails(id) {
  const container = document.getElementById('challenges-container');
  if (!container) return;

  try {
    const ch = await PulseAPI.get(`/challenges/${id}`);
    const currentUser = PulseAPI.getCurrentUser();
    const posts = ch.posts || [];

    container.innerHTML = `
      <div class="glass-panel" style="padding:0; overflow:hidden; margin-bottom:28px;">
        <img src="${ch.banner}" style="width:100%; height:220px; object-fit:cover;" />
        <div style="padding:24px; display:flex; justify-content:space-between; align-items:flex-end;">
          <div>
            <span class="challenge-tag" style="font-size:1rem;">${ch.hashtag}</span>
            <h1 style="font-size:1.8rem; font-weight:800; margin-top:4px;">${ch.title}</h1>
            <p style="color:var(--text-secondary); font-size:0.95rem; margin-top:6px;">${ch.description}</p>
          </div>
          <button class="btn ${ch.isParticipating ? 'btn-secondary' : 'btn-primary'}" onclick="toggleParticipate('${ch._id}', this)">
            ${ch.isParticipating ? 'Joined' : 'Join Challenge'}
          </button>
        </div>
      </div>

      <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:16px;">Challenge Submissions (${posts.length})</h3>
      <div style="display:flex; flex-direction:column; gap:20px;">
        ${posts.length > 0 ? posts.map(p => createPostCardHTML(p, currentUser)).join('') : `<p style="color:var(--text-muted);">No submissions yet. Submit a post with ${ch.hashtag}!</p>`}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Error loading challenge details</p>`;
  }
}

async function toggleParticipate(id, btn) {
  try {
    const res = await PulseAPI.post(`/challenges/${id}/participate`, {});
    showToast(res.message, 'success');
    btn.textContent = res.isParticipating ? 'Joined' : 'Participate';
    btn.className = `btn ${res.isParticipating ? 'btn-secondary' : 'btn-primary'} btn-sm`;
  } catch (err) {
    showToast(err.message, 'error');
  }
}
