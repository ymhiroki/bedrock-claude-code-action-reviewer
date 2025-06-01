/**
 * game.js - ゲームのメインロジック
 * Tailwind Tetris v1.0.0
 */

// テトリスのゲームロジック用の名前空間
const TetrisGame = (function() {
    // ゲーム状態
    let currentPiece = null;
    let nextPiece = null;
    let holdPiece = null;
    let ghostPiece = null;
    let canHold = true;
    let gameInterval = null;
    let isPaused = false;
    let isGameOver = false;
    let isPlaying = false;
    let dropSpeed = 1000; // ミリ秒
    
    // ゲームの初期化
    function init() {
        // ボードの初期化
        TetrisBoard.initBoard();
        
        // ゲーム状態のリセット
        currentPiece = null;
        nextPiece = null;
        holdPiece = null;
        ghostPiece = null;
        canHold = true;
        isPaused = false;
        isGameOver = false;
        isPlaying = false;
        dropSpeed = 1000;
        
        // 統計のリセット
        TetrisPieces.resetStats();
        
        // UIのリセット
        TetrisUI.resetUI();
    }
    
    // ゲームの開始
    function start() {
        if (isPlaying) return;
        
        // ゲーム状態のリセット
        init();
        isPlaying = true;
        
        // ボタンの状態を更新
        TetrisUI.updateButtons({
            isPlaying: true,
            isGameOver: false
        });
        
        // 最初のピースを追加
        addNewPiece();
        
        // ゲームループの開始
        startGameInterval();
        
        // 効果音を再生
        TetrisUtils.playSound('start');
    }
    
    // ゲームの一時停止/再開
    function togglePause() {
        if (isGameOver || !isPlaying) return;
        
        isPaused = !isPaused;
        
        if (isPaused) {
            clearInterval(gameInterval);
            TetrisUI.togglePauseDisplay(true);
            
            // 効果音を再生
            TetrisUtils.playSound('pause');
        } else {
            startGameInterval();
            TetrisUI.togglePauseDisplay(false);
            
            // 効果音を再生
            TetrisUtils.playSound('resume');
        }
    }
    
    // ゲームオーバー処理
    function gameOver() {
        clearInterval(gameInterval);
        isGameOver = true;
        isPlaying = false;
        
        // ゲームオーバー表示
        TetrisUI.showGameOver();
        
        // ボタンの状態を更新
        TetrisUI.updateButtons({
            isPlaying: false,
            isGameOver: true
        });
        
        // 効果音を再生
        TetrisUtils.playSound('gameover');
    }
    
    // ゲームループの開始
    function startGameInterval() {
        clearInterval(gameInterval);
        gameInterval = setInterval(() => {
            if (isValidMove(0, 1)) {
                currentPiece.position.y++;
                updateGhostPiece();
                render();
            } else {
                lockPiece();
            }
        }, dropSpeed);
    }
    
    // 新しいピースをボードに追加
    function addNewPiece() {
        if (!nextPiece) {
            nextPiece = TetrisPieces.getRandomPiece();
        }
        
        currentPiece = nextPiece;
        nextPiece = TetrisPieces.getRandomPiece();
        canHold = true;
        
        // 表示の更新
        TetrisRenderer.updateNextPieceDisplay(nextPiece);
        TetrisUI.updateStats();
        
        // ゲームオーバーチェック
        if (!isValidMove(0, 0)) {
            gameOver();
            return;
        }
        
        updateGhostPiece();
        render();
    }
    
    // ピースの移動が有効かチェック
    function isValidMove(moveX, moveY) {
        if (!currentPiece) return false;
        return TetrisBoard.isValidMove(currentPiece, moveX, moveY);
    }
    
    // ピースの回転
    function rotatePiece() {
        if (!currentPiece || !isPlaying || isPaused) return;
        
        // 回転後のピースを取得
        const rotatedPiece = TetrisPieces.rotatePiece(currentPiece);
        
        // 回転が有効かチェック（壁蹴りも試す）
        const kicks = [
            { x: 0, y: 0 },   // 通常位置
            { x: -1, y: 0 },  // 左に1マス
            { x: 1, y: 0 },   // 右に1マス
            { x: 0, y: -1 },  // 上に1マス
            { x: -2, y: 0 },  // 左に2マス
            { x: 2, y: 0 },   // 右に2マス
        ];
        
        let validRotation = false;
        
        for (const kick of kicks) {
            const testX = currentPiece.position.x + kick.x;
            const testY = currentPiece.position.y + kick.y;
            
            const testPiece = {
                ...rotatedPiece,
                position: { x: testX, y: testY }
            };
            
            if (TetrisBoard.isValidMove(testPiece, 0, 0)) {
                currentPiece = testPiece;
                validRotation = true;
                break;
            }
        }
        
        if (validRotation) {
            // 効果音を再生
            TetrisUtils.playSound('rotate');
            
            updateGhostPiece();
            render();
        }
    }
    
    // ピースを固定してボードに追加
    function lockPiece() {
        if (!currentPiece) return;
        
        // ボードにピースを固定
        TetrisBoard.lockPiece(currentPiece);
        
        // 効果音を再生
        TetrisUtils.playSound('lock');
        
        // ラインのクリアをチェック
        const { linesCleared, linesToClear } = TetrisBoard.checkLines();
        
        if (linesCleared > 0) {
            // アニメーション
            TetrisRenderer.animateLineClear(linesToClear);
            
            // スコアの更新
            TetrisUI.addLineScore(linesCleared);
            
            // ラインカウントの更新とレベルアップチェック
            const leveledUp = TetrisUI.addLines(linesCleared);
            
            if (leveledUp) {
                // レベルに応じて速度を更新
                const scoreInfo = TetrisUI.getScoreInfo();
                dropSpeed = TetrisUtils.calculateDropSpeed(scoreInfo.level);
            }
            
            // 効果音を再生
            TetrisUtils.playSound('clear');
            
            // 少し遅延してから次のピースを追加
            setTimeout(() => {
                render();
                addNewPiece();
            }, 300);
        } else {
            // 次のピースを追加
            addNewPiece();
        }
    }
    
    // ピースのホールド
    function holdCurrentPiece() {
        if (!currentPiece || !isPlaying || isPaused || !canHold) return;
        
        // 効果音を再生
        TetrisUtils.playSound('hold');
        
        if (!holdPiece) {
            // 初めてのホールド
            holdPiece = {
                shape: JSON.parse(JSON.stringify(TetrisPieces.PIECES[currentPiece.type].shape)),
                className: currentPiece.className,
                type: currentPiece.type
            };
            addNewPiece();
        } else {
            // ホールドピースと現在のピースを交換
            const tempPiece = {
                shape: JSON.parse(JSON.stringify(TetrisPieces.PIECES[currentPiece.type].shape)),
                className: currentPiece.className,
                type: currentPiece.type
            };
            
            currentPiece = {
                shape: JSON.parse(JSON.stringify(TetrisPieces.PIECES[holdPiece.type].shape)),
                className: holdPiece.className,
                position: { x: Math.floor((TetrisBoard.WIDTH - TetrisPieces.PIECES[holdPiece.type].shape[0].length) / 2), y: 0 },
                type: holdPiece.type
            };
            
            holdPiece = tempPiece;
        }
        
        canHold = false;
        TetrisRenderer.updateHoldPieceDisplay(holdPiece);
        updateGhostPiece();
        render();
    }
    
    // ゴーストピースの更新
    function updateGhostPiece() {
        if (!currentPiece) return;
        ghostPiece = TetrisBoard.calculateGhostPosition(currentPiece);
    }
    
    // ハードドロップ（即座に落下）
    function hardDrop() {
        if (!currentPiece || !isPlaying || isPaused) return;
        
        // 効果音を再生
        TetrisUtils.playSound('harddrop');
        
        // 可能な限り下に移動
        while (isValidMove(0, 1)) {
            currentPiece.position.y++;
            TetrisUI.addScore(2); // ハードドロップボーナス
        }
        
        render();
        lockPiece();
    }
    
    // ソフトドロップ（高速落下）
    function softDrop() {
        if (!currentPiece || !isPlaying || isPaused) return;
        
        if (isValidMove(0, 1)) {
            currentPiece.position.y++;
            TetrisUI.addScore(1); // ソフトドロップボーナス
            updateGhostPiece();
            render();
        }
    }
    
    // 左に移動
    function moveLeft() {
        if (!currentPiece || !isPlaying || isPaused) return;
        
        if (isValidMove(-1, 0)) {
            currentPiece.position.x--;
            updateGhostPiece();
            render();
        }
    }
    
    // 右に移動
    function moveRight() {
        if (!currentPiece || !isPlaying || isPaused) return;
        
        if (isValidMove(1, 0)) {
            currentPiece.position.x++;
            updateGhostPiece();
            render();
        }
    }
    
    // ゲームボードのレンダリング
    function render() {
        const board = TetrisBoard.getBoard();
        TetrisRenderer.renderBoard(board, currentPiece, ghostPiece);
    }
    
    // ゲーム状態の取得
    function getGameState() {
        return {
            isPlaying,
            isPaused,
            isGameOver,
            currentPiece,
            nextPiece,
            holdPiece,
            canHold,
            dropSpeed
        };
    }
    
    // 公開API
    return {
        init,
        start,
        togglePause,
        moveLeft,
        moveRight,
        rotatePiece,
        softDrop,
        hardDrop,
        holdCurrentPiece,
        getGameState,
        render
    };
})();
