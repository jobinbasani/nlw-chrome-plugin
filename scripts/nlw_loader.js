var holidayNames = {
    "Australia":["mlkDay"],
    "Canada" : ["mlkday"],
    "UK" : ["mlkDay"],
    "USA" : ["mlkDay"]
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
}

function onCountryChange(){
 localStorage.selectedCountry = $("countrySelect").options[$("countrySelect").selectedIndex].innerHTML;   
}

function LongWeekend(holidayList){
 this.holidayList = holidayList;   
 this.startDate = Date.today().addMonths(-6);
 this.endDate = Date.today().addMonths(6);
 this.holidays = [];
}

LongWeekend.prototype.getNextLongWeekend = function(){
 if(this.holidays.length == 0){
     this.loadLongWeekends();
 }
}

LongWeekend.prototype.loadLongWeekends = function(){
    var years = this.getYears();
    this.holidayList.forEach(function(holidayFn){
       years.forEach(function(year,index,array){
           var holiday = this[holidayFn](years[index]);
           if(holiday.between(this.startDate, this.endDate)){
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
    return Date.parse((year-1).toString()).january().third().monday();
};
