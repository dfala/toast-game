var canJump = true;
var canPlay = true;
var isStoping = false;
var obstacleNum = 0;
// var timerArray = [4000, 3000, 2800, 3100, 3800, 4800];
var pugPredator = 1800;
var timerArray = [2100, pugPredator, 2200, 2000, 2400];
var newToaster = '';
var collisionCheck = '';
var gamesPlayed = 0;
var score = 0;
var bestScore = 0;
var goal = $('#goal').offset().left;


////////////
// JUMPING
////////////

function jumpTrigger (up, top) {
  if (!canJump) return;
  jumpSound.play();
  canJump = false;

  jump(up, top);
}

function jump(up, top){
  /*
   * We change J to his jumping sprite ...
   */
  document.getElementById('j').style.backgroundPosition = "-160px 0px";
  /*
   * Here, we need to decide whether he should be traveling up or down...
   */
  if (up && (document.getElementById('j').offsetTop > 20)){
    // if he is currently moving up, and he is more than 20 pixels from the top of the stage ...
    top = top - (top * .1); // This gives us a slight arc in the jump, rather than a constant movement like running
    document.getElementById('j').style.top = top+"px"; // Change his position
    timer = setTimeout(function(){jump(up, top);}, 20); // Then call the function again
  } else if (up) {
    // if he is currently moving up, but he is almost at the top of the stage and needs to come back down...
    up = false; // we switch the 'up' variable so he will be falling in the next loop
    timer = setTimeout(function(){jump(up, top);}, 15);
  } else if (!up && (document.getElementById('j').offsetTop < 115)){
    // if he is moving down, but is more than 5px from the ground, he will continue to fall...
    top = top + (top * .1); // His fall will slightly accelerate
    document.getElementById('j').style.top = top+"px";
    timer = setTimeout(function(){jump(up, top);}, 15);
  } else {
    // If he is moving down, and he is within 5px of the ground...
    document.getElementById('j').style.top = "120px"; // Place him on the ground
    canJump = true;
    document.getElementById('j').style.backgroundPosition = "0px 0px"; // return to standing sprite
    // We do not call the loop anymore since he is standing still at this point
  }
}

/////////////
// PLAY GAME
/////////////

var playingGame = false;

// jumping on space bar key press
$(window).keypress(function(e) {
  if (e.keyCode == 32) {
    jumpTrigger(true, document.getElementById('j').offsetTop);
  }

  if (e.which == 13 || e.keycode == 13) {
    // location.reload();
    triggerPlay();
  }
});

function triggerPlay () {
  if (isStoping || playingGame) return;
  $('#game-over').css('display', 'none');
  $('#instruction').css('display', 'none');
  startSound.play();
  playingGame = true;
  

  // leave focus on btn to avoid space bar triggering
  $('#play-btn').blur();

  score = 0;
  $('#score').text('Score: ' + score);

  jQuery('<div/>', {
    id: 'toaster0',
    class: 'toaster'
  }).appendTo('#stage');

  gamesPlayed++;
  play();
}

function play () {
  // evil obstacles
  if (!canPlay) return stopPlaying();
  backgroundSound.play();

  obstacleToAnimate = '#toaster' + obstacleNum;

  var randomTimer = timerArray[Math.floor(Math.random() * timerArray.length)];

  if (randomTimer == pugPredator) { $(obstacleToAnimate).addClass('pug'); };

  $(obstacleToAnimate).animate({
      right: '120%'
  }, randomTimer, function () {
    if (!isStoping || !canPlay) {
      
      if (randomTimer == pugPredator) {
        score = score + 15;
      } else {
        score = score + 5;
      }

      if (score > bestScore) {
        bestScore = score;
        $('#record-score').text('Best score: ' + bestScore);
      }

      $('#score').text('Score: ' + score);
    }
  });

  detectGameOver(obstacleToAnimate);

  obstacleNum++;

  newToaster = setTimeout(function () {
    jQuery('<div/>', {
      id: 'toaster' + obstacleNum,
      class: 'toaster'
    }).appendTo('#stage');

    play();
  }, 900)
}

/////////////
// GAME OVER
/////////////

function stopPlaying () {
  if(isStoping) return;
  isStoping = true;
  clearTimeout(newToaster);
  $(".toaster").stop();
  backgroundSound.pause();
  backgroundSound.currentTime = 0;

  window.clearInterval(collisionCheck);

  $(".toaster").remove();
  obstacleNum = 0;
  canPlay = true;
  playingGame = false;
  isStoping = false;

  deathSound.play();
  $('#game-over').css('display', 'block');
}

function detectGameOver (toasterDiv) {
  collisionCheck = window.setInterval(function() {
    if (!$(toasterDiv).offset()) return;
    if (collision( $('#j'), $(toasterDiv)) ) {
      canPlay = false;
      return stopPlaying();
    }
      
  });
}

function collision (toast, toaster) {
  if (!toaster.offset()) return;
  var x1 = toast.offset().left;
  var y1 = toast.offset().top;
  var h1 = toast.outerHeight(true);
  var w1 = toast.outerWidth(true);
  var b1 = y1 + h1;
  var r1 = x1 + w1;
  var x2 = toaster.offset().left;
  var y2 = toaster.offset().top;
  var h2 = toaster.outerHeight(true);
  var w2 = toaster.outerWidth(true);
  var b2 = y2 + h2;
  var r2 = x2 + w2;

  if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
  return true;
}

///////////////////
// COUNTING POINTS
///////////////////

function point (toaster) {
  console.log(checkPoint(goal, toaster));
}

function checkPoint (goalLeft, toaster) {
  if (!toaster.offset()) return;
  var toasterLeft = toaster.offset().left;

  if (toasterLeft <= goalLeft) return score++;
}

///////////
// SOUND
///////////

var jumpSound = document.createElement('audio');
jumpSound.setAttribute('src', 'jump.wav');

var deathSound = document.createElement('audio');
deathSound.setAttribute('src', 'death.wav');

var startSound = document.createElement('audio');
startSound.setAttribute('src', 'start.wav');

var backgroundSound = document.createElement('audio');
backgroundSound.setAttribute('src', 'toastgame.mp3');
backgroundSound.loop = true;