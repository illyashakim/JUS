<!DOCTYPE html>
<html>
    <head>
        <!-- /.website title -->
        <title>JUS: Pendaftaran</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <!-- CSS Files -->
        <link href="css/bootstrap.min.css" rel="stylesheet" media="screen">
        <link href="css/font-awesome.min.css" rel="stylesheet">
        <link rel="stylesheet" href="pe-icon-7-stroke/css/pe-icon-7-stroke.css">
        <link href="css/animate.css" rel="stylesheet" media="screen">
        <link href="css/css-index.css" rel="stylesheet" media="screen">

        <!-- Google Fonts -->
        <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Lato:100,300,400,700,900,100italic,300italic,400italic,700italic,900italic" />
    </head>

    <body>

     <?php
         // define variables and set to empty values
            // $tarikh_isi = $masa_isi =
            // $nama_penuh = $jantina = 
             //$alamat = $negeri = $daerah = $poskod =
             //$birthday = $lokasi_usrah = $telefon = $email = "";
             //date_default_timezone_set("Asia/Kuala_Lumpur");

            //if ($_SERVER["REQUEST_METHOD"] == "POST") {
              //  $nama_penuh = test_input($_POST["nama_penuh"]);
                //$jantina = test_input($_POST["jantina"]);
                //$alamat = test_input($_POST["alamat"]);
                //$negeri = test_input($_POST["negeri"]);
                //$daerah = test_input($_POST["daerah"]);
                //$poskod = test_input($_POST["poskod"]);
                //$birthday = test_input($_POST["birthday"]);
                //$lokasi_usrah = test_input($_POST["lokasi_usrah"]);
                //$telefon = test_input($_POST["telefon"]);
                //$email = test_input($_POST["email"]);
                //}

            //function test_input($data) {
                //$data = trim($data);
                //$data = stripslashes($data);
                //$data = htmlspecialchars($data);
                //return $data;
                //}

        ?>
            <!-- /.parallax full screen background image -->
        <div class="fullscreen landing parallax" style="background-image:url('images/bg.jpg');" data-img-width="2000" data-img-height="1325" data-diff="100">

            <div class="overlay">
                <div class="container">
                    <div class="row">
                        <div class="col-md-8 col-md-offset-2 text-center">

                            <!-- /.logo -->
                            <div class="logo wow fadeInDown"> <a href=""><img src="images/logo.png" alt="logo"></a></div>
                            <!-- /.main title -->
                            <h2 class="wow fadeInLeft">
                                Pendaftaran Usrah JUS!
                            </h2>

                            <!-- /.header paragraph -->
                            <div class="landing-text wow fadeInLeft">
                                <p>Assalamualaikum wbt, Salam Sejahtera. Semoga anda semua berada dalam. Mohon Saudara/Saudari/Tuan/Puan untuk mengisi detail diri. PIC JUS! akan segera untuk menghubungi anda, Jazakumulla hu khoiran kathiran.</p>
                            </div>				  
                        </div> 
                    </div>
                </div> 
            </div> 
        </div>
<!-- NAVIGATION -->

        <div id="menu">
            <nav class="navbar-wrapper navbar-default" role="navigation">
                <div class="container">
                    <div class="navbar-header">
                        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-backyard">
                            <span class="sr-only">Toggle navigation</span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                        </button>
                        <a class="navbar-brand site-name" href="./index.html"><img src="images/logo2.png" alt="logo"></a>
                    </div>

                    <div id="navbar-scroll" class="collapse navbar-collapse navbar-backyard navbar-right">
                        <ul class="nav navbar-nav">
                            <li><a href="./index.html#intro">Kenali Kami</a></li>
                            <li><a href="./index.html#manfaat">Manfaat</a></li>
                            <li><a href="./index.html#download">Daftar</a></li>
                            <!--<li><a href="#package">Pricing</a></li> -->
                            <li><a href="./index.html#testi">Testimoni</a></li>
                            <li><a href="./index.html#contact">Hubungi Kami</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
