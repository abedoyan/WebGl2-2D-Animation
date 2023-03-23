#version 300 es

in vec4 position;

uniform mat4 leftRotMatrix;
uniform mat4 rightRotMatrix;
uniform mat4 transMatrix;
uniform float seconds;

out float vSeconds;

void main() {
    
    if (position.x == -0.2 || (position.x == -0.01 && position.y == -0.5)){
        gl_Position = transMatrix*leftRotMatrix*position;
    }
    else if (position.x == 0.2 || (position.x == 0.01 && position.y == -0.5)){
        gl_Position = transMatrix*rightRotMatrix*position;
    }
    else {
        gl_Position = transMatrix*position;
    }

    vSeconds = seconds;
}
