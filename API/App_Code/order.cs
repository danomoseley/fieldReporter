using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Security.Cryptography;
using System.Data.SqlClient;
using System.Text;
using System.Collections;

/// <summary>
/// Summary description for order
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
 [System.Web.Script.Services.ScriptService]

public class orderView : System.Web.Services.WebService {

    [WebMethod]
    public string getOrder(int id)
    {
        Hashtable oList = new Hashtable();

        
        System.Web.Script.Serialization.JavaScriptSerializer oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
        return oSerializer.Serialize(new order(id));
    }

    [WebMethod]
    public string getOrders()
    {
        Hashtable oList = new Hashtable();

        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("select * from workOrder", conn);

        SqlDataReader dr = cmd.ExecuteReader();

        System.Web.Script.Serialization.JavaScriptSerializer oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
        return oSerializer.Serialize(dr);
    }

    public Hashtable getWOMaterial(int id)
    {
        Hashtable materials = new Hashtable();

        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("select id,MaterialCategoryID,MaterialUnitTypeID,Code,Quantity,UnitPrice,Taxable,TaxRate from WorkOrderMaterial where WorkOrderID = @id", conn);
        cmd.Parameters.AddWithValue("id", id);

        SqlDataReader dr = cmd.ExecuteReader();

        while (dr.Read())
        {
            materials[dr["ID"].ToString()] = new dataObject(new material(Convert.ToInt32(dr["id"])));
        }
        return materials;
    }


    public double convertToDouble(object val){
        if(val.Equals(DBNull.Value)){
            return 0.0;
        }else{
            return Convert.ToDouble(val);
        }
    }

    public Boolean convertToBoolean(object val)
    {
        if (val.Equals(DBNull.Value))
        {
            return false;
        }
        else
        {
            return Convert.ToBoolean(val);
        }
    }
}

public class dataObject
{
    public dataObject()
    {
        editable = false;
        enabled = false;
    }
    public dataObject(object obj)
    {
        val = obj;
        editable = false;
        enabled = false;
    }
    public dataObject(object obj,string type)
    {
        val = obj;
        editable = false;
        enabled = false;
        dataType = type;
    }
    public dataObject(object obj, Boolean link)
    {
        val = obj;
    }
    private object Val { get; set; }
    public object val {
        get
        {
            return Val;
        }
        set
        {
            Val = value;
            dataType = value.GetType().ToString().Replace("System.", "");
        }    
    }

    public Boolean editable { get; set; }
    public Boolean enabled { get; set; }
    public string dataType { get; set; }
    
}


public class order
{
    public Hashtable attr;

    public order() {
        attr = new Hashtable();
        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("select COLUMN_NAME,DATA_TYPE from information_schema.columns where table_name = 'workorder' order by ordinal_position", conn);

        SqlDataReader dr = cmd.ExecuteReader();

        while (dr.Read())
        {
            dataObject field = new dataObject(dr["column_name"]);
            field.dataType = dr["data_type"].ToString(); ;
            attr[dr["column_name"]] = field;
        }
    }

    public order(int id)
    {
        attr = new Hashtable();
        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("Select * FROM workOrder where id=@id", conn);
        cmd.Parameters.AddWithValue("id",id);

        SqlDataReader dr = cmd.ExecuteReader();

        while (dr.Read())
        {
            for(int i=0;i<dr.FieldCount;i++){
                dataObject field = new dataObject(dr[i]);
                field.dataType = dr.GetFieldType(i).ToString();
                attr[dr.GetName(i)] = field;
            }
        }
    }

    public Hashtable getWOMaterial(int id)
    {
        Hashtable materials = new Hashtable();

        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("select id,MaterialCategoryID,MaterialUnitTypeID,Code,Quantity,UnitPrice,Taxable,TaxRate from WorkOrderMaterial where WorkOrderID = @id", conn);
        cmd.Parameters.AddWithValue("id", id);

        SqlDataReader dr = cmd.ExecuteReader();

        while (dr.Read())
        {
            materials[dr["ID"].ToString()] = new dataObject(new material(Convert.ToInt32(dr["id"])));
        }
        return materials;
    }
    public double convertToDouble(object val)
    {
        if (val.Equals(DBNull.Value))
        {
            return 0.0;
        }
        else
        {
            return Convert.ToDouble(val);
        }
    }

    public Boolean convertToBoolean(object val)
    {
        if (val.Equals(DBNull.Value))
        {
            return false;
        }
        else
        {
            return Convert.ToBoolean(val);
        }
    }
}

