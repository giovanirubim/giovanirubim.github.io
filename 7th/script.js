function loadImages(images) {
	var img, nElements = [], elements = {};
	for (var i=0; i<images.files.length; i++) {
		img = document.createElement("img");
		img.addEventListener("load",function(){
			elements[this.getAttribute("src")] = this;
			if (++nElements==images.files.length) {
				images.done(elements);
			}
		});
		img.setAttribute("src",images.files[i]);
	}
}

var points = [{x:45,y:214},{x:16,y:74},{x:82,y:98},{x:133,y:46},{x:159,y:191},{x:195,y:97},{x:295,y:85},{x:264,y:56},{x:226,y:55},{x:212,y:145},{x:265,y:155},{x:293,y:143},{x:296,y:122},{x:452,y:69},{x:430,y:23},{x:373,y:25},{x:344,y:55},{x:344,y:104},{x:391,y:114},{x:454,y:171},{x:441,y:218},{x:379,y:244},{x:327,y:235},{x:319,y:200},{x:498,y:137},{x:612,y:140},{x:605,y:101},{x:544,y:78},{x:511,y:93},{x:510,y:190},{x:525,y:225},{x:569,y:222},{x:592,y:203},{x:757,y:169},{x:755,y:122},{x:716,y:106},{x:673,y:124},{x:660,y:163},{x:702,y:195},{x:729,y:228},{x:740,y:283},{x:728,y:320},{x:668,y:330},{x:612,y:295},{x:606,y:256},{x:189,y:375},{x:155,y:343},{x:104,y:356},{x:86,y:418},{x:100,y:473},{x:142,y:507},{x:234,y:529},{x:272,y:540},{x:300,y:508},{x:334,y:440},{x:333,y:381},{x:314,y:338},{x:277,y:324},{x:240,y:329},{x:216,y:360},{x:216,y:398}];
var lines = [[0,1,2,3,4],[5,6,7,8,5,9,10,11,12],[13,14,15,16,17,18,19,20,21,22,23],[24,25,26,27,28,24,29,30,31,32],[33,34,35,36,37,38,39,40,41,42,43,44],[60,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60]];

window.addEventListener("load",function(){
	loadImages({
		files: [
			"img1.png",
			"img2.png",
			"img3.png",
			"img4.png",
			"img5.png",
			"img6.png",
			"img7.png",
		],done: function(elements) {
			var wrap = document.getElementById('wrap');
			function newLayer(src) {
				var div = document.createElement("div");
				if (src!=null)
					div.appendChild(elements["img"+src+".png"]);
				div.setAttribute("class","layer");
				return div;
			}
			function step1() {
				var layer1 = newLayer("1");
				var layer2 = newLayer();
				wrap.appendChild(layer1);
				wrap.appendChild(layer2);
				var button1 = document.createElement("div");
				button1.setAttribute("id","button1");
				layer2.appendChild(button1);
				button1.addEventListener("click",function(){
					this.parentElement.remove();
					step2();
				});
			}
			var layer4 = newLayer("4");
			function step2() {
				var layer2 = newLayer("2");
				var layer3 = newLayer("3");
				wrap.appendChild(layer2);
				wrap.appendChild(layer3);
				layer3.style.display = "none";
				wrap.appendChild(layer4);
				layer4.style.display = "none";
				setTimeout(function(){
					layer3.style.display = "block";
					setTimeout(function(){
						var ini = new Date();
						layer4.style.display = "block";
						layer4.style.opacity = 0;
						var interval = setInterval(function(){
							var x = (new Date()-ini)/2000;
							if(x>=1){
								x=1;
								clearInterval(interval);
								layer4.style.opacity = 1;
								setTimeout(step3,2000);
							} else if(x<0.5) {
								layer4.style.opacity = x*(Math.random());
							} else {
								layer4.style.opacity = (1-x)*Math.random()+x;
							}
						},0);
					},1500);
				},500);
			}
			function killBrothers(element) {
				var parent = element.parentElement;
				while(parent.children[0]!=element)
					parent.children[0].remove();
				while(parent.children.length>1)
					parent.children[1].remove();
			}
			function step3() {
				var layer5 = newLayer("5");
				layer5.style.opacity = 0;
				wrap.appendChild(layer5);
				var ini = new Date();
				var interval = setInterval(function(){
					var x = (new Date()-ini)/2000;
					if(x>=1){
						x=1;
						clearInterval(interval);
						killBrothers(layer5);
						setTimeout(step4,500);
					}
					layer5.style.opacity = (Math.cos(Math.PI*(x+1))+1)/2;
				},0);
			}
			function step4() {
				var layer6 = newLayer("6");
				var layer7 = newLayer("7");
				var layer9 = newLayer();
				var button2 = document.createElement("div");
				button2.setAttribute("id","button2");
				layer9.appendChild(button2);
				wrap.appendChild(layer6);
				wrap.appendChild(layer7);
				wrap.appendChild(layer9);
				var ini = new Date();
				var x, op, t, time;
				layer6.style.opacity = 0;
				layer7.style.opacity = 0;
				var interval = setInterval(function(){
					time = new Date() - ini;
					x = time/500;
					t = x/2;
					if(t>1)t=1;
					op = (Math.cos(x)+1)/2;
					layer6.style.opacity = t*(op);
					layer7.style.opacity = t*(1-op);
				});
				button2.addEventListener("click",function(){
					step5();
					this.parentElement.remove();
				});
			}
			function step5() {
				var layer8 = newLayer();
				var canvas = document.createElement("canvas");
				canvas.setAttribute("width",800);
				canvas.setAttribute("height",600);
				var context = canvas.getContext("2d");
				layer8.appendChild(canvas);
				wrap.appendChild(layer8);
				var ini = new Date(), d, m, t, delay = 100, p, lp, px, py;
				context.strokeStyle = "rgba(50,100,255,0.5)";
				context.lineWidth = 2;
				var interval = setInterval(function(){
					context.clearRect(0,0,800,600);
					d = Math.floor((t=(new Date()-ini))/delay);
					m = (t%delay)/delay;
					m = (Math.cos((m+1)*Math.PI)+1)/2;
					for (var i=0; i<lines.length && d; i++) {
						context.beginPath();
						lp = points[lines[i][0]];
						context.moveTo(lp.x,lp.y);
						for (var j=1; j<lines[i].length && d; j++,d--) {
							p = points[lines[i][j]];
							px = p.x;
							py = p.y;
							if (d==1) {
								px = (p.x-lp.x)*m+lp.x;
								py = (p.y-lp.y)*m+lp.y;
							}
							context.lineTo(px,py);
							lp = p;
						}
						context.stroke();
					}
				},0);
			}
			step1();
		}
	});
});