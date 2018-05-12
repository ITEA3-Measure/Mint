var redis = require("redis");
var util = require("util");

var settings = {
  eventbus: {
    type: 'redis',
    host: 'localhost',
    port: 6379
  }
};

var timestore = null;

MMT = {

  Version: '1.0',
  Types: {
    timestamp: 'timestamp',
    timer: 'timer',
    timeout: 'timeout',
    attribute: 'attribute',
    event: 'event',
    verdict: 'verdict'
  },

  init: function(_settings) {
    //TODO: add alidation here
    if( _settings ) {
      settings = _settings;
    }

    timestore = new MMT.TimeStore();
    MMT.publisher = redis.createClient(settings.eventbus.port, settings.eventbus.host);
  },

  createEFSM: function(efsm) {
    return new MMT.EFSM(efsm);
  },

  tickJSON: function(ts) {
    return {
      v: MMT.Version,
      ts: ts,
      type: MMT.Types.timestamp
    }
  },

  timeoutJSON: function(ts, timeout, id, instance_id/*, triggered_state*/) {
    var to = {
      v: MMT.Version,
      ts: ts,
      type: MMT.Types.timeout,
      data: {
        id: id,
        value: timeout
      }
    };
    if(instance_id) to.data.instance_id = instance_id;
    //if(triggered_state) to.data.state = triggered_state;

    return to;
  },

  addTimerJSON: function(ts, delay, id, instance_id, state) {
    var timer = {
      v: MMT.Version,
      ts: ts,
      type: MMT.Types.timer,
      data: {
        id: id,
        state: state,
        value: delay,
        isperiodic: false
      }
    };

    if(instance_id) timer.data.instance_id = instance_id;
    return timer;
  },

  addPeriodicTimerJSON: function(ts, delay, id, instance_id) {
    var timer = {
      v: MMT.Version,
      ts: ts,
      type: MMT.Types.timer,
      data: {
        id: id,
        value: delay,
        isperiodic: true
      }
    };

    if(instance_id) timer.data.instance_id = instance_id;
    return timer;
  },

  attributeJSON: function(ts, id, value, attributes, instance_id) {
    var attr = {
      v: MMT.Version,
      ts: ts,
      type: MMT.Types.attribute,
      data: {
        id: id,
        value: value
      },
      attributes: attributes
    };
    if(instance_id) attr.data.instance_id = instance_id;

    return attr;    
  },

  eventJSON: function(ts, id, value, attributes, instance_id) {
    var event = {
      v: MMT.Version,
      ts: ts,
      type: MMT.Types.event,
      data: {
        id: id,
        value: value
      },
      attributes: attributes
    };
    if(instance_id) event.data.instance_id = instance_id;

    return event;
  },

  verdictJSON: function(ts, id, value, attributes, instance_id) {
    var verdict = {
      v: MMT.Version,
      ts: ts,
      type: MMT.Types.verdict,
      data: {
        id: id,
        value: value
      },
      attributes: attributes
    };
    if(instance_id) verdict.data.instance_id = instance_id;

    return verdict;
  },

  changeVariableValue: function(inst_id, name, val){
    var change = {
      instance_id: inst_id,
      varname: name,
      newvalue: val,
    }

    return change;
  },

  wipeLog: function (active_state, evt, msg) {
    active_state.wipeLog();
  },

  printLog: function (active_state, evt, msg) {
    console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
    console.log(active_state.eventLog);
    console.log('<<<<<<<<<<<<<<< End.');
  },

  printActiveState: function (active_state, evt, msg) {
    console.log('Active State : ' + active_state.state.id);
  },

  startTimer: function (active_state, evt, msg, opts) {
    if(!opts || !opts.timeout || !opts.name) {
        throw new Error('(MMT.startTimer) Parameter error: opts parameter must have timeout and name elements!');  
    }
    MMT.publisher.publish('timeout.add', JSON.stringify(MMT.addTimerJSON(msg.ts, opts.timeout, opts.name, active_state.instance_id, active_state.state.id)));
  },


  emitEvent: function (active_state, evt, msg, opts) {
    if(!opts || !opts.name) {
        throw new Error('(MMT.emitEvent) Parameter error: opts parameter must have name element!');
    }
    MMT.publisher.publish(opts.name, JSON.stringify(MMT.eventJSON(msg.ts, opts.name, opts.value?opts.value:msg.data.value, opts.attributes?opts.attributes:msg.attributes, msg.data.instance_id)));
  },

  emitVerdict: function (active_state, evt, msg, opts) {
    if(!opts || typeof opts.value === 'undefined') {
        throw new Error('(MMT.emitVerdict) Parameter error: opts parameter must have value element!');
    }
    MMT.publisher.publish(active_state.efsm.id + (opts.property ? '.' + opts.property : '') + '.verdict', JSON.stringify(MMT.verdictJSON(msg.ts, active_state.efsm.id + (opts.property? '.' + opts.property:'') + '.verdict', opts.value, opts.attributes?opts.attributes:msg.attributes, msg.data.instance_id)));
  },

  emitSuccessVerdict: function (active_state, evt, msg, opts) {
    MMT.publisher.publish(active_state.efsm.id + (opts.property ? '.' + opts.property : '') + '.verdict', JSON.stringify(MMT.verdictJSON(msg.ts, active_state.efsm.id + (opts.property? '.' + opts.property:'') + '.verdict', 'Success', opts.attributes?opts.attributes:msg.attributes, msg.data.instance_id)));
  },

  emitFailVerdict: function (active_state, evt, msg, opts) {
    MMT.publisher.publish(active_state.efsm.id + (opts.property ? '.' + opts.property : '') + '.verdict', JSON.stringify(MMT.verdictJSON(msg.ts, active_state.efsm.id + (opts.property? '.' + opts.property:'') + '.verdict', 'Fail', opts.attributes?opts.attributes:msg.attributes, msg.data.instance_id)));
  },

  emitInconclusiveVerdict: function (active_state, evt, msg, opts) {
    MMT.publisher.publish(active_state.efsm.id + (opts.property ? '.' + opts.property : '') + '.verdict', JSON.stringify(MMT.verdictJSON(msg.ts, active_state.efsm.id + (opts.property? '.' + opts.property:'') + '.verdict', 'Inconclusive', opts.attributes?opts.attributes:msg.attributes, msg.data.instance_id)));
  },

  cloneVector: function(vars){
    var obj = [];
    for(var l in vars) {
      obj.push({name: vars[l].name, value: vars[l].value});
    }
    return obj;
  },

  getPaths: function (machine, length){
    // This functions return the paths of lenght "length" as an array
    // Each path is an array of objects containing:
    // * state : the state "from"
    // * event : the event that needs to be triggered to reach the next state
    // * vars : the context variables (and its values) at this state

    // First, make a copy of the container of states
    var vector = machine.getVector();
    return machine.buildPaths('init', length, vector, []);
  },

  evalQoE: function (traces, qoemodel){
    var results = [];

    for(var l in traces){ // For each trace
      var restrace = [];
      var trace = traces[l];

      for(var n in trace){ // For each step in the trace
        var step = trace[n]
        var args = [];
        for(var i in step.vars) { // Build the array with the variables' values
          args[step.vars[i].name] = step.vars[i].value;
        }

        // Apply the QoE Model using the variables
        var qoeval = qoemodel(args);
        restrace.push({state: step.state , event: step.event , vars: step.vars , qoe: qoeval});
      }
      results.push(restrace);
    }

    return results;
  },

  analyzeTraces: function (traces, minQoE, threshold){
    // traces: the traces object previosly treated by evalQoE
    // minQoE: minimal desired QoE value at ANY moment
    // threshold: maximal tolerable QoE decay in a single transition. What if we expand this to 2 or n transitions?
    var under_min = []; // Under minimal found traces
    var over_threshold = []; // Traces that overpassed the tolerable difference of QoE

    for(var trac in traces){ // For each trace
      var undermin = 0; // If the trace is under the min
      var qoeundermin = -1; // Last detected QoE value under the min

      var overthres = 0; // If the trace is over the allowed threshold
      var state1 = "", state2 = ""; // Last two states between the drop on the QoE was detected
      var qoest1 = 0, qoest2 = 0; // QoE at those two states
      var lastQoE = traces[trac][0].qoe; // Initial value of lastQoE

      for (var step in traces[trac]){ // For each step in the trace
        if(traces[trac][step].qoe < minQoE){
          // This trace has an unaccpetable QoE value
          undermin = 1;
          qoeundermin = traces[trac][step].qoe;
        }
        if((lastQoE - traces[trac][step].qoe) > threshold){
          // The last transition overpassed the threshold
          overthres = 1;
          state1 = traces[trac][step-1].state;
          qoest1 = traces[trac][step-1].qoe;
          state2 = traces[trac][step].state;
          qoest2 = traces[trac][step].qoe;
        }

        lastQoE = traces[trac][step].qoe;
      }

      // Classify the whole trace
      if(undermin == 1)
        over_threshold.push({trace: traces[trac], QoE: qoeundermin});
      if(overthres == 1)
        under_min.push({
          trace: traces[trac],
          transition: state1 + " -> " + state2,
          QoETransition: qoest1 + " -> " + qoest2,
          QoEDelta: qoest2 - qoest1
        });
    }
    return {underMin: under_min, overThreshold: over_threshold};
  }
}

