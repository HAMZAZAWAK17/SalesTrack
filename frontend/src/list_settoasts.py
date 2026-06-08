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

for f in files:
    path = os.path.join(src_dir, f.replace("/", "\\"))
    if not os.path.exists(path):
        print(f"File not found: {path}")
        continue
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
    
    print(f"=== {f} ===")
    matches = re.finditer(r'setToast\s*\([\s\S]+?\);', content)
    for m in matches:
        print(m.group(0))
        print("---")
