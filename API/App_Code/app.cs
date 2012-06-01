using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Data.SqlClient;
using Newtonsoft.Json;
using Ext.Net.Utilities;
using System.Web.Script.Serialization;
using System.Text;

/// <summary>
/// Summary description for app
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]
public class app : System.Web.Services.WebService {

    public app () {

        //Uncomment the following line if using designed components 
        //InitializeComponent(); 
    }

    [WebMethod]
    public void getAppData()
    {
        try
        {
            
            List<KeyValuePair<string, string>> json = new List<KeyValuePair<string, string>>();
            SqlCommand cmd = new SqlCommand("execute getFieldHosts @sessionID");
            cmd.Parameters.AddWithValue("sessionID", Context.Request.Form["sessionID"].ToString());
            json.Add(new KeyValuePair<string, string>("FieldHost", IDS.storedProcedureToJson(cmd)));

            cmd.CommandText = "execute getClients @sessionID";
            json.Add(new KeyValuePair<string, string>("Client", IDS.storedProcedureToJson(cmd)));

            cmd.CommandText = "execute getDeviceSettings @sessionID";
            json.Add(new KeyValuePair<string, string>("Settings", IDS.storedProcedureToJson(cmd,"singleton")));

            IDS.writeJsonResponse(IDS.jsonResponse(json));
        }
        catch (Exception ex)
        {
            IDS.writeJsonResponse(IDS.json_error(ex));
        }
    }

    [WebMethod]
    public void getLayout()
    {
        try
        {
            string json = "";
            SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainConn"].ConnectionString);
            conn.Open();

            SqlCommand getApps = new SqlCommand("select * from getApps(@sessionID)", conn);
            IDS.addParameterFromForm(ref getApps, "sessionID");

            SqlDataReader app = getApps.ExecuteReader();

            string apps = "{";
            int b = 0;
            while (app.Read())
            {
                if (b > 0) apps += ",";

                SqlCommand getWalls = new SqlCommand("select * from getWalls(@sessionID,@appID)", conn);
                IDS.addParameterFromForm(ref getWalls, "sessionID");
                getWalls.Parameters.AddWithValue("appID", app["ID"]);

                SqlDataReader wall = getWalls.ExecuteReader();

                string walls = "{";
                int a = 0;
                while (wall.Read())
                {
                    if (a > 0) walls += ",";
                    SqlCommand getWindows = new SqlCommand("select * from getWindows(@sessionID,@wallID)", conn);
                    IDS.addParameterFromForm(ref getWindows, "sessionID");
                    getWindows.Parameters.AddWithValue("wallID", wall["ID"]);

                    SqlDataReader window = getWindows.ExecuteReader();

                    string windows = "{";
                    int i = 0;
                    while (window.Read())
                    {
                        if (i > 0) windows += ",";


                        SqlCommand getScreens = new SqlCommand("select * from getScreens(@sessionID,@windowID)", conn);
                        IDS.addParameterFromForm(ref getScreens, "sessionID");
                        getScreens.Parameters.AddWithValue("windowID", window["id"]);

                        SqlDataReader screen = getScreens.ExecuteReader();

                        string screens = "{";
                        int k = 0;
                        while (screen.Read())
                        {
                            if (k > 0) screens += ",";

                            SqlCommand getViews = new SqlCommand("select * from getViews(@sessionID,@screenID)", conn);
                            IDS.addParameterFromForm(ref getViews, "sessionID");
                            getViews.Parameters.AddWithValue("screenID", screen["id"]);

                            SqlDataReader getViewsReader = getViews.ExecuteReader();

                            string views = IDS.makeJson(getViewsReader);

                            screens += "\"" + screen["ID"].ToString() + "\":{\"ID\":\"" + screen["ID"].ToString() + "\",\"title\":\"" + screen["title"].ToString() + "\",\"views\":" + views + "}";
                            k++;
                        }
                        screens += "}";
                        windows += "\"" + window["ID"].ToString() + "\":{\"ID\":\"" + window["ID"].ToString() + "\",\"title\":\"" + window["title"].ToString() + "\",\"screens\":" + screens + "}";
                        i++;
                    }
                    windows += "}";
                    walls += "\"" + wall["ID"].ToString() + "\":{\"ID\":\"" + wall["ID"].ToString() + "\",\"name\":\"" + wall["name"].ToString() + "\",\"windows\":" + windows + "}";
                    a++;
                }
                walls += "}";
                apps += "\"" + app["ID"].ToString() + "\":{\"ID\":\"" + app["ID"].ToString() + "\",\"name\":\"" + app["name"].ToString() + "\",\"walls\":" + walls + "}";
                b++;
            }
            apps += "}";


            json = "{\"success\":\"true\",\"json\":{\"apps\":" + apps + "}}";
            IDS.writeJsonResponse(json);
        }
        catch (Exception ex)
        {
            IDS.writeJsonResponse(IDS.json_error(ex));
        }
    }