MMT.Timeout = function(id, start_ts, delay, state, opts) {
  this.id = id;
  
  this.instance_id = null;
  if(opts.instance_id) this.instance_id = opts.instance_id;

  this.start_ts = start_ts;
  this.expiry_ts = start_ts + delay;
  this.delay = delay;
  this.isperiodic = false;

  this.state = state;

  if(opts.isperiodic) this.isperiodic = true;
}

//Should be called on periodic timers
MMT.Timeout.prototype.update = function(ts) {
  //Extra check
  if(this.isperiodic) {
    /* TODO: BW: check this out, do we consider the expiry time as the new start time
     * or we consider the time when the expiration was detected as the new start time
     */
    this.start_ts = this.expiry_ts;
    this.expiry_ts = this.start_ts + this.delay;
  }
}

MMT.TimeStore = function(opts) {
  this.sub_tick = redis.createClient(settings.eventbus.port, settings.eventbus.host);
  this.sub_to = redis.createClient(settings.eventbus.port, settings.eventbus.host);

  this.pub = redis.createClient(settings.eventbus.port, settings.eventbus.host);
  this.sub_tick.subscribe('tick');
  this.sub_to.subscribe('timeout.add');

  /* This is the new container for timeouts.
   * Basically, it's a dictionary maping each
  */
  this.timeouts = [];
  
  var self = this;

  this.sub_tick.on('message', function (channel, message) {
    try {
      var msg = JSON.parse(message);
      if(msg.ts) self.processTick(msg.ts);
    } catch(err) {
      console.log(err);
    }
  });

  this.sub_to.on('message', function (channel, message) {
    try {
      //msg is expected to have addTimer format
      var msg = JSON.parse(message);
      if(msg.ts && msg.data && msg.data.id && msg.data.value) {
        self.addTimeout(new MMT.Timeout(msg.data.id, msg.ts, msg.data.value /* value in the data part of the msg holds the delay */, msg.data.state, {instance_id: msg.data.instance_id}));
      }
    } catch(err) {
      console.log(err);
    }
  });
}

