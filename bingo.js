//var bingoList = [1][34];

var currentSheet = [];	
var sheetLayout = [];										
						
var amountOfSilly = 1;
var amountOfHard = 3;
var amountOfMedium = 6;

var SEED;
var LAYOUT;
var HIDDEN;

$(document).ready(function()
{	
	// By default hide the tooltip
	$("#tooltip").hide();

	// On clicking a goal square
	$("#bingo td").click(function()
	{
		// Change colours between normal, green and red
		if ($(this).hasClass('greensquare'))
		{
			$(this).toggleClass('greensquare');
			$(this).toggleClass('redsquare');
		}
		else if ($(this).hasClass('redsquare'))
		{
			$(this).toggleClass('redsquare');
		}
		else
		{
			$(this).toggleClass('greensquare');
		}
	});
	
	// On hovering a goal square
	$("#bingo td").hover(function()
	{
		// If the tooltip is empty
		if ($(this).data("tooltiptext") == "" && $(this).data("tooltiptext") == "")
		{
			// Do nothing lol
		}
		else
		{
			// Show the tooltip and fill it with content from the goal
			 $("#tooltip").show();
			 $("#tooltipimg").attr('src', $(this).data("tooltipimg"));
			 $("#tooltiptext").text($(this).data("tooltiptext"));
		}
	},function()
	{
		// After hovering, hide the tooltip again
		$("#tooltip").hide();
	});
	
	// Move the tooltip with the mouse
	$(document).mousemove(function(e)
	{
		$("#tooltip").css({left:e.pageX + 2, top:e.pageY + 2});
	});
	
	// Grab the layout setting from the URL
	LAYOUT = gup( 'layout' );
	
	if (LAYOUT == "random")
	{
		// Set the layout settings' text
		document.getElementById("whatlayout").innerHTML="Set Layout";
	}
	else 
	{
		LAYOUT = "set";
		document.getElementById("whatlayout").innerHTML="Random Layout";
	}
	
	// Grab the hidden setting from the URL
	HIDDEN = gup( 'hidden' );
	
	if (HIDDEN == "true")
	{
		// Hide the table and change the hidden setting's text
		document.getElementById("ishidden").innerHTML="Show Table";
		document.getElementById("bingo").style.display = "none";
	}
	else
	{
		HIDDEN = "false";
		// Don't hide the table and change the hidden setting's text
		document.getElementById("ishidden").innerHTML="Hide Table";
		document.getElementById("bingo").style.display = "table";
	}
	
	// Check the url for a seed value
	SEED = gup( 'seed' );
	
	// If there isn't one, make a new one
	if (SEED == "") 
	{
		newSeed(false);
	}
	
	generateNewSheet();
})

function generateNewSheet() 
{
	// Reset the random seed
	Math.seedrandom(SEED);
	
	// Reset the current sheet
	currentSheet = [];
	
	for (var i=0; i<=24; i++) 
	{
		$('#slot'+ (i + 1)).text("");
		$('#slot'+ (i + 1)).data("tooltipimg", "");
		$('#slot'+ (i + 1)).data("tooltiptext", "");
	}
	
	if (LAYOUT == "set")
	{		
		sheetLayout = [ 1, 2, 0, 2, 1,
						2, 0, 1, 0, 2,
						0, 1, 3, 1, 0,
						2, 0, 1, 0, 2,
						1, 2, 0, 2, 1];
	}
	else if (LAYOUT == "random")
	{
		sheetLayout = [ 0, 0, 0, 0, 0,
						0, 0, 0, 0, 0,
						0, 0, 0, 0, 0,
						0, 0, 0, 0, 0,
						0, 0, 0, 0, 0];
						
		for (var i = 0; i < amountOfSilly; i++) 
		{
			sheetLayout[Math.floor((Math.random() * 24))] = 3;
		}
		
		for (var i = 0; i < amountOfHard; i++) 
		{
			var cont = true;
			
			do
			{
				cont = true;
				
				var rng = Math.floor((Math.random() * 24));
			
				if (sheetLayout[rng] == 0)
				{
					sheetLayout[rng] = 2;
				}
				else
				{
					cont = false;
				}
			}
			while (cont == false);
		}
		
		for (var i = 0; i < amountOfMedium; i++) 
		{
			var cont = true;
			
			do
			{
				cont = true;
				
				var rng = Math.floor((Math.random() * 24));
			
				if (sheetLayout[rng] == 0)
				{
					sheetLayout[rng] = 1;
				}
				else
				{
					cont = false;
				}
			}
			while (cont == false);
		}
	}
	
	for (var i=0; i<=24; i++) 
	{		
		var cont = true;
		
		do 
		{
			cont = true;
			
			var rng = Math.floor((Math.random() * bingoList[sheetLayout[i]].length - 1) + 1);
			
			for (var z=0; z <= 24; z++)
			{
				if (currentSheet[z] == bingoList[sheetLayout[i]][rng].name)
				{
					cont = false;
				}	
				
			}
 			
		}
		while (cont == false);
		
		currentSheet[i] = bingoList[sheetLayout[i]][rng].name;
		
		$('#slot'+ (i + 1)).append(bingoList[sheetLayout[i]][rng].name.replace(/\((\d+)-(\d+)\)/g, function(match, n1, n2, offset, input) 
		{
			n1 = parseInt(n1);
			n2 = parseInt(n2);
			return Math.floor(Math.random() * (n2-n1+1) + n1);
		}));
		
		if (typeof bingoList[sheetLayout[i]][rng].tooltipimg !== 'undefined')
		{
			$('#slot'+ (i + 1)).data("tooltipimg", bingoList[sheetLayout[i]][rng].tooltipimg);
		}
		if (typeof bingoList[sheetLayout[i]][rng].tooltiptext !== 'undefined')
		{
			$('#slot'+ (i + 1)).data("tooltiptext", bingoList[sheetLayout[i]][rng].tooltiptext);
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
	window.history.pushState('', "Sheet", '?seed=' + SEED + '&layout=' + LAYOUT + '&hidden=' + HIDDEN);
	
	// If a new sheet is required, generate one
	if (remakeSheet == true)
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
	window.history.pushState('', "Sheet", '?seed=' + SEED + '&layout=' + LAYOUT + '&hidden=' + HIDDEN);
	
	// Generate a new sheet
	generateNewSheet();
}

function changeHidden() 
{	
	// Hide or show the table based on the current setting
	if (HIDDEN == "false")
	{
		HIDDEN = "true";
		
		// Update the button's text
		document.getElementById("ishidden").innerHTML="Show Table";
		
		
		document.getElementById("bingo").style.display = "none";
	} 
	else 
	{
		HIDDEN = "false";
		
		document.getElementById("ishidden").innerHTML="Hide Table";
		document.getElementById("bingo").style.display = "table";
	}
	window.history.pushState('', "Sheet", '?seed=' + SEED + '&layout=' + LAYOUT + '&hidden=' + HIDDEN);
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