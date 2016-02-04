var holidayNames = {
        "Australia": ["newYear", "australiaDay", "canberraDay", "goodFriday", "easterSaturday", "easterMondayAus", "anzacDay", "queensBirthday",
                "labourDayAus", "christmas", "boxingDay"],
        "Canada": ["newYear", "familyDayBc", "familyDay", "goodFriday", "easterMondayCanada", "victoriaDay", "canadaDay",
                "civicHoliday", "labourDayCanada", "thanksgivingCanada", "remembranceDay", "christmas", "boxingDayCanada"],
        "UK": ["newYear", "goodFriday", "easterMondayUk", "mayDayHoliday", "springBankHoliday", "summerBankHolidayFirst", "summerBankHolidayLast",
           "halloween", "guyFawkesDay", "christmas", "boxingDay"],
        "USA": ["newYear", "mlkDay", "washingtonDay", "memorialDayUsa", "independenceDayUsa", "laborDayUsa", "columbusDay", "veteransDay",
            "thanksgivingUsa", "christmas"]
    },
    countryData = {};
var $ = function (id) {
    return document.getElementById(id);
};
document.addEventListener('DOMContentLoaded', function () {
    init();
});

function init() {
    var options = [],
        index = 0,
        selectedCountry = localStorage.selectedCountry || "USA",
        counter = 0,
        countrySelect = $("countrySelect");
    for (var country in holidayNames) {
        options.push("<option value='" + country + "'>" + country + "</option>");
        countryData[country] = new LongWeekend(holidayNames[country]);
        if (country == selectedCountry) {
            index = counter;
        }
        counter++;
    }
    countrySelect.innerHTML = options.join('');
    countrySelect.selectedIndex = index;
    countrySelect.onchange = onCountryChange;
    $("upcomingBtn").onclick = switchTabs;
    $("previousBtn").onclick = switchTabs;
    $("readMore").onclick = readMore;
    $("viewAll").onclick = function () {
        switchTabs(true);
        swapView("nlwWrapper", "tableWrapper");
        setListTitle();
    };
    $("listBackBtn").onclick = function () {
        swapView("tableWrapper", "nlwWrapper");
    };
    $("webBackBtn").onclick = function () {
        $("nlwWebpage").src = "";
        swapView("webContainer", this.previousView);
    }
    setReadMoreLinks();
    showLongWeekendForCountry(selectedCountry);
}

function swapView(currentView, newView) {
    $(currentView).style.display = 'none';
    $(newView).style.display = 'block';
}

function setReadMoreLinks() {
    [].forEach.call(document.getElementsByClassName('read-more'), function (el) {
        el.onclick = readMore;
    });
}

function setListTitle() {
    $("weekendListTitle").innerHTML = getSelectedCountry() + " Weekends";
}

function switchTabs(reset) {
    var activeTab = reset == true ? $("upcomingBtn") : this,
        inactiveTab = reset == true ? $("previousBtn") : $(this.id == "upcomingBtn" ? "previousBtn" : "upcomingBtn");
    activeTab.classList.remove("inactive-tab");
    activeTab.classList.add("active-tab");
    inactiveTab.classList.add("inactive-tab");
    inactiveTab.classList.remove("active-tab");
    loadListData();
}

function onCountryChange() {
    var selectedCountry = getSelectedCountry();
    localStorage.selectedCountry = selectedCountry;
    showLongWeekendForCountry(selectedCountry);
}

function getSelectedCountry() {
    return $("countrySelect").options[$("countrySelect").selectedIndex].innerHTML;
}

function loadListData() {
    var selectedCountry = getSelectedCountry(),
        listTable = $("holidayTable"),
        listData = $("upcomingBtn").classList.contains("active-tab") ? countryData[selectedCountry].getUpcomingHolidays.call(countryData[selectedCountry]) : countryData[selectedCountry].getPreviousHolidays.call(countryData[selectedCountry]);
    for (var i = 0; i < listTable.rows.length; i++) {
        if (listData[i] === undefined) {
            listTable.rows[i].style.display = 'none';
        } else {
            listTable.rows[i].style.display = 'block';
            $("monthHeader" + i).innerHTML = listData[i].date.toString('MMM');
            $("dateHeader" + i).innerHTML = listData[i].date.toString('dd');
            $("yearHeader" + i).innerHTML = listData[i].date.toString('yyyy');
            $("holidayName" + i).innerHTML = listData[i].holidayName;
            $("holidayDescr" + i).innerHTML = listData[i].description;
            $("holidayLink" + i).readMoreLink = listData[i].link;
        }
    }

}

