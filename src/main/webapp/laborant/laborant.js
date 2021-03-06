$(document).ready(function loadLaborant() {
    document.getElementById("afvejningButton").disabled = true;
    $('#afvejningsDiv').hide();
    $('#afvejningsInfo').hide();
});
var recept;
var produktBatch;
var currentReceptKompIndex=0;
var currentReceptKomp;
var currentRaavareBatch;
var finishedRaaIDs =[];

function resetGlobalVariables() {
    recept=null;
    produktBatch=null;
    currentReceptKompIndex=0;
    currentReceptKomp=null;
    currentRaavareBatch=null;
    finishedRaaIDs =[];
}

function getProduktBatch() {
    resetGlobalVariables();
    var id = document.getElementById("pbId").value;
    var errorMessage;
    errorMessage = document.getElementById("errorMessage");
    errorMessage.innerHTML="";

    if (!id){
        alert("Angiv et produktbatch ID");
        return;
    } else if (id<0 || id >99999999){
        alert("Produktbatch ID'et skal være et positivt heltal mindre end 99999999.");
        return;
    }

    $.ajax({
        method: 'GET',
        url:'rest/produktbatch/'+id,
        success: function(data){
            produktBatch=data;
            getRecept(data.receptId);
        },
        error(jqXHR){
            console.log(jqXHR.responseJSON.technicalMSG);
            alert(jqXHR.responseJSON.userMSG);
        }
    })
}

function initializeFinishedRaaIDs() {
    for (let i = 0; i < produktBatch.produktBatchKomponenter.length; i++) {
        finishedRaaIDs.push(produktBatch.produktBatchKomponenter[i].raavareBatchDTO.raavare.raavareID);
    }
}

function generatePBinfoView() {
    $('#produktBatchInfo').empty();

    var table = document.getElementById("produktBatchInfo");
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    cell1.innerHTML = recept.receptId;
    cell2.innerHTML = recept.receptNavn;
    cell3.innerHTML = produktBatch.pbId;
    if (produktBatch.status===0){
        cell4.innerHTML = "Oprettet";
    } else if (produktBatch.status===1){
        cell4.innerHTML = "Under produktion";
    } else if (produktBatch.status === 2){
        cell4.innerHTML = "Afsluttet";
    } else{
        cell4.innerHTML = "Ukendt status";
    }

}

function createProduktionsBatchView(data) {
    console.log(recept);
    console.log(produktBatch);

    generatePBinfoView(); //Header with PbId, status and so on...
    generateRaavareView(); //Rows in the PB


    $('#afvejningsInfo').show();
    document.getElementById("afvejningButton").disabled = false;
}


function getRecept(receptID) {
    $.ajax({
        method: 'GET',
        url: 'rest/recept/'+receptID,
        success: function(data){
            recept = data;
            initializeFinishedRaaIDs();
            createProduktionsBatchView(data);
        }
    })
}

function generateRaavareView() {
    $('#receptRaavareListe').empty();
    var table = document.getElementById("receptRaavareListe");
    console.log(finishedRaaIDs);
    for (let i = 0; i < recept.receptKomponenter.length; i++) {
        komp = recept.receptKomponenter[i];
        var row = table.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);
        var cell7 = row.insertCell(6);
        var cell8 = row.insertCell(7);
        cell1.innerHTML = komp.raavare.raavareNavn;
        cell2.innerHTML = komp.raavare.raavareID;
        cell3.innerHTML = komp.nonNetto;
        cell4.innerHTML = komp.tolerance;
        cell5.innerHTML = "";
        cell6.innerHTML = "";
        cell7.innerHTML = "";
        cell8.innerHTML = "";

        for (let j = 0; j < finishedRaaIDs.length; j++) {
            if (finishedRaaIDs[j]===komp.raavare.raavareID){
                var pbKomp = getProduktBatchKompFromRaaID(finishedRaaIDs[j]);
                if (pbKomp == undefined){
                    alert("Meget uventet fejl i generateRaavareView()");
                }

                cell5.innerHTML = pbKomp.netto;
                cell6.innerHTML = pbKomp.tara;
                cell7.innerHTML = pbKomp.laborant.brugerID;
                cell8.innerHTML = pbKomp.raavareBatchDTO.rbId;
            }
        }

    }
}

