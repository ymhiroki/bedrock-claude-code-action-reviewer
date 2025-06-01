/**
 * renderer.js - 画面描画関連の処理
 * Tailwind Tetris v1.0.0
 */

// テトリスのレンダリング用の名前空間
const TetrisRenderer = (function() {
    // DOM要素
    let gameBoard;
    let nextPieceDisplay;
    let holdPieceDisplay;
    
    // 初期化
    function init(gameBoardElement, nextPieceElement, holdPieceElement) {
        gameBoard = gameBoardElement;
        nextPieceDisplay = nextPieceElement;
        holdPieceDisplay = holdPieceElement;
    }
    
    // ゲームボードのレンダリング
    function renderBoard(board, currentPiece, ghostPiece) {
        // ゲームボードをクリア
        gameBoard.innerHTML = '';
        
        // ボードの各セルを作成
        for (let y = 0; y < TetrisBoard.HEIGHT; y++) {
            for (let x = 0; x < TetrisBoard.WIDTH; x++) {
                const cell = document.createElement('div');
                cell.classList.add('tetris-cell');
                
                // セルに対応するクラスを追加
                if (board[y][x] !== TetrisBoard.EMPTY_CELL) {
                    cell.classList.add(board[y][x]);
                }
                
                gameBoard.appendChild(cell);
            }
        }
        
        // 現在のピースを描画
        if (currentPiece) {
            drawPiece(currentPiece);
        }
        
        // ゴーストピースを描画
        if (ghostPiece && currentPiece) {
            drawGhostPiece(ghostPiece);
        }
    }
    
    // ピースの描画
    function drawPiece(piece) {
        const { shape, position, className } = piece;
        
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const boardX = position.x + x;
                    const boardY = position.y + y;
                    
                    // ボード内の場合のみ描画
                    if (boardY >= 0 && boardY < TetrisBoard.HEIGHT && boardX >= 0 && boardX < TetrisBoard.WIDTH) {
                        const index = boardY * TetrisBoard.WIDTH + boardX;
                        const cell = gameBoard.children[index];
                        if (cell) {
                            cell.classList.add(className);
                        }
                    }
                }
            });
        });
    }
    
    // ゴーストピースの描画
    function drawGhostPiece(ghostPiece) {
        const { shape, position, className } = ghostPiece;
        
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const boardX = position.x + x;
                    const boardY = position.y + y;
                    
                    // ボード内の場合のみ描画
                    if (boardY >= 0 && boardY < TetrisBoard.HEIGHT && boardX >= 0 && boardX < TetrisBoard.WIDTH) {
                        const index = boardY * TetrisBoard.WIDTH + boardX;
                        const cell = gameBoard.children[index];
                        if (cell && !cell.classList.contains(className)) {
                            cell.classList.add('ghost');
                            cell.classList.add(className);
                        }
                    }
                }
            });
        });
    }
    
    // 次のピースの表示を更新
    function updateNextPieceDisplay(nextPiece) {
        if (!nextPieceDisplay) return;
        nextPieceDisplay.innerHTML = '';
        
        if (!nextPiece) return;
        
        // 4x4のグリッドを作成
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const cell = document.createElement('div');
                cell.classList.add('tetris-cell');
                
                // ピースの形状に基づいてセルを塗る
                if (y < nextPiece.shape.length && x < nextPiece.shape[0].length && nextPiece.shape[y][x] !== 0) {
                    cell.classList.add(nextPiece.className);
                }
                
                nextPieceDisplay.appendChild(cell);
            }
        }
    }
    
    // ホールドピースの表示を更新
    function updateHoldPieceDisplay(holdPiece) {
        if (!holdPieceDisplay) return;
        holdPieceDisplay.innerHTML = '';
        
        if (!holdPiece) return;
        
        // 4x4のグリッドを作成
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const cell = document.createElement('div');
                cell.classList.add('tetris-cell');
                
                // ピースの形状に基づいてセルを塗る
                if (y < holdPiece.shape.length && x < holdPiece.shape[0].length && holdPiece.shape[y][x] !== 0) {
                    cell.classList.add(holdPiece.className);
                }
                
                holdPieceDisplay.appendChild(cell);
            }
        }
    }
    
    // ラインクリアのアニメーション
    function animateLineClear(linesToClear) {
        linesToClear.forEach(y => {
            for (let x = 0; x < TetrisBoard.WIDTH; x++) {
                const index = y * TetrisBoard.WIDTH + x;
                const cell = gameBoard.children[index];
                if (cell) {
                    cell.classList.add('clear-line');
                }
            }
        });
    }
    
    // ゲームオーバーアニメーション
    function animateGameOver() {
        gameBoard.classList.add('shake');
        setTimeout(() => {
            gameBoard.classList.remove('shake');
        }, 500);
    }
    
    // レベルアップアニメーション
    function animateLevelUp(levelDisplay) {
        levelDisplay.classList.add('pulse');
        setTimeout(() => {
            levelDisplay.classList.remove('pulse');
        }, 500);
    }
    
    // 公開API
    return {
        init,
        renderBoard,
        updateNextPieceDisplay,
        updateHoldPieceDisplay,
        animateLineClear,
        animateGameOver,
        animateLevelUp
    };
})();
