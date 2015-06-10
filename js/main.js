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


  }

  function setDrawEventListener() {
    //set event listener

    /* Mouse Capturing Work */
    variablesJson.drawPane["tmp_canvas"].addEventListener('mousemove', function(e) {
      variablesJson.drawPane.sendable["mouse"].x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
      variablesJson.drawPane.sendable["mouse"].y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
    }, false);

    variablesJson.drawPane["tmp_canvas"].addEventListener('mousedown', function(e) {
      switch (variablesJson.drawPane.sendable["choosenPen"]) {
        case "pen0":
          // Writing down to real canvas now
          variablesJson.drawPane["ctx"].drawImage(variablesJson.drawPane["tmp_canvas"], 0, 0);
          // Clearing tmp canvas
          variablesJson.drawPane["tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);
          variablesJson.drawPane["tmp_ctx"].strokeStyle = variablesJson.drawPane.sendable["choosenColor"];
          variablesJson.drawPane["tmp_ctx"].beginPath();
          variablesJson.drawPane.sendable["start_mouse"].x = variablesJson.drawPane.sendable["mouse"].x;
          variablesJson.drawPane.sendable["start_mouse"].y = variablesJson.drawPane.sendable["mouse"].y;
          variablesJson.drawPane["tmp_ctx"].moveTo(variablesJson.drawPane.sendable["mouse"].x, variablesJson.drawPane.sendable["mouse"].y);
          variablesJson.drawPane["tmp_canvas"].addEventListener('mousemove', variablesJson.drawPane["onPaint"], false);
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

          variablesJson.drawPane["tmp_canvas"].addEventListener('mousemove', variablesJson.drawPane["onPaint"], false);

          variablesJson.drawPane.sendable["mouse"].x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
          variablesJson.drawPane.sendable["mouse"].y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;

          variablesJson.drawPane.sendable["start_mouse"].x = variablesJson.drawPane.sendable["mouse"].x;
          variablesJson.drawPane.sendable["start_mouse"].y = variablesJson.drawPane.sendable["mouse"].y;

          //  console.log(variablesJson.drawPane.sendable["start_mouse"].x);

          variablesJson.drawPane["onPaint"]();
          variablesJson.drawPane.sendable["sprayIntervalID"] = setInterval(variablesJson.drawPane["onPaint"], 50);
          break;
      }

    }, false);

    variablesJson.drawPane["tmp_canvas"].addEventListener('mouseup', function() {
      //console.log("mouseup");
      switch (variablesJson.drawPane.sendable["choosenPen"]) {
        case "pen0":
          variablesJson.drawPane["tmp_canvas"].removeEventListener('mousemove', variablesJson.drawPane["onPaint"], false);
          break;
        case "pen1":
          variablesJson.drawPane["tmp_canvas"].removeEventListener('mousemove', variablesJson.drawPane["onPaint"], false);
          clearInterval(variablesJson.drawPane.sendable["sprayIntervalID"]);
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
    while (stringToSend.length != 0) {
      //  console.log(stringToSend);
      //console.log(variablesJson);
      if (ws.readyState == 1) {
        //console.log(JSON.stringify(variablesJson.drawPane.sendable).length);
        ws.send(stringToSend.substring(0, 200));
        console.log("String sent: " + stringToSend.substring(0, 200));
        console.log("get canvas?: "+variablesJson.drawPane.sendable.clientInfo["requestCanvas"]);
        stringToSend = stringToSend.substring(200, stringToSend.length);
      } else {
        //console.log("##############ws has been closed. reconnecting...");
        ws = new ConnectToWebsocketBroadcastServer();
        ws.onopen = function() {
          this.send("gibUrlUndPort");
          this.send(stringToSend.substring(0, 200));
          stringToSend = stringToSend.substring(200, stringToSend.length);
        }
      }
    }
  }

  function PrepareColorChooser(counter) {

    var colorArray = returnColorArray(counter);
    //console.log(colorArray);
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
      document.getElementById("toolsAndColors").appendChild(this.tr);
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
    setDrawEventListener();

    /* Drawing on Paint App */
    variablesJson.drawPane["tmp_ctx"].lineWidth = 5;
    variablesJson.drawPane["tmp_ctx"].lineJoin = 'round';
    variablesJson.drawPane["tmp_ctx"].lineCap = 'round';
    variablesJson.drawPane["tmp_ctx"].strokeStyle = 'blue';
    variablesJson.drawPane["tmp_ctx"].fillStyle = 'blue'; //blue is default color
    variablesJson.drawPane.sendable["choosenColor"] = 'blue';

    pens[0].setAttribute("class", "clicked");
    variablesJson.drawPane.sendable["choosenPen"] = 'pen0';

    var colorChooser = new PrepareColorChooser(colorchoosersize);

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

  websocketConnectionManager();
    setConnectToGroupButton();

  }

  function websocketConnectionManager(){
    var storeSplittedMessage = '';
    ws = new ConnectToWebsocketBroadcastServer();

    ws.onmessage = function(e) {
      //console.log(e.data);
      console.log(storeSplittedMessage);
      if (e.data.substring(0, 3) == "+++") {
        //    console.log(e.data);
      } else {
        try {
          var receivedJSON = JSON.parse(storeSplittedMessage + e.data)
          variablesJson.drawPane.received = receivedJSON;
          console.log(receivedJSON);

          if ((variablesJson.drawPane.received.clientInfo["groupName"] == variablesJson.drawPane.sendable.clientInfo["groupName"]) && (variablesJson.drawPane.received.clientInfo["requestCanvas"] == true)) {
            //send our hole canvas to new joining member of our group

            console.log(variablesJson.drawPane["canvas"].toDataURL());
            variablesJson.drawPane.sendable["canvasDataUrl"] = variablesJson.drawPane["canvas"].toDataURL();
            variablesJson.drawPane.sendable.clientInfo["requestCanvas"] = false; //set to false so other clients wont send their hole canvas back to us. (loop prevention)
            sendInstructions(JSON.stringify(variablesJson.drawPane.sendable));
            variablesJson.drawPane.sendable["canvasDataUrl"]=''; //delete canvas data url from sendable so we only send it once
            console.log("achtuuuuuuung: ");
            console.log(variablesJson.drawPane.sendable);

          }
          if ((variablesJson.drawPane.received.clientInfo["groupName"] == variablesJson.drawPane.sendable.clientInfo["groupName"]) && (variablesJson.drawPane.sendable.clientInfo["requestCanvas"] == true) && variablesJson.drawPane.received.hasOwnProperty("canvasDataUrl")) {
            //if we requested the hole canvas from other clients of our new group draw received results
            console.log("test before writing canvas");
            console.log(variablesJson.drawPane.received["canvasDataUrl"]);
            var image = new Image();
            image.src=variablesJson.drawPane.received["canvasDataUrl"];
            variablesJson.drawPane["ctx"].drawImage(image, 0, 0);
            variablesJson.drawPane.sendable.clientInfo["requestCanvas"] = false; //now we have the hole canvas. ne need to request it every time on send.
            variablesJson.drawPane.sendable["canvasDataUrl"]=''; //delete canvas data url from sendable so we only send it once

          } else {
            if (variablesJson.drawPane.received.clientInfo["groupName"] == variablesJson.drawPane.sendable.clientInfo["groupName"]) {
              drawReceived();
            }
          }
          storeSplittedMessage = '';
        } catch (err) {
          storeSplittedMessage = storeSplittedMessage + e.data;
          //console.log(storeSplittedMessage);
          console.log("ERROR!!: " + err.message);
        }
      }
    }
  }

  function setConnectToGroupButton() {
    var groupConnectButton = document.getElementById("groupConnectButton");
    groupConnectButton.addEventListener('click', function connect(e) {
      variablesJson.drawPane.sendable.clientInfo["groupName"] = document.getElementById("groupName").value;
      variablesJson.drawPane.sendable.clientInfo["requestCanvas"] = true;
      getCanvasFromOtherClients();
      //variablesJson.drawPane.sendable.clientInfo["requestCanvas"]=false; //cant set it to false here because in ws.onmessage case to paint would be wrong
      e.preventDefault();
      console.log("Gruppenname: " + variablesJson.drawPane.sendable.clientInfo["groupName"]);
      var groupNameInHtml = document.createElement("P");
      var text = document.createTextNode(variablesJson.drawPane.sendable.clientInfo["groupName"]);
      groupNameInHtml.appendChild(text);
      document.getElementById("group-input-form").appendChild(groupNameInHtml);
      groupConnectButton.removeEventListener('click', connect, false);
      groupConnectButton.value = "Von Gruppe trennen";
      setDisconnectFromGroupButton();
    }, false);

  }

  function getCanvasFromOtherClients() {
    console.log(JSON.stringify(variablesJson.drawPane.sendable));
    sendInstructions(JSON.stringify(variablesJson.drawPane.sendable));
  }

  function setDisconnectFromGroupButton() {
    groupConnectButton.addEventListener('click', function disconnect(e) {
      e.preventDefault();
      document.getElementById("group-input-form").removeChild(document.getElementById("group-input-form").lastChild);
      groupConnectButton.value = "Mit Gruppe verbinden";
      variablesJson.drawPane.sendable.clientInfo["groupName"] = generateUUID(); //beacause a uuid is as its name says universal unique no other client will have the same groupname so no draw instructions that will be received will be shown
      groupConnectButton.removeEventListener('click', disconnect, false);
      setConnectToGroupButton()
    }, false);
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
        variablesJson.drawPane["tmp_ctx"].fillStyle = variablesJson.drawPane.received["choosenColor"];

        variablesJson.drawPane["tmp_ctx"].fillRect(x, y, 1, 1);
      }

    }

    switch (variablesJson.drawPane.received["choosenPen"]) {
      case "pen0":
        // Writing down to real canvas now
        variablesJson.drawPane["ctx"].drawImage(variablesJson.drawPane["tmp_canvas"], 0, 0);
        // Clearing tmp canvas
        variablesJson.drawPane["tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);

        variablesJson.drawPane["tmp_ctx"].beginPath();
        variablesJson.drawPane["tmp_ctx"].moveTo(variablesJson.drawPane.received["start_mouse"].x, variablesJson.drawPane.received["start_mouse"].y);

        //console.log(variablesJson.drawPane.received["choosenColor"]);
        variablesJson.drawPane["tmp_ctx"].strokeStyle = variablesJson.drawPane.received["choosenColor"];
        variablesJson.drawPane["tmp_ctx"].lineTo(variablesJson.drawPane.received["mouse"].x, variablesJson.drawPane.received["mouse"].y);
        variablesJson.drawPane["tmp_ctx"].stroke();

        break;
      case "pen1":

        //try unsetting the intervall in case we havent correctly unset it when leaving the draw pane.
        try {
          clearInterval(variablesJson.drawPane.received["sprayIntervalID"]);
        } catch (e) {
          //console.log(e);
        }

        // Writing down to real canvas now
        variablesJson.drawPane["ctx"].drawImage(variablesJson.drawPane["tmp_canvas"], 0, 0);
        // Clearing tmp canvas
        variablesJson.drawPane["tmp_ctx"].clearRect(0, 0, variablesJson.drawPane["tmp_canvas"].width, variablesJson.drawPane["tmp_canvas"].height);

        variablesJson.drawPane.received["generateSprayParticles"]();

        //  variablesJson.drawPane.received["sprayIntervalID"] = setInterval(variablesJson.drawPane["onPaint"], 50);
        break;
    }

  }

  function ConnectToWebsocketBroadcastServer() {

    //init connection to websocket broadcast server
    try {
      //this.websocketConnection = new WebSocket("ws://mediengeil.org:8080");
      this.websocketConnection = new WebSocket("ws://mediengeil.org:8080");

      this.websocketConnection.onopen = function() {
        //console.log(this.readyState);
        this.send("gibUrlUndPort");
      };

      this.websocketConnection.onclose = function() {
        //console.log("Verbindung beendet, readyState: " + this.readyState);
      };
    } catch (e) {
      //console.log("ERROR!!: " + e.message);
    }
    return this.websocketConnection;

    ///////////////////////////////////////////////
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
