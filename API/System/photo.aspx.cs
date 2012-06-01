using System;
using System.Collections;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;
using System.Data.SqlClient;
public partial class UserHome_ClientAccess_ViewOrders_ViewDocument : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        SqlConnection cn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        SqlCommand cmd = new SqlCommand("select FileName,FileExtension,FileData from Document WHERE ID=" + Request.QueryString["id"], cn);

        cn.Open();
        SqlDataReader dr = cmd.ExecuteReader();
        if (dr.Read()) //check to see if image was found
        {
            Response.ContentType = GetMimeType(dr["FileName"].ToString() + "." + dr["FileExtension"].ToString());
            Response.AppendHeader("Content-Disposition", "attachment; filename=" + dr["FileName"].ToString() + "." + dr["FileExtension"].ToString());
            Response.BinaryWrite((byte[])dr["FileData"]);
        }
        cn.Close();

    }

    private string GetMimeType(string fileName)
    {
        string mimeType = "application/unknown";
        string ext = System.IO.Path.GetExtension(fileName).ToLower();
        Microsoft.Win32.RegistryKey regKey = Microsoft.Win32.Registry.ClassesRoot.OpenSubKey(ext);
        if (regKey != null && regKey.GetValue("Content Type") != null)
            mimeType = regKey.GetValue("Content Type").ToString();
        return mimeType;
    }
}
