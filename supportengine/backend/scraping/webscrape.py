import requests
from bs4 import BeautifulSoup
import pandas as pd
import numpy as np
from urllib.parse import urljoin
from nltk.sentiment import SentimentIntensityAnalyzer
from flask import Flask
import csv
import time
from random import randint




custom_headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept-Language': 'da, en-gb, en',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Referer': 'https://www.google.com/'
}


def fetch_page_content(url):
    response = requests.get(url)
    return response.text

def parse_html(html):
    soup = BeautifulSoup(html, 'lxml')
    if html.status_code != 200:
        return None
    
    title_element = soup.select_one("#productTitle")
    title = title_element.text.strip() if title_element else None

    price_element = soup.select_one('span.a-offscreen')
    price = price_element.text if price_element else None

    rating_element = soup.select_one("#acrPopover")
    rating_text = rating_element.attrs.get("title") if rating_element else None
    rating = rating_text.replace("out of 5 stars", "") if rating_text else None

    image_element = soup.select_one("#landingImage")
    image = image_element.attrs.get("src") if image_element else None

    description_element = soup.select_one("#productDescription")
    description = description_element.text.strip() if description_element else None

    return {
        "title": title,
        "price": price,
        "rating": rating,
        "image": image,
        "description": description,
        "url": html
    }

def analyze_data(products):
    df = pd.DataFrame(products)
    df['price'] = pd.to_numeric(df['price'].str.replace('$', ''))
    df.to_csv("output.csv", orient='records')
    df.drop_duplicates(subset=['title', 'price', 'rating'], keep='first', inplace=True)
    df.dropna(subset=['title'], inplace=True)  
    df['price'] = df['price'].str.replace('£', '').astype(float)
    rating_conversion = {'One': 1, 'Two': 2, 'Three': 3, 'Four': 4, 'Five': 5}
    df['rating'] = df['rating'].map(rating_conversion)
    df.info()  

    
    
def parse_listing(listing_url):
    global visited_urls
    response = requests.get(listing_url, headers=custom_headers)
    soup_search = BeautifulSoup(response.text, "lxml")
    link_elements = soup_search.select("[data-asin] h2 a")
    page_data = []
    for link in link_elements:
        full_url = urljoin(listing_url, link.attrs.get("href"))
        if full_url not in visited_urls:
            visited_urls.add(full_url)
            product_info = parse_html(full_url)
            if product_info:
                page_data.append(product_info)
    next_page_el = soup_search.select_one('a.s-pagination-next')
    if next_page_el:
        next_page_url = next_page_el.attrs.get('href')
        next_page_url = urljoin(listing_url, next_page_url)
        page_data += parse_listing(next_page_url)
    return page_data
 
def read_urls_from_csv(file_path):
    urls = []
    with open(file_path, mode='r', encoding='utf-8') as csvfile:
        csvreader = csv.DictReader(csvfile)
        for row in csvreader:
            urls.append(row['url'])
    return urls


def main():
    csv_file_path = 'discovered_urls.csv'
    urls = read_urls_from_csv(csv_file_path)
    
    for url in urls:
        html_content = fetch_page_content(url)
        products = parse_html(html_content)
        analyze_data(products)
        
        sleep_time = randint(5, 37) #mimic human interaction
        time.sleep(sleep_time)

if __name__ == '__main__':
    main()
