(function() {

  var variablesJson = {
    "drawPane": {
      "sendable": {
        "clientInfo": {}
      },
      "received": {}
    },
  };

  var ws;

  function initDrawPane() {
    variablesJson.drawPane["canvas"] = document.querySelector('#paint');
    variablesJson.drawPane["ctx"] = variablesJson.drawPane["canvas"].getContext('2d');
    variablesJson.drawPane["sketch"] = document.querySelector('#sketch');
    variablesJson.drawPane["sketch_style"] = getComputedStyle(variablesJson.drawPane["sketch"]);
    variablesJson.drawPane["canvas"].width = parseInt(variablesJson.drawPane["sketch_style"].getPropertyValue('width'));
    variablesJson.drawPane["canvas"].height = parseInt(variablesJson.drawPane["sketch_style"].getPropertyValue('height'));

    // Creating a canvas for draw recieved
    variablesJson.drawPane["received_tmp_canvas"] = document.createElement('canvas');
    variablesJson.drawPane["received_tmp_ctx"] = variablesJson.drawPane["received_tmp_canvas"].getContext('2d');
    variablesJson.drawPane["received_tmp_canvas"].id = 'received_tmp_canvas';
    variablesJson.drawPane["received_tmp_canvas"].width = variablesJson.drawPane["canvas"].width;
    variablesJson.drawPane["received_tmp_canvas"].height = variablesJson.drawPane["canvas"].height;
    variablesJson.drawPane["sketch"].appendChild(variablesJson.drawPane["received_tmp_canvas"]);

    // Creating a tmp canvas
    variablesJson.drawPane["tmp_canvas"] = document.createElement('canvas');
    variablesJson.drawPane["tmp_ctx"] = variablesJson.drawPane["tmp_canvas"].getContext('2d');
    variablesJson.drawPane["tmp_canvas"].id = 'tmp_canvas';
    variablesJson.drawPane["tmp_canvas"].width = variablesJson.drawPane["canvas"].width;
    variablesJson.drawPane["tmp_canvas"].height = variablesJson.drawPane["canvas"].height;
    variablesJson.drawPane["sketch"].appendChild(variablesJson.drawPane["tmp_canvas"]);




    variablesJson.drawPane.sendable["mouse"] = {
      x: 0,
      y: 0
    };
    variablesJson.drawPane.sendable["start_mouse"] = {
      x: 0,
      y: 0
    };
    variablesJson.drawPane.sendable["sprayIntervalID"] = '';
    variablesJson.drawPane.sendable["choosenColor"] = '';
    variablesJson.drawPane.sendable["offset"] = '';
    variablesJson.drawPane.sendable["choosenPen"] = '';

    //clear main canvas so the downloaded picture dont has a black background...
    variablesJson.drawPane["ctx"].fillStyle = "white";
    variablesJson.drawPane["ctx"].fillRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);

  }

  function setDrawEventListener(move, down, up) {
    //set event listener

    /* Mouse Capturing Work */
    if (move == 'mousemove') {

      variablesJson.drawPane["tmp_canvas"].addEventListener(move, function(e) {
        variablesJson.drawPane.sendable["mouse"].x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
        variablesJson.drawPane.sendable["mouse"].y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
        //  console.log(variablesJson.drawPane.sendable["mouse"].x);
      }, false);
    } else {
      variablesJson.drawPane["tmp_canvas"].addEventListener(move, function(e) {
        var elem = document.getElementById("tmp_canvas");
        var sketch = document.getElementById("sketch");
        //sendInstructions(" "+e.touches[0].pageX+"    "+elem.getBoundingClientRect().top );
        sketch.webkitRequestFullscreen();
        variablesJson.drawPane.sendable["mouse"].x = Math.round(e.touches[0].pageX - elem.getBoundingClientRect().left);
        variablesJson.drawPane.sendable["mouse"].y = Math.round(e.touches[0].pageY - elem.getBoundingClientRect().top);
      }, false);

    }

    if (down == 'mousedown') {

      variablesJson.drawPane["tmp_canvas"].addEventListener('mousedown', function(e) {
        variablesJson.drawPane.sendable["mouse"].x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
        variablesJson.drawPane.sendable["mouse"].y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
      }, false);
    } else {
      variablesJson.drawPane["tmp_canvas"].addEventListener('touchstart', function(e) {
        var elem = document.getElementById("tmp_canvas");
        var sketch = document.getElementById("sketch");
        //sendInstructions(" "+e.touches[0].pageX+"    "+elem.getBoundingClientRect().top );
        sketch.webkitRequestFullscreen();
        variablesJson.drawPane.sendable["mouse"].x = Math.round(e.touches[0].pageX - elem.getBoundingClientRect().left);
        variablesJson.drawPane.sendable["mouse"].y = Math.round(e.touches[0].pageY - elem.getBoundingClientRect().top);
      }, false);

    }

    variablesJson.drawPane["tmp_canvas"].addEventListener(down, function(e) {
      switch (variablesJson.drawPane.sendable["choosenPen"]) {
        case "pen0":
          // Writing down to real canvas now
          variablesJson.drawPane["ctx"].drawImage(variablesJson.drawPane["tmp_canvas"], 0, 0);
          // Clearing tmp canvas
          variablesJson.drawPane["tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);
          variablesJson.drawPane["tmp_ctx"].strokeStyle = variablesJson.drawPane.sendable["choosenColor"];
          variablesJson.drawPane["tmp_ctx"].lineWidth = 5;
          variablesJson.drawPane["tmp_ctx"].beginPath();

          variablesJson.drawPane.sendable["start_mouse"].x = variablesJson.drawPane.sendable["mouse"].x;
          variablesJson.drawPane.sendable["start_mouse"].y = variablesJson.drawPane.sendable["mouse"].y;
          variablesJson.drawPane["tmp_ctx"].moveTo(variablesJson.drawPane.sendable["mouse"].x, variablesJson.drawPane.sendable["mouse"].y);
          variablesJson.drawPane["tmp_canvas"].addEventListener(move, variablesJson.drawPane["onPaint"], false);
          break;
        case "pen1":

          //try unsetting the intervall in case we havent correctly unset it when leaving the draw pane.
          try {
            clearInterval(variablesJson.drawPane.sendable["sprayIntervalID"]);
          } catch (e) {
            console.log(e);
          }

          // Writing down to real canvas now
          variablesJson.drawPane["ctx"].drawImage(variablesJson.drawPane["tmp_canvas"], 0, 0);
          // Clearing tmp canvas
          variablesJson.drawPane["tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);

          variablesJson.drawPane["tmp_canvas"].addEventListener(move, variablesJson.drawPane["onPaint"], false);



          variablesJson.drawPane.sendable["start_mouse"].x = variablesJson.drawPane.sendable["mouse"].x;
          variablesJson.drawPane.sendable["start_mouse"].y = variablesJson.drawPane.sendable["mouse"].y;

          //  console.log(variablesJson.drawPane.sendable["start_mouse"].x);

          variablesJson.drawPane["onPaint"]();
          variablesJson.drawPane.sendable["sprayIntervalID"] = setInterval(variablesJson.drawPane["onPaint"], 50);
          break;
        case "pen2":
          // Writing down to real canvas now
          variablesJson.drawPane["ctx"].drawImage(variablesJson.drawPane["tmp_canvas"], 0, 0);
          // Clearing tmp canvas
          variablesJson.drawPane["tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);
          variablesJson.drawPane["tmp_ctx"].strokeStyle = variablesJson.drawPane.sendable["choosenColor"];
          variablesJson.drawPane.sendable["pen2LineWidth"] = document.getElementById("pen2_line_width").value;
          variablesJson.drawPane["tmp_ctx"].lineWidth = variablesJson.drawPane.sendable["pen2LineWidth"];
          variablesJson.drawPane["tmp_ctx"].beginPath();

          variablesJson.drawPane.sendable["start_mouse"].x = variablesJson.drawPane.sendable["mouse"].x;
          variablesJson.drawPane.sendable["start_mouse"].y = variablesJson.drawPane.sendable["mouse"].y;
          variablesJson.drawPane["tmp_ctx"].moveTo(variablesJson.drawPane.sendable["mouse"].x, variablesJson.drawPane.sendable["mouse"].y);
          variablesJson.drawPane["tmp_canvas"].addEventListener(move, variablesJson.drawPane["onPaint"], false);
          break;
      }

    }, false);

    variablesJson.drawPane["tmp_canvas"].addEventListener(up, function() {
      //console.log("mouseup");
      switch (variablesJson.drawPane.sendable["choosenPen"]) {
        case "pen0":
          variablesJson.drawPane["tmp_canvas"].removeEventListener('touchmove', variablesJson.drawPane["onPaint"], false);
          variablesJson.drawPane["tmp_canvas"].removeEventListener('mousemove', variablesJson.drawPane["onPaint"], false);
          break;
        case "pen1":
          variablesJson.drawPane["tmp_canvas"].removeEventListener('mousemove', variablesJson.drawPane["onPaint"], false);
          variablesJson.drawPane["tmp_canvas"].removeEventListener('touchmove', variablesJson.drawPane["onPaint"], false);
          clearInterval(variablesJson.drawPane.sendable["sprayIntervalID"]);
          break;
        case "pen2":
          variablesJson.drawPane["tmp_canvas"].removeEventListener('touchmove', variablesJson.drawPane["onPaint"], false);
          variablesJson.drawPane["tmp_canvas"].removeEventListener('mousemove', variablesJson.drawPane["onPaint"], false);
          break;
      }
    }, false);

    variablesJson.drawPane["onPaint"] = function() {
      sendInstructions(JSON.stringify(variablesJson.drawPane.sendable));

      switch (variablesJson.drawPane.sendable["choosenPen"]) {
        case "pen0":
          variablesJson.drawPane["tmp_ctx"].lineTo(variablesJson.drawPane.sendable["mouse"].x, variablesJson.drawPane.sendable["mouse"].y);
          variablesJson.drawPane.sendable["start_mouse"].x = variablesJson.drawPane.sendable["mouse"].x;
          variablesJson.drawPane.sendable["start_mouse"].y = variablesJson.drawPane.sendable["mouse"].y;
          //console.log(variablesJson.drawPane["tmp_ctx"].lineWidth);
          variablesJson.drawPane["tmp_ctx"].stroke();
          break;
        case "pen1":

          // Tmp canvas is always cleared up before drawing.
          // variablesJson.drawPane["tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);

          variablesJson.drawPane["generateSprayParticles"]();
          variablesJson.drawPane.sendable["start_mouse"].x = variablesJson.drawPane.sendable["mouse"].x;
          variablesJson.drawPane.sendable["start_mouse"].y = variablesJson.drawPane.sendable["mouse"].y;

          break;
        case "pen2":
          variablesJson.drawPane["tmp_ctx"].lineTo(variablesJson.drawPane.sendable["mouse"].x, variablesJson.drawPane.sendable["mouse"].y);
          variablesJson.drawPane.sendable["start_mouse"].x = variablesJson.drawPane.sendable["mouse"].x;
          variablesJson.drawPane.sendable["start_mouse"].y = variablesJson.drawPane.sendable["mouse"].y;
          variablesJson.drawPane["tmp_ctx"].stroke();
          break;
      }
    }

    variablesJson.drawPane["generateSprayParticles"] = function() {
      // Particle count, or, density
      var density = 50;

      for (var i = 0; i < density; i++) {
        variablesJson.drawPane.sendable["offset"] = variablesJson.drawPane["getRandomOffset"](10);

        var x = variablesJson.drawPane.sendable["mouse"].x + variablesJson.drawPane.sendable["offset"].x;
        var y = variablesJson.drawPane.sendable["mouse"].y + variablesJson.drawPane.sendable["offset"].y;

        variablesJson.drawPane["tmp_ctx"].fillStyle = variablesJson.drawPane.sendable["choosenColor"];

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

  function sendInstructions(x) {
    var stringToSend = x;
    //console.log(variablesJson);
    while (stringToSend.length != 0) {
      //  console.log(stringToSend);
      //console.log(variablesJson);
      if (ws.readyState == 1) {
        //console.log(JSON.stringify(variablesJson.drawPane.sendable).length);
        ws.send(variablesJson.drawPane.sendable.clientInfo["uuid"] + stringToSend.substring(0, 164));
        //console.log("String sent: uuid: " + variablesJson.drawPane.sendable.clientInfo["uuid"] + stringToSend.substring(0, 164));
        //console.log("get canvas?: " + variablesJson.drawPane.sendable.clientInfo["requestCanvas"]);
        stringToSend = stringToSend.substring(164, stringToSend.length);
      } else {
        //console.log("##############ws has been closed. reconnecting...");
        setupWebsocketConnection();

      }
    }

    saveDataToLocalStorage();
  }

  function saveDataToLocalStorage() {
    localStorage.setItem("Net_Paint_sendable", JSON.stringify(variablesJson.drawPane.sendable));
    localStorage.setItem("Net_Paint_canvas_data", variablesJson.drawPane["canvas"].toDataURL());
  }

  function PrepareColorChooser(counter) {

    var colorArray = returnColorArray(counter);
    //console.log(colorArray);
    var colorCounter = colorArray.length - 1;
    this.trArray = [];

    for (var i = 0; i < counter; i++) {
      this.tr = document.createElement("tr");
      this.tr.setAttribute("id", "tr" + i);
      for (var x = 0; x < counter; x++) {
        this.td = document.createElement("td");
        this.td.setAttribute("id", "td" + i + "_" + x);
        this.td.setAttribute("style", "background-color: " + getNextColor() + ";"); //set color from color set
        this.space = document.createElement("br");
        this.td.addEventListener("click", function(e) {
          variablesJson.drawPane.sendable["choosenColor"] = e.toElement.style.backgroundColor;
          //  console.log(variablesJson.drawPane.sendable["choosenColor"]);
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
      this.trArray[i] = this.tr;
    }


    function getNextColor() {
      return colorArray[colorCounter--];
    }

    function returnColorArray(size) {
      var array = ['blue', 'red', 'yellow', 'green', 'lightblue', 'purple', 'orange', 'lightgreen', 'black'];
      //  for (var i = 0; i < (size * size); i++) {
      //    array[i] = "rgb(" + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ")";
      //  }
      return array;
    }

    this.removeFromDom = function() {
      for (var i = 0; i < this.trArray.length; i++) {
        this.trArray[i].remove();
      }
    }

    this.addToHTMLDom = function() {
      for (var i = 0; i < this.trArray.length; i++) {
        document.getElementById("toolsAndColors").appendChild(this.trArray[i]);
      }
    }

  }

  function start() {

    var colorchoosersize = 3; //3*3

    for (var i = 0; i < 3; i++) {
      var pens = document.getElementsByName("pen");
      //console.log(pens[i]);
      pens[i].addEventListener("click", function(e) {
        for (var b = 0; b < 3; b++) {
          var pens = document.getElementsByName("pen");
          pens[b].setAttribute("class", "notClicked");
        }
        //console.log(e.toElement.parentNode.tagName);
        if (e.toElement.parentNode.tagName == "TD") {
          e.toElement.parentNode.setAttribute("class", "clicked");
          variablesJson.drawPane.sendable["choosenPen"] = e.toElement.parentNode.id;
          if (variablesJson.drawPane.sendable["choosenPen"] == "pen2") {
            document.getElementById("pen2_line_width").parentNode.setAttribute("class", "visible");
          } else {
            document.getElementById("pen2_line_width").parentNode.setAttribute("class", "hidden");
          }
          //console.log(choosenPen);
        } else {
          e.toElement.setAttribute("class", "clicked");
          variablesJson.drawPane.sendable["choosenPen"] = e.toElement.id;
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
    setDrawEventListener('mousemove', 'mousedown', 'mouseup');
    setDrawEventListener('touchmove', 'touchstart', 'touchend');

    /* Drawing on Paint App */
    variablesJson.drawPane["tmp_ctx"].lineJoin = 'round';
    variablesJson.drawPane["tmp_ctx"].lineCap = 'round';
    variablesJson.drawPane["tmp_ctx"].strokeStyle = 'blue';
    variablesJson.drawPane["tmp_ctx"].fillStyle = 'blue'; //blue is default color
    variablesJson.drawPane.sendable["choosenColor"] = 'blue';

    pens[0].setAttribute("class", "clicked");
    variablesJson.drawPane.sendable["choosenPen"] = 'pen0';

    variablesJson.drawPane["colorChooser"] = new PrepareColorChooser(colorchoosersize);
    //console.log(variablesJson.drawPane["colorChooser"]);
    variablesJson.drawPane["colorChooser"].addToHTMLDom();

    for (var element = 3; element < (colorchoosersize * colorchoosersize) + colorchoosersize; element++) {
      var table = document.getElementById("toolsAndColors");
      var tdsInTable = table.getElementsByTagName("td");
      tdsInTable[element].setAttribute("class", "notClicked");
      if (element == 11) {
        tdsInTable[element].setAttribute("class", "clicked");
      }

    }

    variablesJson.drawPane.sendable.clientInfo["uuid"] = generateUUID();
    variablesJson.drawPane.sendable.clientInfo["groupName"] = generateUUID();
    variablesJson.drawPane.sendable.clientInfo["requestCanvas"] = false;
    //console.log("init done:");
    //console.log(JSON.stringify(variablesJson.clientInfo));
    //console.log(JSON.stringify(variablesJson.drawPane.sendable));
    //console.log(variablesJson);
    //console.log(variablesJson);

    document.getElementById("size_selector").addEventListener('change', setDrawpaneSize, false);

    setDrawpaneSize();



    //init connection to websocket broadcast server
    setupWebsocketConnection();


    variablesJson.drawPane["groupConnectButton"] = document.getElementById("groupConnectButton");

    setConnectToGroupButton();

    //try loading stuff from previos session
    loadfromLocalStorage();


    var undoButton = document.getElementById("undo_button");
    undoButton.addEventListener('click', function(e) {
      e.preventDefault();
      undoLast();
    }, false);

    var saveButton = document.getElementById("save_button");
    saveButton.addEventListener("click", downloadCanvasAsImage, false);

    var resetButton = document.getElementById("reset_button");
    resetButton.addEventListener('click', resetAll, false);




  }

  function setDrawpaneSize() {
    //    variablesJson.drawPane["sketch"].width=document.getElementById("size_selector").value;
    //    variablesJson.drawPane["sketch"].height=document.getElementById("size_selector").value;
    console.log(variablesJson.drawPane["sketch"]);
    variablesJson.drawPane["sketch"].style.width = document.getElementById("size_selector").value + "px";
    variablesJson.drawPane["sketch"].style.height = document.getElementById("size_selector").value + "px";
    variablesJson.drawPane["sketch_style"] = getComputedStyle(variablesJson.drawPane["sketch"]);
    console.log(variablesJson.drawPane["sketch_style"].getPropertyValue('width'));

    variablesJson.drawPane["canvas"].width = parseInt(variablesJson.drawPane["sketch_style"].getPropertyValue('width'));
    variablesJson.drawPane["canvas"].height = parseInt(variablesJson.drawPane["sketch_style"].getPropertyValue('height'));

    variablesJson.drawPane["tmp_canvas"].width = variablesJson.drawPane["canvas"].width;
    variablesJson.drawPane["tmp_canvas"].height = variablesJson.drawPane["canvas"].height;
    variablesJson.drawPane["received_tmp_canvas"].width = variablesJson.drawPane["canvas"].width;
    variablesJson.drawPane["received_tmp_canvas"].height = variablesJson.drawPane["canvas"].height;
    variablesJson.drawPane["tmp_ctx"].lineJoin = 'round';
    variablesJson.drawPane["tmp_ctx"].lineCap = 'round';
    variablesJson.drawPane["received_tmp_ctx"].lineJoin = 'round';
    variablesJson.drawPane["received_tmp_ctx"].lineCap = 'round';

    console.log(variablesJson.drawPane.sendable);

  }

  function setupWebsocketConnection() {
    try {
      //ws = new WebSocket("ws://mediengeil.org:8080");
      //ws = new WebSocket("ws://localhost:8080");
      //ws = new WebSocket("ws://192.168.2.104:8080");
      //ws = new WebSocket("ws://borsti1.inf.fh-flensburg.de:8080");
      //ws = new WebSocket("ws://192.168.178.55:8080");
      ws = new WebSocket("ws://192.168.43.178:8080");

      ws.onopen = function() {
        //console.log(this.readyState);
        this.send("gibUrlUndPort");
      };

      ws.onclose = function() {
        //console.log("Verbindung beendet, readyState: " + this.readyState);
      };

      var senderUuid = '';
      var storeSplittedMessage = '';
      var firstCanvasSenderUuid = '';
      var messagesByUuid = {
        "messages": {

        }
      };
      ws.onmessage = function(e) {
        //console.log(e.data);
        //console.log(storeSplittedMessage);
        //console.log(messagesByUuid.messages);
        if (e.data.substring(0, 3) == "+++") {
          //    console.log(e.data);
        } else {
          try {
            senderUuid = e.data.substring(0, 36);
            if (messagesByUuid.messages.hasOwnProperty(senderUuid)) {
              messagesByUuid.messages[senderUuid] = messagesByUuid.messages[senderUuid] + e.data.substring(36, e.data.length);
              //console.log(JSON.parse(messagesByUuid.messages[senderUuid]));
              var receivedJSON = JSON.parse(messagesByUuid.messages[senderUuid]);
              console.log(receivedJSON.clientInfo);
              //  console.log(variablesJson.drawPane.sendable.clientInfo["groupName"]);
              //messagesByUuid.messages[senderUuid] = '';
              if (receivedJSON.clientInfo["groupName"] == variablesJson.drawPane.sendable.clientInfo["groupName"]) {
                variablesJson.drawPane["received"] = receivedJSON;
                console.log(variablesJson.drawPane["received"]);

                if ((variablesJson.drawPane.received.clientInfo["groupName"] == variablesJson.drawPane.sendable.clientInfo["groupName"]) && (variablesJson.drawPane.received.clientInfo["requestCanvas"] == true)) {
                  //send our hole canvas to new joining member of our group
                  console.log("send our hole canvas###############");
                  //console.log(variablesJson.drawPane["canvas"].toDataURL());
                  variablesJson.drawPane.sendable["canvasDataUrl"] = variablesJson.drawPane["canvas"].toDataURL();
                  variablesJson.drawPane.sendable.clientInfo["requestCanvas"] = false; //set to false so other clients wont send their hole canvas back to us. (loop prevention)
                  sendInstructions(JSON.stringify(variablesJson.drawPane.sendable));
                  variablesJson.drawPane.sendable["canvasDataUrl"] = ''; //delete canvas data url from sendable so we only send it once
                  //  console.log("achtuuuuuuung: ");
                  //  console.log(variablesJson.drawPane.sendable);

                }
                if ((variablesJson.drawPane.received.clientInfo["groupName"] == variablesJson.drawPane.sendable.clientInfo["groupName"]) && (variablesJson.drawPane.sendable.clientInfo["requestCanvas"] == true) && variablesJson.drawPane.received.hasOwnProperty("canvasDataUrl")) {
                  //if we requested the hole canvas from other clients of our new group draw received results
                  //console.log("test before writing canvas");
                  //console.log(variablesJson.drawPane.received["canvasDataUrl"]);
                  var image = new Image();
                  image.src = variablesJson.drawPane.received["canvasDataUrl"];
                  variablesJson.drawPane["ctx"].drawImage(image, 0, 0);
                  variablesJson.drawPane.sendable.clientInfo["requestCanvas"] = false; //now we have the hole canvas. ne need to request it every time on send.
                  variablesJson.drawPane.sendable["canvasDataUrl"] = ''; //delete canvas data url from sendable so we only send it once

                } else {
                  if ((variablesJson.drawPane.received.clientInfo["groupName"] == variablesJson.drawPane.sendable.clientInfo["groupName"]) && (variablesJson.drawPane.received["undoLast"] == true) && variablesJson.drawPane.received.hasOwnProperty("canvasDataUrl")) {
                    //if we requested the hole canvas from other clients of our new group draw received results
                    //console.log("test before writing canvas");
                    //console.log(variablesJson.drawPane.received["canvasDataUrl"]);
                    clearDrawPane();
                    var image = new Image();
                    image.src = variablesJson.drawPane.received["canvasDataUrl"];
                    variablesJson.drawPane["ctx"].drawImage(image, 0, 0);
                    variablesJson.drawPane.sendable.clientInfo["requestCanvas"] = false; //now we have the hole canvas. ne need to request it every time on send.
                    variablesJson.drawPane.sendable["canvasDataUrl"] = ''; //delete canvas data url from sendable so we only send it once

                  } else {
                    if (variablesJson.drawPane.received.clientInfo["groupName"] == variablesJson.drawPane.sendable.clientInfo["groupName"]) {
                      drawReceived();
                    }
                  }
                }
                console.log(messagesByUuid.messages.hasOwnProperty(senderUuid));
                delete messagesByUuid.messages[senderUuid];

              } else {
                delete messagesByUuid.messages[senderUuid];
              }

            } else {
              messagesByUuid.messages[senderUuid] = e.data.substring(36, e.data.length);
            }

          } catch (err) {
            storeSplittedMessage = storeSplittedMessage + e.data.substring(36, e.data.length);
            //console.log(storeSplittedMessage);
            console.log("ERROR!!: " + err.message); //this error will mostlikely show "unexpected end of input" beacause of that 200 charecters limit on serverside
          }
        }
      }
    } catch (e) {
      //console.log("ERROR!!: " + e.message);
    }


  }


  function resetAll() {

    //ask to save
    var askForSave = confirm("Willst du dein Bild zuerst speichern?");
    console.log(askForSave);
    if (askForSave == true) {
      document.getElementById("save_button").click();

    }
    variablesJson.drawPane["ctx"].drawImage(variablesJson.drawPane["tmp_canvas"], 0, 0);
    variablesJson.drawPane["tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);
    //reset everything to zero
    variablesJson.drawPane["colorChooser"].removeFromDom();

    variablesJson = {
      "drawPane": {
        "sendable": {
          "clientInfo": {}
        },
        "received": {}
      },
    };
    localStorage.clear();
    ws.close();
    start();

  }

  function loadfromLocalStorage() {
    try {
      if (localStorage.hasOwnProperty("Net_Paint_sendable") && localStorage.hasOwnProperty("Net_Paint_canvas_data")) {
        variablesJson.drawPane.sendable = JSON.parse(localStorage.getItem("Net_Paint_sendable"));
        //set group from last session if it was connected when leaving
        if (variablesJson.drawPane.sendable.clientInfo["groupName"].search('[a-z A-Z 0-9]{8}-[a-z A-Z 0-9]{4}-[a-z A-Z 0-9]{4}-[a-z A-Z 0-9]{4}-[a-z A-Z 0-9]{12}') == -1) {
          console.log("setting groupname in html to : " + variablesJson.drawPane.sendable.clientInfo["groupName"]);
          var groupNameInHtml = document.createElement("P");
          var text = document.createTextNode(variablesJson.drawPane.sendable.clientInfo["groupName"]);
          groupNameInHtml.appendChild(text);
          document.getElementById("group-input-form").appendChild(groupNameInHtml);

          document.getElementById("connection_button").alt = "Von Gruppe trennen";
          document.getElementById("connection_button").src = "img/disconnect.png";

          variablesJson.drawPane["groupConnectButton"].removeEventListener('click', variablesJson.drawPane["connectFunction"], false);

          setDisconnectFromGroupButton();

        }

        //set pen2 line width from last session
        if (variablesJson.drawPane.sendable["pen2LineWidth"] != 21) { //!=21 as 21 is the default for this slider
          document.getElementById("pen2_line_width").value = variablesJson.drawPane.sendable["pen2LineWidth"];
        }

        //set correct choosen pen from previus session
        var pens = document.getElementsByName("pen");
        for (var i = 0; i < pens.length; i++) {
          pens[i].setAttribute("class", "notClicked");
        }
        //console.log(variablesJson.drawPane.sendable["choosenPen"]);
        document.getElementById(variablesJson.drawPane.sendable["choosenPen"]).setAttribute("class", "clicked");
        if (variablesJson.drawPane.sendable["choosenPen"] == "pen2") {
          document.getElementById("pen2_line_width").parentNode.setAttribute("class", "visible");
        }

        var image = new Image();
        image.src = localStorage.getItem("Net_Paint_canvas_data");
        variablesJson.drawPane["ctx"].drawImage(image, 0, 0);
        //console.log(JSON.parse(localStorage.getItem("Net_Paint_sendable")));
      }
    } catch (e) {
      console.log(e.message);
      //clear local storage as something dosnt seem to be correct with it and we dont want to get errors on every reload
      localStorage.clear();
    }

  }

  function downloadCanvasAsImage() {
    console.log("download");
    var filename = prompt("Bitte dateinamen eingeben:")
    if (filename != null) {

      document.getElementById("save_button").download = filename;
      variablesJson.drawPane["ctx"].drawImage(variablesJson.drawPane["tmp_canvas"], 0, 0);
      variablesJson.drawPane["tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);
      var dt = variablesJson.drawPane["canvas"].toDataURL('image/jpeg');
      this.href = dt;
    }
  }

  function undoLast() {
    //send our hole canvas to group members so everywhere our last changes would be overwritten
    console.log("send our hole canvas###############");
    //console.log(variablesJson.drawPane["canvas"].toDataURL());
    variablesJson.drawPane.sendable["canvasDataUrl"] = variablesJson.drawPane["canvas"].toDataURL();
    variablesJson.drawPane.sendable.clientInfo["requestCanvas"] = false; //set to false so other clients wont send their hole canvas back to us. (loop prevention)
    variablesJson.drawPane.sendable["undoLast"] = true;
    sendInstructions(JSON.stringify(variablesJson.drawPane.sendable));
    variablesJson.drawPane.sendable["canvasDataUrl"] = ''; //delete canvas data url from sendable so we only send it once
    variablesJson.drawPane.sendable["undoLast"] = false;
    //  console.log("achtuuuuuuung: ");
    //  console.log(variablesJson.drawPane.sendable);



    variablesJson.drawPane["tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);
  }


  function clearDrawPane() {
    //implement removal of all already drawn stuff here

    variablesJson.drawPane["tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);
    variablesJson.drawPane["ctx"].clearRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);
  }

  function setConnectToGroupButton() {

    variablesJson.drawPane["groupConnectButton"].addEventListener('click', variablesJson.drawPane["connectFunction"], false);

  }

  variablesJson.drawPane["connectFunction"] = function(e) {
    e.preventDefault();
    variablesJson.drawPane.sendable.clientInfo["groupName"] = document.getElementById("groupName").value;
    variablesJson.drawPane.sendable.clientInfo["requestCanvas"] = true;
    getCanvasFromOtherClients();
    //variablesJson.drawPane.sendable.clientInfo["requestCanvas"]=false; //cant set it to false here because in ws.onmessage case to paint would be wrong
    console.log("Gruppenname: " + variablesJson.drawPane.sendable.clientInfo["groupName"]);
    var groupNameInHtml = document.createElement("P");
    var text = document.createTextNode(variablesJson.drawPane.sendable.clientInfo["groupName"]);
    groupNameInHtml.appendChild(text);
    document.getElementById("group-input-form").appendChild(groupNameInHtml);

    document.getElementById("connection_button").alt = "Von Gruppe trennen";
    document.getElementById("connection_button").src = "img/disconnect.png";
    variablesJson.drawPane["groupConnectButton"].removeEventListener('click', variablesJson.drawPane["connectFunction"], false);
    setDisconnectFromGroupButton();
  }


  function getCanvasFromOtherClients() {
    console.log(JSON.stringify(variablesJson.drawPane.sendable));
    sendInstructions(JSON.stringify(variablesJson.drawPane.sendable));
  }

  function setDisconnectFromGroupButton() {
    variablesJson.drawPane["groupConnectButton"].addEventListener('click', function disconnect(e) {
      e.preventDefault();
      document.getElementById("group-input-form").removeChild(document.getElementById("group-input-form").lastChild);
      document.getElementById("connection_button").alt = "Mit Gruppe verbinden";
      document.getElementById("connection_button").src = "img/connect.png";
      variablesJson.drawPane.sendable.clientInfo["groupName"] = generateUUID(); //beacause a uuid is as its name says universal unique no other client will have the same groupname so no draw instructions that will be received will be shown
      variablesJson.drawPane["groupConnectButton"].removeEventListener('click', disconnect, false);
      saveDataToLocalStorage();
      setConnectToGroupButton();
    }, false);
  }

  function disconnectFromGroup() {

  }

  function drawReceived() {
    //console.log(variablesJson.drawPane.received);

    variablesJson.drawPane.received["generateSprayParticles"] = function() {

      //console.log("received paint pen1");
      //console.log(variablesJson.drawPane.received);
      // Particle count, or, density
      var density = 50;

      for (var i = 0; i < density; i++) {
        variablesJson.drawPane.received["offset"] = variablesJson.drawPane["getRandomOffset"](10);

        var x = variablesJson.drawPane.received["mouse"].x + variablesJson.drawPane.received["offset"].x;
        var y = variablesJson.drawPane.received["mouse"].y + variablesJson.drawPane.received["offset"].y;
        variablesJson.drawPane["received_tmp_ctx"].fillStyle = variablesJson.drawPane.received["choosenColor"];

        variablesJson.drawPane["received_tmp_ctx"].fillRect(x, y, 1, 1);
      }

    }

    switch (variablesJson.drawPane.received["choosenPen"]) {
      case "pen0":
        // Writing down to real canvas now
        variablesJson.drawPane["ctx"].drawImage(variablesJson.drawPane["received_tmp_canvas"], 0, 0);
        // Clearing tmp canvas
        variablesJson.drawPane["received_tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["received_tmp_canvas"].width, variablesJson.drawPane["received_tmp_canvas"].height);
        variablesJson.drawPane["received_tmp_ctx"].lineWidth = 5;

        variablesJson.drawPane["received_tmp_ctx"].beginPath();
        variablesJson.drawPane["received_tmp_ctx"].moveTo(variablesJson.drawPane.received["start_mouse"].x, variablesJson.drawPane.received["start_mouse"].y);

        //console.log(variablesJson.drawPane.received["choosenColor"]);
        variablesJson.drawPane["received_tmp_ctx"].strokeStyle = variablesJson.drawPane.received["choosenColor"];
        variablesJson.drawPane["received_tmp_ctx"].lineTo(variablesJson.drawPane.received["mouse"].x, variablesJson.drawPane.received["mouse"].y);
        variablesJson.drawPane["received_tmp_ctx"].stroke();

        break;
      case "pen1":

        //try unsetting the intervall in case we havent correctly unset it when leaving the draw pane.
        try {
          clearInterval(variablesJson.drawPane.received["sprayIntervalID"]);
        } catch (e) {
          //console.log(e);
        }

        // Writing down to real canvas now
        variablesJson.drawPane["ctx"].drawImage(variablesJson.drawPane["received_tmp_canvas"], 0, 0);
        // Clearing tmp canvas
        variablesJson.drawPane["received_tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["received_tmp_canvas"].width, variablesJson.drawPane["received_tmp_canvas"].height);

        variablesJson.drawPane.received["generateSprayParticles"]();

        //  variablesJson.drawPane.received["sprayIntervalID"] = setInterval(variablesJson.drawPane["onPaint"], 50);
        break;

      case "pen2":
        // Writing down to real canvas now
        variablesJson.drawPane["ctx"].drawImage(variablesJson.drawPane["received_tmp_canvas"], 0, 0);
        // Clearing tmp canvas
        variablesJson.drawPane["received_tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["received_tmp_canvas"].width, variablesJson.drawPane["received_tmp_canvas"].height);
        variablesJson.drawPane["received_tmp_ctx"].lineWidth = variablesJson.drawPane.received["pen2LineWidth"];
        variablesJson.drawPane["received_tmp_ctx"].beginPath();
        variablesJson.drawPane["received_tmp_ctx"].moveTo(variablesJson.drawPane.received["start_mouse"].x, variablesJson.drawPane.received["start_mouse"].y);

        //console.log(variablesJson.drawPane.received["choosenColor"]);
        variablesJson.drawPane["received_tmp_ctx"].strokeStyle = variablesJson.drawPane.received["choosenColor"];
        variablesJson.drawPane["received_tmp_ctx"].lineTo(variablesJson.drawPane.received["mouse"].x, variablesJson.drawPane.received["mouse"].y);
        variablesJson.drawPane["received_tmp_ctx"].stroke();

        break;
    }

  }

  function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }



  window.addEventListener("load", start);


}());
