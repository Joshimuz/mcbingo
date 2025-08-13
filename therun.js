const PROXY_BASE = "https://dry-surf-6b16.joshua-ed.workers.dev/?url=";
var currentRaces;
var refreshButton;

$(document).ready(function()
{
	refreshButton = document.getElementById("TheRunRefreshButton");
	refreshButton.innerHTML = "Load Races";
	$("#TheRunTip").css("display", "none");
	$("#TheRunNoRaces").css("display", "none");
});

// This is called via the "Load Races"/"Refresh" button in TheRun.gg races section
async function loadAndDisplayRaces()
{
	$("#TheRunTip").css("display", "none");
	$("#TheRunNoRaces").css("display", "none");

	window.scrollTo(0, document.body.scrollHeight);

	const tbody = document.querySelector("#raceTable tbody");
  	tbody.innerHTML = "";
	refreshButton.disabled = true;
	setTimeout(enableRefreshButton, 10000);

	currentRaces = await fetchRaces();
	currentRaces = currentRaces.result.filter(race =>{
		const searchStr = "bingo";
		return (
				(race.displayCategory && race.displayCategory.toLowerCase().includes(searchStr)) ||
				(race.description && race.description.toLowerCase().includes(searchStr)) ||
				(race.customName && race.customName.toLowerCase().includes(searchStr))
			);
	});

	displayRaces();

	if (currentRaces.length > 0)
	{
		$("#TheRunTip").css("display", "block");
		refreshButton.innerHTML = "Refresh";
	}
	else
	{
		$("#TheRunNoRaces").css("display", "block");
		refreshButton.innerHTML = "Load Races";
	}

	window.scrollTo(0, document.body.scrollHeight);
}

function enableRefreshButton()
{
	timeElapsed = true;
	refreshButton.disabled = false;
}

async function fetchRaces() {	
  return fetch(PROXY_BASE + "https://races.therun.gg/active?game=minecraft:javaedition")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
}

function displayRaces() {
  const tbody = document.querySelector("#raceTable tbody");
  tbody.innerHTML = "";

  currentRaces.forEach(race => {
    const tr = document.createElement("tr");

    const nameCellContent = `
      <span class="server-name">${race.customName || "Untitled Race"}</span><br>
      <span class="server-motd">${race.description || "No Description"}</span>
    `;

	var statusContent = "Pre-Race";
	if (race.status == "progress")
	{
		let start = new Date(race.startTime).getTime();
		let now = Date.now();
		let elapsed = now - start;
		var hours = new Date(elapsed).getHours() - 1;
		var minutes = new Date(elapsed).getMinutes().toString();
		if (minutes.length < 2)
		{
			minutes = "0" + minutes;
		}
		var seconds = new Date(elapsed).getSeconds().toString();
		if (seconds.length < 2)
		{
			seconds = "0" + seconds;
		}

		var timer = hours.toString() + ":" + minutes + ":" + seconds;

		statusContent = timer;
	}
	else if (race.status == "finished")
	{
		statusContent = "Finished";
	}
	else if (race.status == "aborted")
	{
		statusContent = "Aborted";
	}

    tr.innerHTML = `
      <td>${nameCellContent}</td>
      <td>${"Started by<br>" + race.creator || "Unknown"}</td>
      <td>${statusContent}</td>
      <td>${"Players<br>" + race.participantCount || "Players<br>0"}</td>
    `;

	// This has to be it's own thing to avoid insecure errors
	// Copy the seed to the clipboard if there is one
	tr.addEventListener("click", () => {
		if (race.description) {
			const match = race.description.match(/https?:\/\/minecraftbingo\.com[^\s"]+/i);
			if (match) {
				targetUrl = match[0];

				// Extract seed before navigating
				const underscoreIndex = targetUrl.lastIndexOf("_");
				if (underscoreIndex !== -1) {
					let seedPart = targetUrl.substring(underscoreIndex + 1);

					// Trim off trailing & parameters if present
					const ampIndex = seedPart.indexOf("&");
					if (ampIndex !== -1) {
					seedPart = seedPart.substring(0, ampIndex);
					}

					// Copy to clipboard immediately
					navigator.clipboard.writeText(seedPart)
					.then(() => console.log("Copied seed:", seedPart))
					.catch(err => console.error("Clipboard copy failed:", err));
				}
			}
		}
	});

	// Open the race page
	tr.addEventListener("click", () => {
		const url = `https://therun.gg/races/${race.raceId}`;
		window.open(url, "_blank");
	});

	// Load the board with all it's settings if there is one
	tr.addEventListener("click", () => {
		if (race.description) {
			// Look for a MinecraftBingo.com URL in the description that also includes a seed thingy
			const match = race.description.match(/https?:\/\/minecraftbingo\.com\/[^\s"]*/i);
			if (match) {
				window.scrollTo(0, 0);
				window.history.pushState('', "Sheet", match[0]);
				getSettingsFromURL();
			}
		}
  	});

    tbody.appendChild(tr);
  });
}
