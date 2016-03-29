/*
 *
 * ENG1003 2016-S1 Assignment 1 web app
 * 
 * Copyright (c) 2016  Monash University
 *
 * Written by Nawfal Ali
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
*/

var errorCallback = function (e) {
    console.log('Rejected: Use HTTPS protocol!', e);
};


navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

var video  = document.querySelector('video');
var canvas = document.querySelector('canvas');

var messageFinishedFlag = false;   // boolean variable: true if the transmission has ended, false otherwise

var ctx              = canvas.getContext('2d');
var localMediaStream = null;


/*
 * This function retrieves  the list of audio and video resources and selects the rear camera only
 */
MediaStreamTrack.getSources(function (sourceInfos) {
    var audioSource = null;
    var videoSource = null;

    for (var i = 0; i != sourceInfos.length; ++i)
    {
        var sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === 'audio')
        {
            console.log(sourceInfo.id, sourceInfo.label || 'microphone');

            audioSource = sourceInfo.id;
        }
        else if (sourceInfo.kind === 'video')
        {
            console.log(sourceInfo.id, sourceInfo.label || 'camera');

            videoSource = sourceInfo.id;
        }
        else
        {
            console.log('Some other kind of source: ', sourceInfo);
        }
    }

    sourceSelected(audioSource, videoSource);
});


function sourceSelected(audioSource, videoSource)
{
    var constraints = {
        audio: false,
        video: {
            optional: [{sourceId: videoSource}]
        }
    };

    if (navigator.getUserMedia)
    {
        navigator.getUserMedia(constraints, function (stream) {
            video.src        = window.URL.createObjectURL(stream);
            localMediaStream = stream;
            //   updateImageData();
            //   requestAnimationFrame(draw);
        }, errorCallback);
    }
    else
    {
        video.src = 'somevideo.webm'; // fallback.
    }
}


function snapshot()
{
    var imageData;
    var imageStatus;
    if (localMediaStream)
    {
        canvas.setAttribute('width', 180);
        canvas.setAttribute('height', 240);
        ctx.drawImage(video, 66, 100, 320, 480, 0, 0, 120, 180);
        imageData   = ctx.getImageData(0, 0, 120, 180).data;
        imageStatus = decodeCameraImage(imageData);
        if (!messageFinishedFlag)
        {    
            // Used to ignore the last image since the image status is currently green due to call messageFinish function.
            setImageStatus((imageStatus) ? 'onSignal' : 'offSignal');
        }
    }
}

var capturingInterval;  // SetInterval pointer
var unitTime = 200;     // camera capturing interval


/*
 * timeout function to ensure the video is fully loaded in order to avoid this error:
 * Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The source width is 0
 */
setTimeout(function () {
    capturingInterval = setInterval(snapshot, unitTime);
}, 2000);


function messageFinished()
{
    clearInterval(capturingInterval);
    setImageStatus('ready');
    messageFinishedFlag = true;
}


/*
 * This function is called when the user clicks the restart button
 */
document.getElementById('restartButton').onclick = function () {

    clearInterval(capturingInterval);
    setImageStatus('restart');
    capturingInterval   = setInterval(snapshot, unitTime);
    messageFinishedFlag = false;
};


/*
 * This function accepts three input strings:
 *   * 'onSignal' : red status
 *   * 'offSignal' : Blue status
 *   * 'ready': Green Status
 *   * 'restart': green status
 */
function setImageStatus(status)
{
    if (status === 'onSignal')
    {
        document.getElementById("imgStatus").className = "mdl-button mdl-js-button mdl-button--fab mdl-color--red";
    }
    else if (status === 'offSignal')
    {
        document.getElementById("imgStatus").className = "mdl-button mdl-js-button mdl-button--fab mdl-color--blue";
    }
    else if (status === 'ready')
    {
        document.getElementById("imgStatus").className = "mdl-button mdl-js-button mdl-button--fab mdl-color--green";
        document.getElementById("spinner").classList.remove('is-active');  // Stop the spinner
    }
    else if (status === 'restart')
    {
        document.getElementById("imgStatus").className = "mdl-button mdl-js-button mdl-button--fab mdl-color--green";
        document.getElementById("spinner").classList.add('is-active');   // Start the spinners
    }
}
