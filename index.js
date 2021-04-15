let $form = document.getElementById("form");
let $result = document.getElementById("result");
let $hoursInput = document.getElementById("hours");
let $hourlyInput = document.getElementById("hourlyRate");
let $countyInput = document.getElementById("county");


form.addEventListener("submit", function(e) {
    e.preventDefault();
    fetch('https://skatteverket.entryscape.net/rowstore/dataset/c67b320b-ffee-4876-b073-dd9236cd2a99?kommun=' + county.value.toUpperCase() + '&år=2021' + '&_limit=1&_offset=0')
    .then(function(responce) {
    responce.json()
    .then(function(data) {
        const countyRate = parseFloat(data['results']['0']['kommunal-skatt']);
        const countryCouncil = parseFloat(data['results']['0']['landstings-skatt']);
        const funeralFee = parseFloat(data['results']['0']['begravnings-avgift']);
        const year = data['results']['0']['år'];
        const taxRate = countyRate + countryCouncil + funeralFee;
        const taxTable = Math.round(taxRate);
        const totalHours = parseFloat($hoursInput.value);
        const hourlyRate = parseFloat($hourlyInput.value);

        calculateTaxes(totalHours*hourlyRate, year , taxTable).then(function(data) {
            result.innerHTML = calculateSalary(data, totalHours*hourlyRate);
        });
    });
})
});

/* Beräknar skatt att betala (kommunal, landsting, jobbskatteavdrag)
@_salary = lönen, _year = nuvarande år, _taxTable = skattetabell som personen hamnar i
@return skatt att betala (kommunal, landsting, jobbskatteavdrag) */
function calculateTaxes(_salary, _year, _taxTable) {
    //API:ns endpoint använder 100krs ökningar på "lön till och med en summa" för att hämta rätt skatt som ska betalas.
    let roundedSalary = Math.ceil(_salary/100)*100;
        return fetch('https://skatteverket.entryscape.net/rowstore/dataset/88320397-5c32-4c16-ae79-d36d95b17b95?_limit=500&år=' + _year + '&tabellnr=' + _taxTable + '&inkomst t.o.m.=' + roundedSalary)
        .then(function(responce) {
            return responce.json()
            .then(function(data) { 
                //Ifall inte API anropet innehåller någon data
                if (data['results'].length <= 0) {
                    //Anropa samma API med en ökning på lönen med 100
                    return calculateTaxes(_salary+100, _year, _taxTable);
                } else {
                    //returnera den skatt som ska betalas
                    return data['results']['0']['kolumn 1'];
                }
            })
        })
}

function calculateSalary(_taxes, _salary) {
    return _salary - _taxes;
}

