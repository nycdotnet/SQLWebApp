using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Routing;
using SQLWebApp.Models;

namespace SQLWebApp
{

    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);

            var connections = new Dictionary<Guid,WebSqlConnection>();
            Application.Add("CONNECTION_DICTIONARY", connections);
        }
    }
}
