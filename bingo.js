var DIFFICULTY;
var SEED;
var LAYOUT;
var HIDDEN;
var STREAMER_MODE;
var VERSION;
var DIFFICULTYTEXT = [ "Very Easy", "Easy", "Normal", "Hard", "Very Hard"];
var DEBUG_SHEET = false;

const DEFAULT_SQUARE_CLASS_NAME = "greysquare";
const ALL_COLOURS = [DEFAULT_SQUARE_CLASS_NAME, "bluesquare", "greensquare", "redsquare", "yellowsquare", "cyansquare", "brownsquare"];
var COLOUR_SELECTIONS = [
	[DEFAULT_SQUARE_CLASS_NAME, "greensquare"],
	[DEFAULT_SQUARE_CLASS_NAME, "bluesquare", "greensquare", "redsquare"],
	ALL_COLOURS
];
var COLOURCOUNT = 1; // used as an index in COLOUR_SELECTIONS and COLOURCOUNTTEXT
var COLOURCOUNTTEXT = [ "Green only", "Blue, Green, Red", "6 Colours"];
var COLOURSYMBOLS = true;
var DARK_MODE = false;
const NEVER_HIGHLIGHT_CLASS_NAME = "greensquare";

var hoveredSquare;

// Defines which version uses which goals array/algorithm function
// (by convention `bingoList_v1` is defined in the file goals_v1.js,
// but it could be different of course).
//
// Of course you wouldn't want to create a new version for every change,
// just when you feel like you want to "release" a stable state. For that
// either rename the current unstable version (and then maybe create files
// for a new unstable version) or create new files/a new entry for the
// release.
//
// The version is a string, so theoretically it doesn't have to just be
// numbers (although maybe just numbers would be better).
//
// The name is used for display purposes only.
var VERSIONS = [
	{ id:"1", name:"v1 [1.12.2]",		goals: bingoList_v1, generator: generator_v1, stable: true },
	{ id:"2", name:"v2 [1.12.2]",		goals: bingoList_v2, generator: generator_v2, stable: true },
	{ id:"3", name:"v3 [1.13.2]", 		goals: bingoList_v3, generator: generator_v2, stable: true },
	{ id:"4", name:"v4 [1.16.5]", 		goals: bingoList_v4, generator: generator_v3, stable: true },
	{ id:"5", name:"v5 [1.21.9]", 		goals: bingoList_v5, generator: generator_v4, stable: true },
	{ id:"dev", name:"dev [1.21.10]", 	goals: bingoList_v6, generator: generator_v4, stable: false }, // Dev version
];

// This is the newest stable version that users not specifying a version will get
var LATEST_VERSION = "5";

const SQUARE_COUNT = 25;
const TOOLTIP_TEXT_ATTR_NAME = "data-tooltiptext";
const TOOLTIP_IMAGE_ATTR_NAME = "data-tooltipimg";
const TOOLTIP_FOLDER_STRUCTURE = "Images/Goal Tooltip Images/";
const COLOUR_COUNT_SETTING_NAME = "bingoColourCount";
const COLOUR_SYMBOLS_SETTING_NAME = "bingoColourSymbols";
const COLOUR_THEME_SETTING_NAME = "bingoColourTheme";
const DARK_MODE_CLASS_NAME = "dark";

const SHOW_OPTIONS_MENU_CLASS_NAME = "show-options";
const SHOW_EXPORT_CLASS_NAME = "show-export";

// Dropdowns and pause menu handling.
$(document).click(function(event) {
	const className = event.target.className;
	if (className.includes('dropdown-button')) {
		// if a button was clicked, toggle nearby dropdown
		$(event.target).siblings('.dropdown').toggle(100);
		return;
	}
	if (!$(event.target).closest(".dropdown-holder").length) {
		// Hide if click was anywhere BUT on a dropdown menu
		$('.dropdown').each(function() {
			$(this).hide(100);
		});
	}
	if (!$(event.target).closest(".pause-menu").length) {
		if (event.target.id != "options-toggle-button") {
			// Hide if click was anywhere BUT on a pause menu
			hideOptionsMenu();
			closeSaveAndLoadMenu();
		}
	}
});

