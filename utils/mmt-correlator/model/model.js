var mmt = require('../src/efsm');
var redis = require("redis");
var util = require("util");

var settings = {
  eventbus: {
    type: 'redis',
    host: '127.0.0.1',
    port: 6379
  }
};

mmt.init(settings);

var publisher = redis.createClient(settings.eventbus.port, settings.eventbus.host);

var efsm = new mmt.EFSM(
{
  id: "test",
  hascontext: true,
  logdata: true,
  onCreation: function() {},
  onDeletion: function() {},
  events: ['click', 'click2', 'login', 'promocode', 'nopromocode', 'inputcardinvalid', 'inputcardvalid', 'stopstream', 'timeout.check'],
  states: [
    { id: 'init' },
    { id: 'main' },
    { id: 'perso' },
    { id: 'card' },
    { id: 'ready' },
    { id: 'delivery' },
    { id: 'stop' }
  ], //states MUST start with init!
  // Context variables of the machine
  contextvars: [
    {
      varname: 'stream_flag',
      startval: 0
    },
    {
      varname: 'service_confidence',
      startval: 1
    },
    {
      varname: 'price_premium',
      startval: 1
    },
    {
      varname: 'promo_flag',
      startval: 0
    }
  ],
  transitions: [
    {
      from: 'init',
      to: 'main',
      event: 'click'
    },
    {
      from: 'main',
      to: 'perso',
      event: 'nopromocode',
      updatefunctions: [{
        varname: 'price_premium',
        fct: function(oldval){
          return (++oldval)>2?2:oldval;
        }
      },
      {
        varname: 'promo_flag',
        fct: function(oldval){
          return 0;
        }
      }]
    },
    {
      from: 'main',
      to: 'perso',
      event: 'promocode',
      updatefunctions: [{
        varname: 'price_premium',
        fct: function(oldval){
          return oldval==0?1:oldval;
        }
      },
      {
        varname: 'promo_flag',
        fct: function(oldval){
          return 1;
        }
      }]
    },
    {
      from: 'perso',
      to: 'perso',
      event: 'nopromocode',
      updatefunctions: [
        {
          varname: 'promo_flag',
          fct: function(oldval){
            return 0;
          }
        }
      ]
    },
    {
      from: 'perso',
      to: 'perso',
      event: 'promocode',
      updatefunctions: [{
        varname: 'promo_flag',
        fct: function(oldval){
          return 1;
        }
      }]
    },
    {
      from: 'perso',
      to: 'card',
      event: 'click',
      conditions: [{
        fct: function(active_state, evt, msg, opt){
          if(active_state.contextvariables["promo_flag"].value === 0)
            return true;
          return false;
        }
      }]
    },
    {
      from: 'perso',
      to: 'ready',
      event: 'click',
      conditions: [{
        fct: function(active_state, evt, msg, opt){
          if(active_state.contextvariables["promo_flag"].value === 1)
            return true;
          return false;
        }
      }]
    },
    {
      from: 'card',
      to: 'card',
      event: 'inputcardinvalid'
    },
    {
      from: 'card',
      to: 'ready',
      event: 'inputcardvalid'
    },
    {
      from: 'main',
      to: 'ready',
      event: 'login'
    },
    {
      from: 'ready',
      to: 'delivery',
      event: 'click',
      updatefunctions: [{
        varname: 'stream_flag',
        fct: function(oldval){
          return 1;
        }
      }],
      actions: [{fct: mmt.startTimer, opts: {timeout: 2000, name: 'check'}}]
    },
    {
      from: 'delivery',
      to: 'delivery',
      event: 'timeout.check',
      conditions: [{
        fct: function(active_state, evt, msg, opt){
          if(active_state.contextvariables["stream_flag"].value === 1)
            return true;
          return false
        }
      }],
      updatefunctions:[{
        varname: 'service_confidence',
        fct: function(oldval){
          return (++oldval)>2?2:oldval;
        }
      }],
      actions: [{fct: mmt.startTimer, opts: {timeout: 2000, name: 'check'}}, {fct: mmt.printLog}]
    },
    {
      from: 'delivery',
      to: 'stop',
      event: 'timeout.check',
      conditions: [{
        // 3 version of this condition:

        // 1st: Original version of the condition
        // fct: function(active_state, evt, msg, opt){
        //   if(active_state.contextvariables["stream_flag"].value === 0)
        //     return true;
        //   return false;

        // 2nd: This is a modified version of the original condition.
        // This version will check if the machine has not moved from the delivery state
        // in the last two transitions. If so, the condition will fail, emulating a failure
        // fct: function(active_state, evt, msg, opt){
        //   var count = 0;
        //   for(var state in opt.trace){
        //     // If the machine was in "delivery" for more than 2 transitions, return false
        //     if(opt.trace[state] == 'delivery'){
        //       count = count + 1;
        //     } else {
        //       count = 0;
        //     }

        //     if(count >= 2){
        //       // If the count is 2 or more, this condition stands and, therefore,
        //       // this transition is executed.
        //       return true;
        //     }
        //   }
        //   return false;
        // }

        // 3rd: This another modification. It randomly generates a failure in the service
        fct: function(active_state, evt, msg, opt){
          if(Math.random() >= 0.5)
            return false; // 50% chance to continue with the stream
          return true; // 50% chance to emulate a failure
        }
      }],
      updatefunctions:[{
        varname: 'price_premium',
        fct: function (oldval){
          return (--oldval)<0?0:oldval;
        }
      },
      {
        // Since this transition will execute only if the machine was in 'delivery'
        // for more than two transitions, we need to "manually" update the stream_flag
        varname: 'stream_flag',
        fct: function(oldval){
          return 0;
        }
      },
      {
        varname: 'service_confidence',
        fct: function(oldval){
          return (--oldval)<0?0:oldval;
        }
      }],
      actions: [{fct: mmt.printLog}]
    },
    {
      from: 'delivery',
      to: 'stop',
      event: 'stopstream',
      updatefunctions: [{
        varname: 'stream_flag',
        fct: function(oldval){
          return 0;
        }
      }]
    },
    {
      from: 'stop',
      to: 'ready',
      event: 'click'
    }
  ]
});

