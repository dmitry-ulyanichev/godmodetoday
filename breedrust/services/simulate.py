"""
This module runs the simulation first for 3-way crossings
and then for 5-way crossings.
"""

from .compute import *
from .three_way import *
from .five_way import *

def simulate(data):
    data = remove_duplicates(data)
    data = remove_bad_genes(data)
    data = add_clones(data, 'c')
    data = create_combos_3_way(data)
    data = remove_duplicates(data)
    # five_way_combos
    data = order_best_to_worst(data)
    return data