//private function
MMT.TimeStore.prototype.addTimeout = function(to) {
  //
  if(this.timeouts.length === 0){
    this.timeouts = [{state: to.state, timeout: to}];
    return;
  }

  for(var i in this.timeouts){
    if(this.timeouts[i].state === to.state){
      // refresh the timeout of this state
      this.timeouts[i].timeout = to;
      return;
    }
  }

  var ev = {state: to.state, timeout: to};
  this.timeouts.push(ev);
}

MMT.TimeStore.prototype.processTick = function(tick_ts) {
  //TODO: This is just a PoC, we can't handle thousands of timers this way
  //for now, we will proceed by ignoring all perf issues :)
  for(var i in this.timeouts){
    if(this.timeouts[i].timeout.expiry_ts < tick_ts){
      // The event expired, delete it
      this.timeouts.splice(i, 1);
    }

    if(tick_ts === this.timeouts[i].timeout.expiry_ts){
      // trigger this event
      var ev = this.timeouts[i].timeout;
      this.pub.publish('timeout.' + ev.id, JSON.stringify(MMT.timeoutJSON(tick_ts, ev.expiry_ts, ev.id, ev.instance_id)));

      if(ev.isperiodic) {
        ev.update();
        this.addTimeout(ev);
      } else {
        delete ev;
      }
      this.timeouts.splice(i, 1);
    }
  }
}

