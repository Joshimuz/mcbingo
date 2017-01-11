//var bingoList = [1][34];

// Create two dimensional array
var bingoList=new Array()
for (i=0; i < 4; i++)
{
	bingoList[i]=new Array()
}

var currentSheet = [24];	
var sheetLayout = [];										
						
var amountOfSilly = 1;
var amountOfHard = 5;
var amountOfMedium = 10;

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
	var SEED = gup( 'seed' );
	// If there isn't one, make a new one
	if (SEED == "") 
	{
		// Making a new 5 digit seed
		SEED = Math.floor((Math.random() * 90000) + 10000);
		// Changing the URL to have the seed
		window.location = '?seed=' + SEED;
	}
	
	var LAYOUT = gup( 'layout' );
	
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
	else
	{
		LAYOUT = "set";
		
		sheetLayout = [ 1, 2, 0, 2, 1,
						2, 0, 1, 0, 2,
						0, 1, 3, 1, 0,
						2, 0, 1, 0, 2,
						1, 2, 0, 2, 1];
						
		//window.location = '?seed=' + SEED + '&layout=' + LAYOUT;
	}
	
	// Setting the random seed
	Math.seedrandom(SEED);
	
	//
	
	for (var i=0; i<=24; i++) 
	{		
		var cont = true;
		
		do 
		{
			cont = true;
			
			var rng = Math.floor((Math.random() * bingoList[sheetLayout[i]].length) + 1);
			//var rng = Math.floor((Math.random() * 3) + 1);
			
			if (typeof bingoList[sheetLayout[i]][rng] === 'undefined')
			{
				cont = false;
			}
			else
			{
				for (var z=0; z <= 24; z++)
				{
					if (currentSheet[z] == bingoList[sheetLayout[i]][rng].name)
					{
						//$('#slot'+i).append("Loop ");
						cont = false;
					}	
					
				}
			}
 			
		}
		while (cont == false);
		
		//var rng = Math.floor((Math.random() * bingoList.length - 1) + 1);
		
		currentSheet[i] = bingoList[sheetLayout[i]][rng].name;
		
		$('#slot'+ (i + 1)).append(bingoList[sheetLayout[i]][rng].name);
	}
})

bingoList[0][0] = {name :"4 Different Fish"};
bingoList[0][1] = {name :"Enter the Nether"};
bingoList[0][2] = {name :"5 Colours of Hardened Clay"};
bingoList[0][3] = {name :"5 Mushroom Stew"};
bingoList[0][4] = {name :"Activate a Button with an Arrow"};
bingoList[0][5] = {name :"Book and Quill"};
bingoList[0][6] = {name :"32 Flint"};
bingoList[0][7] = {name :"Cake"};
bingoList[0][8] = {name :"Pumpkin Pie"};
bingoList[0][9] = {name :"Fish a Treasure and Junk item"};
bingoList[0][10] = {name :"50 of Andesite, Granite, and/or Diorite"};
bingoList[0][11] = {name :"30 Coarse Dirt"};
bingoList[0][12] = {name :"2 Clocks"};
bingoList[0][13] = {name :"3 Iron Blocks"};
bingoList[0][14] = {name :"2 Gold Blocks"};
bingoList[0][15] = {name :"Cyan Dye"};
bingoList[0][16] = {name :"Golden Apple"};
bingoList[0][17] = {name :"5 Bookshelves"};
bingoList[0][18] = {name :"Never wear Chestplates"};
bingoList[0][19] = {name :"Create a Jukebox"};
bingoList[0][20] = {name :"25 Poppies & 25 Dandylions"};
bingoList[0][21] = {name :"Build a glass cube and fill the inner with lava"};
bingoList[0][22] = {name :"10 Mossy Cobblestone"};
bingoList[0][23] = {name :"20 Cacti"};
bingoList[0][24] = {name :"2 TNT"};
bingoList[0][25] = {name :"Light Gray Dye + Light Blue Dye"};
bingoList[0][26] = {name :"Level 10"};
bingoList[0][27] = {name :"Power a Redstone Lamp"};
bingoList[0][28] = {name :"Create a Snow Golem"};
bingoList[0][29] = {name :"15 Note Blocks"};
bingoList[0][30] = {name :"Build a 3x3x3 leaf cube"};
bingoList[0][31] = {name :"15 Ink Sacks"};
bingoList[0][32] = {name :"16 Bread"};
bingoList[0][33] = {name :"5 colours of Wool"};
bingoList[0][34] = {name :"9 Pistons"};
bingoList[0][35] = {name :"Full Iron Armour"};
bingoList[0][36] = {name :"Full Leather Armour"};
bingoList[0][37] = {name :"Cauldron with Water"};
bingoList[0][38] = {name :"Complete a Map"};
bingoList[0][39] = {name :"32 Soul Sand"};
bingoList[0][40] = {name :"22 Pumpkins"};
bingoList[0][41] = {name :"40 Vines"};
bingoList[0][42] = {name :"6 types of Slabs"};
bingoList[0][43] = {name :"Every type of Sword"};
bingoList[0][44] = {name :"Every type of Pickaxe"};
bingoList[0][45] = {name :"32 Bricks (block)"};
bingoList[0][46] = {name :"64 Arrows"};
bingoList[0][47] = {name :"Enchanted Golden Sword"};
bingoList[0][48] = {name :"Sleep in the Nether"};
bingoList[0][49] = {name :"Fermented Spider Eye"};
bingoList[0][50] = {name :"5 types of Stairs"};
bingoList[0][51] = {name :"3 Ender Pearls"};
bingoList[0][52] = {name :"16 Chicken Eggs"};
bingoList[0][53] = {name :"Magenta Dye"};
bingoList[0][54] = {name :"Hang up 3 different 4x4 Paintings"};
bingoList[0][54] = {name :"5 Bone Blocks"};

