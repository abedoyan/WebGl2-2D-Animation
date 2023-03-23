#version 300 es

in vec4 position;
in vec4 color;
in float location;

uniform mat4 transLeftMatrix;
uniform mat4 transRightMatrix;

out vec4 vColor;

void main() {

    vColor = color;

    if (location == -1.0){
        gl_Position = transLeftMatrix*vec4(position.xy*0.5, 0,1);
    }
    else {
        gl_Position = transRightMatrix*vec4(position.xy*0.5, 0,1);
    }

}
