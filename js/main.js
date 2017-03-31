var LEVELS_PIECE = {
  1: 5,
  2: 3
};

var MAX_LEVEL = 2;

var POS_PIECE = {
  0: [50, 100],
  1: [200, 100],
  2: [50, 250],
  3: [200, 250],
  4: [50, 400],
  5: [200, 400],
};

var TIPS = {
  1: 'In traditional design, shapes are first conceived, and then fabricated. While this decoupling simplifies the design process, it can result in inefficient material usage, especially where off-cut pieces are hard to reuse.',
  2: 'Sustainable furniture is made from materials that have certain characteristics. These materials may be recycled or re-purposed. Anything that is made from materials that had previously been used for something else and are then re-used in the making of new furniture.'
};

var hitOptions = {
  segments: true,
  stroke: true,
  fill: true,
  tolerance: 5
};

var curLevel;
var curPieces;
var bases;
initializePath();

function isInside(target, container) {
  return target.position.x >= container.bounds.topLeft.x &&
    target.position.y >= container.bounds.topLeft.y &&
    target.position.x <= container.bounds.bottomRight.x &&
    target.position.y <= container.bounds.bottomRight.y &&
    !target.intersects(container);
}

function addOneMoreBase() {
  var base = new Path.Rectangle(
    new Rectangle(new Point(400, 100 + 250 * bases.length), new Size(400, 200)));
  base.fillColor = '#FFD38A';
  base.shadowColor = 'rgba(0,0,0,.2)';
  base.shadowOffset = new Point(3, 3);
  bases.push(base);
}

function initializePath() {
  project.activeLayer.removeChildren();
  $('#btn-done').hide();

  curPieces = [];
  window.curPieces = curPieces;
  bases = [];

  addOneMoreBase();

  curLevel = localStorage.getItem('level') || 1;
  $('#level').text(curLevel);
  $('#tips').text(TIPS[curLevel]);
  $('.room img').attr('src', 'assets/' + (curLevel - 1) + '-room.png');

  var levels_piece_n = LEVELS_PIECE[curLevel];
  for (var i = 0; i < levels_piece_n; i ++) {
    (function(i){
      project.importSVG('assets/' + curLevel + '-' + i + '.svg', function(target) {
        curPieces[i] = target;
        target.position += new Point(POS_PIECE[i][0], POS_PIECE[i][1]);
        target.opacity = 0.8;
        target.onMouseDrag = function(event) {
          target.strokeColor = 'rgba(0,0,0,0.2)';
          target.position = event.point;
          bases.forEach(function(base, idx) {
            if (isInside(target.children[0], base)) {
              base.strokeColor = 'rgba(100,255,100,0.5)';
              base.strokeWidth = 5;
            }
          });
        };
        target.onMouseUp = function() {
          $('.warning').text('');
          var hasCollisions = false;
          var everythingInside = true;
          curPieces.forEach(function(cp, idx1) {
            cp.strokeWidth = 0;
            var inOneOfBases = false;
            bases.forEach(function(base, idx) {
              base.strokeWidth = 0;
              if (isInside(cp.children[0], base)) {
                inOneOfBases = true;
              }
            });
            if (!inOneOfBases) everythingInside = false;
            curPieces.forEach(function(cpp, idx2) {
              if (idx1 === idx2) return;
              if (cpp.children[0].intersects(cp.children[0])) {
                cp.strokeColor = 'rgba(255,0,0,0.8)';
                cp.strokeWidth = 3;
                $('.warning').text('Please avoid overlays in pieces!');
                hasCollisions = true;
              }
            });
          });
          setTimeout(function() {
            if (!hasCollisions && everythingInside) {
              $('#btn-done').show();
            } else {
              $('#btn-done').hide();
            }
          }, 200);
        };
        target.onDoubleClick = function() {
          target.rotate(45);
        };
      });
    })(i);
  }
}

$('#btn-more').on('click', function() {
  addOneMoreBase();
});

$('#btn-reset').on('click', function() {
  if (confirm('Are you sure?')) {
    initializePath();
  };
});

$('#btn-done').on('click', function() {
  $('.final img').attr('src', 'assets/' + curLevel + '-final.png');
  $('.final').show();
});

$('.final').on('click', function() {
  $('.final').hide();
  curLevel = Math.min(curLevel + 1, MAX_LEVEL);
  localStorage.setItem('level', curLevel);
  initializePath();
});

$('#btn-room').on('mouseover', function() {
  $('.room').show();
});

$('#btn-room').on('mouseleave', function() {
  $('.room').hide();
});