function showLongWeekendForCountry(country) {
    var nlw = countryData[country].getNextLongWeekend.call(countryData[country]),
        holidayDate = nlw.date,
        daysToGo = getDaysToGo(holidayDate);
    $("holidayName").innerHTML = nlw.holidayName;
    $("nlwDescription").innerHTML = nlw.description;
    $("monthYear").innerHTML = holidayDate.toString("MMMM yyyy");
    $("dateBox").innerHTML = holidayDate.toString("dd");
    $("daysToGo").innerHTML = daysToGo + (daysToGo == 1 ? " day " : " days ") + "to go!";
    $("readMore").readMoreLink = nlw.link;
}

function LongWeekend(holidayList) {
    this.holidayList = holidayList;
    this.startDate = Date.today().addMonths(-6);
    this.endDate = Date.today().addMonths(6);
    this.holidays = [];
    this.upcomingHolidays = [];
    this.previousHolidays = [];
}

function Holiday(holidayName, description, link, date) {
    this.holidayName = holidayName;
    this.description = description;
    this.link = link;
    this.date = date;
}

function readMore() {
    $("nlwWebpage").src = this.readMoreLink;
    var previousView = $("nlwWrapper").style.display == "none" ? "tableWrapper" : "nlwWrapper"
    swapView(previousView, "webContainer");
    $("webBackBtn").previousView = previousView;
}

function getDaysToGo(holiday) {
    return Math.round((holiday.getTime() - Date.today().getTime()) / (86400000));
}

LongWeekend.prototype.getHolidays = function () {
    if (this.holidays.length == 0) {
        this.loadLongWeekends();
        this.holidays.sort(function (a, b) {
            return a.date.isBefore(b.date) ? -1 : 1;
        });
    }
    return this.holidays;
}
LongWeekend.prototype.getUpcomingHolidays = function () {
    if (this.upcomingHolidays.length == 0) {
        this.loadSplitHolidays();
    }
    return this.upcomingHolidays;
}

LongWeekend.prototype.getPreviousHolidays = function () {
    if (this.previousHolidays.length == 0) {
        this.loadSplitHolidays();
    }
    return this.previousHolidays;
}

LongWeekend.prototype.loadSplitHolidays = function () {
    var today = Date.today();
    for (var i = 0; i < this.getHolidays().length; i++) {
        if (this.getHolidays()[i].date.isAfter(today)) {
            this.upcomingHolidays.push(this.getHolidays()[i]);
        } else {
            this.previousHolidays.push(this.getHolidays()[i]);
        }
    }
    this.previousHolidays.sort(function (a, b) {
        return a.date.isBefore(b.date) ? 1 : -1;
    });
}

LongWeekend.prototype.getNextLongWeekend = function () {
    var today = Date.today(),
        nlw;
    for (var i = 0; i < this.getHolidays().length; i++) {
        if (this.getHolidays()[i].date.isAfter(today)) {
            nlw = this.getHolidays()[i];
            break;
        }
    }
    return nlw;
}

LongWeekend.prototype.loadLongWeekends = function () {
    var years = this.getYears();
    this.holidayList.forEach(function (holidayFn) {
        years.forEach(function (year, index, array) {
            var holiday = this[holidayFn](years[index]);
            if (holiday.date.between(this.startDate, this.endDate)) {
                this.holidays.push(holiday);
            }
        }, this);
    }, this);
}

LongWeekend.prototype.getYears = function () {
    var years = [],
        startYear = Number(this.startDate.toString("yyyy")),
        endYear = Number(this.endDate.toString("yyyy"));
    for (var i = startYear; i <= endYear; i++) {
        years.push(i);
    }
    return years;
}

LongWeekend.prototype.easter = function (Y) {
    var C = Math.floor(Y / 100);
    var N = Y - 19 * Math.floor(Y / 19);
    var K = Math.floor((C - 17) / 25);
    var I = C - Math.floor(C / 4) - Math.floor((C - K) / 3) + 19 * N + 15;
    I = I - 30 * Math.floor((I / 30));
    I = I - Math.floor(I / 28) * (1 - Math.floor(I / 28) * Math.floor(29 / (I + 1)) * Math.floor((21 - N) / 11));
    var J = Y + Math.floor(Y / 4) + I + 2 - C + Math.floor(C / 4);
    J = J - 7 * Math.floor(J / 7);
    var L = I - J;
    var M = 3 + Math.floor((L + 40) / 44);
    var D = L + 28 - 31 * Math.floor(M / 4);
    return Date.parse(M + '/' + D + '/' + Y);
}

