const backendUrl = "http://localhost:3000";

const token = localStorage.getItem("authToken");
if (!token) {
  alert("Please log in first.");
  window.location.href = "index.html";
}else {
  console.log("Token found:", token);
   }

async function fetchUsers() {
  try {
    const response = await fetch(`${backendUrl}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const users = await response.json();
      populateTable(users);
    } else {
      alert("Session expired or unauthorized. Please log in again.");
      localStorage.removeItem("authToken");
      window.location.href = "index.html";
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    alert("Failed to fetch user data.");
  }
}

function populateTable(users) {
  const tableBody = document.getElementById("user-table-body");
  tableBody.innerHTML = "";

  users.forEach((user) => {
    const row = `
      <tr>
        <td><input type="checkbox" class="user-checkbox" value="${user.id}"></td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${new Date(user.last_login).toLocaleString()}</td>
        <td>${user.status}</td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
}

async function handleAction(action) {
  const selectedUsers = Array.from(
    document.querySelectorAll(".user-checkbox:checked")
  ).map((checkbox) => checkbox.value);

  if (selectedUsers.length === 0) {
    alert("No users selected.");
    return;
  }

  try {
    const response = await fetch(`${backendUrl}/api/users/actions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, userIds: selectedUsers }),
    });

    if (response.ok) {
      alert(`${action.charAt(0).toUpperCase() + action.slice(1)} action successful!`);
      fetchUsers();
    } else {
      const data = await response.json();
      alert(data.error || "Action failed.");
    }
  } catch (error) {
    console.error(`Error during ${action} action:`, error);
    alert(`An error occurred during ${action} action.`);
  }
}

document.getElementById("select-all").addEventListener("change", (event) => {
  const checkboxes = document.querySelectorAll(".user-checkbox");
  checkboxes.forEach((checkbox) => (checkbox.checked = event.target.checked));
});

document.getElementById("block-btn").addEventListener("click", () => handleAction("block"));
document.getElementById("unblock-btn").addEventListener("click", () => handleAction("unblock"));
document.getElementById("delete-btn").addEventListener("click", () => handleAction("delete"));

fetchUsers();