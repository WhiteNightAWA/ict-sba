import json
from bs4 import BeautifulSoup


with open("./test.html", mode="r", encoding="utf-8") as file:
    data = file.read()

soup = BeautifulSoup(data)

with open("./test.json", mode="w", encoding="utf-8") as file:
    json.dump([str(tr) for tr in soup.tbody], file, indent=4)