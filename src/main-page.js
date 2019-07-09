import $ from 'jquery';
import './css/styles.css';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min.js';

$(document).ready(function () {
  $('#user-form').submit(function (event) {
    event.preventDefault();
    var input = $('#userInput').val();
    $('#userComment').append(`${input} <br> <hr>`);
  });
});
