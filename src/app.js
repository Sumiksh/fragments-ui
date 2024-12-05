// src/app.js

import { Auth, getUser } from './auth';
import { getUserFragments, postFetch, getFragmentById, getFragments } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  //onst postSection = document.querySelector('#postreq');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  //const fragmentId = document.querySelector('#fragmentId');
  // const submitBtnPost = document.querySelector('#submitBtnPost');
  // const submitBtnGetByID = document.querySelector('#submitBtnGetByID');
  // const submitBtnGet = document.querySelector('#submitBtnGet');
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

  submitBtnPost.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default form submission
    postFetch(user); // Call the function on button click
  });

  submitBtnGetByID.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default form submission
    getFragmentById(user); // Call the function on button click
  });

  submitBtnGet.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default form submission
    getFragments(user); // Call the function on button click
  });
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
