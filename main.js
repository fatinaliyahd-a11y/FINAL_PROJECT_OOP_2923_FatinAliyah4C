const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let mealWindow;

// STEP 1: Create the /data folder if doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// STEP 2: Define the file path for storing meal plans
const filePath = path.join(__dirname, 'data', 'mealPlans.json');

// Create the main window (for searching sunnah foods)
function createMainWindow(){
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mainWindow.loadFile('renderer/index.html');
            // Open the DevTools.
    //mainWindow.webContents.openDevTools();
}

// Create the second window (for creating the meal plan)
function createMealWindow(food){
    mealWindow = new BrowserWindow({
        width: 600,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mealWindow.loadFile('renderer/sunnahMeal.html');

    // Send selected food name to sunnahMeal.html
    mealWindow.webContents.on('did-finish-load', () => {
        mealWindow.webContents.send('food-selected', food);
    });
}

function createViewPlansWindow() {
    const viewWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    viewWindow.loadFile('renderer/viewPlans.html');
}

// when user wants to open the Sunnah Meal Plan window
ipcMain.on('open-meal-window', (event, food) => {
    createMealWindow(food);
});


ipcMain.on('open-view-plans', () => {
    console.log("Opening View Plans window...");
    createViewPlansWindow();
});

// ========================================================================
// CRUD FUNCTIONS (Create, Read, Update/Edit, Delete)
// These handle reading/writing JSON data for meal plans
// ========================================================================

// ----------------------------
// 1) CREATE or UPDATE a meal plan
// ----------------------------
ipcMain.on('save-meal-plan', (event, data) => {
    let mealPlans = [];

    // Read existing file if available
    if (fs.existsSync(filePath)) {
        mealPlans = JSON.parse(fs.readFileSync(filePath));
    }

    // If same date already exists → update that plan
    const index = mealPlans.findIndex(p => p.date === data.date);
    if (index >= 0) {
        mealPlans[index] = data; 
    } else {
        mealPlans.push(data); // otherwise, add new one
    }

    // Save updated list back to JSON
    fs.writeFileSync(filePath, JSON.stringify(mealPlans, null, 2));

    event.reply('meal-plan-saved', 'success');
    console.log('Meal plan saved or updated:', data);
});

// ----------------------------
// 2) READ all meal plans
// ----------------------------
ipcMain.on('get-meal-plans', (event) => {
    if (!fs.existsSync(filePath)) {
        event.reply('meal-plans-data', []);  
        return;
    }

    const mealPlans = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    event.reply('meal-plans-data', mealPlans);  
});

// ----------------------------
// 3) DELETE a meal plan (by index)
// ----------------------------
ipcMain.on('delete-meal-plan', (event, index) => {
    if (!fs.existsSync(filePath)) return;

    let mealPlans = JSON.parse(fs.readFileSync(filePath));

    // Remove 1 element based on array index
    mealPlans.splice(index, 1);

    fs.writeFileSync(filePath, JSON.stringify(mealPlans, null, 2));
    event.reply('meal-plan-deleted', index);
    console.log('Meal plan deleted at index:', index);
});

// ----------------------------
// 4) EDIT / UPDATE a meal plan
// ----------------------------
ipcMain.on('edit-meal-plan', (event, { index, updatedPlan }) => {
    if (!fs.existsSync(filePath)) return;

    let mealPlans = JSON.parse(fs.readFileSync(filePath));

    // Replace with the updated version
    mealPlans[index] = updatedPlan;

    fs.writeFileSync(filePath, JSON.stringify(mealPlans, null, 2));
    event.reply('meal-plan-updated', 'success');
    console.log('Meal plan updated:', updatedPlan);
});

// ================================================================================

// run the app
app.whenReady().then(createMainWindow);