$(document).ready(function()
{
	// Set the background to a random image
	$("body").addClass("bg" + (Math.floor(Math.random() * 10) + 1));

	// On clicking a goal square
	const bingoSquares = $("#bingo td");
	bingoSquares.click(function()
	{
		const square = $(this);
		setSquareColor(square, nextColour(square));
	});
	bingoSquares.contextmenu(function()
	{
		const square = $(this);
		setSquareColor(square, prevColour(square));
		return false;
	});

	const goalTooltip = $("#goalTooltip");
	// On hovering a goal square
	$("#bingo td img").hover(function()
	{
		goalTooltip.show();
	},function()
	{
		// After hovering, hide the tooltip again
		goalTooltip.hide();
	});

	// Move the tooltip with the mouse
	$(document).mousemove(function(e)
	{
		var x = e.pageX + 2;
		var y = e.pageY + 2;
		var width = goalTooltip.outerWidth() + 25;
		var height = goalTooltip.height() + 50;
		var maxX = $(window).width() + window.pageXOffset;
		var maxY = $(window).height() + window.pageYOffset;
		if (x + width > maxX) {
			x = maxX - width;
		}
		if (y + height > maxY) {
			y = y - height;
		}
		goalTooltip.css({left:x, top:y});
	});

	bingoSquares.hover(function(e)
	{
		hoveredSquare = $(this);
		// Fill the #goalTooltip with the content from the goal
		var tooltipImg = hoveredSquare.attr(TOOLTIP_IMAGE_ATTR_NAME);
		// If tooltip is a local image include the file structure
		if (tooltipImg.length > 1 && !tooltipImg.includes("http"))
		{
			tooltipImg = TOOLTIP_FOLDER_STRUCTURE + tooltipImg;
		}
		var tooltipText = hoveredSquare.attr(TOOLTIP_TEXT_ATTR_NAME);
		$("#tooltipimg").attr('src', tooltipImg);
		$("#tooltipimg").toggle(tooltipImg != "");
		$("#tooltiptext").text(tooltipText);
	},function(e)
	{
		hoveredSquare = null;
	});
	const SHORTCUT_COLOURS = {
		48: DEFAULT_SQUARE_CLASS_NAME,
		96: DEFAULT_SQUARE_CLASS_NAME, // Numpad
		49: "bluesquare",
		97: "bluesquare",
		50: "greensquare",
		98: "greensquare",
		51: "redsquare",
		99: "redsquare",
		52: "yellowsquare",
		100: "yellowsquare",
		53: "cyansquare",
		101: "cyansquare",
		54: "brownsquare",
		102: "brownsquare",
		81 /* Q */: DEFAULT_SQUARE_CLASS_NAME
	};
	$(document).on("keydown", function(e)
	{
		if (hoveredSquare && e.which in SHORTCUT_COLOURS)
		{
			setSquareColor(hoveredSquare, SHORTCUT_COLOURS[e.which]);
		}
		if (e.keyCode == 27 /* Esc */)
		{
			toggleOptionsMenu();
			closeSaveAndLoadMenu();
		}
	});

	fillVersionSelection();
	$("#version_selection").change(function() {
		changeVersion($(this).val());
	});

	$("#options-toggle-button").click(function() {
		toggleOptionsMenu();
	});

	window.onpopstate = function(event)
	{
		loadSettings();
	};

	loadSettings();

	// Popout window detection
	if (window.opener && !STREAMER_MODE)
	{
		// Scroll down enough to show just the bingo sheet
		window.scrollTo(0, 120);
		$("#Popoutbutton").css("display", "none");
	}

	templateLoadSlots();
	populateLoadSlots();
});

function toggleOptionsMenu()
{
	$("#bingo-box").toggleClass(SHOW_OPTIONS_MENU_CLASS_NAME);
}
function showOptionsMenu()
{
	$("#bingo-box").addClass(SHOW_OPTIONS_MENU_CLASS_NAME);
}
function hideOptionsMenu()
{
	$("#bingo-box").removeClass(SHOW_OPTIONS_MENU_CLASS_NAME);
}

function getColourClass(square)
{
	return ALL_COLOURS.find(c => square.hasClass(c));
}

function nextColour(square)
{
	return anotherColour(square, 1);
}

function prevColour(square)
{
	return anotherColour(square, -1);
}

function anotherColour(square, increment)
{
	const colourSelection = COLOUR_SELECTIONS[COLOURCOUNT];
	const currColour = getColourClass(square);
	const currIndex = colourSelection.indexOf(currColour);
	if (currIndex == -1)
	{
		// default to second colour
		return colourSelection[1];
	}
	const nextIndex = (colourSelection.length + currIndex + increment) % colourSelection.length;
	return colourSelection[nextIndex];
}

function loadSettings()
{
	getSettingsFromURL();
	getSettingsFromLocalStorage();
}

