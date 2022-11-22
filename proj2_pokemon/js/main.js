// 1
window.onload = (e) => {
	// Memory for last search term
	const searchField = document.querySelector("#searchterm");
	const prefix = "ctr9664-";
	const searchKey = prefix + "search";

	const storedSearch = localStorage.getItem(searchKey);

	if (storedSearch){
		searchField.value = storedSearch;
	}else{
		searchField.value = "Pikachu";
	}

	searchField.onchange = e=>{ localStorage.setItem(searchKey, e.target.value); };

	/// Event for search button
	document.querySelector("#search").onclick = searchButtonClicked
};

// 2
let displayTerm = "";

// 3
function searchButtonClicked(){
    console.log("searchButtonClicked() called");

    // A.)
	const POKEMON_URL = "https://pokeapi.co/api/v2/pokemon/";

    // B.) Build up the URL string.
	let url = POKEMON_URL;

    // C.) Parse the user entered term we wish to search.
	let term = document.querySelector("#searchterm").value;
	displayTerm = term;
	term = term.toLowerCase();

	// D.) Remove any leading and trailing spaces.
	term = term.trim();

	// E.) Encode spaces and special characters.
	term = encodeURIComponent(term);

    // F.) If there's no term to search, then bail out of the function ( return; ).
	if (term.length < 1) return;

	// G.) Append the search term to the URL; the parameter name is 'q'.
	url += term;

    // H.) Update the UI.
	document.querySelector("#status").innerHTML = "<br>Searching for '" + displayTerm + "'</br>";

	// I.) See what the URL looks like.
	console.log(url);

    // J.) Request data.
	getData(url);
}


function getData(url){

	// A.) Create a new XHR object.
	let xhr = new XMLHttpRequest();

	// B.) Set the on-load handler.
	xhr.onload = dataLoaded;

	// C.) Set the on-error handler.
	xhr.onerror = dataError;

	// D.) Open connection and send the reques
	xhr.open("GET", url);
	xhr.send();
}


// Callback Functions:

function dataLoaded(e){
    // E.) Event.target is the xhr object.
	let xhr = e.target;

	// F.) Xhr.responseText is the JSON file we just downloaded.
	console.log(xhr.responseText);

	try{
		// G.) Turn the text into a parsable JavaScript object.
		let obj = JSON.parse(xhr.responseText);


		// H.) Get the URL to the Pokemon image.
		let shinyCheck = document.querySelector("#shiny").checked;
		let genderCheck = document.querySelector("#gender").checked;

		let smallURL;

		// Find correct image url based off enter criteria
		// Shiny + Female
		if(genderCheck && shinyCheck){
			if(obj.sprites.other.home.front_shiny_female){
				smallURL = obj.sprites.other.home.front_shiny_female;
			}
			else{
				smallURL = obj.sprites.other.home.front_shiny;
			}
		}
		// Shiny
		else if(shinyCheck){
			smallURL = obj.sprites.other.home.front_shiny;
		}
		// Female
		else if(genderCheck){
			if(obj.sprites.other.home.front_female){
				smallURL = obj.sprites.other.home.front_female;
			}
			else{
				smallURL = obj.sprites.other.home.front_default;
			}
		}
		// Default
		else{
			smallURL = obj.sprites.other.home.front_default;
		}
		// If Pokemon does not exist, display 'no image found'
		if (!smallURL) smallURL = "images/no-image-found.png";

		// Get Pokemon Name
		let name = obj.name;

		// Get Pokemon Dex Number
		let dexNum = obj.id;

		// Get Pokemon Weight and Height
		let weight = obj.weight / 4.536;
		let weightMetric = obj.weight / 10;

		let height = obj.height / 3.048;
		let heightMetric = obj.height / 10;

		// Get Pokemon Typing
		let types = [];
		for (let i = 0; i < obj.types.length; i++){
			types.push(obj.types[i].type.name);
		}

		// Get Pokemon Abilities
		let ablty = [];
		for (let i = 0; i < obj.abilities.length; i++){
			ablty.push(obj.abilities[i].ability.name);
		}

		// Get Pokemon Stats
		let stats = [];
		for(let i = 0; i < obj.stats.length; i++){
			stats.push(obj.stats[i].base_stat)
		}


		// I.) Build a <div> to hold the result.
		// --- Es6 String Templating ---
		
		// Pokemon Name
		let line = `<div class='result'><h2>${capitalizeFirst(name)} - No. ${dexNum}</h2>`;

		// Pokemon Typing
		if (types.length == 1){
			line += `<p><strong>Typing:</strong> ${capitalizeFirst(types[0])}</p>`;
		}
		else if (types.length == 2){
			line += `<p><strong>Typing:</strong> ${capitalizeFirst(types[0])} & ${capitalizeFirst(types[1])}</p>`;
		}

		// Pokemon Abilities
		line += `<p><strong>Abilities:</strong><ul class='resultlist'>`;
		for (let i = 0; i < ablty.length; i++){
			line += `<li>${capitalizeFirst(ablty[i])}</li>`;
		}
		line += `</ul></p>`;

		// Pokemon Height
		line += `<p><strong>Average Height:</strong> ${height.toFixed(2)} ft (${heightMetric.toFixed(2)} m)</p>`;

		// Pokemon Weight
		line += `<p><strong>Average Weight:</strong> ${weight.toFixed(2)} lbs (${weightMetric.toFixed(2)} kg)</p>`;

		// Pokemon Stats
		line += `<p><strong>Base Stats:</strong><ul class='resultlist'>`;
		line += `<li>HP: ${stats[0]}</li>`;
		line += `<li>Attack: ${stats[1]}</li>`;
		line += `<li>Defense: ${stats[2]}</li>`;
		line += `<li>Special Attack: ${stats[3]}</li>`;
		line += `<li>Special Defense: ${stats[4]}</li>`;
		line += `<li>Speed: ${stats[5]}</li>`;
		line += `</ul></p></div>`;

		// Favorite Checkbox (WIP)
		// line += `<input type="checkbox" id="liked"><label for="liked"> Favorite?</label></div>`;

		// Poekmon Image
		line += `<img src='${smallURL}' title='${name}' id='image'/>`;

		// J.) All done building the HTML; display to user.
		document.querySelector("#content").innerHTML = line;

		// K.) Update the Status.
		document.querySelector("#status").innerHTML = "<br>Success!</br><p><i>Here is some info found on: '" + displayTerm + "'</i></p>";

	}

	catch (error){
		let line = `<div class='result'><h2>No Pokemon Found!</h2>`;
		line += `<p><strong>Typing:</strong> N/A</p>`;
		line += `<p><strong>Abilities:</strong> N/A</p>`
		line += `<p><strong>Average Height:</strong> N/A</p>`;
		line += `<p><strong>Average Weight:</strong> N/A</p>`;
		line += `<p><strong>Base Stats:</strong> N/A</p></div>`
		line += `<img src='images/no-image-found.png' title='No Image Found' id='image'/>`;

		document.querySelector("#content").innerHTML = line;
			
		document.querySelector("#status").innerHTML = "<br>Pokemon not found!</br><p><i>Could not find info on: '" + displayTerm + "'</i></p>";	
		return;
	}
}

function dataError(e){
    console.log("An Error Occurred!");
}

function capitalizeFirst(word){
	let firstLetter = word.substring(0,1).toUpperCase();
	let secondHalf = word.substring(1,word.length).toLowerCase();
	secondHalf = secondHalf.replace("-", " ");

	return firstLetter.concat(secondHalf);
}
