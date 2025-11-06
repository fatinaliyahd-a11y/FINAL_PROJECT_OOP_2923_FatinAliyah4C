const { ipcRenderer } = require('electron');

// When Save button clicked
document.getElementById('saveWeekBtn').addEventListener('click', () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const weekPlan = {};

    days.forEach(day => {
        weekPlan[day] = document.getElementById(day).value.trim() || '-';
    });

    const currentDate = new Date().toLocaleDateString(); // for reference
    const data = {
        date: currentDate,
        weekPlan: weekPlan
    };

    ipcRenderer.send('save-meal-plan', data);
    alert('Weekly meal plan saved!');
    ipcRenderer.send('get-meal-plans');
});



document.getElementById('viewPlansBtn').addEventListener('click', () => {
    ipcRenderer.send('open-view-plans');
});

// Listen for meal plan data
ipcRenderer.on('meal-plans-data', (event, mealPlans) => {
    displayMealPlans(mealPlans);
});

// Refresh after deletion
ipcRenderer.on('meal-plan-deleted', () => {
    ipcRenderer.send('get-meal-plans');
});

// Load meal plans on page start
window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('get-meal-plans');
});
