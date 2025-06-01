/**
 * ui.js - スコア表示などのUI更新
 * Tailwind Tetris v1.0.0
 */

// テトリスのUI管理用の名前空間
const TetrisUI = (function() {
    // DOM要素
    let scoreDisplay;
    let levelDisplay;
    let linesDisplay;
    let gameOverDisplay;
    let pauseOverlay;
    let finalScoreDisplay;
    let startButton;
    let pauseButton;
    let restartButton;
    let statsElements = {};
    
    // ゲーム状態
    let score = 0;
    let level = 1;
    let lines = 0;
    
    // テーマ関連
    let currentTheme = 'default';
    const THEMES = {
        DEFAULT: 'default',
        DARK: 'dark',
        RETRO: 'retro',
        PASTEL: 'pastel',
        NEON: 'neon'
    };
    const THEME_NAMES = {
        default: 'デフォルト',
        dark: 'ダーク',
        retro: 'レトロ',
        pastel: 'パステル',
        neon: 'ネオン'
    };
    const availableThemes = Object.values(THEMES);
    let themeButtons = [];
    
    // DOM完全ロード確認
    function isDOMReady() {
        return document.readyState === 'complete' || document.readyState === 'interactive';
    }
    
    // 初期化
    function init(elements) {
        scoreDisplay = elements.scoreDisplay;
        levelDisplay = elements.levelDisplay;
        linesDisplay = elements.linesDisplay;
        gameOverDisplay = elements.gameOverDisplay;
        pauseOverlay = elements.pauseOverlay;
        finalScoreDisplay = elements.finalScoreDisplay;
        startButton = elements.startButton;
        pauseButton = elements.pauseButton;
        restartButton = elements.restartButton;
        
        // 統計表示要素
        statsElements = {
            i: elements.statsI,
            j: elements.statsJ,
            l: elements.statsL,
            o: elements.statsO,
            s: elements.statsS,
            t: elements.statsT,
            z: elements.statsZ
        };
        
        // テーマボタンの初期化（DOM読み込み完了後に実行）
        if (isDOMReady()) {
            initThemeSelector();
        } else {
            document.addEventListener('DOMContentLoaded', initThemeSelector);
        }
        
        // 初期表示
        updateScore(0);
        updateLevel(1);
        updateLines(0);
    }
    
    // テーマセレクターの初期化
    function initThemeSelector() {
        const themeSelector = document.getElementById('theme-selector');
        if (!themeSelector) return;
        
        themeButtons = Array.from(themeSelector.querySelectorAll('.theme-button'));
        
        // ローカルストレージからテーマを復元
        try {
            const savedTheme = localStorage.getItem('tetris-theme');
            if (savedTheme && availableThemes.includes(savedTheme)) {
                setTheme(savedTheme);
            } else {
                setTheme(THEMES.DEFAULT);
            }
        } catch (error) {
            console.error('ローカルストレージにアクセスできませんでした:', error);
            setTheme(THEMES.DEFAULT);
        }
        
        // クリックイベントを登録
        themeButtons.forEach(button => {
            const theme = button.dataset.theme;
            // アクセシビリティ対応
            button.setAttribute('aria-label', `${THEME_NAMES[theme]}テーマに変更`);
            button.setAttribute('tabindex', '0');
            button.setAttribute('title', THEME_NAMES[theme]);
            button.setAttribute('aria-pressed', theme === currentTheme ? 'true' : 'false');
            
            // クリックとキーボード操作
            button.addEventListener('click', () => {
                setTheme(theme);
            });
            button.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setTheme(theme);
                }
            });
        });
    }
    
    // テーマの設定
    function setTheme(theme) {
        if (!availableThemes.includes(theme)) return;
        
        // 現在のテーマを削除
        document.body.classList.remove(`theme-${currentTheme}`);
        
        // 新しいテーマを設定
        document.body.classList.add(`theme-${theme}`);
        currentTheme = theme;
        
        // アクティブなボタンを更新
        themeButtons.forEach(button => {
            if (button.dataset.theme === theme) {
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
            } else {
                button.classList.remove('active');
                button.setAttribute('aria-pressed', 'false');
            }
        });
        
        // ローカルストレージに保存
        try {
            localStorage.setItem('tetris-theme', theme);
        } catch (error) {
            console.error('テーマをローカルストレージに保存できませんでした:', error);
        }
    }
    
    // スコアの更新
    function updateScore(newScore) {
        score = newScore;
        if (scoreDisplay) {
            scoreDisplay.textContent = score;
        }
    }
    
    // スコアの加算
    function addScore(points) {
        score += points;
        if (scoreDisplay) {
            scoreDisplay.textContent = score;
        }
        return score;
    }
    
    // レベルの更新
    function updateLevel(newLevel) {
        level = newLevel;
        if (levelDisplay) {
            levelDisplay.textContent = level;
        }
    }
    
    // ラインの更新
    function updateLines(newLines) {
        lines = newLines;
        if (linesDisplay) {
            linesDisplay.textContent = lines;
        }
    }
    
    // ラインの加算
    function addLines(clearedLines) {
        lines += clearedLines;
        if (linesDisplay) {
            linesDisplay.textContent = lines;
        }
        
        // レベルの更新（10ラインごとにレベルアップ）
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            updateLevel(newLevel);
            TetrisRenderer.animateLevelUp(levelDisplay);
            return true; // レベルアップした
        }
        return false; // レベルアップしなかった
    }
    
    // ラインクリアによるスコア加算
    function addLineScore(linesCleared) {
        const linePoints = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4ライン
        const points = linePoints[linesCleared] * level;
        return addScore(points);
    }
    
    // 統計の更新
    function updateStats() {
        const stats = TetrisPieces.getStats();
        
        // 統計表示の更新
        for (const [pieceType, element] of Object.entries(statsElements)) {
            if (element) {
                element.textContent = stats[pieceType];
            }
        }
    }
    
    // ゲームオーバー表示
    function showGameOver() {
        if (gameOverDisplay) {
            gameOverDisplay.classList.remove('hidden');
            gameOverDisplay.style.display = 'flex';
            
            if (finalScoreDisplay) {
                finalScoreDisplay.textContent = score;
            }
        }
        
        // ゲームボードをシェイク
        TetrisRenderer.animateGameOver();
    }
    
    // 一時停止表示の切り替え
    function togglePauseDisplay(isPaused) {
        if (pauseOverlay) {
            if (isPaused) {
                pauseOverlay.classList.remove('hidden');
                pauseOverlay.style.display = 'flex';
                
                if (pauseButton) {
                    pauseButton.textContent = '再開';
                }
            } else {
                pauseOverlay.classList.add('hidden');
                pauseOverlay.style.display = 'none';
                
                if (pauseButton) {
                    pauseButton.textContent = '一時停止';
                }
            }
        }
    }
    
    // ボタンの状態を更新
    function updateButtons(gameState) {
        if (startButton) {
            startButton.disabled = gameState.isPlaying;
        }
        
        if (pauseButton) {
            pauseButton.disabled = !gameState.isPlaying || gameState.isGameOver;
        }
    }
    
    // UIのリセット
    function resetUI() {
        score = 0;
        level = 1;
        lines = 0;
        
        if (scoreDisplay) scoreDisplay.textContent = '0';
        if (levelDisplay) levelDisplay.textContent = '1';
        if (linesDisplay) linesDisplay.textContent = '0';
        
        // 統計表示のリセット
        for (const element of Object.values(statsElements)) {
            if (element) {
                element.textContent = '0';
            }
        }
        
        // ゲームオーバー表示を隠す
        if (gameOverDisplay) {
            gameOverDisplay.classList.add('hidden');
            gameOverDisplay.style.display = 'none';
        }
        
        // 一時停止表示を隠す
        if (pauseOverlay) {
            pauseOverlay.classList.add('hidden');
            pauseOverlay.style.display = 'none';
        }
    }
    
    // 現在のスコア情報を取得
    function getScoreInfo() {
        return {
            score,
            level,
            lines
        };
    }
    
    // 公開API
    return {
        init,
        updateScore,
        addScore,
        updateLevel,
        updateLines,
        addLines,
        addLineScore,
        updateStats,
        showGameOver,
        togglePauseDisplay,
        updateButtons,
        resetUI,
        getScoreInfo,
        setTheme,
        initThemeSelector
    };
})();
