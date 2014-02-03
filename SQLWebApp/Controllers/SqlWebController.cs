using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using SQLWebApp.Models;

namespace SQLWebApp.Controllers
{
    public class SqlWebController : ApiController
    {
        [HttpPost]
        public WebSqlConnectResult Connect(WebSqlConnectRequest input)
        {
            var conn = new WebSqlConnection(input.serverName, input.databaseName, input.userId, input.password, 10);
            var connections = getConnections();
            connections.Add(conn.guid, conn);
            return conn.connect();
        }

        [HttpPost]
        public WebSqlCommandResultSet Execute(WebSqlCommandRequest input)
        {
            var connection = getConnections()[Guid.Parse(input.connectionGuid)];
            WebSqlCommandResultSet resultSet = null;
            var cmd = new SqlCommand(input.commandText, connection.connection);
            try
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    resultSet = new WebSqlCommandResultSet(connection);
                    do
                    {
                        resultSet.Append(reader);
                    } while (reader.NextResult());
                    reader.Close();
                }
            }
            catch (Exception ex)
            {
                if (resultSet == null)
                {
                    resultSet = new WebSqlCommandResultSet(connection);
                    
                }
                resultSet.Append(ex);
            }
            resultSet.state = connection.state;
            return resultSet;
        }

        private Dictionary<Guid, WebSqlConnection> getConnections()
        {
            return HttpContext.Current.Application["CONNECTION_DICTIONARY"] as Dictionary<Guid, WebSqlConnection>;
        }
    }
}
