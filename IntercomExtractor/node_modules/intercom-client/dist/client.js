'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _request2 = require('request');

var _request3 = _interopRequireDefault(_request2);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

var _event = require('./event');

var _event2 = _interopRequireDefault(_event);

var _company = require('./company');

var _company2 = _interopRequireDefault(_company);

var _contact = require('./contact');

var _contact2 = _interopRequireDefault(_contact);

var _visitor = require('./visitor');

var _visitor2 = _interopRequireDefault(_visitor);

var _counts = require('./counts');

var _counts2 = _interopRequireDefault(_counts);

var _admin = require('./admin');

var _admin2 = _interopRequireDefault(_admin);

var _tag = require('./tag');

var _tag2 = _interopRequireDefault(_tag);

var _segment = require('./segment');

var _segment2 = _interopRequireDefault(_segment);

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

var _conversation = require('./conversation');

var _conversation2 = _interopRequireDefault(_conversation);

var _note = require('./note');

var _note2 = _interopRequireDefault(_note);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Client = function () {
  function Client() {
    _classCallCheck(this, Client);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length === 2) {
      this.usernamePart = args[0];
      this.passwordPart = args[1];
    } else if (args.length === 1) {
      if (args[0].token) {
        this.usernamePart = args[0].token;
        this.passwordPart = '';
      } else {
        this.usernamePart = args[0].appId;
        this.passwordPart = args[0].appApiKey;
      }
    }
    if (!this.usernamePart || this.passwordPart === undefined) {
      throw new Error('Could not construct a client with those parameters');
    }
    this.users = new _user2.default(this);
    this.events = new _event2.default(this);
    this.companies = new _company2.default(this);
    this.contacts = new _contact2.default(this);
    this.leads = new _contact2.default(this);
    this.visitors = new _visitor2.default(this);
    this.counts = new _counts2.default(this);
    this.admins = new _admin2.default(this);
    this.tags = new _tag2.default(this);
    this.segments = new _segment2.default(this);
    this.messages = new _message2.default(this);
    this.conversations = new _conversation2.default(this);
    this.notes = new _note2.default(this);
    this.promises = false;
    this.baseUrl = 'https://api.intercom.io';
  }

  _createClass(Client, [{
    key: 'usePromises',
    value: function usePromises() {
      this.promises = true;
      return this;
    }
  }, {
    key: 'useBaseUrl',
    value: function useBaseUrl(baseUrl) {
      this.baseUrl = baseUrl;
      return this;
    }
  }, {
    key: 'promiseProxy',
    value: function promiseProxy(f, args) {
      var _this = this;

      if (this.promises || !f) {
        var callbackHandler = this.callback;
        return new _bluebird2.default(function (resolve, reject) {
          var resolver = function resolver(err, data) {
            if (err) {
              reject(new Error(JSON.stringify(err)));
            } else {
              resolve(data);
            }
          };
          _this.request(args, function (_, r) {
            callbackHandler(resolver, r);
          });
        });
      } else {
        this.request(args, function (_, r) {
          return _this.callback(f, r);
        });
      }
    }
  }, {
    key: 'ping',
    value: function ping(f) {
      this.request({
        uri: '/admins'
      }, function (_, response) {
        return f(response.statusCode);
      });
    }
  }, {
    key: 'put',
    value: function put(endpoint, data, f) {
      return this.promiseProxy(f, {
        method: 'put',
        uri: endpoint,
        body: data
      });
    }
  }, {
    key: 'post',
    value: function post(endpoint, data, f) {
      return this.promiseProxy(f, {
        method: 'post',
        uri: endpoint,
        body: data
      });
    }
  }, {
    key: 'get',
    value: function get(endpoint, data, f) {
      return this.promiseProxy(f, {
        method: 'get',
        uri: endpoint,
        qs: data
      });
    }
  }, {
    key: 'nextPage',
    value: function nextPage(paginationObject, f) {
      return this.promiseProxy(f, {
        method: 'get',
        uri: paginationObject.next,
        baseUrl: null
      });
    }
  }, {
    key: 'delete',
    value: function _delete(endpoint, data, f) {
      return this.promiseProxy(f, {
        method: 'delete',
        uri: endpoint,
        qs: data
      });
    }
  }, {
    key: 'request',
    value: function request(args, callback) {
      var defaultArgs = {
        baseUrl: this.baseUrl,
        json: true,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'intercom-node-client/2.0.0'
        }
      };

      return (0, _request3.default)(Object.assign({}, defaultArgs, args), callback).auth(this.usernamePart, this.passwordPart);
    }
  }, {
    key: 'callback',
    value: function callback(f, data) {
      if (!f) {
        return;
      }
      if (f.length >= 2) {
        var hasErrors = data.error || data.body && data.body.type === 'error.list';
        if (hasErrors) {
          f(data, null);
        } else {
          f(null, data);
        }
      } else {
        f(data);
      }
    }
  }]);

  return Client;
}();

exports.default = Client;