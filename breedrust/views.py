from django.shortcuts import render
from django.http import JsonResponse
import json
from django.contrib.sessions.backends.db import SessionStore
from .services.simulate import simulate

def index(request):
    return render(request, 'breedrust/index.html')

def process_genes(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        processed_data = simulate(data)
        request.session['genes'] = processed_data
        request.session.modified = True
        result = {'results': []}
        for i, (key, value) in enumerate(processed_data.items()):
            result['results'].append(value)
        return JsonResponse(result)
    
def get_provenance(request, gene_value):
    # Retrieve the list of genes and their provenance records from the session
    genes = request.session.get('genes', {})

    # Search for the gene value in the dictionary and return the corresponding key (provenance record)
    provenance = next((key for key, value in genes.items() if value == gene_value), None)

    if provenance:
        result = {
            'provenance': provenance,
        }
        return JsonResponse(result)
    else:
        return JsonResponse({'error': 'Gene not found'}, status=404)
