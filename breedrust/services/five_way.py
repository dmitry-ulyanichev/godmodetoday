"""
This module only contains functions used for 4-way crossings.
"""

import itertools
from .compute import add_clones, remove_duplicates, remove_bad_genes

iterations = 1

def create_combos_4_way(data):
    delimiters = ['#', '$', '%', '^']
    clone_delimiters = ['h', 'i', 'j']
    iteration = 0
    prev_length = -1
    current_data = data.copy()

    while iteration < 4:
        new_data = current_data.copy()

        keys = list(current_data.keys())
        combos = itertools.combinations(keys, 4)

        for combo in combos:
            genes = [current_data[key] for key in combo]
            new_gene = cross_gene_4_way(*genes)
            new_key = ''.join(f"{key}{delimiters[iteration]}" for key in combo)
            new_data[new_key] = new_gene

        # Call post-processing functions
        new_data = remove_duplicates(new_data)
        new_data = remove_bad_genes(new_data)

        # Check if the size of the list increased
        if len(new_data) <= prev_length:
            break

        # letters h, i, or j are added (depending on the iteration) to signify it's a clone
        if iteration < 3:
            new_data = add_clones(new_data, clone_delimiters[iteration])

        prev_length = len(new_data)
        current_data = new_data
        iteration += 1

    return current_data

def cross_gene_4_way(gene1, gene2, gene3, gene4):
    """
    This function takes 4 genes as arguments (the order is irrelevant)
    and creates a 4-way cross.
    """
    # Implement the logic for 4-way crossing here
    pass