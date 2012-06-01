using System;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.IO;
using System.Data.SqlClient;
using System.Text.RegularExpressions;
using System.Globalization;


public partial class getSettings : IDS
{
    protected void Page_Load(object sender, EventArgs e)
    {
        try
        {
            SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
            conn.Open();

            SqlCommand cmd = new SqlCommand("execute tabletAuth @username,@password", conn);
            cmd.Parameters.AddWithValue("username", Request.Form["username"]);
            cmd.Parameters.AddWithValue("password", Request.Form["password"]);

            SqlDataReader dr = cmd.ExecuteReader();

            string settings = makeJson(dr);

            dr.Close();
            conn.Close();
            Response.Write("{\"success\":\"true\",\"user\":" + settings + "}");
        }
        catch (Exception ex)
        {
            Response.Write(json_error(ex));
        }
    }
}