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
            cmd.CommandText = "Execute deletePhoto @linkType,@linkID,@imageID";
            cmd.Parameters.AddWithValue("linkType", Request.Form["linkType"]);
            cmd.Parameters.AddWithValue("linkID", Request.Form["linkID"]);
            cmd.Parameters.AddWithValue("imageID", Request.Form["imageID"]);
            cmd.ExecuteNonQuery();
            conn.Close();
            Response.Write("{\"success\":\"true\"}");
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

    public byte[] imageToByteArray(System.Drawing.Image imageIn)
    {
        MemoryStream ms = new MemoryStream();
        imageIn.Save(ms, System.Drawing.Imaging.ImageFormat.Gif);
        return ms.ToArray();
    }
}