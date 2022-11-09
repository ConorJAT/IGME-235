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

function dataLoaded(e){
    // E.) Event.target is the xhr object.
	let xhr = e.target;

	// F.) Xhr.responseText is the JSON file we just downloaded.
	console.log(xhr.responseText);

	// G.) Turn the text into a parsable JavaScript object.
	let obj = JSON.parse(xhr.responseText);

	// H.) If there are no results, print a message and return.
	if (!obj.data || obj.data == null){
		document.querySelector("#status").innerHTML = "<br>No results found for '" + displayTerm + "'</br>";
		return;  // Bail Out!
	}
}

function dataError(e){
    console.log("An Error Occurred!");
}