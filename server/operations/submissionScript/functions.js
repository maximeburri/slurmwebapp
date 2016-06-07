var units = [
    ["MB", "Mo"],
    ["GB", "Go"],
    ["TB", "To"],
];

var base = 1024;
var posMB = 0;

toMegaBytes = function(number, stringUnit) {
    for(i = 0;i<units.length;i++){
        for(j = 0;j<units[i].length;j++){
            if(stringUnit == units[i][j]){
                if(i < posMB){
                    return number / Math.pow(base, Math.abs(posMB-i));
                }else if (i > posMB){
                    return number * Math.pow(base, i-posMB);
                }else{
                    return number;
                }

            }
        }
    }
    return number;
};

toBestMemoryUnit = function(object) {
    for(i = posMB + 1;i<units.length;i++){
        if(object.value > base){
            // Check if division is integer
            if(object.value % base == 0){
                // So division by 1024, change unit
                object.value = object.value / base;
                object.unit = units[i][0];
            }else{
                break;
            }
        }
        else {
            break;
        }
    }
    return object;
};


// Index by attributes
var directivesByAttributes = {
    "name" : {
        "directives" : ["-J", "--job-name"],
        "dataType" : "string",
    },
    "nbTasks" : {
        "directives" : ["-n", "--ntasks"],
        "dataType" : "integer",
    },
    "nbCPUsPerTasks" : {
        "directives" : ["-c", "--cpus-per-task"],
        "dataType" : "integer",
    },
    "partition" : {
        "directives" : ["-p", "--partition"],
        "dataType" : "string",
    },
    "fileStdOut" : {
        "directives" : ["-o", "--output"],
        "dataType" : "string",
    },
    "fileStdErr" : {
        "directives" : ["-e", "--error"],
        "dataType" : "string",
    },
    "memory" : {
        "directives" : ["--mem"],
        "objectToValue"  : function(object){
            return "" + toMegaBytes(object.value, object.unit);
        },
        "valueToObject" : function(value){
            object = {};
            object.unit = "MB";
            object.value = parseInt(value);
            object.default = false;
            return toBestMemoryUnit(object);
        },
    },
    "licenses" : {
        "directives" : ["-L", "--licenses"],
        "objectToValue"  : function(object){
            if(!object ||
                object.length == 0)
                return null;
            return "" + object.join(',');
        },
        "valueToObject" : function(value){
            if(!value)
                return null;
            return value.split(',');
        },
    },
    "timeLimit" : {
        "directives" : ["-t", "--time"],
        "objectToValue"  : function(object){
            object.days = object.days == undefined ? 0 :
                                object.days;
            object.hours = object.hours == undefined ? 0 :
                                object.hours;
            object.minutes = object.minutes == undefined ? 0 :
                                object.minutes;
            object.seconds = object.seconds == undefined ? 0 :
                                object.seconds;
            function twoDigit(d){
                if(d <= 9)
                    return '0' + d;
                return d;
            }

            return twoDigit(object.days) + "-" +
                twoDigit(object.hours) + ":" +
                twoDigit(object.minutes) + ":" +
                twoDigit(object.seconds);
        },
        "valueToObject" : function(value){
            var object = {};
            var ddhh_mm_ss = value.split(":");
            var dd_hh = ddhh_mm_ss.length > 1 ?
                            ddhh_mm_ss[0].split('-') :
                            [];

            object.days = dd_hh.length > 1 ?
                            parseInt(dd_hh[0]) :
                            0;

            object.hours = dd_hh.length > 1 ?
                            parseInt(dd_hh[1]) :
                            parseInt(dd_hh[0]);

            object.minutes = ddhh_mm_ss.length > 2 ?
                            parseInt(ddhh_mm_ss[1]) :
                            0;

            object.seconds = ddhh_mm_ss.length > 3 ?
                            parseInt(ddhh_mm_ss[2]) :
                            0;
            return object;
        },
    }
}

// Index by directives
var attributesByDirectives = {};

// Index directives by attributes to attributes by directives
function indexDirectives(directivesByAttributes, attributesByDirectives){
    for(var attr in directivesByAttributes){
        directivesObject = directivesByAttributes[attr];

        attributeObject = {};
        attributeObject.attribute = attr;
        if(directivesObject.dataType)
            attributeObject.dataType = directivesObject.dataType;
        if(directivesObject.objectToValue)
            attributeObject.objectToValue = directivesObject.objectToValue;
        if(directivesObject.valueToObject)
            attributeObject.valueToObject = directivesObject.valueToObject;

        for (var i in directivesObject.directives){
            attributesByDirectives[directivesObject.directives[i]] = attributeObject;
        }
    }
}

