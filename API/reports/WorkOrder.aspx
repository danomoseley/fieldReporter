<%@ Page Language="C#" AutoEventWireup="true" CodeFile="WorkOrder.aspx.cs" Inherits="reports_workOrder" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title>Work Order Printout</title>
	    <link rel="stylesheet" type="text/css" href="css/main.css">
        <script type="text/javascript" src="js/jquery1.6.2.min.js"></script>
        <script src="js/jquery.barcode.0.3.js" type="text/javascript"></script>
        <script type="text/javascript">
            $(document).ready(function () {
                $('.barcode').barcode({ code: 'code39' });
            });
        </script>
    </head>
    <body>
        <asp:Literal runat="server" ID="bodyContainer"></asp:Literal>
    </body>
</html>
