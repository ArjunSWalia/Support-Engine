from bs4 import BeautifulSoup
import requests
import csv

def crawl_for_links(start_page):
    urls_to_visit = [start_page]
    discovered_urls = set()

    while urls_to_visit:
        current_url = urls_to_visit.pop()
        try:
            response = requests.get(current_url, timeout=5)
            soup = BeautifulSoup(response.text, 'html.parser')

            for link in soup.find_all('a', href=True):
                href = link['href']
                if "product" in href and href not in discovered_urls:  
                    discovered_urls.add(href)
        except requests.RequestException as e:
            print(f"Error fetching {current_url}: {e}")
    return list(discovered_urls)

def save_urls_to_csv(urls, filename):
    with open(filename, 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['URL'])  
        for url in urls:
            writer.writerow([url])  

if __name__ == "__main__":        
    start_page = 'https://www.amazon.ca/'
    discovered_urls = crawl_for_links(start_page)
    save_urls_to_csv(discovered_urls, 'discovered_urls.csv')

