import requests
from bs4 import BeautifulSoup
import json
import time

# List of URLs for the documentation of each platform
CDP_DOC_URLS = {
    "Segment": "https://segment.com/docs/?ref=nav",
    "mParticle": "https://docs.mparticle.com/",
    "Lytics": "https://docs.lytics.com/",
    "Zeotap": "https://docs.zeotap.com/home/en-us/"
}

def scrape_docs():
    data = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
    }

    session = requests.Session()
    session.headers.update(headers)

    for cdp, url in CDP_DOC_URLS.items():
        try:
            print(f"Scraping {url} for {cdp}")
            response = session.get(url)
            print(f"Status Code: {response.status_code}")

            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                # Extract specific sections from the page (example: article or divs with class 'docs-content')
                content_section = soup.find_all(['p', 'h2', 'h3', 'ul'])  # You can add more tags based on the doc layout

                content = ' '.join([element.get_text() for element in content_section])
                # Save extracted content and URL
                data.append({
                    "platform": cdp,
                    "url": url,
                    "content": content.strip()
                })

            time.sleep(2)  # Avoid overwhelming the server with requests

        except Exception as e:
            print(f"Failed to scrape {cdp}: {e}")

    # Save the scraped data into a JSON file
    with open("cdp_docs.json", "w") as f:
        json.dump(data, f, indent=4)
    print("Documentation scraped and saved!")

if __name__ == "__main__":
    scrape_docs()
