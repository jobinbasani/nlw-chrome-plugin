var holidayNames = {
    "Australia":["newYear","australiaDay","canberraDay"],
    "Canada" : ["newYear","familyDayBc","familyDay","goodFriday","easterMondayCanada","victoriaDay","canadaDay",
                "civicHoliday","labourDayCanada","thanksgivingCanada","remembranceDay","christmas","boxingDayCanada"],
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

LongWeekend.prototype.easter = function(Y){
    var C = Math.floor(Y/100);
    var N = Y - 19*Math.floor(Y/19);
    var K = Math.floor((C - 17)/25);
    var I = C - Math.floor(C/4) - Math.floor((C - K)/3) + 19*N + 15;
    I = I - 30*Math.floor((I/30));
    I = I - Math.floor(I/28)*(1 - Math.floor(I/28)*Math.floor(29/(I + 1))*Math.floor((21 - N)/11));
    var J = Y + Math.floor(Y/4) + I + 2 - C + Math.floor(C/4);
    J = J - 7*Math.floor(J/7);
    var L = I - J;
    var M = 3 + Math.floor((L + 40)/44);
    var D = L + 28 - 31*Math.floor(M/4);
    return Date.parse(M+'/'+D+'/'+Y);
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

LongWeekend.prototype.goodFriday = function(year){
    return new Holiday(
        "Good Friday",
        "Good Friday is a religious holiday, observed primarily by Christians, commemorating the crucifixion of Jesus Christ and his death at Calvary.",
        "http://en.wikipedia.org/wiki/Good_Friday",
        this.easter(year).last().friday()
    );
};

LongWeekend.prototype.easterMondayCanada = function(year){
    return new Holiday(
        "Easter Monday",
        "Easter Monday is the day after Easter Sunday and is celebrated as a holiday in some largely Christian cultures, especially Catholic and Eastern Christian cultures. Observed in Quebec.",
        "http://en.wikipedia.org/wiki/Easter_Monday",
        this.easter(year).next().monday()
    );
};

LongWeekend.prototype.canadaDay = function(year){
    return new Holiday(
        "Canada Day",
        "National day of Canada, celebrating the anniversary of the July 1, 1867, enactment of the British North America Act, 1867.",
        "http://en.wikipedia.org/wiki/Canada_Day",
        Date.parse('July 1st '+year)
    );
};

LongWeekend.prototype.civicHoliday = function(year){
    return new Holiday(
        "Civic Holiday",
        "A public holiday celebrated in most of Canada on the first Monday in August",
        "http://en.wikipedia.org/wiki/Civic_Holiday",
        Date.parse('August 1st '+year).first().monday()
    );
};

LongWeekend.prototype.labourDayCanada = function(year){
    return new Holiday(
        "Labour Day",
        "Annual holiday to celebrate the achievements of workers",
        "https://en.wikipedia.org/wiki/Labour_Day",
        Date.parse('September 1st '+year).first().monday()
    );
};

LongWeekend.prototype.thanksgivingCanada = function(year){
    return new Holiday(
        "Thanksgiving",
        "Occurring on the second Monday in October, is an annual Canadian holiday which celebrates the harvest and other blessings of the past year.",
        "http://en.wikipedia.org/wiki/Thanksgiving_(Canada)",
        Date.parse('October 1st '+year).second().monday()
    );
};

LongWeekend.prototype.remembranceDay = function(year){
    return new Holiday(
        "Remembrance Day",
        "A memorial day observed in Commonwealth countries since the end of World War I to remember the members of their armed forces who have died in the line of duty.",
        "http://en.wikipedia.org/wiki/Remembrance_Day",
        Date.parse('November 11th '+year)
    );
};

LongWeekend.prototype.christmas = function(year){
    return new Holiday(
        "Christmas Day",
        "Annual commemoration of the birth of Jesus Christ",
        "http://en.wikipedia.org/wiki/Christmas",
        Date.parse('December 25th '+year)
    );
};

LongWeekend.prototype.boxingDayCanada = function(year){
    var boxingDay = Date.parse('December 26th '+year);
    if(boxingDay.is().sunday()){
     boxingDay = boxingDay.addDays(1);   
    }
    return new Holiday(
        "Boxing Day",
        "The first or second weekday after Christmas Day.Observed in Ontario",
        "http://en.wikipedia.org/wiki/Boxing_Day",
        boxingDay
    );
};

LongWeekend.prototype.australiaDay = function(year){
    return new Holiday(
        "Australia Day",
        "The official national day of Australia, celebrated annually on 26 January, which marks the anniversary of the 1788 arrival of the First Fleet of British Ships at Sydney Cove, New South Wales, and raising of the Flag of Great Britain at that site by Governor Arthur Phillip",
        "https://en.wikipedia.org/wiki/Australia_Day",
        Date.parse('January 26th '+year)
    );
};

LongWeekend.prototype.canberraDay = function(year){
    return new Holiday(
        "Canberra Day",
        "A public holiday held annually on the second Monday in March in the Australian Capital Territory (ACT) to celebrate the official naming of Canberra. Observed in Australian Capital Territory.",
        "https://en.wikipedia.org/wiki/Canberra_Day",
        Date.parse('March 1st '+year).second().monday()
    );
};