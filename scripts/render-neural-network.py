"""MERO original ManimML scene. Geometry/activation are schematic, not recorded model values."""
from pathlib import Path
import manimpango
from manim import Scene, Text, VGroup, UP, DOWN, WHITE, AnimationGroup, ShowPassingFlash
from manim_ml.neural_network import NeuralNetwork, FeedForwardLayer

FONT = 'Lato'
FONT_FILE = Path(__file__).resolve().parents[1] / 'private/education-assets/deepml/fonts/Lato-Regular.ttf'
assert manimpango.register_font(str(FONT_FILE)), 'Could not register Lato'
assert FONT in manimpango.list_fonts(), 'Lato font is unavailable'

class LearningNetwork(Scene):
    def construct(self):
        self.camera.background_color = '#101827'
        title = Text('How a neural network learns', font=FONT, font_size=29, color=WHITE).to_edge(UP, buff=.45)
        layers = [FeedForwardLayer(n, node_radius=.085, node_spacing=.29, node_color='#69b9d1', node_outline_color='#69b9d1', rectangle_color='#101827', rectangle_fill_color='#101827') for n in [1,8,8,1]]
        nn = NeuralNetwork(layers, layer_spacing=1.1, animation_dot_color='#f2ac64')
        nn.scale(2.0)
        nn.move_to([0,.05,0])
        for layer in layers: layer.surrounding_rectangle.set_opacity(0)
        for edge_group in nn.connective_layers:
            if hasattr(edge_group,'edges'): edge_group.edges.set_color('#4d7287').set_stroke(width=1.1)
        labels = VGroup(*[Text(label,font=FONT,font_size=22,color=WHITE).next_to(layer,UP,buff=.3) for layer,label in zip(layers,['Input · 1','Hidden · 8','Hidden · 8','Output · 1'])])
        status = Text('Forward pass · predict with current weights',font=FONT,font_size=25,color='#69b9d1').to_edge(DOWN,buff=.65)
        note = Text('Distance model: 1–8–8–1 · schematic activations and gradients',font=FONT,font_size=15,color='#a4b5c5').to_edge(DOWN,buff=.25)
        self.add(title,nn,labels,status,note)
        self.wait(1)
        # ManimML's network-level helper contains empty groups unsupported by Manim 0.22.
        # Animate its actual connective-layer objects directly; no package patch needed.
        for connection in nn.connective_layers:
            if hasattr(connection, 'edges'):
                self.play(connection.make_forward_pass_animation(layer_args={}), run_time=1.2)
        self.wait(.8)
        self.remove(status)
        status = Text('Backpropagation · compute gradients from the output',font=FONT,font_size=25,color='#f2ac64').to_edge(DOWN,buff=.65)
        self.add(status)
        for connection in reversed(list(nn.connective_layers)):
            if hasattr(connection,'edges'):
                self.play(AnimationGroup(*[ShowPassingFlash(edge.copy().reverse_points().set_color('#f2ac64').set_stroke(width=3),time_width=.4) for edge in connection.edges]),run_time=.8)
        self.wait(.8)
        self.remove(status)
        status = Text('Optimizer step · update weights using gradients',font=FONT,font_size=25,color='#93c99b').to_edge(DOWN,buff=.65)
        self.add(status)
        for connection in nn.connective_layers:
            if hasattr(connection,'edges'):
                self.play(connection.edges.animate.set_color('#719b93'),run_time=.4)
        self.wait(1.5)
