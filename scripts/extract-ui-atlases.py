"""Deterministic authorized atlas extraction. Requires Pillow, numpy, scipy.
Run with the nine original uploads in .vibaocode-references. Existing verified exports
are reused. Runtime never loads source sheets. Crops preserve source alpha.
"""
from pathlib import Path
from PIL import Image
from scipy import ndimage
import numpy as np
import hashlib, json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/assets/block-city-v2'
NAMES=['6e844582-0e01-4042-9c8a-fddfd045b8b4','fbf5d52a-f49f-40c2-9281-5eed44f7214d','d82182dc-c04c-474b-847e-f18ae15fe600','bd42fb31-7d6e-45be-90d3-ce280143361c','4c3d77ec-8072-48fb-9aff-82daed167255','353e6d1b-66e4-4385-b961-9348093f9448','f5c246df-132c-4835-8f14-6d40b31d79dc','075921ae-0351-462c-b69e-8c7dc74e65e9','ccfe08c4-f79d-4b73-b27b-89973aced50d']
images={};boxes={};registry={};sources={}
# A resumed invocation validates and reuses completed output. --force is reserved
# for an intentional extraction recipe change after visual inspection.
import sys
if (OUT/'asset-registry.json').exists() and '--force' not in sys.argv:
 previous=json.loads((OUT/'asset-registry.json').read_text())
 if len(previous)>=131 and all((OUT/a['path']).exists() and hashlib.sha256((OUT/a['path']).read_bytes()).hexdigest()==a['sha256'] for a in previous.values()):
  print(f'Reused {len(previous)} verified exports; pass --force only to change the extraction recipe.');sys.exit(0)
