#!/usr/bin/env python3
"""Assemble a short, caption-led portrait film from Blender's three review frames."""
from pathlib import Path
import subprocess

HERE = Path(__file__).parent
OUT = HERE / "PALM92_Chief_One_Request.mp4"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
images = [HERE / "set_overview.png", HERE / "approval_gate.png", HERE / "closing_frame.png"]
if not all(p.exists() for p in images):
    raise SystemExit("Render the Blender stills first with blender/create_film.py")

inputs = []
for p in images: inputs += ["-loop", "1", "-t", "5", "-i", str(p)]
chains=[]
for i in range(3):
    chains.append(f"[{i}:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,zoompan=z='min(zoom+0.00015,1.015)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=90:s=720x1280:fps=18,setsar=1[v{i}]")
chains += ["[v0][v1]xfade=transition=fade:duration=0.35:offset=4.65[x01]", "[x01][v2]xfade=transition=fade:duration=0.35:offset=9.30[base]"]
# Clean lower-third field, with three short editorial beats over the 3D scene.
chains.append("[base]drawbox=x=0:y=15:w=720:h=218:color=0x080B15@0.82:t=fill:enable='between(t,0,14.3)'[plate]")
chains.append("[plate]drawtext=fontfile="+FONT+":text='ONE REQUEST.':fontcolor=white:fontsize=49:x=54:y=44:enable='between(t,0.25,4.55)',drawtext=fontfile="+FONT+":text='ONE CHIEF.':fontcolor=0xF0BD67:fontsize=49:x=54:y=105:enable='between(t,0.7,4.55)'[t1]")
chains.append("[t1]drawtext=fontfile="+FONT+":text='RESEARCH  /  DESIGN  /  BUILD  /  REVIEW':fontcolor=white:fontsize=27:x=42:y=52:enable='between(t,4.95,9.25)',drawtext=fontfile="+FONT+":text='One board. Fewer threads.':fontcolor=0x8CCEFF:fontsize=32:x=42:y=109:enable='between(t,4.95,9.25)'[t2]")
chains.append("[t2]drawtext=fontfile="+FONT+":text='AI INVESTIGATES.':fontcolor=white:fontsize=45:x=54:y=38:enable='between(t,9.55,14.3)',drawtext=fontfile="+FONT+":text='HUMANS DECIDE.':fontcolor=0xF0BD67:fontsize=45:x=54:y=96:enable='between(t,9.55,14.3)',drawtext=fontfile="+FONT+":text='PALM92  /  KEEP LEARNING. KEEP BUILDING.':fontcolor=0x8CCEFF:fontsize=20:x=55:y=164:enable='between(t,9.55,14.3)'[vout]")
chains.append("[3:a]lowpass=f=1800,afade=t=in:st=0:d=1.1,afade=t=out:st=12.7:d=1.6[aout]")
audio="aevalsrc=0.025*sin(2*PI*110*t+0.12*sin(2*PI*0.11*t))+0.017*sin(2*PI*164.81*t+0.10*sin(2*PI*0.09*t))+0.012*sin(2*PI*220*t):s=48000:d=14.3"
cmd=["ffmpeg","-y",*inputs,"-f","lavfi","-i",audio,"-filter_complex",";".join(chains),"-map","[vout]","-map","[aout]","-t","14.3","-r","18","-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p","-c:a","aac","-b:a","160k","-movflags","+faststart",str(OUT)]
subprocess.run(cmd,check=True)
print(OUT)
