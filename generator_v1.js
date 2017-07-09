// This file should not be edited anymore since a stable version refers to it

var generator_v1 = function(layout, difficulty, bingoList)
{
	var amountOfVeryHard;
	var amountOfHard;
	var amountOfMedium;
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
			case 2:
				amountOfVeryHard = 0;
				amountOfHard = 2;
				amountOfMedium = 5;
				break;
				
			case 3:
				amountOfVeryHard = Math.floor((Math.random() * 1.5));
				amountOfHard = Math.floor(Math.random() * (4-2) + 2);
				amountOfMedium = Math.floor(Math.random() * (8-6) + 6);
				break;
				
			case 4:
				amountOfVeryHard = Math.floor((Math.random() * 2));
				amountOfHard = Math.floor(Math.random() * (5-3) + 3);
				amountOfMedium = Math.floor(Math.random() * (10-8) + 8);
				break;
				
			case 5:
				amountOfVeryHard = 3;
				amountOfHard = 6;
				amountOfMedium = 13;
				break;
				
			default:
				amountOfVeryHard = 0;
				amountOfHard = 0;
				amountOfMedium = 0;
		}

		if (amountOfVeryHard > bingoList[3].length)
		{
			amountOfVeryHard = bingoList[3].length;
		}
		if (amountOfHard > bingoList[2].length)
		{
			amountOfHard = bingoList[2].length;
		}
		if (amountOfMedium > bingoList[1].length)
		{
			amountOfMedium = bingoList[1].length;
		}
						
		function distributeDifficulty(amountOfDifficulty, difficulty)
		{
			for (var i = 0; i < amountOfDifficulty; i++) 
			{
				var cont = true;
				
				do
				{
					cont = true;
					
					var rng = Math.floor((Math.random() * 24));
				
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
		
		distributeDifficulty(amountOfVeryHard, 3);
		distributeDifficulty(amountOfHard, 2);
		distributeDifficulty(amountOfMedium, 1);
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
	}

	return currentSheet;
}

