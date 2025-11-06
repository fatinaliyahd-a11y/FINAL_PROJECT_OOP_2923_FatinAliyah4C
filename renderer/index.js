const { ipcRenderer } = require('electron');
const searchBtn = document.getElementById('searchBtn');
const resultDiv = document.getElementById('result');
const mealPlanBtn = document.getElementById('mealPlanBtn');
let currentFood = '';

searchBtn.addEventListener('click', async () => {
  const sunnahIngredient = document.getElementById("sunnahFood").value.trim().toLowerCase();

  if (!sunnahIngredient) {
    alert("Please enter a Sunnah ingredient (e.g. honey, dates, milk).");
    return;
  }

  resultDiv.innerHTML = "<p>Loading recipes...</p>";

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?apiKey=153ed267f6fe4cc1978d7d8576103378&ingredients=${sunnahIngredient}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    if (data.length === 0) {
      resultDiv.innerHTML = `<p>No recipes found for "${sunnahIngredient}". Try another Sunnah food!</p>`;
      return;
    }

    // Display each recipe result
    resultDiv.innerHTML = data.map(recipe => `
      <div style="border:1px solid #ccc; margin:10px; padding:10px;">
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}" width="200"><br>
        <p><strong>Used ingredients:</strong> ${recipe.usedIngredients.map(i => i.name).join(', ')}</p>
        <p><strong>Missed ingredients:</strong> ${recipe.missedIngredients.map(i => i.name).join(', ')}</p>
      </div>
    `).join('');

    mealPlanBtn.style.display = 'block';
    currentFood = sunnahIngredient;

  } catch (error) {
    console.error('Fetch Error:', error);
    resultDiv.innerHTML = `<p style="color:red;">Error fetching data. Please try again later.</p>`;
  }
});

mealPlanBtn.addEventListener('click', () => {
  ipcRenderer.send('open-meal-window', currentFood);
});
