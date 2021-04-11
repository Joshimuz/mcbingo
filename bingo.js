
var DIFFICULTY;
var SEED;
var LAYOUT;
var HIDDEN;
var STREAMER_MODE;
var VERSION;
var DIFFICULTYTEXT = ["Very Easy", "Easy", "Medium", "Hard", "Very Hard"];

const ALL_COLOURS = ["", "bluesquare", "greensquare", "redsquare", "yellowsquare", "pinksquare", "brownsquare"];
var COLOUR_SELECTIONS = [
	["", "greensquare"],
	["", "bluesquare", "greensquare", "redsquare"],
	ALL_COLOURS
];
var COLOURCOUNT = 1; // used as an index in COLOUR_SELECTIONS and COLOURCOUNTTEXT
var COLOURCOUNTTEXT = [ "Green only", "Blue, Green, Red", "6 Colours"];
var COLOURSYMBOLS = false;
const NEVER_HIGHLIGHT_CLASS_NAME = "greensquare";
const SHEET_PROGRESS_KEY = "bingoSheetProgress";
const SHEET_PROGRESS_SAVE_LIMIT = 5;
const URL_PARAM_PROGRESS = "progress";
const WAS_SAVE_POPUP_OPENED_KEY = "wasAutosavePopupOpened";

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
	{ id:"dev", name:"dev [1.16.5]", 	goals: bingoList_v5, generator: generator_v3, stable: false }, // Dev version
];

// This is the newest stable version that users not specifying a version will get
var LATEST_VERSION = "4";

const SQUARE_COUNT = 25;
const NODE_TYPE_TEXT = 3;
const TOOLTIP_TEXT_ATTR_NAME = "data-tooltiptext";
const TOOLTIP_IMAGE_ATTR_NAME = "data-tooltipimg";
const COLOUR_COUNT_SETTING_NAME = "bingoColourCount";
const COLOUR_SYMBOLS_SETTING_NAME = "bingoColourSymbols";
const SHOW_OPTIONS_MENU_CLASS_NAME = "show-options";
const SHOW_POPUP_MENU_CLASS_NAME = "show-popup";
const OPTION_MENU_BEHAVIOUR_ATTR_NAME = "data-keep-options-open";

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
		if (
			// Hide if click was anywhere BUT on a pause menu
			event.target.id != "options-toggle-button" 
			&& ! (
				// anywhere that doesn't have attribute to overwrite default behaviour
				event.target.hasAttribute(OPTION_MENU_BEHAVIOUR_ATTR_NAME)
				// or parents of target element doesn't have attribute
				|| $(event.target).closest('['+OPTION_MENU_BEHAVIOUR_ATTR_NAME+']').length
			)
		) {
			hideOptionsMenu();
		}
	}
	if (className.includes("pause-menu")) {
		// hide if clicking on pause-menu layout, but not on buttons/sliders
		hideOptionsMenu();
	}
});

$(document).ready(function()
{
	// Set the background to a random image
	document.body.style.backgroundImage = "url('Backgrounds/background" + (Math.floor(Math.random() * 10) + 1) + ".jpg')";

	// By default hide the tooltips
	$(".tooltip").hide();

	// On clicking a goal square
	const bingoSquares = $("#bingo td");
	bingoSquares.click(function()
	{
		const square = $(this);
		setSquareColor(square, nextColour(square), true);
	});
	bingoSquares.contextmenu(function()
	{
		const square = $(this);
		setSquareColor(square, prevColour(square), true);
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
		var tooltipText = hoveredSquare.attr(TOOLTIP_TEXT_ATTR_NAME);
		$("#tooltipimg").attr('src', tooltipImg);
		$("#tooltipimg").toggle(tooltipImg != "");
		$("#tooltiptext").text(tooltipText);
	},function(e)
	{
		hoveredSquare = null;
	});
	const SHORTCUT_COLOURS = {
		48: "",
		96: "", // Numpad
		49: "bluesquare",
		97: "bluesquare",
		50: "greensquare",
		98: "greensquare",
		51: "redsquare",
		99: "redsquare",
		52: "yellowsquare",
		100: "yellowsquare",
		53: "pinksquare",
		101: "pinksquare",
		54: "brownsquare",
		102: "brownsquare",
		81 /* Q */: ""
	};
	$(document).on("keydown", function(e)
	{
		if (hoveredSquare && e.which in SHORTCUT_COLOURS)
		{
			setSquareColor(hoveredSquare, SHORTCUT_COLOURS[e.which], true);
		}
		if (e.keyCode == 27 /* Esc */)
		{
			toggleOptionsMenu();
		}
	});

	fillVersionSelection();
	$("#version_selection").change(function() {
		changeVersion($(this).val());
	});

	$(".pause-menu-close").click(function() {
		hideOptionsMenu();
	});
	$("#options-toggle-button").click(function() {
		toggleOptionsMenu();
	});

	window.onpopstate = function(event)
	{
		loadSettings();
	};

	loadSettings();
});

