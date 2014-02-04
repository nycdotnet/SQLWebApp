using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace SQLWebApp.Models
{
    public class WebSqlConnection
    {
        
        public Guid guid {
            get
            {
                return connection.ClientConnectionId;
            }
        }
        
        public string state
        {
            get
            {
                return this.connection.State.ToString();
            }
        }

        public SqlConnection connection { get; set; }

        public WebSqlConnection(string serverName, string databaseName, string userId, string password, int connectTimeoutInSeconds)
        {
            string connectionString;
            if (userId == "" && password == "")
            {
                connectionString = String.Format("Data Source={0};Initial Catalog={1};Trusted_Connection=yes;Encrypt=yes;Connect Timeout={2};TrustServerCertificate=true;",
                    serverName, databaseName, connectTimeoutInSeconds.ToString());
            } else {
                connectionString = String.Format("Data Source={0};Initial Catalog={1};User ID={2};Password={3};Encrypt=yes;Connect Timeout={4};TrustServerCertificate=true;",
                    serverName, databaseName, userId, password, connectTimeoutInSeconds.ToString());
            }
            newFromConnectionString(connectionString);
        }

        public WebSqlConnection(string connectionString)
        {
            newFromConnectionString(connectionString);
        }

        private void newFromConnectionString(string connectionString) {
            this.connection = new SqlConnection(connectionString);
        }

        public WebSqlConnectResult connect()
        {
            WebSqlConnectResult result = new WebSqlConnectResult();
            if (this.connection.State == System.Data.ConnectionState.Open)
            {
                result.message = "A connect request is not required for an already-open connection.";
            }
            else {
                try
                {
                    this.connection.Open();
                    result.message = "";
                }
                catch (Exception ex)
                {
                    result.message = ex.Message;
                }
            }
            result.connectionGuid = this.guid.ToString();
            result.state = this.state;
            return result;
        }
    }
}