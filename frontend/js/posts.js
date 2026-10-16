/* Post Card Generator & Interactions */
function createPostCardHTML(post, currentUser = null) {
  const author = post.author || {};
  const isAuthor = currentUser && author._id === currentUser._id;
  const mood = post.mood ? `<span class="mood-tag-badge">✨ ${post.mood}</span>` : '';
  const isDiscussion = post.isDiscussion ? `<span class="discussion-badge" onclick="openDiscussionModal('${post._id}')">🔥 Active Discussion</span>` : '';
  const communityBadge = post.community ? `<span style="font-size:0.8rem; color:var(--text-secondary); margin-left:8px;">in <a href="community.html?id=${post.community.slug || post.community._id}" style="color:var(--primary); font-weight:600;">${post.community.icon || '🚀'} ${post.community.name}</a></span>` : '';

  // Format hashtags
  const hashtagsHTML = (post.hashtags || []).map(tag => {
    const clean = tag.startsWith('#') ? tag : `#${tag}`;
    return `<span class="hashtag" onclick="navigateToHashtag('${clean.replace('#', '')}')">${clean}</span>`;
  }).join(' ');

  // Format poll if postType === 'poll'
  let pollHTML = '';
  if (post.postType === 'poll' && post.poll && post.poll.options) {
    let totalVotes = 0;
    post.poll.options.forEach(opt => totalVotes += (opt.votes ? opt.votes.length : 0));
    const currentUserId = currentUser ? currentUser._id : null;
    let userVoted = false;

    post.poll.options.forEach(opt => {
      if (opt.votes && opt.votes.some(v => v === currentUserId || v._id === currentUserId)) {
        userVoted = true;
      }
    });

    const optionsList = post.poll.options.map((opt, idx) => {
      const voteCount = opt.votes ? opt.votes.length : 0;
      const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
      return `
        <button class="poll-option-btn ${userVoted ? 'voted' : ''}" data-post-id="${post._id}" data-option-index="${idx}" ${userVoted ? 'disabled' : ''}>
          ${userVoted ? `<div class="poll-progress-fill" style="width: ${percent}%;"></div>` : ''}
          <span class="poll-text">${opt.optionText}</span>
          ${userVoted ? `<span class="poll-percent">${percent}%</span>` : ''}
        </button>
      `;
    }).join('');

    pollHTML = `
      <div class="poll-container">
        <h4 style="font-size:0.92rem; font-weight:700;">${post.poll.question || 'Poll'}</h4>
        ${optionsList}
        <p style="font-size:0.78rem; color:var(--text-secondary); text-align:right;">Total votes: ${totalVotes}</p>
      </div>
    `;
  }

  // Reactions summary count
  const reactions = post.reactions || {};
  const totalReactionsCount = (reactions.insightful || 0) + (reactions.interesting || 0) + (reactions.support || 0) + (reactions.curious || 0) + (reactions.like || 0) + (post.likesCount || 0);
  
  const userReaction = post.userReaction;

  return `
    <article class="post-card glass-panel" id="post-${post._id}">
      <div class="post-header">
        <div class="author-info">
          <img src="${author.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}" alt="${author.fullName}" class="avatar" onclick="navigateToProfile('${author.username || author._id}')" style="cursor:pointer;" />
          <div class="author-meta">
            <h4>
              <a href="profile.html?username=${author.username || author._id}">${author.fullName || 'Anonymous'}</a>
              <span class="pulse-score-badge">⚡ ${author.pulseScore || 150}</span>
              ${communityBadge}
            </h4>
            <p>@${author.username || 'user'} • ${new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          ${mood}
          ${isDiscussion}
          ${isAuthor ? `<button class="btn-icon" onclick="deletePost('${post._id}')" title="Delete post">🗑️</button>` : ''}
        </div>
      </div>

      <div class="post-body">
        ${post.content}
        ${post.image ? `<img src="${post.image}" class="post-image" alt="Post visual" />` : ''}
        ${pollHTML}
      </div>

      ${hashtagsHTML ? `<div class="post-hashtags">${hashtagsHTML}</div>` : ''}

      <div class="reactions-count-summary">
        ${reactions.insightful ? `<span class="reaction-chip">💡 ${reactions.insightful}</span>` : ''}
        ${reactions.interesting ? `<span class="reaction-chip">🔥 ${reactions.interesting}</span>` : ''}
        ${reactions.support ? `<span class="reaction-chip">👏 ${reactions.support}</span>` : ''}
        ${reactions.curious ? `<span class="reaction-chip">🤔 ${reactions.curious}</span>` : ''}
        ${reactions.like || post.likesCount ? `<span class="reaction-chip">❤️ ${reactions.like || post.likesCount}</span>` : ''}
        <span style="margin-left:auto;">💬 ${post.commentsCount || 0} comments • 👁️ ${post.viewsCount || 12} views</span>
      </div>

      <div class="reaction-bar">
        <div style="position:relative;">
          <button class="action-btn react-btn ${userReaction ? 'active' : ''}" data-post-id="${post._id}">
            <span>${userReaction === 'insightful' ? '💡 Insightful' : userReaction === 'interesting' ? '🔥 Interesting' : userReaction === 'support' ? '👏 Support' : userReaction === 'curious' ? '🤔 Curious' : userReaction === 'like' ? '❤️ Liked' : '💡 Insight'}</span>
          </button>

          <div class="reaction-popover" id="popover-${post._id}">
            <button class="reaction-emoji-btn" onclick="sendReaction('${post._id}', 'insightful')" title="Insightful">💡</button>
            <button class="reaction-emoji-btn" onclick="sendReaction('${post._id}', 'interesting')" title="Interesting">🔥</button>
            <button class="reaction-emoji-btn" onclick="sendReaction('${post._id}', 'support')" title="Support">👏</button>
            <button class="reaction-emoji-btn" onclick="sendReaction('${post._id}', 'curious')" title="Curious">🤔</button>
            <button class="reaction-emoji-btn" onclick="sendReaction('${post._id}', 'like')" title="Like">❤️</button>
          </div>
        </div>

        <button class="action-btn toggle-comments-btn" onclick="toggleComments('${post._id}')">
          💬 Comment
        </button>

        <button class="action-btn" onclick="sharePost('${post._id}')">
          🔁 Share
        </button>

        <button class="action-btn bookmark-btn ${post.isBookmarked ? 'active' : ''}" onclick="toggleBookmark('${post._id}', this)">
          🔖 ${post.isBookmarked ? 'Saved' : 'Save'}
        </button>
      </div>

      <!-- Comments Section Container -->
      <div class="comments-section" id="comments-${post._id}" style="display:none;">
        <div class="add-comment-box" style="display:flex; gap:10px; margin-bottom:12px;">
          <input type="text" class="input-field comment-input" id="input-comment-${post._id}" placeholder="Write a respectful, insightful comment..." />
          <button class="btn btn-primary btn-sm" onclick="submitComment('${post._id}')">Reply</button>
        </div>
        <div class="comments-list" id="comments-list-${post._id}">
          <div class="skeleton" style="height:40px;"></div>
        </div>
      </div>
    </article>
  `;
}