<div class="container">
	<div class="col-lg-12 well">
	<div class="row">
                <form method="post" class="form-header" action="./php/register_insert.php" method="post"">

					<div class="col-sm-12">
						<div class="row">
                            <?php              
                                $tarikh_isi = date("Y/m/d");
                                $masa_isi = date("h:i:sa"); 
                            ?>  
							<div class="col-sm-8 form-group">
								<label>Nama Penuh</label>
								<input class="form-control input-lg" name="nama_penuh" id="nama_penuh" type="text" placeholder="Nama Penuh" required>
							</div>
							<div class="col-sm-4 form-group">
								<label>Jantina</label>
                                <select name="jantina" class="form-control input-lg"required>
                                <option value=""><br>
                                <option value="Lelaki">Lelaki<br>
                                <option value="Perempuan">Perempuan<br><br>
                                </select>
							</div>
						</div>					
						<div class="form-group">
                            <label>Alamat</label>
							<textarea class="form-control input-lg" name="alamat" placeholder="Alamat Penuh Tempat Tinggal" rows="3" class="form-control"></textarea>
						</div>	
						<div class="row">
							<div class="col-sm-4 form-group">
                                <label>Negeri</label>								
								<input class="form-control input-lg" name="negeri" type="text" placeholder="Negeri" class="form-control">
							</div>	
							<div class="col-sm-4 form-group">
                                <label>Daerah</label>
								<input type="text" placeholder="Daerah" name="daerah" class="form-control">
							</div>	
							<div class="col-sm-4 form-group">
                                <label>Poskod</label>
								<input type="text" placeholder="Poskod" name="poskod" class="form-control">
							</div>		
						</div>
						<div class="row">
							<div class="col-sm-4 form-group">
								<label>Tarikh Lahir</label>
								<input type="date" placeholder="Tarikh Lahir" name="birthday" class="form-control">
							</div>		
							<div class="col-sm-8 form-group">
								<label>Lokasi Usrah Pilihan</label>
								<input type="text" name="lokasi_usrah" placeholder="Nyatakan Lokasi Usrah Pilihan Anda" class="form-control">
							</div>	
						</div>	
                    <div class="row">                       					
					    <div class="col-sm-4 form-group">
                            <label>Nombor Telefon</label>
						    <input type="text" name="telefon" placeholder="+(60)12 3456 7890" class="form-control">
					    </div>		
					    <div class="col-sm-8 form-group">
                            <label>Alamat Email</label>
						    <input type="text" name="email" placeholder="nama@domain-email.com" class="form-control">
					    </div>
                    </div>
                    <input class="btn btn-lg btn-info" type="submit" name="submit" value="Hantar">  		
					</div>
                    <p class="text-center wow fadeInUp">Segala detail peribadi anda dijamin selamat. Rujuk kepada <a href="privacy.html">Terma dan Syarat</a>.</p>
				</form> 

           <?php
                    /*echo "<h2>Your Input:</h2>";
                    //echo $tarikh_isi;
                    echo "<br>";
                    echo $masa_isi;
                    echo "<br>";
                    echo $nama_penuh;
                    echo "<br>";
                    echo $jantina;
                    echo "<br>";
                    echo $alamat;
                    echo "<br>";
                    echo $negeri;
                    echo "<br>";
                    echo $poskod;
                    echo "<br>";
                    echo $birthday; */
            ?>


               

				</div>


	</div>
	</div>
        <!-- /.footer -->
        <footer id="footer">
            <div class="container">
                <div class="col-sm-4 col-sm-offset-4">
                    <!-- /.social links -->
                    <div class="social text-center">
                        <ul class="wow fadeInUp">
                            <li><a href="https://twitter.com/"><i class="fa fa-twitter"></i></a></li>
                            <li><a href="https://www.facebook.com/"><i class="fa fa-facebook"></i></a></li>
                            <li><a href="https://plus.google.com/"><i class="fa fa-google-plus"></i></a></li>
                            <li><a href="https://instagram.com/"><i class="fa fa-instagram"></i></a></li>
                        </ul>
                    </div>	
                    <div class="text-center wow fadeInUp">Copyright 2017  <a href="http://bootstrapthemes.co/" target="_blank">As.H Technology</a></div>
                </div>	
            </div>	
        </footer>
        <script src="js/jquery.js"></script>
        <script src="js/bootstrap.min.js"></script>
        <script src="js/custom.js"></script>
</body>
</html>