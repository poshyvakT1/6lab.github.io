const gridContainer = document.querySelector('.grid');
const resetButton = document.getElementById('resetButton');
const levelSelect = document.getElementById('level');
const timerElement = document.getElementById('timer');
const clicksElement = document.getElementById('clicks');
const minStepsElement = document.getElementById('minSteps');

let levels;
let currentLevel;
let originalGrid;
let timer;
let clicks = 0;

function ajsLevels(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            callback(null, data);
        } else {
            callback("Error fetching levels", null);
        }
    };
    xhr.open('GET', url, true);
    xhr.send();
}

ajsLevels('levels.json', function (error, data) {
    if (error) {
        console.error('Error fetching levels:', error);
    } else {
        levels = data;
        resetGame();
    }
});

function createGrid(level) {
    gridContainer.innerHTML = '';
    level.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            if (cell === 1) {
                cellElement.classList.add('on');
            }
            cellElement.addEventListener('click', () => toggleCell(rowIndex, cellIndex));
            gridContainer.appendChild(cellElement);
        });
    });
}

function toggleCell(row, col) {
    const cells = currentLevel;
    cells[row][col] = 1 - cells[row][col];
    if (row > 0) cells[row - 1][col] = 1 - cells[row - 1][col];
    if (row < cells.length - 1) cells[row + 1][col] = 1 - cells[row + 1][col];
    if (col > 0) cells[row][col - 1] = 1 - cells[row][col - 1];
    if (col < cells[row].length - 1) cells[row][col + 1] = 1 - cells[row][col + 1];
    updateGrid();
    clicks++;
    clicksElement.textContent = clicks;
    checkWin();
}

function updateGrid() {
    const cells = gridContainer.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 5);
        const col = index % 5;
        if (currentLevel[row][col] === 1) {
            cell.classList.add('on');
        } else {
            cell.classList.remove('on');
        }
    });
}

function checkWin() {
    const allOff = currentLevel.every(row => row.every(cell => cell === 0));
    if (allOff) {
        clearInterval(timer);
        alert(`You win! Time: ${timerElement.textContent} seconds, Clicks: ${clicks}`);
    }
}

function resetGame() {
    const selectedLevel = levels[levelSelect.value];
    currentLevel = selectedLevel.grid.map(row => [...row]);
    originalGrid = selectedLevel.grid.map(row => [...row]);
    clicks = 0;
    clicksElement.textContent = clicks;
    minStepsElement.textContent = selectedLevel.minSteps;
    createGrid(currentLevel);
    clearInterval(timer);
    startTimer();
}

function startTimer() {
    let seconds = 0;
    timer = setInterval(() => {
        seconds++;
        timerElement.textContent = seconds;
    }, 1000);
}

levelSelect.addEventListener('change', resetGame);
resetButton.addEventListener('click', () => {
    currentLevel = originalGrid.map(row => [...row]);
    createGrid(currentLevel);
    clicks = 0;
    clicksElement.textContent = clicks;
    clearInterval(timer);
    startTimer();
});

resetGame();
