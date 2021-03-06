/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/requirejs/require.d.ts" />
"use strict";

import WebSqlClient = require("WebSqlClient");
import $ = require("jquery");
import StringBuilder = require("StringBuilder");

$(document).ready(() => {
    $("#txtServer").val("localhost\\sqlexpress");
    $("#txtDatabaseName").val("junk");
    $("#txtUserId").val("sqladmin");
    $("#txtPassword").val("P@ssw0rd");
    $("#cmdConnect").click(connectToDatabase);
    $("#cmdRun").click(runCommand);
});

var connectToDatabase = () => {
    var connectRequest = new WebSqlClient.WebSqlConnectRequest($("#txtServer").val(), $("#txtDatabaseName").val(), $("#txtUserId").val(), $("#txtPassword").val());
    connectRequest.Connect(() => {
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

var runCommand = () => {
    var commandRequest = new WebSqlClient.WebSqlCommandRequest($("#txtConnectionGuid").val(), getSelectedText());
    if (commandRequest.commandText === "") {
        return;
    }
    commandRequest.Execute(() => {
        var r = commandRequest.CommandResultSet;
        renderResultSet(r);
    });
};

function getSelectedText() : string {
    var selectedText: string = "";
    var textArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("txtSqlCommand");
    if (textArea.selectionStart !== undefined && textArea.selectionEnd !== undefined ) {
        var start: number = textArea.selectionStart, end: number = textArea.selectionEnd;
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


function renderResultSet(resultSet: WebSqlClient.WebSqlCommandResultSet) {
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

function renderErrorResultAsString(result: WebSqlClient.IWebSqlCommandResult) {
    var sb = new StringBuilder.StringBuilder('<hr><span class="SqlError">');
    sb.appendEscaped("Error " + result.errorCode.toString() +
            " on line " + result.errorLineNumber.toString() + ": " + result.errorMessage);
    sb.append("</span>");

    var r = document.getElementById("results");
    var div = document.createElement("div");
    div.innerHTML = sb.toString();
    r.appendChild(div);
}

function renderResultAsString(result: WebSqlClient.IWebSqlCommandResult) {
    var sb = new StringBuilder.StringBuilder("<hr><span>");
    sb.appendEscaped("Rows affected: " + result.rowsAffected.toString());
    sb.append("</span><table><tbody>");

    var columnHeaderDefaults = new TableRowRenderOptions();
    columnHeaderDefaults.cssClasses = "columnHeader";
    columnHeaderDefaults.SubstituteColumnIndexOnBlankFields = true;

    buildTableRowToStringBuilder(sb, result.columns, columnHeaderDefaults);
    var length = result.rows.length;
    var rows = result.rows;

    for (var rowIndex = 0; rowIndex < length; rowIndex++) {
        buildTableRowToStringBuilder(sb,rows[rowIndex]);
    }
    sb.append("</tbody></table>");

    var r = document.getElementById("results");
    var div = document.createElement("div");
    
    div.innerHTML = sb.toString();

    r.appendChild(div);
}

function buildTableRowToStringBuilder(sb: StringBuilder.StringBuilder, rowData: string[], defaults?: TableRowRenderOptions): void {
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

class TableRowRenderOptions {
    public SubstituteColumnIndexOnBlankFields: boolean = false;
    public cssClasses: string = "";
}