LongWeekend.prototype.mlkDay = function (year) {
    return new Holiday(
        "Martin Luther King, Jr. Day",
        "An American federal holiday marking the birthday of Martin Luther King, Jr. It is observed on the third Monday of January each year, which is around the time of King's birthday, January 15.",
        "http://en.m.wikipedia.org/wiki/Martin_Luther_King,_Jr._Day",
        Date.parse('January 1st ' + year).third().monday()
    );
};

LongWeekend.prototype.victoriaDay = function (year) {
    var victoriaDay = Date.parse('May 1st ' + year).final().monday();
    if (Number(victoriaDay.toString('dd')) > 25) {
        victoriaDay = victoriaDay.addWeeks(-1);
    }
    return new Holiday(
        "Victoria Day",
        "A federal Canadian public holiday celebrated on the last Monday before May 25, in honour of Queen Victoria's birthday.",
        "http://en.m.wikipedia.org/wiki/Victoria_Day",
        victoriaDay
    );
};

LongWeekend.prototype.familyDay = function (year) {
    return new Holiday(
        "Family Day",
        "Observed on the third Monday of February in the provinces of AB, MB, ON, NS, PEI, and SK. In the provinces of MB, NS, and PEI, the holiday is instead termed Louis Riel Day, Nova Scotia Heritage Day, and Islander Day respectively.",
        "http://en.m.wikipedia.org/wiki/Family_Day_(Canada)",
        Date.parse('February 1st ' + year).third().monday()
    );
};

LongWeekend.prototype.familyDayBc = function (year) {
    return new Holiday(
        "Family Day(BC)",
        "A statutory holiday occurring on second Monday in February observed in BC",
        "http://en.m.wikipedia.org/wiki/Family_Day_(Canada)",
        Date.parse('February 1st ' + year).second().monday()
    );
};

LongWeekend.prototype.newYear = function (year) {
    return new Holiday(
        "New Year's Day",
        "The first day of the year on the modern Gregorian calendar as well as the Julian calendar used in the Roman Empire since 45 BC.",
        "https://en.m.wikipedia.org/wiki/New_Year%27s_Day",
        Date.parse('January 1st ' + year)
    );
};

LongWeekend.prototype.goodFriday = function (year) {
    return new Holiday(
        "Good Friday",
        "Good Friday is a religious holiday, observed primarily by Christians, commemorating the crucifixion of Jesus Christ and his death at Calvary.",
        "http://en.m.wikipedia.org/wiki/Good_Friday",
        this.easter(year).last().friday()
    );
};

LongWeekend.prototype.easterMondayCanada = function (year) {
    return new Holiday(
        "Easter Monday",
        "Easter Monday is the day after Easter Sunday and is celebrated as a holiday in some largely Christian cultures, especially Catholic and Eastern Christian cultures. Observed in Quebec.",
        "http://en.m.wikipedia.org/wiki/Easter_Monday",
        this.easter(year).next().monday()
    );
};

LongWeekend.prototype.canadaDay = function (year) {
    return new Holiday(
        "Canada Day",
        "National day of Canada, celebrating the anniversary of the July 1, 1867, enactment of the British North America Act, 1867.",
        "http://en.m.wikipedia.org/wiki/Canada_Day",
        Date.parse('July 1st ' + year)
    );
};

LongWeekend.prototype.civicHoliday = function (year) {
    return new Holiday(
        "Civic Holiday",
        "A public holiday celebrated in most of Canada on the first Monday in August",
        "http://en.m.wikipedia.org/wiki/Civic_Holiday",
        Date.parse('August 1st ' + year).first().monday()
    );
};

LongWeekend.prototype.labourDayCanada = function (year) {
    return new Holiday(
        "Labour Day",
        "Annual holiday to celebrate the achievements of workers",
        "https://en.m.wikipedia.org/wiki/Labour_Day",
        Date.parse('September 1st ' + year).first().monday()
    );
};

LongWeekend.prototype.thanksgivingCanada = function (year) {
    return new Holiday(
        "Thanksgiving",
        "Occurring on the second Monday in October, is an annual Canadian holiday which celebrates the harvest and other blessings of the past year.",
        "http://en.m.wikipedia.org/wiki/Thanksgiving_(Canada)",
        Date.parse('October 1st ' + year).second().monday()
    );
};

LongWeekend.prototype.remembranceDay = function (year) {
    return new Holiday(
        "Remembrance Day",
        "A memorial day observed in Commonwealth countries since the end of World War I to remember the members of their armed forces who have died in the line of duty.",
        "http://en.m.wikipedia.org/wiki/Remembrance_Day",
        Date.parse('November 11th ' + year)
    );
};

