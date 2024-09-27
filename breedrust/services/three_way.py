"""
This module only contains functions used for 3-way crossings.
"""

import itertools
from .compute import add_clones, remove_duplicates, remove_bad_genes

iterations = 1

def create_combos_3_way(data):

    delimiters = ['x', '~', '!', '@']
    clone_delimiters = ['d', 'e', 'f']
    iteration = 0
    prev_length = -1
    current_data = data.copy()

    while iteration < 4:
        new_data = current_data.copy()
        
        keys = list(current_data.keys())
        
        for i, receive_key in enumerate(keys):
            receive_gene = current_data[receive_key]
            for contrib1_key, contrib2_key in itertools.combinations([k for k in keys if k != receive_key], 2):
                contrib1_gene = current_data[contrib1_key]
                contrib2_gene = current_data[contrib2_key]
                new_gene = cross_gene_3_way(contrib1_gene, receive_gene, contrib2_gene)
                new_key = f"{contrib1_key}{delimiters[iteration]}{receive_key}{delimiters[iteration]}{contrib2_key}"
                new_data[new_key] = new_gene

        # Call post-processing functions
        new_data = remove_duplicates(new_data)

        new_data = remove_bad_genes(new_data)

            
        # Check if the size of the list increased
        if len(new_data) <= prev_length:
            break
        
        # letters d, e, or f are added (depending on the iteration) to signify it's a clone
        if iteration < 3:
            new_data = add_clones(new_data, clone_delimiters[iteration])
        
        prev_length = len(new_data)
        current_data = new_data
        iteration += 1

    return current_data

def cross_gene_3_way(contrib1, receive, contrib2):
    """
    This function takes 3 genes as arguments (the order is important)
    and creates a 3-way cross.
    """
    def calculate_locus(contrib1, receive, contrib2):
        """
        This function calculates the result of crossing letters for each locus.
        The order of letters matters: the one in the middle receives letters
        from the contributing letters if they have more weight.
        """
        weights = {'W': 1.0, 'X': 1.0, 'Y': 0.6, 'G': 0.6, 'H': 0.6, '*': 1.1}

        # Calculate the combined weight of the contributing letters
        if contrib1 == contrib2:
            combined_weight = weights[contrib1] + weights[contrib2]
        else:
            combined_weight = max(weights[contrib1], weights[contrib2])

        receive_weight = weights[receive]

        # Special case for receive in {Y, G, H} and contribs in {X, W}
        if receive in {'Y', 'G', 'H'} and {contrib1, contrib2} == {'X', 'W'}:
            return '*'

        if receive_weight >= combined_weight:
            return receive
        else:
            return max(contrib1, contrib2, key=lambda x: weights[x])

    # Create the resulting gene by applying calculate_locus to each locus
    result_gene = ''.join(calculate_locus(contrib1[i], receive[i], contrib2[i]) for i in range(6))
    
    return result_gene

# def calculate_locus(contrib1, receive, contrib2):
#     """
#     This function calculates the result of crossing letters for each locus.
#     The order of letters matters: the one in the middle receives letters
#     from the contributing letters if they have more weight.
#     """

#     # Define the weights
#     weights = {
#         '*': 1.1,
#         'W': 1.0,
#         'X': 1.0,
#         'Y': 0.6,
#         'G': 0.6,
#         'H': 0.6
#     }
    
#     # Determine the combined weight of the contributing characters
#     if contrib1 == contrib2:
#         combined_weight = weights[contrib1] + weights[contrib2]
#     else:
#         combined_weight = max(weights[contrib1], weights[contrib2])
    
#     # Determine the weight of the receiving character
#     receive_weight = weights[receive]
    
#     # Special case check
#     if (receive in 'YGH') and ((contrib1 == 'W' and contrib2 == 'X') or (contrib1 == 'X' and contrib2 == 'W')):
#         return '*'
    
#     # Compare the weights and decide the outcome
#     if receive_weight >= combined_weight:
#         return receive
#     else:
#         # In this case, the receiving character changes
#         if weights[contrib1] > weights[contrib2]:
#             return contrib1
#         else:
#             # If contrib1 and contrib2 have the same weight, return either one of them
#             return contrib2