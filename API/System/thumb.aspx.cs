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
using System.IO;

public partial class UserHome_ClientAccess_ViewOrders_ViewDocument : IDS
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
            Response.AppendHeader("Content-Disposition", "attachment; filename=" + dr["FileName"].ToString() + ".thumb." + dr["FileExtension"].ToString());
            
            System.Drawing.Image img = byteArrayToImage((byte[])dr["FileData"]);
            System.Drawing.Image thumb;
            if (img.Width > img.Height)
            {
                thumb = img.GetThumbnailImage(200,(200 * img.Height) / img.Width, new System.Drawing.Image.GetThumbnailImageAbort(ThumbnailCallback), IntPtr.Zero);
            }
            else
            {
                thumb = img.GetThumbnailImage((200*img.Width)/img.Height,200, new System.Drawing.Image.GetThumbnailImageAbort(ThumbnailCallback), IntPtr.Zero);
            }
            

            MemoryStream imageStream = new MemoryStream();

            if (dr["FileExtension"].ToString().ToLower() == "jpg" || dr["FileExtension"].ToString().ToLower() == "jpeg")
            {
                thumb.Save(imageStream, System.Drawing.Imaging.ImageFormat.Jpeg);
            }
            else if (dr["FileExtension"].ToString().ToLower() == "png")
            {
                thumb.Save(imageStream, System.Drawing.Imaging.ImageFormat.Png);
            }
            else if (dr["FileExtension"].ToString().ToLower() == "tif" || dr["FileExtension"].ToString().ToLower() == "tiff")
            {
                thumb.Save(imageStream, System.Drawing.Imaging.ImageFormat.Tiff);
            }            

            byte[] imageContent = new Byte[imageStream.Length];

            imageStream.Position = 0;
            imageStream.Read(imageContent, 0, (int)imageStream.Length);

            Response.BinaryWrite(imageContent);
        }
        cn.Close();

    }

    public bool ThumbnailCallback()
    {
        return true;
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
