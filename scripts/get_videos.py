import asyncio
import aiohttp
from bs4 import BeautifulSoup
import json
import re

URL_TEMPLATE = "https://www.bellesa.co/videos?categories=mfm,fmf,passionate,rough,anal,story,sensual,bondage,homemade,hot-guy,big-cock,squirt,orgy,eating-out&page={}&providers=nubile-films,dorcelclub,sweet-sinner,new-sensations,eroticax,white-boxxx,tushy,deeper,vixen,nfbusty,deeplush,sinfulxxx,tushyraw,joybear,hardx,passionhd,21sextury,babes,sexyhub,xxxshades,fantasy-massage,sexart,21naturals,sweetheart-video,bellesa-films"
HEADERS = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "accept-language": "en-GB,en;q=0.8",
    "priority": "u=0, i",
    "sec-ch-ua": "\"Brave\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "sec-gpc": "1",
    "upgrade-insecure-requests": "1"
}
REGEX_DATA = re.compile(r'window\.__INITIAL_DATA__\s*=\s*(\{.*\});?', re.DOTALL)

CONCURRENT_REQUESTS = 20

async def fetch(session, i):
    url = URL_TEMPLATE.format(i)
    try:
        async with session.get(url, headers=HEADERS, timeout=10) as resp:
            if resp.status != 200:
                return [], False

            text = await resp.text()
            soup = BeautifulSoup(text, 'html.parser')
            script_tag = soup.find('script', id='data-script')
            if not script_tag:
                return [], False

            match = REGEX_DATA.search(script_tag.string or "")
            if not match:
                return [], False

            data = json.loads(match.group(1))
            videos = data.get("videos", [])

            if not videos:
                return [], True  # Empty = end

            #filtered_videos = [
            #    video for video in videos
            #    if all(category.get('id') != 14 for category in video.get('categories', []))
            #]
            #videos = filtered_videos

            sources = []
            for video in videos:
                res = video.get("resolutions")
                best_res = max(map(int, res.split(','))) if res else 720
                sources.append(f"//s.bellesa.co/v/{video['source']}/{best_res}.mp4")
            #print(videos)
            return sources, False
    except Exception as e:
        print(f"Error on page {i}: {e}")
        return [], False

async def spicy_video():
    page = 1
    stop = False
    all_sources = []

    async with aiohttp.ClientSession() as session:
        while not stop:
            tasks = [fetch(session, page + i) for i in range(CONCURRENT_REQUESTS)]
            results = await asyncio.gather(*tasks)

            for sources, is_end in results:
                all_sources.extend(sources)
                if is_end:
                    stop = True
            page += CONCURRENT_REQUESTS
        
    with open('sources.json', 'w', encoding='utf-8') as f:
        json.dump(all_sources, f, indent=4)

if __name__ == "__main__":
    asyncio.run(spicy_video())
