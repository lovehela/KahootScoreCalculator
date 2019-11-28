// following code until different code shown is adapted from: https://www.html5rocks.com/en/tutorials/file/dndfiles/
// and from https://stackoverflow.com/questions/8238407/how-to-parse-excel-file-in-javascript-html5
// Check for the various File API support. This part is posted directly from the website. Most of the setup for using the apis are posted directly, I just changed a few things to make sense for our application
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser.');
}

  // I created this name rules variable because some people like to use different names for each round of trivia. This is the help counteract that to add up their scores. When puttin that 
  var nameRules = [];

  function readTriviaFiles() {

    const files = document.getElementById('files').files;
    var sameNames = document.getElementById('sameNames').value;
    sameNames = sameNames.split("; ");
    var nameRules = [];
    sameNames.forEach(function(names){
      nameRules.push(names.split(", "));
    });

    if (!files.length) {
      alert('Please select a file!');
      return;
    }
    // since we are dealing with async stuff, we have to use promises to ensure that we can add up the results of the files at the end to do the total scores
    var promises = []; 

    Object.keys(files).forEach(i => {
      promises.push(new Promise(function (resolve, reject){
      const file = files[i];
      const reader = new FileReader();
  
      // If we use onloadend, we need to check the readyState.
      reader.onloadend = function(e) {
        if (e.target.readyState == FileReader.DONE) { // DONE == 2
          var data = e.target.result;
          // to parse xlsx files in javascript, we use this api
          var workbook = XLSX.read(data, { 
            type: 'binary'
          });
          // to parse xlsx files in javascript, we use this api
          var sheetName = "Final Scores";
         
          // here we follow the api example and take our read excel file then grab the data that we want to use later to add up everyone's scores
          var worksheet = workbook.Sheets[sheetName];
          var XL_row_object = XLSX.utils.sheet_to_json(worksheet);
          var data = [];
          XL_row_object.forEach(function(row){
              data.push([row["Players"], row["Total Score (points)"]]);
          });
          var json_object = JSON.stringify(data);
          resolve(data); // finished processing our data for our promise, so send our read data back
        }
      };

      reader.onerror = function(ex) {
        console.log(ex);
      };

      reader.readAsBinaryString(file);
    }));
  });

  Promise.all(promises).then(function(values) {
    // wipe our current scoreboard to put new scores in
    document.getElementById("ranking_list").innerHTML = ""; 
    // go through each row of our data, and add up all equivilant names into a structure that makes it easy for us to add everything up
    var countingStructure = {};
    values.forEach(function(sheet){sheet.forEach(function(row){
      // here we want to convert our names that we find to be equivilant because someone is being a derp. So we check our list of same names
      let player = row[0];
      nameRules.forEach(function(rule){
        if(rule.includes(player)){
          // convert their name to their default name so we can add up their scores properly
          player = rule[0]; 
        }
      });

      countingStructure[player] = countingStructure.hasOwnProperty(player)? {name:player, score:(parseInt(row[1]) + countingStructure[player].score)} : {name:player, score:parseInt(row[1])};
             })});
    // sort this by largest first
      var ranking = Object.values(countingStructure);
      ranking.sort((a,b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0)); 
      // here we create the formatting for our data, and format the data in order
      ranking.forEach(function(row){
        var node = document.createElement("LI");
        var textnode = document.createTextNode(row["name"] + ", score: " + row.score);
        node.appendChild(textnode);
        document.getElementById("ranking_list").appendChild(node);
      });
    });
  }

  // this is mainly a copy-paste thing since default formats and generated formats my be very different in the future and most of this is api overhead, so there is no point in making a complicated structure only to change it later. This is much easier to understand
  function readPastedFiles() {

    const files = document.getElementById('files').files;
    var sameNames = document.getElementById('sameNames').value;
    sameNames = sameNames.split("; ");
    var nameRules = [];
    sameNames.forEach(function(names){
      nameRules.push(names.split(", "));
    });

    if (!files.length) {
      alert('Please select a file!');
      return;
    }
    // since we are dealing with async stuff, we have to use promises to ensure that we can add up the results of the files at the end to do the total scores
    var promises = []; 

    Object.keys(files).forEach(i => {
      promises.push(new Promise(function (resolve, reject){
      const file = files[i];
      const reader = new FileReader();
  
      // If we use onloadend, we need to check the readyState.
      reader.onloadend = function(e) {
        if (e.target.readyState == FileReader.DONE) { // DONE == 2
          var data = e.target.result;
          var workbook = XLSX.read(data, { // to parse xlsx files in javascript, we use this api
            type: 'binary'
          });
          // All new excel files have this as the default
          var sheetName = "Sheet1"; 
         
          // here we follow the api example and take our read excel file then sanatize the data that we want to use later for calculations
          var worksheet = workbook.Sheets[sheetName];
          var XL_row_object = XLSX.utils.sheet_to_json(worksheet);
          var data = [];
          XL_row_object.forEach(function(row){
              // we may have header data in the rows because this is copy-paste. So we ignore that
              if(!(row["Players"] == "Players")) {
                data.push([row["Players"], row["Total Score (points)"]]);
              }
          });
          var json_object = JSON.stringify(data);
          resolve(data); // finished processing our data for our promise, so send our read data back
        }
      };

      reader.onerror = function(ex) {
        console.log(ex);
      };

      reader.readAsBinaryString(file);
    }));
  });

  Promise.all(promises).then(function(values) {
    var countingStructure = {};
    document.getElementById("ranking_list").innerHTML = ""; 
    // wipe our current scoreboard to put new scores in
    // go through each row of our data, and add up all equivilant names
    values.forEach(function(sheet){sheet.forEach(function(row){
      // here we want to convert our names that we find to be equivilant because someone is being a derp. So we check our list of same names
      let player = row[0];
      nameRules.forEach(function(rule){
        if(rule.includes(player)){
          player = rule[0]; // convert their name to the default name so we know who is who
        }
      });

      countingStructure[player] = countingStructure.hasOwnProperty(player)? {name:player, score:(parseInt(row[1]) + countingStructure[player].score)} : {name:player, score:parseInt(row[1])};
             })});
      var ranking = Object.values(countingStructure);
      ranking.sort((a,b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0)); 
      // here we create the formatting for our data, and format the data in order
      ranking.forEach(function(row){
        var node = document.createElement("LI");
        var textnode = document.createTextNode(row["name"] + ", score: " + row.score);
        node.appendChild(textnode);
        document.getElementById("ranking_list").appendChild(node);
      });
    });
  }
  
  document.querySelector('#kahoot').addEventListener('click', function(evt) {
      readTriviaFiles();
  }, false);
 document.querySelector('#copypaste').addEventListener('click', function(evt) {
      readPastedFiles();
  }, false);