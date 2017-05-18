//pubsub
var events = {
  events:{   //  setTime: []
  },
  on : function(eventName, fn){
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  },
  off: function(eventName, fn){
    if (this.events[eventName]) {
      for (var i = 0; i < this.events[eventName].length; i ++){
        if(this.events[eventName][i] === fn){
          this.events[eventName].splice(i, 1);
          break;
        }
      }
    }
  },
  emit: function(eventName, data){
    if (this.events[eventName]){
      this.events[eventName].forEach(function(fn){
        fn(data);
      });
    }
  }
};

var state = {
  ON : 1,
  OFF : 0,
  SESSION:1,
  BREAK: 0
};


//clock module
var pclock = (function(){
  var $startStopBtn = $('#start-stop-btn');
  var $clockLabel = $('#clockLabel');
  //currentTime is in seconds
  var currentTime =  25*60;
  var sessionTime = 25*60;
  var breakTime = 5*60;
  var clockState = state.OFF;
  var clockMode = state.SESSION;
  var intervalVar ;

  //Bind events
  $startStopBtn.on('click', run);
  events.on("SessionStateChanged", setSession);
  events.on("BreakeStateChanged", setBreak);

  //Store break time in seconds
  function setBreak(breakT){
    breakTime = breakT*60;
  }

  //Store session time in seconds
  function setSession(sessionT){
    sessionTime = sessionT*60;
    currentTime = sessionTime;
    $clockLabel.html(currentTime/60);
  }

  function run(){
    if (clockState === state.OFF){
      clockState = state.ON;
      events.emit("clockStateChanged", clockState);
      startClock();
    }
    else if (clockState === state.ON){
      clockState = state.OFF;
      events.emit("clockStateChanged", clockState);
      stopClock();
    }
  }

  function setState(state){
    clockState = state;
  }

  function getClockState(){
    return clockState;
  }

  function startClock(){
    intervalVar = setInterval(render, 1000);
  }

  function stopClock() {
    clearInterval(intervalVar);
    clockState = state.OFF;
  }

  //Render currentTime of session/breaktime depending on current clock mode.
  function render (){
    if (clockMode === state.SESSION){
      currentTime--;
      $clockLabel.html(parseForDisplay(currentTime));
      if (currentTime === 0){
        clockMode = state.BREAK;
        
        // alarm     
        var wav = 'http://soundbible.com/grab.php?id=1531&type=mp3';
        var audio = new Audio(wav);
			  audio.play();
        
        currentTime = breakTime;
      }
    }
    else if (clockMode === state.BREAK){
      currentTime--;
      $clockLabel.html(parseForDisplay(currentTime));
      if (currentTime === 0){
        clockMode = state.SESSION;
        
        // alarm     
        var wav = 'http://soundbible.com/grab.php?id=1531&type=mp3';
        var audio = new Audio(wav);
			  audio.play();
        
        currentTime = sessionTime;
      }
    }
  }

  //Convert time in second to be shown in 4 different ways
  //1:10:02 - if total time > 1 hour
  //20:10   - if total time > 10 minute
  //1:03    - if total time > 1 minute
  //14      - if total time < 1 minute
  function parseForDisplay(timeT){
    var hours = Math.floor(timeT/3600);
    var minutes = Math.floor((timeT - (hours * 3600)) / 60);
    var seconds = timeT - (hours * 3600) - (minutes * 60);
    var time = "";

    if (hours !== 0) {
      time = hours+":";
    }
    if (minutes !== 0 || time !== "") {
      minutes = (minutes < 10 && time !== "") ? "0"+minutes : minutes;
      time += minutes+":";
    }
    if (time === "") {
      time = seconds;
    }
    else {
      time += (seconds < 10) ? "0"+seconds : seconds;
    }
    return time;
  }

  return {
    getClockState: getClockState,
    startClock: startClock,
    stopClock: stopClock
  };
})();

//Break module
var pbreak = (function(){
  var $decBreakBtn = $('#dec-break-btn');
  var $incBreakBtn = $('#inc-break-btn');
  var $breakTime = $('#breakTime');
  var breakTime = 5;
  var clockState = state.OFF;

  //Bind events
  $decBreakBtn.on('click', decBreakTime);
  $incBreakBtn.on('click', incBreakTime);
  events.on("clockStateChanged", setState);

  function render(){
    $breakTime.html(breakTime);
  }

  function setState(state){
    clockState = state;
  }

  //Break cannot be smaller than 1 min
  function decBreakTime(){
    if (breakTime > 1 && clockState === state.OFF){
      breakTime--;
      events.emit("BreakeStateChanged", breakTime);
      render();
    }
  }

  function incBreakTime(){
    if (clockState === state.OFF){
      breakTime++;
      events.emit("BreakeStateChanged", breakTime);
      render();
    }
  }

  function getBreakTime(){
    return breakTime;
  }

  return {
    getBreakTime: getBreakTime
  };
})();


//Session module
var pSession = (function(){
  var $decSessionBtn = $('#dec-session-btn');
  var $incSessionBtn = $('#inc-session-btn');
  var $sessionTime = $('#sessionTime');
  var sessionTime = 25;
  var clockState = state.OFF;

  //Bind events
  $decSessionBtn.on('click', decSessionTime);
  $incSessionBtn.on('click', incSessionTime);
  events.on("clockStateChanged", setState);

  function render(){
    $sessionTime.html(sessionTime);
  }

  function setState(state){
    clockState = state;
  }

  //Session cannot be smaller than 1 min
  function decSessionTime(){
    if (sessionTime > 1 && clockState === state.OFF){
      sessionTime--;
      events.emit("SessionStateChanged", sessionTime);
      render();
    }
  }

  function incSessionTime(){
    if (clockState === state.OFF){
      sessionTime++;
      events.emit("SessionStateChanged", sessionTime);
      render();
    }
  }

  function getSessionTime(){
    return sessionTime;
  }

  return {
    getSessionTime: getSessionTime
  };
})();