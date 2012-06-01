using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data.SqlClient;
using System.Configuration;
using System.Net;

public partial class reports_workOrder : System.Web.UI.Page
{

    protected void Page_Load(object sender, EventArgs e)
    {
        WebClient client = new WebClient();

        /*SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["mainConn"].ConnectionString);
        conn.Open();
        SqlCommand cmd = new SqlCommand();
        cmd.Connection = conn;

        cmd.CommandText = "select * from WorkOrderPrintOut where seqnum in (";
        int i = 0;

        string idString = "";
        if (Request.QueryString["id"] != "" && Request.QueryString["id"] != null)
        {
            idString = Request.QueryString["id"];            
        }
        else
        {
            idString = Request.Form["id"];
        }

        foreach (string id in idString.Split(','))
        {
            cmd.CommandText += id;
            if (i < idString.Split(',').Length - 1)
            {
                cmd.CommandText += ",";
            }
            i++;
        }
        cmd.CommandText += ")";

        SqlDataReader dr = cmd.ExecuteReader();
        while (dr.Read())
        {*/
            String htmlCode = client.DownloadString(PDF.path + "html/WorkOrder.html");
            /*for (i = 0; i < dr.FieldCount; i++)
            {
                htmlCode = htmlCode.Replace("[:" + dr.GetName(i) + ":]", IDS.ConvertToText(dr[dr.GetName(i)].ToString()));
            }*/
            bodyContainer.Text += htmlCode;
        /*}
        dr.Close();

        conn.Close();*/
    }
}