function getSettingsFromURL()
{
	/**
	 * URL Format: ?s=[difficulty]-[hideTable]_[seed]
	 *
	 * The seed should always be last, so in order to be able to add more settings,
	 * settings and the seed are separated from eachother.
	 */
	let urlSettings = gup("s");
	if(urlSettings !== null) {
		var split = urlSettings.split("_");
		if (split.length == 2)
		{
			var settings = split[0].split("-");
			SEED = split[1];

			DIFFICULTY = parseInt(settings[0]);
			HIDDEN = settings[1] == "1";
			STREAMER_MODE = settings[2] == "1";
			var selectedVersion = settings[3];
		}
	}

	// Set default values
	if (isNaN(DIFFICULTY) || DIFFICULTY < 1 || DIFFICULTY > 5)
	{
		DIFFICULTY = 3;
	}

	VERSION = getVersion(selectedVersion);
	if (VERSION == undefined) {
		VERSION = getVersion(LATEST_VERSION);
	}

	// If there isn't a seed, make a new one
	if (!SEED)
	{
		newSeed(false);
	}

	// Grab the layout setting from the URL
	LAYOUT = gup( 'layout' );

	if (LAYOUT == "set")
	{
		// Set the layout settings' text
		// document.getElementById("whatlayout").innerHTML="Set Layout";
	}
	else
	{
		LAYOUT = "random";
		// document.getElementById("whatlayout").innerHTML="Random Layout";
	}

	// Debug: If the URL contains "&d" or "&diff", append the difficulty to the goal name
	DEBUG_SHEET = (gup('d') !== null || gup('diff') !== null);

	updateHidden();
	updateStreamerMode();
	updateDifficulty();
	updateVersion();
	generateNewSheet();
}

function getSettingsFromLocalStorage()
{
	const savedColourSymbols = localStorage.getItem(COLOUR_SYMBOLS_SETTING_NAME);
	if (savedColourSymbols != null)
	{
		COLOURSYMBOLS = savedColourSymbols == "true" ? true : false;
	}
	updateColourSymbols();

	const savedColourCount = localStorage.getItem(COLOUR_COUNT_SETTING_NAME);
	if (savedColourCount != null)
	{
		changeColourCount(savedColourCount);
	}
	else
	{
		// if not stored, then just use the default
		updateColourCount();
	}

	const savedColourTheme = localStorage.getItem(COLOUR_THEME_SETTING_NAME);
	if (savedColourTheme != null)
	{
		DARK_MODE = (savedColourTheme == DARK_MODE_CLASS_NAME);
	}
	else if (window.matchMedia) // Attempt to get the user's OS/Browser theme if  no local storage setting is found
	{
		DARK_MODE = window.matchMedia('(prefers-color-scheme: dark)').matches;
	}
	updateDarkMode(false);
}

/*
 * Call given function for every square. The given function shall take two arguments:
 * 1. an index
 * 2. the square's element
 */
function forEachSquare(f)
{
	for (var i = 0; i < SQUARE_COUNT; i++)
	{
		var slotId = "#slot"+ (i + 1);
		var square = $(slotId);
		f(i, square);
	}
}

function generateNewSheet()
{
	let seedInput = $(".seed-input");
	seedInput.val(SEED);
	seedInput.attr("size", Math.max(SEED.length, 5));

	// Reset the random seed
	Math.seedrandom(SEED);

	// Reset every goal square
	forEachSquare((i, square) => {
		square.contents().filter(function(){ return this.nodeType == Node.TEXT_NODE || this.nodeName == "BR"; }).remove();
		setSquareColor(square, DEFAULT_SQUARE_CLASS_NAME);
	});

	var result = VERSION.generator(LAYOUT, DIFFICULTY, VERSION.goals);

	forEachSquare((i, square) => {
		var goal = result[i];

		if (!goal) {
			square.append("✖");
			setSquareColor(square, "redsquare");
		}
		else {
			square.append(goal.generatedName);

			square.attr(TOOLTIP_TEXT_ATTR_NAME, goal.tooltiptext || "");
			square.attr(TOOLTIP_IMAGE_ATTR_NAME, goal.tooltipimg || "");

			// Debug: If the URL contains "&d", append the difficulty to the goal name
			//if (gup('d') !== null || gup('diff') !== null)
			if (DEBUG_SHEET)
			{
				square.append("<br>diff: " + goal.difficulty);
			}

			if (goal.tags && goal.tags.findIndex(t => t.name == "Never") != -1)
			{
				setSquareColor(square, NEVER_HIGHLIGHT_CLASS_NAME);
			}
		}
	});
}

