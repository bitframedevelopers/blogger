async function fetchBlogName() {
    try {
      const res = await fetch("/v1/name", {
        method: "GET"
      });
      const data = await res.json();
      const loginTitle = document.getElementById("loginTitle");
      loginTitle.textContent = `Signup to ${data.name}`;
    } catch (err) {
      console.error("Error fetching blog name:", err);
    }
  }
  fetchBlogName();

  const form = document.getElementById("loginForm");
  const messageDiv = document.getElementById("loginMessage");
  const loginBtn = document.getElementById("loginBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDiv.textContent = "";
    loginBtn.disabled = true;
    loginBtn.textContent = "Creating account...";

    const username = form.username.value.trim();
    const password = form.password.value;
    const email = form.email.value;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ usernames, password })
      });

      const data = await res.json();

      if (data.success) {
        messageDiv.textContent = data.message || "Signed up successfully!";
        messageDiv.className = "message success";
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      } else {
        messageDiv.textContent = data.message || "Signup failed.";
        messageDiv.className = "message error";
      }

    } catch (err) {
      messageDiv.textContent = "Please try again later.";
      messageDiv.className = "message error";
    }

    loginBtn.disabled = false;
    loginBtn.textContent = "Signup";
  });