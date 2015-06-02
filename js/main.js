(function(){

	var choosenColor='';

function prepareDrawPane() {
	var canvas = document.querySelector('#paint');
	var ctx = canvas.getContext('2d');

	var sketch = document.querySelector('#sketch');
	var sketch_style = getComputedStyle(sketch);
	canvas.width = parseInt(sketch_style.getPropertyValue('width'));
	canvas.height = parseInt(sketch_style.getPropertyValue('height'));

	var mouse = {x: 0, y: 0};

	/* Mouse Capturing Work */
	canvas.addEventListener('mousemove', function(e) {
		mouse.x = e.pageX - this.offsetLeft;
		mouse.y = e.pageY - this.offsetTop;
	}, false);

	/* Drawing on Paint App */
	ctx.lineWidth = 5;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	ctx.strokeStyle = 'blue';

	canvas.addEventListener('mousedown', function(e) {
			ctx.beginPath();
			ctx.moveTo(mouse.x, mouse.y);

			canvas.addEventListener('mousemove', onPaint, false);
	}, false);

	canvas.addEventListener('mouseup', function() {
			canvas.removeEventListener('mousemove', onPaint, false);
	}, false);

	var onPaint = function() {
			ctx.strokeStyle=choosenColor;
			ctx.lineTo(mouse.x, mouse.y);
			ctx.stroke();
	};

}


function PrepareColorChooser(counter){

	var colorArray=returnColorArray(counter);
	console.log(colorArray);
	var colorCounter=colorArray.length-1;

  for(var i=0;i<counter;i++){
    this.tr=document.createElement("tr");
    this.tr.setAttribute("id","tr"+i);
    for(var x=0;x<counter;x++){
      this.td=document.createElement("td");
      this.td.setAttribute("id","td"+i+"_"+x);
			this.td.setAttribute("style","background-color: "+getNextColor()+";"); //set color from color set
			this.space=document.createElement("br");
			this.td.addEventListener("click",function(e){choosenColor=e.toElement.style.backgroundColor;
																											console.log(document.getElementById("toolsAndColors"));
																											var table=document.getElementById("toolsAndColors");
																											var tdsInTable=table.getElementsByTagName("td");

																											for(var element=3;element<(counter*counter)+3;element++){
																												console.log(element);
																												tdsInTable[element].setAttribute("class","notClicked");
																											}
																											e.toElement.setAttribute("class","clicked");
																										});
			this.td.appendChild(this.space);
      this.tr.appendChild(this.td);
    }
    document.getElementById("toolsAndColors").appendChild(this.tr);
  }


	function getNextColor(){
		return colorArray[colorCounter--];
	}
	function returnColorArray(size){
		var array=[];
		for(var i=0;i<(size*size);i++){
				array[i]="rgb("+Math.round(Math.random()*255)+", "+Math.round(Math.random()*255)+", "+Math.round(Math.random()*255)+")";
			}
			return array;
	}

}

function start(){

	for(var i=0;i<3;i++){
		var pens=document.getElementsByName("pen");
		console.log(pens[i]);
		pens[i].addEventListener("click",function(e){for(var b=0;b<3;b++){
																									var pens=document.getElementsByName("pen");
																									pens[b].setAttribute("class","notClicked");
																								}
																								console.log(e.toElement.parentNode.tagName);
																								if(e.toElement.parentNode.tagName=="TD"){
																									e.toElement.parentNode.setAttribute("class","clicked");
																								}
																								else{
																									e.toElement.setAttribute("class","clicked");
																								}

																								});
	}

  prepareDrawPane();
	var colorChooser= new PrepareColorChooser(3);
}


window.addEventListener("load",start);

}());
