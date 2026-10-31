"""Build short, level-matched SFX from the credited CC0 recordings.
Usage: python scripts/build-sfx.py /absolute/path/to/sfx-sources
Requires numpy, scipy and ffmpeg. Source paths/hashes are emitted in the manifest.
"""
from pathlib import Path
import sys, json, hashlib, subprocess
import numpy as np
from scipy.signal import butter, sosfilt, resample

root=Path(sys.argv[1]); out=Path(__file__).resolve().parents[1]/'server/public'; rate=24000
kenney=root/'kenney-mirror/assets/kenney'
sources={}; decoded={}
def read(name, speed=1, gain=1, delay=0, cut=None, low=None, high=45):
    if name not in decoded:
        p=root/name if name.endswith('.mp3') else kenney/('rpg-audio' if name.startswith('rpg:') else 'impact-sounds')/'Audio'/(name.split(':')[-1]+'.ogg')
        data=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-f','f32le','-ac','1','-ar',str(rate),'-'])
        x=np.frombuffer(data,dtype='<f4').copy()
        # Trim source silence, retaining two milliseconds ahead of the transient.
        active=np.flatnonzero(np.abs(x)>.008)
        if len(active): x=x[max(0,active[0]-48):min(len(x),active[-1]+240)]
        sources[name]={'file':str(p.relative_to(root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
        decoded[name]=x
    x=decoded[name].copy()
    if cut: x=x[:int(cut*rate)]
    if speed!=1: x=resample(x,max(1,int(len(x)/speed)))
    if high: x=sosfilt(butter(2,high,fs=rate,btype='highpass',output='sos'),x)
    if low: x=sosfilt(butter(2,low,fs=rate,output='sos'),x)
    peak=max(.001,np.max(np.abs(x))); x=x/peak*gain
    return np.pad(x,(int(delay*rate),0))

P='impactPunch_medium_000'; H='impactPunch_heavy_000'; S='impactSoft_heavy_000'; W='impactWood_heavy_000'; G='impactGlass_heavy_000'; M='impactMetal_medium_000'; B='impactBell_heavy_000'
# Each layer specifies source, pitch/speed, weight, optional delay and duration.
recipes={
 'punch':[(P,1,.9,0,.25),(S,.85,.28,0,.2)],
 'heavy':[(H,.78,1,0,.3),(W,.7,.4,.008,.28),(S,.65,.3,0,.2)],
 'swipe': [('rpg:knifeSlice',1.18,.8),(P,1.15,.55,.025)],
 'perfume':[('rpg:cloth2',.9,.9),('squishsplat_impact.mp3',1.3,.3)],
 'chop':[('rpg:chop',1,1),(P,.92,.55)],
 'jab':[(P,1.3,1),('rpg:cloth1',1.45,.3)],
 'move':[('rpg:cloth3',1.35,.65),('rpg:knifeSlice2',1.5,.2)],
 'throw':[('rpg:cloth1',.92,.35),('squishsplat_impact.mp3',.85,.8,.025),(H,.88,.65,.025,.27)],
 'splat':[('squishsplat_impact.mp3',.78,1),(H,.83,.8,0,.28),(S,.7,.25,.025,.2)],
 'pot':[(W,.8,.8),(G,.9,1,.022),('impactGlass_medium_001',1.1,.45,.08)],
 'pickup':[(B,1.7,.75,0,.5),('rpg:handleCoins',1.4,.45,.025,.4)],
 'heal':[(B,1.4,.7,0,.55),(B,1.8,.4,.11,.4)],
 'shield':[(M,1.2,1,0,.3),(P,.9,.4)],
 'shield-break':[(G,1.25,.85,0,.5),(M,.75,.65,0,.25)],
 'blast':[(H,.55,.8),(W,.55,.8,.02),(G,.65,.35,.03)],
 'bounce':[('rubber-bounce.mp3',.68,1,0,.24),(S,.65,.2,0,.2)]
}
manifest={'license':'CC0-1.0','authors':['Kenney','EZduzziteh','SomeoneCool15'],'sources':sources,'clips':{}}
for name,layers in recipes.items():
    waves=[read(*layer) for layer in layers];x=np.zeros(max(map(len,waves))+240)
    for wave in waves:x[:len(wave)]+=wave
    if name=='bounce':x=sosfilt(butter(2,2000,fs=rate,output='sos'),x)
    if name=='move':x=sosfilt(butter(2,420,fs=rate,btype='highpass',output='sos'),x)
    # Soft saturation adds body without clipping; movement stays deliberately quiet.
    x=np.tanh(x*1.3);peak=max(.001,np.max(np.abs(x)));target=.65 if name=='move' else .86;x*=target/peak
    n=min(72,len(x)//3);x[:n]*=np.linspace(0,1,n);n=min(960,len(x)//3);x[-n:]*=np.linspace(1,0,n)
    filename='sfx-'+name+'-v1.mp3';p=out/filename
    subprocess.run(['ffmpeg','-y','-v','error','-f','f32le','-ar',str(rate),'-ac','1','-i','-','-codec:a','libmp3lame','-b:a','80k',str(p)],input=x.astype('<f4').tobytes(),check=True)
    manifest['clips'][filename]={'duration':round(len(x)/rate,4),'peak':round(float(np.max(np.abs(x))),4),'layers':layers,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(out/'sfx-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Built',len(recipes),'CC0 clips;',sum((out/p).stat().st_size for p in manifest['clips']),'bytes')
