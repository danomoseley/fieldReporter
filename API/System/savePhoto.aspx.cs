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
            cmd.CommandText = "Execute savePhoto 'jpg',@linkType,@linkID,@imageData,@comment";
            cmd.Parameters.AddWithValue("linkType", Request.Form["linkType"]);
            cmd.Parameters.AddWithValue("linkID", Request.Form["linkID"]);
            cmd.Parameters.AddWithValue("comment", Request.Form["comment"]);
            System.Drawing.Image imageData = Base64ToImage(Request.Form["imageData"]);

            MemoryStream imageStream = new MemoryStream();
            imageData.Save(imageStream, System.Drawing.Imaging.ImageFormat.Jpeg);

            byte[] imageContent = new Byte[imageStream.Length];

            imageStream.Position = 0;
            imageStream.Read(imageContent, 0, (int)imageStream.Length);

            cmd.Parameters.AddWithValue("imageData", imageContent);

            SqlDataReader dr = cmd.ExecuteReader();

            dr.Read();
            int id = Convert.ToInt32(dr["id"]);
            dr.Close();

            conn.Close();
            Response.Write("{\"success\":\"true\",\"id\":\""+id+"\"}");
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