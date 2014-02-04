using System;
using System.Diagnostics;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using SQLWebApp.Models;

namespace SQLWebApp.Tests
{
    [TestClass]
    public class WebSqlConnectionTests
    {
        public const string ZeroGuid = "00000000-0000-0000-0000-000000000000";

        [TestMethod]
        public void NewConnectionHasPropertiesSetAsExpected()
        {
            var conn = new WebSqlConnection(@"localhost\sqlexpress","junk","","",5);
            Assert.AreEqual(36, conn.guid.ToString().Length, "expect appropriate GUID length.");
            Assert.AreEqual(ZeroGuid, conn.guid.ToString(),"expect zero GUID.");
            Assert.AreEqual(@"localhost\sqlexpress", conn.connection.DataSource, "expect correct server name");
            Assert.AreEqual("junk", conn.connection.Database, "expect correct database name");
        }

        //todo: refactor to not use real connections to a real DB...
        [TestMethod]
        public void NewValidConnectionWorks()
        {
            var conn = new WebSqlConnection(@"localhost\sqlexpress", "junk", "", "", 5);
            var connResult = conn.connect();
            Assert.AreEqual("", connResult.message, "expect empty message on successful connect");
            Assert.AreEqual("Open", connResult.state, "expect open connection");
            Assert.AreNotEqual(ZeroGuid, connResult.connectionGuid.ToString(), "expect non-zero GUID");
        }

        //todo: refactor to not use real connections to a real DB...
        [TestMethod]
        public void NewInvalidConnectionReportsCorrectStatus()
        {
            var conn = new WebSqlConnection(@"localhost\sqlexpress_DOES_NOT_EXIST", "junk", "", "", 3);
            var connResult = conn.connect();
            Assert.IsTrue(connResult.message.IndexOf("error") >= 0, "expect error message on failed connect");
            Assert.AreEqual("Closed", connResult.state, "expect closed connection");
            Assert.AreEqual(ZeroGuid, connResult.connectionGuid.ToString(), "expect zero GUID");
        }
    }
}