LongWeekend.prototype.christmas = function (year) {
    return new Holiday(
        "Christmas Day",
        "Annual commemoration of the birth of Jesus Christ",
        "http://en.m.wikipedia.org/wiki/Christmas",
        Date.parse('December 25th ' + year)
    );
};

LongWeekend.prototype.boxingDayCanada = function (year) {
    var boxingDay = Date.parse('December 26th ' + year);
    if (boxingDay.is().sunday()) {
        boxingDay = boxingDay.addDays(1);
    }
    return new Holiday(
        "Boxing Day",
        "The first or second weekday after Christmas Day.Observed in Ontario",
        "http://en.m.wikipedia.org/wiki/Boxing_Day",
        boxingDay
    );
};

LongWeekend.prototype.australiaDay = function (year) {
    return new Holiday(
        "Australia Day",
        "The official national day of Australia, celebrated annually on 26 January, which marks the anniversary of the 1788 arrival of the First Fleet of British Ships at Sydney Cove, New South Wales, and raising of the Flag of Great Britain at that site by Governor Arthur Phillip",
        "https://en.m.wikipedia.org/wiki/Australia_Day",
        Date.parse('January 26th ' + year)
    );
};

LongWeekend.prototype.canberraDay = function (year) {
    return new Holiday(
        "Canberra Day",
        "A public holiday held annually on the second Monday in March in the Australian Capital Territory (ACT) to celebrate the official naming of Canberra. Observed in Australian Capital Territory.",
        "https://en.m.wikipedia.org/wiki/Canberra_Day",
        Date.parse('March 1st ' + year).second().monday()
    );
};

LongWeekend.prototype.easterSaturday = function (year) {
    return new Holiday(
        "Easter Saturday",
        "Easter Saturday, or Bright Saturday, on the Christian calendar is the Saturday following the festival of Easter, the Saturday of Easter or Bright Week.",
        "https://en.m.wikipedia.org/wiki/Easter_Saturday",
        this.easter(year).addDays(-1)
    );
};

LongWeekend.prototype.easterMondayAus = function (year) {
    return new Holiday(
        "Easter Monday",
        "Easter Monday in the Roman Catholic liturgical calendar is the second day of the octave of Easter Week and analogously in the Eastern Orthodox Church is the second day of Bright Week.",
        "https://en.m.wikipedia.org/wiki/Easter_Monday",
        this.easter(year).addDays(1)
    );
};

LongWeekend.prototype.anzacDay = function (year) {
    return new Holiday(
        "ANZAC Day",
        "A national day of remembrance in Australia and New Zealand that broadly commemorates all Australians and New Zealanders who served and died in all wars, conflicts, and peacekeeping operations and the contribution and suffering of all those who have served.",
        "https://en.m.wikipedia.org/wiki/Anzac_Day",
        Date.parse('April 25th ' + year)
    );
};

LongWeekend.prototype.queensBirthday = function (year) {
    return new Holiday(
        "Queens Birthday",
        "The selected day on which the birthday of the monarch of the Commonwealth realms (currently Queen Elizabeth II) is officially celebrated",
        "https://en.m.wikipedia.org/wiki/Queen%27s_Official_Birthday",
        Date.parse('June 1st ' + year).second().monday()
    );
};

LongWeekend.prototype.labourDayAus = function (year) {
    return new Holiday(
        "Labour Day",
        "Annual holiday to celebrate the achievements of workers. Observed in Australian Capital Territory, New South Wales and South Australia.",
        "https://en.m.wikipedia.org/wiki/Labour_Day",
        Date.parse('October 1st ' + year).first().monday()
    );
};

LongWeekend.prototype.boxingDay = function (year) {
    var boxingDay = Date.parse('December 26th ' + year);
    if (boxingDay.is().sunday()) {
        boxingDay = boxingDay.addDays(1);
    }
    return new Holiday(
        "Boxing Day",
        "Boxing Day is a holiday traditionally celebrated the day following Christmas Day",
        "http://en.m.wikipedia.org/wiki/Boxing_Day",
        boxingDay
    );
};

LongWeekend.prototype.easterMondayUk = function (year) {
    return new Holiday(
        "Easter Monday",
        "Easter Monday in the Roman Catholic liturgical calendar is the second day of the octave of Easter Week and analogously in the Eastern Orthodox Church is the second day of Bright Week.Observed in England, Northern Ireland and Wales.",
        "https://en.m.wikipedia.org/wiki/Easter_Monday",
        this.easter(year).next().monday()
    );
};

