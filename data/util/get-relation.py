import sys
sys.stdout.reconfigure(encoding='utf-8')

import os
import json

path = './data'

# 파일 열고 JSON 읽기
with open(os.path.join(path, 'researcher-data_2025-11-23.json'), "r", encoding="utf-8") as f:
    all_data = json.load(f)

# 全てのadvisorのidを持ってくるメッソド
def getAdvisorsId(all_data, idx): 
    result = []
    for advisor in all_data[idx]['advisors']:
        # print(advisor)
        # print([i for i, researcher in enumerate(all_data) if advisor in researcher['name']])
        result += [i+1 for i, researcher in enumerate(all_data) if advisor in researcher['name']]
    # print(relation)
        
    return result

# 全てのadviseeのidを持ってくるメッソド
def getAdviseesId(all_data, idx): 
    result = []
    for name in all_data[idx]['name']:
        result += [i+1 for i, researcher in enumerate(all_data) if name in researcher['advisors']]
    # print(relation)
        
    return result
            
            
relationData = [{'id': i + 1} for i in range(len(all_data))]

for i in range(len(all_data)):
    advisorsId = getAdvisorsId(all_data, i)
    relationData[i]['advisors'] = advisorsId
    adviseesId = getAdviseesId(all_data, i)
    relationData[i]['advisees'] = adviseesId


with open(os.path.join(path, 'relation-data.json'), 'w', encoding='utf-8') as f:
    json.dump(relationData, f, indent="\t", ensure_ascii=False)