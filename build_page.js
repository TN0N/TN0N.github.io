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
  }
}

function buildLink(video)
{
  const link = document.createElement('a');
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
    await document.body.removeChild(document.body.getElementsByClassName(videoTableClass)[0]);
    console.log(getVideos(VIDEOS, INDEX, listingColumns));
    await document.body.appendChild(buildTable(getVideos(VIDEOS, INDEX, listingColumns)));
  }
}
async function shiftLeft()
{
  console.log("shifting left");
  if (0 > INDEX - listingColumns){
    INDEX -= listingColumns;
    await document.body.removeChild(document.body.getElementsByClassName(videoTableClass)[0]);
    console.log(getVideos(VIDEOS, INDEX, listingColumns));
    await document.body.appendChild(buildTable(getVideos(VIDEOS, INDEX, listingColumns)));
  }
}
function getVideos(videos, index, number)
{
  console.log(index, number);
  return videos.slice(index, index + number);
}


function buildTable(videos) {
  const table = document.createElement('table');
  table.classList.add(videoTableClass);
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
 
async function buildPage() {
  VIDEOS = await loadData();
  VIDEOS_COUNT = VIDEOS.length;
  if (!VIDEOS) {
    console.error('No video data available; aborting page build.');
    return;
  }
  if (document.body.getElementsByClassName(videoTableClass)[0]!=null)
    document.body.removeChild(document.body.getElementsByClassName(videoTableClass)[0]);

  
  document.body.appendChild(buildTable(getVideos(VIDEOS, INDEX, listingColumns)));
}
 
buildPage();