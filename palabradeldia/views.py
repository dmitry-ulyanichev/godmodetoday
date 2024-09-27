from django.shortcuts import render
from django.http import JsonResponse
import json
from decouple import config
import requests

def index(request):
    with open('palabradeldia/static/palabradeldia/5_letter_spanish_words.json') as f:
        words = json.load(f)
    return render(request, 'palabradeldia/index.html', {'words': json.dumps(words)})

def api_view(request):
    if request.method == 'POST':
        try:
            # Parse the JSON data from the request body
            data = json.loads(request.body)
            word = data.get('word', '')

            # Proceed with your existing logic
            api_secret_key = config('MISTRAL_API_KEY')
            
            # API request with the secret key
            response = requests.post(
                'https://api.mistral.ai/v1/chat/completions',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {api_secret_key}'
                },
                json={
                    "model": "mistral-large-latest",
                    "temperature": 0.7,
                    "max_tokens": 150,
                    "stream": False,
                    "random_seed": 0,
                    "messages": [
                        {
                            "role": "user",
                            "content": f"You are an expert in the Spanish language. I will provide you with a word, and I would like you to analyze it in the following format:\n\n"
                                       f"1) Word form: (e.g. osaré)\n"
                                       f"2) Grammar explanation: Describe the tense, mood, person, and number (e.g. \"future, first person, singular of osar\"). Also provide the dictionary form of the word (e.g. \"infinitive: osar\").\n"
                                       f"3) Meaning in English: Provide one meaning of the word in English (e.g. to dare).\n"
                                       f"4) Example sentence in Spanish: Write an example sentence using the word in a natural context.\n"
                                       f"5) Translation of the sentence into English: Translate the example sentence into English.\n\n"
                                       f"If the word does not exist or is not a valid word form in Spanish, respond with a brief explanation stating that the word does not exist in standard Spanish.\n\n"
                                       f"The word to analyze is: \"{word}\""
                        }
                    ],
                    "response_format": {
                        "type": "text"
                    }
                }
            )

            if response.status_code == 200:
                data = response.json()
                raw_content = data['choices'][0]['message']['content']
                
                # Format the response with paragraphs and bold labels
                formatted_content = raw_content.replace("Word form:", "<strong>Word form:</strong>") \
                    .replace("Grammar explanation:", "<strong>Grammar explanation:</strong>") \
                    .replace("Meaning in English:", "<strong>Meaning in English:</strong>") \
                    .replace("Example sentence in Spanish:", "<strong>Example sentence in Spanish:</strong>") \
                    .replace("Translation of the sentence into English:", "<strong>Translation of the sentence into English:</strong>") \
                    .replace("\n", "<br>")

                # Send the formatted content in the response
                return JsonResponse({
                    'content': formatted_content
                })
            else:
                return JsonResponse({'error': 'Failed to fetch dictionary data'}, status=500)
        
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)
