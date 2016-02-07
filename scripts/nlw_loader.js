document.addEventListener('DOMContentLoaded', function () {
    init();
});

function init() {
    var options = [],
        index = 0,
        selectedCountry = getSelectedCountryFromDb(),
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
    $("openTab").onclick = openChromeTab;
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
    };
    $("applink").onclick = function () {
        $("openTab").readMoreLink = "https://play.google.com/store/apps/details?id=com.jobinbasani.nlw";
        openChromeTab();
    }
    setReadMoreLinks();
    showLongWeekendForCountry(selectedCountry);
}