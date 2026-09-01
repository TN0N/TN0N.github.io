import asyncio
import aiohttp
from bs4 import BeautifulSoup
import json
import re

URL_TEMPLATE = "http://bellesa.co/videos?categories=fmf%2Cmfm%2Corgy%2Cpassionate%2Cgirl-on-girl%2Crough%2Csensual&max_duration=30&page={}&providers=tushy%2Cdorcel-club%2Cnubile-films%2Cvixen%2Cdeeper%2Cblacked%2Cblackedraw%2Cbellesa-house%2Cbellesa-films%2Cthe-white-boxxx%2Cnew-sensations%2Csinfulxxx%2Cadulttime%2Ceroticax%2Cdoghouse%2Cnfbusty%2Chardx%2Csweet-sinner%2Ctushyraw%2Cadam-eve%2Cletsdoeit-bonus%2Cpassionhd%2Cbabes%2Ccouple-fantasies%2Cjoybear%2Cdeeplush%2Csexart"
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
            #print(videos);
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

                sources.append(
                    {
                        "code": video.get("source"),
                        "title": video.get("title"),
                        "image": video.get("image"),
                        "src": f"//s.bellesa.co/v/{video['source']}/{best_res}.mp4",
                        "tags": video.get("tags").split(','),
                    }
                )
                #sources.append(f"//s.bellesa.co/v/{video['source']}/{best_res}.mp4")
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
