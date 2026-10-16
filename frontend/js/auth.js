/* Authentication & Interest Selection Handler */
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const logoutBtns = document.querySelectorAll('.logout-btn');

  // Multi-step or Pill selection for Interests in Registration
  const interestPills = document.querySelectorAll('.interest-pill');
  const selectedInterests = new Set();

  interestPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const val = pill.dataset.value || pill.textContent.trim();
      if (selectedInterests.has(val)) {
        selectedInterests.delete(val);
        pill.classList.remove('selected');
      } else {
        selectedInterests.add(val);
        pill.classList.add('selected');
      }
    });
  });

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('reg-fullname').value.trim();
      const username = document.getElementById('reg-username').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm-password').value;

      if (selectedInterests.size === 0) {
        showToast('Please select at least 2 interests to personalize your feed', 'warning');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Account...';

      try {
        const data = await PulseAPI.post('/auth/register', {
          fullName,
          username,
          email,
          password,
          confirmPassword,
          interests: Array.from(selectedInterests)
        });

        PulseAPI.setToken(data.token);
        PulseAPI.setCurrentUser(data);
        showToast('Account created successfully! Welcome to Pulse.', 'success');

        setTimeout(() => {
          window.location.href = 'home.html';
        }, 1000);
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Join Pulse';
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailOrUsername = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';

      try {
        const data = await PulseAPI.post('/auth/login', {
          emailOrUsername,
          password
        });

        PulseAPI.setToken(data.token);
        PulseAPI.setCurrentUser(data);
        showToast('Welcome back!', 'success');

        setTimeout(() => {
          window.location.href = 'home.html';
        }, 800);
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  }

  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      PulseAPI.removeToken();
      showToast('Logged out successfully', 'info');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 500);
    });
  });
});
