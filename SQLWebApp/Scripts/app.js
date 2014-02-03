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
        renderResultSet(r);
    });
};

function renderResultSet(resultSet) {
    document.getElementById("results").innerHTML = "";
    for (var resultSetIndex = 0; resultSetIndex < resultSet.results.length; resultSetIndex++) {
        var currentResult = resultSet.results[resultSetIndex];
        if (currentResult.columns && currentResult.rows) {
            renderResultAsString(currentResult);
        } else {
            renderErrorResultAsString(currentResult);
        }
    }
}

function renderErrorResultAsString(result) {
    var sb = new StringBuilder('<hr><span class="SqlError">');
    sb.appendEscaped("Error " + result.errorCode.toString() + " on line " + result.errorLineNumber.toString() + ": " + result.errorMessage);
    sb.append("</span>");

    var r = document.getElementById("results");
    var div = document.createElement("div");
    div.innerHTML = sb.toString();
    r.appendChild(div);
}

function renderResultAsString(result) {
    var sb = new StringBuilder("<hr><span>");
    sb.appendEscaped("Rows affected: " + result.rowsAffected.toString());
    sb.append("</span><table><tbody>");

    var columnHeaderDefaults = new TableRowRenderOptions();
    columnHeaderDefaults.cssClasses = "columnHeader";
    columnHeaderDefaults.SubstituteColumnIndexOnBlankFields = true;

    buildTableRowToStringBuilder(sb, result.columns, columnHeaderDefaults);
    var length = result.rows.length;
    var rows = result.rows;

    for (var rowIndex = 0; rowIndex < length; rowIndex++) {
        buildTableRowToStringBuilder(sb, rows[rowIndex]);
    }
    sb.append("</tbody></table>");

    var r = document.getElementById("results");
    var div = document.createElement("div");

    div.innerHTML = sb.toString();

    r.appendChild(div);
}

function buildTableRowToStringBuilder(sb, rowData, defaults) {
    if (!rowData || !rowData.length) {
        return;
    }
    if (!defaults) {
        defaults = new TableRowRenderOptions();
    }
    var colCount = rowData.length;
    sb.append("<tr>");
    for (var colIndex = 0; colIndex < colCount; colIndex++) {
        sb.append("<td");
        if (defaults.cssClasses.length > 0) {
            sb.appendEscaped(' class="' + defaults.cssClasses + '"');
        }
        sb.append(">");
        sb.appendEscaped(rowData[colIndex] ? rowData[colIndex] : (defaults.SubstituteColumnIndexOnBlankFields ? "Column" + colIndex.toString() : ""));
        sb.append("</td>");
    }
    sb.append("</tr>");
}

var TableRowRenderOptions = (function () {
    function TableRowRenderOptions() {
        this.SubstituteColumnIndexOnBlankFields = false;
        this.cssClasses = "";
    }
    return TableRowRenderOptions;
})();

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

var StringBuilder = (function () {
    function StringBuilder(value) {
        //StringBuilder code converted to TypeScript using code from http://www.codeproject.com/Articles/12375/JavaScript-StringBuilder
        this.escape = null;
        this.strings = [];
        if (value) {
            this.append(value);
        }
        if (document) {
            this.escape = document.createElement('textarea');
        }
    }
    StringBuilder.prototype.append = function (value) {
        if (value) {
            this.strings.push(value);
        }
    };

    // appendEscaped idea thanks to http://stackoverflow.com/users/552067/web-designer
    // http://stackoverflow.com/questions/5499078/fastest-method-to-escape-html-tags-as-html-entities
    StringBuilder.prototype.appendEscaped = function (value) {
        if (value) {
            this.strings.push(this.escapeHTML(value));
        }
    };

    StringBuilder.prototype.clear = function () {
        this.strings.length = 1;
    };
    StringBuilder.prototype.toString = function () {
        return this.strings.join("");
    };

    StringBuilder.prototype.escapeHTML = function (html) {
        this.escape.innerHTML = html;
        return this.escape.innerHTML;
    };
    return StringBuilder;
})();
//# sourceMappingURL=app.js.map
