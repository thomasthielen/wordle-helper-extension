var remainingWords = dictionary.slice();
var correct = [];
var present = [];
var absent = new Set();
var solved = false;

function DOMtoString(document_root) {
    var content = '',
        node = document_root.firstChild;
    while (node) {
		var style = node.firstChild;
		if (style != null){
			try {
				var body = style;
				var bodyText = '';
				do {
					body = body.nextSibling;
					if (body.outerHTML != null){
						bodyText = body.outerHTML;
					}
				} while (bodyText.substring(0,5) != '<body')
					
				// TODO: Implement fool-proof scraping of the html nodes (see above)
				
				var gameApp = body.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;
				var shadowRoot1 = gameApp.shadowRoot;

				var game = shadowRoot1.firstChild.nextSibling.nextSibling.nextSibling.firstChild.nextSibling;
				var board = game.firstChild.nextSibling.nextSibling.nextSibling.firstChild.nextSibling;
			
			
				var row = board.firstChild;
			
				for (let i = 0; i < 6; i++){
				
					var tile = row.shadowRoot.firstChild.nextSibling.nextSibling.nextSibling.firstChild;
					for (let j = 0; j < 5; j++){
					
						var fields = tile.outerHTML.split('"');
					
						content += fields[1] + '_' + fields[3] + '-';
						tile = tile.nextSibling;
					}
					row = row.nextSibling;
				}
			
			} catch (e) {
				console.log(e);
				return "This script only works on\n\nwww.powerlanguage.co.uk/wordle/\n\nIf it doesn't work there, please open an issue on our github page.";
			}
		}
		node = node.nextSibling;
    }
	
	extractInformation(content);
	var solutions = solve();
	
	var output = '';
	if (solutions.length == 0){
		output += "Well, this shouldn't have happened - but we haven't found a fitting word.";
		output += "\nEither our dictionary is missing the correct word OR we made a critical mistake in our logic.";
		output += "\n\n...I sincerely hope that it's the former case.";
	} else if (solved){
		output += "Congratulations on solving the puzzle!\nTry not relying on others next time.";
	} else {
		output += 'Possible solutions (ordered by chance):';
		for (const word of solutions){
			output += '\n' + word;
		}
	}
	
    return output;
}

function extractInformation(input){
	for (let i = 0; i < 5; i++){
		present[i] = new Set();
	}
	var tiles = input.split('-');
	var letterPos = 0;
	for (const tile of tiles){
		var parts = tile.split('_');
		switch (parts[1]) {
			case 'correct':
				correct[letterPos] = parts[0];
				break;
			case 'present':
				present[letterPos].add(parts[0]);
				break;
			case 'absent':
				absent.add(parts[0]);
				break;
			case 'undefined':
				return;
		}
		if (letterPos >= 4){
			letterPos = 0;
		} else {
			letterPos++;
		}
	}
	
}

function solve(){
	var possibleSolutions = new Array();
	for (const word of remainingWords){
		if (checkWord(word)){
			possibleSolutions.push(word);
		}
	}
	remainingWords = possibleSolutions.slice();
	if (possibleSolutions.length == 1){
		solved = true;
		for (let i = 0; i < 5; i++){
			if (correct[i] == null){
				solved = false;
			}
		}
	}
	return possibleSolutions;
}

function checkWord(word){
	// check correct letters
	for (let i = 0; i < correct.length; i++){
		if (correct[i] != null){
			if (word.charAt(i) != correct[i]){
				return false;
			}
		}
	}
	// check present letters
	for (let i = 0; i < present.length; i++){
		for (const letter of present[i]){
			if (!word.includes(letter) || word.charAt(i) == letter){
				return false;
			}
		}
	}
	// check absent letters
	for (const letter of absent){
		for (let i = 0; i < word.length; i++){
			if (word.charAt(i) == letter){
				var p = false;
				for (const s of present){
					if (s.has(letter)) {
						p = true;
					}
				}
				if (correct[i] == null && !p){
					return false;
				}
			}
		}
	}
	
	// TODO: Say there is only one E in the solution.
	// The player enters 'PETER'. The first E is marked as present, the second as absent.
	// That means that there is exactly one E in the solution, and it is at neither of those positions.
	// Implement a way of remembering that amount and checking it (as currently the position of the absent E
	// is still allowed, just as more than one E.
	
	return true;
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
});