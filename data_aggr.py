import os
from os import path
from pprint import pprint
import json

DATA_DIR = r'C:\Program Files (x86)\Steam\SteamApps\common\Planetary Annihilation\media\pa\units'

categories = {}
for f in os.listdir(DATA_DIR):
    if not path.isdir(path.join(DATA_DIR, f)):
        continue

    categories[f] = []

    for g in os.listdir(path.join(DATA_DIR, f)):
        if path.isdir(path.join(DATA_DIR, f, g)):
            for h in os.listdir(path.join(DATA_DIR, f, g)):
                if h.endswith('.json'):
                    categories[f].append(path.join(DATA_DIR, f, g, h))

def read_json(filename):
    with open(filename, 'r') as f:
        data = json.load(f)
        if 'base_spec' in data.keys():
            base_spec_path = path.join(DATA_DIR, *data['base_spec'].split('/')[3:])
            try:
                base_spec = read_json(base_spec_path)
                base_spec.update(data)
                data = base_spec
            except FileNotFoundError:
                pass
        if 'tools' in data.keys():
            if len(data['tools']) > 1: print('UGGHH')
            for tool in data['tools']:
                print(tool['spec_id'])
                tool_path = path.join(DATA_DIR, *tool['spec_id'].split('/')[3:])
                try:
                    tool_spec = read_json(tool_path)
                    tool_spec.update(data)
                    data = tool_spec
                except FileNotFoundError:
                    print(tool_path, 'not found')

        return data

relevant_keys = [
    'display_name',
    'build_metal_cost',
    'max_health',
    'construction_demand',
    'production',
]

final = {}
for category, units in categories.items():
    final[category] = []

    for unit in units:
        data = read_json(unit)

        if 'display_name' not in data:
            continue
        relevant_data = {}
        for key in relevant_keys:
            if key in data:
                relevant_data[key] = data[key]
        final[category].append(relevant_data)

with open('units.json', 'w') as f:
    json.dump(final, f)
