import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

df = pd.read_csv('output.csv')  # Make sure 'output.csv' is in your working directory


tfidf = TfidfVectorizer(stop_words='english')

tfidf_matrix = tfidf.fit_transform(df['description'])

cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

def recommend_products(title, cosine_sim=cosine_sim):
    if title not in df['title'].values:
        print(f"No product found with title: {title}")
        return []    
    idx = df.index[df['title'] == title].tolist()[0]

    sim_scores = list(enumerate(cosine_sim[idx]))

    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    sim_scores = sim_scores[1:4]  

    
    product_indices = [i[0] for i in sim_scores]

    
    return df['title'].iloc[product_indices]

@app.route('/find_recommendation', methods=['POST'])
def findrecommendation():
    data = request.json
    product_title = data.get('product_title', '')
    recommended_products = recommend_products(product_title)
    return jsonify({
        'recommended_products': recommended_products
    })


if __name__ == "__main__":
    app.run(debug=True,port = 5003)