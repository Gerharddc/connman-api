/*
 * Javascript interface around Agent API
 * See: https://git.kernel.org/cgit/network/connman/connman.git/tree/doc/agent-api.txt
 *
 */

var DBus = require('dbus');
var util = require('util');
var events = require('events');
var debug = require('debug')('connman:agent');

var Agent = module.exports = function() {
  var self = this;

  self.path = '/com/moose/agent';
  self.interfaceName = 'net.connman.Agent';
  self.service = null;
  self.object = null;
  self.iface = null;
  self.bus = null;
};

util.inherits(Agent, events.EventEmitter);

Agent.prototype.init = function(callback) {
  var self = this;

  // Register service
  var service = self.service = DBus.registerService('system', 'com.moose');
  var obj = self.object = service.createObject(self.path);
  var iface = self.iface = obj.createInterface(self.interfaceName);
  self.bus = service.bus;

  // Initializing interface
  iface.addMethod('Release', {}, function(callback) {
    self.emit('Release');
    callback(null);
  });

  iface.addMethod('ReportError', {
    in: [
      DBus.Define(String),
      DBus.Define(String)
    ]
  }, function(service, error, callback) {
    self.emit('ReportError', service, error);
    callback(null);
  });

  iface.addMethod('RequestBrowser', {
    in: [
      DBus.Define(String),
      DBus.Define(String)
    ]
  }, function(service, url, callback) {
    self.emit('RequestBrowser', service, url);
    callback(null);
  });

  iface.addMethod('RequestInput', {
    in: [
      DBus.Define(String),
      DBus.Define(Object)
    ],
    out: DBus.Define(Object)
  }, function(service, fields, callback) {
    self.emit('RequestInput', service, fields, function(obj) {
        callback(null, obj);
    });
  });
  
  iface.addMethod('Cancel', {}, function(callback) {
    self.emit('Cancel');
    callback(null);
  });

  iface.update();

  callback();
};
