<html>
<head>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js" type="text/javascript"></script>
<?php
$servername = "mysql17.000webhost.com";
$username = "a7148204_user";
$password = "Qwe321rty";
$conn = mysqli_connect($servername, $username, $password);
if (!$conn) {
    echo("Connection failed: " . mysqli_connect_error());
}
mysqli_select_db($conn, "a7148204_home");
$query = mysqli_query($conn, "SELECT * FROM Finances ORDER BY Date DESC LIMIT 20");
?>
<style type="text/css">
	tr.header {
		font-weight:bold;
	}
	
	tr.alt {
		background-color: #AAAAAA;
	}
	
	td {
		border: 1px solid black;
		padding: 2px;
	}
	
	.striped {
		border: 2px solid black;
	}
</style> 
<script type="text/javascript">
$(document).ready(function(){
	$('.striped tr:even').addClass('alt');
});
</script>
<title> Reports </title>
</head>

<body>
<h1> Financial Reports </h1>

<table class="striped">
	<tr class="header">
		<td>Date</td>
		<td>Type</td>
		<td>Amount</td>
		<td>Payer</td>
		<td>Comments</td>
	</tr>
	<?php
		while($row = mysqli_fetch_array($query)) {
			echo "<tr>";
			echo "<td>".$row['Date']."</td>";
			echo "<td>".$row[Type]."</td>";
			echo "<td>".$row[Amount]."</td>";
			echo "<td>".$row[Payer]."</td>";
			echo "<td>".$row[Comments]."</td>";
			echo "</tr>";
		}
		
		$row = mysqli_fetch_assoc(mysqli_query($conn, "SELECT SUM(`Amount`) as 'sum' FROM `Finances` WHERE MONTH(`Date`) = MONTH(CURDATE())"));
		
		echo "</table><br />Current month spending: ".$row['sum']. "$ <br /> <br />";
		$query = mysqli_query($conn, "SELECT DISTINCT Payer FROM Finances");
		while($row = mysqli_fetch_array($query)) {
			$query2 = mysqli_fetch_assoc(mysqli_query($conn, "SELECT SUM(Amount) as `sum` FROM `Finances` WHERE Payer='".$row[Payer]."'"));
			$query3 = mysqli_fetch_assoc(mysqli_query($conn, "SELECT SUM(Amount) as `sum` FROM `Finances` WHERE Payer='".$row[Payer]."' AND DATE_SUB(CURDATE(),INTERVAL 30 DAY)<=`Date`"));
			echo "Monthly paid by ".$row[Payer].": ".$query3['sum']."$ <br />";
			echo "Total paid by ".$row[Payer].": ".$query2['sum']."$ <br />";
		}
		echo "<br />";
		$query = mysqli_query($conn, "SELECT DISTINCT Type FROM Finances");
		while($row = mysqli_fetch_array($query)) {
			$query2 = mysqli_fetch_assoc(mysqli_query($conn, "SELECT SUM(Amount) as `sum` FROM `Finances` WHERE Type='".$row[Type]."'"));
			echo "Total paid for ".$row[Type].": ".$query2['sum']."$ <br />";
		}
		$row = mysqli_fetch_assoc(mysqli_query($conn, "SELECT SUM(Amount) as `sum` FROM `Finances`"));
		echo "Total paid overall: ".$row['sum']."$ <br />";
	?>
</body>
</html>