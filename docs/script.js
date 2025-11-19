const translations = {
    ja: {
        title: "ツール一覧",
        CDC: "コンボダメージ計算機"
    },
    en: {
        title: "List of Tools",
        CDC: "Combo Damage Caluculator"
    }
};

function setLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
}

// ユーザーのブラウザ言語設定を取得
let userLanguage = navigator.language || navigator.userLanguage;
if (userLanguage.startsWith('ja')) {
    setLanguage('ja');
    document.getElementById('language-select').value = 'ja';
} else {
    setLanguage('en');
    document.getElementById('language-select').value = 'en';
}

document.getElementById('language-select').addEventListener('change', (e) => {
    setLanguage(e.target.value);
});