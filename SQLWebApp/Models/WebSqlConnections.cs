using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SQLWebApp.Models
{
    public class WebSqlConnections
    {
        public Dictionary<string,WebSqlConnection> Connections = new Dictionary<string,WebSqlConnection>();

    }
}