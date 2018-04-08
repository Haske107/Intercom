var express = require('express');
var fs = require('fs');
const Json2csvParser = require('json2csv').Parser;
var Intercom = require('intercom-client');
var csvWriter = require('csv-write-stream');
var client = new Intercom.Client({ token: 'dG9rOmM4N2E5ZDc1X2I3MGJfNDcwMV85MDdhX2JmYjNkODc3ZDI2MjoxOjA=' });
var router = express.Router();

router.get('/', function(req, res, next) {
    // GET CSV READY
    var events = fs.readFileSync('../IntercomExtractor/Data/Event_Names.txt').toString().split(/\r?\n/);
    var writer = csvWriter();
    writer.pipe(fs.createWriteStream('../IntercomExtractor/Data/Main.csv'));

    // RETRIEVE AND MODEL DATA
    var UserEvents = fs.readFileSync('../IntercomExtractor/Data/All_Users_Events.txt').toString().split('\n');
    var Holder = [];
    for (var i = 0; i < UserEvents.length; i++) {
        Holder.push(UserEvents[i].split(';'));
    }
    for(i = 0; i < Holder.length; i++)  {
        for(var j = 1; j < Holder[i].length; j++)   {
            Holder[i][j] = Holder[i][j].split(',');
        }
    }
    var DataFrame = [];

    //ADD 0'S
    // LOOP THROUGH USERS
    for(var k = 0; k < Holder.length; k++)  {

        DataFrame.push([Holder[k][0]]);

        //LOOP THROUGH EVENTS LIST
        for(i = 0; i < events.length; i++)  {

            //LOOP THROUGH EVENTS
            var match = false;
            for(j = 1; j < Holder[k].length; j++)   {
                if(Holder[k][j][0] === events[i])    {
                    match = true;
                    DataFrame[k+1] += ("," + Holder[k][j][1]);
                }
            }
            if(!match)  {
                DataFrame[k+1] += (",0");
            }
        }

        DataFrame[k+1] = DataFrame[k+1].split(',')
    }


    DataFrame.forEach(function(row) {
       writer.write(row);
    });
    res.send(DataFrame);

});




router.get('/UE', function(req, res,next)    {
    // GET THE DATA AND CSV READY
var ids = fs.readFileSync('../IntercomExtractor/Data/User_Ids.txt').toString();
var ID_Array = ids.split(/\r?\n/);
var events = fs.readFileSync('../IntercomExtractor/Data/Event_Names.txt').toString();
var writer = csvWriter({ headers:  ['User_ID'].concat(events.split(/\r?\n/) )});
//writer.pipe(fs.createWriteStream('../IntercomExtractor/Data/Main.csv'));
var UserRow = [];
fs.writeFileSync('../IntercomExtractor/Data/All_Users_Events.txt', '');
ID_Array.forEach(function(user) {
    // GET ALL EVENTS AND NUMBERS
    client.events.listBy({type: 'user', intercom_user_id: user, summary: true}, function(data) {
        console.log(data.body.events);
        var newevent = ";";
        fs.appendFileSync('../IntercomExtractor/Data/All_Users_Events.txt', user + ';', function (err) {

        });
        if(data.body.events) {
            for(var i = 0; i < data.body.events.length; i++)    {
                fs.appendFileSync('../IntercomExtractor/Data/All_Users_Events.txt', data.body.events[i].name + "," + data.body.events[i].count + ";", function (err) {

                });
            }
            fs.appendFileSync('../IntercomExtractor/Data/All_Users_Events.txt', '\n', function (err) {

            });
        }
        else    {
        }
    });
});
});



module.exports = router;


router.get('/getUsers', function(req,res,next) {
    client.users.list(function (err, users) {
        fs.writeFile('../IntercomExtractor/Data/Users.txt', '');
        users.body.users.forEach(function (user) {
            var row = '';
            if(user.id)    {
                row += user.id + ',';
            }
            if(user.email)  {
                row += user.email + ',';
            }
            if(user.name)   {
                row += user.name + ',';
            }
            if(user.companies.companies[0])   {
                row += user.companies.companies[0].name + ',';
            }
            if(user.location_data.region_name)  {
                row += user.location_data.region_name + ',';
            }

            row += '\n';



            fs.appendFile('../IntercomExtractor/Data/Users.txt',(row), function (err) {
                if (err) throw err;
                console.log('Saved!');
            });

        });
    });
});





