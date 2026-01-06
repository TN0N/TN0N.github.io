
console.log("scripts")
/*const sources = await fetch('sources.json')
  .then(response => response.json())
  .catch(error => console.error('Error loading JSON:', error));*/

//Select elements
const closeButton = document.getElementById("closeButton");
const prompt = document.getElementById("prompt");
const promptVideo = document.getElementById("promptVideo");
const promptVideoSource = document.getElementById('promptVideoSource');


let playlistLength = 0; // must match server array length
let currentIndex = 0;

//Add event listeners
closeButton.addEventListener("click", closePrompt);
promptVideo.addEventListener("ended", playNext);

async function initPlaylist() {
    const res = await fetch("https://opoly-sparkling-hill-3775.fly.dev/playlist");
    const { length } = await res.json();

    console.log(length);
    playlistLength = length;
    console.log("Playlist length:", playlistLength);

    playCurrent();
}

function playCurrent() {
    promptVideo.src = `https://opoly-sparkling-hill-3775.fly.dev/video/${currentIndex}`;
    /*promptVideo.src = `http://localhost:3000/video/${currentIndex}`;*/
    promptVideo.load();
    promptVideo.play();
}
function playNext(){
    currentIndex++;
    if (currentIndex < playlistLength) {
      playCurrent();
    } else {
      console.log("Playlist finished");
    }
}

//Define behaviours
function closePrompt(){
    //prompt.style.display = "none";
    //promptVideoSource.src = null;
    console.log("closing prompt")
}
initPlaylist();
/*
async function showPrompt(title, text, img, video) {
    
    if (video == null) {
        promptVideo.style.display = "none";
        promptImage.style.display = "block";
    } else {
        let source = await spicyVideo();
        promptVideo.style.display = "block";
        promptImage.style.display = "none";
        
        // Remove all existing source elements
        while (promptVideo.firstChild) {
            promptVideo.removeChild(promptVideo.firstChild);
        }
        
        // Create new source element
        const newSource = document.createElement('source');
        newSource.src = source;
        newSource.type = 'video/mp4'; // Adjust type if needed
        
        // Add the new source and load the video
        promptVideo.appendChild(newSource);
        promptVideo.load();
    }
}
async function spicyVideo()
{
    /*let source_number = Math.floor(Math.random() * sources.length) + 1;
    
    console.log(source_number, sources[source_number]);
    return sources[source_number];
    return "https://opoly.fly.dev/video/0";
}*/