function toggleOptionsMenu()
{
	$("#bingo-box").toggleClass(SHOW_OPTIONS_MENU_CLASS_NAME);
	closePopup('#urlWithProgress');
}
function showOptionsMenu()
{
	$("#bingo-box").addClass(SHOW_OPTIONS_MENU_CLASS_NAME);
}
function hideOptionsMenu()
{
	$("#bingo-box").removeClass(SHOW_OPTIONS_MENU_CLASS_NAME);
	closePopup('#urlWithProgress');
}

function getColourClass(square)
{
	return ALL_COLOURS.find(c => square.hasClass(c));
}

function getColourClassIndex(square)
{
	return ALL_COLOURS.findIndex(c => square.hasClass(c));
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
	const currIndex = getColourClassIndex(square);
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
	if (! loadProgressFromURL()) {
		loadProgressFromLocalStorage();
	}
}

function getSettingsFromURLSplitted(url = null)
{
	/**
	 * URL Format: ?s=[difficulty]-[hideTable]_[seed]
	 *
	 * The seed should always be last, so in order to be able to add more settings,
	 * settings and the seed are separated from eachother.
	 */
	var seed, difficulty, version, hidden, streamerMode;

	if (url == null) {
		url = gup("s");
	}
	var split = url.split("_");
	if (split.length == 2) {
		var settings = split[0].split("-");
		seed = split[1];

		difficulty = parseInt(settings[0]);
		hidden = settings[1] == "1";
		streamerMode = settings[2] == "1";
		var selectedVersion = settings[3];
	}

	// Set default values
	if (isNaN(difficulty) || difficulty < 1 || difficulty > 5)
	{
		difficulty = 3;
	}

	version = getVersion(selectedVersion);
	if (version == undefined) {
		version = getVersion(LATEST_VERSION);
	}

	return [seed, difficulty, version, hidden, streamerMode];
}

