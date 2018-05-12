var express = require('express');
var router = express.Router();
var http = require('http');
var propertiesReader = require('properties-reader');
var properties = propertiesReader('./config/config.ini');
var property = properties.get('dev.measure-platform.url');
console.log("dev.measure-platform.url : " + property);

/*
models.Efsm.findAll().then(function (machines) {
    for(var i=0; i<machines.length; i++) {
    }
})*/
