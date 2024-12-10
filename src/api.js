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

export async function postFetch(user, inputValue, selectedContentType) {
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
    return data;
  } catch (error) {
    console.error('Error:', error); // Handle errors like network issues
    alert('An error occurred while processing your request.');
  }
  //};
}


//alternate way for content-type from headers
export async function getFragmentById(user, fragmentId) {
  console.log('Fragment ID:', fragmentId);

  // Split the fragmentId at the dot
  //const [id, contentTypeSuffix] = fragmentId.split('.');
  let id, contentTypeSuffix;
  if (fragmentId.includes('.')) {
    [id, contentTypeSuffix] = fragmentId.split('.');
  } else {
    id = fragmentId; // Use the entire fragmentId if no extension is present
    contentTypeSuffix = undefined; // Explicitly set undefined for clarity
  }
  console.log('ID:', id, 'contentTypeSuffix', contentTypeSuffix);
  console.log('check Fragment ID:', fragmentId);
  console.log(`${apiUrl}/v1/fragments/${encodeURIComponent(fragmentId)}`)
  try {
    const response = await fetch(`${apiUrl}/v1/fragments/${encodeURIComponent(fragmentId)}`, {
      method: 'GET',
      headers: {
        // 'Content-Type': contentTypeSent,
        Authorization: `Bearer ${user.idToken}`,
      },
    });

    if (!response.ok) {
      console.log('Response not ok', response.status, response.statusText);
      throw new Error(`${response.status} ${response.statusText}`);
    }


    const contentType = response.headers.get('Content-Type');
    console.log('Content-Type from response:', contentType);
    // If it's an image, handle it as a blob
    if (contentType && contentType.startsWith('image/')) {
      const blob = await response.blob(); // Convert the binary data to a Blob

      // Step 1: Convert the Blob to a Uint8Array (if needed)
      const arrayBuffer = await blob.arrayBuffer();
      const binaryData = new Uint8Array(arrayBuffer); // Now you have the binary data in a Uint8Array
      console.log('Binary Data:', binaryData);

      // Step 2: Create a URL for the Blob
      const imageUrl = URL.createObjectURL(blob); // Create a URL for the Blob
      console.log('Image URL:', imageUrl, 'contentType:', contentType);
      return { newData: imageUrl, contentType: contentType };
    } else {
      // Otherwise, handle it as text or JSON
      let data;
      if (contentType && contentType === 'application/json') {
        data = await response.json();
      } else {
        data = await response.text();
      }
      console.log('Data:', data, 'conTentType:', contentType);
      return { newData: data, contentType: contentType };
    }
  } catch (error) {
    alert(`An error occurred while processing your request.${error}`);
  }
}

// Simulated Upload Function
export async function uploadImage(user, formData, contentType) {
  try {
    const response = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        Authorization: `Bearer ${user.idToken}`,
      },
      body: formData,
    });
    const data = await response.json();
    const fragmentContainer = document.getElementById('dataFromPostImg');
    fragmentContainer.innerHTML = ''; // Clear previous data
    if (data.length === 0) {
      fragmentContainer.innerHTML = '<p>No fragments found</p>';
      return;
    }
    fragmentContainer.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    console.log('Upload successful:', data);
  } catch (error) {
    console.error('Error uploading image:', error);
  }
}

export async function getFragments(user) {
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
    console.log(data);
    return data;
  } catch (error) {
    alert('An error occurred while processing your request.');
  }
}

export async function deleteFragment(user, fragmentId) {
  try {
    const response = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while processing your request.');
  }
}
