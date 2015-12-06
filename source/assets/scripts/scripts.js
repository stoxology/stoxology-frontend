document.addEventListener('DOMContentLoaded', function(event) { 
	var dataSet;

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
		var canvas = document.getElementById('graph');
		// Create an empty project and a view for the canvas:
		paper.setup(canvas);
		// Create a Paper.js Path to draw a line into it:
		var path = new paper.Path();
		// Give the stroke a color
		path.strokeColor = 'black';

		// get first and last timestamp difference will help with scaling
		var diff = Math.abs((data[0].date - data[data.length - 1].date)) / 1000000;
		// number of elements defines timelineEvents
		var timelineEvents = data.length;
		// a step is the width for a timeline event
		var step = diff / timelineEvents;

		var relativeStep = canvas.clientWidth / 50;
		var start = new paper.Point(-relativeStep, data[0].value * (-1.7) + 600);
		// Move to start and draw a line from there
		path.moveTo(start);


		for (var i = 1; i < 50; i++) {

			var x = i * relativeStep;
			var y = data[i].value * (-1.7) + 600;
			path.lineTo(start.add([x, y]));
		};

		path.smooth();

		// Note that the plus operator on Point objects does not work
		// in JavaScript. Instead, we need to call the add() function:
		// path.lineTo(start.add([ 200, -50 ]));
		// Draw the view now:
		paper.view.draw();
		dataSet.last = 49;
		
		// updating path
		function onFrame(event) {

			if(typeof dataSet[dataSet.last + 1 ] === 'undefined') {
				return false;
			}

			console.log('test');
			// Loop through the segments of the path:
			for (var i = 0; i < 50; i++) {
				var segment = path.segments[i];

				// A cylic value between -1 and 1
				var sinus = Math.sin(event.time * 3 + i);
				// console.log(segment);
				// Change the y position of the segment point:
				if (i === 49) {
					segment.point.y = dataSet[dataSet.last].value  * (-1.7) + 600;
					dataSet.last++;

					// console.log('adding point', dataSet[dataSet.last].value);
				} else {
					segment.point.y = path.segments[i+1]._point._y;
				}
				
			}
			// Uncomment the following line and run the script again
			// to smooth the path:
			// path.smooth();
		}

		window.addEventListener('scroll', throttle(onFrame, 20));
	}


});// You can place your scripts there