function updatePbStatus(status) {
    produktBatch.status = status;
    console.log(produktBatch);
    data=produktBatch;
    
    console.log(data);
    $.ajax({
        method:'PUT',
        contentType: "application/json",
        url:'rest/produktbatch/',
        data: JSON.stringify(data),
        success: function () {
            console.log(data);
            console.log("Put lykkedes: status opdateret");
            if (status ===0) {
                document.getElementById("produktBatchInfo").rows[0].cells[3].innerHTML = "Oprettet";
            } else if (status === 1) {
                document.getElementById("produktBatchInfo").rows[0].cells[3].innerHTML = "Under produktion";
            } else if (status===2){
                alert("Produktbatchen er nu afsluttet.");
                switchPage('laborant/laborant.html');
                document.getElementById("produktBatchInfo").rows[0].cells[3].innerHTML = "Afsluttet";

            }
        },
        error(jqXHR){
            console.log(data);
            console.log("Put fejlede - status ikke opdateret: "+ jqXHR.responseJSON.technicalMSG);
            alert("Kunne ikke opdatere status af produktbatchen.");
        }
    })
}

function startAfvejning() {
    //Change status of PB
    if (produktBatch.status ===0){
        updatePbStatus(1);
    } else if (produktBatch.status === 2){
        alert("Den angivne produktbatch er allerede afsluttet.")
        return;
    }

    $('#afvejningsDiv').show();
    document.getElementById("afvejningButton").disabled = true;

    if (recept.receptKomponenter.length >0) {
        currentReceptKomp = recept.receptKomponenter[currentReceptKompIndex];
    } else{
        console.log("Fejl - ingen receptkomponenter.");
        alert("Fejl - ingen receptkomponenter.");
        return;
    }
    var raavare = currentReceptKomp.raavare;

    //Update råvare-text
    document.getElementById("currentRaavare").innerText = "Afvejning af: " + raavare.raavareNavn + ", " + raavare.raavareID;
}

function validateAfvejningInput() {
    //Check that the råvare is not already afvejet
    var raavrareID = currentReceptKomp.raavare.raavareID;

    for (let j = 0; j < finishedRaaIDs.length; j++) {
        if (finishedRaaIDs[j]===raavrareID){
            alert("Råvaren er allerede afvejet, og kan ikke afvejes igen.")
            return;
        }
    }

    //Validation: tara
    var tara = document.getElementById("tara").value;
    if (!tara){
        alert("Angiv tara.")
        return;
    } else if (tara >999.9999){
        alert("Tara er for stor. Den må maks være 999,9999")
        return;
    } else if (tara < 0.0001){
        alert("Tara er for lille. Den må mininmum være 0,0001")
        return;
    }

    //Validation: netto
    var netto = document.getElementById("netto").value;
    console.log("netto "+netto)
    if (!netto){
        alert("Angiv netto.")
        return;
    } else if (netto >999.9999){
        alert("netto er for stor. Den må maks være 999,9999")
        return;
    } else if (netto < 0.0001){
        alert("netto er for lille. Den må mininmum være 0,0001")
        return;
    } else {
        //Bruttokontrol
        var minNetto = currentReceptKomp.nonNetto * (1-(currentReceptKomp.tolerance)*0.01);
        var maxNetto = currentReceptKomp.nonNetto * (1+(currentReceptKomp.tolerance)*0.01);
        if (netto > maxNetto){
            alert("Tolerancekontrollen viser at den angivne nettovægt ikke ligger inde for tolerancen."
            + " Maximal nettovægt er " + maxNetto);
            return;
        } else if (netto < minNetto){
            alert("Tolerancekontrollen viser at den angivne nettovægt ikke ligger inde for tolerancen."
                + " Minimum nettovægt er " + minNetto);
            return;
        } else {
            alert("Tolerancekontrol-status: OK");
        }

    }

    //validation: raavarebatchID
    var rbId = document.getElementById("rbId").value;
    $.ajax({
        method: 'GET',
        url:'rest/raavarebatch/'+rbId+'/',
        success: function (data) {
            console.log("Get-kaldet var en succes");
            //Check that it contains the correct raavare and continue
            if (data.raavare.raavareID === currentReceptKomp.raavare.raavareID){
                currentRaavareBatch = data;
                //If the batch's mængde is too small
                if (currentRaavareBatch.maengde< netto){
                    alert("Den angivne nettovægt er større end den resterende mængde af den angivne råvarebatch.\n" +
                        "Der må være sket en fejl.");
                    return;
                }
                //Update the used råvarebatch - now the mængde is smaller
                console.log("currentRaavareBatch:" + currentRaavareBatch.rbId);
                console.log("Netto:" + netto);
                updateRvbMaengde(currentRaavareBatch,netto);

                //Succes - raavareBatchID matches raavare of receptKomp
                saveAfvejningToDatabase();
            } else{
                alert("Den angivne råvarebatch ID findes i databasen, men svarer ikke til den råvare, du er ved at afveje.\n Tjek Råvarebatch ID't.")
            }
        },
        error: function () {
            console.log("Get-kaldet var en fiasko");
            alert("Der kunne ikke findes en raavarebatch i systemet med det angivne ID.")
        }
    })
}
function saveAfvejningToDatabase() {

    //Rest POST
    var pbKomp = {
        "pbId": produktBatch.pbId,
        "raavareBatchDTO": currentRaavareBatch,
        "tara": document.getElementById("tara").value,
        "netto": document.getElementById("netto").value,
        "laborant": user
    }
    data =JSON.stringify(pbKomp);

    console.log(data);
    $.ajax({
        url: 'rest/produktbatchkomp',
        method: 'POST',
        contentType: "application/json",
        data: data,
        success: function (data) {
            saveToDBWasSuccesful();
            alert(JSON.stringify(data));

        },
        error: function (jqXHR) {
            console.log(jqXHR.responseJSON.technicalMSG);
            alert(jqXHR.responseJSON.userMSG);
        }
    })
}