// First of all, calculate all the paths of a given length
var len = process.argv[2];
var paths = MMT.getPaths(efsm, len);

// The QoE model is a Javascript funciton that receives a single argument:
// A mapping object: name of the variable -> value
var traces = MMT.evalQoE(paths, function(vars){
  return 0.5*vars["stream_flag"] + 1.0*vars["service_confidence"] + 1.0*vars["price_premium"];
});

// Analyze the traces by performing a classification with the given parameters:
// * No QoE lower than 2 at any point
// * No QoE value reduction higher that 2 in a single transition of the machine
var analyzed = MMT.analyzeTraces(traces, 2, 2);

//console.log(util.inspect(paths, {showHidden: false, depth: null}));
console.log(util.inspect(traces, {showHidden: false, depth: null}));
//console.log(util.inspect(analyzed, {showHidden: false, depth: null}));
console.log("*******************************");
console.log("Final Statistics");
console.log("Traces Amount: " + traces.length);
console.log("Under Minimal QoE Value: " + analyzed.underMin.length);
console.log("Over Maximal QoE Decrease: " + analyzed.overThreshold.length);

console.error("finished");

// For automatization purposes
process.exit(0);

/*
//How fast the clock goes
var time = 1000;
//setInterval will execute the callback every 'delay' milliseconds.
//In this case, it is used to update the timer in the simulation and in the server
setInterval(function(){ publisher.publish('tick', JSON.stringify(MMT.tickJSON(time))); time += 1000}, 1000);

setTimeout(function() { publisher.publish('click', JSON.stringify(MMT.attributeJSON(time, 'click', 'GET', [], 'i1'))); }, 1000);
setTimeout(function() { publisher.publish('promocode', JSON.stringify(MMT.attributeJSON(time, 'promocode', 'GET', [], 'i1'))); }, 2000);
setTimeout(function() { publisher.publish('click', JSON.stringify(MMT.attributeJSON(time, 'click', 'GET', [], 'i1'))); }, 3000);
setTimeout(function() { publisher.publish('click', JSON.stringify(MMT.attributeJSON(time, 'click', 'GET', [], 'i1'))); }, 4000);
// Service failure emulation at second 7. The service should go offline at time 8.
setTimeout(function() {
  publisher.publish('change.var', JSON.stringify(MMT.changeVariableValue('i1', 'stream_flag', 0)));
}, 7000);
*/
