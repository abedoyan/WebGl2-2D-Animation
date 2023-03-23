#version 300 es

in vec4 position;
uniform float seconds;
out float vColor;

void main() {
    gl_Position = position;
    vColor = cos(position.x*seconds) + sin(-position.y/seconds) + seconds;
}
