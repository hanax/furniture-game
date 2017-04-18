var LEVELS_PIECE = {
  1: 5,
  2: 5,
  3: 6,
  4: 4
};

var MAX_LEVEL = 4;

var POS_PIECE = {
  0: [50, 400],
  1: [200, 400],
  2: [350, 400],
  3: [500, 400],
  4: [650, 400],
  5: [800, 400],
};

var PROGRESS_IMAGES = [
  '1_1-1_1-2_1-3_1-4_1-5',
  '1_1-1_1-2_1-3_1-4',
  '1_1-1_1-2_1-3',
  '1_1-1_1-2',
  '1_1-1',
  '1_1-2',
  '1_1-3',
  '1_1-4',
  '1_1-1_1-2_1-3_1-5',
  '1_1-1_1-2_1-5',
  '1_1-1_1-5',
  '1_1-5',
  '2_2-1_2-2_2-3_2-4_2-5',
  '2_2-1_2-2_2-3_2-4',
  '2_2-1_2-2_2-3',
  '2_2-1_2-2',
  '2_2-1',
  '2_2-2',
  '2_2-3',
  '2_2-4',
  '2_2-1_2-2_2-3_2-5',
  '2_2-1_2-2_2-5',
  '2_2-1_2-5',
  '2_2-5',
  '3_3-1_3-2_3-3_3-4_3_5_3-6',
  '3_3-1_3-2_3-3_3-4_3-5',
  '3_3-1_3-2_3-3_3-4',
  '3_3-1_3-2_3-3',
  '3_3-1_3-2',
  '3_3-1',
  '4_4-1',
  '4_4-1_4-2',
  '4_4-1_4-2_4-3',
  '4_4-1_4-2_4-3_4-4'
];

var TIPS = {
  1: 'In traditional design, shapes are first conceived, and then fabricated. While this decoupling simplifies the design process, it can result in inefficient material usage, especially where off-cut pieces are hard to reuse.',
  2: 'Sustainable furniture is made from materials that have certain characteristics. These materials may be recycled or re-purposed. Anything that is made from materials that had previously been used for something else and are then re-used in the making of new furniture.',
  3: 'In traditional design, shapes are first conceived, and then fabricated. While this decoupling simplifies the design process, it can result in inefficient material usage, especially where off-cut pieces are hard to reuse.',
  4: 'Sustainable furniture is made from materials that have certain characteristics. These materials may be recycled or re-purposed. Anything that is made from materials that had previously been used for something else and are then re-used in the making of new furniture.'
};

var hitOptions = {
  segments: true,
  stroke: true,
  fill: true,
  tolerance: 5
};

var curLevel;
var curPieces = [];
var curMoneyLeft;
var playerName;
var bases;
var enableDoneBtn;
var nBase;
var base;
initializeLeaderboard();
initializeBase();
initializePath();

function isInside(target, container) {
  return target.position.x >= container.bounds.topLeft.x &&
    target.position.y >= container.bounds.topLeft.y &&
    target.position.x <= container.bounds.bottomRight.x &&
    target.position.y <= container.bounds.bottomRight.y &&
    !target.intersects(container);
}

function addOneMoreBase() {
  nBase ++;
  if (base) base.remove();
  base = new Path.Rectangle(
    new Rectangle(new Point(50, 100), new Size(100 * nBase, 200)));
  base.fillColor = '#FFD38A';
  base.shadowColor = 'rgba(0,0,0,.2)';
  base.shadowOffset = new Point(5, 5);
  base.sendToBack();
}

function initializeLeaderboard() {
  var scores = JSON.parse(localStorage.getItem('scores'));
  var order_scores = [];
  var max = -1;
  // rank scores
  for (var s in scores) {
    order_scores.push([s, scores[s]]);
  }
  order_scores.sort(function(a, b) {
    return b[1] - a[1];
  });

  var $s_li = $('<li/>')
    .html('<span class=\'fa fa-trophy\'></span> <span>' + order_scores[0][0] + ':\t' + '<span class=\'fa fa-dollar\'></span> <span>' + order_scores[0][1] + ' </span>')
    .appendTo($('#leaderboard'));
  for (var i = 1; i < order_scores.length; i ++) {
    var $s_li = $('<li/>')
      .html('<span class=\'fa fa-user-circle-o\'></span> <span>' + order_scores[i][0] + ':\t' + '<span class=\'fa fa-dollar\'></span> <span>' + order_scores[i][1] + ' </span>')
      .appendTo($('#leaderboard'));
  }
}

function initializeBase() {
  nBase = 0;
  addOneMoreBase();
}