MMT.EFSM = function(opts) {
  if(!opts.id) throw Error('(MMT.EFSM) Missing required id parameter!');
  this.id = opts.id;
  this.states = [];
  this.events = [];
  this.contextvars = [];
  this.transitions = [[]];

  this.active_states = [];

  this.hascontext = false;
  this.logdata = false;
  if(opts.hascontext) this.hascontext = true;
  if(opts.logdata) this.logdata = true;

  this.onCreation = null;
  this.onDeletion = null;

  // Event created to listen to external changes of the variables
  this.varsEvent = new MMT.EFSM.Event(this, 'change.var')

  if(opts.onCreation) this.onCreation = opts.onCreation;
  if(opts.onDeletion) this.onDeletion = opts.onDeletion;

  var self = this;

  // Process initial values of the context variables
  for(var v in opts.contextvars) {
    var contextvar = new MMT.EFSM.ContextVariable(opts.contextvars[v].varname, opts.contextvars[v].startval);
    this.contextvars[contextvar.name] = contextvar;
  }

  for(var s in opts.states) {
    var stt = new MMT.EFSM.State(this, opts.states[s]);
    this.states[stt.id] = stt;
    this.transitions[stt.id] = [];
  }

  for(var e in opts.events) {
    var evt = new MMT.EFSM.Event(this, opts.events[e]);
    this.events[evt.id] = evt;
    for(var s in this.states) {
      this.transitions[this.states[s].id][evt.id] = [];
    }
  }

  for(var t in opts.transitions) {
    this.validateTransition(opts.transitions[t]);
  }

  //Now listen to the corresponding events
  for(var e in this.events) {
    var ev = this.events[e];
    ev.sub.subscribe(ev.id);
    ev.sub.on('message', function (channel, message) {
      try {
        var msg = JSON.parse(message);
        if(msg) self.processEvent(channel, msg);
      } catch(err) {
        console.log(err);
      }
    });
  }

  // Listen to external changes of the context variables
  this.varsEvent.sub.subscribe(this.varsEvent.id);
  this.varsEvent.sub.on('message', function (channel, message) {
    try{
      // The message should have a "changeVariableValue" format
      var msg = JSON.parse(message);
      self.mutateVariable(msg);
    } catch (err) {
      console.log(err);
    }
  });
}

MMT.EFSM.prototype.getVector = function(){
  var obj = [];
  for(var l in this.contextvars) {
    obj.push({name: this.contextvars[l].name, value: this.contextvars[l].value});
  }
  return obj;
}

MMT.EFSM.prototype.buildPaths = function(statename, length, vector, states_path){
  var ret = [];

  // Base case
  if(length === 0) // CHANGE TO -1 OR 1 IF REQUIRED!
    return [{state : statename, event : null, vars : vector}];

  // Recursion
  // this.transitions[statename] contains all the transitions from statename
  // foreach transition associated to a particular event
  for(var ev in this.transitions[statename]){
    if(this.transitions[statename][ev].length === 0)
      continue;

    for(var trans in this.transitions[statename][ev]){
      var auxpaths = [];
      var aux = [{state: statename, event: this.transitions[statename][ev][trans].event.id, vars: vector}];
      var vec = MMT.cloneVector(vector);
      var conditionsStand = true;
      var associativeVector = [];

      // Reformat the vector variables to provide an "associative" array.
      // "vector" is an array of objects {name, value}
      for (var variable in vector)
        associativeVector[vector[variable].name] = vector[variable];

      // Check the conditions of the transition at this point.
      for (var condition in this.transitions[statename][ev][trans].conditions)
        conditionsStand = conditionsStand && this.transitions[statename][ev][trans].conditions[condition].fct(
          {efsm: null, state: statename, instance_id: null, contextvariables: associativeVector}, null, null, {trace: states_path});

      // If the conditions do not stand, ignore this transition
      if(!conditionsStand)
        continue;

      // update the variables for the next state
      for (var upfunc in this.transitions[statename][ev][trans].updatefunctions) {
        // Search the variable to update
        for(var param in vec){
          if(vec[param].name == this.transitions[statename][ev][trans].updatefunctions[upfunc].varname){
            vec[param].value = this.transitions[statename][ev][trans].updatefunctions[upfunc].fct(vec[param].value);
          }
        }
      }

      // buildPaths can return multiple paths
      auxpaths = this.buildPaths(this.transitions[statename][ev][trans].to.id, length - 1, vec, states_path.concat(statename));

      for(var path in auxpaths){
        ret.push(aux.concat(auxpaths[path]));
      }
    }
  }
  return ret;
}

MMT.EFSM.prototype.mutateVariable = function(msg){
  var active_state = this.getActiveState(msg.instance_id);

  active_state.contextvariables[msg.varname].value = msg.newvalue;
}

MMT.EFSM.prototype.processEvent = function(ev, msg) {
  var active_state = this.getActiveState(msg.data.instance_id);
  //trigger the event only if we are in the state
  if(msg.data.state !== active_state.id){
    return;
  }

  if(active_state) {
    var trans = this.transitions[active_state.state.id][ev];
    for (t in trans) {
      if(active_state.validateConditions(ev, msg, trans[t])) {
        active_state.transit(ev, msg, trans[t]);
        break;
      }
    }
  }
}

MMT.EFSM.prototype.validateTransition = function(transition) {
  if(!this.states[transition.from] || !this.states[transition.to] || !this.events[transition.event]) {
    throw new Error('Unkown state or event in transition description!');
  }

  var tran = new MMT.EFSM.Transition(this, this.states[transition.from], this.states[transition.to], this.events[transition.event],
    {conditions: transition.conditions, actions: transition.actions, updatefunctions: transition.updatefunctions});

  this.transitions[tran.from.id][tran.event.id].push(tran);
}

