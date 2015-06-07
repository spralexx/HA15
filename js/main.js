(function() {

  var variablesJson = {
    drawPane: {},
    userID: {}
  };

  function initDrawPane() {
    variablesJson.drawPane["canvas"] = document.querySelector('#paint');
    variablesJson.drawPane["ctx"] = variablesJson.drawPane["canvas"].getContext('2d');

    variablesJson.drawPane["sketch"] = document.querySelector('#sketch');
    variablesJson.drawPane["sketch_style"] = getComputedStyle(variablesJson.drawPane["sketch"]);
    variablesJson.drawPane["canvas"].width = parseInt(variablesJson.drawPane["sketch_style"].getPropertyValue('width'));
    variablesJson.drawPane["canvas"].height = parseInt(variablesJson.drawPane["sketch_style"].getPropertyValue('height'));


    // Creating a tmp canvas
    variablesJson.drawPane["tmp_canvas"] = document.createElement('canvas');
    variablesJson.drawPane["tmp_ctx"] = variablesJson.drawPane["tmp_canvas"].getContext('2d');
    variablesJson.drawPane["tmp_canvas"].id = 'tmp_canvas';
    variablesJson.drawPane["tmp_canvas"].width = variablesJson.drawPane["canvas"].width;
    variablesJson.drawPane["tmp_canvas"].height = variablesJson.drawPane["canvas"].height;

    variablesJson.drawPane["sketch"].appendChild(variablesJson.drawPane["tmp_canvas"]);

    variablesJson.drawPane["mouse"] = {
      x: 0,
      y: 0
    };
    variablesJson.drawPane["start_mouse"] = {
      x: 0,
      y: 0
    };
    variablesJson.drawPane["last_mouse"] = {
      x: 0,
      y: 0
    };

    variablesJson.drawPane["sprayIntervalID"] = '';
    variablesJson.drawPane["choosenColor"] = '';
    variablesJson.drawPane["offset"] = '';
    variablesJson.drawPane["choosenPen"] = '';


    //set event listener

    /* Mouse Capturing Work */
    variablesJson.drawPane["tmp_canvas"].addEventListener('mousemove', function(e) {
      variablesJson.drawPane["mouse"].x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
      variablesJson.drawPane["mouse"].y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
    }, false);

    variablesJson.drawPane["tmp_canvas"].addEventListener('mousedown', function(e) {
      switch (variablesJson.drawPane["choosenPen"]) {
        case "pen0":
          variablesJson.drawPane["tmp_ctx"].beginPath();
          variablesJson.drawPane["tmp_ctx"].moveTo(variablesJson.drawPane["mouse"].x, variablesJson.drawPane["mouse"].y);
          variablesJson.drawPane["tmp_canvas"].addEventListener('mousemove', variablesJson.drawPane["onPaint"], false);
          break;
        case "pen1":

					//try unsetting the intervall in case we havent correctly unset it when leaving the draw pane.
					try{
						clearInterval(sprayIntervalID);
					}
					catch(e){
						console.log(e);
					}

          // Writing down to real canvas now
          variablesJson.drawPane["ctx"].drawImage(variablesJson.drawPane["tmp_canvas"], 0, 0);
          // Clearing tmp canvas
          variablesJson.drawPane["tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);

          variablesJson.drawPane["tmp_canvas"].addEventListener('mousemove', variablesJson.drawPane["onPaint"], false);

          variablesJson.drawPane["mouse"].x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
          variablesJson.drawPane["mouse"].y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;

          variablesJson.drawPane["start_mouse"].x = variablesJson.drawPane["mouse"].x;
          variablesJson.drawPane["start_mouse"].y = variablesJson.drawPane["mouse"].y;

          variablesJson.drawPane["onPaint"]();
          sprayIntervalID = setInterval(variablesJson.drawPane["onPaint"], 50);
          break;
      }

    }, false);

    variablesJson.drawPane["tmp_canvas"].addEventListener('mouseup', function() {
      console.log("mouseup");
      switch (variablesJson.drawPane["choosenPen"]) {
        case "pen0":
          variablesJson.drawPane["tmp_canvas"].removeEventListener('mousemove', variablesJson.drawPane["onPaint"], false);

          break;
        case "pen1":
          variablesJson.drawPane["tmp_canvas"].removeEventListener('mousemove', variablesJson.drawPane["onPaint"], false);
          clearInterval(sprayIntervalID);
          break;
      }
    }, false);

    variablesJson.drawPane["onPaint"] = function() {

      switch (variablesJson.drawPane["choosenPen"]) {
        case "pen0":
          variablesJson.drawPane["tmp_ctx"].strokeStyle = variablesJson.drawPane["choosenColor"];
          variablesJson.drawPane["tmp_ctx"].lineTo(variablesJson.drawPane["mouse"].x, variablesJson.drawPane["mouse"].y);
          variablesJson.drawPane["tmp_ctx"].stroke();
          break;
        case "pen1":

          // Tmp canvas is always cleared up before drawing.
          // variablesJson.drawPane["tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);

          variablesJson.drawPane["generateSprayParticles"]();

          break;
        case "pen2":

          break;
      }



    }

    variablesJson.drawPane["generateSprayParticles"] = function() {
      // Particle count, or, density
      var density = 50;

      for (var i = 0; i < density; i++) {
        variablesJson.drawPane["offset"] = variablesJson.drawPane["getRandomOffset"](10);

        var x = variablesJson.drawPane["mouse"].x + variablesJson.drawPane["offset"].x;
        var y = variablesJson.drawPane["mouse"].y + variablesJson.drawPane["offset"].y;

        variablesJson.drawPane["tmp_ctx"].fillStyle = variablesJson.drawPane["choosenColor"];

        variablesJson.drawPane["tmp_ctx"].fillRect(x, y, 1, 1);
      }

    }

    variablesJson.drawPane["getRandomOffset"] = function(radius) {
      var random_angle = Math.random() * (2 * Math.PI);
      var random_radius = Math.random() * radius;

      // console.log(random_angle, random_radius, Math.cos(random_angle), Math.sin(random_angle));

      return {
        x: Math.cos(random_angle) * random_radius,
        y: Math.sin(random_angle) * random_radius
      };

    }


  }


  function drawOnCanvas() {
    switch (choosenPen) {
      case "pen0":
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
          ctx.strokeStyle = choosenColor;
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
        break;
    }

  }


  function PrepareColorChooser(counter) {

    var colorArray = returnColorArray(counter);
    console.log(colorArray);
    var colorCounter = colorArray.length - 1;

    for (var i = 0; i < counter; i++) {
      this.tr = document.createElement("tr");
      this.tr.setAttribute("id", "tr" + i);
      for (var x = 0; x < counter; x++) {
        this.td = document.createElement("td");
        this.td.setAttribute("id", "td" + i + "_" + x);
        this.td.setAttribute("style", "background-color: " + getNextColor() + ";"); //set color from color set
        this.space = document.createElement("br");
        this.td.addEventListener("click", function(e) {
          variablesJson.drawPane["choosenColor"] = e.toElement.style.backgroundColor;
          console.log(variablesJson.drawPane["choosenColor"]);
          var table = document.getElementById("toolsAndColors");
          var tdsInTable = table.getElementsByTagName("td");

          for (var element = 3; element < (counter * counter) + 3; element++) {
            tdsInTable[element].setAttribute("class", "notClicked");
          }
          e.toElement.setAttribute("class", "clicked");
        });
        this.td.appendChild(this.space);
        this.tr.appendChild(this.td);
      }
      document.getElementById("toolsAndColors").appendChild(this.tr);
    }


    function getNextColor() {
      return colorArray[colorCounter--];
    }

    function returnColorArray(size) {
      var array = [];
      for (var i = 0; i < (size * size); i++) {
        array[i] = "rgb(" + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ")";
      }
      return array;
    }

  }

  function start() {
    var colorchoosersize = 3; //3*3

    for (var i = 0; i < 3; i++) {
      var pens = document.getElementsByName("pen");
      console.log(pens[i]);
      pens[i].addEventListener("click", function(e) {
        for (var b = 0; b < 3; b++) {
          var pens = document.getElementsByName("pen");
          pens[b].setAttribute("class", "notClicked");
        }
        console.log(e.toElement.parentNode.tagName);
        if (e.toElement.parentNode.tagName == "TD") {
          e.toElement.parentNode.setAttribute("class", "clicked");
          variablesJson.drawPane["choosenPen"] = e.toElement.parentNode.id;
          //console.log(choosenPen);
        } else {
          e.toElement.setAttribute("class", "clicked");
          variablesJson.drawPane["choosenPen"] = e.toElement.id;
          //console.log(choosenPen);
        }
      });
    }

    for (var b = 0; b < 3; b++) {
      var pens = document.getElementsByName("pen");
      pens[b].setAttribute("class", "notClicked")
    }


    initDrawPane();
    //set defaults for initDrawPane()

    /* Drawing on Paint App */
    variablesJson.drawPane["tmp_ctx"].lineWidth = 5;
    variablesJson.drawPane["tmp_ctx"].lineJoin = 'round';
    variablesJson.drawPane["tmp_ctx"].lineCap = 'round';
    variablesJson.drawPane["tmp_ctx"].strokeStyle = 'blue';
    variablesJson.drawPane["tmp_ctx"].fillStyle = 'blue'; //blue is default color

    pens[0].setAttribute("class", "clicked");
    variablesJson.drawPane["choosenPen"] = 'pen0';

    var colorChooser = new PrepareColorChooser(colorchoosersize);
    for (var element = 3; element < (colorchoosersize * colorchoosersize) + colorchoosersize; element++) {
      var table = document.getElementById("toolsAndColors");
      var tdsInTable = table.getElementsByTagName("td");
      tdsInTable[element].setAttribute("class", "notClicked");
    }

    variablesJson.userID["uuid"] = generateUUID();
    console.log("init done:");
    console.log(variablesJson);
  }

  function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }


  window.addEventListener("load", start);

}());
