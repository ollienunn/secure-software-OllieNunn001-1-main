import random


def generate_id(current_list, max_value=999999999):
    """Helper func - gnerates random num based on list using random int"""
    existing_ids = set(current_list)
    R = random.randint(0, max_value)

    while R in existing_ids:
        R = random.randint(0, max_value)
    return str(R)
