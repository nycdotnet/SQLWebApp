"use strict";

export class WebSqlCommandRequest {
    private callerCallback: (resultSet?: WebSqlCommandResultSet) => any;
    constructor(public connectionGuid: string, public commandText: string) { }

    public CommandResultSet: WebSqlCommandResultSet;

    public Execute(callerCallback: () => any): void {
        var that = this;
        this.callerCallback = callerCallback;
        var xhr = $.ajax({
            url: "/api/SqlWeb/Execute",
            type: "POST",
            dataType: 'json',
            data: JSON.stringify({connectionGuid: this.connectionGuid, commandText: this.commandText}),
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



export class WebSqlConnectRequest {
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
            data: JSON.stringify({ serverName: this.serverName, databaseName: this.databaseName, userId: this.userId, password: this.password}),
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

    public connectCallback = (data: any, textStatus: string, jqXHR: JQueryXHR): void => {
            this.callerCallback();
        }

}


export interface IWebSqlCommandResultSet {
    results: IWebSqlCommandResult[];
}

export interface IWebSqlCommandResult {
    columns: string[];
    rows: string[][];
    rowsAffected: number;
    errorLineNumber: number;
    errorCode: number;
    errorMessage: string;
}

export interface IWebSqlConnectResult {
    connectionGuid: string;
    state: string;
    message: string;
}

export class WebSqlConnectResult implements IWebSqlConnectResult {
    constructor(public connectionGuid: string, public state: string, public message: string) { }
}

export class WebSqlCommandResultSet {
    public results: IWebSqlCommandResult[]
    constructor(resultSet: IWebSqlCommandResultSet) {
        this.results = resultSet.results;
    }
}
