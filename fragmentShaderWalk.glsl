#version 300 es
precision highp float;

in float vSeconds;
out vec4 fragColor;

void main() {
    fragColor = vec4(cos(vSeconds), sin(vSeconds), tan(vSeconds), 1.0);
}
