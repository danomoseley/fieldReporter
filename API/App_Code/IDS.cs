using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net.Mail;
using System.Data.SqlClient;
using System.Text.RegularExpressions;
using System.IO;
using System.Drawing;
using System.Windows.Forms;

/// <summary>
/// Summary description for IDS
/// </summary>
public class IDS : System.Web.UI.Page
{

    private static string APP_connectionString = "mainConn";

    public IDS()
    {
        //
        // TODO: Add constructor logic here
        //
    }

    public static string json_error(Exception ex)
    {
        Random rand = new Random();
        int code = rand.Next(10000, 99999);
        string jsonReturn = "{\"success\":\"False\",\"code\":\"0x" + code + "\"}";
        string msgbody = "An unrecoverable error has occured " + "\n\nCODE:\n  " + code + "\n\nBROWSER:\n  " + HttpContext.Current.Request.Browser.Browser + " " + HttpContext.Current.Request.Browser.Version + "\n\nMethod:\n" + ex.TargetSite + "\n\nERROR MESSAGE:\n  " + ex.Message + "\n\nSTACK TRACE:\n  " + ex.StackTrace;
        sendMailMessage("dan@intelligentdata.com", "dan@intelligentdata.com", "FieldReporter Error", msgbody);
        return "{\"success\":\"false\",\"message\":\"" + ex.Message + "\"}";
    }

    public static void sendMailMessage(string from, string to, string subject, string body)
    {
        string[] toList = new string[100];

        toList = to.Split(';');

        string host = "exchange.intelligentdata.com";
        int port = 25;
        string username = "dan@intelligentdata.com";
        string password = "danids1313";

        SmtpClient smtpcli = new SmtpClient(host, port);
        smtpcli.UseDefaultCredentials = false;
        smtpcli.Credentials = new System.Net.NetworkCredential(username, password);
        //smtpcli.Timeout = 5000;

        MailMessage msg = new MailMessage("web@intelligentdata.com", toList[0], subject, body);

        for (int i = 1; i < toList.Length; i++)
        {
            msg.To.Add(toList[i].Trim());
        }

        smtpcli.Send(msg);
    }

    public static string makeJson(SqlDataReader dr)
    {
        bool obj = false;
        string tasks = "";
        if (HasColumn(dr, "ID")){
            tasks += "{";
            obj = true;
        }else{
            tasks += "[";
        }
        
        int k = 0;
        while (dr.Read())
        {
            if (k > 0)
            {
                tasks += ",";
            }
            tasks += dataReadertoJson(dr);
            k++;
        }
        if (obj)
        {
            tasks += "}";
        }
        else
        {
            tasks += "]";
        }
        return tasks;
    }

    public static string makeJsonSingleton(SqlDataReader dr)
    {
        if (dr.HasRows)
        {
            dr.Read();
            string tasks = dataReadertoJson(dr);
            return tasks;
        }
        else
        {
            return "{}";
        }
    }

    public static string storedProcedureToJson(SqlCommand cmd,String type = "object")
    {
        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings[APP_connectionString].ConnectionString);
        conn.Open();
        cmd.Connection = conn;
        SqlDataReader dr = cmd.ExecuteReader();
        string json = "";
        if (type == "singleton")
        {
            json = "{\"type\":\"" + type + "\",\"timestamp\":\"" + SQLTimestamp() + "\",\"collection\":" + makeJsonSingleton(dr) + "}";
        }
        else
        {
            json = "{\"type\":\"" + type + "\",\"timestamp\":\"" + SQLTimestamp() + "\",\"collection\":" + makeJson(dr) + "}";
        }
        
        dr.Close();
        conn.Close();

