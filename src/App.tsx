import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import Analytics from '@aws-amplify/analytics';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

const NOTSIGNIN = 'You are NOT logged in';
const SIGNEDIN = 'You have logged in successfully';
const SIGNEDOUT = 'You have logged out successfully';
const WAITINGFOROTP = 'Enter OTP number';
const VERIFYNUMBER = 'Verifying number (Country code +XX needed)';

function App() {
  const [message, setMessage] = useState('Welcome to AWS Amplify Demo');
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [otp, setOtp] = useState('');
  const [number, setNumber] = useState('');
  const password = Math.random().toString(10) + 'Abc#';

  useEffect(() => {
    console.log('Ready to auth');
    // Auth.currentCredentials();
    setTimeout(verifyAuth, 1500);
    Analytics.autoTrack('session', {
      enable: true,
    });
  }, []);

  const verifyAuth = () => {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        setUser(user);
        setMessage(SIGNEDIN);
        setSession(null);
      })
      .catch((err) => {
        console.error(err);
        setMessage(NOTSIGNIN);
      });
  };

  const signOut = () => {
    if (user) {
      Auth.signOut();
      setUser(null);
      setOtp('');
      setMessage(SIGNEDOUT);
    } else {
      setMessage(NOTSIGNIN);
    }
  };

  const signIn = () => {
    setMessage(VERIFYNUMBER);
    Auth.signIn(number)
      .then((result) => {
        console.log("Called signIn with following result: ", result)
        setSession(result);
        setMessage(WAITINGFOROTP);
      })
      .catch((e) => {
        if (e.code === 'UserNotFoundException') {
          console.log("New user, signing up first..")
          signUp();
        } else if (e.code === 'UsernameExistsException') {
          console.log("User already exists, signing in")
          setMessage(WAITINGFOROTP);
          signIn();
        } else {
          console.log(e.code);
          console.error(e);
        }
      });
  };

  const signUp = async () => {
    const result = await Auth.signUp({
      username: number,
      password,
      attributes: {
        phone_number: number,
      },
    }).then(() => {
      console.log("User successfully signed up. Signing in now..");
      signIn()
    });
    return result;
  };

  const verifyOtp = async () => {
    console.log("Verifying otp: ", session, otp)
    try{
      const cognitoUser = await Auth.sendCustomChallengeAnswer(session, otp)
      if(cognitoUser){
        const userIsAuthenticated = await isUserAuthenticated()
        if(userIsAuthenticated){
          console.log("Successfully verified otp", cognitoUser)
          setUser(cognitoUser);
          setMessage(SIGNEDIN);
          setSession(null);
        } else {
          console.log('Apparently the user did not enter the right code because the user is not authenticated yet');
        }
      }
    } catch(error){
      console.log("Wrong otp. Signing in again ..", error)
      alert("You failed to give the correct otp code three times!")
      setUser(null)
      setSession(null)
      setMessage(error.message);
      setOtp('');
      console.log(error);
    }

  };

  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <p>{message}</p>
        {!user && !session && (
          <div>
            <InputGroup className='mb-3'>
              <FormControl
                placeholder='Phone Number (+XX)'
                onChange={(event) => setNumber(event.target.value)}
              />
              <InputGroup.Append>
                <Button variant='outline-secondary' onClick={signIn}>
                  Get OTP
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </div>
        )}
        {!user && session && (
          <div>
            <InputGroup className='mb-3'>
              <FormControl
                placeholder='Your OTP'
                onChange={(event) => setOtp(event.target.value)}
                value={otp}
              />
              <InputGroup.Append>
                <Button variant='outline-secondary' onClick={verifyOtp}>
                  Confirm
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </div>
        )}
        <div>
          <ButtonGroup>
            <Button variant='outline-primary' onClick={verifyAuth}>
              Am I signed in?
            </Button>
            <Button variant='outline-danger' onClick={signOut}>
              Sign Out
            </Button>
          </ButtonGroup>
        </div>
      </header>
    </div>
  );
}

export default App;

const isUserAuthenticated = async () => {
  try {
    // This will throw an error if the user is not yet authenticated:
    await Auth.currentSession();
    return true
    // Getting passed this call means the user is succesfully authenticated
    
  } catch(err) {
    return false
  }
}