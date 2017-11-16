var topics = ["cat", "dog", "snail", "house", "horse", "cloud", "tree", "car", "pizza", "phone", "helicopter", "pineapple", "apple", "tv", "floppy disk", "alien", "shrek", "book", "toaster", "shoe", "chair", "dinosaur"];

var mobile = navigator.userAgent.match("Mobile")!=null||navigator.userAgent.match("Linux;")!=null;

var config = {
	apiKey: "AIzaSyBPTleVKgBoen5M28WEsCRKZLeRlaKNJTk",
	authDomain: "drawing-game-62d1f.firebaseapp.com",
	databaseURL: "https://drawing-game-62d1f.firebaseio.com",
	projectId: "drawing-game-62d1f",
	storageBucket: "",
	messagingSenderId: "558039859038"
};
firebase.initializeApp(config);
var database = firebase.database();

var c = document.getElementById("color");
var color;
function getColor(col){
	return "hsl(" + col.h + ", " + col.s + "%, " + col.l + "%)";
}
function getInverseColor(col){
	return "hsl(" + (180 + col.h) + ", " + (col.s < 50 ? 1 - col.s : col.s) + "%, " + (100 - col.l) + "%)";
}
function newColor(){
	color = {
		h: Math.random() * 360,
		s: Math.random() * 25 + 75,
		l: Math.random() * 50 + 25
	};
	c.style.backgroundColor = getColor(color);
	c.style.color = getInverseColor(color);
}
newColor();
var code, ref, topic = "<div class='error'>Error</div>", players = {}, playercode, scoresLeft;
function score(n){
	var pcode = playercode.ge.path.n[1];
	database.ref("/A" + code + "/" + pcode).once("value", function(v){
		v = v.val();
		database.ref("/A" + code + "/" + pcode + "/score").set((v.count * v.score + n) / (v.count + 1));
		database.ref("/A" + code + "/" + pcode + "/count").set(1 + v.count);
	});
	document.getElementById("prompt").innerHTML = "";
	if(scoresLeft >= 1)
		rateDrawing();
	else{
		ref.once("value", function(v){
			v = v.val();
			ref.set({
				color: color,
				d: d,
				score: v.score,
				count: v.count,
				done: true
			});
		});
		document.getElementById("p").setAttribute("d", "");
		p.setAttribute("transform", "");
		document.getElementById("svg").style.transform = "unset";
		var done = true;
		for(var v in players)
			if(players[v].val().done != true)
				done = false;
		if(done)
			setTimeout(function(){
				database.ref("/A" + code + "/status").set(2);
			}, 500);
	}
	scoresLeft--;
}
function rateDrawing(){
	document.getElementById("prompt").innerHTML = "Rate this drawing:<div id='rating'>Really Bad <div class='star' onclick='score(1)'></div><div class='star' onclick='score(2)'></div><div class='star' onclick='score(3)'></div><div class='star' onclick='score(4)'></div><div class='star' onclick='score(5)'></div> Pretty Good</div>";
	document.getElementById("p").setAttribute("d", "");
	
	var num = Math.floor(Object.keys(players).length * Math.random());
	var c = 0;
	for(var i in players)
		if(c++ == num){
			playercode = players[i];
		}
	document.getElementById("p").setAttribute("transform", "");
	document.getElementById("svg").style.transform = "unset";
	if(playercode == undefined || playercode.ge.path.n[1] == ref.path.n[1])
		requestAnimationFrame(rateDrawing);
	else{
		//console.log(playercode);
		document.getElementById("p").setAttribute("d", playercode.val().d);
		document.getElementById("p").setAttribute("stroke", getColor(playercode.val().color));
		requestAnimationFrame(positionDrawing);
	}
}
function positionDrawing(){
	var p = document.getElementById("p");
	var svg = document.getElementById("svg");
	p.setAttribute("transform", "");
	svg.style.transform = "";
	var rect = p.getBoundingClientRect();
	var rect2 = svg.getBoundingClientRect();
	var rect3 = document.getElementById("prompt").getBoundingClientRect();
	p.setAttribute("transform", "scale(" + Math.min((rect2.bottom - rect2.top) / (rect.bottom - rect.top), (rect2.right - rect2.left) / (rect.right - rect.left)) + ") translate(" + (-1 * rect.left) + ", " + (-1 * rect.top + (rect3.bottom - rect3.top)) + ")");
	svg.style.transform = "scale(0.9)";
	p.style.transformOrigin = "0 0";
}
function newGame(){
	var letters = "ABCDEFGHIJLKMNOPQRSTUVWXYZ";
	code = "";
	for(var i = 0; i < 6; i++)
		code += letters[Math.floor(Math.random() * letters.length)];
	console.log(code);
	database.ref("/A" + code).once("value", function(e){
		if(e.val() == null){
			ref = database.ref("/A" + code).push();
			document.getElementById("container").innerHTML = "<div id='code' class='font'>" + code + "</div><div id='players' class='font'>Enter the code to join this game!</div><div id='start' class='font' onclick='startGame()'>Start!</div>";
			database.ref("/A" + code).set({
				status: 0
			});
			database.ref("/A" + code).on("child_added", function(e){
				console.log(e);
				if(e.ge.path.n[1] != "status" && e.ge.path.n[1] != "topic"){
					var d = e.val();
					var el = document.createElement("DIV");
					el.className = "playericon " + e.ge.path.n[1];
					el.style.backgroundColor = getColor(d.color);
					el.style.top = (Math.random() * 60 + 30) + "vh";
					el.style.left = (Math.random() * 80 + 10) + "vw";
					document.getElementById("players").appendChild(el);
					players[e.ge.path.n[1]] = e;
				}
			});
			ref.set({
				color: color,
				d: "",
				score: 0,
				count: 0,
				done: false
			});
			database.ref("/A" + code + "/status").on("value", function(e){
				e = e.val();
				if(e == 1){
					d = "M" + document.body.clientWidth / 2 + "," + document.body.clientHeight / 2 + " ";
					document.getElementById("container").innerHTML = "<div id='loader' class='font'>Get ready to draw in... <span id='count'>5</span></div>";
					window.setTimeout(function(){
						document.getElementById("count").innerHTML = "4";
					}, 1000);
					window.setTimeout(function(){
						document.getElementById("count").innerHTML = "3";
					}, 2000);
					window.setTimeout(function(){
						document.getElementById("count").innerHTML = "2";
					}, 3000);
					window.setTimeout(function(){
						document.getElementById("count").innerHTML = "1";
					}, 4000);
					window.setTimeout(function(){
						document.getElementById("container").innerHTML = "<div id='prompt' class='font'>Draw a...<div class='topic'>" + topic + "</div></div><svg id='svg' onmousedown='var event = typeof e == \"undefined\" ? window.event : e; startLine(event, this)' onmousemove='var event = typeof e == \"undefined\" ? window.event : e; moveLine(event, this)' onmouseup='var event = typeof e == \"undefined\" ? window.event : e; endLine(event, this)' ontouchstart='var event = typeof e == \"undefined\" ? window.event : e; startLine(event.touches[0], this); event.preventDefault()' ontouchmove='var event = typeof e == \"undefined\" ? window.event : e; moveLine(event.touches[0], this); event.preventDefault()' ontouchend='var event = typeof e == \"undefined\" ? window.event : e; endLine(event.touches[0], this); event.preventDefault()'><path id='p' stroke='" + getColor(color) + "' stroke-width='5' fill='none'/></svg><div id='counter' class='font'>10</div>";
						var n = 10;
						function countDown(){
							n--;
							document.getElementById("counter").innerHTML = n;
							if(n != 0)
								setTimeout(countDown, 1000);
							else{
								var svg = document.getElementById("svg");
								svg.onmousedown = null;
								svg.onmousemove = null;
								svg.onmouseup = null;
								svg.ontouchstart = null;
								svg.ontouchmove = null;
								svg.ontouchend = null;
								ref.set({
									color: color,
									d: d,
									score: 0,
									count: 0,
									done: false
								});
								document.getElementById("prompt").innerHTML = "<div class='topic'>Time's up!</div>";
								setTimeout(function(){
									scoresLeft = Object.keys(players).length / 3;
									rateDrawing();
								}, 3000);
							}
						}
						setTimeout(countDown, 1000);
					}, 5000);
					topic = topics[Math.floor(Math.random() * topics.length)];
					database.ref("/A" + code + "/topic").set(topic);
					database.ref("/A" + code).on("child_changed", function(e){
						if(e.ge.path.n[1] != "status" && e.ge.path.n[1] != "topic"){
							players[e.ge.path.n[1]] = e;
						}
					});
				}
				if(e == 2){
					var max = 1;
					for(var v in players)
						if(players[v].val().score > (max === 1 ? -1 : max.val().score))
							max = players[v];
					document.getElementById("p").setAttribute("d", max.val().d);
					document.getElementById("p").setAttribute("stroke", getColor(max.val().color));
					p.setAttribute("transform", "");
					document.getElementById("svg").style.transform = "unset";
					document.getElementById("prompt").innerHTML = "<div class='topic'>Best in show:</div>";
					// if(!mobile)
					requestAnimationFrame(positionDrawing);
					setTimeout(function(){
						database.ref("/A" + code + "/status").set(1);
					}, 5000);
				}
			});
		}else
			newGame();
	});
}

