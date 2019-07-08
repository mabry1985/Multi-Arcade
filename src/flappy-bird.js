import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/styles.css';



$(document).ready(function () {
  var cvs = document.getElementById('flappyBird');
  var ctx = cvs.getContext('2d');
  var kirby = new Image();
  kirby.src = "./assets/flappy-bird-img/kirby.gif";
  // var audioName = new Audio();
  // audioName.src = "audio/audio.png";

ctx.drawImage(kirby,100,150,50,50);








});