bingoList[1][0] = {name :"2 Wither Skulls"};
bingoList[1][1] = {name :"7 Different Edible Items"};
bingoList[1][2] = {name :"Build a Redstone AND Gate"};
bingoList[1][3] = {name :"4 Different Gold Items"};
bingoList[1][4] = {name :"Beetroot Soup"};
bingoList[1][5] = {name :"10 Emeralds"};
bingoList[1][6] = {name :"Trade with a Villager"};
bingoList[1][7] = {name :"Water Bucket, Lava Bucket and Milk Bucket"};
bingoList[1][8] = {name :"Tame a Horse"};
bingoList[1][9] = {name :"Place a Cactus in a Flower Pot"};
bingoList[1][10] = {name :"Ignite a TNT-Minecart"};
bingoList[1][11] = {name :"12 Magma Blocks"};
bingoList[1][12] = {name :"Skull and Crossbones Banner"};
bingoList[1][13] = {name :"Cookie"};
bingoList[1][14] = {name :"Exhaust an Anvil"};
bingoList[1][15] = {name :"15 Melons"};
bingoList[1][16] = {name :"Sleep inside a village"};
bingoList[1][17] = {name :"Kill a Skeleton with it's own Arrow"};
bingoList[1][18] = {name :"Never wear Armour"};
bingoList[1][19] = {name :"Take a Skeleton's Bow"};
bingoList[1][20] = {name :"9 Bookshelves"};
bingoList[1][21] = {name :"Diamond Block"};
bingoList[1][22] = {name :"2 Lapis Lazuli Blocks"};
bingoList[1][23] = {name :"Destroy a Monster Spawner"};
bingoList[1][24] = {name :"Level 20"};
bingoList[1][25] = {name :"4 types of Saplings"};
bingoList[1][26] = {name :"Tame an ocelot"};
bingoList[1][27] = {name :"Tame a wolf"};
bingoList[1][28] = {name :"15 Fire Charges"};
bingoList[1][29] = {name :"3 Magma Creams"};
bingoList[1][30] = {name :"Potion of Fire Resistance"};
bingoList[1][31] = {name :"Potion of Healing"};
bingoList[1][32] = {name :"Grow a full jungle Tree"};
bingoList[1][33] = {name :"Potion of Poison"};
bingoList[1][34] = {name :"Potion of Harming"};
bingoList[1][35] = {name :"Create an Iron Golem"};
bingoList[1][36] = {name :"Potion of Regeneration"};
bingoList[1][37] = {name :"Potion of Slowness"};
bingoList[1][38] = {name :"Eye of Ender"};
bingoList[1][39] = {name :"Potion of Strength"};
bingoList[1][40] = {name :"Potion of Swiftness"};
bingoList[1][41] = {name :"Music Disc"};
bingoList[1][42] = {name :"Potion of Weakness"};

