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

public partial class getSystem : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string id = null;
        id = Request.Form["id"];
        try
        {
            Response.Write("{\"success\":\"true\",\"Clients\":" + getClients() + ",\"Company\":" + getCompany() + ",\"states\":" + getStates() + ",\"Category\":" + getCategory() + ",\"OrderType\":" + getOrderType() + ",\"CustomerInfo\":" + getCustomerInfo() + "}");
        }
        catch (Exception ex)
        {
            Response.Write(json_error(ex.Message));
        }
    }

   
    public string makeJson(SqlDataReader dr)
    {
        string tasks = "[";
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
        tasks += "]";
        return tasks;
    }

    

    public string dataReadertoJson(SqlDataReader dr)
    {
        string json = "{";
        for (int i = 0; i < dr.FieldCount; i++)
        {
            if (i > 0)
            {
                json += ",";
            }
            if (dr[i].ToString().Length > 6 && dr[i].ToString().Substring(0, 6) == "{\\rtf1")
            {
                json += "\"" + dr.GetName(i) + "\":\"" + RTFtoTXT(dr[i].ToString().Replace("\"", "'")) + "\"";
            }
            else
            {
                json += "\"" + dr.GetName(i) + "\":\"" + dr[i].ToString().Replace("\"","'") + "\"";
            }
            
        }
        json += "}";
        return json;
    }

    public string json_error(string text)
    {
        return "{\"success\":\"false\",\"message\":\"" + text + "\"}";
    }

    protected String RTFtoTXT(string RTF)
    {
        return Regex.Replace(RTF, @"\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?", "").Replace("\n", "").Replace("\r", "").Replace("\0", "");
    }

    //===================================================
    public string getClients()
    {
        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("execute GetClients", conn);

        SqlDataReader dr = cmd.ExecuteReader();

        string tasks = makeJson(dr);

        dr.Close();
        conn.Close();

        return tasks;
    }

    public string getCompany()
    {
        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("select DISTINCT Company from Accounts order by Company asc", conn);

        SqlDataReader dr = cmd.ExecuteReader();

        string tasks = makeJson(dr);

        dr.Close();
        conn.Close();

        return tasks;
    }

    public string getStates()
    {
        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("select distinct State from Vendors order by State asc", conn);

        SqlDataReader dr = cmd.ExecuteReader();

        string state = makeJson(dr);

        dr.Close();
        conn.Close();

        return state;
    }

  /*  public string getVendors()
    {
        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("select distinct Company from Vendors order by Company asc", conn);

        SqlDataReader dr = cmd.ExecuteReader();

        string vendors = makeJson(dr);

        dr.Close();
        conn.Close();

        return vendors;
    }*/

    public string getCategory()
    {
        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("select DISTINCT Category from WorkOrders where len(Category)!= 0 order by Category asc", conn);

        SqlDataReader dr = cmd.ExecuteReader();

        string tasks = makeJson(dr);

        dr.Close();
        conn.Close();

        return tasks;
    }

    public string getOrderType()
    {
        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("select DISTINCT Ordertype from WorkOrders order by Ordertype asc", conn);

        SqlDataReader dr = cmd.ExecuteReader();

        string tasks = makeJson(dr);

        dr.Close();
        conn.Close();

        return tasks;
    }

    public string getCustomerInfo()
    {
        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("select * from Customer_Information where id='NEST'", conn);

        SqlDataReader dr = cmd.ExecuteReader();

        string info = makeJson(dr);

        dr.Close();
        conn.Close();

        return info;
    }
    //===================================================
}