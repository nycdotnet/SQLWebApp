/// <reference path="../typings/jquery.d.ts" />
"use strict";
define(["require", "exports", "WebSqlClient"], function(require, exports, WebSqlClient) {
    $(document).ready(function () {
        $("#txtServer").val("localhost\\sqlexpress");
        $("#txtDatabaseName").val("junk");
        $("#txtUserId").val("sqladmin");
        $("#txtPassword").val("P@ssw0rd");
        $("#cmdConnect").click(connectToDatabase);
        $("#cmdRun").click(runCommand);
    });

    var connectToDatabase = function () {
        var connectRequest = new WebSqlClient.WebSqlConnectRequest($("#txtServer").val(), $("#txtDatabaseName").val(), $("#txtUserId").val(), $("#txtPassword").val());
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
        var commandRequest = new WebSqlClient.WebSqlCommandRequest($("#txtConnectionGuid").val(), getSelectedText());
        if (commandRequest.commandText === "") {
            return;
        }
        commandRequest.Execute(function () {
            var r = commandRequest.CommandResultSet;
            renderResultSet(r);
        });
    };

    function getSelectedText() {
        var selectedText = "";
        var textArea = document.getElementById("txtSqlCommand");
        if (textArea.selectionStart !== undefined && textArea.selectionEnd !== undefined) {
            var start = textArea.selectionStart, end = textArea.selectionEnd;
            if (start === end) {
                selectedText = textArea.innerHTML;
            } else {
                selectedText = textArea.innerHTML.substring(textArea.selectionStart, textArea.selectionEnd);
            }
        } else {
            //todo: fix support for legacy browsers.
            var result = confirm("I can't determine if you've selected anything in the query edit window on this version (or compatability mode) of the browser.  Should I run the entire query regardless of if you've selected some text?");
            selectedText = result ? textArea.innerHTML : "";
        }
        return selectedText;
    }

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
            if (!this.escape) {
                throw "StringBuilder can only escape HTML if run with a global document variable (e.g. in a browser).";
            }
            this.escape.innerHTML = html;
            return this.escape.innerHTML;
        };
        return StringBuilder;
    })();
});
//# sourceMappingURL=app.js.map
