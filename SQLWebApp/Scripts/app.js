/// <reference path="../typings/jquery.d.ts" />
"use strict";
$(document).ready(function () {
    $("#txtServer").val("localhost\\sqlexpress");
    $("#txtDatabaseName").val("junk");
    $("#txtUserId").val("sqladmin");
    $("#txtPassword").val("P@ssw0rd");
    $("#cmdConnect").click(connectToDatabase);
    $("#cmdRun").click(runCommand);
});

var connectToDatabase = function () {
    var connectRequest = new WebSqlConnectRequest($("#txtServer").val(), $("#txtDatabaseName").val(), $("#txtUserId").val(), $("#txtPassword").val());
    connectRequest.Connect(function () {
        var r = connectRequest.ConnectResult;
        if (r && r.state) {
            $("#txtConnectionState").val(r.state);
            $("#txtConnectionGuid").val(r.connectionGuid);
            $("#txtConnectionMessage").val(r.message);
        } else {
            alert("failed to connect to DB.  Check console.log for details.");
        }
    });
};
var runCommand = function () {
    var commandRequest = new WebSqlCommandRequest($("#txtConnectionGuid").val(), $("#txtSqlCommand").val());
    commandRequest.Execute(function () {
        var r = commandRequest.CommandResultSet;
        renderAllResultSets(r);
    });
};

function renderAllResultSets(resultSet) {
    $("#results").empty();
    for (var resultSetIndex = 0; resultSetIndex < resultSet.results.length; resultSetIndex++) {
        renderResultSet(resultSet.results[resultSetIndex]);
    }
}

function renderResultSet(result) {
    //todo: refactor without jQuery
    var r = $("#results");
    r.append("<hr>").append($("<span></span>").text("Rows affected: " + result.rowsAffected.toString()));

    var table = $("<table></table>");
    table.append(buildTableRow(result.columns, "columnHeader"));

    for (var rowIndex = 0; rowIndex < result.rows.length; rowIndex++) {
        table.append(buildTableRow(result.rows[rowIndex]));
    }

    r.append(table);
}

function buildTableRow(rowData, cssClasses) {
    //todo: refactor without jQuery
    var colCount = rowData.length;
    var tableRow = $("<tr></tr>");
    for (var colIndex = 0; colIndex < colCount; colIndex++) {
        tableRow.append($("<td></td>").text(rowData[colIndex] ? rowData[colIndex] : "Column" + colIndex.toString()));
    }
    if (cssClasses) {
        tableRow.addClass(cssClasses);
    }
    return tableRow;
}

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
            data: JSON.stringify(that),
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
            data: JSON.stringify(that),
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

var WebSqlConnectResult = (function () {
    function WebSqlConnectResult(connectionGuid, state, message) {
        this.connectionGuid = connectionGuid;
        this.state = state;
        this.message = message;
    }
    return WebSqlConnectResult;
})();

var WebSqlCommandResultSet = (function () {
    function WebSqlCommandResultSet(resultSet) {
        this.results = resultSet.results;
    }
    return WebSqlCommandResultSet;
})();
//# sourceMappingURL=app.js.map
