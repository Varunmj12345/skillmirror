import os
import re
import json

src_dir = r"d:\anjan peoject\new-skillmirror\skillmirror\frontend\src"

components = []
ui_elements = []
functions = []
event_handlers = []
files_scanned = []
routes = []

cmp_id = 1
ui_id = 1
func_id = 1
route_id = 1
api_id = 1
state_id = 1
test_id = 1

def process_file(filepath):
    global cmp_id, ui_id, func_id, route_id, api_id, state_id
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    rel_path = os.path.relpath(filepath, src_dir).replace('\\', '/')
    files_scanned.append(rel_path)
    
    if rel_path.startswith("pages/"):
        routes.append({"id": f"ROUTE-{route_id:03d}", "file": rel_path})
        route_id += 1

    lines = content.split('\n')
    
    for i, line in enumerate(lines):
        line_num = i + 1
        
        # very basic Component detection (export default function Component)
        # or const Component = () =>
        if re.search(r'(export\s+(default\s+)?function\s+([A-Z]\w*))', line):
            m = re.search(r'function\s+([A-Z]\w*)', line)
            if m:
                components.append({"id": f"CMP-{cmp_id:03d}", "name": m.group(1), "file": rel_path, "line": line_num})
                cmp_id += 1
        elif re.search(r'const\s+([A-Z]\w*)\s*=\s*(\(.*?\)|.*?)\s*=>', line):
            m = re.search(r'const\s+([A-Z]\w*)', line)
            if m:
                components.append({"id": f"CMP-{cmp_id:03d}", "name": m.group(1), "file": rel_path, "line": line_num})
                cmp_id += 1
                
        # Basic function detection
        elif re.search(r'(export\s+(default\s+)?function\s+([a-z]\w*))', line):
            m = re.search(r'function\s+([a-z]\w*)', line)
            if m:
                functions.append({"id": f"FUNC-{func_id:03d}", "name": m.group(1), "file": rel_path, "line": line_num})
                func_id += 1
        elif re.search(r'const\s+([a-z]\w*)\s*=\s*(\(.*?\)|.*?)\s*=>', line):
            m = re.search(r'const\s+([a-z]\w*)', line)
            if m:
                functions.append({"id": f"FUNC-{func_id:03d}", "name": m.group(1), "file": rel_path, "line": line_num})
                func_id += 1
                
        # UI Elements and Events
        tags = re.findall(r'<([a-zA-Z0-9_]+)([^>]*?)>', line)
        for tag, attrs in tags:
            # check for events
            events = re.findall(r'(on[A-Z]\w*)\s*=', attrs)
            has_handler = len(events) > 0
            
            for ev in events:
                event_handlers.append({"element": tag, "event": ev, "file": rel_path, "line": line_num})
            
            if has_handler or tag.lower() in ['button', 'input', 'select', 'textarea', 'form', 'a', 'link']:
                ui_elements.append({
                    "id": f"UI-{ui_id:03d}",
                    "type": tag,
                    "file": rel_path,
                    "line": line_num,
                    "events": events
                })
                ui_id += 1

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx') or file.endswith('.js') or file.endswith('.jsx'):
            process_file(os.path.join(root, file))

output = {
    "components": components,
    "ui_elements": ui_elements,
    "functions": functions,
    "event_handlers": event_handlers,
    "routes": routes,
    "files_scanned": files_scanned
}

with open(r"d:\anjan peoject\new-skillmirror\skillmirror\frontend\inventory.json", 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2)

print(f"Scanned {len(files_scanned)} files.")