// Global Interaction Handler Helpers
async function sendReaction(postId, type) {
  try {
    const res = await PulseAPI.post(`/posts/${postId}/reaction`, { type });
    showToast(`Reaction updated: ${type}`, 'success');
    
    // Refresh post
    if (window.reloadCurrentFeed) window.reloadCurrentFeed();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function toggleBookmark(postId, btn) {
  try {
    const res = await PulseAPI.post(`/posts/${postId}/bookmark`, {});
    showToast(res.message, 'success');
    btn.innerHTML = `🔖 ${res.isBookmarked ? 'Saved' : 'Save'}`;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function toggleComments(postId) {
  const section = document.getElementById(`comments-${postId}`);
  if (!section) return;

  if (section.style.display === 'none') {
    section.style.display = 'flex';
    await loadComments(postId);
  } else {
    section.style.display = 'none';
  }
}

async function loadComments(postId) {
  const list = document.getElementById(`comments-list-${postId}`);
  if (!list) return;

  try {
    const data = await PulseAPI.get(`/posts/${postId}/comments`);
    if (data.comments.length === 0) {
      list.innerHTML = `<p style="font-size:0.85rem; color:var(--text-secondary); text-align:center; padding:10px 0;">Be the first to leave an insightful comment!</p>`;
      return;
    }

    list.innerHTML = data.comments.map(c => renderCommentHTML(c, postId)).join('');
  } catch (err) {
    list.innerHTML = `<p style="font-size:0.85rem; color:var(--danger);">Error loading comments</p>`;
  }
}

function renderCommentHTML(c, postId) {
  const author = c.author || {};
  const replies = (c.replies || []).map(r => renderCommentHTML(r, postId)).join('');

  return `
    <div class="comment-item" id="comment-${c._id}">
      <img src="${author.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}" class="avatar avatar-sm" />
      <div class="comment-bubble">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="font-size:0.85rem;">${author.fullName || 'User'} <span style="color:var(--text-muted); font-weight:400;">@${author.username || ''}</span></strong>
          <span style="font-size:0.75rem; color:var(--text-muted);">${new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p style="font-size:0.88rem; color:var(--text-primary);">${c.content}</p>
        ${replies ? `<div class="comment-replies-container" style="margin-top:8px;">${replies}</div>` : ''}
      </div>
    </div>
  `;
}

async function submitComment(postId) {
  const input = document.getElementById(`input-comment-${postId}`);
  if (!input) return;

  const content = input.value.trim();
  if (!content) return;

  try {
    const comment = await PulseAPI.post(`/posts/${postId}/comments`, { content });
    showToast('Comment published!', 'success');
    input.value = '';
    await loadComments(postId);
  } catch (err) {
    if (err.message.includes('respectful')) {
      showToast(' Please keep the conversation respectful.', 'error');
    } else {
      showToast(err.message, 'error');
    }
  }
}

async function deletePost(postId) {
  if (!confirm('Are you sure you want to delete this post?')) return;
  try {
    await PulseAPI.delete(`/posts/${postId}`);
    showToast('Post deleted', 'info');
    document.getElementById(`post-${postId}`)?.remove();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function sharePost(postId) {
  const url = `${window.location.origin}/home.html?post=${postId}`;
  navigator.clipboard.writeText(url);
  showToast('Link copied to clipboard!', 'success');
}

function navigateToHashtag(tag) {
  window.location.href = `search.html?hashtag=${encodeURIComponent(tag)}`;
}

function navigateToProfile(user) {
  window.location.href = `profile.html?username=${encodeURIComponent(user)}`;
}

// Bind popover hovers & poll clicks
document.addEventListener('click', (e) => {
  // Reaction popovers toggle
  const reactBtn = e.target.closest('.react-btn');
  if (reactBtn) {
    const postId = reactBtn.dataset.postId;
    const popover = document.getElementById(`popover-${postId}`);
    if (popover) {
      popover.classList.toggle('active');
    }
  } else if (!e.target.closest('.reaction-popover')) {
    document.querySelectorAll('.reaction-popover.active').forEach(p => p.classList.remove('active'));
  }

  // Poll voting click
  const pollBtn = e.target.closest('.poll-option-btn');
  if (pollBtn && !pollBtn.disabled) {
    const postId = pollBtn.dataset.postId;
    const idx = parseInt(pollBtn.dataset.optionIndex);
    PulseAPI.post(`/posts/${postId}/poll/vote`, { optionIndex: idx })
      .then(() => {
        showToast('Vote recorded!', 'success');
        if (window.reloadCurrentFeed) window.reloadCurrentFeed();
      })
      .catch(err => showToast(err.message, 'error'));
  }
});
