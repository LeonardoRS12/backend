const backendUrl = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  console.log("Login form submitted!");
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  console.log("Email:", email, "Password:", password);

  try {
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    console.log("Response received:", response.status); // Debug log

    if (response.ok) {
      const data = await response.json();
      console.log("Token received:", data.token); // Debug log
      localStorage.setItem("authToken", data.token);
      alert("Login successful!");
      window.location.href = "table.html";
    } else {
      const data = await response.json();
      alert(data.error || "Login failed.");
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("An error occurred during login.");
  }
  });
});