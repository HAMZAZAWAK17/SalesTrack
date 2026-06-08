import os
import re

src_dir = r"c:\Users\Hamza\Desktop\Desktop-folders\projects\SalesTrack\frontend\src"

files = [
    "pages/visits/VisitList.jsx",
    "pages/visits/VisitEdit.jsx",
    "pages/visits/VisitCreate.jsx",
    "pages/users/UserList.jsx",
    "pages/users/UserEdit.jsx",
    "pages/users/UserDetails.jsx",
    "pages/users/UserCreate.jsx",
    "pages/Profile.jsx",
    "pages/orders/OrderList.jsx",
    "pages/orders/OrderDetails.jsx",
    "pages/orders/OrderCreate.jsx",
    "pages/clients/ClientList.jsx",
    "pages/clients/ClientEdit.jsx",
    "pages/clients/ClientDetails.jsx",
    "pages/clients/ClientCreate.jsx",
]

def cleanup_mui_imports(content):
    def repl(match):
        imports_str = match.group(1)
        parts = [p.strip() for p in imports_str.split(',') if p.strip()]
        parts = [p for p in parts if p not in ('Snackbar', 'Alert')]
        if not parts:
            return ""
        return 'import { ' + ', '.join(parts) + ' } from \'@mui/material\''
    # Handle single or double quotes
    content = re.sub(r"import\s*\{\s*([^}]+?)\s*\}\s*from\s*['\"]@mui/material['\"]", repl, content)
    # Also handle multiline imports
    content = re.sub(r"import\s*\{\s*([^}]+?)\s*\}\s*from\s*['\"]@mui/material['\"];?", repl, content)
    return content

def remove_toast_jsx(content):
    for marker in ('{toast.open &&', '{toast.show &&', '<Snackbar'):
        idx = content.find(marker)
        if idx != -1:
            if marker == '<Snackbar':
                end_marker = '</Snackbar>'
                end_idx = content.find(end_marker, idx)
                if end_idx != -1:
                    start_idx = idx
                    # Try to find comment immediately preceding it
                    # Look for {/* Toast Feedback */} or {/* Feedback alerts */} or any comment on the preceding lines
                    pre_sub = content[:idx]
                    comment_match = re.search(r'\{\/\*[\s\S]*?\*\/\}?\s*$', pre_sub)
                    if comment_match:
                        start_idx = comment_match.start()
                    content = content[:start_idx] + content[end_idx + len(end_marker):]
            else:
                # Brace-based JSX
                depth = 1
                j = idx + len(marker)
                while j < len(content) and depth > 0:
                    if content[j] == '{':
                        depth += 1
                    elif content[j] == '}':
                        depth -= 1
                    j += 1
                if depth == 0:
                    start_idx = idx
                    pre_sub = content[:idx]
                    comment_match = re.search(r'\{\/\*[\s\S]*?\*\/\}?\s*$', pre_sub)
                    if comment_match:
                        start_idx = comment_match.start()
                    content = content[:start_idx] + content[j:]
    return content

def parse_set_toast_obj(obj_str):
    obj_str = obj_str.strip().strip('{}').strip()
    
    # Extract message value
    m = re.search(r'\bmessage\s*:\s*([\s\S]+?)(?:\s*,\s*(?:\bseverity\b|\btype\b|\bopen\b|\bshow\b)\s*:|$)', obj_str)
    message_val = m.group(1).strip() if m else None
    if message_val and message_val.endswith(','):
        message_val = message_val[:-1].strip()
        
    # Extract severity or type value
    s = re.search(r'\b(?:severity|type)\s*:\s*([\s\S]+?)(?:\s*,\s*(?:\bmessage\b|\bopen\b|\bshow\b)\s*:|$)', obj_str)
    severity_val = s.group(1).strip() if s else None
    if severity_val and severity_val.endswith(','):
        severity_val = severity_val[:-1].strip()
        
    return message_val, severity_val

