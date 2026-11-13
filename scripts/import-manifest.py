#!/usr/bin/env python3
"""Read the designer's v56 XLSX with stdlib only; preserve physical rows and provenance."""
import hashlib, json, re, sys, zipfile
from pathlib import Path
import xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
NS = {'x': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
SOURCE = ROOT / 'pnp/Via Nova v56.xlsx'
COLORS = {'yellow':'quarry','orange':'market','blue':'temple','red':'barracks','green':'library','purple':'arch'}

def sheet(z, n):
    strings = [''.join(s.itertext()) for s in ET.fromstring(z.read('xl/sharedStrings.xml'))]
    result = []
    for row in ET.fromstring(z.read(f'xl/worksheets/sheet{n}.xml')).findall('.//x:sheetData/x:row', NS):
        cells = {}
        for c in row:
            v = c.find('x:v', NS)
            if v is not None and v.text is not None:
                cells[re.sub(r'\d','', c.attrib['r'])] = strings[int(v.text)] if c.get('t') == 's' else v.text
        if cells.get('A','').replace('.','',1).isdigit():
            result.append((int(row.attrib['r']), cells))
    return result

def score(asset):
    if not asset: return None
    name = asset.removesuffix('.pdf')
    n = int(name.split('_')[0])
    shape = 'banner' if name.endswith(('cross', 'banner')) else 'scroll'
    if '_vp_' in name: target = 'fixed'
    else:
        key = name.split('_')[2]
        target = COLORS.get(key, {'pair':'pairs'}.get(key,key))
    return dict(shape=shape, multiplier=n, target=target)

def face(asset, id, scoring=None, plus=False, start=None):
    b = COLORS[asset.split('_')[0]]
    tile = dict(id=id, building=b)
    if scoring: tile['score'] = score(scoring)
    if b == 'arch': tile['arch'] = '3' if '_2.' in asset else '222'
    if plus: tile['plus'] = True
    if start: tile['start'] = start
    # Source image rotation is artwork metadata, not placement rotation.
    if '_start_' in asset and b != 'quarry':
        tile['startCorner'] = ('bottom-left' if '_start_2' in asset else 'top-right')
        if b == 'barracks': tile['startCorner'] = 'bottom-left'
        if b == 'library': tile['startCorner'] = 'top-right'
    return tile

out = dict(version='v56', sources=[dict(path=str(p.relative_to(ROOT)), sha256=hashlib.sha256(p.read_bytes()).hexdigest()) for p in sorted([*(ROOT/'pnp').iterdir(), ROOT/'Via Nova Rules - v56.pdf'])], dominos=[], startingDominos=[], singleTiles=[])
with zipfile.ZipFile(SOURCE) as z:
    for row,c in sheet(z,2):
        index=int(float(c['A'])); id=f'domino-{index:02}' if index<=48 else f'start-{index:02}'
        letter=c['G'][-5].upper() if index>48 else None
        d=dict(id=id, tiles=[face(c['B'],id+'-0',c.get('C'),start=letter),face(c['D'],id+'-1',c.get('E'),start=letter)])
        if index<=48: d['double']=c['F']=='double.pdf'
        d['back']=f'start-{letter}' if letter else 'domino'
        d['source']=dict(sheet='dominos',row=row,index=index,assets=c,pdf='Via Nova - domino tiles - A4 - v56.pdf',page=1+2*((index-1)//24),gridRow=(index-1)%24//3+1,gridColumn=(index-1)%3+1)
        out['startingDominos' if letter else 'dominos'].append(d)
    for row,c in sheet(z,3):
        index=int(float(c['A']))
        if 'B' not in c or index>68: continue
        kind='arch' if index<=20 else 'battle' if index<=46 else 'invention'
        n=index if kind=='arch' else index-20 if kind=='battle' else index-46
        id=f'{kind}-{n:02}'
        tile=face(c['C'],id,c.get('E'),bool(c.get('D')))
        out['singleTiles'].append(dict(**tile,back=None if kind=='arch' else kind, source=dict(sheet='single tiles',row=row,index=index,assets=c,pdf='Via Nova - single tiles - A4 - v56.pdf',page=1 if index<=35 else 3,gridRow=(index-1)%35//5+1,gridColumn=(index-1)%5+1)))
# Values read from the printed setup boxes; order is independent of player colour.
out['playerBoards']=[dict(id=f'player-board-{n}',turnOrder=n,soldiers=s,engineers=e,reserve=16-s-e-4,arches=5,startingGroups=['A','B','C'],populationInEachArea=1,source=dict(sheet='player boards',row=n+1,pdf='Via Nova - player boards - A4 - v56.pdf',page=1+(n-1)//2)) for n,(s,e) in enumerate([(2,3),(3,3),(4,3),(4,4)],1)]
out['population']=dict(sets=4,piecesPerSet=16,total=64,faces=[1,2],source='Via Nova Rules - v56.pdf, pages 1 and 3; meeples are not printed in pnp')
out['sharedBoards']=[dict(id=k,areas=2,rewardSlotsPerArea=2,qualifyingPopulation=3,source=dict(pdf='Via Nova - game board - A4 - v56.pdf',page=1)) for k in ['battle','invention']]
out['setup']=dict(draw=5,keepValue=4,handLimit=5,marketSlots=5,removals={'2':dict(dominos=17,battle=11,invention=9),'3':dict(dominos=8,battle=5,invention=4),'4':dict(dominos=0,battle=0,invention=0)},startingLayout=[dict(group='A',copy=1,origin=[0,3],rotation=0),dict(group='B',copy=1,origin=[2,2],rotation=3),dict(group='C',copy=1,origin=[3,0],rotation=0)],source='Via Nova Rules - v56.pdf, pages 2–3; origin uses screen coordinates (y down). A is Quarry/Market, B Barracks/Library, C Market/Quarry.')
out['discrepancies']=[dict(location='single tiles!G47',logical='battle_tile_back.pdf',printed='science_tile_back.pdf',decision='Battle 26 follows tile_type, front banner and logical F back; printing metadata preserved.'),dict(location='single tiles!G51',logical='science_tile_back.pdf',printed='battle_tile_back.pdf',decision='Invention 4 follows tile_type, front scroll and logical F back; printing metadata preserved.'),dict(location='summary!row46',decision='Planning row lists 6 Arches for 2 players; use printed 20 Arches and rules p3 five per player.'),dict(location='summary!dominos in game',decision='26/35/43 exclude five market dominos; retained deck plus market is 31/40/48.')]
path=ROOT/'src/lib/manifest/v56.json'
content=json.dumps(out,indent=2,ensure_ascii=False)+'\n'
if '--check' in sys.argv:
    if path.read_text()!=content: sys.exit('Manifest drift: run python3 scripts/import-manifest.py')
    print('v56 manifest matches source files')
else:
    path.write_text(content)
    print('Wrote',path)
