// This is part of a version currently in development and may be changed at any time.
const date = new Date();

var generator_v4 = function(layout, difficulty, bingoList, customTags)
{
    var squareMin;
    var squareMax;
    var lineMin;
    var lineMax;

	var currentSheet = [];
	var sheetLayout = [];

    sheetLayout = [ 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0 ];

    switch(difficulty)
    {
        // Very Easy
        case 1:
            squareMin = 1;
            squareMax = 4;
            lineMin = 6;
            lineMax = 14;
            break;

        // Easy (avg goal 8–10)
        case 2:
            squareMin = 4;
            squareMax = 12;
            lineMin = 40;
            lineMax = 50;
            break;

        // Normal (avg goal 13–16)
        case 3:
            squareMin = 9;
            squareMax = 22;
            lineMin = 65;
            lineMax = 80;
            break;

        // Hard (avg goal 24–28)
        case 4:
            squareMin = 16;
            squareMax = 32;
            lineMin = 120;
            lineMax = 140;
            break;

        // Very Hard
        case 5:
            squareMin = 25;
            squareMax = 999;
            lineMin = 200;
            lineMax = 1500;
            break;

        // Jesus take the wheel
        default:
            squareMin = 0;
            squareMax = 999;
            lineMin = 0;
            lineMax = 99999;
    }

    // Group the goals by difficulty
    var groupedGoals = bingoList.reduce((result, goal) => {
        (result[goal.difficulty] = result[goal.difficulty] || []).push(goal); // Use either the existing array or create a new one, then push to it
        return result;
    }, {});

    const result = distributeDifficulty(squareMin, squareMax, lineMin, lineMax, bingoList);
    if(!result) {
		alert("The sheet failed to generate, a different random seed will be chosen. Report this issue on GitHub with the current seed in the URL.");
		newSeed(true);
		return;
    }

    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            sheetLayout[i+j*5] = result[i][j];
        }
    }

	var indexes = Array.from(Array(25).keys());

	// Keep track off what tags, antisynergys, reactants and catalysts are already on the sheet
	var tags = [];
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
			if(!(sheetLayout[i] in groupedGoals)) {
				while(!(sheetLayout[i] in groupedGoals)) {
					sheetLayout[i]--;
				}
				console.log("No goal at that difficulty available, reducing to " + sheetLayout[i] + ".");
			}
			// Generate a new goal candidate from the list of goals
			var rng = Math.floor((Math.random() * groupedGoals[sheetLayout[i]].length - 1) + 1);
			var goalCandidate = groupedGoals[sheetLayout[i]][rng];

			// If the loop is stuck because no more suitable goals
			if (failSafe >= 100)
			{
				// Move the difficulty down by one
				sheetLayout[i]--;

				// Check for a non-broken goal list
				if (sheetLayout[i] == 0)
				{
					console.log("The difficulty for goal " + i + "/24 is 0, breaking out.");
					break GoalGen;
				}

				failSafe = 0;

				console.log("Failsafe occurred on index " + (i + 1) + "/25, changing the goal's difficulty to " + sheetLayout[i] + ".");

				continue GoalGen;
			}

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

			// Scramble the eggs
			ScrambleEggs(goalCandidate);

			// Regex to remove the amounts ("3", "7" etc), amount ranges ("(2-6)", "(32-64)" etc) and plural "s"s ("BlockS", "StickS" etc) from goal names for comparison
			const normalizeName = name =>name.replace(/^(?:\d+|\(\d+(?:[-–]\d+)?\))\s+|\b(\w{2,})s\b/g, (_, singular) => singular || '');

			// If the current sheet already has this goal on it
			if (currentSheet.some(r =>normalizeName(r.name) === normalizeName(goalCandidate.name)))
			{
				// Get a new goal
				//console.log("'" + goalCandidate.name + "' already on the sheet, generating a new goal.");
				continue GoalGen;
			}

			// Check if the goal has any tags
			if (goalCandidate.tags != null)
			{
				// foreach tag in the goal's tags
				for (const tag of goalCandidate.tags)
				{
					var currentTag = tags.find(t => t.name === tag.name);

					if (!currentTag)
					{
						// Clone the tag object, don't make a reference to the original tag
						currentTag = structuredClone(tag); 
						currentTag.max = tag.max[difficulty - 1];

						// If the tag is a custom tag, override the max value with the custom tag's max value
						currentCustomTag = customTags && customTags.length > 0 && customTags.find(t => t.name === tag.name);
						if (currentCustomTag)
						{
							currentTag.max = currentCustomTag.max;
						}

						// Set the initial count to 0
						currentTag.count = 0;
						tags.push(currentTag);
					}

					// NOT else if because the max can be 0
					if (currentTag.count >= currentTag.max)
					{
						// If the tag has reached its max value, get a new goal
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
								//console.log("'" + goalCandidate.name + "' and '" + currentSheet[indexes[z]].name + "' cannot be on same line, generating a new goal.");
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
					//console.log("'" + goalCandidate.name + "' antisynergy detected, generating a new goal.");
					continue GoalGen;
				}
			}
			// Check if the goal generated is a catalyst for anything already on the sheet
			if (typeof goalCandidate.catalyst !== 'undefined')
			{
				if (goalCandidate.catalyst.some(c => reactants.has(c)))
				{
					// If it is, get a new goal
					//console.log("'" + goalCandidate.name + "' reactant detected, generating a new goal.");
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
					//console.log("'" + goalCandidate.nam + "' catalyst detected, generating a new goal.");
					continue GoalGen;
				}
			}

			// If we made it this far, the goal must be good to go
			break GoalGen;
		}
		while (true);

		// We successfully picked a goal, increase the count of it's tags
		for (const tag of goalCandidate.tags)
		{
			tags.find(t => t.name === tag.name).count++;
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

	console.log("Sheet generation completed successfully.");

	if (DEBUG_SHEET)
	{
		tags.forEach(tag => {console.log("Tag '" + tag.name + "' has " + tag.count + " goals, max is " + tag.max + ".");});
	}
	
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

// Shuffle using Fisher-Yates
function shuffle(a) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function ScrambleEggs(goalCandidate)
{
	if (goalCandidate.name == "Extinguish a Candle on a Cake")
	{
		var month = date.getMonth() + 1; // getMonth() indexs from 0 but getDate from 1 for some god awful reason
		var day = date.getDate();

		if (month == 8 && day == 19) 
		{
			goalCandidate.name = "Extinguish a Blue Candle on a Cake";
			goalCandidate.tooltiptext = "Happy Birthday Joshimuz!";
		}
		else if (month == 1 && day == 13)
		{
			goalCandidate.name = "Extinguish a Green Candle on a Cake";
			goalCandidate.tooltiptext = "Happy Birthday Faye!";
		}
	}
	
	return;
}

function distributeDifficulty(squareMin, squareMax, lineMin, lineMax, goals) {
    const SIZE = 5;
    const UNIQUE_VALS = 3; // This can be set higher for generating a more unique spread of difficulties.
    const MAX_ATTEMPTS = 1000;
    let attempts = 0;

    for (let restart = 0; restart < 100; restart++) {
        attempts = 0;
        // Fill the grid with 0s
        grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

        if (backtrack()) {
            return grid;
        }
    }

    function countUnique(arr) {
        return new Set(arr).size;
    }

    function isValid(r, c) {
        // Check row if complete
        if (c === SIZE - 1) {
            let row = grid[r];
            let sum = row.reduce((a, b) => a + b, 0);
            if (sum < lineMin || sum > lineMax) return false;
            if (countUnique(row) < UNIQUE_VALS) return false;
        }

        // Check column if complete
        if (r === SIZE - 1) {
            let col = [];
            for (let i = 0; i < SIZE; i++)
                col.push(grid[i][c]);
            let sum = col.reduce((a, b) => a + b, 0);
            if (sum < lineMin || sum > lineMax) return false;
            if (countUnique(col) < UNIQUE_VALS) return false;
        }

        // Check diagonals only after last cell filled
        if (r === SIZE - 1 && c === SIZE - 1) {
            let leftDiagSum = 0, rightDiagSum = 0;
            let leftDiag = [], rightDiag = [];
            for (let i = 0; i < SIZE; i++) {
                leftDiagSum += grid[i][i];
                leftDiag.push(grid[i][i]);
                rightDiagSum += grid[i][SIZE - 1 - i];
                rightDiag.push(grid[i][SIZE - 1 - i]);
            }
            if (
                leftDiagSum < lineMin || leftDiagSum > lineMax ||
                rightDiagSum < lineMin || rightDiagSum > lineMax
            ) return false;
            if (countUnique(leftDiag) < UNIQUE_VALS || countUnique(rightDiag) < UNIQUE_VALS) return false;
        }

        // All checks have passed!
        return true;
    }

    function backtrack(row = 0, col = 0) {
        if (attempts > MAX_ATTEMPTS) return false; // Let's not go down this path!

        if (row === SIZE) return true;

        const nextRow = col === SIZE - 1 ? row + 1  : row;
        const nextCol = col === SIZE - 1 ? 0        : col + 1;

		let frequencyMap = {};
		for (let goal of goals) {
			let diff = goal.difficulty;
			if (diff >= squareMin && diff <= squareMax)
				frequencyMap[diff] = (frequencyMap[diff] || 0) + 1;
		}

		let values = [];
		for (let [value, count] of Object.entries(frequencyMap)) {
			for (let i = 0; i < count; i++) {
				values.push(parseInt(value));
			}
		}

		values = shuffle(values);

        for (let val of values) {
            attempts++;
            grid[row][col] = val;

            if (partialSumValidation(row, col) && isValid(row, col)) {
                if (backtrack(nextRow, nextCol)) 
                    return true;
            }
            grid[row][col] = 0; // Backtrack ←
        }
        return false;
    }

    function partialSumValidation(r, c) {
        const rowSum = grid[r].reduce((a, b) => a + b, 0);
        if (rowSum > lineMax) return false;
        // Similarly for column partial sum
        let colSum = 0;
        for (let i=0; i<=r; i++) 
            colSum += grid[i][c];
        if (colSum > lineMax) return false;

        return true;
    }
}