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

public partial class ping : IDS
{
    protected void Page_Load(object sender, EventArgs e)
    {
        try
        {

            //Response.Write("{\"success\":\"true\"}");
            Response.Write("{\"success\":\"true\",\"messageCount\":" + messagesCount() + ",\"deliverdCount\":" + deliverdCount() + "}");

        }
        catch (Exception ex)
        {
            Response.Write(json_error(ex));
        }
    }

    public string messagesCount()
    {
        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("select COUNT(*) as count from Messages where readFlag=0 and toUser='Jigisha'", conn);
        
        SqlDataReader dr = cmd.ExecuteReader();

        string messages = makeJson(dr);

        dr.Close();
        conn.Close();
        return messages;
    }

    public string deliverdCount()
    {
        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("select COUNT(*) as dcount from Messages where dFlag=0 and toUser='Jigisha'", conn);

        SqlDataReader dr = cmd.ExecuteReader();

        string dcount = makeJson(dr);

        dr.Close();

        SqlCommand cmd1 = new SqlCommand("update Messages set dFlag=1 where toUser='Jigisha' and dFlag =0", conn);

        SqlDataReader dr1 = cmd1.ExecuteReader();

        dr1.Close();
        conn.Close();
        return dcount;
    }
    

}