// fs.writeFile('../IntercomExtractor/Data/User_Events.txt', '');
// for (var i = 0; i < 2; i++)   {
//     client.events.listBy({
//         type: 'user',
//         intercom_user_id: UserIDs[i],
//         summary: true
//     }, function(data)   {
//         Data.push(data);
//         res.send(Data[0].body);
//         fs.appendFile('../IntercomExtractor/Data/Events.txt', JSON.stringify(data.body) + '\n', function (err) {
//             if (err) throw err;
//             console.log('Saved!');
//         });
//     });
// }
//


// GETTING EVENT TYPES
// client.events.listBy({
//     type: 'user',
//     intercom_user_id: line,
//     summary: true
// }   , function(data)   {
//     fs.writeFile('../IntercomExtractor/Data/Event_Types.txt', '');
//     data.body.events.forEach(function(event)    {
//         fs.appendFile('../IntercomExtractor/Data/Event_Types.txt', event.name + '\n', function (err) {
//             if (err) throw err;
//             console.log('Saved!');
//         });
//     });
// });



// REMOVING DUPLICATE EVENTS
// var lineReader = require('readline').createInterface({
//     input: require('fs').createReadStream('../IntercomExtractor/Data/Event_Types.txt')
// });
// var Events = [];
// fs.writeFile('../IntercomExtractor/Data/Event_Names.txt', '');
// lineReader.on('line', function (line) {
//     var valid = true;
//     for (var i = 0; i < Events.length; i++)    {
//         if (Events[i] === line) {
//             valid = false;
//         }
//     }
//     if (valid)  {
//         fs.appendFile('../IntercomExtractor/Data/Event_Names.txt', line + '\n', function (err) {
//             if (err) throw err;
//             console.log('Saved!');
//         });
//     }
// });



// GET ALL EVENTS
// var lineReader = require('readline').createInterface({
//     input: require('fs').createReadStream('../IntercomExtractor/Data/User_Ids.txt')
// });
// var Events = [];
// fs.writeFile('../IntercomExtractor/Data/Event_Types.txt', '');
// lineReader.on('line', function (line) {
//     client.events.listBy({
//         type: 'user',
//         intercom_user_id: line,
//         summary: true
//     }   , function(data)   {
//         data.body.events.forEach(function(event)    {
//             fs.appendFile('../IntercomExtractor/Data/Event_Types.txt', event.name + '\n', function (err) {
//                 if (err) throw err;
//                 console.log('Saved!');
//             });
//         });
//     });
// });


// ASSIGN USERS TO EVENTS
// // GET THE DATA AND CSV READY
// var ids = fs.readFileSync('../IntercomExtractor/Data/User_Ids.txt').toString();
// var ID_Array = ids.split(/\r?\n/);
// var events = fs.readFileSync('../IntercomExtractor/Data/Event_Names.txt').toString();
// var writer = csvWriter({ headers:  ['User_ID'].concat(events.split(/\r?\n/) )});
// //writer.pipe(fs.createWriteStream('../IntercomExtractor/Data/Main.csv'));
// var UserRow = [];
// fs.writeFileSync('../IntercomExtractor/Data/All_Users_Events.txt', '');
// ID_Array.forEach(function(user) {
//     // GET ALL EVENTS AND NUMBERS
//     client.events.listBy({type: 'user', intercom_user_id: user, summary: true}, function(data) {
//         console.log(data.body.events);
//         var newevent = ";";
//         fs.appendFileSync('../IntercomExtractor/Data/All_Users_Events.txt', user + ',', function (err) {
//
//         });
//         if(data.body.events) {
//             for(var i = 0; i < data.body.events.length; i++)    {
//                 fs.appendFileSync('../IntercomExtractor/Data/All_Users_Events.txt', '{ name : ' + data.body.events[i].name + ", count :" + data.body.events[i].count + "},", function (err) {
//
//                 });
//             }
//             fs.appendFileSync('../IntercomExtractor/Data/All_Users_Events.txt', '\n', function (err) {
//
//             });
//         }
//         else    {
//         }
//     });
// });