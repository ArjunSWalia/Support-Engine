import re
from textblob import TextBlob
import pandas as pd
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

nltk.download('punkt')
nltk.download('stopwords')

def clean_text(text):
    """Preprocess text by removing URLs, mentions, hashtags, and special characters."""
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)  #
    text = re.sub(r'\@\w+|\#','', text)  
    text = re.sub(r'\W', ' ', text) 
    text = text.lower() 
    text_tokens = word_tokenize(text) 
    filtered_text = [word for word in text_tokens if word not in stopwords.words('english')] 
    return ' '.join(filtered_text)

def analyze_sentiment(posts):
    analysis_results = []

    for post in posts:
        cleaned_rec = clean_text(post)
        analysis = TextBlob(cleaned_post)
        sentiment_polarity = analysis.sentiment.polarity
        sentiment_subjectivity = analysis.sentiment.subjectivity
        
        if sentiment_polarity > 0:
            sentiment_category = 'Positive'
        elif sentiment_polarity < 0:
            sentiment_category = 'Negative'
        else:
            sentiment_category = 'Neutral'
        
        analysis_results.append({
            'Post': post,
            'Cleaned Recommendation/Description': cleaned_rec,
            'Polarity': sentiment_polarity,
            'Subjectivity': sentiment_subjectivity,
            'Sentiment': sentiment_category,
        })
    
    return pd.DataFrame(analysis_results)

@app.route('/analyze_recommendation', methods=['POST'])
def analyzerecommendation():
    data = request.json
    product_descrec = data.get('product_descrec','')
    analysis_results = analyze_sentiment(product_descrec)
    return jsonify({
        'cleaned_rec': analysis_results.to_string()
    })

if __name__ == "__main__":
    app.run(debug=True,port = 5003)