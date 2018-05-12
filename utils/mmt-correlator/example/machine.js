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
  events: ['post', 'post2', 'post3', 'timeout.to', 'timeout.out'],
  states: [
    {
      id: 'init'
    },
    {
      id: 'B'
    },
    {
      id: 'C'
    },
    {
      id: 'D'
    }
  ], //states MUST start with init!
  // Context variables of the machine
  contextvars: [
    {
      varname: 'test1',
      startval: 0
    },
    {
      varname: 'test2',
      startval: 1
    }
  ],
  transitions: [
    {
      from: 'init',
      to: 'B',
      event: 'post',
      conditions: [],
      // Update functions. It's a Javascript object following this contract:
      // * varname = name of the variable to operate over
      // * fct = Javascript function to execute. This function must receive
      //         the old value of the variable and return the new one.
      updatefunctions: [
        {
          varname: 'test1',
          fct: function(oldval){
           return oldval + 1;
          }
        }
      ],
      actions: [{fct: mmt.startTimer, opts: {timeout: 5000, name: 'out'}}]
    },
    {
      from: 'B',
      to: 'C',
      event: 'post2',
      conditions: [],
      updatefunctions: [
        {
          varname: 'test2',
          fct: function (oldval){
            return oldval * 4;
          }
        }
      ],
      actions: [{fct: mmt.startTimer, opts: {timeout: 2000, name: 'to'}}]
    },
    {
      from: 'C',
      to: 'B',
      event: 'timeout.to',
      conditions: [],
      updatefunctions: [],
      actions: [{fct: mmt.startTimer, opts: {timeout: 5000, name: 'out'}}]
    },
    {
      from: 'C',
      to: 'C',
      event: 'post3',
      conditions: [],
      updatefunctions: [],
      actions: [{fct: mmt.startTimer, opts: {timeout: 2000, name: 'to'}}]
    },
    {
      from: 'B',
      to: 'D',
      event: 'timeout.out',
      contidions: [],
      updatefunctions: [{
        varname: 'test1',
        fct: function (oldval) {
          return oldval * 3;
        }
      }],
      actions: [{fct: mmt.printLog}, {fct:mmt.wipeLog}]
    }
  ]
});

//console.log(JSON.stringify(MMT.getPaths(efsm, 2)));
var paths = MMT.getPaths(efsm, 2)
console.log(util.inspect(paths, {showHidden: false, depth: null}));

// The QoE model is a Javascript funciton that receives a single argument:
// A mapping object: name of the variable -> value
// console.log(util.inspect(MMT.evalQoE(paths, function(vars){
//   return vars["test1"] + vars["test2"];
// }), {showHidden: false, depth: null}));

/*
//How fast the clock goes
var time = 1000;
//setInterval will execute the callback every 'delay' milliseconds.
//In this case, it is used to update the timer in the simulation and in the server
setInterval(function(){ publisher.publish('tick', JSON.stringify(MMT.tickJSON(time))); time += 1000}, 1000);

setTimeout(function() { publisher.publish('post', JSON.stringify(MMT.attributeJSON(time, 'post', 'GET', [], 'i1'))); }, 1000);
setTimeout(function() { publisher.publish('post2', JSON.stringify(MMT.attributeJSON(time, 'post', 'GET', [], 'i1'))); }, 2000);
setTimeout(function() { publisher.publish('post3', JSON.stringify(MMT.attributeJSON(time, 'post', 'GET', [], 'i1'))); }, 3000);
setTimeout(function() { publisher.publish('post3', JSON.stringify(MMT.attributeJSON(time, 'post', 'GET', [], 'i1'))); }, 4000);
setTimeout(function() { publisher.publish('post3', JSON.stringify(MMT.attributeJSON(time, 'post', 'GET', [], 'i1'))); }, 5000);
setTimeout(function() { publisher.publish('post3', JSON.stringify(MMT.attributeJSON(time, 'post', 'GET', [], 'i1'))); }, 6000);
setTimeout(function() { publisher.publish('post3', JSON.stringify(MMT.attributeJSON(time, 'post', 'GET', [], 'i1'))); }, 7000);
setTimeout(function() { publisher.publish('post3', JSON.stringify(MMT.attributeJSON(time, 'post', 'GET', [], 'i1'))); }, 8000);
setTimeout(function() { publisher.publish('post3', JSON.stringify(MMT.attributeJSON(time, 'post', 'GET', [], 'i1'))); }, 9000);
*/
