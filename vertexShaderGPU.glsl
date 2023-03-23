#version 300 es

in vec4 position;
in vec4 color;

uniform float seconds;
uniform mat4 scaleMatrix;
uniform mat4 rotMatrix;
vec4 scale;
vec4 newPosition;

out vec4 vColor;

void main() {

    vColor = color;

    // variable to store scaled down vertex positions to prevent clipping at edges
    newPosition = vec4(position.xy*0.75, 0, 1);
    
    // GPU-based vertex movement using gl_VertexID and seconds
    newPosition = vec4(newPosition.x*cos(float(gl_VertexID)*seconds*0.2), 
                       newPosition.y*cos(float(gl_VertexID)*seconds*0.2), 
                       0,
                       1);

    // apply the scaling matrix
    scale = scaleMatrix*newPosition;

    // apply the rotation matrix to the scaled vector
    gl_Position = rotMatrix*scale;

}
