// src/app.js

import { Auth, getUser } from './auth';
import { getUserFragments, postFetch, getFragmentById, getFragments, uploadImage } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  //onst postSection = document.querySelector('#postreq');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  //const fragmentId = document.querySelector('#fragmentId');

  // For POST request
  const submitBtnPost = document.querySelector('#submitBtnPost');
  const searchInput = document.getElementById('searchPost');
  const contentTypeSelect = document.getElementById('contentTypeSelect');
  const fragmentContainer = document.getElementById('dataFromPost');

  // For GET by ID request
  const submitBtnGetByID = document.querySelector('#submitBtnGetByID');
  const fragmentById = document.getElementById('searchgetById');
  var fragmentContainerInd = document.getElementById('individual-fragment');

  //For Get all fragments request
  const submitBtnGet = document.querySelector('#submitBtnGet');
  const fragmentContainerList = document.getElementById('fragment-list');

  const fileInput = document.getElementById('imageUpload');
  const dropArea = document.getElementById('dropArea');
  const submitButton = document.getElementById('submitBtnPostImg');
  const contentTypeSelectImg = document.getElementById('contentTypeSelectImg');
  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    //postSection.hidden = true;
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;
  //postSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  // Do an authenticated request to the fragments API server and log the result
  const userFragments = await getUserFragments(user);

  submitBtnPost.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent the default form submission
    let data = await postFetch(user, searchInput.value, contentTypeSelect.value); // Call the function on button click
    //const fragmentContainer = document.getElementById('dataFromPost');
    fragmentContainer.innerHTML = ''; // Clear previous data
    if (data.length === 0) {
      fragmentContainer.innerHTML = '<p>No fragments found</p>';
      return;
    }
    fragmentContainer.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  });


  submitBtnGetByID.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent the default form submission
    const { newData, contentType } = await getFragmentById(user, fragmentById.value); // Call the function on button click
    console.log('1-newData', newData, 'contentType', contentType);
    //const fragmentContainer = document.getElementById('individual-fragment');
    fragmentContainerInd.innerHTML = ''; // Clear previous content

    if (contentType && contentType.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = newData;
      img.alt = `Fragment ID: ${fragmentById.value}`;
      img.style.maxWidth = '100%';
      // Append the image to the fragment container
      fragmentContainerInd.appendChild(img);
      // Optional: Revoke the object URL to free up memory after the image is loaded
      img.onload = function () {
        URL.revokeObjectURL(imageUrl);
      };
    } else {
      console.log('newData', newData);
      fragmentContainerInd.innerText = JSON.stringify(newData);
    }
  });
  

  submitBtnGet.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent the default form submission
    let data = await getFragments(user); // Call the function on button click
    fragmentContainerList.innerHTML = '';
    if (data.length === 0) {
      fragmentContainerList.innerHTML = '<p>No fragments found</p>';
      return;
    }
    fragmentContainerList.innerHTML = JSON.stringify(data);
  });

  // Drag-and-Drop Handlers
  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = '#000'; // Highlight on dragover
  });

  dropArea.addEventListener('dragleave', () => {
    dropArea.style.borderColor = '#ccc'; // Reset border color
  });

  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelection(file);
  });

  // File Input Change Handler
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFileSelection(file);
  });

  // Handle File Selection (Store File)
  function handleFileSelection(file) {
    if (file && file.type.startsWith('image/')) {
      selectedFile = file; // Store the selected file
      console.log('File selected:', selectedFile);
      //alert(`File "${file.name}" selected. Ready for upload.`);
    } else {
      //alert('Please select a valid image file.');
      console.log('Please select a valid image file.');
      selectedFile = null; // Clear the stored file if invalid
    }
  }

  // Submit Button Handler
  submitButton.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select an image file before submitting.');
      return;
    }

    const contentType = contentTypeSelectImg.value;
    console.log('Selected Content Type:', contentType);
    console.log('contentTypeSelect', contentTypeSelectImg);
    // Prepare the file for upload
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('contentType', contentType);

    console.log('Submitting file:', selectedFile);
    console.log('Selected Content Type:', contentType);

    // Trigger the API call
    await uploadImage(user, formData, contentType);
  });
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
