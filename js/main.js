// Get modal elements
const modal = document.getElementById('resumeModal');
const resumeBtn = document.getElementById('resumeBtn');
const closeModal = document.getElementById('closeModal');

// Open modal when button is clicked
resumeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    modal.style.display = 'block';
});

// Close modal when X is clicked
closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
});

// Close modal when clicking outside of it
window.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});


// ============================================


// ============================================
// xkcd Random Comic Functionality
// ============================================

async function loadRandomXkcd() {
    try {
        // Get the latest comic to know the max number
        const latestResponse = await fetch('https://corsproxy.io/?https://xkcd.com/info.0.json');
        const latestComic = await latestResponse.json();
        const maxNum = latestComic.num;
        
        // Generate random number (avoid 404 which doesn't exist)
        let randomNum = Math.floor(Math.random() * maxNum) + 1;
        if (randomNum === 404) randomNum = 405;
        
        // Fetch the random comic
        const comicResponse = await fetch(`https://corsproxy.io/?https://xkcd.com/${randomNum}/info.0.json`);
        const comic = await comicResponse.json();
        
        // Display the comic (you'll need to add HTML elements for this)
        displayComic(comic);
    } catch (error) {
        console.error('Error fetching xkcd:', error);
    }
}

function displayComic(comic) {
    // Find or create container for the comic
    const container = document.getElementById('xkcd-container');
    if (container) {
        container.innerHTML = `
            <h2>${comic.title}</h2>
            <img src="${comic.img}" alt="${comic.alt}" title="${comic.alt}">
            <p><em>${comic.alt}</em></p>
            <button onclick="loadRandomXkcd()">Load Another Comic</button>
        `;
    }
}

// Load a comic when page loads (optional)
// loadRandomXkcd();


// ============================================
// Wikipedia Random Article Functionality
// ============================================

async function loadRandomWikipedia() {
    try {
        // Wikipedia API endpoint for random article
        const response = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
        const article = await response.json();
        
        // Display the article
        displayWikipediaArticle(article);
    } catch (error) {
        console.error('Error fetching Wikipedia article:', error);
    }
}

function displayWikipediaArticle(article) {
    const container = document.getElementById('wiki-container');
    if (container) {
        // Build thumbnail HTML if image exists
        const thumbnailHTML = article.thumbnail ? 
            `<img src="${article.thumbnail.source}" alt="${article.title}">` : 
            '';
        
        container.innerHTML = `
            <h2>${article.title}</h2>
            ${thumbnailHTML}
            <p>${article.extract}</p>
            <a href="${article.content_urls.desktop.page}" target="_blank">full article</a>
            <br><br>
            <button onclick="loadRandomWikipedia()">Load Another Article</button>
        `;
    }
}











// import { startSnakeGame, pauseSnakeGame, resetSnakeGame, toggleGameMode } from './snake.js';

// window.startSnakeGame = startSnakeGame;
// window.pauseSnakeGame = pauseSnakeGame;
// window.resetSnakeGame = resetSnakeGame;
// window.toggleGameMode = toggleGameMode;

// ============================================
// Snake Game
// ============================================

const canvas = document.getElementById('snakeCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const gridSize = 20;
const tileCount = canvas ? canvas.width / gridSize : 20;

let snake = [{x: 10, y: 10}];
let snake2 = [{x: 15, y: 15}];
let food = {x: 7, y: 7};
let dx = 0;
let dy = 0;
let dx2 = 0;
let dy2 = 0;
let score = 0;
let score2 = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isGameRunning = false;
let isPaused = false;
let isTwoPlayerMode = false;

// Initialize high score display
if (document.getElementById('highScore')) {
    document.getElementById('highScore').textContent = highScore;
}

// Toggle game mode
function toggleGameMode() {
    isTwoPlayerMode = document.getElementById('twoPlayerToggle')?.checked || false;
    
    // Show/hide player 2 score
    const player2ScoreDiv = document.getElementById('player2Score');
    if (player2ScoreDiv) {
        player2ScoreDiv.style.display = isTwoPlayerMode ? 'block' : 'none';
    }
    
    // Reset game when mode changes
    if (!isGameRunning) {
        resetSnakeGame();
    }
}

function startSnakeGame() {
    if (!isGameRunning) {
        isGameRunning = true;
        isPaused = false;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        
        gameLoop = setInterval(updateGame, 100);
    }
}

function pauseSnakeGame() {
    if (isGameRunning && !isPaused) {
        isPaused = true;
        clearInterval(gameLoop);
        document.getElementById('pauseBtn').textContent = 'Resume';
    } else if (isPaused) {
        isPaused = false;
        gameLoop = setInterval(updateGame, 100);
        document.getElementById('pauseBtn').textContent = 'Pause';
    }
}

function resetSnakeGame() {
    clearInterval(gameLoop);
    snake = [{x: 10, y: 10}];
    snake2 = [{x: 15, y: 15}];
    food = generateFood();
    dx = 1;
    dy = 0;
    dx2 = -1;
    dy2 = 0;
    score = 0;
    score2 = 0;
    isGameRunning = false;
    isPaused = false;
    
    document.getElementById('score').textContent = score;
    if (document.getElementById('score2')) {
        document.getElementById('score2').textContent = score2;
    }
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = 'Pause';
    
    if (ctx) {
        drawGame();
    }
}

function updateGame() {
    if (isPaused) return;
    
    // Move snake 1
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // Check wall collision for snake 1
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver(isTwoPlayerMode ? 2 : null);
        return;
    }
    
    // Check self collision for snake 1
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver(isTwoPlayerMode ? 2 : null);
            return;
        }
    }
    
    // In two player mode, check collision with snake 2
    if (isTwoPlayerMode) {
        for (let segment of snake2) {
            if (head.x === segment.x && head.y === segment.y) {
                gameOver(2);
                return;
            }
        }
    }
    
    snake.unshift(head);
    
    // Check food collision for snake 1
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('score').textContent = score;
        food = generateFood();
        
        if (!isTwoPlayerMode && score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            document.getElementById('highScore').textContent = highScore;
        }
    } else {
        snake.pop();
    }
    
    // Two player mode - update snake 2
    if (isTwoPlayerMode) {
        const head2 = {x: snake2[0].x + dx2, y: snake2[0].y + dy2};
        
        // Check wall collision for snake 2
        if (head2.x < 0 || head2.x >= tileCount || head2.y < 0 || head2.y >= tileCount) {
            gameOver(1);
            return;
        }
        
        // Check self collision for snake 2
        for (let i = 1; i < snake2.length; i++) {
            if (head2.x === snake2[i].x && head2.y === snake2[i].y) {
                gameOver(1);
                return;
            }
        }
        
        // Check collision with snake 1
        for (let segment of snake) {
            if (head2.x === segment.x && head2.y === segment.y) {
                gameOver(1);
                return;
            }
        }
        
        snake2.unshift(head2);
        
        // Check food collision for snake 2
        if (head2.x === food.x && head2.y === food.y) {
            score2++;
            document.getElementById('score2').textContent = score2;
            food = generateFood();
        } else {
            snake2.pop();
        }
    }
    
    drawGame();
}

