// src/api.js

// fragments microservice API to use, defaults to localhost:8080 if not set in env
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user) {
  console.log('Requesting user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass.
      // We are using the `authorizationHeaders()` helper method we defined
      // earlier, to automatically attach the user's ID token.
      headers: user.authorizationHeaders(),
    });
    console.log('Auth header is',  user.authorizationHeaders() );
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully got user fragments data', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}


export async function postFetch(user) {
  const submitBtn = document.getElementById('submitBtnPost'); // Get the submit button
  const searchInput = document.getElementById('searchPost'); // Get the input field

  submitBtn.onclick = async (event) => {
    event.preventDefault(); 
    const inputValue = searchInput.value; 
    console.log('Input value:', inputValue, typeof inputValue);
    try {
      const response = await fetch(`${apiUrl}/v1/fragments`, {
        method: 'POST',
        headers: {
          //'Content-Type': 'application/json',
          'Content-Type': 'text/plain', 
          'Authorization': `Bearer ${user.idToken}`
          //headers: user.authorizationHeaders() 
        },
        //body: JSON.stringify({ query: inputValue }) 
        body: inputValue
      });

      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); // Parse the JSON response
      console.log('Response data:', data); // Log response data

      // Optionally, update the UI or handle the response data here
    } catch (error) {
      console.error('Error:', error); // Handle errors like network issues
      alert('An error occurred while processing your request.');
    }
  }
}


export async function getFragmentById(user) {
  const submitBtn = document.getElementById('submitBtnGetByID'); // Get the submit button
  const fragmentById = document.getElementById('searchgetById');
  submitBtn.onclick = async (event) => {
    const fragmentId = fragmentById.value;
    event.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
        headers: {
          //headers: user.authorizationHeaders(),
          'Content-Type': 'text/plain', 
          'Authorization': `Bearer ${user.idToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const fragmentContainer = document.getElementById('individual-fragment');
      fragmentContainer.innerHTML = ''; // Clear previous data
      if(data.length === 0) {
        fragmentContainer.innerHTML = '<p>No fragments found</p>';
        return;
      }
      fragmentContainer.innerHTML = JSON.stringify(data.fragment)
      console.log("Successfully got fragment by id", data)
    } catch (error) {
      console.error('Error:', error); // Handle errors like network issues
      alert('An error occurred while processing your request.');
    }
  }
}


export async function getFragments(user) {
  const submitBtn = document.getElementById('submitBtnGet'); 
  submitBtn.onclick = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/v1/fragments`, {
        headers: {
          //headers: user.authorizationHeaders(),
          'Content-Type': 'text/plain', 
          'Authorization': `Bearer ${user.idToken}`
        }
      })
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log("getFragments", data)
      // Display the fragments on the page
      const fragmentContainer = document.getElementById('fragment-list');
      fragmentContainer.innerHTML = ''; // Clear previous data
      if(data.length === 0) {
        fragmentContainer.innerHTML = '<p>No fragments found</p>';
        return;
      }
      fragmentContainer.innerHTML = data.fragmentList
    } catch (error) {
      console.error('Error:', error); // Handle errors like network issues
      alert('An error occurred while processing your request.');
    }
  }
}