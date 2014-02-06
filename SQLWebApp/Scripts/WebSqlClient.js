"use strict";
define(["require", "exports"], function(require, exports) {
    var WebSqlCommandRequest = (function () {
        function WebSqlCommandRequest(connectionGuid, commandText) {
            var _this = this;
            this.connectionGuid = connectionGuid;
            this.commandText = commandText;
            this.doDone = function (j) {
                var r = j;
                _this.CommandResultSet = new WebSqlCommandResultSet(r);
                return;
            };
            this.doFail = function (j) {
                //todo: fixup unhappy path.
                console.log("WebSqlCommandRequest ajax fail");
                console.log(j);
                return;
            };
        }
        WebSqlCommandRequest.prototype.Execute = function (callerCallback) {
            var that = this;
            this.callerCallback = callerCallback;
            var xhr = $.ajax({
                url: "/api/SqlWeb/Execute",
                type: "POST",
                dataType: 'json',
                data: JSON.stringify({ connectionGuid: this.connectionGuid, commandText: this.commandText }),
                contentType: "application/json;charset=utf-8"
            }).done(function (j) {
                that.doDone(j);
            }).fail(function (j) {
                that.doFail(j);
            }).always(function (j) {
                if (that.callerCallback) {
                    that.callerCallback();
                }
            });
        };
        return WebSqlCommandRequest;
    })();
    exports.WebSqlCommandRequest = WebSqlCommandRequest;

    var WebSqlConnectRequest = (function () {
        function WebSqlConnectRequest(serverName, databaseName, userId, password) {
            var _this = this;
            this.serverName = serverName;
            this.databaseName = databaseName;
            this.userId = userId;
            this.password = password;
            this.doDone = function (j) {
                var r = j;
                _this.ConnectResult = new WebSqlConnectResult(r.connectionGuid, r.state, r.message);
                return;
            };
            this.doFail = function (j) {
                //todo: fixup unhappy path.
                console.log("WebSqlConnectRequest ajax fail");
                console.log(j);
                return;
            };
            this.connectCallback = function (data, textStatus, jqXHR) {
                _this.callerCallback();
            };
        }
        WebSqlConnectRequest.prototype.Connect = function (callerCallback) {
            var that = this;
            this.callerCallback = callerCallback;
            var xhr = $.ajax({
                url: "/api/SqlWeb/Connect",
                type: "POST",
                dataType: 'json',
                data: JSON.stringify({ serverName: this.serverName, databaseName: this.databaseName, userId: this.userId, password: this.password }),
                contentType: "application/json;charset=utf-8"
            }).done(function (j) {
                that.doDone(j);
            }).fail(function (j) {
                that.doFail(j);
            }).always(function (j) {
                if (that.callerCallback) {
                    that.callerCallback();
                }
            });
        };
        return WebSqlConnectRequest;
    })();
    exports.WebSqlConnectRequest = WebSqlConnectRequest;

    var WebSqlConnectResult = (function () {
        function WebSqlConnectResult(connectionGuid, state, message) {
            this.connectionGuid = connectionGuid;
            this.state = state;
            this.message = message;
        }
        return WebSqlConnectResult;
    })();
    exports.WebSqlConnectResult = WebSqlConnectResult;

    var WebSqlCommandResultSet = (function () {
        function WebSqlCommandResultSet(resultSet) {
            this.results = resultSet.results;
        }
        return WebSqlCommandResultSet;
    })();
    exports.WebSqlCommandResultSet = WebSqlCommandResultSet;
});
//# sourceMappingURL=WebSqlClient.js.map
