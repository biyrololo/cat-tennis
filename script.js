const hitBtn = document.getElementById('hit');
const racket = document.getElementById('racket');
const score = document.getElementById('score');
const best = document.getElementById('best');
const ball = document.getElementById('ball');
const main = document.querySelector('main');
const cat = document.getElementById('cat');

const otskokWav = new Audio();
otskokWav.src = 'audio/otskok.wav';

const udarWav = new Audio();
udarWav.src = 'audio/udar.wav';

const gameTheme = new Audio();
gameTheme.src = 'audio/game.mp3';

udarWav.volume = 0.8;
otskokWav.volume = 1;
gameTheme.volume = 0.8;

const THEMES = [
    {
        color: '#005e27', 
        image: 'cat.png'
    }, 
    {
        color: '#570208',
        image: 'evil_cat.png'
    }
];

const racket_anim_shift = 170;

best.textContent = `BEST: ${localStorage.getItem('best_score') || 0}`;

var animInterval, timingInterval;
var timing = 0;
var did_hit = true;
/**
 * @typedef {'menu' | 'game'} GAME_STATE
 */

/**
 * @type {GAME_STATE}
 */
var game_state = 'menu';

Audio.prototype.stop = function(){
    this.pause();
    this.currentTime = 0;
}

function startGame(){
    gameTheme.play();
    gameTheme.loop = true;
    timing = 0;
    score.dataset.active = "true";
    score.textContent = 0;
    hitBtn.removeEventListener('click', startGame);
    hitBtn.textContent = 'HIT';
    hitBtn.addEventListener('click', hit);
    ball.dataset.active = "true";
    animInterval = setInterval(function(){
        setTimeout(function(){
            racket.dataset.active = "true";
        }, racket_anim_shift)
        setTimeout(function(){
            udarWav.stop();
            udarWav.play();
        }, 580)
        setTimeout(function(){
            racket.dataset.active = "false";
            did_hit = false;
        }, 1200 + racket_anim_shift);
    }, 1500);
    timing = 0;
    timingInterval = setInterval(function(){
        timing++;
        timing = timing % 15;
        if(timing >= 2 && timing < 7 && !did_hit){
            gameOver();
        }
    }, 100);
}

function gameOver(){
    gameTheme.stop();
    const cur_score = parseInt(score.textContent);
    const best_score = parseInt(best.textContent.split(' ')[1]);
    if(cur_score > best_score){
        localStorage.setItem('best_score', cur_score);
        best.textContent = `BEST: ${cur_score}`;
    }
    game_state = 'menu';
    renderMenu();
}

function isTimingInRange(){
    return timing < 2 || timing > 12;
}

function hit(){
    if(did_hit){
        gameOver();
    }
    did_hit = true;
    if(!isTimingInRange()){
        gameOver();
    }
    else{
        otskokWav.play();
        const newScore = parseInt(score.textContent) + 1;
        score.textContent = newScore;
        if(newScore % 10 >= 5){
            main.style = `--main-color: ${THEMES[1].color};`;
            cat.src = `static/${THEMES[1].image}`;
        }
        else{
            main.style = `--main-color: ${THEMES[0].color};`;
            cat.src = `static/${THEMES[0].image}`;
        }
    }
}

function renderMenu(){
    clearInterval(animInterval);
    clearInterval(timingInterval);
    score.dataset.active = "hidden";
    hitBtn.textContent = 'START';
    ball.dataset.active = "hidden";
    racket.dataset.active = "hidden";
    main.style = `--main-color: ${THEMES[0].color};`;
    const newSrc = `static/${THEMES[0].image}`
    if(cat.src != newSrc){
        cat.src = newSrc;
    }
    hitBtn.addEventListener('click', startGame);
}

renderMenu();