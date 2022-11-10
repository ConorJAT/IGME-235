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

    // D.) Open connection and send the request.
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

	// G.) Turn the text into a parsable JavaScript object.
	obj = JSON.parse(xhr.responseText);

	// H.) Get the URL to the Pokemon image.
	let smallURL = obj.sprites.other.home.front_default;
	if (!smallURL) smallURL = "images/no-image-found.png";

	let name = obj.name;

	let dexNum = obj.id;

	let types = [];
	for (let i = 0; i < obj.types.length; i++){
		types.push(obj.types[i].type.name);
	}

	// I.) Build a <div> to hold the result.
	// --- Es6 String Templating ---
	let line = `<div class='result'><h2>${name}</h2>`;
	line += `<span>Pokedex ID: ${dexNum}</span>`;
	if (types.length == 1){
		line += `<span>Typing: ${types[0]}</span>`;
	}
	else if (types.length == 2){
		line += `<span>Typing: ${types[0]} & ${types[1]}</span>`;
	}
	line += `<img src='${smallURL}' title='${name}'/></div>`;

	// J.) All done building the HTML; display to user.
	document.querySelector("#content").innerHTML = line;

	// K.) Update the Status.
	document.querySelector("#status").innerHTML = "<br>Success!</br><p><i>Here is some info found on: '" + displayTerm + "'</i></p>";
}

function dataError(e){
    console.log("An Error Occurred!");
}