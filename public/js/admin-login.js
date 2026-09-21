const loginBtn  = document.getElementById("loginBtn");
const loginText = document.getElementById("loginBtnText");
const errorMsg  = document.getElementById("errorMsg");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
}

async function doLogin() {
  const username = usernameEl.value.trim();
  const password = passwordEl.value;
  errorMsg.style.display = "none";

  if (!username || !password) {
    showError("Please enter both username and password.");
    return;
  }

  loginBtn.disabled = true;
  loginText.innerHTML = '<span class="spinner"></span> Authenticating...';

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success) {
      loginText.textContent = "✓ Success! Redirecting...";
      setTimeout(() => { window.location.href = data.redirect; }, 600);
    } else {
      showError(data.message || "Invalid credentials.");
      loginBtn.disabled = false;
      loginText.textContent = "Login";
      passwordEl.value = "";
      passwordEl.focus();
    }
  } catch (e) {
    showError("Server error. Make sure the server is running.");
    loginBtn.disabled = false;
    loginText.textContent = "Login";
  }
}

loginBtn.addEventListener("click", doLogin);
[usernameEl, passwordEl].forEach(el => el.addEventListener("keydown", (e) => { if (e.key === "Enter") doLogin(); }));

// Redirect if already logged in
fetch("/api/admin/check").then(r => r.json()).then(d => {
  if (d.authenticated) window.location.href = "/admin/dashboard.html";
}).catch(() => {});
