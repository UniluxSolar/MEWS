import json
import os
import re

# Use absolute paths
BASE_DIR = r'd:\MEWS-Project\New-MEWS\MEWS'
UTILS_DIR = os.path.join(BASE_DIR, 'frontend', 'src', 'utils')

def sort_json_file(filename):
    path = os.path.join(UTILS_DIR, filename)
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return

    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        updated_data = None
        if isinstance(data, list):
            # Sort the list of strings
            data.sort()
            updated_data = data
        elif isinstance(data, dict):
            # Sort keys
            sorted_dict = {}
            for key in sorted(data.keys()):
                val = data[key]
                if isinstance(val, list):
                    val.sort()
                sorted_dict[key] = val
            updated_data = sorted_dict
        
        if updated_data is not None:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(updated_data, f, indent=4)
            print(f"Sorted {filename}")
    except Exception as e:
        print(f"Error processing {filename}: {e}")

def sort_constituency_data():
    path = os.path.join(UTILS_DIR, 'constituencyData.js')
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    def replacer(match):
        full_match = match.group(0)
        inner = match.group(1)
        
        # Skip if contains objects or variables (simple heuristic: { or function calls)
        if '{' in inner or '}' in inner or '(' in inner:
            return full_match
        
        # Skip if contains comments to preserve them
        if '//' in inner or '/*' in inner:
            # We skip sorting for commented arrays to avoid data loss
            return full_match
            
        # Extract strings
        # Handle both single and double quotes
        items = re.findall(r'["\']([^"\']+)["\']', inner)
        
        if len(items) > 1:
            # Check if it was already sorted?
            sorted_items = sorted(items)
            if items == sorted_items:
                return full_match # No change needed avoiding formatting changes
            
            # Reconstruct
            # Preserve quote style? usually "
            new_inner = '"' + '", "'.join(sorted_items) + '"'
            
            # Simple wrapper [ ... ]
            return f'[{new_inner}]'
            
        return full_match

    # Pattern: [ ... ] non-greedy
    pattern = r'\[(.*?)\]'
    
    new_content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Processed constituencyData.js")
    else:
        print("No changes needed for constituencyData.js")

if __name__ == "__main__":
    sort_json_file('casteSubCastes.json')
    sort_json_file('partnerCastes.json')
    sort_json_file('subCastes.json')
    sort_constituency_data()
