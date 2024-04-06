const hitBtn = document.getElementById('hit');
const racket = document.getElementById('racket');
const score = document.getElementById('score');
const best = document.getElementById('best');
const ball = document.getElementById('ball');
const main = document.querySelector('main');
const cat = document.getElementById('cat');
const cat_block = document.getElementById('cat-block');

let anim_scale = 2;
let is_training = 3;

const otskokWav = new Audio();
otskokWav.src = 'audio/otskok.wav';

const udarWav = new Audio();
udarWav.src = 'audio/udar.wav';

const gameTheme = new Audio();
gameTheme.src = 'audio/game.mp3';

udarWav.volume = 0.8;
otskokWav.volume = 1;
gameTheme.volume = 0.8;

var anims_timeouts = new Array(6);

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
var first_loop = true;

function updateAnimScale(newScale, did_hit_ = true){
    first_loop = true;
    console.log('запуск', newScale, did_hit_)
    ball.dataset.active = "false";
    racket.dataset.active = "false";
    did_hit = did_hit_;
    console.log(did_hit)
    anim_scale = newScale;
    cat_block.style.setProperty('--anim-scale', anim_scale);
    anims_timeouts.forEach(timeout => clearTimeout(timeout));
    clearInterval(animInterval);
    clearInterval(timingInterval);
    animInterval = setInterval(function(){
        anims_timeouts[3] = setTimeout(function(){
            racket.dataset.active = "true";
        }, racket_anim_shift)
        anims_timeouts[4] = setTimeout(function(){
            udarWav.stop();
            udarWav.play();
        }, 580 * anim_scale);
        anims_timeouts[5] = setTimeout(function(){
            console.log('убрали 1', did_hit)
            racket.dataset.active = "false";
            did_hit = false;
        }, (1200 + racket_anim_shift) * anim_scale);
    }, 1500 * anim_scale);
    anims_timeouts[0] = setTimeout(
        ()=>{
            ball.dataset.active = "true";
        },
        0
    )
    anims_timeouts[1] = setTimeout(
        ()=>{
            racket.dataset.active = "true";
        },
        racket_anim_shift * anim_scale
    )
    anims_timeouts[2] = setTimeout(
        ()=>{
            did_hit = false;
            console.log('убрали 2', did_hit)
            racket.dataset.active = "false";
        },
        (1200 + racket_anim_shift) * anim_scale
    )


    timing = 0;
    timingInterval = setInterval(function(){
        timing++;
        if(timing === 15){
            first_loop = false;
            is_training--;
            const cur_score = parseInt(score.textContent);
            if(is_training === 1){
                updateAnimScale(1, did_hit);
            }
            if(is_training === 0){
                hitBtn.dataset.training = 'false';
                hitBtn.textContent = 'HIT';
            }
        }
        timing = timing % 15;
        if(is_training > 0 && timing > 2){
            console.log('о', timing, is_training)
            if(isTimingInRange(timing, true)){
                console.log('н')
                hitBtn.textContent = 'CLICK'
                hitBtn.dataset.training = 'true';
            }
            else{
                hitBtn.textContent = 'HIT';
                hitBtn.dataset.training = 'false';
            }
        }
        console.log(timing, did_hit)
        if(timing >= 2 && timing < 7 && !did_hit){
            console.log('ЧЁ')
            gameOver();
        }
    }, 100 * anim_scale);
}

function startGame(){
    is_training = 3;
    cat_block.style.setProperty('--anim-scale', anim_scale);
    gameTheme.play();
    gameTheme.loop = true;
    timing = 0;
    anim_scale = 2;
    score.dataset.active = "true";
    score.textContent = 0;
    hitBtn.removeEventListener('click', startGame);
    hitBtn.textContent = 'HIT';
    hitBtn.addEventListener('click', hit);
    did_hit = true;
    updateAnimScale(anim_scale, true);
}

function gameOver(){
    anims_timeouts.forEach(timeout => clearTimeout(timeout));
    clearInterval(animInterval);
    clearInterval(timingInterval);
    racket.dataset.active = "false";
    is_training = false;
    timing = 0;
    udarWav.stop();
    otskokWav.stop();
    gameTheme.stop();
    const cur_score = parseInt(score.textContent);
    const best_score = parseInt(best.textContent.split(' ')[1]);
    if(cur_score > best_score){
        localStorage.setItem('best_score', cur_score);
        best.textContent = `BEST: ${cur_score}`;
    }
    game_state = 'menu';
    anim_scale = 1;
    renderMenu();
}

function isTimingInRange(){
    return timing < 2 || timing > 12;
}

function hit(){
    console.log('нажал')
    if(did_hit){
        console.log('уже нажал')
        gameOver();
    }
    did_hit = true;
    if(!isTimingInRange()){
        console.log('о', timing, is_training)
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