function joinGame(e){
	e.innerHTML = "<input id='input' class='font' placeholder='Game code' onkeyup='checkCode(this)' autofocus></input>";
	e.className += " notturn";
	e.onclick = null;
}
function checkCode(el){
	if(el.value.length == 6){
		code = el.value.toUpperCase();
		console.log(code);
		el.onkeyup = null;
		database.ref("/A" + code + "/status").once("value", function(e){
			if(e.val() === 0){
				document.getElementById("container").innerHTML = "<div id='waiting' style='background-color: " + getColor(color) + "'><span class='wait font'>Wating for the game to start...</span></div>";
				ref = database.ref("/A" + code).push();
				ref.set({
					color: color,
					d: "",
					score: 0,
					count: 0,
					done: false
				});
				database.ref("/A" + code + "/status").on("value", function(e){
					e = e.val();
					if(e == 1){
						d = "M" + document.body.clientWidth / 2 + "," + document.body.clientHeight / 2 + " ";
						document.getElementById("container").innerHTML = "<div id='loader' class='font'>Get ready to draw in... <span id='count'>5</span></div>";
						window.setTimeout(function(){
							document.getElementById("count").innerHTML = "4";
						}, 1000);
						window.setTimeout(function(){
							document.getElementById("count").innerHTML = "3";
						}, 2000);
						window.setTimeout(function(){
							document.getElementById("count").innerHTML = "2";
						}, 3000);
						window.setTimeout(function(){
							document.getElementById("count").innerHTML = "1";
						}, 4000);
						window.setTimeout(function(){
							document.getElementById("container").innerHTML = "<div id='prompt' class='font'>Draw a...<div class='topic'>" + topic + "</div></div><svg id='svg' onmousedown='var event = typeof e == \"undefined\" ? window.event : e; startLine(event, this)' onmousemove='var event = typeof e == \"undefined\" ? window.event : e; moveLine(event, this)' onmouseup='endLine(event, this)' ontouchstart='var event = typeof e == \"undefined\" ? window.event : e; startLine(event.touches[0], this); event.preventDefault()' ontouchmove='var event = typeof e == \"undefined\" ? window.event : e; moveLine(event.touches[0], this); event.preventDefault()' ontouchend='var event = typeof e == \"undefined\" ? window.event : e; endLine(event.touches[0], this); event.preventDefault()'><path id='p' stroke='" + getColor(color) + "' stroke-width='5' fill='none'/></svg><div id='counter' class='font'>10</div>";
							var n = 10;
							function countDown(){
								n--;
								document.getElementById("counter").innerHTML = n;
								if(n != 0)
									setTimeout(countDown, 1000);
								else{
									var svg = document.getElementById("svg");
									svg.onmousedown = null;
									svg.onmousemove = null;
									svg.onmouseup = null;
									svg.ontouchstart = null;
									svg.ontouchmove = null;
									svg.ontouchend = null;
									ref.set({
										color: color,
										d: d,
										score: 0,
										count: 0,
										done: false
									});
									document.getElementById("prompt").innerHTML = "<div class='topic'>Time's up!</div>";
									setTimeout(function(){
										scoresLeft = Object.keys(players).length / 3;
										rateDrawing();
									}, 3000);
								}
							}
							setTimeout(countDown, 1000);
						}, 5000);
					}else
						el.onkeyup = function(t){
							checkCode(t);
						};
					if(e == 2){
						var max = 1;
						for(var v in players)
							if(players[v].val().score > (max === 1 ? -1 : max.val().score))
						max = players[v];
						document.getElementById("p").setAttribute("d", max.val().d);
						document.getElementById("p").setAttribute("stroke", getColor(max.val().color));
						p.setAttribute("transform", "");
						document.getElementById("svg").style.transform = "unset";
						document.getElementById("prompt").innerHTML = "Best in show:";
						// if(!mobile)
						requestAnimationFrame(positionDrawing);
						setTimeout(function(){
							database.ref("/A" + code + "/status").set(1);
						}, 5000);
					}
				});
				database.ref("/A" + code + "/topic").on("value", function(e){
					topic = e.val();
				});
				database.ref("/A" + code).on("child_changed", function(e){
					if(e.ge.path.n[1] != "status" && e.ge.path.n[1] != "topic"){
						players[e.ge.path.n[1]] = e;
					}
				});
			}
		});
	}
}
function startGame(){
	if(document.getElementsByClassName("playericon").length > 1)
		database.ref("/A" + code + "/status").set(1);
}

var d = "M" + document.body.clientWidth / 2 + "," + document.body.clientHeight / 2 + " ";
var mouse = false;

function startLine(event, e){
	// console.log(event);
	e.children[0].setAttribute("d", d + "M" + event.pageX + "," + (event.pageY - Math.min(document.body.clientHeight, document.body.clientWidth) * 0.3) + " ");
	d = e.children[0].getAttribute("d");
	mouse = true;
}
function moveLine(event, e){
	// console.log(event);
	if(mouse){
		e.children[0].setAttribute("d", d + "L" + event.pageX + "," + (event.pageY - Math.min(document.body.clientHeight, document.body.clientWidth) * 0.3) + " ");
		d = e.children[0].getAttribute("d");
	}
}
function endLine(event, e){
	// console.log(event);
	mouse = false;
}