public class payroll
{
    
}

public class note
{
    public int ID { get; set; }
    public string LinkTableName { get; set; }
    public int LinkTableID { get; set; }
    public NoteType NoteType { get; set; }
    public string noteText { get; set; }
    public bool WebDisplay { get; set; }
    public DateTime InputDate { get; set; }
    public employee InputEmployee { get; set; }
}

public class NoteType{
    public int ID { get; set; }
    public string Code { get; set; }
    public NoteCategory NoteCategory { get; set; }
}

public class NoteCategory{
    public int ID { get; set; }
    public string Code { get; set; }
    public string Description { get; set; }
}



public class material
{
    public dataObject ID { get; set; }
    public dataObject MaterialCategory { get; set; }
    public dataObject Code { get; set; }
    public dataObject Description { get; set; }
    public dataObject UnitPrice { get; set; }
    public dataObject PackPrice { get; set; }
    public dataObject UnitCost { get; set; }
    public dataObject PackCost { get; set; }
    public dataObject UnitQuantity { get; set; }
    public dataObject PackQuantity { get; set; }
    public dataObject Taxable { get; set; }
    public dataObject MinimumOrderQuantity { get; set; }
    public dataObject MaximumOrderQuantity { get; set; }
    public dataObject SequenceNumber { get; set; }
    public dataObject MaterialUnitType { get; set; }

    public material(int id)
    {
        SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
        conn.Open();

        SqlCommand cmd = new SqlCommand("select id,MaterialCategoryID,MaterialUnitTypeID,Code,Quantity,UnitPrice,Taxable,TaxRate from WorkOrderMaterial where ID = @id", conn);
        cmd.Parameters.AddWithValue("id", id);

        SqlDataReader dr = cmd.ExecuteReader();
        dr.Read();
        ID = new dataObject(id);
        Code = new dataObject(dr["Code"].ToString());
        UnitQuantity = new dataObject(convertToDouble(dr["quantity"]));
        Taxable = new dataObject(convertToBoolean(dr["Taxable"]));

        SqlCommand cmd2 = new SqlCommand("select * from materialCategory where id=@id", conn);
        cmd2.Parameters.AddWithValue("id", dr["MaterialCategoryID"].ToString());
        SqlDataReader dr2 = cmd2.ExecuteReader();
        dr2.Read();
        MaterialCategory = new dataObject(new MaterialCategory { Code = new dataObject(dr2["code"].ToString()), ID = new dataObject(Convert.ToInt32(dr2["id"])), Description = new dataObject(dr2["description"].ToString()), SequenceNumber = new dataObject(Convert.ToInt32(dr2["sequenceNumber"])) });
        dr2.Close();
        cmd2.Parameters.Clear();

        if (!dr["MaterialUnitTypeID"].Equals(DBNull.Value))
        {
            cmd2 = new SqlCommand("select * from materialUnitType where id=@id", conn);
            cmd2.Parameters.AddWithValue("id", dr["MaterialUnitTypeID"].ToString());
            dr2 = cmd2.ExecuteReader();
            dr2.Read();
            MaterialUnitType = new dataObject(new MaterialUnitType { Code = new dataObject(dr2["code"].ToString()), ID = new dataObject(Convert.ToInt32(dr["ID"])) });
            dr2.Close();
            cmd2.Parameters.Clear();
        }
    }
    public double convertToDouble(object val)
    {
        if (val.Equals(DBNull.Value))
        {
            return 0.0;
        }
        else
        {
            return Convert.ToDouble(val);
        }
    }

    public Boolean convertToBoolean(object val)
    {
        if (val.Equals(DBNull.Value))
        {
            return false;
        }
        else
        {
            return Convert.ToBoolean(val);
        }
    }
}

public class MaterialUnitType
{
    public dataObject ID { get; set; }
    public dataObject Code { get; set; }
}

public class MaterialCategory
{
    public dataObject ID { get; set; }
    public dataObject Code { get; set; }
    public dataObject Description { get; set; }
    public dataObject SequenceNumber { get; set; }
}

public class employee
{
    public dataObject ID { get; set; }
    public dataObject FirstName { get; set; }
    public dataObject LastName { get; set; }

