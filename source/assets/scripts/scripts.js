document.addEventListener('DOMContentLoaded', function(event) { 
	var dataSet, path, canvas, timelineFlag;
	var lastScrollTop = 0;
	var introScrollPosition = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) /2;

	// temporary pull for date until backend is ready
	var myFirebaseRef = new Firebase('https://sweltering-inferno-9509.firebaseIO.com/');
	myFirebaseRef.on('value', function(snapshot) {
		dataSet = snapshot.val();
		// var array = [];
		// for(var i = 0; i < dataSet.length; i++) {
		// 	var date = new Date(dataSet[i].date);
		// 	date = date.getTime();
		// 	var val = parseInt(dataSet[i].value);

		// 	array.push({
		// 		date: date,
		// 		value: val
		// 	});

		// }

		// console.log(JSON.stringify(array));
		console.log('dataset loaded');
		drawPath(dataSet);
	}, function (err) {
		console.log("The read failed: " + err.code);
	});
	

	function throttle(fn, threshhold, scope) {
		threshhold || (threshhold = 250);
		var last,
				deferTimer;
		return function () {
			var context = scope || this;

			var now = +new Date,
					args = arguments;
			if (last && now < last + threshhold) {
				// hold on to it
				clearTimeout(deferTimer);
				deferTimer = setTimeout(function () {
					last = now;
					fn.apply(context, args);
				}, threshhold);
			} else {
				last = now;
				fn.apply(context, args);
			}
		};
	}


	// drawing first path
	function drawPath(data) {
		canvas = document.getElementById('graph');
		// Create an empty project and a view for the canvas:
		paper.setup(canvas);
		// Create a Paper.js Path to draw a line into it:
		path = new paper.Path();
		// Setup path config
		path.strokeColor = '#fff';
		path.strokeWidth = 3;
		path.scaleParam = -3.14;
		path.scrollPosition = canvas.offsetTop;
		path.yOffset = 960;
		path.sectionStep = 50;


		// get first and last timestamp difference will help with scaling
		var diff = Math.abs((data[0].date - data[data.length - 1].date)) / 1000000;
		// number of elements defines timelineEvents
		var timelineEvents = data.length;
		// a step is the width for a timeline event
		var step = diff / timelineEvents;
		var relativeStep = canvas.clientWidth / path.sectionStep;



		var start = new paper.Point(-relativeStep, data[0].value * (path.scaleParam) + path.yOffset);
		// Move to start and draw a line from there
		path.moveTo(start);


		for (var i = 1; i < path.sectionStep; i++) {
			var x = i * relativeStep;
			var y = data[i].value * (path.scaleParam) + path.yOffset;
			path.lineTo(start.add([x, y]));
		};

		path.smooth();

		// Note that the plus operator on Point objects does not work
		// in JavaScript. Instead, we need to call the add() function:
		// path.lineTo(start.add([ 200, -50 ]));
		// Draw the view now:
		paper.view.draw();
		dataSet.first = 0;
		dataSet.last = path.sectionStep - 1;

		window.addEventListener('scroll', throttle(onFrame, 10));
	}

	// updating path
	function onFrame(event) {
		var st = window.pageYOffset || document.documentElement.scrollTop;
		var sectionStep = path.sectionStep;

		if (st < path.scrollPosition) {
			return false;
		}

		// forward
		if (st > lastScrollTop) {
			if (typeof dataSet[dataSet.last + 1] === 'undefined') {
				return false;
			}

			// Loop through the segments of the path:
			for (var i = 0; i < sectionStep; i++) {
				var segment = path.segments[i];
				
				// Change the y position of the segment point:
				if (i === sectionStep - 1) {
					segment.point.y = dataSet[dataSet.last].value  * (path.scaleParam) + path.yOffset;
					dataSet.last++;
				} else {
					segment.point.y = path.segments[i+1]._point._y;
				}
				paper.view.draw();
			}

		} else {
			// console.log('backwards');

			if (typeof dataSet[dataSet.last - sectionStep] === 'undefined') {
				return false;
			}

			// Loop through the segments of the path:
			for (var j = sectionStep - 1; j > 0; j--) {
				var segment = path.segments[j];
				// Change the y position of the segment point:
				if (j === 1) {
					segment.point.y = dataSet[dataSet.last - sectionStep].value  * (path.scaleParam) + path.yOffset;
					dataSet.last--;
				} else {
					segment.point.y = path.segments[j-1]._point._y;
				}
				paper.view.draw();
			}

		}
		lastScrollTop = st;

		if (path.last > path.sectionStep - 5) {
			timelineFlag = true;
			return timelineFlag;
		}

	}


});// You can place your scripts there
