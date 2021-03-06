﻿using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace SQLWebApp.Models
{
    public class WebSqlCommandResult
    {
        public List<string> columns { get; set; }
        public List<List<string>> rows { get; set; }
        public Int64 rowsAffected { get; set; }
        public Int32 errorCode { get; set; }
        public Int32 errorLineNumber { get; set; }
        public string errorMessage { get; set; }

        public WebSqlCommandResult(SqlDataReader reader)
        {
            this.rows = new List<List<string>>(reader.RecordsAffected + 1);
            this.rowsAffected = reader.RecordsAffected;
            int fieldCount = reader.FieldCount;
            this.columns = new List<string>(fieldCount);
            int internalRowCount = 0;

            for (int i = 0; i < fieldCount; i++)
            {
                this.columns.Add(reader.GetName(i));
            }

            while (reader.Read())
            {
                var columns = new List<string>(fieldCount);
                for (int i = 0; i < fieldCount; i++)
                {
                    columns.Add(reader[i].ToString());
                }
                rows.Add(columns);
                internalRowCount++;
            }
            if (this.rowsAffected == -1 && internalRowCount > 0)
            {
                this.rowsAffected = internalRowCount;
            }

            this.errorCode = 0;
            this.errorLineNumber = 0;
            this.errorMessage = "";
        }

        public WebSqlCommandResult(Exception ex)
        {
            this.rows = null;
            this.columns = null;
            this.rowsAffected = 0;
            var sqlEx = ex as SqlException;
            if (sqlEx != null)
            {
                this.errorCode = sqlEx.ErrorCode;
                this.errorLineNumber = sqlEx.LineNumber;
                this.errorMessage = sqlEx.Message;
            }
        }

    }
}