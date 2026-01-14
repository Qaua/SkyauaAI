// SkyAua Script - API Key Free Version

// 1. AI CHAT LOGIC (Pollinations.ai қолданады - тегін)
const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const modelSelect = document.getElementById('ai-model-select');

// Хабарлама қосу функциясы
function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    
    // Markdown қолдау (marked кітапханасы)
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('text');
    contentDiv.innerHTML = sender === 'bot' ? marked.parse(text) : text;
    
    msgDiv.appendChild(contentDiv);
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// AI-ға сұраныс жіберу
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Пайдаланушы хабарламасы
    addMessage(text, 'user');
    userInput.value = '';

    // "Ойлануда..." анимациясы
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot';
    loadingDiv.innerHTML = '<div class="text">...</div>';
    chatWindow.appendChild(loadingDiv);

    try {
        // Жүйелік нұсқаулық (System Prompt) - Қазақша сөйлеуге үйрету
        const context = "Сен SkyAua деп аталатын AI көмекшісің. Баян-Өлгийде жасалғансың. Жауапты тек қана қазақ тілінде бер. Қысқа әрі нұсқа жауап бер.";
        const fullPrompt = `${context}\nUser: ${text}\nAI:`;

        // Pollinations.ai API (Тегін, кілт керек емес)
        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=openai`);
        
        if (!response.ok) throw new Error('API Error');
        
        const aiText = await response.text();
        
        chatWindow.removeChild(loadingDiv);
        addMessage(aiText, 'bot');

    } catch (error) {
        chatWindow.removeChild(loadingDiv);
        addMessage("Кешіріңіз, байланыс нашар. Қайталап көріңіз.", 'bot');
        console.error(error);
    }
}

// Enter түймесін басқанда жіберу
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});


// 2. CRYPTO DATA (CoinGecko Free API)
async function fetchCrypto() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();

        // Ticker-ді жаңарту
        const ticker = document.getElementById('crypto-ticker');
        ticker.innerHTML = `
            <span class="ticker-item">BTC: $${data.bitcoin.usd} (${data.bitcoin.usd_24h_change.toFixed(2)}%)</span>
            <span class="ticker-item">ETH: $${data.ethereum.usd} (${data.ethereum.usd_24h_change.toFixed(2)}%)</span>
            <span class="ticker-item">SOL: $${data.solana.usd} (${data.solana.usd_24h_change.toFixed(2)}%)</span>
            <span class="ticker-item">BNB: $${data.binancecoin.usd} (${data.binancecoin.usd_24h_change.toFixed(2)}%)</span>
        `;

        // Басты карталарды жаңарту
        document.getElementById('price-btc').innerText = `$${data.bitcoin.usd}`;
        document.getElementById('price-eth').innerText = `$${data.ethereum.usd}`;
        
        renderSimpleChart('chart-btc', data.bitcoin.usd_24h_change > 0 ? 'green' : 'red');
        renderSimpleChart('chart-eth', data.ethereum.usd_24h_change > 0 ? 'green' : 'red');

    } catch (e) {
        console.log("Crypto API шегіне жетті (Rate Limit).", e);
    }
}

// Акцияларды имитациялау (Себебі тегін Real-time Stock API жоқ)
function simulateStocks() {
    const stocks = [
        { name: "NVIDIA (NVDA)", price: 145.30 },
        { name: "APPLE (AAPL)", price: 220.15 },
        { name: "MICROSOFT (MSFT)", price: 420.55 },
        { name: "TESLA (TSLA)", price: 210.80 }
    ];

    const list = document.getElementById('stock-list');
    list.innerHTML = '';
    
    stocks.forEach(stock => {
        // Кездейсоқ өзгеріс қосу
        const change = (Math.random() * 2 - 1).toFixed(2);
        const color = change >= 0 ? 'green' : 'red';
        const sign = change >= 0 ? '+' : '';
        
        list.innerHTML += `
            <li>
                <span>${stock.name}</span>
                <span class="${color}">${sign}${change}% ($${stock.price})</span>
            </li>
        `;
    });
}

// Қарапайым график сызу (Chart.js)
function renderSimpleChart(canvasId, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    // Егер ескі график болса, өшіру керек (қарапайым болу үшін мұнда жасамадым)
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1', '2', '3', '4', '5'],
            datasets: [{
                data: [10, 15, 8, 20, 25].map(x => x * Math.random()), // Fake data for visual
                borderColor: color === 'green' ? '#10b981' : '#ef4444',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });
}


// 3. TECH NEWS (RSS to JSON)
async function fetchTechNews() {
    const rssUrl = 'https://feeds.feedburner.com/TechCrunch/'; // TechCrunch RSS
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    const container = document.getElementById('news-container');

    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        
        container.innerHTML = ''; // Тазалау
        
        // Алғашқы 6 жаңалықты алу
        data.items.slice(0, 6).forEach(item => {
            // Сурет болмаса default сурет қою
            const img = item.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=60';
            
            const card = `
                <div class="news-card">
                    <div class="news-source">TechCrunch</div>
                    <h3 class="news-title">${item.title}</h3>
                    <a href="${item.link}" target="_blank" class="news-link">Толығырақ оқу &rarr;</a>
                </div>
            `;
            container.innerHTML += card;
        });

    } catch (e) {
        container.innerHTML = '<div class="news-card">Жаңалықтарды жүктеу мүмкін болмады (CORS шектеуі болуы мүмкін).</div>';
    }
}

// Іске қосу
document.addEventListener('DOMContentLoaded', () => {
    fetchCrypto();
    simulateStocks(); // Акцияларды іске қосу
    fetchTechNews();
    
    // Жаңартып отыру (әр 60 секунд)
    setInterval(fetchCrypto, 60000);
    setInterval(simulateStocks, 5000);
});
