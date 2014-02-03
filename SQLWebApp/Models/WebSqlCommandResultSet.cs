using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SQLWebApp.Models
{
    public class WebSqlCommandResultSet
    {
        public string connectionGuid { get; set; }
        public string state { get; set; }
        public List<WebSqlCommandResult> results { get; set; }

        public WebSqlCommandResultSet(WebSqlConnection conn)
        {
            this.connectionGuid = conn.guid.ToString();
            this.state = conn.state;
            this.results = new List<WebSqlCommandResult>();
        }

        public void Append(System.Data.SqlClient.SqlDataReader reader)
        {
            var result = new WebSqlCommandResult(reader);
            results.Add(result);
        }

        internal void Append(Exception ex)
        {
            var result = new WebSqlCommandResult(ex);
            results.Add(result);

        }
    }
}