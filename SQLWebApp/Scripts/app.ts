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
    var commandRequest = new WebSqlCommandRequest($("#txtConnectionGuid").val(), $("#txtSqlCommand").val());
    commandRequest.Execute(() => {
        var r = commandRequest.CommandResultSet;
        renderAllResultSets(r);
    });
};


function renderAllResultSets(resultSet: WebSqlCommandResultSet) {
    $("#results").empty();
    for (var resultSetIndex = 0; resultSetIndex < resultSet.results.length; resultSetIndex++) {
        renderResultSet(resultSet.results[resultSetIndex]);
    }
}

function renderResultSet(result: IWebSqlCommandResult) {
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

function buildTableRow(rowData: string[], cssClasses?: string): JQuery {
    //todo: refactor without jQuery
    var colCount = rowData.length;
    var tableRow = $("<tr></tr>");
    for (var colIndex = 0; colIndex < colCount; colIndex++) {
        tableRow.append($("<td></td>").text(rowData[colIndex] ? rowData[colIndex] : "Column" + colIndex.toString() ));
    }
    if (cssClasses) {
        tableRow.addClass(cssClasses);
    }
    return tableRow;
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