bingoList[2][0] = {name :"Grass Block"};
bingoList[2][1] = {name :"Create a Level 10+ enchantment"};
bingoList[2][2] = {name :"Sea Lantern"};
bingoList[2][3] = {name :"3 Sponges"};
bingoList[2][4] = {name :"Bounce on a Slime Block"};
bingoList[2][5] = {name :"Rabbit Stew"};
bingoList[2][6] = {name :"Listen to a Music Disc"};
bingoList[2][7] = {name :"1 of Every Ore (Silk Touch)"};
bingoList[2][8] = {name :"Captures a Zombie, Skeleton and a Creeper"};
bingoList[2][9] = {name :"5 Different Potions"};
bingoList[2][10] = {name :"Cure a Zombie Villager"};
bingoList[2][11] = {name :"9 Different Flowers"};
bingoList[2][12] = {name :"Block of Iron, Gold and Diamond ontop each other"};
bingoList[2][13] = {name :"Take a Zombie Pigman's Sword"};
bingoList[2][14] = {name :"Every type of Chestplate"};

bingoList[3][0] = {name :"Finish by jumping from top to bottom of the world"};
bingoList[3][1] = {name :"Finish launching Fireworks of 5 different colors"};
bingoList[3][2] = {name :"Nametag an Enderman"};
bingoList[3][3] = {name :"Never Eat Meat (including Fish)"};
bingoList[3][4] = {name :"Kill yourself with your own arrow"};
bingoList[3][5] = {name :"Kill yourself with an Ender Pearl"};
bingoList[3][6] = {name :"Get a '... while trying to escape ...' Death message"};
bingoList[3][7] = {name :"Kill a mob with an Anvil"};
bingoList[3][8] = {name :"Burn down a village"};
bingoList[3][9] = {name :"Kill yourself by starving"};
bingoList[3][10] = {name :"Finish on top of the world"};
bingoList[3][11] = {name :"Finish where you spawned (compass)"};
bingoList[3][12] = {name :"Finish on top of a Blaze spawner"};
bingoList[3][13] = {name :"Silly 13"};
bingoList[3][14] = {name :"Silly 14"};
bingoList[3][15] = {name :"Silly 15"};

// gup source: http://www.netlobo.com/url_query_string_javascript.html
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

// random source: http://engin33r.net/bingo/random.js
(function(j,i,g,m,k,n,o){function q(b){var e,f,a=this,c=b.length,d=0,h=a.i=a.j=a.m=0;a.S=[];a.c=[];for(c||(b=[c++]);d<g;)a.S[d]=d++;for(d=0;d<g;d++)e=a.S[d],h=h+e+b[d%c]&g-1,f=a.S[h],a.S[d]=f,a.S[h]=e;a.g=function(b){var c=a.S,d=a.i+1&g-1,e=c[d],f=a.j+e&g-1,h=c[f];c[d]=h;c[f]=e;for(var i=c[e+h&g-1];--b;)d=d+1&g-1,e=c[d],f=f+e&g-1,h=c[f],c[d]=h,c[f]=e,i=i*g+c[e+h&g-1];a.i=d;a.j=f;return i};a.g(g)}function p(b,e,f,a,c){f=[];c=typeof b;if(e&&c=="object")for(a in b)if(a.indexOf("S")<5)try{f.push(p(b[a],e-1))}catch(d){}return f.length?f:b+(c!="string"?"\0":"")}function l(b,e,f,a){b+="";for(a=f=0;a<b.length;a++){var c=e,d=a&g-1,h=(f^=e[a&g-1]*19)+b.charCodeAt(a);c[d]=h&g-1}b="";for(a in e)b+=String.fromCharCode(e[a]);return b}i.seedrandom=function(b,e){var f=[],a;b=l(p(e?[b,j]:arguments.length?b:[(new Date).getTime(),j,window],3),f);a=new q(f);l(a.S,j);i.random=function(){for(var c=a.g(m),d=o,b=0;c<k;)c=(c+b)*g,d*=g,b=a.g(1);for(;c>=n;)c/=2,d/=2,b>>>=1;return(c+b)/d};return b};o=i.pow(g,m);k=i.pow(2,k);n=k*2;l(i.random(),j)})([],Math,256,6,52);