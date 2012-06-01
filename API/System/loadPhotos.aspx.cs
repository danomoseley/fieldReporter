using System;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Web;
using System.Web.Security;
using System.IO;
using System.Data.SqlClient;
using System.Text.RegularExpressions;
using System.Globalization;
using System.Net;
using System.Drawing;
using System.Windows.Forms;
using Newtonsoft.Json;

public partial class saveSig : IDS
{
    protected void Page_Load(object sender, EventArgs e)
    {
        try
        {
            SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["mainConn"].ConnectionString);
            conn.Open();
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = conn;
            cmd.CommandText = "Execute loadPhotos @linkType,@linkID";
            cmd.Parameters.AddWithValue("linkType", Request.Form["linkType"]);
            cmd.Parameters.AddWithValue("linkID", Request.Form["linkID"]);
            //cmd.Parameters.AddWithValue("linkType", "SurveyItem");
            //cmd.Parameters.AddWithValue("linkID", 50079);

            SqlDataReader dr = cmd.ExecuteReader();

            string json = "[";
            int k = 0;
            while (dr.Read())
            {
                if (k > 0)
                {
                    json += ",";
                }
                json += "{";
                //MemoryStream ms = new MemoryStream((byte[])dr["FileData"]);
                //Image oImage = Image.FromStream((Stream)ms);


                json += "\"docID\":\"" + dr["id"].ToString() + "\",\"comment\":\"" + dr["comment"].ToString() + "\"";
                json += "}";
                k++;
            }
            json += "]";

            dr.Close();
            conn.Close();
            Response.Write("{\"success\":\"true\",\"photos\":" + json + "}");
        }
        catch (Exception ex)
        {
            Response.Write(json_error(ex.Message));
        }
    }

    public string json_error(string text)
    {
        return "{\"success\":\"false\",\"message\":\"" + text + "\"}";
    }
    public string json_response(string text)
    {
        return "{\"success\":\"true\",\"message\":\"" + text + "\"}";
    }
}