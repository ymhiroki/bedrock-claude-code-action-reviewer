/**
 * board.js - ゲームボードの状態管理
 * Tailwind Tetris v1.0.0
 */

// テトリスのボード管理用の名前空間
const TetrisBoard = (function() {
    // 定数
    const WIDTH = 10;
    const HEIGHT = 20;
    const EMPTY_CELL = 0;
    
    // ゲームボード
    let board = [];
    
    // ボードの初期化
    function initBoard() {
        board = Array(HEIGHT).fill().map(() => Array(WIDTH).fill(EMPTY_CELL));
        return board;
    }
    
    // ボードの取得
    function getBoard() {
        return board;
    }
    
    // ピースの移動が有効かチェック
    function isValidMove(piece, moveX, moveY) {
        const { shape, position } = piece;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 0) {
                    const newX = position.x + x + moveX;
                    const newY = position.y + y + moveY;
                    
                    // ボード外チェック
                    if (newX < 0 || newX >= WIDTH || newY >= HEIGHT) {
                        return false;
                    }
                    
                    // 他のピースとの衝突チェック
                    if (newY >= 0 && board[newY][newX] !== EMPTY_CELL) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    // ピースを固定してボードに追加
    function lockPiece(piece) {
        const { shape, position, className } = piece;
        
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const boardX = position.x + x;
                    const boardY = position.y + y;
                    
                    if (boardY >= 0 && boardY < HEIGHT && boardX >= 0 && boardX < WIDTH) {
                        board[boardY][boardX] = className;
                    }
                }
            });
        });
    }
    
    // ラインのクリアをチェック
    function checkLines() {
        let linesCleared = 0;
        const linesToClear = [];
        
        // 消去するラインを特定
        for (let y = HEIGHT - 1; y >= 0; y--) {
            if (board[y].every(cell => cell !== EMPTY_CELL)) {
                linesToClear.push(y);
                linesCleared++;
            }
        }
        
        // ラインを削除
        if (linesCleared > 0) {
            // ラインを下から順に削除（インデックスがずれないように）
            linesToClear.sort((a, b) => b - a).forEach(lineY => {
                board.splice(lineY, 1);
                board.unshift(Array(WIDTH).fill(EMPTY_CELL));
            });
        }
        
        return {
            linesCleared,
            linesToClear
        };
    }
    
    // ゴーストピースの位置を計算
    function calculateGhostPosition(piece) {
        if (!piece) return null;
        
        // 現在のピースのコピーを作成
        const ghostPiece = {
            ...piece,
            position: { ...piece.position }
        };
        
        // 可能な限り下に移動
        while (isValidMove(ghostPiece, 0, 1)) {
            ghostPiece.position.y++;
        }
        
        return ghostPiece;
    }
    
    // 公開API
    return {
        WIDTH,
        HEIGHT,
        EMPTY_CELL,
        initBoard,
        getBoard,
        isValidMove,
        lockPiece,
        checkLines,
        calculateGhostPosition
    };
})();
