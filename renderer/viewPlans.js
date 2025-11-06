const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.send('get-meal-plans');
});

ipcRenderer.on('meal-plans-data', (event, mealPlans) => {
  const container = document.getElementById('plansContainer');
  container.innerHTML = '';

  if (!mealPlans || mealPlans.length === 0) {
    container.innerHTML = '<p style="text-align:center;">No meal plans found</p>';
    return;
  }

  mealPlans.forEach((plan, index) => {
    const card = document.createElement('div');
    card.classList.add('meal-card');

    const weekDetails = plan.weekPlan
      ? Object.entries(plan.weekPlan)
          .map(([day, meal]) => `
            <p><strong>${day.charAt(0).toUpperCase() + day.slice(1)}:</strong> ${meal}</p>
          `)
          .join('')
      : '';

    card.innerHTML = `
      <h3>${plan.date || 'Unnamed Plan'}</h3>
      <div class="meal-details">${weekDetails}</div>
      <div class="edit-form" style="display:none;"></div>
      <div style="margin-top:10px; text-align:center;">
        <button class="edit-btn" data-index="${index}">Edit</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </div>
    `;

    container.appendChild(card);
  });

  // DELETE button event
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      const confirmDelete = confirm("Are you sure you want to delete this meal plan?");
      if (confirmDelete) {
        ipcRenderer.send('delete-meal-plan', index);
      }

    });
  });

  // EDIT button event
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      const plan = mealPlans[index];
      const card = e.target.closest('.meal-card');
      const editForm = card.querySelector('.edit-form');
      const mealDetails = card.querySelector('.meal-details');

      // Hide current details and show editable form
      mealDetails.style.display = 'none';
      editForm.style.display = 'block';

      let formHTML = '<form>';
      for (const [day, meal] of Object.entries(plan.weekPlan)) {
        formHTML += `
          <label><strong>${day.charAt(0).toUpperCase() + day.slice(1)}:</strong></label>
          <input type="text" name="${day}" value="${meal}" style="width:90%; margin-bottom:5px;"><br>
        `;
      }
      formHTML += `
        <button type="button" class="save-edit" data-index="${index}">Save Changes</button>
        <button type="button" class="cancel-edit">Cancel</button>
      </form>`;

      editForm.innerHTML = formHTML;

      // Save edited plan
      editForm.querySelector('.save-edit').addEventListener('click', (ev) => {
        const inputs = editForm.querySelectorAll('input');
        const updatedPlan = JSON.parse(JSON.stringify(plan));
        inputs.forEach(input => {
          updatedPlan.weekPlan[input.name] = input.value;
        });

        ipcRenderer.send('edit-meal-plan', { index, updatedPlan });

        alert("Changes saved successfully!");
      });

      // Cancel editing
      editForm.querySelector('.cancel-edit').addEventListener('click', () => {
        editForm.style.display = 'none';
        mealDetails.style.display = 'block';
      });
    });
  });
});

// Refresh when updated or deleted
ipcRenderer.on('meal-plan-deleted', () => {
  alert("Meal plan deleted successfully!");
  ipcRenderer.send('get-meal-plans');
});
ipcRenderer.on('meal-plan-updated', () => {
  ipcRenderer.send('get-meal-plans');
});
