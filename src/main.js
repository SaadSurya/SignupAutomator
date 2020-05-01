const electron = require('electron')

$(function(){
    $('#csv-file-path').on('click', function(){
        $('#csv-file').click();
    });
    $('#csv-file').on('change', function(e){
        $('#csv-file-path').val(e.target.files[0].name)
    });
    $('#process-form').submit(function(event ){start(); event.preventDefault()});
})

function start (){
    let submitAll = async function(entries){
        try{
            let win = new electron.remote.BrowserWindow({
                                width: 800,
                                height: 600,
                                webPreferences: {
                                     nodeIntegration: true
                                },
                                parent: electron.remote.getCurrentWindow()
                            });
            // win.on('did-finish-load', function(e){
            //      console.log(fullname + " from inside ready to show.");
            // });
            let formUrl = $('#form-url').val();
            let script = 'document.getElementsByName("fullName")[0].value = "@FullName"; ' + 
                            'document.getElementsByName("email")[0].value = "@Email"; ' + 
                            'document.getElementsByTagName("button")[0].click();'
            for(let i = 0; i < entries.length; i++){
                let entry = entries[i];
                let fullname = entry[0] + " " + entry[1];
                let email = entry[2];
                win.webContents.stop();
                win.loadURL(formUrl);
                win.webContents.executeJavaScript(script.replace('@FullName', fullname).replace('@Email', email));
                await new Promise(r => setTimeout(r, 10000));
            }
            win.close();
            win.destroy();
            alert("Successfully Submitted!");
        } catch(ex){
            alert("Process failed: " + ex.message);
        }
    }
    getEntriesFromFile().then(submitAll, function(error){
        alert('Invalid data in CSV file or the file is corrupt: ' + error.message);
    });

    //win.webContents.executeJavaScript('document.getElementsByName("fullName")[0].value = "test test"; document.getElementsByName("email")[0].value = "test@testing.com"; document.getElementsByTagName("button")[0].click();');
}

async function getEntriesFromFile(){
    if($('#csv-file')[0].files.length > 0){
        let file = $('#csv-file')[0].files[0];
        if(file.name.endsWith('.csv')) {
            let data = await (new Response(file)).text();
            return $.csv.toArrays(data);
        } else {
            alert('Please select a CSV file.')
        }
    } else {
        alert('Please select a CSV file first.');
    }
}