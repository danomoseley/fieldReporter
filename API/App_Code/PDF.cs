using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Diagnostics;
using System.IO;
using System.Collections.Specialized;

/// <summary>
/// Summary description for PDF
/// </summary>
public class PDF
{
	public PDF()
	{
		//
		// TODO: Add constructor logic here
		//
	}

    public static string path = "http://127.0.0.1:8081/fieldreporter/api/reports/";
    //public static string path = "http://localhost:56687/NEST_Web/reports/";
    public static int maxRequestSize = 20;

    public static byte[] WKHtmlToPdf(string url,NameValueCollection formVariables)
    {
        var fileName = " - ";
        var wkhtmlDir = "C:\\Program Files\\wkhtmltopdf";
        var wkhtml = "C:\\Program Files\\wkhtmltopdf\\wkhtmltopdf.exe";
        var p = new Process();

        p.StartInfo.CreateNoWindow = true;
        p.StartInfo.RedirectStandardOutput = true;
        p.StartInfo.RedirectStandardError = true;
        p.StartInfo.RedirectStandardInput = true;
        p.StartInfo.UseShellExecute = false;
        p.StartInfo.FileName = wkhtml;
        p.StartInfo.WorkingDirectory = wkhtmlDir;

        string switches = "";
        switches += "--print-media-type ";
        switches += "--margin-top 10mm --margin-bottom 10mm --margin-right 10mm --margin-left 10mm ";

        
        foreach (string key in formVariables)
        {
            string value = System.Net.WebUtility.HtmlDecode(formVariables[key]);
            switches += "--post " + key + " " + value + " ";
        }

        switches += "--page-size Letter ";
        p.StartInfo.Arguments = switches + " " + url + " " + fileName;
        //p.StartInfo.Arguments = switches + " http://localhost:56687/NEST_Web/reports/wolots.aspx " + fileName;
    
        p.Start();

        //read output
        byte[] buffer = new byte[32768];
        byte[] file;
        using (var ms = new MemoryStream())
        {
            while (true)
            {
                int read = p.StandardOutput.BaseStream.Read(buffer, 0, buffer.Length);

                if (read <= 0)
                {
                    break;
                }
                ms.Write(buffer, 0, read);
            }
            file = ms.ToArray();
        }

        // wait or exit
        p.WaitForExit(60000);

        // read the exit code, close process
        int returnCode = p.ExitCode;
        p.Close();

        return returnCode == 0 ? file : null;
    }
}