//var bingoList = [1][34];

var currentSheet = [24];	
var sheetLayout = [];										
						
var amountOfSilly = 1;
var amountOfHard = 5;
var amountOfMedium = 10;

var SEED;
var LAYOUT;
var HIDDEN;

$(document).ready(function()
{	
	$("#bingo td").click(function()
	{
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
	
	// Check the url for a seed value
	SEED = gup( 'seed' );
	// If there isn't one, make a new one
	if (SEED == "") 
	{
		newSeed(false);
	}
	
	// Setting the random seed
	Math.seedrandom(SEED);
	
	LAYOUT = gup( 'layout' );
	
	if (LAYOUT == "random")
	{
		document.getElementById("LayoutTickbox").checked = true;
	}
	else 
	{
		LAYOUT = "set";
	}
	
	HIDDEN = gup( 'hidden' );
	
	if (HIDDEN == "true")
	{
		document.getElementById("HiddenTickbox").checked = true;
		document.getElementById("bingo").style.display = "none";
	}
	else
	{
		HIDDEN = "false";
		document.getElementById("HiddenTickbox").checked = false;
		document.getElementById("bingo").style.display = "table";
	}
	
	generateNewSheet();
})

function generateNewSheet() 
{
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
	}
}

function newSeed(reload)
{
	// Making a new 5 digit seed
	SEED = Math.floor((Math.random() * 90000) + 10000).toString();
	
	if (reload == true)
	{
		// Change the URL and reload the page
		window.location = '?seed=' + SEED + '&layout=' + LAYOUT + '&hidden=' + HIDDEN;
	}
	else
	{
		// Change the URL and don't reload the page
		window.history.pushState('', "Sheet", '?seed=' + SEED + '&layout=' + LAYOUT + '&hidden=' + HIDDEN);
	}
}

function toggleRandomLayout(cb) 
{
	if (cb.checked)
	{
		LAYOUT = "random";
	}
	else
	{
		LAYOUT = "set";
	}
	
	window.location = '?seed=' + SEED + '&layout=' + LAYOUT + '&hidden=' + HIDDEN;
}

function toggleTableHidden(cb) 
{
	if (cb.checked)
	{
		document.getElementById("bingo").style.display = "none";
		HIDDEN = "true";
	}
	else
	{
		document.getElementById("bingo").style.display = "table";
		HIDDEN = "false";
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