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

public partial class ipadLocation : IDS
{
    protected void Page_Load(object sender, EventArgs e)
    {
        try
        {
            string user = Request.Form["user"];
            string lat = Request.Form["lat"];
            string lng = Request.Form["lng"];

            Response.Write("{\"success\":\"true\",\"location\":" + Location(user, lat, lng) + "}");

        }
        catch (Exception ex)
        {
            Response.Write(json_error(ex));
        }
    }

    public string Location(string user, string lat, string lng)
    {
        if (user != "E" || lat != "E" || lng != "E")
        {
            SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
            conn.Open();

            SqlCommand cmd = new SqlCommand("INSERT INTO IpadLocationHistory VALUES (@user,@lat,@lng,@date)", conn);
            cmd.Parameters.AddWithValue("user", user);
            cmd.Parameters.AddWithValue("lat", lat);
            cmd.Parameters.AddWithValue("lng", lng);
            cmd.Parameters.AddWithValue("date", DateTime.Now);

            SqlDataReader dr = cmd.ExecuteReader();
            dr.Read();
            string loc = "done";
            dr.Close();
            conn.Close();
            return loc;
        }
        else return "error";
    }
}