// Create a new seed
function newSeed(remakeSheet)
{
	// Remove the current seed
	Math.seedrandom();

	// Making a new 5 digit seed
	SEED = Math.floor((Math.random() * 90000) + 10000).toString();

	// Set the new seed
	Math.seedrandom(SEED);

	// Update the seed in the URL
	pushNewUrl();

	// If a new sheet is required, generate one
	if (remakeSheet)
	{
		generateNewSheet();
	}
}

// Change the layout
function changeLayout()
{
	// Change the layout based on the current layout
	if (LAYOUT == "set")
	{
		LAYOUT = "random";

		// Update the button's text
		document.getElementById("whatlayout").innerHTML="Set Layout";
	}
	else
	{
		LAYOUT = "set";

		document.getElementById("whatlayout").innerHTML="Random Layout";
	}

	// Update the URL
	pushNewUrl();

	// Generate a new sheet
	generateNewSheet();
}

function updateHidden()
{
	const box = $("#bingo-box");
	const hiddenCssClassName = "hidden";
	const button = document.getElementById("ishidden");
	if (HIDDEN)
	{
		// Hide the goals and change the hidden setting's text
		box.addClass(hiddenCssClassName);
		button.innerHTML = "Show Table";
	}
	else
	{
		HIDDEN = false;
		// Show the goals and change the hidden setting's text
		box.removeClass(hiddenCssClassName);
		button.innerHTML = "Hide Table";
	}
}

function toggleHidden()
{
	// Invert HIDDEN setting, then update
	HIDDEN = !HIDDEN;
	updateHidden();
	pushNewUrl();
}

function popoutBingoCard(){
	window.open(window.location.href, "_blank", "toolbar=no, resizeable=no, titlebar=no, status=no, menubar=no, scrollbars=no, width=745, height=715");
}

function toggleStreamerMode()
{
	STREAMER_MODE = !STREAMER_MODE;
	$(".dropdown").hide();
	hideOptionsMenu();
	updateStreamerMode();
	pushNewUrl();
}

function updateStreamerMode()
{
	const cssClassName = "streamer-mode";
	const body = $("body");
	if (STREAMER_MODE)
	{
		body.addClass(cssClassName);
	}
	else
	{
		body.removeClass(cssClassName);
	}
}

// TODO reduce code duplication between sliders
function updateDifficulty()
{
	$(".difficulty-text").text(DIFFICULTYTEXT[DIFFICULTY - 1]);
	$("#difficultyRange").val(DIFFICULTY);
}

function changeDifficulty(value)
{
	DIFFICULTY = parseInt(value);
	updateDifficulty();
	generateNewSheet();
	pushNewUrl();
}

function changeSeed(value)
{
	SEED = value;
	generateNewSheet();
	pushNewUrl();
}

function updateColourCount()
{
	$(".colourCount-text").text(COLOURCOUNTTEXT[COLOURCOUNT]);
	$("#colourCountRange").val(COLOURCOUNT);
}

function changeColourCount(value)
{
	const maybeColourCount = parseInt(value);
	if (isNaN(maybeColourCount))
	{
		COLOURCOUNT = 1;
	}
	else
	{
		COLOURCOUNT = Math.max(0, Math.min(COLOUR_SELECTIONS.length - 1, maybeColourCount));
	}
	updateColourCount();
	pushNewLocalSetting(COLOUR_COUNT_SETTING_NAME, COLOURCOUNT);
}

function updateColourSymbols()
{
	$(".symbol").css("display", !COLOURSYMBOLS ? "none" : "inline");
	const button = document.getElementById("colourSymbols");
	button.innerHTML = COLOURSYMBOLS ? "Hide Symbols" : "Show Symbols";
}

function toggleColourSymbols()
{
	COLOURSYMBOLS = !COLOURSYMBOLS;
	updateColourSymbols();
	pushNewLocalSetting(COLOUR_SYMBOLS_SETTING_NAME, COLOURSYMBOLS);
}

function updateDarkMode(transition)
{
	const smoothTransitionClassName = "smooth-transition";
	const body = $("body");

	if (transition)
	{
		body.addClass(smoothTransitionClassName);
	}

	if (DARK_MODE)
	{
		body.addClass(DARK_MODE_CLASS_NAME);
	}
	else
	{
		body.removeClass(DARK_MODE_CLASS_NAME);
	}
	$(".dark-mode-button").text(DARK_MODE ? "Light Mode" : "Dark Mode");
	setTimeout(() => {
		body.removeClass(smoothTransitionClassName);
	}, 1000);
}

