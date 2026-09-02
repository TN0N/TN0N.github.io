import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyABExr-Jx2pMn7G8u_fXtG2HrBAaiFulmY",
  authDomain: "videos-ac477.firebaseapp.com",
  projectId: "videos-ac477",
  storageBucket: "videos-ac477.firebasestorage.app",
  messagingSenderId: "973491972666",
  appId: "1:973491972666:web:b5ea6ee7ca6f722d652303"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const docRef = doc(db, "videos", "first");
const docSnap = await getDoc(docRef);



class Video
{
    constructor(code, title, image, src, tags)
    {
        this.code = code,
        this.title = title,
        this.image = image,
        this.src = src,
        this.tags = tags
    }
    toString()
    {
        return this.code + " " + this.title + " " + this.image + " " + this.src + " " + this.tags;
    }
}

const videoConverter =
{
    toFirestore: (video) => {
        return {
            code: video.code,
            title: video.title,
            image: video.image,
            src: video.src,
            tags: video.tags
        }
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new Video(data.code, data.title, data.image, data.src, data.tags);
    }
}
//console.log(videoConverter.fromFirestore(docSnap));
/*
await addDoc(collection(db, "messages"), {
  text: "Hello from GitHub Pages!",
  createdAt: new Date()
});*/
const sources_url = 'sources.json';
const ERROR_LOADING_JSON = 'Error loading JSON:';
const videoListingClass = 'videoListing';
const videoColumnClass = 'videoColumn';
const videoRowClass = 'videoRow';
const videoTableClass = 'videoTable';
const listingColumns = 4;

let VIDEOS_COUNT = 0;
let INDEX = 0;
let VIDEOS;


async function loadData() {

  let list = [];

  const querySnapshot = await getDocs(collection(db, "videos"));

  querySnapshot.forEach((doc) => {
    list.push(doc.data());
  });

  // Shuffle the array
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  return list;
    /*
  try {
    const response = await fetch(sources_url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error(ERROR_LOADING_JSON, error);
    return null;
  }*/
}

function buildLink(video)
{
  const link = document.createElement('a');
  link.addEventListener('click', async ()=>{
    const videos_watched_ref = collection(db, "videos_watched");
    const videos_ref = collection(db, "videos_watched");
    await setDoc(doc(videos_watched_ref, video.code), videoConverter.toFirestore(video));
    await deleteDoc(doc(videos_ref, video.code));
  });
  link.href = video.src;
  link.appendChild(buildVideo(video));
  return link;
}

function buildVideo(video) {
  const videoListing = document.createElement('img');
  videoListing.src = video.image;
  videoListing.classList.add(videoListingClass);
  return videoListing;
}
 
function buildColumn(video) {
  const column = document.createElement('td');
  column.classList.add(videoColumnClass);
  if (video) {
    column.appendChild(buildLink(video));
  }
  return column;
}
 
function buildRow(videos) {
  const row = document.createElement('tr');
  row.classList.add(videoRowClass);
  for (const video of videos) {
    row.appendChild(buildColumn(video));
  }
  return row;
}

async function shiftRight()
{
  console.log("shifting right");
  if (INDEX < VIDEOS_COUNT + listingColumns){
    INDEX += listingColumns;
    await buildTable(document.getElementById("videoTable"), getVideos(VIDEOS, INDEX, listingColumns));
  }
}
async function shiftLeft()
{
  console.log("shifting left");
  if (0 > INDEX - listingColumns){
    INDEX -= listingColumns;
    await buildTable(document.getElementById("videoTable"), getVideos(VIDEOS, INDEX, listingColumns));
  }
}
function getVideos(videos, index, number)
{
  console.log(index, number);
  return videos.slice(index, index + number);
}


function buildTable(table, videos) {
  //table.classList.add(videoTableClass);

  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }

  const rowCount = Math.ceil(videos.length / listingColumns);

  for (let i = 0; i < rowCount; i++) {
    const index = i * listingColumns;
    const row_videos = [];
    for (let j = index; j < Math.min(index + listingColumns, videos.length); j++) {
      row_videos.push(videos[j]);
    }
    table.appendChild(buildRow(row_videos));
  }
  return table;
}
 

async function uploadToFirestore(videos)
{
  const videos_ref = collection(db, "videos");
  for (let video in videos)
  {
    await setDoc(doc(videos_ref, videos[video].code), videoConverter.toFirestore(videos[video]));
  }
}
async function buildPage() {
  VIDEOS = await loadData();

  document.getElementById("left").addEventListener('click', shiftLeft);
  document.getElementById("right").addEventListener('click', shiftRight);


  //await uploadToFirestore(VIDEOS);
  VIDEOS_COUNT = VIDEOS.length;
  if (!VIDEOS) {
    console.error('No video data available; aborting page build.');
    return;
  }
  if (document.body.getElementsByClassName(videoTableClass)[0]!=null)
    document.body.removeChild(document.body.getElementsByClassName(videoTableClass)[0]);

  let table = document.getElementById("videoTable");
  await buildTable(table, getVideos(VIDEOS, INDEX, listingColumns));
}
 
buildPage();



