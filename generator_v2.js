// This is part of a version currently in development and may be changed at any time.


var generator_v2 = function(layout, difficulty, bingoList)
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
				amountOfEasy = Math.min(getRandomInt(15, 19), bingoList[1].length - 10);
				break;
				
			// Medium with some Easy
			case 3:
				amountOfVeryHard = 0;
				amountOfHard = 0;
				amountOfMedium = Math.min(getRandomInt(15, 19), bingoList[2].length - 10);
				amountOfEasy = Math.min(25 - amountOfMedium, bingoList[1].length - 10);
				break;
				
			// Hard with some Medium
			case 4:
				amountOfVeryHard = 0;
				amountOfHard = Math.min(getRandomInt(15, 19), bingoList[3].length - 7);
				amountOfMedium = Math.min(25 - amountOfHard, bingoList[2].length - 10);
				amountOfEasy = Math.min(25 - amountOfHard - amountOfMedium, bingoList[1].length - 10);
				break;
				
			// Very Hard with some Hard
			case 5:
				amountOfVeryHard = Math.min(getRandomInt(15, 19), bingoList[4].length);
				amountOfHard = Math.min(25 - amountOfVeryHard, bingoList[3].length - 7);
				amountOfMedium = Math.min(25 - amountOfVeryHard - amountOfHard, bingoList[2].length - 10);
				amountOfEasy = Math.min(25 - amountOfVeryHard- amountOfHard - amountOfMedium, bingoList[1].length - 10);
				break;
				
			// Very Easy
			default:
				amountOfVeryHard = 0;
				amountOfHard = 0;
				amountOfMedium = 0;
				amountOfEasy = 0;
		}

		if (amountOfVeryHard > bingoList[4].length)
		{
			amountOfVeryHard = bingoList[4].length;
		}
		if (amountOfHard > bingoList[3].length)
		{
			amountOfHard = bingoList[3].length;
		}
		if (amountOfMedium > bingoList[2].length)
		{
			amountOfMedium = bingoList[2].length;
		}
		if (amountOfEasy > bingoList[1].length)
		{
			amountOfEasy = bingoList[1].length;
		}
						
		function distributeDifficulty(amountOfDifficulty, difficulty)
		{
			for (var i = 0; i < amountOfDifficulty; i++) 
			{
				var cont = true;
				
				do
				{
					cont = true;
					
					var rng = Math.floor((Math.random() * 25));
				
					if (sheetLayout[rng] == 0)
					{
						sheetLayout[rng] = difficulty;
					}
					else
					{
						cont = false;
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
		do 
		{
			var cont = true;
			
			var rng = Math.floor((Math.random() * bingoList[sheetLayout[i]].length - 1) + 1);
			var goalCandidate = bingoList[sheetLayout[i]][rng];
			
			// Check if the goal has a frequency modifier
			if (typeof goalCandidate.frequency !== 'undefined')
			{
				// If it does, make it less likely to appear based on the value of frequency
				if (Math.floor((Math.random() * goalCandidate.frequency) + 1) < goalCandidate.frequency)
				{
					cont = false;
				}
			}
			
			for (var z=0; z <= 24; z++)
			{
				if (typeof currentSheet[z] !== 'undefined')
				{
					// Check if the goal generated is already on the sheet
					if (currentSheet[z].name == goalCandidate.name)
					{
						// If it is get a new goal
						cont = false;
					}
					// Check if the goal generated has any anti synergy with anything already on the sheet
					else if (currentSheet[z].antisynergy == goalCandidate.antisynergy && typeof currentSheet[z].antisynergy !== 'undefined')
					{
						// If it is get a new goal
						cont = false;
					}
					// Check if the goal generated is a catalyst for anything already on the sheet
					else if (currentSheet[z].reactant == goalCandidate.catalyst && typeof currentSheet[z].reactant !== 'undefined')
					{
						// If it is get a new goal
						cont = false;
					}
					// Check if the goal generated is a reactant for anything already on the sheet
					else if (currentSheet[z].catalyst == goalCandidate.reactant && typeof currentSheet[z].catalyst !== 'undefined')
					{
						// If it is get a new goal
						cont = false;
					}
				}
			}
 			
		}
		while (!cont);

		var goal = JSON.parse(JSON.stringify(goalCandidate)); // Clone object

		// Replace random ranges in goal name
		goal.generatedName = goal.name.replace(/\((\d+)-(\d+)\)/g, function(match, n1, n2, offset, input) 
		{
			n1 = parseInt(n1);
			n2 = parseInt(n2);
			return Math.floor(Math.random() * (n2-n1+1) + n1);
		});
		currentSheet[i] = goal;
		
		// TESTING PURPOSES
		goal.difficulty = sheetLayout[i];
	}

	return currentSheet;
}

