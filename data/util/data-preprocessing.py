import sys
sys.stdout.reconfigure(encoding='utf-8')

import os
import json

path = './data'

# 파일 열고 JSON 읽기
with open(os.path.join(path, 'researcher-data.json'), "r", encoding="utf-8") as f:
    all_data = json.load(f)
    
# 파이썬 객체로 읽힌 걸 확인해보기
# print(all_data)


all_names = []
for data in all_data:
    all_names.append(data['advisors'])

# TODO 
# PDFになかった研究者(師匠として載せられている研究者)を追加する
new_data = all_data.copy()
count = 0

for data in all_data:
    for advisor in data['advisors']:
        if advisor not in all_names:
            all_names.append(advisor)
            new_researcher = {
                "name": advisor,
                "advisors": [],
                "affiliation": None,
                "title": None,
                "category": None,
                "keywords": [],
                "award_date": '1990-01',
            }
            print(f'new researcher!! {count}')
            # print(new_researcher)
            new_data.append(new_researcher)
            count += 1

# award_date, nameの順でソートする
new_data.sort(key=lambda data: (data['award_date'], data['name']))

# 各研究者にidを付与
for (idx, data) in enumerate(new_data):
    data['id'] = idx+1

# TODO
# 師匠のidを探し、advisors_idとして入れる

with open('./data/processed-researcher-data.json', 'w', encoding='utf-8') as f:
    json.dump(new_data, f, indent="\t", ensure_ascii=False)