    [WebMethod]
    public void init()
    {
        try
        {
            List<KeyValuePair<string, string>> json = new List<KeyValuePair<string, string>>();

            SqlCommand cmd = new SqlCommand("select [path] from [script] order by loadOrder asc");
            json.Add(new KeyValuePair<string, string>("scripts", IDS.storedProcedureToJson(cmd)));
            IDS.writeJsonResponse(IDS.jsonResponse(json));
        }
        catch (Exception ex)
        {
            IDS.writeJsonResponse(IDS.json_error(ex));
        }
    }

    [WebMethod]
    public void auth()
    {
        try
        {
            List<KeyValuePair<string, string>> json = new List<KeyValuePair<string, string>>();

            SqlCommand cmd = new SqlCommand("execute tabletAuth @username,@password,@authCode,@userAgent");
            cmd.Parameters.AddWithValue("username", Context.Request.Form["username"]);
            cmd.Parameters.AddWithValue("password", Context.Request.Form["password"]);
            cmd.Parameters.AddWithValue("authCode", Context.Request.Form["authCode"]);
            cmd.Parameters.AddWithValue("userAgent", Context.Request.Form["useragent"]);
            json.Add(new KeyValuePair<string, string>("user", IDS.storedProcedureToJson(cmd)));
            IDS.writeJsonResponse(IDS.jsonResponse(json));
        }
        catch (Exception ex)
        {
            IDS.writeJsonResponse(IDS.json_error(ex));
        }
    }

    [WebMethod]
    public void validateSession()
    {
        try
        {
            List<KeyValuePair<string, string>> json = new List<KeyValuePair<string, string>>();

            SqlCommand cmd = new SqlCommand("select dbo.validSession(@sessionID) as response");
            cmd.Parameters.AddWithValue("sessionID", Context.Request.Form["sessionID"]);

            json.Add(new KeyValuePair<string, string>("user", IDS.storedProcedureToJson(cmd)));
            IDS.writeJsonResponse(IDS.jsonResponse(json));
        }
        catch (Exception ex)
        {
            IDS.writeJsonResponse(IDS.json_error(ex));
        }
    }

    [WebMethod]
    public void addReport()
    {
        try
        {
            List<KeyValuePair<string, string>> json = new List<KeyValuePair<string, string>>();

            SqlCommand cmd = new SqlCommand("execute addOrder @sessionID,@hostID,@clientID,@loc,@severity,@type,@details,@latitude,@longitude");
            cmd.Parameters.AddWithValue("sessionID", Context.Request.Form["sessionID"]);
            cmd.Parameters.AddWithValue("hostID", Context.Request.Form["hostID"]);
            cmd.Parameters.AddWithValue("clientID", Context.Request.Form["clientID"]);
            cmd.Parameters.AddWithValue("loc", Context.Request.Form["loc"]);
            cmd.Parameters.AddWithValue("severity", Context.Request.Form["severity"]);
            cmd.Parameters.AddWithValue("type", Context.Request.Form["type"]);
            cmd.Parameters.AddWithValue("details", Context.Request.Form["details"]);
            cmd.Parameters.AddWithValue("latitude", Context.Request.Form["latitude"]);
            cmd.Parameters.AddWithValue("longitude", Context.Request.Form["longitude"]);

            json.Add(new KeyValuePair<string, string>("report", IDS.storedProcedureToJson(cmd)));
            IDS.writeJsonResponse(IDS.jsonResponse(json));
        }
        catch (Exception ex)
        {
            IDS.writeJsonResponse(IDS.json_error(ex));
        }
    }

    [WebMethod]
    public void sync()
    {
        var jss = new JavaScriptSerializer();

        string json = Context.Request.Form["sync"];
        dynamic data = jss.Deserialize<dynamic>(json);


        foreach (string type in data.Keys)
        {
            foreach (KeyValuePair<string, object> ID in data[type])
            {
                foreach (KeyValuePair<string, object> field in data[type][ID.Key])
                {
                    foreach (Dictionary<string, object> revCollection in data[type][ID.Key][field.Key])
                    {
                        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainConn"].ConnectionString);
                        conn.Open();
                        //SqlCommand cmd = new SqlCommand("Update " + type + " set " + field.Key + "='" + revCollection["newVal"] + "' where ID=" + ID.Key + " AND " + field.Key + "='" + revCollection["oldVal"] + "'", conn);
                        SqlCommand cmd = new SqlCommand("Update " + type + " set " + field.Key + "='" + revCollection["newVal"] + "' where ID=" + ID.Key, conn);
                        cmd.ExecuteNonQuery();
                        conn.Close();
                    }
                }
            }
        }
        IDS.writeJsonResponse("{\"success\":\"true\"}");
    }