    public employee(int id){
        try{
            SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
            conn.Open();
            SqlCommand cmd = new SqlCommand("select * FROM employee WHERE id = @id", conn);
            cmd.Parameters.AddWithValue("id", id);
            SqlDataReader dr = cmd.ExecuteReader();
            dr.Read();
            ID = new dataObject(id);
            FirstName = new dataObject(dr["Firstname"].ToString());
            LastName = new dataObject(dr["LastName"].ToString());
            dr.Close();
            conn.Close();
        }catch(Exception e){
            throw e;
        }
    }
}

public class building
{
    public dataObject ID { get; set; }
    public dataObject Name { get; set; }
    public dataObject Address1 { get; set; }
    public dataObject Address2 { get; set; }
    public dataObject Address3 { get; set; }
    public dataObject City { get; set; }
    public dataObject State { get; set; }
    public dataObject ZipCode { get; set; }
    public dataObject PhoneNumber { get; set; }
    public dataObject PhoneNumberExtension { get; set; }
    public dataObject FaxNumber { get; set; }
    public dataObject MobilePhoneNumber { get; set; }
    public dataObject EmailAddress { get; set; }
    public dataObject Contact { get; set; }
    public dataObject Active { get; set; }
    public dataObject Comment { get; set; }
    public dataObject InputDate { get; set; }
    public dataObject InputEmploee { get; set; }

    public building() { }

    public building(int id){
        try{
            SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
            conn.Open();
            SqlCommand cmd = new SqlCommand("select * FROM building WHERE id = @id", conn);
            cmd.Parameters.AddWithValue("id", id);
            SqlDataReader dr = cmd.ExecuteReader();
            dr.Read();
            ID = new dataObject(id);
            Name = new dataObject(dr["Name"].ToString());
            Address1 = new dataObject(dr["Address1"].ToString());
            Address2 = new dataObject(dr["Address2"].ToString());
            Address3 = new dataObject(dr["Address3"].ToString());
            City = new dataObject(dr["City"].ToString());
            State = new dataObject(dr["State"].ToString());
            ZipCode = new dataObject(dr["ZipCode"].ToString());
            PhoneNumber = new dataObject(dr["PhoneNumber"].ToString());
            PhoneNumberExtension = new dataObject(dr["PhoneNumberExtension"].ToString());
            FaxNumber = new dataObject(dr["FaxNumber"].ToString());
            MobilePhoneNumber = new dataObject(dr["MobilePhoneNumber"].ToString());
            EmailAddress = new dataObject(dr["EmailAddress"].ToString());
            Contact = new dataObject(dr["Contact"].ToString());
            Active = new dataObject(Convert.ToBoolean(dr["Active"]));
            Comment = new dataObject(dr["Comment"].ToString());
            InputDate = new dataObject(Convert.ToDateTime(dr["InputDate"]));
            InputEmploee = new dataObject(new employee(Convert.ToInt32(dr["InputEmployeeID"])));

        }catch(Exception e){
            throw e;
        }
    }
}

public class invoice
{
    public int ID { get; set; }
    public DateTime invoiceDate { get; set; }
    public float total { get; set; }
}

public class floor
{
    public floor(int id){
        try{
            SqlConnection conn = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["mainconn"].ConnectionString);
            conn.Open();
            SqlCommand cmd = new SqlCommand("select * FROM buildingFloor WHERE id = @id", conn);
            cmd.Parameters.AddWithValue("id", id);
            SqlDataReader dr = cmd.ExecuteReader();
            dr.Read();
            ID = new dataObject(id);
            Building = new dataObject(new building(Convert.ToInt32(dr["BuildingID"])));
            Code = new dataObject(dr["Code"].ToString());
            FloorNumber = new dataObject(Convert.ToInt32(dr["FloorNumber"]));
            FootageTotal = new dataObject(Convert.ToDouble(dr["FootageTotal"]));
            FootageRental = new dataObject(Convert.ToDouble(dr["FootageRental"]));
            InputDate = new dataObject(Convert.ToDateTime(dr["InputDate"]));
            InputEmployee = new dataObject(new employee(Convert.ToInt32(dr["InputEmployeeID"])));
            NonRentalSpaceDescription = new dataObject(dr["NonRentalSpaceDescription"].ToString());
        }catch(Exception e){
            return;
        }
    }

    public dataObject ID { get; set; }
    public dataObject Building { get; set; }
    public dataObject Code { get; set; }
    public dataObject FloorNumber { get; set; }
    public dataObject FootageTotal { get; set; }
    public dataObject FootageRental { get; set; }
    public dataObject InputDate { get; set; }
    public dataObject InputEmployee { get; set; }
    public dataObject NonRentalSpaceDescription { get; set; }
}
