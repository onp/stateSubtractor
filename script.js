var validArraysCheck = function(){
    if (arguments[0] == undefined){
        return false;
    };
    var invalidChars = /[^10-]/;
    var requiredLength = arguments[0][0].length;
    for (var i=0;i<arguments.length;i++){           //the argument i
        for (var j=0;j<arguments[i].length;j++){    //string j within the argument
            if ( (arguments[i][j].length != requiredLength)&&(arguments[i][j].length != 0)){
                console.log("a pattern has the wrong length");
                return false
            };
            if (invalidChars.test(arguments[i][j])){
                console.log("a pattern has an invalid character");
                return false
            };
        };
    };
    return true
}

var reducePatterns = function(patterns){
    //given the array patterns of form ["101-","001-","1111"], returns the shortest possible representation
    if (!validArraysCheck(patterns)){return "bad input"};
    var patterns = patterns.filter(function(st){return (st!=='');});  //remove all empty strings
    var newPatterns = [];           //list of patterns after reduction has been done
    var matched = [];                  //index of patterns that have been matched and reduced this round.
    
    for (var i=0; i < patterns.length; i++){                // i is the index of the first pattern being compared
        if (matched.indexOf(i) != -1){continue};            // if pattern[i] has already been matched in a reduction, don't use it again
        for (var k=1; k < patterns.length-i; k++){          // j is the offset from i to the second pattern being compared
            var j = i+k;
            if (matched.indexOf(i+j) != -1){continue};      // if pattern[i+j] has already been matched in a reduction, don't use it again
            var differences = 0;
            var diffIndex = -1;
            var iSubsetOfj = true;
            var jSubsetOfi = true;
            for (var pi = 0; pi<patterns[i].length; pi++){   //pi is the index of the bit within the pattern
                if (patterns[i][pi] != patterns[j][pi]){
                    differences +=1;
                    diffIndex = pi;
                    if (patterns[i][pi] != '-'){
                        console.log(patterns[j] + " is not subset of " + patterns[i] )
                        jSubsetOfi = false;
                    };
                    if (patterns[j][pi] != '-'){
                        console.log(patterns[i] + " is not subset of " + patterns[j] )
                        iSubsetOfj = false;
                    }
                };
                if ( (differences>1) && ((!jSubsetOfi)&&(!iSubsetOfj)) ){
                    console.log(patterns[i] + " and " + patterns[j] + " cannot be combined.")
                    break
                }                 //patterns cannot be combined if they differ in more than one bit AND neither one is a subset of the other
            };
            if (differences == 1){                          //combine patterns if they differ in only one bit.
                newPatterns.push(patterns[i].substr(0,diffIndex) + "-" + patterns[i].substr(diffIndex+1));
                console.log(patterns[i] + " and " + patterns[j] + " were combined at index " + diffIndex)
                matched.push(i,j);                        //mark combined patterns as matched
                break
            };
            if (iSubsetOfj){
                newPatterns.push(patterns[j])
                console.log(patterns[i] + " was a subset of " + patterns[i] )
                matched.push(i,j);                        //mark combined patterns as matched
                break
            };
            if (jSubsetOfi){
                newPatterns.push(patterns[i])
                console.log(patterns[j] + " was a subset of " + patterns[i] )
                matched.push(i,j);                        //mark combined patterns as matched
                break
            }
        };
        if (matched.indexOf(i) == -1){newPatterns.push(patterns[i])};
    };

    if (matched.length > 0){       //if patterns were matched in this round, call the function recursively on the result to check for more matches.
        newPatterns = reducePatterns(newPatterns);
    };
    
    return newPatterns
};

var expandPatterns = function(patterns){
    // expands patterns so they contain no dashes.
    if (!validArraysCheck(patterns)){return "bad input"};
    var newPatterns = [];
    for (var i=0;i<patterns.length;i++){
        if (patterns[i].indexOf('-') != -1){    //if there is a dash in the pattern...
            var expanded = [patterns[i].replace('-','1'),patterns[i].replace('-','0')]; //gets rid of the first dash
            expanded = expandPatterns(expanded);            //apply recursively to eliminate all dashes
            newPatterns.push.apply(newPatterns,expanded)    //appends result to newPatterns
        }else{
            newPatterns.push(patterns[i]);
        };
    };
    return newPatterns
};

var subtractPatterns = function(patternsInitial,patternsSubtracted){
    //remove patternsSubtracted from patternsInitial
    if (!validArraysCheck(patternsInitial,patternsSubtracted)){return "bad input"};
    console.log("subtracting "+ patternsSubtracted + " from " + patternsInitial);
    var patRem = reducePatterns(patternsInitial);       //reducing the patterns before subracting may speed up the process
    var patSub = reducePatterns(patternsSubtracted);
    
    console.log("reduced: subtracting "+ patSub + " from " + patRem);
    
    for (var i=0;i<patSub.length;i++){                  //i is the index of the pattern being subtracted
        var newRem = [];                                //holds the new remainder while it is being generated
        for (var j=0;j<patRem.length;j++){              //j is the index of the pattern being subtracted from (out of the remainder
            var overlap = true;
            console.log("comparing " + patSub[i] + " to " + patRem[j] +"...");
            for (var pi=0; pi<patRem[j].length;pi++){    //pi is the index of the bit within the pattern
                console.log("comparing " + patSub[i][pi] + " to " + patRem[j][pi]);
                if(patSub[i][pi] == '-'){continue};
                if((patRem[j][pi] != '-')&&(patSub[i][pi] != patRem[j][pi])){
                    console.log("don't overlap, breaking");
                    newRem.push(patRem[j])
                    overlap = false;
                    break;
                }else{
                    console.log("do overlap");
                };
            };
            if (overlap){
                console.log("overlap found between " + patRem[j] + " and " + patSub[i]);
                for (var pi=0; pi<patRem[j].length;pi++){    //pi is the index of the bit within the pattern
                    if(patSub[i][pi] == '-'){continue};
                    if (patRem[j][pi] == '-'){
                        newRem.push(patRem[j].substr(0,pi) + (patSub[i][pi] == "1" ? "0":"1") + patRem[j].substr(pi+1));
                        patRem[j] = patRem[j].substr(0,pi) + patSub[i][pi] + patRem[j].substr(pi+1);
                    };
                };
            };
        };
        patRem = newRem; //replace the old patterns with the remainder after subraction
    };
    if (patRem.length ==0){
        return "No States Remaining."
    }
    return patRem
};
$(function(){

    $("div#main-content").on("click","p.button-plus",function(){
        $(this).siblings("ul.state-list").append("<li><input type='text'></input><p class='button-minus'> - </p></li>");
    });
    
    $("div#main-content").on("click","p.button-minus",function(){
        $(this).parents("li").remove();
        $('input').first().trigger("change");
    })

    $("div#main-content").on("change","input",function(){
        console.log("input changed");
        var initialStates = $("div.state-container.initial").find("input").map(function(){
            return $(this).val()
        }).get();
        
        var subtractedStates = $("div.state-container.subtracted").find("input").map(function(){
            return $(this).val()
        }).get();
        
        console.log("initial states");
        console.log(initialStates);
        console.log("subtracted states");
        console.log(subtractedStates);
        
        var remainingStates = subtractPatterns(initialStates,subtractedStates);
        
        $resultList = $("div.state-container.result").find("ul.state-list");
        
        if (typeof remainingStates == "string"){
            $resultList.html(remainingStates);
        }else{
            $resultList.html("");
            console.log(remainingStates);
            $.each(remainingStates, function(){
                $("<li>"+this+"</li>").appendTo($resultList);
            });
        }
        
    })
});


