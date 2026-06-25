'use strict';
// loop through all the regular expression matches in a string, return results array
function findAllMatches(pattern, flags, text) {

    const regExp = new RegExp(pattern, flags);
    const results = [];
    let result;
    while ((result = regExp.exec(text)) !== null) {
        results.push(`Matched '${result[0]}' at index ${result.index}`);
    }
    return results;
}