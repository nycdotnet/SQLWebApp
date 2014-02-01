using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SQLWebApp.Models
{
    public class WebSqlConnectRequest
    {
        public string serverName { get; set; }
        public string databaseName { get; set; }
        public string userId { get; set; }
        public string password { get; set; }
    }
}