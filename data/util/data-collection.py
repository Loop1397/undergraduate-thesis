import sys
sys.stdout.reconfigure(encoding='utf-8')

import os
import json

path = './data/json'
json_files = os.listdir(path)

all_data = []

# 파일 열고 JSON 읽은 후 all_data에 취합
for json_file in json_files:
    with open(os.path.join(path, json_file), "r", encoding="utf-8") as f:
        all_data += json.load(f)

# all_data를 researcher-data.json으로 저장
with open('./data/researcher-data.json', 'w', encoding='utf-8') as f:
    json.dump(all_data, f, indent="\t", ensure_ascii=False)