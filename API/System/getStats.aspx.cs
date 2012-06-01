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

public partial class getStats : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        try
        {
            SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
            conn.Open();

            SqlCommand cmd = new SqlCommand("select count(*) as completed from Inspection a where active=1 and " +
                                    "(select COUNT(*) from InspectionItem where InspectionID=a.ID) = " +
                                    "(select COUNT(*) FROM InspectionItem where InspectionID=a.ID and (Response1>0 OR Response2>0 OR Response3>0 OR Response4>0 OR Response5>0 OR Response6>0 OR Response7>0 OR Response8>0)) "+
                                    "and CONVERT(varchar,InspectionDate,101) = CONVERT(varchar,GETDATE(),101)", conn);
              
            SqlDataReader dr = cmd.ExecuteReader();
            dr.Read();

            int inspectionsCompleted = Convert.ToInt32(dr["completed"]);

            dr.Close();

            cmd = new SqlCommand("select count(*) as pending from Inspection a where active=1 and " +
                                    "(select COUNT(*) FROM InspectionItem where InspectionID=a.ID and (Response1>0 OR Response2>0 OR Response3>0 OR Response4>0 OR Response5>0 OR Response6>0 OR Response7>0 OR Response8>0))=0 " +
                                    "and CONVERT(varchar,InspectionDate,101) = CONVERT(varchar,GETDATE(),101)", conn);

            dr = cmd.ExecuteReader();
            dr.Read();

            int inspectionsPending = Convert.ToInt32(dr["pending"]);

            dr.Close();

            cmd = new SqlCommand("select count(*) as started from Inspection a where active=1 and " +
                                    "(select COUNT(*) FROM InspectionItem where InspectionID=a.ID and (Response1>0 OR Response2>0 OR Response3>0 OR Response4>0 OR Response5>0 OR Response6>0 OR Response7>0 OR Response8>0))>0 " +
                                    "and CONVERT(varchar,InspectionDate,101) = CONVERT(varchar,GETDATE(),101)", conn);

            dr = cmd.ExecuteReader();
            dr.Read();

            int inspectionsStarted = Convert.ToInt32(dr["started"]);

            dr.Close();

            cmd = new SqlCommand("select COUNT(*) as openCount from WorkOrder where ServiceDate is null and InvoiceDate is null and CompletionDate is null and CONVERT(varchar,OrderDate,101)=CONVERT(varchar,GETDATE(),101)", conn);

            dr = cmd.ExecuteReader();
            dr.Read();

            int ordersOpen = Convert.ToInt32(dr["openCount"]);

            dr.Close();

            cmd = new SqlCommand("select COUNT(*) as invoiced from WorkOrder where InvoiceDate is not null and CONVERT(varchar,OrderDate,101)=CONVERT(varchar,GETDATE(),101)", conn);

            dr = cmd.ExecuteReader();
            dr.Read();

            int ordersInvoiced = Convert.ToInt32(dr["invoiced"]);

            dr.Close();

            cmd = new SqlCommand("select COUNT(*) as completed from WorkOrder where CompletionDate is not null and CONVERT(varchar,OrderDate,101)=CONVERT(varchar,GETDATE(),101)", conn);

            dr = cmd.ExecuteReader();
            dr.Read();

            int orderscompleted = Convert.ToInt32(dr["completed"]);

            dr.Close();

            cmd = new SqlCommand("select COUNT(*) as progress from WorkOrder where serviceDate is not null and CONVERT(varchar,OrderDate,101)=CONVERT(varchar,GETDATE(),101)", conn);

            dr = cmd.ExecuteReader();
            dr.Read();

            int ordersInProgress = Convert.ToInt32(dr["progress"]);

            dr.Close();

            int inspectionTotal = inspectionsCompleted + inspectionsPending + inspectionsStarted;
            int ordersTotal = ordersOpen + ordersInvoiced + orderscompleted + ordersInProgress;
            string inspections = "{\"completed\":\"" + inspectionsCompleted + "\",\"pending\":\"" + inspectionsPending + "\",\"started\":\"" + inspectionsStarted + "\",\"total\":\"" + inspectionTotal + "\"}";
            string orders = "{\"completed\":\"" + orderscompleted + "\",\"invoiced\":\"" + ordersInvoiced + "\",\"open\":\"" + ordersOpen + "\",\"total\":\"" + ordersTotal + "\",\"inprogress\":\"" + ordersInProgress + "\"}";

            conn.Close();

            Response.Write("{\"success\":\"true\",\"inspections\":" + inspections + ",\"orders\":" + orders + "}");
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
}