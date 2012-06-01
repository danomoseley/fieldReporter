using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.IO;
using System.Net;
using System.Configuration;
using System.Diagnostics;

public partial class pdf : System.Web.UI.Page
{    
    protected void Page_Load(object sender, EventArgs e)
    {
        printReport(Request.QueryString["report"]);
    }

    private void printReport(string report)
    {
        if (report != "" && report!=null)
        {
            var url = PDF.path + report + ".aspx";
            if (Request.QueryString["id"] != "" && Request.QueryString["id"] != null)
            {
                url += "?id=" + Request.QueryString["id"];
            }

            var file = PDF.WKHtmlToPdf(url, Request.Form);
            if (file != null)
            {
                Response.ContentType = "Application/pdf";
                Response.AppendHeader("Content-Disposition", "attachment; filename=orderPrintout.pdf");
                Response.BinaryWrite(file);
                Response.End();
            }
            else
            {
                Response.Write(url);
            }
        }
        else
        {
            Response.Write("Specify a report");
        }
    }
}