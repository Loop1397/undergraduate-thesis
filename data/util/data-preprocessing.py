import sys
sys.stdout.reconfigure(encoding='utf-8')

import os
import json

path = './data'

# 파일 열고 JSON 읽기
with open(os.path.join(path, 'researcher-data.json'), "r", encoding="utf-8") as f:
    all_data = json.load(f)

# advisor를 토대로 등록되어있지 않은 연구자를 등록 및 엑셀 파일로 출력
# name이 list로 바뀐 현재 사용 불가능
def insertNewResearcheres(all_data): 
    all_names = []
    for data in all_data:
        all_names.append(data['advisors'])

    # TODO 
    # PDFになかった研究者(師匠として載せられている研究者)を追加する
    new_data = all_data.copy()
    count = 0

    # 新しく追加された研究者(師匠)
    new_names = []

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
                # print(new_researcher)
                new_names.append(advisor)
                new_data.append(new_researcher)
                count += 1

    # award_date, nameの順でソートする
    new_data.sort(key=lambda data: (data['award_date'], data['name']))

    # 師匠で新しく追加された名前をnew_researcher_output.xlsxで出力する
    import pandas as pd
    df = pd.DataFrame(new_names, columns=['名前'])
    df.to_excel('./data/new_researcher_output.xlsx')
    
    return new_data

# 각 data에 순서대로 Id를 부여
def assignId(all_data):
    # 各研究者にidを付与
    for (idx, data) in enumerate(all_data):
        data['id'] = idx+1
        
    return all_data

# name이 str인 경우 name을 list로 변경함
def changeNameToList(all_data):
    for data in all_data:
        if type(data['name']) == str:
            data['name'] = [data['name']]
            
    return all_data

# TODO
# 師匠のidを探し、advisors_idとして入れる

all_data = changeNameToList(all_data)
all_data = assignId(all_data)

with open(os.path.join(path, 'new-processed-researcher-data.json'), 'w', encoding='utf-8') as f:
    json.dump(all_data, f, indent="\t", ensure_ascii=False)

