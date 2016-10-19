var API_KEY = '70f60647-9e12-4f3a-887a-78887f4b4fdd';
var select_value = '';

App.controller('home', function(page) {

  var all_countries = [
    {code:'AR', name:'Argentina'},
    {code:'AO', name:'Angola'},
    {code:'AU', name:'Australia'},
    {code:'AW', name:'Aruba'},
    {code:'BE', name:'Belgium'},
    {code:'BG', name:'Bulgaria'},
    {code:'BR', name:'Brazil'},
    {code:'CA', name:'Canada'},
    {code:'CH', name:'Switzerland'},
    {code:'CN', name:'China'},
    {code:'CO', name:'Colombia'},
    {code:'CZ', name:'Czech Republic'},
    {code:'DE', name:'Germany'},
    {code:'DK', name:'Denmark'},
    {code:'ES', name:'Spain'},
    {code:'FR', name:'France'},
    {code:'GB', name:'United Kingdom'},
    {code:'GT', name:'Guatemala'},
    {code:'HR', name:'Croatia'},
    {code:'HU', name:'Hungary'},
    {code:'ID', name:'Indonesia'},
    {code:'IE', name:'Ireland'},
    {code:'IN', name:'India'},
    {code:'IT', name:'Italy'},
    {code:'LS', name:'Lesotho'},
    {code:'LU', name:'Luxembourg'},
    {code:'MG', name:'Madagascar'},
    {code:'MQ', name:'Martinique'},
    {code:'MX', name:'Mexico'},
    {code:'NL', name:'Netherlands'},
    {code:'NO', name:'Norway'},
    {code:'PL', name:'Poland'},
    {code:'PR', name:'Puerto Rico'},
    {code:'RU', name:'Russia'},
    {code:'SI', name:'Slovenia'},
    {code:'SK', name:'Slovakia'},
    {code:'UA', name:'Ukraine'},
    {code:'US', name:'United States'}
  ];

  var $template = $(page).find('.country').remove();
  var $countries = $(page).find('.countries');

  all_countries.forEach(function(country) {
    var $country = $template.clone(true);
    $country.attr('value', country.code);
    $country.text(country.name);
    $countries.append($country);
  });

  $countries.on('change', function() {
    select_value = $(this).val();
    if(select_value === '' || typeof select_value === 'undefined') {
      App.dialog({
        title        : 'Oops!',
        text         : 'Please choose a country',
        okButton     : 'OK'
      });
    }
  });
  $(page).find('.search-button').on('click', function() {
    var input_value = $('.app-input.year').val();
    var current_year = new Date().getFullYear();
    if(select_value === '' && input_value === '') {
      App.dialog({
        title        : 'Oops!',
        text         : 'Please choose a country and enter the year',
        okButton     : 'OK'
      });
    } else if (select_value === "") {
      App.dialog({
        title        : 'Oops!',
        text         : 'Please choose a country',
        okButton     : 'OK'
      });
    } else if (input_value === '') {
      App.dialog({
        title        : 'Oops!',
        text         : 'Please enter the year',
        okButton     : 'OK'
      });
    } else if(input_value.length !== 4 && (JSON.parse(input_value) > current_year || JSON.parse(input_value) === current_year)) {
      App.dialog({
        title        : 'Oops!',
        text         : 'Please enter 4 digit year and year must be prior to the current year',
        okButton     : 'OK'
      });
    } else {
      var data = {};
      data.code = select_value;
      data.year = input_value
      App.load('displayHolidays', data);
    }
  })
});

App.controller('displayHolidays', function(page, data) {
  $(page).find('.app-section').hide();
  $(page).find('.loader').show();
  var country_code = data.code;
  var year = data.year;
  $(page).find('.app-title').text('Holidays for the year '+year);
  var url = 'https://holidayapi.com/v1/holidays';
  $.ajax({
    url: url,
    method: 'GET',
    data: {
      key: API_KEY,
      year: year,
      country: country_code
    },
    success: function(data) {
      var holidays = JSON.parse(data).holidays;
      $(page).find('.app-section').show();
      $template = $(page).find('.holiday-details').remove();
      $holidays_list = $(page).find('.holidays-list');
      for (var key in holidays) {
        var $details = $template.clone(true);
        if(holidays.hasOwnProperty(key)) {
          var date = new Date(holidays[key][0].date),
              month = '' + (date.getMonth() + 1),
              day = '' + date.getDate(),
              year = date.getFullYear();

          if (month.length < 2) month = '0' + month;
          if (day.length < 2) day = '0' + day;
          var formatted_date = [day, month, year].join('/');

          $details.find('.date').append('<span>'+formatted_date+'</span>');
          $details.find('.name').append('<span>'+holidays[key][0].name+'</span>');
          if(holidays[key][0].public) {
            $details.find('.public .fa').addClass('fa-check public-holiday');
          } else {
            $details.find('.public .fa').addClass('fa-close non-public-holiday');
          }
          $holidays_list.append($details);
        }
      }
      $(page).find('.loader').hide();
    },
    error: function(error) {
      $(page).find('.loader').hide();
      App.dialog({
        title        : 'Error',
        text         : 'Action ended in error!',
        okButton     : 'OK'
      });
    }
  });
});

try {
  // try to restore previous session
  App.restore();
} catch (err) {
  // else start from scratch
  App.load('home');
}