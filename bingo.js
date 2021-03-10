
var DIFFICULTY;
var SEED;
var LAYOUT;
var HIDDEN;
var STREAMER_MODE;
var VERSION;
var DIFFICULTYTEXT = [ "Very Easy", "Easy", "Medium", "Hard", "Very Hard"];

const ALL_COLOURS = ["", "bluesquare", "greensquare", "redsquare", "yellowsquare", "pinksquare", "brownsquare"];
var COLOUR_SELECTIONS = [
	["", "greensquare"],
	["", "bluesquare", "greensquare", "redsquare"],
	ALL_COLOURS
];
var COLOURCOUNT = 1; // used as an index in COLOUR_SELECTIONS and COLOURCOUNTTEXT
var COLOURCOUNTTEXT = [ "Green only", "Blue, Green, Red", "6 Colours"];

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
	{ id:"dev", name:"dev [1.16.5]", 	goals: bingoList_v4, generator: generator_v3, stable: false }, // Dev version
];

// This is the newest stable version that users not specifying a version will get
var LATEST_VERSION = "3";

const SQUARE_COUNT = 25;
const NODE_TYPE_TEXT = 3;
const TOOLTIP_TEXT_ATTR_NAME = "data-tooltiptext";
const TOOLTIP_IMAGE_ATTR_NAME = "data-tooltipimg";
const COLOUR_COUNT_SETTING_NAME = "bingoColourCount";

// Dropdown menu handling.
$(document).click(function(event) {
	if (event.target.className.includes('dropdown-button')) {
		// if a button was clicked, toggle nearby dropdown
		$(event.target).siblings('.dropdown').toggle(100);
	} else {
		if (!$(event.target).closest(".dropdown-holder").length) {
			// Hide if click was anywhere BUT on a dropdown menu
			$('.dropdown').each(function() {
				$(this).hide(100);
			});
		}
	}
});

$(document).ready(function()
{
	// Set the background to a random image
	document.body.style.backgroundImage = "url('Backgrounds/background" + (Math.floor(Math.random() * 10) + 1) + ".jpg')";

	// By default hide the tooltip
	$("#tooltip").hide();

	$("#export").hide();

	// On clicking a goal square
	$("#bingo td").click(function()
	{
		const square = $(this);
		setSquareColor(square, nextColour(square));
	});

	// On hovering a goal square
	$("#bingo td img").hover(function()
	{
		$("#tooltip").show();
	},function()
	{
		// After hovering, hide the tooltip again
		$("#tooltip").hide();
	});

	// Move the tooltip with the mouse
	$(document).mousemove(function(e)
	{
		var x = e.pageX + 2;
		var y = e.pageY + 2;
		var width = $("#tooltip").outerWidth() + 25;
		var height = $("#tooltip").height() + 50;
		var maxX = $(window).width() + window.pageXOffset;
		var maxY = $(window).height() + window.pageYOffset;
		if (x + width > maxX) {
			x = maxX - width;
		}
		if (y + height > maxY) {
			y = y - height;
		}
		$("#tooltip").css({left:x, top:y});
	});

	$("#bingo td").hover(function(e)
	{
		hoveredSquare = $(this);
		// Fill the #tooltip with the content from the goal
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
		49: "bluesquare",
		50: "greensquare",
		51: "redsquare",
		52: "yellowsquare",
		53: "pinksquare",
		54: "brownsquare",
		81 /* Q */: ""
	};
	$(document).on("keydown", function(e)
	{
		if (hoveredSquare && e.which in SHORTCUT_COLOURS)
		{
			setSquareColor(hoveredSquare, SHORTCUT_COLOURS[e.which]);
		}
	});

	fillVersionSelection();
	$("#version_selection").change(function() {
		changeVersion($(this).val());
	});


	window.onpopstate = function(event)
	{
		loadSettings();
	};

	loadSettings();
});

function getColourClass(square)
{
	return ALL_COLOURS.find(c => square.hasClass(c));
}

function nextColour(square)
{
	const colourSelection = COLOUR_SELECTIONS[COLOURCOUNT];
	const currColour = getColourClass(square);
	const currIndex = colourSelection.indexOf(currColour);
	if (currIndex == -1)
	{
		// default to second colour
		return colourSelection[1];
	}
	const nextIndex = (currIndex + 1) % colourSelection.length;
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
	var split = gup("s").split("_");
	if (split.length == 2)
	{
		var settings = split[0].split("-");
		SEED = split[1];

		DIFFICULTY = parseInt(settings[0]);
		HIDDEN = settings[1] == "1";
		STREAMER_MODE = settings[2] == "1";
		var selectedVersion = settings[3];
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

	updateHidden();
	updateStreamerMode();
	updateDifficulty();
	updateVersion();
	generateNewSheet();
}

function getSettingsFromLocalStorage()
{
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
    window.open(window.location.href, "_blank", "toolbar=no, status=no, menubar=no, scrollbars=no, width=728, height=665");
}

function toggleStreamerMode()
{
	STREAMER_MODE = !STREAMER_MODE;
	$(".dropdown").hide();
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
	pushNewLocalSettings();
}

function pushNewUrl()
{
	var hidden = HIDDEN ? "1" : "0";
	var streamerMode = STREAMER_MODE ? "1" : "0";
	window.history.pushState('', "Sheet", "?s=" + DIFFICULTY + "-" + hidden + "-" + streamerMode + "-" + VERSION.id + "_" + SEED);
}

function pushNewLocalSettings()
{
	try
	{
		localStorage.setItem(COLOUR_COUNT_SETTING_NAME, COLOURCOUNT.toString());
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
	var mainButtonText;
	if (VERSION.id == 'dev') {
		mainButtonText = 'dev';
	} else {
		mainButtonText = "v" + VERSION.id;
	}
	$("#versions-toggle-button").html(mainButtonText);
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
	$.each(VERSIONS, function(index, value) {
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
	ALL_COLOURS.forEach(c => square.removeClass(c));
	square.addClass(colorClass);
}

function copySeedToClipboard(id)
{
	var id = "#"+id;
	if (navigator.clipboard)
	{
		navigator.clipboard.writeText($(id).val()).catch(err => {
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
		}
		catch (err)
		{
			alert("Failed to copy seed to clipboard :/");
		}

		// Deselect
		$(id).blur();
	}
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
	$("#export").show();
}

function hideGoalExport()
{
	$("#export").hide();
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
