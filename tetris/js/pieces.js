/**
 * pieces.js - テトリミノの定義と操作を管理
 * Tailwind Tetris v1.0.0
 */

// テトリスのピース管理用の名前空間
const TetrisPieces = (function() {
    // テトリミノの形状定義
    const PIECES = {
        i: {
            shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            className: 'piece-i'
        },
        j: {
            shape: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            className: 'piece-j'
        },
        l: {
            shape: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            className: 'piece-l'
        },
        o: {
            shape: [
                [1, 1],
                [1, 1]
            ],
            className: 'piece-o'
        },
        s: {
            shape: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            className: 'piece-s'
        },
        t: {
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            className: 'piece-t'
        },
        z: {
            shape: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            className: 'piece-z'
        }
    };
    
    // 統計情報
    let stats = {
        i: 0,
        j: 0,
        l: 0,
        o: 0,
        s: 0,
        t: 0,
        z: 0
    };
    
    // ランダムなピースの生成
    function getRandomPiece() {
        const pieceTypes = Object.keys(PIECES);
        const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        const piece = PIECES[randomType];
        
        // 統計を更新
        stats[randomType]++;
        
        return {
            shape: JSON.parse(JSON.stringify(piece.shape)), // ディープコピー
            className: piece.className,
            position: { x: Math.floor((TetrisBoard.WIDTH - piece.shape[0].length) / 2), y: 0 },
            type: randomType
        };
    }
    
    // ピースの回転
    function rotatePiece(piece) {
        if (!piece || piece.type === 'o') return piece; // Oピースは回転しない
        
        const originalShape = piece.shape;
        const rows = originalShape.length;
        const cols = originalShape[0].length;
        
        // 新しい回転した形状を作成
        const rotatedShape = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                rotatedShape[x][rows - 1 - y] = originalShape[y][x];
            }
        }
        
        // 回転後の形状を返す
        return {
            ...piece,
            shape: rotatedShape
        };
    }
    
    // 統計情報の取得
    function getStats() {
        return { ...stats };
    }
    
    // 統計情報のリセット
    function resetStats() {
        stats = {
            i: 0,
            j: 0,
            l: 0,
            o: 0,
            s: 0,
            t: 0,
            z: 0
        };
    }
    
    // 公開API
    return {
        PIECES,
        getRandomPiece,
        rotatePiece,
        getStats,
        resetStats
    };
})();