function toggleDarkMode()
{
	DARK_MODE = !DARK_MODE;
	updateDarkMode(true);
	pushNewLocalSetting(COLOUR_THEME_SETTING_NAME, DARK_MODE ? DARK_MODE_CLASS_NAME : "light");
}

function pushNewUrl()
{
	var hidden = HIDDEN ? "1" : "0";
	var streamerMode = STREAMER_MODE ? "1" : "0";
	var debug = DEBUG_SHEET ? "&d" : "";

	window.history.pushState('', "Sheet", "?s=" + DIFFICULTY + "-" + hidden + "-" + streamerMode + "-" + VERSION.id + "_" + SEED + debug);
}

function pushNewLocalSetting(name, value)
{
	try
	{
		localStorage.setItem(name, value.toString());
	}
	catch (ignored)
	{
	}
}

function getVersion(versionId)
{
	for (var i=0; i<VERSIONS.length; i++)
	{
		if (versionId == VERSIONS[i].id)
		{
			return VERSIONS[i];
		}
	}
	return undefined;
}

function updateVersion()
{
	$("#version_selection").val(VERSION.id);
	$("#versions-toggle-button").html(VERSION.name);
	$(".versionText").html(VERSION.name);
	if (VERSION.id != LATEST_VERSION && VERSION.stable)
	{
		$("#version_notice").css("display", "block");
	} else {
		$("#version_notice").css("display", "none");
	}
	if (!VERSION.stable) {
		$("#version_notice_unstable").css("display", "block");
	} else {
		$("#version_notice_unstable").css("display", "none");
	}
}

function changeVersion(versionId)
{
	VERSION = getVersion(versionId);
	generateNewSheet();
	updateVersion();
	pushNewUrl();
}

function fillVersionSelection()
{
	VERSIONS.forEach(function(value) {
		var label = value.name;
		if (value.stable)
		{
			label += " (stable)";
		}
		else
		{
			label += " (WIP)";
		}
		$("#version_selection").append($('<option></option>').val(value.id).html(label))
		var button = $('<button class="button version-button"></button>');
		$("#versions-dropdown-main").append(button);
		button.html(label);
		button.click(function() {
			changeVersion(value.id);
		});
	});
}

function setSquareColor(square, colorClass)
{
	square.removeClass(ALL_COLOURS);
	square.addClass(colorClass);
}

function copySeedToClipboard(id, event)
{
	var id = "#"+id;
	if (navigator.clipboard)
	{
		navigator.clipboard.writeText($(id).val()).then(ignored => {
			showCopiedTooltip(event);
		}, err => {
			console.error('Async: Could not copy text: ', err);
			alert("Failed to copy seed to clipboard :/");
		});
	}
	else
	{
		$(id).select();

		try
		{
			var successful = document.execCommand('copy');
			if (!successful)
			{
				alert("Failed to copy seed to clipboard :/");
			}
			else
			{
				showCopiedTooltip(event);
			}
		}
		catch (err)
		{
			alert("Failed to copy seed to clipboard :/");
		}

		// Deselect
		$(id).blur();
	}
}

function showCopiedTooltip(event)
{
	const offset = $(event.target).offset();
	const x = offset.left + event.target.offsetWidth;
	const y = offset.top;
	$("#copiedTooltip").css({left:x, top: y})
		.css("display", "block")
		.delay(100)
		.fadeOut(1000, () => {
			$(this).hide().fadeIn(0);
		});
}

function createGoalExport()
{
	let result = [];
	forEachSquare((i, square) => {
		result.push({
			name: square.text(),
			tooltip: square.attr(TOOLTIP_TEXT_ATTR_NAME)
		});
	});
	$("#export textarea").text(JSON.stringify(result));
	$("body").addClass(SHOW_EXPORT_CLASS_NAME);
}

function hideGoalExport()
{
	$("body").removeClass(SHOW_EXPORT_CLASS_NAME);
}