indexDirectives(directivesByAttributes, attributesByDirectives);

var moduleLoad = {
    "attribute" : "modules",
    "commandStr" : "module load ",
    "objectToValue"  : function(object){
        str = "";
        if(object.dependencies)
            str = object.dependencies + " ";
        str = str + object.module;
        return str;
    },
    "valueToObject" : function(value){
        modules = value.split(' ');
        object = {};

        object.module = modules[modules.length-1];
        if(modules.length > 1){
            object.dependencies = modules.slice(0, modules.length-1).join(' ');
        }

        return object;
    },
}

var runJob = {
    "attribute" : "execution",
    "commandStr" : "srun ",
    "objectToValue"  : function(object){
        // object.executable object.arguments
        str = object.executable;
        if(object.arguments)
            str = str + " " + object.arguments;
        return str;
    },
    "valueToObject" : function(value){
        values = value.split(' ');
        object = {};
        if(values.length >= 1){
            object.executable = values[0];
            if(values.length > 1){
                object.arguments = values.slice(1).join(' ');
            }
        }
        return object;
    },
}


var commands = [
    {
        "commandStr" : "#SBATCH ",
        "options" : attributesByDirectives
    },
    moduleLoad,
    runJob
];



//console.log(directivesByAttributes);
//console.log(attributesByDirectives);
var shebangBinBashArray = ["#!/bin/sh", "#!/bin/bash"];
var directiveBeginStr = "#SBATCH ";
var moduleLoadStr = "module load ";
var runExecutableStr = "srun ";


// Transform object attribute to value
function objectToValue(directiveOrAttribute, object){
    if(directiveOrAttribute.objectToValue){
        return directiveOrAttribute.objectToValue(object);
    }else if (directiveOrAttribute.dataType == "string"){
        return object;
    }else if (directiveOrAttribute.dataType == "integer"){
        return ""+object;
    }else if (directiveOrAttribute.dataType == "array_string"){
        return object.join(',');
    }
    return null;
}

// Transform value attribute to object
function valueToObject(directiveOrAttribute, value){
    if(directiveOrAttribute.valueToObject){
        return directiveOrAttribute.valueToObject(value);
    }else if (directiveOrAttribute.dataType == "string"){
        return "" + value;
    }else if (directiveOrAttribute.dataType == "integer"){
        return parseInt(value);
    }else if (directiveOrAttribute.dataType == "array_string"){
        return value.split(',');
    }
    return null;
}

// Return job
load = function(script){
    job = {};

    // Parse the script
    parse(script,
        // Find a command
        function (value, fncDelete, fncUpdate, directive){
            // Save it
            if(directive.attribute)
                job[directive.attribute] = value;
        }
    );
    return job;
}

// Save a job with a script already written
save = function (job, script){
    // New script, add shebang
    if(!script)
        script = "#!/bin/bash";

    // Save all attribute already reaplced
    replacedAttributes = {};

    // Parse
    parse(script,
        // On find command
        function (value, fncDelete, fncUpdate, directive){
            // If not already added
            if(job[directive.attribute] !== undefined && value !== null){
                // Update command
                fncUpdate(job[directive.attribute]);

                // Save as replaced attributes
                replacedAttributes[directive.attribute] = true;
            }
            else
                fncDelete();
        },

        // On end
        function(fncAdd, fncComplete){
            // Foreach attribute of job to write
            for (var key in job) {
                // If attribute was not written
                if(!replacedAttributes[key]){
                    // Add the attribute to the script
                    var value = job[key];
                    fncAdd(key, value);
                }
            }

            // Get the complet script
            script = fncComplete()
        }
    );

    return script;
}


