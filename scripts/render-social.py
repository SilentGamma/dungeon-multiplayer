from PIL import Image,ImageDraw,ImageFont
s=2
im=Image.new('RGB',(1200*s,630*s),'#f5f4eb');d=ImageDraw.Draw(im)
def box(coords,fill,outline=None,width=1,r=0):
 coords=tuple(int(v*s) for v in coords)
 if r:d.rounded_rectangle(coords,radius=r*s,fill=fill,outline=outline,width=width*s)
 else:d.rectangle(coords,fill=fill,outline=outline,width=width*s)
def text(x,y,t,size,fill,bold=False):
 f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans'+('-Bold' if bold else '')+'.ttf',size*s);d.text((x*s,y*s),t,font=f,fill=fill,anchor='ls')
def arch(x,y,w,h,fill):
 d.ellipse((x*s,y*s,(x+w)*s,(y+w)*s),fill=fill);box((x,y+w/2,x+w,y+h),fill)
box((26,26,1174,604),None,'#c1c4b5',2,28)
text(76,120,'FREE CO-OP BROWSER GAME',21,'#647252')
text(70,265,'LARP',124,'#232822',True);text(70,390,'DUNGEON',108,'#232822',True)
box((76,455,426,525),'#d1ef79',r=14);text(100,500,'PLAY TOGETHER →',25,'#232822',True)
arch(830,117,240,349,'#232822');arch(868,160,164,306,'#d1ef79');arch(913,231,74,235,'#232822')
d.polygon([(942*s,203*s),(950*s,189*s),(958*s,203*s),(950*s,217*s)],fill='#232822')
for (x,y),c in zip([(831,522),(865,553),(907,565),(950,568),(993,565),(1035,553),(1069,522),(950,512)],['#ff8c66','#99efb1','#63e6df','#ffd36b','#7aa6ff','#c7a0ff','#ff91bc','#a9e64b']):
 d.ellipse(((x-19)*s,(y-19)*s,(x+19)*s,(y+19)*s),fill=c,outline='#232822',width=4*s)
im.resize((1200,630),Image.Resampling.LANCZOS).save('server/public/larp-dungeon-social-v1.png',optimize=True)
