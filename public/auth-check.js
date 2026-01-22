(async function () {
  try {
    const res = await fetch("/api/me");
    const data = await res.json();

    if (!data.loggedIn) {
      window.location.href = "/login.html";
      return;
    }

    // ✅ Force password change before accessing portal
    const currentPage = window.location.pathname;

    if (data.user && data.user.mustChangePassword === true) {
      if (!currentPage.includes("change-password.html")) {
        window.location.href = "/change-password.html";
      }
    }
  } catch (err) {
    window.location.href = "/login.html";
  }
})();

