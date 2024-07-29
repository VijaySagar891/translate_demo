// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/*
ABOUT THIS NODE.JS EXAMPLE: This example works with the AWS SDK for JavaScript version 3 (v3),
which is available at https://github.com/aws/aws-sdk-js-v3.

Purpose:
index.js is part of a tutorial demonstrating how to:
- Transcribe speech in real-time using Amazon Transcribe
- Detect the language of the transcription using Amazon Comprehend
- Translate the transcription using Amazon Translate
- Send the transcription and translation by email using Amazon Simple Email Service (Amazon SES)
*/

// snippet-start:[transcribe.JavaScript.streaming.indexv3]
const recordButton = document.getElementById("record");
const interpretButton = document.getElementById("interpret");
const transcribedText = document.getElementById("transcribedText");
const translatedText = document.getElementById("translatedText");
const translationLanguageList = document.getElementById(
  "translationLanguageList",
);
import * as awsID from "./libs/awsID.js";
const email = document.getElementById("email")
import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

import { Polly } from "@aws-sdk/client-polly";
import { getSynthesizeSpeechUrl } from "@aws-sdk/polly-request-presigner";


const audio_data = "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";

const translateClient = new TranslateClient({
    region: awsID.REGION,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: awsID.REGION }),
      identityPoolId: awsID.IDENTITY_POOL_ID,
    }),
});

const PollyClient = new Polly({
  region: awsID.REGION,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: awsID.REGION }),
    identityPoolId: awsID.IDENTITY_POOL_ID, // IDENTITY_POOL_ID
  }),
});

// Set the parameters
const SpanishTextToSpeech = {
  OutputFormat: "mp3", // For example, 'mp3'
  LanguageCode: 'es-US',
  Text: "", // The 'speakText' function supplies this value
  TextType: "text", // For example, "text"
  VoiceId: "Miguel", // For example, "Matthew"
};

const EnglishTextToSpeech = {
  OutputFormat: "mp3", // For example, 'mp3'
  LanguageCode: 'en-US',	
  Text: "", // The 'speakText' function supplies this value
  TextType: "text", // For example, "text"
  VoiceId: "Joanna", // For example, "Matthew"
};

const bufferedSpeech = [];

window.onRecordPress = () => {
  if (recordButton.getAttribute("class") === "recordInactive") {
    startRecording();
  } else {
    stopRecording();
  }
};

const startRecording = async () => {
  window.clearTranscription();
  recordButton.setAttribute("class", "recordActive");
  try {
    const { startRecording } = await import("./libs/transcribeClient.js");
    await startRecording(onTranscriptionDataReceived);
  } catch (error) {
    alert("An error occurred while recording: " + error.message);
    await stopRecording();
  }
};

const onTranscriptionDataReceived = (language, text) => {
  console.log("Translating" + language + ", " + text )	  
  if (language == 'en-US') {
    transcribedText.innerHTML += text

    const translateParams = {
      Text: text,
      SourceLanguageCode: 'en-US',
      TargetLanguageCode: 'es-US',
    };
    translateClient
		  .send(new TranslateTextCommand(translateParams))
		  .then((data) => {translatedText.innerHTML += data.TranslatedText; return data.TranslatedText;})
	          .then((spanishText) => {
			  bufferedSpeech.push({lang:'es-US', text: spanishText}); 
			  // interpretButton.setAttribute("class", "recordActive")
		  });		  
    console.log("Sent language for translation")	  
  } else {
    translatedText.innerHTML += text;

    const translateParams = {
      Text: text,
      SourceLanguageCode: 'es-US',
      TargetLanguageCode: 'en-US',	    
    };
    translateClient.send(new TranslateTextCommand(translateParams))
	  .then((data) => {transcribedText.innerHTML += data.TranslatedText; return data.TranslatedText;})
	  .then((englishText) => {
		  bufferedSpeech.push({lang: 'en-US', text: englishText});
		  // interpretButton.setAttribute("class", "recordActive");
	  });
  }
};

var Sound = (function () {
    var df = document.createDocumentFragment();
    return function Sound(src) {
        var snd = new Audio(src);
        df.appendChild(snd); // keep in fragment until finished playing
        snd.addEventListener('ended', function () {df.removeChild(snd);});
        snd.play();
        return snd;
    }
}());

const playNextAudio = async function () {
	    /*
      SpanishTextToSpeech.Text = buff.text;
      PollyClient.synthesizeSpeech(SpanishTextToSpeech, function(err, data) {
        if (err) console.log(err, err.stack);
	else {
          console.log("Will play " + buff.text);
          result = data.AudioStream.;	
	  console.log("Result is : " + result);
	  var snd = new Audio();                  		
	  snd.audio.src = window.URL.createObjectURL(new Blob(result, {type: 'audio/mp3'}));	
	  console.log("Created audio", JSON.stringify(data));
	  snd.play();	
	  console.log("Playing audio");	

          snd.addEventListener('ended', function() {
            console.log("Ended playing ");		  
	    playNextAudio();
	  })
	}
      });
      */
    }
  }
}

window.Interpret = () => {
  playNextAudio().then(() => {}); 
  // interpretButton.setAttribute("class", "recordInactive");
}


const stopRecording = async function () {
  recordButton.setAttribute("class", "recordInactive");
  const { stopRecording } = await import("./libs/transcribeClient.js");
  stopRecording();
};


window.translateText = async () => {
/*	
  const sourceText = transcribedText.innerHTML;
  if (sourceText.length === 0) {
    alert("No text to translate!");
    return;
  }
  const targetLanguage = translationLanguageList.value;
  if (targetLanguage === "nan") {
    alert("Please select a language to translate to!");
    return;
  }
  try {
    const { translateTextToLanguage } = await import(
      "./libs/translateClient.js"
    );
    const translation = await translateTextToLanguage(
      sourceText,
      targetLanguage,
    );
    if (translation) {
      translatedText.innerHTML = translation;
    }
  } catch (error) {
    alert("There was an error translating the text: " + error.message);
  }
  */
};

window.clearTranscription = () => {
  transcribedText.innerHTML = "";
  translatedText.innerHTML = "";
};
// snippet-end:[transcribe.JavaScript.streaming.indexv3]