for n,name in enumerate(NAMES,1):
 p=ROOT/'.vibaocode-references'/(name+'.png');images[n]=Image.open(p).convert('RGBA');sources[n]=hashlib.sha256(p.read_bytes()).hexdigest()
 labels,_=ndimage.label(np.array(images[n])[:,:,3]>15)
 b=[]
 for y,x in ndimage.find_objects(labels):
  if x.stop-x.start>=20 and y.stop-y.start>=20:b.append([x.start,y.start,x.stop,y.stop])
 boxes[n]=sorted(b,key=lambda b:(b[1]//60,b[0]))
def export(key,n,i=None,box=None,clean=False,pivot=None):
 b=box or boxes[n][i];im=images[n].crop(b)
 transform='alpha-bounds crop'
 if clean:
  # Keep original glossy border/corners; replace baked labels with an unlettered
  # interior column. This is sprite slicing, not procedural approximation.
  w,h=im.size; cap=clean if isinstance(clean,int) else 12
  left=im.crop((0,0,cap,h));right=im.crop((w-cap,0,w,h)) if n==2 else left.transpose(Image.Transpose.FLIP_LEFT_RIGHT);middle=im.crop((cap-1,0,cap,h)).resize((w-2*cap,h))
  result=Image.new('RGBA',im.size);result.paste(left,(0,0));result.paste(middle,(cap,0));result.paste(right,(w-cap,0));im=result
  transform=f'border slicing; {cap}px caps; unlettered interior strip'
 domain=key.split('.')[0]; folder={'nav':'navigation','character':'characters'}.get(domain,domain)
 if domain=='puzzle':folder='puzzle/ui' if key.startswith('puzzle.ui.') else 'puzzle/art'
 name=key.split('.',1)[1].replace('.','-')+'.png';rel=f'{folder}/{name}';p=OUT/rel;p.parent.mkdir(parents=True,exist_ok=True)
 im.save(p,optimize=True)
 registry[key]={'path':rel,'atlas':n,'sourceSha256':sources[n],'bounds':b,'width':im.width,'height':im.height,'pivot':pivot or ([.5,1] if domain in ['city','character'] and '.portrait.' not in key else [.5,.5]),'transform':transform,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
# Branding authority 01; use full uncut high-resolution logo.
export('brand.logo',1,box=[44,32,968,665]);export('brand.wordmark',1,8);export('brand.tagline',1,6);export('brand.icon',1,2)
for key,i in {'settings':6,'coin':18,'gem':19,'heart':20,'star':21,'plus':22,'chevron':9,'edit':12}.items():export('core.'+key,2,i)
for key,i,cap in [('buttonGold',2,14),('buttonGoldPressed',3,14),('buttonMuted',4,14),('buttonBlue',5,14),('panelWhite',7,12)]:export('core.'+key,2,i,clean=cap)
export('core.progressTrack',2,box=[1208,1020,1325,1051],clean=8)
# Atlas 03 nav icons and empty normal/selected plates, labels stay runtime text.
for key,i in {'map':19,'puzzle':20,'hat':21,'friends':22,'shop':23,'notification':24,'plate':11,'plateSelected':7}.items():export('nav.'+key,3,i)
for key,i in {'map':15,'hat':16,'shop':17,'friends':13,'puzzle':14}.items():export(f'nav.{key}.normal',3,i)
for key,i in {'map':2,'hat':5,'shop':6,'friends':3,'puzzle':4}.items():export(f'nav.{key}.selected',3,i)
# Puzzle material and effect authority 04.
for key,i in {'ice':2,'rainbow':3,'grass':5,'sand':7,'wood':8,'stone':9,'metal':12,'red':13,'blue':15,'purple':32,'yellow':34,'green':36}.items():export('puzzle.block.'+key,4,i)
for key,i in {'shuffle':17,'line':18,'hammer':19}.items():export('puzzle.booster.'+key,4,i)
for key,i in {'rainbow':37,'red':38,'burst':39,'column':40,'row':41}.items():export('puzzle.vfx.'+key,4,i)
export('puzzle.ui.empty',5,40);export('puzzle.ui.well',5,39)
export('puzzle.ui.backdrop',5,1)
export('puzzle.ui.goals',5,17,clean=36);export('puzzle.ui.moves',5,10,clean=36)
# Preserve the board's supplied border without its baked five-column geometry.
export('puzzle.ui.board',5,39)
# Cast authority 06.
for key,i in {'builder':1,'planner':22,'mechanic':2,'chef':3,'worker':4,'sailor':6,'tourist':7,'corgi':8}.items():export(f'character.full.{key}',6,i)
for key,i in {'builder':1,'planner':22,'mechanic':2,'chef':3,'worker':4,'sailor':6,'tourist':7,'corgi':8}.items():
 b=boxes[6][i].copy();b[3]=b[1]+int((b[3]-b[1])*(.54 if key!='corgi' else .65));export(f'character.portrait.{key}',6,box=b,pivot=[.5,.5])
for key,i in {'blueprint':21,'chef-hat':27,'ship-wheel':19,'wrench':20,'cake':41,'shop-sign':47,'worker-toolbox':49,'binoculars':52,'camera':53,'sailor-hat':54,'hat':57,'tourist-hat':62,'backpack':63,'bone':66,'collar':73}.items():export('character.accessory.'+key,6,i,pivot=[.5,.5])
for key,i in {'tower':1,'market':2,'apartment':3,'coffee':4,'shopfront':5,'wheel':7,'lighthouse':8,'sailboat':9,'bridge':10,'house':11,'palm':12,'lamp':13,'boardwalk':14,'tree':16,'bench':18,'garden':20,'fence':21,'road':22,'houseBlue':23,'houseGold':24,'houseRed':25,'sign':26,'grass':27,'treeGold':28,'treePink':29,'park':30}.items():export('city.'+key,7,i)
export('home.harborScene',8,box=[32,32,1144,550]);export('home.play',8,8)
# District surfaces omit all example values and are reused by runtime components.
export('district.header',9,10,clean=14)
export('district.stat',9,17,clean=10)
export('district.card',9,12,clean=10)
export('district.queue',9,13,clean=8)
export('district.tasks',9,14,clean=8)
export('district.tab',9,3,clean=12)
export('district.tabSelected',9,5,clean=12)
export('district.build',9,6,clean=20)
export('district.happiness',9,box=[575,384,646,459])
export('district.appeal',9,box=[834,384,900,461])
OUT.mkdir(parents=True,exist_ok=True)
(OUT/'asset-registry.json').write_text(json.dumps(registry,indent=2)+'\n')
print(f'Exported {len(registry)} canonical RGBA sprites')
# Review contact sheet is temporary, never shipped.
contact=Image.new('RGB',(1000,((len(registry)+7)//8)*115),'#455469')
from PIL import ImageDraw
d=ImageDraw.Draw(contact)
for i,(key,meta) in enumerate(registry.items()):
 im=Image.open(OUT/meta['path']);im.thumbnail((118,85));x=(i%8)*125;y=(i//8)*115;contact.paste(im,(x+(125-im.width)//2,y),im);d.text((x+2,y+87),key[:23],fill='white',font_size=9)
contact.save(ROOT/'.ui-overhaul-source/contact.jpg')
