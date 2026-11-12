import bpy, math, os
from mathutils import Vector

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts"))
os.makedirs(OUT, exist_ok=True)

bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for block in bpy.data.materials: bpy.data.materials.remove(block)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
scene.display.shading.studio_light = 'paint.sl'
scene.display.shading.color_type = 'MATERIAL'
scene.display.shading.show_shadows = True
scene.display.shading.show_cavity = True
scene.display.shading.cavity_type = 'BOTH'
scene.display.shading.curvature_ridge_factor = 1.3
scene.display.shading.curvature_valley_factor = 1.0
scene.render.resolution_x, scene.render.resolution_y = 480, 854
scene.render.resolution_percentage = 100
scene.render.fps = 18
scene.frame_start, scene.frame_end = 1, 180
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.constant_rate_factor = 'MEDIUM'
scene.render.ffmpeg.ffmpeg_preset = 'GOOD'
scene.world.color = (0.006,0.008,0.02)
scene.view_settings.view_transform = 'AgX'

def mat(name, color, emission=0.0, metallic=0.0, rough=.55):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metallic; p.inputs['Roughness'].default_value=rough
    if emission:
        p.inputs['Emission Color'].default_value=(*color,1); p.inputs['Emission Strength'].default_value=emission
    return m
navy=mat('Midnight enamel',(0.018,.027,.07),.04,.55,.3)
panel=mat('Card glass',(.045,.063,.12),.03,.2,.35)
gold=mat('PALM92 amber',(1.0,.57,.20),1.4,.1,.3)
blue=mat('Electric blue',(.17,.63,1),1.3,.1,.3)
purple=mat('Violet',(.49,.30,1),1.2,.1,.3)
mint=mat('Decision green',(.30,.95,.68),1.2,.1,.3)
white=mat('Warm white',(.91,.94,1),.65,.05,.4)
muted=mat('Quiet labels',(.43,.50,.67),.2,.05,.5)

def cube(name, loc, scale, material, bevel=.12):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o=bpy.context.object; o.name=name; o.dimensions=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod=o.modifiers.new('Soft machined edges','BEVEL'); mod.width=bevel; mod.segments=4
        o.modifiers.new('Corner normals','WEIGHTED_NORMAL')
    o.data.materials.append(material); return o

def text(body, loc, size, material, name=None, align='LEFT'):
    cu=bpy.data.curves.new(name or body,'FONT'); cu.body=body; cu.size=size; cu.align_x=align; cu.extrude=.002; cu.bevel_depth=.001
    ob=bpy.data.objects.new(name or body,cu); scene.collection.objects.link(ob); ob.location=loc; ob.rotation_euler[0]=math.radians(90); ob.data.materials.append(material); return ob

def key_scale(obj, start_scale, end_scale, start, end):
    obj.scale=(start_scale,)*3; obj.keyframe_insert(data_path='scale',frame=start)
    obj.scale=(end_scale,)*3; obj.keyframe_insert(data_path='scale',frame=end)

# A floating, beveled control board. Text and cards are original graphic elements.
cube('Control board',(0,0,5.4),(8.2,.32,10.8),navy,.28)
cube('Board top edge',(0,-.20,10.65),(7.55,.05,.025),gold,.015)
text('PALM92  /  CHIEF OF STAFF',(-3.55,-.23,10.10),.32,white)
text('ONE CONVERSATION. ONE CLEAR BOARD.',(-3.55,-.23,9.68),.135,muted)

# Single Chief node, with four role lanes below it.
cube('Chief hub',(0,-.28,8.78),(6.9,.19,.64),panel,.16)
cube('Chief signal',(-3.14,-.41,8.78),(.12,.05,.35),gold,.05)
text('CHIEF',(-2.83,-.425,8.73),.30,gold)
text('PLANS  /  PRIORITISES  /  REPORTS',(-.98,-.426,8.73),.16,white)

