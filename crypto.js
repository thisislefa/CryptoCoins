// --- CONFIGURATION ---
        // Expanded to Top 20+ Major Coins supported by CoinGecko
        const SUPPORTED_COINS = [
            { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', img: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
            { id: 'ethereum', symbol: 'eth', name: 'Ethereum', img: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
            { id: 'binancecoin', symbol: 'bnb', name: 'BNB', img: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
            { id: 'solana', symbol: 'sol', name: 'Solana', img: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
            { id: 'ripple', symbol: 'xrp', name: 'XRP', img: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
            { id: 'cardano', symbol: 'ada', name: 'Cardano', img: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' },
            { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', img: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png' },
            { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', img: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
            { id: 'tron', symbol: 'trx', name: 'TRON', img: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png' },
            { id: 'polkadot', symbol: 'dot', name: 'Polkadot', img: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png' },
            { id: 'chainlink', symbol: 'link', name: 'Chainlink', img: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png' },
            { id: 'matic-network', symbol: 'matic', name: 'Polygon', img: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png' },
            { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', img: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png' },
            { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', img: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png' },
            { id: 'bitcoin-cash', symbol: 'bch', name: 'Bitcoin Cash', img: 'https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png' },
            { id: 'uniswap', symbol: 'uni', name: 'Uniswap', img: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png' },
            { id: 'near', symbol: 'near', name: 'NEAR Protocol', img: 'https://assets.coingecko.com/coins/images/10365/large/near.png' },
            { id: 'stellar', symbol: 'xlm', name: 'Stellar', img: 'https://assets.coingecko.com/coins/images/100/large/stellar_logo.png' },
            { id: 'monero', symbol: 'xmr', name: 'Monero', img: 'https://assets.coingecko.com/coins/images/69/large/monero_logo.png' },
            { id: 'cosmos', symbol: 'atom', name: 'Cosmos', img: 'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png' }
        ];

        let currentCoin = SUPPORTED_COINS[0]; // Default to Bitcoin
        let chartInstance = null;
        let currentPriceUSD = 0;
        let currentRange = 7; // Store current chart time range

        // --- INIT ---
        document.addEventListener('DOMContentLoaded', () => {
            setupDropdown();
            fetchCoinData(currentCoin.id);
            fetchChartData(currentCoin.id, currentRange); 
            
            // New Sidebar Logic Initialization
            initTabs();
            initPaymentOptions();

            // Calculator Listeners
            document.getElementById('usdInput').addEventListener('input', calculateCrypto);
            
            // Buy Button Disclaimer
            document.getElementById('buyBtn').addEventListener('click', handleBuyAction);

            // Hide Loader
            setTimeout(() => {
                document.getElementById('loader').style.opacity = '0';
                setTimeout(() => document.getElementById('loader').style.display = 'none', 500);
            }, 1000);

            // --- AUTO UPDATE (Every 60 Seconds) ---
            setInterval(() => {
                console.log("Auto-updating data...");
                fetchCoinData(currentCoin.id);
                fetchChartData(currentCoin.id, currentRange);
            }, 60000);
        });

        // --- API FUNCTIONS (CoinGecko) ---
        
        async function fetchCoinData(coinId) {
            try {
                // Fetch basic ticker info
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
                const data = await response.json();

                if(!data.market_data) throw new Error("API Limit Reached");

                updateUI(data);
            } catch (error) {
                console.error("Error fetching coin data:", error);
                // We don't alert on auto-update error to avoid spamming the user
            }
        }

        async function fetchChartData(coinId, days) {
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
                const data = await response.json();
                
                if(data.prices) {
                    renderChart(data.prices, days);
                }
            } catch (error) {
                console.error("Error fetching chart data:", error);
            }
        }

        // --- UI UPDATES ---

        function updateUI(data) {
            const m = data.market_data;
            currentPriceUSD = m.current_price.usd;
            const change24 = m.price_change_percentage_24h;

            // Header Info
            document.getElementById('currentPrice').innerText = formatCurrency(currentPriceUSD);
            
            const changeEl = document.getElementById('priceChange');
            changeEl.className = `price-change ${change24 >= 0 ? 'green' : 'red'}`;
            changeEl.innerHTML = `
                <i class="fas fa-caret-${change24 >= 0 ? 'up' : 'down'}"></i>
                <span>${Math.abs(change24).toFixed(2)}%</span>
            `;

            // Market Grid
            document.getElementById('marketCap').innerText = formatCurrency(m.market_cap.usd, true);
            document.getElementById('volume').innerText = formatCurrency(m.total_volume.usd, true);
            document.getElementById('supply').innerText = `${formatNumber(m.circulating_supply)} ${currentCoin.symbol.toUpperCase()}`;
            document.getElementById('ath').innerText = formatCurrency(m.ath.usd);
            document.getElementById('rank').innerText = `#${data.market_cap_rank}`;
            document.getElementById('high24').innerText = formatCurrency(m.high_24h.usd);
            document.getElementById('low24').innerText = formatCurrency(m.low_24h.usd);

            // Sidebar & Calculator
            document.getElementById('buyBtn').innerText = `Buy ${currentCoin.name}`;
            document.getElementById('sidebarSymbol').innerText = currentCoin.symbol.toUpperCase();
            document.getElementById('sidebarIcon').src = currentCoin.img;
            document.getElementById('convSymbol').innerText = currentCoin.symbol.toUpperCase();
            document.getElementById('convPrice').innerText = formatCurrency(currentPriceUSD);
            
            calculateCrypto(); // Refresh calc
        }

        // --- CHART.JS CONFIG ---
        function renderChart(prices, days) {
            const ctx = document.getElementById('cryptoChart').getContext('2d');
            
            // Format timestamps based on range
            const labels = prices.map(price => {
                const date = new Date(price[0]);
                return days === 1 ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : date.toLocaleDateString();
            });
            const dataPoints = prices.map(price => price[1]);

            // Determine color based on trend (start vs end)
            const isPositive = dataPoints[dataPoints.length - 1] >= dataPoints[0];
            const borderColor = isPositive ? '#00c853' : '#f23545';
            
            // Create Gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, isPositive ? 'rgba(0, 200, 83, 0.2)' : 'rgba(242, 53, 69, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            if(chartInstance) chartInstance.destroy();

            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Price (USD)',
                        data: dataPoints,
                        borderColor: borderColor,
                        backgroundColor: gradient,
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        fill: true,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false, // Disable animation for smoother auto-updates
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: '#161a1e',
                            titleColor: '#b7bdc6',
                            bodyColor: '#fff',
                            borderColor: '#2c3035',
                            borderWidth: 1,
                            callbacks: {
                                label: function(context) {
                                    return '$' + context.parsed.y.toLocaleString();
                                }
                            }
                        }
                    },
                    scales: {
                        x: { display: false }, // Hide X axis for cleaner look
                        
                        y: {
                                position: 'right',
                                ticks: {
                                    color: '#b7bdc6',
                                    callback: (val) => '$' + val.toLocaleString(),
                                    font: {
                                        size: 13,
                                        weight: '600'
                                    }
                                }
                            }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            });
        }

        // --- SIDEBAR & UX LOGIC ---

        function initTabs() {
            const tabs = document.querySelectorAll('.tab-btn');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                });
            });
        }

        function initPaymentOptions() {
            const options = document.querySelectorAll('.payment-option');
            options.forEach(option => {
                option.addEventListener('click', function() {
                    options.forEach(o => o.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });
        }

        function handleBuyAction() {
             alert(`TRANSACTION BLOCKED! This application is a personal project intended for demonstration and portfolio purposes only. The Buy/Sell functionality, payment processing, and order execution are not implemented in this demo.
                
                Current Coin: ${currentCoin.name}
                Amount: ${document.getElementById('usdInput').value} USD
                Method: ${document.querySelector('.payment-option.selected')?.dataset.method || 'Not Selected'}
            `);
        }

        // --- UTILITIES ---

        function setupDropdown() {
            const dropdown = document.getElementById('coinDropdown');
            dropdown.innerHTML = '';
            
            SUPPORTED_COINS.forEach(coin => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.innerHTML = `<img src="${coin.img}"> <span>${coin.name}</span>`;
                item.onclick = () => switchCoin(coin);
                dropdown.appendChild(item);
            });
        }

        function toggleDropdown() {
            document.getElementById('coinDropdown').classList.toggle('show');
        }

        function switchCoin(coin) {
            currentCoin = coin;
            
            // Update Headers
            document.getElementById('coinName').innerText = coin.name;
            document.getElementById('coinSymbol').innerText = coin.symbol.toUpperCase();
            document.getElementById('breadCoin').innerText = " > " + coin.name;
            document.getElementById('coinIcon').src = coin.img;
            
            // Hide dropdown
            document.getElementById('coinDropdown').classList.remove('show');
            
            // Reset & Fetch
            currentPriceUSD = 0;
            document.getElementById('currentPrice').innerText = "Loading...";
            
            fetchCoinData(coin.id);
            fetchChartData(coin.id, currentRange);
        }

        function updateChartRange(days, btn) {
            currentRange = days; // Update global state
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            fetchChartData(currentCoin.id, days);
        }

        function calculateCrypto() {
            const usd = parseFloat(document.getElementById('usdInput').value) || 0;
            if(currentPriceUSD > 0) {
                const cryptoAmount = usd / currentPriceUSD;
                document.getElementById('cryptoInput').value = cryptoAmount.toFixed(8);
            }
        }

        function setAmount(val) {
            document.getElementById('usdInput').value = val;
            calculateCrypto();
        }

        // Formatters
        const formatCurrency = (num, compact = false) => {
            if(!num) return '---';
            return new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD',
                notation: compact ? 'compact' : 'standard',
                maximumFractionDigits: 2
            }).format(num);
        };

        const formatNumber = (num) => {
            if(!num) return '---';
            return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
        };

        // Close dropdown when clicking outside
        window.onclick = function(event) {
            if (!event.target.closest('.coin-selector-wrapper')) {
                document.getElementById('coinDropdown').classList.remove('show');
            }
        }