MMT.EFSM.prototype.getActiveState = function(instance_id) {
  if(this.hascontext) {
    if(!instance_id) return null;//TODO: What should we do here???
    if(this.active_states[instance_id]) {
      return this.active_states[instance_id];
    } else {
      var init_state = new MMT.EFSM.ActiveState(this, this.states['init'], {instance_id: instance_id});
      this.active_states[instance_id] = init_state;
      return init_state;
    }
  }else {
    if(this.active_states[0]) { //no context, we can have just one active state
      return this.active_states[0];
    }else {
      var init_state = new MMT.EFSM.ActiveState(this, this.states['init'], {});
      this.active_states[0] = init_state;
      return init_state;
    }
  }
}

// Internal representation of a context variable
MMT.EFSM.ContextVariable = function(varname, startval){
  this.name = varname;
  this.value = startval;
}

MMT.EFSM.Event = function(efsm, id) {
  this.sub = redis.createClient(settings.eventbus.port, settings.eventbus.host);
  this.id = id;
  this.efsm = efsm;
}

MMT.EFSM.State = function(efsm, opts) {
  this.efsm = efsm;
  this.id = opts.id;
  this.onStepIn = null;
  this.onStepOut = null;

  if(opts.onStepIn) this.onStepIn = opts.onStepIn;
  if(opts.onStepOut) this.onStepOut = opts.onStepOut;
}

MMT.EFSM.ActiveState = function(efsm, state, opts) {
  this.efsm = efsm;
  this.state = state;
  this.instance_id = null;
  this.contextvariables = []; // Vector used to store the "live" values of context variables
  if(opts.instance_id) this.instance_id = opts.instance_id;

  /* Initialize the storage for the live values of the context variables */
  for(var v in efsm.contextvars){
    var contextvar = new MMT.EFSM.ContextVariable(efsm.contextvars[v].name, efsm.contextvars[v].value);
    this.contextvariables[contextvar.name] = contextvar;
  }

  this.eventLog = [];
}

MMT.EFSM.ActiveState.prototype.transit = function(ev, msg, transition) {
  //If we are changing state apply on StepOut and onStepIn if they exit
  if(transition.from.id !== transition.to.id) {
    //Apply onStepOut from current state if it exists
    if(transition.from.onStepOut) transition.from.onStepOut(this, ev, msg);
    //Apply onStepIn from the new state we are stepping in
    if(transition.to.onStepIn) transition.to.onStepIn(this, ev, msg);

    //Change the current state now
    this.state = transition.to;
  }

  /* Trigger all the updating functions for this transition */
  this.updateContextVariables(transition);
  
  if(this.efsm.logdata) {
    var aux = [];
    for(var l in this.contextvariables){
      aux.push(this.contextvariables[l]);
    }
    this.eventLog.push({event: ev, msg: msg, vars: aux});
  }
  this.applyActions(ev, msg, transition);
}

MMT.EFSM.ActiveState.prototype.validateConditions = function(ev, msg, transition) {
  for(var c in transition.conditions) {
    //TODO: we should assume that the function might not be safe, use try catch here!
    if(transition.conditions[c].fct(this, ev, msg, transition.conditions[c].opts) !== true) return false
  }
  return true;
}

MMT.EFSM.ActiveState.prototype.applyActions = function(ev, msg, transition) {
  for(var a in transition.actions) {
    //TODO: try catch the function
    transition.actions[a].fct(this, ev, msg, transition.actions[a].opts);
  }
}

MMT.EFSM.ActiveState.prototype.updateContextVariables = function(transition){
  for(var fn in transition.updatefunctions){
    var func = transition.updatefunctions[fn];
    this.contextvariables[func.varname].value = func.fct(this.contextvariables[func.varname].value);
  }
}

MMT.EFSM.ActiveState.prototype.wipeLog = function() {
  this.eventLog = [];
}

MMT.EFSM.Transition = function(efsm, from, to, event, opts) {
  this.efsm = efsm;
  this.from = from;
  this.to = to;
  this.event = event;

  this.actions = [];
  this.conditions = [];
  this.updatefunctions = [];
  if(opts.actions) this.actions = opts.actions;
  if(opts.conditions) this.conditions = opts.conditions;
  if(opts.updatefunctions) this.updatefunctions = opts.updatefunctions;
}

module.exports = MMT;
////////////////////////////////////////////////////////
