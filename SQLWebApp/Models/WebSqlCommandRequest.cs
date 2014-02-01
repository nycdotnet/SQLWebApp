using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SQLWebApp.Models
{
    public class WebSqlCommandRequest
    {
        public string connectionGuid { get; set; }
        public string commandText { get; set; }
    }
}