        return json;
    }

    public static string jsonResponse(List<KeyValuePair<string, string>> json)
    {
        string ret = "{";
        int i = 0;
        foreach (KeyValuePair<string, string> item in json)
        {
            if (i > 0)
            {
                ret += ",";
            }
            ret += "\"" + item.Key + "\":" + item.Value;
            i++;
        }
        ret += "}";
        return "{\"success\":\"true\",\"json\":" + ret + "}";
    }

    public static void writeJsonResponse(string json)
    {
        HttpContext.Current.Response.Clear();
        HttpContext.Current.Response.Write(json);
    }

    public static string dataReadertoJson(SqlDataReader dr)
    {
        string json = "";
        if (HasColumn(dr,"ID"))
        {
            json = "\"" + dr["ID"].ToString() + "\":";
        }
        json += "{";
        int i = 0;
        for (i = 0; i < dr.FieldCount; i++)
        {
            if (i > 0)
            {
                json += ",";
            }
            json += "\"" + dr.GetName(i) + "\":\"" + RTFtoTXT(dr[i].ToString().Replace("\"", "'")) + "\"";

        }

        json += "}";
        return json;
    }

    public static bool HasColumn(SqlDataReader dr, string columnName)
    {
        for (int i = 0; i < dr.FieldCount; i++)
        {
            if (dr.GetName(i).Equals(columnName, StringComparison.InvariantCultureIgnoreCase))
                return true;
        }
        return false;
    }

    public static string SQLTimestamp()
    {
        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings[APP_connectionString].ConnectionString);
        conn.Open();
        SqlCommand cmd = new SqlCommand("select dbo.sqlTimeStamp() as timestamp", conn);
        SqlDataReader dr = cmd.ExecuteReader();
        dr.Read();
        string timestamp = dr["timestamp"].ToString();
        dr.Close();
        conn.Close();
        return timestamp;
    }

    protected static String RTFtoTXT(string RTF)
    {
        return Regex.Replace(RTF, @"\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?", "").Replace("\n\r", "<br/>").Replace("\n", "<br/>").Replace("\r", "<br/>").Replace("\0", "<br/>");
    }

    public Image Base64ToImage(string base64String)
    {
        // Convert Base64 String to byte[]
        byte[] imageBytes = Convert.FromBase64String(base64String);
        MemoryStream ms = new MemoryStream(imageBytes, 0,
          imageBytes.Length);

        // Convert byte[] to Image
        ms.Write(imageBytes, 0, imageBytes.Length);
        Image image = Image.FromStream(ms, true);
        return image;
    }

    public string ImageToBase64(Image image, System.Drawing.Imaging.ImageFormat format)
    {
        using (MemoryStream ms = new MemoryStream())
        {
            // Convert Image to byte[]
            image.Save(ms, format);
            byte[] imageBytes = ms.ToArray();

            // Convert byte[] to Base64 String
            string base64String = Convert.ToBase64String(imageBytes);
            return base64String;
        }
    }

    public byte[] imageToByteArray(System.Drawing.Image imageIn)
    {
        MemoryStream ms = new MemoryStream();
        imageIn.Save(ms, System.Drawing.Imaging.ImageFormat.Gif);
        return ms.ToArray();
    }

    public Image byteArrayToImage(byte[] byteArrayIn)
    {
        MemoryStream ms = new MemoryStream(byteArrayIn);
        Image returnImage = Image.FromStream(ms);
        return returnImage;
    }

    static public void addParameterFromForm(ref SqlCommand cmd, string formKey)
    {
        if (HttpContext.Current.Request.Form[formKey] == null)
        {
            throw new Exception(formKey + " is required");
        }
        else
        {
            cmd.Parameters.AddWithValue(formKey, HttpContext.Current.Request.Form[formKey]);
        }
    }

    static public string ConvertToText(string rtf)
    {
        if (rtf.StartsWith(@"{\rtf"))
        {
            RichTextBox rtb = new RichTextBox();
            rtb.Rtf = rtf;
            return rtb.Text.Replace("\r", "<br/>").Replace("\n", "<br/>"); ;
        }
        else
        {
            return rtf;
        }
    }
}