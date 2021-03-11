// This is part of a version currently in development and may be changed at any time.
var counter = 0;

var generator_v3 = function(layout, difficulty, bingoList)
{
	var amountOfVeryHard;
	var amountOfHard;
	var amountOfMedium;
	var amountOfEasy;

	var currentSheet = [];
	var sheetLayout = [];

	if (layout == "set")
	{
		sheetLayout = [ 1, 2, 0, 2, 1,
						2, 0, 1, 0, 2,
						0, 1, 3, 1, 0,
						2, 0, 1, 0, 2,
						1, 2, 0, 2, 1];
	}
	else if (layout == "random")
	{
		sheetLayout = [ 0, 0, 0, 0, 0,
						0, 0, 0, 0, 0,
						0, 0, 0, 0, 0,
						0, 0, 0, 0, 0,
						0, 0, 0, 0, 0];

		switch(difficulty)
		{
			// Easy with some Very Easy
			case 2:
				amountOfVeryHard = 0;
				amountOfHard = 0;
				amountOfMedium = 0;
				amountOfEasy = getRandomInt(15, 19);
				break;

			// Medium with some Easy
			case 3:
				amountOfVeryHard = 0;
				amountOfHard = 0;
				amountOfMedium = getRandomInt(15, 19);
				amountOfEasy = 25 - amountOfMedium;
				break;

			// Hard with some Medium
			case 4:
				amountOfVeryHard = 0;
				amountOfHard = getRandomInt(15, 19);
				amountOfMedium = 25 - amountOfHard;
				amountOfEasy = 25 - amountOfHard - amountOfMedium;
				break;

			// Very Hard with some Hard
			case 5:
				amountOfVeryHard = getRandomInt(15, 19);
				amountOfHard = 25 - amountOfVeryHard;
				amountOfMedium = 25 - amountOfHard - amountOfVeryHard;
				amountOfEasy = 25 - amountOfHard - amountOfMedium- amountOfVeryHard;
				break;

			// Very Easy
			default:
				amountOfVeryHard = 0;
				amountOfHard = 0;
				amountOfMedium = 0;
				amountOfEasy = 0;
		}

		function distributeDifficulty(amountOfDifficulty, difficulty)
		{
			for (var i = 0; i < amountOfDifficulty; i++)
			{
				var cont = true;
				var failSafe = 0;

				do
				{
					cont = true;
					failSafe++;

					var rng = Math.floor((Math.random() * 25));

					if (sheetLayout[rng] == 0)
					{
						sheetLayout[rng] = difficulty;
					}
					else
					{
						cont = false;
						if (failSafe >= 500)
						{
							break;
						}
					}
				}
				while (cont == false);
			}
		}

		distributeDifficulty(amountOfVeryHard, 4);
		distributeDifficulty(amountOfHard, 3);
		distributeDifficulty(amountOfMedium, 2);
		distributeDifficulty(amountOfEasy, 1);
	}

	for (var i=0; i<=24; i++)
	{
		var failSafe = 0;

		do
		{
			//console.log("Starting do while loop: " + counter);
			counter++;

			// Keeps track if current goalCandidate is good
			var cont = true;
			failSafe++;

			var rng = Math.floor((Math.random() * bingoList[sheetLayout[i]].length - 1) + 1);
			var goalCandidate = bingoList[sheetLayout[i]][rng];

			//console.log(bingoList[sheetLayout[i]][rng].name + " tags: " + bingoList[sheetLayout[i]][rng].tags);

			// Check if the goal has an infrequency modifier
			if (typeof goalCandidate.infrequency !== 'undefined')
			{
				// If it does, make it less likely to appear based on the value of infrequency
				if (Math.floor((Math.random() * goalCandidate.infrequency) + 1) < goalCandidate.infrequency)
				{
					/*
					 * "infrequency" value stores how less likely a goal is. E.g. infrequency == 25
					 * makes a goal 1/25 (4%) as likely as a goal with infrequency == 1.
					 */
					//console.log("cont = false, infrequency check failed");
					cont = false;
					continue;
				}
			}
			var tagCount = [0, 0, 0, 0, 0];

			for (var z=0; z < i; z++)
			{
				// Check if the goal generated is already on the sheet
				if (currentSheet[z].name == goalCandidate.name)
				{
					// If it is get a new goal
					//console.log("cont = false, same goal on sheet");
					cont = false;
					break;
				}
				// Check if the goal generated has any anti synergy with anything already on the sheet
				else if (typeof currentSheet[z].antisynergy !== 'undefined' && typeof goalCandidate.antisynergy !== 'undefined'
					&& currentSheet[z].antisynergy.some(r=> goalCandidate.antisynergy.includes(r)))
				{
					// If it is get a new goal
					console.log("antisynergy between: " + goalCandidate.name + " and " + currentSheet[z].name);
					cont = false;
					break;
				}
				// Check if the goal generated is a catalyst for anything already on the sheet
				else if (typeof currentSheet[z].reactant !== 'undefined' && typeof goalCandidate.catalyst !== 'undefined'
					&& currentSheet[z].reactant.some(r=> goalCandidate.catalyst.includes(r)))
				{
					// If it is get a new goal
					console.log("catalyst/reactant between: " + goalCandidate.name + " and " + currentSheet[z].name);
					cont = false;
					break;
				}
				// Check if the goal generated is a reactant for anything already on the sheet
				else if (typeof currentSheet[z].catalyst !== 'undefined' && typeof goalCandidate.reactant !== 'undefined'
					&& currentSheet[z].catalyst.some(r=> goalCandidate.reactant.includes(r)))
				{
					// If it is get a new goal
					console.log("reactant/catalyst between: " + goalCandidate.name + " and " + currentSheet[z].name);
					cont = false;
					break;
				}

				// Compare all the tags of the current goal with the tags of the current one on the sheet
				if (goalCandidate.tags != null && currentSheet[z].tags != null)
				{
					for (var x = 0, lenX = goalCandidate.tags.length; x < lenX; x++)
					{
						for (var y = 0, lenY = currentSheet[z].tags.length; y < lenY; y++)
						{
							if (goalCandidate.tags[x].name == currentSheet[z].tags[y].name)
							{
								tagCount[x]++;
							}
						}
					}
				}

			}

			// If the tag count is higher than the max that tag should have, don't continue
			if (cont && goalCandidate.tags != null)
			{
				for (var x = 0, len = goalCandidate.tags.length; x < len; x++)
				{
					if (tagCount[x] >= goalCandidate.tags[x].max[difficulty - 1])
					{
						console.log(goalCandidate.tags[x].name + " max reached with " + tagCount[x] + " on the board");
						cont = false;
						break;
					}
				}
			}

			// If the loop is stuck because no more suitable goals
			if (failSafe >= 500)
			{
				// Check for a non-broken goal list
				if (sheetLayout[i] == 0)
				{
					window.alert("Invalid Goal List");
					break;
				}

				// Move the difficulty down by one
				sheetLayout[i]--;
				failSafe = 0;

				console.log("failSafe occurred on " + (i + 1) + "/25, reducing goal difficulty to " + sheetLayout[i]);
			}
		}
		while (!cont);

		var goal = JSON.parse(JSON.stringify(goalCandidate)); // Clone object

		// Replace random ranges in goal name
		goal.generatedName = goal.name.replace(/\((\d+)-(\d+)\)/g, function(match, n1, n2, offset, input)
		{
			n1 = parseInt(n1);
			n2 = parseInt(n2);
			return getRandomInt(n1, n2);
		});
		currentSheet[i] = goal;

		// TESTING PURPOSES
		//goal.difficulty = sheetLayout[i];

		//console.log(goal);
	}

	shuffle(currentSheet);

	console.log("Completed sheet generation");

	return currentSheet;
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
