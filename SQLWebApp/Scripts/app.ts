/// <reference path="../typings/jquery.d.ts" />
"use strict";

$(document).ready(() => {
    $("#txtServer").val("localhost\\sqlexpress");
    $("#txtDatabaseName").val("junk");
    $("#txtUserId").val("sqladmin");
    $("#txtPassword").val("P@ssw0rd");
    $("#cmdConnect").click(connectToDatabase);
    $("#cmdRun").click(runCommand);
});

var connectToDatabase = () => {
    var connectRequest = new WebSqlConnectRequest($("#txtServer").val(), $("#txtDatabaseName").val(), $("#txtUserId").val(), $("#txtPassword").val());
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
    var commandRequest = new WebSqlCommandRequest($("#txtConnectionGuid").val(), getSelectedText());
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


function renderResultSet(resultSet: WebSqlCommandResultSet) {
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

function renderErrorResultAsString(result: IWebSqlCommandResult) {
    var sb = new StringBuilder('<hr><span class="SqlError">');
    sb.appendEscaped("Error " + result.errorCode.toString() +
            " on line " + result.errorLineNumber.toString() + ": " + result.errorMessage);
    sb.append("</span>");

    var r = document.getElementById("results");
    var div = document.createElement("div");
    div.innerHTML = sb.toString();
    r.appendChild(div);
}



function renderResultAsString(result: IWebSqlCommandResult) {
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
        buildTableRowToStringBuilder(sb,rows[rowIndex]);
    }
    sb.append("</tbody></table>");

    var r = document.getElementById("results");
    var div = document.createElement("div");
    
    div.innerHTML = sb.toString();

    r.appendChild(div);
}


function buildTableRowToStringBuilder(sb: StringBuilder, rowData: string[], defaults?: TableRowRenderOptions): void {
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


class WebSqlCommandRequest {
    private callerCallback: (resultSet? : WebSqlCommandResultSet) => any;
    constructor(public connectionGuid: string, public commandText: string) { }

    public CommandResultSet: WebSqlCommandResultSet;

    public Execute(callerCallback: () => any): void {
        var that = this;
        this.callerCallback = callerCallback;
        var xhr = $.ajax({
            url: "/api/SqlWeb/Execute",
            type: "POST",
            dataType: 'json',
            data: JSON.stringify(that),
            contentType: "application/json;charset=utf-8",
        })
            .done((j: JQueryXHR) => { that.doDone(j); })
            .fail((j: JQueryXHR) => { that.doFail(j); })
            .always((j: JQueryXHR) => {
                if (that.callerCallback) {
                    that.callerCallback();
                }
            });
    }

    public doDone = (j: JQueryXHR): void => {
        var r: IWebSqlCommandResultSet = <any>j;
        this.CommandResultSet = new WebSqlCommandResultSet(r);
        return;
    }
    public doFail = (j: JQueryXHR): void => {
        //todo: fixup unhappy path.
        console.log("WebSqlCommandRequest ajax fail");
        console.log(j);
        return;
    }
}


class WebSqlConnectRequest {
    constructor(public serverName: string, public databaseName: string, public userId: string, public password: string) { }

    private callerCallback: () => any;
    public ConnectResult: WebSqlConnectResult;

    public Connect(callerCallback: () => any): void {
        var that = this;
        this.callerCallback = callerCallback;
        var xhr = $.ajax({
                url: "/api/SqlWeb/Connect",
                type: "POST",
                dataType: 'json',
                data: JSON.stringify(that),
                contentType: "application/json;charset=utf-8",
            })
            .done((j: JQueryXHR) => { that.doDone(j); })
            .fail((j: JQueryXHR) => { that.doFail(j); })
            .always((j: JQueryXHR) => {
                if (that.callerCallback) {
                        that.callerCallback();
                }
            });
    }

    public doDone = (j: JQueryXHR): void => {
        var r: IWebSqlConnectResult = <any>j;
        this.ConnectResult = new WebSqlConnectResult(
            r.connectionGuid, r.state, r.message);
        return;
    }
    public doFail = (j: JQueryXHR): void => {
        //todo: fixup unhappy path.
        console.log("WebSqlConnectRequest ajax fail");
        console.log(j);
        return;
    }

    public connectCallback = (data: any, textStatus: string, jqXHR: JQueryXHR) : void => {
        this.callerCallback();
    }

}


interface IWebSqlCommandResultSet {
    results: IWebSqlCommandResult[];
}

interface IWebSqlCommandResult {
    columns: string[];
    rows: string[][];
    rowsAffected: number;
    errorLineNumber: number;
    errorCode: number;
    errorMessage: string;
}

interface IWebSqlConnectResult {
    connectionGuid: string;
    state: string;
    message: string;
}

class WebSqlConnectResult implements IWebSqlConnectResult{
    constructor(public connectionGuid: string, public state: string, public message: string) { }
}

class WebSqlCommandResultSet {
    public results: IWebSqlCommandResult[]
    constructor(resultSet: IWebSqlCommandResultSet) {
        this.results = resultSet.results;
    }
}

class StringBuilder {
    //StringBuilder code converted to TypeScript using code from http://www.codeproject.com/Articles/12375/JavaScript-StringBuilder

    private escape: HTMLTextAreaElement = null;    
    public strings: string[] = [];

    constructor(value?: string) {
        if (value) {
            this.append(value);
        }
        if (document) {
            this.escape = document.createElement('textarea');
        }
    }

    public append(value: string): void {
        if (value) {
            this.strings.push(value);
        }
    }

    // appendEscaped idea thanks to http://stackoverflow.com/users/552067/web-designer
    // http://stackoverflow.com/questions/5499078/fastest-method-to-escape-html-tags-as-html-entities
    public appendEscaped(value: string) : void {
        if (value) {
            this.strings.push(this.escapeHTML(value));
        }
    }

    public clear(): void {
        this.strings.length = 1;
    }

    public toString(): string {
        return this.strings.join("");
    }

    public escapeHTML(html: string): string {
        this.escape.innerHTML = html;
        return this.escape.innerHTML;
    }
}
