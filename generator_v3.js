// This is part of a version currently in development and may be changed at any time.

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

	// Shuffle the sheet pre generation to allow for accurate line checks. 
	// Sheet must be shuffled to avoid hard to place goals being more likely to be top left than bottom right
	var indexes = Array.from(Array(25).keys());
	shuffle(indexes);

	// Keep track off what tags, antisynergys, reactants and catalysts are already on the sheet
	var tagCount = {};
	var antisynergys = new Set(),
	reactants = new Set(),
	catalysts = new Set();

	// Try to generate 25 goals to populate the sheet
	for (var i=0; i<=24; i++)
	{
		// Keep track of how many times we've tried to generate a goal
		var failSafe = 0;

		GoalGen:
		do
		{
			failSafe++;

			// Generate a new goal candidate from the list of goals
			var rng = Math.floor((Math.random() * bingoList[sheetLayout[i]].length - 1) + 1);
			var goalCandidate = bingoList[sheetLayout[i]][rng];

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

					// If we failed the RNG roll, continue the do while loop and try again
					continue GoalGen;
				}
			}

			// If the current sheet already has this goal on it
			if (currentSheet.some(r=> r.name === goalCandidate.name))
			{
				// Get a new goal
				console.log(goalCandidate.name + " already on the board");
				continue GoalGen;
			}

			// Check if the goal has any tags
			if (goalCandidate.tags != null)
			{
				// foreach tag in the goal's tags
				for (const tag of goalCandidate.tags)
				{
					// If the tag isn't in our list of tags yet, add it and set it to 0
					if (typeof tagCount[tag.name] == 'undefined')
					{
						//console.log(tag.name + " not collected yet, adding");
						tagCount[tag.name] = 0;
					}
					// Otherwise check if it's higher than it should be
					else if (tagCount[tag.name] >= tag.max[difficulty - 1])
					{
						// If we've got too many of that tag, get a new goal
						console.log(tag.name + " max reached with " + tagCount[tag.name] + " on the board");
						continue GoalGen;
					}
				}

				// If the goal candidate contains tags that cannot be on the same line as other goals with that tag
				if (goalCandidate.tags.some(r=> r.line == false))
				{
					// Go through every goal currently on the sheet
					for (var z=0; z < i; z++)
					{
						// If the currentSheet goal has tags AND are on the same line
						if (currentSheet[indexes[z]].tags != null && isOnSameLine(indexes[i], indexes[z]))
						{
							// If both goals have the same tag
							if (currentSheet[indexes[z]].tags.some(r=> r.line == false && goalCandidate.tags.some(s=> r.name === s.name)))
							{
								console.log("Cannot be on same line: " + goalCandidate.name + " and " + currentSheet[indexes[z]].name);
								continue GoalGen;
							}
						}
					}
				}
			}

			// Check if the goal (and the goals on the sheet) has any antisynergies
			if (typeof goalCandidate.antisynergy !== 'undefined')
			{
				// If it does, check to see if it's already on the sheet
				if (goalCandidate.antisynergy.some(a => antisynergys.has(a)))
				{
					// If it is, get a new goal
					console.log("antisynergy for: " + goalCandidate.name);
					continue GoalGen;
				}
			}
			// Check if the goal generated is a catalyst for anything already on the sheet
			if (typeof goalCandidate.catalyst !== 'undefined')
			{
				if (goalCandidate.catalyst.some(c => reactants.has(c)))
				{
					// If it is, get a new goal
					console.log("reactants for: " + goalCandidate.name);
					continue GoalGen;
				}
			}
			// Check if the goal generated is a reactant for anything already on the sheet
			if (typeof goalCandidate.reactant !== 'undefined')
			{
				// If it does, check to see if it's already on the sheet
				if (goalCandidate.reactant.some(r => catalysts.has(r)))
				{
					// If it is, get a new goal
					console.log("catalyst for: " + goalCandidate.name);
					continue GoalGen;
				}
			}

			// If the loop is stuck because no more suitable goals
			if (failSafe >= 500)
			{
				// Check for a non-broken goal list
				if (sheetLayout[i] == 0)
				{
					window.alert("Invalid Goal List");
					break GoalGen;
				}

				// Move the difficulty down by one
				sheetLayout[i]--;
				failSafe = 0;

				console.log("failSafe occurred on " + (i + 1) + "/25, reducing goal difficulty to " + sheetLayout[i]);

				continue GoalGen;
			}

			// If we made it this far, the goal must be good to go
			break GoalGen;
		}
		while (true);

		// We successfully picked a goal, add its tags to tagCount
		for (const tag of goalCandidate.tags)
		{
			tagCount[tag.name]++;
			//console.log(tagCount);
		}
		// Add its antisynergys to the set of antisynergys
		if (typeof goalCandidate.antisynergy !== 'undefined')
		{
			goalCandidate.antisynergy.forEach(a => antisynergys.add(a));
		}
		// Add its catalysts to the set of catalysts
		if (typeof goalCandidate.catalyst !== 'undefined')
		{
			goalCandidate.catalyst.forEach(c => catalysts.add(c));
		}
		// Add its reactants to the set of reactants
		if (typeof goalCandidate.reactant !== 'undefined')
		{
			goalCandidate.reactant.forEach(r => reactants.add(r));
		}

		// Add the goal to the JSON list of goals
		var goal = JSON.parse(JSON.stringify(goalCandidate)); // Clone object

		// Replace random ranges in goal name
		goal.generatedName = goal.name.replace(/\((\d+)-(\d+)\)/g, function(match, n1, n2, offset, input)
		{
			n1 = parseInt(n1);
			n2 = parseInt(n2);
			return getRandomInt(n1, n2);
		});

		// Add the sheet to the goal
		currentSheet[indexes[i]] = goal;
	}

	//shuffle(currentSheet); Old Sheet Shuffling, now shuffling indexes pre-generation instead

	console.log("Completed sheet generation");

	return currentSheet;
}

function isOnSameLine(a, b)
{
	const secondaryDiagonal = [4, 8, 12, 16, 20];

	// Top Left -> Bottom Right Diagonal
	if (a % 6 == 0 && b % 6 == 0)
	{
		return true;
	}
	// Top Right -> Bottom left Diagonal
	else if (secondaryDiagonal.includes(a) && secondaryDiagonal.includes(b))
	{
		return true;
	}
	// Rows
	else if (Math.floor(a / 5) == Math.floor(b / 5))
	{
		return true;
	}
	// Columns
	else if (a % 5 == b % 5)
	{
		return true;
	}

	return false;
}

function shuffle(a) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
