import sys
sys.stdout.reconfigure(encoding='utf-8')

import os
import json

path = './data/json'
json_files = os.listdir(path)

all_data = []

# 파일 열고 JSON 읽기
for json_file in json_files:
    with open(os.path.join(path, json_file), "r", encoding="utf-8") as f:
        all_data += json.load(f)
    
# 파이썬 객체로 읽힌 걸 확인해보기
# print(all_data)

# award_date, nameの順でソートする
all_data.sort(key=lambda data: (data['award_date'], data['name']))

# TODO 
# PDFになかった研究者(師匠として載せられている研究者)を追加する

# TODO
# 師匠のidを探し、advisors_idとして入れる


# 各研究者にidを付与
for (idx, data) in enumerate(all_data):
    data['id'] = idx+1

with open('./data/researcher-data.json', 'w', encoding='utf-8') as f:
    json.dump(all_data, f, indent="\t", ensure_ascii=False)