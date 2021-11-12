from flask import Flask, request, render_template, jsonify
import pandas as pd
import pickle
import config
from jinja2 import Template

app = Flask(__name__)

movies_path = './data/movies.csv'
ratings_path = './data/ratings.csv'

movies_ds = pd.read_csv(movies_path)
ratings_ds = pd.read_csv(ratings_path)

data = pd.merge(movies_ds, ratings_ds, on='movieId')
# dropping 'timestamp' column
data = data[['userId','movieId', 'title', 'genres', 'rating']]
# sort the dataframe according to 'userId' and then 'movieId'
data.sort_values(['userId', 'movieId'], inplace=True)
# resetting the index
data.reset_index(drop=True, inplace=True)

model = pickle.load(open('models/user_final_rating.pkl', 'rb'))
cols = ['userId']


def popularity_recommendation(data, n):
    """Топ-n популярных фильмов"""

    movie_raiting = data.groupby('title')['title'].count().sort_values(ascending=False).head(n)
    #     recs = movie_raiting.index
    recs = movie_raiting

    # return recs.tolist()
    return recs


popular_recs = popularity_recommendation(data, n=10)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == "POST":
        user_id = request.form.get('userId')
        user_id = int(user_id)
        try:
            user_i = model.iloc[user_id].to_frame()
            user_i.reset_index(inplace=True)
            user_i.rename(columns={'movieId': 'movieId', user_id + 1: 'ratings'}, inplace=True)
            user_join_i = pd.merge(user_i, movies_ds, on='movieId')
            top_10 = user_join_i.sort_values(by=['ratings'], ascending=False)[0:10]
            # prediction = top_10['title'].str[:-7].values
            prediction = top_10['title'].values

            return render_template('index.html', preds=prediction)

        except IndexError:
            return render_template('index.html', preds=popular_recs.index)

        pass
    pass


if __name__ == '__main__':
    app.run(host="127.0.0.1", port=config.PORT, debug=config.DEBUG_MODE)