// Made this a function for readability and ease of use
function getRandomInt(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
function gup( name )
{
	let params = new URLSearchParams(document.location.search);
	let result = params.get(name);
	return result;
}

// random source: www.engin33r.net/bingo/random.js
(function(j,i,g,m,k,n,o){function q(b){var e,f,a=this,c=b.length,d=0,h=a.i=a.j=a.m=0;a.S=[];a.c=[];for(c||(b=[c++]);d<g;)a.S[d]=d++;for(d=0;d<g;d++)e=a.S[d],h=h+e+b[d%c]&g-1,f=a.S[h],a.S[d]=f,a.S[h]=e;a.g=function(b){var c=a.S,d=a.i+1&g-1,e=c[d],f=a.j+e&g-1,h=c[f];c[d]=h;c[f]=e;for(var i=c[e+h&g-1];--b;)d=d+1&g-1,e=c[d],f=f+e&g-1,h=c[f],c[d]=h,c[f]=e,i=i*g+c[e+h&g-1];a.i=d;a.j=f;return i};a.g(g)}function p(b,e,f,a,c){f=[];c=typeof b;if(e&&c=="object")for(a in b)if(a.indexOf("S")<5)try{f.push(p(b[a],e-1))}catch(d){}return f.length?f:b+(c!="string"?"\0":"")}function l(b,e,f,a){b+="";for(a=f=0;a<b.length;a++){var c=e,d=a&g-1,h=(f^=e[a&g-1]*19)+b.charCodeAt(a);c[d]=h&g-1}b="";for(a in e)b+=String.fromCharCode(e[a]);return b}i.seedrandom=function(b,e){var f=[],a;b=l(p(e?[b,j]:arguments.length?b:[(new Date).getTime(),j,window],3),f);a=new q(f);l(a.S,j);i.random=function(){for(var c=a.g(m),d=o,b=0;c<k;)c=(c+b)*g,d*=g,b=a.g(1);for(;c>=n;)c/=2,d/=2,b>>>=1;return(c+b)/d};return b};o=i.pow(g,m);k=i.pow(2,k);n=k*2;l(i.random(),j)})([],Math,256,6,52);

function openSaveAndLoadMenu() {
	$("#savenloadmenu").css('display', 'flex');
	$("#bingo").css('filter', 'blur(0.1em)')
}

function closeSaveAndLoadMenu() {
	$("#savenloadmenu").css('display', 'none');
	$("#bingo").css('filter', '')
}

function saveProgress(slotId) {
	var difficulty = DIFFICULTY;
	var version = VERSION.id;
	var seed = SEED;
	var lastModified = new Date().toISOString();

	var squares = [];
	var squareElements = document.querySelectorAll("#bingo td");

	squareElements.forEach(cell => {
		squares.push({
			id: cell.id,
			classes: cell.className.split(" ").filter(Boolean)
		});
	});

	const progress = { difficulty, version, seed, squares, lastModified };
	console.log(progress);
	localStorage.setItem(slotId, JSON.stringify(progress));
	setSlotTitle(slotId, progress)
}

function loadProgress(slotId) {
	let storageContent = localStorage.getItem(slotId);
	if (storageContent === null) {
		console.error(`No content for slot ${slotId} in local storage found`)
		return
	}
	var progress = JSON.parse(storageContent);
	console.log(progress);
	changeSeed(progress.seed);
	changeDifficulty(progress.difficulty);
	changeVersion(progress.version);

	progress.squares.forEach(item => {
		const element = document.getElementById(item.id);
		element.className = item.classes.join(" ");
	});
}

function deleteProgress(slotId) {
	localStorage.removeItem(slotId);
	$(`#load-slot-${slotId} #slot-title`).html(`Slot ${slotId}`)
}

/**
 * Clones the list of load slots from the template to add them to the UI
 **/
function templateLoadSlots() {
	var menuContainer = $('.savenloadmenu');
	var template = document.getElementById('load-slot-template');
	var count = 7;

	for (var i = 1; i <= count; i++) {
		var clone = $(template.content.cloneNode(true));

		clone
		.find('#slot-title')
		.text(`Slot ${i}`);

		clone
		.add(clone.find('.row'))
		.attr('id', 'load-slot-' + i)
		.attr('slot', i);

		menuContainer.append(clone);
	}
}

/**
 * Actually populates the slots with the data in local storage
 **/
function populateLoadSlots() {
	Object.keys(localStorage).forEach(key => {
		var progress = JSON.parse(localStorage.getItem(key));
		setSlotTitle(key, progress)
	});
}

function setSlotTitle(slotId, progress) {
	var versionText = getVersion(progress.version).name
	var difficultyText = DIFFICULTYTEXT[progress.difficulty - 1]
	var seed = progress.seed
	$(`#load-slot-${slotId} #slot-title`).html(`${seed} ${difficultyText} ${versionText}<br>${progress.lastModified}`)
}