function drawGame() {
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake 1
    ctx.fillStyle = '#1e3a8a';
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#1e3a8a'; // Head
        } else {
            ctx.fillStyle = '#1d4ed8'; // Body
        }
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
    
    // Draw snake 2 in two player mode
    if (isTwoPlayerMode) {
        snake2.forEach((segment, index) => {
            if (index === 0) {
                ctx.fillStyle = '#dc2626'; // Red head
            } else {
                ctx.fillStyle = '#ef4444'; // Red body
            }
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });
    }
    
    // Draw food
    ctx.fillStyle = '#0bec1aff';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (
        snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
        (isTwoPlayerMode && snake2.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    );
    
    return newFood;
}

function gameOver(winner) {
    clearInterval(gameLoop);
    isGameRunning = false;
    isPaused = false;
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = 'Pause';
    
    if (ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Courier';
        ctx.textAlign = 'center';
        
        if (isTwoPlayerMode && winner) {
            ctx.fillText(`Player ${winner} Wins!`, canvas.width / 2, canvas.height / 2 - 30);
            ctx.font = '20px Courier';
            ctx.fillText(`P1: ${score}  P2: ${score2}`, canvas.width / 2, canvas.height / 2 + 10);
        } else {
            ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = '20px Courier';
            ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
        }
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    if (isPaused) return;
    
    // Player 1 controls: Arrow keys
    switch(e.key) {
        case 'ArrowUp':
        case 'i':
        case 'I':
            if (dy !== 1) { dx = 0; dy = -1; }
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 'k':
        case 'K':
            if (dy !== -1) { dx = 0; dy = 1; }
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'j':
        case 'J':
            if (dx !== 1) { dx = -1; dy = 0; }
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'l':
        case 'L':
            if (dx !== -1) { dx = 1; dy = 0; }
            e.preventDefault();
            break;
    }
    if (!isTwoPlayerMode) {
        // Single player - WASD controls Player 1
        switch(e.key) {
            case 'w':
            case 'W':
                if (dy !== 1) { dx = 0; dy = -1; }
                e.preventDefault();
                break;
            case 's':
            case 'S':
                if (dy !== -1) { dx = 0; dy = 1; }
                e.preventDefault();
                break;
            case 'a':
            case 'A':
                if (dx !== 1) { dx = -1; dy = 0; }
                e.preventDefault();
                break;
            case 'd':
            case 'D':
                if (dx !== -1) { dx = 1; dy = 0; }
                e.preventDefault();
                break;
        }
    } else {
        // Two player mode - WASD controls Player 2
        switch(e.key) {
            case 'w':
            case 'W':
                if (dy2 !== 1) { dx2 = 0; dy2 = -1; }
                e.preventDefault();
                break;
            case 's':
            case 'S':
                if (dy2 !== -1) { dx2 = 0; dy2 = 1; }
                e.preventDefault();
                break;
            case 'a':
            case 'A':
                if (dx2 !== 1) { dx2 = -1; dy2 = 0; }
                e.preventDefault();
                break;
            case 'd':
            case 'D':
                if (dx2 !== -1) { dx2 = 1; dy2 = 0; }
                e.preventDefault();
                break;
        }
    }
    
});

// Initialize game display
if (canvas) {
    drawGame();
}























