function saveToDBWasSuccesful() {

    //Add to finishedRaaIds
    var finishedRaaID= currentReceptKomp.raavare.raavareID;
    finishedRaaIDs.push(finishedRaaID);

    var table = document.getElementById("receptRaavareListe");

    for (var i = 0, row; row = table.rows[i]; i++) {
        console.log("HEJHEJ" + i);
        //iterate through rows and set text to "Ja" if raavareID === finishedRaaID
        if (finishedRaaID == row.cells[1].innerHTML){
            row.cells[4].innerHTML =document.getElementById("netto").value;
            row.cells[5].innerHTML = document.getElementById("tara").value;
            row.cells[6].innerHTML = user.brugerID;
            row.cells[7].innerHTML = document.getElementById("rbId").value;

        }
    }




}


function nextAfvejning() {
    //Update currentReceptKomp
    if (recept.receptKomponenter.length > currentReceptKompIndex +1){
        currentReceptKomp = recept.receptKomponenter[++currentReceptKompIndex];
    } else{
        //Starts over with the first receptkomp
        currentReceptKompIndex=0;
        currentReceptKomp = recept.receptKomponenter[currentReceptKompIndex];
    }

    var raavare = currentReceptKomp.raavare;

    //Update råvare-text
    document.getElementById("currentRaavare").innerText = "Afvejning af: " + raavare.raavareNavn + ", " + raavare.raavareID;


    //empty input fields
    document.getElementById("tara").value = "";
    document.getElementById("rbId").value = "";
    document.getElementById("netto").value = "";

}

function finishAfvejning() {
    //Check that the produktbatch is done
    if (!(finishedRaaIDs.length ===recept.receptKomponenter.length)){
        alert("Der er stadig råvarer som mangler at blive afvejet i denne produktbatch.");
        return;
    }
    //check that the current status is 1 meaning påbegyndt
    if (produktBatch.status==1){
        updatePbStatus(2);
    } else if (produktBatch.status==2){
        alert("Produktbatchen er allerede afsluttet.");
    } else {
        alert("Fejl. Produktbatchens nuværende status er ikke \"Under produktion\" og det kan derfor ikke afsluttes");
        return;
    }
}

function getProduktBatchKompFromRaaID(raavareID) {
    //Search through the pbKomp's that were in the PB that was loaded in th begninning
    //return the pbKomp with the corresponding raavareID

    var list = produktBatch.produktBatchKomponenter;
    for (let i = 0; i < list.length; i++) {
        if (list[i].raavareBatchDTO.raavare.raavareID == raavareID){
            return list[i];
        }
    }
    return undefined;
}


function updateRvbMaengde(raavareBatch,maengde) {

    console.log("rbId:" + raavareBatch.rbId);
    //subtract used maengde
    var newRaavareBatch = {
        "rbId": raavareBatch.rbId,
        "raavare": raavareBatch.raavare,
        "maengde": raavareBatch.maengde-maengde
    }

    var data =JSON.stringify(newRaavareBatch);
    //REST PUT call
    console.log(data);
    $.ajax({
        url: 'rest/raavarebatch',
        method: 'PUT',
        contentType: "application/json",
        data: data,
        success: function (data) {
            //alert(JSON.stringify(data));
            //No need to alert that it has been updated here.
        },
        error: function (jqXHR) {
            console.log(jqXHR.responseJSON.technicalMSG);
            alert(jqXHR.responseJSON.userMSG);
        }
    })
}
