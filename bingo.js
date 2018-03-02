
var DIFFICULTY;
var SEED;
var LAYOUT;
var HIDDEN;
var STREAMER_MODE;
var VERSION;
var DIFFICULTYTEXT = [ "Very Easy", "Easy", "Medium", "Hard", "Very Hard"];

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
	{ id:"1", name:"v1",			goals: bingoList_v1, generator: generator_v1, stable: true },
	{ id:"2", name:"v2",			goals: bingoList_v2, generator: generator_v2, stable: true },
	{ id:"dev", name:"dev-version", 	goals: bingoList_v3, generator: generator_v3, stable: false }, // Dev version
];

// This is the newest stable version that users not specifying a version will get
var LATEST_VERSION = "2";

// Button Functions, Open when clicked checks if the element is part of the parent tree, if not closes.
$(document).click(function(event) {
    if (event.target.className == 'options-button') {
		document.getElementById('options-dropdown-main').style.display = "block"
	}else if(!$(event.target).closest(".options").length) {
		document.getElementById('options-dropdown-main').style.display = "none"
	}
});

$(document).ready(function()
{	

	// Set the background to a random image
	document.body.style.backgroundImage = "url('Backgrounds/background" + (Math.floor(Math.random() * 10) + 1) + ".jpg')";

	// By default hide the tooltip
	$("#tooltip").hide();

/* 	// By default hide tooltip questionmarks
	$(".tooltipQ").addClass("tooltipQhidden");

	// On hovering the sheet show the tooltip questionmarks
	$("#bingo").hover(function()
	{
		if (!HIDDEN) {
			$(".tooltipQ").removeClass("tooltipQhidden");
		}
	}, function()
	{
		$(".tooltipQ").addClass("tooltipQhidden");
	}); */

	// On clicking a goal square
	$("#bingo td").click(function()
	{
		// Change colours between normal, green and red
		if ($(this).hasClass('greensquare'))
		{
			setSquareColor($(this), 'redsquare');
		}
		else if ($(this).hasClass('redsquare'))
		{
			setSquareColor($(this), '');
		}
		else if ($(this).hasClass('bluesquare'))
		{
			setSquareColor($(this), 'greensquare');
		}
		else 
		{
			setSquareColor($(this), 'bluesquare');
		}
	});
	
	// On hovering a goal square
	$("#bingo td img").hover(function()
	{
		// If the tooltip is empty
		if ($(this).parent().data("tooltiptext") == "" && $(this).parent().data("tooltipimg") == "")
		{
			// Do nothing lol
		}
		else
		{
			// Show the tooltip and fill it with content from the goal
			 $("#tooltip").show();
			 $("#tooltipimg").attr('src', $(this).parent().data("tooltipimg"));
			 $("#tooltiptext").text($(this).parent().data("tooltiptext"));
		}
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
	},function(e)
	{
		hoveredSquare = null;
	});
	$(document).on("keydown", function(e)
	{
		if (hoveredSquare)
		{
			if (e.which == 49) // 1
			{
				setSquareColor(hoveredSquare, "bluesquare");
			}
			else if (e.which == 50) // 2
			{
				setSquareColor(hoveredSquare, "greensquare");
			}
			else if (e.which == 51) // 3
			{
				setSquareColor(hoveredSquare, "redsquare");
			}
			else if (e.which == 52) // 4
			{
				setSquareColor(hoveredSquare, "");
			}
		}
	});

	fillVersionSelection();
	$("#version_selection").change(function() {
		changeVersion($("#version_selection").val());
	});


	window.onpopstate = function(event) 
	{ 
		getSettingsFromURL();
	};
	
	getSettingsFromURL();
	
	$(".difficulty-text").text(DIFFICULTYTEXT[DIFFICULTY - 1]);
	$(".stream-difficulty-text").text(DIFFICULTYTEXT[DIFFICULTY - 1]);
	$("#difficultyRange").val(DIFFICULTY);
})

/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */


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
	updateVersion();
	generateNewSheet();
}

function generateNewSheet() 
{
	$(".seed_for_copying").val(SEED);
	$(".seed_for_copying").attr("size", SEED.length);

	// Reset the random seed
	Math.seedrandom(SEED);
	
	// Reset every goal square
	for (var i=0; i<=24; i++) 
	{
		var slotId = "#slot"+ (i + 1);
		$(slotId).contents().filter(function(){ return this.nodeType == 3; }).remove();
		$(slotId).data("tooltipimg", "");
		$(slotId).data("tooltiptext", "");
		$(slotId).children().css("visibility", "hidden");
		$(slotId).removeClass('greensquare');
		$(slotId).removeClass('redsquare');
		$(slotId).removeClass('bluesquare');
	}

	var result = VERSION.generator(LAYOUT, DIFFICULTY, VERSION.goals);
	
	for (var i=0; i<25; i++)
	{
		var slotId = "#slot"+ (i + 1);
		var goal = result[i];

		//$(slotId).append(goal.generatedName + " " + goal.difficulty);
		$(slotId).append(goal.generatedName);
		
		if (typeof goal.tooltipimg !== 'undefined')
		{
			$(slotId).data("tooltipimg", goal.tooltipimg);
			$(slotId).children().css("visibility", "visible");
		}
		if (typeof goal.tooltiptext !== 'undefined')
		{
			$(slotId).data("tooltiptext", goal.tooltiptext);
			$(slotId).children().css("visibility", "visible");
		}
	}
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
	if (HIDDEN)
	{
		// Hide the goals and change the hidden setting's text
		document.getElementById("ishidden").innerHTML = "Show Table";
		$("#bingo td").css("visibility", "hidden");
		$("#hidden-table").css("display","block");
	}
	else
	{
		HIDDEN = false;
		// Show the goals and change the hidden setting's text
		document.getElementById("ishidden").innerHTML = "Hide Table";
		$("#bingo td").css("visibility", "visible");
		$("#hidden-table").css("display","none");
	}
}

