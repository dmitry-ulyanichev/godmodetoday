from django.shortcuts import render
from django.http import JsonResponse
import json

def index(request):
    with open('palabradeldia/static/palabradeldia/5_letter_spanish_words.json') as f:
    # with open('palabradeldia/static/palabradeldia/200_most_common_words.json') as f:
        words = json.load(f)
    return render(request, 'palabradeldia/index.html', {'words': json.dumps(words)})