function getSettingsFromURL()
{
	[SEED, DIFFICULTY, VERSION, HIDDEN, STREAMER_MODE] = getSettingsFromURLSplitted();

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
	$(".seed_for_copying").val(SEED);
	$(".seed_for_copying").attr("size", SEED.length);

	// Reset the random seed
	Math.seedrandom(SEED);

	// Reset every goal square
	forEachSquare((i, square) => {
		square.contents().filter(function(){ return this.nodeType == NODE_TYPE_TEXT; }).remove();
		setSquareColor(square, "");
	});

	var result = VERSION.generator(LAYOUT, DIFFICULTY, VERSION.goals);

	forEachSquare((i, square) => {
		var goal = result[i];

		//square.append(goal.generatedName + " " + goal.difficulty);
		square.append(goal.generatedName);

		square.attr(TOOLTIP_TEXT_ATTR_NAME, goal.tooltiptext || "");
		square.attr(TOOLTIP_IMAGE_ATTR_NAME, goal.tooltipimg || "");

		if (goal.tags && goal.tags.findIndex(t => t.name == "Never") != -1)
		{
			setSquareColor(square, NEVER_HIGHLIGHT_CLASS_NAME);
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
	pushNewUrl(generateNewUrlParamWithProgress());
}

function popoutBingoCard(){
	window.open(window.location.href, "_blank", "toolbar=no, status=no, menubar=no, scrollbars=no, width=745, height=715");
}

function toggleStreamerMode()
{
	STREAMER_MODE = !STREAMER_MODE;
	$(".dropdown").hide();
	hideOptionsMenu();
	updateStreamerMode();
	pushNewUrl(generateNewUrlParamWithProgress());
	updateCurrentSheetProgress();
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

function toggleColourSymbols(value)
{
	COLOURSYMBOLS = !COLOURSYMBOLS;
	updateColourSymbols();
	pushNewLocalSetting(COLOUR_SYMBOLS_SETTING_NAME, COLOURSYMBOLS);
}

function generateNewUrlParam()
{
	var hidden = HIDDEN ? "1" : "0";
	var streamerMode = STREAMER_MODE ? "1" : "0";
	return DIFFICULTY + "-" + hidden + "-" + streamerMode + "-" + VERSION.id + "_" + SEED;
}

function generateNewUrlParamWithProgress(squareProgress = null)
{
	var urlParams = "?s=" + generateNewUrlParam();
	if (squareProgress == null && gup(URL_PARAM_PROGRESS)) {
		squareProgress = generateSquareProgress();
	}
	if (squareProgress) {
		urlParams += "&progress=" + JSON.stringify(squareProgress);
	}

	return urlParams;
}

function pushNewUrl(url = null)
{
	if (url == null) {
		url = "?s=" + generateNewUrlParam();
	}
	window.history.pushState('', "Sheet", url);
}

function pushNewLocalSetting(name, value)
{
	try
	{
		localStorage.setItem(name, value.toString());
	}
	catch (ignored)
	{
		return false;
	}
	return true;
}

function isLocalStorageIsAvailable()
{
	if (typeof localStorage !== 'undefined') {
		try {
			localStorage.setItem('feature_test', 'yes');
			if (localStorage.getItem('feature_test') === 'yes') {
				localStorage.removeItem('feature_test');
				return true;
			}
		} catch(e) {
		}
	}
	return false;
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
	updateCurrentSheetProgress();
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

function setSquareColor(square, colorClass, isTriggeredByUser = false)
{
	ALL_COLOURS.forEach(c => square.removeClass(c));
	square.addClass(colorClass);
	if (isTriggeredByUser) {
		updateCurrentSheetProgress();
	}
}

function loadBingoProgress(sheetToLoad)
{
	/* 
	 * Expected input for sheetToLoad is [1,3,2,5,..]
	 * where index of array is numeric value of square id
	 * and cell value is index of ALL_COLOURS 
	 */
	if (typeof sheetToLoad !== 'undefined' && sheetToLoad.length) {
		forEachSquare((i, square) => {
			$.each(ALL_COLOURS, function(index, colorClass){
				square.removeClass(colorClass);
			});
			square.addClass(ALL_COLOURS[sheetToLoad[i]]);
		});
	}
}

var sheetProgressDebounce = null;
function updateCurrentSheetProgress()
{
	if(sheetProgressDebounce) clearTimeout(sheetProgressDebounce);
	sheetProgressDebounce = setTimeout(function() {
			updateCurrentSheetProgressDebounced()
	}, 100);
}

function updateCurrentSheetProgressDebounced()
{
	if (! isLocalStorageIsAvailable()) {
		return;
	}

	processSheetAndStoreAs(getKeyForCurrentProgress());
}

function processSheetAndStoreAs(localStorageKey)
{
	var squares = generateSquareProgress();
	var haveMarkedSquares = squares.reduce(function(a,b) { return !!a | !!b; });
	result = {
		squares: squares,
		timestamp: Date.now()
	};
	
	// save only if current sheet have marked squares or already in storage
	if (haveMarkedSquares || localStorage.getItem(localStorageKey)) {
		pushNewLocalSetting(localStorageKey, JSON.stringify(result));
	}
	// update &progress param is such exists
	if (gup(URL_PARAM_PROGRESS)) {
		pushNewUrl(generateNewUrlParamWithProgress(squares));
	}
	checkAndRemoveOldSaves();
}

function checkAndRemoveOldSaves()
{
	var saves = getSaves();
	if (saves.length > SHEET_PROGRESS_SAVE_LIMIT) {
		var oldestSave = saves.pop();
		if (oldestSave) {
			localStorage.removeItem(oldestSave.key);
		}
	}
}

function getSaves()
{
	var saves = [];
	for (var i = 0; i < localStorage.length; i++) {
		key = localStorage.key(i);
		if (key.slice(0, SHEET_PROGRESS_KEY.length) === SHEET_PROGRESS_KEY) {
			saves.push({
				key: key,
				data: JSON.parse(localStorage.getItem(key))
			});
		}
	}

	saves.sort(function(a, b) {
		// Compare the 2 dates
		if (a.data.timestamp < b.data.timestamp) return 1;
		if (a.data.timestamp > b.data.timestamp) return -1;
		return 0;
	});
	return saves;
}

function generateSquareProgress()
{
	var squares = [];	
	forEachSquare((i, square) => {
		var classIndex = getColourClassIndex(square);
		squares.push(classIndex !== -1 ? classIndex : 0);
	});
	return squares;
}

function loadProgressFromLocalStorage()
{
	if (! isLocalStorageIsAvailable()) {
		return;
	}

	var latestSheet = JSON.parse(localStorage.getItem(getKeyForCurrentProgress()));
	if (latestSheet) {
		loadBingoProgress(latestSheet.squares);
	}
}

function loadProgressFromURL()
{
	var progress = gup(URL_PARAM_PROGRESS);
	if (progress) {
		loadBingoProgress(JSON.parse(progress));
		return true;
	}

	return false;
}


function getKeyForCurrentProgress() {
	return [SHEET_PROGRESS_KEY, VERSION.id, DIFFICULTY, SEED].join("-"); 
}

function copyToClipboard(id, event, isAsFixed)
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
				showCopiedTooltip(event, isAsFixed);
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

function showCopiedTooltip(event, isAsFixed = false)
{
	var x = 0;
	var y = 0;
	if (isAsFixed) {
		$("#copiedTooltip").addClass('fixed');
		x = event.target.getBoundingClientRect().x + event.target.getBoundingClientRect().width;
		y = event.target.getBoundingClientRect().y;
	} else {
		$("#copiedTooltip").removeClass('fixed');
		x = event.target.offsetLeft + event.target.offsetWidth;
		y = event.target.offsetTop;
	}
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
	openPopup("#export");
}

function showLinkWithProgress(element)
{
	var urlWithProgress = generateNewUrlParamWithProgress(generateSquareProgress());
	pushNewUrl(urlWithProgress);
	console.log(element != null);
	if (! localStorage.getItem(WAS_SAVE_POPUP_OPENED_KEY)) {
		$('.js-save-progress-limit').text(SHEET_PROGRESS_SAVE_LIMIT);
		$('#bingo-box').addClass(SHOW_POPUP_MENU_CLASS_NAME);
		openPopup("#urlWithProgress");
		pushNewLocalSetting(WAS_SAVE_POPUP_OPENED_KEY, true);
	} else if(element != null) {
		$(element).addClass('success--ok');
		setTimeout(function() {
			$(element).removeClass('success--ok');
		}, 1000);
	}
}

function openPopup(popup)
{
	$(popup).addClass('opened');
}

function closePopup(popup)
{
	$(popup).removeClass('opened');
	$('#bingo-box').removeClass(SHOW_POPUP_MENU_CLASS_NAME);
}

function closePopupByButton(buttonElement)
{
	closePopup($(buttonElement).closest('.popup'));
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
	if (result == null)
	{
		return "";
	}
	else
	{
		return result;
	}
}

// random source: www.engin33r.net/bingo/random.js
(function(j,i,g,m,k,n,o){function q(b){var e,f,a=this,c=b.length,d=0,h=a.i=a.j=a.m=0;a.S=[];a.c=[];for(c||(b=[c++]);d<g;)a.S[d]=d++;for(d=0;d<g;d++)e=a.S[d],h=h+e+b[d%c]&g-1,f=a.S[h],a.S[d]=f,a.S[h]=e;a.g=function(b){var c=a.S,d=a.i+1&g-1,e=c[d],f=a.j+e&g-1,h=c[f];c[d]=h;c[f]=e;for(var i=c[e+h&g-1];--b;)d=d+1&g-1,e=c[d],f=f+e&g-1,h=c[f],c[d]=h,c[f]=e,i=i*g+c[e+h&g-1];a.i=d;a.j=f;return i};a.g(g)}function p(b,e,f,a,c){f=[];c=typeof b;if(e&&c=="object")for(a in b)if(a.indexOf("S")<5)try{f.push(p(b[a],e-1))}catch(d){}return f.length?f:b+(c!="string"?"\0":"")}function l(b,e,f,a){b+="";for(a=f=0;a<b.length;a++){var c=e,d=a&g-1,h=(f^=e[a&g-1]*19)+b.charCodeAt(a);c[d]=h&g-1}b="";for(a in e)b+=String.fromCharCode(e[a]);return b}i.seedrandom=function(b,e){var f=[],a;b=l(p(e?[b,j]:arguments.length?b:[(new Date).getTime(),j,window],3),f);a=new q(f);l(a.S,j);i.random=function(){for(var c=a.g(m),d=o,b=0;c<k;)c=(c+b)*g,d*=g,b=a.g(1);for(;c>=n;)c/=2,d/=2,b>>>=1;return(c+b)/d};return b};o=i.pow(g,m);k=i.pow(2,k);n=k*2;l(i.random(),j)})([],Math,256,6,52);
