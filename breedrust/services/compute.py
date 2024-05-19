"""
This file contains functions shared by both 3-way and 5-way crossing simulations.
"""

import copy

def add_clones(data, letter):
    """
    The add_clones function creates a copy for each eligible item in the object,
    where the value is the same and "c" is appended to the key.
    Don't clone genes that have Ws and/or Xs.
    """
    # Create a deep copy of the input data
    cloned_data = copy.deepcopy(data)
    
    # Iterate over the keys and values in the input data
    for key, value in data.items():
        # Check if the gene value contains 'W' or 'X'
        if 'W' not in value and 'X' not in value:
            # Create a new key by appending a letter (c, d, e, or f) to the original key
            cloned_key = key + letter
            # Add the cloned key with the same value to the cloned data
            cloned_data[cloned_key] = value
    
    return cloned_data

# def remove_duplicates(data):
#     """
#     The remove_duplicates function checks for duplicate values
#     and if the values are identical, keeps only one item;
#     it decides which item to keep based on the key
#         - shorter keys have priority,
#         - keys without "c" have priority,
#         - keys without "-odds:*" have priority,
#             the priority for "-odds:*" decreases like this: "-odds:50",
#             "-odds:25", "-odds:13", "-odds:6", "-odds:3"
#     NB! Maybe a simple check for the length will be enough
#         - see the remove_duplicates_simplified function below.
#     """
#     unique_values = {}
    
#     for key, value in data.items():
#         if value not in unique_values:
#             unique_values[value] = key
#         else:
#             current_key = key
#             existing_key = unique_values[value]
            
#             if len(current_key) < len(existing_key):
#                 unique_values[value] = current_key
#             elif "c" not in current_key and "c" in existing_key:
#                 unique_values[value] = current_key
#             elif "-odds:" in current_key and "-odds:" in existing_key:
#                 current_priority = int(current_key.split(":")[-1])
#                 existing_priority = int(existing_key.split(":")[-1])
#                 if current_priority < existing_priority:
#                     unique_values[value] = current_key
    
#     unique_data = {key: value for value, key in unique_values.items()}
    
#     return unique_data

def remove_bad_genes(data):
    """
    This function removes genes without any good letters (Y,G,H) and
    if X, *, and W occupy the same loci in otherwise identical genes,
    it prioritizes those with Xs over stars and Ws.
    """
    good_letters = {'Y', 'G', 'H'}
    weights = {'X': 2, '*': 1, 'W': 0}

    def has_good_letter(gene):
        return any(letter in good_letters for letter in gene)
    
    def get_pattern_and_weight(gene):
        pattern = ''.join(letter if letter in good_letters else '.' for letter in gene)
        total_weight = sum(weights.get(letter, 0) for letter in gene)
        return pattern, total_weight

    # Step 1: Filter out genes that have no good letters
    filtered_genes = {key: gene for key, gene in data.items() if has_good_letter(gene)}
    
    # Step 2: Group genes by their patterns and compare them
    grouped_genes = {}
    for key, gene in filtered_genes.items():
        pattern, total_weight = get_pattern_and_weight(gene)
        if pattern not in grouped_genes:
            grouped_genes[pattern] = []
        grouped_genes[pattern].append((key, gene, total_weight))
    
    # Step 3: Retain the gene with the highest total weight within each group
    result = {}
    for genes in grouped_genes.values():
        # Sort by total weight (descending)
        genes.sort(key=lambda x: -x[2])
        best_gene = genes[0]
        result[best_gene[0]] = best_gene[1]
        
    return result

def remove_duplicates(data):
    unique_values = {}
    
    for key, value in data.items():
        if value not in unique_values:
            unique_values[value] = key
        else:
            current_key = key
            existing_key = unique_values[value]
            
            if len(current_key) < len(existing_key):
                unique_values[value] = current_key
    
    unique_data = {key: value for value, key in unique_values.items()}
    
    return unique_data

def order_best_to_worst(data):
    """
    The order_best_to_worst function looks at the values of object items
    and orders them from best to worst using the calculate_weight function.
    """
    ordered_data = dict(sorted(data.items(), key=lambda item: calculate_weight(item[1]), reverse=True))
    return ordered_data

weights = {"Y": 2.0, "G": 1.75, "H": 1.2, "X": 0.3, "W": 0, "*": 0.2}

custom_gene_weights = {
    "YYYYYY": 10,
    "YYYYYG": 10.1,
    "YYYYYH": 10,
    "YYYYYX": 8.2,
    "YYYYY*": 8.15,
    "YYYYYW": 8.1,
    "GGGGGG": 10.69,
    "GGGGGH": 10.1,
    "GGGGGX": 8.3,
    "GGGGG*": 8.25,
    "GGGGGW": 8.2,
    "HHHHHH": 7.9,
    "YHHHHH": 8,
    "GHHHHH": 8,
    "HHHHHX": 7.8,
    "HHHHH*": 7.74,
    "HHHHHW": 7.7,
    "YYYYXX": 9.3
}

def calculate_weight(gene):
  """
  The calculate_weight function calculates the weight of a gene and returns it.
  This weight is used to rank genes from the worst to the best.
  """
  
  total_weight = 0
  rearranged_gene = rearrange_letters(gene)
  
  # Check for genes with custom weights
  if rearranged_gene in custom_gene_weights:
    return round(float(custom_gene_weights[rearranged_gene]),2)  # Return the custom weight

  # Calculate weight for regular genes
  for letter in gene:
    total_weight += weights[letter]
  return total_weight

def rearrange_letters(string):
  """
  Rearranges the letters in a gene in the order Y, G, H, X, *, W.
  This is needed for checking against custom weights.
  """
  order = "YGHX*W"
  
  # Create a dictionary to map letters to their desired positions
  letter_positions = {letter: i for i, letter in enumerate(order)}
  
  # Sort the letters based on their desired positions
  sorted_letters = sorted(string, key=lambda letter: letter_positions[letter])
  
  # Join the sorted letters to form the rearranged string
  return ''.join(sorted_letters)