function initializePath() {
  // project.activeLayer.removeChildren();
  $('#btn-done').addClass('btn--minor');

  curLevPieces = [];

  curLevel = localStorage.getItem('level') || 1;
  curMoneyLeft = localStorage.getItem('money') || 200;
  playerName = localStorage.getItem('name');
  $('.progress img').hide();

  if (curLevel == 1 && !playerName) {
    $('.init').show();
  }

  $('#money-left').text(curMoneyLeft);
  $('#home-name').text(playerName ? playerName + '\'s' : '');
  $('#level').text(curLevel);
  $('#tips').text(TIPS[curLevel]);
  $('.room img').attr('src', 'assets/' + (curLevel - 1) + '_room.svg');

  enableDoneBtn = false;

  var levels_piece_n = LEVELS_PIECE[curLevel];
  for (var i = 0; i < levels_piece_n; i ++) {
    (function(i){
      project.importSVG('assets/' + curLevel + '-' + (i+1) + '.svg', function(target) {
        curLevPieces[i] = target;
        target.scale(0.3, target.bounds.topLeft);
        target.position += new Point(POS_PIECE[i][0], POS_PIECE[i][1]);
        target.opacity = 0.8;
        target.onMouseDrag = function(event) {
          target.strokeColor = 'rgba(0,0,0,0.2)';
          target.position = event.point;
          if (isInside(target.children[0], base)) {
            base.strokeColor = 'rgba(100,255,100,0.5)';
            base.strokeWidth = 5;
          }
        };
        target.onMouseUp = function() {
          $('.warning').text('');
          var hasCollisions = false;
          var everythingInside = true;
          var insidePieceIdx = [];
          curLevPieces.forEach(function(cp, idx1) {
            cp.strokeWidth = 0;
            var inOneOfBases = false;
            base.strokeWidth = 0;
            if (isInside(cp.children[0], base)) {
              inOneOfBases = true;
            }
            if (!inOneOfBases) {
              everythingInside = false;
            } else {
              insidePieceIdx.push(idx1);
            }
            // curLevPieces.forEach(function(cpp, idx2) {
            //   if (idx1 === idx2) return;
            //   if (cpp.children[0].intersects(cp.children[0])) {
            //     cp.strokeColor = 'rgba(255,0,0,0.8)';
            //     cp.strokeWidth = 3;
            //     $('.warning').text('Please avoid overlays in pieces!');
            //     hasCollisions = true;
            //   }
            // });
          });
          setTimeout(function() {
            if (everythingInside) {
            // if (!hasCollisions && everythingInside) {
              enableDoneBtn = true;
              $('#btn-done').removeClass('btn--minor');
            } else {
              enableDoneBtn = false;
            }

            var filename = curLevel;
            for (var i = 0; i < insidePieceIdx.length; i ++) {
              filename += '_' + curLevel + '-' + (insidePieceIdx[i] + 1);
            }
            if (PROGRESS_IMAGES.indexOf(filename) < 0) return;
            filename = 'assets/' + filename + '.svg';
            $('.progress img').attr('src', filename);
            $('.progress img').show();
          }, 200);
        };
        target.onDoubleClick = function() {
          target.rotate(45);
        };
        curPieces.push(curLevPieces);
      });
    })(i);
  }
}

$('#btn-more').on('click', function() {
  addOneMoreBase();
  if (curMoneyLeft == 0) {
    alert('You don\'t have sufficient money!');
    return;
  }
  curMoneyLeft -= 20;
  localStorage.setItem('money', curMoneyLeft);
  $('#money-left').text(curMoneyLeft);
  if (curMoneyLeft == 0) {
    $('#btn-more').addClass('btn--minor');
  }
});

$('#btn-reset').on('click', function() {
  if (confirm('Are you sure?')) {
    initializePath();
  };
});

$('#btn-done').on('click', function() {
  if (!enableDoneBtn) {
    alert('Please double check if you have correctly cut out every piece :)');
    return;
  }
  $('.final img').attr('src', 'assets/' + curLevel + '-final.svg');
  $('.final').show();
});

$('.final').on('click', function() {
  $('.final').hide();
  if (curLevel == MAX_LEVEL) {
    // finish all levels
    $('.room img').attr('src', 'assets/' + MAX_LEVEL + '_room.svg');
    $('.room').show();
    var scores = JSON.parse(localStorage.getItem('scores')) || {};
    scores[playerName] = curMoneyLeft;
    localStorage.setItem('scores', JSON.stringify(scores));
    return;
  }
  curLevel = parseInt(curLevel) + 1;
  localStorage.setItem('level', curLevel);
  initializePath();
});

$('.room').on('click', function() {
  // goto leaderboard
  initializeLeaderboard();
  $('.leaderboard').show();
});

$('#btn-room').on('mouseover', function() {
  $('.room').show();
});

$('#btn-room').on('mouseleave', function() {
  $('.room').hide();
});

$('#link-tutorial').on('click', function() {
  $('.tutorial').show();
});

$('.tutorial').on('click', function() {
  $('.tutorial').hide();
});

$('#link-leaderboard').on('click', function() {
  $('.leaderboard').show();
});

$('.leaderboard').on('click', function() {
  if (curLevel == MAX_LEVEL) {
    localStorage.setItem('name', '');
    localStorage.setItem('money', 200);
    localStorage.setItem('level', 1);
    location.reload();
  } else {
    $('.leaderboard').hide();
  }
});

$('#btn-start').on('click', function(e) {
  var pName = $('#text-name').val();
  localStorage.setItem('name', pName);
  $('.init').hide();
  $('#home-name').text(pName ? pName + '\'s' : '');
});

$('body').keypress(function(e) {
  if (e.keyCode === 10 || e.keyCode === 13) {
    e.preventDefault();
    var pName = $('#text-name').val();
    localStorage.setItem('name', pName);
    $('.init').hide();
    $('#home-name').text(pName ? pName + '\'s' : '');
  }
});

$('#btn-start-over').on('click', function(e) {
  if (confirm('Are you sure? You will lose all data.')) {
    localStorage.setItem('name', '');
    localStorage.setItem('money', 200);
    localStorage.setItem('level', 1);
    location.reload();
  }
});