#version 300 es
precision highp float;

in float vColor;
out vec4 fragColor;

void main() {
    
    float r = sin(vColor) * 0.5 + 0.5;
    float g = cos(vColor * 2.0) * 0.4 + 0.5;
    float b = sin(vColor * 3.0) * cos(vColor * 2.0) * 0.2 + 0.5;
        
    fragColor = vec4(cos(r/b), cos(g/r), cos(b/g), 1.0);
    
}
