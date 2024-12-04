document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const emailInput = document.getElementById("register-email");
    const passwordInput = document.getElementById("register-password");
    const nameInput = document.getElementById("register-name");
  
    document.getElementById("register-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;
      const name = document.getElementById("register-name").value;
    
      try {
        const response = await fetch(`${backendUrl}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
    
        if (response.ok) {
          alert("Registration successful! Please log in.");
          document.getElementById("register-form").reset();
        } else {
          const data = await response.json();
          alert(data.error || "Registration failed.");
        }
      } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred during registration.");
      }
    });
  });