lanes=[('01  RESEARCH','Check facts and sources',blue),('02  DESIGN','Shape the story and assets',purple),('03  BUILD','Make the app or video',gold),('04  REVIEW','Check quality and evidence',mint)]
for i,(title,sub,color) in enumerate(lanes):
    z=7.55-i*1.15
    cube('Work lane '+str(i),(0,-.27,z),(6.9,.16,.86),panel,.13)
    cube('Lane index '+str(i),(-3.20,-.38,z),(.15,.04,.46),color,.05)
    text(title,(-2.88,-.405,z+.08),.22,color)
    text(sub,(-2.88,-.405,z-.21),.15,white)
    cube('Task marker '+str(i),(2.95,-.39,z),(.26,.06,.26),color,.07)

# The approval gate is the brightest object in the composition.
cube('Human gate',(0,-.28,2.75),(6.9,.22,.83),gold,.18)
text('HUMAN APPROVAL',(-2.85,-.43,2.83),.30,navy)
text('REVIEW BEFORE ANY CONSEQUENCE',(-2.85,-.43,2.52),.16,navy)
text('NO AUTOMATIC SEND  /  NO AUTOMATIC PUBLISH',(-2.40,-.24,1.66),.135,muted)

# Decorative connection spine and orbiting status lights.
cube('Spine',(0,-.24,5.25),(.035,.05,5.0),blue,.015)
for fr,z,color in [(1,7.52,blue),(40,6.38,purple),(78,5.24,gold),(116,4.10,mint),(154,2.95,gold)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=.095, location=(0,-.43,z)); o=bpy.context.object; o.name='Flow signal'; o.data.materials.append(color)
    o.scale=(.55,.55,.55); o.keyframe_insert(data_path='scale',frame=fr); o.scale=(1.25,1.25,1.25); o.keyframe_insert(data_path='scale',frame=fr+8)
    o.scale=(.55,.55,.55); o.keyframe_insert(data_path='scale',frame=fr+18)

# Camera: a gentle move from board overview to the approval gate.
bpy.ops.object.camera_add(location=(0,-18,5.9)); cam=bpy.context.object; scene.camera=cam
cam.data.type='ORTHO'; cam.data.ortho_scale=14.2
def aim(o, point): o.rotation_euler=(Vector(point)-o.location).to_track_quat('-Z','Y').to_euler()
aim(cam,(0,0,5.4)); cam.keyframe_insert(data_path='rotation_euler',frame=1)
cam.location=(0,-18,5.9); cam.keyframe_insert(data_path='location',frame=1)
cam.location=(0,-15.5,5.2); aim(cam,(0,0,5.5)); cam.keyframe_insert(data_path='location',frame=90); cam.keyframe_insert(data_path='rotation_euler',frame=90)
cam.location=(0,-14.1,4.4); aim(cam,(0,0,4.2)); cam.keyframe_insert(data_path='location',frame=180); cam.keyframe_insert(data_path='rotation_euler',frame=180)
cam.data.lens=48

def area(name, loc, energy, color, size, target=(0,0,5)):
    bpy.ops.object.light_add(type='AREA',location=loc); l=bpy.context.object; l.name=name; l.data.energy=energy; l.data.color=color; l.data.shape='DISK'; l.data.size=size; aim(l,target); return l
area('Warm key',(-5,-7,10),900,(1,.56,.28),8)
area('Blue rim',(5,1,8),1100,(.16,.42,1),7)
area('Soft fill',(0,-5,3),250,(.52,.35,1),6)

# Workbench render keeps this local preview fast and reproducible without a GPU.
scene.use_nodes=False

for obj in scene.objects:
    if obj.animation_data and obj.animation_data.action:
        for fc in obj.animation_data.action.fcurves:
            for kp in fc.keyframe_points: kp.interpolation='BEZIER'

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'PALM92_Chief_Of_Staff.blend'))
for frame, name in [(1,'set_overview.png'),(76,'approval_gate.png'),(150,'closing_frame.png')]:
    scene.frame_set(frame)
    scene.render.image_settings.file_format='PNG'
    scene.render.filepath=os.path.join(OUT,name)
    bpy.ops.render.render(write_still=True)
