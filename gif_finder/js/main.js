    // 1
    window.onload = (e) => {document.querySelector("#search").onclick = searchButtonClicked};
	
	// 2
	let displayTerm = "";
	
	// 3
	function searchButtonClicked(){
		console.log("searchButtonClicked() called");

		// A.)
		const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?";

		// B.)
		let GIPHY_KEY = "5PuWjWVnwpHUQPZK866vd7wQ2qeCeqg7";

		// C.) Build up the URL string.
		let url = GIPHY_URL;
		url += "api_key=" + GIPHY_KEY;

		// D.) Parse the user entered term we wish to search.
		let term = document.querySelector("#searchterm").value;
		displayTerm = term;

		// E.) Remove any leading and trailing spaces.
		term = term.trim();

		// F.) Encode spaces and special characters.
		term = encodeURIComponent(term);

		// G.) If there's no term to search, then bail out of the function ( return; ).
		if (term.length < 1) return;

		// H.) Append the search term to the URL; the parameter name is 'q'.
		url += "&q=" + term;

		// I.) Grab the user chosen search 'limit' from the <select> and append it to the URL.
		let limit = document.querySelector("#limit").value;
		url += "&limit=" + limit;

		// J.) Update the UI.
		document.querySelector("#status").innerHTML = "<br>Searching for '" + displayTerm + "'</br>";

		// K.) See what the URL looks like.
		console.log(url);

		// L.) Request data.
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
		if (!obj.data || obj.data.length == 0){
			document.querySelector("#status").innerHTML = "<br>No results found for '" + displayTerm + "'</br>";
			return;  // Bail Out!
		}

		// I.) Start building an HTML string we will display to the user.
		let results = obj.data;
		console.log("results.length = " + results.length);
		let bigString = "";

		// J.) Loop through the array of results.
		for (let i = 0; i < results.length; i++){
			let result = results[i];

			// K.) Get the URL to the GIF.
			let smallURL = result.images.fixed_width_downsampled.url;
			if (!smallURL) smallURL = "images/no-image-found.png";

			// L.) Get the URL to the GIPHY Page.
			let url = result.url;
			let rating = "N/A";
			if (result.rating) rating = result.rating.toUpperCase();

			// M.) Build a <div> to hold each result.
			// --- Es6 String Templating ---
			let line = `<div class='result'><img src='${smallURL}' title='${result.id}'/>`;
			line += `<span><a target='_blank' href='${url}'>View on Giphy</a></span>`;
			line += `<span>Rating: ${rating}</span></div>`;

			// N.) Another way of doing step M. Replaces below:
			/*
			var line = "<div class='result'>";
				line += "<img src='";
				line += smallURL;
				line += "' title= '";
				line += result.id;
				line += "' />";

				line += "<span><a rarget='_blank' href='" + url + "'>View on Giphy</a></span>";
				line += "</div>";
			*/

			// O.) Add the <div> to 'bigString' and loop.
			bigString += line;
		}

		// P.) All done building the HTML; display to user.
		document.querySelector("#content").innerHTML = bigString;

		// Q.) Update the Status.
		document.querySelector("#status").innerHTML = "<br>Success!</br><p><i>Here are " + results.length + " results for '" + displayTerm + "'</i></p>";
	}


	function dataError(e){
		console.log("An Error Occurred!");
	}