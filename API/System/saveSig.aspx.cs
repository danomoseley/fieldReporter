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

public partial class saveSig : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        try
        {
            SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["mainConn"].ConnectionString);
            conn.Open();
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = conn;
            cmd.CommandText = "INSERT INTO Document (Type,Filename,FileExtension,Ordnum,signature,inputby,Latitude,Longitude) VALUES ('Signature','Signature','png',@ordnum,@filedate,@signer,@latitude,@longitude)";
            cmd.Parameters.AddWithValue("Ordnum", Request.Form["ordnum"]);
            cmd.Parameters.AddWithValue("filedate", Request.Form["img"]);
            cmd.Parameters.AddWithValue("signer", Request.Form["signer"]);
            cmd.Parameters.AddWithValue("latitude", Request.Form["lat"]);
            cmd.Parameters.AddWithValue("longitude", Request.Form["lng"]);
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
    public System.Drawing.Image Base64ToImage(string base64String)
    {
        // Convert Base64 String to byte[]
        byte[] imageBytes = Convert.FromBase64String(base64String);
        MemoryStream ms = new MemoryStream(imageBytes, 0,
          imageBytes.Length);

        // Convert byte[] to Image
        ms.Write(imageBytes, 0, imageBytes.Length);
        System.Drawing.Image image = System.Drawing.Image.FromStream(ms, true);
        return image;
    }
}