    [WebMethod]
    public void getReportListing()
    {
        try
        {
            List<KeyValuePair<string, string>> json = new List<KeyValuePair<string, string>>();

            SqlCommand cmd = new SqlCommand("execute getReportListing @sessionID,@latitude,@longitude,@hostID,@client,@category,@type,@ID,@storenum");
            IDS.addParameterFromForm(ref cmd, "sessionID");
            IDS.addParameterFromForm(ref cmd, "latitude");
            IDS.addParameterFromForm(ref cmd, "longitude");
            IDS.addParameterFromForm(ref cmd, "hostID");
            IDS.addParameterFromForm(ref cmd, "client");
            IDS.addParameterFromForm(ref cmd, "category");
            IDS.addParameterFromForm(ref cmd, "type");
            IDS.addParameterFromForm(ref cmd, "ID");
            IDS.addParameterFromForm(ref cmd, "storenum");

            json.Add(new KeyValuePair<string, string>("report", IDS.storedProcedureToJson(cmd)));
            IDS.writeJsonResponse(IDS.jsonResponse(json));
        }
        catch (Exception ex)
        {
            IDS.writeJsonResponse(IDS.json_error(ex));
        }
    }

    [WebMethod]
    public void getToDoListing()
    {
        try
        {
            List<KeyValuePair<string, string>> json = new List<KeyValuePair<string, string>>();

            SqlCommand cmd = new SqlCommand("execute getToDoListing @sessionID");
            cmd.Parameters.AddWithValue("sessionID", Context.Request.Form["sessionID"]);

            json.Add(new KeyValuePair<string, string>("todo", IDS.storedProcedureToJson(cmd)));
            IDS.writeJsonResponse(IDS.jsonResponse(json));
        }
        catch (Exception ex)
        {
            IDS.writeJsonResponse(IDS.json_error(ex));
        }
    }

    [WebMethod]
    public void getToDoThreads()
    {
        try
        {
            List<KeyValuePair<string, string>> json = new List<KeyValuePair<string, string>>();

            SqlCommand cmd = new SqlCommand("execute getToDoThreads @sessionID,@todoID");
            cmd.Parameters.AddWithValue("sessionID", Context.Request.Form["sessionID"]);
            cmd.Parameters.AddWithValue("todoID", Context.Request.Form["todoID"]);

            json.Add(new KeyValuePair<string, string>("todoThread", IDS.storedProcedureToJson(cmd)));
            IDS.writeJsonResponse(IDS.jsonResponse(json));
        }
        catch (Exception ex)
        {
            IDS.writeJsonResponse(IDS.json_error(ex));
        }
    }

    [WebMethod]
    public void addToDo()
    {
        try
        {
            List<KeyValuePair<string, string>> json = new List<KeyValuePair<string, string>>();

            SqlCommand cmd = new SqlCommand("execute addToDo @sessionID,@detail,@latitude,@longitude");
            cmd.Parameters.AddWithValue("sessionID", Context.Request.Form["sessionID"]);
            cmd.Parameters.AddWithValue("detail", Context.Request.Form["detail"]);
            IDS.addParameterFromForm(ref cmd, "longitude");
            IDS.addParameterFromForm(ref cmd, "latitude");

            json.Add(new KeyValuePair<string, string>("todo", IDS.storedProcedureToJson(cmd)));
            IDS.writeJsonResponse(IDS.jsonResponse(json));
        }
        catch (Exception ex)
        {
            IDS.writeJsonResponse(IDS.json_error(ex));
        }
    }

    [WebMethod]
    public void addToDoThread()
    {
        try
        {
            List<KeyValuePair<string, string>> json = new List<KeyValuePair<string, string>>();

            SqlCommand cmd = new SqlCommand("execute addToDoThread @sessionID,@todoID,@detail");
            cmd.Parameters.AddWithValue("sessionID", Context.Request.Form["sessionID"]);
            cmd.Parameters.AddWithValue("todoID", Context.Request.Form["todoID"]);
            cmd.Parameters.AddWithValue("detail", Context.Request.Form["detail"]);

            json.Add(new KeyValuePair<string, string>("todoThread", IDS.storedProcedureToJson(cmd)));
            IDS.writeJsonResponse(IDS.jsonResponse(json));
        }
        catch (Exception ex)
        {
            IDS.writeJsonResponse(IDS.json_error(ex));
        }
    }

    [WebMethod]
    public void deleteToDoThread()
    {
        try
        {
            List<KeyValuePair<string, string>> json = new List<KeyValuePair<string, string>>();

            SqlCommand cmd = new SqlCommand("execute deleteToDoThread @sessionID,@threadID");
            cmd.Parameters.AddWithValue("sessionID", Context.Request.Form["sessionID"]);
            cmd.Parameters.AddWithValue("threadID", Context.Request.Form["threadID"]);

            json.Add(new KeyValuePair<string, string>("todoThread", IDS.storedProcedureToJson(cmd)));
            IDS.writeJsonResponse(IDS.jsonResponse(json));
        }
        catch (Exception ex)
        {
            IDS.writeJsonResponse(IDS.json_error(ex));
        }
    }

    [WebMethod]
    public void ping()
    {
        try
        {
            IDS.writeJsonResponse("{\"success\":\"true\"}");

        }
        catch (Exception ex)
        {
            IDS.writeJsonResponse(IDS.json_error(ex));
        }
    }
}
