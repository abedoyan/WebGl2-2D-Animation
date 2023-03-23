#version 300 es

in vec4 position;

uniform mat4 ccwMatrix;
uniform mat4 cwMatrix;
uniform float mouseX;
uniform float mouseY;

out vec4 vColor;


void main() {
    vec4 position2 = vec4(position.xy*(mouseX+mouseY/mouseY), position.zw);

    float dx = mouseX - position2.x;
    float dy = mouseY - position2.y;

    if (mouseX < 0.0){
        gl_Position = cwMatrix*vec4(dx, dy, 0, 1);
    }
    else{
        gl_Position = ccwMatrix*vec4(dx, dy, 0, 1);
    }
    
    vColor = vec4(mouseX, mouseY, sin(mouseX/mouseY),1);

}
