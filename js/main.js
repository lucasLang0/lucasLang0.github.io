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


// Snake Game
const canvas = document.getElementById('snakeCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const gridSize = 20;
const tileCount = canvas ? canvas.width / gridSize : 20;

let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isGameRunning = false;
let isPaused = false;

// Initialize high score display
if (document.getElementById('highScore')) {
    document.getElementById('highScore').textContent = highScore;
}

function startSnakeGame() {
    if (!isGameRunning) {
        isGameRunning = true;
        isPaused = false;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        
        // if (score === 0) {
        //     resetSnakeGame();
        // }
        
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
    food = generateFood();
    dx = 1;
    dy = 0;
    score = 0;
    isGameRunning = false;
    isPaused = false;
    
    document.getElementById('score').textContent = score;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = 'Pause';
    
    if (ctx) {
        drawGame();
    }
}

function updateGame() {
    if (isPaused) return;
    
    // Move snake
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Check self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('score').textContent = score;
        food = generateFood();
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            document.getElementById('highScore').textContent = highScore;
        }
    } else {
        snake.pop();
    }
    
    drawGame();
}

function drawGame() {
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    ctx.fillStyle = '#1e3a8a';
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#1e3a8a'; // Lighter color for head
        } else {
            ctx.fillStyle = '#1d4ed8';
        }
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
    
    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
}

function gameOver() {
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
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Courier';
        ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    if (isPaused) return;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy !== 1) { dx = 0; dy = -1; }
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy !== -1) { dx = 0; dy = 1; }
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx !== 1) { dx = -1; dy = 0; }
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx !== -1) { dx = 1; dy = 0; }
            e.preventDefault();
            break;
    }
});

// Initialize game display
if (canvas) {
    drawGame();
}



























// // server.js - Node.js Backend
// const express = require('express');
// const fetch = require('node-fetch');
// const path = require('path');
// const app = express();
// const PORT = 3000;

// // Serve static files (HTML, CSS, JS, images)
// app.use(express.static('public'));

// // API endpoint to get random xkcd comic
// app.get('/api/random-xkcd', async (req, res) => {
//     try {
//         // Get the latest comic to know the max number
//         const latestResponse = await fetch('https://xkcd.com/info.0.json');
//         const latestComic = await latestResponse.json();
//         const maxNum = latestComic.num;
        
//         // Generate random number (avoid 404 which doesn't exist)
//         let randomNum = Math.floor(Math.random() * maxNum) + 1;
//         if (randomNum === 404) randomNum = 405;
        
//         // Fetch the random comic
//         const comicResponse = await fetch(`https://xkcd.com/${randomNum}/info.0.json`);
//         const comic = await comicResponse.json();
        
//         res.json(comic);
//     } catch (error) {
//         console.error('Error fetching xkcd:', error);
//         res.status(500).json({ error: 'Failed to fetch comic' });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });


// // ============================================
// // package.json
// // ============================================
// /*
// {
//   "name": "xkcd-random",
//   "version": "1.0.0",
//   "description": "Random xkcd comic loader",
//   "main": "server.js",
//   "scripts": {
//     "start": "node server.js"
//   },
//   "dependencies": {
//     "express": "^4.18.2",
//     "node-fetch": "^2.6.7"
//   }
// }
// */