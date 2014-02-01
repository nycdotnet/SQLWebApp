using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SQLWebApp.Models
{
    public class WebSqlConnectResult
    {
        public string connectionGuid { get; set; }
        public string state { get; set; }
        public string message { get; set; }
    }
}