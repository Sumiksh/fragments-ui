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
    console.log('Auth header is', user.authorizationHeaders());
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
  const contentTypeSelect = document.getElementById('contentTypeSelect');

  submitBtn.onclick = async (event) => {
    event.preventDefault();
    const inputValue = searchInput.value;
    const selectedContentType = contentTypeSelect.value;
    console.log(
      'Input value:',
      inputValue,
      typeof inputValue,
      selectedContentType,
      typeof selectedContentType
    );
    try {
      const response = await fetch(`${apiUrl}/v1/fragments`, {
        method: 'POST',
        headers: {
          'Content-Type': selectedContentType,
          Authorization: `Bearer ${user.idToken}`,
        },
        body: selectedContentType === 'application/json' ? JSON.stringify(inputValue) : inputValue,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); // Parse the JSON response
      console.log('Response data:', data); // Log response data

      // Display the fragments on the page
      const fragmentContainer = document.getElementById('dataFromPost');
      fragmentContainer.innerHTML = ''; // Clear previous data
      if (data.length === 0) {
        fragmentContainer.innerHTML = '<p>No fragments found</p>';
        return;
      }
      fragmentContainer.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (error) {
      console.error('Error:', error); // Handle errors like network issues
      alert('An error occurred while processing your request.');
    }
  };
}

export async function getFragmentById(user) {
  const submitBtn = document.getElementById('submitBtnGetByID');
  const fragmentById = document.getElementById('searchgetById');

  const fragmentId = fragmentById.value; // e.g., "12345.json" or "67890.text"
  console.log('Fragment ID:', fragmentId);
  // Split the fragmentId at the dot
  const [id, contentTypeSuffix] = fragmentId.split('.');
  console.log('ID:', id, contentTypeSuffix);
  // Determine the content type using if statements
  let contentType;
  if (contentTypeSuffix === 'json') {
    contentType = 'application/json';
  } else if (contentTypeSuffix === 'text') {
    contentType = 'text/plain';
  } else if (contentTypeSuffix === 'html') {
    contentType = 'text/html';
  } else if (contentTypeSuffix === 'md') {
    contentType = 'text/markdown';
  } else {
    contentType = 'text/plain';
  }

  submitBtn.onclick = async (event) => {
    const fragmentId = fragmentById.value;
    console.log('Fragment ID:', fragmentId);
    event.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
        headers: {
          'Content-Type': contentTypeSuffix,
          Authorization: `Bearer ${user.idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('returned final', data, typeof data, JSON.stringify(data));
      const fragmentContainer = document.getElementById('individual-fragment');
      fragmentContainer.innerHTML = '';

      if (data.length === 0) {
        fragmentContainer.innerHTML = '<p>No fragments found</p>';
        return;
      }

      fragmentContainer.innerHTML = JSON.stringify(data);
    } catch (error) {
      alert('An error occurred while processing your request.');
    }
  };
}

export async function getFragments(user) {
  const submitBtn = document.getElementById('submitBtnGet');
  submitBtn.onclick = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/v1/fragments`, {
        headers: {
          'Content-Type': 'text/plain',
          Authorization: `Bearer ${user.idToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const data = await response.json();

      // Display the fragments on the page
      const fragmentContainer = document.getElementById('fragment-list');
      fragmentContainer.innerHTML = '';
      if (data.length === 0) {
        fragmentContainer.innerHTML = '<p>No fragments found</p>';
        return;
      }
      fragmentContainer.innerHTML = JSON.stringify(data);
    } catch (error) {
      alert('An error occurred while processing your request.');
    }
  };
}
