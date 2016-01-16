var holidayNames = {
    "Australia":["newYear","mlkDay"],
    "Canada" : ["newYear","familyDayBc","familyDay","victoriaDay"],
    "UK" : ["newYear","mlkDay"],
    "USA" : ["newYear","mlkDay"]
    },
    countryData = {};
var $ = function(id) {
  return document.getElementById(id);  
};
document.addEventListener('DOMContentLoaded', function() {
    init();
});

function init(){
    var options = [], 
        index = 0, 
        selectedCountry = localStorage.selectedCountry || "USA", 
        counter =0,
        countrySelect = $("countrySelect");
    for(var country in holidayNames){
        options.push("<option value='"+country+"'>"+country+"</option>");
        countryData[country] = new LongWeekend(holidayNames[country]);
        if( country == selectedCountry){
         index = counter;   
        }
        counter++;
    }
    countrySelect.innerHTML = options.join('');
    countrySelect.selectedIndex = index;
    countrySelect.onchange=onCountryChange;
    showLongWeekendForCountry(selectedCountry);
}

function onCountryChange(){
    var selectedCountry = $("countrySelect").options[$("countrySelect").selectedIndex].innerHTML;
    localStorage.selectedCountry = selectedCountry;
    showLongWeekendForCountry(selectedCountry);
}

function showLongWeekendForCountry(country){
    countryData[country].getNextLongWeekend.call(countryData[country]);
}

function LongWeekend(holidayList){
 this.holidayList = holidayList;   
 this.startDate = Date.today().addMonths(-6);
 this.endDate = Date.today().addMonths(6);
 this.holidays = [];
}

function Holiday(holidayName, description, link, date){
 this.holidayName = holidayName;
 this.description = description;
 this.link = link;
 this.date = date;
}

LongWeekend.prototype.getNextLongWeekend = function(){
 if(this.holidays.length == 0){
     console.log('loading data...');
     this.loadLongWeekends();
 }
    console.log(this.holidays);
}

LongWeekend.prototype.loadLongWeekends = function(){
    var years = this.getYears();
    this.holidayList.forEach(function(holidayFn){
       years.forEach(function(year,index,array){
           var holiday = this[holidayFn](years[index]);
           if(holiday.date.between(this.startDate, this.endDate)){
               this.holidays.push(holiday);
           }
       },this);
    },this);
}

LongWeekend.prototype.getYears = function(){
 var years = [],
     startYear = Number(this.startDate.toString("yyyy")),
     endYear = Number(this.endDate.toString("yyyy"));
 for(var i=startYear;i<=endYear;i++){
  years.push(i);   
 }
 return years;
}

LongWeekend.prototype.mlkDay = function(year){
    return new Holiday(
        "Martin Luther King, Jr. Day",
        "An American federal holiday marking the birthday of Martin Luther King, Jr. It is observed on the third Monday of January each year, which is around the time of King's birthday, January 15.",
        "http://en.wikipedia.org/wiki/Martin_Luther_King,_Jr._Day",
        Date.parse('January 1st '+year).third().monday()
    );
};

LongWeekend.prototype.victoriaDay = function(year){    
    var victoriaDay = Date.parse('May 1st '+year).final().monday();
    if(Number(victoriaDay.toString('dd'))>25){
     victoriaDay = victoriaDay.addWeeks(-1);   
    }  
    return new Holiday(
        "Victoria Day",
        "A federal Canadian public holiday celebrated on the last Monday before May 25, in honour of Queen Victoria's birthday.",
        "http://en.wikipedia.org/wiki/Victoria_Day",
        victoriaDay
    );
};

LongWeekend.prototype.familyDay = function(year){
    return new Holiday(
        "Family Day",
        "Observed on the third Monday of February in the provinces of AB, MB, ON, NS, PEI, and SK. In the provinces of MB, NS, and PEI, the holiday is instead termed Louis Riel Day, Nova Scotia Heritage Day, and Islander Day respectively.",
        "http://en.wikipedia.org/wiki/Family_Day_(Canada)",
        Date.parse('February 1st '+year).third().monday()
    );
};

LongWeekend.prototype.familyDayBc = function(year){
    return new Holiday(
        "Family Day(BC)",
        "A statutory holiday occurring on second Monday in February observed in BC",
        "http://en.wikipedia.org/wiki/Family_Day_(Canada)",
        Date.parse('February 1st '+year).second().monday()
    );
};

LongWeekend.prototype.newYear = function(year){
    return new Holiday(
        "New Year's Day",
        "The first day of the year on the modern Gregorian calendar as well as the Julian calendar used in the Roman Empire since 45 BC.",
        "https://en.wikipedia.org/wiki/New_Year%27s_Day",
        Date.parse('January 1st '+year)
    );
};