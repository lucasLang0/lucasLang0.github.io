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