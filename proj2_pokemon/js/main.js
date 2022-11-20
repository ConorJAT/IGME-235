// 1
window.onload = (e) => {document.querySelector("#search").onclick = searchButtonClicked};
	
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

let obj;

function dataLoaded(e){
    // E.) Event.target is the xhr object.
	let xhr = e.target;

	// F.) Xhr.responseText is the JSON file we just downloaded.
	console.log(xhr.responseText);

	try{
		// G.) Turn the text into a parsable JavaScript object.
		let obj = JSON.parse(xhr.responseText);

		// H.) Get the URL to the Pokemon image.
		let smallURL = obj.sprites.other.home.front_default;
		if (!smallURL) smallURL = "images/no-image-found.png";

		let name = obj.name;

		let dexNum = obj.id;

		let weight = obj.weight / 4.536;
		let weightMetric = obj.weight / 10;

		let height = obj.height / 3.048;
		let heightMetric = obj.height / 10;

		let types = [];
		for (let i = 0; i < obj.types.length; i++){
			types.push(obj.types[i].type.name);
		}

		let ablty = [];
		for (let i = 0; i < obj.abilities.length; i++){
			ablty.push(obj.abilities[i].ability.name);
		}

		// I.) Build a <div> to hold the result.
		// --- Es6 String Templating ---
		
		// Pokemon Name
		let line = `<div class='result'><h2>${name} - No. ${dexNum}</h2>`;

		// Pokemon Classification


		// Pokemon Typing
		if (types.length == 1){
			line += `<p>Typing: ${types[0]}</p>`;
		}
		else if (types.length == 2){
			line += `<p>Typing: ${types[0]} & ${types[1]}</p>`;
		}

		// Pokemon Abilities
		line += `<p>Abilities:<ul>`;
		for (let i = 0; i < ablty.length; i++){
			line += `<li>${ablty[i]}</li>`;
		}
		line += `</ul></p>`;

		// Pokemon Height
		line += `<p>Average Height: ${height.toFixed(2)} ft (${heightMetric.toFixed(2)} m)</p>`;

		// Pokemon Weight
		line += `<p>Average Weight: ${weight.toFixed(2)} lbs (${weightMetric.toFixed(2)} kg)</p></div>`;

		// Pokedex Entry

		// Poekmon Image
		line += `<img src='${smallURL}' title='${name}' id='image'/>`;

		// J.) All done building the HTML; display to user.
		document.querySelector("#content").innerHTML = line;

		// K.) Update the Status.
		document.querySelector("#status").innerHTML = "<br>Success!</br><p><i>Here is some info found on: '" + displayTerm + "'</i></p>";
	}

	catch (error){
		let line = `<div class='result'><h2>No Pokemon Found!</h2>`;
		line += `<p>Typing: N/A</p>`;
		line += `<p>Abilities: N/A</p>`
		line += `<p>Average Height: N/A</p>`;
		line += `<p>Average Weight: N/A</p></div>`;
		line += `<img src='images/no-image-found.png' title='No Image Found' id='image'/>`;

		document.querySelector("#content").innerHTML = line;
			
		document.querySelector("#status").innerHTML = "<br>Pokemon not found!</br><p><i>Could not find info on: '" + displayTerm + "'</i></p>";	
		return;
	}
}

function dataError(e){
    console.log("An Error Occurred!");
}