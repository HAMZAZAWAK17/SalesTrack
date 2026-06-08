import subprocess
import os
import re

git_path = "frontend/src/pages/users/UserEdit.jsx"

# Get original content from aed5e38
proc = subprocess.run(
    ["git", "show", f"aed5e38:{git_path}"],
    capture_output=True,
    text=True,
    encoding="utf-8",
    check=True
)
content = proc.stdout

def cleanup_mui_imports(content):
    def repl(match):
        imports_str = match.group(1)
        parts = [p.strip() for p in imports_str.split(',') if p.strip()]
        parts = [p for p in parts if p not in ('Snackbar', 'Alert')]
        if not parts:
            return ""
        return 'import { ' + ', '.join(parts) + ' } from \'@mui/material\''
    content = re.sub(r"import\s*\{\s*([^}]+?)\s*\}\s*from\s*['\"]@mui/material['\"]", repl, content)
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
                    pre_sub = content[:idx]
                    last_comment_idx = pre_sub.rfind('{/*')
                    if last_comment_idx != -1 and (idx - last_comment_idx) < 150:
                        close_comment_idx = pre_sub.find('*/}', last_comment_idx)
                        if close_comment_idx != -1:
                            start_idx = last_comment_idx
                    content = content[:start_idx] + content[end_idx + len(end_marker):]
            else:
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
                    last_comment_idx = pre_sub.rfind('{/*')
                    if last_comment_idx != -1 and (idx - last_comment_idx) < 150:
                        close_comment_idx = pre_sub.find('*/}', last_comment_idx)
                        if close_comment_idx != -1:
                            start_idx = last_comment_idx
                    content = content[:start_idx] + content[j:]
    return content

def parse_set_toast_obj(obj_str):
    obj_str = obj_str.strip().strip('{}').strip()
    m = re.search(r'\bmessage\s*:\s*([\s\S]+?)(?:\s*,\s*(?:\bseverity\b|\btype\b|\bopen\b|\bshow\b)\s*:|$)', obj_str)
    message_val = m.group(1).strip() if m else None
    if message_val and message_val.endswith(','):
        message_val = message_val[:-1].strip()
    s = re.search(r'\b(?:severity|type)\s*:\s*([\s\S]+?)(?:\s*,\s*(?:\bmessage\b|\bopen\b|\bshow\b)\s*:|$)', obj_str)
    severity_val = s.group(1).strip() if s else None
    if severity_val and severity_val.endswith(','):
        severity_val = severity_val[:-1].strip()
    return message_val, severity_val

def replace_set_toast_calls(content):
    idx = 0
    while True:
        idx = content.find("setToast", idx)
        if idx == -1:
            break
        start_paren = content.find("(", idx)
        if start_paren == -1 or start_paren - idx > 15:
            idx += 8
            continue
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
            if "...toast" in inner_content or "open: false" in inner_content or "show: false" in inner_content:
                end_idx = j
                if end_idx < len(content) and content[end_idx] == ';':
                    end_idx += 1
                while end_idx < len(content) and content[end_idx] in ('\n', '\r', ' '):
                    end_idx += 1
                content = content[:idx] + content[end_idx:]
                continue
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

# 1. Clean imports
content = cleanup_mui_imports(content)
# 2. Remove useState toast
content = re.sub(r'const\s*\[\s*toast\s*,\s*setToast\s*\]\s*=\s*useState\s*\(\s*\{[\s\S]*?\}\s*\)\s*;?\n?', '', content)

# 3. Replace setToast calls (now before handleToastClose removal!)
content = replace_set_toast_calls(content)

# 4. Remove handleToastClose
content = re.sub(r'const\s+handleToastClose\s*=\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*;?\n?', '', content)

# 5. Remove JSX
content = remove_toast_jsx(content)

print("\n--- Final Output ---")
final_lines = content.splitlines()
for i in range(70, min(95, len(final_lines))):
    print(f"{i+1}: {final_lines[i]}")