function toggleHidden() 
{
	// Invert HIDDEN setting, then update
	HIDDEN = !HIDDEN;
	updateHidden();
	pushNewUrl();
}

function toggleStreamerMode()
{
	STREAMER_MODE = !STREAMER_MODE;
	updateStreamerMode();
	pushNewUrl();
}

function updateStreamerMode()
{
	if (STREAMER_MODE)
	{
		$("#nav_section").css("display", "none");
		$("#streamer_mode").css("display", "block");
		$(".options").css("display", "none");
		$(".options").css("display", "none");
		$(".stream-exit-text").css("display", "block");
		$(".new-seed-button").css("display", "none");
		$("#rules-section").css("display", "none");
		$("body").css("background-size", "0, 0");
	}
	else
	{
		$("#nav_section").css("display", "block");
		$("#streamer_mode").css("display", "none");
		$(".options").css("display", "inline-block");
		$(".stream-exit-text").css("display", "none");
		$(".new-seed-button").css("display", "inline-block");
		$("#rules-section").css("display", "block");
		$("body").css("background-size", "auto");
	}
}

function changeDifficulty(value)
{
	DIFFICULTY = parseInt(value);
	
	$(".difficulty-text").text(DIFFICULTYTEXT[DIFFICULTY - 1]);
	$(".stream-difficulty-text").text(DIFFICULTYTEXT[DIFFICULTY - 1]);
	
	generateNewSheet();
	pushNewUrl();
}

function pushNewUrl()
{
	var hidden = HIDDEN ? "1" : "0";
	var streamerMode = STREAMER_MODE ? "1" : "0";
	window.history.pushState('', "Sheet", "?s=" + DIFFICULTY + "-" + hidden + "-" + streamerMode + "-" + VERSION.id + "_" + SEED);
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
			label += " (in development)";
		}
		$("#version_selection").append($('<option></option>').val(value.id).html(label))
	});
}

function setSquareColor(square, colorClass)
{
	square.removeClass('bluesquare');
	square.removeClass('greensquare');
	square.removeClass('redsquare');
	square.addClass(colorClass);
}

// Made this a function for readability and ease of use
function getRandomInt(min, max) 
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// gup source: www.netlobo.com/url_query_string_javascript.html
function gup( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

// random source: www.engin33r.net/bingo/random.js
(function(j,i,g,m,k,n,o){function q(b){var e,f,a=this,c=b.length,d=0,h=a.i=a.j=a.m=0;a.S=[];a.c=[];for(c||(b=[c++]);d<g;)a.S[d]=d++;for(d=0;d<g;d++)e=a.S[d],h=h+e+b[d%c]&g-1,f=a.S[h],a.S[d]=f,a.S[h]=e;a.g=function(b){var c=a.S,d=a.i+1&g-1,e=c[d],f=a.j+e&g-1,h=c[f];c[d]=h;c[f]=e;for(var i=c[e+h&g-1];--b;)d=d+1&g-1,e=c[d],f=f+e&g-1,h=c[f],c[d]=h,c[f]=e,i=i*g+c[e+h&g-1];a.i=d;a.j=f;return i};a.g(g)}function p(b,e,f,a,c){f=[];c=typeof b;if(e&&c=="object")for(a in b)if(a.indexOf("S")<5)try{f.push(p(b[a],e-1))}catch(d){}return f.length?f:b+(c!="string"?"\0":"")}function l(b,e,f,a){b+="";for(a=f=0;a<b.length;a++){var c=e,d=a&g-1,h=(f^=e[a&g-1]*19)+b.charCodeAt(a);c[d]=h&g-1}b="";for(a in e)b+=String.fromCharCode(e[a]);return b}i.seedrandom=function(b,e){var f=[],a;b=l(p(e?[b,j]:arguments.length?b:[(new Date).getTime(),j,window],3),f);a=new q(f);l(a.S,j);i.random=function(){for(var c=a.g(m),d=o,b=0;c<k;)c=(c+b)*g,d*=g,b=a.g(1);for(;c>=n;)c/=2,d/=2,b>>>=1;return(c+b)/d};return b};o=i.pow(g,m);k=i.pow(2,k);n=k*2;l(i.random(),j)})([],Math,256,6,52);