def replace_set_toast_calls(content):
    # Regex to find setToast(...) call and capture its inner object
    # Matches setToast({ ... });
    # We find matching parentheses to support nested properties
    idx = 0
    while True:
        idx = content.find("setToast", idx)
        if idx == -1:
            break
        
        # Ensure it's not a state declaration or close call
        # e.g., 'setToast('
        start_paren = content.find("(", idx)
        if start_paren == -1 or start_paren - idx > 15:
            idx += 8
            continue
        
        # Find matching close paren
        depth = 1
        j = start_paren + 1
        while j < len(content) and depth > 0:
            if content[j] == '(':
                depth += 1
            elif content[j] == ')':
                depth -= 1
            j += 1
        
        if depth == 0:
            full_call = content[idx:j]
            inner_content = content[start_paren + 1:j - 1].strip()
            
            # If it's the close call or simple object reset:
            if "...toast" in inner_content or "open: false" in inner_content or "show: false" in inner_content:
                # Replace with empty string
                # Also consume trailing semicolon if present
                end_idx = j
                if end_idx < len(content) and content[end_idx] == ';':
                    end_idx += 1
                # Consume trailing newlines/spaces
                while end_idx < len(content) and content[end_idx] in ('\n', '\r', ' '):
                    end_idx += 1
                content = content[:idx] + content[end_idx:]
                # Don't increment idx since content shrunk
                continue
                
            # Parse the inner object
            message_val, severity_val = parse_set_toast_obj(inner_content)
            if message_val:
                severity = severity_val.strip("'\"") if severity_val else 'success'
                if severity == 'success':
                    new_call = f"toast.success({message_val});"
                elif severity == 'error':
                    new_call = f"toast.error({message_val});"
                elif severity == 'warning':
                    new_call = f"toast({message_val}, {{ icon: '⚠️' }});"
                else:
                    new_call = f"toast({message_val});"
                
                # Replace full_call with new_call
                end_idx = j
                if end_idx < len(content) and content[end_idx] == ';':
                    end_idx += 1
                content = content[:idx] + new_call + content[end_idx:]
                idx += len(new_call)
            else:
                idx += len(full_call)
        else:
            idx += 8
            
    return content

for f in files:
    path = os.path.join(src_dir, f.replace("/", "\\"))
    if not os.path.exists(path):
        print(f"File not found: {path}")
        continue
        
    print(f"Refactoring {f}...")
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
        
    # Clean up MUI imports
    content = cleanup_mui_imports(content)
    
    # Remove local state variable
    content = re.sub(r'const\s*\[\s*toast\s*,\s*setToast\s*\]\s*=\s*useState\s*\(\s*\{[\s\S]*?\}\s*\)\s*;?\n?', '', content)
    
    # Remove handleToastClose function
    content = re.sub(r'const\s+handleToastClose\s*=\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*;?\n?', '', content)
    
    # Replace setToast calls
    content = replace_set_toast_calls(content)
    
    # Replace showToast definition in ClientCreate/ClientEdit if present
    show_toast_pattern = r'const\s+showToast\s*=\s*\(\s*message\s*,\s*type\s*=\s*[\'"]success[\'"]\s*\)\s*=>\s*\{[\s\S]*?\}\s*;?\n?'
    if "const showToast" in content:
        new_show_toast = """const showToast = (message, type = 'success') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'warning') {
      toast(message, { icon: '⚠️' });
    } else {
      toast.error(message);
    }
  };
"""
        content = re.sub(show_toast_pattern, new_show_toast, content)
        
    # Remove JSX
    content = remove_toast_jsx(content)
    
    # Inject react-hot-toast import at top
    if "import toast" not in content and "import { toast }" not in content:
        # We can find the first import line and insert before it
        import_match = re.search(r'^import\s', content, re.MULTILINE)
        if import_match:
            insert_pos = import_match.start()
            content = content[:insert_pos] + "import toast from 'react-hot-toast';\n" + content[insert_pos:]
        else:
            content = "import toast from 'react-hot-toast';\n" + content
            
    with open(path, "w", encoding="utf-8") as file:
        file.write(content)

print("Finished refactoring files successfully!")
