import $ from 'jquery';
import 'materialize-css/dist/js/materialize.min.js';
import './css/styles.css';
import 'materialize-css/dist/css/materialize.min.css';

$(document).ready(function () {

  function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
  }

  $('.row').on('mouseover', '.card', function () {
    $(this).addClass('z-depth-5 grow');
  });

  $('.row').on('mouseleave', '.card', function () {
    $(this).removeClass('z-depth-5 grow still');
  });

  $('#card1').mouseenter(function () {
    $('#gif1').show();
    $('.still').hide();
  });

  $('#card1').mouseleave(function () {
    $('#gif1').hide();
    $('.still').show();
  });

  $('.dropbtn').hover(() => {
    $('.dropdown-content').show();
  })
});
