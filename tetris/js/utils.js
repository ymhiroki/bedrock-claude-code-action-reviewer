/**
 * utils.js - 汎用関数
 * Tailwind Tetris v1.0.0
 */

// テトリスのユーティリティ用の名前空間
const TetrisUtils = (function() {
    // バージョン情報
    const VERSION = '1.0.0';
    const VERSION_DATE = '2025-06-01';
    
    // 効果音の再生（実装は省略）
    function playSound(type) {
        // 実際の効果音実装はここに追加
        // console.log(`Playing sound: ${type}`);
    }
    
    // ドロップスピードの計算
    function calculateDropSpeed(level) {
        return Math.max(100, 1000 - (level - 1) * 100); // レベルに応じて速度を上げる
    }
    
    // バージョン情報の表示
    function initVersionInfo() {
        const versionElement = document.querySelector('.version');
        if (versionElement) {
            versionElement.textContent = `Version ${VERSION}`;
            versionElement.setAttribute('title', `Last updated: ${VERSION_DATE}`);
            
            // バージョン番号をクリックしたときの処理
            versionElement.addEventListener('click', () => {
                alert(`Tailwind Tetris\nVersion: ${VERSION}\nLast updated: ${VERSION_DATE}\n\nChangelog:\n- Initial release\n- Added ghost piece feature\n- Added hold piece feature\n- Fixed line clearing bug`);
            });
        }
    }
    
    // 公開API
    return {
        VERSION,
        VERSION_DATE,
        playSound,
        calculateDropSpeed,
        initVersionInfo
    };
})();
