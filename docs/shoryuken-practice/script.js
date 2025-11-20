const translations = {
    ja: {
        title: "昇竜拳練習",
        target: "昇竜拳用のボタン",
        precount: "前回のカウント：",
        connect: "コントローラーを接続してください"
    },
    en: {
        title: "Shoryuken Practice",
        target: "Your Buttons for Shoryuken",
        precount: "Previous count：",
        connect: "Connect your controller"
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

function judgeLanguage(ja, en) {
    if (document.getElementById('language-select').value == 'ja') {
        return ja;
    } else {
        return en;
    }
}

let count = 0;
let prevCountValue = 0;
let total = [0, 0];
const DIR_UP = 12;
const DIR_DOWN = 13;
const DIR_LEFT = 14;
const DIR_RIGHT = 15;
const commands = [[3, 2, 3], [6, 2, 3], [6, 3, 6]];

const inputHistory = Array(20).fill(5);
let prevButtons = {};

const targetButtons = [0, 1, 5];
let activeSelectorIndex = null;
let waitingForRelease = false;

let render = true;
let division = 5;
let side = 1;
let divButton = [false, false, false];

function activateSelector(index) {
    document.querySelectorAll('.button-select').forEach(e => e.classList.remove('active'));
    document.querySelector(`.button-select[data-index='${index}']`).classList.add('active');
    activeSelectorIndex = index;
}

document.getElementById('back').addEventListener('click', e => {
    if (prevCountValue != 0) {
        count = prevCountValue;
        prevCountValue = 0;
        document.getElementById('count').textContent = count;
        document.getElementById('prevCount').textContent = prevCountValue;
    }
});

document.getElementById('increase').addEventListener('click', e => increase());

document.getElementById('decrease').addEventListener('click', e => decrease());

document.getElementById('reset').addEventListener('click', e => reset());

document.querySelectorAll('.button-select').forEach(el => {
    el.addEventListener('click', () => {
        const index = parseInt(el.dataset.index);
        activateSelector(index);
    });
});

document.getElementById('invertToggle').addEventListener('change', e => {
    side = e.target.checked ? 2:1;
    let elements = Array.from(document.getElementsByClassName('total'));
    elements.forEach(x =>{
        x.classList.toggle('countSide');
        x.classList.toggle('otherSide');
    });
});

function getDirectionValue(up, down, left, right) {
    if (side == 2) {
        let tmp = left;
        left = right;
        right = tmp;
    }
    if (up && left) return 7;
    if (up && right) return 9;
    if (down && left) return 1;
    if (down && right) return 3;
    if (up) return 8;
    if (down) return 2;
    if (left) return 4;
    if (right) return 6;
    return 5;
}

function checkSequence() {
    const len = inputHistory.length;
    for (let c = 0; c < commands.length; c++) {
        for (let i = len - 1; i >= Math.max(0, len - 7); i--) {
            if (inputHistory[i] === commands[c][2]) {
                for (let j = i - 1; j >= Math.max(0, i - 7); j--) {
                    if (inputHistory[j] === commands[c][1]) {
                        for (let k = j - 1; k >= Math.max(0, j - 7); k--) {
                            if (inputHistory[k] === commands[c][0]) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
    return false;
}

function increase(){
    document.getElementById('count').textContent = ++count;
    document.getElementById('count' + side + 'p').textContent = ++total[side-1];
}

function decrease(){
    if (count != 0) {
        document.getElementById('count').textContent = --count;
    }
    document.getElementById('count' + side + 'p').textContent = --total[side-1];
}

function reset(){
    if (count != 0) {
        prevCountValue = count;
        count = 0;
        document.getElementById('count').textContent = count;
        document.getElementById('prevCount').textContent = prevCountValue;
    }
}

function loop() {
    setTimeout(function () {
        const pad = (navigator.getGamepads && navigator.getGamepads()[0]) || null;
        if (!pad) {
            document.getElementById('status').textContent = judgeLanguage('コントローラーを接続してください', 'Connect your controller');
            return requestAnimationFrame(loop);
        } else {
            document.getElementById('status').textContent = judgeLanguage('コントローラー接続中', 'Conected the controller') + '：' + pad.id;
        }

        const now = {};
        pad.buttons.forEach((btn, i) => { now[i] = btn.pressed; });

        if (activeSelectorIndex !== null && !waitingForRelease) {
            for (let i = 0; i < pad.buttons.length; i++) {
                if (now[i]) {
                    // もし他の登録済みのボタンに割り当てられていたら解除
                    for (let j = 0; j < targetButtons.length; j++) {
                        if (j !== activeSelectorIndex && targetButtons[j] === i) {
                            targetButtons[j] = null;
                            document.querySelector(`.button-select[data-index='${j}']`).textContent = '未登録';
                        }
                    }
                    if (targetButtons[activeSelectorIndex] === i) {
                        targetButtons[activeSelectorIndex] = null;
                        document.querySelector(`.button-select[data-index='${activeSelectorIndex}']`).textContent = '未登録';
                    } else {
                        targetButtons[activeSelectorIndex] = i;
                        document.querySelector(`.button-select[data-index='${activeSelectorIndex}']`).textContent = 'Button ' + i;
                    }
                    waitingForRelease = true;
                    break;
                }
            }
        }

        if (render) {
            if (waitingForRelease) {
                const anyPressed = Object.values(now).some(v => v);
                if (!anyPressed) {
                    waitingForRelease = false;
                    if (activeSelectorIndex !== null && activeSelectorIndex < 2) {
                        activateSelector(activeSelectorIndex + 1);
                    } else {
                        document.querySelectorAll('.button-select').forEach(e => e.classList.remove('active'));
                        activeSelectorIndex = null;
                    }
                }
            }

            let dirVal = getDirectionValue(now[DIR_UP], now[DIR_DOWN], now[DIR_LEFT], now[DIR_RIGHT]);
            if (inputHistory[inputHistory.length - 1] === dirVal && dirVal != division && dirVal != 5) {
                dirVal = division;
            }
            inputHistory.shift();
            inputHistory.push(dirVal);

            for (let i = 0; i < targetButtons.length; i++) {
                idx = targetButtons[i];
                if (idx !== null && (now[idx] || divButton[i]) && !prevButtons[idx]) {
                    if (checkSequence()) {
                        increase();
                    } else {
                        reset();
                    }
                }
            }
            prevButtons = { ...now };
        } else {
            division = getDirectionValue(now[DIR_UP], now[DIR_DOWN], now[DIR_LEFT], now[DIR_RIGHT]);
            for (let i = 0; i < targetButtons.length; i++) {
                idx = targetButtons[i];
                if (idx !== null && now[idx] && !prevButtons[idx]) {
                    divButton[i] = true;
                } else {
                    divButton[i] = false;
                }
            }
        }
        render = !render;

        requestAnimationFrame(loop);
    }, 1000 / 120);
}

// requestAnimationFrame(loop);
loop();