LongWeekend.prototype.mayDayHoliday = function (year) {
    return new Holiday(
        "May Day Holiday",
        "A traditional spring holiday and coincides with International Workers' Day",
        "https://en.m.wikipedia.org/wiki/International_Workers%27_Day",
        Date.parse('May 1st ' + year).first().monday()
    );
};

LongWeekend.prototype.springBankHoliday = function (year) {
    return new Holiday(
        "Spring Bank Holiday",
        "Last Monday in May",
        "http://en.m.wikipedia.org/wiki/Bank_holiday",
        Date.parse('May 1st ' + year).final().monday()
    );
};

LongWeekend.prototype.summerBankHolidayFirst = function (year) {
    return new Holiday(
        "Summer Bank Holiday",
        "First Monday in August. Observed in Scotland.",
        "http://en.m.wikipedia.org/wiki/Bank_holiday",
        Date.parse('August 1st ' + year).first().monday()
    );
};

LongWeekend.prototype.summerBankHolidayLast = function (year) {
    return new Holiday(
        "Summer Bank Holiday",
        "Last Monday in August. Observed in England, Northern Ireland and Wales.",
        "http://en.m.wikipedia.org/wiki/Bank_holiday",
        Date.parse('August 1st ' + year).final().monday()
    );
};

LongWeekend.prototype.halloween = function (year) {
    return new Holiday(
        "Halloween",
        "A yearly celebration on 31 October, the eve of the Western Christian feast of All Hallows' Day",
        "http://en.m.wikipedia.org/wiki/Halloween",
        Date.parse('October 31st ' + year)
    );
};

LongWeekend.prototype.guyFawkesDay = function (year) {
    return new Holiday(
        "Guy Fawkes Day",
        "Guy Fawkes Day, also known as Guy Fawkes Night, Bonfire Night and Firework Night, is an annual commemoration observed on 5 November",
        "http://en.m.wikipedia.org/wiki/Guy_Fawkes_Night",
        Date.parse('November 5th ' + year)
    );
};

LongWeekend.prototype.washingtonDay = function (year) {
    return new Holiday(
        "Washington's Birthday",
        "A United States federal holiday celebrated on the third Monday of February in honor of George Washington, the first President of the United States.",
        "https://en.m.wikipedia.org/wiki/Washington%27s_Birthday",
        Date.parse('February 1st ' + year).third().monday()
    );
};

LongWeekend.prototype.memorialDayUsa = function (year) {
    return new Holiday(
        "Memorial Day",
        "A day of remembering the men and women who died while serving in the United States Armed Forces",
        "http://en.m.wikipedia.org/wiki/Memorial_Day",
        Date.parse('May 1st ' + year).final().monday()
    );
};

LongWeekend.prototype.independenceDayUsa = function (year) {
    var july4 = Date.parse('July 4th ' + year),
        text = '';
    if (july4.is().saturday()) {
        text = "July 4 being Saturday, holiday will be on July 3"
    } else if (july4.is().sunday()) {
        text = "July 4 being Sunday, holiday will be on July 5"
    }
    return new Holiday(
        "Independence Day",
        "Commemorating the adoption of the Declaration of Independence on July 4, 1776, declaring independence from the Kingdom of Great Britain." + text,
        "http://en.m.wikipedia.org/wiki/Independence_Day_(United_States)",
        july4
    );
};

LongWeekend.prototype.laborDayUsa = function (year) {
    return new Holiday(
        "Labor Day",
        "A celebration of the American labor movement and is dedicated to the social and economic achievements of workers",
        "https://en.m.wikipedia.org/wiki/Labor_Day",
        Date.parse('September 1st ' + year).first().monday()
    );
};

LongWeekend.prototype.columbusDay = function (year) {
    return new Holiday(
        "Columbus Day",
        "The anniversary of Christopher Columbus' arrival in the Americas, which happened on October 12, 1492",
        "http://en.m.wikipedia.org/wiki/Columbus_Day",
        Date.parse('October 1st ' + year).second().monday()
    );
};

LongWeekend.prototype.veteransDay = function (year) {
    return new Holiday(
        "Veterans Day",
        "Honors people who have served in the U.S. Armed Forces, also known as veterans",
        "http://en.m.wikipedia.org/wiki/Veterans_Day",
        Date.parse('November 11th ' + year)
    );
};

LongWeekend.prototype.thanksgivingUsa = function (year) {
    return new Holiday(
        "Thanksgiving Day",
        "A day of giving thanks for the blessing of the harvest and of the preceding year",
        "http://en.m.wikipedia.org/wiki/Thanksgiving",
        Date.parse('November 1st ' + year).fourth().thursday()
    );
};