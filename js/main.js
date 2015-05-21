(function(){
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
			ctx.lineTo(mouse.x, mouse.y);
			ctx.stroke();
	};

}

function PrepareColorChooser(counter){

  for(var i=0;i<counter;i++){
    this.tr=document.createElement("tr");
    this.tr.setAttribute("id","tr"+i);
    for(var x=0;x<counter;x++){
      this.td=document.createElement("td");
      this.td.setAttribute("id","td"+i+"_"+x);
      this.tr.appendChild(this.td);
    }
    document.getElementById("toolsAndColors").appendChild(this.tr);
  }

}

function start(){
  prepareDrawPane();
  new PrepareColorChooser(3);
}


window.addEventListener("load",start);

}());
