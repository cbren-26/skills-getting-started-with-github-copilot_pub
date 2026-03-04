document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      // Reset activity select (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participants = details.participants || [];
        const participantsHtml = participants.length
          ? `<ul class="participants-list">${participants
              .map(
                (p) =>
                  `<li><span class="participant-email">${p}</span><button class="remove-participant" data-activity="${encodeURIComponent(
                    name
                  )}" data-email="${encodeURIComponent(p)}" title="Remove participant">✖</button></li>`
              )
              .join("")}</ul>`
          : `<p class="no-participants">No participants yet</p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants">
            <strong>Participants:</strong>
            ${participantsHtml}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Attach remove handlers for this card
        activityCard.querySelectorAll('.remove-participant').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const encodedActivity = btn.dataset.activity;
            const encodedEmail = btn.dataset.email;
            const activityName = decodeURIComponent(encodedActivity);
            const email = decodeURIComponent(encodedEmail);

            try {
              const resp = await fetch(
                `/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(email)}`,
                { method: 'DELETE' }
              );

              const body = await resp.json().catch(() => ({}));

              if (resp.ok) {
                messageDiv.textContent = body.message || `Removed ${email} from ${activityName}`;
                messageDiv.className = 'success';
                // Refresh activities list
                fetchActivities();
              } else {
                messageDiv.textContent = body.detail || 'Failed to remove participant';
                messageDiv.className = 'error';
              }

              messageDiv.classList.remove('hidden');
              setTimeout(() => messageDiv.classList.add('hidden'), 5000);
            } catch (err) {
              console.error('Error removing participant:', err);
              messageDiv.textContent = 'Failed to remove participant. Please try again.';
              messageDiv.className = 'error';
              messageDiv.classList.remove('hidden');
            }
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // refresh activity list so newly registered student appears
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
