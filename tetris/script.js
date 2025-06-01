/**
 * script.js - テトリスゲームのメインスクリプト
 * Tailwind Tetris v1.0.0
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM要素
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const linesDisplay = document.getElementById('lines');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const restartButton = document.getElementById('restart-button');
    const gameOverDisplay = document.getElementById('game-over');
    const pauseOverlay = document.getElementById('pause-overlay');
    const finalScoreDisplay = document.getElementById('final-score');
    const nextPieceDisplay = document.getElementById('next-piece');
    const holdPieceDisplay = document.getElementById('hold-piece');
    
    // 統計表示要素
    const statsI = document.getElementById('stats-i');
    const statsJ = document.getElementById('stats-j');
    const statsL = document.getElementById('stats-l');
    const statsO = document.getElementById('stats-o');
    const statsS = document.getElementById('stats-s');
    const statsT = document.getElementById('stats-t');
    const statsZ = document.getElementById('stats-z');
    
    // レンダラーの初期化
    TetrisRenderer.init(gameBoard, nextPieceDisplay, holdPieceDisplay);
    
    // UIの初期化
    TetrisUI.init({
        scoreDisplay,
        levelDisplay,
        linesDisplay,
        gameOverDisplay,
        pauseOverlay,
        finalScoreDisplay,
        startButton,
        pauseButton,
        restartButton,
        statsI,
        statsJ,
        statsL,
        statsO,
        statsS,
        statsT,
        statsZ
    });
    
    // ゲームの初期化
    TetrisGame.init();
    
    // バージョン情報の初期化
    TetrisUtils.initVersionInfo();
    
    // キーボード入力の処理
    document.addEventListener('keydown', (e) => {
        const gameState = TetrisGame.getGameState();
        
        if (!gameState.isGameOver) {
            if (!gameState.isPaused) {
                switch (e.key) {
                    case 'ArrowLeft':
                        TetrisGame.moveLeft();
                        break;
                    case 'ArrowRight':
                        TetrisGame.moveRight();
                        break;
                    case 'ArrowDown':
                        TetrisGame.softDrop();
                        break;
                    case 'ArrowUp':
                        TetrisGame.rotatePiece();
                        break;
                    case ' ':
                        TetrisGame.hardDrop();
                        break;
                    case 'c':
                    case 'C':
                        TetrisGame.holdCurrentPiece();
                        break;
                }
            }
            
            // 一時停止/再開
            if (e.key === 'p' || e.key === 'P') {
                TetrisGame.togglePause();
            }
        }
    });
    
    // ボタンイベントの設定
    startButton.addEventListener('click', TetrisGame.start);
    pauseButton.addEventListener('click', TetrisGame.togglePause);
    restartButton.addEventListener('click', TetrisGame.start);
});