function parse(script, fnc, fncEnd) {
    shebangBinBashPos = -1;

    lines = script.split('\n');

    // Init parts info
    partsInfo = [];
    for(var partNum = 0; partNum < commands.length; partNum ++){
        partsInfo[partNum] = {
            begin : undefined,
            end : undefined
        }
    }

    // Foraech lines
    for(var numLine in lines){
        //Remove indentation
        lines[numLine] = lines[numLine].trim();

        //Usefull to get line
        line = lines[numLine];

        // Create function to delete line
        var fncDelete = function(){
            lines[numLine] = "";
        }

        // Test shebang
        if(shebangBinBashPos < 0){
            // Foreach possible shebang
            for(var j = 0;j<shebangBinBashArray.length;j++){
                shebang = shebangBinBashArray[j];

                // Test if shebang
                if(line.length >= shebang.length &&
                   line.substring(0, shebang.length) === shebang){
                    // Memorize position
                    shebangBinBashPos = numLine;
                    break;
                }
            }
        }else{
            try{
                for(commandNum in commands){
                    command = commands[commandNum];

                    valueEndCommand = command.commandStr.length;

                    // If find a command
                    if(line.substring(0, valueEndCommand) ===
                        command.commandStr){
                        attributeObject = undefined;
                        values = undefined;

                        // If subcommand options
                        if(command.options){
                            option = "";
                            optionPos = valueEndCommand;

                            // Get all optionument value
                            while(line[optionPos] != ' ' &&
                                    optionPos < line.length &&
                                    line[optionPos] != '='){
                                option += line[optionPos];
                                optionPos++;
                            }

                            valueEndCommand = optionPos + 1;

                            attributeObject = command.options[option];
                        }else{
                            attributeObject = command;
                        }

                        // Get value
                        values = line.substring(valueEndCommand, line.length);

                        // Save the parts info
                        if(partsInfo[commandNum].begin === undefined)
                            partsInfo[commandNum].begin = (numLine-0);

                        /*if((commandNum-1) >= 0 && partsInfo[commandNum-1].end
                            === undefined && partsInfo[commandNum-1].begin !== undefined)
                            partsInfo[commandNum-1].end = (numLine-0)-1;*/

                        fncUpdate = function(object){
                            lines[numLine] = line.substring(0, valueEndCommand)
                                + objectToValue(attributeObject, object);
                        };

                        // If attributeObject finded, call fnc
                        if(attributeObject){
                            if(typeof fnc === "function")
                                fnc(
                                    valueToObject(attributeObject,values),
                                    fncDelete,
                                    fncUpdate,
                                    attributeObject);
                        }
                        break;
                    }
                }
            }
            catch(e){
                console.error(e.stack);
                continue;
            }
        }
    }

    function addRow(row, part, str){
        lines.splice(row, 0, str);

        for(var x = 0; x < commands.length; x++){
            if(x == part)
                continue;
            if(partsInfo[x].begin >= row){
                partsInfo[x].begin = (partsInfo[x].begin-0) + 1;
            }
            if(partsInfo[x].end >= row){
                partsInfo[x].end = (partsInfo[x].end-0) + 1;
            }
        }
    };

    // Check all parts are numeroted
    for(var partNum = 0; partNum < commands.length; partNum ++){

        // Begin not defined : no parts
        if(partsInfo[partNum].begin === undefined){
            /*if(partsInfo[partNum].end !== undefined){
                partsInfo[partNum].begin = partsInfo[partNum].end;
            }
            // If precedent has a end part, so this part is end+1
            else*/ if(partNum-1 >= 0 &&
                    partsInfo[partNum-1].end !== undefined){
                partsInfo[partNum].begin = partsInfo[partNum-1].end+1;

            }
            // If next has a begin part, so this part is begin-1
            else if (partNum+1 < commands.length &&
                    partsInfo[partNum+1].begin !== undefined){
                partsInfo[partNum].begin = partsInfo[partNum+1].begin-1;
            }
            // No parts fineded, take first
            else{
                partsInfo[partNum].begin = 1;
            }
        }
        // No end defined, so the end is the begining
        if(partsInfo[partNum].end == undefined){
            partsInfo[partNum].end = partsInfo[partNum].begin;
        }
    }

    fncAdd = function(attributeName, object){
        for(var partNum = 0; partNum < commands.length; partNum ++){
            part = commands[partNum];


            if(part.options){
                //if(part.options.)
                if(directivesByAttributes[attributeName]){
                    value = objectToValue(directivesByAttributes[attributeName],
                        object);

                    if(value)
                        addRow(partsInfo[partNum].begin, partNum, part.commandStr+
                            directivesByAttributes[attributeName].directives[0] +" "+
                            value    )
                }
            }else{
                if(part.attribute == attributeName){
                    value = objectToValue(part,
                        object);

                    if(value)
                        addRow(partsInfo[partNum].begin, partNum, part.commandStr+
                            value)
                }
            }
        }
    }

    fncComplete = function(){
        return lines.join('\n');
    }

    if(typeof fncEnd === "function")
        fncEnd(fncAdd, fncComplete);
}


module.exports = {
    load : load,
    save : save,
    parse : parse
};
