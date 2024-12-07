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

// export async function getFragmentById(user) {
//   const submitBtn = document.getElementById('submitBtnGetByID');
//   const fragmentById = document.getElementById('searchgetById');

//   const fragmentId = await fragmentById.value; // e.g., "12345.json" or "67890.text"
//   console.log('Fragment ID:', fragmentId);
//   // Split the fragmentId at the dot
//   const [id, contentTypeSuffix] = await fragmentId.split('.');
//   console.log('ID:', id, contentTypeSuffix);
//   // Determine the content type using if statements
//   let contentType;
//   if (contentTypeSuffix === 'json') {
//     contentType = 'application/json';
//   } else if (contentTypeSuffix === 'txt') {
//     contentType = 'text/plain';
//   } else if (contentTypeSuffix === 'html') {
//     contentType = 'text/html';
//   } else if (contentTypeSuffix === 'md') {
//     contentType = 'text/markdown';
//   } else if (contentTypeSuffix === 'image/png') {
//     contentType = 'image/png';
//   } else if (contentTypeSuffix === 'image/jpeg') {
//     contentType = 'image/jpeg';
//   } else if (contentTypeSuffix === 'image/gif') {
//     contentType = 'image/gif';
//   } else if (contentTypeSuffix === 'image/avif') {
//     contentType = 'image/avif';
//   } else if (contentTypeSuffix === 'image/webp') {
//     contentType = 'image/webp';
//   }

//   submitBtn.onclick = async (event) => {
//     const fragmentId = await fragmentById.value;
//     console.log('check Fragment ID:', fragmentId);
//     event.preventDefault();

//     try {
//       const response = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
//         headers: {
//           'Content-Type': contentType,
//           Authorization: `Bearer ${user.idToken}`,
//         },
//       });
//       //const res = await response.json()
//       //console.log('Response:', res);
//       if (!response.ok) {
//         console.log('Response not ok', response.status, response.statusText);
//         throw new Error(`${response.status} ${response.statusText}`);
//       }

//       const data = contentTypeSuffix !== undefined ? await response.json() : await response.text();
//       //const data = await response.json();
//       console.log('returned final', data, typeof data, JSON.stringify(data));
//       const fragmentContainer = document.getElementById('individual-fragment');
//       fragmentContainer.innerHTML = '';

//       if (data.length === 0) {
//         fragmentContainer.innerHTML = '<p>No fragments found</p>';
//         return;
//       } else if (
//         contentTypeSuffix === 'image/png' ||
//         contentTypeSuffix === 'image/jpeg' ||
//         contentTypeSuffix === 'image/gif' ||
//         contentTypeSuffix === 'image/avif' ||
//         contentTypeSuffix === 'image/webp'
//       ) {
//         const blob = await response.blob(); // Convert the binary data to a Blob
//         const imageUrl = URL.createObjectURL(blob); // Create a URL for the Blob

//         // Display the image in an <img> element
//         const fragmentContainer = document.getElementById('individual-fragment');
//         fragmentContainer.innerHTML = ''; // Clear previous content
//         const img = document.createElement('img');
//         img.src = imageUrl;
//         img.alt = `Fragment ID: ${fragmentId}`;
//         img.style.maxWidth = '100%';
//         fragmentContainer.appendChild(img);
//       } else {
//       fragmentContainer.innerText = JSON.stringify(data);
//       }
//     } catch (error) {
//       alert(`An error occurred while processing your request.${error}`);
//     }
//   };
// }

//alternate way for content-type from headers
export async function getFragmentById(user, fragmentId) {
  //const submitBtn = document.getElementById('submitBtnGetByID');
  //const fragmentById = document.getElementById('searchgetById');
  //const fragmentId = await fragmentById.value; // e.g., "12345.json" or "67890.txt"
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
      //return imageUrl, contentType;
      // Display the image in an <img> tag
      // const fragmentContainer = document.getElementById('individual-fragment');
      // fragmentContainer.innerHTML = ''; // Clear previous content

      // const img = document.createElement('img');
      // img.src = imageUrl;
      // img.alt = `Fragment ID: ${fragmentId}`;
      // img.style.maxWidth = '100%';

      // // Append the image to the fragment container
      // fragmentContainer.appendChild(img);

      // // Optional: Revoke the object URL to free up memory after the image is loaded
      // img.onload = function() {
      //   URL.revokeObjectURL(imageUrl);
      // };
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
      // const fragmentContainer = document.getElementById('individual-fragment');
      // fragmentContainer.innerHTML = ''; // Clear previous content
      // if (data.length === 0) {
      //   fragmentContainer.innerHTML = '<p>No fragments found</p>';
      // } else {
      //   // If it's JSON or text, display the content
      //   fragmentContainer.innerText = JSON.stringify(data);
      // }
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
    //alert('Image uploaded successfully!');
  } catch (error) {
    console.error('Error uploading image:', error);
    //alert('Failed to upload image.');
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
